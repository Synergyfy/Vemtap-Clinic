"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { PackageSearch, AlertTriangle, CheckCircle2, Eye, Plus } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useOpticianStore } from "@/app/optician/_mock/optician-store";

function statusBadge(status: string) {
  if (status === "Frame") return <Badge className="bg-sky-600 text-white">Frame</Badge>;
  if (status === "Lens") return <Badge className="bg-violet-600 text-white">Lens</Badge>;
  if (status === "Accessory") return <Badge className="bg-emerald-600 text-white">Accessory</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function OpticianInventory() {
  const inventory = useOpticianStore((s) => s.inventory);
  const deductInventory = useOpticianStore((s) => s.deductInventory);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [deductQty, setDeductQty] = useState(1);
  const [deductSuccess, setDeductSuccess] = useState("");

  const frames = inventory.filter((i) => i.category === "Frame");
  const lenses = inventory.filter((i) => i.category === "Lens");
  const accessories = inventory.filter((i) => i.category === "Accessory");
  const lowStock = inventory.filter((i) => i.quantity <= i.minStock);

  const handleDeduct = () => {
    if (!selectedItem || deductQty < 1) return;
    deductInventory(selectedItem, deductQty);
    setDeductSuccess(`Deducted ${deductQty} unit(s)`);
    setTimeout(() => { setDeductSuccess(""); setSelectedItem(null); setDeductQty(1); }, 1200);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Frame & Lens Inventory"
        description="Manage frames, lenses, accessories, and monitor stock levels."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Total Items</p><p className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">{inventory.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 text-slate-700"><PackageSearch size={20} /></div></CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Frames</p><p className="mt-1 text-xl sm:text-2xl font-bold text-sky-600">{frames.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-sky-50 text-sky-700"><Eye size={20} /></div></CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Lenses</p><p className="mt-1 text-xl sm:text-2xl font-bold text-violet-600">{lenses.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-violet-50 text-violet-700"><Eye size={20} /></div></CardContent></Card>
        <Card><CardContent className="p-4 sm:p-6 flex items-center justify-between"><div><p className="text-xs font-medium text-slate-500">Low Stock</p><p className="mt-1 text-xl sm:text-2xl font-bold text-rose-600">{lowStock.length}</p></div><div className="p-2.5 sm:p-3 rounded-xl bg-rose-50 text-rose-700"><AlertTriangle size={20} /></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Frames</CardTitle>
            <Badge className="bg-sky-600 text-white">{frames.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {frames.map((f) => (
                <div key={f.id} className="p-4">
                  <div className="flex items-center justify-between gap-3"><p className="font-medium text-slate-900 text-sm truncate">{f.name}</p><Badge className={f.quantity <= f.minStock ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}>{f.quantity}</Badge></div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500"><span>{f.brand}</span><span className="text-slate-200">|</span><span>₦{f.unitPrice.toLocaleString()}</span></div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Brand</TableHead><TableHead>Stock</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader><TableBody>{frames.map((f) => (<TableRow key={f.id}><TableCell className="font-medium text-slate-900 whitespace-nowrap">{f.name}</TableCell><TableCell className="text-sm text-slate-600">{f.brand}</TableCell><TableCell><Badge className={f.quantity <= f.minStock ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}>{f.quantity}</Badge></TableCell><TableCell className="text-right text-sm font-medium tabular-nums">₦{f.unitPrice.toLocaleString()}</TableCell></TableRow>))}</TableBody></Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Lenses</CardTitle>
            <Badge className="bg-violet-600 text-white">{lenses.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {lenses.map((l) => (
                <div key={l.id} className="p-4">
                  <div className="flex items-center justify-between gap-3"><p className="font-medium text-slate-900 text-sm truncate">{l.name}</p><Badge className={l.quantity <= l.minStock ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}>{l.quantity}</Badge></div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500"><span>{l.brand}</span><span className="text-slate-200">|</span><span>₦{l.unitPrice.toLocaleString()}</span></div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Brand</TableHead><TableHead>Stock</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader><TableBody>{lenses.map((l) => (<TableRow key={l.id}><TableCell className="font-medium text-slate-900 whitespace-nowrap">{l.name}</TableCell><TableCell className="text-sm text-slate-600">{l.brand}</TableCell><TableCell><Badge className={l.quantity <= l.minStock ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}>{l.quantity}</Badge></TableCell><TableCell className="text-right text-sm font-medium tabular-nums">₦{l.unitPrice.toLocaleString()}</TableCell></TableRow>))}</TableBody></Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Accessories</CardTitle>
            <Badge className="bg-emerald-600 text-white">{accessories.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {accessories.map((a) => (
                <div key={a.id} className="p-4">
                  <div className="flex items-center justify-between gap-3"><p className="font-medium text-slate-900 text-sm truncate">{a.name}</p><Badge className={a.quantity <= a.minStock ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}>{a.quantity}</Badge></div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500"><span>{a.brand}</span><span className="text-slate-200">|</span><span>₦{a.unitPrice.toLocaleString()}</span></div>
                </div>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Brand</TableHead><TableHead>Stock</TableHead><TableHead className="text-right">Price</TableHead></TableRow></TableHeader><TableBody>{accessories.map((a) => (<TableRow key={a.id}><TableCell className="font-medium text-slate-900 whitespace-nowrap">{a.name}</TableCell><TableCell className="text-sm text-slate-600">{a.brand}</TableCell><TableCell><Badge className={a.quantity <= a.minStock ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}>{a.quantity}</Badge></TableCell><TableCell className="text-right text-sm font-medium tabular-nums">₦{a.unitPrice.toLocaleString()}</TableCell></TableRow>))}</TableBody></Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertTriangle size={18} className="text-rose-500" />
            Low Stock Alerts
          </CardTitle>
          <Badge className="bg-rose-600 text-white">{lowStock.length}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {lowStock.map((i) => (
              <div key={i.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{i.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                      <span>{i.brand}</span>
                      <span className="text-slate-200">|</span>
                      <span>{i.location}</span>
                    </div>
                  </div>
                  <Badge className={i.quantity === 0 ? "bg-rose-600 text-white" : "bg-amber-600 text-white"}>{i.quantity}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>{statusBadge(i.category)}</span>
                    <span>Min: {i.minStock}</span>
                  </div>
                  <button onClick={() => { setSelectedItem(i.id); setDeductQty(1); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50">Deduct</button>
                </div>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-center text-sm text-slate-500 py-6">All items adequately stocked.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Brand</TableHead><TableHead>Current</TableHead><TableHead>Min Stock</TableHead><TableHead>Location</TableHead><TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{i.name}</TableCell>
                    <TableCell>{statusBadge(i.category)}</TableCell>
                    <TableCell className="text-sm text-slate-600">{i.brand}</TableCell>
                    <TableCell><Badge className={i.quantity === 0 ? "bg-rose-600 text-white" : "bg-amber-600 text-white"}>{i.quantity}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-500">{i.minStock}</TableCell>
                    <TableCell className="text-xs text-slate-500">{i.location}</TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => { setSelectedItem(i.id); setDeductQty(1); }} className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap">Deduct</button>
                    </TableCell>
                  </TableRow>
                ))}
                {lowStock.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-500 py-6">All items adequately stocked.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!selectedItem} onClose={() => { setSelectedItem(null); setDeductSuccess(""); }} title="Deduct Inventory">
        {deductSuccess ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-700">{deductSuccess}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-slate-600">
              Reduce stock quantity for <strong>{inventory.find((i) => i.id === selectedItem)?.name}</strong>.
            </p>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Quantity to deduct</label>
              <input
                type="number"
                min={1}
                max={inventory.find((i) => i.id === selectedItem)?.quantity || 1}
                value={deductQty}
                onChange={(e) => setDeductQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <button
              onClick={handleDeduct}
              disabled={deductQty < 1}
              className="w-full inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Deduct Stock
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
