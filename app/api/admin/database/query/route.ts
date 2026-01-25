import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

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
    const { query } = await req.json()
    
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Security: Only allow SELECT queries
    const trimmedQuery = query.trim().toUpperCase()
    if (!trimmedQuery.startsWith("SELECT")) {
      return NextResponse.json({ error: "Only SELECT queries are allowed" }, { status: 400 })
    }

    // Execute raw query
    const result = await prisma.$queryRawUnsafe(query)
    
    // Format result
    const rows = Array.isArray(result) ? result : [result]
    const columns = rows.length > 0 ? Object.keys(rows[0] as any) : []

    return NextResponse.json({
      columns,
      rows: rows.slice(0, 1000) // Limit to 1000 rows
    })
  } catch (error: any) {
    console.error("Error executing query:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
