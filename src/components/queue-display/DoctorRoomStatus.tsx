"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQueueStore } from "@/store/queueStore";
import { Stethoscope, User, Clock } from "lucide-react";

export const DoctorRoomStatus = () => {
  const rooms = useQueueStore((s) => s.rooms);

  const statusConfig = {
    available: { label: 'Available', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', pulse: false },
    occupied: { label: 'Occupied', color: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', pulse: true },
    break: { label: 'On Break', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', pulse: false },
    offline: { label: 'Offline', color: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', pulse: false },
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Doctor Rooms</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rooms.map((room, i) => {
          const cfg = statusConfig[room.status];
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={room.roomId}
              className={cn(
                "rounded-2xl border p-4 transition-all",
                cfg.bg, cfg.border
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", cfg.bg)}>
                    <Stethoscope size={18} className={cfg.text} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{room.doctorName}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{room.roomName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full", cfg.color, cfg.pulse && "animate-pulse")} />
                  <span className={cn("text-[9px] font-black uppercase tracking-widest", cfg.text)}>{cfg.label}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <User size={12} />
                  <span className="font-bold">{room.currentPatient || '—'}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock size={11} />
                  <span className="font-black">{room.queueCount} waiting</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
