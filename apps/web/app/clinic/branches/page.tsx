"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useBranches, useBranchStats, useCreateBranch } from "@/hooks/useBranches";
import { useQueue } from "@/hooks/useQueue";
import { useStaff } from "@/hooks/useStaff";
import { useTransfers } from "@/hooks/useInventoryTransfers";
import { useModals } from "@/lib/modal-context";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
  const { user } = useAuth();
  const createBranchMutation = useCreateBranch();
  const [activeTab, setActiveTab] = useState<BranchTab>("network");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: "", to: "", item: "", qty: 0, notes: "" });
  const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
  });

  const { data: branches = [], isLoading: loadingBranches } = useBranches();
  const { data: branchStats } = useBranchStats();
  const { data: queueResponse } = useQueue({ clinicId: user?.clinicId ?? undefined, limit: 500 });
  const { data: staffResponse } = useStaff({ clinicId: user?.clinicId ?? undefined, limit: 500 });
  const { data: liveTransfers = [] } = useTransfers();
  const queueEntries = queueResponse?.data ?? [];
  const staffEntries = staffResponse?.data ?? [];

  // Initialize selected branch
  useEffect(() => {
    if (branches.length > 0) {
      const hasSelected = selectedBranchId && branches.some((branch) => branch.id === selectedBranchId);
      if (!hasSelected) {
        setSelectedBranchId(branches[0].id);
      }
    }
  }, [branches, selectedBranchId]);

  const handleBranchFieldChange = (field: keyof typeof branchForm, value: string) => {
    setBranchForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateBranch = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.clinicId) {
      toast.error("Clinic context is missing. Please sign in again.");
      return;
    }

    if (!branchForm.name.trim() || !branchForm.address.trim()) {
      toast.error("Branch name and address are required.");
      return;
    }

    try {
      const createdBranch = await createBranchMutation.mutateAsync({
        name: branchForm.name.trim(),
        address: branchForm.address.trim(),
        city: branchForm.city.trim() || undefined,
        state: branchForm.state.trim() || undefined,
        phone: branchForm.phone.trim() || undefined,
        email: branchForm.email.trim() || undefined,
      });

      setBranchForm({ name: "", address: "", city: "", state: "", phone: "", email: "" });
      setIsCreateBranchOpen(false);
      setSelectedBranchId(createdBranch.id);
      toast.success(`Branch created: ${createdBranch.name}`);
    } catch (error) {
      console.error("Failed to create branch", error);
      toast.error("Unable to create branch right now. Please try again.");
    }
  };

  const totalBranches = branchStats?.total ?? branches.length;
  const activeBranches = branchStats?.active ?? branches.filter((branch) => branch.isActive).length;
  const inactiveBranches = branchStats?.inactive ?? totalBranches - activeBranches;

  const branchPerformance = branches.map((branch) => {
    const activeStaff = staffEntries.filter((staff) => staff.branchId === branch.id && staff.isActive);
    const doctors = activeStaff.filter((staff) => staff.role === "doctor").length;
    const nurses = activeStaff.filter((staff) => staff.role === "nurse").length;
    const queueCount = queueEntries.filter((entry) => entry.branchId === branch.id).length;
    const activityScore = Math.min(
      100,
      Math.max(0, Math.round(((queueCount + activeStaff.length * 2) / Math.max(branches.length || 1, 1)) * 25)),
    );

    return {
      branchId: branch.id,
      branchName: branch.name,
      queueCount,
      activeStaff: activeStaff.length,
      doctors,
      nurses,
      activityScore,
      efficiency: activityScore >= 70 ? "High" : activityScore >= 40 ? "Stable" : "Low",
    };
  });

  const branchRegionalMetrics = branchPerformance.map((metric) => ({
    branchId: metric.branchId,
    region: metric.branchName,
    queueLoad: metric.queueCount,
    staff: metric.activeStaff,
    growth: `${Math.min(99, Math.max(0, metric.activityScore))}%`,
  }));

  const branchStaffProductivity = branchPerformance.map((metric) => {
    const totalStaff = Math.max(metric.activeStaff, 1);
    const doctorKpi = Math.round((metric.doctors / totalStaff) * 100);
    const nurseKpi = Math.round((metric.nurses / totalStaff) * 100);

    return {
      branchId: metric.branchId,
      doctorKpi,
      nurseKpi,
      efficiency: metric.efficiency,
    };
  });

  const branchQueueDistribution = branches.map((branch) => {
    const branchQueue = queueEntries.filter((entry) => entry.branchId === branch.id);
    const counts = branchQueue.reduce(
      (acc, entry) => {
        const key = (entry.serviceType || entry.queueType || entry.station || "consultation").toLowerCase();
        const normalizedKey = key.includes("eye") ? "eyeTest" : key.includes("pharmacy") ? "pharmacy" : key.includes("opt") ? "optical" : "consultation";
        acc[normalizedKey] = (acc[normalizedKey] ?? 0) + 1;
        return acc;
      },
      { consultation: 0, eyeTest: 0, optical: 0, pharmacy: 0 } as Record<string, number>,
    );

    return {
      branchId: branch.id,
      consultation: counts.consultation,
      eyeTest: counts.eyeTest,
      optical: counts.optical,
      pharmacy: counts.pharmacy,
    };
  });

  const branchStaffDistribution = branches.map((branch) => {
    const activeStaff = staffEntries.filter((staff) => staff.branchId === branch.id && staff.isActive);
    const doctors = activeStaff.filter((staff) => staff.role === "doctor").length;
    const nurses = activeStaff.filter((staff) => staff.role === "nurse").length;
    const opticians = activeStaff.filter((staff) => staff.role === "optometrist").length;
    const receptionists = activeStaff.filter((staff) => staff.role === "receptionist").length;

    return {
      branchId: branch.id,
      doctors,
      nurses,
      opticians,
      receptionists,
    };
  });

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
          { label: "New Branch", variant: "default", onClick: () => setIsCreateBranchOpen(true) },
        ]}
      />

      <Modal isOpen={isCreateBranchOpen} onClose={() => setIsCreateBranchOpen(false)} title="Create new branch">
        <form className="space-y-4" onSubmit={handleCreateBranch}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Branch name</label>
            <input
              value={branchForm.name}
              onChange={(event) => handleBranchFieldChange("name", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="e.g. Vemtap Lekki"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
            <input
              value={branchForm.address}
              onChange={(event) => handleBranchFieldChange("address", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="Branch address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
              <input
                value={branchForm.city}
                onChange={(event) => handleBranchFieldChange("city", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="Lagos"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">State</label>
              <input
                value={branchForm.state}
                onChange={(event) => handleBranchFieldChange("state", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="Lagos State"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
              <input
                value={branchForm.phone}
                onChange={(event) => handleBranchFieldChange("phone", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="+234..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                value={branchForm.email}
                onChange={(event) => handleBranchFieldChange("email", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="branch@vemtap.com"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateBranchOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBranchMutation.isPending}>
              {createBranchMutation.isPending ? "Creating..." : "Create branch"}
            </Button>
          </div>
        </form>
      </Modal>

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
                      <TableRow key={r.branchId}>
                        <TableCell className="font-medium">{r.region}</TableCell>
                        <TableCell className="tabular-nums">{r.queueLoad}</TableCell>
                        <TableCell className="tabular-nums">{r.staff}</TableCell>
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
                    {branchStaffProductivity.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-400 py-6 text-xs">
                          Staff productivity will appear here after staff records are created for this clinic.
                        </TableCell>
                      </TableRow>
                    ) : branchStaffProductivity.map((p) => {
                      const branch = branches.find(b => b.id === p.branchId);
                      return (
                        <TableRow key={p.branchId}>
                          <TableCell className="font-medium">{branch?.name || p.branchId}</TableCell>
                          <TableCell className="tabular-nums">{p.doctorKpi}%</TableCell>
                          <TableCell className="tabular-nums">{p.nurseKpi}%</TableCell>
                          <TableCell><Badge className={p.efficiency === "High" ? "bg-emerald-100 text-emerald-700" : p.efficiency === "Stable" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}>{p.efficiency}</Badge></TableCell>
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
                  {branchQueueDistribution.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-400 py-6 text-xs">
                        Queue data is empty for this clinic until patients are added to a branch.
                      </TableCell>
                    </TableRow>
                  ) : branchQueueDistribution.map((q) => {
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
                  {branchStaffDistribution.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-400 py-6 text-xs">
                        No staff assignments found for this clinic yet.
                      </TableCell>
                    </TableRow>
                  ) : branchStaffDistribution.map((s) => {
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
              <CardTitle className="text-base sm:text-lg font-bold">Live Branch Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Current queue load and staffing intensity for each branch in this clinic.</p>
              <div className="mt-4 space-y-3">
                {branchPerformance.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No branch activity has been recorded yet.</p>
                ) : branchPerformance.map((item) => (
                  <div key={item.branchId} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                      <span>{item.branchName}</span>
                      <span>{item.queueCount} queued</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                        style={{ width: `${Math.min(100, item.activityScore)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}