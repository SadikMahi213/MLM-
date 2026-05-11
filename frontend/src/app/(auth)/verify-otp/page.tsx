"use client"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { api } from "@/lib/api-client"
import { Loader2, ArrowLeft, Smartphone } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function VerifyOtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120)
  const [phone, setPhone] = useState("")
  const [step, setStep] = useState<"send" | "verify">("send")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timeLeft <= 0 || step !== "verify") return
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, step])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) { toast.error("Please enter your phone number"); return }
    try {
      setSending(true)
      await api.post("/auth/send-otp", { phone })
      setStep("verify")
      setTimeLeft(120)
      toast.success("OTP sent to your phone")
    } catch (err: any) {
      toast.error(err?.message || "Failed to send OTP")
    } finally {
      setSending(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const newOtp = [...otp]
    data.split("").forEach((char, i) => { if (i < 6) newOtp[i] = char })
    setOtp(newOtp)
    inputRefs.current[Math.min(data.length, 5)]?.focus()
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join("")
    if (code.length !== 6) { toast.error("Please enter the full 6-digit code"); return }
    setLoading(true)
    try {
      await api.post("/auth/verify-otp", { otp: code })
      toast.success("Verified successfully!")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err?.message || "Invalid code. Please try again.")
    }
    setLoading(false)
  }

  const handleResend = async () => {
    try {
      await api.post("/auth/send-otp", { phone })
      setTimeLeft(120)
      setOtp(["", "", "", "", "", ""])
      toast.success("OTP resent")
    } catch (err: any) {
      toast.error(err?.message || "Failed to resend")
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-2xl bg-card/95 backdrop-blur-xl">
        {step === "send" ? (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold">Phone Verification</CardTitle>
              <CardDescription>Enter your phone number to receive a verification code</CardDescription>
            </CardHeader>
            <form onSubmit={handleSendOtp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="tel"
                    placeholder="+966 55 555 5555"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 rounded-xl text-center text-lg"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full h-11" variant="premium" disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {sending ? "Sending..." : "Send OTP"}
                </Button>
                <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Verify OTP</CardTitle>
              <CardDescription>Enter the 6-digit code sent to your phone</CardDescription>
            </CardHeader>
            <form onSubmit={handleVerify}>
              <CardContent className="space-y-6">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, i) => (
                    <Input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      className="h-14 w-12 text-center text-lg font-bold rounded-xl"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  {timeLeft > 0 ? (
                    <>Code expires in <span className="font-medium text-foreground">{formatTime(timeLeft)}</span></>
                  ) : (
                    <button type="button" onClick={handleResend} className="text-primary hover:underline font-medium">
                      Resend code
                    </button>
                  )}
                </p>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full h-11" variant="premium" disabled={loading || otp.join("").length !== 6}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? "Verifying..." : "Verify"}
                </Button>
                <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </motion.div>
  )
}
