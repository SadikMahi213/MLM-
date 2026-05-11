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
    id: wallet.id, balance: Number(wallet.balance), income_balance: Number(wallet.incomeBalance),
    bonus_balance: Number(wallet.bonusBalance), withdrawable_balance: Number(wallet.withdrawableBalance),
    total_deposited: Number(wallet.totalDeposited), total_withdrawn: Number(wallet.totalWithdrawn),
    total_income: Number(wallet.totalIncome),
  })
}
