import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { clinicOpticalOrders } from "@/app/clinic/_mock/clinic-data";

function statusBadge(status: string) {
  if (status === "Ready") return <Badge className="bg-emerald-600 text-white">Ready</Badge>;
  if (status === "In production") return <Badge className="bg-amber-600 text-white">In production</Badge>;
  if (status === "Dispensed") return <Badge variant="secondary">Dispensed</Badge>;
  return <Badge variant="outline">Draft</Badge>;
}

export default function OpticalPage() {
  const ready = clinicOpticalOrders.filter((o) => o.status === "Ready").length;
  const inProduction = clinicOpticalOrders.filter((o) => o.status === "In production").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Optical Orders"
        description="Lens orders, production status, and pickup readiness."
        actions={[
          { label: "Dashboard", href: "/clinic/dashboard" },
          { label: "Pharmacy", href: "/clinic/pharmacy", variant: "primary" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Open orders</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {clinicOpticalOrders.filter((o) => o.status !== "Dispensed").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">In production</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{inProduction}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Ready for pickup</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{ready}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Orders</CardTitle>
          <p className="text-sm text-slate-500">Showing {clinicOpticalOrders.length} order(s)</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Lens</TableHead>
                <TableHead>Frame</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicOpticalOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.id}</TableCell>
                  <TableCell>{o.patientName}</TableCell>
                  <TableCell>{o.lens}</TableCell>
                  <TableCell>{o.frame}</TableCell>
                  <TableCell className="tabular-nums">{o.dueISO}</TableCell>
                  <TableCell>{statusBadge(o.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

