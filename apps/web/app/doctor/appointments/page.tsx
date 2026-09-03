"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Modal } from "@/components/ui/modal";
import { 
  Calendar as CalendarIcon, Clock, User, 
  ChevronRight, ChevronLeft, CalendarDays,
  ListFilter, MoreHorizontal, X, CheckCircle2,
  Phone, FileText, AlertCircle
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAppointments, useCreateAppointment, useUpdateAppointment, useTodayAppointments, Appointment, AppointmentQueryParams } from "@/hooks/useAppointments";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

function statusBadge(status: string) {
  if (status === "in_progress") return <Badge className="bg-emerald-600 text-white">In Progress</Badge>;
  if (status === "scheduled") return <Badge variant="outline" className="text-slate-500">Scheduled</Badge>;
  if (status === "confirmed") return <Badge className="bg-sky-100 text-sky-700">Confirmed</Badge>;
  if (status === "completed") return <Badge className="bg-slate-200 text-slate-700">Completed</Badge>;
  if (status === "cancelled") return <Badge className="bg-rose-600 text-white">Cancelled</Badge>;
  if (status === "no_show") return <Badge className="bg-rose-600 text-white">No Show</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatMonthYear(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<"list" | "calendar">("calendar");

  const queryParams: AppointmentQueryParams = {
    clinicId: user?.clinicId,
    staffId: user?.userId,
    page: 1,
    limit: 100,
    sortBy: "appointmentDate",
    sortOrder: "ASC",
  };

  const { 
    data: appointmentsResponse, 
    isLoading: isAppointmentsLoading, 
    refetch: refetchAppointments 
  } = useAppointments(queryParams);

  const { data: todayResponse } = useTodayAppointments(user?.clinicId || null);

  const updateAppointmentMutation = useUpdateAppointment();

  const appointments = appointmentsResponse?.data || [];
  const todayAppointments = todayResponse?.appointments || [];

  // Modal states
  const [bookOpen, setBookOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Book Appointment form state
  const [bookForm, setBookForm] = useState({ 
    patientName: "", 
    patientId: "", 
    dateISO: new Date().toISOString().split('T')[0], 
    startTime: "09:00", 
    service: "Consultation", 
    kind: "consultation", 
    reason: "" 
  });

  const handleBookAppointment = async () => {
    if (!bookForm.patientName || !bookForm.patientId || !bookForm.dateISO || !bookForm.startTime || !user) return;
    try {
      await createAppointmentMutation.mutateAsync({
        appointmentDate: bookForm.dateISO,
        appointmentTime: bookForm.startTime,
        type: bookForm.kind as any,
        reason: bookForm.reason,
        patientId: bookForm.patientId,
        branchId: user.clinicId,
        clinicId: user.clinicId,
      });
      toast.success(`Appointment booked for ${bookForm.patientName} on ${bookForm.dateISO} at ${bookForm.startTime}`);
      setBookOpen(false);
      setBookForm({ patientName: "", patientId: "", dateISO: new Date().toISOString().split('T')[0], startTime: "09:00", service: "Consultation", kind: "consultation", reason: "" });
      refetchAppointments();
    } catch (error) {
      toast.error("Failed to book appointment");
      console.error("Book appointment error:", error);
    }
  };

  const createAppointmentMutation = useCreateAppointment();

  const openDetail = (appt: Appointment) => {
    setSelectedAppt(appt);
    setDetailOpen(true);
  };

  const handleStartSession = async () => {
    if (!selectedAppt) return;
    try {
      await updateAppointmentMutation.mutateAsync({
        id: selectedAppt.id,
        data: { status: "in_progress" },
      });
      toast.success(`Session started with ${selectedAppt.patient?.firstName ? `${selectedAppt.patient.firstName} ${selectedAppt.patient.lastName}` : "patient"}`);
      setDetailOpen(false);
      refetchAppointments();
    } catch (error) {
      toast.error("Failed to start session");
      console.error("Start session error:", error);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppt) return;
    setDetailOpen(false);
    toast.info(`Reschedule functionality - appointment ID: ${selectedAppt.id}`);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppt) return;
    try {
      await updateAppointmentMutation.mutateAsync({
        id: selectedAppt.id,
        data: { status: "cancelled" },
      });
      toast.success("Appointment cancelled");
      setDetailOpen(false);
      setConfirmOpen(false);
      refetchAppointments();
    } catch (error) {
      toast.error("Failed to cancel appointment");
      console.error("Cancel error:", error);
    }
  };

  const handleCalendarDayClick = (day: Date) => {
    setDate(day);
    setDayModalOpen(true);
  };

  const selectedDayAppointments = useMemo(() => {
    if (!date) return [];
    const dayISO = date.toISOString().split("T")[0];
    return appointments.filter(a => a.appointmentDate.split("T")[0] === dayISO);
  }, [appointments, date]);

  return (
    <div className="space-y-4 sm:space-y-8">

      <PageHeader
        title="My Appointments"
        description="View and manage your scheduled consultations and follow-up appointments."
        actions={[
          { label: "Set Availability", href: "/doctor/settings", variant: "outline" },
          { label: "Book Appointment", onClick: () => setBookOpen(true), variant: "default" },
        ]}
      />

      <div className="flex items-center justify-between bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-fit mx-auto lg:mx-0">
        <button 
          onClick={() => setView("calendar")}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            view === "calendar" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <CalendarDays size={16} />
          <span className="hidden xs:inline">Calendar</span> View
        </button>
        <button 
          onClick={() => setView("list")}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            view === "list" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <ListFilter size={16} />
          <span className="hidden xs:inline">List</span> View
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {view === "calendar" ? (
            <Card className="border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
              <div className="bg-slate-900 p-4 sm:p-8 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-2xl font-black tracking-tight capitalize">
                    {formatMonthYear(date)}
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
                  onSelect={(d) => d && handleCalendarDayClick(d)}
                  className="p-6 w-full max-w-full justify-center flex bg-white"
                  classNames={{
                    months: "w-full",
                    month: "w-full space-y-4",
                    day: cn(
                      "h-full w-full p-2 font-bold transition-all hover:bg-emerald-50/50 flex flex-col items-start justify-start gap-1"
                    ),
                  }}
                  components={{
                    DayButton: ({ day, modifiers, ...props }) => {
                      const dayISO = day.date.toISOString().split("T")[0];
                      const hasAppointments = appointments.some(a => a.appointmentDate.split("T")[0] === dayISO);
                      const dayAppointments = appointments.filter(a => a.appointmentDate.split("T")[0] === dayISO);
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
                              <p className="text-[8px] text-emerald-700 font-black uppercase hidden sm:block">{dayAppointments.length} Appts</p>
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
                  Today, {formatDate(new Date())}
                </h3>
                
                <div className="space-y-3">
                  {todayAppointments.map((a) => (
                    <Card key={a.id} className="hover:border-emerald-200 transition-colors cursor-pointer group" onClick={() => openDetail(a)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-600">
                            <span className="text-[8px] font-bold uppercase tracking-tighter">Time</span>
                            <span className="text-sm font-black tabular-nums">{a.appointmentTime || "TBD"}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {a.patient?.firstName ? `${a.patient.firstName} ${a.patient.lastName}` : "Unknown Patient"}
                            </p>
                            <p className="text-xs text-slate-500">{a.reason || a.type} • {a.staff?.firstName ? `${a.staff.firstName} ${a.staff.lastName}` : "TBD"}</p>
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
                  {formatDate(date)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Appointments ({selectedDayAppointments.length})</p>
                {selectedDayAppointments.slice(0, 2).map((a) => (
                  <div key={a.id} onClick={() => openDetail(a)} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-slate-100 group hover:border-emerald-200 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {a.appointmentTime || "TBD"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {a.patient?.firstName ? `${a.patient.firstName} ${a.patient.lastName}` : "Unknown Patient"}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{a.reason || a.type}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setAgendaOpen(true)} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all mt-4">
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
                  <span className="text-slate-900">
                    {appointments.length > 0 ? Math.round((appointments.filter(a => a.status !== "cancelled").length / appointments.length) * 100) : 0}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${appointments.length > 0 ? Math.round((appointments.filter(a => a.status !== "cancelled").length / appointments.length) * 100) : 0}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-widest">Avg. Punctuality</span>
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

      {/* ===== MODALS ===== */}

      {/* 1. Book Appointment Modal */}
      <Modal isOpen={bookOpen} onClose={() => setBookOpen(false)} title="Book New Appointment">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name *</label>
              <input value={bookForm.patientName} onChange={e => setBookForm(p => ({ ...p, patientName: e.target.value }))} placeholder="e.g. Fatima Yusuf" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient ID *</label>
              <input value={bookForm.patientId} onChange={e => setBookForm(p => ({ ...p, patientId: e.target.value }))} placeholder="e.g. PT-2024-001" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date *</label>
              <input type="date" value={bookForm.dateISO} onChange={e => setBookForm(p => ({ ...p, dateISO: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time *</label>
              <input type="time" value={bookForm.startTime} onChange={e => setBookForm(p => ({ ...p, startTime: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
              <select value={bookForm.kind} onChange={e => setBookForm(p => ({ ...p, kind: e.target.value, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white">
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="emergency">Walk-in</option>
                <option value="eye_test">Eye Test</option>
                <option value="surgery">Surgery</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</label>
              <select value={bookForm.service} onChange={e => setBookForm(p => ({ ...p, service: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white">
                <option>Consultation</option>
                <option>Follow-up</option>
                <option>Eye Test</option>
                <option>Surgery Review</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Notes</label>
            <textarea value={bookForm.reason} onChange={e => setBookForm(p => ({ ...p, reason: e.target.value }))} rows={3} placeholder="Optional notes about the appointment..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setBookOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleBookAppointment} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">Book Appointment</button>
          </div>
        </div>
      </Modal>

      {/* 2. Appointment Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Appointment Details">
        {selectedAppt && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm">
                {selectedAppt.patient?.firstName ? `${selectedAppt.patient.firstName[0]}${selectedAppt.patient.lastName?.[0] || ""}` : "?"}
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {selectedAppt.patient?.firstName ? `${selectedAppt.patient.firstName} ${selectedAppt.patient.lastName}` : "Unknown Patient"}
                </p>
                <p className="text-xs text-slate-500">ID: {selectedAppt.patientId} • {selectedAppt.type}</p>
              </div>
              <div className="ml-auto">{statusBadge(selectedAppt.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                <p className="text-sm font-bold text-slate-900">{selectedAppt.appointmentDate.split("T")[0]}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                <p className="text-sm font-bold text-slate-900">{selectedAppt.appointmentTime || "TBD"}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service</p>
                <p className="text-sm font-bold text-slate-900">{selectedAppt.reason || selectedAppt.type}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Provider</p>
                <p className="text-sm font-bold text-slate-900">{selectedAppt.staff?.firstName ? `${selectedAppt.staff.firstName} ${selectedAppt.staff.lastName}` : "TBD"}</p>
              </div>
            </div>

            {selectedAppt.notes && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Reason for Visit</p>
                <p className="text-sm font-bold text-amber-900">{selectedAppt.notes}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              {selectedAppt.status === "in_progress" && (
                <button onClick={handleStartSession} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                  Session in Progress
                </button>
              )}
              {selectedAppt.status === "scheduled" && (
                <button onClick={handleStartSession} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all">
                  Start Session
                </button>
              )}
              <button onClick={handleReschedule} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-all">
                Reschedule
              </button>
              <button onClick={() => { setDetailOpen(false); setConfirmOpen(true); }} className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 3. Cancel Confirmation Modal */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Cancel Appointment">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <AlertCircle size={20} className="text-rose-600 shrink-0" />
            <p className="text-sm font-bold text-rose-800">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
          </div>
          {selectedAppt && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm font-bold text-slate-900">
                {selectedAppt.patient?.firstName ? `${selectedAppt.patient.firstName} ${selectedAppt.patient.lastName}` : "Unknown Patient"}
              </p>
              <p className="text-xs text-slate-500">{selectedAppt.appointmentDate.split("T")[0]} at {selectedAppt.appointmentTime || "TBD"}</p>
            </div>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button onClick={() => setConfirmOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">Keep Appointment</button>
            <button onClick={handleCancelAppointment} className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all">Yes, Cancel</button>
          </div>
        </div>
      </Modal>

      {/* 4. Full Day Agenda Modal */}
      <Modal isOpen={agendaOpen} onClose={() => setAgendaOpen(false)} title="Full Daily Agenda">
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-bold">
            {formatDate(date)} — {selectedDayAppointments.length} appointments
          </p>
          {selectedDayAppointments.map((a) => (
            <div key={a.id} onClick={() => { setAgendaOpen(false); openDetail(a); }} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer group">
              <div className="w-14 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">{a.appointmentTime || "TBD"}</p>
                <p className="text-[10px] text-slate-300">{a.appointmentTime || "TBD"}</p>
              </div>
              <div className="w-px h-8 bg-slate-200 group-hover:bg-emerald-300" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {a.patient?.firstName ? `${a.patient.firstName} ${a.patient.lastName}` : "Unknown Patient"}
                </p>
                <p className="text-[10px] text-slate-500">{a.reason || a.type} • {a.staff?.firstName ? `${a.staff.firstName} ${a.staff.lastName}` : "TBD"}</p>
              </div>
              {statusBadge(a.status)}
              <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500" />
            </div>
          ))}
          <button className="w-full py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all mt-4" onClick={() => { setAgendaOpen(false); setBookOpen(true); }}>
            + Book New Appointment
          </button>
        </div>
      </Modal>

      {/* 5. Day Appointments Modal (Calendar day click) */}
      <Modal isOpen={dayModalOpen} onClose={() => setDayModalOpen(false)} title="Day Appointments">
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-bold">
            {formatDate(date)}
          </p>
          {selectedDayAppointments.map((a) => (
            <div key={a.id} onClick={() => { setDayModalOpen(false); openDetail(a); }} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-emerald-50 transition-colors cursor-pointer group">
              <div className="w-14 text-center">
                <p className="text-sm font-black text-slate-900">{a.appointmentTime || "TBD"}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {a.patient?.firstName ? `${a.patient.firstName} ${a.patient.lastName}` : "Unknown Patient"}
                </p>
                <p className="text-[10px] text-slate-500">{a.reason || a.type}</p>
              </div>
              {statusBadge(a.status)}
            </div>
          ))}
          <button onClick={() => { setDayModalOpen(false); setBookOpen(true); }} className="w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-black uppercase tracking-widest hover:border-emerald-300 hover:text-emerald-600 transition-all mt-2">
            + Add Appointment
          </button>
        </div>
      </Modal>
    </div>
  );
}
