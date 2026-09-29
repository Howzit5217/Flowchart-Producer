"""The exam boards' pseudocode -- AQA, OCR and Cambridge -- run as written.

Each is read (flowchart/parse/boards.py), run by the studio's own runner and
has to print what is under it; run.py puts them on RUNS, so each is also
written out in every language and run there, read back in from that code,
and never taken for a story.
"""

BOARDS = [
    ('AQA: arrows, USERINPUT, ENDFOR, REPEAT, SUBROUTINE', """
total ← 0
FOR i ← 1 TO 5
    total ← total + i
ENDFOR
OUTPUT total
name ← USERINPUT
IF LEN(name) > 3 THEN
    OUTPUT 'long'
ELSE IF name = 'Bo' THEN
    OUTPUT 'Bo!'
ELSE
    OUTPUT 'short'
ENDIF
count ← 0
REPEAT
    count ← count + 1
UNTIL count = 3
OUTPUT count
WHILE count > 0
    count ← count - 1
ENDWHILE
arr ← [3, 1, 2]
OUTPUT arr[0] + arr[2]
OUTPUT 7 DIV 2
OUTPUT 7 MOD 2
SUBROUTINE double(x)
    RETURN x * 2
ENDSUBROUTINE
OUTPUT double(4)
""", ['Anna'],
     ['15', 'long', '3', '5', '3', '1', '8'] + [{"key": "r_done"}], None),

    ('AQA: records, FOR IN, SUBSTRING, POSITION, recursion', """
# AQA: records, FOR IN, SUBSTRING, POSITION, subroutines, WHILE NOT
RECORD Car
    make : String
    engineSize : Real
ENDRECORD
myCar ← Car('Ford', 1.8)
OUTPUT myCar.make
cars ← ['Mini', 'Golf', 'Polo']
FOR name IN cars
    OUTPUT name
ENDFOR
word ← 'computing'
OUTPUT SUBSTRING(3, 5, word)
OUTPUT POSITION(word, 'p')
OUTPUT LEN(word)
OUTPUT STRING_TO_INT('41') + 1
OUTPUT INT_TO_STRING(5) + '5'
OUTPUT CHAR_TO_CODE('a')
OUTPUT CODE_TO_CHAR(98)
found ← False
i ← 0
WHILE NOT found AND i < LEN(cars)
    IF cars[i] = 'Golf' THEN
        found ← True
    ELSE
        i ← i + 1
    ENDIF
ENDWHILE
OUTPUT i
SUBROUTINE factorial(n)
    IF n ≤ 1 THEN
        RETURN 1
    ENDIF
    RETURN n * factorial(n - 1)
ENDSUBROUTINE
OUTPUT factorial(5)
SUBROUTINE show(msg)
    OUTPUT '>> ' + msg
ENDSUBROUTINE
show('done')
a ← 7
IF a ≠ 7 THEN
    OUTPUT 'no'
ELSE IF a ≥ 7 THEN
    OUTPUT 'seven'
ENDIF
""", [],
     ['Ford', 'Mini', 'Golf', 'Polo', 'put', '3', '9', '42', '55', '97', 'b', '1', '120', '>> done', 'seven'] + [{"key": "r_done"}], None),

    ('OCR: print(), input(), .length, switch, procedures', """
total = 0
for i = 1 to 5
    total = total + i
next i
print(total)
name = input("Name?")
if name.length > 3 then
    print("long")
elseif name == "Bo" then
    print("Bo!")
else
    print("short")
endif
count = 0
do
    count = count + 1
until count == 3
print(count)
while count > 0
    count = count - 1
endwhile
switch count:
    case 0:
        print("zero")
    default:
        print("other")
endswitch
function double(x)
    return x * 2
endfunction
procedure greet(n)
    print("Hi " + n)
endprocedure
print(double(4))
greet("Ann")
print(str(7 DIV 2) + " " + str(7 MOD 2))
print(name.substring(0, 2))
""", ['Anna'],
     ['15', 'Name?', 'long', '3', 'zero', '8', 'Hi Ann', '3 1', 'An'] + [{"key": "r_done"}], None),

    ('OCR: arrays, string methods, do until', """
// OCR: arrays, string methods, switch on text, global, do until
array names[3]
names[0] = "Ann"
names[1] = "Bob"
names[2] = "Cy"
for i = 0 to names.length - 1
    print(names[i].upper)
next i
word = "Programming"
print(word.left(3) + word.right(3))
print(word.length)
print(word.lower)
print(ASC("A") + 1)
print(CHR(67))
total = int("5") + float("2.5")
print(total)
choice = "b"
switch choice:
    case "a":
        print("apple")
    case "b":
        print("banana")
    default:
        print("?")
endswitch
n = 0
do
    n = n + 2
until n >= 7
print(n)
function square(x)
    return x * x
endfunction
print(square(6))
if n > 5 and not (n == 9) then
    print("between")
elseif n == 9 then
    print("nine")
else
    print("small")
endif
""", [],
     ['ANN', 'BOB', 'CY', 'Proing', '11', 'programming', '66', 'C', '7.5', 'banana', '8', '36', 'between'] + [{"key": "r_done"}], None),

    ('Cambridge: DECLARE, CASE OF, THEN on its own line', """
DECLARE Total : INTEGER
DECLARE Name : STRING
Total ← 0
FOR Index ← 1 TO 5
    Total ← Total + Index
NEXT Index
OUTPUT Total
INPUT Name
IF LENGTH(Name) > 3
    THEN
        OUTPUT "long"
    ELSE
        OUTPUT "short"
ENDIF
CASE OF Total
    15 : OUTPUT "fifteen"
    OTHERWISE : OUTPUT "other"
ENDCASE
REPEAT
    Total ← Total - 5
UNTIL Total <= 0
OUTPUT Total
FUNCTION Double(X : INTEGER) RETURNS INTEGER
    RETURN X * 2
ENDFUNCTION
PROCEDURE Greet(N : STRING)
    OUTPUT "Hi ", N
ENDPROCEDURE
OUTPUT Double(4)
CALL Greet("Ann")
OUTPUT MID(Name, 1, 2)
OUTPUT 7 DIV 2, " ", 7 MOD 2
""", ['Anna'],
     ['15', 'long', 'fifteen', '0', '8', 'Hi Ann', 'An', '3 1'] + [{"key": "r_done"}], None),

    ('Cambridge: arrays from 1, a grid, TYPE, BYREF, CASE ranges', """
// Cambridge: arrays from 1, a 2D grid, records, BYREF, CASE ranges
DECLARE Scores : ARRAY[1:5] OF INTEGER
DECLARE Grid : ARRAY[1:3, 1:3] OF INTEGER
DECLARE Index, Total : INTEGER
CONSTANT Bonus = 2
TYPE Student
    DECLARE Name : STRING
    DECLARE Mark : INTEGER
ENDTYPE
DECLARE Pupil : Student
FOR Index ← 1 TO 5
    Scores[Index] ← Index * 10
NEXT Index
Total ← 0
FOR Index ← 1 TO 5
    Total ← Total + Scores[Index]
NEXT Index
OUTPUT "Total: ", Total
FOR Index ← 1 TO 3
    Grid[Index, Index] ← Index
NEXT Index
OUTPUT Grid[2, 2] + Grid[3, 3]
Pupil.Name ← "Ravi"
Pupil.Mark ← 67
OUTPUT Pupil.Name & " got " & NUM_TO_STR(Pupil.Mark + Bonus)
CASE OF Pupil.Mark
    90 TO 100 : OUTPUT "A"
    70 TO 89 : OUTPUT "B"
    50, 60, 67 : OUTPUT "C"
    OTHERWISE : OUTPUT "U"
ENDCASE
PROCEDURE Swap(BYREF X : INTEGER, BYREF Y : INTEGER)
    DECLARE Temp : INTEGER
    Temp ← X
    X ← Y
    Y ← Temp
ENDPROCEDURE
FUNCTION Largest(A : INTEGER, B : INTEGER) RETURNS INTEGER
    IF A > B
        THEN
            RETURN A
        ELSE
            RETURN B
    ENDIF
ENDFUNCTION
DECLARE P, Q : INTEGER
P ← 3
Q ← 9
CALL Swap(P, Q)
OUTPUT P, " ", Q
OUTPUT Largest(P, Q)
DECLARE Word : STRING
Word ← "Flowchart"
OUTPUT LEFT(Word, 4), " ", RIGHT(Word, 5), " ", MID(Word, 3, 2)
OUTPUT UCASE("a"), LCASE("B"), TO_UPPER("mix"), LENGTH(Word)
OUTPUT ASC("A"), " ", CHR(66), " ", STR_TO_NUM("12") + 1
OUTPUT INT(7.8), " ", DIV(17, 5), " ", MOD(17, 5), " ", ROUND(3.14159, 2)
IF Total ≥ 150 AND NOT (P ≠ 9)
    THEN
        OUTPUT "yes"
ENDIF
""", [],
     ['Total: 150', '5', 'Ravi got 69', 'C', '9 3', '9', 'Flow chart ow', 'AbMIX9', '65 B 13', '7 3 2 3.14', 'yes'] + [{"key": "r_done"}], None),

]


# And the pseudocode's own additions that came with them: Exit While, Break
# and Exit For leave the loop they are in -- an Exit inside a Case of a
# Select inside a Do as well, which a switch would have swallowed.
HOUSE = [
    ("Exit While, Break and Exit For leave their loop", """
Start
Declare Integer n
n = 0
While True
    n = n + 1
    If n * n > 50 Then
        Exit While
    End If
    Display n
End While
Display "Stopped at ", n
For i = 1 To 10
    If i = 4 Then
        Break
    End If
    Display i
End For
found = False
For Each w In ["a", "bb", "ccc"]
    If length(w) = 2 Then
        found = True
        Exit For
    End If
End For
Display found
k = 0
Do
    k = k + 1
    Select Case k
        Case 3
            Exit Do
        Case Else
            Display "k is ", k
    End Select
Loop While k < 10
Display "Done at ", k
End
""", [],
     ['1', '2', '3', '4', '5', '6', '7', 'Stopped at 8', '1', '2', '3', 'True', 'k is 1', 'k is 2', 'Done at 3'] + [{"key": "r_done"}], None),
]
