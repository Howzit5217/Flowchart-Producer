"""More programs written by hand, for the Code way of working: lists,
tables, classes and records, lambdas, functions inside functions,
comprehensions, break and continue, switch expressions, try and
throw -- the rest of what a course teaches after the first weeks.

Each is read with no language handed over, run by the runner with the
answers typed in, and has to print `want`, which is what the program
itself prints -- found by running it in Python, JavaScript and Java,
and worked out by hand for C# and C++ (whose programs this machine
builds but will not run) -- in the runner's way of writing it: True
for true, [1, 2] for [ 1, 2 ], 100 for 100.0.

Same shape as coded.py: (what it is about, language, the code, what
gets typed, what it prints).
"""

# flake8: noqa
CODED = [
    ('list stats and a comprehension', 'python', '''
nums = [4, 8, 15, 16, 23, 42]
total = sum(nums)
print("Total:", total, "Count:", len(nums))
print("Largest:", max(nums), "Smallest:", min(nums))
evens = [n for n in nums if n % 2 == 0]
print("Evens:", evens)
squares = [n * n for n in range(1, 6)]
print(squares)
for i, n in enumerate(nums):
    if n > 15:
        print(i, n)
print(sorted([5, 3, 9, 1], reverse=True))
''',
     [],
     ['Total: 108 Count: 6', 'Largest: 42 Smallest: 4', 'Evens: [4, 8, 16, 42]', '[1, 4, 9, 16, 25]', '3 16', '4 23', '5 42', '[9, 5, 3, 1]']),

    ('word counts in a dictionary', 'python', '''
text = "the cat and the hat and the bat"
counts = {}
for word in text.split():
    counts[word] = counts.get(word, 0) + 1
for word in sorted(counts):
    print(word, counts[word])
most = max(counts, key=lambda w: counts[w])
print("Most common:", most)
print(len(counts), "different words")
''',
     [],
     ['and 2', 'bat 1', 'cat 1', 'hat 1', 'the 3', 'Most common: the', '5 different words']),

    ('a bank account class', 'python', '''
class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount

    def withdraw(self, amount):
        if amount > self.balance:
            print("Not enough money")
            return False
        self.balance -= amount
        return True

    def __str__(self):
        return self.owner + ": " + str(self.balance)

acct = Account("Ada", 100)
acct.deposit(50)
acct.withdraw(500)
acct.withdraw(30)
print(acct)
other = Account("Bob")
other.deposit(10)
print(other.owner, other.balance)
''',
     [],
     ['Not enough money', 'Ada: 120', 'Bob 10']),

    ('animals that speak, one way each', 'python', '''
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "..."

    def describe(self):
        return self.name + " says " + self.speak()

class Dog(Animal):
    def speak(self):
        return "Woof"

class Cat(Animal):
    def __init__(self, name, lives):
        super().__init__(name)
        self.lives = lives

    def speak(self):
        return "Meow"

pets = [Dog("Rex"), Cat("Tom", 9), Animal("Fish")]
for pet in pets:
    print(pet.describe())
print(pets[1].lives)
''',
     [],
     ['Rex says Woof', 'Tom says Meow', 'Fish says ...', '9']),

    ('a counter kept by an inner function', 'python', '''
def make_report(items):
    count = 0
    def add(item):
        nonlocal count
        count += 1
        print(count, item)
    for it in items:
        add(it)
    return count

n = make_report(["apple", "pear", "plum"])
print("Reported", n)
''',
     [],
     ['1 apple', '2 pear', '3 plum', 'Reported 3']),

    ('break, continue and for-else', 'python', '''
for n in range(2, 20):
    for d in range(2, n):
        if n % d == 0:
            break
    else:
        print(n, "is prime")

total = 0
for i in range(10):
    if i % 3 == 0:
        continue
    total += i
print("Total:", total)

k = 0
while True:
    k += 1
    if k * k > 50:
        break
print("First square over 50 is of", k)
''',
     [],
     ['2 is prime', '3 is prime', '5 is prime', '7 is prime', '11 is prime', '13 is prime', '17 is prime', '19 is prime', 'Total: 27', 'First square over 50 is of 8']),

    ('taking tuples apart', 'python', '''
point = (3, 4)
x, y = point
print(x, y)
first, *rest = [1, 2, 3, 4]
print(first, rest)
a, b = 1, 2
a, b = b, a + b
print(a, b)
pairs = [(1, "one"), (2, "two"), (3, "three")]
for number, word in pairs:
    print(number, "->", word)
data = [5, 2, 8]
data[0], data[2] = data[2], data[0]
print(data)
def min_max(values):
    return min(values), max(values)
lo, hi = min_max([7, 3, 9, 1])
print("lo", lo, "hi", hi)
''',
     [],
     ['3 4', '1 [2, 3, 4]', '2 3', '1 -> one', '2 -> two', '3 -> three', '[8, 2, 5]', 'lo 1 hi 9']),

    ('strings, sliced and turned about', 'python', '''
word = "racecar"
print(word[::-1] == word)
name = "Grace Hopper"
print(name.upper(), name.lower())
print(name[0:5], name[6:])
print(len(name), name.find("Hop"))
parts = "a,b,c".split(",")
print(parts)
print("-".join(parts))
print("hello".replace("l", "L"))
print("  spaced  ".strip() + "!")
letters = [c for c in "banana" if c != "a"]
print("".join(letters))
print(name.startswith("Gr"), name.endswith("x"))
print("abc" * 3)
''',
     [],
     ['True', 'GRACE HOPPER grace hopper', 'Grace Hopper', '12 6', "['a', 'b', 'c']", 'a-b-c', 'heLLo', 'spaced!', 'bnn', 'True False', 'abcabcabc']),

    ('a grid of noughts and crosses', 'python', '''
board = [[" "] * 3 for _ in range(3)]
board[0][0] = "X"
board[1][1] = "O"
board[2][2] = "X"
for row in board:
    print("|".join(row))
filled = 0
for r in range(3):
    for c in range(3):
        if board[r][c] != " ":
            filled += 1
print("Filled:", filled)
''',
     [],
     ['X| | ', ' |O| ', ' | |X', 'Filled: 3']),

    ('binary search and merge sort', 'python', '''
def merge_sort(items):
    if len(items) <= 1:
        return items
    mid = len(items) // 2
    left = merge_sort(items[:mid])
    right = merge_sort(items[mid:])
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            j += 1
    merged += left[i:]
    merged += right[j:]
    return merged

def binary_search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        elif items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

data = merge_sort([38, 27, 43, 3, 9, 82, 10])
print(data)
print(binary_search(data, 43), binary_search(data, 5))
''',
     [],
     ['[3, 9, 10, 27, 38, 43, 82]', '5 -1']),

    ('fibonacci remembered in a table', 'python', '''
memo = {}
def fib(n):
    if n in memo:
        return memo[n]
    if n < 2:
        result = n
    else:
        result = fib(n - 1) + fib(n - 2)
    memo[n] = result
    return result

for k in [5, 10, 20, 30]:
    print(k, fib(k))
''',
     [],
     ['5 5', '10 55', '20 6765', '30 832040']),

    ('a match with shapes in it', 'python', '''
def describe(command):
    match command.split():
        case ["go", direction]:
            return "going " + direction
        case ["take", item]:
            return "taking " + item
        case ["quit"]:
            return "bye"
        case _:
            return "what?"

for c in ["go north", "take lamp", "quit", "dance wildly"]:
    print(describe(c))
''',
     [],
     ['going north', 'taking lamp', 'bye', 'what?']),

    ('a triangle printed a star at a time', 'python', '''
n = 4
for i in range(1, n + 1):
    for j in range(i):
        print("*", end="")
    print()
for i in range(3):
    print(i, end=" ")
print("done")
''',
     [],
     ['*', '**', '***', '****', '0 1 2 done']),

    ('squares from a generator', 'python', '''
def squares(n):
    for i in range(n):
        yield i * i

print(list(squares(5)))
total = 0
for s in squares(4):
    total += s
print(total)
''',
     [],
     ['[0, 1, 4, 9, 16]', '14']),

    ('a dataclass point', 'python', '''
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int = 0

    def moved(self, dx, dy):
        return Point(self.x + dx, self.y + dy)

p = Point(1, 2)
q = p.moved(3, 4)
print(q.x, q.y)
r = Point(7)
print(r.x, r.y)
''',
     [],
     ['4 6', '7 0']),

    ('asking until a number is typed', 'python', '''
while True:
    text = input("Age: ")
    try:
        age = int(text)
        break
    except ValueError:
        print("Please type a number")
print("In ten years you will be", age + 10)
''',
     ['abc', '32'],
     ['Age: ', 'Please type a number', 'Age: ', 'In ten years you will be 42']),

    ('a stack and a queue', 'python', '''
stack = []
stack.append(1)
stack.append(2)
stack.append(3)
print(stack.pop(), stack)
queue = [10, 20, 30]
first = queue.pop(0)
print(first, queue)
queue.insert(0, 5)
print(queue, 20 in queue, 99 in queue)
queue.remove(20)
print(queue, queue.index(30))
''',
     [],
     ['3 [1, 2]', '10 [20, 30]', '[5, 20, 30] True False', '[5, 30] 1']),

    ('sets of things seen', 'python', '''
seen = set()
for ch in "mississippi":
    seen.add(ch)
print(len(seen))
print(sorted(seen))
vowels = {"a", "e", "i", "o", "u"}
print("i" in vowels, "z" in vowels)
''',
     [],
     ['4', "['i', 'm', 'p', 's']", 'True False']),

    ('sorting records by a key', 'python', '''
people = [("Ada", 36), ("Alan", 41), ("Grace", 85)]
by_age = sorted(people, key=lambda p: p[1], reverse=True)
for name, age in by_age:
    print(name, age)
names = [p[0] for p in people]
print(", ".join(names))
youngest = min(people, key=lambda p: p[1])
print("Youngest:", youngest[0])
''',
     [],
     ['Grace 85', 'Alan 41', 'Ada 36', 'Ada, Alan, Grace', 'Youngest: Ada']),

    ('functions with defaults and names', 'python', '''
def greet(name, greeting="Hello", punct="!"):
    return greeting + ", " + name + punct

print(greet("Ada"))
print(greet("Bob", "Hi"))
print(greet("Cy", punct="?"))
def total(*nums):
    s = 0
    for n in nums:
        s += n
    return s
print(total(1, 2, 3), total())
''',
     [],
     ['Hello, Ada!', 'Hi, Bob!', 'Hello, Cy?', '6 0']),

    ('a class counting its objects', 'python', '''
class Robot:
    count = 0

    def __init__(self, name):
        self.name = name
        Robot.count += 1

    def hello(self):
        print("I am", self.name)

r1 = Robot("R2")
r2 = Robot("C3")
r1.hello()
r2.hello()
print(Robot.count, "robots")
''',
     [],
     ['I am R2', 'I am C3', '2 robots']),

    ('map, filter and lambdas', 'python', '''
nums = [1, 2, 3, 4, 5, 6]
doubled = list(map(lambda n: n * 2, nums))
odd = list(filter(lambda n: n % 2 == 1, nums))
print(doubled)
print(odd)
print(any(n > 5 for n in nums), all(n > 0 for n in nums))
words = ["pear", "fig", "banana"]
print(sorted(words, key=len))
print(max(len(w) for w in words))
''',
     [],
     ['[2, 4, 6, 8, 10, 12]', '[1, 3, 5]', 'True True', "['fig', 'pear', 'banana']", '6']),

    ('a shopping cart of dictionaries', 'python', '''
cart = [
    {"item": "tea", "price": 3.5, "qty": 2},
    {"item": "cake", "price": 4.25, "qty": 1},
]
total = 0
for line in cart:
    cost = line["price"] * line["qty"]
    total += cost
    print(line["item"], cost)
print("Total", total)
cart.append({"item": "jam", "price": 2.0, "qty": 3})
print(len(cart), cart[-1]["item"])
''',
     [],
     ['tea 7', 'cake 4.25', 'Total 11.25', '3 jam']),

    ('a nested helper that walks a grid', 'python', '''
def count_islands(grid):
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    def sink(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return
        if seen[r][c] or grid[r][c] == 0:
            return
        seen[r][c] = True
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)
    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1 and not seen[r][c]:
                sink(r, c)
                islands += 1
    return islands

world = [[1, 1, 0, 0],
         [0, 1, 0, 1],
         [1, 0, 0, 1],
         [0, 0, 1, 1]]
print(count_islands(world))
''',
     [],
     ['3']),

    ('arrays mapped, filtered and reduced', 'javascript', '''
const nums = [3, 1, 4, 1, 5, 9, 2, 6];
const doubled = nums.map(n => n * 2);
const big = nums.filter(n => n > 3);
const total = nums.reduce((sum, n) => sum + n, 0);
console.log(doubled.join(" "));
console.log(big.length, total);
const sorted = [...nums].sort((a, b) => a - b);
console.log(sorted.join(","));
console.log(nums.includes(9), nums.indexOf(5));
nums.forEach((n, i) => {
  if (n === 1) {
    console.log("a one at", i);
  }
});
''',
     [],
     ['6 2 8 2 10 18 4 12', '4 31', '1,1,2,3,4,5,6,9', 'True 4', 'a one at 1', 'a one at 3']),

    ('objects as records', 'javascript', '''
const people = [
  { name: "Ada", age: 36 },
  { name: "Alan", age: 41 },
  { name: "Grace", age: 85 },
];
for (const p of people) {
  console.log(p.name + " is " + p.age);
}
const oldest = people.reduce((a, b) => (a.age > b.age ? a : b));
console.log("Oldest:", oldest.name);
const names = people.map(p => p.name);
console.log(names.join(", "));
const book = { title: "Dune", pages: 412 };
book.pages += 8;
console.log(book.title, book.pages);
for (const key of Object.keys(book)) {
  console.log(key);
}
''',
     [],
     ['Ada is 36', 'Alan is 41', 'Grace is 85', 'Oldest: Grace', 'Ada, Alan, Grace', 'Dune 420', 'title', 'pages']),

    ('a class with a getter and a subclass', 'javascript', '''
class Shape {
  constructor(name) {
    this.name = name;
  }
  area() {
    return 0;
  }
  describe() {
    return this.name + " with area " + this.area();
  }
}
class Rect extends Shape {
  constructor(w, h) {
    super("rect");
    this.w = w;
    this.h = h;
  }
  area() {
    return this.w * this.h;
  }
}
class Square extends Rect {
  constructor(s) {
    super(s, s);
    this.name = "square";
  }
}
const shapes = [new Rect(2, 3), new Square(4), new Shape("blob")];
for (const s of shapes) {
  console.log(s.describe());
}
''',
     [],
     ['rect with area 6', 'square with area 16', 'blob with area 0']),

    ('counting letters in a Map', 'javascript', '''
const text = "hello world";
const counts = new Map();
for (const ch of text) {
  if (ch === " ") continue;
  counts.set(ch, (counts.get(ch) || 0) + 1);
}
console.log(counts.get("l"), counts.get("o"), counts.has("z"));
const unique = new Set(text.split(""));
console.log(unique.size);
''',
     [],
     ['3 2 False', '8']),

    ('labelled loops and a break', 'javascript', '''
outer: for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= 3; j++) {
    if (i * j === 4) {
      console.log("found", i, j);
      break outer;
    }
  }
}
let n = 0;
while (true) {
  n++;
  if (n % 2 === 0) continue;
  if (n > 7) break;
  console.log("odd", n);
}
''',
     [],
     ['found 2 2', 'odd 1', 'odd 3', 'odd 5', 'odd 7']),

    ('strings taken apart', 'javascript', '''
const s = "JavaScript";
console.log(s.toUpperCase(), s.length);
console.log(s.slice(0, 4), s.substring(4));
console.log(s.split("").reverse().join(""));
console.log(s.includes("Script"), s.startsWith("Java"));
console.log("a-b-c".split("-").length);
console.log("ha".repeat(3));
const words = "the quick brown fox".split(" ");
const caps = words.map(w => w[0].toUpperCase() + w.slice(1));
console.log(caps.join(" "));
''',
     [],
     ['JAVASCRIPT 10', 'Java Script', 'tpircSavaJ', 'True True', '3', 'hahaha', 'The Quick Brown Fox']),

    ('destructuring and spreading', 'javascript', '''
const [a, b, ...rest] = [10, 20, 30, 40];
console.log(a, b, rest.length);
const point = { x: 3, y: 4 };
const { x, y } = point;
console.log(Math.sqrt(x * x + y * y));
let p = 1, q = 2;
[p, q] = [q, p];
console.log(p, q);
const more = [...rest, 50];
console.log(more.join(" "));
function sum(...values) {
  let t = 0;
  for (const v of values) t += v;
  return t;
}
console.log(sum(1, 2, 3, 4));
''',
     [],
     ['10 20 2', '5', '2 1', '30 40 50', '10']),

    ('a function inside a function', 'javascript', '''
function stats(values) {
  function mean() {
    let t = 0;
    for (const v of values) t += v;
    return t / values.length;
  }
  const m = mean();
  let spread = 0;
  for (const v of values) {
    spread += (v - m) * (v - m);
  }
  return [m, spread / values.length];
}
const [avg, variance] = stats([2, 4, 4, 4, 5, 5, 7, 9]);
console.log(avg, variance);
''',
     [],
     ['5 4']),

    ('a queue of jobs', 'javascript', '''
const jobs = ["wash", "dry", "fold"];
jobs.push("iron");
jobs.unshift("sort");
while (jobs.length > 0) {
  const job = jobs.shift();
  console.log("doing", job);
}
const stack = [1, 2, 3];
console.log(stack.pop(), stack.length);
''',
     [],
     ['doing sort', 'doing wash', 'doing dry', 'doing fold', 'doing iron', '3 2']),

    ('some, every and find', 'javascript', '''
const scores = [72, 88, 95, 60, 81];
console.log(scores.some(s => s > 90));
console.log(scores.every(s => s >= 60));
const first = scores.find(s => s > 80);
console.log(first, scores.findIndex(s => s < 70));
const best = Math.max(...scores);
console.log(best);
''',
     [],
     ['True', 'True', '88 3', '95']),

    ('a switch on words', 'javascript', '''
function kind(animal) {
  switch (animal) {
    case "dog":
    case "cat":
      return "pet";
    case "cow":
      return "farm";
    default:
      return "wild";
  }
}
["dog", "cow", "lion", "cat"].forEach(a => console.log(a, kind(a)));
''',
     [],
     ['dog pet', 'cow farm', 'lion wild', 'cat pet']),

    ('a two-dimensional table', 'javascript', '''
const rows = 3, cols = 4;
const grid = [];
for (let r = 0; r < rows; r++) {
  grid.push([]);
  for (let c = 0; c < cols; c++) {
    grid[r].push(r * c);
  }
}
for (const row of grid) {
  console.log(row.join(" "));
}
const zeros = Array(3).fill(0);
zeros[1] = 5;
console.log(zeros.join(","));
''',
     [],
     ['0 0 0 0', '0 1 2 3', '0 2 4 6', '0,5,0']),

    ('an array sorted by hand', 'java', '''
public class Bubble {
    public static void main(String[] args) {
        int[] a = {5, 2, 9, 1, 7};
        for (int i = 0; i < a.length - 1; i++) {
            for (int j = 0; j < a.length - 1 - i; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j];
                    a[j] = a[j + 1];
                    a[j + 1] = t;
                }
            }
        }
        for (int x : a) {
            System.out.print(x + " ");
        }
        System.out.println();
        System.out.println("Largest: " + a[a.length - 1]);
    }
}
''',
     [],
     ['1 2 5 7 9 ', 'Largest: 9']),

    ('an ArrayList of names', 'java', '''
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Names {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Grace");
        names.add("Ada");
        names.add("Alan");
        Collections.sort(names);
        System.out.println(names);
        System.out.println(names.size() + " names, first " + names.get(0));
        names.remove("Ada");
        System.out.println(names.contains("Ada") + " " + names.indexOf("Grace"));
        for (int i = 0; i < names.size(); i++) {
            System.out.println(i + ": " + names.get(i));
        }
    }
}
''',
     [],
     ["['Ada', 'Alan', 'Grace']", '3 names, first Ada', 'False 1', '0: Alan', '1: Grace']),

    ('counting words in a HashMap', 'java', '''
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Words {
    public static void main(String[] args) {
        String text = "to be or not to be";
        Map<String, Integer> counts = new HashMap<>();
        for (String w : text.split(" ")) {
            counts.put(w, counts.getOrDefault(w, 0) + 1);
        }
        System.out.println(counts.get("to") + " " + counts.get("be") + " " + counts.get("or"));
        System.out.println(counts.containsKey("not") + " " + counts.size());
        int total = 0;
        for (int n : counts.values()) {
            total += n;
        }
        System.out.println("total " + total);
    }
}
''',
     [],
     ['2 2 1', 'True 4', 'total 6']),

    ('a bank account class', 'java', '''
public class Bank {
    static class Account {
        private String owner;
        private double balance;

        Account(String owner, double balance) {
            this.owner = owner;
            this.balance = balance;
        }

        void deposit(double amount) {
            balance += amount;
        }

        boolean withdraw(double amount) {
            if (amount > balance) {
                return false;
            }
            balance -= amount;
            return true;
        }

        double getBalance() {
            return balance;
        }

        @Override
        public String toString() {
            return owner + " has " + balance;
        }
    }

    public static void main(String[] args) {
        Account a = new Account("Ada", 100);
        a.deposit(25.5);
        System.out.println(a.withdraw(500));
        System.out.println(a.withdraw(20));
        System.out.println(a);
        System.out.println(a.getBalance());
    }
}
''',
     [],
     ['False', 'True', 'Ada has 105.5', '105.5']),

    ('shapes, each with its own area', 'java', '''
abstract class Shape {
    abstract double area();
    String describe() {
        return getClass().getSimpleName() + " " + area();
    }
}

class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }
    double area() { return 3 * r * r; }
}

class Rect extends Shape {
    double w, h;
    Rect(double w, double h) { this.w = w; this.h = h; }
    double area() { return w * h; }
}

public class Shapes {
    public static void main(String[] args) {
        Shape[] shapes = { new Circle(2), new Rect(3, 4) };
        double total = 0;
        for (Shape s : shapes) {
            total += s.area();
        }
        System.out.println("Total area: " + total);
        System.out.println(shapes[1].area());
    }
}
''',
     [],
     ['Total area: 24', '12']),

    ('words turned about with a StringBuilder', 'java', '''
public class Reverse {
    static String reverse(String s) {
        StringBuilder sb = new StringBuilder();
        for (int i = s.length() - 1; i >= 0; i--) {
            sb.append(s.charAt(i));
        }
        return sb.toString();
    }

    static boolean isPalindrome(String s) {
        return s.equals(reverse(s));
    }

    public static void main(String[] args) {
        System.out.println(reverse("hello"));
        System.out.println(isPalindrome("level") + " " + isPalindrome("java"));
        String word = "Mississippi";
        int count = 0;
        for (char c : word.toCharArray()) {
            if (c == 's') {
                count++;
            }
        }
        System.out.println(count + " esses");
        System.out.println(word.substring(0, 4) + " " + word.indexOf("ss"));
    }
}
''',
     [],
     ['olleh', 'True False', '4 esses', 'Miss 2']),

    ('a grid of numbers', 'java', '''
public class Grid {
    public static void main(String[] args) {
        int[][] grid = new int[3][4];
        for (int r = 0; r < 3; r++) {
            for (int c = 0; c < 4; c++) {
                grid[r][c] = r * 4 + c;
            }
        }
        int sum = 0;
        for (int[] row : grid) {
            for (int v : row) {
                sum += v;
            }
        }
        System.out.println("Sum " + sum);
        System.out.println(grid[2][3] + " " + grid.length + " " + grid[0].length);
    }
}
''',
     [],
     ['Sum 66', '11 3 4']),

    ('a labelled break and continue', 'java', '''
public class Loops {
    public static void main(String[] args) {
        outer:
        for (int i = 1; i <= 4; i++) {
            for (int j = 1; j <= 4; j++) {
                if (j == 3) {
                    continue outer;
                }
                if (i == 3) {
                    break outer;
                }
                System.out.println(i + "," + j);
            }
        }
        int n = 0;
        while (true) {
            n += 7;
            if (n % 5 == 0) break;
        }
        System.out.println("n = " + n);
    }
}
''',
     [],
     ['1,1', '1,2', '2,1', '2,2', 'n = 35']),

    ('streams of numbers', 'java', '''
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Streams {
    public static void main(String[] args) {
        List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);
        List<Integer> evens = nums.stream().filter(n -> n % 2 == 0).collect(Collectors.toList());
        int sumSquares = nums.stream().mapToInt(n -> n * n).sum();
        System.out.println(evens);
        System.out.println(sumSquares);
        long big = nums.stream().filter(n -> n > 3).count();
        System.out.println(big);
    }
}
''',
     [],
     ['[2, 4, 6]', '91', '3']),

    ('overloaded methods', 'java', '''
public class Over {
    static int area(int side) { return side * side; }
    static int area(int w, int h) { return w * h; }
    static double area(double r) { return 3.0 * r * r; }

    public static void main(String[] args) {
        System.out.println(area(4));
        System.out.println(area(3, 5));
    }
}
''',
     [],
     ['16', '15']),

    ('a switch on a string', 'java', '''
import java.util.Scanner;

public class Menu {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String cmd = sc.nextLine();
        switch (cmd) {
            case "add":
                System.out.println("Adding");
                break;
            case "list":
            case "show":
                System.out.println("Listing");
                break;
            default:
                System.out.println("Unknown: " + cmd);
        }
        int total = 0;
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) continue;
            total += i;
        }
        System.out.println(total);
    }
}
''',
     ['show'],
     ['Listing', '25']),

    ('an interface and two kinds of pet', 'java', '''
interface Speaker {
    String speak();
}

class Dog implements Speaker {
    public String speak() { return "Woof"; }
}

class Duck implements Speaker {
    private int volume;
    Duck(int volume) { this.volume = volume; }
    public String speak() { return volume > 5 ? "QUACK" : "quack"; }
}

public class Pets {
    public static void main(String[] args) {
        Speaker[] pets = { new Dog(), new Duck(3), new Duck(9) };
        for (Speaker p : pets) {
            System.out.println(p.speak());
        }
    }
}
''',
     [],
     ['Woof', 'quack', 'QUACK']),

    ('a List of scores', 'csharp', '''
using System;
using System.Collections.Generic;

class Scores
{
    static void Main()
    {
        List<int> scores = new List<int>();
        scores.Add(72);
        scores.Add(95);
        scores.Add(60);
        scores.Add(88);
        int total = 0;
        foreach (int s in scores)
        {
            total += s;
        }
        Console.WriteLine("Count " + scores.Count + " total " + total);
        scores.Sort();
        Console.WriteLine(scores[0] + " " + scores[scores.Count - 1]);
        scores.RemoveAt(0);
        Console.WriteLine(scores.Contains(60) + " " + scores.IndexOf(88));
    }
}
''',
     [],
     ['Count 4 total 315', '60 95', 'False 1']),

    ('a Dictionary of stock', 'csharp', '''
using System;
using System.Collections.Generic;

class Stock
{
    static void Main()
    {
        Dictionary<string, int> stock = new Dictionary<string, int>();
        stock["apples"] = 5;
        stock["pears"] = 2;
        stock.Add("plums", 9);
        stock["apples"] += 3;
        if (stock.ContainsKey("pears"))
        {
            Console.WriteLine("pears: " + stock["pears"]);
        }
        int total = 0;
        foreach (KeyValuePair<string, int> kv in stock)
        {
            total += kv.Value;
        }
        Console.WriteLine("total " + total + " kinds " + stock.Count);
        stock.Remove("plums");
        Console.WriteLine(stock.ContainsKey("plums"));
    }
}
''',
     [],
     ['pears: 2', 'total 19 kinds 3', 'False']),

    ('a class with properties', 'csharp', '''
using System;

class Person
{
    public string Name { get; set; }
    public int Age { get; set; }

    public Person(string name, int age)
    {
        Name = name;
        Age = age;
    }

    public void Birthday()
    {
        Age++;
    }

    public override string ToString()
    {
        return Name + " (" + Age + ")";
    }
}

class Program
{
    static void Main()
    {
        Person p = new Person("Ada", 36);
        p.Birthday();
        Console.WriteLine(p);
        Console.WriteLine(p.Name.ToUpper() + " " + p.Age);
    }
}
''',
     [],
     ['Ada (37)', 'ADA 37']),

    ('vehicles that override', 'csharp', '''
using System;

class Vehicle
{
    protected int wheels;
    public Vehicle(int wheels) { this.wheels = wheels; }
    public virtual string Sound() { return "..."; }
    public string Describe() { return wheels + " wheels, " + Sound(); }
}

class Car : Vehicle
{
    public Car() : base(4) { }
    public override string Sound() { return "vroom"; }
}

class Bike : Vehicle
{
    public Bike() : base(2) { }
    public override string Sound() { return "ring"; }
}

class Program
{
    static void Main()
    {
        Vehicle[] all = { new Car(), new Bike(), new Vehicle(3) };
        foreach (Vehicle v in all)
        {
            Console.WriteLine(v.Describe());
        }
    }
}
''',
     [],
     ['4 wheels, vroom', '2 wheels, ring', '3 wheels, ...']),

    ('a rectangle of numbers', 'csharp', '''
using System;

class Table
{
    static void Main()
    {
        int[,] times = new int[3, 3];
        for (int r = 0; r < 3; r++)
        {
            for (int c = 0; c < 3; c++)
            {
                times[r, c] = (r + 1) * (c + 1);
            }
        }
        Console.WriteLine(times[2, 2] + " " + times[1, 2]);
        int[] flat = { 4, 8, 15, 16 };
        Array.Reverse(flat);
        Console.WriteLine(string.Join(",", flat));
    }
}
''',
     [],
     ['9 6', '16,15,8,4']),

    ('LINQ over a list', 'csharp', '''
using System;
using System.Collections.Generic;
using System.Linq;

class Linq
{
    static void Main()
    {
        List<int> nums = new List<int> { 5, 12, 7, 20, 3 };
        List<int> big = nums.Where(n => n > 6).ToList();
        int sum = nums.Sum();
        Console.WriteLine(big.Count + " " + sum + " " + nums.Max());
        var doubled = nums.Select(n => n * 2).ToList();
        Console.WriteLine(string.Join(" ", doubled));
        Console.WriteLine(nums.Any(n => n > 15));
    }
}
''',
     [],
     ['3 47 20', '10 24 14 40 6', 'True']),

    ('a StringBuilder and a string turned about', 'csharp', '''
using System;
using System.Text;

class Words
{
    static void Main()
    {
        StringBuilder sb = new StringBuilder();
        string[] words = { "red", "green", "blue" };
        foreach (string w in words)
        {
            sb.Append(w.Substring(0, 1).ToUpper());
        }
        Console.WriteLine(sb.ToString());
        string s = "stressed";
        char[] letters = s.ToCharArray();
        Array.Reverse(letters);
        Console.WriteLine(new string(letters));
        Console.WriteLine(s.IndexOf("ss") + " " + s.Replace("s", "S"));
    }
}
''',
     [],
     ['RGB', 'desserts', '4 StreSSed']),

    ('a switch and a loop with a way out', 'csharp', '''
using System;

class Days
{
    static void Main()
    {
        for (int d = 1; d <= 7; d++)
        {
            string kind;
            switch (d)
            {
                case 6:
                case 7:
                    kind = "weekend";
                    break;
                default:
                    kind = "weekday";
                    break;
            }
            if (d == 3) continue;
            Console.WriteLine(d + " " + kind);
            if (d == 6) break;
        }
    }
}
''',
     [],
     ['1 weekday', '2 weekday', '4 weekday', '5 weekday', '6 weekend']),

    ('a vector sorted and summed', 'cpp', '''
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {7, 2, 9, 4};
    v.push_back(1);
    sort(v.begin(), v.end());
    int total = 0;
    for (int x : v) {
        total += x;
        cout << x << " ";
    }
    cout << endl;
    cout << "size " << v.size() << " total " << total << endl;
    cout << "back " << v.back() << " front " << v.front() << endl;
    v.pop_back();
    cout << v.size() << endl;
    return 0;
}
''',
     [],
     ['1 2 4 7 9 ', 'size 5 total 23', 'back 9 front 1', '4']),

    ('a struct and a class', 'cpp', '''
#include <iostream>
#include <string>
using namespace std;

struct Point {
    int x;
    int y;
};

class Counter {
private:
    int count;
    string label;
public:
    Counter(string l) : count(0), label(l) {}
    void add(int n) { count += n; }
    int value() const { return count; }
    string describe() const { return label + "=" + to_string(count); }
};

int main() {
    Point p;
    p.x = 3;
    p.y = 4;
    cout << p.x * p.x + p.y * p.y << endl;
    Counter c("clicks");
    c.add(2);
    c.add(5);
    cout << c.value() << endl;
    cout << c.describe() << endl;
    return 0;
}
''',
     [],
     ['25', '7', 'clicks=7']),

    ('counting with a map', 'cpp', '''
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    string words[] = {"a", "b", "a", "c", "a", "b"};
    map<string, int> counts;
    for (int i = 0; i < 6; i++) {
        counts[words[i]]++;
    }
    cout << counts["a"] << " " << counts["b"] << " " << counts["c"] << endl;
    cout << counts.size() << endl;
    if (counts.count("z") == 0) {
        cout << "no z" << endl;
    }
    return 0;
}
''',
     [],
     ['3 2 1', '3', 'no z']),

    ('a grid in a vector of vectors', 'cpp', '''
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int rows = 3, cols = 4;
    vector<vector<int>> grid(rows, vector<int>(cols, 0));
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            grid[r][c] = r + c;
        }
    }
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            cout << grid[r][c];
        }
        cout << endl;
    }
    return 0;
}
''',
     [],
     ['0123', '1234', '2345']),

    ('strings cut up and turned round', 'cpp', '''
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s = "programming";
    cout << s.length() << " " << s.substr(0, 7) << endl;
    cout << s.find("gram") << endl;
    string r = s;
    reverse(r.begin(), r.end());
    cout << r << endl;
    int vowels = 0;
    for (char ch : s) {
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
            vowels++;
        }
    }
    cout << vowels << " vowels" << endl;
    return 0;
}
''',
     [],
     ['11 program', '3', 'gnimmargorp', '3 vowels']),

    ('shapes that override', 'cpp', '''
#include <iostream>
using namespace std;

class Shape {
public:
    virtual double area() const { return 0; }
    virtual ~Shape() {}
};

class Square : public Shape {
    double side;
public:
    Square(double s) : side(s) {}
    double area() const override { return side * side; }
};

class Tri : public Shape {
    double b, h;
public:
    Tri(double b, double h) : b(b), h(h) {}
    double area() const override { return b * h / 2; }
};

int main() {
    Square sq(3);
    Tri t(4, 5);
    cout << sq.area() << " " << t.area() << endl;
    Shape* all[] = { &sq, &t };
    double sum = 0;
    for (int i = 0; i < 2; i++) {
        sum += all[i]->area();
    }
    cout << sum << endl;
    return 0;
}
''',
     [],
     ['9 10', '19']),

    ('a swap by reference, and a lambda to sort by', 'cpp', '''
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void swapBoth(int &a, int &b) {
    int t = a;
    a = b;
    b = t;
}

int main() {
    int x = 1, y = 2;
    swapBoth(x, y);
    cout << x << " " << y << endl;
    vector<int> v = {3, 1, 2};
    sort(v.begin(), v.end(), [](int a, int b) { return a > b; });
    for (int n : v) cout << n;
    cout << endl;
    return 0;
}
''',
     [],
     ['2 1', '321']),

    ('a linked list of nodes', 'python', '''
class Node:
    def __init__(self, value, next=None):
        self.value = value
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def push(self, value):
        self.head = Node(value, self.head)
        self.size += 1

    def to_list(self):
        out = []
        node = self.head
        while node is not None:
            out.append(node.value)
            node = node.next
        return out

    def reverse(self):
        prev = None
        node = self.head
        while node:
            nxt = node.next
            node.next = prev
            prev = node
            node = nxt
        self.head = prev

items = LinkedList()
for v in [1, 2, 3, 4]:
    items.push(v)
print(items.to_list(), items.size)
items.reverse()
print(items.to_list())
''',
     [],
     ['[4, 3, 2, 1] 4', '[1, 2, 3, 4]']),

    ('a binary search tree', 'python', '''
class Tree:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None

def insert(root, key):
    if root is None:
        return Tree(key)
    if key < root.key:
        root.left = insert(root.left, key)
    else:
        root.right = insert(root.right, key)
    return root

def in_order(root, out):
    if root:
        in_order(root.left, out)
        out.append(root.key)
        in_order(root.right, out)

def height(root):
    if root is None:
        return 0
    return 1 + max(height(root.left), height(root.right))

root = None
for k in [50, 30, 70, 20, 40, 60, 80, 35]:
    root = insert(root, k)
keys = []
in_order(root, keys)
print(keys)
print("height", height(root))
''',
     [],
     ['[20, 30, 35, 40, 50, 60, 70, 80]', 'height 4']),

    ('towers of hanoi', 'python', '''
moves = []
def hanoi(n, source, target, spare):
    if n == 0:
        return
    hanoi(n - 1, source, spare, target)
    moves.append(source + "->" + target)
    hanoi(n - 1, spare, target, source)

hanoi(3, "A", "C", "B")
print(len(moves), "moves")
print(moves[0], moves[-1])
''',
     [],
     ['7 moves', 'A->C A->C']),

    ('quicksort by partitioning', 'python', '''
def quicksort(a, lo, hi):
    if lo < hi:
        p = partition(a, lo, hi)
        quicksort(a, lo, p - 1)
        quicksort(a, p + 1, hi)

def partition(a, lo, hi):
    pivot = a[hi]
    i = lo - 1
    for j in range(lo, hi):
        if a[j] <= pivot:
            i += 1
            a[i], a[j] = a[j], a[i]
    a[i + 1], a[hi] = a[hi], a[i + 1]
    return i + 1

data = [9, 4, 7, 1, 8, 2, 6]
quicksort(data, 0, len(data) - 1)
print(data)
''',
     [],
     ['[1, 2, 4, 6, 7, 8, 9]']),

    ('a caesar cipher', 'python', '''
def shift(text, key):
    out = ""
    for ch in text:
        if ch.isalpha():
            base = ord("A") if ch.isupper() else ord("a")
            out += chr((ord(ch) - base + key) % 26 + base)
        else:
            out += ch
    return out

secret = shift("Hello, World!", 3)
print(secret)
print(shift(secret, -3))
''',
     [],
     ['Khoor, Zruog!', 'Hello, World!']),

    ('primes by the sieve', 'python', '''
limit = 50
is_prime = [True] * (limit + 1)
is_prime[0] = is_prime[1] = False
for i in range(2, int(limit ** 0.5) + 1):
    if is_prime[i]:
        for j in range(i * i, limit + 1, i):
            is_prime[j] = False
primes = [n for n in range(limit + 1) if is_prime[n]]
print(primes)
print(len(primes), "primes")
''',
     [],
     ['[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]', '15 primes']),

    ('multiplying matrices', 'python', '''
def multiply(a, b):
    rows, cols, inner = len(a), len(b[0]), len(b)
    result = [[0] * cols for _ in range(rows)]
    for i in range(rows):
        for j in range(cols):
            for k in range(inner):
                result[i][j] += a[i][k] * b[k][j]
    return result

m = multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])
for row in m:
    print(" ".join(str(v) for v in row))
''',
     [],
     ['19 22', '43 50']),

    ('hangman, one guess at a time', 'python', '''
word = "python"
guessed = set()
tries = 6
while tries > 0:
    shown = "".join(c if c in guessed else "_" for c in word)
    print(shown)
    if "_" not in shown:
        print("You win!")
        break
    guess = input("Letter: ").lower()
    if guess in guessed:
        print("Already guessed")
        continue
    guessed.add(guess)
    if guess not in word:
        tries -= 1
        print("Wrong,", tries, "left")
else:
    print("Out of tries. It was", word)
''',
     ['p', 'z', 'y', 't', 'h', 'o', 'n'],
     ['______', 'Letter: ', 'p_____', 'Letter: ', 'Wrong, 5 left', 'p_____', 'Letter: ', 'py____', 'Letter: ', 'pyt___', 'Letter: ', 'pyth__', 'Letter: ', 'pytho_', 'Letter: ', 'python', 'You win!']),

    ('an inventory kept in a dictionary', 'python', '''
inventory = {"apple": 3, "pear": 0}

def add(item, count=1):
    inventory[item] = inventory.get(item, 0) + count

def remove(item):
    if inventory.get(item, 0) > 0:
        inventory[item] -= 1
        return True
    return False

add("apple", 2)
add("plum")
print(remove("pear"), remove("plum"))
for name, count in sorted(inventory.items()):
    print(f"{name:>6}: {count}")
in_stock = [k for k, v in inventory.items() if v > 0]
print(in_stock)
''',
     [],
     ['False True', ' apple: 5', '  pear: 0', '  plum: 0', "['apple']"]),

    ('a grade book of students', 'python', '''
class Student:
    def __init__(self, name):
        self.name = name
        self.marks = []

    def add(self, mark):
        self.marks.append(mark)

    def average(self):
        if not self.marks:
            return 0
        return sum(self.marks) / len(self.marks)

    def grade(self):
        avg = self.average()
        if avg >= 90:
            return "A"
        elif avg >= 80:
            return "B"
        elif avg >= 70:
            return "C"
        return "F"

students = [Student("Ada"), Student("Bob")]
students[0].add(95)
students[0].add(88)
students[1].add(72)
students[1].add(65)
for s in students:
    print(f"{s.name}: {s.average():.1f} {s.grade()}")
best = max(students, key=lambda s: s.average())
print("Top:", best.name)
''',
     [],
     ['Ada: 91.5 A', 'Bob: 68.5 F', 'Top: Ada']),

    ('guess the number, with the answer fixed', 'python', '''
secret = 42
guesses = 0
while True:
    guess = int(input("Guess: "))
    guesses += 1
    if guess < secret:
        print("Higher")
    elif guess > secret:
        print("Lower")
    else:
        print(f"Got it in {guesses} guesses")
        break
''',
     ['50', '25', '42'],
     ['Guess: ', 'Lower', 'Guess: ', 'Higher', 'Guess: ', 'Got it in 3 guesses']),

    ('anagrams and word lengths', 'python', '''
def is_anagram(a, b):
    return sorted(a.replace(" ", "").lower()) == sorted(b.replace(" ", "").lower())

print(is_anagram("Listen", "Silent"), is_anagram("abc", "abd"))
words = "the quick brown fox jumps over the lazy dog".split()
lengths = {w: len(w) for w in words}
longest = max(words, key=len)
print(longest, lengths["quick"])
print(sum(1 for w in words if len(w) > 3))
print(words.count("the"))
''',
     [],
     ['True False', 'quick 5', '5', '2']),

    ('a linked list class', 'javascript', '''
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}
class List {
  constructor() {
    this.head = null;
    this.length = 0;
  }
  add(value) {
    const node = new Node(value);
    if (this.head === null) {
      this.head = node;
    } else {
      let cur = this.head;
      while (cur.next !== null) {
        cur = cur.next;
      }
      cur.next = node;
    }
    this.length++;
  }
  toArray() {
    const out = [];
    for (let cur = this.head; cur; cur = cur.next) {
      out.push(cur.value);
    }
    return out;
  }
}
const list = new List();
[5, 10, 15].forEach(v => list.add(v));
console.log(list.toArray().join(" -> "), list.length);
''',
     [],
     ['5 -> 10 -> 15 3']),

    ('fizz buzz', 'javascript', '''
for (let i = 1; i <= 15; i++) {
  let out = "";
  if (i % 3 === 0) out += "Fizz";
  if (i % 5 === 0) out += "Buzz";
  console.log(out || i);
}
''',
     [],
     ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']),

    ('recursion: factorial and power set size', 'javascript', '''
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}
function fib(n, memo = {}) {
  if (n in memo) return memo[n];
  if (n < 2) return n;
  memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
  return memo[n];
}
console.log(factorial(6), fib(25));
''',
     [],
     ['720 75025']),

    ('a grade report from an array of objects', 'javascript', '''
const students = [
  { name: "Ann", scores: [90, 85, 77] },
  { name: "Ben", scores: [60, 72, 58] },
];
function average(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
for (const s of students) {
  const avg = average(s.scores);
  const grade = avg >= 80 ? "pass with merit" : avg >= 60 ? "pass" : "fail";
  console.log(`${s.name}: ${avg.toFixed(1)} (${grade})`);
}
const top = students.filter(s => average(s.scores) > 70).map(s => s.name);
console.log(top);
''',
     [],
     ['Ann: 84.0 (pass with merit)', 'Ben: 63.3 (pass)', "['Ann']"]),

    ('a do-while with a counter', 'javascript', '''
let n = 1, steps = 0;
do {
  n *= 3;
  steps++;
} while (n < 100);
console.log(n, steps);
let text = "";
for (const ch of "abc") {
  text = ch + text;
}
console.log(text);
''',
     [],
     ['243 5', 'cba']),

    ('a switch with a fall through and a break inside', 'javascript', '''
function points(card) {
  let value = 0;
  switch (card) {
    case "A":
      value = 11;
      break;
    case "K":
    case "Q":
    case "J":
      value = 10;
      break;
    default:
      value = parseInt(card);
      if (isNaN(value)) {
        value = 0;
        break;
      }
      value = Math.min(value, 10);
  }
  return value;
}
console.log(["A", "K", "7", "x"].map(points).join(" "));
''',
     [],
     ['11 10 7 0']),

    ('a linked stack of nodes', 'java', '''
public class Stack {
    static class Node {
        int value;
        Node next;
        Node(int value, Node next) {
            this.value = value;
            this.next = next;
        }
    }

    private Node top;
    private int size;

    void push(int v) {
        top = new Node(v, top);
        size++;
    }

    int pop() {
        int v = top.value;
        top = top.next;
        size--;
        return v;
    }

    boolean isEmpty() {
        return top == null;
    }

    public static void main(String[] args) {
        Stack s = new Stack();
        for (int i = 1; i <= 4; i++) {
            s.push(i * 10);
        }
        System.out.println("size " + s.size);
        while (!s.isEmpty()) {
            System.out.print(s.pop() + " ");
        }
        System.out.println();
    }
}
''',
     [],
     ['size 4', '40 30 20 10 ']),

    ('students sorted with a comparator', 'java', '''
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Roster {
    static class Student {
        String name;
        int score;
        Student(String name, int score) {
            this.name = name;
            this.score = score;
        }
    }

    public static void main(String[] args) {
        List<Student> list = new ArrayList<>();
        list.add(new Student("Zoe", 81));
        list.add(new Student("Ian", 95));
        list.add(new Student("Mia", 67));
        list.sort((a, b) -> b.score - a.score);
        for (Student s : list) {
            System.out.println(s.name + " " + s.score);
        }
        list.sort(Comparator.comparing(s -> s.name));
        System.out.println(list.get(0).name);
        int total = 0;
        for (Student s : list) total += s.score;
        System.out.printf("Average %.1f%n", total / (double) list.size());
    }
}
''',
     [],
     ['Ian 95', 'Zoe 81', 'Mia 67', 'Ian', 'Average 81.0']),

    ('a tic-tac-toe board', 'java', '''
public class Board {
    static char[][] grid = new char[3][3];

    static boolean wins(char p) {
        for (int i = 0; i < 3; i++) {
            if (grid[i][0] == p && grid[i][1] == p && grid[i][2] == p) return true;
            if (grid[0][i] == p && grid[1][i] == p && grid[2][i] == p) return true;
        }
        return (grid[0][0] == p && grid[1][1] == p && grid[2][2] == p)
            || (grid[0][2] == p && grid[1][1] == p && grid[2][0] == p);
    }

    public static void main(String[] args) {
        for (int r = 0; r < 3; r++)
            for (int c = 0; c < 3; c++)
                grid[r][c] = '.';
        int[][] moves = {{0, 0}, {1, 1}, {0, 1}, {2, 2}, {0, 2}};
        char player = 'X';
        for (int[] m : moves) {
            grid[m[0]][m[1]] = player;
            if (wins(player)) {
                System.out.println(player + " wins");
                break;
            }
            player = player == 'X' ? 'O' : 'X';
        }
        for (char[] row : grid) {
            System.out.println(new String(row));
        }
    }
}
''',
     [],
     ['X wins', 'XXX', '.O.', '..O']),

    ('recursion over a string', 'java', '''
public class Recur {
    static boolean palindrome(String s) {
        if (s.length() <= 1) return true;
        if (s.charAt(0) != s.charAt(s.length() - 1)) return false;
        return palindrome(s.substring(1, s.length() - 1));
    }

    static int digitSum(int n) {
        return n == 0 ? 0 : n % 10 + digitSum(n / 10);
    }

    public static void main(String[] args) {
        System.out.println(palindrome("racecar") + " " + palindrome("rocket"));
        System.out.println(digitSum(98765));
        StringBuilder sb = new StringBuilder("abc");
        sb.reverse();
        sb.append("!");
        System.out.println(sb);
    }
}
''',
     [],
     ['True False', '35', 'cba!']),

    ('an enum and a switch on it', 'java', '''
public class Lights {
    enum Light { RED, AMBER, GREEN }

    static Light next(Light l) {
        switch (l) {
            case RED: return Light.GREEN;
            case GREEN: return Light.AMBER;
            default: return Light.RED;
        }
    }

    public static void main(String[] args) {
        Light l = Light.RED;
        for (int i = 0; i < 4; i++) {
            System.out.println(l);
            l = next(l);
        }
    }
}
''',
     [],
     ['RED', 'GREEN', 'AMBER', 'RED']),

    ('a counter shared by every object', 'java', '''
public class Ticket {
    private static int issued = 0;
    private final int number;

    public Ticket() {
        issued++;
        number = issued;
    }

    public int getNumber() { return number; }

    public static void main(String[] args) {
        Ticket a = new Ticket();
        Ticket b = new Ticket();
        Ticket c = new Ticket();
        System.out.println(a.getNumber() + " " + c.getNumber() + " of " + issued);
    }
}
''',
     [],
     ['1 3 of 3']),

    ('a queue of customers', 'csharp', '''
using System;
using System.Collections.Generic;

class Shop
{
    static void Main()
    {
        Queue<string> line = new Queue<string>();
        line.Enqueue("Ann");
        line.Enqueue("Bo");
        line.Enqueue("Cy");
        while (line.Count > 0)
        {
            string who = line.Dequeue();
            Console.WriteLine("Serving " + who);
        }
        Stack<int> plates = new Stack<int>();
        plates.Push(1);
        plates.Push(2);
        Console.WriteLine(plates.Pop() + " " + plates.Count);
    }
}
''',
     [],
     ['Serving Ann', 'Serving Bo', 'Serving Cy', '2 1']),

    ('a class with a static count and a method that finds the biggest', 'csharp', '''
using System;
using System.Collections.Generic;

class Box
{
    public static int Made = 0;
    public int Width;
    public int Height;

    public Box(int w, int h)
    {
        Width = w;
        Height = h;
        Made++;
    }

    public int Area()
    {
        return Width * Height;
    }
}

class Program
{
    static Box Biggest(List<Box> boxes)
    {
        Box best = boxes[0];
        foreach (Box b in boxes)
        {
            if (b.Area() > best.Area())
            {
                best = b;
            }
        }
        return best;
    }

    static void Main()
    {
        List<Box> boxes = new List<Box>();
        boxes.Add(new Box(2, 3));
        boxes.Add(new Box(5, 1));
        boxes.Add(new Box(4, 4));
        Box big = Biggest(boxes);
        Console.WriteLine(big.Width + "x" + big.Height + " = " + big.Area());
        Console.WriteLine(Box.Made + " boxes made");
    }
}
''',
     [],
     ['4x4 = 16', '3 boxes made']),

    ('a do-while reading until a zero', 'csharp', '''
using System;

class Sum
{
    static void Main()
    {
        int total = 0, n;
        do
        {
            Console.Write("Number (0 to stop): ");
            n = int.Parse(Console.ReadLine());
            total += n;
        } while (n != 0);
        Console.WriteLine("Total: {0}", total);
        Console.WriteLine("Mean-ish: {0:F1}", total / 3.0);
    }
}
''',
     ['4', '5', '0'],
     ['Number (0 to stop): ', 'Number (0 to stop): ', 'Number (0 to stop): ', 'Total: 9', 'Mean-ish: 3.0']),

    ('recursion and ref', 'csharp', '''
using System;

class Maths
{
    static int Gcd(int a, int b)
    {
        return b == 0 ? a : Gcd(b, a % b);
    }

    static void Swap(ref int a, ref int b)
    {
        int t = a;
        a = b;
        b = t;
    }

    static void Main()
    {
        Console.WriteLine(Gcd(48, 18));
        int x = 3, y = 9;
        Swap(ref x, ref y);
        Console.WriteLine(x + " " + y);
        int[] nums = { 3, 8, 1 };
        Array.Sort(nums);
        Console.WriteLine(nums[0] + "," + nums[2] + " of " + nums.Length);
    }
}
''',
     [],
     ['6', '9 3', '1,8 of 3']),

    ('a linked list made with new', 'cpp', '''
#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;
    Node(int v) : value(v), next(nullptr) {}
};

int main() {
    Node* head = nullptr;
    for (int i = 3; i >= 1; i--) {
        Node* n = new Node(i);
        n->next = head;
        head = n;
    }
    int sum = 0;
    for (Node* cur = head; cur != nullptr; cur = cur->next) {
        cout << cur->value << " ";
        sum += cur->value;
    }
    cout << endl << "sum " << sum << endl;
    return 0;
}
''',
     [],
     ['1 2 3 ', 'sum 6']),

    ('a class with an array inside', 'cpp', '''
#include <iostream>
#include <string>
using namespace std;

class Scores {
    int marks[5];
    int count;
public:
    Scores() { count = 0; }
    void add(int m) {
        if (count < 5) {
            marks[count] = m;
            count++;
        }
    }
    double average() {
        int total = 0;
        for (int i = 0; i < count; i++) total += marks[i];
        return count ? (double)total / count : 0;
    }
};

int main() {
    Scores s;
    s.add(70);
    s.add(80);
    s.add(95);
    cout << s.average() << endl;
    return 0;
}
''',
     [],
     ['81.6667']),

    ('reading numbers until zero, with a while and cin', 'cpp', '''
#include <iostream>
using namespace std;

int main() {
    int n, count = 0, biggest = 0;
    cout << "Numbers, 0 to end: ";
    cin >> n;
    while (n != 0) {
        count++;
        if (n > biggest) biggest = n;
        cin >> n;
    }
    cout << count << " numbers, biggest " << biggest << endl;
    return 0;
}
''',
     ['4', '9', '2', '0'],
     ['Numbers, 0 to end: ', '3 numbers, biggest 9']),

    ('a template function and a pair', 'cpp', '''
#include <iostream>
#include <utility>
#include <string>
using namespace std;

template <typename T>
T biggest(T a, T b) {
    return a > b ? a : b;
}

int main() {
    cout << biggest(3, 7) << " " << biggest<string>("pear", "apple") << endl;
    pair<string, int> p = make_pair("age", 42);
    cout << p.first << "=" << p.second << endl;
    return 0;
}
''',
     [],
     ['7 pear', 'age=42']),

]
