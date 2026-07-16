"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { ShoppingBag, Cog, CheckCircle2, Truck, Eye, Plus, Clock } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useOpticianStore } from "@/app/optician/_mock/optician-store";
import type { LensOrderStatus } from "@/app/optician/_mock/optician-data";

function statusBadge(status: string) {
  if (status === "New") return <Badge className="bg-sky-600 text-white">New</Badge>;
  if (status === "In Production") return <Badge className="bg-amber-600 text-white">In Production</Badge>;
  if (status === "Ready") return <Badge className="bg-emerald-600 text-white">Ready</Badge>;
  if (status === "Delivered") return <Badge variant="secondary">Delivered</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function OpticianOrders() {
  const orders = useOpticianStore((s) => s.orders);
  const updateOrderStatus = useOpticianStore((s) => s.updateOrderStatus);

  const [detailOrder, setDetailOrder] = useState<string | null>(null);

  const newOrders = orders.filter((o) => o.status === "New");
  const inProduction = orders.filter((o) => o.status === "In Production");
  const ready = orders.filter((o) => o.status === "Ready");
  const delivered = orders.filter((o) => o.status === "Delivered");

  const advanceStatus = (id: string, current: LensOrderStatus) => {
    const next: Record<LensOrderStatus, LensOrderStatus | null> = {
      "New": "In Production",
      "In Production": "Ready",
      "Ready": "Delivered",
      "Delivered": null,
    };
    const nextStatus = next[current];
    if (nextStatus) updateOrderStatus(id, nextStatus);
  };

  const selectedOrder = detailOrder ? orders.find((o) => o.id === detailOrder) : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Lens Orders"
        description="Track all lens orders from new requests through production to delivery."
        actions={[
          { label: "New Orders", href: "#new", variant: "primary" },
          { label: "In Production", href: "#in-production" },
          { label: "Ready", href: "#ready" },
          { label: "Delivered", href: "#delivered" },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">New</p><p className="mt-1 text-xl sm:text-2xl font-bold text-sky-600">{newOrders.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-sky-50 text-sky-700"><ShoppingBag size={20} /></div></CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">In Production</p><p className="mt-1 text-xl sm:text-2xl font-bold text-amber-600">{inProduction.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 text-amber-700"><Cog size={20} /></div></CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Ready</p><p className="mt-1 text-xl sm:text-2xl font-bold text-emerald-600">{ready.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={20} /></div></CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Delivered</p><p className="mt-1 text-xl sm:text-2xl font-bold text-slate-600">{delivered.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 text-slate-600"><Truck size={20} /></div></CardContent></Card>
      </div>

      <Card id="new">
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">New Orders</CardTitle>
          <Badge className="bg-sky-600 text-white">{newOrders.length}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {newOrders.map((o) => (
              <div key={o.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{o.patientName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-mono text-slate-400">{o.id}</span>
                      <span className="text-slate-200">|</span>
                      <span className="text-[10px] text-slate-500 truncate">{o.lensType}</span>
                    </div>
                  </div>
                  <button onClick={() => advanceStatus(o.id, o.status)} className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white">Start</button>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500">
                  <span>Frame: {o.frameType}</span>
                  <span className="text-slate-200">|</span>
                  <span>Rx: {o.prescription}</span>
                  <span className="text-slate-200">|</span>
                  <span>{o.orderDate}</span>
                </div>
              </div>
            ))}
            {newOrders.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No new orders.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Lens Type</TableHead>
                  <TableHead>Frame</TableHead>
                  <TableHead>Rx</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs font-mono text-slate-500">{o.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap"><button onClick={() => setDetailOrder(o.id)} className="hover:text-amber-700 transition-colors text-left">{o.patientName}</button></TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-[160px] truncate">{o.lensType}</TableCell>
                    <TableCell className="text-sm text-slate-600">{o.frameType}</TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">{o.prescription}</TableCell>
                    <TableCell className="text-xs text-slate-400">{o.orderDate}</TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => advanceStatus(o.id, o.status)} className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700">Start Production</button>
                    </TableCell>
                  </TableRow>
                ))}
                {newOrders.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-500 py-6">No new orders.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card id="in-production">
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">In Production</CardTitle>
          <Badge className="bg-amber-600 text-white">{inProduction.length}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {inProduction.map((o) => (
              <div key={o.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{o.patientName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-mono text-slate-400">{o.id}</span>
                      <span className="text-slate-200">|</span>
                      <span className="text-[10px] text-slate-500 truncate">{o.lensType}</span>
                    </div>
                  </div>
                  <button onClick={() => advanceStatus(o.id, o.status)} className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white">Ready</button>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500">
                  <span>Frame: {o.frameType}</span>
                  <span className="text-slate-200">|</span>
                  <span>Est: {o.estimatedReady}</span>
                </div>
              </div>
            ))}
            {inProduction.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No orders in production.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Lens Type</TableHead>
                  <TableHead>Frame</TableHead>
                  <TableHead>Est. Ready</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inProduction.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs font-mono text-slate-500">{o.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap"><button onClick={() => setDetailOrder(o.id)} className="hover:text-amber-700 transition-colors text-left">{o.patientName}</button></TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-[160px] truncate">{o.lensType}</TableCell>
                    <TableCell className="text-sm text-slate-600">{o.frameType}</TableCell>
                    <TableCell className="text-xs text-slate-500">{o.estimatedReady}</TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => advanceStatus(o.id, o.status)} className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Mark Ready</button>
                    </TableCell>
                  </TableRow>
                ))}
                {inProduction.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-slate-500 py-6">No orders in production.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card id="ready">
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Ready for Pickup</CardTitle>
          <Badge className="bg-emerald-600 text-white">{ready.length}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {ready.map((o) => (
              <div key={o.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{o.patientName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-mono text-slate-400">{o.id}</span>
                      <span className="text-slate-200">|</span>
                      <span className="text-[10px] text-slate-500 truncate">{o.lensType}</span>
                    </div>
                  </div>
                  <button onClick={() => advanceStatus(o.id, o.status)} className="shrink-0 rounded-lg bg-sky-600 px-3 py-1.5 text-[10px] font-bold text-white">Deliver</button>
                </div>
                <div className="text-[10px] text-slate-500">Ready since: {o.estimatedReady}</div>
              </div>
            ))}
            {ready.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No orders ready for pickup.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Lens Type</TableHead>
                  <TableHead>Ready Since</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ready.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs font-mono text-slate-500">{o.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap"><button onClick={() => setDetailOrder(o.id)} className="hover:text-amber-700 transition-colors text-left">{o.patientName}</button></TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-[160px] truncate">{o.lensType}</TableCell>
                    <TableCell className="text-xs text-slate-500">{o.estimatedReady}</TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => advanceStatus(o.id, o.status)} className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700">Mark Delivered</button>
                    </TableCell>
                  </TableRow>
                ))}
                {ready.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-slate-500 py-6">No orders ready for pickup.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card id="delivered">
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Delivered</CardTitle>
          <Badge variant="secondary">{delivered.length}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {delivered.map((o) => (
              <div key={o.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <p className="font-medium text-slate-900 text-sm truncate">{o.patientName}</p>
                  <span className="text-[10px] text-slate-500">{o.estimatedReady}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-mono">{o.id}</span>
                  <span className="text-slate-200">|</span>
                  <span className="truncate">{o.lensType}</span>
                </div>
              </div>
            ))}
            {delivered.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No delivered orders.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Lens Type</TableHead>
                  <TableHead>Delivered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delivered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs font-mono text-slate-500">{o.id}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap"><button onClick={() => setDetailOrder(o.id)} className="hover:text-amber-700 transition-colors text-left">{o.patientName}</button></TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-[160px] truncate">{o.lensType}</TableCell>
                    <TableCell className="text-xs text-slate-500">{o.estimatedReady}</TableCell>
                  </TableRow>
                ))}
                {delivered.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">No delivered orders.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!selectedOrder} onClose={() => setDetailOrder(null)} title="Order Details">
        {selectedOrder && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                <Eye size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedOrder.patientName}</h4>
                <p className="text-sm text-slate-500">{selectedOrder.id}</p>
                {statusBadge(selectedOrder.status)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Lens Type</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedOrder.lensType}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Frame</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedOrder.frameType}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Prescription</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">{selectedOrder.prescription}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Order Date</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedOrder.orderDate}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Ready</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedOrder.estimatedReady}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                <p className="mt-0.5">{statusBadge(selectedOrder.status)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {selectedOrder.status === "New" && (
                <button onClick={() => { advanceStatus(selectedOrder.id, selectedOrder.status); setDetailOrder(null); }}
                  className="flex-1 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors">
                  Start Production
                </button>
              )}
              {selectedOrder.status === "In Production" && (
                <button onClick={() => { advanceStatus(selectedOrder.id, selectedOrder.status); setDetailOrder(null); }}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                  Mark Ready
                </button>
              )}
              {selectedOrder.status === "Ready" && (
                <button onClick={() => { advanceStatus(selectedOrder.id, selectedOrder.status); setDetailOrder(null); }}
                  className="flex-1 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-700 transition-colors">
                  Mark Delivered
                </button>
              )}
              <Link href={`/optician/production?order=${selectedOrder.id}`}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors text-center">
                View Production
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
