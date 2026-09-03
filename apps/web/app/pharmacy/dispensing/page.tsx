"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { ClipboardList, Pill, CheckCircle2, AlertTriangle, User, Search } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useAllPrescriptions, useDrugs, useDispenseDrug } from "@/hooks/usePharmacy";
import type { Prescription, Drug } from "@/hooks/usePharmacy";

function getPatientName(rx: Prescription, patientMap: Map<string, string>): string {
  const patient = rx.medicalRecord?.patient;
  if (patient) return `${patient.firstName} ${patient.lastName}`;
  if (rx.medicalRecord?.patientId) return patientMap.get(rx.medicalRecord.patientId) || "Unknown Patient";
  return "Unknown Patient";
}

function getDoctorName(rx: Prescription): string {
  const staff = rx.prescribedBy;
  if (staff) return `Dr. ${staff.firstName} ${staff.lastName}`;
  return "Unknown Doctor";
}

function DispensingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedRxId = searchParams.get("rx");

  const { user } = useAuth();
  const clinicId = user?.clinicId || null;

  const { data: prescriptions = [], isLoading: rxLoading } = useAllPrescriptions(clinicId);
  const { data: drugs = [] } = useDrugs(clinicId);
  const dispenseMutation = useDispenseDrug();

  const [dispenseModal, setDispenseModal] = useState<Prescription | null>(null);
  const [selectedDrugId, setSelectedDrugId] = useState("");
  const [dispenseQty, setDispenseQty] = useState(1);
  const [dispenseNote, setDispenseNote] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const patientMap = useMemo(() => {
    const map = new Map<string, string>();
    prescriptions.forEach((rx) => {
      const p = rx.medicalRecord?.patient;
      if (p && rx.medicalRecord?.patientId) {
        map.set(rx.medicalRecord.patientId, `${p.firstName} ${p.lastName}`);
      }
    });
    return map;
  }, [prescriptions]);

  const activePrescriptions = useMemo(() => {
    let result = prescriptions.filter((r) => r.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.medication.toLowerCase().includes(q) ||
        getPatientName(r, patientMap).toLowerCase().includes(q)
      );
    }
    return result;
  }, [prescriptions, search, patientMap]);

  const selectedPrescription = selectedRxId ? prescriptions.find((r) => r.id === selectedRxId) : null;

  const matchedDrug = selectedDrugId ? drugs.find((d) => d.id === selectedDrugId) : null;

  const handleDispense = async () => {
    if (!dispenseModal || !selectedDrugId || dispenseQty <= 0 || !clinicId) return;
    const patientId = dispenseModal.medicalRecord?.patientId;
    if (!patientId) {
      showToast("Cannot determine patient for this prescription");
      return;
    }

    try {
      await dispenseMutation.mutateAsync({
        drugId: selectedDrugId,
        patientId,
        quantityDispensed: dispenseQty,
        clinicId,
        notes: dispenseNote || undefined,
      });
      showToast(`Dispensed ${matchedDrug?.name || "drug"} successfully`);
      setDispenseModal(null);
      setSelectedDrugId("");
      setDispenseQty(1);
      setDispenseNote("");
      router.push("/pharmacy/dispensing");
    } catch {
      showToast("Failed to dispense drug");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader title="Dispensing Center" description="Dispense drugs to patients based on prescriptions." />

      {selectedPrescription && selectedPrescription.isActive && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList size={18} /> Active Prescription
            </CardTitle>
            <Badge className="bg-emerald-600 text-white">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <span className="font-bold text-slate-900">{getPatientName(selectedPrescription, patientMap)}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Medication</p>
                    <p className="text-sm text-slate-900">{selectedPrescription.medication}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Dosage</p>
                    <p className="text-sm text-slate-900">{selectedPrescription.dosage}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Doctor</p>
                    <p className="text-sm text-slate-900">{getDoctorName(selectedPrescription)}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setDispenseModal(selectedPrescription)}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                <Pill size={16} className="mr-1.5" /> Dispense
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Prescriptions to Dispense</CardTitle>
          <div className="relative w-48 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search medication or patient..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rxLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-slate-500 py-6">Loading prescriptions...</TableCell></TableRow>
                ) : activePrescriptions.map((rx) => (
                  <TableRow key={rx.id} className={selectedRxId === rx.id ? "bg-emerald-50" : ""}>
                    <TableCell>
                      <button onClick={() => router.push(`/pharmacy/dispensing?rx=${rx.id}`)}
                        className="font-medium text-slate-900 hover:text-emerald-700 transition-colors text-left whitespace-nowrap">
                        {getPatientName(rx, patientMap)}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{rx.medication}</TableCell>
                    <TableCell className="text-sm text-slate-600">{rx.dosage}</TableCell>
                    <TableCell className="text-sm text-slate-600">{rx.frequency}</TableCell>
                    <TableCell className="text-sm text-slate-600">{getDoctorName(rx)}</TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => router.push(`/pharmacy/dispensing?rx=${rx.id}`)}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                        Select
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {!rxLoading && activePrescriptions.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-sm text-slate-500 py-6">No active prescriptions to dispense.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!dispenseModal} onClose={() => { setDispenseModal(null); setSelectedDrugId(""); setDispenseQty(1); setDispenseNote(""); }} title="Dispense Drug">
        {dispenseModal && (
          <div className="space-y-5">
            <p className="text-sm text-slate-600">Dispensing for <strong>{getPatientName(dispenseModal, patientMap)}</strong></p>

            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Prescribed Medication</p>
              <p className="text-sm font-bold text-slate-900">{dispenseModal.medication} — {dispenseModal.dosage} ({dispenseModal.frequency})</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Drug from Inventory</label>
              <div className="mt-1.5 space-y-2 max-h-48 overflow-y-auto">
                {drugs.filter((d) => d.quantityInStock > 0).map((d) => (
                  <button key={d.id} onClick={() => { setSelectedDrugId(d.id); setDispenseQty(1); }}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      selectedDrugId === d.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-300"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{d.name}</p>
                        <p className="text-xs text-slate-500">{d.dosageForm || ""} {d.strength || ""}</p>
                      </div>
                      <Badge className="bg-emerald-600 text-white">Stock: {d.quantityInStock}</Badge>
                    </div>
                  </button>
                ))}
                {drugs.filter((d) => d.quantityInStock > 0).length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">No drugs in stock</p>
                )}
              </div>
            </div>

            {matchedDrug && (
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity to Dispense</label>
                <input type="number" min={1} max={matchedDrug.quantityInStock}
                  value={dispenseQty || ""}
                  onChange={(e) => setDispenseQty(parseInt(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white" />
                {dispenseQty > matchedDrug.quantityInStock && (
                  <p className="mt-1 text-xs text-rose-600">Insufficient stock (available: {matchedDrug.quantityInStock})</p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note (optional)</label>
              <textarea value={dispenseNote} onChange={(e) => setDispenseNote(e.target.value)}
                placeholder="E.g., take with food, avoid alcohol..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white resize-none" rows={2} />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => { setDispenseModal(null); setSelectedDrugId(""); setDispenseQty(1); setDispenseNote(""); }}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">Cancel</button>
              <button onClick={handleDispense} disabled={!selectedDrugId || dispenseQty <= 0 || dispenseQty > (matchedDrug?.quantityInStock || 0) || dispenseMutation.isPending}
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {dispenseMutation.isPending ? "Dispensing..." : "Confirm Dispense"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function PharmacyDispensing() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading dispensing center...</div>}>
      <DispensingContent />
    </Suspense>
  );
}
