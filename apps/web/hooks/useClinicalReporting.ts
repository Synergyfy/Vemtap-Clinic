import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  generateReport,
  listReports,
  getReport,
  deleteReport,
  getReportingStats,
  getScheduledTemplates,
  type CreateReportTemplateDto,
  type UpdateReportTemplateDto,
  type ReportTemplateQuery,
  type GenerateReportDto,
  type GeneratedReportQuery,
  type ReportTemplate,
  type GeneratedReport,
  type ReportType,
  type ReportFormat,
  type ReportStatus,
  type ReportDeliveryMethod,
} from "@/services/clinical-reporting.service";

export type {
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
  ReportTemplateQuery,
  GenerateReportDto,
  GeneratedReportQuery,
  ReportTemplate,
  GeneratedReport,
  ReportType,
  ReportFormat,
  ReportStatus,
  ReportDeliveryMethod,
};

export const CLINICAL_REPORTING_KEYS = {
  all: ["clinical-reporting"] as const,
  templates: (clinicId?: string, query?: Partial<ReportTemplateQuery>) =>
    ["clinical-reporting", "templates", clinicId, query] as const,
  template: (id?: string) => ["clinical-reporting", "template", id] as const,
  reports: (clinicId?: string, query?: Partial<GeneratedReportQuery>) =>
    ["clinical-reporting", "reports", clinicId, query] as const,
  report: (id?: string) => ["clinical-reporting", "report", id] as const,
  stats: (clinicId?: string) => ["clinical-reporting", "stats", clinicId] as const,
  scheduled: () => ["clinical-reporting", "scheduled"] as const,
};

export function useReportTemplates(query?: ReportTemplateQuery) {
  const { user } = useAuth();
  const clinicId = query?.clinicId || user?.clinicId;

  return useQuery({
    queryKey: CLINICAL_REPORTING_KEYS.templates(clinicId, query),
    queryFn: () => listTemplates({ ...query, clinicId: clinicId || undefined }),
  });
}

export function useReportTemplate(id?: string) {
  return useQuery({
    queryKey: CLINICAL_REPORTING_KEYS.template(id),
    queryFn: () => getTemplate(id!),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: CreateReportTemplateDto) => {
      if (!user?.clinicId) throw new Error("Clinic ID not found");
      return createTemplate(dto, user.clinicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_REPORTING_KEYS.all });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateReportTemplateDto }) =>
      updateTemplate(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_REPORTING_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CLINICAL_REPORTING_KEYS.template(id) });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_REPORTING_KEYS.all });
    },
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: GenerateReportDto) => {
      if (!user?.clinicId) throw new Error("Clinic ID not found");
      return generateReport(dto, user.clinicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_REPORTING_KEYS.all });
    },
  });
}

export function useClinicalReports(query?: Omit<GeneratedReportQuery, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId;

  return useQuery({
    queryKey: CLINICAL_REPORTING_KEYS.reports(clinicId, query),
    queryFn: () => listReports({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function useClinicalReport(id?: string) {
  return useQuery({
    queryKey: CLINICAL_REPORTING_KEYS.report(id),
    queryFn: () => getReport(id!),
    enabled: !!id,
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINICAL_REPORTING_KEYS.all });
    },
  });
}

export function useReportingStats() {
  const { user } = useAuth();
  const clinicId = user?.clinicId;

  return useQuery({
    queryKey: CLINICAL_REPORTING_KEYS.stats(clinicId),
    queryFn: () => getReportingStats(clinicId!),
    enabled: !!clinicId,
  });
}

export function useScheduledTemplates() {
  return useQuery({
    queryKey: CLINICAL_REPORTING_KEYS.scheduled(),
    queryFn: () => getScheduledTemplates(),
  });
}
