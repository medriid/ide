import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// POST - Track user's IP address
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get IP address from headers
    const forwardedFor = req.headers.get("x-forwarded-for")
    const realIp = req.headers.get("x-real-ip")
    const remoteAddr = req.headers.get("remote-addr")
    
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || 
                     realIp || 
                     remoteAddr ||
                     "unknown"

    // Update user's last known IP (only if column exists)
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { lastKnownIp: ipAddress }
      })
    } catch (updateError: any) {
      // Ignore if column doesn't exist yet (migration not run)
      if (updateError.message?.includes("Unknown column") || 
          updateError.message?.includes("does not exist")) {
        console.log("IP tracking column not available yet - migration needed")
        return NextResponse.json({ ok: true, ip: ipAddress, note: "Column not migrated yet" })
      }
      throw updateError
    }

    return NextResponse.json({ ok: true, ip: ipAddress })
  } catch (error: any) {
    console.error("IP tracking error:", error)
    return NextResponse.json({ 
      error: "Failed to track IP",
      details: error.message 
    }, { status: 500 })
  }
}

