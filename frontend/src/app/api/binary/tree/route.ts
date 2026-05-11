import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const depth = parseInt(request.nextUrl.searchParams.get("depth") || "5")

  const position = await prisma.binaryPosition.findUnique({ where: { userId: user.id } })
  if (!position) return successResponse({ tree: null })

  async function buildTree(pos: any, currentDepth: number): Promise<any> {
    if (currentDepth > depth || !pos) return null

    const children = await prisma.binaryPosition.findMany({ where: { parentId: pos.userId } })
    const userData = await prisma.user.findUnique({
      where: { id: pos.userId },
      select: { id: true, name: true, username: true, avatar: true },
    })

    const [leftChild, rightChild] = children

    return {
      id: userData?.id, name: userData?.name, username: userData?.username, avatar: userData?.avatar,
      position: pos.position, level: pos.level,
      left_bv: Number(pos.leftBv), right_bv: Number(pos.rightBv),
      total_left: pos.totalLeftMembers, total_right: pos.totalRightMembers,
      left: leftChild ? await buildTree(leftChild, currentDepth + 1) : null,
      right: rightChild ? await buildTree(rightChild, currentDepth + 1) : null,
    }
  }

  const tree = await buildTree(position, 1)
  return successResponse({ tree })
}
