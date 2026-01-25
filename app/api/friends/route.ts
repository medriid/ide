import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - List all friends and pending requests
export async function GET() {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  // Get friendships where I'm either the initiator or receiver
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: userId },
        { friendId: userId }
      ]
    },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true }
      },
      friend: {
        select: { id: true, username: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Format the response
  const friends = friendships.map(f => {
    const isInitiator = f.userId === userId
    const otherUser = isInitiator ? f.friend : f.user
    return {
      id: f.id,
      status: f.status,
      isInitiator,
      user: otherUser,
      createdAt: f.createdAt
    }
  })

  return NextResponse.json(friends)
}

// POST - Send friend request or accept request
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { username, action, friendshipId } = await req.json()
  const userId = session.user.id

  // Accept a pending request
  if (action === "accept" && friendshipId) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        id: friendshipId,
        friendId: userId,
        status: "pending"
      }
    })

    if (!friendship) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "accepted" }
    })

    return NextResponse.json({ success: true })
  }

  // Send a new friend request
  if (username) {
    const friend = await prisma.user.findUnique({
      where: { username }
    })

    if (!friend) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (friend.id === userId) {
      return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 })
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friend.id },
          { userId: friend.id, friendId: userId }
        ]
      }
    })

    if (existing) {
      return NextResponse.json({ error: "Already friends or request pending" }, { status: 400 })
    }

    const friendship = await prisma.friendship.create({
      data: {
        userId: userId,
        friendId: friend.id,
        status: "pending"
      }
    })

    return NextResponse.json(friendship)
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}

// DELETE - Remove friend or decline request
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { friendshipId } = await req.json()
  const userId = session.user.id

  const friendship = await prisma.friendship.findFirst({
    where: {
      id: friendshipId,
      OR: [
        { userId: userId },
        { friendId: userId }
      ]
    }
  })

  if (!friendship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.friendship.delete({
    where: { id: friendshipId }
  })

  return NextResponse.json({ success: true })
}

