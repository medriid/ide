import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
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
    const { lessonId } = await params
    const { title, content, type, order } = await req.json()

    const section = await prisma.lessonSection.create({
      data: {
        lessonId,
        title,
        content,
        type: type || "text",
        order: order !== undefined ? order : 0
      }
    })

    return NextResponse.json({ section })
  } catch (error: any) {
    console.error("Error creating section:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
