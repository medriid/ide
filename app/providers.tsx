"use client"
import { SessionProvider } from "next-auth/react"
import { SocketProvider } from "@/lib/socket-context"
import { NotificationProvider } from "@/components/NotificationProvider"
import AchievementChecker from "@/components/AchievementChecker"
import { ThemeProvider } from "@/lib/theme-context"
import { ThemeWrapper } from "@/components/ThemeWrapper"

export default function Providers({ children }: { children: React.ReactNode }){
  return (
    <SessionProvider>
      <SocketProvider>
        <NotificationProvider>
          <ThemeProvider>
            <ThemeWrapper>
              <AchievementChecker />
              {children}
            </ThemeWrapper>
          </ThemeProvider>
        </NotificationProvider>
      </SocketProvider>
    </SessionProvider>
  )
}
