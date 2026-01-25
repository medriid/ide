"use client"

import { useEffect, useState } from "react"
import { Flame, Calendar, AlertTriangle } from "lucide-react"
import { 
  getStreakStatus, 
  isStreakAtRisk, 
  type StreakData,
  type StreakApiResponse,
  convertApiResponseToStreakData
} from "@/lib/streaks"

type StreakDisplayProps = {
  userId?: string
  compact?: boolean
}

export default function StreakDisplay({ userId, compact = false }: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreak()
  }, [userId])

  const loadStreak = async () => {
    try {
      const res = await fetch("/api/streaks", { credentials: "include" })
      if (res.ok) {
        const data: StreakApiResponse = await res.json()
        const convertedData = convertApiResponseToStreakData(data)
        setStreak(convertedData)
      }
    } catch (error) {
      console.error("Failed to load streak", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStreak = async () => {
    try {
      const res = await fetch("/api/streaks", {
        method: "POST",
        credentials: "include"
      })
      if (res.ok) {
        const data: StreakApiResponse = await res.json()
        const convertedData = convertApiResponseToStreakData(data)
        setStreak(convertedData)
        return convertedData
      }
    } catch (error) {
      console.error("Failed to update streak", error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
        <div className="h-8 bg-white/10 rounded w-16"></div>
      </div>
    )
  }

  if (!streak) {
    return null
  }

  const status = getStreakStatus(streak)
  const atRisk = isStreakAtRisk(streak)

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Flame className={`w-3.5 h-3.5 ${status.color}`} />
        <span className={`font-semibold ${status.color}`}>
          {streak.currentStreak}d
        </span>
        {atRisk && (
          <AlertTriangle className="w-3 h-3 text-yellow-400" />
        )}
      </div>
    )
  }

  return (
    <div className={`
      bg-gradient-to-br from-red-500/10 to-orange-500/10 
      border border-red-500/20 rounded-xl p-4
      ${atRisk ? "ring-2 ring-yellow-500/50" : ""}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className={`w-5 h-5 ${status.color}`} />
            <h3 className="font-semibold text-white">Study Streak</h3>
          </div>
          <p className={`text-sm ${status.color}`}>
            {status.message}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: status.flameCount }).map((_, index) => (
            <Flame key={index} className={`w-5 h-5 ${status.color}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-zinc-400 mb-1">Current</div>
          <div className={`text-2xl font-bold ${status.color}`}>
            {streak.currentStreak}
          </div>
          <div className="text-xs text-zinc-500">days</div>
        </div>
        <div className="bg-black/20 rounded-lg p-3">
          <div className="text-xs text-zinc-400 mb-1">Longest</div>
          <div className="text-2xl font-bold text-zinc-300">
            {streak.longestStreak}
          </div>
          <div className="text-xs text-zinc-500">days</div>
        </div>
      </div>

      {atRisk && (
        <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <div className="text-xs text-yellow-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Complete a challenge today to maintain your streak!
          </div>
        </div>
      )}

      {streak.streakFreezeCount > 0 && (
        <div className="mt-2 text-xs text-zinc-500">
          Streak freezes used: {streak.streakFreezeCount}/3
        </div>
      )}
    </div>
  )
}

// Export function to update streak (to be called from other components)
export async function updateUserStreak(): Promise<void> {
  try {
    await fetch("/api/streaks", {
      method: "POST",
      credentials: "include"
    })
  } catch (error) {
    console.error("Failed to update streak", error)
  }
}
