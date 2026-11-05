"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Menu,
  UserRound,
  Settings,
  CreditCard,
  Glasses,
  LogOut,
  X,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navigation = [
  { name: "Home", href: "/patient/dashboard", icon: LayoutDashboard },
  { name: "Appts", href: "/patient/appointments", icon: CalendarDays },
  { name: "Records", href: "/patient/records", icon: FileText },
  { name: "More", href: "#", icon: Menu, isMore: true },
];

const menuItems = [
  { name: "Optical Orders", href: "/patient/optical", icon: Glasses },
  { name: "Billing & HMO", href: "/patient/billing", icon: CreditCard },
  { name: "Switch Profile", href: "/patient/select-profile", icon: Users },
  { name: "Profile & Settings", href: "/patient/profile", icon: UserRound },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem("vemtap_patient_access_token");
      localStorage.removeItem("patient-portal-storage");
    } catch {
      // ignore
    }
    setIsMenuOpen(false);
    router.replace("/patient/login");
  };

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[55] bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
            />

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="fixed inset-x-0 bottom-16 z-[60] mx-auto w-[92%] max-w-md rounded-t-[28px] border border-slate-200 bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#0055c4] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">VEMTAP Menu</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1 p-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-[#e6f4fe] text-[#0055c4]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`rounded-xl p-2 ${
                          isActive
                            ? "bg-[#0055c4]/15 text-[#0055c4]"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <div className="rounded-xl bg-rose-100 p-2 text-rose-600">
                    <LogOut size={16} />
                  </div>
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white/95 backdrop-blur-md border-t border-[#EDF2F7] shadow-[0_-4px_20px_rgba(15,41,66,0.04)] lg:hidden pb-safe">
        <div className="grid h-full w-full grid-cols-4 font-medium max-w-md mx-auto">
          {navigation.map((item) => {
            const isActive = !item.isMore && (pathname === item.href || pathname?.startsWith(item.href + "/"));
            const Icon = item.icon;

            if (item.isMore) {
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  className={`inline-flex flex-col items-center justify-center px-2 group ${
                    isMenuOpen ? "text-[#0055c4]" : "text-[#73889B] hover:text-[#0F2942]"
                  }`}
                  aria-label="Open menu"
                >
                  <div className="relative p-1">
                    <Icon className="mb-0.5 h-5 w-5" />
                    {isMenuOpen && (
                      <motion.div
                        layoutId="bubble"
                        className="absolute inset-0 rounded-full bg-[#0055c4]/10 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`inline-flex flex-col items-center justify-center px-2 group ${
                  isActive ? "text-[#0055c4] font-bold" : "text-[#73889B] hover:text-[#0F2942]"
                }`}
              >
                <div className="relative p-1">
                  <Icon className="mb-0.5 h-5 w-5" />
                  {isActive && (
                    <motion.div
                      layoutId="bubble"
                      className="absolute inset-0 rounded-full bg-[#0055c4]/10 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
                <span className="text-[11px] font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
