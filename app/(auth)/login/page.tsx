"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowRight, Mail, Lock } from "lucide-react"

export default function Page() {
  const r = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", { redirect: false, email, password })
    setLoading(false)
    if (res?.ok) {
      // Track IP address after successful login
      fetch("/api/users/track-ip", { 
        method: "POST", 
        credentials: "include" 
      }).catch(() => {
        // Ignore errors - IP tracking is not critical
      })
      r.push("/sql")
    } else {
      setError("Invalid email or password. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      {/* Back to home link */}
      <Link href="/" className="absolute top-6 left-6 text-xs text-zinc-400 hover:text-white transition flex items-center gap-2">
        <span>←</span> Back to Home
      </Link>
      
      <div className="relative w-full max-w-md px-6">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-white/10 bg-zinc-950/50 px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-4">Welcome back</h1>
            <p className="text-sm text-zinc-400 mt-1">Sign in to continue to your workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 block font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 block font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {error && (
              <div className="text-red-400 text-sm bg-red-950/50 border border-red-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-white text-black rounded-lg text-sm font-semibold transition hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="border-t border-white/10 bg-zinc-950/30 px-8 py-5 text-sm text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white font-medium hover:underline underline-offset-4">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
