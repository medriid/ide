import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Get all user's notes
export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id

    const notes = await prisma.studyNote.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json({
      notes
    })
  } catch (error: any) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new note
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const { title, content } = await req.json()

    const note = await prisma.studyNote.create({
      data: {
        userId,
        title: title || "Untitled Note",
        content: content || ""
      }
    })

    return NextResponse.json(note)
  } catch (error: any) {
    console.error("Error creating note:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
