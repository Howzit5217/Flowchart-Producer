"""Still more programs written by hand: what each language has of its
own -- string methods and formatting, sets and tuples, closures that
keep a count, getters and properties, errors thrown in one function and
caught in another, TreeMaps and queues, LINQ, cout's setw and
setprecision, structs made from braces.

Each is read with no language handed over, run by the runner with the
answers typed in, and has to print `want`: what the program itself
prints, found by running it (Python, JavaScript, Java, and C# inside
PowerShell) or worked out by hand (C++), in the runner's way of writing
it: True for true, [1, 2] for [ 1, 2 ], 100 for 100.0.

Same shape as coded.py: (what it is about, language, the code, what
gets typed, what it prints).
"""

# flake8: noqa
CODED = [
    ('py3 string methods', 'python', '''
s = "  Hello, World  "
t = s.strip()
print(t)
print(t.lower(), t.upper())
print(t.replace("World", "There"))
print(t.find("o"), t.find("z"), t.count("l"))
print(t.startswith("Hell"), t.endswith("!"))
parts = t.split(", ")
print(parts, len(parts))
print("-".join(parts))
print(t[::-1])
print(t[1:4], t[-5:], t[:5])
print("World" in t, "world" in t)
print("42".isdigit(), "4a".isdigit())
print(t.index("W"))
''',
     [],
     ['Hello, World', 'hello, world HELLO, WORLD', 'Hello, There', '4 -1 3', 'True False', "['Hello', 'World'] 2", 'Hello-World', 'dlroW ,olleH', 'ell World Hello', 'True False', 'True False', '7']),

    ('py3 formatting numbers', 'python', '''
x = 3.14159
n = 42
name = "Ada"
print(f"{x:.2f}")
print(f"{n:5d}|")
print(f"{name:<8}|")
print(f"{name:>8}|")
print(f"{x:8.3f}|")
print("%d items" % n)
print("%.1f%%" % 12.345)
print("{} and {}".format("tea", "cake"))
print(str(3.0), round(2.567, 2), round(7.5))
print(int("42") + 1, float("3.5") * 2)
print(10 / 4, 10 // 4, 10 % 4, -7 // 2, -7 % 2, 2 ** 10)
''',
     [],
     ['3.14', '   42|', 'Ada     |', '     Ada|', '   3.142|', '42 items', '12.3%', 'tea and cake', '3 2.57 8', '43 7', '2.5 2 2 -4 1 1024']),

    ('py3 guess the number', 'python', '''
secret = 37
tries = 0
while True:
    guess = int(input("Guess: "))
    tries += 1
    if guess < secret:
        print("Higher")
    elif guess > secret:
        print("Lower")
    else:
        print("Got it in", tries, "tries")
        break
''',
     ['50', '25', '37'],
     ['Guess: ', 'Lower', 'Guess: ', 'Higher', 'Guess: ', 'Got it in 3 tries']),

    ('py3 matrix transpose and sums', 'python', '''
m = [[1, 2, 3], [4, 5, 6]]
t = [list(row) for row in zip(*m)]
print(t)
rows = [sum(r) for r in m]
cols = [sum(c) for c in t]
print(rows, cols)
total = 0
for r in m:
    for v in r:
        total += v
print("total", total)
identity = [[1 if i == j else 0 for j in range(3)] for i in range(3)]
for row in identity:
    print(" ".join(str(v) for v in row))
''',
     [],
     ['[[1, 4], [2, 5], [3, 6]]', '[6, 15] [5, 7, 9]', 'total 21', '1 0 0', '0 1 0', '0 0 1']),

    ('py3 grouping words', 'python', '''
words = ["apple", "avocado", "banana", "blueberry", "cherry", "apricot"]
groups = {}
for w in words:
    key = w[0]
    if key not in groups:
        groups[key] = []
    groups[key].append(w)
for key in sorted(groups):
    print(key, groups[key])
for key, items in groups.items():
    print(key, len(items))
longest = max(words, key=len)
print("longest:", longest)
''',
     [],
     ["a ['apple', 'avocado', 'apricot']", "b ['banana', 'blueberry']", "c ['cherry']", 'a 3', 'b 2', 'c 1', 'longest: blueberry']),

    ('py3 sets', 'python', '''
a = {1, 2, 3, 4}
b = {3, 4, 5}
print(sorted(a | b))
print(sorted(a & b))
print(sorted(a - b))
a.add(10)
a.discard(1)
print(sorted(a), len(a))
print(3 in a, 1 in a)
seen = set()
for ch in "mississippi":
    seen.add(ch)
print("".join(sorted(seen)))
''',
     [],
     ['[1, 2, 3, 4, 5]', '[3, 4]', '[1, 2]', '[2, 3, 4, 10] 4', 'True False', 'imps']),

    ('py3 tuples and many returns', 'python', '''
def min_max(xs):
    return min(xs), max(xs)

def divide(a, b):
    return a // b, a % b

lo, hi = min_max([7, 3, 9, 1])
print(lo, hi)
q, r = divide(17, 5)
print(q, r)
a, b = 1, 2
a, b = b, a
print(a, b)
point = (3, 4)
x, y = point
print((x * x + y * y) ** 0.5)
''',
     [],
     ['1 9', '3 2', '2 1', '5']),

    ('py3 recursion', 'python', '''
def gcd(a, b):
    if b == 0:
        return a
    return gcd(b, a % b)

def fact(n):
    return 1 if n <= 1 else n * fact(n - 1)

def search(xs, target, lo, hi):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if xs[mid] == target:
        return mid
    if xs[mid] < target:
        return search(xs, target, mid + 1, hi)
    return search(xs, target, lo, mid - 1)

def hanoi(n):
    if n == 0:
        return 0
    return 2 * hanoi(n - 1) + 1

print(gcd(48, 18), fact(6))
nums = [1, 3, 5, 7, 9, 11]
print(search(nums, 7, 0, len(nums) - 1), search(nums, 4, 0, len(nums) - 1))
print(hanoi(5))
''',
     [],
     ['6 720', '3 -1', '31']),

    ('py3 class variable and str', 'python', '''
class Counter:
    made = 0

    def __init__(self, name):
        self.name = name
        self.value = 0
        Counter.made += 1

    def tick(self, by=1):
        self.value += by
        return self

    def __str__(self):
        return self.name + "=" + str(self.value)

a = Counter("a")
b = Counter("b")
a.tick().tick(5)
b.tick(2)
print(a, b)
print(str(a))
print("made", Counter.made)
''',
     [],
     ['a=6 b=2', 'a=6', 'made 2']),

    ('py3 inheritance and super', 'python', '''
class Employee:
    def __init__(self, name, pay):
        self.name = name
        self.pay = pay

    def yearly(self):
        return self.pay * 12

    def describe(self):
        return self.name + " earns " + str(self.yearly())

class Manager(Employee):
    def __init__(self, name, pay, bonus):
        super().__init__(name, pay)
        self.bonus = bonus

    def yearly(self):
        return super().yearly() + self.bonus

staff = [Employee("Ann", 1000), Manager("Bo", 2000, 500)]
for s in staff:
    print(s.describe())
print(sum(s.yearly() for s in staff))
''',
     [],
     ['Ann earns 12000', 'Bo earns 24500', '36500']),

    ('py3 exceptions', 'python', '''
def parse(text):
    try:
        n = int(text)
    except ValueError:
        print("not a number:", text)
        return None
    else:
        print("read", n)
        return n
    finally:
        print("done with", text)

parse("12")
parse("abc")
try:
    x = 10 / 0
except ZeroDivisionError:
    print("cannot divide by zero")
values = [parse(t) for t in ["1", "x", "3"]]
print([v for v in values if v is not None])
''',
     [],
     ['read 12', 'done with 12', 'not a number: abc', 'done with abc', 'cannot divide by zero', 'read 1', 'done with 1', 'not a number: x', 'done with x', 'read 3', 'done with 3', '[1, 3]']),

    ('py3 list methods', 'python', '''
xs = [5, 3, 8]
xs.append(1)
xs.insert(0, 9)
print(xs)
xs.remove(3)
last = xs.pop()
first = xs.pop(0)
print(xs, last, first)
xs.extend([4, 4, 2])
print(xs.index(4), xs.count(4))
xs.sort()
print(xs)
xs.sort(reverse=True)
print(xs)
xs.reverse()
print(xs)
del xs[0]
print(xs, len(xs))
ys = xs[:]
ys[0] = 100
print(xs[0], ys[0])
''',
     [],
     ['[9, 5, 3, 8, 1]', '[5, 8] 1 9', '2 2', '[2, 4, 4, 5, 8]', '[8, 5, 4, 4, 2]', '[2, 4, 4, 5, 8]', '[4, 4, 5, 8] 4', '4 100']),

    ('py3 enumerate zip any all', 'python', '''
names = ["Ann", "Bob", "Cy"]
ages = [31, 25, 40]
for i, name in enumerate(names, start=1):
    print(i, name)
for name, age in zip(names, ages):
    print(name, "is", age)
print(any(a > 35 for a in ages), all(a > 20 for a in ages))
oldest = max(zip(names, ages), key=lambda p: p[1])
print(oldest[0])
print(sum(a for a in ages if a < 35))
print(sorted(names, key=lambda n: -len(n)))
''',
     [],
     ['1 Ann', '2 Bob', '3 Cy', 'Ann is 31', 'Bob is 25', 'Cy is 40', 'True True', 'Cy', '56', "['Ann', 'Bob', 'Cy']"]),

    ('py3 caesar cipher', 'python', '''
def shift(text, k):
    out = ""
    for ch in text:
        if ch.isalpha():
            base = ord("A") if ch.isupper() else ord("a")
            out += chr((ord(ch) - base + k) % 26 + base)
        else:
            out += ch
    return out

secret = shift("Hello, World!", 3)
print(secret)
print(shift(secret, -3))
print(ord("A"), chr(98))
''',
     [],
     ['Khoor, Zruog!', 'Hello, World!', '65 b']),

    ('py3 loops with break continue else', 'python', '''
for n in range(2, 20):
    for d in range(2, n):
        if n % d == 0:
            break
    else:
        print(n, end=" ")
print()
total = 0
for i in range(10):
    if i % 3 == 0:
        continue
    total += i
print(total)
i = 10
while i > 0:
    i -= 3
print(i)
''',
     [],
     ['2 3 5 7 11 13 17 19 ', '27', '-2']),

    ('py3 globals defaults keywords', 'python', '''
count = 0

def bump(by=1):
    global count
    count += by

def greet(name, greeting="Hello", punct="!"):
    return greeting + ", " + name + punct

bump()
bump(5)
print(count)
print(greet("Ann"))
print(greet("Bob", "Hi"))
print(greet("Cy", punct="?"))
print(greet(greeting="Yo", name="Dee"))
''',
     [],
     ['6', 'Hello, Ann!', 'Hi, Bob!', 'Hello, Cy?', 'Yo, Dee!']),

    ('py3 game of life step', 'python', '''
grid = [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
]

def neighbours(g, r, c):
    n = 0
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            rr, cc = r + dr, c + dc
            if 0 <= rr < len(g) and 0 <= cc < len(g[0]):
                n += g[rr][cc]
    return n

def step(g):
    new = []
    for r in range(len(g)):
        row = []
        for c in range(len(g[0])):
            n = neighbours(g, r, c)
            alive = g[r][c] == 1
            row.append(1 if (alive and n in (2, 3)) or (not alive and n == 3) else 0)
        new.append(row)
    return new

for row in step(grid):
    print("".join("#" if v else "." for v in row))
''',
     [],
     ['...', '###', '...']),

    ('py3 comprehensions', 'python', '''
squares = {n: n * n for n in range(1, 6)}
print(squares)
evens = [n for n in range(20) if n % 2 == 0 and n % 3 != 0]
print(evens)
pairs = [(a, b) for a in range(1, 4) for b in range(a, 4)]
print(pairs)
words = ["Sun", "moon", "Star"]
lower = {w.lower() for w in words}
print(sorted(lower))
lengths = dict(zip(words, map(len, words)))
print(lengths)
''',
     [],
     ['{1: 1, 2: 4, 3: 9, 4: 16, 5: 25}', '[2, 4, 8, 10, 14, 16]', '[(1, 1), (1, 2), (1, 3), (2, 2), (2, 3), (3, 3)]', "['moon', 'star', 'sun']", "{'Sun': 3, 'moon': 4, 'Star': 4}"]),

    ('py3 bracket matcher', 'python', '''
def balanced(text):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in text:
        if ch in "([{":
            stack.append(ch)
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False
    return len(stack) == 0

for t in ["(a[b]{c})", "(]", "((", "{[()()]}", ""]:
    print(repr(t), balanced(t))
''',
     [],
     ["'(a[b]{c})' True", "'(]' False", "'((' False", "'{[()()]}' True", "'' True"]),

    ('py3 table layout', 'python', '''
rows = [("Tea", 2.5, 3), ("Cake", 4.25, 1), ("Jam", 3.0, 2)]
print("Item".ljust(6) + "Price".rjust(7) + "Qty".rjust(5))
total = 0
for name, price, qty in rows:
    print(name.ljust(6) + ("%.2f" % price).rjust(7) + str(qty).rjust(5))
    total += price * qty
print("-" * 18)
print("Total".ljust(6) + ("%.2f" % total).rjust(12))
''',
     [],
     ['Item    Price  Qty', 'Tea      2.50    3', 'Cake     4.25    1', 'Jam      3.00    2', '------------------', 'Total        17.75']),

    ('js3 string methods', 'javascript', '''
const s = "  Hello, World  ";
const t = s.trim();
console.log(t.toUpperCase(), t.toLowerCase());
console.log(t.includes("World"), t.indexOf("o"), t.lastIndexOf("o"));
console.log(t.slice(0, 5), t.slice(-5), t.substring(7, 12));
console.log(t.split(", ").join(" | "));
console.log(t.replace("World", "There"));
console.log("ab".repeat(3), "7".padStart(3, "0"), "x".padEnd(4, ".") + "|");
console.log(t.charAt(1), t.charCodeAt(0), String.fromCharCode(72, 105));
console.log(t.startsWith("Hell"), t.endsWith("d"), t.length);
''',
     [],
     ['HELLO, WORLD hello, world', 'True 4 8', 'Hello World World', 'Hello | World', 'Hello, There', 'ababab 007 x...|', 'e 72 Hi', 'True True 12']),

    ('js3 array methods', 'javascript', '''
const xs = [5, 3, 8];
xs.push(1);
xs.unshift(9);
console.log(xs.join(","));
const last = xs.pop();
const first = xs.shift();
console.log(last, first, xs.join(","));
xs.splice(1, 1);
console.log(xs.join(","));
xs.splice(1, 0, 7, 6);
console.log(xs.join(","));
console.log(xs.indexOf(7), xs.includes(3), xs.slice(1, 3).join(","));
console.log(xs.find((x) => x > 6), xs.findIndex((x) => x > 6));
console.log(xs.some((x) => x > 7), xs.every((x) => x > 0));
const sorted = [...xs].sort((a, b) => a - b);
console.log(sorted.join(","), xs.join(","));
console.log([1, 2].concat([3, 4]).reverse().join(","));
xs.forEach((x, i) => console.log(i + ": " + x));
''',
     [],
     ['9,5,3,8,1', '1 9 5,3,8', '5,8', '5,7,6,8', '1 False 7,6', '7 1', 'True True', '5,6,7,8 5,7,6,8', '4,3,2,1', '0: 5', '1: 7', '2: 6', '3: 8']),

    ('js3 objects', 'javascript', '''
const book = { title: "Dune", year: 1965, tags: ["sf", "classic"] };
console.log(book.title + " (" + book.year + ")");
book.pages = 412;
book.year += 1;
console.log(Object.keys(book).join(", "));
console.log(book.tags.length, book["pages"]);
for (const key in book) {
  if (key !== "tags") {
    console.log(key + " = " + book[key]);
  }
}
const counts = { a: 0, b: 0 };
for (const ch of "abbab") {
  counts[ch]++;
}
console.log(counts.a, counts.b);
''',
     [],
     ['Dune (1965)', 'title, year, tags, pages', '2 412', 'title = Dune', 'year = 1966', 'pages = 412', '2 3']),

    ('js3 class with static and getter', 'javascript', '''
class Temperature {
  static made = 0;
  constructor(celsius) {
    this.celsius = celsius;
    Temperature.made++;
  }
  get fahrenheit() {
    return this.celsius * 9 / 5 + 32;
  }
  static fromF(f) {
    return new Temperature((f - 32) * 5 / 9);
  }
  describe() {
    return this.celsius.toFixed(1) + "C is " + this.fahrenheit.toFixed(1) + "F";
  }
}
const a = new Temperature(100);
const b = Temperature.fromF(32);
console.log(a.describe());
console.log(b.describe());
console.log(Temperature.made);
''',
     [],
     ['100.0C is 212.0F', '0.0C is 32.0F', '2']),

    ('js3 closures counter', 'javascript', '''
function makeCounter(start) {
  let count = start;
  return function () {
    count += 1;
    return count;
  };
}
const next = makeCounter(10);
console.log(next());
console.log(next());
const other = makeCounter(0);
console.log(other(), next());
''',
     [],
     ['11', '12', '1 13']),

    ('js3 map and set', 'javascript', '''
const ages = new Map();
ages.set("Ann", 30);
ages.set("Bob", 25);
ages.set("Ann", 31);
console.log(ages.size, ages.get("Ann"), ages.has("Cy"));
ages.delete("Bob");
for (const [name, age] of ages) {
  console.log(name, age);
}
const seen = new Set([3, 1, 3, 2, 1]);
seen.add(5);
console.log(seen.size, seen.has(2), [...seen].join(" "));
''',
     [],
     ['2 31 False', 'Ann 31', '4 True 3 1 2 5']),

    ('js3 loops and switch', 'javascript', '''
let n = 0;
do {
  n += 3;
} while (n < 10);
console.log(n);
for (let i = 0; i < 5; i++) {
  switch (i) {
    case 0:
      console.log("zero");
      break;
    case 1:
    case 2:
      console.log("small", i);
      break;
    default:
      console.log("big", i);
  }
}
let k = 20;
while (true) {
  k = Math.floor(k / 2);
  if (k < 3) break;
}
console.log(k);
''',
     [],
     ['12', 'zero', 'small 1', 'small 2', 'big 3', 'big 4', '2']),

    ('js3 template literals', 'javascript', '''
const items = [["tea", 2.5, 2], ["cake", 3.75, 1]];
let total = 0;
for (const [name, price, qty] of items) {
  const cost = price * qty;
  total += cost;
  console.log(`${name.padEnd(6)}${qty} x ${price.toFixed(2)} = ${cost.toFixed(2)}`);
}
console.log(`Total: ${total.toFixed(2)} (${items.length} lines)`);
console.log(`${1 + 2} ${total > 5 ? "big" : "small"}`);
''',
     [],
     ['tea   2 x 2.50 = 5.00', 'cake  1 x 3.75 = 3.75', 'Total: 8.75 (2 lines)', '3 big']),

    ('js3 recursion flatten', 'javascript', '''
function flatten(xs) {
  let out = [];
  for (const x of xs) {
    if (Array.isArray(x)) {
      out = out.concat(flatten(x));
    } else {
      out.push(x);
    }
  }
  return out;
}
function sumDigits(n) {
  return n < 10 ? n : (n % 10) + sumDigits(Math.floor(n / 10));
}
console.log(flatten([1, [2, [3, 4]], 5]).join(" "));
console.log(sumDigits(98765));
''',
     [],
     ['1 2 3 4 5', '35']),

    ('js3 destructuring and spread', 'javascript', '''
const [a, b = 5, ...rest] = [1, undefined, 3, 4];
console.log(a, b, rest.join(","));
const { x, y = 0 } = { x: 7 };
console.log(x, y);
function biggest(...nums) {
  return Math.max(...nums);
}
console.log(biggest(3, 9, 4), Math.min(...[8, 2, 6]));
const merged = [...[1, 2], ...[3]];
console.log(merged.length);
''',
     [],
     ['1 5 3,4', '7 0', '9 2', '3']),

    ('js3 try catch throw', 'javascript', '''
function safeDivide(a, b) {
  if (b === 0) {
    throw new Error("cannot divide by zero");
  }
  return a / b;
}
for (const b of [2, 0]) {
  try {
    console.log(safeDivide(10, b));
  } catch (e) {
    console.log("error:", e.message);
  } finally {
    console.log("tried", b);
  }
}
''',
     [],
     ['5', 'tried 2', 'error: cannot divide by zero', 'tried 0']),

    ('js3 sort objects and reduce', 'javascript', '''
const people = [
  { name: "Cy", age: 40 },
  { name: "Ann", age: 31 },
  { name: "Bob", age: 25 },
];
people.sort((p, q) => p.age - q.age);
console.log(people.map((p) => p.name).join(" "));
people.sort((p, q) => p.name.localeCompare(q.name));
console.log(people.map((p) => p.name).join(" "));
const total = people.reduce((sum, p) => sum + p.age, 0);
console.log(total, (total / people.length).toFixed(1));
const byInitial = people.reduce((acc, p) => {
  acc[p.name[0]] = p.age;
  return acc;
}, {});
console.log(byInitial["B"]);
''',
     [],
     ['Bob Ann Cy', 'Ann Bob Cy', '96 32.0', '25']),

    ('js3 numbers', 'javascript', '''
console.log(parseInt("42px"), parseFloat("3.5kg"), Number("12"));
console.log(isNaN(Number("abc")), (7.456).toFixed(2));
console.log(Math.round(2.5), Math.floor(-2.5), Math.ceil(2.1), Math.abs(-4));
console.log(Math.max(3, 8, 1), Math.pow(2, 8), Math.sqrt(49));
console.log(7 % 3, -7 % 3, 7 / 2, Math.trunc(-7 / 2));
console.log(0.1 + 0.2 === 0.3, (0.1 + 0.2).toFixed(2));
''',
     [],
     ['42 3.5 12', 'True 7.46', '3 -3 3 4', '8 256 7', '1 -1 3.5 -3', 'False 0.30']),

    ('js3 higher order functions', 'javascript', '''
function applyTwice(f, x) {
  return f(f(x));
}
const double = (n) => n * 2;
const add3 = (n) => n + 3;
console.log(applyTwice(double, 5), applyTwice(add3, 1));
function compose(f, g) {
  return (x) => f(g(x));
}
const both = compose(double, add3);
console.log(both(4));
const squares = [1, 2, 3].map((n) => n * n);
console.log(squares.join(","));
''',
     [],
     ['20 7', '14', '1,4,9']),

    ('js3 counting letters', 'javascript', '''
const text = "The quick brown fox jumps over the lazy dog";
const counts = {};
for (const ch of text.toLowerCase()) {
  if (ch >= "a" && ch <= "z") {
    counts[ch] = (counts[ch] || 0) + 1;
  }
}
const letters = Object.keys(counts).sort();
console.log(letters.length);
let best = letters[0];
for (const l of letters) {
  if (counts[l] > counts[best]) best = l;
}
console.log(best, counts[best]);
const vowels = [...text].filter((c) => "aeiou".includes(c)).length;
console.log(vowels);
''',
     [],
     ['26', 'o 4', '11']),

    ('java3 string methods', 'java', '''
public class Strings {
    public static void main(String[] args) {
        String s = "  Hello, World  ";
        String t = s.trim();
        System.out.println(t.length() + " " + t.charAt(1) + " " + t.substring(7) + " " + t.substring(0, 5));
        System.out.println(t.indexOf("o") + " " + t.lastIndexOf("o") + " " + t.indexOf("z"));
        System.out.println(t.toUpperCase() + " " + t.toLowerCase());
        System.out.println(t.contains("World") + " " + t.startsWith("He") + " " + t.endsWith("x"));
        System.out.println(t.replace("l", "L"));
        String[] parts = t.split(", ");
        System.out.println(parts.length + " " + parts[1]);
        System.out.println(String.join("-", parts));
        System.out.println("apple".compareTo("banana") < 0);
        System.out.println("abc".equals("abc") + " " + "ABC".equalsIgnoreCase("abc"));
        StringBuilder sb = new StringBuilder("stressed");
        System.out.println(sb.reverse().toString());
        System.out.println(String.format("%5.2f|%-6s|%03d", 3.14159, "ab", 7));
    }
}
''',
     [],
     ['12 e World Hello', '4 8 -1', 'HELLO, WORLD hello, world', 'True True False', 'HeLLo, WorLd', '2 World', 'Hello-World', 'True', 'True True', 'desserts', ' 3.14|ab    |007']),

    ('java3 arrays', 'java', '''
import java.util.Arrays;

public class ArraysDemo {
    public static void main(String[] args) {
        int[] nums = {5, 2, 9, 1, 7};
        int sum = 0, max = nums[0];
        for (int n : nums) {
            sum += n;
            if (n > max) max = n;
        }
        System.out.println(sum + " " + max + " " + (double) sum / nums.length);
        Arrays.sort(nums);
        System.out.println(Arrays.toString(nums));
        int[][] grid = new int[3][4];
        for (int r = 0; r < 3; r++)
            for (int c = 0; c < 4; c++)
                grid[r][c] = r * c;
        System.out.println(grid[2][3] + " " + grid.length + " " + grid[0].length);
        String[] names = new String[2];
        names[0] = "Ann";
        names[1] = "Bob";
        System.out.println(String.join(",", names));
    }
}
''',
     [],
     ['24 9 4.8', '[1, 2, 5, 7, 9]', '6 3 4', 'Ann,Bob']),

    ('java3 arraylist', 'java', '''
import java.util.*;

public class ListDemo {
    public static void main(String[] args) {
        List<Integer> xs = new ArrayList<>();
        xs.add(4); xs.add(8); xs.add(15); xs.add(16);
        xs.add(0, 1);
        System.out.println(xs + " " + xs.size());
        xs.set(1, 5);
        xs.remove(Integer.valueOf(15));
        xs.remove(0);
        System.out.println(xs + " " + xs.contains(8) + " " + xs.indexOf(16));
        Collections.sort(xs, Collections.reverseOrder());
        System.out.println(xs);
        Collections.reverse(xs);
        System.out.println(xs + " " + Collections.max(xs) + " " + Collections.min(xs));
        System.out.println(xs.isEmpty() + " " + xs.get(xs.size() - 1));
        List<String> words = new ArrayList<>(Arrays.asList("pear", "fig", "apple"));
        Collections.sort(words);
        System.out.println(words);
    }
}
''',
     [],
     ['[1, 4, 8, 15, 16] 5', '[5, 8, 16] True 2', '[16, 8, 5]', '[5, 8, 16] 16 5', 'False 16', "['apple', 'fig', 'pear']"]),

    ('java3 maps', 'java', '''
import java.util.*;

public class MapDemo {
    public static void main(String[] args) {
        Map<String, Integer> stock = new TreeMap<>();
        stock.put("pear", 3);
        stock.put("apple", 5);
        stock.put("fig", 0);
        stock.put("apple", stock.get("apple") + 2);
        for (String key : stock.keySet()) {
            System.out.println(key + ": " + stock.get(key));
        }
        System.out.println(stock.getOrDefault("kiwi", -1) + " " + stock.containsKey("fig"));
        int total = 0;
        for (Map.Entry<String, Integer> e : stock.entrySet()) {
            total += e.getValue();
        }
        System.out.println("total " + total);
        stock.remove("fig");
        System.out.println(stock.size());
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : "banana".toCharArray()) {
            counts.put(c, counts.getOrDefault(c, 0) + 1);
        }
        System.out.println(counts.get('a') + " " + counts.get('n'));
    }
}
''',
     [],
     ['apple: 7', 'fig: 0', 'pear: 3', '-1 True', 'total 10', '2', '3 2']),

    ('java3 static counter and equals', 'java', '''
public class Points {
    static class Point {
        static int made = 0;
        int x, y;
        Point(int x, int y) { this.x = x; this.y = y; made++; }
        double distance(Point o) {
            int dx = x - o.x, dy = y - o.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
        boolean same(Point o) { return x == o.x && y == o.y; }
        public String toString() { return "(" + x + ", " + y + ")"; }
    }

    public static void main(String[] args) {
        Point a = new Point(0, 0);
        Point b = new Point(3, 4);
        System.out.println(a + " to " + b + " is " + a.distance(b));
        System.out.println(a.same(new Point(0, 0)) + " " + Point.made);
    }
}
''',
     [],
     ['(0, 0) to (3, 4) is 5', 'True 3']),

    ('java3 interface shapes', 'java', '''
import java.util.*;

interface Shape {
    double area();
    String name();
}

class Circle implements Shape {
    double r;
    Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
    public String name() { return "circle"; }
}

class Square implements Shape {
    double s;
    Square(double s) { this.s = s; }
    public double area() { return s * s; }
    public String name() { return "square"; }
}

public class Shapes3 {
    public static void main(String[] args) {
        List<Shape> shapes = new ArrayList<>();
        shapes.add(new Circle(1));
        shapes.add(new Square(2));
        double total = 0;
        for (Shape s : shapes) {
            System.out.printf("%s %.2f%n", s.name(), s.area());
            total += s.area();
        }
        System.out.printf("total %.3f%n", total);
    }
}
''',
     [],
     ['circle 3.14', 'square 4.00', 'total 7.142']),

    ('java3 switch', 'java', '''
public class Days {
    static String kind(int day) {
        switch (day) {
            case 6:
            case 7:
                return "weekend";
            default:
                return "weekday";
        }
    }

    public static void main(String[] args) {
        for (int d = 5; d <= 7; d++) {
            System.out.println(d + " " + kind(d));
        }
        String cmd = "stop";
        switch (cmd) {
            case "go":
                System.out.println("going");
                break;
            case "stop":
                System.out.println("stopping");
                break;
            default:
                System.out.println("?");
        }
    }
}
''',
     [],
     ['5 weekday', '6 weekend', '7 weekend', 'stopping']),

    ('java3 loops', 'java', '''
public class Loops {
    public static void main(String[] args) {
        int n = 1;
        do {
            n *= 3;
        } while (n < 100);
        System.out.println(n);
        outer:
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (j == i) continue outer;
                System.out.print(i + "" + j + " ");
            }
        }
        System.out.println();
        int k = 0;
        while (true) {
            k++;
            if (k * k > 50) break;
        }
        System.out.println(k);
    }
}
''',
     [],
     ['243', '21 31 32 ', '8']),

    ('java3 scanner input', 'java', '''
import java.util.Scanner;

public class Ages {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        System.out.print("How many? ");
        int n = in.nextInt();
        in.nextLine();
        int total = 0;
        for (int i = 0; i < n; i++) {
            System.out.print("Name: ");
            String name = in.nextLine();
            System.out.print("Age: ");
            int age = Integer.parseInt(in.nextLine().trim());
            total += age;
            System.out.println(name + " is " + age);
        }
        System.out.println("Average " + (double) total / n);
    }
}
''',
     ['2', 'Ann', '30', 'Bob', '25'],
     ['How many? ', 'Name: ', 'Age: ', 'Ann is 30', 'Name: ', 'Age: ', 'Bob is 25', 'Average 27.5']),

    ('java3 recursion', 'java', '''
public class Rec {
    static int fib(int n) { return n < 2 ? n : fib(n - 1) + fib(n - 2); }
    static boolean palindrome(String s) {
        if (s.length() < 2) return true;
        if (s.charAt(0) != s.charAt(s.length() - 1)) return false;
        return palindrome(s.substring(1, s.length() - 1));
    }
    static int digitSum(int n) { return n == 0 ? 0 : n % 10 + digitSum(n / 10); }

    public static void main(String[] args) {
        System.out.println(fib(10) + " " + palindrome("racecar") + " " + palindrome("rocket") + " " + digitSum(4096));
    }
}
''',
     [],
     ['55 True False 19']),

    ('java3 exceptions', 'java', '''
public class Errors {
    static int parse(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            System.out.println("bad number: " + s);
            return -1;
        }
    }

    static int divide(int a, int b) {
        if (b == 0) throw new ArithmeticException("divide by zero");
        return a / b;
    }

    public static void main(String[] args) {
        System.out.println(parse("42") + parse("x"));
        try {
            System.out.println(divide(10, 2));
            System.out.println(divide(1, 0));
            System.out.println("not reached");
        } catch (ArithmeticException e) {
            System.out.println("caught: " + e.getMessage());
        } finally {
            System.out.println("done");
        }
    }
}
''',
     [],
     ['bad number: x', '41', '5', 'caught: divide by zero', 'done']),

    ('java3 chars', 'java', '''
public class Chars {
    public static void main(String[] args) {
        String s = "Hello World 123";
        int letters = 0, digits = 0, upper = 0;
        for (char c : s.toCharArray()) {
            if (Character.isLetter(c)) letters++;
            if (Character.isDigit(c)) digits++;
            if (Character.isUpperCase(c)) upper++;
        }
        System.out.println(letters + " " + digits + " " + upper);
        char c = 'a';
        c += 2;
        System.out.println(c + " " + (int) c + " " + (char) (c + 1) + " " + Character.toUpperCase(c));
        StringBuilder shifted = new StringBuilder();
        for (char ch : "abcxyz".toCharArray()) {
            shifted.append((char) ('a' + (ch - 'a' + 3) % 26));
        }
        System.out.println(shifted);
    }
}
''',
     [],
     ['10 3 2', 'c 99 d C', 'defabc']),

    ('java3 math and casts', 'java', '''
public class MathDemo {
    public static void main(String[] args) {
        int a = 17, b = 5;
        System.out.println(a / b + " " + a % b + " " + (double) a / b + " " + -17 / 5 + " " + -17 % 5);
        System.out.println(Math.round(2.5) + " " + Math.round(-2.5) + " " + Math.floor(2.7) + " " + Math.ceil(2.1));
        System.out.println(Math.abs(-3) + " " + Math.max(4, 9) + " " + Math.pow(2, 10) + " " + Math.sqrt(2));
        double x = 7.9;
        int y = (int) x;
        long big = 1L << 40;
        System.out.println(y + " " + big + " " + Integer.MAX_VALUE);
        System.out.println(10 == 10.0);
    }
}
''',
     [],
     ['3 2 3.4 -3 -2', '3 -2 2 3', '3 9 1024 1.414214', '7 1099511627776 2147483647', 'True']),

    ('java3 ternary and compound', 'java', '''
public class Compound {
    public static void main(String[] args) {
        int[] xs = {3, 8, 1};
        int i = 0;
        int first = xs[i++];
        int second = xs[i++];
        System.out.println(first + " " + second + " " + i);
        int total = 10;
        total += 5;
        total *= 2;
        total -= 3;
        total /= 3;
        total %= 5;
        System.out.println(total);
        String size = total > 3 ? "big" : total > 1 ? "mid" : "small";
        System.out.println(size);
        int n = 5;
        int m = n++ + ++n;
        System.out.println(n + " " + m);
    }
}
''',
     [],
     ['3 8 2', '4', 'big', '7 12']),

    ('java3 generic method', 'java', '''
import java.util.*;

public class Generic {
    static <T> void printAll(List<T> items) {
        for (T item : items) {
            System.out.print(item + ";");
        }
        System.out.println();
    }

    static <T extends Comparable<T>> T largest(List<T> items) {
        T best = items.get(0);
        for (T item : items) {
            if (item.compareTo(best) > 0) best = item;
        }
        return best;
    }

    public static void main(String[] args) {
        printAll(Arrays.asList(1, 2, 3));
        printAll(Arrays.asList("a", "b"));
        System.out.println(largest(Arrays.asList(4, 9, 2)) + " " + largest(Arrays.asList("kiwi", "apple")));
    }
}
''',
     [],
     ['1;2;3;', 'a;b;', '9 kiwi']),

    ('java3 stack and queue', 'java', '''
import java.util.*;

public class StackQueue {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1); stack.push(2); stack.push(3);
        System.out.println(stack.peek() + " " + stack.pop() + " " + stack.size());
        Queue<String> queue = new LinkedList<>();
        queue.offer("a"); queue.offer("b"); queue.offer("c");
        System.out.println(queue.peek() + " " + queue.poll() + " " + queue.size());
        while (!queue.isEmpty()) {
            System.out.print(queue.poll());
        }
        System.out.println();
        Stack<Character> st = new Stack<>();
        for (char c : "abc".toCharArray()) st.push(c);
        StringBuilder out = new StringBuilder();
        while (!st.isEmpty()) out.append(st.pop());
        System.out.println(out);
    }
}
''',
     [],
     ['3 3 2', 'a a 2', 'bc', 'cba']),

    ('cs3 string methods', 'csharp', '''
using System;

class Strings
{
    static void Main()
    {
        string s = "  Hello, World  ";
        string t = s.Trim();
        Console.WriteLine(t.Length + " " + t[1] + " " + t.Substring(7) + " " + t.Substring(0, 5));
        Console.WriteLine(t.IndexOf("o") + " " + t.LastIndexOf("o") + " " + t.IndexOf("z"));
        Console.WriteLine(t.ToUpper() + " " + t.ToLower());
        Console.WriteLine(t.Contains("World") + " " + t.StartsWith("He") + " " + t.EndsWith("x"));
        Console.WriteLine(t.Replace("l", "L"));
        string[] parts = t.Split(new[] { ", " }, StringSplitOptions.None);
        Console.WriteLine(parts.Length + " " + parts[1]);
        Console.WriteLine(string.Join("-", parts));
        Console.WriteLine(string.Format("{0} has {1} letters", "tea", 3));
        double price = 3.14159;
        Console.WriteLine($"{price:F2} {price,8:F1}| {"ab",-5}|");
        Console.WriteLine("abc".PadLeft(5, '*') + " " + "abc".PadRight(5, '.') + "|");
    }
}
''',
     [],
     ['12 e World Hello', '4 8 -1', 'HELLO, WORLD hello, world', 'True True False', 'HeLLo, WorLd', '2 World', 'Hello-World', 'tea has 3 letters', '3.14      3.1| ab   |', '**abc abc..|']),

    ('cs3 lists', 'csharp', '''
using System;
using System.Collections.Generic;

class Lists
{
    static void Main()
    {
        var xs = new List<int> { 4, 8, 15 };
        xs.Add(16);
        xs.Insert(0, 1);
        Console.WriteLine(string.Join(",", xs) + " " + xs.Count);
        xs.Remove(15);
        xs.RemoveAt(0);
        Console.WriteLine(string.Join(",", xs) + " " + xs.Contains(8) + " " + xs.IndexOf(16));
        xs.Sort();
        xs.Reverse();
        Console.WriteLine(string.Join(",", xs));
        int[] arr = { 3, 1, 2 };
        Array.Sort(arr);
        Console.WriteLine(string.Join(" ", arr) + " " + arr.Length);
        for (int i = 0; i < xs.Count; i++)
        {
            xs[i] *= 10;
        }
        foreach (int x in xs) Console.Write(x + " ");
        Console.WriteLine();
    }
}
''',
     [],
     ['1,4,8,15,16 5', '4,8,16 True 2', '16,8,4', '1 2 3 3', '160 80 40 ']),

    ('cs3 dictionaries', 'csharp', '''
using System;
using System.Collections.Generic;

class Dicts
{
    static void Main()
    {
        var ages = new Dictionary<string, int>();
        ages.Add("Ann", 30);
        ages["Bob"] = 25;
        ages["Ann"] += 1;
        int found;
        if (ages.TryGetValue("Bob", out found)) Console.WriteLine("Bob " + found);
        if (!ages.TryGetValue("Cy", out found)) Console.WriteLine("no Cy " + found);
        Console.WriteLine(ages.ContainsKey("Ann") + " " + ages.Count);
        foreach (KeyValuePair<string, int> kv in ages)
        {
            Console.WriteLine(kv.Key + "=" + kv.Value);
        }
        ages.Remove("Bob");
        foreach (var name in ages.Keys) Console.WriteLine(name);
        var sorted = new SortedDictionary<string, int> { { "pear", 1 }, { "apple", 2 } };
        foreach (var kv in sorted) Console.WriteLine(kv.Key);
    }
}
''',
     [],
     ['Bob 25', 'no Cy 0', 'True 2', 'Ann=31', 'Bob=25', 'Ann', 'apple', 'pear']),

    ('cs3 properties and static', 'csharp', '''
using System;

class Account
{
    public static int Opened = 0;
    public string Owner { get; private set; }
    public decimal Balance { get; private set; }
    public bool Rich => Balance > 1000;

    public Account(string owner, decimal start)
    {
        Owner = owner;
        Balance = start;
        Opened++;
    }

    public void Deposit(decimal amount) { Balance += amount; }

    public override string ToString() { return Owner + ": " + Balance.ToString("F2"); }
}

class Bank
{
    static void Main()
    {
        var a = new Account("Ann", 500m);
        var b = new Account("Bob", 2000m);
        a.Deposit(750.5m);
        Console.WriteLine(a);
        Console.WriteLine(b.ToString() + " " + b.Rich + " " + a.Rich);
        Console.WriteLine(Account.Opened);
    }
}
''',
     [],
     ['Ann: 1250.50', 'Bob: 2000.00 True True', '2']),

    ('cs3 inheritance', 'csharp', '''
using System;
using System.Collections.Generic;

abstract class Animal
{
    public string Name;
    protected Animal(string name) { Name = name; }
    public abstract string Sound();
    public virtual string Describe() { return Name + " says " + Sound(); }
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }
    public override string Sound() { return "woof"; }
}

class Puppy : Dog
{
    public Puppy(string name) : base(name) { }
    public override string Describe() { return base.Describe() + " (small)"; }
}

class Cat : Animal
{
    public Cat(string name) : base(name) { }
    public override string Sound() { return "meow"; }
}

class Zoo
{
    static void Main()
    {
        var all = new List<Animal> { new Dog("Rex"), new Cat("Tom"), new Puppy("Bit") };
        foreach (var a in all) Console.WriteLine(a.Describe());
    }
}
''',
     [],
     ['Rex says woof', 'Tom says meow', 'Bit says woof (small)']),

    ('cs3 interface', 'csharp', '''
using System;
using System.Collections.Generic;

interface IShape
{
    double Area();
}

class Rect : IShape
{
    double w, h;
    public Rect(double w, double h) { this.w = w; this.h = h; }
    public double Area() { return w * h; }
}

class Tri : IShape
{
    double b, h;
    public Tri(double b, double h) { this.b = b; this.h = h; }
    public double Area() { return b * h / 2; }
}

class Program
{
    static void Main()
    {
        List<IShape> shapes = new List<IShape> { new Rect(2, 3), new Tri(4, 5) };
        double total = 0;
        foreach (IShape s in shapes) total += s.Area();
        Console.WriteLine(total);
    }
}
''',
     [],
     ['16']),

    ('cs3 switch and loops', 'csharp', '''
using System;

class Menu
{
    static string Describe(string cmd)
    {
        switch (cmd)
        {
            case "n":
            case "north":
                return "going north";
            case "q":
                return "quitting";
            default:
                return "unknown " + cmd;
        }
    }

    static void Main()
    {
        foreach (var c in new[] { "n", "north", "x", "q" }) Console.WriteLine(Describe(c));
        int n = 0;
        do { n += 7; } while (n < 30);
        Console.WriteLine(n);
        int total = 0;
        for (int i = 0; i < 10; i++)
        {
            if (i == 7) break;
            if (i % 2 == 1) continue;
            total += i;
        }
        Console.WriteLine(total);
    }
}
''',
     [],
     ['going north', 'going north', 'unknown x', 'quitting', '35', '12']),

    ('cs3 input', 'csharp', '''
using System;

class Reader
{
    static void Main()
    {
        Console.Write("Name: ");
        string name = Console.ReadLine();
        Console.Write("Age: ");
        int age = int.Parse(Console.ReadLine());
        Console.Write("Height: ");
        double h = double.Parse(Console.ReadLine());
        Console.WriteLine($"{name} will be {age + 1} next year and is {h:F1}m tall");
    }
}
''',
     ['Ann', '41', '1.72'],
     ['Name: ', 'Age: ', 'Height: ', 'Ann will be 42 next year and is 1.7m tall']),

    ('cs3 linq', 'csharp', '''
using System;
using System.Collections.Generic;
using System.Linq;

class Query
{
    static void Main()
    {
        var nums = new List<int> { 5, 3, 8, 1, 9, 2, 8 };
        Console.WriteLine(string.Join(",", nums.Where(n => n > 3)));
        Console.WriteLine(string.Join(",", nums.Select(n => n * n)));
        Console.WriteLine(string.Join(",", nums.OrderBy(n => n)));
        Console.WriteLine(string.Join(",", nums.OrderByDescending(n => n).Take(3)));
        Console.WriteLine(nums.First() + " " + nums.First(n => n > 5) + " " + nums.Any(n => n > 8) + " " + nums.All(n => n > 0));
        Console.WriteLine(nums.Count(n => n % 2 == 0) + " " + nums.Sum() + " " + nums.Max() + " " + nums.Min());
        Console.WriteLine(nums.Average().ToString("F2") + " " + string.Join(",", nums.Distinct()));
        Console.WriteLine(string.Join(",", nums.Skip(2).Take(2)));
        var words = new[] { "pear", "fig", "apple" };
        Console.WriteLine(string.Join(" ", words.OrderBy(w => w.Length)));
    }
}
''',
     [],
     ['5,8,9,8', '25,9,64,1,81,4,64', '1,2,3,5,8,8,9', '9,8,8', '5 8 True True', '3 36 9 1', '5.14 5,3,8,1,9,2', '8,1', 'fig pear apple']),

    ('cs3 exceptions', 'csharp', '''
using System;

class Errors
{
    static int Ratio(int a, int b)
    {
        if (b == 0) throw new DivideByZeroException("no zero please");
        return a / b;
    }

    static void Main()
    {
        foreach (var t in new[] { "12", "x" })
        {
            try
            {
                int n = int.Parse(t);
                Console.WriteLine("got " + n);
            }
            catch (FormatException)
            {
                Console.WriteLine("not a number: " + t);
            }
        }
        try
        {
            Console.WriteLine(Ratio(9, 3));
            Console.WriteLine(Ratio(1, 0));
        }
        catch (DivideByZeroException e)
        {
            Console.WriteLine("caught " + e.Message);
        }
        finally
        {
            Console.WriteLine("finished");
        }
    }
}
''',
     [],
     ['got 12', 'not a number: x', '3', 'caught no zero please', 'finished']),

    ('cs3 chars', 'csharp', '''
using System;

class Chars
{
    static void Main()
    {
        string s = "Hi There 42";
        int letters = 0, digits = 0;
        foreach (char c in s)
        {
            if (char.IsLetter(c)) letters++;
            if (char.IsDigit(c)) digits++;
        }
        Console.WriteLine(letters + " " + digits);
        char ch = 'x';
        Console.WriteLine((int)ch + " " + (char)(ch + 1) + " " + char.ToUpper(ch));
        string code = "";
        foreach (char c in "abc") code += (char)(c - 32);
        Console.WriteLine(code);
    }
}
''',
     [],
     ['7 2', '120 y X', 'ABC']),

    ('cs3 math', 'csharp', '''
using System;

class Sums
{
    static void Main()
    {
        int a = 17, b = 5;
        Console.WriteLine(a / b + " " + a % b + " " + (double)a / b);
        Console.WriteLine(Math.Pow(2, 8) + " " + Math.Sqrt(81) + " " + Math.Abs(-7) + " " + Math.Max(3, 4));
        Console.WriteLine(Math.Round(2.5) + " " + Math.Round(3.5) + " " + Math.Floor(-1.5) + " " + Math.Ceiling(1.2));
        Console.WriteLine(Math.Round(3.14159, 2));
        int big = int.MaxValue;
        Console.WriteLine(big);
    }
}
''',
     [],
     ['3 2 3.4', '256 9 7 4', '2 4 -2 2', '3.14', '2147483647']),

    ('cs3 ref and out', 'csharp', '''
using System;

class Refs
{
    static void Swap(ref int a, ref int b)
    {
        int t = a;
        a = b;
        b = t;
    }

    static void MinMax(int[] xs, out int lo, out int hi)
    {
        lo = xs[0];
        hi = xs[0];
        foreach (int x in xs)
        {
            if (x < lo) lo = x;
            if (x > hi) hi = x;
        }
    }

    static void Main()
    {
        int x = 1, y = 2;
        Swap(ref x, ref y);
        Console.WriteLine(x + " " + y);
        int lo, hi;
        MinMax(new[] { 4, 9, 2, 7 }, out lo, out hi);
        Console.WriteLine(lo + " " + hi);
        int n;
        bool ok = int.TryParse("123", out n);
        Console.WriteLine(ok + " " + n);
    }
}
''',
     [],
     ['2 1', '2 9', 'True 123']),

    ('cs3 stringbuilder stack queue', 'csharp', '''
using System;
using System.Collections.Generic;
using System.Text;

class Structures
{
    static void Main()
    {
        var sb = new StringBuilder();
        for (int i = 1; i <= 3; i++) sb.Append(i).Append(",");
        sb.Append("go");
        Console.WriteLine(sb.ToString());
        var stack = new Stack<int>();
        stack.Push(1); stack.Push(2); stack.Push(3);
        Console.WriteLine(stack.Peek() + " " + stack.Pop() + " " + stack.Count);
        var queue = new Queue<string>();
        queue.Enqueue("a"); queue.Enqueue("b"); queue.Enqueue("c");
        Console.WriteLine(queue.Peek() + " " + queue.Dequeue() + " " + queue.Count);
        while (queue.Count > 0) Console.Write(queue.Dequeue());
        Console.WriteLine();
    }
}
''',
     [],
     ['1,2,3,go', '3 3 2', 'a a 2', 'bc']),

    ('cs3 enum', 'csharp', '''
using System;

enum Level { Low, Medium, High }

class Levels
{
    static string Advice(Level l)
    {
        switch (l)
        {
            case Level.Low: return "relax";
            case Level.Medium: return "watch";
            default: return "act";
        }
    }

    static void Main()
    {
        Level l = Level.Medium;
        Console.WriteLine(l + " " + Advice(l));
        Console.WriteLine(Advice(Level.High) + " " + (l == Level.Medium));
        foreach (Level each in new[] { Level.Low, Level.High }) Console.WriteLine(each);
    }
}
''',
     [],
     ['Medium watch', 'act True', 'Low', 'High']),

    ('cpp3 strings', 'cpp', '''
#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s = "Hello, World";
    cout << s.length() << " " << s[1] << " " << s.substr(7) << " " << s.substr(0, 5) << endl;
    cout << s.find("o") << " " << s.rfind("o") << endl;
    string t = s;
    for (auto& c : t) c = toupper(c);
    cout << t << endl;
    string r = s;
    reverse(r.begin(), r.end());
    cout << r << endl;
    s += "!";
    cout << s << " " << (s == "Hello, World!") << endl;
    int n = stoi("42") + 1;
    cout << to_string(n) + "x" << endl;
    return 0;
}
''',
     [],
     ['12 e World Hello', '4 8', 'HELLO, WORLD', 'dlroW ,olleH', 'Hello, World! 1', '43x']),

    ('cpp3 vectors', 'cpp', '''
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> v = {5, 3, 8};
    v.push_back(1);
    v.insert(v.begin(), 9);
    cout << v.size() << " " << v.front() << " " << v.back() << endl;
    v.pop_back();
    v.erase(v.begin() + 1);
    for (int x : v) cout << x << " ";
    cout << endl;
    sort(v.begin(), v.end());
    for (size_t i = 0; i < v.size(); i++) cout << v[i] << ",";
    cout << endl;
    cout << (find(v.begin(), v.end(), 8) != v.end()) << " " << v.empty() << endl;
    vector<int> w(3, 7);
    cout << w[0] + w[2] << endl;
    return 0;
}
''',
     [],
     ['5 9 1', '9 3 8 ', '3,8,9,', '1 0', '14']),

    ('cpp3 maps', 'cpp', '''
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> stock;
    stock["pear"] = 3;
    stock["apple"] = 5;
    stock["fig"] = 1;
    stock["apple"] += 2;
    for (auto& kv : stock) {
        cout << kv.first << "=" << kv.second << endl;
    }
    cout << stock.count("kiwi") << " " << stock.size() << endl;
    stock.erase("fig");
    for (const auto& [name, n] : stock) cout << name << ":" << n << " ";
    cout << endl;
    return 0;
}
''',
     [],
     ['apple=7', 'fig=1', 'pear=3', '0 3', 'apple:7 pear:3 ']),

    ('cpp3 class with getters', 'cpp', '''
#include <iostream>
#include <string>
using namespace std;

class Rect {
private:
    double w, h;
public:
    Rect(double w, double h) : w(w), h(h) {}
    double area() const { return w * h; }
    double perimeter() const { return 2 * (w + h); }
    void scale(double by) { w *= by; h *= by; }
};

int main() {
    Rect r(2, 3);
    cout << r.area() << " " << r.perimeter() << endl;
    r.scale(2);
    cout << r.area() << endl;
    return 0;
}
''',
     [],
     ['6 10', '24']),

    ('cpp3 virtual shapes', 'cpp', '''
#include <iostream>
#include <vector>
using namespace std;

class Shape {
public:
    virtual double area() = 0;
    virtual string name() { return "shape"; }
    virtual ~Shape() {}
};

class Square : public Shape {
    double s;
public:
    Square(double s) : s(s) {}
    double area() override { return s * s; }
    string name() override { return "square"; }
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() override { return 3 * r * r; }
};

int main() {
    vector<Shape*> shapes = {new Square(2), new Circle(1)};
    double total = 0;
    for (Shape* s : shapes) {
        cout << s->name() << " " << s->area() << endl;
        total += s->area();
    }
    cout << total << endl;
    return 0;
}
''',
     [],
     ['square 4', 'shape 3', '7']),

    ('cpp3 references', 'cpp', '''
#include <iostream>
#include <vector>
using namespace std;

void addAll(vector<int>& v, int by) {
    for (int& x : v) x += by;
}

int total(const vector<int>& v) {
    int t = 0;
    for (int x : v) t += x;
    return t;
}

void swapThem(int& a, int& b) {
    int t = a; a = b; b = t;
}

int main() {
    vector<int> v = {1, 2, 3};
    addAll(v, 10);
    cout << total(v) << " " << v[0] << endl;
    int a = 5, b = 9;
    swapThem(a, b);
    cout << a << " " << b << endl;
    return 0;
}
''',
     [],
     ['36 11', '9 5']),

    ('cpp3 grid', 'cpp', '''
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int rows = 3, cols = 4;
    vector<vector<int>> grid(rows, vector<int>(cols, 0));
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            grid[r][c] = r + c;
    int sum = 0;
    for (auto& row : grid)
        for (int x : row) sum += x;
    cout << sum << " " << grid[2][3] << endl;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) cout << grid[r][c];
        cout << endl;
    }
    return 0;
}
''',
     [],
     ['30 5', '0123', '1234', '2345']),

    ('cpp3 recursion', 'cpp', '''
#include <iostream>
using namespace std;

long long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
int power(int b, int e) {
    if (e == 0) return 1;
    int half = power(b, e / 2);
    return e % 2 == 0 ? half * half : half * half * b;
}

int main() {
    cout << fact(10) << " " << gcd(84, 36) << " " << power(3, 5) << endl;
    return 0;
}
''',
     [],
     ['3628800 12 243']),

    ('cpp3 input', 'cpp', '''
#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cout << "How many? ";
    cin >> n;
    int total = 0;
    for (int i = 0; i < n; i++) {
        int x;
        cout << "Number: ";
        cin >> x;
        total += x;
    }
    cout << "Total " << total << ", mean " << (double)total / n << endl;
    return 0;
}
''',
     ['3', '4', '5', '9'],
     ['How many? ', 'Number: ', 'Number: ', 'Number: ', 'Total 18, mean 6']),

    ('cpp3 iomanip', 'cpp', '''
#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    double prices[] = {2.5, 10, 3.456};
    for (double p : prices) {
        cout << fixed << setprecision(2) << setw(8) << p << endl;
    }
    cout << setw(5) << "ab" << "|" << endl;
    return 0;
}
''',
     [],
     ['    2.50', '   10.00', '    3.46', '   ab|']),

    ('cpp3 switch and chars', 'cpp', '''
#include <iostream>
using namespace std;

int main() {
    char grade = 'B';
    switch (grade) {
        case 'A': cout << "top" << endl; break;
        case 'B':
        case 'C': cout << "good" << endl; break;
        default: cout << "other" << endl;
    }
    char c = 'a';
    c = c + 2;
    cout << c << " " << (int)c << " " << (char)(c - 32) << endl;
    int n = 0;
    do { n += 4; } while (n < 10);
    cout << n << endl;
    return 0;
}
''',
     [],
     ['good', 'c 99 C', '12']),

    ('cpp3 struct vector sort', 'cpp', '''
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

struct Item {
    string name;
    double price;
    int qty;
};

int main() {
    vector<Item> items = {{"tea", 2.5, 4}, {"cake", 3.0, 1}, {"jam", 1.25, 2}};
    items.push_back({"bun", 0.5, 6});
    sort(items.begin(), items.end(), [](const Item& a, const Item& b) { return a.price * a.qty > b.price * b.qty; });
    double total = 0;
    for (const auto& it : items) {
        double cost = it.price * it.qty;
        total += cost;
        cout << it.name << " " << cost << endl;
    }
    cout << "total " << total << endl;
    return 0;
}
''',
     [],
     ['tea 10', 'cake 3', 'bun 3', 'jam 2.5', 'total 18.5']),

]
