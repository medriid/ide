import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { prisma } from "@/lib/prisma"
import { getPgPool } from "@/lib/postgres"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  const s: any = await getServerSession(authOptions as any)
  if (!s?.user?.id && !s?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // Support both id and email lookup for consistency
  const user = s?.user?.id 
    ? await prisma.user.findUnique({ where: { id: s.user.id }, include: { schema: true } })
    : await prisma.user.findUnique({ where: { email: s.user.email }, include: { schema: true } })
  const prefix = user?.schema?.schemaName || `u_${user?.id?.replace(/[^a-zA-Z0-9_]/g, "").slice(0,12)}_`
  const { sql } = await req.json()
  if (typeof sql !== "string" || !sql.trim()) return NextResponse.json({ error: "invalid" }, { status: 400 })
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "db" }, { status: 500 })
  const pool = getPgPool()
  const client = await pool.connect()

  // Block database-level commands
  const forbidden = /\b(create\s+database|drop\s+database|use\s+\w+)/i
  if (forbidden.test(sql)) {
    client.release()
    return NextResponse.json({ ok: false, error: "Database commands are disabled in this IDE." }, { status: 400 })
  }

  // Custom SHOW TABLES handling to filter to user tables
  const showTablesRegex = /^\s*show\s+tables(\s+like\s+['"].*?['"])?\s*;?\s*$/i
  const describeRegex = /^\s*(describe|desc)\s+`?("?)([a-zA-Z0-9_]+)\2`?\s*;?\s*$/i
  const showCreateRegex = /^\s*show\s+create\s+table\s+`?("?)([a-zA-Z0-9_]+)\1`?\s*;?\s*$/i

  try {
    if (showTablesRegex.test(sql)) {
      const result = await client.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name LIKE $1
         ORDER BY table_name`,
        [`${prefix}%`]
      )
      const cleaned = result.rows
        .map((r) => r.table_name as string)
        .map((name) => (name.startsWith(prefix) ? name.slice(prefix.length) : name))
      return NextResponse.json({ ok: true, rows: cleaned })
    }

    const describeMatch = sql.match(describeRegex)
    if (describeMatch) {
      const rawTable = describeMatch[3]
      const tableName = rawTable.startsWith(prefix) ? rawTable : `${prefix}${rawTable}`
      const columns = await client.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      )
      return NextResponse.json({
        ok: true,
        rows: columns.rows.map((col) => ({
          Field: col.column_name,
          Type: col.data_type,
          Null: col.is_nullable,
          Default: col.column_default
        }))
      })
    }

    const showCreateMatch = sql.match(showCreateRegex)
    if (showCreateMatch) {
      const rawTable = showCreateMatch[2]
      const tableName = rawTable.startsWith(prefix) ? rawTable : `${prefix}${rawTable}`
      const columns = await client.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1
         ORDER BY ordinal_position`,
        [tableName]
      )
      const columnLines = columns.rows.map((col) => {
        const nullable = col.is_nullable === "NO" ? " NOT NULL" : ""
        const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : ""
        return `  "${col.column_name}" ${col.data_type}${defaultValue}${nullable}`
      })
      const createSql = `CREATE TABLE "${tableName}" (\n${columnLines.join(",\n")}\n);`
      return NextResponse.json({ ok: true, rows: [{ "Create Table": createSql }] })
    }

    const rewritten = rewriteSQLWithPrefix(sql, prefix)
    const result = await client.query(rewritten)
    const responseRows = Array.isArray(result) ? result[result.length - 1]?.rows : result.rows
    return NextResponse.json({ ok: true, rows: responseRows ?? [], rowCount: Array.isArray(result) ? result[result.length - 1]?.rowCount : result.rowCount, note: "prefixed" })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "error" }, { status: 400 })
  } finally {
    client.release()
  }
}

// Very simple SQL rewriter to add a per-user table prefix for common statements
function rewriteSQLWithPrefix(input: string, prefix: string): string {
  const alreadyPrefixed = (name: string) => name.startsWith(prefix)
  const q = (name: string) => `"${name}"`
  const add = (name: string) => (alreadyPrefixed(name) ? q(name) : q(prefix + name))

  let sql = input
  // CREATE/DROP/ALTER TABLE <name>
  sql = sql.replace(/\b(TABLE)\s+`?"?([a-zA-Z0-9_]+)"?`?/gi, (_m, kw, name) => `${kw} ${add(name)}`)
  // TRUNCATE TABLE <name>
  sql = sql.replace(/\b(TRUNCATE)\s+(TABLE\s+)?`?"?([a-zA-Z0-9_]+)"?`?/gi, (_m, _kw, _tbl, name) => `TRUNCATE ${add(name.replace(/^table\s+/i, ""))}`)
  // INSERT INTO <name>
  sql = sql.replace(/\b(INTO)\s+`?"?([a-zA-Z0-9_]+)"?`?/gi, (_m, kw, name) => `${kw} ${add(name)}`)
  // UPDATE <name>
  sql = sql.replace(/\b(UPDATE)\s+`?"?([a-zA-Z0-9_]+)"?`?/gi, (_m, kw, name) => `${kw} ${add(name)}`)
  // DELETE FROM <name>
  sql = sql.replace(/\b(FROM)\s+`?"?([a-zA-Z0-9_]+)"?`?/gi, (_m, kw, name) => `${kw} ${add(name)}`)
  // JOIN <name>
  sql = sql.replace(/\b(JOIN)\s+`?"?([a-zA-Z0-9_]+)"?`?/gi, (_m, kw, name) => `${kw} ${add(name)}`)
  // DESCRIBE <name>
  sql = sql.replace(/\b(DESCRIBE|DESC)\s+`?"?([a-zA-Z0-9_]+)"?`?/gi, (_m, kw, name) => `${kw} ${add(name)}`)
  // SHOW CREATE TABLE <name>
  sql = sql.replace(/\b(SHOW\s+CREATE\s+TABLE)\s+`?"?([a-zA-Z0-9_]+)"?`?/gi, (_m, kw, name) => `${kw} ${add(name)}`)
  // Convert MySQL-style backticks to Postgres double quotes
  sql = sql.replace(/`/g, "\"")
  return sql
}
