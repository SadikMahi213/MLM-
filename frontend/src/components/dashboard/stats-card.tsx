"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  icon: React.ElementType
  trend?: number
  trendLabel?: string
  variant?: "default" | "blue" | "purple" | "emerald" | "amber" | "rose"
  loading?: boolean
  className?: string
}

const gradients = {
  default: "from-gray-500/10 to-gray-600/10",
  blue: "from-blue-500/15 to-blue-600/10",
  purple: "from-purple-500/15 to-purple-600/10",
  emerald: "from-emerald-500/15 to-emerald-600/10",
  amber: "from-amber-500/15 to-amber-600/10",
  rose: "from-rose-500/15 to-rose-600/10",
}

const iconColors = {
  default: "text-gray-600 dark:text-gray-400",
  blue: "text-blue-500 dark:text-blue-400",
  purple: "text-purple-500 dark:text-purple-400",
  emerald: "text-emerald-500 dark:text-emerald-400",
  amber: "text-amber-500 dark:text-amber-400",
  rose: "text-rose-500 dark:text-rose-400",
}

const iconBgColors = {
  default: "bg-gray-500/10",
  blue: "bg-blue-500/10",
  purple: "bg-purple-500/10",
  emerald: "bg-emerald-500/10",
  amber: "bg-amber-500/10",
  rose: "bg-rose-500/10",
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
  loading,
  className,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-border/50 bg-card/80 p-6", className)}>
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    )
  }

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      className={cn(
        "rounded-2xl border border-border/50 bg-card/80 p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden group",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-start justify-between relative">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground/80">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              {trend >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={trend >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-muted-foreground/60">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3.5 shadow-sm", iconBgColors[variant])}>
          <Icon className={cn("h-5 w-5", iconColors[variant])} />
        </div>
      </div>
    </motion.div>
  )
}
