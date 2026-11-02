"use client";

import { useDeleteNotification, useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications, useUnreadCount } from "@/hooks/useNotifications";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();

  const notifications = Array.isArray(data as any) ? (data as any) : ((data as any)?.data ?? []);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500">{unreadCount} unread</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || notifications.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-base font-medium text-slate-700">No notifications yet</p>
          <p className="mt-1 text-sm text-slate-500">You’ll see system updates and patient messages here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification: any) => (
            <div
              key={notification.id}
              className={`rounded-2xl border bg-white p-4 shadow-sm transition ${notification.read ? "border-slate-200" : "border-sky-200 bg-sky-50/40"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                    )}
                    <h2 className="text-base font-semibold text-slate-900">{notification.title || "Notification"}</h2>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-slate-400">
                    {new Date(notification.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markRead.mutate(notification.id)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification.mutate(notification.id)}
                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                    aria-label={`Delete notification ${notification.title}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
