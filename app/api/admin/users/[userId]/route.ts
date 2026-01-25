import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isOwner = session.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || session.user.role === "owner"
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { username, email, role, xp, level } = await req.json()
    const { userId } = await params

    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (xp !== undefined) updateData.xp = parseInt(xp)
    if (level !== undefined) updateData.level = parseInt(level)

    // Use explicit select to avoid issues with missing columns
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        xp: true,
        level: true,
        avatarUrl: true,
        bio: true,
        createdAt: true
      }
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isOwner = session.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || session.user.role === "owner"
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { userId } = await params

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
