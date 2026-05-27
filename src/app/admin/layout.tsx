"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Building2, Settings2, ShieldCheck, 
  BarChart3, Headphones, Wallet, Bell, Search, 
  Menu, X, ChevronRight, LogOut, User,
  Database, ShieldAlert, Globe, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Clinics", href: "/admin/clinics", icon: Building2 },
  { name: "Healthcare Config", href: "/admin/config", icon: Database },
  { name: "Financials", href: "/admin/finance", icon: Wallet },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Support", href: "/admin/support", icon: Headphones },
  { name: "Security & Audit", href: "/admin/security", icon: ShieldAlert },
  { name: "System Control", href: "/admin/settings", icon: Settings2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const pathname = usePathname();

  // Close sidebar on mobile when navigating
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden relative">
      {/* Mobile Sidebar Backdrop */}
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

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-[100] w-[280px] bg-brand-navy text-white transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-50",
          !isSidebarOpen && "lg:w-20"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between shrink-0 h-20">
            <Link href="/admin/dashboard" className={cn("flex items-center gap-2 transition-all", !isSidebarOpen && "lg:opacity-0 lg:pointer-events-none")}>
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center shrink-0">
                <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
              </div>
              <span className="text-xl font-bold tracking-tight whitespace-nowrap">
                Vemtap<span className="text-brand-blue">Admin</span>
              </span>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white/50 hover:text-white p-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
            {sidebarLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                    isActive 
                      ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20 font-bold" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <link.icon size={22} className={cn("shrink-0", isActive ? "text-white" : "group-hover:text-brand-blue transition-colors")} />
                  <span className={cn("transition-opacity duration-300", !isSidebarOpen && "lg:hidden")}>
                    {link.name}
                  </span>
                  {!isSidebarOpen && (
                    <div className="hidden lg:group-hover:block absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
                      {link.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 shrink-0 bg-brand-navy/50">
            <Link href="/login" className={cn("flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all group", !isSidebarOpen && "lg:justify-center")}>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                <User size={20} className="text-brand-blue" />
              </div>
              <div className={cn("flex-1 min-w-0 transition-all", !isSidebarOpen && "lg:hidden")}>
                <p className="text-sm font-bold truncate">Super Admin</p>
                <p className="text-[10px] text-white/40 truncate">admin@vemtap.com</p>
              </div>
              <LogOut size={18} className={cn("text-white/40 group-hover:text-red-400 transition-colors shrink-0", !isSidebarOpen && "lg:hidden")} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-40">
          <div className="flex items-center gap-2 lg:gap-4 flex-1">
            <button 
              onClick={() => {
                console.log("Mobile menu triggered");
                setIsSidebarOpen(true);
              }}
              className="p-3 hover:bg-slate-100 rounded-xl transition-all lg:hidden relative z-[110] active:scale-95 bg-slate-50 border border-slate-100 shadow-sm"
              aria-label="Open Menu"
            >
              <Menu size={24} className="text-brand-navy" />
            </button>
            
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors hidden lg:block"
            >
              <Menu size={20} className="text-slate-500" />
            </button>
            
            {/* Search - Responsive */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl w-full max-w-xs lg:max-w-md group focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
              <Search size={16} className="text-slate-400 group-focus-within:text-brand-blue transition-colors shrink-0" />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="bg-transparent border-none outline-none text-xs lg:text-sm w-full text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            <button className="relative p-2 hover:bg-slate-50 rounded-xl transition-colors group">
              <Bell size={20} className="text-slate-500 group-hover:text-brand-blue transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="w-px h-8 bg-slate-200 mx-1 lg:mx-2 hidden xs:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-brand-navy">Vemtap Super</p>
                <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">System Owner</p>
              </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-brand-soft-blue flex items-center justify-center text-brand-blue font-black text-xs lg:text-sm border border-brand-blue/10">
                VS
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
