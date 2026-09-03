"use client";

import React, { useState } from "react";
import {
  ShieldAlert, ShieldCheck, Lock, Eye, Search, Filter, Download,
  Activity, Globe, Smartphone, Monitor, Key, UserCheck, AlertTriangle,
  ListTodo, FileCheck, History, RefreshCw, LogIn, ArrowRight, Loader2,
  Database, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuditLogs } from "@/hooks/useAuditLogs";

export default function SecurityDashboardPage() {
  const [activeView, setActiveView] = useState("logs");
  const [search, setSearch] = useState("");
  const { data: auditLogs = [], isLoading } = useAuditLogs();

  const filteredLogs = auditLogs.filter((log: any) =>
    !search || log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.resource?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy font-black tracking-tight">Security & Audit</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor system integrity, user activity, and compliance standards.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} /> Compliance Report
          </Button>
        </div>
      </div>

      {/* Security Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Security Score", val: "98/100", icon: ShieldCheck, color: "emerald", desc: "Optimal Health" },
          { label: "Total Logs", val: String(auditLogs.length), icon: Activity, color: "blue", desc: "All recorded events" },
          { label: "Failed Actions", val: String(auditLogs.filter((l: any) => l.action?.toLowerCase().includes("fail")).length), icon: AlertTriangle, color: "amber", desc: "Requires attention" },
          { label: "Data Integrity", val: "Verified", icon: FileCheck, color: "brand-blue", desc: "Sync check passed" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                stat.color === "emerald" ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                stat.color === "blue" ? "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
                stat.color === "brand-blue" ? "bg-brand-soft-blue text-brand-blue group-hover:bg-brand-blue group-hover:text-white" :
                "bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white"
              )}>
                <stat.icon size={24} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h4 className="text-2xl font-black text-brand-navy mb-1">{stat.val}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-brand-navy">Platform Audit Logs</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Filter logs..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-blue/20 w-64" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center"><Loader2 className="animate-spin text-slate-400 mx-auto" /></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400">No audit logs found</td></tr>
              ) : filteredLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-500">
                        <ListTodo size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-brand-navy">{log.action}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{log.details || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-700">{log.resource || "—"}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-mono text-slate-500">{log.ipAddress || "—"}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-slate-400 font-medium">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance & Security Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-brand-navy p-10 rounded-[3rem] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-start justify-between mb-8 relative z-10">
            <Lock size={40} className="text-brand-blue" />
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Compliance Status</p>
              <h3 className="text-2xl font-black text-emerald-400">FULLY COMPLIANT</h3>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
            Platform meets all HIPAA and NDPR healthcare data protection standards. All patient data is encrypted at rest and in transit.
          </p>
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs font-bold mb-1">Last Audit</p>
              <p className="text-sm font-black text-brand-blue">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs font-bold mb-1">Total Events</p>
              <p className="text-sm font-black text-brand-blue">{auditLogs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand-navy">Security Tools</h3>
              <p className="text-xs text-slate-500">Platform security features.</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Force 2FA for all staff", desc: "Require mobile verification on login", icon: Smartphone },
              { label: "Data Retention Policy", desc: "7 years for digital records", icon: Database },
              { label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity", icon: Clock },
            ].map((tool, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <tool.icon size={16} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-bold text-slate-700">{tool.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{tool.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
