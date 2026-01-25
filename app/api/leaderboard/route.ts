import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getXpProgress, getRankTitle, getRankColor } from "@/lib/xp"

// GET - Get leaderboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    // Get top users ordered by XP
    const users = await prisma.user.findMany({
      orderBy: { xp: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        xp: true,
        level: true,
        createdAt: true
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.user.count()

    // Enhance with rank info
    const leaderboard = users.map((user, index) => {
      const progress = getXpProgress(user.xp)
      return {
        rank: offset + index + 1,
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        level: progress.level,
        xp: user.xp,
        rankTitle: getRankTitle(progress.level),
        rankColor: getRankColor(progress.level),
        progressPercent: progress.progressPercent,
        joinedAt: user.createdAt
      }
    })

    return NextResponse.json({
      leaderboard,
      total: totalCount,
      limit,
      offset
    })
  } catch (error) {
    console.error("Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
