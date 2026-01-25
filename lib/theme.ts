import { prisma } from "./prisma"

// Auto-grant MEDIOCRE role to users at level 100+
export async function checkAndGrantMediumRole(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, role: true }
    })

    if (user && user.level >= 100 && user.role !== "MEDIOCRE" && user.role !== "owner" && user.role !== "admin") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "MEDIOCRE" }
      })
      return true
    }
    return false
  } catch (error) {
    console.error("Error granting MEDIOCRE role:", error)
    return false
  }
}

// Get user theme customization
export async function getUserTheme(userId: string) {
  try {
    const customization = await prisma.userCustomization.findUnique({
      where: { userId }
    })

    if (!customization) {
      return {
        theme: "default",
        accentColor: null,
        customBackgroundColor: null,
        customGlitchColors: ['#ffffff', '#888888', '#333333'],
        customCardColor: null,
        customLayoutColor: null
      }
    }

    return {
      theme: customization.theme || "default",
      accentColor: customization.accentColor,
      customBackgroundColor: customization.customBackgroundColor,
      customGlitchColors: customization.customGlitchColors 
        ? JSON.parse(customization.customGlitchColors)
        : ['#ffffff', '#888888', '#333333'],
      customCardColor: customization.customCardColor,
      customLayoutColor: customization.customLayoutColor
    }
  } catch (error) {
    console.error("Error getting user theme:", error)
    return {
      theme: "default",
      accentColor: null,
      customBackgroundColor: null,
      customGlitchColors: ['#ffffff', '#888888', '#333333'],
      customCardColor: null,
      customLayoutColor: null
    }
  }
}
