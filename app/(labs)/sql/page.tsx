"use client"
import dynamic from "next/dynamic"
import { Suspense, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Database,
  FileCode2,
  Home,
  Loader2,
  PanelLeft,
  PanelRight,
  Play,
  SquareTerminal,
  Table
} from "lucide-react"
import Link from "next/link"
import MusicPlayer from "@/components/MusicPlayer"

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type Table = {
  name: string
  columns: {field:string,type:string,null:string,key:string,default:string|null}[]
  rowCount: number
}

export default function Page(){
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1e1e1e] text-zinc-500 p-4 text-xs">Loading…</div>}>
      <SqlEditor />
    </Suspense>
  )
}

function SqlEditor(){
  const { status } = useSession()
  const r = useRouter()
  const search = useSearchParams()
  const [sql,setSql]=useState("")
  const [pythonCode,setPythonCode]=useState("")
  const [mode,setMode]=useState<"sql"|"python">("sql")
  const [out,setOut]=useState<any>(null)
  const [loading,setLoading]=useState(false)
  const [schema,setSchema]=useState<string>("shared-db")
  const [prefix,setPrefix]=useState<string>("")
  const [bottomTab,setBottomTab]=useState<"results"|"concepts">("results")
  const [outputMinimized,setOutputMinimized]=useState(false)
  const [tables,setTables]=useState<Table[]>([])
  const [selectedTable,setSelectedTable]=useState<Table|null>(null)
  const [tablePreview,setTablePreview]=useState<any[]|null>(null)
  const [rightPanelTab,setRightPanelTab]=useState<"preview"|"structure">("preview")
  const [rightPanelVisible,setRightPanelVisible]=useState(true)
  const [tablesPanelVisible,setTablesPanelVisible]=useState(true)
  const saveTimeoutRef=useRef<NodeJS.Timeout|null>(null)

  useEffect(()=>{ if(status==="unauthenticated") r.push("/login") },[status,r])
  useEffect(()=>{(async()=>{ if(status!=="authenticated") return; const res=await fetch("/api/sql/schema"); if(res.ok){ const d=await res.json(); setSchema(d.schema||"shared-db"); setPrefix(d.prefix||"") } })()},[status])

  useEffect(()=>{
    if(status!=="authenticated") return
    loadTables()
    loadSavedCode()
  },[status])

  useEffect(()=>{
    if(!search) return
    const ins = search.get("insert")
    const sel = search.get("select")
    if (ins) {
      setSql(`INSERT INTO \`${ins}\` (...) VALUES (...);`)
      setBottomTab("concepts")
    } else if (sel) {
      setSql(`SELECT * FROM \`${sel}\` LIMIT 10;`)
      setBottomTab("results")
    }
  },[search])

  const pythonTemplate = `import psycopg2
import os

# Database connection (already configured)
conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASS'),
    dbname=os.getenv('DB_NAME'),
    port=os.getenv('DB_PORT'),
    sslmode=os.getenv('DB_SSLMODE', 'require')
)
cursor = conn.cursor()

# List all available tables (with your prefix)
cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
tables = cursor.fetchall()
print("Your tables:")
for table in tables:
    print(f"  - {table[0]}")

# Query the default 'students' table (prefix added automatically)
print("\\nStudents data:")
cursor.execute("SELECT * FROM students LIMIT 5")
rows = cursor.fetchall()
for row in rows:
    print(row)

# Note: Table names like 'students' are automatically prefixed
# with your user prefix when executed.

# Close connection
cursor.close()
conn.close()
`

  const loadSavedCode=async()=>{
    try{
      const res=await fetch("/api/files")
      const data=await res.json()
      if(Array.isArray(data)){
        const sqlFile=data.find((f:any)=>f.path==="sql/query.sql")
        const pyFile=data.find((f:any)=>f.path==="sql/query.py")
        if(sqlFile) setSql(sqlFile.content||"")
        if(pyFile) setPythonCode(pyFile.content||"")
        else setPythonCode(pythonTemplate)
      } else {
        setPythonCode(pythonTemplate)
      }
    }catch(e){
      setPythonCode(pythonTemplate)
    }
  }

  const saveCode=async(code:string,isSql:boolean)=>{
    try{
      await fetch("/api/files",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({ 
          path: isSql?"sql/query.sql":"sql/query.py", 
          kind: isSql?"text":"python", 
          content: code 
        })
      })
    }catch(e){
      console.error("Failed to save",e)
    }
  }

  const updateCode=(val:string)=>{
    if(mode==="sql"){
      setSql(val)
    } else {
      setPythonCode(val)
    }
    
    // Auto-save with 5-second debounce
    if(saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current=setTimeout(()=>{
      saveCode(val,mode==="sql")
    },5000)
  }

  const loadTables=async()=>{
    try{
      const res=await fetch("/api/sql/tables")
      if(res.ok){
        const data=await res.json()
        setTables(data.tables||[])
        if(data.tables?.length>0) {
          setSelectedTable(data.tables[0])
          loadTablePreview(data.tables[0].name)
        }
      }
    }catch(e){
      console.error("Failed to load tables",e)
    }
  }

  const loadTablePreview=async(tableName:string)=>{
    try{
      const res=await fetch("/api/sql/execute",{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({sql:`SELECT * FROM \`${tableName}\` LIMIT 10;`})
      })
      const data=await res.json()
      if(res.ok && data?.ok && Array.isArray(data.rows)){
        setTablePreview(data.rows)
      } else {
        setTablePreview([])
      }
    }catch(e){
      setTablePreview([])
    }
  }

  const run=async()=>{
    setLoading(true)
    setOut(null)
    setOutputMinimized(false)
    
    // Save immediately before execution
    const code=mode==="sql"?sql:pythonCode
    await saveCode(code,mode==="sql")
    
    if(mode==="sql"){
      const res=await fetch("/api/sql/execute",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sql})})
      const data=await res.json()
      setOut(data)
      setLoading(false)
      // Refresh tables after execution
      await loadTables()
      if(selectedTable) loadTablePreview(selectedTable.name)
    } else {
      // Execute Python code
      const res=await fetch("/api/sql/execute-python",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({code:pythonCode})})
      const data=await res.json()
      setOut(data)
      setLoading(false)
      // Refresh tables after execution
      await loadTables()
      if(selectedTable) loadTablePreview(selectedTable.name)
    }
  }

  const presets=[
    { label:"Create table", text:"CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(50));" },
    { label:"Insert row", text:"INSERT INTO students (id,name) VALUES (1,'A');" },
    { label:"Select", text:"SELECT * FROM students;" },
    { label:"Update", text:"UPDATE students SET name='B' WHERE id=1;" },
    { label:"Delete", text:"DELETE FROM students WHERE id=1;" }
  ]

  const concepts=[
    {title:"CREATE TABLE",desc:"Define a new table with columns and constraints"},
    {title:"INSERT",desc:"Add new rows to a table"},
    {title:"SELECT",desc:"Query and retrieve data from tables"},
    {title:"UPDATE",desc:"Modify existing data in tables"},
    {title:"DELETE",desc:"Remove rows from tables"},
    {title:"JOIN",desc:"Combine data from multiple tables"},
    {title:"GROUP BY",desc:"Aggregate rows by column values"},
    {title:"ORDER BY",desc:"Sort results by column"}
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      <div className="border-b border-white/10 bg-black/70 backdrop-blur px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-semibold hover:text-zinc-300 transition group"
          >
            <Database className="h-4 w-4" />
            <span>SQL Lab</span>
            <Home className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition text-zinc-400" />
          </Link>
          <div className="text-[11px] text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5 font-mono">
            {schema || "loading..."}
          </div>
          {prefix && (
            <div className="text-[10px] text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5 font-mono">
              tbl prefix: {prefix}
            </div>
          )}
          <div className={`flex items-center gap-2 text-[11px] px-2 py-1 rounded-full border ${loading?"border-white/20 bg-white/10 text-white":"border-white/10 bg-white/5 text-zinc-400"}`}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SquareTerminal className="h-3.5 w-3.5" />}
            <span>{loading ? "Running" : "Ready"}</span>
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={()=>setMode("sql")}
              className={`px-2.5 py-1 text-xs rounded border ${mode==="sql"?"border-white bg-white text-black":"border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"}`}
            >
              SQL
            </button>
            <button
              onClick={()=>setMode("python")}
              className={`px-2.5 py-1 text-xs rounded border inline-flex items-center gap-1 ${mode==="python"?"border-white bg-white text-black":"border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"}`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              Python
            </button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={run} disabled={loading} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded border border-white/20 bg-white/10 hover:bg-white hover:text-black transition disabled:opacity-50">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            <span>{loading?"Running":"Run"}</span>
          </button>
          <button onClick={()=>{mode==="sql"?setSql(""):setPythonCode(pythonTemplate)}} className="px-3 py-1.5 text-xs rounded border border-white/15 bg-white/5 hover:bg-white/10 transition">Clear</button>
          <button onClick={()=>setTablesPanelVisible(v=>!v)} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded border border-white/15 bg-white/5 hover:bg-white/10 transition">
            {tablesPanelVisible ? <PanelLeft className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
            <span>{tablesPanelVisible?"Hide Tables":"Show Tables"}</span>
          </button>
          {mode==="sql" && presets.map(p=>(
            <button key={p.label} onClick={()=>setSql(p.text)} className="px-2.5 py-1.5 text-xs rounded border border-white/10 bg-white/5 hover:bg-white/10 transition text-zinc-300 hover:text-white">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex gap-0 overflow-hidden">
          {tablesPanelVisible && (
          <div className="w-60 border-r border-white/10 bg-black/60 flex flex-col">
            <div className="border-b border-white/10 px-3 py-2 bg-black/60">
              <div className="text-[11px] uppercase tracking-[0.15em] text-zinc-400 font-semibold flex items-center gap-2">
                <Database className="h-3.5 w-3.5" />
                <span>Tables</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <div className="p-2 space-y-1">
                <div className="text-xs text-zinc-400 px-2 pb-1 border-b border-white/10 mb-2">
                  {schema||"Loading schema"}
                </div>
                {tables.map(t=>(
                  <button
                    key={t.name}
                    onClick={()=>{
                      setSelectedTable(t)
                      loadTablePreview(t.name)
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition border border-transparent ${
                      selectedTable?.name===t.name
                        ?"bg-white/10 text-white border-white/10"
                        :"text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Table className="h-3.5 w-3.5" />
                      <span className="font-mono">{t.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 ml-5">{t.rowCount} rows</div>
                  </button>
                ))}
              </div>
            </div>
            <MusicPlayer />
          </div>
          )}

          <div className="flex-1 flex flex-col bg-[#0d0d10]">
            <Monaco
              height="100%"
              language={mode==="sql"?"sql":"python"}
              theme="vs-dark"
              value={mode==="sql"?sql:pythonCode}
              onChange={v=>updateCode(v||"")}
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
          </div>

          {rightPanelVisible && (
            <div className="w-96 border-l border-white/10 bg-black/60 flex flex-col">
              <div className="border-b border-white/10 px-3 py-2 flex items-center justify-between bg-black/60">
                <div className="flex gap-2">
                  <button onClick={()=>setRightPanelTab("preview")} className={`text-xs px-2 py-1 rounded transition ${rightPanelTab==="preview"?"text-white bg-white/10":"text-zinc-500 hover:text-white hover:bg-white/5"}`}>Preview</button>
                  <button onClick={()=>setRightPanelTab("structure")} className={`text-xs px-2 py-1 rounded transition ${rightPanelTab==="structure"?"text-white bg-white/10":"text-zinc-500 hover:text-white hover:bg-white/5"}`}>Structure</button>
                </div>
                {selectedTable && <div className="text-[10px] text-zinc-500 font-mono">{selectedTable.name}</div>}
              </div>
              <div className="flex-1 overflow-auto p-3">
                {!selectedTable ? (
                  <div className="text-xs text-zinc-500 text-center mt-8">Select a table to preview</div>
                ) : rightPanelTab==="preview" ? (
                  tablePreview && tablePreview.length>0 ? (
                    <div className="overflow-auto">
                      <table className="min-w-full text-[11px]">
                        <thead className="bg-white/5 sticky top-0">
                          <tr>
                            {Object.keys(tablePreview[0]).map(k=>(
                              <th key={k} className="text-left px-2 py-1.5 border-b border-white/10 text-zinc-400 font-normal">{k}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tablePreview.map((row,i)=>(
                            <tr key={i} className="odd:bg-black/50 even:bg-black/30 hover:bg-white/5">
                              {Object.keys(tablePreview[0]).map(k=>(
                                <td key={k} className="px-2 py-1.5 border-b border-white/5 text-zinc-200">{String(row[k])}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500">No rows in {selectedTable.name}</div>
                  )
                ) : (
                  <div className="space-y-2">
                    {selectedTable.columns.map(col=>(
                      <div key={col.field} className="border border-white/10 rounded p-2 bg-[#0d0d10]">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-mono text-xs text-white">{col.field}</div>
                          <div className="text-[10px] text-zinc-300 px-1.5 py-0.5 bg-white/5 rounded">{col.type}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-500">
                          <div>Key: {col.key||"—"}</div>
                          <div>Null: {col.null}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!outputMinimized && (
          <div className="h-40 border-t border-white/10 bg-black/70 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
              <div className="flex gap-3">
                <button onClick={()=>setBottomTab("results")} className={`text-xs px-2 py-1 rounded transition ${bottomTab==="results"?"text-white bg-white/10":"text-zinc-500 hover:text-white hover:bg-white/5"}`}>Results</button>
                <button onClick={()=>setBottomTab("concepts")} className={`text-xs px-2 py-1 rounded transition ${bottomTab==="concepts"?"text-white bg-white/10":"text-zinc-500 hover:text-white hover:bg-white/5"}`}>Concepts</button>
              </div>
              <button onClick={()=>setOutputMinimized(true)} className="text-xs text-zinc-500 hover:text-white">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-3 font-mono text-xs">
              {bottomTab==="results" && (
                <>
                  {out===null?(
                    <div className="text-zinc-500">Results appear here after running SQL</div>
                  ):out?.ok?(
                    out?.output ? (
                      <pre className="text-zinc-100 whitespace-pre-wrap">{out.output}</pre>
                    ) : out?.rows ? (
                      <pre className="text-zinc-100">{JSON.stringify(out.rows,null,2)}</pre>
                    ) : (
                      <div className="text-green-400">Query executed successfully</div>
                    )
                  ):(
                    <div className="text-red-400">{out?.error}</div>
                  )}
                </>
              )}
              
              {bottomTab==="concepts" && (
                <div className="space-y-2">
                  {concepts.map((c,i)=>(
                    <div key={i} className="border-l-2 border-white/20 pl-2 py-1">
                      <div className="text-white font-semibold text-xs">{c.title}</div>
                      <div className="text-zinc-400 text-xs mt-0.5">{c.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {outputMinimized && (
          <button onClick={()=>setOutputMinimized(false)} className="border-t border-white/10 bg-black/70 px-3 py-1 text-xs text-zinc-500 hover:text-white inline-flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            Output
          </button>
        )}
      </div>
    </div>
  )
}
