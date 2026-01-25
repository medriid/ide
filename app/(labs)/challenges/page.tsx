"use client"

import dynamic from "next/dynamic"
import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Package,
  Table2,
  Home,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  Code2,
  Terminal,
  RotateCcw,
  Sparkles,
  Target,
  ChevronLeft,
  Database,
  Filter,
  BarChart3,
  Zap,
  Plug,
  DatabaseZap,
  Workflow
} from "lucide-react"
import { topics, challenges, getChallengesByTopic, validateOutput, type Challenge, categories, getTopicsByCategory, type ChallengeCategory } from "@/lib/challenges"
import MusicPlayer from "@/components/MusicPlayer"

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false })

const topicIcons: Record<string, React.ReactNode> = {
  "FileText": <FileText className="w-5 h-5" />,
  "Package": <Package className="w-5 h-5" />,
  "Table2": <Table2 className="w-5 h-5" />,
  "Database": <Database className="w-5 h-5" />,
  "Filter": <Filter className="w-5 h-5" />,
  "BarChart3": <BarChart3 className="w-5 h-5" />,
  "Plug": <Plug className="w-5 h-5" />,
  "DatabaseZap": <DatabaseZap className="w-5 h-5" />,
  "Workflow": <Workflow className="w-5 h-5" />,
  "Code2": <Code2 className="w-5 h-5" />,
  "FileCode2": <Code2 className="w-5 h-5" />,
  "Layout": <Table2 className="w-5 h-5" />,
  "Component": <Code2 className="w-5 h-5" />,
}

const categoryIcons: Record<string, React.ReactNode> = {
  "FileText": <FileText className="w-4 h-4" />,
  "Database": <Database className="w-4 h-4" />,
  "Code2": <Code2 className="w-4 h-4" />,
  "FileCode2": <Code2 className="w-4 h-4" />,
}

const difficultyColors: Record<string, string> = {
  easy: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
  medium: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  hard: "text-red-400 bg-red-500/20 border-red-500/30"
}

export default function ChallengesPage() {
  const { status } = useSession()
  const router = useRouter()
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>("data-files")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [running, setRunning] = useState(false)
  const [validationResult, setValidationResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set())
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [xpNotification, setXpNotification] = useState<{ xp: number; levelUp: boolean } | null>(null)
  const consoleEndRef = useRef<HTMLDivElement>(null)

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  // Load completed challenges from server
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const res = await fetch("/api/challenges/complete", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          if (data.completedChallenges) {
            setCompletedChallenges(new Set(data.completedChallenges))
          }
        }
      } catch {
        // Fallback to localStorage if server fails
        const saved = localStorage.getItem("completedChallenges")
        if (saved) {
          setCompletedChallenges(new Set(JSON.parse(saved)))
        }
      }
    }
    
    if (status === "authenticated") {
      loadProgress()
    }
    
    // Select first topic of the current category by default
    const categoryTopics = getTopicsByCategory(selectedCategory)
    if (categoryTopics.length > 0 && !selectedTopic) {
      setSelectedTopic(categoryTopics[0].id)
    }
  }, [status, selectedCategory, selectedTopic])

  // Scroll to console end on output change
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [output])

  // Select a challenge
  const selectChallenge = async (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setOutput("")
    setValidationResult(null)
    setShowHints(false)
    setCurrentHintIndex(0)
    
    // Initialize challenge files (creates temporary data files)
    try {
      const res = await fetch("/api/challenges/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ challengeId: challenge.id })
      })
      
      if (res.ok) {
        const data = await res.json()
        setCode(data.code || challenge.starterCode)
      } else {
        // Fallback to starter code if init fails
        setCode(challenge.starterCode)
      }
    } catch {
      // Fallback to starter code if init fails
      setCode(challenge.starterCode)
    }
  }

  // Reset challenge
  const resetChallenge = () => {
    if (selectedChallenge) {
      setCode(selectedChallenge.starterCode)
      setOutput("")
      setValidationResult(null)
    }
  }

  // Run code - supports Python, SQL, and HTML challenges
  const runCode = async () => {
    if (!selectedChallenge) return
    
    setRunning(true)
    setOutput(selectedChallenge.type === "html" ? "Validating HTML...\n" : "Running code...\n")
    setValidationResult(null)
    setXpNotification(null)

    try {
      let result = ""
      
      if (selectedChallenge.type === "html") {
        // HTML challenge - validate HTML code directly
        result = code // Use the HTML code as the output for validation
      } else if (selectedChallenge.type === "sql") {
        // SQL challenge - use SQL execute API
        const res = await fetch("/api/sql/execute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sql: code })
        })
        
        const data = await res.json()
        
        if (res.ok && data?.ok) {
          // Format SQL results as table
          if (Array.isArray(data.rows)) {
            if (data.rows.length === 0) {
              result = "Query executed successfully. No rows returned."
            } else {
              // Format as table
              const columns = Object.keys(data.rows[0])
              const header = columns.join(" | ")
              const separator = columns.map(() => "---").join(" | ")
              const rows = data.rows.map((row: Record<string, unknown>) => 
                columns.map(col => String(row[col] ?? "NULL")).join(" | ")
              ).join("\n")
              result = `${header}\n${separator}\n${rows}`
            }
          } else {
            result = JSON.stringify(data.rows, null, 2)
          }
        } else {
          result = `Error: ${data?.error || res.statusText}`
        }
      } else if (selectedChallenge.type === "python-sql") {
        // Python with MySQL connector challenge - use SQL execute Python API
        const res = await fetch("/api/sql/execute-python", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ code })
        })
        
        const data = await res.json()
        
        if (res.ok && data?.ok) {
          // API returns 'output' not 'stdout'
          result = data.output || data.stdout || ""
        } else {
          result = `Error: ${data?.error || res.statusText}`
        }
      } else {
        // Python challenge - use Python execute API with correct path
        const res = await fetch("/api/python/execute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            path: "python/challenge.py", 
            code,
            stdin: undefined 
          })
        })
        
        const data = await res.json()
        
        if (res.ok && data?.ok) {
          result = (data.stdout || "") + (data.stderr ? `\n${data.stderr}` : "")
        } else {
          result = `Error: ${data?.error || res.statusText}`
        }
      }
      
      setOutput(result)
      
      // Validate the output
      const validation = validateOutput(selectedChallenge, result)
      setValidationResult(validation)
      
      if (validation.success) {
        // Mark challenge as completed and award XP via API
        try {
          const completeRes = await fetch("/api/challenges/complete", {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ challengeId: selectedChallenge.id })
          })
          
          const completeData = await completeRes.json()
          
          if (completeData.ok) {
            const newCompleted = new Set(completedChallenges)
            newCompleted.add(selectedChallenge.id)
            setCompletedChallenges(newCompleted)
            
            // Show XP notification if XP was awarded
            if (completeData.xpAwarded > 0) {
              setXpNotification({
                xp: completeData.xpAwarded,
                levelUp: completeData.leveledUp || false
              })
              // Hide notification after 3 seconds
              setTimeout(() => setXpNotification(null), 3000)
            }
          }
        } catch {
          // Still mark as completed locally even if API fails
          const newCompleted = new Set(completedChallenges)
          newCompleted.add(selectedChallenge.id)
          setCompletedChallenges(newCompleted)
          localStorage.setItem("completedChallenges", JSON.stringify([...newCompleted]))
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e)
      setOutput(`Error: ${errMsg}`)
      setValidationResult({ success: false, message: "Failed to execute code." })
    } finally {
      setRunning(false)
    }
  }

  // Show next hint
  const showNextHint = () => {
    if (selectedChallenge && currentHintIndex < selectedChallenge.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1)
    }
  }

  // Get current topic's challenges
  const currentTopicChallenges = selectedTopic ? getChallengesByTopic(selectedTopic) : []
  const currentTopic = topics.find(t => t.id === selectedTopic)

  // Stats
  const totalChallenges = challenges.length
  const completedCount = completedChallenges.size
  const currentTopicCompleted = currentTopicChallenges.filter(c => completedChallenges.has(c.id)).length

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/70 backdrop-blur px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-semibold hover:text-zinc-300 transition group"
          >
            <Target className="h-4 w-4" />
            <span>Challenges</span>
            <Home className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition text-zinc-400" />
          </Link>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-[11px] px-3 py-1 rounded-full border border-white/10 bg-white/5">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-zinc-400">{completedCount}/{totalChallenges} completed</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {selectedChallenge && (
            <>
              <button
                onClick={resetChallenge}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
              <button
                onClick={runCode}
                disabled={running}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-lg border border-white/20 bg-white/10 hover:bg-white hover:text-black transition disabled:opacity-50 font-medium"
              >
                {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                <span>{running ? "Running..." : "Run Code"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Topics & Challenges */}
        <div className={`border-r border-white/10 bg-black/60 backdrop-blur flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-12' : 'w-72'}`}>
          {/* Collapse button */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute z-10 -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-black/80 border border-white/10 rounded-r-lg flex items-center justify-center hover:bg-white/10 transition"
            style={{ marginLeft: sidebarCollapsed ? '48px' : '288px' }}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
          
          {!sidebarCollapsed && (
            <>
              {/* Category Tabs */}
              <div className="border-b border-white/10 p-2">
                <div className="flex gap-1">
                  {categories.map(cat => {
                    const catTopics = getTopicsByCategory(cat.id)
                    const catChallenges = catTopics.flatMap(t => getChallengesByTopic(t.id))
                    const catCompleted = catChallenges.filter(c => completedChallenges.has(c.id)).length
                    
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id)
                          const firstTopic = getTopicsByCategory(cat.id)[0]
                          if (firstTopic) setSelectedTopic(firstTopic.id)
                          setSelectedChallenge(null)
                        }}
                        className={`flex-1 px-2 py-2 rounded-lg text-center transition border ${
                          selectedCategory === cat.id
                            ? `bg-gradient-to-br ${cat.color} text-white border-white/20`
                            : "bg-white/5 border-transparent text-zinc-500 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {categoryIcons[cat.icon]}
                          <span className="text-[10px] font-medium leading-tight">{cat.name}</span>
                          <span className={`text-[8px] px-1 py-0.5 rounded ${
                            catCompleted === catChallenges.length && catChallenges.length > 0
                              ? 'bg-emerald-500/30 text-emerald-400' 
                              : 'bg-white/10 text-zinc-500'
                          }`}>
                            {catCompleted}/{catChallenges.length}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Topics for selected category */}
              <div className="border-b border-white/10 p-3">
                <div className="text-[11px] uppercase tracking-[0.15em] text-zinc-500 mb-3 font-semibold">
                  {categories.find(c => c.id === selectedCategory)?.name} Topics
                </div>
                <div className="space-y-1.5">
                  {getTopicsByCategory(selectedCategory).map(topic => {
                    const topicChallenges = getChallengesByTopic(topic.id)
                    const topicCompleted = topicChallenges.filter(c => completedChallenges.has(c.id)).length
                    
                    return (
                      <button
                        key={topic.id}
                        onClick={() => {
                          setSelectedTopic(topic.id)
                          setSelectedChallenge(null)
                        }}
                        className={`w-full text-left p-3 rounded-lg transition border ${
                          selectedTopic === topic.id
                            ? `bg-gradient-to-br ${topic.color} text-white`
                            : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {topicIcons[topic.icon]}
                          <span className="text-sm font-medium">{topic.name}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-zinc-500">{topic.description.slice(0, 30)}...</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${topicCompleted === topicChallenges.length ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-zinc-400'}`}>
                            {topicCompleted}/{topicChallenges.length}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Challenges List */}
              <div className="flex-1 overflow-auto p-3">
                <div className="text-[11px] uppercase tracking-[0.15em] text-zinc-500 mb-3 font-semibold flex items-center justify-between">
                  <span>Challenges</span>
                  {currentTopic && (
                    <span className={currentTopic.accent}>{currentTopicCompleted}/{currentTopicChallenges.length}</span>
                  )}
                </div>
                
                {currentTopicChallenges.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 text-sm">
                    Select a topic to view challenges
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentTopicChallenges.map((challenge, index) => {
                      const isCompleted = completedChallenges.has(challenge.id)
                      const isSelected = selectedChallenge?.id === challenge.id
                      
                      return (
                        <button
                          key={challenge.id}
                          onClick={() => selectChallenge(challenge)}
                          className={`w-full text-left p-3 rounded-lg transition border group ${
                            isSelected
                              ? "bg-white/10 border-white/30"
                              : isCompleted
                              ? "bg-emerald-950/30 border-emerald-500/20 hover:border-emerald-500/40"
                              : "bg-white/5 border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                              isCompleted
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-white/10 text-zinc-500"
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium group-hover:text-white transition truncate">
                                {challenge.title}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${difficultyColors[challenge.difficulty]}`}>
                                  {challenge.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Music Player */}
              <MusicPlayer />
            </>
          )}
        </div>

        {/* Main Content Area */}
        {!selectedChallenge ? (
          /* No challenge selected - show welcome */
          <div className="flex-1 flex items-center justify-center bg-[#0d0d10]">
            <div className="text-center max-w-lg">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-zinc-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Coding Challenges</h2>
              <p className="text-zinc-500 mb-6">
                Practice Python file handling and MySQL queries. 
                Complete challenges to earn XP and track your progress!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {topics.slice(0, 4).map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      selectedTopic === topic.id
                        ? `bg-gradient-to-br ${topic.color}`
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Challenge workspace */
          <div className="flex-1 flex relative">
            {/* XP Notification */}
            {xpNotification && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-400">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">+{xpNotification.xp} XP</span>
                  {xpNotification.levelUp && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs inline-flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Level Up!
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Left - Code Editor */}
            <div className="flex-1 flex flex-col bg-[#0d0d10] border-r border-white/10">
              <div className="border-b border-white/10 px-4 py-2 flex items-center justify-between bg-black/50">
                <div className="flex items-center gap-2">
                  {selectedChallenge.type === "sql" ? (
                    <Database className="h-4 w-4 text-emerald-400" />
                  ) : selectedChallenge.type === "python-sql" ? (
                    <DatabaseZap className="h-4 w-4 text-violet-400" />
                  ) : selectedChallenge.type === "html" ? (
                    <Code2 className="h-4 w-4 text-pink-400" />
                  ) : (
                    <Code2 className="h-4 w-4 text-blue-400" />
                  )}
                  <span className="text-sm font-mono text-zinc-300">
                    {selectedChallenge.type === "sql" ? "query.sql" : selectedChallenge.type === "python-sql" ? "mysql_connector.py" : selectedChallenge.type === "html" ? "index.html" : "challenge.py"}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    selectedChallenge.type === "sql" 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : selectedChallenge.type === "python-sql"
                      ? "bg-violet-500/20 text-violet-400"
                      : selectedChallenge.type === "html"
                      ? "bg-pink-500/20 text-pink-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}>
                    {selectedChallenge.type === "sql" ? "MySQL" : selectedChallenge.type === "python-sql" ? "Python + MySQL" : selectedChallenge.type === "html" ? "HTML + Tailwind" : "Python"}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-500">Press Ctrl+Enter to {selectedChallenge.type === "html" ? "validate" : "run"}</div>
              </div>
              <div className="flex-1">
                <Monaco
                  height="100%"
                  language={selectedChallenge.type === "sql" ? "sql" : selectedChallenge.type === "html" ? "html" : "python"} // python-sql uses python syntax
                  theme="vs-dark"
                  value={code}
                  onChange={v => setCode(v || "")}
                  onMount={(editor) => {
                    // Add Ctrl+Enter shortcut
                    editor.addAction({
                      id: "run-code",
                      label: "Run Code",
                      keybindings: [2048 + 3], // Ctrl+Enter
                      run: () => runCode()
                    })
                  }}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    smoothScrolling: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    fontFamily: "'Cascadia Code', 'Consolas', 'Courier New', monospace",
                    lineHeight: 22,
                    padding: { top: 12, bottom: 12 },
                    automaticLayout: true
                  }}
                />
              </div>
            </div>

            {/* Right - Challenge Info & Output */}
            <div className="w-[480px] flex flex-col bg-[#0a0a0c]">
              {/* Challenge Info */}
              <div className="border-b border-white/10 p-4 overflow-auto" style={{ maxHeight: '45%' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold">{selectedChallenge.title}</h2>
                      {completedChallenges.has(selectedChallenge.id) && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${difficultyColors[selectedChallenge.difficulty]}`}>
                        {selectedChallenge.difficulty}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {selectedChallenge.difficulty === "easy" ? "25" : selectedChallenge.difficulty === "medium" ? "40" : "60"} XP
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-zinc-400 mb-4">{selectedChallenge.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-2">
                    <Target className="h-3.5 w-3.5" />
                    Instructions
                  </div>
                  <ul className="space-y-1.5">
                    {selectedChallenge.instructions.map((instruction, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                        <span className="text-zinc-600 shrink-0">{i + 1}.</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hints Section */}
                <div className="border-t border-white/10 pt-3">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="flex items-center gap-2 text-xs text-amber-400 hover:text-amber-300 transition"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    {showHints ? "Hide Hints" : "Need a hint?"}
                    {showHints ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                  
                  {showHints && (
                    <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      {selectedChallenge.hints.slice(0, currentHintIndex + 1).map((hint, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-amber-200/80 mb-2 last:mb-0">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{hint}</span>
                        </div>
                      ))}
                      {currentHintIndex < selectedChallenge.hints.length - 1 && (
                        <button
                          onClick={showNextHint}
                          className="text-[10px] text-amber-400 hover:text-amber-300 mt-2"
                        >
                          Show another hint ({currentHintIndex + 1}/{selectedChallenge.hints.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Output Panel */}
              <div className="flex-1 flex flex-col border-t border-white/10">
                {selectedChallenge.type === "html" ? (
                  <>
                    {/* HTML Preview */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/50">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-pink-400" />
                          <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Preview</span>
                        </div>
                      </div>
                      <div className="flex-1 bg-white overflow-auto">
                        <iframe
                          srcDoc={code}
                          className="w-full h-full border-0"
                          title="HTML Preview"
                          sandbox="allow-same-origin allow-scripts"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/50">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-zinc-400" />
                        <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Output</span>
                        {running && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse">
                            Running...
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setOutput("")}
                        className="text-xs text-zinc-500 hover:text-white transition"
                      >
                        Clear
                      </button>
                    </div>
                    
                    <div className="flex-1 p-3 font-mono text-sm bg-[#0d0d10] overflow-auto">
                      {output ? (
                        <pre className="whitespace-pre-wrap text-zinc-100">{output}</pre>
                      ) : (
                        <div className="text-zinc-600 text-sm">
                          Click &quot;Run Code&quot; or press Ctrl+Enter to execute your code...
                        </div>
                      )}
                      <div ref={consoleEndRef} />
                    </div>
                  </>
                )}

                {/* Validation Result */}
                {validationResult && (
                  <div className={`p-4 border-t ${
                    validationResult.success
                      ? "bg-emerald-950/50 border-emerald-500/30"
                      : "bg-red-950/30 border-red-500/30"
                  }`}>
                    <div className="flex items-center gap-2">
                      {validationResult.success ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <div>
                            <div className="text-sm font-semibold text-emerald-400">Challenge Completed!</div>
                            <div className="text-xs text-emerald-300/70">{validationResult.message}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-400" />
                          <div>
                            <div className="text-sm font-semibold text-red-400">Not Quite Right</div>
                            <div className="text-xs text-red-300/70">{validationResult.message}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
