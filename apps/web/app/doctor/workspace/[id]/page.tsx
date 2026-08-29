"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  User, History, Eye, ClipboardCheck,
  FileText, Calendar, ArrowLeft, Save,
  ChevronRight, Activity, ImageIcon, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePatient } from "@/hooks/usePatients";
import { usePatientRecords, useCreateRecord, useCreatePrescription } from "@/hooks/useRecords";
import { useAuth } from "@/lib/auth-context";
import { ClinicalImagingGallery } from "../_components/ImagingGallery";

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function ConsultationWorkspace() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("notes");
  const [toast, setToast] = useState("");

  const { data: patient } = usePatient(id as string);
  const { data: records = [] } = usePatientRecords(id as string);
  const createRecord = useCreateRecord();
  const createPrescription = useCreatePrescription();

  // Consultation Notes state
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");

  // Eye Examination state
  const [vaOdUnaided, setVaOdUnaided] = useState("");
  const [vaOdAided, setVaOdAided] = useState("");
  const [vaOsUnaided, setVaOsUnaided] = useState("");
  const [vaOsAided, setVaOsAided] = useState("");
  const [iopOd, setIopOd] = useState("");
  const [iopOs, setIopOs] = useState("");
  const [slitLamp, setSlitLamp] = useState("");

  // Diagnosis & Rx state
  const [diagnosis, setDiagnosis] = useState("");
  const [sphOd, setSphOd] = useState("");
  const [cylOd, setCylOd] = useState("");
  const [axisOd, setAxisOd] = useState("");
  const [addOd, setAddOd] = useState("");
  const [sphOs, setSphOs] = useState("");
  const [cylOs, setCylOs] = useState("");
  const [axisOs, setAxisOs] = useState("");
  const [addOs, setAddOs] = useState("");
  const [managementPlan, setManagementPlan] = useState("");

  // Prescription state
  const [rxMedication, setRxMedication] = useState("");
  const [rxDosage, setRxDosage] = useState("");
  const [rxFrequency, setRxFrequency] = useState("");
  const [rxDuration, setRxDuration] = useState("");
  const [rxInstructions, setRxInstructions] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSave = async () => {
    if (!id) return;

    const notes = [
      chiefComplaint && `Chief Complaint: ${chiefComplaint}`,
      medicalHistory && `Medical History: ${medicalHistory}`,
      familyHistory && `Family History: ${familyHistory}`,
      `Eye Exam: VA OD ${vaOdUnaided || "—"}/${vaOdAided || "—"}, VA OS ${vaOsUnaided || "—"}/${vaOsAided || "—"}, IOP OD ${iopOd || "—"}mmHg, IOP OS ${iopOs || "—"}mmHg, Slit Lamp: ${slitLamp || "—"}`,
      `Rx: OD SPH ${sphOd || "—"} CYL ${cylOd || "—"} AXIS ${axisOd || "—"} ADD ${addOd || "—"} | OS SPH ${sphOs || "—"} CYL ${cylOs || "—"} AXIS ${axisOs || "—"} ADD ${addOs || "—"}`,
    ].filter(Boolean).join("\n");

    createRecord.mutate(
      {
        patientId: id as string,
        branchId: "",
        clinicId: user?.clinicId || "",
        chiefComplaint: chiefComplaint || "Consultation",
        historyOfPresentIllness: medicalHistory,
        pastMedicalHistory: familyHistory,
        diagnosis,
        treatmentPlan: managementPlan,
        notes,
      },
      {
        onSuccess: async (record) => {
          if (rxMedication.trim()) {
            createPrescription.mutate({
              medicalRecordId: record.id,
              medication: rxMedication,
              dosage: rxDosage || "As directed",
              frequency: rxFrequency || "As needed",
              duration: rxDuration,
              instructions: rxInstructions,
            });
          }
          showToast("Consultation saved successfully!");
          setTimeout(() => router.push("/doctor/records"), 1500);
        },
      }
    );
  };

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Loading...";
  const latestRecord = records[0];
  const vitals = latestRecord?.vitals;

  const tabs = [
    { id: "notes", label: "Consultation Notes", icon: FileText },
    { id: "exam", label: "Eye Examination", icon: Eye },
    { id: "diagnosis", label: "Diagnosis & Rx", icon: ClipboardCheck },
  ];

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading patient...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-20">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900">{patientName}</h1>
              <Badge variant="outline" className="bg-slate-100 text-[10px] sm:text-xs">{patient.id.slice(0, 8)}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {calculateAge(patient.dateOfBirth)} years • {patient.gender} • {patient.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.push(`/doctor/records/${patient.id}`)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <History size={16} className="sm:w-[18px] sm:h-[18px]" />
            History
          </button>
          <button
            onClick={handleSave}
            disabled={createRecord.isPending}
            className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
          >
            <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
            {createRecord.isPending ? "Saving..." : "Complete"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Visit Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Visit Purpose</p>
                <p className="text-sm font-semibold text-slate-900">General Consultation</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Patient Type</p>
                <Badge className={patient.patientType === "hmo" ? "bg-emerald-100 text-emerald-700 border-none" : "bg-slate-100 text-slate-700 border-none"}>
                  {patient.patientType === "hmo" ? `HMO — ${patient.hmoName || "Active"}` : "Private"}
                </Badge>
              </div>
              {vitals && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-2">Vitals (from Nurse)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-500">BP</p>
                      <p className="text-xs font-bold text-slate-900">{vitals.bloodPressureSystolic}/{vitals.bloodPressureDiastolic}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-500">Temp</p>
                      <p className="text-xs font-bold text-slate-900">{vitals.temperature}°C</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-500">Pulse</p>
                      <p className="text-xs font-bold text-slate-900">{vitals.heartRate} bpm</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-500">O₂ Sat</p>
                      <p className="text-xs font-bold text-slate-900">{vitals.oxygenSaturation}%</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">Recent History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {records.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group" onClick={() => router.push(`/doctor/records/${patient.id}`)}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-slate-900">{new Date(r.createdAt).toLocaleDateString()}</p>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                      &quot;{r.chiefComplaint || r.diagnosis || "No complaint recorded"}&quot;
                    </p>
                  </div>
                ))}
                {records.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500">No previous records</div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-white text-emerald-700 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                <tab.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <Card className="min-h-[500px]">
            <CardContent className="pt-8 px-8">
              {activeTab === "notes" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Chief Complaint & History</h3>
                  <textarea
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Type patient's complaints and clinical history here..."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Medical History</label>
                      <textarea
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        className="w-full h-24 p-3 rounded-lg border border-slate-200 outline-none"
                        placeholder="Allergies, chronic conditions..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Family History</label>
                      <textarea
                        value={familyHistory}
                        onChange={(e) => setFamilyHistory(e.target.value)}
                        className="w-full h-24 p-3 rounded-lg border border-slate-200 outline-none"
                        placeholder="Glaucoma, diabetes..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "exam" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Ocular Examination</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">OD (Right Eye)</Badge>
                      <Badge variant="outline" className="text-sky-700 border-sky-200 bg-sky-50">OS (Left Eye)</Badge>
                    </div>
                  </div>

                  <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="py-4 bg-slate-50/50">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Activity size={16} className="text-emerald-600" />
                        Visual Acuity (VA)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Right Eye (OD)</p>
                          <div className="grid grid-cols-2 gap-2">
                            <input value={vaOdUnaided} onChange={(e) => setVaOdUnaided(e.target.value)} placeholder="Unaided" className="p-2 rounded border text-sm" />
                            <input value={vaOdAided} onChange={(e) => setVaOdAided(e.target.value)} placeholder="Aided" className="p-2 rounded border text-sm" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Left Eye (OS)</p>
                          <div className="grid grid-cols-2 gap-2">
                            <input value={vaOsUnaided} onChange={(e) => setVaOsUnaided(e.target.value)} placeholder="Unaided" className="p-2 rounded border text-sm" />
                            <input value={vaOsAided} onChange={(e) => setVaOsAided(e.target.value)} placeholder="Aided" className="p-2 rounded border text-sm" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-100 shadow-sm">
                    <CardHeader className="py-4 bg-slate-50/50">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Eye size={16} className="text-sky-600" />
                        Refraction & IOP
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Intraocular Pressure (IOP)</p>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="text-[10px] text-slate-400">OD (mmHg)</label>
                              <input type="number" value={iopOd} onChange={(e) => setIopOd(e.target.value)} className="w-full p-2 rounded border text-sm" />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] text-slate-400">OS (mmHg)</label>
                              <input type="number" value={iopOs} onChange={(e) => setIopOs(e.target.value)} className="w-full p-2 rounded border text-sm" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slit Lamp / Anterior Segment</p>
                          <textarea value={slitLamp} onChange={(e) => setSlitLamp(e.target.value)} className="w-full h-20 p-2 rounded border text-sm" placeholder="Findings..." />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <ClinicalImagingGallery />
                </div>
              )}

              {activeTab === "diagnosis" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Diagnosis & Optical Rx</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Diagnosis</label>
                      <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full p-4 rounded-2xl border border-slate-200 outline-none font-bold text-slate-900" placeholder="Enter primary diagnosis..." />
                    </div>

                    <Card className="border-emerald-100 bg-emerald-50/20 rounded-2xl shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-800">Optical Prescription (Rx)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-5 gap-3 text-center">
                          <div />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SPH</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CYL</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AXIS</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ADD</p>

                          <p className="text-xs font-black text-slate-600 self-center uppercase">OD</p>
                          <input value={sphOd} onChange={(e) => setSphOd(e.target.value)} className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
                          <input value={cylOd} onChange={(e) => setCylOd(e.target.value)} className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
                          <input value={axisOd} onChange={(e) => setAxisOd(e.target.value)} className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0" />
                          <input value={addOd} onChange={(e) => setAddOd(e.target.value)} className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />

                          <p className="text-xs font-black text-slate-600 self-center uppercase">OS</p>
                          <input value={sphOs} onChange={(e) => setSphOs(e.target.value)} className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
                          <input value={cylOs} onChange={(e) => setCylOs(e.target.value)} className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
                          <input value={axisOs} onChange={(e) => setAxisOs(e.target.value)} className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0" />
                          <input value={addOs} onChange={(e) => setAddOs(e.target.value)} className="p-2 rounded-lg border border-slate-200 text-center font-bold" placeholder="0.00" />
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Management Plan</label>
                      <textarea value={managementPlan} onChange={(e) => setManagementPlan(e.target.value)} className="w-full h-32 p-4 rounded-2xl border border-slate-200 outline-none font-medium text-slate-700" placeholder="Surgical plan, lifestyle advice, next steps..." />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Prescription (Optional)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <input value={rxMedication} onChange={(e) => setRxMedication(e.target.value)} className="p-3 rounded-xl border border-slate-200 text-sm font-medium" placeholder="Medication name" />
                        <input value={rxDosage} onChange={(e) => setRxDosage(e.target.value)} className="p-3 rounded-xl border border-slate-200 text-sm font-medium" placeholder="Dosage (e.g., 5mg)" />
                        <input value={rxFrequency} onChange={(e) => setRxFrequency(e.target.value)} className="p-3 rounded-xl border border-slate-200 text-sm font-medium" placeholder="Frequency (e.g., BID)" />
                        <input value={rxDuration} onChange={(e) => setRxDuration(e.target.value)} className="p-3 rounded-xl border border-slate-200 text-sm font-medium" placeholder="Duration (e.g., 7 days)" />
                      </div>
                      <input value={rxInstructions} onChange={(e) => setRxInstructions(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium" placeholder="Special instructions..." />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 bg-white border border-slate-200 rounded-2xl shadow-sm gap-3">
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <button onClick={() => { setChiefComplaint(""); setMedicalHistory(""); setFamilyHistory(""); setDiagnosis(""); setManagementPlan(""); }} className="text-xs font-bold text-slate-500 hover:text-slate-700">Clear Form</button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleSave}
                disabled={createRecord.isPending}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                {createRecord.isPending ? "Saving..." : "Save & Complete"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
