import { api } from "@/lib/api";

export interface ClinicSetting {
  id: string;
  clinicId: string;
  key: string;
  value: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface SetSettingData {
  key: string;
  value: string;
  category?: string;
}

// Workflow types
export interface Workflow {
  id: string;
  name: string;
  type: string;
  steps: any[];
  status: string;
  clinics: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkflowData {
  name: string;
  type: string;
  steps: any[];
  status: string;
  clinicId: string;
}

export interface UpdateWorkflowData {
  name?: string;
  type?: string;
  steps?: any[];
  status?: string;
}

// Template types
export interface Template {
  id: string;
  name: string;
  category: string;
  fields: any[];
  status: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  name: string;
  category: string;
  fields: any[];
  status: string;
  clinicId: string;
}

export interface UpdateTemplateData {
  name?: string;
  category?: string;
  fields?: any[];
  status?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  fields: any[];
  status: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  name: string;
  category: string;
  fields: any[];
  status: string;
  clinicId: string;
}

export interface UpdateTemplateData {
  name?: string;
  category?: string;
  fields?: any[];
  status?: string;
}

export async function listSettings(clinicId: string, category?: string): Promise<ClinicSetting[]> {
  const params: any = { clinicId };
  if (category) params.category = category;
  const { data } = await api.get("/settings", { params });
  return data;
}

export async function getSettingsMap(clinicId: string): Promise<Record<string, string>> {
  const { data } = await api.get("/settings/all", { params: { clinicId } });
  return data;
}

export async function getCategorySettings(clinicId: string, category: string): Promise<Record<string, string>> {
  const { data } = await api.get(`/settings/category/${category}`, { params: { clinicId } });
  return data;
}

export async function getSetting(clinicId: string, key: string): Promise<ClinicSetting | null> {
  const { data } = await api.get(`/settings/${key}`, { params: { clinicId } });
  return data;
}

export async function setSetting(clinicId: string, dto: SetSettingData): Promise<ClinicSetting> {
  const { data } = await api.post("/settings", dto, { params: { clinicId } });
  return data;
}

export async function bulkSetSettings(clinicId: string, settings: SetSettingData[]): Promise<ClinicSetting[]> {
  const { data } = await api.post("/settings/bulk", { settings }, { params: { clinicId } });
  return data;
}

export async function deleteSetting(clinicId: string, key: string): Promise<void> {
  await api.delete(`/settings/${key}`, { params: { clinicId } });
}

// Workflow functions (using settings API with 'workflow' category)
export async function listWorkflows(clinicId: string): Promise<Workflow[]> {
  const settings = await listSettings(clinicId, 'workflow');
  return settings.map(s => JSON.parse(s.value));
}

export async function createWorkflow(clinicId: string, dto: CreateWorkflowData): Promise<Workflow> {
  const key = `workflow-${Date.now()}`;
  const workflow = { 
    ...dto, 
    id: key, 
    clinics: 0, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  await setSetting(clinicId, { key, value: JSON.stringify(workflow), category: 'workflow' });
  return workflow;
}

export async function updateWorkflow(clinicId: string, id: string, dto: UpdateWorkflowData): Promise<Workflow | null> {
  const existing = await getSetting(clinicId, id);
  if (!existing) return null;
  const updated = { ...JSON.parse(existing.value), ...dto, updatedAt: new Date().toISOString() };
  await setSetting(clinicId, { key: id, value: JSON.stringify(updated), category: 'workflow' });
  return updated;
}

export async function deleteWorkflow(clinicId: string, id: string): Promise<void> {
  await deleteSetting(clinicId, id);
}

// Template functions (using settings API with 'template' category)
export async function listTemplates(clinicId: string): Promise<Template[]> {
  const settings = await listSettings(clinicId, 'template');
  return settings.map(s => JSON.parse(s.value));
}

export async function createTemplate(clinicId: string, dto: CreateTemplateData): Promise<Template> {
  const key = `template-${Date.now()}`;
  const template = { 
    ...dto, 
    id: key, 
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  await setSetting(clinicId, { key, value: JSON.stringify(template), category: 'template' });
  return template;
}

export async function updateTemplate(clinicId: string, id: string, dto: UpdateTemplateData): Promise<Template | null> {
  const existing = await getSetting(clinicId, id);
  if (!existing) return null;
  const updated = { ...JSON.parse(existing.value), ...dto, updatedAt: new Date().toISOString() };
  await setSetting(clinicId, { key: id, value: JSON.stringify(updated), category: 'template' });
  return updated;
}

export async function deleteTemplate(clinicId: string, id: string): Promise<void> {
  await deleteSetting(clinicId, id);
}
