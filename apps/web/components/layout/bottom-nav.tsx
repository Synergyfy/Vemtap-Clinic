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
}

export function BottomNav({ items, moreItems = [], activeColor = "text-emerald-600" }: BottomNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const visibleItems = moreItems.length > 0 ? items.slice(0, 3) : items.slice(0, 4);
  const isMoreActive = moreItems.some((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[55] bg-slate-900/40 backdrop-blur-[2px] md:hidden"
            />

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="fixed inset-x-0 bottom-16 z-[60] mx-auto w-[92%] max-w-md rounded-t-[28px] border border-slate-200 bg-white shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <p className="text-sm font-bold text-slate-900">More</p>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1 p-3">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors",
                        isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn("rounded-xl p-2", isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                        <Icon size={16} />
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn("text-[9px] font-bold tracking-tight", isActive && "font-black")}>
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
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                isMoreActive || isMenuOpen ? activeColor : "text-slate-400 hover:text-slate-600"
              )}
              aria-label="Open more menu"
            >
              <div className="relative">
                <Menu size={20} strokeWidth={isMoreActive || isMenuOpen ? 2.5 : 2} />
                {isMenuOpen && (
                  <motion.div
                    layoutId="bottom-nav-bubble"
                    className="absolute inset-0 -z-10 rounded-full bg-emerald-100/70"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </div>
              <span className={cn("text-[9px] font-bold tracking-tight", (isMoreActive || isMenuOpen) && "font-black")}>
                More
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
