"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Activity, Info, CheckCircle, AlertTriangle } from "lucide-react";
import {
  usePatientNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  Notification,
} from "@/hooks/usePatientPortal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getNotifIcon(type: string) {
  switch (type) {
    case "appointment": return { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" };
    case "queue": return { icon: Activity, color: "text-amber-600", bg: "bg-amber-50" };
    case "prescription": return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" };
    case "billing": return { icon: Info, color: "text-purple-600", bg: "bg-purple-50" };
    case "hmo": return { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" };
    case "follow_up": return { icon: Bell, color: "text-teal-600", bg: "bg-teal-50" };
    default: return { icon: Bell, color: "text-gray-500", bg: "bg-gray-100" };
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = usePatientNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const handleMarkAll = () => {
    markAllRead.mutate();
  };

  const handleNotifClick = (notif: Notification) => {
    if (!notif.isRead) {
      markRead.mutate(notif.id);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Stay updated on your appointments and orders.
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-sm font-medium text-teal-600 hover:text-teal-700"
          onClick={handleMarkAll}
          disabled={markAllRead.isPending}
        >
          Mark all as read
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, idx) => {
            const { icon: Icon, color, bg } = getNotifIcon(notif.type);
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                onClick={() => handleNotifClick(notif)}
                className={`p-4 sm:p-5 rounded-2xl flex gap-4 transition-colors cursor-pointer border ${
                  notif.isRead ? "bg-white border-gray-100 hover:border-gray-200" : "bg-blue-50/30 border-blue-100 hover:bg-blue-50/50"
                }`}
              >
                <div className={`p-3 rounded-xl h-fit shrink-0 ${bg}`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold ${notif.isRead ? "text-gray-800" : "text-gray-900"}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm ${notif.isRead ? "text-gray-500" : "text-gray-700 font-medium"}`}>
                    {notif.message}
                  </p>
                </div>
                
                {!notif.isRead && (
                  <div className="flex items-center justify-center shrink-0 w-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
