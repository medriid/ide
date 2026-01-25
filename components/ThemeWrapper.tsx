"use client"

import { useTheme } from "@/lib/theme-context"
import { useEffect } from "react"

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useTheme()

  useEffect(() => {
    // Apply theme colors to root CSS variables
    const root = document.documentElement
    
    if (theme.customBackgroundColor) {
      root.style.setProperty('--theme-bg', theme.customBackgroundColor)
    } else {
      root.style.setProperty('--theme-bg', '#000000')
    }
    
    if (theme.customCardColor) {
      root.style.setProperty('--theme-card', theme.customCardColor)
    } else {
      root.style.setProperty('--theme-card', 'rgba(0, 0, 0, 0.5)')
    }
    
    if (theme.customLayoutColor) {
      root.style.setProperty('--theme-layout', theme.customLayoutColor)
    } else {
      root.style.setProperty('--theme-layout', '#ffffff')
    }
  }, [theme])

  return <>{children}</>
}
