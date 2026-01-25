"use client"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileCode2,
  FileText,
  Folder,
  Home,
  Keyboard,
  Loader2,
  Plus,
  SquareTerminal,
  Trash2,
  X,
  Eye,
  Code
} from "lucide-react"
import Link from "next/link"
import MusicPlayer from "@/components/MusicPlayer"

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type FileNode = { path: string, kind: "html" | "text", content: string, mimeType?: string | null }
type FileType = "html" | "js"

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [code, setCode] = useState("")
  const [files, setFiles] = useState<FileNode[]>([])
  const [active, setActive] = useState<string>("html/index.html")
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [fileName, setFileName] = useState("")
  const [fileType, setFileType] = useState<FileType>("html")
  const [showConcepts, setShowConcepts] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [explorerOpenHtml, setExplorerOpenHtml] = useState(true)
  const [explorerOpenJs, setExplorerOpenJs] = useState(true)
  const [previewMode, setPreviewMode] = useState<"split" | "editor" | "preview">("split")
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null)
  const previewRef = useRef<HTMLIFrameElement | null>(null)
  const editorRef = useRef<any>(null)
  const activeFileRef = useRef<string>(active)

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  // Load files from server on mount when authenticated
  useEffect(() => {
    if (status !== "authenticated") return
    const load = async () => {
      try {
        const res = await fetch("/api/files", { credentials: "include" })
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const htmlFiles = data.filter((f: FileNode) => f.path.startsWith("html/"))
          if (htmlFiles.length > 0) {
            setFiles(htmlFiles)
            const index = htmlFiles.find((f: FileNode) => f.path === "html/index.html")
            if (index) {
              const path = "html/index.html"
              setActive(path)
              activeFileRef.current = path
              setCode(index.content || "")
            } else {
              const path = htmlFiles[0]?.path || "html/index.html"
              setActive(path)
              activeFileRef.current = path
              setCode(htmlFiles[0]?.content || "")
            }
          } else {
            await bootstrapDefaults()
          }
        } else {
          await bootstrapDefaults()
        }
      } catch (e) {
        console.error("Failed to load files", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [status])

  // Update preview when code changes
  useEffect(() => {
    if (previewRef.current && active.endsWith('.html')) {
      const iframe = previewRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        // Inject JavaScript files into the HTML preview
        const jsFiles = files.filter(f => f.path.endsWith('.js'))
        let htmlContent = code
        
        doc.open()
        doc.write(htmlContent)
        doc.close()
        
        // Wait for DOM to be ready, then inject JavaScript code directly
        if (jsFiles.length > 0) {
          const injectScripts = () => {
            if (doc.body) {
              jsFiles.forEach(jsFile => {
                const script = doc.createElement('script')
                script.textContent = jsFile.content
                doc.body.appendChild(script)
              })
            } else {
              setTimeout(injectScripts, 50)
            }
          }
          injectScripts()
        }
      }
    }
  }, [code, active, files])

  // Save files before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (active && code && saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        const ext = active.split('.').pop()
        let kind: "html" | "text" = "text"
        if (ext === "html") kind = "html"
        
        fetch("/api/files", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ path: active, kind, content: code }),
          keepalive: true
        }).catch(() => {})
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [active, code])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + S: Save file
      if (modKey && e.key === 's') {
        e.preventDefault()
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveFile(active, code)
        const next = files.map(f => f.path === active ? { ...f, content: code } : f)
        setFiles(next)
      }

      // Ctrl/Cmd + N: New file
      if (modKey && e.key === 'n') {
        e.preventDefault()
        setShowModal(true)
      }

      // Ctrl/Cmd + P: Toggle preview mode
      if (modKey && e.key === 'p') {
        e.preventDefault()
        setPreviewMode(prev => prev === "split" ? "preview" : prev === "preview" ? "editor" : "split")
      }

      // ? : Show shortcuts
      if (e.key === '?' && !modKey) {
        e.preventDefault()
        setShowShortcuts(true)
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        setShowShortcuts(false)
        setShowConcepts(false)
        setShowModal(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active, code, files, previewMode])

  const bootstrapDefaults = async () => {
    const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My HTML Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Hello, Tailwind!</h1>
        <p class="text-gray-600 mb-6">
            This is a sample HTML page with Tailwind CSS. Start editing to see live preview!
        </p>
        <button class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition">
            Click me
        </button>
    </div>
</body>
</html>`
    
    const defaultFile: FileNode = {
      path: "html/index.html",
      kind: "html",
      content: defaultHtml
    }
    
    try {
      const res = await fetch("/api/files", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(defaultFile)
      })
      if (res.ok) {
        const saved = await res.json()
        setFiles([saved])
        const path = "html/index.html"
        setActive(path)
        activeFileRef.current = path
        setCode(defaultHtml)
      }
    } catch (e) {
      console.error("Error saving default file:", e)
    }
  }

  const saveFile = async (path: string, content: string) => {
    try {
      const ext = path.split('.').pop()
      let kind: "html" | "text" = "text"
      if (ext === "html") kind = "html"
      // JavaScript files are saved as "text" kind
      
      await fetch("/api/files", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ path, kind, content })
      })
    } catch (e) {
      console.error("Failed to save", e)
    }
  }

  const selectFile = (path: string) => {
    const f = files.find(x => x.path === path)
    setActive(path)
    activeFileRef.current = path
    setCode(f?.content || "")
  }

  const updateContent = (val: string) => {
    setCode(val)
    
    // Auto-save with 5-second debounce
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      saveFile(active, val)
      const next = files.map(f => f.path === active ? { ...f, content: val } : f)
      setFiles(next)
    }, 5000)
  }

  const createFile = (name: string, type: FileType = "html") => {
    if (!name.trim()) return
    
    const extension = type === "html" ? "html" : "js"
    const path = `html/${name}.${extension}`
    
    if (files.some(f => f.path === path)) {
      alert("File already exists")
      return
    }

    let content = ""
    if (type === "html") {
      content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto p-8">
        <h1 class="text-2xl font-bold">${name}</h1>
    </div>
</body>
</html>`
    } else {
      content = `// ${name}.js
// Your JavaScript code here

console.log('Hello from ${name}.js');

// Example: Add event listeners, functions, etc.
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded!');
});
`
    }

    const newFile: FileNode = { path, kind: type === "html" ? "html" : "text", content }
    
    const next = [...files, newFile]
    setFiles(next)
    setActive(path)
    activeFileRef.current = path
    setCode(content)
    saveFile(path, content)
    
    setShowModal(false)
    setFileName("")
    setFileType("html")
  }

  const deleteFile = async (path: string) => {
    if (path === "html/index.html") return // Protect index.html
    try {
      await fetch("/api/files", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ path })
      })
      const next = files.filter(f => f.path !== path)
      setFiles(next)
      if (active === path) {
        const newPath = next[0]?.path || "html/index.html"
        setActive(newPath)
        activeFileRef.current = newPath
        setCode(next[0]?.content || "")
      }
    } catch (e) {
      console.error("Failed to delete", e)
    }
  }

  const startDeleteHold = (path: string) => {
    if (path === "html/index.html") return
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    deleteTimerRef.current = setTimeout(() => deleteFile(path), 600)
  }

  const cancelDeleteHold = () => {
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current)
      deleteTimerRef.current = null
    }
  }

  const htmlFiles = files.filter(f => f.path.startsWith("html/") && f.path.endsWith('.html'))
  const jsFiles = files.filter(f => f.path.startsWith("html/") && f.path.endsWith('.js'))
  const getEditorLanguage = () => {
    if (active.endsWith('.js')) return 'javascript'
    if (active.endsWith('.html')) return 'html'
    return 'text'
  }

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor
    
    // List of common HTML tags that should auto-complete
    const htmlTags = [
      'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo',
      'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup',
      'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em',
      'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
      'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noscript',
      'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress',
      'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source',
      'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template',
      'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var',
      'video', 'wbr'
    ]

    // Add keydown listener for auto-completion
    editor.onKeyDown((e: any) => {
      // Only apply to HTML files
      if (!activeFileRef.current.endsWith('.html')) return
      
      const model = editor.getModel()
      const position = editor.getPosition()
      if (!model || !position) return

      // Check if Enter key was pressed for tag autocomplete
      if (e.keyCode === monaco.KeyCode.Enter || e.keyCode === 13) { // Enter key
        const lineContent = model.getLineContent(position.lineNumber)
        const textBeforeCursor = lineContent.substring(0, position.column - 1)
        const textAfterCursor = lineContent.substring(position.column - 1)
        
        // Only trigger if:
        // 1. Text before cursor is just whitespace + tag name
        // 2. Text after cursor is empty or just whitespace
        const beforeTrimmed = textBeforeCursor.trim()
        const afterTrimmed = textAfterCursor.trim()
        
        if (afterTrimmed === "" && beforeTrimmed) {
          // Match pattern: just a tag name (like "div", "html", "style")
          const match = beforeTrimmed.match(/^([a-zA-Z][a-zA-Z0-9]*)$/)
          
          if (match) {
            const tagName = match[1].toLowerCase()
            
            // Check if it's a valid HTML tag
            if (htmlTags.includes(tagName)) {
              e.preventDefault()
              
              // Get indentation from current line
              const indentMatch = lineContent.match(/^(\s*)/)
              const indent = indentMatch ? indentMatch[1] : ""
              const tabSize = editor.getModel()?.getOptions().tabSize || 2
              const nextIndent = indent + " ".repeat(tabSize)
              
              // Calculate the start position of the tag name (including leading whitespace)
              const tagStartColumn = position.column - beforeTrimmed.length
              
              // Create range using Monaco's Range class (replace entire line content)
              const range = new monaco.Range(
                position.lineNumber,
                tagStartColumn,
                position.lineNumber,
                lineContent.length + 1
              )
              
              // Replace with 3-line tag structure
              const replacement = `<${tagName}>\n${nextIndent}\n${indent}</${tagName}>`
              editor.executeEdits('html-tag-autocomplete-enter', [{
                range: range,
                text: replacement
              }])
              
              // Position cursor in the middle line, indented
              const newPosition = {
                lineNumber: position.lineNumber + 1,
                column: nextIndent.length + 1
              }
              editor.setPosition(newPosition)
              editor.revealPositionInCenter(newPosition)
              return
            }
          }
        }
      }
      
      // Check if spacebar was pressed
      if (e.keyCode === 32) { // Space key
        // Get the current line up to the cursor (before space is inserted)
        const lineContent = model.getLineContent(position.lineNumber)
        const textBeforeCursor = lineContent.substring(0, position.column - 1)
        
        // Match pattern: word characters at the end (without requiring space)
        // We want to match things like "p", "div", etc. right before the cursor
        const match = textBeforeCursor.match(/([a-zA-Z][a-zA-Z0-9]*)$/)
        
        if (match) {
          const tagName = match[1].toLowerCase()
          
          // Check if it's a valid HTML tag
          if (htmlTags.includes(tagName)) {
            e.preventDefault()
            
            // Calculate the start position of the tag name
            const tagStartColumn = position.column - match[1].length
            
            // Create range using Monaco's Range class
            const range = new monaco.Range(
              position.lineNumber,
              tagStartColumn,
              position.lineNumber,
              position.column
            )
            
            // Replace with <tag></tag>
            const replacement = `<${tagName}></${tagName}>`
            editor.executeEdits('html-tag-autocomplete', [{
              range: range,
              text: replacement
            }])
            
            // Position cursor in the middle (between opening and closing tags)
            const newPosition = {
              lineNumber: position.lineNumber,
              column: tagStartColumn + tagName.length + 2 // After "<tag>"
            }
            editor.setPosition(newPosition)
            editor.revealPositionInCenter(newPosition)
          }
        }
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      <div className="border-b border-white/10 bg-black/70 backdrop-blur px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-semibold hover:text-zinc-300 transition group"
          >
            <FileCode2 className="h-4 w-4" />
            <span>HTML + Tailwind Lab</span>
            <Home className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition text-zinc-400" />
          </Link>
          <div className="text-[11px] text-zinc-400 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
            {active}
          </div>
          <div className="flex items-center gap-2 text-[11px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-zinc-400">
            <SquareTerminal className="h-3.5 w-3.5" />
            <span>Live Preview</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <div className="flex gap-1 border border-white/10 rounded-lg p-0.5">
            <button
              onClick={() => setPreviewMode("editor")}
              className={`px-2.5 py-1 text-xs rounded transition ${
                previewMode === "editor"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Code className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setPreviewMode("split")}
              className={`px-2.5 py-1 text-xs rounded transition ${
                previewMode === "split"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setPreviewMode("preview")}
              className={`px-2.5 py-1 text-xs rounded transition ${
                previewMode === "preview"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            onClick={() => setCode("")}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            Clear Code
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New File</span>
          </button>
          <button
            onClick={() => setShowConcepts(!showConcepts)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Concepts</span>
          </button>
          <button
            onClick={() => setShowShortcuts(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 flex gap-0 overflow-hidden min-h-0">
          <div className="w-60 border-r border-white/10 bg-black/60 backdrop-blur flex flex-col overflow-hidden">
            <div className="border-b border-white/10 px-3 py-2 bg-black/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-zinc-400 font-semibold">
                <Folder className="h-3.5 w-3.5" />
                <span>Explorer</span>
              </div>
              <button onClick={() => setShowModal(true)} className="text-[11px] text-zinc-300 hover:text-white inline-flex items-center gap-1">
                <Plus className="h-3 w-3" />
                New
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <div>
                <button onClick={() => setExplorerOpenHtml(v => !v)} className="w-full text-left px-3 py-2 text-xs text-zinc-300 bg-black/50 hover:bg-white/5 flex items-center gap-2 border-b border-white/5">
                  {explorerOpenHtml ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-mono">html/</span>
                </button>
                {explorerOpenHtml && htmlFiles.map(f => (
                  <button
                    key={f.path}
                    onClick={() => selectFile(f.path)}
                    onMouseDown={() => startDeleteHold(f.path)}
                    onMouseUp={cancelDeleteHold}
                    onMouseLeave={cancelDeleteHold}
                    className={`w-full text-left border-b border-white/5 px-8 py-2 transition text-xs group ${
                      active === f.path ? "bg-white/10 text-white" : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-mono flex-1 flex items-center gap-2">
                        <FileCode2 className="h-3.5 w-3.5 text-white" />
                        {f.path.split('/')[1]}
                      </div>
                      {active === f.path && f.path !== "html/index.html" && (
                        <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100">Hold to delete</span>
                      )}
                      {active === f.path && f.path === "html/index.html" && (
                        <span className="text-[10px] text-zinc-600">Locked</span>
                      )}
                    </div>
                  </button>
                ))}
                {jsFiles.length > 0 && (
                  <>
                    <button onClick={() => setExplorerOpenJs(v => !v)} className="w-full text-left px-3 py-2 text-xs text-zinc-300 bg-black/50 hover:bg-white/5 flex items-center gap-2 border-b border-white/5 mt-2">
                      {explorerOpenJs ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="font-mono">js/</span>
                    </button>
                    {explorerOpenJs && jsFiles.map(f => (
                      <button
                        key={f.path}
                        onClick={() => selectFile(f.path)}
                        onMouseDown={() => startDeleteHold(f.path)}
                        onMouseUp={cancelDeleteHold}
                        onMouseLeave={cancelDeleteHold}
                        className={`w-full text-left border-b border-white/5 px-8 py-2 transition text-xs group ${
                          active === f.path ? "bg-white/10 text-white" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-mono flex-1 flex items-center gap-2">
                            <Code className="h-3.5 w-3.5 text-yellow-400" />
                            {f.path.split('/')[1]}
                          </div>
                          {active === f.path && (
                            <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100">Hold to delete</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            <MusicPlayer />
          </div>

          {previewMode !== "preview" && (
            <div className={`flex-1 flex flex-col bg-[#0d0d10] ${previewMode === "editor" ? "" : "border-r border-white/10"}`}>
              {loading ? (
                <div className="flex-1 flex items-center justify-center text-zinc-500">Loading files...</div>
              ) : (
                <Monaco
                  height="100%"
                  language={getEditorLanguage()}
                  theme="vs-dark"
                  value={code}
                  onChange={v => updateContent(v || "")}
                  onMount={handleEditorMount}
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
              )}
            </div>
          )}

          {previewMode !== "editor" && (
            <div className={`flex-1 flex flex-col bg-white ${previewMode === "preview" ? "" : "border-l border-white/10"}`}>
              <div className="border-b border-white/10 px-3 py-1.5 bg-black/70 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-zinc-400 font-semibold">
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </div>
                {active.endsWith('.html') && (
                  <div className="text-[10px] text-zinc-500">Live updates</div>
                )}
                {active.endsWith('.js') && (
                  <div className="text-[10px] text-zinc-500">JavaScript file</div>
                )}
              </div>
              <div className="flex-1 overflow-auto bg-white">
                {active.endsWith('.html') ? (
                  <iframe
                    ref={previewRef}
                    className="w-full h-full border-0"
                    title="HTML Preview"
                    sandbox="allow-same-origin allow-scripts"
                  />
                ) : active.endsWith('.js') ? (
                  <div className="p-6 bg-[#0d0d10] h-full overflow-auto">
                    <pre className="text-sm text-zinc-200 font-mono whitespace-pre-wrap">
                      <code>{code}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
                    Select an HTML file to preview
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0f0f12] border border-white/10 rounded-lg p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Create New File</h2>
              <button onClick={() => {
                setShowModal(false)
                setFileName("")
                setFileType("html")
              }} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-2">File Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFileType("html")}
                  className={`flex-1 px-3 py-2 rounded text-sm transition ${
                    fileType === "html"
                      ? "bg-white text-black"
                      : "bg-white/5 border border-white/15 text-zinc-400 hover:text-white"
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => setFileType("js")}
                  className={`flex-1 px-3 py-2 rounded text-sm transition ${
                    fileType === "js"
                      ? "bg-white text-black"
                      : "bg-white/5 border border-white/15 text-zinc-400 hover:text-white"
                  }`}
                >
                  JavaScript
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-2">File Name</label>
              <input
                type="text"
                value={fileName}
                onChange={e => setFileName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") createFile(fileName, fileType)
                }}
                placeholder={fileType === "html" ? "e.g., mypage" : "e.g., script"}
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
              />
              <div className="text-xs text-zinc-500 mt-1">
                File will be: <span className="font-mono text-zinc-200">html/{fileName}.{fileType}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setFileName("")
                  setFileType("html")
                }}
                className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => createFile(fileName, fileType)}
                disabled={!fileName.trim()}
                className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showConcepts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-[min(960px,92vw)] max-h-[80vh] overflow-auto border border-white/10 bg-[#0f0f12] rounded-lg shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/70">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                <BookOpen className="h-4 w-4" />
                Concepts
              </div>
              <button onClick={() => setShowConcepts(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-semibold">HTML Structure</div>
                <ul className="space-y-1 text-zinc-300">
                  <li>&lt;!DOCTYPE html&gt; - Document type</li>
                  <li>&lt;html&gt; - Root element</li>
                  <li>&lt;head&gt; - Metadata container</li>
                  <li>&lt;body&gt; - Content container</li>
                  <li>&lt;div&gt; - Block container</li>
                  <li>&lt;span&gt; - Inline container</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Tailwind CSS</div>
                <ul className="space-y-1 text-zinc-300">
                  <li>Utility-first CSS framework</li>
                  <li>Use classes like: bg-blue-500</li>
                  <li>Responsive: md:bg-red-500</li>
                  <li>Hover: hover:bg-blue-600</li>
                  <li>Spacing: p-4, m-2, gap-3</li>
                  <li>Flexbox: flex, items-center</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">JavaScript Basics</div>
                <ul className="space-y-1 text-zinc-300">
                  <li>Variables: let, const, var</li>
                  <li>Functions: function() or () =&gt;</li>
                  <li>DOM: document.querySelector()</li>
                  <li>Events: addEventListener()</li>
                  <li>Console: console.log()</li>
                  <li>Create .js files to add interactivity</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Common Tailwind Classes</div>
                <ul className="space-y-1 text-zinc-300">
                  <li>Colors: bg-*, text-*, border-*</li>
                  <li>Sizing: w-*, h-*, max-w-*</li>
                  <li>Typography: text-*, font-*</li>
                  <li>Layout: flex, grid, container</li>
                  <li>Effects: shadow-*, rounded-*</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Tailwind CDN</div>
                <ul className="space-y-1 text-zinc-300">
                  <li>&lt;script src="https://cdn.tailwindcss.com"&gt;&lt;/script&gt;</li>
                  <li>Add to &lt;head&gt; for Tailwind</li>
                  <li>No build step required</li>
                  <li>Perfect for quick prototypes</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">JavaScript Integration</div>
                <ul className="space-y-1 text-zinc-300">
                  <li>Create .js files in the lab</li>
                  <li>JS files auto-inject into HTML preview</li>
                  <li>Use for DOM manipulation</li>
                  <li>Add event listeners</li>
                  <li>Make pages interactive</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
          <div className="w-[min(400px,92vw)] border border-white/10 bg-[#0f0f12] rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/70">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                <Keyboard className="h-4 w-4" />
                Keyboard Shortcuts
              </div>
              <button onClick={() => setShowShortcuts(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Save File</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">⌘/Ctrl</kbd>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">S</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">New File</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">⌘/Ctrl</kbd>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">N</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Toggle Preview Mode</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">⌘/Ctrl</kbd>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">P</kbd>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-white/10 bg-black/50">
              <p className="text-[11px] text-zinc-500 text-center">
                Press <kbd className="px-1 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-mono">?</kbd> anytime to see shortcuts
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
