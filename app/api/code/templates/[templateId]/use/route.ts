import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST - Track template usage
export async function POST(
  req: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params
    await prisma.codeTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: { increment: 1 }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error tracking template usage:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
