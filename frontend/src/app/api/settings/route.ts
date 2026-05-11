import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse } from "@/lib/api-helpers"

export async function GET() {
  const settings = await prisma.setting.findMany({
    where: { isPublic: true },
  })

  const map: Record<string, string> = {}
  for (const s of settings) {
    map[s.key] = s.value || ""
  }

  return successResponse(map)
}
