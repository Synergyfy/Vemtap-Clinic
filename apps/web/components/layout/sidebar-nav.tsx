"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SidebarLinkItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
}

export interface SidebarGroupItem {
  name: string;
  icon: LucideIcon;
  items: SidebarLinkItem[];
}

export type SidebarEntry =
  | { type: "link"; item: SidebarLinkItem }
  | { type: "group"; group: SidebarGroupItem };

interface SidebarNavProps {
  entries: SidebarEntry[];
  activeColor?: string; // e.g. "bg-sky-600", "bg-emerald-600", "bg-cyan-600"
  onNavigate?: () => void;
}

export function SidebarNav({
  entries,
  activeColor = "bg-sky-600",
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();

  // Keep track of which groups are expanded
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    entries.forEach((entry) => {
      if (entry.type === "group") {
        const isChildActive = entry.group.items.some(
          (item) => pathname === item.href || pathname.startsWith(item.href + "/")
        );
        initial[entry.group.name] = isChildActive;
      }
    });
    return initial;
  });

  // Automatically expand group when navigating to a child page
  useEffect(() => {
    entries.forEach((entry) => {
      if (entry.type === "group") {
        const isChildActive = entry.group.items.some(
          (item) => pathname === item.href || pathname.startsWith(item.href + "/")
        );
        if (isChildActive) {
          setOpenGroups((prev) => ({ ...prev, [entry.group.name]: true }));
        }
      }
    });
  }, [pathname, entries]);

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto select-none">
      {entries.map((entry, idx) => {
        if (entry.type === "link") {
          const item = entry.item;
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/clinic/dashboard" && item.href !== "/reception/dashboard" && item.href !== "/doctor/dashboard" && item.href !== "/nurse/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150",
                isActive
                  ? cn(activeColor, "text-white shadow-sm font-bold")
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {Icon && (
                  <Icon
                    size={18}
                    className={cn(
                      "shrink-0 transition-transform group-hover:scale-105",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )}
                  />
                )}
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        }

        // Dropdown group
        const group = entry.group;
        const GroupIcon = group.icon;
        const isOpen = !!openGroups[group.name];
        const isChildActive = group.items.some(
          (item) => pathname === item.href || pathname.startsWith(item.href + "/")
        );

        return (
          <div key={group.name} className="pt-1">
            <button
              type="button"
              onClick={() => toggleGroup(group.name)}
              className={cn(
                "w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150",
                isChildActive
                  ? "text-white bg-white/[0.08]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <GroupIcon
                  size={16}
                  className={cn(
                    "shrink-0",
                    isChildActive ? "text-sky-400" : "text-slate-500"
                  )}
                />
                <span className="truncate">{group.name}</span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <ChevronDown size={14} className="text-slate-400" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden space-y-0.5 mt-1 ml-2.5 pl-2.5 border-l border-white/10"
                >
                  {group.items.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive =
                      pathname === subItem.href ||
                      pathname.startsWith(subItem.href + "/");

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                          isSubActive
                            ? cn(activeColor, "text-white font-bold shadow-xs")
                            : "text-slate-300 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {SubIcon ? (
                            <SubIcon
                              size={15}
                              className={cn(
                                "shrink-0",
                                isSubActive
                                  ? "text-white"
                                  : "text-slate-400 group-hover:text-white"
                              )}
                            />
                          ) : (
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                isSubActive ? "bg-white" : "bg-slate-500 group-hover:bg-slate-300"
                              )}
                            />
                          )}
                          <span className="truncate">{subItem.name}</span>
                        </div>
                        {subItem.badge !== undefined && (
                          <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-white/15 text-white">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}

