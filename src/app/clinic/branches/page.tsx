"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { 
    clinicBranches, 
    formatNGN, 
    branchStaffData, 
    branchQueueData 
} from "@/app/clinic/_mock/clinic-data";
import { useModals } from "@/lib/modal-context";
import { cn } from "@/lib/utils";
import { Building2, TrendingUp, Users, Clock, MapPin, ArrowUpRight, BarChart3, ListFilter } from "lucide-react";

type BranchTab = "overview" | "analytics" | "queues";

export default function BranchesPage() {
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState<BranchTab>("overview");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(clinicBranches[0].id);

  const selectedBranch = clinicBranches.find(b => b.id === selectedBranchId) || clinicBranches[0];
  const totalRevenue = clinicBranches.reduce((acc, b) => acc + b.revenue, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Branch Management"
        description="Monitor performance, coordinate resources, and oversee operations across your clinic network."
        actions={[
          { label: "Register New Branch", variant: "primary", onClick: () => openModal("branch") },
          { label: "Global Reports", variant: "outline", onClick: () => openModal("report") },
        ]}
      />

      {/* Global Network Intelligence */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Branches", value: clinicBranches.length, sub: "All operational", icon: Building2, color: "text-sky-600" },
          { label: "Network Revenue", value: formatNGN(totalRevenue), sub: "This month", icon: TrendingUp, color: "text-emerald-600" },
          { label: "Global Patients", value: "755", sub: "Active records", icon: Users, color: "text-blue-600" },
          { label: "Avg. Queue Time", value: "18m", sub: "Network average", icon: Clock, color: "text-amber-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl bg-slate-50", stat.color)}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 leading-tight">{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-medium">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
        {[
          { id: "overview", label: "Network Overview", icon: ListFilter },
          { id: "analytics", label: "Performance Analytics", icon: BarChart3 },
          { id: "queues", label: "Live Queues", icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as BranchTab)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-white text-brand-navy shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === "overview" && (
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Branch Directory</CardTitle>
                <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs uppercase tracking-wider">Map View</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead className="px-8 h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Name</TableHead>
                    <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</TableHead>
                    <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Manager</TableHead>
                    <TableHead className="h-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Load</TableHead>
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
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{branch.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                            <MapPin size={14} className="text-slate-400" />
                            {branch.location}
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{branch.manager[0]}</div>
                             <span className="text-sm font-bold text-slate-700">{branch.manager}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-5">
                          <div className="space-y-1.5">
                             <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>{staff?.onDuty}/{staff?.staffCount} On Duty</span>
                                <span>{Math.round(((staff?.onDuty || 0) / (staff?.staffCount || 1)) * 100)}%</span>
                             </div>
                             <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-sky-500" 
                                  style={{ width: `${((staff?.onDuty || 0) / (staff?.staffCount || 1)) * 100}%` }} 
                                />
                             </div>
                          </div>
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
                             className="font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl"
                             onClick={() => {
                               setSelectedBranchId(branch.id);
                               setActiveTab("analytics");
                             }}
                            >
                             Dashboard <ArrowUpRight size={14} className="ml-1" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
           <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-slate-900">{selectedBranch.name} Performance</h3>
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
                  <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8">
                      <CardHeader className="p-0 mb-8">
                          <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">Revenue Growth</CardTitle>
                          <p className="text-3xl font-bold text-slate-900 mt-2">{formatNGN(selectedBranch.revenue)}</p>
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
                      <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white">
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Patient Acquisition</p>
                          <div className="space-y-4">
                              <div>
                                  <div className="flex justify-between text-sm mb-1">
                                      <span className="font-bold">Private Patients</span>
                                      <span className="text-sky-400">65%</span>
                                  </div>
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <div className="h-full bg-sky-400 w-[65%]" />
                                  </div>
                              </div>
                              <div>
                                  <div className="flex justify-between text-sm mb-1">
                                      <span className="font-bold">HMO Patients</span>
                                      <span className="text-purple-400">35%</span>
                                  </div>
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                      <div className="h-full bg-purple-400 w-[35%]" />
                                  </div>
                              </div>
                          </div>
                          <Button className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white rounded-xl border-none">Download Stats</Button>
                      </Card>

                      <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Top Services</p>
                          <div className="space-y-3">
                              {[
                                  { name: "Consultation", val: "₦1.2M" },
                                  { name: "Refraction", val: "₦850K" },
                                  { name: "Optical Sales", val: "₦2.4M" },
                              ].map((s, i) => (
                                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
                                      <span className="text-xs font-bold text-slate-700">{s.name}</span>
                                      <span className="text-xs font-black text-sky-600">{s.val}</span>
                                  </div>
                              ))}
                          </div>
                      </Card>
                  </div>
              </div>
           </div>
        )}

        {activeTab === "queues" && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {clinicBranches.map(branch => {
                  const queue = branchQueueData.find(q => q.branchId === branch.id);
                  return (
                      <Card key={branch.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex-row items-center justify-between">
                              <div>
                                  <CardTitle className="text-base">{branch.name}</CardTitle>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{branch.location}</p>
                              </div>
                              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                          </CardHeader>
                          <CardContent className="p-6">
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Waiting</p>
                                      <p className="text-2xl font-bold text-slate-900">{queue?.waiting}</p>
                                  </div>
                                  <div className="bg-sky-50 p-4 rounded-2xl text-center">
                                      <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Serving</p>
                                      <p className="text-2xl font-bold text-sky-600">{queue?.inService}</p>
                                  </div>
                              </div>
                              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-6 px-1">
                                  <div className="flex items-center gap-1">
                                      <Clock size={14} className="text-slate-400" />
                                      <span>Avg. Wait: {queue?.avgWaitTime}m</span>
                                  </div>
                                  <span className="text-emerald-600 text-[10px] uppercase tracking-wider font-black">Optimal</span>
                              </div>
                              <Button className="w-full bg-brand-navy hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10">Manage Queue</Button>
                          </CardContent>
                      </Card>
                  );
              })}
           </div>
        )}
      </div>
    </div>
  );
}
