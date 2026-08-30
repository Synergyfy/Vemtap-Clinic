import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listClaims, createClaim, updateClaim,
  createAppeal, updateAppeal,
  listRemittances, createRemittance, matchRemittance,
  getAgingReport, getHmoTotals, getHmoStats,
  listHmos,
  type HmoClaim, type HmoAppeal, type HmoRemittance, type HmoItem,
  type CreateClaimData, type UpdateClaimData,
  type CreateAppealData, type UpdateAppealData,
  type CreateRemittanceData, type UpdateRemittanceData,
} from "@/services/hmo.service";

const HMO_KEYS = {
  all: ["hmo"] as const,
  claims: (clinicId: string) => ["hmo", "claims", clinicId] as const,
  appeals: (clinicId: string) => ["hmo", "appeals", clinicId] as const,
  remittances: (clinicId: string) => ["hmo", "remittances", clinicId] as const,
  aging: (clinicId: string) => ["hmo", "aging", clinicId] as const,
  totals: (clinicId: string) => ["hmo", "totals", clinicId] as const,
  stats: (clinicId: string) => ["hmo", "stats", clinicId] as const,
  list: () => ["hmo", "list"] as const,
};

// ─── Claims ───
export function useHmoClaims() {
  const { user } = useAuth();
  return useQuery({
    queryKey: HMO_KEYS.claims(user?.clinicId ?? ""),
    queryFn: () => listClaims(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateClaim() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateClaimData, "clinicId">) =>
      createClaim({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.claims(user.clinicId) });
    },
  });
}

export function useUpdateClaim() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClaimData }) =>
      updateClaim(id, dto),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.claims(user.clinicId) });
    },
  });
}

// ─── Appeals ───
export function useHmoAppeals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: HMO_KEYS.appeals(user?.clinicId ?? ""),
    queryFn: async (): Promise<HmoAppeal[]> => {
      // Backend doesn't have a standalone appeals list endpoint — fetch via stats or derive from claims
      // For now, we'll rely on the claims data and filter appealed ones
      // TODO: If a dedicated appeals endpoint is added, use it here
      return [];
    },
    enabled: !!user?.clinicId,
  });
}

export function useCreateAppeal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateAppealData, "clinicId">) =>
      createAppeal({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: HMO_KEYS.appeals(user.clinicId) });
        qc.invalidateQueries({ queryKey: HMO_KEYS.claims(user.clinicId) });
      }
    },
  });
}

export function useUpdateAppeal() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAppealData }) =>
      updateAppeal(id, dto),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.appeals(user.clinicId) });
    },
  });
}

// ─── Remittances ───
export function useHmoRemittances() {
  const { user } = useAuth();
  return useQuery({
    queryKey: HMO_KEYS.remittances(user?.clinicId ?? ""),
    queryFn: () => listRemittances(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateRemittance() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateRemittanceData, "clinicId">) =>
      createRemittance({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.remittances(user.clinicId) });
    },
  });
}

export function useMatchRemittance() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, claimIds }: { id: string; claimIds: string[] }) =>
      matchRemittance(id, claimIds),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.remittances(user.clinicId) });
    },
  });
}

// ─── Reports ───
export function useAgingReport() {
  const { user } = useAuth();
  return useQuery({
    queryKey: HMO_KEYS.aging(user?.clinicId ?? ""),
    queryFn: () => getAgingReport(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useHmoTotals() {
  const { user } = useAuth();
  return useQuery({
    queryKey: HMO_KEYS.totals(user?.clinicId ?? ""),
    queryFn: () => getHmoTotals(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useHmoStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: HMO_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getHmoStats(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

// ─── HMO List ───
export function useHmoList() {
  const { user } = useAuth();
  return useQuery({
    queryKey: HMO_KEYS.list(),
    queryFn: () => listHmos(user?.clinicId),
    enabled: !!user?.clinicId,
  });
}
