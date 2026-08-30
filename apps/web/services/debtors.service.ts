import { api } from "@/lib/api";

export interface Debtor {
  id: string;
  patientId: string;
  invoiceId: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: string;
  dueDate: string | null;
  notes: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  patient?: { id: string; firstName: string; lastName: string };
  invoice?: { id: string; invoiceNumber: string };
}

export interface DebtorStats {
  total: number;
  totalOwed: number;
  totalPaid: number;
  byStatus: Record<string, number>;
  byAging: Record<string, number>;
}

export interface PaymentPlan {
  id: string;
  debtorId: string;
  totalAmount: number;
  installmentAmount: number;
  frequency: string;
  status: string;
  clinicId: string;
  createdAt: string;
}

export async function listDebtors(clinicId: string, params?: { status?: string }): Promise<Debtor[]> {
  const { data } = await api.get("/debtors", { params: { clinicId, ...params } });
  return data;
}

export async function getDebtorStats(clinicId: string): Promise<DebtorStats> {
  const { data } = await api.get("/debtors/stats", { params: { clinicId } });
  return data;
}

export async function getAgingReport(clinicId: string): Promise<any> {
  const { data } = await api.get("/debtors/aging-report", { params: { clinicId } });
  return data;
}

export async function createDebtor(dto: { patientId: string; invoiceId: string; totalAmount: number; dueDate?: string; notes?: string; clinicId: string }): Promise<Debtor> {
  const { data } = await api.post("/debtors", dto);
  return data;
}

export async function updateDebtor(id: string, dto: Partial<{ status: string; notes: string }>): Promise<Debtor> {
  const { data } = await api.put(`/debtors/${id}`, dto);
  return data;
}

export async function deleteDebtor(id: string): Promise<void> {
  await api.delete(`/debtors/${id}`);
}

export async function recalculateDebtors(clinicId: string): Promise<any> {
  const { data } = await api.post("/debtors/recalculate", { clinicId });
  return data;
}

export async function listPaymentPlans(clinicId: string): Promise<PaymentPlan[]> {
  const { data } = await api.get("/debtors/payment-plans", { params: { clinicId } });
  return data;
}

export async function createPaymentPlan(dto: { debtorId: string; totalAmount: number; installmentAmount: number; frequency: string; clinicId: string }): Promise<PaymentPlan> {
  const { data } = await api.post("/debtors/payment-plans", dto);
  return data;
}
