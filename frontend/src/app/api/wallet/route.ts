import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
  if (!wallet) return successResponse(null)

  return successResponse({
    id: wallet.id,
    userId: wallet.userId,
    balance: wallet.balance,
    incomeBalance: wallet.incomeBalance,
    bonusBalance: wallet.bonusBalance,
    withdrawableBalance: wallet.withdrawableBalance,
    totalDeposited: wallet.totalDeposited,
    totalWithdrawn: wallet.totalWithdrawn,
    totalIncome: wallet.totalIncome,
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  })
}
