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
    "print_head": "Drucken",
    "print_go": "Drucken…",
    "print_paper": "Papier",
    "print_wide": "Quer",
    "print_fit": "Auf eine Seite bringen",
    "print_note": "Gedruckt wird schlicht: keine Farben, nur Linien und Wörter. Welcher Drucker und wie viele Kopien, fragt dein Browser selbst — eine Seite darf das nicht fragen.",
    "panel": "Bereich", "panel_tip": "Bereich ein- oder ausblenden",
    "png_tip": "Wie groß das PNG wird",
    "fit": "Einpassen", "actual": "Original", "zoom_in": "Vergrößern",
    "slide_left": "Links", "slide_right": "Rechts", "slide_up": "Hoch", "slide_down": "Runter",
    "hold_locked": "Fixiert", "hold_loose": "Frei",
    "lock_tip": "Das Diagramm bleibt an seinem Platz und wird in der Fläche gescrollt",
    "loose_tip": "Das Diagramm frei verschieben; eine Ecke bleibt immer sichtbar",
    "tool_move": "Bewegen",
    "tool_move_tip": "Ziehe das Blatt, um dich darauf zu bewegen. Umschalt+Ziehen zieht einen Rahmen, um Formen auszuwählen.",
    "tool_select": "Auswählen",
    "tool_select_tip": "Ziehe über das Blatt, um die Formen darin auszuwählen. Tippe oder klicke Formen an, um sie dazuzunehmen oder wegzulassen.",
    "zoom_out": "Verkleinern", "pixels": "Pixel",
    "dl_scale": "Mal so groß wie gezeichnet",
    "dl_frame": "In ein Bild eingepasst",
    "png_over": "mehr, als dieser Browser zeichnen kann",
    "click_shape": "Klicke auf eine Form im Diagramm, um nur diese zu gestalten.",
    "palette_hint": "Eine Palette setzt alle Formen auf einmal. Was du "
                    "danach von Hand änderst, bleibt erhalten.",
    "shapes_hint": "Füllung und Umriss, für alle Formen dieser Art.",
    "apply_all": "Auf alle {n} anwenden: {what}", "clear": "Löschen",
    "rendering": "Wird erzeugt…",
    "png_big": "Der Browser konnte kein so großes PNG erzeugen. Nimm eine "
               "kleinere Größe oder speichere das SVG.",
    "png_fail": "Der Browser konnte das PNG nicht zeichnen. Der "
                "SVG-Download funktioniert weiterhin.",
    "png_capped": "{want}× ist mehr, als ein Browser-Canvas fasst; "
                  "das PNG wird mit {got}× gespeichert "
                  "({w} × {h} Pixel).",
    "flowchart": "Flussdiagramm",
    "r_head": "Ausführen",
    "r_run": "Starten",
    "r_stop": "Anhalten",
    "r_code": "Als Code", "r_lang_pick": "In welcher Sprache der Code geschrieben ist",
    "r_pseudo": "Pseudocode",
    "r_slowly": "Schritt für Schritt",
    "r_enter": "Eingeben",
    "r_hint": "Führt das Programm aus, aus dem das Diagramm entstanden ist: es fragt, wonach es fragt, gibt aus, was es ausgibt, und hebt die Form hervor, bei der es gerade ist. Wähle eine Sprache, um dasselbe Programm darin zu sehen.",
    "r_started": "Läuft...",
    "r_done": "Fertig.",
    "r_nothing": "Es gibt noch nichts auszuführen.",
    "r_steps": "{n} Schritte, {ms} ms.",
    "r_forever": "Das läuft viel zu lange ohne anzuhalten -- irgendwo ist eine Schleife, aus der es nie herauskommt.",
    "r_zero": "Das teilt durch null.",
    "r_unknown": "In {name} steht noch nichts.",
    "r_odd_op": "Mit {op} weiß ich nichts anzufangen.",
    "r_half": "Das liest sich nicht als Ganzes: {bit}",
    "r_back": "Zurück zum Lauf", "back": "Zurück",
    "r_by_hand": "Starten wird aktiv, sobald der Entwurf funktioniert.",
    "h_no_start": "Es gibt keine Form, mit der begonnen wird.",
    "h_tangled": "Die Schleifen in diesem Entwurf kreuzen sich, er lässt sich daher nicht als Programm schreiben.",
    "h_not_a_program": "Die Wörter in diesen Formen lesen sich nicht wie ein Programm.",
    "r_build_first": "Erstelle ein Diagramm aus Pseudocode, dann "
                     "kann es hier ausgeführt werden.",
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
    "r_open_quote": "Dieser Text wird nie geschlossen -- ein Anführungszeichen fehlt.",
    "r_open_bracket": "Diese Klammer wird geöffnet und nie geschlossen.",
    "r_shut_bracket": "Diese Klammer schließt eine, die nie geöffnet wurde.",
    "r_no_idea": "Aus dieser Zeile werde ich nicht schlau, der Lauf ist darüber hinweggegangen.",
    "r_stepped_over": "Einige Zeilen wurden übergangen, das Ausgegebene ist also vielleicht nicht alles.",
    "r_too_deep": "{name} hat sich viel zu oft selbst aufgerufen -- irgendwo hört es nicht mehr auf.",
    "r_args": "{name} verlangt {want} und hat {got} bekommen.",
    "r_no_main": "Hier gibt es keinen Hauptablauf, der Lauf hat also in {name} begonnen.",
    "w_head": "Einen Blick wert",
    "w_found": "{n} zum Anschauen im Pseudocode:",
    "w_open_if": "Zeile {line}: Dieses If wird nie geschlossen, alles darunter steht also darin. Setz ein End If dorthin, wo es aufhören soll.",
    "w_open_loop": "Zeile {line}: Diese Schleife wird nie geschlossen, alles darunter dreht sich mit. Setz ein End While dorthin, wo sie aufhören soll.",
    "w_open_for": "Zeile {line}: dieses For wird nie geschlossen, also dreht sich alles darunter mit. Setz ein End For dorthin, wo es aufhören soll.",
    "w_open_select": "Zeile {line}: Dieses Select wird nie geschlossen. Setz ein End Select dorthin, wo es aufhören soll.",
    "w_no_if": "Zeile {line}: End If, aber es ist kein If offen, das es schließen könnte.",
    "w_no_loop": "Zeile {line}: Das schließt eine Schleife, aber es ist keine offen.",
    "w_no_select": "Zeile {line}: End Select, aber es ist kein Select offen, das es schließen könnte.",
    "w_do_no_test": "Zeile {line}: Dieses Do bekommt nie eine Bedingung, es liefe also ewig. Schließ es mit Until ... oder Loop While ...",
    "w_until_alone": "Zeile {line}: Until, aber darüber steht kein Do und kein Repeat, das es beenden könnte.",
    "w_mend_change": "{word} in {instead} ändern",
    "w_mend_drop": "Zeile {line} entfernen",
    "w_mend_insert": "{text} in Zeile {line} einsetzen",
    "w_mend_tip": "Doppelklick, um das zu beheben",
    "w_mend_close": "Das fehlende {text} ans Ende setzen",
    "w_mend_all": "Alle {n} beheben",
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
    "f_open": "Dokument öffnen",
    "f_not_ours": "Das ist eine JSON-Datei, aber kein hier gespeicherter Entwurf.",
    "f_opened": "{name} geöffnet.",
    "f_empty": "Darin steht nichts.",
    "dl_copy": "Diagramm kopieren",
    "dl_copied": "Kopiert",
    "dl_copy_no": "Dieser Browser lässt eine Seite kein Bild in die "
                  "Zwischenablage legen. Lade es stattdessen herunter.",
    "l_copy": "Link dazu kopieren",
    "l_copied": "Link kopiert",
    "l_copy_no": "Dieser Browser hat ihn nicht kopiert. Nimm ihn aus der "
                 "Adresszeile.",
    "fd_head": "Wohin gespeichert wird",
    "fd_browser": "In die Downloads deines Browsers.",
    "fd_in": "In den Ordner {name}.",
    "fd_pick": "Ordner wählen",
    "fd_pick_tip": "Wähle einen Ordner oder leg im Fenster, das sich öffnet, "
                   "einen neuen an. Alles, was du hier speicherst, landet "
                   "dann direkt darin.",
    "fd_off": "Zurück zu den Downloads",
    "fd_cannot": "Dieser Browser speichert nur in seine Downloads. Chrome "
                 "oder Edge auf einem Computer können in einen Ordner deiner "
                 "Wahl speichern.",
    "fd_saved": "{name} in {folder} gespeichert",
    "fd_fell": "{folder} hat es nicht angenommen, darum liegt es in deinen "
               "Downloads.",
    "l_opened": "Aus einem Link geöffnet.",
    "l_long": "Dieser Link ist {n} Zeichen lang. Mail- und Chat-Programme "
              "kürzen lange Links, und ein gekürzter Link öffnet nichts "
              "— schick lieber die Datei.",
    "l_bad": "Dieser Link enthält kein Diagramm, das diese Seite lesen kann.",
    "sv_tab": "Zwischenstände",
    "sv_about": "Behält das Diagramm, den Lauf und die Stelle, an der er "
                "war, hier in diesem Browser. Platz ist für {n}.",
    "sv_save": "Fortschritt speichern",
    "sv_saved": "Gespeichert.",
    "sv_full": "Alle {n} sind belegt. Überschreibe einen oder lösche einen, "
               "um Platz zu machen.",
    "sv_nothing": "Auf der Seite gibt es noch nichts zu speichern.",
    "sv_no_room": "Der Browser wollte es nicht behalten: sein Speicher ist "
                  "voll oder ausgeschaltet.",
    "sv_empty": "Leer",
    "sv_load": "Laden",
    "sv_over": "Überschreiben",
    "sv_over_ask": "Das, was jetzt auf der Seite ist, an seine Stelle setzen?",
    "sv_over_yes": "Überschreiben",
    "sv_del_ask": "Diesen Stand endgültig löschen?",
    "sv_today": "Heute",
    "sv_st_none": "Noch nicht ausgeführt",
    "sv_st_ask": "Wartet auf eine Antwort",
    "sv_st_next": "Wartet auf den nächsten Schritt",
    "sv_st_going": "Mitten in einem Lauf",
    "sv_st_over": "Lauf beendet",
    "sv_back": "Weiter, wo du aufgehört hast.",
    "sv_moved": "Dieser Spielstand passt nicht mehr zum Programm, der Lauf "
                "konnte daher nicht fortgesetzt werden.",
    "sv_lost": "Das Programm in diesem Spielstand konnte nicht aus dem "
               "Speicher des Browsers gelesen werden.",
    "sv_no_draw": "Das Diagramm wurde nicht gezeichnet, also konnte der "
                  "Lauf nicht fortgesetzt werden.",
    "sv_stop_said": "Einen Stand zu laden ersetzt das laufende Programm. "
                    "Der Lauf wird angehalten.",
    "sv_stop_yes": "Anhalten und laden",
    "held_head": "Was es gerade hält",
    "held_in": "in {name}",
    "held_shared": "Außerhalb aller Module deklariert, also für jedes Diagramm sichtbar",
    "held_none": "noch nichts",
    "held_switch": "Zeigen, was es gerade hält",
    "h_tidy": "Aufräumen",
    "h_tidy_tip": "Jede Form dorthin stellen, wo diese Seite sie zeichnen "
                  "würde — Wörter, Farben und Pfeile bleiben",
    "h_tidied": "Aufgeräumt: {n} Formen verschoben.",
    "h_tidy_none": "Hier gibt es noch nichts aufzuräumen.",
    "h_write": "Als Pseudocode",
    "h_write_tip": "Die Zeichnung als den Pseudocode schreiben, auf den sie "
                   "hinausläuft",
    "h_into_box": "In das Feld schreiben",
    "h_into_box_tip": "Das hier in das Pseudocode-Feld schreiben und dort "
                      "weiterarbeiten. Die Zeichnung bleibt, wo sie ist; "
                      "was im Feld stand, wird überschrieben.",
    "s_no": "Lass es",
    "s_stop_head": "Es läuft noch",
    "s_stop_said": "Ein neues Diagramm ersetzt das Programm, das gerade "
                   "läuft. Der Lauf wird abgebrochen.",
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
    "shapes_for_hint": "Welche Form für welche Art von Schritt gezeichnet wird. Was der Schritt bedeutet, ändert sich nicht.",
    "size": "Größe",
    "width": "Breite",
    "height": "Höhe",
    "turn": "Drehen",
    "fit_words": "An den Text anpassen",
    "colors_here": "Farben",
    "odd_shape": "{pair} lässt sich nicht zeichnen -- siehe --help.",
    "mode_code": "Aus Pseudocode",
    "mode_hand": "Von Hand",
    "add_shape": "Form hinzufügen",
    "hand_hint": "Formen verschieben. Eine anklicken, dann Verbinden, dann die Form anklicken, zu der es weitergeht.",
    "words_in": "Text in der Form",
    "connect": "Verbinden",
    "connect_now": "Jetzt die Form anklicken, zu der es geht.",
    "goes_to": "Geht zu",
    "nothing_yet": "noch nichts",
    "delete": "Löschen",
    "check": "Entwurf prüfen",
    "checked_good": "Keine Probleme gefunden.",
    "problems": "{n} zum Ansehen",
    "h_info": "So zeichnest du von Hand",
    "h_add_how": "Klicke oben auf eine Form, um sie unter die aktuelle zu setzen, oder ziehe sie an die gewünschte Stelle auf dem Blatt. Basis, Ablauf, Daten und Weitere öffnen je ein Menü mit allen anderen Formen.",
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
    "hm_rule": "Die von den Regeln vorgeschlagene Form nehmen oder behalten (die gelbe Marke)",
    "hm_select": "Wähle unten Auswählen, dann wählt Ziehen über das Blatt Formen aus, statt dich zu bewegen – auch mit dem Finger.",
    "many_head": "{n} Formen ausgewählt",
    "as_chart": "Diagramm",
    "untitled": "Ohne Titel",
    "p_no_start": "Nichts beginnt den Ablauf: in jede Form führt etwas hinein.",
    "p_many_starts": "In {n} Formen führt nichts hinein. Ein Diagramm beginnt an einer Stelle.",
    "p_start_kind": "Die Form, mit der alles anfängt, sollte die Start-/Ende-Form sein ({shape}).",
    "p_no_end": "Es gibt kein Ende: keine Start-/Ende-Form ({shape}), an der der Ablauf aufhört.",
    "p_unreached": "Zu dieser Form führt nichts.",
    "p_dead_end": "Aus dieser Form führt nichts heraus, und sie ist kein Ende.",
    "p_decision_out": "Eine Entscheidung braucht zwei Ausgänge, einen je Antwort. Diese hat {n}.",
    "p_one_out": "Diese Form hat {n} Ausgänge. Nur eine Entscheidung darf mehr als einen haben.",
    "p_same_labels": "Beide Ausgänge dieser Entscheidung sagen dasselbe.",
    "p_no_label": "Ein Ausgang einer Entscheidung braucht ein Wort.",
    "p_trapped": "Kommt der Ablauf hierher, erreicht er nie ein Ende.",
    "p_empty": "In dieser Form steht nichts.",
    "p_overlap": "Diese Form liegt auf einer anderen.",
    "p_alone": "Diese Form ist mit nichts verbunden.",
    "p_line_through": "Eine Linie läuft mitten durch diese Form. Verschiebe eine von beiden etwas.",
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
    "rd_mark_dark": "Markierung dunkler, damit die Schrift lesbar ist.",
    "rd_mark_light": "Markierung heller, damit die Schrift lesbar ist.",
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
    "mv_said": "Neu aufbauen legt das Diagramm frisch an, und jeder verschobene Block kommt dorthin zurück, wo das Layout ihn hinsetzt. Rückgängig holt die Verschiebungen zurück.",
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
    "e_swap": "Zwei Zahlen tauschen",
    "e_factorial": "Eine Fakultät",
    "try_short": "Neu hier?",
    "try_go": "Beispiel ausprobieren",
    "e_area": "Fläche eines Rechtecks",
    "e_sumevens": "Die geraden addieren",
    "e_vowel": "Vokal oder nicht",
    "e_leap": "Schaltjahr",
    "e_backwards": "Rückwärts zählen",
    "eg_l4": "Programme für den Alltag",
    "eg_l5": "Größere Projekte",
    "e_bank": "Ein Bankkonto",
    "e_gradebook": "Ein Notenbuch",
    "e_paycheck": "Wöchentliche Lohnabrechnungen",
    "e_convert": "Ein Einheitenumrechner",
    "e_splitcheck": "Die Rechnung teilen",
    "e_vending": "Ein Snackautomat",
    "e_primelist": "Primzahlen bis zu einer Grenze",
    "e_weekday": "Welcher Wochentag?",
    "e_loan": "Einen Kredit abbezahlen",
    "e_rps": "Schere, Stein, Papier",
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
    "e_digits": "Wie viele Ziffern",
    "e_reverse": "Die Zahl rückwärts",
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
    "e_sentinel": "Zahlen, bis 0 kommt",
    "e_picktable": "Jede Reihe, die du willst",
    "eg_head": "Beispiele",
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
    "o_roomy": "Großzügig: aufgefächert, mit Platz um jeden Schritt",
    "o_tight": "Kompakt: weniger Symbole, zu einem dichten Block gefaltet",
    "o_columns": "Hohes Diagramm in Spalten umbrechen",
    "o_steady": "Jedes Mal dieselbe Zeichnung",
    "more": "Optionen", "more_tip": "Weitere Diagramm-Optionen",
    "decide": "Entscheidungen",
    "undo": "Rückgängig", "redo": "Wiederholen",
    "settings": "Einstellungen", "appearance": "Darstellung", "panel_side": "Seite des Panels",
    "side_left": "Links", "side_right": "Rechts", "full_screen": "Vollbild",
    "full_on": "Bildschirm füllen", "full_off": "Vollbild verlassen",
    "no_full": "Dieser Browser kennt kein Vollbild.",
    "app_install": "Als App installieren",
    "app_tip": "Ein Symbol auf deinem Startbildschirm oder bei deinen anderen "
               "Apps, in einem eigenen Fenster -- und es geht auch ohne "
               "Verbindung",
    "app_ios": "Tippe auf Teilen, dann auf Zum Home-Bildschirm.",
    "app_mac": "Wähle in Safari im Menü Ablage „Zum Dock hinzufügen“.",
    "app_done": "Installiert -- jetzt bei deinen anderen Apps, und es geht "
                "auch offline.",
    "p_ink": "Tinte", "p_classic": "Klassisch", "p_slate": "Schiefer",
    "p_meadow": "Wiese", "p_sunset": "Abendrot", "p_night": "Nacht", "p_lavender": "Lavendel",
    "p_charcoal": "Anthrazit", "p_ember": "Glut",
    "pseudocode": "Pseudocode", "title": "Titel", "your_name": "Dein Name",
    "code_big": "Bildschirm füllen", "code_small": "Zurück zum Panel", "done": "Fertig",
    "code_lines": "{n} Zeilen",
    "code_ask": "{name} eingeben: ",
    "code_shares": "was das Programm teilt",
    "c_head": "Code", "c_write": "Den Code schreiben",
    "c_one": "In einer Datei", "c_apart": "Mehrere Dateien",
    "c_files_tip": "Eine Datei, oder eine je Diagramm — und ein Diagramm aus einem einzigen Ablauf wird in Teile zerlegt, wenn es lang genug ist",
    "c_one_chart": "Zu kurz zum Aufteilen: es wird eine einzige Datei.",
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
    "k_hand": "Von Hand zeichnen",
    "k_build": "Diagramm zeichnen (von Hand: prüfen)",
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
    "py_gave_out": "Python ist in diesem Browser mitten in dieser Zeichnung abgebrochen ({err}).",
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
    "e_swap_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer merker
        Input a
        Input b
        merker = a
        a = b
        b = merker
        Display a
        Display b
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
    "e_backwards_p": program("""
        Start
        Declare Integer n
        Display "Ab welcher Zahl rückwärts zählen?"
        Input n
        For i = n To 1 Step -1
            Display i
        End For
        Display "Fertig"
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
    "e_digits_p": program("""
        Start
        Declare Integer n
        Declare Integer anzahl
        Display "Gib eine ganze Zahl ein"
        Input n
        anzahl = 0
        While n > 0
            n = n div 10
            anzahl = anzahl + 1
        End While
        Display "So viele Ziffern:"
        Display anzahl
        Stop
    """),
    "e_reverse_p": program("""
        Start
        Declare Integer n
        Declare Integer umgedreht
        Display "Gib eine ganze Zahl ein"
        Input n
        umgedreht = 0
        While n > 0
            umgedreht = umgedreht * 10 + n mod 10
            n = n div 10
        End While
        Display "Rückwärts ist das"
        Display umgedreht
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
    "e_area_p": program("""
        Start
        Declare Integer breite
        Declare Integer hoehe
        Display "Wie breit?"
        Input breite
        Display "Wie hoch?"
        Input hoehe
        Display "Die Fläche ist"
        Display breite * hoehe
        Stop
    """),
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
    "e_sentinel_p": program("""
        Start
        Declare Integer n
        Declare Integer summe
        Declare Integer anzahl
        summe = 0
        anzahl = 0
        Display "Bitte Zahlen. 0 zum Beenden."
        Input n
        While n <> 0
            summe = summe + n
            anzahl = anzahl + 1
            Input n
        End While
        If anzahl > 0 Then
            Display "Der Durchschnitt ist"
            Display summe / anzahl
        Else
            Display "Nichts, wovon man den Durchschnitt nehmen kann"
        End If
        Stop
    """),
    "e_picktable_p": program("""
        Start
        Declare Integer n
        Display "Welche Reihe? 0 zum Aufhören."
        Input n
        While n > 0
            For i = 1 To 12
                Display n * i
            End For
            Display "Welche Reihe? 0 zum Aufhören."
            Input n
        End While
        Display "Tschüss"
        Stop
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
    "e_convert_p": program("""
        Start
        Declare Integer wahl
        Declare Real menge
        Do
            Display "1 Meilen in Kilometer"
            Display "2 Pfund in Kilogramm"
            Display "3 Fahrenheit in Celsius"
            Display "4 Zoll in Zentimeter"
            Display "5 beenden"
            Input wahl
            If wahl >= 1 And wahl <= 4 Then
                Display "Wie viele?"
                Input menge
                Call umrechnen(wahl, menge)
            Else If wahl <> 5 Then
                Display "Wähle eine Zahl von 1 bis 5"
            End If
        Until wahl = 5
        Display "Auf Wiedersehen"
        Stop

        Module umrechnen(Integer welche, Real menge)
            Select Case welche
                Case 1
                    Display menge, " Meilen sind ", menge * 1.609, " Kilometer"
                Case 2
                    Display menge, " Pfund sind ", menge * 0.4536, " Kilogramm"
                Case 3
                    Display menge, " F sind ", (menge - 32) * 5 / 9, " C"
                Case Else
                    Display menge, " Zoll sind ", menge * 2.54, " Zentimeter"
            End Select
        End Module
    """),
    "e_splitcheck_p": program("""
        Start
        Declare Real rechnung
        Declare Real prozent
        Declare Integer personen
        Declare Real trinkgeld
        Display "Wie hoch ist die Rechnung?"
        Input rechnung
        While rechnung <= 0
            Display "Die Rechnung muss mehr als null sein"
            Input rechnung
        End While
        Display "Wie viel Prozent Trinkgeld? 15, 18 oder 20 sind üblich"
        Input prozent
        While prozent < 0 Or prozent > 100
            Display "Wähle einen Prozentsatz von 0 bis 100"
            Input prozent
        End While
        Display "Wie viele Personen teilen sich die Rechnung?"
        Input personen
        While personen < 1
            Display "Mindestens eine Person muss zahlen"
            Input personen
        End While
        trinkgeld = rechnung * prozent / 100
        Call beleg(rechnung, trinkgeld, personen)
        Stop

        Module beleg(Real essen, Real extra, Integer anzahl)
            Declare Real summe
            summe = essen + extra
            Display "Essen und Getränke: $", essen
            Display "Trinkgeld: $", extra
            Display "Summe: $", summe
            If anzahl = 1 Then
                Display "Du zahlst alles: $", summe
            Else
                Display "Jede der ", anzahl, " Personen zahlt $", summe / anzahl
            End If
        End Module
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
}

speaks("de", "Deutsch", DE)
