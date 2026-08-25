"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  CalendarDays, 
  Clock, 
  Glasses, 
  Bell, 
  ChevronRight, 
  FileText, 
  CreditCard, 
  User, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { usePatientStore } from "@/store/patientStore";

export default function PatientDashboard() {
  const { appointments, orders, notifications, outstandingBalance, invoices, addNotification } = usePatientStore();
  const [checkedIn, setCheckedIn] = useState(false);
  const [toast, setToast] = useState("");
  
  const upcomingAppt = appointments.find(a => a.status === 'upcoming');
  const activeOrder = orders.find(o => o.status !== 'Delivered') || orders[0];
  const recentNotifs = notifications.slice(0, 3);
  const latestInvoice = invoices[0];

  const quickActions = [
    { label: "Book Appointment", icon: Plus, href: "/patient/appointments", color: "bg-teal-50 text-teal-600" },
    { label: "Medical Records", icon: FileText, href: "/patient/records", color: "bg-blue-50 text-blue-600" },
    { label: "Pay Bills", icon: CreditCard, href: "/patient/billing", color: "bg-orange-50 text-orange-600" },
    { label: "Optical Orders", icon: Glasses, href: "/patient/optical", color: "bg-purple-50 text-purple-600" },
  ];

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleCheckIn = () => {
    setCheckedIn(true);
    addNotification({
      title: "Checked In",
      message: "You've checked in for your appointment at 10:30 AM. Please wait to be called.",
      time: "Just now",
      type: "appointment",
    });
    showToast("Checked in successfully");
  };

  return (
    <div className="space-y-8 pb-10">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, Alex
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">
            You have an appointment today at 10:30 AM.
          </p>
        </div>
        <Link href="/patient/profile">
          <div className="w-12 h-12 rounded-full bg-teal-100 border-2 border-white shadow-sm flex items-center justify-center text-teal-700 font-bold hover:scale-105 transition-transform cursor-pointer">
            AS
          </div>
        </Link>
      </header>

      {/* Primary Focus: Upcoming Appointment & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {upcomingAppt ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-teal-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-teal-900/10 relative overflow-hidden h-full flex flex-col justify-between"
            >
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/30 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/20">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    <span>Active Session</span>
                  </div>
                  <div className="text-teal-100 text-sm font-medium">
                    {upcomingAppt.location}
                  </div>
                </div>
                
                <h2 className="text-3xl font-extrabold mb-2 leading-tight">{upcomingAppt.type}</h2>
                <p className="text-teal-50 text-lg mb-8 opacity-90">{upcomingAppt.doctor}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
                    <p className="text-xs text-teal-100 uppercase tracking-widest font-bold mb-1 opacity-80">Arrival Time</p>
                    <p className="text-xl font-black">10:15 AM</p>
                  </div>
                  <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10">
                    <p className="text-xs text-teal-100 uppercase tracking-widest font-bold mb-1 opacity-80">Queue Spot</p>
                    <p className="text-xl font-black italic">#03 <span className="text-sm font-normal opacity-60">/ 12</span></p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-teal-600 bg-teal-400 flex items-center justify-center text-[10px] font-bold">
                      {i}
                    </div>
                  ))}
                  <div className="pl-3 text-xs text-teal-100 font-medium self-center">
                    2 patients ahead of you
                  </div>
                </div>
                <button onClick={handleCheckIn} disabled={checkedIn}
                  className={`px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg transition-all ${checkedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-teal-700 hover:bg-teal-50'}`}>
                  {checkedIn ? 'Checked In' : 'Check In'}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-10 text-center shadow-sm border border-gray-100 h-full flex flex-col justify-center items-center">
              <div className="bg-gray-50 p-6 rounded-full mb-6">
                <CalendarDays className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Appointments Today</h2>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Routine checkups keep your vision sharp. Book your next visit in seconds.</p>
              <Link href="/patient/appointments" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2">
                Book Visit <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions & Notifications */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 px-2 text-sm uppercase tracking-widest">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, idx) => (
                <Link key={idx} href={action.href}>
                  <div className={`${action.color} rounded-2xl p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:scale-[1.02] transition-transform border border-transparent hover:border-current/10`}>
                    <action.icon className="w-6 h-6 mb-2" />
                    <span className="text-[11px] font-bold leading-tight">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex-1">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Recent Alerts</h3>
              <Link href="/patient/notifications" className="text-teal-600 text-xs font-bold hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {recentNotifs.map((n) => (
                <div key={n.id} className="flex gap-4 p-2 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.unread ? 'bg-orange-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-none mb-1">{n.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Optical Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Glasses className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-black text-xl text-gray-900 tracking-tight">Lens Order</h3>
                <p className="text-xs text-gray-500 font-medium">Tracking Status</p>
              </div>
            </div>
            <Link href="/patient/optical" className="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-teal-600 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </Link>
          </div>

          {activeOrder ? (
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-black text-gray-900 mb-1">{activeOrder.id}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{activeOrder.type}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                  activeOrder.status === 'Ready' ? 'bg-green-100 text-green-700' : 
                  activeOrder.status === 'Production' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {activeOrder.status}
                </div>
              </div>

              <div className="relative pt-1">
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100">
                  <div 
                    style={{ width: activeOrder.status === 'Ready' ? "100%" : activeOrder.status === 'Production' ? "65%" : "25%" }} 
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-1000"
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>Ordered</span>
                  <span>Lab</span>
                  <span>Ready</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-medium text-gray-600">
                  Estimated pickup: <span className="text-gray-900 font-bold">{activeOrder.estimatedPickup}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-400 font-medium italic">No active optical orders</p>
            </div>
          )}
        </motion.div>

        {/* Financial & HMO Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-2xl">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-black text-xl text-gray-900 tracking-tight">Billing</h3>
                <p className="text-xs text-gray-500 font-medium">Financial Overview</p>
              </div>
            </div>
            <Link href="/patient/billing" className="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-teal-600 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="bg-orange-50 rounded-[2rem] p-6 border border-orange-100 flex justify-between items-center">
              <div>
                <p className="text-xs text-orange-700 uppercase tracking-widest font-bold mb-1">Outstanding Balance</p>
                <p className="text-3xl font-black text-orange-900">₦{outstandingBalance.toLocaleString()}</p>
              </div>
              <button className="bg-orange-600 text-white p-3 rounded-2xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-colors">
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">HMO Status</p>
                  <p className="text-xs font-bold text-gray-900">Active (Reliance)</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Last Invoice</p>
                  <p className="text-xs font-bold text-gray-900">{latestInvoice?.id || "None"}</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-center text-gray-400 font-medium italic">
              Payments are processed securely via Paystack
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
