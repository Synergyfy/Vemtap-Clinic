"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { doctorTodayAppointments } from "@/app/doctor/_mock/doctor-data";
import { 
  Calendar as CalendarIcon, Clock, User, 
  ChevronRight, ChevronLeft, CalendarDays,
  ListFilter, MoreHorizontal
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

function statusBadge(status: string) {
  if (status === "Checked-in") return <Badge className="bg-emerald-600 text-white">Checked-in</Badge>;
  if (status === "Scheduled") return <Badge variant="outline" className="text-slate-500">Scheduled</Badge>;
  if (status === "In-progress") return <Badge className="bg-amber-600 text-white">In progress</Badge>;
  if (status === "Completed") return <Badge className="bg-slate-200 text-slate-700">Completed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function DoctorAppointments() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"list" | "calendar">("calendar");

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Appointments"
        description="View and manage your scheduled consultations and follow-up appointments."
        actions={[
          { label: "Set Availability", href: "/doctor/settings", variant: "outline" },
          { label: "Book Appointment", href: "#", variant: "primary" },
        ]}
      />

      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit mx-auto lg:mx-0">
        <button 
          onClick={() => setView("calendar")}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
            view === "calendar" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <CalendarDays size={18} />
          Calendar View
        </button>
        <button 
          onClick={() => setView("list")}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
            view === "list" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <ListFilter size={18} />
          List View
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {view === "calendar" ? (
            <Card className="border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
              <div className="bg-slate-900 p-8 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-2xl font-black tracking-tight capitalize">
                    {date?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Clinical Schedule</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
                    <ChevronLeft size={20} />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="p-6 w-full max-w-full justify-center flex bg-white"
                  classNames={{
                    months: "w-full",
                    month: "w-full space-y-4",
                    caption: "hidden",
                    table: "w-full border-collapse",
                    head_row: "flex w-full mb-4",
                    head_cell: "text-slate-400 flex-1 font-bold text-[10px] uppercase tracking-widest text-center",
                    row: "flex w-full mt-2",
                    cell: cn(
                      "relative flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-20",
                      "h-14 sm:h-20 border border-slate-50 first:rounded-l-2xl last:rounded-r-2xl overflow-hidden"
                    ),
                    day: cn(
                      "h-full w-full p-2 font-bold transition-all hover:bg-emerald-50/50 flex flex-col items-start justify-start gap-1"
                    ),
                    day_selected: "bg-emerald-50 border-2 border-emerald-600 text-emerald-700",
                    day_today: "bg-slate-50 text-slate-900",
                    day_outside: "opacity-20 pointer-events-none",
                  }}
                  components={{
                    DayButton: ({ day, modifiers, ...props }) => {
                      const hasAppointments = day.date.getDate() === new Date().getDate(); // Simplified check for mock
                      return (
                        <button
                          {...props}
                          className={cn(
                            "h-full w-full p-2 font-bold transition-all flex flex-col items-start justify-start gap-1 group relative",
                            modifiers.selected && "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-600 ring-inset",
                            !modifiers.selected && "hover:bg-slate-50"
                          )}
                        >
                          <span className={cn("text-xs", modifiers.today && "bg-slate-900 text-white w-6 h-6 flex items-center justify-center rounded-full")}>
                            {day.date.getDate()}
                          </span>
                          {hasAppointments && !modifiers.outside && (
                            <div className="mt-auto w-full space-y-1">
                              <div className="h-1.5 w-full bg-emerald-500 rounded-full opacity-40" />
                              <p className="text-[8px] text-emerald-700 font-black uppercase hidden sm:block">3 Appointments</p>
                            </div>
                          )}
                        </button>
                      );
                    }
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarIcon size={20} className="text-emerald-600" />
                  Today, June 18, 2026
                </h3>
                
                <div className="space-y-3">
                  {doctorTodayAppointments.map((a) => (
                    <Card key={a.id} className="hover:border-emerald-200 transition-colors cursor-pointer group">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-600">
                            <span className="text-xs font-bold uppercase tracking-tighter">Time</span>
                            <span className="text-sm font-black tabular-nums">{a.startTime}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{a.patientName}</p>
                            <p className="text-xs text-slate-500">{a.service} • {a.kind}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="hidden sm:block text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            {statusBadge(a.status)}
                          </div>
                          <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Context */}
        <aside className="space-y-6">
          <Card className="border-emerald-100 bg-emerald-50/20 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-900">
                <Clock size={16} />
                Selected Day Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-emerald-100/50 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selected Date</p>
                <p className="text-lg font-black text-emerald-900">
                  {date?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Morning Sessions (3)</p>
                {doctorTodayAppointments.slice(0, 2).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-slate-100 group hover:border-emerald-200 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {a.startTime}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{a.patientName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{a.service}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all mt-4">
                View Full Daily Agenda
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-bold">Schedule Health</CardTitle>
              <MoreHorizontal size={16} className="text-slate-400" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-tighter">Slots Filled</span>
                  <span className="text-slate-900">85%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-tighter">Avg. Punctuality</span>
                  <span className="text-slate-900">92%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: "92%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
