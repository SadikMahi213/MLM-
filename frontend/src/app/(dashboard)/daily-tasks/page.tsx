"use client"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api-client"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, Circle, Trophy, Star, Gift, RefreshCw, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"

interface DailyTask {
  id: number
  title: string
  description: string
  reward: number
  type: string
  requirements: any
  is_active: boolean
  completed_today: boolean
  reward_claimed: boolean
  created_at: string
  updated_at: string
}

const taskTypeConfig: Record<string, { label: string; color: string }> = {
  daily: { label: "Daily", color: "bg-blue-500/10 text-blue-500" },
  weekly: { label: "Weekly", color: "bg-purple-500/10 text-purple-500" },
  "one-time": { label: "One-Time", color: "bg-amber-500/10 text-amber-500" },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res: any = await api.get("/daily-tasks")
      const data = res.data || res
      setTasks(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleComplete = async (id: number) => {
    try {
      setActionId(id)
      await api.post(`/daily-tasks/${id}/complete`)
      toast.success("Task completed!")
      fetchTasks()
    } catch (err: any) {
      toast.error(err?.message || "Failed to complete task")
    } finally {
      setActionId(null)
    }
  }

  const handleClaim = async (id: number) => {
    try {
      setActionId(id)
      await api.post(`/daily-tasks/${id}/claim`)
      toast.success("Reward claimed!")
      fetchTasks()
    } catch (err: any) {
      toast.error(err?.message || "Failed to claim reward")
    } finally {
      setActionId(null)
    }
  }

  const completedCount = tasks.filter((t) => t.completed_today).length
  const claimedCount = tasks.filter((t) => t.reward_claimed).length
  const totalRewards = tasks.filter((t) => t.reward_claimed).reduce((sum, t) => sum + t.reward, 0)
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

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
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to load tasks</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchTasks}>
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
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">Daily Tasks</h2>
            <p className="text-sm text-muted-foreground/80">Complete tasks and earn rewards</p>
          </div>
          <Button variant="glass" size="sm" onClick={fetchTasks} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0 shadow-lg shadow-purple-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100">Total Earned</CardDescription>
            <CardTitle className="text-3xl text-white">{formatCurrency(totalRewards)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-200">Keep completing tasks!</p>
          </CardContent>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Completed Today</CardDescription>
            <CardTitle className="text-2xl">{completedCount}/{tasks.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Claimed Rewards</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalRewards)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{claimedCount} reward{claimedCount !== 1 ? "s" : ""} claimed</p>
          </CardContent>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Streak</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              {completedCount > 0 ? `${completedCount} day${completedCount !== 1 ? "s" : ""}` : "0 days"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Keep your streak going!</p>
          </CardContent>
        </Card>
      </motion.div>

      {tasks.length === 0 ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center py-10">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Gift className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No tasks available right now. Check back later!</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => {
            const config = taskTypeConfig[task.type] || { label: task.type, color: "bg-muted text-muted-foreground" }
            return (
              <motion.div key={task.id} variants={itemVariants}>
                <Card className={`premium-shadow transition-all duration-200 hover:-translate-y-0.5 ${task.reward_claimed ? "border-emerald-200 dark:border-emerald-800" : task.completed_today ? "border-amber-200 dark:border-amber-800" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {task.reward_claimed ? (
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        ) : task.completed_today ? (
                          <div className="h-6 w-6 rounded-full border-2 border-amber-400 flex items-center justify-center">
                            <Star className="h-3 w-3 text-amber-400" />
                          </div>
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{task.title}</h4>
                          <Badge className={`text-[10px] px-1.5 ${config.color}`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <Gift className="h-3 w-3" />
                            {formatCurrency(task.reward)}
                          </div>
                          <div className="flex gap-2">
                            {!task.completed_today && !task.reward_claimed && (
                              <Button size="sm" variant="outline" onClick={() => handleComplete(task.id)} disabled={actionId === task.id}>
                                {actionId === task.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                )}
                                Complete
                              </Button>
                            )}
                            {task.completed_today && !task.reward_claimed && (
                              <Button size="sm" variant="premium" onClick={() => handleClaim(task.id)} disabled={actionId === task.id}>
                                {actionId === task.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <Gift className="h-3 w-3 mr-1" />
                                )}
                                Claim
                              </Button>
                            )}
                            {task.reward_claimed && (
                              <Badge variant="success" className="text-xs">Claimed</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
