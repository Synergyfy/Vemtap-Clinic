import { api } from "@/lib/api";

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  userId: string | null;
  clinicId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export async function listAuditLogs(params?: { clinicId?: string; action?: string; startDate?: string; endDate?: string }): Promise<AuditLog[]> {
  const { data } = await api.get("/audit-logs", { params });
  return data;
}

export async function getAuditLog(id: string): Promise<AuditLog> {
  const { data } = await api.get(`/audit-logs/${id}`);
  return data;
}
