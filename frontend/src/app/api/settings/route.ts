import { prisma } from "@/lib/prisma"
import { successResponse } from "@/lib/api-helpers"

export async function GET() {
  const settings = await prisma.setting.findMany({ where: { isPublic: true } })
  const map: Record<string, any> = {}
  for (const s of settings) {
    const val = s.value || ""
    map[s.key] = s.type === "number" ? Number(val) : s.type === "boolean" ? val === "true" || val === "1" : val
  }
  return successResponse(map)
}
