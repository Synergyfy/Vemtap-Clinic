'use client';

import { useQuery } from '@tanstack/react-query';
import {
  opticianDashboardService,
  LensOrder,
  OpticalInventoryItem,
  OpticalSale,
} from '@/services/optician-dashboard.service';

const OPTICIAN_DASHBOARD_KEY = 'optician-dashboard';

export function useOpticianLensOrders(clinicId: string | null) {
  return useQuery({
    queryKey: [OPTICIAN_DASHBOARD_KEY, 'lens-orders', clinicId],
    queryFn: () => opticianDashboardService.getLensOrders(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function useOpticianInventory(clinicId: string | null) {
  return useQuery({
    queryKey: [OPTICIAN_DASHBOARD_KEY, 'inventory', clinicId],
    queryFn: () => opticianDashboardService.getInventory(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function useOpticianSales(clinicId: string | null) {
  return useQuery({
    queryKey: [OPTICIAN_DASHBOARD_KEY, 'sales', clinicId],
    queryFn: () => opticianDashboardService.getSales(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export type { LensOrder, OpticalInventoryItem, OpticalSale };
