"use client"

import { useState, useEffect } from "react"
import { X, Trophy, Filter } from "lucide-react"
import AchievementBadge from "./AchievementBadge"
import AchievementIcon from "./AchievementIcon"
import { AchievementDefinition, AchievementCategory, getAchievementsByCategory, getRarityColor } from "@/lib/achievements"

type Achievement = AchievementDefinition & {
  unlocked?: boolean
  unlockedAt?: string | null
}

type AchievementsModalProps = {
  userId?: string
  onClose: () => void
}

export default function AchievementsModal({ userId, onClose }: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filter, setFilter] = useState<AchievementCategory | "all">("all")
  const [loading, setLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  useEffect(() => {
    loadAchievements()
  }, [userId])

  const loadAchievements = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/achievements", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setAchievements(data.achievements || [])
      }
    } catch (error) {
      console.error("Failed to load achievements", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = filter === "all" 
    ? achievements 
    : achievements.filter(a => a.category === filter)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length

  const categories: (AchievementCategory | "all")[] = [
    "all",
    "milestone",
    "streak",
    "challenge",
    "social",
    "mastery"
  ]

  const categoryLabels: Record<string, string> = {
    all: "All",
    milestone: "Milestones",
    streak: "Streaks",
    challenge: "Challenges",
    social: "Social",
    mastery: "Mastery"
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#141414] rounded-2xl w-full max-w-4xl max-h-[90vh] border border-white/10 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-semibold">Achievements</h2>
            <span className="text-sm text-zinc-400">
              {unlockedCount} / {totalCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-white/10 flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition
                ${filter === cat
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
                }
              `}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12 text-zinc-500">
              Loading achievements...
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No achievements found
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAchievements.map(achievement => (
                <div key={achievement.code} className="relative">
                  <AchievementBadge
                    achievement={achievement}
                    size="md"
                    onClick={() => setSelectedAchievement(achievement)}
                  />
                  {achievement.unlocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#141414]"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Achievement Detail */}
        {selectedAchievement && (
          <div className="p-6 border-t border-white/10 bg-black/40">
            <div className="flex items-start gap-4">
              <AchievementIcon
                icon={selectedAchievement.icon}
                className="w-8 h-8"
                style={{ color: getRarityColor(selectedAchievement.rarity) }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{selectedAchievement.name}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      color: getRarityColor(selectedAchievement.rarity),
                      backgroundColor: `${getRarityColor(selectedAchievement.rarity)}20`
                    }}
                  >
                    {selectedAchievement.rarity}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mb-2">
                  {selectedAchievement.description}
                </p>
                {selectedAchievement.unlocked ? (
                  <div className="text-xs text-green-400">
                    ✓ Unlocked {selectedAchievement.unlockedAt 
                      ? `on ${new Date(selectedAchievement.unlockedAt).toLocaleDateString()}`
                      : ""
                    }
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500">
                    Locked - Keep learning to unlock!
                  </div>
                )}
                {selectedAchievement.xpReward > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    +{selectedAchievement.xpReward} XP reward
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedAchievement(null)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
