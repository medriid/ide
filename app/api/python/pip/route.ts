import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { tmpdir } from "os"
import { join } from "path"
import { mkdir, stat } from "fs/promises"
import { spawn } from "child_process"

const BASE_DIR = join(tmpdir(), "learningjee-python-envs")

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true })
}

async function runCommand(cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv; timeoutMs?: number } = {}) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: opts.env,
      stdio: ["ignore", "pipe", "pipe"]
    })

    let stdout = ""
    let stderr = ""
    const timeout = setTimeout(() => {
      child.kill("SIGKILL")
      reject(new Error("timeout"))
    }, opts.timeoutMs ?? 15000)

    child.stdout.on("data", (d) => { stdout += d.toString() })
    child.stderr.on("data", (d) => { stderr += d.toString() })
    child.on("error", (err) => { clearTimeout(timeout); reject(err) })
    child.on("close", (code) => {
      clearTimeout(timeout)
      if (code !== 0) return reject(new Error(stderr || `command failed (${code})`))
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
  } catch {
    await runCommand("python3", ["-m", "venv", venvPath], { cwd: userDir })
    await runCommand(pipBin, ["install", "--upgrade", "pip", "setuptools", "wheel"], { cwd: userDir, timeoutMs: 20000 })
  }
  return { venvPath, pipBin }
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = session.user.id
  const { packages } = await req.json()
  if (!packages || typeof packages !== "string") return NextResponse.json({ error: "invalid" }, { status: 400 })

  const pkgList = packages.split(/\s+/).filter(Boolean)
  if (pkgList.length === 0) return NextResponse.json({ error: "no-packages" }, { status: 400 })
  if (pkgList.length > 8) return NextResponse.json({ error: "too-many" }, { status: 400 })

  const userDir = join(BASE_DIR, userId)
  await ensureDir(userDir)
  const { venvPath, pipBin } = await ensureVenv(userDir)

  const env = { ...process.env, VIRTUAL_ENV: venvPath, PATH: `${join(venvPath, "bin")}:${process.env.PATH}` }

  try {
    const { stdout, stderr } = await runCommand(pipBin, ["install", ...pkgList], { cwd: userDir, env, timeoutMs: 30000 })
    return NextResponse.json({ ok: true, stdout, stderr })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "pip-error" }, { status: 400 })
  }
}
