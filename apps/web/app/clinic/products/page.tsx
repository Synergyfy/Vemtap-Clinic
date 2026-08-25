"use client";

import React, { useState, useMemo } from "react";
import {
  Search, Plus, ShoppingCart, Package, DollarSign,
  Layers, Edit3, Trash2, AlertCircle, Save, X,
  Tag, Pill, Eye, TrendingUp, User, ScanLine,
  SlidersHorizontal, ShieldCheck, Building2, CreditCard, Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { usePosStore, type PosProduct } from "@/store/posStore";

const PROD_CATEGORY_ICONS: Record<string, React.ElementType> = {
  Consultation: User,
  'Eye Test': ScanLine,
  Optical: Eye,
  Pharmacy: Pill,
  Procedure: TrendingUp,
  Other: Package,
};

function getCategoryBadge(category: string) {
  const colors: Record<string, string> = {
    Consultation: 'bg-sky-100 text-sky-700 border-sky-200',
    'Eye Test': 'bg-violet-100 text-violet-700 border-violet-200',
    Optical: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Pharmacy: 'bg-amber-100 text-amber-700 border-amber-200',
    Procedure: 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return colors[category] || 'bg-slate-100 text-slate-600 border-slate-200';
}

const emptyForm = { name: '', category: '', unitPrice: 0, stock: undefined as number | undefined, description: '' };

export default function ClinicProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = usePosStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PosProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<PosProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [stockUnlimited, setStockUnlimited] = useState(true);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))].sort(), [products]);

  const filtered = useMemo(() =>
    products.filter((p) =>
      !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ), [products, searchQuery]);

  const stats = useMemo(() => ({
    total: products.length,
    categories: categories.length,
    avgPrice: products.length ? Math.round(products.reduce((s, p) => s + p.unitPrice, 0) / products.length) : 0,
    tracked: products.filter(p => p.stock !== undefined).length,
  }), [products, categories]);

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setStockUnlimited(true);
    setFormError("");
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleOpenEdit = (product: PosProduct) => {
    setForm({
      name: product.name,
      category: product.category,
      unitPrice: product.unitPrice,
      stock: product.stock,
      description: '',
    });
    setStockUnlimited(product.stock === undefined);
    setFormError("");
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setFormError("Product name is required."); return; }
    if (!form.category.trim()) { setFormError("Category is required."); return; }
    if (form.unitPrice <= 0) { setFormError("Unit price must be greater than 0."); return; }

    const data = {
      name: form.name.trim(),
      category: form.category.trim(),
      unitPrice: form.unitPrice,
      stock: stockUnlimited ? undefined : Math.max(0, form.stock ?? 0),
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="POS Products"
        description="Manage your clinic's product catalog — items, pricing, stock, and categories used by the Cashier terminal."
        actions={[
          { label: "Add Product", variant: "primary", onClick: handleOpenAdd },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: stats.total, icon: Package, color: "emerald" },
          { label: "Categories", value: stats.categories, icon: Layers, color: "sky" },
          { label: "Avg Price", value: `₦${stats.avgPrice.toLocaleString()}`, icon: DollarSign, color: "violet" },
          { label: "Stock Tracked", value: stats.tracked, icon: ShoppingCart, color: "amber" },
        ].map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                stat.color === "emerald" ? "bg-emerald-100 text-emerald-600" :
                stat.color === "sky" ? "bg-sky-100 text-sky-600" :
                stat.color === "violet" ? "bg-violet-100 text-violet-600" : "bg-amber-100 text-amber-600"
              )}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filter */}
      <Card className="border-none shadow-sm rounded-2xl">
        <CardContent className="p-5">
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((product) => {
                const CatIcon = PROD_CATEGORY_ICONS[product.category] || Package;
                return (
                  <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 group-hover:border-sky-200 transition-all">
                          <CatIcon size={20} />
                        </div>
                        <p className="text-sm font-bold text-slate-900">{product.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border", getCategoryBadge(product.category))}>
                        {product.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-sky-600">₦{product.unitPrice.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {product.stock !== undefined ? (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                          <Package size={15} className="text-slate-400" />
                          {product.stock}
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest ml-0.5">units</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Unlimited</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-slate-400 font-mono">{product.id}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button onClick={() => handleOpenEdit(product)} variant="ghost" size="sm" className="h-9 px-3 rounded-xl gap-1.5 text-[10px] font-black uppercase tracking-widest text-sky-600 hover:bg-sky-50">
                          <Edit3 size={14} /> Edit
                        </Button>
                        <Button onClick={() => setDeletingProduct(product)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-rose-500 hover:bg-rose-50">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filtered.length} of {products.length} products
          </p>
        </div>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingProduct(null); }}
        title={editingProduct ? "Edit Product" : "Add Product"}
      >
        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Blue Light Filter, Comprehensive Eye Exam"
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <input
              type="text" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Optical, Pharmacy, Consultation"
              list="clinic-product-categories"
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
            />
            <datalist id="clinic-product-categories">
              {categories.map((cat) => <option key={cat} value={cat} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                Unit Price (₦) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number" min={0} step={100} value={form.unitPrice || ''}
                onChange={(e) => setForm({ ...form, unitPrice: Math.max(0, Number(e.target.value)) })}
                placeholder="0"
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                Stock
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min={0} value={stockUnlimited ? '' : (form.stock ?? 0)}
                  onChange={(e) => setForm({ ...form, stock: Math.max(0, Number(e.target.value)) })}
                  placeholder="Qty"
                  disabled={stockUnlimited}
                  className={cn(
                    "w-full h-11 px-4 rounded-xl border transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300",
                    stockUnlimited
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  )}
                />
                <label className="flex items-center gap-1.5 shrink-0 cursor-pointer select-none">
                  <input
                    type="checkbox" checked={stockUnlimited}
                    onChange={(e) => { setStockUnlimited(e.target.checked); if (e.target.checked) setForm({ ...form, stock: undefined }); }}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unlimited</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Description <span className="text-slate-300 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description or notes about this product..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-300 resize-none"
            />
          </div>

          {formError && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-rose-600 bg-rose-50 px-4 py-3 rounded-xl">
              <AlertCircle size={14} /> {formError}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button onClick={() => { setShowModal(false); setEditingProduct(null); }} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-600/20">
              <Save size={16} /> {editingProduct ? "Update" : "Add"} Product
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Delete Product"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertCircle size={24} className="text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Delete <span className="text-sky-600">{deletingProduct?.name}</span>?
              </p>
              <p className="text-xs text-slate-500 mt-1">
                This removes it from the POS catalog. Completed transactions are not affected.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={() => setDeletingProduct(null)} variant="outline" className="flex-1 h-11 rounded-xl font-bold border-slate-200">
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="default" className="flex-1 h-11 rounded-xl font-bold gap-2 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20">
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
