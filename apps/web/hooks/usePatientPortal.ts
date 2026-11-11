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
  PatientRegisterPayload,
  PatientLoginPayload,
  UpdatePatientProfilePayload,
  BookAppointmentPayload,
  RescheduleAppointmentPayload,
  MakePaymentPayload,
  SendPhoneOtpResponse,
} from '@/services/patient-portal.service';
import { useSyncExternalStore } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getActivePatientProfileId, subscribeToActivePatientProfile } from '@/lib/api';

const PATIENT_PORTAL_KEY = 'patient-portal';

// Patient portal reads are scoped to the guardian token *and* the profile the
// guardian is currently viewing, so switching profiles refetches instead of
// reusing the previously selected patient's cached data.
function useActiveProfileScope(): string {
  return useSyncExternalStore(
    subscribeToActivePatientProfile,
    () => getActivePatientProfileId() ?? 'primary',
    () => 'primary',
  );
}

// ─── Auth Hooks ───
export function usePatientRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PatientRegisterPayload) =>
      patientPortalService.register(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'profile'] });
    },
  });
}

export function usePatientLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: PatientLoginPayload) =>
      patientPortalService.login(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'profile'] });
    },
  });
}

export function useSendPatientOtp() {
  return useMutation({
    mutationFn: (phone: string): Promise<SendPhoneOtpResponse> => patientPortalService.sendPhoneOtp(phone),
  });
}

export function useVerifyPatientOtp() {
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => patientPortalService.verifyPhoneOtp(phone, code),
  });
}

export function useSendPatientEmailOtp() {
  return useMutation({
    mutationFn: (email: string) => patientPortalService.sendEmailOtp(email),
  });
}

export function useVerifyPatientEmailOtp() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => patientPortalService.verifyEmailOtp(email, code),
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
  const profileScope = useActiveProfileScope();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'profile', user?.userId, profileScope],
    queryFn: () => patientPortalService.getProfile(),
    enabled: !!user?.userId,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdatePatientProfilePayload) =>
      patientPortalService.updateProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'profile'] });
    },
  });
}


export function usePatientAppointmentsList() {
  const { user } = useAuth();
  const profileScope = useActiveProfileScope();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'appointments', user?.userId, profileScope],
    queryFn: () => patientPortalService.getAppointments(),
    enabled: !!user?.userId,
    staleTime: 30_000,
  });
}

export function usePatientClinicMemberships() {
  const { user } = useAuth();
  const profileScope = useActiveProfileScope();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'memberships', user?.userId, profileScope],
    queryFn: () => patientPortalService.getClinicMemberships(),
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
    mutationFn: ({ id, ...dto }: { id: string } & RescheduleAppointmentPayload) =>
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
  const profileScope = useActiveProfileScope();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'records', user?.userId, profileScope],
    queryFn: () => patientPortalService.getRecords(),
    enabled: !!user?.userId,
    staleTime: 30_000,
  });
}

export function usePatientBilling() {
  const { user } = useAuth();
  const profileScope = useActiveProfileScope();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'billing', user?.userId, profileScope],
    queryFn: () => patientPortalService.getBilling(),
    enabled: !!user?.userId,
    staleTime: 30_000,
  });
}

export function useMakePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, ...dto }: MakePaymentPayload) =>
      patientPortalService.makePayment(invoiceId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PATIENT_PORTAL_KEY, 'billing'] });
    },
  });
}

export function usePatientNotifications() {
  const { user } = useAuth();
  const profileScope = useActiveProfileScope();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'notifications', user?.userId, profileScope],
    queryFn: () => patientPortalService.getNotifications(),
    enabled: !!user?.userId,
    staleTime: 30_000,
  });
}

export function useUnreadNotificationCount() {
  const { user } = useAuth();
  const profileScope = useActiveProfileScope();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'notifications', 'unread-count', user?.userId, profileScope],
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
  const profileScope = useActiveProfileScope();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'optical-items', user?.clinicId, profileScope],
    queryFn: () => patientPortalService.getOpticalItems(),
    enabled: !!user?.clinicId,
    staleTime: 60_000,
  });
}

export function usePatientLensOrders() {
  const { user } = useAuth();
  const profileScope = useActiveProfileScope();
  return useQuery({
    queryKey: [PATIENT_PORTAL_KEY, 'lens-orders', user?.userId, profileScope],
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
