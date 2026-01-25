import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { getRepositoryContents, getFileContent } from "@/lib/github-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path") || ""
    const ref = searchParams.get("ref") || undefined
    const raw = searchParams.get("raw") === "true"

    const { owner, repo } = await params

    if (raw && path) {
      // Return raw file content
      const content = await getFileContent(session.user.id, owner, repo, path, ref)
      return new NextResponse(content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      })
    }

    const contents = await getRepositoryContents(session.user.id, owner, repo, path, ref)
    return NextResponse.json({ contents })
  } catch (error: any) {
    console.error("Error fetching repository contents:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch repository contents" },
      { status: 500 }
    )
  }
}
