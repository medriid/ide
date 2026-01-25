import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
const OWNER_EMAIL = "logeshms.cbe@gmail.com"

// Generate a 6-character alphanumeric code
function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET - Fetch current active invite code (only for the account i create)
export async function GET() {
  const session: any = await getServerSession(authOptions as any)
  
  if (!session?.user?.email || session.user.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  
  // Fetch the current active invite code
  const activeCode = await prisma.inviteCode.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" }
  })
  
  if (!activeCode) {
    // If no active code exists, generate one
    const newCode = await prisma.inviteCode.create({
      data: { code: generateCode() }
    })
    return NextResponse.json({ code: newCode.code })
  }
  
  return NextResponse.json({ code: activeCode.code })
}

// POST - Generate a new invite code (only for the account i create)
export async function POST() {
  const session: any = await getServerSession(authOptions as any)
  
  if (!session?.user?.email || session.user.email.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }
  
  // Deactivate all existing codes
  await prisma.inviteCode.updateMany({
    where: { active: true },
    data: { active: false }
  })
  
  // Create new code
  const inviteCode = await prisma.inviteCode.create({
    data: { code: generateCode() }
  })
  
  return NextResponse.json({ code: inviteCode.code })
}
