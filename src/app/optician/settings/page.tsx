"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Settings2, Bell, Shield, User, Globe, Moon, PackageSearch, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";

type ModalKey = "profile" | "notifications" | "lab" | "security" | "display" | "regional" | null;

const settingsSections = [
  { key: "profile" as const, title: "Profile Settings", description: "Update optical staff profile, license info, and contact details", icon: User, color: "text-amber-600", bg: "bg-amber-50" },
  { key: "notifications" as const, title: "Notification Preferences", description: "Configure alerts for new orders, low stock, and production updates", icon: Bell, color: "text-emerald-600", bg: "bg-emerald-50" },
  { key: "lab" as const, title: "Lab Configuration", description: "Set production defaults, lens edger calibration, and QC parameters", icon: PackageSearch, color: "text-violet-600", bg: "bg-violet-50" },
  { key: "security" as const, title: "Privacy & Security", description: "Manage password, two-factor authentication, and session settings", icon: Shield, color: "text-rose-600", bg: "bg-rose-50" },
  { key: "display" as const, title: "Display & Theme", description: "Toggle dark mode, language preferences, and dashboard layout", icon: Moon, color: "text-cyan-600", bg: "bg-cyan-50" },
  { key: "regional" as const, title: "Regional Settings", description: "Set timezone, currency, date format, and measurement units", icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50" },
];

export default function OpticianSettings() {
  const [modal, setModal] = useState<ModalKey>(null);
  const [toast, setToast] = useState("");

  const [profileName, setProfileName] = useState("Opt. S. Danladi");
  const [profileEmail, setProfileEmail] = useState("s.danladi@vemtap.com");
  const [profilePhone, setProfilePhone] = useState("+234 800 OPTIC");
  const [licenseNo, setLicenseNo] = useState("OD-2024-0082");

  const [notifOrders, setNotifOrders] = useState(true);
  const [notifStock, setNotifStock] = useState(true);
  const [notifProduction, setNotifProduction] = useState(true);
  const [notifReports, setNotifReports] = useState(false);

  const [defaultLensType, setDefaultLensType] = useState("Single Vision");
  const [edgerCalib, setEdgerCalib] = useState("Calibrated");
  const [qcInspection, setQcInspection] = useState(true);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [layout, setLayout] = useState("Compact");

  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [currency, setCurrency] = useState("NGN (₦)");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const handleSave = (label: string) => { showToast(`${label} updated successfully`); setModal(null); };

  return (
    <div className="space-y-6 md:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-amber-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-amber-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader title="Settings" description="Manage optical hub preferences, lab configuration, and account settings." />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {settingsSections.map((s) => (
          <Card key={s.key} onClick={() => setModal(s.key)} className="hover:border-amber-200 transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${s.bg} ${s.color} shrink-0`}><s.icon size={24} /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{s.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Optical Hub Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Staff ID</p><p className="mt-1 font-bold text-slate-900">STAFF-002</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role</p><p className="mt-1 font-bold text-slate-900">Chief Optometrist</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Department</p><p className="mt-1 font-bold text-slate-900">Optical / Lab</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Branch</p><p className="mt-1 font-bold text-slate-900">Vemtap Main</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p><p className="mt-1 font-bold text-slate-900">s.danladi@vemtap.com</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</p><p className="mt-1"><Badge className="bg-emerald-600 text-white">Active</Badge></p></div>
          </div>
        </CardContent>
      </Card>

      {/* Profile */}
      <Modal isOpen={modal === "profile"} onClose={() => setModal(null)} title="Profile Settings">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label><input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" /></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email</label><input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" /></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Phone</label><input type="text" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" /></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">License Number</label><input type="text" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Profile")} className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 shadow-lg shadow-amber-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Notifications */}
      <Modal isOpen={modal === "notifications"} onClose={() => setModal(null)} title="Notification Preferences">
        <div className="space-y-5">
          {[
            { label: "New Orders", desc: "Notify when a new lens order arrives", val: notifOrders, set: setNotifOrders },
            { label: "Low Stock Alerts", desc: "Alert when inventory falls below minimum", val: notifStock, set: setNotifStock },
            { label: "Production Updates", desc: "Notify on stage advancements and completions", val: notifProduction, set: setNotifProduction },
            { label: "Daily Reports", desc: "Send end-of-shift sales and production summary", val: notifReports, set: setNotifReports },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div><p className="font-medium text-slate-900 text-sm">{n.label}</p><p className="text-xs text-slate-500">{n.desc}</p></div>
              <button onClick={() => n.set(!n.val)} className={`relative w-11 h-6 rounded-full transition-colors ${n.val ? "bg-amber-600" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${n.val ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Notification preferences")} className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 shadow-lg shadow-amber-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Lab Configuration */}
      <Modal isOpen={modal === "lab"} onClose={() => setModal(null)} title="Lab Configuration">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Default Lens Type</label>
            <select value={defaultLensType} onChange={(e) => setDefaultLensType(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50">
              <option>Single Vision</option><option>Bifocal</option><option>Progressive</option><option>Photochromic</option>
            </select>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Lens Edger Calibration</label>
            <div className="flex gap-2">
              {["Calibrated", "Needs Calibration", "Out of Service"].map((c) => (
                <button key={c} onClick={() => setEdgerCalib(c)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${edgerCalib === c ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div><p className="font-medium text-slate-900 text-sm">QC Inspection Required</p><p className="text-xs text-slate-500">Every lens must pass QC before pickup</p></div>
            <button onClick={() => setQcInspection(!qcInspection)} className={`relative w-11 h-6 rounded-full transition-colors ${qcInspection ? "bg-violet-600" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${qcInspection ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Lab configuration")} className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 shadow-lg shadow-amber-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Security */}
      <Modal isOpen={modal === "security"} onClose={() => setModal(null)} title="Privacy & Security">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Current Password</label><div className="relative"><input type={showPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 pr-10" placeholder="Enter current password" /><button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">New Password</label><input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" placeholder="Enter new password" /></div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div><p className="font-medium text-slate-900 text-sm">Two-Factor Authentication</p><p className="text-xs text-slate-500">Add an extra layer of security</p></div>
            <button onClick={() => setTwoFactor(!twoFactor)} className={`relative w-11 h-6 rounded-full transition-colors ${twoFactor ? "bg-amber-600" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${twoFactor ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Security settings")} className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 shadow-lg shadow-amber-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Display */}
      <Modal isOpen={modal === "display"} onClose={() => setModal(null)} title="Display & Theme">
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div><p className="font-medium text-slate-900 text-sm">Dark Mode</p><p className="text-xs text-slate-500">Switch between light and dark themes</p></div>
            <button onClick={() => setDarkMode(!darkMode)} className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-cyan-600" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50">
              <option>English</option><option>French</option><option>Arabic</option><option>Portuguese</option>
            </select>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Dashboard Layout</label>
            <div className="flex gap-2">
              {["Compact", "Comfortable", "Spacious"].map((l) => (
                <button key={l} onClick={() => setLayout(l)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${layout === l ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Display settings")} className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 shadow-lg shadow-amber-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Regional */}
      <Modal isOpen={modal === "regional"} onClose={() => setModal(null)} title="Regional Settings">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50">
              <option>Africa/Lagos</option><option>Africa/Nairobi</option><option>Africa/Cairo</option><option>Africa/Johannesburg</option>
            </select>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/50">
              <option>NGN (₦)</option><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option>
            </select>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Date Format</label>
            <div className="flex gap-2">
              {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((f) => (
                <button key={f} onClick={() => setDateFormat(f)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${dateFormat === f ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Regional settings")} className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 shadow-lg shadow-amber-200">Save Changes</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
