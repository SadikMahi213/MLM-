"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSettingsStore } from "@/stores/settings-store"
import { TrendingUp } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface IncomeChartProps {
  data?: { date: string; income: number }[]
  totalIncome?: number
  dailyAvg?: number
  incomeTrend?: number
  loading?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border bg-background p-3 shadow-lg">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-bold">${payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export function IncomeChart({ data = [], totalIncome, dailyAvg, incomeTrend, loading }: IncomeChartProps) {
  const { getString } = useSettingsStore()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const total = totalIncome ?? data.reduce((sum, d) => sum + d.income, 0)
  const avg = dailyAvg ?? (data.length > 0 ? Math.round(total / data.length) : 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{getString("dashboard_chart_title", "Income Overview")}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {getString("dashboard_chart_subtitle", "Daily income for the last 30 days")}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <span className="text-emerald-500 font-medium">{incomeTrend !== undefined ? `${incomeTrend >= 0 ? '+' : ''}${incomeTrend}%` : getString("dashboard_chart_na_label", "N/A")}</span>
          <span className="text-muted-foreground">{getString("dashboard_trend_label", "vs last 30 days")}</span>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            {getString("dashboard_chart_empty", "No income data yet")}
          </div>
        ) : (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#incomeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">{getString("dashboard_chart_total_label", "Total Income (30d)")}</p>
                <p className="text-2xl font-bold">${total.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{getString("dashboard_chart_avg_label", "Daily Average")}</p>
                <p className="text-2xl font-bold">${avg.toLocaleString()}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
