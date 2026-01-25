"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, Zap } from "lucide-react"
import Link from "next/link"

type XpProgress = {
  level: number
  currentLevelXp: number
  xpForNextLevel: number
  totalXp: number
  progressPercent: number
  rankTitle: string
  rankColor: string
}

export default function LevelProgressBar() {
  const [progress, setProgress] = useState<XpProgress | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/users/profile", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        // Calculate progress from xp
        const { xp } = data
        
        // Import calculation functions
        const BASE_XP = 10
        const XP_INCREMENT = 15
        
        // Calculate level
        let level = 1
        let xpNeeded = 0
        while (true) {
          const nextLevelXp = BASE_XP + (level - 1) * XP_INCREMENT
          if (xpNeeded + nextLevelXp > xp) break
          xpNeeded += nextLevelXp
          level++
        }
        
        const currentLevelXp = xp - xpNeeded
        const xpForNextLevel = BASE_XP + (level - 1) * XP_INCREMENT
        const progressPercent = Math.min(100, Math.floor((currentLevelXp / xpForNextLevel) * 100))
        
        // Get rank info
        let rankTitle = "Novice"
        let rankColor = "#6b7280"
        if (level >= 50) { rankTitle = "Grandmaster"; rankColor = "#ff6b6b" }
        else if (level >= 40) { rankTitle = "Master"; rankColor = "#f59e0b" }
        else if (level >= 30) { rankTitle = "Expert"; rankColor = "#8b5cf6" }
        else if (level >= 25) { rankTitle = "Diamond"; rankColor = "#3b82f6" }
        else if (level >= 20) { rankTitle = "Platinum"; rankColor = "#06b6d4" }
        else if (level >= 15) { rankTitle = "Gold"; rankColor = "#fbbf24" }
        else if (level >= 10) { rankTitle = "Silver"; rankColor = "#94a3b8" }
        else if (level >= 5) { rankTitle = "Bronze"; rankColor = "#cd7f32" }
        
        setProgress({
          level,
          currentLevelXp,
          xpForNextLevel,
          totalXp: xp,
          progressPercent,
          rankTitle,
          rankColor
        })
      }
    } catch (e) {
      console.error("Failed to load progress", e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  if (loading || !progress) return null

  return (
    <div className="w-full flex justify-center">
      <div 
        className="flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2.5 shadow-2xl"
        style={{ boxShadow: `0 0 40px ${progress.rankColor}20` }}
      >
        {/* Level Badge */}
        <div 
          className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold"
          style={{ 
            backgroundColor: `${progress.rankColor}30`,
            color: progress.rankColor,
            border: `2px solid ${progress.rankColor}`
          }}
        >
          {progress.level}
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-1 min-w-[180px]">
          <div className="flex items-center justify-between">
            <span 
              className="text-xs font-medium"
              style={{ color: progress.rankColor }}
            >
              {progress.rankTitle}
            </span>
            <span className="text-[10px] text-zinc-400">
              {progress.currentLevelXp}/{progress.xpForNextLevel} XP
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${progress.progressPercent}%`,
                backgroundColor: "white"
              }}
            />
          </div>
        </div>

        {/* XP Icon */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 pl-1">
          <Zap className="w-3.5 h-3.5" style={{ color: progress.rankColor }} />
          <span>{progress.totalXp}</span>
        </div>

        {/* Leaderboard Link */}
        <Link 
          href="/leaderboard"
          className="ml-1 p-2 rounded-full hover:bg-white/10 transition"
          title="Leaderboard"
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
        </Link>
      </div>
    </div>
  )
}
