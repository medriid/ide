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
    const lessons = await prisma.lesson.findMany({
      include: {
        sections: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { order: "asc" }
    })

    return NextResponse.json({ lessons })
  } catch (error: any) {
    console.error("Error fetching lessons:", error)
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
    const { slug, title, topic, summary, order, published, sections } = await req.json()

    const lesson = await prisma.lesson.create({
      data: {
        slug,
        title,
        topic,
        summary,
        order: order || 0,
        published: published || false,
        sections: {
          create: sections?.map((s: any, idx: number) => ({
            title: s.title,
            content: s.content,
            type: s.type || "text",
            order: s.order !== undefined ? s.order : idx
          })) || []
        }
      },
      include: {
        sections: true
      }
    })

    return NextResponse.json({ lesson })
  } catch (error: any) {
    console.error("Error creating lesson:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
