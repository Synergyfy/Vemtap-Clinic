"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { ClipboardList, Pill, CheckCircle2, AlertTriangle, User } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { usePharmacyStore } from "@/app/pharmacy/_mock/pharmacy-store";
import type { Prescription } from "@/app/pharmacy/_mock/pharmacy-data";

function statusBadge(status: string) {
  if (status === "Active") return <Badge className="bg-sky-600 text-white">Active</Badge>;
  if (status === "Dispensing") return <Badge className="bg-amber-600 text-white">Dispensing</Badge>;
  if (status === "Picked Up") return <Badge className="bg-emerald-600 text-white">Picked Up</Badge>;
  if (status === "Cancelled") return <Badge className="bg-rose-600 text-white">Cancelled</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function DispensingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedRx = searchParams.get("rx");

  const prescriptions = usePharmacyStore((s) => s.prescriptions);
  const drugs = usePharmacyStore((s) => s.drugs);
  const dispensingRecords = usePharmacyStore((s) => s.dispensingRecords);
  const updateRxStatus = usePharmacyStore((s) => s.updateRxStatus);
  const dispenseDrug = usePharmacyStore((s) => s.dispenseDrug);
  const confirmPickup = usePharmacyStore((s) => s.confirmPickup);
  const deductDrug = usePharmacyStore((s) => s.deductDrug);

  const [dispenseModal, setDispenseModal] = useState<Prescription | null>(null);
  const [pickupModal, setPickupModal] = useState<Prescription | null>(null);
  const [selectedDrugId, setSelectedDrugId] = useState("");
  const [dispenseQty, setDispenseQty] = useState(1);
  const [dispenseNote, setDispenseNote] = useState("");

  const openRx = prescriptions.filter((r) => r.status === "Active" || r.status === "Dispensing");
  const recentDispensing = [...dispensingRecords].sort((a, b) => new Date(b.dispensedAt).getTime() - new Date(a.dispensedAt).getTime()).slice(0, 5);

  const selectedPrescription = selectedRx ? prescriptions.find((r) => r.id === selectedRx) : null;

  const handleDispense = () => {
    if (!dispenseModal || !selectedDrugId || dispenseQty <= 0) return;
    const drug = drugs.find((d) => d.id === selectedDrugId);
    if (!drug || drug.quantity < dispenseQty) return;

    dispenseDrug(dispenseModal.id, dispenseModal.patientName, [{ drugName: drug.name, qty: dispenseQty }]);
    deductDrug(drug.id, dispenseQty);
    setDispenseModal(null);
    setSelectedDrugId("");
    setDispenseQty(1);
    setDispenseNote("");
    router.push("/pharmacy/dispensing");
  };

  const handlePickup = () => {
    if (!pickupModal) return;
    const rec = dispensingRecords.find((r) => r.prescriptionId === pickupModal.id);
    if (!rec) return;
    confirmPickup(rec.id);
    setPickupModal(null);
    router.push("/pharmacy/dispensing");
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Dispensing Center" description="Dispense drugs and confirm patient pickup." />

      {selectedPrescription && selectedPrescription.status === "Picked Up" && (
        <Card className="border-emerald-200 bg-emerald-50/80">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-800">Prescription Complete</p>
              <p className="text-sm text-emerald-700">{selectedPrescription.patientName} — {selectedPrescription.id} has been picked up.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPrescription && selectedPrescription.status === "Cancelled" && (
        <Card className="border-rose-200 bg-rose-50/80">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle size={20} className="text-rose-600" />
            <div>
              <p className="font-bold text-rose-800">Prescription Cancelled</p>
              <p className="text-sm text-rose-700">{selectedPrescription.patientName} — {selectedPrescription.id} has been cancelled.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPrescription && (selectedPrescription.status === "Active" || selectedPrescription.status === "Dispensing") && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList size={18} /> Active Dispensing Session
            </CardTitle>
            <Badge className={selectedPrescription.status === "Active" ? "bg-sky-600 text-white" : "bg-amber-600 text-white"}>
              {selectedPrescription.status}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  <span className="font-bold text-slate-900">{selectedPrescription.patientName}</span>
                  <span className="text-xs text-slate-400 font-mono">{selectedPrescription.id}</span>
                </div>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Doctor</p>
                    <p className="text-sm text-slate-900">{selectedPrescription.doctor}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                    <p className="text-sm text-slate-900">{selectedPrescription.date}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Items</p>
                    <p className="text-sm text-slate-900">{selectedPrescription.drugs.length}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedPrescription.status === "Active" && (
                  <button onClick={() => setDispenseModal(selectedPrescription)}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                    <Pill size={16} className="mr-1.5" /> Start Dispensing
                  </button>
                )}
                {selectedPrescription.status === "Dispensing" && (
                  <>
                    <button onClick={() => setDispenseModal(selectedPrescription)}
                      className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors">
                      Add More Drugs
                    </button>
                    <button onClick={() => setPickupModal(selectedPrescription)}
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                      <CheckCircle2 size={16} className="mr-1.5" /> Confirm Pickup
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed Drugs</p>
              <div className="space-y-2">
                {selectedPrescription.drugs.map((d, i) => {
                  const matched = drugs.find((dd) => dd.name === d.drugName);
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-slate-900">{d.drugName}</span>
                        <span className="text-xs text-slate-500 ml-2">Dosage: {d.dosage}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-700">Qty: {d.qty}</span>
                        {matched && <Badge className={matched.quantity >= d.qty ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}>
                          Stock: {matched.quantity}
                        </Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Prescriptions to Dispense</CardTitle>
            <Badge className="bg-sky-600 text-white">{openRx.length}</Badge>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openRx.map((rx) => (
                    <TableRow key={rx.id} className={selectedRx === rx.id ? "bg-emerald-50" : ""}>
                      <TableCell>
                        <button onClick={() => router.push(`/pharmacy/dispensing?rx=${rx.id}`)}
                          className="font-medium text-slate-900 hover:text-emerald-700 transition-colors text-left whitespace-nowrap">
                          {rx.patientName}
                        </button>
                        <p className="text-xs text-slate-400 font-mono">{rx.id}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{rx.doctor}</TableCell>
                      <TableCell>{statusBadge(rx.status)}</TableCell>
                      <TableCell className="text-right">
                        <button onClick={() => router.push(`/pharmacy/dispensing?rx=${rx.id}`)}
                          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                          Select
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {openRx.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">No open prescriptions.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Dispensing Records</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Drugs</TableHead>
                    <TableHead>Pharmacist</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDispensing.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="text-sm font-medium text-slate-900">{rec.patientName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{rec.drugs.map((d) => `${d.drugName} x${d.qty}`).join(", ")}</TableCell>
                      <TableCell className="text-xs text-slate-500">{rec.dispensedBy}</TableCell>
                      <TableCell className="text-xs text-slate-500">{rec.dispensedAt}</TableCell>
                      <TableCell>
                        <Badge className={rec.status === "Picked Up" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}>
                          {rec.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {recentDispensing.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-slate-500 py-6">No dispensing records yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={!!dispenseModal} onClose={() => { setDispenseModal(null); setSelectedDrugId(""); setDispenseQty(1); setDispenseNote(""); }} title="Dispense Drugs">
        {dispenseModal && (
          <div className="space-y-5">
            <p className="text-sm text-slate-600">Dispensing for <strong>{dispenseModal.patientName}</strong> ({dispenseModal.id})</p>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Drug</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {dispenseModal.drugs.map((d, i) => {
                  const matched = drugs.find((dd) => dd.name === d.drugName);
                  const available = matched ? matched.quantity : 0;
                  const disabled = available < 1;
                  return (
                    <button key={i} onClick={() => { setSelectedDrugId(matched?.id || ""); setDispenseQty(d.qty); }}
                      disabled={disabled}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        selectedDrugId === matched?.id
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200 hover:border-emerald-300"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                      <p className="text-sm font-bold text-slate-900">{d.drugName}</p>
                      <p className="text-xs text-slate-500">Rx qty: {d.qty} • Stock: {available}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity to Dispense</label>
              <input type="number" min={1}
                value={dispenseQty || ""}
                onChange={(e) => setDispenseQty(parseInt(e.target.value) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white" />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Note (optional)</label>
              <textarea value={dispenseNote} onChange={(e) => setDispenseNote(e.target.value)}
                placeholder="E.g., take with food, avoid alcohol..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white resize-none" rows={2} />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => { setDispenseModal(null); setSelectedDrugId(""); setDispenseQty(1); setDispenseNote(""); }}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">Cancel</button>
              <button onClick={handleDispense} disabled={!selectedDrugId || dispenseQty <= 0}
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">Confirm Dispense</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!pickupModal} onClose={() => setPickupModal(null)} title="Confirm Pickup">
        {pickupModal && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700"><User size={24} /></div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{pickupModal.patientName}</h4>
                <p className="text-sm text-slate-500">{pickupModal.id}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">Confirm that the patient has picked up their prescription? This will finalize the dispensing process.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setPickupModal(null)} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">Cancel</button>
              <button onClick={handlePickup} className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">Confirm Pickup</button>
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
