import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listTemplates, createTemplate, updateTemplate, deleteTemplate,
  generateReport, listReports, getReport, deleteReport,
  getReportingStats, getScheduledTemplates,
} from "@/services/clinical-reporting.service";

const CR_KEYS = {
  templates: (clinicId: string) => ["clinical-reporting", "templates", clinicId] as const,
  reports: (clinicId: string) => ["clinical-reporting", "reports", clinicId] as const,
  stats: (clinicId: string) => ["clinical-reporting", "stats", clinicId] as const,
  scheduled: (clinicId: string) => ["clinical-reporting", "scheduled", clinicId] as const,
};

export function useReportTemplates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: CR_KEYS.templates(user?.clinicId ?? ""),
    queryFn: () => listTemplates(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { name: string; description?: string; category: string; content: string; isScheduled?: boolean; scheduleFrequency?: string }) =>
      createTemplate({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: CR_KEYS.templates(user.clinicId) }); },
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<{ name: string; description: string; category: string; content: string; isScheduled: boolean; scheduleFrequency: string }> }) =>
      updateTemplate(id, dto),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: CR_KEYS.templates(user.clinicId) }); },
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: CR_KEYS.templates(user.clinicId) }); },
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { templateId: string; name?: string }) => generateReport({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: CR_KEYS.reports(user.clinicId) }); },
  });
}

export function useClinicalReports() {
  const { user } = useAuth();
  return useQuery({
    queryKey: CR_KEYS.reports(user?.clinicId ?? ""),
    queryFn: () => listReports(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useReportingStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: CR_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getReportingStats(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useScheduledTemplates() {
  const { user } = useAuth();
  return useQuery({
    queryKey: CR_KEYS.scheduled(user?.clinicId ?? ""),
    queryFn: () => getScheduledTemplates(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}
