import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listInvoices, createInvoice, makePayment,
  type Invoice, type CreateInvoiceData, type CreatePaymentData,
} from "@/services/billing.service";

const BILLING_KEYS = {
  invoices: (clinicId: string) => ["billing", "invoices", clinicId] as const,
  invoice: (id: string) => ["billing", "invoice", id] as const,
  revenue: (clinicId: string) => ["billing", "revenue", clinicId] as const,
};

export function useInvoices(patientId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...BILLING_KEYS.invoices(user?.clinicId ?? ""), patientId],
    queryFn: () => listInvoices(user!.clinicId, patientId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateInvoiceData, "clinicId">) =>
      createInvoice({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices(user.clinicId) });
    },
  });
}

export function useMakePayment() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreatePaymentData, "clinicId">) =>
      makePayment({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: BILLING_KEYS.invoices(user.clinicId) });
    },
  });
}

export function useRevenue() {
  const { user } = useAuth();
  return useQuery({
    queryKey: BILLING_KEYS.revenue(user?.clinicId ?? ""),
    queryFn: () => listInvoices(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}
