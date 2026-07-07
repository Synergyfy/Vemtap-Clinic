import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { clinicPatients } from "@/app/clinic/_mock/clinic-data";
import { Search, UserCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function DoctorPatients() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="My Patients"
        description="Access and manage patient medical records, history, and consultation data."
      />

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl group focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search size={18} className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or phone number..." 
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[80px]">Avatar</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Patient ID</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicPatients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <UserCircle size={24} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.sex} • {p.age} yrs</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-mono">{p.id}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 tabular-nums">
                    {p.lastVisitISO}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "text-[10px] uppercase font-bold",
                      p.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {p.status}
                    </Badge>
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
        </CardContent>
      </Card>
    </div>
  );
}

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");
