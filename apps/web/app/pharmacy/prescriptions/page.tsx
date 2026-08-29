"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { ClipboardList, Pill, CheckCircle2, XCircle, Eye, Search } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useAllPrescriptions, usePharmacyPatients } from "@/hooks/usePharmacy";
import type { Prescription } from "@/hooks/usePharmacy";

function getPatientName(rx: Prescription, patientMap: Map<string, string>): string {
  // Try to get patient name from the medicalRecord relation
  const patient = rx.medicalRecord?.patient;
  if (patient) return `${patient.firstName} ${patient.lastName}`;
  // Fallback to patient map
  if (rx.medicalRecord?.patientId) return patientMap.get(rx.medicalRecord.patientId) || "Unknown Patient";
  return "Unknown Patient";
}

function getDoctorName(rx: Prescription): string {
  const staff = rx.prescribedBy;
  if (staff) return `Dr. ${staff.firstName} ${staff.lastName}`;
  return "Unknown Doctor";
}

export default function PharmacyPrescriptions() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || null;

  const { data: prescriptions = [], isLoading } = useAllPrescriptions(clinicId);
  const { data: patients = [] } = usePharmacyPatients(clinicId);

  const patientMap = useMemo(() => {
    const map = new Map<string, string>();
    patients.forEach((p) => map.set(p.id, `${p.firstName} ${p.lastName}`));
    return map;
  }, [patients]);

  const [detailRx, setDetailRx] = useState<Prescription | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let result = prescriptions;
    if (filter === "active") result = result.filter((r) => r.isActive);
    if (filter === "inactive") result = result.filter((r) => !r.isActive);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.medication.toLowerCase().includes(q) ||
        getPatientName(r, patientMap).toLowerCase().includes(q)
      );
    }
    return result;
  }, [prescriptions, filter, search, patientMap]);

  const activeCount = prescriptions.filter((r) => r.isActive).length;
  const inactiveCount = prescriptions.filter((r) => !r.isActive).length;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Prescriptions" description="View and manage patient prescriptions." />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card onClick={() => setFilter("active")} className={`cursor-pointer transition-all ${filter === "active" ? "border-emerald-200 bg-emerald-50/50" : "hover:border-emerald-200"}`}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ClipboardList size={18} className="text-emerald-500" /> Active</CardTitle>
            <Badge className="bg-emerald-600 text-white">{activeCount}</Badge>
          </CardHeader>
        </Card>
        <Card onClick={() => setFilter("inactive")} className={`cursor-pointer transition-all ${filter === "inactive" ? "border-slate-200 bg-slate-50" : "hover:border-slate-200"}`}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Pill size={18} className="text-slate-500" /> Inactive</CardTitle>
            <Badge variant="secondary">{inactiveCount}</Badge>
          </CardHeader>
        </Card>
        <Card onClick={() => setFilter("all")} className={`cursor-pointer transition-all ${filter === "all" ? "border-sky-200 bg-sky-50/50" : "hover:border-sky-200"}`}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Eye size={18} className="text-sky-500" /> All</CardTitle>
            <Badge className="bg-sky-600 text-white">{prescriptions.length}</Badge>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Prescription List</CardTitle>
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-500 py-6">Loading prescriptions...</TableCell></TableRow>
                ) : filtered.map((rx) => (
                  <TableRow key={rx.id}>
                    <TableCell>
                      <button onClick={() => setDetailRx(rx)} className="font-medium text-slate-900 hover:text-emerald-700 transition-colors text-left whitespace-nowrap">
                        {getPatientName(rx, patientMap)}
                      </button>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{rx.medication}</TableCell>
                    <TableCell className="text-sm text-slate-600">{rx.dosage}</TableCell>
                    <TableCell className="text-sm text-slate-600">{rx.frequency}</TableCell>
                    <TableCell className="text-sm text-slate-600">{getDoctorName(rx)}</TableCell>
                    <TableCell>
                      <Badge className={rx.isActive ? "bg-emerald-600 text-white" : "bg-slate-400 text-white"}>
                        {rx.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => setDetailRx(rx)}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        View
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-500 py-6">No prescriptions found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!detailRx} onClose={() => setDetailRx(null)} title="Prescription Details">
        {detailRx && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700"><ClipboardList size={24} /></div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{detailRx.medication}</h4>
                <p className="text-sm text-slate-500">{getPatientName(detailRx, patientMap)} • {getDoctorName(detailRx)}</p>
                <div className="mt-1">
                  <Badge className={detailRx.isActive ? "bg-emerald-600 text-white" : "bg-slate-400 text-white"}>
                    {detailRx.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Dosage</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailRx.dosage}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Frequency</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailRx.frequency}</p>
              </div>
              {detailRx.duration && (
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">{detailRx.duration}</p>
                </div>
              )}
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Date Prescribed</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{new Date(detailRx.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {detailRx.instructions && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Instructions</p>
                <p className="text-sm text-slate-700 leading-relaxed">{detailRx.instructions}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button onClick={() => setDetailRx(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
