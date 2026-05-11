import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalUsers = await prisma.user.count()
  const activeUsers = await prisma.user.count({ where: { isActive: true } })
  const todayUsers = await prisma.user.count({ where: { createdAt: { gte: today } } })

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })

  const recentCommissions = await prisma.commission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const totalEarnings = await prisma.commission.aggregate({
    where: { userId: user.id, status: "PAID" },
    _sum: { amount: true },
  })

  const totalReferrals = await prisma.user.count({ where: { sponsorId: user.id } })

  const recentTransactions = await prisma.walletTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const binaryPosition = user.binaryPosition
  const teamStats = binaryPosition
    ? {
        leftMembers: binaryPosition.totalLeftMembers,
        rightMembers: binaryPosition.totalRightMembers,
        leftBv: binaryPosition.leftBv,
        rightBv: binaryPosition.rightBv,
        carryForwardLeft: binaryPosition.carryForwardLeft,
        carryForwardRight: binaryPosition.carryForwardRight,
      }
    : null

  const currentRank = user.userRanks[0]?.rank || null

  return successResponse({
    stats: {
      balance: wallet?.balance || 0,
      incomeBalance: wallet?.incomeBalance || 0,
      bonusBalance: wallet?.bonusBalance || 0,
      withdrawableBalance: wallet?.withdrawableBalance || 0,
      totalDeposited: wallet?.totalDeposited || 0,
      totalWithdrawn: wallet?.totalWithdrawn || 0,
      totalIncome: wallet?.totalIncome || 0,
    },
    totalEarnings: totalEarnings._sum.amount || 0,
    totalReferrals,
    totalUsers,
    activeUsers,
    todayUsers,
    recentCommissions,
    recentTransactions,
    teamStats,
    currentRank,
  })
}
