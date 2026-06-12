'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLayout } from '@/store/layout-context';
import { usePermissions } from '@/hooks/usePermissions';
import { SIDEBAR_ITEMS, MenuItem } from '@/constants/navigation';
import { ChevronDown, Award } from 'lucide-react';

const Sidebar = React.memo(function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setSidebarOpen, setSidebarCollapsed } = useLayout();
  const { hasPermission, role, user } = usePermissions();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const showTooltip = (e: React.MouseEvent, text: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltip({ text, x: rect.right + 12, y: rect.top + rect.height / 2 });
  };

  const hideTooltip = () => setTooltip(null);

  const toggleSubmenu = (title: string) => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
    hideTooltip()
    setOpenSubmenus((prev) => {
      if (prev[title]) return {};
      return { [title]: true };
    });
  };

  const isLinkActive = (item: MenuItem) => {
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some((sub) => pathname === sub.href);
    }
    return false;
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-zinc-200 bg-zinc-950 text-zinc-100 dark:border-zinc-800 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } lg:static lg:h-full`}
      style={{ transition: 'width 0.2s ease' }}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-zinc-800 bg-zinc-900 px-4">
        <Link
          href="/dashboard"
         
          onMouseEnter={(e) => sidebarCollapsed && showTooltip(e, 'SPORTS PANEL')}
          onMouseLeave={hideTooltip}
          className="relative flex items-center justify-center gap-2 font-bold tracking-wider"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md shadow-orange-500/30">
            <Award size={18} />
          </div>
          <span
            className={`overflow-hidden whitespace-nowrap text-md font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent transition-[max-width,opacity] duration-200 ${
              sidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'
            }`}
          >
            SPORTS PANEL
          </span>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-zinc-800">
          {SIDEBAR_ITEMS.map((item) => {
          if (mounted && item.permission && !hasPermission(item.permission)) return null;

          const isActive = isLinkActive(item);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const isSubmenuOpen = openSubmenus[item.title] || isActive;
          const Icon = item.icon;

          return (
            <div key={item.title} className="space-y-1">
              {hasSubmenu ? (
                <div>
                  {sidebarCollapsed ? (
                    <Link
                      href={item.href}
                      onClick={() => toggleSubmenu(item.title)}
                      onMouseEnter={(e) => showTooltip(e, item.title)}
                      onMouseLeave={hideTooltip}
                      className={`relative flex w-full items-center justify-center rounded-lg p-2.5 text-sm font-medium transition-colors hover:bg-zinc-900 ${
                        isActive ? 'bg-zinc-900 text-orange-400' : 'text-zinc-400 hover:text-zinc-50'
                      }`}
                    >
                      {Icon && <Icon size={20} className={`shrink-0 ${isActive ? 'text-orange-400' : 'text-zinc-400'}`} />}
                    </Link>
                  ) : (
                    <div
                      className={`relative flex w-full items-center justify-between rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-zinc-900 text-orange-400' : 'text-zinc-400'
                      }`}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 overflow-hidden rounded-l-lg p-2.5 flex-1 hover:bg-zinc-900"
                      >
                        {Icon && <Icon size={20} className={`shrink-0 ${isActive ? 'text-orange-400' : 'text-zinc-400'}`} />}
                        <span
                          className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 max-w-40 opacity-100`}
                        >
                          {item.title}
                        </span>
                      </Link>
                      <button
                        onClick={() => toggleSubmenu(item.title)}
                        className="flex items-center justify-center rounded-r-lg p-2.5 hover:bg-zinc-900"
                        title={isSubmenuOpen ? 'Close submenu' : 'Open submenu'}
                      >
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}

                  {!sidebarCollapsed && isSubmenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-5 mt-1 border-l border-zinc-800 pl-4 space-y-1.5"
                    >
                      {item.submenu?.map((sub) => {
                        if (mounted && sub.permission && !hasPermission(sub.permission)) return null;
                        const isSubActive = pathname === sub.href;
                        return (
                          <Link
                            key={sub.title}
                            href={sub.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`block rounded-md py-1.5 px-3 text-xs font-medium transition-colors ${
                              isSubActive
                                ? 'bg-zinc-900 text-orange-400 font-semibold'
                                : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-200'
                            }`}
                          >
                            {sub.title}
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  onMouseEnter={(e) => sidebarCollapsed && showTooltip(e, item.title)}
                  onMouseLeave={hideTooltip}
                  className={`relative flex items-center gap-3 rounded-lg p-2.5 text-sm font-medium transition-colors hover:bg-zinc-900 ${
                    isActive ? 'bg-zinc-900 text-orange-400' : 'text-zinc-400 hover:text-zinc-50'
                  }`}
                >
                  {Icon && <Icon size={20} className={`shrink-0 ${isActive ? 'text-orange-400' : 'text-zinc-400'}`} />}
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${
                      sidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Details Sidebar Footer */}
      {mounted && user && (
        <div className={`border-t border-zinc-800 bg-zinc-900/50 overflow-hidden transition-[max-height,opacity] duration-200 ${sidebarCollapsed ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
          <div className="flex items-center gap-3 p-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 shrink-0 rounded-full border border-zinc-700" />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-bold text-zinc-300">
                {user.name.charAt(0)}
              </div>
            )}
            <div className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ${sidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-32 opacity-100'}`}>
              <p className="truncate text-xs font-bold text-zinc-200">{user.name}</p>
              <p className="truncate text-[10px] text-zinc-500">{role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-md bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-zinc-100 whitespace-nowrap shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateY(-50%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </aside>
  );
});

export { Sidebar };
export default Sidebar;
