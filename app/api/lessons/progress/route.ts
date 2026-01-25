import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { session } from "@/lib/auth"
import { getPublishedLessons, getLessonBySlug } from "@/lib/lessons"
import { LESSON_XP_REWARDS, getDefaultXpReward, calculateLevel } from "@/lib/xp"
import { updateUserStreak } from "@/lib/streak-service"
import { checkAndAwardAchievements } from "@/lib/achievement-service"

// GET user's overall progress
export async function GET() {
  try {
    const sess = await session()
    const userId = (sess?.user as { id?: string })?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all progress records for user
    const progress = await prisma.progress.findMany({
      where: { userId }
    })

    // Get all lessons from static data
    const lessons = getPublishedLessons()

    // Calculate stats
    const stats = {
      totalLessons: lessons.length,
      completedLessons: 0,
      inProgressLessons: 0,
      totalSections: 0,
      completedSections: 0
    }

    const lessonProgressMap: Record<string, string> = {}
    const sectionProgressMap: Record<string, string> = {}

    for (const p of progress) {
      if (p.sectionId) {
        sectionProgressMap[p.sectionId] = p.status
        if (p.status === "completed") {
          stats.completedSections++
        }
      } else {
        lessonProgressMap[p.lessonId] = p.status
        if (p.status === "completed") {
          stats.completedLessons++
        } else if (p.status === "in_progress") {
          stats.inProgressLessons++
        }
      }
    }

    for (const lesson of lessons) {
      stats.totalSections += lesson.sections.length
    }

    return NextResponse.json({
      stats,
      lessonProgress: lessonProgressMap,
      sectionProgress: sectionProgressMap
    })
  } catch (error) {
    console.error("Failed to fetch progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}

// POST to update progress
export async function POST(request: Request) {
  try {
    const sess = await session()
    const userId = (sess?.user as { id?: string })?.id

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { lessonId, sectionId, status, score } = body

    if (!lessonId || !status) {
      return NextResponse.json({ error: "lessonId and status are required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["not_started", "in_progress", "completed"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Get lesson from static data to validate
    const lesson = getPublishedLessons().find(l => l.id === lessonId)
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId_sectionId: {
          userId,
          lessonId,
          sectionId: sectionId || ""
        }
      },
      create: {
        userId,
        lessonId,
        sectionId: sectionId || null,
        status,
        score: score || null
      },
      update: {
        status,
        score: score !== undefined ? score : undefined
      }
    })

    // If completing a section, check if all sections are complete
    if (sectionId && status === "completed") {
      const completedSections = await prisma.progress.count({
        where: {
          userId,
          lessonId,
          sectionId: { not: null },
          status: "completed"
        }
      })

      // If all sections completed, mark lesson as completed and award XP
      if (completedSections >= lesson.sections.length) {
        // Check if lesson was already completed (to avoid double XP)
        const existingLessonProgress = await prisma.progress.findUnique({
          where: {
            userId_lessonId_sectionId: {
              userId,
              lessonId,
              sectionId: ""
            }
          }
        })

        const wasAlreadyCompleted = existingLessonProgress?.status === "completed"

        await prisma.progress.upsert({
          where: {
            userId_lessonId_sectionId: {
              userId,
              lessonId,
              sectionId: ""
            }
          },
          create: {
            userId,
            lessonId,
            sectionId: null,
            status: "completed"
          },
          update: {
            status: "completed"
          }
        })

        // Award XP only if lesson wasn't already completed
        if (!wasAlreadyCompleted) {
          const xpReward = LESSON_XP_REWARDS[lesson.slug] || getDefaultXpReward(lesson.order)
          
          // Update user XP and recalculate level
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { xp: true }
          })
          
          const newXp = (user?.xp || 0) + xpReward
          const newLevel = calculateLevel(newXp)
          
          await prisma.user.update({
            where: { id: userId },
            data: { 
              xp: newXp,
              level: newLevel
            }
          })

          // Update streak and check achievements (non-blocking)
          Promise.all([
            updateUserStreak(userId),
            checkAndAwardAchievements(userId)
          ]).catch(() => {})

          return NextResponse.json({ 
            ok: true, 
            progress,
            xpAwarded: xpReward,
            newXp,
            newLevel
          })
        }
      } else {
        // Mark lesson as in_progress if not already
        await prisma.progress.upsert({
          where: {
            userId_lessonId_sectionId: {
              userId,
              lessonId,
              sectionId: ""
            }
          },
          create: {
            userId,
            lessonId,
            sectionId: null,
            status: "in_progress"
          },
          update: {
            status: "in_progress"
          }
        })
      }
    }

    return NextResponse.json({ ok: true, progress })
  } catch (error) {
    console.error("Failed to update progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
