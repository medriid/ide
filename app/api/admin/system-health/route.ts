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
    const startTime = Date.now()
    
    // Test database connection
    let dbStatus = "healthy"
    let dbResponseTime = 0
    try {
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbResponseTime = Date.now() - dbStart
    } catch (error) {
      dbStatus = "unhealthy"
    }

    const apiResponseTime = Date.now() - startTime

    // Get system metrics
    const [userCount, messageCount, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.message.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ])

    // Get error rate (simplified - would need error tracking in production)
    const recentErrors = 0 // Placeholder

    return NextResponse.json({
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        connected: dbStatus === "healthy"
      },
      api: {
        responseTime: apiResponseTime,
        status: "operational"
      },
      metrics: {
        totalUsers: userCount,
        totalMessages: messageCount,
        activeUsers24h: activeUsers,
        errorRate: recentErrors
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error("Error fetching system health:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
