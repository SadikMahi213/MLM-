"use client"
import { useState, useEffect, Suspense, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, EyeOff, Loader2, Upload, X, Sparkles } from "lucide-react"

const packages = [
  { id: null, name: "Free", price: "$0", color: "bg-gradient-to-br from-gray-400 to-gray-500", popular: false },
  { id: 1, name: "Starter", price: "$99", color: "bg-gradient-to-br from-blue-500 to-blue-600", popular: false },
  { id: 2, name: "Silver", price: "$299", color: "bg-gradient-to-br from-slate-400 to-slate-600", popular: false },
  { id: 3, name: "Gold", price: "$599", color: "bg-gradient-to-br from-amber-500 to-amber-600", popular: true },
  { id: 4, name: "Platinum", price: "$1,299", color: "bg-gradient-to-br from-purple-500 to-purple-600", popular: false },
]

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterSkeleton() {
  return (
    <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
      <CardHeader className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function RegisterForm() {
  const searchParams = useSearchParams()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    telecom_code: "",
    phone: "",
    country: "",
    city: "",
    password: "",
    confirmPassword: "",
    sponsorCode: "",
    packageId: null as number | null,
    team: "A" as "A" | "B",
    agreeTerms: false,
  })
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      setFormData((prev) => ({ ...prev, sponsorCode: ref }))
    }
  }, [searchParams])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setProfilePhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return
    if (!formData.agreeTerms) return
    setLoading(true)
    try {
      const payload = new FormData()
      payload.append("name", formData.name)
      payload.append("username", formData.username)
      payload.append("email", formData.email)
      payload.append("telecom_code", formData.telecom_code)
      payload.append("phone", formData.phone)
      payload.append("country", formData.country)
      payload.append("city", formData.city)
      payload.append("password", formData.password)
      payload.append("password_confirmation", formData.confirmPassword)
      payload.append("team", formData.team)
      if (formData.sponsorCode) payload.append("sponsor_code", formData.sponsorCode)
      if (formData.packageId) payload.append("package_id", String(formData.packageId))
      if (profilePhoto) payload.append("profile_photo", profilePhoto)

      await register(payload)
    } catch {}
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-0 shadow-2xl bg-white/95 dark:bg-card/95 backdrop-blur-xl rounded-2xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl font-bold">Create Account</CardTitle>
          <CardDescription>Join the MLM Pro network today</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            {/* Profile Photo */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Profile Photo</Label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary/50 shadow-md">
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-20 w-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <Upload className="h-6 w-6 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                  </div>
                )}
                <div className="flex-1">
                  <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => fileInputRef.current?.click()}>
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </Button>
                  <p className="text-xs text-muted-foreground/60 mt-1">JPG, PNG or WebP. Max 2MB.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required className="h-11 rounded-xl border-border/60 bg-background/50 focus-visible:bg-background" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">Username</Label>
              <Input id="username" placeholder="johndoe" value={formData.username} onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))} required className="h-11 rounded-xl border-border/60 bg-background/50 focus-visible:bg-background" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} required className="h-11 rounded-xl border-border/60 bg-background/50 focus-visible:bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                <Input id="country" placeholder="Saudi Arabia" value={formData.country} onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))} required className="h-11 rounded-xl border-border/60 bg-background/50 focus-visible:bg-background" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">City</Label>
                <Input id="city" placeholder="Riyadh" value={formData.city} onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))} required className="h-11 rounded-xl border-border/60 bg-background/50 focus-visible:bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telecom_code" className="text-sm font-medium">Country Code</Label>
                <Input id="telecom_code" placeholder="+966" value={formData.telecom_code} onChange={(e) => setFormData((p) => ({ ...p, telecom_code: e.target.value }))} required className="h-11 rounded-xl border-border/60 bg-background/50 focus-visible:bg-background" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="555555555" value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} required className="h-11 rounded-xl border-border/60 bg-background/50 focus-visible:bg-background" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 chars" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} required className="h-11 rounded-xl border-border/60 bg-background/50 pr-10 focus-visible:bg-background" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Repeat password" value={formData.confirmPassword} onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))} required className="h-11 rounded-xl border-border/60 bg-background/50 focus-visible:bg-background" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsor" className="text-sm font-medium">Sponsor Code (Optional)</Label>
              <Input id="sponsor" placeholder="Enter sponsor code" value={formData.sponsorCode} onChange={(e) => setFormData((p) => ({ ...p, sponsorCode: e.target.value }))} className="h-11 rounded-xl border-border/60 bg-background/50 focus-visible:bg-background" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Package</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {packages.map((pkg) => (
                  <button
                    key={pkg.id ?? "free"}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, packageId: pkg.id }))}
                    className={`relative rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                      formData.packageId === pkg.id
                        ? "border-primary bg-primary/8 shadow-sm"
                        : "border-border/60 hover:border-primary/40 hover:bg-accent/20"
                    } ${pkg.popular ? "ring-1 ring-amber-500/30" : ""}`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full shadow-sm">POPULAR</span>
                    )}
                    <div className={`h-1.5 w-full rounded-full mb-2 ${pkg.color}`} />
                    <p className="text-sm font-semibold">{pkg.name}</p>
                    <p className="text-xs text-muted-foreground/70">{pkg.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Team (Binary Position)</Label>
              <div className="flex gap-2">
                {(["A", "B"] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, team: pos }))}
                    className={`flex-1 rounded-xl border-2 py-3 text-center text-sm font-medium transition-all duration-200 ${
                      formData.team === pos
                        ? "border-primary bg-primary/8 text-primary shadow-sm"
                        : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {pos === "A" ? "Left (A)" : "Right (B)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="terms" checked={formData.agreeTerms} onCheckedChange={(checked) => setFormData((p) => ({ ...p, agreeTerms: checked as boolean }))} />
              <Label htmlFor="terms" className="text-sm font-normal cursor-pointer text-muted-foreground">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline font-medium">
                  Terms & Conditions
                </Link>
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4 pt-2">
            <Button type="submit" className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" disabled={loading || !formData.agreeTerms}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
