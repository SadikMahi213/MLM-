import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, signToken } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, sponsorId } = await request.json()

    if (!name || !email || !password) {
      return errorResponse("Name, email, and password are required")
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username: email }] },
    })
    if (existing) {
      return errorResponse("Email already registered", 422)
    }

    const hashed = await hashPassword(password)
    const username = email.split("@")[0] + Math.floor(Math.random() * 1000)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashed,
        phone: phone || null,
        sponsorId: sponsorId ? parseInt(sponsorId) : null,
        isActive: true,
        isVerified: false,
      },
    })

    await prisma.wallet.create({
      data: { userId: user.id },
    })

    const freePackage = await prisma.package.findFirst({ where: { type: "free" } })
    if (freePackage) {
      await prisma.user.update({
        where: { id: user.id },
        data: { packageId: freePackage.id },
      })
    }

    const token = signToken({ userId: user.id, email: user.email })

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
      token,
    }, 201)
  } catch (error) {
    console.error("Register error:", error)
    return errorResponse("Registration failed", 500)
  }
}
