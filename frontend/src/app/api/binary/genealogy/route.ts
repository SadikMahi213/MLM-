import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  const maxDepth = parseInt(request.nextUrl.searchParams.get("max_depth") || "10")

  const genealogy: Record<string, any> = {}

  async function fetchChildren(parentId: number, pos: string, depth: number): Promise<Record<string, any>> {
    if (depth > maxDepth) return {}

    const children = await prisma.binaryPosition.findMany({ where: { parentId } })
    if (children.length === 0) return {}

    const result: Record<string, any> = {}

    for (const child of children) {
      const childUser = await prisma.user.findUnique({
        where: { id: child.userId },
        select: { id: true, name: true, username: true, avatar: true },
      })
      if (!childUser) continue

      const key = child.position?.toLowerCase() || "unknown"
      result[key] = {
        user: childUser,
        position: child.position,
        level: child.level,
        children: await fetchChildren(child.userId, child.position || "", depth + 1),
      }
    }

    return result
  }

  const position = await prisma.binaryPosition.findUnique({ where: { userId: user.id } })
  if (position) {
    const rootUser = await prisma.user.findUnique({
      where: { id: position.userId },
      select: { id: true, name: true, username: true, avatar: true },
    })
    genealogy["root"] = {
      user: rootUser,
      position: position.position,
      level: position.level,
      children: await fetchChildren(position.userId, position.position || "", 2),
    }
  }

  return successResponse({ genealogy })
}
