import { api } from "@/lib/api";

// ─── Enums & Literals ───
export type HmoIntegrationProvider =
  | "nhif"
  | "aar"
  | "jubilee"
  | "britam"
  | "cic"
  | "uap"
  | "madison"
  | "heritage"
  | "ga"
  | "custom";

export type IntegrationStatus = "active" | "inactive" | "testing" | "error";

export type AuthType = "api_key" | "bearer_token" | "oauth2" | "basic_auth" | "custom";

export type EndpointType =
  | "eligibility_check"
  | "claim_submission"
  | "claim_status"
  | "remittance_advice"
  | "provider_directory"
  | "benefit_schedule"
  | "pre_authorization"
  | "claim_reversal";

export type ApiLogStatus = "success" | "failed" | "timeout" | "rate_limited" | "retry";

export type LogDirection = "outbound" | "inbound";

// ─── Interfaces ───
export interface AuthConfig {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  tokenUrl?: string;
  custom?: Record<string, any>;
}

export interface EndpointConfig {
  eligibility_check?: string;
  claim_submission?: string;
  claim_status?: string;
  remittance_advice?: string;
  provider_directory?: string;
  benefit_schedule?: string;
  pre_authorization?: string;
  claim_reversal?: string;
}

export interface HmoIntegration {
  id: string;
  integrationName: string;
  provider: HmoIntegrationProvider;
  status: IntegrationStatus;
  authType: AuthType;
  authConfig?: AuthConfig;
  endpoints: EndpointConfig;
  requestHeaders?: Record<string, string>;
  requestTransforms?: Record<string, any>;
  responseTransforms?: Record<string, any>;
  timeoutMs: number;
  maxRetries: number;
  retryConfig?: Record<string, any>;
  lastTestedAt?: string | null;
  lastTestStatus?: string | null;
  lastError?: string | null;
  clinicId: string;
  createdAt: string;
  updatedAt: string;
  clinic?: {
    id: string;
    name: string;
  };
}

export interface HmoApiLog {
  id: string;
  integrationId: string;
  endpointType: EndpointType;
  direction: LogDirection;
  requestUrl?: string;
  requestMethod?: string;
  requestHeaders?: string;
  requestBody?: string;
  responseBody?: string;
  responseStatus?: number;
  responseHeaders?: string;
  durationMs?: number;
  status: ApiLogStatus;
  errorMessage?: string;
  retryCount?: number;
  correlationId?: string;
  referenceId?: string;
  referenceType?: string;
  clinicId: string;
  createdAt: string;
  integration?: {
    id: string;
    integrationName: string;
    provider: HmoIntegrationProvider;
  };
}

export interface HmoIntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  totalLogs: number;
  successRate: number;
  avgDurationMs: number;
}

// ─── DTOs ───
export interface CreateHmoIntegrationDto {
  integrationName: string;
  provider: HmoIntegrationProvider;
  status?: IntegrationStatus;
  authType?: AuthType;
  authConfig?: AuthConfig;
  endpoints: EndpointConfig;
  requestHeaders?: Record<string, string>;
  requestTransforms?: Record<string, any>;
  responseTransforms?: Record<string, any>;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface UpdateHmoIntegrationDto {
  integrationName?: string;
  status?: IntegrationStatus;
  authType?: AuthType;
  authConfig?: AuthConfig;
  endpoints?: EndpointConfig;
  requestHeaders?: Record<string, string>;
  requestTransforms?: Record<string, any>;
  responseTransforms?: Record<string, any>;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface HmoIntegrationQueryDto {
  provider?: HmoIntegrationProvider;
  status?: IntegrationStatus;
  clinicId?: string;
}

export interface TestIntegrationDto {
  endpointType: EndpointType;
  testPayload?: Record<string, any>;
}

export interface TestIntegrationResult {
  success: boolean;
  response?: any;
  error?: string;
  durationMs: number;
}

export interface EligibilityCheckDto {
  memberNumber: string;
  patientId: string;
  serviceCode?: string;
  providerId?: string;
}

export interface ClaimSubmissionDto {
  claimId: string;
  patientId: string;
  serviceCodes: string[];
  totalAmount: number;
  diagnosisCode?: string;
  providerId?: string;
}

export interface RemittanceParseDto {
  remittanceId: string;
  rawData: string;
}

export interface HmoApiLogQueryDto {
  integrationId?: string;
  endpointType?: EndpointType;
  direction?: LogDirection;
  status?: ApiLogStatus;
  clinicId?: string;
  correlationId?: string;
}

// ─── API Functions ───

// Integrations CRUD
export async function createHmoIntegration(
  dto: CreateHmoIntegrationDto,
  clinicId: string
): Promise<HmoIntegration> {
  const { data } = await api.post("/hmo-integrations", dto, {
    params: { clinicId },
  });
  return data;
}

export async function listHmoIntegrations(
  query: HmoIntegrationQueryDto = {}
): Promise<HmoIntegration[]> {
  const { data } = await api.get("/hmo-integrations", { params: query });
  return data;
}

export async function getHmoIntegrationStats(
  clinicId: string
): Promise<HmoIntegrationStats> {
  const { data } = await api.get("/hmo-integrations/stats", {
    params: { clinicId },
  });
  return data;
}

export async function getHmoIntegrationById(id: string): Promise<HmoIntegration> {
  const { data } = await api.get(`/hmo-integrations/${id}`);
  return data;
}

export async function updateHmoIntegration(
  id: string,
  dto: UpdateHmoIntegrationDto
): Promise<HmoIntegration> {
  const { data } = await api.put(`/hmo-integrations/${id}`, dto);
  return data;
}

export async function deleteHmoIntegration(id: string): Promise<void> {
  await api.delete(`/hmo-integrations/${id}`);
}

// Testing
export async function testHmoIntegration(
  id: string,
  dto: TestIntegrationDto
): Promise<TestIntegrationResult> {
  const { data } = await api.post(`/hmo-integrations/${id}/test`, dto);
  return data;
}

// API Operations
export async function checkHmoEligibility(
  id: string,
  dto: EligibilityCheckDto
): Promise<any> {
  const { data } = await api.post(`/hmo-integrations/${id}/eligibility`, dto);
  return data;
}

export async function submitClaimToHmo(
  id: string,
  dto: ClaimSubmissionDto
): Promise<any> {
  const { data } = await api.post(`/hmo-integrations/${id}/claims`, dto);
  return data;
}

export async function checkHmoClaimStatus(
  id: string,
  claimId: string
): Promise<any> {
  const { data } = await api.get(`/hmo-integrations/${id}/claims/${claimId}/status`);
  return data;
}

export async function parseHmoRemittance(
  id: string,
  dto: RemittanceParseDto
): Promise<any> {
  const { data } = await api.post(`/hmo-integrations/${id}/remittance`, dto);
  return data;
}

// Logs
export async function listHmoApiLogs(
  query: HmoApiLogQueryDto = {}
): Promise<HmoApiLog[]> {
  const { data } = await api.get("/hmo-integrations/logs", { params: query });
  return data;
}

export async function getHmoApiLogById(id: string): Promise<HmoApiLog> {
  const { data } = await api.get(`/hmo-integrations/logs/${id}`);
  return data;
}
