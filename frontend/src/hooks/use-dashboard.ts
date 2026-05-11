"use client"
import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api-client"

export interface DashboardData {
  wallet: {
    id: number
    balance: number
    income_balance: number
    bonus_balance: number
    withdrawable_balance: number
    total_deposited: number
    total_withdrawn: number
    total_income: number
  } | null
  total_balance: number
  total_income: number
  total_bonuses: number
  total_team: number
  active_team: number
  inactive_team: number
  new_team_this_month: number
  left_leg: number
  right_leg: number
  pending_withdrawals: number
  recent_transactions: any[]
  income_chart: { date: string; income: number }[]
  chart_total_income: number
  chart_daily_avg: number
  income_trend: number
  team_trend: number
  bonus_trend: number
  unread_notifications: any[]
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res: any = await api.get("/dashboard")
      setData(res.data || res)
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
