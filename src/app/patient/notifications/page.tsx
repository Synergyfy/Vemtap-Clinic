"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Activity, Info } from "lucide-react";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "reminder",
      title: "Appointment Reminder",
      message: "You have a Comprehensive Eye Exam today at 10:30 AM with Dr. Sarah Jenkins.",
      time: "2 hours ago",
      read: false,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      id: 2,
      type: "alert",
      title: "Lens Order Update",
      message: "Your lens order #VO-8421 has entered production.",
      time: "Yesterday",
      read: false,
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      id: 3,
      type: "info",
      title: "Invoice Available",
      message: "Invoice INV-2026-89 for your consultation fee is now available.",
      time: "2 days ago",
      read: true,
      icon: Info,
      color: "text-gray-500",
      bg: "bg-gray-100"
    },
    {
      id: 4,
      type: "reminder",
      title: "Time for a checkup!",
      message: "It's been a year since your last visit. Schedule a routine eye exam today to maintain optimal eye health.",
      time: "1 week ago",
      read: true,
      icon: Bell,
      color: "text-teal-600",
      bg: "bg-teal-50"
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Stay updated on your appointments and orders.
          </p>
        </div>
        <button className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
          Mark all as read
        </button>
      </header>

      <div className="space-y-3">
        {notifications.map((notif, idx) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className={`p-4 sm:p-5 rounded-2xl flex gap-4 transition-colors cursor-pointer border ${
              notif.read ? "bg-white border-gray-100 hover:border-gray-200" : "bg-blue-50/30 border-blue-100 hover:bg-blue-50/50"
            }`}
          >
            <div className={`p-3 rounded-xl h-fit shrink-0 ${notif.bg}`}>
              <notif.icon className={`w-6 h-6 ${notif.color}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-bold ${notif.read ? "text-gray-800" : "text-gray-900"}`}>
                  {notif.title}
                </h3>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                  {notif.time}
                </span>
              </div>
              <p className={`text-sm ${notif.read ? "text-gray-500" : "text-gray-700 font-medium"}`}>
                {notif.message}
              </p>
            </div>
            
            {!notif.read && (
              <div className="flex items-center justify-center shrink-0 w-3">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
