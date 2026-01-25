import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Get execution history
export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const language = searchParams.get("language")
  const limit = parseInt(searchParams.get("limit") || "50")

  try {
    const where: any = { userId: session.user.id }
    if (language) where.language = language

    const executions = await prisma.codeExecutionHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit
    })

    return NextResponse.json({ executions })
  } catch (error: any) {
    console.error("Error fetching execution history:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Save execution history
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const { language, code, output, success, error, executionTime } = await req.json()

    if (!language || !code) {
      return NextResponse.json(
        { error: "Language and code are required" },
        { status: 400 }
      )
    }

    const execution = await prisma.codeExecutionHistory.create({
      data: {
        userId,
        language,
        code: code.substring(0, 10000), // Limit code length
        output: output ? output.substring(0, 5000) : null,
        success: success !== false,
        error: error ? error.substring(0, 1000) : null,
        executionTime: executionTime || null
      }
    })

    // Keep only last 1000 executions per user
    const count = await prisma.codeExecutionHistory.count({
      where: { userId }
    })

    if (count > 1000) {
      const toDelete = await prisma.codeExecutionHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        take: count - 1000,
        select: { id: true }
      })

      await prisma.codeExecutionHistory.deleteMany({
        where: {
          id: { in: toDelete.map(e => e.id) }
        }
      })
    }

    return NextResponse.json(execution)
  } catch (error: any) {
    console.error("Error saving execution:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
