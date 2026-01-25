import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { createHash } from "crypto"

// VirusTotal API integration using hash lookup (faster than file upload)
async function scanFileWithVirusTotal(fileBuffer: Buffer): Promise<{ safe: boolean; error?: string }> {
  const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY
  
  if (!VIRUSTOTAL_API_KEY) {
    // If no API key, skip scanning but log warning
    console.warn("VirusTotal API key not configured, skipping malware scan. Set VIRUSTOTAL_API_KEY environment variable to enable scanning.")
    return { safe: true }
  }

  try {
    // Calculate SHA256 hash of the file
    const hash = createHash('sha256').update(fileBuffer).digest('hex')

    // Check file hash against VirusTotal database
    const reportResponse = await fetch(
      `https://www.virustotal.com/api/v3/files/${hash}`,
      {
        method: 'GET',
        headers: {
          'x-apikey': VIRUSTOTAL_API_KEY
        }
      }
    )

    if (reportResponse.status === 404) {
      // File not in database - for new files, we'll allow them
      // In production, you might want to upload and scan new files
      return { safe: true }
    }

    if (!reportResponse.ok) {
      // If check fails, allow file but log
      return { safe: true, error: "VirusTotal check failed" }
    }

    const reportData = await reportResponse.json()
    const stats = reportData?.data?.attributes?.stats

    if (stats) {
      // Check if any antivirus detected threats
      const malicious = stats.malicious || 0
      const suspicious = stats.suspicious || 0
      
      // If more than 2 engines detect it as malicious or suspicious, block it
      if (malicious > 2 || suspicious > 3) {
        return { safe: false, error: `File detected as malicious by ${malicious} engines and suspicious by ${suspicious} engines` }
      }
    }

    return { safe: true }
  } catch (error: any) {
    console.error("VirusTotal scan error:", error)
    // On error, we'll allow the file but log it
    return { safe: true, error: error.message }
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any)
  if (!(session as any)?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const userId = (session as any).user.id

  // Check if user has MEDIOCRE role or level 100+
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, level: true }
  })

  if (!user || (user.role !== "MEDIOCRE" && user.role !== "owner" && user.level < 100)) {
    return NextResponse.json({ error: "access denied" }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string // "banner" or "theme"

    if (!file) {
      return NextResponse.json({ error: "no file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/gif', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "invalid file type. Only PNG, GIF, and JPEG are allowed" }, { status: 400 })
    }

    // Validate file size (max 5MB for images)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "file too large. Maximum size is 5MB" }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Scan with VirusTotal (only for images)
    if (type === "banner") {
      const scanResult = await scanFileWithVirusTotal(buffer)
      if (!scanResult.safe) {
        return NextResponse.json({ 
          error: scanResult.error || "File failed malware scan" 
        }, { status: 400 })
      }
    }

    // Convert to base64
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Determine file type
    const fileType = file.type === 'image/gif' ? 'gif' : 'png'

    if (type === "banner") {
      // Update user customization with banner
      await prisma.userCustomization.upsert({
        where: { userId },
        create: {
          userId,
          unlockedThemes: "[]",
          unlockedBadges: "[]",
          profileBannerImage: dataUrl,
          profileBannerType: fileType
        },
        update: {
          profileBannerImage: dataUrl,
          profileBannerType: fileType
        }
      })

      return NextResponse.json({ 
        success: true, 
        image: dataUrl,
        type: fileType
      })
    } else {
      // For theme images, return the data URL for client-side handling
      return NextResponse.json({ 
        success: true, 
        image: dataUrl,
        type: fileType
      })
    }
  } catch (error: any) {
    console.error("File upload error:", error)
    return NextResponse.json({ error: error.message || "upload failed" }, { status: 500 })
  }
}
