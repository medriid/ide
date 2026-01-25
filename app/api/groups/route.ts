import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - List user's group chats
export async function GET() {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const groups = await prisma.groupChat.findMany({
    where: {
      members: {
        some: { userId }
      }
    },
    include: {
      members: {
        include: {
          // We'll need to get user info separately since there's no direct relation
        }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Get member user info for each group
  const groupsWithMembers = await Promise.all(
    groups.map(async (group) => {
      const memberUserIds = group.members.map(m => m.userId)
      const users = await prisma.user.findMany({
        where: { id: { in: memberUserIds } },
        select: { id: true, username: true, avatarUrl: true }
      })
      
      return {
        ...group,
        memberUsers: users,
        lastMessage: group.messages[0] || null
      }
    })
  )

  return NextResponse.json(groupsWithMembers)
}

// POST - Create a new group chat
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { name, memberIds } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: "Group name is required" }, { status: 400 })
  }

  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return NextResponse.json({ error: "At least one member is required" }, { status: 400 })
  }

  // Verify all members are friends with the creator
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "accepted",
      OR: [
        { userId, friendId: { in: memberIds } },
        { userId: { in: memberIds }, friendId: userId }
      ]
    }
  })

  const friendIds = new Set<string>()
  for (const f of friendships) {
    if (f.userId === userId) friendIds.add(f.friendId)
    else friendIds.add(f.userId)
  }

  const validMemberIds = memberIds.filter((id: string) => friendIds.has(id))
  
  if (validMemberIds.length === 0) {
    return NextResponse.json({ error: "No valid friends selected" }, { status: 400 })
  }

  // Create the group
  const group = await prisma.groupChat.create({
    data: {
      name: name.trim(),
      creatorId: userId,
      members: {
        create: [
          { userId, role: "admin" },
          ...validMemberIds.map((memberId: string) => ({ userId: memberId, role: "member" }))
        ]
      }
    },
    include: {
      members: true
    }
  })

  return NextResponse.json(group)
}
