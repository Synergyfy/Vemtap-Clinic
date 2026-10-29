import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listClaims, createClaim, updateClaim,
  createAppeal, updateAppeal, listAppeals,
  listRemittances, createRemittance, matchRemittance,
  getAgingReport, getHmoTotals, getHmoStats,
  listHmos, createHmo, getHmo, updateHmo,
  listPlans, createPlan, updatePlan, deletePlan,
  checkCoverage, type CoverageCheckPayload, type CoverageCheckResult,
  listAgreements, getAgreementDetail, createAgreement, updateAgreement,
  type CreateAgreementPayload,
  listAuthorizations, getPendingAuthorizations, getAuthorizationDetail, createAuthorization, updateAuthorization,
  type CreateAuthorizationPayload, type UpdateAuthorizationPayload,
  listClaimBatches, createClaimBatch, addClaimsToBatch, updateClaimBatch,
  type CreateClaimBatchPayload, type UpdateClaimBatchPayload,
  listClaimDocuments, uploadClaimDocument, deleteClaimDocument,
  type UploadClaimDocumentPayload,
  type HmoClaim, type HmoAppeal, type HmoRemittance, type HmoItem, type HmoPlan, type HmoAgreement,
  type HmoAuthorization, type ClaimBatch, type ClaimDocument,
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
  detail: (id: string) => ["hmo", "detail", id] as const,
  plans: (hmoId: string) => ["hmo", "plans", hmoId] as const,
  authorizations: (clinicId: string) => ["hmo", "authorizations", clinicId] as const,
  batches: (clinicId: string) => ["hmo", "batches", clinicId] as const,
  documents: (claimId: string) => ["hmo", "documents", claimId] as const,
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
    queryFn: () => listAppeals(user!.clinicId),
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

export function useCreateHmo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; contactPerson?: string; phone?: string; email?: string; address?: string; commissionRate?: number; clinicId: string }) =>
      createHmo(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: HMO_KEYS.list() }),
  });
}

export function useHmoDetail(id: string) {
  return useQuery({
    queryKey: HMO_KEYS.detail(id),
    queryFn: () => getHmo(id),
    enabled: !!id,
  });
}

// ─── Plans ───
export function useHmoPlans(hmoId: string) {
  return useQuery({
    queryKey: HMO_KEYS.plans(hmoId),
    queryFn: () => listPlans(hmoId),
    enabled: !!hmoId,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: { name: string; hmoId: string; description?: string; coveragePercentage: number }) =>
      createPlan(dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: HMO_KEYS.plans(variables.hmoId) });
    },
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: HMO_KEYS.all }),
  });
}

// ─── Coverage Check ───
export function useCheckCoverage() {
  return useMutation({
    mutationFn: (dto: CoverageCheckPayload) => checkCoverage(dto),
  });
}

// ─── Agreements ───
export function useHmoAgreements(hmoId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["hmo", "agreements", hmoId, user?.clinicId] as const,
    queryFn: () => listAgreements(hmoId, user?.clinicId),
    enabled: !!hmoId,
  });
}

export function useAgreementDetail(id: string) {
  return useQuery({
    queryKey: ["hmo", "agreement", id] as const,
    queryFn: () => getAgreementDetail(id),
    enabled: !!id,
  });
}

export function useCreateAgreement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateAgreementPayload, "clinicId">) =>
      createAgreement({ ...dto, clinicId: user!.clinicId }),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["hmo", "agreements", variables.hmoId] });
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.all });
    },
  });
}

export function useUpdateAgreement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateAgreementPayload> & { isActive?: boolean } }) =>
      updateAgreement(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HMO_KEYS.all });
    },
  });
}

// ─── Authorizations ───
export function useAuthorizations(filters?: { status?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...HMO_KEYS.authorizations(user?.clinicId ?? ""), filters],
    queryFn: () => listAuthorizations(user!.clinicId, filters),
    enabled: !!user?.clinicId,
  });
}

export function usePendingAuthorizations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...HMO_KEYS.authorizations(user?.clinicId ?? ""), "pending"],
    queryFn: () => getPendingAuthorizations(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useAuthorizationDetail(id: string) {
  return useQuery({
    queryKey: ["hmo", "authorization", id] as const,
    queryFn: () => getAuthorizationDetail(id),
    enabled: !!id,
  });
}

export function useCreateAuthorization() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateAuthorizationPayload, "clinicId">) =>
      createAuthorization({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.authorizations(user.clinicId) });
    },
  });
}

export function useUpdateAuthorization() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAuthorizationPayload }) =>
      updateAuthorization(id, dto),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.authorizations(user.clinicId) });
    },
  });
}

// ─── Claim Batches ───
export function useClaimBatches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: HMO_KEYS.batches(user?.clinicId ?? ""),
    queryFn: () => listClaimBatches(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateClaimBatch() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateClaimBatchPayload, "clinicId">) =>
      createClaimBatch({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.batches(user.clinicId) });
    },
  });
}

export function useAddClaimsToBatch() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, claimIds }: { id: string; claimIds: string[] }) =>
      addClaimsToBatch(id, claimIds),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: HMO_KEYS.batches(user.clinicId) });
        qc.invalidateQueries({ queryKey: HMO_KEYS.claims(user.clinicId) });
      }
    },
  });
}

export function useUpdateClaimBatch() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClaimBatchPayload }) =>
      updateClaimBatch(id, dto),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: HMO_KEYS.batches(user.clinicId) });
    },
  });
}

// ─── Claim Documents ───
export function useClaimDocuments(claimId: string) {
  return useQuery({
    queryKey: HMO_KEYS.documents(claimId),
    queryFn: () => listClaimDocuments(claimId),
    enabled: !!claimId,
  });
}

export function useUploadClaimDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UploadClaimDocumentPayload) =>
      uploadClaimDocument(dto),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: HMO_KEYS.documents(variables.claimId) });
    },
  });
}

export function useDeleteClaimDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, claimId }: { id: string; claimId: string }) =>
      deleteClaimDocument(id),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: HMO_KEYS.documents(variables.claimId) });
    },
  });
}

