import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding code templates...")

  const templates = [
    // Python templates
    {
      name: "Hello World",
      description: "Basic Python hello world program",
      language: "python",
      code: `print("Hello, World!")`,
      category: "starter",
      tags: "beginner,hello-world",
      isOfficial: true
    },
    {
      name: "List Operations",
      description: "Common list operations in Python",
      language: "python",
      code: `# Create a list
my_list = [1, 2, 3, 4, 5]

# Add an item
my_list.append(6)

# Remove an item
my_list.remove(3)

# Access items
print(my_list[0])  # First item
print(my_list[-1])  # Last item

# Iterate through list
for item in my_list:
    print(item)`,
      category: "data-structure",
      tags: "list,data-structure",
      isOfficial: true
    },
    {
      name: "File Reading",
      description: "Read and process a text file",
      language: "python",
      code: `# Read a file
with open('data/sample.txt', 'r') as f:
    content = f.read()
    print(content)

# Read line by line
with open('data/sample.txt', 'r') as f:
    for line in f:
        print(line.strip())`,
      category: "utility",
      tags: "file,io",
      isOfficial: true
    },
    {
      name: "CSV Processing",
      description: "Read and process CSV files",
      language: "python",
      code: `import csv

# Read CSV
with open('data/sample.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row)

# Write CSV
with open('data/output.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Age'])
    writer.writerow(['Alice', 25])
    writer.writerow(['Bob', 30])`,
      category: "utility",
      tags: "csv,data-processing",
      isOfficial: true
    },
    // SQL templates
    {
      name: "Basic SELECT",
      description: "Basic SQL SELECT query",
      language: "sql",
      code: `SELECT * FROM \`table_name\` LIMIT 10;`,
      category: "starter",
      tags: "select,query",
      isOfficial: true
    },
    {
      name: "Filter Data",
      description: "SELECT with WHERE clause",
      language: "sql",
      code: `SELECT column1, column2 
FROM \`table_name\`
WHERE column1 > 100
ORDER BY column2 DESC;`,
      category: "utility",
      tags: "select,where,filter",
      isOfficial: true
    },
    {
      name: "JOIN Tables",
      description: "Join two tables",
      language: "sql",
      code: `SELECT t1.column1, t2.column2
FROM \`table1\` t1
INNER JOIN \`table2\` t2 ON t1.id = t2.foreign_id
WHERE t1.status = 'active';`,
      category: "algorithm",
      tags: "join,relationships",
      isOfficial: true
    },
    // HTML templates
    {
      name: "Basic HTML Page",
      description: "Simple HTML page structure",
      language: "html",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-black text-white p-8">
    <h1 class="text-4xl font-bold mb-4">Hello World</h1>
    <p class="text-zinc-400">This is a basic HTML page with Tailwind CSS.</p>
</body>
</html>`,
      category: "starter",
      tags: "html,basic",
      isOfficial: true
    },
    {
      name: "Card Component",
      description: "Reusable card component with Tailwind",
      language: "html",
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Component</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-black text-white p-8">
    <div class="bg-white/10 border border-white/20 rounded-lg p-6 max-w-md">
        <h2 class="text-2xl font-semibold mb-2">Card Title</h2>
        <p class="text-zinc-400">This is a card component with a modern design.</p>
    </div>
</body>
</html>`,
      category: "utility",
      tags: "html,card,component",
      isOfficial: true
    }
  ]

  for (const template of templates) {
    const existing = await prisma.codeTemplate.findFirst({
      where: {
        name: template.name,
        language: template.language
      }
    })

    if (existing) {
      await prisma.codeTemplate.update({
        where: { id: existing.id },
        data: template
      })
    } else {
      await prisma.codeTemplate.create({
        data: template
      })
    }
  }

  console.log("Code templates seeded!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
