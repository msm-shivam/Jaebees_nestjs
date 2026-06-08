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
import { User } from '../users/entities/user.entity';
import { UserSession } from '../users/entities/user-session.entity';
import { OtpVerification, OtpType } from './entities/otp-verification.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import {
  hashPassword,
  comparePassword,
} from '../../common/utils/password.util';
import { generateOtp } from '../../common/utils/otp.util';
import {
  AuthMessages,
  UserMessages,
} from '../../common/constants/messages.constants';
import { OTP_EXPIRY_MINUTES } from '../../common/constants/app.constants';
import {
  JwtPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface';
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
  ) {}

  // ─── Register ────────────────────────────────────────────────────────────────
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const emailExists = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (emailExists) throw new BadRequestException(UserMessages.EMAIL_TAKEN);

    if (dto.mobile) {
      const mobileExists = await this.userRepo.findOne({
        where: { mobile: dto.mobile },
      });
      if (mobileExists)
        throw new BadRequestException(UserMessages.MOBILE_TAKEN);
    }

    const passwordHash = await hashPassword(dto.password);
    const user = this.userRepo.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase(),
      mobile: dto.mobile,
      passwordHash,
      isEmailVerified: false,
      isActive: true,
    });
    await this.userRepo.save(user);

    await this.createAndSaveOtp(user.email, OtpType.EMAIL_VERIFY);
    return { message: AuthMessages.REGISTER_SUCCESS };
  }

  // ─── Verify Email ─────────────────────────────────────────────────────────
  async verifyEmail(
    dto: VerifyEmailDto,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<{ message: string; data: TokenPair }> {
    await this.consumeOtp(
      dto.email.toLowerCase(),
      dto.otp,
      OtpType.EMAIL_VERIFY,
    );

    await this.userRepo.update(
      { email: dto.email.toLowerCase() },
      { isEmailVerified: true },
    );

    // Fetch the updated user and issue tokens so the caller is logged in immediately
    const user = await this.userRepo.findOneOrFail({
      where: { email: dto.email.toLowerCase() },
    });

    const tokens = await this.generateCustomerTokens(
      user,
      ipAddress,
      userAgent,
    );
    return { message: AuthMessages.OTP_VERIFIED, data: tokens };
  }

  // ─── Resend OTP ───────────────────────────────────────────────────────────
  async resendOtp(dto: ResendOtpDto): Promise<{ message: string }> {
    const email = dto.email.toLowerCase();

    if (dto.type === OtpType.EMAIL_VERIFY) {
      const user = await this.userRepo.findOne({ where: { email } });
      // Always return the same message to prevent user enumeration
      if (!user) return { message: AuthMessages.OTP_SENT };
      if (user.isEmailVerified) {
        throw new BadRequestException(AuthMessages.EMAIL_ALREADY_VERIFIED);
      }
    }

    if (dto.type === OtpType.FORGOT_PASSWORD) {
      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) return { message: AuthMessages.OTP_SENT };
    }

    await this.createAndSaveOtp(email, dto.type);
    return { message: AuthMessages.OTP_SENT };
  }

  // ─── Login ────────────────────────────────────────────────────────────────
  async login(
    dto: LoginDto,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<{ message: string; data: TokenPair }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user)
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
    if (!user.isActive)
      throw new ForbiddenException(AuthMessages.ACCOUNT_DISABLED);
    if (!user.isEmailVerified)
      throw new ForbiddenException(AuthMessages.EMAIL_NOT_VERIFIED);

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid)
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);

    const tokens = await this.generateCustomerTokens(
      user,
      ipAddress,
      userAgent,
    );
    return { message: AuthMessages.LOGIN_SUCCESS, data: tokens };
  }

  // ─── Refresh Token ────────────────────────────────────────────────────────
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
    if (!user || !user.isActive) {
      throw new UnauthorizedException(AuthMessages.ACCOUNT_DISABLED);
    }

    await this.userSessionRepo.remove(session);
    const tokens = await this.generateCustomerTokens(
      user,
      ipAddress,
      userAgent,
    );
    return { message: AuthMessages.TOKEN_REFRESHED, data: tokens };
  }

  // ─── Logout ───────────────────────────────────────────────────────────────
  async logout(
    userId: string,
    refreshToken: string,
  ): Promise<{ message: string }> {
    await this.userSessionRepo.delete({ userId, refreshToken });
    return { message: AuthMessages.LOGOUT_SUCCESS };
  }

  // ─── Forgot Password ──────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) return { message: AuthMessages.OTP_SENT };

    await this.createAndSaveOtp(user.email, OtpType.FORGOT_PASSWORD);
    return { message: AuthMessages.OTP_SENT };
  }

  // ─── Reset Password ───────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.consumeOtp(
      dto.email.toLowerCase(),
      dto.otp,
      OtpType.FORGOT_PASSWORD,
    );

    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) throw new NotFoundException(UserMessages.USER_NOT_FOUND);

    const passwordHash = await hashPassword(dto.newPassword);
    await this.userRepo.update(user.id, { passwordHash });
    await this.userSessionRepo.delete({ userId: user.id });

    return { message: AuthMessages.PASSWORD_RESET_SUCCESS };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────
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
    const refreshSecret =
      this.configService.getOrThrow<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'jwt.refreshExpiresIn',
    );

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

  private async createAndSaveOtp(email: string, type: OtpType): Promise<void> {
    await this.otpRepo
      .createQueryBuilder()
      .update()
      .set({ verifiedAt: new Date() })
      .where('email = :email AND type = :type AND verified_at IS NULL', {
        email,
        type,
      })
      .execute();

    const otp = generateOtp();

    const expiresAt: Date = dayjs().add(OTP_EXPIRY_MINUTES, 'minute').toDate();
    const otpRecord = this.otpRepo.create({ email, otp, type, expiresAt });
    await this.otpRepo.save(otpRecord);
  }

  private async consumeOtp(
    email: string,
    otp: string,
    type: OtpType,
  ): Promise<OtpVerification> {
    const record = await this.otpRepo.findOne({
      where: { email, otp, type },
      order: { createdAt: 'DESC' },
    });

    if (!record || record.verifiedAt) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    const now = new Date();
    if (now > record.expiresAt) {
      throw new BadRequestException(AuthMessages.OTP_INVALID);
    }

    record.verifiedAt = now;
    await this.otpRepo.save(record);
    return record;
  }
}
