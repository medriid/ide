import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request) {
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

  let customization = null
  try {
    customization = await prisma.userCustomization.findUnique({
      where: { userId }
    })
  } catch (dbError: any) {
    // If table doesn't exist, return default customization
    if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
      return NextResponse.json({
        userId,
        theme: "default",
        unlockedThemes: ["default"],
        unlockedBadges: [],
        customGlitchColors: ['#ffffff', '#888888', '#333333'],
        customCardColor: null,
        customLayoutColor: null,
        customBackgroundColor: null,
        profileCardGradient: null,
        profileBannerImage: null,
        profileBannerType: null
      })
    }
    throw dbError
  }

  if (!customization) {
    try {
      customization = await prisma.userCustomization.create({
        data: {
          userId,
          unlockedThemes: JSON.stringify(["default"]),
          unlockedBadges: JSON.stringify([]),
          customGlitchColors: JSON.stringify(['#ffffff', '#888888', '#333333']),
          customCardColor: null,
          customLayoutColor: null,
          customBackgroundColor: null,
          profileCardGradient: null,
          profileBannerImage: null,
          profileBannerType: null
        }
      })
    } catch (createError: any) {
      // If table doesn't exist, return default
      if (createError.code === 'P2021' || createError.message?.includes('does not exist')) {
        return NextResponse.json({
          userId,
          theme: "default",
          unlockedThemes: ["default"],
          unlockedBadges: [],
          customGlitchColors: ['#ffffff', '#888888', '#333333'],
          customCardColor: null,
          customLayoutColor: null,
          customBackgroundColor: null,
          profileCardGradient: null,
          profileBannerImage: null,
          profileBannerType: null
        })
      }
      throw createError
    }
  }

  // Parse JSON fields for response
  const response = {
    ...customization,
    customGlitchColors: customization.customGlitchColors 
      ? (typeof customization.customGlitchColors === 'string' 
          ? JSON.parse(customization.customGlitchColors)
          : customization.customGlitchColors)
      : ['#ffffff', '#888888', '#333333'],
    profileCardGradient: customization.profileCardGradient
      ? (typeof customization.profileCardGradient === 'string'
          ? JSON.parse(customization.profileCardGradient)
          : customization.profileCardGradient)
      : null
  }

  return NextResponse.json(response)
}

export async function PATCH(req: Request) {
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

  const {
    theme,
    accentColor,
    customBackgroundColor,
    customGlitchColors,
    customCardColor,
    customLayoutColor,
    profileCardGradient,
    profileBannerImage,
    profileBannerType
  } = await req.json()

  const updateData: any = {}
  if (theme !== undefined) updateData.theme = theme
  if (accentColor !== undefined) updateData.accentColor = accentColor
  if (customBackgroundColor !== undefined) updateData.customBackgroundColor = customBackgroundColor
  if (customGlitchColors !== undefined) {
    updateData.customGlitchColors = typeof customGlitchColors === 'string' 
      ? customGlitchColors 
      : JSON.stringify(customGlitchColors)
  }
  if (customCardColor !== undefined) updateData.customCardColor = customCardColor
  if (customLayoutColor !== undefined) updateData.customLayoutColor = customLayoutColor
  if (profileCardGradient !== undefined) {
    updateData.profileCardGradient = typeof profileCardGradient === 'string'
      ? profileCardGradient
      : JSON.stringify(profileCardGradient)
  }
  if (profileBannerImage !== undefined) updateData.profileBannerImage = profileBannerImage
  if (profileBannerType !== undefined) updateData.profileBannerType = profileBannerType

  try {
    const customization = await prisma.userCustomization.upsert({
      where: { userId },
      create: {
        userId,
        unlockedThemes: JSON.stringify(["default"]),
        unlockedBadges: JSON.stringify([]),
        ...updateData,
        customGlitchColors: updateData.customGlitchColors || JSON.stringify(['#ffffff', '#888888', '#333333'])
      },
      update: updateData
    })

    return NextResponse.json(customization)
  } catch (dbError: any) {
    // If table doesn't exist, return error
    if (dbError.code === 'P2021' || dbError.message?.includes('does not exist')) {
      return NextResponse.json({ error: "Customization feature not available yet" }, { status: 503 })
    }
    throw dbError
  }
}
