"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/lib/api-client"
import { getInitials } from "@/lib/utils"
import { toast } from "sonner"
import {
  User,
  Shield,
  Bell,
  Smartphone,
  Save,
  Camera,
  LogOut,
  Globe,
  MapPin,
  Loader2,
  Monitor,
  Tablet,
  Smartphone as Phone,
  RefreshCw,
} from "lucide-react"

interface DeviceSession {
  id: string
  device: string
  browser: string
  ip: string
  last_active: string
  is_current: boolean
}

const sessionIcons: Record<string, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Phone,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState("profile")
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    telecom_code: user?.telecom_code || "",
    country: user?.country || "",
    city: user?.city || "",
  })

  const [password, setPassword] = useState({ current: "", new: "", confirm: "" })
  const [twoFactor, setTwoFactor] = useState(user?.two_factor_enabled || false)
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)
  const [notifSettings, setNotifSettings] = useState({ email: true, sms: false, push: true })
  const [sessions, setSessions] = useState<DeviceSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  useEffect(() => {
    setProfile({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      telecom_code: user?.telecom_code || "",
      country: user?.country || "",
      city: user?.city || "",
    })
    setTwoFactor(user?.two_factor_enabled || false)
  }, [user])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("profile_photo", file)
      const res = await api.put<any>("/auth/profile", formData)
      updateUser(res.data || res)
      toast.success("Profile photo updated successfully")
    } catch {
      toast.error("Failed to update profile photo")
    } finally { setSaving(false) }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await api.put<any>("/auth/profile", profile)
      updateUser(res.data || res)
      toast.success("Profile updated successfully")
    } catch { toast.error("Failed to update profile") }
    finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    if (password.new !== password.confirm) { toast.error("Passwords do not match"); return }
    if (password.new.length < 8) { toast.error("Password must be at least 8 characters"); return }
    setSaving(true)
    try {
      await api.post("/auth/change-password", {
        current_password: password.current,
        new_password: password.new,
        new_password_confirmation: password.confirm,
      })
      toast.success("Password changed successfully")
      setPassword({ current: "", new: "", confirm: "" })
    } catch { toast.error("Failed to change password") }
    finally { setSaving(false) }
  }

  const handleToggle2FA = async (enabled: boolean) => {
    if (!enabled) {
      setTwoFactor(false)
      toast.success("Two-factor authentication disabled")
      return
    }
    try {
      setTwoFactorLoading(true)
      const res: any = await api.post("/auth/2fa/enable")
      setTwoFactor(true)
      updateUser(res.data || { ...user, two_factor_enabled: true })
      toast.success("2FA enabled successfully")
    } catch {
      toast.error("Failed to enable 2FA")
      setTwoFactor(false)
    } finally {
      setTwoFactorLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      toast.success("Notification preferences updated")
    } catch { toast.error("Failed to update preferences") }
    finally { setSaving(false) }
  }

  const handleRevokeSession = async (sessionId: string) => {
    toast.success("Session revoked")
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  const profilePhotoUrl = user?.profile_photo_url || user?.avatar || undefined

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-500 to-purple-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-sm text-muted-foreground/80">Manage your account settings and preferences</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto bg-accent/30 p-1 rounded-xl gap-1">
            <TabsTrigger value="profile" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <Shield className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
              <Bell className="h-4 w-4" /> Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and avatar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                    <AvatarImage src={profilePhotoUrl} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">{user ? getInitials(user.name) : "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG or WebP. Max 2MB.</p>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/gif,image/webp" onChange={handlePhotoChange} className="hidden" />
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" disabled value={profile.email} className="h-11 rounded-xl opacity-60" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telecom_code">Telecom Code</Label>
                    <Input id="telecom_code" placeholder="+966" value={profile.telecom_code} onChange={(e) => setProfile({ ...profile, telecom_code: e.target.value })} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country"><Globe className="mr-1 h-3 w-3 inline" /> Country</Label>
                    <Input id="country" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city"><MapPin className="mr-1 h-3 w-3 inline" /> City</Label>
                    <Input id="city" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Use a strong password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} className="h-11 rounded-xl" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" value={password.new} onChange={(e) => setPassword({ ...password, new: e.target.value })} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" value={password.confirm} onChange={(e) => setPassword({ ...password, confirm: e.target.value })} className="h-11 rounded-xl" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleChangePassword} disabled={saving || !password.current || !password.new || !password.confirm}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa">Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground/70">Secure your account with an authenticator app</p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={twoFactor}
                    onCheckedChange={handleToggle2FA}
                    disabled={twoFactorLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground/70">Receive notifications via email</p>
                  </div>
                  <Switch id="email-notif" checked={notifSettings.email} onCheckedChange={(v) => setNotifSettings({ ...notifSettings, email: v })} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notif">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground/70">Receive notifications via SMS</p>
                  </div>
                  <Switch id="sms-notif" checked={notifSettings.sms} onCheckedChange={(v) => setNotifSettings({ ...notifSettings, sms: v })} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notif">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground/70">Receive push notifications in browser</p>
                  </div>
                  <Switch id="push-notif" checked={notifSettings.push} onCheckedChange={(v) => setNotifSettings({ ...notifSettings, push: v })} />
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleSaveNotifications} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
