"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { usePatients } from "@/hooks/usePatients";
import {
  useHmoList,
  useCreateHmo,
  useHmoClaims,
  useCreateClaim,
  useUpdateClaim,
  useHmoAgreements,
  useCreateAgreement,
  useAuthorizations,
  useCreateAuthorization,
  useUpdateAuthorization,
  useClaimBatches,
  useCreateClaimBatch,
  useAddClaimsToBatch,
  useUpdateClaimBatch,
  useClaimDocuments,
  useUploadClaimDocument,
  useDeleteClaimDocument,
  useCheckCoverage,
  useAgingReport,
  useHmoTotals,
  useHmoStats,
} from "@/hooks/useHmo";
import type { CoverageCheckResult } from "@/services/hmo.service";
import {
  Building2,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Plus,
  Shield,
  Eye,
  DollarSign,
  Layers,
  Calculator,
  Upload,
  Trash2,
  X,
  Loader2,
  Check,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0);

type HMOTab = "dashboard" | "claims" | "partners" | "agreements" | "authorizations" | "batches" | "coverage";

const hmoTabs = [
  { id: "dashboard" as HMOTab, label: "Dashboard", icon: TrendingUp },
  { id: "claims" as HMOTab, label: "Claims", icon: FileText },
  { id: "partners" as HMOTab, label: "HMO Partners", icon: Building2 },
  { id: "agreements" as HMOTab, label: "Agreements", icon: Shield },
  { id: "authorizations" as HMOTab, label: "Authorizations", icon: Eye },
  { id: "batches" as HMOTab, label: "Claim Batches", icon: Layers },
  { id: "coverage" as HMOTab, label: "Coverage Check", icon: Calculator },
] as const;

function statusBadge(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "active" || s === "approved" || s === "paid" || s === "completed" || s === "overturned" || s === "settled")
    return <Badge className="bg-emerald-600 text-white font-bold">{status}</Badge>;
  if (s === "pending" || s === "submitted" || s === "draft" || s === "under_review" || s === "processing")
    return <Badge className="bg-amber-600 text-white font-bold">{status.replace(/_/g, " ")}</Badge>;
  if (s === "queried" || s === "rejected" || s === "denied" || s === "upheld")
    return <Badge className="bg-rose-600 text-white font-bold">{status.replace(/_/g, " ")}</Badge>;
  return <Badge variant="outline" className="font-bold">{status}</Badge>;
}

export default function HMOPage() {
  const { user } = useAuth();
  const { data: hmos = [], isLoading: loadingHmos } = useHmoList();
  const { data: claims = [], isLoading: loadingClaims } = useHmoClaims();
  const { data: agingReport } = useAgingReport();
  const { data: totals = [] } = useHmoTotals();
  const { data: stats } = useHmoStats();
  const { data: authorizations = [] } = useAuthorizations();
  const { data: batches = [] } = useClaimBatches();
  const { data: patientsData } = usePatients({ limit: 100 });
  const patients = (patientsData as any)?.data || (Array.isArray(patientsData) ? patientsData : []);

  const [activeTab, setActiveTab] = useState<HMOTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedHmoForAgreements, setSelectedHmoForAgreements] = useState<string>("");

  const effectiveHmoId = selectedHmoForAgreements || hmos[0]?.id || "";
  const { data: agreements = [] } = useHmoAgreements(effectiveHmoId);

  // Mutations
  const createHmoMut = useCreateHmo();
  const createClaimMut = useCreateClaim();
  const updateClaimMut = useUpdateClaim();
  const createAgreementMut = useCreateAgreement();
  const createAuthMut = useCreateAuthorization();
  const updateAuthMut = useUpdateAuthorization();
  const createBatchMut = useCreateClaimBatch();
  const addClaimsToBatchMut = useAddClaimsToBatch();
  const updateBatchMut = useUpdateClaimBatch();
  const checkCoverageMut = useCheckCoverage();
  const uploadDocMut = useUploadClaimDocument();
  const deleteDocMut = useDeleteClaimDocument();

  // Modals state
  const [showAddHmoModal, setShowAddHmoModal] = useState(false);
  const [showAddClaimModal, setShowAddClaimModal] = useState(false);
  const [showAddAgreementModal, setShowAddAgreementModal] = useState(false);
  const [showAddAuthModal, setShowAddAuthModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showBatchClaimsModal, setShowBatchClaimsModal] = useState<string | null>(null);
  const [selectedBatchClaims, setSelectedBatchClaims] = useState<string[]>([]);
  const [showClaimDocumentsModal, setShowClaimDocumentsModal] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Forms state
  const [hmoForm, setHmoForm] = useState({ name: "", contactPerson: "", phone: "", email: "", address: "", commissionRate: 0 });
  const [claimForm, setClaimForm] = useState({ claimNumber: "", amountClaimed: 0, diagnosis: "", treatmentDetails: "", notes: "", hmoId: "", patientId: "" });
  const [agreementForm, setAgreementForm] = useState({
    agreementNumber: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    paymentCycle: "monthly",
    claimsSubmissionSchedule: "monthly",
    consultationPrice: 15000,
    eyeTestPrice: 10000,
    opticalFramePrice: 25000,
    lensPrice: 20000,
    drugMarkup: 15,
    surgeryPrice: 150000,
    hmoId: "",
  });
  const [authForm, setAuthForm] = useState({
    authorizationNumber: "",
    serviceType: "consultation",
    clinicalJustification: "",
    estimatedCost: 25000,
    patientId: "",
    hmoId: "",
    expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });
  const [batchForm, setBatchForm] = useState({
    batchNumber: "",
    periodStart: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    periodEnd: new Date().toISOString().slice(0, 10),
    notes: "",
    hmoId: "",
  });

  // Coverage check state
  const [coverageForm, setCoverageForm] = useState({ patientId: "", hmoId: "", serviceType: "consultation", serviceAmount: 20000 });
  const [coverageResult, setCoverageResult] = useState<CoverageCheckResult | null>(null);

  // Document upload state
  const [docForm, setDocForm] = useState({ fileName: "", fileUrl: "", fileType: "application/pdf", documentType: "receipt" });
  const { data: claimDocuments = [] } = useClaimDocuments(showClaimDocumentsModal || "");

  const notify = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Submit Handlers
  const handleCreateHmo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hmoForm.name.trim()) return notify("error", "HMO name is required");
    createHmoMut.mutate({ ...hmoForm, clinicId: user?.clinicId || "" }, {
      onSuccess: () => {
        setShowAddHmoModal(false);
        setHmoForm({ name: "", contactPerson: "", phone: "", email: "", address: "", commissionRate: 0 });
        notify("success", "HMO partner created successfully");
      },
      onError: () => notify("error", "Failed to create HMO partner"),
    });
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.claimNumber || !claimForm.hmoId || !claimForm.patientId || claimForm.amountClaimed <= 0) {
      return notify("error", "Please fill in all required claim fields");
    }
    createClaimMut.mutate(claimForm, {
      onSuccess: () => {
        setShowAddClaimModal(false);
        setClaimForm({ claimNumber: "", amountClaimed: 0, diagnosis: "", treatmentDetails: "", notes: "", hmoId: "", patientId: "" });
        notify("success", "Claim created successfully");
      },
      onError: () => notify("error", "Failed to create claim"),
    });
  };

  const handleCreateAgreement = (e: React.FormEvent) => {
    e.preventDefault();
    const hmoTarget = agreementForm.hmoId || effectiveHmoId;
    if (!agreementForm.agreementNumber || !hmoTarget) {
      return notify("error", "Agreement number and HMO are required");
    }
    createAgreementMut.mutate({ ...agreementForm, hmoId: hmoTarget }, {
      onSuccess: () => {
        setShowAddAgreementModal(false);
        notify("success", "Agreement saved successfully");
      },
      onError: () => notify("error", "Failed to create agreement"),
    });
  };

  const handleCreateAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.authorizationNumber || !authForm.patientId || !authForm.hmoId) {
      return notify("error", "Please select patient, HMO, and enter auth number");
    }
    createAuthMut.mutate(authForm, {
      onSuccess: () => {
        setShowAddAuthModal(false);
        notify("success", "Authorization request submitted");
      },
      onError: () => notify("error", "Failed to create authorization"),
    });
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.batchNumber || !batchForm.hmoId) {
      return notify("error", "Batch number and HMO are required");
    }
    createBatchMut.mutate(batchForm, {
      onSuccess: () => {
        setShowAddBatchModal(false);
        notify("success", "Claim batch created");
      },
      onError: () => notify("error", "Failed to create claim batch"),
    });
  };

  const handleAddClaimsToBatch = () => {
    if (!showBatchClaimsModal || selectedBatchClaims.length === 0) return;
    addClaimsToBatchMut.mutate({ id: showBatchClaimsModal, claimIds: selectedBatchClaims }, {
      onSuccess: () => {
        setShowBatchClaimsModal(null);
        setSelectedBatchClaims([]);
        notify("success", "Claims linked to batch successfully");
      },
      onError: () => notify("error", "Failed to add claims to batch"),
    });
  };

  const handleCoverageCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverageForm.patientId || !coverageForm.hmoId) {
      return notify("error", "Patient and HMO must be selected");
    }
    checkCoverageMut.mutate({
      patientId: coverageForm.patientId,
      hmoId: coverageForm.hmoId,
      serviceType: coverageForm.serviceType,
      serviceAmount: Number(coverageForm.serviceAmount) || 0,
    }, {
      onSuccess: (res) => {
        setCoverageResult(res);
        notify("success", "Coverage checked successfully");
      },
      onError: () => notify("error", "Coverage check failed for this HMO"),
    });
  };

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showClaimDocumentsModal || !docForm.fileName.trim() || !docForm.fileUrl.trim()) {
      return notify("error", "File name and URL are required");
    }
    uploadDocMut.mutate({ ...docForm, claimId: showClaimDocumentsModal }, {
      onSuccess: () => {
        setDocForm({ fileName: "", fileUrl: "", fileType: "application/pdf", documentType: "receipt" });
        notify("success", "Document attached to claim");
      },
      onError: () => notify("error", "Failed to attach document"),
    });
  };

  // Filter functions
  const filteredClaims = claims.filter(c => {
    const patientName = c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : '';
    const hmoName = c.hmo?.name ?? '';
    const matchesSearch = (c.claimNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hmoName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredHmos = hmos.filter(h => {
    const matchesSearch = (h.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (h.contactPerson || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loadingHmos || loadingClaims) {
    return (
      <div className="space-y-8">
        <PageHeader title="HMO Operations & Revenue Recovery" description="Claims, partners, agreements, authorizations & analytics." />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-8 bg-slate-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalClaims = claims.length;
  const pendingClaims = claims.filter(c => c.status === "submitted" || c.status === "under_review").length;
  const approvedClaims = claims.filter(c => c.status === "approved" || c.status === "partially_approved").length;
  const totalApprovedAmount = claims.reduce((sum, c) => sum + Number(c.amountApproved || 0), 0);

  return (
    <div className="space-y-8 pb-24">
      <PageHeader
        title="HMO Operations & Revenue Engine"
        description="Comprehensive management of HMO partners, fee agreements, pre-authorizations, batch submissions, and automated coverage checks."
        actions={[
          { label: "New Claim", variant: "default", onClick: () => setShowAddClaimModal(true) },
          { label: "Check Coverage", variant: "outline", onClick: () => setActiveTab("coverage") },
        ]}
      />

      {notification && (
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all duration-300 shadow-sm",
          notification.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"
        )}>
          {notification.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {notification.message}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {hmoTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap border-b-2 rounded-t-lg ${
              activeTab === tab.id
                ? "border-sky-600 text-sky-700 bg-sky-50/50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Claims</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{totalClaims}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <FileText size={18} />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
                  <p className="mt-1 text-2xl font-black text-amber-600">{pendingClaims}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock size={18} />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Revenue</p>
                  <p className="mt-1 text-2xl font-black text-emerald-600">{formatNGN(totalApprovedAmount)}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <DollarSign size={18} />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Partners</p>
                  <p className="mt-1 text-2xl font-black text-sky-600">{hmos.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <Building2 size={18} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* HMO Totals */}
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold">HMO Financial Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold">HMO Partner</TableHead>
                      <TableHead className="font-bold">Total Claims</TableHead>
                      <TableHead className="font-bold">Total Claimed</TableHead>
                      <TableHead className="font-bold">Total Paid</TableHead>
                      <TableHead className="font-bold">Outstanding</TableHead>
                      <TableHead className="font-bold">Collection Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {totals.map((t: any) => (
                      <TableRow key={t.hmoId}>
                        <TableCell className="font-bold text-slate-900">{t.hmoName}</TableCell>
                        <TableCell className="tabular-nums">{t.totalClaims}</TableCell>
                        <TableCell className="tabular-nums font-semibold">{formatNGN(t.totalClaimed)}</TableCell>
                        <TableCell className="tabular-nums text-emerald-600 font-semibold">{formatNGN(t.totalPaid)}</TableCell>
                        <TableCell className="tabular-nums text-rose-600 font-semibold">{formatNGN(t.outstanding)}</TableCell>
                        <TableCell className="tabular-nums font-bold">
                          {Math.round(t.collectionRate || 0)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Aging Report */}
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold">Claims Aging Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold">Aging Period</TableHead>
                      <TableHead className="font-bold">Claims Count</TableHead>
                      <TableHead className="font-bold">Outstanding Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agingReport?.map((a: any) => (
                      <TableRow key={a.bucket}>
                        <TableCell className="font-bold text-slate-800">{a.bucket} ({a.range})</TableCell>
                        <TableCell className="tabular-nums font-bold">{a.count}</TableCell>
                        <TableCell className="tabular-nums font-black text-slate-900">{formatNGN(a.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CLAIMS TAB */}
      {activeTab === "claims" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-1 min-w-[280px] gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search claims by number, patient, HMO..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/20 shadow-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="All">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="partially_approved">Partially Approved</option>
                <option value="denied">Denied</option>
                <option value="settled">Settled</option>
              </select>
            </div>
            <Button onClick={() => setShowAddClaimModal(true)} className="bg-sky-600 hover:bg-sky-700 font-bold rounded-xl gap-2">
              <Plus className="h-4 w-4" /> New Claim
            </Button>
          </div>

          <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Claim #</TableHead>
                    <TableHead className="font-bold">Patient</TableHead>
                    <TableHead className="font-bold">HMO</TableHead>
                    <TableHead className="font-bold">Claimed</TableHead>
                    <TableHead className="font-bold">Approved</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Submitted Date</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClaims.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                        No claims found. Click "New Claim" to submit one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClaims.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-black text-slate-900">{c.claimNumber}</TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : c.patientId}
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{c.hmo?.name || c.hmoId}</TableCell>
                        <TableCell className="tabular-nums font-bold">{formatNGN(c.amountClaimed)}</TableCell>
                        <TableCell className="tabular-nums text-emerald-600 font-bold">{formatNGN(c.amountApproved)}</TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                        <TableCell className="text-slate-500 text-xs tabular-nums">{c.submittedDate?.slice(0, 10) || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowClaimDocumentsModal(c.id)}
                            className="text-xs font-bold text-sky-600 hover:bg-sky-50"
                          >
                            <Upload className="h-3.5 w-3.5 mr-1" /> Docs
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {/* HMO PARTNERS TAB */}
      {activeTab === "partners" && (
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold">HMO Insurers & Tariffs</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Manage partner contacts, commissions, and contract terms.</p>
            </div>
            <Button onClick={() => setShowAddHmoModal(true)} className="bg-sky-600 hover:bg-sky-700 font-bold rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Add Partner
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Partner Name</TableHead>
                    <TableHead className="font-bold">Contact Person</TableHead>
                    <TableHead className="font-bold">Phone</TableHead>
                    <TableHead className="font-bold">Email</TableHead>
                    <TableHead className="font-bold">Commission</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHmos.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-black text-slate-900">{h.name}</TableCell>
                      <TableCell className="font-medium text-slate-700">{h.contactPerson || "—"}</TableCell>
                      <TableCell className="text-slate-600 text-xs">{h.phone || "—"}</TableCell>
                      <TableCell className="text-slate-600 text-xs">{h.email || "—"}</TableCell>
                      <TableCell className="tabular-nums font-bold">{h.commissionRate ? `${h.commissionRate}%` : "0%"}</TableCell>
                      <TableCell>
                        <Badge className={h.isActive !== false ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}>
                          {h.isActive !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AGREEMENTS TAB */}
      {activeTab === "agreements" && (
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold">HMO Tariff & Fee Agreements</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-slate-500">Filter HMO:</span>
                <select
                  value={selectedHmoForAgreements}
                  onChange={(e) => setSelectedHmoForAgreements(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1 text-xs font-bold bg-white"
                >
                  {hmos.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={() => setShowAddAgreementModal(true)} className="bg-sky-600 hover:bg-sky-700 font-bold rounded-xl gap-2">
              <Plus className="h-4 w-4" /> New Agreement
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {agreements.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No agreement found for this HMO. Click "New Agreement" to register tariff prices.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold">Agreement #</TableHead>
                      <TableHead className="font-bold">HMO</TableHead>
                      <TableHead className="font-bold">Consultation</TableHead>
                      <TableHead className="font-bold">Eye Test</TableHead>
                      <TableHead className="font-bold">Frames / Lens</TableHead>
                      <TableHead className="font-bold">Payment Cycle</TableHead>
                      <TableHead className="font-bold">Valid Period</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agreements.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-black text-slate-900">{a.agreementNumber}</TableCell>
                        <TableCell className="font-medium text-slate-700">{a.hmo?.name || a.hmoId}</TableCell>
                        <TableCell className="tabular-nums font-bold">{formatNGN(a.consultationPrice || 0)}</TableCell>
                        <TableCell className="tabular-nums font-bold">{formatNGN(a.eyeTestPrice || 0)}</TableCell>
                        <TableCell className="tabular-nums text-xs">
                          {formatNGN(a.opticalFramePrice || 0)} / {formatNGN(a.lensPrice || 0)}
                        </TableCell>
                        <TableCell className="capitalize font-semibold text-xs">{a.paymentCycle || "monthly"}</TableCell>
                        <TableCell className="text-xs text-slate-500 tabular-nums">
                          {a.startDate?.slice(0, 10)} to {a.endDate?.slice(0, 10)}
                        </TableCell>
                        <TableCell>
                          <Badge className={a.isActive ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}>
                            {a.isActive ? "Active" : "Expired"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AUTHORIZATIONS TAB */}
      {activeTab === "authorizations" && (
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold">Pre-Authorizations & Approvals</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Track procedure authorization requests and codes issued by HMOs.</p>
            </div>
            <Button onClick={() => setShowAddAuthModal(true)} className="bg-sky-600 hover:bg-sky-700 font-bold rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Request Authorization
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Auth Code / #</TableHead>
                    <TableHead className="font-bold">Patient</TableHead>
                    <TableHead className="font-bold">HMO</TableHead>
                    <TableHead className="font-bold">Service Type</TableHead>
                    <TableHead className="font-bold">Estimated Cost</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Valid Until</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authorizations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                        No authorization requests yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    authorizations.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-black text-slate-900">{a.authorizationNumber}</TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : a.patientId}
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{a.hmo?.name || a.hmoId}</TableCell>
                        <TableCell className="capitalize font-semibold text-xs text-slate-600">{a.serviceType}</TableCell>
                        <TableCell className="tabular-nums font-bold">{formatNGN(a.estimatedCost)}</TableCell>
                        <TableCell>{statusBadge(a.status)}</TableCell>
                        <TableCell className="text-xs text-slate-500 tabular-nums">{a.expiryDate?.slice(0, 10) || "—"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          {a.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAuthMut.mutate({ id: a.id, dto: { status: "approved" } }, {
                                  onSuccess: () => notify("success", "Authorization approved"),
                                })}
                                className="text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50 h-7 px-2"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateAuthMut.mutate({ id: a.id, dto: { status: "rejected" } }, {
                                  onSuccess: () => notify("success", "Authorization rejected"),
                                })}
                                className="text-xs text-rose-700 border-rose-300 hover:bg-rose-50 h-7 px-2"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CLAIM BATCHES TAB */}
      {activeTab === "batches" && (
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold">Claim Batches & Schedule Submissions</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Bundle individual claims into monthly or bi-weekly batches for submission.</p>
            </div>
            <Button onClick={() => setShowAddBatchModal(true)} className="bg-sky-600 hover:bg-sky-700 font-bold rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Create Batch
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Batch #</TableHead>
                    <TableHead className="font-bold">HMO Partner</TableHead>
                    <TableHead className="font-bold">Claims Count</TableHead>
                    <TableHead className="font-bold">Total Batch Amount</TableHead>
                    <TableHead className="font-bold">Period</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                        No claim batches created yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    batches.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-black text-slate-900">{b.batchNumber}</TableCell>
                        <TableCell className="font-medium text-slate-700">{b.hmo?.name || b.hmoId}</TableCell>
                        <TableCell className="tabular-nums font-bold">{b.totalClaims || 0}</TableCell>
                        <TableCell className="tabular-nums font-black text-slate-900">{formatNGN(b.totalAmount || 0)}</TableCell>
                        <TableCell className="text-xs text-slate-500 tabular-nums">
                          {b.periodStart ? `${b.periodStart} to ${b.periodEnd}` : "—"}
                        </TableCell>
                        <TableCell>{statusBadge(b.status)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowBatchClaimsModal(b.id);
                              setSelectedBatchClaims([]);
                            }}
                            className="text-xs text-sky-700 border-sky-300 hover:bg-sky-50 h-7 px-2"
                          >
                            + Add Claims
                          </Button>
                          {b.status === "draft" && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => updateBatchMut.mutate({ id: b.id, dto: { status: "submitted" } }, {
                                onSuccess: () => notify("success", "Batch marked as submitted"),
                              })}
                              className="text-xs bg-sky-600 hover:bg-sky-700 h-7 px-2 font-bold"
                            >
                              Submit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* COVERAGE CHECK TAB */}
      {activeTab === "coverage" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-5 rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calculator className="h-5 w-5 text-sky-600" />
                Live HMO Coverage Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCoverageCheck} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Select Patient *</label>
                  <select
                    value={coverageForm.patientId}
                    onChange={(e) => setCoverageForm({ ...coverageForm, patientId: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">HMO Partner *</label>
                  <select
                    value={coverageForm.hmoId}
                    onChange={(e) => setCoverageForm({ ...coverageForm, hmoId: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  >
                    <option value="">-- Choose HMO --</option>
                    {hmos.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Service Type *</label>
                  <select
                    value={coverageForm.serviceType}
                    onChange={(e) => setCoverageForm({ ...coverageForm, serviceType: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="consultation">Consultation</option>
                    <option value="eye_test">Eye Test / Examination</option>
                    <option value="optical">Optical Frame & Lenses</option>
                    <option value="drug">Pharmacy / Medications</option>
                    <option value="surgery">Surgery / Procedure</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Service Amount (NGN) *</label>
                  <input
                    type="number"
                    value={coverageForm.serviceAmount}
                    onChange={(e) => setCoverageForm({ ...coverageForm, serviceAmount: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500/20"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={checkCoverageMut.isPending}
                  className="w-full bg-sky-600 hover:bg-sky-700 font-bold rounded-xl h-11 gap-2 mt-2"
                >
                  {checkCoverageMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Run Coverage Check
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-7 rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-base font-bold">Calculation Result & Patient Copay</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!coverageResult ? (
                <div className="text-center py-16 text-slate-400">
                  <Calculator className="h-12 w-12 mx-auto mb-3 opacity-30 text-sky-600" />
                  <p className="font-bold text-slate-700">No coverage check simulated yet.</p>
                  <p className="text-xs mt-1">Select a patient, HMO, and service amount on the left to compute instant coverage.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={cn("p-4 rounded-2xl border flex items-center justify-between",
                    coverageResult.covered ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                  )}>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Status</span>
                      <p className={cn("text-xl font-black mt-0.5", coverageResult.covered ? "text-emerald-700" : "text-rose-700")}>
                        {coverageResult.covered ? "COVERED BY HMO" : "NOT COVERED"}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">Plan: {coverageResult.planName || "Standard HMO Plan"}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Coverage</span>
                      <p className="text-2xl font-black text-slate-900">{coverageResult.coveragePercent}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase">HMO Responsibility</p>
                      <p className="text-xl font-black text-emerald-600 mt-1">{formatNGN(coverageResult.hmoPays)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase">Patient Out-Of-Pocket</p>
                      <p className="text-xl font-black text-rose-600 mt-1">{formatNGN(coverageResult.patientPays)}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">Standard Copay Amount:</span>
                      <span className="font-bold text-slate-900">{formatNGN(coverageResult.copayAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">Pre-Authorization Required:</span>
                      <span className="font-bold text-slate-900">{coverageResult.requiresAuthorization ? "YES — Request Auth" : "NO"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-semibold">Remaining Allowance:</span>
                      <span className="font-bold text-slate-900">{formatNGN(coverageResult.remainingAllowance)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: ADD HMO PARTNER */}
      <Modal isOpen={showAddHmoModal} onClose={() => setShowAddHmoModal(false)} title="Add HMO Partner">
        <form onSubmit={handleCreateHmo} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">HMO Name *</label>
            <input
              type="text"
              value={hmoForm.name}
              onChange={e => setHmoForm({ ...hmoForm, name: e.target.value })}
              placeholder="e.g. Hygeia HMO"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500/20"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Contact Person</label>
              <input
                type="text"
                value={hmoForm.contactPerson}
                onChange={e => setHmoForm({ ...hmoForm, contactPerson: e.target.value })}
                placeholder="Dr. Johnson"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Commission Rate (%)</label>
              <input
                type="number"
                value={hmoForm.commissionRate}
                onChange={e => setHmoForm({ ...hmoForm, commissionRate: Number(e.target.value) })}
                placeholder="0"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Phone</label>
              <input
                type="text"
                value={hmoForm.phone}
                onChange={e => setHmoForm({ ...hmoForm, phone: e.target.value })}
                placeholder="+234..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Email</label>
              <input
                type="email"
                value={hmoForm.email}
                onChange={e => setHmoForm({ ...hmoForm, email: e.target.value })}
                placeholder="claims@hmo.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowAddHmoModal(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={createHmoMut.isPending} className="flex-1 bg-sky-600 hover:bg-sky-700 font-bold rounded-xl">
              {createHmoMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Partner"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD CLAIM */}
      <Modal isOpen={showAddClaimModal} onClose={() => setShowAddClaimModal(false)} title="Submit New HMO Claim">
        <form onSubmit={handleCreateClaim} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Claim Number *</label>
              <input
                type="text"
                value={claimForm.claimNumber}
                onChange={e => setClaimForm({ ...claimForm, claimNumber: e.target.value })}
                placeholder="CLM-2026-001"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Amount Claimed (NGN) *</label>
              <input
                type="number"
                value={claimForm.amountClaimed || ""}
                onChange={e => setClaimForm({ ...claimForm, amountClaimed: Number(e.target.value) })}
                placeholder="50000"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">HMO Partner *</label>
              <select
                value={claimForm.hmoId}
                onChange={e => setClaimForm({ ...claimForm, hmoId: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white"
                required
              >
                <option value="">-- Choose HMO --</option>
                {hmos.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Patient *</label>
              <select
                value={claimForm.patientId}
                onChange={e => setClaimForm({ ...claimForm, patientId: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white"
                required
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p: any) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Diagnosis</label>
            <input
              type="text"
              value={claimForm.diagnosis}
              onChange={e => setClaimForm({ ...claimForm, diagnosis: e.target.value })}
              placeholder="e.g. Myopia and Astigmatism"
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Treatment Details</label>
            <textarea
              value={claimForm.treatmentDetails}
              onChange={e => setClaimForm({ ...claimForm, treatmentDetails: e.target.value })}
              placeholder="Comprehensive refraction test and prescription optical lenses"
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowAddClaimModal(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={createClaimMut.isPending} className="flex-1 bg-sky-600 hover:bg-sky-700 font-bold rounded-xl">
              {createClaimMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Claim"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD AGREEMENT */}
      <Modal isOpen={showAddAgreementModal} onClose={() => setShowAddAgreementModal(false)} title="New HMO Fee Agreement">
        <form onSubmit={handleCreateAgreement} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Agreement Number *</label>
              <input
                type="text"
                value={agreementForm.agreementNumber}
                onChange={e => setAgreementForm({ ...agreementForm, agreementNumber: e.target.value })}
                placeholder="AGR-2026-001"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">HMO Partner *</label>
              <select
                value={agreementForm.hmoId || effectiveHmoId}
                onChange={e => setAgreementForm({ ...agreementForm, hmoId: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white"
              >
                {hmos.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Consultation Price</label>
              <input
                type="number"
                value={agreementForm.consultationPrice}
                onChange={e => setAgreementForm({ ...agreementForm, consultationPrice: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Eye Test Price</label>
              <input
                type="number"
                value={agreementForm.eyeTestPrice}
                onChange={e => setAgreementForm({ ...agreementForm, eyeTestPrice: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Surgery Price</label>
              <input
                type="number"
                value={agreementForm.surgeryPrice}
                onChange={e => setAgreementForm({ ...agreementForm, surgeryPrice: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Optical Frame Price</label>
              <input
                type="number"
                value={agreementForm.opticalFramePrice}
                onChange={e => setAgreementForm({ ...agreementForm, opticalFramePrice: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Lens Price</label>
              <input
                type="number"
                value={agreementForm.lensPrice}
                onChange={e => setAgreementForm({ ...agreementForm, lensPrice: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowAddAgreementModal(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={createAgreementMut.isPending} className="flex-1 bg-sky-600 hover:bg-sky-700 font-bold rounded-xl">
              {createAgreementMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Agreement"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD AUTHORIZATION */}
      <Modal isOpen={showAddAuthModal} onClose={() => setShowAddAuthModal(false)} title="Request Pre-Authorization">
        <form onSubmit={handleCreateAuth} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Authorization Code / # *</label>
              <input
                type="text"
                value={authForm.authorizationNumber}
                onChange={e => setAuthForm({ ...authForm, authorizationNumber: e.target.value })}
                placeholder="AUTH-2026-001"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Estimated Cost (NGN) *</label>
              <input
                type="number"
                value={authForm.estimatedCost}
                onChange={e => setAuthForm({ ...authForm, estimatedCost: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Patient *</label>
              <select
                value={authForm.patientId}
                onChange={e => setAuthForm({ ...authForm, patientId: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white"
                required
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p: any) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">HMO Partner *</label>
              <select
                value={authForm.hmoId}
                onChange={e => setAuthForm({ ...authForm, hmoId: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white"
                required
              >
                <option value="">-- Choose HMO --</option>
                {hmos.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Service Type *</label>
            <select
              value={authForm.serviceType}
              onChange={e => setAuthForm({ ...authForm, serviceType: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white"
            >
              <option value="consultation">Consultation</option>
              <option value="eye_test">Eye Test</option>
              <option value="optical">Optical Frame & Lens</option>
              <option value="surgery">Cataract / Eye Surgery</option>
              <option value="procedure">Minor Procedure</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Clinical Justification</label>
            <textarea
              value={authForm.clinicalJustification}
              onChange={e => setAuthForm({ ...authForm, clinicalJustification: e.target.value })}
              placeholder="Detailed justification for HMO medical auditor..."
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium resize-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowAddAuthModal(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={createAuthMut.isPending} className="flex-1 bg-sky-600 hover:bg-sky-700 font-bold rounded-xl">
              {createAuthMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Auth"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD CLAIM BATCH */}
      <Modal isOpen={showAddBatchModal} onClose={() => setShowAddBatchModal(false)} title="Create Claim Batch">
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Batch Code / # *</label>
              <input
                type="text"
                value={batchForm.batchNumber}
                onChange={e => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                placeholder="BATCH-2026-001"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">HMO Partner *</label>
              <select
                value={batchForm.hmoId}
                onChange={e => setBatchForm({ ...batchForm, hmoId: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold bg-white"
                required
              >
                <option value="">-- Choose HMO --</option>
                {hmos.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Period Start</label>
              <input
                type="date"
                value={batchForm.periodStart}
                onChange={e => setBatchForm({ ...batchForm, periodStart: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Period End</label>
              <input
                type="date"
                value={batchForm.periodEnd}
                onChange={e => setBatchForm({ ...batchForm, periodEnd: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowAddBatchModal(false)} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" disabled={createBatchMut.isPending} className="flex-1 bg-sky-600 hover:bg-sky-700 font-bold rounded-xl">
              {createBatchMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Batch"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: LINK CLAIMS TO BATCH */}
      <Modal isOpen={!!showBatchClaimsModal} onClose={() => setShowBatchClaimsModal(null)} title="Add Claims to Batch">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Select unbatched claims to add into this submission package:</p>
          <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 p-2 rounded-xl">
            {claims.map((c) => (
              <label key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200">
                <input
                  type="checkbox"
                  checked={selectedBatchClaims.includes(c.id)}
                  onChange={() => {
                    setSelectedBatchClaims(prev =>
                      prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]
                    );
                  }}
                  className="rounded text-sky-600 h-4 w-4"
                />
                <div className="flex-1 text-xs">
                  <span className="font-bold text-slate-900">{c.claimNumber}</span> • {c.hmo?.name || "HMO"} • {formatNGN(c.amountClaimed)}
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowBatchClaimsModal(null)} className="flex-1 rounded-xl">Cancel</Button>
            <Button onClick={handleAddClaimsToBatch} disabled={addClaimsToBatchMut.isPending || selectedBatchClaims.length === 0} className="flex-1 bg-sky-600 hover:bg-sky-700 font-bold rounded-xl">
              {addClaimsToBatchMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Add (${selectedBatchClaims.length}) Claims`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: CLAIM DOCUMENTS & UPLOAD */}
      <Modal isOpen={!!showClaimDocumentsModal} onClose={() => setShowClaimDocumentsModal(null)} title="Claim Documents & Attachments">
        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attached Documents</h4>
            {claimDocuments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 bg-slate-50 text-center rounded-xl">No documents attached to this claim yet.</p>
            ) : (
              <div className="space-y-2">
                {claimDocuments.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">{doc.fileName}</p>
                        <p className="text-slate-400">{doc.documentType || "receipt"} • {doc.fileUrl}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteDocMut.mutate({ id: doc.id, claimId: showClaimDocumentsModal || "" })}
                      className="text-rose-600 hover:bg-rose-50 h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleUploadDoc} className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attach New Document / Receipt</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">File Name *</label>
                <input
                  type="text"
                  value={docForm.fileName}
                  onChange={e => setDocForm({ ...docForm, fileName: e.target.value })}
                  placeholder="invoice-receipt.pdf"
                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Document Type</label>
                <select
                  value={docForm.documentType}
                  onChange={e => setDocForm({ ...docForm, documentType: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold bg-white"
                >
                  <option value="receipt">Receipt</option>
                  <option value="prescription">Doctor Prescription</option>
                  <option value="referral">Referral Letter</option>
                  <option value="authorization_form">Signed Authorization</option>
                  <option value="investigation">Lab / Test Result</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">File URL or Path *</label>
              <input
                type="text"
                value={docForm.fileUrl}
                onChange={e => setDocForm({ ...docForm, fileUrl: e.target.value })}
                placeholder="/uploads/claims/receipt-001.pdf"
                className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium"
                required
              />
            </div>
            <Button type="submit" disabled={uploadDocMut.isPending} className="w-full bg-sky-600 hover:bg-sky-700 font-bold rounded-xl h-9 text-xs gap-1.5">
              {uploadDocMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload & Attach Document
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  );
}