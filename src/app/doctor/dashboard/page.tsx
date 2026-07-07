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
    <div className="space-y-8">
      <PageHeader
        title="Doctor Dashboard"
        description="Welcome back, Dr. Bello. Here is an overview of your patients and schedule for today."
        actions={[
          { label: "View Queue", href: "/doctor/queue", variant: "primary" },
          { label: "My Appointments", href: "/doctor/appointments" },
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Patients Today</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{doctorPerformanceStats.patientsSeenToday}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <Users size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Consult Time</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{doctorPerformanceStats.avgConsultationTime}</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 text-sky-700">
              <Clock size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Satisfaction Rate</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{doctorPerformanceStats.patientSatisfaction}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <TrendingUp size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Reports</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{doctorPerformanceStats.pendingReports}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700">
              <ClipboardList size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Waiting Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Consultation Queue</CardTitle>
            <Link href="/doctor/queue" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              Full Queue
            </Link>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Today&apos;s Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Consultations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Consultations</CardTitle>
            <Link href="/doctor/records" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              All Records
            </Link>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Follow-ups Due */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
