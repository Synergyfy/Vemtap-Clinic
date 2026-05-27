import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/app/clinic/_components/page-header";

const settings = [
  { name: "Clinic profile", description: "Brand name, address, and contact information.", status: "Configured" },
  { name: "Branch & roles", description: "Staff roles, permissions, and branch setup.", status: "Configured" },
  { name: "Billing settings", description: "Invoice numbering, payment methods, and taxes.", status: "Attention" },
  { name: "Notifications", description: "Appointment reminders and SMS/email templates.", status: "Configured" },
  { name: "Integrations", description: "HMO, POS providers, and external systems.", status: "Not set" },
];

function statusBadge(status: string) {
  if (status === "Configured") return <Badge className="bg-emerald-600 text-white">Configured</Badge>;
  if (status === "Attention") return <Badge className="bg-amber-600 text-white">Needs review</Badge>;
  return <Badge variant="outline">Not set</Badge>;
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Clinic configuration, roles, and integrations."
        actions={[{ label: "HMO Management", href: "/clinic/hmo", variant: "primary" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {settings.map((s) => (
          <Card key={s.name}>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-xl">{s.name}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">{s.description}</p>
              </div>
              <div className="shrink-0">{statusBadge(s.status)}</div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                This section is ready for wiring to real configuration forms.
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
