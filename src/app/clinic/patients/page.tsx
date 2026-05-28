"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import {
  clinicConsultations,
  clinicEyeTests,
  clinicOpticalOrders,
  clinicPatientDocuments,
  clinicPatientNotes,
  clinicPatients,
  type ClinicPatient,
} from "@/app/clinic/_mock/clinic-data";

function statusBadge(status: string) {
  if (status === "Active") return <Badge className="bg-emerald-600 text-white">Active</Badge>;
  if (status === "New") return <Badge className="bg-sky-600 text-white">New</Badge>;
  return <Badge variant="secondary">Inactive</Badge>;
}

function lastVisitLabel(iso: string) {
  const lastVisit = new Date(iso);
  const today = new Date();
  const days = Math.round((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export default function PatientsPage() {
  const [patients, setPatients] = React.useState<ClinicPatient[]>(clinicPatients);
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", phone: "", age: "", sex: "Female" as "Female" | "Male" });
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"All" | ClinicPatient["status"]>("All");

  const activeCount = patients.filter((p) => p.status === "Active").length;
  const newCount = patients.filter((p) => p.status === "New").length;
  const openOpticalOrders = clinicOpticalOrders.filter((o) => o.status !== "Dispensed").length;

  const notesByPatientId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const note of clinicPatientNotes) map.set(note.patientId, (map.get(note.patientId) ?? 0) + 1);
    return map;
  }, []);

  const documentsByPatientId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const d of clinicPatientDocuments) map.set(d.patientId, (map.get(d.patientId) ?? 0) + 1);
    return map;
  }, []);

  const ordersByPatientId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const o of clinicOpticalOrders) map.set(o.patientId, (map.get(o.patientId) ?? 0) + 1);
    return map;
  }, []);

  const consultationsByPatientId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clinicConsultations) map.set(c.patientId, (map.get(c.patientId) ?? 0) + 1);
    return map;
  }, []);

  const testsByPatientId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const t of clinicEyeTests) map.set(t.patientId, (map.get(t.patientId) ?? 0) + 1);
    return map;
  }, []);

  const filteredPatients = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return patients.filter((p) => {
      const matchesStatus = status === "All" ? true : p.status === status;
      if (!matchesStatus) return false;
      if (!normalized) return true;
      return (
        p.id.toLowerCase().includes(normalized) ||
        p.name.toLowerCase().includes(normalized) ||
        p.phone.toLowerCase().includes(normalized)
      );
    });
  }, [patients, query, status]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = Number(form.age);
    if (!form.name.trim() || !form.phone.trim() || !Number.isFinite(age) || age <= 0) return;

    const nextId = `P-${String(patients.length + 1).padStart(3, "0")}`;
    const newPatient: ClinicPatient = {
      id: nextId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      age,
      sex: form.sex,
      lastVisitISO: new Date().toISOString().slice(0, 10),
      status: "New",
    };

    setPatients((prev) => [newPatient, ...prev]);
    setIsRegisterOpen(false);
    setForm({ name: "", phone: "", age: "", sex: "Female" });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Patients"
        description="Patients list, profile, timeline, history, optical orders, documents, and notes."
        actions={[
          { label: "Register patient", onClick: () => setIsRegisterOpen(true), variant: "primary" },
          { label: "Appointments", href: "/clinic/appointments" },
          { label: "Optical orders", href: "/clinic/optical" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Total patients</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{patients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Active</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">New (today)</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{newCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Open optical orders</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{openOpticalOrders}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Registered patients</CardTitle>
          <p className="text-sm text-slate-500">Showing {filteredPatients.length} record(s)</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="Search by name, phone, or patient ID..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "All" | ClinicPatient["status"])}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="All">All</option>
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Last visit</TableHead>
                <TableHead>History</TableHead>
                <TableHead>Optical</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>
                    <Link href={`/clinic/patients/${p.id}`} className="font-medium text-sky-700 hover:text-sky-800">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">{p.age}</TableCell>
                  <TableCell>{p.sex}</TableCell>
                  <TableCell className="tabular-nums">{p.phone}</TableCell>
                  <TableCell>{lastVisitLabel(p.lastVisitISO)}</TableCell>
                  <TableCell className="tabular-nums">
                    {consultationsByPatientId.get(p.id) ?? 0} / {testsByPatientId.get(p.id) ?? 0}
                  </TableCell>
                  <TableCell className="tabular-nums">{ordersByPatientId.get(p.id) ?? 0}</TableCell>
                  <TableCell className="tabular-nums">{documentsByPatientId.get(p.id) ?? 0}</TableCell>
                  <TableCell className="tabular-nums">{notesByPatientId.get(p.id) ?? 0}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/clinic/patients/${p.id}`} className="text-sm font-medium text-sky-700 hover:text-sky-800">
                      Open
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="mt-3 text-xs text-slate-500">
            History column shows consultations / eye tests. Open a patient to view full timeline, medical history, eye examination history,
            optical orders, documents &amp; scans, and notes.
          </p>
        </CardContent>
      </Card>

      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register patient">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="e.g., Jane Doe"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="e.g., 0803 555 0192"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Age</label>
              <input
                value={form.age}
                onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="e.g., 34"
                inputMode="numeric"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Sex</label>
            <select
              value={form.sex}
              onChange={(e) => setForm((p) => ({ ...p, sex: e.target.value as "Female" | "Male" }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              Create patient
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
