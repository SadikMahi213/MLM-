import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse, errorResponse, notFoundResponse } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const { id } = await params

  const completion = await prisma.taskCompletion.findUnique({
    where: { id: parseInt(id) },
    include: { dailyTask: true },
  })

  if (!completion) return notFoundResponse("Task completion")
  if (completion.userId !== user.id) return unauthorizedResponse()
  if (completion.rewardClaimed) return errorResponse("Reward already claimed")

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } })
  if (!wallet) return errorResponse("Wallet not found")

  const reward = completion.dailyTask.reward

  await prisma.$transaction([
    prisma.taskCompletion.update({
      where: { id: parseInt(id) },
      data: { rewardClaimed: true, claimedAt: new Date() },
    }),
    prisma.wallet.update({
      where: { userId: user.id },
      data: {
        incomeBalance: { increment: reward },
        withdrawableBalance: { increment: reward },
        totalIncome: { increment: reward },
      },
    }),
    prisma.walletTransaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: "TASK_REWARD",
        amount: reward,
        fee: 0,
        balanceBefore: wallet.balance,
        balanceAfter: Number(wallet.balance) + Number(reward),
        status: "COMPLETED",
        description: `Reward for ${completion.dailyTask.title}`,
        transactionId: "TSK-" + Date.now(),
      },
    }),
  ])

  return successResponse({ message: "Reward claimed", amount: reward })
}
