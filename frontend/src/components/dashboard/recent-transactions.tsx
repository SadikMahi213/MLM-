"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate } from "@/lib/utils"
import { useSettingsStore } from "@/stores/settings-store"
import { ArrowUpRight, ArrowDownRight, Gift, RefreshCw, DollarSign } from "lucide-react"

interface TransactionItem {
  id: number
  type?: string
  description?: string
  amount?: number
  status?: string
  created_at?: string
  date?: string
}

interface RecentTransactionsProps {
  transactions?: TransactionItem[]
  loading?: boolean
}

const getIcon = (type?: string) => {
  switch (type) {
    case "commission":
    case "daily_income":
      return <DollarSign className="h-4 w-4 text-emerald-500" />
    case "deposit":
      return <ArrowUpRight className="h-4 w-4 text-blue-500" />
    case "withdrawal":
      return <ArrowDownRight className="h-4 w-4 text-rose-500" />
    case "bonus":
      return <Gift className="h-4 w-4 text-purple-500" />
    default:
      return <RefreshCw className="h-4 w-4" />
  }
}

const getIconBg = (type?: string) => {
  switch (type) {
    case "commission":
    case "daily_income":
      return "bg-emerald-500/10"
    case "deposit":
      return "bg-blue-500/10"
    case "withdrawal":
      return "bg-rose-500/10"
    case "bonus":
      return "bg-purple-500/10"
    default:
      return "bg-accent"
  }
}

const statusVariant: Record<string, "success" | "warning" | "default" | "destructive"> = {
  completed: "success",
  pending: "warning",
  failed: "destructive",
}

export function RecentTransactions({ transactions = [], loading }: RecentTransactionsProps) {
  const { getString } = useSettingsStore()

  if (loading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{getString("dashboard_transactions_title", "Recent Transactions")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="px-6 pb-6 text-sm text-muted-foreground">{getString("dashboard_transactions_empty", "No transactions yet.")}</div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="px-6 pb-6 space-y-1">
              {transactions.map((tx) => {
                const amount = tx.amount ?? 0
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 rounded-xl p-3 hover:bg-accent transition-colors"
                  >
                    <div className={"rounded-lg p-2 " + getIconBg(tx.type)}>
                      {getIcon(tx.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tx.description || ""}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.created_at ? formatDate(tx.created_at, "relative") : tx.date || ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={
                        "text-sm font-semibold " +
                        (amount > 0 ? "text-emerald-500" : "text-rose-500")
                      }>
                        {amount > 0 ? "+" : ""}${Math.abs(amount).toFixed(2)}
                      </p>
                      <Badge variant={statusVariant[tx.status || ""] || "default"}>
                        {tx.status || ""}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
