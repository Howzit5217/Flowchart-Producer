"""Programs in the languages the page reads but does not write --
TypeScript, C, Kotlin, Swift, Go and Rust -- each the way people write it:
classes and structs, enums, closures, maps, input, errors.

Each is read with no language handed over, run by the runner with the
answers typed in, and has to print `want`: what the program itself prints,
worked out by hand (no compiler for them here), in the runner's way of
writing it -- True for true, 5 for 5.0, [1, 2] for a list.

Same shape as coded.py: (what it is about, language, the code, what
gets typed, what it prints).
"""

# flake8: noqa
CODED = [
    ('ts1 types read past', 'typescript', r'''
import * as readline from "readline";

interface Shape {
  area(): number;
  name: string;
}

type Id = number | string;

enum Color { Red, Green = 5, Blue }

class Rect implements Shape {
  name: string = "rect";
  constructor(private w: number, public h: number) {}
  area(): number {
    return this.w * this.h;
  }
  get perimeter(): number { return 2 * (this.w + this.h); }
}

abstract class Animal {
  protected constructor(readonly sound: string) {}
  abstract legs(): number;
  speak(times: number = 1): string {
    return (this.sound + " ").repeat(times).trim();
  }
}

class Dog extends Animal {
  constructor() { super("woof"); }
  legs(): number { return 4; }
}

function total(xs: number[], scale?: number): number {
  let sum: number = 0;
  for (const x of xs) {
    sum += x * (scale ?? 1);
  }
  return sum;
}

const double = (n: number): number => n * 2;
const pairs: Map<string, Array<number>> = new Map<string, Array<number>>();
pairs.set("a", [1, 2]);
let id: Id = 42;
const r = new Rect(3, 4);
console.log(r.area(), r.perimeter, r.name);
console.log(total([1, 2, 3]), total([1, 2], 10), double(21));
console.log(Color.Green, Color.Blue, Color.Red);
const d = new Dog();
console.log(d.speak(2), d.legs());
const v = (pairs.get("a") as number[]).length;
console.log(v, id);
let maybe: string | null = null;
console.log(maybe ?? "none");
const nums = [5, 3, 8].map((x: number) => x + 1).filter(x => x > 4);
console.log(nums.join(","));
''', [],
     ['12 14 rect', '6 30 42', '5 6 0', 'woof woof 4', '2 42', 'none', '6,9']),
    ('ts2 generics, unions and type guards', 'typescript', r'''
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number };

interface Named {
  readonly name: string;
  describe(): string;
}

class Stack<T> {
  private items: T[] = [];
  push(item: T): void {
    this.items.push(item);
  }
  pop(): T | undefined {
    return this.items.pop();
  }
  get size(): number {
    return this.items.length;
  }
}

class Person implements Named {
  constructor(public readonly name: string, private age: number) {}
  describe(): string {
    return `${this.name} (${this.age})`;
  }
  birthday(): void {
    this.age++;
  }
}

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return 3 * s.r * s.r;
    case "rect":
      return s.w * s.h;
  }
}

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function largest<T>(xs: T[], score: (x: T) => number): T | null {
  let best: T | null = null;
  let top = -Infinity;
  for (const x of xs) {
    const s = score(x);
    if (s > top) {
      top = s;
      best = x;
    }
  }
  return best;
}

const shapes: Shape[] = [{ kind: "circle", r: 2 }, { kind: "rect", w: 3, h: 5 }];
console.log(shapes.map(area).join(" "));
const stack = new Stack<number>();
[4, 8, 15].forEach((n) => stack.push(n));
console.log("popped", stack.pop(), "size", stack.size);
const p = new Person("Ada", 36);
p.birthday();
console.log(p.describe());
const mixed: (string | number)[] = ["a", 1, "bb", 22];
const words = mixed.filter(isString);
console.log(words.length, words.join("+"));
const tally: Record<string, number> = {};
for (const w of "one two one three one".split(" ")) {
  tally[w] = (tally[w] ?? 0) + 1;
}
console.log(Object.entries(tally).map(([k, v]) => `${k}=${v}`).join(", "));
const best = largest(["kiwi", "banana", "fig"], (s) => s.length);
console.log("longest:", best);
const maybe: Person | undefined = undefined;
console.log(maybe?.name ?? "nobody");
''', [],
     ['12 15', 'popped 15 size 2', 'Ada (37)', '2 a+bb', 'one=3, two=1, three=1', 'longest: banana', 'nobody']),
    ('c1 pointers, strings and structs', 'c', r'''
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#define MAX 5

typedef struct {
    char name[20];
    int score;
} Player;

struct Point {
    int x, y;
};

void swap(int *a, int *b) {
    int t = *a;
    *a = *b;
    *b = t;
}

int sum(int arr[], int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += arr[i];
    }
    return total;
}

double average(const int *arr, int n) {
    return (double) sum((int *) arr, n) / n;
}

int main(void) {
    int nums[] = {4, 8, 15, 16, 23};
    int n = sizeof(nums) / sizeof(nums[0]);
    printf("Sum: %d\n", sum(nums, n));
    printf("Average: %.2f\n", average(nums, n));
    int x = 3, y = 7;
    swap(&x, &y);
    printf("x=%d y=%d\n", x, y);
    char word[20];
    strcpy(word, "hello");
    strcat(word, " world");
    printf("%s has %d letters\n", word, (int) strlen(word));
    if (strcmp(word, "hello world") == 0) {
        puts("match");
    }
    Player p;
    strcpy(p.name, "Ada");
    p.score = 90;
    printf("%s: %d\n", p.name, p.score);
    struct Point pt = {2, 5};
    printf("(%d, %d)\n", pt.x, pt.y);
    int age;
    printf("Age? ");
    scanf("%d", &age);
    if (age >= 18) {
        printf("adult\n");
    } else {
        printf("minor\n");
    }
    for (int i = MAX; i > 0; i--) {
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}
''', ['20'],
     ['Sum: 66', 'Average: 13.20', 'x=7 y=3', 'hello world has 11 letters', 'match', 'Ada: 90', '(2, 5)', 'Age? ', 'adult', '5 4 3 2 1 ']),
    ('c2 struct arrays, char loops and a menu', 'c', r'''
#include <stdio.h>
#include <ctype.h>
#include <string.h>
#include <stdbool.h>

#define ROWS 3
#define COLS 3

struct Student {
    char name[30];
    int marks[3];
    float avg;
};

void compute(struct Student *s) {
    int total = 0;
    for (int i = 0; i < 3; i++) total += s->marks[i];
    s->avg = total / 3.0f;
}

bool isPalindrome(const char *w) {
    int n = strlen(w);
    for (int i = 0; i < n / 2; i++) {
        if (tolower(w[i]) != tolower(w[n - 1 - i])) return false;
    }
    return true;
}

int countVowels(char s[]) {
    int count = 0;
    for (int i = 0; s[i] != '\0'; i++) {
        char c = tolower(s[i]);
        if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u') count++;
    }
    return count;
}

int main() {
    struct Student class[2] = {
        {"Ann", {90, 85, 77}, 0},
        {"Bob", {60, 70, 80}, 0}
    };
    for (int i = 0; i < 2; i++) {
        compute(&class[i]);
        printf("%-5s %6.2f\n", class[i].name, class[i].avg);
    }
    int grid[ROWS][COLS];
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            grid[r][c] = r * COLS + c;
    int diag = 0;
    for (int i = 0; i < ROWS; i++) diag += grid[i][i];
    printf("diag=%d\n", diag);
    const char *words[] = {"level", "hello", "Racecar"};
    for (int i = 0; i < 3; i++) {
        printf("%s: %s, %d vowels\n", words[i], isPalindrome(words[i]) ? "yes" : "no", countVowels((char *) words[i]));
    }
    int choice;
    do {
        printf("1) Hi 2) Bye 0) Quit: ");
        scanf("%d", &choice);
        switch (choice) {
            case 1: printf("Hi!\n"); break;
            case 2: printf("Bye!\n"); break;
            case 0: break;
            default: printf("??\n");
        }
    } while (choice != 0);
    char line[50];
    printf("Name: ");
    fgets(line, sizeof(line), stdin);
    line[strcspn(line, "\n")] = '\0';
    for (int i = 0; line[i]; i++) line[i] = toupper(line[i]);
    printf("Hello, %s\n", line);
    return 0;
}
''', ['1', '5', '2', '0', 'ada lovelace'],
     ['Ann    84.00', 'Bob    70.00', 'diag=12', 'level: yes, 2 vowels', 'hello: no, 2 vowels', 'Racecar: yes, 3 vowels', '1) Hi 2) Bye 0) Quit: ', 'Hi!', '1) Hi 2) Bye 0) Quit: ', '??', '1) Hi 2) Bye 0) Quit: ', 'Bye!', '1) Hi 2) Bye 0) Quit: ', 'Name: ', 'Hello, ADA LOVELACE']),
    ('kt1 when, ranges and lambdas', 'kotlin', r'''
import kotlin.math.sqrt

data class Point(val x: Int, val y: Int) {
    fun dist(): Double = sqrt((x * x + y * y).toDouble())
}

fun classify(n: Int): String = when {
    n < 0 -> "negative"
    n == 0 -> "zero"
    n % 2 == 0 -> "even"
    else -> "odd"
}

fun grade(score: Int): Char {
    return when (score) {
        in 90..100 -> 'A'
        in 80 until 90 -> 'B'
        in 70..79 -> 'C'
        else -> 'F'
    }
}

fun main() {
    val nums = listOf(5, 3, 8, 1, 9, 2)
    println("Sum: ${nums.sum()}, max: ${nums.maxOrNull()}")
    val evens = nums.filter { it % 2 == 0 }.map { it * 10 }
    println(evens)
    for (i in 0 until 3) {
        print("$i ")
    }
    println()
    for (i in 10 downTo 0 step 5) println(i)
    val p = Point(3, 4)
    println("$p is ${p.dist()} away")
    println(classify(-4) + " " + classify(0) + " " + classify(7))
    println(grade(95).toString() + grade(85) + grade(72) + grade(10))
    var total = 0
    var n = 1
    while (n <= 5) {
        total += n
        n++
    }
    val msg = if (total > 10) "big" else "small"
    println("total=$total ($msg)")
    val words = mutableListOf("pear", "fig", "banana")
    words.add("kiwi")
    words.sortBy { it.length }
    println(words.joinToString(", "))
    val counts = mutableMapOf<String, Int>()
    for (w in listOf("a", "b", "a", "c", "a")) {
        counts[w] = counts.getOrDefault(w, 0) + 1
    }
    for ((k, v) in counts) {
        println("$k -> $v")
    }
    val longest = words.maxByOrNull { it.length }
    println("longest: $longest")
}
''', [],
     ['Sum: 28, max: 9', '[80, 20]', '0 1 2 ', '10', '5', '0', 'Point(x=3, y=4) is 5 away', 'negative zero odd', 'ABCF', 'total=15 (big)', 'fig, pear, kiwi, banana', 'a -> 3', 'b -> 1', 'c -> 1', 'longest: banana']),
    ('kt2 classes, objects and input', 'kotlin', r'''
class InsufficientFundsException(message: String) : Exception(message)

abstract class Account(val owner: String, protected var balance: Double) {
    abstract val kind: String

    open fun withdraw(amount: Double) {
        if (amount > balance) {
            throw InsufficientFundsException("$owner cannot withdraw $amount")
        }
        balance -= amount
    }

    fun deposit(amount: Double) {
        require(amount > 0)
        balance += amount
    }

    fun balanceText(): String = String.format("%.2f", balance)

    override fun toString(): String = "$kind[$owner: ${balanceText()}]"
}

class Savings(owner: String, balance: Double, private val rate: Double) : Account(owner, balance) {
    override val kind = "Savings"
    fun addInterest() {
        balance += balance * rate
    }
}

class Checking(owner: String, balance: Double) : Account(owner, balance) {
    override val kind: String
        get() = "Checking"
    override fun withdraw(amount: Double) {
        super.withdraw(amount + FEE)
    }
    companion object {
        const val FEE = 1.5
    }
}

enum class Command { DEPOSIT, WITHDRAW, SHOW, QUIT }

object Bank {
    val accounts = mutableListOf<Account>()
    fun find(name: String): Account? = accounts.firstOrNull { it.owner == name }
}

fun main() {
    Bank.accounts.add(Savings("Ann", 100.0, 0.05))
    Bank.accounts.add(Checking("Bob", 50.0))
    val s = Bank.find("Ann") as Savings
    s.addInterest()
    println(s)
    val c = Bank.find("Bob")!!
    c.withdraw(10.0)
    println(c)
    try {
        c.withdraw(100.0)
    } catch (e: InsufficientFundsException) {
        println("Error: ${e.message}")
    }
    var running = true
    while (running) {
        print("Command: ")
        val input = readLine() ?: ""
        val cmd = Command.values().firstOrNull { it.name == input.uppercase() }
        when (cmd) {
            Command.DEPOSIT -> {
                print("Amount: ")
                val amt = readLine()!!.toDouble()
                s.deposit(amt)
                println("Now ${s.balanceText()}")
            }
            Command.WITHDRAW -> println("Not today")
            Command.SHOW -> Bank.accounts.forEach { println(it) }
            Command.QUIT -> running = false
            null -> println("Unknown command")
        }
    }
    println("Bye")
}
''', ['deposit', '20', 'fly', 'show', 'quit'],
     ['Savings[Ann: 105.00]', 'Checking[Bob: 38.50]', 'Error: Bob cannot withdraw 101.5', 'Command: ', 'Amount: ', 'Now 125.00', 'Command: ', 'Unknown command', 'Command: ', 'Savings[Ann: 125.00]', 'Checking[Bob: 38.50]', 'Command: ', 'Bye']),
    ('kt3 function types, labels and chars', 'kotlin', r'''
fun applyTwice(f: (Int) -> Int, x: Int): Int = f(f(x))

fun total(vararg nums: Int): Int {
    var t = 0
    for (n in nums) t += n
    return t
}

fun greet(name: String, greeting: String = "Hello", punct: String = "!"): String {
    return "$greeting, $name$punct"
}

fun describe(x: Any): String = when (x) {
    is Int -> "int $x"
    is String -> "string of ${x.length}"
    is List<*> -> "list of ${x.size}"
    else -> "something"
}

fun isPrime(n: Int): Boolean {
    if (n < 2) return false
    var d = 2
    while (d * d <= n) {
        if (n % d == 0) return false
        d++
    }
    return true
}

fun main() {
    val square = { x: Int -> x * x }
    println(applyTwice(square, 3))
    println(applyTwice({ it + 10 }, 1))
    println(total(1, 2, 3, 4))
    println(greet("Ann"))
    println(greet("Bob", punct = "?"))
    println(describe(42) + "; " + describe("hey") + "; " + describe(listOf(1, 2)))
    val primes = (1..30).filter { isPrime(it) }
    println("Primes: $primes")
    println("Count > 10: ${primes.count { it > 10 }}, any 29: ${primes.any { it == 29 }}, all odd: ${primes.all { it % 2 == 1 }}")
    val grid = Array(3) { IntArray(3) }
    for (r in 0 until 3) {
        for (c in 0 until 3) {
            grid[r][c] = r * c
        }
    }
    println(grid.map { it.sum() })
    val word = "Kotlin"
    println(word.reversed() + " " + word.uppercase() + " " + word.substring(1, 4) + " " + word[0])
    val letters = word.lowercase().toCharArray()
    var vowels = 0
    for (ch in letters) {
        if (ch in "aeiou") vowels++
    }
    println("vowels=$vowels")
    val sentence = "the quick brown fox"
    val caps = sentence.split(" ").map { it.replaceFirstChar { c -> c.uppercase() } }
    println(caps.joinToString(" "))
    outer@ for (i in 1..3) {
        for (j in 1..3) {
            if (i * j == 4) break@outer
            print("${i * j} ")
        }
    }
    println()
    var k = 0
    do {
        k += 3
    } while (k < 10)
    println("k=$k")
    repeat(3) { i -> print("[$i]") }
    println()
    val names = listOf("zed", "amy", "Bob")
    names.withIndex().forEach { (i, n) -> println("$i: $n") }
    val maybe: String? = null
    println(maybe?.length ?: -1)
    "done".let { println(it.uppercase()) }
    val scores = mapOf("a" to 3, "b" to 7)
    println(scores.values.sum())
    val c = 'a' + 2
    println(c)
    println(('a'..'e').joinToString(""))
}
''', [],
     ['81', '21', '10', 'Hello, Ann!', 'Hello, Bob?', 'int 42; string of 3; list of 2', 'Primes: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]', 'Count > 10: 6, any 29: True, all odd: False', '[0, 3, 6]', 'niltoK KOTLIN otl K', 'vowels=2', 'The Quick Brown Fox', '1 2 3 2 ', 'k=12', '[0][1][2]', '0: zed', '1: amy', '2: Bob', '-1', 'DONE', '10', 'c', 'abcde']),
    ('kt4 a Scanner and arrays', 'kotlin', r'''
import java.util.Scanner

fun main() {
    val sc = Scanner(System.`in`)
    print("How many? ")
    val n = sc.nextInt()
    var total = 0
    for (i in 1..n) {
        print("Number $i: ")
        total += sc.nextInt()
    }
    println("Average: %.2f".format(total.toDouble() / n))
    val scores = IntArray(3) { it * 10 }
    println(scores.joinToString())
}
''', ['3', '4', '5', '9'],
     ['How many? ', 'Number 1: ', 'Number 2: ', 'Number 3: ', 'Average: 6.00', '0, 10, 20']),
    ('sw1 structs, enums and closures', 'swift', r'''
import Foundation

struct Point: CustomStringConvertible {
    var x: Int
    var y: Int
    var description: String { return "(\(x), \(y))" }
    func distance(to other: Point) -> Double {
        let dx = Double(x - other.x), dy = Double(y - other.y)
        return (dx * dx + dy * dy).squareRoot()
    }
    mutating func move(by d: Int) {
        x += d
        y += d
    }
}

enum Grade {
    case pass, merit, distinction, fail
}

func grade(for score: Int) -> Grade {
    switch score {
    case 85...100: return .distinction
    case 70..<85: return .merit
    case 50..<70: return .pass
    default: return .fail
    }
}

func average(_ values: [Double]) -> Double {
    guard !values.isEmpty else { return 0 }
    return values.reduce(0, +) / Double(values.count)
}

var p = Point(x: 1, y: 2)
let q = Point(x: 4, y: 6)
print("p = \(p), q = \(q), distance \(p.distance(to: q))")
p.move(by: 2)
print(p)
let scores = [92, 74, 55, 30]
for s in scores {
    print(s, grade(for: s))
}
let doubled = scores.map { $0 * 2 }.filter { $0 > 100 }
print(doubled)
print(String(format: "%.1f", average([1.5, 2.5, 3.5])))
var counts: [String: Int] = [:]
for word in "the cat and the hat and the bat".split(separator: " ") {
    counts[String(word), default: 0] += 1
}
for key in counts.keys.sorted() {
    print("\(key): \(counts[key]!)")
}
var i = 10
repeat {
    print(i, terminator: " ")
    i -= 3
} while i > 0
print()
for n in stride(from: 0, to: 10, by: 4) {
    print("n=\(n)")
}
let names = ["Zoe", "adam", "Bea"]
let sorted = names.sorted { $0.lowercased() < $1.lowercased() }
print(sorted.joined(separator: ", "))
if let first = sorted.first {
    print("First: \(first.uppercased())")
}
let text = "42"
if let n = Int(text) {
    print("Number \(n * 2)")
} else {
    print("Not a number")
}
''', [],
     ['p = (1, 2), q = (4, 6), distance 5', '(3, 4)', '92 distinction', '74 merit', '55 pass', '30 fail', '[184, 148, 110]', '2.5', 'and: 2', 'bat: 1', 'cat: 1', 'hat: 1', 'the: 3', '10 7 4 1 ', 'n=0', 'n=4', 'n=8', 'adam, Bea, Zoe', 'First: ADAM', 'Number 84']),
    ('sw2 classes, errors and guard', 'swift', r'''
import Foundation

enum ShopError: Error {
    case outOfStock(String)
    case badQuantity
}

enum Size: Int {
    case small = 1, medium, large
}

class Item {
    let name: String
    var price: Double
    var stock: Int

    init(name: String, price: Double, stock: Int) {
        self.name = name
        self.price = price
        self.stock = stock
    }

    func label() -> String {
        return "\(name) @ \(String(format: "%.2f", price))"
    }
}

class SaleItem: Item {
    let percent: Int

    init(name: String, price: Double, stock: Int, percent: Int) {
        self.percent = percent
        super.init(name: name, price: price, stock: stock)
    }

    override func label() -> String {
        return super.label() + " (\(percent)% off)"
    }
}

class Shop {
    var items: [String: Item] = [:]
    var total = 0.0

    func add(_ item: Item) {
        items[item.name] = item
    }

    func buy(_ name: String, qty: Int) throws {
        guard qty > 0 else { throw ShopError.badQuantity }
        guard let item = items[name], item.stock >= qty else {
            throw ShopError.outOfStock(name)
        }
        item.stock -= qty
        total += item.price * Double(qty)
    }
}

let shop = Shop()
shop.add(Item(name: "pen", price: 1.25, stock: 10))
shop.add(SaleItem(name: "bag", price: 20, stock: 2, percent: 10))
for name in shop.items.keys.sorted() {
    print(shop.items[name]!.label())
}
let orders = [("pen", 4), ("bag", 3), ("cap", 1), ("pen", 0)]
for (name, qty) in orders {
    do {
        try shop.buy(name, qty: qty)
        print("Bought \(qty) \(name)")
    } catch ShopError.badQuantity {
        print("Bad quantity for \(name)")
    } catch {
        print("Could not buy \(name)")
    }
}
print("Total: \(String(format: "%.2f", shop.total))")
print("Size:", Size.large.rawValue)
var budget = 0
while true {
    print("Budget? ", terminator: "")
    guard let line = readLine(), let value = Int(line) else {
        print("Numbers only")
        continue
    }
    budget = value
    break
}
switch budget {
case ..<10: print("Tight")
case 10...50: print("Fine")
default: print("Plenty")
}
''', ['lots', '25'],
     ['bag @ 20.00 (10% off)', 'pen @ 1.25', 'Bought 4 pen', 'Could not buy bag', 'Could not buy cap', 'Bad quantity for pen', 'Total: 5.00', 'Size: 3', 'Budget? Numbers only', 'Budget? Fine']),
    ('sw3 protocols and dictionaries', 'swift', r'''
protocol Vehicle {
    var wheels: Int { get }
    func describe() -> String
}

class Car: Vehicle {
    let make: String
    var wheels: Int { return 4 }
    init(make: String) {
        self.make = make
    }
    func describe() -> String {
        return "\(make) car with \(wheels) wheels"
    }
}

class Bike: Vehicle {
    var wheels: Int { 2 }
    func describe() -> String { "bike with \(wheels) wheels" }
}

struct Matrix {
    var rows: [[Int]]
    func total() -> Int {
        var sum = 0
        for row in rows {
            for value in row {
                sum += value
            }
        }
        return sum
    }
}

func apply(_ values: [Int], _ transform: (Int) -> Int) -> [Int] {
    var out: [Int] = []
    for v in values {
        out.append(transform(v))
    }
    return out
}

func isPalindrome(_ word: String) -> Bool {
    let letters = Array(word.lowercased())
    return letters == letters.reversed()
}

let garage: [Vehicle] = [Car(make: "Volvo"), Bike()]
for v in garage {
    print(v.describe())
}
let totalWheels = garage.map { $0.wheels }.reduce(0, +)
print("wheels:", totalWheels)
let m = Matrix(rows: [[1, 2], [3, 4], [5, 6]])
print("matrix total \(m.total())")
let triple = { (x: Int) -> Int in x * 3 }
print(apply([1, 2, 3], triple))
print(apply([4, 5], { $0 - 1 }))
var scores = ["amy": 82, "ben": 91, "cal": 77]
scores["dan"] = 88
let ranked = scores.sorted { $0.value > $1.value }
for (i, entry) in ranked.enumerated() {
    print("\(i + 1). \(entry.key) \(entry.value)")
}
let best = scores.max { a, b in a.value < b.value }
print("best: \(best?.key ?? "none")")
for word in ["Level", "Swift", "noon"] {
    print(word, isPalindrome(word) ? "is" : "is not", "a palindrome")
}
var countdown = 3
while countdown > 0 {
    print(countdown, terminator: "...")
    countdown -= 1
}
print("go!")
let sentence = "the quick brown fox"
let longest = sentence.split(separator: " ").max { $0.count < $1.count } ?? ""
print("longest word: \(longest)")
''', [],
     ['Volvo car with 4 wheels', 'bike with 2 wheels', 'wheels: 6', 'matrix total 21', '[3, 6, 9]', '[3, 4]', '1. ben 91', '2. dan 88', '3. amy 82', '4. cal 77', 'best: ben', 'Level is a palindrome', 'Swift is not a palindrome', 'noon is a palindrome', '3...2...1...go!', 'longest word: quick']),
    ('go1 structs, errors and maps', 'go', r'''
package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
)

type Rect struct {
	W, H float64
}

func (r Rect) Area() float64 {
	return r.W * r.H
}

func (r *Rect) Scale(k float64) {
	r.W *= k
	r.H *= k
}

func divmod(a, b int) (int, int) {
	return a / b, a % b
}

func safeDiv(a, b float64) (float64, error) {
	if b == 0 {
		return 0, fmt.Errorf("cannot divide %v by zero", a)
	}
	return a / b, nil
}

const (
	Low = iota
	Mid
	High
)

func main() {
	r := Rect{W: 2, H: 3}
	fmt.Println("area:", r.Area())
	r.Scale(2)
	fmt.Printf("scaled: %.1f x %.1f = %.1f\n", r.W, r.H, r.Area())
	q, rem := divmod(17, 5)
	fmt.Println(q, rem)
	if v, err := safeDiv(1, 0); err != nil {
		fmt.Println("error:", err)
	} else {
		fmt.Println(v)
	}
	nums := []int{5, 2, 9, 1}
	nums = append(nums, 7)
	sort.Ints(nums)
	fmt.Println(nums, len(nums))
	total := 0
	for _, n := range nums {
		total += n
	}
	fmt.Println("total", total)
	for i := range nums {
		if i%2 == 0 {
			fmt.Print(nums[i], " ")
		}
	}
	fmt.Println()
	ages := map[string]int{"ann": 31, "bob": 25}
	ages["cy"] = 40
	names := make([]string, 0)
	for name := range ages {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		fmt.Printf("%-4s%3d\n", name, ages[name])
	}
	if age, ok := ages["dee"]; !ok {
		fmt.Println("no dee", age == 0)
	}
	fmt.Println(Low, Mid, High)
	switch {
	case total > 20:
		fmt.Println("big")
	case total > 10:
		fmt.Println("medium")
	default:
		fmt.Println("small")
	}
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("Your number: ")
	text, _ := reader.ReadString('\n')
	n, err := strconv.Atoi(strings.TrimSpace(text))
	if err != nil {
		fmt.Println("not a number")
		return
	}
	for i := 1; i <= n; i++ {
		fmt.Println(strings.Repeat("*", i))
	}
}
''', ['3'],
     ['area: 6', 'scaled: 4.0 x 6.0 = 24.0', '3 2', 'error: cannot divide 1 by zero', '[1 2 5 7 9] 5', 'total 24', '1 5 9 ', 'ann  31', 'bob  25', 'cy   40', 'no dee True', '0 1 2', 'big', 'Your number: ', '*', '**', '***']),
    ('go2 interfaces, closures and slices', 'go', r'''
package main

import (
	"fmt"
	"sort"
	"strings"
)

type Shape interface {
	Area() float64
	Name() string
}

type Circle struct {
	R float64
}

type Square struct {
	Side float64
}

func (c Circle) Area() float64 { return 3.0 * c.R * c.R }
func (c Circle) Name() string  { return "circle" }
func (s Square) Area() float64 { return s.Side * s.Side }
func (s Square) Name() string  { return "square" }

type Student struct {
	Name  string
	Score int
}

func counter() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}

func fib(n int) int {
	if n < 2 {
		return n
	}
	return fib(n-1) + fib(n-2)
}

func grade(score int) string {
	switch {
	case score >= 90:
		return "A"
	case score >= 80:
		return "B"
	default:
		return "C"
	}
}

func main() {
	shapes := []Shape{Circle{R: 1}, Square{Side: 2}, Circle{R: 2}}
	total := 0.0
	for _, s := range shapes {
		fmt.Printf("%s %.1f\n", s.Name(), s.Area())
		total += s.Area()
	}
	fmt.Printf("total %.1f\n", total)
	students := []Student{{"Zed", 71}, {"Amy", 95}, {"Bob", 84}}
	sort.Slice(students, func(i, j int) bool {
		return students[i].Score > students[j].Score
	})
	for i, st := range students {
		fmt.Println(i+1, st.Name, st.Score, grade(st.Score))
	}
	next := counter()
	next()
	next()
	fmt.Println("counter:", next())
	fibs := make([]int, 0)
	for i := 0; i < 10; i++ {
		fibs = append(fibs, fib(i))
	}
	fmt.Println(fibs)
	var sb strings.Builder
	for _, w := range strings.Fields("go is fun") {
		sb.WriteString(strings.ToUpper(w[:1]) + w[1:])
	}
	fmt.Println(sb.String())
	grid := [][]int{{1, 2, 3}, {4, 5, 6}}
	sum := 0
	for r := 0; r < len(grid); r++ {
		for c := 0; c < len(grid[r]); c++ {
			sum += grid[r][c]
		}
	}
	fmt.Println("grid sum", sum)
	words := map[string]int{}
	for _, w := range strings.Split("x y x z x y", " ") {
		words[w]++
	}
	fmt.Println(len(words), words["x"], words["y"])
	msg := fmt.Sprintf("%d-%s", 7, "up")
	fmt.Println(msg, strings.Contains(msg, "up"))
}
''', [],
     ['circle 3.0', 'square 4.0', 'circle 12.0', 'total 19.0', '1 Amy 95 A', '2 Bob 84 B', '3 Zed 71 C', 'counter: 3', '[0 1 1 2 3 5 8 13 21 34]', 'GoIsFun', 'grid sum 21', '3 3 2', '7-up True']),
    ('rs1 impl, match and input', 'rust', r'''
use std::collections::HashMap;
use std::fmt;
use std::io;

#[derive(Debug, Clone)]
struct Point {
    x: i32,
    y: i32,
}

impl Point {
    fn new(x: i32, y: i32) -> Self {
        Point { x, y }
    }

    fn dist2(&self, other: &Point) -> i32 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        dx * dx + dy * dy
    }

    fn shift(&mut self, by: i32) {
        self.x += by;
        self.y += by;
    }
}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

enum Shape {
    Circle(f64),
    Rect { w: f64, h: f64 },
}

fn area(s: &Shape) -> f64 {
    match s {
        Shape::Circle(r) => 3.14 * r * r,
        Shape::Rect { w, h } => w * h,
    }
}

fn classify(n: i32) -> &'static str {
    match n {
        i32::MIN..=-1 => "negative",
        0 => "zero",
        1 | 2 | 3 => "small",
        _ => "large",
    }
}

fn fact(n: u64) -> u64 {
    if n <= 1 { 1 } else { n * fact(n - 1) }
}

fn main() {
    let mut p = Point::new(1, 2);
    let q = Point::new(4, 6);
    println!("p = {}, dist2 = {}", p, p.dist2(&q));
    p.shift(3);
    println!("moved: {}", p);
    let shapes = vec![Shape::Circle(1.0), Shape::Rect { w: 2.0, h: 3.5 }];
    let total: f64 = shapes.iter().map(|s| area(s)).sum();
    println!("total area {:.2}", total);
    for n in [-5, 0, 2, 9] {
        println!("{} is {}", n, classify(n));
    }
    println!("5! = {}", fact(5));
    let mut v: Vec<i32> = Vec::new();
    for i in 1..=5 {
        v.push(i * i);
    }
    let evens: Vec<i32> = v.iter().filter(|&&x| x % 2 == 0).cloned().collect();
    println!("{:?} {:?} sum={}", v, evens, v.iter().sum::<i32>());
    let mut counts: HashMap<String, i32> = HashMap::new();
    for w in "a b a c b a".split_whitespace() {
        *counts.entry(w.to_string()).or_insert(0) += 1;
    }
    let mut keys: Vec<&String> = counts.keys().collect();
    keys.sort();
    for k in keys {
        println!("{}: {}", k, counts[k]);
    }
    let mut stack = vec![1, 2, 3];
    while let Some(top) = stack.pop() {
        print!("{} ", top);
    }
    println!();
    let word = "stressed";
    let rev: String = word.chars().rev().collect();
    println!("{} -> {}", word, rev);
    let mut guess = String::new();
    println!("Guess a number:");
    io::stdin().read_line(&mut guess).expect("failed");
    let guess: i32 = match guess.trim().parse() {
        Ok(n) => n,
        Err(_) => -1,
    };
    if guess == 7 {
        println!("right");
    } else {
        println!("wrong: {}", guess);
    }
}
''', ['7'],
     ['p = (1, 2), dist2 = 25', 'moved: (4, 5)', 'total area 10.14', '-5 is negative', '0 is zero', '2 is small', '9 is large', '5! = 120', '[1, 4, 9, 16, 25] [4, 16] sum=55', 'a: 3', 'b: 2', 'c: 1', '3 2 1 ', 'stressed -> desserts', 'Guess a number:', 'right']),
    ('rs2 traits, Option and Result', 'rust', r'''
use std::collections::HashMap;

trait Animal {
    fn name(&self) -> String;
    fn sound(&self) -> String;
    fn speak(&self) -> String {
        format!("{} says {}", self.name(), self.sound())
    }
}

struct Dog {
    name: String,
}

struct Cat {
    name: String,
    lives: u8,
}

impl Animal for Dog {
    fn name(&self) -> String {
        self.name.clone()
    }
    fn sound(&self) -> String {
        String::from("woof")
    }
}

impl Animal for Cat {
    fn name(&self) -> String {
        self.name.clone()
    }
    fn sound(&self) -> String {
        if self.lives > 5 { "meow".to_string() } else { "hiss".to_string() }
    }
}

#[derive(Debug)]
struct Item {
    name: String,
    price: f64,
    qty: u32,
}

fn find_item<'a>(items: &'a [Item], name: &str) -> Option<&'a Item> {
    items.iter().find(|it| it.name == name)
}

fn divide(a: i32, b: i32) -> Result<i32, String> {
    if b == 0 {
        return Err(String::from("divide by zero"));
    }
    Ok(a / b)
}

fn main() {
    let zoo: Vec<Box<dyn Animal>> = vec![
        Box::new(Dog { name: String::from("Rex") }),
        Box::new(Cat { name: "Tom".to_string(), lives: 9 }),
        Box::new(Cat { name: "Old".to_string(), lives: 2 }),
    ];
    for a in zoo.iter() {
        println!("{}", a.speak());
    }
    let mut items = vec![
        Item { name: "pen".to_string(), price: 1.5, qty: 10 },
        Item { name: "book".to_string(), price: 12.0, qty: 2 },
        Item { name: "bag".to_string(), price: 30.25, qty: 1 },
    ];
    items.sort_by(|a, b| b.price.partial_cmp(&a.price).unwrap());
    for it in &items {
        println!("{:<6}{:>8.2} x{}", it.name, it.price, it.qty);
    }
    let value: f64 = items.iter().map(|it| it.price * it.qty as f64).sum();
    println!("stock value {:.2}", value);
    match find_item(&items, "book") {
        Some(it) => println!("found {} at {}", it.name, it.price),
        None => println!("no book"),
    }
    if let Some(it) = find_item(&items, "cap") {
        println!("found {}", it.name);
    } else {
        println!("no cap");
    }
    for (a, b) in [(10, 2), (7, 0)] {
        match divide(a, b) {
            Ok(q) => println!("{} / {} = {}", a, b, q),
            Err(e) => println!("error: {}", e),
        }
    }
    let mut ages: HashMap<&str, u32> = HashMap::new();
    ages.insert("ann", 31);
    ages.insert("bob", 25);
    let oldest = ages.iter().max_by_key(|(_, &age)| age).map(|(name, _)| *name).unwrap();
    println!("oldest {}", oldest);
    let total: u32 = ages.values().sum();
    println!("total age {}", total);
    let squares: Vec<String> = (1..=4).map(|n| (n * n).to_string()).collect();
    println!("{}", squares.join("+"));
    let mut count = 0;
    let mut n = 27u64;
    while n != 1 {
        n = if n % 2 == 0 { n / 2 } else { 3 * n + 1 };
        count += 1;
    }
    println!("collatz steps {}", count);
    let text = "Hello World";
    let upper = text.chars().filter(|c| c.is_uppercase()).count();
    println!("{} capitals, {} letters", upper, text.len());
}
''', [],
     ['Rex says woof', 'Tom says meow', 'Old says hiss', 'bag      30.25 x1', 'book     12.00 x2', 'pen       1.50 x10', 'stock value 69.25', 'found book at 12', 'no cap', '10 / 2 = 5', 'error: divide by zero', 'oldest ann', 'total age 56', '1+4+9+16', 'collatz steps 111', '2 capitals, 11 letters']),
]
