import { successResponse } from "@/lib/api-helpers"

export async function POST() {
  return successResponse({ message: "Logged out successfully" })
}
