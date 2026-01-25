import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { listBranches, createBranch } from "@/lib/github-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { owner, repo } = await params
    const branches = await listBranches(session.user.id, owner, repo)

    return NextResponse.json({ branches })
  } catch (error: any) {
    console.error("Error fetching branches:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch branches" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, fromSha } = body

    if (!name || !fromSha) {
      return NextResponse.json(
        { error: "Missing required fields: name, fromSha" },
        { status: 400 }
      )
    }

    const { owner, repo } = await params
    const branch = await createBranch(session.user.id, owner, repo, name, fromSha)

    return NextResponse.json({ branch })
  } catch (error: any) {
    console.error("Error creating branch:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create branch" },
      { status: 500 }
    )
  }
}
