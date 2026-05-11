import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const perPage = parseInt(request.nextUrl.searchParams.get("per_page") || "50")
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1")

  const [commissions, total] = await Promise.all([
    prisma.commission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
      include: {
        fromUser: { select: { id: true, name: true, email: true, username: true } },
      },
    }),
    prisma.commission.count({ where: { userId: user.id } }),
  ])

  return successResponse({
    data: commissions,
    meta: { total, page, perPage, lastPage: Math.ceil(total / perPage) },
  })
}
