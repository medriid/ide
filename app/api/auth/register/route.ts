import { NextResponse } from "next/server"
export const runtime = "nodejs"
import { prisma } from "@/lib/prisma"
import { getPostgresConfig } from "@/lib/postgres"
import argon2 from "argon2"
import { Client } from "pg"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

// ============================================
// INVITE CODE SYSTEM TOGGLE
// Set to false to require invite codes for registration
// Set to true to allow anyone to register without an invite code
// ============================================
const INVITE_CODE_DISABLED = false

export async function POST(req: Request) {
  try {
    const { username, email, password, inviteCode } = await req.json()
    if (!username || !email || !password) return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    
    // Validate username format (alphanumeric, underscores, 3-20 chars)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return NextResponse.json({ error: "Username must be 3-20 characters, alphanumeric and underscores only" }, { status: 400 })
    }
    
    // Check if owner email
    const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase()
    
    // Non-owners must provide a valid invite code (unless disabled)
    if (!isOwner && !INVITE_CODE_DISABLED) {
      if (!inviteCode) {
        return NextResponse.json({ error: "Invite code is required" }, { status: 400 })
      }
      const validCode = await prisma.inviteCode.findFirst({ 
        where: { code: inviteCode, active: true } 
      })
      if (!validCode) {
        return NextResponse.json({ error: "Invalid invite code" }, { status: 400 })
      }
    }
    
    // Check if email already exists
    const emailExists = await prisma.user.findUnique({ where: { email } })
    if (emailExists) return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    
    // Check if username already exists
    const usernameExists = await prisma.user.findUnique({ where: { username } })
    if (usernameExists) return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    
    const passwordHash = await argon2.hash(password)
    const role = isOwner ? "owner" : "user"
    
    // Use a transaction for atomic user creation with related records
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({ 
        data: { username, email, passwordHash, role, xp: 0 } 
      })
      
      const schemaName = `u_${newUser.id.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 12)}_`
      await tx.sqlSchema.create({ data: { userId: newUser.id, schemaName } })
      
      // Create default files
      await tx.fileNode.createMany({
        data: [
          {
            userId: newUser.id,
            path: "python/main.py",
            kind: "python",
            content: "# Welcome to Python Lab\nprint('Hello, World!')\n"
          },
          {
            userId: newUser.id,
            path: "data/sample.txt",
            kind: "text",
            content: "Hello NCERT Class 12\nThis is a sample text file.\n"
          },
          {
            userId: newUser.id,
            path: "data/sample.csv",
            kind: "csv",
            content: "name,age,city\nAlice,20,New York\nBob,22,Los Angeles\nCharlie,21,Chicago\n"
          },
          {
            userId: newUser.id,
            path: "data/data.dat",
            kind: "binary",
            content: "" // empty placeholder; code samples will write with pickle
          }
        ]
      })
      
      return { ...newUser, schemaName }
    })
    
    const url = process.env.DATABASE_URL
    if (!url) return NextResponse.json({ ok: true })

    // Seed a prefixed sample table in the shared database
    try {
      const client = new Client(getPostgresConfig())
      await client.connect()
      const table = `${user.schemaName}students`
      const tableIdentifier = `"${table}"`
      await client.query(`CREATE TABLE IF NOT EXISTS ${tableIdentifier} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT,
        city VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`)
      await client.query(
        `INSERT INTO ${tableIdentifier} (name, age, city)
         SELECT * FROM (VALUES ('Alice',20,'New York'), ('Bob',22,'Los Angeles'), ('Charlie',21,'Chicago')) AS tmp(name, age, city)
         WHERE NOT EXISTS (SELECT 1 FROM ${tableIdentifier})`
      )
      await client.end()
    } catch (e) {
      console.log("DB connection error:", e)
    }
    
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error("Registration error:", error)
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; meta?: { target?: string[] } }
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target?.[0]
        if (target === 'email') {
          return NextResponse.json({ error: "Email already exists" }, { status: 409 })
        }
        if (target === 'username') {
          return NextResponse.json({ error: "Username already taken" }, { status: 409 })
        }
        return NextResponse.json({ error: "A unique constraint was violated" }, { status: 409 })
      }
      if (prismaError.code === 'P2024') {
        return NextResponse.json({ error: "Database connection timed out. Please try again." }, { status: 503 })
      }
    }
    
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
