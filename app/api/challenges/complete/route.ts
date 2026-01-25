import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getChallengeXpReward, calculateLevel } from "@/lib/xp"
import { getChallengeById } from "@/lib/challenges"
import { updateUserStreak } from "@/lib/streak-service"
import { checkAndAwardAchievements } from "@/lib/achievement-service"

// POST - Mark a challenge as completed and award XP
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { challengeId } = body

    if (!challengeId) {
      return NextResponse.json({ error: "challengeId is required" }, { status: 400 })
    }

    // Validate challenge exists
    const challenge = getChallengeById(challengeId)
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
    }

    // Check if already completed
    const existingProgress = await prisma.challengeProgress.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId
        }
      }
    })

    if (existingProgress) {
      // Already completed - return success but no XP
      return NextResponse.json({
        ok: true,
        alreadyCompleted: true,
        xpAwarded: 0,
        message: "Challenge already completed"
      })
    }

    // Calculate XP reward based on difficulty
    const xpReward = getChallengeXpReward(challenge.difficulty)

    // Get current user XP
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true }
    })

    const currentXp = user?.xp || 0
    const newXp = currentXp + xpReward
    const newLevel = calculateLevel(newXp)
    const leveledUp = newLevel > (user?.level || 1)

    // Create progress record and update user XP in a transaction
    await prisma.$transaction([
      prisma.challengeProgress.create({
        data: {
          userId,
          challengeId,
          status: "completed",
          xpAwarded: xpReward
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          xp: newXp,
          level: newLevel
        }
      })
    ])

    // Update streak and check achievements (non-blocking)
    Promise.all([
      updateUserStreak(userId),
      checkAndAwardAchievements(userId)
    ]).catch(() => {})

    return NextResponse.json({
      ok: true,
      alreadyCompleted: false,
      xpAwarded: xpReward,
      newXp,
      newLevel,
      leveledUp,
      message: `Challenge completed! +${xpReward} XP`
    })

  } catch (error) {
    console.error("Failed to complete challenge:", error)
    return NextResponse.json({ error: "Failed to complete challenge" }, { status: 500 })
  }
}

// GET - Get user's completed challenges
export async function GET() {
  try {
    const session = await getServerSession(authOptions as any) as any
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    const completedChallenges = await prisma.challengeProgress.findMany({
      where: { userId },
      select: {
        challengeId: true,
        xpAwarded: true,
        completedAt: true
      }
    })

    const completedIds = completedChallenges.map(c => c.challengeId)
    const totalXpFromChallenges = completedChallenges.reduce((sum, c) => sum + c.xpAwarded, 0)

    return NextResponse.json({
      ok: true,
      completedChallenges: completedIds,
      totalCompleted: completedIds.length,
      totalXpFromChallenges
    })

  } catch (error) {
    console.error("Failed to fetch challenge progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
