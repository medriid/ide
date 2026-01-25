import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { session } from "@/lib/auth"
import { getLessonBySlug, getNextLesson, getPrevLesson } from "@/lib/lessons"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const sess = await session()
    const userId = (sess?.user as { id?: string })?.id

    // Get lesson from static data
    const lesson = getLessonBySlug(slug)

    if (!lesson || !lesson.published) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    // Get user progress for this lesson
    let lessonProgress = { status: "not_started", score: null as number | null }
    let sectionProgress: Record<string, { status: string; score: number | null }> = {}

    if (userId) {
      const progress = await prisma.progress.findMany({
        where: { userId, lessonId: lesson.id }
      })

      for (const p of progress) {
        if (p.sectionId) {
          sectionProgress[p.sectionId] = { status: p.status, score: p.score }
        } else {
          lessonProgress = { status: p.status, score: p.score }
        }
      }
    }

    // Get next and previous lessons from static data
    const prevLesson = getPrevLesson(slug)
    const nextLesson = getNextLesson(slug)

    // Format sections with progress
    const sectionsWithProgress = lesson.sections.map(section => ({
      id: section.id,
      title: section.title,
      content: section.content,
      type: section.type,
      order: section.order,
      progress: sectionProgress[section.id] || { status: "not_started", score: null }
    }))

    return NextResponse.json({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      topic: lesson.topic,
      summary: lesson.summary,
      order: lesson.order,
      sections: sectionsWithProgress,
      progress: lessonProgress,
      navigation: {
        prev: prevLesson ? { slug: prevLesson.slug, title: prevLesson.title } : null,
        next: nextLesson ? { slug: nextLesson.slug, title: nextLesson.title } : null
      }
    })
  } catch (error) {
    console.error("Failed to fetch lesson:", error)
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 })
  }
}
