"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, TrendingDown, Users, 
  Building2, Activity, Calendar, Download,
  Filter, PieChart, MousePointer2, Clock,
  ArrowUpRight, ArrowDownRight, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PlatformAnalyticsPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Platform Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Deep dive into platform growth, clinic performance, and user engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
            {["7D", "30D", "90D", "12M"].map((p) => (
              <button key={p} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", p === "30D" ? "bg-brand-navy text-white" : "text-slate-400 hover:text-brand-navy")}>
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => console.log("PDF Report clicked")}>
            <Download size={16} /> PDF Report
          </Button>
        </div>
      </div>

      {/* Growth Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-brand-navy">Onboarding Growth</h3>
              <p className="text-xs text-slate-500">New clinics joined per month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-brand-navy">+24%</p>
              <p className="text-[10px] font-bold text-emerald-500 flex items-center justify-end gap-1">
                <ArrowUpRight size={12} /> vs last month
              </p>
            </div>
          </div>
          
          {/* Mock Chart Area */}
          <div className="h-64 w-full flex items-end gap-3 px-4">
            {[40, 65, 35, 80, 55, 90, 70, 85, 100, 75, 95, 110].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                  className="w-full bg-brand-soft-blue group-hover/bar:bg-brand-blue rounded-t-xl transition-all relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-navy text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                    {val}
                  </div>
                </motion.div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">M{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-brand-navy p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/20 blur-[60px] rounded-full"></div>
            <h3 className="text-lg font-bold mb-6">User Distribution</h3>
            <div className="space-y-6">
              {[
                { label: "Doctors", val: "1,240", perc: 15 },
                { label: "Nurses", val: "2,420", perc: 30 },
                { label: "Staff", val: "4,581", perc: 55 },
              ].map((group, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{group.label}</span>
                    <span>{group.val}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${group.perc}%` }}
                      className="h-full bg-brand-blue rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-brand-navy mb-4">Daily Active Users</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-brand-navy">4,821</span>
              <span className="text-xs font-bold text-emerald-500">+12%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Platform utilization peak: 11:00 AM</p>
          </div>
        </div>
      </div>

      {/* Regional & Device Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Top Region", val: "Lagos, NG", icon: Globe, color: "blue" },
          { label: "Peak Activity", val: "Mon - Wed", icon: Clock, color: "purple" },
          { label: "Primary Device", val: "Desktop (84%)", icon: MousePointer2, color: "emerald" },
          { label: "Clinic Retention", val: "99.2%", icon: Activity, color: "brand-blue" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", 
              item.color === "blue" ? "bg-blue-50 text-blue-500" :
              item.color === "purple" ? "bg-purple-50 text-purple-500" :
              item.color === "emerald" ? "bg-emerald-50 text-emerald-500" : "bg-brand-soft-blue text-brand-blue"
            )}>
              <item.icon size={20} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h4 className="text-lg font-black text-brand-navy">{item.val}</h4>
          </div>
        ))}
      </div>

      {/* Popular Modules */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="text-xl font-bold text-brand-navy mb-8">Most Used Modules (Daily Hits)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "HMO Claims", hits: "45.2k", trend: "+5.1%" },
            { name: "Optical Orders", hits: "32.8k", trend: "+8.4%" },
            { name: "Patient Check-in", hits: "28.4k", trend: "+2.2%" },
            { name: "Pharmacy Dispense", hits: "14.1k", trend: "-1.5%" },
          ].map((mod, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all">
              <h4 className="text-sm font-black text-slate-700 mb-2">{mod.name}</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-brand-navy">{mod.hits}</span>
                <span className={cn("text-[10px] font-bold", mod.trend.startsWith("+") ? "text-emerald-500" : "text-rose-500")}>
                  {mod.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
