"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCashierTransactions, useCashierShifts, useActiveShift } from "@/hooks/useCashier";
import {
  DollarSign, Receipt, TrendingUp, Clock, CheckCircle2,
  Banknote, CreditCard, Building2, ShieldCheck
} from "lucide-react";

function formatCurrency(amount: number): string {
  return `\u20A6${amount.toLocaleString()}`;
}

export default function ReconciliationPage() {
  const { data: transactions = [], isLoading } = useCashierTransactions();
  const { data: shifts = [] } = useCashierShifts();
  const { data: activeShift } = useActiveShift();

  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const todayTxns = useMemo(() =>
    transactions.filter((t) => new Date(t.createdAt) >= today && t.status === "completed"),
    [transactions, today]
  );

  const stats = useMemo(() => {
    const totalRevenue = todayTxns.reduce((s, t) => s + t.total, 0);
    const totalCash = todayTxns.reduce((s, t) => s + t.payments.filter((p) => p.method === "cash").reduce((a, p) => a + p.amount, 0), 0);
    const totalCard = todayTxns.reduce((s, t) => s + t.payments.filter((p) => p.method === "card").reduce((a, p) => a + p.amount, 0), 0);
    const totalTransfer = todayTxns.reduce((s, t) => s + t.payments.filter((p) => p.method === "transfer").reduce((a, p) => a + p.amount, 0), 0);
    const totalHmo = todayTxns.reduce((s, t) => s + t.payments.filter((p) => p.method === "hmo").reduce((a, p) => a + p.amount, 0), 0);
    const avgTicket = todayTxns.length > 0 ? Math.round(totalRevenue / todayTxns.length) : 0;
    return { totalRevenue, totalCash, totalCard, totalTransfer, totalHmo, avgTicket, count: todayTxns.length };
  }, [todayTxns]);

  const dateStr = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Reconciliation</h1>
        <p className="text-sm text-slate-500 font-medium">{dateStr}</p>
      </div>

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
              {stats.totalRevenue > 0 ? `${Math.round((method.amount / stats.totalRevenue) * 100)}%` : "0%"} of revenue
            </p>
          </motion.div>
        ))}
      </div>

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
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Actual</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {shifts.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400 font-medium">No shifts yet</td></tr>
              )}
              {shifts.map((shift, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  key={shift.id}
                  className="hover:bg-slate-50/50"
                >
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-900">{shift.staff ? `${shift.staff.firstName} ${shift.staff.lastName}` : shift.cashierName || "Cashier"}</span>
                  </td>
                  <td className="px-5 py-4"><span className="text-[10px] text-slate-500">{shift.createdAt ? new Date(shift.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "\u2014"}</span></td>
                  <td className="px-5 py-4"><span className="text-[10px] text-slate-500">{shift.endTime ? new Date(shift.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "\u2014"}</span></td>
                  <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700">{formatCurrency(shift.openingBalance)}</span></td>
                  <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700">{shift.actualCash != null ? formatCurrency(shift.actualCash) : "\u2014"}</span></td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                      shift.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>{shift.status}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today&apos;s Transactions</h2>
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
                  <td className="px-5 py-3"><span className="text-[10px] text-slate-500">{new Date(txn.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></td>
                  <td className="px-5 py-3"><span className="text-xs font-bold text-slate-700">{txn.items.length}</span></td>
                  <td className="px-5 py-3"><span className="text-sm font-black text-slate-900">{formatCurrency(txn.total)}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {txn.payments.map((p, pi) => (
                        <span key={pi} className={cn(
                          "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest",
                          p.method === "cash" ? "bg-emerald-100 text-emerald-700" :
                          p.method === "card" ? "bg-sky-100 text-sky-700" :
                          p.method === "transfer" ? "bg-violet-100 text-violet-700" :
                          "bg-amber-100 text-amber-700"
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
