import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

export async function GET() {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isOwner = session.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || session.user.role === "owner"
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const [totalUsers, totalLessons, activeInvites, totalMessages, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.lesson.count(),
      prisma.inviteCode.count({ where: { active: true } }),
      prisma.message.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          username: true,
          createdAt: true
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalLessons,
      activeInvites,
      totalMessages,
      recentUsers
    })
  } catch (error: any) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
