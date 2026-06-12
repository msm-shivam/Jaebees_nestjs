'use client';

import React from 'react';
import { Database, Plus } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no items matching the current query.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-zinc-200 rounded-xl dark:bg-zinc-950 dark:border-zinc-800">
      <div className="p-4 bg-zinc-50 text-zinc-400 rounded-full dark:bg-zinc-900 dark:text-zinc-600">
        <Database size={32} />
      </div>
      <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="mt-2 text-sm text-zinc-500 max-w-sm dark:text-zinc-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition-colors"
        >
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}

export default EmptyState;
