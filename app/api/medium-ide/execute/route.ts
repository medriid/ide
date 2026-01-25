import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { mkdir, writeFile, stat } from "fs/promises"
import { join, dirname, resolve } from "path"
import { tmpdir } from "os"
import { spawn } from "child_process"

const BASE_DIR = join(tmpdir(), "learningjee-mediocre-ide-envs")

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true })
}

async function runCommand(cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv; timeoutMs?: number; stdin?: string } = {}) {
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
    }, opts.timeoutMs ?? 12000)

    if (opts.stdin !== undefined) {
      child.stdin.write(opts.stdin)
      child.stdin.end()
    } else {
      child.stdin.end()
    }

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
        return reject(new Error(stderr || `command failed (${code})`))
      }
      resolve({ stdout, stderr })
    })
  })
}

async function ensureVenv(userDir: string) {
  const venvPath = join(userDir, "venv")
  const pythonBin = join(venvPath, "bin", "python3")
  const pipBin = join(venvPath, "bin", "pip")
  try {
    await stat(pythonBin)
    return { venvPath, pythonBin, pipBin }
  } catch {}

  await runCommand("python3", ["-m", "venv", venvPath], { cwd: userDir })
  await runCommand(pipBin, ["install", "--upgrade", "pip", "setuptools", "wheel"], { 
    cwd: userDir, 
    timeoutMs: 20000 
  })
  return { venvPath, pythonBin, pipBin }
}

async function syncDbToFs(userId: string, projectId: string, userDir: string) {
  await ensureDir(userDir)
  
  // Get all files from database
  const files = await prisma.mediumIDEFile.findMany({
    where: { userId, projectId },
    select: { path: true, content: true, isDirectory: true }
  })

  for (const f of files) {
    if (f.isDirectory) {
      // Create directory
      const target = join(userDir, f.path)
      await ensureDir(target)
    } else {
      // Create file
      const target = join(userDir, f.path)
      await ensureDir(dirname(target))
      await writeFile(target, f.content || "", "utf8")
    }
  }

  // Write requirements.txt and install packages if needed
  const env = await prisma.mediumIDEEnvironment.findUnique({
    where: { projectId }
  })

  if (env?.requirementsTxt) {
    const reqPath = join(userDir, "requirements.txt")
    await writeFile(reqPath, env.requirementsTxt, "utf8")

    // Check if we need to install packages
    const packages = env.requirementsTxt
      .split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"))

    if (packages.length > 0) {
      try {
        const { venvPath, pipBin } = await ensureVenv(userDir)
        await runCommand(pipBin, ["install", "-r", reqPath], {
          cwd: userDir,
          env: {
            ...process.env,
            VIRTUAL_ENV: venvPath,
            PATH: `${join(venvPath, "bin")}:${process.env.PATH}`
          },
          timeoutMs: 120000
        })
      } catch (error) {
        // Installation errors are logged but don't stop execution
        console.error("Package installation error:", error)
      }
    }
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  let payload: { path?: string; stdin?: string; projectId?: string }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 })
  }

  const { path, stdin, projectId } = payload

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

  if (!path || typeof path !== "string") {
    return NextResponse.json({ error: "invalid path" }, { status: 400 })
  }

  // Check if main.py exists
  const mainFile = await prisma.mediumIDEFile.findUnique({
    where: {
      projectId_path: {
        projectId,
        path: path === "main.py" ? "main.py" : path
      }
    }
  })

  if (!mainFile || mainFile.isDirectory) {
    return NextResponse.json({ error: "file not found" }, { status: 404 })
  }

  try {
    const userDir = join(BASE_DIR, userId, projectId)
    await ensureDir(userDir)
    await syncDbToFs(userId, projectId, userDir)
    const { venvPath, pythonBin } = await ensureVenv(userDir)

    const targetFile = resolve(userDir, path === "main.py" ? "main.py" : path)
    if (!targetFile.startsWith(userDir)) {
      return NextResponse.json({ error: "path-traversal" }, { status: 400 })
    }

    const env = {
      ...process.env,
      VIRTUAL_ENV: venvPath,
      PATH: `${join(venvPath, "bin")}:${process.env.PATH}`,
      MPLBACKEND: "Agg"
    }

    const { stdout, stderr } = await runCommand(pythonBin, [targetFile], {
      cwd: userDir,
      env,
      timeoutMs: 12000,
      stdin: typeof stdin === "string" ? stdin : undefined
    })

    return NextResponse.json({ ok: true, stdout, stderr })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "execution-error" }, { status: 400 })
  }
}
