"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import {
  useCashierTransactions,
  useCashierShifts,
  useActiveShift,
  useDailySummary,
  CashierShift,
} from "@/hooks/useCashier";
import {
  DollarSign, Receipt, TrendingUp, Clock, CheckCircle2,
  Banknote, CreditCard, Building2, ShieldCheck, Eye, AlertCircle, Calendar
} from "lucide-react";

function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export default function ReconciliationPage() {
  const { data: transactions = [], isLoading } = useCashierTransactions();
  const { data: shifts = [] } = useCashierShifts();
  const { data: activeShift } = useActiveShift();
  const { data: dailySummary } = useDailySummary();

  const [selectedShift, setSelectedShift] = useState<CashierShift | null>(null);

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

      {/* Shifts History Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Cashier Shifts History</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any shift to view reconciliation details, expected cash, and notes</p>
          </div>
          <span className="text-xs font-bold text-slate-500">{shifts.length} shifts logged</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Cashier</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Opened</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Closed</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Opening Float</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Actual Cash</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {shifts.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-400 font-medium">No cashier shifts found</td></tr>
              )}
              {shifts.map((shift, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  key={shift.id}
                  onClick={() => setSelectedShift(shift)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-900">
                      {shift.staff ? `${shift.staff.firstName} ${shift.staff.lastName}` : shift.cashierName || "Cashier"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {shift.createdAt ? new Date(shift.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {shift.endTime ? new Date(shift.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : (shift.status === 'open' ? "Active Now" : "—")}
                    </span>
                  </td>
                  <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700">{formatCurrency(shift.openingBalance)}</span></td>
                  <td className="px-5 py-4"><span className="text-xs font-bold text-slate-700">{shift.actualCash != null ? formatCurrency(shift.actualCash) : "—"}</span></td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                      shift.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>{shift.status}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedShift(shift);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Today's Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today&apos;s Transactions</h2>
          <span className="text-xs font-bold text-slate-500">{todayTxns.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
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
              {todayTxns.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3"><span className="text-xs font-black text-slate-900">{txn.receiptNumber}</span></td>
                  <td className="px-5 py-3"><span className="text-xs font-bold text-slate-700">{txn.cashierName}</span></td>
                  <td className="px-5 py-3"><span className="text-[10px] text-slate-500">{new Date(txn.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></td>
                  <td className="px-5 py-3"><span className="text-xs font-bold text-slate-700">{txn.items.length}</span></td>
                  <td className="px-5 py-3"><span className="text-sm font-black text-slate-900">{formatCurrency(txn.total)}</span></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 flex-wrap">
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

      {/* Shift Detail Modal */}
      <Modal
        isOpen={!!selectedShift}
        onClose={() => setSelectedShift(null)}
        title="Shift Reconciliation Details"
      >
        {selectedShift && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Cashier:</span>
                <span className="font-black text-slate-900">
                  {selectedShift.staff ? `${selectedShift.staff.firstName} ${selectedShift.staff.lastName}` : selectedShift.cashierName || "Cashier"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                  selectedShift.status === "open" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                )}>
                  {selectedShift.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Opened At:</span>
                <span className="font-bold text-slate-800">
                  {selectedShift.createdAt ? new Date(selectedShift.createdAt).toLocaleString() : "—"}
                </span>
              </div>
              {selectedShift.endTime && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Closed At:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedShift.endTime).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Opening Balance (Float):</span>
                <span className="font-black text-slate-900">{formatCurrency(selectedShift.openingBalance)}</span>
              </div>
              {selectedShift.expectedCash != null && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Expected Cash:</span>
                  <span className="font-black text-slate-900">{formatCurrency(selectedShift.expectedCash)}</span>
                </div>
              )}
              {selectedShift.actualCash != null && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Actual Cash Counted:</span>
                  <span className="font-black text-slate-900">{formatCurrency(selectedShift.actualCash)}</span>
                </div>
              )}
              {selectedShift.discrepancy != null && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-700">Discrepancy (Over / Short):</span>
                  <span className={cn(
                    "font-black text-sm",
                    selectedShift.discrepancy === 0 ? "text-emerald-600" :
                    selectedShift.discrepancy > 0 ? "text-emerald-700" : "text-rose-600"
                  )}>
                    {selectedShift.discrepancy >= 0 ? "+" : ""}{formatCurrency(selectedShift.discrepancy)}
                  </span>
                </div>
              )}
            </div>

            {selectedShift.notes && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Shift Notes</p>
                <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap">{selectedShift.notes}</p>
              </div>
            )}

            <button
              onClick={() => setSelectedShift(null)}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-black uppercase text-xs hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
