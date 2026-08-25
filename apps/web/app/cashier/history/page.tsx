"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { usePosStore, formatCurrency } from "@/store/posStore";
import {
  Receipt, Search, Filter, Printer, X, CheckCircle2,
  RotateCcw, Timer, User, Wallet, ArrowRight
} from "lucide-react";

export default function HistoryPage() {
  const transactions = usePosStore((s) => s.transactions);
  const voidTransaction = usePosStore((s) => s.voidTransaction);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTxn, setSelectedTxn] = useState<typeof transactions[0] | null>(null);
  const [showVoid, setShowVoid] = useState<typeof transactions[0] | null>(null);

  const filtered = transactions.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.receiptNumber.toLowerCase().includes(q) ||
        t.cashierName.toLowerCase().includes(q) ||
        (t.patientName && t.patientName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transaction History</h1>
          <p className="text-sm text-slate-500 font-medium">{transactions.length} total transactions</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by receipt, cashier, or patient..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold text-slate-900 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 focus:outline-none">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="voided">Voided</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Receipt</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cashier</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400 font-medium">No transactions found</td></tr>
              )}
              {filtered.map((txn, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  key={txn.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-xs font-black text-slate-900">{txn.receiptNumber}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-700">{txn.cashierName}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-500">{txn.patientName || '—'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-700">{txn.items.length}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-black text-slate-900">{formatCurrency(txn.total)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                      txn.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      txn.status === 'voided' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    )}>{txn.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedTxn(txn)}
                        className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors" title="View Details">
                        <Receipt size={13} />
                      </button>
                      {txn.status === 'completed' && (
                        <button onClick={() => setShowVoid(txn)}
                          className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors" title="Void">
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      <Modal isOpen={!!selectedTxn} onClose={() => setSelectedTxn(null)} title={`Receipt ${selectedTxn?.receiptNumber || ''}`}>
        {selectedTxn && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
              {selectedTxn.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[9px] text-slate-400">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <span className="font-black text-slate-900">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-bold">{formatCurrency(selectedTxn.subtotal)}</span></div>
              {selectedTxn.discount > 0 && <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-bold text-rose-500">-{formatCurrency(selectedTxn.discount)}</span></div>}
              <div className="flex justify-between border-t pt-1"><span className="font-bold text-slate-700">Total</span><span className="font-black">{formatCurrency(selectedTxn.total)}</span></div>
              {selectedTxn.payments.map((p, i) => (
                <div key={i} className="flex justify-between text-[10px]"><span className="text-slate-400 capitalize">{p.method}</span><span className="font-bold">{formatCurrency(p.amount)}</span></div>
              ))}
              {selectedTxn.balance > 0 && <div className="flex justify-between"><span className="text-rose-500 font-bold">Balance</span><span className="text-rose-500 font-black">{formatCurrency(selectedTxn.balance)}</span></div>}
            </div>
            <div className="text-[10px] text-slate-400 text-center">
              {selectedTxn.cashierName} &bull; {new Date(selectedTxn.timestamp).toLocaleString()}
            </div>
            <button onClick={() => setSelectedTxn(null)}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Void Modal */}
      <Modal isOpen={!!showVoid} onClose={() => setShowVoid(null)} title="Void Transaction">
        {showVoid && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Void receipt <strong>{showVoid.receiptNumber}</strong> for <strong>{formatCurrency(showVoid.total)}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowVoid(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => { voidTransaction(showVoid.id); setShowVoid(null); }}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700">
                Void Transaction
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
