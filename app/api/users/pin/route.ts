import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import argon2 from "argon2"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { projectPin: true }
  })

  return NextResponse.json({ hasPin: !!user?.projectPin })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { pin } = await req.json()
  if (!pin || typeof pin !== "string" || pin.length < 4 || pin.length > 20) {
    return NextResponse.json({ error: "PIN must be 4-20 characters" }, { status: 400 })
  }

  const pinHash = await argon2.hash(pin)
  await prisma.user.update({
    where: { id: userId },
    data: { projectPin: pinHash }
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  await prisma.user.update({
    where: { id: userId },
    data: { projectPin: null }
  })

  // Unlock all projects when PIN is removed
  await prisma.mediumIDEProject.updateMany({
    where: { userId, isLocked: true },
    data: { isLocked: false }
  })

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { pin, newPin } = await req.json()
  if (!pin || !newPin) {
    return NextResponse.json({ error: "PIN and new PIN are required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { projectPin: true }
  })

  if (!user?.projectPin) {
    return NextResponse.json({ error: "No PIN set" }, { status: 400 })
  }

  try {
    const isValid = await argon2.verify(user.projectPin, pin)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
  }

  if (newPin.length < 4 || newPin.length > 20) {
    return NextResponse.json({ error: "New PIN must be 4-20 characters" }, { status: 400 })
  }

  const newPinHash = await argon2.hash(newPin)
  await prisma.user.update({
    where: { id: userId },
    data: { projectPin: newPinHash }
  })

  return NextResponse.json({ ok: true })
}
