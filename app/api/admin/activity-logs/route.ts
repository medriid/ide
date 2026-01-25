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
    const actionType = searchParams.get("actionType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Build activity logs from various sources
    const logs: any[] = []

    // User login activity (from User model - using createdAt as proxy, but ideally we'd track this)
    const users = await prisma.user.findMany({
      where: userId ? { id: userId } : undefined,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        lastKnownIp: true
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    })

    users.forEach(user => {
      logs.push({
        id: `user-${user.id}`,
        userId: user.id,
        username: user.username,
        actionType: "user_created",
        description: `User ${user.username} registered`,
        metadata: { email: user.email, ip: user.lastKnownIp },
        timestamp: user.createdAt
      })
    })

    // Message activity
    const messages = await prisma.message.findMany({
      where: {
        ...(userId ? { OR: [{ senderId: userId }, { receiverId: userId }] } : {}),
        ...(startDate && endDate ? {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        } : {})
      },
      include: {
        sender: { select: { username: true } },
        receiver: { select: { username: true } }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    })

    messages.forEach(msg => {
      logs.push({
        id: `msg-${msg.id}`,
        userId: msg.senderId,
        username: msg.sender.username,
        actionType: "message_sent",
        description: `Sent message to ${msg.receiver.username}`,
        metadata: { receiverId: msg.receiverId, messageId: msg.id },
        timestamp: msg.createdAt
      })
    })

    // Progress/completion activity
    const progress = await prisma.progress.findMany({
      where: {
        ...(userId ? { userId } : {}),
        status: "completed",
        ...(startDate && endDate ? {
          // Progress doesn't have createdAt, so we'll use a workaround
        } : {})
      },
      orderBy: { id: "desc" },
      take: limit
    })

    progress.forEach(p => {
      logs.push({
        id: `progress-${p.id}`,
        userId: p.userId,
        actionType: "lesson_completed",
        description: `Completed lesson section`,
        metadata: { lessonId: p.lessonId, sectionId: p.sectionId, score: p.score },
        timestamp: new Date() // Progress doesn't have timestamp, using current
      })
    })

    // Challenge completion activity
    const challenges = await prisma.challengeProgress.findMany({
      where: userId ? { userId } : {},
      orderBy: { completedAt: "desc" },
      take: limit
    })

    challenges.forEach(c => {
      logs.push({
        id: `challenge-${c.id}`,
        userId: c.userId,
        actionType: "challenge_completed",
        description: `Completed challenge ${c.challengeId}`,
        metadata: { challengeId: c.challengeId, xpAwarded: c.xpAwarded },
        timestamp: c.completedAt
      })
    })

    // Sort by timestamp and apply filters
    let filteredLogs = logs
      .filter(log => {
        if (actionType && log.actionType !== actionType) return false
        if (startDate && new Date(log.timestamp) < new Date(startDate)) return false
        if (endDate && new Date(log.timestamp) > new Date(endDate)) return false
        return true
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      logs: filteredLogs,
      total: filteredLogs.length
    })
  } catch (error: any) {
    console.error("Error fetching activity logs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
