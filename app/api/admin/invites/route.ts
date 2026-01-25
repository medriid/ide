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
    const invites = await prisma.inviteCode.findMany({
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ invites })
  } catch (error: any) {
    console.error("Error fetching invites:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isOwner = session.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || session.user.role === "owner"
  if (!isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { code } = await req.json()
    
    const inviteCode = code || Math.random().toString(36).substring(2, 10).toUpperCase()

    const invite = await prisma.inviteCode.create({
      data: {
        code: inviteCode,
        active: true
      }
    })

    return NextResponse.json({ invite })
  } catch (error: any) {
    console.error("Error creating invite:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
