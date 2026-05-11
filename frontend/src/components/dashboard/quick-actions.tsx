"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useSettingsStore } from "@/stores/settings-store"
import { Wallet, ArrowDownToLine, GitBranch, Users, ClipboardCheck, Copy } from "lucide-react"
import { toast } from "sonner"
import { generateReferralLink } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"

export function QuickActions() {
  const { user } = useAuthStore()
  const { getString } = useSettingsStore()

  const actions = [
    { icon: Wallet, label: getString("dashboard_action_deposit_label", "Deposit Funds"), href: "/wallet", variant: "default" as const },
    { icon: ArrowDownToLine, label: getString("dashboard_action_withdraw_label", "Withdraw"), href: "/withdrawals", variant: "outline" as const },
    { icon: GitBranch, label: getString("dashboard_action_view_tree_label", "View Tree"), href: "/binary-tree", variant: "outline" as const },
    { icon: Users, label: getString("dashboard_action_team_label", "My Team"), href: "/genealogy", variant: "outline" as const },
    { icon: ClipboardCheck, label: getString("dashboard_action_tasks_label", "Daily Tasks"), href: "/daily-tasks", variant: "outline" as const },
    { icon: Copy, label: getString("dashboard_action_referral_label", "Referral Link"), href: "#", variant: "premium" as const },
  ]

  const handleAction = (action: typeof actions[0]) => {
    if (action.href === "#") {
      const link = generateReferralLink(user?.username || "user")
      navigator.clipboard.writeText(link)
      toast.success(getString("dashboard_referral_copied_text", "Referral link copied!"))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{getString("dashboard_actions_title", "Quick Actions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Button
                  variant={action.variant}
                  className="w-full justify-start gap-2 h-auto py-4"
                  onClick={() => handleAction(action)}
                  asChild={action.href !== "#"}
                >
                  {action.href !== "#" ? (
                    <a href={action.href}>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs">{action.label}</span>
                    </a>
                  ) : (
                    <>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-xs">{action.label}</span>
                    </>
                  )}
                </Button>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
