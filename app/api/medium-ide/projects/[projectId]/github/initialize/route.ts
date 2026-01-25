import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createRepository, commitMultipleFiles } from "@/lib/github-service"

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

    if (project.githubRepo) {
      return NextResponse.json({ error: "Repository already initialized" }, { status: 400 })
    }

    const body = await req.json()
    const { repoName, description, isPrivate, githubUsername } = body

    if (!repoName || !githubUsername) {
      return NextResponse.json({ error: "Repository name and GitHub username are required" }, { status: 400 })
    }

    // Create repository on GitHub
    const githubRepo = await createRepository(userId, repoName, {
      description: description || project.description || undefined,
      private: isPrivate ?? false,
      auto_init: false
    })

    // Get all files from the project
    const filesRes = await fetch(`${req.headers.get('origin') || 'http://localhost:3000'}/api/medium-ide/files?projectId=${projectId}`, {
      headers: {
        'Cookie': req.headers.get('cookie') || ''
      }
    })
    const files = await filesRes.json()

    // Prepare files to commit
    const filesToCommit = files
      .filter((file: any) => !file.isDirectory)
      .map((file: any) => ({
        path: file.path.replace(/^\//, ''),
        content: file.content || ''
      }))

    // Commit all files in a single initial commit
    if (filesToCommit.length > 0) {
      try {
        await commitMultipleFiles(
          userId,
          githubUsername,
          repoName,
          filesToCommit,
          [],
          `Initial commit: Add ${filesToCommit.length} file${filesToCommit.length > 1 ? 's' : ''}`,
          'main'
        )
      } catch (error: any) {
        console.error(`Failed to commit files:`, error)
        // Continue even if commit fails - repository is still created
      }
    }

    // Update project with GitHub info
    const updatedProject = await prisma.mediumIDEProject.update({
      where: { id: projectId },
      data: {
        githubOwner: githubUsername,
        githubRepo: repoName,
        githubUrl: githubRepo.html_url
      },
      include: {
        pages: {
          orderBy: { createdAt: "asc" }
        }
      }
    })

    return NextResponse.json({
      success: true,
      project: updatedProject,
      repository: githubRepo
    })
  } catch (error: any) {
    console.error("Error initializing repository:", error)
    return NextResponse.json(
      { error: error.message || "Failed to initialize repository" },
      { status: 500 }
    )
  }
}
