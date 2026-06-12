'use client';

import React from 'react';
import { Trash2, AlertCircle } from 'lucide-react';

interface AppBulkActionsProps {
  selectedCount: number;
  onBulkDelete?: () => void;
  onBulkStatusUpdate?: (status: string) => void;
  statusOptions?: string[];
}

export function AppBulkActions({
  selectedCount,
  onBulkDelete,
  onBulkStatusUpdate,
  statusOptions = ['Active', 'Inactive'],
}: AppBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 rounded-lg bg-orange-50 border border-orange-200/50 p-2.5 px-4 dark:bg-orange-950/20 dark:border-orange-500/20">
      <div className="flex items-center gap-1.5 text-xs text-orange-800 dark:text-orange-300">
        <AlertCircle size={15} />
        <span className="font-semibold">{selectedCount} rows selected</span>
      </div>

      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800"></div>

      <div className="flex items-center gap-3">
        {onBulkStatusUpdate && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-500">Update Status:</span>
            <select
              onChange={(e) => onBulkStatusUpdate(e.target.value)}
              defaultValue=""
              className="rounded border border-zinc-200 bg-white px-2 py-0.5 text-xs outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="" disabled>Choose...</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt.toLowerCase()}>{opt}</option>
              ))}
            </select>
          </div>
        )}

        {onBulkDelete && (
          <button
            onClick={onBulkDelete}
            className="flex items-center gap-1 rounded bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
          >
            <Trash2 size={13} />
            <span>Delete Selected</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default AppBulkActions;
