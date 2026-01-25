import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Get user's checklist
export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id

    const checklist = await prisma.studyChecklist.findUnique({
      where: { userId }
    })

    if (!checklist) {
      return NextResponse.json({
        items: []
      })
    }

    // Parse JSON items
    let items = []
    try {
      items = JSON.parse(checklist.items)
    } catch (e) {
      items = []
    }

    return NextResponse.json({
      items
    })
  } catch (error: any) {
    console.error("Error fetching checklist:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Save checklist
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const { items } = await req.json()

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Items must be an array" }, { status: 400 })
    }

    const checklist = await prisma.studyChecklist.upsert({
      where: { userId },
      create: {
        userId,
        title: "Study Checklist",
        items: JSON.stringify(items)
      },
      update: {
        items: JSON.stringify(items)
      }
    })

    return NextResponse.json({
      success: true,
      items: JSON.parse(checklist.items)
    })
  } catch (error: any) {
    console.error("Error saving checklist:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
