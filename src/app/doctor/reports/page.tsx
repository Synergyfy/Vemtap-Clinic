"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Users, Clock, 
  FileText, Download, PieChart, Filter,
  CheckCircle2, AlertCircle, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DoctorReports() {
  const [activeSection, setActiveTab] = useState("stats");

  const stats = [
    { label: "Total Consultations", value: "342", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12%" },
    { label: "Avg. Satisfaction", value: "4.9", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.2" },
    { label: "Completion Rate", value: "98%", icon: BarChart3, color: "text-sky-600", bg: "bg-sky-50", trend: "Stable" },
    { label: "Surgery Clearance", value: "12", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50", trend: "+3" },
  ];

  const topDiagnoses = [
    { name: "Refractive Error", count: 145, percentage: 42, color: "bg-emerald-500" },
    { name: "Allergic Conjunctivitis", count: 88, percentage: 26, color: "bg-sky-500" },
    { name: "Glaucoma Suspect", count: 42, percentage: 12, color: "bg-amber-500" },
    { name: "Cataract", count: 35, percentage: 10, color: "bg-rose-500" },
    { name: "Others", count: 32, percentage: 10, color: "bg-slate-300" },
  ];

  const reportTemplates = [
    { title: "Daily Consultation Summary", type: "Clinical", lastGenerated: "Today, 08:00 AM", status: "Ready" },
    { title: "Monthly Diagnostic Trend", type: "Stats", lastGenerated: "June 01, 2026", status: "Archived" },
    { title: "Surgery Outcome Report", type: "Surgical", lastGenerated: "June 15, 2026", status: "Ready" },
    { title: "Referral Outflow Analysis", type: "Administrative", lastGenerated: "May 31, 2026", status: "Pending" },
  ];

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive clinical documentation and patient demographic statistics for your practice."
        actions={[
          { label: "Export Full Audit", href: "#", variant: "outline" },
          { label: "Generate New Report", href: "#", variant: "primary" },
        ]}
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm w-fit">
        <button 
          onClick={() => setActiveTab("stats")}
          className={cn(
            "px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeSection === "stats" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          Patient Statistics
        </button>
        <button 
          onClick={() => setActiveTab("reports")}
          className={cn(
            "px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeSection === "reports" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
          )}
        >
          Consultation Reports
        </button>
      </div>

      {activeSection === "stats" ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* High Level Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="hover:border-emerald-200 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                      <stat.icon size={24} />
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px]">
                      {stat.trend}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Diagnostic Trends */}
            <Card className="lg:col-span-2 rounded-[2.5rem] border-slate-200 shadow-xl shadow-slate-100/50">
              <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-slate-50">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Diagnostic Distribution</CardTitle>
                  <p className="text-sm font-bold text-slate-400 mt-1">Breakdown of primary diagnoses for current period</p>
                </div>
                <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                  <Filter size={20} />
                </button>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {topDiagnoses.map((diag, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700">{diag.name}</span>
                      <span className="font-black text-slate-900">{diag.count} cases ({diag.percentage}%)</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", diag.color)} style={{ width: `${diag.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Demographic Statistics */}
            <Card className="rounded-[2.5rem] bg-slate-900 text-white border-none shadow-2xl">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black">Patient Demographics</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Age Group Distribution</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                      <p className="text-2xl font-black text-emerald-400">14%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Pediatric (0-17)</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                      <p className="text-2xl font-black text-sky-400">58%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Adult (18-60)</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center col-span-2">
                      <p className="text-2xl font-black text-amber-400">28%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Geriatric (60+)</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Patient Gender Ratio</p>
                  <div className="flex items-center gap-2 h-4 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "62%" }} />
                    <div className="h-full bg-sky-500" style={{ width: "38%" }} />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-300">Female (62%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-sky-500" />
                      <span className="text-slate-300">Male (38%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Clinical Report Repository</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTemplates.map((report, i) => (
              <Card key={i} className="rounded-[2rem] border-slate-200 hover:border-emerald-200 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{report.title}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tighter">
                          Type: {report.type} • Last sync: {report.lastGenerated}
                        </p>
                      </div>
                    </div>
                    <button className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Download size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        report.status === "Ready" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-400"
                      )} />
                      <span className="text-[10px] font-black uppercase text-slate-400">{report.status}</span>
                    </div>
                    <button className="text-[10px] font-black uppercase text-emerald-700 hover:underline flex items-center gap-1">
                      Preview Document
                      <ArrowUpRight size={12} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-[2.5rem] bg-emerald-50 border-emerald-100 p-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                <AlertCircle size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-emerald-900">Custom Clinical Audit?</h3>
                <p className="text-sm font-bold text-emerald-700 mt-1">Need a specific report for research or administrative auditing?</p>
              </div>
            </div>
            <button className="px-8 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200/50 transition-all">
              Request Custom Build
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}
