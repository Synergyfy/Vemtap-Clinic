'use client';

import { useQuery } from '@tanstack/react-query';
import {
  pharmacyDashboardService,
  Drug,
  TransferRequest,
} from '@/services/pharmacy-dashboard.service';

const PHARMACY_DASHBOARD_KEY = 'pharmacy-dashboard';

export function usePharmacyDrugs(clinicId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_DASHBOARD_KEY, 'drugs', clinicId],
    queryFn: () => pharmacyDashboardService.getDrugs(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function usePharmacyLowStock(clinicId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_DASHBOARD_KEY, 'low-stock', clinicId],
    queryFn: () => pharmacyDashboardService.getLowStockDrugs(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function usePharmacyPendingTransfers(clinicId: string | null) {
  return useQuery({
    queryKey: [PHARMACY_DASHBOARD_KEY, 'pending-transfers', clinicId],
    queryFn: () => pharmacyDashboardService.getPendingDrugTransfers(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export type { Drug, TransferRequest };
