'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface AppConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
}

export function AppConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
}: AppConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black"
          />

          {/* Dialog Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex gap-4">
                <div className={`rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0 ${
                  isDanger ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400'
                }`}>
                  <AlertTriangle size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    {title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {description}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                    isDanger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-orange-600 hover:bg-orange-500'
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AppConfirmDialog;
