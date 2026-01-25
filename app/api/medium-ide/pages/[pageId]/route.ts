import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { pageId } = await params
  const page = await prisma.mediumIDEPage.findFirst({
    where: {
      id: pageId,
      userId
    }
  })

  if (!page) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  return NextResponse.json(page)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { pageId } = await params
  const page = await prisma.mediumIDEPage.findFirst({
    where: {
      id: pageId,
      userId
    }
  })

  if (!page) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const { name, content } = await req.json()
  const updateData: any = {}
  if (name !== undefined) updateData.name = name.trim()
  if (content !== undefined) updateData.content = content

  const updated = await prisma.mediumIDEPage.update({
    where: { id: pageId },
    data: updateData
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { pageId } = await params
  const page = await prisma.mediumIDEPage.findFirst({
    where: {
      id: pageId,
      userId
    }
  })

  if (!page) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  await prisma.mediumIDEPage.delete({
    where: { id: pageId }
  })

  return NextResponse.json({ ok: true })
}
