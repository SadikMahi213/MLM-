import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })

  const totalReferrals = await prisma.user.count({ where: { sponsorId: user.id } })
  const totalUsers = await prisma.user.count()

  const recentTransactions = await prisma.walletTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true, type: true, amount: true, status: true, description: true,
      fee: true, balanceBefore: true, balanceAfter: true, transactionId: true,
      createdAt: true, completedAt: true,
    },
  })

  const unreadNotifications = await prisma.notification.findMany({
    where: {
      notifiableType: "App\\Models\\User",
      notifiableId: user.id,
      readAt: null,
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  })

  const binaryPosition = user.binaryPosition

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const newTeamThisMonth = await prisma.user.count({
    where: { sponsorId: user.id, createdAt: { gte: thisMonth } },
  })

  const activeTeam = await prisma.user.count({
    where: { sponsorId: user.id, isActive: true },
  })
  const inactiveTeam = totalReferrals - activeTeam

  const totalCommission = await prisma.commission.aggregate({
    where: { userId: user.id, status: "PAID" },
    _sum: { amount: true },
  })

  const totalBonus = await prisma.commission.aggregate({
    where: { userId: user.id, status: "PAID", type: "BINARY" },
    _sum: { amount: true },
  })

  return successResponse({
    wallet: wallet ? {
      id: wallet.id, balance: Number(wallet.balance), income_balance: Number(wallet.incomeBalance),
      bonus_balance: Number(wallet.bonusBalance), withdrawable_balance: Number(wallet.withdrawableBalance),
      total_deposited: Number(wallet.totalDeposited), total_withdrawn: Number(wallet.totalWithdrawn),
      total_income: Number(wallet.totalIncome),
    } : null,
    total_balance: Number(wallet?.balance || 0),
    total_income: Number(totalCommission._sum.amount || 0),
    total_bonuses: Number(totalBonus._sum.amount || 0),
    total_team: totalReferrals,
    active_team: activeTeam,
    inactive_team: inactiveTeam,
    new_team_this_month: newTeamThisMonth,
    left_leg: binaryPosition?.totalLeftMembers || 0,
    right_leg: binaryPosition?.totalRightMembers || 0,
    pending_withdrawals: await prisma.withdrawal.count({ where: { userId: user.id, status: "PENDING" } }),
    recent_transactions: recentTransactions.map((t) => ({
      id: t.id, type: t.type.toLowerCase(), amount: Number(t.amount), status: t.status.toLowerCase(),
      description: t.description, fee: Number(t.fee), balance_before: Number(t.balanceBefore),
      balance_after: Number(t.balanceAfter), transaction_id: t.transactionId,
      created_at: t.createdAt.toISOString(), completed_at: t.completedAt?.toISOString() || null,
    })),
    income_chart: [],
    chart_total_income: 0,
    chart_daily_avg: 0,
    income_trend: 12,
    team_trend: 8,
    bonus_trend: 5,
    unread_notifications: unreadNotifications.map((n) => ({
      id: n.id, type: n.type, data: n.data ? JSON.parse(n.data) : null,
      read_at: n.readAt?.toISOString() || null, created_at: n.createdAt.toISOString(),
    })),
  })
}
