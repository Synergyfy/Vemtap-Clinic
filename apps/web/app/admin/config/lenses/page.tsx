"use client";

import React, { useState } from "react";
import { 
  Search, Plus, Filter, MoreVertical, 
  Eye, Activity, Building2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, Download,
  Edit3, Trash2, Tag, Layers, Glasses, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import { 
  useOpticalInventory, 
  useCreateOpticalItem, 
  useDeleteOpticalItem,
  type OpticalInventoryItem 
} from "@/hooks/useOptician";

function formatNGN(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function LensCatalogPage() {
  const { user } = useAuth();
  const clinicId = user?.clinicId || "";

  const { data: items = [], isLoading } = useOpticalInventory("lens");
  const createItemMutation = useCreateOpticalItem();
  const deleteItemMutation = useDeleteOpticalItem();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLens, setNewLens] = useState({
    name: "",
    model: "Single Vision (Clear)",
    material: "CR-39",
    costPrice: 0,
    sellingPrice: 0,
    quantityOnHand: 10,
    minQuantity: 5,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLens.name) return;

    try {
      await createItemMutation.mutateAsync({
        name: newLens.name,
        category: "lenses",
        type: "lens",
        brand: "Standard Optical Lab",
        model: newLens.model,
        material: newLens.material,
        costPrice: Number(newLens.costPrice),
        sellingPrice: Number(newLens.sellingPrice),
        unitPrice: Number(newLens.sellingPrice),
        quantityInStock: Number(newLens.quantityOnHand),
        quantityOnHand: Number(newLens.quantityOnHand),
        minQuantity: Number(newLens.minQuantity),
        clinicId,
      });
      setIsAddModalOpen(false);
      setNewLens({
        name: "",
        model: "Single Vision (Clear)",
        material: "CR-39",
        costPrice: 0,
        sellingPrice: 0,
        quantityOnHand: 10,
        minQuantity: 5,
      });
    } catch (err) {
      console.error("Failed to add lens item", err);
    }
  };

  const filteredLenses = items.filter((l) =>
    (l.model && l.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStock = items.reduce((acc, curr) => acc + (curr.quantityOnHand || 0), 0);
  const uniqueMaterials = new Set(items.map(i => i.material).filter(Boolean)).size;

  return (
    <div className="space-y-8">
      {/* Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Lens Type to Global Catalog">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Lens Title</label>
            <input
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
              placeholder="e.g. Progressive Blue-Cut 1.67"
              value={newLens.name}
              onChange={(e) => setNewLens({ ...newLens, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Lens Design</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white"
                value={newLens.model}
                onChange={(e) => setNewLens({ ...newLens, model: e.target.value })}
              >
                <option>Single Vision (Clear)</option>
                <option>Progressive (Elite)</option>
                <option>Photochromic (Grey)</option>
                <option>Bifocal (Flat-Top)</option>
                <option>Blue Light Filter</option>
                <option>Anti-Reflective</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Material</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none bg-white"
                value={newLens.material}
                onChange={(e) => setNewLens({ ...newLens, material: e.target.value })}
              >
                <option>CR-39</option>
                <option>Polycarbonate</option>
                <option>Hi-Index 1.67</option>
                <option>Hi-Index 1.74</option>
                <option>Trivex</option>
                <option>Mineral Glass</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cost Price (₦)</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                placeholder="10000"
                value={newLens.costPrice}
                onChange={(e) => setNewLens({ ...newLens, costPrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Selling Price (₦)</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                placeholder="25000"
                value={newLens.sellingPrice}
                onChange={(e) => setNewLens({ ...newLens, sellingPrice: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Initial Stock</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                value={newLens.quantityOnHand}
                onChange={(e) => setNewLens({ ...newLens, quantityOnHand: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Min Alert Level</label>
              <input
                type="number"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                value={newLens.minQuantity}
                onChange={(e) => setNewLens({ ...newLens, minQuantity: Number(e.target.value) })}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={createItemMutation.isPending}
            className="w-full py-4 rounded-xl font-bold mt-4 shadow-lg shadow-brand-blue/20"
          >
            {createItemMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Lens Type"}
          </Button>
        </form>
      </Modal>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Link href="/admin/config">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} /> Back to Config
          </Button>
        </Link>
        <div className="w-px h-4 bg-slate-200"></div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Healthcare Config / Lens Catalog</p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Lens Catalog</h1>
          <p className="text-slate-500 font-medium mt-1">Standardize lens designs, coatings, and global pricing benchmarks.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            variant="default" 
            size="sm" 
            className="gap-2 h-11 px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20"
          >
            <Plus size={16} /> New Lens Type
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Lens Configurations", val: items.length.toString(), icon: Eye, color: "blue" },
          { label: "Material Profiles", val: uniqueMaterials.toString(), icon: Glasses, color: "emerald" },
          { label: "Pairs In Stock", val: totalStock.toString(), icon: Layers, color: "purple" },
          { label: "Catalog Status", val: "Live Synced", icon: Activity, color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0", 
              stat.color === "blue" ? "bg-blue-50 text-blue-500" :
              stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
              stat.color === "purple" ? "bg-purple-50 text-purple-500" : "bg-amber-50 text-amber-500"
            )}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-xl font-black text-brand-navy">{stat.val}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search lens by name or design..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-6 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:bg-white transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lens Name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-blue" />
                    <p className="mt-2 text-xs font-bold">Loading live lens catalog...</p>
                  </td>
                </tr>
              ) : filteredLenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold text-slate-600">No lens types found</p>
                    <p className="text-xs text-slate-400 mt-1">Add your first lens type to define standardized pricing.</p>
                    <Button 
                      onClick={() => setIsAddModalOpen(true)}
                      variant="outline" 
                      size="sm" 
                      className="mt-4 rounded-xl font-bold"
                    >
                      <Plus size={14} className="mr-1" /> New Lens Type
                    </Button>
                  </td>
                </tr>
              ) : (
                filteredLenses.map((lens) => (
                  <tr key={lens.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-blue/10 group-hover:text-brand-blue group-hover:border-brand-blue/20 transition-all">
                          <Eye size={24} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-brand-navy">{lens.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{lens.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-600">
                      {lens.model || "Standard Design"}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-600">
                        {lens.material || "CR-39"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-brand-navy">{formatNGN(lens.sellingPrice || 0)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={14} /> Available
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          onClick={() => deleteItemMutation.mutate(lens.id)}
                          variant="ghost" 
                          size="sm" 
                          className="h-10 w-10 p-0 rounded-xl text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
