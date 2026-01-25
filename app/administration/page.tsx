"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import LetterGlitch from "@/components/LetterGlitch"
import {
  Database,
  Users,
  BarChart3,
  BookOpen,
  Key,
  Settings,
  Activity,
  FileText,
  MessageSquare,
  Shield,
  Home,
  ChevronRight,
  Search,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Clock,
  Heart,
  TrendingUp,
  FileDown,
  Save,
  X,
  Calendar,
  Filter
} from "lucide-react"
import Link from "next/link"

const OWNER_EMAIL = "logeshms.cbe@gmail.com"

type TabType = 
  | "dashboard" 
  | "database" 
  | "users" 
  | "analytics" 
  | "content" 
  | "invites" 
  | "settings"
  | "activity-logs"
  | "system-health"
  | "user-activity"
  | "reports"

export default function AdministrationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as any
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || user?.role === "owner"
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    
    if (status === "authenticated" && !isOwner) {
      router.push("/")
      return
    }
  }, [status, isOwner, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (!isOwner) {
    return null
  }

  const tabs = [
    { id: "dashboard" as TabType, label: "Dashboard", icon: BarChart3 },
    { id: "database" as TabType, label: "Database", icon: Database },
    { id: "users" as TabType, label: "Users", icon: Users },
    { id: "user-activity" as TabType, label: "User Activity", icon: TrendingUp },
    { id: "activity-logs" as TabType, label: "Activity Logs", icon: Clock },
    { id: "analytics" as TabType, label: "Analytics", icon: Activity },
    { id: "system-health" as TabType, label: "System Health", icon: Heart },
    { id: "content" as TabType, label: "Content", icon: BookOpen },
    { id: "invites" as TabType, label: "Invite Codes", icon: Key },
    { id: "reports" as TabType, label: "Reports", icon: FileDown },
    { id: "settings" as TabType, label: "Settings", icon: Settings },
  ]

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap');
      `}</style>
      
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchColors={['#ffffff', '#888888', '#333333']}
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/30 to-black/70" />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-2xl flex flex-col">
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition mb-4">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-white" />
              <h1 className="text-lg font-semibold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Owner Dashboard
              </h1>
            </div>
            <p className="text-xs text-zinc-500 mt-1" style={{ fontFamily: "'Space Mono', monospace" }}>
              {user?.email || user?.username}
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {activeTab === "dashboard" && <DashboardOverview />}
            {activeTab === "database" && <DatabaseViewer />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "user-activity" && <UserActivityTracking />}
            {activeTab === "activity-logs" && <ActivityLogs />}
            {activeTab === "analytics" && <SystemAnalytics />}
            {activeTab === "system-health" && <SystemHealthMonitoring />}
            {activeTab === "content" && <ContentManagement />}
            {activeTab === "invites" && <InviteManagement />}
            {activeTab === "reports" && <ReportsExports />}
            {activeTab === "settings" && <SystemSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Dashboard Overview Component
function DashboardOverview() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-zinc-500">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Dashboard Overview
        </h2>
        <p className="text-zinc-400 text-sm">System overview and quick stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Lessons"
          value={stats?.totalLessons || 0}
          icon={BookOpen}
          color="green"
        />
        <StatCard
          title="Active Invites"
          value={stats?.activeInvites || 0}
          icon={Key}
          color="purple"
        />
        <StatCard
          title="Total Messages"
          value={stats?.totalMessages || 0}
          icon={MessageSquare}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats?.recentUsers?.slice(0, 5).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{u.username}</span>
                <span className="text-zinc-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 text-sm">Database</span>
              <span className="text-green-400 text-xs">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 text-sm">API Status</span>
              <span className="text-green-400 text-xs">✓ Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorClasses = {
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    green: "bg-green-500/20 border-green-500/30 text-green-400",
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-400",
    orange: "bg-orange-500/20 border-orange-500/30 text-orange-400",
  }

  return (
    <div className={`bg-black/50 backdrop-blur border rounded-lg p-6 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-80">{title}</div>
    </div>
  )
}

// Database Viewer Component
function DatabaseViewer() {
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [queryError, setQueryError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/database/tables")
      .then(res => res.json())
      .then(data => setTables(data.tables || []))
      .catch(() => {})
  }, [])

  const loadTableData = async (table: string) => {
    setLoading(true)
    setSelectedTable(table)
    try {
      const res = await fetch(`/api/admin/database/table/${table}`)
      const data = await res.json()
      setTableData(data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const executeQuery = async () => {
    if (!query.trim()) return
    setLoading(true)
    setQueryError(null)
    setQueryResult(null)
    try {
      const res = await fetch("/api/admin/database/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      if (data.error) {
        setQueryError(data.error)
      } else {
        setQueryResult(data)
      }
    } catch (e: any) {
      setQueryError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Database Viewer
        </h2>
        <p className="text-zinc-400 text-sm">Browse and query database tables</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Tables</h3>
          <div className="space-y-1">
            {tables.map(table => (
              <button
                key={table}
                onClick={() => loadTableData(table)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                  selectedTable === table
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {table}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">SQL Query</h3>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="SELECT * FROM User LIMIT 10;"
              className="w-full h-32 bg-black border border-white/15 rounded p-3 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white"
            />
            <button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className="mt-3 px-4 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50"
            >
              Execute Query
            </button>
            {queryError && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
                {queryError}
              </div>
            )}
            {queryResult && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {queryResult.columns?.map((col: string) => (
                        <th key={col} className="text-left p-2 text-zinc-400">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows?.map((row: any, i: number) => (
                      <tr key={i} className="border-b border-white/5">
                        {queryResult.columns?.map((col: string) => (
                          <td key={col} className="p-2 text-zinc-300">{String(row[col] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedTable && (
            <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Table: {selectedTable}</h3>
                <button
                  onClick={() => loadTableData(selectedTable)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              {loading ? (
                <div className="text-zinc-500">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        {tableData.length > 0 && Object.keys(tableData[0]).map(key => (
                          <th key={key} className="text-left p-2 text-zinc-400">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.slice(0, 100).map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="p-2 text-zinc-300 max-w-xs truncate">
                              {String(val ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tableData.length > 100 && (
                    <div className="mt-2 text-xs text-zinc-500">
                      Showing first 100 rows of {tableData.length} total
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// User Management Component
function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      loadUsers()
    } catch (e) {
      console.error(e)
    }
  }

  const updateUser = async (userId: string, updates: any) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })
      loadUsers()
      setShowEditModal(false)
      setSelectedUser(null)
    } catch (e) {
      console.error(e)
    }
  }

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            User Management
          </h2>
          <p className="text-zinc-400 text-sm">Manage users, roles, and permissions</p>
        </div>
        <button
          onClick={loadUsers}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition text-sm"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-zinc-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-zinc-400">Username</th>
                  <th className="text-left p-3 text-zinc-400">Email</th>
                  <th className="text-left p-3 text-zinc-400">Role</th>
                  <th className="text-left p-3 text-zinc-400">XP / Level</th>
                  <th className="text-left p-3 text-zinc-400">Joined</th>
                  <th className="text-left p-3 text-zinc-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3 text-zinc-300">{user.username}</td>
                    <td className="p-3 text-zinc-300">{user.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === "owner" ? "bg-purple-500/20 text-purple-400" :
                        user.role === "admin" ? "bg-blue-500/20 text-blue-400" :
                        user.role === "MEDIOCRE" ? "bg-green-500/20 text-green-400" :
                        "bg-zinc-500/20 text-zinc-400"
                      }`}>
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-300">{user.xp || 0} / Lv.{user.level || 1}</td>
                    <td className="p-3 text-zinc-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowEditModal(true)
                          }}
                          className="text-zinc-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-zinc-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false)
            setSelectedUser(null)
          }}
          onSave={updateUser}
        />
      )}
    </div>
  )
}

function EditUserModal({ user, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    username: user.username || "",
    email: user.email || "",
    role: user.role || "user",
    xp: user.xp || 0,
    level: user.level || 1,
  })

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-black/90 border border-white/10 rounded-lg p-6 w-96">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit User</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ×
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
            >
              <option value="user">User</option>
              <option value="MEDIOCRE">MEDIOCRE</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">XP</label>
              <input
                type="number"
                value={formData.xp}
                onChange={e => setFormData({ ...formData, xp: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Level</label>
              <input
                type="number"
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-white/15 rounded hover:border-white transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(user.id, formData)}
              className="flex-1 px-4 py-2 bg-white text-black rounded hover:bg-zinc-100 transition font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// System Analytics Component
function SystemAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(data => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-zinc-500">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          System Analytics
        </h2>
        <p className="text-zinc-400 text-sm">Detailed system metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
          <h3 className="text-sm text-zinc-400 mb-2">User Growth</h3>
          <div className="text-3xl font-bold">{analytics?.userGrowth || 0}</div>
          <div className="text-xs text-zinc-500 mt-1">New users this month</div>
        </div>
        <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
          <h3 className="text-sm text-zinc-400 mb-2">Active Users</h3>
          <div className="text-3xl font-bold">{analytics?.activeUsers || 0}</div>
          <div className="text-xs text-zinc-500 mt-1">Last 30 days</div>
        </div>
        <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
          <h3 className="text-sm text-zinc-400 mb-2">Lessons Completed</h3>
          <div className="text-3xl font-bold">{analytics?.lessonsCompleted || 0}</div>
          <div className="text-xs text-zinc-500 mt-1">Total completions</div>
        </div>
      </div>
    </div>
  )
}

// Content Management Component
function ContentManagement() {
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showNewLesson, setShowNewLesson] = useState(false)

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/lessons")
      const data = await res.json()
      setLessons(data.lessons || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const deleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson?")) return
    try {
      await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" })
      loadLessons()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Content Management
          </h2>
          <p className="text-zinc-400 text-sm">Manage lessons and challenges</p>
        </div>
        <button
          onClick={() => {
            setSelectedLesson(null)
            setShowNewLesson(true)
          }}
          className="px-4 py-2 bg-white text-black rounded hover:bg-zinc-100 transition font-medium flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Lesson
        </button>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Lessons</h3>
        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="space-y-2">
            {lessons.map(lesson => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-3 bg-black/50 rounded border border-white/5 hover:bg-white/5 transition"
              >
                <div className="flex-1">
                  <div className="font-medium">{lesson.title}</div>
                  <div className="text-xs text-zinc-500">{lesson.slug}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {lesson.sections?.length || 0} sections • Topic: {lesson.topic}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    lesson.published ? "bg-green-500/20 text-green-400" : "bg-zinc-500/20 text-zinc-400"
                  }`}>
                    {lesson.published ? "Published" : "Draft"}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedLesson(lesson)
                      setShowEditor(true)
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteLesson(lesson.id)}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {lessons.length === 0 && (
              <div className="text-center text-zinc-500 py-8">No lessons found</div>
            )}
          </div>
        )}
      </div>

      {(showEditor || showNewLesson) && (
        <LessonEditor
          lesson={selectedLesson}
          onClose={() => {
            setShowEditor(false)
            setShowNewLesson(false)
            setSelectedLesson(null)
          }}
          onSave={() => {
            loadLessons()
            setShowEditor(false)
            setShowNewLesson(false)
            setSelectedLesson(null)
          }}
        />
      )}
    </div>
  )
}

// Lesson Editor Component
function LessonEditor({ lesson, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    slug: lesson?.slug || "",
    title: lesson?.title || "",
    topic: lesson?.topic || "",
    summary: lesson?.summary || "",
    order: lesson?.order || 0,
    published: lesson?.published || false,
    sections: lesson?.sections || []
  })
  const [editingSection, setEditingSection] = useState<any | null>(null)
  const [saving, setSaving] = useState(false)

  const saveLesson = async () => {
    setSaving(true)
    try {
      if (lesson?.id) {
        // Update existing lesson
        await fetch(`/api/admin/lessons/${lesson.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: formData.slug,
            title: formData.title,
            topic: formData.topic,
            summary: formData.summary,
            order: formData.order,
            published: formData.published
          })
        })
      } else {
        // Create new lesson
        await fetch("/api/admin/lessons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        })
      }
      onSave()
    } catch (e) {
      console.error(e)
      alert("Failed to save lesson")
    } finally {
      setSaving(false)
    }
  }

  const addSection = () => {
    setEditingSection({ title: "", content: "", type: "text", order: formData.sections.length })
  }

  const saveSection = async (section: any) => {
    try {
      if (section.id) {
        await fetch(`/api/admin/lessons/sections/${section.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(section)
        })
      } else {
        await fetch(`/api/admin/lessons/${lesson?.id || "new"}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...section, lessonId: lesson?.id })
        })
      }
      // Reload lesson to get updated sections
      if (lesson?.id) {
        const res = await fetch(`/api/admin/lessons/${lesson.id}`)
        const data = await res.json()
        setFormData({ ...formData, sections: data.lesson.sections })
      }
      setEditingSection(null)
    } catch (e) {
      console.error(e)
    }
  }

  const deleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section?")) return
    try {
      await fetch(`/api/admin/lessons/sections/${sectionId}`, { method: "DELETE" })
      setFormData({
        ...formData,
        sections: formData.sections.filter((s: any) => s.id !== sectionId)
      })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-black/90 border border-white/10 rounded-lg p-6 w-full max-w-4xl my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            {lesson ? "Edit Lesson" : "New Lesson"}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
                placeholder="lesson-slug"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Topic</label>
            <input
              type="text"
              value={formData.topic}
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Summary</label>
            <textarea
              value={formData.summary}
              onChange={e => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm h-24"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={e => setFormData({ ...formData, published: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm">Published</label>
          </div>

          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Sections</h4>
              {lesson?.id && (
                <button
                  onClick={addSection}
                  className="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm hover:bg-white/20 transition"
                >
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add Section
                </button>
              )}
            </div>

            {editingSection ? (
              <SectionEditor
                section={editingSection}
                onSave={saveSection}
                onCancel={() => setEditingSection(null)}
              />
            ) : (
              <div className="space-y-2">
                {formData.sections.map((section: any) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 bg-black/50 rounded border border-white/5"
                  >
                    <div>
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs text-zinc-500">{section.type} • Order: {section.order}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingSection(section)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-white/15 rounded hover:border-white transition"
          >
            Cancel
          </button>
          <button
            onClick={saveLesson}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-white text-black rounded hover:bg-zinc-100 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Lesson
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Section Editor Component
function SectionEditor({ section, onSave, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: section.title || "",
    content: section.content || "",
    type: section.type || "text",
    order: section.order || 0
  })

  return (
    <div className="p-4 bg-black/50 rounded border border-white/10 space-y-3">
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Type</label>
        <select
          value={formData.type}
          onChange={e => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
        >
          <option value="text">Text</option>
          <option value="code">Code</option>
          <option value="quiz">Quiz</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Content</label>
        <textarea
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm h-32 font-mono"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Order</label>
        <input
          type="number"
          value={formData.order}
          onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave({ ...section, ...formData })}
          className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// Invite Management Component
function InviteManagement() {
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newCode, setNewCode] = useState("")

  useEffect(() => {
    loadInvites()
  }, [])

  const loadInvites = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/invites")
      const data = await res.json()
      setInvites(data.invites || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const createInvite = async () => {
    try {
      await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newCode || undefined })
      })
      setNewCode("")
      loadInvites()
    } catch (e) {
      console.error(e)
    }
  }

  const toggleInvite = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/admin/invites/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active })
      })
      loadInvites()
    } catch (e) {
      console.error(e)
    }
  }

  const deleteInvite = async (id: string) => {
    if (!confirm("Delete this invite code?")) return
    try {
      await fetch(`/api/admin/invites/${id}`, { method: "DELETE" })
      loadInvites()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Invite Code Management
          </h2>
          <p className="text-zinc-400 text-sm">Create and manage registration invite codes</p>
        </div>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Create New Invite</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
            placeholder="Leave empty for auto-generated code"
            className="flex-1 px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600"
          />
          <button
            onClick={createInvite}
            className="px-4 py-2 bg-white text-black rounded hover:bg-zinc-100 transition font-medium"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Existing Invites</h3>
        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : (
          <div className="space-y-2">
            {invites.map(invite => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 bg-black/50 rounded border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <code className="text-sm font-mono bg-white/10 px-2 py-1 rounded">
                    {invite.code}
                  </code>
                  <span className={`text-xs px-2 py-1 rounded ${
                    invite.active ? "bg-green-500/20 text-green-400" : "bg-zinc-500/20 text-zinc-400"
                  }`}>
                    {invite.active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Created: {new Date(invite.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleInvite(invite.id, invite.active)}
                    className="text-zinc-400 hover:text-white"
                  >
                    {invite.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteInvite(invite.id)}
                    className="text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// System Settings Component
function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          System Settings
        </h2>
        <p className="text-zinc-400 text-sm">Configure system-wide settings</p>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Maintenance Mode</div>
                <div className="text-xs text-zinc-500">Enable to restrict access</div>
              </div>
              <button className="w-12 h-6 bg-zinc-700 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 transition" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Registration</div>
                <div className="text-xs text-zinc-500">Allow new user registrations</div>
              </div>
              <button className="w-12 h-6 bg-green-600 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Activity Logs Component
function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    userId: "",
    actionType: "",
    startDate: "",
    endDate: ""
  })

  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.userId) params.append("userId", filters.userId)
      if (filters.actionType) params.append("actionType", filters.actionType)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)

      const res = await fetch(`/api/admin/activity-logs?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const actionTypeColors: Record<string, string> = {
    user_created: "bg-blue-500/20 text-blue-400",
    message_sent: "bg-green-500/20 text-green-400",
    lesson_completed: "bg-purple-500/20 text-purple-400",
    challenge_completed: "bg-orange-500/20 text-orange-400"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Activity Logs
          </h2>
          <p className="text-zinc-400 text-sm">View system-wide activity and audit trail</p>
        </div>
        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition text-sm"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-4 w-4 text-zinc-400" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="User ID"
            value={filters.userId}
            onChange={e => setFilters({ ...filters, userId: e.target.value })}
            className="px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
          />
          <select
            value={filters.actionType}
            onChange={e => setFilters({ ...filters, actionType: e.target.value })}
            className="px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
          >
            <option value="">All Actions</option>
            <option value="user_created">User Created</option>
            <option value="message_sent">Message Sent</option>
            <option value="lesson_completed">Lesson Completed</option>
            <option value="challenge_completed">Challenge Completed</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
            className="px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            className="px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
          />
        </div>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
        {loading ? (
          <div className="text-zinc-500">Loading logs...</div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {logs.map(log => (
              <div
                key={log.id}
                className="p-3 bg-black/50 rounded border border-white/5 hover:bg-white/5 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${actionTypeColors[log.actionType] || "bg-zinc-500/20 text-zinc-400"}`}>
                        {log.actionType}
                      </span>
                      {log.username && (
                        <span className="text-sm text-zinc-300">{log.username}</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">{log.description}</p>
                    {log.metadata && (
                      <div className="text-xs text-zinc-500 mt-1">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center text-zinc-500 py-8">No activity logs found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// System Health Monitoring Component
function SystemHealthMonitoring() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadHealth()
    if (autoRefresh) {
      const interval = setInterval(loadHealth, 5000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadHealth = async () => {
    try {
      const res = await fetch("/api/admin/system-health")
      const data = await res.json()
      setHealth(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !health) {
    return <div className="text-zinc-500">Loading system health...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            System Health Monitoring
          </h2>
          <p className="text-zinc-400 text-sm">Real-time system status and metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded text-sm transition ${
              autoRefresh
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/10 border border-white/20"
            }`}
          >
            Auto-refresh: {autoRefresh ? "ON" : "OFF"}
          </button>
          <button
            onClick={loadHealth}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition text-sm"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {health && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`bg-black/50 backdrop-blur border rounded-lg p-6 ${
              health.database.status === "healthy" ? "border-green-500/30" : "border-red-500/30"
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Database</h3>
                <div className={`w-3 h-3 rounded-full ${
                  health.database.status === "healthy" ? "bg-green-400" : "bg-red-400"
                }`} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status</span>
                  <span className={health.database.status === "healthy" ? "text-green-400" : "text-red-400"}>
                    {health.database.status === "healthy" ? "Healthy" : "Unhealthy"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Response Time</span>
                  <span className="text-zinc-300">{health.database.responseTime}ms</span>
                </div>
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">API</h3>
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status</span>
                  <span className="text-green-400">Operational</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Response Time</span>
                  <span className="text-zinc-300">{health.api.responseTime}ms</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">System Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{health.metrics.totalUsers}</div>
                <div className="text-xs text-zinc-500">Total Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{health.metrics.totalMessages}</div>
                <div className="text-xs text-zinc-500">Total Messages</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{health.metrics.activeUsers24h}</div>
                <div className="text-xs text-zinc-500">Active (24h)</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{health.metrics.errorRate}</div>
                <div className="text-xs text-zinc-500">Error Rate</div>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 text-center">
            Last updated: {new Date(health.timestamp).toLocaleString()}
          </div>
        </>
      )}
    </div>
  )
}

// User Activity Tracking Component
function UserActivityTracking() {
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [users, setUsers] = useState<any[]>([])
  const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    if (selectedUserId) {
      loadActivity(selectedUserId)
    }
  }, [selectedUserId])

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
    }
  }

  const loadActivity = async (userId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/user-activity?userId=${userId}`)
      const data = await res.json()
      setActivity(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          User Activity Tracking
        </h2>
        <p className="text-zinc-400 text-sm">Detailed activity metrics for individual users</p>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Search className="h-4 w-4 text-zinc-400" />
          <h3 className="text-lg font-semibold">Select User</h3>
        </div>
        <select
          value={selectedUserId}
          onChange={e => setSelectedUserId(e.target.value)}
          className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
        >
          <option value="">Select a user...</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username} ({user.email})
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="text-zinc-500">Loading activity...</div>
      )}

      {activity && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
              <h3 className="text-sm text-zinc-400 mb-2">User Info</h3>
              <div className="space-y-2">
                <div className="text-lg font-bold">{activity.user.username}</div>
                <div className="text-xs text-zinc-500">{activity.user.email}</div>
                <div className="text-xs text-zinc-500">
                  Account Age: {activity.user.accountAge} days
                </div>
                {activity.user.lastKnownIp && (
                  <div className="text-xs text-zinc-500">
                    IP: {activity.user.lastKnownIp}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
              <h3 className="text-sm text-zinc-400 mb-2">Activity Score</h3>
              <div className="text-3xl font-bold mb-1">{activity.activity.activityScore}</div>
              <div className="text-xs text-zinc-500">Based on all activities</div>
            </div>

            <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
              <h3 className="text-sm text-zinc-400 mb-2">XP & Level</h3>
              <div className="text-2xl font-bold mb-1">{activity.activity.xp} XP</div>
              <div className="text-sm text-zinc-300">Level {activity.activity.level}</div>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-2xl font-bold">{activity.activity.messagesSent}</div>
                <div className="text-xs text-zinc-500">Messages</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{activity.activity.lessonsCompleted}</div>
                <div className="text-xs text-zinc-500">Lessons</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{activity.activity.sectionsCompleted}</div>
                <div className="text-xs text-zinc-500">Sections</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{activity.activity.challengesCompleted}</div>
                <div className="text-xs text-zinc-500">Challenges</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{activity.activity.filesCreated}</div>
                <div className="text-xs text-zinc-500">Files</div>
              </div>
            </div>
          </div>

          {activity.recentActivity.challenges.length > 0 && (
            <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Challenges</h3>
              <div className="space-y-2">
                {activity.recentActivity.challenges.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-black/50 rounded text-sm">
                    <span className="text-zinc-300">{c.challengeId}</span>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>+{c.xpAwarded} XP</span>
                      <span>{new Date(c.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Reports & Exports Component
function ReportsExports() {
  const [exportType, setExportType] = useState("users")
  const [exportFormat, setExportFormat] = useState("json")
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const url = `/api/admin/reports/export?type=${exportType}&format=${exportFormat}`
      const res = await fetch(url)
      
      if (exportFormat === "csv") {
        const blob = await res.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `${exportType}-export-${Date.now()}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      } else {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `${exportType}-export-${Date.now()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      }
    } catch (e) {
      console.error(e)
      alert("Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Reports & Exports
        </h2>
        <p className="text-zinc-400 text-sm">Export data in various formats</p>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Export Data</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Export Type</label>
            <select
              value={exportType}
              onChange={e => setExportType(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm"
            >
              <option value="users">Users</option>
              <option value="lessons">Lessons Progress</option>
              <option value="challenges">Challenges</option>
              <option value="messages">Messages</option>
              <option value="activity">Activity Logs</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Export Format</label>
            <div className="flex gap-3">
              <button
                onClick={() => setExportFormat("json")}
                className={`flex-1 px-4 py-2 rounded transition ${
                  exportFormat === "json"
                    ? "bg-white text-black"
                    : "bg-white/10 border border-white/20"
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setExportFormat("csv")}
                className={`flex-1 px-4 py-2 rounded transition ${
                  exportFormat === "csv"
                    ? "bg-white text-black"
                    : "bg-white/10 border border-white/20"
                }`}
              >
                CSV
              </button>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full px-4 py-3 bg-white text-black rounded hover:bg-zinc-100 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-black/50 backdrop-blur border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Available Reports</h3>
        <div className="space-y-3">
          <div className="p-3 bg-black/50 rounded border border-white/5">
            <div className="font-medium mb-1">User Export</div>
            <div className="text-xs text-zinc-500">
              Export all user data including username, email, role, XP, and level
            </div>
          </div>
          <div className="p-3 bg-black/50 rounded border border-white/5">
            <div className="font-medium mb-1">Lessons Progress</div>
            <div className="text-xs text-zinc-500">
              Export lesson completion data for all users
            </div>
          </div>
          <div className="p-3 bg-black/50 rounded border border-white/5">
            <div className="font-medium mb-1">Challenges</div>
            <div className="text-xs text-zinc-500">
              Export challenge completion records
            </div>
          </div>
          <div className="p-3 bg-black/50 rounded border border-white/5">
            <div className="font-medium mb-1">Messages</div>
            <div className="text-xs text-zinc-500">
              Export message data (limited to 10,000 most recent)
            </div>
          </div>
          <div className="p-3 bg-black/50 rounded border border-white/5">
            <div className="font-medium mb-1">Activity Logs</div>
            <div className="text-xs text-zinc-500">
              Export comprehensive activity logs from all sources
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
