"""Programs told as stories, for the pseudocode box.

The box takes plain English as well as pseudocode (flowchart/parse/story.py
and teller.py read it).  Each story here is read, drawn, and run by the
page's own runner with the answers typed in, and has to print what the
program it tells would print -- which is the only way to say the reading
understood it, rather than that it came out as something.

`has` is lines the retold pseudocode must contain word for word, where how
it was said matters as well as what it does (a Do ... Until, not a While).
"""

# (what it is about, the story, what gets typed, what it prints, lines it must have)
STORIES = [
    ("asking, deciding, and saying so", """
Ask the user for their name and age.
If they are 18 or older, tell them they can vote, otherwise tell them to wait.
Then say goodbye to them by name.
""", ["Ada", "36"], ["You can vote", "Goodbye, Ada"],
     ["Input name", "Input age", "If age >= 18 Then"]),

    ("the same, too young", """
Ask the user for their name and age.
If they are 18 or older, tell them they can vote, otherwise tell them to wait.
""", ["Bo", "12"], ["Wait"], []),

    ("a running total, kept until a nought", """
Keep asking for a number until the number is 0, adding each one to the total.
Then show the total.
""", ["4", "5", "6", "0"], ["15"],
     ["Do", "Until number = 0", "Declare Integer total = 0"]),

    ("two numbers added", """
Get two numbers from the user, add them together and show the result.
""", ["3", "4"], ["7"], ["Set sum = number1 + number2"]),

    ("counting down", """
Count from 10 down to 1 and print each number. Then print "Liftoff!".
""", [], ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1", "Liftoff!"],
     ["For number = 10 To 1 Step -1"]),

    ("the evens, from a loop with a decision in it", """
For each number from 1 to 10, if it is even print it.
""", [], ["2", "4", "6", "8", "10"], ["If number MOD 2 = 0 Then"]),

    ("guessing, with the way out at the top", """
The program asks the user to guess a number between 1 and 10.
While the guess is not 7, tell them to try again and ask for another guess.
When they get it, print "You win!".
""", ["3", "9", "7"], ["Try again", "Try again", "You win!"], ["While guess <> 7"]),

    ("steps under a heading", """
Repeat 3 times:
    ask for a score
    add it to the total
Calculate the average as the total divided by 3.
Display the average.
""", ["70", "80", "90"], ["80"], ["For i = 1 To 3", "Set average = total / 3"]),

    ("a sum said in words, and a decision with three ways", """
Ask the user for the temperature in Celsius.
Convert it to Fahrenheit by multiplying by 9, dividing by 5 and adding 32.
Show the result.
If the temperature is over 30 say "Hot", otherwise if it is under 10 say "Cold", otherwise say "Nice".
""", ["35"], ["95", "Hot"],
     ["Set fahrenheit = (temperature * 9) / 5 + 32", "Else If temperature < 10 Then"]),

    ("a price, a quantity and a discount", """
Ask for the price of the item and the quantity.
Work out the cost by multiplying the price by the quantity.
If the cost is more than 100, take 10 percent off.
Show the cost.
""", ["30", "4"], ["108"], ["Set cost = price * quantity"]),

    ("a word compared", """
Ask the user what their favorite color is.
If the color is blue say "Me too!" otherwise say "Nice choice".
""", ["blue"], ["Me too!"], []),

    ("asking until it is right", """
Keep asking for a password until the user types "secret". Then say welcome.
""", ["open", "sesame", "secret"], ["Welcome"], ['Until password = "secret"']),

    ("a factorial", """
Input a number n.
Set factorial to 1.
For each number from 1 to n, multiply factorial by the number.
Print the factorial.
""", ["5"], ["120"], ["For number = 1 To n"]),

    ("pseudocode written loosely, with its own End If", """
Start
Input score
If score is greater than 90 then display "A"
Else display "B"
End If
Stop
""", ["95"], ["A"], ["If score > 90 Then"]),

    ("a list of steps, one to a line", """
- set the count to 0
- repeat 4 times: increase the count by 2
- print the count
""", [], ["8"], ["Set count = count + 2"]),
]
