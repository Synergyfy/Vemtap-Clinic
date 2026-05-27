"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { clinicAppointmentsToday, type ClinicAppointment } from "@/app/clinic/_mock/clinic-data";

function statusBadge(status: string) {
  if (status === "Checked-in") return <Badge className="bg-sky-600 text-white">Checked-in</Badge>;
  if (status === "In-progress") return <Badge className="bg-amber-600 text-white">In progress</Badge>;
  if (status === "Completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (status === "Cancelled") return <Badge className="bg-slate-200 text-slate-700">Cancelled</Badge>;
  return <Badge variant="outline">Scheduled</Badge>;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = React.useState<ClinicAppointment[]>(clinicAppointmentsToday);
  const [isNewOpen, setIsNewOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    patientName: "",
    startTime: "09:00",
    service: "Consultation" as ClinicAppointment["service"],
    provider: "Dr. A. Bello",
  });

  const scheduled = appointments.filter((a) => a.status === "Scheduled").length;
  const checkedIn = appointments.filter((a) => a.status === "Checked-in").length;
  const inProgress = appointments.filter((a) => a.status === "In-progress").length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName.trim()) return;
    const nextId = `A-${1000 + appointments.length + 1}`;
    const newAppointment: ClinicAppointment = {
      id: nextId,
      patientId: "P-NEW",
      patientName: form.patientName.trim(),
      startTime: form.startTime,
      service: form.service,
      provider: form.provider,
      status: "Scheduled",
    };
    setAppointments((prev) => [newAppointment, ...prev]);
    setIsNewOpen(false);
    setForm({ patientName: "", startTime: "09:00", service: "Consultation", provider: "Dr. A. Bello" });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Appointments"
        description="Daily schedule and status tracking for patient visits."
        actions={[
          { label: "New appointment", onClick: () => setIsNewOpen(true), variant: "primary" },
          { label: "Queue management", href: "/clinic/queue" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Today</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{appointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Checked-in</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{checkedIn}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">In progress</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{inProgress}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Schedule (today)</CardTitle>
          <p className="text-sm text-slate-500">{scheduled} scheduled</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium tabular-nums">{a.startTime}</TableCell>
                  <TableCell>{a.patientName}</TableCell>
                  <TableCell>{a.service}</TableCell>
                  <TableCell>{a.provider}</TableCell>
                  <TableCell>{statusBadge(a.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="New appointment">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Patient name</label>
            <input
              value={form.patientName}
              onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="e.g., Fatima Yusuf"
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">Time</label>
              <input
                value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                placeholder="09:00"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Service</label>
              <select
                value={form.service}
                onChange={(e) => setForm((p) => ({ ...p, service: e.target.value as ClinicAppointment["service"] }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              >
                <option value="Consultation">Consultation</option>
                <option value="Refraction">Refraction</option>
                <option value="Optical">Optical</option>
                <option value="Surgery Review">Surgery Review</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Provider</label>
            <input
              value={form.provider}
              onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              placeholder="e.g., Dr. A. Bello"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewOpen(false)}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
            >
              Create appointment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
