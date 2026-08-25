"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Truck, Building2, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { usePharmacyStore } from "@/app/pharmacy/_mock/pharmacy-store";
import type { Supplier, PurchaseOrder } from "@/app/pharmacy/_mock/pharmacy-data";

function statusBadge(status: string) {
  if (status === "Pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "Delivered") return <Badge className="bg-emerald-600 text-white">Delivered</Badge>;
  if (status === "Cancelled") return <Badge className="bg-rose-600 text-white">Cancelled</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function PharmacySuppliers() {
  const suppliers = usePharmacyStore((s) => s.suppliers);
  const purchaseOrders = usePharmacyStore((s) => s.purchaseOrders);
  const drugs = usePharmacyStore((s) => s.drugs);
  const addPurchaseOrder = usePharmacyStore((s) => s.addPurchaseOrder);
  const deliverPurchaseOrder = usePharmacyStore((s) => s.deliverPurchaseOrder);
  const restockDrug = usePharmacyStore((s) => s.restockDrug);

  const [newOrderModal, setNewOrderModal] = useState(false);
  const [newOrderSupplier, setNewOrderSupplier] = useState("");
  const [newOrderDrugId, setNewOrderDrugId] = useState("");
  const [newOrderQty, setNewOrderQty] = useState(0);
  const [newOrderUnitPrice, setNewOrderUnitPrice] = useState(0);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);

  const pendingOrders = purchaseOrders.filter((po) => po.status === "Pending");

  const handleCreateOrder = () => {
    if (!newOrderSupplier || !newOrderDrugId || newOrderQty <= 0 || newOrderUnitPrice <= 0) return;
    const drug = drugs.find((d) => d.id === newOrderDrugId);
    if (!drug) return;
    const supplier = suppliers.find((s) => s.id === newOrderSupplier);
    const po: PurchaseOrder = {
      id: `PO-${Date.now().toString(36).toUpperCase()}`,
      supplierId: newOrderSupplier,
      supplierName: supplier?.name || "Unknown",
      drugs: [{ name: drug.name, qty: newOrderQty, unitPrice: newOrderUnitPrice }],
      total: newOrderQty * newOrderUnitPrice,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };
    addPurchaseOrder(po);
    setNewOrderModal(false);
    setNewOrderSupplier("");
    setNewOrderDrugId("");
    setNewOrderQty(0);
    setNewOrderUnitPrice(0);
  };

  const handleDeliver = (po: PurchaseOrder) => {
    deliverPurchaseOrder(po.id);
    po.drugs.forEach((d) => {
      const matched = drugs.find((dd) => dd.name === d.name);
      if (matched) restockDrug(matched.id, d.qty);
    });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Supplier Management" description="Manage drug suppliers, purchase orders, and restocking."
        actions={[{ label: "New Purchase Order", variant: "primary", onClick: () => setNewOrderModal(true) }]} />

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
                    <p className="text-xs text-slate-400">{s.contact}</p>
                  </div>
                  <Badge variant="outline">{s.drugCategories.length} categories</Badge>
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Phone size={12} /> {s.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={12} /> {s.email}</span>
                </div>
              </div>
            ))}
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
                    <TableHead>PO ID</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="text-xs font-mono text-slate-500">{po.id}</TableCell>
                      <TableCell className="text-sm text-slate-900">{po.supplierName}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {po.drugs.map((d) => `${d.name} x${d.qty}`).join(", ")}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-900">${po.total.toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-slate-500">{po.date}</TableCell>
                      <TableCell>{statusBadge(po.status)}</TableCell>
                      <TableCell className="text-right">
                        {po.status === "Pending" && (
                          <button onClick={() => handleDeliver(po)}
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                            <CheckCircle2 size={12} className="mr-1" /> Deliver
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {purchaseOrders.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-500 py-6">No purchase orders.</TableCell></TableRow>}
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
                <p className="text-sm text-slate-500">{detailSupplier.contact}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-slate-600"><Phone size={14} /> {detailSupplier.phone}</div>
              <div className="flex items-center gap-3 text-sm text-slate-600"><Mail size={14} /> {detailSupplier.email}</div>
              <div className="flex items-center gap-3 text-sm text-slate-600"><MapPin size={14} /> {detailSupplier.address}</div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Drug Categories</p>
              <div className="flex flex-wrap gap-1.5">
                {detailSupplier.drugCategories.map((cat) => (
                  <Badge key={cat} variant="outline">{cat}</Badge>
                ))}
              </div>
            </div>
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
              {drugs.map((d) => <option key={d.id} value={d.id}>{d.name} (Stock: {d.quantity})</option>)}
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unit Price ($)</label>
              <input type="number" min={0.01} step={0.01}
                value={newOrderUnitPrice || ""}
                onChange={(e) => setNewOrderUnitPrice(parseFloat(e.target.value) || 0)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white" />
            </div>
          </div>
          {newOrderQty > 0 && newOrderUnitPrice > 0 && (
            <div className="rounded-xl bg-emerald-50 p-3 flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-800">Total</span>
              <span className="text-sm font-bold text-emerald-800">${(newOrderQty * newOrderUnitPrice).toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => { setNewOrderModal(false); setNewOrderSupplier(""); setNewOrderDrugId(""); setNewOrderQty(0); setNewOrderUnitPrice(0); }}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">Cancel</button>
            <button onClick={handleCreateOrder} disabled={!newOrderSupplier || !newOrderDrugId || newOrderQty <= 0 || newOrderUnitPrice <= 0}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">Create Order</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
