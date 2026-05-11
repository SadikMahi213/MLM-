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
    prisma.withdrawal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: perPage, skip: (page - 1) * perPage }),
    prisma.withdrawal.count({ where: { userId: user.id } }),
  ])

  return successResponse({
    data: withdrawals.map((w) => ({
      id: w.id, amount: Number(w.amount), fee: Number(w.fee), net_amount: Number(w.netAmount),
      payment_method: w.paymentMethod?.toLowerCase() || "bank", account_number: w.accountNumber,
      account_holder: w.accountHolder, status: w.status.toLowerCase(), admin_note: w.adminNote,
      created_at: w.createdAt.toISOString(), completed_at: w.completedAt?.toISOString() || null,
    })),
    meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) },
  })
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  try {
    const { amount, payment_method, account_number, account_holder } = await request.json()
    if (!amount || amount <= 0) return errorResponse("Invalid withdrawal amount")

    const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
    if (!wallet || Number(wallet.withdrawableBalance) < amount) return errorResponse("Insufficient withdrawable balance")

    const fee = amount * 0.02
    const netAmount = amount - fee

    const withdrawal = await prisma.withdrawal.create({
      data: { userId: user.id, amount, fee, netAmount, paymentMethod: (payment_method || "BANK_TRANSFER").toUpperCase(), accountNumber: account_number || null, accountHolder: account_holder || null, status: "PENDING" },
    })

    await prisma.wallet.update({ where: { userId: user.id }, data: { withdrawableBalance: { decrement: amount }, totalWithdrawn: { increment: amount } } })

    return successResponse({ id: withdrawal.id, amount: Number(amount), fee: Number(fee), net_amount: Number(netAmount), status: "pending", created_at: withdrawal.createdAt.toISOString() }, 201)
  } catch (error) {
    console.error("Withdrawal error:", error)
    return errorResponse("Withdrawal failed", 500)
  }
}
