"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Loader2, Trophy, BookOpen, Calendar, TrendingUp, Flame, Award } from "lucide-react"
import AchievementBadge from "./AchievementBadge"
import StreakDisplay from "./StreakDisplay"
import AchievementsModal from "./AchievementsModal"
import { getAchievementByCode } from "@/lib/achievements"

type UserProfile = {
  id: string
  username: string
  avatarUrl: string | null
  bio: string | null
  level: number
  xp: number
  currentLevelXp: number
  xpForNextLevel: number
  progressPercent: number
  rankTitle: string
  rankColor: string
  globalRank: number
  completedLessons: number
  joinedAt: string
  achievements?: Array<{
    code: string
    name: string
    description: string
    icon: string
    rarity: string
    xpReward: number
    unlockedAt: string
  }>
  streak?: {
    currentStreak: number
    longestStreak: number
    lastActiveDate: string
  } | null
  email?: string
  lastKnownIp?: string
  profileCardGradient?: string[] | null
  profileBannerImage?: string | null
  profileBannerType?: string | null
  customCardColor?: string | null
}

type UserProfileModalProps = {
  userId: string
  onClose: () => void
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/users/${userId}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        setError("Failed to load profile")
      }
    } catch (e) {
      console.error("Failed to load profile", e)
      setError("Failed to load profile")
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-sm border border-white/10 overflow-hidden relative"
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: profile?.customCardColor || "#141414" }}
      >
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : error || !profile ? (
          <div className="p-8">
            <div className="text-center text-zinc-500 mb-4">{error || "User not found"}</div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-white/10 rounded-lg text-sm hover:bg-white/20 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 rounded-full transition z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with gradient or banner */}
            <div
              className="h-24 relative overflow-hidden"
              style={profile.profileBannerImage ? {
                backgroundImage: `url(${profile.profileBannerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              } : profile.profileCardGradient && profile.profileCardGradient.length > 0 ? {
                background: `linear-gradient(135deg, ${profile.profileCardGradient.join(', ')})`,
                backgroundSize: '200% 200%',
                animation: 'gradientShift 3s ease infinite'
              } : {
                background: `linear-gradient(135deg, ${profile.rankColor}40 0%, ${profile.rankColor}10 100%)`
              }}
            >
              {profile.profileCardGradient && profile.profileCardGradient.length > 0 && !profile.profileBannerImage && (
                <style jsx>{`
                  @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}</style>
              )}
            </div>
            <div className="px-6">
              <div className="relative -mt-12 z-20">
                <div 
                  className="w-24 h-24 rounded-full bg-[#1a1a1a] flex items-center justify-center text-3xl font-medium overflow-hidden border-4 shadow-lg"
                  style={{ borderColor: profile.rankColor }}
                >
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile.username[0].toUpperCase()
                  )}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="px-6 pt-6 pb-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold">{profile.username}</h2>
              </div>
              
              {/* Owner-only: Email and IP */}
              {(profile.email || profile.lastKnownIp) && (
                <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="text-xs text-yellow-400/80 font-medium mb-2">Owner Information</div>
                  {profile.email && (
                    <div className="text-xs text-zinc-400 mb-1">
                      <span className="text-zinc-500">Email:</span> {profile.email}
                    </div>
                  )}
                  {profile.lastKnownIp && (
                    <div className="text-xs text-zinc-400">
                      <span className="text-zinc-500">IP Address:</span> {profile.lastKnownIp}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="text-sm font-medium px-2 py-0.5 rounded-full"
                  style={{ 
                    color: profile.rankColor,
                    backgroundColor: `${profile.rankColor}20`
                  }}
                >
                  {profile.rankTitle}
                </span>
                <span className="text-xs text-zinc-500">Level {profile.level}</span>
              </div>

              {profile.bio && (
                <p className="text-sm text-zinc-400 mb-4">{profile.bio}</p>
              )}

              {/* XP Progress Bar */}
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">Level Progress</span>
                  <span className="text-xs text-zinc-400">
                    {profile.currentLevelXp} / {profile.xpForNextLevel} XP
                  </span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${profile.progressPercent}%`,
                      backgroundColor: profile.rankColor 
                    }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Trophy className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                  <div className="text-lg font-bold">#{profile.globalRank}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Rank</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-400" />
                  <div className="text-lg font-bold">{profile.xp}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Total XP</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <BookOpen className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                  <div className="text-lg font-bold">{profile.completedLessons}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Lessons</div>
                </div>
              </div>

              {/* Study Streak */}
              {profile.streak && (
                <div className="mt-4 bg-white/5 rounded-xl px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-zinc-500">Daily Streak</span>
                  <StreakDisplay compact />
                </div>
              )}

              {/* Achievements Preview */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-semibold">Achievements</span>
                  </div>
                  {profile.achievements && profile.achievements.length > 0 && (
                    <button
                      onClick={() => setShowAchievementsModal(true)}
                      className="text-xs text-zinc-400 hover:text-white transition"
                    >
                      View All ({profile.achievements.length})
                    </button>
                  )}
                </div>
                
                {profile.achievements && profile.achievements.length > 0 ? (
                  <div className="grid grid-cols-5 gap-2">
                    {profile.achievements.slice(0, 5)
                      .map(achievement => {
                        const fullAchievement = getAchievementByCode(achievement.code)
                        if (!fullAchievement) return null
                        return (
                          <AchievementBadge
                            key={achievement.code}
                            achievement={{
                              ...fullAchievement,
                              unlocked: true,
                              unlockedAt: achievement.unlockedAt
                            }}
                            size="sm"
                          />
                        )
                      })
                      .filter(Boolean)}
                    {profile.achievements.length > 5 && (
                      <button
                        onClick={() => setShowAchievementsModal(true)}
                        className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs text-zinc-400 hover:bg-white/10 transition"
                      >
                        +{profile.achievements.length - 5}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-zinc-500 text-xs">
                    No achievements yet
                  </div>
                )}
              </div>

              {/* Join Date */}
              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-zinc-500">
                <Calendar className="w-3 h-3" />
                <span>Joined {new Date(profile.joinedAt).toLocaleDateString("en-US", { 
                  month: "long", 
                  year: "numeric" 
                })}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <AchievementsModal
          userId={userId}
          onClose={() => setShowAchievementsModal(false)}
        />
      )}
    </div>
  )
}
