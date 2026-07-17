"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, UserCircle, CheckCircle2, FileText, CalendarDays, Info, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatientStore, Notification } from "@/store/patientStore";
import { Modal } from "@/components/ui/modal";

const getIcon = (type: Notification['type']) => {
  switch (type) {
    case 'appointment': return { icon: CalendarDays, color: "text-teal-600", bg: "bg-teal-50" };
    case 'invoice': return { icon: FileText, color: "text-blue-600", bg: "bg-blue-50" };
    case 'prescription': return { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" };
    default: return { icon: Info, color: "text-gray-600", bg: "bg-gray-100" };
  }
};

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, markNotificationRead, markAllNotificationsRead } = usePatientStore();

  const handleLogout = () => {
    try {
      localStorage.removeItem("patient-portal-storage");
      sessionStorage.clear();
    } catch { /* ignore */ }
    setShowLogoutModal(false);
    router.replace("/login");
  };
  const unreadCount = notifications.filter(n => n.unread).length;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center flex-1">
          <h1 className="text-xl font-bold text-gray-900 md:hidden">Vemtap</h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-2 rounded-full transition-colors ${
                isNotificationsOpen
                  ? "bg-teal-50 text-teal-600"
                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
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
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllNotificationsRead}
                        className="text-xs text-teal-600 font-medium hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm py-8">No notifications yet.</p>
                    ) : (
                      notifications.map((notif) => {
                        const style = getIcon(notif.type);
                        const Icon = style.icon;
                        
                        return (
                          <div 
                            key={notif.id} 
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${
                              notif.unread ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
                              <Icon className={`w-5 h-5 ${style.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start gap-2">
                                <p className={`text-sm font-medium ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notif.title}
                                </p>
                                {notif.unread && (
                                  <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                              <p className="text-[11px] text-gray-400 mt-2 font-medium">{notif.time}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                    <button 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
            aria-hidden="true"
          />

          {/* Logout (mobile) */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center p-2 rounded-full transition-colors text-gray-400 hover:text-red-500 hover:bg-red-50 lg:hidden"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>

          {/* Profile */}
          <Link
            href="/patient/profile"
            className={`flex items-center p-2 rounded-full transition-colors ${
              pathname === "/patient/profile"
                ? "bg-teal-50 text-teal-600"
                : "text-gray-400 hover:text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="sr-only">Your profile</span>
            <UserCircle className="h-7 w-7" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Sign out">
        <p className="text-sm text-slate-600">Are you sure you want to sign out of your patient account?</p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setShowLogoutModal(false)}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700">
            Sign out
          </button>
        </div>
      </Modal>
    </header>
  );
}
