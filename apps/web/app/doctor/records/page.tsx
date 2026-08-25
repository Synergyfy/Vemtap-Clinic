import React from "react";
import Link from "next/link";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, ClipboardList, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DoctorRecords() {
  const recentRecords = [
    { patient: "Fatima Yusuf", id: "P-003", type: "Consultation", date: "June 18, 2026", status: "Open" },
    { patient: "Adesuwa Okoro", id: "P-001", type: "Eye Test", date: "June 17, 2026", status: "Closed" },
    { patient: "Chidi Okafor", id: "P-002", type: "Refraction", date: "June 17, 2026", status: "Closed" },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      <PageHeader
        title="Medical Records"
        description="Comprehensive repository of all patient encounters, clinical results, and prescriptions."
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
          <Search size={18} className="text-slate-400 sm:w-5 sm:h-5" />
          <input type="text" placeholder="Search records..." className="bg-transparent border-none outline-none text-sm w-full text-slate-700" />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50">
          <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
          Filters
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Encounters</h3>
        {recentRecords.map((r, i) => (
          <Link key={i} href={`/doctor/records/${r.id}`} className="block">
            <Card className="hover:border-emerald-200 transition-all cursor-pointer group shadow-sm hover:shadow-md">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0">
                    {r.type === "Consultation" ? <FileText size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{r.patient}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">{r.type} • {r.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <Badge variant={r.status === "Open" ? "default" : "outline"} className={cn("text-[10px]", r.status === "Open" ? "bg-emerald-600" : "")}>
                    {r.status}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono hidden sm:inline-flex">{r.id}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
