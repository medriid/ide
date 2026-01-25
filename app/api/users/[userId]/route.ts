import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getXpProgress, getRankTitle, getRankColor } from "@/lib/xp"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

// GET - Get public user profile
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    
    // Check if viewer is owner
    const session = await getServerSession(authOptions as any) as any
    const isOwner = session?.user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || 
                    session?.user?.role === "owner"

    // Fetch user - don't include lastKnownIp in select as column may not exist yet
    // We'll handle it separately if needed
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        xp: true,
        level: true,
        createdAt: true
      }
    })
    
    // Try to get lastKnownIp separately if owner and column exists
    let lastKnownIp: string | null | undefined = undefined
    if (isOwner) {
      try {
        const userWithIp = await prisma.$queryRaw<Array<{ lastKnownIp: string | null }>>`
          SELECT lastKnownIp FROM User WHERE id = ${userId} LIMIT 1
        `.catch(() => null)
        if (userWithIp && userWithIp.length > 0) {
          lastKnownIp = userWithIp[0]?.lastKnownIp || null
        }
      } catch (e: any) {
        // Column doesn't exist yet - that's fine
        if (e.message?.includes("Unknown column") || e.message?.includes("does not exist")) {
          lastKnownIp = null
        }
      }
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get lesson progress stats
    const progressRecords = await prisma.progress.findMany({
      where: { 
        userId: userId,
        sectionId: null,
        status: "completed"
      }
    })

    const completedLessons = progressRecords.length

    // Get user's rank in leaderboard
    const usersAbove = await prisma.user.count({
      where: { xp: { gt: user.xp } }
    })
    const globalRank = usersAbove + 1

    // Calculate XP progress
    const progress = getXpProgress(user.xp)

    // Get achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: "desc" }
    }).catch(() => [])

    // Get streak
    const streak = await prisma.studyStreak.findUnique({
      where: { userId }
    }).catch(() => null)

    // Get user customization (for MEDIOCRE role features)
    const customization = await prisma.userCustomization.findUnique({
      where: { userId }
    }).catch(() => null)

    return NextResponse.json({
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      level: progress.level,
      xp: user.xp,
      currentLevelXp: progress.currentLevelXp,
      xpForNextLevel: progress.xpForNextLevel,
      progressPercent: progress.progressPercent,
      rankTitle: getRankTitle(progress.level),
      rankColor: getRankColor(progress.level),
      globalRank,
      completedLessons,
      joinedAt: user.createdAt,
      achievements: userAchievements.map(ua => ({
        code: ua.achievement.code,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        rarity: ua.achievement.rarity,
        xpReward: ua.achievement.xpReward,
        unlockedAt: ua.unlockedAt
      })),
      streak: streak ? {
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastActiveDate: streak.lastActiveDate
      } : null,
      // Owner-only fields
      email: isOwner ? user.email : undefined,
      lastKnownIp: isOwner ? lastKnownIp : undefined,
      // Customization fields
      profileCardGradient: customization?.profileCardGradient
        ? (typeof customization.profileCardGradient === 'string'
            ? JSON.parse(customization.profileCardGradient)
            : customization.profileCardGradient)
        : null,
      profileBannerImage: customization?.profileBannerImage || null,
      profileBannerType: customization?.profileBannerType || null,
      customCardColor: customization?.customCardColor || null
    })
  } catch (error: any) {
    console.error("User profile error:", error)
    // Handle case where columns don't exist yet
    if (error.message?.includes("Unknown column") || 
        error.message?.includes("does not exist") ||
        error.code === "P2025") {
      return NextResponse.json({ 
        error: "Database migration needed",
        details: error.message 
      }, { status: 500 })
    }
    return NextResponse.json({ 
      error: "Failed to fetch user profile",
      details: error.message 
    }, { status: 500 })
  }
}
