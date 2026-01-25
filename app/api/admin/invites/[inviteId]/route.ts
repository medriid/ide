import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
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
    const { active } = await req.json()
    const { inviteId } = await params

    const invite = await prisma.inviteCode.update({
      where: { id: inviteId },
      data: { active }
    })

    return NextResponse.json({ invite })
  } catch (error: any) {
    console.error("Error updating invite:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
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
    const { inviteId } = await params

    await prisma.inviteCode.delete({
      where: { id: inviteId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting invite:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
