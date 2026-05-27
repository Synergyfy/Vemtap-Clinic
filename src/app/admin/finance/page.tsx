"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Wallet, CreditCard, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Search, Filter,
  Download, MoreVertical, CheckCircle2, Clock,
  AlertCircle, Receipt, DollarSign, PieChart,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModals } from "@/lib/modal-context";

const transactions = [
  { id: "TXN-8492", clinic: "ClearVision Eye Clinic", amount: "$1,240.00", date: "2 hours ago", method: "Paystack", status: "Success", type: "Subscription" },
  { id: "TXN-8491", clinic: "Lagos Vision Center", amount: "$240.00", date: "5 hours ago", method: "Flutterwave", status: "Success", type: "Add-on" },
  { id: "TXN-8490", clinic: "Optimal Optical", amount: "$99.00", date: "8 hours ago", method: "Bank Transfer", status: "Pending", type: "Subscription" },
  { id: "TXN-8489", clinic: "Precision Eyecare", amount: "$480.00", date: "Yesterday", method: "Paystack", status: "Success", type: "Subscription" },
  { id: "TXN-8488", clinic: "Elite Vision Hospital", amount: "$2,400.00", date: "Yesterday", method: "Direct Debit", status: "Failed", type: "Enterprise" },
];

export default function FinanceDashboardPage() {
  const { openModal } = useModals();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Financial Management</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor platform revenue, transactions, and billing health.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} /> Financial Report
          </Button>
          <Button variant="primary" size="sm" className="gap-2" onClick={() => openModal("invoice")}>
            <Receipt size={16} /> Manage Invoices
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue (ARR)", val: "$1.8M", trend: "+12.5%", icon: DollarSign, color: "brand-blue" },
          { label: "Monthly Revenue (MRR)", val: "$142,500", trend: "+8.2%", icon: TrendingUp, color: "emerald" },
          { label: "Pending Payouts", val: "$24,200", trend: "-4.1%", icon: Wallet, color: "amber" },
          { label: "Churn Rate", val: "1.2%", trend: "-0.5%", icon: PieChart, color: "rose" },
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
                stat.trend.startsWith("+") ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
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
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-brand-navy">Recent Transactions</h2>
            <div className="flex items-center gap-3">
              <div className="relative group hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors" size={14} />
                <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-blue/20" />
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-2">
                <Filter size={14} /> Filter
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((txn, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-brand-navy">{txn.id}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{txn.date} via {txn.method}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{txn.clinic}</p>
                      <p className="text-[10px] text-brand-blue font-bold uppercase tracking-tighter">{txn.type}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-brand-navy">{txn.amount}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        txn.status === "Success" ? "bg-emerald-50 text-emerald-600" :
                        txn.status === "Pending" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {txn.status === "Success" ? <CheckCircle2 size={12} /> : 
                         txn.status === "Pending" ? <Clock size={12} /> : <AlertCircle size={12} />}
                        {txn.status}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-8 h-8 p-0 rounded-lg"
                        onClick={() => openModal("transaction")}
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50/30 border-t border-slate-50 text-center">
            <Button variant="ghost" size="sm" className="text-brand-blue font-bold gap-2 hover:bg-transparent hover:gap-3 transition-all">
              View All Transactions <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* Revenue Distribution */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy mb-6">Revenue Sources</h3>
            <div className="space-y-6">
              {[
                { label: "Starter Plan", val: "15%", color: "slate-400" },
                { label: "Growth Plan", val: "45%", color: "brand-blue" },
                { label: "Enterprise", val: "30%", color: "brand-navy" },
                { label: "Add-ons", val: "10%", color: "emerald-500" },
              ].map((src, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">{src.label}</span>
                    <span className="text-brand-navy">{src.val}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: src.val }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={cn("h-full rounded-full", 
                        src.color === "brand-blue" ? "bg-brand-blue" :
                        src.color === "brand-navy" ? "bg-brand-navy" :
                        src.color === "emerald-500" ? "bg-emerald-500" : "bg-slate-400"
                      )}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <TrendingUp className="text-emerald-100 mb-6" size={32} />
            <h3 className="text-lg font-bold mb-2">Payouts Ready</h3>
            <p className="text-xs text-emerald-100 mb-6 leading-relaxed">
              Platform commissions for this period are calculated and ready for processing.
            </p>
            <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl text-sm" onClick={() => openModal("invoice")}>Review Payouts</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
