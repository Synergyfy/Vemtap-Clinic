'use client';

import { useQuery } from '@tanstack/react-query';
import {
  dashboardService,
  DashboardOverview,
  RevenueReportEntry,
  AppointmentAnalytics,
  HMOAnalytics,
} from '@/services/dashboard.service';

const DASHBOARD_QUERY_KEY = 'dashboard';

export function useDashboardOverview(clinicId: string | null) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'overview', clinicId],
    queryFn: () => dashboardService.getOverview(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function useDashboardRevenue(clinicId: string | null, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'revenue', clinicId, startDate, endDate],
    queryFn: () => dashboardService.getRevenue(clinicId!, startDate, endDate),
    enabled: !!clinicId && !!startDate && !!endDate,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export function useDashboardAppointmentAnalytics(clinicId: string | null, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'appointments', clinicId, startDate, endDate],
    queryFn: () => dashboardService.getAppointmentAnalytics(clinicId!, startDate, endDate),
    enabled: !!clinicId && !!startDate && !!endDate,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export function useDashboardHMOAnalytics(clinicId: string | null) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, 'hmo', clinicId],
    queryFn: () => dashboardService.getHMOAnalytics(clinicId!),
    enabled: !!clinicId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export type {
  DashboardOverview,
  RevenueReportEntry,
  AppointmentAnalytics,
  HMOAnalytics,
};
