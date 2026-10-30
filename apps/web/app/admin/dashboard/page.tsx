"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { 
  Building2, Users, CreditCard, Activity, 
  AlertCircle, Ticket, ArrowUpRight, ArrowDownRight,
  Plus, Calendar, Filter, Download, ChevronRight, Zap, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { usePlatformOverview } from "@/hooks/useClinics";
import { OnboardingModal } from "@/components/popups/onboarding-modal";

const formatNGN = (value: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

export default function AdminDashboard() {
  const router = useRouter();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { user } = useAuth();
  const adminName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Admin" : "Admin";
  const adminRole = user?.roles?.[0] ? user.roles[0].replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Admin";

  // Live Query from backend API
  const { data: overview, isLoading, isError, refetch } = usePlatformOverview();

  const totalClinics = overview?.stats?.totalClinics ?? null;
  const activeClinics = overview?.stats?.activeClinics ?? null;
  const activeUsers = overview?.stats?.activeUsers ?? null;
  const monthlyRevenue = overview?.stats?.monthlyRevenue ?? null;
  const hmoUsage = overview?.stats?.hmoUsage ?? null;

  const recentClinics = overview?.recentClinics ?? [];
  const alerts = overview?.alerts ?? [];

  const stats = [
    { 
      label: "Total Clinics", 
      value: isLoading && !isError ? "..." : totalClinics == null ? "No data" : String(totalClinics), 
      change: activeClinics == null ? "Awaiting data" : `${activeClinics} active`, 
      trend: "up" as const, 
      icon: Building2, 
      color: "blue" 
    },
    { 
      label: "Active Users", 
      value: isLoading && !isError ? "..." : activeUsers == null ? "No data" : String(activeUsers), 
      change: "Staff & Doctors", 
      trend: "up" as const, 
      icon: Users, 
      color: "emerald" 
    },
    { 
      label: "Monthly Revenue", 
      value: isLoading && !isError ? "..." : monthlyRevenue == null ? "No data" : formatNGN(monthlyRevenue), 
      change: "Collected this month", 
      trend: "up" as const, 
      icon: CreditCard, 
      color: "brand-blue" 
    },
    { 
      label: "HMO Usage", 
      value: isLoading && !isError ? "..." : hmoUsage ?? "No data", 
      change: "Claim coverage", 
      trend: "up" as const, 
      icon: Activity, 
      color: "amber" 
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-10">
      <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />

      {/* Header - Mobile Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-navy">Platform Overview</h1>
          <p className="text-sm lg:text-base text-slate-500 mt-1">
            Welcome back, {adminName}. {adminRole} overview with live multi-clinic metrics and infrastructure monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:flex-none gap-2 h-11 px-4 lg:px-6 rounded-xl font-bold border-slate-200"
            onClick={() => router.push("/admin/clinics")}
          >
            <Building2 size={16} /> <span className="hidden xs:inline">Manage Clinics</span>
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 sm:flex-none gap-2 h-11 px-4 lg:px-6 rounded-xl font-bold shadow-lg shadow-brand-blue/20"
            onClick={() => setIsOnboardingOpen(true)}
          >
            <Plus size={16} /> <span className="hidden xs:inline">New Clinic</span><span className="xs:hidden">Add Clinic</span>
          </Button>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-800 text-sm font-medium">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <span>Connecting to live API. Authentication session may need to be refreshed.</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="border-amber-300 text-amber-800 hover:bg-amber-100">
            Retry Connection
          </Button>
        </div>
      )}

      {/* Stats Grid - Live Data */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center transition-colors",
                stat.color === "blue" && "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                stat.color === "emerald" && "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
                stat.color === "brand-blue" && "bg-brand-soft-blue text-brand-blue group-hover:bg-brand-blue group-hover:text-white",
                stat.color === "amber" && "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
              )}>
                <stat.icon size={20} className="lg:hidden" />
                <stat.icon size={24} className="hidden lg:block" />
              </div>
              <div className="flex items-center gap-1 text-[10px] lg:text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                <ArrowUpRight size={12} className="lg:w-[14px]" />
                {stat.change}
              </div>
            </div>
            <p className="text-xs lg:text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <h3 className="text-xl lg:text-2xl font-black text-brand-navy">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Clinics Table - Live Data */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-brand-navy">Registered Healthcare Providers</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live clinics onboarded on the Vemtap cloud network</p>
            </div>
            <Link href="/admin/clinics" className="text-xs lg:text-sm font-bold text-brand-blue hover:underline bg-brand-soft-blue lg:bg-transparent px-3 py-1 rounded-full lg:p-0">
              {totalClinics == null ? "View All" : `View All (${totalClinics})`}
            </Link>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left min-w-[500px] lg:min-w-0">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 lg:px-8 py-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Name</th>
                  <th className="px-6 lg:px-8 py-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">City / State</th>
                  <th className="px-6 lg:px-8 py-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 lg:px-8 py-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 lg:px-8 py-4 text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Loader2 size={24} className="animate-spin mx-auto text-brand-blue mb-2" />
                      Loading live clinics...
                    </td>
                  </tr>
                ) : recentClinics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No clinics registered yet. Click &quot;New Clinic&quot; to onboard the first provider.
                    </td>
                  </tr>
                ) : (
                  recentClinics.map((clinic) => (
                    <tr 
                      key={clinic.id} 
                      onClick={() => router.push("/admin/clinics")}
                      className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-soft-blue flex items-center justify-center text-xs font-bold text-brand-blue shrink-0">
                            {clinic.name ? clinic.name[0] : "C"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-brand-navy truncate">{clinic.name}</p>
                            <p className="text-[10px] lg:text-xs text-slate-400 truncate">{clinic.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5 hidden sm:table-cell">
                        <span className="text-xs text-slate-600 font-medium">{clinic.city}</span>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5 text-[10px] lg:text-xs text-slate-500">
                        {clinic.phone}
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5">
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", clinic.status === "Active" ? "bg-emerald-500" : "bg-amber-500")}></div>
                          <span className="text-[10px] lg:text-xs font-bold text-slate-700 uppercase tracking-widest">{clinic.status}</span>
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-4 lg:py-5 text-right">
                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-brand-blue">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts & Performance - Stacked on Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg lg:text-xl font-bold text-brand-navy">System Alerts</h2>
              <span className="w-6 h-6 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            </div>
            <div className="space-y-6">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No active system alerts.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex gap-4 group cursor-pointer">
                    <div className={cn(
                      "w-9 h-9 lg:w-10 lg:h-10 rounded-xl shrink-0 flex items-center justify-center",
                      alert.type === "error" ? "bg-red-50 text-red-500" :
                      alert.type === "warning" ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"
                    )}>
                      {alert.type === "error" ? <AlertCircle size={18} /> : 
                       alert.type === "warning" ? <Ticket size={18} /> : <Activity size={18} />}
                    </div>
                    <div className="flex-1 border-b border-slate-50 pb-4 group-last:border-0 group-last:pb-0 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h4 className="text-xs lg:text-sm font-bold text-brand-navy truncate">{alert.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">{alert.time}</span>
                      </div>
                      <p className="text-[10px] lg:text-xs text-slate-500 leading-relaxed line-clamp-2">{alert.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-6 rounded-xl text-xs lg:text-sm font-bold py-4 lg:py-5 border-slate-200" 
              onClick={() => router.push("/admin/clinics")}
            >
              View Clinics Directory
            </Button>
          </div>

          <div className="bg-brand-navy rounded-[2.5rem] p-6 lg:p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <Zap className="text-brand-blue mb-4 lg:mb-6" size={28} />
            <h3 className="text-base lg:text-lg font-bold mb-2">Platform Infrastructure</h3>
            <p className="text-[10px] lg:text-xs text-slate-400 mb-6 leading-relaxed">
              Active Clinics Connected: <span className="text-white font-bold">{activeClinics}</span><br />
              Registered Personnel: <span className="text-white font-bold">{activeUsers}</span>
            </p>
            <Button 
              className="w-full bg-white text-brand-navy hover:bg-slate-100 font-bold rounded-xl text-xs lg:text-sm py-4 lg:py-5 relative z-10 shadow-lg" 
              onClick={() => router.push("/admin/clinics")}
            >
              Manage Provider Accounts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
