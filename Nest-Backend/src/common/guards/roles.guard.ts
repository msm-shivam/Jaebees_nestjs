import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { DefaultRoles } from '../constants/roles.constants';
import { AuthMessages } from '../constants/messages.constants';
import { AdminJwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<DefaultRoles[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AdminJwtPayload }>();
    const user = request.user;

    if (!user) throw new ForbiddenException(AuthMessages.FORBIDDEN);

    const hasRole = user.roles?.some((role) =>
      requiredRoles.includes(role as DefaultRoles),
    );

    if (!hasRole) throw new ForbiddenException(AuthMessages.FORBIDDEN);
    return true;
  }
}
