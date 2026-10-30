import { api } from "@/lib/api";

export type TicketType = "support" | "complaint" | "incident" | "feature_request";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicket {
  id: string;
  ticketNumber?: string;
  subject: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  clinicId: string;
  reporterId?: string;
  reporterName?: string;
  assigneeId?: string;
  assigneeName?: string;
  clinicName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byPriority?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface TicketQueryParams {
  clinicId?: string;
  status?: string;
  priority?: string;
  type?: string;
  search?: string;
}

export interface CreateSupportTicketDto {
  subject: string;
  description: string;
  type?: TicketType;
  priority?: TicketPriority;
  clinicId: string;
  assigneeId?: string;
}

export async function listSupportTickets(params: TicketQueryParams = {}): Promise<SupportTicket[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") query.append(k, String(v));
  });
  const { data } = await api.get(`/support-tickets${query.toString() ? `?${query.toString()}` : ""}`);
  return Array.isArray(data) ? data : data?.data || [];
}

export async function getSupportTicketStats(clinicId?: string): Promise<SupportTicketStats> {
  const params = clinicId ? { clinicId } : {};
  const { data } = await api.get("/support-tickets/stats", { params });
  return data;
}

export async function createSupportTicket(dto: CreateSupportTicketDto): Promise<SupportTicket> {
  const { data } = await api.post("/support-tickets", dto);
  return data;
}

export async function resolveSupportTicket(id: string, notes?: string): Promise<SupportTicket> {
  const { data } = await api.put(`/support-tickets/${id}/resolve`, { resolutionNotes: notes });
  return data;
}

export async function closeSupportTicket(id: string): Promise<SupportTicket> {
  const { data } = await api.put(`/support-tickets/${id}/close`);
  return data;
}
