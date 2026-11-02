"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";

export { Input };
