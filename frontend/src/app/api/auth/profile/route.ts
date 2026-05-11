import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/api-helpers"

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  try {
    const contentType = request.headers.get("content-type") || ""
    let updates: Record<string, any> = {}

    if (contentType.includes("form-data")) {
      const fd = await request.formData()
      for (const [key, value] of fd.entries()) {
        if (key !== "profile_photo" && value instanceof File) continue
        if (key === "profile_photo") continue
        updates[key] = value
      }
    } else {
      updates = await request.json()
    }

    const data: any = {}
    if (updates.name !== undefined) data.name = updates.name
    if (updates.phone !== undefined) data.phone = updates.phone
    if (updates.country !== undefined) data.country = updates.country
    if (updates.city !== undefined) data.city = updates.city
    if (updates.address !== undefined) data.address = updates.address
    if (updates.telecom_code !== undefined) data.telecomCode = updates.telecom_code
    if (updates.gender !== undefined) data.gender = updates.gender
    if (updates.date_of_birth !== undefined) data.dateOfBirth = new Date(updates.date_of_birth)
    if (updates.avatar !== undefined) data.avatar = updates.avatar

    const updated = await prisma.user.update({ where: { id: user.id }, data })

    return successResponse({
      id: updated.id, name: updated.name, email: updated.email, username: updated.username, phone: updated.phone,
      avatar: updated.avatar, profile_photo: updated.profilePhoto, profile_photo_url: null,
      country: updated.country, city: updated.city, address: updated.address, date_of_birth: updated.dateOfBirth,
      gender: updated.gender, telecom_code: updated.telecomCode, team: updated.team,
      sponsor_id: updated.sponsorId, package_id: updated.packageId,
      is_active: updated.isActive, is_verified: updated.isVerified, two_factor_enabled: updated.twoFactorEnabled,
      created_at: updated.createdAt.toISOString(),
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return errorResponse("Failed to update profile", 500)
  }
}
