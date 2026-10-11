"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, CreditCard, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Search, Filter,
  Download, MoreVertical, CheckCircle2, Clock,
  AlertCircle, Receipt, DollarSign, PieChart,
  ArrowRight, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useModals } from "@/lib/modal-context";
import { useAuth } from "@/lib/auth-context";
import { useRevenueSummary } from "@/hooks/useReports";
import { useExpenses, useExpenseSummary } from "@/hooks/useFinance";
import { useDebtorStats } from "@/hooks/useDebtors";
import { api } from "@/lib/api";

interface Clinic {
  id: string;
  name: string;
  isActive: boolean;
}

const affiliates = [
  { name: "Dr. Adebayo", referrals: 12, revenue: "$4,200.00", commission: "$420.00" },
  { name: "Optical Association", referrals: 45, revenue: "$15,800.00", commission: "$1,580.00" },
];

export default function FinanceDashboardPage() {
  const { openModal } = useModals();
  const { user } = useAuth();
  const [selectedClinicId, setSelectedClinicId] = useState<string>("");
  const [clinics, setClinics] = useState<Clinic[]>([]);

  // Real API data
  const { data: revenueSummary, isLoading: revenueLoading } = useRevenueSummary();
  const { data: expenseSummary, isLoading: expenseLoading } = useExpenseSummary();
  const { data: debtorStats, isLoading: debtorLoading } = useDebtorStats();
  const [invoicesData, setInvoicesData] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Fetch clinics for selector
  React.useEffect(() => {
    if (user?.roles?.includes("ADMIN")) {
      api.get("/clinics").then(res => setClinics(res.data.filter((c: Clinic) => c.isActive))).catch(() => {});
    }
  }, [user?.roles]);

  // Fetch invoices for selected clinic
  React.useEffect(() => {
    if (selectedClinicId && user?.roles?.includes("ADMIN")) {
      setInvoicesLoading(true);
      api.get("/billing/invoices", { params: { clinicId: selectedClinicId, limit: 10 } })
        .then(res => setInvoicesData(res.data.invoices || res.data))
        .catch(() => setInvoicesData([]))
        .finally(() => setInvoicesLoading(false));
    } else if (user?.roles?.includes("ADMIN")) {
      // Fetch all clinics' invoices - use first clinic or all
      api.get("/billing/invoices", { params: { limit: 10 } })
        .then(res => setInvoicesData(res.data.invoices || res.data))
        .catch(() => setInvoicesData([]));
    }
  }, [selectedClinicId, user?.roles]);

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Financial Management</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor platform revenue, transactions, and billing health.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {clinics.length > 0 && (
            <div className="relative">
              <select
                value={selectedClinicId || "all"}
                onChange={e => setSelectedClinicId(e.target.value)}
                className="pl-9 pr-10 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-blue/20 appearance-none cursor-pointer"
              >
                <option value="all">All Clinics</option>
                {clinics.map((c: Clinic) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
          )}
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} /> Financial Report
          </Button>
          <Button variant="default" size="sm" className="gap-2" onClick={() => openModal("invoice")}>
            <Receipt size={16} /> Create Invoice
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: "Total Revenue", 
            val: revenueSummary ? `$${revenueSummary.totalRevenue?.toLocaleString() ?? "0"}` : (revenueLoading ? "—" : "$0"), 
            trend: revenueSummary?.netProfit && revenueSummary.netProfit > 0 ? `+${((revenueSummary.netProfit / (revenueSummary.totalRevenue || 1)) * 100).toFixed(1)}%` : "—",
            icon: DollarSign, 
            color: "brand-blue" 
          },
          { 
            label: "Monthly Revenue", 
            val: revenueSummary ? `$${revenueSummary.totalPaid?.toLocaleString() ?? "0"}` : (revenueLoading ? "—" : "$0"), 
            trend: "—",
            icon: TrendingUp, 
            color: "emerald" 
          },
          { 
            label: "Total Expenses", 
            val: expenseSummary ? `$${expenseSummary.total?.toLocaleString() ?? "0"}` : (expenseLoading ? "—" : "$0"), 
            trend: "—",
            icon: Wallet, 
            color: "amber" 
          },
          { 
            label: "Outstanding Invoices", 
            val: debtorStats ? `$${debtorStats.totalOwed?.toLocaleString() ?? "0"}` : (debtorLoading ? "—" : "$0"), 
            trend: debtorStats?.totalOwed && debtorStats.totalOwed > 0 ? `+${debtorStats.byStatus?.overdue || 0} overdue` : "—",
            icon: PieChart, 
            color: "rose" 
          },
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
                stat.trend?.startsWith("+") ? "bg-emerald-100 text-emerald-700" : 
                stat.trend?.startsWith("-") ? "bg-rose-100 text-rose-700" :
                "bg-slate-100 text-slate-600"
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
                  {invoicesData?.map((inv: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-brand-navy">{inv.invoiceNumber ?? inv.id}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : "—"}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-700">{inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : "Unknown"}</p>
                        <p className="text-[10px] text-brand-blue font-bold uppercase tracking-tighter">{inv.status}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-brand-navy">{inv.total ? `₦${inv.total.toLocaleString()}` : "—"}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          inv.status === "paid" ? "bg-emerald-50 text-emerald-600" :
                          inv.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {inv.status === "paid" ? <CheckCircle2 size={12} /> : 
                           inv.status === "pending" ? <Clock size={12} /> : <AlertCircle size={12} />}
                          {inv.status}
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

          {/* Affiliate & Commission Tracking Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-brand-navy">Affiliate & Commission Tracking</h2>
                <p className="text-xs text-slate-500 font-medium">Manage partner referrals and platform earnings.</p>
              </div>
              <Button variant="outline" size="sm" className="text-xs font-bold">Manage Affiliates</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referrals</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission Due</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {affiliates.map((aff, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-brand-navy">{aff.name}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-700">{aff.referrals}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-brand-navy">{aff.revenue}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-emerald-600">{aff.commission}</p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button variant="ghost" size="sm" className="text-brand-blue text-xs font-black">Pay Now</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Revenue Distribution & Invoices */}
        <div className="space-y-6">
          {/* Pending Invoices Summary */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-brand-navy">Pending Invoices</h3>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Action Required</span>
            </div>
            <div className="space-y-4">
              {(invoicesData || []).slice(0, 5).map((inv: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-brand-blue/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{inv.invoiceNumber ?? inv.id}</p>
                      <p className="text-sm font-bold text-brand-navy">{inv.patient ? `${inv.patient.firstName} ${inv.patient.lastName}` : "Unknown"}</p>
                    </div>
                    <p className="text-sm font-black text-brand-navy">{inv.total ? `₦${inv.total.toLocaleString()}` : "—"}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-tighter flex items-center gap-1",
                      inv.status === "overdue" ? "text-rose-600" : "text-amber-600"
                    )}>
                      <Clock size={10} /> {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black text-brand-blue p-0 hover:bg-transparent">Send Reminder</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 rounded-xl text-xs font-bold border-slate-200" onClick={() => openModal("invoice")}>View All Invoices</Button>
          </div>

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
            <h3 className="text-lg font-bold mb-2">Commission Analysis</h3>
            <p className="text-xs text-emerald-100 mb-6 leading-relaxed">
              Platform fees and partner commissions are calculated for the current billing cycle.
            </p>
            <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl text-sm" onClick={() => openModal("invoice")}>Generate Commission Report</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
