"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { useSettingsStore } from "@/stores/settings-store"
import { Wallet, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from "lucide-react"

interface WalletOverviewProps {
  wallet?: {
    balance: number
    income_balance: number
    bonus_balance: number
    withdrawable_balance: number
  } | null
  loading?: boolean
}

export function WalletOverview({ wallet, loading }: WalletOverviewProps) {
  const { getString } = useSettingsStore()

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6">
          <Skeleton className="h-4 w-24 bg-white/20 mb-4" />
          <Skeleton className="h-10 w-40 bg-white/20 mb-1" />
          <Skeleton className="h-4 w-32 bg-white/20 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 bg-white/20" />
            <Skeleton className="h-9 w-24 bg-white/20" />
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-6 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const balance = wallet?.balance ?? 0
  const incomeBalance = wallet?.income_balance ?? 0
  const bonusBalance = wallet?.bonus_balance ?? 0
  const withdrawableBalance = wallet?.withdrawable_balance ?? 0

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-blue-100">{getString("dashboard_wallet_total_label", "Total Balance")}</p>
          <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <p className="text-4xl font-bold tracking-tight mb-1">{formatCurrency(balance)}</p>
        <p className="text-sm text-blue-200">{getString("dashboard_wallet_available_label", "Available for withdrawal")}</p>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            {getString("dashboard_wallet_deposit_label", "Deposit")}
          </Button>
          <Button size="sm" variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            {getString("dashboard_wallet_withdraw_label", "Withdraw")}
          </Button>
          <Button size="sm" variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0">
            <ArrowRightLeft className="h-4 w-4 mr-1" />
            {getString("dashboard_wallet_transfer_label", "Transfer")}
          </Button>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{getString("dashboard_wallet_income_label", "Income Balance")}</p>
            <p className="text-lg font-semibold">{formatCurrency(incomeBalance)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{getString("dashboard_wallet_bonus_label", "Bonus Balance")}</p>
            <p className="text-lg font-semibold">{formatCurrency(bonusBalance)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">{getString("dashboard_wallet_withdrawable_label", "Withdrawable")}</p>
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(withdrawableBalance)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
