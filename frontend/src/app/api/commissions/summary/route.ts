import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const summary = await prisma.commission.groupBy({
    by: ["type"],
    where: { userId: user.id },
    _sum: { amount: true },
    _count: { id: true },
  })

  const totalEarnings = await prisma.commission.aggregate({
    where: { userId: user.id, status: "PAID" },
    _sum: { amount: true },
  })

  const pendingEarnings = await prisma.commission.aggregate({
    where: { userId: user.id, status: "PENDING" },
    _sum: { amount: true },
  })

  return successResponse({
    byType: summary,
    totalEarnings: totalEarnings._sum.amount || 0,
    pendingEarnings: pendingEarnings._sum.amount || 0,
  })
}
