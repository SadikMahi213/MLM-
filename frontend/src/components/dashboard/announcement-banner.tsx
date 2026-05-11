"use client"
import { useState } from "react"
import { useSettingsStore } from "@/stores/settings-store"
import { X, Info, AlertTriangle, Megaphone } from "lucide-react"
import { cn } from "@/lib/utils"

const typeConfig = {
  info: { icon: Info, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  warning: { icon: AlertTriangle, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  danger: { icon: X, className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
  announcement: { icon: Megaphone, className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
}

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { getBool, getString } = useSettingsStore()

  const enabled = getBool("announcement_enabled", false)
  const text = getString("announcement_text", "")
  const type = getString("announcement_type", "info")

  if (!enabled || !text || dismissed) return null

  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.info
  const Icon = config.icon

  return (
    <div className={cn("relative flex items-center gap-3 rounded-xl border px-4 py-3", config.className)}>
      <Icon className="h-5 w-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{text}</p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
