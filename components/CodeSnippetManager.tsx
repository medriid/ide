"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Save, Share2, Copy, Check, X, ExternalLink, Eye, Heart } from "lucide-react"

interface CodeSnippet {
  id: string
  title: string
  description?: string
  language: string
  code: string
  tags?: string
  isPublic: boolean
  shareId?: string
  views: number
  likes: number
  createdAt: string
  user?: {
    id: string
    username: string
    avatarUrl?: string
  }
}

interface CodeSnippetManagerProps {
  language: "python" | "sql" | "html" | "javascript"
  code: string
  onCodeLoad?: (code: string) => void
}

export default function CodeSnippetManager({ language, code, onCodeLoad }: CodeSnippetManagerProps) {
  const { data: session } = useSession()
  const [showModal, setShowModal] = useState(false)
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null)

  useEffect(() => {
    if (session && showModal) {
      loadSnippets()
    }
  }, [session, showModal, language])

  const loadSnippets = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/code/snippets?language=${language}`)
      if (res.ok) {
        const data = await res.json()
        setSnippets(data.snippets || [])
      }
    } catch (error) {
      console.error("Failed to load snippets", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSnippet = async () => {
    if (!title.trim() || !code.trim()) return

    setSaving(true)
    try {
      const res = await fetch("/api/code/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          language,
          code,
          tags: tags.trim() || null,
          isPublic
        })
      })

      if (res.ok) {
        const snippet = await res.json()
        setSnippets(prev => [snippet, ...prev])
        setTitle("")
        setDescription("")
        setTags("")
        setIsPublic(false)
        setShowModal(false)
      }
    } catch (error) {
      console.error("Failed to save snippet", error)
    } finally {
      setSaving(false)
    }
  }

  const loadSnippet = (snippet: CodeSnippet) => {
    if (onCodeLoad) {
      onCodeLoad(snippet.code)
    }
    setShowModal(false)
  }

  const copyShareLink = (shareId: string) => {
    const link = `${window.location.origin}/code/${shareId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportCode = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${language === "python" ? "py" : language === "sql" ? "sql" : "html"}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importCode = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = `.${language === "python" ? "py" : language === "sql" ? "sql" : "html"},.txt`
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          if (onCodeLoad) {
            onCodeLoad(content)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  if (!session) return null

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={importCode}
          className="px-3 py-1.5 text-xs rounded border border-white/10 bg-white/5 hover:bg-white/10 transition text-zinc-300 hover:text-white"
          title="Import code from file"
        >
          Import
        </button>
        <button
          onClick={exportCode}
          className="px-3 py-1.5 text-xs rounded border border-white/10 bg-white/5 hover:bg-white/10 transition text-zinc-300 hover:text-white"
          title="Export code to file"
        >
          Export
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 text-xs rounded border border-white/10 bg-white/5 hover:bg-white/10 transition text-zinc-300 hover:text-white flex items-center gap-1.5"
          title="Save code snippet"
        >
          <Save className="w-3 h-3" />
          Save
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-black border border-white/10 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Code Snippets</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedSnippet(null)
                }}
                className="p-1 hover:bg-white/10 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {selectedSnippet ? (
                // View snippet
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{selectedSnippet.title}</h3>
                    {selectedSnippet.description && (
                      <p className="text-sm text-zinc-400 mb-4">{selectedSnippet.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {selectedSnippet.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {selectedSnippet.likes}
                      </span>
                      {selectedSnippet.tags && (
                        <span className="text-zinc-600">{selectedSnippet.tags}</span>
                      )}
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{selectedSnippet.code}</pre>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadSnippet(selectedSnippet)}
                      className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition"
                    >
                      Load Code
                    </button>
                    {selectedSnippet.shareId && (
                      <button
                        onClick={() => copyShareLink(selectedSnippet.shareId!)}
                        className="px-4 py-2 border border-white/10 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition flex items-center gap-2"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // List snippets or save form
                <div className="space-y-4">
                  {/* Save Form */}
                  <div className="bg-white/5 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Save Current Code</h3>
                    <input
                      type="text"
                      placeholder="Snippet title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/20"
                    />
                    <textarea
                      placeholder="Description (optional)..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/20 resize-none"
                    />
                    <input
                      type="text"
                      placeholder="Tags (comma-separated)..."
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/20"
                    />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span>Make public (others can view)</span>
                    </label>
                    <button
                      onClick={saveSnippet}
                      disabled={saving || !title.trim()}
                      className="w-full px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? "Saving..." : "Save Snippet"}
                    </button>
                  </div>

                  {/* Snippets List */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Your Snippets</h3>
                    {loading ? (
                      <div className="text-center py-8 text-zinc-500 text-sm">Loading...</div>
                    ) : snippets.length === 0 ? (
                      <div className="text-center py-8 text-zinc-500 text-sm">No snippets yet</div>
                    ) : (
                      <div className="space-y-2">
                        {snippets.map((snippet) => (
                          <div
                            key={snippet.id}
                            onClick={() => setSelectedSnippet(snippet)}
                            className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition cursor-pointer"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm mb-1">{snippet.title}</div>
                                {snippet.description && (
                                  <div className="text-xs text-zinc-500 mb-2 line-clamp-1">
                                    {snippet.description}
                                  </div>
                                )}
                                <div className="flex items-center gap-3 text-xs text-zinc-600">
                                  {snippet.isPublic && (
                                    <span className="flex items-center gap-1">
                                      <Share2 className="w-3 h-3" />
                                      Public
                                    </span>
                                  )}
                                  <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
