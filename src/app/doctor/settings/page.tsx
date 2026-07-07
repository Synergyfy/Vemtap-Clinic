import React from "react";
import { PageHeader } from "@/app/clinic/_components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2, User, Bell, Shield, Globe } from "lucide-react";

export default function DoctorSettings() {
  const sections = [
    { title: "Profile Information", icon: User, desc: "Manage your personal details and professional bio." },
    { title: "Consultation Settings", icon: Settings2, desc: "Configure examination templates and defaults." },
    { title: "Notifications", icon: Bell, desc: "Manage alerts for appointments and patient messages." },
    { title: "Security", icon: Shield, desc: "Update your password and 2FA settings." },
    { title: "Language & Region", icon: Globe, desc: "Set your preferred language and timezone." },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account preferences, professional profile, and consultation defaults."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((s, i) => (
          <Card key={i} className="hover:border-emerald-200 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                <s.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{s.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
