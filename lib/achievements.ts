// ============================================
// ACHIEVEMENT SYSTEM
// ============================================

export type AchievementCategory = "milestone" | "streak" | "challenge" | "social" | "mastery"
export type AchievementRarity = "common" | "rare" | "epic" | "legendary"
export type AchievementIconKey =
  | "target"
  | "star"
  | "medal"
  | "gem"
  | "crown"
  | "book"
  | "book-open"
  | "flame"
  | "trophy"
  | "gamepad"
  | "swords"
  | "award"
  | "percent"
  | "dumbbell"
  | "users"
  | "message-circle"
  | "code"
  | "database"
  | "sunrise"
  | "save"
  | "zap"
  | "scroll-text"
  | "sparkles"
  | "link"
  | "clipboard-check"

export interface AchievementDefinition {
  code: string
  name: string
  description: string
  icon: AchievementIconKey
  category: AchievementCategory
  rarity: AchievementRarity
  xpReward: number
  checkCondition: (stats: UserStats) => boolean
}

export interface UserStats {
  level: number
  totalXp: number
  completedLessons: number
  completedChallenges: number
  currentStreak: number
  longestStreak: number
  friendsCount: number
  messagesSent: number
  daysSinceJoin: number
  perfectChallengeScores: number
  challengesByDifficulty: {
    easy: number
    medium: number
    hard: number
  }
}

// Achievement definitions
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // Milestone Achievements
  {
    code: "first_steps",
    name: "First Steps",
    description: "Complete your first lesson",
    icon: "target",
    category: "milestone",
    rarity: "common",
    xpReward: 50,
    checkCondition: (stats) => stats.completedLessons >= 1
  },
  {
    code: "level_5",
    name: "Rising Star",
    description: "Reach level 5",
    icon: "star",
    category: "milestone",
    rarity: "common",
    xpReward: 100,
    checkCondition: (stats) => stats.level >= 5
  },
  {
    code: "level_10",
    name: "Silver Warrior",
    description: "Reach level 10",
    icon: "medal",
    category: "milestone",
    rarity: "rare",
    xpReward: 250,
    checkCondition: (stats) => stats.level >= 10
  },
  {
    code: "level_20",
    name: "Platinum Master",
    description: "Reach level 20",
    icon: "gem",
    category: "milestone",
    rarity: "epic",
    xpReward: 500,
    checkCondition: (stats) => stats.level >= 20
  },
  {
    code: "level_30",
    name: "Expert Coder",
    description: "Reach level 30",
    icon: "crown",
    category: "milestone",
    rarity: "legendary",
    xpReward: 1000,
    checkCondition: (stats) => stats.level >= 30
  },
  {
    code: "lesson_master",
    name: "Lesson Master",
    description: "Complete 10 lessons",
    icon: "book",
    category: "milestone",
    rarity: "rare",
    xpReward: 200,
    checkCondition: (stats) => stats.completedLessons >= 10
  },
  {
    code: "lesson_legend",
    name: "Lesson Legend",
    description: "Complete 25 lessons",
    icon: "book-open",
    category: "milestone",
    rarity: "epic",
    xpReward: 500,
    checkCondition: (stats) => stats.completedLessons >= 25
  },

  // Streak Achievements
  {
    code: "streak_3",
    name: "Three Day Streak",
    description: "Maintain a 3-day study streak",
    icon: "flame",
    category: "streak",
    rarity: "common",
    xpReward: 75,
    checkCondition: (stats) => stats.currentStreak >= 3
  },
  {
    code: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day study streak",
    icon: "flame",
    category: "streak",
    rarity: "rare",
    xpReward: 200,
    checkCondition: (stats) => stats.currentStreak >= 7
  },
  {
    code: "streak_14",
    name: "Fortnight Fighter",
    description: "Maintain a 14-day study streak",
    icon: "flame",
    category: "streak",
    rarity: "epic",
    xpReward: 400,
    checkCondition: (stats) => stats.currentStreak >= 14
  },
  {
    code: "streak_30",
    name: "Monthly Master",
    description: "Maintain a 30-day study streak",
    icon: "flame",
    category: "streak",
    rarity: "legendary",
    xpReward: 1000,
    checkCondition: (stats) => stats.currentStreak >= 30
  },
  {
    code: "streak_100",
    name: "Centurion",
    description: "Maintain a 100-day study streak",
    icon: "trophy",
    category: "streak",
    rarity: "legendary",
    xpReward: 5000,
    checkCondition: (stats) => stats.currentStreak >= 100
  },

  // Challenge Achievements
  {
    code: "first_challenge",
    name: "Challenge Accepted",
    description: "Complete your first challenge",
    icon: "gamepad",
    category: "challenge",
    rarity: "common",
    xpReward: 50,
    checkCondition: (stats) => stats.completedChallenges >= 1
  },
  {
    code: "challenge_10",
    name: "Challenge Conqueror",
    description: "Complete 10 challenges",
    icon: "swords",
    category: "challenge",
    rarity: "rare",
    xpReward: 200,
    checkCondition: (stats) => stats.completedChallenges >= 10
  },
  {
    code: "challenge_50",
    name: "Challenge Champion",
    description: "Complete 50 challenges",
    icon: "award",
    category: "challenge",
    rarity: "epic",
    xpReward: 500,
    checkCondition: (stats) => stats.completedChallenges >= 50
  },
  {
    code: "perfect_score",
    name: "Perfectionist",
    description: "Get a perfect score on a challenge",
    icon: "percent",
    category: "challenge",
    rarity: "rare",
    xpReward: 150,
    checkCondition: (stats) => stats.perfectChallengeScores >= 1
  },
  {
    code: "hard_mode",
    name: "Hard Mode Hero",
    description: "Complete 10 hard challenges",
    icon: "dumbbell",
    category: "challenge",
    rarity: "epic",
    xpReward: 400,
    checkCondition: (stats) => stats.challengesByDifficulty.hard >= 10
  },

  // Social Achievements
  {
    code: "first_friend",
    name: "Social Butterfly",
    description: "Add your first friend",
    icon: "users",
    category: "social",
    rarity: "common",
    xpReward: 50,
    checkCondition: (stats) => stats.friendsCount >= 1
  },
  {
    code: "message_master",
    name: "Message Master",
    description: "Send 50 messages",
    icon: "message-circle",
    category: "social",
    rarity: "rare",
    xpReward: 150,
    checkCondition: (stats) => stats.messagesSent >= 50
  },

  // Mastery Achievements
  {
    code: "python_master",
    name: "Python Master",
    description: "Complete 20 Python challenges",
    icon: "code",
    category: "mastery",
    rarity: "epic",
    xpReward: 500,
    checkCondition: (stats) => stats.completedChallenges >= 20 // Simplified - could track by type
  },
  {
    code: "sql_master",
    name: "SQL Master",
    description: "Complete 20 SQL challenges",
    icon: "database",
    category: "mastery",
    rarity: "epic",
    xpReward: 500,
    checkCondition: (stats) => stats.completedChallenges >= 20 // Simplified - could track by type
  },
  {
    code: "early_bird",
    name: "Early Bird",
    description: "Join within the first month",
    icon: "sunrise",
    category: "milestone",
    rarity: "rare",
    xpReward: 100,
    checkCondition: (stats) => stats.daysSinceJoin <= 30
  },
  // Code Playground Achievements
  {
    code: "code_snippet_master",
    name: "Code Collector",
    description: "Save 10 code snippets",
    icon: "save",
    category: "mastery",
    rarity: "rare",
    xpReward: 150,
    checkCondition: (stats) => (stats as any).snippetsSaved >= 10 || false
  },
  {
    code: "execution_100",
    name: "Code Runner",
    description: "Execute code 100 times",
    icon: "zap",
    category: "mastery",
    rarity: "epic",
    xpReward: 300,
    checkCondition: (stats) => (stats as any).codeExecutions >= 100 || false
  },
  {
    code: "daily_quest_master",
    name: "Quest Master",
    description: "Complete 10 daily quests",
    icon: "scroll-text",
    category: "challenge",
    rarity: "rare",
    xpReward: 200,
    checkCondition: (stats) => (stats as any).dailyQuestsCompleted >= 10 || false
  },
  {
    code: "perfect_week",
    name: "Perfect Week",
    description: "Complete all daily quests for 7 days",
    icon: "sparkles",
    category: "streak",
    rarity: "epic",
    xpReward: 500,
    checkCondition: (stats) => (stats as any).perfectDays >= 7 || false
  },
  {
    code: "code_sharer",
    name: "Code Sharer",
    description: "Share 5 public code snippets",
    icon: "link",
    category: "social",
    rarity: "common",
    xpReward: 75,
    checkCondition: (stats) => (stats as any).publicSnippets >= 5 || false
  },
  {
    code: "template_user",
    name: "Template Explorer",
    description: "Use 5 code templates",
    icon: "clipboard-check",
    category: "mastery",
    rarity: "common",
    xpReward: 50,
    checkCondition: (stats) => (stats as any).templatesUsed >= 5 || false
  },
]

// Get achievement by code
export function getAchievementByCode(code: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find(a => a.code === code)
}

// Get all achievements by category
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(a => a.category === category)
}

// Get rarity color
export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case "common": return "#94a3b8" // Silver
    case "rare": return "#3b82f6"    // Blue
    case "epic": return "#8b5cf6"   // Purple
    case "legendary": return "#f59e0b" // Gold
    default: return "#6b7280"
  }
}

// Get rarity border glow
export function getRarityGlow(rarity: AchievementRarity): string {
  switch (rarity) {
    case "common": return "shadow-[0_0_10px_rgba(148,163,184,0.3)]"
    case "rare": return "shadow-[0_0_15px_rgba(59,130,246,0.4)]"
    case "epic": return "shadow-[0_0_20px_rgba(139,92,246,0.5)]"
    case "legendary": return "shadow-[0_0_25px_rgba(245,158,11,0.6)]"
    default: return ""
  }
}
