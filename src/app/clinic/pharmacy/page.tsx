"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { clinicPharmacyItems, clinicPrescriptions } from "@/app/clinic/_mock/clinic-data";

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
  const [prescriptions, setPrescriptions] = useState(clinicPrescriptions);
  const [pharmacyItems, setPharmacyItems] = useState(clinicPharmacyItems);

  const lowStock = pharmacyItems.filter((i) => i.stock <= i.reorderLevel).length;
  const expiringSoon = pharmacyItems.filter((i) => daysToExpiry(i.expiryISO) <= 60).length;
  const activePrescriptions = prescriptions.filter((p) => p.status === "Active");

  const handleDispense = (id: string) => {
    const prescription = prescriptions.find((p) => p.id === id);
    if (!prescription) return;

    // Mark prescription as Completed
    setPrescriptions((prev) => prev.map((p) => (p.id === id ? { ...p, status: "Completed" } : p)));

    // Mock decrease stock for prescribed items
    setPharmacyItems((prev) =>
      prev.map((item) => {
        const dispensed = prescription.items.find((pi) => pi.name === item.name);
        return dispensed ? { ...item, stock: Math.max(0, item.stock - 1) } : item;
      })
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pharmacy"
        description="Inventory, prescription dispensing, and monitoring."
        actions={[
          { label: "Dashboard", href: "/clinic/dashboard" },
          { label: "Finance", href: "/clinic/finance", variant: "primary" },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Items</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{pharmacyItems.length}</p>
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
            <p className="text-sm font-medium text-slate-500">Expiring ≤ 60d</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{expiringSoon}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Prescriptions</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{activePrescriptions.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prescription Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Prescriber</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activePrescriptions.length > 0 ? (
                  activePrescriptions.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.patientId}</TableCell>
                      <TableCell>{p.provider}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleDispense(p.id)}>Dispense</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-500">No active prescriptions</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pharmacyItems.map((i) => (
                  <TableRow key={i.sku}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.stock}</TableCell>
                    <TableCell>{stockBadge(i.stock, i.reorderLevel)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

