import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { checkAndGrantMediumRole } from "@/lib/theme"

// GET - Get current user profile
export async function GET() {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        xp: true,
        level: true,
        createdAt: true
        // Note: lastKnownIp is not included here as it may not exist yet
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Auto-grant MEDIOCRE role to level 100+ users
    await checkAndGrantMediumRole(session.user.id)
    
    // Refresh user data in case role changed
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
        bio: true,
        role: true,
        xp: true,
        level: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      id: updatedUser?.id || user.id,
      username: updatedUser?.username || user.username,
      email: updatedUser?.email || user.email,
      avatarUrl: updatedUser?.avatarUrl || user.avatarUrl || null,
      bio: updatedUser?.bio || user.bio || null,
      role: updatedUser?.role || user.role,
      xp: updatedUser?.xp || user.xp || 0,
      level: updatedUser?.level || user.level || 1,
      createdAt: updatedUser?.createdAt || user.createdAt
    })
  } catch (e: any) {
    console.error("Profile fetch error:", e)
    // Handle case where columns don't exist yet
    if (e.code === "P2025" || e.message?.includes("Unknown column") || e.message?.includes("does not exist")) {
      return NextResponse.json({ 
        error: "Database migration needed",
        details: e.message 
      }, { status: 500 })
    }
    return NextResponse.json({ 
      error: "Failed to fetch profile",
      details: e.message 
    }, { status: 500 })
  }
}

// PATCH - Update profile
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { username, avatarUrl, bio } = await req.json()
    const userId = session.user.id

    // Validate username if provided
    if (username !== undefined && username !== null) {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return NextResponse.json({ 
          error: "Username must be 3-20 characters, alphanumeric and underscores only" 
        }, { status: 400 })
      }

      // Check if username is taken
      const existing = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      })

      if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (username !== undefined && username !== null) updateData.username = username
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (bio !== undefined) updateData.bio = bio

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: (user as any).avatarUrl || null,
      bio: (user as any).bio || null,
      role: user.role
    })
  } catch (e: any) {
    console.error("Profile update error:", e)
    // Handle case where columns don't exist yet
    if (e.code === "P2025" || e.message?.includes("Unknown arg")) {
      return NextResponse.json({ error: "Database migration needed. Please run: npx prisma migrate deploy" }, { status: 500 })
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
