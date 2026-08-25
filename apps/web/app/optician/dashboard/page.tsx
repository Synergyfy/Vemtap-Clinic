"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, Cog, PackageSearch, AlertTriangle, CheckCircle2, Truck, Eye } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useOpticianStore } from "@/app/optician/_mock/optician-store";

function statusBadge(status: string) {
  if (status === "New") return <Badge className="bg-sky-600 text-white">New</Badge>;
  if (status === "In Production") return <Badge className="bg-amber-600 text-white">In Production</Badge>;
  if (status === "Ready") return <Badge className="bg-emerald-600 text-white">Ready</Badge>;
  if (status === "Delivered") return <Badge variant="secondary">Delivered</Badge>;
  if (status === "Order Received") return <Badge className="bg-slate-600 text-white">Order Received</Badge>;
  if (status === "Production Started") return <Badge className="bg-amber-600 text-white">Production Started</Badge>;
  if (status === "Quality Check") return <Badge className="bg-violet-600 text-white">Quality Check</Badge>;
  if (status === "Ready for Pickup") return <Badge className="bg-emerald-600 text-white">Ready for Pickup</Badge>;
  if (status === "Low") return <Badge className="bg-rose-600 text-white">Low</Badge>;
  if (status === "In Stock") return <Badge className="bg-emerald-600 text-white">In Stock</Badge>;
  if (status === "Critical") return <Badge className="bg-rose-600 text-white">Critical</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function OpticianDashboard() {
  const router = useRouter();
  const orders = useOpticianStore((s) => s.orders);
  const inventory = useOpticianStore((s) => s.inventory);
  const production = useOpticianStore((s) => s.production);
  const updateOrderStatus = useOpticianStore((s) => s.updateOrderStatus);
  const completeSale = useOpticianStore((s) => s.completeSale);

  const [toast, setToast] = useState("");
  const [pickupModal, setPickupModal] = useState<string | null>(null);
  const [saleModal, setSaleModal] = useState<any>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const newOrders = orders.filter((o) => o.status === "New");
  const inProduction = orders.filter((o) => o.status === "In Production");
  const readyForPickup = orders.filter((o) => o.status === "Ready");
  const lowStock = inventory.filter((i) => i.quantity <= i.minStock);
  const inProductionStage = production.filter((p) => p.stage !== "Ready for Pickup");
  const pickupReady = production.filter((p) => p.stage === "Ready for Pickup");

  const markDelivered = (orderId: string) => {
    updateOrderStatus(orderId, "Delivered");
    setPickupModal(null);
    showToast("Order marked as delivered");
  };

  const pickupPatient = pickupModal ? production.find((p) => p.id === pickupModal) : null;

  return (
    <div className="space-y-6 md:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-amber-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-amber-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader
        title="Optical Dashboard"
        description="Welcome back, Opt. Danladi. Manage lens orders, production, inventory, and sales."
        actions={[
          { label: "New Order", href: "/optician/orders", variant: "primary" },
          { label: "View Inventory", href: "/optician/inventory" },
        ]}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 lg:grid-cols-5">
        <Card onClick={() => router.push("/optician/orders")} className="hover:border-amber-200 transition-all cursor-pointer group">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">New Orders</p>
              <p className="mt-1 text-xl font-bold text-sky-600">{newOrders.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700"><ShoppingBag size={18} /></div>
          </CardContent>
        </Card>
        <Card onClick={() => router.push("/optician/production")} className="hover:border-amber-200 transition-all cursor-pointer group">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">In Production</p>
              <p className="mt-1 text-xl font-bold text-amber-600">{inProduction.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700"><Cog size={18} /></div>
          </CardContent>
        </Card>
        <Card onClick={() => router.push("/optician/orders")} className="hover:border-amber-200 transition-all cursor-pointer group">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Ready for Pickup</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">{readyForPickup.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={18} /></div>
          </CardContent>
        </Card>
        <Card onClick={() => router.push("/optician/inventory")} className="hover:border-amber-200 transition-all cursor-pointer group">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Low Stock Items</p>
              <p className="mt-1 text-xl font-bold text-rose-600">{lowStock.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700"><AlertTriangle size={18} /></div>
          </CardContent>
        </Card>
        <Card onClick={() => router.push("/optician/production")} className="hover:border-amber-200 transition-all cursor-pointer group">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Production</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{inProductionStage.length}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-700"><PackageSearch size={18} /></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Pending Lens Orders</CardTitle>
            <Link href="/optician/orders" className="text-xs sm:text-sm font-medium text-amber-700 hover:text-amber-800">All Orders</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {orders.filter((o) => o.status !== "Delivered").slice(0, 5).map((o) => (
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
                    {statusBadge(o.status)}
                  </div>
                  <Link href={`/optician/production?order=${o.id}`} className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700 w-full mt-2">
                    {o.status === "New" ? "Start Production" : "Track"}
                  </Link>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Lens Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.filter((o) => o.status !== "Delivered").slice(0, 5).map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs font-mono text-slate-500">{o.id}</TableCell>
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">{o.patientName}</TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-[160px] truncate">{o.lensType}</TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/optician/production?order=${o.id}`} className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 whitespace-nowrap">
                          {o.status === "New" ? "Start Production" : "Track"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Production Queue</CardTitle>
            <Link href="/optician/production" className="text-xs sm:text-sm font-medium text-amber-700 hover:text-amber-800">Full Queue</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {inProductionStage.slice(0, 4).map((p) => (
              <div key={p.id} onClick={() => router.push(`/optician/production?order=${p.orderId}`)} className="rounded-xl border border-slate-200 p-4 hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{p.patientName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{p.lensType}</p>
                  </div>
                  <div className="shrink-0">{statusBadge(p.stage)}</div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Due: {p.estimatedCompletion}</span>
                  <span>Assigned: {p.assignedTo}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Ready for Pickup</CardTitle>
            <Link href="/optician/orders" className="text-xs sm:text-sm font-medium text-amber-700 hover:text-amber-800">Manage</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {pickupReady.slice(0, 3).map((p) => (
              <div key={p.id} onClick={() => setPickupModal(p.id)} className="rounded-xl border border-slate-200 p-4 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer">
                <p className="font-semibold text-slate-900">{p.patientName}</p>
                <p className="mt-1 text-xs text-slate-500">{p.lensType}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 size={14} />
                  Ready since {p.estimatedCompletion}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Inventory Alerts</CardTitle>
            <Link href="/optician/inventory" className="text-xs sm:text-sm font-medium text-amber-700 hover:text-amber-800">View All</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {lowStock.slice(0, 4).map((item) => (
              <div key={item.id} onClick={() => router.push("/optician/inventory")} className="rounded-xl border border-slate-200 p-4 hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.brand} &bull; {item.location}</p>
                  </div>
                  <div className="shrink-0">
                    <Badge className={item.quantity === 0 ? "bg-rose-600 text-white" : "bg-amber-600 text-white"}>{item.quantity} left</Badge>
                  </div>
                </div>
                <div className="mt-2 text-xs text-rose-600 font-medium">Min stock: {item.minStock} &mdash; Reorder needed</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Recent Sales</CardTitle>
            <Link href="/optician/sales" className="text-xs sm:text-sm font-medium text-amber-700 hover:text-amber-800">View All</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {[useOpticianStore.getState().sales[0], useOpticianStore.getState().sales[1]].filter(Boolean).map((s) => s && (
              <div key={s.id} onClick={() => setSaleModal(s)} className="rounded-xl border border-slate-200 p-4 hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{s.patientName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{s.date} &bull; {s.paymentMethod}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-900">₦{s.total.toLocaleString()}</p>
                    <Badge className={s.status === "Completed" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}>{s.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Pickup Confirmation Modal */}
      <Modal isOpen={!!pickupModal} onClose={() => setPickupModal(null)} title="Mark as Delivered">
        {pickupPatient && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700"><Truck size={24} /></div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{pickupPatient.patientName}</h4>
                <p className="text-sm text-slate-500">{pickupPatient.lensType}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">Confirm that this order has been picked up by the patient. This will mark the status as <strong>Delivered</strong>.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPickupModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => markDelivered(pickupPatient.orderId)} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Confirm Delivery</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Sale Detail Modal */}
      <Modal isOpen={!!saleModal} onClose={() => setSaleModal(null)} title="Sale Details">
        {saleModal && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-700"><ShoppingBag size={24} /></div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{saleModal.patientName}</h4>
                <p className="text-sm text-slate-500">{saleModal.date} &bull; {saleModal.paymentMethod}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold text-slate-400 uppercase">Total</p><p className="mt-0.5 text-sm font-bold text-slate-900">₦{saleModal.total.toLocaleString()}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold text-slate-400 uppercase">Status</p><div className="mt-0.5">{statusBadge(saleModal.status)}</div></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold text-slate-400 uppercase">Sale ID</p><p className="mt-0.5 text-sm font-bold text-slate-900 font-mono">{saleModal.id}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-bold text-slate-400 uppercase">Method</p><p className="mt-0.5 text-sm font-bold text-slate-900">{saleModal.paymentMethod}</p></div>
            </div>
            {saleModal.status !== "Completed" && (
              <button onClick={() => { completeSale(saleModal.id); setSaleModal(null); showToast("Sale marked as completed"); }} className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
                Mark as Completed
              </button>
            )}
            <div className="flex justify-end pt-2"><button onClick={() => setSaleModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Close</button></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
