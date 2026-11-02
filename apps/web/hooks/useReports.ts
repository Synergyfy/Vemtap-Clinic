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

export function useRevenueSummary(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";
  return useQuery({
    queryKey: REPORTS_KEYS.revenue(targetClinicId),
    queryFn: () => getRevenueSummary(targetClinicId),
    enabled: !!targetClinicId,
  });
}

export function useStaffKPIs(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";
  return useQuery({
    queryKey: REPORTS_KEYS.staffKPIs(targetClinicId),
    queryFn: () => getStaffKPIs(targetClinicId),
    enabled: !!targetClinicId,
  });
}

export function useQueueAnalytics(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";
  return useQuery({
    queryKey: REPORTS_KEYS.queue(targetClinicId),
    queryFn: () => getQueueAnalytics(targetClinicId),
    enabled: !!targetClinicId,
  });
}

export function useAppointmentTrends(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";
  return useQuery({
    queryKey: REPORTS_KEYS.appointments(targetClinicId),
    queryFn: () => getAppointmentTrends(targetClinicId),
    enabled: !!targetClinicId,
  });
}

export function useOpticalAnalytics(clinicId?: string) {
  const { user } = useAuth();
  const targetClinicId = clinicId || user?.clinicId || "";
  return useQuery({
    queryKey: REPORTS_KEYS.optical(targetClinicId),
    queryFn: () => getOpticalAnalytics(targetClinicId),
    enabled: !!targetClinicId,
  });
}

