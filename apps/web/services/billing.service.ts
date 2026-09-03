import { api } from "@/lib/api";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: string;
  items: string;
  dueDate: string | null;
  notes: string | null;
  patientId: string;
  staffId: string | null;
  branchId: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  patient?: { id: string; firstName: string; lastName: string };
}

export interface Payment {
  id: string;
  amount: number;
  paymentMethod: string;
  reference: string | null;
  notes: string | null;
  invoiceId: string;
  receivedById: string | null;
  clinicId: string;
  createdAt: string;
}

export interface CreateInvoiceData {
  invoiceNumber: string;
  totalAmount: number;
  items: string;
  dueDate?: string;
  notes?: string;
  patientId: string;
  staffId?: string;
  branchId: string;
  clinicId: string;
}

export interface CreatePaymentData {
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  invoiceId: string;
  receivedById?: string;
  clinicId: string;
}

export async function listInvoices(clinicId: string, patientId?: string): Promise<Invoice[]> {
  const params: any = { clinicId };
  if (patientId) params.patientId = patientId;
  const { data } = await api.get("/billing/invoices", { params });
  return data;
}

export async function createInvoice(dto: CreateInvoiceData): Promise<Invoice> {
  const { data } = await api.post("/billing/invoices", dto);
  return data;
}

export async function makePayment(dto: CreatePaymentData): Promise<Payment> {
  const { data } = await api.post("/billing/payments", dto);
  return data;
}

export async function getInvoicePayments(invoiceId: string): Promise<Payment[]> {
  const { data } = await api.get(`/billing/invoices/${invoiceId}/payments`);
  return data;
}

export async function getRevenue(clinicId: string): Promise<any> {
  const { data } = await api.get("/billing/revenue", { params: { clinicId } });
  return data;
}
