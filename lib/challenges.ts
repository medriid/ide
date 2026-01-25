export type ChallengeType = "python" | "sql" | "python-sql" | "html"

export type ChallengeCategory = "data-files" | "sql" | "sql-in-python" | "html-tailwind"

export type Challenge = {
  id: string
  title: string
  topic: "text-files" | "binary-files" | "csv-files" | "sql-basics" | "sql-filtering" | "sql-joins" | "sql-aggregation" | "mysql-connector" | "mysql-crud" | "mysql-advanced" | "html-basics" | "tailwind-layout" | "tailwind-components"
  type: ChallengeType
  category: ChallengeCategory
  difficulty: "easy" | "medium" | "hard"
  description: string
  instructions: string[]
  starterCode: string
  expectedOutputPattern: RegExp | string
  validationFn?: (output: string) => { success: boolean; message: string }
  hints: string[]
  // SQL-specific fields
  setupSQL?: string  // SQL to run before the challenge (e.g., create tables)
  // HTML-specific fields
  expectedClasses?: string[]  // Required Tailwind classes that should be present
  expectedElements?: string[]  // Required HTML elements that should be present
}

// Category definitions for the 3 tabs
export const categories = [
  {
    id: "data-files" as ChallengeCategory,
    name: "Data Files",
    icon: "FileText",
    description: "Python file handling with text, binary, and CSV files",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    accent: "text-blue-400"
  },
  {
    id: "sql" as ChallengeCategory,
    name: "SQL",
    icon: "Database",
    description: "Direct SQL queries for database operations",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    accent: "text-emerald-400"
  },
  {
    id: "sql-in-python" as ChallengeCategory,
    name: "SQL in Python",
    icon: "Code2",
    description: "Use mysql.connector to connect Python with MySQL",
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
    accent: "text-violet-400"
  },
  {
    id: "html-tailwind" as ChallengeCategory,
    name: "HTML & Tailwind",
    icon: "FileCode2",
    description: "Build beautiful web pages with HTML and Tailwind CSS",
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    accent: "text-pink-400"
  }
]

export const topics = [
  // Data Files category
  {
    id: "text-files",
    name: "Text Files",
    icon: "FileText",
    type: "python" as ChallengeType,
    category: "data-files" as ChallengeCategory,
    description: "Learn to read and write text files using Python's built-in functions",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    accent: "text-blue-400"
  },
  {
    id: "binary-files",
    name: "Binary Files",
    icon: "Package",
    type: "python" as ChallengeType,
    category: "data-files" as ChallengeCategory,
    description: "Work with binary data using pickle for serialization",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    accent: "text-purple-400"
  },
  {
    id: "csv-files",
    name: "CSV Files",
    icon: "Table2",
    type: "python" as ChallengeType,
    category: "data-files" as ChallengeCategory,
    description: "Handle CSV data using Python's csv module",
    color: "from-orange-500/20 to-yellow-500/20 border-orange-500/30",
    accent: "text-orange-400"
  },
  // SQL category
  {
    id: "sql-basics",
    name: "SQL Basics",
    icon: "Database",
    type: "sql" as ChallengeType,
    category: "sql" as ChallengeCategory,
    description: "Learn SELECT, INSERT, UPDATE, DELETE statements",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
    accent: "text-emerald-400"
  },
  {
    id: "sql-filtering",
    name: "SQL Filtering",
    icon: "Filter",
    type: "sql" as ChallengeType,
    category: "sql" as ChallengeCategory,
    description: "Master WHERE, AND, OR, LIKE, and IN clauses",
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
    accent: "text-cyan-400"
  },
  {
    id: "sql-aggregation",
    name: "SQL Aggregation",
    icon: "BarChart3",
    type: "sql" as ChallengeType,
    category: "sql" as ChallengeCategory,
    description: "Use COUNT, SUM, AVG, GROUP BY, and HAVING",
    color: "from-rose-500/20 to-pink-500/20 border-rose-500/30",
    accent: "text-rose-400"
  },
  // SQL in Python category (MySQL Connector)
  {
    id: "mysql-connector",
    name: "MySQL Connector",
    icon: "Plug",
    type: "python-sql" as ChallengeType,
    category: "sql-in-python" as ChallengeCategory,
    description: "Connect Python to MySQL database using mysql.connector",
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
    accent: "text-violet-400"
  },
  {
    id: "mysql-crud",
    name: "CRUD Operations",
    icon: "DatabaseZap",
    type: "python-sql" as ChallengeType,
    category: "sql-in-python" as ChallengeCategory,
    description: "Create, Read, Update, Delete with Python and MySQL",
    color: "from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30",
    accent: "text-fuchsia-400"
  },
  {
    id: "mysql-advanced",
    name: "Advanced Queries",
    icon: "Workflow",
    type: "python-sql" as ChallengeType,
    category: "sql-in-python" as ChallengeCategory,
    description: "Transactions, parameterized queries, and batch operations",
    color: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
    accent: "text-indigo-400"
  },
  // HTML & Tailwind category
  {
    id: "html-basics",
    name: "HTML Basics",
    icon: "FileCode2",
    type: "html" as ChallengeType,
    category: "html-tailwind" as ChallengeCategory,
    description: "Learn HTML structure, elements, and semantic markup",
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
    accent: "text-pink-400"
  },
  {
    id: "tailwind-layout",
    name: "Tailwind Layout",
    icon: "Layout",
    type: "html" as ChallengeType,
    category: "html-tailwind" as ChallengeCategory,
    description: "Master Flexbox, Grid, and responsive layouts with Tailwind",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    accent: "text-purple-400"
  },
  {
    id: "tailwind-components",
    name: "Tailwind Components",
    icon: "Component",
    type: "html" as ChallengeType,
    category: "html-tailwind" as ChallengeCategory,
    description: "Build buttons, cards, forms, and other UI components",
    color: "from-rose-500/20 to-orange-500/20 border-rose-500/30",
    accent: "text-rose-400"
  }
]

export const challenges: Challenge[] = [
  // ===== TEXT FILES CHALLENGES =====
  {
    id: "text-1",
    title: "Read and Print File Content",
    topic: "text-files",
    type: "python",
    category: "data-files",
    difficulty: "easy",
    description: "Learn the basics of reading text files in Python.",
    instructions: [
      "Open the file 'challenge_sample.txt' in read mode",
      "Read its entire content",
      "Print the content to the console"
    ],
    starterCode: `# Challenge: Read and Print File Content
# Open 'challenge_sample.txt' and print its contents

# Your code here:
`,
    expectedOutputPattern: "Hello NCERT Class 12",
    hints: [
      "Use open('challenge_sample.txt', 'r') to open in read mode",
      "Use the read() method to get all content",
      "Don't forget to close the file or use 'with' statement"
    ]
  },
  {
    id: "text-2",
    title: "Write to a Text File",
    topic: "text-files",
    type: "python",
    category: "data-files",
    difficulty: "easy",
    description: "Create a new text file and write content to it.",
    instructions: [
      "Create a new file called 'output.txt' in write mode",
      "Write the text 'Python File Handling Complete!' to the file",
      "Close the file properly",
      "Then read and print the file content to verify"
    ],
    starterCode: `# Challenge: Write to a Text File
# Create 'output.txt' and write a message

# Your code here:
`,
    expectedOutputPattern: "Python File Handling Complete!",
    hints: [
      "Use open('output.txt', 'w') to create/overwrite",
      "Use write() to write content",
      "Read the file back to verify the content"
    ]
  },
  {
    id: "text-3",
    title: "Count Lines in a File",
    topic: "text-files",
    type: "python",
    category: "data-files",
    difficulty: "medium",
    description: "Read a file and count the number of lines it contains.",
    instructions: [
      "First, create a file 'multiline.txt' with at least 5 lines of text",
      "Then read the file and count the lines",
      "Print the count in format: 'Line count: X'"
    ],
    starterCode: `# Challenge: Count Lines in a File
# Create a file 'multiline.txt' with at least 5 lines of text
# Then read the file and count the lines
# Print the count in format: 'Line count: X'
# Your code here:
`,
    expectedOutputPattern: /Line count:\s*5/,
    hints: [
      "Use writelines() with newline characters",
      "Use readlines() to get a list of lines",
      "The length of that list is the line count"
    ]
  },
  {
    id: "text-4",
    title: "Append to a File",
    topic: "text-files",
    type: "python",
    category: "data-files",
    difficulty: "medium",
    description: "Learn to append content to an existing file without overwriting.",
    instructions: [
      "Create a file 'log.txt' with the text 'Log started'",
      "Append a new line: 'Entry 1: User logged in'",
      "Append another line: 'Entry 2: Action completed'",
      "Read and print the entire file content"
    ],
    starterCode: `# Challenge: Append to a File
# Create a log file and append entries

# Your code here:
`,
    expectedOutputPattern: /Log started[\s\S]*Entry 1: User logged in[\s\S]*Entry 2: Action completed/,
    hints: [
      "Use 'w' mode to create the initial file",
      "Use 'a' mode to append without overwriting",
      "Remember to add newline characters (\\n)"
    ]
  },
  {
    id: "text-5",
    title: "Search and Replace in File",
    topic: "text-files",
    type: "python",
    category: "data-files",
    difficulty: "hard",
    description: "Read a file, replace specific words, and write back.",
    instructions: [
      "Create a file 'story.txt' with: 'The quick brown fox jumps over the lazy dog'",
      "Read the content and replace 'fox' with 'cat' and 'dog' with 'mouse'",
      "Write the modified content back to the file",
      "Print the new content: 'The quick brown cat jumps over the lazy mouse'"
    ],
    starterCode: `# Challenge: Search and Replace in File
# Modify text file content using string replacement

# Your code here:
`,
    expectedOutputPattern: "The quick brown cat jumps over the lazy mouse",
    hints: [
      "Read the entire file content as a string",
      "Use the replace() method for substitutions",
      "Write the modified string back to the file"
    ]
  },

  // ===== BINARY FILES CHALLENGES =====
  {
    id: "binary-1",
    title: "Pickle a Dictionary",
    topic: "binary-files",
    type: "python",
    category: "data-files",
    difficulty: "easy",
    description: "Learn to serialize a Python dictionary using pickle.",
    instructions: [
      "Create a dictionary with keys: 'name', 'age', 'city'",
      "Use pickle to save it to 'person.dat'",
      "Load it back and print the dictionary"
    ],
    starterCode: `# Challenge: Pickle a Dictionary
import pickle

# Create a dictionary with keys: 'name', 'age', 'city'
# Your code here:
# Save it to 'person.dat' and load it back
`,
    expectedOutputPattern: /['"]name['"]:\s*['"]Alice['"][\s\S]*['"]age['"]:\s*25[\s\S]*['"]city['"]:\s*['"]New York['"]/,
    hints: [
      "Use pickle.dump(obj, file) with 'wb' mode",
      "Use pickle.load(file) with 'rb' mode",
      "The 'b' in modes stands for binary"
    ]
  },
  {
    id: "binary-2",
    title: "Serialize a List",
    topic: "binary-files",
    type: "python",
    category: "data-files",
    difficulty: "easy",
    description: "Save and load a list of numbers using pickle.",
    instructions: [
      "Create a list of numbers from 1 to 10",
      "Save it to 'numbers.dat' using pickle",
      "Load it back and print the sum of all numbers"
    ],
    starterCode: `# Challenge: Serialize a List
import pickle

# Create a list of numbers from 1 to 10
# Your code here:
# Save it to 'numbers.dat' and load it back to print the sum
`,
    expectedOutputPattern: /55|Sum:\s*55/,
    hints: [
      "range(1, 11) gives numbers 1 through 10",
      "pickle works the same way with lists as with dictionaries",
      "Use sum() to calculate the total"
    ]
  },
  {
    id: "binary-3",
    title: "Store Multiple Objects",
    topic: "binary-files",
    type: "python",
    category: "data-files",
    difficulty: "medium",
    description: "Save multiple objects to a single binary file.",
    instructions: [
      "Create a student record with: name='John', grades=[85, 90, 78]",
      "Create another student: name='Jane', grades=[92, 88, 95]",
      "Save both to 'students.dat' (dump twice)",
      "Load both back and print their average grades"
    ],
    starterCode: `# Challenge: Store Multiple Objects
import pickle

# Create two student records:
# student1: name='John', grades=[85, 90, 78]
# student2: name='Jane', grades=[92, 88, 95]
# Your code here:
# Save both to 'students.dat' and load them back to print average grades
`,
    expectedOutputPattern: /John[\s\S]*84\.33|Jane[\s\S]*91\.67|84\.33[\s\S]*91\.67/,
    validationFn: (output) => {
      const hasJohn = output.includes("John") || output.includes("84")
      const hasJane = output.includes("Jane") || output.includes("91") || output.includes("92")
      if (hasJohn && hasJane) {
        return { success: true, message: "Both students' averages calculated!" }
      }
      return { success: false, message: "Make sure to show averages for both students" }
    },
    hints: [
      "You can call pickle.dump() multiple times on the same file",
      "Call pickle.load() multiple times to read them back",
      "Use sum(grades)/len(grades) for the average"
    ]
  },
  {
    id: "binary-4",
    title: "Pickle Custom Class",
    topic: "binary-files",
    type: "python",
    category: "data-files",
    difficulty: "medium",
    description: "Serialize and deserialize a custom class object.",
    instructions: [
      "Define a Book class with title, author, and pages attributes",
      "Create a Book instance: 'Python Guide', 'Guido', 350 pages",
      "Save it to 'book.dat'",
      "Load and print: 'Title: Python Guide by Guido (350 pages)'"
    ],
    starterCode: `# Challenge: Pickle Custom Class
import pickle

# Define a Book class with title, author, and pages attributes
# Your code here:
# Create a Book instance: 'Python Guide', 'Guido', 350 pages
# Save it to 'book.dat' and load it back
`,
    expectedOutputPattern: /Python Guide.*Guido.*350/,
    hints: [
      "pickle can handle custom class objects",
      "The class definition must exist when loading",
      "Access attributes with dot notation: book.title"
    ]
  },
  {
    id: "binary-5",
    title: "Binary File Error Handling",
    topic: "binary-files",
    type: "python",
    category: "data-files",
    difficulty: "hard",
    description: "Handle errors when working with binary files.",
    instructions: [
      "Try to load from a non-existent file 'missing.dat'",
      "Catch the FileNotFoundError and print 'File not found!'",
      "Then create the file with data {'status': 'created'}",
      "Load and print the status to confirm"
    ],
    starterCode: `# Challenge: Binary File Error Handling
import pickle

# Your code here:
`,
    expectedOutputPattern: /File not found![\s\S]*created/,
    hints: [
      "Use try/except to catch FileNotFoundError",
      "Create the file in the except or after block",
      "Verify by loading and printing"
    ]
  },

  // ===== CSV FILES CHALLENGES =====
  {
    id: "csv-1",
    title: "Read CSV Data",
    topic: "csv-files",
    type: "python",
    category: "data-files",
    difficulty: "easy",
    description: "Learn to read and display data from a CSV file.",
    instructions: [
      "Open 'challenge_sample.csv' and read its contents",
      "Print each row of the CSV file",
      "The file contains: name,age with Alice,20 and Bob,22"
    ],
    starterCode: `# Challenge: Read CSV Data
import csv

# The file 'challenge_sample.csv' already exists with the data
# Your code here:
# Open it and print each row
`,
    expectedOutputPattern: /Alice.*20[\s\S]*Bob.*22/,
    hints: [
      "Use csv.reader(file) to read CSV files",
      "Iterate over the reader to get rows",
      "Each row is a list of strings"
    ]
  },
  {
    id: "csv-2",
    title: "Create CSV File",
    topic: "csv-files",
    type: "python",
    category: "data-files",
    difficulty: "easy",
    description: "Create a new CSV file with headers and data.",
    instructions: [
      "Create 'products.csv' with headers: product,price,quantity",
      "Add rows: Apple,1.50,100 and Banana,0.75,150",
      "Read back and print all rows"
    ],
    starterCode: `# Challenge: Create CSV File
import csv

# Create 'products.csv' with headers: product,price,quantity
# Add rows: Apple,1.50,100 and Banana,0.75,150
# Your code here:
`,
    expectedOutputPattern: /Apple.*1\.50.*100[\s\S]*Banana.*0\.75.*150/,
    hints: [
      "Use csv.writer(file) to create a writer object",
      "Use writerows() to write multiple rows at once",
      "Or use writerow() for individual rows"
    ]
  },
  {
    id: "csv-3",
    title: "CSV with DictReader",
    topic: "csv-files",
    type: "python",
    category: "data-files",
    difficulty: "medium",
    description: "Read CSV data as dictionaries for easier access.",
    instructions: [
      "Open 'challenge_employees.csv' which already contains the data",
      "The file has: name,department,salary with John,Engineering,75000 and Sarah,Marketing,65000",
      "Use DictReader to read and print each employee's name and salary"
    ],
    starterCode: `# Challenge: CSV with DictReader
import csv

# The file 'challenge_employees.csv' already exists with the data
# Your code here:
# Use DictReader to read and print each employee's name and salary
`,
    expectedOutputPattern: /John.*75000[\s\S]*Sarah.*65000/,
    hints: [
      "First write using DictWriter with fieldnames",
      "Use csv.DictReader(file) to read as dictionaries",
      "Access fields by name: row['name']"
    ]
  },
  {
    id: "csv-4",
    title: "Calculate CSV Statistics",
    topic: "csv-files",
    type: "python",
    category: "data-files",
    difficulty: "medium",
    description: "Perform calculations on CSV numerical data.",
    instructions: [
      "Open 'challenge_scores.csv' which already contains the data",
      "The file has: student,score with Alice,85, Bob,92, Charlie,78, Diana,95",
      "Calculate and print the average score as 'Average: X'"
    ],
    starterCode: `# Challenge: Calculate CSV Statistics
import csv

# The file 'challenge_scores.csv' already exists with the data
# Your code here:
# Read the CSV and calculate the average score
`,
    expectedOutputPattern: /Average:\s*87\.5/,
    hints: [
      "Skip the header row when calculating",
      "Convert score strings to integers",
      "Use sum()/len() for average"
    ]
  },
  {
    id: "csv-5",
    title: "Filter and Modify CSV",
    topic: "csv-files",
    type: "python",
    category: "data-files",
    difficulty: "hard",
    description: "Filter CSV data and create a new file with results.",
    instructions: [
      "Open 'challenge_inventory.csv' which already contains the data",
      "The file has: item,quantity,reorder with Laptop,5,10, Mouse,50,20, Keyboard,8,15, Monitor,3,10",
      "Find items where quantity < reorder (low stock)",
      "Write low stock items to 'lowstock.csv'",
      "Print the low stock items"
    ],
    starterCode: `# Challenge: Filter and Modify CSV
import csv

# The file 'challenge_inventory.csv' already exists with the data
# Your code here:
# Find items where quantity < reorder (low stock)
# Write low stock items to 'lowstock.csv'
`,
    expectedOutputPattern: /Laptop[\s\S]*Keyboard[\s\S]*Monitor|Low stock.*Laptop|Low stock.*Monitor/,
    validationFn: (output) => {
      const hasLaptop = output.includes("Laptop")
      const hasKeyboard = output.includes("Keyboard")
      const hasMonitor = output.includes("Monitor")
      
      if (hasLaptop && hasKeyboard && hasMonitor) {
        return { success: true, message: "Correctly identified low stock items!" }
      }
      return { success: false, message: "Check which items have quantity < reorder level" }
    },
    hints: [
      "Compare int(quantity) < int(reorder)",
      "Store low stock items in a list",
      "Write the filtered items to the new file"
    ]
  },

  // ===== SQL BASICS CHALLENGES =====
  {
    id: "sql-basics-1",
    title: "Select All Records",
    topic: "sql-basics",
    type: "sql",
    category: "sql",
    difficulty: "easy",
    description: "Learn to retrieve all data from a table using SELECT *.",
    instructions: [
      "Write a query to select all columns from the 'students' table",
      "The table has columns: id, name, age, city",
      "Your result should show Alice, Bob, and Charlie"
    ],
    starterCode: `-- Select all records from the students table
-- Your query here:
`,
    expectedOutputPattern: /Alice[\s\S]*Bob[\s\S]*Charlie|name.*age.*city/i,
    hints: [
      "Use SELECT * to get all columns",
      "FROM specifies which table to query",
      "No WHERE clause needed for all records"
    ]
  },
  {
    id: "sql-basics-2",
    title: "Select Specific Columns",
    topic: "sql-basics",
    type: "sql",
    category: "sql",
    difficulty: "easy",
    description: "Learn to select only specific columns from a table.",
    instructions: [
      "Write a query to select only 'name' and 'age' columns",
      "From the 'students' table",
      "This is more efficient than SELECT *"
    ],
    starterCode: `-- Select only name and age from students
-- Your query here:
`,
    expectedOutputPattern: /name.*age|Alice.*20|Bob.*22/i,
    hints: [
      "List column names separated by commas",
      "SELECT name, age FROM table_name",
      "Column order in SELECT determines output order"
    ]
  },
  {
    id: "sql-basics-3",
    title: "Insert a New Record",
    topic: "sql-basics",
    type: "sql",
    category: "sql",
    difficulty: "easy",
    description: "Add a new row to a table using INSERT.",
    instructions: [
      "Insert a new student: name='Diana', age=23, city='Boston'",
      "Then SELECT all to verify the insertion",
      "Use INSERT INTO syntax"
    ],
    starterCode: `-- Insert a new student and verify
-- Your query here:
`,
    expectedOutputPattern: /Diana|Boston|23/i,
    hints: [
      "INSERT INTO table (columns) VALUES (values)",
      "String values need quotes: 'Diana'",
      "Run SELECT after INSERT to verify"
    ]
  },
  {
    id: "sql-basics-4",
    title: "Update a Record",
    topic: "sql-basics",
    type: "sql",
    category: "sql",
    difficulty: "medium",
    description: "Modify existing data using UPDATE statement.",
    instructions: [
      "Update Alice's age to 21",
      "Use WHERE to target only Alice",
      "SELECT to verify the change"
    ],
    starterCode: `-- Update Alice's age to 21
-- Your query here:
`,
    expectedOutputPattern: /Alice.*21|21.*Alice|UPDATE|affected/i,
    hints: [
      "UPDATE table SET column = value WHERE condition",
      "Always use WHERE to avoid updating all rows",
      "String comparison: WHERE name = 'Alice'"
    ]
  },
  {
    id: "sql-basics-5",
    title: "Delete a Record",
    topic: "sql-basics",
    type: "sql",
    category: "sql",
    difficulty: "medium",
    description: "Remove data from a table using DELETE.",
    instructions: [
      "First INSERT a temporary student: name='Temp', age=99, city='Test'",
      "Then DELETE that student",
      "SELECT to verify deletion"
    ],
    starterCode: `-- Insert then delete a temporary record
-- Your query here:
`,
    expectedOutputPattern: /DELETE|affected|Temp/i,
    hints: [
      "DELETE FROM table WHERE condition",
      "Be careful! DELETE without WHERE removes all rows",
      "Always test with SELECT first"
    ]
  },

  // ===== SQL FILTERING CHALLENGES =====
  {
    id: "sql-filter-1",
    title: "Filter with WHERE",
    topic: "sql-filtering",
    type: "sql",
    category: "sql",
    difficulty: "easy",
    description: "Filter results using the WHERE clause.",
    instructions: [
      "Select students who are older than 20",
      "Use WHERE with comparison operator",
      "Should return Bob and Charlie (if age > 20)"
    ],
    starterCode: `-- Select students older than 20
-- Your query here:
`,
    expectedOutputPattern: /Bob|Charlie|22|21|age.*>|WHERE/i,
    hints: [
      "Use WHERE column > value",
      "Comparison operators: >, <, >=, <=, =, !=",
      "No quotes needed for numbers"
    ]
  },
  {
    id: "sql-filter-2",
    title: "Multiple Conditions with AND",
    topic: "sql-filtering",
    type: "sql",
    category: "sql",
    difficulty: "easy",
    description: "Combine conditions using AND operator.",
    instructions: [
      "Find students who are older than 19 AND from 'New York'",
      "Both conditions must be true",
      "Use AND to combine conditions"
    ],
    starterCode: `-- Find students older than 19 from New York
-- Your query here:
`,
    expectedOutputPattern: /Alice|New York|AND|WHERE/i,
    hints: [
      "WHERE condition1 AND condition2",
      "String values need single quotes",
      "Both conditions must match"
    ]
  },
  {
    id: "sql-filter-3",
    title: "Using OR Operator",
    topic: "sql-filtering",
    type: "sql",
    category: "sql",
    difficulty: "medium",
    description: "Match any of multiple conditions with OR.",
    instructions: [
      "Find students from 'New York' OR 'Los Angeles'",
      "Either condition can be true",
      "Use OR to combine conditions"
    ],
    starterCode: `-- Find students from New York or Los Angeles
-- Your query here:
`,
    expectedOutputPattern: /Alice|Bob|New York|Los Angeles|OR/i,
    hints: [
      "WHERE condition1 OR condition2",
      "At least one condition must match",
      "Can combine with AND using parentheses"
    ]
  },
  {
    id: "sql-filter-4",
    title: "Pattern Matching with LIKE",
    topic: "sql-filtering",
    type: "sql",
    category: "sql",
    difficulty: "medium",
    description: "Search for patterns in text using LIKE.",
    instructions: [
      "Find students whose names start with 'A'",
      "Use LIKE with % wildcard",
      "% matches any number of characters"
    ],
    starterCode: `-- Find students whose name starts with 'A'
-- Your query here:
`,
    expectedOutputPattern: /Alice|LIKE|A%|name/i,
    hints: [
      "LIKE 'A%' matches names starting with A",
      "% is a wildcard for any characters",
      "'%a%' finds 'a' anywhere in the string"
    ]
  },
  {
    id: "sql-filter-5",
    title: "Filter with IN Operator",
    topic: "sql-filtering",
    type: "sql",
    category: "sql",
    difficulty: "hard",
    description: "Match against a list of values using IN.",
    instructions: [
      "Find students aged 20, 21, or 22",
      "Use IN operator instead of multiple ORs",
      "More concise for multiple values"
    ],
    starterCode: `-- Find students aged 20, 21, or 22
-- Your query here:
`,
    expectedOutputPattern: /Alice|Bob|Charlie|IN|20.*21.*22/i,
    hints: [
      "WHERE column IN (value1, value2, value3)",
      "Cleaner than multiple OR conditions",
      "Works with strings and numbers"
    ]
  },

  // ===== SQL AGGREGATION CHALLENGES =====
  {
    id: "sql-agg-1",
    title: "Count Records",
    topic: "sql-aggregation",
    type: "sql",
    category: "sql",
    difficulty: "easy",
    description: "Count the number of rows using COUNT().",
    instructions: [
      "Count how many students are in the table",
      "Use COUNT(*) to count all rows",
      "Should return 3 (Alice, Bob, Charlie)"
    ],
    starterCode: `-- Count total students
-- Your query here:
`,
    expectedOutputPattern: /3|COUNT|count/i,
    hints: [
      "SELECT COUNT(*) FROM table",
      "COUNT(*) counts all rows",
      "Can use COUNT(column) to count non-null values"
    ]
  },
  {
    id: "sql-agg-2",
    title: "Calculate Average",
    topic: "sql-aggregation",
    type: "sql",
    category: "sql",
    difficulty: "easy",
    description: "Find the average value using AVG().",
    instructions: [
      "Calculate the average age of all students",
      "Use AVG(age) function",
      "Result should be around 21"
    ],
    starterCode: `-- Calculate average age
-- Your query here:
`,
    expectedOutputPattern: /21|AVG|avg|average/i,
    hints: [
      "SELECT AVG(column) FROM table",
      "AVG only works on numeric columns",
      "Returns decimal value"
    ]
  },
  {
    id: "sql-agg-3",
    title: "Find Min and Max",
    topic: "sql-aggregation",
    type: "sql",
    category: "sql",
    difficulty: "medium",
    description: "Find minimum and maximum values.",
    instructions: [
      "Find both the youngest and oldest student's age",
      "Use MIN() and MAX() functions",
      "Select both in one query"
    ],
    starterCode: `-- Find min and max ages
-- Your query here:
`,
    expectedOutputPattern: /MIN|MAX|20|22|min|max/i,
    hints: [
      "SELECT MIN(age), MAX(age) FROM table",
      "Can alias: MIN(age) AS youngest",
      "Works with numbers and dates"
    ]
  },
  {
    id: "sql-agg-4",
    title: "Group By City",
    topic: "sql-aggregation",
    type: "sql",
    category: "sql",
    difficulty: "medium",
    description: "Group results and count by category.",
    instructions: [
      "Count how many students are from each city",
      "Use GROUP BY with COUNT",
      "Shows distribution of students"
    ],
    starterCode: `-- Count students per city
-- Your query here:
`,
    expectedOutputPattern: /GROUP BY|city|New York|Los Angeles|Chicago|1/i,
    hints: [
      "SELECT city, COUNT(*) FROM table GROUP BY city",
      "GROUP BY groups rows with same values",
      "Aggregate functions work per group"
    ]
  },
  {
    id: "sql-agg-5",
    title: "Filter Groups with HAVING",
    topic: "sql-aggregation",
    type: "sql",
    category: "sql",
    difficulty: "hard",
    description: "Filter grouped results using HAVING clause.",
    instructions: [
      "Find cities with more than 0 students",
      "Use GROUP BY with HAVING",
      "HAVING filters after grouping (unlike WHERE)"
    ],
    starterCode: `-- Find cities with students using HAVING
-- Your query here:
`,
    expectedOutputPattern: /HAVING|GROUP BY|city|COUNT|>|0|1/i,
    hints: [
      "HAVING filters grouped results",
      "WHERE filters before grouping",
      "HAVING COUNT(*) > 0"
    ]
  },

  // ===== MYSQL CONNECTOR CHALLENGES (SQL in Python) =====
  {
    id: "mysql-conn-1",
    title: "Connect to MySQL Database",
    topic: "mysql-connector",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "easy",
    description: "Learn to establish a connection to MySQL database using mysql.connector.",
    instructions: [
      "Import the mysql.connector module",
      "Create a connection to the database with provided credentials",
      "Print 'Connection successful!' if connected",
      "Close the connection properly"
    ],
    starterCode: `# Challenge: Connect to MySQL Database
import mysql.connector

# Database connection details are pre-configured
# Just create the connection and verify it works

# Your code here:
try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="testdb"
    )
    
    if conn.is_connected():
        print("Connection successful!")
        
    conn.close()
    print("Connection closed.")
except mysql.connector.Error as e:
    print(f"Error: {e}")
`,
    expectedOutputPattern: /Connection successful/i,
    hints: [
      "Use mysql.connector.connect() with host, user, password, database",
      "Check connection with conn.is_connected()",
      "Always close connections with conn.close()"
    ]
  },
  {
    id: "mysql-conn-2",
    title: "Create a Cursor Object",
    topic: "mysql-connector",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "easy",
    description: "Learn to create a cursor to execute SQL queries.",
    instructions: [
      "Connect to the MySQL database",
      "Create a cursor object from the connection",
      "Use cursor to execute a simple SELECT query",
      "Print the MySQL version"
    ],
    starterCode: `# Challenge: Create a Cursor Object
import mysql.connector

# Your code here:
conn = mysql.connector.connect(
    host="localhost",
    user="root", 
    password="password",
    database="testdb"
)

# Create cursor and execute query
cursor = conn.cursor()
cursor.execute("SELECT VERSION()")

# Fetch and print result

`,
    expectedOutputPattern: /\d+\.\d+|version|MySQL/i,
    hints: [
      "Use conn.cursor() to create a cursor",
      "Use cursor.execute() to run SQL",
      "Use cursor.fetchone() to get the result"
    ]
  },
  {
    id: "mysql-conn-3",
    title: "Execute SELECT Query",
    topic: "mysql-connector",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "easy",
    description: "Fetch data from a table using SELECT query.",
    instructions: [
      "Connect to the database",
      "Execute: SELECT * FROM students",
      "Fetch all rows using fetchall()",
      "Print each row"
    ],
    starterCode: `# Challenge: Execute SELECT Query
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password", 
    database="testdb"
)

cursor = conn.cursor()

# Execute SELECT query and print results
# Your code here:
cursor.execute("SELECT * FROM students")
rows = cursor.fetchall()

for row in rows:
    print(row)

cursor.close()
conn.close()
`,
    expectedOutputPattern: /Alice|Bob|Charlie|\(.*\)/i,
    hints: [
      "cursor.execute('SELECT * FROM table')",
      "rows = cursor.fetchall() returns list of tuples",
      "Loop through rows to print each one"
    ]
  },
  {
    id: "mysql-conn-4",
    title: "Fetch Single Row",
    topic: "mysql-connector",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "medium",
    description: "Learn different fetch methods: fetchone(), fetchall(), fetchmany().",
    instructions: [
      "Connect to the database",
      "Execute: SELECT * FROM students ORDER BY id",
      "Use fetchone() to get first row",
      "Use fetchmany(2) to get next 2 rows",
      "Print all fetched data"
    ],
    starterCode: `# Challenge: Fetch Single Row and Multiple
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="testdb"
)

cursor = conn.cursor()
cursor.execute("SELECT * FROM students ORDER BY id")

# Fetch one row
first = cursor.fetchone()
print(f"First student: {first}")

# Fetch next 2 rows
next_two = cursor.fetchmany(2)
print(f"Next two: {next_two}")

cursor.close()
conn.close()
`,
    expectedOutputPattern: /First student.*\(|Next two.*\[/i,
    hints: [
      "fetchone() returns a single tuple or None",
      "fetchmany(n) returns a list of n tuples",
      "After fetchone(), fetchmany() continues from where you left off"
    ]
  },
  {
    id: "mysql-conn-5",
    title: "Dictionary Cursor",
    topic: "mysql-connector",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "medium",
    description: "Use dictionary cursor for more readable results.",
    instructions: [
      "Create a cursor with dictionary=True",
      "Execute SELECT * FROM students",
      "Access columns by name instead of index",
      "Print each student's name and age"
    ],
    starterCode: `# Challenge: Dictionary Cursor
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="testdb"
)

# Create dictionary cursor
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM students")

# Print using column names
for student in cursor.fetchall():
    print(f"Name: {student['name']}, Age: {student['age']}")

cursor.close()
conn.close()
`,
    expectedOutputPattern: /Name:.*Age:/i,
    hints: [
      "conn.cursor(dictionary=True) returns dict rows",
      "Access with row['column_name']",
      "Much more readable than row[0], row[1]"
    ]
  },

  // ===== MYSQL CRUD CHALLENGES =====
  {
    id: "mysql-crud-1",
    title: "INSERT a New Record",
    topic: "mysql-crud",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "easy",
    description: "Insert data into a MySQL table using Python.",
    instructions: [
      "Connect to the database",
      "Use cursor.execute() with INSERT query",
      "Insert a student: name='Diana', age=23, city='Boston'",
      "Commit the transaction",
      "Print the inserted row ID"
    ],
    starterCode: `# Challenge: INSERT a New Record
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="testdb"
)

cursor = conn.cursor()

# Insert new student
sql = "INSERT INTO students (name, age, city) VALUES (%s, %s, %s)"
values = ("Diana", 23, "Boston")

cursor.execute(sql, values)
conn.commit()

print(f"Inserted row ID: {cursor.lastrowid}")
print(f"Rows affected: {cursor.rowcount}")

cursor.close()
conn.close()
`,
    expectedOutputPattern: /Inserted row ID:\s*\d+|Rows affected:\s*1/i,
    hints: [
      "Use %s placeholders for values (prevents SQL injection)",
      "Always call conn.commit() after INSERT/UPDATE/DELETE",
      "cursor.lastrowid gives the auto-generated ID"
    ]
  },
  {
    id: "mysql-crud-2",
    title: "INSERT Multiple Rows",
    topic: "mysql-crud",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "easy",
    description: "Insert multiple rows using executemany().",
    instructions: [
      "Create a list of students to insert",
      "Use cursor.executemany() for batch insert",
      "Commit and print how many rows were inserted"
    ],
    starterCode: `# Challenge: INSERT Multiple Rows
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="testdb"
)

cursor = conn.cursor()

# Multiple students to insert
students = [
    ("Eve", 21, "Chicago"),
    ("Frank", 24, "Houston"),
    ("Grace", 22, "Seattle")
]

sql = "INSERT INTO students (name, age, city) VALUES (%s, %s, %s)"
cursor.executemany(sql, students)
conn.commit()

print(f"Inserted {cursor.rowcount} rows")

cursor.close()
conn.close()
`,
    expectedOutputPattern: /Inserted\s*3\s*rows|rowcount.*3/i,
    hints: [
      "executemany() takes a list of tuples",
      "More efficient than multiple execute() calls",
      "rowcount shows total affected rows"
    ]
  },
  {
    id: "mysql-crud-3",
    title: "UPDATE Records",
    topic: "mysql-crud",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "medium",
    description: "Update existing records in the database.",
    instructions: [
      "Connect and create cursor",
      "Update Alice's city to 'Los Angeles'",
      "Use parameterized query for safety",
      "Commit and print affected rows"
    ],
    starterCode: `# Challenge: UPDATE Records
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="testdb"
)

cursor = conn.cursor()

# Update Alice's city
sql = "UPDATE students SET city = %s WHERE name = %s"
values = ("Los Angeles", "Alice")

cursor.execute(sql, values)
conn.commit()

print(f"Updated {cursor.rowcount} row(s)")

# Verify the update
cursor.execute("SELECT * FROM students WHERE name = 'Alice'")
print(f"Updated record: {cursor.fetchone()}")

cursor.close()
conn.close()
`,
    expectedOutputPattern: /Updated\s*\d+\s*row|Los Angeles/i,
    hints: [
      "Always use WHERE clause in UPDATE",
      "Use parameterized queries to prevent SQL injection",
      "rowcount shows how many rows were affected"
    ]
  },
  {
    id: "mysql-crud-4",
    title: "DELETE Records",
    topic: "mysql-crud",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "medium",
    description: "Delete records from the database safely.",
    instructions: [
      "First INSERT a temporary student 'TempUser'",
      "Then DELETE that student",
      "Print the number of deleted rows",
      "Verify deletion with SELECT"
    ],
    starterCode: `# Challenge: DELETE Records
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="testdb"
)

cursor = conn.cursor()

# First insert a temp record
cursor.execute("INSERT INTO students (name, age, city) VALUES ('TempUser', 99, 'Test')")
conn.commit()
print(f"Inserted temp user with ID: {cursor.lastrowid}")

# Now delete it
sql = "DELETE FROM students WHERE name = %s"
cursor.execute(sql, ("TempUser",))
conn.commit()

print(f"Deleted {cursor.rowcount} row(s)")

# Verify deletion
cursor.execute("SELECT * FROM students WHERE name = 'TempUser'")
result = cursor.fetchone()
print(f"After delete: {result}")  # Should be None

cursor.close()
conn.close()
`,
    expectedOutputPattern: /Deleted\s*1\s*row|After delete:\s*None/i,
    hints: [
      "DELETE requires WHERE to target specific rows",
      "Without WHERE, ALL rows are deleted!",
      "fetchone() returns None if no rows found"
    ]
  },
  {
    id: "mysql-crud-5",
    title: "Complete CRUD Operations",
    topic: "mysql-crud",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "hard",
    description: "Combine all CRUD operations in one program.",
    instructions: [
      "CREATE: Insert a new product",
      "READ: Fetch and display it",
      "UPDATE: Change its price",
      "DELETE: Remove the product",
      "Verify each step"
    ],
    starterCode: `# Challenge: Complete CRUD Operations
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="testdb"
)

cursor = conn.cursor(dictionary=True)

# 1. CREATE
print("=== CREATE ===")
cursor.execute("INSERT INTO products (name, price) VALUES (%s, %s)", ("Widget", 29.99))
conn.commit()
product_id = cursor.lastrowid
print(f"Created product ID: {product_id}")

# 2. READ
print("\\n=== READ ===")
cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
print(f"Product: {cursor.fetchone()}")

# 3. UPDATE
print("\\n=== UPDATE ===")
cursor.execute("UPDATE products SET price = %s WHERE id = %s", (39.99, product_id))
conn.commit()
cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
print(f"Updated: {cursor.fetchone()}")

# 4. DELETE
print("\\n=== DELETE ===")
cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
conn.commit()
print(f"Deleted {cursor.rowcount} row(s)")

cursor.close()
conn.close()
`,
    expectedOutputPattern: /CREATE[\s\S]*READ[\s\S]*UPDATE[\s\S]*DELETE/i,
    hints: [
      "C = INSERT, R = SELECT, U = UPDATE, D = DELETE",
      "Always commit after modifying data",
      "Use parameterized queries for safety"
    ]
  },

  // ===== MYSQL ADVANCED CHALLENGES =====
  {
    id: "mysql-adv-1",
    title: "Parameterized Queries",
    topic: "mysql-advanced",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "easy",
    description: "Prevent SQL injection with parameterized queries.",
    instructions: [
      "Create a function that searches students by name",
      "Use %s placeholders instead of string formatting",
      "Demonstrate safe query execution"
    ],
    starterCode: `# Challenge: Parameterized Queries
import mysql.connector

def search_student(name):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="testdb"
    )
    cursor = conn.cursor(dictionary=True)
    
    # SAFE: Using parameterized query
    sql = "SELECT * FROM students WHERE name LIKE %s"
    cursor.execute(sql, (f"%{name}%",))
    
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return results

# Test the function
print("Searching for 'Ali':")
results = search_student("Ali")
for student in results:
    print(f"  Found: {student['name']} from {student['city']}")

# This input would be dangerous without parameterization:
print("\\nSearching with special chars:")
results = search_student("'; DROP TABLE students; --")
print(f"  Safe! Found {len(results)} results (no injection)")
`,
    expectedOutputPattern: /Found.*name|Safe.*no injection/i,
    hints: [
      "Never use f-strings or % for SQL values",
      "Use %s placeholders and pass tuple of values",
      "This prevents SQL injection attacks"
    ]
  },
  {
    id: "mysql-adv-2",
    title: "Transaction Handling",
    topic: "mysql-advanced",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "medium",
    description: "Handle transactions with commit and rollback.",
    instructions: [
      "Start a transaction (autocommit is off by default)",
      "Insert two related records",
      "Use try/except to handle errors",
      "Rollback on error, commit on success"
    ],
    starterCode: `# Challenge: Transaction Handling
import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="testdb"
)

cursor = conn.cursor()

try:
    # Transaction: Transfer money between accounts
    print("Starting transaction...")
    
    # Deduct from account 1
    cursor.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
    
    # Add to account 2
    cursor.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
    
    # If both succeed, commit
    conn.commit()
    print("Transaction committed successfully!")
    
except mysql.connector.Error as e:
    # If any error, rollback
    conn.rollback()
    print(f"Transaction rolled back: {e}")
    
finally:
    cursor.close()
    conn.close()
`,
    expectedOutputPattern: /Transaction committed|Transaction rolled back/i,
    hints: [
      "Transactions group operations as atomic unit",
      "conn.commit() makes changes permanent",
      "conn.rollback() undoes all changes since last commit"
    ]
  },
  {
    id: "mysql-adv-3",
    title: "Context Manager Pattern",
    topic: "mysql-advanced",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "medium",
    description: "Use Python's with statement for clean resource management.",
    instructions: [
      "Create a connection using context manager style",
      "Automatically handle connection cleanup",
      "Execute queries within the context"
    ],
    starterCode: `# Challenge: Context Manager Pattern
import mysql.connector
from contextlib import contextmanager

@contextmanager
def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="testdb"
    )
    try:
        yield conn
    finally:
        conn.close()
        print("Connection automatically closed!")

# Using the context manager
with get_db_connection() as conn:
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT COUNT(*) as count FROM students")
    result = cursor.fetchone()
    print(f"Total students: {result['count']}")
    cursor.close()

print("Query completed safely!")
`,
    expectedOutputPattern: /Total students:\s*\d+|Connection automatically closed/i,
    hints: [
      "@contextmanager decorator creates context managers",
      "'with' statement ensures cleanup even on errors",
      "This pattern prevents resource leaks"
    ]
  },
  {
    id: "mysql-adv-4",
    title: "Handle Connection Errors",
    topic: "mysql-advanced",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "medium",
    description: "Gracefully handle database connection errors.",
    instructions: [
      "Attempt connection with error handling",
      "Catch specific MySQL errors",
      "Implement retry logic",
      "Print helpful error messages"
    ],
    starterCode: `# Challenge: Handle Connection Errors
import mysql.connector
from mysql.connector import Error
import time

def connect_with_retry(max_retries=3):
    for attempt in range(1, max_retries + 1):
        try:
            print(f"Connection attempt {attempt}...")
            conn = mysql.connector.connect(
                host="localhost",
                user="root",
                password="password",
                database="testdb",
                connection_timeout=5
            )
            if conn.is_connected():
                print("Connected successfully!")
                return conn
                
        except Error as e:
            print(f"Attempt {attempt} failed: {e}")
            if attempt < max_retries:
                print("Retrying in 1 second...")
                time.sleep(1)
            else:
                print("All connection attempts failed!")
                raise

# Test the connection
try:
    conn = connect_with_retry(3)
    print(f"Database: {conn.database}")
    conn.close()
except Exception as e:
    print(f"Could not connect: {e}")
`,
    expectedOutputPattern: /Connected successfully|Connection attempt/i,
    hints: [
      "Use mysql.connector.Error to catch specific errors",
      "Retry logic helps with temporary connection issues",
      "connection_timeout prevents hanging"
    ]
  },
  {
    id: "mysql-adv-5",
    title: "Batch Processing with Generators",
    topic: "mysql-advanced",
    type: "python-sql",
    category: "sql-in-python",
    difficulty: "hard",
    description: "Efficiently process large datasets using generators.",
    instructions: [
      "Create a generator function for fetching rows",
      "Process data in batches to save memory",
      "Handle large result sets efficiently"
    ],
    starterCode: `# Challenge: Batch Processing with Generators
import mysql.connector

def fetch_in_batches(query, batch_size=2):
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="testdb"
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query)
    
    batch_num = 0
    while True:
        batch = cursor.fetchmany(batch_size)
        if not batch:
            break
        batch_num += 1
        print(f"Processing batch {batch_num} ({len(batch)} rows)")
        yield batch
    
    cursor.close()
    conn.close()
    print("All batches processed!")

# Process students in batches of 2
print("=== Batch Processing Demo ===")
for batch in fetch_in_batches("SELECT * FROM students", batch_size=2):
    for student in batch:
        print(f"  - {student['name']}")
    print()
`,
    expectedOutputPattern: /Processing batch \d+|Batch Processing Demo/i,
    hints: [
      "Generators use yield instead of return",
      "fetchmany(n) gets n rows at a time",
      "Great for processing millions of rows"
    ]
  },
  // HTML & Tailwind Challenges
  {
    id: "html-1",
    title: "Create a Basic HTML Page",
    topic: "html-basics",
    type: "html",
    category: "html-tailwind",
    difficulty: "easy",
    description: "Create a simple HTML page with proper structure.",
    instructions: [
      "Create a complete HTML document with DOCTYPE, html, head, and body tags",
      "Add a title tag in the head with text 'My First Page'",
      "Add an h1 element in the body with text 'Hello World'",
      "Include the Tailwind CDN script in the head"
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Your code here -->
</body>
</html>`,
    expectedOutputPattern: "Hello World",
    expectedElements: ["h1"],
    hints: [
      "Use <h1>Hello World</h1> for the heading",
      "Make sure all tags are properly closed",
      "The title should be in the <head> section"
    ]
  },
  {
    id: "html-2",
    title: "Add Tailwind Styling",
    topic: "html-basics",
    type: "html",
    category: "html-tailwind",
    difficulty: "easy",
    description: "Style your HTML using Tailwind CSS utility classes.",
    instructions: [
      "Create an h1 element with text 'Welcome'",
      "Add Tailwind classes: text-3xl, font-bold, text-blue-500",
      "Center the heading using Tailwind's flexbox utilities"
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Styled Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Your code here -->
</body>
</html>`,
    expectedOutputPattern: "Welcome",
    expectedClasses: ["text-3xl", "font-bold", "text-blue-500"],
    hints: [
      "Use class='text-3xl font-bold text-blue-500'",
      "Add flex items-center justify-center to the body or a container",
      "Tailwind classes are space-separated in the class attribute"
    ]
  },
  {
    id: "html-3",
    title: "Create a Card Layout",
    topic: "tailwind-layout",
    type: "html",
    category: "html-tailwind",
    difficulty: "medium",
    description: "Build a card component using Tailwind's layout utilities.",
    instructions: [
      "Create a div with Tailwind card styling: bg-white, rounded-lg, shadow-lg, p-6",
      "Add a heading inside with text 'Card Title'",
      "Add a paragraph with some text",
      "Center the card on the page using flexbox"
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Card Layout</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Your code here -->
</body>
</html>`,
    expectedOutputPattern: "Card Title",
    expectedClasses: ["bg-white", "rounded-lg", "shadow-lg", "p-6"],
    hints: [
      "Use flex items-center justify-center min-h-screen on body",
      "Card should have: bg-white rounded-lg shadow-lg p-6",
      "Add max-w-md to limit card width"
    ]
  },
  {
    id: "html-4",
    title: "Build a Button Component",
    topic: "tailwind-components",
    type: "html",
    category: "html-tailwind",
    difficulty: "easy",
    description: "Create a styled button using Tailwind CSS.",
    instructions: [
      "Create a button element",
      "Add text 'Click Me'",
      "Style it with: bg-blue-500, hover:bg-blue-600, text-white, font-semibold, py-2, px-4, rounded"
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Button Component</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Your code here -->
</body>
</html>`,
    expectedOutputPattern: "Click Me",
    expectedElements: ["button"],
    expectedClasses: ["bg-blue-500", "hover:bg-blue-600", "text-white"],
    hints: [
      "Use <button>Click Me</button>",
      "Add classes: bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded",
      "Hover states use the hover: prefix"
    ]
  },
  {
    id: "html-5",
    title: "Responsive Grid Layout",
    topic: "tailwind-layout",
    type: "html",
    category: "html-tailwind",
    difficulty: "medium",
    description: "Create a responsive grid using Tailwind's grid utilities.",
    instructions: [
      "Create a container div with grid layout",
      "Use grid-cols-1 md:grid-cols-3 for responsive columns",
      "Add gap-4 for spacing",
      "Create 3 child divs with bg-gray-200 p-4 and text 'Item 1', 'Item 2', 'Item 3'"
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grid Layout</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Your code here -->
</body>
</html>`,
    expectedOutputPattern: "Item 1",
    expectedClasses: ["grid", "grid-cols-1", "md:grid-cols-3", "gap-4"],
    hints: [
      "Use grid grid-cols-1 md:grid-cols-3 gap-4",
      "Responsive breakpoints: md: (768px), lg: (1024px)",
      "Each item should have bg-gray-200 p-4"
    ]
  },
  {
    id: "html-6",
    title: "Form with Tailwind Styling",
    topic: "tailwind-components",
    type: "html",
    category: "html-tailwind",
    difficulty: "medium",
    description: "Build a styled form using Tailwind CSS.",
    instructions: [
      "Create a form element",
      "Add an input field with placeholder 'Enter your name'",
      "Style input with: border, border-gray-300, rounded, px-4, py-2",
      "Add a submit button with bg-blue-500, text-white styling"
    ],
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Styled Form</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Your code here -->
</body>
</html>`,
    expectedOutputPattern: "Enter your name",
    expectedElements: ["form", "input"],
    expectedClasses: ["border", "rounded"],
    hints: [
      "Use <form> with flex flex-col gap-4",
      "Input: border border-gray-300 rounded px-4 py-2",
      "Button: bg-blue-500 text-white px-4 py-2 rounded"
    ]
  }
]

export function getChallengesByTopic(topicId: string): Challenge[] {
  return challenges.filter(c => c.topic === topicId)
}

export function getChallengesByCategory(categoryId: ChallengeCategory): Challenge[] {
  return challenges.filter(c => c.category === categoryId)
}

export function getTopicsByCategory(categoryId: ChallengeCategory) {
  return topics.filter(t => t.category === categoryId)
}

export function getChallengeById(id: string): Challenge | undefined {
  return challenges.find(c => c.id === id)
}

export function validateOutput(challenge: Challenge, output: string): { success: boolean; message: string } {
  // HTML challenges - validate HTML structure and Tailwind classes
  if (challenge.type === "html") {
    const issues: string[] = []
    
    // Check for expected HTML elements
    if (challenge.expectedElements) {
      for (const element of challenge.expectedElements) {
        const regex = new RegExp(`<${element}[^>]*>`, 'i')
        if (!regex.test(output)) {
          issues.push(`Missing required <${element}> element`)
        }
      }
    }
    
    // Check for expected Tailwind classes
    if (challenge.expectedClasses) {
      for (const className of challenge.expectedClasses) {
        // Check for class in class attribute (handle both class and className)
        const classRegex = new RegExp(`class=["'][^"']*${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"']*["']`, 'i')
        if (!classRegex.test(output)) {
          issues.push(`Missing required Tailwind class: ${className}`)
        }
      }
    }
    
    // Check pattern match (for text content)
    if (challenge.expectedOutputPattern) {
      const pattern = challenge.expectedOutputPattern
      if (typeof pattern === 'string') {
        if (!output.includes(pattern)) {
          issues.push(`Missing expected text: "${pattern}"`)
        }
      } else if (pattern instanceof RegExp) {
        if (!pattern.test(output)) {
          issues.push("Output doesn't match expected pattern")
        }
      }
    }
    
    if (issues.length === 0) {
      return { success: true, message: "Perfect! Your HTML and Tailwind styling look great!" }
    }
    
    return { 
      success: false, 
      message: `Almost there! Issues found:\n${issues.join('\n')}` 
    }
  }
  
  // If there's a custom validation function, use it
  if (challenge.validationFn) {
    return challenge.validationFn(output)
  }
  
  // Otherwise use the pattern matching
  const pattern = challenge.expectedOutputPattern
  
  if (typeof pattern === 'string') {
    if (output.includes(pattern)) {
      return { success: true, message: "Correct! Your output matches the expected result." }
    }
    return { success: false, message: "Output doesn't match expected result. Keep trying!" }
  }
  
  // RegExp pattern
  if (pattern.test(output)) {
    return { success: true, message: "Excellent! Challenge completed successfully!" }
  }
  
  return { success: false, message: "Output doesn't match the expected pattern. Check your code!" }
}
