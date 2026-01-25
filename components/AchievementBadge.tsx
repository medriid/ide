"use client"

import { getRarityColor, getRarityGlow, AchievementDefinition } from "@/lib/achievements"
import AchievementIcon from "./AchievementIcon"

type AchievementBadgeProps = {
  achievement: AchievementDefinition & { unlocked?: boolean; unlockedAt?: string | null }
  size?: "sm" | "md" | "lg"
  showDescription?: boolean
  onClick?: () => void
}

export default function AchievementBadge({
  achievement,
  size = "md",
  showDescription = false,
  onClick
}: AchievementBadgeProps) {
  const rarityColor = getRarityColor(achievement.rarity)
  const rarityGlow = getRarityGlow(achievement.rarity)
  
  const sizeClasses = {
    sm: "w-10 h-10 text-base",
    md: "w-14 h-14 text-xl",
    lg: "w-20 h-20 text-3xl"
  }

  const isUnlocked = achievement.unlocked ?? false

  return (
    <div
      className={`
        relative rounded-xl border-2 transition-all duration-300
        ${isUnlocked 
          ? `${rarityGlow} cursor-pointer hover:scale-105` 
          : "opacity-40 grayscale cursor-not-allowed"
        }
        ${onClick && isUnlocked ? "hover:brightness-110" : ""}
      `}
      style={{
        borderColor: isUnlocked ? rarityColor : "#374151",
        backgroundColor: isUnlocked ? `${rarityColor}15` : "#1f1f1f"
      }}
      onClick={onClick && isUnlocked ? onClick : undefined}
      title={achievement.name}
    >
      <div
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
        `}
        style={{ color: isUnlocked ? rarityColor : "#6b7280" }}
      >
        <AchievementIcon icon={achievement.icon} className="w-full h-full" />
      </div>
      
      {showDescription && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 rounded-b-xl">
          <div 
            className="text-xs font-semibold truncate"
            style={{ color: isUnlocked ? rarityColor : "#6b7280" }}
          >
            {achievement.name}
          </div>
          {achievement.unlockedAt && (
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-zinc-600 text-xs">?</div>
        </div>
      )}
    </div>
  )
}
