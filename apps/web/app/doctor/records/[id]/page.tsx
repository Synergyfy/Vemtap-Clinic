"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, Eye, ClipboardCheck, 
  Download, Printer, ChevronRight, Calendar,
  Activity, Pill, User, X, CheckCircle2, AlertCircle,
  Share2, FileDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { clinicPatients } from "@/app/clinic/_mock/clinic-data";
import { cn } from "@/lib/utils";

export default function PatientRecordDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  // Modal states
  const [printOpen, setPrintOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [encounterOpen, setEncounterOpen] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<typeof encounters[0] | null>(null);
  const [toast, setToast] = useState("");

  const patient = clinicPatients.find(p => p.id === id) || clinicPatients[0];

  const encounters = [
    { 
      id: "ENC-992", 
      date: "June 18, 2026", 
      type: "Consultation", 
      provider: "Dr. A. Bello",
      diagnosis: "Allergic Conjunctivitis",
      plan: "Prescribed Patanol eye drops, review in 1 week.",
      status: "Open",
      vitals: { bp: "120/80", temp: "36.8°C", weight: "72kg" },
      notes: "Patient presents with bilateral eye redness, itching, and watery discharge for 3 days. No previous history of allergic eye disease. Visual acuity intact."
    },
    { 
      id: "ENC-841", 
      date: "May 24, 2026", 
      type: "Eye Test", 
      provider: "Optom. S. Danladi",
      diagnosis: "Myopia OU",
      plan: "Proceeded to lens selection. Prescribed -2.50DS OU.",
      status: "Closed",
      vitals: { bp: "118/76", temp: "36.6°C", weight: "71kg" },
      notes: "Routine refraction examination. Patient reports gradual blurring of distance vision over 6 months. No ocular pathology detected."
    },
    { 
      id: "ENC-720", 
      date: "April 10, 2026", 
      type: "Pharmacy", 
      provider: "Pharm. T. Ibrahim",
      diagnosis: "Medication Dispensed",
      plan: "Dispensed Artificial Tears x2.",
      status: "Closed",
      vitals: null,
      notes: "Patient collected prescribed artificial tears for dry eye symptom management. Counseled on proper administration technique."
    }
  ];

  const filteredEncounters = activeTab === "all" 
    ? encounters 
    : encounters.filter(e => e.type.toLowerCase().includes(activeTab.toLowerCase()));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openEncounterDetail = (encounter: typeof encounters[0]) => {
    setSelectedEncounter(encounter);
    setEncounterOpen(true);
  };

  const handlePrint = () => {
    setPrintOpen(false);
    showToast("Preparing print preview...");
    setTimeout(() => window.print(), 500);
  };

  const handleExportPDF = () => {
    setExportOpen(false);
    showToast(`Exporting ${patient.name}'s full record as PDF...`);
    setTimeout(() => showToast("PDF exported successfully!"), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8 pb-20">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
        
        <div className="flex items-center gap-4 sm:gap-6 relative z-10">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
              <Badge className="bg-slate-900 text-white border-none px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest">{patient.id}</Badge>
            </div>
            <p className="text-slate-500 font-bold mt-1 flex items-center gap-2 text-xs sm:text-sm">
              <User size={14} className="text-emerald-500 sm:w-4 sm:h-4" />
              {patient.age} years • {patient.sex} • {patient.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          <button onClick={() => setPrintOpen(true)} className="flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Printer size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Print Full Record</span> Print
          </button>
          <button onClick={() => setExportOpen(true)} className="flex items-center gap-2 px-4 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
            <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
        {/* Sidebar: Patient Summary */}
        <aside className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-lg shadow-slate-100/50 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Clinical Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Blood Group</p>
                <p className="text-lg font-black text-slate-900">O Positive (O+)</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Known Allergies</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-rose-100 text-rose-700 border-none font-bold">Penicillin</Badge>
                  <Badge className="bg-rose-100 text-rose-700 border-none font-bold">Pollen</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Last Refraction</p>
                <p className="text-sm font-bold text-slate-900 mt-1">May 24, 2026 (-2.50DS OU)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] bg-emerald-600 text-white border-none shadow-xl shadow-emerald-200/50">
            <CardContent className="p-8">
              <Activity size={32} className="mb-4 text-emerald-200" />
              <h3 className="text-xl font-black mb-2">HMO Coverage</h3>
              <p className="text-emerald-100 text-sm font-bold mb-6 italic leading-relaxed">
                Patient is currently covered under AXA Mansard Gold Plan. No pending authorizations.
              </p>
              <button onClick={() => setPolicyOpen(true)} className="w-full py-3 rounded-2xl bg-white text-emerald-700 text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all">
                View Policy Details
              </button>
            </CardContent>
          </Card>
        </aside>

        {/* Main Records Timeline */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm w-full sm:w-fit overflow-x-auto">
            {[
              { id: "all", label: "All" },
              { id: "consult", label: "Consults" },
              { id: "test", label: "Tests" },
              { id: "pharm", label: "Pharmacy" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredEncounters.map((e) => (
              <Card key={e.id} className="rounded-[2rem] border-slate-200 hover:border-emerald-200 transition-all cursor-pointer group shadow-lg shadow-slate-100/50 overflow-hidden" onClick={() => openEncounterDetail(e)}>
                <div className="flex items-stretch">
                  <div className={cn(
                    "w-2 transition-all",
                    e.status === "Open" ? "bg-emerald-500" : "bg-slate-200"
                  )} />
                  <CardContent className="p-0 flex-1">
                    <div className="p-6 flex items-start justify-between">
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          {e.type === "Consultation" && <FileText size={24} />}
                          {e.type === "Eye Test" && <Eye size={24} />}
                          {e.type === "Pharmacy" && <Pill size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-black text-slate-900">{e.type}</h3>
                            <Badge variant="outline" className="text-[10px] font-mono text-slate-400">{e.id}</Badge>
                            {e.status === "Open" && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] font-black uppercase">Active Session</Badge>}
                          </div>
                          <p className="text-xs text-slate-500 font-bold mt-1 flex items-center gap-2">
                            <Calendar size={12} className="text-slate-300" />
                            {e.date} • {e.provider}
                          </p>
                        </div>
                      </div>
                      <button className="p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    
                    <div className="px-6 pb-6 pt-2 border-t border-slate-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis / Findings</p>
                          <p className="text-sm font-bold text-slate-800">{e.diagnosis}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Management Plan</p>
                          <p className="text-sm text-slate-500 leading-relaxed font-medium">{e.plan}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* 1. Print Preview Modal */}
      <Modal isOpen={printOpen} onClose={() => setPrintOpen(false)} title="Print Medical Record">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold mb-3">Print Preview — Record will include:</p>
            <div className="space-y-2">
              {["Patient demographics & clinical profile", "Allergy information", "Complete encounter history", "HMO coverage details", "Prescription history"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800">Confidential Medical Record</p>
              <p className="text-[10px] text-amber-600 mt-0.5">This document contains sensitive patient information. Handle per HIPAA / NDPR guidelines.</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setPrintOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 shadow-lg transition-all">
              <Printer size={16} /> Print Record
            </button>
          </div>
        </div>
      </Modal>

      {/* 2. Export PDF Modal */}
      <Modal isOpen={exportOpen} onClose={() => setExportOpen(false)} title="Export as PDF">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold mb-3">Export "{patient.name}" record as PDF</p>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                <input type="radio" name="export-range" defaultChecked className="accent-emerald-600" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Full Record</p>
                  <p className="text-[10px] text-slate-500">All encounters, prescriptions, and clinical data</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                <input type="radio" name="export-range" className="accent-emerald-600" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Current Encounter Only</p>
                  <p className="text-[10px] text-slate-500">Most recent consultation record only</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors">
                <input type="radio" name="export-range" className="accent-emerald-600" />
                <div>
                  <p className="text-sm font-bold text-slate-900">HMO Summary</p>
                  <p className="text-[10px] text-slate-500">Coverage details and claims history</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setExportOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
              <FileDown size={16} /> Download PDF
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. HMO Policy Details Modal */}
      <Modal isOpen={policyOpen} onClose={() => setPolicyOpen(false)} title="HMO Policy Details">
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm">AX</div>
              <div>
                <p className="font-black text-slate-900">AXA Mansard Insurance</p>
                <p className="text-[10px] text-emerald-700 font-bold">Gold Plan — Active</p>
              </div>
              <Badge className="ml-auto bg-emerald-600 text-white border-none text-[10px] font-black">VERIFIED</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Policy Number</p>
              <p className="text-sm font-bold text-slate-900 font-mono">AXA-2026-003847</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Plan Type</p>
              <p className="text-sm font-bold text-slate-900">Gold (Comprehensive)</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Effective Date</p>
              <p className="text-sm font-bold text-slate-900">Jan 1, 2026</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiry Date</p>
              <p className="text-sm font-bold text-slate-900">Dec 31, 2026</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage Benefits</p>
            {["General Consultation", "Eye Tests & Refraction", "Surgery (Cataract, GL)", "Lens & Frames (Annual Cap: ₦150,000)", "Emergency Services"].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-sm font-medium text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claims Used This Year</p>
              <p className="text-sm font-bold text-slate-900">₦85,000 / ₦150,000</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="57, 100" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-emerald-700">57%</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setPolicyOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Close</button>
          </div>
        </div>
      </Modal>

      {/* 4. Encounter Detail Modal */}
      <Modal isOpen={encounterOpen} onClose={() => setEncounterOpen(false)} title="Encounter Details" className="max-w-2xl">
        {selectedEncounter && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                selectedEncounter.status === "Open" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
              )}>
                {selectedEncounter.type === "Consultation" && <FileText size={24} />}
                {selectedEncounter.type === "Eye Test" && <Eye size={24} />}
                {selectedEncounter.type === "Pharmacy" && <Pill size={24} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{selectedEncounter.type}</h3>
                  <Badge variant="outline" className="text-[10px] font-mono text-slate-400">{selectedEncounter.id}</Badge>
                  {selectedEncounter.status === "Open" && <Badge className="bg-emerald-100 text-emerald-700 border-none text-[8px] font-black uppercase">Active</Badge>}
                </div>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedEncounter.date} • {selectedEncounter.provider}</p>
              </div>
            </div>

            {selectedEncounter.vitals && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">BP</p>
                  <p className="text-sm font-bold text-slate-900">{selectedEncounter.vitals.bp}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Temp</p>
                  <p className="text-sm font-bold text-slate-900">{selectedEncounter.vitals.temp}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Weight</p>
                  <p className="text-sm font-bold text-slate-900">{selectedEncounter.vitals.weight}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="p-4 bg-white rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedEncounter.notes}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnosis / Findings</p>
                  <p className="text-sm font-bold text-slate-900">{selectedEncounter.diagnosis}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Management Plan</p>
                  <p className="text-sm text-slate-700 font-medium">{selectedEncounter.plan}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button onClick={() => { setEncounterOpen(false); setPrintOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all">
                <Printer size={14} /> Print This Encounter
              </button>
              <button onClick={() => { setEncounterOpen(false); setExportOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                <Download size={14} /> Export Encounter
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
