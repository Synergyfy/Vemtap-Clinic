import type { AuthUser } from "./auth-state";

/**
 * A family owner is a patient account that is not itself a dependent. Only the
 * owner can add family members or send them activation invites — dependents
 * manage their own profile and cannot grow the family group.
 */
export const isFamilyOwner = (user?: AuthUser | null): boolean =>
  Boolean(user && Array.isArray(user.roles) && user.roles.includes("patient") && !user.guardianId);
