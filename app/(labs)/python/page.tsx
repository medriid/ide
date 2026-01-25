"use client"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
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
  Package,
  Play,
  Plus,
  SquareTerminal,
  Table2,
  Trash2,
  X,
  Send,
  Terminal
} from "lucide-react"
import Link from "next/link"
import MusicPlayer from "@/components/MusicPlayer"
import CodeSnippetManager from "@/components/CodeSnippetManager"
import DailyQuests from "@/components/DailyQuests"

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type FileNode={path:string,kind:"python"|"text"|"csv"|"dat"|"binary",content:string,mimeType?:string|null}
type FileType="py"|"csv"|"txt"|"dat"

export default function Page(){
  const { data:session, status } = useSession()
  const router = useRouter()
  const [code,setCode]=useState("")
  const [out,setOut]=useState("Loading Python...")
  const [files,setFiles]=useState<FileNode[]>([])
  const [active,setActive]=useState<string>("python/main.py")
  const [loading,setLoading]=useState(true)
  const [showModal,setShowModal]=useState(false)
  const [fileName,setFileName]=useState("")
  const [selectedType,setSelectedType]=useState<FileType>("py")
  const [showConcepts,setShowConcepts]=useState(false)
  const [showShortcuts,setShowShortcuts]=useState(false)
  const [explorerOpenPython,setExplorerOpenPython]=useState(true)
  const [explorerOpenData,setExplorerOpenData]=useState(true)
  const [consoleOpen,setConsoleOpen]=useState(true)
  const [consoleHeight,setConsoleHeight]=useState(220)
  const [lastOpenHeight,setLastOpenHeight]=useState(220)
  const [running,setRunning]=useState(false)
  const [installing,setInstalling]=useState(false)
  const [packageInput,setPackageInput]=useState("matplotlib")
  const [waitingForInput,setWaitingForInput]=useState(false)
  const [stdinInput,setStdinInput]=useState("")
  const [pendingInputs,setPendingInputs]=useState<string[]>([])
  const promptUser = session?.user?.email || "user"
  const saveTimeoutRef=useRef<NodeJS.Timeout|null>(null)
  const deleteTimerRef=useRef<NodeJS.Timeout|null>(null)
  const consoleEndRef=useRef<HTMLDivElement|null>(null)
  const inputRef=useRef<HTMLInputElement|null>(null)
  const collapsedHeight = 36

  const toggleConsole = () => {
    setConsoleOpen(prev => {
      const next = !prev
      if (prev) {
        setLastOpenHeight(consoleHeight)
        setConsoleHeight(collapsedHeight)
      } else {
        setConsoleHeight(lastOpenHeight || 220)
      }
      return next
    })
  }

  const protectedData = new Set(["data/sample.txt","data/sample.csv","data/data.dat"]) 

  // Scroll to bottom of console when output changes
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [out])

  // Focus input when waiting for input
  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [waitingForInput])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? e.metaKey : e.ctrlKey

      // Ctrl/Cmd + Enter: Run code
      if (modKey && e.key === 'Enter') {
        e.preventDefault()
        if (!running && active.endsWith('.py')) {
          setPendingInputs([])
          setOut("")
          run()
        }
      }

      // Ctrl/Cmd + S: Save file
      if (modKey && e.key === 's') {
        e.preventDefault()
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveFile(active, code)
        const next = files.map(f => f.path === active ? { ...f, content: code } : f)
        setFiles(next)
        setOut(prev => prev + "\nFile saved.")
      }

      // Ctrl/Cmd + L: Clear output
      if (modKey && e.key === 'l') {
        e.preventDefault()
        setOut("")
        setPendingInputs([])
      }

      // Ctrl/Cmd + B: Toggle console
      if (modKey && e.key === 'b') {
        e.preventDefault()
        toggleConsole()
      }

      // Ctrl/Cmd + N: New file
      if (modKey && e.key === 'n') {
        e.preventDefault()
        setShowModal(true)
      }

      // ? : Show shortcuts (without modifier)
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
  }, [active, code, running, files])

  // Check if code contains input() calls
  const hasInputCalls = (codeStr: string): boolean => {
    // Simple regex to detect input() calls
    return /\binput\s*\(/.test(codeStr)
  }

  const reloadFiles = async (preserveActive=true) => {
    try {
      const res=await fetch("/api/files", { credentials: "include" })
      const data=await res.json()
      if(Array.isArray(data)){
        setFiles(data)
        const nextActive = preserveActive ? active : (data.find((f:FileNode)=>f.path===active)?.path || data[0]?.path || "python/main.py")
        const file=data.find((f:FileNode)=>f.path===nextActive)
        if(file){
          setActive(nextActive)
          // Only update code if it's different to avoid losing unsaved changes
          if(file.content !== code) {
            setCode(file.content||"")
          }
        }
      }
    } catch(e) {
      console.error("Failed to reload files:", e)
    }
  }

  // Redirect unauthenticated users
  useEffect(()=>{
    if(status==="unauthenticated") router.push("/login")
  },[status,router])

  // Save files before page unload
  useEffect(()=>{
    const handleBeforeUnload = () => {
      // Save current file if there's unsaved content
      if(active && code && saveTimeoutRef.current) {
        // Clear timeout and save immediately
        clearTimeout(saveTimeoutRef.current)
        // Fire and forget - may not complete but we try
        const ext=active.split('.').pop()
        let kind: "python"|"text"|"csv"|"dat"|"binary"="text"
        if(ext==="py") kind="python"
        else if(ext==="csv") kind="csv"
        else if(ext==="dat") kind="binary"
        else kind="text"
        
        fetch("/api/files",{
          method:"POST",
          headers:{"content-type":"application/json"},
          body:JSON.stringify({ path: active, kind, content: code }),
          keepalive: true // Keep request alive even after page unloads
        }).catch(() => {}) // Ignore errors
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  },[active, code])

  // Load files from server on mount when authenticated
  useEffect(()=>{
    if(status!=="authenticated") return
    const load=async()=>{
      try{
        const res=await fetch("/api/files", { credentials: "include" })
        const data=await res.json()
        if(Array.isArray(data) && data.length>0){
          setFiles(data)
          const main=data.find((f:FileNode)=>f.path==="python/main.py")
          if(main){
            setActive("python/main.py")
            setCode(main.content||"")
          } else {
            setActive(data[0]?.path||"python/main.py")
            setCode(data[0]?.content||"")
          }
        } else {
          await bootstrapDefaults()
        }
        setOut("")
      }catch(e){
        console.error("Failed to load files",e)
      }finally{
        setLoading(false)
      }
    }
    load()
  },[status])

  const bootstrapDefaults = async () => {
    const defaults: FileNode[] = [
      { path: "python/main.py", kind: "python", content: "# main.py\nimport csv, pickle\nprint('Hello from main.py')\n" },
      { path: "data/sample.txt", kind: "text", content: "Hello NCERT Class 12\n" },
      { path: "data/sample.csv", kind: "csv", content: "name,age\nAlice,20\nBob,22\n" },
      { path: "data/data.dat", kind: "binary", content: "" }
    ]
    const created: FileNode[] = []
    for(const f of defaults){
      try {
        const res = await fetch("/api/files",{ 
          method:"POST", 
          headers:{"content-type":"application/json"}, 
          credentials: "include",
          body: JSON.stringify(f) 
        })
        if(res.ok) {
          const saved = await res.json()
          created.push(saved)
        } else {
          console.error("Failed to save default file:", f.path)
        }
      } catch(e) {
        console.error("Error saving default file:", f.path, e)
      }
    }
    if(created.length > 0) {
      setFiles(created)
      setActive("python/main.py")
      setCode(created.find(f=>f.path==="python/main.py")?.content || "")
    }
  }

  const saveFile=async(path:string,content:string)=>{
    try{
      const ext=path.split('.').pop()
      let kind: "python"|"text"|"csv"|"dat"|"binary"="text"
      if(ext==="py") kind="python"
      else if(ext==="csv") kind="csv"
      else if(ext==="dat") kind="binary"
      else kind="text"
      
      await fetch("/api/files",{
        method:"POST",
        headers:{"content-type":"application/json"},
        credentials: "include",
        body:JSON.stringify({ path, kind, content })
      })
    }catch(e){
      console.error("Failed to save",e)
    }
  }

  const selectFile=(path:string)=>{
    const f=files.find(x=>x.path===path)
    setActive(path)
    setCode(f?.content||"")
  }

  const updateContent=(val:string)=>{
    setCode(val)
    
    // Auto-save with 5-second debounce
    if(saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current=setTimeout(()=>{
      saveFile(active,val)
      const next=files.map(f=>f.path===active?{...f,content:val}:f)
      setFiles(next)
    },5000)
  }

  const createFile=(type:FileType,name:string)=>{
    if(!name.trim()) return
    
    let path:string
    let ext:string
    
    if(type==="py"){
      ext="py"
      path=`python/${name}.py`
    } else {
      ext=type
      path=`data/${name}.${ext}`
    }
    
    if(files.some(f=>f.path===path)){
      alert("File already exists")
      return
    }

    let content=""
    if(type==="py") content="# "+name+".py\nprint('Hello from "+name+".py')\n"
    else if(type==="csv") content="col1,col2\n1,2"
    else if(type==="dat") content="import pickle\n\n# Write data\ndata = {'name': 'Alice', 'age': 20}\nwith open('data/"+name+".dat', 'wb') as f:\n    pickle.dump(data, f)\n\n# Read data\nwith open('data/"+name+".dat', 'rb') as f:\n    loaded = pickle.load(f)\n    print(loaded)"
    else content="# Text file\nHello World"

    const kindMap:Record<FileType, "python"|"text"|"csv"|"dat">={py:"python",txt:"text",csv:"csv",dat:"dat"}
    const newFile:FileNode={path,kind:kindMap[type],content}
    
    const next=[...files,newFile]
    setFiles(next)
    setActive(path)
    setCode(content)
    saveFile(path,content)
    
    setShowModal(false)
    setFileName("")
    setSelectedType("py")
  }

  const deleteFile=async(path:string)=>{
    if(protectedData.has(path)) return
    try{
      await fetch("/api/files",{
        method:"DELETE",
        headers:{"content-type":"application/json"},
        credentials: "include",
        body:JSON.stringify({ path })
      })
      const next=files.filter(f=>f.path!==path)
      setFiles(next)
      if(active===path){
        setActive(next[0]?.path||"python/main.py")
        setCode(next[0]?.content||"")
      }
    }catch(e){
      console.error("Failed to delete",e)
    }
  }

  const startDeleteHold=(path:string)=>{
    if(protectedData.has(path)) return
    if(deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    deleteTimerRef.current=setTimeout(()=>deleteFile(path),600)
  }

  const cancelDeleteHold=()=>{
    if(deleteTimerRef.current){
      clearTimeout(deleteTimerRef.current)
      deleteTimerRef.current=null
    }
  }

  const run=async(inputData?: string)=>{
    if(!active.endsWith('.py')){ setOut("Open a Python (.py) file to run code."); return }
    // Clear any pending auto-save and save immediately
    if(saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    setRunning(true)
    setWaitingForInput(false)
    try{
      // Save file immediately before execution
      await saveFile(active,code)
      const next=files.map(f=>f.path===active?{...f,content:code}:f)
      setFiles(next)
      
      const stdinStr = inputData !== undefined ? inputData : pendingInputs.join('\n')
      
      if (inputData === undefined) {
        setOut(`$ ${promptUser} > python ${active}\n`)
      }
      
      const res=await fetch("/api/python/execute",{
        method:"POST",
        headers:{"content-type":"application/json"},
        credentials:"include",
        body:JSON.stringify({ path: active, code, stdin: stdinStr || undefined })
      })
      const data=await res.json()
      if(res.ok && data?.ok){
        const output=(data.stdout||"")+(data.stderr?`\n${data.stderr}`:"")
        setOut(prev => `${prev}${output}`)
        setPendingInputs([])
        await reloadFiles(false)
        
        // Save execution history
        try {
          await fetch("/api/code/executions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language: "python",
              code,
              output,
              success: true,
              executionTime: data.executionTime || null
            })
          })
        } catch (e) {
          // Silent fail for execution history
        }
        
        // Update daily quest progress
        try {
          await fetch("/api/gamification/daily-quests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questCode: "run_code_5x", increment: 1 })
          })
        } catch (e) {
          // Silent fail for quest tracking
        }
      } else {
        const errMsg = data?.error || res.statusText
        // Check if the error is about waiting for input
        if (errMsg.includes("EOFError") || errMsg.includes("input")) {
          setOut(prev => `${prev}\n⌨ Waiting for input...\n`)
          setWaitingForInput(true)
        } else {
          setOut(prev => `${prev}Error: ${errMsg}`)
        }
        
        // Save failed execution history
        try {
          await fetch("/api/code/executions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              language: "python",
              code,
              success: false,
              error: errMsg
            })
          })
        } catch (e) {
          // Silent fail
        }
      }
    }catch(e){
      const errMsg = e instanceof Error ? e.message : String(e)
      setOut(prev => `${prev}Error: ${errMsg}`)
    }finally{
      setRunning(false)
    }
  }

  const handleInputSubmit = () => {
    if (!stdinInput.trim() && !waitingForInput) return
    const newInputs = [...pendingInputs, stdinInput]
    setPendingInputs(newInputs)
    setOut(prev => `${prev}> ${stdinInput}\n`)
    setStdinInput("")
    setWaitingForInput(false)
    // Re-run with new input
    run(newInputs.join('\n'))
  }

  const installPackages=async()=>{
    if(!packageInput.trim()) return
    setInstalling(true)
    setOut(`$ ${promptUser} > pip install ${packageInput}\n`)
    try{
      const res=await fetch("/api/python/pip",{
        method:"POST",
        headers:{"content-type":"application/json"},
        credentials:"include",
        body:JSON.stringify({ packages: packageInput })
      })
      const data=await res.json()
      if(res.ok && data?.ok){
        const output=(data.stdout||"")+(data.stderr?`\n${data.stderr}`:"")
        setOut(`$ ${promptUser} > pip install ${packageInput}\n${output}`)
      } else {
        setOut(`$ ${promptUser} > pip install ${packageInput}\nError: ${data?.error || res.statusText}`)
      }
    }catch(e){
      const errMsg = e instanceof Error ? e.message : String(e)
      setOut(`$ ${promptUser} > pip install ${packageInput}\nError: ${errMsg}`)
    }finally{
      setInstalling(false)
    }
  }

  // Hide files with .dat, .csv, .txt, .py extensions and 'challenge' in the filename
  function shouldHideFile(path: string) {
    const lower = path.toLowerCase();
    const hasChallenge = lower.includes('challenge');
    const ext = lower.split('.').pop();
    const validExt = ['dat', 'csv', 'txt', 'py'];
    return hasChallenge && validExt.includes(ext || '');
  }
  const pythonFiles=files.filter(f=>f.path.startsWith("python/") && !shouldHideFile(f.path))
  const dataFiles=files.filter(f=>f.path.startsWith("data/") && !shouldHideFile(f.path))

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      <DailyQuests />
      <div className="border-b border-white/10 bg-black/70 backdrop-blur px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-semibold hover:text-zinc-300 transition group"
          >
            <FileCode2 className="h-4 w-4" />
            <span>Python Lab</span>
            <Home className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition text-zinc-400" />
          </Link>
          <div className="text-[11px] text-zinc-400 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
            {active}
          </div>
          <div className={`flex items-center gap-2 text-[11px] px-2 py-1 rounded-full border ${running?"border-white/30 bg-white/10 text-white":"border-white/10 bg-white/5 text-zinc-400"}`}>
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SquareTerminal className="h-3.5 w-3.5" />}
            <span>{running ? "Running" : "Server runner"}</span>
          </div>
          {hasInputCalls(code) && !running && (
            <div className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Terminal className="h-3 w-3" />
              <span>Uses input()</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => {
              setPendingInputs([])
              setOut("")
              run()
            }}
            disabled={running || status!=="authenticated"}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs rounded-lg border border-white/20 bg-white/10 hover:bg-white hover:text-black transition disabled:opacity-50 font-medium"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            <span>{running ? "Running" : "Run"}</span>
          </button>
          <button
            onClick={()=>setCode("")}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            Clear Code
          </button>
          <CodeSnippetManager
            language="python"
            code={code}
            onCodeLoad={(newCode) => {
              setCode(newCode)
              updateContent(newCode)
            }}
          />
          <button
            onClick={()=>setShowModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New File</span>
          </button>
          <button
            onClick={()=>setShowConcepts(!showConcepts)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Concepts</span>
          </button>
          <button
            onClick={()=>setShowShortcuts(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs">
            <span className="text-[11px] text-zinc-400">pip</span>
            <input
              value={packageInput}
              onChange={e=>setPackageInput(e.target.value)}
              placeholder="matplotlib"
              className="bg-transparent outline-none text-white placeholder:text-zinc-500 w-28 text-xs"
            />
            <button
              onClick={installPackages}
              disabled={installing}
              className="px-2 py-0.5 rounded border border-white/20 bg-white/10 hover:bg-white/20 disabled:opacity-50"
            >
              {installing ? "..." : "Install"}
            </button>
          </div>
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
              <button onClick={()=>setShowModal(true)} className="text-[11px] text-zinc-300 hover:text-white inline-flex items-center gap-1">
                <Plus className="h-3 w-3" />
                New
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <div>
                <button onClick={()=>setExplorerOpenPython(v=>!v)} className="w-full text-left px-3 py-2 text-xs text-zinc-300 bg-black/50 hover:bg-white/5 flex items-center gap-2 border-b border-white/5">
                  {explorerOpenPython ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-mono">python/</span>
                </button>
                {explorerOpenPython && pythonFiles.map(f=>(
                  <button key={f.path} onClick={()=>selectFile(f.path)} className={`w-full text-left border-b border-white/5 px-8 py-2 transition text-xs group ${active===f.path?"bg-white/10 text-white":"hover:bg-white/5"}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-mono flex-1 flex items-center gap-2">
                        <FileCode2 className="h-3.5 w-3.5 text-white" />
                        {f.path.split('/')[1]}
                      </div>
                      {active===f.path && f.path!=="python/main.py" && (
                        <button onClick={(e)=>{e.stopPropagation();deleteFile(f.path)}} className="text-xs text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div>
                <button onClick={()=>setExplorerOpenData(v=>!v)} className="w-full text-left px-3 py-2 text-xs text-zinc-300 bg-black/50 hover:bg-white/5 flex items-center gap-2 border-b border-white/5">
                  {explorerOpenData ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <span className="font-mono">data/</span>
                </button>
                {explorerOpenData && dataFiles.map(f=>{
                  const ext=f.path.split('.').pop()
                  const icon = ext==="csv" ? <Table2 className="h-3.5 w-3.5" /> : ext==="dat" ? <Package className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />
                  const protectedFile = protectedData.has(f.path)
                  return (
                    <button
                      key={f.path}
                      onClick={()=>selectFile(f.path)}
                      onMouseDown={()=>startDeleteHold(f.path)}
                      onMouseUp={cancelDeleteHold}
                      onMouseLeave={cancelDeleteHold}
                      className={`w-full text-left border-b border-white/5 px-8 py-2 transition text-xs group ${active===f.path?"bg-white/10 text-white":"hover:bg-white/5"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-mono flex-1 flex items-center gap-2">
                          {icon}
                          {f.path.split('/')[1]}
                        </div>
                        {active===f.path && !protectedFile && (
                          <span className="text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100">Hold to delete</span>
                        )}
                        {active===f.path && protectedFile && (
                          <span className="text-[10px] text-zinc-600">Locked</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Music Player */}
            <MusicPlayer />
          </div>

          <div className="flex-1 flex flex-col bg-[#0d0d10]">
            {loading?(
              <div className="flex-1 flex items-center justify-center text-zinc-500">Loading files...</div>
            ):(
              <Monaco
                height="100%"
                language={active.endsWith('.py')?'python':'plaintext'}
                theme="vs-dark"
                value={code}
                onChange={v=>updateContent(v||"")}
                options={{ 
                  minimap:{enabled:false}, 
                  fontSize:13, 
                  smoothScrolling:true, 
                  scrollBeyondLastLine:false, 
                  wordWrap:"on",
                  fontFamily:"'Cascadia Code', 'Consolas', 'Courier New', monospace",
                  lineHeight:20,
                  padding:{top:8,bottom:8}
                }}
              />
            )}
          </div>
        </div>

        <div 
          className="border-t border-white/10 bg-black/70 flex flex-col"
          style={{ 
            height: `${consoleOpen ? consoleHeight : collapsedHeight}px`,
            minHeight: `${consoleOpen ? consoleHeight : collapsedHeight}px`,
            maxHeight: `${consoleOpen ? consoleHeight : collapsedHeight}px`,
            flexShrink: 0,
            transition: "height 0.2s ease-in-out, min-height 0.2s ease-in-out, max-height 0.2s ease-in-out"
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 flex-shrink-0" style={{ height: `${collapsedHeight}px`, minHeight: `${collapsedHeight}px` }}>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleConsole}
                className="text-xs text-zinc-300 hover:text-white inline-flex items-center"
              >
                {consoleOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              <div className="text-[11px] uppercase tracking-[0.15em] text-zinc-400 font-semibold flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5" />
                Output
              </div>
              {waitingForInput && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                  Waiting for input
                </span>
              )}
              {running && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Running...
                </span>
              )}
            </div>
            <button onClick={()=>{setOut("");setPendingInputs([])}} className="text-xs text-zinc-400 hover:text-white">Clear</button>
          </div>
          {consoleOpen && (
            <div className="flex-1 flex flex-col" style={{ overflow: "hidden", height: `calc(100% - ${collapsedHeight}px)` }}>
              <div className="flex-1 p-3 font-mono text-xs bg-[#0d0d10] text-zinc-50" style={{ overflow: "auto" }}>
                <pre className="whitespace-pre-wrap">{out}</pre>
                <div ref={consoleEndRef} />
              </div>
              
              {/* Input section */}
              <div className="border-t border-white/10 px-3 py-2 bg-black/50 flex items-center gap-2">
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
                    waitingForInput ? "text-amber-400 placeholder:text-amber-600/50" : "text-white"
                  }`}
                  disabled={running && !waitingForInput}
                />
                <button
                  onClick={handleInputSubmit}
                  disabled={running && !waitingForInput}
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
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
              <button onClick={()=>setShowModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-2">File Type</label>
              <div className="grid grid-cols-4 gap-2">
                {(['py','txt','csv','dat'] as FileType[]).map(type=>(
                  <button
                    key={type}
                    onClick={()=>setSelectedType(type)}
                    className={`py-2 px-3 text-xs rounded border transition ${
                      selectedType===type
                        ?"border-white bg-white text-black font-medium"
                        :"border-white/15 hover:border-white"
                    }`}
                  >
                    {type.toUpperCase()}
                  </button>
                ))}
              </div>
              {selectedType==="dat" && (
                <div className="mt-2 text-xs text-zinc-300 bg-white/5 p-2 rounded border border-white/10">
                  Binary files will be serialized with pickle.
                </div>
              )}
              {selectedType==="py" && (
                <div className="mt-2 text-xs text-zinc-300 bg-white/5 p-2 rounded border border-white/10">
                  Python files save into the python/ folder.
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-[11px] uppercase tracking-[0.2em] text-zinc-500 mb-2">File Name</label>
              <input
                type="text"
                value={fileName}
                onChange={e=>setFileName(e.target.value)}
                onKeyDown={e=>{
                  if(e.key==="Enter") createFile(selectedType,fileName)
                }}
                placeholder={selectedType==="py"?"e.g., mycode":"e.g., mydata"}
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
              />
              <div className="text-xs text-zinc-500 mt-1">
                File will be: <span className="font-mono text-zinc-200">{selectedType==="py"?"python":"data"}/{fileName}.{selectedType}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={()=>{
                  setShowModal(false)
                  setFileName("")
                  setSelectedType("py")
                }}
                className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={()=>createFile(selectedType,fileName)}
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
              <button onClick={()=>setShowConcepts(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-semibold">Text Files (.txt)</div>
                <ul className="space-y-1 text-zinc-300">
                  <li>open(path, mode): r, w, a, r+, w+, a+</li>
                  <li>read(), readline(), readlines()</li>
                  <li>write(str), writelines(list)</li>
                  <li>with open(&apos;data/sample.txt&apos;,&apos;r&apos;) as f: data=f.read()</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">CSV Files (.csv)</div>
                <ul className="space-y-1 text-zinc-300">
                  <li>import csv</li>
                  <li>csv.reader(file), csv.writer(file)</li>
                  <li>reader iteration returns rows (list[str])</li>
                  <li>with open(&apos;data/sample.csv&apos;) as f: csv.reader(f)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-semibold">Binary Files (.dat via pickle)</div>
                <ul className="space-y-1 text-zinc-300">
                  <li>import pickle</li>
                  <li>pickle.dump(obj, file) with mode &apos;wb&apos;</li>
                  <li>pickle.load(file) with mode &apos;rb&apos;</li>
                  <li>with open(&apos;data/data.dat&apos;,&apos;wb&apos;) as f: pickle.dump(obj,f)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={()=>setShowShortcuts(false)}>
          <div className="w-[min(400px,92vw)] border border-white/10 bg-[#0f0f12] rounded-lg shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/70">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-zinc-300 font-semibold">
                <Keyboard className="h-4 w-4" />
                Keyboard Shortcuts
              </div>
              <button onClick={()=>setShowShortcuts(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Run Code</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">⌘/Ctrl</kbd>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">Enter</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Save File</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">⌘/Ctrl</kbd>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">S</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Clear Output</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">⌘/Ctrl</kbd>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">L</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">Toggle Console</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">⌘/Ctrl</kbd>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">B</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">New File</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">⌘/Ctrl</kbd>
                  <kbd className="px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono">N</kbd>
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
