import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding daily quests...")

  const dailyQuests = [
    {
      code: "complete_lesson",
      name: "Complete a Lesson",
      description: "Complete any lesson to earn XP",
      type: "lesson",
      target: 1,
      xpReward: 50,
      isActive: true
    },
    {
      code: "complete_challenge",
      name: "Complete a Challenge",
      description: "Finish any coding challenge",
      type: "challenge",
      target: 1,
      xpReward: 75,
      isActive: true
    },
    {
      code: "run_code_5x",
      name: "Code Runner",
      description: "Run code 5 times in any lab",
      type: "code",
      target: 5,
      xpReward: 100,
      isActive: true
    },
    {
      code: "save_snippet",
      name: "Code Collector",
      description: "Save a code snippet",
      type: "code",
      target: 1,
      xpReward: 25,
      isActive: true
    },
    {
      code: "maintain_streak",
      name: "Keep the Streak",
      description: "Maintain your study streak",
      type: "streak",
      target: 1,
      xpReward: 50,
      isActive: true
    },
    {
      code: "complete_3_lessons",
      name: "Triple Threat",
      description: "Complete 3 lessons today",
      type: "lesson",
      target: 3,
      xpReward: 200,
      isActive: true
    }
  ]

  for (const quest of dailyQuests) {
    await prisma.dailyQuest.upsert({
      where: { code: quest.code },
      update: quest,
      create: quest
    })
  }

  console.log("Daily quests seeded!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
