'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cashierService } from '@/services/cashier.service';
import { useAuth } from '@/lib/auth-context';

const CASHIER_KEY = 'cashier';

export function useCashierShifts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [CASHIER_KEY, 'shifts', user?.clinicId],
    queryFn: () => cashierService.getShifts({ clinicId: user!.clinicId }),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useOpenShift() {
  return useQuery({
    queryKey: [CASHIER_KEY, 'shifts', 'open'],
    queryFn: async () => null,
    enabled: false,
  });
}

export function useActiveShift() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [CASHIER_KEY, 'shifts', 'open', user?.userId],
    queryFn: () => cashierService.getOpenShift(user!.userId),
    enabled: !!user?.userId,
    staleTime: 10_000,
    retry: false,
  });
}

export function useOpenShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cashierService.openShift,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'shifts'] });
    },
  });
}

export function useCloseShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, closingBalance }: { id: string; closingBalance: number }) =>
      cashierService.closeShift(id, { closingBalance }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'shifts'] });
    },
  });
}

export function useDailySummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [CASHIER_KEY, 'daily-summary', user?.clinicId],
    queryFn: () => cashierService.getDailySummary(user!.clinicId),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useCashierTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [CASHIER_KEY, 'transactions', user?.clinicId],
    queryFn: () => cashierService.getTransactions(user!.clinicId),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useTransactionStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [CASHIER_KEY, 'transactions', 'stats', user?.clinicId],
    queryFn: () => cashierService.getTransactionStats(user!.clinicId),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useCompleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cashierService.completeTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'transactions'] });
      qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'daily-summary'] });
      qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'shifts'] });
    },
  });
}

export function useVoidTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cashierService.voidTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'transactions'] });
    },
  });
}

export function useCashierProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [CASHIER_KEY, 'products', user?.clinicId],
    queryFn: () => cashierService.getProducts(user!.clinicId),
    enabled: !!user?.clinicId,
    staleTime: 60_000,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cashierService.createProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; name?: string; category?: string; unitPrice?: number }) =>
      cashierService.updateProduct(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cashierService.deleteProduct,
    onSuccess: () => qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'products'] }),
  });
}
