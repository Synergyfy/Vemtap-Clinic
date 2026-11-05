"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Calendar, Clock, 
  Wallet, Headphones, Settings2, Bell, Search, 
  Menu, X, Database, Eye, Package, LogOut,
  UserCog, Building2, BarChart3, ShoppingCart,
  ShieldCheck, FileText, Activity, ArrowLeftRight, Receipt, Network
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav, type SidebarEntry } from "@/components/layout/sidebar-nav";
import { StaffTopHeader } from "@/components/layout/staff-top-header";
import { useAuth } from "@/lib/auth-context";

const clinicSidebarEntries: SidebarEntry[] = [
  {
    type: "link",
    item: { name: "Dashboard", href: "/clinic/dashboard", icon: LayoutDashboard },
  },
  {
    type: "group",
    group: {
      name: "Clinical Operations",
      icon: Activity,
      items: [
        { name: "Patients Directory", href: "/clinic/patients", icon: Users },
        { name: "Appointments", href: "/clinic/appointments", icon: Calendar },
        { name: "Queue Management", href: "/clinic/queue", icon: Clock },
        { name: "Surgery Suite", href: "/clinic/surgery", icon: Activity },
      ],
    },
  },
  {
    type: "group",
    group: {
      name: "Pharmacy & Optical",
      icon: Package,
      items: [
        { name: "Optical Orders", href: "/clinic/optical", icon: Eye },
        { name: "Pharmacy Dispensary", href: "/clinic/pharmacy", icon: Package },
        { name: "POS Products", href: "/clinic/products", icon: ShoppingCart },
        { name: "Inventory Transfers", href: "/clinic/inventory-transfers", icon: ArrowLeftRight },
      ],
    },
  },
  {
    type: "group",
    group: {
      name: "Finance & HMO",
      icon: Wallet,
      items: [
        { name: "Financial Overview", href: "/clinic/finance", icon: Wallet },
        { name: "Debtors & Receivables", href: "/clinic/debtors", icon: Receipt },
        { name: "HMO Management", href: "/clinic/hmo", icon: Database },
        { name: "Claims & Processing", href: "/clinic/hmo-advanced", icon: ShieldCheck },
        { name: "HMO Integrations", href: "/clinic/hmo-integrations", icon: Network },
      ],
    },
  },
  {
    type: "group",
    group: {
      name: "Reports & Admin",
      icon: BarChart3,
      items: [
        { name: "Reports & Analytics", href: "/clinic/reports", icon: BarChart3 },
        { name: "Clinical Reporting", href: "/clinic/clinical-reporting", icon: FileText },
        { name: "Staff Management", href: "/clinic/staff", icon: UserCog },
        { name: "Branch Management", href: "/clinic/branches", icon: Building2 },
      ],
    },
  },
  {
    type: "link",
    item: { name: "Support", href: "/clinic/support", icon: Headphones },
  },
  {
    type: "link",
    item: { name: "Settings", href: "/clinic/settings", icon: Settings2 },
  },
];

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutUser } = useAuth();
  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "User" : "User";
  const displayEmail = user?.email || "";
  const roleLabel = user?.roles?.[0] ? user.roles[0].replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "";
  const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");

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
            <Link href="/clinic/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#EBF3FE] flex items-center justify-center shrink-0 shadow-xs border border-sky-100">
                <svg className="h-5 w-5 text-[#0055C4]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-extrabold tracking-tight text-white leading-tight">VEMTAP</span>
                <span className="text-[9px] font-bold tracking-[0.16em] text-sky-400 uppercase leading-tight">CLINIC HUB</span>
              </div>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <SidebarNav
            entries={clinicSidebarEntries}
            activeColor="bg-sky-600"
            onNavigate={() => setIsSidebarOpen(false)}
          />

          <div className="p-4 border-t border-white/10 shrink-0">
            <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 font-bold">
                {initials || "•"}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-white">{displayName || "User"}</p>
                <p className="truncate text-[10px] text-white/60">{displayEmail || "user@example.com"}</p>
                <p className="truncate text-[10px] text-white/40">{roleLabel || "Staff"}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <StaffTopHeader
          portalSubtitle="CLINIC HUB"
          dashboardHref="/clinic/dashboard"
          accentClass="bg-sky-500"
          roleColor="text-sky-600"
          settingsHref="/clinic/settings"
          profileHref="/profile"
          onLogoutClick={() => setIsLogoutOpen(true)}
        />

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-5 md:px-8 md:py-6 pb-20 md:pb-8">
          {children}
        </div>
      </main>

      <BottomNav 
        items={[
          { label: "Home", href: "/clinic/dashboard", icon: LayoutDashboard },
          { label: "Patients", href: "/clinic/patients", icon: Users },
          { label: "Queue", href: "/clinic/queue", icon: Clock },
        ]}
        moreItems={[
          { label: "Appts", href: "/clinic/appointments", icon: Calendar },
          { label: "Surgery", href: "/clinic/surgery", icon: Activity },
          { label: "Optical", href: "/clinic/optical", icon: Eye },
          { label: "Pharmacy", href: "/clinic/pharmacy", icon: Package },
          { label: "Products", href: "/clinic/products", icon: ShoppingCart },
          { label: "Finance", href: "/clinic/finance", icon: Wallet },
          { label: "HMO", href: "/clinic/hmo", icon: Database },
          { label: "Claims", href: "/clinic/hmo-advanced", icon: ShieldCheck },
          { label: "Reports", href: "/clinic/reports", icon: BarChart3 },
          { label: "Staff", href: "/clinic/staff", icon: UserCog },
          { label: "Branches", href: "/clinic/branches", icon: Building2 },
          { label: "Settings", href: "/clinic/settings", icon: Settings2 },
        ]}
        activeColor="text-sky-600"
      />

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
