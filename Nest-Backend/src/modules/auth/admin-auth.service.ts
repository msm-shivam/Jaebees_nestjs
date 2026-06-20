import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { AdminUser } from '../admin/entities/admin-user.entity';
import { AdminSession } from '../admin/entities/admin-session.entity';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { comparePassword } from '../../common/utils/password.util';
import { AuthMessages } from '../../common/constants/messages.constants';
import {
  AdminJwtPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface';
import { AuditLogService } from '../security-compliance/services/audit-log.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const dayjs = require('dayjs');

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
    @InjectRepository(AdminSession)
    private readonly adminSessionRepo: Repository<AdminSession>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    private readonly auditLogService: AuditLogService,
  ) {}

  async login(
    dto: LoginDto,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<{ message: string; data: TokenPair }> {
    const admin = await this.adminRepo.findOne({
      where: { email: dto.email.toLowerCase() },
      relations: { roles: { permissions: true } },
    });

    if (!admin)
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);
    if (!admin.isActive)
      throw new ForbiddenException(AuthMessages.ACCOUNT_DISABLED);

    const valid = await comparePassword(dto.password, admin.passwordHash);
    if (!valid)
      throw new UnauthorizedException(AuthMessages.INVALID_CREDENTIALS);

    await this.adminRepo.update(admin.id, { lastLoginAt: new Date() });

    const tokens = await this.generateAdminTokens(admin, ipAddress, userAgent);
     await this.auditLogService.log({
      userId: admin.id,
      action: 'LOGIN',
      entityType: 'ADMIN',
      entityId: admin.id,
      newValues: { lastLoginAt: admin.lastLoginAt,email:admin.email,name:admin.name },
    });
    return { message: AuthMessages.LOGIN_SUCCESS, data: tokens };
  }

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

    const session = await this.adminSessionRepo.findOne({
      where: {
        id: payload.sessionId,
        adminId: payload.sub,
        refreshToken: dto.refreshToken,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!session) throw new UnauthorizedException(AuthMessages.SESSION_EXPIRED);

    const admin = await this.adminRepo.findOne({
      where: { id: payload.sub },
      relations: { roles: { permissions: true } },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException(AuthMessages.ACCOUNT_DISABLED);
    }

    await this.adminSessionRepo.remove(session);
    const tokens = await this.generateAdminTokens(admin, ipAddress, userAgent);
    return { message: AuthMessages.TOKEN_REFRESHED, data: tokens };
  }

  async logout(
    adminId: string,
    refreshToken: string,
  ): Promise<{ message: string }> {
    await this.adminSessionRepo.delete({ adminId, refreshToken });
    return { message: AuthMessages.LOGOUT_SUCCESS };
  }

  private async generateAdminTokens(
    admin: AdminUser,
    ipAddress: string | undefined,
    userAgent: string | undefined,
  ): Promise<TokenPair> {
    const roles = admin.roles?.map((r) => r.slug) ?? [];
    const permissions = [
      ...new Set(
        admin.roles?.flatMap((r) => r.permissions?.map((p) => p.slug) ?? []) ??
          [],
      ),
    ];

    const accessPayload: AdminJwtPayload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      type: 'admin',
      roles,
      permissions,
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
    const session = this.adminSessionRepo.create({
      adminId: admin.id,
      refreshToken: 'pending',
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      expiresAt,
    });
    const savedSession = await this.adminSessionRepo.save(session);

    const refreshPayload: RefreshTokenPayload = {
      sub: admin.id,
      sessionId: savedSession.id,
      type: 'admin',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn as never,
    });

    savedSession.refreshToken = refreshToken;
    await this.adminSessionRepo.save(savedSession);

    return { accessToken, refreshToken };
  }
}
