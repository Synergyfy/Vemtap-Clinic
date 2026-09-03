"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Heart, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseQueue, useClinicNotes } from "@/hooks/useNurse";

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
  const { data: queueEntries = [] } = useNurseQueue();
  const { data: notes = [] } = useClinicNotes();

  const underObservation = queueEntries.filter((e) => e.status === "in_progress");

  const alerts = useMemo(() => {
    return notes
      .filter((n) => n.category === "adverse_reaction" || n.category === "allergy")
      .map((n) => ({
        id: n.id,
        patientName: `${n.patient?.firstName} ${n.patient?.lastName}`,
        patientId: n.patientId,
        alert: n.note,
        severity: n.category === "adverse_reaction" ? "High" : "Medium",
        timestamp: new Date(n.createdAt).toLocaleString(),
        status: "Open" as const,
        category: n.category,
      }));
  }, [notes]);

  const openAlerts = alerts.filter((a) => a.status === "Open");

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
              {alerts.map((a) => (
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
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium"><CheckCircle2 size={12} />Noted</span>
                  </div>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No alerts to display.</p>}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium text-slate-900 whitespace-nowrap">{a.patientName}</TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-xs truncate">{a.alert}</TableCell>
                      <TableCell>{severityBadge(a.severity)}</TableCell>
                      <TableCell className="text-xs text-slate-400 tabular-nums whitespace-nowrap">{a.timestamp}</TableCell>
                      <TableCell>{statusBadge(a.status)}</TableCell>
                    </TableRow>
                  ))}
                  {alerts.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-slate-500 py-6">No alerts to display.</TableCell></TableRow>}
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
            {underObservation.map((e) => (
              <div key={e.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{e.patient?.firstName} {e.patient?.lastName}</p>
                <p className="mt-1 text-xs text-slate-500">{e.notes || e.station || "General"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Ticket #{e.ticketNumber}</span>
                  <Badge className="bg-slate-100 text-slate-700">{e.priority || "Normal"}</Badge>
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
          <Badge variant="secondary">{notes.length} entries</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {notes.map((o) => (
              <div key={o.id} className="p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-medium text-slate-900 text-sm truncate">{o.patient?.firstName} {o.patient?.lastName}</p>
                  <span className="text-[10px] text-slate-400 tabular-nums shrink-0">{new Date(o.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">{o.note}</p>
                <Badge variant="outline" className="text-[10px]">{o.category}</Badge>
              </div>
            ))}
            {notes.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No observations yet.</p>}
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
                {notes.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="text-xs text-slate-400 tabular-nums whitespace-nowrap">{new Date(o.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{o.patient?.firstName} {o.patient?.lastName}</TableCell>
                    <TableCell className="text-sm text-slate-600 max-w-xs">{o.note}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{o.category}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
