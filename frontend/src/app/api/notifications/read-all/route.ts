import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()
  await prisma.notification.updateMany({
    where: { notifiableType: "App\\Models\\User", notifiableId: user.id, readAt: null },
    data: { readAt: new Date() },
  })
  return successResponse({ message: "All notifications marked as read" })
}
