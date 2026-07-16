"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Heart, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseStore } from "@/app/nurse/_mock/nurse-store";

function severityBadge(severity: string) {
  if (severity === "High") return <Badge className="bg-rose-600 text-white">High</Badge>;
  if (severity === "Medium") return <Badge className="bg-amber-600 text-white">Medium</Badge>;
  return <Badge variant="secondary">Low</Badge>;
}

function statusBadge(status: string) {
  if (status === "Open") return <Badge className="bg-sky-600 text-white">Open</Badge>;
  if (status === "Acknowledged") return <Badge className="bg-amber-600 text-white">Acknowledged</Badge>;
  if (status === "Resolved") return <Badge className="bg-emerald-600 text-white">Resolved</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function NurseMonitoring() {
  const assignedPatients = useNurseStore((s) => s.assignedPatients);
  const monitoringAlerts = useNurseStore((s) => s.monitoringAlerts);
  const observationNotes = useNurseStore((s) => s.observationNotes);
  const acknowledgeAlert = useNurseStore((s) => s.acknowledgeAlert);
  const markFollowUpDone = useNurseStore((s) => s.markFollowUpDone);

  const [confirmId, setConfirmId] = useState<string | null>(null);

  const underObservation = assignedPatients.filter((p) => p.status === "Under Observation");
  const openAlerts = monitoringAlerts.filter((a) => a.status === "Open");

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert(alertId);
    setConfirmId(null);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Patient Monitoring"
        description="Track patient observations, alerts, and monitoring timelines."
      />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2" id="alerts">
          <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle size={18} className="text-rose-500" />
              Active Alerts
            </CardTitle>
            <Badge className="bg-rose-600 text-white">{openAlerts.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="md:hidden divide-y divide-slate-100">
              {monitoringAlerts.map((a) => (
                <div key={a.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">{a.patientName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.alert}</p>
                    </div>
                    {severityBadge(a.severity)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusBadge(a.status)}
                      <span className="text-[10px] text-slate-400">{a.timestamp}</span>
                    </div>
                    {a.status === "Open" ? (
                      <button onClick={() => setConfirmId(a.id)} className="rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-bold text-white">Acknowledge</button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium"><CheckCircle2 size={12} />Done</span>
                    )}
                  </div>
                </div>
              ))}
              {monitoringAlerts.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No alerts to display.</p>}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Alert</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monitoringAlerts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">{a.patientName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{a.alert}</TableCell>
                      <TableCell>{severityBadge(a.severity)}</TableCell>
                      <TableCell className="text-xs text-slate-400 tabular-nums whitespace-nowrap">{a.timestamp}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                      <TableCell className="text-right">
                        {a.status === "Open" ? (
                          <button onClick={() => setConfirmId(a.id)} className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 whitespace-nowrap">Acknowledge</button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium"><CheckCircle2 size={14} />Done</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {monitoringAlerts.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-sm text-slate-500 py-6">No alerts to display.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Heart size={18} className="text-amber-500" />
              Under Observation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4">
            {underObservation.map((p) => (
              <div key={p.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{p.patientName}</p>
                <p className="mt-1 text-xs text-slate-500">{p.purpose}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{p.age}yrs / {p.gender}</span>
                  <Badge className={p.priority === "Urgent" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-700"}>{p.priority}</Badge>
                </div>
              </div>
            ))}
            {underObservation.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No patients under observation.</p>}
          </CardContent>
        </Card>
      </div>

      <Card id="notes">
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Observation Timeline</CardTitle>
          <Badge variant="secondary">{observationNotes.length} entries</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {observationNotes.map((o) => (
              <div key={o.id} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-medium text-slate-900 text-sm truncate">{o.patientName}</p>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{o.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{o.note}</p>
                <Badge
                  variant="outline"
                  className={o.category === "Medication" ? "border-sky-300 text-sky-700 text-[10px]" : o.category === "Procedure" ? "border-violet-300 text-violet-700 text-[10px]" : "border-slate-300 text-slate-600 text-[10px]"}
                >
                  {o.category}
                </Badge>
              </div>
            ))}
            {observationNotes.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No observations yet.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {observationNotes.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs text-slate-400 tabular-nums whitespace-nowrap">{o.timestamp}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{o.patientName}</TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-xs">{o.note}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={o.category === "Medication" ? "border-sky-300 text-sky-700" : o.category === "Procedure" ? "border-violet-300 text-violet-700" : "border-slate-300 text-slate-600"}>{o.category}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!confirmId} onClose={() => setConfirmId(null)} title="Acknowledge Alert">
        <p className="text-sm text-slate-600">
          Are you sure you want to acknowledge this alert? It will be marked as acknowledged.
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setConfirmId(null)} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={() => confirmId && handleAcknowledge(confirmId)} className="inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700">Acknowledge</button>
        </div>
      </Modal>
    </div>
  );
}
