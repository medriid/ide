import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { mkdir, writeFile, readFile, readdir, stat, lstat, symlink, copyFile, unlink } from "fs/promises"
import { join, dirname, extname, resolve, basename } from "path"
import { tmpdir } from "os"
import { spawn } from "child_process"
import { constants } from "fs"
const BASE_DIR = join(tmpdir(), "learningjee-python-envs")
const IMAGE_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif"
}

function kindFromPath(path: string): string {
  const ext = path.split(".").pop() || ""
  if (ext === "py") return "python"
  if (ext === "csv") return "csv"
  if (ext === "dat") return "dat"
  return "text"
}

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true })
}

async function ensureVenv(userDir: string) {
  const venvPath = join(userDir, "venv")
  const pythonBin = join(venvPath, "bin", "python3")
  try {
    await stat(pythonBin)
    return { venvPath, pythonBin }
  } catch {}

  await runCommand("python3", ["-m", "venv", venvPath], { cwd: userDir })
  await runCommand(join(venvPath, "bin", "pip"), ["install", "--upgrade", "pip", "setuptools", "wheel"], { cwd: userDir, timeoutMs: 20000 })
  return { venvPath, pythonBin }
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
    }, opts.timeoutMs ?? 10000)

    // Write stdin if provided
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
      if (code !== 0) return reject(new Error(stderr || `command failed (${code})`))
      resolve({ stdout, stderr })
    })
  })
}

async function syncDbToFs(userId: string, userDir: string) {
  await ensureDir(userDir)
  const files = await prisma.fileNode.findMany({ where: { userId }, select: { path: true, content: true, mimeType: true } })
  for (const f of files) {
    const target = join(userDir, f.path)
    await ensureDir(dirname(target))
    const ext = extname(f.path).toLowerCase()
    if (f.mimeType && IMAGE_MIME[ext]) {
      const buf = Buffer.from(f.content || "", "base64")
      await writeFile(target, buf)
    } else {
      await writeFile(target, f.content || "", "utf8")
    }
    
    // Create root-level access for data files (folders are just for UI organization)
    // This allows Python code to access files like "test.txt" instead of "data/test.txt"
    if (f.path.startsWith("data/")) {
      const fileName = basename(f.path)
      const rootLink = join(userDir, fileName)
      try {
        // Remove existing link/file if it exists
        try {
          const existing = await lstat(rootLink)
          if (existing.isSymbolicLink()) {
            // Remove symlink
            await unlink(rootLink)
          }
        } catch {
          // Doesn't exist, continue
        }
        await symlink(target, rootLink)
      } catch (err: any) {
        // Ignore symlink errors (e.g., file already exists)
      }
    }
    
    // Create root-level access for challenge files
    // This allows Python code to access files like "challenge_sample.txt" instead of "python/challenge_sample.txt"
    if (f.path.startsWith("python/challenge_")) {
      const fileName = basename(f.path)
      const rootLink = join(userDir, fileName)
      try {
        // Remove existing link/file if it exists
        try {
          const existing = await lstat(rootLink)
          if (existing.isSymbolicLink()) {
            // Remove symlink
            await unlink(rootLink)
          }
        } catch {
          // Doesn't exist, continue
        }
        
        // Create symlink or copy (symlink preferred, copy as fallback for Windows)
        try {
          await symlink(target, rootLink)
        } catch {
          // Symlink failed (e.g., on Windows without admin or file exists), use copy
          await copyFile(target, rootLink)
        }
      } catch (err) {
        // Ignore errors - not critical for execution
        console.error(`Failed to create root link for ${f.path}:`, err)
      }
    }
  }
}

async function readAllFiles(root: string, base = ""): Promise<{ path: string; content: string; mimeType: string | null }[]> {
  const dirPath = join(root, base)
  let entries: any[] = []
  try {
    entries = await readdir(dirPath, { withFileTypes: true })
  } catch {
    return []
  }
  const results: { path: string; content: string; mimeType: string | null }[] = []
  for (const entry of entries) {
    const relPath = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      const nested = await readAllFiles(root, relPath)
      results.push(...nested)
      continue
    }
    const full = join(root, relPath)
    const ext = extname(relPath).toLowerCase()
    if (IMAGE_MIME[ext]) {
      const buf = await readFile(full)
      results.push({ path: relPath, content: buf.toString("base64"), mimeType: IMAGE_MIME[ext] })
    } else {
      const data = await readFile(full, "utf8")
      results.push({ path: relPath, content: data, mimeType: null })
    }
  }
  return results
}

async function syncFsToDb(userId: string, userDir: string) {
  const collected: { path: string; content: string; mimeType: string | null }[] = []
  
  // Read files from organized folders
  for (const folder of ["python", "data"]) {
    const partial = await readAllFiles(userDir, folder)
    collected.push(...partial)
  }
  
      // Also check root directory for files created by Python code
      // These should be synced back to data/ folder in database
      try {
        const rootFiles = await readAllFiles(userDir, "")
        for (const f of rootFiles) {
          // Skip directories and symlinks
          try {
            const fullPath = join(userDir, f.path)
            const stats = await lstat(fullPath)
            if (stats.isSymbolicLink() || stats.isDirectory()) {
              // It's a symlink we created or a directory, skip it
              continue
            }
            // It's a real file in root, sync it to data/ folder
            const dataPath = `data/${f.path}`
            // Check if this file already exists in data/ folder
            const existsInData = collected.some(c => c.path === dataPath)
            if (!existsInData) {
              collected.push({ ...f, path: dataPath })
            }
          } catch {
            // Error checking file, skip it
            continue
          }
        }
      } catch {
        // Error reading root directory, continue
      }

  for (const f of collected) {
    await prisma.fileNode.upsert({
      where: { userId_path: { userId, path: f.path } },
      create: { userId, path: f.path, kind: kindFromPath(f.path), content: f.content, mimeType: f.mimeType },
      update: { content: f.content, mimeType: f.mimeType }
    })
  }
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = session.user.id
  const { path, code, stdin } = await req.json()
  if (!path || typeof path !== "string" || !path.startsWith("python/")) {
    return NextResponse.json({ error: "invalid-path" }, { status: 400 })
  }
  if (typeof code !== "string") return NextResponse.json({ error: "invalid-code" }, { status: 400 })

  try {
    // Save the latest code before execution
    await prisma.fileNode.upsert({
      where: { userId_path: { userId, path } },
      create: { userId, path, kind: "python", content: code },
      update: { content: code }
    })

    const userDir = join(BASE_DIR, userId)
    await ensureDir(userDir)
    await syncDbToFs(userId, userDir)
    const { venvPath, pythonBin } = await ensureVenv(userDir)

    const targetFile = resolve(userDir, path)
    if (!targetFile.startsWith(userDir)) return NextResponse.json({ error: "path-traversal" }, { status: 400 })

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
    await syncFsToDb(userId, userDir)
    return NextResponse.json({ ok: true, stdout, stderr })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "execution-error" }, { status: 400 })
  }
}
