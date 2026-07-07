"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users, Heart, Activity, ClipboardList, AlertTriangle,
  Calendar, CheckCircle2, Thermometer, Eye, ArrowRight
} from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseStore } from "@/app/nurse/_mock/nurse-store";

function statusBadge(status: string) {
  if (status === "Urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (status === "Under Observation") return <Badge className="bg-amber-600 text-white">Under Observation</Badge>;
  if (status === "Waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (status === "Completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (status === "High") return <Badge className="bg-rose-600 text-white">High</Badge>;
  if (status === "Medium") return <Badge className="bg-amber-600 text-white">Medium</Badge>;
  if (status === "Low") return <Badge variant="secondary">Low</Badge>;
  if (status === "Open") return <Badge className="bg-sky-600 text-white">Open</Badge>;
  if (status === "Acknowledged") return <Badge className="bg-amber-600 text-white">Acknowledged</Badge>;
  if (status === "Resolved") return <Badge className="bg-emerald-600 text-white">Resolved</Badge>;
  if (status === "Pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "Normal") return <Badge className="bg-sky-600 text-white">Normal</Badge>;
  if (status === "Missed") return <Badge className="bg-rose-600 text-white">Missed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function NurseDashboard() {
  const assignedPatients = useNurseStore((s) => s.assignedPatients);
  const pendingVitals = useNurseStore((s) => s.pendingVitals);
  const monitoringAlerts = useNurseStore((s) => s.monitoringAlerts);
  const observationNotes = useNurseStore((s) => s.observationNotes);
  const followUps = useNurseStore((s) => s.followUps);

  const waitingPatients = assignedPatients.filter((p) => p.status === "Waiting");
  const underObservation = assignedPatients.filter((p) => p.status === "Under Observation");
  const completed = assignedPatients.filter((p) => p.status === "Completed");
  const openAlerts = monitoringAlerts.filter((a) => a.status === "Open");
  const pendingFollowUps = followUps.filter((f) => f.status === "Pending");

  const stats = {
    assignedToday: assignedPatients.length,
    underObservation: underObservation.length,
    waitingForVitals: pendingVitals.length,
    activeAlerts: openAlerts.length,
    pendingFollowUps: pendingFollowUps.length,
    completedToday: completed.length,
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Nurse Dashboard"
        description="Welcome back, Nurse Okeke. Here is your patient care overview for today."
        actions={[
          { label: "Record Vitals", href: "/nurse/vitals", variant: "primary" },
          { label: "Assigned Patients", href: "/nurse/patients" },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Assigned Today</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{stats.assignedToday}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
              <Users size={18} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Under Observation</p>
              <p className="mt-1 text-xl font-bold text-amber-600">{stats.underObservation}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Heart size={18} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Waiting for Vitals</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{stats.waitingForVitals}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700">
              <Activity size={18} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Alerts</p>
              <p className="mt-1 text-xl font-bold text-rose-600">{stats.activeAlerts}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700">
              <AlertTriangle size={18} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Follow-ups</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{stats.pendingFollowUps}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-700">
              <Calendar size={18} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Completed Today</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">{stats.completedToday}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={18} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Needs Attention</CardTitle>
            <Link
              href="/nurse/patients"
              className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
            >
              All Patients
            </Link>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedPatients
                    .filter((p) => p.status !== "Completed")
                    .slice(0, 5)
                    .map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <p className="text-slate-900 whitespace-nowrap">{p.patientName}</p>
                          <p className="text-xs text-slate-400">
                            {p.age}yrs / {p.gender}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                          {p.purpose}
                        </TableCell>
                        <TableCell>{statusBadge(p.priority)}</TableCell>
                        <TableCell>{statusBadge(p.status)}</TableCell>
                        <TableCell className="text-right">
                          {p.status === "Waiting" ? (
                            <Link
                              href={`/nurse/vitals?patient=${p.patientId}`}
                              className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 transition-colors whitespace-nowrap"
                            >
                              Record Vitals
                            </Link>
                          ) : (
                            <Link
                              href={`/nurse/monitoring?patient=${p.patientId}`}
                              className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors whitespace-nowrap"
                            >
                              Monitor
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  {assignedPatients.filter((p) => p.status !== "Completed").length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-slate-500 py-6">
                        No active patients. All patients completed.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Active Alerts</CardTitle>
            <Link
              href="/nurse/monitoring"
              className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {openAlerts.slice(0, 4).map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{a.patientName}</p>
                    <p className="mt-1 text-xs text-slate-500">{a.alert}</p>
                    <p className="mt-1 text-[10px] text-slate-400 tabular-nums">{a.timestamp}</p>
                  </div>
                  <div className="shrink-0">{statusBadge(a.severity)}</div>
                </div>
                <div className="mt-3">{statusBadge(a.status)}</div>
              </div>
            ))}
            {openAlerts.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No active alerts.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Pending Vitals Entry</CardTitle>
            <Link
              href="/nurse/vitals"
              className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
            >
              Record Vitals
            </Link>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>BP</TableHead>
                    <TableHead>Temp</TableHead>
                    <TableHead>Pulse</TableHead>
                    <TableHead>Vision</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVitals.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                        {v.patientName}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        <span className="inline-flex items-center gap-1 text-slate-400 whitespace-nowrap">
                          <Thermometer size={14} className="text-slate-300" />
                          {v.bloodPressure}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400">{v.temperature}</TableCell>
                      <TableCell className="text-slate-400">{v.pulse}</TableCell>
                      <TableCell className="text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Eye size={14} className="text-slate-300" />
                          {v.visionMeasurement}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/nurse/vitals?patient=${v.patientId}`}
                          className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 transition-colors whitespace-nowrap"
                        >
                          Enter
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingVitals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-slate-500 py-6">
                        All vitals recorded. Good job!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Follow-ups Due</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingFollowUps.slice(0, 3).map((f) => (
                <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{f.patientName}</p>
                  <p className="mt-1 text-xs text-slate-500">{f.reason}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                      Due: {f.dueDate}
                    </span>
                    <span>{statusBadge(f.status)}</span>
                  </div>
                </div>
              ))}
              {pendingFollowUps.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No pending follow-ups.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Observations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {observationNotes.slice(0, 2).map((o) => (
                <div key={o.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-900 text-sm">{o.patientName}</p>
                    <span className="text-[10px] font-medium text-slate-400">{o.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{o.note}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-[10px]">
                      {o.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
