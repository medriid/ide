import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

export async function GET(
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

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        sections: {
          orderBy: { order: "asc" }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json({ lesson })
  } catch (error: any) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
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
    const data = await req.json()

    const updateData: any = {}
    if (data.slug !== undefined) updateData.slug = data.slug
    if (data.title !== undefined) updateData.title = data.title
    if (data.topic !== undefined) updateData.topic = data.topic
    if (data.summary !== undefined) updateData.summary = data.summary
    if (data.order !== undefined) updateData.order = data.order
    if (data.published !== undefined) updateData.published = data.published

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: updateData,
      include: {
        sections: {
          orderBy: { order: "asc" }
        }
      }
    })

    return NextResponse.json({ lesson })
  } catch (error: any) {
    console.error("Error updating lesson:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
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

    await prisma.lesson.delete({
      where: { id: lessonId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting lesson:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
