"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Truck, Building2, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import {
  useSuppliers,
  usePurchaseOrders,
  useDrugs,
  useCreatePurchaseOrder,
  useDeliverPurchaseOrder,
} from "@/hooks/usePharmacy";
import type { Supplier, PurchaseOrder } from "@/hooks/usePharmacy";

function statusBadge(status: string) {
  const s = status?.toLowerCase();
  if (s === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (s === "approved") return <Badge className="bg-sky-600 text-white">Approved</Badge>;
  if (s === "received" || s === "delivered") return <Badge className="bg-emerald-600 text-white">Delivered</Badge>;
  if (s === "cancelled") return <Badge className="bg-rose-600 text-white">Cancelled</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function PharmacySuppliers() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || null;

  const { data: suppliers = [] } = useSuppliers(clinicId);
  const { data: purchaseOrders = [] } = usePurchaseOrders(clinicId);
  const { data: drugs = [] } = useDrugs(clinicId);
  const createOrderMutation = useCreatePurchaseOrder();
  const deliverMutation = useDeliverPurchaseOrder();

  const [newOrderModal, setNewOrderModal] = useState(false);
  const [newOrderSupplier, setNewOrderSupplier] = useState("");
  const [newOrderDrugId, setNewOrderDrugId] = useState("");
  const [newOrderQty, setNewOrderQty] = useState(0);
  const [newOrderUnitPrice, setNewOrderUnitPrice] = useState(0);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const pendingOrders = purchaseOrders.filter((po) => po.status === "pending");

  const handleCreateOrder = async () => {
    if (!newOrderSupplier || !newOrderDrugId || newOrderQty <= 0 || newOrderUnitPrice <= 0 || !clinicId) return;
    const drug = drugs.find((d) => d.id === newOrderDrugId);
    if (!drug) return;

    const items = JSON.stringify([{ item: drug.name, qty: newOrderQty, price: newOrderUnitPrice }]);
    const orderNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

    try {
      await createOrderMutation.mutateAsync({
        orderNumber,
        items,
        totalAmount: newOrderQty * newOrderUnitPrice,
        supplierId: newOrderSupplier,
        clinicId,
      });
      showToast("Purchase order created");
      setNewOrderModal(false);
      setNewOrderSupplier("");
      setNewOrderDrugId("");
      setNewOrderQty(0);
      setNewOrderUnitPrice(0);
    } catch {
      showToast("Failed to create order");
    }
  };

  const handleDeliver = async (po: PurchaseOrder) => {
    try {
      await deliverMutation.mutateAsync(po.id);
      showToast(`Order ${po.orderNumber} marked as delivered`);
    } catch {
      showToast("Failed to deliver order");
    }
  };

  const parseItems = (items: string): { item: string; qty: number; price: number }[] => {
    try { return JSON.parse(items); } catch { return []; }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader title="Supplier Management" description="Manage drug suppliers, purchase orders, and restocking."
        actions={[{ label: "New Purchase Order", variant: "default", onClick: () => setNewOrderModal(true) }]} />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Building2 size={18} /> Supplier Directory</CardTitle>
            <Badge className="bg-teal-600 text-white">{suppliers.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {suppliers.map((s) => (
              <div key={s.id}
                className="rounded-xl border border-slate-200 p-3 cursor-pointer hover:border-teal-300 transition-colors"
                onClick={() => setDetailSupplier(s)}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.contactPerson || ""}</p>
                  </div>
                  {s.products && <Badge variant="outline">{s.products}</Badge>}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                  {s.phone && <span className="flex items-center gap-1"><Phone size={12} /> {s.phone}</span>}
                  {s.email && <span className="flex items-center gap-1"><Mail size={12} /> {s.email}</span>}
                </div>
              </div>
            ))}
            {suppliers.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No suppliers found</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Truck size={18} /> Purchase Orders</CardTitle>
            <Badge className="bg-amber-600 text-white">{pendingOrders.length} pending</Badge>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => {
                    const items = parseItems(po.items);
                    return (
                      <TableRow key={po.id}>
                        <TableCell className="text-xs font-mono text-slate-500">{po.orderNumber}</TableCell>
                        <TableCell className="text-sm text-slate-900">{po.supplier?.name || "—"}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {items.map((d) => `${d.item} x${d.qty}`).join(", ") || "—"}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-900">₦{po.totalAmount.toLocaleString()}</TableCell>
                        <TableCell>{statusBadge(po.status)}</TableCell>
                        <TableCell className="text-right">
                          {po.status === "pending" && (
                            <button onClick={() => handleDeliver(po)} disabled={deliverMutation.isPending}
                              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50">
                              <CheckCircle2 size={12} className="mr-1" /> Deliver
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {purchaseOrders.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-slate-500 py-6">No purchase orders.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal isOpen={!!detailSupplier} onClose={() => setDetailSupplier(null)} title="Supplier Details">
        {detailSupplier && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-700"><Building2 size={24} /></div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{detailSupplier.name}</h4>
                <p className="text-sm text-slate-500">{detailSupplier.contactPerson || ""}</p>
              </div>
            </div>
            <div className="space-y-2">
              {detailSupplier.phone && <div className="flex items-center gap-3 text-sm text-slate-600"><Phone size={14} /> {detailSupplier.phone}</div>}
              {detailSupplier.email && <div className="flex items-center gap-3 text-sm text-slate-600"><Mail size={14} /> {detailSupplier.email}</div>}
              {detailSupplier.address && <div className="flex items-center gap-3 text-sm text-slate-600"><MapPin size={14} /> {detailSupplier.address}{detailSupplier.city ? `, ${detailSupplier.city}` : ""}{detailSupplier.state ? `, ${detailSupplier.state}` : ""}</div>}
            </div>
            {detailSupplier.products && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Products</p>
                <p className="text-sm text-slate-700">{detailSupplier.products}</p>
              </div>
            )}
            <button onClick={() => { setNewOrderSupplier(detailSupplier.id); setNewOrderModal(true); setDetailSupplier(null); }}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
              Create Order from {detailSupplier.name}
            </button>
          </div>
        )}
      </Modal>

      <Modal isOpen={newOrderModal} onClose={() => { setNewOrderModal(false); setNewOrderSupplier(""); setNewOrderDrugId(""); setNewOrderQty(0); setNewOrderUnitPrice(0); }} title="New Purchase Order">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Supplier</label>
            <select value={newOrderSupplier} onChange={(e) => setNewOrderSupplier(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500">
              <option value="">Select supplier...</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Drug</label>
            <select value={newOrderDrugId} onChange={(e) => {
              setNewOrderDrugId(e.target.value);
              const drug = drugs.find((d) => d.id === e.target.value);
              if (drug) setNewOrderUnitPrice(drug.unitPrice);
            }}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-emerald-500">
              <option value="">Select drug...</option>
              {drugs.map((d) => <option key={d.id} value={d.id}>{d.name} (Stock: {d.quantityInStock})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity</label>
              <input type="number" min={1}
                value={newOrderQty || ""}
                onChange={(e) => setNewOrderQty(parseInt(e.target.value) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unit Price (₦)</label>
              <input type="number" min={1} step={1}
                value={newOrderUnitPrice || ""}
                onChange={(e) => setNewOrderUnitPrice(parseFloat(e.target.value) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white" />
            </div>
          </div>
          {newOrderQty > 0 && newOrderUnitPrice > 0 && (
            <div className="rounded-xl bg-emerald-50 p-3 flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-800">Total</span>
              <span className="text-sm font-bold text-emerald-800">₦{(newOrderQty * newOrderUnitPrice).toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { setNewOrderModal(false); setNewOrderSupplier(""); setNewOrderDrugId(""); setNewOrderQty(0); setNewOrderUnitPrice(0); }}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">Cancel</button>
            <button onClick={handleCreateOrder} disabled={!newOrderSupplier || !newOrderDrugId || newOrderQty <= 0 || newOrderUnitPrice <= 0 || createOrderMutation.isPending}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {createOrderMutation.isPending ? "Creating..." : "Create Order"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
