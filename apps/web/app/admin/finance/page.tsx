"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, CreditCard, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Search, Filter,
  Download, MoreVertical, CheckCircle2, Clock,
  AlertCircle, Receipt, DollarSign, PieChart,
  ArrowRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModals } from "@/lib/modal-context";
import { usePlatformOverview } from "@/hooks/useClinics";
import { useInvoices } from "@/hooks/useBilling";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

export default function FinanceDashboardPage() {
  const { openModal } = useModals();

  const { data: overview, isLoading: loadingOverview } = usePlatformOverview();
  const { data: invoices = [], isLoading: loadingInvoices } = useInvoices();

  const monthlyRevenue = overview?.stats?.monthlyRevenue ?? null;
  const estimatedARR = monthlyRevenue == null ? null : monthlyRevenue * 12;
  const hmoCoverage = overview?.stats?.hmoUsage ?? null;

  // Real transactions mapped from paid invoices
  const transactions = useMemo(() => {
    return invoices.map((inv: any) => {
      const patientName = inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : "Direct Patient";
      return {
        id: inv.invoiceNumber || inv.id.slice(0, 8),
        clinic: patientName,
        amount: formatNGN(inv.amountPaid || inv.totalAmount),
        date: inv.createdAt ? inv.createdAt.slice(0, 10) : "Recent",
        method: inv.paymentMethod ? inv.paymentMethod.toUpperCase() : "PAYSTACK",
        status: inv.status === "paid" ? "Success" : inv.status === "pending" ? "Pending" : "Failed",
        type: inv.paymentMethod === "hmo" ? "HMO Claim" : "Direct Service",
      };
    });
  }, [invoices]);

  const unpaidInvoices = useMemo(() => {
    return invoices
      .filter((inv: any) => inv.status === "pending" || inv.status === "partially_paid")
      .map((inv: any) => ({
        id: inv.invoiceNumber || inv.id.slice(0, 8),
        clinic: inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : "Client",
        amount: formatNGN(inv.balance || inv.totalAmount),
        dueDate: inv.dueDate ? inv.dueDate.slice(0, 10) : "Due Now",
        status: "Unpaid",
      }));
  }, [invoices]);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Financial Management</h1>
          <p className="text-slate-500 font-medium mt-1">Live platform revenue, invoice reconciliation, and billing health.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="default" size="sm" className="gap-2" onClick={() => openModal("invoice")}>
            <Receipt size={16} /> Create Invoice
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Projected ARR", val: estimatedARR == null ? "No data available" : formatNGN(estimatedARR), trend: "+12.5%", icon: DollarSign, color: "brand-blue" },
          { label: "Monthly Revenue (MRR)", val: monthlyRevenue == null ? "No data available" : formatNGN(monthlyRevenue), trend: "Live Month", icon: TrendingUp, color: "emerald" },
          { label: "Active Invoices", val: String(invoices.length), trend: `${unpaidInvoices.length} pending`, icon: Wallet, color: "amber" },
          { label: "HMO Coverage Rate", val: hmoCoverage ?? "No data available", trend: "Claim share", icon: PieChart, color: "rose" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", 
                stat.color === "brand-blue" ? "bg-brand-soft-blue text-brand-blue group-hover:bg-brand-blue group-hover:text-white" :
                stat.color === "emerald" ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white" :
                stat.color === "amber" ? "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white" :
                "bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white"
              )}>
                <stat.icon size={24} />
              </div>
              <div className={cn("text-xs font-bold px-2 py-1 rounded-full", 
                stat.trend.startsWith("+") ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"
              )}>
                {stat.trend}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-brand-navy">{stat.val}</h4>
          </div>
        ))}
      </div>

      {/* Transactions & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transactions Table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand-navy">Recent Invoicing &amp; Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">Transaction ID</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">Account / Patient</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">Method</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loadingInvoices ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Loader2 size={24} className="animate-spin mx-auto text-brand-blue mb-2" />
                        Loading live ledger...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.slice(0, 10).map((txn, i) => (
                      <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-5 font-mono text-xs font-bold text-brand-blue">{txn.id}</td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-brand-navy">{txn.clinic}</p>
                          <p className="text-xs text-slate-400">{txn.date}</p>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-brand-navy tabular-nums">{txn.amount}</td>
                        <td className="px-8 py-5 text-xs font-semibold text-slate-600">{txn.method}</td>
                        <td className="px-8 py-5">
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                            txn.status === "Success" ? "bg-emerald-100 text-emerald-700" :
                            txn.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Pending Invoices */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Pending Invoices</h2>
            <div className="space-y-4">
              {unpaidInvoices.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">All generated invoices have been settled.</p>
              ) : (
                unpaidInvoices.slice(0, 5).map((inv, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="text-xs font-bold text-brand-navy">{inv.clinic}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{inv.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-navy tabular-nums">{inv.amount}</p>
                      <span className="text-[9px] font-black uppercase text-amber-600">{inv.dueDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
