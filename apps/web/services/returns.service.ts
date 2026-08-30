import { api } from "@/lib/api";

export interface ReturnRequest {
  id: string;
  patientId: string | null;
  productId: string;
  quantity: number;
  reason: string;
  status: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string };
  patient?: { id: string; firstName: string; lastName: string };
}

export interface Refund {
  id: string;
  returnId: string;
  amount: number;
  method: string;
  status: string;
  notes: string | null;
  clinicId: string;
  createdAt: string;
}

export async function listReturns(clinicId: string, params?: { status?: string }): Promise<ReturnRequest[]> {
  const { data } = await api.get("/returns", { params: { clinicId, ...params } });
  return data;
}

export async function getReturnStats(clinicId: string): Promise<any> {
  const { data } = await api.get("/returns/stats", { params: { clinicId } });
  return data;
}

export async function createReturn(dto: { patientId?: string; productId: string; quantity: number; reason: string; clinicId: string }): Promise<ReturnRequest> {
  const { data } = await api.post("/returns", dto);
  return data;
}

export async function reviewReturn(id: string, dto: { status: string; notes?: string }): Promise<ReturnRequest> {
  const { data } = await api.put(`/returns/${id}/review`, dto);
  return data;
}

export async function receiveReturn(id: string): Promise<ReturnRequest> {
  const { data } = await api.put(`/returns/${id}/receive`);
  return data;
}

export async function completeReturn(id: string): Promise<ReturnRequest> {
  const { data } = await api.put(`/returns/${id}/complete`);
  return data;
}

export async function listRefunds(clinicId: string): Promise<Refund[]> {
  const { data } = await api.get("/returns/refunds", { params: { clinicId } });
  return data;
}

export async function createRefund(dto: { returnId: string; amount: number; method: string; notes?: string; clinicId: string }): Promise<Refund> {
  const { data } = await api.post("/returns/refunds", dto);
  return data;
}

export async function processRefund(id: string, dto: { status: string }): Promise<Refund> {
  const { data } = await api.put(`/returns/refunds/${id}/process`, dto);
  return data;
}
