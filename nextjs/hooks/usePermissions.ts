'use client';

import { useAuth } from '@/store/auth-context';

export function usePermissions() {
  const { hasPermission, user } = useAuth();

  return {
    hasPermission,
    permissions: user?.permissions || [],
    role: user?.role || '',
    user,
  };
}

export default usePermissions;
