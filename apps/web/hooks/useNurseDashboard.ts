'use client';

import { useQuery } from '@tanstack/react-query';
import {
  nurseDashboardService,
  ObservationNote,
  QueueEntry,
  Appointment,
} from '@/services/nurse-dashboard.service';

const NURSE_DASHBOARD_KEY = 'nurse-dashboard';

export function useNurseObservationNotes(staffId: string | null, clinicId: string | null) {
  return useQuery({
    queryKey: [NURSE_DASHBOARD_KEY, 'observation-notes', staffId, clinicId],
    queryFn: () => nurseDashboardService.getObservationNotes(staffId!, clinicId!),
    enabled: !!staffId && !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function useNurseQueue(clinicId: string | null) {
  return useQuery({
    queryKey: [NURSE_DASHBOARD_KEY, 'queue', clinicId],
    queryFn: () => nurseDashboardService.getQueueEntries(clinicId!),
    enabled: !!clinicId,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchInterval: 30_000,
  });
}

export function useNurseAssignedAppointments(staffId: string | null, clinicId: string | null) {
  return useQuery({
    queryKey: [NURSE_DASHBOARD_KEY, 'assigned', staffId, clinicId],
    queryFn: () => nurseDashboardService.getAssignedAppointments(staffId!, clinicId!),
    enabled: !!staffId && !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 60_000,
  });
}

export function useNurseFollowUps(staffId: string | null, clinicId: string | null) {
  return useQuery({
    queryKey: [NURSE_DASHBOARD_KEY, 'follow-ups', staffId, clinicId],
    queryFn: () => nurseDashboardService.getFollowUps(staffId!, clinicId!),
    enabled: !!staffId && !!clinicId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export type { ObservationNote, QueueEntry, Appointment };
