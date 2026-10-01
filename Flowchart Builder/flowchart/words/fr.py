"""Every word it says, in French."""
from ..words.lookup import program, speaks

FR = {
    "start": "Début", "end": "Fin", "ret": "Retour",
    "yes": "Vrai", "no": "Faux", "again": "encore ?",
    "key_oval": "Début / Fin", "key_rect": "Traitement",
    "key_io": "Entrée / Sortie", "key_diamond": "Décision",
    "key_hex": "Boucle", "key_sub": "Appeler un module",
    "palette": "Palette", "shapes": "Formes",
    # ---- the Style side: the words, the highlighter, the borders
    "t_head": "Texte", "t_face": "Police",
    "t_sans": "Simple", "t_serif": "Livre",
    "t_mono": "Code", "t_hand": "Plume",
    "t_size": "Taille", "t_smaller": "Plus petit",
    "t_bigger": "Plus grand", "t_bold": "Gras",
    "t_italic": "Italique", "t_under": "Souligné",
    "t_strike": "Barré", "t_color": "Couleur",
    "t_mark": "Surligné", "t_mark_none": "Sans surlignage",
    "cp_sat": "Saturation", "cp_bright": "Luminosité",
    "cp_recent": "Récentes", "cp_code": "Code couleur",
    "t_mark_own": "Autre couleur", "m_yellow": "Jaune",
    "m_green": "Vert", "m_pink": "Rose",
    "m_blue": "Bleu", "m_orange": "Orange",
    "t_weight": "Épaisseur des traits", "t_thin": "Fin",
    "t_normal": "Normal", "t_thick": "Épais",
    "t_border": "Bordure", "t_dashed": "Bordure en tirets",
    "t_copy_look": "Copier le style", "t_paste_look": "Coller le style",
    "t_size_list": "Choisir une taille",
    "selected": "Forme sélectionnée", "rest": "Lignes et papier",
    "fill": "Remplissage", "outline": "Contour", "text": "Texte",
    "paper": "Papier", "grid": "Grille", "show_grid": "Afficher la grille",
    "lines": "Lignes et flèches", "reset": "Rétablir tout le style",
    "download": "Télécharger", "dl_size": "Taille",
    "files": "Fichiers", "f_work_head": "Ton travail",
    "dl_svg": "Télécharger le SVG", "dl_png": "Télécharger le PNG",
    "print_it": "Imprimer le schéma",
    "dl_pdf": "Télécharger le PDF",
    "mm_open": "Texte Mermaid",
    "mm_tip": "Le schéma en Mermaid, à coller dans GitHub, Notion ou Markdown",
    "mm_head": "Mermaid",
    "mm_bad": "Impossible de lire ceci comme un organigramme Mermaid.",
    "mm_opened": "Ouvert comme dessin.",
    "print_head": "Imprimer",
    "print_go": "Imprimer…",
    "print_paper": "Papier",
    "print_wide": "À l’italienne",
    "print_fit": "Tenir sur une page",
    "print_note": "Impression en noir et blanc. Votre navigateur demande l’imprimante et le nombre de copies.",
    "panel": "Panneau", "panel_tip": "Afficher ou masquer le panneau",
    "png_tip": "Taille du PNG",
    "fit": "Ajuster", "actual": "Réel", "zoom_in": "Agrandir",
    "slide_left": "Gauche", "slide_right": "Droite", "slide_up": "Haut", "slide_down": "Bas",
    "hold_locked": "Fixé", "hold_loose": "Libre",
    "lock_tip": "Garder le schéma en place et défiler autour",
    "loose_tip": "Déplacez le schéma où vous voulez ; un coin reste toujours visible",
    "tool_move": "Déplacer",
    "tool_move_tip": "Glissez pour vous déplacer sur la feuille. Ctrl+glisser ou Maj+glisser sélectionne des formes.",
    "tool_select": "Sélectionner",
    "tool_select_tip": "Glissez sur la feuille pour sélectionner des formes. Cliquez des formes pour les ajouter ou les retirer.",
    "zoom_out": "Réduire", "pixels": "pixels",
    "dl_scale": "Fois la taille dessinée",
    "dl_frame": "Ajusté dans une image",
    "png_over": "plus que ce navigateur ne peut dessiner",
    "click_shape": "Cliquez sur une forme pour ne mettre en forme qu’elle.",
    "palette_hint": "Une palette colore toutes les formes. Vos changements ensuite restent.",
    "shapes_hint": "Remplissage et contour, pour toutes les formes de ce type.",
    "apply_all": "Appliquer aux {n} formes : {what}", "clear": "Effacer",
    "rendering": "Rendu…",
    "png_big": "Ce PNG est trop grand pour le navigateur. Essayez plus petit, ou enregistrez le SVG.",
    "png_fail": "Le PNG n’a pas pu être créé. Le téléchargement du SVG fonctionne toujours.",
    "png_capped": "{want}× est trop grand pour le navigateur ; le PNG est enregistré à {got}× ({w} × {h} pixels).",
    "flowchart": "Organigramme",
    "r_head": "Exécuter",
    "r_run": "Lancer",
    "r_stop": "Arrêter",
    "r_code": "En code", "r_lang_pick": "Dans quel langage le code est écrit",
    "r_pseudo": "Pseudocode",
    "r_slowly": "Pas à pas",
    "r_enter": "Entrer",
    "r_hint": "Exécute le programme de l’organigramme : il demande, affiche et éclaire chaque forme. Choisissez un langage pour le voir en code.",
    "r_started": "Exécution...",
    "r_done": "Terminé.",
    "r_nothing": "Rien à exécuter pour l’instant.",
    "r_steps": "{n} étapes, {ms} ms.",
    "r_forever": "Cela tourne depuis trop longtemps : une boucle ne finit jamais.",
    "r_zero": "Cela divise par zéro.",
    "r_unknown": "Rien n'a encore été mis dans {name}.",
    "r_odd_op": "Je ne sais pas quoi faire de {op}.",
    "r_half": "Cela ne se lit pas comme un tout : {bit}",
    "r_back": "Retour à l’exécution", "back": "Retour",
    "r_by_hand": "Lancer s’active dès que le schéma fonctionne.",
    "h_no_start": "Il n’y a aucune forme par laquelle commencer.",
    "h_tangled": "Ces boucles se croisent : impossible d’en écrire un programme.",
    "h_not_a_program": "Ces formes ne se lisent pas comme un programme.",
    "r_build_first": "Construisez un organigramme à partir de pseudocode pour l’exécuter ici.",
    "r_copy": "Copier",
    "r_copied": "Copié",
    "r_copy_no": "À copier à la main",
    "r_save_code": "Enregistrer",
    "r_file": "{name} sortie",
    "r_pseudo_only": "Choisissez Python, Java, C# ou JavaScript pour voir le code.",
    # ---- où l'exécution a échoué, et ce que la lecture a dû rattraper
    "r_at": "Ligne {line}",
    "r_show_line": "Montre-moi la ligne d'où cela vient",
    "r_in_mod": "dans {name}, appelé depuis la ligne {line}",
    "r_in_mod_only": "dans {name}",
    "r_mean": "Vouliez-vous dire {name} ?",
    "r_unknown_fn": "Il n'existe aucun module ni aucune fonction nommée {name}.",
    "r_odd_here": "Je ne m'attendais pas à {bit} ici.",
    "r_empty_expr": "Il n'y a rien ici pour le calculer.",
    "r_left_over": "Il reste {bit} à la fin, sans rien à quoi le rattacher.",
    "r_open_quote": "Ce texte n'est jamais refermé : il manque un guillemet.",
    "r_open_bracket": "Cette parenthèse est ouverte et jamais refermée.",
    "r_shut_bracket": "Cette parenthèse en referme une qui n'a jamais été ouverte.",
    "r_no_idea": "Cette ligne est illisible : l’exécution l’a sautée.",
    "r_stepped_over": "Des lignes ont été sautées : l’affichage est peut-être incomplet.",
    "r_too_deep": "{name} s’est appelé trop de fois et ne s’arrête jamais.",
    "r_args": "{name} demande {want} et en a reçu {got}.",
    "r_no_main": "Pas de flux principal : l’exécution a commencé dans {name}.",
    "r_no_item": "Il n’y a pas d’élément {at} ici : il en contient {n}.",
    "r_no_key": "Il n’y a rien sous {key}.",
    "r_no_field": "Il n’y a pas de {name} ici.",
    "r_no_items": "Seuls une liste, un mot ou une table ont des éléments à prendre, et ceci est {what}.",
    "r_whole_at": "Un élément se choisit par un nombre entier, pas par {at}.",
    "r_open_square": "Ce [ est ouvert et jamais fermé.",
    "r_empty_list": "La liste est vide : il n’y a rien à en retirer.",
    "r_not_in_list": "{item} n’est pas dans la liste.",
    "r_needs_list": "{name} a besoin d’une liste.",
    "w_head": "À regarder",
    "w_found": "{n} à regarder dans le pseudocode :",
    "w_open_if": "Ligne {line} : ce If n’est jamais refermé. Ajoutez un End If là où il doit s’arrêter.",
    "w_open_loop": "Ligne {line} : cette boucle n’est jamais refermée. Ajoutez un End While là où elle doit s’arrêter.",
    "w_open_for": "Ligne {line} : ce For n’est jamais fermé. Ajoutez un End For là où il doit s’arrêter.",
    "w_open_select": "Ligne {line} : ce Select n'est jamais refermé. Ajoutez un End Select là où il doit s'arrêter.",
    "w_no_if": "Ligne {line} : End If, mais aucun If n’est ouvert.",
    "w_no_loop": "Ligne {line} : ceci referme une boucle, mais aucune boucle n'est ouverte.",
    "w_exit_alone": "Ligne {line} : Exit sort d'une boucle, mais aucune boucle n'est ouverte ici.",
    "w_no_select": "Ligne {line} : End Select, mais aucun Select n’est ouvert.",
    "w_do_no_test": "Ligne {line} : ce Do n’a pas de test et ne s’arrête jamais. Terminez-le par Until ... ou Loop While ...",
    "w_until_alone": "Ligne {line} : Until, mais ni Do ni Repeat au-dessus.",
    "w_mend_change": "Remplacer {word} par {instead}",
    "w_mend_drop": "Retirer la ligne {line}",
    "w_mend_insert": "Mettre {text} à la ligne {line}",
    "w_mend_tip": "Double-cliquez pour corriger",
    "w_mend_close": "Mettre le {text} manquant à la fin",
    "w_mend_cut": "Retirer {text}",
    "w_mend_put": "Ajouter {text}",
    "w_mend_all": "Corriger les {n}",
    "n_rect": "Rectangle",
    "an_arrow": "Flèche",
    "word_on_it": "Mot dessus",
    "thickness": "Épaisseur",
    "color_of_it": "Couleur",
    "dashed": "Pointillés",
    "with_head": "Pointe",
    "turn_it_round": "Inverser",
    "m_type": "Écrire dedans",
    "m_copy": "Dupliquer",
    "c_fill": "Couleur de fond", "c_line": "Couleur du bord", "c_words": "Couleur du texte",
    "c_clear": "Aucun style propre",
    "m_solid": "Trait plein",
    "m_no_word": "Aucun mot",
    "m_fit": "Ajuster à l'écran",
    "m_clip_copy": "Copier",
    "m_clip_cut": "Couper",
    "m_clip_paste": "Coller",
    "m_all": "Tout sélectionner",
    "m_pin": "Garder ces côtés",
    "m_unpin": "Le laisser trouver ses côtés",
    "sel_bar": "Que faire de la sélection",
    "f_save": "Enregistrer dans un fichier",
    "f_open": "Ouvrir un fichier",
    "f_not_ours": "Ce fichier JSON n’est pas un schéma enregistré ici.",
    "f_opened": "{name} est ouvert.",
    "f_empty": "Il n’y a rien d’écrit dedans.",
    "f_open_tip": "Du code, du pseudocode, un organigramme de draw.io, Lucidchart, Visio ou Excalidraw, ou une image d’organigramme. Tu peux aussi déposer des fichiers sur la page, ou coller une image.",
    "f_folder": "Ouvrir un dossier",
    "f_folder_tip": "Un dossier de code, de pseudocode ou d’organigrammes. Un zip marche aussi.",
    "in_head": "Quoi ouvrir",
    "in_from": "Dans {name}",
    "in_cancel": "Annuler",
    "in_all": "Les {n}, en un seul programme",
    "in_files": "{n} fichiers",
    "in_skipped": "{n} autres fichiers laissés de côté.",
    "in_skipped_one": "Un autre fichier laissé de côté.",
    "in_paste_head": "Ouvrir l’image collée",
    "in_paste_said": "Elle devient un nouvel organigramme, à la place de ce qui est ici.",
    "in_paste_yes": "L’ouvrir",
    "in_nothing": "Il n’y a là ni code, ni pseudocode, ni organigramme.",
    "in_cannot": "Ce type de fichier ne s’ouvre pas ici.",
    "in_unread": "Impossible de lire ceci comme un organigramme.",
    "in_many": "Les {n} premiers fichiers sont ouverts.",
    "in_old": "Ce navigateur ne sait pas décompresser cela. Essaie un navigateur plus récent.",
    "in_looking": "Ouverture…",
    "in_again": "Autre chose dans {name}",
    "in_again_plain": "En ouvrir un autre",
    "in_picture": "Image",
    "in_design": "Enregistré ici",
    "in_drop": "Déposer pour ouvrir",
    "in_drop_more": "Du code, du pseudocode, un organigramme, une image d’organigramme, un dossier ou un zip",
    "pic_looking": "Examen de l’image…",
    "pic_words": "Lecture des mots, {n} sur {m}…",
    "pic_labels": "Lecture des mots sur les flèches…",
    "pic_read": "{name} est lu. Vérifie les mots.",
    "pic_unread": "Les formes de {name} sont lues. Tape les mots : les lire demande une connexion.",
    "pic_none": "Aucun organigramme trouvé dans cette image.",
    "pic_bad": "Impossible d’ouvrir cette image.",
    "dl_copy": "Copier le schéma",
    "dl_copied": "Copié",
    "dl_copy_no": "Ce navigateur ne peut pas copier d’images. Télécharge-la plutôt.",
    "l_copy": "Copier un lien vers ceci",
    "l_copied": "Lien copié",
    "l_copy_no": "Copie impossible. Prends-le dans la barre d’adresse.",
    "fd_head": "Où enregistrer",
    "fd_browser": "Dans les téléchargements de ton navigateur.",
    "fd_in": "Dans le dossier {name}.",
    "fd_pick": "Choisir un dossier",
    "fd_pick_tip": "Choisis ou crée un dossier. Tout ce que tu enregistres y va directement.",
    "fd_off": "Revenir aux téléchargements",
    "fd_cannot": "Ce navigateur n’enregistre que dans les téléchargements. Chrome ou Edge sur ordinateur peuvent choisir un dossier.",
    "fd_saved": "{name} enregistré dans {folder}",
    "fd_fell": "{folder} ne l’a pas accepté : il est dans les téléchargements.",
    "l_opened": "Ouvert depuis un lien.",
    "l_long": "Ce lien fait {n} caractères. Les messageries peuvent le couper : envoie plutôt le fichier.",
    "l_bad": "Ce lien ne porte aucun schéma que cette page sache lire.",
    "sv_tab": "Progression",
    "sv_about": "Garde l’organigramme, l’exécution et où elle en était, dans ce navigateur. Place pour {n}.",
    "sv_save": "Enregistrer la progression",
    "sv_saved": "Enregistré.",
    "sv_full": "Les {n} sont occupées. Enregistrez par-dessus l’une d’elles ou supprimez-en une.",
    "sv_nothing": "Rien à enregistrer pour l’instant.",
    "sv_no_room": "Le navigateur ne l’a pas gardé : stockage plein ou désactivé.",
    "sv_empty": "Vide",
    "sv_load": "Charger",
    "sv_over": "Remplacer",
    "sv_over_ask": "Remplacer cette sauvegarde par ce qui est sur la page ?",
    "sv_over_yes": "La remplacer",
    "sv_del_ask": "Supprimer cette sauvegarde pour de bon ?",
    "sv_today": "Aujourd’hui",
    "sv_st_none": "Pas encore exécuté",
    "sv_st_ask": "Attend une réponse",
    "sv_st_next": "Attend l’étape suivante",
    "sv_st_going": "En cours d’exécution",
    "sv_st_over": "Exécution terminée",
    "sv_back": "Reprise là où vous en étiez.",
    "sv_moved": "Cette sauvegarde ne correspond plus au programme : "
                "l’exécution n’a pas pu reprendre.",
    "sv_lost": "Le programme de cette sauvegarde n’a pas pu être relu "
               "depuis le stockage du navigateur.",
    "sv_no_draw": "L’organigramme ne s’est pas dessiné, donc l’exécution "
                  "n’a pas pu reprendre.",
    "sv_stop_said": "Charger une sauvegarde remplace le programme en cours : l’exécution sera arrêtée.",
    "sv_stop_yes": "Arrêter et charger",
    "held_head": "Ce qu’il retient",
    "held_in": "dans {name}",
    "held_shared": "Déclaré hors de tout module, donc visible par chaque schéma",
    "held_none": "rien encore",
    "held_switch": "Montrer ce qu’il retient",
    "tests_open": "Le tester",
    "tests_tip": "Des tests à lui : ce qu’on tape et ce qu’il doit afficher",
    "tests_head": "Tests",
    "tests_one": "Test {n}",
    "tests_typed": "Ce qu’on tape, une par ligne",
    "tests_want": "Doit afficher, une ligne chacune",
    "tests_add": "Ajouter un test",
    "tests_run": "Lancer les tests",
    "tests_drop": "Retirer",
    "tests_pass": "Réussi",
    "tests_fail": "Échoué",
    "tests_all": "{pass} sur {n} réussis",
    "tests_none": "Écris d’abord un test.",
    "tests_diff": "Ligne {n} : il a affiché « {got} », pas « {want} ».",
    "tests_short": "Il a affiché {n} lignes, pas {m}.",
    "tests_long": "Il a affiché {n} lignes, pas {m}.",
    "tests_broke": "Il s’est arrêté sur une erreur.",
    "graphs_on": "Graphique de ce qu’il affiche",
    "graphs_tip": "Tracer un graphique sous une liste ou une suite de nombres que le programme affiche",
    "trace_open": "Table de trace",
    "trace_tip": "Chaque changement fait par l’exécution, pas à pas, en tableau",
    "trace_head": "Table de trace",
    "trace_line": "Ligne",
    "trace_out": "Sortie",
    "trace_none": "Lance le programme : la table se remplit au fur et à mesure.",
    "trace_rows": "{n} étapes",
    "trace_cut": "seules les {n} premières gardées",
    "bp_add": "Faire une pause ici",
    "bp_drop": "Ne plus faire de pause ici",
    "bp_clear": "Retirer toutes les pauses",
    "r_paused": "En pause à la ligne {n}.",
    "r_paused_hand": "En pause.",
    "h_tidy": "Ranger",
    "h_tidy_tip": "Disposer formes et flèches comme un schéma tiré du pseudocode",
    "h_tidied": "Rangé : {n} formes déplacées.",
    "h_tidy_none": "Rien à ranger pour l’instant.",
    "h_tidy_done": "Déjà rangé.",
    "h_write": "En pseudocode",
    "h_write_tip": "Voir le pseudocode de ce dessin",
    "h_into_box": "Le mettre dans le cadre",
    "h_into_box_tip": "Mettre ceci dans le cadre de pseudocode, à la place de ce qui s’y trouve. Le dessin reste.",
    "s_no": "Laisse",
    "s_stop_head": "Le programme tourne encore",
    "s_stop_said": "Un nouveau schéma remplace le programme en cours : l’exécution sera arrêtée.",
    "s_stop_yes": "Arrêter et dessiner",
    "n_roundrect": "Boîte arrondie",
    "n_offpage": "Hors page", "n_loop": "Limite de boucle", "n_parallel": "En parallèle",
    "n_text": "Texte", "n_actor": "Personne", "n_callout": "Bulle",
    "n_cube": "Cube", "n_step": "Étape", "n_table": "Tableau",
    "n_stored": "Stocké à l’intérieur", "n_cloud": "Nuage",
    "n_card": "Carte",
    "n_note": "Note",
    "n_docs": "Pages",
    "n_manual": "Saisie manuelle",
    "n_screen": "Écran",
    "n_arrow": "Flèche",
    "n_io_back": "Parallélogramme inversé",
    "n_oval": "Ovale",
    "n_io": "Parallélogramme",
    "n_diamond": "Losange",
    "n_hex": "Hexagone",
    "n_sub": "Boîte à barres",
    "n_trap": "Trapèze",
    "n_doc": "Document",
    "n_store": "Tambour",
    "n_delay": "Attente",
    "n_circle": "Cercle",
    "shapes_for": "Forme de chaque type",
    "shapes_for_hint": "Quelle forme prend chaque type d’étape. Ce que fait l’étape ne change pas.",
    "size": "Taille",
    "width": "Largeur",
    "height": "Hauteur",
    "turn": "Tourner",
    "fit_words": "Ajuster au texte",
    "colors_here": "Couleurs",
    "odd_shape": "Impossible de dessiner {pair} ; voir --help.",
    "mode_code": "Pseudocode",
    "mode_hand": "Organigramme",
    "mode_lang": "Code",
    # ---- un programme raconté en mots, et le pseudocode qui en est tiré
    "told_head": "Pseudocode mis à jour",
    "told_tip": "Vos mots lus comme pseudocode. L’organigramme en est tiré.",
    "told_yours": "Ce que vous avez écrit",
    # ---- le programme dans un langage, relu en pseudocode
    "lang_head": "Votre code",
    "lang_pick": "Le langage : reconnu dans le code, ou choisissez-en un",
    "lang_auto": "Reconnaître le langage",
    "lang_auto_is": "Reconnu : {lang}",
    "lang_file_add": "Ajouter un fichier",
    "lang_file_tip": "Double-cliquez pour renommer",
    "lang_file_drop": "Retirer ce fichier",
    "lang_drop_ask": "Retirer {name} ?",
    "lang_drop_said": "Son code part avec lui.",
    "lang_place": "Écrivez ou collez un programme en Python, Java, C#, C++, JavaScript, TypeScript, C, Kotlin, Swift, Go ou Rust, puis cliquez sur Dessiner.",
    "lang_stale": "Le pseudocode a changé depuis.",
    "lang_rewrite": "Réécrire en {lang}",
    "lang_rewrite_tip": "Remplace le code par le pseudocode écrit en {lang}",
    "lang_made": "Créé à partir de votre code. Modifiez-le sous Pseudocode.",
    "lang_line": "Ligne {n} : {said}",
    "lang_check": "Vérifier",
    "lang_check_tip": "Lire le code et dire si quelque chose ne va pas",
    "lang_fix": "Ajouter {what}",
    "lang_fix_at": "Ajouter {what} à la ligne {line}",
    "lang_fix_many": "Ajouter les {n} {what} manquants",
    "lang_fix_tip": "Ctrl+Z le retire",
    "lang_fix_cut": "Retirer {what}",
    "lang_fix_cut_at": "Retirer {what} à la ligne {line}",
    "lang_fix_change": "Remplacer {word} par {instead}",
    "lang_fix_change_at": "Remplacer {word} par {instead} à la ligne {line}",
    "lang_fix_indent": "Aligner la ligne {line}",
    "lang_fix_call": "En faire {name}(…)",
    "lang_fix_all": "Tout corriger",
    "lang_fix_all_tip": "Corrige l'une après l'autre tout ce qui peut l'être",
    "cm_empty": "Écrivez d’abord du code.",
    "cm_expected": "{what} attendu ici.",
    "cm_ended": "le code s’arrête avant d’être terminé.",
    "cm_odd": "{bit} inattendu ici.",
    "cm_indent": "l’indentation ne correspond pas.",
    "cm_open": "un guillemet ou un commentaire n’est jamais fermé.",
    "cm_lists": "ce genre de liste ne peut pas encore être dessiné.",
    "cm_class": "les classes et les objets ne peuvent pas être dessinés.",
    "cm_lambda": "une fonction sans nom ne peut pas être dessinée.",
    "cm_nested_fn": "une fonction dans une fonction ne peut pas être dessinée.",
    "cm_break": "break ne marche qu’au début ou à la fin d’une boucle.",
    "cm_continue": "continue ne peut pas être dessiné.",
    "cm_input_where": "mettez d’abord la saisie dans une variable.",
    "cm_twice": "{name} est défini deux fois.",
    "cm_other": "{bit} ne peut pas être dessiné.",
    "cm_wont_run": "Ligne {n} : {bit} est dessiné, mais ne peut pas être exécuté.",
    "cm_if_wrong": "Si {what} se produit ici, le code fait plutôt ceci :",
    "cm_an_error": "une erreur",
    "add_shape": "Ajouter une forme",
    "hand_hint": "Déplacez les formes. Cliquez sur l’une, puis sur Relier, puis sur la suivante.",
    "words_in": "Texte de la forme",
    "connect": "Relier",
    "connect_now": "Cliquez maintenant sur la forme où cela va.",
    "goes_to": "Va vers",
    "nothing_yet": "rien encore",
    "delete": "Supprimer",
    "check": "Vérifier le schéma",
    "checked_good": "Aucun problème trouvé.",
    "problems": "{n} choses à revoir",
    "problems_more": "et {n} de plus",
    "h_too_many": "Trop de formes (maximum {n})",
    "h_info": "Comment dessiner un organigramme",
    "h_add_how": "Cliquez sur une forme pour l’ajouter sous celle en cours, ou faites-la glisser sur la feuille. Base, Flux, Données et Autres en ont d’autres.",
    "h_mouse": "Souris et tactile",
    "h_keys": "Touches",
    "h_all_keys": "Tous les raccourcis clavier",
    "hm_pick": "Choisir une forme ou une flèche",
    "hm_move": "Déplacer une forme, ou toutes celles sélectionnées",
    "hm_size": "Agrandir ou réduire la forme choisie",
    "hm_turn": "Faire pivoter la forme choisie à n'importe quel angle (Maj : par pas de 15°)",
    "hm_join": "Tracer une flèche vers une autre forme",
    "hm_type": "Écrire dans une forme ou sur une flèche",
    "hm_menu": "Voir tout ce que vous pouvez en faire",
    "hm_zoom": "Zoomer ou dézoomer",
    "hm_rule": "Prendre la forme suggérée par les règles, ou garder celle-ci (marque ambre)",
    "hm_select": "Choisissez Sélectionner en bas, puis glissez sur la feuille pour sélectionner des formes, même au doigt.",
    "many_head": "{n} formes sélectionnées",
    "as_chart": "Organigramme",
    "untitled": "Sans titre",
    "p_no_start": "Rien ne commence le flux : chaque forme a une flèche entrante.",
    "p_many_starts": "{n} formes n’ont aucune entrée. Un organigramme commence à un seul endroit.",
    "p_start_kind": "La première forme devrait être Début / Fin ({shape}).",
    "p_no_end": "Il n’y a pas de Fin ({shape}) où le flux s’arrête.",
    "p_unreached": "Rien ne mène à cette forme.",
    "p_dead_end": "Rien ne sort de cette forme, et ce n'est pas une Fin.",
    "p_decision_out": "Une décision a au moins deux sorties. Celle-ci en a {n}.",
    "p_one_out": "Cette forme a {n} sorties. Seule une décision peut en avoir deux.",
    "p_same_labels": "Deux sorties disent la même chose.",
    "p_no_label": "Chaque sortie d’une décision a besoin d’une étiquette.",
    "p_trapped": "D’ici, le flux ne peut jamais atteindre une Fin.",
    "p_empty": "Rien n'est écrit dans cette forme.",
    "p_overlap": "Cette forme est posée sur une autre.",
    "p_alone": "Cette forme n'est reliée à rien.",
    "p_line_through": "Une ligne traverse cette forme. Déplacez un peu l'une ou l'autre.",
    "hf_start": "Mettre un Début au-dessus",
    "hf_end": "Ajouter une Fin et y relier le flux",
    "hf_to_end": "La relier à la Fin",
    "hf_write": "Écrire {word} dedans",
    "hf_type": "Écrire dedans",
    "hf_arrow": "Tirer une flèche depuis elle",
    "hf_yes_no": "Les nommer {yes} et {no}",
    "hf_label": "Nommer l'autre {word}",
    "hf_relabel": "Changer la deuxième en {word}",
    "hf_apart": "L'écarter",
    "hf_clear": "L'écarter de la ligne",
    "hf_join": "La relier à la forme du dessus",
    "hf_join_all": "Les relier aux formes du dessus",
    "hf_out": "Tracer son autre sortie",
    "hf_decide": "En faire une décision",
    "hf_drop_way": "Retirer les flèches en trop",
    "hf_name_way": "Écrire sur la flèche",
    "hp_next": "Ajouter l'étape suivante",
    "hp_what_next": "Qu'est-ce qui suit ?",
    "hp_into": "Y mettre une étape",
    "m_colors": "Couleurs", "m_format": "Format de la forme…", "m_more_shapes": "Autres formes",
    "sg_basic": "Base", "sg_flow": "Flux", "sg_data": "Données", "sg_other": "Autres",
    "hr_head": "Règles des formes",
    "hr_says": "Ceci ressemble à « {role} ». Les règles des formes utilisent pour cela : {shape}.",
    "hr_change": "Changer en {shape}",
    "hr_keep": "Garder tel quel",
    "rs_card": "Rétablir les valeurs par défaut",
    "rd_tip": "Couleur changée pour rester lisible",
    "rd_head": "Plus facile à lire",
    "rd_keep": "Garder cette couleur",
    "rd_ignore": "Ignorer",
    "rd_words_dark": "Texte assombri pour ressortir.",
    "rd_words_light": "Texte éclairci pour ressortir.",
    "rd_edge_dark": "Bordure assombrie pour se voir sur la feuille.",
    "rd_edge_light": "Bordure éclaircie pour se voir sur la feuille.",
    "rd_lines_dark": "Flèches assombries pour se voir sur la feuille.",
    "rd_lines_light": "Flèches éclaircies pour se voir sur la feuille.",
    "rd_said_dark": "Texte des flèches assombri pour se voir sur la feuille.",
    "rd_said_light": "Texte des flèches éclairci pour se voir sur la feuille.",
    "hr_tip": "Les règles des formes suggèrent une autre forme",
    "hl_head": "Aligner",
    "hl_left": "Aligner les bords gauches",
    "hl_center": "Aligner les centres",
    "hl_right": "Aligner les bords droits",
    "hl_top": "Aligner les hauts",
    "hl_middle": "Aligner les milieux",
    "hl_bottom": "Aligner les bas",
    "hl_across": "Répartir en largeur",
    "hl_down": "Répartir en hauteur",
    "mv_head": "Remettre les blocs déplacés ?",
    "mv_said": "Reconstruire refait la mise en page : les blocs déplacés reviennent. Annuler peut les ramener.",
    "mv_yes": "Construire quand même",
    "side_chart": "Schéma", "side_colors": "Style", "hide_panel": "Masquer le panneau", "show_panel": "Afficher le panneau",
    "theme": "Clair ou sombre", "theme_auto": "Auto", "theme_light": "Clair", "theme_dark": "Sombre",
    "puzzles": "Défis",
    "pz_one": "Défi {n}",
    "pz_head": "Défis",
    "pz_l1": "Trouve l’erreur",
    "pz_l2": "Fais-le marcher",
    "pz_l3": "Construis-le",
    "pz_check": "Vérifier",
    "pz_right": "Résolu.",
    "pz_wrong": "Pas encore. Avec {give} il a dit {said}.",
    "pz_next": "Énigme suivante", "pz_next_level": "Niveau suivant",
    "pz_job": "Ce qu’il doit faire", "pz_now": "Ce qu’il fait",
    "pz_reset": "Recommencer", "pz_all": "Tous les défis",
    "pz_broke": "Il s’est arrêté avant la fin. On lui a donné {give}.",
    "pz_none": "Il n’y a encore rien à vérifier.",
    "pz_locked": "Résous-en {n} de plus pour ouvrir ceux-ci",
    "pz_done": "{done} sur {all} résolus",
    "pz_nothing": "(rien)",
    "pz_brief": "Le défi",
    "z_greet_b": "Il salue avant d’avoir demandé qui. Demander d’abord, saluer ensuite.",
    "z_range_b": "De 1 à 9 devrait être dans l’intervalle. Pour l’instant tout l’est.",
    "z_double_b": "Il devrait afficher le double du nombre donné.",
    "z_order_b": "Il devrait afficher le total final, 6, et rien en chemin.",
    "z_until_b": "Il devrait compter 1, 2, 3 puis s’arrêter.",
    "z_nested_b": "Deux lignes de deux : 1, 2, 2, 4. La boucle intérieure en manque une.",
    "z_param_b": "afficher() affiche la lettre x au lieu du nombre qu’on lui a passé.",
    "z_many_b": "Sur les cinq nombres tapés, il devrait dire combien dépassent 10.",
    "z_divide_b": "Il additionne quatre nombres, donc la moyenne se fait sur quatre, pas cinq.",
    "z_sign_b": "Au-dessus de zéro c’est positif, en dessous négatif, et zéro c’est « zéro ».",
    "z_twice_b": "Il devrait afficher le mot deux fois.",
    "z_minus_b": "Il devrait retirer le deuxième nombre du premier.",
    "z_early_b": "Il affiche la réponse avant de la calculer. Il devrait afficher le triple.",
    "z_never_b": "Il devrait compter de 5 à 1. Pour l’instant il n’affiche rien.",
    "z_odds_b": "Il devrait additionner les pairs de 1 à 10, soit 30.",
    "z_asked_b": "Il devrait demander trois nombres et additionner ces trois-là.",
    "z_onemore_b": "Il devrait additionner de 1 à 10, soit 55.",
    "z_valid_b": "Il devrait redemander jusqu’à un nombre de 1 à 10, puis l’afficher.",
    "z_smallest_b": "Il devrait afficher le plus grand des quatre nombres tapés.",
    "z_short_b": "additionne() prend deux nombres. On ne lui en donne qu’un.",
    "z_stops_b": "Il devrait afficher de 5 à 1 puis « partez ».",
    "pz_l4": "Fautes plus dures",
    "pz_l5": "Vrais bugs",
    "z_fizz_b": "15 doit dire FizzBuzz. Les tests sont dans le mauvais ordre.",
    "z_prime_b": "Un premier a exactement deux diviseurs. Ici 1 compte comme premier.",
    "z_digits_b": "Il doit dire combien de chiffres a le nombre. 7 en a un.",
    "z_revzero_b": "Il doit retourner les chiffres. 123 devient 321.",
    "z_sumd_b": "Il doit additionner les chiffres du nombre. 123 donne 6.",
    "z_gridrow_b": "Trois lignes : 1 2 3, puis 2 4 6, puis 3 6 9. La ligne ne change jamais.",
    "z_tri_b": "Il doit montrer chaque nombre triangulaire : 1, 3, 6, 10.",
    "z_lowhigh_b": "Il doit montrer le plus petit puis le plus grand des quatre nombres.",
    "z_starsrow_b": "Ligne un une étoile, ligne deux deux étoiles, et ainsi de suite.",
    "z_factloop_b": "Tout fois zéro fait zéro. 4 factorielle fait 24.",
    "z_report_b": "Cinq notes entrent, donc la moyenne se fait sur cinq.",
    "z_tries_b": "Trois essais pour le mot de passe, puis bloqué.",
    "z_discount_b": "Au-dessus de 50, dix pour cent de remise : 60 doit faire 54.",
    "z_convert_b": "C vers F : neuf cinquièmes puis plus 32. 100 C font 212 F.",
    "z_tie_b": "À voix égales, il faut dire qu’il y a égalité.",
    "z_fibstep_b": "Il doit montrer 0, 1, 1, 2, 3. Les deux nombres bougent dans le mauvais ordre.",
    "z_coins_b": "132 cents font 1 dollar, 3 dizaines et 2 pennies.",
    "z_score_b": "Une bonne réponse vaut un point, une mauvaise rien.",
    "z_sent_b": "Des nombres jusqu’à 0, puis la moyenne de ceux d'avant.",
    "z_menu0_b": "0 doit l’arrêter. Pour l’instant il recommence.",
    "z_else_b": "Les moins de 18 ans n’ont droit à rien. Il faudrait dire « dehors ».",
    "z_swap_b": "Plus de 10 c’est grand, 10 ou moins c’est petit. Ici c’est inversé.",
    "z_count_b": "Il devrait compter de 1 à 5.",
    "z_forever_b": "Il devrait afficher 3, 2, 1 puis « partez ». Pour l’instant il ne s’arrête jamais.",
    "z_total_b": "Il devrait additionner 1, 2, 3 et 4 et afficher 10.",
    "z_two_b": "Il devrait additionner deux nombres et afficher le résultat.",
    "z_return_b": "doubler() devrait renvoyer le nombre doublé pour que Display l’affiche.",
    "z_evens_b": "Il devrait afficher seulement les nombres pairs de 1 à 10.",
    "z_grade_b": "60 est reçu. Pour l’instant 60 échoue.",
    "e_add": "Additionner deux nombres",
    "e_oddeven": "Pair ou impair",
    "e_guess": "Devine le nombre",
    "e_swap": "Échanger deux nombres",
    "e_factorial": "Une factorielle",
    "try_short": "Vous débutez ?",
    "try_go": "Essayer un exemple",
    "e_sumevens": "Additionner les pairs",
    "e_vowel": "Voyelle ou non",
    "e_leap": "Année bissextile",
    "eg_l4": "Programmes du quotidien",
    "eg_l5": "Projets plus grands",
    "e_bank": "Un compte bancaire",
    "e_gradebook": "Un carnet de notes",
    "e_paycheck": "Les paies de la semaine",
    "e_vending": "Un distributeur automatique",
    "e_primelist": "Nombres premiers jusqu’à une limite",
    "e_weekday": "Quel jour de la semaine ?",
    "e_loan": "Rembourser un prêt",
    "e_rps": "Pierre, feuille, ciseaux",
    "e_bands": "Des notes avec Select Case",
    "e_hailstone": "Les nombres grêlons",
    "e_doubling": "Doubler sur un échiquier",
    "e_rainfall": "La pluie mois par mois",
    "e_savings": "L’épargne année après année",
    "e_classlist": "Une liste de classe en fiches",
    "eg_l6": "Dans le style des examens",
    "e_aqa": "Style AQA : un quiz de tables",
    "e_ocr": "Style OCR : une liste de courses",
    "e_cie": "Style Cambridge : notes et mentions",
    "e_cietype": "Style Cambridge : des livres en fiches",
    # ---- a name for a program nobody named, from what it does (09-names.js)
    "d_rps": "Pierre, feuille, ciseaux",
    "d_weekday": "Jour de la semaine",
    "d_leap": "Année bissextile",
    "d_bank": "Compte bancaire",
    "d_loan": "Remboursement d'un prêt",
    "d_budget": "Analyse de budget",
    "d_rise": "Hausse de {what}",
    "d_fall": "Baisse de {what}",
    "d_doubling": "Doublement de {what}",
    "d_pop_growth": "Croissance d'une population",
    "d_compound": "Intérêts composés",
    "d_to": "{from} en {to}",
    "d_total_of": "Total de {what}",
    "d_average_of": "Moyenne de {what}",
    "d_pay": "Calcul du salaire",
    "d_tip": "Calcul du pourboire",
    "d_vending": "Distributeur automatique",
    "d_change": "Rendu de monnaie",
    "d_shop": "Prix remisé",
    "d_price": "Prix d'achat",
    "d_convert": "Convertisseur d'unités",
    "d_temps": "Celsius en Fahrenheit",
    "d_temps_any": "Convertisseur de températures",
    "d_primes": "Nombres premiers",
    "d_prime": "Test de nombre premier",
    "d_fizz": "FizzBuzz",
    "d_gcd": "Plus grand commun diviseur",
    "d_fib": "Nombres de Fibonacci",
    "d_factorial": "Factorielle",
    "d_reverse": "Chiffres à l'envers",
    "d_digits": "Nombre de chiffres",
    "d_gradebook": "Carnet de notes",
    "d_grades": "Note en lettre",
    "d_votes": "Décompte des voix",
    "d_quiz": "Quiz",
    "d_login": "Vérification du mot de passe",
    "d_guess": "Jeu du nombre mystère",
    "d_vowel": "Test de voyelle",
    "d_stars": "Triangle d'étoiles",
    "d_grid": "Grille de multiplication",
    "d_table": "Table de multiplication",
    "d_minmax": "Plus petit et plus grand nombre",
    "d_biggest": "Plus grand nombre",
    "d_scores": "Résumé des scores",
    "d_average": "Moyenne",
    "d_sumevens": "Somme des nombres pairs de {a} à {b}",
    "d_sumevens_any": "Somme des nombres pairs",
    "d_oddeven": "Pair ou impair",
    "d_swap": "Échange de deux valeurs",
    "d_area": "Aire d'un rectangle",
    "d_menu": "Menu de choix",
    "d_down_n": "Compte à rebours depuis {n}",
    "d_down": "Compte à rebours",
    "d_in_range": "Validation de la saisie",
    "d_sum": "Somme de {a} à {b}",
    "d_sum_any": "Total cumulé",
    "d_count": "Compter de {a} à {b}",
    "d_add": "Addition de deux nombres",
    "d_greet": "Salutation",
    "d_checks": "Vérification de {what}",
    "d_while": "Boucle sur {what}",
    "d_until": "Boucle sur {what}",
    "d_repeats": "Boucle de {a} à {b}",
    "d_uses": "{names}",
    "d_asks": "Saisie de {what}",
    "d_asks_shows": "Calcul avec {what}",
    "d_one": "un nombre",
    "d_two": "deux nombres",
    "d_three": "trois nombres",
    "d_numbers": "{n} nombres",
    "d_circle": "Aire d'un cercle",
    "d_roman": "Chiffres romains",
    "d_dice": "Lancer de dés",
    "d_coin": "Pile ou face",
    "d_reverse_text": "Mot à l'envers",
    "d_count_of": "Nombre de {what}",
    "d_per": "{a} par {b}",
    "d_number": "nombre",
    "d_and": "et",
    "e_fizz": "Fizz et Buzz",
    "e_prime": "Est-ce un nombre premier ?",
    "e_gcd": "Plus grand diviseur commun",
    "e_grid": "Une grille de tables",
    "e_minmax": "Le plus petit et le plus grand",
    "e_stars": "Un triangle d’étoiles",
    "e_report": "Un bulletin de classe",
    "e_login": "Trois essais de mot de passe",
    "e_shop": "Une caisse avec remise",
    "e_temps": "Celsius, Fahrenheit et Kelvin",
    "e_votes": "Compter les voix",
    "e_fib": "Les nombres de Fibonacci",
    "e_change": "Dollars, dizaines et pennies",
    "e_quiz": "Un quiz de trois questions",
    "e_sentinel": "Des nombres jusqu’à 0",
    "e_picktable": "La table que tu veux",
    "eg_head": "Exemples",
    "eg_more": "Plus d’exemples",
    "eg_l1": "Premiers pas",
    "eg_l2": "Décisions et boucles",
    "eg_l3": "Nombres et motifs",
    "e_ask": "Demander et afficher",
    "e_decide": "Une décision",
    "e_count": "Compter",
    "e_total": "Un total cumulé",
    "e_while": "Une boucle While",
    "e_grades": "Notes",
    "e_biggest": "Le plus grand de trois",
    "e_menu": "Un menu",
    "e_keepasking": "Redemander",
    "e_module": "Un module",
    "e_answers": "Une fonction qui renvoie",
    "e_countdown": "Compte à rebours",
    "try_one": "Vous débutez ? Commencez par l’un de ceux-ci :",
    "eg_decision": "Une décision", "eg_loop": "Une boucle", "eg_module": "Un module",
    "r_pace": "Comment ça s’exécute", "r_at_once": "D’un coup",
    "r_by_step": "Un par un", "r_next": "Étape suivante",
    "r_timed": "Au rythme du programme",
    "chart_desc": "Organigramme de {n} formes : {kinds}.",
    "yes_plain": "Oui", "no_plain": "Non",
    "more_head": "Options du schéma",
    "o_words": "Langue et mots",
    "o_chains": "Aligner les longues chaînes de If",
    "o_shapes": "Les formes", "o_paper": "Espacement et papier",
    "o_for": "Boucles For", "o_for_wide": "Dépliée", "o_for_hex": "Un hexagone",
    "o_everyout": "Un symbole pour chaque Afficher",
    "o_roomy": "Aéré : plus de place autour de chaque étape",
    "o_tight": "Compact : moins de formes, bien serrées",
    "o_columns": "Répartir un schéma haut en colonnes",
    "o_steady": "Le même dessin à chaque fois",
    "o_space": "Espacement", "o_space_tight": "Compact",
    "o_space_plain": "Normal", "o_space_roomy": "Aéré",
    "tidy_head": "Options de rangement", "t_layout": "Disposition", "t_shapes": "Formes",
    "t_place": "Sur le papier",
    "t_arrows": "Longueur des flèches", "t_arrows_sub": "En carreaux, au minimum",
    "t_turns": "Garder la rotation", "t_fit": "Ajuster les formes à leurs mots",
    "t_even": "Même largeur pour toutes", "t_keep": "Garder",
    "t_stay": "Laisser le schéma à sa place",
    "more": "Options", "more_tip": "Plus d’options du schéma",
    "decide": "Décisions",
    "undo": "Annuler", "redo": "Rétablir",
    "settings": "Réglages", "appearance": "Apparence", "panel_side": "Côté du panneau",
    "side_left": "Gauche", "side_right": "Droite", "full_screen": "Plein écran",
    "full_on": "Remplir l’écran", "full_off": "Quitter le plein écran",
    "no_full": "Ce navigateur ne passe pas en plein écran.",
    "app_install": "Installer comme une appli",
    "app_tip": "S’ouvre dans sa propre fenêtre, comme une appli, et marche hors ligne",
    "app_ios": "Touche Partager, puis Sur l’écran d’accueil.",
    "app_mac": "Dans Safari, menu Fichier, choisis Ajouter au Dock.",
    "app_done": "Installée. Elle marche aussi hors ligne.",
    "p_ink": "Encre", "p_classic": "Classique", "p_slate": "Ardoise",
    "p_meadow": "Prairie", "p_sunset": "Couchant", "p_night": "Nuit", "p_lavender": "Lavande",
    "p_charcoal": "Anthracite", "p_ember": "Braise",
    "pseudocode": "Pseudocode", "title": "Titre", "your_name": "Votre nom",
    "code_big": "Remplir l’écran", "code_small": "Revenir au panneau", "done": "Terminé",
    "code_lines": "{n} lignes",
    "code_ask": "Entrez {name} : ",
    "code_shares": "ce que le programme partage",
    "c_head": "Exporter le code", "c_write": "Écrire le code",
    "tr_head": "Traduire le code", "tr_go": "Traduire",
    "tr_pick": "Le langage dans lequel traduire votre code",
    "c_one": "Dans un seul fichier", "c_apart": "Plusieurs fichiers",
    "c_files_tip": "Un fichier, ou un par schéma. Un long schéma d’un seul tenant est découpé.",
    "c_one_chart": "Trop court pour être découpé : un seul fichier.",
    "c_cut_into": "Sans modules : découpé en {n} parties et ce qu’elles partagent.",
    "c_files": "{n} fichiers", "c_save_all": "Tout enregistrer",
    "c_writing": "Écriture en cours…",
    "c_zipped": "{n} fichiers, dans un .zip",
    "shape": "Forme",
    "language": "Langue", "key_switch": "Légende", "tint_switch": "Teintes",
    "build": "Dessiner l'organigramme", "drawing": "Dessin…",
    "no_code": "Il n'y a pas encore de pseudocode à dessiner.",
    "failed": "Le dessin a échoué.",
    "not_answering": "Le studio ne répond pas ({err}).",
    "empty_chart": "Collez votre pseudocode à gauche, puis cliquez sur "
                   "Dessiner.",
    "shape_auto": "Auto", "shape_square": "Carré", "shape_wide": "Large 16:9",
    "shape_page": "Page", "shape_tall": "Haut",
    "already": "Déjà là {path}",
    "copied": "{n} fichiers copiés dans {dir}",
    "wrote": "Écrit {path}",
    "open_this": "<- ouvrez celui-ci : il montre l'organigramme et porte "
                 "les liens de téléchargement",
    "style_seed": "Graine de style {seed} (passez --seed {seed} pour le "
                  "redessiner à l'identique)",
    "nothing": "Aucun pseudocode donné -- rien à dessiner.",
    "studio_at": "Le studio d'organigrammes tourne sur {url}",
    "leave_open": "Laissez cette fenêtre ouverte pendant que vous vous en "
                  "servez ; Ctrl+C pour l'arrêter.",
    "stopped": "Studio arrêté.",
    "site_done": "Ce dossier est un site web. Mettez-le sur GitHub Pages "
                 "(ou tout hébergeur de fichiers) et il marchera comme "
                 "ici ; les étapes sont dans {dir}/README.md.",
    "starting": "Démarrage de Python dans le navigateur…",
    "k_head": "Raccourcis clavier",
    "k_tip": "Toutes les touches que cette page comprend (?)",
    "k_any": "Partout",
    "k_code": "En écrivant le pseudo-code",
    "k_shape": "Avec une forme choisie",
    "k_hand": "Dessiner un organigramme",
    "k_lang": "En écrivant du code",
    "k_build": "Dessiner l'organigramme (Organigramme : le vérifier)",
    "k_undo": "Annuler et rétablir",
    "k_zoom": "Zoom avant, zoom arrière, taille réelle",
    "k_close": "Fermer ce qui est ouvert",
    "k_keys": "Afficher cette liste",
    "k_indent": "Décaler les lignes, ou les ramener",
    "k_enter": "Une nouvelle ligne, avec le bon retrait",
    "k_look": "Gras, italique, souligné",
    "k_size": "Texte plus grand ou plus petit",
    "k_next": "La forme suivante, ou la précédente",
    "k_nudge": "La déplacer un peu (Maj : plus loin)",
    "k_drop": "La lâcher",
    "k_lasso": "Sélectionner toutes les formes dans un cadre",
    "k_add": "Ajouter une forme, ou la retirer",
    "k_all": "Sélectionner toutes les formes",
    "k_clip": "Copier, couper et coller",
    "k_pan": "Se déplacer sur la feuille",
    "kn_ctrl": "Ctrl",
    "kn_shift": "Maj",
    "kn_enter": "Entrée",
    "kn_del": "Suppr",
    "kn_space": "Espace",
    "kn_click": "clic",
    "kn_drag": "glisser",
    "kn_dblclick": "double-clic",
    "kn_rclick": "clic droit",
    "kn_hold": "appui long",
    "kn_wheel": "molette",
    "kn_pinch": "pincer",
    "kn_corner": "glisser un coin",
    "kn_dot": "glisser un point",
    "kn_spin": "glisser la poignée ronde",
    "kn_plus": "clic sur +",
    "b_about": "Avancement du dessin",
    "b_boot": "Démarrage de Python dans le navigateur",
    "b_read": "Lecture du pseudo-code",
    "b_lay": "Mise en place des formes",
    "b_draw": "Dessin de l'organigramme",
    "b_page": "Affichage sur la page",
    "ready": "Prêt.",
    "boot_failed": "Python n'a pas pu démarrer dans ce navigateur ({err}).",
    "py_gave_out": "Python s’est arrêté au milieu de ce dessin ({err}).",
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
        Declare String nom
        Display "Comment t'appelles-tu ?"
        Input nom
        Display "Bonjour"
        Display nom
        Stop
    """),
    "e_add_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Display "Deux nombres, s'il te plaît"
        Input a
        Input b
        Display "Ensemble, ils font"
        Display a + b
        Stop
    """),
    "e_swap_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer copie
        Input a
        Input b
        copie = a
        a = b
        b = copie
        Display a
        Display b
        Stop
    """),
    "e_decide_p": program("""
        Start
        Declare Integer age
        Display "Quel âge as-tu ?"
        Input age
        If age >= 18 Then
            Display "Assez âgé pour voter"
        Else
            Display "Pas encore assez âgé"
        End If
        Stop
    """),
    "e_oddeven_p": program("""
        Start
        Declare Integer n
        Display "Tape un nombre"
        Input n
        If n mod 2 = 0 Then
            Display "pair"
        Else
            Display "impair"
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
        Declare Integer total
        total = 0
        For i = 1 To 10
            total = total + i
        End For
        Display "Le total est"
        Display total
        Stop
    """),
    "e_module_p": program("""
        Start
        Declare String nom
        Input nom
        Call saluer(nom)
        Stop

        Module saluer(qui)
            Display "Bonjour"
            Display qui
        End Module
    """),
    "e_answers_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer somme
        Input a
        Input b
        somme = additionne(a, b)
        Display "La réponse est"
        Display somme
        Stop

        Function additionne(x, y)
            Return x + y
        End Function
    """),
    # ---- the examples: decisions and loops
    "e_grades_p": program("""
        Start
        Declare Integer note
        Display "Tape la note"
        Input note
        If note >= 90 Then
            Display "A"
        Else If note >= 80 Then
            Display "B"
        Else If note >= 70 Then
            Display "C"
        Else If note >= 60 Then
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
        Declare Integer plusGrand
        Input a
        Input b
        Input c
        plusGrand = a
        If b > plusGrand Then
            plusGrand = b
        End If
        If c > plusGrand Then
            plusGrand = c
        End If
        Display "Le plus grand est"
        Display plusGrand
        Stop
    """),
    "e_menu_p": program("""
        Start
        Declare Integer choix
        Display "1 additionner  2 soustraire  3 quitter"
        Input choix
        Select Case choix
            Case 1
                Display "Addition"
            Case 2
                Display "Soustraction"
            Case Else
                Display "Au revoir"
        End Select
        Stop
    """),
    "e_vowel_p": program("""
        Start
        Declare String lettre
        Display "Tape une lettre"
        Input lettre
        Select Case lettre
            Case "a"
                Display "voyelle"
            Case "e"
                Display "voyelle"
            Case "i"
                Display "voyelle"
            Case "o"
                Display "voyelle"
            Case "u"
                Display "voyelle"
            Case Else
                Display "pas une voyelle"
        End Select
        Stop
    """),
    "e_leap_p": program("""
        Start
        Declare Integer annee
        Display "Quelle année ?"
        Input annee
        If annee mod 400 = 0 Then
            Display "année bissextile"
        Else If annee mod 100 = 0 Then
            Display "pas bissextile"
        Else If annee mod 4 = 0 Then
            Display "année bissextile"
        Else
            Display "pas bissextile"
        End If
        Stop
    """),
    "e_keepasking_p": program("""
        Start
        Declare Integer n
        Do
            Display "Tape un nombre de 1 à 10"
            Input n
        Until n >= 1 And n <= 10
        Display "Merci"
        Stop
    """),
    "e_sumevens_p": program("""
        Start
        Declare Integer total
        total = 0
        For i = 1 To 20
            If i mod 2 = 0 Then
                total = total + i
            End If
        End For
        Display "Les nombres pairs font en tout"
        Display total
        Stop
    """),
    "e_countdown_p": program("""
        Start
        Declare Integer n
        n = 10
        While n > 0
            Display n
            If n = 5 Then
                Display "À mi-chemin"
            End If
            n = n - 1
        End While
        Display "Décollage !"
        Stop
    """),
    "e_guess_p": program("""
        Start
        Declare Integer secret
        Declare Integer essai
        secret = 7
        Do
            Display "Devine mon nombre"
            Input essai
            If essai < secret Then
                Display "Plus haut"
            End If
            If essai > secret Then
                Display "Plus bas"
            End If
        Until essai = secret
        Display "Trouvé !"
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
        Declare Integer diviseurs
        Display "Tape un nombre"
        Input n
        diviseurs = 0
        For i = 1 To n
            If n mod i = 0 Then
                diviseurs = diviseurs + 1
            End If
        End For
        If diviseurs = 2 Then
            Display "premier"
        Else
            Display "pas premier"
        End If
        Stop
    """),
    "e_gcd_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Display "Deux nombres, s'il te plaît"
        Input a
        Input b
        While a <> b
            If a > b Then
                a = a - b
            Else
                b = b - a
            End If
        End While
        Display "Le plus grand diviseur commun est"
        Display a
        Stop
    """),
    "e_fib_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer suivant
        a = 0
        b = 1
        For i = 1 To 10
            Display a
            suivant = a + b
            a = b
            b = suivant
        End For
        Stop
    """),
    "e_factorial_p": program("""
        Start
        Declare Integer n
        Declare Integer resultat
        Display "Tape un nombre"
        Input n
        resultat = 1
        For i = 1 To n
            resultat = resultat * i
        End For
        Display "La factorielle est"
        Display resultat
        Stop
    """),
    "e_minmax_p": program("""
        Start
        Declare Integer n
        Declare Integer plusPetit
        Declare Integer plusGrand
        Display "Cinq nombres, s'il te plaît"
        Input n
        plusPetit = n
        plusGrand = n
        For i = 2 To 5
            Input n
            If n < plusPetit Then
                plusPetit = n
            End If
            If n > plusGrand Then
                plusGrand = n
            End If
        End For
        Display "Le plus petit"
        Display plusPetit
        Display "Le plus grand"
        Display plusGrand
        Stop
    """),
    "e_grid_p": program("""
        Start
        For ligne = 1 To 5
            For colonne = 1 To 5
                Display ligne * colonne
            End For
        End For
        Stop
    """),
    "e_stars_p": program("""
        Start
        Declare String etoiles
        Declare Integer n
        Display "Combien de lignes ?"
        Input n
        For ligne = 1 To n
            etoiles = ""
            For colonne = 1 To ligne
                etoiles = etoiles + "*"
            End For
            Display etoiles
        End For
        Stop
    """),
    # ---- the examples: everyday programs
    "e_change_p": program("""
        Start
        Declare Integer cents
        Display "Combien de cents ?"
        Input cents
        Display "Dollars"
        Display cents div 100
        cents = cents mod 100
        Display "Dizaines"
        Display cents div 10
        Display "Pennies"
        Display cents mod 10
        Stop
    """),
    "e_temps_p": program("""
        Start
        Declare String echelleDe
        Declare String echelleVers
        Declare Real degres
        Declare Real celsius
        Declare Real resultat
        Declare String encore
        Do
            echelleDe = demanderEchelle("Convertir depuis C, F ou K ?")
            echelleVers = demanderEchelle("Convertir en C, F ou K ?")
            Display "La température ?"
            Input degres
            celsius = versCelsius(degres, echelleDe)
            resultat = round(depuisCelsius(celsius, echelleVers) * 100) / 100
            Display degres, " ", echelleDe, " font ", resultat, " ", echelleVers
            Display "Une autre ? o ou n"
            Input encore
        Until toupper(encore) <> "O"
        Stop

        Function demanderEchelle(question)
            Declare String echelle
            Display question
            Input echelle
            echelle = toupper(echelle)
            While echelle <> "C" And echelle <> "F" And echelle <> "K"
                Display "Tape C, F ou K, s'il te plaît"
                Input echelle
                echelle = toupper(echelle)
            End While
            Return echelle
        End Function

        Function versCelsius(t, echelle)
            If echelle = "F" Then
                Return (t - 32) * 5 / 9
            Else If echelle = "K" Then
                Return t - 273.15
            Else
                Return t
            End If
        End Function

        Function depuisCelsius(t, echelle)
            If echelle = "F" Then
                Return t * 9 / 5 + 32
            Else If echelle = "K" Then
                Return t + 273.15
            Else
                Return t
            End If
        End Function
    """),
    "e_shop_p": program("""
        Start
        Declare Integer quantite
        Declare Real prix
        Declare Real total
        Display "Combien ?"
        Input quantite
        Display "Prix à l'unité ?"
        Input prix
        total = quantite * prix
        If total > 50 Then
            total = total * 0.9
            Display "Dix pour cent de remise"
        End If
        Display "À payer : $", total
        Stop
    """),
    "e_report_p": program("""
        Start
        Declare Integer note
        Declare Integer total
        Declare Integer reussis
        Declare Integer meilleure
        total = 0
        reussis = 0
        meilleure = 0
        For i = 1 To 5
            Display "Tape une note"
            Input note
            total = total + note
            If note >= 60 Then
                reussis = reussis + 1
            End If
            If note > meilleure Then
                meilleure = note
            End If
        End For
        Display "Réussis"
        Display reussis
        Display "Moyenne"
        Display total / 5
        Display "Meilleure"
        Display meilleure
        Stop
    """),
    "e_votes_p": program("""
        Start
        Declare String vote
        Declare Integer rouges
        Declare Integer bleus
        rouges = 0
        bleus = 0
        For i = 1 To 5
            Display "rouge ou bleu ?"
            Input vote
            If vote = "rouge" Then
                rouges = rouges + 1
            Else
                bleus = bleus + 1
            End If
        End For
        Display "Rouge"
        Display rouges
        Display "Bleu"
        Display bleus
        If rouges > bleus Then
            Display "Le rouge gagne"
        Else If bleus > rouges Then
            Display "Le bleu gagne"
        Else
            Display "Égalité"
        End If
        Stop
    """),
    "e_quiz_p": program("""
        Start
        Declare Integer points
        points = 0
        points = points + demander("2 plus 2 ?", 4)
        points = points + demander("5 fois 3 ?", 15)
        points = points + demander("10 moins 7 ?", 3)
        Display "Ton score"
        Display points
        Stop

        Function demander(question, reponse)
            Declare Integer dit
            Display question
            Input dit
            If dit = reponse Then
                Display "Juste"
                Return 1
            Else
                Display "Faux"
                Return 0
            End If
        End Function
    """),
    "e_login_p": program("""
        Start
        Declare String mot
        Declare Integer essais
        essais = 0
        Do
            Display "Mot de passe ?"
            Input mot
            essais = essais + 1
        Until mot = "ouvert" Or essais = 3
        Call verdict(mot)
        Stop

        Module verdict(dit)
            If dit = "ouvert" Then
                Display "Bienvenue"
            Else
                Display "Bloqué"
            End If
        End Module
    """),
    "e_sentinel_p": program("""
        Start
        Declare Integer n
        Declare Integer total
        Declare Integer combien
        total = 0
        combien = 0
        Display "Des nombres, s'il te plaît. 0 pour finir."
        Input n
        While n <> 0
            total = total + n
            combien = combien + 1
            Input n
        End While
        If combien > 0 Then
            Display "La moyenne est"
            Display total / combien
        Else
            Display "Rien dont faire la moyenne"
        End If
        Stop
    """),
    "e_picktable_p": program("""
        Start
        Declare Integer n
        Display "Quelle table ? 0 pour arrêter."
        Input n
        While n > 0
            For i = 1 To 12
                Display n * i
            End For
            Display "Quelle table ? 0 pour arrêter."
            Input n
        End While
        Display "Salut"
        Stop
    """),
    # ---- the examples: bigger projects
    "e_bank_p": program("""
        Start
        Declare Real solde
        Declare Integer choix
        solde = 0
        Do
            Display "1 déposer  2 retirer  3 solde  4 quitter"
            Input choix
            Select Case choix
                Case 1
                    Call deposer(solde)
                Case 2
                    Call retirer(solde)
                Case 3
                    Display "Ton solde est de $", solde
                Case 4
                    Display "Au revoir"
                Case Else
                    Display "Choisis 1, 2, 3 ou 4"
            End Select
        Until choix = 4
        Stop

        Module deposer(Real Ref argent)
            Declare Real montant
            Display "Combien déposer ?"
            Input montant
            If montant <= 0 Then
                Display "Un dépôt doit être plus grand que zéro"
            Else
                argent = argent + montant
                Display "Déposé : $", montant
            End If
        End Module

        Module retirer(Real Ref argent)
            Declare Real montant
            Display "Combien retirer ?"
            Input montant
            If montant <= 0 Then
                Display "Un retrait doit être plus grand que zéro"
            Else If montant > argent Then
                Display "Pas assez d'argent. Tu as $", argent
            Else
                argent = argent - montant
                Display "Retiré : $", montant
            End If
        End Module
    """),
    "e_gradebook_p": program("""
        Start
        Declare Integer eleves
        Declare Integer note
        Declare Integer total
        Declare Integer plusHaute
        Declare Integer plusBasse
        Declare Integer reussis
        Declare String lettre
        total = 0
        reussis = 0
        plusHaute = 0
        plusBasse = 100
        Display "Combien d'élèves ?"
        Input eleves
        While eleves < 1
            Display "Il faut au moins un élève"
            Input eleves
        End While
        For i = 1 To eleves
            Display "Note de l'élève ", i
            Input note
            While note < 0 Or note > 100
                Display "Une note va de 0 à 100. Essaie encore"
                Input note
            End While
            lettre = noteEnLettre(note)
            Display "Cela fait un ", lettre
            total = total + note
            If lettre <> "F" Then
                reussis = reussis + 1
            End If
            If note > plusHaute Then
                plusHaute = note
            End If
            If note < plusBasse Then
                plusBasse = note
            End If
        End For
        Display "Moyenne de la classe : ", total / eleves
        Display "Note la plus haute : ", plusHaute
        Display "Note la plus basse : ", plusBasse
        Display "Élèves reçus : ", reussis
        Stop

        Function String noteEnLettre(Integer points)
            If points >= 90 Then
                Return "A"
            Else If points >= 80 Then
                Return "B"
            Else If points >= 70 Then
                Return "C"
            Else If points >= 60 Then
                Return "D"
            Else
                Return "F"
            End If
        End Function
    """),
    "e_paycheck_p": program("""
        Start
        Constant Real TAUX_IMPOT = 0.15
        Declare String nom
        Declare Real heures
        Declare Real tauxHoraire
        Declare Real brut
        Declare Real impot
        Declare Integer payes
        payes = 0
        Display "Nom de l'employé ? Tape fin pour finir"
        Input nom
        While nom <> "fin"
            Display "Heures travaillées cette semaine ?"
            Input heures
            Display "Taux horaire ?"
            Input tauxHoraire
            brut = salaireBrut(heures, tauxHoraire)
            impot = brut * TAUX_IMPOT
            Display nom, " a gagné $", brut
            Display "Impôts retenus : $", impot
            Display "Salaire net : $", brut - impot
            payes = payes + 1
            Display "Nom de l'employé ? Tape fin pour finir"
            Input nom
        End While
        Display "Fiches de paie faites : ", payes
        Stop

        Function Real salaireBrut(Real travaillees, Real parHeure)
            Declare Real heuresSupp
            If travaillees <= 40 Then
                Return travaillees * parHeure
            Else
                heuresSupp = travaillees - 40
                Return 40 * parHeure + heuresSupp * parHeure * 1.5
            End If
        End Function
    """),
    "e_vending_p": program("""
        Start
        Declare Integer prix
        Declare Integer paye
        Declare Integer piece
        Display "Combien coûte l'en-cas, en cents ?"
        Input prix
        While prix <= 0 Or prix mod 5 <> 0
            Display "Ici, les prix vont de 5 cents en 5 cents"
            Input prix
        End While
        paye = 0
        While paye < prix
            Display "Reste à payer : ", prix - paye, " cents. Mets 5, 10 ou 25"
            Input piece
            Select Case piece
                Case 5
                    paye = paye + piece
                Case 10
                    paye = paye + piece
                Case 25
                    paye = paye + piece
                Case Else
                    Display "Cette machine ne prend que les pièces de 5, 10 et 25 cents"
            End Select
        End While
        Display "Bon appétit"
        If paye > prix Then
            Call rendreMonnaie(paye - prix)
        End If
        Stop

        Module rendreMonnaie(Integer cents)
            Display "Ta monnaie : ", cents, " cents"
            Display "Pièces de 25 : ", cents div 25
            cents = cents mod 25
            Display "Pièces de 10 : ", cents div 10
            cents = cents mod 10
            Display "Pièces de 5 : ", cents div 5
        End Module
    """),
    "e_primelist_p": program("""
        Start
        Declare Integer limite
        Declare Integer trouves
        Declare Integer total
        Display "Chercher les nombres premiers jusqu'à combien ?"
        Input limite
        While limite < 2
            Display "Choisis un nombre supérieur ou égal à 2"
            Input limite
        End While
        trouves = 0
        total = 0
        For n = 2 To limite
            If estPremier(n) Then
                Display n
                trouves = trouves + 1
                total = total + n
            End If
        End For
        Display "Nombres premiers trouvés : ", trouves
        Display "Leur somme fait ", total
        Stop

        Function Boolean estPremier(Integer nombre)
            Declare Integer d
            d = 2
            While d * d <= nombre
                If nombre mod d = 0 Then
                    Return False
                End If
                d = d + 1
            End While
            Return True
        End Function
    """),
    "e_weekday_p": program("""
        Start
        Declare Integer annee
        Declare Integer mois
        Declare Integer jour
        Display "Année ?"
        Input annee
        Display "Mois, de 1 à 12 ?"
        Input mois
        While mois < 1 Or mois > 12
            Display "Un mois va de 1 à 12"
            Input mois
        End While
        Display "Jour du mois ?"
        Input jour
        While jour < 1 Or jour > joursDans(mois, annee)
            Display "Ce mois a ", joursDans(mois, annee), " jours"
            Input jour
        End While
        Display mois, "/", jour, "/", annee, " est un ", nomJour(jourSemaine(annee, mois, jour))
        Stop

        Function Integer joursDans(Integer m, Integer y)
            Select Case m
                Case 2
                    If estBissextile(y) Then
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

        Function Boolean estBissextile(Integer y)
            Return (y mod 4 = 0 And y mod 100 <> 0) Or y mod 400 = 0
        End Function

        Function Integer jourSemaine(Integer y, Integer m, Integer d)
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

        Function String nomJour(Integer h)
            Select Case h
                Case 0
                    Return "samedi"
                Case 1
                    Return "dimanche"
                Case 2
                    Return "lundi"
                Case 3
                    Return "mardi"
                Case 4
                    Return "mercredi"
                Case 5
                    Return "jeudi"
                Case Else
                    Return "vendredi"
            End Select
        End Function
    """),
    "e_loan_p": program("""
        Start
        Declare Real solde
        Declare Real taux
        Declare Real paiement
        Declare Real interets
        Declare Real interetsPayes
        Declare Integer mois
        Display "Quel est le montant du prêt ?"
        Input solde
        Display "Taux d'intérêt annuel, en pour cent ?"
        Input taux
        Display "Paiement mensuel ?"
        Input paiement
        interets = solde * taux / 100 / 12
        If paiement <= interets Then
            Display "Comme ça, le prêt ne sera jamais remboursé. Paie plus de $", interets
        Else
            mois = 0
            interetsPayes = 0
            While solde > 0
                interets = solde * taux / 100 / 12
                interetsPayes = interetsPayes + interets
                solde = solde + interets - paiement
                mois = mois + 1
                If mois mod 12 = 0 And solde > 0 Then
                    Display "Après l'année ", mois div 12, ", tu dois encore $", solde
                End If
            End While
            Display "Remboursé en ", mois, " mois"
            Display "Le dernier paiement n'est que de $", paiement + solde
            Display "Intérêts payés en tout : $", interetsPayes
        End If
        Stop
    """),
    "e_rps_p": program("""
        Start
        Declare Integer joueur
        Declare Integer ordinateur
        Declare Integer resultat
        Declare Integer victoires
        Declare Integer defaites
        victoires = 0
        defaites = 0
        For partie = 1 To 5
            Display "Partie ", partie, " : 1 pierre, 2 feuille, 3 ciseaux"
            Input joueur
            While joueur < 1 Or joueur > 3
                Display "Choisis 1, 2 ou 3"
                Input joueur
            End While
            ordinateur = random(1, 3)
            Display "Toi : ", nomDe(joueur), "   Ordinateur : ", nomDe(ordinateur)
            resultat = gagnant(joueur, ordinateur)
            If resultat = 1 Then
                Display "Tu gagnes celle-ci"
                victoires = victoires + 1
            Else If resultat = 2 Then
                Display "L'ordinateur gagne celle-ci"
                defaites = defaites + 1
            Else
                Display "Égalité"
            End If
        End For
        Display "Tu as gagné ", victoires, " fois et perdu ", defaites, " fois"
        If victoires > defaites Then
            Display "Tu as battu l'ordinateur !"
        Else If defaites > victoires Then
            Display "L'ordinateur t'a battu"
        Else
            Display "Égalité au total"
        End If
        Stop

        Function String nomDe(Integer choix)
            Select Case choix
                Case 1
                    Return "pierre"
                Case 2
                    Return "feuille"
                Case Else
                    Return "ciseaux"
            End Select
        End Function

        Function Integer gagnant(Integer a, Integer b)
            If a = b Then
                Return 0
            Else If (a - b + 3) mod 3 = 1 Then
                Return 1
            Else
                Return 2
            End If
        End Function
    """),
    "e_bands_p": program("""
        Start
        Declare Integer score
        Display "Ton score sur 100 ?"
        Input score
        Select Case score
            Case 90 To 100
                Display "A : excellent"
            Case 80 To 89
                Display "B : très bien"
            Case 70 To 79
                Display "C : bien"
            Case 60 To 69
                Display "D : réussi"
            Case Else
                Display "F : pas encore réussi"
        End Select
        Stop
    """),
    "e_hailstone_p": program("""
        Start
        Declare Integer n
        Declare Integer etapes
        Display "Partir de quel nombre ?"
        Input n
        etapes = 0
        While n <> 1
            If n mod 2 = 0 Then
                n = n div 2
            Else
                n = 3 * n + 1
            End If
            etapes = etapes + 1
            Display n
        End While
        Display "Étapes pour arriver à 1 : ", etapes
        Stop
    """),
    "e_doubling_p": program("""
        Start
        Declare Integer grains
        Declare Integer total
        grains = 1
        total = 0
        For numero = 1 To 16
            Display grains
            total = total + grains
            grains = grains * 2
        End For
        Display "Grains sur les 16 premières cases : ", total
        Stop
    """),
    "e_rainfall_p": program("""
        Start
        Declare Real total
        Declare String plusPluvieux
        pluie = {"Janv": 78, "Févr": 52, "Mars": 61, "Avr": 45, "Mai": 30, "Juin": 12}
        Display "Pluie en mm : ", pluie
        total = 0
        plusPluvieux = "Janv"
        For Each mois In pluie
            total = total + pluie[mois]
            If pluie[mois] > pluie[plusPluvieux] Then
                plusPluvieux = mois
            End If
        End For
        Display "Moyenne : ", round(total / length(pluie), 1), " mm"
        Display "Le mois le plus pluvieux : ", plusPluvieux
        Stop
    """),
    "e_savings_p": program("""
        Start
        Declare Real depart
        Declare Real taux
        Declare Integer annees
        Declare Real solde
        Display "Combien pour commencer ?"
        Input depart
        Display "Taux d’intérêt, en pourcentage ?"
        Input taux
        Display "Pendant combien d’années ?"
        Input annees
        solde = depart
        For annee = 1 To annees
            solde = grandir(solde, taux)
            Display "Année ", annee, " : ", round(solde, 2)
        End For
        Display "Gain : ", round(solde - depart, 2)
        Display "Années pour doubler : ", anneesPourDoubler(depart, taux)
        Stop

        Function grandir(somme, pourcentage)
            Return somme + somme * pourcentage / 100
        End Function

        Function anneesPourDoubler(somme, pourcentage)
            Declare Integer compte
            Declare Real maintenant
            If pourcentage <= 0 Then
                Return 0
            End If
            compte = 0
            maintenant = somme
            While maintenant < somme * 2
                maintenant = grandir(maintenant, pourcentage)
                compte = compte + 1
            End While
            Return compte
        End Function
    """),
    "e_classlist_p": program("""
        Start
        Declare Integer i
        Declare Real total
        noms = ["Ana", "Ben", "Cy", "Dee", "Eli", "Fay"]
        notes = [88, 72, 95, 64, 79, 91]
        eleves = []
        For i = 0 To length(noms) - 1
            Call append(eleves, nouvelEleve(noms[i], notes[i]))
        End For
        total = 0
        meilleur = eleves[0]
        For Each e In eleves
            Display e.nom, " : ", e.note
            total = total + e.note
            If e.note > meilleur.note Then
                meilleur = e
            End If
        End For
        Display "Moyenne de la classe : ", round(total / length(eleves), 1)
        Display "Premier de la classe : ", meilleur.nom
        Stop

        Function nouvelEleve(nom, note)
            un = New Eleve
            un.nom = nom
            un.note = note
            Return un
        End Function
    """),
    "e_aqa_p": program("""
        SUBROUTINE question(a, b)
            OUTPUT "Combien font " + INT_TO_STRING(a) + " x " + INT_TO_STRING(b) + " ?"
            reponse ← STRING_TO_INT(USERINPUT)
            RETURN reponse = a * b
        ENDSUBROUTINE

        score ← 0
        table ← 7
        FOR i ← 1 TO 5
            IF question(table, i) THEN
                score ← score + 1
                OUTPUT "Juste"
            ELSE
                OUTPUT "C’est " + INT_TO_STRING(table * i)
            ENDIF
        ENDFOR
        OUTPUT "Tu as " + INT_TO_STRING(score) + " sur 5"
    """),
    "e_ocr_p": program("""
        array articles[4]
        array prix[4]
        articles[0] = "pain"
        prix[0] = 1.20
        articles[1] = "lait"
        prix[1] = 0.95
        articles[2] = "pommes"
        prix[2] = 2.40
        articles[3] = "fromage"
        prix[3] = 3.10
        total = 0
        for i = 0 to 3
            print(articles[i] + " : " + str(prix[i]))
            total = total + prix[i]
        next i
        budget = float(input("Ton budget ?"))
        if total <= budget then
            print("Ça rentre dans ton budget")
        else
            print("Trop cher de " + str(total - budget))
        endif
    """),
    "e_cie_p": program("""
        DECLARE Notes : ARRAY[1:5] OF INTEGER
        DECLARE Indice : INTEGER
        DECLARE Total : INTEGER
        Notes[1] ← 67
        Notes[2] ← 84
        Notes[3] ← 45
        Notes[4] ← 92
        Notes[5] ← 73
        Total ← 0
        FOR Indice ← 1 TO 5
            Total ← Total + Notes[Indice]
            OUTPUT "Élève ", Indice, " : ", Notes[Indice]
        NEXT Indice
        OUTPUT "Moyenne : ", Total / 5
        FOR Indice ← 1 TO 5
            CASE OF Notes[Indice]
                90 TO 100 : OUTPUT "Élève ", Indice, " obtient A"
                70 TO 89 : OUTPUT "Élève ", Indice, " obtient B"
                50 TO 69 : OUTPUT "Élève ", Indice, " obtient C"
                OTHERWISE : OUTPUT "Élève ", Indice, " obtient U"
            ENDCASE
        NEXT Indice
    """),
    "e_cietype_p": program("""
        TYPE Livre
            DECLARE Titre : STRING
            DECLARE Pages : INTEGER
        ENDTYPE
        DECLARE Etagere : ARRAY[1:3] OF Livre
        DECLARE Indice : INTEGER
        Etagere[1].Titre ← "Dune"
        Etagere[1].Pages ← 412
        Etagere[2].Titre ← "Emma"
        Etagere[2].Pages ← 474
        Etagere[3].Titre ← "Holes"
        Etagere[3].Pages ← 233
        FOR Indice ← 1 TO 3
            CALL MontrerLivre(Etagere[Indice])
        NEXT Indice
        OUTPUT "Le plus long : ", PlusLong(Etagere)

        PROCEDURE MontrerLivre(L : Livre)
            OUTPUT L.Titre, " : ", L.Pages
        ENDPROCEDURE

        FUNCTION PlusLong(Livres : ARRAY OF Livre) RETURNS STRING
            DECLARE Meilleur : INTEGER
            DECLARE Indice : INTEGER
            Meilleur ← 1
            FOR Indice ← 2 TO 3
                IF Livres[Indice].Pages > Livres[Meilleur].Pages
                    THEN
                        Meilleur ← Indice
                ENDIF
            NEXT Indice
            RETURN Livres[Meilleur].Titre
        ENDFUNCTION
    """),
    # ---- the puzzles: find the fault
    "z_else_p": program("""
        Start
        Declare Integer age
        Input age
        If age >= 18 Then
            Display "dedans"
        End If
        Stop
    """),
    "z_swap_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 10 Then
            Display "petit"
        Else
            Display "grand"
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
        Declare String nom
        Display "Bonjour"
        Display nom
        Input nom
        Stop
    """),
    "z_range_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 0 Or n < 10 Then
            Display "dans l'intervalle"
        Else
            Display "hors de l'intervalle"
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
            Display "positif"
        Else
            Display "négatif"
        End If
        Stop
    """),
    "z_twice_p": program("""
        Start
        Declare String mot
        Input mot
        Display mot
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
        Declare Integer resultat
        Input n
        Display resultat
        resultat = n * 3
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
        Display "partez"
        Stop
    """),
    "z_total_p": program("""
        Start
        Declare Integer total
        For i = 1 To 4
            total = 0
            total = total + i
        End For
        Display total
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
        Declare Integer total
        total = 0
        For i = 1 To 3
            total = total + i
            Display total
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
        For ligne = 1 To 2
            For colonne = 1 To 1
                Display ligne * colonne
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
        Declare Integer total
        total = 0
        For i = 1 To 10
            If i mod 2 = 1 Then
                total = total + i
            End If
        End For
        Display total
        Stop
    """),
    "z_asked_p": program("""
        Start
        Declare Integer n
        Declare Integer total
        total = 0
        Input n
        For i = 1 To 3
            total = total + n
        End For
        Display total
        Stop
    """),
    "z_onemore_p": program("""
        Start
        Declare Integer total
        total = 0
        For i = 1 To 11
            total = total + i
        End For
        Display total
        Stop
    """),
    # ---- the puzzles: build it
    "z_grade_p": program("""
        Start
        Declare Integer note
        Input note
        If note > 60 Then
            Display "reçu"
        Else
            Display "recalé"
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
        Display doubler(n)
        Stop

        Function doubler(x)
            x = x * 2
        End Function
    """),
    "z_param_p": program("""
        Start
        Declare Integer n
        Input n
        Call afficher(n)
        Stop

        Module afficher(x)
            Display "x"
        End Module
    """),
    "z_many_p": program("""
        Start
        Declare Integer n
        Declare Integer combien
        For i = 1 To 5
            combien = 0
            Input n
            If n > 10 Then
                combien = combien + 1
            End If
        End For
        Display combien
        Stop
    """),
    "z_divide_p": program("""
        Start
        Declare Real total
        Declare Real n
        total = 0
        For i = 1 To 4
            Input n
            total = total + n
        End For
        Display total / 5
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
        Declare Integer meilleur
        meilleur = 0
        For i = 1 To 4
            Input n
            If n < meilleur Then
                meilleur = n
            End If
        End For
        Display meilleur
        Stop
    """),
    "z_short_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Input a
        Input b
        Display additionne(a)
        Stop

        Function additionne(x, y)
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
        Display "partez"
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
        Declare Integer diviseurs
        Input n
        diviseurs = 0
        For i = 1 To n
            If n mod i = 0 Then
                diviseurs = diviseurs + 1
            End If
        End For
        If diviseurs < 3 Then
            Display "premier"
        Else
            Display "pas premier"
        End If
        Stop
    """),
    "z_digits_p": program("""
        Start
        Declare Integer n
        Declare Integer combien
        Input n
        combien = 1
        While n > 0
            n = n div 10
            combien = combien + 1
        End While
        Display combien
        Stop
    """),
    "z_revzero_p": program("""
        Start
        Declare Integer n
        Declare Integer inverse
        Input n
        inverse = 0
        While n > 0
            inverse = inverse + n mod 10
            n = n div 10
        End While
        Display inverse
        Stop
    """),
    "z_sumd_p": program("""
        Start
        Declare Integer n
        Declare Integer total
        Input n
        total = 0
        While n > 0
            total = total + n div 10
            n = n div 10
        End While
        Display total
        Stop
    """),
    "z_gridrow_p": program("""
        Start
        For ligne = 1 To 3
            For colonne = 1 To 3
                Display ligne * ligne
            End For
        End For
        Stop
    """),
    "z_tri_p": program("""
        Start
        Declare Integer total
        total = 0
        For i = 1 To 4
            total = total + i
        End For
        Display total
        Stop
    """),
    "z_lowhigh_p": program("""
        Start
        Declare Integer n
        Declare Integer plusPetit
        Declare Integer plusGrand
        plusPetit = 0
        plusGrand = 0
        For i = 1 To 4
            Input n
            If n < plusPetit Then
                plusPetit = n
            End If
            If n > plusGrand Then
                plusGrand = n
            End If
        End For
        Display plusPetit
        Display plusGrand
        Stop
    """),
    "z_starsrow_p": program("""
        Start
        Declare String etoiles
        For ligne = 1 To 3
            etoiles = ""
            For colonne = 1 To 3
                etoiles = etoiles + "*"
            End For
            Display etoiles
        End For
        Stop
    """),
    "z_factloop_p": program("""
        Start
        Declare Integer n
        Declare Integer resultat
        Input n
        resultat = 0
        For i = 1 To n
            resultat = resultat * i
        End For
        Display resultat
        Stop
    """),
    # ---- the puzzles: real bugs
    "z_report_p": program("""
        Start
        Declare Integer note
        Declare Integer total
        total = 0
        For i = 1 To 5
            Input note
            total = total + note
        End For
        Display total / 6
        Stop
    """),
    "z_tries_p": program("""
        Start
        Declare String mot
        Declare Integer essais
        essais = 0
        Do
            Input mot
            essais = essais + 1
        Until mot = "ouvert" Or essais = 2
        If mot = "ouvert" Then
            Display "dedans"
        Else
            Display "dehors"
        End If
        Stop
    """),
    "z_discount_p": program("""
        Start
        Declare Real total
        Input total
        If total > 100 Then
            total = total * 0.9
        End If
        Display total
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
        Declare Integer rouges
        Declare Integer bleus
        Input rouges
        Input bleus
        If rouges > bleus Then
            Display "Le rouge gagne"
        Else
            Display "Le bleu gagne"
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
        Declare Integer cents
        Input cents
        Display cents div 100
        Display cents div 10
        Display cents mod 10
        Stop
    """),
    "z_score_p": program("""
        Start
        Declare Integer points
        points = 0
        points = points + demander(4)
        points = points + demander(15)
        Display points
        Stop

        Function demander(reponse)
            Declare Integer dit
            Input dit
            If dit = reponse Then
                Return 0
            Else
                Return 1
            End If
        End Function
    """),
    "z_sent_p": program("""
        Start
        Declare Integer n
        Declare Integer total
        Declare Integer combien
        total = 0
        combien = 0
        Input n
        While n <> 0
            total = total + n
            combien = combien + 1
            Input n
        End While
        Display total / (combien + 1)
        Stop
    """),
    "z_menu0_p": program("""
        Start
        Declare Integer n
        Display "Choisis un nombre, 0 pour arrêter"
        Input n
        While n <> 1
            Display n
            Display "Choisis un nombre, 0 pour arrêter"
            Input n
        End While
        Display "Au revoir"
        Stop
    """),
    # ---- the answers a puzzle is marked against that are words.  A
    # puzzle's tries write them as {out}; each is said here the way the
    # puzzles above say it, so a fixed program says exactly this.
    "zw_in": "dedans",
    "zw_out": "dehors",
    "zw_big": "grand",
    "zw_small": "petit",
    "zw_hello": "Bonjour",
    "zw_hi": "salut",
    "zw_inrange": "dans l'intervalle",
    "zw_outrange": "hors de l'intervalle",
    "zw_positive": "positif",
    "zw_zero": "zéro",
    "zw_negative": "négatif",
    "zw_go": "partez",
    "zw_ok": "ok",
    "zw_pass": "reçu",
    "zw_fail": "recalé",
    "zw_prime": "premier",
    "zw_notprime": "pas premier",
    "zw_open": "ouvert",
    "zw_redwins": "Le rouge gagne",
    "zw_bluewins": "Le bleu gagne",
    "zw_tie": "Égalité",
    "zw_pick": "Choisis un nombre, 0 pour arrêter",
    "zw_bye": "Au revoir",
}

speaks("fr", "Français", FR)
