export type DashboardUserLike = {
  clinicId?: string | null;
  roles?: string[];
} | string | null | undefined;

const ONBOARDING_STORAGE_KEY = 'vemtap-clinic-onboarding';

const normalizeRole = (role: string) => role.trim().toLowerCase().replace(/[-\s]+/g, '_');

const getOnboardingState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as { completed?: boolean } | null;
  } catch {
    return null;
  }
};

export const dashboardRedirectMap: Record<string, string> = {
  super_admin: '/admin/dashboard',
  admin: '/admin/dashboard',
  clinic_admin: '/clinic/dashboard',
  doctor: '/doctor/dashboard',
  nurse: '/nurse/dashboard',
  optometrist: '/optician/dashboard',
  pharmacist: '/pharmacy/dashboard',
  receptionist: '/reception/dashboard',
  cashier: '/cashier',
  patient: '/patient/dashboard',
};

export function getDashboardRoute(userOrRole?: DashboardUserLike) {
  if (typeof userOrRole === 'object' && userOrRole !== null) {
    const roles = userOrRole.roles ?? [];
    const normalizedRoles = roles.map((role) => normalizeRole(role));

    if (normalizedRoles.includes('super_admin') || normalizedRoles.includes('admin')) {
      return '/admin/dashboard';
    }

    if (normalizedRoles.includes('clinic_admin')) {
      return '/clinic/dashboard';
    }

    const role = normalizedRoles[0] ?? '';
    if (role) {
      return dashboardRedirectMap[role] ?? '/admin/dashboard';
    }

    if (userOrRole.clinicId) {
      return '/clinic/dashboard';
    }

    return '/admin/dashboard';
  }

  const role = typeof userOrRole === 'string' ? normalizeRole(userOrRole) : '';
  return dashboardRedirectMap[role] ?? '/admin/dashboard';
}

export function getClinicEntryRoute(userOrRole?: DashboardUserLike) {
  if (typeof userOrRole !== 'object' || userOrRole === null || !userOrRole.clinicId) {
    return getDashboardRoute(userOrRole);
  }

  const onboardingState = getOnboardingState();

  if (onboardingState?.completed === true) {
    return getDashboardRoute(userOrRole);
  }

  if (!onboardingState || onboardingState.completed === false) {
    return '/clinic/onboarding';
  }

  return getDashboardRoute(userOrRole);
}
