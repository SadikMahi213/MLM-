import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, signToken } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""
    let name = "", email = "", password = "", phone: string | null = null, sponsorCode: string | null = null, team: string | null = null

    if (contentType.includes("form-data")) {
      const fd = await request.formData()
      name = (fd.get("name") as string) || ""
      email = (fd.get("email") as string) || ""
      password = (fd.get("password") as string) || ""
      phone = (fd.get("phone") as string) || null
      sponsorCode = (fd.get("sponsor_code") as string) || null
      team = (fd.get("team") as string) || null
    } else {
      const body = await request.json()
      name = body.name || ""
      email = body.email || ""
      password = body.password || ""
      phone = body.phone || null
      sponsorCode = body.sponsor_code || body.sponsorCode || null
      team = body.team || null
    }

    if (!name || !email || !password) return errorResponse("Name, email, and password are required")

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username: email }] } })
    if (existing) return errorResponse("Email already registered", 422)

    const hashed = await hashPassword(password)
    const username = email.split("@")[0] + Math.floor(Math.random() * 1000)

    let sponsorId: number | null = null
    if (sponsorCode) {
      const sponsor = await prisma.user.findFirst({ where: { OR: [{ username: sponsorCode }, { email: sponsorCode }] } })
      if (sponsor) sponsorId = sponsor.id
    }

    const user = await prisma.user.create({
      data: { name, email, username, password: hashed, phone, sponsorId, team: team || null, isActive: true, isVerified: false },
    })

    await prisma.wallet.create({ data: { userId: user.id } })

    const freePackage = await prisma.package.findFirst({ where: { type: "free" } })
    if (freePackage) await prisma.user.update({ where: { id: user.id }, data: { packageId: freePackage.id } })

    const token = signToken({ userId: user.id, email: user.email })

    return successResponse({
      user: {
        id: user.id, name: user.name, email: user.email, username: user.username, phone: user.phone,
        avatar: null, profile_photo: null, profile_photo_url: null,
        country: null, city: null, telecom_code: null, team: user.team,
        is_active: user.isActive, is_verified: user.isVerified, two_factor_enabled: user.twoFactorEnabled,
        package: freePackage ? { id: freePackage.id, name: freePackage.name } : null,
        wallet: { balance: 0, income_balance: 0, withdrawable_balance: 0, total_income: 0 },
        created_at: user.createdAt.toISOString(),
      },
      token,
    }, 201)
  } catch (error) {
    console.error("Register error:", error)
    return errorResponse("Registration failed", 500)
  }
}
