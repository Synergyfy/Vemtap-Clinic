"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import {
  formatNGN,
  clinicRevenueHistory,
  clinicHmoClaims,
  branchQueueData,
  doctorPerformanceData,
  appointmentTrendData,
  opticalConversionData,
  revenueForecastData
} from "@/app/clinic/_mock/clinic-data";
import { useModals } from "@/lib/modal-context";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Building2, 
  ShoppingCart, 
  Download, 
  Filter,
  Calendar,
  Zap,
  Target,
  LineChart,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

type ReportTab = "revenue" | "hmo" | "queues" | "optical" | "staff";

export default function ReportsPage() {
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");

  const tabs = [
    { id: "revenue", label: "Revenue & Growth", icon: TrendingUp },
    { id: "hmo", label: "HMO Intelligence", icon: Building2 },
    { id: "queues", label: "Queue & Throughput", icon: Clock },
    { id: "optical", label: "Optical Analytics", icon: ShoppingCart },
    { id: "staff", label: "Staff KPIs", icon: Target },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Centralized business intelligence: Monitor growth, track KPIs, and optimize clinic operations."
        actions={[
          { label: "Export PDF Report", variant: "primary", onClick: () => alert("Compiling executive intelligence report... PDF generation started.") },
          { label: "Schedule Auto-Send", variant: "outline", onClick: () => openModal("report-schedule") },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReportTab)}
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
        {activeTab === "revenue" && (
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Net Revenue", value: "₦4.8M", change: "+12.5%", trend: "up", sub: "This Month" },
                  { label: "Avg. Transaction", value: "₦28,400", change: "-2.1%", trend: "down", sub: "Per Patient" },
                  { label: "Forecast (Q3)", value: "₦7.2M", change: "+18%", trend: "up", sub: "Predicted" },
                  { label: "Debt Ratio", value: "8.4%", change: "-1.5%", trend: "up", sub: "Collections" },
                ].map((s, i) => (
                  <Card key={i} className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                        <div className={cn(
                          "flex items-center text-[10px] font-black px-2 py-0.5 rounded-lg",
                          s.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {s.trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {s.change}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">{s.sub}</p>
                    </CardContent>
                  </Card>
                ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8 bg-white">
                   <CardHeader className="p-0 mb-8 flex-row items-center justify-between">
                      <div>
                         <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">Revenue Growth vs Forecast</CardTitle>
                         <p className="text-xs text-slate-500 mt-1 font-medium">Tracking historical performance against predictive models.</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-primary" />
                           <span className="text-[10px] font-bold text-slate-500">Actual</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <div className="w-2 h-2 rounded-full bg-slate-200" />
                           <span className="text-[10px] font-bold text-slate-500">Forecast</span>
                        </div>
                      </div>
                   </CardHeader>
                   <div className="h-64 flex items-end gap-3 pb-2 px-4">
                      {clinicRevenueHistory.map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded-t-xl relative group">
                           <div 
                             className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-xl transition-all group-hover:bg-primary/80" 
                             style={{ height: `${((h.private + h.hmo) / 3000000) * 100}%` }} 
                           />
                        </div>
                      ))}
                      {revenueForecastData.map((f, i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded-t-xl relative group">
                           <div 
                             className="absolute bottom-0 left-0 right-0 bg-slate-200 rounded-t-xl border-t-2 border-dashed border-slate-400" 
                             style={{ height: `${(f.forecast / 3000000) * 100}%` }} 
                           />
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 border-t pt-4">
                      {clinicRevenueHistory.map(h => <span key={h.month}>{h.month}</span>)}
                      {revenueForecastData.map(f => <span key={f.month}>{f.month}</span>)}
                   </div>
                </Card>

                <div className="space-y-6">
                   <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Revenue Source Mix</p>
                      <div className="space-y-6">
                         {[
                           { label: "Private (Cash/POS)", val: 65, color: "bg-sky-400" },
                           { label: "HMO Claims", val: 28, color: "bg-purple-400" },
                           { label: "Corporate Contracts", val: 7, color: "bg-emerald-400" },
                         ].map(item => (
                            <div key={item.label}>
                               <div className="flex justify-between text-sm mb-1 font-bold">
                                  <span>{item.label}</span>
                                  <span className="text-sky-400">{item.val}%</span>
                               </div>
                               <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div className={cn("h-full", item.color)} style={{ width: `${item.val}%` }} />
                               </div>
                            </div>
                         ))}
                      </div>
                   </Card>

                   <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Collection Alerts</p>
                      <div className="space-y-3">
                         <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                            <Zap size={16} className="text-amber-600 shrink-0" />
                            <p className="text-xs font-bold text-amber-700">HMO receivables for AXA Mansard exceeded 60-day aging limit.</p>
                         </div>
                      </div>
                   </Card>
                </div>
             </div>
          </div>
        )}

        {activeTab === "hmo" && (
           <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-0 overflow-hidden bg-white">
                    <CardHeader className="px-8 py-6 border-b border-slate-50">
                       <CardTitle className="text-lg">HMO Partner Performance</CardTitle>
                       <p className="text-sm text-slate-500">Comparing profitability and approval speed across partners.</p>
                    </CardHeader>
                    <Table>
                       <TableHeader className="bg-slate-50/50">
                          <TableRow>
                             <TableHead className="px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO Provider</TableHead>
                             <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Approval Rate</TableHead>
                             <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Remittance</TableHead>
                             <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {[
                            { name: "AXA Mansard", rate: 94, days: 18, vol: 85 },
                            { name: "Hygeia HMO", rate: 88, days: 24, vol: 62 },
                            { name: "Reliance HMO", rate: 91, days: 12, vol: 44 },
                            { name: "NHIA", rate: 76, days: 45, vol: 120 },
                          ].map(h => (
                             <TableRow key={h.name} className="hover:bg-slate-50/50 border-slate-50">
                                <TableCell className="px-8 py-5 font-bold text-slate-900">{h.name}</TableCell>
                                <TableCell className="py-5 font-bold text-emerald-600">{h.rate}%</TableCell>
                                <TableCell className="py-5 font-bold text-slate-600">{h.days} Days</TableCell>
                                <TableCell className="py-5 font-black text-slate-900">{h.vol} Patients</TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </Card>

                 <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Claim Rejection Analysis</p>
                       <div className="space-y-4">
                          {[
                            { reason: "Documentation Error", val: 42 },
                            { reason: "Coverage Exceeded", val: 28 },
                            { reason: "Authorization Issues", val: 20 },
                            { reason: "Other", val: 10 },
                          ].map(r => (
                             <div key={r.reason} className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white/60">{r.reason}</span>
                                <span className="text-sm font-black text-rose-400">{r.val}%</span>
                             </div>
                          ))}
                       </div>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-emerald-100">
                        <div className="flex items-center gap-3 mb-4">
                           <Target className="text-emerald-600" size={20} />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HMO ROI Target</p>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                           Current HMO contribution is within the optimal growth band (25-35%).
                        </p>
                        <Badge className="mt-4 bg-emerald-50 text-emerald-700 border-none font-black text-[10px]">ON TARGET</Badge>
                    </Card>
                 </div>
              </div>
           </div>
        )}

        {activeTab === "queues" && (
           <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8 bg-white">
                    <CardHeader className="p-0 mb-8">
                       <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">Appointment vs Arrival Trends</CardTitle>
                       <p className="text-xs text-slate-500 mt-1 font-medium">Monitoring clinic conversion and missed appointment rates.</p>
                    </CardHeader>
                    <div className="h-64 flex items-end gap-3 pb-2 px-4">
                       {appointmentTrendData.map((d, i) => (
                         <div key={i} className="flex-1 space-x-1 flex h-full items-end">
                            <div 
                              className="w-1/2 bg-slate-100 rounded-t-lg transition-all" 
                              style={{ height: `${(d.booked / 700) * 100}%` }} 
                            />
                            <div 
                              className="w-1/2 bg-brand-blue rounded-t-lg transition-all" 
                              style={{ height: `${(d.actual / 700) * 100}%` }} 
                            />
                         </div>
                       ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 border-t pt-4">
                       {appointmentTrendData.map(d => <span key={d.month}>{d.month}</span>)}
                    </div>
                 </Card>

                 <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white text-center">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Network Average Wait</p>
                       <p className="text-4xl font-black text-sky-400">22.4m</p>
                       <p className="text-xs font-bold text-white/60 mt-1">Across 3 active branches</p>
                       <div className="mt-8 flex justify-center gap-4">
                          <div className="text-center">
                             <p className="text-lg font-bold">18m</p>
                             <p className="text-[8px] font-black text-white/40 uppercase">Best</p>
                          </div>
                          <div className="text-center">
                             <p className="text-lg font-bold">34m</p>
                             <p className="text-[8px] font-black text-white/40 uppercase">Worst</p>
                          </div>
                       </div>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Throughput by Stage</p>
                        <div className="space-y-4">
                           {[
                             { label: "Front Desk", val: 4, color: "bg-emerald-500" },
                             { label: "Vitals/Nurse", val: 8, color: "bg-blue-500" },
                             { label: "Doctor Consult", val: 24, color: "bg-purple-500" },
                             { label: "Optical/Billing", val: 12, color: "bg-amber-500" },
                           ].map(s => (
                              <div key={s.label}>
                                 <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-600">
                                    <span>{s.label}</span>
                                    <span>{s.val}m avg</span>
                                 </div>
                                 <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                                    <div className={cn("h-full", s.color)} style={{ width: `${(s.val / 30) * 100}%` }} />
                                 </div>
                              </div>
                           ))}
                        </div>
                    </Card>
                 </div>
              </div>
           </div>
        )}

        {activeTab === "optical" && (
           <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8 bg-white">
                    <CardHeader className="p-0 mb-10 flex-row items-center justify-between">
                       <div>
                          <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed">Conversion Intelligence</CardTitle>
                          <p className="text-2xl font-bold text-slate-900 mt-1">Exam-to-Sale Rate</p>
                       </div>
                       <div className="flex gap-4">
                          <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-slate-100" />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Exams</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <div className="w-2 h-2 rounded-full bg-emerald-500" />
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Optical Sales</span>
                          </div>
                       </div>
                    </CardHeader>
                    
                    <div className="h-72 flex items-end gap-6 px-2">
                       {opticalConversionData.map((d, i) => {
                         const conversionRate = Math.round((d.sales/d.exams)*100);
                         return (
                           <div key={i} className="flex-1 h-full flex flex-col justify-end group">
                              <div className="relative w-full h-[85%] flex items-end justify-center">
                                 {/* Exam Bar (Background) */}
                                 <div 
                                   className="absolute bottom-0 w-full bg-slate-50 rounded-t-2xl transition-all border border-slate-100/50" 
                                   style={{ height: `${(d.exams / 300) * 100}%` }} 
                                 />
                                 {/* Sales Bar (Foreground) */}
                                 <div 
                                   className="relative w-[70%] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all group-hover:from-emerald-500 shadow-lg shadow-emerald-500/10 z-10" 
                                   style={{ height: `${(d.sales / 300) * 100}%` }} 
                                 >
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md z-20">
                                       {d.sales} Sales
                                    </div>
                                 </div>
                              </div>
                              <div className="mt-4 text-center">
                                 <p className="text-[10px] font-black text-emerald-600">{conversionRate}%</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{d.month}</p>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </Card>

                 <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4 leading-relaxed">Product Performance</p>
                       <div className="space-y-6">
                          {[
                            { label: "Designer Frames", val: 45, color: "bg-sky-400" },
                            { label: "Lens Upgrades", val: 35, color: "bg-purple-400" },
                            { label: "Accessories/Drops", val: 20, color: "bg-emerald-400" },
                          ].map(item => (
                             <div key={item.label}>
                                <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                   <span className="text-white/70">{item.label}</span>
                                   <span className="text-sky-400">{item.val}%</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                   <div className={cn("h-full transition-all", item.color)} style={{ width: `${item.val}%` }} />
                                </div>
                             </div>
                          ))}
                       </div>
                       <Button className="w-full mt-10 bg-white/10 hover:bg-white/20 text-white rounded-2xl border-none font-bold text-xs h-12">Detailed Inventory Log</Button>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-sky-100/50">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                              <ShoppingCart size={20} />
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quarterly Growth</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                           <p className="text-4xl font-black text-slate-900">+24%</p>
                           <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] py-0.5">OUTPERFORMING</Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Vs. Previous Segment</p>
                    </Card>
                 </div>
              </div>
           </div>
        )}

        {activeTab === "staff" && (
           <Card className="border-none shadow-sm rounded-3xl p-0 overflow-hidden bg-white">
              <CardHeader className="px-8 py-6 border-b border-slate-50 flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-lg">Staff Performance KPIs</CardTitle>
                    <p className="text-sm text-slate-500">Individual productivity and quality-of-care metrics.</p>
                 </div>
                 <Button variant="outline" size="sm" className="font-bold" onClick={() => alert("Generating global quarterly performance review...")}>Quarterly Review</Button>
              </CardHeader>
              <Table>
                 <TableHeader className="bg-slate-50/50">
                    <TableRow>
                       <TableHead className="px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Practitioner</TableHead>
                       <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consultations</TableHead>
                       <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Rating</TableHead>
                       <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Time</TableHead>
                       <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest pr-8 text-right">Actions</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {doctorPerformanceData.map(p => (
                       <TableRow key={p.name} className="hover:bg-slate-50/50 border-slate-50">
                          <TableCell className="px-8 py-5 font-bold text-slate-900">{p.name}</TableCell>
                          <TableCell className="py-5 font-black text-slate-700">{p.volume}</TableCell>
                          <TableCell className="py-5 font-bold text-emerald-600">{p.satisfaction} / 5.0</TableCell>
                          <TableCell className="py-5 font-bold text-slate-500">{p.avgConsult}</TableCell>
                          <TableCell className="py-5 pr-8 text-right">
                             <Button variant="ghost" size="sm" className="text-sky-600 font-bold" onClick={() => openModal("staff-profile")}>Full Profile</Button>
                          </TableCell>
                       </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </Card>
        )}
      </div>
    </div>
  );
}
