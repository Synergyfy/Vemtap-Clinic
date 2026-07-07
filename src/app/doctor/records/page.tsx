import React from "react";
import Link from "next/link";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, ClipboardList, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DoctorRecords() {
  const recentRecords = [
    { patient: "Fatima Yusuf", id: "P-003", type: "Consultation", date: "June 18, 2026", status: "Open" },
    { patient: "Adesuwa Okoro", id: "P-001", type: "Eye Test", date: "June 17, 2026", status: "Closed" },
    { patient: "Chidi Okafor", id: "P-002", type: "Refraction", date: "June 17, 2026", status: "Closed" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Medical Records"
        description="Comprehensive repository of all patient encounters, clinical results, and prescriptions."
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search size={20} className="text-slate-400" />
          <input type="text" placeholder="Search records by patient name, ID, or clinical date..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700" />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Encounters</h3>
        {recentRecords.map((r, i) => (
          <Link key={i} href={`/doctor/records/${r.id}`} className="block">
            <Card className="hover:border-emerald-200 transition-all cursor-pointer group shadow-sm hover:shadow-md">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    {r.type === "Consultation" ? <FileText size={20} /> : <Eye size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{r.patient}</p>
                    <p className="text-xs text-slate-500">{r.type} • {r.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={r.status === "Open" ? "default" : "outline"} className={r.status === "Open" ? "bg-emerald-600" : ""}>
                    {r.status}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">{r.id}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
