'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  appointmentsService, 
  Appointment, 
  AppointmentQueryParams, 
  CreateAppointmentData, 
  UpdateAppointmentData, 
  PaginatedAppointmentsResponse,
  CalendarViewParams,
  TodayAppointmentsResponse,
  AvailableSlotsResponse,
  AppointmentStats,
  AppointmentStatus,
  AppointmentType
} from '@/services/appointments.service';

const APPOINTMENTS_QUERY_KEY = 'appointments';

export function useAppointments(params: AppointmentQueryParams = {}) {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, params],
    queryFn: () => appointmentsService.getAll(params),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useAppointment(id: string | null) {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, id],
    queryFn: () => appointmentsService.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useCalendarAppointments(params: CalendarViewParams | null) {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, 'calendar', params],
    queryFn: () => appointmentsService.getCalendarView(params!),
    enabled: !!params,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useTodayAppointments(clinicId: string | null) {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, 'today', clinicId],
    queryFn: () => appointmentsService.getToday(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useAvailableSlots(staffId: string | null, date: string | null) {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, 'available-slots', staffId, date],
    queryFn: () => appointmentsService.getAvailableSlots(staffId!, date!),
    enabled: !!staffId && !!date,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useAppointmentStats(clinicId: string | null) {
  return useQuery({
    queryKey: [APPOINTMENTS_QUERY_KEY, 'stats', clinicId],
    queryFn: () => appointmentsService.getStats(clinicId!),
    enabled: !!clinicId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAppointmentData) => appointmentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentData }) => appointmentsService.update(id, data),
    onSuccess: (updatedAppointment) => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
      queryClient.setQueryData([APPOINTMENTS_QUERY_KEY, updatedAppointment.id], updatedAppointment);
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => appointmentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
    },
  });
}

export type { 
  Appointment, 
  AppointmentQueryParams, 
  CreateAppointmentData, 
  UpdateAppointmentData, 
  PaginatedAppointmentsResponse,
  CalendarViewParams,
  TodayAppointmentsResponse,
  AvailableSlotsResponse,
  AppointmentStats,
  AppointmentStatus,
  AppointmentType
};