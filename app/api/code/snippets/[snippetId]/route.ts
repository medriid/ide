import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Get a specific snippet
export async function GET(
  req: Request,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  const session = await getServerSession(authOptions as any) as any

  try {
    const { snippetId } = await params
    const snippet = await prisma.codeSnippet.findUnique({
      where: { id: snippetId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    })

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
    }

    if (!snippet.isPublic && snippet.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(snippet)
  } catch (error: any) {
    console.error("Error fetching snippet:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update a snippet
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { snippetId } = await params
    const snippet = await prisma.codeSnippet.findUnique({
      where: { id: snippetId }
    })

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
    }

    if (snippet.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { title, description, code, tags, isPublic } = await req.json()

    const updated = await prisma.codeSnippet.update({
      where: { id: snippetId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(code !== undefined && { code }),
        ...(tags !== undefined && { tags }),
        ...(isPublic !== undefined && { isPublic })
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("Error updating snippet:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Delete a snippet
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ snippetId: string }> }
) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { snippetId } = await params
    const snippet = await prisma.codeSnippet.findUnique({
      where: { id: snippetId }
    })

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
    }

    if (snippet.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.codeSnippet.delete({
      where: { id: snippetId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting snippet:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
