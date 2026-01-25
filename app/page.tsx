"use client"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import { BookOpen, Trophy, Folder, FileText, Plus, X, Loader2, GitBranch, Network, Lock, Unlock } from "lucide-react"
import LetterGlitch from "@/components/LetterGlitch"
import MusicPlayer from "@/components/MusicPlayer"
import LevelProgressBar from "@/components/LevelProgressBar"
import { useTheme } from "@/lib/theme-context"

// ============================================
// INVITE CODE SYSTEM TOGGLE
// Must match the value in /api/auth/register/route.ts
// Set to false to show invite code controls for owner
// Set to true to hide invite code controls (system disabled)
// ============================================
const INVITE_CODE_DISABLED = false

export default function Home() {
  const { data: session } = useSession()
  const theme = useTheme()
  const user = session?.user as any
  const username = user?.username || user?.email?.split("@")[0]
  const isOwner = user?.role === "owner"
  
  const [showInviteCode, setShowInviteCode] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [loadingCode, setLoadingCode] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)
  const [githubUsername, setGithubUsername] = useState<string | null>(null)
  const [githubRepoUsername, setGithubRepoUsername] = useState("")
  const [loadingGithub, setLoadingGithub] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDesc, setNewProjectDesc] = useState("")
  const [createAsGithubRepo, setCreateAsGithubRepo] = useState(false)
  const [githubRepoName, setGithubRepoName] = useState("")
  const [checkingRepo, setCheckingRepo] = useState(false)
  const [repoExists, setRepoExists] = useState<boolean | null>(null)
  const [pullFromRepo, setPullFromRepo] = useState(false)
  const [pullOwner, setPullOwner] = useState("")
  const [pullRepo, setPullRepo] = useState("")
  const [pullBranch, setPullBranch] = useState("main")
  const [pullingRepo, setPullingRepo] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinValue, setPinValue] = useState("")
  
  const bgColor = theme.customBackgroundColor || "#000000"
  const cardColor = theme.customCardColor || "rgba(0, 0, 0, 0.5)"
  const layoutColor = theme.customLayoutColor || "#ffffff"
  
  const fetchInviteCode = async () => {
    setLoadingCode(true)
    try {
      const res = await fetch("/api/invite-code")
      if (res.ok) {
        const data = await res.json()
        setInviteCode(data.code)
        setShowInviteCode(true)
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingCode(false)
  }
  
  const generateNewCode = async () => {
    setLoadingCode(true)
    try {
      const res = await fetch("/api/invite-code", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        setInviteCode(data.code)
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingCode(false)
  }

  const checkGithubConnection = async () => {
    if (!session) return
    setLoadingGithub(true)
    try {
      const res = await fetch("/api/github/connection")
      if (res.ok) {
        const data = await res.json()
        setGithubConnected(data.connected)
        setGithubUsername(data.githubUsername)
        if (data.connected) {
          await loadProjects()
        }
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingGithub(false)
  }

  const disconnectGithub = async () => {
    setLoadingGithub(true)
    try {
      const res = await fetch("/api/github/connection", { method: "DELETE" })
      if (res.ok) {
        setGithubConnected(false)
        setGithubUsername(null)
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingGithub(false)
  }

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/medium-ide/projects", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0])
        }
      }
    } catch (error) {
      console.error("Failed to load projects:", error)
    }
  }

  const checkRepoExists = async () => {
    if (!githubRepoUsername.trim() || !githubRepoName.trim()) {
      setRepoExists(null)
      return
    }

    setCheckingRepo(true)
    try {
      const res = await fetch(`/api/github/repos/${githubRepoUsername.trim()}/${githubRepoName.trim()}/exists`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setRepoExists(data.exists)
      } else {
        setRepoExists(null)
      }
    } catch (error) {
      console.error("Failed to check repo:", error)
      setRepoExists(null)
    } finally {
      setCheckingRepo(false)
    }
  }

  useEffect(() => {
    if (createAsGithubRepo && githubRepoUsername.trim() && githubRepoName.trim()) {
      const timeoutId = setTimeout(() => {
        checkRepoExists()
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setRepoExists(null)
    }
  }, [githubRepoUsername, githubRepoName, createAsGithubRepo])

  useEffect(() => {
    if (githubConnected && githubUsername && !githubRepoUsername) {
      setGithubRepoUsername(githubUsername)
    }
  }, [githubConnected, githubUsername])

  const createProject = async () => {
    if (!newProjectName.trim()) return
    if (createAsGithubRepo && (!githubRepoUsername.trim() || !githubRepoName.trim())) {
      alert("Please provide GitHub username and repository name")
      return
    }
    if (createAsGithubRepo && repoExists) {
      alert("Repository already exists. Please choose a different name.")
      return
    }
    if (pullFromRepo && (!pullOwner.trim() || !pullRepo.trim())) {
      alert("Please provide repository owner and name")
      return
    }

    setPullingRepo(true)
    try {
      const res = await fetch("/api/medium-ide/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim() || null,
          createAsGithubRepo: createAsGithubRepo,
          githubOwner: createAsGithubRepo ? githubRepoUsername.trim() : null,
          githubRepo: createAsGithubRepo ? githubRepoName.trim() : null,
          pullFromRepo: pullFromRepo,
          pullOwner: pullOwner.trim(),
          pullRepo: pullRepo.trim(),
          pullBranch: pullBranch.trim() || "main"
        })
      })

      if (res.ok) {
        const project = await res.json()
        setProjects(prev => [...prev, project])
        setSelectedProject(project)
        setShowNewProjectModal(false)
        setNewProjectName("")
        setNewProjectDesc("")
        setCreateAsGithubRepo(false)
        setGithubRepoUsername("")
        setGithubRepoName("")
        setRepoExists(null)
        setPullFromRepo(false)
        setPullOwner("")
        setPullRepo("")
        setPullBranch("main")
        await loadProjects()
        // Navigate to IDE
        window.location.href = `/medium-ide?project=${project.id}`
      } else {
        const data = await res.json()
        alert(data.error || "Failed to create project")
      }
    } catch (error) {
      console.error("Failed to create project:", error)
      alert("Failed to create project")
    } finally {
      setPullingRepo(false)
    }
  }

  const loadPinStatus = async () => {
    try {
      const res = await fetch("/api/users/pin", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setHasPin(data.hasPin)
      }
    } catch (e) {
      console.error("Failed to load PIN status", e)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (hasPin) {
      const pin = prompt("Enter PIN to delete project:")
      if (!pin) return
      setPinValue(pin)
    }

    try {
      const res = await fetch(`/api/medium-ide/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pin: hasPin ? pinValue : undefined })
      })
      if (res.ok) {
        await loadProjects()
        if (selectedProject?.id === projectId) {
          setSelectedProject(null)
        }
      } else {
        const data = await res.json()
        alert(data.error || "Failed to delete project")
      }
    } catch (error) {
      console.error("Failed to delete project:", error)
      alert("Failed to delete project")
    } finally {
      setPinValue("")
    }
  }

  const lockProject = async (projectId: string) => {
    if (!hasPin) {
      alert("Please set a PIN in settings first")
      return
    }
    const pin = prompt("Enter PIN to lock project:")
    if (!pin) return

    try {
      const res = await fetch(`/api/medium-ide/projects/${projectId}/lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pin })
      })
      if (res.ok) {
        await loadProjects()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to lock project")
      }
    } catch (error) {
      console.error("Failed to lock project:", error)
      alert("Failed to lock project")
    }
  }

  const unlockProject = async (projectId: string) => {
    if (!hasPin) return
    const pin = prompt("Enter PIN to unlock project:")
    if (!pin) return

    try {
      const res = await fetch(`/api/medium-ide/projects/${projectId}/lock`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pin })
      })
      if (res.ok) {
        await loadProjects()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to unlock project")
      }
    } catch (error) {
      console.error("Failed to unlock project:", error)
      alert("Failed to unlock project")
    }
  }

  // Check GitHub connection on mount and load projects if connected
  useEffect(() => {
    if (session && (user?.role === "MEDIOCRE" || user?.role === "owner")) {
      checkGithubConnection()
      loadPinStatus()
    }
  }, [session, user?.role])

  useEffect(() => {
    if (githubConnected && session) {
      loadProjects()
    }
  }, [githubConnected, session])

  // Handle GitHub connection success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const successParam = params.get("success")
    if (successParam === "github_connected") {
      // Reload GitHub connection status
      checkGithubConnection()
      // Clean URL
      window.history.replaceState({}, "", "/")
    }
  }, [])

  return (
    <div className="relative min-h-screen text-white overflow-hidden" style={{ backgroundColor: bgColor }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');
      `}</style>
      
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchColors={theme.customGlitchColors}
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/30 to-black/70" />

      <div className="absolute top-5 right-5 z-30 flex items-center gap-2">
        {session ? (
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl px-4 py-2 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <span className="text-zinc-300">{username}</span>
            <span className="w-px h-3 bg-white/20" />
            <button onClick={()=>signOut({redirect:true,callbackUrl:"/"})} className="text-zinc-500 hover:text-white transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <a href="/login" className="rounded-full border border-white/15 bg-black/60 backdrop-blur-xl px-5 py-2 text-xs text-zinc-400 hover:border-white/30 hover:text-white transition-all" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Login
            </a>
            <a href="/register" className="rounded-full bg-white text-black px-5 py-2 text-xs font-medium hover:bg-zinc-200 transition-all" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Register
            </a>
          </div>
        )}
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Music Player */}
          <div className="w-full lg:max-w-sm">
            <MusicPlayer variant="column" />
          </div>

          {/* Center Column - Main Card */}
          <div className="w-full">
            <div 
              className="relative backdrop-blur-2xl border rounded-2xl p-10 animate-fade-in"
              style={{ 
                backgroundColor: cardColor,
                borderColor: `${layoutColor}20`,
                boxShadow: `0 0 80px ${layoutColor}08`
              }}
            >
              <div className="flex flex-col items-center text-center gap-6">
                <div 
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] tracking-[0.25em] uppercase text-white/80"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  <span>Learning</span>
                  <span className="h-3 w-px bg-white/20" />
                  <span>JEE</span>
                </div>

                <h1 
                  className="text-4xl font-semibold tracking-tight text-white"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  A Website For Dumbasses
                </h1>

                <div className="flex flex-col items-center gap-1">
                  <p 
                    className="text-zinc-500 text-xs tracking-wide"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Interactive learning for Python, SQL & HTML
                  </p>
                  <p 
                    className="text-zinc-600 text-[10px] tracking-widest uppercase"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    by Logesh :3
                  </p>
                </div>

                <a 
                    href="/lessons" 
                    className="w-full text-center py-3 border border-white/20 bg-white/5 rounded-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-black text-sm font-medium flex items-center justify-center gap-2"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    <BookOpen className="w-4 h-4" />
                    Start Learning
                  </a>

                <div className="flex items-center gap-3 w-full">
                  <a 
                    href="/python" 
                    className="flex-1 text-center py-3 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-sm text-zinc-400 hover:text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Python Lab
                  </a>
                  <a 
                    href="/sql" 
                    className="flex-1 text-center py-3 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-sm text-zinc-400 hover:text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    SQL Lab
                  </a>
                  <a 
                    href="/html" 
                    className="flex-1 text-center py-3 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-sm text-zinc-400 hover:text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    HTML Lab
                  </a>
                </div>

                {session && (
                  <>
                    <div className="flex items-center gap-3 w-full">
                      <a 
                        href="/challenges" 
                        className="flex-1 text-center py-2.5 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-xs text-zinc-500 hover:text-white"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        Challenges
                      </a>
                      <a 
                        href="/chat" 
                        className="flex-1 text-center py-2.5 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-xs text-zinc-500 hover:text-white"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        Chat
                      </a>
                      <a 
                        href="/leaderboard" 
                        className="flex-1 text-center py-2.5 border border-white/10 rounded-lg transition-all duration-200 hover:border-yellow-400/30 hover:bg-yellow-400/5 text-xs text-zinc-500 hover:text-yellow-400 flex items-center justify-center gap-1.5"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        <Trophy className="w-3 h-3" />
                        Ranks
                      </a>
                      <a 
                        href="/settings" 
                        className="flex-1 text-center py-2.5 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-xs text-zinc-500 hover:text-white"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        Settings
                      </a>
                    </div>
                    <a 
                      href="/study" 
                      className="w-full text-center py-2.5 border border-white/10 rounded-lg transition-all duration-200 hover:border-purple-400/30 hover:bg-purple-400/5 text-xs text-zinc-500 hover:text-purple-400 flex items-center justify-center gap-1.5"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      <BookOpen className="w-3 h-3" />
                      Study
                    </a>
                  </>
                )}
                
                {isOwner && session && (
                  <div className="w-full pt-4 border-t border-white/10">
                    <a 
                      href="/administration" 
                      className="w-full text-center py-3 border border-white/20 bg-white/10 rounded-lg transition-all duration-200 hover:border-white/40 hover:bg-white/20 text-sm font-medium text-white flex items-center justify-center gap-2"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      <span className="uppercase tracking-wider">Dashboard</span>
                    </a>
                  </div>
                )}
                
                {isOwner && session && !INVITE_CODE_DISABLED && (
                  <div className="mt-4 pt-4 border-t border-white/10 w-full">
                    {!showInviteCode ? (
                      <button
                        onClick={fetchInviteCode}
                        disabled={loadingCode}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-400 hover:border-white/20 hover:text-white transition-all disabled:opacity-50"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {loadingCode ? "Loading..." : "Show Invite Code"}
                      </button>
                    ) : (
                      <div className="text-center space-y-3">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-wider" style={{ fontFamily: "'Space Mono', monospace" }}>Invite Code</p>
                        <div 
                          className="text-xl tracking-[0.4em] text-white bg-white/5 border border-white/10 rounded-lg py-3 px-4"
                          style={{ fontFamily: "'Space Mono', monospace" }}
                        >
                          {inviteCode}
                        </div>
                        <button
                          onClick={generateNewCode}
                          disabled={loadingCode}
                          className="text-[10px] text-zinc-600 hover:text-white transition-colors"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {loadingCode ? "Generating..." : "Generate new"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Locked Feature / GitHub Connect */}
          <div className="w-full lg:max-w-sm flex flex-col gap-6">
            <div 
              className="relative bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-10 animate-fade-in"
              style={{ 
                boxShadow: '0 0 80px rgba(255,255,255,0.03)',
                opacity: 0.7
              }}
            >
              {session && (user?.role === "MEDIOCRE" || user?.role === "owner") ? (
                githubConnected ? (
                  <div className="flex flex-col h-full min-h-[400px]">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-zinc-400" />
                        <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          Projects
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowNewProjectModal(true)}
                        className="text-xs text-zinc-400 hover:text-white transition-colors"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-auto space-y-2">
                      {projects.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-xs text-zinc-500 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            No projects yet
                          </p>
                          <button
                            onClick={() => setShowNewProjectModal(true)}
                            className="text-xs px-3 py-1.5 border border-white/10 rounded hover:border-white/20 transition-colors"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                          >
                            Create Project
                          </button>
                        </div>
                      ) : (
                        projects.map(project => (
                          <button
                            key={project.id}
                            onClick={() => {
                              setSelectedProject(project)
                              window.location.href = `/medium-ide?project=${project.id}`
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                              selectedProject?.id === project.id
                                ? "bg-white/10 border-white/20"
                                : "bg-white/5 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Folder className="h-3.5 w-3.5 text-blue-400" />
                              <span className="text-xs font-medium text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {project.name}
                              </span>
                            </div>
                            {project.description && (
                              <p className="text-[10px] text-zinc-500 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                {project.description}
                              </p>
                            )}
                            {project.flaskUrl && (
                              <a
                                href={project.flaskUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2 inline-flex items-center gap-1 text-[10px] text-green-400 hover:text-green-300"
                              >
                                <Network className="h-3 w-3" />
                                Flask App Running
                              </a>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              {project.isLocked && (
                                <span title="Project is locked">
                                  <Lock className="h-3 w-3 text-yellow-400" />
                                </span>
                              )}
                              {hasPin && (
                                <>
                                  {project.isLocked ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        unlockProject(project.id)
                                      }}
                                      className="text-[10px] text-yellow-400 hover:text-yellow-300"
                                    >
                                      Unlock
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        lockProject(project.id)
                                      }}
                                      className="text-[10px] text-zinc-400 hover:text-zinc-300"
                                    >
                                      Lock
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (confirm(`Delete ${project.name}?`)) {
                                        deleteProject(project.id)
                                      }
                                    }}
                                    className="text-[10px] text-red-400 hover:text-red-300 ml-auto"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                            {selectedProject?.id === project.id && project.pages && project.pages.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                                {project.pages.map((page: any) => (
                                  <div
                                    key={page.id}
                                    className="flex items-center gap-2 px-2 py-1 text-[10px] text-zinc-400"
                                  >
                                    <FileText className="h-3 w-3" />
                                    <span>{page.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </button>
                        ))
                      )}
                    </div>

                    {githubUsername && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="text-[10px] text-zinc-500" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              {githubUsername}
                            </span>
                          </div>
                          <button
                            onClick={disconnectGithub}
                            className="text-[10px] text-zinc-600 hover:text-white transition-colors"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-4">
                    <div 
                      className="text-2xl font-semibold text-white/80"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Connect to GitHub
                    </div>
                    <div className="w-24 h-px bg-white/10" />
                    <p 
                      className="text-sm text-zinc-400 max-w-xs"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Connect your GitHub account to create and manage projects.
                    </p>
                    <button
                      onClick={async () => {
                        setLoadingGithub(true)
                        try {
                          const res = await fetch("/api/github/connection", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ source: "homepage" })
                          })
                          const data = await res.json()
                          if (res.ok && data.url) {
                            // Redirect to GitHub OAuth
                            window.location.href = data.url
                          } else {
                            console.error("Failed to initiate GitHub connection:", data.error)
                            setLoadingGithub(false)
                          }
                        } catch (e) {
                          console.error("Failed to connect GitHub", e)
                          setLoadingGithub(false)
                        }
                      }}
                      disabled={loadingGithub}
                      className="mt-4 px-6 py-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      {loadingGithub ? "Connecting..." : "Connect GitHub"}
                    </button>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-4">
                  <div 
                    className="text-2xl font-semibold text-white/80 animate-text-glitch"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Hit level 100, or subscribe to unlock this
                  </div>
                  <div className="w-24 h-px bg-white/10" />
                  <p 
                    className="text-sm text-zinc-400 max-w-xs"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    This feature is locked. Reach level 100 or subscribe to access premium content.
                  </p>
                </div>
              )}
            </div>
            
            {/* Level Progress Bar - under right card */}
            {session && (
              <div className="relative z-10 flex justify-center">
                <LevelProgressBar />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0f0f12] border border-white/10 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>New Project</h2>
              <button onClick={() => {
                setShowNewProjectModal(false)
                setNewProjectName("")
                setNewProjectDesc("")
                setCreateAsGithubRepo(false)
                setGithubRepoUsername("")
                setGithubRepoName("")
                setRepoExists(null)
              }} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") createProject()
                }}
                placeholder="My Project"
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>Description (optional)</label>
              <input
                type="text"
                value={newProjectDesc}
                onChange={e => setNewProjectDesc(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") createProject()
                }}
                placeholder="Project description"
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              />
            </div>
              {githubConnected && (
                <>
                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pullFromRepo}
                        onChange={e => {
                          setPullFromRepo(e.target.checked)
                          if (e.target.checked) {
                            setCreateAsGithubRepo(false)
                          }
                        }}
                        className="w-4 h-4 rounded border-white/15 bg-black text-white focus:ring-2 focus:ring-white/20"
                      />
                      <span className="text-xs text-zinc-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Pull from existing GitHub repository
                      </span>
                    </label>
                    {pullFromRepo && (
                      <div className="mt-3 space-y-3 pl-6">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Repository Owner
                          </label>
                          <input
                            type="text"
                            value={pullOwner}
                            onChange={e => setPullOwner(e.target.value)}
                            placeholder="username"
                            className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Repository Name
                          </label>
                          <input
                            type="text"
                            value={pullRepo}
                            onChange={e => setPullRepo(e.target.value)}
                            placeholder="repository-name"
                            className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-400 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Branch (optional)
                          </label>
                          <input
                            type="text"
                            value={pullBranch}
                            onChange={e => setPullBranch(e.target.value)}
                            placeholder="main"
                            className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createAsGithubRepo}
                        onChange={e => {
                          setCreateAsGithubRepo(e.target.checked)
                          if (e.target.checked) {
                            setPullFromRepo(false)
                            if (githubUsername && !githubRepoUsername) {
                              setGithubRepoUsername(githubUsername)
                            }
                          }
                        }}
                        disabled={pullFromRepo}
                        className="w-4 h-4 rounded border-white/15 bg-black text-white focus:ring-2 focus:ring-white/20 disabled:opacity-50"
                      />
                      <span className="text-xs text-zinc-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Create as GitHub repository
                      </span>
                    </label>
                {createAsGithubRepo && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        GitHub Username
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={githubRepoUsername}
                          onChange={e => setGithubRepoUsername(e.target.value)}
                          placeholder={githubUsername || "username"}
                          className="flex-1 px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        />
                        <span className="text-xs text-zinc-500">/</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Repository Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={githubRepoName}
                          onChange={e => setGithubRepoName(e.target.value)}
                          placeholder="repository-name"
                          className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        />
                        {checkingRepo && (
                          <div className="absolute right-3 top-2.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                          </div>
                        )}
                        {repoExists === true && githubRepoName.trim() && (
                          <p className="mt-1 text-xs text-red-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Repository already exists
                          </p>
                        )}
                        {repoExists === false && githubRepoName.trim() && (
                          <p className="mt-1 text-xs text-green-400" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Repository name available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewProjectModal(false)
                  setNewProjectName("")
                  setNewProjectDesc("")
                  setCreateAsGithubRepo(false)
                  setGithubRepoUsername("")
                  setGithubRepoName("")
                  setRepoExists(null)
                }}
                className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProjectName.trim() || pullingRepo || (createAsGithubRepo && (!githubRepoUsername.trim() || !githubRepoName.trim() || repoExists === true)) || (pullFromRepo && (!pullOwner.trim() || !pullRepo.trim()))}
                className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {pullingRepo ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Pulling...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
