"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { 
  Trophy, 
  ChevronLeft,
  Loader2,
  Crown,
  Medal,
  Award
} from "lucide-react"
import Link from "next/link"
import MusicPlayer from "@/components/MusicPlayer"
import UserProfileModal from "@/components/UserProfileModal"

type LeaderboardUser = {
  rank: number
  id: string
  username: string
  avatarUrl: string | null
  level: number
  xp: number
  rankTitle: string
  rankColor: string
  progressPercent: number
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard?limit=50", { credentials: "include" })
      const data = await res.json()
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard)
      }
    } catch (e) {
      console.error("Failed to load leaderboard", e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      loadLeaderboard()
    }
  }, [status, loadLeaderboard])

  const currentUser = session?.user as { id?: string } | undefined

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="text-sm font-mono text-zinc-500 w-5 text-center">{rank}</span>
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Leaderboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-12">
            {/* Second Place */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setSelectedUserId(leaderboard[1].id)}
                className="group"
              >
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-lg font-medium overflow-hidden border-2 border-gray-400 group-hover:border-gray-300 transition mb-2">
                  {leaderboard[1].avatarUrl ? (
                    <img src={leaderboard[1].avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    leaderboard[1].username[0].toUpperCase()
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium truncate max-w-[100px]">{leaderboard[1].username}</div>
                  <div className="text-xs text-zinc-500">Level {leaderboard[1].level}</div>
                </div>
              </button>
              <div className="mt-2 w-20 h-24 bg-gradient-to-t from-gray-600/30 to-gray-400/30 rounded-t-lg flex items-center justify-center">
                <Medal className="w-8 h-8 text-gray-300" />
              </div>
            </div>

            {/* First Place */}
            <div className="flex flex-col items-center -mb-4">
              <button
                onClick={() => setSelectedUserId(leaderboard[0].id)}
                className="group"
              >
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-xl font-medium overflow-hidden border-2 border-yellow-400 group-hover:border-yellow-300 transition mb-2 shadow-lg shadow-yellow-400/20">
                  {leaderboard[0].avatarUrl ? (
                    <img src={leaderboard[0].avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    leaderboard[0].username[0].toUpperCase()
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold truncate max-w-[120px]">{leaderboard[0].username}</div>
                  <div className="text-xs text-zinc-500">Level {leaderboard[0].level}</div>
                </div>
              </button>
              <div className="mt-2 w-24 h-32 bg-gradient-to-t from-yellow-600/30 to-yellow-400/30 rounded-t-lg flex items-center justify-center">
                <Crown className="w-10 h-10 text-yellow-400" />
              </div>
            </div>

            {/* Third Place */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => setSelectedUserId(leaderboard[2].id)}
                className="group"
              >
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-lg font-medium overflow-hidden border-2 border-amber-600 group-hover:border-amber-500 transition mb-2">
                  {leaderboard[2].avatarUrl ? (
                    <img src={leaderboard[2].avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    leaderboard[2].username[0].toUpperCase()
                  )}
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium truncate max-w-[100px]">{leaderboard[2].username}</div>
                  <div className="text-xs text-zinc-500">Level {leaderboard[2].level}</div>
                </div>
              </button>
              <div className="mt-2 w-20 h-20 bg-gradient-to-t from-amber-700/30 to-amber-500/30 rounded-t-lg flex items-center justify-center">
                <Medal className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-sm font-medium">Rankings</span>
            <span className="text-xs text-zinc-500">{leaderboard.length} users</span>
          </div>
          
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No users yet
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {leaderboard.map(user => {
                const isCurrentUser = user.id === currentUser?.id
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full px-4 py-3 flex items-center gap-4 hover:bg-white/5 transition text-left ${
                      isCurrentUser ? "bg-white/5" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(user.rank)}
                    </div>

                    {/* Avatar */}
                    <div 
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium overflow-hidden shrink-0"
                      style={{ borderColor: user.rankColor, borderWidth: 2 }}
                    >
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.username[0].toUpperCase()
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{user.username}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] bg-white/10 text-zinc-400 px-1.5 py-0.5 rounded">You</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span 
                          className="text-xs font-medium"
                          style={{ color: user.rankColor }}
                        >
                          {user.rankTitle}
                        </span>
                        <span className="text-xs text-zinc-600">•</span>
                        <span className="text-xs text-zinc-500">{user.xp} XP</span>
                      </div>
                    </div>

                    {/* Level Badge */}
                    <div className="flex flex-col items-end">
                      <div 
                        className="text-lg font-bold"
                        style={{ color: user.rankColor }}
                      >
                        {user.level}
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Level</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Music Player */}
      <MusicPlayer variant="floating" />

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}
