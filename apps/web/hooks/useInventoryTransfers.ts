import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  listTransfers,
  getTransferStats,
  getTransfer,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  approveTransfer,
  shipTransfer,
  receiveTransfer,
  cancelTransfer,
  type CreateTransferRequestDto,
  type UpdateTransferRequestDto,
  type TransferRequestQuery,
  type ApproveTransferDto,
  type ShipTransferDto,
  type ReceiveTransferDto,
  type CancelTransferDto,
  type TransferRequest,
  type TransferItem,
  type TransferItemDto,
  type TransferType,
  type TransferStatus,
  type ItemType,
} from "@/services/inventory-transfers.service";

export type {
  CreateTransferRequestDto,
  UpdateTransferRequestDto,
  TransferRequestQuery,
  ApproveTransferDto,
  ShipTransferDto,
  ReceiveTransferDto,
  CancelTransferDto,
  TransferRequest,
  TransferItem,
  TransferItemDto,
  TransferType,
  TransferStatus,
  ItemType,
};

export const TRANSFER_KEYS = {
  all: ["transfers"] as const,
  list: (clinicId?: string, query?: Partial<TransferRequestQuery>) =>
    ["transfers", "list", clinicId, query] as const,
  stats: (clinicId?: string) => ["transfers", "stats", clinicId] as const,
  detail: (id?: string) => ["transfers", "detail", id] as const,
};

export function useTransfers(query?: Omit<TransferRequestQuery, "clinicId">) {
  const { user } = useAuth();
  const clinicId = user?.clinicId;

  return useQuery({
    queryKey: TRANSFER_KEYS.list(clinicId, query),
    queryFn: () => listTransfers({ ...query, clinicId }),
    enabled: !!clinicId,
  });
}

export function useTransferStats() {
  const { user } = useAuth();
  const clinicId = user?.clinicId;

  return useQuery({
    queryKey: TRANSFER_KEYS.stats(clinicId),
    queryFn: () => getTransferStats(clinicId!),
    enabled: !!clinicId,
  });
}

export function useTransfer(id?: string) {
  return useQuery({
    queryKey: TRANSFER_KEYS.detail(id),
    queryFn: () => getTransfer(id!),
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (dto: CreateTransferRequestDto) => {
      if (!user?.clinicId) throw new Error("Clinic ID not found");
      return createTransfer(dto, user.clinicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
    },
  });
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTransferRequestDto }) =>
      updateTransfer(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(id) });
    },
  });
}

export function useDeleteTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
    },
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto?: ApproveTransferDto }) =>
      approveTransfer(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(id) });
    },
  });
}

export function useShipTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ShipTransferDto }) =>
      shipTransfer(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(id) });
    },
  });
}

export function useReceiveTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReceiveTransferDto }) =>
      receiveTransfer(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(id) });
    },
  });
}

export function useCancelTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CancelTransferDto }) =>
      cancelTransfer(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TRANSFER_KEYS.detail(id) });
    },
  });
}
