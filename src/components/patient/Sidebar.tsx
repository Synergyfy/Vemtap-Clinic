"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileText, 
  Glasses, 
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { usePatientStore } from "@/store/patientStore";

const navigation = [
  { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/patient/appointments", icon: CalendarDays },
  { name: "Medical Records", href: "/patient/records", icon: FileText },
  { name: "Optical Orders", href: "/patient/optical", icon: Glasses },
  { name: "Billing & HMO", href: "/patient/billing", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const resetStore = usePatientStore((state) => state.resetStore);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all your data to the initial state? This action cannot be undone.")) {
      resetStore();
      alert("Data has been reset successfully!");
    }
  };

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-800 bg-gray-900 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/patient/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Vemtap</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200 relative ${
                          isActive
                            ? "text-teal-400 bg-teal-500/10"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        }`}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 ${
                            isActive ? "text-teal-400" : "text-gray-500 group-hover:text-white"
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active"
                            className="absolute left-0 top-2 bottom-2 w-1 bg-teal-500 rounded-r-full"
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
              <ul role="list" className="-mx-2 space-y-2">
                <li>
                  <Link
                    href="/patient/profile"
                    className="group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-white" />
                    Settings
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleReset}
                    className="w-full group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors text-left"
                  >
                    <RefreshCw className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-amber-400" />
                    Reset Data
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => alert("Signing out...")}
                    className="w-full group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-red-400" />
                    Sign out
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
