import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  return successResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    avatar: user.avatar,
    profilePhoto: user.profilePhoto,
    country: user.country,
    city: user.city,
    address: user.address,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    telecomCode: user.telecomCode,
    team: user.team,
    isActive: user.isActive,
    isVerified: user.isVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    sponsorId: user.sponsorId,
    packageId: user.packageId,
    package: user.package,
    wallet: user.wallet,
    binaryPosition: user.binaryPosition,
    currentRank: user.userRanks[0]?.rank || null,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  })
}
