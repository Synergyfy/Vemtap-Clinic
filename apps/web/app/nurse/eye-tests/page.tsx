"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseQueue } from "@/hooks/useNurse";

function statusBadge(status: string) {
  if (status === "waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (status === "in_progress") return <Badge className="bg-amber-600 text-white">In Progress</Badge>;
  if (status === "completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function NurseEyeTests() {
  const { data: queueEntries = [], isLoading } = useNurseQueue();

  const eyeTestEntries = queueEntries.filter(
    (e) =>
      (e.notes || "").toLowerCase().includes("vision") ||
      (e.notes || "").toLowerCase().includes("eye") ||
      (e.notes || "").toLowerCase().includes("screening") ||
      (e.station || "").toLowerCase().includes("eye") ||
      (e.station || "").toLowerCase().includes("vision")
  );

  const awaiting = eyeTestEntries.filter((e) => e.status === "waiting");
  const inProgress = eyeTestEntries.filter((e) => e.status === "in_progress");
  const done = eyeTestEntries.filter((e) => e.status === "completed");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading eye tests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Eye Tests"
        description="Prepare patients for vision measurements and eye examinations."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Awaiting Test</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{awaiting.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-50 text-cyan-700">
              <Eye size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">In Progress</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{inProgress.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
              <Activity size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Completed</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{done.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={24} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Today</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{eyeTestEntries.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 text-violet-700">
              <AlertTriangle size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="eye-queue">
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Eye Test Queue</CardTitle>
          <Link href="/nurse/vitals" className="text-xs sm:text-sm font-medium text-cyan-700 hover:text-cyan-800">Record Vision</Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {eyeTestEntries.map((e) => (
              <div key={e.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{e.patient?.firstName} {e.patient?.lastName}</p>
                    <p className="text-[10px] text-slate-400">Ticket #{e.ticketNumber}</p>
                  </div>
                  <Link href={`/nurse/vitals?patient=${e.patientId}`} className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-[10px] font-bold text-white">Measure</Link>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-500 truncate">{e.notes || e.station || "Eye Test"}</span>
                  <span className="text-slate-200">|</span>
                  {statusBadge(e.status)}
                </div>
              </div>
            ))}
            {eyeTestEntries.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No eye test patients today.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eyeTestEntries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{e.patient?.firstName} {e.patient?.lastName}</TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{e.notes || e.station || "Eye Test"}</TableCell>
                    <TableCell className="text-sm text-slate-500">#{e.ticketNumber}</TableCell>
                    <TableCell>{statusBadge(e.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/nurse/vitals?patient=${e.patientId}`} className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 whitespace-nowrap">Measure Vision</Link>
                    </TableCell>
                  </TableRow>
                ))}
                {eyeTestEntries.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-slate-500 py-6">No eye test patients today.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
