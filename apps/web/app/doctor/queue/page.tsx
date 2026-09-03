"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useQueue } from "@/hooks/useQueue";
import { useAuth } from "@/lib/auth-context";
import { Clock, UserPlus, PlayCircle } from "lucide-react";

function statusBadge(status: string) {
  if (status === "urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (status === "in_progress") return <Badge className="bg-amber-600 text-white">In service</Badge>;
  if (status === "waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (status === "completed") return <Badge className="bg-emerald-600 text-white">Done</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function priorityBadge(priority: string) {
  if (priority === "Urgent" || priority === "urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  return <Badge variant="secondary">{priority || "Normal"}</Badge>;
}

export default function DoctorQueue() {
  const { user } = useAuth();
  const { data: response, isLoading } = useQueue({ clinicId: user?.clinicId, status: 'waiting' });
  const queueEntries = response?.data || [];

  const nextPatient = queueEntries[0];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading queue...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <PageHeader
        title="Consultation Queue"
        description="Manage patients waiting for consultation. Prioritize urgent cases and track wait times."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <Card className="col-span-2 md:col-span-1 bg-emerald-50/50 border-emerald-100">
          <CardContent className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-white text-emerald-600 shadow-sm">
              <UserPlus size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-emerald-800">Next Patient</p>
              <p className="text-base sm:text-xl font-bold text-slate-900 truncate">
                {nextPatient ? `${nextPatient.patient?.firstName} ${nextPatient.patient?.lastName}` : "None"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-slate-500">Waiting</p>
              <p className="text-base sm:text-xl font-bold text-slate-900">{queueEntries.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-rose-50 text-rose-600">
              <Clock size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-rose-800">Avg. Wait</p>
              <p className="text-base sm:text-xl font-bold text-slate-900">
                {queueEntries.length > 0 ? `${Math.round(queueEntries.reduce((sum, e) => {
                  const wait = e.calledAt ? (new Date(e.calledAt).getTime() - new Date(e.createdAt).getTime()) / 60000 : 0;
                  return sum + wait;
                }, 0) / queueEntries.length)}` : "0"} mins
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Active Waiting List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {queueEntries.map((q, index) => (
              <div key={q.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-400 text-xs">#{index + 1}</span>
                    <p className="font-semibold text-slate-900 text-sm truncate">{q.patient?.firstName} {q.patient?.lastName}</p>
                  </div>
                  <Link href={`/doctor/workspace/${q.patientId}`} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white">
                    <PlayCircle size={12} /> Start
                  </Link>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {priorityBadge(q.priority)}
                  {statusBadge(q.status)}
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueEntries.map((q, index) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-bold text-slate-400">#{index + 1}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{q.patient?.firstName} {q.patient?.lastName}</TableCell>
                    <TableCell>{priorityBadge(q.priority)}</TableCell>
                    <TableCell>{statusBadge(q.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/doctor/workspace/${q.patientId}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                      >
                        <PlayCircle size={16} />
                        Start Session
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {queueEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                      No patients currently in the queue.
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
