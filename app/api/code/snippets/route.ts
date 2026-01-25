import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"

// GET - Get user's snippets or public snippets
export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  const { searchParams } = new URL(req.url)
  const publicOnly = searchParams.get("public") === "true"
  const language = searchParams.get("language")
  const shareId = searchParams.get("shareId")

  try {
    // Get specific snippet by shareId
    if (shareId) {
      const snippet = await prisma.codeSnippet.findUnique({
        where: { shareId },
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

      if (!snippet || (!snippet.isPublic && snippet.userId !== session?.user?.id)) {
        return NextResponse.json({ error: "Snippet not found" }, { status: 404 })
      }

      // Increment views
      await prisma.codeSnippet.update({
        where: { id: snippet.id },
        data: { views: { increment: 1 } }
      })

      return NextResponse.json(snippet)
    }

    // Get user's snippets
    if (session?.user?.id && !publicOnly) {
      const where: any = { userId: session.user.id }
      if (language) where.language = language

      const snippets = await prisma.codeSnippet.findMany({
        where,
        orderBy: { updatedAt: "desc" },
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

      return NextResponse.json({ snippets })
    }

    // Get public snippets
    const where: any = { isPublic: true }
    if (language) where.language = language

    const snippets = await prisma.codeSnippet.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
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

    return NextResponse.json({ snippets })
  } catch (error: any) {
    console.error("Error fetching snippets:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new snippet
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const { title, description, language, code, tags, isPublic } = await req.json()

    if (!title || !language || !code) {
      return NextResponse.json(
        { error: "Title, language, and code are required" },
        { status: 400 }
      )
    }

    // Generate unique share ID
    const shareId = randomBytes(8).toString("hex")

    const snippet = await prisma.codeSnippet.create({
      data: {
        userId,
        title,
        description: description || null,
        language,
        code,
        tags: tags || null,
        isPublic: isPublic || false,
        shareId
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

    return NextResponse.json(snippet)
  } catch (error: any) {
    console.error("Error creating snippet:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
