import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { doctorWaitingPatients } from "@/app/doctor/_mock/doctor-data";
import { Clock, UserPlus, PlayCircle } from "lucide-react";

function statusBadge(status: string) {
  if (status === "Urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  if (status === "In-service") return <Badge className="bg-amber-600 text-white">In service</Badge>;
  if (status === "Waiting") return <Badge variant="secondary">Waiting</Badge>;
  if (status === "Done") return <Badge className="bg-emerald-600 text-white">Done</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function DoctorQueue() {
  return (
    <div className="space-y-4 sm:space-y-8">
      <PageHeader
        title="Consultation Queue"
        description="Manage patients waiting for consultation. Prioritize urgent cases and track wait times."
        actions={[
          { label: "Refresh Queue", href: "#", variant: "outline" },
        ]}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <Card className="col-span-2 md:col-span-1 bg-emerald-50/50 border-emerald-100">
          <CardContent className="p-3 sm:p-6 flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 rounded-xl bg-white text-emerald-600 shadow-sm">
              <UserPlus size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-sm font-medium text-emerald-800">Next Patient</p>
              <p className="text-base sm:text-xl font-bold text-slate-900 truncate">{doctorWaitingPatients[0]?.patientName || "None"}</p>
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
              <p className="text-base sm:text-xl font-bold text-slate-900">{doctorWaitingPatients.length}</p>
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
              <p className="text-base sm:text-xl font-bold text-slate-900">18 mins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Active Waiting List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile: card list */}
          <div className="md:hidden divide-y divide-slate-100">
            {doctorWaitingPatients.map((q, index) => (
              <div key={q.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-slate-400 text-xs">#{index + 1}</span>
                    <p className="font-semibold text-slate-900 text-sm truncate">{q.patientName}</p>
                  </div>
                  <Link href={`/doctor/workspace/${q.patientId}`} className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-bold text-white">
                    <PlayCircle size={12} /> Start
                  </Link>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {statusBadge(q.priority)}
                  <span className="text-[10px] tabular-nums font-medium text-slate-600">{q.waitMinutes}m</span>
                  {statusBadge(q.status)}
                </div>
              </div>
            ))}
          </div>
          {/* Desktop: full table */}
          <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Wait Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctorWaitingPatients.map((q, index) => (
                <TableRow key={q.id}>
                  <TableCell className="font-bold text-slate-400">#{index + 1}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{q.patientName}</TableCell>
                  <TableCell>{statusBadge(q.priority)}</TableCell>
                  <TableCell className="tabular-nums font-medium text-slate-600">{q.waitMinutes} mins</TableCell>
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
              {doctorWaitingPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-500">
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
