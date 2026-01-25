"use client"

import { useEffect, useState } from "react"
import { X, Trophy } from "lucide-react"
import { getRarityColor, getRarityGlow } from "@/lib/achievements"

type AchievementNotificationProps = {
  achievement: {
    code: string
    name: string
    description: string
    icon: string
    rarity: string
    xpReward: number
  }
  onClose: () => void
}

export default function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const rarityColor = getRarityColor(achievement.rarity as any)
  const rarityGlow = getRarityGlow(achievement.rarity as any)

  useEffect(() => {
    // Trigger animation
    setIsVisible(true)
    
    // Auto-close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for fade out
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 transition-all duration-300
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
      `}
    >
      <div 
        className={`
          bg-black border-2 rounded-xl p-4 shadow-2xl max-w-sm
          ${rarityGlow}
        `}
        style={{ borderColor: rarityColor }}
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: `${rarityColor}20` }}
          >
            {achievement.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm" style={{ color: rarityColor }}>
                Achievement Unlocked!
              </h3>
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="p-1 hover:bg-white/10 rounded transition"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            
            <p className="text-sm font-medium text-white mb-1">
              {achievement.name}
            </p>
            
            <p className="text-xs text-zinc-400 mb-2">
              {achievement.description}
            </p>
            
            {achievement.xpReward > 0 && (
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Trophy className="w-3 h-3" />
                <span>+{achievement.xpReward} XP</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
