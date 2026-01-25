import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"
import { spawn } from "child_process"

const BASE_DIR = join(tmpdir(), "learningjee-mediocre-ide-envs")

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true })
}

async function runCommand(cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv; timeoutMs?: number } = {}) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: opts.env,
      stdio: ["pipe", "pipe", "pipe"]
    })

    let stdout = ""
    let stderr = ""
    const timeout = setTimeout(() => {
      child.kill("SIGKILL")
      reject(new Error("timeout"))
    }, opts.timeoutMs ?? 60000) // 60 second timeout for pip install

    child.stdin.end()

    child.stdout.on("data", (d) => {
      stdout += d.toString()
    })
    child.stderr.on("data", (d) => {
      stderr += d.toString()
    })

    child.on("error", (err) => {
      clearTimeout(timeout)
      reject(err)
    })

    child.on("close", (code) => {
      clearTimeout(timeout)
      if (code !== 0) {
        reject(new Error(stderr || `command failed (${code})`))
      } else {
        resolve({ stdout, stderr })
      }
    })
  })
}

async function ensureVenv(userDir: string) {
  const venvPath = join(userDir, "venv")
  const pythonBin = join(venvPath, "bin", "python3")
  const pipBin = join(venvPath, "bin", "pip")
  
  try {
    await require("fs/promises").stat(pythonBin)
    return { venvPath, pythonBin, pipBin }
  } catch {}

  await runCommand("python3", ["-m", "venv", venvPath], { cwd: userDir })
  await runCommand(join(venvPath, "bin", "pip"), ["install", "--upgrade", "pip", "setuptools", "wheel"], { 
    cwd: userDir, 
    timeoutMs: 30000 
  })
  return { venvPath, pythonBin, pipBin }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id
  const url = new URL(req.url)
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

  let env = await prisma.mediumIDEEnvironment.findUnique({
    where: { projectId }
  })

  if (!env) {
    // Create default environment
    env = await prisma.mediumIDEEnvironment.create({
      data: {
        userId,
        projectId,
        requirementsTxt: "# Your packages go here\n",
        installedPackages: "[]"
      }
    })
  }

  return NextResponse.json(env)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  const { projectId, requirementsTxt } = await req.json()

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

  if (typeof requirementsTxt !== "string") {
    return NextResponse.json({ error: "invalid requirements" }, { status: 400 })
  }

  // Get or create environment
  let env = await prisma.mediumIDEEnvironment.findUnique({
    where: { projectId }
  })

  if (!env) {
    env = await prisma.mediumIDEEnvironment.create({
      data: {
        userId,
        projectId,
        requirementsTxt: requirementsTxt,
        installedPackages: "[]"
      }
    })
  } else {
    // Update requirements.txt
    env = await prisma.mediumIDEEnvironment.update({
      where: { projectId },
      data: {
        requirementsTxt: requirementsTxt,
        updatedAt: new Date()
      }
    })
  }

  // Install packages if requirements.txt has content
  const packages = requirementsTxt
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"))

  if (packages.length > 0) {
    try {
      const userDir = join(BASE_DIR, userId, projectId)
      await ensureDir(userDir)
      const { venvPath, pipBin } = await ensureVenv(userDir)

      // Write requirements.txt to file
      const reqPath = join(userDir, "requirements.txt")
      await writeFile(reqPath, requirementsTxt, "utf8")

      // Install packages
      const { stdout, stderr } = await runCommand(pipBin, ["install", "-r", reqPath], {
        cwd: userDir,
        env: {
          ...process.env,
          VIRTUAL_ENV: venvPath,
          PATH: `${join(venvPath, "bin")}:${process.env.PATH}`
        },
        timeoutMs: 120000 // 2 minutes for package installation
      })

      // Get list of installed packages
      const { stdout: listOutput } = await runCommand(pipBin, ["list", "--format=json"], {
        cwd: userDir,
        env: {
          ...process.env,
          VIRTUAL_ENV: venvPath,
          PATH: `${join(venvPath, "bin")}:${process.env.PATH}`
        }
      })

      const installedPackages = JSON.parse(listOutput || "[]")

      // Update environment with installed packages
      env = await prisma.mediumIDEEnvironment.update({
        where: { projectId },
        data: {
          installedPackages: JSON.stringify(installedPackages),
          lastInstalledAt: new Date()
        }
      })

      return NextResponse.json({
        ...env,
        installOutput: stdout + stderr,
        success: true
      })
    } catch (error: any) {
      return NextResponse.json({
        ...env,
        installError: error.message,
        success: false
      }, { status: 500 })
    }
  }

  return NextResponse.json(env)
}
