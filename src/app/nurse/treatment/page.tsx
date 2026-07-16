"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { ClipboardList, FileText, Pill, Scissors, Plus, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseStore } from "@/app/nurse/_mock/nurse-store";
import type { ObservationNote } from "@/app/nurse/_mock/nurse-data";

function categoryBadge(category: ObservationNote["category"]) {
  if (category === "General")
    return <Badge variant="outline" className="border-slate-300 text-slate-600">General</Badge>;
  if (category === "Medication")
    return <Badge className="bg-sky-600 text-white">Medication</Badge>;
  if (category === "Procedure")
    return <Badge className="bg-violet-600 text-white">Procedure</Badge>;
  return <Badge variant="outline">{category}</Badge>;
}

const categoryColors: Record<ObservationNote["category"], string> = {
  General: "border-slate-200",
  Medication: "border-sky-200 bg-sky-50/30",
  Procedure: "border-violet-200 bg-violet-50/30",
};

export default function NurseTreatment() {
  const assignedPatients = useNurseStore((s) => s.assignedPatients);
  const observationNotes = useNurseStore((s) => s.observationNotes);
  const addNote = useNurseStore((s) => s.addNote);

  const [modalOpen, setModalOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [category, setCategory] = useState<ObservationNote["category"]>("General");
  const [noteText, setNoteText] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const generalNotes = observationNotes.filter((n) => n.category === "General");
  const medicationNotes = observationNotes.filter((n) => n.category === "Medication");
  const procedureNotes = observationNotes.filter((n) => n.category === "Procedure");

  const openModal = () => {
    setPatientId("");
    setPatientName("");
    setCategory("General");
    setNoteText("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleAddNote = () => {
    if (!patientId || !noteText.trim()) return;
    addNote(patientId, patientName || "Unknown", noteText.trim(), category);
    setSuccessMsg("Note added successfully");
    setTimeout(() => {
      setModalOpen(false);
      setSuccessMsg("");
    }, 1200);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Treatment Notes"
        description="Document nursing notes, medication administration, and procedure records."
      />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} className="text-slate-400" />
              Nursing Notes
            </CardTitle>
            <Badge variant="secondary">{generalNotes.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {generalNotes.map((n) => (
              <div key={n.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-900 text-sm">{n.patientName}</p>
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600">{n.note}</p>
              </div>
            ))}
            {generalNotes.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No nursing notes recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill size={18} className="text-sky-500" />
              Medication Notes
            </CardTitle>
            <Badge className="bg-sky-600 text-white">{medicationNotes.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {medicationNotes.map((n) => (
              <div key={n.id} className="rounded-xl border border-sky-200 bg-sky-50/30 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-900 text-sm">{n.patientName}</p>
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600">{n.note}</p>
              </div>
            ))}
            {medicationNotes.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No medication notes recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scissors size={18} className="text-violet-500" />
              Procedure Notes
            </CardTitle>
            <Badge className="bg-violet-600 text-white">{procedureNotes.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {procedureNotes.map((n) => (
              <div key={n.id} className="rounded-xl border border-violet-200 bg-violet-50/30 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-900 text-sm">{n.patientName}</p>
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600">{n.note}</p>
              </div>
            ))}
            {procedureNotes.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No procedure notes recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">All Treatment Notes</CardTitle>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-cyan-700 hover:text-cyan-800 transition-colors"
            >
              <Plus size={16} />
              Add Note
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {observationNotes.map((o) => (
                <div key={o.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">{o.patientName}</p>
                      {categoryBadge(o.category)}
                    </div>
                    <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{o.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{o.note}</p>
                </div>
              ))}
              {observationNotes.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No treatment notes recorded.</p>}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {observationNotes.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs text-slate-400 tabular-nums whitespace-nowrap">{o.timestamp}</TableCell>
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">{o.patientName}</TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-md">{o.note}</TableCell>
                      <TableCell>{categoryBadge(o.category)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSuccessMsg(""); }} title="Add Treatment Note">
        {successMsg ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-700">{successMsg}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Patient
              </label>
              <select
                value={patientId}
                onChange={(e) => {
                  const p = assignedPatients.find((x) => x.patientId === e.target.value);
                  setPatientId(e.target.value);
                  setPatientName(p?.patientName ?? "");
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
                Category
              </label>
              <div className="flex gap-2">
                {(["General", "Medication", "Procedure"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                      category === c
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Note
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                placeholder="Enter your observation or treatment note..."
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleAddNote}
                disabled={!patientId || !noteText.trim()}
                className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Note
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
