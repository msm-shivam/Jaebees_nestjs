import { SetMetadata } from '@nestjs/common';
import { DefaultRoles } from '../constants/roles.constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: DefaultRoles[]) =>
  SetMetadata(ROLES_KEY, roles);
