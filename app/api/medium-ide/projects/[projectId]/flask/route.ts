import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { spawn } from "child_process"
import { join, dirname } from "path"
import { tmpdir } from "os"
import { mkdir, writeFile, readFile, readdir, stat } from "fs/promises"
import { createServer } from "net"

const BASE_DIR = join(tmpdir(), "learningjee-mediocre-ide-envs")
const FLASK_PORT_START = 5000
const FLASK_PORT_END = 6000

// Store running Flask processes
const flaskProcesses = new Map<string, { process: any; port: number }>()

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true })
}

async function syncDbToFs(userId: string, projectId: string, userDir: string) {
  await ensureDir(userDir)
  
  const files = await prisma.mediumIDEFile.findMany({
    where: { userId, projectId },
    select: { path: true, content: true, isDirectory: true }
  })

  for (const f of files) {
    if (f.isDirectory) {
      const target = join(userDir, f.path)
      await ensureDir(target)
    } else {
      const target = join(userDir, f.path)
      await ensureDir(dirname(target))
      await writeFile(target, f.content || "", "utf8")
    }
  }

  const env = await prisma.mediumIDEEnvironment.findUnique({
    where: { projectId }
  })

  if (env?.requirementsTxt) {
    const reqPath = join(userDir, "requirements.txt")
    await writeFile(reqPath, env.requirementsTxt, "utf8")
  }
}

function findFlaskApp(userDir: string): Promise<string | null> {
  return new Promise(async (resolve) => {
    try {
      const files = await readdir(userDir, { recursive: true })
      for (const file of files) {
        if (typeof file === 'string' && (file.endsWith('.py') || file === 'app.py')) {
          const filePath = join(userDir, file)
          try {
            const content = await readFile(filePath, 'utf8')
            // Check if it's a Flask app
            if (content.includes('from flask import') || content.includes('import flask') || 
                content.includes('Flask(') || content.includes('app.run')) {
              resolve(file)
              return
            }
          } catch {}
        }
      }
      resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function findAvailablePort(): Promise<number> {
  return new Promise((resolve) => {
    let port = FLASK_PORT_START
    
    function tryPort() {
      const server = createServer()
      server.listen(port, () => {
        server.once('close', () => resolve(port))
        server.close()
      })
      server.on('error', () => {
        port++
        if (port > FLASK_PORT_END) {
          resolve(0) // No port available
        } else {
          tryPort()
        }
      })
    }
    
    tryPort()
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
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
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true }
  })

  // Check if already running
  const existing = flaskProcesses.get(projectId)
  const appBaseUrl = process.env.NEXTAUTH_URL || "https://learning-jee-7dfa84a9c748.herokuapp.com"
  const username = user?.username || "user"
  const projectSlug = project.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || project.id

  if (existing) {
    return NextResponse.json({ 
      ok: true, 
      port: existing.port,
      url: `${appBaseUrl}/${encodeURIComponent(username)}/${encodeURIComponent(projectSlug)}`
    })
  }

  try {
    const userDir = join(BASE_DIR, userId, projectId)
    await ensureDir(userDir)
    await syncDbToFs(userId, projectId, userDir)

    // Find Flask app
    const flaskFile = await findFlaskApp(userDir)
    if (!flaskFile) {
      return NextResponse.json({ error: "No Flask app found in project" }, { status: 400 })
    }

    // Find available port
    const port = await findAvailablePort()
    if (port === 0) {
      return NextResponse.json({ error: "No available ports" }, { status: 500 })
    }

    // Create virtual environment if needed
    const venvPath = join(userDir, "venv")
    const pythonBin = join(venvPath, "bin", "python3")
    
    try {
      await stat(pythonBin)
    } catch {
      // Create venv
      await new Promise<void>((resolve, reject) => {
        const venvProc = spawn("python3", ["-m", "venv", venvPath], { cwd: userDir })
        venvProc.on('close', (code: number) => {
          if (code === 0) resolve()
          else reject(new Error(`venv creation failed: ${code}`))
        })
      })
    }

    // Install Flask if needed
    const pipBin = join(venvPath, "bin", "pip")
    await new Promise<void>((resolve, reject) => {
      const pipProc = spawn(pipBin, ["install", "flask"], {
        cwd: userDir,
        env: {
          ...process.env,
          VIRTUAL_ENV: venvPath,
          PATH: `${join(venvPath, "bin")}:${process.env.PATH}`
        }
      })
      pipProc.on('close', (code: number) => {
        if (code === 0) resolve()
        else reject(new Error(`pip install failed: ${code}`))
      })
    })

    // Start Flask app
    const flaskProc = spawn(pythonBin, [flaskFile], {
      cwd: userDir,
      env: {
        ...process.env,
        VIRTUAL_ENV: venvPath,
        PATH: `${join(venvPath, "bin")}:${process.env.PATH}`,
        FLASK_APP: flaskFile,
        FLASK_ENV: "development",
        FLASK_RUN_PORT: port.toString()
      }
    })

    flaskProcesses.set(projectId, { process: flaskProc, port })

    // Update project with Flask info
    const publicUrl = `${appBaseUrl}/${encodeURIComponent(username)}/${encodeURIComponent(projectSlug)}`

    await prisma.mediumIDEProject.update({
      where: { id: projectId },
      data: {
        flaskPort: port,
        flaskUrl: publicUrl
      }
    })

    // Clean up on process exit
    flaskProc.on('exit', () => {
      flaskProcesses.delete(projectId)
      prisma.mediumIDEProject.update({
        where: { id: projectId },
        data: { flaskPort: null, flaskUrl: null }
      }).catch(() => {})
    })

    return NextResponse.json({ 
      ok: true, 
      port,
      url: publicUrl
    })
  } catch (error: any) {
    console.error("Failed to start Flask app:", error)
    return NextResponse.json({ 
      error: `Failed to start Flask app: ${error.message || "Unknown error"}` 
    }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
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
    return NextResponse.json({ error: "not found" }, { status: 404 })
  }

  const existing = flaskProcesses.get(projectId)
  if (existing) {
    existing.process.kill()
    flaskProcesses.delete(projectId)
  }

  await prisma.mediumIDEProject.update({
    where: { id: projectId },
    data: { flaskPort: null, flaskUrl: null }
  })

  return NextResponse.json({ ok: true })
}
