import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { clinicSupportTickets } from "@/app/clinic/_mock/clinic-data";

function statusBadge(status: string) {
  if (status === "Resolved") return <Badge className="bg-emerald-600 text-white">Resolved</Badge>;
  if (status === "Awaiting user") return <Badge className="bg-amber-600 text-white">Awaiting user</Badge>;
  return <Badge className="bg-sky-600 text-white">Open</Badge>;
}

function priorityBadge(priority: string) {
  if (priority === "High") return <Badge className="bg-rose-600 text-white">High</Badge>;
  if (priority === "Medium") return <Badge className="bg-amber-600 text-white">Medium</Badge>;
  return <Badge variant="outline">Low</Badge>;
}

export default function SupportPage() {
  const open = clinicSupportTickets.filter((t) => t.status === "Open").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Support"
        description="Help desk queue: issues, priority, and resolution tracking."
        actions={[{ label: "Dashboard", href: "/clinic/dashboard", variant: "primary" }]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Tickets</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{clinicSupportTickets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Open</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{open}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Resolved</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {clinicSupportTickets.filter((t) => t.status === "Resolved").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Tickets</CardTitle>
          <p className="text-sm text-slate-500">Prioritize high-impact operational issues first</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicSupportTickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.id}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell>{priorityBadge(t.priority)}</TableCell>
                  <TableCell>{statusBadge(t.status)}</TableCell>
                  <TableCell className="tabular-nums">{t.updatedISO.replace("T", " ").slice(0, 16)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

