// ============================================
// STATIC LESSON DATA
// ============================================
// Lessons are static content - only progress is stored in the database

export type LessonSection = {
  id: string
  title: string
  type: "concept" | "code" | "exercise" | "example"
  order: number
  content: string
}

export type Lesson = {
  id: string
  slug: string
  title: string
  topic: "Python" | "SQL" | "MySQL Python" | "HTML & Tailwind CSS"
  summary: string
  order: number
  published: boolean
  sections: LessonSection[]
}

// ============================================
// PYTHON LESSONS
// ============================================

const pythonLessons: Lesson[] = [
  {
    id: "python-getting-started",
    slug: "python-getting-started",
    title: "Getting Started with Python",
    topic: "Python",
    summary: "Write your first Python program, understand the basics of running scripts, and learn how output works.",
    order: 1,
    published: true,
    sections: [
      {
        id: "python-getting-started-1",
        title: "Why Python?",
        type: "concept",
        order: 1,
        content: `# Why Python?

Python is designed to be readable and beginner-friendly while still powerful enough for professionals.

## What makes Python great?

- **Readable syntax** that feels close to plain English
- **Versatile** for web apps, automation, data science, and more
- **Huge ecosystem** of libraries and community support

You'll start by writing small scripts and grow into building full applications.`
      },
      {
        id: "python-getting-started-2",
        title: "Your First Program",
        type: "code",
        order: 2,
        content: `# Your First Program

The classic first program prints a message to the screen.

\`\`\`python
print("Hello, Python!")
\`\`\`

## How it works

- \`print()\` sends text to the output
- Quotes turn text into a **string**

Try customizing the message:

\`\`\`python
print("I am learning Python today.")
\`\`\``
      },
      {
        id: "python-getting-started-3",
        title: "Mini Exercise",
        type: "exercise",
        order: 3,
        content: `# Mini Exercise

Create a script that prints:

1. Your name
2. Your favorite hobby
3. A goal you want to achieve

Example:

\`\`\`python
print("Name: Alex")
print("Hobby: Drawing")
print("Goal: Build my first app")
\`\`\`

Go to the **Python Lab** to try it!`
      }
    ]
  },
  {
    id: "python-variables-types",
    slug: "python-variables-types",
    title: "Variables & Data Types",
    topic: "Python",
    summary: "Learn how to store information in variables and work with strings, numbers, and booleans.",
    order: 2,
    published: true,
    sections: [
      {
        id: "python-variables-types-1",
        title: "Variables",
        type: "concept",
        order: 1,
        content: `# Variables

Variables store information so you can reuse it later.

\`\`\`python
name = "Taylor"
age = 16
is_student = True
\`\`\`

Python figures out the type for you automatically.`
      },
      {
        id: "python-variables-types-2",
        title: "Core Data Types",
        type: "code",
        order: 2,
        content: `# Core Data Types

Common data types you'll use every day:

| Type | Example |
|------|---------|
| **int** | \`42\` |
| **float** | \`3.14\` |
| **str** | \`"hello"\` |
| **bool** | \`True\` |

\`\`\`python
score = 95          # int
pi = 3.14159        # float
greeting = "Hi!"    # string
is_ready = False    # boolean
\`\`\`

Use \`type()\` to check:

\`\`\`python
print(type(score))
\`\`\``
      },
      {
        id: "python-variables-types-3",
        title: "Input and Type Conversion",
        type: "exercise",
        order: 3,
        content: `# Input and Type Conversion

\`input()\` always returns a string, so you may need to convert it.

\`\`\`python
age_text = input("How old are you? ")
age = int(age_text)
print("Next year you will be", age + 1)
\`\`\`

Exercise: Ask for a temperature in Celsius and print the Fahrenheit conversion.

Formula: \`F = (C * 9/5) + 32\``
      }
    ]
  },
  {
    id: "python-conditionals",
    slug: "python-conditionals",
    title: "Conditionals & Logic",
    topic: "Python",
    summary: "Make decisions in your programs with if/elif/else and comparison operators.",
    order: 3,
    published: true,
    sections: [
      {
        id: "python-conditionals-1",
        title: "Comparisons",
        type: "concept",
        order: 1,
        content: `# Comparisons

Comparisons evaluate to **True** or **False**.

| Operator | Meaning |
|----------|---------|
| \`==\` | Equal |
| \`!=\` | Not equal |
| \`>\` | Greater than |
| \`<\` | Less than |
| \`>=\` | Greater or equal |
| \`<=\` | Less or equal |

\`\`\`python
score = 85
print(score >= 80)  # True
\`\`\``
      },
      {
        id: "python-conditionals-2",
        title: "if / elif / else",
        type: "code",
        order: 2,
        content: `# if / elif / else

Use conditionals to run different code paths.

\`\`\`python
grade = 72

if grade >= 90:
    print("A")
elif grade >= 80:
    print("B")
elif grade >= 70:
    print("C")
else:
    print("Keep practicing!")
\`\`\``
      },
      {
        id: "python-conditionals-3",
        title: "Logical Operators",
        type: "exercise",
        order: 3,
        content: `# Logical Operators

Combine conditions with:

- \`and\` (both true)
- \`or\` (either true)
- \`not\` (invert)

\`\`\`python
age = 16
has_permission = True

if age >= 13 and has_permission:
    print("Access granted")
\`\`\`

Exercise: Ask for a username and password. Print "Welcome" only if both match expected values.`
      }
    ]
  },
  {
    id: "python-loops",
    slug: "python-loops",
    title: "Loops & Iteration",
    topic: "Python",
    summary: "Repeat actions with for and while loops, and learn how to control loop flow.",
    order: 4,
    published: true,
    sections: [
      {
        id: "python-loops-1",
        title: "for Loops",
        type: "code",
        order: 1,
        content: `# for Loops

Use \`for\` to iterate over a sequence.

\`\`\`python
for number in range(1, 6):
    print(number)
\`\`\`

\`range(1, 6)\` generates 1, 2, 3, 4, 5.`
      },
      {
        id: "python-loops-2",
        title: "while Loops",
        type: "code",
        order: 2,
        content: `# while Loops

Use \`while\` when you don't know how many times to loop.

\`\`\`python
count = 3

while count > 0:
    print("Counting down:", count)
    count -= 1
\`\`\``
      },
      {
        id: "python-loops-3",
        title: "Loop Control",
        type: "exercise",
        order: 3,
        content: `# Loop Control

- \`break\` stops the loop
- \`continue\` skips to the next iteration

\`\`\`python
for n in range(1, 10):
    if n == 5:
        break
    print(n)
\`\`\`

Exercise: Build a number guessing loop that stops when the user types "quit".`
      }
    ]
  },
  {
    id: "python-collections",
    slug: "python-collections",
    title: "Lists, Tuples, Sets & Dictionaries",
    topic: "Python",
    summary: "Organize data with Python collections and learn when to use each one.",
    order: 5,
    published: true,
    sections: [
      {
        id: "python-collections-1",
        title: "Lists",
        type: "code",
        order: 1,
        content: `# Lists

Lists store ordered items.

\`\`\`python
colors = ["red", "green", "blue"]
colors.append("yellow")
print(colors[0])  # red
\`\`\``
      },
      {
        id: "python-collections-2",
        title: "Tuples & Sets",
        type: "concept",
        order: 2,
        content: `# Tuples & Sets

**Tuples** are ordered and immutable:

\`\`\`python
coords = (10, 20)
\`\`\`

**Sets** are unordered and unique:

\`\`\`python
tags = {"python", "coding", "python"}
print(tags)  # duplicates removed
\`\`\``
      },
      {
        id: "python-collections-3",
        title: "Dictionaries",
        type: "exercise",
        order: 3,
        content: `# Dictionaries

Dictionaries store key-value pairs.

\`\`\`python
student = {"name": "Ava", "grade": "A"}
print(student["name"])
\`\`\`

Exercise: Create a dictionary for a movie with title, year, and rating, then print each value.`
      }
    ]
  },
  {
    id: "python-functions-modules",
    slug: "python-functions-modules",
    title: "Functions & Modules",
    topic: "Python",
    summary: "Break code into reusable functions and import modules to extend your scripts.",
    order: 6,
    published: true,
    sections: [
      {
        id: "python-functions-modules-1",
        title: "Defining Functions",
        type: "code",
        order: 1,
        content: `# Defining Functions

Functions let you reuse logic and keep code organized.

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("Jordan"))
\`\`\``
      },
      {
        id: "python-functions-modules-2",
        title: "Parameters & Returns",
        type: "concept",
        order: 2,
        content: `# Parameters & Returns

Functions can accept multiple inputs and return results.

\`\`\`python
def add(a, b):
    return a + b

total = add(5, 7)
print(total)
\`\`\``
      },
      {
        id: "python-functions-modules-3",
        title: "Using Modules",
        type: "exercise",
        order: 3,
        content: `# Using Modules

Import modules to access built-in tools.

\`\`\`python
import math

print(math.sqrt(49))
\`\`\`

Exercise: Use \`random\` to generate a number between 1 and 10 and print it.`
      }
    ]
  },
  {
    id: "python-file-handling-basics",
    slug: "python-file-handling-basics",
    title: "File Handling Basics",
    topic: "Python",
    summary: "Learn how to open, read, write, and close text files in Python using built-in functions.",
    order: 7,
    published: true,
    sections: [
      {
        id: "python-file-handling-basics-1",
        title: "Introduction to File Handling",
        type: "concept",
        order: 1,
        content: `# Introduction to File Handling

File handling is an essential skill in programming that allows you to store and retrieve data permanently. Unlike variables that lose their values when a program ends, files provide **persistent storage**.

## Why Do We Need Files?

- **Data Persistence**: Store data that survives program termination
- **Data Sharing**: Exchange information between programs
- **Large Data**: Handle data too large to fit in memory
- **Configuration**: Store settings and preferences

## Types of Files

Python handles two types of files:

1. **Text Files** (.txt, .csv, .py)
   - Store data as readable characters
   - Each line ends with a newline character (\\n)
   - Human-readable content

2. **Binary Files** (.dat, .bin, .jpg, .mp3)
   - Store data in binary format (0s and 1s)
   - Not human-readable
   - Used for images, audio, serialized objects

> In this lesson, we'll focus on **text files**. Binary files will be covered in a later lesson.`
      },
      {
        id: "python-file-handling-basics-2",
        title: "Opening and Closing Files",
        type: "code",
        order: 2,
        content: `# Opening and Closing Files

To work with a file, you must first **open** it using the \`open()\` function.

## The open() Function

\`\`\`python
file_object = open(filename, mode)
\`\`\`

**Parameters:**
- \`filename\`: Path to the file (string)
- \`mode\`: How you want to access the file (string)

## File Opening Modes

| Mode | Description |
|------|-------------|
| \`'r'\` | Read only (default). File must exist. |
| \`'w'\` | Write only. Creates new file or **overwrites** existing. |
| \`'a'\` | Append. Creates new file or adds to existing. |
| \`'r+'\` | Read and write. File must exist. |
| \`'w+'\` | Write and read. Creates/overwrites file. |
| \`'a+'\` | Append and read. Creates file if needed. |

## Example: Opening a File

\`\`\`python
# Open file for reading
f = open("data/sample.txt", "r")

# Always close the file when done
f.close()
\`\`\`

## The with Statement (Recommended)

Using \`with\` automatically closes the file, even if errors occur:

\`\`\`python
# Recommended approach
with open("data/sample.txt", "r") as f:
    content = f.read()
    print(content)
# File is automatically closed here
\`\`\`

**Why use \`with\`?**
- Automatic cleanup
- No need to remember \`close()\`
- Handles exceptions gracefully`
      },
      {
        id: "python-file-handling-basics-3",
        title: "Reading from Files",
        type: "code",
        order: 3,
        content: `# Reading from Files

Python provides several methods to read file content.

## Method 1: read()

Reads the **entire file** as a single string.

\`\`\`python
with open("data/sample.txt", "r") as f:
    content = f.read()
    print(content)
\`\`\`

You can also specify the number of characters to read:

\`\`\`python
with open("data/sample.txt", "r") as f:
    first_10_chars = f.read(10)
    print(first_10_chars)
\`\`\`

## Method 2: readline()

Reads **one line** at a time.

\`\`\`python
with open("data/sample.txt", "r") as f:
    line1 = f.readline()  # First line
    line2 = f.readline()  # Second line
    print(line1)
    print(line2)
\`\`\`

## Method 3: readlines()

Reads **all lines** into a list.

\`\`\`python
with open("data/sample.txt", "r") as f:
    lines = f.readlines()
    for line in lines:
        print(line.strip())  # strip() removes \\n
\`\`\`

## Method 4: Iterate Directly

The most **memory-efficient** approach for large files:

\`\`\`python
with open("data/sample.txt", "r") as f:
    for line in f:
        print(line.strip())
\`\`\`

## Comparison

| Method | Returns | Memory | Use Case |
|--------|---------|--------|----------|
| \`read()\` | String | High | Small files |
| \`readline()\` | String | Low | Line by line |
| \`readlines()\` | List | High | Need all lines as list |
| Iteration | String | Low | Large files |`
      },
      {
        id: "python-file-handling-basics-4",
        title: "Writing to Files",
        type: "code",
        order: 4,
        content: `# Writing to Files

Python provides methods to write data to files.

## Method 1: write()

Writes a string to the file. **Does not add newlines automatically.**

\`\`\`python
# Write mode - creates new file or overwrites existing
with open("data/output.txt", "w") as f:
    f.write("Hello, World!")
    f.write("\\n")  # Add newline manually
    f.write("This is line 2")
\`\`\`

## Method 2: writelines()

Writes a list of strings. **Does not add newlines.**

\`\`\`python
lines = ["Line 1\\n", "Line 2\\n", "Line 3\\n"]

with open("data/output.txt", "w") as f:
    f.writelines(lines)
\`\`\`

## Append Mode

Add content without erasing existing data:

\`\`\`python
# Append mode - adds to end of file
with open("data/output.txt", "a") as f:
    f.write("\\nThis line is appended!")
\`\`\`

## Complete Example

\`\`\`python
# Create a simple log file
import datetime

def log_message(message):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open("data/log.txt", "a") as f:
        f.write(f"[{timestamp}] {message}\\n")

log_message("Program started")
log_message("Processing data...")
log_message("Program completed")
\`\`\`

## Important Notes

- **\`'w'\` mode erases existing content!** Use carefully.
- Always use \`\\n\` for newlines when writing.
- The \`with\` statement ensures data is written before closing.`
      },
      {
        id: "python-file-handling-basics-5",
        title: "Practice Exercise",
        type: "exercise",
        order: 5,
        content: `# Practice Exercise: Student Records

Now it's your turn! Create a program that manages student records.

## Task

Create a Python program that:
1. Reads student names and marks from user input
2. Saves them to a file called \`students.txt\`
3. Reads and displays all records from the file

## Expected Output Format

\`\`\`
Name: Alice, Marks: 85
Name: Bob, Marks: 92
Name: Charlie, Marks: 78
\`\`\`

## Starter Code

\`\`\`python
def add_student(name, marks):
    # Your code here - open file in append mode
    # Write the student name and marks
    pass

def display_all_students():
    # Your code here - open file in read mode
    # Read and print each line
    pass

# Test your functions
add_student("Alice", 85)
add_student("Bob", 92)
add_student("Charlie", 78)

print("\\n--- All Students ---")
display_all_students()
\`\`\`

## Solution

\`\`\`python
def add_student(name, marks):
    with open("data/students.txt", "a") as f:
        f.write(f"Name: {name}, Marks: {marks}\\n")

def display_all_students():
    try:
        with open("data/students.txt", "r") as f:
            for line in f:
                print(line.strip())
    except FileNotFoundError:
        print("No records found!")

# Test your functions
add_student("Alice", 85)
add_student("Bob", 92)
add_student("Charlie", 78)

print("\\n--- All Students ---")
display_all_students()
\`\`\`

Go to the **Python Lab** to try this exercise!`
      }
    ]
  },
  {
    id: "python-csv-files",
    slug: "python-csv-files",
    title: "Working with CSV Files",
    topic: "Python",
    summary: "Master reading and writing CSV files using Python's csv module for structured data.",
    order: 8,
    published: true,
    sections: [
      {
        id: "python-csv-files-1",
        title: "What are CSV Files?",
        type: "concept",
        order: 1,
        content: `# What are CSV Files?

**CSV** stands for **Comma-Separated Values**. It's a simple file format for storing tabular data (like spreadsheets).

## Structure of a CSV File

\`\`\`
name,age,city
Alice,20,Mumbai
Bob,22,Delhi
Charlie,21,Bangalore
\`\`\`

Each line is a **row**, and values are separated by **commas** (the delimiter).

## Why Use CSV?

- **Universal Format**: Supported by Excel, databases, and all programming languages
- **Human Readable**: Easy to open and edit in any text editor
- **Lightweight**: No complex formatting, just data
- **Data Exchange**: Perfect for importing/exporting data

## CSV vs Text Files

| Feature | Text File | CSV File |
|---------|-----------|----------|
| Structure | Free format | Tabular (rows/columns) |
| Delimiter | None | Comma (usually) |
| Best for | Documents, logs | Spreadsheet data |
| Parsing | Manual | Use csv module |

## The csv Module

Python's built-in \`csv\` module makes working with CSV files easy:

\`\`\`python
import csv
\`\`\`

This module handles:
- Proper comma handling (even within quoted strings)
- Different delimiters
- Header rows
- Edge cases in data`
      },
      {
        id: "python-csv-files-2",
        title: "Reading CSV Files",
        type: "code",
        order: 2,
        content: `# Reading CSV Files

Python's \`csv\` module provides two main ways to read CSV files.

## Method 1: csv.reader()

Returns each row as a **list** of strings.

\`\`\`python
import csv

with open("data/sample.csv", "r") as f:
    reader = csv.reader(f)
    
    for row in reader:
        print(row)  # Each row is a list
\`\`\`

**Output:**
\`\`\`
['name', 'age', 'city']
['Alice', '20', 'Mumbai']
['Bob', '22', 'Delhi']
\`\`\`

## Skipping the Header Row

\`\`\`python
import csv

with open("data/sample.csv", "r") as f:
    reader = csv.reader(f)
    header = next(reader)  # Skip header
    
    for row in reader:
        name = row[0]
        age = row[1]
        print(f"{name} is {age} years old")
\`\`\`

## Method 2: csv.DictReader()

Returns each row as a **dictionary** with header keys.

\`\`\`python
import csv

with open("data/sample.csv", "r") as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        print(row['name'], row['age'])
\`\`\`

**Advantages of DictReader:**
- Access values by column name (more readable)
- No need to remember column positions
- Header is handled automatically

## Complete Example

\`\`\`python
import csv

def read_student_data(filename):
    students = []
    
    with open(filename, "r") as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            student = {
                'name': row['name'],
                'age': int(row['age']),
                'marks': float(row['marks'])
            }
            students.append(student)
    
    return students

# Usage
students = read_student_data("data/students.csv")
for s in students:
    print(f"{s['name']}: {s['marks']} marks")
\`\`\``
      },
      {
        id: "python-csv-files-3",
        title: "Writing CSV Files",
        type: "code",
        order: 3,
        content: `# Writing CSV Files

## Method 1: csv.writer()

Write rows as lists.

\`\`\`python
import csv

# Data to write
students = [
    ['Alice', 20, 85],
    ['Bob', 22, 92],
    ['Charlie', 21, 78]
]

with open("data/output.csv", "w", newline="") as f:
    writer = csv.writer(f)
    
    # Write header
    writer.writerow(['name', 'age', 'marks'])
    
    # Write all data rows at once
    writer.writerows(students)
\`\`\`

> **Important**: Use \`newline=""\` on Windows to prevent extra blank lines.

## Method 2: csv.DictWriter()

Write rows from dictionaries.

\`\`\`python
import csv

students = [
    {'name': 'Alice', 'age': 20, 'marks': 85},
    {'name': 'Bob', 'age': 22, 'marks': 92},
    {'name': 'Charlie', 'age': 21, 'marks': 78}
]

with open("data/output.csv", "w", newline="") as f:
    fieldnames = ['name', 'age', 'marks']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    
    writer.writeheader()  # Write the header row
    writer.writerows(students)  # Write all data
\`\`\`

## Appending to CSV

\`\`\`python
import csv

new_student = {'name': 'Diana', 'age': 23, 'marks': 88}

with open("data/output.csv", "a", newline="") as f:
    fieldnames = ['name', 'age', 'marks']
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    
    writer.writerow(new_student)
\`\`\`

## Using Different Delimiters

\`\`\`python
import csv

# Using semicolon as delimiter
with open("data/european.csv", "w", newline="") as f:
    writer = csv.writer(f, delimiter=';')
    writer.writerow(['name', 'price'])
    writer.writerow(['Coffee', '2.50'])
\`\`\``
      }
    ]
  },
  {
    id: "python-binary-files",
    slug: "python-binary-files",
    title: "Binary Files with Pickle",
    topic: "Python",
    summary: "Learn to serialize Python objects to binary files using the pickle module.",
    order: 9,
    published: true,
    sections: [
      {
        id: "python-binary-files-1",
        title: "Introduction to Binary Files",
        type: "concept",
        order: 1,
        content: `# Introduction to Binary Files

## Text vs Binary Files

| Aspect | Text File | Binary File |
|--------|-----------|-------------|
| Content | Human-readable characters | Raw bytes (0s and 1s) |
| Size | Larger | Smaller |
| Speed | Slower I/O | Faster I/O |
| Portability | Universal | May be platform-specific |
| Use Cases | Documents, logs, CSV | Images, audio, serialized objects |

## What is Serialization?

**Serialization** (or "pickling" in Python) is the process of converting a Python object into a byte stream that can be:
- Saved to a file
- Sent over a network
- Stored in a database

**Deserialization** (or "unpickling") is the reverse process.

## Why Use Binary Files?

1. **Store Complex Objects**: Lists, dictionaries, custom objects
2. **Preserve Data Types**: Numbers remain numbers, not strings
3. **Efficiency**: Faster read/write operations
4. **Compact Storage**: Binary is more space-efficient

## The pickle Module

Python's \`pickle\` module handles serialization:

\`\`\`python
import pickle
\`\`\`

> **Security Warning**: Only unpickle data from trusted sources. Malicious pickle data can execute arbitrary code.`
      },
      {
        id: "python-binary-files-2",
        title: "Writing Binary Files",
        type: "code",
        order: 2,
        content: `# Writing Binary Files with pickle

## Basic Syntax

\`\`\`python
import pickle

# Open file in binary write mode ('wb')
with open("data/data.dat", "wb") as f:
    pickle.dump(data, f)
\`\`\`

## Example 1: Saving a Dictionary

\`\`\`python
import pickle

student = {
    'name': 'Alice',
    'age': 20,
    'marks': [85, 90, 88],
    'passed': True
}

with open("data/student.dat", "wb") as f:
    pickle.dump(student, f)

print("Data saved successfully!")
\`\`\`

## Example 2: Saving a List of Records

\`\`\`python
import pickle

students = [
    {'name': 'Alice', 'age': 20, 'marks': 85},
    {'name': 'Bob', 'age': 22, 'marks': 92},
    {'name': 'Charlie', 'age': 21, 'marks': 78}
]

with open("data/students.dat", "wb") as f:
    pickle.dump(students, f)

print(f"Saved {len(students)} student records")
\`\`\`

## Important Notes

- Always use **\`'wb'\`** mode (write binary)
- The file extension \`.dat\` is conventional but not required
- pickle can store almost any Python object`
      },
      {
        id: "python-binary-files-3",
        title: "Reading Binary Files",
        type: "code",
        order: 3,
        content: `# Reading Binary Files with pickle

## Basic Syntax

\`\`\`python
import pickle

# Open file in binary read mode ('rb')
with open("data/data.dat", "rb") as f:
    data = pickle.load(f)
\`\`\`

## Example 1: Loading a Dictionary

\`\`\`python
import pickle

with open("data/student.dat", "rb") as f:
    student = pickle.load(f)

print(f"Name: {student['name']}")
print(f"Age: {student['age']}")
print(f"Marks: {student['marks']}")
print(f"Passed: {student['passed']}")
\`\`\`

## Example 2: Loading a List of Records

\`\`\`python
import pickle

with open("data/students.dat", "rb") as f:
    students = pickle.load(f)

for student in students:
    print(f"{student['name']}: {student['marks']} marks")
\`\`\`

## Important Notes

- Always use **\`'rb'\`** mode (read binary)
- Load objects in the same order they were dumped
- Handle \`EOFError\` when reading multiple objects`
      }
    ]
  }
]

// ============================================
// SQL LESSONS
// ============================================

const sqlLessons: Lesson[] = [
  {
    id: "sql-introduction",
    slug: "sql-introduction",
    title: "Introduction to SQL",
    topic: "SQL",
    summary: "Understand what SQL is, why it's important, and learn about databases and tables.",
    order: 1,
    published: true,
    sections: [
      {
        id: "sql-introduction-1",
        title: "What is SQL?",
        type: "concept",
        order: 1,
        content: `# What is SQL?

**SQL** stands for **Structured Query Language**. It's the standard language for managing and manipulating **relational databases**.

## Why Learn SQL?

- **Universal**: Used by virtually every company that stores data
- **Powerful**: Query millions of records in milliseconds
- **Career Essential**: Required for developers, analysts, data scientists
- **Foundation**: Understanding databases is fundamental to software development

## What is a Database?

A **database** is an organized collection of data stored and accessed electronically. Think of it as a digital filing cabinet.

## Relational Databases

A **relational database** organizes data into **tables** with rows and columns, similar to spreadsheets.

\`\`\`
┌─────────────────────────────────┐
│          students               │
├──────┬──────────┬───────┬───────┤
│  id  │   name   │  age  │ grade │
├──────┼──────────┼───────┼───────┤
│  1   │  Alice   │  16   │  11   │
│  2   │  Bob     │  17   │  12   │
│  3   │  Charlie │  16   │  11   │
└──────┴──────────┴───────┴───────┘
\`\`\`

## Key Terms

| Term | Definition |
|------|------------|
| **Table** | A collection of related data organized in rows and columns |
| **Row** | A single record (also called a tuple) |
| **Column** | A single field/attribute of the data |
| **Primary Key** | Unique identifier for each row |
| **Query** | A request for data from the database |`
      },
      {
        id: "sql-introduction-2",
        title: "Your First SQL Query",
        type: "code",
        order: 2,
        content: `# Your First SQL Query

The most fundamental SQL command is **SELECT**, used to retrieve data from a table.

## Basic SELECT Syntax

\`\`\`sql
SELECT column1, column2 FROM table_name;
\`\`\`

## Select All Columns

Use \`*\` to select all columns:

\`\`\`sql
SELECT * FROM students;
\`\`\`

**Result:**
| id | name | age | grade |
|----|------|-----|-------|
| 1 | Alice | 16 | 11 |
| 2 | Bob | 17 | 12 |
| 3 | Charlie | 16 | 11 |

## Select Specific Columns

\`\`\`sql
SELECT name, grade FROM students;
\`\`\`

**Result:**
| name | grade |
|------|-------|
| Alice | 11 |
| Bob | 12 |
| Charlie | 11 |

## SQL Syntax Rules

1. SQL keywords are **not case-sensitive** (\`SELECT\` = \`select\`)
2. Table and column names may be case-sensitive (depends on database)
3. Statements end with a **semicolon** (\`;\`)
4. String values use **single quotes** (\`'Alice'\`)

## Try It Yourself

Go to the **SQL Lab** and try these queries:

\`\`\`sql
-- Create a simple table
CREATE TABLE students (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    age INT,
    grade INT
);

-- Insert some data
INSERT INTO students (id, name, age, grade) VALUES (1, 'Alice', 16, 11);
INSERT INTO students (id, name, age, grade) VALUES (2, 'Bob', 17, 12);

-- Query the data
SELECT * FROM students;
\`\`\``
      }
    ]
  },
  {
    id: "sql-filtering-data",
    slug: "sql-filtering-data",
    title: "Filtering Data with WHERE",
    topic: "SQL",
    summary: "Learn to filter query results using WHERE clause with various conditions and operators.",
    order: 2,
    published: true,
    sections: [
      {
        id: "sql-filtering-data-1",
        title: "The WHERE Clause",
        type: "concept",
        order: 1,
        content: `# The WHERE Clause

The **WHERE** clause filters rows based on specified conditions. Only rows that meet the condition are returned.

## Basic Syntax

\`\`\`sql
SELECT columns
FROM table_name
WHERE condition;
\`\`\`

## Simple Example

\`\`\`sql
-- Get students in grade 12
SELECT * FROM students WHERE grade = 12;
\`\`\`

## Comparison Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| \`=\` | Equal to | \`age = 18\` |
| \`<>\` or \`!=\` | Not equal to | \`status <> 'active'\` |
| \`<\` | Less than | \`price < 100\` |
| \`>\` | Greater than | \`quantity > 10\` |
| \`<=\` | Less than or equal | \`age <= 21\` |
| \`>=\` | Greater than or equal | \`marks >= 40\` |

## Examples

\`\`\`sql
-- Students older than 16
SELECT * FROM students WHERE age > 16;

-- Products under ₹500
SELECT * FROM products WHERE price < 500;

-- Orders not delivered
SELECT * FROM orders WHERE status != 'delivered';
\`\`\``
      },
      {
        id: "sql-filtering-data-2",
        title: "Logical Operators",
        type: "code",
        order: 2,
        content: `# Logical Operators: AND, OR, NOT

Combine multiple conditions using logical operators.

## AND Operator

Both conditions must be true:

\`\`\`sql
-- Students in grade 12 AND older than 16
SELECT * FROM students
WHERE grade = 12 AND age > 16;
\`\`\`

## OR Operator

At least one condition must be true:

\`\`\`sql
-- Students in grade 11 OR grade 12
SELECT * FROM students
WHERE grade = 11 OR grade = 12;
\`\`\`

## NOT Operator

Negates a condition:

\`\`\`sql
-- Students NOT in grade 12
SELECT * FROM students
WHERE NOT grade = 12;
\`\`\`

## Combining Operators

Use parentheses for complex conditions:

\`\`\`sql
-- Grade 12 students who are 17 OR 18 years old
SELECT * FROM students
WHERE grade = 12 AND (age = 17 OR age = 18);
\`\`\``
      },
      {
        id: "sql-filtering-data-3",
        title: "Special Operators",
        type: "code",
        order: 3,
        content: `# Special Operators: BETWEEN, IN, LIKE, IS NULL

SQL provides special operators for common filtering patterns.

## BETWEEN - Range Filtering

Check if a value is within a range (inclusive):

\`\`\`sql
-- Students aged 15 to 18
SELECT * FROM students
WHERE age BETWEEN 15 AND 18;
\`\`\`

## IN - Multiple Values

Check if a value matches any in a list:

\`\`\`sql
-- Students in grades 10, 11, or 12
SELECT * FROM students
WHERE grade IN (10, 11, 12);
\`\`\`

## LIKE - Pattern Matching

Use wildcards for flexible text matching:

| Wildcard | Meaning | Example |
|----------|---------|---------|
| \`%\` | Any characters (0 or more) | \`'A%'\` matches 'Alice', 'Amit' |
| \`_\` | Single character | \`'_ob'\` matches 'Bob', 'Rob' |

\`\`\`sql
-- Names starting with 'A'
SELECT * FROM students
WHERE name LIKE 'A%';

-- Names containing 'ar'
SELECT * FROM students
WHERE name LIKE '%ar%';
\`\`\`

## IS NULL / IS NOT NULL

Check for missing values:

\`\`\`sql
-- Products without a description
SELECT * FROM products
WHERE description IS NULL;

-- Customers with email addresses
SELECT * FROM customers
WHERE email IS NOT NULL;
\`\`\`

> **Note**: Use \`IS NULL\`, not \`= NULL\`. NULL isn't equal to anything, not even itself!`
      }
    ]
  },
  {
    id: "sql-modifying-data",
    slug: "sql-modifying-data",
    title: "INSERT, UPDATE, DELETE",
    topic: "SQL",
    summary: "Learn to add, modify, and remove data from database tables.",
    order: 3,
    published: true,
    sections: [
      {
        id: "sql-modifying-data-1",
        title: "INSERT - Adding Data",
        type: "code",
        order: 1,
        content: `# INSERT - Adding Data

The **INSERT** statement adds new rows to a table.

## Basic Syntax

\`\`\`sql
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
\`\`\`

## Example: Insert Single Row

\`\`\`sql
INSERT INTO students (id, name, age, grade)
VALUES (1, 'Alice', 16, 11);
\`\`\`

## Insert Multiple Rows

\`\`\`sql
INSERT INTO students (id, name, age, grade) VALUES
    (3, 'Charlie', 16, 11),
    (4, 'Diana', 17, 12),
    (5, 'Eve', 15, 10);
\`\`\``
      },
      {
        id: "sql-modifying-data-2",
        title: "UPDATE - Modifying Data",
        type: "code",
        order: 2,
        content: `# UPDATE - Modifying Data

The **UPDATE** statement modifies existing rows in a table.

## Basic Syntax

\`\`\`sql
UPDATE table_name
SET column1 = value1, column2 = value2
WHERE condition;
\`\`\`

> **Warning:** Always include a WHERE clause! Without it, ALL rows are updated.

## Example: Update Single Row

\`\`\`sql
-- Update Alice's grade
UPDATE students
SET grade = 12
WHERE name = 'Alice';
\`\`\`

## Update Multiple Columns

\`\`\`sql
UPDATE students
SET age = 17, grade = 12
WHERE id = 1;
\`\`\``
      },
      {
        id: "sql-modifying-data-3",
        title: "DELETE - Removing Data",
        type: "code",
        order: 3,
        content: `# DELETE - Removing Data

The **DELETE** statement removes rows from a table.

## Basic Syntax

\`\`\`sql
DELETE FROM table_name
WHERE condition;
\`\`\`

> **Warning:** Always include a WHERE clause! Without it, ALL rows are deleted.

## Example: Delete Single Row

\`\`\`sql
-- Delete student with id 5
DELETE FROM students
WHERE id = 5;
\`\`\`

## Delete Multiple Rows

\`\`\`sql
-- Delete all grade 10 students
DELETE FROM students
WHERE grade = 10;
\`\`\`

## Safe Practice

Before running DELETE, test your WHERE clause with SELECT:

\`\`\`sql
-- First, see what will be deleted
SELECT * FROM orders WHERE status = 'cancelled';

-- If correct, proceed with delete
DELETE FROM orders WHERE status = 'cancelled';
\`\`\``
      }
    ]
  },
  {
    id: "sql-sorting-limiting",
    slug: "sql-sorting-limiting",
    title: "Sorting and Limiting Results",
    topic: "SQL",
    summary: "Learn to sort query results with ORDER BY and limit rows with LIMIT.",
    order: 4,
    published: true,
    sections: [
      {
        id: "sql-sorting-limiting-1",
        title: "ORDER BY - Sorting Results",
        type: "code",
        order: 1,
        content: `# ORDER BY - Sorting Results

The **ORDER BY** clause sorts the result set by one or more columns.

## Basic Syntax

\`\`\`sql
SELECT columns
FROM table_name
ORDER BY column1 [ASC|DESC], column2 [ASC|DESC];
\`\`\`

- **ASC** = Ascending (A-Z, 1-100) - Default
- **DESC** = Descending (Z-A, 100-1)

## Sort Ascending (Default)

\`\`\`sql
-- Sort students by name A-Z
SELECT * FROM students
ORDER BY name;

-- Explicit ascending
SELECT * FROM students
ORDER BY name ASC;
\`\`\`

## Sort Descending

\`\`\`sql
-- Sort by age, oldest first
SELECT * FROM students
ORDER BY age DESC;
\`\`\`

## Sort by Multiple Columns

\`\`\`sql
-- Sort by grade (descending), then by age (ascending)
SELECT * FROM students
ORDER BY grade DESC, age ASC;
\`\`\``
      },
      {
        id: "sql-sorting-limiting-2",
        title: "LIMIT - Restricting Rows",
        type: "code",
        order: 2,
        content: `# LIMIT - Restricting Rows

The **LIMIT** clause restricts the number of rows returned.

## Basic Syntax

\`\`\`sql
SELECT columns
FROM table_name
LIMIT number;
\`\`\`

## Examples

\`\`\`sql
-- Get only first 5 rows
SELECT * FROM products
LIMIT 5;

-- Get top 3 most expensive products
SELECT * FROM products
ORDER BY price DESC
LIMIT 3;
\`\`\`

## LIMIT with OFFSET

Skip a number of rows before returning results:

\`\`\`sql
-- Skip first 5 rows, then return next 10
SELECT * FROM products
LIMIT 10 OFFSET 5;
\`\`\`

## Pagination Example

For a page that shows 10 items per page:

\`\`\`sql
-- Page 1 (rows 1-10)
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 0;

-- Page 2 (rows 11-20)
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 10;

-- Page 3 (rows 21-30)
SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 20;
\`\`\``
      }
    ]
  },
  // ============================================
  // MySQL LESSONS (Advanced SQL)
  // ============================================
  {
    id: "mysql-joins-mastery",
    slug: "mysql-joins-mastery",
    title: "MySQL JOINs Mastery",
    topic: "SQL",
    summary: "Master INNER, LEFT, RIGHT, and CROSS JOINs to combine data from multiple tables effectively.",
    order: 5,
    published: true,
    sections: [
      {
        id: "mysql-joins-1",
        title: "Understanding Table Relationships",
        type: "concept",
        order: 1,
        content: `# Understanding Table Relationships

In relational databases, data is organized across multiple tables that are **connected through relationships**. JOINs allow us to combine this related data.

## Why Multiple Tables?

Consider an e-commerce system. Instead of one massive table:

| order_id | customer_name | customer_email | product_name | product_price |
|----------|---------------|----------------|--------------|---------------|

We use **normalized** separate tables:

**customers**
| id | name | email |
|----|------|-------|
| 1 | Alice | alice@email.com |
| 2 | Bob | bob@email.com |

**orders**
| id | customer_id | product_id | quantity |
|----|-------------|------------|----------|
| 1 | 1 | 101 | 2 |
| 2 | 2 | 102 | 1 |

## Benefits of Normalization

- **No Data Duplication**: Customer info stored once
- **Easy Updates**: Change email in one place
- **Data Integrity**: Consistent information
- **Storage Efficiency**: Less redundant data

## Types of Relationships

1. **One-to-One**: One customer has one profile
2. **One-to-Many**: One customer has many orders
3. **Many-to-Many**: Many orders can have many products (via junction table)

## The JOIN Solution

JOINs let us **recombine** normalized tables when we need the full picture:

\`\`\`sql
-- Combine customer and order data
SELECT customers.name, orders.id, orders.quantity
FROM customers
JOIN orders ON customers.id = orders.customer_id;
\`\`\``
      },
      {
        id: "mysql-joins-2",
        title: "INNER JOIN",
        type: "code",
        order: 2,
        content: `# INNER JOIN

The **INNER JOIN** returns only rows that have matching values in **both** tables.

## Syntax

\`\`\`sql
SELECT columns
FROM table1
INNER JOIN table2 ON table1.column = table2.column;
\`\`\`

## Visual Representation

\`\`\`
    Table A         Table B
   ┌───────┐       ┌───────┐
   │       │       │       │
   │   ┌───┼───────┼───┐   │
   │   │   │ INNER │   │   │
   │   │   │ JOIN  │   │   │
   │   └───┼───────┼───┘   │
   │       │       │       │
   └───────┘       └───────┘
\`\`\`

Only the **intersection** (matching rows) is returned.

## Example: Customers and Orders

\`\`\`sql
-- Setup tables
CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    total DECIMAL(10,2),
    order_date DATE
);

INSERT INTO customers VALUES 
    (1, 'Alice', 'alice@email.com'),
    (2, 'Bob', 'bob@email.com'),
    (3, 'Charlie', 'charlie@email.com');

INSERT INTO orders VALUES 
    (101, 1, 150.00, '2024-01-15'),
    (102, 1, 89.99, '2024-01-20'),
    (103, 2, 299.50, '2024-01-22');

-- INNER JOIN: Only customers with orders
SELECT 
    c.name,
    c.email,
    o.id AS order_id,
    o.total,
    o.order_date
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
\`\`\`

**Result:**
| name | email | order_id | total | order_date |
|------|-------|----------|-------|------------|
| Alice | alice@email.com | 101 | 150.00 | 2024-01-15 |
| Alice | alice@email.com | 102 | 89.99 | 2024-01-20 |
| Bob | bob@email.com | 103 | 299.50 | 2024-01-22 |

> **Note**: Charlie doesn't appear because he has no orders!

## Table Aliases

Using \`c\` and \`o\` as **aliases** makes queries cleaner:

\`\`\`sql
-- Without aliases (verbose)
SELECT customers.name, orders.total
FROM customers
INNER JOIN orders ON customers.id = orders.customer_id;

-- With aliases (cleaner)
SELECT c.name, o.total
FROM customers c
INNER JOIN orders o ON c.id = o.customer_id;
\`\`\``
      },
      {
        id: "mysql-joins-3",
        title: "LEFT and RIGHT JOIN",
        type: "code",
        order: 3,
        content: `# LEFT and RIGHT JOIN

These JOINs return **all rows from one table** even if there's no match in the other.

## LEFT JOIN (LEFT OUTER JOIN)

Returns **all rows from the left table**, and matched rows from the right table. Unmatched right-side values become NULL.

\`\`\`sql
SELECT c.name, o.id AS order_id, o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
\`\`\`

**Result:**
| name | order_id | total |
|------|----------|-------|
| Alice | 101 | 150.00 |
| Alice | 102 | 89.99 |
| Bob | 103 | 299.50 |
| Charlie | NULL | NULL |

> Charlie appears with NULL values because he has no orders.

## RIGHT JOIN (RIGHT OUTER JOIN)

Returns **all rows from the right table**, and matched rows from the left table.

\`\`\`sql
SELECT c.name, o.id AS order_id, o.total
FROM customers c
RIGHT JOIN orders o ON c.id = o.customer_id;
\`\`\`

## Practical Use Cases

### Find Customers Without Orders

\`\`\`sql
SELECT c.name, c.email
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;
\`\`\`

### Find Products Never Ordered

\`\`\`sql
SELECT p.name, p.price
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE oi.id IS NULL;
\`\`\`

### Show All Employees and Their Departments

\`\`\`sql
SELECT e.name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.id;
\`\`\`

## Visual Comparison

\`\`\`
LEFT JOIN               RIGHT JOIN
┌───────┬───────┐       ┌───────┬───────┐
│▓▓▓▓▓▓▓│▓▓▓▓▓▓▓│       │       │▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓│▓▓▓▓▓▓▓│       │   ┌───┼───┐▓▓▓│
│▓▓▓┌───┼───┐▓▓▓│       │   │▓▓▓│▓▓▓│▓▓▓│
│▓▓▓│▓▓▓│   │▓▓▓│       │   │▓▓▓│▓▓▓│▓▓▓│
│▓▓▓└───┼───┘▓▓▓│       │   └───┼───┘▓▓▓│
│▓▓▓▓▓▓▓│       │       │       │▓▓▓▓▓▓▓│
└───────┴───────┘       └───────┴───────┘
  All A + matching B      All B + matching A
\`\`\``
      },
      {
        id: "mysql-joins-4",
        title: "Multiple JOINs and Self JOIN",
        type: "code",
        order: 4,
        content: `# Multiple JOINs and Self JOIN

## Joining Multiple Tables

Chain JOINs to combine three or more tables:

\`\`\`sql
-- Setup: Add products and order_items tables
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2)
);

CREATE TABLE order_items (
    id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT
);

INSERT INTO products VALUES 
    (1, 'Laptop', 999.99),
    (2, 'Mouse', 29.99),
    (3, 'Keyboard', 79.99);

INSERT INTO order_items VALUES 
    (1, 101, 1, 1),
    (2, 101, 2, 2),
    (3, 102, 3, 1);

-- Join 4 tables: customers → orders → order_items → products
SELECT 
    c.name AS customer,
    o.id AS order_id,
    p.name AS product,
    oi.quantity,
    (p.price * oi.quantity) AS line_total
FROM customers c
JOIN orders o ON c.id = o.customer_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
ORDER BY c.name, o.id;
\`\`\`

## Self JOIN

A table joined to **itself**. Useful for hierarchical data or comparing rows.

### Example: Employee Hierarchy

\`\`\`sql
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    manager_id INT
);

INSERT INTO employees VALUES 
    (1, 'John', NULL),      -- CEO, no manager
    (2, 'Sarah', 1),        -- Reports to John
    (3, 'Mike', 1),         -- Reports to John
    (4, 'Lisa', 2),         -- Reports to Sarah
    (5, 'Tom', 2);          -- Reports to Sarah

-- Find each employee and their manager
SELECT 
    e.name AS employee,
    m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
\`\`\`

**Result:**
| employee | manager |
|----------|---------|
| John | NULL |
| Sarah | John |
| Mike | John |
| Lisa | Sarah |
| Tom | Sarah |

### Example: Compare Products

Find products more expensive than another:

\`\`\`sql
SELECT 
    p1.name AS expensive_product,
    p1.price,
    p2.name AS cheaper_than
FROM products p1
JOIN products p2 ON p1.price > p2.price;
\`\`\``
      },
      {
        id: "mysql-joins-5",
        title: "Practice: E-Commerce Analysis",
        type: "exercise",
        order: 5,
        content: `# Practice: E-Commerce Analysis

Apply your JOIN skills to analyze e-commerce data!

## Scenario

You have tables for an online store:
- \`customers\` (id, name, email, city)
- \`orders\` (id, customer_id, total, status, created_at)
- \`products\` (id, name, price, category)
- \`order_items\` (id, order_id, product_id, quantity)

## Challenges

### Challenge 1: Customer Orders Report
Write a query to show each customer's name, their total number of orders, and total spending.

\`\`\`sql
-- Your solution:
SELECT 
    c.name,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total), 0) AS total_spent
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name
ORDER BY total_spent DESC;
\`\`\`

### Challenge 2: Popular Products
Find products that have been ordered, showing product name, times ordered, and total quantity sold.

\`\`\`sql
-- Your solution:
SELECT 
    p.name,
    COUNT(DISTINCT oi.order_id) AS times_ordered,
    SUM(oi.quantity) AS total_quantity
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_quantity DESC;
\`\`\`

### Challenge 3: Customers Without Orders
Find all customers who haven't placed any orders yet.

\`\`\`sql
-- Your solution:
SELECT c.name, c.email
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.id IS NULL;
\`\`\`

### Challenge 4: Full Order Details
Create a complete order report showing customer name, order date, product names, quantities, and line totals.

\`\`\`sql
-- Your solution:
SELECT 
    c.name AS customer,
    o.created_at AS order_date,
    p.name AS product,
    oi.quantity,
    (p.price * oi.quantity) AS line_total
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
ORDER BY o.created_at DESC, c.name;
\`\`\`

Go to the **SQL Lab** to practice these queries!`
      }
    ]
  },
  {
    id: "mysql-aggregate-functions",
    slug: "mysql-aggregate-functions",
    title: "Aggregate Functions & GROUP BY",
    topic: "SQL",
    summary: "Master COUNT, SUM, AVG, MIN, MAX and learn to group and filter aggregated data.",
    order: 6,
    published: true,
    sections: [
      {
        id: "mysql-agg-1",
        title: "Introduction to Aggregates",
        type: "concept",
        order: 1,
        content: `# Introduction to Aggregate Functions

Aggregate functions perform calculations on a **set of rows** and return a **single value**.

## Why Aggregates?

Instead of processing rows individually in your application:

\`\`\`python
# Slow and inefficient
total = 0
for order in all_orders:
    total += order.amount
\`\`\`

Let the database do the work:

\`\`\`sql
-- Fast and efficient
SELECT SUM(amount) FROM orders;
\`\`\`

## Common Aggregate Functions

| Function | Description | Example |
|----------|-------------|---------|
| \`COUNT()\` | Number of rows | \`COUNT(*)\` |
| \`SUM()\` | Total of values | \`SUM(price)\` |
| \`AVG()\` | Average of values | \`AVG(rating)\` |
| \`MIN()\` | Smallest value | \`MIN(price)\` |
| \`MAX()\` | Largest value | \`MAX(score)\` |

## Basic Examples

\`\`\`sql
-- Setup sample data
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    stock INT
);

INSERT INTO products VALUES 
    (1, 'Laptop', 'Electronics', 999.99, 50),
    (2, 'Mouse', 'Electronics', 29.99, 200),
    (3, 'Desk', 'Furniture', 299.99, 30),
    (4, 'Chair', 'Furniture', 199.99, 45),
    (5, 'Monitor', 'Electronics', 399.99, 75),
    (6, 'Keyboard', 'Electronics', 79.99, 150);

-- Total products
SELECT COUNT(*) AS total_products FROM products;

-- Average price
SELECT AVG(price) AS avg_price FROM products;

-- Price range
SELECT MIN(price) AS cheapest, MAX(price) AS most_expensive FROM products;

-- Total inventory value
SELECT SUM(price * stock) AS inventory_value FROM products;
\`\`\``
      },
      {
        id: "mysql-agg-2",
        title: "COUNT in Depth",
        type: "code",
        order: 2,
        content: `# COUNT in Depth

COUNT is the most frequently used aggregate function. Let's explore its variations.

## COUNT(*) vs COUNT(column)

\`\`\`sql
-- Setup with NULL values
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    department VARCHAR(50),
    bonus DECIMAL(10,2)
);

INSERT INTO employees VALUES 
    (1, 'Alice', 'alice@co.com', 'Engineering', 5000),
    (2, 'Bob', 'bob@co.com', 'Engineering', NULL),
    (3, 'Charlie', NULL, 'Marketing', 3000),
    (4, 'Diana', 'diana@co.com', 'Marketing', NULL),
    (5, 'Eve', 'eve@co.com', 'Engineering', 4500);
\`\`\`

### COUNT(*) - Counts All Rows

\`\`\`sql
SELECT COUNT(*) AS total_employees FROM employees;
-- Returns: 5
\`\`\`

### COUNT(column) - Ignores NULLs

\`\`\`sql
SELECT COUNT(email) AS with_email FROM employees;
-- Returns: 4 (Charlie has no email)

SELECT COUNT(bonus) AS with_bonus FROM employees;
-- Returns: 3 (Bob and Diana have no bonus)
\`\`\`

### COUNT(DISTINCT column) - Unique Values

\`\`\`sql
SELECT COUNT(DISTINCT department) AS num_departments FROM employees;
-- Returns: 2 (Engineering, Marketing)
\`\`\`

## Conditional Counting

Use CASE or IF to count conditionally:

\`\`\`sql
-- Count employees with and without bonuses
SELECT 
    COUNT(*) AS total,
    COUNT(bonus) AS with_bonus,
    COUNT(*) - COUNT(bonus) AS without_bonus
FROM employees;

-- Alternative using SUM with condition
SELECT 
    SUM(CASE WHEN bonus IS NOT NULL THEN 1 ELSE 0 END) AS with_bonus,
    SUM(CASE WHEN bonus IS NULL THEN 1 ELSE 0 END) AS without_bonus
FROM employees;
\`\`\`

## Counting with Filters

\`\`\`sql
-- Count engineers
SELECT COUNT(*) AS engineers
FROM employees
WHERE department = 'Engineering';

-- Count employees with bonus over 4000
SELECT COUNT(*) AS high_bonus
FROM employees
WHERE bonus > 4000;
\`\`\``
      },
      {
        id: "mysql-agg-3",
        title: "GROUP BY",
        type: "code",
        order: 3,
        content: `# GROUP BY

GROUP BY divides rows into groups and applies aggregate functions to each group.

## Basic Syntax

\`\`\`sql
SELECT column, AGGREGATE_FUNCTION(column)
FROM table
GROUP BY column;
\`\`\`

## Simple Grouping

\`\`\`sql
-- Count employees per department
SELECT 
    department,
    COUNT(*) AS employee_count
FROM employees
GROUP BY department;
\`\`\`

**Result:**
| department | employee_count |
|------------|----------------|
| Engineering | 3 |
| Marketing | 2 |

## Multiple Aggregates per Group

\`\`\`sql
-- Department statistics
SELECT 
    department,
    COUNT(*) AS employees,
    SUM(bonus) AS total_bonuses,
    AVG(bonus) AS avg_bonus,
    MAX(bonus) AS highest_bonus
FROM employees
GROUP BY department;
\`\`\`

## Grouping by Multiple Columns

\`\`\`sql
-- Orders by year and month
CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    total DECIMAL(10,2),
    created_at DATE
);

INSERT INTO orders VALUES 
    (1, 1, 150.00, '2024-01-15'),
    (2, 2, 200.00, '2024-01-20'),
    (3, 1, 75.00, '2024-02-10'),
    (4, 3, 300.00, '2024-02-15'),
    (5, 2, 125.00, '2024-02-20');

SELECT 
    YEAR(created_at) AS year,
    MONTH(created_at) AS month,
    COUNT(*) AS order_count,
    SUM(total) AS revenue
FROM orders
GROUP BY YEAR(created_at), MONTH(created_at)
ORDER BY year, month;
\`\`\`

## Important Rule

> Every column in SELECT must be either:
> 1. Inside an aggregate function, OR
> 2. Listed in GROUP BY

\`\`\`sql
-- WRONG: name is not aggregated or grouped
SELECT department, name, COUNT(*) FROM employees GROUP BY department;

-- CORRECT: All non-aggregated columns in GROUP BY
SELECT department, COUNT(*) FROM employees GROUP BY department;
\`\`\``
      },
      {
        id: "mysql-agg-4",
        title: "HAVING Clause",
        type: "code",
        order: 4,
        content: `# HAVING Clause

HAVING filters groups **after** aggregation. It's like WHERE, but for groups.

## WHERE vs HAVING

| Clause | Filters | Timing |
|--------|---------|--------|
| WHERE | Individual rows | Before grouping |
| HAVING | Groups | After grouping |

## Syntax

\`\`\`sql
SELECT column, AGGREGATE_FUNCTION(column)
FROM table
WHERE condition          -- Filter rows first
GROUP BY column
HAVING aggregate_condition  -- Filter groups after
ORDER BY column;
\`\`\`

## Examples

### Departments with More Than 2 Employees

\`\`\`sql
SELECT 
    department,
    COUNT(*) AS employee_count
FROM employees
GROUP BY department
HAVING COUNT(*) > 2;
\`\`\`

### Categories with Average Price Over $100

\`\`\`sql
SELECT 
    category,
    COUNT(*) AS products,
    AVG(price) AS avg_price
FROM products
GROUP BY category
HAVING AVG(price) > 100;
\`\`\`

### Combining WHERE and HAVING

\`\`\`sql
-- Find categories with high-value in-stock items
-- WHERE: Only products with stock > 20
-- HAVING: Only categories with avg price > 100
SELECT 
    category,
    COUNT(*) AS products,
    AVG(price) AS avg_price,
    SUM(stock) AS total_stock
FROM products
WHERE stock > 20            -- Filter rows first
GROUP BY category
HAVING AVG(price) > 100     -- Filter groups after
ORDER BY avg_price DESC;
\`\`\`

## Common Use Cases

\`\`\`sql
-- Customers who ordered more than 3 times
SELECT customer_id, COUNT(*) AS orders
FROM orders
GROUP BY customer_id
HAVING COUNT(*) > 3;

-- Products ordered in quantities over 100
SELECT product_id, SUM(quantity) AS total_ordered
FROM order_items
GROUP BY product_id
HAVING SUM(quantity) > 100;

-- Days with revenue over $1000
SELECT DATE(created_at) AS order_date, SUM(total) AS daily_revenue
FROM orders
GROUP BY DATE(created_at)
HAVING SUM(total) > 1000
ORDER BY order_date;
\`\`\``
      },
      {
        id: "mysql-agg-5",
        title: "Practice: Sales Analytics",
        type: "exercise",
        order: 5,
        content: `# Practice: Sales Analytics

Build real-world analytics queries using aggregates!

## Setup Data

\`\`\`sql
CREATE TABLE sales (
    id INT PRIMARY KEY,
    product VARCHAR(100),
    category VARCHAR(50),
    quantity INT,
    unit_price DECIMAL(10,2),
    sale_date DATE,
    region VARCHAR(50)
);

INSERT INTO sales VALUES 
    (1, 'Laptop', 'Electronics', 5, 999.99, '2024-01-15', 'North'),
    (2, 'Mouse', 'Electronics', 50, 29.99, '2024-01-15', 'South'),
    (3, 'Desk', 'Furniture', 10, 299.99, '2024-01-16', 'North'),
    (4, 'Chair', 'Furniture', 20, 199.99, '2024-01-16', 'East'),
    (5, 'Laptop', 'Electronics', 3, 999.99, '2024-01-17', 'West'),
    (6, 'Monitor', 'Electronics', 15, 399.99, '2024-01-17', 'North'),
    (7, 'Keyboard', 'Electronics', 30, 79.99, '2024-01-18', 'South'),
    (8, 'Desk', 'Furniture', 5, 299.99, '2024-01-18', 'East'),
    (9, 'Mouse', 'Electronics', 40, 29.99, '2024-01-19', 'North'),
    (10, 'Chair', 'Furniture', 15, 199.99, '2024-01-19', 'West');
\`\`\`

## Challenges

### Challenge 1: Category Summary
Show total revenue and units sold per category.

\`\`\`sql
SELECT 
    category,
    SUM(quantity) AS units_sold,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY category
ORDER BY revenue DESC;
\`\`\`

### Challenge 2: Daily Sales Report
Show sales count, units, and revenue for each day.

\`\`\`sql
SELECT 
    sale_date,
    COUNT(*) AS transactions,
    SUM(quantity) AS units,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY sale_date
ORDER BY sale_date;
\`\`\`

### Challenge 3: Top Regions
Find regions with total revenue over $3000.

\`\`\`sql
SELECT 
    region,
    SUM(quantity * unit_price) AS revenue
FROM sales
GROUP BY region
HAVING SUM(quantity * unit_price) > 3000
ORDER BY revenue DESC;
\`\`\`

### Challenge 4: Product Performance
Show average sale value per product, only for products sold more than once.

\`\`\`sql
SELECT 
    product,
    COUNT(*) AS times_sold,
    AVG(quantity * unit_price) AS avg_sale_value
FROM sales
GROUP BY product
HAVING COUNT(*) > 1
ORDER BY avg_sale_value DESC;
\`\`\`

Go to the **SQL Lab** to run these analytics queries!`
      }
    ]
  },
  {
    id: "mysql-subqueries",
    slug: "mysql-subqueries",
    title: "Subqueries & Nested Queries",
    topic: "SQL",
    summary: "Learn to write powerful nested queries, correlated subqueries, and use subqueries in different contexts.",
    order: 7,
    published: true,
    sections: [
      {
        id: "mysql-subq-1",
        title: "What are Subqueries?",
        type: "concept",
        order: 1,
        content: `# What are Subqueries?

A **subquery** (also called inner query or nested query) is a query inside another query.

## Why Use Subqueries?

Sometimes you need the result of one query to answer another:

1. "Find products priced above the **average price**"
2. "Find customers who placed the **most orders**"
3. "Find employees who earn more than **their department average**"

## Subquery Structure

\`\`\`sql
SELECT columns
FROM table
WHERE column OPERATOR (SELECT column FROM table WHERE condition);
--                      ↑ This is the subquery ↑
\`\`\`

The inner query runs **first**, then its result is used by the outer query.

## Types of Subqueries

| Type | Returns | Used With |
|------|---------|-----------|
| **Scalar** | Single value | =, >, <, etc. |
| **Row** | Single row | =, <>, etc. |
| **Table** | Multiple rows/columns | IN, ANY, ALL |
| **Correlated** | Depends on outer query | EXISTS, row-by-row |

## Where Can Subqueries Appear?

1. **In WHERE clause** (most common)
2. **In SELECT clause** (as computed column)
3. **In FROM clause** (as derived table)
4. **In HAVING clause** (filter groups)

## Simple Example

\`\`\`sql
-- Find products above average price
SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products);
\`\`\`

The subquery \`(SELECT AVG(price) FROM products)\` returns a single value (e.g., 334.99), then the outer query finds all products priced above that.`
      },
      {
        id: "mysql-subq-2",
        title: "Scalar and Single-Row Subqueries",
        type: "code",
        order: 2,
        content: `# Scalar and Single-Row Subqueries

## Scalar Subqueries

Return **exactly one value** (one row, one column).

### Example 1: Compare to Average

\`\`\`sql
-- Products priced above average
SELECT name, price, 
    price - (SELECT AVG(price) FROM products) AS above_avg
FROM products
WHERE price > (SELECT AVG(price) FROM products);
\`\`\`

### Example 2: Find Maximum

\`\`\`sql
-- Employee(s) with highest salary
SELECT name, salary
FROM employees
WHERE salary = (SELECT MAX(salary) FROM employees);
\`\`\`

### Example 3: Latest Order

\`\`\`sql
-- Customer who placed the most recent order
SELECT c.name, o.created_at
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.created_at = (SELECT MAX(created_at) FROM orders);
\`\`\`

## Subquery in SELECT

Add calculated columns using subqueries:

\`\`\`sql
-- Show each product with the average price for comparison
SELECT 
    name,
    price,
    (SELECT AVG(price) FROM products) AS avg_price,
    price - (SELECT AVG(price) FROM products) AS difference
FROM products;
\`\`\`

**Result:**
| name | price | avg_price | difference |
|------|-------|-----------|------------|
| Laptop | 999.99 | 334.99 | 665.00 |
| Mouse | 29.99 | 334.99 | -305.00 |
| ... | ... | ... | ... |

## Subquery with Comparison Operators

\`\`\`sql
-- Employees earning more than Bob
SELECT name, salary
FROM employees
WHERE salary > (
    SELECT salary FROM employees WHERE name = 'Bob'
);

-- Orders larger than average order
SELECT id, total
FROM orders
WHERE total > (SELECT AVG(total) FROM orders);
\`\`\``
      },
      {
        id: "mysql-subq-3",
        title: "Multi-Row Subqueries: IN, ANY, ALL",
        type: "code",
        order: 3,
        content: `# Multi-Row Subqueries: IN, ANY, ALL

When a subquery returns **multiple values**, use these operators.

## IN Operator

Matches if value is **in the list** returned by subquery:

\`\`\`sql
-- Customers who have placed orders
SELECT name, email
FROM customers
WHERE id IN (SELECT DISTINCT customer_id FROM orders);

-- Products that have been ordered
SELECT name, price
FROM products
WHERE id IN (SELECT DISTINCT product_id FROM order_items);

-- Employees in departments located in New York
SELECT name, department_id
FROM employees
WHERE department_id IN (
    SELECT id FROM departments WHERE location = 'New York'
);
\`\`\`

## NOT IN Operator

Matches if value is **not in the list**:

\`\`\`sql
-- Customers who have NOT placed orders
SELECT name, email
FROM customers
WHERE id NOT IN (SELECT DISTINCT customer_id FROM orders);

-- Products never ordered
SELECT name, price
FROM products
WHERE id NOT IN (SELECT product_id FROM order_items);
\`\`\`

> **Warning**: NOT IN behaves unexpectedly with NULL values. Use NOT EXISTS instead if NULLs are possible.

## ANY (SOME) Operator

True if comparison is true for **any** value in the list:

\`\`\`sql
-- Products more expensive than ANY furniture item
SELECT name, price
FROM products
WHERE price > ANY (
    SELECT price FROM products WHERE category = 'Furniture'
);
-- Same as: price > MIN(furniture prices)
\`\`\`

## ALL Operator

True if comparison is true for **all** values in the list:

\`\`\`sql
-- Products more expensive than ALL furniture items
SELECT name, price
FROM products
WHERE price > ALL (
    SELECT price FROM products WHERE category = 'Furniture'
);
-- Same as: price > MAX(furniture prices)

-- Find the highest-paid employee (salary >= all salaries)
SELECT name, salary
FROM employees
WHERE salary >= ALL (SELECT salary FROM employees);
\`\`\``
      },
      {
        id: "mysql-subq-4",
        title: "Correlated Subqueries",
        type: "code",
        order: 4,
        content: `# Correlated Subqueries

A correlated subquery **references the outer query**. It runs once for each row in the outer query.

## How They Work

\`\`\`sql
SELECT outer_column
FROM outer_table o
WHERE condition OPERATOR (
    SELECT inner_column 
    FROM inner_table 
    WHERE inner_table.col = o.outer_column  -- References outer query!
);
\`\`\`

## Example 1: Above Department Average

Find employees earning above their **department's** average:

\`\`\`sql
SELECT e.name, e.department, e.salary
FROM employees e
WHERE e.salary > (
    SELECT AVG(salary) 
    FROM employees 
    WHERE department = e.department  -- Correlated!
);
\`\`\`

For each employee, the subquery calculates that specific department's average.

## Example 2: Latest Order per Customer

\`\`\`sql
SELECT o.customer_id, o.id, o.total, o.created_at
FROM orders o
WHERE o.created_at = (
    SELECT MAX(created_at)
    FROM orders
    WHERE customer_id = o.customer_id  -- Same customer
);
\`\`\`

## EXISTS Operator

Returns TRUE if subquery returns **any rows**:

\`\`\`sql
-- Customers who have placed at least one order
SELECT c.name, c.email
FROM customers c
WHERE EXISTS (
    SELECT 1 
    FROM orders 
    WHERE customer_id = c.id
);

-- Customers with NO orders
SELECT c.name, c.email
FROM customers c
WHERE NOT EXISTS (
    SELECT 1 
    FROM orders 
    WHERE customer_id = c.id
);
\`\`\`

## EXISTS vs IN

| Aspect | EXISTS | IN |
|--------|--------|-----|
| With NULLs | Works correctly | May give wrong results |
| Large subquery | Often faster | Can be slower |
| Correlated | Yes | Not required |

\`\`\`sql
-- These are equivalent, but EXISTS handles NULLs better:
-- Using IN
SELECT * FROM customers WHERE id IN (SELECT customer_id FROM orders);

-- Using EXISTS
SELECT * FROM customers c 
WHERE EXISTS (SELECT 1 FROM orders WHERE customer_id = c.id);
\`\`\``
      },
      {
        id: "mysql-subq-5",
        title: "Subqueries in FROM (Derived Tables)",
        type: "code",
        order: 5,
        content: `# Subqueries in FROM (Derived Tables)

A subquery in the FROM clause creates a **temporary table** you can query against.

## Syntax

\`\`\`sql
SELECT columns
FROM (
    SELECT columns FROM table WHERE condition
) AS derived_table_alias  -- Alias is REQUIRED!
WHERE condition;
\`\`\`

## Example 1: Query Aggregated Results

\`\`\`sql
-- Find customers with above-average order count
SELECT customer_name, order_count
FROM (
    SELECT 
        c.name AS customer_name,
        COUNT(o.id) AS order_count
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id, c.name
) AS customer_orders
WHERE order_count > (SELECT AVG(cnt) FROM (
    SELECT COUNT(*) AS cnt FROM orders GROUP BY customer_id
) AS avg_calc);
\`\`\`

## Example 2: Calculate Running Statistics

\`\`\`sql
-- Daily sales with comparison to overall average
SELECT 
    daily.sale_date,
    daily.daily_revenue,
    overall.avg_revenue,
    daily.daily_revenue - overall.avg_revenue AS vs_average
FROM (
    SELECT 
        DATE(created_at) AS sale_date,
        SUM(total) AS daily_revenue
    FROM orders
    GROUP BY DATE(created_at)
) AS daily
CROSS JOIN (
    SELECT AVG(daily_sum) AS avg_revenue
    FROM (
        SELECT SUM(total) AS daily_sum
        FROM orders
        GROUP BY DATE(created_at)
    ) AS daily_totals
) AS overall
ORDER BY daily.sale_date;
\`\`\`

## Example 3: Top N per Group

Find top 2 products by revenue in each category:

\`\`\`sql
SELECT category, product_name, revenue
FROM (
    SELECT 
        p.category,
        p.name AS product_name,
        SUM(oi.quantity * p.price) AS revenue,
        ROW_NUMBER() OVER (PARTITION BY p.category ORDER BY SUM(oi.quantity * p.price) DESC) AS rn
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.category, p.name
) AS ranked
WHERE rn <= 2;
\`\`\`

## Best Practices

1. **Always use aliases** for derived tables
2. **Keep subqueries simple** - complex nested queries are hard to debug
3. **Consider CTEs** (WITH clause) for better readability
4. **Check performance** - sometimes JOINs are faster`
      },
      {
        id: "mysql-subq-6",
        title: "Practice: Complex Queries",
        type: "exercise",
        order: 6,
        content: `# Practice: Complex Queries with Subqueries

## Challenges

### Challenge 1: Above Average Products
Find all products priced above the average price, showing how much above:

\`\`\`sql
SELECT 
    name, 
    price,
    ROUND(price - (SELECT AVG(price) FROM products), 2) AS above_avg
FROM products
WHERE price > (SELECT AVG(price) FROM products)
ORDER BY above_avg DESC;
\`\`\`

### Challenge 2: Customers with Orders
Find customers who have placed at least one order (using EXISTS):

\`\`\`sql
SELECT c.name, c.email
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders WHERE customer_id = c.id
);
\`\`\`

### Challenge 3: Department Top Earners
Find employees who earn the most in their department:

\`\`\`sql
SELECT e.name, e.department, e.salary
FROM employees e
WHERE e.salary = (
    SELECT MAX(salary)
    FROM employees
    WHERE department = e.department
);
\`\`\`

### Challenge 4: Products Never Ordered
Find products that have never been ordered:

\`\`\`sql
-- Using NOT IN
SELECT name, price
FROM products
WHERE id NOT IN (
    SELECT DISTINCT product_id FROM order_items
);

-- Using NOT EXISTS (safer with NULLs)
SELECT p.name, p.price
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM order_items WHERE product_id = p.id
);
\`\`\`

### Challenge 5: Customer Ranking
Rank customers by total spending:

\`\`\`sql
SELECT 
    customer_name,
    total_spent,
    RANK() OVER (ORDER BY total_spent DESC) AS spending_rank
FROM (
    SELECT 
        c.name AS customer_name,
        COALESCE(SUM(o.total), 0) AS total_spent
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    GROUP BY c.id, c.name
) AS spending;
\`\`\`

Go to the **SQL Lab** to master subqueries!`
      }
    ]
  },
  {
    id: "mysql-indexes-performance",
    slug: "mysql-indexes-performance",
    title: "Indexes & Query Performance",
    topic: "SQL",
    summary: "Understand how indexes work, when to use them, and how to optimize query performance.",
    order: 8,
    published: true,
    sections: [
      {
        id: "mysql-idx-1",
        title: "Understanding Indexes",
        type: "concept",
        order: 1,
        content: `# Understanding Indexes

An **index** is a data structure that improves the speed of data retrieval operations.

## The Book Analogy

Think of a database table as a book:
- **Without an index**: To find "MySQL", read every page (full table scan)
- **With an index**: Look up "MySQL" in the back index, go directly to page 127

## How Indexes Work

\`\`\`
Table (without index):        B-Tree Index on 'name':
┌─────┬──────────┐            
│ id  │  name    │                    [M]
├─────┼──────────┤                   /   \\
│  1  │  Zack    │                [D]     [T]
│  2  │  Alice   │               / \\     / \\
│  3  │  Mike    │            [A] [J] [N] [Z]
│  4  │  Diana   │             ↓   ↓   ↓   ↓
│  5  │  Tom     │            id  id  id  id
└─────┴──────────┘            2   ?   3   1,5
\`\`\`

The index stores sorted values with pointers to actual rows.

## Benefits of Indexes

1. **Faster SELECTs**: O(log n) instead of O(n) lookups
2. **Efficient sorting**: ORDER BY uses index order
3. **Quick joins**: Match rows faster
4. **Unique constraints**: Enforce uniqueness efficiently

## Costs of Indexes

1. **Storage space**: Indexes take disk space
2. **Slower writes**: INSERT/UPDATE/DELETE must update indexes
3. **Maintenance**: Indexes can become fragmented

## Types of Indexes in MySQL

| Type | Description | Use Case |
|------|-------------|----------|
| **PRIMARY KEY** | Unique, not null, one per table | Row identifier |
| **UNIQUE** | Unique values allowed | Email, username |
| **INDEX** (regular) | Non-unique values | Foreign keys, search columns |
| **FULLTEXT** | Text search | Article content, descriptions |
| **COMPOSITE** | Multiple columns | Multi-column searches |`
      },
      {
        id: "mysql-idx-2",
        title: "Creating and Managing Indexes",
        type: "code",
        order: 2,
        content: `# Creating and Managing Indexes

## Creating Indexes

### During Table Creation

\`\`\`sql
CREATE TABLE users (
    id INT PRIMARY KEY,                    -- Primary key index
    email VARCHAR(255) UNIQUE,             -- Unique index
    username VARCHAR(50),
    created_at DATETIME,
    INDEX idx_username (username),         -- Regular index
    INDEX idx_created (created_at)
);
\`\`\`

### After Table Creation

\`\`\`sql
-- Create a regular index
CREATE INDEX idx_lastname ON customers(last_name);

-- Create a unique index
CREATE UNIQUE INDEX idx_email ON customers(email);

-- Create composite index (multiple columns)
CREATE INDEX idx_name ON customers(last_name, first_name);
\`\`\`

## Viewing Indexes

\`\`\`sql
-- Show all indexes on a table
SHOW INDEX FROM customers;

-- Alternative
SHOW INDEXES FROM customers;
\`\`\`

## Dropping Indexes

\`\`\`sql
-- Drop an index
DROP INDEX idx_lastname ON customers;

-- Drop primary key (careful!)
ALTER TABLE customers DROP PRIMARY KEY;
\`\`\`

## Composite Indexes

Order matters! A composite index on (A, B, C) can be used for:
- Queries on A
- Queries on A and B
- Queries on A, B, and C

But NOT efficiently for:
- Queries on B alone
- Queries on C alone
- Queries on B and C

\`\`\`sql
-- Create composite index
CREATE INDEX idx_location ON stores(country, city, zip_code);

-- Uses index
SELECT * FROM stores WHERE country = 'USA';
SELECT * FROM stores WHERE country = 'USA' AND city = 'New York';

-- Does NOT use index efficiently
SELECT * FROM stores WHERE city = 'New York';
SELECT * FROM stores WHERE zip_code = '10001';
\`\`\``
      },
      {
        id: "mysql-idx-3",
        title: "EXPLAIN and Query Analysis",
        type: "code",
        order: 3,
        content: `# EXPLAIN and Query Analysis

EXPLAIN shows how MySQL executes a query - essential for optimization!

## Basic EXPLAIN

\`\`\`sql
EXPLAIN SELECT * FROM customers WHERE email = 'alice@email.com';
\`\`\`

## Key EXPLAIN Columns

| Column | Meaning |
|--------|---------|
| **type** | Join type (system > const > ref > range > index > ALL) |
| **possible_keys** | Indexes that could be used |
| **key** | Index actually used |
| **rows** | Estimated rows to examine |
| **Extra** | Additional information |

## Type Values (Best to Worst)

\`\`\`sql
-- const: Uses primary key or unique index (best)
EXPLAIN SELECT * FROM customers WHERE id = 1;

-- ref: Uses non-unique index
EXPLAIN SELECT * FROM orders WHERE customer_id = 1;

-- range: Uses index for range
EXPLAIN SELECT * FROM products WHERE price BETWEEN 100 AND 500;

-- index: Full index scan
EXPLAIN SELECT COUNT(*) FROM customers;

-- ALL: Full table scan (worst - avoid!)
EXPLAIN SELECT * FROM customers WHERE first_name = 'Alice';
\`\`\`

## Analyzing Slow Queries

\`\`\`sql
-- Before adding index (type: ALL, full scan)
EXPLAIN SELECT * FROM orders WHERE customer_id = 5;
-- rows: 10000 (examines all rows)

-- Add index
CREATE INDEX idx_customer ON orders(customer_id);

-- After adding index (type: ref)
EXPLAIN SELECT * FROM orders WHERE customer_id = 5;
-- rows: 15 (examines only matching rows)
\`\`\`

## EXPLAIN ANALYZE (MySQL 8.0+)

Shows actual execution time:

\`\`\`sql
EXPLAIN ANALYZE 
SELECT c.name, COUNT(o.id) 
FROM customers c 
JOIN orders o ON c.id = o.customer_id 
GROUP BY c.id;
\`\`\``
      },
      {
        id: "mysql-idx-4",
        title: "Index Best Practices",
        type: "concept",
        order: 4,
        content: `# Index Best Practices

## When to Create Indexes

### DO Create Indexes For:

1. **Primary keys** (automatic)
2. **Foreign keys** (join columns)
3. **Columns in WHERE clauses**
4. **Columns in JOIN conditions**
5. **Columns in ORDER BY**
6. **Columns in GROUP BY**

\`\`\`sql
-- Foreign key - definitely index
CREATE INDEX idx_order_customer ON orders(customer_id);

-- Frequently searched
CREATE INDEX idx_product_category ON products(category);

-- Used in ORDER BY
CREATE INDEX idx_order_date ON orders(created_at);
\`\`\`

### DON'T Create Indexes For:

1. **Small tables** (full scan is fine)
2. **Rarely queried columns**
3. **Columns with few unique values** (gender, status)
4. **Frequently updated columns**
5. **Wide columns** (long text)

## Index Optimization Tips

### 1. Use Covering Indexes

Include all needed columns so MySQL reads only the index:

\`\`\`sql
-- Query needs name and email
SELECT name, email FROM customers WHERE status = 'active';

-- Covering index includes all columns
CREATE INDEX idx_covering ON customers(status, name, email);
\`\`\`

### 2. Index Selectivity

High selectivity = more unique values = better index:

\`\`\`sql
-- Good: email is unique
CREATE INDEX idx_email ON users(email);

-- Poor: status has only 3 values (active, inactive, pending)
CREATE INDEX idx_status ON users(status);  -- Usually not helpful
\`\`\`

### 3. Leftmost Prefix Rule

For composite indexes, queries must use leftmost columns:

\`\`\`sql
CREATE INDEX idx_composite ON orders(status, created_at, total);

-- Uses index (starts with status)
WHERE status = 'completed'
WHERE status = 'completed' AND created_at > '2024-01-01'

-- Cannot use index efficiently
WHERE created_at > '2024-01-01'
WHERE total > 100
\`\`\`

### 4. Avoid Functions on Indexed Columns

\`\`\`sql
-- Cannot use index (function on column)
SELECT * FROM orders WHERE YEAR(created_at) = 2024;

-- Can use index
SELECT * FROM orders 
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
\`\`\``
      },
      {
        id: "mysql-idx-5",
        title: "Practice: Performance Optimization",
        type: "exercise",
        order: 5,
        content: `# Practice: Performance Optimization

## Scenario

You have an e-commerce database with performance issues. Optimize it!

## Setup

\`\`\`sql
CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(200),
    category VARCHAR(50),
    price DECIMAL(10,2),
    stock INT,
    created_at DATETIME
);

CREATE TABLE orders (
    id INT PRIMARY KEY,
    customer_id INT,
    status VARCHAR(20),
    total DECIMAL(10,2),
    created_at DATETIME
);

CREATE TABLE order_items (
    id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10,2)
);
\`\`\`

## Challenge 1: Analyze This Query

\`\`\`sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 100;
-- Likely shows: type=ALL (full table scan)
\`\`\`

**Solution:**
\`\`\`sql
CREATE INDEX idx_orders_customer ON orders(customer_id);
\`\`\`

## Challenge 2: Optimize Category Search

\`\`\`sql
-- This query is slow:
SELECT * FROM products WHERE category = 'Electronics' ORDER BY price;
\`\`\`

**Solution:**
\`\`\`sql
-- Composite index for WHERE and ORDER BY
CREATE INDEX idx_products_cat_price ON products(category, price);
\`\`\`

## Challenge 3: Order Items Join

\`\`\`sql
-- Slow join:
SELECT o.id, SUM(oi.quantity * oi.unit_price)
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY o.id;
\`\`\`

**Solution:**
\`\`\`sql
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_items_order ON order_items(order_id);
\`\`\`

## Challenge 4: Date Range Query

\`\`\`sql
-- This is slow:
SELECT * FROM orders 
WHERE YEAR(created_at) = 2024 AND MONTH(created_at) = 1;
\`\`\`

**Solution:**
\`\`\`sql
-- Rewrite to use index:
SELECT * FROM orders 
WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';

-- Add index
CREATE INDEX idx_orders_date ON orders(created_at);
\`\`\`

## Verification

Always verify with EXPLAIN:

\`\`\`sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 100;
-- Should show: type=ref, key=idx_orders_customer
\`\`\`

Go to the **SQL Lab** to practice query optimization!`
      }
    ]
  },
  {
    id: "mysql-transactions",
    slug: "mysql-transactions",
    title: "Transactions & Data Integrity",
    topic: "SQL",
    summary: "Master ACID properties, transaction control, locking, and ensure data consistency in concurrent environments.",
    order: 9,
    published: true,
    sections: [
      {
        id: "mysql-tx-1",
        title: "What are Transactions?",
        type: "concept",
        order: 1,
        content: `# What are Transactions?

A **transaction** is a sequence of operations performed as a **single logical unit of work**.

## The Classic Example: Bank Transfer

Transfer $100 from Alice to Bob:

\`\`\`sql
-- Step 1: Subtract from Alice
UPDATE accounts SET balance = balance - 100 WHERE name = 'Alice';

-- Step 2: Add to Bob
UPDATE accounts SET balance = balance + 100 WHERE name = 'Bob';
\`\`\`

**What if the system crashes after Step 1?**
- Alice loses $100
- Bob doesn't receive anything
- Money disappears!

## Transactions to the Rescue

\`\`\`sql
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE name = 'Alice';
UPDATE accounts SET balance = balance + 100 WHERE name = 'Bob';

COMMIT;  -- Both succeed, or neither does
\`\`\`

## ACID Properties

Every transaction guarantees:

| Property | Meaning | Example |
|----------|---------|---------|
| **A**tomicity | All or nothing | Both updates happen, or neither |
| **C**onsistency | Valid state to valid state | Total money stays the same |
| **I**solation | Transactions don't interfere | Others don't see partial transfer |
| **D**urability | Committed = permanent | Survives crashes |

## When to Use Transactions

1. **Financial operations** (transfers, payments)
2. **Multi-table updates** (order + inventory)
3. **Data integrity requirements** (user + profile creation)
4. **Batch operations** (bulk inserts with validation)

## Transaction States

\`\`\`
   BEGIN
     ↓
  [Active] ←──────┐
     ↓            │
  Operations   Rollback
     ↓            ↑
  ┌─────────────────┐
  │ COMMIT or ERROR │
  └─────────────────┘
     ↓            ↓
[Committed]  [Aborted]
\`\`\``
      },
      {
        id: "mysql-tx-2",
        title: "Transaction Control Statements",
        type: "code",
        order: 2,
        content: `# Transaction Control Statements

## Basic Transaction Commands

### START TRANSACTION

Begins a new transaction:

\`\`\`sql
START TRANSACTION;
-- or
BEGIN;
-- or
BEGIN WORK;
\`\`\`

### COMMIT

Saves all changes permanently:

\`\`\`sql
START TRANSACTION;

INSERT INTO orders (customer_id, total) VALUES (1, 150.00);
UPDATE inventory SET stock = stock - 1 WHERE product_id = 101;

COMMIT;  -- Changes are now permanent
\`\`\`

### ROLLBACK

Undoes all changes in the transaction:

\`\`\`sql
START TRANSACTION;

DELETE FROM orders WHERE id = 1;
-- Oops! Wrong order!

ROLLBACK;  -- Nothing was deleted
\`\`\`

## Practical Example: Order Processing

\`\`\`sql
START TRANSACTION;

-- Create order
INSERT INTO orders (customer_id, total, status) 
VALUES (1, 299.99, 'pending');

SET @order_id = LAST_INSERT_ID();

-- Add items
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (@order_id, 101, 2, 149.99);

-- Check inventory
SELECT stock INTO @current_stock FROM products WHERE id = 101;

-- Validate and update
IF @current_stock >= 2 THEN
    UPDATE products SET stock = stock - 2 WHERE id = 101;
    UPDATE orders SET status = 'confirmed' WHERE id = @order_id;
    COMMIT;
ELSE
    ROLLBACK;
END IF;
\`\`\`

## SAVEPOINT for Partial Rollback

\`\`\`sql
START TRANSACTION;

INSERT INTO users (name) VALUES ('Alice');
SAVEPOINT after_user;

INSERT INTO profiles (user_id, bio) VALUES (LAST_INSERT_ID(), 'Hello');
-- Error occurs here!

ROLLBACK TO SAVEPOINT after_user;
-- User is still inserted, only profile is undone

INSERT INTO profiles (user_id, bio) VALUES (@user_id, 'Fixed bio');

COMMIT;
\`\`\`

## Auto-commit Mode

By default, MySQL auto-commits each statement:

\`\`\`sql
-- Check current setting
SELECT @@autocommit;

-- Disable auto-commit
SET autocommit = 0;

-- Now you must explicitly COMMIT
INSERT INTO logs (message) VALUES ('Event 1');
INSERT INTO logs (message) VALUES ('Event 2');
COMMIT;  -- Required!

-- Re-enable auto-commit
SET autocommit = 1;
\`\`\``
      },
      {
        id: "mysql-tx-3",
        title: "Isolation Levels",
        type: "concept",
        order: 3,
        content: `# Isolation Levels

Isolation levels control how transactions interact with each other.

## Concurrency Problems

### 1. Dirty Read
Reading uncommitted data from another transaction.

\`\`\`
Transaction A:              Transaction B:
UPDATE price = 100          
                           SELECT price → 100 (uncommitted!)
ROLLBACK (price back to 50)
                           Uses 100 (wrong!)
\`\`\`

### 2. Non-Repeatable Read
Same query returns different results within one transaction.

\`\`\`
Transaction A:              Transaction B:
SELECT price → 50          
                           UPDATE price = 100
                           COMMIT
SELECT price → 100 (changed!)
\`\`\`

### 3. Phantom Read
New rows appear in repeated queries.

\`\`\`
Transaction A:              Transaction B:
SELECT COUNT(*) → 10       
                           INSERT new row
                           COMMIT
SELECT COUNT(*) → 11 (phantom!)
\`\`\`

## MySQL Isolation Levels

| Level | Dirty Read | Non-Repeatable | Phantom |
|-------|------------|----------------|---------|
| READ UNCOMMITTED | ✓ Possible | ✓ Possible | ✓ Possible |
| READ COMMITTED | ✗ Prevented | ✓ Possible | ✓ Possible |
| REPEATABLE READ | ✗ Prevented | ✗ Prevented | ✓ Possible |
| SERIALIZABLE | ✗ Prevented | ✗ Prevented | ✗ Prevented |

## Setting Isolation Level

\`\`\`sql
-- Check current level
SELECT @@transaction_isolation;

-- Set for session
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- Set for next transaction only
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Set globally (requires privileges)
SET GLOBAL TRANSACTION ISOLATION LEVEL REPEATABLE READ;
\`\`\`

## Choosing the Right Level

| Use Case | Recommended Level |
|----------|-------------------|
| Reports on live data | READ COMMITTED |
| Financial transactions | SERIALIZABLE |
| General applications | REPEATABLE READ (MySQL default) |
| Maximum performance | READ UNCOMMITTED (rarely!) |

> **MySQL Default**: REPEATABLE READ - good balance of consistency and performance.`
      },
      {
        id: "mysql-tx-4",
        title: "Locking Mechanisms",
        type: "code",
        order: 4,
        content: `# Locking Mechanisms

Locks prevent conflicts when multiple transactions access the same data.

## Types of Locks

### Shared Lock (Read Lock)
Multiple transactions can read simultaneously:

\`\`\`sql
-- Acquire shared lock
SELECT * FROM accounts WHERE id = 1 LOCK IN SHARE MODE;
-- Others can also read, but cannot write
\`\`\`

### Exclusive Lock (Write Lock)
Only one transaction can write:

\`\`\`sql
-- Acquire exclusive lock
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- Others cannot read or write until we release
\`\`\`

## FOR UPDATE in Practice

\`\`\`sql
START TRANSACTION;

-- Lock the row for update
SELECT balance INTO @balance 
FROM accounts 
WHERE id = 1 
FOR UPDATE;

-- Safe to update - no one else can modify
IF @balance >= 100 THEN
    UPDATE accounts SET balance = balance - 100 WHERE id = 1;
    COMMIT;
ELSE
    ROLLBACK;
END IF;
\`\`\`

## Deadlocks

Two transactions waiting for each other forever:

\`\`\`
Transaction A:              Transaction B:
LOCK row 1                  LOCK row 2
Want row 2 (blocked)        Want row 1 (blocked)
    ↓                           ↓
   DEADLOCK!
\`\`\`

MySQL automatically detects and kills one transaction.

## Preventing Deadlocks

1. **Lock in consistent order**:
\`\`\`sql
-- Always lock lower ID first
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
SELECT * FROM accounts WHERE id = 2 FOR UPDATE;
\`\`\`

2. **Keep transactions short**:
\`\`\`sql
-- Don't do this
START TRANSACTION;
SELECT * FROM accounts FOR UPDATE;
-- Long processing here...
COMMIT;

-- Do this
-- Process data first
START TRANSACTION;
UPDATE accounts SET ... WHERE id = 1;
COMMIT;
\`\`\`

3. **Use appropriate isolation levels**

## Table Locks (Use Sparingly)

\`\`\`sql
-- Lock entire table
LOCK TABLES accounts WRITE;

-- Do operations
UPDATE accounts SET status = 'active' WHERE balance > 0;

-- Release lock
UNLOCK TABLES;
\`\`\``
      },
      {
        id: "mysql-tx-5",
        title: "Practice: Safe Data Operations",
        type: "exercise",
        order: 5,
        content: `# Practice: Safe Data Operations

## Setup

\`\`\`sql
CREATE TABLE accounts (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    balance DECIMAL(10,2)
);

CREATE TABLE transfer_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_account INT,
    to_account INT,
    amount DECIMAL(10,2),
    status VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO accounts VALUES 
    (1, 'Alice', 1000.00),
    (2, 'Bob', 500.00),
    (3, 'Charlie', 750.00);
\`\`\`

## Challenge 1: Safe Money Transfer

Transfer $200 from Alice to Bob:

\`\`\`sql
START TRANSACTION;

-- Lock both accounts
SELECT balance INTO @alice_balance FROM accounts WHERE id = 1 FOR UPDATE;
SELECT balance INTO @bob_balance FROM accounts WHERE id = 2 FOR UPDATE;

-- Check sufficient funds
-- In real code, use IF statement or application logic

-- Perform transfer
UPDATE accounts SET balance = balance - 200 WHERE id = 1;
UPDATE accounts SET balance = balance + 200 WHERE id = 2;

-- Log the transfer
INSERT INTO transfer_log (from_account, to_account, amount, status)
VALUES (1, 2, 200.00, 'completed');

COMMIT;

-- Verify
SELECT * FROM accounts;
SELECT * FROM transfer_log;
\`\`\`

## Challenge 2: Inventory Update with Validation

\`\`\`sql
START TRANSACTION;

SELECT stock INTO @current FROM products WHERE id = 101 FOR UPDATE;

-- Only proceed if enough stock
-- @current >= 5 check would go here

UPDATE products SET stock = stock - 5 WHERE id = 101;
INSERT INTO order_items (order_id, product_id, quantity) VALUES (1, 101, 5);

COMMIT;
\`\`\`

## Challenge 3: Batch Insert with Savepoint

\`\`\`sql
START TRANSACTION;

INSERT INTO users (name, email) VALUES ('User1', 'user1@email.com');
SAVEPOINT user1;

INSERT INTO users (name, email) VALUES ('User2', 'user2@email.com');
SAVEPOINT user2;

INSERT INTO users (name, email) VALUES ('User3', 'invalid-email');
-- This might fail validation

-- If User3 fails:
ROLLBACK TO SAVEPOINT user2;

-- User1 and User2 are still pending
COMMIT;
\`\`\`

## Challenge 4: Check Isolation Level

\`\`\`sql
-- View current isolation level
SELECT @@transaction_isolation;

-- Try different levels
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT @@transaction_isolation;

-- Reset to default
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
\`\`\`

## Key Takeaways

1. Always use transactions for multi-step operations
2. Use FOR UPDATE when reading data you'll modify
3. Keep transactions short to reduce lock contention
4. Handle errors with ROLLBACK
5. Choose appropriate isolation level for your needs

Go to the **SQL Lab** to practice safe transactions!`
      }
    ]
  }
]

// ============================================
// MYSQL PYTHON LESSONS
// ============================================

const mysqlPythonLessons: Lesson[] = [
  {
    id: "mysql-python-introduction",
    slug: "mysql-python-introduction",
    title: "Introduction to MySQL with Python",
    topic: "MySQL Python",
    summary: "Learn how to connect Python applications to MySQL databases using mysql-connector-python.",
    order: 1,
    published: true,
    sections: [
      {
        id: "mysql-python-introduction-1",
        title: "Why Use MySQL with Python?",
        type: "concept",
        order: 1,
        content: `# Why Use MySQL with Python?

Combining **Python** with **MySQL** is one of the most powerful combinations for building data-driven applications. This integration allows you to leverage Python's simplicity with MySQL's robust database capabilities.

## What You'll Learn

In this lesson series, you'll master:
- Connecting Python to MySQL databases
- Performing CRUD operations (Create, Read, Update, Delete)
- Using parameterized queries for security
- Handling transactions and errors
- Implementing connection pooling for performance

## Why This Combination?

| Benefit | Description |
|---------|-------------|
| **Web Development** | Build dynamic websites with Flask/Django |
| **Data Analysis** | Query databases and analyze with pandas |
| **Automation** | Automate data migrations and backups |
| **APIs** | Create RESTful APIs backed by MySQL |
| **Enterprise Apps** | Build scalable business applications |

## The mysql-connector-python Library

We'll use \`mysql-connector-python\`, the official MySQL driver for Python developed by Oracle.

### Advantages:
- **Official Support**: Maintained by Oracle/MySQL team
- **Pure Python**: No C library dependencies
- **Full Featured**: Supports all MySQL features
- **Secure**: Built-in support for SSL and parameterized queries`
      },
      {
        id: "mysql-python-introduction-2",
        title: "Installing mysql-connector-python",
        type: "code",
        order: 2,
        content: `# Installing mysql-connector-python

Before we begin, we need to install the MySQL connector package.

## Installation Methods

### Using pip (Recommended)

\`\`\`bash
pip install mysql-connector-python
\`\`\`

### Verify Installation

\`\`\`python
import mysql.connector

# Check version
print(mysql.connector.__version__)
\`\`\`

## Basic Import Structure

\`\`\`python
# Main connector import
import mysql.connector

# Import specific classes for advanced usage
from mysql.connector import Error, pooling
\`\`\`

## Alternative Libraries

While we'll focus on \`mysql-connector-python\`, you should know about alternatives:

| Library | Description |
|---------|-------------|
| \`mysql-connector-python\` | Official Oracle driver (we use this) |
| \`PyMySQL\` | Pure Python, MySQLdb compatible |
| \`mysqlclient\` | C-based, fastest option |
| \`SQLAlchemy\` | ORM that works with any of the above |

> **Note**: The concepts you learn here apply to all MySQL libraries with minor syntax differences.`
      },
      {
        id: "mysql-python-introduction-3",
        title: "Understanding the Connection Process",
        type: "concept",
        order: 3,
        content: `# Understanding the Connection Process

Before writing code, let's understand how Python connects to MySQL.

## The Connection Flow

\`\`\`
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Python    │────▶│   MySQL Driver   │────▶│   MySQL     │
│ Application │     │  (Connector)     │     │   Server    │
└─────────────┘     └──────────────────┘     └─────────────┘
\`\`\`

## What Happens When You Connect?

1. **Authentication**: Your credentials are verified
2. **Connection Established**: A TCP/IP socket is created
3. **Session Created**: MySQL allocates resources for your session
4. **Ready for Queries**: You can now execute SQL commands

## Connection Requirements

To connect, you need:

| Parameter | Description | Example |
|-----------|-------------|---------|
| \`host\` | Server address | \`'localhost'\` or \`'db.example.com'\` |
| \`user\` | MySQL username | \`'root'\` or \`'app_user'\` |
| \`password\` | User password | \`'mypassword'\` |
| \`database\` | Database name (optional) | \`'myapp'\` |
| \`port\` | Server port (default: 3306) | \`3306\` |

## Security Best Practices

> **Warning:** Never hardcode credentials in your source code!

Use environment variables or configuration files:

\`\`\`python
import os

# Store credentials in environment variables
db_host = os.environ.get('DB_HOST', 'localhost')
db_user = os.environ.get('DB_USER', 'root')
db_pass = os.environ.get('DB_PASSWORD', '')
\`\`\``
      }
    ]
  },
  {
    id: "mysql-python-connections",
    slug: "mysql-python-connections",
    title: "Database Connections",
    topic: "MySQL Python",
    summary: "Master establishing, managing, and closing MySQL database connections in Python.",
    order: 2,
    published: true,
    sections: [
      {
        id: "mysql-python-connections-1",
        title: "Creating Your First Connection",
        type: "code",
        order: 1,
        content: `# Creating Your First Connection

Let's establish our first connection to a MySQL database.

## Basic Connection

\`\`\`python
import mysql.connector

# Create connection
connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

# Check if connected
if connection.is_connected():
    print("Successfully connected to MySQL!")
    
    # Get server info
    db_info = connection.get_server_info()
    print(f"MySQL Server version: {db_info}")

# Always close the connection when done
connection.close()
print("Connection closed.")
\`\`\`

## Connection Without Database

You can connect without specifying a database:

\`\`\`python
import mysql.connector

# Connect to MySQL server (no specific database)
connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password"
)

# Later, you can select a database
cursor = connection.cursor()
cursor.execute("USE testdb")

# Or create a new database
cursor.execute("CREATE DATABASE IF NOT EXISTS myapp")

connection.close()
\`\`\`

## Connection Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| \`host\` | Server hostname | \`localhost\` |
| \`port\` | Server port | \`3306\` |
| \`user\` | Username | Required |
| \`password\` | Password | \`''\` |
| \`database\` | Database name | \`None\` |
| \`autocommit\` | Auto-commit mode | \`False\` |`
      },
      {
        id: "mysql-python-connections-2",
        title: "Using Context Managers",
        type: "code",
        order: 2,
        content: `# Using Context Managers

The \`with\` statement ensures connections are properly closed, even if errors occur.

## The Problem with Manual Closing

\`\`\`python
# What happens if an error occurs before close()?
connection = mysql.connector.connect(...)
cursor = connection.cursor()
cursor.execute("SELECT * FROM users")  # Error here!
connection.close()  # This never runs - connection leak!
\`\`\`

## Solution: Context Manager Pattern

\`\`\`python
import mysql.connector
from mysql.connector import Error

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="your_password",
        database="testdb"
    )

# Using with statement
try:
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM users")
            results = cursor.fetchall()
            for row in results:
                print(row)
    # Connection automatically closed here!
except Error as e:
    print(f"Error: {e}")
\`\`\`

## Creating a Reusable Connection Function

\`\`\`python
import mysql.connector
from mysql.connector import Error

def create_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="your_password",
            database="testdb",
            autocommit=True
        )
        return connection
    except Error as e:
        print(f"Connection failed: {e}")
        return None

# Usage
conn = create_connection()
if conn:
    # Do your work...
    conn.close()
\`\`\``
      },
      {
        id: "mysql-python-connections-3",
        title: "Connection Configuration Options",
        type: "code",
        order: 3,
        content: `# Connection Configuration Options

MySQL Connector provides many configuration options for different needs.

## Using a Configuration Dictionary

\`\`\`python
import mysql.connector

# Store configuration separately
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_password',
    'database': 'testdb',
    'port': 3306,
    'autocommit': False,
    'connection_timeout': 10,
    'use_pure': True  # Use pure Python implementation
}

# Connect using dictionary unpacking
connection = mysql.connector.connect(**db_config)
\`\`\`

## Important Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| \`connection_timeout\` | Timeout in seconds | \`10\` |
| \`autocommit\` | Auto-commit transactions | \`True/False\` |
| \`charset\` | Character set | \`'utf8mb4'\` |
| \`collation\` | Collation | \`'utf8mb4_unicode_ci'\` |
| \`use_pure\` | Use pure Python | \`True/False\` |
| \`ssl_disabled\` | Disable SSL | \`True/False\` |

## SSL/TLS Secure Connection

\`\`\`python
import mysql.connector

# Secure connection with SSL
connection = mysql.connector.connect(
    host="secure-db.example.com",
    user="app_user",
    password="secure_password",
    database="production",
    ssl_ca="/path/to/ca-cert.pem",
    ssl_cert="/path/to/client-cert.pem",
    ssl_key="/path/to/client-key.pem"
)
\`\`\`

## Environment Variable Configuration

\`\`\`python
import os
import mysql.connector

# Best practice: Use environment variables
db_config = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
    'database': os.getenv('MYSQL_DATABASE', 'testdb'),
    'port': int(os.getenv('MYSQL_PORT', '3306'))
}

connection = mysql.connector.connect(**db_config)
\`\`\``
      }
    ]
  },
  {
    id: "mysql-python-crud",
    slug: "mysql-python-crud",
    title: "CRUD Operations",
    topic: "MySQL Python",
    summary: "Learn to Create, Read, Update, and Delete data in MySQL using Python.",
    order: 3,
    published: true,
    sections: [
      {
        id: "mysql-python-crud-1",
        title: "Understanding Cursors",
        type: "concept",
        order: 1,
        content: `# Understanding Cursors

A **cursor** is your gateway to executing SQL commands and fetching results.

## What is a Cursor?

Think of a cursor as a **pointer** that:
- Executes SQL statements
- Navigates through result sets
- Retrieves rows one at a time or in batches

## Creating a Cursor

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

# Create a cursor
cursor = connection.cursor()

# Execute queries using the cursor
cursor.execute("SELECT * FROM users")

# Don't forget to close both
cursor.close()
connection.close()
\`\`\`

## Cursor Types

| Type | Description | Use Case |
|------|-------------|----------|
| Default | Fetches rows as tuples | General use |
| Dictionary | Fetches rows as dictionaries | When you need column names |
| Buffered | Loads all results immediately | Multiple queries in sequence |
| Named Tuple | Fetches rows as named tuples | Clean attribute access |

## Dictionary Cursor Example

\`\`\`python
# Creates cursor that returns dictionaries
cursor = connection.cursor(dictionary=True)
cursor.execute("SELECT * FROM users")

for row in cursor:
    print(f"Name: {row['name']}, Email: {row['email']}")
\`\`\`

## Buffered Cursor

\`\`\`python
# Buffered cursor loads all rows immediately
cursor = connection.cursor(buffered=True)
cursor.execute("SELECT COUNT(*) FROM users")
count = cursor.fetchone()[0]

# Can execute another query immediately
cursor.execute("SELECT * FROM users LIMIT 5")
\`\`\``
      },
      {
        id: "mysql-python-crud-2",
        title: "CREATE - Inserting Data",
        type: "code",
        order: 2,
        content: `# CREATE - Inserting Data

Learn to insert single and multiple rows into your database.

## Insert Single Row

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root", 
    password="your_password",
    database="testdb"
)

cursor = connection.cursor()

# Insert a single row
sql = "INSERT INTO users (name, email, age) VALUES (%s, %s, %s)"
values = ("Alice", "alice@example.com", 25)

cursor.execute(sql, values)

# IMPORTANT: Commit to save changes!
connection.commit()

print(f"Inserted row with ID: {cursor.lastrowid}")

cursor.close()
connection.close()
\`\`\`

## Insert Multiple Rows

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password", 
    database="testdb"
)

cursor = connection.cursor()

# Insert multiple rows at once
sql = "INSERT INTO users (name, email, age) VALUES (%s, %s, %s)"
values = [
    ("Bob", "bob@example.com", 30),
    ("Charlie", "charlie@example.com", 28),
    ("Diana", "diana@example.com", 32)
]

cursor.executemany(sql, values)
connection.commit()

print(f"Inserted {cursor.rowcount} rows")

cursor.close()
connection.close()
\`\`\`

## Key Points

| Concept | Description |
|---------|-------------|
| \`%s\` | Placeholder for values (prevents SQL injection) |
| \`execute()\` | Run query with single set of values |
| \`executemany()\` | Run query with multiple sets of values |
| \`commit()\` | Save changes to database |
| \`lastrowid\` | ID of last inserted row |
| \`rowcount\` | Number of affected rows |

> **Warning:** Always use placeholders (%s) - never concatenate values directly!`
      },
      {
        id: "mysql-python-crud-3",
        title: "READ - Querying Data",
        type: "code",
        order: 3,
        content: `# READ - Querying Data

Retrieve data from your database using SELECT queries.

## Basic SELECT Query

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

cursor = connection.cursor()

# Simple SELECT
cursor.execute("SELECT * FROM users")

# Fetch all results
results = cursor.fetchall()

for row in results:
    print(row)  # Tuple: (1, 'Alice', 'alice@example.com', 25)

cursor.close()
connection.close()
\`\`\`

## Using Dictionary Cursor

\`\`\`python
# Dictionary cursor for cleaner access
cursor = connection.cursor(dictionary=True)
cursor.execute("SELECT * FROM users")

for user in cursor.fetchall():
    print(f"Name: {user['name']}")
    print(f"Email: {user['email']}")
    print("---")
\`\`\`

## SELECT with WHERE Clause

\`\`\`python
cursor = connection.cursor(dictionary=True)

# Parameterized query (safe from SQL injection)
sql = "SELECT * FROM users WHERE age > %s AND name LIKE %s"
values = (25, 'A%')

cursor.execute(sql, values)

for user in cursor.fetchall():
    print(user['name'], user['age'])
\`\`\`

## SELECT with JOIN

\`\`\`python
cursor = connection.cursor(dictionary=True)

sql = "SELECT u.name, o.product, o.amount FROM users u JOIN orders o ON u.id = o.user_id WHERE u.id = %s"

cursor.execute(sql, (1,))

for row in cursor.fetchall():
    print(f"{row['name']} ordered {row['product']} - Amount: {row['amount']}")
\`\`\``
      },
      {
        id: "mysql-python-crud-4",
        title: "UPDATE and DELETE",
        type: "code",
        order: 4,
        content: `# UPDATE and DELETE

Modify and remove data from your database.

## UPDATE - Modifying Data

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

cursor = connection.cursor()

# Update a single column
sql = "UPDATE users SET email = %s WHERE id = %s"
values = ("newemail@example.com", 1)

cursor.execute(sql, values)
connection.commit()

print(f"Updated {cursor.rowcount} row(s)")

cursor.close()
connection.close()
\`\`\`

## Update Multiple Columns

\`\`\`python
sql = "UPDATE users SET name = %s, age = %s, updated_at = NOW() WHERE id = %s"
values = ("Alice Smith", 26, 1)

cursor.execute(sql, values)
connection.commit()
\`\`\`

## DELETE - Removing Data

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

cursor = connection.cursor()

# Delete specific rows
sql = "DELETE FROM users WHERE id = %s"
values = (5,)

cursor.execute(sql, values)
connection.commit()

print(f"Deleted {cursor.rowcount} row(s)")

cursor.close()
connection.close()
\`\`\`

## Safety Tips

> **Warning:** Always use WHERE clause with UPDATE and DELETE!

\`\`\`python
# DANGEROUS - affects ALL rows!
# cursor.execute("DELETE FROM users")  # DON'T DO THIS!

# SAFE - specific target
cursor.execute("DELETE FROM users WHERE id = %s", (5,))
\`\`\`

## Verify Before Deleting

\`\`\`python
# Check what will be deleted first
cursor.execute("SELECT * FROM users WHERE age < %s", (18,))
to_delete = cursor.fetchall()
print(f"About to delete {len(to_delete)} users:")
for user in to_delete:
    print(f"  - {user}")

# Confirm, then delete
if input("Proceed? (y/n): ").lower() == 'y':
    cursor.execute("DELETE FROM users WHERE age < %s", (18,))
    connection.commit()
\`\`\``
      }
    ]
  },
  {
    id: "mysql-python-prepared-statements",
    slug: "mysql-python-prepared-statements",
    title: "Prepared Statements & Security",
    topic: "MySQL Python",
    summary: "Protect your application from SQL injection using parameterized queries and prepared statements.",
    order: 4,
    published: true,
    sections: [
      {
        id: "mysql-python-prepared-statements-1",
        title: "What is SQL Injection?",
        type: "concept",
        order: 1,
        content: `# What is SQL Injection?

**SQL Injection** is one of the most dangerous and common web security vulnerabilities. Understanding it is crucial for writing secure code.

## The Vulnerability

\`\`\`python
# DANGEROUS CODE - Never do this!
username = input("Enter username: ")
sql = f"SELECT * FROM users WHERE username = '{username}'"
cursor.execute(sql)
\`\`\`

If user enters: \`admin' OR '1'='1\`

The query becomes:
\`\`\`sql
SELECT * FROM users WHERE username = 'admin' OR '1'='1'
\`\`\`

This returns **ALL users** because \`'1'='1'\` is always true!

## Real-World Attacks

| Attack | Malicious Input | Result |
|--------|-----------------|--------|
| **Data Theft** | \`' OR '1'='1\` | Bypass authentication |
| **Data Deletion** | \`'; DROP TABLE users; --\` | Delete entire table |
| **Data Modification** | \`'; UPDATE users SET admin=1 WHERE id=5; --\` | Escalate privileges |

## The Solution: Parameterized Queries

\`\`\`python
# SAFE CODE - Always do this!
username = input("Enter username: ")
sql = "SELECT * FROM users WHERE username = %s"
cursor.execute(sql, (username,))
\`\`\`

With parameterized queries:
- The database treats input as **data**, not SQL code
- Special characters are automatically escaped
- Impossible to inject malicious SQL

> **Rule #1 of database security:** Never trust user input. Always use parameterized queries.`
      },
      {
        id: "mysql-python-prepared-statements-2",
        title: "Using Parameterized Queries",
        type: "code",
        order: 2,
        content: `# Using Parameterized Queries

Let's see how to properly use parameterized queries for all operations.

## The %s Placeholder

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

cursor = connection.cursor()

# Single parameter
cursor.execute(
    "SELECT * FROM users WHERE id = %s",
    (1,)  # Note: tuple with single value needs comma
)

# Multiple parameters
cursor.execute(
    "SELECT * FROM users WHERE age > %s AND city = %s",
    (25, "Mumbai")
)

# With LIKE pattern
search_term = "john"
cursor.execute(
    "SELECT * FROM users WHERE name LIKE %s",
    (f"%{search_term}%",)  # Add wildcards to the value, not the query
)

cursor.close()
connection.close()
\`\`\`

## INSERT with Parameters

\`\`\`python
# Safe INSERT
user_data = ("Alice", "alice@example.com", 25)

cursor.execute(
    "INSERT INTO users (name, email, age) VALUES (%s, %s, %s)",
    user_data
)
connection.commit()
\`\`\`

## UPDATE with Parameters

\`\`\`python
# Safe UPDATE
new_email = "new.email@example.com"
user_id = 1

cursor.execute(
    "UPDATE users SET email = %s WHERE id = %s",
    (new_email, user_id)
)
connection.commit()
\`\`\`

## Common Mistakes to Avoid

\`\`\`python
# WRONG - String formatting (vulnerable!)
cursor.execute(f"SELECT * FROM users WHERE name = '{name}'")

# WRONG - String concatenation (vulnerable!)
cursor.execute("SELECT * FROM users WHERE name = '" + name + "'")

# WRONG - % formatting (vulnerable!)
cursor.execute("SELECT * FROM users WHERE name = '%s'" % name)

# CORRECT - Parameterized query (safe!)
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))
\`\`\``
      },
      {
        id: "mysql-python-prepared-statements-3",
        title: "Prepared Statements",
        type: "code",
        order: 3,
        content: `# Prepared Statements

**Prepared statements** are pre-compiled SQL statements that offer both security and performance benefits.

## How They Work

\`\`\`
1. PREPARE: SQL template sent to database and compiled
2. EXECUTE: Only data values are sent (multiple times)
3. DEALLOCATE: Clean up when done
\`\`\`

## Using Prepared Statements

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

# Enable prepared statements
cursor = connection.cursor(prepared=True)

# The statement is prepared once
insert_stmt = "INSERT INTO users (name, email, age) VALUES (%s, %s, %s)"

# Execute multiple times with different data
users = [
    ("Alice", "alice@example.com", 25),
    ("Bob", "bob@example.com", 30),
    ("Charlie", "charlie@example.com", 28)
]

for user in users:
    cursor.execute(insert_stmt, user)

connection.commit()
cursor.close()
connection.close()
\`\`\`

## Benefits of Prepared Statements

| Benefit | Description |
|---------|-------------|
| **Security** | Complete protection against SQL injection |
| **Performance** | Query parsed once, executed many times |
| **Reduced Bandwidth** | Only data is sent, not full query |
| **Type Safety** | Database handles type conversion |

## When to Use Prepared Statements

\`\`\`python
# Perfect for repeated operations
cursor = connection.cursor(prepared=True)

# Batch inserts
for item in large_dataset:
    cursor.execute(insert_sql, item)

# Repeated queries in a loop
for user_id in user_ids:
    cursor.execute(select_sql, (user_id,))
    result = cursor.fetchone()
    process(result)
\`\`\`

## Summary

- **Regular queries**: Good for single executions
- **Prepared statements**: Best for repeated executions
- **Both**: Protect against SQL injection when using parameters`
      }
    ]
  },
  {
    id: "mysql-python-fetching-data",
    slug: "mysql-python-fetching-data",
    title: "Fetching Data Efficiently",
    topic: "MySQL Python",
    summary: "Master different methods to retrieve data: fetchone, fetchall, fetchmany, and iteration.",
    order: 5,
    published: true,
    sections: [
      {
        id: "mysql-python-fetching-data-1",
        title: "Fetch Methods Overview",
        type: "concept",
        order: 1,
        content: `# Fetch Methods Overview

After executing a SELECT query, you need to **fetch** the results. MySQL Connector provides several methods for different use cases.

## Available Fetch Methods

| Method | Returns | Memory Usage | Best For |
|--------|---------|--------------|----------|
| \`fetchone()\` | One row or None | Low | Single record lookups |
| \`fetchall()\` | List of all rows | High | Small result sets |
| \`fetchmany(n)\` | List of n rows | Medium | Batch processing |
| Iteration | One row at a time | Low | Large result sets |

## When to Use Each Method

### fetchone()
- Looking up a single user
- Checking if a record exists
- Getting aggregated values (COUNT, SUM, etc.)

### fetchall()
- Displaying a table of results
- Small to medium datasets (hundreds of rows)
- When you need all data in memory

### fetchmany(n)
- Processing data in batches
- Memory-constrained environments
- Progress reporting on large datasets

### Iteration
- Processing millions of rows
- When you don't need all data at once
- Streaming data processing

## Memory Considerations

\`\`\`
Small dataset (< 1,000 rows):    Use fetchall()
Medium dataset (1,000 - 100,000): Use fetchmany() or iteration
Large dataset (> 100,000 rows):   Use iteration
\`\`\``
      },
      {
        id: "mysql-python-fetching-data-2",
        title: "fetchone() and fetchall()",
        type: "code",
        order: 2,
        content: `# fetchone() and fetchall()

Let's explore these commonly used fetch methods in detail.

## fetchone() - Get Single Row

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

cursor = connection.cursor(dictionary=True)

# Find a specific user
cursor.execute("SELECT * FROM users WHERE id = %s", (1,))
user = cursor.fetchone()

if user:
    print(f"Found: {user['name']} ({user['email']})")
else:
    print("User not found")

cursor.close()
connection.close()
\`\`\`

## fetchone() for Aggregates

\`\`\`python
cursor = connection.cursor()

cursor.execute("SELECT COUNT(*) FROM users")
count = cursor.fetchone()[0]
print(f"Total users: {count}")

cursor.execute("SELECT AVG(age) FROM users")
avg_age = cursor.fetchone()[0]
print(f"Average age: {avg_age:.1f}")
\`\`\`

## fetchall() - Get All Rows

\`\`\`python
cursor = connection.cursor(dictionary=True)

cursor.execute("SELECT * FROM users ORDER BY name")
users = cursor.fetchall()

print(f"Found {len(users)} users:")
for user in users:
    print(f"  - {user['name']}: {user['email']}")
\`\`\`

## fetchall() with Processing

\`\`\`python
cursor = connection.cursor(dictionary=True)
cursor.execute("SELECT * FROM products WHERE price > %s", (100,))

products = cursor.fetchall()

# Transform data
expensive_products = [
    {
        'name': p['name'],
        'price_with_tax': p['price'] * 1.18
    }
    for p in products
]

print(expensive_products)
\`\`\`

## Important Notes

\`\`\`python
# fetchone() returns None when no more rows
cursor.execute("SELECT * FROM users WHERE id = 9999")
result = cursor.fetchone()
if result is None:
    print("No matching record found")

# fetchall() returns empty list when no rows
cursor.execute("SELECT * FROM users WHERE age > 100")
results = cursor.fetchall()
if not results:  # or: if len(results) == 0
    print("No matching records found")
\`\`\``
      },
      {
        id: "mysql-python-fetching-data-3",
        title: "fetchmany() and Iteration",
        type: "code",
        order: 3,
        content: `# fetchmany() and Iteration

For large datasets, these methods prevent memory issues.

## fetchmany(n) - Batch Processing

\`\`\`python
import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

cursor = connection.cursor(dictionary=True)
cursor.execute("SELECT * FROM large_table")

batch_size = 100
total_processed = 0

while True:
    rows = cursor.fetchmany(batch_size)
    
    if not rows:
        break  # No more data
    
    for row in rows:
        # Process each row
        process_record(row)
    
    total_processed += len(rows)
    print(f"Processed {total_processed} records...")

print(f"Done! Total: {total_processed}")

cursor.close()
connection.close()
\`\`\`

## Iteration - Most Memory Efficient

\`\`\`python
cursor = connection.cursor(dictionary=True)
cursor.execute("SELECT * FROM large_table")

# Iterate directly over cursor
count = 0
for row in cursor:
    process_record(row)
    count += 1
    
    if count % 1000 == 0:
        print(f"Processed {count} rows...")

print(f"Total: {count}")
\`\`\`

## Streaming Large Results

\`\`\`python
# Use buffered=False for true streaming (default)
cursor = connection.cursor(dictionary=True, buffered=False)

cursor.execute("SELECT * FROM million_row_table")

# Process one row at a time - memory stays constant
for row in cursor:
    yield row  # Great for generators!
\`\`\`

## Practical Example: Export to CSV

\`\`\`python
import csv
import mysql.connector

connection = mysql.connector.connect(...)
cursor = connection.cursor()

cursor.execute("SELECT id, name, email FROM users")

with open('export.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['ID', 'Name', 'Email'])  # Header
    
    # Stream rows directly to file
    for row in cursor:
        writer.writerow(row)

print("Export complete!")
cursor.close()
connection.close()
\`\`\``
      }
    ]
  },
  {
    id: "mysql-python-error-handling",
    slug: "mysql-python-error-handling",
    title: "Error Handling",
    topic: "MySQL Python",
    summary: "Learn to handle database errors gracefully and build robust applications.",
    order: 6,
    published: true,
    sections: [
      {
        id: "mysql-python-error-handling-1",
        title: "Understanding MySQL Errors",
        type: "concept",
        order: 1,
        content: `# Understanding MySQL Errors

Proper error handling is essential for building reliable database applications.

## Common Error Types

| Error Type | Description | Common Causes |
|------------|-------------|---------------|
| \`InterfaceError\` | Connector issue | Wrong API usage |
| \`DatabaseError\` | Database problem | SQL errors, constraints |
| \`OperationalError\` | Connection issues | Server down, timeout |
| \`IntegrityError\` | Constraint violation | Duplicate key, FK violation |
| \`ProgrammingError\` | SQL syntax error | Invalid queries |
| \`DataError\` | Data issues | Value out of range |

## Error Hierarchy

\`\`\`
Exception
└── mysql.connector.Error
    ├── InterfaceError
    └── DatabaseError
        ├── DataError
        ├── OperationalError
        ├── IntegrityError
        ├── InternalError
        ├── ProgrammingError
        └── NotSupportedError
\`\`\`

## Error Properties

Each error has useful properties:

\`\`\`python
try:
    cursor.execute("INVALID SQL")
except mysql.connector.Error as e:
    print(f"Error code: {e.errno}")
    print(f"SQL State: {e.sqlstate}")
    print(f"Message: {e.msg}")
\`\`\`

## Common Error Codes

| Code | Constant | Meaning |
|------|----------|---------|
| 1062 | ER_DUP_ENTRY | Duplicate entry |
| 1452 | ER_NO_REFERENCED_ROW | FK constraint fail |
| 2003 | CR_CONN_HOST_ERROR | Can't connect |
| 1045 | ER_ACCESS_DENIED_ERROR | Access denied |`
      },
      {
        id: "mysql-python-error-handling-2",
        title: "Try-Except Patterns",
        type: "code",
        order: 2,
        content: `# Try-Except Patterns

Learn the best practices for handling database errors.

## Basic Error Handling

\`\`\`python
import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="your_password",
        database="testdb"
    )
    
    if connection.is_connected():
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users")
        results = cursor.fetchall()
        print(results)
        
except Error as e:
    print(f"Database error: {e}")
    
finally:
    # Always clean up!
    if 'cursor' in locals() and cursor:
        cursor.close()
    if 'connection' in locals() and connection.is_connected():
        connection.close()
        print("Connection closed.")
\`\`\`

## Handling Specific Errors

\`\`\`python
import mysql.connector
from mysql.connector import Error, errorcode

try:
    cursor.execute(
        "INSERT INTO users (email) VALUES (%s)",
        ("duplicate@example.com",)
    )
    connection.commit()
    
except Error as e:
    if e.errno == errorcode.ER_DUP_ENTRY:
        print("Email already exists!")
    elif e.errno == errorcode.ER_ACCESS_DENIED_ERROR:
        print("Access denied - check credentials")
    elif e.errno == errorcode.ER_BAD_DB_ERROR:
        print("Database does not exist")
    else:
        print(f"Unexpected error: {e}")
\`\`\`

## Connection Error Handling

\`\`\`python
import mysql.connector
from mysql.connector import Error

def get_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="your_password",
            database="testdb",
            connection_timeout=5
        )
        return connection
    except Error as e:
        if e.errno == errorcode.CR_CONN_HOST_ERROR:
            print("Cannot connect to MySQL server")
        elif e.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Invalid username or password")
        else:
            print(f"Connection failed: {e}")
        return None

# Usage
conn = get_connection()
if conn:
    # Do work...
    conn.close()
\`\`\``
      },
      {
        id: "mysql-python-error-handling-3",
        title: "Building Robust Functions",
        type: "code",
        order: 3,
        content: `# Building Robust Functions

Create reusable database functions with proper error handling.

## Safe Query Function

\`\`\`python
import mysql.connector
from mysql.connector import Error

def execute_query(connection, query, params=None):
    try:
        cursor = connection.cursor(dictionary=True)
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        # For SELECT queries
        if query.strip().upper().startswith("SELECT"):
            return cursor.fetchall()
        
        # For INSERT/UPDATE/DELETE
        connection.commit()
        return cursor.rowcount
        
    except Error as e:
        print(f"Query error: {e}")
        connection.rollback()
        return None
        
    finally:
        cursor.close()

# Usage
results = execute_query(conn, "SELECT * FROM users WHERE age > %s", (25,))
affected = execute_query(conn, "UPDATE users SET active = 1 WHERE id = %s", (1,))
\`\`\`

## Safe Insert with Retry

\`\`\`python
import time
import mysql.connector
from mysql.connector import Error, errorcode

def insert_with_retry(connection, table, data, max_retries=3):
    columns = ', '.join(data.keys())
    placeholders = ', '.join(['%s'] * len(data))
    sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
    
    for attempt in range(max_retries):
        try:
            cursor = connection.cursor()
            cursor.execute(sql, tuple(data.values()))
            connection.commit()
            return cursor.lastrowid
            
        except Error as e:
            if e.errno == errorcode.ER_LOCK_DEADLOCK:
                # Retry on deadlock
                print(f"Deadlock, retrying... ({attempt + 1}/{max_retries})")
                time.sleep(0.1 * (attempt + 1))
                continue
            elif e.errno == errorcode.ER_DUP_ENTRY:
                # Don't retry duplicate errors
                print(f"Duplicate entry: {e}")
                return None
            else:
                raise  # Re-raise unexpected errors
        finally:
            cursor.close()
    
    print("Max retries exceeded")
    return None

# Usage
user_id = insert_with_retry(conn, 'users', {
    'name': 'Alice',
    'email': 'alice@example.com',
    'age': 25
})
\`\`\`

## Complete Error-Safe Pattern

\`\`\`python
class DatabaseManager:
    def __init__(self, config):
        self.config = config
        self.connection = None
    
    def connect(self):
        try:
            self.connection = mysql.connector.connect(**self.config)
            return True
        except Error as e:
            print(f"Connection failed: {e}")
            return False
    
    def disconnect(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
    
    def __enter__(self):
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()

# Usage with context manager
with DatabaseManager(db_config) as db:
    if db.connection:
        # Safe database operations
        pass
\`\`\``
      }
    ]
  },
  {
    id: "mysql-python-transactions",
    slug: "mysql-python-transactions",
    title: "Transactions",
    topic: "MySQL Python",
    summary: "Understand database transactions, ACID properties, and how to maintain data integrity.",
    order: 7,
    published: true,
    sections: [
      {
        id: "mysql-python-transactions-1",
        title: "Understanding Transactions",
        type: "concept",
        order: 1,
        content: `# Understanding Transactions

A **transaction** is a sequence of database operations that are treated as a single unit of work.

## Why Transactions Matter

Consider a bank transfer:
1. Withdraw $100 from Account A
2. Deposit $100 to Account B

What if step 2 fails after step 1 completes? The money disappears!

Transactions ensure **both operations succeed or both fail**.

## ACID Properties

| Property | Description | Example |
|----------|-------------|---------|
| **Atomicity** | All or nothing | Transfer completes fully or not at all |
| **Consistency** | Valid state to valid state | Total money stays the same |
| **Isolation** | Transactions don't interfere | Concurrent transfers work correctly |
| **Durability** | Committed = permanent | Survives power failure |

## Transaction Commands

| Command | Description |
|---------|-------------|
| \`START TRANSACTION\` | Begin a transaction |
| \`COMMIT\` | Save all changes |
| \`ROLLBACK\` | Undo all changes |
| \`SAVEPOINT name\` | Create a checkpoint |
| \`ROLLBACK TO name\` | Undo to checkpoint |

## MySQL Connector Default Behavior

By default, \`autocommit\` is **False**, meaning:
- Changes are not saved until you call \`commit()\`
- If you close without committing, changes are lost

\`\`\`python
# Default: autocommit=False
connection = mysql.connector.connect(...)

cursor.execute("INSERT INTO users ...")
# Changes NOT saved yet!

connection.commit()  # NOW they're saved
\`\`\``
      },
      {
        id: "mysql-python-transactions-2",
        title: "Implementing Transactions",
        type: "code",
        order: 2,
        content: `# Implementing Transactions

Let's implement transactions for common scenarios.

## Basic Transaction Pattern

\`\`\`python
import mysql.connector
from mysql.connector import Error

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="bank"
)

try:
    cursor = connection.cursor()
    
    # Transaction starts automatically (autocommit=False)
    
    # Step 1: Withdraw from Account A
    cursor.execute(
        "UPDATE accounts SET balance = balance - %s WHERE id = %s",
        (100, 1)
    )
    
    # Step 2: Deposit to Account B
    cursor.execute(
        "UPDATE accounts SET balance = balance + %s WHERE id = %s",
        (100, 2)
    )
    
    # Step 3: Record the transfer
    cursor.execute(
        "INSERT INTO transfers (from_id, to_id, amount) VALUES (%s, %s, %s)",
        (1, 2, 100)
    )
    
    # All successful - commit!
    connection.commit()
    print("Transfer completed successfully!")
    
except Error as e:
    # Something failed - rollback everything!
    connection.rollback()
    print(f"Transfer failed: {e}")
    
finally:
    cursor.close()
    connection.close()
\`\`\`

## Transaction with Validation

\`\`\`python
def transfer_money(conn, from_account, to_account, amount):
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Check sender has enough balance
        cursor.execute(
            "SELECT balance FROM accounts WHERE id = %s FOR UPDATE",
            (from_account,)
        )
        sender = cursor.fetchone()
        
        if not sender:
            raise ValueError("Sender account not found")
        if sender['balance'] < amount:
            raise ValueError("Insufficient funds")
        
        # Check receiver exists
        cursor.execute(
            "SELECT id FROM accounts WHERE id = %s FOR UPDATE",
            (to_account,)
        )
        if not cursor.fetchone():
            raise ValueError("Receiver account not found")
        
        # Perform transfer
        cursor.execute(
            "UPDATE accounts SET balance = balance - %s WHERE id = %s",
            (amount, from_account)
        )
        cursor.execute(
            "UPDATE accounts SET balance = balance + %s WHERE id = %s",
            (amount, to_account)
        )
        
        conn.commit()
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"Transfer failed: {e}")
        return False
        
    finally:
        cursor.close()
\`\`\`

> **Note:** **FOR UPDATE** locks the rows to prevent concurrent modifications.`
      },
      {
        id: "mysql-python-transactions-3",
        title: "Savepoints and Nested Transactions",
        type: "code",
        order: 3,
        content: `# Savepoints and Nested Transactions

Savepoints allow partial rollbacks within a transaction.

## Using Savepoints

\`\`\`python
import mysql.connector
from mysql.connector import Error

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

cursor = connection.cursor()

try:
    # Insert first user
    cursor.execute(
        "INSERT INTO users (name, email) VALUES (%s, %s)",
        ("Alice", "alice@example.com")
    )
    
    # Create savepoint after first insert
    cursor.execute("SAVEPOINT after_alice")
    
    try:
        # Try to insert second user (might fail)
        cursor.execute(
            "INSERT INTO users (name, email) VALUES (%s, %s)",
            ("Bob", "duplicate@example.com")  # Assume this is duplicate
        )
    except Error:
        # Rollback only to savepoint, keeping Alice
        cursor.execute("ROLLBACK TO SAVEPOINT after_alice")
        print("Second insert failed, but first is preserved")
    
    # Insert third user
    cursor.execute(
        "INSERT INTO users (name, email) VALUES (%s, %s)",
        ("Charlie", "charlie@example.com")
    )
    
    # Commit Alice and Charlie
    connection.commit()
    print("Transaction completed: Alice and Charlie added")
    
except Error as e:
    connection.rollback()
    print(f"Transaction failed: {e}")
    
finally:
    cursor.close()
    connection.close()
\`\`\`

## Batch Processing with Savepoints

\`\`\`python
def batch_insert_with_savepoints(connection, records, batch_size=100):
    cursor = connection.cursor()
    inserted = 0
    
    try:
        for i, record in enumerate(records):
            # Create savepoint every batch_size records
            if i % batch_size == 0:
                savepoint = f"batch_{i}"
                cursor.execute(f"SAVEPOINT {savepoint}")
            
            try:
                cursor.execute(
                    "INSERT INTO items (name, value) VALUES (%s, %s)",
                    record
                )
                inserted += 1
            except Error as e:
                print(f"Skipping record {i}: {e}")
                # Continue with next record
        
        connection.commit()
        print(f"Inserted {inserted} of {len(records)} records")
        
    except Error as e:
        connection.rollback()
        print(f"Batch failed: {e}")
        return 0
        
    finally:
        cursor.close()
    
    return inserted
\`\`\`

## Auto-commit Mode

\`\`\`python
# Enable auto-commit for simple operations
connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="your_password",
    database="testdb",
    autocommit=True  # Each statement is its own transaction
)

cursor = connection.cursor()

# No need to call commit() - each statement auto-commits
cursor.execute("INSERT INTO logs (message) VALUES (%s)", ("Log entry",))

# For explicit transactions with autocommit=True:
connection.start_transaction()
cursor.execute("UPDATE ...")
cursor.execute("UPDATE ...")
connection.commit()  # Or rollback()
\`\`\``
      }
    ]
  },
  {
    id: "mysql-python-connection-pooling",
    slug: "mysql-python-connection-pooling",
    title: "Connection Pooling",
    topic: "MySQL Python",
    summary: "Optimize performance with connection pooling for production applications.",
    order: 8,
    published: true,
    sections: [
      {
        id: "mysql-python-connection-pooling-1",
        title: "Why Connection Pooling?",
        type: "concept",
        order: 1,
        content: `# Why Connection Pooling?

Creating database connections is **expensive**. Connection pooling solves this problem.

## The Problem

\`\`\`python
# Without pooling - slow!
def get_user(user_id):
    connection = mysql.connector.connect(...)  # ~50-100ms
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()
    connection.close()  # Connection destroyed
    return user

# Every call creates a new connection!
for i in range(1000):
    get_user(i)  # 1000 connection setups = ~50-100 seconds wasted!
\`\`\`

## What is Connection Pooling?

A **connection pool** maintains a cache of database connections that can be reused:

\`\`\`
┌─────────────────────────────────────────┐
│           Connection Pool               │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐ │
│  │Conn│  │Conn│  │Conn│  │Conn│  │Conn│ │
│  │ 1  │  │ 2  │  │ 3  │  │ 4  │  │ 5  │ │
│  └────┘  └────┘  └────┘  └────┘  └────┘ │
└─────────────────────────────────────────┘
     ▲         ▲                     ▲
     │         │                     │
  Request   Request               Request
     1         2                     3
\`\`\`

## Benefits

| Benefit | Description |
|---------|-------------|
| **Performance** | Reuse connections instead of creating new ones |
| **Resource Control** | Limit maximum connections |
| **Connection Management** | Pool handles lifecycle |
| **Scalability** | Handle more concurrent requests |

## When to Use Pooling

| Use Case | Recommendation |
|----------|----------------|
| Simple scripts | Not needed |
| Web applications | Essential |
| API servers | Essential |
| Background workers | Recommended |
| Data pipelines | Depends on load |`
      },
      {
        id: "mysql-python-connection-pooling-2",
        title: "Implementing Connection Pools",
        type: "code",
        order: 2,
        content: `# Implementing Connection Pools

MySQL Connector provides built-in connection pooling.

## Creating a Connection Pool

\`\`\`python
import mysql.connector
from mysql.connector import pooling

# Create a connection pool
pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,  # Number of connections to maintain
    pool_reset_session=True,
    host="localhost",
    user="root",
    password="your_password",
    database="testdb"
)

print(f"Pool '{pool.pool_name}' created with {pool.pool_size} connections")
\`\`\`

## Getting Connections from Pool

\`\`\`python
# Get a connection from the pool
connection = pool.get_connection()

try:
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    print(users)
    cursor.close()
finally:
    # Return connection to pool (don't close!)
    connection.close()  # This returns it to the pool
\`\`\`

## Using Context Manager

\`\`\`python
from contextlib import contextmanager

@contextmanager
def get_db_connection(pool):
    connection = pool.get_connection()
    try:
        yield connection
    finally:
        connection.close()  # Returns to pool

# Usage
with get_db_connection(pool) as conn:
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    cursor.close()
# Connection automatically returned to pool
\`\`\`

## Complete Pool Configuration

\`\`\`python
from mysql.connector import pooling

pool_config = {
    "pool_name": "production_pool",
    "pool_size": 10,
    "pool_reset_session": True,
    "host": "localhost",
    "port": 3306,
    "user": "app_user",
    "password": "secure_password",
    "database": "production",
    "charset": "utf8mb4",
    "collation": "utf8mb4_unicode_ci",
    "autocommit": False,
    "connection_timeout": 10
}

pool = pooling.MySQLConnectionPool(**pool_config)
\`\`\`

## Pool Size Guidelines

| Application Type | Recommended Size |
|------------------|------------------|
| Small web app | 5-10 connections |
| Medium web app | 10-20 connections |
| High-traffic app | 20-50 connections |
| Microservice | 5-15 per service |

> **Warning:** Don't set pool_size higher than MySQL's max_connections!`
      },
      {
        id: "mysql-python-connection-pooling-3",
        title: "Production Best Practices",
        type: "code",
        order: 3,
        content: `# Production Best Practices

Build a robust database layer for production applications.

## Database Manager Class

\`\`\`python
import mysql.connector
from mysql.connector import pooling, Error
from contextlib import contextmanager
import os

class DatabaseManager:
    
    _instance = None
    _pool = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def initialize(self, pool_size=10):
        if self._pool is not None:
            return  # Already initialized
        
        config = {
            "pool_name": "app_pool",
            "pool_size": pool_size,
            "pool_reset_session": True,
            "host": os.getenv("DB_HOST", "localhost"),
            "port": int(os.getenv("DB_PORT", "3306")),
            "user": os.getenv("DB_USER", "root"),
            "password": os.getenv("DB_PASSWORD", ""),
            "database": os.getenv("DB_NAME", "app"),
            "charset": "utf8mb4",
            "autocommit": False
        }
        
        self._pool = pooling.MySQLConnectionPool(**config)
        print(f"Database pool initialized with {pool_size} connections")
    
    @contextmanager
    def get_connection(self):
        connection = self._pool.get_connection()
        try:
            yield connection
        except Error as e:
            connection.rollback()
            raise
        finally:
            connection.close()
    
    @contextmanager
    def get_cursor(self, dictionary=True):
        with self.get_connection() as connection:
            cursor = connection.cursor(dictionary=dictionary)
            try:
                yield cursor
                connection.commit()
            except Error:
                connection.rollback()
                raise
            finally:
                cursor.close()
    
    def execute(self, query, params=None):
        with self.get_cursor() as cursor:
            cursor.execute(query, params or ())
            if query.strip().upper().startswith("SELECT"):
                return cursor.fetchall()
            return cursor.rowcount

# Global database instance
db = DatabaseManager()
\`\`\`

## Usage Example

\`\`\`python
# Initialize once at app startup
db.initialize(pool_size=10)

# Simple queries
users = db.execute("SELECT * FROM users WHERE active = %s", (True,))

# With cursor access
with db.get_cursor() as cursor:
    cursor.execute("SELECT * FROM products WHERE price > %s", (100,))
    products = cursor.fetchall()
    
    for product in products:
        cursor.execute(
            "UPDATE products SET featured = 1 WHERE id = %s",
            (product['id'],)
        )

# Complex transactions
with db.get_connection() as conn:
    cursor = conn.cursor()
    try:
        cursor.execute("UPDATE accounts SET balance = balance - 100 WHERE id = 1")
        cursor.execute("UPDATE accounts SET balance = balance + 100 WHERE id = 2")
        conn.commit()
    except Error:
        conn.rollback()
        raise
    finally:
        cursor.close()
\`\`\`

## Key Takeaways

1. **Use connection pooling** in production applications
2. **Always return connections** to the pool (use context managers)
3. **Handle errors properly** with rollback
4. **Configure pool size** based on your application's needs
5. **Use environment variables** for configuration
6. **Implement a singleton** database manager for consistency`
      },
      {
        id: "mysql-python-connection-pooling-4",
        title: "Practice Exercise",
        type: "exercise",
        order: 4,
        content: `# Practice Exercise: Build a User Management System

Apply everything you've learned to build a complete user management system.

## Task

Create a Python module that provides CRUD operations for a users table with:
- Connection pooling
- Proper error handling
- Transaction support
- Parameterized queries

## Requirements

1. Create a \`UserManager\` class with methods:
   - \`create_user(name, email, age)\` - Returns user ID
   - \`get_user(user_id)\` - Returns user dict or None
   - \`update_user(user_id, **fields)\` - Returns True/False
   - \`delete_user(user_id)\` - Returns True/False
   - \`list_users(limit=10, offset=0)\` - Returns list of users

2. All methods should:
   - Use connection pooling
   - Handle errors gracefully
   - Use parameterized queries
   - Return appropriate values

## Starter Code

\`\`\`python
import mysql.connector
from mysql.connector import pooling, Error

class UserManager:
    def __init__(self, pool):
        self.pool = pool
    
    def create_user(self, name, email, age):
        # Your code here
        pass
    
    def get_user(self, user_id):
        # Your code here
        pass
    
    def update_user(self, user_id, **fields):
        # Your code here
        pass
    
    def delete_user(self, user_id):
        # Your code here
        pass
    
    def list_users(self, limit=10, offset=0):
        # Your code here
        pass

# Test your implementation
if __name__ == "__main__":
    pool = pooling.MySQLConnectionPool(
        pool_size=5,
        host="localhost",
        user="root",
        password="your_password",
        database="testdb"
    )
    
    manager = UserManager(pool)
    
    # Test CRUD operations
    user_id = manager.create_user("Alice", "alice@example.com", 25)
    print(f"Created user: {user_id}")
    
    user = manager.get_user(user_id)
    print(f"Found user: {user}")
    
    manager.update_user(user_id, name="Alice Smith", age=26)
    
    users = manager.list_users()
    print(f"All users: {users}")
    
    manager.delete_user(user_id)
    print("User deleted")
\`\`\`

## Solution

Go to the **Python Lab** to implement and test your solution!

Hints:
- Use \`cursor.lastrowid\` after INSERT to get the new ID
- Build UPDATE query dynamically from \`**fields\`
- Remember to commit after INSERT/UPDATE/DELETE
- Use try/except/finally for cleanup`
      }
    ]
  }
]

// ============================================
// HTML & TAILWIND CSS LESSONS
// ============================================

const htmlTailwindLessons: Lesson[] = [
  {
    id: "html-basics",
    slug: "html-basics",
    title: "HTML Basics",
    topic: "HTML & Tailwind CSS",
    summary: "Learn the fundamentals of HTML: structure, elements, attributes, and semantic markup.",
    order: 1,
    published: true,
    sections: [
      {
        id: "html-basics-1",
        title: "What is HTML?",
        type: "concept",
        order: 1,
        content: `# What is HTML?

HTML stands for **HyperText Markup Language**. It's the standard language used to create web pages.

## Key Concepts

- **Markup Language**: HTML uses tags to structure content
- **HyperText**: Links between pages (hyperlinks)
- **Structure**: Defines the layout and organization of web content
- **Semantic**: HTML5 provides meaning to content, not just appearance

## Basic HTML Document Structure

Every HTML document follows this structure:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <!-- Your content goes here -->
</body>
</html>
\`\`\`

## Document Components

- **\`<!DOCTYPE html>\`**: Declares HTML5 document type
- **\`<html>\`**: Root element containing all content
- **\`<head>\`**: Metadata (title, styles, scripts) - not visible
- **\`<body>\`**: Visible content displayed to users

> HTML provides the **structure** of a webpage. CSS adds **styling**, and JavaScript adds **interactivity**.`
      },
      {
        id: "html-basics-2",
        title: "HTML Elements and Tags",
        type: "code",
        order: 2,
        content: `# HTML Elements and Tags

HTML elements are the building blocks of web pages. They consist of **tags** that wrap content.

## Tag Structure

Most HTML elements have an **opening tag** and a **closing tag**:

\`\`\`html
<tagname>Content goes here</tagname>
\`\`\`

## Common HTML Elements

### Headings

\`\`\`html
<h1>Main Heading (Largest)</h1>
<h2>Subheading</h2>
<h3>Smaller Heading</h3>
<h4>Even Smaller</h4>
<h5>Small</h5>
<h6>Smallest Heading</h6>
\`\`\`

### Paragraphs

\`\`\`html
<p>This is a paragraph. It contains multiple sentences and wraps automatically.</p>
\`\`\`

### Links

\`\`\`html
<a href="https://example.com">Click here</a>
<a href="/about.html">About Page</a>
<a href="#section1">Jump to Section</a>
\`\`\`

### Images

\`\`\`html
<img src="image.jpg" alt="Description of image">
\`\`\`

### Lists

\`\`\`html
<!-- Unordered List -->
<ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>

<!-- Ordered List -->
<ol>
    <li>First item</li>
    <li>Second item</li>
    <li>Third item</li>
</ol>
\`\`\`

### Line Breaks and Horizontal Rules

\`\`\`html
<p>First line<br>Second line</p>
<hr>
<p>Content after horizontal rule</p>
\`\`\`

## Self-Closing Tags

Some elements don't need closing tags:

\`\`\`html
<br>          <!-- Line break -->
<hr>          <!-- Horizontal rule -->
<img src="...">  <!-- Image -->
<input type="text">  <!-- Input field -->
\`\`\`

> **Best Practice**: In HTML5, self-closing tags can be written as \`<br>\` or \`<br />\`. Both are valid!`
      },
      {
        id: "html-basics-3",
        title: "HTML Attributes",
        type: "code",
        order: 3,
        content: `# HTML Attributes

Attributes provide additional information about HTML elements. They appear in the opening tag.

## Attribute Syntax

\`\`\`html
<element attribute="value">Content</element>
\`\`\`

## Common Attributes

### id and class

\`\`\`html
<div id="unique-element">Unique identifier</div>
<div class="group-element">Can be used multiple times</div>
<div class="red large">Multiple classes</div>
\`\`\`

- **\`id\`**: Unique identifier (use once per page)
- **\`class\`**: Reusable identifier (use multiple times)

### href (for links)

\`\`\`html
<a href="https://example.com">External Link</a>
<a href="/page.html">Internal Link</a>
<a href="#top">Anchor Link</a>
<a href="mailto:email@example.com">Email Link</a>
\`\`\`

### src and alt (for images)

\`\`\`html
<img src="photo.jpg" alt="A beautiful sunset">
<img src="/images/logo.png" alt="Company Logo">
\`\`\`

- **\`src\`**: Image source (path or URL)
- **\`alt\`**: Alternative text (important for accessibility)

### style (inline CSS)

\`\`\`html
<p style="color: blue; font-size: 20px;">Styled text</p>
<div style="background-color: yellow; padding: 10px;">Colored box</div>
\`\`\`

> **Note**: While \`style\` works, it's better to use CSS classes for styling!

## Boolean Attributes

Some attributes don't need values:

\`\`\`html
<input type="checkbox" checked>
<button disabled>Can't Click</button>
<input type="text" required>
\`\`\`

## Data Attributes

Custom attributes starting with \`data-\`:

\`\`\`html
<div data-user-id="123" data-role="admin">User Info</div>
\`\`\`

These are useful for JavaScript and CSS selectors.`
      },
      {
        id: "html-basics-4",
        title: "Semantic HTML Elements",
        type: "concept",
        order: 4,
        content: `# Semantic HTML Elements

Semantic HTML uses elements that **describe their meaning**, not just their appearance.

## Why Use Semantic HTML?

- **Accessibility**: Screen readers understand content better
- **SEO**: Search engines can better index your content
- **Maintainability**: Code is easier to read and understand
- **Future-proof**: Separates structure from styling

## Common Semantic Elements

### Document Structure

\`\`\`html
<header>
    <h1>Site Title</h1>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
</header>

<main>
    <article>
        <h2>Article Title</h2>
        <p>Article content...</p>
    </article>
    
    <aside>
        <h3>Sidebar</h3>
        <p>Related content...</p>
    </aside>
</main>

<footer>
    <p>&copy; 2024 My Website</p>
</footer>
\`\`\`

## Semantic Elements Explained

| Element | Purpose |
|---------|---------|
| \`<header>\` | Site header or article header |
| \`<nav>\` | Navigation links |
| \`<main>\` | Main content (one per page) |
| \`<article>\` | Independent, reusable content |
| \`<section>\` | Thematic grouping of content |
| \`<aside>\` | Sidebar or related content |
| \`<footer>\` | Site footer or article footer |

## Other Semantic Elements

\`\`\`html
<figure>
    <img src="chart.jpg" alt="Sales Chart">
    <figcaption>Monthly sales data</figcaption>
</figure>

<time datetime="2024-01-15">January 15, 2024</time>

<mark>Highlighted text</mark>

<strong>Important text</strong>
<em>Emphasized text</em>
\`\`\`

## Before vs After

**Before (Non-semantic):**
\`\`\`html
<div class="header">...</div>
<div class="content">...</div>
<div class="footer">...</div>
\`\`\`

**After (Semantic):**
\`\`\`html
<header>...</header>
<main>...</main>
<footer>...</footer>
\`\`\`

> Always prefer semantic HTML when possible!`
      },
      {
        id: "html-basics-5",
        title: "HTML Forms",
        type: "code",
        order: 5,
        content: `# HTML Forms

Forms allow users to input and submit data to a server.

## Basic Form Structure

\`\`\`html
<form action="/submit" method="POST">
    <!-- Form fields go here -->
    <button type="submit">Submit</button>
</form>
\`\`\`

- **\`action\`**: Where to send form data (URL)
- **\`method\`**: HTTP method (\`GET\` or \`POST\`)

## Input Types

### Text Input

\`\`\`html
<input type="text" name="username" placeholder="Enter username">
<input type="email" name="email" placeholder="your@email.com">
<input type="password" name="password" placeholder="Password">
<input type="tel" name="phone" placeholder="Phone number">
\`\`\`

### Number and Range

\`\`\`html
<input type="number" name="age" min="18" max="100">
<input type="range" name="volume" min="0" max="100" value="50">
\`\`\`

### Date and Time

\`\`\`html
<input type="date" name="birthday">
<input type="time" name="appointment">
<input type="datetime-local" name="event">
\`\`\`

### Checkboxes and Radio Buttons

\`\`\`html
<!-- Checkboxes (multiple selections) -->
<input type="checkbox" name="hobby" value="reading" id="reading">
<label for="reading">Reading</label>

<input type="checkbox" name="hobby" value="gaming" id="gaming">
<label for="gaming">Gaming</label>

<!-- Radio buttons (single selection) -->
<input type="radio" name="gender" value="male" id="male">
<label for="male">Male</label>

<input type="radio" name="gender" value="female" id="female">
<label for="female">Female</label>
\`\`\`

### Select Dropdown

\`\`\`html
<select name="country">
    <option value="">Choose a country</option>
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
</select>
\`\`\`

### Textarea

\`\`\`html
<textarea name="message" rows="4" cols="50" placeholder="Enter your message"></textarea>
\`\`\`

## Form Attributes

\`\`\`html
<input type="text" name="username" required>
<input type="email" name="email" required>
<input type="text" name="phone" pattern="[0-9]{10}">
<input type="text" name="username" minlength="3" maxlength="20">
\`\`\`

- **\`required\`**: Field must be filled
- **\`pattern\`**: Regex validation
- **\`minlength\`** / **\`maxlength\`**: Length constraints

## Complete Form Example

\`\`\`html
<form action="/register" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    
    <label for="age">Age:</label>
    <input type="number" id="age" name="age" min="18" required>
    
    <button type="submit">Register</button>
    <button type="reset">Clear</button>
</form>
\`\`\`

> Always use \`<label>\` elements with \`for\` attribute for better accessibility!`
      },
      {
        id: "html-basics-6",
        title: "Practice Exercise",
        type: "exercise",
        order: 6,
        content: `# HTML Basics Exercise

Create a complete HTML page with semantic elements and a contact form.

## Requirements

1. Create a valid HTML5 document structure
2. Include semantic elements: \`<header>\`, \`<nav>\`, \`<main>\`, \`<footer>\`
3. Add a contact form with:
   - Name field (required)
   - Email field (required, type="email")
   - Message textarea (required)
   - Submit button
4. Use proper labels for all form fields
5. Include at least one heading, paragraph, and list

## Starter Template

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us</title>
</head>
<body>
    <!-- Your code here -->
</body>
</html>
\`\`\`

## Solution Checklist

- [ ] Valid HTML5 doctype
- [ ] Semantic structure elements
- [ ] Contact form with all required fields
- [ ] Proper labels and accessibility
- [ ] Form validation attributes

Go to the **HTML + Tailwind Lab** to create and test your solution!`
      }
    ]
  },
  {
    id: "tailwind-css-basics",
    slug: "tailwind-css-basics",
    title: "Tailwind CSS Basics",
    topic: "HTML & Tailwind CSS",
    summary: "Master Tailwind CSS utility classes for rapid UI development: colors, spacing, typography, and layout.",
    order: 2,
    published: true,
    sections: [
      {
        id: "tailwind-basics-1",
        title: "What is Tailwind CSS?",
        type: "concept",
        order: 1,
        content: `# What is Tailwind CSS?

Tailwind CSS is a **utility-first CSS framework** that provides low-level utility classes to build custom designs quickly.

## Key Concepts

- **Utility-First**: Small, single-purpose classes
- **No Custom CSS**: Build everything with utility classes
- **Responsive**: Built-in responsive design utilities
- **Customizable**: Highly configurable design system

## Why Tailwind CSS?

### Advantages

- **Fast Development**: No need to write custom CSS
- **Consistent**: Design system ensures consistency
- **Small Bundle**: Only includes classes you use
- **Responsive**: Mobile-first responsive utilities
- **Flexible**: Easy to customize and extend

### Traditional CSS vs Tailwind

**Traditional CSS:**
\`\`\`css
.button {
    background-color: blue;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
}
\`\`\`

**Tailwind CSS:**
\`\`\`html
<button class="bg-blue-500 text-white px-6 py-3 rounded-lg">
    Click Me
</button>
\`\`\`

## Getting Started

### CDN Method (Quick Start)

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <h1 class="text-3xl font-bold text-blue-500">Hello Tailwind!</h1>
</body>
</html>
\`\`\`

### NPM Method (Production)

\`\`\`bash
npm install -D tailwindcss
npx tailwindcss init
\`\`\`

> For quick prototypes and learning, the CDN method is perfect!`
      },
      {
        id: "tailwind-basics-2",
        title: "Colors and Backgrounds",
        type: "code",
        order: 2,
        content: `# Colors and Backgrounds

Tailwind provides a comprehensive color palette with multiple shades.

## Color Palette

Tailwind includes colors like: \`red\`, \`blue\`, \`green\`, \`yellow\`, \`purple\`, \`gray\`, \`indigo\`, \`pink\`, etc.

Each color has shades from 50 (lightest) to 900 (darkest).

## Text Colors

\`\`\`html
<p class="text-blue-500">Blue text</p>
<p class="text-red-600">Red text</p>
<p class="text-gray-800">Dark gray text</p>
<p class="text-white">White text</p>
\`\`\`

## Background Colors

\`\`\`html
<div class="bg-blue-500">Blue background</div>
<div class="bg-red-100">Light red background</div>
<div class="bg-gray-900">Dark background</div>
<div class="bg-white">White background</div>
\`\`\`

## Border Colors

\`\`\`html
<div class="border-2 border-blue-500">Blue border</div>
<div class="border border-red-300">Light red border</div>
\`\`\`

## Common Color Examples

\`\`\`html
<!-- Buttons -->
<button class="bg-blue-500 text-white hover:bg-blue-600">
    Primary Button
</button>

<button class="bg-green-500 text-white hover:bg-green-600">
    Success Button
</button>

<!-- Cards -->
<div class="bg-white border border-gray-200">
    <h2 class="text-gray-800">Card Title</h2>
    <p class="text-gray-600">Card content</p>
</div>

<!-- Alerts -->
<div class="bg-red-100 border-l-4 border-red-500 text-red-700">
    Error message
</div>
\`\`\`

## Color Shade Reference

| Shade | Usage |
|-------|-------|
| 50-100 | Very light backgrounds |
| 200-300 | Light borders, subtle backgrounds |
| 400-500 | Primary colors, buttons |
| 600-700 | Hover states, emphasis |
| 800-900 | Dark text, dark backgrounds |

## Opacity

\`\`\`html
<div class="bg-blue-500/50">50% opacity</div>
<div class="bg-blue-500/75">75% opacity</div>
<div class="text-gray-600/50">Semi-transparent text</div>
\`\`\`

> Use color shades consistently for a cohesive design!`
      },
      {
        id: "tailwind-basics-3",
        title: "Spacing and Sizing",
        type: "code",
        order: 3,
        content: `# Spacing and Sizing

Tailwind uses a consistent spacing scale for padding, margins, and sizing.

## Spacing Scale

Tailwind's spacing scale: \`0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96\`

Each number represents **0.25rem** (4px). So \`p-4\` = 1rem = 16px.

## Padding

\`\`\`html
<div class="p-4">Padding all sides</div>
<div class="px-4">Padding horizontal (left/right)</div>
<div class="py-4">Padding vertical (top/bottom)</div>
<div class="pt-4">Padding top</div>
<div class="pr-4">Padding right</div>
<div class="pb-4">Padding bottom</div>
<div class="pl-4">Padding left</div>
\`\`\`

## Margin

\`\`\`html
<div class="m-4">Margin all sides</div>
<div class="mx-4">Margin horizontal</div>
<div class="my-4">Margin vertical</div>
<div class="mt-4">Margin top</div>
<div class="mb-4">Margin bottom</div>
\`\`\`

## Width and Height

\`\`\`html
<div class="w-full">Full width</div>
<div class="w-1/2">Half width</div>
<div class="w-64">Fixed width (256px)</div>
<div class="h-screen">Full screen height</div>
<div class="h-32">Fixed height (128px)</div>
\`\`\`

## Common Patterns

\`\`\`html
<!-- Container with padding -->
<div class="container mx-auto px-4">
    Content here
</div>

<!-- Card with spacing -->
<div class="p-6 m-4 bg-white rounded-lg">
    <h2 class="mb-4">Title</h2>
    <p class="mb-2">Content</p>
</div>

<!-- Button with padding -->
<button class="px-6 py-3">Click Me</button>

<!-- Flexbox with gap -->
<div class="flex gap-4">
    <div class="flex-1">Item 1</div>
    <div class="flex-1">Item 2</div>
</div>
\`\`\`

## Max Width

\`\`\`html
<div class="max-w-md">Max width medium</div>
<div class="max-w-lg">Max width large</div>
<div class="max-w-xl">Max width extra large</div>
<div class="max-w-2xl">Max width 2x large</div>
<div class="max-w-4xl">Max width 4x large</div>
<div class="max-w-6xl">Max width 6x large</div>
\`\`\`

## Negative Margins

\`\`\`html
<div class="-mt-4">Negative margin top</div>
<div class="-ml-2">Negative margin left</div>
\`\`\`

> Use consistent spacing values throughout your design for visual harmony!`
      },
      {
        id: "tailwind-basics-4",
        title: "Typography",
        type: "code",
        order: 4,
        content: `# Typography

Tailwind provides utilities for font sizes, weights, styles, and text alignment.

## Font Sizes

\`\`\`html
<p class="text-xs">Extra small (12px)</p>
<p class="text-sm">Small (14px)</p>
<p class="text-base">Base (16px)</p>
<p class="text-lg">Large (18px)</p>
<p class="text-xl">Extra large (20px)</p>
<p class="text-2xl">2x large (24px)</p>
<p class="text-3xl">3x large (30px)</p>
<p class="text-4xl">4x large (36px)</p>
<p class="text-5xl">5x large (48px)</p>
<p class="text-6xl">6x large (60px)</p>
\`\`\`

## Font Weights

\`\`\`html
<p class="font-thin">Thin (100)</p>
<p class="font-light">Light (300)</p>
<p class="font-normal">Normal (400)</p>
<p class="font-medium">Medium (500)</p>
<p class="font-semibold">Semibold (600)</p>
<p class="font-bold">Bold (700)</p>
<p class="font-extrabold">Extrabold (800)</p>
\`\`\`

## Text Alignment

\`\`\`html
<p class="text-left">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>
<p class="text-justify">Justified</p>
\`\`\`

## Text Colors

\`\`\`html
<p class="text-gray-900">Dark text</p>
<p class="text-gray-600">Medium text</p>
<p class="text-gray-400">Light text</p>
<p class="text-blue-600">Colored text</p>
\`\`\`

## Text Styles

\`\`\`html
<p class="italic">Italic text</p>
<p class="underline">Underlined text</p>
<p class="line-through">Strikethrough</p>
<p class="uppercase">UPPERCASE</p>
<p class="lowercase">lowercase</p>
<p class="capitalize">capitalize each word</p>
\`\`\`

## Line Height

\`\`\`html
<p class="leading-none">Tight line height</p>
<p class="leading-tight">Tighter line height</p>
<p class="leading-normal">Normal line height</p>
<p class="leading-relaxed">Relaxed line height</p>
<p class="leading-loose">Loose line height</p>
\`\`\`

## Letter Spacing

\`\`\`html
<p class="tracking-tighter">Tighter spacing</p>
<p class="tracking-tight">Tight spacing</p>
<p class="tracking-normal">Normal spacing</p>
<p class="tracking-wide">Wide spacing</p>
<p class="tracking-wider">Wider spacing</p>
\`\`\`

## Common Typography Patterns

\`\`\`html
<!-- Heading -->
<h1 class="text-4xl font-bold text-gray-900 mb-4">
    Page Title
</h1>

<!-- Subheading -->
<h2 class="text-2xl font-semibold text-gray-800 mb-2">
    Section Title
</h2>

<!-- Body text -->
<p class="text-base text-gray-600 leading-relaxed">
    This is body text with comfortable line height.
</p>

<!-- Small text -->
<p class="text-sm text-gray-500">
    Small helper text or caption
</p>

<!-- Link -->
<a href="#" class="text-blue-600 hover:text-blue-800 underline">
    Click here
</a>
\`\`\`

## Text Overflow

\`\`\`html
<p class="truncate">Long text that gets truncated...</p>
<p class="overflow-hidden text-ellipsis">Text with ellipsis</p>
\`\`\`

> Typography is crucial for readability - use appropriate sizes and weights!`
      },
      {
        id: "tailwind-basics-5",
        title: "Layout with Flexbox and Grid",
        type: "code",
        order: 5,
        content: `# Layout with Flexbox and Grid

Tailwind makes it easy to create layouts using Flexbox and CSS Grid.

## Flexbox

### Basic Flex Container

\`\`\`html
<div class="flex">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
\`\`\`

### Flex Direction

\`\`\`html
<div class="flex flex-row">Horizontal (default)</div>
<div class="flex flex-col">Vertical</div>
<div class="flex flex-row-reverse">Reverse horizontal</div>
<div class="flex flex-col-reverse">Reverse vertical</div>
\`\`\`

### Alignment

\`\`\`html
<!-- Justify Content (horizontal) -->
<div class="flex justify-start">Start</div>
<div class="flex justify-center">Center</div>
<div class="flex justify-end">End</div>
<div class="flex justify-between">Space between</div>
<div class="flex justify-around">Space around</div>
<div class="flex justify-evenly">Space evenly</div>

<!-- Align Items (vertical) -->
<div class="flex items-start">Start</div>
<div class="flex items-center">Center</div>
<div class="flex items-end">End</div>
<div class="flex items-stretch">Stretch</div>
\`\`\`

### Flex Properties

\`\`\`html
<div class="flex">
    <div class="flex-1">Grows to fill space</div>
    <div class="flex-none">Doesn't grow</div>
    <div class="flex-auto">Grows if needed</div>
</div>
\`\`\`

### Gap

\`\`\`html
<div class="flex gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
\`\`\`

## CSS Grid

### Basic Grid

\`\`\`html
<div class="grid grid-cols-3 gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
\`\`\`

### Grid Columns

\`\`\`html
<div class="grid grid-cols-1">1 column</div>
<div class="grid grid-cols-2">2 columns</div>
<div class="grid grid-cols-3">3 columns</div>
<div class="grid grid-cols-4">4 columns</div>
<div class="grid grid-cols-12">12 columns</div>
\`\`\`

### Column Span

\`\`\`html
<div class="grid grid-cols-4 gap-4">
    <div class="col-span-2">Spans 2 columns</div>
    <div class="col-span-1">1 column</div>
    <div class="col-span-1">1 column</div>
</div>
\`\`\`

### Grid Rows

\`\`\`html
<div class="grid grid-rows-3 gap-4">
    <div>Row 1</div>
    <div>Row 2</div>
    <div>Row 3</div>
</div>
\`\`\`

## Common Layout Patterns

\`\`\`html
<!-- Centered Container -->
<div class="flex items-center justify-center min-h-screen">
    <div class="text-center">Centered content</div>
</div>

<!-- Card Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="p-6 bg-white rounded-lg">Card 1</div>
    <div class="p-6 bg-white rounded-lg">Card 2</div>
    <div class="p-6 bg-white rounded-lg">Card 3</div>
</div>

<!-- Sidebar Layout -->
<div class="flex">
    <aside class="w-64">Sidebar</aside>
    <main class="flex-1">Main content</main>
</div>

<!-- Navigation Bar -->
<nav class="flex items-center justify-between p-4">
    <div class="font-bold">Logo</div>
    <div class="flex gap-4">
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
    </div>
</nav>
\`\`\`

> Flexbox for 1D layouts, Grid for 2D layouts. Choose based on your needs!`
      },
      {
        id: "tailwind-basics-6",
        title: "Responsive Design",
        type: "code",
        order: 6,
        content: `# Responsive Design

Tailwind uses a **mobile-first** approach with breakpoint prefixes.

## Breakpoints

| Prefix | Min Width | Usage |
|--------|-----------|-------|
| (none) | 0px | Mobile (default) |
| \`sm:\` | 640px | Small tablets |
| \`md:\` | 768px | Tablets |
| \`lg:\` | 1024px | Desktops |
| \`xl:\` | 1280px | Large desktops |
| \`2xl:\` | 1536px | Extra large screens |

## Mobile-First Approach

Start with mobile styles, then add larger breakpoints:

\`\`\`html
<!-- Mobile: 1 column, Desktop: 3 columns -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
\`\`\`

## Responsive Examples

### Typography

\`\`\`html
<h1 class="text-2xl md:text-4xl lg:text-5xl">
    Responsive Heading
</h1>
\`\`\`

### Spacing

\`\`\`html
<div class="p-4 md:p-6 lg:p-8">
    Responsive padding
</div>
\`\`\`

### Layout

\`\`\`html
<!-- Stack on mobile, side-by-side on desktop -->
<div class="flex flex-col md:flex-row gap-4">
    <div class="flex-1">Left</div>
    <div class="flex-1">Right</div>
</div>
\`\`\`

### Visibility

\`\`\`html
<!-- Hide on mobile, show on desktop -->
<div class="hidden md:block">Desktop only</div>

<!-- Show on mobile, hide on desktop -->
<div class="block md:hidden">Mobile only</div>
\`\`\`

### Grid Columns

\`\`\`html
<!-- 1 col mobile, 2 cols tablet, 4 cols desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
    <div>Item 4</div>
</div>
\`\`\`

## Common Responsive Patterns

\`\`\`html
<!-- Responsive Container -->
<div class="container mx-auto px-4 md:px-6 lg:px-8">
    Content
</div>

<!-- Responsive Card -->
<div class="p-4 md:p-6 lg:p-8 bg-white rounded-lg">
    <h2 class="text-xl md:text-2xl font-bold mb-2 md:mb-4">
        Card Title
    </h2>
    <p class="text-sm md:text-base">
        Card content
    </p>
</div>

<!-- Responsive Navigation -->
<nav class="flex flex-col md:flex-row items-center justify-between p-4">
    <div class="mb-4 md:mb-0">Logo</div>
    <div class="flex gap-4">
        <a href="#">Link 1</a>
        <a href="#">Link 2</a>
    </div>
</nav>
\`\`\`

## Testing Responsive Design

1. Use browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes
4. Check breakpoints: 640px, 768px, 1024px, 1280px

> Always design mobile-first, then enhance for larger screens!`
      },
      {
        id: "tailwind-basics-7",
        title: "Practice Exercise",
        type: "exercise",
        order: 7,
        content: `# Tailwind CSS Exercise

Create a responsive card layout with Tailwind CSS.

## Requirements

1. Create a grid of cards (3 columns on desktop, 2 on tablet, 1 on mobile)
2. Each card should have:
   - Image placeholder
   - Title (large, bold)
   - Description text
   - Button with hover effect
   - Shadow and rounded corners
3. Use responsive spacing and typography
4. Add a header with navigation
5. Use Tailwind colors, spacing, and utilities

## Starter Template

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind Cards</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Your code here -->
</body>
</html>
\`\`\`

## Solution Checklist

- [ ] Responsive grid layout
- [ ] Cards with proper styling
- [ ] Responsive typography
- [ ] Hover effects on buttons
- [ ] Mobile-first approach
- [ ] Proper spacing and colors

Go to the **HTML + Tailwind Lab** to create and test your solution!`
      }
    ]
  }
]

// ============================================
// EXPORTS
// ============================================

export const allLessons: Lesson[] = [...pythonLessons, ...sqlLessons, ...mysqlPythonLessons, ...htmlTailwindLessons]

export function getLessonBySlug(slug: string): Lesson | undefined {
  return allLessons.find(lesson => lesson.slug === slug)
}

export function getLessonsByTopic(topic: string): Lesson[] {
  return allLessons.filter(lesson => lesson.topic === topic && lesson.published)
}

export function getPublishedLessons(): Lesson[] {
  return allLessons.filter(lesson => lesson.published)
}

export function getLessonTopics(): string[] {
  const topics = new Set(allLessons.filter(l => l.published).map(l => l.topic))
  return Array.from(topics)
}

export function getNextLesson(currentSlug: string): Lesson | undefined {
  const current = getLessonBySlug(currentSlug)
  if (!current) return undefined
  
  const sameTopic = getLessonsByTopic(current.topic).sort((a, b) => a.order - b.order)
  const currentIndex = sameTopic.findIndex(l => l.slug === currentSlug)
  return sameTopic[currentIndex + 1]
}

export function getPrevLesson(currentSlug: string): Lesson | undefined {
  const current = getLessonBySlug(currentSlug)
  if (!current) return undefined
  
  const sameTopic = getLessonsByTopic(current.topic).sort((a, b) => a.order - b.order)
  const currentIndex = sameTopic.findIndex(l => l.slug === currentSlug)
  return currentIndex > 0 ? sameTopic[currentIndex - 1] : undefined
}
