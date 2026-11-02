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
  notes?: string;
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

export async function listAppeals(clinicId: string): Promise<HmoAppeal[]> {
  const { data } = await api.get("/hmo/appeals", { params: { clinicId } });
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

// ─── HMO CRUD ───
export async function createHmo(dto: { name: string; contactPerson?: string; phone?: string; email?: string; address?: string; commissionRate?: number; clinicId: string }): Promise<HmoItem> {
  const { data } = await api.post("/hmo", dto);
  return data;
}

export async function getHmo(id: string): Promise<HmoItem> {
  const { data } = await api.get(`/hmo/${id}`);
  return data;
}

export async function updateHmo(id: string, dto: Partial<HmoItem>): Promise<HmoItem> {
  const { data } = await api.put(`/hmo/${id}`, dto);
  return data;
}

// ─── Plans ───
export interface HmoPlan {
  id: string;
  name: string;
  hmoId: string;
  description: string | null;
  coveragePercentage: number;
  requiresPreAuth?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function listPlans(hmoId: string): Promise<HmoPlan[]> {
  const { data } = await api.get(`/hmo/plans/${hmoId}`);
  return data;
}

export async function createPlan(dto: { name: string; hmoId: string; description?: string; coveragePercentage: number }): Promise<HmoPlan> {
  const { data } = await api.post("/hmo/plans", dto);
  return data;
}

export async function updatePlan(id: string, dto: Partial<HmoPlan>): Promise<HmoPlan> {
  const { data } = await api.put(`/hmo/plans/${id}`, dto);
  return data;
}

export async function deletePlan(id: string): Promise<void> {
  await api.delete(`/hmo/plans/${id}`);
}

// ─── Coverage Check ───
export interface CoverageCheckPayload {
  patientId: string;
  hmoId: string;
  serviceType: "consultation" | "eye_test" | "optical" | "drug" | "surgery" | string;
  serviceAmount: number;
}

export interface CoverageCheckResult {
  covered: boolean;
  coveragePercent: number;
  copayAmount: number;
  hmoPays: number;
  patientPays: number;
  requiresAuthorization: boolean;
  remainingAllowance: number;
  planName: string;
}

export async function checkCoverage(dto: CoverageCheckPayload): Promise<CoverageCheckResult> {
  const { data } = await api.post("/hmo/coverage-check", dto);
  return data;
}

// ─── Agreements ───
export interface HmoAgreement {
  id: string;
  agreementNumber: string;
  startDate: string;
  endDate: string;
  paymentCycle?: string;
  claimsSubmissionSchedule?: string;
  consultationPrice?: number;
  eyeTestPrice?: number;
  opticalFramePrice?: number;
  lensPrice?: number;
  drugMarkup?: number;
  surgeryPrice?: number;
  isActive: boolean;
  hmoId: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  hmo?: { id: string; name: string };
  clinic?: { id: string; name: string };
}

export interface CreateAgreementPayload {
  agreementNumber: string;
  startDate: string;
  endDate: string;
  paymentCycle?: "monthly" | "quarterly" | "bi-annually" | "annually" | string;
  claimsSubmissionSchedule?: "monthly" | "bi-weekly" | "weekly" | string;
  consultationPrice?: number;
  eyeTestPrice?: number;
  opticalFramePrice?: number;
  lensPrice?: number;
  drugMarkup?: number;
  surgeryPrice?: number;
  hmoId: string;
  clinicId: string;
}

export async function listAgreements(hmoId: string, clinicId?: string): Promise<HmoAgreement[]> {
  const params = clinicId ? { clinicId } : {};
  const { data } = await api.get(`/hmo/agreements/${hmoId}`, { params });
  return data;
}

export async function getAgreementDetail(id: string): Promise<HmoAgreement> {
  const { data } = await api.get(`/hmo/agreements/detail/${id}`);
  return data;
}

export async function createAgreement(dto: CreateAgreementPayload): Promise<HmoAgreement> {
  const { data } = await api.post("/hmo/agreements", dto);
  return data;
}

export async function updateAgreement(id: string, dto: Partial<CreateAgreementPayload> & { isActive?: boolean }): Promise<HmoAgreement> {
  const { data } = await api.put(`/hmo/agreements/${id}`, dto);
  return data;
}

// ─── Authorizations ───
export interface HmoAuthorization {
  id: string;
  authorizationNumber: string;
  serviceType: string;
  clinicalJustification?: string | null;
  estimatedCost: number;
  approvedAmount?: string | number | null;
  hmoReferenceNumber?: string | null;
  hmoNotes?: string | null;
  rejectionReason?: string | null;
  status: "pending" | "submitted" | "approved" | "rejected" | "expired" | "escalated" | "cancelled" | string;
  expiryDate?: string | null;
  approvedDate?: string | null;
  patientId: string;
  hmoId: string;
  planId?: string | null;
  requestedById?: string | null;
  approvedById?: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  patient?: { id: string; firstName: string; lastName: string };
  hmo?: { id: string; name: string };
}

export interface CreateAuthorizationPayload {
  authorizationNumber: string;
  serviceType: "consultation" | "eye_test" | "optical" | "drug" | "surgery" | "procedure" | string;
  clinicalJustification?: string;
  estimatedCost: number;
  patientId: string;
  hmoId: string;
  planId?: string;
  requestedById?: string;
  expiryDate?: string;
  clinicId: string;
}

export interface UpdateAuthorizationPayload {
  status?: string;
  approvedAmount?: string;
  hmoReferenceNumber?: string;
  hmoNotes?: string;
  rejectionReason?: string;
  approvedById?: string;
}

export async function listAuthorizations(clinicId: string, params?: { status?: string }): Promise<HmoAuthorization[]> {
  const { data } = await api.get("/hmo/authorizations", { params: { clinicId, ...params } });
  return data;
}

export async function getPendingAuthorizations(clinicId: string): Promise<HmoAuthorization[]> {
  const { data } = await api.get("/hmo/authorizations/pending", { params: { clinicId } });
  return data;
}

export async function getAuthorizationDetail(id: string): Promise<HmoAuthorization> {
  const { data } = await api.get(`/hmo/authorizations/${id}`);
  return data;
}

export async function createAuthorization(dto: CreateAuthorizationPayload): Promise<HmoAuthorization> {
  const { data } = await api.post("/hmo/authorizations", dto);
  return data;
}

export async function updateAuthorization(id: string, dto: UpdateAuthorizationPayload): Promise<HmoAuthorization> {
  const { data } = await api.put(`/hmo/authorizations/${id}`, dto);
  return data;
}

// ─── Claim Batches ───
export interface ClaimBatch {
  id: string;
  batchNumber: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  notes?: string | null;
  totalClaims: number;
  totalAmount: number;
  approvedAmount?: number | null;
  status: "draft" | "submitted" | "processing" | "completed" | "rejected" | string;
  submittedDate?: string | null;
  completedDate?: string | null;
  hmoId: string;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  hmo?: { id: string; name: string };
}

export interface CreateClaimBatchPayload {
  batchNumber: string;
  periodStart?: string;
  periodEnd?: string;
  notes?: string;
  hmoId: string;
  clinicId: string;
}

export interface UpdateClaimBatchPayload {
  status?: "draft" | "submitted" | "processing" | "completed" | "rejected" | string;
  approvedAmount?: number;
  notes?: string;
}

export async function listClaimBatches(clinicId: string): Promise<ClaimBatch[]> {
  const { data } = await api.get("/hmo/batches", { params: { clinicId } });
  return data;
}

export async function createClaimBatch(dto: CreateClaimBatchPayload): Promise<ClaimBatch> {
  const { data } = await api.post("/hmo/batches", dto);
  return data;
}

export async function addClaimsToBatch(id: string, claimIds: string[]): Promise<ClaimBatch> {
  const { data } = await api.put(`/hmo/batches/${id}/add-claims`, { claimIds });
  return data;
}

export async function updateClaimBatch(id: string, dto: UpdateClaimBatchPayload): Promise<ClaimBatch> {
  const { data } = await api.put(`/hmo/batches/${id}`, dto);
  return data;
}

// ─── Claim Documents ───
export interface ClaimDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  documentType?: string;
  claimId: string;
  createdAt: string;
}

export interface UploadClaimDocumentPayload {
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  documentType?: string;
  claimId: string;
}

export async function listClaimDocuments(claimId: string): Promise<ClaimDocument[]> {
  const { data } = await api.get(`/hmo/documents/${claimId}`);
  return data;
}

export async function uploadClaimDocument(dto: UploadClaimDocumentPayload): Promise<ClaimDocument> {
  const { data } = await api.post("/hmo/documents", dto);
  return data;
}

export async function deleteClaimDocument(id: string): Promise<void> {
  await api.delete(`/hmo/documents/${id}`);
}

