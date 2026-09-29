"""A fourth set of programs written by hand, each language's own ways:
C++ copies and references, operator overloading, iterators and
<algorithm>, string streams, enum class; C# structs, enums with numbers,
int? and ??, LINQ query syntax, named and optional arguments, jagged and
rectangular arrays; Python and JavaScript dictionaries, slices, closures,
optional chaining; Java records, TreeMaps and streams.

Each is read with no language handed over, run by the runner with the
answers typed in, and has to print `want`: what the program itself
prints -- by running it (Python, JavaScript, Java, and C# inside
PowerShell) or worked out by hand (C++) -- in the runner's way of writing
it: True for true, [1, 2] for [ 1, 2 ], 100 for 100.0.

Same shape as coded.py: (what it is about, language, the code, what
gets typed, what it prints).
"""

# flake8: noqa
CODED = [
    ('py4 format specs', 'python', r'''
x = 1234567.891
p = 0.4567
n = 42
s = "cat"
print(f"{x:,.2f}")
print(f"{n:,}")
print(f"{p:.1%}")
print(f"{n:05d}|{n:<6}|{n:^6}|{n:>6}|")
print(f"{s!r} {s:*^9}")
print(f"{n:x} {n:o} {n:b}")
print(f"{3.0:g} {2.5e-3:.2e}")
print("{:>5}|{:<5}|".format("a", "b"))
print("{0}-{1}-{0}".format("x", "y"))
''',
     [],
     ['1,234,567.89', '42', '45.7%', '00042|42    |  42  |    42|', "'cat' ***cat***", '2a 52 101010', '3 2.5e-3', '    a|b    |', 'x-y-x']),

    ('py4 loops with else', 'python', r'''
def first_even(xs):
    for x in xs:
        if x % 2 == 0:
            print("found", x)
            break
    else:
        print("none even")

first_even([1, 3, 5])
first_even([1, 4, 5])
n = 0
while n < 3:
    n += 1
else:
    print("done at", n)
for i in range(10, 0, -3):
    print(i, end=" ")
print()
for i, ch in enumerate("abc", start=1):
    print(i, ch, sep=":")
''',
     [],
     ['none even', 'found 4', 'done at 3', '10 7 4 1 ', '1:a', '2:b', '3:c']),

    ('py4 nonlocal counter', 'python', r'''
def make_counter(start):
    count = start
    def step(by=1):
        nonlocal count
        count += by
        return count
    return step

c = make_counter(5)
print(c(), c(), c(10))
d = make_counter(0)
print(d(), c())
''',
     [],
     ['6 7 17', '1 18']),

    ('py4 properties and static', 'python', r'''
class Temperature:
    scale = "C"

    def __init__(self, celsius):
        self._c = celsius

    @property
    def fahrenheit(self):
        return self._c * 9 / 5 + 32

    @staticmethod
    def describe(value):
        return "warm" if value > 20 else "cold"

    @classmethod
    def freezing(cls):
        return cls(0)

    def __str__(self):
        return f"{self._c}{Temperature.scale}"

t = Temperature(25)
print(t, t.fahrenheit, Temperature.describe(25))
f = Temperature.freezing()
print(f, f.fahrenheit, Temperature.describe(f._c))
''',
     [],
     ['25C 77 warm', '0C 32 cold']),

    ('py4 sorting with tuple keys', 'python', r'''
people = [("Ann", 31), ("Bob", 25), ("Cy", 31), ("Di", 25)]
by_age = sorted(people, key=lambda p: (-p[1], p[0]))
print(by_age)
words = ["pear", "Fig", "apple", "kiwi"]
print(sorted(words, key=str.lower))
print(sorted(words, key=len, reverse=True))
print(max(people, key=lambda p: p[1]), min(words, key=len))
scores = {"ann": 3, "bob": 9, "cy": 5}
for name, sc in sorted(scores.items(), key=lambda kv: kv[1], reverse=True):
    print(name, sc)
''',
     [],
     ["[('Ann', 31), ('Cy', 31), ('Bob', 25), ('Di', 25)]", "['apple', 'Fig', 'kiwi', 'pear']", "['apple', 'pear', 'kiwi', 'Fig']", "('Ann', 31) Fig", 'bob 9', 'cy 5', 'ann 3']),

    ('py4 walrus and chained', 'python', r'''
data = [4, 8, 15, 16, 23, 42]
if (n := len(data)) > 5:
    print("long", n)
x = 7
print(1 < x < 10, 1 < x > 10, x == 7 != 8)
total = 0
i = 0
while (v := data[i]) < 20:
    total += v
    i += 1
print(total, i)
grade = "A" if x > 8 else "B" if x > 5 else "C"
print(grade)
''',
     [],
     ['long 6', 'True False True', '43 4', 'B']),

    ('py4 slices and steps', 'python', r'''
xs = list(range(10))
print(xs[::2], xs[1::3], xs[::-2])
print(xs[-3:], xs[:-7], xs[2:8:2])
s = "abcdefgh"
print(s[::3], s[-1], s[-3:-1], s[5:1:-1])
ys = xs[:]
ys[0] = 99
print(xs[0], ys[0])
del ys[1:4]
print(ys)
''',
     [],
     ['[0, 2, 4, 6, 8] [1, 4, 7] [9, 7, 5, 3, 1]', '[7, 8, 9] [0, 1, 2] [2, 4, 6]', 'adg h fg fedc', '0 99', '[99, 4, 5, 6, 7, 8, 9]']),

    ('py4 sets', 'python', r'''
a = {1, 2, 3, 4}
b = {3, 4, 5}
print(sorted(a | b), sorted(a & b), sorted(a - b), sorted(a ^ b))
a.add(9)
a.discard(1)
a.discard(100)
print(sorted(a), 9 in a, 1 in a)
evens = {x for x in range(10) if x % 2 == 0}
print(sorted(evens), len(evens))
print(sorted(set("mississippi")))
print({1, 2} <= {1, 2, 3}, {1, 2}.issubset({2}))
''',
     [],
     ['[1, 2, 3, 4, 5] [3, 4] [1, 2] [1, 2, 5]', '[2, 3, 4, 9] True False', '[0, 2, 4, 6, 8] 5', "['i', 'm', 'p', 's']", 'True False']),

    ('py4 string methods more', 'python', r'''
s = "hello world"
print(s.title(), s.capitalize(), s.swapcase())
print(s.center(15, "*"), s.ljust(13, ".") + "|", s.rjust(13) + "|")
print("7".zfill(3), s.count("o"), s.find("o", 5), s.rfind("o"))
print(s.split(" ", 1), "a,b,,c".split(","), s.partition(" "))
print(s.replace("l", "L", 2), "abc123".isalnum(), "   ".isspace())
print(s.startswith(("he", "x")), s.endswith("ld"), s.upper().isupper())
print(",".join(map(str, [1, 2, 3])), "-".join(reversed("abc")))
print(ord("A"), chr(98), "abc" < "abd", "Z" < "a")
''',
     [],
     ['Hello World Hello world HELLO WORLD', '**hello world** hello world..|   hello world|', '007 2 7 7', "['hello', 'world'] ['a', 'b', '', 'c'] ('hello', ' ', 'world')", 'heLLo world True True', 'True True True', '1,2,3 c-b-a', '65 b True True']),

    ('py4 exceptions', 'python', r'''
class TooBig(Exception):
    def __init__(self, value):
        super().__init__(f"{value} is too big")
        self.value = value

def check(n):
    if n > 10:
        raise TooBig(n)
    return n * 2

for n in [3, 12]:
    try:
        print(check(n))
    except TooBig as e:
        print("error:", e, e.value)
    else:
        print("fine")
    finally:
        print("checked", n)
try:
    int("abc")
except ValueError:
    print("not a number")
try:
    [1, 2][5]
except IndexError as e:
    print("index problem")
''',
     [],
     ['6', 'fine', 'checked 3', 'error: 12 is too big 12', 'checked 12', 'not a number', 'index problem']),

    ('py4 numbers', 'python', r'''
print(divmod(17, 5), divmod(-17, 5), pow(3, 4), pow(2, 10, 1000))
print(abs(-4.5), round(3.14159, 3), round(-2.5), round(1234, -2))
print(max(3, 7, 2), min([4, 1, 9]), sum([1.5, 2.5]), sum(range(101)))
print(int(7.9), int(-7.9), float("1e3"), 7 // -2, 7 % -2)
print(10 ** -2, 2 ** 0.5, 1 / 3)
import math
print(math.floor(-2.5), math.ceil(2.1), math.sqrt(16), math.pi > 3)
print(math.gcd(12, 18), math.factorial(5), math.hypot(3, 4))
print(bin(10), hex(255), int("ff", 16), int("101", 2))
''',
     [],
     ['(3, 2) (-4, 3) 81 24', '4.5 3.142 -2 1200', '7 1 4 5050', '7 -7 1000 -4 -1', '0.01 1.414214 0.333333', '-3 3 4 True', '6 120 5', '0b1010 0xff 255 5']),

    ('py4 any all generators', 'python', r'''
nums = [3, 8, 12, 7]
print(any(n > 10 for n in nums), all(n > 2 for n in nums))
print(sum(n * n for n in nums if n % 2), max(len(w) for w in ["a", "bbb", "cc"]))
def countdown(n):
    while n > 0:
        yield n
        n -= 1
print(list(countdown(4)), sum(countdown(3)))
pairs = [(x, y) for x in range(3) for y in range(x)]
print(pairs)
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(matrix, [row[1] for row in matrix])
flat = [v for row in matrix for v in row if v > 3]
print(flat)
''',
     [],
     ['True True', '58 3', '[4, 3, 2, 1] 6', '[(1, 0), (2, 0), (2, 1)]', '[[1, 2, 3], [2, 4, 6], [3, 6, 9]] [2, 4, 6]', '[4, 6, 6, 9]']),

    ('js4 template literals and ternaries', 'javascript', r'''
const items = [{ name: "tea", price: 3.5, qty: 2 }, { name: "cake", price: 4.25, qty: 0 }];
for (const it of items) {
  const status = it.qty > 1 ? "many" : it.qty === 1 ? "one" : "none";
  console.log(`${it.name.padEnd(6, ".")}${(it.price * it.qty).toFixed(2).padStart(7)} ${status}`);
}
const n = 5;
console.log(`${n} squared is ${n ** 2}, ${n % 2 === 0 ? "even" : "odd"}`);
console.log(`nested: ${`inner ${n + 1}`}`);
''',
     [],
     ['tea...   7.00 many', 'cake..   0.00 none', '5 squared is 25, odd', 'nested: inner 6']),

    ('js4 destructuring defaults', 'javascript', r'''
const [a = 1, b = 2, ...rest] = [10, undefined, 30, 40];
console.log(a, b, rest);
const { x, y: why = 5, z = "zed" } = { x: 1, y: undefined };
console.log(x, why, z);
function area({ w, h = 2 }) { return w * h; }
console.log(area({ w: 3 }), area({ w: 3, h: 4 }));
let p = 1, q = 2;
[p, q] = [q, p];
console.log(p, q);
const pairs = [[1, "one"], [2, "two"]];
for (const [num, word] of pairs) { console.log(num, word); }
''',
     [],
     ['10 2 [30, 40]', '1 5 zed', '6 12', '2 1', '1 one', '2 two']),

    ('js4 class features', 'javascript', r'''
class Account {
  static count = 0;
  #balance = 0;
  constructor(owner) {
    this.owner = owner;
    Account.count++;
  }
  get balance() { return this.#balance; }
  deposit(n) {
    if (n <= 0) throw new Error("bad amount");
    this.#balance += n;
    return this;
  }
  toString() { return `${this.owner}: ${this.#balance}`; }
}
class Savings extends Account {
  constructor(owner, rate) { super(owner); this.rate = rate; }
  addInterest() { this.deposit(this.balance * this.rate); return this.balance; }
}
const s = new Savings("Cy", 0.5);
s.deposit(10).deposit(20);
console.log(s.balance, s.addInterest(), String(s), Account.count);
try { s.deposit(-1); } catch (e) { console.log("caught", e.message); }
''',
     [],
     ['30 45 Cy: 45 1', 'caught bad amount']),

    ('js4 array methods more', 'javascript', r'''
const xs = [3, 1, 4, 1, 5, 9, 2, 6];
console.log(xs.at(-1), xs.at(0), xs.includes(9), xs.indexOf(1), xs.lastIndexOf(1));
console.log(xs.slice(-3).join(","), xs.findLast((v) => v < 4), xs.findIndex((v) => v > 4));
console.log([[1, 2], [3], []].flat().join(","), [1, 2, 3].flatMap((v) => [v, v * 10]).join(","));
const sorted = [...xs].sort((a, b) => b - a);
console.log(sorted.join(" "), xs.join(" "));
console.log(Array.from({ length: 4 }, (_, i) => i * i).join(","), new Array(3).fill(7).join(","));
const byParity = xs.reduce((acc, v) => { acc[v % 2 === 0 ? "even" : "odd"].push(v); return acc; }, { even: [], odd: [] });
console.log(byParity.even.join(","), byParity.odd.length);
console.log(["b", "a", "C"].sort().join(""), ["b", "a", "C"].sort((p, q) => p.localeCompare(q)).join(""));
console.log(Math.max(...xs), Math.min(...xs), xs.some((v) => v > 8), xs.every((v) => v > 0));
''',
     [],
     ['6 3 True 1 3', '9,2,6 2 4', '1,2,3 1,10,2,20,3,30', '9 6 5 4 3 2 1 1 3 1 4 1 5 9 2 6', '0,1,4,9 7,7,7', '4,2,6 5', 'Cab abC', '9 1 True True']),

    ('js4 maps sets and objects', 'javascript', r'''
const m = new Map([["a", 1], ["b", 2]]);
m.set("c", 3);
m.delete("a");
console.log(m.size, m.get("b"), m.has("a"), [...m.keys()].join(","), [...m.values()].join(","));
m.forEach((v, k) => console.log(k, v));
const s = new Set([1, 2, 2, 3]);
s.add(4);
console.log(s.size, s.has(2), [...s].join(","));
const o = { x: 1, y: 2 };
const o2 = { ...o, z: 3 };
console.log(Object.keys(o2).join(","), Object.values(o2).join(","), Object.entries(o2).length);
for (const [k, v] of Object.entries(o2)) { console.log(`${k}=${v}`); }
console.log(JSON.stringify(o2), "x" in o2, o2.w === undefined);
''',
     [],
     ['2 2 False b,c 2,3', 'b 2', 'c 3', '4 True 1,2,3,4', 'x,y,z 1,2,3 3', 'x=1', 'y=2', 'z=3', '{"x":1,"y":2,"z":3} True True']),

    ('js4 string methods more', 'javascript', r'''
const s = "Hello, World";
console.log(s.padStart(15, "*"), s.padEnd(14, "-") + "|");
console.log(s.repeat(2), "a,b,c,d".split(",", 2).join("|"));
console.log(s.replaceAll("l", "L"), s.replace("l", "L"));
console.log("  pad  ".trimStart() + "|", "  pad  ".trimEnd() + "|");
console.log(s.charAt(4), s.at(-1), s.slice(-5), s.substring(7, 12), s.charCodeAt(0));
console.log(s.startsWith("Hell"), s.endsWith("d"), s.includes("lo, W"), s.search("W"));
console.log(s.toUpperCase(), s.toLowerCase(), [...s].reverse().join(""));
console.log("abc".localeCompare("abd"), "b" > "a", String.fromCharCode(72, 105));
''',
     [],
     ['***Hello, World Hello, World--|', 'Hello, WorldHello, World a|b', 'HeLLo, WorLd HeLlo, World', 'pad  |   pad|', 'o d World World 72', 'True True True 7', 'HELLO, WORLD hello, world dlroW ,olleH', '-1 True Hi']),

    ('js4 labeled loops and switch', 'javascript', r'''
outer:
for (let i = 0; i < 4; i++) {
  for (let j = 0; j < 4; j++) {
    if (j === 2) continue outer;
    if (i === 3) break outer;
    console.log(i, j);
  }
}
function kind(n) {
  switch (true) {
    case n < 0: return "negative";
    case n === 0: return "zero";
    default: return "positive";
  }
}
console.log(kind(-3), kind(0), kind(8));
let k = 0;
do { k += 3; } while (k < 10);
console.log(k);
''',
     [],
     ['0 0', '0 1', '1 0', '1 1', '2 0', '2 1', 'negative zero positive', '12']),

    ('js4 closures and iife', 'javascript', r'''
const counter = (() => {
  let n = 0;
  return { inc: () => ++n, dec: () => --n, get: () => n };
})();
counter.inc(); counter.inc(); counter.dec();
console.log(counter.get());
function adder(x) { return (y) => x + y; }
const add5 = adder(5);
console.log(add5(3), adder(1)(1), [1, 2, 3].map(adder(10)).join(","));
const compose = (...fns) => (v) => fns.reduceRight((acc, f) => f(acc), v);
console.log(compose((v) => v + 1, (v) => v * 2)(5));
''',
     [],
     ['1', '8 2 11,12,13', '11']),

    ('js4 errors', 'javascript', r'''
class NotFound extends Error {
  constructor(what) { super(`${what} not found`); this.name = "NotFound"; this.what = what; }
}
function find(xs, v) {
  const i = xs.indexOf(v);
  if (i < 0) throw new NotFound(v);
  return i;
}
for (const v of [2, 7]) {
  try {
    console.log("at", find([1, 2, 3], v));
  } catch (e) {
    if (e instanceof NotFound) console.log(e.name, e.message, e.what);
    else throw e;
  } finally {
    console.log("looked for", v);
  }
}
''',
     [],
     ['at 1', 'looked for 2', 'NotFound 7 not found 7', 'looked for 7']),

    ('java4 stringbuilder', 'java', r'''
public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("hello");
        sb.insert(0, ">> ");
        sb.append('!').append(42);
        sb.setCharAt(3, 'H');
        System.out.println(sb + " " + sb.length());
        sb.deleteCharAt(sb.length() - 1);
        sb.reverse();
        System.out.println(sb.toString());
        sb.setLength(0);
        for (int i = 0; i < 3; i++) sb.append(i).append(',');
        System.out.println(sb.substring(0, sb.length() - 1) + " " + sb.indexOf("1") + " " + sb.charAt(2));
    }
}
''',
     [],
     ['>> Hello!42 11', '4!olleH >>', '0,1,2 2 1']),

    ('java4 switch expressions and yield', 'java', r'''
public class Main {
    static String size(int n) {
        return switch (n) {
            case 0 -> "none";
            case 1, 2, 3 -> "few";
            default -> {
                String s = n > 10 ? "lots" : "some";
                yield s;
            }
        };
    }
    public static void main(String[] args) {
        for (int n : new int[] {0, 2, 7, 50}) System.out.println(n + " " + size(n));
        String day = "SAT";
        switch (day) {
            case "SAT":
            case "SUN":
                System.out.println("weekend");
                break;
            default:
                System.out.println("weekday");
        }
    }
}
''',
     [],
     ['0 none', '2 few', '7 some', '50 lots', 'weekend']),

    ('java4 enums with fields', 'java', r'''
public class Main {
    enum Planet {
        MERCURY(3.7), EARTH(9.8), MARS(3.7);
        private final double gravity;
        Planet(double g) { this.gravity = g; }
        double weight(double mass) { return mass * gravity; }
    }
    public static void main(String[] args) {
        for (Planet p : Planet.values()) {
            System.out.println(p + " " + p.ordinal() + " " + String.format("%.1f", p.weight(10)));
        }
        Planet home = Planet.valueOf("EARTH");
        System.out.println(home.name().toLowerCase() + " " + (home == Planet.EARTH));
    }
}
''',
     [],
     ['MERCURY 0 37.0', 'EARTH 1 98.0', 'MARS 2 37.0', 'earth True']),

    ('java4 interfaces and abstract', 'java', r'''
import java.util.*;

public class Main {
    interface Shape {
        double area();
        default String label() { return getClass().getSimpleName() + " " + String.format("%.2f", area()); }
    }
    static abstract class Base implements Shape {
        protected final String name;
        Base(String name) { this.name = name; }
        abstract int sides();
    }
    static class Square extends Base {
        final double s;
        Square(double s) { super("square"); this.s = s; }
        public double area() { return s * s; }
        int sides() { return 4; }
    }
    static class Tri extends Base {
        final double b, h;
        Tri(double b, double h) { super("tri"); this.b = b; this.h = h; }
        public double area() { return b * h / 2; }
        int sides() { return 3; }
    }
    public static void main(String[] args) {
        List<Base> shapes = List.of(new Square(2), new Tri(3, 4));
        int total = 0;
        for (Base s : shapes) {
            System.out.println(s.label() + " " + s.name + " " + s.sides());
            total += s.sides();
        }
        System.out.println(total);
    }
}
''',
     [],
     ['Square 4.00 square 4', 'Tri 6.00 tri 3', '7']),

    ('java4 streams more', 'java', r'''
import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        System.out.println(IntStream.rangeClosed(1, 5).filter(n -> n % 2 == 1).sum());
        List<String> words = Arrays.asList("apple", "bob", "cat", "avocado", "banana");
        System.out.println(words.stream().filter(w -> w.startsWith("a")).map(String::toUpperCase).collect(Collectors.joining(", ")));
        Map<Character, List<String>> byFirst = words.stream().collect(Collectors.groupingBy(w -> w.charAt(0)));
        System.out.println(byFirst.get('b') + " " + byFirst.size());
        System.out.println(words.stream().mapToInt(String::length).max().getAsInt() + " " + words.stream().anyMatch(w -> w.length() > 6));
        List<Integer> nums = IntStream.range(0, 5).boxed().collect(Collectors.toList());
        System.out.println(nums + " " + nums.stream().map(n -> n * n).reduce(0, Integer::sum));
        System.out.println(words.stream().sorted(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder())).collect(Collectors.toList()));
    }
}
''',
     [],
     ['9', 'APPLE, AVOCADO', "['bob', 'banana'] 3", '7 True', '[0, 1, 2, 3, 4] 30', "['bob', 'cat', 'apple', 'banana', 'avocado']"]),

    ('java4 records and generics', 'java', r'''
import java.util.*;

public class Main {
    record Point(int x, int y) {
        Point scale(int k) { return new Point(x * k, y * k); }
        int dist() { return Math.abs(x) + Math.abs(y); }
    }
    static class Box<T> {
        private final List<T> items = new ArrayList<>();
        void add(T t) { items.add(t); }
        T first() { return items.get(0); }
        int size() { return items.size(); }
    }
    static <T extends Comparable<T>> T biggest(List<T> xs) {
        T best = xs.get(0);
        for (T x : xs) if (x.compareTo(best) > 0) best = x;
        return best;
    }
    public static void main(String[] args) {
        Point p = new Point(2, -3);
        System.out.println(p + " " + p.scale(2) + " " + p.dist() + " " + p.x());
        Box<String> b = new Box<>();
        b.add("hi"); b.add("yo");
        System.out.println(b.first() + " " + b.size());
        System.out.println(biggest(Arrays.asList(3, 9, 4)) + " " + biggest(Arrays.asList("pear", "apple")));
    }
}
''',
     [],
     ['Point[x=2, y=-3] Point[x=4, y=-6] 5 2', 'hi 2', '9 pear']),

    ('java4 exceptions', 'java', r'''
public class Main {
    static class TooBig extends Exception {
        final int value;
        TooBig(int v) { super(v + " is too big"); value = v; }
    }
    static int check(int n) throws TooBig {
        if (n > 10) throw new TooBig(n);
        return n * 2;
    }
    public static void main(String[] args) {
        for (int n : new int[] {3, 12}) {
            try {
                System.out.println(check(n));
            } catch (TooBig e) {
                System.out.println("error: " + e.getMessage() + " " + e.value);
            } finally {
                System.out.println("checked " + n);
            }
        }
        try {
            Integer.parseInt("x");
        } catch (NumberFormatException e) {
            System.out.println("not a number");
        }
        int[] a = new int[2];
        try { a[5] = 1; } catch (ArrayIndexOutOfBoundsException e) { System.out.println("out of range"); }
    }
}
''',
     [],
     ['6', 'checked 3', 'error: 12 is too big 12', 'checked 12', 'not a number', 'out of range']),

    ('java4 char math and labels', 'java', r'''
public class Main {
    public static void main(String[] args) {
        String s = "Hello";
        StringBuilder shifted = new StringBuilder();
        for (char c : s.toCharArray()) shifted.append((char) (c + 1));
        System.out.println(shifted);
        int count = 0;
        outer:
        for (int i = 0; i < 5; i++) {
            for (int j = 0; j < 5; j++) {
                if (i * j > 6) break outer;
                if (j > i) continue outer;
                count++;
            }
        }
        System.out.println(count);
        char grade = 'B';
        grade++;
        System.out.println(grade + " " + Character.isLetter(grade) + " " + Character.toLowerCase(grade));
    }
}
''',
     [],
     ['Ifmmp', '9', 'C True c']),

    ('java4 varargs and overloads', 'java', r'''
public class Main {
    static int sum(int... xs) { int t = 0; for (int x : xs) t += x; return t; }
    static String show(int n) { return "int " + n; }
    static String show(double d) { return "double " + d; }
    static String show(String s) { return "text " + s; }
    public static void main(String[] args) {
        System.out.println(sum() + " " + sum(1) + " " + sum(1, 2, 3));
        System.out.println(show(3) + " | " + show(2.5) + " | " + show("x"));
        int[] arr = {4, 5};
        System.out.println(sum(arr));
    }
}
''',
     [],
     ['0 1 6', 'int 3 | double 2.5 | text x', '9']),

    ('cs4 trygetvalue and counts', 'csharp', r'''
using System;
using System.Collections.Generic;

class Counts
{
    static void Main()
    {
        string text = "the cat and the hat and the bat";
        var counts = new Dictionary<string, int>();
        foreach (string w in text.Split(' '))
        {
            int n;
            if (counts.TryGetValue(w, out n))
            {
                counts[w] = n + 1;
            }
            else
            {
                counts[w] = 1;
            }
        }
        foreach (KeyValuePair<string, int> kv in counts)
        {
            Console.WriteLine(kv.Key + "=" + kv.Value);
        }
        Console.WriteLine(counts.ContainsKey("cat") + " " + counts.ContainsKey("dog") + " " + counts.Count);
        counts.Remove("the");
        Console.WriteLine(string.Join(",", counts.Keys) + " " + counts.Values.Count);
    }
}
''',
     [],
     ['the=3', 'cat=1', 'and=2', 'hat=1', 'bat=1', 'True False 5', 'cat,and,hat,bat 4']),

    ('cs4 list finders', 'csharp', r'''
using System;
using System.Collections.Generic;

class Finders
{
    static void Main()
    {
        var xs = new List<int> { 5, 12, 7, 20, 3, 18 };
        List<int> big = xs.FindAll(x => x > 10);
        Console.WriteLine(string.Join(" ", big));
        Console.WriteLine(xs.Find(x => x % 2 == 0) + " " + xs.FindIndex(x => x > 15) + " " + xs.Exists(x => x == 3));
        int gone = xs.RemoveAll(x => x < 6);
        Console.WriteLine(gone + " " + string.Join(" ", xs));
        xs.AddRange(new int[] { 1, 2 });
        Console.WriteLine(xs.Count + " " + xs.TrueForAll(x => x > 0));
        xs.Sort((a, b) => b.CompareTo(a));
        Console.WriteLine(string.Join(" ", xs));
        List<string> words = new List<string> { "pear", "fig", "banana" };
        words.Sort((a, b) => a.Length - b.Length);
        Console.WriteLine(string.Join(" ", words));
        xs.Clear();
        Console.WriteLine(xs.Count);
    }
}
''',
     [],
     ['12 20 18', '12 3 True', '2 12 7 20 18', '6 True', '20 18 12 7 2 1', 'fig pear banana', '0']),

    ('cs4 format alignment', 'csharp', r'''
using System;

class Table
{
    static void Main()
    {
        string[] names = { "Ann", "Bartholomew", "Cy" };
        double[] pay = { 1234.5, 99.25, 100000 };
        for (int i = 0; i < names.Length; i++)
        {
            Console.WriteLine(string.Format("{0,-12}|{1,10:F2}|", names[i], pay[i]));
        }
        Console.WriteLine(string.Format("{0:N0} {1:N2} {2:P1}", 1234567, 9876.543, 0.256));
        Console.WriteLine(string.Format("{0:D5} {1:X} {2:x4}", 42, 255, 255));
        Console.WriteLine(12.ToString("000") + " " + 3.14159.ToString("0.00") + " " + 7.5.ToString("F3"));
        Console.WriteLine(string.Format("{{braces}} {0}", 1));
    }
}
''',
     [],
     ['Ann         |   1234.50|', 'Bartholomew |     99.25|', 'Cy          | 100000.00|', '1,234,567 9,876.54 25.6%', '00042 FF 00ff', '012 3.14 7.500', '{braces} 1']),

    ('cs4 structs', 'csharp', r'''
using System;

struct Point
{
    public int X;
    public int Y;

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }

    public int Manhattan()
    {
        return Math.Abs(X) + Math.Abs(Y);
    }

    public override string ToString()
    {
        return "(" + X + ", " + Y + ")";
    }
}

class Program
{
    static void Main()
    {
        Point a = new Point(3, -4);
        Point b = a;
        b.X = 10;
        Console.WriteLine(a + " " + b + " " + a.Manhattan());
        Point[] ps = { new Point(1, 1), new Point(-2, 5) };
        int total = 0;
        foreach (Point p in ps) total += p.Manhattan();
        Console.WriteLine(total);
    }
}
''',
     [],
     ['(3, -4) (10, -4) 7', '9']),

    ('cs4 params and optional', 'csharp', r'''
using System;

class Program
{
    static int Sum(params int[] xs)
    {
        int s = 0;
        foreach (int x in xs) s += x;
        return s;
    }

    static string Greet(string name, string greeting = "Hello", int times = 1)
    {
        string s = "";
        for (int i = 0; i < times; i++) s += greeting + " " + name + "! ";
        return s.Trim();
    }

    static void Main()
    {
        Console.WriteLine(Sum() + " " + Sum(4) + " " + Sum(1, 2, 3, 4));
        Console.WriteLine(Greet("Ann"));
        Console.WriteLine(Greet("Bo", "Hi"));
        Console.WriteLine(Greet("Cy", "Yo", 2));
        Console.WriteLine(Greet("Di", times: 2));
    }
}
''',
     [],
     ['0 4 10', 'Hello Ann!', 'Hi Bo!', 'Yo Cy! Yo Cy!', 'Hello Di! Hello Di!']),

    ('cs4 nullable and coalesce', 'csharp', r'''
using System;
using System.Collections.Generic;

class Program
{
    static int? Find(List<int> xs, int want)
    {
        for (int i = 0; i < xs.Count; i++)
        {
            if (xs[i] == want) return i;
        }
        return null;
    }

    static void Main()
    {
        var xs = new List<int> { 4, 9, 2 };
        int? a = Find(xs, 9);
        int? b = Find(xs, 7);
        Console.WriteLine(a.HasValue + " " + b.HasValue + " " + a.Value);
        Console.WriteLine((b ?? -1) + " " + (a ?? -1));
        string name = null;
        Console.WriteLine(name ?? "nobody");
        string nick = "Z";
        Console.WriteLine(nick ?? "nobody");
        Console.WriteLine(b == null);
    }
}
''',
     [],
     ['True False 1', '-1 1', 'nobody', 'Z', 'True']),

    ('cs4 hashset and queue', 'csharp', r'''
using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var seen = new HashSet<int>();
        int[] xs = { 3, 1, 3, 2, 1, 5 };
        var firsts = new List<int>();
        foreach (int x in xs)
        {
            if (seen.Add(x)) firsts.Add(x);
        }
        Console.WriteLine(string.Join(" ", firsts) + " " + seen.Count + " " + seen.Contains(5));
        var q = new Queue<string>();
        q.Enqueue("a");
        q.Enqueue("b");
        q.Enqueue("c");
        Console.WriteLine(q.Peek() + " " + q.Dequeue() + " " + q.Count);
        var st = new Stack<int>();
        for (int i = 1; i <= 4; i++) st.Push(i * i);
        Console.Write(st.Pop() + " " + st.Peek() + ":");
        while (st.Count > 0) Console.Write(" " + st.Pop());
        Console.WriteLine();
    }
}
''',
     [],
     ['3 1 2 5 4 True', 'a a 2', '16 9: 9 4 1']),

    ('cs4 linq query syntax', 'csharp', r'''
using System;
using System.Linq;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int[] nums = { 5, 10, 3, 8, 12, 1 };
        var evens = from n in nums where n % 2 == 0 orderby n select n * 10;
        Console.WriteLine(string.Join(" ", evens));
        var words = new List<string> { "kiwi", "apple", "fig", "banana" };
        var shortOnes = from w in words where w.Length <= 4 select w.ToUpper();
        Console.WriteLine(string.Join(",", shortOnes));
        Console.WriteLine(nums.Max() + " " + nums.Min() + " " + nums.Sum() + " " + nums.Average());
        Console.WriteLine(nums.Count(n => n > 4) + " " + nums.Any(n => n > 11) + " " + nums.All(n => n > 0));
        Console.WriteLine(string.Join(" ", nums.OrderByDescending(n => n).Take(3)));
        Console.WriteLine(string.Join(" ", words.Select(w => w.Length)));
        Console.WriteLine(words.First(w => w.StartsWith("b")) + " " + string.Join(" ", nums.Skip(4)));
        Console.WriteLine(string.Join(" ", nums.Where((n, i) => i % 2 == 0)));
        Console.WriteLine(string.Join(" ", words.OrderBy(w => w.Length).ThenBy(w => w)));
    }
}
''',
     [],
     ['80 100 120', 'KIWI,FIG', '12 1 39 6.5', '4 True True', '12 10 8', '4 5 3 6', 'banana 12 1', '5 3 12', 'fig kiwi apple banana']),

    ('cs4 tuple create', 'csharp', r'''
using System;
using System.Collections.Generic;

class Program
{
    static Tuple<int, int> MinMax(int[] xs)
    {
        int lo = xs[0], hi = xs[0];
        foreach (int x in xs)
        {
            if (x < lo) lo = x;
            if (x > hi) hi = x;
        }
        return Tuple.Create(lo, hi);
    }

    static void Main()
    {
        var r = MinMax(new int[] { 4, -2, 9, 7 });
        Console.WriteLine(r.Item1 + " " + r.Item2);
        var pairs = new List<Tuple<string, int>>();
        pairs.Add(Tuple.Create("b", 2));
        pairs.Add(Tuple.Create("a", 5));
        pairs.Sort((p, q) => p.Item1.CompareTo(q.Item1));
        foreach (var p in pairs) Console.WriteLine(p.Item1 + ":" + p.Item2);
    }
}
''',
     [],
     ['-2 9', 'a:5', 'b:2']),

    ('cs4 abstract and override', 'csharp', r'''
using System;
using System.Collections.Generic;

abstract class Animal
{
    protected string name;

    protected Animal(string name)
    {
        this.name = name;
    }

    public abstract string Sound();

    public virtual string Describe()
    {
        return name + " says " + Sound();
    }
}

class Dog : Animal
{
    public Dog(string name) : base(name) { }

    public override string Sound()
    {
        return "woof";
    }
}

class Puppy : Dog
{
    public Puppy(string name) : base(name) { }

    public override string Describe()
    {
        return "little " + base.Describe();
    }
}

class Cat : Animal
{
    public Cat() : base("cat") { }

    public override string Sound()
    {
        return "meow";
    }
}

class Program
{
    static void Main()
    {
        var pets = new List<Animal> { new Dog("Rex"), new Cat(), new Puppy("Bit") };
        foreach (Animal a in pets) Console.WriteLine(a.Describe());
        Console.WriteLine(pets[2] is Dog);
        Console.WriteLine(pets[1] is Dog);
    }
}
''',
     [],
     ['Rex says woof', 'cat says meow', 'little Bit says woof', 'True', 'False']),

    ('cs4 properties auto', 'csharp', r'''
using System;

class Account
{
    public string Owner { get; private set; }
    public decimal Balance { get; private set; }
    private static int opened = 0;

    public Account(string owner, decimal start)
    {
        Owner = owner;
        Balance = start;
        opened++;
    }

    public bool Withdraw(decimal amount)
    {
        if (amount > Balance)
        {
            return false;
        }
        Balance -= amount;
        return true;
    }

    public static int Opened
    {
        get { return opened; }
    }
}

class Program
{
    static void Main()
    {
        var a = new Account("Ann", 100m);
        var b = new Account("Bo", 20.5m);
        Console.WriteLine(a.Withdraw(30) + " " + b.Withdraw(30) + " " + a.Balance + " " + b.Balance);
        Console.WriteLine(Account.Opened + " " + a.Owner);
    }
}
''',
     [],
     ['True False 70 20.5', '2 Ann']),

    ('cs4 exceptions custom', 'csharp', r'''
using System;

class TooColdException : Exception
{
    public int Degrees;

    public TooColdException(int degrees) : base("too cold: " + degrees)
    {
        Degrees = degrees;
    }
}

class Program
{
    static void Check(int t)
    {
        if (t < 0) throw new TooColdException(t);
        if (t > 40) throw new ArgumentException("too hot");
        Console.WriteLine("fine " + t);
    }

    static void Main()
    {
        int[] temps = { 20, -5, 50 };
        foreach (int t in temps)
        {
            try
            {
                Check(t);
            }
            catch (TooColdException e)
            {
                Console.WriteLine(e.Message + " " + e.Degrees);
            }
            catch (Exception e)
            {
                Console.WriteLine("other: " + e.Message);
            }
            finally
            {
                Console.WriteLine("checked " + t);
            }
        }
        try
        {
            int[] xs = new int[2];
            xs[5] = 1;
        }
        catch (IndexOutOfRangeException)
        {
            Console.WriteLine("out of range");
        }
        try
        {
            int z = int.Parse("abc");
        }
        catch (FormatException)
        {
            Console.WriteLine("not a number");
        }
    }
}
''',
     [],
     ['fine 20', 'checked 20', 'too cold: -5 -5', 'checked -5', 'other: too hot', 'checked 50', 'out of range', 'not a number']),

    ('cs4 char and string building', 'csharp', r'''
using System;
using System.Text;

class Program
{
    static string Caesar(string s, int k)
    {
        var sb = new StringBuilder();
        foreach (char c in s)
        {
            if (char.IsUpper(c)) sb.Append((char)('A' + (c - 'A' + k) % 26));
            else if (char.IsLower(c)) sb.Append((char)('a' + (c - 'a' + k) % 26));
            else sb.Append(c);
        }
        return sb.ToString();
    }

    static void Main()
    {
        Console.WriteLine(Caesar("Hello, World!", 3));
        string s = "a1b2c3";
        int digits = 0;
        foreach (char c in s) if (char.IsDigit(c)) digits += c - '0';
        Console.WriteLine(digits);
        char[] cs = "stressed".ToCharArray();
        Array.Reverse(cs);
        Console.WriteLine(new string(cs));
        Console.WriteLine(new string('-', 5) + (int)'A' + " " + (char)98);
        var sb2 = new StringBuilder("abc");
        sb2.Insert(0, "x").Append('!').Replace("b", "B");
        Console.WriteLine(sb2.ToString() + " " + sb2.Length);
    }
}
''',
     [],
     ['Khoor, Zruog!', '6', 'desserts', '-----65 b', 'xaBc! 5']),

    ('cs4 2d arrays', 'csharp', r'''
using System;

class Program
{
    static void Main()
    {
        int[,] grid = new int[3, 4];
        for (int r = 0; r < 3; r++)
            for (int c = 0; c < 4; c++)
                grid[r, c] = r * c;
        Console.WriteLine(grid.GetLength(0) + " " + grid.GetLength(1) + " " + grid[2, 3]);
        int[][] jag = new int[3][];
        for (int i = 0; i < 3; i++)
        {
            jag[i] = new int[i + 1];
            for (int j = 0; j <= i; j++) jag[i][j] = i + j;
        }
        foreach (int[] row in jag) Console.WriteLine(string.Join(" ", row));
        int sum = 0;
        foreach (int v in grid) sum += v;
        Console.WriteLine(sum);
    }
}
''',
     [],
     ['3 4 6', '0', '1 2', '2 3 4', '18']),

    ('cs4 switch strings and goto case', 'csharp', r'''
using System;

class Program
{
    static string Kind(string day)
    {
        switch (day)
        {
            case "Sat":
            case "Sun":
                return "weekend";
            case "Fri":
                return "almost";
            default:
                return "weekday";
        }
    }

    static void Main()
    {
        foreach (string d in new[] { "Mon", "Fri", "Sun" }) Console.WriteLine(d + " " + Kind(d));
        int n = 0;
        do
        {
            n += 3;
        } while (n < 10);
        Console.WriteLine(n);
        for (int i = 0, j = 10; i < j; i += 3, j -= 3) Console.Write(i + ":" + j + " ");
        Console.WriteLine();
        int k = 7;
        string size = k < 5 ? "small" : k < 10 ? "medium" : "large";
        Console.WriteLine(size);
    }
}
''',
     [],
     ['Mon weekday', 'Fri almost', 'Sun weekend', '12', '0:10 3:7 ', 'medium']),

    ('cs4 interfaces generic', 'csharp', r'''
using System;
using System.Collections.Generic;

interface IShape
{
    double Area();
    string Name { get; }
}

class Square : IShape
{
    private double side;
    public Square(double side) { this.side = side; }
    public double Area() { return side * side; }
    public string Name { get { return "square"; } }
}

class Circle : IShape, IComparable<Circle>
{
    public double R;
    public Circle(double r) { R = r; }
    public double Area() { return Math.Round(Math.PI * R * R, 2); }
    public string Name { get { return "circle"; } }
    public int CompareTo(Circle other) { return R.CompareTo(other.R); }
}

class Box<T>
{
    private List<T> items = new List<T>();
    public void Put(T x) { items.Add(x); }
    public T Get(int i) { return items[i]; }
    public int Size { get { return items.Count; } }
}

class Program
{
    static void Main()
    {
        var shapes = new List<IShape> { new Square(3), new Circle(1) };
        double total = 0;
        foreach (IShape s in shapes)
        {
            Console.WriteLine(s.Name + " " + s.Area());
            total += s.Area();
        }
        Console.WriteLine(total);
        var cs = new List<Circle> { new Circle(3), new Circle(1), new Circle(2) };
        cs.Sort();
        foreach (Circle c in cs) Console.Write(c.R + " ");
        Console.WriteLine();
        var b = new Box<string>();
        b.Put("x");
        b.Put("y");
        Console.WriteLine(b.Get(1) + " " + b.Size);
    }
}
''',
     [],
     ['square 9', 'circle 3.14', '12.14', '1 2 3 ', 'y 2']),

    ('cs4 math and conversions', 'csharp', r'''
using System;

class Program
{
    static void Main()
    {
        Console.WriteLine(Math.Pow(2, 10) + " " + Math.Sqrt(81) + " " + Math.Max(3, 9) + " " + Math.Min(-1, 4));
        Console.WriteLine(Math.Floor(2.7) + " " + Math.Ceiling(2.1) + " " + Math.Round(2.5) + " " + Math.Round(3.5) + " " + Math.Round(2.567, 2));
        Console.WriteLine(7 / 2 + " " + 7 % 3 + " " + -7 / 2 + " " + -7 % 3 + " " + 7.0 / 2);
        Console.WriteLine(Convert.ToInt32("123") + 1 + " " + int.Parse("-8") + " " + double.Parse("2.5") * 2);
        Console.WriteLine((int)3.99 + " " + (int)-3.99 + " " + Convert.ToInt32(3.5) + " " + Convert.ToInt32(4.5));
        Console.WriteLine(int.MaxValue + " " + Math.Abs(-12) + " " + Math.Sign(-3));
        Console.WriteLine(10.0 / 4 + " " + 1.0 / 3);
        long big = 1L << 40;
        Console.WriteLine(big + " " + (big % 1000));
    }
}
''',
     [],
     ['1024 9 9 -1', '2 3 2 4 2.57', '3 1 -3 -1 3.5', '124 -8 5', '3 -3 4 4', '2147483647 12 -1', '2.5 0.333333', '1099511627776 776']),

    ('cs4 recursion and static fields', 'csharp', r'''
using System;
using System.Collections.Generic;

class Program
{
    static Dictionary<int, long> memo = new Dictionary<int, long>();
    static int calls = 0;

    static long Fib(int n)
    {
        calls++;
        if (n < 2) return n;
        if (memo.ContainsKey(n)) return memo[n];
        long v = Fib(n - 1) + Fib(n - 2);
        memo[n] = v;
        return v;
    }

    static void Hanoi(int n, char from, char to, char via, List<string> moves)
    {
        if (n == 0) return;
        Hanoi(n - 1, from, via, to, moves);
        moves.Add(from + ">" + to);
        Hanoi(n - 1, via, to, from, moves);
    }

    static void Main()
    {
        Console.WriteLine(Fib(50) + " " + calls);
        var moves = new List<string>();
        Hanoi(3, 'A', 'C', 'B', moves);
        Console.WriteLine(moves.Count + " " + string.Join(" ", moves));
    }
}
''',
     [],
     ['12586269025 99', '7 A>C A>B C>B A>C B>A B>C A>C']),

    ('cs4 input loop', 'csharp', r'''
using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var marks = new List<int>();
        while (true)
        {
            Console.Write("Mark (blank to stop): ");
            string line = Console.ReadLine();
            if (string.IsNullOrEmpty(line)) break;
            int m;
            if (!int.TryParse(line, out m))
            {
                Console.WriteLine("not a number");
                continue;
            }
            marks.Add(m);
        }
        if (marks.Count == 0)
        {
            Console.WriteLine("none");
            return;
        }
        double avg = 0;
        foreach (int m in marks) avg += m;
        avg /= marks.Count;
        Console.WriteLine("Average " + avg.ToString("F1"));
    }
}
''',
     ['70', 'x', '85', '90', ''],
     ['Mark (blank to stop): ', 'Mark (blank to stop): ', 'not a number', 'Mark (blank to stop): ', 'Mark (blank to stop): ', 'Mark (blank to stop): ', 'Average 81.7']),

    ('cs4 delegates and func', 'csharp', r'''
using System;
using System.Collections.Generic;

class Program
{
    static int Apply(Func<int, int> f, int x)
    {
        return f(x);
    }

    static List<int> Map(List<int> xs, Func<int, int> f)
    {
        var out1 = new List<int>();
        foreach (int x in xs) out1.Add(f(x));
        return out1;
    }

    static void Main()
    {
        Func<int, int> twice = x => x * 2;
        Func<int, int, int> add = (a, b) => a + b;
        Console.WriteLine(Apply(twice, 21) + " " + add(3, 4));
        Console.WriteLine(string.Join(",", Map(new List<int> { 1, 2, 3 }, x => x * x)));
        Action<string> shout = s => Console.WriteLine(s.ToUpper() + "!");
        shout("hey");
        Predicate<int> odd = n => n % 2 == 1;
        Console.WriteLine(odd(3) + " " + odd(4));
        var ops = new Dictionary<string, Func<int, int, int>>();
        ops["+"] = (a, b) => a + b;
        ops["*"] = (a, b) => a * b;
        Console.WriteLine(ops["+"](2, 3) + " " + ops["*"](2, 3));
    }
}
''',
     [],
     ['42 7', '1,4,9', 'HEY!', 'True False', '5 6']),

    ('cs4 enum with values', 'csharp', r'''
using System;

enum Level { Low = 1, Medium = 5, High = 10 }

class Program
{
    static void Main()
    {
        Level l = Level.Medium;
        Console.WriteLine(l + " " + (int)l);
        l = (Level)10;
        Console.WriteLine(l);
        foreach (Level x in Enum.GetValues(typeof(Level)))
        {
            Console.Write(x + "=" + (int)x + " ");
        }
        Console.WriteLine();
        Console.WriteLine(Level.Low < Level.High);
        Level p = (Level)Enum.Parse(typeof(Level), "High");
        Console.WriteLine(p == Level.High);
    }
}
''',
     [],
     ['Medium 5', 'High', 'Low=1 Medium=5 High=10 ', 'True', 'True']),

    ('cs4 string methods more', 'csharp', r'''
using System;

class Program
{
    static void Main()
    {
        string s = "Mississippi";
        Console.WriteLine(s.IndexOf("ss") + " " + s.IndexOf("ss", 3) + " " + s.LastIndexOf('s'));
        Console.WriteLine(s.Remove(4) + " " + s.Remove(1, 3) + " " + s.Insert(4, "-"));
        Console.WriteLine(s.Replace("ss", "SS") + " " + s.ToLower().Split('s').Length);
        Console.WriteLine("  x y  ".TrimStart() + "|" + "  x y  ".TrimEnd() + "|");
        Console.WriteLine(string.Compare("apple", "banana") < 0);
        Console.WriteLine("abc".Equals("ABC", StringComparison.OrdinalIgnoreCase));
        Console.WriteLine(string.Concat("a", "b", "c") + " " + string.IsNullOrWhiteSpace("  "));
        Console.WriteLine("a,b,,c".Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Length);
        Console.WriteLine("hello".Substring(1, 3).ToUpper() + " " + "x".CompareTo("y"));
        char[] letters = { 'd', 'a', 'c' };
        Array.Sort(letters);
        Console.WriteLine(new string(letters) + " " + "hello".IndexOfAny(new[] { 'l', 'o' }));
    }
}
''',
     [],
     ['2 5 6', 'Miss Missippi Miss-issippi', 'MiSSiSSippi 5', 'x y  |  x y|', 'True', 'True', 'abc True', '3', 'ELL -1', 'acd 2']),

    ('cpp4 operators', 'cpp', r'''
#include <iostream>
using namespace std;

struct Vec {
    int x, y;
    Vec(int x = 0, int y = 0) : x(x), y(y) {}
    Vec operator+(const Vec& o) const { return Vec(x + o.x, y + o.y); }
    Vec operator*(int k) const { return Vec(x * k, y * k); }
    bool operator==(const Vec& o) const { return x == o.x && y == o.y; }
    int dot(const Vec& o) const { return x * o.x + y * o.y; }
};

int main() {
    Vec a(1, 2), b(3, -1);
    Vec c = a + b;
    Vec d = a * 3;
    cout << c.x << " " << c.y << endl;
    cout << d.x << " " << d.y << endl;
    cout << (c == Vec(4, 1)) << " " << (a == b) << endl;
    cout << a.dot(b) << endl;
    return 0;
}
''',
     [],
     ['4 1', '3 6', '1 0', '1']),

    ('cpp4 values and references', 'cpp', r'''
#include <iostream>
#include <vector>
#include <string>
using namespace std;

struct Player {
    string name;
    int score;
};

void bonus(Player p) { p.score += 10; }
void bonusRef(Player& p) { p.score += 10; }

int main() {
    Player a{"Ann", 5};
    Player b = a;
    b.name = "Bo";
    b.score = 7;
    cout << a.name << " " << a.score << " " << b.name << " " << b.score << endl;
    bonus(a);
    cout << a.score << endl;
    bonusRef(a);
    cout << a.score << endl;
    vector<Player> team = {a, b};
    team[0].score = 99;
    cout << a.score << " " << team[0].score << endl;
    for (auto p : team) { p.score = 0; }
    cout << team[0].score << " " << team[1].score << endl;
    for (auto& p : team) { p.score += 1; }
    cout << team[0].score << " " << team[1].score << endl;
    vector<vector<int>> grid = {{1, 2}, {3, 4}};
    vector<vector<int>> copy = grid;
    copy[0][0] = 100;
    cout << grid[0][0] << " " << copy[0][0] << endl;
    int n = 5;
    int& r = n;
    r = 8;
    cout << n << endl;
    return 0;
}
''',
     [],
     ['Ann 5 Bo 7', '5', '15', '15 99', '99 7', '100 8', '1 100', '8']),

    ('cpp4 pairs and bindings', 'cpp', r'''
#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <utility>
using namespace std;

pair<int, int> minMax(const vector<int>& v) {
    int lo = v[0], hi = v[0];
    for (int x : v) {
        if (x < lo) lo = x;
        if (x > hi) hi = x;
    }
    return {lo, hi};
}

int main() {
    auto [lo, hi] = minMax({4, -2, 9, 7});
    cout << lo << " " << hi << endl;
    pair<string, int> p = make_pair("tea", 3);
    cout << p.first << " " << p.second << endl;
    map<string, int> stock = {{"pens", 4}, {"ink", 2}};
    stock["pads"] = 7;
    for (const auto& [item, n] : stock) {
        cout << item << "=" << n << " ";
    }
    cout << endl;
    vector<pair<string, int>> v = {{"b", 2}, {"a", 1}};
    for (auto& pr : v) cout << pr.first << pr.second;
    cout << endl;
    return 0;
}
''',
     [],
     ['-2 9', 'tea 3', 'ink=2 pads=7 pens=4 ', 'b2a1']),

    ('cpp4 algorithms', 'cpp', r'''
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;

int main() {
    vector<int> v = {5, 3, 8, 1, 9, 2};
    int total = accumulate(v.begin(), v.end(), 0);
    int evens = count_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; });
    cout << total << " " << evens << endl;
    auto it = find(v.begin(), v.end(), 8);
    cout << (it - v.begin()) << endl;
    cout << *max_element(v.begin(), v.end()) << " " << *min_element(v.begin(), v.end()) << endl;
    vector<int> sq(v.size());
    transform(v.begin(), v.end(), sq.begin(), [](int x) { return x * x; });
    for (int x : sq) cout << x << " ";
    cout << endl;
    sort(v.begin(), v.end(), [](int a, int b) { return a > b; });
    for (int x : v) cout << x << " ";
    cout << endl;
    reverse(v.begin(), v.end());
    cout << v[0] << " " << v.back() << endl;
    bool any = any_of(v.begin(), v.end(), [](int x) { return x > 8; });
    bool all = all_of(v.begin(), v.end(), [](int x) { return x > 0; });
    cout << any << " " << all << endl;
    return 0;
}
''',
     [],
     ['28 2', '2', '9 1', '25 9 64 1 81 4 ', '9 8 5 3 2 1 ', '1 9', '1 1']),

    ('cpp4 string work', 'cpp', r'''
#include <iostream>
#include <string>
#include <sstream>
#include <vector>
using namespace std;

int main() {
    string s = "the quick brown fox";
    istringstream in(s);
    string word;
    vector<string> words;
    while (in >> word) words.push_back(word);
    cout << words.size() << " " << words[2] << endl;
    string t = s;
    t.replace(4, 5, "slow");
    cout << t << endl;
    t.insert(0, ">> ");
    cout << t << endl;
    t.erase(0, 3);
    cout << t << endl;
    size_t at = s.find("brown");
    cout << at << " " << s.substr(at, 5) << endl;
    cout << (s.find("cat") == string::npos) << endl;
    string up = "";
    for (char c : words[1]) up += toupper(c);
    cout << up << endl;
    cout << to_string(12) + "!" << " " << stoi("40") + 2 << endl;
    return 0;
}
''',
     [],
     ['4 brown', 'the slow brown fox', '>> the slow brown fox', 'the slow brown fox', '10 brown', '1', 'QUICK', '12! 42']),

    ('cpp4 enum class', 'cpp', r'''
#include <iostream>
using namespace std;

enum class Light { Red, Amber, Green };

Light next(Light l) {
    switch (l) {
        case Light::Red: return Light::Green;
        case Light::Green: return Light::Amber;
        default: return Light::Red;
    }
}

string name(Light l) {
    if (l == Light::Red) return "red";
    if (l == Light::Amber) return "amber";
    return "green";
}

int main() {
    Light l = Light::Red;
    for (int i = 0; i < 4; i++) {
        cout << name(l) << " ";
        l = next(l);
    }
    cout << endl;
    cout << static_cast<int>(Light::Green) << endl;
    return 0;
}
''',
     [],
     ['red green amber red ', '2']),

    ('cpp4 iomanip table', 'cpp', r'''
#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

int main() {
    string names[] = {"Ann", "Bartholomew", "Cy"};
    double pay[] = {1234.5, 99.25, 100000};
    for (int i = 0; i < 3; i++) {
        cout << left << setw(12) << names[i] << "|" << right << setw(10) << fixed << setprecision(2) << pay[i] << "|" << endl;
    }
    cout << setfill('0') << setw(5) << 42 << endl;
    cout << setprecision(3) << 3.14159 << endl;
    return 0;
}
''',
     [],
     ['Ann         |   1234.50|', 'Bartholomew |     99.25|', 'Cy          | 100000.00|', '00042', '3.142']),

    ('cpp4 class with statics', 'cpp', r'''
#include <iostream>
#include <string>
using namespace std;

class Account {
private:
    string owner;
    double balance;
    static int opened;
public:
    Account(const string& o, double start) : owner(o), balance(start) { opened++; }
    bool withdraw(double amount) {
        if (amount > balance) return false;
        balance -= amount;
        return true;
    }
    double getBalance() const { return balance; }
    string getOwner() const { return owner; }
    static int count() { return opened; }
};

int Account::opened = 0;

int main() {
    Account a("Ann", 100);
    Account b("Bo", 20.5);
    cout << a.withdraw(30) << " " << b.withdraw(30) << endl;
    cout << a.getBalance() << " " << b.getBalance() << endl;
    cout << Account::count() << " " << a.getOwner() << endl;
    return 0;
}
''',
     [],
     ['1 0', '70 20.5', '2 Ann']),

    ('cpp4 shapes', 'cpp', r'''
#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Shape {
public:
    virtual double area() const = 0;
    virtual string name() const { return "shape"; }
    virtual ~Shape() {}
};

class Rect : public Shape {
    double w, h;
public:
    Rect(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
    string name() const override { return "rect"; }
};

class Square : public Rect {
public:
    Square(double s) : Rect(s, s) {}
    string name() const override { return "square"; }
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() const override { return 3 * r * r; }
};

int main() {
    vector<Shape*> shapes = {new Rect(2, 3), new Square(4), new Circle(1)};
    double total = 0;
    for (Shape* s : shapes) {
        cout << s->name() << " " << s->area() << endl;
        total += s->area();
    }
    cout << total << endl;
    for (Shape* s : shapes) delete s;
    return 0;
}
''',
     [],
     ['rect 6', 'square 16', 'shape 3', '25']),

    ('cpp4 memo and long', 'cpp', r'''
#include <iostream>
#include <map>
using namespace std;

map<int, long long> memo;

long long fib(int n) {
    if (n < 2) return n;
    if (memo.count(n)) return memo[n];
    long long v = fib(n - 1) + fib(n - 2);
    memo[n] = v;
    return v;
}

int main() {
    cout << fib(40) << endl;
    cout << memo.size() << endl;
    long long big = 1;
    for (int i = 0; i < 40; i++) big *= 2;
    cout << big << endl;
    return 0;
}
''',
     [],
     ['102334155', '39', '1099511627776']),

    ('cpp4 sort structs', 'cpp', r'''
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

struct Pupil {
    string name;
    int mark;
    bool operator<(const Pupil& o) const { return mark < o.mark; }
};

int main() {
    vector<Pupil> ps = {{"Cy", 70}, {"Ann", 85}, {"Bo", 70}, {"Di", 60}};
    sort(ps.begin(), ps.end());
    for (const auto& p : ps) cout << p.name << ":" << p.mark << " ";
    cout << endl;
    stable_sort(ps.begin(), ps.end(), [](const Pupil& a, const Pupil& b) { return a.name < b.name; });
    for (const auto& p : ps) cout << p.name << " ";
    cout << endl;
    auto best = max_element(ps.begin(), ps.end(), [](const Pupil& a, const Pupil& b) { return a.mark < b.mark; });
    cout << best->name << endl;
    return 0;
}
''',
     [],
     ['Di:60 Cy:70 Bo:70 Ann:85 ', 'Ann Bo Cy Di ', 'Ann']),

    ('cpp4 exceptions', 'cpp', r'''
#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

double safeDivide(double a, double b) {
    if (b == 0) throw runtime_error("divide by zero");
    return a / b;
}

int parseAge(const string& s) {
    int n = stoi(s);
    if (n < 0) throw invalid_argument("negative age");
    return n;
}

int main() {
    try {
        cout << safeDivide(10, 4) << endl;
        cout << safeDivide(1, 0) << endl;
    } catch (const runtime_error& e) {
        cout << "error: " << e.what() << endl;
    }
    try {
        cout << parseAge("30") << endl;
        cout << parseAge("-3") << endl;
    } catch (const exception& e) {
        cout << "bad: " << e.what() << endl;
    }
    cout << "done" << endl;
    return 0;
}
''',
     [],
     ['2.5', 'error: divide by zero', '30', 'bad: negative age', 'done']),

    ('cpp4 lambdas', 'cpp', r'''
#include <iostream>
#include <functional>
#include <vector>
#include <algorithm>
using namespace std;

function<int(int)> adder(int n) {
    return [n](int x) { return x + n; };
}

int applyTwice(function<int(int)> f, int x) { return f(f(x)); }

int main() {
    int total = 0;
    vector<int> v = {1, 2, 3, 4};
    for_each(v.begin(), v.end(), [&total](int x) { total += x; });
    cout << total << endl;
    auto add5 = adder(5);
    cout << add5(10) << " " << applyTwice(add5, 1) << endl;
    int k = 3;
    auto times = [=](int x) { return x * k; };
    cout << times(7) << endl;
    auto sq = [](int x) { return x * x; };
    cout << applyTwice(sq, 3) << endl;
    return 0;
}
''',
     [],
     ['10', '15 11', '21', '81']),

    ('cpp4 containers', 'cpp', r'''
#include <iostream>
#include <stack>
#include <queue>
#include <set>
#include <deque>
using namespace std;

int main() {
    stack<int> st;
    for (int i = 1; i <= 3; i++) st.push(i * 10);
    cout << st.top() << " " << st.size() << endl;
    st.pop();
    cout << st.top() << endl;
    queue<string> q;
    q.push("a"); q.push("b"); q.push("c");
    cout << q.front() << " " << q.back() << endl;
    q.pop();
    cout << q.front() << " " << q.size() << endl;
    set<int> s = {5, 1, 4, 1, 3};
    for (int x : s) cout << x << " ";
    cout << s.size() << " " << s.count(4) << " " << s.count(9) << endl;
    priority_queue<int> pq;
    pq.push(3); pq.push(8); pq.push(1);
    cout << pq.top() << endl;
    deque<int> d = {2, 3};
    d.push_front(1);
    d.push_back(4);
    cout << d.front() << d.back() << d.size() << endl;
    return 0;
}
''',
     [],
     ['30 3', '20', 'a c', 'b 2', '1 3 4 5 4 1 0', '8', '144']),

    ('cpp4 math and ints', 'cpp', r'''
#include <iostream>
#include <cmath>
#include <cstdlib>
using namespace std;

int main() {
    cout << 7 / 2 << " " << -7 / 2 << " " << 7 % 3 << " " << -7 % 3 << endl;
    cout << 7.0 / 2 << endl;
    cout << pow(2, 10) << " " << sqrt(49.0) << " " << abs(-4) << endl;
    cout << floor(2.7) << " " << ceil(2.1) << " " << round(2.5) << " " << round(-2.4) << endl;
    cout << fmod(7.5, 2) << " " << max(3, 9) << " " << min(-1, 4) << endl;
    int x = 17;
    x /= 3;
    x *= 2;
    x -= 1;
    x %= 4;
    cout << x << endl;
    double d = 3.99;
    int i = (int)d;
    cout << i << " " << static_cast<int>(-3.99) << endl;
    return 0;
}
''',
     [],
     ['3 -3 1 -1', '3.5', '1024 7 4', '2 3 3 -2', '1.5 9 -1', '1', '3 -3']),

    ('cpp4 input totals', 'cpp', r'''
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    int n;
    cout << "How many? ";
    cin >> n;
    vector<int> marks;
    for (int i = 0; i < n; i++) {
        int m;
        cout << "Mark: ";
        cin >> m;
        marks.push_back(m);
    }
    int best = marks[0], sum = 0;
    for (int m : marks) {
        sum += m;
        if (m > best) best = m;
    }
    cout << "Best " << best << ", average " << (double)sum / n << endl;
    return 0;
}
''',
     ['3', '70', '85', '90'],
     ['How many? ', 'Mark: ', 'Mark: ', 'Mark: ', 'Best 90, average 81.6667']),

    ('cpp4 chars and do while', 'cpp', r'''
#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s = "Hello, World 42!";
    int letters = 0, digits = 0, spaces = 0;
    for (char c : s) {
        if (isalpha(c)) letters++;
        else if (isdigit(c)) digits++;
        else if (isspace(c)) spaces++;
    }
    cout << letters << " " << digits << " " << spaces << endl;
    string code = "";
    for (char c : string("abcxyz")) code += char((c - 'a' + 3) % 26 + 'a');
    cout << code << endl;
    int n = 1;
    do {
        n *= 3;
    } while (n < 100);
    cout << n << endl;
    int count = 0;
    for (int i = 0; i < 10; i++) {
        if (i % 3 == 0) continue;
        if (i > 7) break;
        count += i;
    }
    cout << count << endl;
    return 0;
}
''',
     [],
     ['10 2 2', 'defabc', '243', '19']),

    ('cpp4 map work', 'cpp', r'''
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<string> words = {"b", "a", "c", "a", "b", "a"};
    map<string, int> counts;
    for (const string& w : words) counts[w]++;
    for (auto it = counts.begin(); it != counts.end(); ++it) {
        cout << it->first << it->second << " ";
    }
    cout << endl;
    cout << counts.count("z") << " " << counts.size() << endl;
    counts.erase("b");
    auto found = counts.find("c");
    if (found != counts.end()) cout << "c=" << found->second << endl;
    counts.insert({"d", 4});
    cout << counts.begin()->first << " " << counts.rbegin()->first << endl;
    return 0;
}
''',
     [],
     ['a3 b2 c1 ', '0 3', 'c=1', 'a d']),

]
