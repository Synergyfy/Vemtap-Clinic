"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useBranches, useBranchStats } from "@/hooks/useBranches";
import { useTransfers } from "@/hooks/useInventoryTransfers";
import { useModals } from "@/lib/modal-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Building2,
  TrendingUp,
  Users,
  Clock,
  MapPin,
  ArrowUpRight,
  BarChart3,
  ListFilter,
  ArrowLeftRight,
  Share2,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  DollarSign
} from "lucide-react";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

type BranchTab = "network" | "analytics" | "queues" | "staff" | "operations";

const branchTabs = [
  { id: "network" as BranchTab, label: "Network", icon: Building2 },
  { id: "analytics" as BranchTab, label: "Analytics", icon: BarChart3 },
  { id: "queues" as BranchTab, label: "Queues", icon: Clock },
  { id: "staff" as BranchTab, label: "Staff", icon: Users },
  { id: "operations" as BranchTab, label: "Operations", icon: ArrowLeftRight },
] as const;

export default function BranchesPage() {
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState<BranchTab>("network");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: "", to: "", item: "", qty: 0, notes: "" });

  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const { data: branchStats } = useBranchStats();
  const { data: liveTransfers = [] } = useTransfers();

  // Initialize selected branch
  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  const totalBranches = branchStats?.total ?? branches.length;
  const activeBranches = branchStats?.active ?? branches.filter((branch) => branch.isActive).length;
  const inactiveBranches = branchStats?.inactive ?? totalBranches - activeBranches;

  // Static data for features without backend APIs
  const branchRegionalMetrics = [
    { region: "Lagos Island", revenue: 3050000, branches: 2, growth: "+12%" },
    { region: "Lagos Mainland", revenue: 1200000, branches: 1, growth: "+8%" },
  ];

  const branchStaffProductivity = [
    { branchId: "B-001", doctorKpi: 92, nurseKpi: 88, efficiency: "High" },
    { branchId: "B-002", doctorKpi: 85, nurseKpi: 82, efficiency: "Optimal" },
    { branchId: "B-003", doctorKpi: 78, nurseKpi: 90, efficiency: "Optimal" },
  ];

  const interBranchTransfers = [
    { id: "TR-501", from: "Vemtap Main", to: "Vemtap Ikeja", item: "Lens Blanks (Single)", qty: 50, status: "Completed", date: "2026-05-25" },
    { id: "TR-502", from: "Vemtap Lekki", to: "Vemtap Main", item: "Designer Frames", qty: 12, status: "In Transit", date: "2026-05-27" },
  ];

  const branchQueueDistribution = [
    { branchId: "B-001", consultation: 12, eyeTest: 5, optical: 8, pharmacy: 3 },
    { branchId: "B-002", consultation: 4, eyeTest: 2, optical: 3, pharmacy: 1 },
    { branchId: "B-003", consultation: 2, eyeTest: 1, optical: 4, pharmacy: 0 },
  ];

  const branchStaffDistribution = [
    { branchId: "B-001", doctors: 3, nurses: 4, opticians: 2, receptionists: 3 },
    { branchId: "B-002", doctors: 1, nurses: 2, opticians: 1, receptionists: 1 },
    { branchId: "B-003", doctors: 1, nurses: 1, opticians: 2, receptionists: 1 },
  ];

  if (loadingBranches) {
    return (
      <div className="space-y-8">
        <PageHeader title="Branch Management" description="Network overview, analytics, queues, staff & operations." />
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

  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Branch Management"
        description="Network overview, analytics, queues, staff & operations."
        actions={[
          { label: "New Branch", variant: "default", onClick: () => {} },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {branchTabs.map((tab) => (
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

      {/* Network Tab */}
      {activeTab === "network" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Total Branches</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{totalBranches}</p>
                </div>
                <Building2 size={14} className="shrink-0 text-slate-400" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Active Branches</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{activeBranches}</p>
                </div>
                <ShieldCheck size={14} className="shrink-0 text-emerald-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Inactive Branches</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{inactiveBranches}</p>
                </div>
                <AlertCircle size={14} className="shrink-0 text-amber-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Locations</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{branches.length}</p>
                </div>
                <MapPin size={14} className="shrink-0 text-blue-500" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base sm:text-lg font-bold">Branch Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((b) => (
                      <TableRow key={b.id} className={selectedBranchId === b.id ? "bg-sky-50/50" : ""}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{b.address || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{[b.city, b.state].filter(Boolean).join(" / ") || "—"}</TableCell>
                        <TableCell>{b.phone || b.email || "—"}</TableCell>
                        <TableCell>
                          {b.isActive ? (
                            <Badge className="bg-emerald-600 text-white">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedBranchId(b.id)}>
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold">Regional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Region</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Branches</TableHead>
                      <TableHead>Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchRegionalMetrics.map((r) => (
                      <TableRow key={r.region}>
                        <TableCell className="font-medium">{r.region}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(r.revenue)}</TableCell>
                        <TableCell className="tabular-nums">{r.branches}</TableCell>
                        <TableCell><Badge className="bg-emerald-100 text-emerald-700">{r.growth}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold">Staff Productivity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead>Doctor KPI</TableHead>
                      <TableHead>Nurse KPI</TableHead>
                      <TableHead>Efficiency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branchStaffProductivity.map((p) => {
                      const branch = branches.find(b => b.id === p.branchId);
                      return (
                        <TableRow key={p.branchId}>
                          <TableCell className="font-medium">{branch?.name || p.branchId}</TableCell>
                          <TableCell className="tabular-nums">{p.doctorKpi}%</TableCell>
                          <TableCell className="tabular-nums">{p.nurseKpi}%</TableCell>
                          <TableCell><Badge className={p.efficiency === "High" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}>{p.efficiency}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Queues Tab */}
      {activeTab === "queues" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Queue Distribution by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Consultation</TableHead>
                    <TableHead>Eye Test</TableHead>
                    <TableHead>Optical</TableHead>
                    <TableHead>Pharmacy</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchQueueDistribution.map((q) => {
                    const branch = branches.find(b => b.id === q.branchId);
                    const total = q.consultation + q.eyeTest + q.optical + q.pharmacy;
                    return (
                      <TableRow key={q.branchId}>
                        <TableCell className="font-medium">{branch?.name || q.branchId}</TableCell>
                        <TableCell className="tabular-nums">{q.consultation}</TableCell>
                        <TableCell className="tabular-nums">{q.eyeTest}</TableCell>
                        <TableCell className="tabular-nums">{q.optical}</TableCell>
                        <TableCell className="tabular-nums">{q.pharmacy}</TableCell>
                        <TableCell className="tabular-nums font-bold">{total}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff Tab */}
      {activeTab === "staff" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg font-bold">Staff Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch</TableHead>
                    <TableHead>Doctors</TableHead>
                    <TableHead>Nurses</TableHead>
                    <TableHead>Opticians</TableHead>
                    <TableHead>Receptionists</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchStaffDistribution.map((s) => {
                    const branch = branches.find(b => b.id === s.branchId);
                    const total = s.doctors + s.nurses + s.opticians + s.receptionists;
                    return (
                      <TableRow key={s.branchId}>
                        <TableCell className="font-medium">{branch?.name || s.branchId}</TableCell>
                        <TableCell className="tabular-nums">{s.doctors}</TableCell>
                        <TableCell className="tabular-nums">{s.nurses}</TableCell>
                        <TableCell className="tabular-nums">{s.opticians}</TableCell>
                        <TableCell className="tabular-nums">{s.receptionists}</TableCell>
                        <TableCell className="tabular-nums font-bold">{total}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operations Tab */}
      {activeTab === "operations" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold">Inter-Branch Stock Transfers</CardTitle>
                <p className="text-xs text-slate-500">Live inventory requisitions and shipments across branches</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/clinic/inventory-transfers"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeftRight size={13} /> Open Transfers Suite
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer #</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveTransfers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-400 py-6 text-xs">
                          No active transfer requests found. Click &quot;Open Transfers Suite&quot; to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      liveTransfers.slice(0, 5).map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-mono font-bold">{t.transferNumber}</TableCell>
                          <TableCell>{t.fromBranch?.name || t.fromBranchId}</TableCell>
                          <TableCell className="font-medium text-blue-600">{t.toBranch?.name || t.toBranchId}</TableCell>
                          <TableCell className="uppercase text-[10px] font-bold">{t.type}</TableCell>
                          <TableCell className="tabular-nums font-semibold">{t.items?.length || 0} items</TableCell>
                          <TableCell>
                            <span className="capitalize font-bold text-xs">{t.status.replace("_", " ")}</span>
                          </TableCell>
                          <TableCell className="tabular-nums text-slate-500">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-bold">Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Patient density and resource utilization heatmap (placeholder).</p>
              <div className="mt-4 aspect-square rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400">Heatmap visualization</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}