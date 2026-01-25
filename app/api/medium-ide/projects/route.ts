import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createRepository, getAllRepositoryFiles, getFileContent } from "@/lib/github-service"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  // Check access: level 100+ or owner
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true, role: true }
  })

  if (!user || (user.level < 100 && user.role !== "owner")) {
    return NextResponse.json({ error: "access denied" }, { status: 403 })
  }

  const projects = await prisma.mediumIDEProject.findMany({
    where: { userId },
    include: {
      pages: {
        orderBy: { createdAt: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  // Check access: level 100+ or owner
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true, role: true }
  })

  if (!user || (user.level < 100 && user.role !== "owner")) {
    return NextResponse.json({ error: "access denied" }, { status: 403 })
  }

  const { name, description, createAsGithubRepo, githubOwner, githubRepo, pullFromRepo, pullOwner, pullRepo, pullBranch } = await req.json()

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "invalid name" }, { status: 400 })
  }

  // Check project limit: max 5 for regular users, infinite for owner
  if (user.role !== "owner") {
    const projectCount = await prisma.mediumIDEProject.count({
      where: { userId }
    })
    if (projectCount >= 5) {
      return NextResponse.json({ error: "project limit reached" }, { status: 400 })
    }
  }

  let githubUrl: string | null = null
  let finalGithubOwner: string | null = null
  let finalGithubRepo: string | null = null

  // Create GitHub repository if requested
  if (createAsGithubRepo && githubOwner && githubRepo) {
    try {
      const repo = await createRepository(userId, githubRepo, {
        description: description?.trim() || `Project: ${name.trim()}`,
        private: false,
        auto_init: true
      })
      githubUrl = repo.html_url
      finalGithubOwner = repo.owner.login
      finalGithubRepo = repo.name
    } catch (error: any) {
      console.error("Failed to create GitHub repository:", error)
      return NextResponse.json({ 
        error: `Failed to create GitHub repository: ${error.message || "Unknown error"}` 
      }, { status: 400 })
    }
  }

  const project = await prisma.mediumIDEProject.create({
    data: {
      userId,
      name: name.trim(),
      description: description?.trim() || null,
      githubOwner: finalGithubOwner,
      githubRepo: finalGithubRepo,
      githubUrl
    },
    include: {
      pages: true
    }
  })

  // Pull from existing repository if requested
  if (pullFromRepo && pullOwner && pullRepo) {
    try {
      finalGithubOwner = pullOwner
      finalGithubRepo = pullRepo
      githubUrl = `https://github.com/${pullOwner}/${pullRepo}`
      
      // Get all files from the repository
      const files = await getAllRepositoryFiles(userId, pullOwner, pullRepo, pullBranch || 'main')
      
      // Import files into the project
      for (const file of files) {
        try {
          const content = await getFileContent(userId, pullOwner, pullRepo, file.path, pullBranch || 'main')
          const pathParts = file.path.split('/')
          const fileName = pathParts[pathParts.length - 1]
          
          // Determine mime type
          let mimeType: string | null = null
          if (fileName.endsWith('.py')) mimeType = 'text/x-python'
          else if (fileName.endsWith('.js')) mimeType = 'application/javascript'
          else if (fileName.endsWith('.json')) mimeType = 'application/json'
          else if (fileName.endsWith('.md')) mimeType = 'text/markdown'
          else if (fileName.endsWith('.txt')) mimeType = 'text/plain'
          else if (fileName.endsWith('.html')) mimeType = 'text/html'
          else if (fileName.endsWith('.css')) mimeType = 'text/css'
          
          await prisma.mediumIDEFile.create({
            data: {
              userId,
              projectId: project.id,
              path: file.path,
              content,
              isDirectory: false,
              mimeType,
              size: content.length
            }
          })
        } catch (fileError: any) {
          // Skip files that can't be read (might be binary or too large)
          console.error(`Failed to import file ${file.path}:`, fileError.message)
        }
      }

      await prisma.mediumIDEProject.update({
        where: { id: project.id },
        data: {
          githubOwner: finalGithubOwner,
          githubRepo: finalGithubRepo,
          githubUrl
        }
      })
    } catch (error: any) {
      console.error("Failed to pull repository:", error)
      return NextResponse.json({ 
        error: `Failed to pull repository: ${error.message || "Unknown error"}` 
      }, { status: 400 })
    }
  }

  // Auto-create README.md file only if not pulling from repo
  if (!pullFromRepo) {
    try {
      const readmeContent = `# ${name.trim()}\n\n${description?.trim() || 'Project description'}\n\n## Getting Started\n\nAdd your project documentation here.\n`
      await prisma.mediumIDEFile.create({
        data: {
          userId,
          projectId: project.id,
          path: 'README.md',
          content: readmeContent,
          isDirectory: false,
          mimeType: 'text/markdown',
          size: readmeContent.length
        }
      })
    } catch (error) {
      // If README.md already exists or creation fails, continue
      console.error("Failed to create README.md:", error)
    }
  }

  const finalProject = await prisma.mediumIDEProject.findFirst({
    where: { id: project.id, userId },
    include: {
      pages: true
    }
  })

  return NextResponse.json(finalProject ?? project)
}
