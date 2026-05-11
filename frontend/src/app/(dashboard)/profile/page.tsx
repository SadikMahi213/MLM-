"use client"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { api } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate, formatNumber, getInitials, cn } from "@/lib/utils"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  User, Wallet, Users, TrendingUp, Trophy, Clock, Bell,
  Gift, Star, Shield, Settings, ShoppingBag, ChevronRight, Calendar,
  Medal, Crown, Gem, Phone, Mail,
  MapPin, RefreshCw, Award, Target
} from "lucide-react"

interface ProfileData {
  user: any
  wallet: any
  total_earnings: number
  pending_earnings: number
  current_month_earnings: number
  total_team: number
  active_team: number
  recent_transactions: any[]
  last_withdrawal: any | null
  current_rank: any | null
  next_rank: any | null
  unread_notifications_count: number
}

const rankIcons: Record<string, any> = {
  star: Star, medal: Medal, crown: Crown, gem: Gem, trophy: Trophy,
}

const rankColors: Record<string, string> = {
  Starter: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  Silver: "bg-gray-400/10 text-gray-400 border-gray-400/20",
  Gold: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Diamond: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  Elite: "bg-purple-500/10 text-purple-500 border-purple-500/20",
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function ProfilePage() {
  const { user: authUser } = useAuthStore()
  const [data, setData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<any>("/profile")
      setData((res.data || res) as ProfileData)
    } catch (e: any) {
      setError(e.message || "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={fetchProfile} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> Retry
        </Button>
      </div>
    )
  }

  const profile = data?.user || authUser
  const wallet = data?.wallet
  const currentRank = data?.current_rank
  const nextRank = data?.next_rank
  const profilePhoto = profile?.profile_photo_url || profile?.avatar || undefined

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Profile Header */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-0">
          <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6 pb-20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,white/0.1,transparent_60%)]" />
            <div className="relative flex items-center gap-5">
              <Avatar className="h-20 w-20 border-4 border-white/30 ring-2 ring-white/20 shadow-xl">
                <AvatarImage src={profilePhoto} />
                <AvatarFallback className="text-2xl bg-white/20 text-white font-bold">
                  {getInitials(profile?.name || "U")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{profile?.name}</h1>
                  {currentRank && (
                    <Badge className={cn("border text-xs font-semibold shadow-sm", rankColors[currentRank.name] || "bg-white/20 text-white border-white/30")}>
                      <Trophy className="h-3 w-3 mr-1" />
                      {currentRank.name}
                    </Badge>
                  )}
                </div>
                <p className="text-blue-200/80 text-sm">@{profile?.username || "username"}</p>
                <div className="flex items-center gap-4 mt-1.5 text-sm text-blue-200/70">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined {formatDate(profile?.created_at, "short")}</span>
                  <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> ID: #{profile?.id}</span>
                </div>
              </div>
              <Link href="/settings">
                <Button size="sm" variant="secondary" className="bg-white/15 text-white hover:bg-white/25 border-0 backdrop-blur-sm shadow-lg">
                  <Settings className="h-4 w-4 mr-1" /> Edit Profile
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative -mt-12 mx-4 mb-4">
            <Card className="shadow-lg border-border/50">
              <CardContent className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2.5"><Phone className="h-4 w-4 text-blue-500" /></div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium truncate">{profile?.telecom_code || ""} {profile?.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-2.5"><Mail className="h-4 w-4 text-emerald-500" /></div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate">{profile?.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-500/10 p-2.5"><MapPin className="h-4 w-4 text-purple-500" /></div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium truncate">
                        {[profile?.city, profile?.country].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-500/10 p-2.5"><Gift className="h-4 w-4 text-amber-500" /></div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Package</p>
                      <p className="text-sm font-medium truncate">{profile?.package?.name || "Free"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Card>
      </motion.div>

      {/* Wallet & Earnings */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" /> Wallet & Earnings
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Earnings", value: formatCurrency(data?.total_earnings || 0), color: "text-emerald-500" },
            { label: "Available Balance", value: formatCurrency(wallet?.balance || 0), color: "text-foreground" },
            { label: "Pending Earnings", value: formatCurrency(data?.pending_earnings || 0), color: "text-amber-500" },
            { label: "Withdrawable", value: formatCurrency(wallet?.withdrawable_balance || 0), color: "text-blue-500" },
            { label: "This Month", value: formatCurrency(data?.current_month_earnings || 0), color: "text-foreground" },
          ].map((item, i) => (
            <Card key={i} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground/80 mb-1">{item.label}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {data?.last_withdrawal && (
          <div className="mt-2 text-sm text-muted-foreground/60 flex items-center gap-2 px-1">
            <Clock className="h-3.5 w-3.5" />
            Last withdrawal: {formatCurrency(data.last_withdrawal.amount)} via {data.last_withdrawal.payment_method} ({data.last_withdrawal.status})
          </div>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Network Tree Summary */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Network Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/10 p-3.5">
                  <p className="text-xs text-muted-foreground/80">Total Team</p>
                  <p className="text-xl font-bold">{formatNumber(data?.total_team || 0)}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/10 p-3.5">
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Active Members</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(data?.active_team || 0)}</p>
                </div>
              </div>
              <Link href="/genealogy">
                <Button variant="outline" className="w-full justify-between group">
                  View Full Network <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rank & Rewards */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" /> Rank & Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentRank ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("rounded-xl p-3 shadow-sm", rankColors[currentRank.name] || "bg-accent")}>
                      {(() => {
                        const Icon = rankIcons[currentRank.icon] || Trophy
                        return <Icon className="h-6 w-6" />
                      })()}
                    </div>
                    <div>
                      <p className="font-semibold">{currentRank.name}</p>
                      <p className="text-xs text-muted-foreground/70">Level {currentRank.level}</p>
                    </div>
                  </div>
                  {nextRank && (
                    <div className="rounded-xl border border-border/50 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground/80">Next: <span className="font-semibold text-foreground">{nextRank.name}</span></p>
                        <Target className="h-3.5 w-3.5 text-amber-500" />
                      </div>
                      <div className="h-2 rounded-full bg-accent/50 overflow-hidden">
                        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm" />
                      </div>
                      <p className="text-xs text-muted-foreground/60 mt-1.5">Level {nextRank.level} — Keep growing your team!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-center">
                  <Award className="h-10 w-10 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground/60">Complete your first referrals to earn a rank.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" /> Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.recent_transactions && data.recent_transactions.length > 0 ? (
                <div className="space-y-1">
                  {data.recent_transactions.slice(0, 5).map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                      <div>
                        <p className="text-sm font-medium capitalize">{tx.type?.replace(/_/g, " ") || "Transaction"}</p>
                        <p className="text-xs text-muted-foreground/60">{formatDate(tx.created_at, "relative")}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-semibold", tx.amount > 0 ? "text-emerald-500" : "text-rose-500")}>
                          {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                        </p>
                        <Badge variant={tx.status === "completed" ? "success" : tx.status === "pending" ? "warning" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Link href="/wallet">
                    <Button variant="ghost" size="sm" className="w-full mt-1 text-muted-foreground group">
                      View All <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <RefreshCw className="h-8 w-8 text-muted-foreground/20 mb-2" />
                  <p className="text-sm text-muted-foreground/60">No transactions yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications & Quick Links */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10 p-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Unread Notifications</p>
                    <p className="text-xs text-muted-foreground/60">Stay updated with your activity</p>
                  </div>
                </div>
                <Badge variant="default" className="shadow-sm">{data?.unread_notifications_count || 0}</Badge>
              </div>
              <Link href="/notifications">
                <Button variant="outline" className="w-full justify-between group">
                  View Notifications <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
              <Separator className="my-2" />
              <div className="grid grid-cols-2 gap-2">
                <Link href="/settings"><Button variant="outline" size="sm" className="w-full"><Settings className="h-4 w-4 mr-1" /> Settings</Button></Link>
                <Link href="/withdrawals"><Button variant="outline" size="sm" className="w-full"><Wallet className="h-4 w-4 mr-1" /> Withdraw</Button></Link>
                <Link href="/dashboard"><Button variant="outline" size="sm" className="w-full"><TrendingUp className="h-4 w-4 mr-1" /> Dashboard</Button></Link>
                <Link href="/daily-tasks"><Button variant="outline" size="sm" className="w-full"><Target className="h-4 w-4 mr-1" /> Tasks</Button></Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "This Month", value: formatCurrency(data?.current_month_earnings || 0), color: "text-emerald-500" },
                { label: "Team Size", value: formatNumber(data?.total_team || 0), color: "text-foreground" },
                { label: "Total Earnings", value: formatCurrency(data?.total_earnings || 0), color: "text-amber-500" },
                { label: "Current Rank", value: currentRank?.name || "—", color: "text-blue-500" },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 rounded-xl bg-gradient-to-b from-accent/30 to-accent/10 border border-border/40">
                  <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="w-full mt-3 text-muted-foreground group">
                View Full Dashboard <ChevronRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Shop Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-primary" /> Shop
            </CardTitle>
            <CardDescription>Browse available products and accessories</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/shop">
              <Button className="w-full premium-shadow" variant="premium">
                <ShoppingBag className="h-4 w-4 mr-2" /> Visit Shop
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
