import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  getRevenueSummary,
  getStaffKPIs,
  getQueueAnalytics,
  getAppointmentTrends,
  getOpticalAnalytics,
  type RevenueSummary,
  type StaffKPI,
  type QueueAnalytics,
  type AppointmentTrends,
  type OpticalAnalytics,
} from "@/services/analytics.service";

export const ANALYTICS_KEYS = {
  all: ["analytics"] as const,
  revenue: (clinicId: string) => ["analytics", "revenue", clinicId] as const,
  staffKPIs: (clinicId: string) => ["analytics", "staff-kpis", clinicId] as const,
  queue: (clinicId: string) => ["analytics", "queue", clinicId] as const,
  appointmentTrends: (clinicId: string) => ["analytics", "appointment-trends", clinicId] as const,
  optical: (clinicId: string) => ["analytics", "optical", clinicId] as const,
};

export function useRevenueSummary(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";

  return useQuery<RevenueSummary>({
    queryKey: ANALYTICS_KEYS.revenue(targetClinicId),
    queryFn: () => getRevenueSummary(targetClinicId),
    enabled: !!targetClinicId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useStaffKPIs(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";

  return useQuery<StaffKPI[]>({
    queryKey: ANALYTICS_KEYS.staffKPIs(targetClinicId),
    queryFn: () => getStaffKPIs(targetClinicId),
    enabled: !!targetClinicId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useQueueAnalytics(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";

  return useQuery<QueueAnalytics>({
    queryKey: ANALYTICS_KEYS.queue(targetClinicId),
    queryFn: () => getQueueAnalytics(targetClinicId),
    enabled: !!targetClinicId,
    staleTime: 1000 * 30, // 30 seconds for live queue activity
  });
}

export function useAppointmentTrends(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";

  return useQuery<AppointmentTrends>({
    queryKey: ANALYTICS_KEYS.appointmentTrends(targetClinicId),
    queryFn: () => getAppointmentTrends(targetClinicId),
    enabled: !!targetClinicId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useOpticalAnalytics(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";

  return useQuery<OpticalAnalytics>({
    queryKey: ANALYTICS_KEYS.optical(targetClinicId),
    queryFn: () => getOpticalAnalytics(targetClinicId),
    enabled: !!targetClinicId,
    staleTime: 1000 * 60 * 2,
  });
}
