"""Programs written by hand in each language, for the Code way of working.

The round trip in run.py reads back code the page wrote itself, which is
code in the page's own habits.  Nobody else writes like that.  These are
written the way a first course writes them -- f-strings and printf, a
Scanner called sc, `while True` with a break at the foot, cin >> a >> b,
switch with its cases falling through -- and each is read into pseudocode,
run by the runner with the same answers typed in, and has to print what
the program itself prints.

`want` is what the runner prints for the pseudocode: a question asked on a
line of its own, as a Display does, and numbers the runner's way (212, not
212.0).  Word for word and number for number it is what the program itself
prints -- found by running it, in Python, JavaScript, Java and C#, with the
same answers typed in; C++ had no compiler to hand, and its lines were
worked out from the same program in Java.
"""

# (what it is about, language, the code, what gets typed, what it prints)
CODED = [
    ("temperatures, with a function and an f-string", "python", '''
# Converts temperatures
def to_fahrenheit(c):
    return c * 9 / 5 + 32

def main():
    celsius = float(input("Degrees Celsius? "))
    f = to_fahrenheit(celsius)
    print(f"{celsius} C is {f:.1f} F")
    if f > 90:
        print("Hot!")
    elif f < 32:
        print("Freezing")
    else:
        print("Mild")

main()
''', ["100"], ["Degrees Celsius? ", "100 C is 212 F", "Hot!"]),

    ("asking again until the answer will do", "python", '''
while True:
    n = int(input("A number from 1 to 10: "))
    if 1 <= n <= 10:
        break
    print("Try again")
total = 0
for i in range(1, n + 1):
    total += i
print("Sum up to", n, "is", total)
''', ["12", "0", "4"], ["A number from 1 to 10: ", "Try again", "A number from 1 to 10: ",
                        "Try again", "A number from 1 to 10: ", "Sum up to 4 is 10"]),

    ("a sentinel loop with its test at the top", "python", '''
count = 0
total = 0
while True:
    score = int(input("Score (-1 to stop): "))
    if score < 0:
        break
    count += 1
    total = total + score
if count > 0:
    print("Average:", total / count)
else:
    print("No scores")
''', ["80", "90", "-1"], ["Score (-1 to stop): ", "Score (-1 to stop): ",
                          "Score (-1 to stop): ", "Average: 85"]),

    ("digits, counted with // and %", "python", '''
n = 4096
digits = 0
total = 0
while n > 0:
    total += n % 10
    n //= 10
    digits = digits + 1
print(digits, "digits adding up to", total)
print(2 ** 10, 7 // 2, -7 // 2, 17 % 5)
''', [], ["4 digits adding up to 19", "1024 3 -4 2"]),

    ("a menu, matched case by case", "python", '''
choice = input("Pick a, b or q: ")
match choice:
    case "a":
        print("Apples")
    case "b" | "B":
        print("Bananas")
    case _:
        print("Bye")
''', ["B"], ["Pick a, b or q: ", "Bananas"]),

    ("swapping, a shared counter and a decision in one line", "python", '''
calls = 0

def bump():
    global calls
    calls += 1

a, b = 3, 8
a, b = b, a
bump()
bump()
bigger = a if a > b else b
print("a =", a, "b =", b)
print("bigger:", bigger, "calls:", calls)
word = "flowchart"
print(word.upper(), len(word))
for i in range(10, 0, -3):
    print(i)
''', [], ["a = 8 b = 3", "bigger: 8 calls: 2", "FLOWCHART 9", "10", "7", "4", "1"]),

    ("guarding the input with try", "python", '''
try:
    age = int(input("Age: "))
    print("Next year you will be", age + 1)
except ValueError:
    print("That is not a number")
''', ["41"], ["Age: ", "Next year you will be 42"]),

    ("grades, with a Scanner and printf", "java", '''
import java.util.Scanner;

public class Grades {
    static final int PASS = 60;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("How many scores? ");
        int n = sc.nextInt();
        int total = 0;
        int passed = 0;
        for (int i = 1; i <= n; i++) {
            System.out.print("Score " + i + ": ");
            int s = sc.nextInt();
            total += s;
            if (s >= PASS) {
                passed++;
            }
        }
        double avg = (double) total / n;
        System.out.printf("Average: %.2f%n", avg);
        System.out.println("Passed: " + passed + " of " + n);
        System.out.println("Whole average: " + total / n);
        System.out.println(letter(avg));
        sc.close();
    }

    public static String letter(double avg) {
        if (avg >= 90) {
            return "A";
        } else if (avg >= 80) {
            return "B";
        } else if (avg >= 70) {
            return "C";
        }
        return "F";
    }
}
''', ["3", "70", "85", "50"], ["How many scores? ", "Score 1: ", "Score 2: ", "Score 3: ",
                               "Average: 68.33", "Passed: 2 of 3", "Whole average: 68", "F"]),

    ("a switch that falls through, and a do-while", "java", '''
import java.util.Scanner;

class Days {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int day;
        do {
            System.out.println("Day number (1-7)?");
            day = in.nextInt();
        } while (day < 1 || day > 7);
        switch (day) {
            case 6:
            case 7:
                System.out.println("Weekend");
                break;
            case 5:
                System.out.println("Nearly there");
            default:
                System.out.println("Work day");
        }
        String name = "Ada";
        if (name.equals("Ada") && !(day == 3)) {
            System.out.println(name.toUpperCase() + " " + name.length());
        }
        int x = 17;
        x /= 3;
        x %= 4;
        System.out.println(Math.max(x, 2) + Math.abs(-4));
    }
}
''', ["9", "5"], ["Day number (1-7)?", "Day number (1-7)?", "Nearly there", "Work day",
                  "ADA 3", "6"]),

    ("interest, with ReadLine and composite formatting", "csharp", '''
using System;

namespace Bank
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Write("Balance: ");
            double balance = double.Parse(Console.ReadLine());
            Console.Write("Years: ");
            int years = Convert.ToInt32(Console.ReadLine());
            int year = 0;
            while (year < years)
            {
                balance = balance + balance * 0.1;
                year++;
                Console.WriteLine("Year {0}: {1:F2}", year, balance);
            }
            string word = balance > 1000 ? "rich" : "saving";
            Console.WriteLine("You are " + word);
            Console.WriteLine(Half(years));
        }

        static int Half(int n)
        {
            return n / 2;
        }
    }
}
''', ["1000", "3"], ["Balance: ", "Years: ", "Year 1: 1100.00", "Year 2: 1210.00",
                     "Year 3: 1331.00", "You are rich", "1"]),

    ("a switch on words, and passing by ref", "csharp", '''
using System;

class Shop
{
    static void AddTax(ref double price)
    {
        price = price * 1.5;
    }

    static void Main()
    {
        string item = Console.ReadLine();
        double price = 0;
        switch (item)
        {
            case "tea":
                price = 2;
                break;
            case "cake":
                price = 4;
                break;
            default:
                price = 1;
                break;
        }
        AddTax(ref price);
        Console.WriteLine(item + " costs " + price);
        for (int i = 3; i > 0; i--)
        {
            Console.WriteLine(i + "...");
        }
    }
}
''', ["cake"], ["cake costs 6", "3...", "2...", "1..."]),

    ("cin, cout and a function that changes what it is given", "cpp", '''
#include <iostream>
#include <string>
using namespace std;

const int LIMIT = 3;

void twice(int &n) {
    n = n * 2;
}

int main() {
    int a, b;
    cout << "Two numbers: ";
    cin >> a >> b;
    cout << "Sum: " << a + b << endl;
    cout << "Quotient: " << a / b << endl;
    twice(a);
    cout << "Doubled: " << a << "\\n";
    string name;
    cout << "Name? ";
    cin >> name;
    for (int i = 0; i < LIMIT; ++i) {
        cout << name << " " << i << endl;
    }
    if (a > 10 && b != 0) {
        cout << "big" << endl;
    } else {
        cout << "small" << endl;
    }
    return 0;
}
''', ["7", "2", "Bo"], ["Two numbers: ", "Sum: 9", "Quotient: 3", "Doubled: 14", "Name? ",
                        "Bo 0", "Bo 1", "Bo 2", "big"]),

    ("prompt, template literals and an arrow function", "javascript", '''
// Tip calculator
const RATE = 0.2;
const tipOn = (bill) => bill * RATE;

let bill = Number(prompt("Bill?"));
let people = parseInt(prompt("People?"));
const tip = tipOn(bill);
console.log(`Tip: ${tip.toFixed(2)}`);
console.log("Each pays", (bill + tip) / people);
let i = 0;
while (i < people) {
  i++;
  if (i === 2) {
    console.log("second person");
  }
}
''', ["50", "4"], ["Bill?", "People?", "Tip: 10", "Each pays 15", "second person"]),
]
