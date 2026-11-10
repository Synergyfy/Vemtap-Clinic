'use client';

import { createContext, useContext, useEffect, useCallback, useState, ReactNode, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAuthState,
  AuthUser,
  normalizeAuthUser,
  hasUsablePatientIdentity,
  hasActivePersistedSession,
  getAccessToken,
} from './auth-state';
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
  clinicName?: string;
  clinicAddress?: string;
  clinicCity?: string;
  clinicState?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicId?: string | null;
}

const sanitizeRegisterPayload = (data: RegisterData) => {
  const payload = { ...data };
  const clinicId = typeof payload.clinicId === 'string' ? payload.clinicId.trim() : '';

  if (!clinicId) {
    delete payload.clinicId;
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (key.startsWith('clinic') && (value === undefined || value === null || String(value).trim() === '')) {
      delete payload[key as keyof RegisterData];
    }
  });

  return payload;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { accessToken, user, isAuthenticated, isHydrated, isLoggedOut, setAuth, clearAuth: clearAuthState } = useAuthState();
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  const checkAuth = useCallback(async () => {
    const hasActiveSession = hasActivePersistedSession({ accessToken, user, isLoggedOut, isAuthenticated });

    if (isLoggedOut && !hasActiveSession) {
      setIsLoading(false);
      return;
    }

    if (user?.roles?.includes('patient')) {
      if (!hasUsablePatientIdentity(user)) {
        clearAuthState();
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/patient-portal/profile');
        const profile = response.data ?? {};
        const refreshedUser = normalizeAuthUser({
          ...user,
          userId: profile.id ?? user.userId,
          email: profile.email ?? user.email,
          firstName: profile.firstName ?? user.firstName,
          lastName: profile.lastName ?? user.lastName,
          phone: profile.phone ?? user.phone,
          clinicId: profile.clinicId ?? user.clinicId ?? '',
          branchId: profile.branchId ?? user.branchId,
          guardianId: profile.guardianId ?? user.guardianId,
          guardianRelationship: profile.guardianRelationship ?? user.guardianRelationship,
          accountType: profile.accountType ?? user.accountType ?? 'individual',
          roles: ['patient'],
        });

        if (refreshedUser && accessToken) {
          setAuth(accessToken, refreshedUser);
        }
      } catch {
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const response = await api.post('/auth/refresh');
      const { accessToken: newAccessToken, user: newUser } = response.data ?? {};

      if (!newAccessToken || !newUser) {
        clearAuthState();
        return;
      }

      const normalizedUser = normalizeAuthUser(newUser);
      if (normalizedUser) {
        setAuth(newAccessToken, normalizedUser);
      }
    } catch {
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedOut, user?.roles, setAuth, clearAuthState]);

  useEffect(() => {
    if (!isHydrated || hasCheckedAuth.current) {
      return;
    }

    hasCheckedAuth.current = true;
    void checkAuth();
  }, [isHydrated, checkAuth]);

  const login = async (email: string, password: string): Promise<AuthUser | null> => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken: newAccessToken, user: newUser } = response.data;
      if (newAccessToken && newUser) {
        const normalizedUser = normalizeAuthUser(newUser);
        if (normalizedUser) {
          console.log('[clinic-login] authenticated user:', {
            ...normalizedUser,
            accessToken: newAccessToken,
          });
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
    hasCheckedAuth.current = false;
    try {
      const token = getAccessToken();
      if (token) {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          const status = (error as { response?: { status?: number } })?.response?.status;
          if (status !== 401 && status !== 403) {
            throw error;
          }
        }
      }
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