"use client"
import { useRouter } from "next/navigation"
import { Home, ArrowLeft } from "lucide-react"
import LetterGlitch from "@/components/LetterGlitch"

export default function NotFound() {
  const router = useRouter()

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

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-2xl">
          <div 
            className="relative bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-12 animate-fade-in"
            style={{ boxShadow: '0 0 80px rgba(255,255,255,0.03)' }}
          >
            <div className="flex flex-col items-center text-center gap-8">
              {/* 404 Glitch Text with 3D Effect */}
              <div 
                className="relative text-8xl md:text-9xl font-bold tracking-tight"
                style={{ 
                  fontFamily: "'Space Mono', monospace",
                  letterSpacing: '0.1em',
                  height: '1.2em',
                  lineHeight: '1.2em'
                }}
              >
                {/* Deep shadow layer */}
                <div 
                  className="absolute inset-0 text-white/10"
                  style={{
                    transform: 'translate(4px, 4px)',
                    zIndex: 0
                  }}
                >
                  404
                </div>
                {/* Mid shadow layer */}
                <div 
                  className="absolute inset-0 text-white/25"
                  style={{
                    transform: 'translate(2px, 2px)',
                    zIndex: 1
                  }}
                >
                  404
                </div>
                {/* Main text with slight forward offset for 3D depth */}
                <div 
                  className="relative text-white"
                  style={{
                    textShadow: '0 0 20px rgba(255,255,255,0.3)',
                    transform: 'translate(-2px, -2px)',
                    zIndex: 2
                  }}
                >
                  404
                </div>
              </div>

              {/* Page Not Found Text */}
              <div className="flex flex-col items-center gap-3">
                <h1 
                  className="text-3xl md:text-4xl font-semibold tracking-tight text-white"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Page Not Found
                </h1>
                <p 
                  className="text-zinc-400 text-sm md:text-base max-w-md"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  The page you're looking for seems to have vanished into the void. 
                  It might have been moved, deleted, or never existed.
                </p>
              </div>

              {/* Divider */}
              <div className="w-24 h-px bg-white/10" />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 border border-white/20 bg-white/5 rounded-lg transition-all duration-200 hover:border-white hover:bg-white hover:text-black text-sm font-medium"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
                <button
                  onClick={() => router.back()}
                  className="flex-1 w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-sm text-zinc-400 hover:text-white"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </button>
              </div>

              {/* Quick Links */}
              <div className="pt-4 border-t border-white/10 w-full">
                <p 
                  className="text-zinc-500 text-xs uppercase tracking-wider mb-4"
                  style={{ fontFamily: "'Space Mono', monospace" }}
                >
                  Quick Links
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a 
                    href="/lessons" 
                    className="px-4 py-2 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-xs text-zinc-400 hover:text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Lessons
                  </a>
                  <a 
                    href="/python" 
                    className="px-4 py-2 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-xs text-zinc-400 hover:text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Python Lab
                  </a>
                  <a 
                    href="/sql" 
                    className="px-4 py-2 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-xs text-zinc-400 hover:text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    SQL Lab
                  </a>
                  <a 
                    href="/html" 
                    className="px-4 py-2 border border-white/10 rounded-lg transition-all duration-200 hover:border-white/30 hover:bg-white/5 text-xs text-zinc-400 hover:text-white"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    HTML Lab
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
