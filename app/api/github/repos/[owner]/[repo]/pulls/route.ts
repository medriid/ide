import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { createPullRequest } from "@/lib/github-service"

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
    const { title, body: prBody, head, base } = body

    if (!title || !head || !base) {
      return NextResponse.json(
        { error: "Missing required fields: title, head, base" },
        { status: 400 }
      )
    }

    const { owner, repo } = await params
    const pullRequest = await createPullRequest(
      session.user.id,
      owner,
      repo,
      title,
      prBody || "",
      head,
      base
    )

    return NextResponse.json({ pullRequest })
  } catch (error: any) {
    console.error("Error creating pull request:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create pull request" },
      { status: 500 }
    )
  }
}
