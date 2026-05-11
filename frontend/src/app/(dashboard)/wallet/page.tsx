"use client"
import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api-client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Wallet, Copy, Download, RefreshCw, Loader2, Banknote } from "lucide-react"
import { toast } from "sonner"

interface WalletData {
  id: number
  balance: number
  income_balance: number
  bonus_balance: number
  withdrawable_balance: number
  total_deposited: number
  total_withdrawn: number
  total_income: number
}

interface Transaction {
  id: number
  type: string
  amount: number
  fee: number
  balance_before: number
  balance_after: number
  status: string
  description: string
  transaction_id: string | null
  created_at: string
  completed_at: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [txError, setTxError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [depositAmount, setDepositAmount] = useState("")
  const [depositMethod, setDepositMethod] = useState("")
  const [depositing, setDepositing] = useState(false)

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res: any = await api.get("/wallet")
      setWallet(res.data || res)
    } catch (err: any) {
      setError(err?.message || "Failed to load wallet")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      setTxLoading(true)
      setTxError(null)
      const res: any = await api.get("/wallet/transactions?per_page=50")
      const data = res.data || res
      setTransactions(Array.isArray(data) ? data : data?.data || [])
    } catch (err: any) {
      setTxError(err?.message || "Failed to load transactions")
    } finally {
      setTxLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWallet()
    fetchTransactions()
  }, [fetchWallet, fetchTransactions])

  const filteredTxs = transactions.filter((tx) => {
    if (activeTab === "all") return true
    if (activeTab === "deposit") return tx.type === "deposit"
    if (activeTab === "withdrawal") return tx.type === "withdrawal"
    if (activeTab === "commission") return ["commission", "bonus", "referral_bonus", "binary_bonus", "generation_bonus", "daily_task_reward"].includes(tx.type)
    return true
  })

  const handleDeposit = async () => {
    if (!depositAmount || !depositMethod) {
      toast.error("Please enter amount and select payment method")
      return
    }
    try {
      setDepositing(true)
      await api.post("/wallet/deposit", {
        amount: parseFloat(depositAmount),
        payment_method: depositMethod,
      })
      toast.success("Deposit initiated successfully")
      setDepositAmount("")
      setDepositMethod("")
      fetchWallet()
      fetchTransactions()
    } catch (err: any) {
      toast.error(err?.message || "Deposit failed")
    } finally {
      setDepositing(false)
    }
  }

  const getTxIcon = (type: string, amount: number) => {
    const isCredit = amount > 0
    const baseType = type === "commission" || type === "bonus" || type === "referral_bonus" || type === "binary_bonus" || type === "generation_bonus" || type === "daily_task_reward" ? "commission" : type
    const colors: Record<string, string> = {
      deposit: "bg-blue-500/10 text-blue-500",
      withdrawal: "bg-rose-500/10 text-rose-500",
      commission: "bg-emerald-500/10 text-emerald-500",
      bonus: "bg-purple-500/10 text-purple-500",
    }
    return {
      icon: isCredit ? ArrowUpRight : ArrowDownRight,
      color: colors[baseType] || "bg-gray-500/10 text-gray-500",
      isCredit,
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
      completed: "success",
      pending: "warning",
      failed: "destructive",
      cancelled: "secondary",
    }
    return variants[status] || "secondary"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-1">
          <Skeleton className="h-8 w-1 rounded-full" />
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56 mt-2" />
          </div>
        </div>
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
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <Wallet className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Failed to load wallet</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={fetchWallet}>
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
            <h2 className="text-2xl font-bold tracking-tight">Wallet</h2>
            <p className="text-sm text-muted-foreground/80">Manage your funds and transactions</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg shadow-blue-500/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100">Total Balance</CardDescription>
            <CardTitle className="text-3xl text-white">{formatCurrency(wallet?.balance || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-200">Deposited: {formatCurrency(wallet?.total_deposited || 0)}</p>
          </CardContent>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Income Balance</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(wallet?.income_balance || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Total earned: {formatCurrency(wallet?.total_income || 0)}</p>
          </CardContent>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Bonus Balance</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(wallet?.bonus_balance || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">From commissions & referrals</p>
          </CardContent>
        </Card>
        <Card className="premium-shadow">
          <CardHeader className="pb-2">
            <CardDescription>Withdrawable</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
              {formatCurrency(wallet?.withdrawable_balance || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Withdrawn: {formatCurrency(wallet?.total_withdrawn || 0)}</p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="premium-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Transaction History</CardTitle>
              <Button variant="glass" size="sm" onClick={fetchTransactions} disabled={txLoading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${txLoading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="deposit">Deposits</TabsTrigger>
                  <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
                  <TabsTrigger value="commission">Commissions</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab}>
                  {txLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : txError ? (
                    <div className="flex flex-col items-center py-10">
                      <p className="text-sm text-muted-foreground mb-3">{txError}</p>
                      <Button variant="outline" size="sm" onClick={fetchTransactions}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Retry
                      </Button>
                    </div>
                  ) : filteredTxs.length === 0 ? (
                    <div className="flex flex-col items-center py-10">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                        <Banknote className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">No transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {filteredTxs.map((tx) => {
                        const { icon: Icon, color, isCredit } = getTxIcon(tx.type, tx.amount)
                        return (
                          <div key={tx.id} className="group flex items-center justify-between rounded-xl p-3 hover:bg-accent transition-all duration-200 hover:translate-x-1">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-lg p-2 transition-all duration-200 group-hover:scale-110 ${color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{tx.description || tx.type}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(tx.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <p className={`text-sm font-semibold ${isCredit ? "text-emerald-500" : "text-rose-500"}`}>
                                {isCredit ? "+" : ""}{formatCurrency(tx.amount)}
                              </p>
                              <Badge variant={getStatusBadge(tx.status)} className="capitalize">{tx.status}</Badge>
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

        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <Card className="premium-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Deposit Funds</CardTitle>
                <CardDescription>Add funds to your wallet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input
                    type="number"
                    placeholder="100.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["BTC", "ETH", "USDT", "Bank"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setDepositMethod(method)}
                        className={`rounded-xl border p-3 text-sm font-medium transition-all duration-200 ${
                          depositMethod === method
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 hover:border-primary hover:bg-primary/5"
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full" variant="premium" onClick={handleDeposit} disabled={depositing}>
                  {depositing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><Wallet className="h-4 w-4 mr-2" /> Deposit</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="premium-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Wallet Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Total Deposited", value: wallet?.total_deposited || 0 },
                  { label: "Total Withdrawn", value: wallet?.total_withdrawn || 0 },
                  { label: "Total Income", value: wallet?.total_income || 0 },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
