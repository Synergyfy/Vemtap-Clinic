"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useLensOrders, useUpdateLensOrderStatus } from "@/hooks/useOptician";
import { AlertTriangle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800",
  processing: "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
  delivered: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, string> = {
  pending: "New",
  processing: "In Production",
  ready: "Ready",
  delivered: "Delivered",
};

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders = [], isLoading } = useLensOrders();
  const updateStatus = useUpdateLensOrderStatus();
  const [detailOrder, setDetailOrder] = useState<string | null>(null);

  const handleAdvance = (orderId: string, currentStatus: string) => {
    const flow: Record<string, string> = {
      pending: "processing",
      processing: "ready",
      ready: "delivered",
    };
    const next = flow[currentStatus];
    if (next) {
      updateStatus.mutate({ orderId, status: next });
    }
  };

  const handleMarkReady = (orderId: string) => {
    updateStatus.mutate({ orderId, status: "ready" });
  };

  const selectedOrder = orders.find((o) => o.id === detailOrder);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Optician Orders"
        description="All lens and frame orders sorted by urgency (earliest due date first)."
        actions={[{ label: "Production Queue", href: "/optician/production", variant: "default" }]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {(["pending", "processing", "ready", "delivered"] as const).map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500">{statusLabels[status]}</p>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="px-4 py-3 flex-row items-center gap-2 border-b border-slate-100">
              <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <button onClick={() => setDetailOrder(order.id)} className="font-medium text-slate-900 text-sm hover:text-amber-700 transition-colors truncate text-left">{order.patient?.firstName} {order.patient?.lastName}</button>
                <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{order.lensType}</span>
              </div>
              <div className="text-xs text-slate-500 mb-2">Due: {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "—"}</div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">{order.frameDescription}</span>
                {order.status !== "delivered" ? (
                  <button onClick={() => handleAdvance(order.id, order.status)} className="rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white">Advance</button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">✓Complete</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No orders found.</p>}
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Lens Type</TableHead>
              <TableHead>Frame</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                  <button onClick={() => setDetailOrder(order.id)} className="hover:text-amber-700 transition-colors text-left">{order.patient?.firstName} {order.patient?.lastName}</button>
                </TableCell>
                <TableCell className="text-sm text-slate-600 whitespace-nowrap">{order.lensType}</TableCell>
                <TableCell className="text-sm text-slate-600 whitespace-nowrap">{order.frameDescription}</TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status]}>{statusLabels[order.status]}</Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-500 whitespace-nowrap">{order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "—"}</TableCell>
                <TableCell className="text-right space-x-2">
                  {order.status !== "delivered" ? (
                    <>
                      <button onClick={() => handleAdvance(order.id, order.status)} className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 whitespace-nowrap">Advance</button>
                      {order.status === "pending" && (
                        <button onClick={() => handleMarkReady(order.id)} className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap">Mark Ready</button>
                      )}
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">✓Complete</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-slate-500 py-6">No orders found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={!!selectedOrder} onClose={() => setDetailOrder(null)} title="Order Details">
        {selectedOrder && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedOrder.patient?.firstName} {selectedOrder.patient?.lastName}</h4>
                <p className="text-sm text-slate-500">{selectedOrder.lensType}</p>
                <div className="mt-1"><Badge className={statusColors[selectedOrder.status]}>{statusLabels[selectedOrder.status]}</Badge></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Frame</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedOrder.frameDescription}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Price</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">₦{selectedOrder.totalPrice.toLocaleString()}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{selectedOrder.expectedDeliveryDate ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() : "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Order ID</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">{selectedOrder.id.slice(0, 8)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900">Update Status</h4>
              <div className="flex gap-2">
                {selectedOrder.status !== "delivered" && (
                  <button
                    onClick={() => { handleAdvance(selectedOrder.id, selectedOrder.status); setDetailOrder(null); }}
                    className="flex-1 inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors"
                  >
                    Advance to {statusLabels[{ pending: "processing", processing: "ready", ready: "delivered" }[selectedOrder.status]]}
                  </button>
                )}
                {selectedOrder.status === "delivered" && (
                  <div className="flex-1 rounded-xl bg-emerald-100 p-3 text-center text-sm font-bold text-emerald-800">Completed</div>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push(`/optician/production?order=${selectedOrder.id}`)}
              className="w-full inline-flex items-center justify-center rounded-xl bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              View Production Tracking
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
