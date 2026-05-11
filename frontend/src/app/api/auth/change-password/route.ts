import { NextRequest } from "next/server"
import { getAuthUser, hashPassword, comparePassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return errorResponse("Current password and new password are required")
    }

    if (newPassword.length < 6) {
      return errorResponse("New password must be at least 6 characters")
    }

    const valid = await comparePassword(currentPassword, user.password)
    if (!valid) {
      return errorResponse("Current password is incorrect", 422)
    }

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    })

    return successResponse({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    return errorResponse("Failed to change password", 500)
  }
}
