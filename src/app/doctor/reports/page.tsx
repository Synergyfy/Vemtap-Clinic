"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  BarChart3, TrendingUp, Users, Clock,
  FileText, Download, PieChart, Filter,
  CheckCircle2, AlertCircle, ArrowUpRight,
  Calendar, FileDown, X, Send
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DoctorReports() {
  const [activeSection, setActiveTab] = useState("stats");

  const [exportAuditOpen, setExportAuditOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [statDetailOpen, setStatDetailOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<any>(null);
  const [toast, setToast] = useState("");

  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportRange, setExportRange] = useState("month");
  const [reportType, setReportType] = useState("Clinical");
  const [reportPeriod, setReportPeriod] = useState("week");
  const [filterRange, setFilterRange] = useState("all");
  const [requestForm, setRequestForm] = useState({ title: "", description: "", urgency: "normal", dataPoints: "" });

  const stats = [
    { label: "Total Consultations", value: "342", icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+12%", detail: "12% increase from last month. Peak hours: 9AM-11AM. Average daily: 14 consultations.", breakdown: [{ period: "This Month", val: "342" }, { period: "Last Month", val: "305" }, { period: "3 Months Ago", val: "289" }] },
    { label: "Avg. Satisfaction", value: "4.9", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", trend: "+0.2", detail: "Improving trend. 92% of patients rated 4.5 or above. Top feedback: thorough explanations.", breakdown: [{ period: "5 Stars", val: "68%" }, { period: "4 Stars", val: "24%" }, { period: "3 Stars", val: "8%" }] },
    { label: "Completion Rate", value: "98%", icon: BarChart3, color: "text-sky-600", bg: "bg-sky-50", trend: "Stable", detail: "Consistently high. Only 7 incomplete sessions this month, all rescheduled.", breakdown: [{ period: "Completed", val: "335" }, { period: "Incomplete", val: "7" }, { period: "Cancelled", val: "12" }] },
    { label: "Surgery Clearance", value: "12", icon: CheckCircle2, color: "text-purple-600", bg: "bg-purple-50", trend: "+3", detail: "3 more clearances than last month. All pre-op assessments completed on schedule.", breakdown: [{ period: "Cataract", val: "5" }, { period: "Glaucoma", val: "3" }, { period: "Refractive", val: "4" }] },
  ];

  const topDiagnoses = [
    { name: "Refractive Error", count: 145, percentage: 42, color: "bg-emerald-500" },
    { name: "Allergic Conjunctivitis", count: 88, percentage: 26, color: "bg-sky-500" },
    { name: "Glaucoma Suspect", count: 42, percentage: 12, color: "bg-amber-500" },
    { name: "Cataract", count: 35, percentage: 10, color: "bg-rose-500" },
    { name: "Others", count: 32, percentage: 10, color: "bg-slate-300" },
  ];

  const reportTemplates = [
    { title: "Daily Consultation Summary", type: "Clinical", lastGenerated: "Today, 08:00 AM", status: "Ready", description: "Complete summary of all consultations held today with patient outcomes, diagnoses, and prescriptions issued." },
    { title: "Monthly Diagnostic Trend", type: "Stats", lastGenerated: "June 01, 2026", status: "Archived", description: "Statistical analysis of diagnostic patterns over the past month with comparison to previous periods." },
    { title: "Surgery Outcome Report", type: "Surgical", lastGenerated: "June 15, 2026", status: "Ready", description: "Detailed outcomes of all surgical procedures including pre-op assessments and post-op follow-ups." },
    { title: "Referral Outflow Analysis", type: "Administrative", lastGenerated: "May 31, 2026", status: "Pending", description: "Analysis of patient referrals sent to other facilities with reasons and turnaround times." },
  ];

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  return (
    <div className="space-y-4 sm:space-y-8 pb-20">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive clinical documentation and patient demographic statistics for your practice."
        actions={[
          { label: "Export Full Audit", onClick: () => setExportAuditOpen(true), variant: "outline" },
          { label: "Generate New Report", onClick: () => setGenerateOpen(true), variant: "primary" },
        ]}
      />

      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm w-full sm:w-fit overflow-x-auto">
        <button onClick={() => setActiveTab("stats")} className={cn("flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", activeSection === "stats" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}>Patient Statistics</button>
        <button onClick={() => setActiveTab("reports")} className={cn("flex-1 sm:flex-none px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap", activeSection === "reports" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50")}>Consultation Reports</button>
      </div>

      {activeSection === "stats" ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, i) => (
              <Card key={i} onClick={() => { setSelectedStat(stat); setStatDetailOpen(true); }} className="hover:border-emerald-200 transition-all cursor-pointer group">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className={cn("p-2 sm:p-3 rounded-2xl", stat.bg, stat.color)}><stat.icon size={18} className="sm:w-6 sm:h-6" /></div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[8px] sm:text-[10px]">{stat.trend}</Badge>
                  </div>
                  <p className="text-[10px] sm:text-sm font-bold text-slate-500">{stat.label}</p>
                  <p className="mt-0.5 sm:mt-1 text-xl sm:text-3xl font-black text-slate-900">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 rounded-[2rem] sm:rounded-[2.5rem] border-slate-200 shadow-xl shadow-slate-100/50">
              <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-8 border-b border-slate-50">
                <div>
                  <CardTitle className="text-base sm:text-xl font-black text-slate-900">Diagnostic Distribution</CardTitle>
                  <p className="text-[10px] sm:text-sm font-bold text-slate-400 mt-1">Breakdown of primary diagnoses for current period</p>
                </div>
                <button onClick={() => setFilterOpen(true)} className="p-2 sm:p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"><Filter size={18} className="sm:w-5 sm:h-5" /></button>
              </CardHeader>
              <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
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

            <Card className="rounded-[2rem] sm:rounded-[2.5rem] bg-slate-900 text-white border-none shadow-2xl">
              <CardHeader className="p-4 sm:p-8"><CardTitle className="text-base sm:text-xl font-black">Patient Demographics</CardTitle></CardHeader>
              <CardContent className="px-4 sm:px-8 pb-4 sm:pb-8 space-y-6 sm:space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Age Group Distribution</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center"><p className="text-2xl font-black text-emerald-400">14%</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Pediatric (0-17)</p></div>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center"><p className="text-2xl font-black text-sky-400">58%</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Adult (18-60)</p></div>
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center col-span-2"><p className="text-2xl font-black text-amber-400">28%</p><p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Geriatric (60+)</p></div>
                  </div>
                </div>
                <div className="pt-8 border-t border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Patient Gender Ratio</p>
                  <div className="flex items-center gap-2 h-4 w-full rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: "62%" }} />
                    <div className="h-full bg-sky-500" style={{ width: "38%" }} />
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs font-bold">
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-slate-300">Female (62%)</span></div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sky-500" /><span className="text-slate-300">Male (38%)</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Clinical Report Repository</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {reportTemplates.map((report, i) => (
              <Card key={i} className="rounded-[1.5rem] sm:rounded-[2rem] border-slate-200 hover:border-emerald-200 transition-all cursor-pointer group">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><FileText size={24} /></div>
                      <div>
                        <h4 className="font-black text-slate-900">{report.title}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-tighter">Type: {report.type} | Last: {report.lastGenerated}</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedReport(report); setDownloadOpen(true); }} className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all"><Download size={18} /></button>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", report.status === "Ready" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-400")} />
                      <span className="text-[10px] font-black uppercase text-slate-400">{report.status}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setSelectedReport(report); setPreviewOpen(true); }} className="text-[10px] font-black uppercase text-emerald-700 hover:underline flex items-center gap-1">Preview Document <ArrowUpRight size={12} /></button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-[2rem] sm:rounded-[2.5rem] bg-emerald-50 border-emerald-100 p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100"><AlertCircle size={24} className="sm:w-8 sm:h-8" /></div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-emerald-900">Custom Clinical Audit?</h3>
                <p className="text-xs sm:text-sm font-bold text-emerald-700 mt-1">Need a specific report for research or auditing?</p>
              </div>
            </div>
            <button onClick={() => setRequestOpen(true)} className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200/50 transition-all">Request Custom Build</button>
          </Card>
        </div>
      )}

      {/* 1. Export Full Audit Modal */}
      <Modal isOpen={exportAuditOpen} onClose={() => setExportAuditOpen(false)} title="Export Full Audit">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 font-bold">Export your complete clinical audit trail as a downloadable file.</p>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Format</label>
            <div className="grid grid-cols-3 gap-2">
              {["pdf", "csv", "xlsx"].map(f => (
                <button key={f} onClick={() => setExportFormat(f)} className={cn("py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all", exportFormat === f ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500 hover:bg-slate-50")}>{f}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ val: "week", label: "This Week" }, { val: "month", label: "This Month" }, { val: "quarter", label: "This Quarter" }, { val: "year", label: "Full Year" }].map(r => (
                <button key={r.val} onClick={() => setExportRange(r.val)} className={cn("py-2.5 rounded-xl text-xs font-black border transition-all", exportRange === r.val ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:bg-slate-50")}>{r.label}</button>
              ))}
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 font-bold">Export includes all consultation records, prescriptions, patient interactions, and clinical notes within the selected period.</p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setExportAuditOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={() => { setExportAuditOpen(false); showToast(`Exporting full audit as ${exportFormat.toUpperCase()} for ${exportRange}...`); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"><FileDown size={16} /> Export Now</button>
          </div>
        </div>
      </Modal>

      {/* 2. Generate New Report Modal */}
      <Modal isOpen={generateOpen} onClose={() => setGenerateOpen(false)} title="Generate New Report">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Type</label>
            <div className="grid grid-cols-2 gap-2">
              {["Clinical", "Stats", "Surgical", "Administrative"].map(t => (
                <button key={t} onClick={() => setReportType(t)} className={cn("py-2.5 rounded-xl text-xs font-black border transition-all", reportType === t ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500 hover:bg-slate-50")}>{t}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Period</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ val: "week", label: "Last 7 Days" }, { val: "month", label: "Last 30 Days" }, { val: "quarter", label: "Last Quarter" }, { val: "year", label: "Full Year" }].map(p => (
                <button key={p.val} onClick={() => setReportPeriod(p.val)} className={cn("py-2.5 rounded-xl text-xs font-black border transition-all", reportPeriod === p.val ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:bg-slate-50")}>{p.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setGenerateOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={() => { setGenerateOpen(false); showToast(`Generating ${reportType} report for the last ${reportPeriod}...`); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"><BarChart3 size={16} /> Generate Report</button>
          </div>
        </div>
      </Modal>

      {/* 3. Filter Diagnostics Modal */}
      <Modal isOpen={filterOpen} onClose={() => setFilterOpen(false)} title="Filter Diagnostics">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 font-bold">Filter the diagnostic distribution chart by time period.</p>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ val: "all", label: "All Time" }, { val: "month", label: "This Month" }, { val: "quarter", label: "This Quarter" }, { val: "year", label: "This Year" }].map(r => (
                <button key={r.val} onClick={() => setFilterRange(r.val)} className={cn("py-2.5 rounded-xl text-xs font-black border transition-all", filterRange === r.val ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-200 text-slate-500 hover:bg-slate-50")}>{r.label}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setFilterOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={() => { setFilterOpen(false); showToast(`Filter applied: ${filterRange === "all" ? "All time" : filterRange}`); }} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">Apply Filter</button>
          </div>
        </div>
      </Modal>

      {/* 4. Download Report Modal */}
      <Modal isOpen={downloadOpen} onClose={() => setDownloadOpen(false)} title="Download Report">
        <div className="space-y-4">
          {selectedReport && (
            <>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="font-black text-slate-900">{selectedReport.title}</p>
                <p className="text-xs text-slate-500 font-bold mt-1">{selectedReport.type} | {selectedReport.lastGenerated}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {["PDF", "CSV", "XLSX"].map(f => (
                    <button key={f} className="py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all hover:border-emerald-300">{f}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button onClick={() => setDownloadOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={() => { setDownloadOpen(false); showToast(`Downloading "${selectedReport.title}"...`); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"><Download size={16} /> Download</button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 5. Preview Report Modal */}
      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Report Preview" className="max-w-2xl">
        <div className="space-y-4">
          {selectedReport && (
            <>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600"><FileText size={20} /></div>
                  <div>
                    <p className="font-black text-slate-900">{selectedReport.title}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{selectedReport.type} | {selectedReport.lastGenerated}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedReport.description}</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Report Preview</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100"><span className="text-xs font-bold text-slate-500">Total Records</span><span className="text-xs font-black text-slate-900">342</span></div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100"><span className="text-xs font-bold text-slate-500">Period Covered</span><span className="text-xs font-black text-slate-900">June 1-18, 2026</span></div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100"><span className="text-xs font-bold text-slate-500">Generated By</span><span className="text-xs font-black text-slate-900">Dr. A. Bello</span></div>
                  <div className="flex items-center justify-between py-2"><span className="text-xs font-bold text-slate-500">Status</span><Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-black">{selectedReport.status}</Badge></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => { setPreviewOpen(false); setSelectedReport(selectedReport); setDownloadOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"><Download size={14} /> Download</button>
                <button onClick={() => setPreviewOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Close</button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 6. Stat Detail Modal */}
      <Modal isOpen={statDetailOpen} onClose={() => setStatDetailOpen(false)} title="Stat Details">
        <div className="space-y-4">
          {selectedStat && (
            <>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className={cn("p-3 rounded-2xl", selectedStat.bg, selectedStat.color)}><selectedStat.icon size={24} /></div>
                <div>
                  <p className="text-sm font-bold text-slate-500">{selectedStat.label}</p>
                  <p className="text-3xl font-black text-slate-900">{selectedStat.value}</p>
                </div>
                <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-none font-black text-[10px]">{selectedStat.trend}</Badge>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedStat.detail}</p>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Breakdown</p>
                {selectedStat.breakdown.map((b: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">{b.period}</span>
                    <span className="text-sm font-black text-slate-900">{b.val}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-end pt-2">
                <button onClick={() => setStatDetailOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Close</button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 7. Request Custom Build Modal */}
      <Modal isOpen={requestOpen} onClose={() => setRequestOpen(false)} title="Request Custom Report">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Title *</label>
            <input value={requestForm.title} onChange={e => setRequestForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Glaucoma Progression Analysis" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description *</label>
            <textarea value={requestForm.description} onChange={e => setRequestForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe what data and analysis you need..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgency</label>
              <select value={requestForm.urgency} onChange={e => setRequestForm(p => ({ ...p, urgency: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none bg-white">
                <option value="low">Low - Within 2 weeks</option>
                <option value="normal">Normal - Within 1 week</option>
                <option value="high">High - Within 48 hours</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Points</label>
              <input value={requestForm.dataPoints} onChange={e => setRequestForm(p => ({ ...p, dataPoints: e.target.value }))} placeholder="e.g. IOP, VA, diagnosis" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setRequestOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={() => { if (!requestForm.title || !requestForm.description) return; setRequestOpen(false); showToast(`Custom report request submitted: "${requestForm.title}"`); setRequestForm({ title: "", description: "", urgency: "normal", dataPoints: "" }); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"><Send size={16} /> Submit Request</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
