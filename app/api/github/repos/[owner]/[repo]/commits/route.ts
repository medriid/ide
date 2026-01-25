import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { listCommits } from "@/lib/github-service"

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
    const sha = searchParams.get("sha") || undefined
    const path = searchParams.get("path") || undefined
    const author = searchParams.get("author") || undefined
    const since = searchParams.get("since") || undefined
    const until = searchParams.get("until") || undefined
    const perPage = searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!) : undefined
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined

    const { owner, repo } = await params
    const commits = await listCommits(session.user.id, owner, repo, {
      sha,
      path,
      author,
      since,
      until,
      per_page: perPage,
      page
    })

    return NextResponse.json({ commits })
  } catch (error: any) {
    console.error("Error fetching commits:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch commits" },
      { status: 500 }
    )
  }
}
