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
    const type = searchParams.get("type") || "users"
    const format = searchParams.get("format") || "json"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let data: any = {}
    let filename = "export"

    if (type === "users") {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          xp: true,
          level: true,
          createdAt: true,
          lastKnownIp: true
        },
        orderBy: { createdAt: "desc" }
      })
      data = { users }
      filename = "users-export"
    } else if (type === "lessons") {
      const progress = await prisma.progress.findMany({
        orderBy: { id: "desc" }
      })
      data = { progress }
      filename = "lessons-progress-export"
    } else if (type === "challenges") {
      const challenges = await prisma.challengeProgress.findMany({
        orderBy: { completedAt: "desc" }
      })
      data = { challenges }
      filename = "challenges-export"
    } else if (type === "messages") {
      const messages = await prisma.message.findMany({
        include: {
          sender: { select: { username: true } },
          receiver: { select: { username: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 10000
      })
      data = { messages }
      filename = "messages-export"
    } else if (type === "activity") {
      // Combine various activity sources
      const [users, messages, progress, challenges] = await Promise.all([
        prisma.user.findMany({
          select: {
            id: true,
            username: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" }
        }),
        prisma.message.findMany({
          include: {
            sender: { select: { username: true } },
            receiver: { select: { username: true } }
          },
          orderBy: { createdAt: "desc" },
          take: 5000
        }),
        prisma.progress.findMany({
          orderBy: { id: "desc" },
          take: 5000
        }),
        prisma.challengeProgress.findMany({
          orderBy: { completedAt: "desc" },
          take: 5000
        })
      ])
      data = { users, messages, progress, challenges }
      filename = "activity-export"
    }

    if (format === "csv") {
      // Convert to CSV
      const csv = convertToCSV(data, type)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}-${Date.now()}.csv"`
        }
      })
    } else {
      // JSON format
      return NextResponse.json(data, {
        headers: {
          "Content-Disposition": `attachment; filename="${filename}-${Date.now()}.json"`
        }
      })
    }
  } catch (error: any) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function convertToCSV(data: any, type: string): string {
  if (type === "users" && Array.isArray(data.users)) {
    const headers = ["id", "username", "email", "role", "xp", "level", "createdAt", "lastKnownIp"]
    const rows = data.users.map((u: any) => [
      u.id,
      u.username,
      u.email,
      u.role,
      u.xp,
      u.level,
      u.createdAt,
      u.lastKnownIp || ""
    ])
    return [headers.join(","), ...rows.map((r: any[]) => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n")
  }
  // Add more CSV conversions for other types
  return JSON.stringify(data, null, 2)
}
