"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import {
  Users, Heart, Activity, ClipboardList, AlertTriangle,
  Calendar, CheckCircle2, Thermometer, Eye,
  Stethoscope
} from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import {
  useNurseObservationNotes,
  useNurseQueue,
  useNurseAssignedAppointments,
  useNurseFollowUps,
} from "@/hooks/useNurseDashboard";
import { cn } from "@/lib/utils";

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (s === "in_progress" || s === "under observation") return <Badge className="bg-amber-600 text-white">Under Observation</Badge>;
  if (s === "waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (s === "completed" || s === "done") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (s === "high") return <Badge className="bg-rose-600 text-white">High</Badge>;
  if (s === "medium") return <Badge className="bg-amber-600 text-white">Medium</Badge>;
  if (s === "low") return <Badge variant="secondary">Low</Badge>;
  if (s === "open") return <Badge className="bg-sky-600 text-white">Open</Badge>;
  if (s === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (s === "normal") return <Badge className="bg-sky-600 text-white">Normal</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function getPatientName(patient: { firstName: string; lastName: string } | undefined): string {
  if (!patient) return "Unknown Patient";
  return `${patient.firstName} ${patient.lastName}`;
}

function computeWaitMinutes(createdAt: string): number {
  const diff = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.round(diff / 60000));
}

export default function NurseDashboard() {
  const { user } = useAuth();
  const staffId = user?.userId || null;
  const clinicId = user?.clinicId || null;

  const { data: observationNotes = [], isLoading: notesLoading } = useNurseObservationNotes(staffId, clinicId);
  const { data: queueEntries = [], isLoading: queueLoading } = useNurseQueue(clinicId);
  const { data: assignedAppointments = [], isLoading: appointmentsLoading } = useNurseAssignedAppointments(staffId, clinicId);
  const { data: followUps = [], isLoading: followUpsLoading } = useNurseFollowUps(staffId, clinicId);

  const [statModal, setStatModal] = useState<{ label: string; value: string; desc: string } | null>(null);
  const [obsModal, setObsModal] = useState<any>(null);

  const waitingPatients = queueEntries.filter((q) => q.status === "waiting");
  const inProgressPatients = queueEntries.filter((q) => q.status === "in_progress");
  const completedToday = assignedAppointments.filter((a) => a.status === "completed");
  const pendingFollowUps = followUps.filter((f) => f.status === "scheduled");

  const stats = [
    { label: "Assigned Today", value: String(assignedAppointments.length), icon: Users, color: "text-sky-600", bg: "bg-sky-50", desc: `${assignedAppointments.length} patients assigned today. ${waitingPatients.length} waiting, ${inProgressPatients.length} in progress.` },
    { label: "In Progress", value: String(inProgressPatients.length), icon: Heart, color: "text-amber-600", bg: "bg-amber-50", desc: `${inProgressPatients.length} patients currently being processed.` },
    { label: "Waiting for Vitals", value: String(waitingPatients.length), icon: Activity, color: "text-cyan-600", bg: "bg-cyan-50", desc: `${waitingPatients.length} patients waiting for vitals recording.` },
    { label: "Queue Total", value: String(queueEntries.length), icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", desc: `${queueEntries.length} patients in the queue.` },
    { label: "Follow-ups", value: String(pendingFollowUps.length), icon: Calendar, color: "text-violet-600", bg: "bg-violet-50", desc: `${pendingFollowUps.length} follow-ups due.` },
    { label: "Completed Today", value: String(completedToday.length), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", desc: `${completedToday.length} patients completed today.` },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Nurse Dashboard"
        description="Welcome back. Here is your patient care overview for today."
        actions={[
          { label: "Record Vitals", href: "/nurse/vitals" },
          { label: "Assigned Patients", href: "/nurse/patients" },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <Card key={i} onClick={() => setStatModal(s)} className="hover:border-cyan-200 transition-all cursor-pointer group">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <p className={cn("mt-1 text-xl font-bold", s.color)}>{s.value}</p>
              </div>
              <div className={cn("p-2.5 rounded-xl", s.bg, s.color)}><s.icon size={18} /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Queue Overview</CardTitle>
            <Link href="/nurse/patients" className="text-xs sm:text-sm font-medium text-cyan-700">All Patients</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {queueEntries.slice(0, 5).map((q) => (
                <div key={q.id} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{getPatientName(q.patient)}</p>
                      <p className="text-[10px] text-slate-400">{q.station || "Unassigned"}</p>
                    </div>
                    {q.status === "waiting" ? (
                      <Link href={`/nurse/vitals?patient=${q.patientId}`} className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-bold text-white">Vitals</Link>
                    ) : (
                      <Link href={`/nurse/monitoring?patient=${q.patientId}`} className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white">Monitor</Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge(q.priority || "Normal")}
                    <span className="text-[10px] text-slate-500">{computeWaitMinutes(q.createdAt)}m</span>
                    {statusBadge(q.status)}
                  </div>
                </div>
              ))}
              {queueEntries.length === 0 && !queueLoading && (
                <p className="text-sm text-slate-500 text-center py-8">No patients in queue</p>
              )}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueEntries.slice(0, 5).map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{getPatientName(q.patient)}</TableCell>
                      <TableCell className="text-sm text-slate-600">{q.station || "Unassigned"}</TableCell>
                      <TableCell>{statusBadge(q.priority || "Normal")}</TableCell>
                      <TableCell>{statusBadge(q.status)}</TableCell>
                      <TableCell className="text-right">
                        {q.status === "waiting" ? (
                          <Link href={`/nurse/vitals?patient=${q.patientId}`} className="inline-flex justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 whitespace-nowrap">Record Vitals</Link>
                        ) : (
                          <Link href={`/nurse/monitoring?patient=${q.patientId}`} className="inline-flex justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 whitespace-nowrap">Monitor</Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {queueEntries.length === 0 && !queueLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500">No patients in queue</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Today&apos;s Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {assignedAppointments.slice(0, 4).map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate text-sm">{getPatientName(a.patient)}</p>
                    <p className="mt-1 text-xs text-slate-500">{a.type} • {a.appointmentTime || "—"}</p>
                  </div>
                  <div className="shrink-0">{statusBadge(a.status)}</div>
                </div>
              </div>
            ))}
            {assignedAppointments.length === 0 && !appointmentsLoading && (
              <p className="text-sm text-slate-500 text-center py-4">No appointments today</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Recent Observations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {observationNotes.slice(0, 4).map((o) => (
                <div key={o.id} onClick={() => setObsModal(o)} className="p-4 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{getPatientName(o.patient)}</p>
                    <span className="text-[10px] font-medium text-slate-400">{new Date(o.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{o.note}</p>
                  <div className="mt-2"><Badge variant="outline" className="text-[10px]">{o.category}</Badge></div>
                </div>
              ))}
              {observationNotes.length === 0 && !notesLoading && (
                <p className="text-sm text-slate-500 text-center py-8">No observation notes</p>
              )}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {observationNotes.slice(0, 5).map((o) => (
                    <TableRow key={o.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setObsModal(o)}>
                      <TableCell className="font-medium">{getPatientName(o.patient)}</TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">{o.note}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{o.category}</Badge></TableCell>
                      <TableCell className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleTimeString()}</TableCell>
                    </TableRow>
                  ))}
                  {observationNotes.length === 0 && !notesLoading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500">No observation notes</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:space-y-8">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg">Follow-ups Due</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {pendingFollowUps.slice(0, 3).map((f) => (
                <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900 text-sm">{getPatientName(f.patient)}</p>
                  <p className="mt-1 text-xs text-slate-500">{f.reason || "Follow-up visit"}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">Due: {f.appointmentDate}</span>
                    {statusBadge(f.status)}
                  </div>
                </div>
              ))}
              {pendingFollowUps.length === 0 && !followUpsLoading && (
                <p className="text-sm text-slate-500 text-center py-4">No pending follow-ups</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stat Detail Modal */}
      <Modal isOpen={!!statModal} onClose={() => setStatModal(null)} title={statModal?.label || ""}>
        {statModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-700"><ClipboardList size={24} /></div>
              <div>
                <p className="text-sm font-bold text-slate-500">{statModal.label}</p>
                <p className="text-3xl font-black text-slate-900">{statModal.value}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">{statModal.desc}</p>
            <div className="flex justify-end pt-2"><button onClick={() => setStatModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button></div>
          </div>
        )}
      </Modal>

      {/* Observation Detail Modal */}
      <Modal isOpen={!!obsModal} onClose={() => setObsModal(null)} title="Observation Note">
        {obsModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700"><Stethoscope size={20} /></div>
              <div>
                <p className="font-bold text-slate-900">{getPatientName(obsModal.patient)}</p>
                <Badge variant="outline" className="text-[10px] mt-1">{obsModal.category}</Badge>
              </div>
              <span className="ml-auto text-[10px] text-slate-400">{new Date(obsModal.createdAt).toLocaleString()}</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Note</p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{obsModal.note}</p>
            </div>
            <div className="flex justify-end pt-2"><button onClick={() => setObsModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
