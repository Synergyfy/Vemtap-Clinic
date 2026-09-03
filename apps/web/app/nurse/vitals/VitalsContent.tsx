"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Activity, Thermometer, Eye, Heart, CheckCircle2, User } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseQueue, usePatientHistory, useCreateRecord } from "@/hooks/useNurse";

export default function VitalsContent() {
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patient");

  const { data: queueEntries = [] } = useNurseQueue();
  const { data: patientRecords = [] } = usePatientHistory(preselectedPatientId);
  const createRecord = useCreateRecord();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [temp, setTemp] = useState("36.5");
  const [bpSystolic, setBpSystolic] = useState("120");
  const [bpDiastolic, setBpDiastolic] = useState("80");
  const [pulse, setPulse] = useState("72");
  const [respiratoryRate, setRespiratoryRate] = useState("16");
  const [oxygenSat, setOxygenSat] = useState("98");
  const [successMsg, setSuccessMsg] = useState("");

  const waitingEntries = queueEntries.filter(
    (e) => e.status === "waiting" || e.status === "in_progress"
  );

  const latestVitals = patientRecords.length > 0 ? patientRecords[0]?.vitals : null;

  const openRecordingModal = (patientId: string) => {
    setSelectedPatientId(patientId);
    setTemp("36.5");
    setBpSystolic("120");
    setBpDiastolic("80");
    setPulse("72");
    setRespiratoryRate("16");
    setOxygenSat("98");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleRecord = () => {
    if (!selectedPatientId) return;
    const entry = queueEntries.find((e) => e.patientId === selectedPatientId);
    createRecord.mutate(
      {
        patientId: selectedPatientId,
        branchId: entry?.branchId || "",
        clinicId: entry?.clinicId || "",
        chiefComplaint: "Vitals recording",
        vitals: {
          temperature: parseFloat(temp),
          bloodPressureSystolic: parseFloat(bpSystolic),
          bloodPressureDiastolic: parseFloat(bpDiastolic),
          heartRate: parseInt(pulse),
          respiratoryRate: parseInt(respiratoryRate),
          oxygenSaturation: parseFloat(oxygenSat),
        },
      },
      {
        onSuccess: () => {
          setSuccessMsg("Vitals recorded successfully");
          setTimeout(() => { setModalOpen(false); setSuccessMsg(""); }, 1200);
        },
      }
    );
  };

  const preselectedEntry = preselectedPatientId
    ? queueEntries.find((e) => e.patientId === preselectedPatientId)
    : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Vitals Entry"
        description="Record and manage patient vital signs including BP, temperature, pulse, and oxygen saturation."
      />

      {preselectedEntry && (
        <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-4 flex items-center gap-3">
          <Activity size={20} className="text-cyan-600 shrink-0" />
          <p className="text-sm text-cyan-800">
            Ready to record vitals for <span className="font-bold">{preselectedEntry.patient?.firstName} {preselectedEntry.patient?.lastName}</span>. Click <strong>Record</strong> below to begin.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Latest Vitals</CardTitle>
            {latestVitals && <Badge variant="secondary">Most Recent</Badge>}
          </CardHeader>
          <CardContent className="p-0">
            {latestVitals ? (
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-cyan-50 text-cyan-700"><Activity size={20} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Blood Pressure</p>
                      <p className="text-lg font-bold text-slate-900">{latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic} <span className="text-xs font-normal text-slate-500">mmHg</span></p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-700"><Thermometer size={20} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Temperature</p>
                      <p className="text-lg font-bold text-slate-900">{latestVitals.temperature} <span className="text-xs font-normal text-slate-500">°C</span></p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-rose-50 text-rose-700"><Heart size={20} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Pulse</p>
                      <p className="text-lg font-bold text-slate-900">{latestVitals.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span></p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-violet-50 text-violet-700"><Eye size={20} /></div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">O₂ Saturation</p>
                      <p className="text-lg font-bold text-slate-900">{latestVitals.oxygenSaturation} <span className="text-xs font-normal text-slate-500">%</span></p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] text-slate-400 uppercase">Respiratory Rate</p>
                    <p className="text-lg font-bold text-slate-900">{latestVitals.respiratoryRate} <span className="text-xs font-normal text-slate-500">/min</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">
                {preselectedPatientId ? "No vitals recorded yet for this patient." : "Select a patient to view their latest vitals."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Normal Ranges</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-50 text-cyan-700"><Activity size={20} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Blood Pressure</p>
                <p className="text-lg font-bold text-slate-900">120/80 mmHg</p>
                <p className="text-xs text-emerald-600">Normal range</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-700"><Thermometer size={20} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Temperature</p>
                <p className="text-lg font-bold text-slate-900">36.5 °C</p>
                <p className="text-xs text-emerald-600">Normal range</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700"><Heart size={20} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">Pulse Rate</p>
                <p className="text-lg font-bold text-slate-900">72 bpm</p>
                <p className="text-xs text-emerald-600">Normal range</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-violet-50 text-violet-700"><Eye size={20} /></div>
              <div>
                <p className="text-sm font-medium text-slate-500">O₂ Saturation</p>
                <p className="text-lg font-bold text-slate-900">95-100%</p>
                <p className="text-xs text-emerald-600">Normal range</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Patients Awaiting Vitals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {waitingEntries.map((e) => (
              <div key={e.id} className={`p-4 ${e.patientId === preselectedPatientId ? "bg-cyan-50/50" : ""}`}>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{e.patient?.firstName} {e.patient?.lastName}</p>
                    <p className="text-[10px] text-slate-400">{e.notes || e.station || "General"}</p>
                  </div>
                  <button onClick={() => openRecordingModal(e.patientId)} className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-bold text-white">Record</button>
                </div>
                <Badge className={e.status === "in_progress" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"}>
                  {e.status === "in_progress" ? "In Progress" : "Waiting"}
                </Badge>
              </div>
            ))}
            {waitingEntries.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No patients awaiting vitals.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitingEntries.map((e) => (
                  <TableRow key={e.id} className={e.patientId === preselectedPatientId ? "bg-cyan-50/50" : ""}>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{e.patient?.firstName} {e.patient?.lastName}</TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{e.notes || e.station || "General"}</TableCell>
                    <TableCell>
                      <Badge className={e.status === "in_progress" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"}>
                        {e.status === "in_progress" ? "In Progress" : "Waiting"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => openRecordingModal(e.patientId)} className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700">Record</button>
                    </TableCell>
                  </TableRow>
                ))}
                {waitingEntries.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">No patients awaiting vitals.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSuccessMsg(""); }} title="Record Vitals">
        {successMsg ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-600" />
            </div>
            <p className="text-lg font-bold text-emerald-700">{successMsg}</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => openRecordingModal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="">Select patient...</option>
                {waitingEntries.map((e) => (
                  <option key={e.patientId} value={e.patientId}>{e.patient?.firstName} {e.patient?.lastName} - {e.notes || "Queue"}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Systolic (mmHg)</label>
                <input type="number" value={bpSystolic} onChange={(e) => setBpSystolic(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="120" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Diastolic (mmHg)</label>
                <input type="number" value={bpDiastolic} onChange={(e) => setBpDiastolic(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="80" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Temperature (°C)</label>
                <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="36.5" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Pulse (bpm)</label>
                <input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="72" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Respiratory Rate</label>
                <input type="number" value={respiratoryRate} onChange={(e) => setRespiratoryRate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="16" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">O₂ Saturation (%)</label>
                <input type="number" step="0.1" value={oxygenSat} onChange={(e) => setOxygenSat(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="98" />
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleRecord}
                disabled={!selectedPatientId || createRecord.isPending}
                className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createRecord.isPending ? "Saving..." : "Save Vitals"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
