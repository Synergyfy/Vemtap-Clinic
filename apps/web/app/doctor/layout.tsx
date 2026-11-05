"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Calendar, Clock, 
  Headphones, Settings2, Bell, 
  Menu, X, LogOut, Stethoscope, ClipboardList, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav, type SidebarEntry } from "@/components/layout/sidebar-nav";
import { StaffTopHeader } from "@/components/layout/staff-top-header";
import { useAuth } from "@/lib/auth-context";

const doctorSidebarEntries: SidebarEntry[] = [
  {
    type: "link",
    item: { name: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  },
  {
    type: "group",
    group: {
      name: "Clinical Practice",
      icon: Stethoscope,
      items: [
        { name: "Consultation Queue", href: "/doctor/queue", icon: Clock },
        { name: "Patients Directory", href: "/doctor/patients", icon: Users },
        { name: "Appointments", href: "/doctor/appointments", icon: Calendar },
        { name: "Medical Records", href: "/doctor/records", icon: ClipboardList },
      ],
    },
  },
  {
    type: "link",
    item: { name: "Reports & Stats", href: "/doctor/reports", icon: BarChart3 },
  },
  {
    type: "link",
    item: { name: "Support", href: "/doctor/support", icon: Headphones },
  },
  {
    type: "link",
    item: { name: "Settings", href: "/doctor/settings", icon: Settings2 },
  },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutUser } = useAuth();

  const doctorDisplayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Doctor" : "Doctor";
  const doctorRoleLabel = user?.roles?.[0] ? user.roles[0].replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Doctor";

  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setIsLogoutOpen(false);
      router.replace("/login");
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden relative">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-[100] w-[280px] bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-50"
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-5 flex items-center justify-between shrink-0 h-20 border-b border-white/10">
            <Link href="/doctor/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0 shadow-xs border border-emerald-100">
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-extrabold tracking-tight text-white leading-tight">VEMTAP</span>
                <span className="text-[9px] font-bold tracking-[0.16em] text-emerald-400 uppercase leading-tight">DOCTOR HUB</span>
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <SidebarNav
            entries={doctorSidebarEntries}
            activeColor="bg-emerald-600"
            onNavigate={() => setIsSidebarOpen(false)}
          />

          <div className="p-4 border-t border-white/10 shrink-0">
            <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold">
                {doctorDisplayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-white">{doctorDisplayName}</p>
                <p className="truncate text-[10px] text-white/60">{user?.email || "doctor@clinic.com"}</p>
                <p className="truncate text-[10px] text-emerald-400 font-semibold">{doctorRoleLabel}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <StaffTopHeader
          portalSubtitle="DOCTOR HUB"
          dashboardHref="/doctor/dashboard"
          accentClass="bg-emerald-500"
          roleColor="text-emerald-600"
          settingsHref="/doctor/settings"
          profileHref="/profile"
          onLogoutClick={() => setIsLogoutOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </div>
      </main>

      <BottomNav 
        items={[
          { label: "Home", href: "/doctor/dashboard", icon: LayoutDashboard },
          { label: "Queue", href: "/doctor/queue", icon: Clock },
          { label: "Patients", href: "/doctor/patients", icon: Users },
        ]}
        moreItems={[
          { label: "Appts", href: "/doctor/appointments", icon: Calendar },
          { label: "Records", href: "/doctor/records", icon: ClipboardList },
          { label: "Reports", href: "/doctor/reports", icon: BarChart3 },
          { label: "Support", href: "/doctor/support", icon: Headphones },
          { label: "Settings", href: "/doctor/settings", icon: Settings2 },
        ]}
        activeColor="text-emerald-600"
      />

      <Modal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} title="Log out">
        <p className="text-sm text-slate-600">Are you sure you want to log out of the doctor portal?</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsLogoutOpen(false)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
          >
            Log out
          </button>
        </div>
      </Modal>
    </div>
  );
}
