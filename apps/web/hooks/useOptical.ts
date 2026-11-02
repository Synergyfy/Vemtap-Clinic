import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listOpticalItems, getOpticalItem, createOpticalItem, updateOpticalItem, deleteOpticalItem,
  listFrames, listLenses,
  type OpticalItem, type CreateOpticalItemData, type UpdateOpticalItemData,
  type OpticalItemQueryParams,
} from "@/services/optical.service";

const OPTICAL_KEYS = {
  items: (clinicId: string, params: OpticalItemQueryParams) => ["optical", "items", clinicId, params] as const,
  frames: (clinicId: string, params: OpticalItemQueryParams) => ["optical", "frames", clinicId, params] as const,
  lenses: (clinicId: string, params: OpticalItemQueryParams) => ["optical", "lenses", clinicId, params] as const,
  detail: (id: string) => ["optical", "items", id] as const,
};

export function useOpticalItems(params: OpticalItemQueryParams = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: OPTICAL_KEYS.items(user?.clinicId ?? "", params),
    queryFn: () => listOpticalItems({ ...params, clinicId: user!.clinicId }),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useFrames(params: OpticalItemQueryParams = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: OPTICAL_KEYS.frames(user?.clinicId ?? "", params),
    queryFn: () => listFrames({ ...params, clinicId: user!.clinicId }),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useLenses(params: OpticalItemQueryParams = {}) {
  const { user } = useAuth();
  return useQuery({
    queryKey: OPTICAL_KEYS.lenses(user?.clinicId ?? "", params),
    queryFn: () => listLenses({ ...params, clinicId: user!.clinicId }),
    enabled: !!user?.clinicId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useOpticalItem(id: string | null) {
  return useQuery({
    queryKey: OPTICAL_KEYS.detail(id ?? ""),
    queryFn: () => import("@/services/optical.service").then(m => m.getOpticalItem(id!)),
    enabled: !!id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useCreateOpticalItem() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: Omit<CreateOpticalItemData, "clinicId">) =>
      import("@/services/optical.service").then(m => m.createOpticalItem({ ...dto, clinicId: user!.clinicId })),
    onSuccess: () => {
      if (user?.clinicId) {
        qc.invalidateQueries({ queryKey: ["optical", "items", user.clinicId] });
        qc.invalidateQueries({ queryKey: ["optical", "frames", user.clinicId] });
        qc.invalidateQueries({ queryKey: ["optical", "lenses", user.clinicId] });
      }
    },
  });
}

export function useUpdateOpticalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOpticalItemData }) =>
      import("@/services/optical.service").then(m => m.updateOpticalItem(id, dto)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["optical", "items"] });
      qc.invalidateQueries({ queryKey: ["optical", "frames"] });
      qc.invalidateQueries({ queryKey: ["optical", "lenses"] });
    },
  });
}

export function useDeleteOpticalItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      import("@/services/optical.service").then(m => m.deleteOpticalItem(id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["optical", "items"] });
      qc.invalidateQueries({ queryKey: ["optical", "frames"] });
      qc.invalidateQueries({ queryKey: ["optical", "lenses"] });
    },
  });
}

export type { OpticalItem, CreateOpticalItemData, UpdateOpticalItemData, OpticalItemQueryParams };