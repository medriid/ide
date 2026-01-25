import { Pool } from "pg"
import { normalizeDatabaseUrl } from "@/lib/database-url"

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined
}

type PostgresConfig = {
  connectionString: string
  ssl?: { rejectUnauthorized: boolean }
}

function buildPostgresConfig(): PostgresConfig {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error("DATABASE_URL is not set")
  }

  const normalizedUrl = normalizeDatabaseUrl(url)
  const parsedUrl = new URL(normalizedUrl)
  const sslMode = parsedUrl.searchParams.get("sslmode")
  const ssl = sslMode && sslMode !== "disable" ? { rejectUnauthorized: false } : undefined

  return { connectionString: normalizedUrl, ssl }
}

export function getPostgresConfig(): PostgresConfig {
  return buildPostgresConfig()
}

export function getPgPool(): Pool {
  const config = buildPostgresConfig()

  if (!globalForPg.pgPool) {
    globalForPg.pgPool = new Pool({
      ...config,
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000
    })
  }

  return globalForPg.pgPool
}
