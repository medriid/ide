"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Database,
  FileCode2,
  GraduationCap,
  Loader2,
  Play,
  Sparkles,
  Zap,
  Trophy
} from "lucide-react"
import MusicPlayer from "@/components/MusicPlayer"

type Lesson = {
  id: string
  slug: string
  title: string
  topic: string
  summary: string
  order: number
  sectionCount: number
  progress: {
    status: string
    completedSections: number
  }
}

type LessonsData = {
  lessons: Lesson[]
  topics: Record<string, Lesson[]>
}

const topicIcons: Record<string, React.ReactNode> = {
  "Python": <FileCode2 className="w-5 h-5" />,
  "SQL": <Database className="w-5 h-5" />,
  "MySQL Python": <Code2 className="w-5 h-5" />,
  "HTML & Tailwind CSS": <FileCode2 className="w-5 h-5" />,
}

const topicColors: Record<string, string> = {
  "Python": "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  "SQL": "from-orange-500/20 to-yellow-500/20 border-orange-500/30",
  "MySQL Python": "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  "HTML & Tailwind CSS": "from-purple-500/20 to-pink-500/20 border-purple-500/30",
}

const topicAccent: Record<string, string> = {
  "Python": "text-blue-400",
  "SQL": "text-orange-400",
  "MySQL Python": "text-emerald-400",
  "HTML & Tailwind CSS": "text-purple-400",
}

// XP rewards per lesson slug (should match lib/xp.ts)
const lessonXpRewards: Record<string, number> = {
  "python-file-handling-basics": 10,
  "python-csv-files": 15,
  "python-binary-files": 25,
  "sql-introduction": 10,
  "sql-filtering-data": 15,
  "sql-modifying-data": 20,
  "sql-sorting-limiting": 25,
  // MySQL Advanced lessons
  "mysql-joins-mastery": 30,
  "mysql-aggregate-functions": 35,
  "mysql-subqueries": 40,
  "mysql-indexes-performance": 45,
  "mysql-transactions": 50,
  // HTML & Tailwind CSS lessons
  "html-basics": 10,
  "tailwind-css-basics": 15,
}

function getXpReward(slug: string, order: number): number {
  if (lessonXpRewards[slug]) return lessonXpRewards[slug]
  if (order <= 1) return 10
  if (order <= 2) return 15
  if (order <= 3) return 20
  return 25 + (order - 4) * 5
}

export default function LessonsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<LessonsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return

    const fetchLessons = async () => {
      try {
        const res = await fetch("/api/lessons", { credentials: "include" })
        const json = await res.json()
        setData(json)
        
        // Select first topic by default
        if (json.topics && Object.keys(json.topics).length > 0) {
          setSelectedTopic(Object.keys(json.topics)[0])
        }
      } catch (e) {
        console.error("Failed to fetch lessons:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  const topics = data?.topics ? Object.keys(data.topics) : []
  const currentLessons = selectedTopic && data?.topics ? data.topics[selectedTopic] : []
  
  // Calculate stats
  const totalLessons = data?.lessons?.length || 0
  const completedLessons = data?.lessons?.filter(l => l.progress.status === "completed").length || 0
  const inProgressLessons = data?.lessons?.filter(l => l.progress.status === "in_progress").length || 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Lessons</h1>
                <p className="text-sm text-zinc-500 mt-0.5">Master Python & SQL step by step</p>
              </div>
            </div>
            
            <Link 
              href="/"
              className="text-sm text-zinc-400 hover:text-white transition flex items-center gap-2"
            >
              <span>Home</span>
            </Link>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completedLessons}</div>
                  <div className="text-xs text-zinc-500">Completed</div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{inProgressLessons}</div>
                  <div className="text-xs text-zinc-500">In Progress</div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalLessons}</div>
                  <div className="text-xs text-zinc-500">Total Lessons</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Topic Tabs */}
        <div className="flex gap-3 mb-8">
          {topics.map(topic => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition border ${
                selectedTopic === topic
                  ? `bg-gradient-to-br ${topicColors[topic] || "from-white/10 to-white/5 border-white/20"} text-white`
                  : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
              }`}
            >
              {topicIcons[topic] || <Code2 className="w-5 h-5" />}
              <span>{topic}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedTopic === topic 
                  ? "bg-white/20 text-white" 
                  : "bg-white/10 text-zinc-500"
              }`}>
                {data?.topics?.[topic]?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        {currentLessons.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-400 mb-2">No lessons available</h2>
            <p className="text-sm text-zinc-600">
              Select a topic above to view lessons.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentLessons.map((lesson, index) => {
              const isCompleted = lesson.progress.status === "completed"
              const isInProgress = lesson.progress.status === "in_progress"
              const progressPercent = lesson.sectionCount > 0 
                ? Math.round((lesson.progress.completedSections / lesson.sectionCount) * 100)
                : 0

              return (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.slug}`}
                  className={`block group relative overflow-hidden rounded-xl border transition-all hover:border-white/30 ${
                    isCompleted
                      ? "bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40"
                      : isInProgress
                      ? "bg-amber-950/20 border-amber-500/20 hover:border-amber-500/40"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="p-6 flex items-center gap-6">
                    {/* Lesson Number */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold border shrink-0 ${
                      isCompleted
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        : isInProgress
                        ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                        : "bg-white/5 border-white/10 text-zinc-500"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold group-hover:text-white transition">
                          {lesson.title}
                        </h3>
                        {isInProgress && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 line-clamp-1">
                        {lesson.summary}
                      </p>
                      
                      {/* Progress bar for in-progress lessons */}
                      {isInProgress && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500">
                            {lesson.progress.completedSections}/{lesson.sectionCount}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Zap className={`w-3.5 h-3.5 ${isCompleted ? "text-emerald-400" : "text-yellow-400"}`} />
                          <span className={`text-sm font-medium ${isCompleted ? "text-emerald-400" : "text-yellow-400"}`}>
                            {isCompleted ? "+" : ""}{getXpReward(lesson.slug, lesson.order)} XP
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {lesson.sectionCount} sections
                        </div>
                      </div>
                      
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/5 text-zinc-500 group-hover:bg-white/10 group-hover:text-white"
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isInProgress ? (
                          <Play className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-sm text-zinc-500 uppercase tracking-wider mb-4">Quick Access</h3>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400 hover:text-yellow-300 hover:border-yellow-500/40 transition"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/python"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition"
            >
              <FileCode2 className="w-4 h-4" />
              Python Lab
            </Link>
            <Link
              href="/sql"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition"
            >
              <Database className="w-4 h-4" />
              SQL Lab
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition"
            >
              <Code2 className="w-4 h-4" />
              Chat
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Music Player */}
      <MusicPlayer variant="floating" />
    </div>
  )
}
