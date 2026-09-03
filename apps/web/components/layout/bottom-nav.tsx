"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface BottomNavProps {
  items: BottomNavItem[];
  activeColor?: string;
}

export function BottomNav({ items, activeColor = "text-emerald-600" }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                isActive ? activeColor : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn("text-[9px] font-bold tracking-tight", isActive && "font-black")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
