import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { getGitHubUser } from "@/lib/github-service"

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getGitHubUser(session.user.id)
    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("Error fetching GitHub user:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch GitHub user" },
      { status: 500 }
    )
  }
}
