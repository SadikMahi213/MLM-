"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/app-store"
import { useAuthStore } from "@/stores/auth-store"
import { useSettingsStore } from "@/stores/settings-store"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getInitials } from "@/lib/utils"
import {
  LayoutDashboard,
  Wallet,
  GitBranch,
  Users,
  DollarSign,
  ArrowDownToLine,
  ClipboardCheck,
  Bell,
  Settings,
  User,
  X,
  ChevronLeft,
  LogOut,
  ShoppingBag,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
]

const businessNavItems = [
  { icon: GitBranch, label: "Binary Tree", href: "/binary-tree", featureKey: "binary_enabled" },
  { icon: Users, label: "Genealogy", href: "/genealogy" },
  { icon: DollarSign, label: "Commissions", href: "/commissions" },
  { icon: ArrowDownToLine, label: "Withdrawals", href: "/withdrawals", featureKey: "withdrawal_enabled" },
  { icon: ShoppingBag, label: "Shop", href: "/shop" },
]

const activityNavItems = [
  { icon: ClipboardCheck, label: "Daily Tasks", href: "/daily-tasks", featureKey: "daily_tasks_enabled" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const { getString, getBool } = useSettingsStore()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const siteName = getString("app_name", "MLM Pro")
  const logoLight = getString("logo_light", "")
  const logoDark = getString("logo_dark", "")

  const filterItems = (items: { icon: any; label: string; href: string; featureKey?: string }[]) =>
    items.filter((item) => {
      if (item.featureKey) {
        return getBool(item.featureKey, true)
      }
      return true
    })

  const renderNavItems = (items: typeof mainNavItems) =>
    filterItems(items).map((item) => (
      <NavItem key={item.href} item={item} pathname={pathname} isMobile={isMobile} setSidebarOpen={setSidebarOpen} />
    ))

  return (
    <>
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AnimatePresence mode="wait">
        {(sidebarOpen || !isMobile) && (
          <motion.aside
            initial={isMobile ? { x: "-100%" } : false}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed left-0 top-0 z-50 flex h-full flex-col",
              "bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]",
              isMobile ? "w-72" : sidebarOpen ? "w-72" : "w-0 overflow-hidden"
            )}
          >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-5 border-b border-[var(--sidebar-border)]">
              <Link href="/dashboard" className="flex items-center gap-3">
                {logoLight ? (
                  <>
                    <img src={logoLight} alt={siteName} className="hidden h-8 w-8 dark:block" />
                    <img src={logoDark || logoLight} alt={siteName} className="block h-8 w-8 dark:hidden" />
                  </>
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
                    <span className="text-base font-bold text-white">{siteName.charAt(0)}</span>
                  </div>
                )}
                <span className="text-base font-bold tracking-tight">{siteName}</span>
              </Link>
              <div className="flex items-center gap-1">
                {!isMobile && (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-lg p-1.5 hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <PanelRightClose className="h-4 w-4" />
                  </button>
                )}
                {isMobile && (
                  <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 hover:bg-accent/50 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
              {/* Main */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-3 pb-1.5">
                  Main
                </div>
                <div className="space-y-0.5">
                  {renderNavItems(mainNavItems)}
                </div>
              </div>

              {/* Business */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-3 pb-1.5">
                  Business
                </div>
                <div className="space-y-0.5">
                  {renderNavItems(businessNavItems)}
                </div>
              </div>

              {/* Activity */}
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-3 pb-1.5">
                  Activity
                </div>
                <div className="space-y-0.5">
                  {renderNavItems(activityNavItems)}
                </div>
              </div>
            </nav>

            {/* Bottom section: Settings + Logout */}
            <div className="border-t border-[var(--sidebar-border)] p-3 space-y-1">
              <NavItem
                item={{ icon: Settings, label: "Settings", href: "/settings" }}
                pathname={pathname}
                isMobile={isMobile}
                setSidebarOpen={setSidebarOpen}
              />
              <button
                onClick={() => { logout(); setSidebarOpen(false) }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group"
              >
                <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                <span>Logout</span>
              </button>

              {/* User mini profile */}
              <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/2 p-2.5 mt-1">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 shrink-0">
                  <AvatarImage src={user?.avatar || user?.profile_photo_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight">{user?.name || "User"}</p>
                  <p className="text-[10px] text-muted-foreground/70 truncate leading-tight">{user?.email || ""}</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 shrink-0" />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      {!isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border bg-background/80 backdrop-blur-sm shadow-lg hover:bg-accent/50 transition-all"
        >
          <PanelRightOpen className="h-4 w-4" />
        </button>
      )}
    </>
  )
}

function NavItem({ item, pathname, isMobile, setSidebarOpen }: {
  item: { icon: any; label: string; href: string }
  pathname: string
  isMobile: boolean
  setSidebarOpen: (v: boolean) => void
}) {
  const Icon = item.icon
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

  return (
    <Link
      href={item.href}
      onClick={() => isMobile && setSidebarOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group",
        isActive
          ? "nav-active"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-transform", isActive && "text-primary scale-110")} />
      <span>{item.label}</span>
    </Link>
  )
}
