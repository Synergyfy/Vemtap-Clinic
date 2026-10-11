import { api } from "@/lib/api";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed" | "reopened";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketType = "support" | "complaint" | "incident" | "feature_request";

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  reporterId: string | null;
  reporter?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  assigneeId: string | null;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  clinicId: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  ticketId: string;
  createdAt: string;
}

export interface SupportTicketStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

export interface SupportTicketQueryParams {
  clinicId?: string;
  status?: string;
  priority?: string;
  type?: string;
  reporterId?: string;
  assigneeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateSupportTicketData {
  subject: string;
  description: string;
  type?: string;
  priority?: string;
  assigneeId?: string;
  clinicId: string;
}

export interface UpdateSupportTicketData {
  subject?: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
}

export interface CreateTicketMessageData {
  content: string;
  ticketId: string;
  clinicId: string;
}

export interface AssignTicketData {
  assigneeId: string;
}

export interface ResolveTicketData {
  resolutionNotes?: string;
}

export async function listSupportTickets(params: SupportTicketQueryParams = {}): Promise<SupportTicket[]> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const { data } = await api.get(`/support-tickets?${searchParams.toString()}`);
  return data;
}

export async function getSupportTicket(id: string): Promise<SupportTicket> {
  const { data } = await api.get(`/support-tickets/${id}`);
  return data;
}

export async function createSupportTicket(dto: CreateSupportTicketData): Promise<SupportTicket> {
  const { data } = await api.post("/support-tickets", dto);
  return data;
}

export async function updateSupportTicket(id: string, dto: UpdateSupportTicketData): Promise<SupportTicket> {
  const { data } = await api.put(`/support-tickets/${id}`, dto);
  return data;
}

export async function assignSupportTicket(id: string, dto: { assigneeId: string }): Promise<SupportTicket> {
  const { data } = await api.put(`/support-tickets/${id}/assign`, dto);
  return data;
}

export async function resolveSupportTicket(id: string, dto: { resolutionNotes?: string }): Promise<SupportTicket> {
  const { data } = await api.put(`/support-tickets/${id}/resolve`, dto);
  return data;
}

export async function closeSupportTicket(id: string): Promise<SupportTicket> {
  const { data } = await api.put(`/support-tickets/${id}/close`);
  return data;
}

export async function reopenSupportTicket(id: string): Promise<SupportTicket> {
  const { data } = await api.put(`/support-tickets/${id}/reopen`);
  return data;
}

export async function addTicketMessage(dto: CreateTicketMessageData): Promise<any> {
  const { data } = await api.post(`/support-tickets/${dto.ticketId}/messages`, dto);
  return data;
}

export async function getTicketMessages(ticketId: string): Promise<any[]> {
  const { data } = await api.get(`/support-tickets/${ticketId}/messages`);
  return data;
}

export async function getSupportTicketStats(clinicId: string): Promise<SupportTicketStats> {
  const { data } = await api.get(`/support-tickets/stats`, { params: { clinicId } });
  return data;
}

export async function deleteSupportTicket(id: string): Promise<void> {
  await api.delete(`/support-tickets/${id}`);
}