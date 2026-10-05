"""Every word it says, in German."""
from ..words.lookup import program, speaks

DE = {
    "start": "Start", "end": "Ende", "ret": "Rückgabe",
    "yes": "Wahr", "no": "Falsch", "again": "nochmal?",
    "key_oval": "Start / Ende", "key_rect": "Verarbeitung",
    "key_io": "Eingabe / Ausgabe", "key_diamond": "Entscheidung",
    "key_hex": "Schleife", "key_sub": "Modul aufrufen",
    "palette": "Palette", "shapes": "Formen",
    # ---- the Style side: the words, the highlighter, the borders
    "t_head": "Schrift", "t_face": "Schriftart",
    "t_sans": "Schlicht", "t_serif": "Buch",
    "t_mono": "Code", "t_hand": "Hand",
    "t_size": "Größe", "t_smaller": "Kleiner",
    "t_bigger": "Größer", "t_bold": "Fett",
    "t_italic": "Kursiv", "t_under": "Unterstrichen",
    "t_strike": "Durchgestrichen", "t_color": "Farbe",
    "t_mark": "Markierung", "t_mark_none": "Keine Markierung",
    "cp_sat": "Sättigung", "cp_bright": "Helligkeit",
    "cp_recent": "Zuletzt verwendet", "cp_code": "Farbcode",
    "t_mark_own": "Andere Farbe", "m_yellow": "Gelb",
    "m_green": "Grün", "m_pink": "Rosa",
    "m_blue": "Blau", "m_orange": "Orange",
    "t_weight": "Linienstärke", "t_thin": "Dünn",
    "t_normal": "Normal", "t_thick": "Dick",
    "t_border": "Rahmen", "t_dashed": "Gestrichelter Rahmen",
    "t_copy_look": "Stil kopieren", "t_paste_look": "Stil einfügen",
    "t_size_list": "Größe wählen",
    "selected": "Ausgewählte Form", "rest": "Linien und Papier",
    "fill": "Füllung", "outline": "Umriss", "text": "Text",
    "paper": "Papier", "grid": "Raster", "show_grid": "Raster anzeigen",
    "lines": "Linien und Pfeile", "reset": "Den ganzen Stil zurücksetzen",
    "download": "Herunterladen", "dl_size": "Größe",
    "files": "Dateien", "f_work_head": "Deine Arbeit",
    "dl_svg": "SVG herunterladen", "dl_png": "PNG herunterladen",
    "print_it": "Diagramm drucken",
    "dl_pdf": "PDF herunterladen",
    "mm_open": "Mermaid-Text",
    "mm_tip": "Das Diagramm als Mermaid, zum Einfügen in GitHub, Notion oder Markdown",
    "mm_head": "Mermaid",
    "mm_bad": "Das konnte nicht als Mermaid-Flussdiagramm gelesen werden.",
    "mm_opened": "Als Zeichnung geöffnet.",
    "print_head": "Drucken",
    "print_go": "Drucken…",
    "print_paper": "Papier",
    "print_wide": "Quer",
    "print_fit": "Auf eine Seite bringen",
    "print_note": "Gedruckt wird schwarz-weiß. Drucker und Anzahl der Kopien fragt dein Browser.",
    "panel": "Bereich", "panel_tip": "Bereich ein- oder ausblenden",
    "png_tip": "Wie groß das PNG wird",
    "fit": "Einpassen", "actual": "Original", "zoom_in": "Vergrößern",
    "slide_left": "Links", "slide_right": "Rechts", "slide_up": "Hoch", "slide_down": "Runter",
    "hold_locked": "Fixiert", "hold_loose": "Frei",
    "lock_tip": "Das Diagramm fixieren und darin scrollen",
    "loose_tip": "Das Diagramm frei verschieben; eine Ecke bleibt immer sichtbar",
    "tool_move": "Bewegen",
    "tool_move_tip": "Ziehen bewegt das Blatt. Strg+Ziehen oder Umschalt+Ziehen wählt Formen aus.",
    "tool_select": "Auswählen",
    "tool_select_tip": "Ziehe über das Blatt, um Formen auszuwählen. Klicke Formen an, um sie hinzuzunehmen oder wegzulassen.",
    "zoom_out": "Verkleinern", "pixels": "Pixel",
    "dl_scale": "Mal so groß wie gezeichnet",
    "dl_frame": "In ein Bild eingepasst",
    "png_over": "mehr, als dieser Browser zeichnen kann",
    "click_shape": "Klicke auf eine Form, um nur diese zu gestalten.",
    "palette_hint": "Eine Palette färbt alle Formen. Was du danach änderst, bleibt.",
    "shapes_hint": "Füllung und Umriss, für alle Formen dieser Art.",
    "apply_all": "Auf alle {n} anwenden: {what}", "clear": "Löschen",
    "rendering": "Wird erzeugt…",
    "png_big": "So ein großes PNG schafft der Browser nicht. Nimm eine kleinere Größe oder speichere das SVG.",
    "png_fail": "Das PNG ging nicht. Der SVG-Download funktioniert weiterhin.",
    "png_capped": "{want}× ist zu groß für den Browser; das PNG wird mit {got}× gespeichert ({w} × {h} Pixel).",
    "flowchart": "Flussdiagramm",
    "r_head": "Ausführen",
    "r_run": "Starten",
    "r_stop": "Anhalten",
    "r_code": "Als Code", "r_lang_pick": "In welcher Sprache der Code geschrieben ist",
    "r_pseudo": "Pseudocode",
    "r_slowly": "Schritt für Schritt",
    "r_enter": "Eingeben",
    "r_hint": "Führt das Programm des Diagramms aus: fragt nach Eingaben, gibt aus und hebt jede Form hervor. Wähle eine Sprache, um es als Code zu sehen.",
    "r_started": "Läuft...",
    "r_done": "Fertig.",
    "r_nothing": "Noch nichts auszuführen.",
    "r_steps": "{n} Schritte, {ms} ms.",
    "r_forever": "Das läuft zu lange ohne anzuhalten: eine Schleife endet nie.",
    "r_zero": "Das teilt durch null.",
    "r_unknown": "In {name} steht noch nichts.",
    "r_odd_op": "Mit {op} weiß ich nichts anzufangen.",
    "r_half": "Das liest sich nicht als Ganzes: {bit}",
    "r_back": "Zurück zum Lauf", "back": "Zurück",
    "r_by_hand": "Starten wird aktiv, sobald der Entwurf funktioniert.",
    "h_no_start": "Es gibt keine Form, mit der begonnen wird.",
    "h_tangled": "Diese Schleifen kreuzen sich, daher lässt sich kein Programm daraus schreiben.",
    "h_not_a_program": "Diese Formen ergeben kein Programm.",
    "r_build_first": "Erstelle ein Diagramm aus Pseudocode, um es hier auszuführen.",
    "r_copy": "Kopieren",
    "r_copied": "Kopiert",
    "r_copy_no": "Bitte von Hand kopieren",
    "r_save_code": "Speichern",
    "r_file": "{name} Ausgabe",
    "r_pseudo_only": "Wähle Python, Java, C# oder JavaScript, um den Code zu sehen.",
    # ---- wo ein Lauf schiefging, und was das Lesen übergehen musste
    "r_at": "Zeile {line}",
    "r_show_line": "Zeig mir die Zeile, aus der das kommt",
    "r_in_mod": "in {name}, aufgerufen aus Zeile {line}",
    "r_in_mod_only": "in {name}",
    "r_mean": "Meintest du {name}?",
    "r_unknown_fn": "Es gibt kein Modul und keine Funktion namens {name}.",
    "r_odd_here": "Mit {bit} habe ich hier nicht gerechnet.",
    "r_empty_expr": "Hier steht nichts, woraus sich das ergeben könnte.",
    "r_left_over": "Am Ende bleibt {bit} übrig, ohne etwas, woran es gehört.",
    "r_open_quote": "Dieser Text wird nie geschlossen: ein Anführungszeichen fehlt.",
    "r_open_bracket": "Diese Klammer wird geöffnet und nie geschlossen.",
    "r_shut_bracket": "Diese Klammer schließt eine, die nie geöffnet wurde.",
    "r_no_idea": "Diese Zeile ergibt keinen Sinn, der Lauf hat sie übersprungen.",
    "r_stepped_over": "Einige Zeilen wurden übersprungen, die Ausgabe ist vielleicht unvollständig.",
    "r_too_deep": "{name} hat sich zu oft selbst aufgerufen und hört nie auf.",
    "r_args": "{name} verlangt {want} und hat {got} bekommen.",
    "r_no_main": "Kein Hauptablauf, der Lauf hat in {name} begonnen.",
    "r_no_item": "Hier gibt es kein Element {at}: es hat {n}.",
    "r_no_key": "Unter {key} steht darin nichts.",
    "r_no_field": "Darin gibt es kein {name}.",
    "r_no_items": "Nur eine Liste, ein Wort oder eine Tabelle hat Elemente zum Herausnehmen, und das hier ist {what}.",
    "r_whole_at": "Ein Element wird mit einer ganzen Zahl gewählt, nicht mit {at}.",
    "r_open_square": "Diese [ wird geöffnet und nie geschlossen.",
    "r_empty_list": "Die Liste ist leer, es gibt nichts herauszunehmen.",
    "r_not_in_list": "{item} ist nicht in der Liste.",
    "r_needs_list": "{name} braucht eine Liste.",
    "w_head": "Einen Blick wert",
    "w_found": "{n} zum Anschauen im Pseudocode:",
    "w_open_if": "Zeile {line}: Dieses If wird nie geschlossen. Setz ein End If dorthin, wo es aufhören soll.",
    "w_open_loop": "Zeile {line}: Diese Schleife wird nie geschlossen. Setz ein End While dorthin, wo sie aufhören soll.",
    "w_open_for": "Zeile {line}: Dieses For wird nie geschlossen. Setz ein End For dorthin, wo es aufhören soll.",
    "w_open_select": "Zeile {line}: Dieses Select wird nie geschlossen. Setz ein End Select dorthin, wo es aufhören soll.",
    "w_no_if": "Zeile {line}: End If, aber kein If ist offen.",
    "w_no_loop": "Zeile {line}: Das schließt eine Schleife, aber es ist keine offen.",
    "w_exit_alone": "Zeile {line}: Exit verlässt eine Schleife, aber hier ist keine offen.",
    "w_no_select": "Zeile {line}: End Select, aber kein Select ist offen.",
    "w_do_no_test": "Zeile {line}: Dieses Do hat keine Bedingung und endet nie. Schließ es mit Until ... oder Loop While ...",
    "w_until_alone": "Zeile {line}: Until, aber darüber steht kein Do oder Repeat.",
    "w_mend_change": "{word} in {instead} ändern",
    "w_mend_drop": "Zeile {line} entfernen",
    "w_mend_insert": "{text} in Zeile {line} einsetzen",
    "w_mend_tip": "Doppelklick, um das zu beheben",
    "w_mend_close": "Das fehlende {text} ans Ende setzen",
    "w_mend_cut": "{text} entfernen",
    "w_mend_put": "{text} einfügen",
    "w_mend_all": "Alle {n} beheben",
    "ask_go": "Einsetzen",
    "ask_tip": "Gib im Feld darunter ein, was fehlt",
    "ask_pick": "Form wählen",
    "ask_join": "Verbinden",
    "ask_start": "{name} beginnt mit",
    "ask_input": "Stattdessen danach fragen",
    "ask_forever": "Die Schleife in Zeile {line} hört nie auf. Am Ende anfügen",
    "ask_stop_when": "Oder aufhören, wenn",
    "ask_zero_else": "Wenn {name} 0 ist, stattdessen",
    "ask_zero_show": "Wenn {name} 0 ist, stattdessen anzeigen",
    "ask_zero_eg": "Nichts zum Teilen",
    "ask_zero_skip": "Überspringen, wenn {name} 0 ist",
    "ask_args": "{name} braucht noch {what}",
    "ask_args_cut": "Die {n} zu viel herausnehmen",
    "ask_deep": "{name} braucht ein Ende: aufhören, wenn",
    "ask_deep_give": "und zurückgeben",
    "ask_use": "Es gibt kein {name}. Stattdessen",
    "ask_here": "Was gehört hierher?",
    "ask_line": "Zeile {line} so schreiben",
    "ask_until": "Weiter, bis",
    "ask_close": "{text} kommt nach Zeile",
    "ask_same": "So steht die Zeile schon da. Ändere sie zuerst.",
    "ask_stale": "Der Pseudocode wurde seitdem geändert. Zeichne ihn zuerst neu.",
    "ask_bad_empty": "Gib zuerst etwas ein.",
    "ask_bad_pick": "Wähle zuerst etwas aus.",
    "ask_bad_open": "Darin wird ein {text} nie geschlossen.",
    "ask_bad_shut": "Darin schließt ein {text} nichts.",
    "ask_bad_name": "Das muss ein einzelner Name sein, wie summe.",
    "ask_bad_line": "Wähle eine Zeile von {from} bis {to}.",
    "ask_write_in": "Hineinschreiben",
    "ask_write_eg": "summe = summe + 1",
    "ask_arrow_to": "Pfeil davon zu",
    "ask_arrow_from": "Pfeil hinein von",
    "ask_name_way": "Worte für diesen Ausgang",
    "ask_leave_when": "Die Schleife verlassen, wenn",
    "ask_end_after": "Ein Ende setzen nach",
    "ask_arrow_into": "Pfeil in „{name}“ von",
    "n_rect": "Rechteck",
    "an_arrow": "Pfeil",
    "word_on_it": "Wort daran",
    "thickness": "Dicke",
    "color_of_it": "Farbe",
    "dashed": "Gestrichelt",
    "with_head": "Spitze",
    "turn_it_round": "Umdrehen",
    "m_type": "Hineinschreiben",
    "m_copy": "Noch eins",
    "c_fill": "Füllfarbe", "c_line": "Randfarbe", "c_words": "Textfarbe",
    "c_clear": "Kein eigener Stil",
    "m_solid": "Durchgezogen",
    "m_no_word": "Kein Wort",
    "m_fit": "Auf den Bildschirm passen",
    "m_clip_copy": "Kopieren",
    "m_clip_cut": "Ausschneiden",
    "m_clip_paste": "Einfügen",
    "m_all": "Alles auswählen",
    "m_pin": "An diesen Seiten festhalten",
    "m_unpin": "Seiten selbst finden lassen",
    "sel_bar": "Was mit der Auswahl geschehen soll",
    "f_save": "In eine Datei speichern",
    "f_open": "Datei öffnen",
    "f_not_ours": "Diese JSON-Datei ist kein hier gespeicherter Entwurf.",
    "f_opened": "{name} geöffnet.",
    "f_empty": "Darin steht nichts.",
    "f_open_tip": "Code, Pseudocode, ein Flussdiagramm aus draw.io, Lucidchart, Visio oder Excalidraw oder ein Bild davon. Du kannst Dateien auch auf die Seite ziehen oder ein Bild einfügen.",
    "f_folder": "Ordner öffnen",
    "f_folder_tip": "Ein Ordner mit Code, Pseudocode oder Flussdiagrammen. Eine ZIP-Datei geht auch.",
    "in_head": "Was öffnen?",
    "in_from": "In {name}",
    "in_cancel": "Abbrechen",
    "in_all": "Alle {n} als ein Programm",
    "in_files": "{n} Dateien",
    "in_skipped": "{n} andere Dateien ausgelassen.",
    "in_skipped_one": "Eine andere Datei ausgelassen.",
    "in_paste_head": "Eingefügtes Bild öffnen",
    "in_paste_said": "Es wird ein neues Flussdiagramm und ersetzt, was jetzt hier ist.",
    "in_paste_yes": "Öffnen",
    "in_nothing": "Darin ist weder Code noch Pseudocode noch ein Flussdiagramm.",
    "in_cannot": "Diese Art von Datei kann hier nicht geöffnet werden.",
    "in_unread": "Das konnte nicht als Flussdiagramm gelesen werden.",
    "in_many": "Die ersten {n} Dateien wurden geöffnet.",
    "in_most": "Die {n} wichtigsten von {all} Dateien gelesen. Alle Dateien stehen in der Liste über dem Code.",
    "in_reading": "Lese {n} von {of} Dateien…",
    "in_sorting": "Sortiere {n} Dateien…",
    "in_found": "{n} Dateien gefunden…",
    "in_more_items": "…und {n} weitere.",
    "in_old": "Dieser Browser kann das nicht entpacken. Versuch einen neueren.",
    "in_looking": "Wird geöffnet…",
    "in_again": "Noch etwas aus {name}",
    "in_again_plain": "Noch eins davon öffnen",
    "in_picture": "Bild",
    "in_design": "Hier gespeichert",
    "in_drop": "Zum Öffnen loslassen",
    "in_drop_more": "Code, Pseudocode, ein Flussdiagramm, ein Bild davon, ein Ordner oder eine ZIP-Datei",
    "pic_looking": "Das Bild wird angesehen…",
    "pic_words": "Die Wörter werden gelesen, {n} von {m}…",
    "pic_labels": "Die Wörter an den Pfeilen werden gelesen…",
    "pic_read": "{name} gelesen. Prüfe die Wörter.",
    "pic_unread": "Die Formen in {name} sind gelesen. Tippe die Wörter ein: Zum Lesen braucht es eine Verbindung.",
    "pic_none": "In diesem Bild wurde kein Flussdiagramm gefunden.",
    "pic_bad": "Dieses Bild konnte nicht geöffnet werden.",
    "dl_copy": "Diagramm kopieren",
    "dl_copied": "Kopiert",
    "dl_copy_no": "Dieser Browser kann keine Bilder kopieren. Lade es stattdessen herunter.",
    "l_copy": "Link dazu kopieren",
    "l_copied": "Link kopiert",
    "l_copy_no": "Kopieren ging nicht. Nimm ihn aus der Adresszeile.",
    "fd_head": "Wohin gespeichert wird",
    "fd_browser": "In die Downloads deines Browsers.",
    "fd_in": "In den Ordner {name}.",
    "fd_pick": "Ordner wählen",
    "fd_pick_tip": "Wähle einen Ordner oder leg einen an. Alles, was du speicherst, landet direkt darin.",
    "fd_off": "Zurück zu den Downloads",
    "fd_cannot": "Dieser Browser speichert nur in die Downloads. Chrome oder Edge auf einem Computer können einen Ordner wählen.",
    "fd_saved": "{name} in {folder} gespeichert",
    "fd_fell": "{folder} hat es nicht angenommen, es liegt in den Downloads.",
    "l_opened": "Aus einem Link geöffnet.",
    "l_long": "Dieser Link ist {n} Zeichen lang. Mail- und Chat-Programme kürzen ihn vielleicht – schick lieber die Datei.",
    "l_bad": "Dieser Link enthält kein Diagramm, das diese Seite lesen kann.",
    "sv_tab": "Zwischenstände",
    "sv_about": "Speichert Diagramm, Lauf und Stand in diesem Browser. Platz für {n}.",
    "sv_save": "Fortschritt speichern",
    "sv_saved": "Gespeichert.",
    "sv_full": "Alle {n} sind belegt. Überschreibe oder lösche einen.",
    "sv_nothing": "Noch nichts zu speichern.",
    "sv_no_room": "Der Browser hat es nicht behalten: Speicher voll oder ausgeschaltet.",
    "sv_empty": "Leer",
    "sv_load": "Laden",
    "sv_over": "Überschreiben",
    "sv_over_ask": "Diesen Stand durch das Aktuelle ersetzen?",
    "sv_over_yes": "Überschreiben",
    "sv_del_ask": "Diesen Stand endgültig löschen?",
    "sv_today": "Heute",
    "sv_st_none": "Noch nicht ausgeführt",
    "sv_st_ask": "Wartet auf eine Antwort",
    "sv_st_next": "Wartet auf den nächsten Schritt",
    "sv_st_going": "Mitten in einem Lauf",
    "sv_st_over": "Lauf beendet",
    "sv_back": "Weiter, wo du aufgehört hast.",
    "sv_moved": "Dieser Spielstand passt nicht mehr zum Programm, der Lauf geht nicht weiter.",
    "sv_lost": "Das Programm dieses Spielstands ließ sich nicht aus dem Browserspeicher lesen.",
    "sv_no_draw": "Das Diagramm wurde nicht gezeichnet, der Lauf geht nicht weiter.",
    "sv_stop_said": "Einen Stand zu laden ersetzt das laufende Programm. "
                    "Der Lauf wird angehalten.",
    "sv_stop_yes": "Anhalten und laden",
    "held_head": "Was es gerade hält",
    "held_in": "in {name}",
    "held_shared": "Außerhalb aller Module deklariert, also für jedes Diagramm sichtbar",
    "held_none": "noch nichts",
    "held_switch": "Zeigen, was es gerade hält",
    "tests_open": "Testfälle",
    "tests_tip": "Mit selbst gewählten Eingaben und der erwarteten Ausgabe prüfen",
    "tests_head": "Testfälle",
    "tests_one": "Test {n}",
    "tests_typed": "Eingabe, eine pro Zeile",
    "tests_want": "Erwartete Ausgabe, eine pro Zeile",
    "tests_add": "Test hinzufügen",
    "tests_run": "Tests ausführen",
    "tests_drop": "Entfernen",
    "tests_pass": "Bestanden",
    "tests_fail": "Nicht bestanden",
    "tests_all": "{pass} von {n} bestanden",
    "tests_none": "Schreib zuerst einen Test.",
    "tests_diff": "Zeile {n}: Ausgabe „{got}“ statt „{want}“.",
    "tests_short": "Es kamen {n} Zeilen statt {m}.",
    "tests_long": "Es kamen {n} Zeilen statt {m}.",
    "tests_broke": "Es hielt mit einem Fehler an.",
    "trace_open": "Ablauftabelle",
    "trace_tip": "Jede Änderung des Laufs, Schritt für Schritt, als Tabelle",
    "trace_head": "Ablauftabelle",
    "trace_line": "Zeile",
    "trace_out": "Ausgabe",
    "trace_main": "Hauptprogramm",
    "trace_none": "Starte das Programm, dann füllt sich die Tabelle.",
    "trace_rows": "{n} Schritte",
    "trace_cut": "nur die ersten {n} behalten",
    "bp_add": "Hier anhalten",
    "bp_drop": "Hier nicht anhalten",
    "bp_clear": "Alle Haltepunkte entfernen",
    "r_paused": "Angehalten in Zeile {n}.",
    "r_paused_hand": "Angehalten.",
    "h_tidy": "Aufräumen",
    "h_tidy_tip": "Alle Formen und Pfeile so anordnen, wie ein Diagramm aus Pseudocode aussieht",
    "h_tidied": "Aufgeräumt: {n} Formen verschoben.",
    "h_tidy_none": "Noch nichts aufzuräumen.",
    "h_tidy_done": "Schon aufgeräumt.",
    "h_write": "Als Text",
    "h_write_tip": "Den Pseudocode zu dieser Zeichnung zeigen",
    "h_into_box": "In das Feld schreiben",
    "h_into_box_tip": "Das ins Pseudocode-Feld schreiben und ersetzen, was dort steht. Die Zeichnung bleibt.",
    "s_no": "Lass es",
    "s_stop_head": "Es läuft noch",
    "s_stop_said": "Ein neues Diagramm ersetzt das laufende Programm, der Lauf wird abgebrochen.",
    "s_stop_yes": "Abbrechen und zeichnen",
    "n_roundrect": "Abgerundeter Kasten",
    "n_offpage": "Andere Seite", "n_loop": "Schleifengrenze", "n_parallel": "Nebeneinander",
    "n_text": "Text", "n_actor": "Person", "n_callout": "Sprechblase",
    "n_cube": "Würfel", "n_step": "Schritt", "n_table": "Tabelle",
    "n_stored": "Intern gespeichert", "n_cloud": "Cloud",
    "n_card": "Karte",
    "n_note": "Notiz",
    "n_docs": "Seiten",
    "n_manual": "Handeingabe",
    "n_screen": "Bildschirm",
    "n_arrow": "Pfeil",
    "n_io_back": "Parallelogramm andersherum",
    "n_oval": "Oval",
    "n_io": "Parallelogramm",
    "n_diamond": "Raute",
    "n_hex": "Sechseck",
    "n_sub": "Kasten mit Balken",
    "n_trap": "Trapez",
    "n_doc": "Dokument",
    "n_store": "Trommel",
    "n_delay": "Warten",
    "n_circle": "Kreis",
    "shapes_for": "Form je Art",
    "shapes_for_hint": "Welche Form jede Art von Schritt bekommt. Was der Schritt tut, bleibt gleich.",
    "size": "Größe",
    "width": "Breite",
    "height": "Höhe",
    "turn": "Drehen",
    "fit_words": "An den Text anpassen",
    "colors_here": "Farben",
    "odd_shape": "{pair} lässt sich nicht zeichnen -- siehe --help.",
    "mode_code": "Text",
    "mode_hand": "Zeichnung",
    "mode_lang": "Code",
    # ---- ein Programm in einfachen Worten, und der Pseudocode daraus
    "told_head": "Überarbeiteter Pseudocode",
    "told_tip": "Deine Worte als Pseudocode. Das Diagramm entsteht hieraus.",
    "told_yours": "Was du geschrieben hast",
    # ---- das Programm in einer Sprache, als Pseudocode zurückgelesen
    "lang_head": "Dein Code",
    "lang_pick": "Die Sprache: aus dem Code erkannt, oder wähle eine",
    "lang_auto": "Sprache erkennen",
    "lang_auto_is": "Erkannt: {lang}",
    "lang_file_add": "Datei hinzufügen",
    "lang_file_tip": "Doppelklick zum Umbenennen",
    "lang_file_drop": "Diese Datei entfernen",
    "lang_top": "Am wichtigsten · {n} von {all}",
    "lang_more": "+{n} weitere",
    "lang_more_tip": "Alle Dateien, zum Suchen und Öffnen",
    "lang_less": "Liste ausblenden",
    "lang_find": "Datei suchen",
    "lang_count": "{n} Dateien",
    "lang_list_read": "Wird beim Zeichnen gelesen · {n}",
    "lang_list_rest": "Außerdem im Ordner · {n}",
    "lang_list_none": "Keine Datei hat das im Namen oder Ordner.",
    "lang_list_bring": "Öffnet sie und liest sie beim Zeichnen mit den anderen",
    "lang_drop_ask": "{name} entfernen?",
    "lang_drop_said": "Ihr Code geht mit.",
    "lang_place": "Schreib ein Programm in Python, Java, C#, C++, JavaScript, TypeScript, C, Kotlin, Swift, Go oder Rust oder füge es ein, dann klicke auf Diagramm zeichnen.",
    "lang_stale": "Der Pseudocode wurde seitdem geändert.",
    "lang_rewrite": "Als {lang} neu schreiben",
    "lang_rewrite_tip": "Ersetzt den Code durch den Pseudocode, in {lang} geschrieben",
    "lang_made": "Aus deinem Code erstellt. Bearbeiten unter Text.",
    "lang_line": "Zeile {n}: {said}",
    "lang_check": "Prüfen",
    "lang_check_tip": "Den Code lesen und sagen, ob etwas nicht stimmt",
    "lang_fix": "{what} einfügen",
    "lang_fix_at": "{what} in Zeile {line} einfügen",
    "lang_fix_many": "Die {n} fehlenden {what} einfügen",
    "lang_fix_tip": "Strg+Z nimmt es wieder heraus",
    "lang_fix_cut": "{what} entfernen",
    "lang_fix_cut_at": "{what} in Zeile {line} entfernen",
    "lang_fix_change": "{word} in {instead} ändern",
    "lang_fix_change_at": "{word} in Zeile {line} in {instead} ändern",
    "lang_fix_indent": "Zeile {line} ausrichten",
    "lang_fix_call": "{name}(…) daraus machen",
    "lang_fix_split": "Den Rest der Zeile in eine eigene Zeile setzen",
    "lang_fix_split_at": "Den Rest von Zeile {line} in eine eigene Zeile setzen",
    "lang_fixing": "Fehler und Probleme werden behoben",
    "lang_fixed_one": "1 Fehler behoben",
    "lang_fixed_many": "{n} Fehler behoben",
    "lang_fixed_tip": "Sehen, was falsch war und was dagegen getan wurde",
    "lang_fixed_undo": "Wieder so wie vorher",
    "lang_reading": "Code wird gelesen",
    "lang_finding": "Fehler werden gesucht",
    "lang_listing": "Was übrig ist, wird aufgelistet",
    "lang_too_big": "Dieser Fehler ist zu groß, um ihn zu beheben. Das alles muss angesehen werden:",
    "lang_left_one": "1 Problem konnte nicht behoben werden:",
    "lang_left_many": "{n} Probleme konnten nicht behoben werden:",
    "lang_list_more": "…und weitere, hier nicht gezeigt.",
    "lang_put_found": "Die {n} gefundenen trotzdem beheben",
    "cm_empty": "Schreib zuerst etwas Code.",
    "cm_expected": "hier wurde {what} erwartet.",
    "cm_ended": "der Code endet, bevor er fertig ist.",
    "cm_odd": "{bit} kommt hier unerwartet.",
    "cm_indent": "die Einrückung passt nicht.",
    "cm_open": "ein Anführungszeichen oder Kommentar wird nie geschlossen.",
    "cm_lists": "solche Listen können noch nicht gezeichnet werden.",
    "cm_class": "Klassen und Objekte können nicht gezeichnet werden.",
    "cm_lambda": "eine Funktion ohne Namen kann nicht gezeichnet werden.",
    "cm_nested_fn": "eine Funktion in einer Funktion kann nicht gezeichnet werden.",
    "cm_break": "break geht nur am Anfang oder Ende einer Schleife.",
    "cm_continue": "continue kann nicht gezeichnet werden.",
    "cm_input_where": "speichere die Eingabe zuerst in einer Variablen.",
    "cm_twice": "{name} ist zweimal definiert.",
    "cm_other": "{bit} kann nicht gezeichnet werden.",
    "cm_wont_run": "Zeile {n}: {bit} wird gezeichnet, kann aber nicht laufen.",
    "cm_if_wrong": "Wenn hier {what} passiert, macht der Code stattdessen das:",
    "cm_an_error": "ein Fehler",
    "add_shape": "Form hinzufügen",
    "hand_hint": "Formen verschieben. Eine anklicken, dann Verbinden, dann die nächste Form.",
    "words_in": "Text in der Form",
    "connect": "Verbinden",
    "connect_now": "Jetzt die Form anklicken, zu der es geht.",
    "goes_to": "Geht zu",
    "nothing_yet": "noch nichts",
    "delete": "Löschen",
    "check": "Entwurf prüfen",
    "checked_good": "Keine Probleme gefunden.",
    "problems": "{n} zum Ansehen",
    "problems_more": "und {n} weitere",
    "h_too_many": "Zu viele Formen (höchstens {n})",
    "h_info": "So zeichnest du",
    "h_add_how": "Klicke auf eine Form, um sie unter die aktuelle zu setzen, oder ziehe sie aufs Blatt. Basis, Ablauf, Daten und Weitere haben mehr Formen.",
    "h_mouse": "Maus und Touch",
    "h_keys": "Tasten",
    "h_all_keys": "Alle Tastenkürzel",
    "hm_pick": "Eine Form oder einen Pfeil auswählen",
    "hm_move": "Eine Form verschieben, oder alle ausgewählten",
    "hm_size": "Die ausgewählte Form größer oder kleiner machen",
    "hm_turn": "Die ausgewählte Form beliebig drehen (Umschalt: in 15°-Schritten)",
    "hm_join": "Einen Pfeil zu einer anderen Form ziehen",
    "hm_type": "In eine Form oder auf einen Pfeil schreiben",
    "hm_menu": "Alles sehen, was du damit tun kannst",
    "hm_zoom": "Vergrößern oder verkleinern",
    "hm_rule": "Die vorgeschlagene Form nehmen oder diese behalten (gelbe Marke)",
    "hm_select": "Wähle unten Auswählen, dann wählt Ziehen über das Blatt Formen aus – auch mit dem Finger.",
    "many_head": "{n} Formen ausgewählt",
    "as_chart": "Diagramm",
    "untitled": "Ohne Titel",
    "p_no_start": "Nichts beginnt den Ablauf: in jede Form führt ein Pfeil.",
    "p_many_starts": "In {n} Formen führt nichts hinein. Ein Diagramm beginnt an einer Stelle.",
    "p_start_kind": "Die erste Form sollte eine Start-/Ende-Form sein ({shape}).",
    "p_no_end": "Es gibt kein Ende ({shape}), an dem der Ablauf aufhört.",
    "p_unreached": "Zu dieser Form führt nichts.",
    "p_dead_end": "Aus dieser Form führt nichts heraus, und sie ist kein Ende.",
    "p_decision_out": "Eine Entscheidung braucht mindestens zwei Ausgänge. Diese hat {n}.",
    "p_one_out": "Diese Form hat {n} Ausgänge. Nur eine Entscheidung darf zwei haben.",
    "p_same_labels": "Zwei Ausgänge sagen dasselbe.",
    "p_no_label": "Jeder Ausgang einer Entscheidung braucht eine Beschriftung.",
    "p_trapped": "Von hier erreicht der Ablauf nie ein Ende.",
    "p_empty": "In dieser Form steht nichts.",
    "p_overlap": "Diese Form liegt auf einer anderen.",
    "p_alone": "Diese Form ist mit nichts verbunden.",
    "p_line_through": "Eine Linie läuft durch diese Form. Verschiebe eine von beiden etwas.",
    "hf_start": "Einen Start darüber setzen",
    "hf_end": "Ein Ende einfügen und den Ablauf damit verbinden",
    "hf_to_end": "Mit dem Ende verbinden",
    "hf_write": "{word} hineinschreiben",
    "hf_type": "Hineinschreiben",
    "hf_arrow": "Einen Pfeil davon ziehen",
    "hf_yes_no": "Mit {yes} und {no} beschriften",
    "hf_label": "Den anderen mit {word} beschriften",
    "hf_relabel": "Den zweiten in {word} ändern",
    "hf_apart": "Freischieben",
    "hf_clear": "Von der Linie wegschieben",
    "hf_join": "Von der Form darüber anschließen",
    "hf_join_all": "Von den Formen darüber anschließen",
    "hf_out": "Den anderen Ausgang zeichnen",
    "hf_decide": "Eine Entscheidung daraus machen",
    "hf_drop_way": "Die überzähligen Pfeile entfernen",
    "hf_name_way": "Den Pfeil beschriften",
    "hp_next": "Nächsten Schritt anfügen",
    "hp_what_next": "Was kommt als Nächstes?",
    "hp_into": "Einen Schritt einfügen",
    "m_colors": "Farben", "m_format": "Form formatieren…", "m_more_shapes": "Weitere Formen",
    "sg_basic": "Basis", "sg_flow": "Ablauf", "sg_data": "Daten", "sg_other": "Weitere",
    "hr_head": "Formregeln",
    "hr_says": "Das sieht nach „{role}“ aus. Die Formregeln nehmen dafür: {shape}.",
    "hr_change": "In {shape} ändern",
    "hr_keep": "So lassen",
    "rs_card": "Auf Standard zurücksetzen",
    "rd_tip": "Farbe geändert, damit sie lesbar ist",
    "rd_head": "Besser lesbar",
    "rd_keep": "Diese Farbe behalten",
    "rd_ignore": "Ignorieren",
    "rd_words_dark": "Schrift dunkler, damit sie sich abhebt.",
    "rd_words_light": "Schrift heller, damit sie sich abhebt.",
    "rd_edge_dark": "Rand dunkler, damit er auf dem Blatt sichtbar ist.",
    "rd_edge_light": "Rand heller, damit er auf dem Blatt sichtbar ist.",
    "rd_lines_dark": "Pfeile dunkler, damit sie auf dem Blatt sichtbar sind.",
    "rd_lines_light": "Pfeile heller, damit sie auf dem Blatt sichtbar sind.",
    "rd_said_dark": "Pfeilbeschriftung dunkler, damit sie auf dem Blatt sichtbar ist.",
    "rd_said_light": "Pfeilbeschriftung heller, damit sie auf dem Blatt sichtbar ist.",
    "hr_tip": "Die Formregeln schlagen eine andere Form vor",
    "hl_head": "Ausrichten",
    "hl_left": "Linke Kanten ausrichten",
    "hl_center": "Mitten ausrichten",
    "hl_right": "Rechte Kanten ausrichten",
    "hl_top": "Oberkanten ausrichten",
    "hl_middle": "Waagrechte Mitten ausrichten",
    "hl_bottom": "Unterkanten ausrichten",
    "hl_across": "Waagrecht gleich verteilen",
    "hl_down": "Senkrecht gleich verteilen",
    "mv_head": "Verschobene Blöcke zurücksetzen?",
    "mv_said": "Neu aufbauen setzt das Layout zurück, verschobene Blöcke springen zurück. Rückgängig holt sie wieder.",
    "mv_yes": "Trotzdem aufbauen",
    "side_chart": "Diagramm", "side_colors": "Stil", "hide_panel": "Bereich ausblenden", "show_panel": "Bereich einblenden",
    "theme": "Hell oder dunkel", "theme_auto": "Auto", "theme_light": "Hell", "theme_dark": "Dunkel",
    "puzzles": "Rätsel",
    "pz_one": "Rätsel {n}",
    "pz_head": "Rätsel",
    "pz_l1": "Finde den Fehler",
    "pz_l2": "Bring es zum Laufen",
    "pz_l3": "Bau es",
    "pz_check": "Prüfen",
    "pz_right": "Gelöst.",
    "pz_wrong": "Noch nicht. Bei {give} kam {said}.",
    "pz_next": "Nächstes Rätsel", "pz_next_level": "Nächste Stufe",
    "pz_job": "Was es tun soll", "pz_now": "Was es jetzt tut",
    "pz_reset": "Neu anfangen", "pz_all": "Alle Rätsel",
    "pz_broke": "Es brach vorher ab. Es bekam {give}.",
    "pz_none": "Es gibt noch nichts zu prüfen.",
    "pz_locked": "Löse noch {n}, um diese zu öffnen",
    "pz_done": "{done} von {all} gelöst",
    "pz_nothing": "(nichts)",
    "pz_brief": "Die Aufgabe",
    "games": "Spiele",
    "games_tip": "Spiele zum Spielen, die du dabei als Flussdiagramm verfolgen kannst",
    "gm_head": "Spiele",
    "gm_small": "Kurze Spiele",
    "gm_big": "Große Spiele",
    "gm_charts": "Diagramme",
    "gm_many": "Mehrere",
    "gm_one": "Ein Diagramm",
    "gm_many_tip": "Jedes Modul und jede Funktion ist ein eigenes Diagramm neben dem Hauptdiagramm",
    "gm_one_tip": "Jedes Modul und jede Funktion wird dort gezeichnet, wo es aufgerufen wird, sodass das Spiel ein einziges Flussdiagramm ist",
    "gm_size": "{n} Zeilen · {charts}",
    "gm_charts_n": "{n} Diagramme",
    "gm_chart_one": "ein Diagramm",
    "gm_how": "So wird gespielt",
    "gm_play": "Spielen",
    "gm_play_tip": "Alles auf einmal ausführen, zum Spielen",
    "gm_all": "Alle Spiele",
    "z_greet_b": "Es grüßt, bevor es gefragt hat. Erst fragen, dann grüßen.",
    "z_range_b": "1 bis 9 soll im Bereich liegen. Im Moment jede Zahl.",
    "z_double_b": "Es soll das Doppelte der eingegebenen Zahl zeigen.",
    "z_order_b": "Es soll nur die Endsumme 6 zeigen, nichts auf dem Weg dorthin.",
    "z_until_b": "Es soll 1, 2, 3 zählen und dann aufhören.",
    "z_nested_b": "Zwei Reihen zu zweit: 1, 2, 2, 4. Die innere Schleife ist eins zu kurz.",
    "z_param_b": "zeige() zeigt den Buchstaben x statt der übergebenen Zahl.",
    "z_many_b": "Von fünf eingegebenen Zahlen soll es sagen, wie viele über 10 sind.",
    "z_divide_b": "Es addiert vier Zahlen, also geht der Mittelwert durch vier, nicht fünf.",
    "z_sign_b": "Über null ist positiv, darunter negativ, und null ist „null“.",
    "z_twice_b": "Es soll das Wort zweimal zeigen.",
    "z_minus_b": "Es soll die zweite Zahl von der ersten abziehen.",
    "z_early_b": "Es zeigt die Antwort, bevor es sie berechnet hat. Es soll das Dreifache zeigen.",
    "z_never_b": "Es soll von 5 bis 1 zählen. Im Moment zeigt es gar nichts.",
    "z_odds_b": "Es soll die geraden Zahlen von 1 bis 10 addieren, zusammen 30.",
    "z_asked_b": "Es soll drei Zahlen erfragen und diese drei addieren.",
    "z_onemore_b": "Es soll 1 bis 10 addieren, zusammen 55.",
    "z_valid_b": "Es soll weiterfragen, bis die Zahl von 1 bis 10 ist, und sie dann zeigen.",
    "z_smallest_b": "Es soll die größte der vier eingegebenen Zahlen zeigen.",
    "z_short_b": "addiere() nimmt zwei Zahlen. Es bekommt nur eine.",
    "z_stops_b": "Es soll 5 bis 1 zeigen und dann „los“.",
    "pz_l4": "Schwerere Fehler",
    "pz_l5": "Echte Bugs",
    "z_fizz_b": "15 soll FizzBuzz sagen. Die Tests stehen in der falschen Reihenfolge.",
    "z_prime_b": "Eine Primzahl hat genau zwei Teiler. Hier gilt 1 als prim.",
    "z_digits_b": "Es soll sagen, wie viele Ziffern die Zahl hat. 7 hat eine.",
    "z_revzero_b": "Es soll die Ziffern umdrehen. Aus 123 wird 321.",
    "z_sumd_b": "Es soll die Ziffern der Zahl addieren. 123 ergibt 6.",
    "z_gridrow_b": "Drei Reihen: 1 2 3, dann 2 4 6, dann 3 6 9. Die Reihe ändert sich nie.",
    "z_tri_b": "Es soll jede Dreieckszahl unterwegs zeigen: 1, 3, 6, 10.",
    "z_lowhigh_b": "Es soll die kleinste und dann die größte der vier Zahlen zeigen.",
    "z_starsrow_b": "Reihe eins ein Stern, Reihe zwei zwei Sterne, und so weiter.",
    "z_factloop_b": "Mal null ist null. 4 Fakultät ist 24.",
    "z_report_b": "Fünf Noten gehen hinein, also geht der Mittelwert durch fünf.",
    "z_tries_b": "Drei Versuche beim Passwort, und dann gesperrt.",
    "z_discount_b": "Über 50 gibt zehn Prozent Rabatt, 60 soll also 54 ergeben.",
    "z_convert_b": "C nach F ist neun Fünftel und dann plus 32. 100 C sind 212 F.",
    "z_tie_b": "Gleich viele Stimmen sollen ein Unentschieden ergeben.",
    "z_fibstep_b": "Es soll 0, 1, 1, 2, 3 zeigen. Die zwei Zahlen werden falsch herum verschoben.",
    "z_coins_b": "132 Cent sind 1 Dollar, 3 Zehner und 2 Pennies.",
    "z_score_b": "Eine richtige Antwort gibt einen Punkt, eine falsche keinen.",
    "z_sent_b": "Zahlen bis 0 getippt wird, dann der Mittelwert der Zahlen davor.",
    "z_menu0_b": "0 soll es beenden. Im Moment geht es wieder von vorn los.",
    "z_else_b": "Unter 18 wird gar nichts gesagt. Es sollte „raus“ heißen.",
    "z_swap_b": "Über 10 ist groß, 10 oder weniger ist klein. Hier ist es vertauscht.",
    "z_count_b": "Es sollte von 1 bis 5 zählen.",
    "z_forever_b": "Es sollte 3, 2, 1 und dann „los“ zeigen. Im Moment hört es nie auf.",
    "z_total_b": "Es sollte 1, 2, 3 und 4 addieren und 10 zeigen.",
    "z_two_b": "Es sollte zwei Zahlen addieren und das Ergebnis zeigen.",
    "z_return_b": "doppelt() sollte die verdoppelte Zahl zurückgeben, damit Display sie zeigt.",
    "z_evens_b": "Es sollte nur die geraden Zahlen von 1 bis 10 zeigen.",
    "z_grade_b": "60 ist bestanden. Im Moment fällt 60 durch.",
    "e_add": "Zwei Zahlen addieren",
    "e_oddeven": "Gerade oder ungerade",
    "e_guess": "Zahl raten",
    "e_factorial": "Eine Fakultät",
    "try_short": "Neu hier?",
    "try_go": "Beispiel ausprobieren",
    "e_sumevens": "Die geraden addieren",
    "e_vowel": "Vokal oder nicht",
    "e_leap": "Schaltjahr",
    "eg_l4": "Programme für den Alltag",
    "eg_l5": "Größere Projekte",
    "e_bank": "Ein Bankkonto",
    "e_gradebook": "Ein Notenbuch",
    "e_paycheck": "Wöchentliche Lohnabrechnungen",
    "e_vending": "Ein Snackautomat",
    "e_primelist": "Primzahlen bis zu einer Grenze",
    "e_weekday": "Welcher Wochentag?",
    "e_loan": "Einen Kredit abbezahlen",
    "e_rps": "Schere, Stein, Papier",
    "e_library": "Bibliotheksausleihe",
    "e_inventory": "Lagerverwaltung",
    "e_tictactoe": "Tic-Tac-Toe",
    "e_weather": "Zwei Wochen Wetter",
    "e_sortsearch": "Punkte sortieren und suchen",
    "e_hailstone": "Hagelkornzahlen",
    "e_rainfall": "Regen Monat für Monat",
    "e_savings": "Ersparnisse Jahr für Jahr",
    "e_classlist": "Eine Klassenliste aus Datensätzen",
    # ---- a name for a program nobody named, from what it does (09-names.js)
    "d_rps": "Schere, Stein, Papier",
    "d_weekday": "Wochentag",
    "d_leap": "Schaltjahr-Prüfung",
    "d_bank": "Bankkonto",
    "d_loan": "Kredittilgung",
    "d_budget": "Budgetanalyse",
    "d_rise": "{what}: Anstieg",
    "d_fall": "{what}: Rückgang",
    "d_doubling": "{what}: Verdopplung",
    "d_pop_growth": "Bevölkerungswachstum",
    "d_compound": "Zinseszins",
    "d_to": "{from} in {to}",
    "d_total_of": "{what} insgesamt",
    "d_average_of": "{what} im Durchschnitt",
    "d_pay": "Lohnabrechnung",
    "d_tip": "Trinkgeldrechner",
    "d_vending": "Verkaufsautomat",
    "d_change": "Wechselgeld",
    "d_shop": "Rabattpreis",
    "d_price": "Einkaufspreis",
    "d_convert": "Einheitenumrechner",
    "d_temps": "Celsius in Fahrenheit",
    "d_temps_any": "Temperaturumrechner",
    "d_primes": "Primzahlen",
    "d_prime": "Primzahltest",
    "d_fizz": "FizzBuzz",
    "d_gcd": "Größter gemeinsamer Teiler",
    "d_fib": "Fibonacci-Zahlen",
    "d_factorial": "Fakultät",
    "d_reverse": "Ziffern rückwärts",
    "d_digits": "Anzahl der Ziffern",
    "d_gradebook": "Notenbuch",
    "d_grades": "Schulnote",
    "d_votes": "Stimmenauszählung",
    "d_quiz": "Quiz",
    "d_login": "Passwortabfrage",
    "d_guess": "Zahlenratespiel",
    "d_vowel": "Vokaltest",
    "d_stars": "Sternendreieck",
    "d_grid": "Einmaleins-Tafel",
    "d_table": "Einmaleinsreihe",
    "d_minmax": "Kleinste und größte Zahl",
    "d_biggest": "Größte Zahl",
    "d_scores": "Punktzahlen",
    "d_average": "Durchschnitt",
    "d_sumevens": "Summe der geraden Zahlen von {a} bis {b}",
    "d_sumevens_any": "Summe der geraden Zahlen",
    "d_oddeven": "Gerade oder ungerade",
    "d_swap": "Zwei Werte tauschen",
    "d_area": "Rechteckfläche",
    "d_menu": "Auswahlmenü",
    "d_down_n": "Countdown von {n}",
    "d_down": "Countdown",
    "d_in_range": "Eingabeprüfung",
    "d_sum": "Summe von {a} bis {b}",
    "d_sum_any": "Laufende Summe",
    "d_count": "Zählen von {a} bis {b}",
    "d_add": "Zwei Zahlen addieren",
    "d_greet": "Begrüßung",
    "d_checks": "{what} prüfen",
    "d_while": "Schleife: {what}",
    "d_until": "Schleife: {what}",
    "d_repeats": "Schleife von {a} bis {b}",
    "d_uses": "{names}",
    "d_asks": "{what} eingeben",
    "d_asks_shows": "Rechner: {what}",
    "d_one": "eine Zahl",
    "d_two": "zwei Zahlen",
    "d_three": "drei Zahlen",
    "d_numbers": "{n} Zahlen",
    "d_circle": "Kreisfläche",
    "d_roman": "Römische Zahlen",
    "d_dice": "Würfeln",
    "d_coin": "Münzwurf",
    "d_reverse_text": "Wort rückwärts",
    "d_count_of": "Anzahl: {what}",
    "d_per": "{a} pro {b}",
    "d_number": "Zahl",
    "d_and": "und",
    "e_fizz": "Fizz und Buzz",
    "e_prime": "Ist es eine Primzahl?",
    "e_gcd": "Größter gemeinsamer Teiler",
    "e_grid": "Ein Einmaleins-Gitter",
    "e_minmax": "Kleinste und größte",
    "e_stars": "Ein Dreieck aus Sternen",
    "e_report": "Ein Klassenbericht",
    "e_login": "Drei Versuche beim Passwort",
    "e_shop": "Eine Kasse mit Rabatt",
    "e_temps": "Celsius, Fahrenheit und Kelvin",
    "e_votes": "Stimmen zählen",
    "e_fib": "Die Fibonacci-Zahlen",
    "e_change": "Dollar, Zehner und Pennies",
    "e_quiz": "Ein Quiz mit drei Fragen",
    "eg_head": "Beispiele",
    "eg_lines": "{n} Zeilen",
    "eg_more": "Mehr Beispiele",
    "eg_l1": "Erste Schritte",
    "eg_l2": "Entscheidungen und Schleifen",
    "eg_l3": "Zahlen und Muster",
    "e_ask": "Fragen und zeigen",
    "e_decide": "Eine Entscheidung",
    "e_count": "Zählen",
    "e_total": "Eine laufende Summe",
    "e_while": "Eine While-Schleife",
    "e_grades": "Noten",
    "e_biggest": "Die größte von dreien",
    "e_menu": "Ein Menü",
    "e_keepasking": "Immer wieder fragen",
    "e_module": "Ein Modul",
    "e_answers": "Eine Funktion mit Rückgabe",
    "e_countdown": "Countdown",
    "try_one": "Neu hier? Fangen Sie mit einem davon an:",
    "eg_decision": "Eine Entscheidung", "eg_loop": "Eine Schleife", "eg_module": "Ein Modul",
    "r_pace": "Wie es läuft", "r_at_once": "Auf einmal",
    "r_by_step": "Einzeln", "r_next": "Nächster Schritt",
    "r_timed": "Im Takt des Programms",
    "chart_desc": "Flussdiagramm mit {n} Formen: {kinds}.",
    "yes_plain": "Ja", "no_plain": "Nein",
    "more_head": "Diagramm-Optionen",
    "o_words": "Sprache und Wörter",
    "o_chains": "Lange If-Ketten untereinander setzen",
    "o_shapes": "Die Formen", "o_paper": "Abstände und Papier",
    "o_for": "For-Schleifen", "o_for_wide": "Ausgeschrieben", "o_for_hex": "Ein Sechseck",
    "o_everyout": "Ein Symbol für jede Ausgabe",
    "o_onechart": "Module und Funktionen in einem Diagramm",
    "o_roomy": "Großzügig: mehr Platz um jeden Schritt",
    "o_tight": "Kompakt: weniger Symbole, dicht gepackt",
    "o_columns": "Hohes Diagramm in Spalten umbrechen",
    "o_steady": "Jedes Mal dieselbe Zeichnung",
    "o_space": "Abstände", "o_space_tight": "Kompakt",
    "o_space_plain": "Normal", "o_space_roomy": "Großzügig",
    "tidy_head": "Aufräum-Optionen", "t_layout": "Anordnung", "t_shapes": "Formen",
    "t_place": "Auf dem Papier",
    "t_arrows": "Pfeillänge", "t_arrows_sub": "In Kästchen, mindestens",
    "t_turns": "Drehung behalten", "t_fit": "Formen an ihre Wörter anpassen",
    "t_even": "Alle Formen gleich breit", "t_keep": "Behalten",
    "t_stay": "Diagramm an seinem Platz lassen",
    "more": "Optionen", "more_tip": "Weitere Diagramm-Optionen",
    "decide": "Entscheidungen",
    "undo": "Rückgängig", "redo": "Wiederholen",
    "settings": "Einstellungen", "appearance": "Darstellung", "panel_side": "Seite des Panels",
    "side_left": "Links", "side_right": "Rechts", "full_screen": "Vollbild",
    "full_on": "Bildschirm füllen", "full_off": "Vollbild verlassen",
    "no_full": "Dieser Browser kennt kein Vollbild.",
    "app_install": "Als App installieren",
    "wipe_head": "Neu anfangen",
    "wipe_hint": "Löscht alles auf dieser Seite, für einen Neuanfang.",
    "wipe_open": "Alles löschen…",
    "wipe_title1": "Alles löschen?",
    "wipe_said": "Damit verschwindet alles, was du hier gemacht hast:",
    "wipe_l_work": "der Pseudocode, das Diagramm und seine Tests",
    "wipe_l_hand": "die von Hand gemachte Zeichnung",
    "wipe_l_code": "der Code und alle seine Dateien",
    "wipe_l_run": "der Lauf, seine Ausgabe und die Ablauftabelle",
    "wipe_saves": "Auch gespeicherte Stände und gelöste Rätsel",
    "wipe_settings": "Auch Farben, Formen und Einstellungen",
    "wipe_keep": "Meine Arbeit behalten",
    "wipe_next": "Weiter…",
    "wipe_title2": "Zuerst speichern?",
    "wipe_save_q": "Möchtest du deine Arbeit speichern, bevor sie gelöscht wird?",
    "wipe_save_said": "Eine als Datei gespeicherte Kopie öffnet sich wieder über Dateien, Datei öffnen.",
    "wipe_save": "Zuerst eine Kopie speichern",
    "wipe_saved": "Kopie gespeichert als {name}.",
    "wipe_type": "Um alles zu löschen, tippe unten {word}. Das kann nicht rückgängig gemacht werden.",
    "wipe_word": "LÖSCHEN",
    "wipe_back": "Zurück",
    "wipe_go": "Alles löschen",
    "wipe_going": "Wird gelöscht…",
    "keep_save": "Zuerst den Stand speichern",
    "keep_saved": "Unter Gespeicherte Stände gespeichert, Platz {n}.",
    "keep_saved_file": "Die gespeicherten Stände sind voll, darum wurde eine Kopie als Datei gespeichert.",
    "open_head": "Das anstelle deiner Arbeit öffnen?",
    "open_said": "Auf der Seite ist Arbeit. Wenn du das öffnest, tritt es an ihre Stelle.",
    "open_no": "Abbrechen",
    "open_yes": "Öffnen",
    "sync_head_code": "Den Pseudocode ersetzen?",
    "sync_head_hand": "Die Zeichnung ersetzen?",
    "sync_head_lang": "Den Code ersetzen?",
    "sync_code_from_hand": "Der Pseudocode hat eigene Änderungen, und die Zeichnung hat sich seitdem geändert. Weiter schreibt das Programm der Zeichnung anstelle des Pseudocodes.",
    "sync_code_from_lang": "Der Pseudocode hat eigene Änderungen, und der Code hat sich seitdem geändert. Weiter liest den Code an seiner Stelle in den Pseudocode.",
    "sync_hand_from_code": "Die Zeichnung hat eigene Änderungen, und der Pseudocode hat sich seitdem geändert. Weiter zeichnet das Programm des Pseudocodes anstelle der Zeichnung.",
    "sync_lang_from_code": "Der Code hier ist dein eigener, und der Pseudocode hat sich seitdem geändert. Weiter schreibt das Programm des Pseudocodes an seiner Stelle als Code.",
    "sync_keep": "Diesen behalten",
    "sync_go": "Ersetzen",
    "sync_unfinished": "Die Zeichnung ist noch kein ganzes Programm, darum blieb der Pseudocode, wie er war.",
    "app_tip": "Öffnet sich im eigenen Fenster wie eine App und geht offline",
    "app_ios": "Tippe auf Teilen, dann auf Zum Home-Bildschirm.",
    "app_mac": "Wähle in Safari im Menü Ablage „Zum Dock hinzufügen“.",
    "app_done": "Installiert. Geht auch offline.",
    "p_ink": "Tinte", "p_classic": "Klassisch", "p_slate": "Schiefer",
    "p_meadow": "Wiese", "p_sunset": "Abendrot", "p_night": "Nacht", "p_lavender": "Lavendel",
    "p_charcoal": "Anthrazit", "p_ember": "Glut",
    "pseudocode": "Pseudocode", "title": "Titel", "your_name": "Dein Name",
    "code_big": "Bildschirm füllen", "code_small": "Zurück zum Panel", "done": "Fertig",
    "code_lines": "{n} Zeilen",
    "code_ask": "{name} eingeben: ",
    "code_shares": "was das Programm teilt",
    "c_head": "Code exportieren", "c_write": "Den Code schreiben",
    "tr_pick": "Die Sprache, in die dein Code übersetzt wird",
    # (its own words: tr_head is the ground's, 40-land.js, 2026-10-03)
    "tl_head": "Den Code übersetzen", "tl_go": "Übersetzen",
    "c_one": "In einer Datei", "c_apart": "Mehrere Dateien",
    "c_files_tip": "Eine Datei oder eine je Diagramm. Ein langes einzelnes Diagramm wird geteilt.",
    "c_one_chart": "Zu kurz zum Aufteilen: eine einzige Datei.",
    "c_cut_into": "Ohne Module: in {n} Teile zerlegt und was sie teilen.",
    "c_files": "{n} Dateien", "c_save_all": "Alle speichern",
    "c_writing": "Wird geschrieben…",
    "c_zipped": "{n} Dateien, in einer .zip",
    "shape": "Form",
    "language": "Sprache", "key_switch": "Legende", "tint_switch": "Farbtöne",
    "build": "Diagramm zeichnen", "drawing": "Wird gezeichnet…",
    "no_code": "Es gibt noch keinen Pseudocode zum Zeichnen.",
    "failed": "Das ließ sich nicht zeichnen.",
    "not_answering": "Das Studio antwortet nicht ({err}).",
    "empty_chart": "Füge links deinen Pseudocode ein und klicke auf "
                   "Zeichnen.",
    "shape_auto": "Automatisch", "shape_square": "Quadratisch",
    "shape_wide": "Breit 16:9", "shape_page": "Seite", "shape_tall": "Hoch",
    "already": "Schon da {path}",
    "copied": "{n} Dateien nach {dir} kopiert",
    "wrote": "Geschrieben {path}",
    "open_this": "<- diese hier öffnen: sie zeigt das Diagramm und hat "
                 "die Download-Links",
    "style_seed": "Stil-Startwert {seed} (mit --seed {seed} kommt genau "
                  "dieses Bild wieder)",
    "nothing": "Kein Pseudocode angegeben -- nichts zu zeichnen.",
    "studio_at": "Das Flussdiagramm-Studio läuft auf {url}",
    "leave_open": "Lass dieses Fenster offen, solange du es benutzt; "
                  "Strg+C beendet es.",
    "stopped": "Studio beendet.",
    "site_done": "Dieser Ordner ist eine Website. Lade ihn zu GitHub "
                 "Pages hoch (oder zu einem anderen Datei-Host); die "
                 "Schritte stehen in {dir}/README.md.",
    "starting": "Python startet im Browser…",
    "k_head": "Tastenkürzel",
    "k_tip": "Alle Tasten, auf die diese Seite reagiert (?)",
    "k_any": "Überall",
    "k_code": "Beim Schreiben von Pseudocode",
    "k_shape": "Mit einer gewählten Form",
    "k_hand": "Zeichnen",
    "k_lang": "Beim Schreiben von Code",
    "k_build": "Diagramm zeichnen (Zeichnung: prüfen)",
    "k_undo": "Rückgängig und wiederholen",
    "k_zoom": "Vergrößern, verkleinern, Originalgröße",
    "k_close": "Schließen, was offen ist",
    "k_keys": "Diese Liste zeigen",
    "k_indent": "Zeilen einrücken oder ausrücken",
    "k_enter": "Neue Zeile, passend eingerückt",
    "k_look": "Fett, kursiv, unterstrichen",
    "k_size": "Schrift größer oder kleiner",
    "k_next": "Nächste Form oder die davor",
    "k_nudge": "Ein Stück verschieben (Umschalt: weiter)",
    "k_drop": "Loslassen",
    "k_lasso": "Alle Formen in einem Rahmen auswählen",
    "k_add": "Eine Form dazunehmen oder weglassen",
    "k_all": "Alle Formen auswählen",
    "k_clip": "Kopieren, ausschneiden und einfügen",
    "k_pan": "Über das Blatt bewegen",
    "kn_ctrl": "Strg",
    "kn_shift": "Umschalt",
    "kn_enter": "Eingabe",
    "kn_del": "Entf",
    "kn_space": "Leertaste",
    "kn_click": "Klick",
    "kn_drag": "ziehen",
    "kn_dblclick": "Doppelklick",
    "kn_rclick": "Rechtsklick",
    "kn_hold": "gedrückt halten",
    "kn_wheel": "Mausrad",
    "kn_pinch": "zwei Finger",
    "kn_corner": "Ecke ziehen",
    "kn_dot": "Punkt ziehen",
    "kn_spin": "runden Griff ziehen",
    "kn_plus": "Klick auf +",
    "b_about": "Wie weit die Zeichnung ist",
    "b_boot": "Python startet im Browser",
    "b_read": "Pseudocode wird gelesen",
    "b_lay": "Formen werden angeordnet",
    "b_draw": "Diagramm wird gezeichnet",
    "b_page": "Kommt auf die Seite",
    "ready": "Fertig.",
    "boot_failed": "Python konnte in diesem Browser nicht starten ({err}).",
    "py_gave_out": "Python ist mitten in dieser Zeichnung abgebrochen ({err}).",
    # ================================================================
    #  The programs it offers, written out in full: the fifty examples
    #  (e_ask_p is the one the button e_ask opens) and the fifty
    #  puzzles (z_else_p).  The keywords stay in English -- Display,
    #  If, While are what you type -- and everything else is in this
    #  language: what it says, and what it calls its boxes, modules
    #  and functions (plain letters only, which every language the
    #  code is written out in accepts).  Each is the English program
    #  line for line, and each puzzle has the same fault.
    # ================================================================
    # ---- the examples: getting started
    "e_ask_p": program("""
        Start
        Declare String name
        Display "Wie heißt du?"
        Input name
        Display "Hallo"
        Display name
        Stop
    """),
    "e_add_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Display "Bitte zwei Zahlen"
        Input a
        Input b
        Display "Zusammen ergeben sie"
        Display a + b
        Stop
    """),
    "e_decide_p": program("""
        Start
        Declare Integer alter
        Display "Wie alt bist du?"
        Input alter
        If alter >= 18 Then
            Display "Alt genug zum Wählen"
        Else
            Display "Noch nicht alt genug"
        End If
        Stop
    """),
    "e_oddeven_p": program("""
        Start
        Declare Integer n
        Display "Gib eine Zahl ein"
        Input n
        If n mod 2 = 0 Then
            Display "gerade"
        Else
            Display "ungerade"
        End If
        Stop
    """),
    "e_count_p": program("""
        Start
        For i = 1 To 5
            Display i
        End For
        Stop
    """),
    "e_while_p": program("""
        Start
        Declare Integer n
        n = 1
        While n <= 5
            Display n
            n = n + 1
        End While
        Stop
    """),
    "e_total_p": program("""
        Start
        Declare Integer summe
        summe = 0
        For i = 1 To 10
            summe = summe + i
        End For
        Display "Die Summe ist"
        Display summe
        Stop
    """),
    "e_module_p": program("""
        Start
        Declare String name
        Input name
        Call gruessen(name)
        Stop

        Module gruessen(wer)
            Display "Hallo"
            Display wer
        End Module
    """),
    "e_answers_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer summe
        Input a
        Input b
        summe = addiere(a, b)
        Display "Das Ergebnis ist"
        Display summe
        Stop

        Function addiere(x, y)
            Return x + y
        End Function
    """),
    # ---- the examples: decisions and loops
    "e_grades_p": program("""
        Start
        Declare Integer punkte
        Display "Gib die Punktzahl ein"
        Input punkte
        If punkte >= 90 Then
            Display "A"
        Else If punkte >= 80 Then
            Display "B"
        Else If punkte >= 70 Then
            Display "C"
        Else If punkte >= 60 Then
            Display "D"
        Else
            Display "F"
        End If
        Stop
    """),
    "e_biggest_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer c
        Declare Integer groesste
        Input a
        Input b
        Input c
        groesste = a
        If b > groesste Then
            groesste = b
        End If
        If c > groesste Then
            groesste = c
        End If
        Display "Die größte ist"
        Display groesste
        Stop
    """),
    "e_menu_p": program("""
        Start
        Declare Integer wahl
        Display "1 addieren  2 subtrahieren  3 beenden"
        Input wahl
        Select Case wahl
            Case 1
                Display "Addiere"
            Case 2
                Display "Subtrahiere"
            Case Else
                Display "Tschüss"
        End Select
        Stop
    """),
    "e_vowel_p": program("""
        Start
        Declare String buchstabe
        Display "Gib einen Buchstaben ein"
        Input buchstabe
        Select Case buchstabe
            Case "a"
                Display "Vokal"
            Case "e"
                Display "Vokal"
            Case "i"
                Display "Vokal"
            Case "o"
                Display "Vokal"
            Case "u"
                Display "Vokal"
            Case Else
                Display "kein Vokal"
        End Select
        Stop
    """),
    "e_leap_p": program("""
        Start
        Declare Integer jahr
        Display "Welches Jahr?"
        Input jahr
        If jahr mod 400 = 0 Then
            Display "Schaltjahr"
        Else If jahr mod 100 = 0 Then
            Display "kein Schaltjahr"
        Else If jahr mod 4 = 0 Then
            Display "Schaltjahr"
        Else
            Display "kein Schaltjahr"
        End If
        Stop
    """),
    "e_keepasking_p": program("""
        Start
        Declare Integer n
        Do
            Display "Gib eine Zahl von 1 bis 10 ein"
            Input n
        Until n >= 1 And n <= 10
        Display "Danke"
        Stop
    """),
    "e_sumevens_p": program("""
        Start
        Declare Integer summe
        summe = 0
        For i = 1 To 20
            If i mod 2 = 0 Then
                summe = summe + i
            End If
        End For
        Display "Die geraden Zahlen ergeben zusammen"
        Display summe
        Stop
    """),
    "e_countdown_p": program("""
        Start
        Declare Integer n
        n = 10
        While n > 0
            Display n
            If n = 5 Then
                Display "Halbzeit"
            End If
            n = n - 1
        End While
        Display "Abheben"
        Stop
    """),
    "e_guess_p": program("""
        Start
        Declare Integer geheim
        Declare Integer tipp
        geheim = 7
        Do
            Display "Rate meine Zahl"
            Input tipp
            If tipp < geheim Then
                Display "Höher"
            End If
            If tipp > geheim Then
                Display "Niedriger"
            End If
        Until tipp = geheim
        Display "Richtig geraten"
        Stop
    """),
    # ---- the examples: numbers and patterns
    "e_fizz_p": program("""
        Start
        For i = 1 To 15
            If i mod 15 = 0 Then
                Display "FizzBuzz"
            Else If i mod 3 = 0 Then
                Display "Fizz"
            Else If i mod 5 = 0 Then
                Display "Buzz"
            Else
                Display i
            End If
        End For
        Stop
    """),
    "e_prime_p": program("""
        Start
        Declare Integer n
        Declare Integer teiler
        Display "Gib eine Zahl ein"
        Input n
        teiler = 0
        For i = 1 To n
            If n mod i = 0 Then
                teiler = teiler + 1
            End If
        End For
        If teiler = 2 Then
            Display "Primzahl"
        Else
            Display "keine Primzahl"
        End If
        Stop
    """),
    "e_gcd_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Display "Bitte zwei Zahlen"
        Input a
        Input b
        While a <> b
            If a > b Then
                a = a - b
            Else
                b = b - a
            End If
        End While
        Display "Der größte gemeinsame Teiler ist"
        Display a
        Stop
    """),
    "e_fib_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer naechste
        a = 0
        b = 1
        For i = 1 To 10
            Display a
            naechste = a + b
            a = b
            b = naechste
        End For
        Stop
    """),
    "e_factorial_p": program("""
        Start
        Declare Integer n
        Declare Integer ergebnis
        Display "Gib eine Zahl ein"
        Input n
        ergebnis = 1
        For i = 1 To n
            ergebnis = ergebnis * i
        End For
        Display "Die Fakultät ist"
        Display ergebnis
        Stop
    """),
    "e_minmax_p": program("""
        Start
        Declare Integer n
        Declare Integer kleinste
        Declare Integer groesste
        Display "Bitte fünf Zahlen"
        Input n
        kleinste = n
        groesste = n
        For i = 2 To 5
            Input n
            If n < kleinste Then
                kleinste = n
            End If
            If n > groesste Then
                groesste = n
            End If
        End For
        Display "Kleinste"
        Display kleinste
        Display "Größte"
        Display groesste
        Stop
    """),
    "e_grid_p": program("""
        Start
        For reihe = 1 To 5
            For spalte = 1 To 5
                Display reihe * spalte
            End For
        End For
        Stop
    """),
    "e_stars_p": program("""
        Start
        Declare String zeile
        Declare Integer n
        Display "Wie viele Reihen?"
        Input n
        For reihe = 1 To n
            zeile = ""
            For spalte = 1 To reihe
                zeile = zeile + "*"
            End For
            Display zeile
        End For
        Stop
    """),
    # ---- the examples: everyday programs
    "e_change_p": program("""
        Start
        Declare Integer cent
        Display "Wie viele Cent?"
        Input cent
        Display "Dollar"
        Display cent div 100
        cent = cent mod 100
        Display "Zehner"
        Display cent div 10
        Display "Pennies"
        Display cent mod 10
        Stop
    """),
    "e_temps_p": program("""
        Start
        Declare String vonSkala
        Declare String nachSkala
        Declare Real grad
        Declare Real celsius
        Declare Real ergebnis
        Declare String nochmal
        Do
            vonSkala = frageSkala("Umrechnen von C, F oder K?")
            nachSkala = frageSkala("Umrechnen in C, F oder K?")
            Display "Die Temperatur?"
            Input grad
            celsius = inCelsius(grad, vonSkala)
            ergebnis = round(ausCelsius(celsius, nachSkala) * 100) / 100
            Display grad, " ", vonSkala, " sind ", ergebnis, " ", nachSkala
            Display "Noch eine? j oder n"
            Input nochmal
        Until toupper(nochmal) <> "J"
        Stop

        Function frageSkala(frage)
            Declare String skala
            Display frage
            Input skala
            skala = toupper(skala)
            While skala <> "C" And skala <> "F" And skala <> "K"
                Display "Bitte C, F oder K eingeben"
                Input skala
                skala = toupper(skala)
            End While
            Return skala
        End Function

        Function inCelsius(g, skala)
            If skala = "F" Then
                Return (g - 32) * 5 / 9
            Else If skala = "K" Then
                Return g - 273.15
            Else
                Return g
            End If
        End Function

        Function ausCelsius(g, skala)
            If skala = "F" Then
                Return g * 9 / 5 + 32
            Else If skala = "K" Then
                Return g + 273.15
            Else
                Return g
            End If
        End Function
    """),
    "e_shop_p": program("""
        Start
        Declare Integer anzahl
        Declare Real preis
        Declare Real summe
        Display "Wie viele?"
        Input anzahl
        Display "Preis pro Stück?"
        Input preis
        summe = anzahl * preis
        If summe > 50 Then
            summe = summe * 0.9
            Display "Zehn Prozent Rabatt"
        End If
        Display "Zu zahlen: $", summe
        Stop
    """),
    "e_report_p": program("""
        Start
        Declare Integer punkte
        Declare Integer summe
        Declare Integer bestanden
        Declare Integer beste
        summe = 0
        bestanden = 0
        beste = 0
        For i = 1 To 5
            Display "Gib eine Punktzahl ein"
            Input punkte
            summe = summe + punkte
            If punkte >= 60 Then
                bestanden = bestanden + 1
            End If
            If punkte > beste Then
                beste = punkte
            End If
        End For
        Display "Bestanden"
        Display bestanden
        Display "Durchschnitt"
        Display summe / 5
        Display "Beste"
        Display beste
        Stop
    """),
    "e_votes_p": program("""
        Start
        Declare String stimme
        Declare Integer rote
        Declare Integer blaue
        rote = 0
        blaue = 0
        For i = 1 To 5
            Display "rot oder blau?"
            Input stimme
            If stimme = "rot" Then
                rote = rote + 1
            Else
                blaue = blaue + 1
            End If
        End For
        Display "Rot"
        Display rote
        Display "Blau"
        Display blaue
        If rote > blaue Then
            Display "Rot gewinnt"
        Else If blaue > rote Then
            Display "Blau gewinnt"
        Else
            Display "Unentschieden"
        End If
        Stop
    """),
    "e_quiz_p": program("""
        Start
        Declare Integer punkte
        punkte = 0
        punkte = punkte + gefragt("2 plus 2?", 4)
        punkte = punkte + gefragt("5 mal 3?", 15)
        punkte = punkte + gefragt("10 minus 7?", 3)
        Display "Deine Punktzahl"
        Display punkte
        Stop

        Function gefragt(frage, antwort)
            Declare Integer gesagt
            Display frage
            Input gesagt
            If gesagt = antwort Then
                Display "Richtig"
                Return 1
            Else
                Display "Falsch"
                Return 0
            End If
        End Function
    """),
    "e_login_p": program("""
        Start
        Declare String wort
        Declare Integer versuche
        versuche = 0
        Do
            Display "Passwort?"
            Input wort
            versuche = versuche + 1
        Until wort = "offen" Or versuche = 3
        Call urteil(wort)
        Stop

        Module urteil(gesagt)
            If gesagt = "offen" Then
                Display "Willkommen"
            Else
                Display "Gesperrt"
            End If
        End Module
    """),
    # ---- the examples: bigger projects
    "e_bank_p": program("""
        Start
        Declare Real kontostand
        Declare Integer wahl
        kontostand = 0
        Do
            Display "1 einzahlen  2 abheben  3 Kontostand  4 beenden"
            Input wahl
            Select Case wahl
                Case 1
                    Call einzahlen(kontostand)
                Case 2
                    Call abheben(kontostand)
                Case 3
                    Display "Dein Kontostand ist $", kontostand
                Case 4
                    Display "Auf Wiedersehen"
                Case Else
                    Display "Wähle 1, 2, 3 oder 4"
            End Select
        Until wahl = 4
        Stop

        Module einzahlen(Real Ref geld)
            Declare Real betrag
            Display "Wie viel einzahlen?"
            Input betrag
            If betrag <= 0 Then
                Display "Eine Einzahlung muss mehr als null sein"
            Else
                geld = geld + betrag
                Display "Eingezahlt: $", betrag
            End If
        End Module

        Module abheben(Real Ref geld)
            Declare Real betrag
            Display "Wie viel abheben?"
            Input betrag
            If betrag <= 0 Then
                Display "Eine Abhebung muss mehr als null sein"
            Else If betrag > geld Then
                Display "Nicht genug Geld. Du hast $", geld
            Else
                geld = geld - betrag
                Display "Abgehoben: $", betrag
            End If
        End Module
    """),
    "e_gradebook_p": program("""
        Start
        Declare Integer schueler
        Declare Integer punkte
        Declare Integer summe
        Declare Integer hoechste
        Declare Integer niedrigste
        Declare Integer bestanden
        Declare String note
        summe = 0
        bestanden = 0
        hoechste = 0
        niedrigste = 100
        Display "Wie viele Schüler?"
        Input schueler
        While schueler < 1
            Display "Es muss mindestens einen Schüler geben"
            Input schueler
        End While
        For i = 1 To schueler
            Display "Punktzahl für Schüler ", i
            Input punkte
            While punkte < 0 Or punkte > 100
                Display "Eine Punktzahl geht von 0 bis 100. Versuch es noch einmal"
                Input punkte
            End While
            note = buchstabenNote(punkte)
            Display "Das ist die Note ", note
            summe = summe + punkte
            If note <> "F" Then
                bestanden = bestanden + 1
            End If
            If punkte > hoechste Then
                hoechste = punkte
            End If
            If punkte < niedrigste Then
                niedrigste = punkte
            End If
        End For
        Display "Klassendurchschnitt: ", summe / schueler
        Display "Höchste Punktzahl: ", hoechste
        Display "Niedrigste Punktzahl: ", niedrigste
        Display "Bestanden haben: ", bestanden
        Stop

        Function String buchstabenNote(Integer wert)
            If wert >= 90 Then
                Return "A"
            Else If wert >= 80 Then
                Return "B"
            Else If wert >= 70 Then
                Return "C"
            Else If wert >= 60 Then
                Return "D"
            Else
                Return "F"
            End If
        End Function
    """),
    "e_paycheck_p": program("""
        Start
        Constant Real STEUERSATZ = 0.15
        Declare String name
        Declare Real stunden
        Declare Real lohn
        Declare Real brutto
        Declare Real steuer
        Declare Integer bezahlt
        bezahlt = 0
        Display "Name des Mitarbeiters? Tippe fertig zum Beenden"
        Input name
        While name <> "fertig"
            Display "Arbeitsstunden diese Woche?"
            Input stunden
            Display "Stundenlohn?"
            Input lohn
            brutto = bruttoLohn(stunden, lohn)
            steuer = brutto * STEUERSATZ
            Display name, " hat $", brutto, " verdient"
            Display "Einbehaltene Steuern: $", steuer
            Display "Nettolohn: $", brutto - steuer
            bezahlt = bezahlt + 1
            Display "Name des Mitarbeiters? Tippe fertig zum Beenden"
            Input name
        End While
        Display "Abgerechnete Lohnzettel: ", bezahlt
        Stop

        Function Real bruttoLohn(Real gearbeitet, Real proStunde)
            Declare Real ueberstunden
            If gearbeitet <= 40 Then
                Return gearbeitet * proStunde
            Else
                ueberstunden = gearbeitet - 40
                Return 40 * proStunde + ueberstunden * proStunde * 1.5
            End If
        End Function
    """),
    "e_vending_p": program("""
        Start
        Declare Integer preis
        Declare Integer bezahlt
        Declare Integer muenze
        Display "Was kostet der Snack, in Cent?"
        Input preis
        While preis <= 0 Or preis mod 5 <> 0
            Display "Die Preise hier gehen in Schritten von 5 Cent"
            Input preis
        End While
        bezahlt = 0
        While bezahlt < preis
            Display "Noch offen: ", preis - bezahlt, " Cent. Wirf 5, 10 oder 25 ein"
            Input muenze
            Select Case muenze
                Case 5
                    bezahlt = bezahlt + muenze
                Case 10
                    bezahlt = bezahlt + muenze
                Case 25
                    bezahlt = bezahlt + muenze
                Case Else
                    Display "Dieser Automat nimmt nur Fünfer, Zehner und Vierteldollar"
            End Select
        End While
        Display "Guten Appetit"
        If bezahlt > preis Then
            Call wechselgeld(bezahlt - preis)
        End If
        Stop

        Module wechselgeld(Integer cent)
            Display "Dein Wechselgeld: ", cent, " Cent"
            Display "Vierteldollar: ", cent div 25
            cent = cent mod 25
            Display "Zehner: ", cent div 10
            cent = cent mod 10
            Display "Fünfer: ", cent div 5
        End Module
    """),
    "e_primelist_p": program("""
        Start
        Declare Integer grenze
        Declare Integer gefunden
        Declare Integer summe
        Display "Primzahlen bis zu welcher Zahl finden?"
        Input grenze
        While grenze < 2
            Display "Wähle eine Zahl ab 2"
            Input grenze
        End While
        gefunden = 0
        summe = 0
        For n = 2 To grenze
            If istPrim(n) Then
                Display n
                gefunden = gefunden + 1
                summe = summe + n
            End If
        End For
        Display "Gefundene Primzahlen: ", gefunden
        Display "Zusammen ergeben sie ", summe
        Stop

        Function Boolean istPrim(Integer zahl)
            Declare Integer d
            d = 2
            While d * d <= zahl
                If zahl mod d = 0 Then
                    Return False
                End If
                d = d + 1
            End While
            Return True
        End Function
    """),
    "e_weekday_p": program("""
        Start
        Declare Integer jahr
        Declare Integer monat
        Declare Integer tag
        Display "Jahr?"
        Input jahr
        Display "Monat, von 1 bis 12?"
        Input monat
        While monat < 1 Or monat > 12
            Display "Ein Monat geht von 1 bis 12"
            Input monat
        End While
        Display "Tag im Monat?"
        Input tag
        While tag < 1 Or tag > tageIm(monat, jahr)
            Display "Dieser Monat hat ", tageIm(monat, jahr), " Tage"
            Input tag
        End While
        Display monat, "/", tag, "/", jahr, " ist ein ", tagesName(wochentag(jahr, monat, tag))
        Stop

        Function Integer tageIm(Integer m, Integer y)
            Select Case m
                Case 2
                    If istSchaltjahr(y) Then
                        Return 29
                    Else
                        Return 28
                    End If
                Case 4
                    Return 30
                Case 6
                    Return 30
                Case 9
                    Return 30
                Case 11
                    Return 30
                Case Else
                    Return 31
            End Select
        End Function

        Function Boolean istSchaltjahr(Integer y)
            Return (y mod 4 = 0 And y mod 100 <> 0) Or y mod 400 = 0
        End Function

        Function Integer wochentag(Integer y, Integer m, Integer d)
            Declare Integer k
            Declare Integer j
            If m < 3 Then
                m = m + 12
                y = y - 1
            End If
            k = y mod 100
            j = y div 100
            Return (d + 13 * (m + 1) div 5 + k + k div 4 + j div 4 + 5 * j) mod 7
        End Function

        Function String tagesName(Integer h)
            Select Case h
                Case 0
                    Return "Samstag"
                Case 1
                    Return "Sonntag"
                Case 2
                    Return "Montag"
                Case 3
                    Return "Dienstag"
                Case 4
                    Return "Mittwoch"
                Case 5
                    Return "Donnerstag"
                Case Else
                    Return "Freitag"
            End Select
        End Function
    """),
    "e_loan_p": program("""
        Start
        Declare Real rest
        Declare Real zinssatz
        Declare Real zahlung
        Declare Real zinsen
        Declare Real gezahlteZinsen
        Declare Integer monate
        Display "Wie hoch ist der Kredit?"
        Input rest
        Display "Jährlicher Zinssatz, in Prozent?"
        Input zinssatz
        Display "Monatliche Rate?"
        Input zahlung
        zinsen = rest * zinssatz / 100 / 12
        If zahlung <= zinsen Then
            Display "So wird er nie abbezahlt. Zahle mehr als $", zinsen
        Else
            monate = 0
            gezahlteZinsen = 0
            While rest > 0
                zinsen = rest * zinssatz / 100 / 12
                gezahlteZinsen = gezahlteZinsen + zinsen
                rest = rest + zinsen - zahlung
                monate = monate + 1
                If monate mod 12 = 0 And rest > 0 Then
                    Display "Nach Jahr ", monate div 12, " schuldest du noch $", rest
                End If
            End While
            Display "Abbezahlt nach ", monate, " Monaten"
            Display "Die letzte Rate ist nur $", zahlung + rest
            Display "Zinsen insgesamt: $", gezahlteZinsen
        End If
        Stop
    """),
    "e_rps_p": program("""
        Start
        Declare Integer spieler
        Declare Integer computer
        Declare Integer ergebnis
        Declare Integer siege
        Declare Integer niederlagen
        siege = 0
        niederlagen = 0
        For spiel = 1 To 5
            Display "Spiel ", spiel, ": 1 Stein, 2 Papier, 3 Schere"
            Input spieler
            While spieler < 1 Or spieler > 3
                Display "Wähle 1, 2 oder 3"
                Input spieler
            End While
            computer = random(1, 3)
            Display "Du: ", nameVon(spieler), "   Computer: ", nameVon(computer)
            ergebnis = gewinner(spieler, computer)
            If ergebnis = 1 Then
                Display "Diese Runde gewinnst du"
                siege = siege + 1
            Else If ergebnis = 2 Then
                Display "Diese Runde gewinnt der Computer"
                niederlagen = niederlagen + 1
            Else
                Display "Unentschieden"
            End If
        End For
        Display "Du hast ", siege, " gewonnen und ", niederlagen, " verloren"
        If siege > niederlagen Then
            Display "Du hast den Computer geschlagen!"
        Else If niederlagen > siege Then
            Display "Der Computer hat dich geschlagen"
        Else
            Display "Insgesamt unentschieden"
        End If
        Stop

        Function String nameVon(Integer wahl)
            Select Case wahl
                Case 1
                    Return "Stein"
                Case 2
                    Return "Papier"
                Case Else
                    Return "Schere"
            End Select
        End Function

        Function Integer gewinner(Integer a, Integer b)
            If a = b Then
                Return 0
            Else If (a - b + 3) mod 3 = 1 Then
                Return 1
            Else
                Return 2
            End If
        End Function
    """),
    "e_hailstone_p": program("""
        Start
        Declare Integer n
        Declare Integer schritte
        Display "Mit welcher Zahl anfangen?"
        Input n
        schritte = 0
        While n <> 1
            If n mod 2 = 0 Then
                n = n div 2
            Else
                n = 3 * n + 1
            End If
            schritte = schritte + 1
            Display n
        End While
        Display "Schritte bis 1: ", schritte
        Stop
    """),
    "e_rainfall_p": program("""
        Start
        Declare Real summe
        Declare String nassester
        regen = {"Jan": 78, "Feb": 52, "Mär": 61, "Apr": 45, "Mai": 30, "Jun": 12}
        Display "Regen in mm: ", regen
        summe = 0
        nassester = "Jan"
        For Each monat In regen
            summe = summe + regen[monat]
            If regen[monat] > regen[nassester] Then
                nassester = monat
            End If
        End For
        Display "Durchschnitt: ", round(summe / length(regen), 1), " mm"
        Display "Nassester Monat: ", nassester
        Stop
    """),
    "e_savings_p": program("""
        Start
        Declare Real anfang
        Declare Real zins
        Declare Integer jahre
        Declare Real stand
        Display "Mit wie viel anfangen?"
        Input anfang
        Display "Zinssatz in Prozent?"
        Input zins
        Display "Für wie viele Jahre?"
        Input jahre
        stand = anfang
        For jahr = 1 To jahre
            stand = wachsen(stand, zins)
            Display "Jahr ", jahr, ": ", round(stand, 2)
        End For
        Display "Gewinn: ", round(stand - anfang, 2)
        Display "Jahre bis zum Verdoppeln: ", jahreBisDoppelt(anfang, zins)
        Stop

        Function wachsen(betrag, prozent)
            Return betrag + betrag * prozent / 100
        End Function

        Function jahreBisDoppelt(betrag, prozent)
            Declare Integer anzahl
            Declare Real jetzt
            If prozent <= 0 Then
                Return 0
            End If
            anzahl = 0
            jetzt = betrag
            While jetzt < betrag * 2
                jetzt = wachsen(jetzt, prozent)
                anzahl = anzahl + 1
            End While
            Return anzahl
        End Function
    """),
    "e_classlist_p": program("""
        Start
        Declare Integer i
        Declare Real summe
        namen = ["Ana", "Ben", "Cy", "Dee", "Eli", "Fay"]
        noten = [88, 72, 95, 64, 79, 91]
        schueler = []
        For i = 0 To length(namen) - 1
            Call append(schueler, neuerSchueler(namen[i], noten[i]))
        End For
        summe = 0
        beste = schueler[0]
        For Each s In schueler
            Display s.name, ": ", s.note
            summe = summe + s.note
            If s.note > beste.note Then
                beste = s
            End If
        End For
        Display "Klassendurchschnitt: ", round(summe / length(schueler), 1)
        Display "Klassenbeste: ", beste.name
        Stop

        Function neuerSchueler(name, note)
            einer = New Schueler
            einer.name = name
            einer.note = note
            Return einer
        End Function
    """),
    "e_library_p": program("""
        Start
        Declare Integer wahl
        Declare Integer stelle
        Declare String titel
        regal = []
        Call append(regal, neuesBuch("Wilbur und Charlotte", "E. B. White"))
        Call append(regal, neuesBuch("Allein in der Wildnis", "Gary Paulsen"))
        Call append(regal, neuesBuch("Löcher", "Louis Sachar"))
        Call append(regal, neuesBuch("Wunder", "R. J. Palacio"))
        Do
            Display "1 Bücher zeigen  2 ausleihen  3 zurückgeben  4 beenden"
            Input wahl
            Select Case wahl
                Case 1
                    Call buecherZeigen(regal)
                Case 2
                    Display "Welchen Titel möchtest du?"
                    Input titel
                    stelle = buchSuchen(regal, titel)
                    If stelle = -1 Then
                        Display "Es gibt kein Buch namens ", titel
                    Else If regal[stelle].ausgeliehen Then
                        Display titel, " ist schon ausgeliehen"
                    Else
                        regal[stelle].ausgeliehen = True
                        Display "Du hast ausgeliehen: ", regal[stelle].titel
                    End If
                Case 3
                    Display "Welchen Titel gibst du zurück?"
                    Input titel
                    stelle = buchSuchen(regal, titel)
                    If stelle = -1 Then
                        Display "Dieses Buch gehört nicht dieser Bibliothek"
                    Else If Not regal[stelle].ausgeliehen Then
                        Display regal[stelle].titel, " war nicht ausgeliehen"
                    Else
                        regal[stelle].ausgeliehen = False
                        Display "Danke für die Rückgabe von ", regal[stelle].titel
                    End If
                Case 4
                    Display "Auf Wiedersehen"
                Case Else
                    Display "Wähle 1, 2, 3 oder 4"
            End Select
        Until wahl = 4
        Display "Noch ausgeliehene Bücher: ", ausgeliehene(regal)
        Stop

        Function neuesBuch(titel, autor)
            eines = New Buch
            eines.titel = titel
            eines.autor = autor
            eines.ausgeliehen = False
            Return eines
        End Function

        Function Integer buchSuchen(buecher, titel)
            For i = 0 To length(buecher) - 1
                If toLower(buecher[i].titel) = toLower(titel) Then
                    Return i
                End If
            End For
            Return -1
        End Function

        Module buecherZeigen(buecher)
            For Each b In buecher
                If b.ausgeliehen Then
                    Display b.titel, " von ", b.autor, " (ausgeliehen)"
                Else
                    Display b.titel, " von ", b.autor, " (im Regal)"
                End If
            End For
        End Module

        Function Integer ausgeliehene(buecher)
            Declare Integer n
            n = 0
            For Each b In buecher
                If b.ausgeliehen Then
                    n = n + 1
                End If
            End For
            Return n
        End Function
    """),
    "e_inventory_p": program("""
        Start
        Declare Integer wahl
        Declare Integer menge
        Declare String ware
        lager = {"Äpfel": 40, "Brot": 12, "Milch": 6, "Eier": 30}
        preise = {"Äpfel": 0.5, "Brot": 2.25, "Milch": 3.1, "Eier": 0.3}
        Do
            Display "1 Lager zeigen  2 verkaufen  3 nachfüllen  4 beenden"
            Input wahl
            Select Case wahl
                Case 1
                    Call lagerZeigen(lager, preise)
                Case 2
                    Display "Welche Ware verkaufen?"
                    Input ware
                    If Not gibtEs(lager, ware) Then
                        Display "Das führen wir nicht: ", ware
                    Else
                        Display "Wie viele?"
                        Input menge
                        If menge <= 0 Then
                            Display "Verkaufe mindestens eins"
                        Else If menge > lager[ware] Then
                            Display "Nur noch ", lager[ware], " da"
                        Else
                            lager[ware] = lager[ware] - menge
                            Display "Verkauft: ", menge, " ", ware, " für $", round(menge * preise[ware], 2)
                        End If
                    End If
                Case 3
                    Display "Welche Ware nachfüllen?"
                    Input ware
                    If Not gibtEs(lager, ware) Then
                        Display "Das führen wir nicht: ", ware
                    Else
                        Display "Wie viele sind gekommen?"
                        Input menge
                        If menge <= 0 Then
                            Display "Eine Lieferung hat mindestens eins"
                        Else
                            lager[ware] = lager[ware] + menge
                            Display "Jetzt sind es ", lager[ware], " ", ware
                        End If
                    End If
                Case 4
                    Display "Feierabend"
                Case Else
                    Display "Wähle 1, 2, 3 oder 4"
            End Select
        Until wahl = 4
        Display "Der Bestand ist $", wert(lager, preise), " wert"
        Stop

        Module lagerZeigen(lager, preise)
            For Each name In lager
                If lager[name] < 10 Then
                    Display name, ": ", lager[name], " für $", preise[name], " -- wird knapp"
                Else
                    Display name, ": ", lager[name], " für $", preise[name]
                End If
            End For
        End Module

        Function Boolean gibtEs(lager, ware)
            For Each name In lager
                If name = ware Then
                    Return True
                End If
            End For
            Return False
        End Function

        Function Real wert(lager, preise)
            Declare Real summe
            summe = 0
            For Each name In lager
                summe = summe + lager[name] * preise[name]
            End For
            Return round(summe, 2)
        End Function
    """),
    "e_tictactoe_p": program("""
        Start
        Declare Integer zug
        Declare Integer zuege
        Declare String spieler
        Declare String sieger
        brett = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
        spieler = "X"
        sieger = ""
        zuege = 0
        While sieger = "" And zuege < 9
            Call brettZeigen(brett)
            Display "Spieler ", spieler, ", wähle ein Feld von 1 bis 9"
            Input zug
            While zug < 1 Or zug > 9
                Display "Die Felder gehen von 1 bis 9"
                Input zug
            End While
            If brett[zug - 1] <> " " Then
                Display "Das Feld ist schon besetzt"
            Else
                brett[zug - 1] = spieler
                zuege = zuege + 1
                If hatGewonnen(brett, spieler) Then
                    sieger = spieler
                Else If spieler = "X" Then
                    spieler = "O"
                Else
                    spieler = "X"
                End If
            End If
        End While
        Call brettZeigen(brett)
        If sieger = "" Then
            Display "Unentschieden"
        Else
            Display "Spieler ", sieger, " gewinnt!"
        End If
        Stop

        Module brettZeigen(felder)
            For reihe = 0 To 2
                Display " ", felder[reihe * 3], " | ", felder[reihe * 3 + 1], " | ", felder[reihe * 3 + 2]
                If reihe < 2 Then
                    Display "---+---+---"
                End If
            End For
        End Module

        Function Boolean hatGewonnen(felder, zeichen)
            reihen = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
            For Each drei In reihen
                If felder[drei[0]] = zeichen And felder[drei[1]] = zeichen And felder[drei[2]] = zeichen Then
                    Return True
                End If
            End For
            Return False
        End Function
    """),
    "e_weather_p": program("""
        Start
        Declare Real schnitt
        Declare Integer darueber
        Declare Integer serie
        Declare Integer laengste
        hoechstwerte = [61, 64, 70, 73, 69, 66, 72, 78, 81, 79, 75, 68, 63, 67]
        Display "Tageshöchstwerte: ", hoechstwerte
        schnitt = mittel(hoechstwerte)
        Display "Durchschnitt: ", round(schnitt, 1)
        Display "Wärmster Tag: ", groesster(hoechstwerte), "   Kühlster Tag: ", kleinster(hoechstwerte)
        darueber = 0
        serie = 0
        laengste = 0
        For tag = 1 To length(hoechstwerte)
            If hoechstwerte[tag - 1] > schnitt Then
                darueber = darueber + 1
                serie = serie + 1
                If serie > laengste Then
                    laengste = serie
                End If
            Else
                serie = 0
            End If
            Display "Tag ", tag, ": ", balken(hoechstwerte[tag - 1]), " ", hoechstwerte[tag - 1]
        End For
        Display darueber, " Tage waren wärmer als der Durchschnitt"
        Display "Die längste warme Phase dauerte ", laengste, " Tage"
        Stop

        Function Real mittel(werte)
            Declare Real summe
            summe = 0
            For Each w In werte
                summe = summe + w
            End For
            Return summe / length(werte)
        End Function

        Function Integer groesster(werte)
            Declare Integer bester
            bester = werte[0]
            For Each w In werte
                If w > bester Then
                    bester = w
                End If
            End For
            Return bester
        End Function

        Function Integer kleinster(werte)
            Declare Integer bester
            bester = werte[0]
            For Each w In werte
                If w < bester Then
                    bester = w
                End If
            End For
            Return bester
        End Function

        Function String balken(Integer grad)
            Declare String sterne
            sterne = ""
            For i = 1 To grad div 5
                sterne = sterne + "*"
            End For
            Return sterne
        End Function
    """),
    "e_sortsearch_p": program("""
        Start
        Declare Integer ziel
        Declare Integer stelle
        Declare Integer tausch
        punkte = [72, 95, 64, 88, 79, 91, 57, 83]
        Display "Punkte, wie sie kamen: ", punkte
        tausch = blasenSort(punkte)
        Display "Sortiert: ", punkte
        Display "Das Sortieren brauchte ", tausch, " Tauschvorgänge"
        Display "Welche Punktzahl soll ich suchen?"
        Input ziel
        stelle = binaerSuche(punkte, ziel)
        If stelle = -1 Then
            Display ziel, " ist keine der Punktzahlen"
        Else
            Display ziel, " ist Nummer ", stelle + 1, " von ", length(punkte), " von unten"
        End If
        Stop

        Function Integer blasenSort(werte)
            Declare Integer tausch
            Declare Integer zwischen
            Declare Boolean getauscht
            tausch = 0
            Do
                getauscht = False
                For i = 0 To length(werte) - 2
                    If werte[i] > werte[i + 1] Then
                        zwischen = werte[i]
                        werte[i] = werte[i + 1]
                        werte[i + 1] = zwischen
                        tausch = tausch + 1
                        getauscht = True
                    End If
                End For
            Until Not getauscht
            Return tausch
        End Function

        Function Integer binaerSuche(werte, ziel)
            Declare Integer unten
            Declare Integer oben
            Declare Integer mitte
            unten = 0
            oben = length(werte) - 1
            While unten <= oben
                mitte = (unten + oben) div 2
                If werte[mitte] = ziel Then
                    Return mitte
                Else If werte[mitte] < ziel Then
                    unten = mitte + 1
                Else
                    oben = mitte - 1
                End If
            End While
            Return -1
        End Function
    """),
    # ---- the puzzles: find the fault
    "z_else_p": program("""
        Start
        Declare Integer alter
        Input alter
        If alter >= 18 Then
            Display "rein"
        End If
        Stop
    """),
    "z_swap_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 10 Then
            Display "klein"
        Else
            Display "groß"
        End If
        Stop
    """),
    "z_count_p": program("""
        Start
        For i = 1 To 4
            Display i
        End For
        Stop
    """),
    "z_greet_p": program("""
        Start
        Declare String name
        Display "Hallo"
        Display name
        Input name
        Stop
    """),
    "z_range_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 0 Or n < 10 Then
            Display "im Bereich"
        Else
            Display "außerhalb des Bereichs"
        End If
        Stop
    """),
    "z_double_p": program("""
        Start
        Declare Integer n
        Input n
        Display n
        Stop
    """),
    "z_sign_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 0 Then
            Display "positiv"
        Else
            Display "negativ"
        End If
        Stop
    """),
    "z_twice_p": program("""
        Start
        Declare String wort
        Input wort
        Display wort
        Stop
    """),
    "z_minus_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Input a
        Input b
        Display a + b
        Stop
    """),
    "z_early_p": program("""
        Start
        Declare Integer n
        Declare Integer ergebnis
        Input n
        Display ergebnis
        ergebnis = n * 3
        Stop
    """),
    # ---- the puzzles: make it work
    "z_forever_p": program("""
        Start
        Declare Integer n
        n = 3
        While n > 0
            Display n
        End While
        Display "los"
        Stop
    """),
    "z_total_p": program("""
        Start
        Declare Integer summe
        For i = 1 To 4
            summe = 0
            summe = summe + i
        End For
        Display summe
        Stop
    """),
    "z_two_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Input a
        Display a + b
        Stop
    """),
    "z_order_p": program("""
        Start
        Declare Integer summe
        summe = 0
        For i = 1 To 3
            summe = summe + i
            Display summe
        End For
        Stop
    """),
    "z_until_p": program("""
        Start
        Declare Integer n
        n = 0
        Do
            n = n + 1
            Display n
        Until n > 0
        Stop
    """),
    "z_nested_p": program("""
        Start
        For reihe = 1 To 2
            For spalte = 1 To 1
                Display reihe * spalte
            End For
        End For
        Stop
    """),
    "z_never_p": program("""
        Start
        Declare Integer n
        n = 5
        While n > 5
            Display n
            n = n - 1
        End While
        Stop
    """),
    "z_odds_p": program("""
        Start
        Declare Integer summe
        summe = 0
        For i = 1 To 10
            If i mod 2 = 1 Then
                summe = summe + i
            End If
        End For
        Display summe
        Stop
    """),
    "z_asked_p": program("""
        Start
        Declare Integer n
        Declare Integer summe
        summe = 0
        Input n
        For i = 1 To 3
            summe = summe + n
        End For
        Display summe
        Stop
    """),
    "z_onemore_p": program("""
        Start
        Declare Integer summe
        summe = 0
        For i = 1 To 11
            summe = summe + i
        End For
        Display summe
        Stop
    """),
    # ---- the puzzles: build it
    "z_grade_p": program("""
        Start
        Declare Integer punkte
        Input punkte
        If punkte > 60 Then
            Display "bestanden"
        Else
            Display "durchgefallen"
        End If
        Stop
    """),
    "z_evens_p": program("""
        Start
        For i = 1 To 10
            Display i
        End For
        Stop
    """),
    "z_return_p": program("""
        Start
        Declare Integer n
        Input n
        Display doppelt(n)
        Stop

        Function doppelt(x)
            x = x * 2
        End Function
    """),
    "z_param_p": program("""
        Start
        Declare Integer n
        Input n
        Call zeige(n)
        Stop

        Module zeige(x)
            Display "x"
        End Module
    """),
    "z_many_p": program("""
        Start
        Declare Integer n
        Declare Integer anzahl
        For i = 1 To 5
            anzahl = 0
            Input n
            If n > 10 Then
                anzahl = anzahl + 1
            End If
        End For
        Display anzahl
        Stop
    """),
    "z_divide_p": program("""
        Start
        Declare Real summe
        Declare Real n
        summe = 0
        For i = 1 To 4
            Input n
            summe = summe + n
        End For
        Display summe / 5
        Stop
    """),
    "z_valid_p": program("""
        Start
        Declare Integer n
        Do
            Input n
        Until n > 0
        Display "ok"
        Display n
        Stop
    """),
    "z_smallest_p": program("""
        Start
        Declare Integer n
        Declare Integer beste
        beste = 0
        For i = 1 To 4
            Input n
            If n < beste Then
                beste = n
            End If
        End For
        Display beste
        Stop
    """),
    "z_short_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Input a
        Input b
        Display addiere(a)
        Stop

        Function addiere(x, y)
            Return x + y
        End Function
    """),
    "z_stops_p": program("""
        Start
        Declare Integer n
        n = 5
        While n > 1
            Display n
            n = n - 1
        End While
        Display "los"
        Stop
    """),
    # ---- the puzzles: harder faults
    "z_fizz_p": program("""
        Start
        For i = 1 To 15
            If i mod 3 = 0 Then
                Display "Fizz"
            Else If i mod 5 = 0 Then
                Display "Buzz"
            Else If i mod 15 = 0 Then
                Display "FizzBuzz"
            Else
                Display i
            End If
        End For
        Stop
    """),
    "z_prime_p": program("""
        Start
        Declare Integer n
        Declare Integer teiler
        Input n
        teiler = 0
        For i = 1 To n
            If n mod i = 0 Then
                teiler = teiler + 1
            End If
        End For
        If teiler < 3 Then
            Display "Primzahl"
        Else
            Display "keine Primzahl"
        End If
        Stop
    """),
    "z_digits_p": program("""
        Start
        Declare Integer n
        Declare Integer anzahl
        Input n
        anzahl = 1
        While n > 0
            n = n div 10
            anzahl = anzahl + 1
        End While
        Display anzahl
        Stop
    """),
    "z_revzero_p": program("""
        Start
        Declare Integer n
        Declare Integer umgedreht
        Input n
        umgedreht = 0
        While n > 0
            umgedreht = umgedreht + n mod 10
            n = n div 10
        End While
        Display umgedreht
        Stop
    """),
    "z_sumd_p": program("""
        Start
        Declare Integer n
        Declare Integer summe
        Input n
        summe = 0
        While n > 0
            summe = summe + n div 10
            n = n div 10
        End While
        Display summe
        Stop
    """),
    "z_gridrow_p": program("""
        Start
        For reihe = 1 To 3
            For spalte = 1 To 3
                Display reihe * reihe
            End For
        End For
        Stop
    """),
    "z_tri_p": program("""
        Start
        Declare Integer summe
        summe = 0
        For i = 1 To 4
            summe = summe + i
        End For
        Display summe
        Stop
    """),
    "z_lowhigh_p": program("""
        Start
        Declare Integer n
        Declare Integer kleinste
        Declare Integer groesste
        kleinste = 0
        groesste = 0
        For i = 1 To 4
            Input n
            If n < kleinste Then
                kleinste = n
            End If
            If n > groesste Then
                groesste = n
            End If
        End For
        Display kleinste
        Display groesste
        Stop
    """),
    "z_starsrow_p": program("""
        Start
        Declare String zeile
        For reihe = 1 To 3
            zeile = ""
            For spalte = 1 To 3
                zeile = zeile + "*"
            End For
            Display zeile
        End For
        Stop
    """),
    "z_factloop_p": program("""
        Start
        Declare Integer n
        Declare Integer ergebnis
        Input n
        ergebnis = 0
        For i = 1 To n
            ergebnis = ergebnis * i
        End For
        Display ergebnis
        Stop
    """),
    # ---- the puzzles: real bugs
    "z_report_p": program("""
        Start
        Declare Integer punkte
        Declare Integer summe
        summe = 0
        For i = 1 To 5
            Input punkte
            summe = summe + punkte
        End For
        Display summe / 6
        Stop
    """),
    "z_tries_p": program("""
        Start
        Declare String wort
        Declare Integer versuche
        versuche = 0
        Do
            Input wort
            versuche = versuche + 1
        Until wort = "offen" Or versuche = 2
        If wort = "offen" Then
            Display "rein"
        Else
            Display "raus"
        End If
        Stop
    """),
    "z_discount_p": program("""
        Start
        Declare Real summe
        Input summe
        If summe > 100 Then
            summe = summe * 0.9
        End If
        Display summe
        Stop
    """),
    "z_convert_p": program("""
        Start
        Declare Real c
        Input c
        Display c * 9 / 5
        Stop
    """),
    "z_tie_p": program("""
        Start
        Declare Integer rote
        Declare Integer blaue
        Input rote
        Input blaue
        If rote > blaue Then
            Display "Rot gewinnt"
        Else
            Display "Blau gewinnt"
        End If
        Stop
    """),
    "z_fibstep_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        a = 0
        b = 1
        For i = 1 To 5
            Display a
            a = b
            b = a + b
        End For
        Stop
    """),
    "z_coins_p": program("""
        Start
        Declare Integer cent
        Input cent
        Display cent div 100
        Display cent div 10
        Display cent mod 10
        Stop
    """),
    "z_score_p": program("""
        Start
        Declare Integer punkte
        punkte = 0
        punkte = punkte + gefragt(4)
        punkte = punkte + gefragt(15)
        Display punkte
        Stop

        Function gefragt(antwort)
            Declare Integer gesagt
            Input gesagt
            If gesagt = antwort Then
                Return 0
            Else
                Return 1
            End If
        End Function
    """),
    "z_sent_p": program("""
        Start
        Declare Integer n
        Declare Integer summe
        Declare Integer anzahl
        summe = 0
        anzahl = 0
        Input n
        While n <> 0
            summe = summe + n
            anzahl = anzahl + 1
            Input n
        End While
        Display summe / (anzahl + 1)
        Stop
    """),
    "z_menu0_p": program("""
        Start
        Declare Integer n
        Display "Wähle eine Zahl, 0 zum Beenden"
        Input n
        While n <> 1
            Display n
            Display "Wähle eine Zahl, 0 zum Beenden"
            Input n
        End While
        Display "Tschüss"
        Stop
    """),
    # ---- the answers a puzzle is marked against that are words.  A
    # puzzle's tries write them as {out}; each is said here the way the
    # puzzles above say it, so a fixed program says exactly this.
    "zw_in": "rein",
    "zw_out": "raus",
    "zw_big": "groß",
    "zw_small": "klein",
    "zw_hello": "Hallo",
    "zw_hi": "hallo",
    "zw_inrange": "im Bereich",
    "zw_outrange": "außerhalb des Bereichs",
    "zw_positive": "positiv",
    "zw_zero": "null",
    "zw_negative": "negativ",
    "zw_go": "los",
    "zw_ok": "ok",
    "zw_pass": "bestanden",
    "zw_fail": "durchgefallen",
    "zw_prime": "Primzahl",
    "zw_notprime": "keine Primzahl",
    "zw_open": "offen",
    "zw_redwins": "Rot gewinnt",
    "zw_bluewins": "Blau gewinnt",
    "zw_tie": "Unentschieden",
    "zw_pick": "Wähle eine Zahl, 0 zum Beenden",
    "zw_bye": "Tschüss",
    # ---- the games (37-games.js): a name, a line saying what it is, how
    # to play it, and the program -- written in modules, so it is a
    # chart to each one, or one chart with the option that draws every
    # module where it is called.  Smallest first; the last four are big.
    "g_coin": "Münzwurf",
    "g_coin_d": "Kopf oder Zahl, fünf Würfe hintereinander",
    "g_coin_h": "Sag jeden Wurf an, bevor die Münze landet: Tippe 1 für Kopf oder 2 für Zahl. Es gibt fünf Würfe. Wie viele sagst du richtig an?",
    "g_highlow": "Höher oder niedriger",
    "g_highlow_d": "Ist die nächste Karte höher als diese?",
    "g_highlow_h": "Eine Karte wird aufgedeckt. Tippe 1, wenn du glaubst, dass die nächste höher ist, oder 2 für niedriger. Asse zählen niedrig. Jeder falsche Tipp kostet eins deiner 3 Leben, und es gibt zehn Karten.",
    "g_sticks": "Einundzwanzig Hölzer",
    "g_sticks_d": "Nimm 1, 2 oder 3 Hölzer, aber nicht das letzte",
    "g_sticks_h": "Es gibt 21 Hölzer. Du und der Computer nehmt abwechselnd 1, 2 oder 3 davon, und wer das letzte Holz nimmt, verliert. Der Computer kennt einen Trick. Findest du ihn heraus?",
    "g_dice": "Würfelduell",
    "g_dice_d": "Zwei Würfel gegen den Computer, wer zuerst 3 Runden hat",
    "g_dice_h": "Drücke Enter, um zwei Würfel zu werfen, dann würfelt der Computer. Die höhere Summe gewinnt die Runde, und ein Pasch zählt doppelt. Wer zuerst 3 Runden gewinnt, gewinnt das Duell.",
    "g_hangman": "Galgenmännchen",
    "g_hangman_d": "Finde das versteckte Wort Buchstabe für Buchstabe",
    "g_hangman_h": "Rate das versteckte Wort Buchstabe für Buchstabe. Jeder falsche Buchstabe fügt der Zeichnung ein Stück hinzu, und nach sechs falschen ist das Spiel vorbei.",
    "g_codebreak": "Codeknacker",
    "g_codebreak_d": "Knacke einen geheimen 4-stelligen Code in 10 Versuchen",
    "g_codebreak_h": "Der Computer wählt einen Code aus 4 Ziffern, jede von 1 bis 6. Tippe einen Versuch wie 1234. Du erfährst, wie viele Ziffern richtig an der richtigen Stelle stehen und wie viele richtig, aber an der falschen Stelle sind. Knacke ihn in 10 Versuchen.",
    "g_dungeon": "Flucht aus dem Verlies",
    "g_dungeon_d": "Ein Textabenteuer mit Lampe, Schlüssel, Troll und Gold",
    "g_dungeon_h": "Geh durch das Verlies, indem du n, s, o oder w tippst. Tippe schau, um dich umzusehen, nimm, um etwas aufzuheben, und tasche, um zu sehen, was du trägst. Finde das Gold und bring es durch das Tor hinaus, bevor deine Fackel erlischt, und nimm dich vor dem Troll in Acht.",
    "g_connect": "Vier gewinnt",
    "g_connect_d": "Wirf Steine ein und bilde vor dem Computer eine Viererreihe",
    "g_connect_h": "Du bist X und der Computer ist O. Tippe eine Spalte von 1 bis 7, um einen Stein hineinzuwerfen. Vier in einer Reihe gewinnen: waagerecht, senkrecht oder schräg.",
    "g_blackjack": "Blackjack",
    "g_blackjack_d": "Schlage den Geber bis 21, ohne darüber zu kommen",
    "g_blackjack_h": "Setze einen Teil deiner 100 Chips. Tippe dann 1 für noch eine Karte, 2 zum Stehenbleiben oder 3, um den Einsatz für eine letzte Karte zu verdoppeln. Komm näher an 21 als der Geber, ohne darüber zu gehen. B, D und K zählen 10, und ein A zählt 1 oder 11.",
    "g_battleship": "Schiffe versenken",
    "g_battleship_d": "Versenke die feindliche Flotte, bevor sie deine versenkt",
    "g_battleship_h": "Beide Seiten verstecken drei Schiffe auf einem Meer von 6 mal 6 Feldern. Schieße, indem du einen Buchstaben und eine Zahl tippst, zum Beispiel B4. X ist ein Treffer und o daneben. Versenke alle feindlichen Schiffe, bevor der Gegner deine versenkt.",
    "g_math": "Kopfrechnen",
    "g_math_d": "Acht Aufgaben, mit einem Bonus für jede richtige Antwort in Folge",
    "g_math_h": "Acht Rechenaufgaben kommen nacheinander: Plus, Minus und das Einmaleins. Tippe jeweils die Antwort ein. Eine richtige Antwort bringt einen Punkt mehr als die vorige in der Serie, also halte die Serie am Laufen.",
    "g_pig": "Pig",
    "g_pig_d": "Würfle, so oft du dich traust, aber eine 1 kostet alles",
    "g_pig_h": "Würfle in deinem Zug so oft du willst und zähle zusammen, was du würfelst. Tippe w, um weiterzuwürfeln, oder h, um anzuhalten und die Punkte zu sichern. Würfelst du eine 1, verlierst du alles aus diesem Zug. Der Computer spielt mit, und wer zuerst 50 hat, gewinnt.",
    "g_lander": "Mondlandung",
    "g_lander_d": "Verbrenne gerade genug Treibstoff, um sanft auf dem Mond aufzusetzen",
    "g_lander_h": "Du beginnst 500 m über dem Mond und fällst. Tippe jede Sekunde ein, wie viel Treibstoff du verbrennst, von 0 bis 20: Je mehr, desto stärker bremst du, aber der Treibstoff geht zur Neige. Setze mit höchstens 5 m pro Sekunde auf, um sicher zu landen.",
    "g_mines": "Minensucher",
    "g_mines_d": "Öffne jedes sichere Quadrat eines Minenfelds, mit den Zahlen als Hinweis",
    "g_mines_h": "Sieben Minen sind in einem Feld aus 6 mal 6 Quadraten versteckt. Tippe ein Quadrat wie B4, um es zu öffnen. Eine Zahl sagt dir, wie viele der Quadrate drumherum eine Mine haben, und ein leeres Quadrat öffnet alle Quadrate um sich herum. Tippe M und ein Quadrat, etwa MB4, um ein Quadrat zu markieren, bei dem du sicher bist, dass dort eine Mine liegt, oder um die Markierung wieder wegzunehmen. Öffne jedes Quadrat ohne Mine, um zu gewinnen.",
    "g_coin_p": program("""
        Start
        Declare Integer wahl
        Declare Integer seite
        Declare Integer treffer
        treffer = 0
        For wurf = 1 To 5
            Display "Wurf ", wurf, " von 5. Sag an: 1 für Kopf, 2 für Zahl"
            Input wahl
            While wahl < 1 Or wahl > 2
                Display "Tippe 1 für Kopf oder 2 für Zahl"
                Input wahl
            End While
            seite = random(1, 2)
            Display "Die Münze zeigt ", seitenName(seite), "!"
            If wahl = seite Then
                treffer = treffer + 1
                Display "Richtig angesagt"
            Else
                Display "Diesmal nicht"
            End If
        End For
        Display "Du hast ", treffer, " von 5 richtig angesagt"
        If treffer >= 4 Then
            Display "Was für ein Glück!"
        End If
        Stop

        Function String seitenName(Integer seite)
            Declare String name
            If seite = 1 Then
                name = "Kopf"
            Else
                name = "Zahl"
            End If
            Return name
        End Function
    """),
    "g_highlow_p": program("""
        Start
        Declare Integer karte
        Declare Integer naechste
        Declare Integer wahl
        Declare Integer punkte
        Declare Integer leben
        Declare Integer runde
        karte = random(1, 13)
        punkte = 0
        leben = 3
        runde = 0
        Display "Ist die nächste Karte höher oder niedriger? Asse zählen niedrig. Du hast 3 Leben"
        While runde < 10 And leben > 0
            runde = runde + 1
            Display "Karte ", runde, " von 10: ", kartenName(karte), ". Ist die nächste 1 höher oder 2 niedriger?"
            Input wahl
            While wahl < 1 Or wahl > 2
                Display "Tippe 1 für höher oder 2 für niedriger"
                Input wahl
            End While
            naechste = random(1, 13)
            Display "Die nächste Karte: ", kartenName(naechste)
            If naechste = karte Then
                Display "Die gleiche noch einmal! Die zählt nicht"
            Else If (wahl = 1 And naechste > karte) Or (wahl = 2 And naechste < karte) Then
                punkte = punkte + 1
                Display "Richtig! Punkte: ", punkte
            Else
                leben = leben - 1
                Display "Falsch! Übrige Leben: ", leben
            End If
            karte = naechste
        End While
        Display "Spiel vorbei. Du hast ", punkte, " Punkte"
        Call zeigeWertung(punkte)
        Stop

        Function String kartenName(Integer n)
            namen = ["Ass", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun", "Zehn", "Bube", "Dame", "König"]
            Return namen[n - 1]
        End Function

        Module zeigeWertung(Integer punkte)
            If punkte >= 8 Then
                Display "Ein echter Kartenhai!"
            Else If punkte >= 5 Then
                Display "Gut gespielt"
            Else
                Display "Nächstes Mal klappt es besser"
            End If
        End Module
    """),
    "g_sticks_p": program("""
        Start
        Declare Integer hoelzer
        Declare Integer anzahl
        Declare Integer zuerst
        Declare Boolean duBistDran
        hoelzer = 21
        Display "Es gibt 21 Hölzer. Nimm 1, 2 oder 3 auf einmal. Wer das letzte Holz nimmt, verliert"
        Display "Wer fängt an? 1 für dich, 2 für den Computer"
        Input zuerst
        While zuerst < 1 Or zuerst > 2
            Display "Tippe 1 oder 2"
            Input zuerst
        End While
        duBistDran = zuerst = 1
        While hoelzer > 0
            Call zeigeHoelzer(hoelzer)
            If duBistDran Then
                Display "Wie viele nimmst du?"
                Input anzahl
                While anzahl < 1 Or anzahl > 3 Or anzahl > hoelzer
                    Display "Nimm 1, 2 oder 3, und nicht mehr, als da sind"
                    Input anzahl
                End While
            Else
                anzahl = computerNimmt(hoelzer)
                Display "Der Computer nimmt ", anzahl
            End If
            hoelzer = hoelzer - anzahl
            duBistDran = Not duBistDran
        End While
        If duBistDran Then
            Display "Der Computer hat das letzte Holz genommen. Du gewinnst!"
        Else
            Display "Du hast das letzte Holz genommen, also gewinnt der Computer"
            Display "Es gibt einen Trick. Achte darauf, wie viele Hölzer dir der Computer übrig lässt"
        End If
        Stop

        Module zeigeHoelzer(Integer uebrig)
            Declare String reihe
            reihe = ""
            For i = 1 To uebrig
                reihe = reihe + "|"
            End For
            Display reihe, "  (", uebrig, " übrig)"
        End Module

        Function Integer computerNimmt(Integer uebrig)
            Declare Integer menge
            menge = (uebrig - 1) mod 4
            If menge = 0 Then
                menge = random(1, 3)
            End If
            If menge > uebrig Then
                menge = uebrig
            End If
            Return menge
        End Function
    """),
    "g_dice_p": program("""
        Start
        Declare Integer meineSiege
        Declare Integer cpuSiege
        Declare Integer runde
        Declare Integer a
        Declare Integer b
        Declare Integer meine
        Declare Integer seine
        Declare String bereit
        meineSiege = 0
        cpuSiege = 0
        runde = 0
        Display "Würfelduell: Das höhere Würfelpaar gewinnt die Runde. Ein Pasch zählt doppelt. Wer zuerst 3 Runden hat, gewinnt"
        While meineSiege < 3 And cpuSiege < 3
            runde = runde + 1
            Display "Runde ", runde, ". Drücke Enter zum Würfeln"
            Input bereit
            a = wuerfle()
            b = wuerfle()
            meine = punkteVon(a, b)
            Call zeigeWurf("Du", a, b, meine)
            a = wuerfle()
            b = wuerfle()
            seine = punkteVon(a, b)
            Call zeigeWurf("Der Computer", a, b, seine)
            If meine > seine Then
                meineSiege = meineSiege + 1
                Display "Du gewinnst die Runde!"
            Else If seine > meine Then
                cpuSiege = cpuSiege + 1
                Display "Der Computer gewinnt die Runde"
            Else
                Display "Unentschieden, niemand punktet"
            End If
            Display "Gewonnene Runden: du ", meineSiege, ", der Computer ", cpuSiege
        End While
        If meineSiege = 3 Then
            Display "Du gewinnst das Duell!"
        Else
            Display "Der Computer gewinnt das Duell"
        End If
        Stop

        Function Integer wuerfle()
            Return random(1, 6)
        End Function

        Function Integer punkteVon(Integer erster, Integer zweiter)
            Declare Integer punkte
            punkte = erster + zweiter
            If erster = zweiter Then
                punkte = punkte * 2
            End If
            Return punkte
        End Function

        Module zeigeWurf(String wer, Integer erster, Integer zweiter, Integer punkte)
            Display wer, ": ", erster, " und ", zweiter, " macht ", punkte, " Punkte"
            If erster = zweiter Then
                Display "Pasch! Er zählt doppelt"
            End If
        End Module
    """),
    "g_hangman_p": program("""
        Start
        Declare String geheim
        Declare String versucht
        Declare String buchstabe
        Declare Integer fehler
        Declare Boolean gewonnen
        woerter = ["planet", "dschungel", "rakete", "pirat", "zauberer", "burg", "drache", "gitarre", "kompass", "vulkan", "pinguin", "decke"]
        geheim = woerter[random(0, length(woerter) - 1)]
        versucht = ""
        fehler = 0
        gewonnen = False
        Display "Galgenmännchen! Rate das Wort Buchstabe für Buchstabe. Sechs falsche Versuche und du verlierst"
        While fehler < 6 And Not gewonnen
            Call zeigeGalgen(fehler)
            Display "Das Wort: ", verdeckt(geheim, versucht)
            Display "Rate einen Buchstaben"
            Input buchstabe
            buchstabe = toLower(buchstabe)
            If length(buchstabe) <> 1 Then
                Display "Bitte nur einen Buchstaben auf einmal"
            Else If contains(versucht, buchstabe) Then
                Display "Das hattest du schon: ", buchstabe
            Else
                versucht = versucht + buchstabe
                If contains(geheim, buchstabe) Then
                    Display "Ja, es gibt ein ", buchstabe
                Else
                    fehler = fehler + 1
                    Display "Kein ", buchstabe, ". Falsche Versuche: ", fehler, " von 6"
                End If
                gewonnen = alleGefunden(geheim, versucht)
            End If
        End While
        Call zeigeGalgen(fehler)
        If gewonnen Then
            Display "Geschafft: ", geheim, "! Du gewinnst"
        Else
            Display "Keine Versuche mehr. Das Wort war ", geheim
        End If
        Stop

        Function String verdeckt(String wort, String buchstaben)
            Declare String gezeigt
            Declare String zeichen
            gezeigt = ""
            For i = 0 To length(wort) - 1
                zeichen = substring(wort, i, i + 1)
                If contains(buchstaben, zeichen) Then
                    gezeigt = gezeigt + zeichen + " "
                Else
                    gezeigt = gezeigt + "_ "
                End If
            End For
            Return gezeigt
        End Function

        Function Boolean alleGefunden(String wort, String buchstaben)
            Declare Boolean gefunden
            gefunden = True
            For i = 0 To length(wort) - 1
                If Not contains(buchstaben, substring(wort, i, i + 1)) Then
                    gefunden = False
                End If
            End For
            Return gefunden
        End Function

        Module zeigeGalgen(Integer falsch)
            koepfe = ["   ", " O ", " O ", " O ", " O ", " O ", " O "]
            koerper = ["   ", "   ", " | ", "-| ", "-|-", "-|-", "-|-"]
            beine = ["   ", "   ", "   ", "   ", "   ", "|  ", "| |"]
            Display "  +---+"
            Display "  |   |"
            Display "  |  ", koepfe[falsch]
            Display "  |  ", koerper[falsch]
            Display "  |  ", beine[falsch]
            Display "==+=="
        End Module
    """),
    "g_codebreak_p": program("""
        Start
        Declare String code
        Declare String tipp
        Declare Boolean ok
        Declare Boolean geknackt
        Declare Integer genau
        Declare Integer fast
        Declare Integer versuche
        code = macheCode()
        versuche = 0
        geknackt = False
        Display "Ich denke an einen 4-stelligen Code. Jede Ziffer ist von 1 bis 6, und Ziffern dürfen sich wiederholen"
        Display "Nach jedem Tipp sage ich, wie viele Ziffern an der richtigen Stelle stehen und wie viele stimmen, aber an der falschen Stelle stehen"
        While Not geknackt And versuche < 10
            versuche = versuche + 1
            Display "Tipp ", versuche, " von 10:"
            Input tipp
            ok = istGueltig(tipp)
            While Not ok
                Display "Tippe 4 Ziffern von 1 bis 6, zum Beispiel 1234"
                Input tipp
                ok = istGueltig(tipp)
            End While
            genau = richtigeStelle(code, tipp)
            fast = gemeinsameZiffern(code, tipp) - genau
            Display tipp, "   richtige Stelle: ", genau, "   falsche Stelle: ", fast
            If genau = 4 Then
                geknackt = True
            End If
        End While
        If geknackt Then
            Display "Geknackt mit ", versuche, " Tipps!"
        Else
            Display "Keine Tipps mehr. Der Code war ", code
        End If
        Stop

        Function String macheCode()
            Declare String gemacht
            gemacht = ""
            For i = 1 To 4
                gemacht = gemacht + random(1, 6)
            End For
            Return gemacht
        End Function

        Function Boolean istGueltig(String text)
            Declare Boolean gut
            gut = length(text) = 4
            If gut Then
                For i = 0 To 3
                    If Not contains("123456", substring(text, i, i + 1)) Then
                        gut = False
                    End If
                End For
            End If
            Return gut
        End Function

        Function Integer richtigeStelle(String geheim, String versucht)
            Declare Integer treffer
            treffer = 0
            For i = 0 To 3
                If substring(geheim, i, i + 1) = substring(versucht, i, i + 1) Then
                    treffer = treffer + 1
                End If
            End For
            Return treffer
        End Function

        Function Integer gemeinsameZiffern(String geheim, String versucht)
            Declare Integer beide
            Declare Integer imGeheimen
            Declare Integer imVersuch
            Declare String ziffer
            beide = 0
            For d = 1 To 6
                ziffer = "" + d
                imGeheimen = 0
                imVersuch = 0
                For i = 0 To 3
                    If substring(geheim, i, i + 1) = ziffer Then
                        imGeheimen = imGeheimen + 1
                    End If
                    If substring(versucht, i, i + 1) = ziffer Then
                        imVersuch = imVersuch + 1
                    End If
                End For
                If imGeheimen < imVersuch Then
                    beide = beide + imGeheimen
                Else
                    beide = beide + imVersuch
                End If
            End For
            Return beide
        End Function
    """),
    "g_dungeon_p": program("""
        Start
        Declare Integer raum
        Declare Integer ziel
        Declare Integer richtung
        Declare Integer gesundheit
        Declare Integer zuege
        Declare String befehl
        Declare Boolean trollDa
        Declare Boolean spielen
        dinge = ["", "", "Lampe", "Schwert", "Schlüssel", "", "Gold"]
        ausgaenge = [[1, -1, -1, -1], [5, 0, 3, 2], [-1, 4, 1, -1], [-1, -1, -1, 1], [2, -1, -1, -1], [6, 1, -1, -1], [-1, 5, -1, -1]]
        tasche = []
        raum = 0
        gesundheit = 3
        zuege = 0
        trollDa = True
        spielen = True
        Display "FLUCHT AUS DEM VERLIES"
        Display "Finde das Gold und bring es durch das Tor nach draußen, bevor deine Fackel erlischt"
        Display "Tippe n, s, o oder w zum Gehen, oder schau, nimm, tasche oder hilfe"
        Call beschreibe(raum, dinge, tasche)
        While spielen
            Display "Was nun?"
            Input befehl
            befehl = toLower(befehl)
            richtung = richtungVon(befehl)
            If richtung >= 0 Then
                ziel = ausgaenge[raum][richtung]
                zuege = zuege + 1
                If ziel = -1 Then
                    Display "Da geht es nicht weiter"
                Else If ziel = 6 And trollDa Then
                    If contains(tasche, "Schwert") Then
                        Display "Der Troll versperrt die Tür. Du ziehst dein Schwert, und er rennt heulend in die Dunkelheit!"
                        trollDa = False
                    Else
                        gesundheit = gesundheit - 1
                        Display "Der Troll versperrt die Tür und fegt dich mit seiner riesigen Hand weg! Gesundheit: ", gesundheit
                    End If
                Else If ziel = 6 And Not contains(tasche, "Schlüssel") Then
                    Display "Die Tür im Norden ist fest verschlossen. Hättest du nur einen Schlüssel"
                Else
                    raum = ziel
                    Call beschreibe(raum, dinge, tasche)
                    If raum = 4 And Not contains(tasche, "Lampe") Then
                        gesundheit = gesundheit - 1
                        Display "Du stolperst im Dunkeln und stößt dir den Kopf! Gesundheit: ", gesundheit
                    End If
                    If raum = 5 And trollDa Then
                        Display "Ein riesiger Troll bewacht die Tür am anderen Ende!"
                    End If
                End If
            Else If befehl = "schau" Then
                Call beschreibe(raum, dinge, tasche)
            Else If befehl = "nimm" Then
                Call nimmDing(raum, dinge, tasche)
            Else If befehl = "tasche" Then
                Call zeigeTasche(tasche)
            Else If befehl = "hilfe" Then
                Display "Geh mit n, s, o und w. Tippe schau, um dich umzusehen, nimm, um etwas aufzuheben, und tasche, um zu sehen, was du trägst"
            Else
                Display "Das verstehe ich nicht: ", befehl
            End If
            If raum = 0 And contains(tasche, "Gold") Then
                Display "Du stößt das Tor auf und gehst mit dem Gold hinaus in die Sonne. Geschafft in ", zuege, " Zügen!"
                spielen = False
            Else If gesundheit <= 0 Then
                Display "Du sinkst auf den kalten Steinboden. Diesmal gewinnt das Verlies"
                spielen = False
            Else If zuege >= 40 Then
                Display "Deine Fackel flackert und erlischt. Du bist für immer im Dunkeln verloren"
                spielen = False
            Else If zuege = 30 And richtung >= 0 Then
                Display "Deine Fackel brennt herunter. Noch zehn Züge!"
            End If
        End While
        Stop

        Function Integer richtungVon(String gesagt)
            Declare Integer gefunden
            gefunden = -1
            If gesagt = "n" Then
                gefunden = 0
            Else If gesagt = "s" Then
                gefunden = 1
            Else If gesagt = "o" Then
                gefunden = 2
            Else If gesagt = "w" Then
                gefunden = 3
            End If
            Return gefunden
        End Function

        Module beschreibe(Integer hier, sachen, getragen)
            namen = ["Tor", "Große Halle", "Bibliothek", "Waffenkammer", "Keller", "Trollbrücke", "Schatzkammer"]
            texte = ["Das eiserne Tor hinter dir ist verriegelt. Ein Gang führt nach Norden.", "Eine große Halle mit Türen nach Norden, Osten und Westen. Das Tor liegt im Süden.", "Staubige Regale voller alter Bücher. Eine Falltür im Boden führt nach Süden hinab, und eine Tür nach Osten.", "An den Wänden hängen rostige Waffen. Der einzige Ausgang liegt im Westen.", "Ein feuchter Keller, der nach Schimmel riecht. Eine Leiter führt nach Norden hinauf.", "Eine schmale Steinbrücke über einem tiefen Abgrund, mit einer schweren Tür am Ende im Norden. Die Halle liegt im Süden.", "Überall um dich glitzern Schatztruhen. Die Brücke liegt im Süden."]
            Display "== ", namen[hier], " =="
            If hier = 4 And Not contains(getragen, "Lampe") Then
                Display "Hier ist es stockdunkel. Du siehst gar nichts."
            Else
                Display texte[hier]
                If sachen[hier] <> "" Then
                    Display "Du siehst: ", sachen[hier]
                End If
            End If
        End Module

        Module nimmDing(Integer hier, sachen, getragen)
            If hier = 4 And Not contains(getragen, "Lampe") Then
                Display "Du tastest im Dunkeln herum, findest aber nichts"
            Else If sachen[hier] = "" Then
                Display "Hier gibt es nichts mitzunehmen"
            Else
                append(getragen, sachen[hier])
                Display "Du nimmst: ", sachen[hier]
                sachen[hier] = ""
            End If
        End Module

        Module zeigeTasche(getragen)
            Declare String gepackt
            If length(getragen) = 0 Then
                Display "Deine Tasche ist leer"
            Else
                gepackt = ""
                For Each ding In getragen
                    gepackt = gepackt + ding + " "
                End For
                Display "In deiner Tasche: ", gepackt
            End If
        End Module
    """),
    "g_connect_p": program("""
        Start
        Declare Integer spalte
        Declare Integer zeile
        Declare Integer zuege
        Declare String zeichen
        Declare String sieger
        brett = neuesBrett()
        zuege = 0
        zeichen = "X"
        sieger = ""
        Display "Vier gewinnt! Du bist X und der Computer ist O. Wirf deine Steine ein, um vier in eine Reihe zu bekommen"
        Display "Waagerecht, senkrecht und schräg zählt alles"
        While sieger = "" And zuege < 42
            Call zeigeBrett(brett)
            If zeichen = "X" Then
                Display "Du bist dran. Wähle eine Spalte von 1 bis 7"
                Input spalte
                zeile = -1
                While zeile = -1
                    While spalte < 1 Or spalte > 7
                        Display "Die Spalten gehen von 1 bis 7"
                        Input spalte
                    End While
                    zeile = fallZeile(brett, spalte - 1)
                    If zeile = -1 Then
                        Display "Die Spalte ist voll. Wähle eine andere"
                        Input spalte
                    End If
                End While
                spalte = spalte - 1
            Else
                spalte = computerSpalte(brett)
                zeile = fallZeile(brett, spalte)
                Display "Der Computer wirft einen Stein in Spalte ", spalte + 1
            End If
            brett[zeile][spalte] = zeichen
            zuege = zuege + 1
            If vierAb(brett, zeile, spalte, zeichen) Then
                sieger = zeichen
            Else If zeichen = "X" Then
                zeichen = "O"
            Else
                zeichen = "X"
            End If
        End While
        Call zeigeBrett(brett)
        If sieger = "X" Then
            Display "Vier in einer Reihe! Du gewinnst!"
        Else If sieger = "O" Then
            Display "Der Computer hat vier in einer Reihe. Diesmal gewinnt er"
        Else
            Display "Das Brett ist voll. Unentschieden"
        End If
        Stop

        Function neuesBrett()
            zeilen = []
            For r = 1 To 6
                felder = []
                For c = 1 To 7
                    append(felder, ".")
                End For
                append(zeilen, felder)
            End For
            Return zeilen
        End Function

        Module zeigeBrett(feld)
            Declare String text
            For r = 0 To 5
                text = "|"
                For c = 0 To 6
                    text = text + " " + feld[r][c]
                End For
                Display text, " |"
            End For
            Display "+---------------+"
            Display "  1 2 3 4 5 6 7"
        End Module

        Function Integer fallZeile(feld, Integer c)
            Declare Integer unterste
            unterste = -1
            For r = 0 To 5
                If feld[r][c] = "." Then
                    unterste = r
                End If
            End For
            Return unterste
        End Function

        Function Boolean vierAb(feld, Integer zeile, Integer spalte, String stein)
            Declare Integer inReihe
            Declare Integer r
            Declare Integer c
            Declare Boolean weiter
            Declare Boolean gefunden
            gefunden = False
            richtungen = [[0, 1], [1, 0], [1, 1], [1, -1]]
            For Each richtung In richtungen
                inReihe = 1
                For seite = -1 To 1 Step 2
                    r = zeile + richtung[0] * seite
                    c = spalte + richtung[1] * seite
                    weiter = True
                    While weiter
                        If r < 0 Or r > 5 Or c < 0 Or c > 6 Then
                            weiter = False
                        Else If feld[r][c] <> stein Then
                            weiter = False
                        Else
                            inReihe = inReihe + 1
                            r = r + richtung[0] * seite
                            c = c + richtung[1] * seite
                        End If
                    End While
                End For
                If inReihe >= 4 Then
                    gefunden = True
                End If
            End For
            Return gefunden
        End Function

        Function Integer computerSpalte(feld)
            Declare Integer wahl
            Declare Integer r
            wahl = -1
            steine = ["O", "X"]
            For Each stein In steine
                For c = 0 To 6
                    If wahl = -1 Then
                        r = fallZeile(feld, c)
                        If r >= 0 Then
                            feld[r][c] = stein
                            If vierAb(feld, r, c, stein) Then
                                wahl = c
                            End If
                            feld[r][c] = "."
                        End If
                    End If
                End For
            End For
            While wahl = -1
                c = random(0, 6)
                If feld[0][c] = "." Then
                    wahl = c
                End If
            End While
            Return wahl
        End Function
    """),
    "g_blackjack_p": program("""
        Start
        Declare Integer chips
        Declare Integer einsatz
        Declare Integer wahl
        Declare Integer meine
        Declare Integer seine
        Declare Integer aenderung
        Declare Boolean spielen
        Declare Boolean stehen
        chips = 100
        spielen = True
        Display "Blackjack! Komm näher an 21 als der Geber, ohne darüber zu gehen"
        Display "Zahlenkarten zählen, was draufsteht, B, D und K zählen 10, und ein A zählt 1 oder 11"
        While spielen
            stapel = neuerStapel()
            Display "Du hast ", chips, " Chips. Wie viele setzt du?"
            Input einsatz
            While einsatz < 1 Or einsatz > chips
                Display "Setze 1 bis ", chips
                Input einsatz
            End While
            du = []
            geber = []
            append(du, pop(stapel))
            append(geber, pop(stapel))
            append(du, pop(stapel))
            append(geber, pop(stapel))
            stehen = False
            While Not stehen
                meine = handWert(du)
                If meine >= 21 Then
                    stehen = True
                Else
                    Call zeigeTisch(du, meine, geber)
                    Display "1 für noch eine Karte, 2 zum Stehenbleiben, 3 zum Verdoppeln"
                    Input wahl
                    While wahl < 1 Or wahl > 3
                        Display "Tippe 1, 2 oder 3"
                        Input wahl
                    End While
                    If wahl = 3 And (length(du) > 2 Or einsatz * 2 > chips) Then
                        Display "Verdoppeln geht nur mit den ersten zwei Karten, und nur mit genug Chips dafür"
                    Else If wahl = 2 Then
                        stehen = True
                    Else
                        append(du, pop(stapel))
                        If wahl = 3 Then
                            einsatz = einsatz * 2
                            Display "Einsatz verdoppelt auf ", einsatz, ", und nur noch eine Karte"
                            stehen = True
                        End If
                    End If
                End If
            End While
            meine = handWert(du)
            If meine < 21 Or (meine = 21 And length(du) > 2) Then
                Call geberSpielt(geber, stapel)
            End If
            seine = handWert(geber)
            Call zeigeHaende(du, meine, geber, seine)
            aenderung = abrechnen(meine, length(du), seine, length(geber), einsatz)
            chips = chips + aenderung
            If aenderung > 0 Then
                Display "Du gewinnst ", aenderung, " Chips"
            Else If aenderung < 0 Then
                Display "Du verlierst ", 0 - aenderung, " Chips"
            Else
                Display "Gleichstand: Du bekommst deinen Einsatz zurück"
            End If
            If chips = 0 Then
                Display "Du hast keine Chips mehr. Diesmal gewinnt die Bank"
                spielen = False
            Else
                Display "1 für eine neue Runde, 2 zum Aufhören"
                Input wahl
                While wahl < 1 Or wahl > 2
                    Display "Tippe 1 oder 2"
                    Input wahl
                End While
                spielen = wahl = 1
            End If
        End While
        Display "Du verlässt den Tisch mit ", chips, " Chips"
        If chips > 100 Then
            Display "Das sind ", chips - 100, " mehr, als du mitgebracht hast!"
        End If
        Stop

        Function neuerStapel()
            Declare Integer andere
            Declare Integer gehalten
            karten = []
            For i = 0 To 51
                append(karten, i)
            End For
            For i = 51 To 1 Step -1
                andere = random(0, i)
                gehalten = karten[i]
                karten[i] = karten[andere]
                karten[andere] = gehalten
            End For
            Return karten
        End Function

        Function String kartenName(Integer karte)
            werte = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "B", "D", "K"]
            farben = ["♠", "♥", "♦", "♣"]
            Return werte[karte mod 13] + farben[karte div 13]
        End Function

        Function Integer handWert(hand)
            Declare Integer summe
            Declare Integer asse
            Declare Integer wert
            summe = 0
            asse = 0
            For Each karte In hand
                wert = karte mod 13 + 1
                If wert = 1 Then
                    summe = summe + 11
                    asse = asse + 1
                Else If wert > 10 Then
                    summe = summe + 10
                Else
                    summe = summe + wert
                End If
            End For
            While summe > 21 And asse > 0
                summe = summe - 10
                asse = asse - 1
            End While
            Return summe
        End Function

        Function String handText(hand)
            Declare String gezeigt
            gezeigt = ""
            For Each karte In hand
                gezeigt = gezeigt + kartenName(karte) + " "
            End For
            Return gezeigt
        End Function

        Module zeigeTisch(spieler, Integer summe, bank)
            Display "Geber: ", kartenName(bank[0]), " ??"
            Display "Du:    ", handText(spieler), "(", summe, ")"
        End Module

        Module zeigeHaende(spieler, Integer summe, bank, Integer bankSumme)
            Display "Geber: ", handText(bank), "(", bankSumme, ")"
            Display "Du:    ", handText(spieler), "(", summe, ")"
        End Module

        Module geberSpielt(hand, karten)
            Declare Integer summe
            Do
                summe = handWert(hand)
                If summe < 17 Then
                    append(hand, pop(karten))
                End If
            Until summe >= 17
        End Module

        Function Integer abrechnen(Integer meine, Integer meineKarten, Integer seine, Integer seineKarten, Integer betrag)
            Declare Integer gewinn
            If meine > 21 Then
                Display "Überkauft! Du bist über 21"
                gewinn = 0 - betrag
            Else If meine = 21 And meineKarten = 2 And (seine <> 21 Or seineKarten > 2) Then
                Display "Blackjack! Das zahlt 3 zu 2"
                gewinn = betrag * 3 div 2
            Else If seine = 21 And seineKarten = 2 And (meine <> 21 Or meineKarten > 2) Then
                Display "Der Geber hat Blackjack"
                gewinn = 0 - betrag
            Else If seine > 21 Then
                Display "Der Geber hat sich überkauft!"
                gewinn = betrag
            Else If meine > seine Then
                gewinn = betrag
            Else If meine < seine Then
                gewinn = 0 - betrag
            Else
                gewinn = 0
            End If
            Return gewinn
        End Function
    """),
    "g_battleship_p": program("""
        Start
        Declare String schuss
        Declare Integer feldNr
        Declare Integer ergebnis
        Declare Integer meineUebrig
        Declare Integer ihreUebrig
        Declare Integer runde
        heim = leeresMeer()
        gegner = leeresMeer()
        Call setzeFlotte(heim)
        Call setzeFlotte(gegner)
        meineUebrig = 9
        ihreUebrig = 9
        runde = 0
        Display "Schiffe versenken! Jede Seite hat drei Schiffe, 4, 3 und 2 Felder lang. Versenke die anderen, bevor sie deine versenken"
        Display "S ist dein Schiff, X ein Treffer und o daneben. Schieße mit einem Buchstaben und einer Zahl, zum Beispiel B4"
        While meineUebrig > 0 And ihreUebrig > 0
            Call zeigeMeere(heim, gegner)
            runde = runde + 1
            feldNr = -1
            While feldNr = -1
                Display "Runde ", runde, ". Wohin schießt du?"
                Input schuss
                feldNr = feldVon(schuss)
                If feldNr = -1 Then
                    Display "Tippe einen Buchstaben von A bis F und eine Zahl von 1 bis 6, zum Beispiel B4"
                End If
            End While
            ergebnis = feuerAuf(gegner, feldNr)
            If ergebnis = 2 Then
                Display "Treffer!"
            Else If ergebnis = 1 Then
                Display "Platsch. Daneben"
            Else
                Display "Dorthin hast du schon geschossen: ", schuss
            End If
            ihreUebrig = schiffeUebrig(gegner)
            If ihreUebrig > 0 Then
                feldNr = feindZielt(heim)
                ergebnis = feuerAuf(heim, feldNr)
                If ergebnis = 2 Then
                    Display "Der Gegner schießt auf ", nameVon(feldNr), ". Er trifft dein Schiff!"
                Else
                    Display "Der Gegner schießt auf ", nameVon(feldNr), " und verfehlt"
                End If
                meineUebrig = schiffeUebrig(heim)
            End If
            Display "Übrige Schiffsfelder: deine ", meineUebrig, ", seine ", ihreUebrig
        End While
        Call zeigeMeere(heim, gegner)
        If ihreUebrig = 0 Then
            Display "Du hast die ganze Flotte versenkt, in ", runde, " Runden. Sieg!"
        Else
            Display "Deine Flotte ist versenkt. Der Gegner gewinnt diese Schlacht"
        End If
        Stop

        Function leeresMeer()
            meer = []
            For i = 1 To 36
                append(meer, ".")
            End For
            Return meer
        End Function

        Module setzeFlotte(meer)
            Declare Integer zeile
            Declare Integer spalte
            Declare Integer quer
            Declare Boolean passt
            groessen = [4, 3, 2]
            For Each groesse In groessen
                passt = False
                While Not passt
                    quer = random(0, 1)
                    If quer = 1 Then
                        zeile = random(0, 5)
                        spalte = random(0, 6 - groesse)
                    Else
                        zeile = random(0, 6 - groesse)
                        spalte = random(0, 5)
                    End If
                    passt = True
                    For k = 0 To groesse - 1
                        If meer[(zeile + k * (1 - quer)) * 6 + spalte + k * quer] <> "." Then
                            passt = False
                        End If
                    End For
                End While
                For k = 0 To groesse - 1
                    meer[(zeile + k * (1 - quer)) * 6 + spalte + k * quer] = "S"
                End For
            End For
        End Module

        Module zeigeMeere(meins, fremd)
            Declare String zeichen
            Declare String zelle
            Display "   Deine Flotte     Feindliches Meer"
            Display "   1 2 3 4 5 6      1 2 3 4 5 6"
            For r = 0 To 5
                zeichen = substring("ABCDEF", r, r + 1) + "  "
                For c = 0 To 5
                    zeichen = zeichen + meins[r * 6 + c] + " "
                End For
                zeichen = zeichen + "  " + substring("ABCDEF", r, r + 1) + "  "
                For c = 0 To 5
                    zelle = fremd[r * 6 + c]
                    If zelle = "S" Then
                        zelle = "."
                    End If
                    zeichen = zeichen + zelle + " "
                End For
                Display zeichen
            End For
        End Module

        Function Integer feldVon(String eingabe)
            Declare Integer zeile
            Declare Integer spalte
            Declare Integer feld
            feld = -1
            If length(eingabe) = 2 Then
                zeile = indexOf("ABCDEF", toUpper(substring(eingabe, 0, 1)))
                spalte = indexOf("123456", substring(eingabe, 1, 2))
                If zeile >= 0 And spalte >= 0 Then
                    feld = zeile * 6 + spalte
                End If
            End If
            Return feld
        End Function

        Function String nameVon(Integer feld)
            Return substring("ABCDEF", feld div 6, feld div 6 + 1) + (feld mod 6 + 1)
        End Function

        Function Integer feuerAuf(meer, Integer feld)
            Declare Integer ergebnis
            If meer[feld] = "S" Then
                meer[feld] = "X"
                ergebnis = 2
            Else If meer[feld] = "." Then
                meer[feld] = "o"
                ergebnis = 1
            Else
                ergebnis = 0
            End If
            Return ergebnis
        End Function

        Function Integer schiffeUebrig(meer)
            Declare Integer schwimmend
            schwimmend = 0
            For Each zelle In meer
                If zelle = "S" Then
                    schwimmend = schwimmend + 1
                End If
            End For
            Return schwimmend
        End Function

        Function Integer feindZielt(meer)
            Declare Integer zeile
            Declare Integer spalte
            nahe = []
            For i = 0 To 35
                If meer[i] = "X" Then
                    zeile = i div 6
                    spalte = i mod 6
                    If zeile > 0 Then
                        append(nahe, i - 6)
                    End If
                    If zeile < 5 Then
                        append(nahe, i + 6)
                    End If
                    If spalte > 0 Then
                        append(nahe, i - 1)
                    End If
                    If spalte < 5 Then
                        append(nahe, i + 1)
                    End If
                End If
            End For
            ziele = []
            For Each feld In nahe
                If meer[feld] = "." Or meer[feld] = "S" Then
                    append(ziele, feld)
                End If
            End For
            If length(ziele) = 0 Then
                For i = 0 To 35
                    If meer[i] = "." Or meer[i] = "S" Then
                        append(ziele, i)
                    End If
                End For
            End If
            Return ziele[random(0, length(ziele) - 1)]
        End Function
    """),
    "g_math_p": program("""
        Start
        Declare Integer punkte
        Declare Integer serie
        Declare Integer beste
        Declare Integer antwort
        Declare Integer richtig
        punkte = 0
        serie = 0
        beste = 0
        Display "Kopfrechnen: acht Aufgaben. Jede richtige Antwort in Folge bringt einen Punkt mehr als die vorige"
        For runde = 1 To 8
            richtig = stelleAufgabe(runde)
            Input antwort
            If antwort = richtig Then
                serie = serie + 1
                punkte = punkte + serie
                Display "Richtig! Das sind ", serie, " in Folge"
                If serie > beste Then
                    beste = serie
                End If
            Else
                Display "Nicht ganz: es war ", richtig
                serie = 0
            End If
        End For
        Call zeigeErgebnis(punkte, beste)
        Stop

        Function Integer stelleAufgabe(Integer runde)
            Declare Integer a
            Declare Integer b
            Declare Integer art
            Declare Integer ergebnis
            a = random(2, 9 + runde)
            b = random(2, 9)
            art = random(1, 3)
            If art = 1 Then
                Display "Aufgabe ", runde, ": was ist ", a, " + ", b, "?"
                ergebnis = a + b
            Else If art = 2 Then
                Display "Aufgabe ", runde, ": was ist ", a + b, " - ", b, "?"
                ergebnis = a
            Else
                Display "Aufgabe ", runde, ": was ist ", a, " x ", b, "?"
                ergebnis = a * b
            End If
            Return ergebnis
        End Function

        Module zeigeErgebnis(Integer punkte, Integer beste)
            Display "Dein Ergebnis: ", punkte, " Punkte. Längste Serie richtiger Antworten: ", beste
            If punkte >= 30 Then
                Display "Ein Rechengenie!"
            Else If punkte >= 12 Then
                Display "Gut gemacht!"
            Else
                Display "Übe weiter und versuch es noch einmal"
            End If
        End Module
    """),
    "g_pig_p": program("""
        Start
        Declare Integer meine
        Declare Integer seine
        meine = 0
        seine = 0
        Display "Pig: würfle, so oft du dich traust. Eine 1 kostet alles aus diesem Zug. Wer zuerst 50 hat, gewinnt"
        While meine < 50 And seine < 50
            meine = meine + deinZug(meine)
            Display "Stand: du ", meine, ", der Computer ", seine
            If meine < 50 Then
                seine = seine + computerZug(seine)
                Display "Stand: du ", meine, ", der Computer ", seine
            End If
        End While
        If meine >= 50 Then
            Display "Du erreichst zuerst 50 und gewinnst!"
        Else
            Display "Der Computer erreicht zuerst 50 und gewinnt"
        End If
        Stop

        Function Integer deinZug(Integer stand)
            Declare Integer gesammelt
            Declare Integer wurf
            Declare String wahl
            Declare Boolean weiter
            gesammelt = 0
            weiter = True
            While weiter
                wurf = random(1, 6)
                If wurf = 1 Then
                    Display "Du würfelst eine 1 und verlierst die ", gesammelt, " Punkte aus diesem Zug"
                    gesammelt = 0
                    weiter = False
                Else
                    gesammelt = gesammelt + wurf
                    Display "Du würfelst ", wurf, ". In diesem Zug: ", gesammelt, ". Insgesamt: ", stand + gesammelt
                    If stand + gesammelt >= 50 Then
                        weiter = False
                    Else
                        Display "Tippe w, um weiterzuwürfeln, oder h, um anzuhalten"
                        Input wahl
                        If wahl = "h" Or wahl = "H" Then
                            weiter = False
                        End If
                    End If
                End If
            End While
            Return gesammelt
        End Function

        Function Integer computerZug(Integer stand)
            Declare Integer gesammelt
            Declare Integer wurf
            gesammelt = 0
            wurf = 0
            While wurf <> 1 And gesammelt < 15 And stand + gesammelt < 50
                wurf = random(1, 6)
                If wurf = 1 Then
                    gesammelt = 0
                Else
                    gesammelt = gesammelt + wurf
                End If
            End While
            If wurf = 1 Then
                Display "Der Computer würfelt eine 1 und bekommt nichts"
            Else
                Display "Der Computer hält an mit ", gesammelt, " Punkten"
            End If
            Return gesammelt
        End Function
    """),
    "g_lander_p": program("""
        Start
        Declare Real hoehe
        Declare Real tempo
        Declare Integer treibstoff
        Declare Integer sekunden
        Declare Integer schub
        hoehe = 500
        tempo = 0
        treibstoff = 150
        sekunden = 0
        Display "Mondlandung: du bist 500 m hoch und fällst. Verbrenne jede Sekunde 0 bis 20 Einheiten Treibstoff, um zu bremsen"
        Display "Setze mit höchstens 5 m pro Sekunde auf, um sicher zu landen"
        While hoehe > 0
            Call zeigeAnzeige(sekunden, hoehe, tempo, treibstoff)
            schub = frageSchub(treibstoff)
            treibstoff = treibstoff - schub
            tempo = tempo + 1.6 - schub * 0.3
            hoehe = hoehe - tempo
            sekunden = sekunden + 1
        End While
        Call landung(tempo, treibstoff, sekunden)
        Stop

        Module zeigeAnzeige(Integer sekunden, Real hoehe, Real tempo, Integer treibstoff)
            Display "Zeit ", sekunden, " s. Höhe ", round(hoehe), " m. Fallen mit ", round(tempo, 1), " m/s. Treibstoff ", treibstoff
        End Module

        Function Integer frageSchub(Integer treibstoff)
            Declare Integer schub
            schub = 0
            If treibstoff <= 0 Then
                Display "Kein Treibstoff mehr!"
            Else
                Display "Wie viel Treibstoff verbrennen, von 0 bis 20?"
                Input schub
                While schub < 0 Or schub > 20
                    Display "Verbrenne 0 bis 20"
                    Input schub
                End While
                If schub > treibstoff Then
                    Display "Nur noch ", treibstoff, " übrig, also verbrennst du alles"
                    schub = treibstoff
                End If
            End If
            Return schub
        End Function

        Module landung(Real tempo, Integer treibstoff, Integer sekunden)
            If tempo <= 5 Then
                Display "Der Adler ist gelandet! Aufgesetzt mit ", round(tempo, 1), " m/s nach ", sekunden, " Sekunden, mit ", treibstoff, " Treibstoff übrig"
                If tempo <= 2 Then
                    Display "Eine perfekte Landung!"
                End If
            Else If tempo <= 12 Then
                Display "Eine harte Landung mit ", round(tempo), " m/s. Die Fähre hat Beulen, aber du steigst unverletzt aus"
            Else
                Display "Du schlägst mit ", round(tempo), " m/s auf und machst einen neuen Krater"
            End If
        End Module
    """),
    "g_mines_p": program("""
        Start
        Declare Integer offen
        Declare Integer sicher
        Declare Integer quadrat
        Declare String zug
        Declare String gesagt
        Declare Boolean lebendig
        feld = neuesFeld()
        gezeigt = neueAnsicht()
        Call legeMinen(feld, 7)
        sicher = 36 - 7
        offen = 0
        lebendig = True
        Display "Minensucher: 7 Minen sind in einem Feld aus 6 mal 6 versteckt. Öffne jedes Quadrat ohne Mine"
        Display "Tippe ein Quadrat wie B4, um es zu öffnen, oder M und ein Quadrat, etwa MB4, um eine Mine zu markieren"
        While lebendig And offen < sicher
            Call zeigeFeld(feld, gezeigt, False)
            Input zug
            gesagt = toUpper(zug)
            If length(gesagt) = 3 And substring(gesagt, 0, 1) = "M" Then
                quadrat = quadratVon(substring(gesagt, 1, 3))
                If quadrat = -1 Then
                    Display "Das ist kein Quadrat. Versuch etwas wie MB4"
                Else If gezeigt[quadrat] = "." Then
                    gezeigt[quadrat] = "M"
                Else If gezeigt[quadrat] = "M" Then
                    gezeigt[quadrat] = "."
                End If
            Else
                quadrat = quadratVon(gesagt)
                If quadrat = -1 Then
                    Display "Das ist kein Quadrat. Versuch etwas wie B4"
                Else If gezeigt[quadrat] <> "." Then
                    Display "Dieses Quadrat ist schon offen oder markiert"
                Else If feld[quadrat] = -1 Then
                    lebendig = False
                Else
                    offen = offen + oeffneAb(feld, gezeigt, quadrat)
                End If
            End If
        End While
        Call zeigeFeld(feld, gezeigt, True)
        If lebendig Then
            Display "Jedes sichere Quadrat ist offen. Du hast das Feld geräumt!"
        Else
            Display "Bumm! Unter diesem Quadrat lag eine Mine. Beim nächsten Mal mehr Glück"
        End If
        Stop

        Function neuesFeld()
            zellen = []
            For i = 1 To 36
                append(zellen, 0)
            End For
            Return zellen
        End Function

        Function neueAnsicht()
            zellen = []
            For i = 1 To 36
                append(zellen, ".")
            End For
            Return zellen
        End Function

        Module legeMinen(feld, Integer anzahl)
            Declare Integer gelegt
            Declare Integer stelle
            gelegt = 0
            While gelegt < anzahl
                stelle = random(0, 35)
                If feld[stelle] <> -1 Then
                    feld[stelle] = -1
                    gelegt = gelegt + 1
                End If
            End While
            For stelle = 0 To 35
                If feld[stelle] <> -1 Then
                    feld[stelle] = minenRundum(feld, stelle)
                End If
            End For
        End Module

        Function Integer minenRundum(feld, Integer stelle)
            Declare Integer anzahl
            Declare Integer r
            Declare Integer c
            anzahl = 0
            For dr = -1 To 1
                For dc = -1 To 1
                    r = stelle div 6 + dr
                    c = stelle mod 6 + dc
                    If r >= 0 And r < 6 And c >= 0 And c < 6 Then
                        If feld[r * 6 + c] = -1 Then
                            anzahl = anzahl + 1
                        End If
                    End If
                End For
            End For
            Return anzahl
        End Function

        Function Integer oeffneAb(feld, gezeigt, Integer anfang)
            Declare Integer anzahl
            Declare Integer stelle
            Declare Integer nachbar
            Declare Integer pos
            Declare Integer r
            Declare Integer c
            liste = [anfang]
            gezeigt[anfang] = textVon(feld[anfang])
            anzahl = 1
            pos = 0
            While pos < length(liste)
                stelle = liste[pos]
                pos = pos + 1
                If feld[stelle] = 0 Then
                    For dr = -1 To 1
                        For dc = -1 To 1
                            r = stelle div 6 + dr
                            c = stelle mod 6 + dc
                            If r >= 0 And r < 6 And c >= 0 And c < 6 Then
                                nachbar = r * 6 + c
                                If gezeigt[nachbar] = "." Then
                                    gezeigt[nachbar] = textVon(feld[nachbar])
                                    anzahl = anzahl + 1
                                    append(liste, nachbar)
                                End If
                            End If
                        End For
                    End For
                End If
            End While
            Return anzahl
        End Function

        Function String textVon(Integer minen)
            Declare String text
            text = " "
            If minen > 0 Then
                text = "" + minen
            End If
            Return text
        End Function

        Module zeigeFeld(feld, gezeigt, Boolean alles)
            Declare String zeile
            Display "    1 2 3 4 5 6"
            For r = 0 To 5
                zeile = substring("ABCDEF", r, r + 1) + " |"
                For c = 0 To 5
                    If alles And feld[r * 6 + c] = -1 Then
                        zeile = zeile + " *"
                    Else
                        zeile = zeile + " " + gezeigt[r * 6 + c]
                    End If
                End For
                Display zeile
            End For
        End Module

        Function Integer quadratVon(String text)
            Declare Integer reihe
            Declare Integer spalte
            Declare Integer gefunden
            reihe = -1
            spalte = -1
            gefunden = -1
            If length(text) = 2 Then
                reihe = indexOf("ABCDEF", substring(text, 0, 1))
                spalte = indexOf("123456", substring(text, 1, 2))
            End If
            If reihe >= 0 And spalte >= 0 Then
                gefunden = reihe * 6 + spalte
            End If
            Return gefunden
        End Function
    """),
    # ---- icons, and a drawing run as what it is: a home walked through,
    # work passed on, data sent, a circuit switched on, a launch
    # (03-icons.js, 11-hand-icons.js, 37-board.js to 39-orbit.js)
    "ic_open": "Symbole",
    "ic_open_tip": "Berufe, Möbel, Geräte und mehr",
    "ic_find": "Symbole suchen",
    "ic_none": "Kein Symbol passt dazu.",
    "ic_all": "Alle",
    "ic_recent": "Zuletzt",
    "ic_people": "Berufe",
    "ic_devices": "Computer & Netzwerk",
    "ic_circuit": "Stromkreise",
    "ic_travel": "Verkehr & Stadt",
    "ic_space": "Weltraum",
    "ic_things": "Dinge & Ideen",
    "fp_unit": "m",
    "fp_area": "{n} m²",
    "n_i_person": "Person",
    "n_i_man": "Mann",
    "n_i_woman": "Frau",
    "n_i_child": "Kind",
    "n_i_elder": "Ältere Person",
    "n_i_team": "Team",
    "n_i_doctor": "Arzt",
    "n_i_nurse": "Pflegekraft",
    "n_i_surgeon": "Chirurg",
    "n_i_dentist": "Zahnarzt",
    "n_i_pharmacist": "Apotheker",
    "n_i_paramedic": "Sanitäter",
    "n_i_patient": "Patient",
    "n_i_chef": "Koch",
    "n_i_baker": "Bäcker",
    "n_i_waiter": "Kellner",
    "n_i_farmer": "Landwirt",
    "n_i_gardener": "Gärtner",
    "n_i_builder": "Bauarbeiter",
    "n_i_engineer": "Ingenieur",
    "n_i_electrician": "Elektriker",
    "n_i_plumber": "Klempner",
    "n_i_mechanic": "Mechaniker",
    "n_i_carpenter": "Tischler",
    "n_i_painter": "Maler",
    "n_i_cleaner": "Hausmeister",
    "n_i_miner": "Bergmann",
    "n_i_artist": "Künstler",
    "n_i_musician": "Musiker",
    "n_i_photographer": "Fotograf",
    "n_i_reporter": "Reporter",
    "n_i_teacher": "Lehrkraft",
    "n_i_student": "Schüler",
    "n_i_graduate": "Absolvent",
    "n_i_librarian": "Bibliothekar",
    "n_i_scientist": "Wissenschaftler",
    "n_i_programmer": "Programmierer",
    "n_i_office": "Büroangestellter",
    "n_i_manager": "Führungskraft",
    "n_i_accountant": "Buchhalter",
    "n_i_receptionist": "Empfang",
    "n_i_agent": "Callcenter-Agent",
    "n_i_cashier": "Kassierer",
    "n_i_customer": "Kunde",
    "n_i_police": "Polizist",
    "n_i_firefighter": "Feuerwehr",
    "n_i_soldier": "Soldat",
    "n_i_guard": "Wachdienst",
    "n_i_lawyer": "Anwalt",
    "n_i_judge": "Richter",
    "n_i_pilot": "Pilot",
    "n_i_astronaut": "Astronaut",
    "n_i_driver": "Fahrer",
    "n_i_delivery": "Lieferdienst",
    "n_i_postman": "Briefträger",
    "n_i_hairdresser": "Friseur",
    "n_i_coach": "Trainer",
    "n_i_room": "Raum",
    "n_i_wall": "Wand",
    "n_i_door": "Tür",
    "n_i_door2": "Doppeltür",
    "n_i_slide": "Schiebetür",
    "n_i_window": "Fenster",
    "n_i_stairs": "Treppe",
    "n_i_bed": "Doppelbett",
    "n_i_bed1": "Einzelbett",
    "n_i_crib": "Babybett",
    "n_i_nightstand": "Nachttisch",
    "n_i_wardrobe": "Kleiderschrank",
    "n_i_dresser": "Kommode",
    "n_i_sofa": "Sofa",
    "n_i_armchair": "Sessel",
    "n_i_coffee": "Couchtisch",
    "n_i_tv": "Fernseher",
    "n_i_fireplace": "Kamin",
    "n_i_piano": "Klavier",
    "n_i_bookcase": "Bücherregal",
    "n_i_rug": "Teppich",
    "n_i_lamp": "Stehlampe",
    "n_i_plant": "Pflanze",
    "n_i_dining": "Esstisch",
    "n_i_roundtable": "Runder Tisch",
    "n_i_chair": "Stuhl",
    "n_i_desk": "Schreibtisch",
    "n_i_officechair": "Bürostuhl",
    "n_i_counter": "Küchenzeile",
    "n_i_stove": "Herd",
    "n_i_fridge": "Kühlschrank",
    "n_i_kitchensink": "Spüle",
    "n_i_toilet": "Toilette",
    "n_i_sink": "Waschbecken",
    "n_i_bathtub": "Badewanne",
    "n_i_shower": "Dusche",
    "n_i_washer": "Waschmaschine",
    "n_i_dryer": "Trockner",
    "n_i_parked": "Auto (von oben)",
    "n_i_shrub": "Baum (von oben)",
    "n_i_computer": "Computer",
    "n_i_laptop": "Laptop",
    "n_i_tablet": "Tablet",
    "n_i_phone": "Handy",
    "n_i_server": "Server",
    "n_i_database": "Datenbank",
    "n_i_router": "Router",
    "n_i_switch": "Netzwerk-Switch",
    "n_i_firewall": "Firewall",
    "n_i_wifi": "WLAN",
    "n_i_internet": "Internet",
    "n_i_tower": "Funkmast",
    "n_i_printer": "Drucker",
    "n_i_camera": "Überwachungskamera",
    "n_i_battery": "Batterie",
    "n_i_bulb": "Glühbirne",
    "n_i_switch_on": "Schalter",
    "n_i_resistor": "Widerstand",
    "n_i_capacitor": "Kondensator",
    "n_i_led": "LED",
    "n_i_motor": "Motor",
    "n_i_buzzer": "Summer",
    "n_i_socket": "Steckdose",
    "n_i_solar": "Solarmodul",
    "n_i_ground": "Masse",
    "n_i_cell": "Zelle",
    "n_i_diode": "Diode",
    "n_i_fuse": "Sicherung",
    "n_i_ammeter": "Amperemeter",
    "n_i_voltmeter": "Voltmeter",
    "n_i_dimmer": "Dimmer",
    "n_i_comet": "Komet",
    "n_i_asteroid": "Asteroid",
    "n_i_station": "Raumstation",
    "n_i_lander": "Mondfähre",
    "n_i_galaxy": "Galaxie",
    "n_i_taxi": "Taxi",
    "n_i_tram": "Straßenbahn",
    "n_i_helicopter": "Hubschrauber",
    "n_i_scooter": "Roller",
    "n_i_airport": "Flughafen",
    "n_i_trainstation": "Bahnhof",
    "n_i_park": "Park",
    "n_i_cafe": "Café",
    "n_i_gift": "Geschenk",
    "n_i_target": "Zielscheibe",
    "n_i_hourglass": "Sanduhr",
    "n_i_music": "Musik",
    "n_i_palette": "Farbpalette",
    "n_i_tag": "Preisschild",
    "n_i_magnet": "Magnet",
    "n_i_puzzle": "Puzzleteil",
    "n_i_car": "Auto",
    "n_i_bus": "Bus",
    "n_i_truck": "Lkw",
    "n_i_bike": "Fahrrad",
    "n_i_train": "Zug",
    "n_i_plane": "Flugzeug",
    "n_i_ship": "Schiff",
    "n_i_house": "Haus",
    "n_i_building": "Bürogebäude",
    "n_i_shop": "Laden",
    "n_i_school": "Schule",
    "n_i_hospital": "Krankenhaus",
    "n_i_factory": "Fabrik",
    "n_i_warehouse": "Lagerhalle",
    "n_i_tree": "Baum",
    "n_i_traffic": "Ampel",
    "n_i_rocket": "Rakete",
    "n_i_satellite": "Satellit",
    "n_i_sun": "Sonne",
    "n_i_earth": "Erde",
    "n_i_moon": "Mond",
    "n_i_planet": "Planet",
    "n_i_star": "Stern",
    "n_i_telescope": "Teleskop",
    "n_i_ufo": "UFO",
    "n_i_zone": "Bereich",
    "n_i_money": "Geld",
    "n_i_coins": "Münzen",
    "n_i_cart": "Einkaufswagen",
    "n_i_package": "Paket",
    "n_i_mail": "Post",
    "n_i_chat": "Chat",
    "n_i_clock": "Uhr",
    "n_i_calendar": "Kalender",
    "n_i_gear": "Zahnrad",
    "n_i_lock": "Schloss",
    "n_i_key": "Schlüssel",
    "n_i_idea": "Idee",
    "n_i_search": "Suche",
    "n_i_check": "Häkchen",
    "n_i_cross": "Kreuz",
    "n_i_warning": "Warnung",
    "n_i_flag": "Flagge",
    "n_i_heart": "Herz",
    "n_i_trophy": "Pokal",
    "n_i_chart": "Balkendiagramm",
    "n_i_book": "Buch",
    "n_i_megaphone": "Megafon",
    "vb_i_person": "erledigt die Aufgabe",
    "vb_i_man": "erledigt die Aufgabe",
    "vb_i_woman": "erledigt die Aufgabe",
    "vb_i_child": "malt ein Bild",
    "vb_i_elder": "gibt einen guten Rat",
    "vb_i_team": "arbeitet gemeinsam daran",
    "vb_i_doctor": "untersucht den Patienten",
    "vb_i_nurse": "versorgt den Patienten",
    "vb_i_surgeon": "operiert",
    "vb_i_dentist": "kontrolliert die Zähne",
    "vb_i_pharmacist": "gibt das Medikament aus",
    "vb_i_paramedic": "leistet Erste Hilfe",
    "vb_i_patient": "beschreibt die Beschwerden",
    "vb_i_chef": "kocht das Essen",
    "vb_i_baker": "backt das Brot",
    "vb_i_waiter": "nimmt die Bestellung auf",
    "vb_i_farmer": "bringt die Ernte ein",
    "vb_i_gardener": "gießt die Pflanzen",
    "vb_i_builder": "baut es",
    "vb_i_engineer": "entwirft es",
    "vb_i_electrician": "verlegt die Leitungen",
    "vb_i_plumber": "repariert die Rohre",
    "vb_i_mechanic": "repariert den Motor",
    "vb_i_carpenter": "baut den Rahmen",
    "vb_i_painter": "streicht es",
    "vb_i_cleaner": "räumt auf",
    "vb_i_miner": "baut Erz ab",
    "vb_i_artist": "zeichnet es",
    "vb_i_musician": "spielt eine Melodie",
    "vb_i_photographer": "macht ein Foto",
    "vb_i_reporter": "schreibt den Bericht",
    "vb_i_teacher": "unterrichtet",
    "vb_i_student": "macht die Hausaufgaben",
    "vb_i_graduate": "bekommt das Zeugnis",
    "vb_i_librarian": "findet das Buch",
    "vb_i_scientist": "führt das Experiment durch",
    "vb_i_programmer": "schreibt den Code",
    "vb_i_office": "füllt die Formulare aus",
    "vb_i_manager": "macht den Plan",
    "vb_i_accountant": "macht die Buchhaltung",
    "vb_i_receptionist": "vergibt den Termin",
    "vb_i_agent": "nimmt den Anruf an",
    "vb_i_cashier": "kassiert",
    "vb_i_customer": "gibt die Bestellung auf",
    "vb_i_police": "ermittelt",
    "vb_i_firefighter": "löscht das Feuer",
    "vb_i_soldier": "hält Wache",
    "vb_i_guard": "prüft den Ausweis",
    "vb_i_lawyer": "vertritt den Fall",
    "vb_i_judge": "spricht das Urteil",
    "vb_i_pilot": "fliegt das Flugzeug",
    "vb_i_astronaut": "fliegt in die Umlaufbahn",
    "vb_i_driver": "fährt es hin",
    "vb_i_delivery": "liefert das Paket",
    "vb_i_postman": "trägt die Post aus",
    "vb_i_hairdresser": "schneidet die Haare",
    "vb_i_coach": "trainiert das Team",
    "wk_i_bed": "schläft im Bett",
    "wk_i_bed1": "macht ein Nickerchen",
    "wk_i_crib": "schaut nach dem Baby",
    "wk_i_nightstand": "macht die Nachttischlampe an",
    "wk_i_wardrobe": "sucht Kleidung aus",
    "wk_i_dresser": "zieht sich an",
    "wk_i_sofa": "setzt sich aufs Sofa",
    "wk_i_armchair": "liest im Sessel",
    "wk_i_coffee": "stellt eine Tasse auf den Couchtisch",
    "wk_i_tv": "sieht fern",
    "wk_i_fireplace": "wärmt sich am Kamin",
    "wk_i_piano": "spielt Klavier",
    "wk_i_bookcase": "nimmt ein Buch aus dem Regal",
    "wk_i_lamp": "schaltet die Lampe ein",
    "wk_i_plant": "gießt die Pflanze",
    "wk_i_dining": "isst am Tisch",
    "wk_i_roundtable": "trinkt am Tisch einen Kaffee",
    "wk_i_chair": "setzt sich hin",
    "wk_i_desk": "arbeitet am Schreibtisch",
    "wk_i_officechair": "dreht sich im Bürostuhl",
    "wk_i_counter": "macht ein Sandwich",
    "wk_i_stove": "kocht am Herd",
    "wk_i_fridge": "holt Milch aus dem Kühlschrank",
    "wk_i_kitchensink": "spült ab",
    "wk_i_toilet": "geht auf die Toilette",
    "wk_i_sink": "wäscht sich die Hände",
    "wk_i_bathtub": "nimmt ein Bad",
    "wk_i_shower": "duscht",
    "wk_i_washer": "wäscht die Wäsche",
    "wk_i_dryer": "trocknet die Wäsche",
    "wk_i_parked": "steigt ins Auto",
    "wk_i_shrub": "ruht sich unter dem Baum aus",
    "wk_i_stairs": "steigt die Treppe hinauf",
    "fr_kitchen": "Küche",
    "fr_bath": "Bad",
    "fr_bed": "Schlafzimmer",
    "fr_laundry": "Waschküche",
    "fr_garage": "Garage",
    "fr_office": "Arbeitszimmer",
    "fr_dining": "Esszimmer",
    "fr_living": "Wohnzimmer",
    "fr_room": "Raum",
    "fr_closet": "Ankleidezimmer",
    "fr_studio": "Wohn-Schlafraum",
    "fr_great": "Wohnküche",
    "fr_eatin": "Essküche",
    "fr_livdine": "Wohn- und Esszimmer",
    "wk_comes_in": "{who} kommt zur Haustür herein.",
    "wk_starts": "{who} beginnt hier: {room}.",
    "wk_in_room": "Weiter: {room}.",
    "wk_empty": "Leer: {room}.",
    "wk_does": "{who} {does}.",
    "wk_cannot_reach": "Kein Durchkommen: {what} ({room}).",
    "wk_leaves": "{who} geht zur Haustür hinaus.",
    "wk_no_way_in": "Kein Weg hinein: {room} hat keine Tür.",
    "wk_summary": "Räume durchlaufen: {rooms} · Dinge benutzt: {used} · Fläche: {area}",
    "wk_no_rooms": "Zieh einen Raum um die Möbel, um hindurchzugehen.",
    "wk_door_loose": "Diese Tür steht in keiner Wand.",
    "wk_no_door": "Keine Tür führt hinein: {room}.",
    "wk_blocked": "Im Türrahmen steht etwas: {what}.",
    "wk_sum": "Räume: {rooms} · Möbel: {pieces} · Fläche: {area}",
    "wk_st_rooms": "Räume",
    "wk_st_pieces": "Möbel",
    "wk_st_floor": "Fläche",
    "wk_visitor": "Ein Gast",
    "wk_hello": "Hallo!",
    "bd_auto": "Automatisch",
    "bd_auto_is": "Automatisch: {what}",
    "bd_pick": "Was die Zeichnung ist – und was Starten damit macht",
    "bd_program": "Programm",
    "bd_home": "Grundriss",
    "bd_team": "Menschen bei der Arbeit",
    "bd_network": "Netzwerk",
    "bd_circuit": "Stromkreis",
    "bd_space": "Weltraum",
    "bd_city": "Unterwegs",
    "bd_flow": "Pfeile",
    "bd_tidy_kept": "Ein Grundriss oder ein Himmel bleibt, wie du ihn gezeichnet hast: Aufräumen ist für Flussdiagramme und Organigramme.",
    "go_home": "Durchgehen",
    "go_team": "Arbeit weitergeben",
    "go_network": "Daten senden",
    "go_circuit": "Einschalten",
    "go_space": "Abheben",
    "go_city": "Losfahren",
    "go_flow": "Den Pfeilen folgen",
    "v3_open": "In 3D ansehen",
    "v3_tip": "In 3D ansehen",
    "v3_empty": "Noch nichts zum Aufbauen.",
    "v3_low": "Niedrige Wände",
    "v3_hint": "Ziehen oder Pfeiltasten zum Drehen · W A S D zum Bewegen · Mausrad zum Zoomen",
    "v3_close": "3D-Ansicht schließen",
    "pn_close": "Schließen",
    "pn_hide": "Wegklappen (Röntgenblick bleibt an)",
    "pn_show": "Legende wieder zeigen",
    "tw_alone": "Verbinde die Personen mit Pfeilen, um die Arbeit weiterzugeben.",
    "tw_works": "{who}: {does}.",
    "tw_shares": "{who} verteilt die Arbeit: {to}.",
    "tw_back": "Alles kommt zurück zu {who}.",
    "tw_hands": "{who} → {to}.",
    "tw_hands_what": "{who} → {to}: {what}.",
    "tw_done": "Fertig. Übergaben: {hands} · Personen: {people} · Am meisten zu tun: {who}",
    "tw_loose": "Keine Pfeile zu oder von {who}.",
    "tw_sum": "Personen: {people} · Pfeile: {arrows}",
    "nw_cables": "Verbinde die Geräte mit Pfeilen als Kabel, um Daten zu senden.",
    "nw_none": "{who} erreicht nichts.",
    "nw_allowed": "erlaubt",
    "nw_reply": "OK",
    "nw_route": "{path} ({ms} ms)",
    "nw_ok": "Durchgekommen: {n} von {all}.",
    "nw_loose": "{who} ist mit nichts verbunden.",
    "nw_sum": "Geräte: {devices} · Kabel: {cables}",
    "cy_none": "Verbinde jedes Fahrzeug mit Pfeilen mit den Orten, zu denen es fährt.",
    "cy_still": "{who} hat kein Ziel.",
    "cy_stop": "Halt: {place}",
    "cy_route": "{who}: {stops}",
    "cy_sum": "Fahrzeuge: {vehicles} · Orte: {places}",
    "fw_none": "Verbinde die Formen mit Pfeilen, um ihnen zu folgen.",
    "fw_at": "→ {what}",
    "fw_done": "Gefolgte Pfeile: {n}.",
    "fw_sum": "Formen: {shapes} · Pfeile: {arrows}",
    "ec_no_source": "Füge eine Batterie hinzu, um den Stromkreis zu versorgen.",
    "ec_opened": "{who}: aus.",
    "ec_closed": "{who}: an.",
    "ec_press": "Klick auf einen Schalter, um ihn umzulegen.",
    "ec_buzz": "bzzz",
    "ec_short": "Kurzschluss! Nichts bremst den Strom an der Batterie.",
    "ec_open": "Der Stromkreis ist nicht geschlossen, also fließt kein Strom.",
    "ec_source": "{who}: {v} V, {a}",
    "ec_dark": "{who}: kein Licht.",
    "ec_too_bright": "{who}: viel zu viel Strom ({a}) – das brennt durch.",
    "ec_lit": "{who}: leuchtet ({a}).",
    "ec_turns": "{who}: dreht sich ({a}).",
    "ec_still": "{who}: steht still.",
    "ec_buzzes": "{who}: summt ({a}).",
    "ec_quiet": "{who}: still.",
    "ec_drop": "{who}: {v} V Spannung, {a}",
    "ec_conducts": "{who} lässt den Strom durch: {a}",
    "ec_blocks": "{who} sperrt den Strom: Er kommt nur andersherum durch",
    "ec_blown": "{who} ist durchgebrannt: Es floss zu viel Strom, und der Stromkreis ist offen",
    "ec_fuse_ok": "{who} hält: {a} fließen hindurch",
    "ec_reads_a": "{who} zeigt {a}",
    "ec_reads_v": "{who} zeigt {v} V",
    "ec_loose": "{who} braucht an jedem Ende einen Draht.",
    "ec_sum": "Bauteile: {parts} · Drähte: {wires}",
    "os_empty": "Zeichne eine Sonne und ein paar Planeten, um sie in Bewegung zu setzen.",
    "os_year_vs": "{who} kreist um {around}: Ein Jahr dort dauert {n} Erdjahre.",
    "os_year": "{who} kreist hier alle {n} Sekunden um {around}.",
    "os_launch": "{who} hebt ab.",
    "os_orbit": "{who} schwenkt in eine Umlaufbahn um {around} ein.",
    "os_arrive": "{who} erreicht {where}.",
    "os_landed": "Gelandet: {where}",
    "os_no_sun": "Füge eine Sonne hinzu, um die die Planeten kreisen.",
    "os_sum": "Himmelskörper: {bodies} · Raumfahrzeuge: {craft}",
    "tw_again": "macht weiter",
    "ec_dim": "{who}: glimmt schwach ({a}).",
    "n_i_picture": "Bild",
    "n_i_mirror": "Spiegel",
    "n_i_shelf": "Wandregal",
    "n_i_walltv": "Wandfernseher",
    "n_i_wallclock": "Wanduhr",
    "n_i_sconce": "Wandleuchte",
    "n_i_cabinet": "Hängeschrank",
    "n_i_hooks": "Garderobenhaken",
    "n_i_radiator": "Heizkörper",
    "wk_i_picture": "betrachtet das Bild",
    "wk_i_mirror": "schaut in den Spiegel",
    "wk_i_shelf": "nimmt ein Buch vom Regal",
    "wk_i_walltv": "sieht fern",
    "wk_i_wallclock": "schaut auf die Uhr",
    "wk_i_sconce": "macht das Licht an",
    "wk_i_cabinet": "holt einen Teller aus dem Schrank",
    "wk_i_hooks": "hängt einen Mantel auf",
    "wk_i_radiator": "wärmt sich die Hände",
    "wk_locked_in": "Hinter einer verschlossenen Tür: {room}.",
    "v3_walk": "Herumlaufen",
    "v3_above": "Von oben",
    "v3_restart": "Neu beginnen",
    "v3_door": "Tür",
    "v3_locked": "Abgeschlossen.",
    "v3_no_door": "Keine Tür in Reichweite.",
    "v3_hint_walk": "W A S D zum Gehen · in die Ansicht klicken, um mit der Maus umherzuschauen, Esc gibt sie frei · E oder ein Klick benutzt, was vor dir ist",
    "us_nothing": "Nichts in Reichweite",
    "us_light_on": "Licht an",
    "us_light_off": "Licht aus",
    "us_breaker_off": "Sicherungen aus: überall ist es dunkel",
    "us_breaker_on": "Sicherungen an: das Licht ist wieder da",
    "us_screen_on": "{what} an",
    "us_screen_off": "{what} aus",
    "us_fan_on": "Ventilator an",
    "us_fan_off": "Ventilator aus",
    "us_water_on": "Wasser läuft",
    "us_water_off": "Wasser aus",
    "us_heat_on": "{what} an",
    "us_heat_off": "{what} aus",
    "us_sit": "Du setzt dich. Geh los, um aufzustehen",
    "us_sleep": "Gut geschlafen. Es ist Morgen",
    "us_rest": "Du legst dich kurz hin",
    "us_open": "{what} geöffnet",
    "us_close": "{what} geschlossen",
    "us_flush": "Gespült",
    "us_play": "Du spielst ein paar Töne",
    "us_plant": "Du gießt die Pflanze",
    "us_book": "Du nimmst ein Buch heraus",
    "us_pay": "Bezahlt. Danke!",
    "us_plug": "Du steckst etwas ein",
    "us_shop": "Du nimmst etwas aus dem Regal",
    "us_coffee": "Ein frischer Kaffee",
    "us_exercise": "Gut trainiert",
    "us_game": "Du bist dran",
    "us_fish": "Die Fische kommen herüber",
    "us_music": "Musik an",
    "us_write": "Du schreibst an die Tafel",
    "us_breaker": "Die Sicherungen: noch einmal E schaltet alles wieder ein",
    "us_car": "Das Auto ist abgeschlossen",
    "us_swim": "Eine Runde schwimmen",
    "wo_head": "Wände",
    "wo_top": "Oben",
    "wo_foot": "Unten",
    "wo_left": "Links",
    "wo_right": "Rechts",
    "wo_outside": "Außenwand",
    "wo_outside_tip": "Eine Außenwand trägt das Haus und hält das Wetter draußen: sie bleibt",
    "wo_open_to": "Offen zu {room}",
    "wo_wall_to": "Wand zu {room}",
    "wo_free": "{span} Öffnung. Die Wand trug nichts Schweres: kein Träger nötig",
    "wo_lvl": "ein {plies}-lagiger Furnierschichtholz-Träger, {depth} hoch",
    "wo_steel": "ein Stahlträger, {depth} hoch (von einem Statiker bemessen lassen)",
    "wo_carries_floor": "{span} Öffnung unter dem Stockwerk darüber: {beam}, auf einer Stütze an jedem Ende.",
    "wo_carries_roof": "{span} Öffnung unter der Dachmitte: {beam}, auf einer Stütze an jedem Ende.",
    "wo_mid_post": "So eine Spannweite braucht auch eine Stütze in der Mitte.",
    "wo_add_posts": "Stützen aufstellen",
    "ad_beam_posts": "Die entfernte Wand zwischen {a} und {b} trug das Haus: ihr Träger braucht Stützen",
    "xr_wired": "{n} Steckdosen, Schalter und ein Sicherungskasten eingebaut",
    "xr_panel": "Sicherungskasten",
    "xr_heater": "Warmwasserspeicher",
    "xr_main": "Hauswasseranschluss",
    "xr_sewer": "Zum Kanal",
    "xr_meter": "Gaszähler",
    "xr_furnace": "Heizkessel",
    "xr_button": "In die Wände",
    "xr_tip": "In die Wände sehen: Ständerwerk, Leitungen, Rohre, Gas und Lüftungskanäle",
    "xr_head": "In den Wänden",
    "xr_frame": "Tragwerk: Ständer, Balken, Träger",
    "xr_power": "Leitungen, Farbe nach Ampere",
    "xr_water": "Wasser, kalt und warm",
    "xr_drain": "Abwasser und Entlüftung",
    "xr_gas": "Gas",
    "xr_air": "Heizungs- und Lüftungskanäle",
    "xr_wire": "Steckdosen und Schalter einbauen",
    "xr_rewire": "Neu verkabeln",
    "xr_wire_tip": "Steckdosen so, dass kein Punkt einer Wand weiter als 1,8 m von einer entfernt ist, alle 1,2 m über Arbeitsflächen, ein Schalter an jeder Tür und ein Sicherungskasten",
    "xr_wire_tile": "Steckdosen und Schalter",
    "v3_outside": "Draußen",
    "v3_tips": "Vorschläge: {n}",
    "ad_said": "Vorschlag: {what}",
    "ad_no_front": "Es gibt keine Haustür, also kommt niemand von draußen herein.",
    "ad_fix_front": "Haustür hinzufügen",
    "ad_window_bed": "Kein Fenster: {room}. Ein Schlafzimmer braucht Tageslicht und einen Fluchtweg bei Feuer.",
    "ad_window": "Kein Fenster für Tageslicht: {room}.",
    "ad_fix_window": "Fenster hinzufügen",
    "ad_dark": "Weder Fenster noch Licht: {room}.",
    "ad_fix_light": "Wandleuchte hinzufügen",
    "ad_missing": "Es fehlt: {what} ({room}).",
    "ad_fix_add": "Hinzufügen: {what}",
    "ad_bath_sink": "Toilette, aber kein Waschbecken zum Händewaschen: {room}.",
    "ad_small_bed": "Ein Doppelbett ist hier knapp ({room}, {area}): etwa {want} wären bequem.",
    "ad_back_to_tv": "Mit dem Rücken zum Fernseher: {what}.",
    "ad_fix_face_tv": "Zum Fernseher drehen",
    "ad_door_hits": "Eine Tür schlägt dagegen: {what}.",
    "ad_fix_flip": "Andersherum öffnen lassen",
    "ad_bath_kitchen": "Die Tür vom Bad führt direkt in die Küche ({bath} → {kitchen}).",
    "ad_boxed_in": "Niemand kommt hier hin: {what} ({room}).",
    "ad_front_blocked": "{what} lässt sich nicht öffnen: {by} steht davor.",
    "ad_firewall": "Nichts schützt das Netzwerk vor dem Internet: Setz eine Firewall dazwischen.",
    "ad_fix_firewall": "Firewall hinzufügen",
    "ad_single": "Alles läuft über {who}: Fällt es aus, kommt nichts mehr durch.",
    "ad_led": "{who} bekommt zu viel Strom ({a}) und würde durchbrennen: Setz einen Widerstand davor.",
    "ad_fix_resistor": "Widerstand hinzufügen",
    "ad_switch": "Es gibt keinen Schalter zum Ausschalten.",
    "ad_fix_switch": "Schalter hinzufügen",
    "ad_busy": "{who} erledigt die meiste Arbeit: Verteil sie.",
    "tab_code_tip": "Die Schritte in einfachen Worten schreiben (Pseudocode); daraus wird das Diagramm gezeichnet",
    "tab_hand_tip": "Von Hand zeichnen: Flussdiagramme, Grundrisse, Menschen bei der Arbeit, Netzwerke, Stromkreise und mehr",
    "tab_lang_tip": "In einer Programmiersprache schreiben: Python, Java, C#, C++, JavaScript und mehr",
    "hm_icons": "Ein Symbol aus Symbole hinzufügen, unter den Formen: antippen oder aufs Blatt ziehen; nach Namen suchen",
    "hm_room": "Einen Raum oder Bereich verschieben, und alles darin wandert mit",
    "hm_door": "Eine Tür, ein Fenster oder ein Bild an eine Wand setzen, und es passt sich in die Wand ein",
    "hm_tie": "Räume mit einem Pfeil oder über eine Tür dazwischen verbinden und auf dem Papier auseinander lassen: in 3D stoßen sie aneinander, mit einer Tür in der Wand dazwischen",
    "st_title": "Haus anlegen",
    "st_sub": "Räume wählen. Sie werden angelegt und eingerichtet, mit Pfeilen verbunden; in 3D rücken sie zusammen, mit einer Tür dazwischen.",
    "st_beds": "Schlafzimmer",
    "st_baths": "Bäder",
    "st_open_plan": "Küche und Essbereich in einem Raum",
    "st_open_living": "Offener Grundriss",
    "st_office": "Ein Arbeitszimmer",
    "st_laundry": "Eine Waschküche",
    "st_garage": "Eine Garage",
    "st_closet": "Ein begehbarer Kleiderschrank",
    "st_spread": "Auf dem Papier auseinander",
    "st_make": "Haus anlegen",
    "st_rooms_head": "Räume",
    "st_extras_head": "Außerdem",
    "st_house_head": "Das Haus",
    "st_one_floor": "Ein Geschoss",
    "st_two_floors": "Zwei Geschosse",
    "st_shuffle": "Neu mischen",
    "st_shuffle_tip": "Ein anderes Haus mit denselben Angaben",
    "st_preview": "Das Haus, wie es entsteht",
    "st_preview_sum": "{rooms} Räume · etwa {area}",
    "st_fewer": "Weniger",
    "st_more": "Mehr",
    "st_made": "{rooms} Räume angelegt",
    "st_main": "Elternschlafzimmer",
    "st_bed_n": "Schlafzimmer {n}",
    "st_ensuite": "Eigenes Bad",
    "st_hall": "Flur",
    "hm_run_as": "Starten macht, was die Zeichnung ist: geht durch ein Haus, gibt Arbeit weiter, sendet Daten, schaltet einen Stromkreis ein, startet eine Rakete",
    "depth": "Tiefe",
    "depth_tip": "Jede Form in ihrer eigenen Farbe schattieren und ihr einen Schatten geben, damit Farben plastisch wirken",
    "n_i_ac": "Klimaanlage",
    "n_i_aquarium": "Aquarium",
    "n_i_arclamp": "Bogenlampe",
    "n_i_basket": "Korb",
    "n_i_bathmat": "Badematte",
    "n_i_beanbag": "Sitzsack",
    "n_i_bedking": "Kingsize-Bett",
    "n_i_bench": "Sitzbank",
    "n_i_books": "Bücher",
    "n_i_bunkbed": "Etagenbett",
    "n_i_cactus": "Kaktus",
    "n_i_candle": "Kerze",
    "n_i_cattree": "Kratzbaum",
    "n_i_ceilingfan": "Deckenventilator",
    "n_i_vent": "Lüftungsgitter",
    "n_i_chandelier": "Kronleuchter",
    "n_i_chest": "Truhe",
    "n_i_coatrack": "Garderobenständer",
    "n_i_coffeemaker": "Kaffeemaschine",
    "n_i_console": "Spielkonsole",
    "n_i_cornershelf": "Eckregal",
    "n_i_cubeshelf": "Würfelregal",
    "n_i_deck": "Holzterrasse",
    "n_i_desklamp": "Schreibtischlampe",
    "n_i_dishwasher": "Geschirrspüler",
    "n_i_dogbed": "Hundebett",
    "n_i_driveway": "Einfahrt",
    "n_i_dryrack": "Wäscheständer",
    "n_i_elevator": "Aufzug",
    "n_i_fan": "Ventilator",
    "n_i_fence": "Zaun",
    "n_i_filing": "Aktenschrank",
    "n_i_floor": "Geschoss",
    "n_i_flowerbed": "Blumenbeet",
    "n_i_flowers": "Blumen",
    "n_i_frame": "Bilderrahmen",
    "n_i_fruitbowl": "Obstschale",
    "n_i_garagedoor": "Garagentor",
    "n_i_gardenbench": "Gartenbank",
    "n_i_grill": "Grill",
    "n_i_hamper": "Wäschekorb",
    "n_i_hanging": "Hängepflanze",
    "n_i_heater": "Heizlüfter",
    "n_i_hedge": "Hecke",
    "n_i_herbs": "Kräutertopf",
    "n_i_hood": "Dunstabzugshaube",
    "n_i_hottub": "Whirlpool",
    "n_i_ironing": "Bügelbrett",
    "n_i_island": "Kücheninsel",
    "n_i_kettle": "Wasserkocher",
    "n_i_lot": "Grundstück",
    "n_i_loveseat": "Zweisitzer",
    "n_i_medicine": "Spiegelschrank",
    "n_i_microwave": "Mikrowelle",
    "n_i_monitor": "Bildschirm",
    "n_i_ottoman": "Polsterhocker",
    "n_i_palm": "Palme",
    "n_i_pantry": "Vorratsschrank",
    "n_i_path": "Gartenweg",
    "n_i_patio": "Gartentisch",
    "n_i_pc": "PC-Gehäuse",
    "n_i_pendant": "Pendelleuchte",
    "n_i_pool": "Pool",
    "n_i_projector": "Beamer",
    "n_i_proscreen": "Leinwand",
    "n_i_recliner": "Fernsehsessel",
    "n_i_recordplayer": "Plattenspieler",
    "n_i_sectional": "Ecksofa",
    "n_i_shoerack": "Schuhregal",
    "n_i_reachin": "Einbauschrank",
    "n_i_closetrod": "Kleiderstange",
    "n_i_closetshelves": "Kleiderregal",
    "n_i_bifold": "Falttür",
    "n_i_sidetable": "Beistelltisch",
    "n_i_soundbar": "Soundbar",
    "n_i_speaker": "Lautsprecher",
    "n_i_spiral": "Wendeltreppe",
    "n_i_stool": "Barhocker",
    "n_i_succulent": "Sukkulente",
    "n_i_tablelamp": "Tischlampe",
    "n_i_toaster": "Toaster",
    "n_i_towelrail": "Handtuchhalter",
    "n_i_trash": "Mülleimer",
    "n_i_tvstand": "TV-Möbel",
    "n_i_utilitysink": "Ausgussbecken",
    "n_i_vanity": "Waschtisch",
    "n_i_vanitytable": "Schminktisch",
    "n_i_vase": "Vase",
    "wk_i_spiral": "steigt die Wendeltreppe hinauf",
    "wk_i_elevator": "fährt mit dem Aufzug",
    "wk_i_dishwasher": "räumt den Geschirrspüler ein",
    "wk_i_island": "schneidet Gemüse an der Kücheninsel",
    "wk_i_stool": "setzt sich auf einen Barhocker",
    "wk_i_trash": "bringt den Müll raus",
    "wk_i_pantry": "holt etwas aus dem Vorratsschrank",
    "wk_i_microwave": "wärmt Reste auf",
    "wk_i_coffeemaker": "kocht Kaffee",
    "wk_i_toaster": "macht Toast",
    "wk_i_kettle": "setzt Wasser auf",
    "wk_i_fruitbowl": "nimmt sich einen Apfel",
    "wk_i_vanity": "putzt sich die Zähne",
    "wk_i_hamper": "wirft Wäsche in den Wäschekorb",
    "wk_i_ironing": "bügelt ein Hemd",
    "wk_i_dryrack": "hängt die Wäsche auf",
    "wk_i_heater": "wärmt sich am Heizlüfter",
    "wk_i_utilitysink": "spült einen Eimer aus",
    "wk_i_bedking": "streckt sich auf dem großen Bett aus",
    "wk_i_bunkbed": "klettert ins obere Bett",
    "wk_i_vanitytable": "macht sich die Haare",
    "wk_i_bench": "setzt sich auf die Bank",
    "wk_i_chest": "öffnet die Truhe",
    "wk_i_sidetable": "stellt ein Glas ab",
    "wk_i_filing": "legt Papiere ab",
    "wk_i_loveseat": "kuschelt sich in den Zweisitzer",
    "wk_i_sectional": "macht es sich auf dem Ecksofa bequem",
    "wk_i_recliner": "lehnt sich im Fernsehsessel zurück",
    "wk_i_ottoman": "legt die Füße hoch",
    "wk_i_tvstand": "nimmt die Fernbedienung",
    "wk_i_aquarium": "füttert die Fische",
    "wk_i_beanbag": "lässt sich in den Sitzsack fallen",
    "wk_i_speaker": "dreht die Musik auf",
    "wk_i_tablelamp": "knipst die Tischlampe an",
    "wk_i_desklamp": "knipst die Schreibtischlampe an",
    "wk_i_vase": "ordnet die Blumen",
    "wk_i_candle": "zündet eine Kerze an",
    "wk_i_books": "nimmt ein Buch",
    "wk_i_frame": "betrachtet das Foto",
    "wk_i_basket": "schaut in den Korb",
    "wk_i_monitor": "schaut auf den Bildschirm",
    "wk_i_succulent": "staubt die Sukkulente ab",
    "wk_i_herbs": "pflückt etwas Basilikum",
    "wk_i_palm": "gießt die Palme",
    "wk_i_cactus": "bewundert den Kaktus",
    "wk_i_flowers": "riecht an den Blumen",
    "wk_i_arclamp": "knipst die Bogenlampe an",
    "wk_i_cubeshelf": "räumt das Regal auf",
    "wk_i_cornershelf": "stellt eine Pflanze ins Eckregal",
    "wk_i_shoerack": "zieht die Schuhe aus",
    "wk_i_reachin": "sucht Kleidung aus",
    "wk_i_closetrod": "nimmt ein Hemd von der Stange",
    "wk_i_closetshelves": "nimmt einen gefalteten Pullover",
    "wk_i_coatrack": "hängt den Mantel auf",
    "wk_i_hood": "schaltet die Dunstabzugshaube ein",
    "wk_i_towelrail": "nimmt ein Handtuch",
    "wk_i_medicine": "nimmt eine Vitamintablette",
    "wk_i_soundbar": "dreht den Ton lauter",
    "wk_i_console": "spielt ein Videospiel",
    "wk_i_pc": "schaltet den Computer ein",
    "wk_i_proscreen": "schaut einen Film auf der Leinwand",
    "wk_i_recordplayer": "legt eine Platte auf",
    "wk_i_fan": "schaltet den Ventilator ein",
    "wk_i_ac": "schaltet die Klimaanlage ein",
    "wk_i_grill": "wirft den Grill an",
    "wk_i_pool": "geht schwimmen",
    "wk_i_patio": "isst draußen zu Mittag",
    "wk_i_gardenbench": "sitzt im Garten",
    "wk_i_hottub": "entspannt im Whirlpool",
    "wk_i_dogbed": "streichelt den Hund",
    "wk_i_cattree": "spielt mit der Katze",
    "wk_i_hedge": "schneidet die Hecke",
    "wk_i_flowerbed": "jätet das Blumenbeet",
    "ic_rooms": "Räume, Türen & Treppen",
    "ic_living": "Wohnzimmer",
    "ic_bedroom": "Schlafzimmer & Büro",
    "ic_closets": "Schränke & Ankleide",
    "ic_kitchen": "Küche & Essen",
    "ic_bath": "Bad & Waschküche",
    "ic_decor": "Deko, Pflanzen & Licht",
    "ic_walls": "An der Wand & Stauraum",
    "ic_tech": "TV & Elektronik",
    "ic_outdoor": "Grundstück, Einfahrt & Garten",
    "fl_ground": "Erdgeschoss",
    "fl_up_name": "Obergeschoss",
    "fl_upper": "Obergeschoss {n}",
    "fl_lower": "Untergeschoss {n}",
    "wk_up": "{who} geht nach oben: {floor}.",
    "wk_down": "{who} geht nach unten: {floor}.",
    "wk_lift": "{who} fährt mit dem Aufzug: {floor}.",
    "wk_up_said": "Nach oben!",
    "wk_down_said": "Nach unten!",
    "v3_went_up": "Nach oben: {floor}",
    "v3_went_down": "Nach unten: {floor}",
    "v3_all_floors": "Alle Geschosse",
    "v3_up_to": "Bis: {floor}",
    "v3_floors_tip": "Alle Geschosse zeigen oder die oberen abheben",
    "fp_real": "Echte Größe",
    "fp_depth": "Tiefe",
    "fp_ceiling": "Decke",
    "lot_keep": "Abstände zu den Grenzen",
    "lot_front": "Vorne",
    "lot_side": "Seiten",
    "lot_back": "Hinten",
    "lot_says": "Grundstück {w} × {d} {unit} · {area}",
    "lot_build": "Baufläche: {w} × {d} {unit} · {area}",
    "lot_house": "Haus {area}",
    "lot_yard": "Garten {area}",
    "lot_front_is": "vorderen",
    "lot_side_is": "seitlichen",
    "lot_back_is": "hinteren",
    "ad_stairs_nowhere": "Führt noch nirgendwohin: {what}. Das Geschoss darüber daneben zeichnen.",
    "ad_fix_upstairs": "Nach oben führen lassen",
    "ad_group_house": "Das Haus besteht aus losen Räumen: in ein Geschoss setzen, um es am Stück über das Grundstück zu ziehen.",
    "ad_fix_group": "In ein Geschoss setzen",
    "ad_too_big": "Das Haus ({house}) ist größer als die Baufläche ({room}).",
    "ad_setback": "Das Haus ragt um {by} über den {side} Abstand.",
    "ad_fix_move_in": "Hinter die Linie schieben",
    "ad_no_driveway": "Nichts führt zum Garagentor: eine Einfahrt anlegen.",
    "ad_fix_driveway": "Einfahrt anlegen",
    "hm_floors": "Jedes Stockwerk in einem eigenen Geschoss nebeneinander zeichnen: Treppen an derselben Stelle führen hinauf und hinunter, auch in 3D",
    "hm_lot": "Ein Grundstück unter das Haus legen und im Bereich Größe und Abstände eingeben: es zeigt die Baufläche und den Garten",
    "v3_roof": "Dach",
    "v3_roof_tip": "Dach aufsetzen oder abheben, um hineinzusehen",
    "v3_day": "Tag",
    "v3_evening": "Abend",
    "v3_night": "Nacht",
    "v3_time_tip": "Tageszeit: Tag, Abend oder Nacht mit Licht an",
    "v3_save": "Bild speichern",
    "v3_save_tip": "Die Ansicht als Bild speichern",
    "v3_saved": "Bild gespeichert",
    "v3_save_failed": "Dieser Browser kann das Bild nicht speichern",
    "v3_labels": "Beschriftung",
    "v3_labels_tip": "Räume und ihren Inhalt benennen",
    "v3_2d": "2D",
    "v3_3d": "3D",
    "v3_2d_tip": "Flach, von oben, wie der Plan",
    "v3_3d_tip": "Wieder in 3D aufstellen",
    "v3_hint_flat": "Ziehen oder W A S D zum Verschieben · Mausrad zum Zoomen",
    "labels": "Beschriftung",
    "labels_tip": "Möbel und Räume auf einem Grundriss benennen",
    "rl_kitchen": "Küche",
    "rl_bath": "Bad",
    "rl_bed": "Schlafzimmer",
    "rl_laundry": "Waschküche",
    "rl_garage": "Garage",
    "rl_office": "Arbeitszimmer",
    "rl_dining": "Esszimmer",
    "rl_living": "Wohnzimmer",
    "rl_closet": "Ankleidezimmer",
    "rl_studio": "Wohn-Schlafraum",
    "rl_great": "Wohnküche",
    "rl_eatin": "Essküche",
    "rl_livdine": "Wohn- und Esszimmer",
    "ic_all_icons": "Alle Symbole",
    "ic_sets": "Symbolgruppen",
    "ic_find_n": "{n} Symbole durchsuchen",
    "ic_clear": "Suche leeren",
    "ic_count": "{n} Symbole",
    "ic_found": "{n} gefunden",
    "ic_hint": "Klicken zum Hinzufügen · aufs Blatt ziehen",
    "ic_hint_touch": "Tippen zum Hinzufügen · aufs Blatt ziehen",
    "ic_show_set": "Nur {set} zeigen",
    "ic_browse": "Alle Symbole durchsehen…",
    "ad_overlap": "{a} und {b} stehen an derselben Stelle: in 3D ginge eins durchs andere.",
    "ad_fix_apart": "Auseinanderrücken",
    "ad_in_wall": "{what} ragt in die Wand: {room}.",
    "ad_fix_in": "In den Raum rücken",
    "dz_making": "Was du machst",
    "dz_flowchart": "Flussdiagramm",
    "dz_flowchart_tip": "Ein Programm, Schritt für Schritt: ausführen und als Text oder Code schreiben",
    "dz_design": "Entwurf",
    "dz_design_tip": "Grundrisse, Menschen, Netzwerke, Schaltkreise und Weltraum, in 3D",
    "dz_ask": "Was möchtest du machen?",
    "dz_ask_sub": "Wähle eins für den Anfang. Oben im Bereich kannst du jederzeit wechseln, und jedes behält sein eigenes Blatt.",
    "dz_flow_says": "Die Schritte eines Programms. Ausführen, prüfen und als Text oder Code schreiben.",
    "dz_flow_eg": "Start · Prozess · Entscheidung · Schleife",
    "dz_design_says": "Grundrisse und Möbel, Menschen, Netzwerke, Schaltkreise und Weltraum. In 3D durchgehen.",
    "dz_design_eg": "Räume · Möbel · Menschen · Geräte",
    "dz_later": "Später entscheiden",
    "dz_add": "Zum Entwurf hinzufügen",
    "dz_by_set": "Symbole nach Gruppe",
    "dz_words": "Text",
    "dz_note": "Notiz",
    "dz_shapes": "Formen",
    "dz_name": "Name",
    "dz_size": "Größe",
    "dz_height": "Höhe",
    "dz_lift": "Über Boden",
    "dz_drop": "Unter Decke",
    "dz_standard": "Standardgröße",
    "dz_standard_tip": "Zurück zur üblichen Größe",
    "dz_fits_room": "Nicht größer als {room} innerhalb der Wände: {size}.",
    "dz_fits_on": "Nicht größer als das, worauf es steht: {what}.",
    "dz_under_ceiling": "Unter der Decke von {room}: {size}.",
    "dz_holds": "Groß genug für den Inhalt: mindestens {size}.",
    "dz_above": "Mindestens so hoch wie das Höchste darin ({what}): {size}.",
    "dz_bad_len": "Gib eine Länge ein, z. B. 1,25 m oder 120 cm.",
    "dz_turn_left": "Eine Vierteldrehung nach links",
    "dz_turn_right": "Eine Vierteldrehung nach rechts",
    "dz_dims_tip": "Klicken, um eine Größe einzugeben",
    "dz_tidied": "Aufgeräumt: {n} verschoben.",
    "hm_dims": "Ein Teil des Grundrisses anklicken, um seine Größe auf dem Blatt zu sehen; eine Größe anklicken, um eine andere einzugeben, z. B. 2 m",
    "dz_add_how": "Symbole suchen oder eine Gruppe wählen, dann eins anklicken oder aufs Blatt ziehen. Etwas anklicken, um seine Größe zu sehen und eine neue einzugeben.",
    "dz_ceil_least": "Eine Decke ist mindestens {size} hoch.",
    "mt_head": "Materialien",
    "mt_button": "Materialien",
    "mt_floor": "Boden",
    "mt_wall": "Innenwände",
    "mt_out": "Außenwände",
    "mt_roof": "Dach",
    "mt_house": "Ganzes Haus",
    "mt_room": "Dieser Raum",
    "mt_plain": "Standard",
    "mt_none": "Zuerst Räume zeichnen, dann ihre Materialien wählen.",
    "mt_boards": "Holzdielen",
    "mt_parquet": "Parkett",
    "mt_tiles": "Fliesen",
    "mt_marble": "Marmor",
    "mt_slate": "Schiefer",
    "mt_carpet": "Teppichboden",
    "mt_concrete": "Beton",
    "mt_paint": "Farbe",
    "mt_wallpaper": "Tapete",
    "mt_panels": "Holzpaneele",
    "mt_brick": "Ziegel",
    "mt_stone": "Naturstein",
    "mt_siding": "Stülpschalung",
    "mt_stucco": "Putz",
    "mt_batten": "Boden-Deckel-Schalung",
    "mt_shakes": "Zedernschindeln",
    "mtr_shingles": "Schindeln",
    "mtr_tiles": "Tonziegel",
    "mtr_metal": "Metall",
    "mtr_slate": "Schiefer",
    "mt_herringbone": "Fischgrät",
    "mt_hextiles": "Sechseckfliesen",
    "mt_checker": "Schachbrettfliesen",
    "mt_terrazzo": "Terrazzo",
    "mt_cork": "Kork",
    "mt_plaster": "Putz",
    "mt_shiplap": "Profilbretter quer",
    "mt_beadboard": "Profilholz",
    "mt_logs": "Blockbohlen",
    "mt_timber": "Fachwerk",
    "mt_cladding": "Fassadenplatten",
    "mt_corrugated": "Wellblech",
    "mtr_thatch": "Reet",
    "mtr_woodshakes": "Holzschindeln",
    "mtr_green": "Gründach",
    "mtr_solar": "Solarmodule",
    "mt_any": "Beliebige Farbe",
    "st_floors": "Geschosse",
    "st_basement": "Ein Keller",
    "st_roof_one": "Dach aus einem Stück",
    "st_lot": "Auf eigenem Grundstück",
    "st_stairs": "Treppe",
    "st_family": "Familienzimmer",
    "st_storage": "Abstellraum",
    "st_utility": "Hauswirtschaftsraum",
    "fl_basement": "Keller",
    "hs_button": "Einstellungen",
    "hs_tip": "Was die 3D-Ansicht zeigt: Straße, Grundstück, Dachrinnen, Licht, Wetter",
    "hs_house": "Das Haus",
    "hs_gutters": "Dachrinnen und Fallrohre",
    "hs_porch": "Licht an den Außentüren",
    "hs_outside": "Draußen",
    "hs_street": "Eine Straße davor",
    "st_site_head": "Wo es steht",
    "sf_head": "Welche Straßenseite",
    "sf_side_S": "Nordseite",
    "sf_side_N": "Südseite",
    "sf_side_E": "Westseite",
    "sf_side_W": "Ostseite",
    "sf_shape": "Die Straße",
    "sf_straight": "Gerade",
    "sf_curve": "In einer Kurve",
    "addr_head": "Adresse",
    "addr_number": "Hausnummer",
    "addr_street": "Straße",
    "addr_side": "Seitenstraße",
    "addr_corner": "Ecke",
    "addr_corner_none": "Kein Eckgrundstück",
    "addr_corner_left": "Seitenstraße links",
    "addr_corner_right": "Seitenstraße rechts",
    "addr_streets": "Ahornstraße|Eichenallee|Zedernweg|Ulmenstraße|Weidenweg|Birkenstraße|Kiefernstraße|Seeblickstraße|Kastanienhof|Hügelstraße",
    "hs_land": "Das Grundstück und seine Größe",
    "hs_trees": "Bäume ringsum",
    "hs_weather": "Wetter",
    "sm_head": "Gegen einen Sturm testen",
    "sm_none": "Kein Sturm",
    "sm_gale": "Starker Wind",
    "sm_severe": "Schweres Gewitter",
    "sm_cat1": "Hurrikan Kat. 1",
    "sm_cat3": "Hurrikan Kat. 3",
    "sm_cat5": "Hurrikan Kat. 5",
    "sm_ef0": "Tornado EF0",
    "sm_ef1": "Tornado EF1",
    "sm_ef2": "Tornado EF2",
    "sm_ef3": "Tornado EF3",
    "sm_ef4": "Tornado EF4",
    "sm_ef5": "Tornado EF5",
    "sm_k_windows": "Fenster",
    "sm_k_roof": "Dach",
    "sm_k_walls": "Wände",
    "sm_k_anchors": "Verankerung",
    "sm_k_sway": "Schwanken",
    "sm_k_feel": "Innen spürbar",
    "sm_k_people": "Menschen",
    "sm_win_ok": "schlagfest: Trümmer bleiben draußen",
    "sm_win_bad": "Trümmer zerschlagen sie, und der Wind drückt von innen gegen das Dach",
    "sm_holds": "hält {have} gegen {need}",
    "sm_gives": "gibt nach: {need} gegen {have}",
    "sm_at_ok": "bis etwa {speed}",
    "sm_at_bad": "ab etwa {speed}",
    "sm_sway": "die Spitze bewegt sich {move} (erlaubt sind {limit})",
    "sm_feel_none": "nicht spürbar ({mg} Milli-g)",
    "sm_feel_some": "kaum spürbar ({mg} Milli-g)",
    "sm_feel_bad": "man spürt es, manchen wird übel ({mg} Milli-g)",
    "sm_safe_ok": "der Schutzraum hält alle sicher",
    "sm_safe_bad": "kein Haus bleibt dabei ganz: man braucht einen Schutzraum",
    "sm_add": "{what} einbauen",
    "sm_all_ok": "Es übersteht diesen Sturm.",
    "sm_not_ok": "Es würde diesen Sturm nicht unbeschadet überstehen.",
    "sm_again": "Noch einmal",
    "bp_watch": "Aufbau ansehen",
    "bp_watch_tip": "Noch einmal zusehen, wie es vom Boden aus entsteht",
    "cn_skip": "Wird gebaut · schau dich ruhig um · Enter oder Überspringen beendet es",
    "mo_skip": "Überspringen", "mo_skip_tip": "Jetzt fertig bauen (Enter)",
    "jb_slower": "Langsamer ( [ )", "jb_faster": "Schneller ( ] )", "jb_speed_tip": "Wie schnell gebaut wird",
    "jb_arrive": "Der Bautrupp kommt", "jb_stakes": "Die Ecken werden abgesteckt", "jb_dig": "Der Keller wird ausgehoben",
    "jb_trench": "Die Fundamentgräben werden ausgehoben", "jb_forms": "Die Schalung der Bodenplatte wird gestellt", "jb_forms_wall": "Die Fundamentschalung wird gestellt",
    "jb_rebar": "Die Bewehrung wird verlegt", "jb_pour": "Der Beton wird gegossen", "jb_strike": "Die Schalung wird abgebaut",
    "jb_lumber": "Das Holz wird geliefert", "jb_deck": "Balken und Unterboden werden verlegt", "jb_frame": "Die Wände werden gezimmert",
    "jb_stairs": "Die Treppe wird gebaut", "jb_trusses": "Die Dachbinder werden eingehoben", "jb_roofboards": "Das Dach wird beplankt",
    "jb_roofing": "Das Dach wird gedeckt", "jb_scaffold": "Das Gerüst wird aufgestellt", "jb_sheath": "Die Wände werden beplankt",
    "jb_windows": "Die Fenster werden eingesetzt", "jb_doors": "Die Türen werden eingehängt", "jb_siding": "Die Fassade wird verkleidet",
    "jb_scaffold_down": "Das Gerüst wird abgebaut", "jb_mep": "Leitungen und Rohre werden verlegt", "jb_drywall": "Trockenbau",
    "jb_deliver": "Lieferung der Schränke: der Stapler lädt die Paletten ab",
    "jb_ceilings": "Die Decken werden fertiggestellt", "jb_floors": "Die Böden werden verlegt", "jb_fittings": "Küche und Bäder werden eingebaut",
    "jb_fixtures": "Leuchten und Schalter werden montiert", "jb_movein": "Einzug", "jb_family": "Endlich zu Hause",
    "jb_clean": "Die Baustelle wird geräumt", "jb_steel": "Das Stahlgerüst wird aufgestellt", "jb_deckpour": "Die Decken werden betoniert",
    "jb_cladding": "Die Außenhülle wird montiert", "jb_core": "Der Kern wird gebaut",
    "jb_pooldig": "Der Pool wird ausgehoben", "jb_poolshell": "Der Pool wird gebaut", "jb_poolfill": "Der Pool wird gefüllt",
    "jb_yardbuild": "Der Garten entsteht: Terrassen, Pool und Gartenmöbel",
    "sr_same": "Alle Räume dieser Art ({n})",
    "sr_same_tip": "Eine Änderung an Boden, Wänden oder Decke gilt für jeden Raum dieser Art",
    "mp_fix": "Richtigstellen",
    "mp_no_heater": "Es gibt Warmwasser zu liefern, aber keinen Warmwasserbereiter: Einer muss hinein",
    "hn_holding": "Den Stecker von {what} in der Hand: E an einer Steckdose steckt ihn ein",
    "hn_dropped": "Den Stecker von {what} abgelegt",
    "hn_dead": "{what}: kein Strom, die Sicherung ist herausgesprungen",
    "hn_reset": "Sicherung wieder eingeschaltet: der Strom ist zurück",
    "hn_on": "{what} an: {w} W",
    "hn_off": "{what} aus",
    "hn_trip": "Die Sicherung ist herausgesprungen: {w} W an einem {a}-A-Stromkreis. Am Sicherungskasten wieder einschalten",
    "gp_in": "Im Wasser: W A S D zum Schwimmen, E am Rand zum Herausklettern",
    "gp_out": "Aus dem Becken",
    "gp_gate_shut": "Das Pooltor ist zugefallen und eingerastet",
    "gp_jets_on": "Düsen an: das Wasser sprudelt",
    "gp_jets_off": "Düsen aus",
    "o3_open_gate": "Das Tor öffnen",
    "o3_close_gate": "Das Tor schließen",
    "dm_bar": "Der Sturm",
    "dm_pause": "Sturm anhalten",
    "dm_play": "Sturm weiterlaufen lassen",
    "dm_rate": "Tempo",
    "dm_rate_now": "Tempo: {rate}",
    "dm_follow": "Folgen",
    "dm_follow_tip": "Die Kamera bei dem halten, was der Sturm davonträgt",
    "dm_again": "Den Sturm noch einmal",
    "dm_path": "Sein Weg",
    "dm_path_over": "Genau darüber",
    "dm_path_edge": "Sein stärkster Rand",
    "dm_path_near": "Knapp vorbei",
    "dm_head": "Nach dem Sturm",
    "dm_wait": "Beginnt…",
    "dm_close": "Schließen",
    "dm_none": "Nichts verloren: Das Haus hat es überstanden",
    "dm_total": "Etwa {cost} für die Instandsetzung",
    "dm_total_so_far": "Bisher etwa {cost} für die Instandsetzung",
    "dm_note": "Grob, nach US-Durchschnittswerten für 2025: Dachdeckung etwa 6,50 $ pro Quadratfuß, eine Außenwand etwa 22 $, ein Fenster etwa 1.000 $, Neubau 162 $ pro Quadratfuß (NAHB), ein umgestürzter Baum etwa 1.000 $, ein Zoll Wasser im Haus etwa 25.000 $ (FEMA), ein Blitzschaden etwa 18.600 $ (Triple-I).",
    "dm_neighbors": "{n} Häuser der Nachbarn zerstört",
    "dm_land": "{n} Bäume ringsum umgestürzt",
    "dm_safe": "Alle im Schutzraum haben es überstanden",
    "dm_loss": "Das Haus verloren: neu gebaut, samt Inhalt",
    "dm_slid": "Vom Fundament geschoben: angehoben und zurückgesetzt",
    "dm_roof": "Dach abgerissen",
    "dm_cover": "Dachdeckung vom Hagel zerschlagen",
    "dm_walls": "Außenwände eingestürzt",
    "dm_windows": "Fenster zerbrochen",
    "dm_skin": "Fassade abgerissen",
    "dm_chimney": "Schornstein eingestürzt",
    "dm_things": "Möbel und Hausrat",
    "dm_fixtures": "Einbauten herausgerissen",
    "dm_flood": "Wasser im Haus",
    "dm_solar": "Solarmodule",
    "dm_trees": "Bäume im Garten umgestürzt",
    "dm_cars": "Autos mit Totalschaden",
    "dm_sheds": "Schuppen und Spielgeräte",
    "dm_yard": "Dinge im Garten",
    "mp_no_furnace": "Heizungsauslässe ohne etwas, das Luft hindurchbläst: Eine Heizung muss hinein",
    "mp_heater_room": "Ein Gas-Warmwasserbereiter in {room}: In Schlaf- oder Badezimmern ist nur ein raumluftunabhängiges Gerät erlaubt",
    "mp_furnace_room": "Eine Gasheizung in {room}: In Schlaf- oder Badezimmern ist nur ein raumluftunabhängiges Gerät erlaubt",
    "mp_heater_garage": "Ein Gasgerät in der Garage: seine Flamme 46 cm über dem Boden, auf einem Sockel, mit Anfahrschutz davor",
    "mp_hot_far": "{what} ist {len} Rohr vom Warmwasserbereiter entfernt, mehr als die erlaubten {most}: Eine Zirkulationsleitung muss hinein",
    "mp_co": "Hier wird Brennstoff verbrannt (oder eine Garage ist angebaut): Ein CO-Melder gehört vor die Schlafzimmer, in {room}",
    "mp_co_name": "Rauch- und CO-Melder",
    "mp_dryer_long": "Die Abluftleitung des Trockners wäre {len} lang, mehr als die erlaubten {most}: Ein Zusatzlüfter muss hinein, oder der Trockner näher an eine Außenwand",
    "mp_hood": "Ein Herd in {room} ohne Dunstabzug darüber",
    "mp_gfci": "{n} Steckdosen nahe Wasser brauchen einen FI-Schutz",
    "mp_panel_room": "Der Sicherungskasten darf nicht in einem Bad oder einem Schrank sein",
    "mp_need_wc": "Für etwa {people} Personen verlangt die Vorschrift {need} Toiletten; es gibt {have}",
    "mp_need_lav": "Für etwa {people} Personen verlangt die Vorschrift {need} Waschbecken in den Toiletten; es gibt {have}",
    "mp_need_df": "Für etwa {people} Personen verlangt die Vorschrift {need} Trinkbrunnen; es gibt {have}",
    "mp_need_ss": "Ein Gebäude wie dieses braucht ein Ausgussbecken",
    "mp_fuel_head": "Heizen und Kochen",
    "mp_fuel_gas": "Gas und Strom",
    "mp_fuel_electric": "Nur Strom",
    "mp_gas_label": "{size} Gas · {kbtu} kBtu/h",
    "mp_flue": "Abgasrohr",
    "mp_direct": "Raumluftunabhängig, durch die Wand",
    "mp_tpr": "Sicherheitsventil",
    "mp_expansion": "Ausdehnungsgefäß",
    "mp_recirc": "Zirkulationspumpe",
    "mp_bollard": "Anfahrschutz",
    "mp_backflow": "Rückflussverhinderer",
    "mp_grease": "Fettabscheider",
    "mp_booster": "Druckerhöhungsanlage",
    "mp_prv": "Druckminderer",
    "mp_dryer_duct": "Trockner-Abluft, nach draußen",
    "mp_dryer_fan": "Trockner-Abluft, mit Zusatzlüfter",
    "mp_cold_only": "Nur kalt: Kein Warmwasserbereiter versorgt es",
    "mp_hot_wait": "Warmwasser vom Bereiter in {room}: {len} Rohr, etwa {s} s bis es kommt",
    "mp_hot_now": "Sofort warm: Die Zirkulation hält das Rohr warm ({len} vom Bereiter in {room})",
    "mp_gas_on": "{what}: Gas vom Zähler, eine {size}-Leitung, {kbtu} kBtu/h",
    "mp_elec_on": "{what}: elektrisch, an einem eigenen {amps}-A-Stromkreis",
    "mp_no_gas": "{what} brennt Gas, aber keine Gasleitung führt hin",
    "mp_run_hot": "Das Warmwasser erreicht {what} in etwa {s} s ({len} Rohr)",
    "n_i_fountain": "Trinkbrunnen",
    "wk_i_fountain": "trinkt einen Schluck",
    "ly_button": "Ebenen",
    "ly_tip": "Welche Ebenen gewählt werden können: eine schließen, und nur die übrigen werden angeklickt, umrahmt oder ausgewählt",
    "ly_head": "Wählbare Ebenen",
    "ly_all": "Alle",
    "ly_only_short": "Nur",
    "ly_only_tip": "Nur {layer} wählen",
    "ly_only": "Nur diese Ebene wählen",
    "ly_pick_all": "Alles darauf auswählen",
    "ly_lock": "Diese Ebene schließen",
    "ly_move": "Auf Ebene verschieben",
    "ly_own": "Zurück auf die eigene Ebene",
    "ly_layer": "Ebene",
    "ly_note": "Geschlossene Ebenen sind abgeblendet: Ein Klick geht durch sie hindurch auf das Darunterliegende.",
    "ly_shut": "{layer} ist geschlossen (Ebenen, neben Auswählen)",
    "ly_rooms": "Räume und Geschosse",
    "ly_walls": "Wände, Türen und Treppen",
    "ly_furniture": "Möbel",
    "ly_lights": "Licht und Strom",
    "ly_water": "Sanitär und Einbauten",
    "ly_outside": "Außen und Grundstück",
    "ly_people": "Personen",
    "sm_seen": "Im Sturm: {what}",
    "sm_ev_none": "bisher nichts kaputt",
    "sm_ev_windows": "Fenster zerbrochen",
    "sm_ev_roof": "Dach abgerissen",
    "sm_ev_walls": "Wände umgeweht",
    "sm_ev_slid": "vom Fundament geschoben",
    "sm_ev_flew": "das ganze Haus fortgerissen",
    "sm_ev_yard": "Dinge im Garten weggeweht",
    "sm_ev_safe": "der Schutzraum steht noch",
    "sm_quake1": "Mittleres Erdbeben",
    "sm_quake2": "Starkes Erdbeben",
    "sm_quake3": "Schweres Erdbeben",
    "sm_flood1": "Hochwasser",
    "sm_flood2": "Tiefes Hochwasser",
    "sm_flood3": "Sturmflut",
    "sm_snow1": "Starker Schneefall",
    "sm_snow2": "Sehr starker Schneefall",
    "sm_snow3": "Rekordschnee",
    "sm_hail1": "Hagel",
    "sm_hail2": "Großer Hagel",
    "sm_hail3": "Riesenhagel",
    "sm_g_wind": "Wind",
    "sm_g_quake": "Erdbeben",
    "sm_g_flood": "Hochwasser",
    "sm_g_snow": "Schnee",
    "sm_g_hail": "Hagel",
    "sm_k_chimney": "Schornstein",
    "sm_k_contents": "Innen",
    "sm_k_cover": "Dachdeckung",
    "sm_k_solar": "Solarmodule",
    "sm_chim_ok": "ein gemauerter Schornstein hält das aus",
    "sm_chim_bad": "ein gemauerter Schornstein stürzt bei so starkem Beben ein",
    "sm_shelf_ok": "die Möbel bleiben stehen",
    "sm_shelf_bad": "hohe Möbel kippen um: an der Wand befestigen",
    "sm_wet_ok": "das Wasser bleibt unter dem Fußboden",
    "sm_wet_bad": "Wasser {deep} hoch über dem Fußboden",
    "sm_hail_win": "so große Körner zerschlagen Glas",
    "sm_cover_ok": "die Dachdeckung hält diese Körner aus",
    "sm_cover_bad": "die Dachdeckung wird zerschlagen",
    "sm_pv_ok": "die Solarmodule halten diese Körner aus",
    "sm_pv_bad": "die Solarmodule zerspringen",
    "sm_h_raised": "Auf Pfählen erhöht",
    "sm_h_rafters": "Stärkere Sparren",
    "sm_h_roofing": "Hagelfeste Dachdeckung",
    "sm_ev_sway": "Spitze schwankt {move} ({times}-fach vergrößert gezeichnet)",
    "sm_ev_cave": "Dach eingebrochen",
    "sm_ev_float": "das ganze Haus fortgeschwemmt",
    "sm_ev_chimney": "Schornstein eingestürzt",
    "sm_ev_shelves": "Möbel umgekippt",
    "sm_ev_wet": "Wasser im Haus",
    "sm_ev_cover": "Dachdeckung zerschlagen",
    "sm_ev_solar": "Solarmodule gesprungen",
    "sm_ev_trees": "Bäume entwurzelt",
    "sm_ev_bare": "nur die nackte Bodenplatte bleibt",
    "sm_ev_skin": "Fassade vom Hochhaus gerissen",
    "sm_ev_surge": "Sturmflut über dem Land",
    "sm_ev_flooded": "Straßen und Gärten überflutet",
    "sm_hold_head": "Was es zusammenhält",
    "sm_h_ties": "Sturmanker",
    "sm_h_straps": "Zuganker vom Dach bis zum Fundament",
    "sm_h_shear": "Aussteifende Wände",
    "sm_h_anchors": "Ankerbolzen und Zuganker",
    "sm_h_impact": "Schlagfeste Fenster oder Läden",
    "sm_h_saferoom": "Tornado-Schutzraum",
    "sm_h_brace": "Kreuzverbände",
    "sm_h_outrigger": "Outrigger-Fachwerke",
    "sm_h_damper": "Schwingungstilger",
    "sm_g_fire": "Flächenbrand",
    "sm_fire1": "Grasbrand",
    "sm_fire2": "Buschbrand",
    "sm_fire3": "Waldkronenfeuer",
    "sm_wf_flames": "Flammen {len}",
    "sm_k_embers": "Glutflug",
    "sm_k_zone0": "Die ersten anderthalb Meter",
    "sm_k_fireroof": "Dach",
    "sm_k_heat": "Hitze an den Wänden",
    "sm_k_glass": "Fenster",
    "sm_k_leave": "Menschen",
    "sm_wf_few": "ein Grasbrand wirft wenig Glut, und sie erlischt schnell",
    "sm_wf_vents_ok": "die Lüftungen sind vergittert: die Glut bleibt aus dem Dachboden",
    "sm_wf_vents_bad": "Glut weht durch die Lüftungen und entzündet den Dachboden von innen",
    "sm_wf_zone_ok": "nichts Brennbares in anderthalb Metern um die Wände",
    "sm_wf_zone_bad": "Brennbares steht in anderthalb Metern um die Wände ({n}): die Glut entzündet es, seine Flammen erreichen das Haus",
    "sm_wf_roof_ok": "das Dach ist Klasse A: Glut entzündet es nicht",
    "sm_wf_roof_bad": "Holzschindeln oder Reet: Glut setzt sich darauf und es fängt Feuer",
    "sm_wf_heat_ok": "{q} an den Wänden bei {d} Abstand zum Brennstoff: weniger als nötig, um sie zu entzünden",
    "sm_wf_heat_bad": "{q} an den Wänden bei {d} Abstand zum Brennstoff: genug, um sie zu entzünden",
    "sm_wf_glass_ok": "das Glas hält der Hitze stand",
    "sm_wf_glass_bad": "die Hitze sprengt das Glas und das Feuer dringt ein",
    "sm_wf_leave": "früh gehen: kein Haus ist ein Ort, um einen Flächenbrand auszusitzen",
    "sm_h_vents": "Glutsichere Lüftungen",
    "sm_h_zone0": "Anderthalb Meter frei gehalten",
    "sm_h_space": "Schutzzone, 30 m",
    "sm_h_siding": "Feuerfeste Fassade",
    "sm_h_classa": "Dach der Klasse A",
    "sm_k_lightning": "Blitz",
    "sm_lt_ok": "die Fangstangen nehmen jeden Einschlag auf und leiten ihn in die Erde",
    "sm_lt_risk": "ein Einschlag träfe den First und könnte ein Feuer entfachen: ein Blitzableiter leitet ihn in die Erde",
    "sm_h_rod": "Blitzableiter",
    "sm_g_drill": "Feuer im Haus",
    "sm_drill1": "Feuer am Tag",
    "sm_drill2": "Feuer in der Nacht",
    "ev_day": "alle wach",
    "ev_night": "alle schlafen",
    "sm_k_alarms": "Rauchmelder",
    "sm_k_wired": "Vernetzt",
    "sm_k_egress": "Rettungsfenster",
    "sm_k_sprinklers": "Sprinkler",
    "sm_k_out": "Hinauskommen",
    "sm_k_plan": "Ein Plan",
    "sm_dr_alarms_ok": "einer in jedem Schlafzimmer, davor und auf jedem Stockwerk",
    "sm_dr_alarms_bad": "{n} Räume, in die laut Vorschrift ein Rauchmelder gehört, haben keinen",
    "sm_dr_wired_ok": "geht einer los, gehen alle los",
    "sm_dr_wired_bad": "jeder piept für sich: hinter einer geschlossenen Tür hört man ihn vielleicht nicht",
    "sm_dr_egress_ok": "jedes Schlafzimmer hat ein Fenster zum Hinauskommen",
    "sm_dr_egress_bad": "{n} Schlafzimmer haben kein Fenster zum Hinauskommen",
    "sm_dr_spr_ok": "ein Sprinkler über dem Feuer hält es, wo es anfängt",
    "sm_dr_spr_none": "keine: das Feuer wächst, bis es den Raum füllt",
    "sm_dr_nobody": "niemand muss hinaus",
    "sm_dr_out_ok": "alle draußen nach {t}, der erste Alarm nach {first}",
    "sm_dr_out_bad": "{n} von {of} kämen nicht hinaus",
    "sm_dr_plan": "zwei Wege aus jedem Raum kennen und einen Treffpunkt draußen",
    "sm_k_exits": "Ausgänge",
    "sm_dr_bldg_alarm": "ein Feueralarm im ganzen Gebäude, ausgelöst vom ersten Melder oder vom Wasserfluss zu einem Sprinkler",
    "sm_dr_bldg_detect": "ein Feueralarm im ganzen Gebäude, ausgelöst vom ersten Melder",
    "sm_dr_exits_ok": "{n} Ausgänge aus dem Gebäude",
    "sm_dr_exits_one": "ein Ausgang: genug für bis zu 49 Menschen (hier etwa {p})",
    "sm_dr_exits_bad": "ein Ausgang für etwa {p} Menschen: ab 49 braucht es einen zweiten",
    "sm_h_interconnect": "Vernetzte Rauchmelder",
    "sm_h_sprinklers": "Sprinkler im Haus",
    "sm_h_closedoors": "Bei geschlossener Tür schlafen",
    "sm_h_ev_alarms": "die Rauchmelder",
    "sm_h_ev_windows": "Rettungsfenster",
    "ev_said_alarm": "der erste Alarm nach {t}",
    "ev_said_sprink": "ein Sprinkler öffnete nach {t}",
    "ev_said_out": "{n} von {of} draußen",
    "ev_said_stuck": "{n} eingeschlossen",
    "ev_seen": "Bei der Übung: {what}",
    "ev_said_none": "das Feuer hat begonnen",
    "ev_how_walked": "durch die Tür hinaus",
    "ev_how_crawled": "unter dem Rauch hinausgekrochen",
    "ev_how_window": "durchs Fenster hinaus",
    "ev_how_trapped": "vom Rauch eingeschlossen",
    "ev_how_asleep": "nie aufgewacht: kein Alarm zu hören",
    "ev_how_noway": "kein Weg hinaus",
    "sm_h_ladders": "Rettungsleitern oben",
    "ev_how_window_wait": "oben am Fenster, wartet auf Rettung",
    "ev_how_ladder": "über eine Rettungsleiter hinunter",
    "ev_first": "Der erste Alarm nach {t}, {wired}",
    "ev_wired": "alle zugleich",
    "ev_alone": "jeder für sich",
    "ev_no_alarm": "Kein Rauchmelder ging los",
    "ev_total_ok": "Alle draußen nach {t}",
    "ev_total_bad": "{n} eingeschlossen",
    "ev_note": "Laut Forschung: Nach dem Alarm bleiben oft nur zwei Minuten zum Hinauskommen (NFPA); ein heute eingerichteter Raum kann in unter fünf Minuten durchzünden (UL); Rauch weckt keinen Schlafenden, der Melder schon; eine geschlossene Tür hält den Rauch viele Minuten zurück.",
    "ev_all_ok": "Alle kommen hinaus.",
    "ev_not_ok": "Nicht alle kämen hinaus.",
    "dm_head_drill": "Nach der Übung",
    "sm_ev_struck": "der Blitz schlug ins Dach ein",
    "sm_ev_rod": "der Blitz schlug in den Blitzableiter, ohne Schaden",
    "dm_struck": "Blitzeinschläge ins Dach",
    "wf_ev_came": "das Feuer kam bis auf {d} heran",
    "wf_ev_near": "was an den Wänden stand, fing Feuer",
    "wf_ev_caught": "das Haus fing Feuer",
    "wf_ev_by_embers": "Glut entzündete den Dachboden",
    "wf_ev_by_zone0": "die Flammen an den Wänden entzündeten das Haus",
    "wf_ev_by_fireroof": "das Dach fing Feuer",
    "wf_ev_by_heat": "die Hitze entzündete die Wände",
    "wf_ev_by_glass": "das Feuer drang durch die Fenster ein",
    "wf_ev_burnt": "das Haus brannte nieder",
    "wf_ev_held": "das Haus hat es überstanden",
    "wf_seen": "Im Feuer: {what}",
    "wf_all_ok": "Es übersteht dieses Feuer.",
    "wf_not_ok": "Es würde in diesem Feuer abbrennen.",
    "dm_head_fire": "Nach dem Feuer",
    "dm_burnt": "Das Haus brannte nieder: neu gebaut, samt Inhalt",
    "dm_wf_near": "Pflanzen, Zäune und Terrassen an den Wänden",
    "dm_wf_land": "Das Feuer lief {d} über das Land, bis die freie Fläche es aufhielt",
    "hs_tab_house": "Haus",
    "hs_tab_land": "Land",
    "hs_tab_street": "Straße",
    "hs_tab_weather": "Wetter",
    "hs_bound": "Auf dem Grundstück bleiben",
    "hs_hood": "Nachbarn",
    "hs_folk": "Leute und Autos",
    "hs_needs_street": "Zuerst die Straße einschalten",
    "ws_head": "Landschaft",
    "ws_plains": "Ebene",
    "ws_hills": "Hügel",
    "ws_mountains": "Berge",
    "ws_forest": "Wald",
    "ws_lake": "Am See",
    "ws_beach": "Strand",
    "ws_desert": "Wüste",
    "ws_tropics": "Tropen",
    "ws_arctic": "Schneefeld",
    "ws_city": "Stadt",
    "ws_debug": "Testraster",
    "wl_head": "Straßenlaternen",
    "wl_classic": "Klassisch",
    "wl_lantern": "Laterne",
    "wl_cobra": "Mastleuchte",
    "wl_twin": "Doppelarm",
    "wl_modern": "Modern",
    "wl_globe": "Kugel",
    "wl_none": "Keine",
    "wd_edge": "Hier endet dein Grundstück",
    "tr_head": "Gelände",
    "tr_auto": "Natürlich",
    "tr_flat": "Flach",
    "tr_gentle": "Sanft",
    "tr_rolling": "Wellig",
    "tr_steep": "Steil",
    "tf_head": "Fundament",
    "tf_auto": "Passend",
    "tf_wall": "Betonsockel",
    "tf_posts": "Auf Pfählen",
    "tr_new": "Neues Gelände",
    "tr_new_off": "Wähle zuerst ein anderes Gelände als Flach",
    "tr_says_wall": "Unter dem Haus fällt das Gelände um {n}; der Betonsockel gleicht es aus",
    "tr_says_posts": "Unter dem Haus fällt das Gelände um {n}; es steht auf Pfählen, mit Stufen von den Türen hinab",
    "hs_lot_trees": "Bäume im Garten",
    "hs_needs_trees": "Schalte zuerst die Bäume ringsum ein",
    "tr_back": "Zurück zum Plan",
    "tr_back_tip": "Zurück zum Grundriss (Esc)",
    "tr_me": "Mich sehen",
    "tr_me_off": "Meine Augen",
    "tr_me_tip": "Dich von hinten sehen oder mit eigenen Augen schauen (V)",
    "tool_view": "Ansicht ziehen",
    "tool_view_tip": "Jedes Ziehen bewegt nur die Ansicht; ein Tippen wählt trotzdem eine Form. Umschalt kurz drücken zum Wechseln",
    "dv_on": "Ansicht ziehen: Ziehen bewegt nur die Ansicht",
    "dv_off": "Ziehen bewegt wieder Dinge",
    "dv_tip3d": "An: Ziehen dreht und verschiebt nur die Ansicht. Aus: ein Möbelstück ziehen, um es zu verschieben. Umschalt kurz drücken zum Wechseln",
    "dv_moved": "{what} verschoben",
    "pl_move_room": "Raum verschieben",
    "pl_move_room_tip": "Ziehen, um den Raum mit allem darin zu verschieben",
    "tx_head": "Aussehen",
    "tx_on": "Texturen",
    "tx_tip": "Muster mit ihren Rillen und Fugen, dazu der Glanz von Metall und Glas. Aus: schlichte Farben.",
    "units": "Maße in",
    "units_ft": "Fuß und Zoll",
    "units_m": "Metern",
    "pw_head": "Stromleitungen",
    "pw_front": "Masten vorn",
    "pw_back": "Masten hinten",
    "pw_under": "Unterirdisch",
    "pw_none": "Keine",
    "hs_vents": "Trocknerabluft",
    "hs_dock": "Steg und Boot",
    "hs_dock_off": "Nur an einem See oder am Meer",
    "mx_head": "Dazumischen",
    "mx_one_water": "Nur eine Art Wasser zugleich",
    "hs_solar": "Solarmodule",
    "v3_hint_touch": "Ziehen zum Drehen · zwei Finger zum Verschieben, Spreizen zum Zoomen",
    "v3_hint_flat_touch": "Ziehen zum Verschieben · Spreizen zum Zoomen",
    "v3_hint_walk_touch": "Pfeile zum Gehen · ziehen zum Umsehen · tippen, um zu benutzen, was vor dir ist",
    "hd_title": "Hier steht schon ein Haus",
    "hd_sub": "Das neue an seiner Stelle bauen oder nebenan an derselben Straße?",
    "hd_add": "Nebenan",
    "hd_add_sub": "Haus {n} an der Straße",
    "hd_replace": "Ersetzen",
    "hd_replace_sub": "Das jetzige Haus verschwindet (Rückgängig holt es zurück)",
    "hd_added": "Haus {n} nebenan gebaut",
    "hd_gap_head": "Nebenan",
    "hd_gap": "Abstand zwischen Häusern",
    "hd_gap_tip": "Zwischen den Grundstücken, deinen und denen der Nachbarn",
    "ed_separate": "Vom Haus trennen",
    "ed_separate_n": "Vom Haus trennen",
    "ed_separated": "Getrennt: Es steht jetzt für sich",
    "ed_separated_n": "{n} Räume vom Haus getrennt",
    "ed_join": "Ans Haus anschließen",
    "ed_joined": "An {room} angeschlossen",
    "ed_change": "Dieses Haus ändern…",
    "ed_change_title": "Dieses Haus ändern",
    "ed_rebuild": "Neu bauen",
    "ed_rebuilt": "Haus an seiner Stelle neu gebaut",
    "f3_on": "3D-Möbel",
    "f3_tip": "Der Grundriss wie gezeichnet, die Möbel in 3D, beleuchtet und schattiert",
    "st_kitchens": "Küchen",
    "st_livings": "Wohnzimmer",
    "st_offices": "Arbeitszimmer",
    "st_laundries": "Waschküchen",
    "st_room_n": "{room} {n}",
    "st_typed": "Eine Zahl von {from} bis {to} eingeben oder die Tasten nutzen",
    "st_open": "Bauen beginnen",
    "st_open_tip": "Ein eingerichtetes Haus, Wohnungen, Eigentumswohnungen oder einen Laden aus wenigen Angaben anlegen",
    "ty_condos": "Eigentumswohnungen",
    "ty_condos_side": "Wohnungen je Seite",
    "ty_condo_n": "Einheit {n}",
    "tr_gym": "Fitnessraum",
    "yd_head": "Garten",
    "yd_deck": "Terrasse",
    "yd_porch": "Vordach",
    "yd_pool": "Pool",
    "yd_hottub": "Whirlpool",
    "yd_grill": "Grill",
    "yd_firepit": "Feuerstelle",
    "yd_trampoline": "Trampolin",
    "yd_swing": "Schaukel",
    "yd_gazebo": "Pavillon",
    "yd_court": "Basketballplatz",
    "yd_pavilion": "Pavillon",
    "yd_fence": "Gartenzaun",
    "yd_shed": "Gartenhaus",
    "yd_garden": "Gemüsebeet",
    "yd_no_room": "Im Garten ist kein Platz dafür",
    "wk_plan": "Räume werden angelegt",
    "wk_furnish": "Räume werden eingerichtet",
    "wk_extras": "Noch ein paar Dinge",
    "wk_windows": "Fenster und Türen",
    "wk_decor": "Letzter Schliff",
    "wk_wire": "Leitungen",
    "wk_arrange": "Möbel werden gestellt",
    "wk_yard": "Der Garten",
    "wk_draw": "Wird gezeichnet",
    "wk_land": "Gelände und Straße",
    "wk_house": "Wände werden gestellt",
    "wk_models": "Möbel werden gebaut",
    "wk_scene": "Licht",
    "wk_stop": "Stopp",
    "wk_stopped": "Gestoppt: wie vorher",
    "wb_out": "In neuem Tab öffnen",
    "wb_big": "Größer",
    "wb_small": "Kleiner",
    "wb_loading": "Wird geladen …",
    "wb_slow": "Lädt noch. Diese Seite lässt sich vielleicht nicht in einer anderen Seite zeigen; öffne sie in einem neuen Tab.",
    "wb_note": "Manche Websites lassen sich nicht in einer anderen Seite zeigen. Öffne sie in einem neuen Tab.",
    "wb_opened": "{url} geöffnet",
    "wb_bad": "Das ist keine Webadresse: {what}",
    "dg_head": "Design",
    "dg_count": "{n} Designs",
    "dg_colorway": "Farben",
    "dg_find": "{n} Dinge und {d} Designs durchsuchen",
    "dg_classic": "Klassisch",
    "dg_modern": "Modern",
    "dg_midcentury": "Mid-Century",
    "dg_scandi": "Skandinavisch",
    "dg_industrial": "Industrie",
    "dg_farmhouse": "Landhaus",
    "dg_glam": "Glamour",
    "dg_coastal": "Küste",
    "dg_rustic": "Rustikal",
    "dg_japandi": "Japandi",
    "dg_artdeco": "Art déco",
    "dg_boho": "Boho",
    "dg_minimal": "Minimal",
    "dg_traditional": "Traditionell",
    "dgf_stainless": "Edelstahl",
    "dgf_blackss": "Schwarzer Edelstahl",
    "dgf_white": "Weiß",
    "dgf_matte": "Mattschwarz",
    "dgf_retrocream": "Retro-Creme",
    "dgf_retromint": "Retro-Mint",
    "dgf_retrored": "Retro-Rot",
    "dgf_bronze": "Bronze",
    "dgf_panel": "Eichenfront",
    "dgf_black": "Schwarz",
    "dgf_silver": "Silber",
    "dgf_walnut": "Nussbaum",
    "dgf_graphite": "Graphit",
    "dgf_terracotta": "Terrakotta",
    "dgf_matteblack": "Mattschwarz",
    "dgf_woven": "Geflochten",
    "dgf_concrete": "Beton",
    "dgf_glazedblue": "Blau glasiert",
    "dgf_brass": "Messing",
    "dgf_sage": "Salbei",
    "dgf_cedar": "Zeder",
    "dgf_teak": "Teak",
    "dgf_blackmetal": "Schwarzes Metall",
    "dgf_composite": "Verbundholz",
    "dgf_stone": "Stein",
    "dgf_green": "Grün",
    "dgf_redbarn": "Scheunenrot",
    "dgc_cream": "Creme",
    "dgc_sage": "Salbei",
    "dgc_navy": "Marine",
    "dgc_grey": "Grau",
    "dgc_charcoal": "Anthrazit",
    "dgc_white": "Weiß",
    "dgc_mustard": "Senf",
    "dgc_teal": "Petrol",
    "dgc_rust": "Rost",
    "dgc_oat": "Hafer",
    "dgc_fog": "Nebel",
    "dgc_blush": "Rosé",
    "dgc_cognac": "Cognac",
    "dgc_black": "Schwarz",
    "dgc_olive": "Oliv",
    "dgc_linen": "Leinen",
    "dgc_oak": "Eiche",
    "dgc_blue": "Blau",
    "dgc_emerald": "Smaragd",
    "dgc_sapphire": "Saphir",
    "dgc_sand": "Sand",
    "dgc_seafoam": "Meeresgrün",
    "dgc_saddle": "Sattelbraun",
    "dgc_barn": "Scheune",
    "dgc_moss": "Moos",
    "dgc_ash": "Esche",
    "dgc_clay": "Ton",
    "dgc_jade": "Jade",
    "dgc_plum": "Pflaume",
    "dgc_ivory": "Elfenbein",
    "dgc_terracotta": "Terrakotta",
    "dgc_ochre": "Ocker",
    "dgc_stone": "Stein",
    "dgc_burgundy": "Burgunder",
    "dgc_hunter": "Jagdgrün",
    "dgc_gold": "Gold",
    "sy_head": "Stil",
    "sy_plain": "Schlicht",
    "sy_plain_sub": "Kein bestimmter Stil",
    "sy_change": "Ändern",
    "sy_applied": "Stil: {name}",
    "sy_r_americas": "Amerika",
    "sy_r_europe": "Europa",
    "sy_r_asia": "Asien",
    "sy_r_mideast": "Naher Osten und Afrika",
    "sy_r_oceania": "Australien und Neuseeland",
    "sy_r_modern": "Modern",
    "sy_r_civic": "Städte",
    "sy_suggested": "Vorgeschlagen",
    "sy_all": "Alle",
    "sy_find": "Stil suchen",
    "sy_any": "Beliebig (Neu mischen)",
    "sy_none": "Kein Stil mit diesem Namen",
    "sy_international": "Internationaler Stil",
    "sy_brutalist": "Brutalismus",
    "sy_artdeco": "Art déco",
    "sy_storefront": "Geschäftsstraße",
    "sy_haussmann": "Haussmann (Paris)",
    "sy_brownstone": "Brownstone",
    "sy_bistro": "Pariser Café",
    "sy_googie": "Googie-Diner",
    "sy_collegiate": "College-Gotik",
    "sy_schoolhouse": "Rotes Schulhaus",
    "sy_modernist": "Moderne",
    "sy_hightech": "High-Tech",
    "sy_panelblock": "Plattenbau",
    "sy_mediterranean": "Mediterran",
    "sy_scandi": "Skandinavisch",
    "sy_craftsman": "Craftsman",
    "sy_colonial": "Kolonialstil",
    "sy_capecod": "Cape Cod",
    "sy_victorian": "Viktorianisch",
    "sy_ranch": "Ranch-Haus",
    "sy_farmhouse": "Farmhaus",
    "sy_dutchcolonial": "Dutch Colonial",
    "sy_logcabin": "Blockhaus",
    "sy_aframe": "Finnhütte",
    "sy_midcentury": "Mid-Century",
    "sy_prairie": "Prärie-Stil",
    "sy_pueblo": "Pueblo-Lehmhaus",
    "sy_mission": "Mission-Stil",
    "sy_brazil": "Brasilianische Moderne",
    "sy_tudor": "Tudor-Fachwerk",
    "sy_georgian": "Georgianisch",
    "sy_cottage": "Reetdachhaus",
    "sy_french": "Pariser Mansarde",
    "sy_provencal": "Provenzalisch",
    "sy_tuscan": "Toskanische Villa",
    "sy_dutch": "Grachtenhaus",
    "sy_nordic": "Skandinavisch",
    "sy_chalet": "Schweizer Chalet",
    "sy_izba": "Russische Isba",
    "sy_cycladic": "Griechische Insel",
    "sy_japanese": "Japanisch",
    "sy_chinese": "Chinesisches Hofhaus",
    "sy_hanok": "Koreanisches Hanok",
    "sy_thai": "Thailändisch",
    "sy_balinese": "Balinesisch",
    "sy_haveli": "Indisches Haveli",
    "sy_riad": "Marokkanischer Riad",
    "sy_arabian": "Arabisch mit Kuppel",
    "sy_sahel": "Sahel-Lehmbau",
    "sy_rondavel": "Rondavel",
    "sy_queenslander": "Queenslander",
    "sy_nzvilla": "Neuseeland-Villa",
    "sy_modern": "Klassische Moderne",
    "sy_contemporary": "Zeitgenössisch",
    "sy_ecohouse": "Ökohaus",
    "rf_head": "Dachform",
    "rf_hip": "Walmdach",
    "rf_gable": "Satteldach",
    "rf_flat": "Flachdach",
    "rf_slab": "Auskragend",
    "rf_mansard": "Mansarddach",
    "rf_gambrel": "Scheunendach",
    "rf_aframe": "Finnhütte",
    "rf_shed": "Pultdach",
    "rf_butterfly": "Schmetterling",
    "rf_pagoda": "Geschwungen",
    "rf_dome": "Kuppel",
    "rf_stepped": "Treppengiebel",
    "ty_head": "Was gebaut wird",
    "ty_what_head": "Was es hat",
    "ty_house": "Haus",
    "ty_cabin": "Hütte",
    "ty_townhouses": "Reihenhäuser",
    "ty_duplex": "Doppelhaus",
    "ty_apartments": "Wohnungen",
    "ty_shop": "Lebensmittelladen",
    "ty_boutique": "Bekleidungsgeschäft",
    "ty_cafe": "Café",
    "ty_office": "Büro",
    "ty_school": "Schule",
    "ty_units": "Häuser in der Reihe",
    "ty_storeys": "Stockwerke",
    "ty_flats_side": "Wohnungen je Seite",
    "ty_flat_beds": "Schlafzimmer je Wohnung",
    "ty_classrooms": "Klassenzimmer je Stockwerk",
    "ty_size": "Größe",
    "ty_small": "Klein",
    "ty_medium": "Mittel",
    "ty_large": "Groß",
    "ty_style_prev": "Voriger Stil",
    "ty_style_next": "Nächster Stil",
    "ty_home_n": "Haus {n}",
    "ty_flat_n": "Whg. {n}",
    "ty_class_n": "Raum {n}",
    "tr_lobby": "Eingangshalle",
    "tr_landing": "Flur",
    "tr_lift": "Aufzug",
    "tr_sales": "Verkaufsfläche",
    "tr_stock": "Lager",
    "tr_restroom": "Toilette",
    "tr_staff": "Personalraum",
    "tr_fitting": "Umkleide",
    "tr_boutique": "Verkaufsraum",
    "tr_cafe": "Gastraum",
    "tr_reception": "Empfang",
    "tr_openoffice": "Großraumbüro",
    "tr_meeting": "Besprechungsraum",
    "tr_kitchenette": "Teeküche",
    "tr_classroom": "Klassenzimmer",
    "tk_head": "Was es verkauft",
    "tk_grocery": "Lebensmittel",
    "tk_convenience": "Kiosk",
    "tk_pharmacy": "Apotheke",
    "tk_hardware": "Baumarkt",
    "tk_electronics": "Elektronik",
    "tk_books": "Bücher",
    "tk_furniture": "Möbel",
    "tk_florist": "Blumen",
    "tk_toys": "Spielzeug",
    "tk_sports": "Sport",
    "tk_pets": "Tierbedarf",
    "tk_floor_convenience": "Laden",
    "tk_floor_pharmacy": "Apotheke",
    "tk_floor_hardware": "Baumarkt",
    "tk_floor_electronics": "Elektronikmarkt",
    "tk_floor_books": "Buchhandlung",
    "tk_floor_furniture": "Ausstellung",
    "tk_floor_florist": "Blumenladen",
    "tk_floor_toys": "Spielwarenladen",
    "tk_floor_sports": "Sportgeschäft",
    "tk_floor_pets": "Zoohandlung",
    "pg_training": "Schulungsraum",
    "pg_boardroom": "Sitzungssaal",
    "pg_cubicles": "Arbeitsboxen",
    "pg_phone": "Telefonkabine",
    "pg_directors": "Direktionsbüro",
    "pg_science_n": "Naturwissenschaften {n}",
    "pg_computers_n": "Computerraum {n}",
    "pg_art_n": "Kunstraum {n}",
    "pg_music_n": "Musikraum {n}",
    "pg_math_n": "Mathematik {n}",
    "pg_english_n": "Englisch {n}",
    "pg_history_n": "Geschichte {n}",
    "pg_library": "Bibliothek",
    "pg_cafeteria": "Mensa",
    "pg_nurse": "Krankenzimmer",
    "pg_labbench": "Laborbank",
    "pg_worktable": "Werktisch",
    "tr_breakout": "Pausenbereich",
    "tr_school_office": "Sekretariat",
    "ty_together": "Häuser in einer Reihe werden immer zusammengesetzt",
    "ty_start_title": "Ein Gebäude beginnen",
    "ty_make": "Erstellen",
    "tr_office": "Büro",
    "wx_clear": "Klar",
    "wx_cloudy": "Bewölkt",
    "wx_rain": "Regen",
    "wx_storm": "Gewitter",
    "wx_snow": "Schnee",
    "wx_fog": "Nebel",
    "wx_says_rain": "25 mm Regen auf diesem Dach sind etwa {l} Liter Wasser.",
    "wx_gutters": "Die Dachrinnen leiten es über die Fallrohre von den Wänden weg.",
    "wx_no_gutters": "Ohne Dachrinnen läuft es an der Traufe entlang der Wände ab.",
    "wx_says_snow": "30 cm nasser Schnee auf diesem Dach wiegen etwa {kg} kg.",
    "wx_says_rain_ft": "Ein Zoll Regen auf diesem Dach sind etwa {gal} Gallonen Wasser.",
    "wx_says_snow_ft": "Ein Fuß nasser Schnee auf diesem Dach wiegt etwa {lb} lb.",
    "land_head": "Das Grundstück",
    "land_guess": "Das kleinste Grundstück für dieses Haus, mit üblichen Abständen",
    "land_house": "Haus {ground} Grundfläche · {all} Wohnfläche",
    "land_cover": "{n} % bebaut",
    "land_acres": "{n} acres",
    "land_ha": "{n} ha",
    "hs_floors": "Geschosse und Dach",
    "hs_floors_tip": "Ein Geschoss darüber oder einen Keller hinzufügen, oder das Haus mit einem Dach aus einem Stück decken",
    "hs_floors_title": "Geschosse und Dach",
    "hs_floors_sub": "Ein neues Geschoss kommt auf dem Papier neben die anderen, die Treppe mit der darunter verbunden; in 3D steht es obenauf.",
    "hs_add": "Hinzufügen",
    "hs_add_up": "Ein Geschoss darüber",
    "hs_add_down": "Ein Keller",
    "hs_done": "Fertig",
    "hs_floor_made": "{name} hinzugefügt",
    "dz_finish": "Ausführung",
    "dz_fin_main": "Haupt",
    "dz_fin_trim": "Details",
    "dz_fin_plain_tip": "Zurück zu den üblichen Farben",
    "sizes": "Maße",
    "sizes_tip": "Länge, Breite und Deckenhöhe jedes Raums und Breite, Tiefe und Höhe jedes Möbels auf den Grundriss schreiben",
    "ic_fitness": "Fitness & Spiel",
    "ic_utility": "Garage & Technik",
    "ic_store": "Läden, Büros & Schulen",
    "ic_power": "Strom & Tragwerk",
    "n_i_consoletable": "Konsolentisch",
    "n_i_sideboard": "Sideboard",
    "n_i_chaise": "Chaiselongue",
    "n_i_rocker": "Schaukelstuhl",
    "n_i_hutch": "Vitrinenschrank",
    "n_i_barcart": "Barwagen",
    "n_i_highchair": "Hochstuhl",
    "n_i_daybed": "Tagesbett",
    "n_i_floormirror": "Standspiegel",
    "n_i_toybox": "Spielzeugkiste",
    "n_i_standdesk": "Stehschreibtisch",
    "n_i_lshapedesk": "Eckschreibtisch",
    "n_i_oven": "Einbaubackofen",
    "n_i_winecooler": "Weinkühlschrank",
    "n_i_freezer": "Gefriertruhe",
    "n_i_cornertub": "Eckbadewanne",
    "n_i_linencab": "Wäscheschrank",
    "n_i_whiteboard": "Whiteboard",
    "n_i_dartboard": "Dartscheibe",
    "n_i_evcharger": "Wallbox",
    "n_i_treadmill": "Laufband",
    "n_i_exbike": "Heimtrainer",
    "n_i_weightbench": "Hantelbank",
    "n_i_yogamat": "Yogamatte",
    "n_i_pooltable": "Billardtisch",
    "n_i_pingpong": "Tischtennisplatte",
    "n_i_easel": "Staffelei",
    "n_i_trampoline": "Trampolin",
    "n_i_swing": "Schaukelgerüst",
    "n_i_firepit": "Feuerschale",
    "n_i_lounger": "Sonnenliege",
    "n_i_gazebo": "Pavillon",
    "n_i_shed": "Gartenhaus",
    "n_i_planter": "Pflanzkasten",
    "n_i_birdbath": "Vogeltränke",
    "n_i_lamppost": "Laternenpfahl",
    "n_i_pathlight": "Wegleuchte",
    "n_i_porchlight": "Außenwandleuchte",
    "n_i_floodlight": "Fluter",
    "n_i_mailbox": "Briefkasten",
    "n_i_bikerack": "Fahrradständer",
    "n_i_court": "Basketballplatz",
    "n_i_pavilion": "Pavillon",
    "n_i_parking": "Parkplatz",
    "n_i_dumpster": "Müllcontainer",
    "n_i_condenser": "Klima-Außengerät",
    "n_i_bins": "Müll- und Wertstofftonnen",
    "n_i_gate": "Gartentor",
    "n_i_workbench": "Werkbank",
    "n_i_shelving": "Lagerregal",
    "n_i_toolchest": "Werkzeugwagen",
    "n_i_furnace": "Heizkessel",
    "n_i_gondola": "Gondelregal",
    "n_i_checkout": "Kasse",
    "n_i_cooler": "Kühlregal",
    "n_i_display": "Verkaufstisch",
    "n_i_register": "Registrierkasse",
    "n_i_schooldesk": "Schulbank",
    "n_i_outlet": "Steckdose",
    "n_i_lightswitch": "Lichtschalter",
    "n_i_garagebtn": "Garagentor-Taster",
    "n_i_breaker": "Sicherungskasten",
    "n_i_post": "Stütze",
    "wk_i_consoletable": "legt die Schlüssel auf den Konsolentisch",
    "wk_i_sideboard": "holt das gute Geschirr heraus",
    "wk_i_chaise": "streckt sich auf der Chaiselongue aus",
    "wk_i_rocker": "schaukelt im Schaukelstuhl",
    "wk_i_hutch": "bewundert das Porzellan",
    "wk_i_barcart": "mixt ein Getränk",
    "wk_i_highchair": "füttert das Baby",
    "wk_i_daybed": "legt sich kurz hin",
    "wk_i_floormirror": "prüft das Outfit im Spiegel",
    "wk_i_toybox": "räumt die Spielsachen weg",
    "wk_i_standdesk": "arbeitet im Stehen",
    "wk_i_lshapedesk": "arbeitet am Eckschreibtisch",
    "wk_i_oven": "backt einen Kuchen",
    "wk_i_winecooler": "sucht eine Flasche Wein aus",
    "wk_i_freezer": "holt etwas aus der Gefriertruhe",
    "wk_i_cornertub": "nimmt ein langes Bad",
    "wk_i_linencab": "holt ein frisches Handtuch",
    "wk_i_whiteboard": "schreibt ans Whiteboard",
    "wk_i_dartboard": "wirft ein paar Darts",
    "wk_i_evcharger": "steckt das Auto ein",
    "wk_i_treadmill": "läuft eine Runde",
    "wk_i_exbike": "fährt auf dem Heimtrainer",
    "wk_i_weightbench": "stemmt Gewichte",
    "wk_i_yogamat": "macht Yoga",
    "wk_i_pooltable": "spielt eine Runde Billard",
    "wk_i_pingpong": "spielt Tischtennis",
    "wk_i_easel": "malt ein Bild",
    "wk_i_trampoline": "springt auf dem Trampolin",
    "wk_i_swing": "schaukelt",
    "wk_i_firepit": "zündet die Feuerschale an",
    "wk_i_lounger": "legt sich in die Sonne",
    "wk_i_gazebo": "setzt sich in den Pavillon",
    "wk_i_shed": "holt den Rasenmäher heraus",
    "wk_i_planter": "gießt den Pflanzkasten",
    "wk_i_birdbath": "füllt die Vogeltränke",
    "wk_i_lamppost": "schaltet das Außenlicht ein",
    "wk_i_pathlight": "schaltet die Wegleuchte ein",
    "wk_i_porchlight": "schaltet die Außenleuchte ein",
    "wk_i_floodlight": "schaltet den Fluter ein",
    "wk_i_mailbox": "sieht in den Briefkasten",
    "wk_i_bikerack": "holt das Fahrrad",
    "wk_i_court": "wirft ein paar Körbe",
    "wk_i_pavilion": "picknickt im Pavillon",
    "wk_i_dumpster": "bringt den Müll zum Container",
    "wk_i_condenser": "prüft die Klimaanlage",
    "wk_i_bins": "bringt den Müll raus",
    "wk_i_gate": "lässt Leute durch den Zaun",
    "wk_i_workbench": "repariert etwas an der Werkbank",
    "wk_i_shelving": "sucht eine Kiste im Regal",
    "wk_i_toolchest": "holt einen Schraubenschlüssel",
    "wk_i_furnace": "dreht die Heizung auf",
    "wk_i_gondola": "nimmt etwas aus dem Regal",
    "wk_i_checkout": "bezahlt an der Kasse",
    "wk_i_cooler": "nimmt ein kaltes Getränk",
    "wk_i_display": "sucht sich Obst aus",
    "wk_i_register": "tippt es in die Kasse",
    "wk_i_schooldesk": "setzt sich zum Unterricht",
    "wk_i_outlet": "steckt etwas ein",
    "wk_i_lightswitch": "drückt den Lichtschalter",
    "wk_i_garagebtn": "drückt den Garagentor-Taster",
    "wk_i_breaker": "prüft die Sicherungen",
    "wk_i_post": "lehnt sich an die Stütze",
    # ---- doors, as they are made (40-doors.js, 2026-10-03)
    "dd_head": "Tür",
    "dd_handle": "Griff",
    "dd_metal": "Beschläge",
    "dd_finish": "Oberfläche",
    "dd_hinges": "Scharniere",
    "dd_left": "Links",
    "dd_right": "Rechts",
    "dd_opens": "Öffnet bis",
    "dd_st_flush": "Glatt",
    "dd_st_panel6": "Sechs Felder",
    "dd_st_panel2": "Zwei Felder",
    "dd_st_shaker": "Shaker",
    "dd_st_craftsman": "Craftsman",
    "dd_st_halfglass": "Halb verglast",
    "dd_st_french": "Sprossentür",
    "dd_st_modern": "Modern",
    "dd_st_barn": "Scheunentür",
    "dd_st_louver": "Lamellen",
    "dd_st_storefront": "Ladentür",
    "dd_hd_lever": "Klinke",
    "dd_hd_knob": "Knauf",
    "dd_hd_pull": "Stange",
    "dd_mt_brass": "Messing",
    "dd_mt_chrome": "Chrom",
    "dd_mt_black": "Mattschwarz",
    "dd_mt_bronze": "Bronze",
    "dd_mt_nickel": "Nickel",
    "dd_fin_drawn": "Wie gezeichnet",
    "dd_fin_white": "Weiß",
    "dd_fin_oak": "Eiche",
    "dd_fin_walnut": "Nussbaum",
    "dd_fin_black": "Schwarz",
    "dd_fin_sage": "Salbei",
    "dd_fin_navy": "Marineblau",
    "dd_fin_red": "Rot",
    "dd_ajar": "Angelehnt",
    "dd_wide": "Offen",
    "dd_shut": "Zu",
    # ---- going between floors, walking round (40-climb.js, 2026-10-03)
    "lf_panel": "Aufzugtasten",
    "lf_going": "Türen schließen",
    "lf_here": "{floor}",
    "lf_called": "Aufzug ist da",
    # ---- what is done, seen being done (40-use3d.js, 2026-10-03)
    "us_plugged": "Eingesteckt: {what}",
    "us_plugged_none": "Eingesteckt",
    "us_unplugged": "Ausgesteckt: {what}",
    "us_unplugged_none": "Ausgesteckt",
    # ---- moving things about in 3D (40-edit3d.js, 2026-10-03)
    "e3_back": "Kein Platz: zurückgestellt",
    "e3_turn": "Drehen",
    "e3_turn_tip": "Um eine Vierteldrehung drehen (R)",
    "e3_delete": "Löschen",
    "e3_delete_tip": "Entfernen (Entf)",
    "e3_done": "Fertig",
    "e3_no_turn": "Kein Platz zum Drehen",
    "e3_deleted": "{what} entfernt",
    "e3_undone": "Rückgängig",
    "e3_redone": "Wiederhergestellt",
    # ---- opened the way it is made, used by looking at it (40-open3d.js, 2026-10-03)
    "o3_closer": "Näher herangehen",
    "o3_open_drawer": "Schublade öffnen", "o3_close_drawer": "Schublade schließen",
    "o3_open_door": "Tür öffnen", "o3_close_door": "Tür schließen",
    # the garage door, its opener and its button (40-garage.js)
    "gd_use_button": "Es fährt mit dem Antrieb: den Wandtaster drücken", "gd_door_verb": "Wandtaster benutzen",
    "gd_open": "Garagentor öffnen", "gd_close": "Garagentor schließen", "gd_stop": "Garagentor anhalten",
    "gd_opening": "Garagentor öffnet", "gd_closing": "Garagentor schließt", "gd_stopped": "Garagentor angehalten",
    "gd_eye": "Die Lichtschranke hat es wieder hochgefahren", "gd_no_door": "Kein Garagentor für diesen Taster",
    "gd_cars_head": "Garage", "gd_cars_1": "1 Auto", "gd_cars_2": "2 Autos", "gd_cars_3": "3 Autos", "gd_cars_4": "4 Autos",
    "fm_foyer": "Diele",   # a house entered by an entry hall (40-forms.js)
    "wg_ready": "Die Baustelle wird vorbereitet",   # the building site held at its start while it loads (40-works-gate.js)
    "gl_wait": "Die 3D-Ansicht wird vorbereitet",   # the 3D view's programs made on the side, the first time it is drawn (38-view3d-gl.js)
    "ro_coming": "Die Arbeit wird wiederhergestellt …",   # over the paper while the work left on it is put back (40-reopen.js)
    "uf_head": "Möbel",   # Start building: furnished or empty (39-starter.js)
    "uf_tile": "Räume einrichten",
    "o3_open_lid": "Deckel anheben", "o3_close_lid": "Deckel schließen",
    "o3_locked": "Abgeschlossen",
    "o3_light_on": "Licht einschalten", "o3_light_off": "Licht ausschalten",
    "o3_breakers_on": "Strom wieder einschalten", "o3_breakers_off": "Strom ausschalten",
    "o3_turn_on": "Einschalten", "o3_turn_off": "Ausschalten",
    "o3_tap_on": "Wasser aufdrehen", "o3_tap_off": "Wasser zudrehen",
    "o3_fire_on": "Feuer anzünden", "o3_fire_off": "Feuer löschen",
    "o3_sit": "Hinsetzen", "o3_lie": "Hinlegen", "o3_sleep": "Bis zum Morgen schlafen",
    "o3_plug": "Einstecken", "o3_unplug": "Ausstecken",
    "o3_flush": "Spülen", "o3_play": "Spielen", "o3_water_plant": "Gießen", "o3_take_book": "Ein Buch nehmen",
    "o3_pay": "Bezahlen", "o3_take": "Eins nehmen", "o3_coffee": "Kaffee machen", "o3_workout": "Trainieren",
    "o3_game": "Eine Runde spielen", "o3_fish": "Fische füttern", "o3_music": "Musik abspielen", "o3_write": "Darauf schreiben",
    "o3_car": "Die Tür versuchen", "o3_swim": "Schwimmen gehen", "o3_test": "Testen", "o3_warmer": "Wärmer stellen",
    "o3_use": "Benutzen",
    "o3_opened": "{what}: {part} geöffnet", "o3_closed": "{what}: {part} geschlossen",
    "o3_p_drawer": "Schublade", "o3_p_door": "Tür", "o3_p_lid": "Deckel",
    "o3_m_move": "Verschieben", "o3_m_open": "Öffnen", "o3_m_close": "Schließen", "o3_m_use": "Benutzen",
    "o3_m_format": "Ausführung und Design…", "o3_m_place": "Klicken, wo es hin soll · Esc lässt es stehen",
    "o3_no_room": "Daneben ist kein Platz", "o3_made": "Noch einmal: {what}",
    # ---- round a building, for what it is (40-grounds.js, 2026-10-03)
    "gr_head": "Außenanlagen",
    "gr_tab_building": "Gebäude",
    "gr_building": "Das Gebäude",
    "yd_parking": "Parkplätze",
    "yd_bikes": "Fahrradständer",
    "yd_benches": "Bänke",
    "yd_lamps": "Laternen",
    "yd_planters": "Pflanzkübel",
    "yd_seating": "Tische draußen",
    "yd_playground": "Spielplatz",
    "yd_sharedpool": "Pool und Liegen",
    "yd_bbq": "Grillplatz",
    "yd_carts": "Einkaufswagen",
    # ---- how open a house is (39-starter.js, 2026-10-03)
    "st_layout_head": "Grundriss",
    "lay_classic": "Getrennte Räume",
    "lay_semi": "Küche und Essen zusammen",
    "lay_open": "Offenes Wohnen",
    "lay_great": "Großer Wohnraum",
    "sup_head": "Getragen von",
    "sup_beams": "Stahlträgern",
    "sup_posts": "Stützen",
    "zn_head": "Grundriss",
    "zn_any": "Beliebig (Neu mischen)",
    "zn_together": "Schlafzimmer zusammen",
    "zn_split": "Getrennte Schlafzimmer",
    "zn_wing": "Schlafflügel",
    "zn_downstairs": "Hauptschlafzimmer unten",
    "od_one": "Zu einem Raum machen",
    "od_own": "Zum eigenen Raum machen",
    "od_apart": "Wieder in Räume teilen",
    # ---- what holds a building up (40-struct.js, 2026-10-03)
    "sx_head": "Tragwerk",
    "sx_wood": "Holzrahmen",
    "sx_steel": "Stahlrahmen",
    "sx_shown": "Sichtbare Balken",
    # ---- up under the roof (40-attic.js, 2026-10-03)
    "at_head": "Dachboden",
    "at_flat": "Ein Flachdach hat keinen Dachboden",
    "hh_head": "Kamine",
    "hh_none": "Keiner",
    "hh_one": "Einer",
    "hh_each": "Einer in jeder Wohnung",
    "ca_court": "Innenhof",
    "ca_commons": "Pausenhalle",
    "ca_gym": "Turnhalle",
    "sl_girls": "Mädchen",
    "sl_boys": "Jungen",
    "sl_women": "Damen",
    "sl_men": "Herren",
    "sl_accessible": "Barrierefreie Kabine",
    "at_none": "Keiner",
    "at_storage": "Stauraum",
    "at_room": "Ausgebaut",
    "at_garage_head": "Über der Garage",
    "atg_none": "Nichts",
    "atg_storage": "Stauraum",
    "atg_room": "Zusatzzimmer",
    "at_room_name": "Dachzimmer",
    "at_store_name": "Dachboden",
    "at_bonus_name": "Zusatzzimmer",
    "at_garage_name": "Stauboden",
    "at_shed_loft": "Schuppen mit Boden",
    "fl_attic": "Dachboden",
    # ---- a house's systems, the parts of them (40-systems.js, 2026-10-03)
    "n_i_smoke": "Rauchmelder",
    "n_i_thermostat": "Thermostat",
    "n_i_waterheater": "Warmwasserspeicher",
    "n_i_exhaustfan": "Badlüfter",
    "wk_i_smoke": "prüft den Melder",
    "wk_i_thermostat": "dreht die Heizung auf",
    "wk_i_waterheater": "prüft den Speicher",
    "wk_i_exhaustfan": "schaltet den Lüfter ein",
    # ---- a house's systems, set and seen (40-systems.js, 2026-10-03)
    "xr_insulation": "Dämmung",
    "xr_fire": "Sprinkleranlage",
    "fs_exit": "AUSGANG",
    "xr_low": "Netzwerk, TV und Melder",
    "xs_15": "15 A",
    "xs_20": "20 A",
    "xs_30": "30 A",
    "xs_50": "50 A",
    "xs_ground": "Erder",
    "xs_media": "Netzwerkverteiler",
    "xs_shutoff": "Hauptabsperrung",
    "xs_condenser": "Klima-Außengerät",
    "xs_return": "Abluft",
    "dy_head": "Strom, Wasser, Heizung",
    "dy_auto": "Automatisch",
    "dy_diy": "Selbst machen",
    "dy_fix": "Einbauen",
    "dy_no_panel": "Das Haus hat keinen Sicherungskasten",
    "dy_no_outlet": "Keine Steckdose in {room}",
    "dy_no_switch": "Kein Lichtschalter in {room}",
    "dy_no_smoke": "{room} braucht einen Rauchmelder",
    "dy_no_fan": "{room} braucht einen Lüfter nach draußen",
    "dy_no_vent": "Keine Heizung in {room}",
    "dy_no_heater": "Nichts erwärmt das Wasser",
    "dy_no_thermo": "Kein Thermostat für die Heizung",
    # ---- skyscrapers (40-towers.js, 2026-10-03)
    "ty_tower": "Wolkenkratzer",
    "sk_lobby": "Lobby",
    "sk_sky": "Sky-Lounge",
    "sk_use_head": "Genutzt für",
    "sk_offices": "Büros",
    "sk_homes": "Wohnungen",
    "sk_mixed": "Büros und Wohnungen",
    "sk_form_head": "Hochhausstil",
    "sk_spire": "Spiralförmig gestuft",
    "sk_twist": "Gedreht",
    "sk_pagoda": "Pagode",
    "sk_deco": "Art déco",
    "sk_diagrid": "Diagrid",
    "sk_star": "Sterngrundriss",
    "sk_chamfer": "Abgeschrägt",
    "sk_taper": "Quadrat zu Kreis",
    "sk_forest": "Vertikaler Wald",
    "sk_slab": "Glasscheibe",
    # ---- using a house's systems (40-systems.js, 2026-10-03)
    "us_smoke": "Piep! Piep! Piep! Der Melder funktioniert",
    "us_thermo": "Heizung auf {t} gestellt",
    # ---- more rooms for a house (40-rooms.js, 2026-10-03)
    "hx_head": "Weitere Räume",
    "hx_pantry": "Speisekammer",
    "hx_coat": "Garderobe",
    "hx_mudroom": "Schmutzschleuse",
    "hx_playroom": "Spielzimmer",
    "hx_media": "Heimkino",
    "hx_gym": "Fitnessraum",
    "hx_library": "Bibliothek",
    "hx_sunroom": "Wintergarten",
    # ---- the site round a building, joined or alone (40-site.js, 2026-10-03)
    "lw_attach_head": "Bauweise",
    "lw_at_alone": "Freistehend",
    "lw_at_one": "Einseitig angebaut",
    "lw_at_row": "Beidseitig angebaut",
    "lw_at_block": "Teil eines großen Gebäudes",
    "lw_park_head": "Parken",
    "lw_pk_auto": "Wie üblich",
    "lw_pk_drive": "Eigene Einfahrt",
    "lw_pk_none": "Keine",
    "lw_pk_front": "Vorne",
    "lw_pk_side": "Seitlich",
    "lw_pk_frontside": "Vorne und seitlich",
    "lw_pk_back": "Hinten",
    "lw_pk_around": "Rundherum",
    "lw_pk_street": "An der Straße",
    "lw_side_head": "Welche Seite",
    "lw_sd_left": "Links",
    "lw_sd_right": "Rechts",
    "lw_joined_tip": "An das Nachbargebäude gebaut",
    "yd_walks": "Wege rundherum",
    "yd_beds": "Beete und Bäume",
    "n_i_sidewalk": "Gehweg",
    "n_i_asphalt": "Asphaltfläche",
    "n_i_plantbed": "Pflanzbeet",
    "n_i_bikepark": "Fahrradstellplatz",
    "lw_liftlobby": "Aufzugsvorraum",
    "ic_mall": "Einkaufszentren & große Läden",
    "n_i_cartcorral": "Einkaufswagenbox",
    "n_i_selfcheckout": "Selbstbedienungskasse",
    "n_i_produce": "Obst- und Gemüsestand",
    "n_i_bakerycase": "Backwarentheke",
    "n_i_delicase": "Feinkosttheke",
    "n_i_meatcase": "Fleischkühltheke",
    "n_i_chestfreezer": "Tiefkühltruhe",
    "n_i_winerack": "Weinregal",
    "n_i_magrack": "Zeitschriftenregal",
    "n_i_roundrack": "Kleiderständer",
    "n_i_mannequin": "Schaufensterpuppe",
    "n_i_endcap": "Regalkopf",
    "n_i_palletrack": "Palettenregal",
    "n_i_forklift": "Gabelstapler",
    "n_i_pallet": "Palette mit Ware",
    "n_i_kiosk": "Verkaufsinsel",
    "n_i_atm": "Geldautomat",
    "n_i_vending": "Verkaufsautomat",
    "n_i_photobooth": "Fotokabine",
    "n_i_mallfountain": "Innenbrunnen",
    "n_i_directory": "Lageplan",
    "n_i_infodesk": "Informationsschalter",
    "n_i_secgate": "Sicherungsschleuse",
    "n_i_basketstack": "Einkaufskörbe",
    "n_i_pricecheck": "Preisscanner",
    "n_i_servicedesk": "Kundendienst",
    "n_i_cashwrap": "Kassentresen",
    "n_i_jewelcase": "Schmuckvitrine",
    "n_i_glasscase": "Glasvitrine",
    "n_i_lockers": "Schließfächer",
    "n_i_kidride": "Kinderkarussell",
    "n_i_claw": "Greifautomat",
    "n_i_arcade": "Spielautomat",
    "n_i_bin3": "Wertstoffstation",
    "n_i_mallbench": "Sitzbank",
    "n_i_bigplanter": "Baumkübel",
    "n_i_signpylon": "Werbepylon",
    "n_i_stanchion": "Absperrpfosten",
    "n_i_baler": "Kartonpresse",
    "n_i_escalator": "Rolltreppe",
    "sto_big": "Großmarkt",
    "sto_super": "Hypermarkt",
    "sto_garden": "Gartencenter",
    "sto_receiving": "Warenannahme",
    "sto_dock": "Laderampe",
    "sto_cash": "Kassenbüro",
    "sto_backroom": "Lager",
    "sto_grocery": "Lebensmittel",
    "sto_general": "Mode & Elektronik",
    "sto_home": "Haus & Baumarkt",
    "ty_mall": "Einkaufszentrum",
    "mall_unit_n": "Laden {n}",
    "mall_food": "Food Court",
    "mall_anchor": "Kaufhaus",
    "mall_entrance": "Eingang",
    "mall_concourse": "Passage",
    "ic_food": "Restaurants & Cafés",
    "ic_health": "Praxis & Pflege",
    "ic_hobby": "Musik, Kunst & Hobbys",
    "n_i_booth": "Sitznische",
    "n_i_barcounter": "Bartheke",
    "n_i_espresso": "Siebträgermaschine",
    "n_i_pizzaoven": "Pizzaofen",
    "n_i_fryer": "Fritteuse",
    "n_i_griddle": "Grillplatte",
    "n_i_saladbar": "Salatbar",
    "n_i_sodafountain": "Getränkespender",
    "n_i_menuboard": "Menütafeln",
    "n_i_hoststand": "Empfangspult",
    "n_i_buffet": "Buffet",
    "n_i_icecase": "Eistheke",
    "n_i_beertap": "Zapfanlage",
    "n_i_preptable": "Arbeitstisch",
    "n_i_walkin": "Kühlraum",
    "n_i_dishpro": "Haubenspülmaschine",
    "n_i_foodcounter": "Imbisstheke",
    "n_i_foodtable": "Food-Court-Tisch",
    "n_i_hospbed": "Krankenbett",
    "n_i_exam": "Untersuchungsliege",
    "n_i_wheelchair": "Rollstuhl",
    "n_i_ivpole": "Infusionsständer",
    "n_i_xray": "Röntgengerät",
    "n_i_dentchair": "Zahnarztstuhl",
    "n_i_medcart": "Medikamentenwagen",
    "n_i_stretcher": "Krankentrage",
    "n_i_docscale": "Arztwaage",
    "n_i_eyechart": "Sehtafel",
    "n_i_firstaid": "Erste-Hilfe-Kasten",
    "n_i_aed": "Defibrillator",
    "n_i_oxygen": "Sauerstoffflaschen",
    "n_i_walker": "Rollator",
    "n_i_waitchairs": "Wartezimmerstühle",
    "n_i_grandpiano": "Flügel",
    "n_i_drums": "Schlagzeug",
    "n_i_guitar": "Gitarre",
    "n_i_cello": "Cello",
    "n_i_keyboard": "Keyboard",
    "n_i_micstand": "Mikrofonständer",
    "n_i_amp": "Verstärker",
    "n_i_sewing": "Nähmaschine",
    "n_i_pottery": "Töpferscheibe",
    "n_i_kiln": "Brennofen",
    "n_i_chess": "Schachtisch",
    "n_i_drafting": "Zeichentisch",
    "n_i_globe": "Standglobus",
    "n_i_harp": "Harfe",
    "n_i_musicstand": "Notenständer",
    "n_i_djdesk": "DJ-Pult",
    "ic_learn": "Klassenzimmer & Labore",
    "ic_work": "Büro & Arbeit",
    "n_i_labbench": "Labortisch",
    "n_i_fumehood": "Abzug",
    "n_i_microscope": "Mikroskop",
    "n_i_lectern": "Rednerpult",
    "n_i_chalkboard": "Kreidetafel",
    "n_i_cubbies": "Fächerregal",
    "n_i_skeleton": "Skelettmodell",
    "n_i_laptopcart": "Laptopwagen",
    "n_i_bleachers": "Tribüne",
    "n_i_hoop": "Basketballkorb",
    "n_i_kidstable": "Kindertisch",
    "n_i_cubicle": "Arbeitskabine",
    "n_i_conftable": "Konferenztisch",
    "n_i_copier": "Kopierer",
    "n_i_shredder": "Aktenvernichter",
    "n_i_watercooler": "Wasserspender",
    "n_i_safe": "Tresor",
    "n_i_frontdesk": "Empfangstresen",
    "n_i_plotter": "Plotter",
    "n_i_mailsorter": "Postfächer",
    "n_i_flipchart": "Flipchart",
    "n_i_partition": "Stellwand",
    "n_i_umbrellastand": "Schirmständer",
    "n_i_futon": "Futon",
    "n_i_pouf": "Pouf",
    "n_i_laddershelf": "Leiterregal",
    "n_i_curio": "Vitrinenschrank",
    "n_i_grandclock": "Standuhr",
    "n_i_canopybed": "Himmelbett",
    "n_i_murphybed": "Schrankbett",
    "n_i_bassinet": "Stubenwagen",
    "n_i_changingtable": "Wickeltisch",
    "n_i_rockinghorse": "Schaukelpferd",
    "n_i_dollhouse": "Puppenhaus",
    "n_i_kidtent": "Spielzelt",
    "n_i_knifeblock": "Messerblock",
    "n_i_blender": "Standmixer",
    "n_i_mixer": "Küchenmaschine",
    "n_i_ricecooker": "Reiskocher",
    "n_i_airfryer": "Heißluftfritteuse",
    "n_i_breadbox": "Brotkasten",
    "n_i_potrack": "Topfhalter",
    "n_i_trashsort": "Mülltrennung",
    "n_i_spicerack": "Gewürzregal",
    "n_i_toolwall": "Werkzeugwand",
    "n_i_bidet": "Bidet",
    "n_i_urinal": "Urinal",
    "n_i_handdryer": "Händetrockner",
    "n_i_toiletstall": "Toilettenkabine",
    "n_i_sauna": "Sauna",
    "n_i_scalebath": "Personenwaage",
    "n_i_playset": "Spielturm",
    "n_i_playslide": "Rutsche",
    "n_i_seesaw": "Wippe",
    "n_i_sandbox": "Sandkasten",
    "n_i_picnic": "Picknicktisch",
    "n_i_umbrella": "Sonnenschirm",
    "n_i_firehydrant": "Hydrant",
    "n_i_bollard": "Poller",
    "n_i_stopsign": "Stoppschild",
    "n_i_newsbox": "Zeitungskasten",
    "n_i_busstop": "Bushaltestelle",
    "n_i_statue": "Statue",
    "n_i_flagpole": "Fahnenmast",
    "n_i_compost": "Komposter",
    "n_i_rainbarrel": "Regentonne",
    "n_i_greenhouse": "Gewächshaus",
    "n_i_chickencoop": "Hühnerstall",
    "n_i_doghouse": "Hundehütte",
    "n_i_hammock": "Hängematte",
    "n_i_tent": "Zelt",
    "n_i_wheelbarrow": "Schubkarre",
    "n_i_lawnmower": "Rasenmäher",
    "n_i_ladder": "Stehleiter",
    "n_i_generator": "Stromgenerator",
    "n_i_kayak": "Kajak",
    "n_i_motorcycle": "Motorrad",
    "n_i_golfcart": "Golfwagen",
    "vg_head": "Gehweg",
    "vg_none": "Am Bordstein",
    "vg_strip": "Grünstreifen",
    "vg_trees": "Baumstreifen",
    "vg_land": "Grünstreifen bis zum Bordstein: {area}",
    "ln_head": "Fahrspuren",
    "ln_two": "2 Spuren",
    "ln_four": "4 Spuren",
    "ln_six": "6 Spuren",
    # the building site's last works outside (40-works-site.js)
    "jw_pave": "Parkplatz asphaltieren und markieren",
    "jw_walks": "Gehwege betonieren",
    "jw_plant": "Bepflanzen und einzäunen",
    "jw_fix": "Laternen, Ständer und Tonnen aufstellen",
    "jw_open": "Eröffnet: die ersten Autos kommen",
    # the building site's calendar (40-works-day.js)
    "wv_bar": "Wo der Bau steht: ziehen, um zurück- oder vorzuspringen", "wv_play": "Abspielen (Leertaste)", "wv_pause": "Pause (Leertaste)", "wv_again": "Von hier noch einmal ansehen", "wv_wait": "Baustelle wird vorbereitet", "wv_value": "{gone} von {all}",
    "jc_day": "Tag {n} von etwa {d}",
    "jc_done_head": "Fertig",
    "jc_work": "Die Arbeiter sind bei der Arbeit",
    "jc_lunch": "Mittagspause",
    "jc_home": "Feierabend",
    "jc_night": "Baustelle über Nacht geschlossen",
    "jc_weekend": "Wochenende: Baustelle geschlossen",
    "jc_holiday": "Feiertag: Baustelle geschlossen",
    "jc_late": "Warten auf eine verspätete Lieferung",
    "jc_broke": "Maschine kaputt: Warten auf die Reparatur",
    "jc_short": "Heute zu wenig Leute",
    "jc_inspect": "Prüfer auf der Baustelle: {what}",
    "jc_fail": "Prüfung nicht bestanden: {what} wird nachgebessert",
    "jc_insp_footing": "Fundamente",
    "jc_insp_frame": "Rohbau",
    "jc_insp_final": "Schlussabnahme",
    "jc_off_rain": "Wegen Regen keine Arbeit",
    "jc_off_storm": "Sturm: Baustelle geschlossen",
    "jc_off_snow": "Wegen Schnee keine Arbeit",
    "jc_slow_drizzle": "Nieselregen: die Arbeit geht langsamer",
    "jc_slow_rain": "Regen: Außenarbeiten langsamer",
    "jc_slow_storm": "Sturm: Außenarbeiten langsamer",
    "jc_slow_snow": "Schnee: es geht langsam voran",
    "jc_slow_wind": "Starker Wind: der Kran steht still",
    "jc_done": "In {days} Arbeitstagen gebaut ({weeks} Wochen).",
    "jc_done_lost": "{n} Tage wegen des Wetters verloren.",
    "jc_done_insp": "{n} Prüfungen bestanden.",
    "jc_done_insp_fail": "{n} Prüfungen, {f} nicht bestanden und nachgebessert.",
    "jc_wx_clear": "Klar",
    "jc_wx_cloudy": "Bewölkt",
    "jc_wx_drizzle": "Nieselregen",
    "jc_wx_rain": "Regen",
    "jc_wx_storm": "Sturm",
    "jc_wx_snow": "Schnee",
    "jc_wx_wind": "Windig",
}

speaks("de", "Deutsch", DE)
