"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowRight, Mail, Lock, Sparkles, User, Key } from "lucide-react"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

// ============================================
// INVITE CODE SYSTEM TOGGLE
// Must match the value in /api/auth/register/route.ts
// Set to false to require invite codes for registration
// Set to true to allow anyone to register without an invite code
// ============================================
const INVITE_CODE_DISABLED = false

export default function Page() {
  const r = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  
  const isOwnerEmail = email.toLowerCase() === OWNER_EMAIL.toLowerCase()
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3-20 characters, alphanumeric and underscores only")
      return
    }
    
    if (!isOwnerEmail && !INVITE_CODE_DISABLED && !inviteCode) {
      setError("Invite code is required")
      return
    }
    
    setLoading(true)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, email, password, inviteCode: (isOwnerEmail || INVITE_CODE_DISABLED) ? undefined : inviteCode })
    })
    setLoading(false)
    
    if (res.ok) r.push("/login")
    else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Registration failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -right-40 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse delay-1000" />
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
            <div className="flex items-center gap-2 mt-4">
              <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
              <Sparkles className="h-5 w-5 text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400 mt-1">Join Learning JEE and start coding</p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 block font-medium">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition"
                  placeholder="your_username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
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
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 block font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {!isOwnerEmail && !INVITE_CODE_DISABLED && (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-500 block font-medium">Invite Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-900/50 border border-white/10 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 transition uppercase"
                    placeholder="XXXXXX"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    required={!isOwnerEmail && !INVITE_CODE_DISABLED}
                  />
                </div>
                <p className="text-xs text-zinc-600">Get an invite code from the owner to register</p>
              </div>
            )}
            
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
            
            <p className="text-xs text-zinc-500 text-center">
              By creating an account, you agree to our terms of service
            </p>
          </form>

          {/* Footer */}
          <div className="border-t border-white/10 bg-zinc-950/30 px-8 py-5 text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-medium hover:underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
