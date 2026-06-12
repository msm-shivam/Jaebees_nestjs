'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12 text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#ea580c15,transparent)]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-500/20"
          >
            <Award size={24} />
          </motion.div>
          <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            Sports E-commerce Admin
          </h2>
          <p className="mt-1 text-center text-xs text-zinc-500">
            Control Center & Analytics Dashboard
          </p>
        </div>

        {/* Auth form container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
