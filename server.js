const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { Server } = require("socket.io")

// Import socket-server (works with both CommonJS and ES modules)
let socketServerModule
try {
  socketServerModule = require("./lib/socket-server")
} catch (e) {
  // Fallback: create inline module
  socketServerModule = { setIO: () => {}, getIO: () => null }
}
const { setIO } = socketServerModule

const dev = process.env.NODE_ENV !== "production"
const hostname = process.env.HOSTNAME || "0.0.0.0"
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: "/api/socket"
  })

  // Make io instance available to API routes
  setIO(io)

  // Store user sessions: userId -> Set of socketIds (multiple tabs/devices)
  const userSockets = new Map()
  // Store socket sessions: socketId -> userId
  const socketUsers = new Map()

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id)

    // Authenticate user
    socket.on("authenticate", async (data) => {
      const { userId } = data
      console.log("Authenticate event received:", { userId, socketId: socket.id })
      if (userId) {
        // Store multiple sockets per user (for multiple tabs)
        if (!userSockets.has(userId)) {
          userSockets.set(userId, new Set())
        }
        userSockets.get(userId).add(socket.id)
        
        socketUsers.set(socket.id, userId)
        socket.userId = userId
        socket.join(`user:${userId}`)
        console.log(`User ${userId} authenticated on socket ${socket.id}, joined room: user:${userId}`)
        console.log(`User ${userId} now has ${userSockets.get(userId).size} active connections`)
        
        // Confirm authentication to client
        socket.emit("authenticated", { userId })
        
        // Notify user is online
        socket.broadcast.emit("user-online", { userId })
      } else {
        console.warn("Authenticate event missing userId:", data)
      }
    })

    // Join a conversation room
    socket.on("join-conversation", (data) => {
      const { conversationId } = data
      if (conversationId) {
        socket.join(`conversation:${conversationId}`)
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
      }
    })

    // Leave a conversation room
    socket.on("leave-conversation", (data) => {
      const { conversationId } = data
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`)
        console.log(`Socket ${socket.id} left conversation ${conversationId}`)
      }
    })

    // Handle new message (from client-side emit - deprecated, API route handles this now)
    socket.on("new-message", async (data) => {
      const { receiverId, message } = data
      if (receiverId && message && socket.userId) {
        console.log(`Socket ${socket.id} received new-message event for receiver ${receiverId}`)
        // Emit to receiver's user room (for notifications)
        io.to(`user:${receiverId}`).emit("message-received", {
          senderId: socket.userId,
          message
        })
        
        // Also emit to conversation room (for chat updates)
        const conversationId = [socket.userId, receiverId].sort().join("-")
        io.to(`conversation:${conversationId}`).emit("new-message", {
          senderId: socket.userId,
          receiverId,
          message
        })
        
        // Emit to sender's user room (for syncing across tabs)
        io.to(`user:${socket.userId}`).emit("message-sent", {
          receiverId,
          message
        })
      }
    })

    // Handle typing indicator
    socket.on("typing", (data) => {
      const { receiverId, isTyping } = data
      if (receiverId && socket.userId) {
        io.to(`user:${receiverId}`).emit("user-typing", {
          userId: socket.userId,
          isTyping
        })
      }
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      const userId = socketUsers.get(socket.id)
      if (userId) {
        // Remove this socket from user's socket set
        const userSocketSet = userSockets.get(userId)
        if (userSocketSet) {
          userSocketSet.delete(socket.id)
          if (userSocketSet.size === 0) {
            userSockets.delete(userId)
            socket.broadcast.emit("user-offline", { userId })
            console.log(`User ${userId} disconnected (no more connections)`)
          } else {
            console.log(`User ${userId} disconnected (${userSocketSet.size} connections remaining)`)
          }
        }
        socketUsers.delete(socket.id)
      }
      console.log("Client disconnected:", socket.id)
    })
  })

  httpServer
    .once("error", (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})

