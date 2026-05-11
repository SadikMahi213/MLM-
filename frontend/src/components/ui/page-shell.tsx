"use client"
import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

interface PageShellProps {
  children: ReactNode
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyState?: ReactNode
  loadingSkeleton?: ReactNode
  onRetry?: () => void
  className?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

function DefaultLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-1 rounded-full" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-40 mt-2" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

function DefaultErrorState({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <span className="text-2xl text-destructive">!</span>
      </div>
      <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">{error}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      )}
    </div>
  )
}

function DefaultEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-sm text-muted-foreground">No data available</p>
    </div>
  )
}

export function PageShell({
  children,
  loading,
  error,
  empty,
  emptyState,
  loadingSkeleton,
  onRetry,
  className,
}: PageShellProps) {
  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={className}>
        {loadingSkeleton || <DefaultLoadingSkeleton />}
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={className}>
        <DefaultErrorState error={error} onRetry={onRetry} />
      </motion.div>
    )
  }

  if (empty) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={className}>
        {emptyState || <DefaultEmptyState />}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export { containerVariants, itemVariants }
