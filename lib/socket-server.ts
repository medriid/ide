// Singleton to store Socket.io instance for use in API routes
let ioInstance: any = null

export function setIO(io: any) {
  ioInstance = io
}

export function getIO() {
  return ioInstance
}

// Also export as CommonJS for server.js compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = { setIO, getIO }
}

