"use client"
import dynamic from "next/dynamic"
import React, { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  Keyboard,
  Loader2,
  Play,
  Plus,
  SquareTerminal,
  Terminal,
  X,
  Send,
  Code,
  FolderPlus,
  FilePlus,
  AlertCircle,
  GitBranch,
  Plug,
  GitCommit,
  Network,
  CheckCircle2
} from "lucide-react"
import Link from "next/link"
import MusicPlayer from "@/components/MusicPlayer"

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type FileNode = {
  id: string
  path: string
  content: string
  isDirectory: boolean
  mimeType?: string | null
  size: number
  updatedAt: string
}

type Project = {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
  pages: Page[]
  githubOwner?: string | null
  githubRepo?: string | null
  githubUrl?: string | null
  isLocked?: boolean
  flaskPort?: number | null
  flaskUrl?: string | null
}

type Page = {
  id: string
  projectId: string
  name: string
  content: string
  createdAt: string
  updatedAt: string
}


export default function MediumIDEPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [userLevel, setUserLevel] = useState(0)
  const [isOwner, setIsOwner] = useState(false)

  // Projects & Pages
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [showNewPageModal, setShowNewPageModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDesc, setNewProjectDesc] = useState("")
  const [newPageName, setNewPageName] = useState("")

  // IDE Files
  const [files, setFiles] = useState<FileNode[]>([])
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]))
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFolderPath, setNewFolderPath] = useState("")
  const [newFilePath, setNewFilePath] = useState("")

  // Terminal
  const [terminalOutput, setTerminalOutput] = useState("")
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [terminalHeight, setTerminalHeight] = useState(220)
  const [running, setRunning] = useState(false)
  const [waitingForInput, setWaitingForInput] = useState(false)
  const [stdinInput, setStdinInput] = useState("")
  const [pendingInputs, setPendingInputs] = useState<string[]>([])

  // Environment
  const [requirementsTxt, setRequirementsTxt] = useState("# Your packages go here\n")
  const [installingPackages, setInstallingPackages] = useState(false)

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showGithubModal, setShowGithubModal] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)
  const [pullingRepo, setPullingRepo] = useState(false)
  const [activeSidebarView, setActiveSidebarView] = useState<'explorer' | 'github' | 'plugins'>('explorer')
  const [githubUsername, setGithubUsername] = useState<string>("")
  const [githubUsernameChecked, setGithubUsernameChecked] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [commits, setCommits] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loadingCommits, setLoadingCommits] = useState(false)
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [showInitializeModal, setShowInitializeModal] = useState(false)
  const [showCommitModal, setShowCommitModal] = useState(false)
  const [initializingRepo, setInitializingRepo] = useState(false)
  const [committingChanges, setCommittingChanges] = useState(false)
  const [pullingLatest, setPullingLatest] = useState(false)
  const [repoName, setRepoName] = useState("")
  const [repoDescription, setRepoDescription] = useState("")
  const [repoPrivate, setRepoPrivate] = useState(false)
  const [commitMessage, setCommitMessage] = useState("")
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false)
  const [pullFromRepo, setPullFromRepo] = useState(false)
  const [pullOwner, setPullOwner] = useState("")
  const [pullRepo, setPullRepo] = useState("")
  const [pullBranch, setPullBranch] = useState("main")
  const [availableRepos, setAvailableRepos] = useState<any[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [inactivityTimer, setInactivityTimer] = useState<NodeJS.Timeout | null>(null)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [launchingFlask, setLaunchingFlask] = useState(false)
  const [stoppingFlask, setStoppingFlask] = useState(false)

  const pluginCatalog = [
    {
      name: "Language Server Protocol (LSP) Engine",
      summary: "Autocomplete, diagnostics, hover info, go-to-definition, references, and refactoring.",
      status: "Enabled"
    },
    {
      name: "Task Runner & Execution Pipeline",
      summary: "Unified run/build/test commands with profiles, env vars, and execution stages.",
      status: "Enabled"
    },
    {
      name: "Project Analyzer & Workspace Intelligence",
      summary: "Detects project type, stack, dependencies, and recommends IDE defaults.",
      status: "Enabled"
    }
  ]

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const terminalEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const collapsedHeight = 36

  // Check access on mount
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session?.user) {
      checkAccess()
    }
  }, [status, session, router])

  const checkAccess = async () => {
    try {
      const res = await fetch("/api/users/profile", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        const level = data.level || 0
        const role = data.role || "user"
        setUserLevel(level)
        setIsOwner(role === "owner")

        if (level < 100 && role !== "owner") {
          setAccessDenied(true)
          setLoading(false)
          return
        }

        await loadProjects()
        await checkGithubConnection()
        setLoading(false)
        
        // Load GitHub data if project has repo
        if (selectedProject?.githubRepo) {
          await Promise.all([loadCommits(), loadBranches()])
        }
      } else {
        setAccessDenied(true)
        setLoading(false)
      }
    } catch (error) {
      console.error("Access check failed:", error)
      setAccessDenied(true)
      setLoading(false)
    }
  }


  const loadProjects = async () => {
    try {
      const res = await fetch("/api/medium-ide/projects", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
        if (data.length > 0 && !selectedProject) {
          setSelectedProject(data[0])
          if (data[0].pages.length > 0) {
            setSelectedPage(data[0].pages[0])
          }
        } else if (data.length === 0) {
          setSelectedProject(null)
          setSelectedPage(null)
        }
      }
    } catch (error) {
      console.error("Failed to load projects:", error)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return

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
        setPullFromRepo(false)
        setPullOwner(githubUsername || "")
        setPullRepo("")
        setPullBranch("main")
        setAvailableRepos([])
        await loadFiles(project)
        await loadEnvironment(project)
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

  const createPage = async () => {
    if (!selectedProject || !newPageName.trim()) return

    try {
      const res = await fetch("/api/medium-ide/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectId: selectedProject.id,
          name: newPageName.trim(),
          content: ""
        })
      })

      if (res.ok) {
        const page = await res.json()
        setSelectedProject(prev => prev ? { ...prev, pages: [...prev.pages, page] } : null)
        setSelectedPage(page)
        setShowNewPageModal(false)
        setNewPageName("")
      } else {
        const data = await res.json()
        alert(data.error || "Failed to create page")
      }
    } catch (error) {
      console.error("Failed to create page:", error)
      alert("Failed to create page")
    }
  }

  const loadFiles = async (projectOverride?: Project | null) => {
    const project = projectOverride || selectedProject
    if (!project) {
      setFiles([])
      setActiveFile(null)
      setFileContent("")
      return
    }
    try {
      const res = await fetch(`/api/medium-ide/files?projectId=${project.id}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setFiles(data)

        // Check if main.py exists, if not create it
        const mainPy = data.find((f: FileNode) => f.path === "main.py" || f.path === "/main.py")
        if (!mainPy) {
          const newFile = await createFile("main.py", "#!/usr/bin/env python3\n# main.py\n\nprint('Hello from MEDIOCRE IDE!')\n")
          if (newFile && !activeFile) {
            setActiveFile("main.py")
            setFileContent(newFile.content)
          }
        } else {
          if (!activeFile) {
            setActiveFile(mainPy.path.replace(/^\//, ""))
            setFileContent(mainPy.content)
          }
        }

        // Check if requirements.txt exists, if not create it
        const reqTxt = data.find((f: FileNode) => f.path === "requirements.txt" || f.path === "/requirements.txt")
        if (!reqTxt) {
          await createFile("requirements.txt", "# Your packages go here\n")
        } else {
          setRequirementsTxt(reqTxt.content)
        }

        // Check if README.md exists, if not create it
        const readme = data.find((f: FileNode) => f.path === "README.md" || f.path === "/README.md")
        if (!readme) {
          await createFile("README.md", `# ${project.name}\n\n${project.description || "Project description"}\n\n## Getting Started\n\nAdd your project documentation here.\n`)
        }
      }
    } catch (error) {
      console.error("Failed to load files:", error)
    }
  }

  const loadEnvironment = async (projectOverride?: Project | null) => {
    const project = projectOverride || selectedProject
    if (!project) {
      setRequirementsTxt("# Your packages go here\n")
      return
    }
    try {
      const res = await fetch(`/api/medium-ide/environment?projectId=${project.id}`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setRequirementsTxt(data.requirementsTxt || "# Your packages go here\n")
      }
    } catch (error) {
      console.error("Failed to load environment:", error)
    }
  }

  const checkGithubConnection = async () => {
    try {
      const res = await fetch("/api/github/connection", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setGithubConnected(data.connected)
        if (data.githubUsername) {
          setGithubUsername(data.githubUsername)
          setGithubUsernameChecked(true)
          // Pre-fill and lock the pullOwner field
          setPullOwner(data.githubUsername)
        }
      }
    } catch (error) {
      console.error("Failed to check GitHub connection:", error)
    }
  }

  const fetchAvailableRepos = async () => {
    if (!githubUsername || !githubConnected) return
    setLoadingRepos(true)
    try {
      const res = await fetch("/api/github/repos?type=owner&exclude_connected=true", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setAvailableRepos(data.repos || [])
      }
    } catch (error) {
      console.error("Failed to fetch repositories:", error)
    } finally {
      setLoadingRepos(false)
    }
  }

  const checkGithubUsername = async (username: string) => {
    if (!username.trim()) return
    setCheckingUsername(true)
    try {
      const res = await fetch(`/api/github/user/${username}/exists`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        if (data.exists) {
          setGithubUsernameChecked(true)
        } else {
          setGithubUsernameChecked(false)
          alert("GitHub username not found. Please check and try again.")
        }
      } else {
        setGithubUsernameChecked(false)
      }
    } catch (error) {
      console.error("Failed to check username:", error)
      setGithubUsernameChecked(false)
    } finally {
      setCheckingUsername(false)
    }
  }

  const loadCommits = async () => {
    if (!selectedProject?.githubOwner || !selectedProject?.githubRepo) return
    setLoadingCommits(true)
    try {
      const res = await fetch(`/api/github/repos/${selectedProject.githubOwner}/${selectedProject.githubRepo}/commits`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setCommits(data.commits || [])
      }
    } catch (error) {
      console.error("Failed to load commits:", error)
    } finally {
      setLoadingCommits(false)
    }
  }

  const loadBranches = async () => {
    if (!selectedProject?.githubOwner || !selectedProject?.githubRepo) return
    setLoadingBranches(true)
    try {
      const res = await fetch(`/api/github/repos/${selectedProject.githubOwner}/${selectedProject.githubRepo}/branches`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setBranches(data.branches || [])
      }
    } catch (error) {
      console.error("Failed to load branches:", error)
    } finally {
      setLoadingBranches(false)
    }
  }

  const initializeRepository = async () => {
    if (!selectedProject || !repoName.trim() || !githubUsername.trim()) return
    setInitializingRepo(true)
    try {
      const res = await fetch(`/api/medium-ide/projects/${selectedProject.id}/github/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          repoName: repoName.trim(),
          description: repoDescription.trim() || selectedProject.description || undefined,
          isPrivate: repoPrivate,
          githubUsername: githubUsername.trim()
        })
      })
      if (res.ok) {
        const data = await res.json()
        setSelectedProject(data.project)
        setShowInitializeModal(false)
        setRepoName("")
        setRepoDescription("")
        setRepoPrivate(false)
        await loadProjects()
        await loadCommits()
        await loadBranches()
      } else {
        const error = await res.json()
        alert(error.error || "Failed to initialize repository")
      }
    } catch (error: any) {
      console.error("Failed to initialize repository:", error)
      alert("Failed to initialize repository: " + error.message)
    } finally {
      setInitializingRepo(false)
    }
  }

  const commitChanges = async () => {
    if (!selectedProject || !commitMessage.trim()) return
    setCommittingChanges(true)
    try {
      const res = await fetch(`/api/medium-ide/projects/${selectedProject.id}/github/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: commitMessage.trim(),
          branch: "main"
        })
      })
      if (res.ok) {
        const data = await res.json()
        setShowCommitModal(false)
        setCommitMessage("")
        await loadCommits()
        alert(`Successfully committed ${data.commits?.length || 0} file(s)`)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to commit changes")
      }
    } catch (error: any) {
      console.error("Failed to commit changes:", error)
      alert("Failed to commit changes: " + error.message)
    } finally {
      setCommittingChanges(false)
    }
  }

  // Load project from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const projectId = params.get("project")
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setSelectedProject(project)
        if (project.pages.length > 0) {
          setSelectedPage(project.pages[0])
        }
      }
    }
  }, [projects])

  useEffect(() => {
    if (!selectedProject) {
      setFiles([])
      setActiveFile(null)
      setFileContent("")
      setRequirementsTxt("# Your packages go here\n")
      return
    }

    setActiveFile(null)
    setFileContent("")
    loadFiles(selectedProject)
    loadEnvironment(selectedProject)
    setTerminalOutput("")
  }, [selectedProject?.id])

  // Load GitHub data when GitHub view is active
  useEffect(() => {
    if (activeSidebarView === 'github' && selectedProject?.githubRepo) {
      loadCommits()
      loadBranches()
    }
  }, [activeSidebarView, selectedProject?.githubRepo])

  // Sync pullOwner with githubUsername when GitHub is connected and pullFromRepo is checked
  useEffect(() => {
    if (pullFromRepo && githubConnected && githubUsername) {
      // Hardlock to GitHub username when pulling from repo
      setPullOwner(githubUsername)
      if (availableRepos.length === 0) {
        fetchAvailableRepos()
      }
    }
  }, [pullFromRepo, githubConnected, githubUsername])

  const createFile = async (path: string, content: string) => {
    if (!selectedProject) return
    try {
      // Normalize path (remove leading slash)
      const normalizedPath = path.replace(/^\//, "")
      const res = await fetch("/api/medium-ide/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId: selectedProject.id, path: normalizedPath, content, isDirectory: false })
      })
      if (res.ok) {
        const newFile = await res.json()
        const normalizedFile = { ...newFile, path: newFile.path.replace(/^\//, "") }
        setFiles(prev => {
          const exists = prev.find(f => f.path === newFile.path || f.path === normalizedFile.path)
          if (exists) {
            return prev.map(f => f.path === newFile.path || f.path === normalizedFile.path ? normalizedFile : f)
          }
          return [...prev, normalizedFile]
        })
        return normalizedFile
      }
    } catch (error) {
      console.error("Failed to create file:", error)
    }
  }

  const createFolder = async (path: string) => {
    if (!selectedProject) return
    try {
      // Normalize path (remove leading/trailing slashes)
      const normalizedPath = path.replace(/^\//, "").replace(/\/$/, "")
      if (!normalizedPath) {
        return
      }
      const res = await fetch("/api/medium-ide/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId: selectedProject.id, path: normalizedPath, content: "", isDirectory: true })
      })
      if (res.ok) {
        const newFolder = await res.json()
        const normalizedFolderPath = newFolder.path.replace(/^\//, "").replace(/\/$/, "")
        setFiles(prev => {
          const exists = prev.find(f => f.path === newFolder.path || f.path === normalizedFolderPath)
          if (exists) {
            return prev.map(f => f.path === newFolder.path || f.path === normalizedFolderPath ? { ...newFolder, path: normalizedFolderPath } : f)
          }
          return [...prev, { ...newFolder, path: normalizedFolderPath }]
        })
        setExpandedFolders(prev => new Set([...prev, normalizedFolderPath]))
        return newFolder
      }
    } catch (error) {
      console.error("Failed to create folder:", error)
    }
  }

  const pullLatestFromGithub = async () => {
    if (!selectedProject?.githubOwner || !selectedProject?.githubRepo) return
    setPullingLatest(true)
    try {
      const res = await fetch(`/api/medium-ide/projects/${selectedProject.id}/github/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ branch: "main" })
      })
      if (res.ok) {
        await loadFiles(selectedProject)
        alert("Pulled latest files from GitHub.")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to pull repository")
      }
    } catch (error: any) {
      console.error("Failed to pull repository:", error)
      alert("Failed to pull repository: " + error.message)
    } finally {
      setPullingLatest(false)
    }
  }

  const saveFile = async (path: string, content: string) => {
    if (!selectedProject) return
    try {
      await fetch("/api/medium-ide/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId: selectedProject.id, path, content, isDirectory: false })
      })
      setFiles(prev => prev.map(f => f.path === path ? { ...f, content, size: content.length } : f))
    } catch (error) {
      console.error("Failed to save file:", error)
    }
  }

  const deleteFile = async (path: string) => {
    if (!selectedProject) return
    try {
      await fetch("/api/medium-ide/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId: selectedProject.id, path })
      })
      setFiles(prev => prev.filter(f => f.path !== path))
      if (activeFile === path) {
        setActiveFile(null)
        setFileContent("")
      }
    } catch (error) {
      console.error("Failed to delete file:", error)
    }
  }


  const handleFileSelect = (path: string) => {
    const file = files.find(f => (f.path === path || f.path === `/${path}`) && !f.isDirectory)
    if (file) {
      const normalizedPath = file.path.replace(/^\//, "")
      setActiveFile(normalizedPath)
      if (normalizedPath === "requirements.txt") {
        setRequirementsTxt(file.content)
      } else {
        setFileContent(file.content)
      }
    }
  }

  const handleFileContentChange = (value: string | undefined) => {
    setFileContent(value || "")
    if (activeFile && saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (activeFile) {
        saveFile(activeFile, value || "")
      }
    }, 2000)
  }

  const handleRequirementsChange = async (value: string | undefined) => {
    const newValue = value || ""
    setRequirementsTxt(newValue)

    // Auto-install when requirements.txt changes
    if (activeFile === "requirements.txt") {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(async () => {
        await saveFile("requirements.txt", newValue)
        await installPackages(newValue)
      }, 3000)
    }
  }

  const installPackages = async (reqTxt?: string) => {
    if (!selectedProject) return
    const text = reqTxt || requirementsTxt
    setInstallingPackages(true)
    setTerminalOutput(prev => prev + "\nInstalling packages...\n")

    try {
      const res = await fetch("/api/medium-ide/environment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId: selectedProject.id, requirementsTxt: text })
      })

      const data = await res.json()
      if (data.success) {
        setTerminalOutput(prev => prev + (data.installOutput || "") + "\nPackages installed successfully.\n")
      } else {
        setTerminalOutput(prev => prev + (data.installError || "Installation failed") + "\n")
      }
    } catch (error) {
      setTerminalOutput(prev => prev + `Error: ${error}\n`)
    } finally {
      setInstallingPackages(false)
    }
  }

  const runCode = async () => {
    if (!activeFile || !activeFile.endsWith(".py")) {
      setTerminalOutput(prev => prev + "Warning: Please open a Python file to run.\n")
      return
    }
    if (!selectedProject) {
      setTerminalOutput(prev => prev + "Warning: Select a project before running code.\n")
      return
    }

    setRunning(true)
    setWaitingForInput(false)
    setTerminalOutput(prev => prev + `\nRunning ${activeFile}...\n`)

    try {
      // Save file first
      await saveFile(activeFile, fileContent)

      const stdinStr = pendingInputs.join('\n')
      const res = await fetch("/api/medium-ide/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          projectId: selectedProject?.id,
          path: activeFile,
          stdin: stdinStr || undefined
        })
      })

      const data = await res.json()
      if (res.ok && data.ok) {
        const output = (data.stdout || "") + (data.stderr ? `\n${data.stderr}` : "")
        setTerminalOutput(prev => prev + output + "\n")
        setPendingInputs([])
      } else {
        const errMsg = data?.error || "Execution failed"
        if (errMsg.includes("EOFError") || errMsg.includes("input")) {
          setTerminalOutput(prev => prev + "\n⌨️ Waiting for input...\n")
          setWaitingForInput(true)
        } else {
          setTerminalOutput(prev => prev + `Error: ${errMsg}\n`)
        }
      }
    } catch (error: any) {
      setTerminalOutput(prev => prev + `Error: ${error.message}\n`)
    } finally {
      setRunning(false)
    }
  }

  const handleInputSubmit = () => {
    if (!stdinInput.trim() && !waitingForInput) return
    const newInputs = [...pendingInputs, stdinInput]
    setPendingInputs(newInputs)
    setTerminalOutput(prev => prev + `> ${stdinInput}\n`)
    setStdinInput("")
    setWaitingForInput(false)
    runCode()
  }

  const handleProjectSelect = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setSelectedProject(project)
      setSelectedPage(project.pages[0] || null)
    }
  }

  const launchFlaskApp = async () => {
    if (!selectedProject) return
    setLaunchingFlask(true)
    try {
      const res = await fetch(`/api/medium-ide/projects/${selectedProject.id}/flask`, {
        method: "POST",
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        await loadProjects()
        if (data.url) {
          setTerminalOutput(prev => prev + `\nFlask app launched at ${data.url}\n`)
        }
      } else {
        const error = await res.json()
        alert(error.error || "Failed to launch Flask app")
      }
    } catch (error: any) {
      console.error("Failed to launch Flask app:", error)
      alert("Failed to launch Flask app: " + error.message)
    } finally {
      setLaunchingFlask(false)
    }
  }

  const stopFlaskApp = async () => {
    if (!selectedProject) return
    setStoppingFlask(true)
    try {
      const res = await fetch(`/api/medium-ide/projects/${selectedProject.id}/flask`, {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) {
        await loadProjects()
        setTerminalOutput(prev => prev + "\nFlask app stopped.\n")
      } else {
        const error = await res.json()
        alert(error.error || "Failed to stop Flask app")
      }
    } catch (error: any) {
      console.error("Failed to stop Flask app:", error)
      alert("Failed to stop Flask app: " + error.message)
    } finally {
      setStoppingFlask(false)
    }
  }

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const buildFileTree = () => {
    const tree: Record<string, { files: FileNode[]; folders: FileNode[] }> = {}
    const folderMap = new Map<string, FileNode>()
    const now = new Date().toISOString()

    const normalizeFolderPath = (path: string) => path.replace(/^\//, "").replace(/\/$/, "")
    const normalizeFilePath = (path: string) => path.replace(/^\//, "")

    const ensureTreeNode = (dir: string) => {
      if (!tree[dir]) {
        tree[dir] = { files: [], folders: [] }
      }
    }

    const registerFolder = (path: string, source?: FileNode) => {
      const normalizedPath = normalizeFolderPath(path)
      if (!normalizedPath) return
      if (!folderMap.has(normalizedPath)) {
        const folderNode: FileNode = source
          ? { ...source, path: normalizedPath }
          : {
              id: `generated-${normalizedPath}`,
              path: normalizedPath,
              content: "",
              isDirectory: true,
              size: 0,
              updatedAt: now
            }
        folderMap.set(normalizedPath, folderNode)
      }
    }

    // Initialize root
    tree[""] = { files: [], folders: [] }

    files.forEach(file => {
      if (file.isDirectory) {
        registerFolder(file.path, file)
      }
    })

    files.forEach(file => {
      if (!file.isDirectory) {
        const normalizedPath = normalizeFilePath(file.path)
        const parts = normalizedPath.split("/").filter(Boolean)
        if (parts.length > 1) {
          for (let i = 1; i < parts.length; i += 1) {
            registerFolder(parts.slice(0, i).join("/"))
          }
        }
      }
    })

    folderMap.forEach(folder => {
      const parts = folder.path.split("/").filter(Boolean)
      const parentDir = parts.length > 1 ? parts.slice(0, -1).join("/") : ""
      ensureTreeNode(parentDir)
      tree[parentDir].folders.push(folder)
    })

    files.forEach(file => {
      if (!file.isDirectory) {
        const normalizedPath = normalizeFilePath(file.path)
        const parts = normalizedPath.split("/").filter(Boolean)
        const parentDir = parts.length > 1 ? parts.slice(0, -1).join("/") : ""
        ensureTreeNode(parentDir)
        tree[parentDir].files.push({ ...file, path: normalizedPath })
      }
    })

    return tree
  }

  const renderFileTree = (dir: string = "", level: number = 0): React.ReactElement[] => {
    const tree = buildFileTree()
    const items: React.ReactElement[] = []
    const dirData = tree[dir] || { files: [], folders: [] }

    // Sort folders and files
    dirData.folders.sort((a, b) => {
      const aName = a.path.split("/").filter(p => p).pop() || ""
      const bName = b.path.split("/").filter(p => p).pop() || ""
      return aName.localeCompare(bName)
    })
    dirData.files.sort((a, b) => {
      const aName = a.path.split("/").filter(p => p).pop() || ""
      const bName = b.path.split("/").filter(p => p).pop() || ""
      return aName.localeCompare(bName)
    })

    dirData.folders.forEach(folder => {
      const isExpanded = expandedFolders.has(folder.path)
      const folderName = folder.path.split("/").filter(p => p).pop() || folder.path || "root"
      items.push(
        <div key={folder.path}>
          <button
            onClick={() => toggleFolder(folder.path)}
            className="w-full text-left px-2.5 py-1 rounded-md hover:bg-zinc-900/70 flex items-center gap-1 text-xs text-zinc-300"
            style={{ paddingLeft: `${level * 16}px` }}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {isExpanded ? <FolderOpen className="h-3.5 w-3.5 text-zinc-400" /> : <Folder className="h-3.5 w-3.5 text-zinc-400" />}
            <span className="font-mono">{folderName}</span>
          </button>
          {isExpanded && (
            <>
              {renderFileTree(folder.path.replace(/^\//, "").replace(/\/$/, ""), level + 1)}
            </>
          )}
        </div>
      )
    })

    dirData.files.forEach(file => {
      const normalizedPath = file.path.replace(/^\//, "")
      const isActive = activeFile === normalizedPath || activeFile === file.path
      const fileName = normalizedPath.split("/").pop() || normalizedPath
      const getFileIcon = () => {
        if (file.path.endsWith(".py")) return <FileCode2 className="h-3.5 w-3.5 text-zinc-400" />
        if (file.path.endsWith(".json")) return <FileCode2 className="h-3.5 w-3.5 text-zinc-400" />
        if (file.path.endsWith(".txt")) return <FileText className="h-3.5 w-3.5 text-zinc-400" />
        if (file.path.endsWith(".md")) return <FileText className="h-3.5 w-3.5 text-zinc-400" />
        return <FileCode2 className="h-3.5 w-3.5 text-zinc-400" />
      }
      items.push(
        <button
          key={file.path}
          onClick={() => handleFileSelect(file.path)}
          className={`w-full text-left px-2.5 py-1 rounded-md hover:bg-zinc-900/70 flex items-center gap-1 text-xs ${isActive ? "bg-zinc-800 text-white" : "text-zinc-300"}`}
          style={{ paddingLeft: `${level * 16 + 20}px` }}
        >
          {getFileIcon()}
          <span className="font-mono">{fileName}</span>
        </button>
      )
    })

    return items
  }

  // Inactivity timeout (5 minutes)
  useEffect(() => {
    const resetTimer = () => {
      setLastActivity(Date.now())
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
      const timer = setTimeout(() => {
        // Turn off the page after 5 minutes of inactivity
        window.location.href = "/"
      }, 5 * 60 * 1000) // 5 minutes
      setInactivityTimer(timer)
    }

    const handleActivity = () => {
      resetTimer()
    }

    resetTimer()

    window.addEventListener('mousedown', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('scroll', handleActivity)
    window.addEventListener('touchstart', handleActivity)

    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer)
      }
      window.removeEventListener('mousedown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('touchstart', handleActivity)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? e.metaKey : e.ctrlKey

      if (modKey && e.key === 'Enter' && !running && activeFile?.endsWith('.py')) {
        e.preventDefault()
        setPendingInputs([])
        runCode()
      }

      if (modKey && e.key === 's') {
        e.preventDefault()
        if (activeFile) {
          saveFile(activeFile, fileContent)
          setTerminalOutput(prev => prev + "\nFile saved.\n")
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeFile, fileContent, running])

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [terminalOutput])

  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [waitingForInput])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
      </div>
    )
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-zinc-400 mb-4">
            You need to be level 100 or the owner to access MEDIOCRE IDE.
          </p>
          <p className="text-sm text-zinc-500">
            Your current level: {userLevel}
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-white text-black rounded hover:bg-zinc-200 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <div className="border-b border-zinc-800 bg-black px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-zinc-200 hover:text-white transition"
            >
              <Code className="h-4 w-4" />
              <span>MEDIOCRE IDE</span>
            </Link>
            <div className="hidden md:flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-md px-2 py-1.5">
              <Folder className="h-3.5 w-3.5 text-zinc-500" />
              <select
                value={selectedProject?.id || ""}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="bg-transparent text-xs text-zinc-200 outline-none font-medium"
              >
                {projects.length === 0 && (
                  <option value="">No projects</option>
                )}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            {activeFile && (
              <div className="text-[11px] text-zinc-300 font-mono bg-zinc-900/70 px-2 py-1 rounded border border-zinc-800">
                {activeFile}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </button>
            {selectedProject?.flaskUrl && (
              <a
                href={selectedProject.flaskUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition font-medium"
              >
                <Network className="h-3.5 w-3.5" />
                <span>Open Flask App</span>
              </a>
            )}
            {selectedProject && !selectedProject.flaskUrl && (
              <button
                onClick={launchFlaskApp}
                disabled={launchingFlask}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition disabled:opacity-50 font-medium"
              >
                {launchingFlask ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                <span>{launchingFlask ? "Launching..." : "Launch Flask"}</span>
              </button>
            )}
            {selectedProject?.flaskUrl && (
              <button
                onClick={stopFlaskApp}
                disabled={stoppingFlask}
                className="inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition disabled:opacity-50 font-medium"
              >
                {stoppingFlask ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SquareTerminal className="h-3.5 w-3.5" />}
                <span>{stoppingFlask ? "Stopping..." : "Stop Flask"}</span>
              </button>
            )}
            <button
              onClick={runCode}
              disabled={running || !activeFile?.endsWith(".py")}
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-md border border-white/20 bg-white text-black hover:bg-zinc-200 transition disabled:opacity-50 font-medium"
            >
              {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              <span>{running ? "Running" : "Run"}</span>
            </button>
            <button
              onClick={() => setShowNewFileModal(true)}
              disabled={!selectedProject}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FilePlus className="h-3.5 w-3.5" />
              <span>New File</span>
            </button>
            <button
              onClick={() => setShowNewFolderModal(true)}
              disabled={!selectedProject}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>New Folder</span>
            </button>
          </div>
        </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-14" : "w-12"} border-r border-zinc-800 bg-[#0a0a0a] flex flex-col transition-all duration-200 overflow-hidden`}>
          <div className="flex flex-col items-center py-3 gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              title="Toggle sidebar"
            >
              <ChevronRight className={`h-5 w-5 text-zinc-400 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
            </button>
            {sidebarOpen && (
              <>
                <button
                  onClick={() => setActiveSidebarView('explorer')}
                  className={`p-2.5 rounded-md border border-zinc-800 transition-colors group relative ${
                    activeSidebarView === 'explorer' ? 'bg-zinc-800' : 'hover:bg-zinc-900'
                  }`}
                  title="Project Files"
                >
                  <Folder className={`h-5 w-5 transition-colors ${
                    activeSidebarView === 'explorer' ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                  }`} />
                </button>
                {githubConnected && (
                  <button
                    onClick={() => {
                      setActiveSidebarView('github')
                      if (selectedProject?.githubRepo) {
                        loadCommits()
                        loadBranches()
                      }
                    }}
                    className={`p-2.5 rounded-md border border-zinc-800 transition-colors group relative ${
                      activeSidebarView === 'github' ? 'bg-zinc-800' : 'hover:bg-zinc-900'
                    }`}
                    title={selectedProject?.githubRepo ? "GitHub Repository" : "Initialize GitHub Repository"}
                  >
                    <GitBranch className={`h-5 w-5 transition-colors ${
                      activeSidebarView === 'github' 
                        ? 'text-white' 
                        : selectedProject?.githubRepo 
                          ? "text-zinc-400 group-hover:text-white" 
                          : "text-zinc-600 group-hover:text-zinc-400"
                    }`} />
                  </button>
                )}
                <button
                  onClick={() => setActiveSidebarView('plugins')}
                  className={`p-2.5 rounded-md border border-zinc-800 transition-colors group relative ${
                    activeSidebarView === 'plugins' ? 'bg-zinc-800' : 'hover:bg-zinc-900'
                  }`}
                  title="Plugins"
                >
                  <Plug className={`h-5 w-5 transition-colors ${
                    activeSidebarView === 'plugins' ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                  }`} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main IDE Area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex-1 flex min-h-0 min-w-0">
            {/* File Explorer / GitHub / Plugins Panel */}
            {activeSidebarView === 'explorer' ? (
              <div className="w-60 border-r border-zinc-800 bg-[#0b0b0b] flex flex-col">
                <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                    <Folder className="h-3.5 w-3.5" />
                    <span>Explorer</span>
                  </div>
                </div>
                {selectedProject && (
                  <div className="border-b border-zinc-800 px-4 py-3 space-y-1">
                    <div className="text-xs font-semibold text-zinc-200">{selectedProject.name}</div>
                    <div className="text-[11px] text-zinc-500 line-clamp-2">
                      {selectedProject.description || "No description provided yet."}
                    </div>
                  </div>
                )}
                <div className="flex-1 overflow-auto">
                  {!selectedProject ? (
                    <div className="px-4 py-6 text-xs text-zinc-500 text-center space-y-3">
                      <p>No project selected.</p>
                      <button
                        onClick={() => setShowNewProjectModal(true)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create a project
                      </button>
                    </div>
                  ) : files.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-zinc-500 text-center">
                      No files yet. Create a file to get started.
                    </div>
                  ) : (
                    renderFileTree("")
                  )}
                </div>
              </div>
            ) : activeSidebarView === 'github' ? (
              <div className="w-60 border-r border-zinc-800 bg-[#0b0b0b] flex flex-col">
                <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                    <GitBranch className="h-3.5 w-3.5" />
                    <span>Source Control</span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  {selectedProject?.githubRepo ? (
                    <div className="p-3 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Repository</h3>
                          <a
                            href={selectedProject.githubUrl || `https://github.com/${selectedProject.githubOwner}/${selectedProject.githubRepo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-zinc-400 hover:text-white"
                          >
                            View →
                          </a>
                        </div>
                        <div className="text-xs font-mono text-zinc-400 bg-zinc-900/70 px-2 py-1 rounded border border-zinc-800">
                          {selectedProject.githubOwner}/{selectedProject.githubRepo}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Branches</h3>
                          {loadingBranches ? (
                            <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                          ) : (
                            <button
                              onClick={loadBranches}
                              className="text-[10px] text-zinc-400 hover:text-white"
                            >
                              Refresh
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          {branches.length === 0 ? (
                            <div className="text-xs text-zinc-500 px-2 py-1">No branches</div>
                          ) : (
                            branches.map((branch) => (
                              <div
                                key={branch.name}
                                className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-900/70 rounded text-xs font-mono text-zinc-400"
                              >
                                <GitBranch className="h-3 w-3" />
                                <span>{branch.name}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Recent Commits</h3>
                          {loadingCommits ? (
                            <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                          ) : (
                            <button
                              onClick={loadCommits}
                              className="text-[10px] text-zinc-400 hover:text-white"
                            >
                              Refresh
                            </button>
                          )}
                        </div>
                        <div className="space-y-2 max-h-64 overflow-auto">
                          {commits.length === 0 ? (
                            <div className="text-xs text-zinc-500 px-2 py-1">No commits</div>
                          ) : (
                            commits.slice(0, 10).map((commit) => (
                              <div
                                key={commit.sha}
                                className="px-2 py-1.5 hover:bg-zinc-900/70 rounded border border-zinc-800"
                              >
                                <div className="text-xs font-mono text-zinc-300 mb-1 line-clamp-1">
                                  {commit.commit.message.split('\n')[0]}
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                  {new Date(commit.commit.author.date).toLocaleDateString()} • {commit.sha.substring(0, 7)}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-800 space-y-2">
                        <button
                          onClick={pullLatestFromGithub}
                          disabled={pullingLatest}
                          className="w-full px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded text-xs font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pullingLatest ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitBranch className="h-3.5 w-3.5" />}
                          Pull Latest
                        </button>
                        <button
                          onClick={() => setShowCommitModal(true)}
                          className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-xs font-medium flex items-center justify-center gap-2 transition"
                        >
                          <GitCommit className="h-3.5 w-3.5" />
                          Commit Changes
                        </button>
                        <button
                          onClick={() => {
                            if (selectedProject.githubUrl) {
                              window.open(`${selectedProject.githubUrl}/network`, "_blank")
                            } else {
                              window.open(`https://github.com/${selectedProject.githubOwner}/${selectedProject.githubRepo}/network`, "_blank")
                            }
                          }}
                          className="w-full px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded text-xs font-medium flex items-center justify-center gap-2 transition"
                        >
                          <Network className="h-3.5 w-3.5" />
                          View Network Graph
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 space-y-4">
                      <div className="text-xs text-zinc-400 mb-4">
                        This project is not connected to a GitHub repository.
                      </div>
                      <button
                        onClick={() => setShowInitializeModal(true)}
                        className="w-full px-3 py-2 bg-white text-black hover:bg-zinc-200 rounded text-xs font-medium transition"
                      >
                        Initialize Repository
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-60 border-r border-zinc-800 bg-[#0b0b0b] flex flex-col">
                <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-semibold">
                    <Plug className="h-3.5 w-3.5" />
                    <span>Plugins</span>
                  </div>
                </div>
                <div className="flex-1 overflow-auto px-3 py-4 space-y-3">
                  {pluginCatalog.map((plugin) => (
                    <div
                      key={plugin.name}
                      className="rounded-md border border-zinc-800 bg-zinc-950 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold text-zinc-200">{plugin.name}</div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded">
                          {plugin.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{plugin.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editor */}
            <div className="flex-1 flex flex-col bg-[#0c0c0c] min-w-0">
              {!selectedProject ? (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                  <div className="text-center space-y-4">
                    <div className="text-sm text-zinc-400">Choose a project to start coding.</div>
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition"
                    >
                      <Plus className="h-4 w-4" />
                      New Project
                    </button>
                  </div>
                </div>
              ) : activeFile ? (
                <>
                  {activeFile.endsWith(".md") && (
                    <div className="border-b border-zinc-800 px-4 py-2 flex items-center justify-between bg-black">
                      <span className="text-xs text-zinc-400">Markdown Editor</span>
                      <button
                        onClick={() => setShowMarkdownHelp(true)}
                        className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-900 transition"
                      >
                        <Keyboard className="h-3.5 w-3.5" />
                        Markdown Syntax Help
                      </button>
                    </div>
                  )}
                  <Monaco
                    height="100%"
                    language={
                      activeFile.endsWith(".py") ? "python" :
                      activeFile.endsWith(".json") ? "json" :
                      activeFile.endsWith(".js") ? "javascript" :
                      activeFile.endsWith(".ts") ? "typescript" :
                      activeFile.endsWith(".html") ? "html" :
                      activeFile.endsWith(".css") ? "css" :
                      activeFile.endsWith(".md") ? "markdown" :
                      "plaintext"
                    }
                    theme="vs-dark"
                    value={activeFile === "requirements.txt" ? requirementsTxt : fileContent}
                    onChange={activeFile === "requirements.txt" ? handleRequirementsChange : handleFileContentChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      smoothScrolling: true,
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      fontFamily: "'Cascadia Code', 'Consolas', 'Courier New', monospace",
                      lineHeight: 20,
                      padding: { top: 8, bottom: 8 }
                    }}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                  Select a file to edit
                </div>
              )}
            </div>
          </div>

          {/* Terminal */}
          <div
            className="border-t border-zinc-800 bg-black flex flex-col"
            style={{
              height: `${terminalOpen ? terminalHeight : collapsedHeight}px`,
              minHeight: `${terminalOpen ? terminalHeight : collapsedHeight}px`,
              transition: "height 0.2s ease-in-out"
            }}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5 flex-shrink-0" style={{ height: `${collapsedHeight}px` }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTerminalOpen(!terminalOpen)}
                  className="text-xs text-zinc-300 hover:text-white"
                >
                  {terminalOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500 font-semibold flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5" />
                  Terminal
                </div>
                {waitingForInput && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 animate-pulse">
                    Waiting for input
                  </span>
                )}
                {running && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700">
                    Running...
                  </span>
                )}
                {installingPackages && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700">
                    Installing packages...
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setTerminalOutput("")
                  setPendingInputs([])
                }}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            {terminalOpen && (
              <div className="flex-1 flex flex-col" style={{ overflow: "hidden", height: `calc(100% - ${collapsedHeight}px)` }}>
                <div className="flex-1 p-3 font-mono text-xs bg-black text-zinc-100 overflow-auto">
                  <pre className="whitespace-pre-wrap">{terminalOutput || "Terminal ready..."}</pre>
                  <div ref={terminalEndRef} />
                </div>
                <div className="border-t border-zinc-800 px-3 py-2 bg-[#0a0a0a] flex items-center gap-2">
                  <span className="text-zinc-500 text-xs font-mono">&gt;</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={stdinInput}
                    onChange={e => setStdinInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleInputSubmit()
                      }
                    }}
                    placeholder={waitingForInput ? "Type your input and press Enter..." : "Input for program (press Enter to send)"}
                    className={`flex-1 bg-transparent text-xs font-mono outline-none placeholder:text-zinc-600 ${
                      waitingForInput ? "text-zinc-200 placeholder:text-zinc-500" : "text-white"
                    }`}
                    disabled={running && !waitingForInput}
                  />
                  <button
                    onClick={handleInputSubmit}
                    disabled={running && !waitingForInput}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-zinc-800 rounded-lg p-6 w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Project</h2>
              <button onClick={() => {
                setShowNewProjectModal(false)
                setNewProjectName("")
                setNewProjectDesc("")
                setPullFromRepo(false)
                setPullOwner("")
                setPullRepo("")
                setPullBranch("main")
                setAvailableRepos([])
              }} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") createProject()
                  }}
                  placeholder="My Project"
                  className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Description (optional)</label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") createProject()
                  }}
                  placeholder="Project description"
                  className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>
              {githubConnected && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="pullFromRepo"
                      checked={pullFromRepo}
                      onChange={e => {
                        setPullFromRepo(e.target.checked)
                        if (e.target.checked && githubUsername) {
                          // Hardlock the username to the connected GitHub username
                          setPullOwner(githubUsername)
                          fetchAvailableRepos()
                        } else if (!e.target.checked) {
                          // Reset when unchecked
                          setPullOwner("")
                          setPullRepo("")
                          setPullBranch("main")
                          setAvailableRepos([])
                        }
                      }}
                      className="w-4 h-4 rounded border-white/15 bg-black text-white focus:ring-2 focus:ring-white/20"
                    />
                    <label htmlFor="pullFromRepo" className="text-xs text-zinc-300 cursor-pointer flex items-center gap-2">
                      <GitBranch className="h-3.5 w-3.5" />
                      Pull from existing GitHub repository
                    </label>
                  </div>
                  {pullFromRepo && (
                    <div className="pl-6 space-y-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-2">Repository Owner</label>
                        <input
                          type="text"
                          value={pullOwner || githubUsername || ""}
                          readOnly
                          placeholder="username"
                          className="w-full px-3 py-2 bg-black/50 border border-white/15 rounded text-white text-sm placeholder-zinc-600 cursor-not-allowed opacity-70 font-mono"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Locked to your GitHub username</p>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-2">Repository</label>
                        <select
                          value={pullRepo}
                          onChange={e => {
                            const selectedRepo = availableRepos.find(r => r.name === e.target.value)
                            if (selectedRepo) {
                              setPullRepo(selectedRepo.name)
                              // Extract branch from selected repo if available
                              if (selectedRepo.default_branch) {
                                setPullBranch(selectedRepo.default_branch)
                              }
                            } else {
                              setPullRepo(e.target.value)
                            }
                          }}
                          onFocus={() => {
                            if (pullOwner || githubUsername) {
                              fetchAvailableRepos()
                            }
                          }}
                          disabled={loadingRepos || !(pullOwner || githubUsername)}
                          className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm focus:outline-none focus:border-white font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">Select a repository...</option>
                          {availableRepos.map((repo) => (
                            <option key={repo.id} value={repo.name}>
                              {repo.name}
                            </option>
                          ))}
                        </select>
                        {loadingRepos && (
                          <p className="text-xs text-zinc-500 mt-1">Loading repositories...</p>
                        )}
                        {!loadingRepos && availableRepos.length === 0 && (pullOwner || githubUsername) && (
                          <p className="text-xs text-zinc-500 mt-1">No available repositories found</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-2">Branch (optional)</label>
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
              )}
              {githubConnected && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      id="createGithubRepo"
                      className="w-4 h-4 rounded border-white/15 bg-black text-white focus:ring-2 focus:ring-white/20"
                    />
                    <label htmlFor="createGithubRepo" className="text-xs text-zinc-300 cursor-pointer flex items-center gap-2">
                      <GitBranch className="h-3.5 w-3.5" />
                      Create GitHub repository
                    </label>
                  </div>
                  <div className="pl-6 space-y-3 text-xs">
                    <div>
                      <label className="block text-zinc-400 mb-2">GitHub Username</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={githubUsername}
                          onChange={e => {
                            setGithubUsername(e.target.value)
                            setGithubUsernameChecked(false)
                          }}
                          onBlur={() => {
                            if (githubUsername.trim() && !githubUsernameChecked) {
                              checkGithubUsername(githubUsername)
                            }
                          }}
                          disabled={githubUsernameChecked}
                          placeholder="your-username"
                            className={`flex-1 px-3 py-2 bg-black border rounded text-white text-sm placeholder-zinc-600 focus:outline-none font-mono ${
                            githubUsernameChecked 
                              ? 'border-zinc-600 bg-zinc-900/60 cursor-not-allowed' 
                              : 'border-white/15 focus:border-white'
                          }`}
                        />
                        {checkingUsername && (
                          <div className="flex items-center px-3">
                            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                          </div>
                        )}
                        {githubUsernameChecked && !checkingUsername && (
                          <div className="flex items-center px-3">
                            <CheckCircle2 className="h-4 w-4 text-zinc-300" />
                          </div>
                        )}
                      </div>
                      {githubUsernameChecked && (
                        <p className="text-xs text-zinc-400 mt-1">✓ Username verified</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowNewProjectModal(false)
                  setNewProjectName("")
                  setNewProjectDesc("")
                  setPullFromRepo(false)
                  setPullOwner("")
                  setPullRepo("")
                  setPullBranch("main")
                  setAvailableRepos([])
                }}
                className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProjectName.trim() || pullingRepo || (pullFromRepo && (!pullOwner.trim() || !pullRepo.trim()))}
                className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {showNewPageModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-zinc-800 rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Page</h2>
              <button onClick={() => setShowNewPageModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-xs text-zinc-400 mb-2">Page Name</label>
              <input
                type="text"
                value={newPageName}
                onChange={e => setNewPageName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") createPage()
                }}
                placeholder="My Page"
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewPageModal(false)
                  setNewPageName("")
                }}
                className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createPage}
                disabled={!newPageName.trim()}
                className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-zinc-800 rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New File</h2>
              <button onClick={() => setShowNewFileModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-xs text-zinc-400 mb-2">File Path</label>
              <input
                type="text"
                value={newFilePath}
                onChange={e => setNewFilePath(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newFilePath.trim()) {
                    createFile(newFilePath.trim(), "")
                    setShowNewFileModal(false)
                    setNewFilePath("")
                    setActiveFile(newFilePath.trim())
                    setFileContent("")
                  }
                }}
                placeholder="src/app.py or config.json"
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewFileModal(false)
                  setNewFilePath("")
                }}
                className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFilePath.trim()) {
                    createFile(newFilePath.trim(), "")
                    setShowNewFileModal(false)
                    setNewFilePath("")
                    setActiveFile(newFilePath.trim())
                    setFileContent("")
                  }
                }}
                disabled={!newFilePath.trim()}
                className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-zinc-800 rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Folder</h2>
              <button onClick={() => setShowNewFolderModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-xs text-zinc-400 mb-2">Folder Path</label>
              <input
                type="text"
                value={newFolderPath}
                onChange={e => setNewFolderPath(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newFolderPath.trim()) {
                    createFolder(newFolderPath.trim())
                    setShowNewFolderModal(false)
                    setNewFolderPath("")
                  }
                }}
                placeholder="src/components or utils"
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNewFolderModal(false)
                  setNewFolderPath("")
                }}
                className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFolderPath.trim()) {
                    createFolder(newFolderPath.trim())
                    setShowNewFolderModal(false)
                    setNewFolderPath("")
                  }
                }}
                disabled={!newFolderPath.trim()}
                className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initialize Repository Modal */}
      {showInitializeModal && selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-zinc-800 rounded-lg p-6 w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Initialize GitHub Repository</h2>
              <button onClick={() => setShowInitializeModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">GitHub Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={e => {
                      setGithubUsername(e.target.value)
                      setGithubUsernameChecked(false)
                    }}
                    onBlur={() => {
                      if (githubUsername.trim() && !githubUsernameChecked) {
                        checkGithubUsername(githubUsername)
                      }
                    }}
                    disabled={githubUsernameChecked}
                    placeholder="your-username"
                    className={`flex-1 px-3 py-2 bg-black border rounded text-white text-sm placeholder-zinc-600 focus:outline-none font-mono ${
                      githubUsernameChecked 
                        ? 'border-zinc-600 bg-zinc-900/60 cursor-not-allowed' 
                        : 'border-white/15 focus:border-white'
                    }`}
                  />
                  {checkingUsername && (
                    <div className="flex items-center px-3">
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                    </div>
                  )}
                  {githubUsernameChecked && !checkingUsername && (
                  <div className="flex items-center px-3">
                    <CheckCircle2 className="h-4 w-4 text-zinc-300" />
                  </div>
                  )}
                </div>
                {githubUsernameChecked && (
                  <p className="text-xs text-zinc-400 mt-1">✓ Username verified</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Repository Name</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={e => setRepoName(e.target.value)}
                  placeholder={selectedProject.name.toLowerCase().replace(/\s+/g, '-')}
                  className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Description (optional)</label>
                <input
                  type="text"
                  value={repoDescription}
                  onChange={e => setRepoDescription(e.target.value)}
                  placeholder={selectedProject.description || "Project description"}
                  className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="repoPrivate"
                  checked={repoPrivate}
                  onChange={e => setRepoPrivate(e.target.checked)}
                  className="w-4 h-4 rounded border-white/15 bg-black text-white focus:ring-2 focus:ring-white/20"
                />
                <label htmlFor="repoPrivate" className="text-xs text-zinc-400 cursor-pointer">
                  Make this repository private
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowInitializeModal(false)
                    setRepoName("")
                    setRepoDescription("")
                    setRepoPrivate(false)
                  }}
                  className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={initializeRepository}
                  disabled={!repoName.trim() || !githubUsername.trim() || initializingRepo || !githubUsernameChecked}
                  className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {initializingRepo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Initialize"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commit Changes Modal */}
      {showCommitModal && selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-zinc-800 rounded-lg p-6 w-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Commit Changes</h2>
              <button onClick={() => setShowCommitModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Commit Message</label>
                <textarea
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="Describe your changes..."
                  rows={4}
                  className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white resize-none"
                />
              </div>
              <div className="text-xs text-zinc-500">
                All modified files will be committed to the repository.
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowCommitModal(false)
                    setCommitMessage("")
                  }}
                  className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={commitChanges}
                  disabled={!commitMessage.trim() || committingChanges}
                  className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {committingChanges ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Committing...
                    </>
                  ) : (
                    <>
                      <GitCommit className="h-4 w-4" />
                      Commit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Markdown Syntax Help Modal */}
      {showMarkdownHelp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black border border-zinc-800 rounded-lg p-6 w-[600px] max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Markdown Syntax Guide</h2>
              <button onClick={() => setShowMarkdownHelp(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-white mb-2">Headers</h3>
                <pre className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-300 overflow-x-auto">
{`# H1 Header
## H2 Header
### H3 Header
#### H4 Header`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Text Formatting</h3>
                <pre className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-300 overflow-x-auto">
{`**bold text**
*italic text*
~~strikethrough~~
\`inline code\``}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Lists</h3>
                <pre className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-300 overflow-x-auto">
{`- Unordered item 1
- Unordered item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Links & Images</h3>
                <pre className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-300 overflow-x-auto">
{`[Link text](https://example.com)
![Image alt](image-url.png)`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Code Blocks</h3>
                <pre className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-300 overflow-x-auto">
{`\`\`\`python
def hello():
    print("Hello, World!")
\`\`\``}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Blockquotes</h3>
                <pre className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-300 overflow-x-auto">
{`> This is a blockquote
> It can span multiple lines`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Tables</h3>
                <pre className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-300 overflow-x-auto">
{`| Column 1 | Column 2 |
|----------|----------|
| Row 1    | Data     |
| Row 2    | Data     |`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Horizontal Rule</h3>
                <pre className="bg-black/50 p-3 rounded text-xs font-mono text-zinc-300 overflow-x-auto">
{`---`}
                </pre>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowMarkdownHelp(false)}
                className="w-full px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
