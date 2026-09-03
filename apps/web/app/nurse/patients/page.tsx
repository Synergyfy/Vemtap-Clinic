"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Users, User, Calendar, Activity, ClipboardList, AlertTriangle, ArrowRight, Clock } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseQueue, useCompleteQueueEntry, useClinicNotes } from "@/hooks/useNurse";

function statusBadge(status: string) {
  if (status === "urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (status === "in_progress") return <Badge className="bg-amber-600 text-white">Under Observation</Badge>;
  if (status === "waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (status === "completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function PatientCard({ entry, onDetail, action }: { entry: any; onDetail: (e: any) => void; action: React.ReactNode }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <button onClick={() => onDetail(entry)} className="font-medium text-slate-900 hover:text-cyan-700 transition-colors text-sm truncate text-left">
            {entry.patient?.firstName} {entry.patient?.lastName}
          </button>
          <p className="text-[10px] text-slate-400">Ticket #{entry.ticketNumber}</p>
        </div>
        {action}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-slate-500 truncate">{entry.notes || entry.station || "General"}</span>
        <span className="text-slate-200">|</span>
        {statusBadge(entry.status)}
      </div>
    </div>
  );
}

export default function NursePatients() {
  const { data: queueEntries = [], isLoading } = useNurseQueue();
  const { data: notes = [] } = useClinicNotes();
  const completeEntry = useCompleteQueueEntry();

  const [detailEntry, setDetailEntry] = useState<any>(null);

  const waiting = queueEntries.filter((e) => e.status === "waiting");
  const underObservation = queueEntries.filter((e) => e.status === "in_progress");
  const completed = queueEntries.filter((e) => e.status === "completed");

  const patientNotes = detailEntry
    ? notes.filter((n) => n.patientId === detailEntry.patientId)
    : [];

  function renderTable(title: string, icon: React.ReactNode, badge: React.ReactNode, data: any[], emptyText: string, actionFn: (e: any) => React.ReactNode) {
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
            {data.map((e) => (
              <PatientCard key={e.id} entry={e} onDetail={setDetailEntry} action={actionFn(e)} />
            ))}
            {data.length === 0 && <p className="text-center text-sm text-slate-500 py-6">{emptyText}</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Ticket #</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <button onClick={() => setDetailEntry(e)} className="font-medium text-slate-900 hover:text-cyan-700 transition-colors text-left whitespace-nowrap">
                        {e.patient?.firstName} {e.patient?.lastName}
                      </button>
                      <p className="text-xs text-slate-400">Ticket #{e.ticketNumber}</p>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{e.notes || e.station || "General"}</TableCell>
                    <TableCell className="text-sm text-slate-500">#{e.ticketNumber}</TableCell>
                    <TableCell className="text-right">{actionFn(e)}</TableCell>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading patients...</div>
      </div>
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
          (e) => (
            <Link
              href={`/nurse/vitals?patient=${e.patientId}`}
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
          (e) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => completeEntry.mutate(e.id)}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap"
              >
                Mark Done
              </button>
              <Link
                href={`/nurse/monitoring?patient=${e.patientId}`}
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
          (e) => (
            <Link
              href={`/nurse/treatment?patient=${e.patientId}`}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] sm:text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              View Notes
            </Link>
          )
        )}
      </div>

      <Modal isOpen={!!detailEntry} onClose={() => setDetailEntry(null)} title="Patient Details">
        {detailEntry && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-700 font-bold text-lg">
                <User size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{detailEntry.patient?.firstName} {detailEntry.patient?.lastName}</h4>
                <p className="text-sm text-slate-500">Ticket #{detailEntry.ticketNumber}</p>
                <div className="mt-1 flex gap-2">
                  {statusBadge(detailEntry.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purpose</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailEntry.notes || detailEntry.station || "General"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Station</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailEntry.station || "N/A"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue Entry</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">{detailEntry.id.slice(0, 8)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient ID</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">{detailEntry.patientId.slice(0, 8)}</p>
              </div>
            </div>

            {patientNotes.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ClipboardList size={12} />
                  Recent Notes
                </p>
                {patientNotes.slice(0, 3).map((n) => (
                  <div key={n.id} className="rounded-xl border border-slate-200 p-3 mb-2">
                    <p className="text-xs text-slate-600">{n.note}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()} &bull; {n.category}</p>
                  </div>
                ))}
              </div>
            )}

            {detailEntry.status === "in_progress" && (
              <button
                onClick={() => {
                  completeEntry.mutate(detailEntry.id);
                  setDetailEntry(null);
                }}
                className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
              >
                Mark as Completed
              </button>
            )}

            {detailEntry.status === "waiting" && (
              <Link
                href={`/nurse/vitals?patient=${detailEntry.patientId}`}
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
