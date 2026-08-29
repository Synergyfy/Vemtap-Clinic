"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { AlertTriangle, Calendar, PackageSearch, Search, Pill, FlaskConical, Syringe, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useDrugs, useRestockDrug } from "@/hooks/usePharmacy";
import type { Drug } from "@/hooks/usePharmacy";

function formIcon(form?: string) {
  const f = form?.toLowerCase() || "";
  if (f.includes("tablet") || f.includes("capsule")) return <Pill size={14} />;
  if (f.includes("injection") || f.includes("vaccine")) return <Syringe size={14} />;
  if (f.includes("syrup") || f.includes("drops")) return <FlaskConical size={14} />;
  return <PackageSearch size={14} />;
}

function isExpiringSoon(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const threeMonths = new Date();
  threeMonths.setMonth(threeMonths.getMonth() + 3);
  return expiry <= threeMonths;
}

export default function PharmacyInventory() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || null;

  const { data: drugs = [], isLoading } = useDrugs(clinicId);
  const restockMutation = useRestockDrug();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [restockModal, setRestockModal] = useState<Drug | null>(null);
  const [restockQty, setRestockQty] = useState(0);
  const [detailDrug, setDetailDrug] = useState<Drug | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = useMemo(() => drugs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.supplier || "").toLowerCase().includes(search.toLowerCase())
  ), [drugs, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const lowStock = drugs.filter((d) => d.quantityInStock <= d.reorderLevel);
  const outOfStock = drugs.filter((d) => d.quantityInStock === 0);
  const expiringSoon = drugs.filter((d) => isExpiringSoon(d.expiryDate));

  const handleRestock = async () => {
    if (!restockModal || restockQty <= 0) return;
    try {
      await restockMutation.mutateAsync({ drugId: restockModal.id, quantity: restockQty });
      showToast(`Restocked ${restockModal.name} successfully`);
      setRestockModal(null);
      setRestockQty(0);
    } catch {
      showToast("Failed to restock drug");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader title="Drug Inventory" description="Track stock levels, expiry dates, and manage restocking." />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700"><PackageSearch size={18} /></div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Drugs</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900">{drugs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700"><AlertTriangle size={18} /></div>
            <div>
              <p className="text-xs font-medium text-slate-500">Low Stock</p>
              <p className="mt-0.5 text-xl font-bold text-amber-600">{lowStock.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700"><AlertTriangle size={18} /></div>
            <div>
              <p className="text-xs font-medium text-slate-500">Out of Stock</p>
              <p className="mt-0.5 text-xl font-bold text-rose-600">{outOfStock.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700"><Calendar size={18} /></div>
            <div>
              <p className="text-xs font-medium text-slate-500">Expiring ≤3mo</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900">{expiringSoon.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-800"><AlertTriangle size={16} /> Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map((d) => (
              <div key={d.id} className="rounded-xl bg-white p-3 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-900">{d.name}</p>
                  <p className="text-xs text-slate-400">Reorder at: {d.reorderLevel}</p>
                </div>
                <Badge className={d.quantityInStock === 0 ? "bg-rose-600 text-white" : "bg-amber-600 text-white"}>{d.quantityInStock}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>All Drugs</CardTitle>
          <div className="relative w-48 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search drugs or supplier..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drug Name</TableHead>
                  <TableHead>Form</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Reorder</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-500 py-6">Loading drugs...</TableCell></TableRow>
                ) : paginated.map((d) => {
                  const isLow = d.quantityInStock <= d.reorderLevel;
                  return (
                    <TableRow key={d.id}>
                      <TableCell>
                        <button onClick={() => setDetailDrug(d)} className="font-medium text-slate-900 hover:text-emerald-700 transition-colors text-left">
                          {d.name}
                        </button>
                        {d.genericName && <p className="text-xs text-slate-400">{d.genericName}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 text-xs whitespace-nowrap">{formIcon(d.dosageForm)} {d.dosageForm || "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{d.strength || "—"}</TableCell>
                      <TableCell>
                        <Badge className={d.quantityInStock === 0 ? "bg-rose-600 text-white" : isLow ? "bg-amber-600 text-white" : "bg-emerald-600 text-white"}>
                          {d.quantityInStock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{d.reorderLevel}</TableCell>
                      <TableCell>
                        <Badge variant={isExpiringSoon(d.expiryDate) ? "outline" : "outline"} className={isExpiringSoon(d.expiryDate) ? "border-rose-300 text-rose-600" : ""}>{d.expiryDate || "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setRestockModal(d)}
                            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors">
                            Restock
                          </button>
                          <button onClick={() => setDetailDrug(d)}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                            Info
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-sm text-slate-500 py-6">No drugs found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Showing</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-emerald-500">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
              <span>of {filtered.length} drug(s)</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    p === safePage ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!restockModal} onClose={() => { setRestockModal(null); setRestockQty(0); }} title="Restock Drug">
        {restockModal && (
          <div className="space-y-5">
            <div>
              <p className="text-lg font-bold text-slate-900">{restockModal.name}</p>
              <p className="text-sm text-slate-500">Current stock: <strong>{restockModal.quantityInStock}</strong> | Reorder at: {restockModal.reorderLevel}</p>
              {restockModal.expiryDate && <p className="text-sm text-slate-500">Expires: {restockModal.expiryDate}</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quantity to Add</label>
              <input type="number" min={1}
                value={restockQty || ""}
                onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                placeholder="Enter quantity..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-white" />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => { setRestockModal(null); setRestockQty(0); }}
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">Cancel</button>
              <button onClick={handleRestock} disabled={restockQty <= 0 || restockMutation.isPending}
                className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {restockMutation.isPending ? "Restocking..." : "Confirm Restock"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!detailDrug} onClose={() => setDetailDrug(null)} title="Drug Information">
        {detailDrug && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">{formIcon(detailDrug.dosageForm)}</div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">{detailDrug.name}</h4>
                <p className="text-sm text-slate-500">{detailDrug.genericName || ""} {detailDrug.strength ? `• ${detailDrug.strength}` : ""}</p>
                {detailDrug.dosageForm && <Badge variant="outline" className="mt-1">{detailDrug.dosageForm}</Badge>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Stock</p>
                <p className={`mt-0.5 text-lg font-bold ${detailDrug.quantityInStock <= detailDrug.reorderLevel ? "text-rose-600" : "text-emerald-600"}`}>
                  {detailDrug.quantityInStock}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Reorder At</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">{detailDrug.reorderLevel}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Expiry</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">{detailDrug.expiryDate || "—"}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Unit Price</p>
                <p className="mt-0.5 text-lg font-bold text-slate-900">₦{detailDrug.unitPrice.toLocaleString()}</p>
              </div>
            </div>
            {detailDrug.manufacturer && (
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Manufacturer</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{detailDrug.manufacturer}</p>
              </div>
            )}
            {detailDrug.quantityInStock <= detailDrug.reorderLevel && (
              <div className="rounded-xl bg-amber-50 p-3 flex items-center gap-3">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800">Stock is low (reorder at: {detailDrug.reorderLevel}). Consider restocking.</p>
              </div>
            )}
            <button onClick={() => { setRestockModal(detailDrug); setDetailDrug(null); }}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors">
              Restock This Drug
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
