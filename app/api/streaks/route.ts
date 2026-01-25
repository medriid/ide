import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { updateStreak } from "@/lib/streaks"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id

    const streak = await prisma.studyStreak.findUnique({
      where: { userId }
    })

    if (!streak) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
        streakFreezeUsed: false,
        streakFreezeCount: 0
      })
    }

    return NextResponse.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
      streakFreezeUsed: streak.streakFreezeUsed,
      streakFreezeCount: streak.streakFreezeCount
    })
  } catch (error: any) {
    console.error("Error fetching streak:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Update streak (called when user completes activity)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id

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

    return NextResponse.json({
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastActiveDate: streak.lastActiveDate,
      streakFreezeUsed: streak.streakFreezeUsed,
      streakFreezeCount: streak.streakFreezeCount,
      isNewStreak: !currentStreak || currentStreak.currentStreak !== streak.currentStreak
    })
  } catch (error: any) {
    console.error("Error updating streak:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
