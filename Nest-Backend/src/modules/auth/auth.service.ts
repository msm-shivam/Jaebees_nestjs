import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { UserSession } from '../users/entities/user-session.entity';
import { AccountStatus } from '../users/enums/account-status.enum';
import {
  OtpVerification,
  OtpChannel,
  OtpPurpose,
} from './entities/otp-verification.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyMobileDto } from './dto/verify-mobile.dto';
import { ResendMobileOtpDto } from './dto/resend-mobile-otp.dto';
import {
  hashPassword,
  comparePassword,
} from '../../common/utils/password.util';
import { maskMobile } from '../../common/utils/phone.util';
import {
  AuthMessages,
  UserMessages,
} from '../../common/constants/messages.constants';
import { FcmTokenService } from '../firebase/fcm-token.service';
import { FcmUserType } from '../firebase/entities/fcm-token.entity';
import { AuditLogService } from '../security-compliance/services/audit-log.service';
import { OTP_EXPIRY_MINUTES } from '../../common/constants/app.constants';
import {
  JwtPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface';
import { NotificationsService } from '../notifications/notifications.service';
import { SmsService } from '../sms/sms.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dayjs = require('dayjs');

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserSession)
    private readonly userSessionRepo: Repository<UserSession>,
    @InjectRepository(OtpVerification)
    private readonly otpRepo: Repository<OtpVerification>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly smsService: SmsService,
    private readonly auditLogService: AuditLogService,
    private readonly fcmTokenService: FcmTokenService,
  ) {}

  // ─── 1. Register ─────────────────────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<{ message: string; maskedMobile: string }> {
    const email = dto.email.toLowerCase();
    const mobile = this.formatPhone(dto.mobile);

    const existingEmail = await this.userRepo.findOne({ where: { email } });
    if (existingEmail) {
      if (existingEmail.isMobileVerified && existingEmail.accountStatus === AccountStatus.ACTIVE) {
        throw new BadRequestException(UserMessages.EMAIL_TAKEN);
      }
      // Unverified user trying again -> resend SMS OTP
      const otp = await this.createAndSaveSmsOtp(mobile, OtpPurpose.MOBILE_VERIFICATION);
      this.smsService.sendOtp(mobile, otp).catch(() => {});
      return {
        message: AuthMessages.REGISTER_SUCCESS,
        maskedMobile: maskMobile(mobile),
      };
    }

    const existingMobile = await this.userRepo.findOne({ where: { mobile } });
    if (existingMobile) {
      throw new BadRequestException(UserMessages.MOBILE_TAKEN);
    }

    const passwordHash = await hashPassword(dto.password);
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email,
      mobile,
      passwordHash,
      accountStatus: AccountStatus.PENDING_VERIFICATION,
      isMobileVerified: false,
      isEmailVerified: false,
      isActive: true,
    });
    await this.userRepo.save(user);

    if (dto.fcmToken) {
      this.fcmTokenService.register(user.id, FcmUserType.CUSTOMER, dto.fcmToken, dto.deviceInfo).catch(() => {});
    }

    const otp = await this.createAndSaveSmsOtp(user.mobile, OtpPurpose.MOBILE_VERIFICATION);
    this.smsService.sendOtp(user.mobile, otp).catch(() => {});

    return {
      message: AuthMessages.REGISTER_SUCCESS,
      maskedMobile: maskMobile(user.mobile),
    };
  }

  // ─── 2. Verify Mobile (Auto-Login & Clean Session Creation) ──────────────────
  async verifyMobile(
    dto: VerifyMobileDto,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<{ message: string; data: TokenPair }> {
    let user: User | null = null;

    if (dto.mobile && !dto.mobile.includes('*')) {
      const formatted = this.formatPhone(dto.mobile);
      user = await this.userRepo.findOne({ where: { mobile: formatted } });
    }

    if (!user && dto.email) {
      user = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    }

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    // Consume SMS OTP for the user's registered mobile number
    await this.consumeSmsOtp(user.mobile, dto.otp, OtpPurpose.MOBILE_VERIFICATION);

    // Activate User Account
    await this.userRepo.update(user.id, {
      accountStatus: AccountStatus.ACTIVE,
      isMobileVerified: true,
      mobileVerifiedAt: new Date(),
    });

    const activeUser = await this.userRepo.findOneOrFail({ where: { id: user.id } });

    // Generate Fresh Access & Refresh Tokens, creating a new session in user_sessions
    const tokens = await this.generateCustomerTokens(activeUser, ipAddress, userAgent);

    // Send Welcome Email asynchronously
    this.notificationsService.sendWelcomeEmail(activeUser.email, activeUser.firstName).catch(() => {});

    if (dto.fcmToken) {
      this.fcmTokenService.register(activeUser.id, FcmUserType.CUSTOMER, dto.fcmToken, dto.deviceInfo).catch(() => {});
    }

    return { message: AuthMessages.OTP_VERIFIED, data: tokens };
  }

  // ─── 3. Resend Mobile OTP ────────────────────────────────────────────────────
  async resendMobileOtp(dto: ResendMobileOtpDto): Promise<{ message: string }> {
    let user: User | null = null;

    if (dto.mobile && !dto.mobile.includes('*')) {
      const formatted = this.formatPhone(dto.mobile);
      user = await this.userRepo.findOne({ where: { mobile: formatted } });
    }

    if (!user && dto.email) {
      user = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    }

    if (!user) {
      throw new NotFoundException('User account not found.');
    }

    if (user.isMobileVerified && user.accountStatus === AccountStatus.ACTIVE) {
      throw new BadRequestException('Mobile number is already verified.');
    }

    const otp = await this.createAndSaveSmsOtp(user.mobile, OtpPurpose.MOBILE_VERIFICATION);
    this.smsService.sendOtp(user.mobile, otp).catch(() => {});

    return { message: AuthMessages.OTP_SENT };
  }

  // ─── 4. Login ────────────────────────────────────────────────────────────────
  async login(
    dto: LoginDto,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<{ message: string; data: TokenPair }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      await this.auditLogService.log({
        userId: null,
        action: 'LOGIN_FAILED',
        entityType: 'auth',
        entityId: null,
        ipAddress,
        userAgent,
        newValues: { email: dto.email, reason: 'User not found' },
      }).catch(() => {});
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
    }

    if (!user.isActive || user.accountStatus === AccountStatus.SUSPENDED || user.accountStatus === AccountStatus.DEACTIVATED) {
      await this.auditLogService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'auth',
        entityId: user.id,
        ipAddress,
        userAgent,
        newValues: { email: dto.email, reason: 'Account disabled' },
      }).catch(() => {});
      throw new ForbiddenException(AuthMessages.ACCOUNT_DISABLED);
    }

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      await this.auditLogService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'auth',
        entityId: user.id,
        ipAddress,
        userAgent,
        newValues: { email: dto.email, reason: 'Invalid password' },
      }).catch(() => {});
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
    }

    // Check Mobile Verification Status
    if (user.accountStatus === AccountStatus.PENDING_VERIFICATION || !user.isMobileVerified) {
      const latest = await this.otpRepo.findOne({
        where: { mobile: user.mobile, purpose: OtpPurpose.MOBILE_VERIFICATION },
        order: { createdAt: 'DESC' },
      });

      let resendAfter = 0;
      if (latest) {
        const elapsedSeconds = dayjs().diff(dayjs(latest.createdAt), 'second');
        if (elapsedSeconds < 60) {
          resendAfter = 60 - elapsedSeconds;
        }
      }

      if (resendAfter === 0) {
        const otp = await this.createAndSaveSmsOtp(user.mobile, OtpPurpose.MOBILE_VERIFICATION);
        this.smsService.sendOtp(user.mobile, otp).catch(() => {});
        resendAfter = 60;
      }

      await this.auditLogService.log({
        userId: user.id,
        action: 'LOGIN_BLOCKED_UNVERIFIED',
        entityType: 'auth',
        entityId: user.id,
        ipAddress,
        userAgent,
        newValues: { email: dto.email, mobile: maskMobile(user.mobile) },
      }).catch(() => {});

      throw new ForbiddenException({
        statusCode: 403,
        message: 'Mobile verification required.',
        data: {
          requiresVerification: true,
          maskedMobile: maskMobile(user.mobile),
          resendAfter,
          expiresIn: OTP_EXPIRY_MINUTES * 60,
        },
      });
    }

    const tokens = await this.generateCustomerTokens(user, ipAddress, userAgent);

    await this.auditLogService.log({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'auth',
      entityId: user.id,
      ipAddress,
      userAgent,
      newValues: { email: dto.email },
    }).catch(() => {});

    if (dto.fcmToken) {
      this.fcmTokenService.register(user.id, FcmUserType.CUSTOMER, dto.fcmToken, dto.deviceInfo).catch(() => {});
    }

    return { message: AuthMessages.LOGIN_SUCCESS, data: tokens };
  }

  // ─── 5. Refresh Token ────────────────────────────────────────────────────────
  async refreshToken(
    dto: RefreshTokenDto,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<{ message: string; data: TokenPair }> {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(dto.refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException(AuthMessages.TOKEN_INVALID);
    }

    const session = await this.userSessionRepo.findOne({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        refreshToken: dto.refreshToken,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!session) throw new UnauthorizedException(AuthMessages.SESSION_EXPIRED);

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.isActive || user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException(AuthMessages.ACCOUNT_DISABLED);
    }

    await this.userSessionRepo.remove(session);
    const tokens = await this.generateCustomerTokens(user, ipAddress, userAgent);
    return { message: AuthMessages.TOKEN_REFRESHED, data: tokens };
  }

  // ─── 6. Logout ───────────────────────────────────────────────────────────────
  async logout(userId: string, refreshToken: string): Promise<{ message: string }> {
    await this.userSessionRepo.delete({ userId, refreshToken });
    return { message: AuthMessages.LOGOUT_SUCCESS };
  }

  // ─── 7. Forgot Password (via SMS OTP to Registered Mobile) ────────────────────
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; maskedMobile?: string }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) return { message: AuthMessages.OTP_SENT };

    const otp = await this.createAndSaveSmsOtp(user.mobile, OtpPurpose.PASSWORD_RESET);
    this.smsService.sendOtp(user.mobile, otp).catch(() => {});

    return {
      message: AuthMessages.OTP_SENT,
      maskedMobile: maskMobile(user.mobile),
    };
  }

  // ─── 8. Reset Password ───────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new NotFoundException(UserMessages.USER_NOT_FOUND);

    await this.consumeSmsOtp(user.mobile, dto.otp, OtpPurpose.PASSWORD_RESET);

    const passwordHash = await hashPassword(dto.newPassword);
    await this.userRepo.update(user.id, { passwordHash });

    // Revoke all active sessions
    await this.userSessionRepo.delete({ userId: user.id });

    this.notificationsService.sendPasswordResetConfirmation(
      user.email,
      user.firstName,
    ).catch(() => {});

    return { message: AuthMessages.PASSWORD_RESET_SUCCESS };
  }

  // ─── 9. Profile Email Verification ───────────────────────────────────────────
  async sendEmailVerification(userId: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(UserMessages.USER_NOT_FOUND);
    if (user.isEmailVerified) {
      throw new BadRequestException(AuthMessages.EMAIL_ALREADY_VERIFIED);
    }

    const otp = await this.createAndSaveEmailOtp(user.email, OtpPurpose.EMAIL_VERIFICATION);
    this.notificationsService.sendVerifyEmail(user.email, otp).catch(() => {});
    return { message: AuthMessages.OTP_SENT };
  }

  async verifyEmailProfile(userId: string, otp: string): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(UserMessages.USER_NOT_FOUND);

    await this.consumeEmailOtp(user.email, otp, OtpPurpose.EMAIL_VERIFICATION);

    await this.userRepo.update(user.id, { isEmailVerified: true });
    this.notificationsService.sendEmailVerified(user.email, user.firstName).catch(() => {});

    return { message: AuthMessages.OTP_VERIFIED };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────────

  private async createAndSaveSmsOtp(mobile: string, purpose: OtpPurpose): Promise<string> {
    // Check 60-second cooldown
    const latest = await this.otpRepo.findOne({
      where: { mobile, purpose },
      order: { createdAt: 'DESC' },
    });
    if (latest && dayjs().diff(dayjs(latest.createdAt), 'second') < 60) {
      throw new BadRequestException('Please wait 60 seconds before requesting another SMS OTP.');
    }

    // Invalidate prior pending OTPs for this mobile & purpose
    await this.otpRepo
      .createQueryBuilder()
      .update()
      .set({ verifiedAt: new Date() })
      .where('mobile = :mobile AND purpose = :purpose AND verified_at IS NULL', { mobile, purpose })
      .execute();

    // Cryptographically secure 6-digit PIN
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await hashPassword(otp);

    const expiresAt: Date = dayjs().add(OTP_EXPIRY_MINUTES, 'minute').toDate();
    const otpRecord = this.otpRepo.create({
      mobile,
      channel: OtpChannel.SMS,
      purpose,
      type: null,
      otpHash,
      otp: null, // Deprecated column
      attempts: 0,
      expiresAt,
    });
    await this.otpRepo.save(otpRecord);
    return otp;
  }

  private async consumeSmsOtp(mobile: string, otp: string, purpose: OtpPurpose): Promise<OtpVerification> {
    const record = await this.otpRepo.findOne({
      where: { mobile, purpose },
      order: { createdAt: 'DESC' },
    });

    if (!record || record.verifiedAt) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    if (record.attempts >= 5) {
      record.expiresAt = new Date();
      await this.otpRepo.save(record);
      throw new BadRequestException('Too many invalid verification attempts. Please request a new OTP.');
    }

    const now = new Date();
    if (now > record.expiresAt) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    if (!record.otpHash) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    const valid = await comparePassword(otp, record.otpHash);
    if (!valid) {
      record.attempts += 1;
      await this.otpRepo.save(record);
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    record.verifiedAt = now;
    await this.otpRepo.save(record);
    return record;
  }

  private async createAndSaveEmailOtp(email: string, purpose: OtpPurpose): Promise<string> {
    await this.otpRepo
      .createQueryBuilder()
      .update()
      .set({ verifiedAt: new Date() })
      .where('email = :email AND purpose = :purpose AND verified_at IS NULL', { email, purpose })
      .execute();

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await hashPassword(otp);

    const expiresAt: Date = dayjs().add(OTP_EXPIRY_MINUTES, 'minute').toDate();
    const otpRecord = this.otpRepo.create({
      email,
      channel: OtpChannel.EMAIL,
      purpose,
      type: null,
      otpHash,
      otp: null,
      attempts: 0,
      expiresAt,
    });
    await this.otpRepo.save(otpRecord);
    return otp;
  }

  private async consumeEmailOtp(email: string, otp: string, purpose: OtpPurpose): Promise<OtpVerification> {
    const record = await this.otpRepo.findOne({
      where: { email, purpose },
      order: { createdAt: 'DESC' },
    });

    if (!record || record.verifiedAt) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    if (record.attempts >= 5) {
      record.expiresAt = new Date();
      await this.otpRepo.save(record);
      throw new BadRequestException('Too many invalid verification attempts. Please request a new OTP.');
    }

    const now = new Date();
    if (now > record.expiresAt) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    if (!record.otpHash) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    const valid = await comparePassword(otp, record.otpHash);
    if (!valid) {
      record.attempts += 1;
      await this.otpRepo.save(record);
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    record.verifiedAt = now;
    await this.otpRepo.save(record);
    return record;
  }

  private async generateCustomerTokens(
    user: User,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<TokenPair> {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'customer',
    };

    const jwtSecret = this.configService.getOrThrow<string>('jwt.secret');
    const jwtExpiresIn = this.configService.getOrThrow<string>('jwt.expiresIn');
    const refreshSecret = this.configService.getOrThrow<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.getOrThrow<string>('jwt.refreshExpiresIn');

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: jwtSecret,
      expiresIn: jwtExpiresIn as never,
    });

    const expiresAt: Date = dayjs().add(7, 'day').toDate();
    const session = this.userSessionRepo.create({
      userId: user.id,
      refreshToken: 'pending',
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      expiresAt,
    });
    const savedSession = await this.userSessionRepo.save(session);

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      sessionId: savedSession.id,
      type: 'customer',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as never,
    });

    savedSession.refreshToken = refreshToken;
    await this.userSessionRepo.save(savedSession);

    return { accessToken, refreshToken };
  }

  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
}
