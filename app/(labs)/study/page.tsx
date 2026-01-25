"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckSquare, 
  FileText, 
  Plus, 
  Trash2,
  Save,
  Loader2,
  Coffee,
  Timer,
  Image as ImageIcon
} from "lucide-react"
import MusicPlayer from "@/components/MusicPlayer"

type ChecklistItem = {
  id: string
  text: string
  checked: boolean
}

type StudyNote = {
  id: string
  title: string
  content: string
  tags?: string
  createdAt: string
  updatedAt: string
}

export default function StudyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [view, setView] = useState<"timer" | "notes">("timer")
  const [timerMode, setTimerMode] = useState<"normal" | "pomodoro">("normal")
  const [time, setTime] = useState(0) // in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroSession, setPomodoroSession] = useState<"work" | "break">("work")
  const [pomodoroWorkDuration, setPomodoroWorkDuration] = useState(25 * 60) // 25 minutes in seconds
  const [pomodoroBreakDuration, setPomodoroBreakDuration] = useState(5 * 60) // 5 minutes in seconds
  const [pomodoroTargetTime, setPomodoroTargetTime] = useState(25 * 60) // Target time for current session
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [newItemText, setNewItemText] = useState("")
  const [notes, setNotes] = useState<StudyNote[]>([])
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null)
  const [noteTitle, setNoteTitle] = useState("")
  const [noteContent, setNoteContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const selectionRef = useRef<{ start: number; end: number } | null>(null)
  const isEditingRef = useRef(false)
  const lastNoteIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      loadChecklist()
      loadNotes()
      setLoading(false)
    }
  }, [status])

  // Update editor content when selecting a different note
  useEffect(() => {
    if (selectedNote && editorRef.current && lastNoteIdRef.current !== selectedNote.id) {
      editorRef.current.innerHTML = selectedNote.content
      lastNoteIdRef.current = selectedNote.id
      isEditingRef.current = false
    }
  }, [selectedNote?.id])

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          const newTime = prev + 1
          
          // Pomodoro mode: check if target time reached
          if (timerMode === "pomodoro" && newTime >= pomodoroTargetTime) {
            // Timer completed - switch session or notify
            setIsRunning(false)
            
            // Request notification permission if not already granted
            if ("Notification" in window && Notification.permission === "default") {
              Notification.requestPermission()
            }
            
            // Show notification
            if ("Notification" in window && Notification.permission === "granted") {
              const message = pomodoroSession === "work" 
                ? "Work session complete! Time for a break."
                : "Break over! Ready to get back to work?"
              new Notification(message)
            }
            
            // Switch session
            if (pomodoroSession === "work") {
              setPomodoroSession("break")
              setPomodoroTargetTime(pomodoroBreakDuration)
            } else {
              setPomodoroSession("work")
              setPomodoroTargetTime(pomodoroWorkDuration)
            }
            
            return 0 // Reset time for next session
          }
          
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timerMode, pomodoroTargetTime, pomodoroSession, pomodoroBreakDuration, pomodoroWorkDuration])

  const resetPomodoro = () => {
    setIsRunning(false)
    setPomodoroSession("work")
    setPomodoroTargetTime(pomodoroWorkDuration)
    setTime(0)
  }

  // Reset time when session changes
  useEffect(() => {
    if (timerMode === "pomodoro") {
      setTime(0)
    }
  }, [pomodoroSession, timerMode])

  const switchTimerMode = (mode: "normal" | "pomodoro") => {
    setTimerMode(mode)
    setIsRunning(false)
    if (mode === "pomodoro") {
      setPomodoroSession("work")
      setPomodoroTargetTime(pomodoroWorkDuration)
      setTime(0)
    } else {
      setTime(0)
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const formatPomodoroTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  // Calculate progress for circular timer
  const getTimerProgress = () => {
    if (timerMode === "pomodoro") {
      // For Pomodoro: fill up based on current session progress
      return pomodoroTargetTime > 0 ? time / pomodoroTargetTime : 0
    } else {
      // Normal mode: fills up over 1 hour, then fills out over next hour
      const twoHoursInSeconds = 7200
      const progress = (time % twoHoursInSeconds) / twoHoursInSeconds
      if (progress <= 0.5) {
        return progress * 2 // 0 to 1 over first hour
      } else {
        return 2 - (progress * 2) // 1 to 0 over second hour
      }
    }
  }

  const loadChecklist = async () => {
    try {
      const res = await fetch("/api/study/checklist", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        if (data.items) {
          setChecklistItems(data.items)
        }
      }
    } catch (error) {
      console.error("Failed to load checklist", error)
    }
  }

  const saveChecklist = async () => {
    try {
      await fetch("/api/study/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: checklistItems })
      })
    } catch (error) {
      console.error("Failed to save checklist", error)
    }
  }

  const loadNotes = async () => {
    try {
      const res = await fetch("/api/study/notes", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error("Failed to load notes", error)
    }
  }

  const createNote = async () => {
    try {
      const res = await fetch("/api/study/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: "Untitled Note",
          content: ""
        })
      })
      if (res.ok) {
        const note = await res.json()
        setNotes(prev => [note, ...prev])
        setSelectedNote(note)
        setNoteTitle(note.title)
        setNoteContent(note.content)
      }
    } catch (error) {
      console.error("Failed to create note", error)
    }
  }

  const saveNote = async (showSaving = true) => {
    if (!selectedNote) return
    if (showSaving) setSaving(true)
    try {
      const res = await fetch(`/api/study/notes/${selectedNote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: noteTitle,
          content: noteContent
        })
      })
      if (res.ok) {
        const updated = await res.json()
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n))
        setSelectedNote(updated)
      }
    } catch (error) {
      console.error("Failed to save note", error)
    } finally {
      if (showSaving) setSaving(false)
    }
  }

  // Auto-save after 2 seconds of inactivity
  const handleContentChange = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(false) // Auto-save without showing saving indicator
    }, 2000)
  }

  const deleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/study/notes/${noteId}`, {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== noteId))
        if (selectedNote?.id === noteId) {
          setSelectedNote(null)
          setNoteTitle("")
          setNoteContent("")
        }
      }
    } catch (error) {
      console.error("Failed to delete note", error)
    }
  }

  const addChecklistItem = () => {
    if (!newItemText.trim()) return
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      checked: false
    }
    setChecklistItems(prev => [...prev, newItem])
    setNewItemText("")
    setTimeout(saveChecklist, 500) // Auto-save after 500ms
  }

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
    setTimeout(saveChecklist, 500)
  }

  const removeChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id))
    setTimeout(saveChecklist, 500)
  }

  const selectNote = (note: StudyNote) => {
    setSelectedNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
  }

  // Rich text editor commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      execCommand("insertImage", url)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Side - Timer or Notes List */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-black/30">
        {/* View Toggle */}
        <div className="p-5 border-b border-white/10">
          <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
            <button
              onClick={() => setView("timer")}
              className={`flex-1 py-2.5 px-3 rounded text-sm font-medium transition ${
                view === "timer"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Timer
              </div>
            </button>
            <button
              onClick={() => setView("notes")}
              className={`flex-1 py-2.5 px-3 rounded text-sm font-medium transition ${
                view === "notes"
                  ? "bg-white text-black shadow-lg"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </div>
            </button>
          </div>
        </div>

        {/* Timer View */}
        {view === "timer" && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            {/* Timer Mode Toggle */}
            <div className="mb-6 w-full max-w-xs">
              <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                <button
                  onClick={() => switchTimerMode("normal")}
                  className={`flex-1 py-2 px-3 rounded text-xs font-medium transition ${
                    timerMode === "normal"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Normal
                  </div>
                </button>
                <button
                  onClick={() => switchTimerMode("pomodoro")}
                  className={`flex-1 py-2 px-3 rounded text-xs font-medium transition ${
                    timerMode === "pomodoro"
                      ? "bg-white text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" />
                    Pomodoro
                  </div>
                </button>
              </div>
            </div>

            {/* Pomodoro Session Indicator */}
            {timerMode === "pomodoro" && (
              <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                {pomodoroSession === "work" ? (
                  <>
                    <Timer className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">Work Session</span>
                  </>
                ) : (
                  <>
                    <Coffee className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">Break Time</span>
                  </>
                )}
              </div>
            )}

            {/* Circular Progress Timer */}
            <div className="relative mb-8">
              <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke={timerMode === "pomodoro" && pomodoroSession === "break" ? "#60a5fa" : "white"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  strokeDashoffset={`${2 * Math.PI * 85 * (1 - getTimerProgress())}`}
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              {/* Time display in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {timerMode === "pomodoro" ? (
                  <>
                    <div className="text-5xl font-mono font-bold">
                      {formatPomodoroTime(pomodoroTargetTime - time)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {formatPomodoroTime(pomodoroTargetTime)}
                    </div>
                  </>
                ) : (
                  <div className="text-4xl font-mono font-bold">
                    {formatTime(time)}
                  </div>
                )}
              </div>
            </div>

            {/* Pomodoro Settings */}
            {timerMode === "pomodoro" && !isRunning && (
              <div className="mb-6 w-full max-w-xs space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-400 w-20">Work:</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={Math.floor(pomodoroWorkDuration / 60)}
                    onChange={(e) => {
                      const mins = parseInt(e.target.value) || 25
                      setPomodoroWorkDuration(mins * 60)
                      if (pomodoroSession === "work") {
                        setPomodoroTargetTime(mins * 60)
                        setTime(0)
                      }
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/20"
                  />
                  <span className="text-xs text-zinc-500">min</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-zinc-400 w-20">Break:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={Math.floor(pomodoroBreakDuration / 60)}
                    onChange={(e) => {
                      const mins = parseInt(e.target.value) || 5
                      setPomodoroBreakDuration(mins * 60)
                      if (pomodoroSession === "break") {
                        setPomodoroTargetTime(mins * 60)
                        setTime(0)
                      }
                    }}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/20"
                  />
                  <span className="text-xs text-zinc-500">min</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (timerMode === "pomodoro") {
                    resetPomodoro()
                  } else {
                    setIsRunning(false)
                    setTime(0)
                  }
                }}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg font-medium hover:bg-white/20 transition flex items-center gap-2"
              >
                <Square className="w-5 h-5" />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Notes List View */}
        {view === "notes" && (
          <div className="flex-1 overflow-auto">
            <div className="p-5">
              <button
                onClick={createNote}
                className="w-full py-3 px-4 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition flex items-center justify-center gap-2 mb-6 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
              
              {notes.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No notes yet. Create your first note!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note)}
                      className={`p-4 rounded-lg cursor-pointer transition border ${
                        selectedNote?.id === note.id
                          ? "bg-white/10 border-white/30 shadow-lg"
                          : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <div className="font-medium text-sm mb-2 truncate">
                        {note.title || "Untitled"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Music Player */}
        <MusicPlayer />
      </div>

      {/* Right Side - Checklist or Note Editor */}
      <div className="flex-1 flex flex-col bg-black/50">
        {view === "timer" ? (
          // Checklist View
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <CheckSquare className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-semibold">Study Checklist</h2>
              </div>

              {/* Add Item */}
              <div className="flex gap-3 mb-8">
                <input
                  type="text"
                  placeholder="Add a task..."
                  value={newItemText}
                  onChange={e => setNewItemText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      addChecklistItem()
                    }
                  }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                />
                <button
                  onClick={addChecklistItem}
                  className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition"
                >
                  Add
                </button>
              </div>

              {/* Checklist Items */}
              {checklistItems.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Your checklist is empty. Add tasks to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {checklistItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition border border-transparent hover:border-white/10"
                    >
                      <button
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                          item.checked
                            ? "bg-white border-white"
                            : "border-white/30 hover:border-white/50"
                        }`}
                      >
                        {item.checked && (
                          <CheckSquare className="w-4 h-4 text-black" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          item.checked
                            ? "line-through text-zinc-500"
                            : "text-white"
                        }`}
                      >
                        {item.text}
                      </span>
                      <button
                        onClick={() => removeChecklistItem(item.id)}
                        className="p-2 hover:bg-white/10 rounded transition"
                      >
                        <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Note Editor View
          <div className="flex-1 flex flex-col">
            {selectedNote ? (
              <>
                {/* Toolbar */}
                <div className="border-b border-white/10 p-4 bg-black/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => execCommand("bold")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm font-bold"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      onClick={() => execCommand("italic")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm italic"
                      title="Italic"
                    >
                      I
                    </button>
                    <button
                      onClick={() => execCommand("underline")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm underline"
                      title="Underline"
                    >
                      U
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <button
                      onClick={() => execCommand("formatBlock", "h1")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm"
                      title="Heading 1"
                    >
                      H1
                    </button>
                    <button
                      onClick={() => execCommand("formatBlock", "h2")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm"
                      title="Heading 2"
                    >
                      H2
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <button
                      onClick={() => execCommand("insertUnorderedList")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm"
                      title="Bullet List"
                    >
                      •
                    </button>
                    <button
                      onClick={() => execCommand("insertOrderedList")}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm"
                      title="Numbered List"
                    >
                      1.
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-1" />
                    <button
                      onClick={insertImage}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-sm"
                      title="Insert Image"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <div className="flex-1" />
                    {saving && (
                      <div className="text-xs text-zinc-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Saving...
                      </div>
                    )}
                    <button
                      onClick={() => saveNote(true)}
                      disabled={saving}
                      className="px-4 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Note Editor */}
                <div className="flex-1 overflow-auto p-8">
                  <div className="max-w-4xl mx-auto">
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={e => {
                        setNoteTitle(e.target.value)
                        handleContentChange()
                      }}
                      placeholder="Note title..."
                      className="w-full bg-transparent text-3xl font-bold mb-6 focus:outline-none placeholder-zinc-600 pb-3 border-b border-white/10 focus:border-white/20 transition"
                    />
                    <div
                      ref={editorRef}
                      contentEditable
                      onKeyDown={(e) => {
                        // Mark as editing when user types
                        isEditingRef.current = true
                      }}
                      onInput={(e) => {
                        isEditingRef.current = true
                        const newContent = e.currentTarget.innerHTML
                        // Update state but don't let React reset the innerHTML
                        if (newContent !== noteContent) {
                          setNoteContent(newContent)
                          handleContentChange()
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault()
                        const text = e.clipboardData.getData("text/plain")
                        const html = e.clipboardData.getData("text/html")
                        const selection = window.getSelection()
                        if (!selection?.rangeCount) return
                        
                        const range = selection.getRangeAt(0)
                        range.deleteContents()
                        
                        if (html) {
                          const tempDiv = document.createElement("div")
                          tempDiv.innerHTML = html
                          const fragment = document.createDocumentFragment()
                          while (tempDiv.firstChild) {
                            fragment.appendChild(tempDiv.firstChild)
                          }
                          range.insertNode(fragment)
                        } else {
                          const textNode = document.createTextNode(text)
                          range.insertNode(textNode)
                        }
                        
                        selection.collapseToEnd()
                        setNoteContent(editorRef.current?.innerHTML || "")
                        handleContentChange()
                      }}
                      className="min-h-[500px] bg-white/5 rounded-lg p-8 focus:outline-none focus:ring-2 focus:ring-white/20 transition"
                      style={{
                        color: "white",
                        lineHeight: "1.6",
                        wordWrap: "break-word",
                        overflowWrap: "break-word"
                      }}
                      suppressContentEditableWarning={true}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-zinc-400 mb-2">Select a note</h2>
                  <p className="text-sm text-zinc-600 mb-4">Choose a note from the sidebar or create a new one</p>
                  <button
                    onClick={createNote}
                    className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition"
                  >
                    Create Note
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
