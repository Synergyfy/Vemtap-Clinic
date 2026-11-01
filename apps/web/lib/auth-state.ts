import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  userId: string;
  email: string;
  roles: string[];
  clinicId: string;
  branchId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const normalizeAuthUser = (user: Partial<AuthUser> | null | undefined): AuthUser | null => {
  if (!user) return null;

  const roles = Array.isArray(user.roles) ? user.roles.map((role) => String(role).toLowerCase()) : [];

  return {
    ...user,
    userId: user.userId ?? '',
    email: user.email ?? '',
    roles,
    clinicId: user.clinicId ?? '',
    branchId: user.branchId,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  } satisfies AuthUser;
};

export const getEffectiveBranchId = (user: Partial<AuthUser> | null | undefined) => {
  const branchId = user?.branchId?.trim();
  return branchId ?? '';
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
        state?.setHydrated(true);
      },
    },
  ),
);

export const getAccessToken = () => useAuthState.getState().accessToken;
export const getAuthUser = () => useAuthState.getState().user;
export const isAuthenticated = () => useAuthState.getState().isAuthenticated;
export const clearAuth = () => useAuthState.getState().clearAuth();