"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckCircle2, FileText, CalendarDays, Info, User, ArrowRightFromLine, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatientNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, usePatientProfile } from "@/hooks/usePatientPortal";
import { useAuth } from "@/lib/auth-context";
import { Modal } from "@/components/ui/modal";

const getIcon = (type: string) => {
  switch (type) {
    case 'appointment': return { icon: CalendarDays, color: "text-[#0055C4]", bg: "bg-[#E6F4FE]" };
    case 'invoice': return { icon: FileText, color: "text-blue-600", bg: "bg-blue-50" };
    case 'prescription': return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" };
    default: return { icon: Info, color: "text-gray-600", bg: "bg-gray-100" };
  }
};

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { data: profile } = usePatientProfile();
  const { data: notifications = [] } = usePatientNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const patientDisplayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim()
    || [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
    || profile?.email
    || user?.email
    || "Patient profile";

  const isFamilyMember = Boolean(
    user?.guardianId ||
    profile?.guardianId ||
    user?.guardianRelationship === 'guardian' ||
    profile?.guardianRelationship === 'guardian' ||
    user?.accountType === 'guardian' ||
    profile?.accountType === 'guardian'
  );
  const profileTypeLabel = isFamilyMember ? "Family profile" : "Patient profile";
  const profileStatusText = isFamilyMember
    ? `${(user?.guardianRelationship || profile?.guardianRelationship || 'family member').replace(/^./, (c) => c.toUpperCase())} profile • Linked`
    : "Primary profile • Active";

  const patientInitials = patientDisplayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "P";

  const handleLogout = () => {
    try {
      localStorage.removeItem("vemtap_patient_access_token");
      localStorage.removeItem("patient-portal-storage");
    } catch { /* ignore */ }
    setShowLogoutModal(false);
    router.replace("/patient/login");
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-[#E2EBF2] bg-white/95 backdrop-blur-md px-4 shadow-sm sm:px-6 lg:px-8">
      {/* Mobile Branding / Desktop Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 lg:hidden">
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
        </div>

        <div className="hidden lg:flex items-center gap-2.5">
          <span className="text-sm font-bold text-[#0F2942]">Clinic portal</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Profile Switcher Quick Pill */}
        <Link
          href="/patient/select-profile"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-[#F4F9FD] hover:bg-[#EBF4FE] text-[#0F2942] rounded-full border border-[#E2EBF2] transition-colors text-xs font-semibold"
          title="Switch active patient profile"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${isFamilyMember ? 'bg-violet-500' : 'bg-emerald-500'}`}></span>
          <span>{profileTypeLabel}</span>
          <span className="text-[#73889B] font-medium">• Switch</span>
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-2 rounded-full transition-colors ${
              isNotificationsOpen
                ? "bg-[#EBF4FE] text-[#0055C4]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
              >
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#F4F9FD]/60">
                  <h3 className="font-bold text-[#0F2942]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAllRead.mutate()}
                      className="text-xs text-[#0055C4] font-semibold hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-8">No notifications yet.</p>
                  ) : (
                    notifications.map((notif) => {
                      const style = getIcon(notif.type);
                      const Icon = style.icon;
                      
                      return (
                        <div 
                          key={notif.id} 
                          onClick={() => markRead.mutate(notif.id)}
                          className={`p-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${
                            !notif.isRead ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                            <Icon className={`w-4 h-4 ${style.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <p className={`text-sm font-semibold ${!notif.isRead ? 'text-[#0F2942]' : 'text-gray-700'}`}>
                                {notif.title}
                              </p>
                              {!notif.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#0055C4] mt-1.5 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                            <p className="text-[11px] text-gray-400 mt-1.5 font-medium">{notif.createdAt}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                
                <div className="p-3 border-t border-gray-100 bg-[#F4F9FD]/60">
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="w-full text-center text-xs font-semibold text-[#0055C4] hover:underline transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#0055C4]/20 transition-all cursor-pointer"
            aria-label="Profile menu"
          >
            <div className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm flex items-center justify-center bg-[#E6F4FE] text-[#0055C4] text-xs font-bold shrink-0">
              {patientInitials}
            </div>
            <span className="hidden md:block text-xs font-bold text-[#0F2942] truncate max-w-[140px]">
              {patientDisplayName === "Patient profile" ? "Profile" : patientDisplayName}
            </span>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right"
              >
                <div className="p-3.5 border-b border-gray-100 bg-[#F4F9FD]/70">
                  <p className="text-sm font-bold text-[#0F2942]">{patientDisplayName === "Patient profile" ? "Patient Profile" : patientDisplayName}</p>
                  <p className="text-xs text-[#0055C4] font-semibold mt-0.5">{user?.userId ? profileStatusText : "Profile not loaded"}</p>
                </div>
                <div className="p-2 space-y-1">
                  <Link
                    href="/patient/select-profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#F4F9FD] hover:text-[#0055C4] transition-colors"
                  >
                    <Users size={16} className="text-[#0055C4]" />
                    <span>Switch Family Profile</span>
                  </Link>
                  <Link
                    href="/patient/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-[#F4F9FD] hover:text-[#0055C4] transition-colors"
                  >
                    <User size={16} />
                    <span>Profile &amp; Settings</span>
                  </Link>
                  <button
                    onClick={() => { setIsProfileOpen(false); setShowLogoutModal(true); }}
                    className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <ArrowRightFromLine size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
    </header>
  );
}
