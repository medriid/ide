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
    // Get table names from Prisma schema
    const tables = [
      "User",
      "InviteCode",
      "SqlSchema",
      "FileNode",
      "Lesson",
      "LessonSection",
      "Progress",
      "Message",
      "Friendship",
      "GroupChat",
      "GroupMember",
      "GroupMessage",
      "ChallengeProgress"
    ]

    return NextResponse.json({ tables })
  } catch (error: any) {
    console.error("Error fetching tables:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
