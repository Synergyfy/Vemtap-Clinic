"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ShoppingBag, CheckCircle2, X, Star, Eye, ArrowRight, ArrowLeft, Grid3X3, List, Trash2, Send } from "lucide-react";
import { usePatientStore } from "@/store/patientStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { useFormatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  material: string;
  color: string;
  brand: string;
  rating: number;
  popular: boolean;
  description: string;
};

const products: Product[] = [
  { id: "FR-001", name: "Aviator Classic", category: "Frames", price: 45000, material: "Titanium", color: "Gold / Black", brand: "Ray-Ban", rating: 4.8, popular: true, description: "Timeless aviator shape with lightweight titanium frame. Perfect for everyday wear with anti-reflective coating compatibility." },
  { id: "FR-002", name: "Wayfarer Pro", category: "Frames", price: 38000, material: "Acetate", color: "Tortoise Shell", brand: "Oakley", rating: 4.6, popular: true, description: "Modern Wayfarer design with premium acetate construction. Spring hinges for lasting comfort." },
  { id: "FR-003", name: "Round Minimal", category: "Frames", price: 52000, material: "Stainless Steel", color: "Silver / Gunmetal", brand: "Persol", rating: 4.9, popular: false, description: "Ultra-lightweight round frame with adjustable nose pads. Hypoallergenic for sensitive skin." },
  { id: "FR-004", name: "Cat Eye Elegance", category: "Frames", price: 42000, material: "Acetate", color: "Black / Crystal", brand: "Gucci", rating: 4.7, popular: false, description: "Bold cat-eye silhouette with crystal accent temples. A statement piece for fashion-forward patients." },
  { id: "FR-005", name: "Sport Flex", category: "Frames", price: 55000, material: "TR-90 Nylon", color: "Matte Black", brand: "Nike", rating: 4.5, popular: true, description: "High-impact sport frame with wrap-around design. Secure grip temples for active lifestyles." },
  { id: "LE-001", name: "Anti-Reflective Pro", category: "Lenses", price: 25000, material: "CR-39", color: "Clear", brand: "Zeiss", rating: 4.7, popular: true, description: "Premium anti-reflective coating that eliminates glare from screens and headlights. Scratch-resistant." },
  { id: "LE-002", name: "Blue Light Shield", category: "Lenses", price: 32000, material: "Polycarbonate", color: "Slight Yellow Tint", brand: "Essilor", rating: 4.8, popular: true, description: "Blocks 99% of harmful blue light. Reduces digital eye strain and improves sleep quality." },
  { id: "LE-003", name: "Transition XTRActive", category: "Lenses", price: 55000, material: "Photochromic", color: "Clear to Dark", brand: "Transitions", rating: 4.9, popular: false, description: "Smart lenses that darken outdoors and clears indoors. Blocks UV and blue light year-round." },
  { id: "LE-004", name: "Polarized Drive", category: "Lenses", price: 38000, material: "Polarized", color: "Grey / Green", brand: "Maui Jim", rating: 4.6, popular: false, description: "Eliminates glare from roads and water. Enhanced contrast for sharper driving vision." },
  { id: "LE-005", name: "Progressive Plus", category: "Lenses", price: 65000, material: "Digital Freeform", color: "Clear", brand: "Varilux", rating: 4.8, popular: false, description: "No-line multifocal lenses with wide intermediate zone. Smooth transition from distance to near." },
];

const categories = ["All", "Frames", "Lenses"];
const ITEMS_PER_PAGE = 6;

export default function CataloguePage() {
  const { addNotification } = usePatientStore();
  const format = useFormatCurrency();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [enquiryCart, setEnquiryCart] = useState<Product[]>([]);
  const [toast, setToast] = useState("");
  const [page, setPage] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = !query.trim() || [p.name, p.brand, p.category, p.material, p.color].join(" ").toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
    result.sort((a, b) => {
      if (sortBy === "popular") return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
    return result;
  }, [query, activeCategory, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  React.useEffect(() => { setPage(1); }, [query, activeCategory, sortBy]);

  const addToEnquiry = (product: Product) => {
    if (enquiryCart.find((p) => p.id === product.id)) {
      showToast(`${product.name} already in enquiry list`);
      return;
    }
    setEnquiryCart((current) => [...current, product]);
    addNotification({
      title: "Catalogue Enquiry",
      message: `You added ${product.name} (${format(product.price)}) to your enquiry list. A representative will follow up.`,
      time: "Just now",
      type: "general",
    });
    showToast(`${product.name} added to enquiry`);
  };

  const removeFromEnquiry = (id: string) => {
    setEnquiryCart((current) => current.filter((p) => p.id !== id));
  };

  const submitEnquiry = () => {
    if (enquiryCart.length === 0) return;
    addNotification({
      title: "Enquiry Submitted",
      message: `Your enquiry for ${enquiryCart.length} item(s) has been sent. We'll get back to you shortly.`,
      time: "Just now",
      type: "general",
    });
    setEnquiryCart([]);
    setShowCart(false);
    setShowConfirmSubmit(false);
    showToast("Enquiry submitted successfully");
  };

  const totalCost = enquiryCart.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/patient/optical" className="hover:text-teal-600 transition-colors font-medium">Optical Orders</Link>
        <span>/</span>
        <span className="text-gray-900 font-bold">Product Catalogue</span>
      </div>

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Catalogue</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Browse frames and lenses. Add items to your enquiry list and submit to our team.</p>
        </div>
        <Link href="/patient/optical" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm">
          <ChevronLeft size={16} /> Back to Orders
        </Link>
      </header>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, brand, material..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/10 font-medium text-gray-900 text-sm" />
          </div>
          <div className="flex gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none text-sm font-medium text-gray-700">
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-colors">
              {viewMode === "grid" ? <List size={18} /> : <Grid3X3 size={18} />}
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0", activeCategory === cat ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100')}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5" : "space-y-4"}>
        {paginatedProducts.map((product, i) => (
          <motion.div key={product.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.03 }}
            className={cn("bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all", viewMode === "list" ? "flex flex-col sm:flex-row" : "")}>
            <div className={cn("relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center", viewMode === "grid" ? "h-44 sm:h-52" : "h-32 sm:h-40 sm:w-48 shrink-0")}>
              <div className={cn("rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-300", viewMode === "grid" ? "w-16 h-16" : "w-10 h-10")}>
                <Eye size={viewMode === "grid" ? 28 : 18} />
              </div>
              {product.popular && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest border border-amber-200">Popular</span>
              )}
              <button onClick={() => setSelectedProduct(product)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-white/80 backdrop-blur-sm text-gray-400 hover:text-teal-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                <Eye size={16} />
              </button>
            </div>
            <div className={cn("p-4 sm:p-5 flex flex-col flex-1", viewMode === "list" ? "sm:flex-row sm:items-center sm:justify-between gap-4" : "")}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{product.brand}</span>
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600"><Star size={10} className="fill-amber-400 text-amber-400" />{product.rating}</span>
                </div>
                <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
                <p className="text-xs text-gray-500 truncate">{product.material} &bull; {product.color}</p>
                <p className={cn("text-lg font-black text-teal-700 mt-2", viewMode === "list" ? "sm:hidden" : "")}>{format(product.price)}</p>
              </div>
              <div className={cn("flex items-center gap-2 mt-3", viewMode === "list" ? "sm:mt-0 sm:flex-col sm:items-end" : "")}>
                <p className={cn("text-lg font-black text-teal-700", viewMode === "list" ? "hidden sm:block" : "hidden")}>{format(product.price)}</p>
                <button onClick={() => addToEnquiry(product)}
                  className={cn("px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0", enquiryCart.find((p) => p.id === product.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-600 text-white hover:bg-teal-700')}>
                  {enquiryCart.find((p) => p.id === product.id) ? <CheckCircle2 size={14} /> : <ShoppingBag size={14} />}
                  {enquiryCart.find((p) => p.id === product.id) ? 'Added' : 'Enquire'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {paginatedProducts.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <Search size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">No products match your search</p>
            <p className="text-sm mt-1">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-3 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-teal-600 hover:border-teal-200 disabled:opacity-30 transition-all">
            <ArrowLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={cn("w-10 h-10 rounded-xl text-sm font-bold transition-all", page === p ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-white border border-gray-100 text-gray-500 hover:border-teal-200')}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-3 rounded-xl bg-white border border-gray-100 text-gray-500 hover:text-teal-600 hover:border-teal-200 disabled:opacity-30 transition-all">
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Floating Enquiry Button */}
      <AnimatePresence>
        {enquiryCart.length > 0 && (
          <motion.button initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setShowCart(true)}
            className="fixed bottom-24 lg:bottom-8 right-6 z-40 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-teal-600 text-white shadow-2xl shadow-teal-600/30 hover:bg-teal-700 transition-all">
            <div className="relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-400 text-amber-900 text-[9px] font-black flex items-center justify-center ring-2 ring-teal-600">
                {enquiryCart.length}
              </span>
            </div>
            <span className="text-sm font-bold">View Enquiry List</span>
            <ArrowRight size={16} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Enquiry Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowCart(false)} />
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              className="relative bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full sm:max-w-lg max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Enquiry List</h2>
                  <p className="text-sm text-gray-500">{enquiryCart.length} item(s) selected</p>
                </div>
                <button onClick={() => setShowCart(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><X size={18} className="text-gray-500" /></button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {enquiryCart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 shrink-0"><Eye size={18} /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500">{item.brand} &bull; {item.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-sm font-black text-teal-700">{format(item.price)}</span>
                      <button onClick={() => removeFromEnquiry(item.id)} className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer with total & submit */}
              <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50/50 shrink-0 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-bold text-gray-600">Estimated Total</span>
                  <span className="text-xl font-black text-gray-900">{format(totalCost)}</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center">HMO coverage &amp; final pricing will be confirmed upon submission.</p>
                <div className="flex gap-3">
                  <button onClick={() => { setShowCart(false); setShowConfirmSubmit(true); }}
                    className="flex-1 py-3.5 rounded-2xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                    <Send size={16} /> Submit Enquiry
                  </button>
                  <button onClick={() => setShowCart(false)}
                    className="px-5 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all text-sm">Close</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Submit Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowConfirmSubmit(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
                <ShoppingBag size={28} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Submit Enquiry?</h3>
              <p className="text-sm text-gray-500 mb-2">You are about to send an enquiry for <strong className="text-gray-900">{enquiryCart.length} item(s)</strong>.</p>
              <p className="text-xs text-gray-400 mb-6">A clinic representative will review and follow up with pricing and availability.</p>
              <div className="flex flex-col gap-2">
                <button onClick={submitEnquiry}
                  className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2">
                  <Send size={16} /> Yes, Submit Enquiry
                </button>
                <button onClick={() => setShowConfirmSubmit(false)}
                  className="w-full py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative bg-white rounded-[3rem] p-8 w-full max-w-lg shadow-2xl">
              <div className="absolute top-0 right-0 p-6">
                <button onClick={() => setSelectedProduct(null)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0"><Eye size={32} /></div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-sm text-gray-500">{selectedProduct.brand} &bull; {selectedProduct.category}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-400">Price</span>
                  <span className="text-base font-black text-teal-700">{format(selectedProduct.price)}</span>
                </div>
                <div className="flex justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-400">Material</span>
                  <span className="text-sm font-bold text-gray-900">{selectedProduct.material}</span>
                </div>
                <div className="flex justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-400">Color</span>
                  <span className="text-sm font-bold text-gray-900">{selectedProduct.color}</span>
                </div>
                <div className="flex justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-400">Rating</span>
                  <span className="flex items-center gap-1 text-sm font-bold text-gray-900"><Star size={14} className="fill-amber-400 text-amber-400" />{selectedProduct.rating} / 5</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</span>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">{selectedProduct.description}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-6">
                <button onClick={() => { addToEnquiry(selectedProduct); }}
                  className={cn("w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors", enquiryCart.find((p) => p.id === selectedProduct.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-600 text-white hover:bg-teal-700')}>
                  {enquiryCart.find((p) => p.id === selectedProduct.id) ? <CheckCircle2 size={16} /> : <ShoppingBag size={16} />}
                  {enquiryCart.find((p) => p.id === selectedProduct.id) ? 'Added to Enquiry' : 'Add to Enquiry'}
                </button>
                <button onClick={() => setSelectedProduct(null)}
                  className="w-full py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
