import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { listUploads, getUploadStats, createUpload, deleteUpload } from "@/services/file-upload.service";

const UPLOAD_KEYS = {
  all: (clinicId: string) => ["uploads", clinicId] as const,
  stats: (clinicId: string) => ["uploads", "stats", clinicId] as const,
  byEntity: (clinicId: string, entityType: string, entityId: string) =>
    ["uploads", clinicId, entityType, entityId] as const,
};

export function useUploads(filters?: { entityType?: string; entityId?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...UPLOAD_KEYS.all(user?.clinicId ?? ""), filters],
    queryFn: () => listUploads(user!.clinicId, filters),
    enabled: !!user?.clinicId,
  });
}

export function useUploadStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: UPLOAD_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getUploadStats(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateUpload() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { fileName: string; fileType: string; fileSize: number; fileUrl: string; entityType: string; entityId: string }) =>
      createUpload({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: UPLOAD_KEYS.all(user.clinicId) }); },
  });
}

export function useDeleteUpload() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteUpload(id),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: UPLOAD_KEYS.all(user.clinicId) }); },
  });
}
