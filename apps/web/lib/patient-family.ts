import type { AuthUser } from "./auth-state";

/**
 * A family owner is a patient account registered as its own guardian (not a
 * dependent). Only a guardian can add family members or send activation
 * invites — dependents manage their own profile, and an "Individual Patient"
 * account never gets a family ledger.
 */
export const isFamilyOwner = (user?: AuthUser | null): boolean =>
  Boolean(
    user &&
      Array.isArray(user.roles) &&
      user.roles.includes("patient") &&
      !user.guardianId &&
      (user.accountType === "guardian" || user.guardianRelationship === "guardian"),
  );
