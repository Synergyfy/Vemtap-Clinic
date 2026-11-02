import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listDrugs, createDrug, updateDrug, deleteDrug, getLowStockDrugs,
  dispenseDrug, deductStock, restockDrug,
  type Drug, type CreateDrugData, type UpdateDrugData,
  type DrugQueryParams,
} from "@/services/drugs.service";

const DRUGS_KEYS = {
  all: (clinicId: string) => ["drugs", clinicId] as const,
  lowStock: (clinicId: string) => ["drugs", "low-stock", clinicId] as const,
  list: (clinicId: string, params: DrugQueryParams) => ["drugs", "list", clinicId, params] as const,
  detail: (id: string) => ["drugs", id] as const,
};

export function useDrugs(params: DrugQueryParams = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: DRUGS_KEYS.list(user?.clinicId ?? "", params),
    queryFn: () => listDrugs({ ...params, clinicId: user!.clinicId }),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useDrug(id: string | null) {
  return useQuery({
    queryKey: DRUGS_KEYS.detail(id ?? ""),
    queryFn: () => import("@/services/drugs.service").then(m => m.getDrug(id!)),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useLowStockDrugs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: DRUGS_KEYS.lowStock(user?.clinicId ?? ""),
    queryFn: () => import("@/services/drugs.service").then(m => m.getLowStockDrugs(user!.clinicId)),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useCreateDrug() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateDrugData, "clinicId">) =>
      import("@/services/drugs.service").then(m => m.createDrug({ ...dto, clinicId: user!.clinicId })),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: DRUGS_KEYS.all(user.clinicId) });
    },
  });
}

export function useUpdateDrug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDrugData }) =>
      import("@/services/drugs.service").then(m => m.updateDrug(id, dto)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
    },
  });
}

export function useDeleteDrug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      import("@/services/drugs.service").then(m => m.deleteDrug(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
    },
  });
}

export function useDispenseDrug() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateDrugData, "clinicId"> & { drugId: string; patientId: string; quantityDispensed: number; notes?: string }) =>
      import("@/services/drugs.service").then(m => m.dispenseDrug({ ...dto, clinicId: user!.clinicId })),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: DRUGS_KEYS.all(user.clinicId) });
    },
  });
}

export function useDeductStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      import("@/services/drugs.service").then(m => m.deductStock(id, quantity)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
    },
  });
}

export function useRestockDrug() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      import("@/services/drugs.service").then(m => m.restockDrug(id, quantity)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["drugs"] });
    },
  });
}

export function useLowStockDrugsList() {
  const { user } = useAuth();
  return useQuery({
    queryKey: DRUGS_KEYS.lowStock(user?.clinicId ?? ""),
    queryFn: () => import("@/services/drugs.service").then(m => m.getLowStockDrugs(user!.clinicId)),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export type { Drug, DrugQueryParams, CreateDrugData, UpdateDrugData };