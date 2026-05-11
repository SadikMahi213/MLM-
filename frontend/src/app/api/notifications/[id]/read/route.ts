import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()
  const { id } = await params
  try {
    await prisma.notification.update({ where: { id }, data: { readAt: new Date() } })
    return successResponse({ message: "Notification marked as read" })
  } catch { return errorResponse("Notification not found", 404) }
}
