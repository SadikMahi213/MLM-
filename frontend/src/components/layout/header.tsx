"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAppStore } from "@/stores/app-store"
import { useAuthStore } from "@/stores/auth-store"
import { useSettingsStore } from "@/stores/settings-store"
import { useAuth } from "@/hooks/use-auth"
import { useMediaQuery } from "@/hooks/use-media-query"
import { api } from "@/lib/api-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"
import {
  Menu,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings as SettingsIcon,
  ChevronDown,
  Search,
  Command,
  LayoutDashboard,
  Wallet,
  GitBranch,
  Users,
  DollarSign,
  ArrowDownToLine,
  ClipboardCheck,
  ShoppingBag,
  X,
} from "lucide-react"
import { useTheme } from "@/lib/theme-provider"
import Link from "next/link"
import { cn } from "@/lib/utils"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/wallet": "Wallet",
  "/binary-tree": "Binary Tree",
  "/genealogy": "Genealogy",
  "/commissions": "Commissions",
  "/withdrawals": "Withdrawals",
  "/daily-tasks": "Daily Tasks",
  "/notifications": "Notifications",
  "/settings": "Settings",
  "/shop": "Shop",
}

const searchItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
  { icon: GitBranch, label: "Binary Tree", href: "/binary-tree" },
  { icon: Users, label: "Genealogy", href: "/genealogy" },
  { icon: DollarSign, label: "Commissions", href: "/commissions" },
  { icon: ArrowDownToLine, label: "Withdrawals", href: "/withdrawals" },
  { icon: ClipboardCheck, label: "Daily Tasks", href: "/daily-tasks" },
  { icon: ShoppingBag, label: "Shop", href: "/shop" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: SettingsIcon, label: "Settings", href: "/settings" },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const { user } = useAuthStore()
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { getString } = useSettingsStore()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [commandOpen, setCommandOpen] = useState(false)
  const [commandSearch, setCommandSearch] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const commandRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
      if (e.key === "Escape") setCommandOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  useEffect(() => {
    if (commandOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    if (!commandOpen) setCommandSearch("")
  }, [commandOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(e.target as Node)) {
        setCommandOpen(false)
      }
    }
    if (commandOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [commandOpen])

  const fetchUnread = useCallback(async () => {
    try {
      const res: any = await api.get("/notifications?per_page=1")
      const data = res.data || res
      const items = Array.isArray(data) ? data : data?.data || []
      setUnreadCount(items.filter((n: any) => n.read_at === null).length)
    } catch {}
  }, [])

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [fetchUnread])

  const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard"
  const siteName = getString("app_name", "MLM Pro")

  const filteredCommands = commandSearch
    ? searchItems.filter(
        (item) =>
          item.label.toLowerCase().includes(commandSearch.toLowerCase()) ||
          item.href.toLowerCase().includes(commandSearch.toLowerCase())
      )
    : searchItems

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 bg-background/70 backdrop-blur-xl px-4 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="shrink-0 -ml-1"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <motion.div
          key={title}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 min-w-0"
        >
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight truncate">{title}</h1>
            <div className="hidden sm:flex h-1.5 w-1.5 rounded-full bg-primary/50" />
            <span className="hidden sm:block text-xs text-muted-foreground">{siteName}</span>
          </div>
        </motion.div>

        {!isMobile && (
          <button
            onClick={() => setCommandOpen(true)}
            className="relative w-56 lg:w-72 group"
          >
            <div className="flex items-center h-9 rounded-xl bg-muted/50 border-none px-3 text-sm text-muted-foreground/60 cursor-text hover:bg-accent/30 transition-all">
              <Search className="h-4 w-4 mr-2 text-muted-foreground/40" />
              <span>Quick navigate...</span>
              <kbd className="ml-auto hidden lg:inline-flex h-5 items-center gap-1 rounded-md border bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground/50">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </button>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-[18px] w-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="py-6 text-center text-sm text-muted-foreground">
                {unreadCount > 0 ? "Loading..." : "No new notifications"}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-xs text-primary font-medium cursor-pointer" asChild>
                <Link href="/notifications">View all notifications</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 gap-2 rounded-full pl-1 pr-3 hover:bg-accent/30">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || user?.profile_photo_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left text-xs min-w-0 max-w-[100px]">
                  <p className="font-medium truncate leading-tight">{user?.name || "User"}</p>
                  <p className="text-muted-foreground/60 truncate leading-tight">{user?.email || ""}</p>
                </div>
                <ChevronDown className="hidden sm:block h-3 w-3 text-muted-foreground/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || user?.profile_photo_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">{user ? getInitials(user.name) : "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold">{user?.name || "User"}</span>
                    <span className="text-xs font-normal text-muted-foreground truncate">{user?.email || ""}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Command Palette */}
      <AnimatePresence>
        {commandOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              ref={commandRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-lg rounded-2xl border border-border/50 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-border/50 px-4">
                <Search className="h-5 w-5 text-muted-foreground/60 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages..."
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
                />
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded-md border bg-muted/50 px-1.5 text-[10px] font-medium text-muted-foreground/50">
                  ESC
                </kbd>
              </div>
              <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
                {filteredCommands.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href)
                        setCommandOpen(false)
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "nav-active"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span>{item.label}</span>
                      {isActive && (
                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                          Current
                        </Badge>
                      )}
                    </button>
                  )
                })}
                {filteredCommands.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
