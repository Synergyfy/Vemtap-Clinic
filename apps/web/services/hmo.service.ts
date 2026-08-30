import { api } from "@/lib/api";

// ─── Types (aligned with backend entities) ───
export type ClaimStatus = "submitted" | "under_review" | "approved" | "partially_approved" | "denied" | "appealed" | "settled";
export type AppealStatus = "submitted" | "under_review" | "upheld" | "overturned" | "closed";
export type RemittanceStatus = "pending" | "received" | "reconciled" | "disputed";

export interface HmoClaim {
  id: string;
  claimNumber: string;
  amountClaimed: number;
  amountApproved: number;
  status: ClaimStatus;
  diagnosis: string | null;
  treatmentDetails: string | null;
  documents: string | null;
  notes: string | null;
  submittedDate: string | null;
  reviewedDate: string | null;
  settledDate: string | null;
  hmoId: string;
  patientId: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  // Joined relations (when populated)
  hmo?: { id: string; name: string };
  patient?: { id: string; firstName: string; lastName: string };
}

export interface HmoAppeal {
  id: string;
  appealNumber: string;
  reason: string;
  disputedAmount: number | null;
  status: AppealStatus;
  supportingDocuments: string | null;
  resolutionNotes: string | null;
  resolvedDate: string | null;
  claimId: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  claim?: HmoClaim;
}

export interface HmoRemittance {
  id: string;
  remittanceNumber: string;
  totalAmount: number;
  commissionDeducted: number;
  netAmount: number;
  status: RemittanceStatus;
  claimsBreakdown: string | null;
  matchedClaimIds: string[];
  periodStart: string | null;
  periodEnd: string | null;
  receivedDate: string | null;
  notes: string | null;
  hmoId: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  hmo?: { id: string; name: string };
}

export interface HmoItem {
  id: string;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  commissionRate: number | null;
  isActive: boolean;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Create DTOs ───
export interface CreateClaimData {
  claimNumber: string;
  amountClaimed: number;
  diagnosis?: string;
  treatmentDetails?: string;
  notes?: string;
  hmoId: string;
  patientId: string;
  clinicId: string;
}

export interface UpdateClaimData {
  status?: ClaimStatus;
  amountApproved?: number;
  notes?: string;
}

export interface CreateAppealData {
  appealNumber: string;
  reason: string;
  disputedAmount?: number;
  supportingDocuments?: string;
  claimId: string;
  clinicId: string;
}

export interface UpdateAppealData {
  status?: AppealStatus;
  resolutionNotes?: string;
}

export interface CreateRemittanceData {
  remittanceNumber: string;
  totalAmount: number;
  commissionDeducted: number;
  netAmount: number;
  claimsBreakdown?: string;
  periodStart?: string;
  periodEnd?: string;
  hmoId: string;
  clinicId: string;
}

export interface UpdateRemittanceData {
  status?: RemittanceStatus;
  notes?: string;
}

// ─── API Functions ───

// HMOs
export async function listHmos(clinicId?: string): Promise<HmoItem[]> {
  const params = clinicId ? { clinicId } : {};
  const { data } = await api.get("/hmo", { params });
  return data;
}

// Claims
export async function listClaims(clinicId: string): Promise<HmoClaim[]> {
  const { data } = await api.get("/hmo/claims/all", { params: { clinicId } });
  return data;
}

export async function createClaim(dto: CreateClaimData): Promise<HmoClaim> {
  const { data } = await api.post("/hmo/claims", dto);
  return data;
}

export async function updateClaim(id: string, dto: UpdateClaimData): Promise<HmoClaim> {
  const { data } = await api.put(`/hmo/claims/${id}`, dto);
  return data;
}

// Appeals
export async function createAppeal(dto: CreateAppealData): Promise<HmoAppeal> {
  const { data } = await api.post("/hmo/appeals", dto);
  return data;
}

export async function updateAppeal(id: string, dto: UpdateAppealData): Promise<HmoAppeal> {
  const { data } = await api.put(`/hmo/appeals/${id}`, dto);
  return data;
}

// Remittances
export async function listRemittances(clinicId: string): Promise<HmoRemittance[]> {
  const { data } = await api.get("/hmo/remittances/all", { params: { clinicId } });
  return data;
}

export async function createRemittance(dto: CreateRemittanceData): Promise<HmoRemittance> {
  const { data } = await api.post("/hmo/remittances", dto);
  return data;
}

export async function matchRemittance(id: string, claimIds: string[]): Promise<HmoRemittance> {
  const { data } = await api.put(`/hmo/remittances/${id}/match`, { claimIds });
  return data;
}

// Reports
export async function getAgingReport(clinicId?: string): Promise<any> {
  const params = clinicId ? { clinicId } : {};
  const { data } = await api.get("/hmo/aging", { params });
  return data;
}

export async function getHmoTotals(clinicId: string): Promise<any[]> {
  const { data } = await api.get("/hmo/totals", { params: { clinicId } });
  return data;
}

export async function getHmoStats(clinicId: string): Promise<any> {
  const { data } = await api.get("/hmo/stats", { params: { clinicId } });
  return data;
}
