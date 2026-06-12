'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/auth-context';
import { useLayout } from '@/store/layout-context';
import { Menu, Bell, LogOut, ChevronDown, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Header() {
  const { user, logout } = useAuth();
  const { toggleSidebarCollapsed, setSidebarOpen, sidebarOpen } = useLayout();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Left side actions */}
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Desktop Collapse sidebar trigger */}
        <button
          onClick={toggleSidebarCollapsed}
          className="hidden rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:block"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Dark Mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
          <Bell size={18} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 font-bold dark:bg-zinc-800 dark:text-zinc-200">
                {user?.name.charAt(0) || 'U'}
              </div>
            )}
            <span className="hidden text-sm font-semibold text-zinc-700 dark:text-zinc-200 md:block">
              {user?.name || 'Admin'}
            </span>
            <ChevronDown size={14} className="text-zinc-400" />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {profileOpen && (
              <>
                {/* Click outside backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 z-50"
                >
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-400">Signed in as</p>
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-200 truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;
