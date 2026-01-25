import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import argon2 from "argon2"

export async function POST(
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { projectPin: true }
  })

  if (!user?.projectPin) {
    return NextResponse.json({ error: "No PIN set. Please set a PIN in settings first." }, { status: 400 })
  }

  if (!pin) {
    return NextResponse.json({ error: "PIN is required" }, { status: 400 })
  }

  try {
    const isValid = await argon2.verify(user.projectPin, pin)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
  }

  await prisma.mediumIDEProject.update({
    where: { id: projectId },
    data: { isLocked: true }
  })

  return NextResponse.json({ ok: true })
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { projectPin: true }
  })

  if (!user?.projectPin) {
    // No PIN set, allow unlock
    await prisma.mediumIDEProject.update({
      where: { id: projectId },
      data: { isLocked: false }
    })
    return NextResponse.json({ ok: true })
  }

  if (!pin) {
    return NextResponse.json({ error: "PIN is required" }, { status: 400 })
  }

  try {
    const isValid = await argon2.verify(user.projectPin, pin)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
  }

  await prisma.mediumIDEProject.update({
    where: { id: projectId },
    data: { isLocked: false }
  })

  return NextResponse.json({ ok: true })
}
