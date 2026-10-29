import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listExpenses,
  getExpenseSummary,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  type Expense,
  type CreateExpenseDto,
  type UpdateExpenseDto,
  type ExpenseQueryDto,
  type ExpenseSummary,
  type ExpenseCategory,
  type ExpenseStatus,
} from "@/services/expenses.service";

export const EXPENSES_KEYS = {
  all: ["expenses"] as const,
  list: (clinicId: string, filters?: Record<string, any>) =>
    ["expenses", "list", clinicId, filters] as const,
  summary: (clinicId: string) => ["expenses", "summary", clinicId] as const,
  detail: (id: string) => ["expenses", "detail", id] as const,
};

// ─── Queries ───

export function useExpenses(query?: Omit<ExpenseQueryDto, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useQuery({
    queryKey: EXPENSES_KEYS.list(clinicId, query),
    queryFn: () => listExpenses({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function useExpenseSummary() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useQuery({
    queryKey: EXPENSES_KEYS.summary(clinicId),
    queryFn: () => getExpenseSummary(clinicId),
    enabled: !!clinicId,
  });
}

export function useExpense(id?: string) {
  return useQuery({
    queryKey: EXPENSES_KEYS.detail(id ?? ""),
    queryFn: () => getExpenseById(id!),
    enabled: !!id,
  });
}

// ─── Mutations ───

export function useCreateExpense() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useMutation({
    mutationFn: (dto: Omit<CreateExpenseDto, "clinicId"> & { clinicId?: string }) =>
      createExpense({ ...dto, clinicId: dto.clinicId || clinicId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSES_KEYS.all });
      qc.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateExpenseDto }) =>
      updateExpense(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSES_KEYS.all });
      qc.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: EXPENSES_KEYS.all });
      qc.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export type {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseQueryDto,
  ExpenseSummary,
  ExpenseCategory,
  ExpenseStatus,
};
