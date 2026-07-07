"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Calendar, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseStore } from "@/app/nurse/_mock/nurse-store";

function statusBadge(status: string) {
  if (status === "Pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "Completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (status === "Missed") return <Badge className="bg-rose-600 text-white">Missed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function NurseFollowUps() {
  const assignedPatients = useNurseStore((s) => s.assignedPatients);
  const followUps = useNurseStore((s) => s.followUps);
  const markFollowUpDone = useNurseStore((s) => s.markFollowUpDone);
  const scheduleFollowUp = useNurseStore((s) => s.scheduleFollowUp);

  const [doneConfirm, setDoneConfirm] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schPatientId, setSchPatientId] = useState("");
  const [schPatientName, setSchPatientName] = useState("");
  const [schReason, setSchReason] = useState("");
  const [schDate, setSchDate] = useState("");
  const [schSuccess, setSchSuccess] = useState("");

  const pending = followUps.filter((f) => f.status === "Pending");
  const completed = followUps.filter((f) => f.status === "Completed");
  const missed = followUps.filter((f) => f.status === "Missed");

  const handleMarkDone = (id: string) => {
    markFollowUpDone(id);
    setDoneConfirm(null);
  };

  const openSchedule = () => {
    setSchPatientId("");
    setSchPatientName("");
    setSchReason("");
    setSchDate("");
    setSchSuccess("");
    setScheduleOpen(true);
  };

  const handleSchedule = () => {
    if (!schPatientId || !schReason.trim() || !schDate) return;
    scheduleFollowUp(schPatientId, schPatientName || "Unknown", schDate, schReason.trim());
    setSchSuccess("Follow-up scheduled");
    setTimeout(() => {
      setScheduleOpen(false);
      setSchSuccess("");
    }, 1200);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Follow-up Tracking"
        description="Manage patient follow-up schedules, status updates, and care continuation."
      />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card id="pending">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Pending
            </CardTitle>
            <Badge variant="secondary">{pending.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{f.patientName}</p>
                <p className="mt-1 text-xs text-slate-500">{f.reason}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <Calendar size={12} />
                    Due: {f.dueDate}
                  </span>
                  <span>{statusBadge(f.status)}</span>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No pending follow-ups.</p>
            )}
          </CardContent>
        </Card>

        <Card id="completed">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              Completed
            </CardTitle>
            <Badge className="bg-emerald-600 text-white">{completed.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {completed.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{f.patientName}</p>
                <p className="mt-1 text-xs text-slate-500">{f.reason}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {f.dueDate}
                  </span>
                  <span>{statusBadge(f.status)}</span>
                </div>
              </div>
            ))}
            {completed.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No completed follow-ups.</p>
            )}
          </CardContent>
        </Card>

        <Card id="missed">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-500" />
              Missed
            </CardTitle>
            <Badge className="bg-rose-600 text-white">{missed.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {missed.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{f.patientName}</p>
                <p className="mt-1 text-xs text-slate-500">{f.reason}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {f.dueDate}
                  </span>
                  <span>{statusBadge(f.status)}</span>
                </div>
              </div>
            ))}
            {missed.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No missed follow-ups.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>All Follow-up Schedules</CardTitle>
          <button
            onClick={openSchedule}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
          >
            <Plus size={16} />
            Schedule New
          </button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followUps.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{f.patientName}</TableCell>
                    <TableCell className="text-sm text-slate-600">{f.reason}</TableCell>
                    <TableCell className="text-sm text-slate-500 tabular-nums">{f.dueDate}</TableCell>
                    <TableCell>{statusBadge(f.status)}</TableCell>
                    <TableCell className="text-right">
                      {f.status === "Pending" ? (
                        <button
                          onClick={() => setDoneConfirm(f.id)}
                          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors whitespace-nowrap"
                        >
                          Mark Done
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 size={14} />
                          Done
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!doneConfirm} onClose={() => setDoneConfirm(null)} title="Mark Follow-up as Done">
        <p className="text-sm text-slate-600">
          Mark this follow-up as completed? This action will update the status.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setDoneConfirm(null)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => doneConfirm && handleMarkDone(doneConfirm)}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Mark Done
          </button>
        </div>
      </Modal>

      <Modal isOpen={scheduleOpen} onClose={() => { setScheduleOpen(false); setSchSuccess(""); }} title="Schedule Follow-up">
        {schSuccess ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-700">{schSuccess}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Patient
              </label>
              <select
                value={schPatientId}
                onChange={(e) => {
                  const p = assignedPatients.find((x) => x.patientId === e.target.value);
                  setSchPatientId(e.target.value);
                  setSchPatientName(p?.patientName ?? "");
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="">Select patient...</option>
                {assignedPatients.map((p) => (
                  <option key={p.patientId} value={p.patientId}>
                    {p.patientName} - {p.purpose}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Reason for Follow-up
              </label>
              <input
                type="text"
                value={schReason}
                onChange={(e) => setSchReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="e.g. Post-op wound check"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={schDate}
                onChange={(e) => setSchDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleSchedule}
                disabled={!schPatientId || !schReason.trim() || !schDate}
                className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Schedule Follow-up
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
