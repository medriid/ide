"use client"

import {
  Award,
  Book,
  BookOpen,
  ClipboardCheck,
  Code2,
  Crown,
  Database,
  Dumbbell,
  Flame,
  Gamepad2,
  Gem,
  Link,
  Medal,
  MessageCircle,
  Percent,
  Save,
  ScrollText,
  Sparkles,
  Star,
  Sunrise,
  Swords,
  Target,
  Trophy,
  Users,
  Zap,
  type LucideIcon
} from "lucide-react"
import type { AchievementIconKey } from "@/lib/achievements"
import type { CSSProperties } from "react"

const iconMap: Record<AchievementIconKey, LucideIcon> = {
  target: Target,
  star: Star,
  medal: Medal,
  gem: Gem,
  crown: Crown,
  book: Book,
  "book-open": BookOpen,
  flame: Flame,
  trophy: Trophy,
  gamepad: Gamepad2,
  swords: Swords,
  award: Award,
  percent: Percent,
  dumbbell: Dumbbell,
  users: Users,
  "message-circle": MessageCircle,
  code: Code2,
  database: Database,
  sunrise: Sunrise,
  save: Save,
  zap: Zap,
  "scroll-text": ScrollText,
  sparkles: Sparkles,
  link: Link,
  "clipboard-check": ClipboardCheck
}

type AchievementIconProps = {
  icon: AchievementIconKey
  className?: string
  style?: CSSProperties
}

export default function AchievementIcon({ icon, className, style }: AchievementIconProps) {
  const Icon = iconMap[icon] ?? Star
  return <Icon className={className} style={style} />
}
