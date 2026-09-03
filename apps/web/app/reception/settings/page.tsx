"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { User, Bell, Shield, Save, LogOut, CheckCircle2, Eye, EyeOff, Layout, Users, Clock } from "lucide-react";

export default function ReceptionSettings() {
  const [toast, setToast] = useState("");

  const [newPatientNotif, setNewPatientNotif] = useState(true);
  const [appointmentNotif, setAppointmentNotif] = useState(true);
  const [hmoPendingNotif, setHmoPendingNotif] = useState(true);
  const [queueAlertNotif, setQueueAlertNotif] = useState(true);
  const [soundNotif, setSoundNotif] = useState(false);

  const [profileModal, setProfileModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [itemsModal, setItemsModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [sessionModal, setSessionModal] = useState(false);
  const [signOutModal, setSignOutModal] = useState(false);

  const [profName, setProfName] = useState("Grace Adeyemi");
  const [profEmail, setProfEmail] = useState("grace.adeyemi@vemtap.com");
  const [profPhone, setProfPhone] = useState("+234 800 987 6543");
  const [defaultView, setDefaultView] = useState("Dashboard");
  const [itemsPerPage, setItemsPerPage] = useState("20");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("15 minutes");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const notifToggles = [
    { label: "New Patient Registration", val: newPatientNotif, set: setNewPatientNotif },
    { label: "Appointment Reminders", val: appointmentNotif, set: setAppointmentNotif },
    { label: "HMO Pending Alerts", val: hmoPendingNotif, set: setHmoPendingNotif },
    { label: "Queue Overflow Alerts", val: queueAlertNotif, set: setQueueAlertNotif },
    { label: "Sound Notifications", val: soundNotif, set: setSoundNotif },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 font-medium">Configure frontdesk preferences and notifications.</p>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl bg-slate-900 text-white text-xs font-black shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-emerald-400" /> {toast}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <button onClick={() => setProfileModal(true)}
          className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all text-left group">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center mb-4"><User size={24} className="text-sky-600" /></div>
          <h3 className="text-lg font-black text-slate-900">Profile</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Update your name, email and phone.</p>
        </button>

        <button onClick={() => setNotifModal(true)}
          className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all text-left group">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4"><Bell size={24} className="text-amber-600" /></div>
          <h3 className="text-lg font-black text-slate-900">Notifications</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Control which alerts you receive.</p>
        </button>

        <button onClick={() => setViewModal(true)}
          className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all text-left group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4"><Layout size={24} className="text-emerald-600" /></div>
          <h3 className="text-lg font-black text-slate-900">Default View</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Landing page: {defaultView}.</p>
        </button>

        <button onClick={() => setItemsModal(true)}
          className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all text-left group">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4"><Users size={24} className="text-purple-600" /></div>
          <h3 className="text-lg font-black text-slate-900">Items Per Page</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Show {itemsPerPage} items per page.</p>
        </button>

        <button onClick={() => setPasswordModal(true)}
          className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 transition-all text-left group">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center mb-4"><Shield size={24} className="text-rose-600" /></div>
          <h3 className="text-lg font-black text-slate-900">Security</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">Password and session preferences.</p>
        </button>

        <button onClick={() => setSignOutModal(true)}
          className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all text-left group">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4"><LogOut size={24} className="text-red-600" /></div>
          <h3 className="text-lg font-black text-slate-900">Sign Out</h3>
          <p className="text-xs text-slate-400 font-medium mt-1">End your current shift session.</p>
        </button>
      </div>

      {/* Profile Modal */}
      <Modal isOpen={profileModal} onClose={() => setProfileModal(false)} title="Edit Profile">
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
            <input value={profName} onChange={e => setProfName(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
            <input type="email" value={profEmail} onChange={e => setProfEmail(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
            <input value={profPhone} onChange={e => setProfPhone(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold" />
          </div>
          <button onClick={() => { setProfileModal(false); showToast("Profile updated"); }}
            className="w-full p-4 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
            <Save size={16} /> Save Changes
          </button>
        </div>
      </Modal>

      {/* Notifications Modal */}
      <Modal isOpen={notifModal} onClose={() => setNotifModal(false)} title="Notifications">
        <div className="space-y-5">
          {notifToggles.map(n => (
            <div key={n.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-sm font-bold text-slate-700">{n.label}</span>
              <button onClick={() => n.set(!n.val)}
                className={cn("w-12 h-7 rounded-full transition-all relative", n.val ? "bg-sky-600" : "bg-slate-300")}>
                <div className={cn("absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all", n.val ? "left-[22px]" : "left-0.5")} />
              </button>
            </div>
          ))}
          <button onClick={() => { setNotifModal(false); showToast("Notification preferences saved"); }}
            className="w-full p-4 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
            <Save size={16} /> Save Preferences
          </button>
        </div>
      </Modal>

      {/* Default View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Default View">
        <div className="space-y-3">
          {["Dashboard", "Queue", "Appointments", "Billing"].map(view => (
            <button key={view} onClick={() => { setDefaultView(view); setViewModal(false); showToast(`Default view set to ${view}`); }}
              className={cn("w-full p-4 rounded-2xl border text-left text-sm font-bold transition-all", defaultView === view ? "bg-sky-50 border-sky-200 text-sky-700" : "border-slate-100 text-slate-700 hover:border-sky-100")}>
              {view}
            </button>
          ))}
        </div>
      </Modal>

      {/* Items Per Page Modal */}
      <Modal isOpen={itemsModal} onClose={() => setItemsModal(false)} title="Items Per Page">
        <div className="space-y-3">
          {["10", "20", "50", "100"].map(n => (
            <button key={n} onClick={() => { setItemsPerPage(n); setItemsModal(false); showToast(`Showing ${n} items per page`); }}
              className={cn("w-full p-4 rounded-2xl border text-left text-sm font-bold transition-all", itemsPerPage === n ? "bg-purple-50 border-purple-200 text-purple-700" : "border-slate-100 text-slate-700 hover:border-purple-100")}>
              {n} items
            </button>
          ))}
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal isOpen={passwordModal} onClose={() => setPasswordModal(false)} title="Change Password">
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                className="w-full p-4 pr-14 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
            <input type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/10 font-bold text-slate-900" />
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { setPasswordModal(false); showToast("Password updated"); setCurrentPw(""); setNewPw(""); }}
              className="w-full p-4 rounded-2xl bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-700 flex items-center justify-center gap-2">
              <Save size={16} /> Update Password
            </button>
            <button onClick={() => setSessionModal(true)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 flex items-center justify-center gap-2">
              <Clock size={16} /> Session Timeout: {sessionTimeout}
            </button>
            <button onClick={() => setPasswordModal(false)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Session Timeout Modal */}
      <Modal isOpen={sessionModal} onClose={() => setSessionModal(false)} title="Session Timeout">
        <div className="space-y-3">
          {["5 minutes", "15 minutes", "30 minutes", "1 hour", "Never"].map(t => (
            <button key={t} onClick={() => { setSessionTimeout(t); setSessionModal(false); showToast(`Session timeout set to ${t}`); }}
              className={cn("w-full p-4 rounded-2xl border text-left text-sm font-bold transition-all", sessionTimeout === t ? "bg-rose-50 border-rose-200 text-rose-700" : "border-slate-100 text-slate-700 hover:border-rose-100")}>
              {t}
            </button>
          ))}
        </div>
      </Modal>

      {/* Sign Out Modal */}
      <Modal isOpen={signOutModal} onClose={() => setSignOutModal(false)} title="Sign Out">
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <LogOut size={32} className="text-red-500" />
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900">End Shift?</h4>
            <p className="text-sm text-slate-500 mt-1">You will be signed out and redirected to the login screen.</p>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { setSignOutModal(false); showToast("Signed out successfully"); }}
              className="w-full p-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700">Sign Out</button>
            <button onClick={() => setSignOutModal(false)}
              className="w-full p-4 rounded-2xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50">Stay Signed In</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
