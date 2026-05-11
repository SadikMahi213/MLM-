import { NextRequest } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { successResponse, unauthorizedResponse } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) return unauthorizedResponse()

  return successResponse({
    id: user.id, name: user.name, email: user.email, username: user.username, phone: user.phone,
    avatar: user.avatar, profile_photo: user.profilePhoto, profile_photo_url: null,
    country: user.country, city: user.city, address: user.address, date_of_birth: user.dateOfBirth,
    gender: user.gender, telecom_code: user.telecomCode, team: user.team,
    sponsor_id: user.sponsorId, package_id: user.packageId,
    is_active: user.isActive, is_verified: user.isVerified, two_factor_enabled: user.twoFactorEnabled,
    package: user.package ? { id: user.package.id, name: user.package.name } : null,
    wallet: user.wallet ? {
      balance: Number(user.wallet.balance), income_balance: Number(user.wallet.incomeBalance),
      bonus_balance: Number(user.wallet.bonusBalance), withdrawable_balance: Number(user.wallet.withdrawableBalance),
      total_deposited: Number(user.wallet.totalDeposited), total_withdrawn: Number(user.wallet.totalWithdrawn),
      total_income: Number(user.wallet.totalIncome),
    } : null,
    current_rank: user.userRanks[0]?.rank ? { name: user.userRanks[0].rank.name, level: user.userRanks[0].rank.level } : null,
    created_at: user.createdAt.toISOString(), last_login_at: user.lastLoginAt?.toISOString() || null,
  })
}
