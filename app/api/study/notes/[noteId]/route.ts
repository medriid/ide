import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Get a specific note
export async function GET(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { noteId } = await params
    const userId = session.user.id

    const note = await prisma.studyNote.findFirst({
      where: {
        id: noteId,
        userId
      }
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error: any) {
    console.error("Error fetching note:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update a note
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { noteId } = await params
    const userId = session.user.id
    const { title, content, tags } = await req.json()

    // Verify note belongs to user
    const existingNote = await prisma.studyNote.findFirst({
      where: {
        id: noteId,
        userId
      }
    })

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    const note = await prisma.studyNote.update({
      where: { id: noteId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags })
      }
    })

    return NextResponse.json(note)
  } catch (error: any) {
    console.error("Error updating note:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a note
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { noteId } = await params
    const userId = session.user.id

    // Verify note belongs to user
    const existingNote = await prisma.studyNote.findFirst({
      where: {
        id: noteId,
        userId
      }
    })

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    await prisma.studyNote.delete({
      where: { id: noteId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting note:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
