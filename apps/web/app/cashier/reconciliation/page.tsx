"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePosStore, formatCurrency } from "@/store/posStore";
import {
  BarChart3, Wallet, TrendingUp, TrendingDown,
  CheckCircle2, Clock, Receipt, Printer, DollarSign,
  Banknote, CreditCard, Building2, ShieldCheck, AlertCircle
} from "lucide-react";

export default function ReconciliationPage() {
  const transactions = usePosStore((s) => s.transactions);
  const shiftHistory = usePosStore((s) => s.shiftHistory);
  const activeShift = usePosStore((s) => s.activeShift);

  const todayTxns = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return transactions.filter((t) => new Date(t.timestamp) >= today && t.status === 'completed');
  }, [transactions]);

  const stats = useMemo(() => {
    const totalRevenue = todayTxns.reduce((s, t) => s + t.total, 0);
    const totalCash = todayTxns.reduce((s, t) => s + t.payments.filter(p => p.method === 'cash').reduce((a, p) => a + p.amount, 0), 0);
    const totalCard = todayTxns.reduce((s, t) => s + t.payments.filter(p => p.method === 'card').reduce((a, p) => a + p.amount, 0), 0);
    const totalTransfer = todayTxns.reduce((s, t) => s + t.payments.filter(p => p.method === 'transfer').reduce((a, p) => a + p.amount, 0), 0);
    const totalHmo = todayTxns.reduce((s, t) => s + t.payments.filter(p => p.method === 'hmo').reduce((a, p) => a + p.amount, 0), 0);
    const avgTicket = todayTxns.length > 0 ? Math.round(totalRevenue / todayTxns.length) : 0;
    return { totalRevenue, totalCash, totalCard, totalTransfer, totalHmo, avgTicket, count: todayTxns.length };
  }, [todayTxns]);

  const today = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Reconciliation</h1>
        <p className="text-sm text-slate-500 font-medium">{today}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Transactions", value: stats.count, icon: Receipt, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Avg Ticket", value: formatCurrency(stats.avgTicket), icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Shift Status", value: activeShift ? "Open" : "Closed", icon: activeShift ? Clock : CheckCircle2, color: activeShift ? "text-amber-600" : "text-slate-600", bg: activeShift ? "bg-amber-50" : "bg-slate-100" },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            key={stat.label}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-lg font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Cash", amount: stats.totalCash, icon: Banknote, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Card", amount: stats.totalCard, icon: CreditCard, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
          { label: "Transfer", amount: stats.totalTransfer, icon: Building2, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
          { label: "HMO", amount: stats.totalHmo, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
        ].map((method, i) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            key={method.label}
            className={cn("p-5 rounded-2xl border bg-white shadow-sm", method.border)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", method.bg, method.color)}>
                <method.icon size={20} />
              </div>
              <span className="text-sm font-black text-slate-900">{method.label}</span>
            </div>
            <p className={cn("text-2xl font-black", method.color)}>{formatCurrency(method.amount)}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              {stats.totalRevenue > 0 ? `${Math.round((method.amount / stats.totalRevenue) * 100)}%` : '0%'} of revenue
            </p>
          </motion.div>
        ))}
      </div>

      {/* Shift History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Shift History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cashier</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Opened</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Closed</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Opening</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Expected</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Actual</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Discrepancy</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Txns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {shiftHistory.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-400 font-medium">No shifts closed yet</td></tr>
              )}
              {[...shiftHistory].reverse().map((shift, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  key={shift.id}
                  className="hover:bg-slate-50/50"
                >
                  <td className="px-5 py-4"><span className="text-xs font-bold text-slate-900">{shift.cashierName}</span></td>
                  <td className="px-5 py-4"><span className="text-[10px] text-slate-500">{new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                  <td className="px-5 py-4"><span className="text-[10px] text-slate-500">{shift.endTime ? new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span></td>
                  <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700">{formatCurrency(shift.openingBalance)}</span></td>
                  <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700">{formatCurrency(shift.expectedCash || 0)}</span></td>
                  <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700">{formatCurrency(shift.actualCash || 0)}</span></td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-xs font-black",
                      (shift.discrepancy || 0) !== 0 ? "text-rose-600" : "text-emerald-600"
                    )}>
                      {shift.discrepancy !== undefined && shift.discrepancy !== 0
                        ? `${shift.discrepancy > 0 ? '+' : ''}${formatCurrency(shift.discrepancy)}`
                        : '₦0'}
                    </span>
                  </td>
                  <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700">{shift.transactionIds.length}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Transactions Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Transactions</h2>
          <span className="text-xs font-bold text-slate-500">{todayTxns.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Receipt</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cashier</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {todayTxns.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400 font-medium">No transactions today</td></tr>
              )}
              {todayTxns.map((txn, i) => (
                <tr key={txn.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3"><span className="text-xs font-black text-slate-900">{txn.receiptNumber}</span></td>
                  <td className="px-5 py-3"><span className="text-xs font-bold text-slate-700">{txn.cashierName}</span></td>
                  <td className="px-5 py-3"><span className="text-[10px] text-slate-500">{new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                  <td className="px-5 py-3"><span className="text-xs font-bold text-slate-700">{txn.items.length}</span></td>
                  <td className="px-5 py-3"><span className="text-sm font-black text-slate-900">{formatCurrency(txn.total)}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {txn.payments.map((p) => (
                        <span key={p.method} className={cn(
                          "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest",
                          p.method === 'cash' ? 'bg-emerald-100 text-emerald-700' :
                          p.method === 'card' ? 'bg-sky-100 text-sky-700' :
                          p.method === 'transfer' ? 'bg-violet-100 text-violet-700' :
                          'bg-amber-100 text-amber-700'
                        )}>{p.method}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
