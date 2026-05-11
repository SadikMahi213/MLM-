"use client"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, DollarSign, Users, Gift, CheckCheck, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

type NotificationType = "bonus" | "commission" | "team" | "system"

interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  read: boolean
  created_at: string
}

const notificationIcons = {
  bonus: Gift,
  commission: DollarSign,
  team: Users,
  system: Bell,
}

const notificationColors = {
  bonus: "text-amber-500 bg-amber-100 dark:bg-amber-900/30",
  commission: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30",
  team: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
  system: "text-purple-500 bg-purple-100 dark:bg-purple-900/30",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response: any = await api.get("/notifications")
      const raw: any[] = response.data || response || []
      const mapped: Notification[] = raw.map((n: any) => {
        const data = typeof n.data === "string" ? JSON.parse(n.data) : (n.data || {})
        const typeClass: string = n.type || ""
        let mappedType: NotificationType = "system"
        if (typeClass.includes("Commission")) mappedType = "commission"
        else if (typeClass.includes("Withdrawal")) mappedType = "system"
        else if (data.type === "admin") mappedType = "system"
        else if (data.type === "bonus") mappedType = "bonus"
        else if (data.type === "team") mappedType = "team"
        return {
          id: n.id,
          type: mappedType,
          title: data.title || data.message?.split(":")[0] || typeClass.split("\\").pop()?.replace("Notification", "") || "Notification",
          message: data.message || "",
          read: n.read_at !== null,
          created_at: n.created_at,
        }
      })
      setNotifications(mapped)
    } catch (err: any) {
      setError(err.message || "Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = async () => {
    try {
      await api.post("/notifications/read-all")
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {}
  }

  const handleMarkRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch {}
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to load</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchNotifications}>
          Try Again
        </Button>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Bell className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          You're all caught up! We'll notify you when something new arrives.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-sm text-muted-foreground/80">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="glass" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <AnimatePresence>
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type]
            return (
              <motion.div
                key={notification.id}
                variants={itemVariants}
                layout
                exit={{ opacity: 0, x: -20 }}
                onClick={() => !notification.read && handleMarkRead(notification.id)}
              >
                <Card
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                    !notification.read ? "border-l-4 border-l-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110 ${
                        notificationColors[notification.type]
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              !notification.read ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.read && (
                            <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(notification.created_at, "relative")}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
