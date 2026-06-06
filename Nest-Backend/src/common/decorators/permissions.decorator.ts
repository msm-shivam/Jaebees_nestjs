import { SetMetadata } from '@nestjs/common';
import { DefaultPermissions } from '../constants/roles.constants';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: DefaultPermissions[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
