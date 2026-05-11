import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: { package: { select: { id: true, name: true } }, wallet: true },
  })
  if (!userData) return unauthorizedResponse()

  const totalEarnings = await prisma.commission.aggregate({ where: { userId: user.id, status: "PAID" }, _sum: { amount: true } })
  const pendingEarnings = await prisma.commission.aggregate({ where: { userId: user.id, status: "PENDING" }, _sum: { amount: true } })
  const totalReferrals = await prisma.user.count({ where: { sponsorId: user.id } })
  const activeTeam = await prisma.user.count({ where: { sponsorId: user.id, isActive: true } })

  const recentTransactions = await prisma.walletTransaction.findMany({
    where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10,
  })

  const lastWithdrawal = await prisma.withdrawal.findFirst({
    where: { userId: user.id }, orderBy: { createdAt: "desc" },
  })

  const currentRank = user.userRanks[0]?.rank || null
  const ranks = await prisma.rank.findMany({ orderBy: { level: "asc" } })
  const nextRankIndex = currentRank ? ranks.findIndex((r) => r.id === currentRank.id) + 1 : 0
  const nextRank = nextRankIndex < ranks.length ? ranks[nextRankIndex] : null

  const unreadCount = await prisma.notification.count({ where: { notifiableType: "App\\Models\\User", notifiableId: user.id, readAt: null } })

  return successResponse({
    user: {
      id: userData.id, name: userData.name, email: userData.email, username: userData.username, phone: userData.phone,
      avatar: userData.avatar, profile_photo: userData.profilePhoto, profile_photo_url: null,
      country: userData.country, city: userData.city, telecom_code: userData.telecomCode, team: userData.team,
      sponsor_id: userData.sponsorId, package_id: userData.packageId,
      is_active: userData.isActive, is_verified: userData.isVerified, two_factor_enabled: userData.twoFactorEnabled,
      package: userData.package ? { id: userData.package.id, name: userData.package.name } : null,
      created_at: userData.createdAt.toISOString(),
    },
    wallet: userData.wallet ? {
      balance: Number(userData.wallet.balance), income_balance: Number(userData.wallet.incomeBalance),
      bonus_balance: Number(userData.wallet.bonusBalance), withdrawable_balance: Number(userData.wallet.withdrawableBalance),
      total_deposited: Number(userData.wallet.totalDeposited), total_withdrawn: Number(userData.wallet.totalWithdrawn),
      total_income: Number(userData.wallet.totalIncome),
    } : null,
    total_earnings: Number(totalEarnings._sum.amount || 0),
    pending_earnings: Number(pendingEarnings._sum.amount || 0),
    current_month_earnings: 0,
    total_team: totalReferrals,
    active_team: activeTeam,
    recent_transactions: recentTransactions.map((t) => ({
      id: t.id, type: t.type.toLowerCase(), amount: Number(t.amount), status: t.status.toLowerCase(),
      description: t.description, created_at: t.createdAt.toISOString(),
    })),
    last_withdrawal: lastWithdrawal ? {
      amount: Number(lastWithdrawal.amount), payment_method: lastWithdrawal.paymentMethod?.toLowerCase() || "bank",
      status: lastWithdrawal.status.toLowerCase(),
    } : null,
    current_rank: currentRank ? { name: currentRank.name, icon: getRankIcon(currentRank.level), level: currentRank.level } : null,
    next_rank: nextRank ? { name: nextRank.name, level: nextRank.level } : null,
    unread_notifications_count: unreadCount,
  })
}

function getRankIcon(level: number): string {
  const icons = ["", "star", "medal", "crown", "gem", "trophy", "diamond"]
  return icons[level] || "star"
}
