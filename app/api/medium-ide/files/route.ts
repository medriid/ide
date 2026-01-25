import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ensureProjectDefaults, normalizeMediumIdePath } from "@/lib/medium-ide-files"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const url = new URL(req.url)
  const path = url.searchParams.get("path")
  const projectId = url.searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 })
  }

  const project = await prisma.mediumIDEProject.findFirst({
    where: {
      id: projectId,
      userId
    }
  })

  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 })
  }

  if (!path) {
    await ensureProjectDefaults({ project, userId })
    const files = await prisma.mediumIDEFile.findMany({
      where: { userId, projectId },
      orderBy: { path: "asc" }
    })
    const normalizedFiles = await Promise.all(
      files.map(async (file) => {
        const normalizedPath = normalizeMediumIdePath(file.path)
        if (normalizedPath && normalizedPath !== file.path) {
          const updated = await prisma.mediumIDEFile.update({
            where: {
              projectId_path: {
                projectId,
                path: file.path
              }
            },
            data: { path: normalizedPath }
          })
          return { ...updated, path: normalizedPath }
        }
        return file
      })
    )
    return NextResponse.json(normalizedFiles)
  }

  const normalizedPath = normalizeMediumIdePath(path)
  if (!normalizedPath) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 })
  }

  const file = await prisma.mediumIDEFile.findUnique({
    where: {
      projectId_path: {
        projectId,
        path: normalizedPath
      }
    }
  })

  if (!file) {
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  return NextResponse.json(file)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { projectId, path, content, isDirectory, mimeType } = await req.json()

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "projectId required" }, { status: 400 })
  }

  const project = await prisma.mediumIDEProject.findFirst({
    where: {
      id: projectId,
      userId
    }
  })

  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 })
  }

  if (!path || typeof path !== "string" || !path.trim()) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 })
  }

  const normalizedPath = normalizeMediumIdePath(path)
  if (!normalizedPath) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 })
  }

  const file = await prisma.mediumIDEFile.upsert({
    where: {
      projectId_path: {
        projectId,
        path: normalizedPath
      }
    },
    create: {
      userId,
      projectId,
      path: normalizedPath,
      content: isDirectory ? "" : content || "",
      isDirectory: Boolean(isDirectory),
      mimeType: mimeType || null,
      size: content ? content.length : 0
    },
    update: {
      content: content !== undefined ? content : undefined,
      isDirectory: isDirectory !== undefined ? isDirectory : undefined,
      mimeType: mimeType !== undefined ? mimeType : undefined,
      size: content !== undefined ? content.length : undefined
    }
  })

  return NextResponse.json(file)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { projectId, path } = await req.json()
  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "projectId required" }, { status: 400 })
  }

  const project = await prisma.mediumIDEProject.findFirst({
    where: {
      id: projectId,
      userId
    }
  })

  if (!project) {
    return NextResponse.json({ error: "project not found" }, { status: 404 })
  }

  if (!path) {
    return NextResponse.json({ error: "path required" }, { status: 400 })
  }

  const normalizedPath = normalizeMediumIdePath(path)
  if (!normalizedPath) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 })
  }

  // If deleting a directory, delete all files within it
  if (normalizedPath !== "/") {
    const file = await prisma.mediumIDEFile.findUnique({
      where: {
        projectId_path: {
          projectId,
          path: normalizedPath
        }
      }
    })

    if (file?.isDirectory) {
      // Delete all files that start with this path
      await prisma.mediumIDEFile.deleteMany({
        where: {
          userId,
          projectId,
          path: {
            startsWith: normalizedPath + "/"
          }
        }
      })
    }
  }

  await prisma.mediumIDEFile.delete({
    where: {
      projectId_path: {
        projectId,
        path: normalizedPath
      }
    }
  })

  return NextResponse.json({ ok: true })
}
