import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
export const runtime = "nodejs"

export async function GET() {
  const s:any = await getServerSession(authOptions as any)
  if(!s?.user?.id && !s?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const user = s?.user?.id 
    ? await prisma.user.findUnique({ where: { id: s.user.id }, include: { schema: true } })
    : await prisma.user.findUnique({ where: { email: s.user.email }, include: { schema: true } })
  const prefix = user?.schema?.schemaName || null
  return NextResponse.json({ schema: "shared-db", prefix })
}
