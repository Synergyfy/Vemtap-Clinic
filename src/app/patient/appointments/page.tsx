"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, CheckCircle2, XCircle, X } from "lucide-react";
import { usePatientStore } from "@/store/patientStore";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AppointmentsPage() {
  const { appointments, bookAppointment, rescheduleAppointment, cancelAppointment } = usePatientStore();
  
  const [isBookModalOpen, setBookModalOpen] = useState(false);
  const [isRescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState<number | null>(null);

  // Form states
  const [bookType, setBookType] = useState("Comprehensive Eye Exam");
  const [bookDate, setBookDate] = useState<Date>();
  
  const [rescheduleDate, setRescheduleDate] = useState<Date>();
  const [rescheduleTime, setRescheduleTime] = useState("");

  const handleBook = () => {
    if (!bookDate) {
      alert("Please select a date");
      return;
    }
    bookAppointment({
      type: bookType,
      doctor: "Dr. Available Provider",
      date: format(bookDate, "MMM dd, yyyy") + ", 09:00 AM", // default time for booking since no time selector was in original
      location: "Main Branch"
    });
    setBookModalOpen(false);
  };

  const handleReschedule = () => {
    if (selectedApptId !== null && rescheduleDate && rescheduleTime) {
      rescheduleAppointment(selectedApptId, `${format(rescheduleDate, "MMM dd, yyyy")}, ${rescheduleTime}`);
      setRescheduleModalOpen(false);
    }
  };

  const handleCancel = () => {
    if (selectedApptId !== null) {
      cancelAppointment(selectedApptId);
      setCancelModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Appointments
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Manage your past and upcoming visits.
          </p>
        </div>
        <button 
          onClick={() => setBookModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          Book Appointment
        </button>
      </header>

      <div className="space-y-4">
        {appointments.map((appt, idx) => (
          <motion.div
            key={appt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              appt.status === 'cancelled' ? 'border-red-100 opacity-70' : 'border-gray-100'
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {appt.status === "upcoming" && (
                  <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-100">
                    Upcoming
                  </span>
                )}
                {appt.status === "completed" && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
                {appt.status === "cancelled" && (
                  <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Cancelled
                  </span>
                )}
                <h3 className={`font-bold text-lg ml-1 ${appt.status === 'cancelled' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                  {appt.type}
                </h3>
              </div>
              <p className="text-gray-600 font-medium mb-4">{appt.doctor}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{appt.date.split(",")[0]}</span>
                </div>
                {appt.date.includes(',') && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{appt.date.split(",")[1]}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{appt.location}</span>
                </div>
              </div>
            </div>
            
            {appt.status === "upcoming" && (
              <div className="flex flex-row md:flex-col gap-3 md:min-w-[140px] border-t border-gray-100 pt-4 md:border-t-0 md:pt-0">
                <button 
                  onClick={() => { setSelectedApptId(appt.id); setRescheduleModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-medium transition-colors border border-gray-200"
                >
                  <Clock className="w-4 h-4" /> Reschedule
                </button>
                <button 
                  onClick={() => { setSelectedApptId(appt.id); setCancelModalOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors border border-transparent hover:border-red-100"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </motion.div>
        ))}
        {appointments.length === 0 && (
          <p className="text-gray-500 text-center py-8">No appointments found.</p>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setBookModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-visible"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
                <button onClick={() => setBookModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-gray-700">Appointment Type</label>
                  <Select value={bookType} onValueChange={setBookType}>
                    <SelectTrigger className="w-full h-12 rounded-xl bg-gray-50 border-gray-300 focus:ring-teal-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comprehensive Eye Exam">Comprehensive Eye Exam</SelectItem>
                      <SelectItem value="Lens Fitting">Lens Fitting</SelectItem>
                      <SelectItem value="Follow-up Consultation">Follow-up Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`w-full flex items-center justify-between border border-gray-300 rounded-xl p-3 h-12 bg-gray-50 hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-teal-500 outline-none ${!bookDate ? "text-gray-500" : "text-gray-900"}`}>
                        {bookDate ? format(bookDate, "PPP") : <span>Pick a date</span>}
                        <Calendar className="w-4 h-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[110]" align="start">
                      <CalendarUI
                        mode="single"
                        selected={bookDate}
                        onSelect={setBookDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <button onClick={handleBook} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors mt-4">Confirm Booking</button>
              </div>
            </motion.div>
          </div>
        )}

        {isRescheduleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setRescheduleModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl overflow-visible"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
                <button onClick={() => setRescheduleModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">Select a new date and time for your appointment.</p>
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-gray-700">New Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className={`w-full flex items-center justify-between border border-gray-300 rounded-xl p-3 h-12 bg-gray-50 hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-teal-500 outline-none ${!rescheduleDate ? "text-gray-500" : "text-gray-900"}`}>
                        {rescheduleDate ? format(rescheduleDate, "PPP") : <span>Pick a date</span>}
                        <Calendar className="w-4 h-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[110]" align="start">
                      <CalendarUI
                        mode="single"
                        selected={rescheduleDate}
                        onSelect={setRescheduleDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-gray-700">New Time</label>
                  <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                    <SelectTrigger className="w-full h-12 rounded-xl bg-gray-50 border-gray-300 focus:ring-teal-500">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button onClick={handleReschedule} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors mt-4">Confirm Reschedule</button>
              </div>
            </motion.div>
          </div>
        )}

        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setCancelModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cancel Appointment?</h2>
              <p className="text-gray-500 mb-6 text-sm">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl transition-colors">No, Keep It</button>
                <button onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">Yes, Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
