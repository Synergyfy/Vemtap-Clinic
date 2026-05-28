"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Calendar, Clock, 
  Wallet, Headphones, Settings2, Bell, Search, 
  Menu, X, User, Database, Eye, Package, LogOut,
  UserCog, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";

const sidebarLinks = [
  { name: "Dashboard", href: "/clinic/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/clinic/patients", icon: Users },
  { name: "Appointments", href: "/clinic/appointments", icon: Calendar },
  { name: "Queue Management", href: "/clinic/queue", icon: Clock },
  { name: "Optical Orders", href: "/clinic/optical", icon: Eye },
  { name: "Pharmacy", href: "/clinic/pharmacy", icon: Package },
  { name: "Finance", href: "/clinic/finance", icon: Wallet },
  { name: "HMO Management", href: "/clinic/hmo", icon: Database },
  { name: "Staff Management", href: "/clinic/staff", icon: UserCog },
  { name: "Branch Management", href: "/clinic/branches", icon: Building2 },
  { name: "Support", href: "/clinic/support", icon: Headphones },
  { name: "Settings", href: "/clinic/settings", icon: Settings2 },
];

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const logout = () => {
    try {
      const keysToRemove = [
        "vemtap:session",
        "vemtap:clinic",
        "vemtap:user",
        "vemtap_auth",
        "authToken",
        "token",
      ];
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {
      // ignore storage errors (e.g., disabled storage)
    }
    setIsLogoutOpen(false);
    router.replace("/login");
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
          <div className="p-6 flex items-center justify-between shrink-0 h-20">
            <Link href="/clinic/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shrink-0">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight">Clinic<span className="text-sky-500">Hub</span></span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive 
                      ? "bg-sky-600 text-white font-bold" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <link.icon size={22} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 font-bold">
                CA
              </div>
              <div>
                <p className="text-sm font-bold">Clinic Admin</p>
                <p className="text-[10px] text-white/50">Active Branch</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
            <Menu size={24} className="text-slate-700" />
          </button>
          <div className="flex-1" />
          <button className="relative p-2 hover:bg-slate-100 rounded-xl" aria-label="Notifications">
            <Bell size={20} className="text-slate-500" />
          </button>
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="ml-2 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            aria-label="Log out"
          >
            <LogOut size={16} className="text-slate-500" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>

      <Modal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} title="Log out">
        <p className="text-sm text-slate-600">Are you sure you want to log out?</p>
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
