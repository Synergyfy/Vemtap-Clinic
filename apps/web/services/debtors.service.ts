import { api } from "@/lib/api";

export type DebtorType = "patient" | "hmo";

export type DebtorStatus =
  | "active"
  | "on_plan"
  | "in_collection"
  | "settled"
  | "write_off";

export type PaymentPlanStatus = "active" | "completed" | "defaulted" | "cancelled";

export type CollectionActivityType =
  | "phone_call"
  | "email"
  | "sms"
  | "letter"
  | "in_person"
  | "payment_received"
  | "promise_to_pay"
  | "dispute"
  | "legal_action"
  | "write_off";

export type CollectionOutcome =
  | "successful"
  | "unsuccessful"
  | "promised"
  | "disputed"
  | "no_contact"
  | "rescheduled";

export interface CreateDebtorDto {
  type: DebtorType;
  patientId?: string;
  hmoId?: string;
  totalOutstanding?: number;
  assignedCollectorId?: string;
  notes?: string;
  nextFollowUpDate?: string;
}

export interface UpdateDebtorDto {
  status?: DebtorStatus;
  assignedCollectorId?: string;
  notes?: string;
  nextFollowUpDate?: string;
}

export interface DebtorQuery {
  type?: DebtorType;
  status?: DebtorStatus;
  patientId?: string;
  hmoId?: string;
  assignedCollectorId?: string;
  clinicId?: string;
}

export interface AgingReportQuery {
  clinicId?: string;
  asOfDate?: string;
}

export interface CreatePaymentPlanDto {
  debtorId: string;
  totalAmount: number;
  totalInstallments: number;
  startDate: string;
  endDate: string;
  approvedById?: string;
  notes?: string;
}

export interface UpdatePaymentPlanDto {
  status?: PaymentPlanStatus;
  notes?: string;
}

export interface PaymentPlanQuery {
  debtorId?: string;
  status?: PaymentPlanStatus;
  clinicId?: string;
}

export interface CreateCollectionActivityDto {
  debtorId: string;
  activityType: CollectionActivityType;
  outcome?: CollectionOutcome;
  description?: string;
  amountPromised?: number;
  promiseDate?: string;
  nextActionDate?: string;
  nextActionNotes?: string;
}

export interface UpdateCollectionActivityDto {
  outcome?: CollectionOutcome;
  amountPromised?: number;
  promiseDate?: string;
  nextActionDate?: string;
  nextActionNotes?: string;
}

export interface CollectionActivityQuery {
  debtorId?: string;
  activityType?: CollectionActivityType;
  outcome?: CollectionOutcome;
  performedById?: string;
  clinicId?: string;
}

export interface Debtor {
  id: string;
  debtorNumber: string;
  type: DebtorType;
  patientId?: string;
  patient?: { id: string; firstName: string; lastName: string; phone?: string; email?: string };
  hmoId?: string;
  hmo?: { id: string; name: string };
  totalOutstanding: number;
  currentBalance: number;
  overdue30: number;
  overdue60: number;
  overdue90: number;
  overdue120Plus: number;
  status: DebtorStatus;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  assignedCollectorId?: string;
  assignedCollector?: { id: string; firstName?: string; lastName?: string; user?: { firstName?: string; lastName?: string } };
  notes?: string;
  nextFollowUpDate?: string;
  clinicId: string;
  paymentPlans?: PaymentPlan[];
  collectionActivities?: CollectionActivity[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentPlanInstallment {
  id: string;
  installmentNumber: number;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paidDate?: string;
  status: string;
}

export interface PaymentPlan {
  id: string;
  planNumber: string;
  debtorId: string;
  debtor?: Debtor;
  totalAmount: number;
  amountPaid: number;
  amountRemaining: number;
  totalInstallments: number;
  installmentsPaid: number;
  startDate: string;
  endDate: string;
  status: PaymentPlanStatus;
  approvedById?: string;
  approvedBy?: { id: string; firstName?: string; lastName?: string };
  notes?: string;
  installments?: PaymentPlanInstallment[];
  clinicId: string;
  createdAt: string;
}

export interface CollectionActivity {
  id: string;
  debtorId: string;
  debtor?: Debtor;
  activityType: CollectionActivityType;
  outcome?: CollectionOutcome;
  description?: string;
  amountPromised?: number;
  promiseDate?: string;
  performedById?: string;
  performedBy?: { id: string; firstName?: string; lastName?: string; user?: { firstName?: string; lastName?: string } };
  nextActionDate?: string;
  nextActionNotes?: string;
  clinicId: string;
  createdAt: string;
}

export interface DebtorStats {
  totalDebtors: number;
  totalOutstanding: number;
  byStatus: Record<string, number>;
  aging: {
    current: number;
    overdue30: number;
    overdue60: number;
    overdue90: number;
    overdue120Plus: number;
  };
  paymentPlans: {
    active: number;
    completed: number;
    defaulted: number;
  };
}

export interface AgingReportItem {
  debtorNumber: string;
  name: string;
  type: DebtorType;
  totalOutstanding: number;
  current: number;
  overdue30: number;
  overdue60: number;
  overdue90: number;
  overdue120Plus: number;
  status: DebtorStatus;
  lastPaymentDate?: string;
  assignedCollector?: string;
}

// ========== 1-8: Debtor CRUD, Stats, Aging, Recalculate ==========

export async function createDebtor(
  dto: CreateDebtorDto,
  clinicId: string
): Promise<Debtor> {
  const { data } = await api.post("/debtors", dto, {
    params: { clinicId },
  });
  return data;
}

export async function listDebtors(
  query?: DebtorQuery
): Promise<Debtor[]> {
  const { data } = await api.get("/debtors", {
    params: query,
  });
  return data;
}

export async function getDebtorStats(
  clinicId: string
): Promise<DebtorStats> {
  const { data } = await api.get("/debtors/stats", {
    params: { clinicId },
  });
  return data;
}

export async function getAgingReport(
  query?: AgingReportQuery
): Promise<AgingReportItem[]> {
  const { data } = await api.get("/debtors/aging-report", {
    params: query,
  });
  return data;
}

export async function recalculateDebtors(
  clinicId: string,
  asOfDate?: string
): Promise<{ updated: number }> {
  const { data } = await api.post("/debtors/recalculate", null, {
    params: { clinicId, asOfDate: asOfDate || new Date().toISOString() },
  });
  return data;
}

export async function getDebtor(id: string): Promise<Debtor> {
  const { data } = await api.get(`/debtors/${id}`);
  return data;
}

export async function updateDebtor(
  id: string,
  dto: UpdateDebtorDto
): Promise<Debtor> {
  const { data } = await api.put(`/debtors/${id}`, dto);
  return data;
}

export async function deleteDebtor(id: string): Promise<void> {
  await api.delete(`/debtors/${id}`);
}

// ========== 9-12: Payment Plans ==========

export async function createPaymentPlan(
  dto: CreatePaymentPlanDto,
  clinicId: string
): Promise<PaymentPlan> {
  const { data } = await api.post("/debtors/payment-plans", dto, {
    params: { clinicId },
  });
  return data;
}

export async function listPaymentPlans(
  query?: PaymentPlanQuery
): Promise<PaymentPlan[]> {
  const { data } = await api.get("/debtors/payment-plans", {
    params: query,
  });
  return data;
}

export async function getPaymentPlan(id: string): Promise<PaymentPlan> {
  const { data } = await api.get(`/debtors/payment-plans/${id}`);
  return data;
}

export async function updatePaymentPlan(
  id: string,
  dto: UpdatePaymentPlanDto
): Promise<PaymentPlan> {
  const { data } = await api.put(`/debtors/payment-plans/${id}`, dto);
  return data;
}

// ========== 13-15: Collection Activities ==========

export async function createCollectionActivity(
  dto: CreateCollectionActivityDto,
  clinicId: string
): Promise<CollectionActivity> {
  const { data } = await api.post("/debtors/activities", dto, {
    params: { clinicId },
  });
  return data;
}

export async function listCollectionActivities(
  query?: CollectionActivityQuery
): Promise<CollectionActivity[]> {
  const { data } = await api.get("/debtors/activities", {
    params: query,
  });
  return data;
}

export async function updateCollectionActivity(
  id: string,
  dto: UpdateCollectionActivityDto
): Promise<CollectionActivity> {
  const { data } = await api.put(`/debtors/activities/${id}`, dto);
  return data;
}
