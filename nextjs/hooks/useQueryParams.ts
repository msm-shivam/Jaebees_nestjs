'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getQueryParam = useCallback(
    (key: string, defaultValue = '') => {
      return searchParams.get(key) || defaultValue;
    },
    [searchParams]
  );

  const setQueryParams = useCallback(
    (params: Record<string, string | number | null | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : '';

      router.push(`${pathname}${query}`);
    },
    [searchParams, pathname, router]
  );

  const clearQueryParams = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return {
    getQueryParam,
    setQueryParams,
    clearQueryParams,
    searchParams,
  };
}

export default useQueryParams;
