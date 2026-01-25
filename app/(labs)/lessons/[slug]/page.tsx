"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Database,
  FileCode2,
  GraduationCap,
  Lightbulb,
  Loader2,
  Play,
  Terminal,
  Zap
} from "lucide-react"
import MusicPlayer from "@/components/MusicPlayer"

type Section = {
  id: string
  title: string
  content: string
  type: string
  order: number
  progress: {
    status: string
    score: number | null
  }
}

type LessonData = {
  id: string
  slug: string
  title: string
  topic: string
  summary: string
  order: number
  sections: Section[]
  progress: {
    status: string
    score: number | null
  }
  navigation: {
    prev: { slug: string; title: string } | null
    next: { slug: string; title: string } | null
  }
}

const sectionTypeIcons: Record<string, React.ReactNode> = {
  concept: <Lightbulb className="w-4 h-4" />,
  code: <Code2 className="w-4 h-4" />,
  exercise: <Zap className="w-4 h-4" />,
  example: <Terminal className="w-4 h-4" />,
}

const sectionTypeColors: Record<string, string> = {
  concept: "border-blue-500/30 bg-blue-500/10",
  code: "border-emerald-500/30 bg-emerald-500/10",
  exercise: "border-amber-500/30 bg-amber-500/10",
  example: "border-purple-500/30 bg-purple-500/10",
}

export default function LessonPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const [lesson, setLesson] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [markingComplete, setMarkingComplete] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const fetchLesson = useCallback(async () => {
    if (!slug) return
    
    try {
      const res = await fetch(`/api/lessons/${slug}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setLesson(data)
        
        // Find first incomplete section
        const firstIncomplete = data.sections.findIndex(
          (s: Section) => s.progress.status !== "completed"
        )
        if (firstIncomplete > 0) {
          setActiveSection(firstIncomplete)
        }
      } else {
        router.push("/lessons")
      }
    } catch (e) {
      console.error("Failed to fetch lesson:", e)
    } finally {
      setLoading(false)
    }
  }, [slug, router])

  useEffect(() => {
    if (status !== "authenticated") return
    fetchLesson()
  }, [status, fetchLesson])

  const markSectionComplete = async (sectionId: string) => {
    if (!lesson || markingComplete) return
    
    setMarkingComplete(true)
    try {
      const res = await fetch("/api/lessons/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lessonId: lesson.id,
          sectionId,
          status: "completed"
        })
      })
      
      if (res.ok) {
        // Refresh lesson data
        await fetchLesson()
        
        // Move to next section if available
        if (activeSection < lesson.sections.length - 1) {
          setActiveSection(activeSection + 1)
        }
      }
    } catch (e) {
      console.error("Failed to mark complete:", e)
    } finally {
      setMarkingComplete(false)
    }
  }

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Helper function to format inline markdown (bold, italic, code)
  const formatInline = (text: string): string => {
    return text
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-sm font-mono text-zinc-200">$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>')
  }

  const parseMarkdownTable = (tableText: string, tableKey: string): React.ReactNode => {
    const lines = tableText.trim().split("\n").filter(l => l.trim())
    if (lines.length < 2) return null

    // Find separator line (contains |------| or |:---:| etc)
    const separatorIndex = lines.findIndex(line => /^\|[\s\-:]+\|/.test(line))
    if (separatorIndex === -1) return null

    const headerLine = lines[0]
    const dataLines = lines.slice(separatorIndex + 1)

    // Parse header - split by | and filter empty strings
    const headers = headerLine.split("|").map(h => h.trim()).filter(h => h)
    
    if (headers.length === 0) return null
    
    // Parse data rows - only process lines that look like table rows
    const rows = dataLines
      .filter(line => line.trim().startsWith("|") && line.trim().endsWith("|"))
      .map(line => {
        const cells = line.split("|").map(cell => cell.trim())
        // Filter out empty cells at start/end (from leading/trailing |)
        return cells.filter((_, i) => i > 0 && i <= headers.length)
      })
      .filter(row => row.length > 0 && row.some(cell => cell.trim() !== ""))

    return (
      <div key={tableKey} className="my-6 overflow-x-auto">
        <table className="min-w-full border-collapse border border-white/20">
          <thead>
            <tr className="bg-white/5">
              {headers.map((header, hIndex) => (
                <th
                  key={hIndex}
                  className="border border-white/20 px-4 py-3 text-left text-sm font-semibold text-white"
                  dangerouslySetInnerHTML={{ __html: formatInline(header) }}
                />
              ))}
            </tr>
          </thead>
          {rows.length > 0 && (
            <tbody>
              {rows.map((row, rIndex) => (
                <tr key={rIndex} className="hover:bg-white/5 transition">
                  {headers.map((_, cIndex) => (
                    <td
                      key={cIndex}
                      className="border border-white/20 px-4 py-3 text-sm text-zinc-300"
                      dangerouslySetInnerHTML={{ __html: formatInline(row[cIndex] || "") }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    )
  }

  const renderContent = (content: string, sectionId: string) => {
    // Split content by code blocks first
    const parts = content.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        // Extract language and code
        const match = part.match(/```(\w+)?\n?([\s\S]*?)```/)
        const language = match?.[1] || "plaintext"
        const code = match?.[2]?.trim() || ""
        const codeId = `${sectionId}-${index}`
        
        return (
          <div key={index} className="my-4 rounded-lg overflow-hidden border border-white/10 bg-[#0d0d10]">
            <div className="flex items-center justify-between px-4 py-2 bg-black/50 border-b border-white/10">
              <span className="text-xs text-zinc-500 font-mono">{language}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyCode(code, codeId)}
                  className="text-xs text-zinc-500 hover:text-white transition flex items-center gap-1"
                >
                  {copiedCode === codeId ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
                {(language === "python" || language === "sql") && (
                  <Link
                    href={language === "python" ? "/python" : "/sql"}
                    className="text-xs text-zinc-500 hover:text-white transition flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Try it
                  </Link>
                )}
              </div>
            </div>
            <pre className="p-4 overflow-x-auto">
              <code className="text-sm font-mono text-zinc-200">{code}</code>
            </pre>
          </div>
        )
      }
      
      // Regular markdown-like content
      return (
        <div key={index} className="prose prose-invert prose-sm max-w-none">
          {part.split("\n\n").map((paragraph, pIndex) => {
            // Check if paragraph is a markdown table
            const lines = paragraph.trim().split("\n").filter(l => l.trim())
            const isTable = lines.length >= 2 && 
              lines[0].startsWith("|") && 
              lines.some(line => /^\|[\s\-:]+\|/.test(line))
            
            if (isTable) {
              const tableNode = parseMarkdownTable(paragraph, `${sectionId}-table-${index}-${pIndex}`)
              return tableNode || null
            }
            
            if (paragraph.startsWith("# ")) {
              const headerText = formatInline(paragraph.slice(2))
              return <h1 key={pIndex} className="text-2xl font-bold mt-6 mb-4" dangerouslySetInnerHTML={{ __html: headerText }} />
            }
            if (paragraph.startsWith("## ")) {
              const headerText = formatInline(paragraph.slice(3))
              return <h2 key={pIndex} className="text-xl font-semibold mt-5 mb-3" dangerouslySetInnerHTML={{ __html: headerText }} />
            }
            if (paragraph.startsWith("### ")) {
              const headerText = formatInline(paragraph.slice(4))
              return <h3 key={pIndex} className="text-lg font-medium mt-4 mb-2" dangerouslySetInnerHTML={{ __html: headerText }} />
            }
            if (paragraph.startsWith("- ") || paragraph.startsWith("* ")) {
              const items = paragraph.split("\n").filter(l => l.trim())
              return (
                <ul key={pIndex} className="list-disc list-inside space-y-1 my-3 text-zinc-300">
                  {items.map((item, iIndex) => {
                    const itemText = formatInline(item.replace(/^[-*]\s+/, ""))
                    return <li key={iIndex} dangerouslySetInnerHTML={{ __html: itemText }} />
                  })}
                </ul>
              )
            }
            if (paragraph.match(/^\d+\.\s/)) {
              const items = paragraph.split("\n").filter(l => l.trim())
              return (
                <ol key={pIndex} className="list-decimal list-inside space-y-1 my-3 text-zinc-300">
                  {items.map((item, iIndex) => {
                    const itemText = formatInline(item.replace(/^\d+\.\s+/, ""))
                    return <li key={iIndex} dangerouslySetInnerHTML={{ __html: itemText }} />
                  })}
                </ol>
              )
            }
            if (paragraph.startsWith("> ")) {
              const quoteText = formatInline(paragraph.slice(2))
              return (
                <blockquote key={pIndex} className="border-l-2 border-white/20 pl-4 py-2 my-3 text-zinc-400 italic" dangerouslySetInnerHTML={{ __html: quoteText }} />
              )
            }
            if (paragraph.trim()) {
              const formatted = formatInline(paragraph)
              return (
                <p 
                  key={pIndex} 
                  className="text-zinc-300 leading-relaxed my-3"
                  dangerouslySetInnerHTML={{ __html: formatted }}
                />
              )
            }
            return null
          })}
        </div>
      )
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-zinc-400 mb-2">Lesson not found</h2>
          <Link href="/lessons" className="text-sm text-zinc-500 hover:text-white transition">
            Back to lessons
          </Link>
        </div>
      </div>
    )
  }

  const currentSection = lesson.sections[activeSection]
  const isCurrentComplete = currentSection?.progress.status === "completed"
  const completedCount = lesson.sections.filter(s => s.progress.status === "completed").length
  const progressPercent = Math.round((completedCount / lesson.sections.length) * 100)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? "w-16" : "w-80"} border-r border-white/10 bg-[#0d0d0d] flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link
              href="/lessons"
              className={`flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition ${sidebarCollapsed ? "justify-center" : ""}`}
            >
              <ArrowLeft className="w-4 h-4" />
              {!sidebarCollapsed && <span>Back</span>}
            </Link>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 rotate-90" />}
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-1">
                {lesson.topic === "Python" ? (
                  <FileCode2 className="w-4 h-4 text-blue-400" />
                ) : lesson.topic === "SQL" || lesson.topic === "MySQL Python" ? (
                  <Database className="w-4 h-4 text-orange-400" />
                ) : (
                  <FileCode2 className="w-4 h-4 text-purple-400" />
                )}
                <span className="text-xs text-zinc-500">{lesson.topic}</span>
              </div>
              <h2 className="font-semibold">{lesson.title}</h2>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                  <span>Progress</span>
                  <span>{completedCount}/{lesson.sections.length}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-auto py-2">
          {lesson.sections.map((section, index) => {
            const isActive = index === activeSection
            const isComplete = section.progress.status === "completed"
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(index)}
                className={`w-full text-left px-4 py-3 transition flex items-center gap-3 ${
                  isActive
                    ? "bg-white/10 border-l-2 border-white"
                    : "hover:bg-white/5 border-l-2 border-transparent"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isComplete
                    ? "bg-emerald-500/20 text-emerald-400"
                    : isActive
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-zinc-500"
                }`}>
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${isActive ? "text-white" : "text-zinc-400"}`}>
                      {section.title}
                    </div>
                    <div className="text-[10px] text-zinc-600 capitalize flex items-center gap-1">
                      {sectionTypeIcons[section.type]}
                      {section.type}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Music Player */}
        {!sidebarCollapsed && <MusicPlayer />}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Content Header */}
        <div className="border-b border-white/10 bg-[#0d0d0d] px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${sectionTypeColors[currentSection?.type || "concept"]}`}>
                {sectionTypeIcons[currentSection?.type || "concept"]}
              </div>
              <div>
                <h1 className="text-xl font-semibold">{currentSection?.title}</h1>
                <p className="text-xs text-zinc-500 capitalize">
                  Section {activeSection + 1} of {lesson.sections.length} • {currentSection?.type}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isCurrentComplete ? (
                <span className="flex items-center gap-2 text-sm text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              ) : (
                <button
                  onClick={() => currentSection && markSectionComplete(currentSection.id)}
                  disabled={markingComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {markingComplete ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-8 py-8">
            {currentSection && renderContent(currentSection.content, currentSection.id)}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-white/10 bg-[#0d0d0d] px-8 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button
              onClick={() => activeSection > 0 && setActiveSection(activeSection - 1)}
              disabled={activeSection === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {lesson.sections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSection(index)}
                  className={`w-2 h-2 rounded-full transition ${
                    index === activeSection
                      ? "bg-white"
                      : lesson.sections[index].progress.status === "completed"
                      ? "bg-emerald-500"
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            {activeSection < lesson.sections.length - 1 ? (
              <button
                onClick={() => setActiveSection(activeSection + 1)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : lesson.navigation.next ? (
              <Link
                href={`/lessons/${lesson.navigation.next.slug}`}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition"
              >
                Next Lesson
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/lessons"
                className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-500 transition"
              >
                <GraduationCap className="w-4 h-4" />
                Complete!
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
