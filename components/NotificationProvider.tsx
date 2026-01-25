"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { X, MessageSquare } from "lucide-react"
import { useSocketContext } from "@/lib/socket-context"

type Notification = {
  id: string
  type: "message"
  title: string
  message: string
  avatarUrl?: string
  senderId?: string
  createdAt: Date
}

type NotificationContextType = {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const { socket, isConnected, isAuthenticated } = useSocketContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [seenMessageIds, setSeenMessageIds] = useState<Set<string>>(new Set())

  // Define removeNotification first since addNotification uses it
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "createdAt">) => {
    const id = Math.random().toString(36).substring(7)
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date()
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }, [removeNotification])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // WebSocket: Listen for real-time message notifications
  useEffect(() => {
    // Wait for socket to be connected AND authenticated
    if (!socket || !isConnected || !isAuthenticated || status !== "authenticated") {
      return
    }

    console.log("NotificationProvider: Setting up message-received listener")

    const handleMessageReceived = (data: { senderId: string; message: any }) => {
      console.log("NotificationProvider: message-received event", data)
      const message = data.message
      if (!message || !message.id) {
        console.warn("Invalid message data received", data)
        return
      }
      
      const messageId = message.id
      const currentUserId = (session?.user as { id?: string })?.id
      
      // Don't show notification for messages sent by current user
      if (data.senderId === currentUserId) {
        return
      }
      
      // Only show notification if we haven't seen this message
      if (!seenMessageIds.has(messageId)) {
        console.log("NotificationProvider: Adding notification for message", messageId)
        setSeenMessageIds(prev => new Set([...prev, messageId]))
        addNotification({
          type: "message",
          title: message.sender?.username || "New Message",
          message: message.content?.length > 50 ? message.content.substring(0, 50) + "..." : message.content || "New message",
          avatarUrl: message.sender?.avatarUrl,
          senderId: data.senderId
        })
      }
    }

    socket.on("message-received", handleMessageReceived)

    return () => {
      socket.off("message-received", handleMessageReceived)
    }
  }, [socket, isConnected, status, addNotification, seenMessageIds, session])

  // Fallback: Poll for new messages if WebSocket is not connected
  useEffect(() => {
    if (status !== "authenticated" || (socket && isConnected)) return

    const checkNewMessages = async () => {
      try {
        const res = await fetch("/api/messages/unread", { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            data.forEach((msg: { id: string; sender?: { username: string; avatarUrl?: string }; content: string; senderId: string }) => {
              // Only show notification if we haven't seen this message
              if (!seenMessageIds.has(msg.id)) {
                setSeenMessageIds(prev => new Set([...prev, msg.id]))
                addNotification({
                  type: "message",
                  title: msg.sender?.username || "New Message",
                  message: msg.content.length > 50 ? msg.content.substring(0, 50) + "..." : msg.content,
                  avatarUrl: msg.sender?.avatarUrl,
                  senderId: msg.senderId
                })
              }
            })
          }
        }
      } catch {
        // Silently fail
      }
    }

    // Check immediately
    checkNewMessages()
    
    // Then poll every 5 seconds as fallback
    const interval = setInterval(checkNewMessages, 5000)
    
    return () => clearInterval(interval)
  }, [status, socket, isConnected, addNotification, seenMessageIds])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="pointer-events-auto animate-slide-in-right"
            style={{ 
              animationDelay: `${index * 50}ms`,
              animationFillMode: "both"
            }}
          >
            <NotificationToast
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

function NotificationToast({ 
  notification, 
  onClose 
}: { 
  notification: Notification
  onClose: () => void 
}) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-4 min-w-[300px] max-w-[380px] backdrop-blur-xl">
      <div className="flex items-start gap-3">
        {/* Avatar/Icon */}
        <div className="flex-shrink-0">
          {notification.avatarUrl ? (
            <img 
              src={notification.avatarUrl} 
              alt="" 
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white/60" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-white truncate">
              {notification.title}
            </span>
            <button 
              onClick={onClose}
              className="flex-shrink-0 p-1 text-zinc-500 hover:text-white hover:bg-white/10 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <a 
            href="/chat"
            className="inline-block mt-2 text-[10px] text-white/60 hover:text-white transition"
          >
            View message →
          </a>
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 rounded-b-xl overflow-hidden">
        <div 
          className="h-full bg-white/30 animate-shrink-width"
          style={{ animationDuration: "5s" }}
        />
      </div>
    </div>
  )
}

export default NotificationProvider

