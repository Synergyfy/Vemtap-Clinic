import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { listCurrencies, getBaseCurrency, createCurrency, updateCurrency, convertAmount } from "@/services/currency.service";

const CURRENCY_KEYS = {
  all: (clinicId: string) => ["currency", clinicId] as const,
  base: (clinicId: string) => ["currency", "base", clinicId] as const,
};

export function useCurrencies() {
  const { user } = useAuth();
  return useQuery({
    queryKey: CURRENCY_KEYS.all(user?.clinicId ?? ""),
    queryFn: () => listCurrencies(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useBaseCurrency() {
  const { user } = useAuth();
  return useQuery({
    queryKey: CURRENCY_KEYS.base(user?.clinicId ?? ""),
    queryFn: () => getBaseCurrency(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateCurrency() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { code: string; name: string; symbol: string; exchangeRate: number; isBase?: boolean }) =>
      createCurrency({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: CURRENCY_KEYS.all(user.clinicId) }); },
  });
}

export function useUpdateCurrency() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { exchangeRate?: number; isBase?: boolean } }) => updateCurrency(id, dto),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: CURRENCY_KEYS.all(user.clinicId) }); },
  });
}

export function useConvertAmount() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ amount, from, to }: { amount: number; from: string; to: string }) =>
      convertAmount(amount, from, to, user!.clinicId),
  });
}
