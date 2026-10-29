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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const navigation = [
  { name: "Home", href: "/patient/dashboard", icon: LayoutDashboard },
  { name: "Appts", href: "/patient/appointments", icon: CalendarDays },
  { name: "Records", href: "/patient/records", icon: FileText },
  { name: "More", href: "#", icon: Menu, isMore: true },
];

const menuItems = [
  { name: "Optical", href: "/patient/optical", icon: Glasses },
  { name: "Billing", href: "/patient/billing", icon: CreditCard },
  { name: "Profile", href: "/patient/profile", icon: UserRound },
  { name: "Settings", href: "/patient/settings", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem("vemtap_patient_access_token");
    } catch {
      // ignore
    }
    setIsMenuOpen(false);
    router.replace("/login");
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
                <p className="text-sm font-bold text-slate-900">Menu</p>
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
                        isActive ? "bg-teal-50 text-teal-700" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`rounded-xl p-2 ${isActive ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"}`}>
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

      <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 lg:hidden safe-area-pb">
        <div className="grid h-full w-full grid-cols-4 font-medium">
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
                    isMenuOpen ? "text-teal-600" : "text-gray-500 hover:text-gray-900"
                  }`}
                  aria-label="Open menu"
                >
                  <div className="relative p-1">
                    <Icon className="mb-1 h-6 w-6" />
                    {isMenuOpen && (
                      <motion.div
                        layoutId="bubble"
                        className="absolute inset-0 rounded-full bg-teal-100/50 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs text-center">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`inline-flex flex-col items-center justify-center px-2 group ${
                  isActive ? "text-teal-600" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <div className="relative p-1">
                  <Icon className="mb-1 h-6 w-6" />
                  {isActive && (
                    <motion.div
                      layoutId="bubble"
                      className="absolute inset-0 rounded-full bg-teal-100/50 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-center">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
