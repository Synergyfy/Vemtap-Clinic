import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listFileUploads,
  getFileUploadStats,
  getFileUploadById,
  createFileUpload,
  updateFileUpload,
  deleteFileUpload,
  type FileUpload,
  type CreateFileUploadDto,
  type UpdateFileUploadDto,
  type FileUploadQuery,
  type FileUploadStats,
  FileCategory,
} from "@/services/file-upload.service";

export const FILE_UPLOAD_KEYS = {
  all: ["file-uploads"] as const,
  list: (clinicId: string, filters?: FileUploadQuery) =>
    ["file-uploads", "list", clinicId, filters] as const,
  stats: (clinicId: string) => ["file-uploads", "stats", clinicId] as const,
  detail: (id: string) => ["file-uploads", "detail", id] as const,
};

/**
 * Hook to list file uploads filtered by clinic, patient, category, or uploader.
 */
export function useFileUploads(filters?: FileUploadQuery) {
  const { user } = useAuth();
  const clinicId = filters?.clinicId || user?.clinicId || "";

  return useQuery<FileUpload[]>({
    queryKey: FILE_UPLOAD_KEYS.list(clinicId, filters),
    queryFn: () => listFileUploads({ ...filters, clinicId }),
    enabled: !!clinicId,
    staleTime: 1000 * 60,
  });
}

/**
 * Hook to get upload statistics for a clinic.
 */
export function useFileUploadStats(customClinicId?: string) {
  const { user } = useAuth();
  const clinicId = customClinicId || user?.clinicId || "";

  return useQuery<FileUploadStats>({
    queryKey: FILE_UPLOAD_KEYS.stats(clinicId),
    queryFn: () => getFileUploadStats(clinicId),
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook to retrieve a single file upload record.
 */
export function useFileUploadById(id?: string) {
  return useQuery<FileUpload>({
    queryKey: FILE_UPLOAD_KEYS.detail(id || ""),
    queryFn: () => getFileUploadById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a file upload record.
 */
export function useCreateFileUpload() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: Omit<CreateFileUploadDto, "clinicId"> & { clinicId?: string }) => {
      const clinicId = dto.clinicId || user?.clinicId || "";
      return createFileUpload({ ...dto, clinicId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FILE_UPLOAD_KEYS.all });
    },
  });
}

/**
 * Hook to update an existing file upload record.
 */
export function useUpdateFileUpload() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateFileUploadDto }) =>
      updateFileUpload(id, dto),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: FILE_UPLOAD_KEYS.all });
      if (data?.id) {
        qc.invalidateQueries({ queryKey: FILE_UPLOAD_KEYS.detail(data.id) });
      }
    },
  });
}

/**
 * Hook to delete a file upload record.
 */
export function useDeleteFileUpload() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFileUpload(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FILE_UPLOAD_KEYS.all });
    },
  });
}

// Backwards-compatible aliases
export const useUploads = (filters?: { entityType?: string; entityId?: string }) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["uploads", user?.clinicId ?? "", filters],
    queryFn: () => listFileUploads({
      clinicId: user?.clinicId,
      patientId: filters?.entityType === "patient" ? filters.entityId : undefined,
      entityType: filters?.entityType,
      entityId: filters?.entityId,
    }),
    enabled: !!user?.clinicId,
  });
};

export const useUploadStats = useFileUploadStats;

export function useCreateUpload() {
  const createMut = useCreateFileUpload();
  return useMutation({
    mutationFn: (dto: { fileName: string; fileType: string; fileSize: number; fileUrl: string; entityType: string; entityId: string }) =>
      createMut.mutateAsync({
        originalName: dto.fileName,
        storedName: `${Date.now()}-${dto.fileName}`,
        mimeType: dto.fileType,
        fileSize: dto.fileSize,
        url: dto.fileUrl,
        relatedEntityType: dto.entityType,
        relatedEntityId: dto.entityId,
        patientId: dto.entityType === "patient" ? dto.entityId : undefined,
        category: FileCategory.GENERAL,
      }),
  });
}

export const useDeleteUpload = useDeleteFileUpload;
