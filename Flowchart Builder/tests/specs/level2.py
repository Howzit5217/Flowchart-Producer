"""Level 2 -- a loop, and something wrong with the way it goes round.

A counter that never moves, a total wiped clean every time, a question
asked once for seven answers.  The programs are twenty-odd lines: long
enough that the fault is no longer the only thing on the page.
"""

PUZZLES = [

    dict(key="z_queue",
         start="""
Start
Declare Integer waiting
Declare Integer serving
Set serving = 1
Display "How many are waiting?"
Input waiting
While serving <= waiting
    Display "Now serving number ", serving
End While
Display "Queue cleared"
Stop
""",
         mend="""
Start
Declare Integer waiting
Declare Integer serving
Set serving = 1
Display "How many are waiting?"
Input waiting
While serving <= waiting
    Display "Now serving number ", serving
    Set serving = serving + 1
End While
Display "Queue cleared"
Stop
""",
         tries=[dict(give=["3"], want=["How many are waiting?",
                                       "Now serving number 1",
                                       "Now serving number 2",
                                       "Now serving number 3",
                                       "Queue cleared"])],
         b=dict(
             en="The deli counter calls each waiting number in turn. It is "
                "stuck calling the first one for ever.",
             de="Die Theke ruft jede wartende Nummer der Reihe nach auf. Sie "
                "bleibt für immer bei der ersten hängen.",
             es="El mostrador llama a cada número en espera por turno. Se ha "
                "quedado llamando al primero para siempre.",
             fr="Le comptoir appelle chaque numéro en attente à son tour. Il "
                "reste bloqué sur le premier pour toujours.")),

    dict(key="z_basket",
         start="""
Start
Declare Currency price
Declare Currency total
Declare Integer item
Display "Ring up five items"
For item = 1 To 5
    Set total = 0
    Input price
    Set total = total + price
End For
Display "Total: $", total
Stop
""",
         mend="""
Start
Declare Currency price
Declare Currency total
Declare Integer item
Set total = 0
Display "Ring up five items"
For item = 1 To 5
    Input price
    Set total = total + price
End For
Display "Total: $", total
Stop
""",
         tries=[dict(give=["1.20", "3.50", "0.99", "2.00", "4.31"],
                     want=["Ring up five items", "Total: $12.00"])],
         b=dict(
             en="Five items go through the till and it charges for the last "
                "one only. The running total is being wiped every time.",
             de="Fünf Artikel gehen über die Kasse, und sie berechnet nur "
                "den letzten. Die Zwischensumme wird jedes Mal gelöscht.",
             es="Pasan cinco artículos por la caja y solo cobra el último. "
                "El total acumulado se borra cada vez.",
             fr="Cinq articles passent en caisse et elle ne facture que le "
                "dernier. Le total est remis à zéro à chaque fois.")),

    dict(key="z_temps",
         start="""
Start
Declare Integer reading
Declare Integer total
Declare Integer day
Set total = 0
Display "Type the temperature for each of the seven days"
Input reading
For day = 1 To 7
    Set total = total + reading
End For
Display "Average: ", total / 7
Stop
""",
         mend="""
Start
Declare Integer reading
Declare Integer total
Declare Integer day
Set total = 0
Display "Type the temperature for each of the seven days"
For day = 1 To 7
    Input reading
    Set total = total + reading
End For
Display "Average: ", total / 7
Stop
""",
         tries=[dict(give=["10", "12", "14", "16", "18", "20", "22"],
                     want=["Type the temperature for each of the seven days",
                           "Average: 16"])],
         b=dict(
             en="Seven days of temperatures, averaged. It asks for one "
                "reading and then counts it seven times.",
             de="Sieben Tage Temperaturen, gemittelt. Es fragt einen Wert ab "
                "und zählt ihn dann siebenmal.",
             es="Siete días de temperaturas, promediadas. Pide una lectura y "
                "luego la cuenta siete veces.",
             fr="Sept jours de températures, moyennés. Il demande une seule "
                "mesure puis la compte sept fois.")),

    dict(key="z_payslip",
         start="""
Start
Declare Currency pay
Declare Currency total
Declare Integer week
Set total = 0
Display "Four weeks of pay"
For week = 1 To 4
    Input pay
    Set total = total + pay
    Display "Four week total: $", total
End For
Stop
""",
         mend="""
Start
Declare Currency pay
Declare Currency total
Declare Integer week
Set total = 0
Display "Four weeks of pay"
For week = 1 To 4
    Input pay
    Set total = total + pay
End For
Display "Four week total: $", total
Stop
""",
         tries=[dict(give=["300.00", "310.50", "295.25", "328.25"],
                     want=["Four weeks of pay",
                           "Four week total: $1234.00"])],
         b=dict(
             en="The payslip shows one figure: what four weeks came to. This "
                "one prints a line every week on the way there.",
             de="Die Abrechnung zeigt eine Zahl: was vier Wochen ergeben "
                "haben. Diese druckt unterwegs jede Woche eine Zeile.",
             es="La nómina muestra una cifra: lo que suman cuatro semanas. "
                "Esta imprime una línea por cada semana del camino.",
             fr="La fiche de paie montre un chiffre : le total de quatre "
                "semaines. Celle-ci imprime une ligne par semaine.")),

    dict(key="z_pin",
         start="""
Start
Declare Integer pin
Declare Integer tries
Set tries = 0
Do
    Display "Enter your PIN"
    Input pin
    Set tries = tries + 1
Until pin = 4321
If pin = 4321 Then
    Display "Card unlocked"
Else
    Display "Card kept"
End If
Stop
""",
         mend="""
Start
Declare Integer pin
Declare Integer tries
Set tries = 0
Do
    Display "Enter your PIN"
    Input pin
    Set tries = tries + 1
Until pin = 4321 Or tries = 3
If pin = 4321 Then
    Display "Card unlocked"
Else
    Display "Card kept"
End If
Stop
""",
         tries=[dict(give=["1111", "4321"],
                     want=["Enter your PIN", "Enter your PIN",
                           "Card unlocked"]),
                dict(give=["1111", "2222", "3333"],
                     want=["Enter your PIN", "Enter your PIN",
                           "Enter your PIN", "Card kept"])],
         b=dict(
             en="A cash machine gives three goes at the PIN and then keeps "
                "the card. This one asks for ever.",
             de="Ein Geldautomat gibt drei Versuche für die PIN und behält "
                "dann die Karte. Dieser fragt endlos weiter.",
             es="Un cajero da tres intentos para el PIN y luego se queda la "
                "tarjeta. Este pregunta sin parar.",
             fr="Un distributeur laisse trois essais pour le code puis garde "
                "la carte. Celui-ci demande sans fin.")),

    dict(key="z_seats",
         start="""
Start
Declare Integer row
Declare Integer seat
For row = 1 To 3
    For seat = 1 To 3
        Display "Row ", row, " seat ", seat
    End For
End For
Stop
""",
         mend="""
Start
Declare Integer row
Declare Integer seat
For row = 1 To 3
    For seat = 1 To 4
        Display "Row ", row, " seat ", seat
    End For
End For
Stop
""",
         tries=[dict(give=[], want=[
             "Row 1 seat 1", "Row 1 seat 2", "Row 1 seat 3", "Row 1 seat 4",
             "Row 2 seat 1", "Row 2 seat 2", "Row 2 seat 3", "Row 2 seat 4",
             "Row 3 seat 1", "Row 3 seat 2", "Row 3 seat 3", "Row 3 seat 4"])],
         b=dict(
             en="The little screen has three rows of four seats. One seat in "
                "every row is never labelled.",
             de="Der kleine Saal hat drei Reihen zu je vier Plätzen. In jeder "
                "Reihe wird ein Platz nie beschriftet.",
             es="La sala pequeña tiene tres filas de cuatro butacas. En cada "
                "fila hay una butaca que nunca se numera.",
             fr="La petite salle a trois rangées de quatre places. Dans "
                "chaque rangée, une place n'est jamais numérotée.")),

    dict(key="z_stock",
         start="""
Start
Declare Integer stock
Declare Integer sold
Set stock = 20
Display "How many sold today?"
Input sold
Set stock = stock - sold
While stock > 20
    Display "Reorder"
    Set stock = stock + 10
End While
Display "Stock now: ", stock
Stop
""",
         mend="""
Start
Declare Integer stock
Declare Integer sold
Set stock = 20
Display "How many sold today?"
Input sold
Set stock = stock - sold
While stock < 10
    Display "Reorder"
    Set stock = stock + 10
End While
Display "Stock now: ", stock
Stop
""",
         tries=[dict(give=["15"], want=["How many sold today?", "Reorder",
                                        "Stock now: 15"]),
                dict(give=["2"], want=["How many sold today?",
                                       "Stock now: 18"])],
         b=dict(
             en="The shelf starts at 20. Below 10 it should reorder ten at a "
                "time, and the test it uses can never be true.",
             de="Das Regal beginnt bei 20. Unter 10 soll es zehn Stück "
                "nachbestellen; seine Bedingung wird nie wahr.",
             es="La estantería empieza con 20. Por debajo de 10 debe reponer "
                "de diez en diez, y su condición nunca puede cumplirse.",
             fr="Le rayon démarre à 20. En dessous de 10 il doit recommander "
                "par dix, et sa condition ne peut jamais être vraie.")),

    dict(key="z_shifts",
         start="""
Start
Declare Integer day
Declare Integer hours
Declare Integer weekend
Set weekend = 0
Display "Hours worked on each of the seven days"
For day = 1 To 7
    Input hours
    If day mod 6 = 0 Then
        Set weekend = weekend + hours
    End If
End For
Display "Weekend hours: ", weekend
Stop
""",
         mend="""
Start
Declare Integer day
Declare Integer hours
Declare Integer weekend
Set weekend = 0
Display "Hours worked on each of the seven days"
For day = 1 To 7
    Input hours
    If day >= 6 Then
        Set weekend = weekend + hours
    End If
End For
Display "Weekend hours: ", weekend
Stop
""",
         tries=[dict(give=["8", "8", "8", "8", "8", "5", "4"],
                     want=["Hours worked on each of the seven days",
                           "Weekend hours: 9"])],
         b=dict(
             en="Day 6 and day 7 are the weekend. Only one of the two is "
                "being counted.",
             de="Tag 6 und Tag 7 sind das Wochenende. Nur einer von beiden "
                "wird mitgezählt.",
             es="El día 6 y el día 7 son el fin de semana. Solo se está "
                "contando uno de los dos.",
             fr="Le jour 6 et le jour 7 sont le week-end. Un seul des deux "
                "est compté.")),

    dict(key="z_lap",
         start="""
Start
Declare Integer lap
Declare Integer laps
Display "How many laps is the race?"
Input laps
For lap = 1 To laps - 1
    Display "Lap ", lap
End For
Display "Finish"
Stop
""",
         mend="""
Start
Declare Integer lap
Declare Integer laps
Display "How many laps is the race?"
Input laps
For lap = 1 To laps
    Display "Lap ", lap
End For
Display "Finish"
Stop
""",
         tries=[dict(give=["3"], want=["How many laps is the race?", "Lap 1",
                                       "Lap 2", "Lap 3", "Finish"]),
                dict(give=["1"], want=["How many laps is the race?", "Lap 1",
                                       "Finish"])],
         b=dict(
             en="Every lap of the race gets called. The last one never is.",
             de="Jede Runde des Rennens wird angesagt. Die letzte nie.",
             es="Cada vuelta de la carrera se anuncia. La última nunca.",
             fr="Chaque tour de la course est annoncé. Le dernier ne l'est "
                "jamais.")),

    dict(key="z_loyalty",
         start="""
Start
Declare Integer stamps
Declare Integer cups
Declare Integer cup
Set stamps = 0
Display "How many cups today?"
Input cups
For cup = 1 To cups
    Set stamps = stamps + 1
    If stamps > 10 Then
        Display "Free coffee"
        Set stamps = 0
    End If
End For
Display "Stamps left: ", stamps
Stop
""",
         mend="""
Start
Declare Integer stamps
Declare Integer cups
Declare Integer cup
Set stamps = 0
Display "How many cups today?"
Input cups
For cup = 1 To cups
    Set stamps = stamps + 1
    If stamps = 10 Then
        Display "Free coffee"
        Set stamps = 0
    End If
End For
Display "Stamps left: ", stamps
Stop
""",
         tries=[dict(give=["10"], want=["How many cups today?", "Free coffee",
                                        "Stamps left: 0"]),
                dict(give=["5"], want=["How many cups today?",
                                       "Stamps left: 5"])],
         b=dict(
             en="The tenth stamp earns a free coffee and clears the card. "
                "This card never quite gets there.",
             de="Der zehnte Stempel bringt einen Gratiskaffee und leert die "
                "Karte. Diese Karte kommt nie ganz dahin.",
             es="El décimo sello da un café gratis y vacía la tarjeta. Esta "
                "tarjeta nunca llega del todo.",
             fr="Le dixième tampon offre un café et vide la carte. Cette "
                "carte n'y arrive jamais tout à fait.")),
]
