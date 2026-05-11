import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tasks = await prisma.dailyTask.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } })

  const completions = await prisma.taskCompletion.findMany({
    where: { userId: user.id, completedDate: { gte: today } },
  })

  return successResponse({
    data: tasks.map((t) => ({
      id: t.id, title: t.title, description: t.description, reward: Number(t.reward),
      type: t.type.toLowerCase(), requirements: t.requirements, is_active: t.isActive,
      completed_today: completions.some((c) => c.dailyTaskId === t.id && !c.rewardClaimed),
      reward_claimed: completions.some((c) => c.dailyTaskId === t.id && c.rewardClaimed),
      created_at: t.createdAt.toISOString(), updated_at: t.updatedAt.toISOString(),
    })),
  })
}
