import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
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
    const { sectionId } = await params
    const data = await req.json()

    const updateData: any = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.content !== undefined) updateData.content = data.content
    if (data.type !== undefined) updateData.type = data.type
    if (data.order !== undefined) updateData.order = data.order

    const section = await prisma.lessonSection.update({
      where: { id: sectionId },
      data: updateData
    })

    return NextResponse.json({ section })
  } catch (error: any) {
    console.error("Error updating section:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sectionId: string }> }
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
    const { sectionId } = await params

    await prisma.lessonSection.delete({
      where: { id: sectionId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting section:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
