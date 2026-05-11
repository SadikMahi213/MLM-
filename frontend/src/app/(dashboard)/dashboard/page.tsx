"use client"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { PageShell } from "@/components/ui/page-shell"
import { PageHeader } from "@/components/ui/page-header"
import { AnnouncementBanner } from "@/components/dashboard/announcement-banner"
import { WalletOverview } from "@/components/dashboard/wallet-overview"
import { StatsCard } from "@/components/dashboard/stats-card"
import { IncomeChart } from "@/components/dashboard/income-chart"
import { TeamOverview } from "@/components/dashboard/team-overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { useDashboard } from "@/hooks/use-dashboard"
import { useAuthStore } from "@/stores/auth-store"
import { useSettingsStore } from "@/stores/settings-store"
import { Users, DollarSign, Gift, Clock } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboard()
  const user = useAuthStore((s) => s.user)
  const loadSettings = useSettingsStore((s) => s.load)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <PageShell loading={loading} error={error} onRetry={refetch} className="space-y-6">
      <AnnouncementBanner />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <PageHeader
            title={`Welcome back, ${user?.name?.split(" ")[0] || "User"}`}
            description="Here's your financial overview and team activity."
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <WalletOverview wallet={data?.wallet ?? null} />
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Income"
            value={formatCurrency(data?.total_income ?? 0)}
            icon={DollarSign}
            trend={data?.income_trend}
            trendLabel="vs last month"
            variant="emerald"
          />
          <StatsCard
            title="Total Team"
            value={formatNumber(data?.total_team ?? 0)}
            icon={Users}
            trend={data?.team_trend}
            trendLabel="vs last month"
            variant="blue"
          />
          <StatsCard
            title="Total Bonuses"
            value={formatCurrency(data?.total_bonuses ?? 0)}
            icon={Gift}
            trend={data?.bonus_trend}
            trendLabel="vs last month"
            variant="purple"
          />
          <StatsCard
            title="Pending Withdrawals"
            value={formatNumber(data?.pending_withdrawals ?? 0)}
            icon={Clock}
            variant="amber"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <IncomeChart
              data={data?.income_chart ?? []}
              totalIncome={data?.chart_total_income}
              dailyAvg={data?.chart_daily_avg}
              incomeTrend={data?.income_trend}
            />
          </div>
          <div className="lg:col-span-2">
            <TeamOverview
              totalMembers={data?.total_team}
              activeMembers={data?.active_team}
              inactiveMembers={data?.inactive_team}
              newMembers={data?.new_team_this_month}
              leftLeg={data?.left_leg}
              rightLeg={data?.right_leg}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RecentTransactions transactions={data?.recent_transactions ?? []} />
          </div>
          <div className="lg:col-span-2">
            <QuickActions />
          </div>
        </motion.div>
      </motion.div>
    </PageShell>
  )
}
