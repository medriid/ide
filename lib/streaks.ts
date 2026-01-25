// ============================================
// STUDY STREAK SYSTEM
// ============================================

/**
 * StreakData - Internal type used by streak functions
 * IMPORTANT: Use this type for all streak-related functions (getStreakStatus, isStreakAtRisk, etc.)
 * Dates are Date objects, not strings
 */
export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: Date
  streakFreezeUsed: boolean
  streakFreezeCount: number
}

/**
 * StreakApiResponse - Type for API responses
 * IMPORTANT: When receiving data from API endpoints, use this type and convert to StreakData
 * using convertApiResponseToStreakData() before passing to streak functions
 * Dates are serialized as strings in JSON responses
 */
export interface StreakApiResponse {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  streakFreezeUsed: boolean
  streakFreezeCount: number
}

/**
 * Convert API response (with serialized dates) to StreakData
 * Returns null if lastActiveDate is null or invalid
 */
export function convertApiResponseToStreakData(apiData: StreakApiResponse): StreakData | null {
  // If no streak data or lastActiveDate is null, return null
  if (!apiData.lastActiveDate || apiData.currentStreak === 0) {
    return null
  }
  try {
    const date = new Date(apiData.lastActiveDate)
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn("Invalid date received from API:", apiData.lastActiveDate)
      return null
    }
    return {
      ...apiData,
      lastActiveDate: date
    }
  } catch (error) {
    console.error("Error converting API response to StreakData:", error)
    return null
  }
}

/**
 * Check if two dates are on consecutive days
 */
export function isConsecutiveDay(date1: Date, date2: Date): boolean {
  const day1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const day2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
  const diffTime = Math.abs(day2.getTime() - day1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  )
}

/**
 * Update streak based on last active date
 * Returns updated streak data
 */
export function updateStreak(streakData: StreakData | null): StreakData {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  if (!streakData) {
    // First time tracking streak
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      streakFreezeUsed: false,
      streakFreezeCount: 0
    }
  }

  const lastActive = new Date(streakData.lastActiveDate)
  const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate())
  const daysDiff = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24))

  let newStreak = streakData.currentStreak
  let newLongestStreak = streakData.longestStreak

  if (daysDiff === 0) {
    // Already active today, no change
    return streakData
  } else if (daysDiff === 1) {
    // Consecutive day - increment streak
    newStreak = streakData.currentStreak + 1
    newLongestStreak = Math.max(newLongestStreak, newStreak)
  } else {
    // Streak broken (more than 1 day gap)
    // Check if streak freeze can be used
    if (daysDiff === 2 && !streakData.streakFreezeUsed && streakData.streakFreezeCount < 3) {
      // Use streak freeze - maintain streak but mark as used
      newStreak = streakData.currentStreak
      // Don't increment longest streak when using freeze
    } else {
      // Streak broken
      newStreak = 1
    }
  }

  return {
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastActiveDate: today,
    streakFreezeUsed: daysDiff === 2 && !streakData.streakFreezeUsed ? true : streakData.streakFreezeUsed,
    streakFreezeCount: daysDiff === 2 && !streakData.streakFreezeUsed ? streakData.streakFreezeCount + 1 : streakData.streakFreezeCount
  }
}

/**
 * Get streak status message
 */
export function getStreakStatus(streakData: StreakData | null): {
  message: string
  color: string
  flameCount: number
} {
  if (!streakData || streakData.currentStreak === 0) {
    return {
      message: "Start your streak today!",
      color: "text-zinc-500",
      flameCount: 1
    }
  }

  if (streakData.currentStreak >= 30) {
    return {
      message: `Incredible! ${streakData.currentStreak} day streak!`,
      color: "text-yellow-400",
      flameCount: 4
    }
  } else if (streakData.currentStreak >= 14) {
    return {
      message: `Amazing! ${streakData.currentStreak} day streak!`,
      color: "text-orange-400",
      flameCount: 3
    }
  } else if (streakData.currentStreak >= 7) {
    return {
      message: `Great! ${streakData.currentStreak} day streak!`,
      color: "text-red-400",
      flameCount: 2
    }
  } else {
    return {
      message: `${streakData.currentStreak} day streak`,
      color: "text-red-500",
      flameCount: 1
    }
  }
}

/**
 * Check if streak is at risk (last active was yesterday)
 */
export function isStreakAtRisk(streakData: StreakData | null): boolean {
  if (!streakData) return false
  const lastActive = new Date(streakData.lastActiveDate)
  return isYesterday(lastActive) && !isToday(lastActive)
}
