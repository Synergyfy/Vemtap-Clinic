"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Clock, Users, ClipboardList, TrendingUp, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import {
  useDoctorTodayAppointments,
  useDoctorConsultationQueue,
  useDoctorRecentRecords,
  useDoctorFollowUps,
} from "@/hooks/useDoctorDashboard";

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (s === "in_progress" || s === "in-progress") return <Badge className="bg-amber-600 text-white">In progress</Badge>;
  if (s === "waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (s === "completed" || s === "done") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (s === "checked-in" || s === "checked_in") return <Badge className="bg-sky-600 text-white">Checked-in</Badge>;
  if (s === "scheduled") return <Badge variant="outline">Scheduled</Badge>;
  if (s === "cancelled") return <Badge className="bg-slate-200 text-slate-700">Cancelled</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function computeWaitMinutes(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.round(diff / 60000));
}

function getPatientName(patient: { firstName: string; lastName: string } | undefined): string {
  if (!patient) return "Unknown Patient";
  return `${patient.firstName} ${patient.lastName}`;
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const staffId = user?.userId || null;
  const clinicId = user?.clinicId || null;

  const { data: todayAppointments = [], isLoading: appointmentsLoading } = useDoctorTodayAppointments(staffId, clinicId);
  const { data: queueEntries = [], isLoading: queueLoading } = useDoctorConsultationQueue(clinicId);
  const { data: recentRecords = [], isLoading: recordsLoading } = useDoctorRecentRecords(staffId, clinicId);
  const { data: followUps = [], isLoading: followUpsLoading } = useDoctorFollowUps(staffId, clinicId);

  const stats = useMemo(() => {
    const completed = todayAppointments.filter((a) => a.status === "completed");
    return {
      patientsToday: todayAppointments.length,
      completedToday: completed.length,
      avgConsultationTime: todayAppointments.length > 0 ? "—" : "—",
      pendingFollowUps: followUps.length,
    };
  }, [todayAppointments, followUps]);

  return (
    <div className="space-y-4 sm:space-y-8">
      <PageHeader
        title="Doctor Dashboard"
        description="Welcome back. Here is an overview of your patients and schedule for today."
        actions={[
          { label: "View Queue", href: "/doctor/queue" },
          { label: "My Appointments", href: "/doctor/appointments" },
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500">Patients Today</p>
              <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {appointmentsLoading ? "—" : stats.patientsToday}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <Users size={20} className="sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500">Completed</p>
              <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {appointmentsLoading ? "—" : stats.completedToday}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-sky-50 text-sky-700">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500">Queue Waiting</p>
              <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {queueLoading ? "—" : queueEntries.length}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-amber-50 text-amber-700">
              <TrendingUp size={20} className="sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500">Follow-ups</p>
              <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                {followUpsLoading ? "—" : stats.pendingFollowUps}
              </p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-rose-50 text-rose-700">
              <ClipboardList size={20} className="sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-3">
        {/* Waiting Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Consultation Queue</CardTitle>
            <Link href="/doctor/queue" className="text-xs sm:text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Full Queue
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {queueEntries.slice(0, 5).map((q: any) => (
                <div key={q.id} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-medium text-slate-900 text-sm truncate">{getPatientName(q.patient)}</p>
                    <Link href={`/doctor/workspace/${q.patientId || q.patient?.id}`} className="shrink-0 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white">Attend</Link>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge(q.priority || "Normal")}
                    <span className="text-[10px] text-slate-500 tabular-nums">{computeWaitMinutes(q.createdAt)}m</span>
                    {statusBadge(q.status)}
                  </div>
                </div>
              ))}
              {queueEntries.length === 0 && !queueLoading && (
                <p className="text-sm text-slate-500 text-center py-8">No patients waiting</p>
              )}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Wait Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueEntries.slice(0, 5).map((q: any) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{getPatientName(q.patient)}</TableCell>
                      <TableCell>{statusBadge(q.priority || "Normal")}</TableCell>
                      <TableCell className="tabular-nums">{computeWaitMinutes(q.createdAt)}m</TableCell>
                      <TableCell>{statusBadge(q.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/doctor/workspace/${q.patientId || q.patient?.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                        >
                          Attend
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {queueEntries.length === 0 && !queueLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">No patients waiting</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {todayAppointments.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{getPatientName(a.patient)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {a.type} • {a.appointmentTime || "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="inline-flex items-center gap-1.5 text-slate-600">
                      <Calendar size={14} />
                      <span className="text-xs font-medium tabular-nums">{a.appointmentTime || "—"}</span>
                    </div>
                    <div className="mt-2">{statusBadge(a.status)}</div>
                  </div>
                </div>
              </div>
            ))}
            {todayAppointments.length === 0 && !appointmentsLoading && (
              <p className="text-sm text-slate-500 text-center py-4">No appointments for today.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-3">
        {/* Recent Consultations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Recent Consultations</CardTitle>
            <Link href="/doctor/records" className="text-xs sm:text-sm font-medium text-emerald-700 hover:text-emerald-800">
              All Records
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {recentRecords.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{getPatientName(c.patient)}</p>
                    <div className="flex items-center gap-1 text-emerald-600 font-medium text-[10px]">
                      <CheckCircle2 size={12} />
                      Done
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()} • {c.diagnosis || "No diagnosis"}
                  </p>
                </div>
              ))}
              {recentRecords.length === 0 && !recordsLoading && (
                <p className="text-sm text-slate-500 text-center py-8">No recent consultations</p>
              )}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecords.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-sm text-slate-500 tabular-nums">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{getPatientName(c.patient)}</TableCell>
                      <TableCell className="text-sm text-slate-600">{c.diagnosis || "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                          <CheckCircle2 size={16} />
                          Done
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentRecords.length === 0 && !recordsLoading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500">No recent consultations</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Follow-ups Due */}
        <Card>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Pending Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {followUps.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{f.patientName}</p>
                <p className="mt-1 text-xs text-slate-500">{f.reason}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                    Due: {f.dueISO}
                  </span>
                  <Link href={`/doctor/appointments`} className="text-xs font-bold text-emerald-700 hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
            {followUps.length === 0 && !followUpsLoading && (
              <p className="text-sm text-slate-500 text-center py-4">No pending follow-ups</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
