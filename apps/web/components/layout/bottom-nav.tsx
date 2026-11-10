"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: BottomNavItem[];
  moreItems?: BottomNavItem[];
  activeColor?: string;
  onMoreClick?: () => void;
}

export function BottomNav({
  items,
  moreItems = [],
  activeColor = "text-emerald-600",
}: BottomNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const visibleItems = moreItems.length > 0 ? items.slice(0, 3) : items.slice(0, 4);
  const isMoreActive = moreItems.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[55] bg-slate-900/50 backdrop-blur-xs md:hidden"
            />

            {/* Bottom Sheet sliding up from the bottom */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[60] max-h-[82vh] rounded-t-[32px] border-t border-slate-200 bg-white shadow-2xl flex flex-col md:hidden pb-safe"
            >
              {/* Drag Handle & Header */}
              <div className="shrink-0 pt-2 pb-1.5 px-4 border-b border-slate-100 flex flex-col">
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Portal Stations</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Quick navigation & station shortcuts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                    aria-label="Close menu"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Grid / List of More Items */}
              <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-2 gap-1.5">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl text-[11px] font-semibold transition-all border",
                        isActive
                          ? "bg-sky-50 border-sky-200 text-sky-700 shadow-xs"
                          : "bg-slate-50/70 border-slate-100 text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                          isActive ? "bg-sky-600 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-100"
                        )}
                      >
                        <Icon size={13} />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Fixed Bottom Navigation Bar on Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] pb-safe">
        <div className="grid grid-cols-4 h-13 max-w-lg mx-auto">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/clinic/dashboard" && item.href !== "/reception/dashboard" && item.href !== "/doctor/dashboard" && item.href !== "/nurse/dashboard" && pathname.startsWith(item.href + "/"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive ? activeColor : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className={cn("text-[9.5px] font-medium tracking-tight", isActive && "font-bold")}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          {moreItems.length > 0 && (
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer",
                isMoreActive || isMenuOpen ? activeColor : "text-slate-400 hover:text-slate-600"
              )}
              aria-label="Open portal stations sheet"
            >
              <div className="relative">
                <Menu size={17} strokeWidth={isMoreActive || isMenuOpen ? 2.5 : 1.75} />
                {isMenuOpen && (
                  <motion.div
                    layoutId="bottom-nav-bubble"
                    className="absolute inset-0 -z-10 rounded-full bg-sky-100/70"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </div>
              <span className={cn("text-[10px] font-bold tracking-tight", (isMoreActive || isMenuOpen) && "font-black")}>
                More
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
