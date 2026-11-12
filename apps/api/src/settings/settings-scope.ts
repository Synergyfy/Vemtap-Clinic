import { BadRequestException } from '@nestjs/common';

export interface SettingsScopeUser {
  roles?: string[];
  clinicId?: string | null;
}

const isSuperAdmin = (user?: SettingsScopeUser | null): boolean =>
  (user?.roles ?? []).some((role) => String(role).toLowerCase() === 'super_admin');

/**
 * Resolve which clinic a settings request may touch.
 *
 * Tenant users are always pinned to their own clinic — a different `clinicId`
 * supplied in the query string is ignored. Platform admins may target any
 * clinic (they usually have no clinic of their own).
 */
export function resolveClinicScope(
  user: SettingsScopeUser | null | undefined,
  requestedClinicId?: string | null,
): string {
  const requested = typeof requestedClinicId === 'string' ? requestedClinicId.trim() : '';
  const ownClinicId = typeof user?.clinicId === 'string' ? user.clinicId.trim() : '';

  const clinicId = isSuperAdmin(user) ? requested || ownClinicId : ownClinicId;

  if (!clinicId) {
    throw new BadRequestException('A clinic must be selected before managing settings.');
  }

  return clinicId;
}
