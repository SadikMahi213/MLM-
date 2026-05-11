import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse, errorResponse, notFoundResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()
  const { id } = await params

  const withdrawal = await prisma.withdrawal.findUnique({ where: { id: parseInt(id) } })
  if (!withdrawal) return notFoundResponse("Withdrawal")
  if (withdrawal.userId !== user.id) return unauthorizedResponse()
  if (withdrawal.status !== "PENDING") return errorResponse("Can only cancel pending withdrawals")

  await prisma.withdrawal.update({ where: { id: parseInt(id) }, data: { status: "CANCELLED" } })
  await prisma.wallet.update({ where: { userId: user.id }, data: { withdrawableBalance: { increment: withdrawal.amount }, totalWithdrawn: { decrement: withdrawal.amount } } })

  return successResponse({ message: "Withdrawal cancelled" })
}
