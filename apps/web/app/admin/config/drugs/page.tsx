"use client";

import React, { useMemo, useState } from "react";
import {
  Search, Plus, Filter, Pill, Activity, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download, Edit3, Trash2,
  Package, Tag, Layers, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  useDrugs,
  useLowStockDrugs,
  useCreateDrug,
  useUpdateDrug,
  useDeleteDrug,
} from "@/hooks/usePharmacy";
import type { Drug } from "@/hooks/usePharmacy";

type DrugFormValues = {
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  strength: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  expiryDate: string;
  manufacturer: string;
  supplier: string;
  clinicId: string;
};

const defaultDrugForm = (clinicId: string): DrugFormValues => ({
  name: "",
  genericName: "",
  category: "",
  dosageForm: "",
  strength: "",
  unitPrice: 0,
  quantityInStock: 0,
  reorderLevel: 0,
  expiryDate: "",
  manufacturer: "",
  supplier: "",
  clinicId,
});

export default function DrugDatabasePage() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || "";
  const { data: drugs = [], isLoading, isError } = useDrugs(clinicId || null);
  const { data: lowStockDrugs = [] } = useLowStockDrugs(clinicId || null);
  const createDrugMutation = useCreateDrug();
  const updateDrugMutation = useUpdateDrug();
  const deleteDrugMutation = useDeleteDrug();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [form, setForm] = useState<DrugFormValues>(defaultDrugForm(clinicId));

  const filteredDrugs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return drugs;

    return drugs.filter((drug) =>
      [drug.name, drug.category, drug.genericName, drug.supplier].filter(Boolean).some((value) =>
        String(value).toLowerCase().includes(q)
      )
    );
  }, [drugs, searchQuery]);

  const outOfStock = drugs.filter((drug) => drug.quantityInStock === 0).length;
  const categories = new Set(drugs.map((drug) => drug.category).filter(Boolean)).size;

  const openCreateForm = () => {
    setEditingDrug(null);
    setForm(defaultDrugForm(clinicId));
    setIsFormOpen(true);
  };

  const openEditForm = (drug: Drug) => {
    setEditingDrug(drug);
    setForm({
      name: drug.name,
      genericName: drug.genericName || "",
      category: drug.category || "",
      dosageForm: drug.dosageForm || "",
      strength: drug.strength || "",
      unitPrice: Number(drug.unitPrice) || 0,
      quantityInStock: Number(drug.quantityInStock) || 0,
      reorderLevel: Number(drug.reorderLevel) || 0,
      expiryDate: drug.expiryDate || "",
      manufacturer: drug.manufacturer || "",
      supplier: drug.supplier || "",
      clinicId: drug.clinicId || clinicId,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDrug(null);
    setForm(defaultDrugForm(clinicId));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!clinicId) return;

    const payload = {
      ...form,
      clinicId,
      unitPrice: Number(form.unitPrice),
      quantityInStock: Number(form.quantityInStock),
      reorderLevel: Number(form.reorderLevel),
    };

    try {
      if (editingDrug) {
        await updateDrugMutation.mutateAsync({ drugId: editingDrug.id, dto: payload });
      } else {
        await createDrugMutation.mutateAsync(payload);
      }
      closeForm();
    } catch (error) {
      console.error("Failed to save drug", error);
    }
  };

  const handleDelete = async (drug: Drug) => {
    if (!confirm(`Delete ${drug.name}?`)) return;

    try {
      await deleteDrugMutation.mutateAsync(drug.id);
    } catch (error) {
      console.error("Failed to delete drug", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/config">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Back to Config
          </Button>
        </Link>
        <div className="w-px h-4 bg-slate-200"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Healthcare Config / Drug Database</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight text-brand-navy">Drug Database</h1>
          <p className="text-slate-500 font-medium mt-1">Manage the clinic pharmacy catalog and live inventory.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 h-11 px-6 rounded-xl font-bold border-slate-200">
            <Download size={16} /> Export Catalog
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20"
            onClick={openCreateForm}
          >
            <Plus size={16} /> Add New Drug
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[{ label: "Total Drugs", val: drugs.length, icon: Pill, color: "emerald" }, { label: "Low Stock", val: lowStockDrugs.length, icon: Activity, color: "blue" }, { label: "Categories", val: categories, icon: Layers, color: "purple" }, { label: "Out of Stock", val: outOfStock, icon: AlertCircle, color: "rose" }].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
              stat.color === "blue" ? "bg-blue-50 text-blue-500" :
              stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
              stat.color === "purple" ? "bg-purple-50 text-purple-500" : "bg-rose-50 text-rose-500"
            )}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black text-brand-navy">{String(stat.val)}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search drugs by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-6 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-11 px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold">
            <Filter size={16} /> Filter Category
          </Button>
          <Button variant="outline" size="sm" className="gap-2 shrink-0 h-11 px-6 rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white transition-all font-bold">
            <Tag size={16} /> Pricing Tier
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Drug Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-slate-500">Loading drugs...</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-rose-600">Could not load drugs from the API.</td>
                </tr>
              ) : filteredDrugs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-slate-500">No drugs found for this clinic.</td>
                </tr>
              ) : (
                filteredDrugs.map((drug) => {
                  const status = drug.quantityInStock === 0 ? "Out of Stock" : drug.quantityInStock <= drug.reorderLevel ? "Low Stock" : "In Stock";
                  const statusClass = drug.quantityInStock === 0 ? "bg-rose-50 text-rose-600" : drug.quantityInStock <= drug.reorderLevel ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600";

                  return (
                    <tr key={drug.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 group-hover:border-emerald-500/20 transition-all">
                            <Pill size={24} />
                          </div>
                          <div>
                            <p className="text-base font-bold text-brand-navy">{drug.name}</p>
                            {drug.genericName && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{drug.genericName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-600">
                          {drug.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 text-sm font-black text-brand-navy">
                          <Package size={16} className="text-slate-400" />
                          {drug.quantityInStock} <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1">Units</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm font-black text-brand-navy">₦{Number(drug.unitPrice || 0).toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", statusClass)}>
                          {status === "In Stock" ? <CheckCircle2 size={14} /> : status === "Low Stock" ? <Clock size={14} /> : <AlertCircle size={14} />}
                          {status}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => openEditForm(drug)} variant="ghost" size="sm" className="h-10 px-4 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest text-brand-blue hover:bg-brand-soft-blue transition-all">
                            <Edit3 size={16} /> Edit
                          </Button>
                          <Button onClick={() => handleDelete(drug)} variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-rose-600 hover:bg-rose-50">
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drug Catalog</p>
                <h2 className="text-2xl font-black text-brand-navy">{editingDrug ? "Edit Drug" : "Add New Drug"}</h2>
              </div>
              <button type="button" onClick={closeForm} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Name</span>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Generic Name</span>
                <input value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</span>
                <input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Dosage Form</span>
                <input required value={form.dosageForm} onChange={(e) => setForm({ ...form, dosageForm: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Strength</span>
                <input required value={form.strength} onChange={(e) => setForm({ ...form, strength: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Unit Price</span>
                <input required type="number" min="0" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Quantity in Stock</span>
                <input type="number" min="0" value={form.quantityInStock} onChange={(e) => setForm({ ...form, quantityInStock: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Reorder Level</span>
                <input type="number" min="0" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Expiry Date</span>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Manufacturer</span>
                <input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Supplier</span>
                <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-blue" />
              </label>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeForm} className="rounded-xl border-slate-200">Cancel</Button>
                <Button type="submit" className="rounded-xl" disabled={createDrugMutation.isPending || updateDrugMutation.isPending}>
                  {updateDrugMutation.isPending || createDrugMutation.isPending ? "Saving..." : editingDrug ? "Save Changes" : "Create Drug"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
