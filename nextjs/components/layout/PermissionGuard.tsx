'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import NoPermission from '@/components/shared/NoPermission';

interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  fallback,
  children,
}: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return fallback !== undefined ? (
      <>{fallback}</>
    ) : (
      <NoPermission permissionNeeded={permission} />
    );
  }

  return <>{children}</>;
}

export default PermissionGuard;
