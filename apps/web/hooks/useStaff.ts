'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  staffService, 
  Staff, 
  StaffQueryParams, 
  CreateStaffData, 
  UpdateStaffData, 
  PaginatedStaffResponse,
  StaffStats,
  StaffRole
} from '@/services/staff.service';

const STAFF_QUERY_KEY = 'staff';

export function useStaff(params: StaffQueryParams = {}) {
  return useQuery({
    queryKey: [STAFF_QUERY_KEY, params],
    queryFn: () => staffService.getAll(params),
    enabled: !!params.clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useStaffMember(id: string | null) {
  return useQuery({
    queryKey: [STAFF_QUERY_KEY, id],
    queryFn: () => staffService.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useStaffStats(clinicId: string | null) {
  return useQuery({
    queryKey: [STAFF_QUERY_KEY, 'stats', clinicId],
    queryFn: () => staffService.getStats(clinicId!),
    enabled: !!clinicId,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateStaffData) => staffService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
      await queryClient.refetchQueries({ queryKey: [STAFF_QUERY_KEY], exact: false });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffData }) => staffService.update(id, data),
    onSuccess: async (updatedStaff) => {
      await queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
      await queryClient.refetchQueries({ queryKey: [STAFF_QUERY_KEY], exact: false });
      queryClient.setQueryData([STAFF_QUERY_KEY, updatedStaff.id], updatedStaff);
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => staffService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
      await queryClient.refetchQueries({ queryKey: [STAFF_QUERY_KEY], exact: false });
    },
  });
}

export type { 
  Staff, 
  StaffQueryParams, 
  CreateStaffData, 
  UpdateStaffData, 
  PaginatedStaffResponse,
  StaffStats,
  StaffRole
};