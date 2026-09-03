import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  getRevenueSummary, getStaffKPIs, getQueueAnalytics,
  getAppointmentTrends, getOpticalAnalytics,
} from "@/services/reports.service";

const REPORTS_KEYS = {
  revenue: (clinicId: string) => ["reports", "revenue", clinicId] as const,
  staffKPIs: (clinicId: string) => ["reports", "staff-kpis", clinicId] as const,
  queue: (clinicId: string) => ["reports", "queue", clinicId] as const,
  appointments: (clinicId: string) => ["reports", "appointments", clinicId] as const,
  optical: (clinicId: string) => ["reports", "optical", clinicId] as const,
};

export function useRevenueSummary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: REPORTS_KEYS.revenue(user?.clinicId ?? ""),
    queryFn: () => getRevenueSummary(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useStaffKPIs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: REPORTS_KEYS.staffKPIs(user?.clinicId ?? ""),
    queryFn: () => getStaffKPIs(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useQueueAnalytics() {
  const { user } = useAuth();
  return useQuery({
    queryKey: REPORTS_KEYS.queue(user?.clinicId ?? ""),
    queryFn: () => getQueueAnalytics(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useAppointmentTrends() {
  const { user } = useAuth();
  return useQuery({
    queryKey: REPORTS_KEYS.appointments(user?.clinicId ?? ""),
    queryFn: () => getAppointmentTrends(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useOpticalAnalytics() {
  const { user } = useAuth();
  return useQuery({
    queryKey: REPORTS_KEYS.optical(user?.clinicId ?? ""),
    queryFn: () => getOpticalAnalytics(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}
