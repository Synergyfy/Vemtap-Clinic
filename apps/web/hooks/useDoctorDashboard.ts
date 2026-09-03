'use client';

import { useQuery } from '@tanstack/react-query';
import {
  doctorDashboardService,
  MedicalRecord,
  FollowUp,
} from '@/services/doctor-dashboard.service';
import { Appointment } from '@/services/appointments.service';

const DOCTOR_DASHBOARD_KEY = 'doctor-dashboard';

export function useDoctorTodayAppointments(staffId: string | null, clinicId: string | null) {
  return useQuery({
    queryKey: [DOCTOR_DASHBOARD_KEY, 'today-appointments', staffId, clinicId],
    queryFn: () => doctorDashboardService.getTodayAppointments(staffId!, clinicId!),
    enabled: !!staffId && !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function useDoctorConsultationQueue(clinicId: string | null) {
  return useQuery({
    queryKey: [DOCTOR_DASHBOARD_KEY, 'queue', clinicId],
    queryFn: () => doctorDashboardService.getConsultationQueue(clinicId!),
    enabled: !!clinicId,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchInterval: 30_000,
  });
}

export function useDoctorRecentRecords(staffId: string | null, clinicId: string | null) {
  return useQuery({
    queryKey: [DOCTOR_DASHBOARD_KEY, 'recent-records', staffId, clinicId],
    queryFn: () => doctorDashboardService.getRecentRecords(staffId!, clinicId!),
    enabled: !!staffId && !!clinicId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export function useDoctorFollowUps(staffId: string | null, clinicId: string | null) {
  return useQuery({
    queryKey: [DOCTOR_DASHBOARD_KEY, 'follow-ups', staffId, clinicId],
    queryFn: () => doctorDashboardService.getFollowUps(staffId!, clinicId!),
    enabled: !!staffId && !!clinicId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export type { Appointment, MedicalRecord, FollowUp };
