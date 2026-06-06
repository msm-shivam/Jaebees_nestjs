import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { AdminUser } from '../../admin/entities/admin-user.entity';
import type { AdminJwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthMessages } from '../../../common/constants/messages.constants';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(AdminUser)
    private readonly adminRepo: Repository<AdminUser>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: AdminJwtPayload): Promise<AdminJwtPayload> {
    const admin = await this.adminRepo.findOne({
      where: { id: payload.sub },
      relations: { roles: { permissions: true } },
    });

    if (!admin || !admin.isActive) {
      throw new UnauthorizedException(AuthMessages.ACCOUNT_DISABLED);
    }

    const roles = admin.roles.map((r) => r.slug);
    const permissions = [
      ...new Set(
        admin.roles.flatMap((r) => r.permissions?.map((p) => p.slug) ?? []),
      ),
    ];

    return {
      sub: admin.id,
      email: admin.email,
      type: 'admin',
      roles,
      permissions,
    };
  }
}
