import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const githubAccount = await prisma.gitHubAccount.findUnique({
      where: { userId: session.user.id },
      select: {
        githubUsername: true,
        connectedAt: true,
        scopes: true,
        avatarUrl: true
      }
    })

    return NextResponse.json({
      connected: !!githubAccount,
      githubUsername: githubAccount?.githubUsername || null,
      connectedAt: githubAccount?.connectedAt || null,
      scopes: githubAccount?.scopes || null,
      avatarUrl: githubAccount?.avatarUrl || null
    })
  } catch (error: any) {
    console.error("Error checking GitHub connection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if already connected
    const githubAccount = await prisma.gitHubAccount.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (githubAccount) {
      return NextResponse.json({ error: "GitHub account already connected" }, { status: 400 })
    }

    // Generate OAuth URL for GitHub
    const clientId = process.env.GITHUB_CLIENT_ID
    if (!clientId) {
      return NextResponse.json({ error: "GitHub OAuth not configured" }, { status: 500 })
    }

    // Get source from request body or default to settings
    let source = 'settings'
    try {
      const body = await request.json().catch(() => ({}))
      source = body.source || 'settings'
    } catch {
      // If no body, try to get from referer header
      const referer = request.headers.get('referer') || ''
      if (referer.includes('/')) {
        source = 'homepage'
      }
    }
    
    // Create state token to prevent CSRF attacks (include source for redirect)
    const state = Buffer.from(JSON.stringify({ userId: session.user.id, timestamp: Date.now(), source })).toString('base64')
    
    // Use full URL for redirect_uri - GitHub requires exact match
    // IMPORTANT: This redirect_uri MUST match exactly what's configured in your GitHub OAuth app settings
    // Priority: NEXTAUTH_URL > VERCEL_URL > localhost
    let baseUrl = process.env.NEXTAUTH_URL
    if (!baseUrl || baseUrl.trim() === '') {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else {
        baseUrl = 'http://localhost:3000'
      }
    }
    // Ensure baseUrl doesn't end with a slash
    baseUrl = baseUrl.replace(/\/$/, '')
    const redirectUri = `${baseUrl}/api/github/callback`
    
    console.log(`[GitHub OAuth] Redirect URI: ${redirectUri}`)
    const scope = "read:user user:email repo"
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`

    return NextResponse.json({ url: githubAuthUrl })
  } catch (error: any) {
    console.error("Error initiating GitHub connection:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete GitHubAccount record
    await prisma.gitHubAccount.deleteMany({
      where: { userId: session.user.id }
    })

    // Also clear User model fields for backward compatibility
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubId: null,
        githubUsername: null,
        githubAccessToken: null,
        githubConnectedAt: null
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error disconnecting GitHub:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
