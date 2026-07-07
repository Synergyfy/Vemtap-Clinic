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
    <div className="space-y-8">
      <PageHeader
        title="Consultation Queue"
        description="Manage patients waiting for consultation. Prioritize urgent cases and track wait times."
        actions={[
          { label: "Refresh Queue", href: "#", variant: "outline" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white text-emerald-600 shadow-sm">
              <UserPlus size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">Next Patient</p>
              <p className="text-xl font-bold text-slate-900">{doctorWaitingPatients[0]?.patientName || "None"}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Waiting</p>
              <p className="text-xl font-bold text-slate-900">{doctorWaitingPatients.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-rose-800">Avg. Wait Time</p>
              <p className="text-xl font-bold text-slate-900">18 mins</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Waiting List</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
