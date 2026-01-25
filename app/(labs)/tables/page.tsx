"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Database, Table as TableIcon } from "lucide-react"

type Column = {
  field: string
  type: string
  null: string
  key: string
  default: string | null
}

type Table = {
  name: string
  columns: Column[]
  rowCount: number
}

export default function Page() {
  const { status } = useSession()
  const router = useRouter()
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [schemaName, setSchemaName] = useState<string>("")

  const [tab, setTab] = useState<"structure"|"preview"|"concepts">("structure")
  const [previewRows, setPreviewRows] = useState<any[] | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return

    const fetch_tables = async () => {
      setLoading(true)
      const res = await fetch("/api/sql/tables")
      if (res.ok) {
        const data = await res.json()
        setTables(data.tables)
        if (data.tables.length > 0) setSelectedTable(data.tables[0])
      }
      setLoading(false)
    }

    fetch_tables()
  }, [status])

  useEffect(() => {
    if (status !== "authenticated") return
    const loadSchema = async () => {
      const res = await fetch("/api/sql/schema")
      if (res.ok) {
        const d = await res.json()
        setSchemaName(d.schema || "")
      }
    }
    loadSchema()
  }, [status])

  useEffect(() => {
    if (!selectedTable) return
    if (tab !== "preview") return
    const run = async () => {
      setPreviewLoading(true)
      setPreviewError(null)
      setPreviewRows(null)
      try {
        const res = await fetch("/api/sql/execute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sql: `SELECT * FROM \`${selectedTable.name}\` LIMIT 10;` })
        })
        const data = await res.json()
        if (res.ok && data?.ok) {
          // Postgres returns an array of rows for SELECT
          setPreviewRows(Array.isArray(data.rows) ? data.rows : [])
        } else {
          setPreviewError(data?.error || "Failed to fetch preview")
        }
      } catch (e: any) {
        setPreviewError(e?.message || "Preview error")
      } finally {
        setPreviewLoading(false)
      }
    }
    run()
  }, [selectedTable, tab])

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col">
      <div className="border-b border-white/10 bg-black/70 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sql" className="inline-flex items-center gap-2 text-zinc-300 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to SQL
          </Link>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TableIcon className="h-4 w-4" />
            <span>Tables</span>
          </div>
        </div>
        <div className="text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5 font-mono inline-flex items-center gap-2">
          <Database className="h-3.5 w-3.5" />
          {schemaName || "Loading..."}
        </div>
      </div>

      <div className="flex-1 flex gap-0 overflow-hidden">
        <div className="w-64 border-r border-white/10 bg-black/70 flex flex-col">
          <div className="border-b border-white/10 px-3 py-2 bg-black/60">
            <div className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-semibold">Tables ({tables.length})</div>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-3 text-xs text-zinc-500">Loading...</div>
            ) : tables.length === 0 ? (
              <div className="p-3 text-xs text-zinc-300 space-y-2">
                <p>No tables created yet.</p>
                <Link href="/sql" className="text-white hover:underline">Create a table</Link>
              </div>
            ) : (
              tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table)}
                  className={`w-full text-left border-b border-white/5 px-3 py-3 transition text-xs ${
                    selectedTable?.name === table.name
                      ? "bg-white/10 border-l-2 border-white"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="font-mono font-semibold">{table.name}</div>
                  <div className="text-zinc-500 mt-1">{table.columns.length} cols · {table.rowCount} rows</div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d10]">
          {selectedTable ? (
            <>
              <div className="border-b border-white/10 bg-black/70 px-4 py-3">
                <div className="space-y-1">
                  <div className="font-mono text-lg">{selectedTable.name}</div>
                  <div className="text-xs text-zinc-400">{selectedTable.columns.length} columns · {selectedTable.rowCount} rows</div>
                </div>
              </div>

              <div className="border-b border-white/10 bg-black/50 px-3">
                <div className="flex items-center gap-2">
                  <button onClick={()=>setTab("structure")}
                    className={`text-xs px-3 py-2 rounded transition ${tab==="structure"?"bg-white/10 text-white":"text-zinc-500 hover:text-white hover:bg-white/5"}`}>Structure</button>
                  <button onClick={()=>setTab("preview")}
                    className={`text-xs px-3 py-2 rounded transition ${tab==="preview"?"bg-white/10 text-white":"text-zinc-500 hover:text-white hover:bg-white/5"}`}>Preview</button>
                  <button onClick={()=>setTab("concepts")}
                    className={`text-xs px-3 py-2 rounded transition ${tab==="concepts"?"bg-white/10 text-white":"text-zinc-500 hover:text-white hover:bg-white/5"}`}>Concepts</button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {tab === "structure" && (
                  <div className="p-4 space-y-3">
                    <div className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-semibold">Structure</div>
                    <div className="space-y-2">
                      {selectedTable.columns.map((col) => (
                        <div key={col.field} className="border border-white/10 rounded p-3 bg-black hover:border-white/20 transition">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-mono font-semibold text-sm">{col.field}</div>
                            <div className="text-xs text-zinc-300 px-2 py-1 bg-white/5 rounded">{col.type}</div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs text-zinc-400">
                            <div>
                              <div className="text-zinc-500 text-xs mb-0.5">Nullable</div>
                              <div className="text-white">{col.null === "YES" ? "Yes" : "No"}</div>
                            </div>
                            <div>
                              <div className="text-zinc-500 text-xs mb-0.5">Key</div>
                              <div className="text-white">{col.key || "—"}</div>
                            </div>
                            <div>
                              <div className="text-zinc-500 text-xs mb-0.5">Default</div>
                              <div className="text-white">{col.default || "None"}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-semibold mb-2">Quick Actions</div>
                      <div className="space-y-2">
                        <Link
                          href={`/sql?insert=${selectedTable.name}`}
                          className="block text-xs text-zinc-200 border border-white/15 rounded px-3 py-2 hover:border-white hover:text-white transition text-center"
                        >
                          Insert Data
                        </Link>
                        <Link
                          href={`/sql?select=${selectedTable.name}`}
                          className="block text-xs text-zinc-200 border border-white/15 rounded px-3 py-2 hover:border-white hover:text-white transition text-center"
                        >
                          View Data
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "preview" && (
                  <div className="p-4 space-y-3">
                    <div className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-semibold">Preview (first 10 rows)</div>
                    {previewLoading && <div className="text-xs text-zinc-500">Loading preview…</div>}
                    {previewError && <div className="text-xs text-red-400">{previewError}</div>}
                    {!previewLoading && !previewError && (
                      previewRows && previewRows.length > 0 ? (
                        <div className="overflow-auto border border-white/10 rounded">
                          <table className="min-w-full text-xs">
                            <thead className="bg-black/50">
                              <tr>
                                {Object.keys(previewRows[0]).map((k) => (
                                  <th key={k} className="text-left px-3 py-2 border-b border-white/10 text-zinc-400 font-normal">{k}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewRows.map((row, i) => (
                                <tr key={i} className="odd:bg-black/40 even:bg-black/20">
                                  {Object.keys(previewRows[0]).map((k) => (
                                    <td key={k} className="px-3 py-2 border-b border-white/10 text-zinc-200">{String(row[k])}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-500">No rows found.</div>
                      )
                    )}
                  </div>
                )}

                {tab === "concepts" && (
                  <div className="p-4 space-y-3">
                    <div className="text-xs uppercase tracking-[0.15em] text-zinc-400 font-semibold">Concepts</div>
                    <div className="space-y-2 text-xs text-zinc-300">
                      <div className="border-l-2 border-white/20 pl-2">
                        <div className="text-white font-semibold">Primary Key</div>
                        <div className="text-zinc-400 mt-0.5">Uniquely identifies each row in a table.</div>
                      </div>
                      <div className="border-l-2 border-white/20 pl-2">
                        <div className="text-white font-semibold">Data Types</div>
                        <div className="text-zinc-400 mt-0.5">Use types like INT, VARCHAR, DATE for structured data.</div>
                      </div>
                      <div className="border-l-2 border-white/20 pl-2">
                        <div className="text-white font-semibold">Indexes</div>
                        <div className="text-zinc-400 mt-0.5">Improve query speed by indexing frequently filtered columns.</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">
              Select a table to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
