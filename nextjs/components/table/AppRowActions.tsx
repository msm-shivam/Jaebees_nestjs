'use client';

import React, { useState, type ComponentType } from 'react';
import { MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppRowActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  extraActions?: {
    label: string;
    icon?: ComponentType<{ size?: number; className?: string }>;
    onClick: () => void;
    danger?: boolean;
  }[];
}

export function AppRowActions({ onView, onEdit, onDelete, extraActions }: AppRowActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
      >
        <MoreHorizontal size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 mt-2 w-36 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-50"
            >
              {onView && (
                <button
                  onClick={() => {
                    setOpen(false);
                    onView();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Eye size={14} className="text-zinc-400" />
                  <span>View Details</span>
                </button>
              )}

              {onEdit && (
                <button
                  onClick={() => {
                    setOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Edit2 size={14} className="text-zinc-400" />
                  <span>Edit</span>
                </button>
              )}

              {extraActions?.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setOpen(false);
                      action.onClick();
                    }}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                      action.danger
                        ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20'
                        : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {Icon && <Icon size={14} className={action.danger ? 'text-rose-500' : 'text-zinc-400'} />}
                    <span>{action.label}</span>
                  </button>
                );
              })}

              {onDelete && (
                <button
                  onClick={() => {
                    setOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <Trash2 size={14} className="text-rose-500" />
                  <span>Delete</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppRowActions;
