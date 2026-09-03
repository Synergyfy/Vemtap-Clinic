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
import { useModals } from "@/lib/modal-context";
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

  // Initialize selected branch
  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

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
  const totalRevenue = branches.reduce((sum, b) => sum + b.revenue, 0);
  const totalPatients = branches.reduce((sum, b) => sum + b.activePatients, 0);
  const activeBranches = branches.filter(b => b.status === "Active").length;

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
                  <p className="mt-1 text-2xl font-bold text-slate-900">{branches.length}</p>
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
                  <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(totalRevenue)}</p>
                </div>
                <DollarSign size={14} className="shrink-0 text-emerald-500" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500">Active Patients</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{totalPatients}</p>
                </div>
                <Users size={14} className="shrink-0 text-blue-500" />
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
                      <TableHead>Location</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Active Patients</TableHead>
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
                            <span>{b.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>{b.manager}</TableCell>
                        <TableCell className="tabular-nums">{formatNGN(b.revenue)}</TableCell>
                        <TableCell className="tabular-nums">{b.activePatients}</TableCell>
                        <TableCell>
                          {b.status === "Active" ? (
                            <Badge className="bg-emerald-600 text-white">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Closed</Badge>
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
              <CardTitle className="text-base sm:text-lg font-bold">Inter-Branch Stock Transfers</CardTitle>
              <Button variant="outline" size="sm" className="self-start" onClick={() => setTransferModal(true)}>
                <Plus className="h-4 w-4 mr-2" /> New Transfer
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer ID</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interBranchTransfers.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.id}</TableCell>
                        <TableCell>{t.from}</TableCell>
                        <TableCell>{t.to}</TableCell>
                        <TableCell>{t.item}</TableCell>
                        <TableCell className="tabular-nums">{t.qty}</TableCell>
                        <TableCell>
                          {t.status === "Completed" && <Badge className="bg-emerald-600 text-white">Completed</Badge>}
                          {t.status === "In Transit" && <Badge className="bg-amber-600 text-white">In Transit</Badge>}
                          {t.status === "Pending" && <Badge variant="secondary">Pending</Badge>}
                        </TableCell>
                        <TableCell className="tabular-nums">{t.date}</TableCell>
                      </TableRow>
                    ))}
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