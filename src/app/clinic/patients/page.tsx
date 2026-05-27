"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { clinicPatients, type ClinicPatient } from "@/app/clinic/_mock/clinic-data";

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

  const activeCount = patients.filter((p) => p.status === "Active").length;
  const newCount = patients.filter((p) => p.status === "New").length;

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
        description="Patient registry, status, and last-visit activity."
        actions={[{ label: "Register patient", onClick: () => setIsRegisterOpen(true), variant: "primary" }]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Registered patients</CardTitle>
          <p className="text-sm text-slate-500">Showing {patients.length} record(s)</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Last visit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell className="tabular-nums">{p.age}</TableCell>
                  <TableCell>{p.sex}</TableCell>
                  <TableCell className="tabular-nums">{p.phone}</TableCell>
                  <TableCell>{lastVisitLabel(p.lastVisitISO)}</TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
