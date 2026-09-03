import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { listAuditLogs, getAuditLog } from "@/services/audit-logs.service";

export function useAuditLogs(filters?: { action?: string; startDate?: string; endDate?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["audit-logs", user?.clinicId, filters],
    queryFn: () => listAuditLogs({ clinicId: user?.clinicId, ...filters }),
    enabled: !!user?.clinicId,
  });
}

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: () => getAuditLog(id),
    enabled: !!id,
  });
}
