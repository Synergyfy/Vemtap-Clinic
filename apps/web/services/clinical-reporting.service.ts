import { api } from "@/lib/api";

export type ReportType =
  | "patient_volume"
  | "appointment_utilization"
  | "revenue_summary"
  | "hmo_claims_analysis"
  | "surgery_schedule"
  | "drug_usage"
  | "patient_outcomes"
  | "staff_productivity"
  | "inventory_levels"
  | "custom";

export type ReportFormat = "pdf" | "excel" | "csv" | "json";

export type ReportStatus = "pending" | "generating" | "completed" | "failed";

export type ReportDeliveryMethod = "download" | "email" | "api";

export interface CreateReportTemplateDto {
  name: string;
  description?: string;
  type: ReportType;
  queryConfig?: Record<string, any>;
  defaultParameters?: Record<string, any>;
  parameterSchema?: Record<string, any>;
  defaultFormat?: ReportFormat;
  isActive?: boolean;
  isScheduled?: boolean;
  cronExpression?: string;
  scheduledFormat?: ReportFormat;
  scheduledParameters?: Record<string, any>;
}

export interface UpdateReportTemplateDto extends Partial<CreateReportTemplateDto> {}

export interface ReportTemplateQuery {
  type?: ReportType;
  isActive?: boolean;
  isScheduled?: boolean;
  clinicId?: string;
}

export interface GenerateReportDto {
  templateId: string;
  parameters?: Record<string, any>;
  format?: ReportFormat;
  deliveryMethod?: ReportDeliveryMethod;
  deliveryTarget?: string;
}

export interface GeneratedReportQuery {
  templateId?: string;
  status?: ReportStatus;
  generatedById?: string;
  clinicId?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  type: ReportType;
  queryConfig: Record<string, any>;
  defaultParameters: Record<string, any>;
  parameterSchema: Record<string, any>;
  defaultFormat: ReportFormat;
  isActive: boolean;
  isScheduled: boolean;
  cronExpression: string | null;
  scheduledFormat: ReportFormat | null;
  scheduledParameters: Record<string, any>;
  lastRunAt: string | null;
  nextRunAt: string | null;
  clinicId: string;
  createdById: string | null;
  createdBy?: { id: string; user?: { firstName?: string; lastName?: string } };
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  template?: ReportTemplate;
  parameters: Record<string, any>;
  format: ReportFormat;
  status: ReportStatus;
  fileUrl: string | null;
  fileSize: number | null;
  errorMessage: string | null;
  generatedById: string | null;
  generatedBy?: { id: string; user?: { firstName?: string; lastName?: string } };
  deliveryMethod: ReportDeliveryMethod;
  deliveryTarget: string | null;
  completedAt: string | null;
  clinicId: string;
  createdAt: string;
}

export interface ReportingStats {
  totalTemplates: number;
  totalReports: number;
  byStatus: Record<string, number>;
}

// ========== Templates ==========

export async function createTemplate(
  dto: CreateReportTemplateDto,
  clinicId: string
): Promise<ReportTemplate> {
  const { data } = await api.post("/clinical-reporting/templates", dto, {
    params: { clinicId },
  });
  return data;
}

export async function listTemplates(
  query?: ReportTemplateQuery
): Promise<ReportTemplate[]> {
  const { data } = await api.get("/clinical-reporting/templates", {
    params: query,
  });
  return data;
}

export async function getTemplate(id: string): Promise<ReportTemplate> {
  const { data } = await api.get(`/clinical-reporting/templates/${id}`);
  return data;
}

export async function updateTemplate(
  id: string,
  dto: UpdateReportTemplateDto
): Promise<ReportTemplate> {
  const { data } = await api.put(`/clinical-reporting/templates/${id}`, dto);
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/clinical-reporting/templates/${id}`);
}

// ========== Generated Reports ==========

export async function generateReport(
  dto: GenerateReportDto,
  clinicId: string
): Promise<GeneratedReport> {
  const { data } = await api.post("/clinical-reporting/generate", dto, {
    params: { clinicId },
  });
  return data;
}

export async function listReports(
  query?: GeneratedReportQuery
): Promise<GeneratedReport[]> {
  const { data } = await api.get("/clinical-reporting/reports", {
    params: query,
  });
  return data;
}

export async function getReport(id: string): Promise<GeneratedReport> {
  const { data } = await api.get(`/clinical-reporting/reports/${id}`);
  return data;
}

export async function deleteReport(id: string): Promise<void> {
  await api.delete(`/clinical-reporting/reports/${id}`);
}

// ========== Stats & Schedules ==========

export async function getReportingStats(
  clinicId: string
): Promise<ReportingStats> {
  const { data } = await api.get("/clinical-reporting/stats", {
    params: { clinicId },
  });
  return data;
}

export async function getScheduledTemplates(): Promise<ReportTemplate[]> {
  const { data } = await api.get("/clinical-reporting/scheduled");
  return data;
}
