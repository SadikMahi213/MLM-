import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tasks = await prisma.dailyTask.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  })

  const completions = await prisma.taskCompletion.findMany({
    where: {
      userId: user.id,
      completedDate: { gte: today },
    },
  })

  const tasksWithStatus = tasks.map((task) => {
    const completed = completions.find((c) => c.dailyTaskId === task.id)
    return {
      ...task,
      isCompleted: !!completed,
      rewardClaimed: completed?.rewardClaimed || false,
      completionId: completed?.id || null,
    }
  })

  return successResponse({ data: tasksWithStatus })
}
