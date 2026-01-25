import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { listRepositories } from "@/lib/github-service"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") as "all" | "owner" | "member" | undefined
    const sort = searchParams.get("sort") as "created" | "updated" | "pushed" | "full_name" | undefined
    const direction = searchParams.get("direction") as "asc" | "desc" | undefined
    const perPage = searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!) : undefined
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined
    const excludeConnected = searchParams.get("exclude_connected") === "true"

    let repos = await listRepositories(session.user.id, {
      type,
      sort,
      direction,
      per_page: perPage,
      page
    })

    // Filter out repositories that are already connected to projects
    if (excludeConnected) {
      const connectedRepos = await prisma.mediumIDEProject.findMany({
        where: {
          githubOwner: { not: null },
          githubRepo: { not: null }
        },
        select: {
          githubOwner: true,
          githubRepo: true
        }
      })

      // Create a set of connected repo identifiers (owner/repo)
      const connectedSet = new Set(
        connectedRepos
          .filter(p => p.githubOwner && p.githubRepo)
          .map(p => `${p.githubOwner}/${p.githubRepo}`)
      )

      // Filter out connected repositories
      repos = repos.filter(repo => !connectedSet.has(repo.full_name))
    }

    return NextResponse.json({ repos })
  } catch (error: any) {
    console.error("Error fetching repositories:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch repositories" },
      { status: 500 }
    )
  }
}
