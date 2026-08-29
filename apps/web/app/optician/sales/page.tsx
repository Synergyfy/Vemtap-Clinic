"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useOpticalSales } from "@/hooks/useOptician";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
  refunded: "bg-slate-100 text-slate-600",
  cancelled: "bg-red-100 text-red-800",
};

export default function SalesPage() {
  const { data: sales = [], isLoading } = useOpticalSales();
  const [detailSale, setDetailSale] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalRevenue = sales.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.totalPrice, 0);
    const todaySales = sales.filter((s) => {
      const saleDate = new Date(s.createdAt).toDateString();
      return saleDate === new Date().toDateString();
    }).length;
    const pending = sales.filter((s) => s.status === "pending").length;
    return { totalRevenue, todaySales, pending };
  }, [sales]);

  const selectedSale = detailSale ? sales.find((s) => s.id === detailSale) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading sales...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Optical Sales"
        description="Track all optical sales and revenue generated."
        actions={[]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Total Sales</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{sales.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Today</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{stats.todaySales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Revenue</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-600">₦{stats.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-[10px] sm:text-xs font-medium text-slate-500">Pending</p>
            <p className="mt-1 text-xl sm:text-2xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {sales.map((sale) => (
          <Card key={sale.id}>
            <CardHeader className="px-4 py-3 flex-row items-center gap-2 border-b border-slate-100">
              <Badge className={statusColors[sale.status]}>{sale.status}</Badge>
              <span className="text-[10px] text-slate-400 tabular-nums">{sale.saleNumber}</span>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <button onClick={() => setDetailSale(sale.id)} className="font-medium text-slate-900 text-sm hover:text-amber-700 transition-colors truncate text-left">{sale.patient?.firstName} {sale.patient?.lastName}</button>
                <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{sale.paymentMethod}</span>
              </div>
              <div className="text-xs text-slate-500 mb-2">{sale.inventoryItem?.name || sale.lensOrderId ? "Lens Order" : "—"}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">₦{sale.totalPrice.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400">{new Date(sale.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {sales.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No sales found.</p>}
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium text-slate-900 whitespace-nowrap font-mono text-xs">{sale.saleNumber}</TableCell>
                <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                  <button onClick={() => setDetailSale(sale.id)} className="hover:text-amber-700 transition-colors text-left">{sale.patient?.firstName} {sale.patient?.lastName}</button>
                </TableCell>
                <TableCell className="text-sm text-slate-600 whitespace-nowrap">{sale.inventoryItem?.name || "—"}</TableCell>
                <TableCell className="text-sm text-slate-600 whitespace-nowrap">{sale.quantity}</TableCell>
                <TableCell className="text-sm text-slate-600 whitespace-nowrap font-medium">₦{sale.totalPrice.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-slate-600 whitespace-nowrap capitalize">{sale.paymentMethod}</TableCell>
                <TableCell className="text-sm text-slate-500 whitespace-nowrap">{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                <TableCell><Badge className={statusColors[sale.status]}>{sale.status}</Badge></TableCell>
              </TableRow>
            ))}
            {sales.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-slate-500 py-6">No sales found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={!!selectedSale} onClose={() => setDetailSale(null)} title="Sale Details">
        {selectedSale && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                {selectedSale.status === "completed" ? <CheckCircle2 size={24} /> : selectedSale.status === "cancelled" ? <XCircle size={24} /> : <AlertCircle size={24} />}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedSale.patient?.firstName} {selectedSale.patient?.lastName}</h4>
                <p className="text-sm text-slate-500">{selectedSale.saleNumber}</p>
                <div className="mt-1"><Badge className={statusColors[selectedSale.status]}>{selectedSale.status}</Badge></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Item</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedSale.inventoryItem?.name || "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Quantity</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedSale.quantity}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">₦{selectedSale.totalPrice.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Payment</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 capitalize">{selectedSale.paymentMethod}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{new Date(selectedSale.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sale ID</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">{selectedSale.id.slice(0, 8)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
