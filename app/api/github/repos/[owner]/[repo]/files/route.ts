import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { createOrUpdateFile, deleteFile } from "@/lib/github-service"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { path, content, message, branch, sha } = body

    if (!path || !content || !message) {
      return NextResponse.json(
        { error: "Missing required fields: path, content, message" },
        { status: 400 }
      )
    }

    const { owner, repo } = await params
    const result = await createOrUpdateFile(
      session.user.id,
      owner,
      repo,
      path,
      content,
      message,
      branch,
      sha
    )

    return NextResponse.json({ success: true, commit: result.commit })
  } catch (error: any) {
    console.error("Error creating/updating file:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create/update file" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")
    const message = searchParams.get("message")
    const branch = searchParams.get("branch") || undefined
    const sha = searchParams.get("sha")

    if (!path || !message || !sha) {
      return NextResponse.json(
        { error: "Missing required fields: path, message, sha" },
        { status: 400 }
      )
    }

    const { owner, repo } = await params
    const result = await deleteFile(
      session.user.id,
      owner,
      repo,
      path,
      message,
      sha,
      branch
    )

    return NextResponse.json({ success: true, commit: result.commit })
  } catch (error: any) {
    console.error("Error deleting file:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete file" },
      { status: 500 }
    )
  }
}
