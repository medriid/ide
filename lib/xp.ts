// ============================================
// XP AND LEVELING SYSTEM
// ============================================
// XP starts at 10 for level 1, increases by a nominal amount each level
// Formula: XP needed for level N = BASE_XP + (N-1) * XP_INCREMENT

export const BASE_XP = 10           // XP needed for level 2
export const XP_INCREMENT = 15      // Additional XP needed per level

// Lesson difficulty XP rewards
export const LESSON_XP_REWARDS: Record<string, number> = {
  // Python lessons - ordered by difficulty
  "python-getting-started": 10,        // Easy
  "python-variables-types": 10,        // Easy
  "python-conditionals": 15,           // Medium
  "python-loops": 15,                  // Medium
  "python-collections": 20,            // Medium-Hard
  "python-functions-modules": 20,      // Medium-Hard
  "python-file-handling-basics": 25,   // Hard
  "python-csv-files": 30,              // Hard
  "python-binary-files": 35,           // Hard
  
  // SQL lessons - ordered by difficulty
  "sql-introduction": 10,              // Easy
  "sql-filtering-data": 15,            // Medium
  "sql-modifying-data": 20,            // Medium-Hard
  "sql-sorting-limiting": 25,          // Hard
  
  // MySQL Advanced lessons
  "mysql-joins-mastery": 30,           // Advanced
  "mysql-aggregate-functions": 35,     // Advanced
  "mysql-subqueries": 40,              // Expert
  "mysql-indexes-performance": 45,     // Expert
  "mysql-transactions": 50,            // Master
  
  // HTML & Tailwind CSS lessons
  "html-basics": 10,                   // Easy
  "tailwind-css-basics": 15,           // Medium
}

// Challenge XP rewards (higher than lessons to incentivize practice)
export const CHALLENGE_XP_REWARDS: Record<string, number> = {
  easy: 25,      // Easy challenges
  medium: 40,    // Medium challenges
  hard: 60,      // Hard challenges
}

// Get XP reward for a challenge based on difficulty
export function getChallengeXpReward(difficulty: string): number {
  return CHALLENGE_XP_REWARDS[difficulty] || CHALLENGE_XP_REWARDS.easy
}

// Default XP for unknown lessons based on order
export function getDefaultXpReward(lessonOrder: number): number {
  if (lessonOrder <= 1) return 10      // Easy
  if (lessonOrder <= 2) return 15      // Medium
  if (lessonOrder <= 3) return 20      // Medium-Hard
  return 25 + (lessonOrder - 4) * 5    // Harder lessons
}

// Calculate XP needed to reach a specific level
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0
  // Total XP needed to reach this level
  // Sum of: BASE_XP + (BASE_XP + XP_INCREMENT) + (BASE_XP + 2*XP_INCREMENT) + ...
  // For level N: sum from i=0 to N-2 of (BASE_XP + i * XP_INCREMENT)
  // = (N-1) * BASE_XP + XP_INCREMENT * (N-2)(N-1)/2
  const n = level - 1
  return n * BASE_XP + Math.floor(XP_INCREMENT * (n - 1) * n / 2)
}

// Calculate XP needed to go from current level to next level
export function getXpForNextLevel(level: number): number {
  return BASE_XP + (level - 1) * XP_INCREMENT
}

// Calculate current level from total XP
export function calculateLevel(totalXp: number): number {
  let level = 1
  let xpNeeded = 0
  
  while (true) {
    const nextLevelXp = getXpForNextLevel(level)
    if (xpNeeded + nextLevelXp > totalXp) {
      break
    }
    xpNeeded += nextLevelXp
    level++
  }
  
  return level
}

// Get XP progress within current level
export function getXpProgress(totalXp: number): {
  level: number
  currentLevelXp: number   // XP earned within current level
  xpForNextLevel: number   // Total XP needed to level up
  totalXp: number          // Total XP earned
  progressPercent: number  // 0-100 progress to next level
} {
  const level = calculateLevel(totalXp)
  const xpAtCurrentLevel = getXpForLevel(level)
  const currentLevelXp = totalXp - xpAtCurrentLevel
  const xpForNextLevel = getXpForNextLevel(level)
  const progressPercent = Math.min(100, Math.floor((currentLevelXp / xpForNextLevel) * 100))
  
  return {
    level,
    currentLevelXp,
    xpForNextLevel,
    totalXp,
    progressPercent
  }
}

// Get rank title based on level
export function getRankTitle(level: number): string {
  if (level >= 50) return "Grandmaster"
  if (level >= 40) return "Master"
  if (level >= 30) return "Expert"
  if (level >= 25) return "Diamond"
  if (level >= 20) return "Platinum"
  if (level >= 15) return "Gold"
  if (level >= 10) return "Silver"
  if (level >= 5) return "Bronze"
  return "Novice"
}

// Get rank color based on level
export function getRankColor(level: number): string {
  if (level >= 50) return "#ff6b6b"   // Red - Grandmaster
  if (level >= 40) return "#f59e0b"   // Orange - Master
  if (level >= 30) return "#8b5cf6"   // Purple - Expert
  if (level >= 25) return "#3b82f6"   // Blue - Diamond
  if (level >= 20) return "#06b6d4"   // Cyan - Platinum
  if (level >= 15) return "#fbbf24"   // Gold
  if (level >= 10) return "#94a3b8"   // Silver
  if (level >= 5) return "#cd7f32"    // Bronze
  return "#6b7280"                     // Gray - Novice
}
