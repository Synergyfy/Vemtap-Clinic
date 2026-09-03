import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listDebtors, getDebtorStats, getAgingReport, createDebtor, updateDebtor, deleteDebtor,
  recalculateDebtors, listPaymentPlans, createPaymentPlan,
} from "@/services/debtors.service";

const DEBTOR_KEYS = {
  all: (clinicId: string) => ["debtors", clinicId] as const,
  stats: (clinicId: string) => ["debtors", "stats", clinicId] as const,
  aging: (clinicId: string) => ["debtors", "aging", clinicId] as const,
  plans: (clinicId: string) => ["debtors", "plans", clinicId] as const,
};

export function useDebtors(filters?: { status?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...DEBTOR_KEYS.all(user?.clinicId ?? ""), filters],
    queryFn: () => listDebtors(user!.clinicId, filters),
    enabled: !!user?.clinicId,
  });
}

export function useDebtorStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: DEBTOR_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getDebtorStats(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useAgingReport() {
  const { user } = useAuth();
  return useQuery({
    queryKey: DEBTOR_KEYS.aging(user?.clinicId ?? ""),
    queryFn: () => getAgingReport(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateDebtor() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { patientId: string; invoiceId: string; totalAmount: number; dueDate?: string; notes?: string }) =>
      createDebtor({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: DEBTOR_KEYS.all(user.clinicId) }); },
  });
}

export function useUpdateDebtor() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { status?: string; notes?: string } }) => updateDebtor(id, dto),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: DEBTOR_KEYS.all(user.clinicId) }); },
  });
}

export function useRecalculateDebtors() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: () => recalculateDebtors(user!.clinicId),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: DEBTOR_KEYS.all(user.clinicId) }); },
  });
}

export function usePaymentPlans() {
  const { user } = useAuth();
  return useQuery({
    queryKey: DEBTOR_KEYS.plans(user?.clinicId ?? ""),
    queryFn: () => listPaymentPlans(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreatePaymentPlan() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { debtorId: string; totalAmount: number; installmentAmount: number; frequency: string }) =>
      createPaymentPlan({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: DEBTOR_KEYS.plans(user.clinicId) }); },
  });
}
