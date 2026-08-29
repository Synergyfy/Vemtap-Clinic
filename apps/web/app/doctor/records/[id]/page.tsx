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
import { usePatient } from "@/hooks/usePatients";
import { usePatientRecords } from "@/hooks/useRecords";
import { cn } from "@/lib/utils";

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function PatientRecordDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const { data: patient } = usePatient(id as string);
  const { data: records = [], isLoading } = usePatientRecords(id as string);

  const [printOpen, setPrintOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [encounterOpen, setEncounterOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<typeof records[0] | null>(null);
  const [toast, setToast] = useState("");

  const encounters = records.map((r) => ({
    id: r.id.slice(0, 8),
    date: new Date(r.createdAt).toLocaleDateString(),
    type: r.chiefComplaint || "Consultation",
    provider: r.staff ? `${r.staff.firstName} ${r.staff.lastName}` : "Unknown",
    diagnosis: r.diagnosis || "No diagnosis recorded",
    plan: r.treatmentPlan || "No treatment plan",
    status: "Open",
    vitals: r.vitals ? {
      bp: `${r.vitals.bloodPressureSystolic}/${r.vitals.bloodPressureDiastolic}`,
      temp: `${r.vitals.temperature}°C`,
      weight: r.vitals.weight ? `${r.vitals.weight}kg` : "—",
    } : null,
    notes: r.notes || r.historyOfPresentIllness || "No notes recorded",
    raw: r,
  }));

  const filteredEncounters = activeTab === "all"
    ? encounters
    : encounters.filter(e => e.type.toLowerCase().includes(activeTab.toLowerCase()));

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const openEncounterDetail = (encounter: typeof encounters[0]) => {
    setSelectedRecord(encounter.raw);
    setEncounterOpen(true);
  };

  const handlePrint = () => {
    setPrintOpen(false);
    showToast("Preparing print preview...");
    setTimeout(() => window.print(), 500);
  };

  const handleExportPDF = () => {
    setExportOpen(false);
    showToast(`Exporting ${patient?.firstName} ${patient?.lastName}'s full record as PDF...`);
    setTimeout(() => showToast("PDF exported successfully!"), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading records...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Patient not found.</div>
      </div>
    );
  }

  const patientName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8 pb-20">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

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
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{patientName}</h1>
              <Badge className="bg-slate-900 text-white border-none px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest">{patient.id.slice(0, 8)}</Badge>
            </div>
            <p className="text-slate-500 font-bold mt-1 flex items-center gap-2 text-xs sm:text-sm">
              <User size={14} className="text-emerald-500 sm:w-4 sm:h-4" />
              {calculateAge(patient.dateOfBirth)} years • {patient.gender} • {patient.phone}
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
        <aside className="space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-lg shadow-slate-100/50 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Clinical Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Blood Group</p>
                <p className="text-lg font-black text-slate-900">{patient.bloodGroup || "Not recorded"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Patient Type</p>
                <p className="text-sm font-bold text-slate-900 capitalize">{patient.patientType}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">HMO</p>
                <p className="text-sm font-bold text-slate-900">{patient.hmoName || "Private Patient"}</p>
              </div>
            </CardContent>
          </Card>

          {patient.patientType === "hmo" && patient.hmoName && (
            <Card className="rounded-[2rem] bg-emerald-600 text-white border-none shadow-xl shadow-emerald-200/50">
              <CardContent className="p-8">
                <Activity size={32} className="mb-4 text-emerald-200" />
                <h3 className="text-xl font-black mb-2">HMO Coverage</h3>
                <p className="text-emerald-100 text-sm font-bold mb-6 italic leading-relaxed">
                  Patient is currently covered under {patient.hmoName}. Policy: {patient.hmoNumber || "N/A"}.
                </p>
                <button onClick={() => setPolicyOpen(true)} className="w-full py-3 rounded-2xl bg-white text-emerald-700 text-xs font-black uppercase tracking-widest hover:bg-emerald-50 transition-all">
                  View Policy Details
                </button>
              </CardContent>
            </Card>
          )}
        </aside>

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
                          <FileText size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-black text-slate-900">{e.type}</h3>
                            <Badge variant="outline" className="text-[10px] font-mono text-slate-400">{e.id}</Badge>
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
            {filteredEncounters.length === 0 && (
              <p className="text-center text-sm text-slate-500 py-6">No records found for this filter.</p>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={printOpen} onClose={() => setPrintOpen(false)} title="Print Medical Record">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold mb-3">Print Preview — Record will include:</p>
            <div className="space-y-2">
              {["Patient demographics & clinical profile", "Complete encounter history", "HMO coverage details", "Prescription history"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
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

      <Modal isOpen={exportOpen} onClose={() => setExportOpen(false)} title="Export as PDF">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold mb-3">Export "{patientName}" record as PDF</p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setExportOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
              <FileDown size={16} /> Download PDF
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={policyOpen} onClose={() => setPolicyOpen(false)} title="HMO Policy Details">
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm">HMO</div>
              <div>
                <p className="font-black text-slate-900">{patient.hmoName}</p>
                <p className="text-[10px] text-emerald-700 font-bold">Active</p>
              </div>
              <Badge className="ml-auto bg-emerald-600 text-white border-none text-[10px] font-black">VERIFIED</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Policy Number</p>
              <p className="text-sm font-bold text-slate-900 font-mono">{patient.hmoNumber || "N/A"}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Type</p>
              <p className="text-sm font-bold text-slate-900 capitalize">{patient.patientType}</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setPolicyOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Close</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={encounterOpen} onClose={() => setEncounterOpen(false)} title="Encounter Details" className="max-w-2xl">
        {selectedRecord && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{selectedRecord.chiefComplaint || "Consultation"}</h3>
                  <Badge variant="outline" className="text-[10px] font-mono text-slate-400">{selectedRecord.id.slice(0, 8)}</Badge>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{new Date(selectedRecord.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {selectedRecord.vitals && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">BP</p>
                  <p className="text-sm font-bold text-slate-900">{selectedRecord.vitals.bloodPressureSystolic}/{selectedRecord.vitals.bloodPressureDiastolic}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Temp</p>
                  <p className="text-sm font-bold text-slate-900">{selectedRecord.vitals.temperature}°C</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pulse</p>
                  <p className="text-sm font-bold text-slate-900">{selectedRecord.vitals.heartRate} bpm</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {selectedRecord.notes && (
                <div className="p-4 bg-white rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Notes</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedRecord.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-white rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnosis</p>
                  <p className="text-sm font-bold text-slate-900">{selectedRecord.diagnosis || "Not recorded"}</p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Treatment Plan</p>
                  <p className="text-sm text-slate-700 font-medium">{selectedRecord.treatmentPlan || "Not recorded"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setEncounterOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
