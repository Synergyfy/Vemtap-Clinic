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
