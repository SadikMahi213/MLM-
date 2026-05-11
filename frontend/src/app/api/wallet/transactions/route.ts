import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const perPage = parseInt(request.nextUrl.searchParams.get("per_page") || "50")
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1")

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
    }),
    prisma.walletTransaction.count({ where: { userId: user.id } }),
  ])

  return successResponse({
    data: transactions.map((t) => ({
      id: t.id, type: t.type.toLowerCase(), amount: Number(t.amount), fee: Number(t.fee),
      balance_before: Number(t.balanceBefore), balance_after: Number(t.balanceAfter),
      status: t.status.toLowerCase(), description: t.description, transaction_id: t.transactionId,
      created_at: t.createdAt.toISOString(), completed_at: t.completedAt?.toISOString() || null,
    })),
    meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) },
  })
}
