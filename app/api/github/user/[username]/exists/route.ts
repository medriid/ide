import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { githubApiRequest } from "@/lib/github-service"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username } = await params

    // Check if user exists by trying to fetch their profile
    try {
      const response = await githubApiRequest(session.user.id, `/users/${username}`)
      
      if (response.ok) {
        const userData = await response.json()
        return NextResponse.json({ exists: true, user: userData })
      } else if (response.status === 404) {
        return NextResponse.json({ exists: false })
      } else {
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
    console.error("Error checking username existence:", error)
    return NextResponse.json(
      { error: error.message || "Failed to check username" },
      { status: 500 }
    )
  }
}
