"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQueueStore, getQueueTypeLabel, type QueueType, type Priority, type QueueStatus } from "@/store/queueStore";
import { DoctorRoomStatus } from "./DoctorRoomStatus";
import {
  Users, Clock, UserCheck, AlertCircle, Timer,
  ArrowRight, Volume2, Monitor, Stethoscope
} from "lucide-react";
import { DisplayModeSelector } from "./DisplayModeSelector";

const priorityStyles: Record<Priority, string> = {
  Normal: 'bg-slate-100 text-slate-600',
  High: 'bg-amber-100 text-amber-700',
  Emergency: 'bg-rose-100 text-rose-700 animate-pulse',
};

const statusStyles: Record<QueueStatus, string> = {
  Waiting: 'bg-slate-200 text-slate-700',
  'In Progress': 'bg-sky-200 text-sky-800',
  Verifying: 'bg-amber-200 text-amber-800',
  Completed: 'bg-emerald-200 text-emerald-800',
  Called: 'bg-violet-200 text-violet-800',
  'No Show': 'bg-rose-200 text-rose-800',
};

const queueTypes: { type: QueueType | 'all'; label: string }[] = [
  { type: 'all', label: 'All Queues' },
  { type: 'consultation', label: 'Consultation' },
  { type: 'eye-test', label: 'Eye Test' },
  { type: 'optical', label: 'Optical' },
  { type: 'lens-pickup', label: 'Lens Pickup' },
  { type: 'pharmacy', label: 'Pharmacy' },
  { type: 'emergency', label: 'Emergency' },
];

export const QueueDisplayBoard = ({ fullScreen }: { fullScreen?: boolean }) => {
  const entries = useQueueStore((s) => s.entries);
  const rooms = useQueueStore((s) => s.rooms);
  const announcements = useQueueStore((s) => s.announcements);
  const selectedQueueType = useQueueStore((s) => s.selectedQueueType);
  const setSelectedQueueType = useQueueStore((s) => s.setSelectedQueueType);
  const activeDisplayMode = useQueueStore((s) => s.activeDisplayMode);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentAnnouncementIdx, setCurrentAnnouncementIdx] = useState(0);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return;
    const interval = setInterval(() => {
      setCurrentAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  useEffect(() => {
    const splash = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(splash);
  }, []);

  const activeEntries = entries.filter((e) => e.status !== 'Completed' && e.status !== 'No Show');
  const filtered = selectedQueueType === 'all'
    ? activeEntries
    : activeEntries.filter((e) => e.queueType === selectedQueueType);

  const nowServing = filtered.filter((e) => e.status === 'In Progress' || e.status === 'Called');
  const waiting = filtered.filter((e) => e.status === 'Waiting' || e.status === 'Verifying');

  const stats = {
    total: activeEntries.length,
    inProgress: entries.filter((e) => e.status === 'In Progress').length,
    waiting: entries.filter((e) => e.status === 'Waiting').length,
    avgWait: Math.round(
      entries.filter((e) => e.status === 'Waiting').reduce((sum, e) => sum + e.waitTimeMinutes, 0) /
      Math.max(1, entries.filter((e) => e.status === 'Waiting').length)
    ),
  };

  const isTvMode = activeDisplayMode === 'tv';
  const isDoctorMode = activeDisplayMode === 'doctor-room';
  const isOpticalMode = activeDisplayMode === 'optical';
  const isPharmacyMode = activeDisplayMode === 'pharmacy';

  const getModeFilter = () => {
    switch (activeDisplayMode) {
      case 'doctor-room': return ['consultation', 'eye-test', 'emergency'];
      case 'optical': return ['optical', 'lens-pickup'];
      case 'pharmacy': return ['pharmacy'];
      default: return null;
    }
  };

  const modeFilter = getModeFilter();
  const displayEntries = modeFilter
    ? filtered.filter((e) => modeFilter.includes(e.queueType))
    : filtered;

  const tvFontSize = fullScreen ? 'text-lg' : 'text-sm';
  const tvHeaderSize = fullScreen ? 'text-xl' : 'text-base';

  return (
    <div className={cn(
      "min-h-screen",
      isTvMode && "bg-slate-50 text-slate-900",
      !isTvMode && "bg-slate-50 text-slate-900"
    )}>
      {isTvMode && (
        <div className="fixed inset-0 flex flex-col p-6 md:p-10 overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/30">
                <Monitor size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">Vemtap Eye Clinic</h1>
                <p className="text-sm text-slate-500 font-medium">Patient Queue Display</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAnnouncementIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl"
                >
                  <Volume2 size={16} />
                  <span className="text-sm font-bold">{announcements[currentAnnouncementIdx]}</span>
                </motion.div>
              </AnimatePresence>
              <div className="text-right">
                <p className="text-3xl font-black tabular-nums text-slate-900">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-4 mb-5 shrink-0">
            {[
              { label: 'Total in Queue', value: stats.total, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
              { label: 'Currently Serving', value: stats.inProgress, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
              { label: 'Waiting', value: stats.waiting, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
              { label: 'Avg Wait Time', value: `${stats.avgWait}m`, icon: Timer, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
            ].map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                key={stat.label}
                className={cn("rounded-2xl p-4 border flex items-center gap-4", stat.bg)}
              >
                <stat.icon size={24} className={stat.color} />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Queue type tabs */}
          <div className="flex gap-2 mb-4 shrink-0 overflow-x-auto">
            {queueTypes.map((qt) => (
              <button
                key={qt.type}
                onClick={() => setSelectedQueueType(qt.type)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border",
                  selectedQueueType === qt.type
                    ? "bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-600/20"
                    : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600"
                )}
              >
                {qt.label}
              </button>
            ))}
          </div>

          {/* Main content — grid fills remaining height */}
          <div className="flex-1 grid grid-cols-3 gap-5 min-h-0">
            {/* Now Serving */}
            <div className="col-span-1 flex flex-col min-h-0">
              <h2 className="font-black text-slate-400 text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 pb-2">
                <UserCheck size={16} /> Now Serving
              </h2>
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 pb-1">
                <AnimatePresence>
                  {nowServing.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 rounded-2xl bg-white border border-slate-100 text-center shadow-sm"
                    >
                      <p className="text-slate-400 font-medium">No active consultations</p>
                    </motion.div>
                  )}
                  {nowServing.map((entry, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.05 }}
                      key={entry.id}
                      className={cn(
                        "rounded-2xl p-4 border relative overflow-hidden shadow-sm",
                        entry.priority === 'Emergency'
                          ? "bg-gradient-to-r from-rose-500 to-red-500 border-rose-400"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400"
                      )}
                    >
                      {entry.priority === 'Emergency' && (
                        <div className="absolute top-2 right-2">
                          <AlertCircle size={16} className="text-white/70 animate-pulse" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-14 h-14 bg-white/25 rounded-xl flex items-center justify-center">
                          <span className="text-xl font-black text-white">{entry.ticketNumber}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-black text-white truncate">{entry.patientName}</p>
                          <p className="text-sm text-white/80">{entry.assignedDoctor || entry.station}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-white/90">
                        <span className="bg-white/25 px-2.5 py-0.5 rounded-full font-bold">{getQueueTypeLabel(entry.queueType)}</span>
                        <span className="font-medium">{entry.waitTime}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Doctor Rooms */}
            <div className="col-span-1 flex flex-col min-h-0">
              <h2 className="font-black text-slate-400 text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 pb-2">
                <Stethoscope size={16} /> Doctor Rooms
              </h2>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1 pb-1">
                {rooms.map((room, i) => {
                  const isOccupied = room.status === 'occupied';
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={room.roomId}
                      className={cn(
                        "rounded-xl p-3 border",
                        isOccupied
                          ? "bg-sky-50 border-sky-200"
                          : "bg-white border-slate-100"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-bold text-slate-900">{room.doctorName}</p>
                        <div className="flex items-center gap-1.5">
                          <div className={cn("w-2 h-2 rounded-full", isOccupied ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                          <span className={cn("text-[10px] font-bold", isOccupied ? "text-emerald-600" : "text-slate-400")}>
                            {isOccupied ? 'Occupied' : 'Available'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{room.roomName}</span>
                        <span>{room.queueCount} waiting</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Waiting Queue */}
            <div className="col-span-1 flex flex-col min-h-0">
              <h2 className="font-black text-slate-400 text-xs uppercase tracking-widest flex items-center gap-2 shrink-0 pb-2">
                <Clock size={16} /> Waiting Queue
              </h2>
              <div className="flex-1 space-y-2 overflow-y-auto pr-1 pb-1">
                <AnimatePresence>
                  {waiting.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 rounded-2xl bg-white border border-slate-100 text-center shadow-sm"
                    >
                      <p className="text-slate-400 font-medium">Queue is empty</p>
                    </motion.div>
                  )}
                  {waiting.map((entry, i) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      key={entry.id}
                      className={cn(
                        "rounded-xl p-3 border flex items-center gap-3 transition-colors shadow-sm",
                        entry.priority === 'Emergency'
                          ? "bg-rose-50 border-rose-200"
                          : entry.priority === 'High'
                          ? "bg-amber-50 border-amber-200"
                          : "bg-white border-slate-100"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black shrink-0",
                        entry.priority === 'Emergency' ? 'bg-rose-500 text-white' :
                        entry.priority === 'High' ? 'bg-amber-500 text-white' :
                        'bg-slate-900 text-white'
                      )}>
                        {entry.ticketNumber.split('-')[1]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-2">
                          {entry.patientName}
                          {entry.priority !== 'Normal' && (
                            <span className={cn(
                              "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full",
                              entry.priority === 'Emergency' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                            )}>
                              {entry.priority}
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{getQueueTypeLabel(entry.queueType)}</span>
                          <span>•</span>
                          <span>{entry.waitTime}</span>
                          <span>•</span>
                          <span>{entry.patientType}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <ArrowRight size={14} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="shrink-0 mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="font-medium text-slate-500">Powered by Vemtap Health</span>
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> System Online</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Queue updated in real-time</span>
              <span className="font-black text-slate-600">{entries.length} patients today</span>
            </div>
          </div>
        </div>
      )}

      {!isTvMode && (
        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Queue Display</h1>
              <p className="text-slate-500 font-medium text-sm">Monitor patient flow in real-time.</p>
            </div>
            <div className="flex items-center gap-3">
              <DisplayModeSelector compact />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Total in Queue', value: stats.total, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'Serving', value: stats.inProgress, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Waiting', value: stats.waiting, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Avg Wait', value: `${stats.avgWait}m`, icon: Timer, color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map((stat, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                key={stat.label}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg, stat.color)}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-lg sm:text-xl font-black text-slate-900">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Doctor Rooms */}
          <DoctorRoomStatus />

          {/* Queue Type Filter + Display */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4 overflow-x-auto">
              {queueTypes.map((qt) => (
                <button
                  key={qt.type}
                  onClick={() => setSelectedQueueType(qt.type)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    selectedQueueType === qt.type
                      ? "bg-slate-900 text-white shadow"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}
                >
                  {qt.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ticket</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Wait</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {displayEntries.map((entry, i) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      key={entry.id}
                      className={cn(
                        "hover:bg-slate-50 transition-colors",
                        entry.priority === 'Emergency' && "bg-rose-50/50"
                      )}
                    >
                      <td className="px-4 py-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black",
                          entry.priority === 'Emergency'
                            ? "bg-rose-600 text-white"
                            : "bg-slate-900 text-white"
                        )}>
                          {entry.ticketNumber.split('-')[1]}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          {entry.patientName}
                          {entry.priority !== 'Normal' && (
                            <span className={cn(
                              "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full",
                              priorityStyles[entry.priority]
                            )}>{entry.priority}</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-bold text-slate-700">{getQueueTypeLabel(entry.queueType)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-black text-slate-500">{entry.waitTime}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                          statusStyles[entry.status]
                        )}>{entry.status}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
