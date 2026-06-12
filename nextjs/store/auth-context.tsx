'use client';

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A set of default permissions for our mock Admin user
const ALL_MOCK_PERMISSIONS = [
  'dashboard.view',
  // Catalog
  'catalog.view',
  'product.create',
  'product.update',
  'product.delete',
  'category.create',
  'category.update',
  'category.delete',
  'brand.create',
  'brand.update',
  'brand.delete',
  'review.view',
  'review.delete',
  // Inventory
  'inventory.view',
  'supplier.view',
  'supplier.create',
  'supplier.update',
  'supplier.delete',
  'purchase-order.view',
  'purchase-order.create',
  'goods-receipt.view',
  'stock-adjustment.view',
  // Orders
  'orders.view',
  'orders.update',
  'shipment.view',
  'shipment.update',
  'return.view',
  'return.update',
  // Customers
  'customers.view',
  'customers.create',
  'customers.update',
  'customers.delete',
  'customers-activity.view',
  // Marketing
  'marketing.view',
  'coupons.create',
  'promotions.create',
  'campaigns.create',
  // Support
  'support.view',
  'support.tickets',
  'support.analytics',
  // Finance
  'finance.view',
  'finance.transactions',
  'finance.settlements',
  'finance.expenses',
  // Reports
  'reports.view',
  'reports.generate',
  // CMS
  'cms.view',
  'cms.pages',
  'cms.sections',
  // Administration
  'admin.view',
  'admin.users',
  'admin.roles',
  'admin.permissions',
  'admin.audit-logs',
  'admin.security-logs',
  'admin.privacy-requests',
];

const MOCK_USER: User = {
  id: 'usr_1',
  name: 'Jane Doe',
  email: 'admin@sports-ecommerce.com',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  role: 'Administrator',
  permissions: ALL_MOCK_PERMISSIONS,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Mimic API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email === 'admin@sports-ecommerce.com' && password === 'admin123') {
      setUser(MOCK_USER);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
