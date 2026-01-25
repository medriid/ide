"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, Music, Search } from "lucide-react"

type MusicPlayerProps = {
  variant?: "default" | "floating" | "column"
}

const defaultTracks: Array<{ title: string; artist: string; url: string }> = []

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function MusicPlayer({ variant = "default" }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [tracks, setTracks] = useState(defaultTracks)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [restored, setRestored] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const canPlayHandlerRef = useRef<(() => void) | null>(null)
  const pendingTimeRef = useRef<number>(0)
  const shouldAutoPlayRef = useRef<boolean>(false)

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const res = await fetch("/api/songs")
        const localSongs = await res.json()
        
        if (!Array.isArray(localSongs) || localSongs.length === 0) {
          setLoaded(true)
          return
        }
        
        const allTracks = localSongs
        
        const savedState = localStorage.getItem("musicPlayer_state")
        let savedTrackUrl = null
        let savedIsPlaying = false
        if (savedState) {
          try {
            const state = JSON.parse(savedState)
            if (state.trackUrl && allTracks.some((t: { url: string }) => t.url === state.trackUrl)) {
              savedTrackUrl = state.trackUrl
            }
            if (state.isMuted !== undefined) {
              setIsMuted(state.isMuted)
            }
            if (state.isPlaying !== undefined) {
              savedIsPlaying = state.isPlaying
              setIsPlaying(state.isPlaying)
            }
          } catch {
            // Ignore parse errors
          }
        }
        
        const shuffled = shuffleArray(allTracks)
        setTracks(shuffled)
        
        if (savedTrackUrl) {
          const savedIndex = shuffled.findIndex((t: { url: string }) => t.url === savedTrackUrl)
          if (savedIndex >= 0) {
            setCurrentTrack(savedIndex)
            // If music was playing, set flag to auto-play after load
            if (savedIsPlaying) {
              shouldAutoPlayRef.current = true
            }
          }
        }
      } catch {
        // Ignore errors
      }
      setLoaded(true)
    }
    loadSongs()
  }, [])

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const audio = audioRef.current
      if (audio && tracks.length > 0) {
        const currentUrl = tracks[currentTrack]?.url
        localStorage.setItem("musicPlayer_state", JSON.stringify({
          trackIndex: currentTrack,
          trackUrl: currentUrl,
          isPlaying: !audio.paused,
          isMuted: audio.muted,
          currentTime: audio.currentTime
        }))
      }
    }
    
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      handleBeforeUnload() // Also save on unmount
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [currentTrack, tracks])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !loaded || tracks.length === 0) return

    // Read saved state on first restore or when track changes
    const savedState = localStorage.getItem("musicPlayer_state")
    const currentUrl = tracks[currentTrack]?.url
    const isTrackChange = restored && savedState && JSON.parse(savedState).trackUrl !== currentUrl
    
    if (!restored || isTrackChange) {
      if (savedState) {
        try {
          const state = JSON.parse(savedState)
          const isSameTrack = state.trackUrl === currentUrl
          
          if (isSameTrack && state.currentTime !== undefined && !isNaN(state.currentTime) && state.currentTime > 0) {
            pendingTimeRef.current = parseFloat(state.currentTime)
          } else {
            // New track, start from beginning
            pendingTimeRef.current = 0
          }
          
          // Only override auto-play flag if not already set (for manual track changes)
          if (state.isPlaying !== undefined && !shouldAutoPlayRef.current) {
            shouldAutoPlayRef.current = state.isPlaying
            setIsPlaying(state.isPlaying)
          } else if (shouldAutoPlayRef.current) {
            // If auto-play flag is set (from manual skip), ensure state matches
            setIsPlaying(true)
          }
        } catch {
          // Ignore parse errors
        }
      }
      if (!restored) {
        setRestored(true)
      }
    }

    audio.load()
    setProgress(0)
    
    const restoreTime = () => {
      const audio = audioRef.current
      if (!audio) return
      
      if (pendingTimeRef.current > 0 && audio.duration) {
        const targetTime = Math.min(pendingTimeRef.current, audio.duration - 0.5)
        audio.currentTime = targetTime
        setProgress((targetTime / audio.duration) * 100)
        pendingTimeRef.current = 0
      }
      
      if (shouldAutoPlayRef.current) {
        // Try to play immediately
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              shouldAutoPlayRef.current = false
            })
            .catch(() => {
              // If autoplay fails, try again after a short delay
              setTimeout(() => {
                audio.play()
                  .then(() => {
                    setIsPlaying(true)
                    shouldAutoPlayRef.current = false
                  })
                  .catch(() => {
                    setIsPlaying(false)
                    shouldAutoPlayRef.current = false
                  })
              }, 200)
            })
        } else {
          shouldAutoPlayRef.current = false
        }
      }
    }

    const handleCanPlay = () => {
      restoreTime()
      if (canPlayHandlerRef.current) {
        audio.removeEventListener("canplay", canPlayHandlerRef.current)
        canPlayHandlerRef.current = null
      }
    }
    
    canPlayHandlerRef.current = handleCanPlay
    audio.addEventListener("canplay", handleCanPlay)
    
    if (audio.readyState >= 3) {
      restoreTime()
    }

    const handleError = () => {
      console.error("Failed to load audio:", audio.src)
      const next = (currentTrack + 1) % tracks.length
      setCurrentTrack(next)
      setIsPlaying(false)
    }

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100)
        setCurrentTime(audio.currentTime)
        // Save currentTime to state every update
        const currentUrl = tracks[currentTrack]?.url
        localStorage.setItem("musicPlayer_state", JSON.stringify({
          trackIndex: currentTrack,
          trackUrl: currentUrl,
          isPlaying: !audio.paused,
          isMuted: audio.muted,
          currentTime: audio.currentTime
        }))
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      const next = (currentTrack + 1) % tracks.length
      // Auto-play next track
      shouldAutoPlayRef.current = true
      setCurrentTrack(next)
    }

    audio.addEventListener("timeupdate", updateProgress)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", updateProgress)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      if (canPlayHandlerRef.current) {
        audio.removeEventListener("canplay", canPlayHandlerRef.current)
        canPlayHandlerRef.current = null
      }
    }
  }, [currentTrack, loaded, tracks.length, restored])

  // Save state when play/pause/mute changes (not currentTime - that's saved in timeupdate)
  useEffect(() => {
    if (!loaded || tracks.length === 0) return
    const currentUrl = tracks[currentTrack]?.url
    const savedState = localStorage.getItem("musicPlayer_state")
    let currentTime = audioRef.current?.currentTime || 0
    
    // Preserve existing currentTime if we have it
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        if (state.trackUrl === currentUrl && state.currentTime > currentTime) {
          currentTime = state.currentTime
        }
      } catch {}
    }
    
    localStorage.setItem("musicPlayer_state", JSON.stringify({
      trackIndex: currentTrack,
      trackUrl: currentUrl,
      isPlaying,
      isMuted,
      currentTime
    }))
  }, [currentTrack, isPlaying, isMuted, loaded, tracks])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    const newIsPlaying = !isPlaying
    
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play().catch(() => {
        // Autoplay blocked, ignore
      })
    }
    setIsPlaying(newIsPlaying)
    
    // Save state immediately when toggling play/pause
    const currentUrl = tracks[currentTrack]?.url
    localStorage.setItem("musicPlayer_state", JSON.stringify({
      trackIndex: currentTrack,
      trackUrl: currentUrl,
      isPlaying: newIsPlaying,
      isMuted: audio.muted,
      currentTime: audio.currentTime
    }))
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const nextTrack = () => {
    const audio = audioRef.current
    const wasPlaying = audio && !audio.paused
    const next = (currentTrack + 1) % tracks.length
    
    // Set auto-play flag BEFORE changing track
    if (wasPlaying) {
      shouldAutoPlayRef.current = true
      setIsPlaying(true) // Set state immediately
    }
    
    // Clear saved time when manually switching tracks
    const savedState = localStorage.getItem("musicPlayer_state")
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        state.currentTime = 0
        state.trackIndex = next
        state.trackUrl = tracks[next]?.url
        state.isPlaying = wasPlaying // Preserve play state
        localStorage.setItem("musicPlayer_state", JSON.stringify(state))
      } catch {}
    }
    
    setCurrentTrack(next)
  }

  const prevTrack = () => {
    const audio = audioRef.current
    const wasPlaying = audio && !audio.paused
    const prev = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1
    
    // Set auto-play flag BEFORE changing track
    if (wasPlaying) {
      shouldAutoPlayRef.current = true
      setIsPlaying(true) // Set state immediately
    }
    
    // Clear saved time when manually switching tracks
    const savedState = localStorage.getItem("musicPlayer_state")
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        state.currentTime = 0
        state.trackIndex = prev
        state.trackUrl = tracks[prev]?.url
        state.isPlaying = wasPlaying // Preserve play state
        localStorage.setItem("musicPlayer_state", JSON.stringify(state))
      } catch {}
    }
    
    setCurrentTrack(prev)
  }

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    audio.currentTime = percent * duration
  }

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00"
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  // Default inline player for sidebar/python lab
  if (variant === "default") {
    if (!loaded) {
      return (
        <div className="border-t border-white/10 bg-black/80 backdrop-blur px-3 py-2">
          <div className="text-xs text-zinc-500">Loading music...</div>
        </div>
      )
    }

    if (tracks.length === 0) {
      return (
        <div className="border-t border-white/10 bg-black/80 backdrop-blur px-3 py-2">
          <div className="text-xs text-zinc-500">No songs available</div>
        </div>
      )
    }

    const track = tracks[currentTrack]

    return (
      <div className="border-t border-white/10 bg-black/80 backdrop-blur px-3 py-2">
        <audio ref={audioRef} src={track.url} preload="metadata" />
        
        {/* Track info */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/50">
            <Music className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white truncate">{track.title}</div>
            <div className="text-[10px] text-zinc-500 truncate">{track.artist}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div 
          className="h-1 bg-white/10 rounded-full mb-2 cursor-pointer group"
          onClick={seekTo}
        >
          <div 
            className="h-full bg-white/60 rounded-full transition-all group-hover:bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-zinc-500 font-mono">
            {formatTime(currentTime)}
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={prevTrack}
              className="p-1.5 text-zinc-400 hover:text-white transition"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={togglePlay}
              className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>
            <button 
              onClick={nextTrack}
              className="p-1.5 text-zinc-400 hover:text-white transition"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <button 
            onClick={toggleMute}
            className="p-1 text-zinc-400 hover:text-white transition"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    )
  }

  // Column variant for homepage - header with controls and song list below
  if (variant === "column") {
    const filteredTracks = tracks.filter(track => 
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleTrackClick = (index: number) => {
      const originalIndex = tracks.findIndex(t => t.url === filteredTracks[index].url)
      if (originalIndex >= 0) {
        const wasPlaying = audioRef.current && !audioRef.current.paused
        if (wasPlaying) {
          shouldAutoPlayRef.current = true
          setIsPlaying(true)
        }
        setCurrentTrack(originalIndex)
      }
    }

    if (!loaded) {
      return (
        <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-6" style={{ boxShadow: '0 0 80px rgba(255,255,255,0.03)' }}>
          <div className="text-sm text-zinc-500">Loading music...</div>
        </div>
      )
    }

    if (tracks.length === 0) {
      return (
        <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-6" style={{ boxShadow: '0 0 80px rgba(255,255,255,0.03)' }}>
          <div className="text-sm text-zinc-500">No songs available</div>
        </div>
      )
    }

    const track = tracks[currentTrack]

    return (
      <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col h-full" style={{ boxShadow: '0 0 80px rgba(255,255,255,0.03)' }}>
        <audio ref={audioRef} src={track.url} preload="metadata" />
        
        {/* Header with controls */}
        <div className="mb-6">
          {/* Track info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-white/50 shrink-0">
              <Music className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate font-medium">{track.title}</div>
              <div className="text-xs text-zinc-500 truncate">{track.artist}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div 
            className="h-1.5 bg-white/10 rounded-full mb-2 cursor-pointer group"
            onClick={seekTo}
          >
            <div 
              className="h-full bg-white/60 rounded-full transition-all group-hover:bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time display */}
          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-4">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <button 
              onClick={toggleMute}
              className="p-2 text-zinc-400 hover:text-white transition"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            
            <button 
              onClick={prevTrack}
              className="p-2 text-zinc-400 hover:text-white transition"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <button 
              onClick={togglePlay}
              className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            
            <button 
              onClick={nextTrack}
              className="p-2 text-zinc-400 hover:text-white transition"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Song list with search */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            />
          </div>

          {/* Song list - limited to 6 visible items with scroll */}
          <div 
            className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar"
            style={{
              maxHeight: 'calc(6 * (2.5rem + 0.25rem))' // 6 items * (py-2 + gap)
            }}
          >
            {filteredTracks.length === 0 ? (
              <div className="text-sm text-zinc-500 text-center py-8">No songs found</div>
            ) : (
              filteredTracks.map((t, index) => {
                const originalIndex = tracks.findIndex(tr => tr.url === t.url)
                const isActive = originalIndex === currentTrack
                return (
                  <button
                    key={t.url}
                    onClick={() => handleTrackClick(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      isActive 
                        ? "bg-white/10 border border-white/20" 
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className="text-xs text-white truncate">{t.title}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{t.artist}</div>
                  </button>
                )
              })
            )}
          </div>
          <style jsx global>{`
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Floating player variant for settings/lessons pages - collapsible with rounded edges
  if (!loaded) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
        <div className="text-xs text-zinc-500">Loading music...</div>
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
        <div className="text-xs text-zinc-500">No songs available</div>
      </div>
    )
  }

  const track = tracks[currentTrack]

  // Collapsed state - just show a button to expand
  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-full p-3 shadow-2xl hover:bg-white/10 transition group"
      >
        <audio ref={audioRef} src={track.url} preload="metadata" />
        <div className="relative">
          <Music className={`w-5 h-5 ${isPlaying ? "text-white" : "text-zinc-400"}`} />
          {isPlaying && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        <ChevronLeft className="w-4 h-4 text-zinc-500 absolute top-1/2 -translate-y-1/2 -left-2 opacity-0 group-hover:opacity-100 transition" />
      </button>
    )
  }

  // Expanded state
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-72 overflow-hidden transition-all">
      <audio ref={audioRef} src={track.url} preload="metadata" />
      
      {/* Header with collapse button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Music className="w-3.5 h-3.5" />
          <span>Now Playing</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition"
          title="Minimize player"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3">
        {/* Track info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/50 shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate font-medium">{track.title}</div>
            <div className="text-xs text-zinc-500 truncate">{track.artist}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div 
          className="h-1.5 bg-white/10 rounded-full mb-3 cursor-pointer group"
          onClick={seekTo}
        >
          <div 
            className="h-full bg-white/60 rounded-full transition-all group-hover:bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mb-3">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={toggleMute}
            className="p-2 text-zinc-400 hover:text-white transition"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          
          <button 
            onClick={prevTrack}
            className="p-2 text-zinc-400 hover:text-white transition"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          
          <button 
            onClick={nextTrack}
            className="p-2 text-zinc-400 hover:text-white transition"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <div className="w-8" /> {/* Spacer for balance */}
        </div>
      </div>
    </div>
  )
}
