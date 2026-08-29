"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useNurseFollowUps } from "@/hooks/useNurse";

function statusBadge(status: string) {
  if (status === "scheduled" || status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "completed") return <Badge className="bg-emerald-600 text-white">Completed</Badge>;
  if (status === "cancelled") return <Badge className="bg-rose-600 text-white">Missed</Badge>;
  if (status === "confirmed") return <Badge className="bg-sky-600 text-white">Confirmed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function NurseFollowUps() {
  const { data: followUps = [], isLoading } = useNurseFollowUps(null);

  const pending = followUps.filter((f) => f.status === "scheduled" || f.status === "pending");
  const completed = followUps.filter((f) => f.status === "completed");
  const missed = followUps.filter((f) => f.status === "cancelled");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading follow-ups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Follow-up Tracking"
        description="Manage patient follow-up schedules, status updates, and care continuation."
      />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-3">
        <Card id="pending">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Pending
            </CardTitle>
            <Badge variant="secondary">{pending.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {pending.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{f.patient?.firstName} {f.patient?.lastName}</p>
                <p className="mt-1 text-xs text-slate-500">{f.reason || f.notes || "Follow-up"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <Calendar size={12} />
                    Due: {new Date(f.appointmentDate).toLocaleDateString()}
                  </span>
                  <span>{statusBadge(f.status)}</span>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No pending follow-ups.</p>
            )}
          </CardContent>
        </Card>

        <Card id="completed">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              Completed
            </CardTitle>
            <Badge className="bg-emerald-600 text-white">{completed.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {completed.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{f.patient?.firstName} {f.patient?.lastName}</p>
                <p className="mt-1 text-xs text-slate-500">{f.reason || f.notes || "Follow-up"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(f.appointmentDate).toLocaleDateString()}
                  </span>
                  <span>{statusBadge(f.status)}</span>
                </div>
              </div>
            ))}
            {completed.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No completed follow-ups.</p>
            )}
          </CardContent>
        </Card>

        <Card id="missed">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-500" />
              Missed
            </CardTitle>
            <Badge className="bg-rose-600 text-white">{missed.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {missed.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{f.patient?.firstName} {f.patient?.lastName}</p>
                <p className="mt-1 text-xs text-slate-500">{f.reason || f.notes || "Follow-up"}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(f.appointmentDate).toLocaleDateString()}
                  </span>
                  <span>{statusBadge(f.status)}</span>
                </div>
              </div>
            ))}
            {missed.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No missed follow-ups.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">All Follow-up Schedules</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {followUps.map((f) => (
              <div key={f.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate">{f.patient?.firstName} {f.patient?.lastName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.reason || f.notes || "Follow-up"}</p>
                  </div>
                  {statusBadge(f.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md flex items-center gap-1">
                    <Calendar size={10} />
                    Due: {new Date(f.appointmentDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {followUps.length === 0 && <p className="text-center text-sm text-slate-500 py-6">No follow-ups scheduled.</p>}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followUps.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium text-slate-900 whitespace-nowrap">{f.patient?.firstName} {f.patient?.lastName}</TableCell>
                    <TableCell className="text-sm text-slate-600">{f.reason || f.notes || "Follow-up"}</TableCell>
                    <TableCell className="text-sm text-slate-500 tabular-nums">{new Date(f.appointmentDate).toLocaleDateString()}</TableCell>
                    <TableCell>{statusBadge(f.status)}</TableCell>
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
