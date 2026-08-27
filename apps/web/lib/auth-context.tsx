'use client';

import { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import { useAuthState, AuthUser } from './auth-state';
import { api } from './api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  clinicId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isHydrated, setAuth, clearAuth: clearAuthState } = useAuthState();
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { accessToken: newAccessToken, user: newUser } = response.data;
      if (newAccessToken && newUser) {
        setAuth(newAccessToken, newUser);
      }
    } catch {
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [setAuth, clearAuthState]);

  useEffect(() => {
    if (isHydrated) {
      // Schedule the async check to avoid synchronous state update in effect
      checkAuth();
    }
  }, [isHydrated, checkAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken: newAccessToken, user: newUser } = response.data;
      if (newAccessToken && newUser) {
        setAuth(newAccessToken, newUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      const { accessToken: newAccessToken, user: newUser } = response.data;
      if (newAccessToken && newUser) {
        setAuth(newAccessToken, newUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearAuthState();
    }
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.some((role) => user.roles.includes(role));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isHydrated,
        login,
        register,
        logout,
        checkAuth,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}