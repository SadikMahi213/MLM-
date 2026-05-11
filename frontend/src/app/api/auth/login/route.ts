import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword, signToken } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  try {
    const { email, login, password } = await request.json()
    const identifier = email || login

    if (!identifier || !password) return errorResponse("Email and password are required")

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }, { phone: identifier }] },
      include: {
        package: { select: { id: true, name: true } },
        wallet: { select: { balance: true, incomeBalance: true, withdrawableBalance: true, totalIncome: true } },
      },
    })
    if (!user) return errorResponse("Invalid credentials", 401)

    const valid = await comparePassword(password, user.password)
    if (!valid) return errorResponse("Invalid credentials", 401)
    if (!user.isActive) return errorResponse("Account is inactive", 403)

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null },
    })

    const token = signToken({ userId: user.id, email: user.email })

    return successResponse({
      user: {
        id: user.id, name: user.name, email: user.email, username: user.username, phone: user.phone,
        avatar: user.avatar, profile_photo: user.profilePhoto, profile_photo_url: null,
        country: user.country, city: user.city, telecom_code: user.telecomCode, team: user.team,
        is_active: user.isActive, is_verified: user.isVerified, two_factor_enabled: user.twoFactorEnabled,
        package: user.package ? { id: user.package.id, name: user.package.name } : null,
        wallet: user.wallet ? {
          balance: Number(user.wallet.balance), income_balance: Number(user.wallet.incomeBalance),
          withdrawable_balance: Number(user.wallet.withdrawableBalance), total_income: Number(user.wallet.totalIncome),
        } : null,
        created_at: user.createdAt.toISOString(),
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return errorResponse("Login failed", 500)
  }
}
