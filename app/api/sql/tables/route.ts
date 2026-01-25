import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getPgPool } from "@/lib/postgres"

export async function GET() {
  const session: any = await getServerSession(authOptions as any)
  
  if (!session?.user?.id && !session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = session?.user?.id 
    ? await prisma.user.findUnique({ where: { id: session.user.id }, include: { schema: true } })
    : await prisma.user.findUnique({ where: { email: session.user.email }, include: { schema: true } })

  const prefix = user?.schema?.schemaName || `u_${user?.id?.replace(/[^a-zA-Z0-9_]/g, "").slice(0,12)}_`
  if(!process.env.DATABASE_URL) return Response.json({ error: "Missing DATABASE_URL" }, { status: 500 })
  const pool = getPgPool()
  const client = await pool.connect()

  try {
    const rows = await client.query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name LIKE $1
       ORDER BY table_name`,
      [`${prefix}%`]
    )
    const tableNames = rows.rows.map((r) => r.table_name as string)
    const tableDetails = await Promise.all(tableNames.map(async (raw: string) => {
      const display = raw.startsWith(prefix) ? raw.substring(prefix.length) : raw
      const [columns, countResult, primaryKeys] = await Promise.all([
        client.query(
          `SELECT column_name, data_type, is_nullable, column_default
           FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = $1
           ORDER BY ordinal_position`,
          [raw]
        ),
        client.query(`SELECT COUNT(*)::int as count FROM "${raw}"`),
        client.query(
          `SELECT a.attname
           FROM pg_index i
           JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
           WHERE i.indrelid = $1::regclass AND i.indisprimary`,
          [`public.${raw}`]
        )
      ])
      const primaryKeySet = new Set(primaryKeys.rows.map((row) => row.attname as string))
      return {
        name: display,
        columns: columns.rows.map((c) => ({
          field: c.column_name,
          type: c.data_type,
          null: c.is_nullable,
          key: primaryKeySet.has(c.column_name) ? "PRI" : "",
          default: c.column_default
        })),
        rowCount: countResult.rows[0]?.count || 0
      }
    }))
    return Response.json({ tables: tableDetails })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  } finally {
    client.release()
  }
}
