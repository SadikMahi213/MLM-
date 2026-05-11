import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function main() {
  console.log("Seeding database...")

  // Clean existing data
  await prisma.roleHasPermission.deleteMany()
  await prisma.modelHasRole.deleteMany()
  await prisma.modelHasPermission.deleteMany()
  await prisma.userRank.deleteMany()
  await prisma.taskCompletion.deleteMany()
  await prisma.walletTransaction.deleteMany()
  await prisma.commission.deleteMany()
  await prisma.binaryPosition.deleteMany()
  await prisma.withdrawal.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.deviceSession.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.wallet.deleteMany()
  await prisma.user.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.dailyTask.deleteMany()
  await prisma.product.deleteMany()
  await prisma.commissionRule.deleteMany()
  await prisma.rank.deleteMany()
  await prisma.package.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.role.deleteMany()

  const now = new Date()

  // ─── Packages ──────────────────────────────────
  const freePkg = await prisma.package.create({
    data: { name: "Free", price: 0, dailyIncome: 0, binaryBonusPercent: 0, referralBonusPercent: 5, generationBonusPercent: 1, durationDays: 0, sortOrder: 0, type: "free", isActive: true },
  })
  await prisma.package.create({ data: { name: "Starter", price: 100, dailyIncome: 1.5, binaryBonusPercent: 8, referralBonusPercent: 10, generationBonusPercent: 3, durationDays: 365, sortOrder: 1, type: "paid", isActive: true } })
  await prisma.package.create({ data: { name: "Professional", price: 500, dailyIncome: 8, binaryBonusPercent: 10, referralBonusPercent: 10, generationBonusPercent: 5, durationDays: 365, sortOrder: 2, type: "paid", isActive: true } })
  const elitePkg = await prisma.package.create({ data: { name: "Elite", price: 1000, dailyIncome: 20, binaryBonusPercent: 12, referralBonusPercent: 10, generationBonusPercent: 5, durationDays: 365, sortOrder: 3, type: "paid", isActive: true } })
  console.log("Packages created")

  // ─── Ranks ─────────────────────────────────────
  const rankData = [
    { name: "Associate", level: 1, minDirectReferrals: 0, minTeamMembers: 0, minActiveTeam: 0, minTeamBv: 0, bonusPercent: 0 },
    { name: "Bronze", level: 2, minDirectReferrals: 3, minTeamMembers: 10, minActiveTeam: 5, minTeamBv: 500, bonusPercent: 2 },
    { name: "Silver", level: 3, minDirectReferrals: 5, minTeamMembers: 25, minActiveTeam: 15, minTeamBv: 2000, bonusPercent: 4 },
    { name: "Gold", level: 4, minDirectReferrals: 10, minTeamMembers: 50, minActiveTeam: 30, minTeamBv: 5000, bonusPercent: 6 },
    { name: "Platinum", level: 5, minDirectReferrals: 20, minTeamMembers: 100, minActiveTeam: 60, minTeamBv: 15000, bonusPercent: 8 },
    { name: "Diamond", level: 6, minDirectReferrals: 30, minTeamMembers: 200, minActiveTeam: 120, minTeamBv: 50000, bonusPercent: 10 },
  ]
  const ranks = await Promise.all(rankData.map((r) => prisma.rank.create({ data: { ...r, isActive: true } })))
  console.log("Ranks created")

  // ─── Permissions & Roles ──────────────────────
  const permNames = ["view_dashboard", "view_wallet", "view_commissions", "view_binary", "view_genealogy", "view_withdrawals", "manage_profile"]
  const perms = await Promise.all(permNames.map((name) => prisma.permission.create({ data: { name, guardName: "web" } })))
  const adminRole = await prisma.role.create({ data: { name: "Super Admin", guardName: "web" } })
  const memberRole = await prisma.role.create({ data: { name: "Member", guardName: "web" } })
  await prisma.roleHasPermission.createMany({
    data: [...perms.map((p) => ({ permissionId: p.id, roleId: adminRole.id })), ...perms.map((p) => ({ permissionId: p.id, roleId: memberRole.id }))],
  })
  console.log("Permissions and roles created")

  // ─── Commission Rules ─────────────────────────
  await prisma.commissionRule.createMany({
    data: [
      { name: "Direct Referral", type: "referral", level: 1, percentage: 10, isActive: true },
      { name: "Binary Matching", type: "binary", level: 1, percentage: 8, isActive: true },
      { name: "Generation Level 1", type: "generation", level: 1, percentage: 5, isActive: true },
      { name: "Generation Level 2", type: "generation", level: 2, percentage: 3, isActive: true },
      { name: "Generation Level 3", type: "generation", level: 3, percentage: 1, isActive: true },
    ],
  })
  console.log("Commission rules created")

  // ─── Settings ─────────────────────────────────
  await prisma.setting.createMany({
    data: [
      { key: "site_name", value: "MLM Saudi", group: "general", type: "string", isPublic: true },
      { key: "site_description", value: "Multi-Level Marketing Platform", group: "general", type: "text", isPublic: true },
      { key: "min_withdrawal", value: "10", group: "withdrawal", type: "number", isPublic: true },
      { key: "max_withdrawal", value: "10000", group: "withdrawal", type: "number", isPublic: true },
      { key: "withdrawal_fee", value: "2", group: "withdrawal", type: "number", isPublic: true },
      { key: "daily_withdrawal_limit", value: "5000", group: "withdrawal", type: "number", isPublic: true },
      { key: "referral_percent", value: "10", group: "commission", type: "number", isPublic: true },
      { key: "binary_matching_percent", value: "10", group: "commission", type: "number", isPublic: true },
      { key: "require_sponsor", value: "true", group: "registration", type: "boolean", isPublic: true },
      { key: "default_position", value: "auto", group: "binary", type: "string", isPublic: true },
    ],
  })
  console.log("Settings created")

  // ─── Daily Tasks ──────────────────────────────
  await prisma.dailyTask.createMany({
    data: [
      { title: "Daily Login", description: "Login to your account", reward: 1, type: "DAILY", requirements: { action: "login" }, isActive: true },
      { title: "Visit Dashboard", description: "Visit your dashboard", reward: 1, type: "DAILY", requirements: { action: "visit_dashboard" }, isActive: true },
      { title: "Share Referral Link", description: "Share your referral link", reward: 2, type: "DAILY", requirements: { action: "share" }, isActive: true },
      { title: "Watch Training Video", description: "Watch a training video", reward: 3, type: "DAILY", requirements: { action: "watch_video" }, isActive: true },
      { title: "Complete Profile", description: "Complete your profile information", reward: 2, type: "WEEKLY", requirements: { action: "complete_profile" }, isActive: true },
    ],
  })
  console.log("Daily tasks created")

  // ─── Products ─────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: "Business Starter Kit", description: "Complete business starter package", price: 49.99, comparePrice: 79.99, category: "training", stock: 100, sku: "BSK-001", isActive: true },
      { name: "Training Course - Level 1", description: "Comprehensive training for new members", price: 29.99, comparePrice: 59.99, category: "training", stock: 200, sku: "TRN-001", isActive: true },
      { name: "Marketing Bundle", description: "Digital marketing materials and tools", price: 99.99, comparePrice: 149.99, category: "marketing", stock: 50, sku: "MKT-001", isActive: true },
      { name: "Premium Webinar Access", description: "Access to all premium webinars for 1 year", price: 199.99, comparePrice: 299.99, category: "training", stock: 500, sku: "WEB-001", isActive: true },
      { name: "Success Package", description: "All-in-one success package", price: 499.99, comparePrice: 699.99, category: "bundles", stock: 25, sku: "SUC-001", isActive: true },
    ],
  })
  console.log("Products created")

  // ─── Users ────────────────────────────────────
  const password = await bcrypt.hash("password123", 12)

  const admin = await prisma.user.create({ data: { name: "Admin User", email: "admin@mlmpro.com", username: "admin", password, isActive: true, isVerified: true, packageId: elitePkg.id } })
  await prisma.wallet.create({ data: { userId: admin.id, balance: 25000, incomeBalance: 15000, bonusBalance: 5000, withdrawableBalance: 20000, totalDeposited: 10000, totalWithdrawn: 3000, totalIncome: 15000 } })
  await prisma.binaryPosition.create({ data: { userId: admin.id, position: "L", path: "L", level: 1 } })
  await prisma.userRank.create({ data: { userId: admin.id, rankId: ranks[5].id, isCurrent: true, achievedAt: now } })
  await prisma.modelHasRole.create({ data: { roleId: adminRole.id, modelType: "App\\Models\\User", modelId: admin.id } })

  const user1 = await prisma.user.create({ data: { name: "Ahmed Ali", email: "ahmed@example.com", username: "ahmedali", phone: "+966501234567", password, sponsorId: admin.id, isActive: true, isVerified: true, packageId: 2, country: "Saudi Arabia", city: "Riyadh", team: "A" } })
  await prisma.wallet.create({ data: { userId: user1.id, balance: 5000, incomeBalance: 3500, bonusBalance: 1000, withdrawableBalance: 4500, totalDeposited: 2000, totalWithdrawn: 500, totalIncome: 3500 } })
  await prisma.binaryPosition.create({ data: { userId: user1.id, parentId: admin.id, position: "L", path: "LL", level: 2 } })
  await prisma.userRank.create({ data: { userId: user1.id, rankId: ranks[2].id, isCurrent: true, achievedAt: now } })
  await prisma.modelHasRole.create({ data: { roleId: memberRole.id, modelType: "App\\Models\\User", modelId: user1.id } })

  const user2 = await prisma.user.create({ data: { name: "Sara Mohammed", email: "sara@example.com", username: "saramoh", phone: "+966502345678", password, sponsorId: admin.id, isActive: true, isVerified: true, packageId: 1, country: "Saudi Arabia", city: "Jeddah", team: "B" } })
  await prisma.wallet.create({ data: { userId: user2.id, balance: 1500, incomeBalance: 800, bonusBalance: 300, withdrawableBalance: 1200, totalDeposited: 500, totalWithdrawn: 100, totalIncome: 800 } })
  await prisma.binaryPosition.create({ data: { userId: user2.id, parentId: admin.id, position: "R", path: "LR", level: 2 } })
  await prisma.userRank.create({ data: { userId: user2.id, rankId: ranks[1].id, isCurrent: true, achievedAt: now } })
  await prisma.modelHasRole.create({ data: { roleId: memberRole.id, modelType: "App\\Models\\User", modelId: user2.id } })

  const user3 = await prisma.user.create({ data: { name: "Khalid Omar", email: "khalid@example.com", username: "khalidomar", phone: "+966503456789", password, sponsorId: user1.id, isActive: true, isVerified: false, packageId: 1, country: "Saudi Arabia", city: "Mecca", team: "A" } })
  await prisma.wallet.create({ data: { userId: user3.id, balance: 800, incomeBalance: 200, bonusBalance: 100, withdrawableBalance: 300, totalDeposited: 500, totalWithdrawn: 200, totalIncome: 200 } })
  await prisma.binaryPosition.create({ data: { userId: user3.id, parentId: user1.id, position: "L", path: "LLL", level: 3 } })
  await prisma.modelHasRole.create({ data: { roleId: memberRole.id, modelType: "App\\Models\\User", modelId: user3.id } })

  const user4 = await prisma.user.create({ data: { name: "Nora Fahad", email: "nora@example.com", username: "norafahad", phone: "+966504567890", password, sponsorId: user1.id, isActive: true, isVerified: true, packageId: 2, country: "Saudi Arabia", city: "Dammam", team: "B" } })
  await prisma.wallet.create({ data: { userId: user4.id, balance: 3200, incomeBalance: 1800, bonusBalance: 600, withdrawableBalance: 2400, totalDeposited: 1000, totalWithdrawn: 400, totalIncome: 1800 } })
  await prisma.binaryPosition.create({ data: { userId: user4.id, parentId: user1.id, position: "R", path: "LLR", level: 3 } })
  await prisma.userRank.create({ data: { userId: user4.id, rankId: ranks[2].id, isCurrent: true, achievedAt: now } })
  await prisma.modelHasRole.create({ data: { roleId: memberRole.id, modelType: "App\\Models\\User", modelId: user4.id } })

  const user5 = await prisma.user.create({ data: { name: "Omar Hani", email: "omar@example.com", username: "omarhani", phone: "+966505678901", password, sponsorId: user2.id, isActive: true, isVerified: false, packageId: 1, country: "Saudi Arabia", city: "Medina", team: "A" } })
  await prisma.wallet.create({ data: { userId: user5.id, balance: 400, incomeBalance: 100, bonusBalance: 50, withdrawableBalance: 150, totalDeposited: 200, totalWithdrawn: 50, totalIncome: 100 } })
  await prisma.binaryPosition.create({ data: { userId: user5.id, parentId: user2.id, position: "L", path: "LRL", level: 3 } })
  await prisma.modelHasRole.create({ data: { roleId: memberRole.id, modelType: "App\\Models\\User", modelId: user5.id } })
  console.log("Users created")

  // ─── Commissions ──────────────────────────────
  await prisma.commission.createMany({
    data: [
      { userId: admin.id, fromUserId: user1.id, type: "REFERRAL", amount: 50, percentage: 10, status: "PAID", description: "Referral commission from Ahmed Ali", creditedAt: now },
      { userId: admin.id, fromUserId: user2.id, type: "REFERRAL", amount: 10, percentage: 10, status: "PAID", description: "Referral commission from Sara Mohammed", creditedAt: now },
      { userId: user1.id, fromUserId: user3.id, type: "REFERRAL", amount: 10, percentage: 10, status: "PAID", description: "Referral commission from Khalid Omar", creditedAt: now },
      { userId: user1.id, fromUserId: user4.id, type: "REFERRAL", amount: 50, percentage: 10, status: "PAID", description: "Referral commission from Nora Fahad", creditedAt: now },
      { userId: user2.id, fromUserId: user5.id, type: "REFERRAL", amount: 10, percentage: 10, status: "PAID", description: "Referral commission from Omar Hani", creditedAt: now },
      { userId: admin.id, fromUserId: user1.id, type: "BINARY", amount: 80, percentage: 8, status: "PAID", description: "Binary matching bonus", creditedAt: now },
      { userId: admin.id, fromUserId: user2.id, type: "BINARY", amount: 120, percentage: 8, status: "PAID", description: "Binary matching bonus", creditedAt: now },
      { userId: user1.id, fromUserId: user4.id, type: "BINARY", amount: 40, percentage: 8, status: "PAID", description: "Binary matching bonus", creditedAt: now },
      { userId: admin.id, type: "DAILY_INCOME", amount: 20, percentage: 2, status: "PAID", description: "Daily income from Elite package", creditedAt: now },
      { userId: user1.id, type: "DAILY_INCOME", amount: 8, percentage: 2, status: "PAID", description: "Daily income from Professional package", creditedAt: now },
      { userId: user2.id, type: "DAILY_INCOME", amount: 1.5, percentage: 2, status: "PAID", description: "Daily income from Starter package", creditedAt: now },
    ],
  })
  console.log("Commissions created")

  // ─── Notifications ────────────────────────────
  await prisma.notification.createMany({
    data: [
      { type: "SUCCESS", notifiableType: "App\\Models\\User", notifiableId: admin.id, data: JSON.stringify({ title: "Welcome!", message: "Welcome to MLM Saudi platform" }) },
      { type: "INFO", notifiableType: "App\\Models\\User", notifiableId: admin.id, data: JSON.stringify({ title: "New Referral", message: "Ahmed Ali joined under you" }) },
      { type: "SUCCESS", notifiableType: "App\\Models\\User", notifiableId: admin.id, data: JSON.stringify({ title: "Commission Earned", message: "You earned $50 referral commission" }) },
      { type: "SUCCESS", notifiableType: "App\\Models\\User", notifiableId: admin.id, data: JSON.stringify({ title: "Binary Bonus", message: "You earned $80 binary bonus" }), readAt: now },
      { type: "SUCCESS", notifiableType: "App\\Models\\User", notifiableId: user1.id, data: JSON.stringify({ title: "Welcome!", message: "Welcome to MLM Saudi platform" }) },
      { type: "SUCCESS", notifiableType: "App\\Models\\User", notifiableId: user1.id, data: JSON.stringify({ title: "Commission Earned", message: "You earned $10 referral commission" }) },
    ],
  })
  console.log("Notifications created")

  console.log("\n✓ Database seeded successfully!")
  console.log("\nCredentials:")
  console.log("  Admin: admin@mlmpro.com / password123")
  console.log("  Users: ahmed@example.com, sara@example.com, khalid@example.com, nora@example.com, omar@example.com / password123")
}

main()
  .catch((e) => { console.error("Seed error:", e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
