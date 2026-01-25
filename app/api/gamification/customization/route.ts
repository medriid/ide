import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET - Get user customization
export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    let customization = await prisma.userCustomization.findUnique({
      where: { userId: session.user.id }
    })

    // Create default if doesn't exist
    if (!customization) {
      customization = await prisma.userCustomization.create({
        data: {
          userId: session.user.id,
          theme: "default",
          unlockedThemes: JSON.stringify(["default"]),
          unlockedBadges: JSON.stringify([])
        }
      })
    }

    return NextResponse.json({
      ...customization,
      unlockedThemes: JSON.parse(customization.unlockedThemes || "[]"),
      unlockedBadges: JSON.parse(customization.unlockedBadges || "[]")
    })
  } catch (error: any) {
    console.error("Error fetching customization:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update user customization
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { theme, accentColor, profileBanner } = await req.json()

    let customization = await prisma.userCustomization.findUnique({
      where: { userId: session.user.id }
    })

    if (!customization) {
      customization = await prisma.userCustomization.create({
        data: {
          userId: session.user.id,
          theme: theme || "default",
          accentColor: accentColor || null,
          profileBanner: profileBanner || null,
          unlockedThemes: JSON.stringify(["default"]),
          unlockedBadges: JSON.stringify([])
        }
      })
    } else {
      customization = await prisma.userCustomization.update({
        where: { userId: session.user.id },
        data: {
          ...(theme !== undefined && { theme }),
          ...(accentColor !== undefined && { accentColor }),
          ...(profileBanner !== undefined && { profileBanner })
        }
      })
    }

    return NextResponse.json({
      ...customization,
      unlockedThemes: JSON.parse(customization.unlockedThemes || "[]"),
      unlockedBadges: JSON.parse(customization.unlockedBadges || "[]")
    })
  } catch (error: any) {
    console.error("Error updating customization:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Unlock theme or badge
export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any) as any
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { type, item } = await req.json() // type: "theme" | "badge", item: string

    if (!type || !item) {
      return NextResponse.json(
        { error: "Type and item are required" },
        { status: 400 }
      )
    }

    let customization = await prisma.userCustomization.findUnique({
      where: { userId: session.user.id }
    })

    if (!customization) {
      customization = await prisma.userCustomization.create({
        data: {
          userId: session.user.id,
          theme: "default",
          unlockedThemes: JSON.stringify(["default"]),
          unlockedBadges: JSON.stringify([])
        }
      })
    }

    const unlockedThemes = JSON.parse(customization.unlockedThemes || "[]")
    const unlockedBadges = JSON.parse(customization.unlockedBadges || "[]")

    if (type === "theme") {
      if (!unlockedThemes.includes(item)) {
        unlockedThemes.push(item)
        customization = await prisma.userCustomization.update({
          where: { userId: session.user.id },
          data: {
            unlockedThemes: JSON.stringify(unlockedThemes)
          }
        })
      }
    } else if (type === "badge") {
      if (!unlockedBadges.includes(item)) {
        unlockedBadges.push(item)
        customization = await prisma.userCustomization.update({
          where: { userId: session.user.id },
          data: {
            unlockedBadges: JSON.stringify(unlockedBadges)
          }
        })
      }
    }

    return NextResponse.json({
      ...customization,
      unlockedThemes: JSON.parse(customization.unlockedThemes || "[]"),
      unlockedBadges: JSON.parse(customization.unlockedBadges || "[]")
    })
  } catch (error: any) {
    console.error("Error unlocking item:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
