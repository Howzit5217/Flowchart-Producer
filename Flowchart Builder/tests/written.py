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

# Programs that have to come out as more than one file when they are asked
# for as a file each.  Without this a cut that quietly stopped happening
# would not fail anything: the split is skipped wherever it comes to one
# file, so the checking would simply stop running and say nothing.
MUST_COME_APART = ("cut into parts", "cut part that can end")

# Programs not cut into a file each.  The racing series with its Python
# pasted in under it says falconTimes twice over -- once above the modules,
# the Python's, and once again inside Module main -- which one file holds
# as main's own name standing in front of the other, and files of their
# own cannot: the page says to take the Python out (w_code_tail).
NOT_CUT = ("with its Python pasted in under it",)

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

    # Waits, really waited.  The chart can be run at the program's own
    # timing, so the code has to wait too -- and a wait is the one statement
    # here that some of these languages will not simply let you write:
    # Java's sleep throws something a method has to answer for, and C++
    # needs two headers it would not otherwise have.  Both of those are
    # compiler errors rather than wrong answers, which is exactly what
    # nobody notices by reading.  A hundredth of a second each, because what
    # is being checked is that it compiles and waits, not how long for.
    ("a program that waits", """
Start
Declare Integer n
Display "before"
Wait 10 ms
Set n = 2
Pause 0.01 seconds
Wait n ms
Display "after"
End
""", []),
    # ---- and what only happens once the program is cut into files -------
    # Written out as a file for each chart, the files have to say where
    # they are reading one another from -- and what they say has to be
    # something the program is not already using for something else.
    #
    # `shared` is the file the split keeps what the program shares in, and
    # `exports` is where a JavaScript file puts what the rest may call: a
    # program with names of its own spelled like those has a variable
    # standing exactly where the file needs to put something.
    ("names spelled like the files a split makes", """
Declare Integer shared
Declare Integer exports

Module main()
    Set shared = 2
    Set exports = 3
    Call show()
    Display "now ", shared, " and ", exports
End Module

Module show()
    Set shared = shared + 1
    Set exports = exports + 1
    Display "show sees ", shared, " and ", exports
End Module
""", []),

    # And a module spelled like one of them, which wants a file of its own
    # and cannot have the name it would have asked for.
    ("a module named after the shared file", """
Module main()
    Call shared(2)
    Call shared(7)
End Module

Module shared(Integer n)
    Display "shared got ", n
End Module
""", []),

    # Two modules that call one another.  In one file this is nothing at
    # all -- they are written one above the other and both are there by
    # the time either runs.  In a file each it is the thing that decides
    # how a file brings another in: asked for by name at the top, each
    # would be waiting on a name the other has not written down yet.
    ("two modules that call each other", """
Module main()
    Call even(4)
    Call odd(3)
End Module

Module even(Integer n)
    If n = 0 Then
        Display "even"
    Else
        Call odd(n - 1)
    End If
End Module

Module odd(Integer n)
    If n = 0 Then
        Display "odd"
    Else
        Call even(n - 1)
    End If
End Module
""", []),

    # A Constant worked out rather than written down, in a program of
    # several charts.  Split up, it lands in the shared file -- which is
    # the one file whose top nothing else writes, so it is the one that
    # quietly went out without the import its own first line needed.
    ("a shared constant that has to be worked out", """
Constant Real ROOT = sqrt(16)
Declare Integer n

Module main()
    Set n = 1
    Call show()
    Display "root ", ROOT
End Module

Module show()
    Set n = n + 1
    Display "show ", n, " ", ROOT
End Module
""", []),
    # ---- and a single flow, long enough to be cut into parts ------------
    # A program with no modules in it has no charts to make files out of,
    # so the writer makes some: each top-level loop or decision with real
    # work in it becomes a part of its own, and what two parts both use
    # becomes what the program shares.  That is a rewriting rather than a
    # spelling, and the only thing that says it is the same program is
    # running it -- both ways, and comparing.
    #
    # This one has two parts worth lifting and a third block too small to
    # bother with, names that belong to one part alone (score, band,
    # stars), names two charts share (count, total, biggest), and two For
    # counters that look shared and are not: each part counts with its own.
    ("a single flow cut into parts", """
Start
Declare Integer count
Declare Integer i
Declare Real score
Declare Real total
Declare Real average
Declare Real biggest
Declare Real smallest
Declare Integer passes
Declare Integer fails
Declare Integer stars
Declare Integer band
Declare String who

Display "The marks report"
Display "How many marks are there?"
Input count
Set total = 0
Set biggest = 0
Set smallest = 1000
Set passes = 0
Set fails = 0

For i = 1 To count
    Display "Mark ", i
    Input score
    While score < 0 OR score > 100
        Display "A mark is between 0 and 100."
        Input score
    End While
    Set total = total + score
    If score > biggest Then
        Set biggest = score
    End If
    If score < smallest Then
        Set smallest = score
    End If
    If score >= 40 Then
        Set passes = passes + 1
    Else
        Set fails = fails + 1
    End If
End For

Set average = total / count

For band = 0 To 20 Step 10
    Display "Band ", band
    Set stars = 0
    For i = 1 To count
        Set stars = stars + 1
    End For
    While stars > 0
        Display "*"
        Set stars = stars - 1
    End While
End For

Display "Marks: ", count
Display "Total: ", total
Display "Average: ", average
Display "Highest: ", biggest
Display "Lowest: ", smallest

If passes > fails Then
    Display "More passed than failed."
Else If fails > passes Then
    Display "More failed than passed."
Else
    Display "An even split."
End If

Display "Who is this report for?"
Input who
Display "Prepared for ", who
End
""", ["3", "50", "-4", "30", "95", "Ann"]),

    # The same again, with the things a lifted part can carry that main
    # could: an End, which ends the program from inside a routine rather
    # than only leaving it; a Constant two parts read; and a name declared
    # with a value halfway down, whose value has to go on being set where
    # it stood rather than at the top of a file nothing runs in order.
    ("a cut part that can end the program", """
Start
Constant Real RATE = 1.5
Declare Integer n
Declare Integer i
Declare Integer total
Declare Integer limit
Declare String word

Display "The counter"
Set total = 0
Declare Integer limit = 60
Input n

While n > 0
    Set total = total + n
    If total > limit Then
        Display "Over the limit at ", total
        Display "Stopping there."
        End
    End If
    Display "Running total ", total
    Display "Scaled ", total * RATE
    Input n
End While

For i = 1 To 3
    Display "Line ", i
    Display "still going"
    Display "and again"
    Select Case i
        Case 1
            Display "the first"
        Case 2
            Display "halfway"
        Default
            Display "the last"
    End Select
    Display "end of line ", i
End For

Display "Total ", total
Display "Scaled ", total * RATE
Display "Limit was ", limit

Do
    Set total = total - 1
    Display "counting down ", total
    If total = 2 Then
        Display "nearly there"
    End If
    Display "still ", total * RATE
Until total <= 1

Display "Word?"
Input word
Display "Got ", word
Display "Goodbye"
End
""", ["2", "3", "0", "hello"]),

    # Written the textbook's way (Gaddis) and the messier ways people write
    # it -- Python pasted under the pseudocode, a C for, += -- each one
    # really compiled and run in every language (2026-10-07).
    ('the racing series, the way the textbook writes it', """
// Racing series -- Falcons vs Vipers, eight races.

Constant Integer NUM_RACES = 8

Module main()
    Declare Real falconTimes[NUM_RACES]
    Declare Real viperTimes[NUM_RACES]
    Declare Real time
    Declare Integer index
    Declare Integer raceNumber
    Declare Integer falconWins
    Declare Integer viperWins

    // Part 1: Gather the input
    For index = 0 To NUM_RACES - 1
        Set raceNumber = index + 1

        Display "Enter Falcons time for race ", raceNumber
        Input time
        Set falconTimes[index] = time

        Display "Enter Vipers time for race ", raceNumber
        Input time
        Set viperTimes[index] = time
    End For

    // Print both arrays to check the input
    For index = 0 To NUM_RACES - 1
        Set raceNumber = index + 1
        Display "Race ", raceNumber, " Falcons: ", falconTimes[index], " Vipers: ", viperTimes[index]
    End For

    // Part 2: Winner of each race
    Set falconWins = 0
    Set viperWins = 0

    For index = 0 To NUM_RACES - 1
        Set raceNumber = index + 1

        If falconTimes[index] < viperTimes[index] Then
            Set falconWins = falconWins + 1
            Display "Falcons win race ", raceNumber
        Else If viperTimes[index] < falconTimes[index] Then
            Set viperWins = viperWins + 1
            Display "Vipers win race ", raceNumber
        Else
            Display "Race ", raceNumber, " is a tie!"
        End If
    End For

    // Part 3: Overall winner
    Display "Falcons race wins: ", falconWins
    Display "Vipers race wins: ", viperWins

    If falconWins > viperWins Then
        Display "The Falcons win the series!"
    Else If viperWins > falconWins Then
        Display "The Vipers win the series!"
    Else
        Display "The series ends in a tie!"
    End If
End Module
""", ['12.5', '13.1', '14', '13.2', '11.9', '11.9', '15.25', '15.5', '13', '12', '10.5', '10.75', '16', '16', '14.4', '14.1']),
    ("the racing series, written Python's way", """
# Racing Series

NUM_RACES = 8
falconTimes = [0] * NUM_RACES
viperTimes = [0] * NUM_RACES
time_ = 0
index = 0
raceNumber = 0
falconWins = 0
viperWins = 0
for index in range(0, NUM_RACES):
    raceNumber = index + 1
    print("Enter Falcons time for race " + str(raceNumber))
    time_ = float(input())
    falconTimes[index] = time_
    print("Enter Vipers time for race " + str(raceNumber))
    time_ = float(input())
    viperTimes[index] = time_
for index in range(0, NUM_RACES):
    raceNumber = index + 1
    print("Race " + str(raceNumber) + " Falcons: " + str(falconTimes[index]) + " Vipers: " + str(viperTimes[index]))
falconWins = 0
viperWins = 0
for index in range(0, NUM_RACES):
    raceNumber = index + 1
    if falconTimes[index] < viperTimes[index]:
        falconWins = falconWins + 1
        print("Falcons win race " + str(raceNumber))
    elif viperTimes[index] < falconTimes[index]:
        viperWins = viperWins + 1
        print("Vipers win race " + str(raceNumber))
    else:
        print("Race " + str(raceNumber) + " is a tie!")
print("Falcons race wins: " + str(falconWins))
print("Vipers race wins: " + str(viperWins))
if falconWins > viperWins:
    print("The Falcons win the series!")
elif viperWins > falconWins:
    print("The Vipers win the series!")
else:
    print("The series ends in a tie!")
""", ['12.5', '13.1', '14', '13.2', '11.9', '11.9', '15.25', '15.5', '13', '12', '10.5', '10.75', '16', '16', '14.4', '14.1']),
    ('the racing series, with its Python pasted in under it', """
// Racing series -- Falcons vs Vipers, eight races.

Constant Integer NUM_RACES = 8

Module main()
    Declare Real falconTimes[NUM_RACES]
    Declare Real viperTimes[NUM_RACES]
    Declare Real time
    Declare Integer index
    Declare Integer raceNumber
    Declare Integer falconWins
    Declare Integer viperWins

    // Part 1: Gather the input
    For index = 0 To NUM_RACES - 1
        Set raceNumber = index + 1

        Display "Enter Falcons time for race ", raceNumber
        Input time
        Set falconTimes[index] = time

        Display "Enter Vipers time for race ", raceNumber
        Input time
        Set viperTimes[index] = time
    End For

    // Print both arrays to check the input
    For index = 0 To NUM_RACES - 1
        Set raceNumber = index + 1
        Display "Race ", raceNumber, " Falcons: ", falconTimes[index], " Vipers: ", viperTimes[index]
    End For

    // Part 2: Winner of each race
    Set falconWins = 0
    Set viperWins = 0

    For index = 0 To NUM_RACES - 1
        Set raceNumber = index + 1

        If falconTimes[index] < viperTimes[index] Then
            Set falconWins = falconWins + 1
            Display "Falcons win race ", raceNumber
        Else If viperTimes[index] < falconTimes[index] Then
            Set viperWins = viperWins + 1
            Display "Vipers win race ", raceNumber
        Else
            Display "Race ", raceNumber, " is a tie!"
        End If
    End For

    // Part 3: Overall winner
    Display "Falcons race wins: ", falconWins
    Display "Vipers race wins: ", viperWins

    If falconWins > viperWins Then
        Display "The Falcons win the series!"
    Else If viperWins > falconWins Then
        Display "The Vipers win the series!"
    Else
        Display "The series ends in a tie!"
    End If
End Module# Racing Series

NUM_RACES = 8
falconTimes = [0] * NUM_RACES
viperTimes = [0] * NUM_RACES
time_ = 0
index = 0
raceNumber = 0
falconWins = 0
viperWins = 0
for index in range(0, NUM_RACES):
    raceNumber = index + 1
    print("Enter Falcons time for race " + str(raceNumber))
    time_ = float(input())
    falconTimes[index] = time_
    print("Enter Vipers time for race " + str(raceNumber))
    time_ = float(input())
    viperTimes[index] = time_
for index in range(0, NUM_RACES):
    raceNumber = index + 1
    print("Race " + str(raceNumber) + " Falcons: " + str(falconTimes[index]) + " Vipers: " + str(viperTimes[index]))
falconWins = 0
viperWins = 0
for index in range(0, NUM_RACES):
    raceNumber = index + 1
    if falconTimes[index] < viperTimes[index]:
        falconWins = falconWins + 1
        print("Falcons win race " + str(raceNumber))
    elif viperTimes[index] < falconTimes[index]:
        viperWins = viperWins + 1
        print("Vipers win race " + str(raceNumber))
    else:
        print("Race " + str(raceNumber) + " is a tie!")
print("Falcons race wins: " + str(falconWins))
print("Vipers race wins: " + str(viperWins))
if falconWins > viperWins:
    print("The Falcons win the series!")
elif viperWins > falconWins:
    print("The Vipers win the series!")
else:
    print("The series ends in a tie!")
""", ['12.5', '13.1', '14', '13.2', '11.9', '11.9', '15.25', '15.5', '13', '12', '10.5', '10.75', '16', '16', '14.4', '14.1', '12.5', '13.1', '14', '13.2', '11.9', '11.9', '15.25', '15.5', '13', '12', '10.5', '10.75', '16', '16', '14.4', '14.1']),
    ('an array typed into and averaged', """
// Average of five test scores
Constant Integer SIZE = 5

Module main()
    Declare Integer scores[SIZE]
    Declare Integer index
    Declare Integer total = 0
    Declare Real average

    For index = 0 To SIZE - 1
        Display "Enter score ", index + 1, ":"
        Input scores[index]
    End For

    For index = 0 To SIZE - 1
        Set total = total + scores[index]
    End For

    Set average = total / SIZE
    Display "The total is ", total
    Display "The average is ", average
End Module
""", ['90', '85', '77', '64', '100']),
    ('parallel arrays', """
Module main()
    Constant Integer SIZE = 4
    Declare String names[SIZE]
    Declare Real hours[SIZE]
    Declare Real payRate = 15.5
    Declare Integer i
    Declare Integer best = 0

    For i = 0 To SIZE - 1
        Display "Enter the name of employee ", i + 1
        Input names[i]
        Display "Enter the hours worked by ", names[i]
        Input hours[i]
    End For

    For i = 1 To SIZE - 1
        If hours[i] > hours[best] Then
            Set best = i
        End If
    End For

    Display "Pay for each employee:"
    For i = 0 To SIZE - 1
        Display names[i], ": $", hours[i] * payRate
    End For
    Display "Most hours: ", names[best], " with ", hours[best]
End Module
""", ['Ann Lee', '40', 'Bob', '35.5', 'Cy', '42.25', 'Di', '10']),
    ('a two-dimensional array', """
Constant Integer ROWS = 3
Constant Integer COLS = 4

Module main()
    Declare Integer values[ROWS][COLS]
    Declare Integer row, col
    Declare Integer total

    For row = 0 To ROWS - 1
        For col = 0 To COLS - 1
            Set values[row][col] = (row + 1) * (col + 2)
        End For
    End For

    For row = 0 To ROWS - 1
        Set total = 0
        For col = 0 To COLS - 1
            Set total = total + values[row][col]
            Display values[row][col], " "
        End For
        Display "Row ", row, " total: ", total
    End For
End Module
""", []),
    ('a bubble sort swapping places in an array by reference', """
Module main()
    Constant Integer SIZE = 6
    Declare Integer numbers[SIZE] = 42, 7, 19, 73, 3, 25
    Declare Integer index

    Display "Before:"
    For index = 0 To SIZE - 1
        Display numbers[index]
    End For

    Call bubbleSort(numbers, SIZE)

    Display "After:"
    For index = 0 To SIZE - 1
        Display numbers[index]
    End For
End Module

Module bubbleSort(Integer Ref array[], Integer arraySize)
    Declare Integer maxElement
    Declare Integer index

    For maxElement = arraySize - 1 To 0 Step -1
        For index = 0 To maxElement - 1
            If array[index] > array[index + 1] Then
                Call swap(array[index], array[index + 1])
            End If
        End For
    End For
End Module

Module swap(Integer Ref a, Integer Ref b)
    Declare Integer temp
    Set temp = a
    Set a = b
    Set b = temp
End Module
""", []),
    ('a selection sort of words', """
Module main()
    Constant Integer SIZE = 5
    Declare String names[SIZE] = "Mia", "Zoe", "Abe", "Liv", "Ed"
    Declare Integer i
    Call selectionSort(names, SIZE)
    For i = 0 To SIZE - 1
        Display names[i]
    End For
End Module

Module selectionSort(String Ref array[], Integer arraySize)
    Declare Integer startScan
    Declare Integer minIndex
    Declare String minValue
    Declare Integer index
    Declare String temp

    For startScan = 0 To arraySize - 2
        Set minIndex = startScan
        Set minValue = array[startScan]
        For index = startScan + 1 To arraySize - 1
            If array[index] < minValue Then
                Set minValue = array[index]
                Set minIndex = index
            End If
        End For
        Set temp = array[minIndex]
        Set array[minIndex] = array[startScan]
        Set array[startScan] = temp
    End For
End Module
""", []),
    ('a binary search, its middle a whole number', """
Module main()
    Constant Integer SIZE = 8
    Declare Integer values[SIZE] = 2, 5, 9, 14, 21, 30, 44, 57
    Declare Integer target
    Declare Integer position

    Display "Enter a value to search for:"
    Input target
    Set position = binarySearch(values, target, SIZE)
    If position == -1 Then
        Display target, " was not found."
    Else
        Display target, " was found at position ", position
    End If

    Set position = binarySearch(values, 22, SIZE)
    Display "22 is at ", position
End Module

Function Integer binarySearch(Integer array[], Integer value, Integer arraySize)
    Declare Integer first = 0
    Declare Integer last = arraySize - 1
    Declare Integer position = -1
    Declare Boolean found = False
    Declare Integer middle

    While (NOT found) AND (first <= last)
        Set middle = (first + last) / 2
        If array[middle] == value Then
            Set found = True
            Set position = middle
        Else If array[middle] > value Then
            Set last = middle - 1
        Else
            Set first = middle + 1
        End If
    End While
    Return position
End Function
""", ['30']),
    ('functions handed Reals', """
// Payroll with overtime
Constant Real BASE_HOURS = 40
Constant Real OT_MULTIPLIER = 1.5

Module main()
    Declare String name
    Declare Real hoursWorked, payRate, grossPay

    Display "Enter the employee's name."
    Input name
    Display "Enter the number of hours worked."
    Input hoursWorked
    Display "Enter the hourly pay rate."
    Input payRate

    If hoursWorked > BASE_HOURS Then
        Set grossPay = calcPayWithOT(hoursWorked, payRate)
    Else
        Set grossPay = calcRegularPay(hoursWorked, payRate)
    End If

    Display "The gross pay for ", name, " is $", grossPay
End Module

Function Real calcPayWithOT(Real hours, Real rate)
    Declare Real overtimeHours, overtimePay
    Set overtimeHours = hours - BASE_HOURS
    Set overtimePay = overtimeHours * rate * OT_MULTIPLIER
    Return BASE_HOURS * rate + overtimePay
End Function

Function Real calcRegularPay(Real hours, Real rate)
    Return hours * rate
End Function
""", ['Pat Kim', '45', '20.5']),
    ('input checked in three kinds of loop', """
Module main()
    Declare Integer score
    Declare Real price
    Declare String answer

    Display "Enter a test score (0-100):"
    Input score
    While score < 0 OR score > 100
        Display "ERROR: The score must be 0 to 100. Try again:"
        Input score
    End While
    Display "Score accepted: ", score

    Do
        Display "Enter a price above zero:"
        Input price
    While price <= 0
    Display "Price: ", price

    Do
        Display "Type yes or no:"
        Input answer
    Until answer == "yes" OR answer == "no"
    Display "You said ", answer
End Module
""", ['-5', '150', '88', '0', '-2', '9.99', 'maybe', 'yes']),
    ('a select on numbers and on words', """
Module main()
    Declare Integer month
    Declare String grade
    Declare Integer i

    For i = 1 To 4
        Display "Enter a month number:"
        Input month
        Select month
            Case 1:
                Display "January"
            Case 2:
                Display "February"
            Case 3:
                Display "March"
            Default:
                Display "Some other month"
        End Select
    End For

    Set grade = "B"
    Select grade
        Case "A":
            Display "Excellent"
        Case "B":
            Display "Good"
        Default:
            Display "Keep trying"
    End Select
End Module
""", ['1', '3', '12', '2']),
    ("the textbook's words functions", """
Module main()
    Declare String first, last, full
    Declare Integer count
    Declare Integer i

    Display "First name?"
    Input first
    Display "Last name?"
    Input last
    Set full = first & " " & last
    Display "Full name: ", full
    Display "Length: ", length(full)
    Display "Upper: ", toUpper(full)
    Display "Lower: ", toLower(full)
    Display "First three: ", substring(full, 0, 3)
    If contains(full, "an") Then
        Display "It contains an"
    End If
    Set count = 0
    For i = 0 To length(full) - 1
        If full[i] == "a" OR full[i] == "A" Then
            Set count = count + 1
        End If
    End For
    Display "Number of a's: ", count
End Module
""", ['Ana', 'Nolan']),
    ('Ref parameters of three kinds', """
Module main()
    Declare Integer x = 5
    Declare Integer y = 9
    Declare Real total = 0
    Display "Before: ", x, " ", y
    Call swap(x, y)
    Display "After: ", x, " ", y
    Call addTo(total, 2.5)
    Call addTo(total, 4)
    Display "Total: ", total
    Call getNumber(x)
    Display "You typed ", x
End Module

Module swap(Integer Ref a, Integer Ref b)
    Declare Integer temp
    Set temp = a
    Set a = b
    Set b = temp
End Module

Module addTo(Real Ref sum, Real amount)
    Set sum = sum + amount
End Module

Module getNumber(Integer Ref num)
    Display "Enter a number:"
    Input num
End Module
""", ['42']),
    ('counting down, by threes and by a quarter', """
Module main()
    Declare Integer i
    Declare Real x
    For i = 10 To 0 Step -2
        Display i
    End For
    For i = 1 To 9 Step 3
        Display "i = ", i
    End For
    For x = 0 To 1 Step 0.25
        Display x
    End For
    Display "After the loop i is ", i
End Module
""", []),
    ('arrays given their values, handed to functions', """
Constant Integer MONTHS = 12

Module main()
    Declare Integer days[MONTHS] = 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    Declare String names[MONTHS] = "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    Declare Integer index
    For index = 0 To MONTHS - 1
        Display names[index], " has ", days[index], " days."
    End For
    Display "Total days: ", getTotal(days, MONTHS)
    Display "Longest month index: ", findMax(days, MONTHS)
End Module

Function Integer getTotal(Integer array[], Integer arraySize)
    Declare Integer total = 0
    Declare Integer i
    For i = 0 To arraySize - 1
        Set total = total + array[i]
    End For
    Return total
End Function

Function Integer findMax(Integer array[], Integer size)
    Declare Integer best = 0
    Declare Integer i
    For i = 1 To size - 1
        If array[i] > array[best] Then
            Set best = i
        End If
    End For
    Return best
End Function
""", []),
    ('recursion', """
Module main()
    Declare Integer n
    For n = 0 To 6
        Display n, "! = ", factorial(n), "  fib = ", fib(n)
    End For
    Call countdown(3)
End Module

Function Integer factorial(Integer n)
    If n == 0 Then
        Return 1
    Else
        Return n * factorial(n - 1)
    End If
End Function

Function Integer fib(Integer n)
    If n < 2 Then
        Return n
    End If
    Return fib(n - 1) + fib(n - 2)
End Function

Module countdown(Integer n)
    If n > 0 Then
        Display n
        Call countdown(n - 1)
    Else
        Display "Liftoff!"
    End If
End Module
""", []),
    ("a program written Python's way", """
total = 0
count = int(input())
for i in range(count):
    n = float(input())
    total = total + n
    if n > 10:
        print("big one")
    elif n > 5:
        print("medium one")
    else:
        print("small one")
print("total", total)
avg = total / count
print("average", avg)
word = input()
if word == "yes":
    print("ok")
""", ['3', '12.5', '7', '1', 'yes']),
    ('a Python loop inside a module that ends with End Module', """
Module main()
    Declare Integer i
    Declare Integer total = 0
    for i in range(1, 4):
        total = total + i
        print(i)
    Display "Total is ", total
    If total > 5 Then
        Display "more than five"
    End If
End Module
""", []),
    ("money said the textbook's way, and a tab", """
Module main()
    Declare Real amounts[3] = 3.5, 10, 2.257
    Declare Integer i
    Declare Real sum = 0
    For i = 0 To 2
        Set sum = sum + amounts[i]
        Display i, Tab, amounts[i]
    End For
    Display "Sum: ", sum
    Display "Formatted: ", currencyFormat(sum)
End Module
""", []),
    ('words to numbers and back', """
Module main()
    Declare String text = "123"
    Declare Integer n
    Declare Real r
    Declare String back
    Set n = stringToInteger(text)
    Set r = stringToReal("4.5")
    Set back = integerToString(n + 1)
    Display n + 1
    Display r * 2
    Display back, "!"
    If isInteger("77") Then
        Display "77 is an integer"
    End If
End Module
""", []),
    ('an insertion sort', """
Module main()
    Constant Integer SIZE = 7
    Declare Integer values[SIZE] = 9, 4, 7, 1, 8, 2, 6
    Declare Integer i
    Call insertionSort(values, SIZE)
    For i = 0 To SIZE - 1
        Display values[i]
    End For
End Module

Module insertionSort(Integer Ref array[], Integer arraySize)
    Declare Integer unsortedValue
    Declare Integer scan
    Declare Integer index
    For index = 1 To arraySize - 1
        Set unsortedValue = array[index]
        Set scan = index
        While scan > 0 AND array[scan - 1] > unsortedValue
            Set array[scan] = array[scan - 1]
            Set scan = scan - 1
        End While
        Set array[scan] = unsortedValue
    End For
End Module
""", []),
    ('adding on with +=, -= and Next', """
Declare Integer total = 0
Declare Integer i
For i = 1 To 4
    total += i
Next i
Display total
Set total -= 3
Display total
""", []),
    ('a for written the C way', """
Declare Integer sum = 0
for (i = 0; i < 5; i++)
    sum = sum + i
end for
print sum
""", []),
    ('a list appended to the Python way', """
scores = []
for i in range(4):
    s = int(input())
    scores.append(s)
total = 0
for s in scores:
    total = total + s
print("Total:", total)
print("Average:", total / len(scores))
best = max(scores)
print("Best:", best)
if 100 in scores:
    print("someone got 100")
""", ['70', '100', '85', '91']),
    ('a two-dimensional array given its values in a row', """
Constant Integer ROWS = 2
Constant Integer COLS = 3

Module main()
    Declare Integer grid[ROWS][COLS] = 1, 2, 3, 4, 5, 6
    Declare Integer r, c
    Declare Integer total = 0
    For r = 0 To ROWS - 1
        For c = 0 To COLS - 1
            Set total = total + grid[r][c]
        End For
    End For
    Display "Total: ", total
    Display "Middle of the second row: ", grid[1][1]
End Module
""", []),
    ('append joining two words', """
Module main()
    Declare String first = "Grace"
    Declare String last = "Hopper"
    Declare String full
    Set full = append(first, " ")
    Set full = append(full, last)
    Display full
    Display toUpper(full)
    Display "Starts with G: ", substring(full, 0, 1) == "G"
End Module
""", []),
    ('a password checked letter by letter', """
Module main()
    Declare String password
    Declare Integer upper = 0
    Declare Integer lower = 0
    Declare Integer digits = 0
    Declare Integer i
    Display "Enter a password:"
    Input password
    For i = 0 To length(password) - 1
        If isUpper(password[i]) Then
            Set upper = upper + 1
        Else If isLower(password[i]) Then
            Set lower = lower + 1
        Else If isDigit(password[i]) Then
            Set digits = digits + 1
        End If
    End For
    Display "Uppercase: ", upper
    Display "Lowercase: ", lower
    Display "Digits: ", digits
    If length(password) >= 8 AND upper > 0 AND lower > 0 AND digits > 0 Then
        Display "Valid password"
    Else
        Display "Invalid password"
    End If
End Module
""", ['Secret123']),
    ('words compared letting capitals go, and exactly', """
Module main()
    Declare String answer
    Declare Integer k
    For k = 1 To 3
        Display "Continue?"
        Input answer
        If answer = "yes" Then
            Display "Going on"
        Else If answer == "NO" Then
            Display "Exactly NO"
        Else
            Display "Stopping"
        End If
    End For
End Module
""", ['YES', 'NO', 'no']),
    ('an array of flags', """
Module main()
    Constant Integer SIZE = 10
    Declare Boolean isPrime[SIZE]
    Declare Integer i, j
    For i = 2 To SIZE - 1
        Set isPrime[i] = True
    End For
    For i = 2 To SIZE - 1
        If isPrime[i] Then
            For j = i * 2 To SIZE - 1 Step i
                Set isPrime[j] = False
            End For
        End If
    End For
    For i = 0 To SIZE - 1
        If isPrime[i] Then
            Display i, " is prime"
        End If
    End For
End Module
""", []),
    ('a board of words, in rows', """
Module main()
    Declare String board[3][3] = "X", "O", "X", " ", "X", "O", "O", " ", "X"
    Declare Integer r, c
    Declare String line
    For r = 0 To 2
        Set line = ""
        For c = 0 To 2
            Set line = line + board[r][c]
            If c < 2 Then
                Set line = line + "|"
            End If
        End For
        Display line
    End For
    If board[0][0] == board[1][1] AND board[1][1] == board[2][2] Then
        Display board[0][0], " wins on the diagonal"
    End If
End Module
""", []),
    ('a two-dimensional array handed to functions', """
Constant Integer ROWS = 3
Constant Integer COLS = 2

Module main()
    Declare Real sales[ROWS][COLS] = 1.5, 2.5, 3, 4, 5.25, 6
    Display "Total sales: ", total(sales)
    Call showRow(sales, 1)
End Module

Function Real total(Real table[][])
    Declare Real sum = 0
    Declare Integer r, c
    For r = 0 To ROWS - 1
        For c = 0 To COLS - 1
            Set sum = sum + table[r][c]
        End For
    End For
    Return sum
End Function

Module showRow(Real table[][], Integer row)
    Declare Integer c
    For c = 0 To COLS - 1
        Display "Row ", row, " col ", c, ": ", table[row][c]
    End For
End Module
""", []),
    ('whole numbers divided into a whole number', """
Module main()
    Declare Integer a = 7, b = 2
    Declare Integer q
    Declare Real r
    Set q = a / b
    Set r = a / b
    Display "q = ", q
    Display "r = ", r
    Set q = (a + b) / 2
    Display "midpoint = ", q
    Set q = -7 / 2
    Display "minus = ", q
End Module
""", []),
    ('an array the whole program shares', """
Constant Integer SIZE = 4
Declare Integer counts[SIZE]

Module main()
    Call tally(2)
    Call tally(2)
    Call tally(0)
    Call show()
End Module

Module tally(Integer which)
    Set counts[which] = counts[which] + 1
End Module

Module show()
    Declare Integer i
    For i = 0 To SIZE - 1
        Display i, ": ", counts[i]
    End For
End Module
""", []),
    ('words changed by reference', """
Module main()
    Declare String name = "ada"
    Call capitalize(name)
    Display name
    Display greeting(name, 3)
End Module

Module capitalize(String Ref word)
    Set word = toUpper(substring(word, 0, 1)) + substring(word, 1, length(word))
End Module

Function String greeting(String who, Integer times)
    Declare String out = ""
    Declare Integer i
    For i = 1 To times
        Set out = out + "Hi " + who + "! "
    End For
    Return out
End Function
""", []),
    ('words put in order', """
Module main()
    Declare String a, b, temp
    Display "Two words:"
    Input a
    Input b
    If a > b Then
        Set temp = a
        Set a = b
        Set b = temp
    End If
    Display "In order: ", a, ", ", b
    If a < "m" Then
        Display a, " comes before m"
    End If
End Module
""", ['pear', 'apple'])
]


# ------------------------------------------------------------- running it --
def said_alike(line):
    """A line with its numbers, and its yes and no, said one way."""
    def plainly(found):
        value = round(float(found.group(0)), 6)
        return str(int(value)) if value == int(value) else repr(value)
    line = re.sub(r"\d+\.\d+(?:[eE][-+]?\d+)?", plainly, line)
    # -0 is nought: Python, Java and JavaScript print the sign the runner
    # leaves off (a "-" before a nought is let go on both sides, so that the
    # words "Kiwi -" before a 0 still match)
    line = re.sub(r"-(?=0(?![\d.]))", "", line)
    line = re.sub(r"(?i)\b(true|false)\b", lambda m: m.group(0).title(), line)
    return line.rstrip()


R_A_NUMBER = re.compile(r"\d+(?:\.\d+)?(?:[eE][-+]?\d+)?")


def lines_alike(got, wanted):
    """The same lines, said one way (said_alike) -- and where the words are
    the same and only a number differs, the same number to a millionth of
    it: 3323293056960.100098 in C++ is 3323293056960.1006 to the runner,
    the one double written out to more places, and C# on .NET Framework
    prints fifteen figures where the runner prints all of them."""
    if len(got) != len(wanted):
        return False
    return all(said_alike(a) == said_alike(b) or numbers_alike(said_alike(a), said_alike(b)) or
               numbers_alike(a, b) for a, b in zip(got, wanted))


def numbers_alike(a, b):
    """The same words, and numbers the same to a millionth of them (and a
    whole number exactly): 2.25179981368525E+15 is 2251799813685248."""
    if R_A_NUMBER.sub("#", a) != R_A_NUMBER.sub("#", b):
        return False
    for x, y in zip(R_A_NUMBER.findall(a), R_A_NUMBER.findall(b)):
        if x == y:
            continue
        # two whole numbers are the same number or they are not
        if not any(c in x + y for c in ".eE"):
            return False
        x, y = float(x), float(y)
        if abs(x - y) > 1e-6 * max(1.0, abs(x), abs(y)):
            return False
    return True


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
    cpp = found("g++", "clang++")
    return {
        "python": sys.executable,
        "javascript": found("node"),
        "javac": javac if java else "", "java": java,
        "csc": found("csc", "mcs",
                     r"C:\Windows\Microsoft.NET\Framework64\v4*\csc.exe"),
        "mono": found("mono"),
        "powershell": found("powershell") if os.name == "nt" else "",
        "cpp": cpp or ("zig" if zig_there() else ""),
        # the command that compiles C++: g++ or clang++, or -- where neither
        # is -- the clang inside the ziglang package (pip install ziglang)
        "cppcmd": [cpp] if cpp else [sys.executable, "-m", "ziglang", "c++"],
    }


def zig_there():
    """Is the ziglang package, a C++ compiler in a pip package, installed?"""
    try:
        import importlib.util
        return importlib.util.find_spec("ziglang") is not None
    except (ImportError, ValueError):
        return False


# The C++ the page writes leans on C++14 (a lambda taking auto), which every
# compiler of the last ten years takes, and is checked against C++17.
CPP_STD = "-std=c++17"

# A C# program compiled as a library, run without an .exe: PowerShell loads
# it and calls its Main, with what is typed handed to it as PowerShell's
# own input.  Nothing new is started for Windows to stop.
CS_RUN = ("$a=[Reflection.Assembly]::LoadFile('{dll}'); "
          "$t=$a.GetTypes() | Where-Object {{ $_.GetMethod('Main',[Reflection.BindingFlags]'Static,Public,NonPublic') }} "
          "| Select-Object -First 1; "
          "$m=$t.GetMethod('Main',[Reflection.BindingFlags]'Static,Public,NonPublic'); "
          "try {{ if ($m.GetParameters().Length) {{ [void]$m.Invoke($null, @(,[string[]]@())) }} "
          "else {{ [void]$m.Invoke($null, $null) }} }} "
          "catch {{ [Console]::Error.WriteLine($_.Exception.InnerException); exit 3 }}")


def cs_ran(have, dll, typed, folder):
    """The library just built, run by PowerShell -- or "built" with nothing to run it."""
    if not have.get("powershell"):
        return "built", ""
    return typed_into([have["powershell"], "-NoProfile", "-NonInteractive", "-Command",
                       CS_RUN.format(dll=dll)], typed, folder)


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
    return unasked(got.stdout).splitlines(), ""


def unasked(said):
    """What a program printed, less the questions it asked out loud.

    The runner asks with a box on the tape, which is not something printed;
    the code asks in words -- "Enter bugs: " -- so that somebody running it
    in a terminal knows it is waiting.  Typed in by hand, the Enter after the
    answer ends that line.  Piped in, as here, nothing echoes it, and
    whatever is printed next lands on the end of the question.  So the
    questions go before the lines are split, not after.
    """
    from flowchart.words.lookup import WORDS
    ask = re.escape(WORDS["en"]["code_ask"]).replace(re.escape("{name}"),
                                                     r"[A-Za-z_]\w*")
    return re.sub(ask, "", said)


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
            return cs_ran(have, os.path.join(folder, "program.dll"), typed, folder)
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
        # built and run: a native program starts on Windows without a word
        exe = os.path.join(folder, "program-cpp" + (".exe" if os.name == "nt" else ""))
        built = subprocess.run(have["cppcmd"] + [CPP_STD, "-w", "-o", exe, write("program.cpp")],
                               capture_output=True, text=True, cwd=folder)
        if built.returncode:
            return None, "does not compile: " + first_error(built.stderr)
        return typed_into([exe], typed, folder)
    return "skip", ""


def spread_out(lang, files, typed, folder, have):
    """The same program cut into a file for each chart, really run.

    The one big file has been run just above; this runs the other way of
    writing it out, where every chart is a file of its own and the files
    reach one another by name -- shared.total in Python, Shared.total in
    Java, an include in C++.  That is the half of the split a reading
    cannot check: whether what the files say about each other is true.

    Same answers back as carried_out.  The first file is the one to start:
    it holds main.
    """
    paths = []
    for one in files:
        path = os.path.join(folder, one["file"] + "." + one["ext"])
        with io.open(path, "w", encoding="utf-8") as f:
            f.write(one["text"])
        paths.append(path)
    ending = lambda what: [p for p in paths if p.endswith(what)]

    if lang == "python":
        return typed_into([have["python"], paths[0]], typed, folder)
    if lang == "javascript":
        if not have["javascript"]:
            return "skip", ""
        return typed_into([have["javascript"], paths[0]], typed, folder)
    if lang == "java":
        if not have["javac"]:
            return "skip", ""
        built = subprocess.run([have["javac"], "-nowarn", "-d", folder] + paths,
                               capture_output=True, text=True, cwd=folder)
        if built.returncode:
            return None, "does not compile: " + first_error(built.stdout + built.stderr)
        return typed_into([have["java"], "-cp", folder, files[0]["file"]], typed, folder)
    if lang == "csharp":
        if not have["csc"]:
            return "skip", ""
        # Compiled and not started on Windows, for the reason carried_out
        # gives: a program built a moment ago is one nobody has signed.
        if os.name == "nt":
            built = subprocess.run([have["csc"], "-nologo", "-target:library",
                                    "-out:" + os.path.join(folder, "program.dll")]
                                   + ending(".cs"),
                                   capture_output=True, text=True, cwd=folder)
            if built.returncode:
                return None, "does not compile: " + first_error(built.stdout + built.stderr)
            return cs_ran(have, os.path.join(folder, "program.dll"), typed, folder)
        exe = os.path.join(folder, "program.exe")
        built = subprocess.run([have["csc"], "-nologo", "-out:" + exe] + ending(".cs"),
                               capture_output=True, text=True, cwd=folder)
        if built.returncode:
            return None, "does not compile: " + first_error(built.stdout + built.stderr)
        return typed_into([have["mono"], exe], typed, folder) if have["mono"]             else ("built", "")
    if lang == "cpp":
        if not have["cpp"]:
            return "skip", ""
        exe = os.path.join(folder, "program-cpp" + (".exe" if os.name == "nt" else ""))
        built = subprocess.run(have["cppcmd"] + [CPP_STD, "-w", "-o", exe] + ending(".cpp"),
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
    # the files named in a list javac reads, not on the line itself: two
    # hundred paths are past what one Windows command line holds
    listed = os.path.join(where, "files.txt")
    with io.open(listed, "w", encoding="utf-8") as f:
        f.write("\n".join('"%s"' % p.replace("\\", "/") for p in paths))
    built = subprocess.run([have["javac"], "-nowarn", "-d", where, "@" + listed],
                           capture_output=True, text=True, cwd=where)
    return where if paths and not built.returncode else ""


def first_error(said):
    lines = [l.strip() for l in said.splitlines() if "error" in l.lower()]
    return (lines or [said.strip()[:200]])[0][:200]


def as_listed(said, case, lang):
    """What the runner printed, the way a language with no tuples prints it:
    a program read in from Python prints (3, 4), and written out in Java it
    prints the list it has become, [3, 4]."""
    if not case.get("tuples") or lang == "python":
        return said
    return [re.sub(r"\(([^()]*,[^()]*)\)", r"[\1]", line) for line in said]


def marked(cases, results, folder):
    """Every program in every language, run and compared.

    `cases` are what was asked for and `results` what program.js made of
    them: what the runner printed, and the code in each language.  What
    comes back is what went wrong, and how many went right in each language.
    """
    have = compilers()
    have["java built"] = java_all_at_once(cases, results, folder, have)
    wrong, tally = [], {}

    def judged(case, lang, how, lines, trouble, result, count):
        """What one run of one program in one language came to."""
        name = case["name"] + (", in a file each" if how else "")
        if lines == "skip":
            count["skip"] += 1
        elif lines == "built":
            count["built"] += 1
        elif result["faults"]:
            # The runner stopped at a fault, so there is nothing to
            # compare with: it only has to be a program.
            if trouble.startswith("does not compile") and not any(
                    bit in case["name"] for bit in NOT_MEANT_TO_BUILD):
                wrong.append("%s, as %s: %s" % (name, lang, trouble))
            else:
                count["right"] += 1
        elif lines is None:
            wrong.append("%s, as %s: %s" % (name, lang, trouble))
        elif not lines_alike(lines, as_listed(result["said"], case, lang)):
            wrong.append("%s, as %s:\n      the runner %r\n      the code   %r"
                         % (name, lang, result["said"], lines))
        else:
            count["right"] += 1

    # Compiling is most of the time this takes, and every program waits on
    # its own compiler and nothing else, so they are run several at a time;
    # what each came to is then marked in order, as it always was.
    import concurrent.futures

    def both(number, case, result, lang):
        made = result["code"][lang]
        if "error" in made:
            return None, None
        where = os.path.join(folder, "%02d-%s" % (number, lang))
        os.makedirs(where)
        one = carried_out(lang, made, case["typed"], where, have)
        # And the same program cut into a file for each of its charts.
        # One chart comes back as the one file that has just been run, so
        # there is nothing more to do with that one.
        spread = (result.get("apart") or {}).get(lang)
        if isinstance(spread, dict) or not spread or len(spread) < 2 or \
                any(bit in case["name"] for bit in NOT_CUT):
            return one, None
        apart = os.path.join(folder, "%02d-%s-apart" % (number, lang))
        os.makedirs(apart)
        return one, spread_out(lang, spread, case["typed"], apart, have)

    jobs = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for number, (case, result) in enumerate(zip(cases, results)):
            for lang in sorted(result["code"]):
                jobs.append((case, result, lang, pool.submit(both, number, case, result, lang)))
        for case, result, lang, job in jobs:
            made = result["code"][lang]
            count = tally.setdefault(lang, {"right": 0, "built": 0, "skip": 0,
                                            "apart": 0})
            if "error" in made:
                wrong.append("%s, as %s: the writer threw %s"
                             % (case["name"], lang, made["error"][:160]))
                continue
            one, other = job.result()
            judged(case, lang, "", one[0], one[1], result, count)
            spread = (result.get("apart") or {}).get(lang)
            if isinstance(spread, dict):
                wrong.append("%s, as %s in a file each: the writer threw %s"
                             % (case["name"], lang, spread.get("error", "")[:160]))
                continue
            if not spread or len(spread) < 2 or any(bit in case["name"] for bit in NOT_CUT):
                if any(bit in case["name"] for bit in MUST_COME_APART):
                    wrong.append("%s, as %s: asked for a file each and came "
                                 "out as one" % (case["name"], lang))
                continue
            many = {"right": 0, "built": 0, "skip": 0}
            judged(case, lang, "apart", other[0], other[1], result, many)
            if many["right"] or many["built"]:
                count["apart"] += 1
    return wrong, tally
