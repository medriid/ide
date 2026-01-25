import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: query
      },
      NOT: { id: session.user.id }
    },
    select: {
      id: true,
      username: true,
      avatarUrl: true
    },
    take: 10
  })

  return NextResponse.json(users)
}

