'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function AppDrawer({ isOpen, onClose, title, children }: AppDrawerProps) {
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

          {/* Sliding Drawer Card */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800"
          >
            {/* Drawer Header */}
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AppDrawer;
