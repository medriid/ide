"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

type Theme = {
  theme: string
  accentColor: string | null
  customBackgroundColor: string | null
  customGlitchColors: string[]
  customCardColor: string | null
  customLayoutColor: string | null
  profileCardGradient: string[] | null
  profileBannerImage: string | null
  profileBannerType: string | null
}

const ThemeContext = createContext<Theme>({
  theme: "default",
  accentColor: null,
  customBackgroundColor: null,
  customGlitchColors: ['#ffffff', '#888888', '#333333'],
  customCardColor: null,
  customLayoutColor: null,
  profileCardGradient: null,
  profileBannerImage: null,
  profileBannerType: null
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [theme, setTheme] = useState<Theme>({
    theme: "default",
    accentColor: null,
    customBackgroundColor: null,
    customGlitchColors: ['#ffffff', '#888888', '#333333'],
    customCardColor: null,
    customLayoutColor: null,
    profileCardGradient: null,
    profileBannerImage: null,
    profileBannerType: null
  })

  useEffect(() => {
    if (session?.user) {
      fetch("/api/users/theme")
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          return null
        })
        .then(data => {
          if (data) {
            setTheme({
              theme: data.theme || "default",
              accentColor: data.accentColor,
              customBackgroundColor: data.customBackgroundColor,
              customGlitchColors: data.customGlitchColors 
                ? (typeof data.customGlitchColors === 'string' 
                    ? JSON.parse(data.customGlitchColors)
                    : data.customGlitchColors)
                : ['#ffffff', '#888888', '#333333'],
              customCardColor: data.customCardColor,
              customLayoutColor: data.customLayoutColor,
              profileCardGradient: data.profileCardGradient
                ? (typeof data.profileCardGradient === 'string'
                    ? JSON.parse(data.profileCardGradient)
                    : data.profileCardGradient)
                : null,
              profileBannerImage: data.profileBannerImage,
              profileBannerType: data.profileBannerType
            })
          }
        })
        .catch(() => {})
    }
  }, [session])

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
