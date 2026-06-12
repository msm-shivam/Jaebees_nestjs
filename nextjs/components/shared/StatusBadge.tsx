import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normStatus = status.toLowerCase();

  let styles = 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';

  if (['active', 'completed', 'paid', 'published', 'approved', 'delivered'].includes(normStatus)) {
    styles = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20';
  } else if (['pending', 'processing', 'draft', 'returned'].includes(normStatus)) {
    styles = 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-500/20';
  } else if (['inactive', 'cancelled', 'rejected', 'expired', 'out of stock'].includes(normStatus)) {
    styles = 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-500/20';
  } else if (['shipped', 'sent'].includes(normStatus)) {
    styles = 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-500/20';
  }

  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
