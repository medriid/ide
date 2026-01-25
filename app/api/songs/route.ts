import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const NETLIFY_DOMAIN = "https://stellar-toffee-d13692.netlify.app/songs"
const OWNER_EMAIL = "logeshms.cbe@gmail.com"

// Lofi beats playlist (50 songs) - using royalty-free lofi tracks
// Using a mix of public domain and Creative Commons lofi tracks
const LOFI_BEATS = [
  { title: "Peaceful Morning", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Coffee Break", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Study Session", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Chill Vibes", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { title: "Relaxing Beats", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { title: "Focus Mode", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" },
  { title: "Night Study", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3" },
  { title: "Rainy Day", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { title: "Zen Garden", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3" },
  { title: "Dreamy Thoughts", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
  { title: "Quiet Library", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" },
  { title: "Sunset Study", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3" },
  { title: "Midnight Coding", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3" },
  { title: "Calm Waters", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3" },
  { title: "Soft Focus", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3" },
  { title: "Gentle Breeze", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3" },
  { title: "Study Time", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3" },
  { title: "Cozy Corner", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-18.mp3" },
  { title: "Mindful Moments", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-19.mp3" },
  { title: "Serene Space", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-20.mp3" },
  { title: "Tranquil Tunes", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-21.mp3" },
  { title: "Ambient Study", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-22.mp3" },
  { title: "Peaceful Place", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-23.mp3" },
  { title: "Calm Mind", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-24.mp3" },
  { title: "Study Flow", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-25.mp3" },
  { title: "Relaxing Rhythm", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-26.mp3" },
  { title: "Quiet Hours", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-27.mp3" },
  { title: "Soft Sounds", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-28.mp3" },
  { title: "Focus Flow", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-29.mp3" },
  { title: "Study Sanctuary", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-30.mp3" },
  { title: "Chill Study", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-31.mp3" },
  { title: "Peaceful Path", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-32.mp3" },
  { title: "Calm Study", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-33.mp3" },
  { title: "Relaxing Realm", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-34.mp3" },
  { title: "Study Serenity", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-35.mp3" },
  { title: "Tranquil Time", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-36.mp3" },
  { title: "Ambient Ambiance", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-37.mp3" },
  { title: "Peaceful Practice", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-38.mp3" },
  { title: "Calm Concentration", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-39.mp3" },
  { title: "Study State", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-40.mp3" },
  { title: "Relaxing Routine", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-41.mp3" },
  { title: "Quiet Quest", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-42.mp3" },
  { title: "Soft Study", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-43.mp3" },
  { title: "Focus Frame", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-44.mp3" },
  { title: "Study Sphere", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-45.mp3" },
  { title: "Chill Chamber", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-46.mp3" },
  { title: "Peaceful Portal", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-47.mp3" },
  { title: "Calm Canvas", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-48.mp3" },
  { title: "Relaxing Realm", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-49.mp3" },
  { title: "Study Symphony", artist: "Lofi Study", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-50.mp3" }
]

export async function GET() {
  const session = await getServerSession(authOptions as any) as any
  
  // Check if user is owner
  const isOwner = session?.user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() || 
                  session?.user?.role === "owner"

  // If not owner, return lofi beats playlist
  if (!isOwner) {
    return NextResponse.json(LOFI_BEATS)
  }

  // Owner gets songs from Netlify
  try {
    // Fetch songs from Netlify function
    const response = await fetch(`${NETLIFY_DOMAIN.replace("/songs", "")}/.netlify/functions/songs`, {
      cache: "no-store"
    })
    
    if (response.ok) {
      const tracks = await response.json()
      return NextResponse.json(tracks)
    }
  } catch {
    // Fallback to hardcoded list if Netlify function fails
  }

  // Fallback: hardcoded list of songs from Netlify
  const songs = [
    "Bando.mp3",
    "Billie Jean.mp3",
    "CANT SAY.mp3",
    "Dancing In The Dark.mp3",
    "Every Breath.mp3",
    "Foreign.mp3",
    "Gods Plan.mp3",
    "HMMM.mp3",
    "Hotline Bling.mp3",
    "Im Still Standing.mp3",
    "Jus' Know.mp3",
    "Nonstop.mp3",
    "Running Up That Hill.mp3",
    "Toes.mp3"
  ]

  const tracks = songs.map(filename => {
    const title = filename.replace(/\.mp3$/, "")
    return {
      title: title,
      artist: "Music",
      url: `${NETLIFY_DOMAIN}/${encodeURIComponent(filename)}`
    }
  })

  return NextResponse.json(tracks)
}

