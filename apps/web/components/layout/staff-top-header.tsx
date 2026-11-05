"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, ChevronDown, User, Settings2, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useAuth } from "@/lib/auth-context";
import { useBranches } from "@/hooks/useBranches";
import { cn } from "@/lib/utils";

interface StaffTopHeaderProps {
  portalSubtitle?: string;
  dashboardHref: string;
  accentClass?: string;
  roleColor?: string;
  settingsHref?: string;
  profileHref?: string;
  onLogoutClick: () => void;
}

export function StaffTopHeader({
  portalSubtitle = "CLINIC HUB",
  dashboardHref,
  accentClass = "bg-sky-500",
  roleColor = "text-sky-600",
  settingsHref,
  profileHref,
  onLogoutClick,
}: StaffTopHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { data: branches = [] } = useBranches();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Compute user presentation values
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Staff Member"
    : "Staff Member";
  const displayEmail = user?.email || "";
  const roleRaw = user?.roles?.[0] || "Staff";
  const roleLabel = roleRaw.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "ST";

  // Active branch
  const activeBranch = branches.find((b: any) => b.id === user?.branchId) || branches[0];
  const branchName = activeBranch?.name || "Victoria Island Center";

  return (
    <header className="h-16 sm:h-20 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 md:px-8 shrink-0 z-40 shadow-xs">
      {/* LEFT: Victoria Island Center & Status */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100 text-[#0055C4] shadow-xs">
          <Building2 size={18} className="sm:w-5 sm:h-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#0F2942] truncate">
              {branchName}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold shrink-0 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden xs:inline">Clinic</span> Open
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:block truncate">
            {portalSubtitle}
          </span>
        </div>
      </div>

      {/* RIGHT: Notification + Avatar Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <NotificationBell accentClass={accentClass} viewAllHref="/notifications" />

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100/80 transition-all cursor-pointer ring-1 ring-slate-200/80 hover:ring-sky-200"
            aria-label="User account menu"
            aria-expanded={isProfileOpen}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 ring-2 ring-white">
              {initials}
            </div>
            <div className="hidden md:flex flex-col text-left pr-1 min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate max-w-[110px] leading-tight">
                {displayName.split(" ")[0]}
              </span>
              <span className={cn("text-[9px] font-bold uppercase tracking-wider leading-tight truncate", roleColor)}>
                {roleLabel}
              </span>
            </div>
            <ChevronDown
              size={13}
              className={cn("text-slate-400 transition-transform hidden sm:block mr-0.5", isProfileOpen && "rotate-180")}
            />
          </button>

          {/* User Dropdown Sheet */}
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right divide-y divide-slate-100"
              >
                {/* Header Profile Details */}
                <div className="p-4 bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold text-[9px] uppercase tracking-wide">
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Branch Info Strip */}
                <div className="px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 size={13} className="text-slate-400" />
                    <span>{branchName}</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>

                {/* Navigation links */}
                <div className="p-2 space-y-0.5">
                  {profileHref && (
                    <Link
                      href={profileHref}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-colors"
                    >
                      <User size={15} className="text-slate-400" />
                      <span>Staff Profile</span>
                    </Link>
                  )}
                  {settingsHref && (
                    <Link
                      href={settingsHref}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600 transition-colors"
                    >
                      <Settings2 size={15} className="text-slate-400" />
                      <span>Station Settings</span>
                    </Link>
                  )}
                </div>

                {/* Log Out Button */}
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLogoutClick();
                    }}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Log Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
