import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listHmoIntegrations,
  getHmoIntegrationById,
  getHmoIntegrationStats,
  createHmoIntegration,
  updateHmoIntegration,
  deleteHmoIntegration,
  testHmoIntegration,
  checkHmoEligibility,
  submitClaimToHmo,
  checkHmoClaimStatus,
  parseHmoRemittance,
  listHmoApiLogs,
  getHmoApiLogById,
  type HmoIntegrationQueryDto,
  type CreateHmoIntegrationDto,
  type UpdateHmoIntegrationDto,
  type TestIntegrationDto,
  type EligibilityCheckDto,
  type ClaimSubmissionDto,
  type RemittanceParseDto,
  type HmoApiLogQueryDto,
} from "@/services/hmo-integrations.service";

export const HMO_INTEGRATION_KEYS = {
  all: ["hmo-integrations"] as const,
  list: (clinicId: string, filters?: Record<string, any>) =>
    ["hmo-integrations", "list", clinicId, filters] as const,
  detail: (id: string) => ["hmo-integrations", "detail", id] as const,
  stats: (clinicId: string) => ["hmo-integrations", "stats", clinicId] as const,
  logs: (clinicId: string, filters?: Record<string, any>) =>
    ["hmo-integrations", "logs", clinicId, filters] as const,
  logDetail: (id: string) => ["hmo-integrations", "log-detail", id] as const,
};

// ─── Queries ───

export function useHmoIntegrations(query?: Omit<HmoIntegrationQueryDto, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useQuery({
    queryKey: HMO_INTEGRATION_KEYS.list(clinicId, query),
    queryFn: () => listHmoIntegrations({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function useHmoIntegration(id?: string) {
  return useQuery({
    queryKey: HMO_INTEGRATION_KEYS.detail(id ?? ""),
    queryFn: () => getHmoIntegrationById(id!),
    enabled: !!id,
  });
}

export function useHmoIntegrationStats() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useQuery({
    queryKey: HMO_INTEGRATION_KEYS.stats(clinicId),
    queryFn: () => getHmoIntegrationStats(clinicId),
    enabled: !!clinicId,
  });
}

export function useHmoApiLogs(query?: Omit<HmoApiLogQueryDto, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useQuery({
    queryKey: HMO_INTEGRATION_KEYS.logs(clinicId, query),
    queryFn: () => listHmoApiLogs({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function useHmoApiLog(id?: string) {
  return useQuery({
    queryKey: HMO_INTEGRATION_KEYS.logDetail(id ?? ""),
    queryFn: () => getHmoApiLogById(id!),
    enabled: !!id,
  });
}

// ─── Mutations ───

export function useCreateHmoIntegration() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useMutation({
    mutationFn: (dto: CreateHmoIntegrationDto) =>
      createHmoIntegration(dto, clinicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hmo-integrations"] });
    },
  });
}

export function useUpdateHmoIntegration() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateHmoIntegrationDto }) =>
      updateHmoIntegration(id, dto),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["hmo-integrations"] });
      qc.invalidateQueries({
        queryKey: HMO_INTEGRATION_KEYS.detail(variables.id),
      });
    },
  });
}

export function useDeleteHmoIntegration() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteHmoIntegration(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hmo-integrations"] });
    },
  });
}

export function useTestHmoIntegration() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: TestIntegrationDto }) =>
      testHmoIntegration(id, dto),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["hmo-integrations"] });
      qc.invalidateQueries({
        queryKey: HMO_INTEGRATION_KEYS.detail(variables.id),
      });
    },
  });
}

export function useCheckHmoEligibility() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: EligibilityCheckDto }) =>
      checkHmoEligibility(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hmo-integrations", "logs"] });
    },
  });
}

export function useSubmitClaimToHmo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ClaimSubmissionDto }) =>
      submitClaimToHmo(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hmo-integrations", "logs"] });
    },
  });
}

export function useCheckHmoClaimStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, claimId }: { id: string; claimId: string }) =>
      checkHmoClaimStatus(id, claimId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hmo-integrations", "logs"] });
    },
  });
}

export function useParseHmoRemittance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RemittanceParseDto }) =>
      parseHmoRemittance(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hmo-integrations", "logs"] });
    },
  });
}
