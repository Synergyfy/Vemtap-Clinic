"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Shield, MapPin, Bell, LogOut, ChevronRight, CheckCircle2, Building2, Phone, Mail, CalendarDays } from "lucide-react";
import { Modal } from "@/components/ui/modal";

const branches = ["Main Branch", "Downtown Clinic", "Ikeja Mall", "Victoria Island", "Lekki Phase 1"];

export default function ProfilePage() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showHmoDetails, setShowHmoDetails] = useState(false);
  const [showBranch, setShowBranch] = useState(false);
  const [preferredBranch, setPreferredBranch] = useState("Main Branch");
  const [toast, setToast] = useState("");

  const [personalInfo, setPersonalInfo] = useState({
    name: "Alex Carter", email: "alex.carter@email.com", phone: "+234 802 123 4567", dob: "1990-05-14"
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleLogout = () => {
    try {
      localStorage.removeItem("patient-portal-storage");
      sessionStorage.clear();
    } catch { /* ignore */ }
    setShowLogoutModal(false);
    router.replace("/login");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 z-[100]">
          <CheckCircle2 size={16} className="text-emerald-400" /> {toast}
        </div>
      )}
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
              <span className="text-4xl font-bold text-teal-700">{personalInfo.name.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{personalInfo.name}</h2>
            <p className="text-gray-500 text-sm">Patient ID: VC-2024-91</p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
              <Shield className="w-3.5 h-3.5" /> HMO Verified
            </div>
          </div>

          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-1">
            <button onClick={() => setShowPersonalInfo(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3 text-gray-700 group-hover:text-teal-600">
                <User className="w-5 h-5" />
                <span className="font-medium text-sm">Personal Info</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
            </button>
            <button onClick={() => setShowHmoDetails(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="flex items-center gap-3 text-gray-700 group-hover:text-teal-600">
                <Shield className="w-5 h-5" />
                <span className="font-medium text-sm">HMO Details</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
            </button>
            <button onClick={() => setShowBranch(true)} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
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

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Account</h3>
            <p className="text-sm text-gray-500 mb-4">Sign out of your patient portal.</p>
            <button onClick={() => setShowLogoutModal(true)} className="flex items-center justify-center gap-2 w-full bg-white text-red-600 border border-red-200 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </motion.div>
        </div>
      </div>

      {/* Personal Info Modal */}
      <Modal isOpen={showPersonalInfo} onClose={() => setShowPersonalInfo(false)} title="Personal Information">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
            <input value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/10 font-bold text-slate-900 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
            <input value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/10 font-bold text-slate-900 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
            <input value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/10 font-bold text-slate-900 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</label>
            <input type="date" value={personalInfo.dob} onChange={(e) => setPersonalInfo({ ...personalInfo, dob: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/10 font-bold text-slate-900 text-sm" />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button onClick={() => { setShowPersonalInfo(false); showToast("Personal info updated"); }}
              className="w-full py-3.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors">Save Changes</button>
            <button onClick={() => setShowPersonalInfo(false)}
              className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* HMO Details Modal */}
      <Modal isOpen={showHmoDetails} onClose={() => setShowHmoDetails(false)} title="HMO Details">
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0"><Shield size={28} /></div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Reliance Health</h4>
              <p className="text-sm text-slate-500">HMO Provider</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400">Policy Number</span>
              <span className="text-sm font-bold text-slate-900">REL-0092-4418</span>
            </div>
            <div className="flex justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400">Coverage Type</span>
              <span className="text-sm font-bold text-slate-900">Comprehensive</span>
            </div>
            <div className="flex justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">Active</span>
            </div>
            <div className="flex justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-bold text-slate-400">Valid Until</span>
              <span className="text-sm font-bold text-slate-900">Dec 31, 2026</span>
            </div>
          </div>
          <button onClick={() => setShowHmoDetails(false)}
            className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">Close</button>
        </div>
      </Modal>

      {/* Preferred Branch Modal */}
      <Modal isOpen={showBranch} onClose={() => setShowBranch(false)} title="Preferred Branch">
        <div className="space-y-3">
          {branches.map((branch) => (
            <button key={branch} onClick={() => { setPreferredBranch(branch); setShowBranch(false); showToast(`Preferred branch changed to ${branch}`); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${preferredBranch === branch ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-100 hover:border-teal-200'}`}>
              <div className="flex items-center gap-3">
                <Building2 size={18} className={preferredBranch === branch ? 'text-teal-600' : 'text-slate-400'} />
                <span className={`text-sm font-bold ${preferredBranch === branch ? 'text-teal-900' : 'text-slate-700'}`}>{branch}</span>
              </div>
              {preferredBranch === branch && <CheckCircle2 size={18} className="text-teal-600" />}
            </button>
          ))}
        </div>
        <button onClick={() => setShowBranch(false)}
          className="w-full mt-4 py-3.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">Close</button>
      </Modal>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Sign out">
        <p className="text-sm text-slate-600">Are you sure you want to sign out of your patient account?</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setShowLogoutModal(false)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
            Sign out
          </button>
        </div>
      </Modal>
    </div>
  );
}
