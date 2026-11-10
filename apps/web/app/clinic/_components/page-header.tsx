"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type PageHeaderAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline";
  disabled?: boolean;
};

export function PageHeader(props: {
  title: string;
  description?: string;
  actions?: PageHeaderAction[];
}) {
  const { title, description, actions = [] } = props;

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">{title}</h1>
        {description ? <p className="mt-0.5 text-xs text-slate-500 font-medium">{description}</p> : null}
      </div>
      {actions.length ? (
        <div className="flex w-full flex-wrap gap-1.5 md:w-auto md:justify-end">
          {actions.map((action) => {
            const variant = action.variant ?? "outline";
            const className = cn(
              "inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors sm:px-3 sm:py-1.5",
              variant === "default"
                ? "bg-sky-600 text-white hover:bg-sky-700 shadow-xs"
                : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
              action.disabled ? "opacity-50 pointer-events-none" : null
            );

            if (action.onClick) {
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={className}
                  disabled={action.disabled}
                >
                  {action.label}
                </button>
              );
            }

            return (
              <Link key={(action.href ?? action.label) + action.label} href={action.href ?? "#"} className={className}>
                {action.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
