import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary,
  type CreateExpenseData, type UpdateExpenseData,
} from "@/services/finance.service";

const FINANCE_KEYS = {
  expenses: (clinicId: string) => ["finance", "expenses", clinicId] as const,
  summary: (clinicId: string) => ["finance", "summary", clinicId] as const,
};

export function useExpenses(filters?: { category?: string; status?: string; startDate?: string; endDate?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...FINANCE_KEYS.expenses(user?.clinicId ?? ""), filters],
    queryFn: () => listExpenses({ clinicId: user!.clinicId, ...filters }),
    enabled: !!user?.clinicId,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateExpenseData, "clinicId">) =>
      createExpense({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: FINANCE_KEYS.expenses(user.clinicId) });
        qc.invalidateQueries({ queryKey: FINANCE_KEYS.summary(user.clinicId) });
      }
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateExpenseData }) => updateExpense(id, dto),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: FINANCE_KEYS.expenses(user.clinicId) });
        qc.invalidateQueries({ queryKey: FINANCE_KEYS.summary(user.clinicId) });
      }
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: FINANCE_KEYS.expenses(user.clinicId) });
        qc.invalidateQueries({ queryKey: FINANCE_KEYS.summary(user.clinicId) });
      }
    },
  });
}

export function useExpenseSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: FINANCE_KEYS.summary(user?.clinicId ?? ""),
    queryFn: () => getExpenseSummary(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}
