import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { session } from "@/lib/auth"
import { getPublishedLessons, getLessonTopics } from "@/lib/lessons"

export async function GET() {
  try {
    const sess = await session()
    const userId = (sess?.user as { id?: string })?.id

    // Get all published lessons from static data
    const lessons = getPublishedLessons().sort((a, b) => {
      // Sort by topic first, then by order
      if (a.topic !== b.topic) return a.topic.localeCompare(b.topic)
      return a.order - b.order
    })

    // Get user progress if logged in
    let progressMap: Record<string, { status: string; completedSections: number }> = {}
    
    if (userId) {
      const progress = await prisma.progress.findMany({
        where: { userId }
      })

      // Group progress by lesson
      for (const p of progress) {
        if (!progressMap[p.lessonId]) {
          progressMap[p.lessonId] = { status: "not_started", completedSections: 0 }
        }
        
        if (p.sectionId) {
          // Section-level progress
          if (p.status === "completed") {
            progressMap[p.lessonId].completedSections++
          }
        } else {
          // Lesson-level progress
          progressMap[p.lessonId].status = p.status
        }
      }
    }

    // Format response
    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      topic: lesson.topic,
      summary: lesson.summary,
      order: lesson.order,
      sectionCount: lesson.sections.length,
      progress: progressMap[lesson.id] || { status: "not_started", completedSections: 0 }
    }))

    // Group by topic
    const topics: Record<string, typeof formattedLessons> = {}
    for (const lesson of formattedLessons) {
      if (!topics[lesson.topic]) {
        topics[lesson.topic] = []
      }
      topics[lesson.topic].push(lesson)
    }

    return NextResponse.json({ lessons: formattedLessons, topics })
  } catch (error) {
    console.error("Failed to fetch lessons:", error)
    return NextResponse.json({ error: "Failed to fetch lessons" }, { status: 500 })
  }
}
