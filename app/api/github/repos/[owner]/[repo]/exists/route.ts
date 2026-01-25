import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { githubApiRequest } from "@/lib/github-service"

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

    // Check if repository exists by trying to fetch it
    try {
      const response = await githubApiRequest(session.user.id, `/repos/${owner}/${repo}`)
      
      if (response.ok) {
        return NextResponse.json({ exists: true })
      } else if (response.status === 404) {
        return NextResponse.json({ exists: false })
      } else {
        // For other errors, return false (assume it doesn't exist or can't be accessed)
        return NextResponse.json({ exists: false })
      }
    } catch (error: any) {
      // If error is about rate limiting or auth, return false
      if (error.message?.includes("rate limit") || error.message?.includes("not connected")) {
        return NextResponse.json({ exists: false, error: error.message }, { status: 400 })
      }
      return NextResponse.json({ exists: false })
    }
  } catch (error: any) {
    console.error("Error checking repository existence:", error)
    return NextResponse.json(
      { error: error.message || "Failed to check repository" },
      { status: 500 }
    )
  }
}
