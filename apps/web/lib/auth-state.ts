import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  userId: string;
  email: string;
  roles: string[];
  clinicId: string;
  clinicName?: string;
  branchId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const normalizeIdValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
};

export const normalizeAuthUser = (user: Partial<AuthUser> | null | undefined): AuthUser | null => {
  if (!user) return null;

  const roles = Array.isArray(user.roles) ? user.roles.map((role) => String(role).toLowerCase()) : [];
  const normalizedClinicId = normalizeIdValue(user.clinicId);
  const normalizedBranchId = normalizeIdValue(user.branchId);

  return {
    ...user,
    userId: user.userId ?? '',
    email: user.email ?? '',
    roles,
    clinicId: normalizedClinicId,
    clinicName: user.clinicName?.trim() || undefined,
    branchId: normalizedBranchId || undefined,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  } satisfies AuthUser;
};

export const hasUsablePatientIdentity = (user: Partial<AuthUser> | null | undefined): boolean => {
  if (!user) return false;

  if (!user.roles?.includes('patient')) {
    return true;
  }

  const identityFields = [user.userId, user.email, user.firstName, user.lastName, user.phone].filter(
    (value): value is string => typeof value === 'string' && value.trim().length > 0,
  );

  return identityFields.length > 0;
};

export const getEffectiveBranchId = (user: Partial<AuthUser> | null | undefined) => {
  const branchId = user?.branchId?.trim();
  return branchId ?? '';
};

export const hasActivePersistedSession = (state: Partial<{
  accessToken: string | null;
  user: AuthUser | null;
  isLoggedOut: boolean;
  isAuthenticated: boolean;
}> | null | undefined): boolean => {
  if (!state) return false;

  const hasAccessToken = typeof state.accessToken === 'string' && state.accessToken.trim().length > 0;
  const hasUser = !!state.user && (
    !!state.user.userId || !!state.user.email || !!state.user.firstName || !!state.user.lastName || !!state.user.phone
  );

  return hasAccessToken || hasUser;
};

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoggedOut: boolean;
  setAuth: (accessToken: string, user: AuthUser) => void;
  clearAuth: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthState = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoggedOut: false,
      setAuth: (accessToken: string, user: AuthUser) =>
        set({
          accessToken,
          user: normalizeAuthUser(user) ?? user,
          isAuthenticated: true,
          isLoggedOut: false,
        }),
      clearAuth: () =>
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          isLoggedOut: true,
        }),
      setHydrated: (isHydrated: boolean) => set({ isHydrated }),
    }),
    {
      name: 'vemtap-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoggedOut: state.isLoggedOut,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.isLoggedOut && hasActivePersistedSession(state)) {
          const fallbackUser = state.user ?? {
            userId: '',
            email: '',
            roles: [],
            clinicId: '',
          };
          state.setAuth(state.accessToken ?? '', fallbackUser);
        }
        state?.setHydrated(true);
      },
    },
  ),
);

export const getAccessToken = () => useAuthState.getState().accessToken;
export const getAuthUser = () => useAuthState.getState().user;
export const isAuthenticated = () => useAuthState.getState().isAuthenticated;
export const clearAuth = () => useAuthState.getState().clearAuth();