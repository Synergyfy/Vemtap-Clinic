import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listTransfers, getTransferStats, getTransfer, createTransfer,
  approveTransfer, shipTransfer, receiveTransfer, cancelTransfer,
} from "@/services/inventory-transfers.service";

const TRANSFER_KEYS = {
  all: (clinicId: string) => ["transfers", clinicId] as const,
  stats: (clinicId: string) => ["transfers", "stats", clinicId] as const,
  detail: (id: string) => ["transfer", id] as const,
};

export function useTransfers(filters?: { status?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...TRANSFER_KEYS.all(user?.clinicId ?? ""), filters],
    queryFn: () => listTransfers(user!.clinicId, filters),
    enabled: !!user?.clinicId,
  });
}

export function useTransferStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: TRANSFER_KEYS.stats(user?.clinicId ?? ""),
    queryFn: () => getTransferStats(user!.clinicId),
    enabled: !!user?.clinicId,
  });
}

export function useTransfer(id: string) {
  return useQuery({
    queryKey: TRANSFER_KEYS.detail(id),
    queryFn: () => getTransfer(id),
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (dto: { fromBranchId: string; toBranchId: string; notes?: string; items: { productId: string; quantityRequested: number }[] }) =>
      createTransfer({ ...dto, clinicId: user!.clinicId }),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: TRANSFER_KEYS.all(user.clinicId) }); },
  });
}

export function useApproveTransfer() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => approveTransfer(id),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: TRANSFER_KEYS.all(user.clinicId) }); },
  });
}

export function useShipTransfer() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: { id: string; quantityShipped: number }[] }) => shipTransfer(id, items),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: TRANSFER_KEYS.all(user.clinicId) }); },
  });
}

export function useReceiveTransfer() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, items }: { id: string; items: { id: string; quantityReceived: number }[] }) => receiveTransfer(id, items),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: TRANSFER_KEYS.all(user.clinicId) }); },
  });
}

export function useCancelTransfer() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => cancelTransfer(id),
    onSuccess: () => { if (user?.clinicId) qc.invalidateQueries({ queryKey: TRANSFER_KEYS.all(user.clinicId) }); },
  });
}
