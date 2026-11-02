import { api } from "@/lib/api";

export type TransferType = "product" | "drug" | "optical" | "mixed";

export type TransferStatus =
  | "draft"
  | "requested"
  | "approved"
  | "in_transit"
  | "received"
  | "completed"
  | "cancelled"
  | "rejected";

export type ItemType = "product" | "drug" | "optical";

export interface TransferItemDto {
  itemType: ItemType;
  productId?: string;
  drugId?: string;
  opticalItemId?: string;
  quantityRequested: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
}

export interface CreateTransferRequestDto {
  type: TransferType;
  fromBranchId: string;
  toBranchId: string;
  reason?: string;
  notes?: string;
  items: TransferItemDto[];
}

export interface UpdateTransferRequestDto {
  type?: TransferType;
  fromBranchId?: string;
  toBranchId?: string;
  reason?: string;
  notes?: string;
  items?: TransferItemDto[];
}

export interface TransferRequestQuery {
  type?: TransferType;
  status?: TransferStatus;
  fromBranchId?: string;
  toBranchId?: string;
  clinicId?: string;
}

export interface ApproveTransferDto {
  notes?: string;
}

export interface ShipItemDto {
  itemId: string;
  quantityShipped: number;
}

export interface ShipTransferDto {
  items: ShipItemDto[];
  notes?: string;
}

export interface ReceiveItemDto {
  itemId: string;
  quantityReceived: number;
}

export interface ReceiveTransferDto {
  items: ReceiveItemDto[];
  notes?: string;
}

export interface CancelTransferDto {
  reason: string;
}

export interface TransferItem {
  id: string;
  transferRequestId: string;
  itemType: ItemType;
  productId?: string;
  product?: { id: string; name: string; sku?: string };
  drugId?: string;
  drug?: { id: string; name: string; genericName?: string };
  opticalItemId?: string;
  opticalItem?: { id: string; name: string; modelNumber?: string };
  quantityRequested: number;
  quantityShipped: number;
  quantityReceived: number;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
}

export interface TransferRequest {
  id: string;
  transferNumber: string;
  type: TransferType;
  fromBranchId: string;
  fromBranch?: { id: string; name: string; address?: string };
  toBranchId: string;
  toBranch?: { id: string; name: string; address?: string };
  status: TransferStatus;
  reason?: string;
  notes?: string;
  requestedById?: string;
  requestedBy?: { id: string; user?: { firstName?: string; lastName?: string } };
  requestedAt?: string;
  approvedById?: string;
  approvedBy?: { id: string; user?: { firstName?: string; lastName?: string } };
  approvedAt?: string;
  approvalNotes?: string;
  shippedById?: string;
  shippedBy?: { id: string; user?: { firstName?: string; lastName?: string } };
  shippedAt?: string;
  shippingNotes?: string;
  receivedById?: string;
  receivedBy?: { id: string; user?: { firstName?: string; lastName?: string } };
  receivedAt?: string;
  receivingNotes?: string;
  cancelledById?: string;
  cancelledBy?: { id: string; user?: { firstName?: string; lastName?: string } };
  cancelledAt?: string;
  cancellationReason?: string;
  clinicId: string;
  items: TransferItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TransferStats {
  totalTransfers: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

// 1. Create transfer request
export async function createTransfer(
  dto: CreateTransferRequestDto,
  clinicId: string
): Promise<TransferRequest> {
  const { data } = await api.post("/inventory-transfers", dto, {
    params: { clinicId },
  });
  return data;
}

// 2. List transfer requests
export async function listTransfers(
  query?: TransferRequestQuery
): Promise<TransferRequest[]> {
  const { data } = await api.get("/inventory-transfers", {
    params: query,
  });
  return data;
}

// 3. Get transfer statistics
export async function getTransferStats(
  clinicId: string
): Promise<TransferStats> {
  const { data } = await api.get("/inventory-transfers/stats", {
    params: { clinicId },
  });
  return data;
}

// 4. Get transfer request by ID
export async function getTransfer(id: string): Promise<TransferRequest> {
  const { data } = await api.get(`/inventory-transfers/${id}`);
  return data;
}

// 5. Update transfer request (only DRAFT/REQUESTED)
export async function updateTransfer(
  id: string,
  dto: UpdateTransferRequestDto
): Promise<TransferRequest> {
  const { data } = await api.put(`/inventory-transfers/${id}`, dto);
  return data;
}

// 6. Delete transfer (only DRAFT/CANCELLED/REJECTED)
export async function deleteTransfer(id: string): Promise<void> {
  await api.delete(`/inventory-transfers/${id}`);
}

// 7. Approve transfer request
export async function approveTransfer(
  id: string,
  dto?: ApproveTransferDto
): Promise<TransferRequest> {
  const { data } = await api.put(`/inventory-transfers/${id}/approve`, dto ?? {});
  return data;
}

// 8. Ship transfer (update shipped quantities)
export async function shipTransfer(
  id: string,
  dto: ShipTransferDto
): Promise<TransferRequest> {
  const { data } = await api.put(`/inventory-transfers/${id}/ship`, dto);
  return data;
}

// 9. Receive transfer at destination branch
export async function receiveTransfer(
  id: string,
  dto: ReceiveTransferDto
): Promise<TransferRequest> {
  const { data } = await api.put(`/inventory-transfers/${id}/receive`, dto);
  return data;
}

// 10. Cancel transfer
export async function cancelTransfer(
  id: string,
  dto: CancelTransferDto
): Promise<TransferRequest> {
  const { data } = await api.put(`/inventory-transfers/${id}/cancel`, dto);
  return data;
}
