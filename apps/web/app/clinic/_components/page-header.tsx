"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type PageHeaderAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
};

export function PageHeader(props: {
  title: string;
  description?: string;
  actions?: PageHeaderAction[];
}) {
  const { title, description, actions = [] } = props;

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {description ? <p className="mt-1 text-slate-500">{description}</p> : null}
      </div>
      {actions.length ? (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const variant = action.variant ?? "outline";
            const className = cn(
              "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
              variant === "primary"
                ? "bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
                : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
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
