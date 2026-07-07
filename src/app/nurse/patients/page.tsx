"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Users, User, Calendar, Activity, ClipboardList, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseStore } from "@/app/nurse/_mock/nurse-store";
import type { AssignedPatient } from "@/app/nurse/_mock/nurse-data";

function statusBadge(status: string) {
  if (status === "Urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (status === "Under Observation") return <Badge className="bg-amber-600 text-white">Under Observation</Badge>;
  if (status === "Waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (status === "Completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (status === "Normal") return <Badge className="bg-sky-600 text-white">Normal</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function NursePatients() {
  const assignedPatients = useNurseStore((s) => s.assignedPatients);
  const observationNotes = useNurseStore((s) => s.observationNotes);
  const monitoringAlerts = useNurseStore((s) => s.monitoringAlerts);
  const markPatientCompleted = useNurseStore((s) => s.markPatientCompleted);

  const [detailPatient, setDetailPatient] = useState<AssignedPatient | null>(null);

  const waiting = assignedPatients.filter((p) => p.status === "Waiting");
  const underObservation = assignedPatients.filter((p) => p.status === "Under Observation");
  const completed = assignedPatients.filter((p) => p.status === "Completed");

  const patientNotes = detailPatient
    ? observationNotes.filter((n) => n.patientId === detailPatient.patientId)
    : [];
  const patientAlerts = detailPatient
    ? monitoringAlerts.filter((a) => a.patientId === detailPatient.patientId)
    : [];

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Assigned Patients"
        description="Manage your assigned patients across all status categories. Click a patient name for details."
      />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card id="waiting">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users size={18} className="text-slate-400" />
              Waiting
            </CardTitle>
            <Badge variant="secondary">{waiting.length}</Badge>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waiting.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <button
                          onClick={() => setDetailPatient(p)}
                          className="font-medium text-slate-900 hover:text-cyan-700 transition-colors text-left whitespace-nowrap"
                        >
                          {p.patientName}
                        </button>
                        <p className="text-xs text-slate-400">{p.age}yrs / {p.gender}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">{p.purpose}</TableCell>
                      <TableCell>{statusBadge(p.priority)}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/nurse/vitals?patient=${p.patientId}`}
                          className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 transition-colors"
                        >
                          Record Vitals
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {waiting.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">No waiting patients.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card id="observation">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity size={18} className="text-amber-500" />
              Under Observation
            </CardTitle>
            <Badge className="bg-amber-600 text-white">{underObservation.length}</Badge>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {underObservation.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <button
                          onClick={() => setDetailPatient(p)}
                          className="font-medium text-slate-900 hover:text-cyan-700 transition-colors text-left whitespace-nowrap"
                        >
                          {p.patientName}
                        </button>
                        <p className="text-xs text-slate-400">{p.age}yrs / {p.gender}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">{p.purpose}</TableCell>
                      <TableCell>{statusBadge(p.priority)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => markPatientCompleted(p.patientId)}
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
                          >
                            Mark Done
                          </button>
                          <Link
                            href={`/nurse/monitoring?patient=${p.patientId}`}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Monitor
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {underObservation.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">No patients under observation.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card id="completed">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList size={18} className="text-emerald-500" />
              Completed
            </CardTitle>
            <Badge className="bg-emerald-600 text-white">{completed.length}</Badge>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completed.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <button
                          onClick={() => setDetailPatient(p)}
                          className="font-medium text-slate-900 hover:text-cyan-700 transition-colors text-left whitespace-nowrap"
                        >
                          {p.patientName}
                        </button>
                        <p className="text-xs text-slate-400">{p.age}yrs / {p.gender}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">{p.purpose}</TableCell>
                      <TableCell>{statusBadge(p.priority)}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/nurse/treatment?patient=${p.patientId}`}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          View Notes
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {completed.length === 0 && (
                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">No completed patients.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={!!detailPatient} onClose={() => setDetailPatient(null)} title="Patient Details">
        {detailPatient && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-700 font-bold text-lg">
                <User size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{detailPatient.patientName}</h4>
                <p className="text-sm text-slate-500">
                  {detailPatient.age} years / {detailPatient.gender}
                </p>
                <div className="mt-1 flex gap-2">
                  {statusBadge(detailPatient.status)}
                  {statusBadge(detailPatient.priority)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient ID</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailPatient.patientId}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailPatient.purpose}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned At</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailPatient.assignedAt}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignment</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailPatient.id}</p>
              </div>
            </div>

            {patientAlerts.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Alerts
                </p>
                {patientAlerts.map((a) => (
                  <div key={a.id} className="rounded-xl border border-rose-200 bg-rose-50/30 p-3 mb-2">
                    <p className="text-sm font-medium text-slate-900">{a.alert}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge className={a.severity === "High" ? "bg-rose-600 text-white" : a.severity === "Medium" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"}>
                        {a.severity}
                      </Badge>
                      <span className="text-xs text-slate-400">{a.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {patientNotes.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ClipboardList size={12} />
                  Recent Notes
                </p>
                {patientNotes.slice(0, 3).map((n) => (
                  <div key={n.id} className="rounded-xl border border-slate-200 p-3 mb-2">
                    <p className="text-xs text-slate-600">{n.note}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{n.timestamp} • {n.category}</p>
                  </div>
                ))}
              </div>
            )}

            {detailPatient.status === "Under Observation" && (
              <button
                onClick={() => {
                  markPatientCompleted(detailPatient.patientId);
                  setDetailPatient(null);
                }}
                className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
              >
                Mark as Completed
              </button>
            )}

            {detailPatient.status === "Waiting" && (
              <Link
                href={`/nurse/vitals?patient=${detailPatient.patientId}`}
                className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors"
              >
                Record Vitals
              </Link>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
