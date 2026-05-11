import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const depth = parseInt(request.nextUrl.searchParams.get("depth") || "5")

  const position = await prisma.binaryPosition.findUnique({
    where: { userId: user.id },
  })

  if (!position) {
    return successResponse({ user: null, tree: null })
  }

  async function buildTree(position: any, currentDepth: number): Promise<any> {
    if (currentDepth > depth || !position) return null

    const children = await prisma.binaryPosition.findMany({
      where: { parentId: position.userId },
    })

    const userData = await prisma.user.findUnique({
      where: { id: position.userId },
      select: { id: true, name: true, email: true, avatar: true, username: true },
    })

    const [leftChild, rightChild] = children

    return {
      user: userData,
      position: { ...position, children: [] },
      left: leftChild ? await buildTree(leftChild, currentDepth + 1) : null,
      right: rightChild ? await buildTree(rightChild, currentDepth + 1) : null,
    }
  }

  const tree = await buildTree(position, 1)

  return successResponse({ user, tree })
}
