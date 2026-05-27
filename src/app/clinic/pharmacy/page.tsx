import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { clinicPharmacyItems } from "@/app/clinic/_mock/clinic-data";

function stockBadge(stock: number, reorderLevel: number) {
  if (stock <= reorderLevel) return <Badge className="bg-rose-600 text-white">Low</Badge>;
  if (stock <= reorderLevel * 2) return <Badge className="bg-amber-600 text-white">Watch</Badge>;
  return <Badge className="bg-emerald-600 text-white">OK</Badge>;
}

function daysToExpiry(iso: string) {
  const expiry = new Date(iso);
  const today = new Date();
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PharmacyPage() {
  const lowStock = clinicPharmacyItems.filter((i) => i.stock <= i.reorderLevel).length;
  const expiringSoon = clinicPharmacyItems.filter((i) => daysToExpiry(i.expiryISO) <= 60).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pharmacy"
        description="Inventory overview with reorder and expiry monitoring."
        actions={[
          { label: "Dashboard", href: "/clinic/dashboard" },
          { label: "Finance", href: "/clinic/finance", variant: "primary" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Items</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{clinicPharmacyItems.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Low stock</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{lowStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Expiring ≤ 60 days</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{expiringSoon}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Inventory</CardTitle>
          <p className="text-sm text-slate-500">Track stock, expiry, and storage</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Reorder</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicPharmacyItems.map((i) => (
                <TableRow key={i.sku}>
                  <TableCell className="font-medium">{i.sku}</TableCell>
                  <TableCell>{i.name}</TableCell>
                  <TableCell>{i.location}</TableCell>
                  <TableCell className="tabular-nums">{i.stock}</TableCell>
                  <TableCell className="tabular-nums">{i.reorderLevel}</TableCell>
                  <TableCell className="tabular-nums">{i.expiryISO}</TableCell>
                  <TableCell>{stockBadge(i.stock, i.reorderLevel)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

