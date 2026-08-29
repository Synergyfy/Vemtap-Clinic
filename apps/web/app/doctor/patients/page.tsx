"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/lib/auth-context";
import { Search, UserCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function DoctorPatients() {
  const { user } = useAuth();
  const { data: response, isLoading } = usePatients({ clinicId: user?.clinicId });
  const patients = response?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm font-medium">Loading patients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <PageHeader
        title="My Patients"
        description="Access and manage patient medical records, history, and consultation data."
      />

      <div className="flex items-center gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center gap-3 px-3 sm:px-4 py-2 bg-slate-50 rounded-xl group focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search size={18} className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input
            type="text"
            placeholder="Search patients..."
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="md:hidden divide-y divide-slate-100">
            {patients.map((p) => (
              <div key={p.id} className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <UserCircle size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">{p.firstName} {p.lastName}</p>
                      <p className="text-[10px] text-slate-500">{p.gender} • {calculateAge(p.dateOfBirth)} yrs • {p.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 capitalize">{p.patientType}</span>
                  <Link href={`/doctor/workspace/${p.id}`} className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800">View Records</Link>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserCircle size={24} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-slate-900">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-slate-500">{p.gender} • {p.phone}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-mono">{p.id.slice(0, 8)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {calculateAge(p.dateOfBirth)} yrs / {p.gender}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700">{p.patientType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/doctor/workspace/${p.id}`}
                        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        View Records
                        <ExternalLink size={14} />
                      </Link>
                    </TableCell>
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
