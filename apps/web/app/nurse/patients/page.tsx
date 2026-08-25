"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Users, User, Calendar, Activity, ClipboardList, AlertTriangle, ArrowRight, Clock } from "lucide-react";
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

function PatientCard({ p, onDetail, action }: { p: AssignedPatient; onDetail: (p: AssignedPatient) => void; action: React.ReactNode }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <button onClick={() => onDetail(p)} className="font-medium text-slate-900 hover:text-cyan-700 transition-colors text-sm truncate text-left">{p.patientName}</button>
          <p className="text-[10px] text-slate-400">{p.age}yrs / {p.gender}</p>
        </div>
        {action}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-slate-500 truncate">{p.purpose}</span>
        <span className="text-slate-200">|</span>
        {statusBadge(p.priority)}
      </div>
    </div>
  );
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

  function renderTable(title: string, icon: React.ReactNode, badge: React.ReactNode, data: AssignedPatient[], emptyText: string, actionFn: (p: AssignedPatient) => React.ReactNode) {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {icon}
            {title}
          </CardTitle>
          {badge}
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {data.map((p) => (
              <PatientCard key={p.id} p={p} onDetail={setDetailPatient} action={actionFn(p)} />
            ))}
            {data.length === 0 && <p className="text-center text-sm text-slate-500 py-6">{emptyText}</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
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
                {data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <button onClick={() => setDetailPatient(p)} className="font-medium text-slate-900 hover:text-cyan-700 transition-colors text-left whitespace-nowrap">
                        {p.patientName}
                      </button>
                      <p className="text-xs text-slate-400">{p.age}yrs / {p.gender}</p>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{p.purpose}</TableCell>
                    <TableCell>{statusBadge(p.priority)}</TableCell>
                    <TableCell className="text-right">{actionFn(p)}</TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">{emptyText}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Assigned Patients"
        description="Manage your assigned patients across all status categories. Click a patient name for details."
      />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        {renderTable(
          "Waiting",
          <Users size={18} className="text-slate-400" />,
          <Badge variant="secondary">{waiting.length}</Badge>,
          waiting,
          "No waiting patients.",
          (p) => (
            <Link
              href={`/nurse/vitals?patient=${p.patientId}`}
              className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-white hover:bg-cyan-700 whitespace-nowrap"
            >
              Record Vitals
            </Link>
          )
        )}

        {renderTable(
          "Under Observation",
          <Activity size={18} className="text-amber-500" />,
          <Badge className="bg-amber-600 text-white">{underObservation.length}</Badge>,
          underObservation,
          "No patients under observation.",
          (p) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => markPatientCompleted(p.patientId)}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap"
              >
                Mark Done
              </button>
              <Link
                href={`/nurse/monitoring?patient=${p.patientId}`}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
              >
                Monitor
              </Link>
            </div>
          )
        )}

        {renderTable(
          "Completed",
          <ClipboardList size={18} className="text-emerald-500" />,
          <Badge className="bg-emerald-600 text-white">{completed.length}</Badge>,
          completed,
          "No completed patients.",
          (p) => (
            <Link
              href={`/nurse/treatment?patient=${p.patientId}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              View Notes
            </Link>
          )
        )}
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
                    <p className="mt-1 text-[10px] text-slate-400">{n.timestamp} &bull; {n.category}</p>
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
