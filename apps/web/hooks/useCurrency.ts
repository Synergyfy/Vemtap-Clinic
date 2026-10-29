import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listCurrencies,
  getBaseCurrency,
  getCurrencyStats,
  getCurrencyById,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  convertAmount,
  type CurrencyConfig,
  type CreateCurrencyConfigDto,
  type UpdateCurrencyConfigDto,
  type CurrencyConfigQueryDto,
  type CurrencyCode,
  type CurrencyStats,
} from "@/services/currency.service";

export const CURRENCY_KEYS = {
  all: ["currency"] as const,
  list: (clinicId: string, query?: Record<string, any>) =>
    ["currency", "list", clinicId, query] as const,
  base: (clinicId: string) => ["currency", "base", clinicId] as const,
  stats: (clinicId: string) => ["currency", "stats", clinicId] as const,
  detail: (id: string) => ["currency", "detail", id] as const,
};

// ─── Queries ───

export function useCurrencies(query?: Omit<CurrencyConfigQueryDto, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useQuery({
    queryKey: CURRENCY_KEYS.list(clinicId, query),
    queryFn: () => listCurrencies({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function useBaseCurrency() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useQuery({
    queryKey: CURRENCY_KEYS.base(clinicId),
    queryFn: () => getBaseCurrency(clinicId),
    enabled: !!clinicId,
  });
}

export function useCurrencyStats() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useQuery({
    queryKey: CURRENCY_KEYS.stats(clinicId),
    queryFn: () => getCurrencyStats(clinicId),
    enabled: !!clinicId,
  });
}

export function useCurrency(id?: string) {
  return useQuery({
    queryKey: CURRENCY_KEYS.detail(id ?? ""),
    queryFn: () => getCurrencyById(id!),
    enabled: !!id,
  });
}

// ─── Mutations ───

export function useCreateCurrency() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useMutation({
    mutationFn: (dto: Omit<CreateCurrencyConfigDto, "clinicId"> & { clinicId?: string }) =>
      createCurrency({ ...dto, clinicId: dto.clinicId || clinicId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CURRENCY_KEYS.all });
    },
  });
}

export function useUpdateCurrency() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCurrencyConfigDto }) =>
      updateCurrency(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CURRENCY_KEYS.all });
    },
  });
}

export function useDeleteCurrency() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCurrency(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CURRENCY_KEYS.all });
    },
  });
}

export function useConvertAmount() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  return useMutation({
    mutationFn: ({
      amount,
      from,
      to,
      targetClinicId,
    }: {
      amount: number;
      from: string;
      to: string;
      targetClinicId?: string;
    }) => convertAmount(amount, from, to, targetClinicId || clinicId),
  });
}

export type {
  CurrencyConfig,
  CreateCurrencyConfigDto,
  UpdateCurrencyConfigDto,
  CurrencyConfigQueryDto,
  CurrencyCode,
  CurrencyStats,
};
