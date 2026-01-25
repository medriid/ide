"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import { 
  User, 
  FileCode, 
  Settings as SettingsIcon,
  ChevronLeft,
  Loader2,
  Save,
  LogOut,
  Trash2,
  Upload,
  X,
  Trophy,
  Zap,
  TrendingUp,
  Palette,
  Lock,
  Check,
  Github,
  Link2,
  Unlink,
  RefreshCw,
  Image as ImageIcon
} from "lucide-react"
import Link from "next/link"
import MusicPlayer from "@/components/MusicPlayer"
import { useTheme } from "@/lib/theme-context"

// Combined Customization Tab Component (includes both customization and theme customization)
function CustomizationTab({ userRole, userLevel }: { userRole?: string; userLevel?: number }) {
  const theme = useTheme()
  const [customization, setCustomization] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState("default")
  const [accentColor, setAccentColor] = useState("")
  
  // Theme customization state (for MEDIOCRE role users)
  const [formData, setFormData] = useState({
    customBackgroundColor: theme.customBackgroundColor || "",
    customGlitchColors: theme.customGlitchColors || ['#ffffff', '#888888', '#333333'],
    customCardColor: theme.customCardColor || "",
    customLayoutColor: theme.customLayoutColor || "",
    profileCardGradient: theme.profileCardGradient || ['#ff6b6b', '#4ecdc4', '#45b7d1'],
    profileBannerImage: theme.profileBannerImage || "",
    profileBannerType: theme.profileBannerType || null
  })
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  
  const hasThemeAccess = userLevel && userLevel >= 100 || userRole === "MEDIOCRE" || userRole === "owner"

  const themes = [
    { id: "default", name: "Default", unlocked: true, description: "Classic dark theme" },
    { id: "neon", name: "Neon", unlocked: false, description: "Vibrant neon colors" },
    { id: "matrix", name: "Matrix", unlocked: false, description: "Green on black" },
    { id: "ocean", name: "Ocean", unlocked: false, description: "Blue ocean vibes" },
    { id: "sunset", name: "Sunset", unlocked: false, description: "Warm orange tones" },
  ]

  useEffect(() => {
    loadCustomization()
    if (hasThemeAccess) {
      loadTheme()
    }
  }, [])

  const loadCustomization = async () => {
    try {
      const res = await fetch("/api/gamification/customization")
      if (res.ok) {
        const data = await res.json()
        setCustomization(data)
        setSelectedTheme(data.theme || "default")
        setAccentColor(data.accentColor || "")
      }
    } catch (error) {
      console.error("Failed to load customization", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTheme = async () => {
    try {
      const res = await fetch("/api/users/theme", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setFormData({
          customBackgroundColor: data.customBackgroundColor || "",
          customGlitchColors: data.customGlitchColors 
            ? (typeof data.customGlitchColors === 'string' 
                ? JSON.parse(data.customGlitchColors)
                : data.customGlitchColors)
            : ['#ffffff', '#888888', '#333333'],
          customCardColor: data.customCardColor || "",
          customLayoutColor: data.customLayoutColor || "",
          profileCardGradient: data.profileCardGradient
            ? (typeof data.profileCardGradient === 'string'
                ? JSON.parse(data.profileCardGradient)
                : data.profileCardGradient)
            : ['#ff6b6b', '#4ecdc4', '#45b7d1'],
          profileBannerImage: data.profileBannerImage || "",
          profileBannerType: data.profileBannerType || null
        })
      }
    } catch (error) {
      console.error("Failed to load theme", error)
    }
  }

  const saveCustomization = async () => {
    setSaving(true)
    try {
      await Promise.all([
        fetch("/api/gamification/customization", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme: selectedTheme,
            accentColor: accentColor || null
          })
        }),
        hasThemeAccess ? fetch("/api/users/theme", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...formData,
            profileCardGradient: formData.profileCardGradient.length > 0 ? formData.profileCardGradient : null
          })
        }) : Promise.resolve()
      ])
      
      if (hasThemeAccess) {
        alert("Customization saved! Refresh the page to see theme changes.")
        window.location.reload()
      } else {
        const res = await fetch("/api/gamification/customization")
        if (res.ok) {
          const data = await res.json()
          setCustomization(data)
        }
      }
    } catch (error) {
      console.error("Failed to save customization", error)
      alert("Failed to save customization")
    } finally {
      setSaving(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert("Please select an image file (PNG or GIF)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB")
      return
    }

    setUploadingBanner(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'banner')

      const res = await fetch("/api/users/upload", {
        method: "POST",
        credentials: "include",
        body: uploadFormData
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        setFormData({
          ...formData,
          profileBannerImage: data.image,
          profileBannerType: data.type
        })
      } else {
        alert(data.error || "Failed to upload banner. File may have failed malware scan.")
      }
    } catch (error) {
      console.error("Failed to upload banner:", error)
      alert("Failed to upload banner")
    } finally {
      setUploadingBanner(false)
      if (bannerInputRef.current) {
        bannerInputRef.current.value = ""
      }
    }
  }

  const updateGlitchColor = (index: number, value: string) => {
    const newColors = [...formData.customGlitchColors]
    newColors[index] = value
    setFormData({ ...formData, customGlitchColors: newColors })
  }

  const addGlitchColor = () => {
    setFormData({
      ...formData,
      customGlitchColors: [...formData.customGlitchColors, '#000000']
    })
  }

  const removeGlitchColor = (index: number) => {
    if (formData.customGlitchColors.length > 1) {
      const newColors = formData.customGlitchColors.filter((_, i) => i !== index)
      setFormData({ ...formData, customGlitchColors: newColors })
    }
  }

  const updateGradientColor = (index: number, value: string) => {
    const newColors = [...formData.profileCardGradient]
    newColors[index] = value
    setFormData({ ...formData, profileCardGradient: newColors })
  }

  const addGradientColor = () => {
    setFormData({
      ...formData,
      profileCardGradient: [...formData.profileCardGradient, '#000000']
    })
  }

  const removeGradientColor = (index: number) => {
    if (formData.profileCardGradient.length > 1) {
      const newColors = formData.profileCardGradient.filter((_, i) => i !== index)
      setFormData({ ...formData, profileCardGradient: newColors })
    }
  }

  const unlockedThemes = customization?.unlockedThemes || ["default"]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Basic Theme Selection */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-sm font-medium mb-4">Theme</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {themes.map((theme) => {
            const isUnlocked = unlockedThemes.includes(theme.id)
            const isSelected = selectedTheme === theme.id
            return (
              <button
                key={theme.id}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedTheme(theme.id)
                  }
                }}
                disabled={!isUnlocked}
                className={`p-4 rounded-lg border transition ${
                  isSelected
                    ? "border-white bg-white/10"
                    : isUnlocked
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-white/5 bg-white/5 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{theme.name}</div>
                  {!isUnlocked && <Lock className="w-3 h-3 text-zinc-600" />}
                  {isSelected && isUnlocked && <Check className="w-4 h-4" />}
                </div>
                <div className="text-xs text-zinc-500">{theme.description}</div>
                {!isUnlocked && (
                  <div className="text-xs text-zinc-600 mt-2">Unlock by completing achievements</div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-sm font-medium mb-4">Accent Color</h2>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={accentColor || "#ffffff"}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-16 h-16 rounded-lg border border-white/10 cursor-pointer"
          />
          <div className="flex-1">
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              placeholder="#ffffff"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-white/20"
            />
            <div className="text-xs text-zinc-500 mt-1">Customize your accent color</div>
          </div>
        </div>
      </div>

      {/* Advanced Theme Customization (for MEDIOCRE role users) */}
      {hasThemeAccess && (
        <>
          {/* Background Color */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-medium mb-4">Background Color</h2>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.customBackgroundColor || "#000000"}
                onChange={e => setFormData({ ...formData, customBackgroundColor: e.target.value })}
                className="w-20 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.customBackgroundColor || ""}
                onChange={e => setFormData({ ...formData, customBackgroundColor: e.target.value })}
                placeholder="#000000"
                className="flex-1 px-3 py-2 bg-black border border-white/15 rounded text-white text-sm font-mono placeholder-zinc-600"
              />
              {formData.customBackgroundColor && (
                <button
                  onClick={() => setFormData({ ...formData, customBackgroundColor: "" })}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Leave empty to use default black background
            </p>
          </div>

          {/* Glitch Text Colors */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-medium mb-4">Glitch Text Colors</h2>
            <div className="space-y-3">
              {formData.customGlitchColors.map((color, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="color"
                    value={color}
                    onChange={e => updateGlitchColor(index, e.target.value)}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => updateGlitchColor(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-black border border-white/15 rounded text-white text-sm font-mono placeholder-zinc-600"
                  />
                  {formData.customGlitchColors.length > 1 && (
                    <button
                      onClick={() => removeGlitchColor(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addGlitchColor}
                className="w-full px-4 py-2 border border-white/15 rounded hover:border-white/30 transition text-sm"
              >
                + Add Color
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Colors used for the glitch text effect on backgrounds
            </p>
          </div>

          {/* Card Color */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-medium mb-4">Card Background Color</h2>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.customCardColor || "#000000"}
                onChange={e => setFormData({ ...formData, customCardColor: e.target.value })}
                className="w-20 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.customCardColor || ""}
                onChange={e => setFormData({ ...formData, customCardColor: e.target.value })}
                placeholder="#000000"
                className="flex-1 px-3 py-2 bg-black border border-white/15 rounded text-white text-sm font-mono placeholder-zinc-600"
              />
              {formData.customCardColor && (
                <button
                  onClick={() => setFormData({ ...formData, customCardColor: "" })}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Background color for cards and panels
            </p>
          </div>

          {/* Layout Color */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-medium mb-4">Layout/Accent Color</h2>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.customLayoutColor || "#ffffff"}
                onChange={e => setFormData({ ...formData, customLayoutColor: e.target.value })}
                className="w-20 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.customLayoutColor || ""}
                onChange={e => setFormData({ ...formData, customLayoutColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1 px-3 py-2 bg-black border border-white/15 rounded text-white text-sm font-mono placeholder-zinc-600"
              />
              {formData.customLayoutColor && (
                <button
                  onClick={() => setFormData({ ...formData, customLayoutColor: "" })}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Accent color for borders, highlights, and UI elements
            </p>
          </div>

          {/* Profile Card Gradient */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-medium mb-4">Profile Card Animated Gradient</h2>
            <div className="space-y-3">
              {formData.profileCardGradient.map((color, index) => (
                <div key={index} className="flex items-center gap-4">
                  <input
                    type="color"
                    value={color}
                    onChange={e => updateGradientColor(index, e.target.value)}
                    className="w-20 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={e => updateGradientColor(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-black border border-white/15 rounded text-white text-sm font-mono placeholder-zinc-600"
                  />
                  {formData.profileCardGradient.length > 1 && (
                    <button
                      onClick={() => removeGradientColor(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addGradientColor}
                className="w-full px-4 py-2 border border-white/15 rounded hover:border-white/30 transition text-sm"
              >
                + Add Gradient Color
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Colors for animated gradient on profile card header
            </p>
          </div>

          {/* Profile Banner Image */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-sm font-medium mb-4">Profile Card Banner</h2>
            <div className="space-y-4">
              {formData.profileBannerImage && (
                <div className="relative">
                  <img
                    src={formData.profileBannerImage}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    onClick={() => setFormData({ ...formData, profileBannerImage: "", profileBannerType: null })}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/png,image/gif,image/jpeg"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <button
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="w-full px-4 py-3 border border-white/15 rounded hover:border-white/30 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploadingBanner ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Uploading & Scanning...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {formData.profileBannerImage ? "Replace Banner" : "Upload Banner (PNG/GIF)"}
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Upload a PNG or GIF image for your profile card header. Files are scanned for malware.
            </p>
          </div>
        </>
      )}

      {/* Save Button */}
      <button
        onClick={saveCustomization}
        disabled={saving}
        className="w-full px-4 py-3 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save Changes
          </>
        )}
      </button>
    </div>
  )
}

type UserProfile = {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  bio: string | null
  role: string
  xp: number
  level: number
  createdAt: string
}

type FileNode = {
  id: string
  path: string
  kind: string
  size: number
  updatedAt: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"profile" | "files" | "customization">("profile")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [files, setFiles] = useState<FileNode[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Form state
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [bio, setBio] = useState("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // GitHub connection state
  const [githubConnected, setGithubConnected] = useState(false)
  const [githubUsername, setGithubUsername] = useState<string | null>(null)
  const [githubLoading, setGithubLoading] = useState(false)

  // PIN state
  const [hasPin, setHasPin] = useState(false)
  const [pinLoading, setPinLoading] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinAction, setPinAction] = useState<"set" | "change" | "remove">("set")
  const [pinValue, setPinValue] = useState("")
  const [pinConfirm, setPinConfirm] = useState("")
  const [currentPin, setCurrentPin] = useState("")

  // Define session user type
  type SessionUser = {
    id?: string
    username?: string
    email?: string
    role?: string
  }

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/users/profile", { credentials: "include" })
      const data = await res.json()
      if (res.ok) {
        setProfile(data)
        setUsername(data.username || "")
        setAvatarUrl(data.avatarUrl || "")
        setBio(data.bio || "")
      } else {
        // Fallback to session data if profile API fails
        const user = session?.user as SessionUser | undefined
        if (user) {
          setProfile({
            id: user.id || "",
            username: user.username || user.email?.split("@")[0] || "",
            email: user.email || "",
            avatarUrl: null,
            bio: null,
            role: user.role || "user",
            xp: 0,
            level: 1,
            createdAt: new Date().toISOString()
          })
          setUsername(user.username || user.email?.split("@")[0] || "")
        }
      }
    } catch (e) {
      console.error("Failed to load profile", e)
      // Fallback to session data
      const user = session?.user as SessionUser | undefined
      if (user) {
        setProfile({
          id: user.id || "",
          username: user.username || user.email?.split("@")[0] || "",
          email: user.email || "",
          avatarUrl: null,
          bio: null,
          role: user.role || "user",
          xp: 0,
          level: 1,
          createdAt: new Date().toISOString()
        })
        setUsername(user.username || user.email?.split("@")[0] || "")
      }
    }
    setLoading(false)
  }, [session])

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/files", { credentials: "include" })
      const data = await res.json()
      if (Array.isArray(data)) setFiles(data)
    } catch (e) {
      console.error("Failed to load files", e)
    }
  }, [])

  const loadGithubConnection = useCallback(async () => {
    try {
      const res = await fetch("/api/github/connection", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setGithubConnected(data.connected)
        setGithubUsername(data.githubUsername)
      }
    } catch (e) {
      console.error("Failed to load GitHub connection", e)
    }
  }, [])

  const loadPinStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/users/pin", { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        setHasPin(data.hasPin)
      }
    } catch (e) {
      console.error("Failed to load PIN status", e)
    }
  }, [])

  const handlePinAction = async () => {
    if (pinAction === "set" || pinAction === "change") {
      if (!pinValue || pinValue.length < 4 || pinValue.length > 20) {
        alert("PIN must be 4-20 characters")
        return
      }
      if (pinValue !== pinConfirm) {
        alert("PINs do not match")
        return
      }
    }

    setPinLoading(true)
    try {
      if (pinAction === "set") {
        const res = await fetch("/api/users/pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ pin: pinValue })
        })
        if (res.ok) {
          setHasPin(true)
          setShowPinModal(false)
          setPinValue("")
          setPinConfirm("")
          setSuccess("PIN set successfully")
          setTimeout(() => setSuccess(""), 3000)
        } else {
          const data = await res.json()
          setError(data.error || "Failed to set PIN")
        }
      } else if (pinAction === "change") {
        const res = await fetch("/api/users/pin", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ pin: currentPin, newPin: pinValue })
        })
        if (res.ok) {
          setShowPinModal(false)
          setPinValue("")
          setPinConfirm("")
          setCurrentPin("")
          setSuccess("PIN changed successfully")
          setTimeout(() => setSuccess(""), 3000)
        } else {
          const data = await res.json()
          setError(data.error || "Failed to change PIN")
        }
      } else if (pinAction === "remove") {
        const res = await fetch("/api/users/pin", {
          method: "DELETE",
          credentials: "include"
        })
        if (res.ok) {
          setHasPin(false)
          setShowPinModal(false)
          setCurrentPin("")
          setSuccess("PIN removed successfully")
          setTimeout(() => setSuccess(""), 3000)
        } else {
          const data = await res.json()
          setError(data.error || "Failed to remove PIN")
        }
      }
    } catch (e) {
      console.error("Failed to perform PIN action", e)
      setError("Failed to perform PIN action")
    } finally {
      setPinLoading(false)
    }
  }

  const connectGithub = async () => {
    setGithubLoading(true)
    try {
      const res = await fetch("/api/github/connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ source: "settings" })
      })
      const data = await res.json()
      if (res.ok && data.url) {
        // Redirect to GitHub OAuth
        window.location.href = data.url
      } else {
        setError(data.error || "Failed to initiate GitHub connection")
        setGithubLoading(false)
      }
    } catch (e) {
      console.error("Failed to connect GitHub", e)
      setError("Failed to connect GitHub account")
      setGithubLoading(false)
    }
  }

  const disconnectGithub = async () => {
    if (!confirm("Are you sure you want to disconnect your GitHub account?")) {
      return
    }
    setGithubLoading(true)
    try {
      const res = await fetch("/api/github/connection", {
        method: "DELETE",
        credentials: "include"
      })
      if (res.ok) {
        setGithubConnected(false)
        setGithubUsername(null)
        setSuccess("GitHub account disconnected successfully")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError("Failed to disconnect GitHub account")
      }
    } catch (e) {
      console.error("Failed to disconnect GitHub", e)
      setError("Failed to disconnect GitHub account")
    } finally {
      setGithubLoading(false)
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && session) {
      // Initialize username from session immediately
      const user = session.user as SessionUser | undefined
      if (!username && user?.username) {
        setUsername(user.username)
      } else if (!username && user?.email) {
        setUsername(user.email.split("@")[0])
      }
      loadProfile()
      loadFiles()
      loadGithubConnection()
      loadPinStatus()
    }
  }, [status, session, loadProfile, loadFiles, loadGithubConnection, loadPinStatus, username])

  // Check for URL params (success/error from GitHub callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const successParam = params.get("success")
    const errorParam = params.get("error")
    
    if (successParam === "github_connected") {
      setSuccess("GitHub account connected successfully!")
      setGithubConnected(true)
      loadGithubConnection()
      // Clean URL
      window.history.replaceState({}, "", "/settings")
      setTimeout(() => setSuccess(""), 5000)
    } else if (errorParam) {
      const errorMessages: Record<string, string> = {
        github_auth_failed: "GitHub authentication failed",
        invalid_request: "Invalid request",
        invalid_state: "Invalid state parameter",
        unauthorized: "Unauthorized",
        config_error: "GitHub OAuth not configured",
        token_exchange_failed: "Failed to exchange authorization code",
        no_token: "No access token received",
        github_api_error: "Failed to fetch GitHub user info",
        github_already_linked: "This GitHub account is already linked to another user",
        internal_error: "An internal error occurred"
      }
      setError(errorMessages[errorParam] || "An error occurred")
      // Clean URL
      window.history.replaceState({}, "", "/settings")
      setTimeout(() => setError(""), 5000)
    }
  }, [loadGithubConnection])

  const saveProfile = async () => {
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          username: username !== profile?.username ? username : undefined,
          avatarUrl: avatarUrl || null,
          bio: bio || null
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setProfile(data)
        setSuccess("Profile updated successfully")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (e) {
      setError("Failed to update profile")
    }
    
    setSaving(false)
  }

  const deleteFile = async (path: string) => {
    if (!confirm(`Delete ${path}?`)) return
    
    try {
      await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ path })
      })
      loadFiles()
    } catch (e) {
      console.error("Failed to delete file", e)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 500KB for base64 storage)
    if (file.size > 500 * 1024) {
      setError("Image must be smaller than 500KB")
      return
    }

    setUploading(true)
    setError("")

    try {
      // Resize and compress image
      const resizedDataUrl = await resizeImage(file, 200, 200)
      setAvatarUrl(resizedDataUrl)
    } catch (err) {
      setError("Failed to process image")
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height)
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Failed to get canvas context"))
            return
          }

          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to JPEG with quality 0.8 for smaller size
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8)
          resolve(dataUrl)
        }
        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d0d]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              <span className="font-semibold">Settings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
              activeTab === "profile"
                ? "bg-white text-black font-medium"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
              activeTab === "files"
                ? "bg-white text-black font-medium"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <FileCode className="w-4 h-4" />
            Files
          </button>
          <button
            onClick={() => setActiveTab("customization")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
              activeTab === "customization"
                ? "bg-white text-black font-medium"
                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <Palette className="w-4 h-4" />
            Customization
          </button>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition"
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-8">
            {/* Avatar Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-medium mb-4">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-3xl font-medium overflow-hidden border-2 border-white/20">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      username[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  {avatarUrl && (
                    <button
                      onClick={() => setAvatarUrl("")}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/10 rounded-lg text-sm text-white hover:bg-white/20 transition disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-600">
                    JPG, PNG or GIF. Max 500KB. Will be resized to 200x200.
                  </p>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-medium mb-4">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 block mb-2">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-2">Email</label>
                  <input
                    type="email"
                    value={profile?.email || (session?.user as SessionUser | undefined)?.email || ""}
                    disabled
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-2">Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* PIN Security */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-medium mb-4">Project PIN Security</h2>
              <div className="space-y-4">
                {hasPin ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-950/30 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-green-400">PIN Enabled</div>
                          <div className="text-xs text-zinc-500">
                            Projects can be locked and require PIN for deletion
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPinAction("change")
                          setShowPinModal(true)
                          setPinValue("")
                          setPinConfirm("")
                          setCurrentPin("")
                        }}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition"
                      >
                        Change PIN
                      </button>
                      <button
                        onClick={() => {
                          setPinAction("remove")
                          setShowPinModal(true)
                          setCurrentPin("")
                        }}
                        className="flex-1 px-4 py-2 bg-red-950/30 border border-red-500/20 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/50 transition"
                      >
                        Remove PIN
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">No PIN Set</div>
                        <div className="text-xs text-zinc-500">
                          Set a PIN to lock projects and require it for deletion
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPinAction("set")
                          setShowPinModal(true)
                          setPinValue("")
                          setPinConfirm("")
                        }}
                        className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition"
                      >
                        Set PIN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GitHub Connection */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-medium mb-4">GitHub Integration</h2>
              <div className="space-y-4">
                {githubConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-950/30 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Github className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-green-400">Connected</div>
                          <div className="text-xs text-zinc-500">
                            {githubUsername ? `@${githubUsername}` : "GitHub account linked"}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={disconnectGithub}
                        disabled={githubLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:border-red-500/20 transition disabled:opacity-50"
                      >
                        {githubLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Unlink className="w-4 h-4" />
                            Disconnect
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Your GitHub account is connected. You can use GitHub features and sync your repositories.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Github className="w-5 h-5 text-zinc-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Not Connected</div>
                        <div className="text-xs text-zinc-500">
                          Connect your GitHub account to enable repository features
                        </div>
                      </div>
                      <button
                        onClick={connectGithub}
                        disabled={githubLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {githubLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Link2 className="w-4 h-4" />
                            Connect GitHub
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500">
                      By connecting, you'll be able to access your GitHub repositories and sync your code.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-950/50 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-950/50 border border-green-500/20 rounded-lg px-4 py-3 text-green-400 text-sm">
                {success}
              </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-zinc-200 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Account Stats */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-sm font-medium mb-4">Account Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold">{profile?.level || 1}</div>
                  <div className="text-xs text-zinc-500">Level</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold">{profile?.xp || 0}</div>
                  <div className="text-xs text-zinc-500">Total XP</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                    <FileCode className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold">{files.length}</div>
                  <div className="text-xs text-zinc-500">Files</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold capitalize">{profile?.role || "user"}</div>
                  <div className="text-xs text-zinc-500">Role</div>
                </div>
              </div>
              <div className="text-center text-xs text-zinc-600 mt-4">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
              </div>
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div>
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-medium">Your Files</span>
                <span className="text-xs text-zinc-500">{files.length} files</span>
              </div>
              
              {files.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No files yet. Create some in the Python or SQL IDE!
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {files.map(file => (
                    <div key={file.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition">
                      <div className="flex items-center gap-3">
                        <FileCode className="w-4 h-4 text-zinc-500" />
                        <div>
                          <div className="text-sm font-mono">{file.path}</div>
                          <div className="text-[10px] text-zinc-500">
                            {file.kind} • {formatBytes(file.size)} • Updated {new Date(file.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteFile(file.path)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customization Tab */}
        {activeTab === "customization" && <CustomizationTab userRole={profile?.role} userLevel={profile?.level} />}
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0f0f12] border border-white/10 rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {pinAction === "set" ? "Set PIN" : pinAction === "change" ? "Change PIN" : "Remove PIN"}
              </h2>
              <button onClick={() => {
                setShowPinModal(false)
                setPinValue("")
                setPinConfirm("")
                setCurrentPin("")
              }} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {pinAction === "remove" && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Current PIN</label>
                  <input
                    type="password"
                    value={currentPin}
                    onChange={e => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>
              )}
              {pinAction === "change" && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Current PIN</label>
                  <input
                    type="password"
                    value={currentPin}
                    onChange={e => setCurrentPin(e.target.value)}
                    placeholder="Enter current PIN"
                    className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>
              )}
              {(pinAction === "set" || pinAction === "change") && (
                <>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">
                      {pinAction === "set" ? "PIN" : "New PIN"}
                    </label>
                    <input
                      type="password"
                      value={pinValue}
                      onChange={e => setPinValue(e.target.value)}
                      placeholder="4-20 characters"
                      className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-2">Confirm PIN</label>
                    <input
                      type="password"
                      value={pinConfirm}
                      onChange={e => setPinConfirm(e.target.value)}
                      placeholder="Confirm PIN"
                      className="w-full px-3 py-2 bg-black border border-white/15 rounded text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowPinModal(false)
                  setPinValue("")
                  setPinConfirm("")
                  setCurrentPin("")
                }}
                className="flex-1 px-3 py-2 border border-white/15 rounded hover:border-white transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePinAction}
                disabled={pinLoading || (pinAction === "remove" && !currentPin) || 
                  ((pinAction === "set" || pinAction === "change") && (!pinValue || !pinConfirm)) ||
                  (pinAction === "change" && !currentPin)}
                className="flex-1 px-3 py-2 bg-white text-black rounded hover:bg-zinc-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {pinLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  pinAction === "set" ? "Set PIN" : pinAction === "change" ? "Change PIN" : "Remove PIN"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Music Player */}
      <MusicPlayer variant="floating" />
    </div>
  )
}
