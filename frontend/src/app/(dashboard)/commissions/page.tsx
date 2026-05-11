"use client"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DollarSign, ArrowUpRight, Gift, TrendingUp, RefreshCw, Users, Banknote, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface Commission {
  id: number
  type: string
  amount: number
  percentage: number
  status: string
  description: string
  from_user_id: number | null
  metadata: any
  credited_at: string
  created_at: string
}

interface CommissionSummary {
  total: number
  by_type: { type: string; total: number; count: number }[]
}

const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  binary: { label: "Binary", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  referral: { label: "Referral", icon: ArrowUpRight, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  generation: { label: "Generation", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  rank_bonus: { label: "Rank Bonus", icon: Gift, color: "text-amber-500", bg: "bg-amber-500/10" },
  daily_task_reward: { label: "Daily Task", icon: Sparkles, color: "text-rose-500", bg: "bg-rose-500/10" },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<CommissionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [commRes, summaryRes]: any[] = await Promise.all([
        api.get("/commissions?per_page=50"),
        api.get("/commissions/summary"),
      ])
      const commData = commRes.data || commRes
      setCommissions(Array.isArray(commData) ? commData : commData?.data || [])
      setSummary(summaryRes.data || summaryRes)
    } catch (err: any) {
      setError(err?.message || "Failed to load commissions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredCommissions = commissions.filter((c) => {
    if (activeTab === "all") return true
    return c.type === activeTab
  })

  const totalCredited = commissions.filter((c) => c.status === "credited").reduce((s, c) => s + c.amount, 0)
  const totalPending = commissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0)

  const uniqueTypes = [...new Set(commissions.map((c) => c.type))]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-1">
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
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <DollarSign className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to load commissions</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Commissions</h2>
            <p className="text-sm text-muted-foreground/80">Track your earnings and bonuses</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card className="premium-shadow bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg shadow-blue-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100">Total Credited</CardDescription>
            <CardTitle className="text-2xl text-white">{formatCurrency(summary?.total || totalCredited || 0)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
              {formatCurrency(
                commissions
                  .filter((c) => {
                    const d = new Date(c.created_at)
                    const now = new Date()
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
                  })
                  .reduce((s, c) => s + c.amount, 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
              {formatCurrency(totalPending)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Last Month</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(
                commissions
                  .filter((c) => {
                    const d = new Date(c.created_at)
                    const now = new Date()
                    const lastMonth = now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1
                    const lastMonthYear = now.getMonth() - 1 < 0 ? now.getFullYear() - 1 : now.getFullYear()
                    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
                  })
                  .reduce((s, c) => s + c.amount, 0)
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="premium-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Commission History</CardTitle>
            <Button variant="glass" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                {uniqueTypes.map((type) => (
                  <TabsTrigger key={type} value={type}>
                    {typeConfig[type]?.label || type}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={activeTab}>
                {filteredCommissions.length === 0 ? (
                  <div className="flex flex-col items-center py-10">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                      <Banknote className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No commissions found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCommissions.map((c) => {
                      const config = typeConfig[c.type] || { label: c.type, icon: DollarSign, color: "text-muted-foreground", bg: "bg-muted" }
                      const Icon = config.icon
                      return (
                        <div key={c.id} className="group flex items-center justify-between rounded-xl p-3 hover:bg-accent transition-all duration-200 hover:translate-x-1">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-lg p-2 transition-all duration-200 group-hover:scale-110 ${config.bg}`}>
                              <Icon className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{c.description || `${config.label} Commission`}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                                {c.percentage > 0 && (
                                  <span className="text-[10px] text-muted-foreground/60">{c.percentage}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <p className="text-sm font-semibold">{formatCurrency(c.amount)}</p>
                            <Badge variant={c.status === "credited" ? "success" : "warning"} className="capitalize">
                              {c.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
