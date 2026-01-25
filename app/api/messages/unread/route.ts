import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Get unread messages for notifications
export async function GET() {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // Get unread messages from the last 30 seconds (for polling)
  const thirtySecondsAgo = new Date(Date.now() - 30000)
  
  const messages = await prisma.message.findMany({
    where: {
      receiverId: userId,
      read: false,
      createdAt: {
        gte: thirtySecondsAgo
      }
    },
    include: {
      sender: {
        select: { id: true, username: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 5
  })

  return NextResponse.json(messages)
}

