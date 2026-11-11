"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Settings2, Bell, Shield, User, Globe, Moon, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { useAuth } from "@/lib/auth-context";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { api } from "@/lib/api";

type ModalKey = "profile" | "notifications" | "security" | "display" | "regional" | null;

const settingsSections = [
  {
    key: "profile" as const,
    title: "Profile Settings",
    description: "Update your name, contact information, and professional details",
    icon: User,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    key: "notifications" as const,
    title: "Notification Preferences",
    description: "Configure alerts for vitals reminders, monitoring updates, and follow-ups",
    icon: Bell,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "security" as const,
    title: "Privacy & Security",
    description: "Manage password, two-factor authentication, and session settings",
    icon: Shield,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    key: "display" as const,
    title: "Display & Theme",
    description: "Toggle dark mode, language preferences, and dashboard layout",
    icon: Moon,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    key: "regional" as const,
    title: "Regional Settings",
    description: "Set timezone, date format, and measurement units (metric/imperial)",
    icon: Globe,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function NurseSettings() {
  const [modal, setModal] = useState<ModalKey>(null);
  const [toast, setToast] = useState("");
  const [toastError, setToastError] = useState(false);
  const { user, updateProfile } = useAuth();
  const { prefs, save, isLoaded: prefsLoaded } = useUserPreferences();
  const [prefsHydrated, setPrefsHydrated] = useState(false);

  const liveDisplayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "User" : "User";
  const liveRoleLabel = user?.roles?.[0] ? user.roles[0].replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "";

  const [profileName, setProfileName] = useState(liveDisplayName);
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");

  useEffect(() => {
    setProfileName(liveDisplayName);
    setProfileEmail(user?.email || "");
    setProfilePhone(user?.phone || "");
  }, [liveDisplayName, user]);

  const [notifVitals, setNotifVitals] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);
  const [notifFollowups, setNotifFollowups] = useState(true);
  const [notifReports, setNotifReports] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [layout, setLayout] = useState("Compact");

  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [units, setUnits] = useState("Metric");

  const showToast = (msg: string, isError = false) => {
    setToastError(isError);
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    if (!prefsLoaded || prefsHydrated) return;
    setPrefsHydrated(true);

    const notifications = prefs["nurse.notifications"] as
      | { vitals?: boolean; alerts?: boolean; followups?: boolean; reports?: boolean }
      | undefined;
    if (notifications) {
      if (typeof notifications.vitals === "boolean") setNotifVitals(notifications.vitals);
      if (typeof notifications.alerts === "boolean") setNotifAlerts(notifications.alerts);
      if (typeof notifications.followups === "boolean") setNotifFollowups(notifications.followups);
      if (typeof notifications.reports === "boolean") setNotifReports(notifications.reports);
    }

    const securityPrefs = prefs["nurse.security"] as { twoFactor?: boolean } | undefined;
    if (securityPrefs && typeof securityPrefs.twoFactor === "boolean") setTwoFactor(securityPrefs.twoFactor);

    const displayPrefs = prefs["nurse.display"] as
      | { darkMode?: boolean; language?: string; layout?: string }
      | undefined;
    if (displayPrefs) {
      if (typeof displayPrefs.darkMode === "boolean") setDarkMode(displayPrefs.darkMode);
      if (typeof displayPrefs.language === "string") setLanguage(displayPrefs.language);
      if (typeof displayPrefs.layout === "string") setLayout(displayPrefs.layout);
    }

    const regionalPrefs = prefs["nurse.regional"] as
      | { timezone?: string; dateFormat?: string; units?: string }
      | undefined;
    if (regionalPrefs) {
      if (typeof regionalPrefs.timezone === "string") setTimezone(regionalPrefs.timezone);
      if (typeof regionalPrefs.dateFormat === "string") setDateFormat(regionalPrefs.dateFormat);
      if (typeof regionalPrefs.units === "string") setUnits(regionalPrefs.units);
    }
  }, [prefsLoaded, prefs, prefsHydrated]);

  const persist = async (patch: Record<string, any>, successMessage: string) => {
    try {
      await save(patch);
      showToast(successMessage);
      return true;
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Could not save settings. Please try again.", true);
      return false;
    }
  };

  const handleSave = async (label: string) => {
    if (label === "Profile") {
      const name = profileName.trim();
      if (!name) {
        showToast("Please enter your full name.", true);
        return;
      }
      const [firstName, ...rest] = name.split(/\s+/);
      try {
        await updateProfile({
          firstName,
          lastName: rest.join(" "),
          email: profileEmail.trim(),
          phone: profilePhone.trim(),
        });
        showToast("Profile updated successfully");
        setModal(null);
      } catch (err: any) {
        showToast(err?.response?.data?.message || "Could not update your profile.", true);
      }
      return;
    }

    if (label === "Notification preferences") {
      const saved = await persist(
        { "nurse.notifications": { vitals: notifVitals, alerts: notifAlerts, followups: notifFollowups, reports: notifReports } },
        "Notification preferences updated successfully",
      );
      if (saved) setModal(null);
      return;
    }

    if (label === "Security settings") {
      const wantsPasswordChange = Boolean(currentPw || newPw);
      if (wantsPasswordChange) {
        if (newPw.length < 6) {
          showToast("New password must be at least 6 characters.", true);
          return;
        }
        if (!currentPw) {
          showToast("Enter your current password to change it.", true);
          return;
        }
        try {
          await api.put("/auth/password", { currentPassword: currentPw, newPassword: newPw });
        } catch (err: any) {
          showToast(err?.response?.data?.message || "Could not update your password.", true);
          return;
        }
      }
      const saved = await persist(
        { "nurse.security": { twoFactor } },
        wantsPasswordChange ? "Password updated. Other sessions were signed out." : "Security settings updated successfully",
      );
      if (saved) {
        setCurrentPw("");
        setNewPw("");
        setModal(null);
      }
      return;
    }

    if (label === "Display settings") {
      const saved = await persist({ "nurse.display": { darkMode, language, layout } }, "Display settings updated successfully");
      if (saved) setModal(null);
      return;
    }

    if (label === "Regional settings") {
      const saved = await persist({ "nurse.regional": { timezone, dateFormat, units } }, "Regional settings updated successfully");
      if (saved) setModal(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] ${toastError ? "bg-rose-600 shadow-rose-200" : "bg-cyan-600 shadow-cyan-200"} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300`}>
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader
        title="Settings"
        description="Manage your nurse station preferences, profile, and account settings."
      />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {settingsSections.map((section) => (
          <Card
            key={section.key}
            onClick={() => setModal(section.key)}
            className="hover:border-cyan-200 transition-all cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${section.bg} ${section.color} shrink-0`}>
                  <section.icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900">{section.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Staff ID</p><p className="mt-1 font-bold text-slate-900">{user?.userId || ""}</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role</p><p className="mt-1 font-bold text-slate-900">{liveRoleLabel || ""}</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Department</p><p className="mt-1 font-bold text-slate-900">{user?.clinicId ? "Clinic" : ""}</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Branch</p><p className="mt-1 font-bold text-slate-900">{user?.clinicId || ""}</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p><p className="mt-1 font-bold text-slate-900">{profileEmail}</p></div>
            <div className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</p><div className="mt-1"><Badge className="bg-emerald-600 text-white">Active</Badge></div></div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Modal isOpen={modal === "profile"} onClose={() => setModal(null)} title="Profile Settings">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Full Name</label><input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" /></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email</label><input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" /></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Phone</label><input type="text" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Profile")} className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Notification Preferences */}
      <Modal isOpen={modal === "notifications"} onClose={() => setModal(null)} title="Notification Preferences">
        <div className="space-y-5">
          {[
            { label: "Vitals Reminders", desc: "Notify when patient vitals are due", val: notifVitals, set: setNotifVitals },
            { label: "Monitoring Alerts", desc: "Alert on critical patient changes", val: notifAlerts, set: setNotifAlerts },
            { label: "Follow-up Due", desc: "Remind when follow-ups are overdue", val: notifFollowups, set: setNotifFollowups },
            { label: "Daily Reports", desc: "Send end-of-shift summary", val: notifReports, set: setNotifReports },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div><p className="font-medium text-slate-900 text-sm">{n.label}</p><p className="text-xs text-slate-500">{n.desc}</p></div>
              <button onClick={() => n.set(!n.val)} className={`relative w-11 h-6 rounded-full transition-colors ${n.val ? "bg-cyan-600" : "bg-slate-200"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${n.val ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Notification preferences")} className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Privacy & Security */}
      <Modal isOpen={modal === "security"} onClose={() => setModal(null)} title="Privacy & Security">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Current Password</label><div className="relative"><input type={showPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 pr-10" placeholder="Enter current password" /><button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">New Password</label><input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50" placeholder="Enter new password" /></div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div><p className="font-medium text-slate-900 text-sm">Two-Factor Authentication</p><p className="text-xs text-slate-500">Add an extra layer of security</p></div>
            <button onClick={() => setTwoFactor(!twoFactor)} className={`relative w-11 h-6 rounded-full transition-colors ${twoFactor ? "bg-cyan-600" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${twoFactor ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Security settings")} className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Display & Theme */}
      <Modal isOpen={modal === "display"} onClose={() => setModal(null)} title="Display & Theme">
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
            <div><p className="font-medium text-slate-900 text-sm">Dark Mode</p><p className="text-xs text-slate-500">Switch between light and dark themes</p></div>
            <button onClick={() => setDarkMode(!darkMode)} className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-violet-600" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? "translate-x-5" : ""}`} />
            </button>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
              <option>English</option><option>French</option><option>Arabic</option><option>Portuguese</option>
            </select>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Dashboard Layout</label>
            <div className="flex gap-2">
              {["Compact", "Comfortable", "Spacious"].map((l) => (
                <button key={l} onClick={() => setLayout(l)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${layout === l ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Display settings")} className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200">Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* Regional Settings */}
      <Modal isOpen={modal === "regional"} onClose={() => setModal(null)} title="Regional Settings">
        <div className="space-y-5">
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
              <option>Africa/Lagos</option><option>Africa/Nairobi</option><option>Africa/Cairo</option><option>Africa/Johannesburg</option>
            </select>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Date Format</label>
            <div className="flex gap-2">
              {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((f) => (
                <button key={f} onClick={() => setDateFormat(f)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${dateFormat === f ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{f}</button>
              ))}
            </div>
          </div>
          <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Measurement Units</label>
            <div className="flex gap-2">
              {["Metric", "Imperial"].map((u) => (
                <button key={u} onClick={() => setUnits(u)} className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${units === u ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>{u}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModal(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => handleSave("Regional settings")} className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 shadow-lg shadow-cyan-200">Save Changes</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
