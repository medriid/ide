import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// POST - Mark messages from a specific user as read
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { withUserId } = await req.json()
  if (!withUserId) {
    return NextResponse.json({ error: "withUserId is required" }, { status: 400 })
  }

  const userId = session.user.id

  const result = await prisma.message.updateMany({
    where: {
      senderId: withUserId,
      receiverId: userId,
      read: false
    },
    data: { read: true }
  })

  return NextResponse.json({ updated: result.count })
}
