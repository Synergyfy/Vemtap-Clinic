'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  queueService, 
  QueueEntry, 
  QueueQueryParams, 
  CreateQueueEntryData, 
  UpdateQueueEntryData, 
  PaginatedQueueResponse,
  QueueStats,
  QueueAnnouncement,
  CreateAnnouncementData,
  CallNextResponse,
  ResetQueueData,
  QueueStatus,
  QueueType,
  Priority,
  PatientType
} from '@/services/queue.service';

const QUEUE_QUERY_KEY = 'queue';

export function useQueue(params: QueueQueryParams = {}) {
  return useQuery({
    queryKey: [QUEUE_QUERY_KEY, params],
    queryFn: () => queueService.getAll(params),
    staleTime: 10_000,
    gcTime: 5 * 60_000,
    refetchInterval: 15_000,
  });
}

export function useQueueEntry(id: string | null) {
  return useQuery({
    queryKey: [QUEUE_QUERY_KEY, id],
    queryFn: () => queueService.getById(id!),
    enabled: !!id,
    staleTime: 10_000,
    gcTime: 5 * 60_000,
  });
}

export function useQueueStats(clinicId: string | null) {
  return useQuery({
    queryKey: [QUEUE_QUERY_KEY, 'stats', clinicId],
    queryFn: () => queueService.getStats(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 30_000,
  });
}

export function useQueueAnnouncements(clinicId: string | null) {
  return useQuery({
    queryKey: [QUEUE_QUERY_KEY, 'announcements', clinicId],
    queryFn: () => queueService.getAnnouncements(clinicId!),
    enabled: !!clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: 30_000,
  });
}

export function useCreateQueueEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateQueueEntryData) => queueService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_QUERY_KEY] });
    },
  });
}

export function useUpdateQueueEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQueueEntryData }) => queueService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_QUERY_KEY] });
    },
  });
}

export function useCompleteQueueEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => queueService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_QUERY_KEY] });
    },
  });
}

export function useCancelQueueEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => queueService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_QUERY_KEY] });
    },
  });
}

export function useCallNext() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ clinicId, branchId }: { clinicId: string; branchId: string }) => 
      queueService.callNext(clinicId, branchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_QUERY_KEY] });
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAnnouncementData) => queueService.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_QUERY_KEY, 'announcements'] });
    },
  });
}

export function useResetQueue() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ResetQueueData) => queueService.resetQueue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_QUERY_KEY] });
    },
  });
}

export type { 
  QueueEntry, 
  QueueQueryParams, 
  CreateQueueEntryData, 
  UpdateQueueEntryData, 
  PaginatedQueueResponse,
  QueueStats,
  QueueAnnouncement,
  CreateAnnouncementData,
  CallNextResponse,
  ResetQueueData,
  QueueStatus,
  QueueType,
  Priority,
  PatientType
};