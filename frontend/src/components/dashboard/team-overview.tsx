"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettingsStore } from "@/stores/settings-store"
import { Users, UserCheck, UserX, UserPlus } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface TeamOverviewProps {
  totalMembers?: number
  activeMembers?: number
  inactiveMembers?: number
  newMembers?: number
  leftLeg?: number
  rightLeg?: number
  loading?: boolean
}

export function TeamOverview({
  totalMembers = 0,
  activeMembers = 0,
  inactiveMembers = 0,
  newMembers = 0,
  leftLeg = 0,
  rightLeg = 0,
  loading,
}: TeamOverviewProps) {
  const { getString } = useSettingsStore()

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-accent/50 p-4">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activePercent = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0

  return (
    <Card>
      <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {getString("dashboard_team_title", "Team Overview")}
          </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-accent/50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{getString("dashboard_team_total_label", "Total")}</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(totalMembers)}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400">{getString("dashboard_team_active_label", "Active")}</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatNumber(activeMembers)}
            </p>
          </div>
          <div className="rounded-xl bg-rose-500/10 p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserX className="h-4 w-4 text-rose-500" />
              <span className="text-xs text-rose-600 dark:text-rose-400">{getString("dashboard_team_inactive_label", "Inactive")}</span>
            </div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatNumber(inactiveMembers)}
            </p>
          </div>
          <div className="rounded-xl bg-blue-500/10 p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-blue-600 dark:text-blue-400">{getString("dashboard_team_new_label", "New")}</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              +{formatNumber(newMembers)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{getString("dashboard_team_active_rate_label", "Active Rate")}</span>
            <span className="font-medium">{activePercent}%</span>
          </div>
          <Progress value={activePercent} className="h-2" />
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm font-medium mb-3">{getString("dashboard_team_binary_legs_label", "Binary Legs")}</p>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{formatNumber(leftLeg)}</p>
              <p className="text-xs text-muted-foreground">{getString("dashboard_team_left_label", "Left (A)")}</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{formatNumber(rightLeg)}</p>
              <p className="text-xs text-muted-foreground">{getString("dashboard_team_right_label", "Right (B)")}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
