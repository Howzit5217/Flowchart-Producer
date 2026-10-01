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
