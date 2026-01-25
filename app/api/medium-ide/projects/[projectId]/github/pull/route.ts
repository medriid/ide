import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getAllRepositoryFiles, getFileContent } from "@/lib/github-service"
import { normalizeMediumIdePath } from "@/lib/medium-ide-files"

const getMimeType = (path: string) => {
  if (path.endsWith(".py")) return "text/x-python"
  if (path.endsWith(".js")) return "application/javascript"
  if (path.endsWith(".json")) return "application/json"
  if (path.endsWith(".md")) return "text/markdown"
  if (path.endsWith(".txt")) return "text/plain"
  if (path.endsWith(".html")) return "text/html"
  if (path.endsWith(".css")) return "text/css"
  return null
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!(session as any)?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = (session as any).user.id

    const { projectId } = await params
    const project = await prisma.mediumIDEProject.findFirst({
      where: { id: projectId, userId }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (!project.githubRepo || !project.githubOwner) {
      return NextResponse.json({ error: "Repository not initialized" }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const branch = typeof body?.branch === "string" && body.branch.trim() ? body.branch.trim() : "main"

    const files = await getAllRepositoryFiles(userId, project.githubOwner, project.githubRepo, branch)
    const remotePaths = new Set<string>()
    let imported = 0

    for (const file of files) {
      const normalizedPath = normalizeMediumIdePath(file.path)
      if (!normalizedPath) continue
      remotePaths.add(normalizedPath)
      try {
        const content = await getFileContent(userId, project.githubOwner, project.githubRepo, file.path, branch)
        await prisma.mediumIDEFile.upsert({
          where: {
            projectId_path: {
              projectId: project.id,
              path: normalizedPath
            }
          },
          create: {
            userId,
            projectId: project.id,
            path: normalizedPath,
            content,
            isDirectory: false,
            mimeType: getMimeType(normalizedPath),
            size: content.length
          },
          update: {
            content,
            mimeType: getMimeType(normalizedPath),
            size: content.length
          }
        })
        imported += 1
      } catch (fileError: any) {
        console.error(`Failed to import file ${file.path}:`, fileError.message)
      }
    }

    const deleted = await prisma.mediumIDEFile.deleteMany({
      where: {
        userId,
        projectId: project.id,
        isDirectory: false,
        path: {
          notIn: Array.from(remotePaths)
        }
      }
    })

    return NextResponse.json({
      ok: true,
      imported,
      deleted: deleted.count
    })
  } catch (error: any) {
    console.error("Error pulling repository:", error)
    return NextResponse.json({ error: error.message || "Failed to pull repository" }, { status: 500 })
  }
}
