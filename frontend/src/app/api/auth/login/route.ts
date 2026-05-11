import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword, signToken } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return errorResponse("Email and password are required")
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return errorResponse("Invalid credentials", 401)
    }

    const valid = await comparePassword(password, user.password)
    if (!valid) {
      return errorResponse("Invalid credentials", 401)
    }

    if (!user.isActive) {
      return errorResponse("Account is inactive", 403)
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null },
    })

    const token = signToken({ userId: user.id, email: user.email })

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return errorResponse("Login failed", 500)
  }
}
