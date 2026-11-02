import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listDebtors,
  getDebtor,
  createDebtor,
  updateDebtor,
  deleteDebtor,
  getDebtorStats,
  getAgingReport,
  recalculateDebtors,
  createPaymentPlan,
  listPaymentPlans,
  getPaymentPlan,
  updatePaymentPlan,
  createCollectionActivity,
  listCollectionActivities,
  updateCollectionActivity,
  type CreateDebtorDto,
  type UpdateDebtorDto,
  type DebtorQuery,
  type AgingReportQuery,
  type CreatePaymentPlanDto,
  type UpdatePaymentPlanDto,
  type PaymentPlanQuery,
  type CreateCollectionActivityDto,
  type UpdateCollectionActivityDto,
  type CollectionActivityQuery,
  type Debtor,
  type PaymentPlan,
  type CollectionActivity,
  type DebtorStats,
  type AgingReportItem,
  type DebtorType,
  type DebtorStatus,
  type PaymentPlanStatus,
  type CollectionActivityType,
  type CollectionOutcome,
} from "@/services/debtors.service";

export type {
  CreateDebtorDto,
  UpdateDebtorDto,
  DebtorQuery,
  AgingReportQuery,
  CreatePaymentPlanDto,
  UpdatePaymentPlanDto,
  PaymentPlanQuery,
  CreateCollectionActivityDto,
  UpdateCollectionActivityDto,
  CollectionActivityQuery,
  Debtor,
  PaymentPlan,
  CollectionActivity,
  DebtorStats,
  AgingReportItem,
  DebtorType,
  DebtorStatus,
  PaymentPlanStatus,
  CollectionActivityType,
  CollectionOutcome,
};

export const DEBTOR_KEYS = {
  all: ["debtors"] as const,
  list: (clinicId?: string, query?: Partial<DebtorQuery>) =>
    ["debtors", "list", clinicId, query] as const,
  detail: (id?: string) => ["debtors", "detail", id] as const,
  stats: (clinicId?: string) => ["debtors", "stats", clinicId] as const,
  aging: (clinicId?: string, query?: Partial<AgingReportQuery>) =>
    ["debtors", "aging", clinicId, query] as const,
  plans: (clinicId?: string, query?: Partial<PaymentPlanQuery>) =>
    ["debtors", "plans", clinicId, query] as const,
  planDetail: (id?: string) => ["debtors", "plan-detail", id] as const,
  activities: (clinicId?: string, query?: Partial<CollectionActivityQuery>) =>
    ["debtors", "activities", clinicId, query] as const,
};

// ========== Debtors Hooks ==========

export function useDebtors(query?: Omit<DebtorQuery, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId;

  return useQuery({
    queryKey: DEBTOR_KEYS.list(clinicId, query),
    queryFn: () => listDebtors({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function useDebtor(id?: string) {
  return useQuery({
    queryKey: DEBTOR_KEYS.detail(id),
    queryFn: () => getDebtor(id!),
    enabled: !!id,
  });
}

export function useDebtorStats() {
  const { user } = useAuth();
  const clinicId = user?.clinicId;

  return useQuery({
    queryKey: DEBTOR_KEYS.stats(clinicId),
    queryFn: () => getDebtorStats(clinicId!),
    enabled: !!clinicId,
  });
}

export function useAgingReport(query?: Omit<AgingReportQuery, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId;

  return useQuery({
    queryKey: DEBTOR_KEYS.aging(clinicId, query),
    queryFn: () => getAgingReport({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function useCreateDebtor() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: CreateDebtorDto) => {
      if (!user?.clinicId) throw new Error("Clinic ID not found");
      return createDebtor(dto, user.clinicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.all });
    },
  });
}

export function useUpdateDebtor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDebtorDto }) =>
      updateDebtor(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.detail(id) });
    },
  });
}

export function useDeleteDebtor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDebtor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.all });
    },
  });
}

export function useRecalculateDebtors() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (asOfDate?: string) => {
      if (!user?.clinicId) throw new Error("Clinic ID not found");
      return recalculateDebtors(user.clinicId, asOfDate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.all });
    },
  });
}

// ========== Payment Plan Hooks ==========

export function usePaymentPlans(query?: Omit<PaymentPlanQuery, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId;

  return useQuery({
    queryKey: DEBTOR_KEYS.plans(clinicId, query),
    queryFn: () => listPaymentPlans({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function usePaymentPlan(id?: string) {
  return useQuery({
    queryKey: DEBTOR_KEYS.planDetail(id),
    queryFn: () => getPaymentPlan(id!),
    enabled: !!id,
  });
}

export function useCreatePaymentPlan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: CreatePaymentPlanDto) => {
      if (!user?.clinicId) throw new Error("Clinic ID not found");
      return createPaymentPlan(dto, user.clinicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.all });
    },
  });
}

export function useUpdatePaymentPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePaymentPlanDto }) =>
      updatePaymentPlan(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.planDetail(id) });
    },
  });
}

// ========== Collection Activity Hooks ==========

export function useCollectionActivities(query?: Omit<CollectionActivityQuery, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId;

  return useQuery({
    queryKey: DEBTOR_KEYS.activities(clinicId, query),
    queryFn: () => listCollectionActivities({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function useCreateCollectionActivity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: CreateCollectionActivityDto) => {
      if (!user?.clinicId) throw new Error("Clinic ID not found");
      return createCollectionActivity(dto, user.clinicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.all });
    },
  });
}

export function useUpdateCollectionActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCollectionActivityDto }) =>
      updateCollectionActivity(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEBTOR_KEYS.all });
    },
  });
}
