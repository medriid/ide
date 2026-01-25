"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { io, Socket } from "socket.io-client"

type SocketContextType = {
  socket: Socket | null
  isConnected: boolean
  isAuthenticated: boolean
  connectionError: Error | null
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isAuthenticated: false,
  connectionError: null
})

export function useSocketContext() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [connectionError, setConnectionError] = useState<Error | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 10
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connectSocket = useCallback((userId: string) => {
    // Don't create multiple connections
    if (socketRef.current?.connected) {
      console.log("Socket already connected, reusing existing connection")
      setSocket(socketRef.current)
      setIsConnected(true)
      return socketRef.current
    }

    // Disconnect existing socket if any
    if (socketRef.current) {
      console.log("Disconnecting existing socket")
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
    }

    console.log("Creating new socket connection for user:", userId)
    const newSocket = io({
      path: "/api/socket",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      forceNew: false,
      autoConnect: true
    })

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id)
      setIsConnected(true)
      setConnectionError(null)
      reconnectAttemptsRef.current = 0

      // Authenticate immediately after connection
      console.log("Authenticating socket with userId:", userId)
      newSocket.emit("authenticate", { userId })
    })

    newSocket.on("authenticated", () => {
      console.log("Socket authenticated successfully")
      setIsAuthenticated(true)
      setConnectionError(null)
    })

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
      setIsConnected(false)
      setIsAuthenticated(false)

      // Only attempt reconnection if it wasn't intentional
      if (reason === "io server disconnect") {
        // Server disconnected, reconnect manually
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (status === "authenticated" && session?.user) {
              const user = session.user as { id?: string }
              if (user.id) {
                connectSocket(user.id)
              }
            }
          }, delay)
        }
      }
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
      setConnectionError(error)
      setIsConnected(false)
      setIsAuthenticated(false)
    })

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts")
      setIsConnected(true)
      reconnectAttemptsRef.current = 0
      
      // Re-authenticate after reconnection
      const user = session?.user as { id?: string } | undefined
      if (user?.id) {
        newSocket.emit("authenticate", { userId: user.id })
      }
    })

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Reconnection attempt:", attemptNumber)
    })

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error)
      setConnectionError(error)
    })

    newSocket.on("reconnect_failed", () => {
      console.error("Reconnection failed after max attempts")
      setConnectionError(new Error("Failed to reconnect"))
    })

    socketRef.current = newSocket
    setSocket(newSocket)
    return newSocket
  }, [status, session])

  useEffect(() => {
    const user = session?.user as { id?: string } | undefined
    
    if (status === "authenticated" && user?.id) {
      connectSocket(user.id)
    } else {
      // Disconnect if not authenticated
      if (socketRef.current) {
        console.log("User not authenticated, disconnecting socket")
        socketRef.current.removeAllListeners()
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
        setIsAuthenticated(false)
      }
    }

    return () => {
      // Cleanup reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      // Don't disconnect socket here - let it persist across component unmounts
    }
  }, [status, session, connectSocket])

  return (
    <SocketContext.Provider value={{ socket, isConnected, isAuthenticated, connectionError }}>
      {children}
    </SocketContext.Provider>
  )
}

