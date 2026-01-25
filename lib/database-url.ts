export function normalizeDatabaseUrl(rawUrl: string): string {
  const url = new URL(rawUrl)

  if (!url.searchParams.has("sslmode")) {
    url.searchParams.set("sslmode", "require")
  }

  if (!url.searchParams.has("pgbouncer")) {
    url.searchParams.set("pgbouncer", "true")
  }

  if (!url.searchParams.has("connection_limit")) {
    url.searchParams.set("connection_limit", "1")
  }

  if (!url.searchParams.has("pool_timeout")) {
    url.searchParams.set("pool_timeout", "20")
  }

  return url.toString()
}
