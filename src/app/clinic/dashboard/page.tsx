import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Calendar, Clock, DollarSign, Eye, Users } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import {
  clinicAppointmentsToday,
  clinicHmoClaims,
  clinicInvoicesToday,
  clinicOpticalOrders,
  clinicPharmacyItems,
  clinicQueue,
  formatNGN,
} from "@/app/clinic/_mock/clinic-data";

const revenueTrend = [
  { day: "Mon", amount: 98000 },
  { day: "Tue", amount: 142000 },
  { day: "Wed", amount: 121000 },
  { day: "Thu", amount: 88000 },
  { day: "Fri", amount: 157000 },
  { day: "Sat", amount: 110000 },
  { day: "Sun", amount: 76000 },
];

function statusBadge(status: string) {
  if (status === "Urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (status === "In-service") return <Badge className="bg-amber-600 text-white">In service</Badge>;
  if (status === "Waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (status === "Done") return <Badge className="bg-emerald-600 text-white">Done</Badge>;
  if (status === "Checked-in") return <Badge className="bg-sky-600 text-white">Checked-in</Badge>;
  if (status === "In-progress") return <Badge className="bg-amber-600 text-white">In progress</Badge>;
  if (status === "Scheduled") return <Badge variant="outline">Scheduled</Badge>;
  if (status === "Completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (status === "Cancelled") return <Badge className="bg-slate-200 text-slate-700">Cancelled</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function ClinicDashboard() {
  const activeQueueCount = clinicQueue.filter((q) => q.status !== "Done").length;
  const todayPatients = clinicAppointmentsToday.length;
  const revenuePaid = clinicInvoicesToday.filter((i) => i.status === "Paid").reduce((acc, i) => acc + i.amount, 0);
  const openOpticalOrders = clinicOpticalOrders.filter((o) => o.status !== "Dispensed").length;

  const lowStock = clinicPharmacyItems.filter((i) => i.stock <= i.reorderLevel).length;
  const queriedClaims = clinicHmoClaims.filter((c) => c.status === "Queried").length;

  const maxRevenue = Math.max(...revenueTrend.map((r) => r.amount));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clinic Dashboard"
        description="Operational overview for today: queue, appointments, billing, optical, and pharmacy."
        actions={[
          { label: "Register patient", href: "/clinic/patients", variant: "primary" },
          { label: "New appointment", href: "/clinic/appointments" },
          { label: "Billing & finance", href: "/clinic/finance" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Today&apos;s patients</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{todayPatients}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-sky-700">
              <Users size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active queue</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{activeQueueCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-amber-700">
              <Clock size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Revenue (paid)</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(revenuePaid)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-emerald-700">
              <DollarSign size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Open optical orders</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{openOpticalOrders}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 text-purple-700">
              <Eye size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Live queue</CardTitle>
            <Link href="/clinic/queue" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Manage queue
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Wait</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicQueue.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.patientName}</TableCell>
                    <TableCell>{q.stage}</TableCell>
                    <TableCell>{statusBadge(q.priority)}</TableCell>
                    <TableCell className="tabular-nums">{q.waitMinutes}m</TableCell>
                    <TableCell>{statusBadge(q.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Today&apos;s appointments</CardTitle>
            <Link href="/clinic/appointments" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {clinicAppointmentsToday.slice(0, 6).map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{a.patientName}</p>
                    <p className="mt-0.5 text-sm text-slate-500 truncate">
                      {a.service} • {a.provider}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 tabular-nums">{a.startTime}</span>
                    </div>
                    <div className="mt-2">{statusBadge(a.status)}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Revenue trend (last 7 days)</CardTitle>
            <Link href="/clinic/finance" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Open finance
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-3 items-end">
              {revenueTrend.map((r) => {
                const height = Math.max(10, Math.round((r.amount / maxRevenue) * 100));
                return (
                  <div key={r.day} className="flex flex-col items-center gap-2">
                    <div
                      className={cn("w-full rounded-lg bg-sky-600/20 border border-sky-600/20", "relative overflow-hidden")}
                      style={{ height: 140 }}
                      title={formatNGN(r.amount)}
                    >
                      <div className="absolute inset-x-0 bottom-0 bg-sky-600" style={{ height: `${height}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">{r.day}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Paid invoices (today)</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
                  {clinicInvoicesToday.filter((i) => i.status === "Paid").length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Pending invoices (today)</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
                  {clinicInvoicesToday.filter((i) => i.status === "Pending").length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm text-slate-500">Average ticket (paid)</p>
                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">
                  {formatNGN(
                    Math.round(revenuePaid / Math.max(1, clinicInvoicesToday.filter((i) => i.status === "Paid").length))
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Pharmacy stock</p>
              <p className="mt-1 text-sm text-slate-500">{lowStock} item(s) at/below reorder level</p>
              <div className="mt-3">
                <Link href="/clinic/pharmacy" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                  Review inventory
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">HMO claims</p>
              <p className="mt-1 text-sm text-slate-500">{queriedClaims} claim(s) queried and require action</p>
              <div className="mt-3">
                <Link href="/clinic/hmo" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                  Open claims
                </Link>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Optical pickups</p>
              <p className="mt-1 text-sm text-slate-500">
                {clinicOpticalOrders.filter((o) => o.status === "Ready").length} order(s) ready for pickup
              </p>
              <div className="mt-3">
                <Link href="/clinic/optical" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                  View optical orders
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

