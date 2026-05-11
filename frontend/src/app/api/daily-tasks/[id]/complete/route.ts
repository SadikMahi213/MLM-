import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()
  const { id } = await params
  const taskId = parseInt(id)
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const existing = await prisma.taskCompletion.findFirst({ where: { userId: user.id, dailyTaskId: taskId, completedDate: { gte: today } } })
  if (existing) return errorResponse("Task already completed today")

  const completion = await prisma.taskCompletion.create({ data: { userId: user.id, dailyTaskId: taskId, completedDate: today, rewardClaimed: false } })
  return successResponse({ id: completion.id, completed_today: true }, 201)
}
