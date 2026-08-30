"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { usePatients, useCreatePatient } from "@/hooks/usePatients";
import { useRecords } from "@/hooks/useRecords";
import { useLensOrders } from "@/hooks/useOptician";
import { PageSkeleton } from "@/components/ui/skeleton";

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
  const { data: patientsResponse, isLoading } = usePatients();
  const patients = patientsResponse?.data ?? [];
  const createPatient = useCreatePatient();
  const { data: records = [] } = useRecords();
  const { data: opticalOrders = [] } = useLensOrders();

  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
  const [form, setForm] = React.useState({ firstName: "", lastName: "", phone: "", dateOfBirth: "", gender: "Female" as "Female" | "Male" });
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"All" | string>("All");

  const activeCount = patients.filter((p: any) => p.status === "Active").length;
  const newCount = patients.filter((p: any) => p.status === "New").length;
  const openOpticalOrders = opticalOrders.filter((o: any) => o.status !== "Dispensed").length;

  const recordsByPatientId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) map.set(r.patientId, (map.get(r.patientId) ?? 0) + 1);
    return map;
  }, [records]);

  const ordersByPatientId = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const o of opticalOrders) map.set(o.patientId, (map.get(o.patientId) ?? 0) + 1);
    return map;
  }, [opticalOrders]);

  const filteredPatients = React.useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return patients.filter((p: any) => {
      const matchesStatus = status === "All" ? true : p.status === status;
      if (!matchesStatus) return false;
      if (!normalized) return true;
      return (
        p.id.toLowerCase().includes(normalized) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(normalized) ||
        p.phone?.toLowerCase().includes(normalized)
      );
    });
  }, [patients, query, status]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) return;

    createPatient.mutate({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender,
    }, {
      onSuccess: () => {
        setIsRegisterOpen(false);
        setForm({ firstName: "", lastName: "", phone: "", dateOfBirth: "", gender: "Female" });
      },
    });
  };

  if (isLoading) return <PageSkeleton />;

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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3 sm:p-6">
            <p className="text-sm font-medium text-slate-500">Total patients</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{patients.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <p className="text-sm font-medium text-slate-500">Active</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <p className="text-sm font-medium text-slate-500">New (today)</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{newCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-6">
            <p className="text-sm font-medium text-slate-500">Open optical orders</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{openOpticalOrders}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base sm:text-lg font-bold">Registered patients</CardTitle>
          <p className="text-xs sm:text-sm text-slate-500">Showing {filteredPatients.length} record(s)</p>
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
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="All">All</option>
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto"><Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Last visit</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Optical</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <Link href={`/clinic/patients/${p.id}`} className="font-medium text-sky-700 hover:text-sky-800">
                      {p.firstName} {p.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">{p.phone}</TableCell>
                  <TableCell>{p.lastVisit ? lastVisitLabel(p.lastVisit) : "-"}</TableCell>
                  <TableCell className="tabular-nums">{recordsByPatientId.get(p.id) ?? 0}</TableCell>
                  <TableCell className="tabular-nums">{ordersByPatientId.get(p.id) ?? 0}</TableCell>
                  <TableCell>{statusBadge(p.status ?? "Active")}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/clinic/patients/${p.id}`} className="text-sm font-medium text-sky-700 hover:text-sky-800">
                      Open
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></div>
        </CardContent>
      </Card>

      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register patient">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">First name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="e.g., Jane"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Last name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="e.g., Doe"
                required
              />
            </div>
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
              <label className="text-sm font-medium text-slate-700">Date of birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as "Female" | "Male" }))}
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
              disabled={createPatient.isPending}
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {createPatient.isPending ? "Creating..." : "Create patient"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
