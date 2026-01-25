import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { commitMultipleFiles, getAllRepositoryFiles } from "@/lib/github-service"
import { ensureProjectDefaults, normalizeMediumIdePath } from "@/lib/medium-ide-files"

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
      where: {
        id: projectId,
        userId
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (!project.githubRepo || !project.githubOwner) {
      return NextResponse.json({ error: "Repository not initialized" }, { status: 400 })
    }

    const body = await req.json()
    const { message, branch = "main" } = body

    if (!message) {
      return NextResponse.json({ error: "Commit message is required" }, { status: 400 })
    }

    await ensureProjectDefaults({ project, userId })
    const localFiles = await prisma.mediumIDEFile.findMany({
      where: { userId, projectId },
      orderBy: { path: "asc" }
    })

    // Get all remote files recursively
    const remoteFileMap = new Map<string, { sha: string }>()
    try {
      const remoteFiles = await getAllRepositoryFiles(userId, project.githubOwner, project.githubRepo, branch)
      for (const file of remoteFiles) {
        remoteFileMap.set(file.path, { sha: file.sha })
      }
    } catch (error) {
      // Repository might be empty, that's okay
      console.log("Repository appears to be empty or error fetching files:", error)
    }

    // Prepare files to commit (create/update)
    const filesToCommit: Array<{ path: string; content: string }> = []
    const commits = []

    for (const file of localFiles) {
      if (!file.isDirectory) {
        const normalizedPath = normalizeMediumIdePath(file.path)
        if (!normalizedPath) {
          continue
        }
        const remoteFile = remoteFileMap.get(normalizedPath)
        filesToCommit.push({
          path: normalizedPath,
          content: file.content || ''
        })
        commits.push({ path: normalizedPath, action: remoteFile ? 'updated' : 'created' })
      }
    }

    // Prepare files to delete
    const filesToDelete: Array<{ path: string; sha: string }> = []
    for (const [remotePath, remoteFile] of remoteFileMap.entries()) {
      const existsLocally = localFiles.some((f: any) => {
        if (f.isDirectory) return false
        return normalizeMediumIdePath(f.path) === remotePath
      })
      if (!existsLocally) {
        filesToDelete.push({
          path: remotePath,
          sha: remoteFile.sha
        })
        commits.push({ path: remotePath, action: 'deleted' })
      }
    }

    // Commit all changes in a single commit
    try {
      await commitMultipleFiles(
        userId,
        project.githubOwner!,
        project.githubRepo!,
        filesToCommit,
        filesToDelete,
        message,
        branch
      )
    } catch (error: any) {
      console.error("Failed to commit changes:", error)
      return NextResponse.json(
        { error: error.message || "Failed to commit changes" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      commits
    })
  } catch (error: any) {
    console.error("Error committing changes:", error)
    return NextResponse.json(
      { error: error.message || "Failed to commit changes" },
      { status: 500 }
    )
  }
}
