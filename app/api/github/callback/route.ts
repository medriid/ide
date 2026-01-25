import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { encryptToken } from "@/lib/github-encryption"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Get base URL for redirects - must match what's used in connection route
    // IMPORTANT: This must match the redirect_uri configured in GitHub OAuth app settings
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

    if (error) {
      // Try to get source from state if available
      let redirectPath = '/settings'
      if (state) {
        try {
          const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
          redirectPath = stateData?.source === 'homepage' ? '/' : '/settings'
        } catch {}
      }
      return NextResponse.redirect(`${baseUrl}${redirectPath}?error=github_auth_failed`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/settings?error=invalid_request`)
    }

    // Verify state (in production, use a more secure method like Redis)
    let stateData
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    } catch {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const redirectPath = stateData?.source === 'homepage' ? '/' : '/settings'
      return NextResponse.redirect(`${baseUrl}${redirectPath}?error=invalid_state`)
    }

    // Verify session
    const session = await getServerSession(authOptions as any) as any
    if (!session?.user?.id || session.user.id !== stateData.userId) {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const redirectPath = stateData?.source === 'homepage' ? '/' : '/settings'
      return NextResponse.redirect(`${baseUrl}${redirectPath}?error=unauthorized`)
    }

    // Determine redirect path based on source
    const redirectPath = stateData?.source === 'homepage' ? '/' : '/settings'

    // Exchange code for access token
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${baseUrl}${redirectPath}?error=config_error`)
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    })

    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for token")
      return NextResponse.redirect(`${baseUrl}${redirectPath}?error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token || null
    const scope = tokenData.scope || ''

    if (!accessToken) {
      return NextResponse.redirect(`${baseUrl}${redirectPath}?error=no_token`)
    }

    // Fetch user info from GitHub
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json"
      }
    })

    if (!githubUserResponse.ok) {
      return NextResponse.redirect(`${baseUrl}${redirectPath}?error=github_api_error`)
    }

    const githubUser = await githubUserResponse.json()

    // Check if this GitHub account is already linked to another user
    const existingLink = await prisma.gitHubAccount.findUnique({
      where: { githubUserId: githubUser.id.toString() },
      select: { userId: true }
    })

    if (existingLink && existingLink.userId !== session.user.id) {
      return NextResponse.redirect(`${baseUrl}${redirectPath}?error=github_already_linked`)
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(accessToken)
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken) : null

    // Create or update GitHubAccount record
    await prisma.gitHubAccount.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        githubUserId: githubUser.id.toString(),
        githubUsername: githubUser.login,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        scopes: scope,
        avatarUrl: githubUser.avatar_url || null,
        email: githubUser.email || null,
        connectedAt: new Date(),
        lastSyncedAt: new Date()
      },
      update: {
        githubUserId: githubUser.id.toString(),
        githubUsername: githubUser.login,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        scopes: scope,
        avatarUrl: githubUser.avatar_url || null,
        email: githubUser.email || null,
        lastSyncedAt: new Date()
      }
    })

    // Also update User model for backward compatibility
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubId: githubUser.id.toString(),
        githubUsername: githubUser.login,
        githubConnectedAt: new Date()
        // Note: We don't store plain token in User model anymore
      }
    })

    return NextResponse.redirect(`${baseUrl}${redirectPath}?success=github_connected`)
  } catch (error: any) {
    console.error("Error in GitHub callback:", error)
    // Get base URL for error redirect
    let errorBaseUrl = process.env.NEXTAUTH_URL
    if (!errorBaseUrl || errorBaseUrl.trim() === '') {
      if (process.env.VERCEL_URL) {
        errorBaseUrl = `https://${process.env.VERCEL_URL}`
      } else {
        errorBaseUrl = 'http://localhost:3000'
      }
    }
    errorBaseUrl = errorBaseUrl.replace(/\/$/, '')
    return NextResponse.redirect(`${errorBaseUrl}/settings?error=internal_error`)
  }
}
