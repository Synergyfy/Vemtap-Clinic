"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseStore } from "@/app/nurse/_mock/nurse-store";

function statusBadge(status: string) {
  if (status === "Waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (status === "Under Observation") return <Badge className="bg-amber-600 text-white">Under Observation</Badge>;
  if (status === "Completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (status === "Normal") return <Badge className="bg-sky-600 text-white">Normal</Badge>;
  if (status === "Urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function NurseEyeTests() {
  const assignedPatients = useNurseStore((s) => s.assignedPatients);

  const eyeTestPatients = assignedPatients.filter(
    (p) =>
      p.purpose.toLowerCase().includes("vision") ||
      p.purpose.toLowerCase().includes("eye") ||
      p.purpose.toLowerCase().includes("screening")
  );

  const awaiting = eyeTestPatients.filter((p) => p.status === "Waiting");
  const inProgress = eyeTestPatients.filter((p) => p.status === "Under Observation");
  const done = eyeTestPatients.filter((p) => p.status === "Completed");

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Eye Tests"
        description="Prepare patients for vision measurements and eye examinations."
      />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-4">
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
              <p className="mt-1 text-2xl font-bold text-slate-900">{eyeTestPatients.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-violet-50 text-violet-700">
              <AlertTriangle size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="eye-queue">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Eye Test Queue</CardTitle>
          <Link
            href="/nurse/vitals"
            className="text-sm font-medium text-cyan-700 hover:text-cyan-800"
          >
            Record Vision
          </Link>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eyeTestPatients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                      {p.patientName}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">{p.purpose}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {p.age}yrs / {p.gender}
                    </TableCell>
                    <TableCell>{statusBadge(p.priority)}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/nurse/vitals?patient=${p.patientId}`}
                        className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 transition-colors whitespace-nowrap"
                      >
                        Measure Vision
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {eyeTestPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-slate-500 py-6">
                      No eye test patients today.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
