import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Get code templates
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const language = searchParams.get("language")
  const category = searchParams.get("category")

  try {
    const where: any = {}
    if (language) where.language = language
    if (category) where.category = category

    const templates = await prisma.codeTemplate.findMany({
      where,
      orderBy: [
        { isOfficial: "desc" },
        { usageCount: "desc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json({ templates })
  } catch (error: any) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a template (admin only or user-created)
export async function POST(req: Request) {
  try {
    const { name, description, language, code, category, tags, isOfficial } = await req.json()

    if (!name || !language || !code) {
      return NextResponse.json(
        { error: "Name, language, and code are required" },
        { status: 400 }
      )
    }

    const template = await prisma.codeTemplate.create({
      data: {
        name,
        description: description || null,
        language,
        code,
        category: category || "starter",
        tags: tags || null,
        isOfficial: isOfficial || false
      }
    })

    return NextResponse.json(template)
  } catch (error: any) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
