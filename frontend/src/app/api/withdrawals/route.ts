import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const perPage = parseInt(request.nextUrl.searchParams.get("per_page") || "50")
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1")

  const [withdrawals, total] = await Promise.all([
    prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    prisma.withdrawal.count({ where: { userId: user.id } }),
  ])

  return successResponse({
    data: withdrawals,
    meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) },
  })
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  try {
    const { amount, paymentMethod, accountNumber, accountHolder } = await request.json()

    if (!amount || amount <= 0) {
      return errorResponse("Invalid withdrawal amount")
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
    if (!wallet || wallet.withdrawableBalance < amount) {
      return errorResponse("Insufficient withdrawable balance")
    }

    const fee = amount * 0.02
    const netAmount = amount - fee

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: user.id,
        amount,
        fee,
        netAmount,
        paymentMethod: paymentMethod || "BANK_TRANSFER",
        accountNumber: accountNumber || null,
        accountHolder: accountHolder || null,
        status: "PENDING",
      },
    })

    await prisma.wallet.update({
      where: { userId: user.id },
      data: {
        withdrawableBalance: { decrement: amount },
        totalWithdrawn: { increment: amount },
      },
    })

    await prisma.walletTransaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: "WITHDRAWAL",
        amount,
        fee,
        balanceBefore: wallet.withdrawableBalance,
        balanceAfter: Number(wallet.withdrawableBalance) - Number(amount),
        status: "PENDING",
        description: `Withdrawal via ${paymentMethod}`,
        transactionId: "WTH-" + Date.now(),
      },
    })

    return successResponse(withdrawal, 201)
  } catch (error) {
    console.error("Withdrawal error:", error)
    return errorResponse("Withdrawal failed", 500)
  }
}
