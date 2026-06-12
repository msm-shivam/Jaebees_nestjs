'use client';

import React from 'react';
import LinkComponent from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/login') return null;

  const pathSegments = pathname.split('/').filter((segment) => segment !== '');

  return (
    <nav className="flex items-center space-x-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
      <LinkComponent
        href="/dashboard"
        className="flex items-center hover:text-zinc-950 transition-colors dark:hover:text-zinc-50"
      >
        <Home size={14} className="mr-1" />
        Home
      </LinkComponent>

      {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        const label = segment
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        return (
          <React.Fragment key={href}>
            <ChevronRight size={12} className="text-zinc-400" />
            {isLast ? (
              <span className="text-zinc-950 dark:text-zinc-50 font-semibold">
                {label}
              </span>
            ) : (
              <LinkComponent
                href={href}
                className="hover:text-zinc-950 transition-colors dark:hover:text-zinc-50"
              >
                {label}
              </LinkComponent>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
