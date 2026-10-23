"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
};

export function NotificationBell({
  accentClass = "bg-sky-500",
  viewAllHref = "/clinic/settings",
  notifications = [],
}: {
  accentClass?: string;
  viewAllHref?: string;
  notifications?: NotificationItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const items = notifications.length
    ? notifications.slice(0, 5)
    : [
        {
          id: "demo-1",
          title: "Patient checked in",
          message: "Mrs. Grace Adeyemi has arrived for consultation.",
          createdAt: new Date().toISOString(),
          read: false,
        },
        {
          id: "demo-2",
          title: "Lens pickup ready",
          message: "Order #L-1042 is ready for collection.",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          read: true,
        },
        {
          id: "demo-3",
          title: "HMO claim updated",
          message: "Claim approval status has changed for B. Chidi.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
      ];

  const unreadCount = items.filter((item) => !item.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 sm:h-10 sm:w-10 sm:rounded-xl"
        aria-label="Notifications"
      >
        <Bell size={18} className="sm:h-5 sm:w-5" />
        {unreadCount > 0 && (
          <span className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${accentClass} ring-2 ring-white sm:right-2 sm:top-2 sm:h-2.5 sm:w-2.5`} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-[min(300px,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-[min(340px,calc(100vw-1.5rem))]"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3">
              <div>
                <p className="text-xs font-semibold text-slate-900 sm:text-sm">Notifications</p>
                <p className="text-[10px] text-slate-500 sm:text-xs">{unreadCount} unread</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-medium text-slate-500 hover:text-slate-700 sm:text-xs"
              >
                Close
              </button>
            </div>

            <div className="max-h-[240px] overflow-y-auto p-1.5 sm:max-h-[320px] sm:p-2">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-100 p-2.5 transition-colors hover:bg-slate-50 sm:p-3">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-slate-900 sm:text-sm">{item.title}</p>
                        <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs sm:leading-5">{item.message}</p>
                      </div>
                      {!item.read && <span className={`mt-1 h-2 w-2 rounded-full ${accentClass} sm:h-2.5 sm:w-2.5`} />}
                    </div>
                    <p className="mt-2 text-[9px] uppercase tracking-[0.15em] text-slate-400 sm:text-[10px]">
                      {new Date(item.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center sm:p-6">
                  <Bell className="mx-auto h-6 w-6 text-slate-300 sm:h-8 sm:w-8" />
                  <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">No notifications yet</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3">
              <Link href={viewAllHref} className="block text-center text-xs font-medium text-sky-700 hover:text-sky-800 sm:text-sm" onClick={() => setIsOpen(false)}>
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
