'use client';

import { createContext, useContext, useEffect, useCallback, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthState, AuthUser, normalizeAuthUser } from './auth-state';
import { api } from './api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (data: RegisterData) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  clinicId?: string | null;
}

const sanitizeRegisterPayload = (data: RegisterData) => {
  const payload = { ...data };
  const clinicId = typeof payload.clinicId === 'string' ? payload.clinicId.trim() : '';

  if (!clinicId) {
    delete payload.clinicId;
  }

  return payload;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isHydrated, isLoggedOut, setAuth, clearAuth: clearAuthState } = useAuthState();
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    if (isLoggedOut) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/refresh');
      const { accessToken: newAccessToken, user: newUser } = response.data;
      if (newAccessToken && newUser) {
        const normalizedUser = normalizeAuthUser(newUser);
        if (normalizedUser) {
          setAuth(newAccessToken, normalizedUser);
        }
      }
    } catch {
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedOut, setAuth, clearAuthState]);

  useEffect(() => {
    if (isHydrated) {
      // Schedule the async check to avoid synchronous state update in effect
      checkAuth();
    }
  }, [isHydrated, checkAuth]);

  const login = async (email: string, password: string): Promise<AuthUser | null> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken: newAccessToken, user: newUser } = response.data;
      if (newAccessToken && newUser) {
        const normalizedUser = normalizeAuthUser(newUser);
        if (normalizedUser) {
          setAuth(newAccessToken, normalizedUser);
          return normalizedUser;
        }
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthUser | null> => {
    setIsLoading(true);
    try {
      const cleanData = sanitizeRegisterPayload(data);
      const response = await api.post('/auth/register', cleanData);
      const { accessToken: newAccessToken, user: newUser } = response.data;
      if (newAccessToken && newUser) {
        const normalizedUser = normalizeAuthUser(newUser);
        if (normalizedUser) {
          setAuth(newAccessToken, normalizedUser);
          return normalizedUser;
        }
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      queryClient.clear();
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