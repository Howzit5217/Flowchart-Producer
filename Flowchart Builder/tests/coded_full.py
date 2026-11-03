"""Whole programs, the way people write them -- a menu that loops,
classes built on classes, exceptions thrown in one function and caught in
another, maps and lists together -- in the five languages the page writes,
and the small cases the work on them turned up (a TAX beside a tax, a
caught error's name, a Map spread into pairs, a method named push).

Each is read with no language handed over, run by the runner with the
answers typed in, and has to print `want`: what the program prints -- run
for real here (Python, JavaScript, Java) and compared, or worked out by
hand (C#, C++) -- in the runner's way of writing it: True for true, 5 for
5.0, 12 for C#'s decimal 12.00.

Same shape as coded.py: (what it is about, language, the code, what
gets typed, what it prints).
"""

# flake8: noqa

# A file's name typed in, the file opened, and what is in it added up --
# the numbers a tab of their own beside the program.
ANALYZER = r'''# Numbers File Analyzer
import sys

filename = input("Enter the name of the file: ")
try:
    infile = open(filename, "r")
except IOError:
    print("Error: the file", filename, "could not be opened.")
    sys.exit()

count = 0
total = 0.0
largest = 0.0
smallest = 0.0
print()
print("Numbers in the file:")
for line in infile:
    line = line.strip()
    if line != "":
        number = float(line)
        print(number)
        count += 1
        total += number
        if count == 1:
            largest = number
            smallest = number
        else:
            if number > largest:
                largest = number
            if number < smallest:
                smallest = number
infile.close()
print()
if count == 0:
    print("The file contains no numbers.")
else:
    average = total / count
    print("Count of numbers:", count)
    print("Sum of the numbers:", total)
    print("Average of the numbers:", format(average, ",.2f"))
    print("Largest number:", largest)
    print("Smallest number:", smallest)
'''

CODED = [
    ('py bank accounts', 'python', r'''
"""Bank account manager.

A small program to practise classes.
"""


class InsufficientFunds(Exception):
    pass


class Account:
    interest_rate = 0.02
    count = 0

    def __init__(self, owner, balance=0.0):
        self.owner = owner
        self.balance = balance
        self.history = []
        Account.count += 1

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.balance += amount
        self.history.append(("deposit", amount))

    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFunds(f"Only {self.balance:.2f} available")
        self.balance -= amount
        self.history.append(("withdraw", amount))

    def add_interest(self):
        gained = self.balance * Account.interest_rate
        self.balance += gained
        return gained

    def __str__(self):
        return f"{self.owner}: ${self.balance:,.2f}"


def find_account(accounts, name):
    for acct in accounts:
        if acct.owner.lower() == name.lower():
            return acct
    return None


def show_menu():
    print()
    print("1) Deposit  2) Withdraw  3) Interest  4) List  5) Quit")


def main():
    accounts = [Account("Alice", 100), Account("Bob"), Account("Cara", 2500.5)]
    print(f"{Account.count} accounts loaded")
    while True:
        show_menu()
        choice = input("Choice: ").strip()
        if choice == "5":
            print("Goodbye!")
            break
        if choice == "4":
            for a in sorted(accounts, key=lambda a: a.balance, reverse=True):
                print(a)
            continue
        name = input("Name: ")
        acct = find_account(accounts, name)
        if acct is None:
            print("No such account")
            continue
        try:
            if choice == "1":
                amount = float(input("Amount: "))
                acct.deposit(amount)
                print("Deposited.", acct)
            elif choice == "2":
                amount = float(input("Amount: "))
                acct.withdraw(amount)
                print("Withdrew.", acct)
            elif choice == "3":
                gained = acct.add_interest()
                print(f"Interest added: {gained:.2f}")
            else:
                print("Unknown choice")
        except ValueError as e:
            print("Error:", e)
        except InsufficientFunds as e:
            print("Sorry.", e)
    total = sum(a.balance for a in accounts)
    print(f"Total held: {total:.2f}")


if __name__ == "__main__":
    main()
''', ['1', 'alice', '50', '2', 'Bob', '10', '3', 'cara', '1', 'dave', '4', '2', 'alice', '20', '5'],
     ['3 accounts loaded', '', '1) Deposit  2) Withdraw  3) Interest  4) List  5) Quit', 'Choice: ', 'Name: ', 'Amount: ', 'Deposited. Alice: $150.00', '', '1) Deposit  2) Withdraw  3) Interest  4) List  5) Quit', 'Choice: ', 'Name: ', 'Amount: ', 'Sorry. Only 0.00 available', '', '1) Deposit  2) Withdraw  3) Interest  4) List  5) Quit', 'Choice: ', 'Name: ', 'Interest added: 50.01', '', '1) Deposit  2) Withdraw  3) Interest  4) List  5) Quit', 'Choice: ', 'Name: ', 'No such account', '', '1) Deposit  2) Withdraw  3) Interest  4) List  5) Quit', 'Choice: ', 'Cara: $2,550.51', 'Alice: $150.00', 'Bob: $0.00', '', '1) Deposit  2) Withdraw  3) Interest  4) List  5) Quit', 'Choice: ', 'Name: ', 'Amount: ', 'Withdrew. Alice: $130.00', '', '1) Deposit  2) Withdraw  3) Interest  4) List  5) Quit', 'Choice: ', 'Goodbye!', 'Total held: 2680.51']),
    ('py gradebook', 'python', r'''
# Gradebook: averages, letter grades and a report table
from statistics import mean

GRADE_BOUNDS = [(90, "A"), (80, "B"), (70, "C"), (60, "D")]


def letter(score):
    for bound, grade in GRADE_BOUNDS:
        if score >= bound:
            return grade
    return "F"


def read_scores(count):
    scores = []
    for i in range(count):
        while True:
            raw = input(f"Score {i + 1}: ")
            if raw.isdigit() and 0 <= int(raw) <= 100:
                scores.append(int(raw))
                break
            print("Please type a whole number from 0 to 100")
    return scores


def report(students):
    print(f"{'Name':<10}{'Avg':>6}  Grade")
    print("-" * 23)
    for name, scores in students.items():
        avg = mean(scores)
        print(f"{name:<10}{avg:>6.1f}  {letter(avg)}")
    best = max(students, key=lambda n: mean(students[n]))
    print(f"Top student: {best}")


def main():
    students = {}
    n = int(input("How many students? "))
    for _ in range(n):
        name = input("Name: ").title()
        students[name] = read_scores(3)
    report(students)
    all_scores = [s for scores in students.values() for s in scores]
    print("Highest single score:", max(all_scores))
    passed = [n for n, s in students.items() if mean(s) >= 60]
    print("Passed:", ", ".join(passed) if passed else "nobody")


main()
''', ['2', 'ann smith', '95', 'abc', '88', '91', 'bo', '40', '65', '105', '58'],
     ['How many students? ', 'Name: ', 'Score 1: ', 'Score 2: ', 'Please type a whole number from 0 to 100', 'Score 2: ', 'Score 3: ', 'Name: ', 'Score 1: ', 'Score 2: ', 'Score 3: ', 'Please type a whole number from 0 to 100', 'Score 3: ', 'Name         Avg  Grade', '-----------------------', 'Ann Smith   91.3  A', 'Bo          54.3  F', 'Top student: Ann Smith', 'Highest single score: 95', 'Passed: Ann Smith']),
    ('py tic tac toe', 'python', r'''
# Two-player noughts and crosses

def make_board():
    return [[" "] * 3 for _ in range(3)]


def print_board(board):
    for r, row in enumerate(board):
        print(" " + " | ".join(row))
        if r < 2:
            print("---+---+---")


def winner(board):
    lines = []
    lines.extend(board)
    lines.extend([[board[r][c] for r in range(3)] for c in range(3)])
    lines.append([board[i][i] for i in range(3)])
    lines.append([board[i][2 - i] for i in range(3)])
    for line in lines:
        if line[0] != " " and line.count(line[0]) == 3:
            return line[0]
    return None


def full(board):
    return all(cell != " " for row in board for cell in row)


def play():
    board = make_board()
    player = "X"
    while True:
        print_board(board)
        move = input(f"Player {player}, row and column (e.g. 1 3): ").split()
        if len(move) != 2 or not all(m.isdigit() for m in move):
            print("Type two numbers")
            continue
        r, c = int(move[0]) - 1, int(move[1]) - 1
        if not (0 <= r < 3 and 0 <= c < 3) or board[r][c] != " ":
            print("You can't go there")
            continue
        board[r][c] = player
        won = winner(board)
        if won:
            print_board(board)
            print(f"{won} wins!")
            return won
        if full(board):
            print_board(board)
            print("It's a draw")
            return None
        player = "O" if player == "X" else "X"


if __name__ == "__main__":
    play()
''', ['1 1', '1 1', '2 2', '1 2', '3 3', '1 3', 'x y', '2 1'],
     ['   |   |  ', '---+---+---', '   |   |  ', '---+---+---', '   |   |  ', 'Player X, row and column (e.g. 1 3): ', ' X |   |  ', '---+---+---', '   |   |  ', '---+---+---', '   |   |  ', 'Player O, row and column (e.g. 1 3): ', "You can't go there", ' X |   |  ', '---+---+---', '   |   |  ', '---+---+---', '   |   |  ', 'Player O, row and column (e.g. 1 3): ', ' X |   |  ', '---+---+---', '   | O |  ', '---+---+---', '   |   |  ', 'Player X, row and column (e.g. 1 3): ', ' X | X |  ', '---+---+---', '   | O |  ', '---+---+---', '   |   |  ', 'Player O, row and column (e.g. 1 3): ', ' X | X |  ', '---+---+---', '   | O |  ', '---+---+---', '   |   | O', 'Player X, row and column (e.g. 1 3): ', ' X | X | X', '---+---+---', '   | O |  ', '---+---+---', '   |   | O', 'X wins!']),
    ('py shapes inheritance', 'python', r'''
import math


class Shape:
    def __init__(self, name):
        self.name = name

    def area(self):
        return 0

    def perimeter(self):
        return 0

    def describe(self):
        return f"{self.name}: area {self.area():.2f}, perimeter {self.perimeter():.2f}"


class Circle(Shape):
    def __init__(self, radius):
        super().__init__("Circle")
        self.radius = radius

    def area(self):
        return math.pi * self.radius ** 2

    def perimeter(self):
        return 2 * math.pi * self.radius


class Rectangle(Shape):
    def __init__(self, width, height):
        super().__init__("Rectangle")
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)


class Square(Rectangle):
    def __init__(self, side):
        super().__init__(side, side)
        self.name = "Square"


def largest(shapes):
    best = shapes[0]
    for s in shapes[1:]:
        if s.area() > best.area():
            best = s
    return best


shapes = [Circle(2), Rectangle(3, 4.5), Square(3)]
for shape in shapes:
    print(shape.describe())
    if isinstance(shape, Rectangle):
        print("  (has four sides)")
big = largest(shapes)
print("Largest is the", big.name.lower())
total_area = sum(s.area() for s in shapes)
print(f"Total area: {round(total_area, 3)}")
''', [],
     ['Circle: area 12.57, perimeter 12.57', 'Rectangle: area 13.50, perimeter 15.00', '  (has four sides)', 'Square: area 9.00, perimeter 12.00', '  (has four sides)', 'Largest is the rectangle', 'Total area: 35.066']),
    ('py word stats', 'python', r'''
# Counts the words in some sentences typed in, until a blank line.

def clean(word):
    return "".join(ch for ch in word.lower() if ch.isalpha())


def count_words(lines):
    counts = {}
    for line in lines:
        for word in line.split():
            w = clean(word)
            if w:
                counts[w] = counts.get(w, 0) + 1
    return counts


def is_palindrome(word):
    return len(word) > 1 and word == word[::-1]


lines = []
while True:
    line = input("Sentence (blank to stop): ")
    if line == "":
        break
    lines.append(line)

counts = count_words(lines)
print("Different words:", len(counts))
common = sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:3]
for word, n in common:
    print(f"{word:>8} x{n}")
pals = sorted({w for w in counts if is_palindrome(w)})
print("Palindromes:", pals)
longest = max(counts, key=len)
print("Longest word:", longest, "(" + str(len(longest)) + " letters)")
vowels = sum(1 for line in lines for ch in line.lower() if ch in "aeiou")
print(f"Vowels: {vowels}")
''', ['Anna saw a racecar at noon', 'The racecar was red, Anna said', 'Noon is noon!', ''],
     ['Sentence (blank to stop): ', 'Sentence (blank to stop): ', 'Sentence (blank to stop): ', 'Sentence (blank to stop): ', 'Different words: 11', '    noon x3', '    anna x2', ' racecar x2', "Palindromes: ['anna', 'noon', 'racecar']", 'Longest word: racecar (7 letters)', 'Vowels: 25']),
    ('py inventory', 'python', r'''
inventory = {
    "apple": {"price": 0.5, "qty": 40},
    "bread": {"price": 2.25, "qty": 10},
    "milk": {"price": 1.1, "qty": 0},
}


def restock(item, amount):
    if item not in inventory:
        inventory[item] = {"price": 1.0, "qty": 0}
        print(f"New item {item} added at $1.00")
    inventory[item]["qty"] += amount


def sell(item, amount):
    stock = inventory.get(item)
    if not stock:
        return "unknown item"
    if stock["qty"] < amount:
        return f"only {stock['qty']} left"
    stock["qty"] -= amount
    return f"sold {amount} for ${stock['price'] * amount:.2f}"


def value():
    return sum(d["price"] * d["qty"] for d in inventory.values())


print(sell("apple", 5))
print(sell("milk", 1))
print(sell("cheese", 1))
restock("milk", 12)
restock("jam", 3)
print(sell("milk", 2))
out_of_stock = [name for name, d in inventory.items() if d["qty"] == 0]
print("Out of stock:", out_of_stock or "none")
for name in sorted(inventory):
    d = inventory[name]
    print(f"{name:<6} {d['qty']:>3} @ {d['price']:.2f}")
print(f"Stock value: ${value():.2f}")
del inventory["jam"]
print("Items now:", ", ".join(inventory.keys()))
''', [],
     ['sold 5 for $2.50', 'only 0 left', 'unknown item', 'New item jam added at $1.00', 'sold 2 for $2.20', 'Out of stock: none', 'apple   35 @ 0.50', 'bread   10 @ 2.25', 'jam      3 @ 1.00', 'milk    10 @ 1.10', 'Stock value: $54.00', 'Items now: apple, bread, milk']),
    ('py algorithms', 'python', r'''
def bubble_sort(items):
    items = items[:]
    n = len(items)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
                swapped = True
        if not swapped:
            break
    return items


def binary_search(items, target):
    low, high = 0, len(items) - 1
    steps = 0
    while low <= high:
        steps += 1
        mid = (low + high) // 2
        if items[mid] == target:
            return mid, steps
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1, steps


def merge_sort(xs):
    if len(xs) <= 1:
        return xs
    mid = len(xs) // 2
    left, right = merge_sort(xs[:mid]), merge_sort(xs[mid:])
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    return merged + left[i:] + right[j:]


memo = {}


def fib(n):
    if n in memo:
        return memo[n]
    result = n if n < 2 else fib(n - 1) + fib(n - 2)
    memo[n] = result
    return result


def gcd(a, b):
    while b:
        a, b = b, a % b
    return a


data = [29, 3, 17, 8, 42, 15, 4, 23]
print("Bubble:", bubble_sort(data))
print("Merge: ", merge_sort(data))
print("Original unchanged:", data)
ordered = merge_sort(data)
for target in (17, 5):
    where, steps = binary_search(ordered, target)
    print(f"Search {target}: index {where} after {steps} steps")
print("Fib 30 =", fib(30))
print("GCD(84, 36) =", gcd(84, 36))
print("Squares of evens:", [x * x for x in data if x % 2 == 0])
''', [],
     ['Bubble: [3, 4, 8, 15, 17, 23, 29, 42]', 'Merge:  [3, 4, 8, 15, 17, 23, 29, 42]', 'Original unchanged: [29, 3, 17, 8, 42, 15, 4, 23]', 'Search 17: index 4 after 3 steps', 'Search 5: index -1 after 3 steps', 'Fib 30 = 832040', 'GCD(84, 36) = 12', 'Squares of evens: [64, 1764, 16]']),
    ('js library system', 'javascript', r'''
"use strict";

class Book {
  constructor(title, author, year, copies = 1) {
    this.title = title;
    this.author = author;
    this.year = year;
    this.copies = copies;
    this.onLoan = 0;
  }

  get available() {
    return this.copies - this.onLoan;
  }

  lend() {
    if (this.available <= 0) {
      throw new Error(`No copies of "${this.title}" left`);
    }
    this.onLoan++;
  }

  giveBack() {
    if (this.onLoan > 0) this.onLoan--;
  }

  toString() {
    return `${this.title} by ${this.author} (${this.year}) - ${this.available}/${this.copies}`;
  }
}

class Library {
  constructor() {
    this.books = [];
    this.log = new Map();
  }

  add(book) {
    this.books.push(book);
    return this;
  }

  find(text) {
    const t = text.toLowerCase();
    return this.books.filter(b => b.title.toLowerCase().includes(t) || b.author.toLowerCase().includes(t));
  }

  borrow(title, who) {
    const book = this.books.find(b => b.title === title);
    if (!book) {
      console.log(`We don't have ${title}`);
      return false;
    }
    try {
      book.lend();
      const list = this.log.get(who) || [];
      list.push(title);
      this.log.set(who, list);
      console.log(`${who} borrowed ${title}`);
      return true;
    } catch (err) {
      console.log("Sorry: " + err.message);
      return false;
    }
  }
}

const lib = new Library();
lib.add(new Book("Dune", "Frank Herbert", 1965, 2))
   .add(new Book("Emma", "Jane Austen", 1815))
   .add(new Book("Hyperion", "Dan Simmons", 1989, 3));

lib.borrow("Dune", "Ana");
lib.borrow("Dune", "Ben");
lib.borrow("Dune", "Cy");
lib.borrow("Emma", "Ana");
lib.borrow("Ulysses", "Ben");

console.log("Search 'an':");
for (const b of lib.find("an")) {
  console.log("  " + b.toString());
}

const byDecade = {};
lib.books.forEach(b => {
  const decade = Math.floor(b.year / 10) * 10;
  byDecade[decade] = (byDecade[decade] || 0) + 1;
});
Object.entries(byDecade).sort((a, b) => a[0] - b[0]).forEach(([d, n]) => console.log(`${d}s: ${n}`));

for (const [who, titles] of lib.log) {
  console.log(`${who}: ${titles.join(", ")}`);
}
const oldest = lib.books.reduce((a, b) => (a.year < b.year ? a : b));
console.log("Oldest:", oldest.title);
const total = lib.books.map(b => b.available).reduce((s, n) => s + n, 0);
console.log(`Copies on the shelf: ${total}`);
''', [],
     ['Ana borrowed Dune', 'Ben borrowed Dune', 'Sorry: No copies of "Dune" left', 'Ana borrowed Emma', "We don't have Ulysses", "Search 'an':", '  Dune by Frank Herbert (1965) - 0/2', '  Emma by Jane Austen (1815) - 0/1', '  Hyperion by Dan Simmons (1989) - 3/3', '1810s: 1', '1960s: 1', '1980s: 1', 'Ana: Dune, Emma', 'Ben: Dune', 'Oldest: Emma', 'Copies on the shelf: 3']),
    ('js quiz with prompt-sync', 'javascript', r'''
const prompt = require("prompt-sync")();

const questions = [
  { q: "Capital of France?", options: ["Paris", "Rome", "Madrid"], answer: 0 },
  { q: "2 + 2 * 3?", options: ["12", "8", "10"], answer: 1 },
  { q: "Largest planet?", options: ["Mars", "Earth", "Jupiter"], answer: 2 },
];

function ask(item, number) {
  console.log(`\nQ${number}: ${item.q}`);
  item.options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
  let pick = NaN;
  while (isNaN(pick) || pick < 1 || pick > item.options.length) {
    pick = parseInt(prompt("Your answer: "), 10);
  }
  return pick - 1 === item.answer;
}

function grade(score, out) {
  const pct = (score / out) * 100;
  if (pct === 100) return "Perfect!";
  if (pct >= 60) return "Well done";
  return "Keep practising";
}

let score = 0;
const wrong = [];
questions.forEach((item, i) => {
  if (ask(item, i + 1)) {
    score++;
    console.log("Correct!");
  } else {
    wrong.push(item.q);
    console.log(`Wrong - it was ${item.options[item.answer]}`);
  }
});
console.log(`\nYou scored ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%)`);
console.log(grade(score, questions.length));
if (wrong.length > 0) {
  console.log("Review: " + wrong.join(" | "));
}
''', ['1', '5', 'abc', '3', '3'],
     ['', 'Q1: Capital of France?', '  1. Paris', '  2. Rome', '  3. Madrid', 'Your answer: ', 'Correct!', '', 'Q2: 2 + 2 * 3?', '  1. 12', '  2. 8', '  3. 10', 'Your answer: ', 'Your answer: ', 'Your answer: ', 'Wrong - it was 8', '', 'Q3: Largest planet?', '  1. Mars', '  2. Earth', '  3. Jupiter', 'Your answer: ', 'Correct!', '', 'You scored 2/3 (67%)', 'Well done', 'Review: 2 + 2 * 3?']),
    ('js shopping cart', 'javascript', r'''
const TAX = 0.08;
const catalog = new Map([
  ["pen", 1.5],
  ["notebook", 3.25],
  ["bag", 24.99],
]);

function priceOf(item) {
  if (!catalog.has(item)) {
    throw new RangeError("Unknown item: " + item);
  }
  return catalog.get(item);
}

function subtotal(cart) {
  let sum = 0;
  for (const [item, qty] of Object.entries(cart)) {
    sum += priceOf(item) * qty;
  }
  return sum;
}

function discount(total, code) {
  switch (code) {
    case "HALF":
      return total / 2;
    case "TEN":
      return total >= 10 ? 10 : 0;
    default:
      return 0;
  }
}

const cart = { pen: 4, notebook: 2 };
cart.bag = (cart.bag ?? 0) + 1;
const sub = subtotal(cart);
const off = discount(sub, "TEN");
const tax = (sub - off) * TAX;
console.log("Items:", Object.keys(cart).length);
for (const item in cart) {
  const line = priceOf(item) * cart[item];
  console.log(`${item.padEnd(10)}${String(cart[item]).padStart(3)}  $${line.toFixed(2)}`);
}
console.log(`Subtotal: $${sub.toFixed(2)}`);
console.log(`Discount: -$${off.toFixed(2)}`);
console.log(`Tax:      $${tax.toFixed(2)}`);
console.log(`Total:    $${(sub - off + tax).toFixed(2)}`);
try {
  priceOf("stapler");
} catch (e) {
  console.log(e.name + ": " + e.message);
}
const cheap = [...catalog].filter(([, p]) => p < 5).map(([name]) => name);
console.log("Under $5:", cheap.join(" and "));
const { pen, ...rest } = cart;
console.log("Pens:", pen, "Other kinds:", Object.keys(rest).length);
''', [],
     ['Items: 3', 'pen         4  $6.00', 'notebook    2  $6.50', 'bag         1  $24.99', 'Subtotal: $37.49', 'Discount: -$10.00', 'Tax:      $2.20', 'Total:    $29.69', 'RangeError: Unknown item: stapler', 'Under $5: pen and notebook', 'Pens: 4 Other kinds: 2']),
    ('js grid game of life', 'javascript', r'''
function makeGrid(rows, cols, alive) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(false));
  for (const [r, c] of alive) grid[r][c] = true;
  return grid;
}

function neighbours(grid, r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < grid.length && cc >= 0 && cc < grid[0].length && grid[rr][cc]) {
        count++;
      }
    }
  }
  return count;
}

function step(grid) {
  return grid.map((row, r) =>
    row.map((alive, c) => {
      const n = neighbours(grid, r, c);
      return alive ? n === 2 || n === 3 : n === 3;
    })
  );
}

function show(grid) {
  return grid.map(row => row.map(x => (x ? "#" : ".")).join("")).join("\n");
}

let grid = makeGrid(5, 5, [[1, 2], [2, 2], [3, 2]]);
for (let gen = 0; gen < 3; gen++) {
  console.log(`Generation ${gen}:`);
  console.log(show(grid));
  const alive = grid.flat().filter(Boolean).length;
  console.log(`${alive} alive`);
  grid = step(grid);
}
''', [],
     ['Generation 0:', '.....', '..#..', '..#..', '..#..', '.....', '3 alive', 'Generation 1:', '.....', '.....', '.###.', '.....', '.....', '3 alive', 'Generation 2:', '.....', '..#..', '..#..', '..#..', '.....', '3 alive']),
    ('java student manager', 'java', r'''
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Scanner;

class Student {
    private String name;
    private int[] marks;

    public Student(String name, int[] marks) {
        this.name = name;
        this.marks = marks;
    }

    public String getName() {
        return name;
    }

    public double average() {
        int total = 0;
        for (int m : marks) {
            total += m;
        }
        return marks.length == 0 ? 0 : (double) total / marks.length;
    }

    public char grade() {
        double avg = average();
        if (avg >= 90) return 'A';
        else if (avg >= 80) return 'B';
        else if (avg >= 70) return 'C';
        return 'F';
    }

    @Override
    public String toString() {
        return String.format("%-8s %6.2f %c", name, average(), grade());
    }
}

public class StudentManager {
    private static final Scanner input = new Scanner(System.in);
    private static List<Student> students = new ArrayList<>();

    public static void main(String[] args) {
        boolean running = true;
        while (running) {
            System.out.println("1. Add  2. List  3. Best  4. Quit");
            System.out.print("Choose: ");
            int choice;
            try {
                choice = Integer.parseInt(input.nextLine().trim());
            } catch (NumberFormatException e) {
                System.out.println("Please enter a number.");
                continue;
            }
            switch (choice) {
                case 1:
                    addStudent();
                    break;
                case 2:
                    listStudents();
                    break;
                case 3:
                    showBest();
                    break;
                case 4:
                    running = false;
                    System.out.println("Bye");
                    break;
                default:
                    System.out.println("Invalid option");
            }
        }
    }

    private static void addStudent() {
        System.out.print("Name: ");
        String name = input.nextLine();
        System.out.print("How many marks? ");
        int n = Integer.parseInt(input.nextLine());
        int[] marks = new int[n];
        for (int i = 0; i < n; i++) {
            System.out.print("Mark " + (i + 1) + ": ");
            marks[i] = Integer.parseInt(input.nextLine());
        }
        students.add(new Student(name, marks));
        System.out.println("Added " + name);
    }

    private static void listStudents() {
        if (students.isEmpty()) {
            System.out.println("No students yet.");
            return;
        }
        List<Student> sorted = new ArrayList<>(students);
        Collections.sort(sorted, Comparator.comparing(Student::getName));
        for (Student s : sorted) {
            System.out.println(s);
        }
    }

    private static void showBest() {
        Student best = null;
        for (Student s : students) {
            if (best == null || s.average() > best.average()) {
                best = s;
            }
        }
        System.out.println(best == null ? "Nobody yet" : "Best: " + best.getName());
    }
}
''', ['2', '1', 'Zoe', '3', '90', '95', '88', '1', 'Adam', '2', '70', '61', 'x', '2', '3', '7', '4'],
     ['1. Add  2. List  3. Best  4. Quit', 'Choose: ', 'No students yet.', '1. Add  2. List  3. Best  4. Quit', 'Choose: ', 'Name: ', 'How many marks? ', 'Mark 1: ', 'Mark 2: ', 'Mark 3: ', 'Added Zoe', '1. Add  2. List  3. Best  4. Quit', 'Choose: ', 'Name: ', 'How many marks? ', 'Mark 1: ', 'Mark 2: ', 'Added Adam', '1. Add  2. List  3. Best  4. Quit', 'Choose: ', 'Please enter a number.', '1. Add  2. List  3. Best  4. Quit', 'Choose: ', 'Adam      65.50 F', 'Zoe       91.00 A', '1. Add  2. List  3. Best  4. Quit', 'Choose: ', 'Best: Zoe', '1. Add  2. List  3. Best  4. Quit', 'Choose: ', 'Invalid option', '1. Add  2. List  3. Best  4. Quit', 'Choose: ', 'Bye']),
    ('java zoo polymorphism', 'java', r'''
import java.util.*;

interface Feedable {
    void feed(int grams);
}

abstract class Animal implements Feedable {
    protected String name;
    protected int foodEaten = 0;
    private static int created = 0;

    Animal(String name) {
        this.name = name;
        created++;
    }

    abstract String sound();

    public void feed(int grams) {
        foodEaten += grams;
    }

    public String describe() {
        return name + " says " + sound();
    }

    static int howMany() {
        return created;
    }
}

class Dog extends Animal {
    Dog(String name) { super(name); }

    @Override
    String sound() { return "Woof"; }
}

class Cat extends Animal {
    private boolean grumpy;

    Cat(String name, boolean grumpy) {
        super(name);
        this.grumpy = grumpy;
    }

    @Override
    String sound() { return grumpy ? "Hiss" : "Meow"; }

    @Override
    public void feed(int grams) {
        super.feed(grams / 2);
    }
}

enum Size { SMALL, MEDIUM, LARGE }

public class Zoo {
    static Size sizeOf(Animal a) {
        if (a.foodEaten > 300) return Size.LARGE;
        if (a.foodEaten > 100) return Size.MEDIUM;
        return Size.SMALL;
    }

    public static void main(String[] args) {
        List<Animal> animals = new ArrayList<>();
        animals.add(new Dog("Rex"));
        animals.add(new Cat("Tom", false));
        animals.add(new Cat("Grim", true));
        int[] meals = {150, 400, 90};
        for (int i = 0; i < animals.size(); i++) {
            animals.get(i).feed(meals[i]);
        }
        for (Animal a : animals) {
            System.out.println(a.describe() + " and ate " + a.foodEaten + "g");
            switch (sizeOf(a)) {
                case LARGE: System.out.println("  a big eater"); break;
                case MEDIUM: System.out.println("  eats well"); break;
                default: System.out.println("  a nibbler");
            }
        }
        System.out.println("Animals made: " + Animal.howMany());
        Map<String, Integer> counts = new TreeMap<>();
        for (Animal a : animals) {
            String kind = a.getClass().getSimpleName();
            counts.put(kind, counts.getOrDefault(kind, 0) + 1);
        }
        for (Map.Entry<String, Integer> e : counts.entrySet()) {
            System.out.println(e.getKey() + ": " + e.getValue());
        }
        StringBuilder names = new StringBuilder();
        for (Animal a : animals) {
            if (names.length() > 0) names.append(", ");
            names.append(a.name.toUpperCase());
        }
        System.out.println(names.toString());
    }
}
''', [],
     ['Rex says Woof and ate 150g', '  eats well', 'Tom says Meow and ate 200g', '  eats well', 'Grim says Hiss and ate 45g', '  a nibbler', 'Animals made: 3', 'Cat: 2', 'Dog: 1', 'REX, TOM, GRIM']),
    ('java matrix and strings', 'java', r'''
import java.util.Arrays;

public class Practice {
    static int[][] multiply(int[][] a, int[][] b) {
        int n = a.length, m = b[0].length, k = b.length;
        int[][] out = new int[n][m];
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++)
                for (int x = 0; x < k; x++)
                    out[i][j] += a[i][x] * b[x][j];
        return out;
    }

    static String caesar(String text, int shift) {
        StringBuilder sb = new StringBuilder();
        for (char c : text.toCharArray()) {
            if (Character.isUpperCase(c)) {
                sb.append((char) ('A' + (c - 'A' + shift) % 26));
            } else if (Character.isLowerCase(c)) {
                sb.append((char) ('a' + (c - 'a' + shift) % 26));
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) {
            if (n % d == 0) return false;
        }
        return true;
    }

    static int countVowels(String s) {
        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            if ("aeiouAEIOU".indexOf(s.charAt(i)) >= 0) count++;
        }
        return count;
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2}, {3, 4}};
        int[][] b = {{5, 6}, {7, 8}};
        int[][] c = multiply(a, b);
        for (int[] row : c) {
            System.out.println(Arrays.toString(row));
        }
        String secret = caesar("Hello, World!", 3);
        System.out.println(secret);
        System.out.println(caesar(secret, 23));
        int[] nums = {12, 7, 3, 19, 25, 2};
        Arrays.sort(nums);
        System.out.println("Sorted: " + Arrays.toString(nums));
        int primes = 0;
        for (int x : nums) if (isPrime(x)) primes++;
        System.out.println(primes + " primes");
        String sentence = "The quick brown fox";
        String[] words = sentence.split(" ");
        System.out.printf("%d words, %d vowels%n", words.length, countVowels(sentence));
        String reversed = new StringBuilder(sentence).reverse().toString();
        System.out.println(reversed);
        System.out.println(String.join("-", words).toLowerCase());
        double avg = Arrays.stream(nums).average().orElse(0);
        System.out.printf("Average %.2f, max %d%n", avg, Arrays.stream(nums).max().getAsInt());
    }
}
''', [],
     ['[19, 22]', '[43, 50]', 'Khoor, Zruog!', 'Hello, World!', 'Sorted: [2, 3, 7, 12, 19, 25]', '4 primes', '4 words, 5 vowels', 'xof nworb kciuq ehT', 'the-quick-brown-fox', 'Average 11.33, max 25']),
    ('java exceptions and wrapper', 'java', r'''
import java.util.*;

class InsufficientStockException extends Exception {
    public InsufficientStockException(String message) {
        super(message);
    }
}

class Warehouse {
    private final Map<String, Integer> stock = new HashMap<>();

    void receive(String item, int qty) {
        stock.merge(item, qty, Integer::sum);
    }

    void ship(String item, int qty) throws InsufficientStockException {
        int have = stock.getOrDefault(item, 0);
        if (have < qty) {
            throw new InsufficientStockException("Need " + qty + " " + item + " but only " + have);
        }
        stock.put(item, have - qty);
    }

    int total() {
        int sum = 0;
        for (int q : stock.values()) sum += q;
        return sum;
    }

    List<String> items() {
        List<String> names = new ArrayList<>(stock.keySet());
        Collections.sort(names);
        return names;
    }

    int count(String item) { return stock.getOrDefault(item, 0); }
}

public class Depot {
    public static void main(String[] args) {
        Warehouse w = new Warehouse();
        w.receive("bolts", 100);
        w.receive("nuts", 250);
        w.receive("bolts", 20);
        String[][] orders = {{"bolts", "50"}, {"nuts", "300"}, {"washers", "1"}, {"nuts", "200"}};
        int shipped = 0;
        for (String[] order : orders) {
            try {
                w.ship(order[0], Integer.parseInt(order[1]));
                shipped++;
                System.out.println("Shipped " + order[1] + " " + order[0]);
            } catch (InsufficientStockException e) {
                System.out.println("Problem: " + e.getMessage());
            } finally {
                System.out.println("  (" + w.total() + " items in stock)");
            }
        }
        System.out.println(shipped + " of " + orders.length + " orders shipped");
        for (String item : w.items()) {
            System.out.println(item + " -> " + w.count(item));
        }
    }
}
''', [],
     ['Shipped 50 bolts', '  (320 items in stock)', 'Problem: Need 300 nuts but only 250', '  (320 items in stock)', 'Problem: Need 1 washers but only 0', '  (320 items in stock)', 'Shipped 200 nuts', '  (120 items in stock)', '2 of 4 orders shipped', 'bolts -> 70', 'nuts -> 50']),
    ('cs store app', 'csharp', r'''
using System;
using System.Collections.Generic;
using System.Linq;

namespace StoreApp
{
    public enum Category { Food, Toys, Books }

    public class Product
    {
        public string Name { get; set; }
        public decimal Price { get; private set; }
        public int Stock { get; set; }
        public Category Kind { get; }

        public Product(string name, decimal price, int stock, Category kind)
        {
            Name = name;
            Price = price;
            Stock = stock;
            Kind = kind;
        }

        public bool InStock => Stock > 0;

        public void Discount(int percent)
        {
            Price = Math.Round(Price * (100 - percent) / 100m, 2);
        }

        public override string ToString() => $"{Name,-8}{Price,8:F2}{Stock,4}";
    }

    class Program
    {
        static List<Product> products = new List<Product>
        {
            new Product("Apple", 0.40m, 120, Category.Food),
            new Product("Robot", 29.99m, 3, Category.Toys),
            new Product("Novel", 12.50m, 0, Category.Books),
            new Product("Kite", 15.00m, 7, Category.Toys),
        };

        static void Main(string[] args)
        {
            Console.WriteLine("Welcome to the store!");
            foreach (var p in products.OrderBy(p => p.Price))
            {
                Console.WriteLine(p);
            }
            var toys = products.Where(p => p.Kind == Category.Toys).ToList();
            Console.WriteLine($"Toys: {toys.Count}, worth {toys.Sum(t => t.Price * t.Stock):F2}");
            products.First(p => p.Name == "Kite").Discount(20);
            Console.WriteLine("Kite now costs " + products.First(p => p.Name == "Kite").Price);
            int bought = 0;
            string[] basket = { "Robot", "Novel", "Robot", "Pear" };
            foreach (string wanted in basket)
            {
                Product item = products.FirstOrDefault(p => p.Name == wanted);
                if (item == null)
                {
                    Console.WriteLine($"No {wanted} here");
                }
                else if (!item.InStock)
                {
                    Console.WriteLine($"{wanted} is sold out");
                }
                else
                {
                    item.Stock--;
                    bought++;
                    Console.WriteLine($"Bought a {wanted}, {item.Stock} left");
                }
            }
            Console.WriteLine($"You bought {bought} things");
            Dictionary<Category, int> perKind = new Dictionary<Category, int>();
            foreach (var p in products)
            {
                if (!perKind.ContainsKey(p.Kind)) perKind[p.Kind] = 0;
                perKind[p.Kind] += p.Stock;
            }
            foreach (KeyValuePair<Category, int> kv in perKind)
            {
                Console.WriteLine($"{kv.Key}: {kv.Value}");
            }
        }
    }
}
''', [],
     ['Welcome to the store!', 'Apple       0.40 120', 'Novel      12.50   0', 'Kite       15.00   7', 'Robot      29.99   3', 'Toys: 2, worth 194.97', 'Kite now costs 12', 'Bought a Robot, 2 left', 'Novel is sold out', 'Bought a Robot, 1 left', 'No Pear here', 'You bought 2 things', 'Food: 120', 'Toys: 8', 'Books: 0']),
    ('cs guessing game with input', 'csharp', r'''
using System;

class Game
{
    const int Low = 1, High = 50;

    static int ReadNumber(string question)
    {
        while (true)
        {
            Console.Write(question);
            string line = Console.ReadLine();
            if (int.TryParse(line, out int value) && value >= Low && value <= High)
            {
                return value;
            }
            Console.WriteLine($"Please type a number from {Low} to {High}.");
        }
    }

    static string Hint(int guess, int secret)
    {
        int gap = Math.Abs(guess - secret);
        string way = guess < secret ? "higher" : "lower";
        return gap <= 3 ? $"Very close, go {way}" : $"Go {way}";
    }

    static void Main()
    {
        int secret = 37;
        int tries = 0;
        int guess;
        do
        {
            guess = ReadNumber("Your guess: ");
            tries++;
            if (guess != secret)
            {
                Console.WriteLine(Hint(guess, secret));
            }
        } while (guess != secret);
        Console.WriteLine($"Got it in {tries} tries!");
        string rating = tries switch
        {
            1 => "Amazing",
            <= 4 => "Good",
            _ => "Keep trying"
        };
        Console.WriteLine(rating);
    }
}
''', ['20', '99', 'hello', '40', '36', '37'],
     ['Your guess: ', 'Go higher', 'Your guess: ', 'Please type a number from 1 to 50.', 'Your guess: ', 'Please type a number from 1 to 50.', 'Your guess: ', 'Very close, go lower', 'Your guess: ', 'Very close, go higher', 'Your guess: ', 'Got it in 4 tries!', 'Good']),
    ('cs shapes interface', 'csharp', r'''
using System;
using System.Collections.Generic;

interface IShape
{
    double Area();
    string Name { get; }
}

abstract class ShapeBase : IShape
{
    public abstract double Area();
    public virtual string Name => GetType().Name;
    public override string ToString() => $"{Name} with area {Area():0.##}";
}

class Circle : ShapeBase
{
    private readonly double r;
    public Circle(double radius) { r = radius; }
    public override double Area() => Math.PI * r * r;
}

class Rect : ShapeBase
{
    public double W { get; }
    public double H { get; }
    public Rect(double w, double h) { W = w; H = h; }
    public override double Area() => W * H;
    public override string Name => W == H ? "Square" : "Rectangle";
}

static class Program
{
    static double Total(IEnumerable<IShape> shapes)
    {
        double sum = 0;
        foreach (var s in shapes) sum += s.Area();
        return sum;
    }

    static void Main()
    {
        var shapes = new List<IShape> { new Circle(1.5), new Rect(2, 3), new Rect(4, 4) };
        shapes.ForEach(s => Console.WriteLine(s));
        Console.WriteLine("Total area: " + Math.Round(Total(shapes), 2));
        IShape biggest = shapes[0];
        foreach (IShape s in shapes)
        {
            if (s.Area() > biggest.Area()) biggest = s;
        }
        Console.WriteLine($"Biggest: {biggest.Name}");
        int squares = 0;
        foreach (var s in shapes)
        {
            if (s is Rect r && r.W == r.H) squares++;
        }
        Console.WriteLine($"{squares} square(s)");
    }
}
''', [],
     ['Circle(r=1.5)', 'Rect(W=2, H=3)', 'Rect(W=4, H=4)', 'Total area: 29.07', 'Biggest: Square', '1 square(s)']),
    ('cpp payroll', 'cpp', r'''
#include <iostream>
#include <iomanip>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

class Employee {
private:
    string name;
    double rate;
    double hours;
public:
    Employee(const string& n, double r, double h) : name(n), rate(r), hours(h) {}

    double pay() const {
        double base = rate * min(hours, 40.0);
        double extra = hours > 40 ? (hours - 40) * rate * 1.5 : 0;
        return base + extra;
    }

    string getName() const { return name; }
    double getHours() const { return hours; }
};

void printTable(const vector<Employee>& staff) {
    cout << left << setw(10) << "Name" << right << setw(8) << "Hours" << setw(10) << "Pay" << endl;
    cout << fixed << setprecision(2);
    for (const auto& e : staff) {
        cout << left << setw(10) << e.getName() << right << setw(8) << e.getHours()
             << setw(10) << e.pay() << endl;
    }
}

int main() {
    vector<Employee> staff;
    int n;
    cout << "How many employees? ";
    cin >> n;
    for (int i = 0; i < n; i++) {
        string name;
        double rate, hours;
        cout << "Name, rate and hours: ";
        cin >> name >> rate >> hours;
        staff.push_back(Employee(name, rate, hours));
    }
    sort(staff.begin(), staff.end(), [](const Employee& a, const Employee& b) {
        return a.pay() > b.pay();
    });
    printTable(staff);
    double total = 0;
    for (const Employee& e : staff) total += e.pay();
    cout << "Total payroll: $" << total << endl;
    int overtime = count_if(staff.begin(), staff.end(), [](const Employee& e) { return e.getHours() > 40; });
    cout << overtime << " worked overtime" << endl;
    return 0;
}
''', ['3', 'Ann 20 45', 'Bob 15.5 38', 'Cid 30 10'],
     ['How many employees? ', 'Name, rate and hours: ', 'Name, rate and hours: ', 'Name, rate and hours: ', 'Name         Hours       Pay', 'Ann          45.00    950.00', 'Bob          38.00    589.00', 'Cid          10.00    300.00', 'Total payroll: $1839.00', '1 worked overtime']),
    ('cpp bank with map and struct', 'cpp', r'''
#include <iostream>
#include <map>
#include <string>
using namespace std;

struct Account {
    string owner;
    double balance = 0;
    int transactions = 0;
};

bool withdraw(Account& acc, double amount) {
    if (amount <= 0 || amount > acc.balance) {
        return false;
    }
    acc.balance -= amount;
    acc.transactions++;
    return true;
}

void deposit(Account& acc, double amount) {
    acc.balance += amount;
    acc.transactions++;
}

int main() {
    map<int, Account> bank;
    bank[101] = {"Ava", 500};
    bank[205] = {"Ben", 75.5};
    bank[330] = {"Cal"};

    deposit(bank[330], 40);
    if (!withdraw(bank[205], 100)) {
        cout << "Ben cannot take out 100" << endl;
    }
    withdraw(bank[101], 120.25);

    for (auto it = bank.begin(); it != bank.end(); ++it) {
        cout << it->first << ": " << it->second.owner << " has " << it->second.balance
             << " (" << it->second.transactions << " transactions)" << endl;
    }
    int number = 205;
    if (bank.count(number)) {
        Account& a = bank[number];
        deposit(a, 24.5);
        cout << a.owner << " now has " << a.balance << endl;
    }
    if (bank.find(999) == bank.end()) {
        cout << "No account 999" << endl;
    }
    double richest = 0;
    string who;
    for (const auto& [num, acc] : bank) {
        if (acc.balance > richest) {
            richest = acc.balance;
            who = acc.owner;
        }
    }
    cout << "Richest: " << who << endl;
    return 0;
}
''', [],
     ['Ben cannot take out 100', '101: Ava has 379.75 (1 transactions)', '205: Ben has 75.5 (0 transactions)', '330: Cal has 40 (1 transactions)', 'Ben now has 100', 'No account 999', 'Richest: Ava']),
    ('cpp shapes virtual', 'cpp', r'''
#include <iostream>
#include <vector>
#include <memory>
#include <cmath>
using namespace std;

class Shape {
public:
    virtual ~Shape() {}
    virtual double area() const = 0;
    virtual string name() const { return "shape"; }
    void report() const {
        cout << name() << " area " << area() << endl;
    }
};

class Circle : public Shape {
    double r;
public:
    Circle(double radius) : r(radius) {}
    double area() const override { return M_PI * r * r; }
    string name() const override { return "circle"; }
};

class Box : public Shape {
    double w, h;
public:
    Box(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
    string name() const override { return w == h ? "square" : "box"; }
};

int main() {
    vector<unique_ptr<Shape>> shapes;
    shapes.push_back(make_unique<Circle>(1));
    shapes.push_back(make_unique<Box>(2, 3));
    shapes.push_back(make_unique<Box>(2, 2));
    double total = 0;
    for (const auto& s : shapes) {
        s->report();
        total += s->area();
    }
    cout << "total " << total << endl;
    Shape* big = shapes[0].get();
    for (auto& s : shapes) {
        if (s->area() > big->area()) big = s.get();
    }
    cout << "biggest is the " << big->name() << endl;
    return 0;
}
''', [],
     ['circle area 3.14159', 'box area 6', 'square area 4', 'total 13.1416', 'biggest is the box']),
    ('js calls with too few and too many', 'javascript', r'''
function f(a, b) {
  if (b === undefined) { return a; }
  return a + b;
}
function greet(name) { return "Hi " + name; }
console.log(f(1), f(1, 2), greet("Ann", 3));
''', [],
     ['1 3 Hi Ann']),
    ('js typeof in a filter', 'javascript', r'''
function isString(x) { return typeof x === "string"; }
const mixed = ["a", 1, "bb", 22, true];
console.log(mixed.filter(isString).join("+"));
console.log(mixed.filter(x => typeof x === "number").length, mixed.filter(x => typeof x !== "boolean").length);
''', [],
     ['a+bb', '2 4']),
    ('js a method named push', 'javascript', r'''
class Stack {
  items = [];
  push(x) { this.items.push(x); }
  pop() { return this.items.pop(); }
  get size() { return this.items.length; }
}
const s = new Stack();
s.push(1); s.push(2); s.push(3);
console.log(s.pop(), s.size);
''', [],
     ['3 2']),
    ('js a function held in a name', 'javascript', r'''
function counter() {
  let n = 0;
  return () => { n++; return n; };
}
const next = counter();
next();
next();
console.log("count", next());
''', [],
     ['count 3']),
]


# Files, in all five languages: a tab of the Code tab is a file the program
# opens by its name (15-sums.js), and a data tab beside the program is one
# with no name of its own -- file2.txt.  Each is read in, run by the runner
# with the files handed to it, and has to print what the real program
# prints (run here for real); then it is written out again in every
# language and run (see "file programs written out ...", run.py), with the
# same files beside it.
JAVA_SUM = r'''import java.io.*;
import java.util.Scanner;

public class FileSum {
    public static void main(String[] args) throws IOException {
        Scanner keyboard = new Scanner(System.in);
        System.out.print("Enter the file name: ");
        String filename = keyboard.nextLine();
        File file = new File(filename);
        if (!file.exists()) {
            System.out.println("The file " + filename + " is not there.");
            System.exit(0);
        }
        Scanner inputFile = new Scanner(file);
        int count = 0;
        double total = 0.0;
        while (inputFile.hasNext()) {
            double number = inputFile.nextDouble();
            total += number;
            count++;
        }
        inputFile.close();
        System.out.println("Count: " + count);
        System.out.printf("Total: %.2f%n", total);
    }
}
'''

JAVA_GRADES = r'''import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

public class Grades {
    public static void main(String[] args) {
        Scanner keyboard = new Scanner(System.in);
        System.out.print("File: ");
        String name = keyboard.nextLine();
        try (Scanner in = new Scanner(new File(name))) {
            int lineNo = 0;
            while (in.hasNextLine()) {
                String row = in.nextLine();
                lineNo++;
                if (row.isEmpty()) {
                    continue;
                }
                String[] bits = row.split(" ");
                int sum = 0;
                for (int k = 1; k < bits.length; k++) {
                    sum += Integer.parseInt(bits[k]);
                }
                System.out.println(bits[0] + " " + sum);
            }
            System.out.println(lineNo + " lines read");
        } catch (FileNotFoundException e) {
            System.out.println("No file called " + name);
        }
    }
}
'''

CPP_COUNT = r'''#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    ifstream inputFile;
    string filename;
    cout << "Enter the file name: ";
    cin >> filename;
    inputFile.open(filename);
    if (!inputFile) {
        cout << "Error opening the file." << endl;
        return 1;
    }
    int number, count = 0, total = 0;
    while (inputFile >> number) {
        count++;
        total += number;
    }
    inputFile.close();
    cout << "Count: " << count << endl;
    cout << "Total: " << total << endl;
    return 0;
}
'''

CS_WORDS = r'''using System;
using System.IO;

class Words {
    static void Main() {
        Console.Write("File: ");
        string name = Console.ReadLine();
        try {
            StreamReader sr = new StreamReader(name);
            string all = sr.ReadToEnd();
            sr.Close();
            string[] lines = all.Trim().Split('\n');
            Console.WriteLine(lines.Length + " lines");
            Console.WriteLine("Last: " + lines[lines.Length - 1]);
        } catch (FileNotFoundException) {
            Console.WriteLine("Missing: " + name);
        }
    }
}
'''

JS_LOAD = r'''const fs = require("fs");

function load(name) {
  try {
    return fs.readFileSync(name, "utf8").split("\n").filter((l) => l !== "");
  } catch (err) {
    console.log("No file " + name);
    return [];
  }
}

console.log(load("a.txt").length);
console.log(load("b.txt").length);
'''

FILES = [
    # Files: a tab of the Code tab is a file the program opens by its name
    # (15-sums.js) -- one holding only numbers is file2.txt, data and not
    # code -- and a file that is not there is the except's to deal with.
    ('py numbers file analyzer', 'python', [('main.py', ANALYZER), ('', '45\n12\n87\n3\n68\n29\n')], ['file2.txt'],
     ['Enter the name of the file: ', '', 'Numbers in the file:', '45', '12', '87', '3', '68', '29', '',
      'Count of numbers: 6', 'Sum of the numbers: 244', 'Average of the numbers: 40.67',
      'Largest number: 87', 'Smallest number: 3']),
    ('py a file that is not there', 'python', [('main.py', ANALYZER), ('', '45\n12\n')], ['file3.txt'],
     ['Enter the name of the file: ', 'Error: the file file3.txt could not be opened.']),
    ('py readline until the end', 'python', [('sales.py', r'''
def main():
    infile = open("sales.txt", "r")
    total = 0.0
    line = infile.readline()
    while line != "":
        amount = float(line)
        total += amount
        print(line.rstrip("\n"))
        line = infile.readline()
    infile.close()
    print("Total:", format(total, ".2f"))

main()
'''), ('sales.txt', '100.5\n200\n12.25\n')], [],
     ['100.5', '200', '12.25', 'Total: 312.75']),
    ('py with open and readlines', 'python', [('names.py', r'''
with open("names.txt") as f:
    names = f.readlines()
for i in range(len(names)):
    names[i] = names[i].rstrip("\n")
print(names)
print(len(names), "names", f.closed)
'''), ('names.txt', 'Ada\nGrace\nAlan')], [],
     ["['Ada', 'Grace', 'Alan']", '3 names True']),
    ('py a file written and read back', 'python', r'''
outfile = open("scores.txt", "w")
for n in range(1, 4):
    outfile.write(str(n * 10) + "\n")
print("done", file=outfile)
outfile.close()
infile = open("scores.txt", "r")
contents = infile.read()
infile.close()
print(contents)
''', [],
     ['10', '20', '30', 'done', '']),
    ('py appended to and split by commas', 'python', [('best.py', r'''
f = open("people.csv", "a")
f.write("Cy,77\n")
f.close()
best = ""
top = -1
for row in open("people.csv"):
    name, score = row.strip().split(",")
    if int(score) > top:
        top = int(score)
        best = name
print(best, top)
'''), ('people.csv', 'Ann,90\nBo,85\n')], [],
     ['Ann 90']),
    ('py FileNotFoundError in a function', 'python', [('main.py', r'''
def main():
    try:
        name = input("File: ")
        infile = open(name)
        total = 0
        for line in infile:
            total += int(line)
        infile.close()
        print("Total:", total)
    except FileNotFoundError:
        print("No such file:", name)

main()
'''), ('data.txt', '1\n2\n3\n')], ['data.txt'],
     ['File: ', 'Total: 6']),
    # ---- Java ----
    ('java Scanner over a File, numbers added', 'java', [('FileSum.java', JAVA_SUM), ('numbers.txt', '12.5\n7\n30.25\n')],
     ['numbers.txt'],
     ['Enter the file name: ', 'Count: 3', 'Total: 49.75']),
    ('java a File that is not there', 'java', [('FileSum.java', JAVA_SUM), ('numbers.txt', '1\n')],
     ['nothing.txt'],
     ['Enter the file name: ', 'The file nothing.txt is not there.']),
    ('java BufferedReader to the null', 'java', [('Names.java', r'''import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class Names {
    public static void main(String[] args) {
        try {
            BufferedReader reader = new BufferedReader(new FileReader("names.txt"));
            String line;
            int count = 0;
            while ((line = reader.readLine()) != null) {
                count++;
                System.out.println(count + ": [" + line.toUpperCase() + "]");
            }
            reader.close();
            System.out.println(count + " names");
            BufferedReader again = new BufferedReader(new FileReader("names.txt"));
            String first = again.readLine();
            while (first != null) {
                System.out.println(first.length());
                first = again.readLine();
            }
            again.close();
        } catch (IOException e) {
            System.out.println("Could not read names.txt");
        }
    }
}
'''), ('names.txt', 'Ada\nGrace\n\nAlan')], [],
     ['1: [ADA]', '2: [GRACE]', '3: []', '4: [ALAN]', '4 names', '3', '5', '0', '4']),
    ('java PrintWriter, FileWriter and readAllLines', 'java', [('Scores.java', r'''import java.io.*;
import java.nio.file.*;
import java.util.List;

public class Scores {
    public static void main(String[] args) throws IOException {
        PrintWriter out = new PrintWriter(new FileWriter("scores.txt"));
        for (int i = 1; i <= 3; i++) {
            out.println("Player " + i + "," + (i * 15));
        }
        out.print("Total,");
        out.println(90);
        out.close();
        PrintWriter more = new PrintWriter(new FileWriter("scores.txt", true));
        more.println("Extra,5");
        more.close();
        List<String> lines = Files.readAllLines(Paths.get("scores.txt"));
        System.out.println(lines.size() + " lines");
        for (String line : lines) {
            String[] parts = line.split(",");
            System.out.println(parts[0] + " -> " + parts[1]);
        }
        for (String line : Files.readAllLines(Paths.get("scores.txt"))) {
            if (line.startsWith("T")) {
                System.out.println(line);
            }
        }
    }
}
''')], [],
     ['5 lines', 'Player 1 -> 15', 'Player 2 -> 30', 'Player 3 -> 45', 'Total -> 90', 'Extra -> 5', 'Total,90']),
    ('java try-with-resources and FileNotFoundException', 'java', [('Grades.java', JAVA_GRADES),
     ('grades.txt', 'Ann 90 85\nBo 70 80\n\nCy 60 65\n')], ['grades.txt'],
     ['File: ', 'Ann 175', 'Bo 150', 'Cy 125', '4 lines read']),
    ('java FileNotFoundException caught', 'java', [('Grades.java', JAVA_GRADES),
     ('grades.txt', 'Ann 90 85\n')], ['marks.txt'],
     ['File: ', 'No file called marks.txt']),
    ('java nextInt then nextLine', 'java', [('Items.java', r'''import java.io.*;
import java.util.*;

public class Items {
    public static void main(String[] args) throws FileNotFoundException {
        Scanner in = new Scanner(new File("items.txt"));
        int n = in.nextInt();
        in.nextLine();
        for (int i = 0; i < n; i++) {
            String item = in.nextLine();
            System.out.println((i + 1) + ". " + item);
        }
        int total = 0;
        while (in.hasNextInt()) {
            total += in.nextInt();
        }
        in.close();
        System.out.println("Sum " + total);
    }
}
'''), ('items.txt', '3\nTea\nMilk\nBread\n4 5 6\n7\n')], [],
     ['1. Tea', '2. Milk', '3. Bread', 'Sum 22']),
    # ---- C# ----
    ('cs StreamReader to the null in a using', 'csharp', [('Prices.cs', r'''using System;
using System.IO;

class Prices {
    static void Main() {
        int count = 0;
        double total = 0;
        using (StreamReader reader = new StreamReader("prices.txt")) {
            string line;
            while ((line = reader.ReadLine()) != null) {
                total += double.Parse(line);
                count++;
            }
        }
        Console.WriteLine("Items: " + count);
        Console.WriteLine("Total: " + total.ToString("F2"));
    }
}
'''), ('prices.txt', '1.25\n3.50\n10\n')], [],
     ['Items: 3', 'Total: 14.75']),
    ('cs StreamWriter, then EndOfStream', 'csharp', [('Log.cs', r'''using System;
using System.IO;

class Log {
    static void Main() {
        StreamWriter writer = new StreamWriter("log.txt");
        writer.WriteLine("first");
        writer.WriteLine("second {0}", 2);
        writer.Write("third");
        writer.WriteLine();
        writer.Close();
        StreamWriter again = new StreamWriter("log.txt", true);
        again.WriteLine("fourth");
        again.Close();
        StreamReader r = File.OpenText("log.txt");
        int n = 0;
        while (!r.EndOfStream) {
            string s = r.ReadLine();
            n++;
            Console.WriteLine(n + " " + s);
        }
        r.Close();
    }
}
''')], [],
     ['1 first', '2 second 2', '3 third', '4 fourth']),
    ('cs the File class', 'csharp', [('Todo.cs', r'''using System;
using System.IO;

class Todo {
    static void Main() {
        if (!File.Exists("todo.txt")) {
            Console.WriteLine("No list");
            return;
        }
        string[] tasks = File.ReadAllLines("todo.txt");
        Console.WriteLine(tasks.Length + " tasks");
        foreach (string t in tasks) {
            Console.WriteLine("- " + t);
        }
        File.WriteAllText("done.txt", "Done: " + tasks[0] + "\n");
        File.AppendAllText("done.txt", "Done: " + tasks[1] + "\n");
        string done = File.ReadAllText("done.txt");
        Console.Write(done);
        foreach (string line in File.ReadAllLines("done.txt")) {
            Console.WriteLine(line.ToUpper());
        }
        Console.WriteLine(File.Exists("nothing.txt"));
    }
}
'''), ('todo.txt', 'Shop\nCook\nClean\n')], [],
     ['3 tasks', '- Shop', '- Cook', '- Clean', 'Done: Shop', 'Done: Cook', 'DONE: SHOP', 'DONE: COOK', 'False']),
    ('cs ReadToEnd', 'csharp', [('Words.cs', CS_WORDS), ('story.txt', 'the cat\nsat on the mat\n')], ['story.txt'],
     ['File: ', '2 lines', 'Last: sat on the mat']),
    ('cs FileNotFoundException caught', 'csharp', [('Words.cs', CS_WORDS), ('story.txt', 'x\n')], ['tale.txt'],
     ['File: ', 'Missing: tale.txt']),
    # ---- C++ ----
    ('cpp ifstream read with >>', 'cpp', [('count.cpp', CPP_COUNT), ('numbers.txt', '10 20\n30\n40\n')], ['numbers.txt'],
     ['Enter the file name: ', 'Count: 4', 'Total: 100']),
    ('cpp ifstream that did not open', 'cpp', [('count.cpp', CPP_COUNT), ('numbers.txt', '1\n')], ['none.txt'],
     ['Enter the file name: ', 'Error opening the file.']),
    ('cpp getline into an ofstream', 'cpp', [('report.cpp', r'''#include <iostream>
#include <fstream>
#include <string>
using namespace std;

int main() {
    ifstream in("people.txt");
    ofstream out("report.txt");
    string line;
    int n = 0;
    while (getline(in, line)) {
        n++;
        out << n << ". " << line << endl;
    }
    in.close();
    out.close();
    ofstream add("report.txt", ios::app);
    add << "end" << "\n";
    add.close();
    ifstream back("report.txt");
    string got;
    while (getline(back, got)) {
        cout << got << endl;
    }
    back.close();
    return 0;
}
'''), ('people.txt', 'Ann\nBo\nCy\n')], [],
     ['1. Ann', '2. Bo', '3. Cy', 'end']),
    ('cpp is_open, eof and words', 'cpp', [('scores.cpp', r'''#include <iostream>
#include <fstream>
#include <iomanip>
#include <string>
using namespace std;

int main() {
    ifstream file("scores.txt");
    if (file.is_open()) {
        string name;
        int score;
        while (file >> name >> score) {
            cout << name << " scored " << score << endl;
        }
        file.close();
    } else {
        cout << "Unable to open file" << endl;
    }
    ofstream money("money.txt");
    money << fixed << setprecision(2) << 3.5 << endl;
    money << 10.1 << endl;
    money.close();
    ifstream m("money.txt");
    string s;
    while (!m.eof()) {
        getline(m, s);
        if (s != "") {
            cout << "[" << s << "]" << endl;
        }
    }
    m.close();
    return 0;
}
'''), ('scores.txt', 'Ann 90\nBo 85\nCy 77\n')], [],
     ['Ann scored 90', 'Bo scored 85', 'Cy scored 77', '[3.50]', '[10.10]']),
    # ---- JavaScript ----
    ('js readFileSync split into lines', 'javascript', [('avg.js', r'''const fs = require("fs");

const text = fs.readFileSync("scores.txt", "utf8");
const lines = text.trim().split("\n");
let total = 0;
for (const line of lines) {
  const [name, score] = line.split(",");
  total += Number(score);
  console.log(`${name}: ${score}`);
}
console.log("Average:", (total / lines.length).toFixed(1));
'''), ('scores.txt', 'Ann,90\nBo,85\nCy,77\n')], [],
     ['Ann: 90', 'Bo: 85', 'Cy: 77', 'Average: 84.0']),
    ('js writeFileSync, appendFileSync and existsSync', 'javascript', [('log.js', r'''const fs = require("fs");

if (!fs.existsSync("log.txt")) {
  console.log("starting a new log");
}
fs.writeFileSync("log.txt", "one\n");
fs.appendFileSync("log.txt", "two\n");
fs.appendFileSync("log.txt", "three\n");
const lines = fs.readFileSync("log.txt", "utf8").split("\n");
console.log(lines.length);
lines.forEach((l, i) => {
  if (l) {
    console.log(i + 1, l);
  }
});
console.log(fs.existsSync("log.txt") ? "kept" : "gone");
''')], [],
     ['starting a new log', '4', '1 one', '2 two', '3 three', 'kept']),
    ('js a file that is not there caught', 'javascript', [('load.js', JS_LOAD), ('a.txt', 'x\ny\n\nz\n')], [],
     ['3', 'No file b.txt', '0']),
    ('py a file handed to a function', 'python', [('main.py', r'''
def count_lines(f):
    n = 0
    for line in f:
        n += 1
    return n

def main():
    out = open("data.txt", "w")
    out.write("alpha beta\n")
    print(3.5, True, [1, 2], file=out)
    out.write("last")
    out.close()
    f = open("data.txt")
    print(f.name, f.read(5))
    print(count_lines(f))
    f.close()
    g = None
    if f.closed:
        g = open("data.txt")
    first = g.readline()
    print(first.strip(), len(first))
    print(g.readlines())
    g.close()

main()
''')], [],
     ['data.txt alpha', '3', 'alpha beta 11', "['3.5 True [1, 2]\\n', 'last']"]),
    ('java a Scanner handed to a method', 'java', [('Totals.java', r'''import java.io.*;
import java.util.Scanner;

public class Totals {
    static int total(Scanner in) {
        int t = 0;
        while (in.hasNextInt()) {
            t += in.nextInt();
        }
        return t;
    }

    static void report(PrintWriter out, String name, int value) {
        out.println(name + ": " + value);
    }

    public static void main(String[] args) throws IOException {
        Scanner in = new Scanner(new File("nums.txt"));
        int t = total(in);
        in.close();
        PrintWriter out = new PrintWriter("report.txt");
        report(out, "total", t);
        report(out, "double", t * 2);
        out.close();
        BufferedReader back = new BufferedReader(new FileReader("report.txt"));
        String line = back.readLine();
        while (line != null) {
            System.out.println(line);
            line = back.readLine();
        }
        back.close();
        java.util.List<String> names = new java.util.ArrayList<>();
        names.add("Ann");
        names.add("Bo");
        java.nio.file.Files.write(java.nio.file.Paths.get("names.txt"), names);
        System.out.println(String.join(",", java.nio.file.Files.readAllLines(java.nio.file.Paths.get("names.txt"))));
        System.out.println(new String(java.nio.file.Files.readAllBytes(java.nio.file.Paths.get("nums.txt"))).trim());
    }
}
'''), ('nums.txt', '4 5\n6\n')], [],
     ['total: 15', 'double: 30', 'Ann,Bo', '4 5', '6']),
    ('cs using a StreamWriter and WriteAllLines', 'csharp', [('Lines.cs', r'''using System;
using System.IO;
using System.Collections.Generic;

class Lines {
    static int CountWords(StreamReader r) {
        int n = 0;
        while (r.Peek() >= 0) {
            string line = r.ReadLine();
            n += line.Split(' ').Length;
        }
        return n;
    }

    static void Main() {
        using (StreamWriter w = new StreamWriter("poem.txt")) {
            w.WriteLine("roses are red");
            w.WriteLine("violets are blue");
        }
        StreamReader r = new StreamReader("poem.txt");
        Console.WriteLine(CountWords(r) + " words");
        r.Close();
        var kept = new List<string>();
        kept.Add("one");
        kept.Add("two");
        File.WriteAllLines("kept.txt", kept);
        File.AppendAllText("kept.txt", "three\n");
        string[] back = File.ReadAllLines("kept.txt");
        Console.WriteLine(string.Join("+", back));
        Console.WriteLine(File.ReadAllLines("kept.txt").Length);
    }
}
''')], [],
     ['6 words', 'one+two+three', '3']),
    ('cpp a stream handed to a function', 'cpp', [('sum.cpp', r'''#include <iostream>
#include <fstream>
#include <string>
using namespace std;

double average(ifstream& in) {
    double x, sum = 0;
    int n = 0;
    while (in >> x) {
        sum += x;
        n++;
    }
    return n > 0 ? sum / n : 0;
}

int main() {
    ofstream out;
    out.open("values.txt");
    out << 2.5 << " " << 4 << endl;
    out << 7.5 << endl;
    out.close();
    ifstream in;
    in.open("values.txt");
    if (in.fail()) {
        cout << "No values" << endl;
    } else {
        cout << "Average " << average(in) << endl;
        in.close();
    }
    ifstream again("values.txt");
    string word;
    again >> word;
    string rest;
    getline(again, rest);
    cout << "[" << word << "][" << rest << "]" << endl;
    again.close();
    return 0;
}
''')], [],
     ['Average 4.66667', '[2.5][ 4]']),
    ('js fs taken apart, and a file read a line at a time', 'javascript', [('sorter.js', r'''const { readFileSync, writeFileSync, existsSync } = require("fs");

writeFileSync("w.txt", ["b", "a", "c"].join("\n") + "\n");
const words = readFileSync("w.txt", "utf8").split("\n").filter((w) => w.length > 0);
words.sort();
console.log(words.join(" "));
console.log(existsSync("w.txt") ? "yes" : "no", existsSync("nope.txt") ? "yes" : "no");
''')], [],
     ['a b c', 'yes no']),
]
CODED = CODED + FILES
