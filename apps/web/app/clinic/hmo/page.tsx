"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Tooltip } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import {
  defaultClinicHmoAgreements,
  formatNGN,
  hmoMasterRecords,
  clinicHmoClaims,
  clinicHmoPatients,
  type ClinicHmoAgreement,
  type HmoMasterRecord,
} from "@/app/clinic/_mock/clinic-data";
import { 
  Building2, 
  FileText, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter,
  Download,
  Plus
} from "lucide-react";
import { useModals } from "@/lib/modal-context";

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "active" || s === "verified" || s === "approved" || s === "paid") 
    return <Badge className="bg-emerald-600 text-white">{status}</Badge>;
  if (s === "paused" || s === "pending" || s === "submitted") 
    return <Badge className="bg-amber-600 text-white">{status}</Badge>;
  if (s === "queried" || s === "rejected") 
    return <Badge className="bg-rose-600 text-white">{status}</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function methodBadge(method: HmoMasterRecord["claimsSubmissionMethod"]) {
  if (method === "API") return <Badge className="bg-purple-600 text-white">API</Badge>;
  if (method === "Email") return <Badge className="bg-slate-700 text-white">Email</Badge>;
  return <Badge className="bg-sky-600 text-white">Portal</Badge>;
}

function inputClassName() {
  return "mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100";
}

function numberField(value: number, onChange: (v: number) => void, tooltipContent?: string) {
  return (
    <Tooltip content={tooltipContent || "Enter numerical value"}>
      <input
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        inputMode="numeric"
        className={inputClassName()}
      />
    </Tooltip>
  );
}

export default function HMOPage() {
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [agreements, setAgreements] = React.useState<ClinicHmoAgreement[]>(defaultClinicHmoAgreements);
  const [selectedHmoId, setSelectedHmoId] = React.useState<string>(defaultClinicHmoAgreements[0]?.hmoId ?? "");
  const [isActivateOpen, setIsActivateOpen] = React.useState(false);
  const [claimSearch, setClaimSearch] = useState("");
  const [claimFilterOpen, setClaimFilterOpen] = useState(false);
  const [claimFilterStatus, setClaimFilterStatus] = useState("All");
  const [claimFilterDateFrom, setClaimFilterDateFrom] = useState("");
  const [claimFilterDateTo, setClaimFilterDateTo] = useState("");
  const [verifyAllOpen, setVerifyAllOpen] = useState(false);
  const [historyPatient, setHistoryPatient] = useState<typeof clinicHmoPatients[number] | null>(null);
  const [reverifyPatient, setReverifyPatient] = useState<typeof clinicHmoPatients[number] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const exportCSV = (data: Record<string, any>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(","), ...data.map(row => headers.map(h => `"${row[h]}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredClaims = clinicHmoClaims.filter((c) => {
    const matchesSearch =
      claimSearch === "" ||
      c.patientName.toLowerCase().includes(claimSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(claimSearch.toLowerCase()) ||
      c.hmo.toLowerCase().includes(claimSearch.toLowerCase());
    const matchesStatus = claimFilterStatus === "All" || c.status === claimFilterStatus;
    const matchesDateFrom = !claimFilterDateFrom || c.submittedISO >= claimFilterDateFrom;
    const matchesDateTo = !claimFilterDateTo || c.submittedISO <= claimFilterDateTo;
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const selected = agreements.find((a) => a.hmoId === selectedHmoId) ?? null;
  const activatedIds = React.useMemo(() => new Set(agreements.map((a) => a.hmoId)), [agreements]);
  const availableToActivate = React.useMemo(
    () => hmoMasterRecords.filter((h) => !activatedIds.has(h.id) && h.status === "Active"),
    [activatedIds]
  );

  const [activateForm, setActivateForm] = React.useState({
    hmoId: availableToActivate[0]?.id ?? "",
    agreementStartISO: new Date().toISOString().slice(0, 10),
    billingCycle: "Monthly" as ClinicHmoAgreement["billingCycle"],
    paymentCycle: "Monthly" as ClinicHmoAgreement["paymentCycle"],
    claimsSubmissionSchedule: "Monthly" as ClinicHmoAgreement["claimsSubmissionSchedule"],
  });

  React.useEffect(() => {
    const next = availableToActivate[0]?.id ?? "";
    setActivateForm((p) => {
      if (p.hmoId) return p;
      if (!next) return p;
      return { ...p, hmoId: next };
    });
  }, [availableToActivate]);

  const activate = (e: React.FormEvent) => {
    e.preventDefault();
    const record = hmoMasterRecords.find((h) => h.id === activateForm.hmoId);
    if (!record) return;

    const newAgreement: ClinicHmoAgreement = {
      hmoId: record.id,
      hmoName: record.name,
      status: "Active",
      agreementStartISO: activateForm.agreementStartISO,
      billingCycle: activateForm.billingCycle,
      paymentCycle: activateForm.paymentCycle,
      claimsSubmissionSchedule: activateForm.claimsSubmissionSchedule,
      pricingRules: {
        consultation: 0,
        eyeTest: 0,
        diagnostics: 0,
        optical: 0,
        lens: 0,
        frame: 0,
        drugs: 0,
        surgery: 0,
        procedure: 0,
      },
      claimsSettings: {
        submissionFormat: record.claimsSubmissionMethod === "API" ? "API payload" : record.claimsSubmissionMethod === "Email" ? "Spreadsheet" : "Portal export",
        requiredDocuments: ["Invoice summary"],
        batchingRules: "Monthly batch",
        approvalWorkflow: "Clinic review → Submit",
      },
    };

    setAgreements((prev) => [newAgreement, ...prev]);
    setSelectedHmoId(record.id);
    setIsActivateOpen(false);
  };

  const updateSelected = (next: ClinicHmoAgreement) => {
    setAgreements((prev) => prev.map((a) => (a.hmoId === next.hmoId ? next : a)));
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "claims", label: "Claims Management", icon: FileText },
    { id: "patients", label: "HMO Patients", icon: Users },
    { id: "agreements", label: "Agreements", icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-4 w-4" />
          {successMessage}
        </div>
      )}
      <PageHeader
        title="HMO Management"
        description="Enterprise insurance hub: Manage agreements, track claims, and verify patient coverage."
        actions={[
          { label: "Verify HMO", onClick: () => openModal("hmo-verify"), variant: "primary" },
          { label: "New Claim", onClick: () => openModal("hmo-claim") },
          { label: "Export All Claims", onClick: () => {
            exportCSV(
              clinicHmoClaims.map(c => ({ "Claim ID": c.id, "HMO Provider": c.hmo, "Patient": c.patientName, "Amount": c.amount, "Status": c.status, "Submitted": c.submittedISO, "Details": c.claimDetails || "" })),
              "hmo_claims_export.csv"
            );
            showSuccess("Claims exported as CSV successfully.");
          }},
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Total Receivables</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {formatNGN(clinicHmoClaims.reduce((acc, c) => acc + (c.status !== "Paid" ? c.amount : 0), 0))}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Unpaid claims across all HMOs</p>
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Pending Claims</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {clinicHmoClaims.filter(c => c.status === "Submitted" || c.status === "Draft").length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Waiting for approval or submission</p>
                </div>
                <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Queries/Rejected</p>
                  <p className="mt-1 text-2xl font-bold text-rose-600">
                    {clinicHmoClaims.filter(c => c.status === "Queried" || c.status === "Rejected").length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Requires attention or appeal</p>
                </div>
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Verified Patients</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {clinicHmoPatients.filter(p => p.status === "Verified").length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Coverage confirmed this month</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">Top HMO Partners</CardTitle>
                <p className="text-xs sm:text-sm text-slate-500">HMO revenue distribution for the current period.</p>
              </CardHeader>
              <CardContent className="space-y-6 pt-4 border-t">
                {agreements.map((a) => {
                  const total = clinicHmoClaims.filter(c => c.hmo === a.hmoName).reduce((acc, c) => acc + c.amount, 0);
                  const max = clinicHmoClaims.reduce((acc, c) => acc + c.amount, 0);
                  return (
                    <div key={a.hmoId} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-800">{a.hmoName}</span>
                        <span className="font-bold text-slate-900">{formatNGN(total)}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(total / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">Claim Status Pipeline</CardTitle>
                <p className="text-xs sm:text-sm text-slate-500">Tracking the lifecycle of your insurance billings.</p>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center pt-4 border-t">
                 <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
                    {[
                      { label: "Approved", count: clinicHmoClaims.filter(c => c.status === "Approved" || c.status === "Paid").length, color: "text-emerald-600" },
                      { label: "Processing", count: clinicHmoClaims.filter(c => c.status === "Submitted").length, color: "text-amber-600" },
                      { label: "Action Required", count: clinicHmoClaims.filter(c => c.status === "Queried" || c.status === "Rejected").length, color: "text-rose-600" },
                      { label: "Drafts", count: clinicHmoClaims.filter(c => c.status === "Draft").length, color: "text-slate-500" },
                    ].map(item => (
                      <div key={item.label} className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className={`text-2xl font-black ${item.color}`}>{item.count}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.label}</p>
                      </div>
                    ))}
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "claims" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Claims Management</CardTitle>
              <p className="text-xs sm:text-sm text-slate-500">Track and manage insurance claim submissions.</p>
            </div>
            <div className="flex flex-col items-end gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
               <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search claim or HMO..." 
                  className="pl-9 pr-4 py-2 text-sm border rounded-md w-full sm:w-56 focus:outline-none"
                  value={claimSearch}
                  onChange={(e) => setClaimSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="self-start" onClick={() => setClaimFilterOpen(!claimFilterOpen)}>
                <Filter className="h-4 w-4 mr-2" />
                {claimFilterOpen ? "Hide Filters" : "Filter"}
              </Button>
            </div>
            {claimFilterOpen && (
              <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 w-full">
                <select
                  value={claimFilterStatus}
                  onChange={(e) => setClaimFilterStatus(e.target.value)}
                  className="text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                  <option value="Queried">Queried</option>
                  <option value="Rejected">Rejected</option>
                </select>
                <input
                  type="date"
                  value={claimFilterDateFrom}
                  onChange={(e) => setClaimFilterDateFrom(e.target.value)}
                  className="text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none"
                  placeholder="From date"
                />
                <span className="text-slate-400 text-sm">to</span>
                <input
                  type="date"
                  value={claimFilterDateTo}
                  onChange={(e) => setClaimFilterDateTo(e.target.value)}
                  className="text-sm border rounded-lg px-3 py-2 bg-white focus:outline-none"
                  placeholder="To date"
                />
                <Button variant="ghost" size="sm" onClick={() => {
                  setClaimFilterStatus("All");
                  setClaimFilterDateFrom("");
                  setClaimFilterDateTo("");
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
           <div className="overflow-x-auto"><Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="pl-6">Claim ID</TableHead>
                  <TableHead>HMO Provider</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Service Summary</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((c) => (
                  <TableRow key={c.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{c.id}</TableCell>
                    <TableCell className="font-medium text-slate-700">{c.hmo}</TableCell>
                    <TableCell>{c.patientName}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-slate-500 text-sm">
                      {c.claimDetails || "General Consultation"}
                    </TableCell>
                    <TableCell className="font-bold tabular-nums">{formatNGN(c.amount)}</TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openModal("claim")}>Review</Button>
                    </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table></div>
           </CardContent>
         </Card>
       )}

       {activeTab === "patients" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold">Enrolled Patients</CardTitle>
              <p className="text-xs sm:text-sm text-slate-500">Monitor coverage status for active HMO patients.</p>
            </div>
            <Button variant="outline" size="sm" className="self-start" onClick={() => setVerifyAllOpen(true)}>
               <CheckCircle2 className="h-4 w-4 sm:mr-2" />
               <span className="hidden sm:inline">Verify All Expiring</span>
               <span className="sm:hidden">Verify All</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
           <div className="overflow-x-auto"><Table>
               <TableHeader>
                 <TableRow>
                   <TableHead className="pl-6">Patient ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>HMO Provider</TableHead>
                  <TableHead>Policy Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicHmoPatients.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50">
                    <TableCell className="pl-6 font-medium">{p.id}</TableCell>
                    <TableCell className="font-bold">{p.name}</TableCell>
                    <TableCell>{p.hmo}</TableCell>
                    <TableCell className="font-mono text-xs">{p.hmoNumber}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell className="text-sm text-slate-500">{p.expiryISO}</TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setHistoryPatient(p)}>History</Button>
                      <Button variant="ghost" size="sm" className="text-primary" onClick={() => setReverifyPatient(p)}>Re-verify</Button>
                    </TableCell>
                 </TableRow>
                 ))}
               </TableBody>
             </Table></div>
           </CardContent>
         </Card>
       )}

       {activeTab === "agreements" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Active Agreements</CardTitle>
                <p className="text-xs sm:text-sm text-slate-500">{agreements.length} contracts signed</p>
              </div>
              <Button size="sm" className="self-start" onClick={() => setIsActivateOpen(true)} disabled={availableToActivate.length === 0}>
                <Plus className="h-4 w-4 sm:mr-2" />
                Activate
              </Button>
            </CardHeader>
            <CardContent>
             <div className="overflow-x-auto"><Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>HMO</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Billing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agreements.map((a) => (
                    <TableRow
                      key={a.hmoId}
                      onClick={() => setSelectedHmoId(a.hmoId)}
                      className={selectedHmoId === a.hmoId ? "bg-sky-50" : undefined}
                      style={{ cursor: "pointer" }}
                    >
                      <TableCell className="font-medium">{a.hmoName}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                      <TableCell className="text-slate-600">{a.billingCycle}</TableCell>
                    </TableRow>
                   ))}
                 </TableBody>
               </Table></div>
             </CardContent>
           </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base sm:text-lg font-bold">Agreement Configuration</CardTitle>
              {selected ? <div className="shrink-0 self-start">{statusBadge(selected.status)}</div> : null}
            </CardHeader>
            <CardContent>
              {!selected ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-slate-500">
                  Select an activated HMO to configure agreement settings.
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-lg font-bold text-slate-900">General Settings</h3>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelected({
                            ...selected,
                            status: selected.status === "Active" ? "Paused" : "Active",
                          })
                        }
                        className="text-sm font-medium text-sky-700 hover:text-sky-800"
                      >
                        {selected.status === "Active" ? "Pause Agreement" : "Resume Agreement"}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Display Name</label>
                        <Tooltip content="Custom name for internal tracking">
                          <input
                              value={selected.hmoName}
                              onChange={(e) => updateSelected({ ...selected, hmoName: e.target.value })}
                              className={inputClassName()}
                              placeholder="Custom HMO Name"
                          />
                        </Tooltip>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Agreement Start</label>
                        <Tooltip content="Official commencement date of the HMO contract">
                          <input
                              value={selected.agreementStartISO}
                              onChange={(e) => updateSelected({ ...selected, agreementStartISO: e.target.value })}
                              className={inputClassName()}
                              placeholder="YYYY-MM-DD"
                          />
                        </Tooltip>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Billing Cycle</label>
                        <select
                            value={selected.billingCycle}
                            onChange={(e) =>
                            updateSelected({ ...selected, billingCycle: e.target.value as ClinicHmoAgreement["billingCycle"] })
                            }
                            className={inputClassName()}
                        >
                            <option value="Per visit">Per visit</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Payment Cycle</label>
                        <select
                            value={selected.paymentCycle}
                            onChange={(e) =>
                            updateSelected({ ...selected, paymentCycle: e.target.value as ClinicHmoAgreement["paymentCycle"] })
                            }
                            className={inputClassName()}
                        >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-2">HMO Tariff Rules</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Consultation</label>
                        {numberField(selected.pricingRules.consultation, (v) =>
                          updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, consultation: v } })
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Eye Test</label>
                        {numberField(selected.pricingRules.eyeTest, (v) =>
                          updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, eyeTest: v } })
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Diagnostics</label>
                        {numberField(selected.pricingRules.diagnostics, (v) =>
                          updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, diagnostics: v } })
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Lens</label>
                        {numberField(selected.pricingRules.lens, (v) =>
                          updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, lens: v } })
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Frame</label>
                        {numberField(selected.pricingRules.frame, (v) =>
                          updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, frame: v } })
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Surgery</label>
                        {numberField(selected.pricingRules.surgery, (v) =>
                          updateSelected({ ...selected, pricingRules: { ...selected.pricingRules, surgery: v } })
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Claims Submission Hub</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Digital Format</label>
                        <select
                            value={selected.claimsSettings.submissionFormat}
                            onChange={(e) =>
                            updateSelected({
                                ...selected,
                                claimsSettings: { ...selected.claimsSettings, submissionFormat: e.target.value as ClinicHmoAgreement["claimsSettings"]["submissionFormat"] },
                            })
                            }
                            className={inputClassName()}
                        >
                            <option value="Spreadsheet">Spreadsheet (Excel)</option>
                            <option value="Portal export">Portal Export</option>
                            <option value="API payload">Direct API Payload</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Batching Rule</label>
                        <select
                            value={selected.claimsSettings.batchingRules}
                            onChange={(e) =>
                            updateSelected({
                                ...selected,
                                claimsSettings: { ...selected.claimsSettings, batchingRules: e.target.value as ClinicHmoAgreement["claimsSettings"]["batchingRules"] },
                            })
                            }
                            className={inputClassName()}
                        >
                            <option value="Per patient">Per Patient</option>
                            <option value="Per visit">Per Visit</option>
                            <option value="Monthly batch">Monthly Batch</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                         <Button variant="outline" className="w-full h-12 rounded-2xl font-bold" onClick={() => {
                           if (!selected) return;
                           const content = [
                             `HMO Agreement Summary`,
                             `${"=".repeat(40)}`,
                             ``,
                             `HMO Partner: ${selected.hmoName}`,
                             `Status: ${selected.status}`,
                             `Agreement Start: ${selected.agreementStartISO}`,
                             `Billing Cycle: ${selected.billingCycle}`,
                             `Payment Cycle: ${selected.paymentCycle}`,
                             ``,
                             `Claims Submission Format: ${selected.claimsSettings.submissionFormat}`,
                             `Batching Rules: ${selected.claimsSettings.batchingRules}`,
                             `Approval Workflow: ${selected.claimsSettings.approvalWorkflow}`,
                             `Required Documents: ${selected.claimsSettings.requiredDocuments.join(", ")}`,
                             ``,
                             `Tariff Rules:`,
                             `  Consultation: ₦${selected.pricingRules.consultation}`,
                             `  Eye Test: ₦${selected.pricingRules.eyeTest}`,
                             `  Diagnostics: ₦${selected.pricingRules.diagnostics}`,
                             `  Lens: ₦${selected.pricingRules.lens}`,
                             `  Frame: ₦${selected.pricingRules.frame}`,
                             `  Surgery: ₦${selected.pricingRules.surgery}`,
                           ].join("\n");
                           const blob = new Blob([content], { type: "text/plain" });
                           const url = URL.createObjectURL(blob);
                           const a = document.createElement("a");
                           a.href = url;
                           a.download = `${selected.hmoName.replace(/\s+/g, "_")}_agreement.txt`;
                           a.click();
                           URL.revokeObjectURL(url);
                           showSuccess("Agreement summary downloaded.");
                         }}>
                           <Download className="h-4 w-4 mr-2" />
                           Download Agreement PDF
                         </Button>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Modal isOpen={isActivateOpen} onClose={() => setIsActivateOpen(false)} title="Activate New HMO Agreement">
        {availableToActivate.length === 0 ? (
          <div className="text-sm text-slate-600">No additional HMOs are available to activate right now.</div>
        ) : (
          <form onSubmit={activate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Select HMO Partner</label>
              <select
                  value={activateForm.hmoId}
                  onChange={(e) => setActivateForm((p) => ({ ...p, hmoId: e.target.value }))}
                  className={inputClassName()}
              >
                  {availableToActivate.map((h) => (
                  <option key={h.id} value={h.id}>
                      {h.name} ({h.shortCode})
                  </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Agreement Start</label>
                <input
                  value={activateForm.agreementStartISO}
                  onChange={(e) => setActivateForm((p) => ({ ...p, agreementStartISO: e.target.value }))}
                  className={inputClassName()}
                  placeholder="YYYY-MM-DD"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Billing Cycle</label>
                <select
                  value={activateForm.billingCycle}
                  onChange={(e) =>
                      setActivateForm((p) => ({ ...p, billingCycle: e.target.value as ClinicHmoAgreement["billingCycle"] }))
                  }
                  className={inputClassName()}
                >
                  <option value="Per visit">Per visit</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Partner Master Rules</p>
              <div className="mt-2 space-y-1">
                {(() => {
                  const h = hmoMasterRecords.find((x) => x.id === activateForm.hmoId);
                  if (!h) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Claims method</span>
                        <span className="flex items-center gap-2">{methodBadge(h.claimsSubmissionMethod)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Authorization</span>
                        <span className="font-medium">{h.requiresAuthorization ? "Required" : "Not required"}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsActivateOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Activate HMO</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={verifyAllOpen} onClose={() => setVerifyAllOpen(false)} title="Verify All Expiring Enrollments">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Verify all expiring patient enrollments? This will re-check eligibility with all HMO providers.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setVerifyAllOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setVerifyAllOpen(false);
                showSuccess("All expiring enrollments verified with HMO providers.");
              }}
            >
              Confirm Verification
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!historyPatient} onClose={() => setHistoryPatient(null)} title={historyPatient ? `${historyPatient.name} - HMO History` : ""}>
        {historyPatient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-500 font-medium">HMO Provider</p>
                <p className="font-bold text-slate-900">{historyPatient.hmo}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-slate-500 font-medium">Policy Number</p>
                <p className="font-bold text-slate-900 font-mono">{historyPatient.hmoNumber}</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Activity Log</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Eligibility Verified</p>
                    <p className="text-xs text-slate-500">2026-01-15 - Coverage confirmed for 2026</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                  <FileText className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Claim Submitted</p>
                    <p className="text-xs text-slate-500">2026-03-20 - CLM-1101 - ₦120,000 - Cataract Surgery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Claim Approved</p>
                    <p className="text-xs text-slate-500">2026-04-01 - CLM-1101 approved by HMO</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Renewal Due</p>
                    <p className="text-xs text-slate-500">{historyPatient.expiryISO} - Policy expires, re-verification required</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="ghost" onClick={() => setHistoryPatient(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!reverifyPatient} onClose={() => setReverifyPatient(null)} title="Re-verify Patient Enrollment">
        {reverifyPatient && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Patient</span>
                <span className="font-bold text-slate-900">{reverifyPatient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">HMO Provider</span>
                <span className="font-medium text-slate-700">{reverifyPatient.hmo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Policy Number</span>
                <span className="font-mono text-slate-700">{reverifyPatient.hmoNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status</span>
                {statusBadge(reverifyPatient.status)}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expiry Date</span>
                <span className="text-slate-700">{reverifyPatient.expiryISO}</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              This will send a real-time eligibility check to {reverifyPatient.hmo} to confirm the patient&apos;s coverage status.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setReverifyPatient(null)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => {
                  setReverifyPatient(null);
                  showSuccess(`${reverifyPatient.name} re-verified with ${reverifyPatient.hmo}. Status: Verified.`);
                }}
              >
                Confirm Re-verification
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
