'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  cashierService,
  CashierShift,
  CashierTransaction,
  CashierProduct,
  ShiftQueryParams,
  OpenShiftDto,
  CloseShiftDto,
  CompleteTransactionDto,
  CreateProductDto,
  UpdateProductDto,
} from '@/services/cashier.service';
import { useAuth } from '@/lib/auth-context';

const CASHIER_KEY = 'cashier';

export type { CashierShift, CashierTransaction, CashierProduct };

// ─── SHIFTS ──────────────────────────────────────────────────

export function useCashierShifts(params?: Omit<ShiftQueryParams, 'clinicId'>) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [CASHIER_KEY, 'shifts', user?.clinicId, params],
    queryFn: () => cashierService.getShifts({ clinicId: user!.clinicId, ...params }),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useCashierShift(id: string) {
  return useQuery({
    queryKey: [CASHIER_KEY, 'shifts', 'detail', id],
    queryFn: () => cashierService.getShift(id),
    enabled: !!id,
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
    mutationFn: (dto: OpenShiftDto) => cashierService.openShift(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'shifts'] });
    },
  });
}

export function useCloseShiftMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & CloseShiftDto) =>
      cashierService.closeShift(id, dto),
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

// ─── TRANSACTIONS ────────────────────────────────────────────

export function useCashierTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [CASHIER_KEY, 'transactions', user?.clinicId],
    queryFn: () => cashierService.getTransactions(user!.clinicId),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
  });
}

export function useCashierTransaction(id: string) {
  return useQuery({
    queryKey: [CASHIER_KEY, 'transactions', 'detail', id],
    queryFn: () => cashierService.getTransaction(id),
    enabled: !!id,
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
    mutationFn: (dto: CompleteTransactionDto) => cashierService.completeTransaction(dto),
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
    mutationFn: (id: string) => cashierService.voidTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'transactions'] });
    },
  });
}

// ─── PRODUCTS ────────────────────────────────────────────────

export function useCashierProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [CASHIER_KEY, 'products', user?.clinicId],
    queryFn: () => cashierService.getProducts(user!.clinicId),
    enabled: !!user?.clinicId,
    staleTime: 60_000,
  });
}

export function useCashierProduct(id: string) {
  return useQuery({
    queryKey: [CASHIER_KEY, 'products', 'detail', id],
    queryFn: () => cashierService.getProduct(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) => cashierService.createProduct(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & UpdateProductDto) =>
      cashierService.updateProduct(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cashierService.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CASHIER_KEY, 'products'] }),
  });
}
