"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Calendar, Clock, DollarSign, Eye, Users } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import {
  useDashboardOverview,
  useDashboardRevenue,
  useDashboardHMOAnalytics,
} from "@/hooks/useDashboard";
import { useQueue } from "@/hooks/useQueue";
import { useStaff } from "@/hooks/useStaff";

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (s === "in_progress" || s === "in-progress" || s === "in-progress") return <Badge className="bg-amber-600 text-white">In progress</Badge>;
  if (s === "waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (s === "completed" || s === "done") return <Badge className="bg-emerald-600 text-white">Done</Badge>;
  if (s === "checked-in" || s === "checked_in") return <Badge className="bg-sky-600 text-white">Checked-in</Badge>;
  if (s === "scheduled") return <Badge variant="outline">Scheduled</Badge>;
  if (s === "cancelled") return <Badge className="bg-slate-200 text-slate-700">Cancelled</Badge>;
  if (s === "in_production" || s === "in production") return <Badge className="bg-amber-600 text-white">In production</Badge>;
  if (s === "ready") return <Badge className="bg-emerald-600 text-white">Ready</Badge>;
  if (s === "dispensed") return <Badge className="bg-slate-200 text-slate-700">Dispensed</Badge>;
  if (s === "on_duty" || s === "on duty") return <Badge className="bg-emerald-600 text-white">On duty</Badge>;
  if (s === "break") return <Badge className="bg-amber-600 text-white">Break</Badge>;
  if (s === "off_duty" || s === "off duty") return <Badge className="bg-slate-200 text-slate-700">Off duty</Badge>;
  if (s === "submitted") return <Badge className="bg-sky-600 text-white">Submitted</Badge>;
  if (s === "approved") return <Badge className="bg-emerald-600 text-white">Approved</Badge>;
  if (s === "settled") return <Badge className="bg-emerald-600 text-white">Settled</Badge>;
  if (s === "denied" || s === "rejected") return <Badge className="bg-rose-600 text-white">Rejected</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function formatNGN(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function computeWaitMinutes(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.round(diff / 60000));
}

function getPatientName(patient: { firstName: string; lastName: string } | undefined): string {
  if (!patient) return "Unknown Patient";
  return `${patient.firstName} ${patient.lastName}`;
}

export default function ClinicDashboard() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || null;

  const todayISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());

  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  }, []);

  const { data: overview, isLoading: overviewLoading } = useDashboardOverview(clinicId);
  const { data: revenueData } = useDashboardRevenue(clinicId, sevenDaysAgo, todayISO);
  const { data: hmoAnalytics } = useDashboardHMOAnalytics(clinicId);
  const { data: queueResponse } = useQueue({ clinicId: clinicId || undefined, limit: 10 });
  const { data: staffResponse } = useStaff({ clinicId: clinicId || undefined, isActive: true, limit: 10 });

  const queueEntries = queueResponse?.data || [];
  const staffList = staffResponse?.data || [];

  const maxRevenue = useMemo(() => {
    if (!revenueData || revenueData.length === 0) return 1;
    return Math.max(...revenueData.map((r) => r.collected || 0), 1);
  }, [revenueData]);

  const totalRevenueCollected = useMemo(() => {
    if (!revenueData) return 0;
    return revenueData.reduce((sum, r) => sum + (r.collected || 0), 0);
  }, [revenueData]);

  const totalRevenueOutstanding = overview?.revenue?.outstanding || 0;

  const hmoSubmittedClaims = useMemo(() => {
    if (!hmoAnalytics?.byStatus) return 0;
    return hmoAnalytics.byStatus.reduce((sum, s) => sum + Number(s.count || 0), 0);
  }, [hmoAnalytics]);

  const hmoPendingClaims = overview?.hmo?.pendingClaims || 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clinic Dashboard"
        description="Operational overview for today: patients, queue, appointments, revenue, HMO, staff, and alerts."
        actions={[
          { label: "Register patient", href: "/clinic/patients", variant: "default" },
          { label: "Create appointment", href: "/clinic/appointments" },
          { label: "Verify HMO", href: "/clinic/hmo" },
          { label: "Create invoice", href: "/clinic/finance" },
        ]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm font-medium text-slate-500">Today&apos;s patients</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {overviewLoading ? "—" : overview?.patients?.total ?? 0}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-slate-100 text-sky-700 shrink-0">
              <Users size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm font-medium text-slate-500">Active queue</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {overviewLoading ? "—" : (overview?.queue?.waiting ?? 0) + (overview?.queue?.inProgress ?? 0)}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-slate-100 text-amber-700 shrink-0">
              <Clock size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm font-medium text-slate-500">Revenue (today)</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums truncate">
                {overviewLoading ? "—" : formatNGN(overview?.revenue?.today ?? 0)}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-slate-100 text-emerald-700 shrink-0">
              <DollarSign size={20} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] sm:text-sm font-medium text-slate-500">Staff on duty</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
                {overviewLoading ? "—" : overview?.staff?.onDuty ?? 0}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-slate-100 text-purple-700 shrink-0">
              <Eye size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Overview + Staff */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Queue overview</CardTitle>
            <Link href="/clinic/queue" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Manage queue
            </Link>
          </CardHeader>
          <CardContent>
            <div className="md:hidden space-y-2">
              {queueEntries.slice(0, 4).map((q) => (
                <div key={q.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{getPatientName(q.patient)}</p>
                    <p className="text-xs text-slate-500 truncate">{q.station || "Unassigned"}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[10px] font-medium text-slate-400 tabular-nums">{computeWaitMinutes(q.createdAt)}m</span>
                    {statusBadge(q.priority || "Normal")}
                    {statusBadge(q.status)}
                  </div>
                </div>
              ))}
              {queueEntries.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No patients in queue</p>
              )}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Wait</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueEntries.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{getPatientName(q.patient)}</TableCell>
                      <TableCell>{q.station || "Unassigned"}</TableCell>
                      <TableCell>{statusBadge(q.priority || "Normal")}</TableCell>
                      <TableCell className="tabular-nums">{computeWaitMinutes(q.createdAt)}m</TableCell>
                      <TableCell>{statusBadge(q.status)}</TableCell>
                    </TableRow>
                  ))}
                  {queueEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-400">No patients in queue</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Staff on duty</CardTitle>
            <Link href="/clinic/staff" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Manage staff
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {staffList.slice(0, 7).map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{s.firstName} {s.lastName}</p>
                    <p className="mt-0.5 text-sm text-slate-500 truncate">{s.role}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="mt-2">{statusBadge(s.isActive ? "On duty" : "Off duty")}</div>
                  </div>
                </div>
              </div>
            ))}
            {staffList.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No staff on duty</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Alerts</CardTitle>
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/clinic/queue" className="text-sm font-medium text-sky-700 hover:text-sky-800">Queue</Link>
            <Link href="/clinic/pharmacy" className="text-sm font-medium text-sky-700 hover:text-sky-800">Pharmacy</Link>
            <Link href="/clinic/hmo" className="text-sm font-medium text-sky-700 hover:text-sky-800">HMO</Link>
            <Link href="/clinic/finance" className="text-sm font-medium text-sky-700 hover:text-sky-800">Billing</Link>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Pharmacy stock</p>
            <p className="mt-1 text-sm text-slate-500">{overview?.pharmacy?.lowStock ?? 0} item(s) low stock</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">HMO claims</p>
            <p className="mt-1 text-sm text-slate-500">{hmoPendingClaims} pending claim(s)</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Revenue outstanding</p>
            <p className="mt-1 text-sm text-slate-500">{formatNGN(totalRevenueOutstanding)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Queue waiting</p>
            <p className="mt-1 text-sm text-slate-500">{overview?.queue?.waiting ?? 0} patient(s) waiting</p>
          </div>
        </CardContent>
      </Card>

      {/* Revenue + HMO */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Revenue summary</CardTitle>
            <Link href="/clinic/finance" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Open finance
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Revenue trend (last 7 days)</p>
            <div className="mt-4 grid grid-cols-7 gap-3 items-end">
              {(revenueData || []).map((r) => {
                const dayLabel = new Date(r.date).toLocaleDateString("en", { weekday: "short" });
                const height = Math.max(10, Math.round(((r.collected || 0) / maxRevenue) * 100));
                return (
                  <div key={r.date} className="flex flex-col items-center gap-2">
                    <div
                      className={cn("w-full rounded-lg bg-sky-600/20 border border-sky-600/20", "relative overflow-hidden")}
                      style={{ height: 140 }}
                      title={formatNGN(r.collected || 0)}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-sky-600" style={{ height: `${height}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">{dayLabel}</p>
                  </div>
                );
              })}
              {(!revenueData || revenueData.length === 0) && (
                <p className="col-span-7 text-sm text-slate-400 text-center py-8">No revenue data available</p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Collected (7d)</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{formatNGN(totalRevenueCollected)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Outstanding</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{formatNGN(totalRevenueOutstanding)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Today&apos;s revenue</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{formatNGN(overview?.revenue?.today ?? 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HMO analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Total claims</p>
                  <p className="mt-1 text-sm text-slate-500">{hmoSubmittedClaims} claim(s) submitted</p>
                </div>
              </div>
            </div>

            {hmoAnalytics?.byStatus && hmoAnalytics.byStatus.length > 0 && (
              <div className="space-y-2">
                {hmoAnalytics.byStatus.map((s) => (
                  <div key={s.status} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      {statusBadge(s.status)}
                      <span className="text-xs text-slate-500">{s.count} claim(s)</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 tabular-nums">
                      {formatNGN(Number(s.totalClaimed || 0))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Pending claims</p>
              <p className="mt-1 text-sm text-slate-500">{hmoPendingClaims} claim(s) need attention</p>
              <div className="mt-3">
                <Link href="/clinic/hmo" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                  Review claims
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
