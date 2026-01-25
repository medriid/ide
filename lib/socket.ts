"use client"

import { useSocketContext } from "./socket-context"

// Re-export for backward compatibility
export function useSocket() {
  const { socket, isConnected, isAuthenticated } = useSocketContext()
  return { socket, isConnected: isConnected && isAuthenticated }
}

export function getSocket() {
  // This won't work with the new context-based approach
  // Components should use useSocket() hook instead
  return null
}

