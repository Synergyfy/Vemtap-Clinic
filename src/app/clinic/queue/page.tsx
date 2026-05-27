import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { clinicQueue } from "@/app/clinic/_mock/clinic-data";

function stageBadge(stage: string) {
  if (stage === "Billing") return <Badge className="bg-emerald-600 text-white">Billing</Badge>;
  if (stage === "Consultation") return <Badge className="bg-sky-600 text-white">Consultation</Badge>;
  if (stage === "Refraction") return <Badge className="bg-purple-600 text-white">Refraction</Badge>;
  return <Badge variant="outline">{stage}</Badge>;
}

function statusBadge(status: string) {
  if (status === "In-service") return <Badge className="bg-amber-600 text-white">In service</Badge>;
  if (status === "Done") return <Badge className="bg-emerald-600 text-white">Done</Badge>;
  return <Badge variant="secondary">Waiting</Badge>;
}

function priorityBadge(priority: string) {
  if (priority === "Urgent") return <Badge className="bg-rose-600 text-white">Urgent</Badge>;
  return <Badge variant="outline">Normal</Badge>;
}

export default function QueuePage() {
  const waiting = clinicQueue.filter((q) => q.status === "Waiting").length;
  const inService = clinicQueue.filter((q) => q.status === "In-service").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Queue Management"
        description="Live patient flow by stage: reception → consultation → refraction → optical → billing."
        actions={[
          { label: "Open dashboard", href: "/clinic/dashboard" },
          { label: "Appointments", href: "/clinic/appointments", variant: "primary" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">In queue</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{clinicQueue.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Waiting</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{waiting}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">In service</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{inService}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Live queue board</CardTitle>
          <p className="text-sm text-slate-500">Updated just now</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Wait</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicQueue.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-medium">{q.patientName}</TableCell>
                  <TableCell>{stageBadge(q.stage)}</TableCell>
                  <TableCell>{priorityBadge(q.priority)}</TableCell>
                  <TableCell className="tabular-nums">{q.waitMinutes}m</TableCell>
                  <TableCell>{statusBadge(q.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

