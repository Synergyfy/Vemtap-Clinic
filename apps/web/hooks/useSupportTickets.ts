import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listSupportTickets, getSupportTicket, createSupportTicket, updateSupportTicket,
  assignSupportTicket, resolveSupportTicket, closeSupportTicket, reopenSupportTicket,
  addTicketMessage, getTicketMessages, getSupportTicketStats,
  type SupportTicket, type SupportTicketStats, type SupportTicketQueryParams,
  type CreateSupportTicketData, type UpdateSupportTicketData,
  type CreateTicketMessageData,
  type TicketStatus, type TicketPriority, type TicketType,
} from "@/services/support-tickets.service";

const SUPPORT_TICKETS_KEYS = {
  all: (clinicId: string) => ["support-tickets", clinicId] as const,
  list: (clinicId: string, params: SupportTicketQueryParams) => ["support-tickets", "list", clinicId, params] as const,
  detail: (id: string) => ["support-tickets", id] as const,
  messages: (id: string) => ["support-tickets", "messages", id] as const,
  stats: (clinicId: string) => ["support-tickets", "stats", clinicId] as const,
};

export function useSupportTickets(params: SupportTicketQueryParams = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: SUPPORT_TICKETS_KEYS.list(user?.clinicId ?? "", params),
    queryFn: () => listSupportTickets({ ...params, clinicId: user!.clinicId }),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useSupportTicket(id: string | null) {
  return useQuery({
    queryKey: SUPPORT_TICKETS_KEYS.detail(id ?? ""),
    queryFn: () => import("@/services/support-tickets.service").then(m => m.getSupportTicket(id!)),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useSupportTicketStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SUPPORT_TICKETS_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => import("@/services/support-tickets.service").then(m => m.getSupportTicketStats(user!.clinicId)),
    enabled: !!user?.clinicId,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export function useSupportTicketMessages(ticketId: string | null) {
  return useQuery({
    queryKey: SUPPORT_TICKETS_KEYS.messages(ticketId ?? ""),
    queryFn: () => import("@/services/support-tickets.service").then(m => m.getTicketMessages(ticketId!)),
    enabled: !!ticketId,
    staleTime: 10_000,
    gcTime: 5 * 60_000,
    refetchInterval: 15_000,
  });
}

export function useCreateSupportTicket() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateSupportTicketData, "clinicId">) =>
      import("@/services/support-tickets.service").then(m => m.createSupportTicket({ ...dto, clinicId: user!.clinicId })),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: ["support-tickets", user.clinicId] });
        qc.invalidateQueries({ queryKey: ["support-tickets", "stats", user.clinicId] });
      }
    },
  });
}

export function useUpdateSupportTicket() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSupportTicketData }) =>
      import("@/services/support-tickets.service").then(m => m.updateSupportTicket(id, dto)),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: ["support-tickets", user.clinicId] });
        qc.invalidateQueries({ queryKey: ["support-tickets", "stats", user.clinicId] });
      }
    },
  });
}

export function useAssignSupportTicket() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) =>
      import("@/services/support-tickets.service").then(m => m.assignSupportTicket(id, { assigneeId })),
    onSuccess: () => {
      if (user?.clinicId) qc.invalidateQueries({ queryKey: ["support-tickets", user.clinicId] });
    },
  });
}

export function useResolveSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolutionNotes }: { id: string; resolutionNotes?: string }) =>
      import("@/services/support-tickets.service").then(m => m.resolveSupportTicket(id, { resolutionNotes })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
}

export function useCloseSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      import("@/services/support-tickets.service").then(m => m.closeSupportTicket(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
}

export function useReopenSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      import("@/services/support-tickets.service").then(m => m.reopenSupportTicket(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
}

export function useAddTicketMessage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateTicketMessageData, "clinicId">) =>
      import("@/services/support-tickets.service").then(m => m.addTicketMessage({ ...dto, clinicId: user!.clinicId })),
    onSuccess: (_data, variables) => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: ["support-tickets", "messages", variables.ticketId] });
      }
    },
  });
}

export type { 
  SupportTicket, 
  SupportTicketStats, 
  SupportTicketQueryParams,
  CreateSupportTicketData, 
  UpdateSupportTicketData,
  CreateTicketMessageData,
  TicketStatus,
  TicketPriority,
  TicketType,
};