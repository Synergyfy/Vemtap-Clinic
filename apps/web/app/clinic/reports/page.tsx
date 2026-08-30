"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useRevenueSummary, useStaffKPIs, useQueueAnalytics, useAppointmentTrends, useOpticalAnalytics } from "@/hooks/useReports";
import { useModals } from "@/lib/modal-context";
import { cn } from "@/lib/utils";
import {
  BarChart3, TrendingUp, TrendingDown, Users, Clock, Building2, ShoppingCart,
  Download, Filter, Calendar, Zap, Target, LineChart, PieChart,
  ArrowUpRight, ArrowDownRight, Loader2, Wallet
} from "lucide-react";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

type ReportTab = "revenue" | "hmo" | "queues" | "optical" | "staff";

export default function ReportsPage() {
  const { user } = useAuth();
  const { openModal } = useModals();
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");

  // Backend hooks
  const { data: revenue, isLoading: revenueLoading } = useRevenueSummary();
  const { data: staffKPIs = [], isLoading: staffLoading } = useStaffKPIs();
  const { data: queueAnalytics, isLoading: queueLoading } = useQueueAnalytics();
  const { data: appointmentTrends = {}, isLoading: trendsLoading } = useAppointmentTrends();
  const { data: opticalAnalytics, isLoading: opticalLoading } = useOpticalAnalytics();

  const tabs = [
    { id: "revenue", label: "Revenue & Growth", icon: TrendingUp },
    { id: "hmo", label: "HMO Intelligence", icon: Building2 },
    { id: "queues", label: "Queue & Throughput", icon: Clock },
    { id: "optical", label: "Optical Analytics", icon: ShoppingCart },
    { id: "staff", label: "Staff KPIs", icon: Target },
  ];

  const formatCurrency = (val: number | undefined | null) => {
    const v = val || 0;
    if (v >= 1000000) return `₦${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `₦${(v / 1000).toFixed(0)}K`;
    return formatNGN(v);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Centralized business intelligence: Monitor growth, track KPIs, and optimize clinic operations."
        actions={[
          { label: "Export Report", variant: "primary", onClick: () => {
            const report = `VEMTAP CLINIC REPORT\n${"=".repeat(40)}\n\nREVENUE\n-------\nTotal Revenue: ${formatNGN(revenue?.totalRevenue || 0)}\nNet Profit: ${formatNGN(revenue?.netProfit || 0)}\nOutstanding: ${formatNGN(revenue?.outstanding || 0)}\n\nEXPENSES\n--------\nTotal: ${formatNGN(revenue?.totalExpenses || 0)}\n\nSTAFF KPIs\n----------\n${staffKPIs.map(s => `${s.name}: ${s.totalAppointments} appts, ${s.completionRate}% completion`).join("\n")}\n\nGenerated: ${new Date().toLocaleString()}\n`;
            const blob = new Blob([report], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "vemtap-clinic-report.txt"; a.click();
            URL.revokeObjectURL(url);
          } },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as ReportTab)}
            className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            }`}>
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Revenue Tab */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
              {[
                { label: "Total Revenue", value: formatCurrency(revenue?.totalPaid || 0), sub: "Collected", icon: TrendingUp, color: "emerald" },
                { label: "Outstanding", value: formatCurrency(revenue?.outstanding || 0), sub: `${revenue?.invoiceCount || 0} invoices`, icon: Filter, color: "amber" },
                { label: "Total Expenses", value: formatCurrency(revenue?.totalExpenses || 0), sub: `${revenue?.expenseCount || 0} recorded`, icon: TrendingDown, color: "rose" },
                { label: "Net Profit", value: formatCurrency(revenue?.netProfit || 0), sub: "Revenue - Expenses", icon: Wallet, color: (revenue?.netProfit || 0) >= 0 ? "emerald" : "rose" },
              ].map((s, i) => (
                <Card key={i} className="border-none shadow-sm bg-white">
                  <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm font-medium text-slate-500">{s.label}</p>
                      <p className="mt-1 text-xl sm:text-2xl font-bold tabular-nums">{s.value}</p>
                      <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
                    </div>
                    <s.icon className={`h-4 w-4 text-${s.color}-500 shrink-0`} />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Monthly Revenue Chart */}
            <Card className="border-none shadow-sm rounded-3xl p-8 bg-white">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">Monthly Revenue vs Expenses</CardTitle>
              </CardHeader>
              {revenueLoading ? (
                <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
              ) : (
                <div className="h-64 flex items-end gap-3 pb-2 px-4">
                  {Object.keys(revenue?.monthlyRevenue || {}).length === 0 ? (
                    <p className="text-sm text-slate-400 text-center w-full py-8">No revenue data yet</p>
                  ) : (
                    Object.entries(revenue?.monthlyRevenue || {}).map(([month, amount]) => (
                      <div key={month} className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{month}</span>
                          <span>{formatCurrency(amount)}</span>
                        </div>
                        <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="h-full bg-emerald-500" style={{ width: `${(amount / Math.max(...Object.values(revenue?.monthlyRevenue || { 0: 1 }))) * 100}%` }} />
                          <div className="h-full bg-rose-400 opacity-50 absolute left-0" style={{ width: `${((revenue?.monthlyExpenses?.[month] || 0) / Math.max(...Object.values(revenue?.monthlyRevenue || { 0: 1 }))) * 100}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* HMO Tab */}
        {activeTab === "hmo" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">HMO Intelligence</CardTitle>
              <p className="text-xs sm:text-sm text-slate-500">HMO claims and partner performance analytics.</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 text-center py-8">
                Detailed HMO analytics are available in the <a href="/clinic/hmo-advanced" className="text-sky-600 underline">HMO Advanced</a> module.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Queue Tab */}
        {activeTab === "queues" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8 bg-white">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">Appointment Trends</CardTitle>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Booked vs completed appointments by month.</p>
                </CardHeader>
                {trendsLoading ? (
                  <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : Object.keys(appointmentTrends).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-16">No appointment data yet</p>
                ) : (
                  <div className="h-64 flex items-end gap-3 pb-2 px-4">
                    {Object.entries(appointmentTrends).map(([month, data]) => (
                      <div key={month} className="flex-1 space-x-1 flex h-full items-end">
                        <div className="w-1/2 bg-slate-100 rounded-t-lg" style={{ height: `${(data.booked / Math.max(...Object.values(appointmentTrends).map(d => d.booked), 1)) * 100}%` }} />
                        <div className="w-1/2 bg-sky-500 rounded-t-lg" style={{ height: `${(data.completed / Math.max(...Object.values(appointmentTrends).map(d => d.booked), 1)) * 100}%` }} />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 border-t pt-4">
                  {Object.keys(appointmentTrends).map(m => <span key={m}>{m}</span>)}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="border-none shadow-sm rounded-3xl p-6 bg-brand-navy text-white text-center">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Queue Status</p>
                  <p className="text-4xl font-black text-sky-400">{queueAnalytics?.waiting || 0}</p>
                  <p className="text-xs font-bold text-white/60 mt-1">Patients waiting</p>
                  <div className="mt-8 flex justify-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">{queueAnalytics?.inProgress || 0}</p>
                      <p className="text-[8px] font-black text-white/40 uppercase">In Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{queueAnalytics?.completed || 0}</p>
                      <p className="text-[8px] font-black text-white/40 uppercase">Completed</p>
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patients by Station</p>
                  {queueLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <div key={i} className="h-6 bg-slate-100 rounded animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(queueAnalytics?.byStation || {}).map(([station, count]) => (
                        <div key={station}>
                          <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-600">
                            <span className="capitalize">{station}</span>
                            <span>{count}</span>
                          </div>
                          <div className="h-1 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500" style={{ width: `${(count / Math.max(queueAnalytics?.total || 1, 1)) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                      {Object.keys(queueAnalytics?.byStation || {}).length === 0 && (
                        <p className="text-sm text-slate-400 text-center py-4">No queue data</p>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Optical Tab */}
        {activeTab === "optical" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl p-8 bg-white">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">Optical Sales Performance</CardTitle>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">Conversion Rate: {opticalAnalytics?.conversionRate || 0}%</p>
                </CardHeader>
                {opticalLoading ? (
                  <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                ) : (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-slate-50 rounded-2xl">
                      <p className="text-3xl font-black text-slate-900">{opticalAnalytics?.totalSales || 0}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">Total Sales</p>
                    </div>
                    <div className="text-center p-6 bg-emerald-50 rounded-2xl">
                      <p className="text-3xl font-black text-emerald-600">{opticalAnalytics?.completed || 0}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">Completed</p>
                    </div>
                    <div className="text-center p-6 bg-sky-50 rounded-2xl">
                      <p className="text-3xl font-black text-sky-600">{formatNGN(opticalAnalytics?.totalRevenue || 0)}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1">Revenue</p>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="border-none shadow-sm rounded-3xl p-6 bg-white border border-sky-100/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <ShoppingCart size={20} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</p>
                </div>
                <p className="text-4xl font-black text-slate-900">{opticalAnalytics?.conversionRate || 0}%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Completion Rate</p>
                <Button className="w-full mt-6 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl border-none font-bold text-xs h-12" onClick={() => window.location.href = "/clinic/optical"}>
                  Detailed Inventory
                </Button>
              </Card>
            </div>
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && (
          <Card className="border-none shadow-sm rounded-3xl p-0 overflow-hidden bg-white">
            <CardHeader className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-50">
              <CardTitle className="text-base sm:text-lg">Staff Performance KPIs</CardTitle>
              <p className="text-[10px] sm:text-sm text-slate-500">Individual productivity and appointment completion metrics.</p>
            </CardHeader>
            {staffLoading ? (
              <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
            ) : staffKPIs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No staff data available</div>
            ) : (
              <>
                {/* Mobile card list */}
                <div className="md:hidden divide-y divide-slate-100">
                  {staffKPIs.map((p) => (
                    <div key={p.id} className="p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                        <Badge variant="secondary" className="text-[10px]">{p.role}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase">Appointments</p>
                          <p className="font-black text-slate-700 text-sm">{p.totalAppointments}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase">Completed</p>
                          <p className="font-bold text-emerald-600 text-sm">{p.completedAppointments}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase">Rate</p>
                          <p className="font-bold text-slate-500 text-sm">{p.completionRate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Practitioner</TableHead>
                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</TableHead>
                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointments</TableHead>
                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</TableHead>
                        <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staffKPIs.map((p) => (
                        <TableRow key={p.id} className="hover:bg-slate-50/50 border-slate-50">
                          <TableCell className="px-8 py-5 font-bold text-slate-900">{p.name}</TableCell>
                          <TableCell className="py-5"><Badge variant="secondary" className="text-[10px]">{p.role}</Badge></TableCell>
                          <TableCell className="py-5 font-black text-slate-700">{p.totalAppointments}</TableCell>
                          <TableCell className="py-5 font-bold text-emerald-600">{p.completedAppointments}</TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full", p.completionRate >= 80 ? "bg-emerald-500" : p.completionRate >= 50 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${p.completionRate}%` }} />
                              </div>
                              <span className="text-xs font-bold">{p.completionRate}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
