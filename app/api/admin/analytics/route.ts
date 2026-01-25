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
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [userGrowth, activeUsers, lessonsCompleted] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.progress.count({
        where: {
          status: "completed"
        }
      })
    ])

    return NextResponse.json({
      userGrowth,
      activeUsers,
      lessonsCompleted
    })
  } catch (error: any) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
