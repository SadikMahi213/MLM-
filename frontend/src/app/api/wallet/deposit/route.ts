import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  try {
    const { amount, payment_method } = await request.json()
    if (!amount || amount <= 0) return errorResponse("Invalid deposit amount")

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
    if (!wallet) return errorResponse("Wallet not found")

    const transaction = await prisma.walletTransaction.create({
      data: {
        userId: user.id, walletId: wallet.id, type: "DEPOSIT", amount, fee: 0,
        balanceBefore: wallet.balance, balanceAfter: wallet.balance,
        status: "PENDING", description: `Deposit via ${payment_method || "bank_transfer"}`,
        transactionId: "DEP-" + Date.now() + Math.random().toString(36).slice(2, 8),
      },
    })

    return successResponse({
      id: transaction.id, type: transaction.type.toLowerCase(), amount: Number(transaction.amount),
      status: transaction.status.toLowerCase(), description: transaction.description,
      created_at: transaction.createdAt.toISOString(),
    }, 201)
  } catch (error) {
    console.error("Deposit error:", error)
    return errorResponse("Deposit failed", 500)
  }
}
