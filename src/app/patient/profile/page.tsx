"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Shield, MapPin, Bell, LogOut, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Profile Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Manage your personal information, preferences, and account security.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              <span className="text-4xl font-bold text-teal-700">A</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Alex Carter</h2>
            <p className="text-gray-500 text-sm">Patient ID: VC-2024-91</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
              <Shield className="w-3.5 h-3.5" /> HMO Verified
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3 text-gray-700 group-hover:text-teal-600">
                <User className="w-5 h-5" />
                <span className="font-medium text-sm">Personal Info</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3 text-gray-700 group-hover:text-teal-600">
                <Shield className="w-5 h-5" />
                <span className="font-medium text-sm">HMO Details</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3 text-gray-700 group-hover:text-teal-600">
                <MapPin className="w-5 h-5" />
                <span className="font-medium text-sm">Preferred Branch</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Notification Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-400" /> Notification Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive appointment reminders and invoices via email.</p>
                </div>
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-teal-500' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                  <h4 className="font-semibold text-gray-900">SMS Alerts</h4>
                  <p className="text-sm text-gray-500">Get text messages for lens pickups and critical updates.</p>
                </div>
                <button 
                  onClick={() => setSmsEnabled(!smsEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${smsEnabled ? 'bg-teal-500' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${smsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                  <h4 className="font-semibold text-gray-900">WhatsApp Updates</h4>
                  <p className="text-sm text-gray-500">Connect your account for WhatsApp notifications.</p>
                </div>
                <button 
                  onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${whatsappEnabled ? 'bg-teal-500' : 'bg-gray-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${whatsappEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-red-50 rounded-3xl p-6 border border-red-100"
          >
            <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">Actions here can affect your account access.</p>
            
            <button className="flex items-center justify-center gap-2 w-full bg-white text-red-600 border border-red-200 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
