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
  useHmoList,
  useHmoClaims,
  useHmoAgreements,
  useAuthorizations,
  useHmoPlans,
  useAgingReport,
  useHmoTotals,
  useHmoStats,
} from "@/hooks/useHmo";
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
  Plus,
  Shield,
  Eye,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

type HMOTab = "dashboard" | "claims" | "partners" | "agreements" | "authorizations";

const hmoTabs = [
  { id: "dashboard" as HMOTab, label: "Dashboard", icon: TrendingUp },
  { id: "claims" as HMOTab, label: "Claims", icon: FileText },
  { id: "partners" as HMOTab, label: "HMO Partners", icon: Building2 },
  { id: "agreements" as HMOTab, label: "Agreements", icon: Shield },
  { id: "authorizations" as HMOTab, label: "Authorizations", icon: Eye },
] as const;

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

function methodBadge(method: string) {
  if (method === "API") return <Badge className="bg-purple-600 text-white">API</Badge>;
  if (method === "Email") return <Badge className="bg-slate-700 text-white">Email</Badge>;
  return <Badge className="bg-sky-600 text-white">Portal</Badge>;
}

export default function HMOPage() {
  const { data: hmos = [], isLoading: loadingHmos } = useHmoList();
  const { data: claims = [], isLoading: loadingClaims } = useHmoClaims();
  const { data: agingReport } = useAgingReport();
  const { data: totals = [] } = useHmoTotals();
  const { data: stats } = useHmoStats();

  const [activeTab, setActiveTab] = useState<"dashboard" | "claims" | "partners" | "agreements" | "authorizations">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Get first HMO ID for agreements/plans
  const firstHmoId = hmos[0]?.id;

  const { data: agreements = [] } = useHmoAgreements(firstHmoId || "");
  const { data: plans = [] } = useHmoPlans(firstHmoId || "");
  const { data: authorizations = [] } = useAuthorizations();

  // Filter functions
  const filteredClaims = claims.filter(c => {
    const patientName = c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : '';
    const hmoName = c.hmo?.name ?? '';
    const matchesSearch = c.claimNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hmoName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredHmos = hmos.filter(h => {
    const matchesSearch = h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loadingHmos || loadingClaims) {
    return (
      <div className="space-y-8">
        <PageHeader title="HMO Management" description="Claims, partners, agreements, authorizations & analytics." />
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

  // Stats for dashboard
  const totalClaims = claims.length;
  const pendingClaims = claims.filter(c => c.status === "submitted" || c.status === "under_review").length;
  const approvedClaims = claims.filter(c => c.status === "approved" || c.status === "partially_approved").length;
  const totalClaimAmount = claims.reduce((sum, c) => sum + Number(c.amountClaimed), 0);
  const totalApprovedAmount = claims.reduce((sum, c) => sum + Number(c.amountApproved), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="HMO Management"
        description="Claims, partners, agreements, authorizations & analytics."
        actions={[
          { label: "New Claim", variant: "default", onClick: () => {} },
          { label: "Export Report", variant: "outline", onClick: () => {} },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {hmoTabs.map((tab) => (
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

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Total Claims</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{totalClaims}</p>
                </div>
                <FileText size={14} className="shrink-0 text-slate-400" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Pending Claims</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{pendingClaims}</p>
                </div>
                <Clock size={14} className="shrink-0 text-amber-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Approved Amount</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(totalApprovedAmount)}</p>
                </div>
                <DollarSign size={14} className="shrink-0 text-emerald-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">HMO Partners</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{hmos.length}</p>
                </div>
                <Building2 size={14} className="shrink-0 text-blue-500" />
              </CardContent>
            </Card>
          </div>

          {/* HMO Totals by Partner */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold">Claims by HMO Partner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>HMO</TableHead>
                      <TableHead>Total Claims</TableHead>
                      <TableHead>Total Claimed</TableHead>
                      <TableHead>Total Approved</TableHead>
                      <TableHead>Approval Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {totals.map((t: any) => (
                      <TableRow key={t.hmoId}>
                        <TableCell>{t.hmoName}</TableCell>
                        <TableCell className="tabular-nums">{t.totalClaims}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(t.totalClaimed)}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(t.totalApproved)}</TableCell>
                        <TableCell className="tabular-nums">{t.totalClaims > 0 ? Math.round((t.totalApproved / t.totalClaimed) * 100) : 0}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Aging Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold">Aging Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aging Bucket</TableHead>
                      <TableHead>Claim Count</TableHead>
                      <TableHead>Total Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agingReport?.map((a: any) => (
                      <TableRow key={a.bucket}>
                        <TableCell>{a.bucket}</TableCell>
                        <TableCell className="tabular-nums">{a.count}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(a.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === "claims" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search claims..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-100 transition-all shadow-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-100"
            >
              <option value="All">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="partially_approved">Partially Approved</option>
              <option value="denied">Denied</option>
              <option value="appealed">Appealed</option>
              <option value="settled">Settled</option>
            </select>
          </div>

          <Card>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead>Claim #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>HMO</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Approved</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((c: any) => (
                      <TableRow key={c.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">{c.claimNumber}</TableCell>
                        <TableCell>{c.patientName}</TableCell>
                        <TableCell>{c.hmoName}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(c.amountClaimed)}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(c.amountApproved)}</TableCell>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                        <TableCell className="tabular-nums">{c.submittedDate?.slice(0, 10)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* HMO Partners Tab */}
      {activeTab === "partners" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base sm:text-lg font-bold">HMO Partners</CardTitle>
            <Button variant="outline" size="sm" className="self-start">
              <Plus className="h-4 w-4 mr-2" /> Add Partner
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead>Payment Cycle</TableHead>
                    <TableHead>Auth Required</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHmos.map((h: any) => (
                    <TableRow key={h.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium">{h.name}</TableCell>
                      <TableCell>{h.shortCode}</TableCell>
                      <TableCell>{statusBadge(h.status)}</TableCell>
                      <TableCell>{methodBadge(h.claimsSubmissionMethod)}</TableCell>
                      <TableCell>{h.paymentCycle}</TableCell>
                      <TableCell>{h.requiresAuthorization ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-slate-400" />}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agreements Tab */}
      {activeTab === "agreements" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base sm:text-lg font-bold">HMO Agreements</CardTitle>
            <Button variant="outline" size="sm" className="self-start">
              <Plus className="h-4 w-4 mr-2" /> New Agreement
            </Button>
          </CardHeader>
          <CardContent>
            {agreements.length === 0 ? (
              <p className="text-sm text-slate-500">No agreements found for this HMO.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>HMO</TableHead>
                      <TableHead>Effective</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Billing Cycle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agreements.map((a: any) => (
                      <TableRow key={a.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">{a.title}</TableCell>
                        <TableCell>{a.hmoName}</TableCell>
                        <TableCell>{a.effectiveDate?.slice(0, 10)}</TableCell>
                        <TableCell>{a.expiryDate?.slice(0, 10) || "—"}</TableCell>
                        <TableCell>{statusBadge(a.status)}</TableCell>
                        <TableCell>{a.billingCycle}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Authorizations Tab */}
      {activeTab === "authorizations" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base sm:text-lg font-bold">Pre-Authorizations</CardTitle>
              <Button variant="default" size="sm" className="self-start">
                <Plus className="h-4 w-4 mr-2" /> New Authorization
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Auth #</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valid Until</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authorizations.map((a: any) => (
                      <TableRow key={a.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium">{a.authorizationNumber}</TableCell>
                        <TableCell>{a.patientName || a.patientId}</TableCell>
                        <TableCell>{a.serviceType}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(a.approvedAmount)}</TableCell>
                        <TableCell>{statusBadge(a.status)}</TableCell>
                        <TableCell className="tabular-nums">{a.validUntil?.slice(0, 10)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}