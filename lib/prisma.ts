import { PrismaClient } from "@prisma/client"
import { normalizeDatabaseUrl } from "@/lib/database-url"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL)
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
