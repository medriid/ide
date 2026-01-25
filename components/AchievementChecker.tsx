"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import AchievementNotification from "./AchievementNotification"
import { ACHIEVEMENTS } from "@/lib/achievements"

type Achievement = {
  code: string
  name: string
  description: string
  icon: string
  rarity: string
  xpReward: number
}

export default function AchievementChecker() {
  const { data: session, status } = useSession()
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null)

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return

    const checkAchievements = async () => {
      try {
        const res = await fetch("/api/achievements", {
          method: "POST",
          credentials: "include"
        })
        if (res.ok) {
          const data = await res.json()
          if (data.newlyUnlocked && data.newlyUnlocked.length > 0) {
            // Get achievement details
            const unlocked = data.newlyUnlocked.map((code: string) => {
              return ACHIEVEMENTS.find(a => a.code === code)
            }).filter(Boolean) as Achievement[]
            
            setNewAchievements(prev => [...prev, ...unlocked])
          }
        }
      } catch (error) {
        console.error("Failed to check achievements", error)
      }
    }

    // Check immediately
    checkAchievements()

    // Check periodically (every 30 seconds)
    const interval = setInterval(checkAchievements, 30000)

    return () => clearInterval(interval)
  }, [status, session])

  // Show notifications one at a time
  useEffect(() => {
    if (newAchievements.length > 0 && !currentNotification) {
      setCurrentNotification(newAchievements[0])
      setNewAchievements(prev => prev.slice(1))
    }
  }, [newAchievements, currentNotification])

  const handleCloseNotification = () => {
    setCurrentNotification(null)
  }

  if (!currentNotification) return null

  return (
    <AchievementNotification
      achievement={currentNotification}
      onClose={handleCloseNotification}
    />
  )
}
