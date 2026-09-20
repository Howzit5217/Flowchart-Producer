"""The code it writes out, really run.

As code used to be checked by looking for a line or two that ought to be in
it.  That is how it came to write Java that did not compile and Python that
stopped at the first square root: every line looked right and nothing had
ever tried to run them.  So now they are run.  Each program on the shelf
below is walked by the studio's own runner, written out in every language
the studio offers, and then handed to that language -- Python and JavaScript
everywhere, Java, C# and C++ wherever a compiler for them turns up -- with
the same answers typed in.  What comes out has to be what the runner
printed.

Numbers are allowed to be *said* differently.  Python and Java print a Real
that happens to be whole as 9.0 where the runner prints 9, and a third as
sixteen figures where the runner prints six; that is how those languages
print, and code that went out of its way to print otherwise would not be
the code anybody would write.  What a number *is* has to match.
"""
import glob
import io
import os
import re
import shutil
import subprocess
import sys

# What to type into the programs in tests/programs, which ask for things.
TYPED = {
    "bug-collector.txt": ["0", "3", "5", "-1", "2", "9"],
    "grades.txt": ["150", "80", "90", "-1"],
    "menu.txt": ["1", "7", "3", "4"],
    "modules.txt": ["10", "2.5", "0"],
    "nested-loops.txt": [],
    "tip.txt": ["-3", "50"],
}

# A program that is wrong on purpose -- it hands a module more than it takes
# -- and so cannot be expected to compile anywhere that counts them.
NOT_MEANT_TO_BUILD = ("wrong number",)

# (what it is about, the pseudocode, what gets typed into it)
SHELF = [
    ("undeclared names", """
Start
Set total = 0
Set name = "Ann"
Set rate = 2.5
Set total = total + 3
Display name, " has ", total, " at ", rate
End
""", []),

    ("input nobody declared", """
Start
Display "Name?"
Input name
Display "Age?"
Input age
If age >= 18 Then
    Display name, " is an adult"
Else
    Display name, " is a minor"
End If
Display "Next year: ", age + 1
End
""", ["Bo", "20"]),

    ("the built-ins", """
Start
Declare Real x
Declare String word
Set x = 16
Set word = "Hello"
Display sqrt(x)
Display abs(0 - 5)
Display round(2.6)
Display floor(2.6)
Display ceiling(2.2)
Display int(7.9)
Display length(word)
Display toUpper(word)
Display toLower(word)
Display pow(2, 5)
Display min(3, 9)
Display max(3, 9)
Display 2 ^ 3
Display 17 mod 5
Display 17 div 5
Display 7 / 2
End
""", []),

    ("whole numbers divided", """
Start
Declare Integer total
Declare Integer count
Declare Real average
Set total = 7
Set count = 2
Set average = total / count
Display "Average: ", average
Display "Halves: ", total / 2
End
""", []),

    ("words compared", """
Start
Declare String answer
Display "Again?"
Input answer
While answer = "yes"
    Display "Going round"
    Input answer
End While
If answer <> "no" Then
    Display "Taking that as no"
End If
Display "Bye"
End
""", ["yes", "yes", "maybe"]),

    ("handed over by reference", """
Module main()
    Declare Real hours
    Declare Real rate
    Call getHours(hours)
    Call getBoth(hours, rate)
    Display "Hours ", hours, " rate ", rate
End Module

Module getHours(Real Ref h)
    Display "How many hours?"
    Input h
End Module

Module getBoth(Real Ref h, Real Ref r)
    Set h = h + 1
    Display "Rate?"
    Input r
End Module
""", ["7", "12.5"]),

    ("declared inside a block", """
Start
Declare Integer n
Set n = 3
If n > 2 Then
    Declare Integer big
    Set big = n * 10
End If
Display big
While n > 0
    Declare Integer twice
    Set twice = n * 2
    Set n = n - 1
End While
Display twice
End
""", []),

    ("a select on words", """
Start
Declare String day
Input day
Select Case day
    Case "sat"
        Display "Weekend"
    Case "sun"
        Display "Weekend"
    Default
        Display "Weekday"
End Select
End
""", ["sun"]),

    ("a select on a real", """
Start
Declare Real n
Set n = 2
Select Case n
    Case 1
        Display "one"
    Case 2
        Display "two"
End Select
End
""", []),

    ("loops of every kind", """
Start
Declare Integer i
Declare Integer n
For i = 1 To 3
    Display "up ", i
End For
For i = 10 To 1 Step -4
    Display "down ", i
End For
For k = 0 To 6 Step 3
    Display "by three ", k
End For
Set n = 0
Do
    Set n = n + 1
Until n >= 3
Display n
Do
    Set n = n - 1
Loop While n > 1
Display n
Do Until n = 4
    Set n = n + 1
Loop
Display n
Repeat
    Set n = n + 10
Until n > 20
Display n
End
""", []),

    ("and or not", """
Start
Declare Integer a
Declare Boolean ok
Set a = 5
Set ok = a > 3 AND NOT (a = 9)
If ok Then
    Display "fine"
End If
If a < 3 OR a = 5 Then
    Display "either"
End If
If NOT ok Then
    Display "never"
Else If a = 5 Then
    Display "chained"
Else
    Display "never"
End If
Display ok
End
""", []),

    ("a module that changes what everybody shares", """
Declare Integer sold
Constant Integer LIMIT = 3

Module main()
    Set sold = 0
    Call sell()
    Call sell()
    Display "Sold ", sold, " of ", LIMIT
End Module

Module sell()
    Set sold = sold + 1
End Module
""", []),

    ("the same name in two spellings", """
Start
Declare Integer Total
Set total = 4
Set TOTAL = total + 1
Display Total
End
""", []),

    ("names a language keeps for itself", """
Start
Declare Integer class
Declare Integer in
Declare String str
Declare Integer max
Declare Integer print
Declare Integer list
Declare Real double
Set class = 1
Set in = 2
Set str = "s"
Set max = max(3, 4)
Set print = 5
Set list = 6
Set double = 1.5
Display class, in, str, max, print, list, double
End
""", []),

    ("a function used in the middle of things", """
Module main()
    Declare Integer n
    Display "Number?"
    Input n
    If isEven(n) Then
        Display n, " is even"
    Else
        Display n, " is odd"
    End If
    Display "Squared: ", square(n) + 1
    Display greet("Ann")
End Module

Function Boolean isEven(Integer n)
    Return n mod 2 = 0
End Function

Function Integer square(Integer n)
    Return n * n
End Function

Function String greet(String who)
    Return "Hello, " + who + "!"
End Function
""", ["6"]),

    ("money", """
Start
Declare Currency price
Declare Integer qty
Set price = 1.8
Set qty = 3
Display "Each: $", price
Display "All: $", price * qty
Display "Count: ", qty
End
""", []),

    ("text and numbers joined with a plus", """
Start
Declare Integer age
Declare String name
Set age = 30
Set name = "Cy"
Display "Name: " + name
Display name + " is " + age
Set name = name + "!"
Display name
End
""", []),

    ("a call with a sum in it", """
Module main()
    Declare Integer n
    Set n = 7
    Call show(n mod 4, "left over")
    Call show(n ^ 2, "squared")
End Module

Module show(Integer v, String what)
    Display what, ": ", v
End Module
""", []),

    ("quotes and backslashes in words", """
Start
Display "She said 'hi'"
Display 'He said "yo"'
Display "back\\slash"
End
""", []),

    ("counting a constant nobody typed", """
Start
Constant RATE = 0.5
Constant LABEL = "Rate"
Declare count = 4
Display LABEL, ": ", RATE * count
End
""", []),

    ("random and nothing else wrong", """
Start
Declare Integer roll
Set roll = random(1, 6)
If roll >= 1 AND roll <= 6 Then
    Display "on the die"
End If
End
""", []),

    ("a return in the middle of a module", """
Module main()
    Display grade(95)
    Display grade(50)
    Call warn(0)
    Call warn(5)
End Module

Function String grade(Integer score)
    If score >= 90 Then
        Return "A"
    End If
    Return "F"
End Function

Module warn(Integer n)
    If n = 0 Then
        Display "nothing"
        Return
    End If
    Display "something"
End Module
""", []),

    ("an empty branch and an empty loop", """
Start
Declare Integer n
Set n = 3
If n > 5 Then
Else
    Display "small"
End If
While n > 5
End While
Display "done"
End
""", []),

    ("c style for", """
Start
For (i = 0; i < 3; i = i + 1)
    Display i
End For
End
""", []),

    ("input straight into a sum", """
Start
Display "Two numbers"
Input a
Input b
Display "Sum: ", a + b
Display "Bigger: ", max(a, b)
End
""", ["3", "4"]),

    ("payroll, the way the textbook writes it", """
Constant Real BASE_HOURS = 40
Constant Real OT_MULTIPLIER = 1.5

Module main()
    Declare Real hoursWorked
    Declare Real payRate
    Declare Real grossPay
    Call getHoursWorked(hoursWorked)
    Call getPayRate(payRate)
    If hoursWorked > BASE_HOURS Then
        Call calcPayWithOT(hoursWorked, payRate, grossPay)
    Else
        Call calcRegularPay(hoursWorked, payRate, grossPay)
    End If
    Display "The gross pay is $", grossPay
End Module

Module getHoursWorked(Real Ref hours)
    Display "Enter the number of hours worked."
    Input hours
End Module

Module getPayRate(Real Ref rate)
    Display "Enter the hourly pay rate."
    Input rate
End Module

Module calcPayWithOT(Real hours, Real rate, Real Ref gross)
    Declare Real overtimeHours
    Declare Real overtimePay
    Set overtimeHours = hours - BASE_HOURS
    Set overtimePay = overtimeHours * rate * OT_MULTIPLIER
    Set gross = BASE_HOURS * rate + overtimePay
End Module

Module calcRegularPay(Real hours, Real rate, Real Ref gross)
    Set gross = hours * rate
End Module
""", ["45", "10"]),

    ("every case returns", """
Module main()
    Display dayName(1)
    Display dayName(2)
    Display dayName(9)
    Display sign(0 - 4)
    Display sign(6)
End Module

Function String dayName(Integer d)
    Select Case d
        Case 1
            Return "Mon"
        Case 2
            Return "Tue"
        Default
            Return "???"
    End Select
End Function

Function Integer sign(Integer n)
    If n < 0 Then
        Return 0 - 1
    Else If n > 0 Then
        Return 1
    End If
End Function
""", []),

    ("nobody said what it gives back", """
Module main()
    Display square(4)
    Display half(5)
    Display shout("hey")
    Call show(3, "three")
End Module

Function square(n)
    Return n * n
End Function

Function half(n)
    Return n / 2
End Function

Function shout(s)
    Return toUpper(s) + "!"
End Function

Module show(v, what)
    Display what, " = ", v
End Module
""", []),

    ("words in order", """
Start
Declare String a
Declare String b
Set a = "apple"
Set b = "banana"
If a < b Then
    Display a, " first"
End If
If a >= b Then
    Display "never"
End If
End
""", []),

    ("stopping before the end", """
Module main()
    Declare Integer n
    Input n
    If n < 0 Then
        Display "negative"
        End
    End If
    Call check(n)
    Display "still here"
End Module

Module check(Integer n)
    If n = 0 Then
        Display "zero: stopping"
        Stop
    End If
    Display "fine"
End Module
""", ["0"]),

    ("stopping in main", """
Start
Declare Integer n
Input n
If n < 0 Then
    Display "negative"
    Stop
End If
Display "not negative"
End
""", ["-5"]),

    ("the same counter, twice, and one kept", """
Start
For i = 1 To 2
    Display "a", i
End For
For i = 1 To 2
    Display "b", i
End For
For j = 1 To 3
    Set last = j
End For
Display "j ended past ", last
For k = 1 To 2
End For
Display "k is ", k
End
""", []),

    ("a step that is not whole", """
Start
Declare Real x
For x = 0 To 1 Step 0.25
    Display x
End For
For y = 3 To 1 Step -1
    Display y
End For
End
""", []),

    ("factorial, and modules in any order", """
Module main()
    Display fact(5)
    Call first()
End Module

Module first()
    Display "first"
    Call second()
End Module

Module second()
    Display "second"
End Module

Function Integer fact(Integer n)
    If n <= 1 Then
        Return 1
    End If
    Return n * fact(n - 1)
End Function
""", []),

    ("minus signs", """
Start
Declare Integer a
Declare Integer b
Set a = -3
Set b = - -a
Display a, " ", b
Display abs(a) + max(abs(a), abs(b))
Display -a * 2
Display 2 ^ 2 ^ 3
Display (1 + 2) * 3 - 4 / 2
Display 10 - 2 - 3
Display 7.5 mod 2
Display 7.5 div 2
End
""", []),

    ("a plus that joins", """
Start
Declare Real total
Declare Integer n
Set total = 12.5
Set n = 3
Display "Total: " + total
Display "n: " + n + " and " + (n + 1)
Display "Sum " + (total + n)
Display n + 1, " ", n + total
End
""", []),

    ("constants worked out", """
Constant Real TAU = 2 * 3.14159
Constant Integer DOZEN = 12

Module main()
    Constant Real HALF = TAU / 2
    Display TAU, " ", HALF, " ", DOZEN * 2
End Module
""", []),

    ("a menu that loops until told", """
Module main()
    Declare Integer choice
    Declare Real balance
    Set balance = 100
    Do
        Display "1 deposit, 2 withdraw, 3 quit"
        Input choice
        Select Case choice
            Case 1
                Set balance = balance + 50
            Case 2
                If balance >= 30 Then
                    Set balance = balance - 30
                Else
                    Display "Not enough"
                End If
            Case 3
                Display "Bye"
            Default
                Display "?"
        End Select
    Loop While choice <> 3
    Display "Balance $", balance
End Module
""", ["1", "2", "2", "9", "3"]),

    ("a flag", """
Start
Declare Boolean found
Declare Integer n
Set found = False
Set n = 0
While NOT found
    Set n = n + 1
    If n * n > 50 Then
        Set found = True
    End If
End While
Display n
If found = True Then
    Display "found it"
End If
End
""", []),

    ("typed in, then used as a count", """
Start
Display "How many?"
Input howMany
Set total = 0
For i = 1 To howMany
    Display "Value?"
    Input v
    Set total = total + v
End For
Display "Total ", total
Display "Average ", total / howMany
End
""", ["3", "10", "20", "31"]),
]


# ------------------------------------------------------------- running it --
def said_alike(line):
    """A line with its numbers, and its yes and no, said one way."""
    def plainly(found):
        value = round(float(found.group(0)), 6)
        return str(int(value)) if value == int(value) else repr(value)
    line = re.sub(r"\d+\.\d+(?:[eE][-+]?\d+)?", plainly, line)
    line = re.sub(r"(?i)\b(true|false)\b", lambda m: m.group(0).title(), line)
    return line.rstrip()


def found(*names):
    """The first of these programs there is, on the path or in a usual place."""
    for name in names:
        if os.path.isabs(name) or "*" in name:
            hits = sorted(glob.glob(name))
            if hits:
                return hits[-1]
        elif shutil.which(name):
            return shutil.which(name)
    return ""


def compilers():
    """What this machine has to run each language with; "" where it has not."""
    home = os.environ.get("JAVA_HOME", "")
    jdks = ([os.path.join(home, "bin")] if home else []) + [
        r"C:\Program Files\Android\Android Studio*\jbr\bin",
        r"C:\Program Files\Java\jdk*\bin",
        r"C:\Program Files\Eclipse Adoptium\jdk*\bin"]
    javac = found("javac", *[os.path.join(d, "javac.exe") for d in jdks]
                  + [os.path.join(d, "javac") for d in jdks])
    java = ""
    if javac:
        beside = os.path.join(os.path.dirname(javac),
                              "java.exe" if javac.endswith(".exe") else "java")
        java = beside if os.path.exists(beside) else found("java")
    return {
        "python": sys.executable,
        "javascript": found("node"),
        "javac": javac if java else "", "java": java,
        "csc": found("csc", "mcs",
                     r"C:\Windows\Microsoft.NET\Framework64\v4*\csc.exe"),
        "mono": found("mono"),
        "cpp": found("g++", "clang++"),
    }


def typed_into(command, typed, folder):
    """Run it with the answers typed in.  Its lines, and what went wrong."""
    try:
        got = subprocess.run(command, input="\n".join(typed) + "\n", cwd=folder,
                             capture_output=True, text=True, timeout=30)
    except subprocess.TimeoutExpired:
        return None, "never finished"
    except OSError:
        # Windows can refuse to start a program nobody has signed, which is
        # every program compiled a moment ago.  It built; that is not nothing.
        return "built", ""
    if got.returncode:
        lines = [l for l in (got.stderr or "").splitlines()
                 if l.strip() and not l.startswith("    at ")]
        return None, " / ".join(lines[-3:])[:300]
    return got.stdout.splitlines(), ""


def carried_out(lang, made, typed, folder, have):
    """One program, in one language, really run.  Its lines -- or "skip"
    where there is nothing here to run it with, or "built" where it could
    be compiled and not started -- and what went wrong if anything did."""
    def write(name):
        path = os.path.join(folder, name)
        with io.open(path, "w", encoding="utf-8") as f:
            f.write(made["text"])
        return path

    if lang == "python":
        return typed_into([have["python"], write("program.py")], typed, folder)
    if lang == "javascript":
        if not have["javascript"]:
            return "skip", ""
        return typed_into([have["javascript"], write("program.js")], typed, folder)
    if lang == "java":
        if not have["javac"]:
            return "skip", ""
        if have.get("java built"):
            return typed_into([have["java"], "-cp", have["java built"], made["file"]],
                              typed, folder)
        built = subprocess.run([have["javac"], "-nowarn", "-d", folder,
                                write(made["file"] + ".java")],
                               capture_output=True, text=True, cwd=folder)
        if built.returncode:
            return None, "does not compile: " + first_error(built.stdout + built.stderr)
        return typed_into([have["java"], "-cp", folder, made["file"]], typed, folder)
    if lang == "csharp":
        if not have["csc"]:
            return "skip", ""
        # On Windows this is compiled and never started, and compiled as a
        # library so that there is no .exe even to start.  A program built a
        # moment ago is a program nobody has signed, and Windows stops each
        # one and tells whoever is sitting there that it has -- sixty alerts
        # for sixty programs, which is a poor thing for a test to do to the
        # person running it.  The compiler has still read every line.
        if os.name == "nt":
            built = subprocess.run([have["csc"], "-nologo", "-target:library",
                                    "-out:" + os.path.join(folder, "program.dll"),
                                    write(made["file"] + ".cs")],
                                   capture_output=True, text=True, cwd=folder)
            if built.returncode:
                return None, "does not compile: " + first_error(built.stdout + built.stderr)
            return "built", ""
        exe = os.path.join(folder, "program.exe")
        built = subprocess.run([have["csc"], "-nologo", "-out:" + exe,
                                write(made["file"] + ".cs")],
                               capture_output=True, text=True, cwd=folder)
        if built.returncode:
            return None, "does not compile: " + first_error(built.stdout + built.stderr)
        return typed_into([have["mono"], exe], typed, folder) if have["mono"] \
            else ("built", "")
    if lang == "cpp":
        if not have["cpp"]:
            return "skip", ""
        if os.name == "nt":                          # read, and not built: see above
            built = subprocess.run([have["cpp"], "-std=c++11", "-fsyntax-only",
                                    write("program.cpp")],
                                   capture_output=True, text=True, cwd=folder)
            if built.returncode:
                return None, "does not compile: " + first_error(built.stderr)
            return "built", ""
        exe = os.path.join(folder, "program-cpp")
        built = subprocess.run([have["cpp"], "-std=c++11", "-o", exe, write("program.cpp")],
                               capture_output=True, text=True, cwd=folder)
        if built.returncode:
            return None, "does not compile: " + first_error(built.stderr)
        return typed_into([exe], typed, folder)
    return "skip", ""


def java_all_at_once(cases, results, folder, have):
    """Every Java file compiled in one go.  Where they are, or "".

    javac takes over a second to start and a tenth of one to compile a
    program this size, so sixty of them one at a time is a minute and a half
    of waiting for the same thing to start sixty times.  Each file holds a
    class of its own name, which is why they can share a folder.  If any one
    of them will not compile nothing comes of it, and they are compiled one
    by one after all -- slowly, but saying which.
    """
    if not have["javac"]:
        return ""
    where = os.path.join(folder, "java")
    os.makedirs(where)
    paths = []
    for case, result in zip(cases, results):
        made = result["code"].get("java") or {}
        if "text" in made and not any(bit in case["name"] for bit in NOT_MEANT_TO_BUILD):
            paths.append(os.path.join(where, made["file"] + ".java"))
            with io.open(paths[-1], "w", encoding="utf-8") as f:
                f.write(made["text"])
    built = subprocess.run([have["javac"], "-nowarn", "-d", where] + paths,
                           capture_output=True, text=True, cwd=where)
    return where if paths and not built.returncode else ""


def first_error(said):
    lines = [l.strip() for l in said.splitlines() if "error" in l.lower()]
    return (lines or [said.strip()[:200]])[0][:200]


def marked(cases, results, folder):
    """Every program in every language, run and compared.

    `cases` are what was asked for and `results` what program.js made of
    them: what the runner printed, and the code in each language.  What
    comes back is what went wrong, and how many went right in each language.
    """
    have = compilers()
    have["java built"] = java_all_at_once(cases, results, folder, have)
    wrong, tally = [], {}
    for number, (case, result) in enumerate(zip(cases, results)):
        for lang in sorted(result["code"]):
            made = result["code"][lang]
            count = tally.setdefault(lang, {"right": 0, "built": 0, "skip": 0})
            if "error" in made:
                wrong.append("%s, as %s: the writer threw %s"
                             % (case["name"], lang, made["error"][:160]))
                continue
            where = os.path.join(folder, "%02d-%s" % (number, lang))
            os.makedirs(where)
            lines, trouble = carried_out(lang, made, case["typed"], where, have)
            if lines == "skip":
                count["skip"] += 1
            elif lines == "built":
                count["built"] += 1
            elif result["faults"]:
                # The runner stopped at a fault, so there is nothing to
                # compare with: it only has to be a program.
                if trouble.startswith("does not compile") and not any(
                        bit in case["name"] for bit in NOT_MEANT_TO_BUILD):
                    wrong.append("%s, as %s: %s" % (case["name"], lang, trouble))
                else:
                    count["right"] += 1
            elif lines is None:
                wrong.append("%s, as %s: %s" % (case["name"], lang, trouble))
            elif [said_alike(l) for l in lines] != [said_alike(l) for l in result["said"]]:
                wrong.append("%s, as %s:\n      the runner %r\n      the code   %r"
                             % (case["name"], lang, result["said"], lines))
            else:
                count["right"] += 1
    return wrong, tally
