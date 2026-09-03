import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listReturns, getReturnStats, createReturn, reviewReturn, receiveReturn, completeReturn,
  listRefunds, createRefund, processRefund,
} from "@/services/returns.service";

const RETURN_KEYS = {
  all: (clinicId: string) => ["returns", clinicId] as const,
  stats: (clinicId: string) => ["returns", "stats", clinicId] as const,
  refunds: (clinicId: string) => ["refunds", clinicId] as const,
};

export function useReturns(filters?: { status?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...RETURN_KEYS.all(user?.clinicId ?? ""), filters],
    queryFn: () => listReturns(user!.clinicId, filters),
    enabled: !!user?.clinicId,
  });
}

export function useReturnStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: RETURN_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getReturnStats(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateReturn() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { patientId?: string; productId: string; quantity: number; reason: string }) =>
      createReturn({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: RETURN_KEYS.all(user.clinicId) }); },
  });
}

export function useReviewReturn() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { status: string; notes?: string } }) => reviewReturn(id, dto),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: RETURN_KEYS.all(user.clinicId) }); },
  });
}

export function useRefunds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: RETURN_KEYS.refunds(user?.clinicId ?? ""),
    queryFn: () => listRefunds(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useCreateRefund() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { returnId: string; amount: number; method: string; notes?: string }) =>
      createRefund({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: RETURN_KEYS.refunds(user.clinicId) }); },
  });
}

export function useProcessRefund() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => processRefund(id, { status }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: RETURN_KEYS.refunds(user.clinicId) }); },
  });
}
