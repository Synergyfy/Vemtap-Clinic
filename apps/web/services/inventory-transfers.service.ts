import { api } from "@/lib/api";

export interface TransferRequest {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  status: string;
  notes: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  fromBranch?: { id: string; name: string };
  toBranch?: { id: string; name: string };
  items?: TransferItem[];
}

export interface TransferItem {
  id: string;
  transferId: string;
  productId: string;
  quantityRequested: number;
  quantityShipped: number;
  quantityReceived: number;
  product?: { id: string; name: string };
}

export async function listTransfers(clinicId: string, params?: { status?: string }): Promise<TransferRequest[]> {
  const { data } = await api.get("/inventory-transfers", { params: { clinicId, ...params } });
  return data;
}

export async function getTransferStats(clinicId: string): Promise<any> {
  const { data } = await api.get("/inventory-transfers/stats", { params: { clinicId } });
  return data;
}

export async function getTransfer(id: string): Promise<TransferRequest> {
  const { data } = await api.get(`/inventory-transfers/${id}`);
  return data;
}

export async function createTransfer(dto: { fromBranchId: string; toBranchId: string; notes?: string; items: { productId: string; quantityRequested: number }[]; clinicId: string }): Promise<TransferRequest> {
  const { data } = await api.post("/inventory-transfers", dto);
  return data;
}

export async function approveTransfer(id: string): Promise<TransferRequest> {
  const { data } = await api.put(`/inventory-transfers/${id}/approve`);
  return data;
}

export async function shipTransfer(id: string, items: { id: string; quantityShipped: number }[]): Promise<TransferRequest> {
  const { data } = await api.put(`/inventory-transfers/${id}/ship`, { items });
  return data;
}

export async function receiveTransfer(id: string, items: { id: string; quantityReceived: number }[]): Promise<TransferRequest> {
  const { data } = await api.put(`/inventory-transfers/${id}/receive`, { items });
  return data;
}

export async function cancelTransfer(id: string): Promise<TransferRequest> {
  const { data } = await api.put(`/inventory-transfers/${id}/cancel`);
  return data;
}
