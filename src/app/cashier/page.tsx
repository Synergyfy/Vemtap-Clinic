"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import {
  usePosStore, formatCurrency, getCategoryColor,
  type PosProduct
} from "@/store/posStore";
import {
  ShoppingCart, Plus, Minus, Trash2, Search, Wallet,
  CreditCard, Building2, ShieldCheck, CheckCircle2, X,
  Printer, Clock, User, Percent, Banknote, Receipt,
  List, LayoutGrid, LogOut, ChevronRight, ArrowRight,
  Timer, Package, SlidersHorizontal, Hash, Sigma,
  Coins, TrendingUp, AlertCircle, ScanLine, ChevronDown,
  ChevronUp, Sun, Moon
} from "lucide-react";

const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

const PAYMENT_METHODS = [
  { key: 'cash' as const, label: 'Cash', icon: Banknote, color: 'emerald' as const, desc: 'Physical currency' },
  { key: 'card' as const, label: 'Card', icon: CreditCard, color: 'sky' as const, desc: 'Debit / Credit card' },
  { key: 'transfer' as const, label: 'Transfer', icon: Building2, color: 'violet' as const, desc: 'Bank transfer' },
  { key: 'hmo' as const, label: 'HMO', icon: ShieldCheck, color: 'amber' as const, desc: 'Insurance coverage' },
];

const PROD_CATEGORY_ICONS: Record<string, React.ElementType> = {
  Consultation: User,
  'Eye Test': ScanLine,
  Optical: Package,
  Pharmacy: AlertCircle,
  Procedure: TrendingUp,
  Other: SlidersHorizontal,
};

export default function PosPage() {
  const pos = usePosStore();
  const {
    cartItems, discount, patientName, note,
    products, categories,
    activeShift, transactions,
    addToCart, removeFromCart, updateQuantity, clearCart,
    setDiscount, setPatientName, setNote,
    openShift, closeShift, completeTransaction,
  } = pos;

  const searchRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showOpenShift, setShowOpenShift] = useState(!activeShift);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [showReceipt, setShowReceipt] = useState<ReturnType<typeof completeTransaction> | null>(null);
  const [closingCash, setClosingCash] = useState(0);
  const [shiftCashier, setShiftCashier] = useState("Cashier");
  const [openingBalance, setOpeningBalance] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [hmoAmount, setHmoAmount] = useState(0);
  const [hmoProvider, setHmoProvider] = useState("");
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);

  const subtotal = useMemo(() => cartItems.reduce((s, i) => s + i.total, 0), [cartItems]);
  const total = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);
  const totalPaid = cashAmount + cardAmount + transferAmount + hmoAmount;
  const balance = Math.max(0, total - totalPaid);
  const canComplete = cartItems.length > 0 && totalPaid >= total;

  const filteredProducts = useMemo(() =>
    products.filter((p) => {
      if (activeCategory !== "All" && p.category !== activeCategory) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }), [products, activeCategory, searchQuery]);

  const completedTxnCount = transactions.filter(t => t.status === 'completed').length;
  const todayTotal = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return transactions.filter(t => t.status === 'completed' && new Date(t.timestamp) >= today).reduce((s, t) => s + t.total, 0);
  }, [transactions]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Search keyboard navigation
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(prev => Math.max(prev - 1, 0)); }
    if (e.key === 'Enter' && focusedIndex >= 0 && filteredProducts[focusedIndex]) {
      e.preventDefault();
      addToCart(filteredProducts[focusedIndex]);
      setFocusedIndex(-1);
    }
  };

  const handleOpenShift = () => {
    if (!shiftCashier.trim()) return;
    openShift(shiftCashier.trim(), openingBalance);
    setShowOpenShift(false);
  };

  const handleCloseShift = () => {
    closeShift(closingCash);
    setShowCloseShift(false);
    setClosingCash(0);
  };

  const resetPayments = () => {
    setCashAmount(0); setCardAmount(0); setTransferAmount(0);
    setHmoAmount(0); setHmoProvider(""); setExpandedPayment(null);
  };

  const handleCompleteSale = useCallback(() => {
    if (!canComplete) return;
    const payments = [];
    if (cashAmount > 0) payments.push({ method: 'cash' as const, amount: cashAmount });
    if (cardAmount > 0) payments.push({ method: 'card' as const, amount: cardAmount, reference: 'Card' });
    if (transferAmount > 0) payments.push({ method: 'transfer' as const, amount: transferAmount, reference: 'Transfer' });
    if (hmoAmount > 0) payments.push({ method: 'hmo' as const, amount: hmoAmount, reference: hmoProvider || 'HMO' });
    const txn = completeTransaction(payments);
    resetPayments();
    setShowReceipt(txn);
  }, [canComplete, cashAmount, cardAmount, transferAmount, hmoAmount, hmoProvider, completeTransaction]);

  const handleProductClick = (product: PosProduct) => {
    addToCart(product);
    setFocusedIndex(-1);
  };

  const handleQuickCash = (amt: number) => {
    if (amt >= total) { setCashAmount(amt); return; }
    setCashAmount(amt);
  };

  // ─── OPEN SHIFT SCREEN ───
  if (!activeShift) {
    return (
      <div className="min-h-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-2xl p-10 text-center">
            <div className="w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/25">
              <Wallet size={36} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1.5">Open a Shift</h2>
            <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">Start your cashier session to begin processing sales and payments.</p>
            <div className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cashier Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={shiftCashier} onChange={(e) => setShiftCashier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 text-sm font-bold text-slate-900 focus:outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Opening Balance (₦)</label>
                <input type="number" value={openingBalance || ''} onChange={(e) => setOpeningBalance(Number(e.target.value))}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 text-sm font-bold text-slate-900 focus:outline-none transition-all" />
              </div>
              <button onClick={handleOpenShift}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-black uppercase tracking-widest hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 mt-2">
                <Wallet size={18} /> Open Shift
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN POS ───
  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* ═══ Top Bar ═══ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="shrink-0 bg-white border-b border-slate-200/80 px-5 py-3 flex items-center justify-between z-20 shadow-sm"
      >
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Wallet size={16} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">Shift Open</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                <ShiftTimer startTime={activeShift.startTime} />
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 pl-5 border-l border-slate-200">
            <User size={14} className="text-slate-400" />
            <span className="text-xs font-black text-slate-700">{activeShift.cashierName}</span>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <Receipt size={14} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500">{completedTxnCount} txns</span>
            <div className="w-px h-4 bg-slate-200" />
            <TrendingUp size={14} className="text-emerald-500" />
            <span className="text-xs font-black text-emerald-600">{formatCurrency(todayTotal)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { setClosingCash(0); setShowCloseShift(true); }}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-1.5 border border-rose-100">
            <LogOut size={13} /> End Shift
          </button>
        </div>
      </motion.header>

      {/* ═══ 3-Column POS ═══ */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-0">
        {/* ═══ LEFT: Cart ═══ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-4 bg-white border-r border-slate-200 flex flex-col min-h-0"
        >
          {/* Cart Header */}
          <div className="shrink-0 p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart size={14} />
                Cart <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-[8px] flex items-center justify-center font-black">{cartItems.length}</span>
              </h2>
              {cartItems.length > 0 && (
                <button onClick={clearCart}
                  className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-all">
                  <Trash2 size={11} /> Clear
                </button>
              )}
            </div>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient name (optional)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all placeholder:text-slate-300" />
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            <AnimatePresence initial={false}>
              {cartItems.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart size={32} className="text-slate-200" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">Cart is empty</p>
                  <p className="text-[10px] text-slate-300 mt-1">Search or browse products to add</p>
                </motion.div>
              )}
              {cartItems.map((item) => (
                <motion.div
                  layout
                  key={item.productId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 truncate leading-tight">{item.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{formatCurrency(item.unitPrice)} each</p>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 text-slate-300 hover:text-rose-500 transition-colors shrink-0">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-0.5">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all">
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-slate-900 tabular-nums">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all">
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(item.total)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Cart Footer */}
          <div className="shrink-0 p-4 border-t border-slate-100 bg-white space-y-2.5">
            <div className="flex items-center gap-2">
              <Percent size={13} className="text-slate-400 shrink-0" />
              <input type="number" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="Discount (₦)"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-300" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Subtotal</span>
              <span className="font-black text-slate-700 tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-500 font-medium">Discount</span>
                <span className="font-black text-rose-500 tabular-nums">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2.5 border-t-2 border-slate-900/10">
              <span className="text-sm font-black text-slate-700">Total</span>
              <span className="text-xl font-black text-slate-900 tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>
        </motion.div>

        {/* ═══ CENTER: Products ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 bg-white border-r border-slate-200 flex flex-col min-h-0"
        >
          {/* Search + Category Dropdown */}
          <div className="shrink-0 p-4 border-b border-slate-100 flex items-center gap-2">
            <div className="relative group flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input ref={searchRef} type="text" value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setFocusedIndex(-1); }}
                onKeyDown={handleSearchKeyDown}
                placeholder='Search products... (press "/" to focus)'
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 text-sm font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-300" />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setFocusedIndex(-1); searchRef.current?.focus(); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-all">
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="h-12 shrink-0 px-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 text-xs font-black uppercase tracking-widest text-slate-700 focus:border-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}
            >
              {categories.map((cat) => {
                const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
                return (
                  <option key={cat} value={cat}>{cat} ({count})</option>
                );
              })}
            </select>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setViewMode('list')}
                className={cn("p-2.5 rounded-xl border transition-all", viewMode === 'list' ? "bg-slate-900 text-white border-slate-900 shadow" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300")}
                title="List view">
                <List size={14} />
              </button>
              <button onClick={() => setViewMode('grid')}
                className={cn("p-2.5 rounded-xl border transition-all", viewMode === 'grid' ? "bg-slate-900 text-white border-slate-900 shadow" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300")}
                title="Grid view">
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {filteredProducts.length === 0 && (
              <div className="py-16 text-center">
                <Package size={36} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-400">No products found</p>
                <p className="text-[10px] text-slate-300 mt-1">Try a different search term or category</p>
              </div>
            )}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {filteredProducts.map((product, i) => {
                  const CatIcon = PROD_CATEGORY_ICONS[product.category] || Package;
                  return (
                    <motion.button
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.012 }}
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className={cn(
                        "p-4 rounded-2xl bg-white border-2 border-slate-50 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all text-left group relative overflow-hidden",
                        focusedIndex === i && "ring-2 ring-emerald-500/40 border-emerald-200"
                      )}
                    >
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-emerald-50 transition-colors">
                        <CatIcon size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <p className="text-xs font-black text-slate-900 leading-snug mb-1.5 group-hover:text-emerald-700 transition-colors">{product.name}</p>
                      <p className="text-base font-black text-emerald-600">{formatCurrency(product.unitPrice)}</p>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredProducts.map((product, i) => (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.006 }}
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-slate-50 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all group",
                      focusedIndex === i && "ring-2 ring-emerald-500/40 border-emerald-200"
                    )}
                  >
                    <div className={cn(
                      "px-2.5 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border shrink-0",
                      getCategoryColor(product.category)
                    )}>
                      {product.category}
                    </div>
                    <p className="flex-1 text-xs font-black text-slate-900 truncate group-hover:text-emerald-700 transition-colors text-left">{product.name}</p>
                    <p className="text-sm font-black text-emerald-600 shrink-0 tabular-nums">{formatCurrency(product.unitPrice)}</p>
                    <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors shrink-0">
                      <Plus size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══ RIGHT: Payment ═══ */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-3 bg-white flex flex-col min-h-0"
        >
          {/* Total Display */}
          <div className="shrink-0 p-5 bg-gradient-to-br from-slate-900 to-slate-800">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
            <p className="text-3xl sm:text-4xl font-black text-white tabular-nums tracking-tight">{formatCurrency(total)}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <TrendingUp size={12} />
                <span className="text-[10px] font-black tabular-nums">{formatCurrency(totalPaid)} paid</span>
              </div>
              {balance > 0 && (
                <div className="flex items-center gap-1.5 text-amber-400">
                  <AlertCircle size={12} />
                  <span className="text-[10px] font-black tabular-nums">{formatCurrency(balance)} due</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {PAYMENT_METHODS.map((method) => {
              const amount = {
                cash: cashAmount,
                card: cardAmount,
                transfer: transferAmount,
                hmo: hmoAmount,
              }[method.key];
              const setAmount = {
                cash: setCashAmount,
                card: setCardAmount,
                transfer: setTransferAmount,
                hmo: setHmoAmount,
              }[method.key];
              const isExpanded = expandedPayment === method.key;
              const color = method.color;
              const colorClasses = {
                emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', active: 'ring-emerald-500' },
                sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500', active: 'ring-sky-500' },
                violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500', active: 'ring-violet-500' },
                amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', active: 'ring-amber-500' },
              }[color];

              return (
                <div key={method.key} className={cn(
                  "rounded-2xl border-2 transition-all overflow-hidden",
                  isExpanded ? `${colorClasses.bg} ${colorClasses.border}` : 'border-slate-100 bg-white hover:border-slate-200'
                )}>
                  <button
                    onClick={() => setExpandedPayment(isExpanded ? null : method.key)}
                    className="w-full flex items-center justify-between p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                        isExpanded ? `${colorClasses.bg}` : 'bg-slate-50'
                      )}>
                        <method.icon size={18} className={isExpanded ? colorClasses.text : 'text-slate-400'} />
                      </div>
                      <div className="text-left">
                        <p className={cn("text-sm font-black", isExpanded ? colorClasses.text : 'text-slate-900')}>{method.label}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{method.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {amount > 0 && (
                        <span className={cn("text-sm font-black tabular-nums", colorClasses.text)}>{formatCurrency(amount)}</span>
                      )}
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-300" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3.5 pb-3.5 space-y-2.5">
                          {/* Quick amounts */}
                          <div className="flex gap-1.5">
                            {QUICK_AMOUNTS.slice(0, 4).map((amt) => (
                              <button key={amt} onClick={() => setAmount(amt)}
                                className={cn(
                                  "flex-1 py-2 rounded-xl text-[9px] font-black border-2 transition-all",
                                  amount === amt
                                    ? `${colorClasses.bg} ${colorClasses.border} ${colorClasses.text}`
                                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                )}>
                                {formatCurrency(amt)}
                              </button>
                            ))}
                          </div>
                          {/* Custom input */}
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">₦</span>
                            <input type="number" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))}
                              placeholder={`Enter ${method.label.toLowerCase()} amount`}
                              className={cn(
                                "w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border-2 text-sm font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-300",
                                `focus:border-${color}-500 focus:ring-2 focus:ring-${color}-500/20`
                              )} />
                          </div>
                          {/* HMO provider field */}
                          {method.key === 'hmo' && (
                            <input type="text" value={hmoProvider} onChange={(e) => setHmoProvider(e.target.value)}
                              placeholder="HMO provider name"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-slate-100 focus:border-amber-500 text-sm font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-300" />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Payment Footer */}
          <div className="shrink-0 p-4 border-t border-slate-100 space-y-3 bg-white">
            {/* Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Total</span>
                <span className="text-lg font-black text-slate-900 tabular-nums">{formatCurrency(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Paid</span>
                <span className={cn("font-black tabular-nums", totalPaid >= total ? "text-emerald-600" : "text-amber-600")}>{formatCurrency(totalPaid)}</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                <span className="font-bold text-slate-500">Balance</span>
                <span className={cn("text-base font-black tabular-nums", balance > 0 ? "text-rose-500" : "text-emerald-600")}>
                  {balance > 0 ? formatCurrency(balance) : "₦0"}
                </span>
              </div>
            </div>

            {/* Quick balance fill */}
            {balance > 0 && (
              <div className="flex gap-1.5">
                {QUICK_AMOUNTS.filter(a => a <= balance).slice(0, 3).map((amt) => (
                  <button key={amt} onClick={() => setCashAmount(cashAmount + amt)}
                    className="flex-1 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[8px] font-black text-slate-500 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                    +{formatCurrency(amt)}
                  </button>
                ))}
                <button onClick={() => setCashAmount(cashAmount + balance)}
                  className="flex-1 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[8px] font-black text-emerald-700 hover:bg-emerald-100 transition-all">
                  Exact {formatCurrency(balance)}
                </button>
              </div>
            )}

            {/* Complete Button */}
            <motion.button
              whileTap={canComplete ? { scale: 0.98 } : {}}
              onClick={handleCompleteSale}
              disabled={!canComplete}
              className={cn(
                "w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2.5",
                canComplete
                  ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-xl shadow-emerald-500/20"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              {cartItems.length === 0 ? (
                <><ShoppingCart size={16} /> Cart is Empty</>
              ) : balance > 0 ? (
                <><Wallet size={16} /> Collect {formatCurrency(balance)}</>
              ) : (
                <><CheckCircle2 size={18} /> Complete Sale</>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ═══ Close Shift Modal ═══ */}
      <Modal isOpen={showCloseShift} onClose={() => setShowCloseShift(false)} title="End Shift">
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-500">Cashier</span><span className="font-bold text-slate-900">{activeShift.cashierName}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Transactions</span><span className="font-bold text-slate-900">{completedTxnCount}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Opening Balance</span><span className="font-bold text-slate-900">{formatCurrency(activeShift.openingBalance)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Today's Revenue</span><span className="font-black text-emerald-600">{formatCurrency(todayTotal)}</span></div>
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Actual Cash in Drawer</label>
            <input type="number" value={closingCash || ''} onChange={(e) => setClosingCash(Number(e.target.value))}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 text-sm font-bold text-slate-900 focus:outline-none transition-all" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCloseShift(false)}
              className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button onClick={handleCloseShift}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 text-white text-xs font-black uppercase tracking-widest hover:from-rose-700 hover:to-rose-600 shadow-lg shadow-rose-500/20 transition-all">
              End Shift
            </button>
          </div>
        </div>
      </Modal>

      {/* ═══ Receipt Modal ═══ */}
      <Modal isOpen={!!showReceipt} onClose={() => setShowReceipt(null)} title="" className="max-w-sm">
        {showReceipt && (
          <div className="space-y-5">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20"
              >
                <CheckCircle2 size={32} className="text-white" />
              </motion.div>
              <h3 className="text-xl font-black text-slate-900">Payment Successful</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">
                {showReceipt.receiptNumber}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              {showReceipt.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[9px] text-slate-400">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <span className="font-black text-slate-900 tabular-nums shrink-0 ml-2">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold tabular-nums">{formatCurrency(showReceipt.subtotal)}</span></div>
              {showReceipt.discount > 0 && (
                <div className="flex justify-between"><span className="text-rose-500">Discount</span><span className="font-bold text-rose-500 tabular-nums">-{formatCurrency(showReceipt.discount)}</span></div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-1.5"><span className="font-bold text-slate-700">Total</span><span className="font-black text-slate-900 tabular-nums">{formatCurrency(showReceipt.total)}</span></div>
              <div className="border-t border-slate-100 pt-1.5 space-y-1">
                {showReceipt.payments.map((p, i) => (
                  <div key={i} className="flex justify-between text-[10px]">
                    <span className="text-slate-400 capitalize font-medium">{p.method}</span>
                    <span className="font-bold text-slate-600 tabular-nums">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
              {showReceipt.balance > 0 && (
                <div className="flex justify-between text-[10px]"><span className="text-rose-500 font-bold">Balance</span><span className="text-rose-500 font-black tabular-nums">{formatCurrency(showReceipt.balance)}</span></div>
              )}
            </div>

            <div className="text-[9px] text-slate-400 text-center space-y-0.5">
              <p>{showReceipt.cashierName} &bull; {new Date(showReceipt.timestamp).toLocaleString()}</p>
              {patientName && <p className="font-medium text-slate-500">Patient: {patientName}</p>}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setShowReceipt(null); }}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 size={16} /> New Sale
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ShiftTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = React.useState('');
  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(startTime).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setElapsed(`${h}h ${m}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [startTime]);
  return <><Timer size={10} className="inline mr-1" />{elapsed}</>;
}
