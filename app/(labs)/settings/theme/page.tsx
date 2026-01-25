"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useTheme } from "@/lib/theme-context"
import { Palette, Save, X, RefreshCw, Upload, Image as ImageIcon } from "lucide-react"
import Link from "next/link"

export default function ThemeSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  
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
        
        if (level >= 100 || role === "MEDIOCRE" || role === "owner") {
          setHasAccess(true)
          loadTheme()
        } else {
          setHasAccess(false)
          setLoading(false)
        }
      }
    } catch (error) {
      console.error("Access check failed:", error)
      setHasAccess(false)
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
      console.error("Failed to load theme:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file (PNG or GIF)")
      return
    }

    // Validate file size (max 5MB)
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

  const saveTheme = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/users/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          profileCardGradient: formData.profileCardGradient.length > 0 ? formData.profileCardGradient : null
        })
      })
      
      if (res.ok) {
        alert("Theme saved! Refresh the page to see changes.")
        window.location.reload()
      } else {
        alert("Failed to save theme")
      }
    } catch (error) {
      console.error("Failed to save theme:", error)
      alert("Failed to save theme")
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-zinc-400 mb-4">
            You need to be level 100+ or have MEDIOCRE role to customize themes.
          </p>
          <Link
            href="/settings"
            className="inline-block px-4 py-2 bg-white text-black rounded hover:bg-zinc-100 transition"
          >
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/settings"
            className="text-zinc-400 hover:text-white mb-4 inline-block"
          >
            ← Back to Settings
          </Link>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Palette className="h-8 w-8" />
            Theme Customization
          </h1>
          <p className="text-zinc-400">
            Customize your background, glitch text colors, card colors, and layout colors
          </p>
        </div>

        <div className="space-y-6">
          {/* Background Color */}
          <div className="bg-black/50 border border-white/10 rounded-lg p-6">
            <label className="block text-sm font-medium mb-3">Background Color</label>
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
          <div className="bg-black/50 border border-white/10 rounded-lg p-6">
            <label className="block text-sm font-medium mb-3">Glitch Text Colors</label>
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
          <div className="bg-black/50 border border-white/10 rounded-lg p-6">
            <label className="block text-sm font-medium mb-3">Card Background Color</label>
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
          <div className="bg-black/50 border border-white/10 rounded-lg p-6">
            <label className="block text-sm font-medium mb-3">Layout/Accent Color</label>
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
          <div className="bg-black/50 border border-white/10 rounded-lg p-6">
            <label className="block text-sm font-medium mb-3">Profile Card Animated Gradient</label>
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
          <div className="bg-black/50 border border-white/10 rounded-lg p-6">
            <label className="block text-sm font-medium mb-3">Profile Card Banner</label>
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

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={saveTheme}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-white text-black rounded hover:bg-zinc-100 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Theme
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
