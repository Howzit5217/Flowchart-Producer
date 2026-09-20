"""Level 1 -- one thing wrong, and the program is short enough to see it.

Every one of these is somewhere a person actually stands: a ride, a car
park, a gate, a fridge, a till.  The fault is a single line, and the
program around it is eight or ten lines long, because at this level the
work is noticing that a program can be wrong at all.
"""

PUZZLES = [

    dict(key="z_ride",
         start="""
Start
Declare Integer height
Display "How tall are you, in cm?"
Input height
If height >= 120 Then
    Display "Enjoy the ride"
End If
Stop
""",
         mend="""
Start
Declare Integer height
Display "How tall are you, in cm?"
Input height
If height >= 120 Then
    Display "Enjoy the ride"
Else
    Display "Sorry, you are too small for this ride"
End If
Stop
""",
         tries=[dict(give=["130"], want=["How tall are you, in cm?",
                                         "Enjoy the ride"]),
                dict(give=["110"], want=["How tall are you, in cm?",
                                         "Sorry, you are too small for this ride"])],
         b=dict(
             en="Anyone 120cm or over rides. Anyone smaller is told so, and "
                "at the moment they are told nothing at all.",
             de="Ab 120 cm darf man fahren. Wer kleiner ist, soll das "
                "hoeren -- im Moment hoert er gar nichts.",
             es="A partir de 120 cm se puede montar. A quien mida menos hay "
                "que decirselo, y ahora mismo no se le dice nada.",
             fr="A partir de 120 cm on peut monter. Celui qui est plus petit "
                "doit l'apprendre, et pour l'instant on ne lui dit rien.")),

    dict(key="z_bay",
         start="""
Start
Declare Integer parked
Declare Integer bays
Set bays = 50
Display "How many cars are parked?"
Input parked
If parked < bays Then
    Display "Car park full"
Else
    Display "Spaces available"
End If
Stop
""",
         mend="""
Start
Declare Integer parked
Declare Integer bays
Set bays = 50
Display "How many cars are parked?"
Input parked
If parked < bays Then
    Display "Spaces available"
Else
    Display "Car park full"
End If
Stop
""",
         tries=[dict(give=["12"], want=["How many cars are parked?",
                                        "Spaces available"]),
                dict(give=["50"], want=["How many cars are parked?",
                                        "Car park full"])],
         b=dict(
             en="The car park holds 50. The sign is showing the two "
                "messages the wrong way round.",
             de="Der Parkplatz fasst 50 Autos. Das Schild zeigt die beiden "
                "Meldungen vertauscht.",
             es="El aparcamiento tiene 50 plazas. El cartel muestra los dos "
                "mensajes al reves.",
             fr="Le parking compte 50 places. Le panneau affiche les deux "
                "messages a l'envers.")),

    dict(key="z_gate",
         start="""
Start
Display "Now boarding"
For group = 1 To 5
    Display "Group ", group
End For
Display "Gate closing"
Stop
""",
         mend="""
Start
Display "Now boarding"
For group = 1 To 4
    Display "Group ", group
End For
Display "Gate closing"
Stop
""",
         tries=[dict(give=[], want=["Now boarding", "Group 1", "Group 2",
                                    "Group 3", "Group 4", "Gate closing"])],
         b=dict(
             en="The flight has four boarding groups. It is calling a fifth "
                "one that nobody is in.",
             de="Der Flug hat vier Boarding-Gruppen. Er ruft eine fuenfte "
                "auf, in der niemand ist.",
             es="El vuelo tiene cuatro grupos de embarque. Esta llamando a "
                "un quinto en el que no hay nadie.",
             fr="Le vol a quatre groupes d'embarquement. Il en appelle un "
                "cinquieme ou il n'y a personne.")),

    dict(key="z_booking",
         start="""
Start
Declare String name
Display "Hello, ", name
Display "What name is the booking under?"
Input name
Stop
""",
         mend="""
Start
Declare String name
Display "What name is the booking under?"
Input name
Display "Hello, ", name
Stop
""",
         tries=[dict(give=["Sam"], want=["What name is the booking under?",
                                         "Hello, Sam"])],
         b=dict(
             en="It greets the guest by name before it has asked what the "
                "name is. Ask first, then greet.",
             de="Es begruesst den Gast mit Namen, bevor es nach dem Namen "
                "gefragt hat. Erst fragen, dann begruessen.",
             es="Saluda al huesped por su nombre antes de haber preguntado "
                "cual es. Primero pregunta, luego saluda.",
             fr="Il salue le client par son nom avant d'avoir demande ce "
                "nom. D'abord demander, ensuite saluer.")),

    dict(key="z_fridge",
         start="""
Start
Declare Integer temp
Display "What is the fridge at, in degrees?"
Input temp
If temp >= 1 Or temp <= 5 Then
    Display "Fridge is fine"
Else
    Display "Check the fridge"
End If
Stop
""",
         mend="""
Start
Declare Integer temp
Display "What is the fridge at, in degrees?"
Input temp
If temp >= 1 And temp <= 5 Then
    Display "Fridge is fine"
Else
    Display "Check the fridge"
End If
Stop
""",
         tries=[dict(give=["3"], want=["What is the fridge at, in degrees?",
                                       "Fridge is fine"]),
                dict(give=["9"], want=["What is the fridge at, in degrees?",
                                       "Check the fridge"]),
                dict(give=["-2"], want=["What is the fridge at, in degrees?",
                                        "Check the fridge"])],
         b=dict(
             en="A fridge is fine between 1 and 5 degrees. This one calls "
                "every temperature there is fine.",
             de="Ein Kuehlschrank ist zwischen 1 und 5 Grad in Ordnung. "
                "Dieser haelt jede Temperatur fuer in Ordnung.",
             es="Una nevera esta bien entre 1 y 5 grados. Esta da por buena "
                "cualquier temperatura.",
             fr="Un frigo va bien entre 1 et 5 degres. Celui-ci trouve "
                "toutes les temperatures bonnes.")),

    dict(key="z_recipe",
         start="""
Start
Declare Integer people
Declare Integer eggs
Display "How many people are eating?"
Input people
Set eggs = people
Display "Eggs needed: ", eggs
Stop
""",
         mend="""
Start
Declare Integer people
Declare Integer eggs
Display "How many people are eating?"
Input people
Set eggs = people * 2
Display "Eggs needed: ", eggs
Stop
""",
         tries=[dict(give=["4"], want=["How many people are eating?",
                                       "Eggs needed: 8"]),
                dict(give=["1"], want=["How many people are eating?",
                                       "Eggs needed: 2"])],
         b=dict(
             en="The recipe takes two eggs per person. It is buying one "
                "each.",
             de="Das Rezept braucht zwei Eier pro Person. Es kauft eines "
                "pro Person.",
             es="La receta lleva dos huevos por persona. Esta comprando uno "
                "para cada una.",
             fr="La recette demande deux oeufs par personne. Il en achete "
                "un seul par personne.")),

    dict(key="z_balance",
         start="""
Start
Declare Currency balance
Display "What is the balance?"
Input balance
Display "Balance: $", balance
If balance > 0 Then
    Display "In credit"
Else
    Display "Overdrawn"
End If
Stop
""",
         mend="""
Start
Declare Currency balance
Display "What is the balance?"
Input balance
Display "Balance: $", balance
If balance > 0 Then
    Display "In credit"
Else If balance = 0 Then
    Display "Empty"
Else
    Display "Overdrawn"
End If
Stop
""",
         tries=[dict(give=["25.40"], want=["What is the balance?",
                                           "Balance: $25.40", "In credit"]),
                dict(give=["0"], want=["What is the balance?",
                                       "Balance: $0.00", "Empty"]),
                dict(give=["-10.00"], want=["What is the balance?",
                                            "Balance: $-10.00", "Overdrawn"])],
         b=dict(
             en="An account can be in credit, overdrawn, or sitting at "
                "exactly nothing. Empty is not overdrawn.",
             de="Ein Konto kann im Plus sein, im Minus, oder genau auf null "
                "stehen. Null ist nicht im Minus.",
             es="Una cuenta puede estar en positivo, en numeros rojos, o "
                "justo a cero. Cero no es estar en rojo.",
             fr="Un compte peut etre crediteur, a decouvert, ou exactement a "
                "zero. Zero n'est pas a decouvert.")),

    dict(key="z_tannoy",
         start="""
Start
Declare String place
Display "What is the next stop?"
Input place
Display "Next stop: ", place
Stop
""",
         mend="""
Start
Declare String place
Display "What is the next stop?"
Input place
Display "Next stop: ", place
Display "Next stop: ", place
Stop
""",
         tries=[dict(give=["Redhill"], want=["What is the next stop?",
                                             "Next stop: Redhill",
                                             "Next stop: Redhill"])],
         b=dict(
             en="The announcement is made twice, so anyone who missed it the "
                "first time hears it. This one says it once.",
             de="Die Ansage kommt zweimal, damit sie auch hoert, wer sie "
                "beim ersten Mal verpasst hat. Diese kommt einmal.",
             es="El aviso se da dos veces, para que lo oiga quien se lo "
                "perdio la primera. Este se da una sola vez.",
             fr="L'annonce passe deux fois, pour ceux qui l'ont ratee la "
                "premiere fois. Celle-ci ne passe qu'une fois.")),

    dict(key="z_change",
         start="""
Start
Declare Currency due
Declare Currency paid
Display "What does the shopping come to?"
Input due
Display "What did they hand over?"
Input paid
Display "Change: $", due + paid
Stop
""",
         mend="""
Start
Declare Currency due
Declare Currency paid
Display "What does the shopping come to?"
Input due
Display "What did they hand over?"
Input paid
Display "Change: $", paid - due
Stop
""",
         tries=[dict(give=["13.40", "20.00"],
                     want=["What does the shopping come to?",
                           "What did they hand over?", "Change: $6.60"]),
                dict(give=["5.00", "5.00"],
                     want=["What does the shopping come to?",
                           "What did they hand over?", "Change: $0.00"])],
         b=dict(
             en="Change is what is handed over less what the shopping came "
                "to. This till is adding the two together.",
             de="Das Wechselgeld ist das Gegebene minus die Summe des "
                "Einkaufs. Diese Kasse zaehlt beides zusammen.",
             es="El cambio es lo que entregan menos lo que costo la compra. "
                "Esta caja esta sumando las dos cosas.",
             fr="La monnaie, c'est ce qu'on donne moins le total des "
                "courses. Cette caisse additionne les deux.")),

    dict(key="z_meter",
         start="""
Start
Declare Integer units
Declare Currency cost
Display "How many units were used?"
Input units
Display "To pay: $", cost
Set cost = units * 0.28
Stop
""",
         mend="""
Start
Declare Integer units
Declare Currency cost
Display "How many units were used?"
Input units
Set cost = units * 0.28
Display "To pay: $", cost
Stop
""",
         tries=[dict(give=["100"], want=["How many units were used?",
                                         "To pay: $28.00"]),
                dict(give=["50"], want=["How many units were used?",
                                        "To pay: $14.00"])],
         b=dict(
             en="Electricity is 28c a unit. The bill is printed before "
                "anyone works out what it comes to.",
             de="Strom kostet 28 Cent je Einheit. Die Rechnung wird "
                "gedruckt, bevor jemand sie ausgerechnet hat.",
             es="La luz cuesta 28 centimos por unidad. La factura se imprime "
                "antes de que nadie calcule el importe.",
             fr="L'electricite coute 28 centimes l'unite. La facture est "
                "imprimee avant que le montant soit calcule.")),
]
