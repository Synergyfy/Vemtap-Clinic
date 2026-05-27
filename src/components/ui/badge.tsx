import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' }>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: "bg-sky-600 text-white",
    secondary: "bg-slate-100 text-slate-900",
    outline: "border border-slate-200 text-slate-900"
  }
  return <div ref={ref} className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors", variants[variant], className)} {...props} />
})
Badge.displayName = "Badge"

export { Badge }
