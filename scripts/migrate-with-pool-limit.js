#!/usr/bin/env node

// Wrapper script to run Prisma migrations with connection pool limits
const { execSync } = require("child_process")

// Get DATABASE_URL from environment
let databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error("DATABASE_URL environment variable is not set")
  process.exit(1)
}

function normalizeDatabaseUrl(rawUrl) {
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

databaseUrl = normalizeDatabaseUrl(databaseUrl)

// Set the modified DATABASE_URL and run migration
process.env.DATABASE_URL = databaseUrl

try {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env
  })
} catch (error) {
  process.exit(1)
}
