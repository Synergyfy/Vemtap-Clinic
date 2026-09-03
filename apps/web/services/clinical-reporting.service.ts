import { api } from "@/lib/api";

export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  content: string;
  isScheduled: boolean;
  scheduleFrequency: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  content: string;
  status: string;
  generatedById: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  template?: ReportTemplate;
}

export interface ReportingStats {
  totalTemplates: number;
  totalReports: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

// Templates
export async function listTemplates(clinicId: string): Promise<ReportTemplate[]> {
  const { data } = await api.get("/clinical-reporting/templates", { params: { clinicId } });
  return data;
}

export async function createTemplate(dto: Omit<ReportTemplate, "id" | "createdAt" | "updatedAt">): Promise<ReportTemplate> {
  const { data } = await api.post("/clinical-reporting/templates", dto);
  return data;
}

export async function updateTemplate(id: string, dto: Partial<ReportTemplate>): Promise<ReportTemplate> {
  const { data } = await api.put(`/clinical-reporting/templates/${id}`, dto);
  return data;
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/clinical-reporting/templates/${id}`);
}

// Reports
export async function generateReport(dto: { templateId: string; name?: string; clinicId: string }): Promise<GeneratedReport> {
  const { data } = await api.post("/clinical-reporting/generate", dto);
  return data;
}

export async function listReports(clinicId: string): Promise<GeneratedReport[]> {
  const { data } = await api.get("/clinical-reporting/reports", { params: { clinicId } });
  return data;
}

export async function getReport(id: string): Promise<GeneratedReport> {
  const { data } = await api.get(`/clinical-reporting/reports/${id}`);
  return data;
}

export async function deleteReport(id: string): Promise<void> {
  await api.delete(`/clinical-reporting/reports/${id}`);
}

export async function getReportingStats(clinicId: string): Promise<ReportingStats> {
  const { data } = await api.get("/clinical-reporting/stats", { params: { clinicId } });
  return data;
}

export async function getScheduledTemplates(clinicId: string): Promise<ReportTemplate[]> {
  const { data } = await api.get("/clinical-reporting/scheduled", { params: { clinicId } });
  return data;
}
