"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import {
  Users, Heart, Activity, ClipboardList, AlertTriangle,
  Calendar, CheckCircle2, Thermometer, Eye, ArrowRight,
  User, Clock, Stethoscope, Pill
} from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseStore } from "@/app/nurse/_mock/nurse-store";
import { cn } from "@/lib/utils";

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
  const acknowledgeAlert = useNurseStore((s) => s.acknowledgeAlert);
  const markFollowUpDone = useNurseStore((s) => s.markFollowUpDone);

  const [statModal, setStatModal] = useState<{ label: string; value: string; desc: string } | null>(null);
  const [alertModal, setAlertModal] = useState<any>(null);
  const [followUpModal, setFollowUpModal] = useState<any>(null);
  const [obsModal, setObsModal] = useState<any>(null);
  const [toast, setToast] = useState("");

  const waitingPatients = assignedPatients.filter((p) => p.status === "Waiting");
  const underObservation = assignedPatients.filter((p) => p.status === "Under Observation");
  const completed = assignedPatients.filter((p) => p.status === "Completed");
  const openAlerts = monitoringAlerts.filter((a) => a.status === "Open");
  const pendingFollowUps = followUps.filter((f) => f.status === "Pending");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const stats = [
    { label: "Assigned Today", value: String(assignedPatients.length), icon: Users, color: "text-sky-600", bg: "bg-sky-50", desc: `${assignedPatients.length} patients assigned today. ${waitingPatients.length} waiting, ${underObservation.length} under observation.` },
    { label: "Under Observation", value: String(underObservation.length), icon: Heart, color: "text-amber-600", bg: "bg-amber-50", desc: `${underObservation.length} patients currently under observation. Monitoring vitals and progress.` },
    { label: "Waiting for Vitals", value: String(pendingVitals.length), icon: Activity, color: "text-cyan-600", bg: "bg-cyan-50", desc: `${pendingVitals.length} patients require initial vitals recording before consultation.` },
    { label: "Active Alerts", value: String(openAlerts.length), icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", desc: `${openAlerts.length} active alerts requiring attention. Immediate response needed for high-severity cases.` },
    { label: "Pending Follow-ups", value: String(pendingFollowUps.length), icon: Calendar, color: "text-violet-600", bg: "bg-violet-50", desc: `${pendingFollowUps.length} follow-ups due. Patients awaiting post-treatment check-in.` },
    { label: "Completed Today", value: String(completed.length), icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", desc: `${completed.length} patients completed today. All tracked and documented.` },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-cyan-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-cyan-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader
        title="Nurse Dashboard"
        description="Welcome back, Nurse Okeke. Here is your patient care overview for today."
        actions={[
          { label: "Record Vitals", href: "/nurse/vitals", variant: "primary" },
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
            <CardTitle className="text-base sm:text-lg">Needs Attention</CardTitle>
            <Link href="/nurse/patients" className="text-xs sm:text-sm font-medium text-cyan-700">All Patients</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {assignedPatients.filter(p => p.status !== "Completed").slice(0, 5).map(p => (
                <div key={p.id} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{p.patientName}</p>
                      <p className="text-[10px] text-slate-400">{p.age}yrs / {p.gender}</p>
                    </div>
                    {p.status === "Waiting" ? (
                      <Link href={`/nurse/vitals?patient=${p.patientId}`} className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-bold text-white">Vitals</Link>
                    ) : (
                      <Link href={`/nurse/monitoring?patient=${p.patientId}`} className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white">Monitor</Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-slate-500">{p.purpose}</span>
                    <span className="text-slate-200">|</span>
                    {statusBadge(p.priority)}
                    {statusBadge(p.status)}
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
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
                  {assignedPatients.filter(p => p.status !== "Completed").slice(0, 5).map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium"><p className="text-slate-900 whitespace-nowrap">{p.patientName}</p><p className="text-xs text-slate-400">{p.age}yrs / {p.gender}</p></TableCell>
                      <TableCell className="text-sm text-slate-600">{p.purpose}</TableCell>
                      <TableCell>{statusBadge(p.priority)}</TableCell>
                      <TableCell>{statusBadge(p.status)}</TableCell>
                      <TableCell className="text-right">
                        {p.status === "Waiting" ? (
                          <Link href={`/nurse/vitals?patient=${p.patientId}`} className="inline-flex justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 whitespace-nowrap">Record Vitals</Link>
                        ) : (
                          <Link href={`/nurse/monitoring?patient=${p.patientId}`} className="inline-flex justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 whitespace-nowrap">Monitor</Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Active Alerts</CardTitle>
            <Link href="/nurse/monitoring" className="text-xs sm:text-sm font-medium text-cyan-700">View All</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {openAlerts.slice(0, 4).map(a => (
              <div key={a.id} onClick={() => setAlertModal(a)} className="rounded-xl border border-slate-200 p-4 hover:border-cyan-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate text-sm">{a.patientName}</p>
                    <p className="mt-1 text-xs text-slate-500">{a.alert}</p>
                    <p className="mt-1 text-[10px] text-slate-400 tabular-nums">{a.timestamp}</p>
                  </div>
                  <div className="shrink-0">{statusBadge(a.severity)}</div>
                </div>
                <div className="mt-3">{statusBadge(a.status)}</div>
              </div>
            ))}
            {openAlerts.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No active alerts.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Pending Vitals Entry</CardTitle>
            <Link href="/nurse/vitals" className="text-xs sm:text-sm font-medium text-cyan-700">Record Vitals</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {pendingVitals.map(v => (
                <div key={v.id} className="p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-medium text-slate-900 text-sm truncate">{v.patientName}</p>
                    <Link href={`/nurse/vitals?patient=${v.patientId}`} className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-bold text-white">Enter</Link>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div><p className="text-[8px] text-slate-400 uppercase">BP</p><p className="text-xs font-medium text-slate-700">{v.bloodPressure}</p></div>
                    <div><p className="text-[8px] text-slate-400 uppercase">Temp</p><p className="text-xs font-medium text-slate-700">{v.temperature}</p></div>
                    <div><p className="text-[8px] text-slate-400 uppercase">Pulse</p><p className="text-xs font-medium text-slate-700">{v.pulse}</p></div>
                    <div><p className="text-[8px] text-slate-400 uppercase">Vision</p><p className="text-xs font-medium text-slate-700">{v.visionMeasurement}</p></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
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
                  {pendingVitals.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium text-slate-900">{v.patientName}</TableCell>
                      <TableCell className="tabular-nums"><span className="inline-flex items-center gap-1 text-slate-400"><Thermometer size={14} className="text-slate-300" />{v.bloodPressure}</span></TableCell>
                      <TableCell className="text-slate-400">{v.temperature}</TableCell>
                      <TableCell className="text-slate-400">{v.pulse}</TableCell>
                      <TableCell className="text-slate-400"><span className="inline-flex items-center gap-1"><Eye size={14} className="text-slate-300" />{v.visionMeasurement}</span></TableCell>
                      <TableCell className="text-right"><Link href={`/nurse/vitals?patient=${v.patientId}`} className="inline-flex justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 whitespace-nowrap">Enter</Link></TableCell>
                    </TableRow>
                  ))}
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
              {pendingFollowUps.slice(0, 3).map(f => (
                <div key={f.id} onClick={() => setFollowUpModal(f)} className="rounded-xl border border-slate-200 p-4 hover:border-cyan-200 hover:shadow-sm transition-all cursor-pointer">
                  <p className="font-semibold text-slate-900 text-sm">{f.patientName}</p>
                  <p className="mt-1 text-xs text-slate-500">{f.reason}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">Due: {f.dueDate}</span>
                    {statusBadge(f.status)}
                  </div>
                </div>
              ))}
              {pendingFollowUps.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No pending follow-ups.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg">Recent Observations</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {observationNotes.slice(0, 2).map(o => (
                <div key={o.id} onClick={() => setObsModal(o)} className="rounded-xl border border-slate-200 p-4 hover:border-cyan-200 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-1"><p className="font-semibold text-slate-900 text-sm">{o.patientName}</p><span className="text-[10px] font-medium text-slate-400">{o.timestamp}</span></div>
                  <p className="text-xs text-slate-600 line-clamp-2">{o.note}</p>
                  <div className="mt-2"><Badge variant="outline" className="text-[10px]">{o.category}</Badge></div>
                </div>
              ))}
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

      {/* Alert Detail Modal */}
      <Modal isOpen={!!alertModal} onClose={() => setAlertModal(null)} title="Alert Details">
        {alertModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
              <AlertTriangle size={24} className="text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">{alertModal.patientName}</p>
                <p className="text-xs text-rose-700 font-medium">{alertModal.alert}</p>
              </div>
              {statusBadge(alertModal.severity)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>{statusBadge(alertModal.status)}</div>
              <div className="p-3 bg-white rounded-xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Timestamp</p><p className="text-xs font-bold text-slate-700">{alertModal.timestamp}</p></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAlertModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button>
              <button onClick={() => { acknowledgeAlert(alertModal.id); setAlertModal(null); showToast(`Alert for ${alertModal.patientName} acknowledged`); }} className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200">Acknowledge</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Follow-up Detail Modal */}
      <Modal isOpen={!!followUpModal} onClose={() => setFollowUpModal(null)} title="Follow-up Details">
        {followUpModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700"><Calendar size={20} /></div>
              <div>
                <p className="font-bold text-slate-900">{followUpModal.patientName}</p>
                <p className="text-xs text-slate-500">{followUpModal.reason}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Due Date</p><p className="text-sm font-bold text-rose-600">{followUpModal.dueDate}</p></div>
              <div className="p-3 bg-white rounded-xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>{statusBadge(followUpModal.status)}</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setFollowUpModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button>
              <button onClick={() => { markFollowUpDone(followUpModal.id); setFollowUpModal(null); showToast(`Follow-up for ${followUpModal.patientName} marked done`); }} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Mark Complete</button>
            </div>
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
                <p className="font-bold text-slate-900">{obsModal.patientName}</p>
                <Badge variant="outline" className="text-[10px] mt-1">{obsModal.category}</Badge>
              </div>
              <span className="ml-auto text-[10px] text-slate-400">{obsModal.timestamp}</span>
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
