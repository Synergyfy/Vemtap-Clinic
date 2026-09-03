"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { ClipboardList, FileText, Pill, Scissors, Plus, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useClinicNotes, useCreateNote, useNurseQueue } from "@/hooks/useNurse";

const categoryLabels: Record<string, string> = {
  general: "General",
  vitals: "Vitals",
  treatment: "Treatment",
  follow_up: "Follow-up",
  allergy: "Allergy",
  adverse_reaction: "Adverse Reaction",
  other: "Other",
};

const mockToBackend: Record<string, string> = {
  General: "general",
  Medication: "treatment",
  Procedure: "treatment",
};

function categoryBadge(category: string) {
  const label = categoryLabels[category] || category;
  if (category === "general") return <Badge variant="outline" className="border-slate-300 text-slate-600">{label}</Badge>;
  if (category === "treatment") return <Badge className="bg-sky-600 text-white">{label}</Badge>;
  if (category === "allergy") return <Badge className="bg-rose-600 text-white">{label}</Badge>;
  if (category === "adverse_reaction") return <Badge className="bg-amber-600 text-white">{label}</Badge>;
  return <Badge variant="outline">{label}</Badge>;
}

const categoryColors: Record<string, string> = {
  general: "border-slate-200",
  treatment: "border-sky-200 bg-sky-50/30",
  vitals: "border-emerald-200 bg-emerald-50/30",
  allergy: "border-rose-200 bg-rose-50/30",
  adverse_reaction: "border-amber-200 bg-amber-50/30",
};

export default function NurseTreatment() {
  const { data: notes = [], isLoading } = useClinicNotes();
  const { data: queueEntries = [] } = useNurseQueue();
  const createNote = useCreateNote();

  const [modalOpen, setModalOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [category, setCategory] = useState("general");
  const [noteText, setNoteText] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const generalNotes = notes.filter((n) => n.category === "general");
  const treatmentNotes = notes.filter((n) => n.category === "treatment");
  const vitalsNotes = notes.filter((n) => n.category === "vitals");

  const openModal = () => {
    setPatientId("");
    setCategory("general");
    setNoteText("");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleAddNote = () => {
    if (!patientId || !noteText.trim()) return;
    createNote.mutate(
      { patientId, note: noteText.trim(), category, clinicId: "" },
      {
        onSuccess: () => {
          setSuccessMsg("Note added successfully");
          setTimeout(() => { setModalOpen(false); setSuccessMsg(""); }, 1200);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading treatment notes...</div>
      </div>
    );
  }

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
                  <p className="font-semibold text-slate-900 text-sm">{n.patient?.firstName} {n.patient?.lastName}</p>
                  <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
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
              Treatment Notes
            </CardTitle>
            <Badge className="bg-sky-600 text-white">{treatmentNotes.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {treatmentNotes.map((n) => (
              <div key={n.id} className="rounded-xl border border-sky-200 bg-sky-50/30 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-900 text-sm">{n.patient?.firstName} {n.patient?.lastName}</p>
                  <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600">{n.note}</p>
              </div>
            ))}
            {treatmentNotes.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No treatment notes recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scissors size={18} className="text-emerald-500" />
              Vitals Notes
            </CardTitle>
            <Badge className="bg-emerald-600 text-white">{vitalsNotes.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {vitalsNotes.map((n) => (
              <div key={n.id} className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-slate-900 text-sm">{n.patient?.firstName} {n.patient?.lastName}</p>
                  <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600">{n.note}</p>
              </div>
            ))}
            {vitalsNotes.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No vitals notes recorded.</p>
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
            {notes.map((o) => (
              <div key={o.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{o.patient?.firstName} {o.patient?.lastName}</p>
                    {categoryBadge(o.category)}
                  </div>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{new Date(o.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{o.note}</p>
              </div>
            ))}
            {notes.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No treatment notes recorded.</p>}
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
                {notes.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs text-slate-400 tabular-nums whitespace-nowrap">{new Date(o.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{o.patient?.firstName} {o.patient?.lastName}</TableCell>
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="">Select patient...</option>
                {queueEntries.filter((e) => e.status !== "completed").map((e) => (
                  <option key={e.patientId} value={e.patientId}>
                    {e.patient?.firstName} {e.patient?.lastName} - {e.notes || "Queue"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Category</label>
              <div className="flex gap-2">
                {(["general", "treatment", "vitals"] as const).map((c) => (
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
                    {categoryLabels[c]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Note</label>
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
                disabled={!patientId || !noteText.trim() || createNote.isPending}
                className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createNote.isPending ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
