"use client"
import { ThemeProvider } from "@/lib/theme-provider"
import { Toaster } from "@/components/ui/toast"
import { SettingsThemeProvider } from "@/components/settings-theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <SettingsThemeProvider>
        {children}
        <Toaster />
      </SettingsThemeProvider>
    </ThemeProvider>
  )
}
