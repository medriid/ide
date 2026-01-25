import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const userId = (session as any).user.id

  const url = new URL(req.url)
  const path = url.searchParams.get("path")

  if (!path) {
    const files = await prisma.fileNode.findMany({
      where: { userId },
      select: { path: true, kind: true, content: true, mimeType: true }
    })
    return NextResponse.json(files)
  }

  const file = await prisma.fileNode.findUnique({
    where: {
      userId_path: {
        userId,
        path
      }
    },
    select: { path: true, kind: true, content: true, mimeType: true }
  })

  if (!file) return NextResponse.json({ error: "not found" }, { status: 404 })
  return NextResponse.json(file)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const userId = (session as any).user.id

  const { path, kind, content, mimeType } = await req.json()
  if (!path || !kind || content === undefined) {
    return NextResponse.json({ error: "invalid" }, { status: 400 })
  }

  const file = await prisma.fileNode.upsert({
    where: {
      userId_path: {
        userId,
        path
      }
    },
    create: {
      userId,
      path,
      kind,
      content,
      mimeType: mimeType || null
    },
    update: {
      content,
      mimeType: mimeType || null
    }
  })

  return NextResponse.json(file)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const userId = (session as any).user.id

  const { path } = await req.json()
  if (!path) return NextResponse.json({ error: "invalid" }, { status: 400 })

   const protectedData = new Set(["data/sample.txt","data/sample.csv","data/data.dat"])
   if (protectedData.has(path)) return NextResponse.json({ error: "protected" }, { status: 400 })

  await prisma.fileNode.delete({
    where: {
      userId_path: {
        userId,
        path
      }
    }
  })

  return NextResponse.json({ ok: true })
}
