"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import {
  useDashboardOverview,
  useDashboardRevenue,
  useDashboardAppointmentAnalytics,
  useDashboardHMOAnalytics,
} from "@/hooks/useDashboard";
import { useQueue } from "@/hooks/useQueue";
import { useStaff } from "@/hooks/useStaff";
import {
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Users,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity,
  FileText,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  Filter,
  Check,
  XCircle,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";

function statusBadge(status: string) {
  const s = status?.toLowerCase() || "";
  if (s === "urgent") return <Badge className="bg-rose-600 text-white font-bold">Urgent</Badge>;
  if (s === "in_progress" || s === "in-progress") return <Badge className="bg-amber-600 text-white font-bold">In progress</Badge>;
  if (s === "waiting") return <Badge variant="secondary" className="font-bold">Waiting</Badge>;
  if (s === "completed" || s === "done") return <Badge className="bg-emerald-600 text-white font-bold">Done</Badge>;
  if (s === "checked-in" || s === "checked_in") return <Badge className="bg-sky-600 text-white font-bold">Checked-in</Badge>;
  if (s === "scheduled") return <Badge variant="outline" className="font-bold">Scheduled</Badge>;
  if (s === "cancelled") return <Badge className="bg-slate-200 text-slate-700 font-bold">Cancelled</Badge>;
  if (s === "no_show" || s === "no-show") return <Badge className="bg-rose-100 text-rose-800 font-bold">No-show</Badge>;
  if (s === "submitted") return <Badge className="bg-sky-600 text-white font-bold">Submitted</Badge>;
  if (s === "approved") return <Badge className="bg-emerald-600 text-white font-bold">Approved</Badge>;
  if (s === "settled") return <Badge className="bg-emerald-700 text-white font-bold">Settled</Badge>;
  if (s === "denied" || s === "rejected") return <Badge className="bg-rose-600 text-white font-bold">Rejected</Badge>;
  return <Badge variant="outline" className="font-bold">{status}</Badge>;
}

function formatNGN(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value || 0);
}

function computeWaitMinutes(createdAt: string): number {
  if (!createdAt) return 0;
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.round(diff / 60000));
}

function getPatientName(patient: { firstName: string; lastName: string } | undefined): string {
  if (!patient) return "Unknown Patient";
  return `${patient.firstName} ${patient.lastName}`;
}

type DatePreset = "7d" | "14d" | "30d" | "90d" | "custom";

export default function ClinicDashboard() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || null;

  // Date Range Filter
  const [datePreset, setDatePreset] = useState<DatePreset>("7d");
  const todayISO = useMemo(() => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date()), []);
  
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [customEndDate, setCustomEndDate] = useState(todayISO);

  const { startDate, endDate } = useMemo(() => {
    if (datePreset === "custom") {
      return { startDate: customStartDate, endDate: customEndDate };
    }
    const days = datePreset === "7d" ? 7 : datePreset === "14d" ? 14 : datePreset === "30d" ? 30 : 90;
    const d = new Date();
    d.setDate(d.getDate() - days);
    return { startDate: d.toISOString().split("T")[0], endDate: todayISO };
  }, [datePreset, customStartDate, customEndDate, todayISO]);

  // All 4 Dashboard API hooks
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview, isFetching: fetchingOverview } = useDashboardOverview(clinicId);
  const { data: revenueData = [], isLoading: revenueLoading, refetch: refetchRevenue, isFetching: fetchingRevenue } = useDashboardRevenue(clinicId, startDate, endDate);
  const { data: appointmentAnalytics, isLoading: aptLoading, refetch: refetchAppointments, isFetching: fetchingAppointments } = useDashboardAppointmentAnalytics(clinicId, startDate, endDate);
  const { data: hmoAnalytics, isLoading: hmoLoading, refetch: refetchHmo, isFetching: fetchingHmo } = useDashboardHMOAnalytics(clinicId);

  // Queue & Staff
  const { data: queueResponse } = useQueue({ clinicId: clinicId || undefined, limit: 8 });
  const { data: staffResponse } = useStaff({ clinicId: clinicId || undefined, isActive: true, limit: 8 });

  const queueEntries = queueResponse?.data || [];
  const staffList = staffResponse?.data || [];

  const isRefreshing = fetchingOverview || fetchingRevenue || fetchingAppointments || fetchingHmo;

  const handleRefreshAll = () => {
    refetchOverview();
    refetchRevenue();
    refetchAppointments();
    refetchHmo();
  };

  // Computations for Revenue
  const maxRevenue = useMemo(() => {
    if (!revenueData || revenueData.length === 0) return 1;
    return Math.max(...revenueData.map((r) => Math.max(r.collected || 0, r.billed || 0)), 1);
  }, [revenueData]);

  const totalRevenueCollected = useMemo(() => {
    return revenueData.reduce((sum, r) => sum + (r.collected || 0), 0);
  }, [revenueData]);

  const totalRevenueBilled = useMemo(() => {
    return revenueData.reduce((sum, r) => sum + (r.billed || 0), 0);
  }, [revenueData]);

  const collectionRate = useMemo(() => {
    if (totalRevenueBilled <= 0) return 100;
    return Math.round((totalRevenueCollected / totalRevenueBilled) * 100);
  }, [totalRevenueBilled, totalRevenueCollected]);

  const totalRevenueOutstanding = overview?.revenue?.outstanding || 0;

  // Computations for Appointments
  const totalPeriodAppointments = useMemo(() => {
    if (!appointmentAnalytics?.byStatus) return 0;
    return appointmentAnalytics.byStatus.reduce((sum, s) => sum + Number(s.count || 0), 0);
  }, [appointmentAnalytics]);

  const completedPeriodAppointments = useMemo(() => {
    const completed = appointmentAnalytics?.byStatus.find((s) => s.status?.toLowerCase() === "completed");
    return Number(completed?.count || 0);
  }, [appointmentAnalytics]);

  const appointmentCompletionRate = useMemo(() => {
    if (totalPeriodAppointments === 0) return 0;
    return Math.round((completedPeriodAppointments / totalPeriodAppointments) * 100);
  }, [totalPeriodAppointments, completedPeriodAppointments]);

  // Computations for HMO
  const hmoTotalClaims = useMemo(() => {
    if (!hmoAnalytics?.byStatus) return 0;
    return hmoAnalytics.byStatus.reduce((sum, s) => sum + Number(s.count || 0), 0);
  }, [hmoAnalytics]);

  const hmoTotalClaimedAmount = useMemo(() => {
    if (!hmoAnalytics?.byStatus) return 0;
    return hmoAnalytics.byStatus.reduce((sum, s) => sum + Number(s.totalClaimed || 0), 0);
  }, [hmoAnalytics]);

  const hmoTotalApprovedAmount = useMemo(() => {
    if (!hmoAnalytics?.byStatus) return 0;
    return hmoAnalytics.byStatus.reduce((sum, s) => sum + Number(s.totalApproved || 0), 0);
  }, [hmoAnalytics]);

  const hmoRecoveryRate = useMemo(() => {
    if (hmoTotalClaimedAmount === 0) return 0;
    return Math.round((hmoTotalApprovedAmount / hmoTotalClaimedAmount) * 100);
  }, [hmoTotalClaimedAmount, hmoTotalApprovedAmount]);

  return (
    <div className="space-y-8 pb-24">
      <PageHeader
        title="Clinic Operations & Analytics Hub"
        description="Comprehensive real-time command center: patient flow, queue throughput, appointment analytics, revenue reports, and HMO recovery."
        actions={[
          { label: "Register patient", href: "/clinic/patients", variant: "default" },
          { label: "Book appointment", href: "/clinic/appointments" },
          { label: "Verify HMO", href: "/clinic/hmo" },
          { label: "Create invoice", href: "/clinic/finance" },
        ]}
      />

      {/* Date Range Selector & Live Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter size={14} className="text-sky-600" /> Date Filter:
          </span>
          {(["7d", "14d", "30d", "90d"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setDatePreset(preset)}
              className={cn(
                "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
                datePreset === preset
                  ? "bg-sky-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Last {preset.replace("d", " Days")}
            </button>
          ))}
          <button
            onClick={() => setDatePreset("custom")}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded-xl transition-all",
              datePreset === "custom"
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            Custom Range
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {datePreset === "custom" && (
            <div className="flex items-center gap-2 text-xs font-bold">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium"
              />
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="rounded-xl font-bold text-xs gap-1.5 border-slate-200 hover:bg-slate-50 shrink-0"
          >
            <RefreshCw size={13} className={cn(isRefreshing && "animate-spin text-sky-600")} />
            {isRefreshing ? "Syncing..." : "Refresh Data"}
          </Button>
        </div>
      </div>

      {/* 1. CLINIC DASHBOARD OVERVIEW (GET /api/dashboard) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Total Patients Today */}
        <Card className="rounded-2xl shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Patients</p>
              <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">
                {overviewLoading ? "—" : overview?.patients?.total ?? 0}
              </p>
              {overview?.patients?.newToday !== undefined && (
                <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <ArrowUpRight size={13} />
                  <span>+{overview.patients.newToday} new registered</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-600 shrink-0">
              <Users size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Appointments Today */}
        <Card className="rounded-2xl shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Appointments</p>
              <p className="mt-1 text-2xl font-black text-slate-900 tabular-nums">
                {overviewLoading ? "—" : overview?.appointments?.today ?? 0}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-slate-500">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>{overview?.appointments?.completed ?? 0} completed</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
              <Calendar size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Active Queue */}
        <Card className="rounded-2xl shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Patient Queue</p>
              <p className="mt-1 text-2xl font-black text-amber-600 tabular-nums">
                {overviewLoading ? "—" : (overview?.queue?.waiting ?? 0) + (overview?.queue?.inProgress ?? 0)}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-slate-500">
                <span className="text-amber-600">{overview?.queue?.waiting ?? 0} waiting</span>
                <span>•</span>
                <span className="text-sky-600">{overview?.queue?.inProgress ?? 0} in consult</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
              <Clock size={22} />
            </div>
          </CardContent>
        </Card>

        {/* Revenue Collected Today */}
        <Card className="rounded-2xl shadow-sm border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Revenue</p>
              <p className="mt-1 text-2xl font-black text-emerald-600 tabular-nums truncate">
                {overviewLoading ? "—" : formatNGN(overview?.revenue?.today ?? 0)}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-rose-500">
                <span>{formatNGN(overview?.revenue?.outstanding ?? 0)} unbilled/bal</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <DollarSign size={22} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. REVENUE REPORT BY DATE RANGE (GET /api/dashboard/revenue) */}
      <Card className="rounded-2xl shadow-sm border-slate-200">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Revenue Performance ({startDate} to {endDate})
            </CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">Aggregated billing, daily collections, and outstanding invoice balances.</p>
          </div>
          <Link href="/clinic/finance" className="text-xs font-bold text-sky-600 hover:text-sky-700 self-start sm:self-auto">
            View Financial Ledger &rarr;
          </Link>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Revenue Summary KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Billed</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{formatNGN(totalRevenueBilled)}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Total Collected</span>
              <p className="text-lg font-black text-emerald-700 mt-0.5">{formatNGN(totalRevenueCollected)}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
              <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider">Outstanding Balance</span>
              <p className="text-lg font-black text-rose-700 mt-0.5">{formatNGN(totalRevenueOutstanding)}</p>
            </div>
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200">
              <span className="text-[10px] font-black text-sky-700 uppercase tracking-wider">Collection Efficiency</span>
              <p className="text-lg font-black text-sky-800 mt-0.5">{collectionRate}%</p>
            </div>
          </div>

          {/* Revenue Chart Visualizer */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Daily Trend</p>
            {revenueLoading ? (
              <div className="h-36 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                Loading revenue trend...
              </div>
            ) : revenueData.length === 0 ? (
              <div className="h-36 flex items-center justify-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No revenue transactions recorded between {startDate} and {endDate}.
              </div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="flex items-end gap-3 min-w-[500px] h-40 pt-4 px-2">
                  {revenueData.map((r) => {
                    const dateObj = new Date(r.date);
                    const label = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    const collectedHeight = Math.max(8, Math.round(((r.collected || 0) / maxRevenue) * 100));
                    const billedHeight = Math.max(8, Math.round(((r.billed || 0) / maxRevenue) * 100));
                    return (
                      <div key={r.date} className="flex-1 flex flex-col items-center gap-2 group min-w-[36px]">
                        <div className="w-full flex items-end justify-center gap-1 h-28 relative">
                          {/* Billed bar */}
                          <div
                            style={{ height: `${billedHeight}%` }}
                            className="w-1/2 bg-slate-200 rounded-t-sm group-hover:bg-slate-300 transition-all"
                            title={`Billed: ${formatNGN(r.billed)}`}
                          />
                          {/* Collected bar */}
                          <div
                            style={{ height: `${collectedHeight}%` }}
                            className="w-1/2 bg-emerald-600 rounded-t-sm group-hover:bg-emerald-500 transition-all shadow-sm"
                            title={`Collected: ${formatNGN(r.collected)}`}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 truncate w-full text-center">{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-6 mt-3 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-slate-300" />
                    <span>Invoiced / Billed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-emerald-600" />
                    <span>Cash Collected</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. APPOINTMENT ANALYTICS (GET /api/dashboard/appointments) & 4. HMO CLAIMS (GET /api/dashboard/hmo) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Analytics Card */}
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-indigo-600" />
                Appointment Analytics
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Status & service distribution for selected period ({startDate} to {endDate})</p>
            </div>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-bold">
              {appointmentCompletionRate}% Completion
            </Badge>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {aptLoading ? (
              <p className="text-xs text-slate-400 text-center py-8">Loading appointment analytics...</p>
            ) : totalPeriodAppointments === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No appointments scheduled for this date range.</p>
            ) : (
              <>
                {/* By Status */}
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Status Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {appointmentAnalytics?.byStatus.map((s) => (
                      <div key={s.status} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold capitalize text-slate-700">{s.status.replace(/_/g, " ")}</span>
                          <span className="text-sm font-black text-slate-900">{s.count}</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              s.status === "completed" ? "bg-emerald-500" :
                              s.status === "cancelled" ? "bg-rose-500" :
                              s.status === "in_progress" ? "bg-amber-500" : "bg-sky-500"
                            )}
                            style={{ width: `${Math.min(100, Math.round((Number(s.count) / totalPeriodAppointments) * 100))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Type */}
                {appointmentAnalytics?.byType && appointmentAnalytics.byType.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Service Type Mix</h4>
                    <div className="space-y-2">
                      {appointmentAnalytics.byType.map((t) => {
                        const countNum = Number(t.count || 0);
                        const pct = totalPeriodAppointments > 0 ? Math.round((countNum / totalPeriodAppointments) * 100) : 0;
                        return (
                          <div key={t.type} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                            <span className="font-bold text-slate-800 capitalize">{t.type.replace(/_/g, " ")}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-500">{pct}%</span>
                              <span className="font-black text-slate-900 tabular-nums">{countNum} visits</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* HMO Claims Analytics Card */}
        <Card className="rounded-2xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-sky-600" />
                HMO Claims Analytics
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Insurance claim status, approvals, and recovery rates</p>
            </div>
            <Link href="/clinic/hmo" className="text-xs font-bold text-sky-600 hover:text-sky-700">
              HMO Hub &rarr;
            </Link>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {hmoLoading ? (
              <p className="text-xs text-slate-400 text-center py-8">Loading HMO analytics...</p>
            ) : hmoTotalClaims === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No HMO claims recorded yet.</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Total Claims</span>
                    <p className="text-base font-black text-slate-900 mt-0.5">{hmoTotalClaims}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                    <span className="text-[10px] font-black text-sky-700 uppercase">Claimed</span>
                    <p className="text-base font-black text-sky-800 mt-0.5">{formatNGN(hmoTotalClaimedAmount)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-black text-emerald-700 uppercase">Approved</span>
                    <p className="text-base font-black text-emerald-800 mt-0.5">{formatNGN(hmoTotalApprovedAmount)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Claim Lifecycle Status</h4>
                  {hmoAnalytics?.byStatus?.map((s) => (
                    <div key={s.status} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        {statusBadge(s.status)}
                        <span className="text-slate-500 font-semibold">{s.count} claims</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 block tabular-nums">
                          {formatNGN(Number(s.totalClaimed || 0))}
                        </span>
                        {Number(s.totalApproved || 0) > 0 && (
                          <span className="text-[10px] font-bold text-emerald-600 block">
                            Appr: {formatNGN(Number(s.totalApproved))}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. CLINIC OPERATIONAL SUMMARY (Queue, Staff & Critical Alerts) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Queue Overview */}
        <Card className="lg:col-span-2 rounded-2xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold">Live Patient Queue</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Real-time patient progression across consult stations</p>
            </div>
            <Link href="/clinic/queue" className="text-xs font-bold text-sky-600 hover:text-sky-700">
              Manage Queue &rarr;
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Patient</TableHead>
                    <TableHead className="font-bold">Station</TableHead>
                    <TableHead className="font-bold">Priority</TableHead>
                    <TableHead className="font-bold">Wait Time</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueEntries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400 py-6">
                        No patients currently in queue.
                      </TableCell>
                    </TableRow>
                  ) : (
                    queueEntries.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-bold text-slate-900">{getPatientName(q.patient)}</TableCell>
                        <TableCell className="font-medium text-slate-600">{q.station || "Triage / Unassigned"}</TableCell>
                        <TableCell>{statusBadge(q.priority || "Normal")}</TableCell>
                        <TableCell className="tabular-nums font-bold text-slate-700">{computeWaitMinutes(q.createdAt)}m</TableCell>
                        <TableCell>{statusBadge(q.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Staff & Critical Alerts */}
        <div className="space-y-6">
          {/* Critical Operational Alerts */}
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Clinic Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Pharmacy Low Stock</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Drugs below threshold</p>
                </div>
                <Badge className={overview?.pharmacy?.lowStock ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}>
                  {overview?.pharmacy?.lowStock ?? 0} items
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Pending HMO Claims</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Awaiting submission/review</p>
                </div>
                <Badge className={overview?.hmo?.pendingClaims ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-700"}>
                  {overview?.hmo?.pendingClaims ?? 0} claims
                </Badge>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Queue Waiting</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Patients in waiting lounge</p>
                </div>
                <Badge className={overview?.queue?.waiting ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-700"}>
                  {overview?.queue?.waiting ?? 0} patients
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Staff on Duty */}
          <Card className="rounded-2xl shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold">Staff On Duty</CardTitle>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                {overview?.staff?.onDuty ?? staffList.length} Active
              </Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              {staffList.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No staff roster active.</p>
              ) : (
                staffList.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{s.firstName} {s.lastName}</p>
                      <p className="text-slate-400 capitalize">{s.role}</p>
                    </div>
                    <Badge className="bg-emerald-600 text-white text-[10px]">On duty</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
