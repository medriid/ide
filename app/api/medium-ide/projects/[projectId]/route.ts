import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { projectId } = await params
  const project = await prisma.mediumIDEProject.findFirst({
    where: {
      id: projectId,
      userId
    },
    include: {
      pages: {
        orderBy: { createdAt: "asc" }
      }
    }
  })

  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { projectId } = await params
  const { pin } = await req.json()

  const project = await prisma.mediumIDEProject.findFirst({
    where: {
      id: projectId,
      userId
    }
  })

  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  // Check if PIN is required
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { projectPin: true }
  })

  if (user?.projectPin) {
    if (!pin) {
      return NextResponse.json({ error: "PIN is required to delete project" }, { status: 400 })
    }

    try {
      const argon2 = (await import("argon2")).default
      const isValid = await argon2.verify(user.projectPin, pin)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
    }
  }

  await prisma.mediumIDEProject.delete({
    where: { id: projectId }
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { projectId } = await params
  const project = await prisma.mediumIDEProject.findFirst({
    where: {
      id: projectId,
      userId
    }
  })

  if (!project) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const { name, description } = await req.json()
  const updateData: any = {}
  if (name !== undefined) updateData.name = name.trim()
  if (description !== undefined) updateData.description = description?.trim() || null

  const updated = await prisma.mediumIDEProject.update({
    where: { id: projectId },
    data: updateData,
    include: {
      pages: {
        orderBy: { createdAt: "asc" }
      }
    }
  })

  return NextResponse.json(updated)
}
