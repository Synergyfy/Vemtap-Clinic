"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { clinicInvoicesToday, formatNGN } from "@/app/clinic/_mock/clinic-data";
import { useModals } from "@/lib/modal-context";

function statusBadge(status: string) {
  if (status === "Paid") return <Badge className="bg-emerald-600 text-white">Paid</Badge>;
  if (status === "Pending") return <Badge className="bg-amber-600 text-white">Pending</Badge>;
  return <Badge variant="secondary">Voided</Badge>;
}

export default function FinancePage() {
  const { openModal } = useModals();
  const paid = clinicInvoicesToday.filter((i) => i.status === "Paid");
  const pending = clinicInvoicesToday.filter((i) => i.status === "Pending");
  const paidTotal = paid.reduce((acc, i) => acc + i.amount, 0);
  const pendingTotal = pending.reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Finance"
        description="Comprehensive revenue tracking, invoices, and payment management."
        actions={[
          { label: "Create Invoice", onClick: () => openModal("invoice"), variant: "primary" },
          { label: "Receive Payment", onClick: () => openModal("transaction") },
          { label: "Export Reports", href: "#" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Paid (today)</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{formatNGN(paidTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">{formatNGN(pendingTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Paid invoices</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{paid.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Pending invoices</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{pending.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Invoices</CardTitle>
          <Button variant="outline" size="sm">Filter/Search</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicInvoicesToday.map((i) => (
                <TableRow key={i.id} onClick={() => openModal("invoice")} className="cursor-pointer hover:bg-slate-50">
                  <TableCell className="font-medium">{i.id}</TableCell>
                  <TableCell>{i.patientName}</TableCell>
                  <TableCell className="tabular-nums">{formatNGN(i.amount)}</TableCell>
                  <TableCell>{i.method}</TableCell>
                  <TableCell>{statusBadge(i.status)}</TableCell>
                  <TableCell className="tabular-nums">{i.createdISO.replace("T", " ").slice(0, 16)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

