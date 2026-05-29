"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileText, 
  Glasses, 
  CreditCard 
} from "lucide-react";
import { motion } from "framer-motion";

const navigation = [
  { name: "Home", href: "/patient/dashboard", icon: LayoutDashboard },
  { name: "Appts", href: "/patient/appointments", icon: CalendarDays },
  { name: "Records", href: "/patient/records", icon: FileText },
  { name: "Optical", href: "/patient/optical", icon: Glasses },
  { name: "Billing", href: "/patient/billing", icon: CreditCard },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 lg:hidden safe-area-pb">
      <div className="grid h-full w-full grid-cols-5 font-medium">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-2 group ${
                isActive ? "text-teal-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <div className="relative p-1">
                <item.icon className="w-6 h-6 mb-1" />
                {isActive && (
                  <motion.div
                    layoutId="bubble"
                    className="absolute inset-0 bg-teal-100/50 rounded-full -z-10"
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
  );
}
