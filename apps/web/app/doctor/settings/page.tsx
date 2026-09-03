"use client";

import React, { useState } from "react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Settings2, User, Bell, Shield, Globe, CheckCircle2, Eye, EyeOff, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DoctorSettings() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [consultOpen, setConsultOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [profile, setProfile] = useState({ name: "Dr. A. Bello", email: "a.bello@vemtap.com", phone: "+234 802 345 6789", license: "MED/OPTH/9876", specialization: "Ophthalmology", bio: "Consultant Ophthalmologist with 12 years of clinical experience specializing in cataract surgery and glaucoma management." });
  const [consultDefaults, setConsultDefaults] = useState({ template: "General Consultation", duration: "20", autoSave: true, showVitals: true });
  const [notifs, setNotifs] = useState({ newAppts: true, cancellations: true, followUps: true, messages: false, reports: true });
  const [security, setSecurity] = useState({ currentPw: "", newPw: "", confirmPw: "", twoFactor: false, showPw: false });
  const [lang, setLang] = useState({ language: "English (UK)", timezone: "Africa/Lagos", dateFormat: "DD/MM/YYYY", timeFormat: "12h" });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const sections = [
    { title: "Profile Information", icon: User, desc: "Manage your personal details and professional bio.", onClick: () => setProfileOpen(true) },
    { title: "Consultation Settings", icon: Settings2, desc: "Configure examination templates and defaults.", onClick: () => setConsultOpen(true) },
    { title: "Notifications", icon: Bell, desc: "Manage alerts for appointments and patient messages.", onClick: () => setNotifOpen(true) },
    { title: "Security", icon: Shield, desc: "Update your password and 2FA settings.", onClick: () => setSecurityOpen(true) },
    { title: "Language & Region", icon: Globe, desc: "Set your preferred language and timezone.", onClick: () => setLangOpen(true) },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      <PageHeader title="Settings" description="Manage your account preferences, professional profile, and consultation defaults." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
        {sections.map((s, i) => (
          <Card key={i} onClick={s.onClick} className="hover:border-emerald-200 transition-all cursor-pointer group">
            <CardContent className="p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors"><s.icon size={20} className="sm:w-6 sm:h-6" /></div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 1. Profile */}
      <Modal isOpen={profileOpen} onClose={() => setProfileOpen(false)} title="Profile Information">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-2xl">AB</div>
            <div><p className="text-lg font-black text-slate-900">{profile.name}</p><p className="text-xs text-slate-500">{profile.specialization}</p></div>
            <Badge className="ml-auto bg-emerald-100 text-emerald-700 border-none font-black text-[10px]">ACTIVE</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label><input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label><input value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label><input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">License</label><input value={profile.license} onChange={e => setProfile(p => ({ ...p, license: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
          </div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio</label><textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none" /></div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setProfileOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { showToast("Profile updated successfully!"); setProfileOpen(false); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200"><Save size={16} /> Save Changes</button>
          </div>
        </div>
      </Modal>

      {/* 2. Consultation */}
      <Modal isOpen={consultOpen} onClose={() => setConsultOpen(false)} title="Consultation Settings">
        <div className="space-y-4">
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Template</label><select value={consultDefaults.template} onChange={e => setConsultDefaults(p => ({ ...p, template: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none bg-white"><option>General Consultation</option><option>Eye Examination</option><option>Surgery Review</option><option>Follow-up Visit</option></select></div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Duration (mins)</label><input type="number" value={consultDefaults.duration} onChange={e => setConsultDefaults(p => ({ ...p, duration: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
          <div className="space-y-3 pt-2">
            {[{ k: "autoSave", label: "Auto-save consultation notes" }, { k: "showVitals", label: "Always show vitals panel" }].map(t => (
              <label key={t.k} className="flex items-center gap-3 cursor-pointer">
                <button onClick={() => setConsultDefaults(p => ({ ...p, [t.k as keyof typeof p]: !p[t.k as keyof typeof p] }))} className={cn("w-10 h-6 rounded-full relative transition-colors", consultDefaults[t.k as keyof typeof consultDefaults] ? "bg-emerald-600" : "bg-slate-200")}>
                  <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow", consultDefaults[t.k as keyof typeof consultDefaults] ? "left-5" : "left-1")} />
                </button>
                <span className="text-sm font-bold text-slate-700">{t.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setConsultOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { showToast("Consultation settings saved!"); setConsultOpen(false); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200"><Save size={16} /> Save</button>
          </div>
        </div>
      </Modal>

      {/* 3. Notifications */}
      <Modal isOpen={notifOpen} onClose={() => setNotifOpen(false)} title="Notification Preferences">
        <div className="space-y-4">
          {[
            { k: "newAppts" as const, label: "New Appointments", desc: "When a patient books a new appointment" },
            { k: "cancellations" as const, label: "Cancellations", desc: "When an appointment is cancelled or rescheduled" },
            { k: "followUps" as const, label: "Follow-ups Due", desc: "Daily reminder for pending follow-ups" },
            { k: "messages" as const, label: "Patient Messages", desc: "When a patient sends you a direct message" },
            { k: "reports" as const, label: "Weekly Reports", desc: "Weekly clinical summary & stats digest" },
          ].map(n => (
            <label key={n.k} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
              <div><p className="text-sm font-bold text-slate-900">{n.label}</p><p className="text-[10px] text-slate-500">{n.desc}</p></div>
              <button onClick={() => setNotifs(p => ({ ...p, [n.k]: !p[n.k] }))} className={cn("w-10 h-6 rounded-full relative transition-colors shrink-0", notifs[n.k] ? "bg-emerald-600" : "bg-slate-200")}>
                <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow", notifs[n.k] ? "left-5" : "left-1")} />
              </button>
            </label>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setNotifOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { showToast("Notification preferences updated!"); setNotifOpen(false); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200"><Save size={16} /> Save Preferences</button>
          </div>
        </div>
      </Modal>

      {/* 4. Security */}
      <Modal isOpen={securityOpen} onClose={() => setSecurityOpen(false)} title="Security Settings">
        <div className="space-y-4">
          <div className="relative space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
            <input type={security.showPw ? "text" : "password"} value={security.currentPw} onChange={e => setSecurity(p => ({ ...p, currentPw: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 pr-10" />
            <button onClick={() => setSecurity(p => ({ ...p, showPw: !p.showPw }))} className="absolute right-3 top-8 text-slate-400 hover:text-slate-600">{security.showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label><input type="password" value={security.newPw} onChange={e => setSecurity(p => ({ ...p, newPw: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password</label><input type="password" value={security.confirmPw} onChange={e => setSecurity(p => ({ ...p, confirmPw: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" /></div>
          </div>
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
            <div><p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p><p className="text-[10px] text-slate-500">Add an extra layer of security to your account</p></div>
            <button onClick={() => setSecurity(p => ({ ...p, twoFactor: !p.twoFactor }))} className={cn("w-10 h-6 rounded-full relative transition-colors shrink-0", security.twoFactor ? "bg-emerald-600" : "bg-slate-200")}>
              <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow", security.twoFactor ? "left-5" : "left-1")} />
            </button>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setSecurityOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { showToast("Security settings updated!"); setSecurityOpen(false); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200"><Save size={16} /> Update</button>
          </div>
        </div>
      </Modal>

      {/* 5. Language & Region */}
      <Modal isOpen={langOpen} onClose={() => setLangOpen(false)} title="Language & Region">
        <div className="space-y-4">
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Language</label><select value={lang.language} onChange={e => setLang(p => ({ ...p, language: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none bg-white"><option>English (UK)</option><option>English (US)</option><option>French</option><option>Arabic</option><option>Hausa</option><option>Yoruba</option><option>Igbo</option></select></div>
          <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timezone</label><select value={lang.timezone} onChange={e => setLang(p => ({ ...p, timezone: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none bg-white"><option>Africa/Lagos (WAT, UTC+1)</option><option>Africa/Abuja (WAT, UTC+1)</option><option>Europe/London (BST, UTC+1)</option><option>America/New_York (EST, UTC-5)</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Format</label><select value={lang.dateFormat} onChange={e => setLang(p => ({ ...p, dateFormat: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none bg-white"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Format</label><select value={lang.timeFormat} onChange={e => setLang(p => ({ ...p, timeFormat: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none bg-white"><option>12h (AM/PM)</option><option>24h</option></select></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setLangOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button onClick={() => { showToast("Language & region settings updated!"); setLangOpen(false); }} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200"><Save size={16} /> Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
