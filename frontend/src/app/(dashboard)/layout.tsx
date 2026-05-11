"use client"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { api } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

export default function Layout({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [state, setState] = useState<"loading" | "redirecting" | "ready">("loading")

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
      return () => unsub()
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return

    const t = useAuthStore.getState().token

    if (!t) {
      setState("redirecting")
      setTimeout(() => { window.location.href = "/login" }, 100)
      return
    }

    api.setToken(t)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    api.get("/auth/me", { signal: controller.signal })
      .then((res: any) => {
        useAuthStore.getState().setAuth(res.data || res, t)
        setState("ready")
      })
      .catch(() => {
        useAuthStore.getState().logout()
        setState("redirecting")
        setTimeout(() => { window.location.href = "/login" }, 100)
      })
      .finally(() => clearTimeout(timeout))
  }, [hydrated])

  if (state === "redirecting") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (state === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
