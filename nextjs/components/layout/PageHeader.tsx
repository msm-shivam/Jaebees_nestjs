'use client';

import React from 'react';
import Breadcrumbs from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Breadcrumbs />
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 sm:ml-auto">
          {children}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
