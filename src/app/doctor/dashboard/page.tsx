import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Users, ClipboardList, TrendingUp, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import {
  doctorWaitingPatients,
  doctorTodayAppointments,
  doctorFollowUpsDue,
  doctorPerformanceStats,
  doctorRecentConsultations,
} from "@/app/doctor/_mock/doctor-data";

function statusBadge(status: string) {
  if (status === "Urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (status === "In-service") return <Badge className="bg-amber-600 text-white">In service</Badge>;
  if (status === "Waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (status === "Done") return <Badge className="bg-emerald-600 text-white">Done</Badge>;
  if (status === "Checked-in") return <Badge className="bg-sky-600 text-white">Checked-in</Badge>;
  if (status === "Scheduled") return <Badge variant="outline">Scheduled</Badge>;
  if (status === "Completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function DoctorDashboard() {
  return (
    <div className="space-y-4 sm:space-y-8">
      <PageHeader
        title="Doctor Dashboard"
        description="Welcome back, Dr. Bello. Here is an overview of your patients and schedule for today."
        actions={[
          { label: "View Queue", href: "/doctor/queue", variant: "primary" },
          { label: "My Appointments", href: "/doctor/appointments" },
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500">Patients Today</p>
              <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">{doctorPerformanceStats.patientsSeenToday}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <Users size={20} className="sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500">Avg. Consult</p>
              <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">{doctorPerformanceStats.avgConsultationTime}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-sky-50 text-sky-700">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500">Satisfaction</p>
              <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">{doctorPerformanceStats.patientSatisfaction}</p>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-amber-50 text-amber-700">
              <TrendingUp size={20} className="sm:w-6 sm:h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500">Pending</p>
              <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-slate-900">{doctorPerformanceStats.pendingReports}</p>
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
            {/* Mobile: card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {doctorWaitingPatients.map((q) => (
                <div key={q.id} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-medium text-slate-900 text-sm truncate">{q.patientName}</p>
                    <Link href={`/doctor/workspace/${q.patientId}`} className="shrink-0 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white">Attend</Link>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge(q.priority)}
                    <span className="text-[10px] text-slate-500 tabular-nums">{q.waitMinutes}m</span>
                    {statusBadge(q.status)}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop: full table */}
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
                {doctorWaitingPatients.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.patientName}</TableCell>
                    <TableCell>{statusBadge(q.priority)}</TableCell>
                    <TableCell className="tabular-nums">{q.waitMinutes}m</TableCell>
                    <TableCell>{statusBadge(q.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link 
                        href={`/doctor/workspace/${q.patientId}`}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                      >
                        Attend
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
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
            {doctorTodayAppointments.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{a.patientName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {a.service} • {a.kind}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="inline-flex items-center gap-1.5 text-slate-600">
                      <Calendar size={14} />
                      <span className="text-xs font-medium tabular-nums">{a.startTime}</span>
                    </div>
                    <div className="mt-2">{statusBadge(a.status)}</div>
                  </div>
                </div>
              </div>
            ))}
            {doctorTodayAppointments.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No more appointments for today.</p>
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
            {/* Mobile: card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {doctorRecentConsultations.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{c.patientName}</p>
                    <div className="flex items-center gap-1 text-emerald-600 font-medium text-[10px]">
                      <CheckCircle2 size={12} />
                      {c.status}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">{c.date} • {c.diagnosis}</p>
                </div>
              ))}
            </div>
            {/* Desktop: full table */}
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
                {doctorRecentConsultations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm text-slate-500 tabular-nums">{c.date}</TableCell>
                    <TableCell className="font-medium text-slate-900">{c.patientName}</TableCell>
                    <TableCell className="text-sm text-slate-600">{c.diagnosis}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                        <CheckCircle2 size={16} />
                        {c.status}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
            {doctorFollowUpsDue.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{f.patientName}</p>
                <p className="mt-1 text-xs text-slate-500">{f.reason}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                    Due: {f.dueISO}
                  </span>
                  <Link href={`/doctor/workspace/${f.id}`} className="text-xs font-bold text-emerald-700 hover:underline">
                    Prepare
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
