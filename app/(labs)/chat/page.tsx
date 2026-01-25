"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef, useCallback } from "react"
import type { ComponentType } from "react"
import { 
  MessageSquare, 
  Search, 
  Send, 
  UserPlus, 
  Check, 
  X, 
  Settings,
  ChevronLeft,
  Loader2,
  Users,
  Plus,
  Heart,
  Flame,
  Frown,
  Skull
} from "lucide-react"
import Link from "next/link"
import MusicPlayer from "@/components/MusicPlayer"
import UserProfileModal from "@/components/UserProfileModal"
import { useSocket } from "@/lib/socket"

type User = {
  id: string
  username: string
  avatarUrl: string | null
}

type Friend = {
  id: string
  status: string
  isInitiator: boolean
  user: User
  createdAt: string
}

type Message = {
  id: string
  senderId: string
  content: string
  createdAt: string
  sender: User
  receiver?: User
  reactions?: { emoji: string; userId: string }[]
}

type Conversation = {
  user: User
  lastMessage: Message
  unreadCount: number
}

type GroupChat = {
  id: string
  name: string
  creatorId: string
  avatarUrl: string | null
  memberUsers: User[]
  lastMessage: Message | null
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"chats" | "friends">("chats")
  const [friends, setFriends] = useState<Friend[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [reactionMenuId, setReactionMenuId] = useState<string | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // WebSocket connection
  const { socket, isConnected } = useSocket()
  
  // Group chat state
  const [groupChats, setGroupChats] = useState<GroupChat[]>([])
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [creatingGroup, setCreatingGroup] = useState(false)
  
  // Profile modal state
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  const reactionEmojis = ["heart", "flame", "frown", "skull"]
  const reactionIconMap: Record<string, ComponentType<{ className?: string }>> = {
    heart: Heart,
    flame: Flame,
    frown: Frown,
    skull: Skull
  }

  const renderReactionIcon = (emoji: string, className?: string) => {
    const Icon = reactionIconMap[emoji]
    return Icon ? <Icon className={className} /> : <span>{emoji}</span>
  }

  // Define functions before useEffect hooks that use them
  const loadFriends = useCallback(async () => {
    try {
      const res = await fetch("/api/friends", { credentials: "include" })
      const data = await res.json()
      if (Array.isArray(data)) setFriends(data)
    } catch (e) {
      console.error("Failed to load friends", e)
    }
  }, [])

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages", { credentials: "include" })
      const data = await res.json()
      if (Array.isArray(data)) setConversations(data)
    } catch (e) {
      console.error("Failed to load conversations", e)
    }
  }, [])

  const loadMessages = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/messages?with=${userId}`, { credentials: "include" })
      const data = await res.json()
      if (Array.isArray(data)) setMessages(data)
    } catch (e) {
      console.error("Failed to load messages", e)
    }
  }, [])

  const loadGroupChats = useCallback(async () => {
    try {
      const res = await fetch("/api/groups", { credentials: "include" })
      const data = await res.json()
      if (Array.isArray(data)) setGroupChats(data)
    } catch (e) {
      console.error("Failed to load group chats", e)
    }
  }, [])

  const loadGroupMessages = useCallback(async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/messages?groupId=${groupId}`, { credentials: "include" })
      const data = await res.json()
      if (Array.isArray(data)) setMessages(data)
    } catch (e) {
      console.error("Failed to load group messages", e)
    }
  }, [])

  const appendMessage = useCallback((message: Message) => {
    setMessages(prev => {
      if (prev.some(existing => existing.id === message.id)) {
        return prev
      }
      return [...prev, message].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    })
  }, [])

  const upsertConversation = useCallback((user: User, message: Message, unreadDelta: number) => {
    setConversations(prev => {
      const existing = prev.find(conv => conv.user.id === user.id)
      const nextUnread = Math.max(0, (existing?.unreadCount || 0) + unreadDelta)
      const nextConversation = {
        user,
        lastMessage: message,
        unreadCount: nextUnread
      }

      if (!existing) {
        return [nextConversation, ...prev]
      }

      const updated = prev.map(conv =>
        conv.user.id === user.id
          ? { ...conv, lastMessage: message, unreadCount: nextUnread }
          : conv
      )

      return updated.sort(
        (a, b) =>
          new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
      )
    })
  }, [])

  const updateGroupPreview = useCallback((groupId: string, message: Message) => {
    setGroupChats(prev => {
      const updated = prev.map(group =>
        group.id === groupId ? { ...group, lastMessage: message } : group
      )
      return updated.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0
        const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0
        return bTime - aTime
      })
    })
  }, [])

  const markConversationRead = useCallback(async (userId: string) => {
    try {
      await fetch("/api/messages/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ withUserId: userId })
      })
    } catch (e) {
      console.error("Failed to mark messages as read", e)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      loadFriends()
      loadConversations()
      loadGroupChats()
      setLoading(false)
      
      // Load current user's profile to get updated avatar
      const loadCurrentUserProfile = async () => {
        try {
          const res = await fetch("/api/users/profile", { credentials: "include" })
          if (res.ok) {
            const data = await res.json()
            setCurrentUserProfile({ avatarUrl: data.avatarUrl })
          }
        } catch (e) {
          console.error("Failed to load current user profile", e)
        }
      }
      loadCurrentUserProfile()
      
      // Track IP address
      fetch("/api/users/track-ip", { 
        method: "POST", 
        credentials: "include" 
      }).catch(() => {
        // Ignore errors - IP tracking is not critical
      })
    }
  }, [status, loadFriends, loadConversations, loadGroupChats])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Refresh messages when user tabs back in
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && status === "authenticated") {
        console.log("Page became visible, refreshing messages")
        // Refresh conversations and group chats
        loadConversations()
        loadGroupChats()
        
        // Refresh current user profile to get updated avatar
        const loadCurrentUserProfile = async () => {
          try {
            const res = await fetch("/api/users/profile", { credentials: "include" })
            if (res.ok) {
              const data = await res.json()
              setCurrentUserProfile({ avatarUrl: data.avatarUrl })
            }
          } catch (e) {
            console.error("Failed to load current user profile", e)
          }
        }
        loadCurrentUserProfile()
        
        // Refresh current conversation if viewing one
        if (selectedUser) {
          loadMessages(selectedUser.id)
        } else if (selectedGroup) {
          loadGroupMessages(selectedGroup.id)
        }
      }
    }

    const handleFocus = () => {
      if (status === "authenticated") {
        console.log("Window gained focus, refreshing messages")
        loadConversations()
        loadGroupChats()
        
        // Refresh current user profile
        const loadCurrentUserProfile = async () => {
          try {
            const res = await fetch("/api/users/profile", { credentials: "include" })
            if (res.ok) {
              const data = await res.json()
              setCurrentUserProfile({ avatarUrl: data.avatarUrl })
            }
          } catch (e) {
            console.error("Failed to load current user profile", e)
          }
        }
        loadCurrentUserProfile()
        
        if (selectedUser) {
          loadMessages(selectedUser.id)
        } else if (selectedGroup) {
          loadGroupMessages(selectedGroup.id)
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [status, selectedUser, selectedGroup, loadMessages, loadConversations, loadGroupMessages, loadGroupChats])

  // WebSocket: Listen for new messages
  useEffect(() => {
    if (!socket || !isConnected) {
      return
    }

    const handleMessageReceived = async (data: { senderId: string; message: Message; groupId?: string }) => {
      const currentUserId = (session?.user as { id?: string })?.id

      if (data.groupId) {
        updateGroupPreview(data.groupId, data.message)
        if (selectedGroup?.id === data.groupId) {
          appendMessage(data.message)
        }
        return
      }

      if (!currentUserId) return

      const incomingMessage = data.message
      const otherUser = incomingMessage.senderId === currentUserId
        ? incomingMessage.receiver
        : incomingMessage.sender

      if (!otherUser) {
        loadConversations()
        return
      }

      if (selectedUser?.id === otherUser.id) {
        appendMessage(incomingMessage)
        if (incomingMessage.senderId !== currentUserId) {
          markConversationRead(otherUser.id)
        }
        upsertConversation(otherUser, incomingMessage, 0)
      } else {
        upsertConversation(otherUser, incomingMessage, incomingMessage.senderId === currentUserId ? 0 : 1)
      }
    }

    const handleNewMessage = async (data: { senderId: string; receiverId: string; message: Message }) => {
      const currentUserId = (session?.user as { id?: string })?.id
      if (!currentUserId) return

      const message = data.message
      const otherUser = message.senderId === currentUserId ? message.receiver : message.sender

      if (otherUser) {
        if (selectedUser?.id === otherUser.id) {
          appendMessage(message)
          if (message.senderId !== currentUserId) {
            markConversationRead(otherUser.id)
          }
          upsertConversation(otherUser, message, 0)
        } else {
          upsertConversation(otherUser, message, message.senderId === currentUserId ? 0 : 1)
        }
      } else {
        loadConversations()
      }
    }

    const handleNewGroupMessage = async (data: { groupId: string; senderId: string; message: Message }) => {
      updateGroupPreview(data.groupId, data.message)
      if (selectedGroup?.id === data.groupId) {
        appendMessage(data.message)
      }
    }

    const handleMessageSent = async (data: { receiverId: string; message: Message }) => {
      const currentUserId = (session?.user as { id?: string })?.id
      const otherUser = data.message.receiver || selectedUser
      if (selectedUser && data.receiverId === selectedUser.id) {
        appendMessage(data.message)
      }
      if (otherUser && currentUserId) {
        upsertConversation(otherUser, data.message, 0)
      }
    }

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (selectedUser && data.userId === selectedUser.id) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (data.isTyping) {
            newSet.add(data.userId)
          } else {
            newSet.delete(data.userId)
          }
          return newSet
        })
      }
    }

    socket.on("message-received", handleMessageReceived)
    socket.on("new-message", handleNewMessage)
    socket.on("new-group-message", handleNewGroupMessage)
    socket.on("message-sent", handleMessageSent)
    socket.on("user-typing", handleUserTyping)

    return () => {
      socket.off("message-received", handleMessageReceived)
      socket.off("new-message", handleNewMessage)
      socket.off("new-group-message", handleNewGroupMessage)
      socket.off("message-sent", handleMessageSent)
      socket.off("user-typing", handleUserTyping)
    }
  }, [
    socket,
    isConnected,
    selectedUser,
    selectedGroup,
    session,
    appendMessage,
    upsertConversation,
    updateGroupPreview,
    markConversationRead,
    loadConversations
  ])

  // Join conversation room when user/group is selected
  useEffect(() => {
    if (!socket || !isConnected) return

    if (selectedUser) {
      const currentUserId = (session?.user as { id?: string })?.id
      const conversationId = currentUserId && selectedUser.id 
        ? [currentUserId, selectedUser.id].sort().join("-")
        : null
      
      if (conversationId) {
        socket.emit("join-conversation", { conversationId })
        loadMessages(selectedUser.id)
      }
    } else if (selectedGroup) {
      socket.emit("join-conversation", { conversationId: selectedGroup.id })
      loadGroupMessages(selectedGroup.id)
    }

    return () => {
      if (selectedUser) {
        const currentUserId = (session?.user as { id?: string })?.id
        const conversationId = currentUserId && selectedUser.id 
          ? [currentUserId, selectedUser.id].sort().join("-")
          : null
        if (conversationId) {
          socket?.emit("leave-conversation", { conversationId })
        }
      } else if (selectedGroup) {
        socket?.emit("leave-conversation", { conversationId: selectedGroup.id })
      }
    }
  }, [socket, isConnected, selectedUser, selectedGroup, session, loadMessages, loadGroupMessages])

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, { credentials: "include" })
      const data = await res.json()
      if (Array.isArray(data)) setSearchResults(data)
    } catch (e) {
      console.error("Failed to search users", e)
    }
  }

  const sendFriendRequest = async (username: string) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username })
      })
      if (res.ok) {
        loadFriends()
        setSearchQuery("")
        setSearchResults([])
      }
    } catch (e) {
      console.error("Failed to send request", e)
    }
  }

  const acceptRequest = async (friendshipId: string) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "accept", friendshipId })
      })
      if (res.ok) loadFriends()
    } catch (e) {
      console.error("Failed to accept", e)
    }
  }

  const declineRequest = async (friendshipId: string) => {
    try {
      const res = await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ friendshipId })
      })
      if (res.ok) loadFriends()
    } catch (e) {
      console.error("Failed to decline", e)
    }
  }

  const sendMessage = async () => {
    if ((!selectedUser && !selectedGroup) || !newMessage.trim() || sending) return
    setSending(true)
    
    // Stop typing indicator
    if (selectedUser && socket && isConnected) {
      socket.emit("typing", { receiverId: selectedUser.id, isTyping: false })
      setIsTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
    
    try {
      if (selectedGroup) {
        const res = await fetch("/api/groups/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ groupId: selectedGroup.id, content: newMessage })
        })
        if (res.ok) {
          const message = await res.json()
          setNewMessage("")
          appendMessage(message)
          updateGroupPreview(selectedGroup.id, message)
        }
      } else if (selectedUser) {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ receiverId: selectedUser.id, content: newMessage })
        })
        if (res.ok) {
          const message = await res.json()
          setNewMessage("")
          appendMessage(message)
          upsertConversation(selectedUser, message, 0)
        }
      }
    } catch (e) {
      console.error("Failed to send", e)
    }
    setSending(false)
  }

  // Typing indicator handler
  const handleTyping = () => {
    if (!selectedUser || !socket || !isConnected) return
    
    if (!isTyping) {
      setIsTyping(true)
      socket.emit("typing", { receiverId: selectedUser.id, isTyping: true })
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set timeout to stop typing indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { receiverId: selectedUser.id, isTyping: false })
      setIsTyping(false)
    }, 3000)
  }

  const createGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0 || creatingGroup) return
    setCreatingGroup(true)
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newGroupName, memberIds: selectedMembers })
      })
      if (res.ok) {
        setShowGroupModal(false)
        setNewGroupName("")
        setSelectedMembers([])
        loadGroupChats()
      }
    } catch (e) {
      console.error("Failed to create group", e)
    }
    setCreatingGroup(false)
  }

  const selectGroup = (group: GroupChat) => {
    setSelectedUser(null)
    setSelectedGroup(group)
    setMessages([])
  }

  const selectUser = (user: User) => {
    setSelectedGroup(null)
    setSelectedUser(user)
    setMessages([])
    setConversations(prev =>
      prev.map(conv => conv.user.id === user.id ? { ...conv, unreadCount: 0 } : conv)
    )
    markConversationRead(user.id)
  }

  const acceptedFriends = friends.filter(f => f.status === "accepted")
  const pendingReceived = friends.filter(f => f.status === "pending" && !f.isInitiator)
  const pendingSent = friends.filter(f => f.status === "pending" && f.isInitiator)

  // Long press handlers for reactions
  const handleMessageTouchStart = (messageId: string) => {
    const timer = setTimeout(() => {
      setReactionMenuId(messageId)
    }, 500) // 500ms long press
    setLongPressTimer(timer)
  }

  const handleMessageTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    // For now, store reactions locally (you can extend this with an API)
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const userId = currentUser?.id || ""
        const existingReactions = msg.reactions || []
        const hasReaction = existingReactions.some(r => r.userId === userId && r.emoji === emoji)
        
        if (hasReaction) {
          // Remove reaction
          return {
            ...msg,
            reactions: existingReactions.filter(r => !(r.userId === userId && r.emoji === emoji))
          }
        } else {
          // Add reaction
          return {
            ...msg,
            reactions: [...existingReactions, { emoji, userId }]
          }
        }
      }
      return msg
    }))
    setReactionMenuId(null)
  }


  const currentUser = session?.user as { id?: string; username?: string; avatarUrl?: string | null } | undefined
  const [currentUserProfile, setCurrentUserProfile] = useState<{ avatarUrl?: string | null } | null>(null)

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-zinc-950">
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide">Chat</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Monochrome</div>
              </div>
            </div>
            <Link href="/settings" className="p-2 hover:bg-white/10 rounded-full transition">
              <Settings className="w-4 h-4 text-zinc-300" />
            </Link>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 text-xs rounded-full transition ${
                activeTab === "chats" 
                  ? "bg-white text-black font-semibold" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Chats
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 py-2 text-xs rounded-full transition ${
                activeTab === "friends" 
                  ? "bg-white text-black font-semibold" 
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Friends
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === "chats" && (
            <div className="p-4 space-y-4">
              {/* Create Group Chat Button */}
              <button
                onClick={() => setShowGroupModal(true)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition border border-dashed border-white/20"
              >
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-zinc-300" />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-semibold">New Group</span>
                  <p className="text-xs text-zinc-500">Create a room for your people</p>
                </div>
              </button>

              {/* Group Chats */}
              {groupChats.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 px-2 mb-3">
                    Groups
                  </div>
                  {groupChats.map(group => (
                    <button
                      key={group.id}
                      onClick={() => selectGroup(group)}
                      className={`w-full p-4 rounded-2xl text-left transition mb-2 border ${
                        selectedGroup?.id === group.id
                          ? "bg-white/10 border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                          : "border-transparent hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-zinc-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium truncate block">{group.name}</span>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">
                            {group.lastMessage?.content || `${group.memberUsers.length} members`}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Direct Messages */}
              {conversations.length > 0 && (
                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 px-2 mb-3">
                  Direct Messages
                </div>
              )}
              {conversations.length === 0 && groupChats.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  Start a chat to see it here
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.user.id}
                    className={`w-full p-4 rounded-2xl text-left transition mb-2 border ${
                      selectedUser?.id === conv.user.id
                        ? "bg-white/10 border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                        : "border-transparent hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setProfileUserId(conv.user.id) }}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium hover:ring-2 hover:ring-white/30 transition shrink-0"
                      >
                        {conv.user.avatarUrl ? (
                          <img src={conv.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          conv.user.username[0].toUpperCase()
                        )}
                      </button>
                      <button
                        onClick={() => selectUser(conv.user)}
                        className="flex-1 min-w-0 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{conv.user.username}</span>
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {conv.lastMessage.content}
                        </p>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "friends" && (
            <div className="p-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input
                  type="text"
                  placeholder="Add friend by username..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    searchUsers(e.target.value)
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 text-white"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="border border-white/10 rounded-2xl overflow-hidden">
                  {searchResults.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs">
                          {user.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm">{user.username}</span>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(user.username)}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Requests */}
              {pendingReceived.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 px-2 mb-3">
                    Pending Requests
                  </div>
                  {pendingReceived.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl mb-2 border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs">
                          {f.user.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm">{f.user.username}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptRequest(f.id)}
                          className="p-2 bg-white text-black rounded-full hover:bg-zinc-200 transition"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => declineRequest(f.id)}
                          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Friends List */}
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 px-2">
                Friends — {acceptedFriends.length}
              </div>
              {acceptedFriends.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  No friends yet
                </div>
              ) : (
                acceptedFriends.map(f => (
                  <div
                    key={f.id}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-white/5 transition mb-2 border border-transparent hover:border-white/10"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setProfileUserId(f.user.id) }}
                      className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs hover:ring-2 hover:ring-white/30 transition shrink-0"
                    >
                      {f.user.avatarUrl ? (
                        <img src={f.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        f.user.username[0].toUpperCase()
                      )}
                    </button>
                    <button
                      onClick={() => selectUser(f.user)}
                      className="text-sm text-left flex-1"
                    >
                      {f.user.username}
                    </button>
                  </div>
                ))
              )}

              {/* Sent Requests */}
              {pendingSent.length > 0 && (
                <div className="mt-6">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 px-2 mb-3">
                    Sent Requests
                  </div>
                  {pendingSent.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl mb-2 opacity-60 border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs">
                          {f.user.username[0].toUpperCase()}
                        </div>
                        <span className="text-sm">{f.user.username}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">Pending</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Music Player */}
        <MusicPlayer />

        {/* User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm overflow-hidden">
              {currentUserProfile?.avatarUrl ? (
                <img src={currentUserProfile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                currentUser?.username?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{currentUser?.username}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-950">
        {(selectedUser || selectedGroup) ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-zinc-950">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedUser(null); setSelectedGroup(null); }}
                  className="md:hidden p-2 hover:bg-white/10 rounded-full transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {selectedGroup ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-zinc-200" />
                    </div>
                    <div>
                      <span className="font-semibold">{selectedGroup.name}</span>
                      <p className="text-xs text-zinc-500 uppercase tracking-[0.25em]">{selectedGroup.memberUsers.length} members</p>
                    </div>
                  </>
                ) : selectedUser && (
                  <>
                    <button
                      onClick={() => setProfileUserId(selectedUser.id)}
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm hover:ring-2 hover:ring-white/30 transition"
                    >
                      {selectedUser.avatarUrl ? (
                        <img src={selectedUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        selectedUser.username[0].toUpperCase()
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setProfileUserId(selectedUser.id)}
                        className="font-semibold hover:underline"
                      >
                        {selectedUser.username}
                      </button>
                      {isConnected ? (
                        <span className="w-2 h-2 bg-white rounded-full" title="Connected" />
                      ) : (
                        <span className="w-2 h-2 bg-white/30 rounded-full animate-pulse" title="Disconnected" />
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-6 space-y-5 bg-zinc-950" onClick={() => setReactionMenuId(null)}>
              {messages.map(msg => {
                const currentUserId = (session?.user as { id?: string })?.id
                const isMe = msg.senderId === currentUserId
                const reactions = msg.reactions || []
                const groupedReactions = reactions.reduce((acc, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1
                  return acc
                }, {} as Record<string, number>)

                // Get sender info from the message (always use msg.sender for accurate avatars)
                const senderName = msg.sender?.username || "Unknown"
                const senderAvatar = msg.sender?.avatarUrl || null

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 w-full ${
                      isMe ? "justify-end flex-row-reverse" : "justify-start flex-row"
                    }`}
                  >
                    {/* Avatar - Show on opposite side based on message sender */}
                    <button
                      onClick={() => setProfileUserId(msg.senderId)}
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0 hover:ring-2 hover:ring-white/30 transition overflow-hidden"
                    >
                      {msg.sender?.avatarUrl ? (
                        <img src={msg.sender.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (msg.sender?.username?.[0] || "?").toUpperCase()
                      )}
                    </button>

                    <div 
                      className={`max-w-[70%] relative ${isMe ? "items-end" : "items-start"} flex flex-col`}
                      onMouseDown={() => handleMessageTouchStart(msg.id)}
                      onMouseUp={handleMessageTouchEnd}
                      onMouseLeave={handleMessageTouchEnd}
                      onTouchStart={() => handleMessageTouchStart(msg.id)}
                      onTouchEnd={handleMessageTouchEnd}
                    >
                      {/* Sender name - only show for other person's messages */}
                      {!isMe && (
                        <div className="text-xs text-zinc-500 mb-1 px-1">{senderName}</div>
                      )}

                      {/* Reaction Menu */}
                      {reactionMenuId === msg.id && (
                        <div 
                          className={`absolute bottom-full mb-2 flex gap-1 bg-zinc-900 border border-white/10 rounded-full px-2 py-1.5 shadow-xl z-10 ${
                            isMe ? "right-0" : "left-0"
                          }`}
                          onClick={e => e.stopPropagation()}
                        >
                          {reactionEmojis.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className="text-lg hover:scale-125 transition-transform px-1"
                            >
                              {renderReactionIcon(emoji, "w-5 h-5")}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm select-none ${
                          isMe
                            ? "bg-white text-black rounded-br-sm"
                            : "bg-zinc-900 text-white border border-white/5 rounded-bl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Reactions Display */}
                      {Object.keys(groupedReactions).length > 0 && (
                        <div className={`flex gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                          {Object.entries(groupedReactions).map(([emoji, count]) => (
                            <span 
                              key={emoji} 
                              className="text-xs bg-white/10 rounded-full px-1.5 py-0.5 border border-white/5 inline-flex items-center gap-1"
                            >
                              {renderReactionIcon(emoji, "w-3 h-3")}
                              {count > 1 && <span>{count}</span>}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className={`text-[10px] text-zinc-500 mt-1 px-1 ${isMe ? "text-right" : "text-left"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Typing Indicator */}
              {selectedUser && typingUsers.has(selectedUser.id) && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs shrink-0">
                    {selectedUser.avatarUrl ? (
                      <img src={selectedUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      selectedUser.username[0].toUpperCase()
                    )}
                  </div>
                  <div className="bg-zinc-900 rounded-2xl rounded-bl-sm px-4 py-2.5 border border-white/5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-white/10 bg-zinc-950">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder={selectedGroup ? `Message ${selectedGroup.name}` : `Message @${selectedUser?.username}`}
                  value={newMessage}
                  onChange={e => {
                    setNewMessage(e.target.value)
                    handleTyping()
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-white/20 text-white"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-3 bg-white text-black rounded-full font-semibold text-sm hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-zinc-950">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-zinc-600" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-200 mb-2">Start a conversation</h2>
              <p className="text-sm text-zinc-500">Pick a friend or group from the left to dive back in.</p>
            </div>
          </div>
        )}
      </div>

      {/* Group Chat Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Create Group Chat</h3>
                <p className="text-xs text-zinc-500 uppercase tracking-[0.2em]">Invite people</p>
              </div>
              <button
                onClick={() => { setShowGroupModal(false); setNewGroupName(""); setSelectedMembers([]); }}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-[0.2em]">Group Name</label>
                <input
                  type="text"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-white/20"
                />
              </div>
              
              <div>
                <label className="block text-xs text-zinc-500 mb-2 uppercase tracking-[0.2em]">Select Friends ({selectedMembers.length} selected)</label>
                <div className="max-h-48 overflow-auto space-y-1 bg-white/5 rounded-2xl p-2 border border-white/10">
                  {acceptedFriends.length === 0 ? (
                    <div className="text-center py-4 text-zinc-500 text-xs">
                      No friends to add
                    </div>
                  ) : (
                    acceptedFriends.map(f => {
                      const isSelected = selectedMembers.includes(f.user.id)
                      return (
                        <button
                          key={f.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMembers(prev => prev.filter(id => id !== f.user.id))
                            } else {
                              setSelectedMembers(prev => [...prev, f.user.id])
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                            isSelected ? "bg-white/10" : "hover:bg-white/5"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isSelected ? "bg-white border-white" : "border-white/20"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-black" />}
                          </div>
                          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs">
                            {f.user.avatarUrl ? (
                              <img src={f.user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              f.user.username[0].toUpperCase()
                            )}
                          </div>
                          <span className="text-sm">{f.user.username}</span>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={() => { setShowGroupModal(false); setNewGroupName(""); setSelectedMembers([]); }}
                className="flex-1 py-2.5 text-sm text-zinc-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                disabled={!newGroupName.trim() || selectedMembers.length === 0 || creatingGroup}
                className="flex-1 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingGroup ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    Create Group
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {profileUserId && (
        <UserProfileModal
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      )}
    </div>
  )
}
