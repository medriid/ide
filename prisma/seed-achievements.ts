// Seed achievements into the database
import { PrismaClient } from "@prisma/client"
import { ACHIEVEMENTS } from "../lib/achievements"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding achievements...")

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      create: {
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward
      },
      update: {
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward
      }
    })
    console.log(`✓ Seeded achievement: ${achievement.name}`)
  }

  console.log(`\n✅ Seeded ${ACHIEVEMENTS.length} achievements`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
