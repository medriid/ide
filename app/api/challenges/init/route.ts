import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getChallengeById } from "@/lib/challenges"

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const { challengeId } = await req.json()

  if (!challengeId) {
    return NextResponse.json({ error: "challengeId required" }, { status: 400 })
  }

  const challenge = getChallengeById(challengeId)
  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 })
  }

  try {
    // Clear any existing challenge files for this user (including challenge.py)
    const existingFiles = await prisma.fileNode.findMany({
      where: {
        userId,
        OR: [
          { path: { startsWith: "python/challenge_" } },
          { path: "python/challenge.py" }
        ]
      }
    })

    for (const file of existingFiles) {
      await prisma.fileNode.delete({
        where: { userId_path: { userId, path: file.path } }
      })
    }

    // Initialize challenge-specific files based on challenge type
    const challengeFiles: Array<{ path: string; content: string; kind: string }> = []

    if (challenge.type === "python") {
      // Python challenges - create temporary data files
      if (challenge.id === "text-1") {
        // Read and Print File Content
        challengeFiles.push({
          path: "python/challenge_sample.txt",
          content: "Hello NCERT Class 12",
          kind: "text"
        })
      } else if (challenge.id === "csv-1") {
        // Read CSV Data
        challengeFiles.push({
          path: "python/challenge_sample.csv",
          content: "name,age\nAlice,20\nBob,22",
          kind: "csv"
        })
      } else if (challenge.id === "csv-3") {
        // CSV with DictReader
        challengeFiles.push({
          path: "python/challenge_employees.csv",
          content: "name,department,salary\nJohn,Engineering,75000\nSarah,Marketing,65000",
          kind: "csv"
        })
      } else if (challenge.id === "csv-4") {
        // Calculate CSV Statistics
        challengeFiles.push({
          path: "python/challenge_scores.csv",
          content: "student,score\nAlice,85\nBob,92\nCharlie,78\nDiana,95",
          kind: "csv"
        })
      } else if (challenge.id === "csv-5") {
        // Filter and Modify CSV
        challengeFiles.push({
          path: "python/challenge_inventory.csv",
          content: "item,quantity,reorder\nLaptop,5,10\nMouse,50,20\nKeyboard,8,15\nMonitor,3,10",
          kind: "csv"
        })
      }

      // Create blank challenge.py file with starter code
      challengeFiles.push({
        path: "python/challenge.py",
        content: challenge.starterCode,
        kind: "python"
      })
    } else if (challenge.type === "python-sql") {
      // Python-SQL challenges - create challenge.py file
      challengeFiles.push({
        path: "python/challenge.py",
        content: challenge.starterCode,
        kind: "python"
      })
    }
    // SQL challenges don't need file initialization (they use SQL IDE directly)

    // Save all files
    for (const file of challengeFiles) {
      await prisma.fileNode.upsert({
        where: { userId_path: { userId, path: file.path } },
        create: {
          userId,
          path: file.path,
          kind: file.kind,
          content: file.content,
          mimeType: null
        },
        update: {
          content: file.content,
          kind: file.kind
        }
      })
    }

    return NextResponse.json({ 
      ok: true, 
      files: challengeFiles.map(f => f.path),
      code: challenge.starterCode 
    })
  } catch (error: any) {
    console.error("Challenge init error:", error)
    return NextResponse.json({ error: error.message || "Failed to initialize challenge" }, { status: 500 })
  }
}

