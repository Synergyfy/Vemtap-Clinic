"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Glasses, Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePatientStore } from "@/store/patientStore";

export default function PatientDashboard() {
  const { appointments, orders, notifications } = usePatientStore();
  
  const upcomingAppt = appointments.find(a => a.status === 'upcoming');
  const activeOrder = orders.length > 0 ? orders[0] : null;
  const recentNotifs = notifications.slice(0, 2);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Good morning, Alex
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Here is your eye care summary for today.
        </p>
      </header>

      {/* Upcoming Appointment */}
      {upcomingAppt ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-teal-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-medium backdrop-blur-sm w-fit">
                <CalendarDays className="w-4 h-4" />
                <span>Upcoming Visit</span>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-1">{upcomingAppt.type}</h2>
            <p className="text-teal-100 mb-6">{upcomingAppt.doctor} • {upcomingAppt.location}</p>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-teal-100 uppercase tracking-wider font-semibold">Date</p>
                  <p className="font-semibold">{upcomingAppt.date}</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-white/20"></div>
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-white/20 p-2 rounded-xl">
                  <span className="font-bold text-sm">Q</span>
                </div>
                <div>
                  <p className="text-xs text-teal-100 uppercase tracking-wider font-semibold">Queue Position</p>
                  <p className="font-semibold text-xl">3<span className="text-sm font-normal text-teal-100">/ 12</span></p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-gray-100 rounded-3xl p-8 text-center shadow-inner border border-gray-200"
        >
          <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">No Upcoming Appointments</h2>
          <p className="text-gray-500 mb-6">You don't have any appointments scheduled right now.</p>
          <Link href="/patient/appointments" className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors inline-block">
            Book an Appointment
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Lens Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-xl">
                <Glasses className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Lens Order</h3>
            </div>
            <Link href="/patient/optical" className="text-sm text-teal-600 font-medium flex items-center hover:underline">
              Track <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {activeOrder ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Order #{activeOrder.id}</span>
                <span className="font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{activeOrder.status}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div className={`h-2.5 rounded-full ${activeOrder.status === 'Delivered' ? 'bg-green-500 w-full' : 'bg-blue-600 w-1/2'}`}></div>
              </div>
              <p className="text-sm text-gray-500">Estimated pickup: {activeOrder.estimatedPickup}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No active optical orders.</p>
          )}
        </motion.div>

        {/* Recent Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-2 rounded-xl">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Recent Alerts</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            {recentNotifs.length > 0 ? (
              recentNotifs.map((notif, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className={`text-sm font-medium ${notif.unread ? 'text-gray-900' : 'text-gray-600'}`}>{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{notif.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No new alerts.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
