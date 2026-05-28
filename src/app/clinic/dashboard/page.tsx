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
  clinicStaffOnDuty,
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
  if (status === "Draft") return <Badge variant="outline">Draft</Badge>;
  if (status === "In production") return <Badge className="bg-amber-600 text-white">In production</Badge>;
  if (status === "Ready") return <Badge className="bg-emerald-600 text-white">Ready</Badge>;
  if (status === "Dispensed") return <Badge className="bg-slate-200 text-slate-700">Dispensed</Badge>;
  if (status === "On duty") return <Badge className="bg-emerald-600 text-white">On duty</Badge>;
  if (status === "Break") return <Badge className="bg-amber-600 text-white">Break</Badge>;
  if (status === "Off duty") return <Badge className="bg-slate-200 text-slate-700">Off duty</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function ClinicDashboard() {
  const todayISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" }).format(new Date());
  const activeQueueCount = clinicQueue.filter((q) => q.status !== "Done").length;
  const todayPatients = clinicAppointmentsToday.length;
  const revenuePaid = clinicInvoicesToday.filter((i) => i.status === "Paid").reduce((acc, i) => acc + i.amount, 0);
  const openOpticalOrders = clinicOpticalOrders.filter((o) => o.status !== "Dispensed").length;

  const lowStock = clinicPharmacyItems.filter((i) => i.stock <= i.reorderLevel).length;
  const queriedClaims = clinicHmoClaims.filter((c) => c.status === "Queried").length;

  const privateRevenue = clinicInvoicesToday
    .filter((i) => i.payerType === "Private" && i.status !== "Voided")
    .reduce((acc, i) => acc + i.amount, 0);
  const hmoRevenue = clinicInvoicesToday
    .filter((i) => i.payerType === "HMO" && i.status !== "Voided")
    .reduce((acc, i) => acc + i.amount, 0);
  const revenueTotal = privateRevenue + hmoRevenue;
  const privatePct = revenueTotal ? Math.round((privateRevenue / revenueTotal) * 100) : 0;
  const hmoPct = revenueTotal ? 100 - privatePct : 0;

  const pendingInvoices = clinicInvoicesToday.filter((i) => i.status === "Pending").length;
  const longWaitQueue = clinicQueue.filter((q) => q.status !== "Done" && q.waitMinutes >= 15).length;
  const overdueOpticalOrders = clinicOpticalOrders.filter((o) => o.status !== "Dispensed" && o.dueISO < todayISO).length;

  const maxRevenue = Math.max(...revenueTrend.map((r) => r.amount));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clinic Dashboard"
        description="Operational overview for today: patients, queue, appointments, revenue, HMO, optical, staff, and alerts."
        actions={[
          { label: "Register patient", href: "/clinic/patients", variant: "primary" },
          { label: "Create appointment", href: "/clinic/appointments" },
          { label: "Verify HMO", href: "/clinic/hmo" },
          { label: "Create invoice", href: "/clinic/finance" },
          { label: "Add lens order", href: "/clinic/optical" },
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
            <CardTitle>Optical orders</CardTitle>
            <Link href="/clinic/optical" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Lens</TableHead>
                  <TableHead>Frame</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicOpticalOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.patientName}</TableCell>
                    <TableCell>{o.lens}</TableCell>
                    <TableCell>{o.frame}</TableCell>
                    <TableCell className="tabular-nums">{o.dueISO}</TableCell>
                    <TableCell>{statusBadge(o.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Staff on duty</CardTitle>
            <Link href="/clinic/settings" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Manage staff
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {clinicStaffOnDuty.slice(0, 7).map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{s.name}</p>
                    <p className="mt-0.5 text-sm text-slate-500 truncate">
                      {s.role} • {s.department}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-slate-700">{s.shift}</p>
                    <div className="mt-2">{statusBadge(s.status)}</div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Alerts</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/clinic/queue" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Queue
            </Link>
            <Link href="/clinic/pharmacy" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Pharmacy
            </Link>
            <Link href="/clinic/hmo" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              HMO
            </Link>
            <Link href="/clinic/optical" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Optical
            </Link>
            <Link href="/clinic/finance" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Billing
            </Link>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Pharmacy stock</p>
            <p className="mt-1 text-sm text-slate-500">{lowStock} item(s) at/below reorder level</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">HMO claims</p>
            <p className="mt-1 text-sm text-slate-500">{queriedClaims} queried claim(s) require action</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Billing</p>
            <p className="mt-1 text-sm text-slate-500">{pendingInvoices} pending invoice(s) today</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Queue wait</p>
            <p className="mt-1 text-sm text-slate-500">{longWaitQueue} patient(s) waiting 15+ minutes</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Optical pickups</p>
            <p className="mt-1 text-sm text-slate-500">
              {clinicOpticalOrders.filter((o) => o.status === "Ready").length} order(s) ready for pickup
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Optical overdue</p>
            <p className="mt-1 text-sm text-slate-500">{overdueOpticalOrders} order(s) past due date</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Appointments</p>
            <p className="mt-1 text-sm text-slate-500">
              {clinicAppointmentsToday.filter((a) => a.status === "Scheduled").length} scheduled remaining
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">Priority cases</p>
            <p className="mt-1 text-sm text-slate-500">
              {clinicQueue.filter((q) => q.priority === "Urgent" && q.status !== "Done").length} urgent in queue
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Queue overview</CardTitle>
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
            <CardTitle>Revenue summary</CardTitle>
            <Link href="/clinic/finance" className="text-sm font-medium text-sky-700 hover:text-sky-800">
              Open finance
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Revenue trend (last 7 days)</p>
            <div className="mt-4 grid grid-cols-7 gap-3 items-end">
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
            <CardTitle>HMO vs private analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Today (invoices)</p>
                  <p className="mt-1 text-sm text-slate-500">Share of billed revenue</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 tabular-nums">{formatNGN(revenueTotal)}</p>
              </div>

              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-sky-600" style={{ width: `${privatePct}%` }} />
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-600" />
                  <span className="text-slate-700">Private</span>
                  <span className="text-slate-500 tabular-nums">{privatePct}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  <span className="text-slate-700">HMO</span>
                  <span className="text-slate-500 tabular-nums">{hmoPct}%</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Private total</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">{formatNGN(privateRevenue)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">HMO total</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 tabular-nums">{formatNGN(hmoRevenue)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link href="/clinic/finance" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                  Open finance
                </Link>
                <Link href="/clinic/hmo" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                  Open HMO
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-900">Claims needing attention</p>
              <p className="mt-1 text-sm text-slate-500">{queriedClaims} queried claim(s) require action</p>
              <div className="mt-3">
                <Link href="/clinic/hmo" className="text-sm font-medium text-sky-700 hover:text-sky-800">
                  Review claims
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
