"use client"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowDownToLine, Wallet, Clock, CheckCircle2, XCircle, CreditCard, Loader2, RefreshCw, Banknote } from "lucide-react"
import { toast } from "sonner"

interface Withdrawal {
  id: number
  amount: number
  fee: number
  net_amount: number
  payment_method: string
  account_number: string | null
  account_holder: string | null
  status: string
  admin_note: string | null
  created_at: string
  completed_at: string | null
}

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string; badgeVar: "success" | "warning" | "destructive" | "secondary" }> = {
  completed: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Completed", badgeVar: "success" },
  pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Pending", badgeVar: "warning" },
  rejected: { icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10", label: "Rejected", badgeVar: "destructive" },
  cancelled: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-500/10", label: "Cancelled", badgeVar: "secondary" },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [walletData, setWalletData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("bank")
  const [accountDetails, setAccountDetails] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [wdRes, walletRes]: any[] = await Promise.all([
        api.get("/withdrawals?per_page=50"),
        api.get("/wallet"),
      ])
      const wdData = wdRes.data || wdRes
      setWithdrawals(Array.isArray(wdData) ? wdData : wdData?.data || [])
      setWalletData(walletRes.data || walletRes)
    } catch (err: any) {
      setError(err?.message || "Failed to load withdrawals")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    try {
      setSubmitting(true)
      await api.post("/withdrawals", {
        amount: parseFloat(amount),
        payment_method: method,
        account_number: accountDetails,
        account_holder: accountDetails,
      })
      toast.success("Withdrawal request submitted!")
      setAmount("")
      setAccountDetails("")
      fetchData()
    } catch (err: any) {
      toast.error(err?.message || "Withdrawal failed")
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async (id: number) => {
    try {
      await api.post(`/withdrawals/${id}/cancel`)
      toast.success("Withdrawal cancelled")
      fetchData()
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel")
    }
  }

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (activeTab === "all") return true
    return w.status === activeTab
  })

  const pendingTotal = withdrawals.filter((w) => w.status === "pending").reduce((s, w) => s + w.amount, 0)
  const totalWithdrawn = withdrawals.filter((w) => w.status === "completed").reduce((s, w) => s + w.amount, 0)

  const minWithdrawal = 10
  const maxWithdrawal = walletData?.withdrawable_balance || 0
  const feePercent = 2
  const withdrawable = walletData?.withdrawable_balance || 0

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
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <ArrowDownToLine className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to load withdrawals</h3>
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
            <h2 className="text-2xl font-bold tracking-tight">Withdrawals</h2>
            <p className="text-sm text-muted-foreground/80">Withdraw your earnings</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-0 shadow-lg shadow-emerald-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-100">Withdrawable Balance</CardDescription>
            <CardTitle className="text-3xl text-white">{formatCurrency(withdrawable)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-emerald-100">
              <Wallet className="h-4 w-4" />
              Available for withdrawal
            </div>
          </CardContent>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Pending Withdrawals</CardDescription>
            <CardTitle className="text-2xl text-amber-600 dark:text-amber-400">
              {formatCurrency(pendingTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {withdrawals.filter((w) => w.status === "pending").length} pending request{withdrawals.filter((w) => w.status === "pending").length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Total Withdrawn</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalWithdrawn)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Lifetime withdrawals</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="premium-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Request Withdrawal</CardTitle>
              <CardDescription>Withdraw your earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-8"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={minWithdrawal}
                      max={maxWithdrawal}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min: ${minWithdrawal.toFixed(2)} | Max: {formatCurrency(maxWithdrawal)} | Fee: {feePercent}%
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "bank", label: "Bank Transfer", icon: CreditCard },
                      { id: "usdt", label: "USDT (TRC20)", icon: Wallet },
                      { id: "btc", label: "Bitcoin", icon: Wallet },
                      { id: "eth", label: "Ethereum", icon: Wallet },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`flex items-center gap-2 rounded-xl border-2 p-3 text-sm transition-all duration-200 ${
                          method === m.id ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-primary/50"
                        }`}
                      >
                        <m.icon className="h-4 w-4" />
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Details</Label>
                  <Input
                    placeholder={method === "bank" ? "Bank Name / Account Number" : "Wallet Address"}
                    value={accountDetails}
                    onChange={(e) => setAccountDetails(e.target.value)}
                  />
                </div>

                <div className="rounded-xl bg-muted/50 border border-border/50 p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span>{formatCurrency(parseFloat(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee ({feePercent}%)</span>
                    <span className="text-rose-500">-{formatCurrency((parseFloat(amount) || 0) * feePercent / 100)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>You Receive</span>
                    <span>{formatCurrency((parseFloat(amount) || 0) * (1 - feePercent / 100))}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" variant="premium" disabled={submitting || parseFloat(amount || "0") < minWithdrawal}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowDownToLine className="h-4 w-4 mr-2" />}
                  {submitting ? "Processing..." : "Withdraw"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="premium-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Withdrawal History</CardTitle>
              <Button variant="glass" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab}>
                  {filteredWithdrawals.length === 0 ? (
                    <div className="flex flex-col items-center py-10">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                        <Banknote className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No withdrawal history</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredWithdrawals.map((w) => {
                        const config = statusConfig[w.status] || statusConfig.pending
                        const Icon = config.icon
                        return (
                          <div key={w.id} className="group flex items-center justify-between rounded-xl p-3 hover:bg-accent transition-all duration-200 hover:translate-x-1">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-lg p-2 transition-all duration-200 group-hover:scale-110 ${config.bg}`}>
                                <Icon className={`h-4 w-4 ${config.color}`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium capitalize">{w.payment_method.replace(/_/g, " ")}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(w.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-rose-500">-{formatCurrency(w.amount)}</p>
                                {w.fee > 0 && <p className="text-[10px] text-muted-foreground">Fee: {formatCurrency(w.fee)}</p>}
                              </div>
                              <Badge variant={config.badgeVar} className="capitalize">{config.label}</Badge>
                              {w.status === "pending" && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCancel(w.id)}>
                                  <XCircle className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                </Button>
                              )}
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
      </div>
    </motion.div>
  )
}
