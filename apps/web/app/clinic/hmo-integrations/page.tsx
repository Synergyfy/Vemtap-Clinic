"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { usePatients } from "@/hooks/usePatients";
import {
  useHmoIntegrations,
  useHmoIntegrationStats,
  useHmoApiLogs,
  useCreateHmoIntegration,
  useUpdateHmoIntegration,
  useDeleteHmoIntegration,
  useTestHmoIntegration,
  useCheckHmoEligibility,
  useSubmitClaimToHmo,
  useCheckHmoClaimStatus,
  useParseHmoRemittance,
} from "@/hooks/useHmoIntegrations";
import type {
  HmoIntegration,
  HmoApiLog,
  HmoIntegrationProvider,
  IntegrationStatus,
  AuthType,
  EndpointType,
  ApiLogStatus,
  LogDirection,
  CreateHmoIntegrationDto,
  UpdateHmoIntegrationDto,
} from "@/services/hmo-integrations.service";
import {
  Network,
  Cpu,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  FileCode,
  Send,
  Database,
  Trash2,
  Edit3,
  Eye,
  Copy,
  Check,
  Server,
  ArrowUpRight,
  ArrowDownLeft,
  Settings,
  HelpCircle,
  Code2,
  Terminal,
  ExternalLink,
  ChevronRight,
  FileText,
  Sliders,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Constants & Metadata ───

const PROVIDER_OPTIONS: { id: HmoIntegrationProvider; label: string; tag: string }[] = [
  { id: "nhif", label: "NHIF / SHA Kenya", tag: "National" },
  { id: "aar", label: "AAR Insurance", tag: "Private" },
  { id: "jubilee", label: "Jubilee Health", tag: "Private" },
  { id: "britam", label: "Britam Health", tag: "Private" },
  { id: "cic", label: "CIC Insurance Group", tag: "Private" },
  { id: "uap", label: "UAP Old Mutual", tag: "Private" },
  { id: "madison", label: "Madison Insurance", tag: "Private" },
  { id: "heritage", label: "Heritage Insurance", tag: "Private" },
  { id: "ga", label: "GA Insurance", tag: "Private" },
  { id: "custom", label: "Custom HMO Gateway", tag: "Direct B2B" },
];

const ENDPOINT_TYPES: { id: EndpointType; label: string; desc: string }[] = [
  { id: "eligibility_check", label: "Eligibility Check", desc: "Real-time patient coverage verification" },
  { id: "claim_submission", label: "Claim Submission", desc: "Direct electronic claim EDI/JSON payload" },
  { id: "claim_status", label: "Claim Status", desc: "Adjudication and payment pipeline query" },
  { id: "remittance_advice", label: "Remittance Advice", desc: "Electronic Remittance Advice (ERA) parsing" },
  { id: "pre_authorization", label: "Pre-Authorization", desc: "Prior approval requests for high-cost care" },
  { id: "provider_directory", label: "Provider Directory", desc: "Facility and doctor validation catalog" },
  { id: "benefit_schedule", label: "Benefit Schedule", desc: "Co-pay, limits, and deductible matrices" },
  { id: "claim_reversal", label: "Claim Reversal", desc: "Voiding or retracting unverified submissions" },
];

const SAMPLE_PAYLOADS: Record<EndpointType, any> = {
  eligibility_check: {
    memberNumber: "MEM-992019-NHIF",
    patientId: "patient_01",
    serviceCode: "OPT-CONSULT-01",
    providerId: "CLINIC-MAIN",
  },
  claim_submission: {
    claimId: "CLM-2026-0082",
    patientId: "patient_01",
    serviceCodes: ["OPT-CONSULT-01", "LENS-ANTI-REFL-02"],
    totalAmount: 48500,
    diagnosisCode: "H52.1",
    providerId: "CLINIC-MAIN",
  },
  claim_status: {
    claimId: "CLM-2026-0082",
  },
  remittance_advice: {
    remittanceId: "REM-2026-4421",
    rawData: JSON.stringify({
      paymentReference: "EFT-883921",
      settledAmount: 142000,
      claims: [
        { claimId: "CLM-2026-0082", paid: 48500, status: "APPROVED" },
        { claimId: "CLM-2026-0081", paid: 93500, status: "APPROVED" },
      ],
    }),
  },
  pre_authorization: {
    patientId: "patient_01",
    procedureCode: "CATARACT-SURG-L",
    estimatedCost: 185000,
  },
  provider_directory: {
    facilityCode: "FAC-NAI-001",
  },
  benefit_schedule: {
    policyTier: "GOLD-CORPORATE",
  },
  claim_reversal: {
    claimId: "CLM-2026-0082",
    reason: "DUPLICATE_ENTRY",
  },
};

type ActiveMainTab = "integrations" | "sandbox" | "operations" | "logs";
type OperationSubTab = "eligibility" | "claims" | "status" | "remittance";

export default function HmoIntegrationsPage() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  const [activeTab, setActiveTab] = useState<ActiveMainTab>("integrations");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const {
    data: integrations = [],
    isLoading: loadingIntegrations,
    refetch: refetchIntegrations,
  } = useHmoIntegrations();
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useHmoIntegrationStats();
  const {
    data: logs = [],
    isLoading: loadingLogs,
    refetch: refetchLogs,
  } = useHmoApiLogs();

  const { data: patientsData } = usePatients({ clinicId, limit: 100 });
  const patients = Array.isArray(patientsData?.data)
    ? patientsData.data
    : Array.isArray(patientsData)
    ? patientsData
    : [];

  // Mutations
  const createMut = useCreateHmoIntegration();
  const updateMut = useUpdateHmoIntegration();
  const deleteMut = useDeleteHmoIntegration();
  const testMut = useTestHmoIntegration();
  const checkEligibilityMut = useCheckHmoEligibility();
  const submitClaimMut = useSubmitClaimToHmo();
  const checkStatusMut = useCheckHmoClaimStatus();
  const parseRemittanceMut = useParseHmoRemittance();

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<HmoIntegration | null>(null);
  const [deletingIntegration, setDeletingIntegration] = useState<HmoIntegration | null>(null);
  const [selectedLog, setSelectedLog] = useState<HmoApiLog | null>(null);

  // Form State for Create/Edit
  const [formName, setFormName] = useState("");
  const [formProvider, setFormProvider] = useState<HmoIntegrationProvider>("nhif");
  const [formStatus, setFormStatus] = useState<IntegrationStatus>("active");
  const [formAuthType, setFormAuthType] = useState<AuthType>("api_key");
  const [formApiKey, setFormApiKey] = useState("");
  const [formClientId, setFormClientId] = useState("");
  const [formClientSecret, setFormClientSecret] = useState("");
  const [formTokenUrl, setFormTokenUrl] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formEndpoints, setFormEndpoints] = useState<Record<string, string>>({
    eligibility_check: "",
    claim_submission: "",
    claim_status: "",
    remittance_advice: "",
    pre_authorization: "",
    provider_directory: "",
    benefit_schedule: "",
    claim_reversal: "",
  });
  const [formTimeout, setFormTimeout] = useState(30000);
  const [formMaxRetries, setFormMaxRetries] = useState(3);
  const [formHeadersJson, setFormHeadersJson] = useState("");

  // Sandbox State
  const [sandboxIntegrationId, setSandboxIntegrationId] = useState<string>("");
  const [sandboxEndpoint, setSandboxEndpoint] = useState<EndpointType>("eligibility_check");
  const [sandboxPayload, setSandboxPayload] = useState<string>(
    JSON.stringify(SAMPLE_PAYLOADS.eligibility_check, null, 2)
  );
  const [sandboxResult, setSandboxResult] = useState<any | null>(null);
  const [copiedLog, setCopiedLog] = useState(false);

  // Live Operations State
  const [opsSubTab, setOpsSubTab] = useState<OperationSubTab>("eligibility");
  const [opsIntegrationId, setOpsIntegrationId] = useState<string>("");

  // Eligibility form
  const [elMemberNum, setElMemberNum] = useState("");
  const [elPatientId, setElPatientId] = useState("");
  const [elServiceCode, setElServiceCode] = useState("OPT-CONSULT-01");
  const [elProviderId, setElProviderId] = useState("CLINIC-MAIN");
  const [elResult, setElResult] = useState<any>(null);

  // Claim form
  const [clClaimId, setClClaimId] = useState(`CLM-${Date.now().toString().slice(-4)}`);
  const [clPatientId, setClPatientId] = useState("");
  const [clServiceCodes, setClServiceCodes] = useState("OPT-EXAM-01, EYE-LENS-01");
  const [clTotalAmount, setClTotalAmount] = useState<number>(35000);
  const [clDiagCode, setClDiagCode] = useState("H52.1");
  const [clResult, setClResult] = useState<any>(null);

  // Claim status form
  const [statusClaimId, setStatusClaimId] = useState("");
  const [statusResult, setStatusResult] = useState<any>(null);

  // Remittance form
  const [remRemittanceId, setRemRemittanceId] = useState(`REM-${Date.now().toString().slice(-4)}`);
  const [remRawData, setRemRawData] = useState(
    JSON.stringify(
      {
        provider: "nhif",
        batchDate: new Date().toISOString(),
        totalSettled: 85000,
        claims: [{ claimId: "CLM-001", amount: 45000, status: "APPROVED" }],
      },
      null,
      2
    )
  );
  const [remResult, setRemResult] = useState<any>(null);

  // Reset form to defaults or editing record
  const resetForm = (item?: HmoIntegration) => {
    if (item) {
      setFormName(item.integrationName);
      setFormProvider(item.provider);
      setFormStatus(item.status);
      setFormAuthType(item.authType);
      setFormApiKey(item.authConfig?.apiKey || "");
      setFormClientId(item.authConfig?.clientId || "");
      setFormClientSecret(item.authConfig?.clientSecret || "");
      setFormTokenUrl(item.authConfig?.tokenUrl || "");
      setFormUsername(item.authConfig?.username || "");
      setFormPassword(item.authConfig?.password || "");
      setFormEndpoints({
        eligibility_check: item.endpoints?.eligibility_check || "",
        claim_submission: item.endpoints?.claim_submission || "",
        claim_status: item.endpoints?.claim_status || "",
        remittance_advice: item.endpoints?.remittance_advice || "",
        pre_authorization: item.endpoints?.pre_authorization || "",
        provider_directory: item.endpoints?.provider_directory || "",
        benefit_schedule: item.endpoints?.benefit_schedule || "",
        claim_reversal: item.endpoints?.claim_reversal || "",
      });
      setFormTimeout(item.timeoutMs || 30000);
      setFormMaxRetries(item.maxRetries ?? 3);
      setFormHeadersJson(item.requestHeaders ? JSON.stringify(item.requestHeaders, null, 2) : "");
    } else {
      setFormName("");
      setFormProvider("nhif");
      setFormStatus("active");
      setFormAuthType("api_key");
      setFormApiKey("");
      setFormClientId("");
      setFormClientSecret("");
      setFormTokenUrl("");
      setFormUsername("");
      setFormPassword("");
      setFormEndpoints({
        eligibility_check: "https://api.hmo-gateway.com/v1/eligibility",
        claim_submission: "https://api.hmo-gateway.com/v1/claims",
        claim_status: "https://api.hmo-gateway.com/v1/claims/status",
        remittance_advice: "https://api.hmo-gateway.com/v1/remittances",
        pre_authorization: "https://api.hmo-gateway.com/v1/preauth",
        provider_directory: "",
        benefit_schedule: "",
        claim_reversal: "",
      });
      setFormTimeout(30000);
      setFormMaxRetries(3);
      setFormHeadersJson("");
    }
  };

  const handleOpenCreate = () => {
    setEditingIntegration(null);
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (item: HmoIntegration) => {
    setEditingIntegration(item);
    resetForm(item);
    setIsCreateOpen(true);
  };

  const handleSaveIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Integration name is required");
      return;
    }

    let parsedHeaders: Record<string, string> | undefined;
    if (formHeadersJson.trim()) {
      try {
        parsedHeaders = JSON.parse(formHeadersJson);
      } catch (err) {
        toast.error("Request headers must be valid JSON format");
        return;
      }
    }

    const authConfig: Record<string, any> = {};
    if (formAuthType === "api_key" || formAuthType === "bearer_token") {
      authConfig.apiKey = formApiKey;
    } else if (formAuthType === "oauth2") {
      authConfig.clientId = formClientId;
      authConfig.clientSecret = formClientSecret;
      authConfig.tokenUrl = formTokenUrl;
    } else if (formAuthType === "basic_auth") {
      authConfig.username = formUsername;
      authConfig.password = formPassword;
    }

    const payload: CreateHmoIntegrationDto = {
      integrationName: formName.trim(),
      provider: formProvider,
      status: formStatus,
      authType: formAuthType,
      authConfig,
      endpoints: formEndpoints as any,
      timeoutMs: Number(formTimeout) || 30000,
      maxRetries: Number(formMaxRetries) || 3,
      requestHeaders: parsedHeaders,
    };

    try {
      if (editingIntegration) {
        await updateMut.mutateAsync({ id: editingIntegration.id, dto: payload });
        toast.success(`Updated integration "${formName}" successfully`);
      } else {
        await createMut.mutateAsync(payload);
        toast.success(`Created integration "${formName}" successfully`);
      }
      setIsCreateOpen(false);
      refetchIntegrations();
      refetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save integration");
    }
  };

  const handleDeleteIntegration = async () => {
    if (!deletingIntegration) return;
    try {
      await deleteMut.mutateAsync(deletingIntegration.id);
      toast.success(`Integration "${deletingIntegration.integrationName}" removed`);
      setDeletingIntegration(null);
      refetchIntegrations();
      refetchStats();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete integration");
    }
  };

  // Run Test in Sandbox
  const handleRunSandboxTest = async () => {
    if (!sandboxIntegrationId) {
      toast.error("Please select an HMO integration to test");
      return;
    }

    let parsedPayload = {};
    if (sandboxPayload.trim()) {
      try {
        parsedPayload = JSON.parse(sandboxPayload);
      } catch (e) {
        toast.error("Invalid JSON in test payload");
        return;
      }
    }

    try {
      const res = await testMut.mutateAsync({
        id: sandboxIntegrationId,
        dto: {
          endpointType: sandboxEndpoint,
          testPayload: parsedPayload,
        },
      });
      setSandboxResult(res);
      if (res.success) {
        toast.success(`Endpoint tested successfully in ${res.durationMs}ms`);
      } else {
        toast.error(`Endpoint test returned error: ${res.error || "Failed"}`);
      }
      refetchLogs();
      refetchIntegrations();
      refetchStats();
    } catch (err: any) {
      setSandboxResult({
        success: false,
        error: err?.response?.data?.message || err?.message || "Test execution error",
        durationMs: 0,
      });
      toast.error("Error executing endpoint test");
    }
  };

  // Live Check Eligibility
  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opsIntegrationId) {
      toast.error("Please select an active HMO integration");
      return;
    }
    if (!elMemberNum.trim()) {
      toast.error("Member number is required");
      return;
    }
    try {
      const res = await checkEligibilityMut.mutateAsync({
        id: opsIntegrationId,
        dto: {
          memberNumber: elMemberNum,
          patientId: elPatientId || "unassigned",
          serviceCode: elServiceCode,
          providerId: elProviderId,
        },
      });
      setElResult(res);
      toast.success("Eligibility checked successfully");
      refetchLogs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Eligibility check failed");
      setElResult({ error: err?.response?.data?.message || err?.message });
    }
  };

  // Live Claim Submit
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opsIntegrationId) {
      toast.error("Please select an active HMO integration");
      return;
    }
    if (!clClaimId.trim()) {
      toast.error("Claim ID is required");
      return;
    }
    const services = clServiceCodes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await submitClaimMut.mutateAsync({
        id: opsIntegrationId,
        dto: {
          claimId: clClaimId,
          patientId: clPatientId || "unassigned",
          serviceCodes: services,
          totalAmount: Number(clTotalAmount),
          diagnosisCode: clDiagCode,
          providerId: "CLINIC-MAIN",
        },
      });
      setClResult(res);
      toast.success("Claim submitted successfully to HMO Gateway");
      refetchLogs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Claim submission failed");
      setClResult({ error: err?.response?.data?.message || err?.message });
    }
  };

  // Live Status Check
  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opsIntegrationId) {
      toast.error("Please select an active HMO integration");
      return;
    }
    if (!statusClaimId.trim()) {
      toast.error("Claim ID is required");
      return;
    }
    try {
      const res = await checkStatusMut.mutateAsync({
        id: opsIntegrationId,
        claimId: statusClaimId.trim(),
      });
      setStatusResult(res);
      toast.success("Claim status retrieved from HMO Gateway");
      refetchLogs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Status check failed");
      setStatusResult({ error: err?.response?.data?.message || err?.message });
    }
  };

  // Live Remittance Parse
  const handleParseRemittance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opsIntegrationId) {
      toast.error("Please select an active HMO integration");
      return;
    }
    if (!remRemittanceId.trim()) {
      toast.error("Remittance ID is required");
      return;
    }
    try {
      const res = await parseRemittanceMut.mutateAsync({
        id: opsIntegrationId,
        dto: {
          remittanceId: remRemittanceId.trim(),
          rawData: remRawData,
        },
      });
      setRemResult(res);
      toast.success("Remittance parsed successfully");
      refetchLogs();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Remittance parse failed");
      setRemResult({ error: err?.response?.data?.message || err?.message });
    }
  };

  // Filtered integrations
  const filteredIntegrations = useMemo(() => {
    return integrations.filter((item) => {
      const matchProvider = providerFilter === "all" || item.provider === providerFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;
      const matchSearch =
        !searchQuery ||
        item.integrationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.provider.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProvider && matchStatus && matchSearch;
    });
  }, [integrations, providerFilter, statusFilter, searchQuery]);

  // Set default sandbox integration if empty
  React.useEffect(() => {
    if (!sandboxIntegrationId && integrations.length > 0) {
      setSandboxIntegrationId(integrations[0].id);
    }
    if (!opsIntegrationId && integrations.length > 0) {
      setOpsIntegrationId(integrations[0].id);
    }
  }, [integrations, sandboxIntegrationId, opsIntegrationId]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <PageHeader
        title="HMO Integrations & API Gateways"
        description="Direct automated B2B healthcare EDI & REST pipelines with national & private HMOs — real-time eligibility checks, electronic claims, status queries, and remittance reconciliation."
        actions={[
          {
            label: "Refresh Status",
            onClick: () => {
              refetchIntegrations();
              refetchStats();
              refetchLogs();
              toast.info("Refreshed gateway status");
            },
            variant: "outline",
          },
          {
            label: "+ New Integration",
            onClick: handleOpenCreate,
            variant: "default",
          },
        ]}
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Gateways
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Network size={16} />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-slate-900">
                {loadingStats ? "..." : stats?.totalIntegrations ?? integrations.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Configured HMO APIs</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Connections
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Zap size={16} />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-emerald-600 flex items-center gap-1.5">
                {loadingStats
                  ? "..."
                  : stats?.activeIntegrations ??
                    integrations.filter((i) => i.status === "active").length}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Ready for live traffic</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                API Calls
              </span>
              <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
                <Activity size={16} />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-slate-900">
                {loadingStats ? "..." : stats?.totalLogs ?? logs.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Logged transactions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Success Rate
              </span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-teal-700">
                {loadingStats
                  ? "..."
                  : `${(stats?.successRate ?? 100).toFixed(1)}%`}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Gateway reliability</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white col-span-2 md:col-span-1">
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Avg Response Time
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-slate-900">
                {loadingStats
                  ? "..."
                  : `${Math.round(stats?.avgDurationMs || 0)}ms`}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Network latency</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 gap-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("integrations")}
            className={cn(
              "flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all -mb-px",
              activeTab === "integrations"
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Server size={16} />
            Integrations Directory
            <Badge variant="outline" className="ml-1 text-xs">
              {integrations.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("sandbox")}
            className={cn(
              "flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all -mb-px",
              activeTab === "sandbox"
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Terminal size={16} />
            API Test Sandbox
          </button>

          <button
            onClick={() => setActiveTab("operations")}
            className={cn(
              "flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all -mb-px",
              activeTab === "operations"
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Play size={16} />
            Live Operations Console
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={cn(
              "flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all -mb-px",
              activeTab === "logs"
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <FileCode size={16} />
            API Traffic & Audit Logs
            <Badge variant="outline" className="ml-1 text-xs">
              {logs.length}
            </Badge>
          </button>
        </div>

        {/* Quick Nav shortcut to HMO Management & Claims */}
        <div className="flex items-center gap-2 pb-2">
          <Link
            href="/clinic/hmo"
            className="text-xs text-brand-navy hover:underline flex items-center gap-1 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200"
          >
            <Database size={13} />
            HMO Management
          </Link>
          <Link
            href="/clinic/hmo-advanced"
            className="text-xs text-brand-navy hover:underline flex items-center gap-1 font-medium bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200"
          >
            <ShieldCheck size={13} />
            Claims Engine
          </Link>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────
          TAB 1: INTEGRATIONS DIRECTORY
      ────────────────────────────────────────────────────────── */}
      {activeTab === "integrations" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search integration or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All Providers</option>
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="testing">Testing</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          {/* Integrations Grid */}
          {loadingIntegrations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 bg-slate-100 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : filteredIntegrations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <Network size={44} className="mx-auto text-slate-300 mb-3" />
              <h4 className="text-base font-bold text-slate-700">No HMO integrations configured</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                Connect your clinic directly to NHIF, AAR, Jubilee, or private HMO gateways for
                instant claims and verification.
              </p>
              <Button
                onClick={handleOpenCreate}
                className="mt-4 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl text-xs"
              >
                <Plus size={14} className="mr-1.5" />
                Configure New Integration
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((item) => {
                const endpointsCount = Object.values(item.endpoints || {}).filter(Boolean).length;
                const statusStyles: Record<IntegrationStatus, { bg: string; text: string; dot: string }> = {
                  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
                  inactive: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
                  testing: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
                  error: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
                };
                const currentStatus = statusStyles[item.status] || statusStyles.inactive;

                return (
                  <Card
                    key={item.id}
                    className="border border-slate-100 shadow-sm rounded-2xl bg-white hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5 space-y-4">
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-navy transition-colors">
                              {item.integrationName}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            Provider: <span className="uppercase font-semibold">{item.provider}</span>
                          </p>
                        </div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                            currentStatus.bg,
                            currentStatus.text
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", currentStatus.dot)} />
                          {item.status}
                        </span>
                      </div>

                      {/* Specs badges */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 text-[11px] block">Auth Protocol</span>
                          <span className="font-semibold text-slate-700 uppercase">
                            {item.authType.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-slate-400 text-[11px] block">Endpoints Configured</span>
                          <span className="font-semibold text-slate-700">
                            {endpointsCount} / 8 Active
                          </span>
                        </div>
                      </div>

                      {/* Endpoint chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.endpoints?.eligibility_check && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                            Eligibility
                          </span>
                        )}
                        {item.endpoints?.claim_submission && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium">
                            Claims
                          </span>
                        )}
                        {item.endpoints?.claim_status && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium">
                            Status
                          </span>
                        )}
                        {item.endpoints?.remittance_advice && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium">
                            Remittance
                          </span>
                        )}
                      </div>

                      {/* Last Test status */}
                      <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Last verified:</span>
                        <span className="font-mono text-slate-600">
                          {item.lastTestedAt
                            ? new Date(item.lastTestedAt).toLocaleDateString()
                            : "Never tested"}
                        </span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSandboxIntegrationId(item.id);
                          setActiveTab("sandbox");
                        }}
                        className="text-xs text-brand-navy hover:bg-slate-200/60 rounded-lg h-8 px-2.5"
                      >
                        <Terminal size={13} className="mr-1.5" />
                        Test Gateway
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setOpsIntegrationId(item.id);
                            setActiveTab("operations");
                          }}
                          className="text-xs text-slate-700 hover:bg-slate-200/60 rounded-lg h-8 px-2"
                          title="Run Live Operations"
                        >
                          <Play size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(item)}
                          className="text-xs text-slate-700 hover:bg-slate-200/60 rounded-lg h-8 px-2"
                          title="Edit Configuration"
                        >
                          <Edit3 size={13} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingIntegration(item)}
                          className="text-xs text-rose-600 hover:bg-rose-50 rounded-lg h-8 px-2"
                          title="Delete Gateway"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 2: API TEST SANDBOX
      ────────────────────────────────────────────────────────── */}
      {activeTab === "sandbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left panel: Config & Payload */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Interactive Endpoint Sandbox</h3>
                  <p className="text-xs text-slate-500">
                    Dispatch live simulated probes and test validation schemas against HMO API endpoints.
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Code2 size={18} />
                </div>
              </div>

              {/* Integration Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target HMO Gateway *
                </label>
                <select
                  value={sandboxIntegrationId}
                  onChange={(e) => setSandboxIntegrationId(e.target.value)}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-brand-navy/20 focus:outline-none"
                >
                  <option value="">Select an integration...</option>
                  {integrations.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.integrationName} ({i.provider.toUpperCase()} - {i.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Endpoint Type */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Endpoint Service
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ENDPOINT_TYPES.slice(0, 6).map((ep) => (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => {
                        setSandboxEndpoint(ep.id);
                        if (SAMPLE_PAYLOADS[ep.id]) {
                          setSandboxPayload(JSON.stringify(SAMPLE_PAYLOADS[ep.id], null, 2));
                        }
                      }}
                      className={cn(
                        "text-left p-2.5 rounded-xl border text-xs transition-all",
                        sandboxEndpoint === ep.id
                          ? "border-brand-navy bg-brand-navy/5 text-brand-navy font-bold shadow-xs"
                          : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      <span className="block font-semibold">{ep.label}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{ep.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payload Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    JSON Request Body
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (SAMPLE_PAYLOADS[sandboxEndpoint]) {
                        setSandboxPayload(
                          JSON.stringify(SAMPLE_PAYLOADS[sandboxEndpoint], null, 2)
                        );
                        toast.info("Sample payload loaded");
                      }
                    }}
                    className="text-[11px] text-brand-navy hover:underline font-medium"
                  >
                    Reset with Sample
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={sandboxPayload}
                  onChange={(e) => setSandboxPayload(e.target.value)}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-navy/20 border border-slate-800"
                  spellCheck={false}
                />
              </div>

              {/* Submit Test Button */}
              <Button
                onClick={handleRunSandboxTest}
                disabled={testMut.isPending || !sandboxIntegrationId}
                className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl py-2.5 font-bold shadow-sm"
              >
                {testMut.isPending ? (
                  <>
                    <RefreshCw size={15} className="mr-2 animate-spin" />
                    Dispatching API Request...
                  </>
                ) : (
                  <>
                    <Send size={15} className="mr-2" />
                    Send Request to HMO Gateway
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Right panel: Response Viewer */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white p-5 space-y-4 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">Execution Response</h3>
                    {sandboxResult && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold uppercase",
                          sandboxResult.success
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        )}
                      >
                        {sandboxResult.success ? "200 SUCCESS" : "FAILED"}
                      </span>
                    )}
                  </div>
                  {sandboxResult && (
                    <span className="text-xs font-mono text-slate-500">
                      Duration: {sandboxResult.durationMs}ms
                    </span>
                  )}
                </div>

                {sandboxResult ? (
                  <div className="mt-4 space-y-3">
                    {sandboxResult.error && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                        <span className="font-bold block mb-0.5">Gateway Error:</span>
                        {sandboxResult.error}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>Response Payload (JSON):</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              JSON.stringify(sandboxResult.response || sandboxResult, null, 2)
                            );
                            setCopiedLog(true);
                            setTimeout(() => setCopiedLog(false), 2000);
                          }}
                          className="flex items-center gap-1 text-[11px] text-brand-navy hover:underline"
                        >
                          {copiedLog ? <Check size={12} /> : <Copy size={12} />}
                          {copiedLog ? "Copied" : "Copy Payload"}
                        </button>
                      </div>
                      <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-auto max-h-[380px] border border-slate-800">
                        {JSON.stringify(sandboxResult.response || sandboxResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-24 text-slate-400">
                    <Terminal size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No test executed yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Select an integration and endpoint on the left, then click "Send Request" to
                      verify connectivity in real time.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center justify-between">
                <span>All test transactions are recorded in the API Traffic logs</span>
                <button
                  onClick={() => setActiveTab("logs")}
                  className="text-brand-navy font-bold hover:underline inline-flex items-center gap-1"
                >
                  View Logs
                  <ChevronRight size={13} />
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 3: LIVE OPERATIONS CONSOLE
      ────────────────────────────────────────────────────────── */}
      {activeTab === "operations" && (
        <div className="space-y-4">
          {/* Operations Integration Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-navy/5 text-brand-navy">
                <Play size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Direct HMO Gateway Executor</h3>
                <p className="text-xs text-slate-500">
                  Run live operational transactions directly with the selected HMO gateway
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                HMO Gateway:
              </label>
              <select
                value={opsIntegrationId}
                onChange={(e) => setOpsIntegrationId(e.target.value)}
                className="text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-brand-navy/20 focus:outline-none"
              >
                {integrations.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.integrationName} ({i.provider.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtabs for Operations */}
          <div className="flex border-b border-slate-200 gap-2">
            {[
              { id: "eligibility" as OperationSubTab, label: "Check Patient Eligibility" },
              { id: "claims" as OperationSubTab, label: "Submit Claim to HMO" },
              { id: "status" as OperationSubTab, label: "Check Claim Status" },
              { id: "remittance" as OperationSubTab, label: "Parse Remittance Advice" },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setOpsSubTab(sub.id)}
                className={cn(
                  "py-2.5 px-4 text-xs font-bold border-b-2 transition-all -mb-px",
                  opsSubTab === sub.id
                    ? "border-brand-navy text-brand-navy bg-white rounded-t-xl"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                )}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* SUBTAB 1: ELIGIBILITY */}
          {opsSubTab === "eligibility" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-6 border border-slate-100 shadow-sm rounded-2xl bg-white p-5">
                <form onSubmit={handleCheckEligibility} className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                    Patient Coverage & Benefit Verification
                  </h4>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      HMO Member / Policy Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NHIF-99210029 or JUB-77889"
                      value={elMemberNum}
                      onChange={(e) => setElMemberNum(e.target.value)}
                      required
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Attach Registered Patient (Optional)
                    </label>
                    <select
                      value={elPatientId}
                      onChange={(e) => setElPatientId(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    >
                      <option value="">Select patient from clinic registry...</option>
                      {patients.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName} ({p.mrn || p.phone || "No MRN"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Service Code
                      </label>
                      <input
                        type="text"
                        value={elServiceCode}
                        onChange={(e) => setElServiceCode(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Provider / Facility ID
                      </label>
                      <input
                        type="text"
                        value={elProviderId}
                        onChange={(e) => setElProviderId(e.target.value)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={checkEligibilityMut.isPending}
                    className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl py-2.5 font-bold shadow-sm"
                  >
                    {checkEligibilityMut.isPending ? (
                      <>
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                        Verifying with Gateway...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} className="mr-2" />
                        Verify Patient Eligibility
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              {/* Eligibility Result Display */}
              <Card className="lg:col-span-6 border border-slate-100 shadow-sm rounded-2xl bg-white p-5">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3">
                  Eligibility Response
                </h4>
                {elResult ? (
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-auto max-h-[340px]">
                    {JSON.stringify(elResult, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <ShieldCheck size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No verification performed yet</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* SUBTAB 2: CLAIMS SUBMISSION */}
          {opsSubTab === "claims" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-6 border border-slate-100 shadow-sm rounded-2xl bg-white p-5">
                <form onSubmit={handleSubmitClaim} className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                    Direct Claim Transmission
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Claim Tracking ID *
                      </label>
                      <input
                        type="text"
                        value={clClaimId}
                        onChange={(e) => setClClaimId(e.target.value)}
                        required
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Total Amount (NGN) *
                      </label>
                      <input
                        type="number"
                        value={clTotalAmount}
                        onChange={(e) => setClTotalAmount(Number(e.target.value))}
                        required
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Patient
                    </label>
                    <select
                      value={clPatientId}
                      onChange={(e) => setClPatientId(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    >
                      <option value="">Select patient...</option>
                      {patients.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.firstName} {p.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Service Codes (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={clServiceCodes}
                      onChange={(e) => setClServiceCodes(e.target.value)}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Diagnosis ICD-10 Code
                    </label>
                    <input
                      type="text"
                      value={clDiagCode}
                      onChange={(e) => setClDiagCode(e.target.value)}
                      placeholder="e.g. H52.1 (Myopia)"
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitClaimMut.isPending}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 font-bold shadow-sm"
                  >
                    {submitClaimMut.isPending ? (
                      <>
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                        Transmitting to HMO...
                      </>
                    ) : (
                      <>
                        <Send size={14} className="mr-2" />
                        Submit Claim Directly
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              {/* Claim Result Display */}
              <Card className="lg:col-span-6 border border-slate-100 shadow-sm rounded-2xl bg-white p-5">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3">
                  Submission Receipt & Adjudication Status
                </h4>
                {clResult ? (
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-auto max-h-[340px]">
                    {JSON.stringify(clResult, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <FileText size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No claim transmitted yet</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* SUBTAB 3: CLAIM STATUS */}
          {opsSubTab === "status" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-6 border border-slate-100 shadow-sm rounded-2xl bg-white p-5">
                <form onSubmit={handleCheckStatus} className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                    Query Electronic Claim Status
                  </h4>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Claim ID / Reference Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CLM-2026-0082"
                      value={statusClaimId}
                      onChange={(e) => setStatusClaimId(e.target.value)}
                      required
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={checkStatusMut.isPending}
                    className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl py-2.5 font-bold shadow-sm"
                  >
                    {checkStatusMut.isPending ? (
                      <>
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                        Querying Gateway...
                      </>
                    ) : (
                      <>
                        <Search size={14} className="mr-2" />
                        Check Status
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              <Card className="lg:col-span-6 border border-slate-100 shadow-sm rounded-2xl bg-white p-5">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3">
                  Gateway Status Report
                </h4>
                {statusResult ? (
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-auto max-h-[340px]">
                    {JSON.stringify(statusResult, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <Clock size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No status query executed yet</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* SUBTAB 4: REMITTANCE PARSER */}
          {opsSubTab === "remittance" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-6 border border-slate-100 shadow-sm rounded-2xl bg-white p-5">
                <form onSubmit={handleParseRemittance} className="space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                    Parse Remittance Advice (ERA)
                  </h4>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Remittance Identifier *
                    </label>
                    <input
                      type="text"
                      value={remRemittanceId}
                      onChange={(e) => setRemRemittanceId(e.target.value)}
                      required
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Raw Remittance Advice Body (JSON / EDI string)
                    </label>
                    <textarea
                      rows={7}
                      value={remRawData}
                      onChange={(e) => setRemRawData(e.target.value)}
                      className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={parseRemittanceMut.isPending}
                    className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl py-2.5 font-bold shadow-sm"
                  >
                    {parseRemittanceMut.isPending ? (
                      <>
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                        Parsing Remittance Batch...
                      </>
                    ) : (
                      <>
                        <FileCode size={14} className="mr-2" />
                        Parse & Ingest Remittance
                      </>
                    )}
                  </Button>
                </form>
              </Card>

              <Card className="lg:col-span-6 border border-slate-100 shadow-sm rounded-2xl bg-white p-5">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3">
                  Parsed Remittance Reconciliation Result
                </h4>
                {remResult ? (
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-xs overflow-auto max-h-[340px]">
                    {JSON.stringify(remResult, null, 2)}
                  </pre>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <Database size={36} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">No remittance batch ingested yet</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          TAB 4: API TRAFFIC & AUDIT LOGS
      ────────────────────────────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">HMO Gateway API Logs</h3>
                <p className="text-xs text-slate-500">
                  Full audit trail of outbound and inbound HTTP payloads, timestamps, latency, and status codes.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchLogs()}
                className="text-xs rounded-xl"
              >
                <RefreshCw size={13} className="mr-1.5" />
                Refresh Logs
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4">Endpoint</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">HTTP</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Correlation ID</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        <RefreshCw size={18} className="mx-auto animate-spin mb-2" />
                        Loading transaction logs...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No API activity recorded yet. Run a test from the Sandbox to see traffic.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isSuccess = log.status === "success";
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                log.direction === "outbound"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-purple-50 text-purple-700"
                              )}
                            >
                              {log.direction === "outbound" ? (
                                <ArrowUpRight size={11} />
                              ) : (
                                <ArrowDownLeft size={11} />
                              )}
                              {log.direction}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {log.endpointType.replace(/_/g, " ")}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                                isSuccess
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              )}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold">
                            {log.responseStatus || (isSuccess ? 200 : 500)}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {log.durationMs ? `${log.durationMs}ms` : "—"}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-[120px]">
                            {log.correlationId || log.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedLog(log)}
                              className="h-7 px-2 text-xs text-brand-navy hover:bg-slate-100 rounded-lg"
                            >
                              <Eye size={13} className="mr-1" />
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────
          MODAL: CREATE / EDIT INTEGRATION
      ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={editingIntegration ? "Edit HMO Integration" : "New HMO Gateway Integration"}
        className="max-w-2xl"
      >
        <form onSubmit={handleSaveIntegration} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* General info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Integration Name *
              </label>
              <input
                type="text"
                placeholder="e.g. NHIF National Gateway"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Insurance Provider *
              </label>
              <select
                value={formProvider}
                onChange={(e) => setFormProvider(e.target.value as HmoIntegrationProvider)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Integration Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as IntegrationStatus)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="active">Active (Live Traffic)</option>
                <option value="testing">Testing (Sandbox Only)</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error / Suspended</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Authentication Type *
              </label>
              <select
                value={formAuthType}
                onChange={(e) => setFormAuthType(e.target.value as AuthType)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
              >
                <option value="api_key">API Key (Header / Token)</option>
                <option value="bearer_token">Bearer Token</option>
                <option value="oauth2">OAuth 2.0 Client Credentials</option>
                <option value="basic_auth">HTTP Basic Auth</option>
                <option value="custom">Custom Auth / None</option>
              </select>
            </div>
          </div>

          {/* Conditional Auth Config Fields */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              {formAuthType.replace(/_/g, " ")} Credentials
            </span>

            {(formAuthType === "api_key" || formAuthType === "bearer_token") && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  API Key / Access Token
                </label>
                <input
                  type="password"
                  placeholder="Paste private HMO gateway token"
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            )}

            {formAuthType === "oauth2" && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={formClientId}
                      onChange={(e) => setFormClientId(e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={formClientSecret}
                      onChange={(e) => setFormClientSecret(e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Token Issuer URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://auth.hmo-provider.com/oauth/token"
                    value={formTokenUrl}
                    onChange={(e) => setFormTokenUrl(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {formAuthType === "basic_auth" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Endpoints Config Section */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              Endpoint URLs
            </span>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Eligibility Check Endpoint URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.gateway.com/v1/eligibility"
                  value={formEndpoints.eligibility_check || ""}
                  onChange={(e) =>
                    setFormEndpoints({ ...formEndpoints, eligibility_check: e.target.value })
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Claim Submission Endpoint URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.gateway.com/v1/claims/submit"
                  value={formEndpoints.claim_submission || ""}
                  onChange={(e) =>
                    setFormEndpoints({ ...formEndpoints, claim_submission: e.target.value })
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Claim Status Endpoint URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.gateway.com/v1/claims/status"
                  value={formEndpoints.claim_status || ""}
                  onChange={(e) =>
                    setFormEndpoints({ ...formEndpoints, claim_status: e.target.value })
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">
                  Remittance Advice Endpoint URL
                </label>
                <input
                  type="text"
                  placeholder="https://api.gateway.com/v1/remittances"
                  value={formEndpoints.remittance_advice || ""}
                  onChange={(e) =>
                    setFormEndpoints({ ...formEndpoints, remittance_advice: e.target.value })
                  }
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Network Parameters */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Timeout (ms)
              </label>
              <input
                type="number"
                value={formTimeout}
                onChange={(e) => setFormTimeout(Number(e.target.value))}
                min={1000}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Max Retries
              </label>
              <input
                type="number"
                value={formMaxRetries}
                onChange={(e) => setFormMaxRetries(Number(e.target.value))}
                min={0}
                max={5}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Custom Headers JSON */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Custom Request Headers (JSON, Optional)
            </label>
            <textarea
              rows={2}
              placeholder='{ "X-Agency-Code": "CLI-NAI-01" }'
              value={formHeadersJson}
              onChange={(e) => setFormHeadersJson(e.target.value)}
              className="w-full p-2.5 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMut.isPending || updateMut.isPending}
              className="bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl px-5 font-bold shadow-sm"
            >
              {createMut.isPending || updateMut.isPending ? (
                <>
                  <RefreshCw size={14} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Integration"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ──────────────────────────────────────────────────────────
          MODAL: LOG INSPECT
      ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="API Transaction Detail"
        className="max-w-2xl"
      >
        {selectedLog && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Direction & Endpoint</span>
                <span className="font-bold text-slate-800 uppercase">
                  {selectedLog.direction} → {selectedLog.endpointType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status & Response Code</span>
                <span className="font-bold text-emerald-600">
                  {selectedLog.status.toUpperCase()} (HTTP {selectedLog.responseStatus || 200})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Latency Duration</span>
                <span className="font-mono text-slate-700">{selectedLog.durationMs || 0}ms</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Timestamp</span>
                <span className="font-mono text-slate-700">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedLog.requestUrl && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Target URL</span>
                <p className="font-mono p-2 bg-slate-100 rounded-lg text-slate-800 truncate">
                  {selectedLog.requestMethod || "POST"} {selectedLog.requestUrl}
                </p>
              </div>
            )}

            {selectedLog.errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <span className="font-bold block mb-0.5">Error Message:</span>
                {selectedLog.errorMessage}
              </div>
            )}

            {selectedLog.requestBody && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Request Payload</span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-auto max-h-48">
                  {selectedLog.requestBody}
                </pre>
              </div>
            )}

            {selectedLog.responseBody && (
              <div>
                <span className="font-semibold text-slate-700 block mb-1">Response Body</span>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-auto max-h-56">
                  {selectedLog.responseBody}
                </pre>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ──────────────────────────────────────────────────────────
          MODAL: DELETE CONFIRMATION
      ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={!!deletingIntegration}
        onClose={() => setDeletingIntegration(null)}
        title="Delete HMO Gateway Integration"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to remove the integration{" "}
            <span className="font-bold text-slate-900">
              "{deletingIntegration?.integrationName}"
            </span>
            ? Automatic electronic claims and real-time eligibility checks will no longer route
            through this gateway.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingIntegration(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deleteMut.isPending}
              onClick={handleDeleteIntegration}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
            >
              {deleteMut.isPending ? "Deleting..." : "Delete Integration"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
