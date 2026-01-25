"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { CheckCircle, Circle, Trophy, Zap } from "lucide-react"

interface DailyQuest {
  id: string
  code: string
  name: string
  description: string
  type: string
  target: number
  xpReward: number
  progress: number
  completed: boolean
  completedAt?: string | null
}

export default function DailyQuests() {
  const { data: session } = useSession()
  const [quests, setQuests] = useState<DailyQuest[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (session) {
      loadQuests()
    }
  }, [session])

  const loadQuests = async () => {
    try {
      const res = await fetch("/api/gamification/daily-quests")
      if (res.ok) {
        const data = await res.json()
        setQuests(data.quests || [])
      }
    } catch (error) {
      console.error("Failed to load quests", error)
    } finally {
      setLoading(false)
    }
  }

  if (!session || loading) return null

  const completedCount = quests.filter(q => q.completed).length
  const totalXp = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xpReward, 0)

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-lg">
        {!expanded ? (
          <button
            onClick={() => setExpanded(true)}
            className="p-3 flex items-center gap-2 hover:bg-white/5 transition rounded-lg"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div className="text-left">
              <div className="text-xs font-semibold">Daily Quests</div>
              <div className="text-xs text-zinc-500">
                {completedCount}/{quests.length} completed
              </div>
            </div>
          </button>
        ) : (
          <div className="w-80 max-h-96 overflow-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Daily Quests
                </h3>
                <div className="text-xs text-zinc-500 mt-1">
                  {completedCount}/{quests.length} completed • {totalXp} XP earned
                </div>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 hover:bg-white/10 rounded transition"
              >
                <Circle className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {quests.length === 0 ? (
                <div className="text-center py-4 text-zinc-500 text-sm">
                  No quests available
                </div>
              ) : (
                quests.map((quest) => {
                  const progressPercent = Math.min((quest.progress / quest.target) * 100, 100)
                  return (
                    <div
                      key={quest.id}
                      className={`p-3 rounded-lg border ${
                        quest.completed
                          ? "bg-yellow-400/10 border-yellow-400/30"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {quest.completed ? (
                          <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-sm truncate">{quest.name}</div>
                            <div className="flex items-center gap-1 text-xs text-yellow-400 flex-shrink-0 ml-2">
                              <Zap className="w-3 h-3" />
                              {quest.xpReward}
                            </div>
                          </div>
                          <div className="text-xs text-zinc-400 mb-2">{quest.description}</div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  quest.completed ? "bg-yellow-400" : "bg-white/20"
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <div className="text-xs text-zinc-500 flex-shrink-0">
                              {quest.progress}/{quest.target}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
