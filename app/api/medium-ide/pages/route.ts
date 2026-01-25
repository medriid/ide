import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const url = new URL(req.url)
  const projectId = url.searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 })
  }

  // Verify project belongs to user
  const project = await prisma.mediumIDEProject.findFirst({
    where: {
      id: projectId,
      userId
    }
  })

  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 })
  }

  const pages = await prisma.mediumIDEPage.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" }
  })

  return NextResponse.json(pages)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { projectId, name, content } = await req.json()

  if (!projectId || !name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "invalid data" }, { status: 400 })
  }

  // Verify project belongs to user
  const project = await prisma.mediumIDEProject.findFirst({
    where: {
      id: projectId,
      userId
    }
  })

  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 })
  }

  // Check page limit: max 3 for regular users, infinite for owner
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (user?.role !== "owner") {
    const pageCount = await prisma.mediumIDEPage.count({
      where: { projectId }
    })
    if (pageCount >= 3) {
      return NextResponse.json({ error: "page limit reached" }, { status: 400 })
    }
  }

  const page = await prisma.mediumIDEPage.create({
    data: {
      projectId,
      userId,
      name: name.trim(),
      content: content || ""
    }
  })

  return NextResponse.json(page)
}
