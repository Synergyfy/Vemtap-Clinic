"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { User, Bell, Shield, Palette, Save, LogOut, ChevronRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";

export default function PharmacySettings() {
  const [toast, setToast] = useState("");

  // Notification toggles
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [expiryAlert, setExpiryAlert] = useState(true);
  const [newRxAlert, setNewRxAlert] = useState(true);
  const [poUpdates, setPoUpdates] = useState(true);
  const [confirmDialogs, setConfirmDialogs] = useState(true);

  // Profile state
  const [profileModal, setProfileModal] = useState(false);
  const [profName, setProfName] = useState("Pharm. Peter Okafor");
  const [profEmail, setProfEmail] = useState("peter.okafor@vemtap.com");
  const [profPhone, setProfPhone] = useState("+234 800 123 4567");

  // Security modals
  const [passwordModal, setPasswordModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [twoFactor, setTwoFactor] = useState(false);
  const [twoFactorModal, setTwoFactorModal] = useState(false);

  const [sessionTimeout, setSessionTimeout] = useState("15 minutes");
  const [sessionModal, setSessionModal] = useState(false);

  // Preference modals
  const [defaultView, setDefaultView] = useState("Dashboard");
  const [viewModal, setViewModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState("20");
  const [itemsModal, setItemsModal] = useState(false);

  // Sign out
  const [signOutModal, setSignOutModal] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const notifToggles = [
    { label: "Low Stock Alerts", val: lowStockAlert, set: setLowStockAlert },
    { label: "Expiry Alerts (30 days)", val: expiryAlert, set: setExpiryAlert },
    { label: "New Prescription Alert", val: newRxAlert, set: setNewRxAlert },
    { label: "Purchase Order Updates", val: poUpdates, set: setPoUpdates },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader title="Settings" description="Manage your pharmacy profile, notifications, security, and preferences." />

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        {/* Profile */}
        <Card className="hover:border-emerald-200 transition-all cursor-pointer" onClick={() => setProfileModal(true)}>
          <CardHeader className="flex-row items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><User size={18} /></div>
            <div><CardTitle className="text-base">Profile</CardTitle><p className="text-xs text-slate-500">{profName} &bull; PharmD, MPH</p></div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-1">
            <div className="flex items-center justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-700">Staff ID</span><span className="text-sm text-slate-900">PH-2024-001</span></div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-700">Email</span><span className="text-sm text-slate-900">{profEmail}</span></div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-700">Phone</span><span className="text-sm text-slate-900">{profPhone}</span></div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50"><span className="text-sm text-slate-700">License No.</span><span className="text-sm text-slate-900">PCN-0421-9876</span></div>
            <div className="flex items-center justify-between py-2"><span className="text-sm text-slate-700">Role</span><span className="text-sm text-slate-900">Senior Pharmacist</span></div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex-row items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><Bell size={18} /></div>
            <div><CardTitle className="text-base">Notifications</CardTitle><p className="text-xs text-slate-500">Configure alert preferences</p></div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-1">
            {notifToggles.map((n) => (
              <div key={n.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-700">{n.label}</span>
                <button onClick={() => n.set(!n.val)} className={`relative w-11 h-6 rounded-full transition-colors ${n.val ? "bg-emerald-600" : "bg-slate-200"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${n.val ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="flex-row items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><Shield size={18} /></div>
            <div><CardTitle className="text-base">Security</CardTitle><p className="text-xs text-slate-500">Password and authentication</p></div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-1">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-700">Password</span>
              <button onClick={() => setPasswordModal(true)} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1">Change <ChevronRight size={12} /></button>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-700">Two-Factor Auth</span>
              <button onClick={() => setTwoFactorModal(true)} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1">{twoFactor ? "Enabled" : "Not enabled"} <ChevronRight size={12} /></button>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-700">Session Timeout</span>
              <button onClick={() => setSessionModal(true)} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1">{sessionTimeout} <ChevronRight size={12} /></button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader className="flex-row items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><Palette size={18} /></div>
            <div><CardTitle className="text-base">Preferences</CardTitle><p className="text-xs text-slate-500">Customize your experience</p></div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-1">
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-700">Default View</span>
              <button onClick={() => setViewModal(true)} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1">{defaultView} <ChevronRight size={12} /></button>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-700">Items Per Page</span>
              <button onClick={() => setItemsModal(true)} className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1">{itemsPerPage} <ChevronRight size={12} /></button>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-700">Confirmation Dialogs</span>
              <button onClick={() => setConfirmDialogs(!confirmDialogs)} className={`relative w-11 h-6 rounded-full transition-colors ${confirmDialogs ? "bg-emerald-600" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${confirmDialogs ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-rose-100">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-rose-700 text-base sm:text-lg"><LogOut size={18} /> Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 flex items-center justify-between flex-wrap gap-3">
          <div><p className="text-sm font-medium text-slate-900">Sign Out of Pharmacy Dashboard</p><p className="text-xs text-slate-500">End your current pharmacy session.</p></div>
          <button onClick={() => setSignOutModal(true)} className="rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">Sign Out</button>
        </CardContent>
      </Card>

      {/* Profile Modal */}
      <Modal isOpen={profileModal} onClose={() => setProfileModal(null)} title="Edit Profile">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label><input type="text" value={profName} onChange={(e) => setProfName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email</label><input type="email" value={profEmail} onChange={(e) => setProfEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Phone</label><input type="text" value={profPhone} onChange={(e) => setProfPhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setProfileModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { setProfileModal(null); showToast("Profile updated successfully"); }} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal isOpen={passwordModal} onClose={() => setPasswordModal(null)} title="Change Password">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Current Password</label><div className="relative"><input type={showPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-10" placeholder="Enter current password" /><button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">New Password</label><input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50" placeholder="Enter new password" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setPasswordModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { setPasswordModal(null); setCurrentPw(""); setNewPw(""); showToast("Password changed successfully"); }} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Update Password</button>
          </div>
        </div>
      </Modal>

      {/* 2FA Modal */}
      <Modal isOpen={twoFactorModal} onClose={() => setTwoFactorModal(null)} title="Two-Factor Authentication">
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div><p className="font-medium text-slate-900 text-sm">Two-Factor Authentication</p><p className="text-xs text-slate-500">Add an extra layer of security to your account</p></div>
            <button onClick={() => { setTwoFactor(!twoFactor); }} className={`relative w-11 h-6 rounded-full transition-colors ${twoFactor ? "bg-emerald-600" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${twoFactor ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setTwoFactorModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { setTwoFactorModal(null); showToast(twoFactor ? "2FA enabled" : "2FA disabled"); }} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Save</button>
          </div>
        </div>
      </Modal>

      {/* Session Timeout Modal */}
      <Modal isOpen={sessionModal} onClose={() => setSessionModal(null)} title="Session Timeout">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Duration</label>
            <div className="flex gap-2">
              {["5 minutes", "15 minutes", "30 minutes", "1 hour"].map((t) => (
                <button key={t} onClick={() => setSessionTimeout(t)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${sessionTimeout === t ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{t.replace(" minutes", "m").replace(" hour", "h")}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setSessionModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { setSessionModal(null); showToast("Session timeout updated"); }} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Save</button>
          </div>
        </div>
      </Modal>

      {/* Default View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(null)} title="Default View">
        <div className="space-y-5">
          <div className="flex gap-2">
            {["Dashboard", "Dispensing", "Inventory", "Prescriptions"].map((v) => (
              <button key={v} onClick={() => setDefaultView(v)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${defaultView === v ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{v}</button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setViewModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { setViewModal(null); showToast("Default view updated"); }} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Save</button>
          </div>
        </div>
      </Modal>

      {/* Items Per Page Modal */}
      <Modal isOpen={itemsModal} onClose={() => setItemsModal(null)} title="Items Per Page">
        <div className="space-y-5">
          <div className="flex gap-2">
            {["10", "20", "50", "100"].map((n) => (
              <button key={n} onClick={() => setItemsPerPage(n)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${itemsPerPage === n ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{n}</button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setItemsModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { setItemsModal(null); showToast("Items per page updated"); }} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Save</button>
          </div>
        </div>
      </Modal>

      {/* Sign Out Confirmation */}
      <Modal isOpen={signOutModal} onClose={() => setSignOutModal(null)} title="Sign Out">
        <div className="space-y-5">
          <p className="text-sm text-slate-600">Are you sure you want to sign out of the Pharmacy Dashboard? You will need to log in again.</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setSignOutModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { setSignOutModal(null); showToast("Signed out successfully"); }} className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-200">Sign Out</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
