'use client';

import { useQuery } from '@tanstack/react-query';
import {
  patientDashboardService,
  Appointment,
  LensOrder,
} from '@/services/patient-dashboard.service';

const PATIENT_DASHBOARD_KEY = 'patient-dashboard';

export function usePatientAppointments(patientId: string | null, clinicId: string | null) {
  return useQuery({
    queryKey: [PATIENT_DASHBOARD_KEY, 'appointments', patientId, clinicId],
    queryFn: () => patientDashboardService.getAppointments(patientId!, clinicId!),
    enabled: !!patientId && !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function usePatientLensOrders(patientId: string | null, clinicId: string | null) {
  return useQuery({
    queryKey: [PATIENT_DASHBOARD_KEY, 'lens-orders', patientId, clinicId],
    queryFn: () => patientDashboardService.getLensOrders(patientId!, clinicId!),
    enabled: !!patientId && !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export type { Appointment, LensOrder };
