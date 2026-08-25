"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block w-full"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn(
          "absolute z-[110] bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5",
          "bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap shadow-xl",
          "animate-in fade-in zoom-in duration-200",
          className
        )}>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
