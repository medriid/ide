// Achievement service - server-side only
import { prisma } from "@/lib/prisma"
import { ACHIEVEMENTS, UserStats } from "@/lib/achievements"

export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  try {
    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        achievements: {
          include: { achievement: true }
        },
        studyStreak: true
      }
    })

    if (!user) return []

    // Get user stats for achievement checking
    const completedLessons = await prisma.progress.count({
      where: { userId, status: "completed" }
    })

    const completedChallenges = await prisma.challengeProgress.count({
      where: { userId }
    })

    const friendsCount = await prisma.friendship.count({
      where: {
        OR: [
          { userId, status: "accepted" },
          { friendId: userId, status: "accepted" }
        ]
      }
    })

    const messagesSent = await prisma.message.count({
      where: { senderId: userId }
    })

    const daysSinceJoin = Math.floor(
      (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )

    const challenges = await prisma.challengeProgress.findMany({
      where: { userId }
    })

    // Note: This is simplified - in a real system, you'd track challenge difficulty
    const challengesByDifficulty = {
      easy: Math.floor(completedChallenges / 3),
      medium: Math.floor(completedChallenges / 2),
      hard: Math.floor(completedChallenges / 3)
    }

    const stats: UserStats = {
      level: user.level,
      totalXp: user.xp,
      completedLessons,
      completedChallenges,
      currentStreak: user.studyStreak?.currentStreak || 0,
      longestStreak: user.studyStreak?.longestStreak || 0,
      friendsCount,
      messagesSent,
      daysSinceJoin,
      perfectChallengeScores: 0, // Would need to track this separately
      challengesByDifficulty
    }

    // Get already unlocked achievements
    const unlockedCodes = user.achievements.map(ua => ua.achievement.code)

    // Check each achievement
    const newlyUnlocked: string[] = []
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedCodes.includes(achievement.code)) continue

      if (achievement.checkCondition(stats)) {
        // Ensure achievement exists in DB
        await prisma.achievement.upsert({
          where: { code: achievement.code },
          create: {
            code: achievement.code,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            rarity: achievement.rarity,
            xpReward: achievement.xpReward
          },
          update: {}
        })

        // Get achievement ID from DB
        const dbAchievement = await prisma.achievement.findUnique({
          where: { code: achievement.code }
        })

        if (dbAchievement) {
          // Award achievement
          await prisma.userAchievement.create({
            data: {
              userId,
              achievementId: dbAchievement.id
            }
          })
        }

        // Award XP if any
        if (achievement.xpReward > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: { xp: { increment: achievement.xpReward } }
          })
        }

        newlyUnlocked.push(achievement.code)
      }
    }

    return newlyUnlocked
  } catch (error) {
    console.error("Error checking achievements:", error)
    return []
  }
}
