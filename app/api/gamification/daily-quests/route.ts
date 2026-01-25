import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Get today's quests for user
export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get active quests
    const activeQuests = await prisma.dailyQuest.findMany({
      where: { isActive: true },
      orderBy: { xpReward: "desc" }
    })

    // Get user's progress for today
    const progress = await prisma.dailyQuestProgress.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    const progressMap = new Map(progress.map(p => [p.questId, p]))

    // Combine quests with progress
    const questsWithProgress = activeQuests.map(quest => {
      const userProgress = progressMap.get(quest.id)
      return {
        ...quest,
        progress: userProgress?.progress || 0,
        completed: userProgress?.completed || false,
        completedAt: userProgress?.completedAt || null
      }
    })

    return NextResponse.json({ quests: questsWithProgress })
  } catch (error: any) {
    console.error("Error fetching daily quests:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Update quest progress (called internally by other actions)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const { questCode, increment = 1 } = await req.json()

    if (!questCode) {
      return NextResponse.json({ error: "Quest code is required" }, { status: 400 })
    }

    // Find quest by code
    const quest = await prisma.dailyQuest.findUnique({
      where: { code: questCode }
    })

    if (!quest || !quest.isActive) {
      return NextResponse.json({ error: "Quest not found or inactive" }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get or create progress
    let progress = await prisma.dailyQuestProgress.findFirst({
      where: {
        userId,
        questId: quest.id,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    if (!progress) {
      progress = await prisma.dailyQuestProgress.create({
        data: {
          userId,
          questId: quest.id,
          progress: 0,
          date: today
        }
      })
    }

    // Update progress
    const newProgress = Math.min(progress.progress + increment, quest.target)
    const completed = newProgress >= quest.target && !progress.completed

    const updated = await prisma.dailyQuestProgress.update({
      where: { id: progress.id },
      data: {
        progress: newProgress,
        completed,
        completedAt: completed ? new Date() : progress.completedAt
      }
    })

    // Award XP if just completed
    if (completed && !progress.completed) {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (user) {
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: quest.xpReward } }
        })
      }
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Error updating quest progress:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
