import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listSupportTickets,
  getSupportTicketStats,
  createSupportTicket,
  resolveSupportTicket,
  closeSupportTicket,
  type TicketQueryParams,
  type CreateSupportTicketDto,
  type SupportTicket,
  type SupportTicketStats,
} from "@/services/support-tickets.service";

export type { SupportTicket, SupportTicketStats };

export const SUPPORT_TICKET_KEYS = {
  all: ["support-tickets"] as const,
  list: (params?: TicketQueryParams) => ["support-tickets", "list", params] as const,
  stats: (clinicId?: string) => ["support-tickets", "stats", clinicId] as const,
};

export function useSupportTickets(params: TicketQueryParams = {}) {
  const { user } = useAuth();
  const clinicId = params.clinicId || user?.clinicId;
  return useQuery({
    queryKey: SUPPORT_TICKET_KEYS.list({ ...params, clinicId }),
    queryFn: () => listSupportTickets({ ...params, clinicId: clinicId || undefined }),
  });
}

export function useSupportTicketStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: SUPPORT_TICKET_KEYS.stats(user?.clinicId),
    queryFn: () => getSupportTicketStats(user?.clinicId || undefined),
  });
}

export function useCreateSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateSupportTicketDto) => createSupportTicket(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUPPORT_TICKET_KEYS.all });
    },
  });
}

export function useResolveSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => resolveSupportTicket(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUPPORT_TICKET_KEYS.all });
    },
  });
}

export function useCloseSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => closeSupportTicket(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUPPORT_TICKET_KEYS.all });
    },
  });
}
