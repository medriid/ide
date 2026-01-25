import { prisma } from "@/lib/prisma"

type EnsureDefaultsArgs = {
  project: {
    id: string
    name: string
    description?: string | null
  }
  userId: string
}

export const normalizeMediumIdePath = (rawPath: string) => {
  if (!rawPath) return ""
  const trimmed = rawPath.trim()
  if (!trimmed) return ""
  const normalized = trimmed.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "")
  return normalized
}

export const ensureProjectDefaults = async ({ project, userId }: EnsureDefaultsArgs) => {
  const existingCount = await prisma.mediumIDEFile.count({
    where: { userId, projectId: project.id }
  })

  if (existingCount > 0) {
    return
  }

  const readmeContent = `# ${project.name}\n\n${project.description || "Project description"}\n\n## Getting Started\n\nAdd your project documentation here.\n`
  const mainContent = "#!/usr/bin/env python3\n# main.py\n\nprint('Hello from MEDIOCRE IDE!')\n"
  const requirementsContent = "# Your packages go here\n"

  await prisma.mediumIDEFile.createMany({
    data: [
      {
        userId,
        projectId: project.id,
        path: "README.md",
        content: readmeContent,
        isDirectory: false,
        mimeType: "text/markdown",
        size: readmeContent.length
      },
      {
        userId,
        projectId: project.id,
        path: "main.py",
        content: mainContent,
        isDirectory: false,
        mimeType: "text/x-python",
        size: mainContent.length
      },
      {
        userId,
        projectId: project.id,
        path: "requirements.txt",
        content: requirementsContent,
        isDirectory: false,
        mimeType: "text/plain",
        size: requirementsContent.length
      }
    ]
  })
}
