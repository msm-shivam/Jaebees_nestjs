'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import apiClient from '@/services/api.client';
import { ApiResponse } from '@/services/api.client';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  type: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

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
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

function getUserFromToken(token: string): User | null {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      role: decoded.roles?.[0] || 'admin',
      permissions: decoded.permissions || [],
    };
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
console.log(user);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    const userData = getUserFromToken(token);
    if (!userData) {
      localStorage.removeItem('access_token');
    } else {
      setUser(userData);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const res = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/admin/auth/login', { email, password });
      const { accessToken } = res.data.data;
      localStorage.setItem('access_token', accessToken);
      const userData = getUserFromToken(accessToken);
      if (userData) setUser(userData);
      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      setIsLoading(false);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      return { success: false, message: axiosErr?.response?.data?.message || 'Invalid email or password' };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
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
