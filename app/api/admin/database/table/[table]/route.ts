import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ table: string }> }
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
    const { table } = await params
    const modelMap: any = {
      User: prisma.user,
      InviteCode: prisma.inviteCode,
      SqlSchema: prisma.sqlSchema,
      FileNode: prisma.fileNode,
      Lesson: prisma.lesson,
      LessonSection: prisma.lessonSection,
      Progress: prisma.progress,
      Message: prisma.message,
      Friendship: prisma.friendship,
      GroupChat: prisma.groupChat,
      GroupMember: prisma.groupMember,
      GroupMessage: prisma.groupMessage,
      ChallengeProgress: prisma.challengeProgress,
    }

    const model = modelMap[table]
    if (!model) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 })
    }

    const data = await model.findMany({
      take: 1000,
      orderBy: { id: "desc" }
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("Error fetching table data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
