"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, AlertTriangle, Calendar, Pill, Truck, PackageSearch } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import {
  usePharmacyDrugs,
  usePharmacyLowStock,
  usePharmacyPendingTransfers,
} from "@/hooks/usePharmacyDashboard";
import { cn } from "@/lib/utils";

function statusBadge(status: string) {
  if (status === "Active") return <Badge className="bg-sky-600 text-white">Active</Badge>;
  if (status === "Dispensing") return <Badge className="bg-amber-600 text-white">Dispensing</Badge>;
  if (status === "Picked Up") return <Badge className="bg-emerald-600 text-white">Picked Up</Badge>;
  if (status === "Cancelled") return <Badge className="bg-rose-600 text-white">Cancelled</Badge>;
  if (status === "Pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "Delivered") return <Badge className="bg-emerald-600 text-white">Delivered</Badge>;
  if (status === "requested") return <Badge className="bg-amber-600 text-white">Requested</Badge>;
  if (status === "approved") return <Badge className="bg-sky-600 text-white">Approved</Badge>;
  if (status === "in_transit") return <Badge className="bg-violet-600 text-white">In Transit</Badge>;
  if (status === "received") return <Badge className="bg-emerald-600 text-white">Received</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function isExpiringSoon(expiryDate: string | undefined): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const threeMonths = new Date();
  threeMonths.setMonth(threeMonths.getMonth() + 3);
  return expiry <= threeMonths;
}

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || null;

  const { data: drugs = [], isLoading: drugsLoading } = usePharmacyDrugs(clinicId);
  const { data: lowStockDrugs = [], isLoading: lowStockLoading } = usePharmacyLowStock(clinicId);
  const { data: pendingTransfers = [], isLoading: transfersLoading } = usePharmacyPendingTransfers(clinicId);

  const lowStock = useMemo(() => drugs.filter((d) => d.quantityInStock <= d.reorderLevel), [drugs]);
  const expiringSoon = useMemo(() => drugs.filter((d) => isExpiringSoon(d.expiryDate)), [drugs]);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Pharmacy Dashboard"
        description="Manage prescriptions, inventory, dispensing, and suppliers."
        actions={[
          { label: "Drug Inventory", href: "/pharmacy/inventory" },
          { label: "New Order", href: "/pharmacy/suppliers" },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Drugs</p>
              <p className="mt-1 text-xl font-bold text-sky-600">{drugs.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700"><ClipboardList size={18} /></div>
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
              <p className="text-xs font-medium text-slate-500">Out of Stock</p>
              <p className="mt-1 text-xl font-bold text-rose-600">{drugs.filter((d) => d.quantityInStock === 0).length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700"><Pill size={18} /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Pending Transfers</p>
              <p className="mt-1 text-xl font-bold text-violet-600">{pendingTransfers.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-700"><Truck size={18} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Low Stock Alerts</CardTitle>
            <Link href="/pharmacy/inventory" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">View All</Link>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Drug</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>In Stock</TableHead>
                    <TableHead>Reorder Level</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.slice(0, 6).map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <p className="font-medium text-slate-900">{d.name}</p>
                        {d.genericName && <p className="text-xs text-slate-400">{d.genericName}</p>}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{d.category || "—"}</TableCell>
                      <TableCell>
                        <Badge className={d.quantityInStock === 0 ? "bg-rose-600 text-white" : "bg-amber-600 text-white"}>
                          {d.quantityInStock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{d.reorderLevel}</TableCell>
                      <TableCell className="text-xs text-slate-500">{d.expiryDate || "—"}</TableCell>
                      <TableCell>{statusBadge(d.quantityInStock === 0 ? "Out of Stock" : "Low Stock")}</TableCell>
                    </TableRow>
                  ))}
                  {lowStock.length === 0 && !lowStockLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500">All items adequately stocked</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 md:space-y-8">
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
                      <p className="text-[10px] text-slate-400">Stock: {d.quantityInStock}</p>
                    </div>
                    <Badge className="bg-amber-600 text-white">{d.expiryDate}</Badge>
                  </div>
                </div>
              ))}
              {expiringSoon.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No items expiring soon</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Truck size={16} className="text-violet-500" /> Pending Transfers</CardTitle>
              <Link href="/pharmacy/inventory" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">View</Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTransfers.slice(0, 4).map((t) => (
                <div key={t.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{t.transferNumber}</p>
                      <p className="text-[10px] text-slate-400">{t.type} transfer</p>
                    </div>
                    {statusBadge(t.status)}
                  </div>
                </div>
              ))}
              {pendingTransfers.length === 0 && !transfersLoading && (
                <p className="text-sm text-slate-500 text-center py-4">No pending transfers</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
