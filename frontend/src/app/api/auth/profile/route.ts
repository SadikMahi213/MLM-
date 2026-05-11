import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-helpers"

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  try {
    const { name, phone, country, city, address, dateOfBirth, gender, avatar } = await request.json()

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(country !== undefined && { country }),
        ...(city !== undefined && { city }),
        ...(address !== undefined && { address }),
        ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
        ...(gender !== undefined && { gender }),
        ...(avatar !== undefined && { avatar }),
      },
    })

    return successResponse({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      country: updated.country,
      city: updated.city,
      address: updated.address,
      dateOfBirth: updated.dateOfBirth,
      gender: updated.gender,
      avatar: updated.avatar,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return errorResponse("Failed to update profile", 500)
  }
}
