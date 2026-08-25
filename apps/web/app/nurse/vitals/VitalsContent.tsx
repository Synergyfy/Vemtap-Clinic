"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Activity, Thermometer, Eye, Heart, CheckCircle2, User } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseStore } from "@/app/nurse/_mock/nurse-store";

export default function VitalsContent() {
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patient");

  const assignedPatients = useNurseStore((s) => s.assignedPatients);
  const pendingVitals = useNurseStore((s) => s.pendingVitals);
  const recordVitals = useNurseStore((s) => s.recordVitals);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [bp, setBp] = useState("120/80");
  const [temp, setTemp] = useState("36.5");
  const [pulse, setPulse] = useState("72");
  const [vision, setVision] = useState("6/6");
  const [successMsg, setSuccessMsg] = useState("");

  const waitingPatients = assignedPatients.filter(
    (p) => p.status === "Waiting" || p.status === "Under Observation"
  );

  const openRecordingModal = (patientId: string) => {
    setSelectedPatientId(patientId);
    setBp("120/80");
    setTemp("36.5");
    setPulse("72");
    setVision("6/6");
    setSuccessMsg("");
    setModalOpen(true);
  };

  const handleRecord = () => {
    if (!selectedPatientId) return;
    recordVitals(selectedPatientId, {
      bloodPressure: bp,
      temperature: temp,
      pulse,
      visionMeasurement: vision,
    });
    setSuccessMsg("Vitals recorded successfully");
    setTimeout(() => {
      setModalOpen(false);
      setSuccessMsg("");
    }, 1200);
  };

  const preselectedName = useMemo(() => {
    if (!preselectedPatientId) return null;
    const p = assignedPatients.find((x) => x.patientId === preselectedPatientId);
    return p?.patientName ?? null;
  }, [preselectedPatientId, assignedPatients]);

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Vitals Entry"
        description="Record and manage patient vital signs including BP, temperature, pulse, and vision measurements."
      />

      {preselectedName && (
        <div className="rounded-xl bg-cyan-50 border border-cyan-200 p-4 flex items-center gap-3">
          <Activity size={20} className="text-cyan-600 shrink-0" />
          <p className="text-sm text-cyan-800">
            Ready to record vitals for <span className="font-bold">{preselectedName}</span>. Click <strong>Record</strong> below to begin.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-base sm:text-lg">Pending Vitals</CardTitle>
            <Badge variant="secondary">{pendingVitals.length} pending</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {pendingVitals.map((v) => (
                <div key={v.id} className={v.patientId === preselectedPatientId ? "bg-cyan-50/50" : ""}>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <p className="font-medium text-slate-900 text-sm truncate">{v.patientName}</p>
                      <button onClick={() => openRecordingModal(v.patientId)} className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-bold text-white">Record</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div><p className="text-[8px] text-slate-400 uppercase tracking-wider">BP</p><p className="text-xs font-semibold text-slate-700 tabular-nums">{v.bloodPressure}</p></div>
                      <div><p className="text-[8px] text-slate-400 uppercase tracking-wider">Temp</p><p className="text-xs font-semibold text-slate-700 tabular-nums">{v.temperature} °C</p></div>
                      <div><p className="text-[8px] text-slate-400 uppercase tracking-wider">Pulse</p><p className="text-xs font-semibold text-slate-700 tabular-nums">{v.pulse} bpm</p></div>
                      <div><p className="text-[8px] text-slate-400 uppercase tracking-wider">Vision</p><p className="text-xs font-semibold text-slate-700 tabular-nums">{v.visionMeasurement}</p></div>
                    </div>
                  </div>
                </div>
              ))}
              {pendingVitals.length === 0 && <p className="text-center text-sm text-slate-500 py-6">All vitals recorded. Good job!</p>}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead className="text-center">BP (mmHg)</TableHead>
                    <TableHead className="text-center">Temp (°C)</TableHead>
                    <TableHead className="text-center">Pulse (bpm)</TableHead>
                    <TableHead className="text-center">Vision</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVitals.map((v) => (
                    <TableRow key={v.id} className={v.patientId === preselectedPatientId ? "bg-cyan-50/50" : ""}>
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">{v.patientName}</TableCell>
                      <TableCell className="text-center tabular-nums"><span className="inline-flex items-center gap-1 text-slate-400"><Thermometer size={14} className="text-slate-300" />{v.bloodPressure}</span></TableCell>
                      <TableCell className="text-center text-slate-400 tabular-nums">{v.temperature}</TableCell>
                      <TableCell className="text-center tabular-nums"><span className="inline-flex items-center gap-1 text-slate-400"><Heart size={14} className="text-slate-300" />{v.pulse}</span></TableCell>
                      <TableCell className="text-center text-slate-400"><span className="inline-flex items-center gap-1"><Eye size={14} className="text-slate-300" />{v.visionMeasurement}</span></TableCell>
                      <TableCell className="text-right">
                        <button onClick={() => openRecordingModal(v.patientId)} className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 whitespace-nowrap">Record</button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingVitals.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-slate-500 py-6">All vitals recorded. Good job!</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
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
                <p className="text-sm font-medium text-slate-500">Visual Acuity</p>
                <p className="text-lg font-bold text-slate-900">6/6</p>
                <p className="text-xs text-emerald-600">Normal vision</p>
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
            {waitingPatients.map((p) => (
              <div key={p.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{p.patientName}</p>
                    <p className="text-[10px] text-slate-400">{p.purpose}</p>
                  </div>
                  <button onClick={() => openRecordingModal(p.patientId)} className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-bold text-white">Record</button>
                </div>
                <Badge className={p.status === "Under Observation" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"}>{p.status}</Badge>
              </div>
            ))}
            {waitingPatients.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No patients awaiting vitals.</p>}
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
                {waitingPatients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{p.patientName}</TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{p.purpose}</TableCell>
                    <TableCell>
                      <Badge className={p.status === "Under Observation" ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-700"}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => openRecordingModal(p.patientId)} className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700">Record</button>
                    </TableCell>
                  </TableRow>
                ))}
                {waitingPatients.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-sm text-slate-500 py-6">No patients awaiting vitals.</TableCell></TableRow>}
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
                {assignedPatients.filter((p) => p.status !== "Completed").map((p) => (
                  <option key={p.patientId} value={p.patientId}>{p.patientName} - {p.purpose}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Blood Pressure (mmHg)</label>
                <input type="text" value={bp} onChange={(e) => setBp(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="120/80" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Temperature (°C)</label>
                <input type="text" value={temp} onChange={(e) => setTemp(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="36.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Pulse (bpm)</label>
                <input type="text" value={pulse} onChange={(e) => setPulse(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="72" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Vision Measurement</label>
                <input type="text" value={vision} onChange={(e) => setVision(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="6/6" />
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleRecord}
                disabled={!selectedPatientId}
                className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Vitals
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
