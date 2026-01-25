import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket-server"

// GET - Get messages for a group
export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(req.url)
  const groupId = searchParams.get("groupId")

  if (!groupId) {
    return NextResponse.json({ error: "groupId is required" }, { status: 400 })
  }

  // Check if user is a member of the group
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId }
    }
  })

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })
  }

  const messages = await prisma.groupMessage.findMany({
    where: { groupId },
    orderBy: { createdAt: "asc" }
  })

  // Get sender info for each message
  const senderIds = [...new Set(messages.map(m => m.senderId))]
  const senders = await prisma.user.findMany({
    where: { id: { in: senderIds } },
    select: { id: true, username: true, avatarUrl: true }
  })
  const senderMap = new Map(senders.map(s => [s.id, s]))

  const messagesWithSenders = messages.map(msg => ({
    ...msg,
    sender: senderMap.get(msg.senderId) || { id: msg.senderId, username: "Unknown", avatarUrl: null }
  }))

  return NextResponse.json(messagesWithSenders)
}

// POST - Send a message to a group
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { groupId, content } = await req.json()

  if (!groupId || !content?.trim()) {
    return NextResponse.json({ error: "groupId and content are required" }, { status: 400 })
  }

  // Check if user is a member of the group
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId }
    }
  })

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this group" }, { status: 403 })
  }

  const message = await prisma.groupMessage.create({
    data: {
      groupId,
      senderId: userId,
      content: content.trim()
    }
  })

  // Get sender info
  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, avatarUrl: true }
  })

  const messageWithSender = { ...message, sender }

  // Emit WebSocket event to notify group members
  const io = getIO()
  if (io) {
    // Emit to group room
    io.to(`conversation:${groupId}`).emit("new-group-message", {
      groupId,
      senderId: userId,
      message: messageWithSender
    })
    
    // Also emit to individual user rooms for notifications
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true }
    })
    
    members.forEach(member => {
      if (member.userId !== userId) {
        io.to(`user:${member.userId}`).emit("message-received", {
          senderId: userId,
          groupId,
          message: messageWithSender
        })
      }
    })
  }

  return NextResponse.json(messageWithSender)
}
