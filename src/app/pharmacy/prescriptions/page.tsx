"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { ClipboardList, Pill, CheckCircle2, XCircle, Eye, Clock, Calendar } from "lucide-react";
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

export default function PharmacyPrescriptions() {
  const prescriptions = usePharmacyStore((s) => s.prescriptions);
  const updateRxStatus = usePharmacyStore((s) => s.updateRxStatus);

  const [detailRx, setDetailRx] = useState<Prescription | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const active = prescriptions.filter((r) => r.status === "Active");
  const dispensing = prescriptions.filter((r) => r.status === "Dispensing");
  const pickedUp = prescriptions.filter((r) => r.status === "Picked Up");

  const handleCancel = (rxId: string) => {
    updateRxStatus(rxId, "Cancelled");
    setCancelConfirm(null);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Prescription Queue" description="Manage active prescriptions, dispensing queue, and pickup status." />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ClipboardList size={18} className="text-sky-500" /> Active</CardTitle>
            <Badge className="bg-sky-600 text-white">{active.length}</Badge>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Drugs</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {active.map((rx) => (
                    <TableRow key={rx.id}>
                      <TableCell>
                        <button onClick={() => setDetailRx(rx)} className="font-medium text-slate-900 hover:text-emerald-700 transition-colors text-left whitespace-nowrap">
                          {rx.patientName}
                        </button>
                        <p className="text-xs text-slate-400 font-mono">{rx.id}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{rx.drugs.length} item(s)</TableCell>
                      <TableCell className="text-sm text-slate-600">{rx.doctor}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/pharmacy/dispensing?rx=${rx.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                          Dispense
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {active.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">No active prescriptions.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Pill size={18} className="text-amber-500" /> Dispensing</CardTitle>
            <Badge className="bg-amber-600 text-white">{dispensing.length}</Badge>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Drugs</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dispensing.map((rx) => (
                    <TableRow key={rx.id}>
                      <TableCell>
                        <button onClick={() => setDetailRx(rx)} className="font-medium text-slate-900 hover:text-emerald-700 transition-colors text-left whitespace-nowrap">
                          {rx.patientName}
                        </button>
                        <p className="text-xs text-slate-400 font-mono">{rx.id}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{rx.drugs.length} item(s)</TableCell>
                      <TableCell className="text-xs text-slate-500">{rx.date}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/pharmacy/dispensing?rx=${rx.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 transition-colors">
                          Complete
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {dispensing.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">No prescriptions being dispensed.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Picked Up</CardTitle>
            <Badge className="bg-emerald-600 text-white">{pickedUp.length}</Badge>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Drugs</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickedUp.map((rx) => (
                    <TableRow key={rx.id}>
                      <TableCell>
                        <button onClick={() => setDetailRx(rx)} className="font-medium text-slate-900 hover:text-emerald-700 transition-colors text-left whitespace-nowrap">
                          {rx.patientName}
                        </button>
                        <p className="text-xs text-slate-400 font-mono">{rx.id}</p>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{rx.drugs.length} item(s)</TableCell>
                      <TableCell className="text-xs text-slate-500">{rx.date}</TableCell>
                    </TableRow>
                  ))}
                  {pickedUp.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-sm text-slate-500 py-6">No picked-up prescriptions.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={!!detailRx} onClose={() => setDetailRx(null)} title="Prescription Details">
        {detailRx && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700"><ClipboardList size={24} /></div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{detailRx.patientName}</h4>
                <p className="text-sm text-slate-500">{detailRx.id} • {detailRx.doctor}</p>
                <div className="mt-1 flex gap-2">{statusBadge(detailRx.status)}</div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Prescribed Drugs</p>
              <div className="space-y-2">
                {detailRx.drugs.map((d, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-bold text-slate-900">{d.drugName}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>Dosage: {d.dosage}</span>
                      <span>Qty: {d.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Date Prescribed</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailRx.date}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                <p className="mt-0.5">{statusBadge(detailRx.status)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {detailRx.status === "Active" && (
                <>
                  <Link href={`/pharmacy/dispensing?rx=${detailRx.id}`}
                    className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors text-center">
                    Start Dispensing
                  </Link>
                  <button onClick={() => { setCancelConfirm(detailRx.id); setDetailRx(null); }}
                    className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors">
                    Cancel Rx
                  </button>
                </>
              )}
              {detailRx.status === "Dispensing" && (
                <Link href={`/pharmacy/dispensing?rx=${detailRx.id}`}
                  className="flex-1 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors text-center">
                  Complete Dispensing
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!cancelConfirm} onClose={() => setCancelConfirm(null)} title="Cancel Prescription">
        <p className="text-sm text-slate-600">Are you sure you want to cancel this prescription?</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={() => setCancelConfirm(null)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">Cancel</button>
          <button onClick={() => cancelConfirm && handleCancel(cancelConfirm)}
            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">Yes, Cancel Rx</button>
        </div>
      </Modal>
    </div>
  );
}
