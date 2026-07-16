"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { 
    clinicBranches, 
    formatNGN, 
    branchStaffData, 
    branchQueueData,
    branchRegionalMetrics,
    branchStaffProductivity,
    interBranchTransfers,
    branchQueueDistribution,
    branchStaffDistribution
} from "@/app/clinic/_mock/clinic-data";
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
  Plus
} from "lucide-react";

type BranchTab = "network" | "analytics" | "queues" | "staff" | "operations";

export default function BranchesPage() {
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState<BranchTab>("network");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(clinicBranches[0].id);
  const [heatmapOpen, setHeatmapOpen] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: "", to: "", item: "", qty: 0, notes: "" });
  const [trackTransfer, setTrackTransfer] = useState<null | typeof interBranchTransfers[0]>(null);
  const router = useRouter();

  const selectedBranch = clinicBranches.find(b => b.id === selectedBranchId) || clinicBranches[0];
  const totalRevenue = clinicBranches.reduce((acc, b) => acc + b.revenue, 0);

  const tabs = [
    { id: "network", label: "Network Overview", icon: LayoutDashboard },
    { id: "analytics", label: "Performance & KPIs", icon: BarChart3 },
    { id: "queues", label: "Queue Monitoring", icon: Clock },
    { id: "staff", label: "Branch Staff", icon: Users },
    { id: "operations", label: "Operations Hub", icon: ArrowLeftRight },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branch Management"
        description="Enterprise Multi-Branch Command Center: Monitor performance, sync resources, and coordinate network-wide operations."
        actions={[
          { label: "Register New Branch", variant: "primary", onClick: () => openModal("branch") },
          { label: "Regional Benchmark", variant: "outline", onClick: () => {
            const staffLookup = Object.fromEntries(clinicBranches.map(b => {
              const s = branchStaffData.find(st => st.branchId === b.id);
              return [b.id, s];
            }));
            const prodLookup = Object.fromEntries(branchStaffProductivity.map(p => [p.branchId, p]));
            const header = "Branch,Revenue,Patients,Staff,Staff On Duty,Efficiency\n";
            const rows = clinicBranches.map(b => {
              const s = staffLookup[b.id];
              const p = prodLookup[b.id];
              return `"${b.name}",${b.revenue},${b.activePatients},${s?.staffCount ?? 0},${s?.onDuty ?? 0},"${p?.efficiency ?? "N/A"}"`;
            }).join("\n");
            const csv = header + rows;
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "regional-benchmark.csv";
            a.click();
            URL.revokeObjectURL(url);
          } },
        ]}
      />

      {/* Global Network Intelligence */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        {[
          { label: "Network Branches", value: clinicBranches.length, sub: "Across 2 Regions", icon: Building2, color: "text-sky-600" },
          { label: "Global Revenue", value: formatNGN(totalRevenue), sub: "All Branches", icon: TrendingUp, color: "text-emerald-600" },
          { label: "Global Staff", value: branchStaffData.reduce((acc, s) => acc + s.staffCount, 0), sub: "Active Professionals", icon: Users, color: "text-blue-600" },
          { label: "Network Efficiency", value: "88%", sub: "Aggregated Score", icon: Zap, color: "text-amber-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums">{stat.value}</p>
              </div>
              <div className={cn("p-2 sm:p-3 rounded-xl bg-slate-50 shrink-0", stat.color)}>
                <stat.icon size={20} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as BranchTab)}
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

      <div className="space-y-6">
        {activeTab === "network" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Branch Directory</CardTitle>
                    <p className="text-xs sm:text-sm text-slate-500">Live operational status across the network.</p>
                  </div>
                   <Button variant="outline" size="sm" className="self-start rounded-xl font-bold text-xs" onClick={() => setHeatmapOpen(true)}>Regional Heatmap</Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto"><Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="px-8 h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch</TableHead>
                      <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Load</TableHead>
                      <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</TableHead>
                      <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                      <TableHead className="h-12 pr-8 text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clinicBranches.map((branch) => {
                      const staff = branchStaffData.find(s => s.branchId === branch.id);
                      return (
                        <TableRow key={branch.id} className="hover:bg-slate-50/50 border-slate-50 group">
                          <TableCell className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                                <Building2 size={20} />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{branch.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{branch.location}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="space-y-1.5">
                               <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                  <span>{staff?.onDuty} Active</span>
                                  <span>{Math.round(((staff?.onDuty || 0) / (staff?.staffCount || 1)) * 100)}%</span>
                               </div>
                               <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-sky-500" 
                                    style={{ width: `${((staff?.onDuty || 0) / (staff?.staffCount || 1)) * 100}%` }} 
                                  />
                               </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-5 font-bold text-sm text-slate-900">
                            {formatNGN(branch.revenue)}
                          </TableCell>
                          <TableCell className="py-5">
                            <Badge className={cn(
                              "rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                              branch.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                            )}>
                              {branch.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-8 py-5 text-right">
                             <Button 
                               variant="ghost" 
                               size="sm" 
                               className="font-bold text-sky-600 rounded-xl"
                               onClick={() => {
                                 setSelectedBranchId(branch.id);
                                 setActiveTab("analytics");
                               }}
                              >
                               Details <ArrowUpRight size={14} className="ml-1" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table></div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Regional Distribution</p>
                <div className="space-y-4">
                  {branchRegionalMetrics.map(r => (
                    <div key={r.region}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">{r.region}</span>
                        <span className="text-sky-400">{r.growth}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400" style={{ width: r.region.includes("Island") ? "70%" : "30%" }} />
                      </div>
                      <p className="text-[10px] text-white/40 mt-1 font-bold">{r.branches} Branches • {formatNGN(r.revenue)}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Network Alerts</p>
                 <div className="space-y-3">
                    <div className="flex gap-3 p-3 bg-rose-50 rounded-2xl border border-rose-100">
                       <AlertCircle size={16} className="text-rose-600 shrink-0" />
                       <p className="text-xs font-bold text-rose-700 leading-tight">Vemtap Lekki reporting low inventory for Single Vision Blanks.</p>
                    </div>
                    <div className="flex gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                       <Clock size={16} className="text-amber-600 shrink-0" />
                       <p className="text-xs font-bold text-amber-700 leading-tight">Vemtap Main queue time exceeded 25m threshold.</p>
                    </div>
                 </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
           <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">{selectedBranch.name} Performance</h3>
                      <select 
                        className="bg-white border border-slate-200 rounded-xl px-4 py-1.5 text-sm font-bold text-slate-700 outline-none"
                        value={selectedBranchId || ""}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                      >
                         {clinicBranches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs uppercase tracking-wider">Daily</Button>
                     <Button variant="outline" size="sm" className="bg-sky-50 text-sky-700 border-sky-100 rounded-xl font-bold text-xs uppercase tracking-wider">Monthly</Button>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8 bg-white">
                      <CardHeader className="p-0 mb-8">
                          <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">Revenue Growth Trend</CardTitle>
                          <div className="flex items-center gap-4 mt-2">
                             <p className="text-3xl font-bold text-slate-900">{formatNGN(selectedBranch.revenue)}</p>
                             <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold">+14.2%</Badge>
                          </div>
                      </CardHeader>
                      <div className="h-64 flex items-end gap-2 pb-2">
                         {[40, 65, 45, 90, 55, 75, 85, 60, 95, 70, 80, 100].map((h, i) => (
                             <div key={i} className="flex-1 bg-slate-50 rounded-t-lg relative group">
                                <div 
                                  className="absolute bottom-0 left-0 right-0 bg-sky-500 rounded-t-lg transition-all group-hover:bg-sky-600" 
                                  style={{ height: `${h}%` }} 
                                />
                             </div>
                         ))}
                      </div>
                      <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                         <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
                      </div>
                  </Card>

                  <div className="space-y-6">
                      <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Staff Productivity KPIs</p>
                          {branchStaffProductivity.filter(p => p.branchId === selectedBranch.id).map(p => (
                             <div key={p.branchId} className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-1 font-bold text-slate-700">
                                        <span>Doctor KPI</span>
                                        <span className="text-sky-600">{p.doctorKpi}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-sky-500" style={{ width: `${p.doctorKpi}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1 font-bold text-slate-700">
                                        <span>Nurse KPI</span>
                                        <span className="text-purple-600">{p.nurseKpi}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500" style={{ width: `${p.nurseKpi}%` }} />
                                    </div>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-2xl flex items-center gap-3">
                                   <ShieldCheck size={18} className="text-emerald-600" />
                                   <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Operational Efficiency: {p.efficiency}</div>
                                </div>
                             </div>
                          ))}
                      </Card>

                      <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Network Benchmark</p>
                          <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <span className="text-xs font-bold text-white/60">Revenue Rank</span>
                                 <span className="text-sm font-black text-white">#1 in Network</span>
                              </div>
                              <div className="flex justify-between items-center border-t border-white/10 pt-4">
                                 <span className="text-xs font-bold text-white/60">Patient Satisfaction</span>
                                 <span className="text-sm font-black text-sky-400">4.9 / 5.0</span>
                              </div>
                          </div>
                      </Card>
                  </div>
              </div>
           </div>
        )}

        {activeTab === "queues" && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clinicBranches.map(branch => {
                  const queue = branchQueueData.find(q => q.branchId === branch.id);
                  const dist = branchQueueDistribution.find(d => d.branchId === branch.id);
                  return (
                      <Card key={branch.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                  <CardTitle className="text-sm sm:text-base">{branch.name}</CardTitle>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{branch.location}</p>
                              </div>
                              <div className="flex items-center gap-2 self-start">
                                <span className="text-[10px] font-black text-emerald-600 uppercase">Live</span>
                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                              </div>
                          </CardHeader>
                          <CardContent className="p-6">
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div className="bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Waiting</p>
                                      <p className="text-2xl font-bold text-slate-900">{queue?.waiting}</p>
                                  </div>
                                  <div className="bg-sky-50 p-4 rounded-2xl text-center border border-sky-100">
                                      <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Avg Wait</p>
                                      <p className="text-2xl font-bold text-sky-600">{queue?.avgWaitTime}m</p>
                                  </div>
                              </div>
                              
                              <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Department Breakdown</p>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                   {[
                                     { label: "Consultation", val: dist?.consultation || 0, color: "bg-blue-500" },
                                     { label: "Eye Test", val: dist?.eyeTest || 0, color: "bg-purple-500" },
                                     { label: "Optical", val: dist?.optical || 0, color: "bg-amber-500" },
                                     { label: "Pharmacy", val: dist?.pharmacy || 0, color: "bg-emerald-500" },
                                   ].map(dept => (
                                     <div key={dept.label} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                           <div className={cn("w-1.5 h-1.5 rounded-full", dept.color)} />
                                           <span className="text-xs font-bold text-slate-600">{dept.label}</span>
                                        </div>
                                        <span className="text-xs font-black text-slate-900">{dept.val}</span>
                                     </div>
                                   ))}
                                </div>
                              </div>
                              <Button className="w-full mt-6 bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10" onClick={() => router.push("/clinic/queue")}>Monitor Queue</Button>
                          </CardContent>
                      </Card>
                  );
              })}
           </div>
        )}

        {activeTab === "staff" && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinicBranches.map(branch => {
                  const staff = branchStaffData.find(s => s.branchId === branch.id);
                  const dist = branchStaffDistribution.find(d => d.branchId === branch.id);
                  return (
                      <Card key={branch.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
                              <CardTitle className="text-sm sm:text-base">{branch.name} Staff</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-sky-50 text-sky-700 border-none font-black text-[10px]">{staff?.onDuty}/{staff?.staffCount} On Duty</Badge>
                                <span className="text-[10px] font-bold text-slate-400">{branch.manager} (Mgr)</span>
                              </div>
                          </CardHeader>
                          <CardContent className="p-6 space-y-6">
                              <div className="space-y-3">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Personnel Distribution</p>
                                 {[
                                   { role: "Doctors", count: dist?.doctors || 0, icon: ShieldCheck, color: "text-blue-600" },
                                   { role: "Nurses", count: dist?.nurses || 0, icon: Users, color: "text-purple-600" },
                                   { role: "Opticians", count: dist?.opticians || 0, icon: Zap, color: "text-amber-600" },
                                   { role: "Reception", count: dist?.receptionists || 0, icon: ListFilter, color: "text-slate-600" },
                                 ].map(r => (
                                   <div key={r.role} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                                      <div className="flex items-center gap-3">
                                         <r.icon size={16} className={r.color} />
                                         <span className="text-xs font-bold text-slate-700">{r.role}</span>
                                      </div>
                                      <span className="text-sm font-black text-slate-900">{r.count}</span>
                                   </div>
                                 ))}
                              </div>
                              <Button variant="outline" className="w-full rounded-xl font-bold text-sky-600 border-sky-100 hover:bg-sky-50" onClick={() => openModal("staff")}>Manage Personnel</Button>
                          </CardContent>
                      </Card>
                  );
              })}
           </div>
        )}

        {activeTab === "operations" && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                 <CardHeader className="border-b border-slate-50 px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                     <div>
                         <CardTitle className="text-base sm:text-lg">Inter-Branch Stock Transfers</CardTitle>
                         <p className="text-xs sm:text-sm text-slate-500">Monitor and approve inventory movements between branches.</p>
                     </div>
                     <Button variant="primary" size="sm" className="self-start rounded-xl font-bold" onClick={() => setTransferModal(true)}>
                        <Plus size={14} className="sm:mr-1.5" /> <span className="hidden sm:inline">New Transfer</span><span className="sm:hidden">New</span>
                     </Button>
                 </CardHeader>
                 <CardContent className="p-0">
                    <div className="overflow-x-auto"><Table>
                       <TableHeader className="bg-slate-50/50">
                          <TableRow>
                             <TableHead className="px-8 h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">From / To</TableHead>
                             <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Detail</TableHead>
                             <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</TableHead>
                             <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</TableHead>
                             <TableHead className="h-12 pr-8 text-right"></TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {interBranchTransfers.map(tr => (
                             <TableRow key={tr.id} className="hover:bg-slate-50/50 border-slate-50">
                                <TableCell className="px-8 py-5">
                                   <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-700 text-xs">{tr.from}</span>
                                      <ArrowLeftRight size={10} className="text-slate-300" />
                                      <span className="font-bold text-slate-700 text-xs">{tr.to}</span>
                                   </div>
                                </TableCell>
                                <TableCell className="py-5 font-medium text-slate-600 text-xs">{tr.item}</TableCell>
                                <TableCell className="py-5 font-bold text-slate-900">{tr.qty}</TableCell>
                                <TableCell className="py-5">
                                   <Badge variant={tr.status === "Completed" ? "default" : "secondary"} className="text-[10px] uppercase font-black tracking-widest">
                                      {tr.status}
                                   </Badge>
                                </TableCell>
                                 <TableCell className="px-8 py-5 text-right">
                                    <Button variant="ghost" size="sm" className="text-sky-600 font-bold" onClick={() => setTrackTransfer(tr)}>Track</Button>
                                </TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table></div>
                  </CardContent>
              </Card>

              <div className="space-y-6">
                 <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                    <div className="flex items-center gap-3 mb-4">
                       <Share2 className="text-sky-600" size={20} />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shared Patient Access</p>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                       All branches currently synced. Doctors can access patient history, exam results, and prescriptions across all network locations.
                    </p>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                       <span className="text-xs font-bold text-slate-700">Sync Status</span>
                       <Badge className="bg-emerald-50 text-emerald-700 border-none">Live</Badge>
                    </div>
                 </Card>

                 <Card className="border-none shadow-sm rounded-3xl p-6 bg-slate-900 text-white">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Cross-Branch Bookings</p>
                    <div className="space-y-4">
                       <div className="flex justify-between text-xs font-bold">
                          <span>Today's Cross-Bookings</span>
                          <span className="text-sky-400">14 Patients</span>
                       </div>
                        <Button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl border-none font-bold" onClick={() => window.location.href = "/clinic/appointments"}>Schedule Network Appointment</Button>
                    </div>
                 </Card>
              </div>
           </div>
        )}
      </div>

      {/* Heatmap Modal */}
      <Modal isOpen={heatmapOpen} onClose={() => setHeatmapOpen(false)} title="Regional Performance Heatmap">
        <div className="grid grid-cols-2 gap-3">
          {clinicBranches.map(b => (
            <div key={b.id} className={`p-4 rounded-xl border ${b.status === "Active" ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
              <p className="font-bold text-sm">{b.name}</p>
              <p className="text-xs">{b.status === "Active" ? "Operational" : "Closed"} • {b.activePatients} patients</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* New Transfer Modal */}
      <Modal isOpen={transferModal} onClose={() => setTransferModal(false)} title="New Stock Transfer">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From Branch</label>
            <select
              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
              value={transferForm.from}
              onChange={e => setTransferForm(f => ({ ...f, from: e.target.value }))}
            >
              <option value="">Select branch</option>
              {clinicBranches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To Branch</label>
            <select
              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
              value={transferForm.to}
              onChange={e => setTransferForm(f => ({ ...f, to: e.target.value }))}
            >
              <option value="">Select branch</option>
              {clinicBranches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item</label>
            <input
              type="text"
              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
              placeholder="e.g. Lens Blanks"
              value={transferForm.item}
              onChange={e => setTransferForm(f => ({ ...f, item: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</label>
            <input
              type="number"
              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none"
              value={transferForm.qty}
              onChange={e => setTransferForm(f => ({ ...f, qty: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</label>
            <textarea
              className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none resize-none"
              rows={3}
              placeholder="Optional notes"
              value={transferForm.notes}
              onChange={e => setTransferForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setTransferModal(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1 rounded-xl font-bold" onClick={() => {
              alert(`Transfer submitted: ${transferForm.qty}x ${transferForm.item} from ${transferForm.from} to ${transferForm.to}`);
              setTransferForm({ from: "", to: "", item: "", qty: 0, notes: "" });
              setTransferModal(false);
            }}>Submit Transfer</Button>
          </div>
        </div>
      </Modal>

      {/* Track Transfer Modal */}
      <Modal isOpen={!!trackTransfer} onClose={() => setTrackTransfer(null)} title="Transfer Details">
        {trackTransfer && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transfer ID</p>
                <p className="text-sm font-black text-slate-900">{trackTransfer.id}</p>
              </div>
              <Badge className={trackTransfer.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                {trackTransfer.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">From</p>
                <p className="text-sm font-bold text-slate-900">{trackTransfer.from}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">To</p>
                <p className="text-sm font-bold text-slate-900">{trackTransfer.to}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Item</p>
                <p className="text-sm font-bold text-slate-900">{trackTransfer.item}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                <p className="text-sm font-bold text-slate-900">{trackTransfer.qty}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Timeline</p>
              <div className="flex items-center gap-2">
                {["Created", "In Transit", "Received"].map((step, i) => {
                  const isCompleted = (trackTransfer.status === "Completed" && i <= 2) || (trackTransfer.status === "In Transit" && i <= 1) || (i === 0);
                  const isCurrent = (trackTransfer.status === "In Transit" && i === 1) || (trackTransfer.status === "Completed" && i === 2) || (trackTransfer.status !== "In Transit" && trackTransfer.status !== "Completed" && i === 0);
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isCompleted || isCurrent ? "bg-sky-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                          {i + 1}
                        </div>
                        <p className={`text-[10px] font-bold mt-1 ${isCompleted || isCurrent ? "text-sky-600" : "text-slate-400"}`}>{step}</p>
                      </div>
                      {i < 2 && <div className={`flex-1 h-0.5 mt-[-14px] ${isCompleted ? "bg-sky-500" : "bg-slate-200"}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400">Date: {trackTransfer.date}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
