"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Heart, AlertTriangle, CheckCircle2, Plus, Eye, Trash2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseQueue } from "@/hooks/useNurse";
import {
  useClinicObservationNotes,
  useCreateObservationNote,
  useDeleteObservationNote,
  type ObservationCategory,
  type ObservationNote,
} from "@/hooks/useObservationNotes";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

function severityBadge(severity: string) {
  if (severity === "High") return <Badge className="bg-rose-600 text-white">High</Badge>;
  if (severity === "Medium") return <Badge className="bg-amber-600 text-white">Medium</Badge>;
  return <Badge variant="secondary">Low</Badge>;
}

function statusBadge(status: string) {
  if (status === "Open") return <Badge className="bg-sky-600 text-white">Open</Badge>;
  if (status === "Acknowledged") return <Badge className="bg-amber-600 text-white">Acknowledged</Badge>;
  if (status === "Resolved") return <Badge className="bg-emerald-600 text-white">Resolved</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function NurseMonitoring() {
  const { user } = useAuth();
  const clinicId = user?.clinicId ?? "";

  const { data: queueEntries = [] } = useNurseQueue();
  const { data: notes = [], refetch: refetchNotes } = useClinicObservationNotes();
  const { data: patientsData } = usePatients({ clinicId, limit: 100 });
  const patients = Array.isArray(patientsData?.data)
    ? patientsData.data
    : Array.isArray(patientsData)
    ? patientsData
    : [];

  const createNoteMut = useCreateObservationNote();
  const deleteNoteMut = useDeleteObservationNote();

  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ObservationNote | null>(null);
  const [patientId, setPatientId] = useState("");
  const [category, setCategory] = useState<ObservationCategory>("vitals");
  const [noteText, setNoteText] = useState("");

  const underObservation = queueEntries.filter((e) => e.status === "in_progress");

  const alerts = useMemo(() => {
    return notes
      .filter((n) => n.category === "adverse_reaction" || n.category === "allergy")
      .map((n) => ({
        id: n.id,
        patientName: `${n.patient?.firstName} ${n.patient?.lastName}`,
        patientId: n.patientId,
        alert: n.note,
        severity: n.category === "adverse_reaction" ? "High" : "Medium",
        timestamp: new Date(n.createdAt).toLocaleString(),
        status: "Open" as const,
        category: n.category,
      }));
  }, [notes]);

  const openAlerts = alerts.filter((a) => a.status === "Open");

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Patient Monitoring"
        description="Track patient observations, alerts, and monitoring timelines."
        actions={[
          {
            label: "+ Record Observation",
            onClick: () => {
              setPatientId("");
              setCategory("vitals");
              setNoteText("");
              setNewNoteOpen(true);
            },
            variant: "default",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2" id="alerts">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle size={18} className="text-rose-500" />
              Active Alerts
            </CardTitle>
            <Badge className="bg-rose-600 text-white">{openAlerts.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {alerts.map((a) => (
                <div key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">{a.patientName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.alert}</p>
                    </div>
                    {severityBadge(a.severity)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusBadge(a.status)}
                      <span className="text-[10px] text-slate-400">{a.timestamp}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium"><CheckCircle2 size={12} />Noted</span>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No alerts to display.</p>}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Alert</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">{a.patientName}</TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-xs truncate">{a.alert}</TableCell>
                      <TableCell>{severityBadge(a.severity)}</TableCell>
                      <TableCell className="text-xs text-slate-400 tabular-nums whitespace-nowrap">{a.timestamp}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                    </TableRow>
                  ))}
                  {alerts.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-slate-500 py-6">No alerts to display.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Heart size={18} className="text-amber-500" />
              Under Observation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {underObservation.map((e) => (
              <div key={e.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{e.patient?.firstName} {e.patient?.lastName}</p>
                <p className="mt-1 text-xs text-slate-500">{e.notes || e.station || "General"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Ticket #{e.ticketNumber}</span>
                  <Badge className="bg-slate-100 text-slate-700">{e.priority || "Normal"}</Badge>
                </div>
              </div>
            ))}
            {underObservation.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No patients under observation.</p>}
          </CardContent>
        </Card>
      </div>

      <Card id="notes">
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div>
            <CardTitle className="text-base sm:text-lg">Observation Timeline</CardTitle>
            <p className="text-xs text-slate-500">Live clinical observations recorded by nurses & attending doctors</p>
          </div>
          <Badge variant="secondary">{notes.length} entries</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {notes.map((o) => (
              <div key={o.id} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-medium text-slate-900 text-sm truncate">{o.patient?.firstName} {o.patient?.lastName}</p>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{new Date(o.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{o.note}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{o.category}</Badge>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedNote(o)} className="text-xs text-brand-navy font-bold hover:underline">
                      View
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Delete this observation note?")) {
                          try {
                            await deleteNoteMut.mutateAsync(o.id);
                            toast.success("Observation note deleted");
                          } catch {
                            toast.error("Failed to delete observation note");
                          }
                        }
                      }}
                      className="text-xs text-rose-600 font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {notes.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No observations yet.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs text-slate-400 tabular-nums whitespace-nowrap">{new Date(o.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{o.patient?.firstName} {o.patient?.lastName}</TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-xs truncate">{o.note}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{o.category}</Badge></TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedNote(o)}
                        className="p-1.5 text-slate-400 hover:text-brand-navy hover:bg-slate-100 rounded-lg mr-1 transition-all"
                        title="View Note Detail"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("Delete this observation note?")) {
                            try {
                              await deleteNoteMut.mutateAsync(o.id);
                              toast.success("Observation note deleted");
                            } catch {
                              toast.error("Failed to delete observation note");
                            }
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Note"
                      >
                        <Trash2 size={15} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {notes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-slate-500 py-6">
                      No observations recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Record Observation Note Modal */}
      <Modal isOpen={newNoteOpen} onClose={() => setNewNoteOpen(false)} title="Record Observation Note">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!patientId || !noteText.trim()) {
              toast.error("Please select a patient and enter a note");
              return;
            }
            try {
              await createNoteMut.mutateAsync({
                patientId,
                note: noteText.trim(),
                category,
                clinicId,
              });
              toast.success("Observation note recorded");
              setNewNoteOpen(false);
              setNoteText("");
              setPatientId("");
            } catch (err: any) {
              toast.error(err?.message || "Failed to record observation note");
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Patient *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              <option value="">Select patient...</option>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} {p.mrn ? `(${p.mrn})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ObservationCategory)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
            >
              <option value="vitals">Vitals (BP, Pulse, Temp, O2)</option>
              <option value="treatment">Treatment / Medication</option>
              <option value="allergy">Allergy Alert</option>
              <option value="adverse_reaction">Adverse Reaction</option>
              <option value="follow_up">Follow-Up Note</option>
              <option value="general">General Clinical Note</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Observation Note *</label>
            <textarea
              rows={4}
              placeholder="e.g. Vitals recorded - BP: 120/80, Temp: 37.2°C, Patient reports mild headache..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              required
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setNewNoteOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createNoteMut.isPending}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm"
            >
              {createNoteMut.isPending ? "Recording..." : "Record Note"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Observation Note Modal */}
      <Modal isOpen={!!selectedNote} onClose={() => setSelectedNote(null)} title="Observation Note Detail">
        {selectedNote && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Patient</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedNote.patient?.firstName} {selectedNote.patient?.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <Badge variant="outline" className="text-[11px] font-bold uppercase mt-0.5">
                  {selectedNote.category.replace(/_/g, " ")}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Recorded At</span>
                <span className="font-mono text-slate-700">
                  {new Date(selectedNote.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Author Staff</span>
                <span className="font-medium text-slate-700">
                  {selectedNote.staff ? `${selectedNote.staff.firstName} ${selectedNote.staff.lastName}` : "Attending Nurse / Doctor"}
                </span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Clinical Observation:</span>
              <p className="p-3 bg-white border border-slate-200 rounded-xl text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                {selectedNote.note}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={async () => {
                  if (confirm("Delete this observation note?")) {
                    try {
                      await deleteNoteMut.mutateAsync(selectedNote.id);
                      toast.success("Observation note deleted");
                      setSelectedNote(null);
                    } catch {
                      toast.error("Failed to delete observation note");
                    }
                  }
                }}
                className="text-rose-600 font-bold hover:underline"
              >
                Delete Note
              </button>
              <button
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
