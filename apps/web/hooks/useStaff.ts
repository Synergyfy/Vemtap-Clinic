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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffData }) => staffService.update(id, data),
    onSuccess: (updatedStaff) => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
      queryClient.setQueryData([STAFF_QUERY_KEY, updatedStaff.id], updatedStaff);
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => staffService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
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