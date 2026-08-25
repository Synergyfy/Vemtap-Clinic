"use client";

import React from "react";
import { useQueueStore, type DisplayMode } from "@/store/queueStore";
import { cn } from "@/lib/utils";
import { Monitor, Tv, Eye, EyeOff, Pill, ScanEye } from "lucide-react";

const modes: { mode: DisplayMode; label: string; icon: React.ElementType; desc: string }[] = [
  { mode: 'tv', label: 'TV Display', icon: Tv, desc: 'Main waiting room display' },
  { mode: 'reception', label: 'Reception', icon: Monitor, desc: 'Front desk monitor' },
  { mode: 'doctor-room', label: 'Doctor Room', icon: ScanEye, desc: 'In-room doctor display' },
  { mode: 'optical', label: 'Optical', icon: Eye, desc: 'Optical pickup display' },
  { mode: 'pharmacy', label: 'Pharmacy', icon: Pill, desc: 'Pharmacy pickup display' },
];

export const DisplayModeSelector = ({ compact }: { compact?: boolean }) => {
  const activeMode = useQueueStore((s) => s.activeDisplayMode);
  const setDisplayMode = useQueueStore((s) => s.setDisplayMode);

  if (compact) {
    return (
      <div className="flex gap-1.5">
        {modes.map((m) => (
          <button
            key={m.mode}
            onClick={() => setDisplayMode(m.mode)}
            className={cn(
              "p-2 rounded-xl border transition-all",
              activeMode === m.mode
                ? "bg-sky-600 border-sky-600 text-white shadow"
                : "bg-white border-slate-200 text-slate-500 hover:border-sky-200 hover:text-sky-600"
            )}
            title={m.desc}
          >
            <m.icon size={16} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {modes.map((m) => (
        <button
          key={m.mode}
          onClick={() => setDisplayMode(m.mode)}
          className={cn(
            "p-4 rounded-2xl border text-left transition-all",
            activeMode === m.mode
              ? "bg-sky-600 border-sky-600 text-white shadow-xl shadow-sky-600/20"
              : "bg-white border-slate-100 text-slate-600 hover:border-sky-200 hover:shadow-md"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
            activeMode === m.mode ? "bg-white/20" : "bg-slate-50"
          )}>
            <m.icon size={20} className={activeMode === m.mode ? "text-white" : "text-slate-500"} />
          </div>
          <p className="text-sm font-black">{m.label}</p>
          <p className={cn(
            "text-[9px] font-medium mt-0.5",
            activeMode === m.mode ? "text-white/70" : "text-slate-400"
          )}>{m.desc}</p>
        </button>
      ))}
    </div>
  );
};
