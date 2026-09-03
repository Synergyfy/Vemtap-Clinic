'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  patientPortalService,
  PatientProfile,
  PatientAppointment,
  MedicalRecord,
  Invoice,
  Notification,
  OpticalItem,
  LensOrder,
} from '@/services/patient-portal.service';
import { useAuth } from '@/lib/auth-context';

const PATIENT_PORTAL_KEY = 'patient-portal';

// ─── Auth Hooks ───
export function usePatientRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { firstName: string; lastName: string; email: string; phone: string; password: string; dateOfBirth?: string; gender?: string }) =>
      patientPortalService.register(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'profile'] });
    },
  });
}

export function usePatientLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { email: string; password: string }) =>
      patientPortalService.login(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'profile'] });
    },
  });
}

export function usePatientLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => patientPortalService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function usePatientProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'profile', user?.userId],
    queryFn: () => patientPortalService.getProfile(),
    enabled: !!user?.userId,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: { phone?: string; address?: string; city?: string; state?: string; emergencyContact?: string; emergencyPhone?: string }) =>
      patientPortalService.updateProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'profile'] });
    },
  });
}

export function usePatientAppointmentsList() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'appointments', user?.userId],
    queryFn: () => patientPortalService.getAppointments(),
    enabled: !!user?.userId,
    staleTime: 30_000,
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patientPortalService.bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'appointments'] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; appointmentDate: string; appointmentTime?: string }) =>
      patientPortalService.rescheduleAppointment(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'appointments'] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patientPortalService.cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'appointments'] });
    },
  });
}

export function usePatientRecords() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'records', user?.userId],
    queryFn: () => patientPortalService.getRecords(),
    enabled: !!user?.userId,
    staleTime: 30_000,
  });
}

export function usePatientBilling() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'billing', user?.userId],
    queryFn: () => patientPortalService.getBilling(),
    enabled: !!user?.userId,
    staleTime: 30_000,
  });
}

export function useMakePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, ...dto }: { invoiceId: string; amount: number; paymentMethod: string; reference?: string }) =>
      patientPortalService.makePayment(invoiceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'billing'] });
    },
  });
}

export function usePatientNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'notifications', user?.userId],
    queryFn: () => patientPortalService.getNotifications(),
    enabled: !!user?.userId,
    staleTime: 30_000,
  });
}

export function useUnreadNotificationCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'notifications', 'unread-count', user?.userId],
    queryFn: () => patientPortalService.getUnreadCount(),
    enabled: !!user?.userId,
    staleTime: 10_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patientPortalService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => patientPortalService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'notifications'] });
    },
  });
}

export function usePatientOpticalItems() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'optical-items', user?.clinicId],
    queryFn: () => patientPortalService.getOpticalItems(),
    enabled: !!user?.clinicId,
    staleTime: 60_000,
  });
}

export function usePatientLensOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'lens-orders', user?.userId],
    queryFn: () => patientPortalService.getLensOrders(),
    enabled: !!user?.userId,
    staleTime: 30_000,
  });
}

export type {
  PatientProfile,
  PatientAppointment,
  MedicalRecord,
  Invoice,
  Notification,
  OpticalItem,
  LensOrder,
};
