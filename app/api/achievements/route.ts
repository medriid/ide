import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { ACHIEVEMENTS, UserStats } from "@/lib/achievements"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id

    // Get user achievements - handle missing tables gracefully
    let userAchievements: any[] = []
    try {
      userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { 
          achievement: true 
        },
        orderBy: { unlockedAt: "desc" }
      })
    } catch (dbError: any) {
      // If tables don't exist yet, return empty achievements
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        console.warn("Achievement tables not found, returning empty list")
        return NextResponse.json({
          achievements: ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, unlockedAt: null })),
          unlockedCount: 0,
          totalCount: ACHIEVEMENTS.length
        })
      }
      throw dbError
    }

    // Get all achievements with unlock status
    const allAchievements = ACHIEVEMENTS.map(achievement => {
      const userAchievement = userAchievements.find(
        ua => ua.achievement?.code === achievement.code
      )
      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt || null
      }
    })

    return NextResponse.json({
      achievements: allAchievements,
      unlockedCount: userAchievements.length,
      totalCount: ACHIEVEMENTS.length
    })
  } catch (error: any) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Check and award achievements
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id

    // Get user stats - handle missing tables gracefully
    let user: any = null
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          level: true,
          xp: true,
          createdAt: true
        }
      })
    } catch (dbError: any) {
      if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
        return NextResponse.json({ error: "Database tables not initialized" }, { status: 503 })
      }
      throw dbError
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get achievements and study streak separately with error handling
    let userAchievements: any[] = []
    let studyStreak: any = null
    try {
      userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true }
      }).catch(() => [])
      studyStreak = await prisma.studyStreak.findUnique({
        where: { userId }
      }).catch(() => null)
    } catch (e) {
      // Tables might not exist, continue with empty data
    }

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
      currentStreak: studyStreak?.currentStreak || 0,
      longestStreak: studyStreak?.longestStreak || 0,
      friendsCount,
      messagesSent,
      daysSinceJoin,
      perfectChallengeScores: 0, // Would need to track this separately
      challengesByDifficulty
    }

    // Get already unlocked achievements
    const unlockedCodes = userAchievements.map((ua: any) => ua.achievement?.code).filter(Boolean)

    // Check each achievement
    const newlyUnlocked: string[] = []
    for (const achievement of ACHIEVEMENTS) {
      if (unlockedCodes.includes(achievement.code)) continue

      if (achievement.checkCondition(stats)) {
        // Ensure achievement exists in DB first
        const dbAchievement = await prisma.achievement.upsert({
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

        // Award achievement
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: dbAchievement.id
          }
        })

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

    return NextResponse.json({
      newlyUnlocked,
      count: newlyUnlocked.length
    })
  } catch (error: any) {
    console.error("Error checking achievements:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
