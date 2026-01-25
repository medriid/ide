import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { spawn } from "child_process"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { normalizeDatabaseUrl } from "@/lib/database-url"

export async function POST(req: Request) {
  const s: any = await getServerSession(authOptions as any)
  if (!s?.user?.id && !s?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  
  // Support both id and email lookup for consistency
  const user = s?.user?.id 
    ? await prisma.user.findUnique({ where: { id: s.user.id }, include: { schema: true } })
    : await prisma.user.findUnique({ where: { email: s.user.email }, include: { schema: true } })
  const tablePrefix = user?.schema?.schemaName || `u_${user?.id?.replace(/[^a-zA-Z0-9_]/g, "").slice(0,12)}_`
  
  const { code } = await req.json()
  if (typeof code !== "string" || !code.trim()) return NextResponse.json({ error: "invalid" }, { status: 400 })
  
  const url = process.env.DATABASE_URL
  if (!url) return NextResponse.json({ error: "db" }, { status: 500 })
  
  // Parse DATABASE_URL to extract connection details
  const normalizedUrl = normalizeDatabaseUrl(url)
  const parsedUrl = new URL(normalizedUrl)
  const dbUser = decodeURIComponent(parsedUrl.username)
  const dbPass = decodeURIComponent(parsedUrl.password)
  const dbHost = parsedUrl.hostname
  const dbPort = parsedUrl.port || "5432"
  const dbName = parsedUrl.pathname.replace(/^\//, "")
  const dbSslMode = parsedUrl.searchParams.get("sslmode") || "require"
  
  // Create a temporary Python file with environment variables injected
  const tmpFile = join("/tmp", `sql_${Date.now()}_${Math.random().toString(36).slice(2)}.py`)
  
  // Inject the connection details and rewrite table names with user prefix
  let codeWithEnv = code
    .replace(/os\.getenv\(['"]DB_HOST['"]\)/g, `"${dbHost}"`)
    .replace(/os\.getenv\(['"]DB_USER['"]\)/g, `"${dbUser}"`)
    .replace(/os\.getenv\(['"]DB_PASS['"]\)/g, `"${dbPass}"`)
    .replace(/os\.getenv\(['"]DB_PORT['"]\)/g, `"${dbPort}"`)
    .replace(/os\.getenv\(['"]DB_NAME['"]\)/g, `"${dbName}"`)
    .replace(/(database|dbname)\s*=\s*['"].*?['"]/g, (_match, key) => `${key}='${dbName}'`)
  
  // Rewrite table names to include user prefix (for common patterns)
  // Match table names in SQL strings like "SELECT * FROM students" or 'INSERT INTO students'
  codeWithEnv = rewritePythonTableNames(codeWithEnv, tablePrefix)
  
  try {
    await writeFile(tmpFile, codeWithEnv, "utf8")
    
    // Ensure psycopg2 is installed
    await ensurePostgresConnector()
    
    // Execute Python code
    const output = await executePython(tmpFile, { 
      DB_TABLE_PREFIX: tablePrefix || "",
      DB_HOST: dbHost,
      DB_USER: dbUser,
      DB_PASS: dbPass,
      DB_PORT: dbPort,
      DB_NAME: dbName,
      DB_SSLMODE: dbSslMode
    })
    
    // Clean up
    await unlink(tmpFile).catch(() => {})
    
    return NextResponse.json({ ok: true, output })
  } catch (e: any) {
    // Clean up on error
    await unlink(tmpFile).catch(() => {})
    return NextResponse.json({ ok: false, error: e?.message || "execution-error" }, { status: 400 })
  }
}

// Rewrite table names in Python SQL strings to include user prefix
// This uses the same logic as the SQL execute route
function rewritePythonTableNames(code: string, prefix: string): string {
  if (!prefix) return code
  
  const alreadyPrefixed = (name: string) => name.startsWith(prefix)
  const addPrefix = (name: string) => alreadyPrefixed(name) ? name : `${prefix}${name}`
  
  const pythonKeywords = new Set(['for', 'in', 'if', 'else', 'elif', 'while', 'def', 'class', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'return', 'yield', 'break', 'continue', 'pass', 'and', 'or', 'not', 'is', 'None', 'True', 'False', 'tables', 'table', 'cursor', 'conn', 'rows', 'data'])
  
  let result = code
  
  result = result.replace(/(['"])(.*?)\1/g, (match: string, quote: string, sqlContent: string) => {
    if (!sqlContent) return match
    
    let rewritten = sqlContent
    
    rewritten = rewritten.replace(/\bSHOW\s+TABLES\b/gi, () => {
      return `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '${prefix}%'`
    })
    
    rewritten = rewritten.replace(/\bDESCRIBE\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi, (_m: string, name: string) => {
      const tableName = addPrefix(name)
      return `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}' ORDER BY ordinal_position`
    })
    
    rewritten = rewritten.replace(/\b(TABLE)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi, (m: string, kw: string, name: string) => {
      if (name.startsWith('information_schema') || name.startsWith('pg_')) return m
      return `${kw} ${addPrefix(name)}`
    })
    
    rewritten = rewritten.replace(/\b(INTO)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi, (m: string, kw: string, name: string) => {
      if (name.startsWith('information_schema') || name.startsWith('pg_')) return m
      return `${kw} ${addPrefix(name)}`
    })
    
    rewritten = rewritten.replace(/\b(UPDATE)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi, (m: string, kw: string, name: string) => {
      if (name.startsWith('information_schema') || name.startsWith('pg_')) return m
      return `${kw} ${addPrefix(name)}`
    })
    
    rewritten = rewritten.replace(/\b(FROM)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi, (m: string, kw: string, name: string) => {
      if (name.startsWith('information_schema') || name.startsWith('pg_')) return m
      return `${kw} ${addPrefix(name)}`
    })
    
    rewritten = rewritten.replace(/\b(JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi, (m: string, kw: string, name: string) => {
      if (name.startsWith('information_schema') || name.startsWith('pg_')) return m
      return `${kw} ${addPrefix(name)}`
    })
    
    rewritten = rewritten.replace(/\b(DESCRIBE|DESC)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi, (m: string, kw: string, name: string) => {
      if (name.startsWith('information_schema') || name.startsWith('pg_')) return m
      return `${kw} ${addPrefix(name)}`
    })
    
    return quote + rewritten + quote
  })
  
  return result
}

// Cache for checking if psycopg2 is installed
let postgresConnectorInstalled = false

async function ensurePostgresConnector(): Promise<void> {
  if (postgresConnectorInstalled) return
  
  return new Promise((resolve, reject) => {
    // Check if psycopg2 is installed
    const check = spawn("python3", ["-c", "import psycopg2"])
    check.on("close", (code) => {
      if (code === 0) {
        postgresConnectorInstalled = true
        resolve()
      } else {
        // Install psycopg2-binary
        const install = spawn("pip3", ["install", "--quiet", "psycopg2-binary"], {
          env: process.env
        })
        install.on("close", (installCode) => {
          if (installCode === 0) {
            postgresConnectorInstalled = true
            resolve()
          } else {
            reject(new Error("Failed to install psycopg2-binary"))
          }
        })
        install.on("error", reject)
      }
    })
    check.on("error", reject)
  })
}

function executePython(filePath: string, extraEnv: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", [filePath], { env: { ...process.env, ...extraEnv } })
    let stdout = ""
    let stderr = ""
    
    python.stdout.on("data", (data) => {
      stdout += data.toString()
    })
    
    python.stderr.on("data", (data) => {
      stderr += data.toString()
    })
    
    python.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python exited with code ${code}`))
      } else {
        resolve(stdout)
      }
    })
    
    python.on("error", (err) => {
      reject(err)
    })
    
    // Timeout after 10 seconds
    setTimeout(() => {
      python.kill()
      reject(new Error("Execution timeout (10s)"))
    }, 10000)
  })
}
