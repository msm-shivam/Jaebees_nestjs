import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { DefaultPermissions } from '../constants/roles.constants';
import { AuthMessages } from '../constants/messages.constants';
import { AdminJwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      DefaultPermissions[]
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request & { user: AdminJwtPayload }>();
    const user = request.user;

    if (!user) throw new ForbiddenException(AuthMessages.FORBIDDEN);

    const hasPermission = user.permissions?.some((perm) =>
      requiredPermissions.includes(perm as DefaultPermissions),
    );

    if (!hasPermission) throw new ForbiddenException(AuthMessages.FORBIDDEN);
    return true;
  }
}
