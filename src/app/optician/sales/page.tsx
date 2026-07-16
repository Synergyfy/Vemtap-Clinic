"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { BarChart3, CheckCircle2, TrendingUp, ShoppingCart, Eye } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useOpticianStore } from "@/app/optician/_mock/optician-store";

function paymentBadge(method: string) {
  if (method === "Cash") return <Badge className="bg-emerald-600 text-white">Cash</Badge>;
  if (method === "Card") return <Badge className="bg-sky-600 text-white">Card</Badge>;
  if (method === "Transfer") return <Badge className="bg-violet-600 text-white">Transfer</Badge>;
  if (method === "HMO") return <Badge className="bg-amber-600 text-white">HMO</Badge>;
  return <Badge variant="outline">{method}</Badge>;
}

function statusBadge(status: string) {
  if (status === "Completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (status === "Pending") return <Badge className="bg-amber-600 text-white">Pending</Badge>;
  if (status === "Cancelled") return <Badge className="bg-rose-600 text-white">Cancelled</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function OpticianSales() {
  const sales = useOpticianStore((s) => s.sales);
  const inventory = useOpticianStore((s) => s.inventory);
  const completeSale = useOpticianStore((s) => s.completeSale);
  const deductInventory = useOpticianStore((s) => s.deductInventory);

  const [detailSale, setDetailSale] = useState<string | null>(null);
  const [confirmComplete, setConfirmComplete] = useState<string | null>(null);

  const completedSales = sales.filter((s) => s.status === "Completed");
  const pendingSales = sales.filter((s) => s.status === "Pending");
  const totalRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);

  const handleCompleteSale = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (sale) {
      sale.items.forEach((item) => {
        const invItem = inventory.find((i) =>
          i.name.toLowerCase().includes(item.name.toLowerCase().split(" ")[0].toLowerCase())
        );
        if (invItem) {
          deductInventory(invItem.id, item.qty);
        }
      });
      completeSale(saleId);
    }
    setConfirmComplete(null);
  };

  const selectedSale = detailSale ? sales.find((s) => s.id === detailSale) : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Optical Sales"
        description="Manage product billing, inventory deduction, and sales reporting."
        actions={[
          { label: "Pending Sales", href: "#pending", variant: "primary" },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Total Revenue</p><p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">₦{totalRevenue.toLocaleString()}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 text-emerald-700"><TrendingUp size={20} /></div></CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Completed</p><p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-600">{completedSales.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={20} /></div></CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Pending</p><p className="mt-1 text-xl sm:text-2xl font-bold text-amber-600">{pendingSales.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 text-amber-700"><ShoppingCart size={20} /></div></CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Avg. Sale</p><p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">₦{completedSales.length ? Math.round(totalRevenue / completedSales.length).toLocaleString() : 0}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-sky-50 text-sky-700"><BarChart3 size={20} /></div></CardContent></Card>
      </div>

      <Card id="pending">
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Pending Sales</CardTitle>
          <Badge className="bg-amber-600 text-white">{pendingSales.length}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {pendingSales.map((s) => (
              <div key={s.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{s.patientName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                      <span className="font-mono">{s.id}</span>
                      <span className="text-slate-200">|</span>
                      <span>{s.items.length} item(s)</span>
                      <span className="text-slate-200">|</span>
                      <span>{s.date}</span>
                    </div>
                  </div>
                  <button onClick={() => setConfirmComplete(s.id)} className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white">Complete</button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold tabular-nums">₦{s.total.toLocaleString()}</p>
                  {paymentBadge(s.paymentMethod)}
                </div>
              </div>
            ))}
            {pendingSales.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No pending sales.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead><TableHead>Patient</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSales.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs font-mono text-slate-500">{s.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap"><button onClick={() => setDetailSale(s.id)} className="hover:text-amber-700 transition-colors text-left">{s.patientName}</button></TableCell>
                    <TableCell className="text-sm text-slate-600">{s.items.length} item(s)</TableCell>
                    <TableCell className="text-sm font-bold tabular-nums">₦{s.total.toLocaleString()}</TableCell>
                    <TableCell>{paymentBadge(s.paymentMethod)}</TableCell>
                    <TableCell className="text-xs text-slate-500">{s.date}</TableCell>
                    <TableCell className="text-right"><button onClick={() => setConfirmComplete(s.id)} className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap">Complete Sale</button></TableCell>
                  </TableRow>
                ))}
                {pendingSales.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-500 py-6">No pending sales.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Sales History</CardTitle>
          <Badge variant="secondary">{completedSales.length} completed</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {[...completedSales].reverse().map((s) => (
              <div key={s.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{s.patientName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                      <span className="font-mono">{s.id}</span>
                      <span className="text-slate-200">|</span>
                      <span>{s.items.length} item(s)</span>
                      <span className="text-slate-200">|</span>
                      <span>{s.date}</span>
                    </div>
                  </div>
                  {statusBadge(s.status)}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold tabular-nums">₦{s.total.toLocaleString()}</p>
                  {paymentBadge(s.paymentMethod)}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead><TableHead>Patient</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Payment</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...completedSales].reverse().map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-xs font-mono text-slate-500">{s.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap"><button onClick={() => setDetailSale(s.id)} className="hover:text-amber-700 transition-colors text-left">{s.patientName}</button></TableCell>
                    <TableCell className="text-sm text-slate-600">{s.items.length} item(s)</TableCell>
                    <TableCell className="text-sm font-bold tabular-nums">₦{s.total.toLocaleString()}</TableCell>
                    <TableCell>{paymentBadge(s.paymentMethod)}</TableCell>
                    <TableCell className="text-xs text-slate-500">{s.date}</TableCell>
                    <TableCell>{statusBadge(s.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!selectedSale} onClose={() => setDetailSale(null)} title="Sale Details">
        {selectedSale && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedSale.patientName}</h4>
                <p className="text-sm text-slate-500">{selectedSale.id} • {selectedSale.date}</p>
                <div className="mt-1 flex gap-2">
                  {paymentBadge(selectedSale.paymentMethod)}
                  {statusBadge(selectedSale.status)}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Items</p>
              <div className="space-y-2">
                {selectedSale.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-bold tabular-nums">₦{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3">
              <p className="text-sm font-bold text-slate-900">Total</p>
              <p className="text-lg font-bold text-amber-700">₦{selectedSale.total.toLocaleString()}</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!confirmComplete} onClose={() => setConfirmComplete(null)} title="Complete Sale">
        <p className="text-sm text-slate-600">
          Complete this sale? Inventory will be deducted automatically and the sale will be marked as completed.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={() => setConfirmComplete(null)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={() => confirmComplete && handleCompleteSale(confirmComplete)}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
            Complete Sale
          </button>
        </div>
      </Modal>
    </div>
  );
}
