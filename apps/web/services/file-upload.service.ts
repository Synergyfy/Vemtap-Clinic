import { api } from "@/lib/api";

export interface FileUpload {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  entityType: string;
  entityId: string;
  uploadedById: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadStats {
  totalFiles: number;
  totalSize: number;
  byFileType: Record<string, number>;
  byEntity: Record<string, number>;
}

export async function listUploads(clinicId: string, params?: { entityType?: string; entityId?: string }): Promise<FileUpload[]> {
  const { data } = await api.get("/file-upload", { params: { clinicId, ...params } });
  return data;
}

export async function getUploadStats(clinicId: string): Promise<UploadStats> {
  const { data } = await api.get("/file-upload/stats", { params: { clinicId } });
  return data;
}

export async function getUpload(id: string): Promise<FileUpload> {
  const { data } = await api.get(`/file-upload/${id}`);
  return data;
}

export async function createUpload(dto: { fileName: string; fileType: string; fileSize: number; fileUrl: string; entityType: string; entityId: string; clinicId: string }): Promise<FileUpload> {
  const { data } = await api.post("/file-upload", dto);
  return data;
}

export async function updateUpload(id: string, dto: Partial<FileUpload>): Promise<FileUpload> {
  const { data } = await api.put(`/file-upload/${id}`, dto);
  return data;
}

export async function deleteUpload(id: string): Promise<void> {
  await api.delete(`/file-upload/${id}`);
}
