import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - MLM Pro",
  description: "Sign in or create your MLM Pro account",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 blur-[120px] animate-pulse" style={{ animationDuration: "10s", animationDelay: "2s" }} />
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" style={{ animationDuration: "12s", animationDelay: "4s" }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <h1 className="text-2xl font-bold text-white">MLM Pro</h1>
          <p className="text-sm text-blue-200/60">Enterprise MLM Platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
