import NextAuth from "next-auth"
export const runtime = "nodejs"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"
import argon2 from "argon2"
import { updateUserStreak } from "@/lib/streak-service"
import { checkAndAwardAchievements } from "@/lib/achievement-service"

// Ensure we have a secret - NextAuth requires this for JWT signing
// In production, this MUST be set as an environment variable
let authSecret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET

// #region agent log
console.log("[DEBUG-A] Secret check:", {hasSecret:!!authSecret,hasNextAuth:!!process.env.NEXTAUTH_SECRET,hasAuth:!!process.env.AUTH_SECRET,nodeEnv:process.env.NODE_ENV});
fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:9',message:'Secret check',data:{hasSecret:!!authSecret,hasNextAuth:!!process.env.NEXTAUTH_SECRET,hasAuth:!!process.env.AUTH_SECRET,nodeEnv:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

if (!authSecret) {
const errorMsg = "CRITICAL: NEXTAUTH_SECRET is not set! Authentication may fail."
  console.error(errorMsg)
  console.error("Please set NEXTAUTH_SECRET in your Heroku config vars:")
  console.error("  heroku config:set NEXTAUTH_SECRET=your-secret-here")
  
  // Use a fallback secret (but this is NOT secure and should only be temporary)
  // Generate a random secret as fallback
  authSecret = "fallback-secret-change-me-" + Math.random().toString(36).substring(2, 15)
  console.warn("Warning: Using fallback secret. This is INSECURE and should be fixed immediately!")
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:20',message:'Using fallback secret',data:{fallbackUsed:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
}

export const authOptions = {
  secret: authSecret,
  debug: process.env.NODE_ENV === "development", // Enable debug in development
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "read:user user:email repo"
        }
      }
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" }
      },
      async authorize(c) {
        // #region agent log
        console.log("[DEBUG-B] Authorize called:", {hasEmail:!!c?.email,hasPassword:!!c?.password,email:c?.email});
        fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:38',message:'Authorize called',data:{hasEmail:!!c?.email,hasPassword:!!c?.password,email:c?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        try {
          if (!c?.email || !c?.password) {
            // #region agent log
            console.log("[DEBUG-B] Missing credentials:", {hasEmail:!!c?.email,hasPassword:!!c?.password});
            fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:42',message:'Missing credentials',data:{hasEmail:!!c?.email,hasPassword:!!c?.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            console.log("Authorize: Missing email or password")
            return null
          }
          
          // #region agent log
          console.log("[DEBUG-C] Before DB query:", {email:c.email});
          fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:48',message:'Before DB query',data:{email:c.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          // Explicitly select fields to avoid issues with missing lastKnownIp column
          const user = await prisma.user.findUnique({ 
            where: { email: c.email },
            select: {
              id: true,
              email: true,
              username: true,
              passwordHash: true,
              role: true
            }
          })
          // #region agent log
          console.log("[DEBUG-C] After DB query:", {userFound:!!user,userId:user?.id,hasPasswordHash:!!user?.passwordHash});
          fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:50',message:'After DB query',data:{userFound:!!user,userId:user?.id,hasPasswordHash:!!user?.passwordHash},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          if (!user) {
            // #region agent log
            console.log("[DEBUG-D] User not found:", {email:c.email});
            fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:52',message:'User not found',data:{email:c.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            console.log("Authorize: User not found for email:", c.email)
            return null
          }
          
          // #region agent log
          console.log("[DEBUG-E] Before password verify:", {userId:user.id,hashLength:user.passwordHash?.length});
          fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:58',message:'Before password verify',data:{userId:user.id,hashLength:user.passwordHash?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          const ok = await argon2.verify(user.passwordHash, c.password)
          // #region agent log
          console.log("[DEBUG-E] After password verify:", {verified:ok,userId:user.id});
          fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:60',message:'After password verify',data:{verified:ok,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          if (!ok) {
            // #region agent log
            console.log("[DEBUG-E] Password verification failed:", {email:c.email,userId:user.id});
            fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:62',message:'Password verification failed',data:{email:c.email,userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            console.log("Authorize: Password verification failed for email:", c.email)
            return null
          }
          
          // #region agent log
          console.log("[DEBUG-F] Authorize success:", {userId:user.id,email:user.email,username:user.username,role:user.role});
          fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:68',message:'Authorize success',data:{userId:user.id,email:user.email,username:user.username,role:user.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
          // #endregion
          console.log("Authorize: Success for user:", user.id, user.email)
          
          // Update streak and check achievements on login (non-blocking)
          Promise.all([
            updateUserStreak(user.id),
            checkAndAwardAchievements(user.id)
          ]).catch(err => {
            console.error("Error updating streak/achievements on login:", err)
          })
          
          return { id: user.id, email: user.email, name: user.username, role: user.role }
        } catch (error: any) {
          // #region agent log
          console.error("[DEBUG-G] Authorize error caught:", {errorMessage:error?.message,errorName:error?.name,errorStack:error?.stack?.substring(0,200)});
          fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:71',message:'Authorize error caught',data:{errorMessage:error?.message,errorName:error?.name,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
          // #endregion
          console.error("Authorize error:", error)
          // Return null on error to prevent exposing internal errors
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      // #region agent log
      console.log("[DEBUG-F] JWT callback:", {hasUser:!!user,userId:user?.id,tokenId:token?.id,accountProvider:account?.provider});
      fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:85',message:'JWT callback',data:{hasUser:!!user,userId:user?.id,tokenId:token?.id,accountProvider:account?.provider},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      try {
        if (user) {
          token.id = user.id
          token.username = user.name
          token.role = user.role
        }
        // Store GitHub access token if present
        if (account?.provider === "github" && account?.access_token) {
          token.githubAccessToken = account.access_token
        }
        // #region agent log
        console.log("[DEBUG-F] JWT callback success:", {tokenId:token.id,tokenUsername:token.username,tokenRole:token.role});
        fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:90',message:'JWT callback success',data:{tokenId:token.id,tokenUsername:token.username,tokenRole:token.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return token
      } catch (error: any) {
        // #region agent log
        console.error("[DEBUG-F] JWT callback error:", {errorMessage:error?.message});
        fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:93',message:'JWT callback error',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        throw error
      }
    },
    async signIn({ user, account, profile }: any) {
      // Handle GitHub OAuth sign-in - link to existing session user
      if (account?.provider === "github" && account?.access_token) {
        try {
          // Fetch user info from GitHub
          const githubRes = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
              Accept: "application/vnd.github.v3+json"
            }
          })
          
          if (githubRes.ok) {
            const githubUser = await githubRes.json()
            
            // Find user by email (from GitHub profile)
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email || "" }
            })
            
            if (existingUser) {
              // Update existing user with GitHub info
              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  githubId: githubUser.id.toString(),
                  githubUsername: githubUser.login,
                  githubAccessToken: account.access_token,
                  githubConnectedAt: new Date()
                }
              })
            } else {
              // If user doesn't exist, they'll need to sign in with credentials first
              // For now, we'll allow the sign-in but won't create a user
              console.warn("GitHub OAuth user not found in database:", user.email)
            }
          }
        } catch (error) {
          console.error("Error handling GitHub OAuth:", error)
          // Don't block sign-in on error
        }
      }
      return true
    },
    async session({ session, token }: any) {
      // #region agent log
      console.log("[DEBUG-F] Session callback:", {hasSession:!!session,hasToken:!!token,tokenId:token?.id});
      fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:99',message:'Session callback',data:{hasSession:!!session,hasToken:!!token,tokenId:token?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      try {
        if (session.user) {
          session.user.id = token.id
          session.user.username = token.username
          session.user.role = token.role
          
          // If we have a GitHub access token in the token, link it to the user
          if (token.githubAccessToken && token.id) {
            try {
              const githubRes = await fetch("https://api.github.com/user", {
                headers: {
                  Authorization: `Bearer ${token.githubAccessToken}`,
                  Accept: "application/vnd.github.v3+json"
                }
              })
              
              if (githubRes.ok) {
                const githubUser = await githubRes.json()
                await prisma.user.update({
                  where: { id: token.id },
                  data: {
                    githubId: githubUser.id.toString(),
                    githubUsername: githubUser.login,
                    githubAccessToken: token.githubAccessToken,
                    githubConnectedAt: new Date()
                  }
                })
              }
            } catch (error) {
              console.error("Error linking GitHub account:", error)
              // Don't fail the session callback
            }
          }
        }
        // #region agent log
        console.log("[DEBUG-F] Session callback success:", {sessionUserId:session.user?.id,sessionUsername:session.user?.username});
        fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:104',message:'Session callback success',data:{sessionUserId:session.user?.id,sessionUsername:session.user?.username},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return session
      } catch (error: any) {
        // #region agent log
        console.error("[DEBUG-F] Session callback error:", {errorMessage:error?.message});
        fetch('http://127.0.0.1:7243/ingest/122177d6-8d33-4379-ac12-68e451e63705',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth/[...nextauth]/route.ts:108',message:'Session callback error',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        throw error
      }
    }
  }
}

const handler = NextAuth(authOptions as any)
export { handler as GET, handler as POST }
