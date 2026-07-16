"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings2, Bell, Shield, User, Globe, Moon, PackageSearch } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";

const settingsSections = [
  { title: "Profile Settings", description: "Update optical staff profile, license info, and contact details", icon: User, color: "text-amber-600", bg: "bg-amber-50" },
  { title: "Notification Preferences", description: "Configure alerts for new orders, low stock, and production updates", icon: Bell, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Lab Configuration", description: "Set production defaults, lens edger calibration, and QC parameters", icon: PackageSearch, color: "text-violet-600", bg: "bg-violet-50" },
  { title: "Privacy & Security", description: "Manage password, two-factor authentication, and session settings", icon: Shield, color: "text-rose-600", bg: "bg-rose-50" },
  { title: "Display & Theme", description: "Toggle dark mode, language preferences, and dashboard layout", icon: Moon, color: "text-cyan-600", bg: "bg-cyan-50" },
  { title: "Regional Settings", description: "Set timezone, currency, date format, and measurement units", icon: Globe, color: "text-indigo-600", bg: "bg-indigo-50" },
];

export default function OpticianSettings() {
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Settings" description="Manage optical hub preferences, lab configuration, and account settings." />

      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {settingsSections.map((s) => (
          <Card key={s.title}>
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
        <CardHeader><CardTitle>Optical Hub Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Staff ID</p>
              <p className="mt-1 font-bold text-slate-900">STAFF-002</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role</p>
              <p className="mt-1 font-bold text-slate-900">Chief Optometrist</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Department</p>
              <p className="mt-1 font-bold text-slate-900">Optical / Lab</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Branch</p>
              <p className="mt-1 font-bold text-slate-900">Vemtap Main</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p>
              <p className="mt-1 font-bold text-slate-900">s.danladi@vemtap.com</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Status</p>
              <p className="mt-1"><Badge className="bg-emerald-600 text-white">Active</Badge></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
