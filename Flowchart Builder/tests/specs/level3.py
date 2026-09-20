"""Level 3 -- the program now has parts, and one of the parts is wrong.

Functions that hand nothing back, modules printing the name of what they
were given rather than the thing, a boundary a mark short, a charge band
that swallows every basket.  The fault is no longer on the line you are
looking at: it is in the piece the line called.
"""

PUZZLES = [

    dict(key="z_invoice",
         start="""
Start
Declare Currency amount
Declare Currency net
Declare Currency vat
Declare Currency gross
Declare Integer lines
Declare Integer i
Set net = 0
Display "How many lines on the invoice?"
Input lines
For i = 1 To lines
    Display "Line amount"
    Input amount
    Set net = net + amount
End For
Set vat = tax(net)
Set gross = net + vat
Display "Net: $", net
Display "VAT: $", vat
Display "Total: $", gross
Stop

Function tax(sum)
    Declare Currency worked
    Set worked = sum * 0.2
End Function
""",
         mend="""
Start
Declare Currency amount
Declare Currency net
Declare Currency vat
Declare Currency gross
Declare Integer lines
Declare Integer i
Set net = 0
Display "How many lines on the invoice?"
Input lines
For i = 1 To lines
    Display "Line amount"
    Input amount
    Set net = net + amount
End For
Set vat = tax(net)
Set gross = net + vat
Display "Net: $", net
Display "VAT: $", vat
Display "Total: $", gross
Stop

Function tax(sum)
    Declare Currency worked
    Set worked = sum * 0.2
    Return worked
End Function
""",
         tries=[dict(give=["2", "100.00", "50.00"],
                     want=["How many lines on the invoice?", "Line amount",
                           "Line amount", "Net: $150.00", "VAT: $30.00",
                           "Total: $180.00"])],
         b=dict(
             en="VAT is a fifth of the net. tax() works it out and then "
                "keeps it to itself.",
             de="Die Mehrwertsteuer ist ein Fünftel des Nettobetrags. tax() "
                "rechnet sie aus und behält sie dann für sich.",
             es="El IVA es la quinta parte del neto. tax() lo calcula y "
                "luego se lo queda para sí.",
             fr="La TVA est le cinquième du net. tax() la calcule puis la "
                "garde pour elle.")),

    dict(key="z_rota",
         start="""
Start
Declare String staff
Declare Integer many
Declare Integer day
Display "How many shifts to fill?"
Input many
For day = 1 To many
    Display "Who is on?"
    Input staff
    Call slot(staff, day)
End For
Display "Rota done"
Stop

Module slot(who, when)
    Display "Shift ", when, ": who"
End Module
""",
         mend="""
Start
Declare String staff
Declare Integer many
Declare Integer day
Display "How many shifts to fill?"
Input many
For day = 1 To many
    Display "Who is on?"
    Input staff
    Call slot(staff, day)
End For
Display "Rota done"
Stop

Module slot(who, when)
    Display "Shift ", when, ": ", who
End Module
""",
         tries=[dict(give=["2", "Ali", "Ben"],
                     want=["How many shifts to fill?", "Who is on?",
                           "Shift 1: Ali", "Who is on?", "Shift 2: Ben",
                           "Rota done"])],
         b=dict(
             en="Every shift on the rota is down to somebody called who.",
             de="Jede Schicht im Plan ist jemandem namens who zugeteilt.",
             es="Todos los turnos del cuadrante están asignados a alguien "
                "llamado who.",
             fr="Tous les créneaux du planning sont attribués à quelqu'un "
                "qui s'appelle who.")),

    dict(key="z_grades",
         start="""
Start
Declare Integer mark
Declare Integer i
Declare String grade
For i = 1 To 4
    Display "Enter a mark"
    Input mark
    If mark >= 70 Then
        Set grade = "A"
    Else If mark >= 60 Then
        Set grade = "B"
    Else If mark > 50 Then
        Set grade = "C"
    Else
        Set grade = "Fail"
    End If
    Display mark, " is a ", grade
End For
Stop
""",
         mend="""
Start
Declare Integer mark
Declare Integer i
Declare String grade
For i = 1 To 4
    Display "Enter a mark"
    Input mark
    If mark >= 70 Then
        Set grade = "A"
    Else If mark >= 60 Then
        Set grade = "B"
    Else If mark >= 50 Then
        Set grade = "C"
    Else
        Set grade = "Fail"
    End If
    Display mark, " is a ", grade
End For
Stop
""",
         tries=[dict(give=["70", "60", "50", "49"],
                     want=["Enter a mark", "70 is a A", "Enter a mark",
                           "60 is a B", "Enter a mark", "50 is a C",
                           "Enter a mark", "49 is a Fail"])],
         b=dict(
             en="Fifty is a pass. One mark on this sheet is being failed "
                "that should not be.",
             de="Fünfzig ist bestanden. Eine Note auf diesem Bogen fällt "
                "durch, die es nicht sollte.",
             es="Cincuenta es aprobado. En esta hoja hay una nota que "
                "suspende y no debería.",
             fr="Cinquante, c'est la moyenne. Sur cette feuille, une note "
                "est recalée alors qu'elle ne devrait pas.")),

    dict(key="z_coldest",
         start="""
Start
Declare Integer reading
Declare Integer coldest
Declare Integer i
Set coldest = 0
For i = 1 To 5
    Display "Temperature"
    Input reading
    If reading < coldest Then
        Set coldest = reading
    End If
End For
Display "Coldest: ", coldest
Stop
""",
         mend="""
Start
Declare Integer reading
Declare Integer coldest
Declare Integer i
Display "Temperature"
Input reading
Set coldest = reading
For i = 2 To 5
    Display "Temperature"
    Input reading
    If reading < coldest Then
        Set coldest = reading
    End If
End For
Display "Coldest: ", coldest
Stop
""",
         tries=[dict(give=["12", "15", "9", "20", "11"],
                     want=["Temperature", "Temperature", "Temperature",
                           "Temperature", "Temperature", "Coldest: 9"]),
                dict(give=["3", "1", "4", "1", "5"],
                     want=["Temperature", "Temperature", "Temperature",
                           "Temperature", "Temperature", "Coldest: 1"])],
         b=dict(
             en="Five temperatures, and the coldest of them. Starting the "
                "search at zero means nothing above zero can ever win it.",
             de="Fünf Temperaturen, und die kälteste davon. Wer die Suche "
                "bei null beginnt, lässt nichts über null gewinnen.",
             es="Cinco temperaturas, y la más fría de ellas. Empezar la "
                "búsqueda en cero impide que gane nada por encima de cero.",
             fr="Cinq températures, et la plus froide. Commencer la "
                "recherche à zéro empêche tout ce qui dépasse zéro de "
                "gagner.")),

    dict(key="z_delivery",
         start="""
Start
Declare Currency basket
Declare Currency post
Display "What does the basket come to?"
Input basket
If basket > 0 Then
    Set post = 4.99
Else If basket >= 50 Then
    Set post = 0
Else If basket >= 25 Then
    Set post = 2.99
End If
Display "Basket: $", basket
Display "Postage: $", post
Display "To pay: $", basket + post
Stop
""",
         mend="""
Start
Declare Currency basket
Declare Currency post
Display "What does the basket come to?"
Input basket
If basket >= 50 Then
    Set post = 0
Else If basket >= 25 Then
    Set post = 2.99
Else
    Set post = 4.99
End If
Display "Basket: $", basket
Display "Postage: $", post
Display "To pay: $", basket + post
Stop
""",
         tries=[dict(give=["60.00"], want=["What does the basket come to?",
                                           "Basket: $60.00", "Postage: $0.00",
                                           "To pay: $60.00"]),
                dict(give=["30.00"], want=["What does the basket come to?",
                                           "Basket: $30.00",
                                           "Postage: $2.99",
                                           "To pay: $32.99"]),
                dict(give=["10.00"], want=["What does the basket come to?",
                                           "Basket: $10.00",
                                           "Postage: $4.99",
                                           "To pay: $14.99"])],
         b=dict(
             en="Free over $50, $2.99 over $25, $4.99 otherwise. Every "
                "basket is being charged the full $4.99.",
             de="Ab 50 $ versandfrei, ab 25 $ 2,99 $, sonst 4,99 $. Jedem "
                "Warenkorb werden die vollen 4,99 $ berechnet.",
             es="Gratis a partir de 50 $, 2,99 $ a partir de 25 $, y 4,99 $ "
                "en los demás casos. A todas las cestas se les cobran los "
                "4,99 $ enteros.",
             fr="Gratuit au-dessus de 50 $, 2,99 $ au-dessus de 25 $, 4,99 $ "
                "sinon. Tous les paniers se voient facturer 4,99 $.")),

    dict(key="z_fine",
         start="""
Start
Declare Integer books
Declare Integer i
Declare Integer late
Declare Currency owed
Declare Currency total
Set total = 0
Display "How many books are back?"
Input books
For i = 1 To books
    Display "Days late"
    Input late
    Set owed = fine(late)
    Display "Fine: $", owed
    Set total = total + owed
End For
Display "Total owed: $", total
Stop

Function fine(days)
    Declare Currency due
    If days <= 0 Then
        Return 0
    End If
    Set due = days * 0.25
    Return due
End Function
""",
         mend="""
Start
Declare Integer books
Declare Integer i
Declare Integer late
Declare Currency owed
Declare Currency total
Set total = 0
Display "How many books are back?"
Input books
For i = 1 To books
    Display "Days late"
    Input late
    Set owed = fine(late)
    Display "Fine: $", owed
    Set total = total + owed
End For
Display "Total owed: $", total
Stop

Function fine(days)
    Declare Currency due
    If days <= 0 Then
        Return 0
    End If
    Set due = days * 0.25
    If due > 5 Then
        Set due = 5
    End If
    Return due
End Function
""",
         tries=[dict(give=["2", "4", "30"],
                     want=["How many books are back?", "Days late",
                           "Fine: $1.00", "Days late", "Fine: $5.00",
                           "Total owed: $6.00"]),
                dict(give=["1", "0"],
                     want=["How many books are back?", "Days late",
                           "Fine: $0.00", "Total owed: $0.00"])],
         b=dict(
             en="The library charges 25c a day and never more than $5 on one "
                "book. The month-late one is being charged the lot.",
             de="Die Bibliothek nimmt 25 Cent am Tag und nie mehr als 5 $ "
                "für ein Buch. Beim monatelang überfälligen wird alles "
                "berechnet.",
             es="La biblioteca cobra 25 céntimos al día y nunca más de 5 $ "
                "por un libro. Al que lleva un mes se le cobra todo.",
             fr="La bibliothèque prend 25 centimes par jour et jamais plus "
                "de 5 $ par livre. Celui en retard d'un mois se voit tout "
                "facturer.")),

    dict(key="z_average",
         start="""
Start
Declare Integer n
Declare Integer total
Declare Integer many
Set total = 0
Set many = 0
Display "Scores, 0 to finish"
Input n
While n <> 0
    Set total = total + n
    Set many = many + 1
    Input n
End While
If many > 0 Then
    Display "Average: ", total / (many + 1)
Else
    Display "Nothing to average"
End If
Stop
""",
         mend="""
Start
Declare Integer n
Declare Integer total
Declare Integer many
Set total = 0
Set many = 0
Display "Scores, 0 to finish"
Input n
While n <> 0
    Set total = total + n
    Set many = many + 1
    Input n
End While
If many > 0 Then
    Display "Average: ", total / many
Else
    Display "Nothing to average"
End If
Stop
""",
         tries=[dict(give=["6", "8", "10", "0"],
                     want=["Scores, 0 to finish", "Average: 8"]),
                dict(give=["0"], want=["Scores, 0 to finish",
                                       "Nothing to average"])],
         b=dict(
             en="The 0 that ends the list is not one of the scores, and it "
                "is being counted as one.",
             de="Die 0, die die Liste beendet, ist keiner der Werte -- und "
                "sie wird als einer mitgezählt.",
             es="El 0 que cierra la lista no es una de las puntuaciones, y "
                "se está contando como si lo fuera.",
             fr="Le 0 qui termine la liste n'est pas une note, et il est "
                "compté comme si c'en était une.")),

    dict(key="z_line",
         start="""
Start
Declare Currency price
Declare Integer qty
Display "Price each"
Input price
Display "How many"
Input qty
Display "To pay: $", line(price)
Stop

Function line(each, many)
    Return each * many
End Function
""",
         mend="""
Start
Declare Currency price
Declare Integer qty
Display "Price each"
Input price
Display "How many"
Input qty
Display "To pay: $", line(price, qty)
Stop

Function line(each, many)
    Return each * many
End Function
""",
         tries=[dict(give=["2.50", "4"], want=["Price each", "How many",
                                               "To pay: $10.00"]),
                dict(give=["1.99", "3"], want=["Price each", "How many",
                                               "To pay: $5.97"])],
         b=dict(
             en="line() needs a price and a quantity. It is being handed "
                "the price and left to guess the rest.",
             de="line() braucht einen Preis und eine Menge. Man gibt ihr den "
                "Preis und überlässt ihr den Rest.",
             es="line() necesita un precio y una cantidad. Se le pasa el "
                "precio y se la deja adivinar el resto.",
             fr="line() a besoin d'un prix et d'une quantité. On lui donne "
                "le prix et on la laisse deviner le reste.")),

    dict(key="z_overtime",
         start="""
Start
Declare Real hours
Declare Currency rate
Declare Currency pay
Display "Hours worked"
Input hours
Display "Rate per hour"
Input rate
If hours > 40 Then
    Set pay = hours * rate * 1.5
Else
    Set pay = hours * rate
End If
Display "Pay: $", pay
Stop
""",
         mend="""
Start
Declare Real hours
Declare Currency rate
Declare Currency pay
Display "Hours worked"
Input hours
Display "Rate per hour"
Input rate
If hours > 40 Then
    Set pay = 40 * rate + (hours - 40) * rate * 1.5
Else
    Set pay = hours * rate
End If
Display "Pay: $", pay
Stop
""",
         tries=[dict(give=["45", "10.00"], want=["Hours worked",
                                                 "Rate per hour",
                                                 "Pay: $475.00"]),
                dict(give=["38", "10.00"], want=["Hours worked",
                                                 "Rate per hour",
                                                 "Pay: $380.00"])],
         b=dict(
             en="Time and a half is paid on the hours past 40, not on all of "
                "them.",
             de="Der Zuschlag von 50 Prozent gilt für die Stunden über 40, "
                "nicht für alle.",
             es="La hora y media se paga por las horas que pasan de 40, no "
                "por todas.",
             fr="La majoration de moitié s'applique aux heures au-delà de "
                "40, pas à toutes.")),

    dict(key="z_rooms",
         start="""
Start
Declare Integer room
Declare Integer slot
Declare Integer booked
Declare Integer taken
Set taken = 0
For room = 1 To 3
    For slot = 1 To 4
        Display "Room ", room, " slot ", slot, " -- 1 booked, 0 free"
        Input booked
        If booked = 1 Then
            Set taken = taken + 1
        End If
    End For
End For
Display "Booked: ", taken
Display "Free: ", 10 - taken
Stop
""",
         mend="""
Start
Declare Integer room
Declare Integer slot
Declare Integer booked
Declare Integer taken
Set taken = 0
For room = 1 To 3
    For slot = 1 To 4
        Display "Room ", room, " slot ", slot, " -- 1 booked, 0 free"
        Input booked
        If booked = 1 Then
            Set taken = taken + 1
        End If
    End For
End For
Display "Booked: ", taken
Display "Free: ", 12 - taken
Stop
""",
         tries=[dict(give=["1", "0", "0", "1", "1", "0", "0", "0",
                           "1", "1", "0", "0"],
                     want=["Room 1 slot 1 -- 1 booked, 0 free",
                           "Room 1 slot 2 -- 1 booked, 0 free",
                           "Room 1 slot 3 -- 1 booked, 0 free",
                           "Room 1 slot 4 -- 1 booked, 0 free",
                           "Room 2 slot 1 -- 1 booked, 0 free",
                           "Room 2 slot 2 -- 1 booked, 0 free",
                           "Room 2 slot 3 -- 1 booked, 0 free",
                           "Room 2 slot 4 -- 1 booked, 0 free",
                           "Room 3 slot 1 -- 1 booked, 0 free",
                           "Room 3 slot 2 -- 1 booked, 0 free",
                           "Room 3 slot 3 -- 1 booked, 0 free",
                           "Room 3 slot 4 -- 1 booked, 0 free",
                           "Booked: 5", "Free: 7"])],
         b=dict(
             en="Three rooms with four slots each. The free count is working "
                "from a smaller building than the booking loop is.",
             de="Drei Räume mit je vier Zeiten. Die Zählung der freien geht "
                "von einem kleineren Haus aus als die Buchungsschleife.",
             es="Tres salas con cuatro franjas cada una. El recuento de "
                "libres parte de un edificio más pequeño que el del bucle.",
             fr="Trois salles de quatre créneaux chacune. Le compte des "
                "libres part d'un bâtiment plus petit que la boucle.")),
]
