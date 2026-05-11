"use client"
import { useEffect, useCallback } from "react"
import { useSettingsStore } from "@/stores/settings-store"

function hexToHSL(hex: string): string {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  let max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    let d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function SettingsThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, load, refresh } = useSettingsStore()

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const onFocus = () => {
      refresh()
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refresh])

  useEffect(() => {
    const root = document.documentElement

    if (settings.primary_color && typeof settings.primary_color === "string") {
      root.style.setProperty("--mlm-primary", hexToHSL(settings.primary_color))
    }
    if (settings.secondary_color && typeof settings.secondary_color === "string") {
      root.style.setProperty("--mlm-secondary", hexToHSL(settings.secondary_color))
    }
    if (settings.border_radius !== undefined) {
      const br = typeof settings.border_radius === "number" ? settings.border_radius : parseFloat(String(settings.border_radius))
      if (!isNaN(br)) {
        root.style.setProperty("--mlm-radius", `${br}rem`)
      }
    }
    if (settings.font_family && typeof settings.font_family === "string") {
      root.style.setProperty("--mlm-font", settings.font_family)
    }

    if (settings.app_name && typeof settings.app_name === "string") {
      document.title = settings.app_name
    }
  }, [settings])

  return <>{children}</>
}
