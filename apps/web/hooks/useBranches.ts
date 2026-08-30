import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { listBranches, getBranchStats, createBranch, updateBranch, deleteBranch } from "@/services/branches.service";

const BRANCH_KEYS = {
  all: (clinicId: string) => ["branches", clinicId] as const,
  stats: (clinicId: string) => ["branches", "stats", clinicId] as const,
};

export function useBranches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: BRANCH_KEYS.all(user?.clinicId ?? ""),
    queryFn: () => listBranches(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useBranchStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: BRANCH_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getBranchStats(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { name: string; location: string; manager: string; revenue: number; activePatients: number; status: string }) =>
      createBranch({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: BRANCH_KEYS.all(user.clinicId) }); },
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<{ name: string; location: string; manager: string; revenue: number; activePatients: number; status: string }> }) =>
      updateBranch(id, dto),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: BRANCH_KEYS.all(user.clinicId) }); },
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: BRANCH_KEYS.all(user.clinicId) }); },
  });
}