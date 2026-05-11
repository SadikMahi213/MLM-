import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const maxDepth = parseInt(request.nextUrl.searchParams.get("max_depth") || "10")

  const genealogy: any[] = []

  async function fetchReferrals(userId: number, depth: number) {
    if (depth > maxDepth) return

    const referrals = await prisma.user.findMany({
      where: { sponsorId: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
        package: { select: { name: true } },
        binaryPosition: { select: { position: true, leftBv: true, rightBv: true } },
        userRanks: { where: { isCurrent: true }, include: { rank: { select: { name: true } } } },
      },
    })

    for (const ref of referrals) {
      genealogy.push({
        ...ref,
        depth,
        children: await fetchReferrals(ref.id, depth + 1),
      })
    }

    return referrals.length
  }

  await fetchReferrals(user.id, 1)

  return successResponse({ data: genealogy, total: genealogy.length })
}
