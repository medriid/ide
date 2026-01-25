/**
 * GitHub Token Encryption Utility
 * 
 * Encrypts and decrypts GitHub access tokens before storing in database.
 * Uses AES-256-GCM encryption with a key derived from environment variable.
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 16 bytes for AES
const SALT_LENGTH = 64 // 64 bytes for salt
const TAG_LENGTH = 16 // 16 bytes for GCM auth tag
const KEY_LENGTH = 32 // 32 bytes for AES-256
const ITERATIONS = 100000 // PBKDF2 iterations

/**
 * Get encryption key from environment variable
 * Falls back to a default key in development (NOT SECURE for production)
 */
function getEncryptionKey(): string {
  const key = process.env.GITHUB_TOKEN_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY
  
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY must be set in production')
    }
    console.warn('Warning: Using default encryption key. Set GITHUB_TOKEN_ENCRYPTION_KEY in production!')
    return 'default-dev-key-change-in-production-' + Math.random().toString(36)
  }
  
  return key
}

/**
 * Derive a key from the master key using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, 'sha512')
}

/**
 * Encrypt a GitHub access token
 */
export function encryptToken(token: string): string {
  if (!token) {
    throw new Error('Token cannot be empty')
  }

  const masterKey = getEncryptionKey()
  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(masterKey, salt)
  const iv = crypto.randomBytes(IV_LENGTH)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // Combine salt + iv + authTag + encrypted data
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, 'hex')
  ])
  
  return combined.toString('base64')
}

/**
 * Decrypt a GitHub access token
 */
export function decryptToken(encryptedToken: string): string {
  if (!encryptedToken) {
    throw new Error('Encrypted token cannot be empty')
  }

  try {
    const combined = Buffer.from(encryptedToken, 'base64')
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH)
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
    
    const masterKey = getEncryptionKey()
    const key = deriveKey(masterKey, salt)
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Token decryption failed:', error)
    throw new Error('Failed to decrypt token. Token may be corrupted or encrypted with a different key.')
  }
}

/**
 * Check if a string looks like an encrypted token (base64 format)
 */
export function isEncrypted(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64')
    // Encrypted tokens should be at least salt + iv + tag + some data
    return decoded.length >= (SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1)
  } catch {
    return false
  }
}
