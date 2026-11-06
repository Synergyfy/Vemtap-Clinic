"use client";

import React from "react";
import Link from "next/link";
import { Activity, ArrowRight, Building2, CalendarDays, ShieldCheck, Users, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function ClinicDashboardPage() {
  const { user } = useAuth();

  const clinicName = user?.clinicName || "Your clinic";
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Clinic admin";

  const stats = [
    { label: "Patients today", value: "38", icon: Users },
    { label: "Appointments", value: "24", icon: CalendarDays },
    { label: "Revenue", value: "₦1.85M", icon: Wallet },
    { label: "Operations", value: "Healthy", icon: Activity },
  ];

  const quickActions = [
    { label: "Register patient", href: "/clinic/patients" },
    { label: "Queue", href: "/clinic/queue" },
    { label: "Appointments", href: "/clinic/appointments" },
    { label: "Finance", href: "/clinic/finance" },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-3 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
            <Building2 size={14} />
            {clinicName}
          </div>
          <h1 className="text-2xl font-black text-slate-900">Welcome back, {displayName}</h1>
          <p className="mt-1 text-sm text-slate-600">Clinic operations are active and ready for patient care.</p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
          <ShieldCheck size={16} />
          System online
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{label}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Icon size={18} />
              </div>
            </div>
            <div className="mt-4 text-2xl font-black text-slate-900">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900">Quick actions</h2>
            <Link href="/clinic/onboarding" className="text-sm font-bold text-sky-600">
              Review onboarding
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {quickActions.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-sky-50"
              >
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <ArrowRight size={16} className="text-slate-400 transition group-hover:text-sky-600" />
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Clinic status</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">Onboarding complete</div>
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Primary branch setup is active.</div>
            <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">HMO and finance modules are available.</div>
          </div>
        </div>
      </section>
    </div>
  );
}

