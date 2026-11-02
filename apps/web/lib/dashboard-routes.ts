export type DashboardUserLike = {
  clinicId?: string | null;
  roles?: string[];
} | string | null | undefined;

export const dashboardRedirectMap: Record<string, string> = {
  admin: '/admin/dashboard',
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
    const normalizedRoles = roles.map((role) => role.toLowerCase());

    if (normalizedRoles.includes('admin')) {
      return '/admin/dashboard';
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

  const role = typeof userOrRole === 'string' ? userOrRole.toLowerCase() : '';
  return dashboardRedirectMap[role] ?? '/admin/dashboard';
}
