'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface NoPermissionProps {
  permissionNeeded?: string;
}

export function NoPermission({ permissionNeeded }: NoPermissionProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50 border border-zinc-200 rounded-xl dark:bg-zinc-950 dark:border-zinc-800">
      <div className="p-3 bg-red-100 text-red-600 rounded-full dark:bg-red-950/30 dark:text-red-400">
        <ShieldAlert size={32} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Access Denied
      </h3>
      <p className="mt-2 text-sm text-zinc-500 max-w-sm dark:text-zinc-400">
        You do not have the required permissions to view this section.
        {permissionNeeded && (
          <code className="block mt-1 px-1.5 py-0.5 text-xs bg-zinc-200 text-zinc-800 rounded dark:bg-zinc-800 dark:text-zinc-200">
            Permission Required: {permissionNeeded}
          </code>
        )}
      </p>
    </div>
  );
}

export default NoPermission;
