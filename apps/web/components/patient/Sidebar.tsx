"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileText, 
  Glasses, 
  CreditCard,
  Settings,
  Users,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/modal";

const navigation = [
  { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/patient/appointments", icon: CalendarDays },
  { name: "Medical Records", href: "/patient/records", icon: FileText },
  { name: "Optical Orders", href: "/patient/optical", icon: Glasses },
  { name: "Billing & HMO", href: "/patient/billing", icon: CreditCard },
  { name: "Family Profiles", href: "/patient/select-profile", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    try {
      localStorage.removeItem("vemtap_patient_access_token");
      localStorage.removeItem("patient-portal-storage");
    } catch { /* ignore */ }
    setShowLogoutModal(false);
    router.replace("/patient/login");
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-[#E2EBF2] bg-white px-6 pb-4">
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center border-b border-[#F1F5F9]">
          <Link href="/patient/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0">
              <svg className="h-5 w-5 text-[#0055C4]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-extrabold tracking-tight text-[#0F2942] leading-tight">VEMTAP</span>
              <span className="text-[9px] font-bold tracking-[0.16em] text-[#0055C4] uppercase leading-tight">EYE CLINIC</span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/patient/dashboard" && pathname?.startsWith(item.href + "/"));
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200 relative ${
                          isActive
                            ? "text-[#0055C4] bg-[#EBF4FE]"
                            : "text-[#627B91] hover:text-[#0F2942] hover:bg-[#F4F9FD]"
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 ${
                            isActive ? "text-[#0055C4]" : "text-[#73889B] group-hover:text-[#0F2942]"
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-2 bottom-2 w-1 bg-[#0055C4] rounded-r-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            
            <li className="mt-auto">
              <ul role="list" className="-mx-2 space-y-1.5">
                <li>
                  <Link
                    href="/patient/profile"
                    className="group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-[#627B91] hover:text-[#0F2942] hover:bg-[#F4F9FD] transition-colors"
                  >
                    <Settings className="h-5 w-5 shrink-0 text-[#73889B] group-hover:text-[#0F2942]" />
                    Settings
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="group flex w-full gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5 shrink-0 text-rose-500" />
                    Sign Out
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Sign out">
        <p className="text-sm text-slate-600">Are you sure you want to sign out of your patient account?</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setShowLogoutModal(false)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors">
            Sign out
          </button>
        </div>
      </Modal>
    </div>
  );
}
