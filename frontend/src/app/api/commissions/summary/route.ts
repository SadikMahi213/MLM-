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

  return successResponse({
    total: Number(totalEarnings._sum.amount || 0),
    by_type: summary.map((s) => ({ type: s.type.toLowerCase(), total: Number(s._sum.amount || 0), count: s._count.id })),
  })
}
