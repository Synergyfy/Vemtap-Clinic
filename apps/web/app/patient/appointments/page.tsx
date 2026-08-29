"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, XCircle, X, ChevronRight, User } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientAppointmentsList, useBookAppointment, useRescheduleAppointment, useCancelAppointment, PatientAppointment } from "@/hooks/usePatientPortal";
import { useAuth } from "@/lib/auth-context";

const APPOINTMENT_TYPES = [
  { value: "consultation", label: "Comprehensive Eye Exam" },
  { value: "follow_up", label: "Follow-up Consultation" },
  { value: "eye_test", label: "Pediatric Eye Test" },
];

const BRANCHES = [
  { id: "branch-1", name: "Main Branch (VI)" },
  { id: "branch-2", name: "Ikeja GRA" },
  { id: "branch-3", name: "Lekki Phase 1" },
];

const TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

function getStaffName(staff?: { firstName: string; lastName: string }): string {
  if (!staff) return "Any Available Doctor";
  return `Dr. ${staff.firstName} ${staff.lastName}`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "scheduled":
    case "confirmed":
      return <span className="bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-teal-100 animate-pulse">Upcoming</span>;
    case "completed":
      return <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Done</span>;
    case "cancelled":
      return <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-100">Cancelled</span>;
    case "no_show":
      return <span className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-orange-100">No Show</span>;
    default:
      return <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{status}</span>;
  }
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { data: appointments = [], isLoading } = usePatientAppointmentsList();
  const bookAppointment = useBookAppointment();
  const rescheduleAppointment = useRescheduleAppointment();
  const cancelAppointment = useCancelAppointment();

  const [isBookModalOpen, setBookModalOpen] = useState(false);
  const [isRescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);

  const [bookType, setBookType] = useState("consultation");
  const [bookBranch, setBookBranch] = useState(BRANCHES[0].id);
  const [bookDate, setBookDate] = useState<Date>();
  const [bookTime, setBookTime] = useState("09:00");

  const [rescheduleDate, setRescheduleDate] = useState<Date>();
  const [rescheduleTime, setRescheduleTime] = useState("");

  const isUpcoming = (appt: PatientAppointment) =>
    appt.status === "scheduled" || appt.status === "confirmed";

  const handleBook = () => {
    if (!bookDate) return;
    bookAppointment.mutate(
      {
        appointmentDate: format(bookDate, "yyyy-MM-dd"),
        appointmentTime: bookTime,
        type: bookType,
        branchId: bookBranch,
      },
      { onSuccess: () => setBookModalOpen(false) }
    );
  };

  const handleReschedule = () => {
    if (!selectedApptId || !rescheduleDate || !rescheduleTime) return;
    rescheduleAppointment.mutate(
      { id: selectedApptId, appointmentDate: format(rescheduleDate, "yyyy-MM-dd"), appointmentTime: rescheduleTime },
      { onSuccess: () => setRescheduleModalOpen(false) }
    );
  };

  const handleCancel = () => {
    if (!selectedApptId) return;
    cancelAppointment.mutate(selectedApptId, {
      onSuccess: () => setCancelModalOpen(false),
    });
  };

  return (
    <div className="space-y-6 relative pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your past and upcoming visits.</p>
        </div>
        <button
          onClick={() => setBookModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-600/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          Book Appointment
        </button>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt, idx) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className={`bg-white rounded-[2rem] p-6 shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                appt.status === "cancelled" ? "border-red-50 opacity-70" : "border-gray-100 hover:border-teal-100 transition-colors"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className={`font-black text-xl tracking-tight ${appt.status === "cancelled" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                    {APPOINTMENT_TYPES.find((t) => t.value === appt.type)?.label || appt.type}
                  </h3>
                  {getStatusBadge(appt.status)}
                </div>

                <div className="flex items-center gap-2 mb-6 text-gray-700 font-bold">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-600" />
                  </div>
                  <p>{getStaffName(appt.staff)}</p>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-600">{appt.appointmentDate}</span>
                  </div>
                  {appt.appointmentTime && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">{appt.appointmentTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {isUpcoming(appt) && (
                <div className="flex flex-row md:flex-col gap-3 md:min-w-[160px] border-t border-gray-100 pt-6 md:border-t-0 md:pt-0">
                  <button
                    onClick={() => { setSelectedApptId(appt.id); setRescheduleModalOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl text-sm font-bold transition-all border border-gray-200 shadow-sm"
                  >
                    <Clock className="w-4 h-4" /> Reschedule
                  </button>
                  <button
                    onClick={() => { setSelectedApptId(appt.id); setCancelModalOpen(true); }}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 text-red-600 hover:bg-red-50 rounded-2xl text-sm font-bold transition-all border border-transparent hover:border-red-100"
                  >
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          {appointments.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No appointments found.</p>
              <p className="text-gray-400 text-sm mt-1">Book your first eye checkup above.</p>
            </div>
          )}
        </div>
      )}

      {/* Book Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setBookModalOpen(false)} />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl overflow-visible">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Book Appointment</h2>
                  <p className="text-sm text-gray-500 font-medium">Select your preferred date and time</p>
                </div>
                <button onClick={() => setBookModalOpen(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"><X className="w-6 h-6 text-gray-600" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Appointment Type</label>
                    <Select value={bookType} onValueChange={setBookType}>
                      <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 border-gray-200 focus:ring-teal-500 font-bold">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                        {APPOINTMENT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Clinic Branch</label>
                    <Select value={bookBranch} onValueChange={setBookBranch}>
                      <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 border-gray-200 focus:ring-teal-500 font-bold">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                        {BRANCHES.map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pick Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={`w-full flex items-center justify-between border border-gray-200 rounded-2xl px-4 h-14 bg-gray-50 hover:bg-gray-100 transition-all focus:ring-2 focus:ring-teal-500 outline-none font-bold ${!bookDate ? "text-gray-400" : "text-gray-900"}`}>
                          {bookDate ? format(bookDate, "PPP") : <span>Select Date</span>}
                          <Calendar className="w-5 h-5 opacity-40" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[110] rounded-3xl border-gray-100 shadow-2xl" align="start">
                        <CalendarUI mode="single" selected={bookDate} onSelect={setBookDate} initialFocus disabled={(date) => date < new Date()} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Available Time</label>
                    <div className="grid grid-cols-2 gap-2 max-h-[135px] overflow-y-auto pr-1 custom-scrollbar">
                      {TIME_SLOTS.map((time) => (
                        <button key={time} onClick={() => setBookTime(time)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            bookTime === time ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20" : "bg-white border-gray-200 text-gray-600 hover:border-teal-200"
                          }`}>
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-gray-100 flex gap-4">
                <button onClick={() => setBookModalOpen(false)} className="flex-1 px-6 py-4 rounded-[1.5rem] bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-colors">Cancel</button>
                <button onClick={handleBook} disabled={bookAppointment.isPending}
                  className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-teal-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
                  {bookAppointment.isPending ? "Booking..." : <><span>Confirm Appointment</span><ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reschedule Modal */}
        {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setRescheduleModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl overflow-visible">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Reschedule</h2>
                  <p className="text-xs text-gray-500 font-medium">Select a new date and time</p>
                </div>
                <button onClick={() => setRescheduleModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`w-full flex items-center justify-between border border-gray-200 rounded-2xl p-4 h-14 bg-gray-50 hover:bg-gray-100 transition-all focus:ring-2 focus:ring-teal-500 outline-none font-bold ${!rescheduleDate ? "text-gray-400" : "text-gray-900"}`}>
                        {rescheduleDate ? format(rescheduleDate, "PPP") : <span>Pick a date</span>}
                        <Calendar className="w-5 h-5 opacity-40" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[110] rounded-3xl border-gray-100 shadow-2xl" align="start">
                      <CalendarUI mode="single" selected={rescheduleDate} onSelect={setRescheduleDate} initialFocus disabled={(date) => date < new Date()} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">New Time</label>
                  <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                    <SelectTrigger className="w-full h-14 rounded-2xl bg-gray-50 border-gray-200 focus:ring-teal-500 font-bold">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] rounded-2xl shadow-xl border-gray-100">
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button onClick={handleReschedule} disabled={rescheduleAppointment.isPending}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-teal-600/20 transition-all mt-4 disabled:opacity-50">
                  {rescheduleAppointment.isPending ? "Rescheduling..." : "Confirm Reschedule"}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Cancel Modal */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setCancelModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Cancel Visit?</h2>
              <p className="text-gray-500 mb-8 font-medium">This appointment will be removed from your upcoming schedule.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleCancel} disabled={cancelAppointment.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50">
                  {cancelAppointment.isPending ? "Cancelling..." : "Yes, Cancel Appointment"}
                </button>
                <button onClick={() => setCancelModalOpen(false)} className="bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl transition-all">No, Keep It</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
