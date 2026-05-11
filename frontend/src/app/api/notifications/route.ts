import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const perPage = parseInt(request.nextUrl.searchParams.get("per_page") || "50")
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1")

  const where = { notifiableType: "App\\Models\\User", notifiableId: user.id }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, take: perPage, skip: (page - 1) * perPage }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, readAt: null } }),
  ])

  return successResponse({
    data: notifications.map((n) => ({
      id: n.id, type: n.type, data: n.data || null, read_at: n.readAt?.toISOString() || null,
      created_at: n.createdAt.toISOString(),
    })),
    meta: { total, page, perPage, lastPage: Math.ceil(total / perPage), unreadCount },
  })
}
