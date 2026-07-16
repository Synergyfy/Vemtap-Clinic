"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, AlertTriangle, Calendar, Pill, Truck, PackageSearch, Clock } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { usePharmacyStore } from "@/app/pharmacy/_mock/pharmacy-store";

function statusBadge(status: string) {
  if (status === "Active") return <Badge className="bg-sky-600 text-white">Active</Badge>;
  if (status === "Dispensing") return <Badge className="bg-amber-600 text-white">Dispensing</Badge>;
  if (status === "Picked Up") return <Badge className="bg-emerald-600 text-white">Picked Up</Badge>;
  if (status === "Cancelled") return <Badge className="bg-rose-600 text-white">Cancelled</Badge>;
  if (status === "Pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "Delivered") return <Badge className="bg-emerald-600 text-white">Delivered</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function PharmacyDashboard() {
  const drugs = usePharmacyStore((s) => s.drugs);
  const prescriptions = usePharmacyStore((s) => s.prescriptions);
  const purchaseOrders = usePharmacyStore((s) => s.purchaseOrders);

  const activeRx = prescriptions.filter((r) => r.status === "Active");
  const dispensingRx = prescriptions.filter((r) => r.status === "Dispensing");
  const lowStock = drugs.filter((d) => d.quantity <= d.minStock);
  const expiringSoon = drugs.filter((d) => {
    const [y, m] = d.expiryDate.split("-").map(Number);
    const expiry = new Date(y, m - 1);
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    return expiry <= threeMonths;
  });
  const pendingPO = purchaseOrders.filter((po) => po.status === "Pending");

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Pharmacy Dashboard"
        description="Welcome back, Pharm. Okafor. Manage prescriptions, inventory, dispensing, and suppliers."
        actions={[
          { label: "Prescription Queue", href: "/pharmacy/prescriptions", variant: "primary" },
          { label: "New Order", href: "/pharmacy/suppliers" },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Rx</p>
              <p className="mt-1 text-xl font-bold text-sky-600">{activeRx.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700"><ClipboardList size={18} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Dispensing</p>
              <p className="mt-1 text-xl font-bold text-amber-600">{dispensingRx.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700"><Pill size={18} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Low Stock</p>
              <p className="mt-1 text-xl font-bold text-rose-600">{lowStock.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700"><AlertTriangle size={18} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Expiring ≤3mo</p>
              <p className="mt-1 text-xl font-bold text-amber-600">{expiringSoon.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700"><Calendar size={18} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Drug Items</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{drugs.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700"><PackageSearch size={18} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Orders</p>
              <p className="mt-1 text-xl font-bold text-violet-600">{pendingPO.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-700"><Truck size={18} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Pending Prescriptions</CardTitle>
            <Link href="/pharmacy/prescriptions" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">View Queue</Link>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rx ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.filter((r) => r.status !== "Picked Up").slice(0, 5).map((rx) => (
                    <TableRow key={rx.id}>
                      <TableCell className="text-xs font-mono text-slate-500">{rx.id}</TableCell>
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">{rx.patientName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{rx.doctor}</TableCell>
                      <TableCell className="text-sm text-slate-600">{rx.drugs.length}</TableCell>
                      <TableCell className="text-xs text-slate-500">{rx.date}</TableCell>
                      <TableCell>{statusBadge(rx.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/pharmacy/dispensing?rx=${rx.id}`}
                          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors whitespace-nowrap">
                          {rx.status === "Active" ? "Dispense" : "Continue"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:space-y-8">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><AlertTriangle size={16} className="text-rose-500" /> Low Stock Alerts</CardTitle>
              <Link href="/pharmacy/inventory" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">View</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.slice(0, 4).map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{d.name}</p>
                      <p className="text-[10px] text-slate-400">{d.location} • Min: {d.minStock}</p>
                    </div>
                    <Badge className={d.quantity === 0 ? "bg-rose-600 text-white" : "bg-amber-600 text-white"}>{d.quantity}</Badge>
                  </div>
                </div>
              ))}
              {lowStock.length === 0 && <p className="text-sm text-slate-500 text-center py-4">All items adequately stocked.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Calendar size={16} className="text-amber-500" /> Expiring Soon</CardTitle>
              <Link href="/pharmacy/inventory" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">View</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {expiringSoon.slice(0, 4).map((d) => (
                <div key={d.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{d.name}</p>
                      <p className="text-[10px] text-slate-400">Stock: {d.quantity} {d.unit}(s)</p>
                    </div>
                    <Badge className="bg-amber-600 text-white">{d.expiryDate}</Badge>
                  </div>
                </div>
              ))}
              {expiringSoon.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No items expiring soon.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
