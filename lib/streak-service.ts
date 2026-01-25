// Streak service - server-side only
import { prisma } from "@/lib/prisma"
import { updateStreak } from "@/lib/streaks"

export async function updateUserStreak(userId: string): Promise<{
  currentStreak: number
  longestStreak: number
  isNewStreak: boolean
}> {
  try {
    // Get current streak
    const currentStreak = await prisma.studyStreak.findUnique({
      where: { userId }
    })

    // Update streak
    const updatedStreak = updateStreak(currentStreak ? {
      currentStreak: currentStreak.currentStreak,
      longestStreak: currentStreak.longestStreak,
      lastActiveDate: currentStreak.lastActiveDate,
      streakFreezeUsed: currentStreak.streakFreezeUsed,
      streakFreezeCount: currentStreak.streakFreezeCount
    } : null)

    const wasNewStreak = !currentStreak || currentStreak.currentStreak !== updatedStreak.currentStreak

    // Save to database
    const streak = await prisma.studyStreak.upsert({
      where: { userId },
      create: {
        userId,
        currentStreak: updatedStreak.currentStreak,
        longestStreak: updatedStreak.longestStreak,
        lastActiveDate: updatedStreak.lastActiveDate,
        streakFreezeUsed: updatedStreak.streakFreezeUsed,
        streakFreezeCount: updatedStreak.streakFreezeCount
      },
      update: {
        currentStreak: updatedStreak.currentStreak,
        longestStreak: updatedStreak.longestStreak,
        lastActiveDate: updatedStreak.lastActiveDate,
        streakFreezeUsed: updatedStreak.streakFreezeUsed,
        streakFreezeCount: updatedStreak.streakFreezeCount
      }
    })

    // Update user's last login
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    })

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      isNewStreak: wasNewStreak
    }
  } catch (error) {
    console.error("Error updating streak:", error)
    return {
      currentStreak: 0,
      longestStreak: 0,
      isNewStreak: false
    }
  }
}
