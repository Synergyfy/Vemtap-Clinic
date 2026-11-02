"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import {
  useCashierProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCashierTransactions,
  CashierProduct,
} from "@/hooks/useCashier";
import {
  Settings2, Printer, Bell, DollarSign, Trash2, Edit3, Plus,
  Search, Package, AlertCircle, CheckCircle2, SlidersHorizontal,
  Tag, Layers, ArrowUpDown
} from "lucide-react";

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

const DEFAULT_CATEGORIES = [
  "Consultation",
  "Eye Test",
  "Optical",
  "Pharmacy",
  "Procedure",
  "Other",
];

export default function CashierSettingsPage() {
  const { user } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useCashierProducts();
  const { data: transactions = [] } = useCashierTransactions();
  const createProductMut = useCreateProduct();
  const updateProductMut = useUpdateProduct();
  const deleteProductMut = useDeleteProduct();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CashierProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<CashierProduct | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Consultation");
  const [formUnitPrice, setFormUnitPrice] = useState<number | "">("");
  const [formStock, setFormStock] = useState<number | "">("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");

  // Terminal Settings
  const [receiptPrinting, setReceiptPrinting] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [currency, setCurrency] = useState("NGN");

  const categories = useMemo(() => {
    const fromProducts = products.map((p) => p.category);
    const combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...fromProducts]));
    return ["All", ...combined.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  const openAddModal = () => {
    setFormName("");
    setFormCategory("Consultation");
    setFormUnitPrice("");
    setFormStock("");
    setFormDescription("");
    setFormError("");
    setShowAddModal(true);
  };

  const openEditModal = (p: CashierProduct) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormUnitPrice(p.unitPrice);
    setFormStock(p.stock != null ? p.stock : "");
    setFormDescription(p.description || "");
    setFormError("");
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Product name is required.");
      return;
    }
    if (formUnitPrice === "" || Number(formUnitPrice) < 0) {
      setFormError("Valid unit price is required.");
      return;
    }
    if (!user?.clinicId) {
      setFormError("Active clinic session not found.");
      return;
    }

    try {
      if (editingProduct) {
        await updateProductMut.mutateAsync({
          id: editingProduct.id,
          name: formName.trim(),
          category: formCategory,
          unitPrice: Number(formUnitPrice),
          stock: formStock !== "" ? Number(formStock) : undefined,
          description: formDescription.trim() || undefined,
        });
        setEditingProduct(null);
      } else {
        await createProductMut.mutateAsync({
          name: formName.trim(),
          category: formCategory,
          unitPrice: Number(formUnitPrice),
          stock: formStock !== "" ? Number(formStock) : undefined,
          description: formDescription.trim() || undefined,
          clinicId: user.clinicId,
        });
        setShowAddModal(false);
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to save product.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    try {
      await deleteProductMut.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to delete product.");
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">POS & Product Settings</h1>
          <p className="text-sm text-slate-500 font-medium">Manage POS products catalog, terminal configurations, and pricing</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus size={16} />
          Add POS Product
        </button>
      </div>

      {/* Terminal Configuration Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center mb-3">
            <Printer size={20} className="text-sky-600" />
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1">Receipt Printing</h3>
          <p className="text-xs text-slate-500 mb-3">Auto-trigger receipt print preview after sale.</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setReceiptPrinting(!receiptPrinting)}
              className={cn(
                "w-11 h-6 rounded-full relative transition-colors p-0.5",
                receiptPrinting ? "bg-emerald-600" : "bg-slate-300"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 bg-white rounded-full shadow transition-transform",
                  receiptPrinting ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span className="text-xs font-bold text-slate-700">
              {receiptPrinting ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <Bell size={20} className="text-amber-600" />
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1">Audio Feedback</h3>
          <p className="text-xs text-slate-500 mb-3">Audible notifications for checkout success.</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setSoundAlerts(!soundAlerts)}
              className={cn(
                "w-11 h-6 rounded-full relative transition-colors p-0.5",
                soundAlerts ? "bg-emerald-600" : "bg-slate-300"
              )}
            >
              <div
                className={cn(
                  "w-5 h-5 bg-white rounded-full shadow transition-transform",
                  soundAlerts ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span className="text-xs font-bold text-slate-700">
              {soundAlerts ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-violet-600" />
          </div>
          <h3 className="text-sm font-black text-slate-900 mb-1">Default Currency</h3>
          <p className="text-xs text-slate-500 mb-3">Local currency configuration.</p>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none"
          >
            <option value="NGN">NGN — Nigerian Naira (₦)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="GBP">GBP — British Pound (£)</option>
          </select>
        </div>
      </div>

      {/* POS Products Management Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package size={18} className="text-emerald-600" />
              <h2 className="text-base font-black text-slate-900">POS Products & Services Catalog</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Items available for selection in the POS checkout register ({products.length} registered)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {productsLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package size={24} />
            </div>
            <p className="text-sm font-bold text-slate-600">No products found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "All"
                ? "Try adjusting your search terms or category filter."
                : "Add items or services so cashiers can ring them up at the POS."}
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-all"
            >
              + Add First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product / Service</th>
                  <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                  <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-black text-slate-900">{p.name}</p>
                        {p.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{p.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200/60">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-black text-emerald-700 tabular-nums">
                        {formatCurrency(p.unitPrice)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {p.stock != null ? (
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold tabular-nums",
                            p.stock > 10
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : p.stock > 0
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          )}
                        >
                          {p.stock} units
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Unlimited / Service</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                          title="Edit Product"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(p)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      <Modal
        isOpen={showAddModal || !!editingProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? "Edit POS Product" : "Create POS Product"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Product / Service Name *
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Eye Pressure Checkup, Anti-reflective Lens"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                Unit Price (₦) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                required
                value={formUnitPrice}
                onChange={(e) => setFormUnitPrice(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="5000"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Stock Quantity (Optional)
            </label>
            <input
              type="number"
              min="0"
              value={formStock}
              onChange={(e) => setFormStock(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Leave empty for services with unlimited stock"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Short notes or description"
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProductMut.isPending || updateProductMut.isPending}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {createProductMut.isPending || updateProductMut.isPending
                ? "Saving..."
                : editingProduct
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Delete POS Product"
      >
        {deletingProduct && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to remove <strong>{deletingProduct.name}</strong> from the POS products catalog?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deleteProductMut.isPending}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                {deleteProductMut.isPending ? "Deleting..." : "Delete Product"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
