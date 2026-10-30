import { api } from "@/lib/api";

export enum FileCategory {
  PATIENT_DOCUMENT = "patient_document",
  PRESCRIPTION = "prescription",
  CLAIM_DOCUMENT = "claim_document",
  REMITTANCE = "remittance",
  GENERAL = "general",
}

export interface FileUpload {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  category: FileCategory | string;
  url?: string;
  metadata?: Record<string, any>;
  patientId?: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  relatedEntityId?: string;
  relatedEntityType?: string;
  clinicId: string;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
  createdAt: string;
  updatedAt?: string;

  // Compatibility aliases for UI components expecting legacy names
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
  entityType?: string;
  entityId?: string;
}

export interface CreateFileUploadDto {
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  category?: FileCategory | string;
  url?: string;
  metadata?: Record<string, any>;
  patientId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  clinicId: string;
}

export interface UpdateFileUploadDto {
  url?: string;
  metadata?: Record<string, any>;
  category?: FileCategory | string;
}

export interface FileUploadQuery {
  clinicId?: string;
  patientId?: string;
  category?: FileCategory | string;
  uploadedById?: string;
  // Compatibility params
  entityType?: string;
  entityId?: string;
}

export interface FileUploadStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<string, number>;
}

// Normalizer to guarantee backwards compatibility
function normalizeFileUpload(file: any): FileUpload {
  return {
    ...file,
    fileName: file.originalName || file.fileName || "file",
    fileType: file.mimeType || file.fileType || "application/octet-stream",
    fileUrl: file.url || file.fileUrl || "",
    entityType: file.relatedEntityType || file.entityType,
    entityId: file.relatedEntityId || file.entityId || file.patientId,
  };
}

/**
 * GET /api/file-upload
 * Lists file uploads filtered by clinic, patient, category, or uploader.
 */
export async function listFileUploads(query?: FileUploadQuery): Promise<FileUpload[]> {
  const params: Record<string, any> = {};
  if (query?.clinicId) params.clinicId = query.clinicId;
  if (query?.patientId) params.patientId = query.patientId;
  else if (query?.entityType === "patient" && query?.entityId) params.patientId = query.entityId;
  if (query?.category) params.category = query.category;
  if (query?.uploadedById) params.uploadedById = query.uploadedById;

  const { data } = await api.get("/file-upload", { params });
  const list = Array.isArray(data) ? data : data?.data ?? [];
  return list.map(normalizeFileUpload);
}

/**
 * GET /api/file-upload/stats?clinicId={clinicId}
 * Gets file upload totals and category distribution for a clinic.
 */
export async function getFileUploadStats(clinicId: string): Promise<FileUploadStats> {
  const { data } = await api.get("/file-upload/stats", {
    params: { clinicId },
  });
  return data as FileUploadStats;
}

/**
 * GET /api/file-upload/{id}
 * Gets single file upload record by ID.
 */
export async function getFileUploadById(id: string): Promise<FileUpload> {
  const { data } = await api.get(`/file-upload/${id}`);
  return normalizeFileUpload(data);
}

/**
 * POST /api/file-upload
 * Creates file upload metadata record in database.
 */
export async function createFileUpload(dto: CreateFileUploadDto): Promise<FileUpload> {
  const { data } = await api.post("/file-upload", dto);
  return normalizeFileUpload(data);
}

/**
 * PUT /api/file-upload/{id}
 * Updates file upload record URL, metadata, or category.
 */
export async function updateFileUpload(id: string, dto: UpdateFileUploadDto): Promise<FileUpload> {
  const { data } = await api.put(`/file-upload/${id}`, dto);
  return normalizeFileUpload(data);
}

/**
 * DELETE /api/file-upload/{id}
 * Deletes file upload record.
 */
export async function deleteFileUpload(id: string): Promise<void> {
  await api.delete(`/file-upload/${id}`);
}

// Aliases for legacy exports
export const listUploads = (clinicId: string, params?: { entityType?: string; entityId?: string }) =>
  listFileUploads({ clinicId, ...params });
export const getUploadStats = (clinicId: string) => getFileUploadStats(clinicId);
export const getUpload = (id: string) => getFileUploadById(id);
export const createUpload = (dto: any) =>
  createFileUpload({
    originalName: dto.originalName || dto.fileName || "document.pdf",
    storedName: dto.storedName || `${Date.now()}-${dto.fileName || "doc"}.pdf`,
    mimeType: dto.mimeType || dto.fileType || "application/pdf",
    fileSize: dto.fileSize || 1024,
    category: dto.category || FileCategory.GENERAL,
    url: dto.url || dto.fileUrl || "",
    patientId: dto.patientId || (dto.entityType === "patient" ? dto.entityId : undefined),
    relatedEntityId: dto.relatedEntityId || dto.entityId,
    relatedEntityType: dto.relatedEntityType || dto.entityType,
    clinicId: dto.clinicId,
  });
export const updateUpload = updateFileUpload;
export const deleteUpload = deleteFileUpload;
