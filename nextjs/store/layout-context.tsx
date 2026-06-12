'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile drawer navigation
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // For desktop sidebar collapse

  // Handle window resizing to close mobile menu automatically
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const setSidebarCollapsedFn = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <LayoutContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        toggleSidebarCollapsed,
        setSidebarCollapsed: setSidebarCollapsedFn,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
