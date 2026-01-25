import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket-server"

// GET - Get messages with a specific user or list conversations
export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(req.url)
  const withUserId = searchParams.get("with")

  if (withUserId) {
    // Get messages between me and this user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: withUserId },
          { senderId: withUserId, receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: "asc" }
    })

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        senderId: withUserId,
        receiverId: userId,
        read: false
      },
      data: { read: true }
    })

    return NextResponse.json(messages)
  }

  // List all conversations (latest message per user)
  const sentMessages = await prisma.message.findMany({
    where: { senderId: userId },
    include: {
      receiver: {
        select: { id: true, username: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const receivedMessages = await prisma.message.findMany({
    where: { receiverId: userId },
    include: {
      sender: {
        select: { id: true, username: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Build conversations map
  const conversationsMap = new Map<string, any>()

  for (const msg of sentMessages) {
    const otherId = msg.receiverId
    if (!conversationsMap.has(otherId) || msg.createdAt > conversationsMap.get(otherId).lastMessage.createdAt) {
      conversationsMap.set(otherId, {
        user: msg.receiver,
        lastMessage: msg,
        unreadCount: 0
      })
    }
  }

  for (const msg of receivedMessages) {
    const otherId = msg.senderId
    const existing = conversationsMap.get(otherId)
    if (!existing || msg.createdAt > existing.lastMessage.createdAt) {
      conversationsMap.set(otherId, {
        user: msg.sender,
        lastMessage: msg,
        unreadCount: existing?.unreadCount || 0
      })
    }
    if (!msg.read) {
      const conv = conversationsMap.get(otherId)
      if (conv) conv.unreadCount++
    }
  }

  const conversations = Array.from(conversationsMap.values())
    .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())

  return NextResponse.json(conversations)
}

// POST - Send a message
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { receiverId, content } = await req.json()
  const userId = session.user.id

  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: "Missing receiverId or content" }, { status: 400 })
  }

  // Check if they are friends
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "accepted",
      OR: [
        { userId: userId, friendId: receiverId },
        { userId: receiverId, friendId: userId }
      ]
    }
  })

  if (!friendship) {
    return NextResponse.json({ error: "You must be friends to send messages" }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      receiverId,
      content: content.trim()
    },
    include: {
      sender: {
        select: { id: true, username: true, avatarUrl: true }
      },
      receiver: {
        select: { id: true, username: true, avatarUrl: true }
      }
    }
  })

  // Emit WebSocket events to notify receiver and sync to sender's other tabs
  const io = getIO()
  if (io) {
    const conversationId = [userId, receiverId].sort().join("-")
    
    console.log(`[API] Emitting events for message ${message.id} from ${userId} to ${receiverId}`)
    
    // 1. Emit to receiver's user room (for notifications - works on any page)
    io.to(`user:${receiverId}`).emit("message-received", {
      senderId: userId,
      message
    })
    console.log(`[API] Emitted message-received to user:${receiverId}`)
    
    // 2. Emit to conversation room (for chat updates - only if viewing conversation)
    io.to(`conversation:${conversationId}`).emit("new-message", {
      senderId: userId,
      receiverId,
      message
    })
    console.log(`[API] Emitted new-message to conversation:${conversationId}`)
    
    // 3. Emit to sender's own user room (for syncing across sender's tabs)
    io.to(`user:${userId}`).emit("message-sent", {
      receiverId,
      message
    })
    console.log(`[API] Emitted message-sent to user:${userId}`)
  } else {
    console.warn("[API] Socket.io instance not available in API route")
  }

  return NextResponse.json(message)
}
