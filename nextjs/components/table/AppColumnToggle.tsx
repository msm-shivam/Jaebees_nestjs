'use client';

import React, { useState } from 'react';
import { Eye, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ColumnDefinition {
  key: string;
  label: string;
  visible?: boolean;
}

interface AppColumnToggleProps {
  columns: ColumnDefinition[];
  onChange: (columns: ColumnDefinition[]) => void;
}

export function AppColumnToggle({ columns, onChange }: AppColumnToggleProps) {
  const [open, setOpen] = useState(false);

  const toggleColumn = (key: string) => {
    const next = columns.map((col) => {
      if (col.key === key) {
        return { ...col, visible: col.visible === false ? true : false };
      }
      return col;
    });
    onChange(next);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        <Eye size={16} />
        <span>Columns</span>
        <ChevronDown size={14} className="text-zinc-400" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-50 max-h-60 overflow-y-auto"
            >
              <p className="px-2 py-1 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                Toggle Columns
              </p>
              <div className="mt-1 space-y-1">
                {columns.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={col.visible !== false}
                      onChange={() => toggleColumn(col.key)}
                      className="accent-orange-600 rounded"
                    />
                    <span>{col.label}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppColumnToggle;
