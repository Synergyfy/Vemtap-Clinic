"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Calendar, Save, AlertCircle, 
  ChevronRight, ToggleLeft as Toggle, ArrowLeft,
  Coffee, Stethoscope, Ban
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DoctorAvailability() {
  const router = useRouter();
  const [isOnDuty, setIsOnDuty] = useState(true);
  
  const [schedule, setSchedule] = useState({
    Monday: { active: true, start: "09:00", end: "17:00", break: "13:00 - 14:00" },
    Tuesday: { active: true, start: "09:00", end: "17:00", break: "13:00 - 14:00" },
    Wednesday: { active: true, start: "09:00", end: "13:00", break: "None" },
    Thursday: { active: true, start: "09:00", end: "17:00", break: "13:00 - 14:00" },
    Friday: { active: true, start: "09:00", end: "17:00", break: "13:00 - 14:00" },
    Saturday: { active: false, start: "10:00", end: "14:00", break: "None" },
    Sunday: { active: false, start: "00:00", end: "00:00", break: "None" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8 pb-20">
      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <PageHeader
          title="Availability Settings"
          description="Manage your consultation hours, breaks, and on-duty status for the clinic."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Weekly Schedule Builder */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[2rem] border-slate-200 shadow-xl shadow-slate-100/50">
            <CardHeader className="p-4 sm:p-8 border-b border-slate-50 flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-xl font-black text-slate-900">Weekly Consultation Hours</CardTitle>
                <p className="text-[10px] sm:text-sm font-bold text-slate-400 mt-1">Set your standard recurring weekly schedule</p>
              </div>
              <button className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Save Schedule</span> Save
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {days.map((day) => {
                  const config = schedule[day as keyof typeof schedule];
                  return (
                    <div key={day} className={cn(
                      "p-3 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 transition-colors",
                      !config.active && "bg-slate-50/50"
                    )}>
                      <div className="flex items-center gap-3 sm:gap-6 flex-1">
                        <div className="w-20 sm:w-32">
                          <p className="font-black text-slate-900 text-sm sm:text-base">{day}</p>
                          <Badge className={cn(
                            "mt-1 text-[8px] sm:text-[10px] uppercase font-black tracking-tighter",
                            config.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                          )}>
                            {config.active ? "Working" : "Day Off"}
                          </Badge>
                        </div>
                        
                        {config.active ? (
                          <div className="flex items-center gap-4 sm:gap-8 flex-1">
                            <div className="space-y-0.5 sm:space-y-1">
                              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift</p>
                              <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-[10px] sm:text-xs font-bold text-slate-700">{config.start}</span>
                                <span className="text-slate-300">—</span>
                                <span className="text-[10px] sm:text-xs font-bold text-slate-700">{config.end}</span>
                              </div>
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Break</p>
                              <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] sm:text-xs">
                                <Coffee size={12} className="sm:w-[14px] sm:h-[14px]" />
                                {config.break}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm font-bold text-slate-400 italic">No slots available</p>
                        )}
                      </div>
                      
                      <button className="text-[10px] sm:text-xs font-black uppercase text-emerald-700 hover:underline self-end sm:self-auto">
                        Edit Day
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Real-time Status */}
        <aside className="space-y-6">
          <Card className={cn(
            "rounded-[2rem] border-none transition-all duration-500 shadow-2xl",
            isOnDuty ? "bg-emerald-600 shadow-emerald-200/50" : "bg-slate-900 shadow-slate-900/50"
          )}>
            <CardContent className="p-8 text-white">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                  {isOnDuty ? <Stethoscope size={28} /> : <Ban size={28} />}
                </div>
                <button 
                  onClick={() => setIsOnDuty(!isOnDuty)}
                  className={cn(
                    "w-14 h-8 rounded-full relative transition-colors duration-300",
                    isOnDuty ? "bg-emerald-400" : "bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300",
                    isOnDuty ? "left-7 shadow-lg" : "left-1"
                  )} />
                </button>
              </div>
              
              <h3 className="text-2xl font-black mb-2">
                {isOnDuty ? "Currently On-Duty" : "Currently Away"}
              </h3>
              <p className="text-white/60 text-sm font-bold leading-relaxed">
                {isOnDuty 
                  ? "You are visible to the reception and patients for booking. Active in the consultation queue."
                  : "You are hidden from the booking engine. Patients will see you as unavailable for immediate sessions."}
              </p>
              
              <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Next Shift</p>
                  <p className="font-bold">Tomorrow, 09:00 AM</p>
                </div>
                <ChevronRight size={20} className="text-white/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-slate-200 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Emergency Leaves</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-white text-rose-600 shadow-sm border border-rose-100">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-900">Mark as Unavailable</p>
                  <p className="text-[10px] font-bold text-rose-700 mt-0.5 leading-relaxed">Instantly block out your schedule for the next 24 hours.</p>
                </div>
              </div>
              <button className="w-full py-3 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                Request Time Off
              </button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
