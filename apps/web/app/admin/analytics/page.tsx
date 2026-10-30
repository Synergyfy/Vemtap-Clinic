"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, TrendingDown, Users, 
  Building2, Activity, Calendar, Download,
  PieChart, Clock, ArrowUpRight, ArrowDownRight, 
  Loader2, Wallet, ShoppingBag, CheckCircle2,
  AlertCircle, ChevronDown, Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlatformOverview, useClinics } from "@/hooks/useClinics";
import {
  useRevenueSummary,
  useStaffKPIs,
  useQueueAnalytics,
  useAppointmentTrends,
  useOpticalAnalytics,
} from "@/hooks/useAnalytics";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

const MONTHS_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function PlatformAnalyticsPage() {
  const { data: overview, isLoading: loadingOverview } = usePlatformOverview();
  const { data: clinics = [], isLoading: loadingClinics } = useClinics();

  // Selected clinic state for detailed analytics (defaults to first clinic or empty)
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");

  // Sync default clinic once clinics are loaded
  const activeClinicId = useMemo(() => {
    if (selectedClinicId) return selectedClinicId;
    return clinics[0]?.id || "";
  }, [selectedClinicId, clinics]);

  const selectedClinic = useMemo(() => {
    return clinics.find((c) => c.id === activeClinicId) || clinics[0];
  }, [clinics, activeClinicId]);

  // Live analytics hooks for the active clinic
  const { data: revenue, isLoading: loadingRevenue } = useRevenueSummary(activeClinicId);
  const { data: staffKPIs = [], isLoading: loadingStaff } = useStaffKPIs(activeClinicId);
  const { data: queueAnalytics, isLoading: loadingQueue } = useQueueAnalytics(activeClinicId);
  const { data: appointmentTrends = {}, isLoading: loadingTrends } = useAppointmentTrends(activeClinicId);
  const { data: optical, isLoading: loadingOptical } = useOpticalAnalytics(activeClinicId);

  // Computed Monthly Revenue & Expense series from live API
  const monthlyChartData = useMemo(() => {
    const revMap = revenue?.monthlyRevenue || {};
    const expMap = revenue?.monthlyExpenses || {};
    
    // Find active months present in either map, or default to current year-to-date
    const activeMonths = Array.from(new Set([...Object.keys(revMap), ...Object.keys(expMap)]));
    const sortedMonths = activeMonths.length > 0 
      ? activeMonths.sort((a, b) => MONTHS_ORDER.indexOf(a) - MONTHS_ORDER.indexOf(b))
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    const maxVal = Math.max(
      ...sortedMonths.map((m) => Math.max(revMap[m] || 0, expMap[m] || 0)),
      1
    );

    return sortedMonths.map((month) => {
      const rev = revMap[month] || 0;
      const exp = expMap[month] || 0;
      return {
        month,
        revenue: rev,
        expenses: exp,
        revenuePct: Math.min(100, Math.round((rev / maxVal) * 100)),
        expensePct: Math.min(100, Math.round((exp / maxVal) * 100)),
      };
    });
  }, [revenue]);

  // Computed Appointment Trends series
  const appointmentTrendData = useMemo(() => {
    const months = Object.keys(appointmentTrends);
    if (months.length === 0) return [];
    return months.sort((a, b) => MONTHS_ORDER.indexOf(a) - MONTHS_ORDER.indexOf(b)).map((month) => ({
      month,
      ...appointmentTrends[month],
    }));
  }, [appointmentTrends]);

  return (
    <div className="space-y-8">
      {/* Header & Clinic Selector */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Clinic &amp; Platform Analytics</h1>
          <p className="mt-1 text-slate-500 font-medium">Live financial performance, staff KPIs, queue throughput, and optical sales.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end md:w-auto">
          {/* Clinic Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Clinic Node:</label>
            <div className="relative">
              <select
                value={activeClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 py-1.5 pr-8 text-xs font-bold text-brand-navy shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.city ? `(${c.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Clinic Banner Info */}
      {selectedClinic && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white shadow-sm">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-brand-navy">{selectedClinic.name}</p>
              <p className="text-xs text-slate-500">{selectedClinic.address || "Main Branch"} • {selectedClinic.email || "Node Active"}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Node
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Invoices</p>
              <p className="text-xs font-black text-brand-navy">{revenue?.invoiceCount ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Payments</p>
              <p className="text-xs font-black text-brand-navy">{revenue?.paymentCount ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue Collected</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-navy">
            {loadingRevenue ? <Loader2 size={20} className="animate-spin text-slate-400" /> : formatNGN(revenue?.totalPaid ?? 0)}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            From {revenue?.paymentCount ?? 0} confirmed payments
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Profit</span>
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", (revenue?.netProfit ?? 0) >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
              <Wallet size={16} />
            </div>
          </div>
          <p className={cn("text-2xl font-black", (revenue?.netProfit ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {loadingRevenue ? <Loader2 size={20} className="animate-spin text-slate-400" /> : formatNGN(revenue?.netProfit ?? 0)}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Collected minus {formatNGN(revenue?.totalExpenses ?? 0)} expenses
          </p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Outstanding</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">
            {loadingRevenue ? <Loader2 size={20} className="animate-spin text-slate-400" /> : formatNGN(revenue?.outstanding ?? 0)}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Unpaid invoice balances
          </p>
        </div>

        {/* Optical Sales & Conversion */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Optical Sales</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-brand-navy">
            {loadingOptical ? <Loader2 size={20} className="animate-spin text-slate-400" /> : formatNGN(optical?.totalRevenue ?? 0)}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            {optical?.completed ?? 0} of {optical?.totalSales ?? 0} orders ({optical?.conversionRate ?? 0}% conv.)
          </p>
        </div>
      </div>

      {/* Revenue & Expenses Monthly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-brand-navy sm:text-xl">Monthly Financial Trajectory</h2>
              <p className="text-xs text-slate-500">Live comparison of collections vs recorded clinic expenses</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-brand-blue rounded-sm" />
                <span className="text-[10px] font-bold text-slate-500">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-rose-400 rounded-sm" />
                <span className="text-[10px] font-bold text-slate-500">Expenses</span>
              </div>
            </div>
          </div>

          {loadingRevenue ? (
            <div className="flex h-56 items-center justify-center text-slate-400">
              <Loader2 className="animate-spin text-brand-blue mr-2" size={20} /> Loading live financial records...
            </div>
          ) : monthlyChartData.length === 0 ? (
            <div className="flex h-56 flex-col items-center justify-center text-slate-400 text-xs">
              <BarChart3 size={32} className="mb-2 text-slate-300" />
              No financial records recorded for this clinic yet.
            </div>
          ) : (
            <div className="relative flex h-56 w-full items-end gap-3 px-2 sm:px-4 pt-4 border-b border-slate-100">
              {monthlyChartData.map((d, i) => (
                <div key={d.month} className="flex-1 flex flex-col items-center h-full justify-end group/bar">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity text-[9px] bg-brand-navy text-white px-1.5 py-0.5 rounded shadow pointer-events-none mb-1 text-center whitespace-nowrap">
                    Rev: {formatNGN(d.revenue)}<br />Exp: {formatNGN(d.expenses)}
                  </div>
                  <div className="w-full flex items-end justify-center gap-1 h-4/5">
                    {/* Revenue Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(d.revenuePct, 4)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="w-1/2 max-w-[18px] bg-brand-blue rounded-t-sm group-hover/bar:bg-blue-600 transition-colors"
                    />
                    {/* Expense Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(d.expensePct, 4)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 + 0.1 }}
                      className="w-1/2 max-w-[18px] bg-rose-400 rounded-t-sm group-hover/bar:bg-rose-500 transition-colors"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase">{d.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Queue Throughput Card */}
        <div className="bg-brand-navy p-6 sm:p-8 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Queue Throughput</h3>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-xs text-slate-300 mb-6">Real-time patient flow across clinical stations</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-amber-300 uppercase tracking-widest font-black">Waiting</p>
                <p className="text-2xl font-black mt-1 text-white">{queueAnalytics?.waiting ?? 0}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-blue-300 uppercase tracking-widest font-black">In Progress</p>
                <p className="text-2xl font-black mt-1 text-white">{queueAnalytics?.inProgress ?? 0}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-black">Completed</p>
                <p className="text-2xl font-black mt-1 text-white">{queueAnalytics?.completed ?? 0}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Total Today</p>
                <p className="text-2xl font-black mt-1 text-white">{queueAnalytics?.total ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Station breakdown */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Patients by Station</p>
            {queueAnalytics?.byStation && Object.keys(queueAnalytics.byStation).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(queueAnalytics.byStation).map(([station, count]) => (
                  <span key={station} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 text-[11px] font-bold capitalize">
                    {station}: <strong className="text-white">{count}</strong>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active queue entries today.</p>
            )}
          </div>
        </div>
      </div>

      {/* Staff KPIs & Appointment Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Staff KPIs Table */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-navy">Staff Performance KPIs</h3>
              <p className="text-xs text-slate-500">Live appointment completion rates per practitioner</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{staffKPIs.length} Staff</span>
          </div>

          {loadingStaff ? (
            <div className="text-center py-8 text-slate-400">
              <Loader2 size={20} className="animate-spin mx-auto text-brand-blue mb-2" />
              Loading staff metrics...
            </div>
          ) : staffKPIs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No staff KPI data available for this clinic.</p>
          ) : (
            <div className="space-y-3">
              {staffKPIs.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs">
                      {s.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-navy">{s.name}</h4>
                      <p className="text-[10px] text-slate-400 capitalize">{s.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs font-black text-brand-navy">{s.completedAppointments} / {s.totalAppointments}</p>
                      <p className="text-[9px] text-slate-400">Completed</p>
                    </div>
                    <div className="w-12 text-center">
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-md",
                        s.completionRate >= 80 ? "bg-emerald-100 text-emerald-700" :
                        s.completionRate >= 50 ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"
                      )}>
                        {s.completionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointment Trends */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-brand-navy">Appointment Trends</h3>
              <p className="text-xs text-slate-500">Live booking outcomes &amp; attendance trends</p>
            </div>
            <Calendar size={18} className="text-slate-400" />
          </div>

          {loadingTrends ? (
            <div className="text-center py-8 text-slate-400">
              <Loader2 size={20} className="animate-spin mx-auto text-brand-blue mb-2" />
              Loading appointment trends...
            </div>
          ) : appointmentTrendData.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Calendar size={28} className="mx-auto mb-2 text-slate-300" />
              No appointment booking records found for this clinic.
            </div>
          ) : (
            <div className="space-y-4">
              {appointmentTrendData.map((t) => {
                const total = t.booked || 1;
                const completedPct = Math.round(((t.completed || 0) / total) * 100);
                const missedPct = Math.round(((t.missed || 0) / total) * 100);

                return (
                  <div key={t.month} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-navy uppercase">{t.month}</span>
                      <div className="flex items-center gap-3 text-[10px] font-bold">
                        <span className="text-slate-500">Booked: {t.booked}</span>
                        <span className="text-emerald-600">Completed: {t.completed}</span>
                        <span className="text-rose-500">Missed: {t.missed}</span>
                      </div>
                    </div>
                    {/* Progress distribution bar */}
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                      <div style={{ width: `${completedPct}%` }} className="bg-emerald-500 h-full" title={`Completed: ${completedPct}%`} />
                      <div style={{ width: `${missedPct}%` }} className="bg-rose-400 h-full" title={`Missed: ${missedPct}%`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
