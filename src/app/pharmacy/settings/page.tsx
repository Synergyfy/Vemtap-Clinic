"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { User, Bell, Shield, Palette, Save, LogOut, ChevronRight } from "lucide-react";
import { PageHeader } from "@/app/clinic/_components/page-header";

const settingSections = [
  {
    icon: <User size={18} />,
    title: "Profile",
    description: "Pharm. Peter Okafor • PharmD, MPH",
    items: [
      { label: "Staff ID", value: "PH-2024-001" },
      { label: "Email", value: "peter.okafor@vemtap.com" },
      { label: "Phone", value: "+234 800 123 4567" },
      { label: "License No.", value: "PCN-0421-9876" },
      { label: "Role", value: "Senior Pharmacist" },
    ],
  },
  {
    icon: <Bell size={18} />,
    title: "Notifications",
    description: "Configure alert preferences",
    items: [
      { label: "Low Stock Alerts", value: "Enabled", type: "toggle" },
      { label: "Expiry Alerts", value: "Enabled (30 days)", type: "toggle" },
      { label: "New Prescription Alert", value: "Enabled", type: "toggle" },
      { label: "Purchase Order Updates", value: "Enabled", type: "toggle" },
    ],
  },
  {
    icon: <Shield size={18} />,
    title: "Security",
    description: "Password and authentication",
    items: [
      { label: "Password", value: "Last changed 2 months ago", action: "Change" },
      { label: "Two-Factor Auth", value: "Not enabled", action: "Enable" },
      { label: "Session Timeout", value: "15 minutes", action: "Change" },
    ],
  },
  {
    icon: <Palette size={18} />,
    title: "Preferences",
    description: "Customize your experience",
    items: [
      { label: "Default View", value: "Dashboard", action: "Change" },
      { label: "Items Per Page", value: "20", action: "Change" },
      { label: "Confirmation Dialogs", value: "Enabled", type: "toggle" },
    ],
  },
];

export default function PharmacySettings() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader title="Settings" description="Manage your pharmacy profile, notifications, security, and preferences."
        actions={[
          { label: "Save Changes", variant: "primary", onClick: handleSave },
        ]} />

      {saved && (
        <Card className="border-emerald-200 bg-emerald-50/80">
          <CardContent className="p-4 flex items-center gap-3">
            <Save size={18} className="text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">Settings saved successfully.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2">
        {settingSections.map((section, i) => (
          <Card key={i}>
            <CardHeader className="flex-row items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">{section.icon}</div>
              <div>
                <CardTitle className="text-base">{section.title}</CardTitle>
                <p className="text-xs text-slate-500">{section.description}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.items.map((item, j) => (
                <div key={j} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-700">{item.label}</span>
                  <div className="flex items-center gap-2">
                    {"type" in item && item.type === "toggle" ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.value.startsWith("Enabled") ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {item.value}
                      </span>
                    ) : "action" in item ? (
                      <button className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
                        {item.value} <ChevronRight size={12} />
                      </button>
                    ) : (
                      <span className="text-sm text-slate-900">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-rose-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-700"><LogOut size={18} /> Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Sign Out of Pharmacy Dashboard</p>
            <p className="text-xs text-slate-500">End your current pharmacy session.</p>
          </div>
          <button className="rounded-full bg-rose-600 px-5 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors">
            Sign Out
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
