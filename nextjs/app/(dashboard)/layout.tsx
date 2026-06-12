'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/store/auth-context';
import { useLayout } from '@/store/layout-context';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const router = useRouter();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && mounted.current) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-orange-500"></div>
          <p className="text-sm font-semibold tracking-wide text-zinc-400">Loading Sports Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Mobile sidebar overlay (Drawer) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <div className="absolute right-4 top-4 z-50 text-white">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-full bg-zinc-900 p-1.5 hover:bg-zinc-800"
                >
                  <X size={16} />
                </button>
              </div>
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
