import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isOwner = session.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || session.user.role === "owner"
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    // Get user activity metrics
    const [user, messages, progress, challenges, files] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          lastKnownIp: true,
          xp: true,
          level: true
        }
      }),
      prisma.message.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }]
        }
      }),
      prisma.progress.findMany({
        where: { userId },
        select: {
          lessonId: true,
          sectionId: true,
          status: true,
          score: true
        }
      }),
      prisma.challengeProgress.findMany({
        where: { userId },
        select: {
          challengeId: true,
          completedAt: true,
          xpAwarded: true
        }
      }),
      prisma.fileNode.findMany({
        where: { userId },
        select: {
          path: true,
          updatedAt: true,
          size: true
        }
      })
    ])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const completedLessons = progress.filter(p => p.status === "completed" && !p.sectionId).length
    const completedSections = progress.filter(p => p.status === "completed" && p.sectionId).length
    const totalFiles = files.length
    const totalFileSize = files.reduce((sum, f) => sum + (f.size || 0), 0)
    const lastFileActivity = files.length > 0 
      ? new Date(Math.max(...files.map(f => f.updatedAt.getTime())))
      : null

    // Calculate activity score
    const activityScore = 
      (messages * 1) +
      (completedLessons * 10) +
      (completedSections * 5) +
      (challenges.length * 15) +
      (totalFiles * 2)

    return NextResponse.json({
      user: {
        ...user,
        accountAge: Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      },
      activity: {
        messagesSent: messages,
        lessonsCompleted: completedLessons,
        sectionsCompleted: completedSections,
        challengesCompleted: challenges.length,
        filesCreated: totalFiles,
        totalFileSize,
        lastFileActivity,
        activityScore,
        xp: user.xp,
        level: user.level
      },
      recentActivity: {
        challenges: challenges.slice(0, 10).map(c => ({
          challengeId: c.challengeId,
          completedAt: c.completedAt,
          xpAwarded: c.xpAwarded
        })),
        files: files
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 10)
          .map(f => ({
            path: f.path,
            updatedAt: f.updatedAt,
            size: f.size
          }))
      }
    })
  } catch (error: any) {
    console.error("Error fetching user activity:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
