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
    "ask_go": "Mettre",
    "ask_tip": "Tape ce qui manque dans la case en dessous",
    "ask_pick": "Choisis une forme",
    "ask_join": "Relier",
    "ask_start": "Commencer {name} à",
    "ask_input": "Le demander à l'exécution",
    "ask_forever": "La boucle de la ligne {line} ne s'arrête jamais. Ajouter à la fin",
    "ask_stop_when": "Ou l'arrêter quand",
    "ask_zero_else": "Quand {name} vaut 0, utiliser plutôt",
    "ask_zero_show": "Quand {name} vaut 0, afficher plutôt",
    "ask_zero_eg": "Rien à diviser",
    "ask_zero_skip": "La sauter quand {name} vaut 0",
    "ask_args": "{name} a aussi besoin de {what}",
    "ask_args_cut": "Enlever les {n} en trop",
    "ask_deep": "{name} doit pouvoir s'arrêter : s'arrêter quand",
    "ask_deep_give": "et renvoyer",
    "ask_use": "Il n'y a pas de {name}. Utiliser plutôt",
    "ask_here": "Qu'est-ce qui va ici ?",
    "ask_line": "Écrire la ligne {line} ainsi",
    "ask_until": "Continuer jusqu'à ce que",
    "ask_close": "{text} va après la ligne",
    "ask_same": "C'est déjà la ligne telle quelle. Modifie-la d'abord.",
    "ask_stale": "Le pseudocode a changé depuis. Reconstruis-le d'abord.",
    "ask_bad_empty": "Tape d'abord quelque chose.",
    "ask_bad_pick": "Choisis-en un d'abord.",
    "ask_bad_open": "Un {text} n'est jamais fermé.",
    "ask_bad_shut": "Un {text} ne ferme rien.",
    "ask_bad_name": "Il faut un seul nom, comme total.",
    "ask_bad_line": "Choisis une ligne de {from} à {to}.",
    "ask_write_in": "Écrire dedans",
    "ask_write_eg": "total = total + 1",
    "ask_arrow_to": "Flèche d'ici vers",
    "ask_arrow_from": "Flèche vers ici depuis",
    "ask_name_way": "Mots pour cette sortie",
    "ask_leave_when": "Sortir de la boucle quand",
    "ask_end_after": "Mettre une Fin après",
    "ask_arrow_into": "Flèche vers « {name} » depuis",
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
    "in_most": "Lu les {n} fichiers les plus importants sur {all}. Tous les fichiers sont dans la liste au-dessus du code.",
    "in_reading": "Lecture de {n} fichiers sur {of}…",
    "in_sorting": "Tri de {n} fichiers…",
    "in_found": "{n} fichiers trouvés…",
    "in_more_items": "…et {n} de plus.",
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
    "tests_open": "Cas de test",
    "tests_tip": "Le vérifier avec les entrées de votre choix et la sortie attendue",
    "tests_head": "Cas de test",
    "tests_one": "Test {n}",
    "tests_typed": "Entrée, une par ligne",
    "tests_want": "Sortie attendue, une par ligne",
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
    "trace_open": "Table de trace",
    "trace_tip": "Chaque changement fait par l’exécution, pas à pas, en tableau",
    "trace_head": "Table de trace",
    "trace_line": "Ligne",
    "trace_out": "Sortie",
    "trace_main": "Programme principal",
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
    "h_write": "En texte",
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
    "mode_code": "Texte",
    "mode_hand": "Dessin",
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
    "lang_top": "Les plus importants · {n} sur {all}",
    "lang_more": "+{n} de plus",
    "lang_more_tip": "Tous les fichiers, pour chercher et ouvrir",
    "lang_less": "Masquer la liste",
    "lang_find": "Chercher un fichier",
    "lang_count": "{n} fichiers",
    "lang_list_read": "Lus à la construction · {n}",
    "lang_list_rest": "Aussi dans le dossier · {n}",
    "lang_list_none": "Aucun fichier n'a cela dans son nom ou son dossier.",
    "lang_list_bring": "L'ouvre, et le lit avec les autres à la construction",
    "lang_drop_ask": "Retirer {name} ?",
    "lang_drop_said": "Son code part avec lui.",
    "lang_place": "Écrivez ou collez un programme en Python, Java, C#, C++, JavaScript, TypeScript, C, Kotlin, Swift, Go ou Rust, puis cliquez sur Dessiner.",
    "lang_stale": "Le pseudocode a changé depuis.",
    "lang_rewrite": "Réécrire en {lang}",
    "lang_rewrite_tip": "Remplace le code par le pseudocode écrit en {lang}",
    "lang_made": "Créé à partir de votre code. Modifiez-le sous Texte.",
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
    "lang_fix_split": "Mettre la suite de la ligne sur une ligne à part",
    "lang_fix_split_at": "Mettre la suite de la ligne {line} sur une ligne à part",
    "lang_fixing": "Correction des bugs et des problèmes",
    "lang_fixed_one": "1 erreur corrigée",
    "lang_fixed_many": "{n} erreurs corrigées",
    "lang_fixed_tip": "Voir ce qui n'allait pas et ce qui a été fait",
    "lang_fixed_undo": "Remettre comme avant",
    "lang_reading": "Lecture du code",
    "lang_finding": "Recherche des bogues et des problèmes",
    "lang_listing": "Liste de ce qui reste",
    "lang_too_big": "Cette erreur est trop grande pour être corrigée. Voici tout ce qu'il faut regarder :",
    "lang_left_one": "1 problème n'a pas pu être corrigé :",
    "lang_left_many": "{n} problèmes n'ont pas pu être corrigés :",
    "lang_list_more": "…et d'autres, non affichés ici.",
    "lang_put_found": "Corriger quand même les {n} trouvés",
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
    "h_info": "Comment dessiner",
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
    "games": "Jeux",
    "games_tip": "Des jeux à jouer, et à suivre en organigramme pendant la partie",
    "gm_head": "Jeux",
    "gm_small": "Jeux rapides",
    "gm_big": "Grands jeux",
    "gm_charts": "Schémas",
    "gm_many": "Plusieurs",
    "gm_one": "Un seul",
    "gm_many_tip": "Chaque module et chaque fonction a son propre schéma, à côté du principal",
    "gm_one_tip": "Chaque module et chaque fonction est dessiné là où il est appelé, et le jeu tient en un seul schéma",
    "gm_size": "{n} lignes · {charts}",
    "gm_charts_n": "{n} schémas",
    "gm_chart_one": "un schéma",
    "gm_how": "Comment jouer",
    "gm_play": "Jouer",
    "gm_play_tip": "Tout exécuter d'un coup, pour jouer",
    "gm_all": "Tous les jeux",
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
    "e_library": "Emprunts à la bibliothèque",
    "e_inventory": "Gestion du stock",
    "e_tictactoe": "Morpion",
    "e_weather": "Deux semaines de météo",
    "e_sortsearch": "Trier et chercher des notes",
    "e_hailstone": "Les nombres grêlons",
    "e_rainfall": "La pluie mois par mois",
    "e_savings": "L’épargne année après année",
    "e_classlist": "Une liste de classe en fiches",
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
    "eg_head": "Exemples",
    "eg_lines": "{n} lignes",
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
    "o_onechart": "Modules et fonctions dans un seul schéma",
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
    "wipe_head": "Recommencer",
    "wipe_hint": "Efface tout sur cette page, pour repartir de zéro.",
    "wipe_open": "Tout effacer…",
    "wipe_title1": "Tout effacer ?",
    "wipe_said": "Cela enlève tout ce que tu as fait ici :",
    "wipe_l_work": "le pseudocode, le diagramme et ses tests",
    "wipe_l_hand": "le dessin fait à la main",
    "wipe_l_code": "le code et tous ses fichiers",
    "wipe_l_run": "l'exécution, ce qu'elle a affiché et sa table de trace",
    "wipe_saves": "Aussi la progression enregistrée et les énigmes résolues",
    "wipe_settings": "Aussi les couleurs, les formes et les réglages",
    "wipe_keep": "Garder mon travail",
    "wipe_next": "Continuer…",
    "wipe_title2": "L'enregistrer d'abord ?",
    "wipe_save_q": "Veux-tu enregistrer ton travail avant qu'il soit effacé ?",
    "wipe_save_said": "Une copie enregistrée en fichier se rouvre avec Fichiers, Ouvrir un fichier.",
    "wipe_save": "Enregistrer une copie d'abord",
    "wipe_saved": "Copie enregistrée sous {name}.",
    "wipe_type": "Pour tout effacer, tape {word} ci-dessous. Cela ne peut pas être annulé.",
    "wipe_word": "EFFACER",
    "wipe_back": "Retour",
    "wipe_go": "Tout effacer",
    "wipe_going": "Effacement…",
    "keep_save": "Enregistrer la progression d'abord",
    "keep_saved": "Enregistré dans Progression enregistrée, place {n}.",
    "keep_saved_file": "La progression enregistrée est pleine, alors une copie a été enregistrée en fichier.",
    "open_head": "Ouvrir ceci à la place de ton travail ?",
    "open_said": "Il y a du travail sur la page. Ouvrir ceci le met à sa place.",
    "open_no": "Annuler",
    "open_yes": "L'ouvrir",
    "sync_head_code": "Remplacer le pseudocode ?",
    "sync_head_hand": "Remplacer le dessin ?",
    "sync_head_lang": "Remplacer le code ?",
    "sync_code_from_hand": "Le pseudocode a ses propres changements, et le dessin a changé depuis. Continuer écrit le programme du dessin à la place du pseudocode.",
    "sync_code_from_lang": "Le pseudocode a ses propres changements, et le code a changé depuis. Continuer lit le code dans le pseudocode à sa place.",
    "sync_hand_from_code": "Le dessin a ses propres changements, et le pseudocode a changé depuis. Continuer dessine le programme du pseudocode à la place du dessin.",
    "sync_lang_from_code": "Le code ici est le tien, et le pseudocode a changé depuis. Continuer écrit le programme du pseudocode en code à sa place.",
    "sync_keep": "Garder celui-ci",
    "sync_go": "Le remplacer",
    "sync_unfinished": "Le dessin n'est pas encore un programme complet, alors le pseudocode est resté tel quel.",
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
    "tr_pick": "Le langage dans lequel traduire votre code",
    # (its own words: tr_head is the ground's, 40-land.js, 2026-10-03)
    "tl_head": "Traduire le code", "tl_go": "Traduire",
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
    "k_hand": "Dessiner",
    "k_lang": "En écrivant du code",
    "k_build": "Dessiner l'organigramme (Dessin : le vérifier)",
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
    "e_library_p": program("""
        Start
        Declare Integer choix
        Declare Integer place
        Declare String titre
        rayon = []
        Call append(rayon, nouveauLivre("Le Petit Monde de Charlotte", "E. B. White"))
        Call append(rayon, nouveauLivre("Hachette", "Gary Paulsen"))
        Call append(rayon, nouveauLivre("Le Passage", "Louis Sachar"))
        Call append(rayon, nouveauLivre("Wonder", "R. J. Palacio"))
        Do
            Display "1 voir les livres  2 emprunter  3 rendre  4 quitter"
            Input choix
            Select Case choix
                Case 1
                    Call montrerLivres(rayon)
                Case 2
                    Display "Quel titre veux-tu ?"
                    Input titre
                    place = chercherLivre(rayon, titre)
                    If place = -1 Then
                        Display "Il n'y a aucun livre appelé ", titre
                    Else If rayon[place].sorti Then
                        Display titre, " est déjà emprunté"
                    Else
                        rayon[place].sorti = True
                        Display "Tu as emprunté ", rayon[place].titre
                    End If
                Case 3
                    Display "Quel titre rends-tu ?"
                    Input titre
                    place = chercherLivre(rayon, titre)
                    If place = -1 Then
                        Display "Ce livre n'est pas de cette bibliothèque"
                    Else If Not rayon[place].sorti Then
                        Display rayon[place].titre, " n'était pas emprunté"
                    Else
                        rayon[place].sorti = False
                        Display "Merci d'avoir rendu ", rayon[place].titre
                    End If
                Case 4
                    Display "Au revoir"
                Case Else
                    Display "Choisis 1, 2, 3 ou 4"
            End Select
        Until choix = 4
        Display "Livres encore empruntés : ", compterSortis(rayon)
        Stop

        Function nouveauLivre(titre, auteur)
            un = New Livre
            un.titre = titre
            un.auteur = auteur
            un.sorti = False
            Return un
        End Function

        Function Integer chercherLivre(livres, titre)
            For i = 0 To length(livres) - 1
                If toLower(livres[i].titre) = toLower(titre) Then
                    Return i
                End If
            End For
            Return -1
        End Function

        Module montrerLivres(livres)
            For Each l In livres
                If l.sorti Then
                    Display l.titre, " de ", l.auteur, " (emprunté)"
                Else
                    Display l.titre, " de ", l.auteur, " (en rayon)"
                End If
            End For
        End Module

        Function Integer compterSortis(livres)
            Declare Integer n
            n = 0
            For Each l In livres
                If l.sorti Then
                    n = n + 1
                End If
            End For
            Return n
        End Function
    """),
    "e_inventory_p": program("""
        Start
        Declare Integer choix
        Declare Integer quantite
        Declare String article
        stock = {"pommes": 40, "pain": 12, "lait": 6, "oeufs": 30}
        prix = {"pommes": 0.5, "pain": 2.25, "lait": 3.1, "oeufs": 0.3}
        Do
            Display "1 voir le stock  2 vendre  3 réapprovisionner  4 quitter"
            Input choix
            Select Case choix
                Case 1
                    Call montrerStock(stock, prix)
                Case 2
                    Display "Vendre quel article ?"
                    Input article
                    If Not existe(stock, article) Then
                        Display "Nous ne vendons pas de ", article
                    Else
                        Display "Combien ?"
                        Input quantite
                        If quantite <= 0 Then
                            Display "Vends-en au moins un"
                        Else If quantite > stock[article] Then
                            Display "Il n'en reste que ", stock[article]
                        Else
                            stock[article] = stock[article] - quantite
                            Display "Vendu ", quantite, " ", article, " pour $", round(quantite * prix[article], 2)
                        End If
                    End If
                Case 3
                    Display "Réapprovisionner quel article ?"
                    Input article
                    If Not existe(stock, article) Then
                        Display "Nous ne vendons pas de ", article
                    Else
                        Display "Combien en sont arrivés ?"
                        Input quantite
                        If quantite <= 0 Then
                            Display "Une livraison en a au moins un"
                        Else
                            stock[article] = stock[article] + quantite
                            Display "Il y a maintenant ", stock[article], " ", article
                        End If
                    End If
                Case 4
                    Display "On ferme"
                Case Else
                    Display "Choisis 1, 2, 3 ou 4"
            End Select
        Until choix = 4
        Display "Le stock vaut $", valeur(stock, prix)
        Stop

        Module montrerStock(stock, prix)
            For Each nom In stock
                If stock[nom] < 10 Then
                    Display nom, " : ", stock[nom], " à $", prix[nom], " -- bientôt épuisé"
                Else
                    Display nom, " : ", stock[nom], " à $", prix[nom]
                End If
            End For
        End Module

        Function Boolean existe(stock, article)
            For Each nom In stock
                If nom = article Then
                    Return True
                End If
            End For
            Return False
        End Function

        Function Real valeur(stock, prix)
            Declare Real total
            total = 0
            For Each nom In stock
                total = total + stock[nom] * prix[nom]
            End For
            Return round(total, 2)
        End Function
    """),
    "e_tictactoe_p": program("""
        Start
        Declare Integer coup
        Declare Integer tours
        Declare String joueur
        Declare String gagnant
        plateau = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
        joueur = "X"
        gagnant = ""
        tours = 0
        While gagnant = "" And tours < 9
            Call montrerPlateau(plateau)
            Display "Joueur ", joueur, ", choisis une case de 1 à 9"
            Input coup
            While coup < 1 Or coup > 9
                Display "Les cases vont de 1 à 9"
                Input coup
            End While
            If plateau[coup - 1] <> " " Then
                Display "Cette case est déjà prise"
            Else
                plateau[coup - 1] = joueur
                tours = tours + 1
                If aGagne(plateau, joueur) Then
                    gagnant = joueur
                Else If joueur = "X" Then
                    joueur = "O"
                Else
                    joueur = "X"
                End If
            End If
        End While
        Call montrerPlateau(plateau)
        If gagnant = "" Then
            Display "Match nul"
        Else
            Display "Le joueur ", gagnant, " gagne !"
        End If
        Stop

        Module montrerPlateau(cases)
            For ligne = 0 To 2
                Display " ", cases[ligne * 3], " | ", cases[ligne * 3 + 1], " | ", cases[ligne * 3 + 2]
                If ligne < 2 Then
                    Display "---+---+---"
                End If
            End For
        End Module

        Function Boolean aGagne(cases, marque)
            lignes = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
            For Each trois In lignes
                If cases[trois[0]] = marque And cases[trois[1]] = marque And cases[trois[2]] = marque Then
                    Return True
                End If
            End For
            Return False
        End Function
    """),
    "e_weather_p": program("""
        Start
        Declare Real moyenne
        Declare Integer auDessus
        Declare Integer serie
        Declare Integer plusLongue
        maximales = [61, 64, 70, 73, 69, 66, 72, 78, 81, 79, 75, 68, 63, 67]
        Display "Maximales du jour : ", maximales
        moyenne = moyenneDe(maximales)
        Display "Maximale moyenne : ", round(moyenne, 1)
        Display "Jour le plus chaud : ", plusGrand(maximales), "   Jour le plus frais : ", plusPetit(maximales)
        auDessus = 0
        serie = 0
        plusLongue = 0
        For jour = 1 To length(maximales)
            If maximales[jour - 1] > moyenne Then
                auDessus = auDessus + 1
                serie = serie + 1
                If serie > plusLongue Then
                    plusLongue = serie
                End If
            Else
                serie = 0
            End If
            Display "Jour ", jour, " : ", barre(maximales[jour - 1]), " ", maximales[jour - 1]
        End For
        Display auDessus, " jours ont été plus chauds que la moyenne"
        Display "La plus longue période chaude a duré ", plusLongue, " jours"
        Stop

        Function Real moyenneDe(valeurs)
            Declare Real total
            total = 0
            For Each v In valeurs
                total = total + v
            End For
            Return total / length(valeurs)
        End Function

        Function Integer plusGrand(valeurs)
            Declare Integer meilleur
            meilleur = valeurs[0]
            For Each v In valeurs
                If v > meilleur Then
                    meilleur = v
                End If
            End For
            Return meilleur
        End Function

        Function Integer plusPetit(valeurs)
            Declare Integer meilleur
            meilleur = valeurs[0]
            For Each v In valeurs
                If v < meilleur Then
                    meilleur = v
                End If
            End For
            Return meilleur
        End Function

        Function String barre(Integer degres)
            Declare String etoiles
            etoiles = ""
            For i = 1 To degres div 5
                etoiles = etoiles + "*"
            End For
            Return etoiles
        End Function
    """),
    "e_sortsearch_p": program("""
        Start
        Declare Integer cible
        Declare Integer place
        Declare Integer echanges
        notes = [72, 95, 64, 88, 79, 91, 57, 83]
        Display "Notes dans l'ordre d'arrivée : ", notes
        echanges = triBulles(notes)
        Display "Triées : ", notes
        Display "Le tri a demandé ", echanges, " échanges"
        Display "Quelle note dois-je chercher ?"
        Input cible
        place = rechercheDichotomique(notes, cible)
        If place = -1 Then
            Display cible, " ne fait pas partie des notes"
        Else
            Display cible, " est la numéro ", place + 1, " sur ", length(notes), " en partant du bas"
        End If
        Stop

        Function Integer triBulles(valeurs)
            Declare Integer echanges
            Declare Integer tampon
            Declare Boolean echange
            echanges = 0
            Do
                echange = False
                For i = 0 To length(valeurs) - 2
                    If valeurs[i] > valeurs[i + 1] Then
                        tampon = valeurs[i]
                        valeurs[i] = valeurs[i + 1]
                        valeurs[i + 1] = tampon
                        echanges = echanges + 1
                        echange = True
                    End If
                End For
            Until Not echange
            Return echanges
        End Function

        Function Integer rechercheDichotomique(valeurs, cible)
            Declare Integer bas
            Declare Integer haut
            Declare Integer milieu
            bas = 0
            haut = length(valeurs) - 1
            While bas <= haut
                milieu = (bas + haut) div 2
                If valeurs[milieu] = cible Then
                    Return milieu
                Else If valeurs[milieu] < cible Then
                    bas = milieu + 1
                Else
                    haut = milieu - 1
                End If
            End While
            Return -1
        End Function
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
    # ---- the games (37-games.js): a name, a line saying what it is, how
    # to play it, and the program -- written in modules, so it is a
    # chart to each one, or one chart with the option that draws every
    # module where it is called.  Smallest first; the last four are big.
    "g_coin": "Pile ou Face",
    "g_coin_d": "Annonce pile ou face, cinq lancers de suite",
    "g_coin_h": "Annonce chaque lancer avant que la pièce retombe : tape 1 pour face ou 2 pour pile. Il y a cinq lancers. Combien en devineras-tu ?",
    "g_highlow": "Plus Haut ou Plus Bas",
    "g_highlow_d": "Devine si la carte suivante battra celle-ci",
    "g_highlow_h": "Une carte est retournée. Tape 1 si tu penses que la suivante sera plus haute, ou 2 si elle sera plus basse. L'as est la plus basse. Chaque erreur te coûte une de tes 3 vies, et il y a dix cartes en tout.",
    "g_sticks": "Les Vingt et Un Bâtons",
    "g_sticks_d": "Prends 1, 2 ou 3 bâtons, mais pas le dernier",
    "g_sticks_h": "Il y a 21 bâtons. L'ordinateur et toi en prenez 1, 2 ou 3 à tour de rôle, et celui qui prend le dernier bâton perd. L'ordinateur connaît une astuce. Sauras-tu la trouver ?",
    "g_dice": "Duel de Dés",
    "g_dice_d": "Deux dés contre l'ordinateur, le premier à 3 manches",
    "g_dice_h": "Appuie sur Entrée pour lancer deux dés, puis l'ordinateur lance les siens. Le plus haut total gagne la manche, et un double compte deux fois. Le premier à gagner 3 manches gagne le duel.",
    "g_hangman": "Le Pendu",
    "g_hangman_d": "Trouve le mot caché lettre par lettre",
    "g_hangman_h": "Devine le mot caché lettre par lettre. Chaque mauvaise lettre ajoute un morceau au dessin, et six erreurs terminent la partie.",
    "g_codebreak": "Casse-Code",
    "g_codebreak_d": "Trouve un code secret de 4 chiffres en 10 essais",
    "g_codebreak_h": "L'ordinateur choisit un code de 4 chiffres, chacun de 1 à 6. Tape un essai comme 1234. On te dit combien de chiffres sont justes et bien placés, et combien sont justes mais mal placés. Trouve-le en 10 essais.",
    "g_dungeon": "Évasion du Donjon",
    "g_dungeon_d": "Une aventure textuelle avec une lampe, une clé, un troll et de l'or",
    "g_dungeon_h": "Parcours le donjon en tapant n, s, e ou o. Tape regarde pour regarder autour de toi, prends pour ramasser quelque chose et sac pour voir ce que tu portes. Trouve l'or et ressors-le par la grille avant que ta torche ne s'éteigne, et méfie-toi du troll.",
    "g_connect": "Puissance 4",
    "g_connect_d": "Lâche tes jetons et aligne-en quatre avant l'ordinateur",
    "g_connect_h": "Tu es X et l'ordinateur est O. Tape une colonne de 1 à 7 pour y lâcher un jeton. Quatre alignés gagnent : en ligne, en colonne ou en diagonale.",
    "g_blackjack": "Blackjack",
    "g_blackjack_d": "Bats le croupier jusqu'à 21 sans dépasser",
    "g_blackjack_h": "Mise une partie de tes 100 jetons. Tape ensuite 1 pour une carte de plus, 2 pour rester ou 3 pour doubler ta mise contre une dernière carte. Approche-toi plus de 21 que le croupier sans dépasser. V, D et R valent 10, et un A vaut 1 ou 11.",
    "g_battleship": "Bataille Navale",
    "g_battleship_d": "Coule la flotte ennemie avant qu'elle ne coule la tienne",
    "g_battleship_h": "Chaque camp cache trois navires sur une mer de 6 sur 6. Tire en tapant une lettre et un nombre, par exemple B4. X est un touché et o un raté. Coule tous les navires ennemis avant que l'ennemi ne coule les tiens.",
    "g_math": "Calcul éclair",
    "g_math_d": "Huit calculs, avec un bonus pour chaque bonne réponse d'affilée",
    "g_math_h": "Huit calculs arrivent l'un après l'autre : additions, soustractions et tables de multiplication. Tape chaque réponse. Une bonne réponse rapporte un point de plus que la précédente de la série, alors garde la série en vie.",
    "g_pig": "Pig",
    "g_pig_d": "Lance autant que tu l'oses, mais un 1 fait tout perdre",
    "g_pig_h": "À ton tour, lance le dé autant de fois que tu veux en additionnant ce que tu obtiens. Tape l pour relancer ou g pour garder tes points. Un 1 fait perdre tout ce que tu as gagné pendant ce tour. L'ordinateur joue aussi, et le premier à 50 gagne.",
    "g_lander": "Alunissage",
    "g_lander_d": "Brûle juste assez de carburant pour te poser en douceur sur la Lune",
    "g_lander_h": "Tu pars à 500 m au-dessus de la Lune, en chute. À chaque seconde, tape combien de carburant brûler, de 0 à 20 : plus tu en brûles, plus tu freines, mais le carburant s'épuise. Pose-toi à 5 m par seconde ou moins pour alunir sans danger.",
    "g_mines": "Démineur",
    "g_mines_d": "Ouvre chaque case sûre d'un champ de mines, en t'aidant des chiffres",
    "g_mines_h": "Sept mines sont cachées dans un champ de 6 sur 6 cases. Tape une case comme B4 pour l'ouvrir. Un chiffre indique combien des cases voisines cachent une mine, et une case vide ouvre toutes ses voisines. Tape M et une case, comme MB4, pour marquer une case dont tu es sûr qu'elle cache une mine, ou pour enlever la marque. Ouvre toutes les cases sans mine pour gagner.",
    "g_coin_p": program("""
        Start
        Declare Integer choix
        Declare Integer face
        Declare Integer reussis
        reussis = 0
        For lancer = 1 To 5
            Display "Lancer ", lancer, " sur 5. Annonce : 1 pour face, 2 pour pile"
            Input choix
            While choix < 1 Or choix > 2
                Display "Tape 1 pour face ou 2 pour pile"
                Input choix
            End While
            face = random(1, 2)
            Display "La pièce tombe sur ", nomFace(face), " !"
            If choix = face Then
                reussis = reussis + 1
                Display "Bien vu"
            Else
                Display "Pas cette fois"
            End If
        End For
        Display "Tu as deviné ", reussis, " sur 5"
        If reussis >= 4 Then
            Display "Quelle chance !"
        End If
        Stop

        Function String nomFace(Integer face)
            Declare String nom
            If face = 1 Then
                nom = "face"
            Else
                nom = "pile"
            End If
            Return nom
        End Function
    """),
    "g_highlow_p": program("""
        Start
        Declare Integer carte
        Declare Integer suivante
        Declare Integer choix
        Declare Integer points
        Declare Integer vies
        Declare Integer tour
        carte = random(1, 13)
        points = 0
        vies = 3
        tour = 0
        Display "La carte suivante sera-t-elle plus haute ou plus basse ? L'as est la plus basse. Tu as 3 vies"
        While tour < 10 And vies > 0
            tour = tour + 1
            Display "Carte ", tour, " sur 10 : ", nomCarte(carte), ". La suivante sera-t-elle 1 plus haute ou 2 plus basse ?"
            Input choix
            While choix < 1 Or choix > 2
                Display "Tape 1 pour plus haute ou 2 pour plus basse"
                Input choix
            End While
            suivante = random(1, 13)
            Display "La carte suivante : ", nomCarte(suivante)
            If suivante = carte Then
                Display "La même encore ! Celle-là ne compte pas"
            Else If (choix = 1 And suivante > carte) Or (choix = 2 And suivante < carte) Then
                points = points + 1
                Display "Gagné ! Points : ", points
            Else
                vies = vies - 1
                Display "Perdu ! Vies restantes : ", vies
            End If
            carte = suivante
        End While
        Display "Partie terminée. Tu as marqué ", points, " points"
        Call afficherNote(points)
        Stop

        Function String nomCarte(Integer n)
            noms = ["As", "Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf", "Dix", "Valet", "Dame", "Roi"]
            Return noms[n - 1]
        End Function

        Module afficherNote(Integer points)
            If points >= 8 Then
                Display "Un vrai as des cartes !"
            Else If points >= 5 Then
                Display "Bien joué"
            Else
                Display "Tu feras mieux la prochaine fois"
            End If
        End Module
    """),
    "g_sticks_p": program("""
        Start
        Declare Integer batons
        Declare Integer nombre
        Declare Integer premier
        Declare Boolean aToi
        batons = 21
        Display "Il y a 21 bâtons. Prends-en 1, 2 ou 3 à la fois. Celui qui prend le dernier bâton perd"
        Display "Qui commence ? 1 pour toi, 2 pour l'ordinateur"
        Input premier
        While premier < 1 Or premier > 2
            Display "Tape 1 ou 2"
            Input premier
        End While
        aToi = premier = 1
        While batons > 0
            Call afficherBatons(batons)
            If aToi Then
                Display "Combien en prends-tu ?"
                Input nombre
                While nombre < 1 Or nombre > 3 Or nombre > batons
                    Display "Prends-en 1, 2 ou 3, et pas plus qu'il n'en reste"
                    Input nombre
                End While
            Else
                nombre = ordiPrend(batons)
                Display "L'ordinateur en prend ", nombre
            End If
            batons = batons - nombre
            aToi = Not aToi
        End While
        If aToi Then
            Display "L'ordinateur a pris le dernier bâton. Tu gagnes !"
        Else
            Display "Tu as pris le dernier bâton, donc l'ordinateur gagne"
            Display "Il y a une astuce. Regarde combien de bâtons l'ordinateur te laisse"
        End If
        Stop

        Module afficherBatons(Integer restants)
            Declare String rangee
            rangee = ""
            For i = 1 To restants
                rangee = rangee + "|"
            End For
            Display rangee, "  (", restants, " restants)"
        End Module

        Function Integer ordiPrend(Integer restants)
            Declare Integer combien
            combien = (restants - 1) mod 4
            If combien = 0 Then
                combien = random(1, 3)
            End If
            If combien > restants Then
                combien = restants
            End If
            Return combien
        End Function
    """),
    "g_dice_p": program("""
        Start
        Declare Integer mesVictoires
        Declare Integer sesVictoires
        Declare Integer manche
        Declare Integer a
        Declare Integer b
        Declare Integer miens
        Declare Integer siens
        Declare String pret
        mesVictoires = 0
        sesVictoires = 0
        manche = 0
        Display "Duel de dés : la plus haute paire de dés gagne la manche. Un double compte deux fois. Le premier à 3 gagne"
        While mesVictoires < 3 And sesVictoires < 3
            manche = manche + 1
            Display "Manche ", manche, ". Appuie sur Entrée pour lancer"
            Input pret
            a = lancerDe()
            b = lancerDe()
            miens = pointsDe(a, b)
            Call afficherLancer("Toi", a, b, miens)
            a = lancerDe()
            b = lancerDe()
            siens = pointsDe(a, b)
            Call afficherLancer("L'ordinateur", a, b, siens)
            If miens > siens Then
                mesVictoires = mesVictoires + 1
                Display "Tu gagnes la manche !"
            Else If siens > miens Then
                sesVictoires = sesVictoires + 1
                Display "L'ordinateur gagne la manche"
            Else
                Display "Égalité, personne ne marque"
            End If
            Display "Manches gagnées : toi ", mesVictoires, ", l'ordinateur ", sesVictoires
        End While
        If mesVictoires = 3 Then
            Display "Tu gagnes le duel !"
        Else
            Display "L'ordinateur gagne le duel"
        End If
        Stop

        Function Integer lancerDe()
            Return random(1, 6)
        End Function

        Function Integer pointsDe(Integer premier, Integer second)
            Declare Integer points
            points = premier + second
            If premier = second Then
                points = points * 2
            End If
            Return points
        End Function

        Module afficherLancer(String qui, Integer premier, Integer second, Integer points)
            Display qui, " : ", premier, " et ", second, ", soit ", points, " points"
            If premier = second Then
                Display "Un double ! Il compte deux fois"
            End If
        End Module
    """),
    "g_hangman_p": program("""
        Start
        Declare String secret
        Declare String essayees
        Declare String lettre
        Declare Integer erreurs
        Declare Boolean gagne
        mots = ["ballon", "jungle", "bougie", "pirate", "sorcier", "tortue", "dragon", "guitare", "baleine", "volcan", "pingouin", "couverture"]
        secret = mots[random(0, length(mots) - 1)]
        essayees = ""
        erreurs = 0
        gagne = False
        Display "Le pendu ! Devine le mot lettre par lettre. Six erreurs et tu perds"
        While erreurs < 6 And Not gagne
            Call afficherPotence(erreurs)
            Display "Le mot : ", masque(secret, essayees)
            Display "Propose une lettre"
            Input lettre
            lettre = toLower(lettre)
            If length(lettre) <> 1 Then
                Display "Une seule lettre à la fois, s'il te plaît"
            Else If contains(essayees, lettre) Then
                Display "Tu as déjà essayé ", lettre
            Else
                essayees = essayees + lettre
                If contains(secret, lettre) Then
                    Display "Oui, il y a un ", lettre
                Else
                    erreurs = erreurs + 1
                    Display "Pas de ", lettre, ". Erreurs : ", erreurs, " sur 6"
                End If
                gagne = toutTrouve(secret, essayees)
            End If
        End While
        Call afficherPotence(erreurs)
        If gagne Then
            Display "Trouvé : ", secret, " ! Tu gagnes"
        Else
            Display "Plus d'essais. Le mot était ", secret
        End If
        Stop

        Function String masque(String mot, String lettres)
            Declare String affiche
            Declare String car
            affiche = ""
            For i = 0 To length(mot) - 1
                car = substring(mot, i, i + 1)
                If contains(lettres, car) Then
                    affiche = affiche + car + " "
                Else
                    affiche = affiche + "_ "
                End If
            End For
            Return affiche
        End Function

        Function Boolean toutTrouve(String mot, String lettres)
            Declare Boolean trouve
            trouve = True
            For i = 0 To length(mot) - 1
                If Not contains(lettres, substring(mot, i, i + 1)) Then
                    trouve = False
                End If
            End For
            Return trouve
        End Function

        Module afficherPotence(Integer fautes)
            tetes = ["   ", " O ", " O ", " O ", " O ", " O ", " O "]
            corps = ["   ", "   ", " | ", "-| ", "-|-", "-|-", "-|-"]
            jambes = ["   ", "   ", "   ", "   ", "   ", "|  ", "| |"]
            Display "  +---+"
            Display "  |   |"
            Display "  |  ", tetes[fautes]
            Display "  |  ", corps[fautes]
            Display "  |  ", jambes[fautes]
            Display "==+=="
        End Module
    """),
    "g_codebreak_p": program("""
        Start
        Declare String code
        Declare String essai
        Declare Boolean valide
        Declare Boolean trouve
        Declare Integer exacts
        Declare Integer proches
        Declare Integer essais
        code = creerCode()
        essais = 0
        trouve = False
        Display "Je pense à un code de 4 chiffres. Chaque chiffre va de 1 à 6, et un chiffre peut revenir"
        Display "Après chaque essai, je dis combien de chiffres sont à la bonne place, et combien sont justes mais mal placés"
        While Not trouve And essais < 10
            essais = essais + 1
            Display "Essai ", essais, " sur 10 :"
            Input essai
            valide = estValide(essai)
            While Not valide
                Display "Tape 4 chiffres de 1 à 6, par exemple 1234"
                Input essai
                valide = estValide(essai)
            End While
            exacts = bonnePlace(code, essai)
            proches = chiffresCommuns(code, essai) - exacts
            Display essai, "   bien placés : ", exacts, "   mal placés : ", proches
            If exacts = 4 Then
                trouve = True
            End If
        End While
        If trouve Then
            Display "Code trouvé en ", essais, " essais !"
        Else
            Display "Plus d'essais. Le code était ", code
        End If
        Stop

        Function String creerCode()
            Declare String cree
            cree = ""
            For i = 1 To 4
                cree = cree + random(1, 6)
            End For
            Return cree
        End Function

        Function Boolean estValide(String texte)
            Declare Boolean bon
            bon = length(texte) = 4
            If bon Then
                For i = 0 To 3
                    If Not contains("123456", substring(texte, i, i + 1)) Then
                        bon = False
                    End If
                End For
            End If
            Return bon
        End Function

        Function Integer bonnePlace(String secret, String essaye)
            Declare Integer justes
            justes = 0
            For i = 0 To 3
                If substring(secret, i, i + 1) = substring(essaye, i, i + 1) Then
                    justes = justes + 1
                End If
            End For
            Return justes
        End Function

        Function Integer chiffresCommuns(String secret, String essaye)
            Declare Integer communs
            Declare Integer dansSecret
            Declare Integer dansEssai
            Declare String chiffre
            communs = 0
            For d = 1 To 6
                chiffre = "" + d
                dansSecret = 0
                dansEssai = 0
                For i = 0 To 3
                    If substring(secret, i, i + 1) = chiffre Then
                        dansSecret = dansSecret + 1
                    End If
                    If substring(essaye, i, i + 1) = chiffre Then
                        dansEssai = dansEssai + 1
                    End If
                End For
                If dansSecret < dansEssai Then
                    communs = communs + dansSecret
                Else
                    communs = communs + dansEssai
                End If
            End For
            Return communs
        End Function
    """),
    "g_dungeon_p": program("""
        Start
        Declare Integer salle
        Declare Integer cible
        Declare Integer direction
        Declare Integer sante
        Declare Integer pas
        Declare String ordre
        Declare Boolean trollLa
        Declare Boolean enJeu
        objets = ["", "", "lampe", "épée", "clé", "", "or"]
        sorties = [[1, -1, -1, -1], [5, 0, 3, 2], [-1, 4, 1, -1], [-1, -1, -1, 1], [2, -1, -1, -1], [6, 1, -1, -1], [-1, 5, -1, -1]]
        sac = []
        salle = 0
        sante = 3
        pas = 0
        trollLa = True
        enJeu = True
        Display "ÉVASION DU DONJON"
        Display "Trouve l'or et ressors-le par la grille avant que ta torche ne s'éteigne"
        Display "Tape n, s, e ou o pour marcher, ou regarde, prends, sac ou aide"
        Call decrire(salle, objets, sac)
        While enJeu
            Display "Et maintenant ?"
            Input ordre
            ordre = toLower(ordre)
            direction = directionDe(ordre)
            If direction >= 0 Then
                cible = sorties[salle][direction]
                pas = pas + 1
                If cible = -1 Then
                    Display "Tu ne peux pas aller par là"
                Else If cible = 6 And trollLa Then
                    If contains(sac, "épée") Then
                        Display "Le troll bloque la porte. Tu tires ton épée, et il s'enfuit en hurlant dans le noir !"
                        trollLa = False
                    Else
                        sante = sante - 1
                        Display "Le troll bloque la porte et te repousse d'une énorme main ! Santé : ", sante
                    End If
                Else If cible = 6 And Not contains(sac, "clé") Then
                    Display "La porte au nord est bien fermée. Si seulement tu avais une clé"
                Else
                    salle = cible
                    Call decrire(salle, objets, sac)
                    If salle = 4 And Not contains(sac, "lampe") Then
                        sante = sante - 1
                        Display "Tu trébuches dans le noir et tu te cognes la tête ! Santé : ", sante
                    End If
                    If salle = 5 And trollLa Then
                        Display "Un énorme troll garde la porte du fond !"
                    End If
                End If
            Else If ordre = "regarde" Then
                Call decrire(salle, objets, sac)
            Else If ordre = "prends" Then
                Call prendreObjet(salle, objets, sac)
            Else If ordre = "sac" Then
                Call afficherSac(sac)
            Else If ordre = "aide" Then
                Display "Marche avec n, s, e et o. Tape regarde pour regarder autour de toi, prends pour ramasser quelque chose et sac pour voir ce que tu portes"
            Else
                Display "Je ne sais pas faire ça : ", ordre
            End If
            If salle = 0 And contains(sac, "or") Then
                Display "Tu pousses la grille et sors au soleil avec l'or. Évadé en ", pas, " pas !"
                enJeu = False
            Else If sante <= 0 Then
                Display "Tu t'effondres sur le sol de pierre froid. Cette fois, le donjon gagne"
                enJeu = False
            Else If pas >= 40 Then
                Display "Ta torche vacille et s'éteint. Te voilà perdu dans le noir pour toujours"
                enJeu = False
            Else If pas = 30 And direction >= 0 Then
                Display "Ta torche faiblit. Plus que dix pas !"
            End If
        End While
        Stop

        Function Integer directionDe(String dit)
            Declare Integer trouvee
            trouvee = -1
            If dit = "n" Then
                trouvee = 0
            Else If dit = "s" Then
                trouvee = 1
            Else If dit = "e" Then
                trouvee = 2
            Else If dit = "o" Then
                trouvee = 3
            End If
            Return trouvee
        End Function

        Module decrire(Integer ici, choses, porte)
            noms = ["Grille", "Grande Salle", "Bibliothèque", "Armurerie", "Cave", "Pont du Troll", "Salle du Trésor"]
            textes = ["La grille de fer derrière toi est verrouillée. Un couloir mène au nord.", "Une grande salle avec des portes au nord, à l'est et à l'ouest. La grille est au sud.", "Des étagères poussiéreuses de vieux livres. Une trappe dans le sol descend vers le sud, et une porte mène à l'est.", "Des armes rouillées couvrent les murs. La seule sortie est à l'ouest.", "Une cave humide qui sent le moisi. Une échelle remonte vers le nord.", "Un étroit pont de pierre au-dessus d'un gouffre, avec une lourde porte au bout, au nord. La salle est au sud.", "Des coffres pleins de trésors brillent tout autour de toi. Le pont est au sud."]
            Display "== ", noms[ici], " =="
            If ici = 4 And Not contains(porte, "lampe") Then
                Display "Il fait noir comme dans un four. Tu ne vois rien."
            Else
                Display textes[ici]
                If choses[ici] <> "" Then
                    Display "Tu vois : ", choses[ici]
                End If
            End If
        End Module

        Module prendreObjet(Integer ici, choses, porte)
            If ici = 4 And Not contains(porte, "lampe") Then
                Display "Tu tâtonnes dans le noir, mais tu ne trouves rien"
            Else If choses[ici] = "" Then
                Display "Il n'y a rien à prendre ici"
            Else
                append(porte, choses[ici])
                Display "Tu prends : ", choses[ici]
                choses[ici] = ""
            End If
        End Module

        Module afficherSac(porte)
            Declare String contenu
            If length(porte) = 0 Then
                Display "Ton sac est vide"
            Else
                contenu = ""
                For Each chose In porte
                    contenu = contenu + chose + " "
                End For
                Display "Dans ton sac : ", contenu
            End If
        End Module
    """),
    "g_connect_p": program("""
        Start
        Declare Integer colonne
        Declare Integer ligne
        Declare Integer coups
        Declare String pion
        Declare String gagnant
        grille = nouvelleGrille()
        coups = 0
        pion = "X"
        gagnant = ""
        Display "Puissance 4 ! Tu es X et l'ordinateur est O. Lâche tes jetons pour en aligner quatre"
        Display "Les lignes, les colonnes et les diagonales comptent"
        While gagnant = "" And coups < 42
            Call afficherGrille(grille)
            If pion = "X" Then
                Display "À toi. Choisis une colonne de 1 à 7"
                Input colonne
                ligne = -1
                While ligne = -1
                    While colonne < 1 Or colonne > 7
                        Display "Les colonnes vont de 1 à 7"
                        Input colonne
                    End While
                    ligne = ligneChute(grille, colonne - 1)
                    If ligne = -1 Then
                        Display "Cette colonne est pleine. Choisis-en une autre"
                        Input colonne
                    End If
                End While
                colonne = colonne - 1
            Else
                colonne = colonneOrdi(grille)
                ligne = ligneChute(grille, colonne)
                Display "L'ordinateur lâche un jeton dans la colonne ", colonne + 1
            End If
            grille[ligne][colonne] = pion
            coups = coups + 1
            If quatreDepuis(grille, ligne, colonne, pion) Then
                gagnant = pion
            Else If pion = "X" Then
                pion = "O"
            Else
                pion = "X"
            End If
        End While
        Call afficherGrille(grille)
        If gagnant = "X" Then
            Display "Quatre alignés ! Tu gagnes !"
        Else If gagnant = "O" Then
            Display "L'ordinateur en a aligné quatre. Il gagne cette fois"
        Else
            Display "La grille est pleine. Match nul"
        End If
        Stop

        Function nouvelleGrille()
            lignes = []
            For r = 1 To 6
                cases = []
                For c = 1 To 7
                    append(cases, ".")
                End For
                append(lignes, cases)
            End For
            Return lignes
        End Function

        Module afficherGrille(plateau)
            Declare String texte
            For r = 0 To 5
                texte = "|"
                For c = 0 To 6
                    texte = texte + " " + plateau[r][c]
                End For
                Display texte, " |"
            End For
            Display "+---------------+"
            Display "  1 2 3 4 5 6 7"
        End Module

        Function Integer ligneChute(plateau, Integer c)
            Declare Integer plusBasse
            plusBasse = -1
            For r = 0 To 5
                If plateau[r][c] = "." Then
                    plusBasse = r
                End If
            End For
            Return plusBasse
        End Function

        Function Boolean quatreDepuis(plateau, Integer ligne, Integer colonne, String jeton)
            Declare Integer alignes
            Declare Integer r
            Declare Integer c
            Declare Boolean continue
            Declare Boolean trouve
            trouve = False
            directions = [[0, 1], [1, 0], [1, 1], [1, -1]]
            For Each direction In directions
                alignes = 1
                For sens = -1 To 1 Step 2
                    r = ligne + direction[0] * sens
                    c = colonne + direction[1] * sens
                    continue = True
                    While continue
                        If r < 0 Or r > 5 Or c < 0 Or c > 6 Then
                            continue = False
                        Else If plateau[r][c] <> jeton Then
                            continue = False
                        Else
                            alignes = alignes + 1
                            r = r + direction[0] * sens
                            c = c + direction[1] * sens
                        End If
                    End While
                End For
                If alignes >= 4 Then
                    trouve = True
                End If
            End For
            Return trouve
        End Function

        Function Integer colonneOrdi(plateau)
            Declare Integer choix
            Declare Integer r
            choix = -1
            pions = ["O", "X"]
            For Each jeton In pions
                For c = 0 To 6
                    If choix = -1 Then
                        r = ligneChute(plateau, c)
                        If r >= 0 Then
                            plateau[r][c] = jeton
                            If quatreDepuis(plateau, r, c, jeton) Then
                                choix = c
                            End If
                            plateau[r][c] = "."
                        End If
                    End If
                End For
            End For
            While choix = -1
                c = random(0, 6)
                If plateau[0][c] = "." Then
                    choix = c
                End If
            End While
            Return choix
        End Function
    """),
    "g_blackjack_p": program("""
        Start
        Declare Integer jetons
        Declare Integer mise
        Declare Integer choix
        Declare Integer moi
        Declare Integer lui
        Declare Integer gain
        Declare Boolean enJeu
        Declare Boolean reste
        jetons = 100
        enJeu = True
        Display "Blackjack ! Approche-toi plus de 21 que le croupier sans dépasser"
        Display "Les cartes à chiffre valent leur nombre, V, D et R valent 10, et un A vaut 1 ou 11"
        While enJeu
            paquet = nouveauPaquet()
            Display "Tu as ", jetons, " jetons. Combien en mises-tu ?"
            Input mise
            While mise < 1 Or mise > jetons
                Display "Mise de 1 à ", jetons
                Input mise
            End While
            toi = []
            croupier = []
            append(toi, pop(paquet))
            append(croupier, pop(paquet))
            append(toi, pop(paquet))
            append(croupier, pop(paquet))
            reste = False
            While Not reste
                moi = valeurMain(toi)
                If moi >= 21 Then
                    reste = True
                Else
                    Call afficherTable(toi, moi, croupier)
                    Display "1 pour une carte, 2 pour rester, 3 pour doubler"
                    Input choix
                    While choix < 1 Or choix > 3
                        Display "Tape 1, 2 ou 3"
                        Input choix
                    End While
                    If choix = 3 And (length(toi) > 2 Or mise * 2 > jetons) Then
                        Display "Tu ne peux doubler que sur tes deux premières cartes, avec assez de jetons"
                    Else If choix = 2 Then
                        reste = True
                    Else
                        append(toi, pop(paquet))
                        If choix = 3 Then
                            mise = mise * 2
                            Display "Mise doublée à ", mise, ", et une seule carte de plus"
                            reste = True
                        End If
                    End If
                End If
            End While
            moi = valeurMain(toi)
            If moi < 21 Or (moi = 21 And length(toi) > 2) Then
                Call croupierJoue(croupier, paquet)
            End If
            lui = valeurMain(croupier)
            Call afficherMains(toi, moi, croupier, lui)
            gain = regler(moi, length(toi), lui, length(croupier), mise)
            jetons = jetons + gain
            If gain > 0 Then
                Display "Tu gagnes ", gain, " jetons"
            Else If gain < 0 Then
                Display "Tu perds ", 0 - gain, " jetons"
            Else
                Display "Égalité : tu récupères ta mise"
            End If
            If jetons = 0 Then
                Display "Tu n'as plus de jetons. La banque gagne cette fois"
                enJeu = False
            Else
                Display "1 pour une nouvelle main, 2 pour encaisser"
                Input choix
                While choix < 1 Or choix > 2
                    Display "Tape 1 ou 2"
                    Input choix
                End While
                enJeu = choix = 1
            End If
        End While
        Display "Tu quittes la table avec ", jetons, " jetons"
        If jetons > 100 Then
            Display "C'est ", jetons - 100, " de plus qu'à ton arrivée !"
        End If
        Stop

        Function nouveauPaquet()
            Declare Integer autre
            Declare Integer gardee
            cartes = []
            For i = 0 To 51
                append(cartes, i)
            End For
            For i = 51 To 1 Step -1
                autre = random(0, i)
                gardee = cartes[i]
                cartes[i] = cartes[autre]
                cartes[autre] = gardee
            End For
            Return cartes
        End Function

        Function String nomCarte(Integer carte)
            valeurs = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "V", "D", "R"]
            couleurs = ["♠", "♥", "♦", "♣"]
            Return valeurs[carte mod 13] + couleurs[carte div 13]
        End Function

        Function Integer valeurMain(laMain)
            Declare Integer total
            Declare Integer as
            Declare Integer valeur
            total = 0
            as = 0
            For Each carte In laMain
                valeur = carte mod 13 + 1
                If valeur = 1 Then
                    total = total + 11
                    as = as + 1
                Else If valeur > 10 Then
                    total = total + 10
                Else
                    total = total + valeur
                End If
            End For
            While total > 21 And as > 0
                total = total - 10
                as = as - 1
            End While
            Return total
        End Function

        Function String texteMain(laMain)
            Declare String texte
            texte = ""
            For Each carte In laMain
                texte = texte + nomCarte(carte) + " "
            End For
            Return texte
        End Function

        Module afficherTable(joueur, Integer total, banque)
            Display "Croupier : ", nomCarte(banque[0]), " ??"
            Display "Toi :      ", texteMain(joueur), "(", total, ")"
        End Module

        Module afficherMains(joueur, Integer total, banque, Integer totalBanque)
            Display "Croupier : ", texteMain(banque), "(", totalBanque, ")"
            Display "Toi :      ", texteMain(joueur), "(", total, ")"
        End Module

        Module croupierJoue(laMain, cartes)
            Declare Integer total
            Do
                total = valeurMain(laMain)
                If total < 17 Then
                    append(laMain, pop(cartes))
                End If
            Until total >= 17
        End Module

        Function Integer regler(Integer moi, Integer mesCartes, Integer lui, Integer sesCartes, Integer somme)
            Declare Integer resultat
            If moi > 21 Then
                Display "Trop ! Tu as dépassé 21"
                resultat = 0 - somme
            Else If moi = 21 And mesCartes = 2 And (lui <> 21 Or sesCartes > 2) Then
                Display "Blackjack ! Ça paie 3 pour 2"
                resultat = somme * 3 div 2
            Else If lui = 21 And sesCartes = 2 And (moi <> 21 Or mesCartes > 2) Then
                Display "Le croupier a un blackjack"
                resultat = 0 - somme
            Else If lui > 21 Then
                Display "Le croupier dépasse 21 !"
                resultat = somme
            Else If moi > lui Then
                resultat = somme
            Else If moi < lui Then
                resultat = 0 - somme
            Else
                resultat = 0
            End If
            Return resultat
        End Function
    """),
    "g_battleship_p": program("""
        Start
        Declare String tir
        Declare Integer numCase
        Declare Integer resultat
        Declare Integer mesRestes
        Declare Integer sesRestes
        Declare Integer tour
        maison = merVide()
        ennemi = merVide()
        Call placerFlotte(maison)
        Call placerFlotte(ennemi)
        mesRestes = 9
        sesRestes = 9
        tour = 0
        Display "Bataille navale ! Chaque camp a trois navires, de 4, 3 et 2 cases. Coule les siens avant qu'il ne coule les tiens"
        Display "S est ton navire, X un touché et o un raté. Tire avec une lettre et un nombre, par exemple B4"
        While mesRestes > 0 And sesRestes > 0
            Call afficherMers(maison, ennemi)
            tour = tour + 1
            numCase = -1
            While numCase = -1
                Display "Tour ", tour, ". Où tires-tu ?"
                Input tir
                numCase = caseDe(tir)
                If numCase = -1 Then
                    Display "Tape une lettre de A à F et un nombre de 1 à 6, par exemple B4"
                End If
            End While
            resultat = tirerSur(ennemi, numCase)
            If resultat = 2 Then
                Display "Touché !"
            Else If resultat = 1 Then
                Display "Plouf. Raté"
            Else
                Display "Tu as déjà tiré en ", tir
            End If
            sesRestes = naviresRestants(ennemi)
            If sesRestes > 0 Then
                numCase = visee(maison)
                resultat = tirerSur(maison, numCase)
                If resultat = 2 Then
                    Display "L'ennemi tire en ", nomDe(numCase), ". Il touche ton navire !"
                Else
                    Display "L'ennemi tire en ", nomDe(numCase), " et rate"
                End If
                mesRestes = naviresRestants(maison)
            End If
            Display "Cases de navire restantes : les tiennes ", mesRestes, ", les siennes ", sesRestes
        End While
        Call afficherMers(maison, ennemi)
        If sesRestes = 0 Then
            Display "Tu as coulé toute sa flotte en ", tour, " tours. Victoire !"
        Else
            Display "Ta flotte est coulée. L'ennemi gagne cette bataille"
        End If
        Stop

        Function merVide()
            mer = []
            For i = 1 To 36
                append(mer, ".")
            End For
            Return mer
        End Function

        Module placerFlotte(mer)
            Declare Integer ligne
            Declare Integer colonne
            Declare Integer horizontal
            Declare Boolean tient
            tailles = [4, 3, 2]
            For Each taille In tailles
                tient = False
                While Not tient
                    horizontal = random(0, 1)
                    If horizontal = 1 Then
                        ligne = random(0, 5)
                        colonne = random(0, 6 - taille)
                    Else
                        ligne = random(0, 6 - taille)
                        colonne = random(0, 5)
                    End If
                    tient = True
                    For k = 0 To taille - 1
                        If mer[(ligne + k * (1 - horizontal)) * 6 + colonne + k * horizontal] <> "." Then
                            tient = False
                        End If
                    End For
                End While
                For k = 0 To taille - 1
                    mer[(ligne + k * (1 - horizontal)) * 6 + colonne + k * horizontal] = "S"
                End For
            End For
        End Module

        Module afficherMers(mienne, sienne)
            Declare String texte
            Declare String cellule
            Display "   Ta flotte        Eaux ennemies"
            Display "   1 2 3 4 5 6      1 2 3 4 5 6"
            For r = 0 To 5
                texte = substring("ABCDEF", r, r + 1) + "  "
                For c = 0 To 5
                    texte = texte + mienne[r * 6 + c] + " "
                End For
                texte = texte + "  " + substring("ABCDEF", r, r + 1) + "  "
                For c = 0 To 5
                    cellule = sienne[r * 6 + c]
                    If cellule = "S" Then
                        cellule = "."
                    End If
                    texte = texte + cellule + " "
                End For
                Display texte
            End For
        End Module

        Function Integer caseDe(String saisie)
            Declare Integer ligne
            Declare Integer colonne
            Declare Integer carre
            carre = -1
            If length(saisie) = 2 Then
                ligne = indexOf("ABCDEF", toUpper(substring(saisie, 0, 1)))
                colonne = indexOf("123456", substring(saisie, 1, 2))
                If ligne >= 0 And colonne >= 0 Then
                    carre = ligne * 6 + colonne
                End If
            End If
            Return carre
        End Function

        Function String nomDe(Integer carre)
            Return substring("ABCDEF", carre div 6, carre div 6 + 1) + (carre mod 6 + 1)
        End Function

        Function Integer tirerSur(mer, Integer carre)
            Declare Integer resultat
            If mer[carre] = "S" Then
                mer[carre] = "X"
                resultat = 2
            Else If mer[carre] = "." Then
                mer[carre] = "o"
                resultat = 1
            Else
                resultat = 0
            End If
            Return resultat
        End Function

        Function Integer naviresRestants(mer)
            Declare Integer aFlot
            aFlot = 0
            For Each cellule In mer
                If cellule = "S" Then
                    aFlot = aFlot + 1
                End If
            End For
            Return aFlot
        End Function

        Function Integer visee(mer)
            Declare Integer ligne
            Declare Integer colonne
            voisines = []
            For i = 0 To 35
                If mer[i] = "X" Then
                    ligne = i div 6
                    colonne = i mod 6
                    If ligne > 0 Then
                        append(voisines, i - 6)
                    End If
                    If ligne < 5 Then
                        append(voisines, i + 6)
                    End If
                    If colonne > 0 Then
                        append(voisines, i - 1)
                    End If
                    If colonne < 5 Then
                        append(voisines, i + 1)
                    End If
                End If
            End For
            cibles = []
            For Each carre In voisines
                If mer[carre] = "." Or mer[carre] = "S" Then
                    append(cibles, carre)
                End If
            End For
            If length(cibles) = 0 Then
                For i = 0 To 35
                    If mer[i] = "." Or mer[i] = "S" Then
                        append(cibles, i)
                    End If
                End For
            End If
            Return cibles[random(0, length(cibles) - 1)]
        End Function
    """),
    "g_math_p": program("""
        Start
        Declare Integer points
        Declare Integer serie
        Declare Integer meilleure
        Declare Integer reponse
        Declare Integer juste
        points = 0
        serie = 0
        meilleure = 0
        Display "Calcul éclair : huit calculs. Chaque bonne réponse d'affilée rapporte un point de plus que la précédente"
        For tour = 1 To 8
            juste = poseCalcul(tour)
            Input reponse
            If reponse = juste Then
                serie = serie + 1
                points = points + serie
                Display "Juste ! Cela fait ", serie, " d'affilée"
                If serie > meilleure Then
                    meilleure = serie
                End If
            Else
                Display "Pas tout à fait : c'était ", juste
                serie = 0
            End If
        End For
        Call montreScore(points, meilleure)
        Stop

        Function Integer poseCalcul(Integer tour)
            Declare Integer a
            Declare Integer b
            Declare Integer sorte
            Declare Integer resultat
            a = random(2, 9 + tour)
            b = random(2, 9)
            sorte = random(1, 3)
            If sorte = 1 Then
                Display "Calcul ", tour, " : combien font ", a, " + ", b, " ?"
                resultat = a + b
            Else If sorte = 2 Then
                Display "Calcul ", tour, " : combien font ", a + b, " - ", b, " ?"
                resultat = a
            Else
                Display "Calcul ", tour, " : combien font ", a, " x ", b, " ?"
                resultat = a * b
            End If
            Return resultat
        End Function

        Module montreScore(Integer points, Integer meilleure)
            Display "Ton score : ", points, " points. Plus longue série de bonnes réponses : ", meilleure
            If points >= 30 Then
                Display "Un as du calcul !"
            Else If points >= 12 Then
                Display "Bien joué !"
            Else
                Display "Continue à t'entraîner et réessaie"
            End If
        End Module
    """),
    "g_pig_p": program("""
        Start
        Declare Integer miens
        Declare Integer siens
        miens = 0
        siens = 0
        Display "Pig : lance autant que tu l'oses. Un 1 fait perdre tout ce que tu as lancé pendant ce tour. Le premier à 50 gagne"
        While miens < 50 And siens < 50
            miens = miens + tonTour(miens)
            Display "Score : toi ", miens, ", l'ordinateur ", siens
            If miens < 50 Then
                siens = siens + tourOrdinateur(siens)
                Display "Score : toi ", miens, ", l'ordinateur ", siens
            End If
        End While
        If miens >= 50 Then
            Display "Tu atteins 50 le premier et tu gagnes !"
        Else
            Display "L'ordinateur atteint 50 le premier et gagne"
        End If
        Stop

        Function Integer tonTour(Integer acquis)
            Declare Integer gagnes
            Declare Integer jet
            Declare String choix
            Declare Boolean encore
            gagnes = 0
            encore = True
            While encore
                jet = random(1, 6)
                If jet = 1 Then
                    Display "Tu fais un 1 et tu perds les ", gagnes, " points de ce tour"
                    gagnes = 0
                    encore = False
                Else
                    gagnes = gagnes + jet
                    Display "Tu fais ", jet, ". Ce tour : ", gagnes, ". En tout : ", acquis + gagnes
                    If acquis + gagnes >= 50 Then
                        encore = False
                    Else
                        Display "Tape l pour relancer, ou g pour garder"
                        Input choix
                        If choix = "g" Or choix = "G" Then
                            encore = False
                        End If
                    End If
                End If
            End While
            Return gagnes
        End Function

        Function Integer tourOrdinateur(Integer acquis)
            Declare Integer gagnes
            Declare Integer jet
            gagnes = 0
            jet = 0
            While jet <> 1 And gagnes < 15 And acquis + gagnes < 50
                jet = random(1, 6)
                If jet = 1 Then
                    gagnes = 0
                Else
                    gagnes = gagnes + jet
                End If
            End While
            If jet = 1 Then
                Display "L'ordinateur fait un 1 et ne marque rien"
            Else
                Display "L'ordinateur s'arrête avec ", gagnes, " points"
            End If
            Return gagnes
        End Function
    """),
    "g_lander_p": program("""
        Start
        Declare Real hauteur
        Declare Real vitesse
        Declare Integer carburant
        Declare Integer secondes
        Declare Integer poussee
        hauteur = 500
        vitesse = 0
        carburant = 150
        secondes = 0
        Display "Alunissage : tu es à 500 m et tu tombes. À chaque seconde, brûle de 0 à 20 unités de carburant pour freiner"
        Display "Pose-toi à 5 m par seconde ou moins pour alunir sans danger"
        While hauteur > 0
            Call montrePanneau(secondes, hauteur, vitesse, carburant)
            poussee = demandePoussee(carburant)
            carburant = carburant - poussee
            vitesse = vitesse + 1.6 - poussee * 0.3
            hauteur = hauteur - vitesse
            secondes = secondes + 1
        End While
        Call arrivee(vitesse, carburant, secondes)
        Stop

        Module montrePanneau(Integer secondes, Real hauteur, Real vitesse, Integer carburant)
            Display "Temps ", secondes, " s. Hauteur ", round(hauteur), " m. Chute à ", round(vitesse, 1), " m/s. Carburant ", carburant
        End Module

        Function Integer demandePoussee(Integer carburant)
            Declare Integer poussee
            poussee = 0
            If carburant <= 0 Then
                Display "Plus de carburant !"
            Else
                Display "Combien de carburant brûler, de 0 à 20 ?"
                Input poussee
                While poussee < 0 Or poussee > 20
                    Display "Brûle de 0 à 20"
                    Input poussee
                End While
                If poussee > carburant Then
                    Display "Il ne reste que ", carburant, ", alors tu brûles tout"
                    poussee = carburant
                End If
            End If
            Return poussee
        End Function

        Module arrivee(Real vitesse, Integer carburant, Integer secondes)
            If vitesse <= 5 Then
                Display "L'Aigle a aluni ! Posé à ", round(vitesse, 1), " m/s après ", secondes, " secondes, avec ", carburant, " de carburant en réserve"
                If vitesse <= 2 Then
                    Display "Un alunissage parfait !"
                End If
            Else If vitesse <= 12 Then
                Display "Un alunissage brutal à ", round(vitesse), " m/s. Le module est cabossé, mais tu en sors indemne"
            Else
                Display "Tu percutes la surface à ", round(vitesse), " m/s et tu creuses un nouveau cratère"
            End If
        End Module
    """),
    "g_mines_p": program("""
        Start
        Declare Integer ouvertes
        Declare Integer sures
        Declare Integer carre
        Declare String coup
        Declare String dit
        Declare Boolean vivant
        champ = nouveauChamp()
        vu = nouvelleVue()
        Call poseMines(champ, 7)
        sures = 36 - 7
        ouvertes = 0
        vivant = True
        Display "Démineur : 7 mines sont cachées dans un champ de 6 sur 6. Ouvre chaque case sans mine"
        Display "Tape une case comme B4 pour l'ouvrir, ou M et une case, comme MB4, pour marquer une mine"
        While vivant And ouvertes < sures
            Call montreChamp(champ, vu, False)
            Input coup
            dit = toUpper(coup)
            If length(dit) = 3 And substring(dit, 0, 1) = "M" Then
                carre = carreDe(substring(dit, 1, 3))
                If carre = -1 Then
                    Display "Ce n'est pas une case. Essaie par exemple MB4"
                Else If vu[carre] = "." Then
                    vu[carre] = "M"
                Else If vu[carre] = "M" Then
                    vu[carre] = "."
                End If
            Else
                carre = carreDe(dit)
                If carre = -1 Then
                    Display "Ce n'est pas une case. Essaie par exemple B4"
                Else If vu[carre] <> "." Then
                    Display "Cette case est déjà ouverte, ou marquée"
                Else If champ[carre] = -1 Then
                    vivant = False
                Else
                    ouvertes = ouvertes + ouvreDepuis(champ, vu, carre)
                End If
            End If
        End While
        Call montreChamp(champ, vu, True)
        If vivant Then
            Display "Toutes les cases sûres sont ouvertes. Tu as déminé le champ !"
        Else
            Display "Boum ! Il y avait une mine sous cette case. Plus de chance la prochaine fois"
        End If
        Stop

        Function nouveauChamp()
            cellules = []
            For i = 1 To 36
                append(cellules, 0)
            End For
            Return cellules
        End Function

        Function nouvelleVue()
            cellules = []
            For i = 1 To 36
                append(cellules, ".")
            End For
            Return cellules
        End Function

        Module poseMines(champ, Integer nombre)
            Declare Integer posees
            Declare Integer place
            posees = 0
            While posees < nombre
                place = random(0, 35)
                If champ[place] <> -1 Then
                    champ[place] = -1
                    posees = posees + 1
                End If
            End While
            For place = 0 To 35
                If champ[place] <> -1 Then
                    champ[place] = minesAutour(champ, place)
                End If
            End For
        End Module

        Function Integer minesAutour(champ, Integer place)
            Declare Integer nombre
            Declare Integer r
            Declare Integer c
            nombre = 0
            For dr = -1 To 1
                For dc = -1 To 1
                    r = place div 6 + dr
                    c = place mod 6 + dc
                    If r >= 0 And r < 6 And c >= 0 And c < 6 Then
                        If champ[r * 6 + c] = -1 Then
                            nombre = nombre + 1
                        End If
                    End If
                End For
            End For
            Return nombre
        End Function

        Function Integer ouvreDepuis(champ, vu, Integer debut)
            Declare Integer nombre
            Declare Integer place
            Declare Integer voisine
            Declare Integer pos
            Declare Integer r
            Declare Integer c
            aFaire = [debut]
            vu[debut] = texteDe(champ[debut])
            nombre = 1
            pos = 0
            While pos < length(aFaire)
                place = aFaire[pos]
                pos = pos + 1
                If champ[place] = 0 Then
                    For dr = -1 To 1
                        For dc = -1 To 1
                            r = place div 6 + dr
                            c = place mod 6 + dc
                            If r >= 0 And r < 6 And c >= 0 And c < 6 Then
                                voisine = r * 6 + c
                                If vu[voisine] = "." Then
                                    vu[voisine] = texteDe(champ[voisine])
                                    nombre = nombre + 1
                                    append(aFaire, voisine)
                                End If
                            End If
                        End For
                    End For
                End If
            End While
            Return nombre
        End Function

        Function String texteDe(Integer mines)
            Declare String texte
            texte = " "
            If mines > 0 Then
                texte = "" + mines
            End If
            Return texte
        End Function

        Module montreChamp(champ, vu, Boolean toutes)
            Declare String ligne
            Display "    1 2 3 4 5 6"
            For r = 0 To 5
                ligne = substring("ABCDEF", r, r + 1) + " |"
                For c = 0 To 5
                    If toutes And champ[r * 6 + c] = -1 Then
                        ligne = ligne + " *"
                    Else
                        ligne = ligne + " " + vu[r * 6 + c]
                    End If
                End For
                Display ligne
            End For
        End Module

        Function Integer carreDe(String texte)
            Declare Integer rangee
            Declare Integer colonne
            Declare Integer trouve
            rangee = -1
            colonne = -1
            trouve = -1
            If length(texte) = 2 Then
                rangee = indexOf("ABCDEF", substring(texte, 0, 1))
                colonne = indexOf("123456", substring(texte, 1, 2))
            End If
            If rangee >= 0 And colonne >= 0 Then
                trouve = rangee * 6 + colonne
            End If
            Return trouve
        End Function
    """),
    # ---- icons, and a drawing run as what it is: a home walked through,
    # work passed on, data sent, a circuit switched on, a launch
    # (03-icons.js, 11-hand-icons.js, 37-board.js to 39-orbit.js)
    "ic_open": "Icônes",
    "ic_open_tip": "Métiers, meubles, appareils et plus",
    "ic_find": "Rechercher des icônes",
    "ic_none": "Aucune icône ne correspond.",
    "ic_all": "Toutes",
    "ic_recent": "Récentes",
    "ic_people": "Métiers",
    "ic_devices": "Ordinateurs et réseau",
    "ic_circuit": "Circuits",
    "ic_travel": "Transports et ville",
    "ic_space": "Espace",
    "ic_things": "Objets et idées",
    "fp_unit": "m",
    "fp_area": "{n} m²",
    "n_i_person": "Personne",
    "n_i_man": "Homme",
    "n_i_woman": "Femme",
    "n_i_child": "Enfant",
    "n_i_elder": "Personne âgée",
    "n_i_team": "Équipe",
    "n_i_doctor": "Médecin",
    "n_i_nurse": "Infirmier",
    "n_i_surgeon": "Chirurgien",
    "n_i_dentist": "Dentiste",
    "n_i_pharmacist": "Pharmacien",
    "n_i_paramedic": "Ambulancier",
    "n_i_patient": "Patient",
    "n_i_chef": "Chef cuisinier",
    "n_i_baker": "Boulanger",
    "n_i_waiter": "Serveur",
    "n_i_farmer": "Agriculteur",
    "n_i_gardener": "Jardinier",
    "n_i_builder": "Ouvrier du bâtiment",
    "n_i_engineer": "Ingénieur",
    "n_i_electrician": "Électricien",
    "n_i_plumber": "Plombier",
    "n_i_mechanic": "Mécanicien",
    "n_i_carpenter": "Menuisier",
    "n_i_painter": "Peintre",
    "n_i_cleaner": "Agent d’entretien",
    "n_i_miner": "Mineur",
    "n_i_artist": "Artiste",
    "n_i_musician": "Musicien",
    "n_i_photographer": "Photographe",
    "n_i_reporter": "Journaliste",
    "n_i_teacher": "Enseignant",
    "n_i_student": "Élève",
    "n_i_graduate": "Diplômé",
    "n_i_librarian": "Bibliothécaire",
    "n_i_scientist": "Scientifique",
    "n_i_programmer": "Programmeur",
    "n_i_office": "Employé de bureau",
    "n_i_manager": "Responsable",
    "n_i_accountant": "Comptable",
    "n_i_receptionist": "Réceptionniste",
    "n_i_agent": "Téléconseiller",
    "n_i_cashier": "Caissier",
    "n_i_customer": "Client",
    "n_i_police": "Policier",
    "n_i_firefighter": "Pompier",
    "n_i_soldier": "Soldat",
    "n_i_guard": "Agent de sécurité",
    "n_i_lawyer": "Avocat",
    "n_i_judge": "Juge",
    "n_i_pilot": "Pilote",
    "n_i_astronaut": "Astronaute",
    "n_i_driver": "Chauffeur",
    "n_i_delivery": "Livreur",
    "n_i_postman": "Facteur",
    "n_i_hairdresser": "Coiffeur",
    "n_i_coach": "Entraîneur",
    "n_i_room": "Pièce",
    "n_i_wall": "Mur",
    "n_i_door": "Porte",
    "n_i_door2": "Porte double",
    "n_i_slide": "Porte coulissante",
    "n_i_window": "Fenêtre",
    "n_i_stairs": "Escalier",
    "n_i_bed": "Lit double",
    "n_i_bed1": "Lit simple",
    "n_i_crib": "Lit de bébé",
    "n_i_nightstand": "Table de chevet",
    "n_i_wardrobe": "Armoire",
    "n_i_dresser": "Commode",
    "n_i_sofa": "Canapé",
    "n_i_armchair": "Fauteuil",
    "n_i_coffee": "Table basse",
    "n_i_tv": "Télévision",
    "n_i_fireplace": "Cheminée",
    "n_i_piano": "Piano",
    "n_i_bookcase": "Bibliothèque",
    "n_i_rug": "Tapis",
    "n_i_lamp": "Lampadaire",
    "n_i_plant": "Plante",
    "n_i_dining": "Table à manger",
    "n_i_roundtable": "Table ronde",
    "n_i_chair": "Chaise",
    "n_i_desk": "Bureau",
    "n_i_officechair": "Chaise de bureau",
    "n_i_counter": "Plan de travail",
    "n_i_stove": "Cuisinière",
    "n_i_fridge": "Réfrigérateur",
    "n_i_kitchensink": "Évier",
    "n_i_toilet": "Toilettes",
    "n_i_sink": "Lavabo",
    "n_i_bathtub": "Baignoire",
    "n_i_shower": "Douche",
    "n_i_washer": "Lave-linge",
    "n_i_dryer": "Sèche-linge",
    "n_i_parked": "Voiture (vue de dessus)",
    "n_i_shrub": "Arbre (vu de dessus)",
    "n_i_computer": "Ordinateur",
    "n_i_laptop": "Ordinateur portable",
    "n_i_tablet": "Tablette",
    "n_i_phone": "Téléphone",
    "n_i_server": "Serveur informatique",
    "n_i_database": "Base de données",
    "n_i_router": "Routeur",
    "n_i_switch": "Commutateur réseau",
    "n_i_firewall": "Pare-feu",
    "n_i_wifi": "Wi-Fi",
    "n_i_internet": "Internet",
    "n_i_tower": "Antenne relais",
    "n_i_printer": "Imprimante",
    "n_i_camera": "Caméra de surveillance",
    "n_i_battery": "Pile",
    "n_i_bulb": "Ampoule",
    "n_i_switch_on": "Interrupteur",
    "n_i_resistor": "Résistance",
    "n_i_capacitor": "Condensateur",
    "n_i_led": "LED",
    "n_i_motor": "Moteur",
    "n_i_buzzer": "Buzzer",
    "n_i_socket": "Prise",
    "n_i_solar": "Panneau solaire",
    "n_i_ground": "Masse",
    "n_i_cell": "Pile",
    "n_i_diode": "Diode",
    "n_i_fuse": "Fusible",
    "n_i_ammeter": "Ampèremètre",
    "n_i_voltmeter": "Voltmètre",
    "n_i_dimmer": "Variateur",
    "n_i_comet": "Comète",
    "n_i_asteroid": "Astéroïde",
    "n_i_station": "Station spatiale",
    "n_i_lander": "Module lunaire",
    "n_i_galaxy": "Galaxie",
    "n_i_taxi": "Taxi",
    "n_i_tram": "Tramway",
    "n_i_helicopter": "Hélicoptère",
    "n_i_scooter": "Trottinette",
    "n_i_airport": "Aéroport",
    "n_i_trainstation": "Gare",
    "n_i_park": "Parc",
    "n_i_cafe": "Café",
    "n_i_gift": "Cadeau",
    "n_i_target": "Cible",
    "n_i_hourglass": "Sablier",
    "n_i_music": "Musique",
    "n_i_palette": "Palette de peintre",
    "n_i_tag": "Étiquette de prix",
    "n_i_magnet": "Aimant",
    "n_i_puzzle": "Pièce de puzzle",
    "n_i_car": "Voiture",
    "n_i_bus": "Bus",
    "n_i_truck": "Camion",
    "n_i_bike": "Vélo",
    "n_i_train": "Train",
    "n_i_plane": "Avion",
    "n_i_ship": "Bateau",
    "n_i_house": "Maison",
    "n_i_building": "Immeuble de bureaux",
    "n_i_shop": "Magasin",
    "n_i_school": "École",
    "n_i_hospital": "Hôpital",
    "n_i_factory": "Usine",
    "n_i_warehouse": "Entrepôt",
    "n_i_tree": "Arbre",
    "n_i_traffic": "Feu tricolore",
    "n_i_rocket": "Fusée",
    "n_i_satellite": "Satellite",
    "n_i_sun": "Soleil",
    "n_i_earth": "Terre",
    "n_i_moon": "Lune",
    "n_i_planet": "Planète",
    "n_i_star": "Étoile",
    "n_i_telescope": "Télescope",
    "n_i_ufo": "OVNI",
    "n_i_zone": "Conteneur",
    "n_i_money": "Argent",
    "n_i_coins": "Pièces de monnaie",
    "n_i_cart": "Chariot",
    "n_i_package": "Colis",
    "n_i_mail": "Courrier",
    "n_i_chat": "Discussion",
    "n_i_clock": "Horloge",
    "n_i_calendar": "Calendrier",
    "n_i_gear": "Engrenage",
    "n_i_lock": "Cadenas",
    "n_i_key": "Clé",
    "n_i_idea": "Idée",
    "n_i_search": "Recherche",
    "n_i_check": "Coche",
    "n_i_cross": "Croix",
    "n_i_warning": "Avertissement",
    "n_i_flag": "Drapeau",
    "n_i_heart": "Cœur",
    "n_i_trophy": "Trophée",
    "n_i_chart": "Diagramme en barres",
    "n_i_book": "Livre",
    "n_i_megaphone": "Mégaphone",
    "vb_i_person": "fait sa part",
    "vb_i_man": "fait sa part",
    "vb_i_woman": "fait sa part",
    "vb_i_child": "fait un dessin",
    "vb_i_elder": "donne un conseil",
    "vb_i_team": "y travaille ensemble",
    "vb_i_doctor": "examine le patient",
    "vb_i_nurse": "soigne le patient",
    "vb_i_surgeon": "opère",
    "vb_i_dentist": "examine les dents",
    "vb_i_pharmacist": "prépare l’ordonnance",
    "vb_i_paramedic": "donne les premiers secours",
    "vb_i_patient": "décrit les symptômes",
    "vb_i_chef": "prépare le repas",
    "vb_i_baker": "cuit le pain",
    "vb_i_waiter": "prend la commande",
    "vb_i_farmer": "fait la récolte",
    "vb_i_gardener": "arrose les plantes",
    "vb_i_builder": "le construit",
    "vb_i_engineer": "le conçoit",
    "vb_i_electrician": "fait le câblage",
    "vb_i_plumber": "répare la tuyauterie",
    "vb_i_mechanic": "répare le moteur",
    "vb_i_carpenter": "monte la charpente",
    "vb_i_painter": "le peint",
    "vb_i_cleaner": "fait le ménage",
    "vb_i_miner": "extrait le minerai",
    "vb_i_artist": "le dessine",
    "vb_i_musician": "joue un air",
    "vb_i_photographer": "prend une photo",
    "vb_i_reporter": "écrit l’article",
    "vb_i_teacher": "fait cours",
    "vb_i_student": "fait ses devoirs",
    "vb_i_graduate": "reçoit son diplôme",
    "vb_i_librarian": "trouve le livre",
    "vb_i_scientist": "mène l’expérience",
    "vb_i_programmer": "écrit le code",
    "vb_i_office": "remplit les formulaires",
    "vb_i_manager": "établit le plan",
    "vb_i_accountant": "tient les comptes",
    "vb_i_receptionist": "fixe le rendez-vous",
    "vb_i_agent": "répond à l’appel",
    "vb_i_cashier": "encaisse",
    "vb_i_customer": "passe la commande",
    "vb_i_police": "enquête",
    "vb_i_firefighter": "éteint le feu",
    "vb_i_soldier": "monte la garde",
    "vb_i_guard": "vérifie le badge",
    "vb_i_lawyer": "plaide la cause",
    "vb_i_judge": "rend le verdict",
    "vb_i_pilot": "pilote l’avion",
    "vb_i_astronaut": "part en orbite",
    "vb_i_driver": "le conduit à bon port",
    "vb_i_delivery": "livre le colis",
    "vb_i_postman": "distribue le courrier",
    "vb_i_hairdresser": "coupe les cheveux",
    "vb_i_coach": "entraîne l’équipe",
    "wk_i_bed": "dort dans le lit",
    "wk_i_bed1": "fait une sieste",
    "wk_i_crib": "veille sur le bébé",
    "wk_i_nightstand": "allume la lampe de chevet",
    "wk_i_wardrobe": "choisit des vêtements",
    "wk_i_dresser": "s’habille",
    "wk_i_sofa": "s’assoit sur le canapé",
    "wk_i_armchair": "lit dans le fauteuil",
    "wk_i_coffee": "pose une tasse sur la table basse",
    "wk_i_tv": "regarde la télé",
    "wk_i_fireplace": "se réchauffe près du feu",
    "wk_i_piano": "joue du piano",
    "wk_i_bookcase": "prend un livre",
    "wk_i_lamp": "allume la lampe",
    "wk_i_plant": "arrose la plante",
    "wk_i_dining": "mange à table",
    "wk_i_roundtable": "prend un café à table",
    "wk_i_chair": "s’assoit",
    "wk_i_desk": "travaille au bureau",
    "wk_i_officechair": "tourne sur la chaise de bureau",
    "wk_i_counter": "prépare un sandwich",
    "wk_i_stove": "cuisine aux fourneaux",
    "wk_i_fridge": "prend du lait dans le réfrigérateur",
    "wk_i_kitchensink": "fait la vaisselle",
    "wk_i_toilet": "va aux toilettes",
    "wk_i_sink": "se lave les mains",
    "wk_i_bathtub": "prend un bain",
    "wk_i_shower": "prend une douche",
    "wk_i_washer": "fait la lessive",
    "wk_i_dryer": "sèche le linge",
    "wk_i_parked": "monte dans la voiture",
    "wk_i_shrub": "se repose sous l’arbre",
    "wk_i_stairs": "monte l’escalier",
    "fr_kitchen": "la cuisine",
    "fr_bath": "la salle de bain",
    "fr_bed": "la chambre",
    "fr_laundry": "la buanderie",
    "fr_garage": "le garage",
    "fr_office": "le bureau",
    "fr_dining": "la salle à manger",
    "fr_living": "le salon",
    "fr_room": "la pièce",
    "fr_closet": "le dressing",
    "fr_studio": "le studio",
    "fr_great": "la cuisine ouverte",
    "fr_eatin": "la cuisine-salle à manger",
    "fr_livdine": "le salon-salle à manger",
    "wk_comes_in": "{who} entre par la porte d’entrée.",
    "wk_starts": "{who} commence dans {room}.",
    "wk_in_room": "Direction {room}.",
    "wk_empty": "Rien dans {room}.",
    "wk_does": "{who} {does}.",
    "wk_cannot_reach": "Impossible d’y accéder : {what} ({room}).",
    "wk_leaves": "{who} sort par la porte d’entrée.",
    "wk_no_way_in": "Impossible d’entrer dans {room} : pas de porte.",
    "wk_summary": "Pièces parcourues : {rooms} · Objets utilisés : {used} · Surface : {area}",
    "wk_no_rooms": "Placez une Pièce autour des meubles pour la parcourir.",
    "wk_door_loose": "Cette porte n’est dans aucun mur.",
    "wk_no_door": "Aucune porte ne mène dans {room}.",
    "wk_blocked": "Quelque chose bloque une porte : {what}.",
    "wk_sum": "Pièces : {rooms} · Meubles : {pieces} · Surface : {area}",
    "wk_st_rooms": "Pièces",
    "wk_st_pieces": "Meubles",
    "wk_st_floor": "Surface",
    "wk_visitor": "Un visiteur",
    "wk_hello": "Salut !",
    "bd_auto": "Automatique",
    "bd_auto_is": "Automatique : {what}",
    "bd_pick": "Ce qu’est le dessin, et ce que Lancer en fait",
    "bd_program": "Programme",
    "bd_home": "Plan d’étage",
    "bd_team": "Personnes au travail",
    "bd_network": "Réseau",
    "bd_circuit": "Circuit",
    "bd_space": "Espace",
    "bd_city": "Déplacements",
    "bd_flow": "Flèches",
    "bd_tidy_kept": "Un plan ou un ciel reste là où vous l’avez dessiné : Ranger sert aux diagrammes de flux et aux organigrammes.",
    "go_home": "Visiter",
    "go_team": "Faire passer le travail",
    "go_network": "Envoyer des données",
    "go_circuit": "Allumer",
    "go_space": "Décoller",
    "go_city": "Rouler",
    "go_flow": "Suivre les flèches",
    "v3_open": "Voir en 3D",
    "v3_tip": "Voir en 3D",
    "v3_empty": "Rien à construire pour l’instant.",
    "v3_low": "Murs bas",
    "v3_hint": "Glissez ou les flèches pour tourner · Z Q S D pour bouger · molette pour zoomer",
    "v3_close": "Fermer la vue 3D",
    "pn_close": "Fermer",
    "pn_hide": "Ranger (la radiographie reste active)",
    "pn_show": "Réafficher la légende",
    "tw_alone": "Reliez les personnes par des flèches pour faire passer le travail.",
    "tw_works": "{who} : {does}.",
    "tw_shares": "{who} répartit le travail : {to}.",
    "tw_back": "Tout revient à {who}.",
    "tw_hands": "{who} → {to}.",
    "tw_hands_what": "{who} → {to} : {what}.",
    "tw_done": "Terminé. Passages : {hands} · Personnes : {people} · Le plus de travail : {who}",
    "tw_loose": "Aucune flèche vers ou depuis {who}.",
    "tw_sum": "Personnes : {people} · Flèches : {arrows}",
    "nw_cables": "Reliez les appareils par des flèches, comme des câbles, pour envoyer des données.",
    "nw_none": "{who} n’atteint rien.",
    "nw_allowed": "autorisé",
    "nw_reply": "OK",
    "nw_route": "{path} ({ms} ms)",
    "nw_ok": "Arrivés : {n} sur {all}.",
    "nw_loose": "{who} n’est relié à rien.",
    "nw_sum": "Appareils : {devices} · Câbles : {cables}",
    "cy_none": "Reliez chaque véhicule par des flèches aux lieux où il va.",
    "cy_still": "{who} n’a nulle part où aller.",
    "cy_stop": "Arrêt : {place}",
    "cy_route": "{who} : {stops}",
    "cy_sum": "Véhicules : {vehicles} · Lieux : {places}",
    "fw_none": "Reliez les formes par des flèches pour les suivre.",
    "fw_at": "→ {what}",
    "fw_done": "Flèches suivies : {n}.",
    "fw_sum": "Formes : {shapes} · Flèches : {arrows}",
    "ec_no_source": "Ajoutez une pile pour alimenter le circuit.",
    "ec_opened": "{who} : ouvert.",
    "ec_closed": "{who} : fermé.",
    "ec_press": "Cliquez sur un interrupteur pour le basculer.",
    "ec_buzz": "bzzz",
    "ec_short": "Court-circuit ! Rien ne freine le courant aux bornes de la pile.",
    "ec_open": "Le circuit n’est pas fermé : aucun courant ne passe.",
    "ec_source": "{who} : {v} V, {a}",
    "ec_dark": "{who} : pas de lumière.",
    "ec_too_bright": "{who} : beaucoup trop de courant ({a}), ça grillerait.",
    "ec_lit": "{who} : éclaire ({a}).",
    "ec_turns": "{who} : tourne ({a}).",
    "ec_still": "{who} : ne tourne pas.",
    "ec_buzzes": "{who} : sonne ({a}).",
    "ec_quiet": "{who} : silence.",
    "ec_drop": "{who} : {v} V à ses bornes, {a}",
    "ec_conducts": "{who} laisse passer le courant : {a}",
    "ec_blocks": "{who} bloque le courant : il ne passe que dans l'autre sens",
    "ec_blown": "{who} a fondu : trop de courant l'a traversé, et le circuit est ouvert",
    "ec_fuse_ok": "{who} tient : {a} le traversent",
    "ec_reads_a": "{who} indique {a}",
    "ec_reads_v": "{who} indique {v} V",
    "ec_loose": "{who} a besoin d’un fil à chaque bout.",
    "ec_sum": "Composants : {parts} · Fils : {wires}",
    "os_empty": "Dessinez un Soleil et quelques planètes pour les mettre en mouvement.",
    "os_year_vs": "{who} tourne autour de {around} : une année y dure {n} années terrestres.",
    "os_year": "{who} fait le tour de {around} toutes les {n} secondes.",
    "os_launch": "{who} décolle.",
    "os_orbit": "{who} se met en orbite autour de {around}.",
    "os_arrive": "{who} atteint {where}.",
    "os_landed": "Atterrissage : {where}",
    "os_no_sun": "Ajoutez un Soleil autour duquel les planètes tourneront.",
    "os_sum": "Astres : {bodies} · Engins : {craft}",
    "tw_again": "continue",
    "ec_dim": "{who} : éclaire faiblement ({a}).",
    "n_i_picture": "Tableau",
    "n_i_mirror": "Miroir",
    "n_i_shelf": "Étagère murale",
    "n_i_walltv": "Télévision murale",
    "n_i_wallclock": "Horloge murale",
    "n_i_sconce": "Applique murale",
    "n_i_cabinet": "Placard mural",
    "n_i_hooks": "Patères",
    "n_i_radiator": "Radiateur",
    "wk_i_picture": "regarde le tableau",
    "wk_i_mirror": "se regarde dans le miroir",
    "wk_i_shelf": "prend un livre sur l’étagère",
    "wk_i_walltv": "regarde la télé",
    "wk_i_wallclock": "regarde l’heure",
    "wk_i_sconce": "allume la lumière",
    "wk_i_cabinet": "prend une assiette dans le placard",
    "wk_i_hooks": "accroche un manteau",
    "wk_i_radiator": "se réchauffe les mains",
    "wk_locked_in": "{room} est derrière une porte verrouillée.",
    "v3_walk": "Se promener",
    "v3_above": "Vue de dessus",
    "v3_restart": "Recommencer",
    "v3_door": "Porte",
    "v3_locked": "C’est verrouillé.",
    "v3_no_door": "Aucune porte à portée.",
    "v3_hint_walk": "Z Q S D pour marcher · cliquez dans la vue pour regarder avec la souris, Échap la libère · E ou un clic utilise ce qui est devant vous",
    "us_nothing": "Rien à portée",
    "us_light_on": "Lumière allumée",
    "us_light_off": "Lumière éteinte",
    "us_breaker_off": "Disjoncteurs coupés : tout est éteint",
    "us_breaker_on": "Disjoncteurs remis : la lumière revient",
    "us_screen_on": "{what} allumé",
    "us_screen_off": "{what} éteint",
    "us_fan_on": "Ventilateur en marche",
    "us_fan_off": "Ventilateur arrêté",
    "us_water_on": "L’eau coule",
    "us_water_off": "Eau fermée",
    "us_heat_on": "{what} allumé",
    "us_heat_off": "{what} éteint",
    "us_sit": "Vous vous asseyez. Marchez pour vous lever",
    "us_sleep": "Une bonne nuit. C’est le matin",
    "us_rest": "Vous vous allongez un moment",
    "us_open": "{what} ouvert",
    "us_close": "{what} fermé",
    "us_flush": "Chasse tirée",
    "us_play": "Vous jouez quelques notes",
    "us_plant": "Vous arrosez la plante",
    "us_book": "Vous prenez un livre",
    "us_pay": "Payé. Merci !",
    "us_plug": "Vous branchez quelque chose",
    "us_shop": "Vous prenez un article en rayon",
    "us_coffee": "Un café tout frais",
    "us_exercise": "Bonne séance",
    "us_game": "À vous de jouer",
    "us_fish": "Les poissons s’approchent",
    "us_music": "Musique",
    "us_write": "Vous écrivez au tableau",
    "us_breaker": "Le tableau électrique : E à nouveau rallume tout",
    "us_car": "La voiture est fermée",
    "us_swim": "Un petit plongeon",
    "wo_head": "Murs",
    "wo_top": "Haut",
    "wo_foot": "Bas",
    "wo_left": "Gauche",
    "wo_right": "Droite",
    "wo_outside": "Mur extérieur",
    "wo_outside_tip": "Un mur extérieur porte la maison et la protège des intempéries : il reste",
    "wo_open_to": "Ouvert sur {room}",
    "wo_wall_to": "Mur avec {room}",
    "wo_free": "Ouverture de {span}. Le mur ne portait rien de lourd : pas de poutre",
    "wo_lvl": "une poutre LVL de {plies} plis, de {depth} de haut",
    "wo_steel": "une poutre en acier de {depth} de haut (à faire dimensionner par un ingénieur)",
    "wo_carries_floor": "Ouverture de {span} sous l’étage : {beam}, sur un poteau à chaque bout.",
    "wo_carries_roof": "Ouverture de {span} sous le milieu du toit : {beam}, sur un poteau à chaque bout.",
    "wo_mid_post": "Une telle portée demande aussi un poteau au milieu.",
    "wo_add_posts": "Poser les poteaux",
    "ad_beam_posts": "Le mur enlevé entre {a} et {b} portait la maison : sa poutre a besoin de poteaux",
    "xr_wired": "{n} prises, interrupteurs et un tableau électrique posés",
    "xr_panel": "Tableau électrique",
    "xr_heater": "Chauffe-eau",
    "xr_main": "Arrivée d’eau",
    "xr_sewer": "Vers l’égout",
    "xr_meter": "Compteur de gaz",
    "xr_furnace": "Chaudière",
    "xr_button": "Dans les murs",
    "xr_tip": "Voir dans les murs : l’ossature, les câbles, les tuyaux, le gaz et les gaines",
    "xr_head": "Dans les murs",
    "xr_frame": "Ossature : montants, solives, poutres",
    "xr_power": "Câblage, couleur selon l'ampérage",
    "xr_water": "Eau froide et chaude",
    "xr_drain": "Évacuations et ventilation",
    "xr_gas": "Gaz",
    "xr_air": "Gaines de chauffage et d’air",
    "xr_wire": "Poser prises et interrupteurs",
    "xr_rewire": "Recâbler",
    "xr_wire_tip": "Des prises pour qu’aucun point d’un mur ne soit à plus de 1,8 m d’une prise, tous les 1,2 m au-dessus des plans de travail, un interrupteur à chaque porte et un tableau électrique",
    "xr_wire_tile": "Prises et interrupteurs",
    "v3_outside": "Dehors",
    "v3_tips": "Suggestions : {n}",
    "ad_said": "Suggestion : {what}",
    "ad_no_front": "Il n’y a pas de porte d’entrée : personne ne peut entrer de l’extérieur.",
    "ad_fix_front": "Ajouter une porte d’entrée",
    "ad_window_bed": "Pas de fenêtre dans {room} : une chambre a besoin de lumière et d’une issue en cas d’incendie.",
    "ad_window": "Pas de fenêtre dans {room} pour laisser entrer le jour.",
    "ad_fix_window": "Ajouter une fenêtre",
    "ad_dark": "Ni fenêtre ni lumière dans {room}.",
    "ad_fix_light": "Ajouter une applique",
    "ad_missing": "Il manque dans {room} : {what}.",
    "ad_fix_add": "Ajouter : {what}",
    "ad_bath_sink": "Il y a des toilettes dans {room} mais pas de lavabo pour se laver les mains.",
    "ad_small_bed": "Un lit double est à l’étroit dans {room} ({area}) : environ {want} serait confortable.",
    "ad_back_to_tv": "Dos à la télé : {what}.",
    "ad_fix_face_tv": "Le tourner vers la télé",
    "ad_door_hits": "Une porte heurte ceci en s’ouvrant : {what}.",
    "ad_fix_flip": "L’ouvrir dans l’autre sens",
    "ad_bath_kitchen": "La porte de {bath} donne directement dans {kitchen}.",
    "ad_boxed_in": "Personne ne peut y accéder : {what} ({room}).",
    "ad_front_blocked": "{what} ne peut pas s’ouvrir : {by} est devant.",
    "ad_firewall": "Rien ne protège le réseau d’Internet : placez un pare-feu entre les deux.",
    "ad_fix_firewall": "Ajouter un pare-feu",
    "ad_single": "Tout passe par {who} : s’il tombe en panne, plus rien ne passe.",
    "ad_led": "{who} reçoit trop de courant ({a}) et grillerait : placez une résistance devant.",
    "ad_fix_resistor": "Ajouter une résistance",
    "ad_switch": "Il n’y a pas d’interrupteur pour l’éteindre.",
    "ad_fix_switch": "Ajouter un interrupteur",
    "ad_busy": "{who} fait l’essentiel du travail : répartissez-le.",
    "tab_code_tip": "Écrire les étapes en mots simples (pseudocode) ; le diagramme est dessiné à partir d’elles",
    "tab_hand_tip": "Dessiner à la main : organigrammes, plans, personnes au travail, réseaux, circuits et plus",
    "tab_lang_tip": "L’écrire dans un langage de programmation : Python, Java, C#, C++, JavaScript et plus",
    "hm_icons": "Ajouter une icône depuis Icônes, sous les formes : cliquez-la ou glissez-la sur la feuille ; cherchez-la par son nom",
    "hm_room": "Déplacer une pièce ou un conteneur, et tout ce qu’il contient suit",
    "hm_door": "Placer une porte, une fenêtre ou un tableau près d’un mur, et il s’y encastre",
    "hm_tie": "Relier des pièces par une flèche, ou par une porte entre elles, et les laisser écartées sur le papier : en 3D elles se rejoignent, une porte dans le mur qui les sépare",
    "st_title": "Commencer une maison",
    "st_sub": "Choisissez les pièces. Elles sont agencées et meublées, reliées par des flèches ; en 3D elles se rejoignent, une porte entre chacune.",
    "st_beds": "Chambres",
    "st_baths": "Salles de bains",
    "st_open_plan": "Cuisine et salle à manger en une pièce",
    "st_open_living": "Espace ouvert",
    "st_office": "Un bureau",
    "st_laundry": "Une buanderie",
    "st_garage": "Un garage",
    "st_closet": "Un dressing",
    "st_spread": "Écartées sur le papier",
    "st_make": "Créer la maison",
    "st_rooms_head": "Pièces",
    "st_extras_head": "En plus",
    "st_house_head": "La maison",
    "st_one_floor": "Plain-pied",
    "st_two_floors": "Deux niveaux",
    "st_shuffle": "Mélanger",
    "st_shuffle_tip": "Une autre maison avec les mêmes choix",
    "st_preview": "La maison telle qu’elle sera faite",
    "st_preview_sum": "{rooms} pièces · environ {area}",
    "st_fewer": "Moins",
    "st_more": "Plus",
    "st_made": "{rooms} pièces agencées",
    "st_main": "Chambre parentale",
    "st_bed_n": "Chambre {n}",
    "st_ensuite": "Salle d’eau attenante",
    "st_hall": "Couloir",
    "hm_run_as": "Lancer fait ce qu’est le dessin : visite une maison, fait passer le travail, envoie des données, allume un circuit, lance une fusée",
    "depth": "Profondeur",
    "depth_tip": "Ombrer chaque forme dans sa propre couleur et lui donner une ombre, pour donner du relief aux couleurs",
    "n_i_ac": "Climatiseur",
    "n_i_aquarium": "Aquarium",
    "n_i_arclamp": "Lampadaire arc",
    "n_i_basket": "Panier",
    "n_i_bathmat": "Tapis de bain",
    "n_i_beanbag": "Pouf poire",
    "n_i_bedking": "Lit king size",
    "n_i_bench": "Banc",
    "n_i_books": "Livres",
    "n_i_bunkbed": "Lits superposés",
    "n_i_cactus": "Cactus",
    "n_i_candle": "Bougie",
    "n_i_cattree": "Arbre à chat",
    "n_i_ceilingfan": "Ventilateur de plafond",
    "n_i_vent": "Bouche d’aération",
    "n_i_chandelier": "Lustre",
    "n_i_chest": "Coffre",
    "n_i_coatrack": "Portemanteau",
    "n_i_coffeemaker": "Cafetière",
    "n_i_console": "Console de jeux",
    "n_i_cornershelf": "Étagère d’angle",
    "n_i_cubeshelf": "Étagère cube",
    "n_i_deck": "Terrasse en bois",
    "n_i_desklamp": "Lampe de bureau",
    "n_i_dishwasher": "Lave-vaisselle",
    "n_i_dogbed": "Panier pour chien",
    "n_i_driveway": "Allée de garage",
    "n_i_dryrack": "Étendoir",
    "n_i_elevator": "Ascenseur",
    "n_i_fan": "Ventilateur",
    "n_i_fence": "Clôture",
    "n_i_filing": "Classeur",
    "n_i_floor": "Niveau",
    "n_i_flowerbed": "Parterre de fleurs",
    "n_i_flowers": "Fleurs",
    "n_i_frame": "Cadre photo",
    "n_i_fruitbowl": "Corbeille à fruits",
    "n_i_garagedoor": "Porte de garage",
    "n_i_gardenbench": "Banc de jardin",
    "n_i_grill": "Barbecue",
    "n_i_hamper": "Panier à linge",
    "n_i_hanging": "Plante suspendue",
    "n_i_heater": "Chauffage d’appoint",
    "n_i_hedge": "Haie",
    "n_i_herbs": "Pot d’herbes",
    "n_i_hood": "Hotte",
    "n_i_hottub": "Spa",
    "n_i_ironing": "Planche à repasser",
    "n_i_island": "Îlot de cuisine",
    "n_i_kettle": "Bouilloire",
    "n_i_lot": "Terrain",
    "n_i_loveseat": "Causeuse",
    "n_i_medicine": "Armoire à pharmacie",
    "n_i_microwave": "Micro-ondes",
    "n_i_monitor": "Écran",
    "n_i_ottoman": "Pouf",
    "n_i_palm": "Palmier",
    "n_i_pantry": "Garde-manger",
    "n_i_path": "Chemin de jardin",
    "n_i_patio": "Salon de jardin",
    "n_i_pc": "Tour d’ordinateur",
    "n_i_pendant": "Suspension",
    "n_i_pool": "Piscine",
    "n_i_projector": "Projecteur",
    "n_i_proscreen": "Écran de projection",
    "n_i_recliner": "Fauteuil inclinable",
    "n_i_recordplayer": "Platine vinyle",
    "n_i_sectional": "Canapé d’angle",
    "n_i_shoerack": "Range-chaussures",
    "n_i_reachin": "Placard intégré",
    "n_i_closetrod": "Tringle à vêtements",
    "n_i_closetshelves": "Étagères de dressing",
    "n_i_bifold": "Porte pliante",
    "n_i_sidetable": "Table d’appoint",
    "n_i_soundbar": "Barre de son",
    "n_i_speaker": "Enceinte",
    "n_i_spiral": "Escalier en colimaçon",
    "n_i_stool": "Tabouret",
    "n_i_succulent": "Plante grasse",
    "n_i_tablelamp": "Lampe de table",
    "n_i_toaster": "Grille-pain",
    "n_i_towelrail": "Porte-serviettes",
    "n_i_trash": "Poubelle",
    "n_i_tvstand": "Meuble TV",
    "n_i_utilitysink": "Évier de buanderie",
    "n_i_vanity": "Meuble vasque",
    "n_i_vanitytable": "Coiffeuse",
    "n_i_vase": "Vase",
    "wk_i_spiral": "monte l’escalier en colimaçon",
    "wk_i_elevator": "prend l’ascenseur",
    "wk_i_dishwasher": "remplit le lave-vaisselle",
    "wk_i_island": "coupe des légumes sur l’îlot",
    "wk_i_stool": "s’assoit sur un tabouret",
    "wk_i_trash": "sort la poubelle",
    "wk_i_pantry": "prend quelque chose dans le garde-manger",
    "wk_i_microwave": "réchauffe des restes",
    "wk_i_coffeemaker": "se fait un café",
    "wk_i_toaster": "fait griller du pain",
    "wk_i_kettle": "fait chauffer de l’eau",
    "wk_i_fruitbowl": "prend une pomme",
    "wk_i_vanity": "se brosse les dents",
    "wk_i_hamper": "met le linge au panier",
    "wk_i_ironing": "repasse une chemise",
    "wk_i_dryrack": "étend le linge",
    "wk_i_heater": "se réchauffe près du chauffage",
    "wk_i_utilitysink": "rince un seau",
    "wk_i_bedking": "s’étire sur le grand lit",
    "wk_i_bunkbed": "grimpe sur le lit du haut",
    "wk_i_vanitytable": "se coiffe",
    "wk_i_bench": "s’assoit sur le banc",
    "wk_i_chest": "ouvre le coffre",
    "wk_i_sidetable": "pose un verre",
    "wk_i_filing": "classe des papiers",
    "wk_i_loveseat": "se blottit dans la causeuse",
    "wk_i_sectional": "s’allonge sur le canapé d’angle",
    "wk_i_recliner": "s’installe dans le fauteuil",
    "wk_i_ottoman": "pose les pieds sur le pouf",
    "wk_i_tvstand": "prend la télécommande",
    "wk_i_aquarium": "nourrit les poissons",
    "wk_i_beanbag": "se laisse tomber dans le pouf",
    "wk_i_speaker": "monte le son",
    "wk_i_tablelamp": "allume la lampe",
    "wk_i_desklamp": "allume la lampe de bureau",
    "wk_i_vase": "arrange les fleurs",
    "wk_i_candle": "allume une bougie",
    "wk_i_books": "prend un livre",
    "wk_i_frame": "regarde la photo",
    "wk_i_basket": "regarde dans le panier",
    "wk_i_monitor": "regarde l’écran",
    "wk_i_succulent": "dépoussière la plante grasse",
    "wk_i_herbs": "cueille du basilic",
    "wk_i_palm": "arrose le palmier",
    "wk_i_cactus": "admire le cactus",
    "wk_i_flowers": "sent les fleurs",
    "wk_i_arclamp": "allume le lampadaire",
    "wk_i_cubeshelf": "range l’étagère",
    "wk_i_cornershelf": "pose une plante sur l’étagère d’angle",
    "wk_i_shoerack": "enlève ses chaussures",
    "wk_i_reachin": "choisit des vêtements",
    "wk_i_closetrod": "prend une chemise",
    "wk_i_closetshelves": "prend un pull plié",
    "wk_i_coatrack": "accroche son manteau",
    "wk_i_hood": "allume la hotte",
    "wk_i_towelrail": "prend une serviette",
    "wk_i_medicine": "prend une vitamine",
    "wk_i_soundbar": "monte le volume",
    "wk_i_console": "joue à un jeu vidéo",
    "wk_i_pc": "allume l’ordinateur",
    "wk_i_proscreen": "regarde un film sur grand écran",
    "wk_i_recordplayer": "met un vinyle",
    "wk_i_fan": "allume le ventilateur",
    "wk_i_ac": "allume la climatisation",
    "wk_i_grill": "allume le barbecue",
    "wk_i_pool": "va nager",
    "wk_i_patio": "déjeune dehors",
    "wk_i_gardenbench": "s’assoit au jardin",
    "wk_i_hottub": "se détend dans le spa",
    "wk_i_dogbed": "caresse le chien",
    "wk_i_cattree": "joue avec le chat",
    "wk_i_hedge": "taille la haie",
    "wk_i_flowerbed": "désherbe le parterre",
    "ic_rooms": "Pièces, portes et escaliers",
    "ic_living": "Salon",
    "ic_bedroom": "Chambre et bureau",
    "ic_closets": "Placards et dressing",
    "ic_kitchen": "Cuisine et salle à manger",
    "ic_bath": "Salle de bain et buanderie",
    "ic_decor": "Déco, plantes et luminaires",
    "ic_walls": "Aux murs et rangement",
    "ic_tech": "TV et électronique",
    "ic_outdoor": "Terrain, allée et jardin",
    "fl_ground": "Rez-de-chaussée",
    "fl_up_name": "Étage",
    "fl_upper": "Étage {n}",
    "fl_lower": "Sous-sol {n}",
    "wk_up": "{who} monte : {floor}.",
    "wk_down": "{who} descend : {floor}.",
    "wk_lift": "{who} prend l’ascenseur : {floor}.",
    "wk_up_said": "En haut !",
    "wk_down_said": "En bas !",
    "v3_went_up": "En haut : {floor}",
    "v3_went_down": "En bas : {floor}",
    "v3_all_floors": "Tous les niveaux",
    "v3_up_to": "Jusqu’à : {floor}",
    "v3_floors_tip": "Montrer tous les niveaux, ou retirer ceux du dessus",
    "fp_real": "Taille réelle",
    "fp_depth": "Profondeur",
    "fp_ceiling": "Plafond",
    "lot_keep": "Reculs par rapport aux limites",
    "lot_front": "Avant",
    "lot_side": "Côtés",
    "lot_back": "Arrière",
    "lot_says": "Terrain {w} × {d} {unit} · {area}",
    "lot_build": "Constructible : {w} × {d} {unit} · {area}",
    "lot_house": "Maison {area}",
    "lot_yard": "Jardin {area}",
    "lot_front_is": "avant",
    "lot_side_is": "latéral",
    "lot_back_is": "arrière",
    "ad_stairs_nowhere": "Ne mène encore nulle part : {what}. Dessinez l’étage du dessus à côté.",
    "ad_fix_upstairs": "La faire monter à l’étage",
    "ad_group_house": "La maison est faite de pièces séparées : mettez-la dans un Niveau pour la déplacer d’un bloc sur le terrain.",
    "ad_fix_group": "La mettre dans un Niveau",
    "ad_too_big": "La maison ({house}) est plus grande que la surface constructible ({room}).",
    "ad_setback": "La maison dépasse le recul {side} de {by}.",
    "ad_fix_move_in": "La ramener dans la limite",
    "ad_no_driveway": "Rien ne mène à la porte du garage : ajoutez une allée.",
    "ad_fix_driveway": "Ajouter une allée",
    "hm_floors": "Dessinez chaque étage de la maison dans son propre Niveau, côte à côte : des escaliers au même endroit montent et descendent, en 3D aussi",
    "hm_lot": "Placez un Terrain sous la maison et indiquez sa taille et ses reculs dans le panneau : il montre la surface constructible et le jardin",
    "v3_roof": "Toit",
    "v3_roof_tip": "Poser le toit, ou le soulever pour voir l’intérieur",
    "v3_day": "Jour",
    "v3_evening": "Soir",
    "v3_night": "Nuit",
    "v3_time_tip": "Moment de la journée : jour, soir, ou nuit lumières allumées",
    "v3_save": "Enregistrer l’image",
    "v3_save_tip": "Enregistrer ce que montre la vue comme image",
    "v3_saved": "Image enregistrée",
    "v3_save_failed": "Ce navigateur ne peut pas enregistrer l’image",
    "v3_labels": "Étiquettes",
    "v3_labels_tip": "Nommer les pièces et ce qu’elles contiennent",
    "v3_2d": "2D",
    "v3_3d": "3D",
    "v3_2d_tip": "À plat, vu d’en haut, comme le plan",
    "v3_3d_tip": "Le remettre debout en 3D",
    "v3_hint_flat": "Glissez ou Z Q S D pour déplacer · molette pour zoomer",
    "labels": "Étiquettes",
    "labels_tip": "Nommer les meubles et les pièces sur un plan",
    "rl_kitchen": "Cuisine",
    "rl_bath": "Salle de bain",
    "rl_bed": "Chambre",
    "rl_laundry": "Buanderie",
    "rl_garage": "Garage",
    "rl_office": "Bureau",
    "rl_dining": "Salle à manger",
    "rl_living": "Salon",
    "rl_closet": "Dressing",
    "rl_studio": "Studio",
    "rl_great": "Cuisine ouverte",
    "rl_eatin": "Cuisine-salle à manger",
    "rl_livdine": "Salon-salle à manger",
    "ic_all_icons": "Toutes les icônes",
    "ic_sets": "Groupes d’icônes",
    "ic_find_n": "Chercher parmi {n} icônes",
    "ic_clear": "Effacer la recherche",
    "ic_count": "{n} icônes",
    "ic_found": "{n} trouvées",
    "ic_hint": "Cliquez pour ajouter · glissez sur la feuille",
    "ic_hint_touch": "Touchez pour ajouter · glissez sur la feuille",
    "ic_show_set": "Afficher seulement {set}",
    "ic_browse": "Parcourir toutes les icônes…",
    "ad_overlap": "{a} et {b} sont au même endroit : en 3D l’un traverserait l’autre.",
    "ad_fix_apart": "Les écarter",
    "ad_in_wall": "{what} rentre dans le mur : {room}.",
    "ad_fix_in": "Le ramener dans la pièce",
    "dz_making": "Ce que vous créez",
    "dz_flowchart": "Organigramme",
    "dz_flowchart_tip": "Un programme, pas à pas : exécutez-le et écrivez-le en texte ou en code",
    "dz_design": "Conception",
    "dz_design_tip": "Plans, personnes, réseaux, circuits et espace, en 3D",
    "dz_ask": "Que voulez-vous créer ?",
    "dz_ask_sub": "Choisissez pour commencer. Vous pouvez changer en haut du panneau à tout moment, et chacun garde sa propre feuille.",
    "dz_flow_says": "Les étapes d’un programme. Exécutez-le, vérifiez-le et écrivez-le en texte ou en code.",
    "dz_flow_eg": "Début · Traitement · Décision · Boucle",
    "dz_design_says": "Plans et meubles, personnes, réseaux, circuits et espace. Parcourez-le en 3D.",
    "dz_design_eg": "Pièces · Meubles · Personnes · Appareils",
    "dz_later": "Décider plus tard",
    "dz_add": "Ajouter à la conception",
    "dz_by_set": "Icônes par groupe",
    "dz_words": "Texte",
    "dz_note": "Note",
    "dz_shapes": "Formes",
    "dz_name": "Nom",
    "dz_size": "Taille",
    "dz_height": "Hauteur",
    "dz_lift": "Depuis le sol",
    "dz_drop": "Sous plafond",
    "dz_standard": "Taille standard",
    "dz_standard_tip": "Revenir à la taille habituelle",
    "dz_fits_room": "Pas plus grand que {room} entre ses murs : {size}.",
    "dz_fits_on": "Pas plus grand que ce sur quoi il repose : {what}.",
    "dz_under_ceiling": "Sous le plafond de {room} : {size}.",
    "dz_holds": "Assez grand pour son contenu : au moins {size}.",
    "dz_above": "Au moins aussi haut que l’élément le plus haut ({what}) : {size}.",
    "dz_bad_len": "Saisissez une longueur, comme 1,25 m ou 120 cm.",
    "dz_turn_left": "Tourner d’un quart à gauche",
    "dz_turn_right": "Tourner d’un quart à droite",
    "dz_dims_tip": "Cliquez pour saisir une taille",
    "dz_tidied": "Rangé : {n} déplacés.",
    "hm_dims": "Choisissez un élément du plan pour voir sa taille sur la feuille ; cliquez une taille pour en saisir une autre, comme 2 m",
    "dz_add_how": "Cherchez les icônes ou choisissez un groupe, puis cliquez sur l’une pour l’ajouter ou glissez-la sur la feuille. Choisissez un élément pour voir sa taille et en saisir une autre.",
    "dz_ceil_least": "Un plafond fait au moins {size} de haut.",
    "mt_head": "Matériaux",
    "mt_button": "Matériaux",
    "mt_floor": "Sol",
    "mt_wall": "Murs intérieurs",
    "mt_out": "Murs extérieurs",
    "mt_roof": "Toit",
    "mt_house": "Toute la maison",
    "mt_room": "Cette pièce",
    "mt_plain": "Standard",
    "mt_none": "Dessinez d’abord les pièces, puis choisissez leurs matériaux.",
    "mt_boards": "Plancher en bois",
    "mt_parquet": "Parquet",
    "mt_tiles": "Carrelage",
    "mt_marble": "Marbre",
    "mt_slate": "Ardoise",
    "mt_carpet": "Moquette",
    "mt_concrete": "Béton",
    "mt_paint": "Peinture",
    "mt_wallpaper": "Papier peint",
    "mt_panels": "Lambris",
    "mt_brick": "Brique",
    "mt_stone": "Pierre",
    "mt_siding": "Bardage",
    "mt_stucco": "Enduit",
    "mt_batten": "Planches et couvre-joints",
    "mt_shakes": "Bardeaux de cèdre",
    "mtr_shingles": "Bardeaux",
    "mtr_tiles": "Tuiles en terre cuite",
    "mtr_metal": "Métal",
    "mtr_slate": "Ardoise",
    "mt_herringbone": "Bâtons rompus",
    "mt_hextiles": "Tomettes hexagonales",
    "mt_checker": "Damier",
    "mt_terrazzo": "Terrazzo",
    "mt_cork": "Liège",
    "mt_plaster": "Enduit",
    "mt_shiplap": "Lambris horizontal",
    "mt_beadboard": "Lambris",
    "mt_logs": "Rondins",
    "mt_timber": "Colombages",
    "mt_cladding": "Panneaux de bardage",
    "mt_corrugated": "Tôle ondulée",
    "mtr_thatch": "Chaume",
    "mtr_woodshakes": "Bardeaux de bois",
    "mtr_green": "Toit végétalisé",
    "mtr_solar": "Panneaux solaires",
    "mt_any": "Toute autre couleur",
    "st_floors": "Niveaux",
    "st_basement": "Un sous-sol",
    "st_roof_one": "Toit d’un seul tenant",
    "st_lot": "Sur son propre terrain",
    "st_stairs": "Escalier",
    "st_family": "Salle familiale",
    "st_storage": "Débarras",
    "st_utility": "Local technique",
    "fl_basement": "Sous-sol",
    "hs_button": "Réglages",
    "hs_tip": "Ce que montre la vue 3D : la rue, le terrain, les gouttières, les lumières, la météo",
    "hs_house": "La maison",
    "hs_gutters": "Gouttières et descentes",
    "hs_porch": "Lumières aux portes extérieures",
    "hs_outside": "Dehors",
    "hs_street": "Une rue devant",
    "st_site_head": "Où il se trouve",
    "sf_head": "Quel côté de la rue",
    "sf_side_S": "Côté nord",
    "sf_side_N": "Côté sud",
    "sf_side_E": "Côté ouest",
    "sf_side_W": "Côté est",
    "sf_shape": "La rue",
    "sf_straight": "Droite",
    "sf_curve": "En courbe",
    "addr_head": "Adresse",
    "addr_number": "Numéro",
    "addr_street": "Rue",
    "addr_side": "Rue latérale",
    "addr_corner": "Angle",
    "addr_corner_none": "Pas à l’angle",
    "addr_corner_left": "Rue latérale à gauche",
    "addr_corner_right": "Rue latérale à droite",
    "addr_streets": "Rue des Érables|Avenue des Chênes|Allée des Cèdres|Rue des Ormes|Chemin des Saules|Rue des Bouleaux|Rue des Pins|Avenue du Lac|Cour des Châtaigniers|Rue de la Colline",
    "hs_land": "Le terrain et sa taille",
    "hs_trees": "Des arbres autour",
    "hs_weather": "Météo",
    "sm_head": "L’éprouver contre une tempête",
    "sm_none": "Pas de tempête",
    "sm_gale": "Vent fort",
    "sm_severe": "Violent orage",
    "sm_cat1": "Ouragan cat. 1",
    "sm_cat3": "Ouragan cat. 3",
    "sm_cat5": "Ouragan cat. 5",
    "sm_ef0": "Tornade EF0",
    "sm_ef1": "Tornade EF1",
    "sm_ef2": "Tornade EF2",
    "sm_ef3": "Tornade EF3",
    "sm_ef4": "Tornade EF4",
    "sm_ef5": "Tornade EF5",
    "sm_k_windows": "Fenêtres",
    "sm_k_roof": "Toit",
    "sm_k_walls": "Murs",
    "sm_k_anchors": "Ancrage",
    "sm_k_sway": "Oscillation",
    "sm_k_feel": "Ressenti dedans",
    "sm_k_people": "Personnes",
    "sm_win_ok": "anti-impacts : les débris restent dehors",
    "sm_win_bad": "les débris les brisent et le vent pousse le toit par l’intérieur",
    "sm_holds": "tient {have} contre {need}",
    "sm_gives": "cède : {need} contre {have}",
    "sm_at_ok": "jusqu'à environ {speed}",
    "sm_at_bad": "dès environ {speed}",
    "sm_sway": "son sommet bouge de {move} (la limite est de {limit})",
    "sm_feel_none": "imperceptible ({mg} milli-g)",
    "sm_feel_some": "à peine perceptible ({mg} milli-g)",
    "sm_feel_bad": "on le sent, certains ont la nausée ({mg} milli-g)",
    "sm_safe_ok": "l’abri garde tout le monde en sécurité",
    "sm_safe_bad": "aucune maison n’y résiste entière : il faut un abri",
    "sm_add": "Ajouter : {what}",
    "sm_all_ok": "Il traverse cette tempête.",
    "sm_not_ok": "Il ne traverserait pas cette tempête intact.",
    "sm_again": "Recommencer",
    "bp_watch": "Voir la construction",
    "bp_watch_tip": "Le regarder s’élever de nouveau depuis le sol",
    "cn_skip": "Construction · regardez autour librement · Entrée ou Passer pour finir",
    "mo_skip": "Passer", "mo_skip_tip": "Finir la construction maintenant (Entrée)",
    "jb_slower": "Plus lent ( [ )", "jb_faster": "Plus vite ( ] )", "jb_speed_tip": "À quelle vitesse c'est construit",
    "jb_arrive": "L'équipe arrive", "jb_stakes": "Piquetage des angles", "jb_dig": "Creusement du sous-sol",
    "jb_trench": "Creusement des fondations", "jb_forms": "Coffrage de la dalle", "jb_forms_wall": "Coffrage des fondations",
    "jb_rebar": "Pose des armatures", "jb_pour": "Coulage du béton", "jb_strike": "Décoffrage",
    "jb_lumber": "Livraison du bois", "jb_deck": "Pose des solives et du plancher", "jb_frame": "Ossature des murs",
    "jb_stairs": "Construction de l'escalier", "jb_trusses": "Levage des fermes de toit", "jb_roofboards": "Voligeage du toit",
    "jb_roofing": "Couverture du toit", "jb_scaffold": "Montage de l'échafaudage", "jb_sheath": "Contreventement des murs",
    "jb_windows": "Pose des fenêtres", "jb_doors": "Pose des portes", "jb_siding": "Bardage des murs",
    "jb_scaffold_down": "Démontage de l'échafaudage", "jb_mep": "Électricité et plomberie", "jb_drywall": "Pose des plaques de plâtre",
    "jb_ceilings": "Finition des plafonds", "jb_floors": "Pose des sols", "jb_fittings": "Installation de la cuisine et des salles de bain",
    "jb_fixtures": "Pose des luminaires et interrupteurs", "jb_movein": "Le déménagement", "jb_family": "Enfin chez soi",
    "jb_clean": "Nettoyage du chantier", "jb_steel": "Montage de la charpente métallique", "jb_deckpour": "Coulage des planchers",
    "jb_cladding": "Pose du bardage extérieur", "jb_core": "Construction du noyau",
    "sr_same": "Toutes les pièces de ce type ({n})",
    "sr_same_tip": "Un changement du sol, des murs ou du plafond s’applique à chaque pièce de ce type",
    "mp_fix": "Corriger",
    "mp_no_heater": "Il y a de l’eau chaude à fournir mais pas de chauffe-eau : il en faut un",
    "hn_holding": "La prise de {what} en main : E sur une prise murale pour la brancher",
    "hn_dropped": "La prise de {what}, posée",
    "hn_dead": "{what} : pas de courant, le disjoncteur a sauté",
    "hn_reset": "Disjoncteur réarmé : le courant revient",
    "hn_on": "{what} allumé : {w} W",
    "hn_off": "{what} éteint",
    "hn_trip": "Le disjoncteur a sauté : {w} W sur un circuit de {a} A. Réarmez-le au tableau",
    "gp_in": "Dans l’eau : W A S D pour nager, E au bord pour sortir",
    "gp_out": "Hors de la piscine",
    "gp_gate_shut": "Le portillon de la piscine s’est refermé et verrouillé tout seul",
    "gp_jets_on": "Jets en marche : l’eau bouillonne",
    "gp_jets_off": "Jets arrêtés",
    "o3_open_gate": "Ouvrir le portillon",
    "o3_close_gate": "Fermer le portillon",
    "dm_bar": "La tempête",
    "dm_pause": "Mettre la tempête en pause",
    "dm_play": "Laisser la tempête continuer",
    "dm_rate": "Vitesse",
    "dm_rate_now": "Vitesse : {rate}",
    "dm_follow": "Suivre",
    "dm_follow_tip": "Garder la caméra sur ce que la tempête emporte",
    "dm_again": "La tempête à nouveau",
    "dm_path": "Son passage",
    "dm_path_over": "Juste dessus",
    "dm_path_edge": "Son bord le plus fort",
    "dm_path_near": "Tout près",
    "dm_head": "Après la tempête",
    "dm_wait": "Ça commence…",
    "dm_close": "Fermer",
    "dm_none": "Rien de perdu : la maison a tenu telle quelle",
    "dm_total": "Environ {cost} pour tout réparer",
    "dm_total_so_far": "Pour l’instant, environ {cost} pour tout réparer",
    "dm_note": "Approximatif, d’après des moyennes américaines de 2025 : la toiture environ 6,50 $ le pied carré, un mur extérieur environ 22 $, une fenêtre environ 1 000 $, reconstruire 162 $ le pied carré (NAHB), un arbre tombé environ 1 000 $, un pouce d’eau dans une maison environ 25 000 $ (FEMA), un sinistre dû à la foudre environ 18 600 $ (Triple-I).",
    "dm_neighbors": "{n} maisons des voisins détruites",
    "dm_land": "{n} arbres abattus alentour",
    "dm_safe": "Tous ceux de la pièce refuge s’en sont sortis",
    "dm_loss": "La maison perdue : reconstruite, avec son contenu",
    "dm_slid": "Poussée hors de ses fondations : soulevée et remise en place",
    "dm_roof": "Toit arraché",
    "dm_cover": "Couverture brisée par la grêle",
    "dm_walls": "Murs extérieurs effondrés",
    "dm_windows": "Fenêtres brisées",
    "dm_skin": "Bardage arraché",
    "dm_chimney": "Cheminée effondrée",
    "dm_things": "Meubles et affaires",
    "dm_fixtures": "Équipements arrachés",
    "dm_flood": "Eau à l’intérieur",
    "dm_solar": "Panneaux solaires",
    "dm_trees": "Arbres tombés dans le jardin",
    "dm_cars": "Voitures épaves",
    "dm_sheds": "Abris et jeux",
    "dm_yard": "Objets du jardin",
    "mp_no_furnace": "Des bouches de chauffage sans rien pour y souffler l’air : il faut une chaudière",
    "mp_heater_room": "Un chauffe-eau au gaz dans {room} : seul un appareil étanche, qui prend son air dehors, est permis dans une chambre ou une salle de bain",
    "mp_furnace_room": "Une chaudière au gaz dans {room} : seule une chaudière étanche est permise dans une chambre ou une salle de bain",
    "mp_heater_garage": "Un appareil au gaz dans le garage : sa flamme à 46 cm du sol, sur un socle, un butoir devant",
    "mp_hot_far": "{what} est à {len} de tuyau du chauffe-eau, au-delà des {most} permis : il faut une boucle de recirculation",
    "mp_co": "Un combustible brûle ici (ou un garage est attenant) : il faut un détecteur de monoxyde de carbone devant les chambres, dans {room}",
    "mp_co_name": "Détecteur de fumée et de CO",
    "mp_dryer_long": "Le conduit du sèche-linge ferait {len} jusqu’à l’extérieur, au-delà des {most} permis : il faut un ventilateur d’appoint, ou le sèche-linge près d’un mur extérieur",
    "mp_hood": "Une cuisinière dans {room} sans hotte au-dessus",
    "mp_gfci": "{n} prises près de l’eau ont besoin d’une protection différentielle",
    "mp_panel_room": "Le tableau électrique ne peut pas être dans une salle de bain ni dans un placard",
    "mp_need_wc": "Pour environ {people} personnes, le code demande {need} toilettes ; il y en a {have}",
    "mp_need_lav": "Pour environ {people} personnes, le code demande {need} lavabos dans les toilettes ; il y en a {have}",
    "mp_need_df": "Pour environ {people} personnes, le code demande {need} fontaines à boire ; il y en a {have}",
    "mp_need_ss": "Un bâtiment comme celui-ci demande un évier de service",
    "mp_fuel_head": "Chauffage et cuisson",
    "mp_fuel_gas": "Gaz et électricité",
    "mp_fuel_electric": "Tout électrique",
    "mp_gas_label": "{size} gaz · {kbtu} kBtu/h",
    "mp_flue": "Conduit de fumée",
    "mp_direct": "Ventouse étanche, à travers le mur",
    "mp_tpr": "Soupape de sûreté",
    "mp_expansion": "Vase d’expansion",
    "mp_recirc": "Pompe de bouclage",
    "mp_bollard": "Butoir de protection",
    "mp_backflow": "Clapet anti-retour",
    "mp_grease": "Bac à graisse",
    "mp_booster": "Surpresseur",
    "mp_prv": "Réducteur de pression",
    "mp_dryer_duct": "Conduit du sèche-linge, vers l’extérieur",
    "mp_dryer_fan": "Conduit du sèche-linge, avec ventilateur d’appoint",
    "mp_cold_only": "Froide seulement : aucun chauffe-eau ne l’alimente",
    "mp_hot_wait": "Eau chaude du chauffe-eau dans {room} : {len} de tuyau, environ {s} s pour arriver",
    "mp_hot_now": "Chaude tout de suite : la boucle garde le tuyau chaud ({len} depuis le chauffe-eau dans {room})",
    "mp_gas_on": "{what} : gaz du compteur, une conduite de {size}, {kbtu} kBtu/h",
    "mp_elec_on": "{what} : électrique, sur son propre circuit de {amps} A",
    "mp_no_gas": "{what} brûle du gaz, mais aucune conduite de gaz n’y arrive",
    "mp_run_hot": "L’eau chaude arrive à {what} en environ {s} s ({len} de tuyau)",
    "n_i_fountain": "Fontaine à boire",
    "wk_i_fountain": "boit une gorgée",
    "ly_button": "Calques",
    "ly_tip": "Les calques qu’on peut choisir : fermez-en un et seuls les autres se cliquent, s’encadrent ou se sélectionnent",
    "ly_head": "Calques sélectionnables",
    "ly_all": "Tous",
    "ly_only_short": "Seul",
    "ly_only_tip": "Choisir seulement {layer}",
    "ly_only": "Choisir seulement ce calque",
    "ly_pick_all": "Tout sélectionner sur ce calque",
    "ly_lock": "Fermer ce calque",
    "ly_move": "Déplacer vers le calque",
    "ly_own": "Revenir à son propre calque",
    "ly_layer": "Calque",
    "ly_note": "Les calques fermés sont atténués : un clic les traverse jusqu’à ce qui est dessous.",
    "ly_shut": "{layer} est fermé (Calques, près de Sélection)",
    "ly_rooms": "Pièces et étages",
    "ly_walls": "Murs, portes et escaliers",
    "ly_furniture": "Meubles",
    "ly_lights": "Éclairage et électricité",
    "ly_water": "Plomberie et sanitaires",
    "ly_outside": "Extérieur et terrain",
    "ly_people": "Personnes",
    "sm_seen": "Dans la tempête : {what}",
    "sm_ev_none": "rien de cassé pour l’instant",
    "sm_ev_windows": "fenêtres brisées",
    "sm_ev_roof": "toit arraché",
    "sm_ev_walls": "murs abattus",
    "sm_ev_slid": "poussée hors de ses fondations",
    "sm_ev_flew": "la maison entière emportée",
    "sm_ev_yard": "objets du jardin emportés",
    "sm_ev_safe": "la pièce refuge tient toujours",
    "sm_quake1": "Séisme modéré",
    "sm_quake2": "Séisme fort",
    "sm_quake3": "Séisme violent",
    "sm_flood1": "Inondation",
    "sm_flood2": "Inondation profonde",
    "sm_flood3": "Onde de tempête",
    "sm_snow1": "Fortes chutes de neige",
    "sm_snow2": "Très fortes chutes de neige",
    "sm_snow3": "Neige record",
    "sm_hail1": "Grêle",
    "sm_hail2": "Grosse grêle",
    "sm_hail3": "Grêle géante",
    "sm_g_wind": "Vent",
    "sm_g_quake": "Séisme",
    "sm_g_flood": "Inondation",
    "sm_g_snow": "Neige",
    "sm_g_hail": "Grêle",
    "sm_k_chimney": "Cheminée",
    "sm_k_contents": "Intérieur",
    "sm_k_cover": "Couverture",
    "sm_k_solar": "Panneaux solaires",
    "sm_chim_ok": "une cheminée en briques tient",
    "sm_chim_bad": "une cheminée en briques s’effondre sous de telles secousses",
    "sm_shelf_ok": "les meubles restent debout",
    "sm_shelf_bad": "les grands meubles basculent : fixez-les au mur",
    "sm_wet_ok": "l’eau reste sous le plancher",
    "sm_wet_bad": "{deep} d’eau au-dessus du plancher",
    "sm_hail_win": "des grêlons aussi gros brisent le verre",
    "sm_cover_ok": "la couverture résiste à ces grêlons",
    "sm_cover_bad": "la couverture est détruite",
    "sm_pv_ok": "les panneaux solaires résistent à ces grêlons",
    "sm_pv_bad": "les panneaux solaires se fissurent",
    "sm_h_raised": "Surélevée sur pilotis",
    "sm_h_rafters": "Chevrons renforcés",
    "sm_h_roofing": "Couverture anti-grêle",
    "sm_ev_sway": "le sommet oscille de {move} (dessiné {times} fois plus grand)",
    "sm_ev_cave": "toit effondré",
    "sm_ev_float": "la maison entière emportée par l’eau",
    "sm_ev_chimney": "cheminée effondrée",
    "sm_ev_shelves": "meubles renversés",
    "sm_ev_wet": "eau à l’intérieur",
    "sm_ev_cover": "couverture détruite",
    "sm_ev_solar": "panneaux solaires fissurés",
    "sm_ev_trees": "arbres arrachés",
    "sm_ev_bare": "il ne reste que la dalle nue",
    "sm_ev_skin": "bardage arraché de la tour",
    "sm_ev_surge": "onde de tempête sur les terres",
    "sm_ev_flooded": "rues et jardins inondés",
    "sm_hold_head": "Ce qui le tient ensemble",
    "sm_h_ties": "Attaches anti-ouragan",
    "sm_h_straps": "Feuillards du toit aux fondations",
    "sm_h_shear": "Murs de contreventement",
    "sm_h_anchors": "Boulons d’ancrage",
    "sm_h_impact": "Fenêtres anti-impacts ou volets",
    "sm_h_saferoom": "Abri anti-tornade",
    "sm_h_brace": "Croix de contreventement",
    "sm_h_outrigger": "Treillis de stabilisation",
    "sm_h_damper": "Amortisseur à masse accordée",
    "sm_g_fire": "Feu de forêt",
    "sm_fire1": "Feu d’herbe",
    "sm_fire2": "Feu de broussailles",
    "sm_fire3": "Feu de cimes",
    "sm_wf_flames": "flammes de {len}",
    "sm_k_embers": "Braises",
    "sm_k_zone0": "Le premier mètre et demi",
    "sm_k_fireroof": "Toit",
    "sm_k_heat": "Chaleur sur les murs",
    "sm_k_glass": "Fenêtres",
    "sm_k_leave": "Personnes",
    "sm_wf_few": "un feu d’herbe projette peu de braises, et elles s’éteignent vite",
    "sm_wf_vents_ok": "les aérations sont grillagées : les braises restent hors des combles",
    "sm_wf_vents_bad": "les braises entrent par les aérations et allument les combles de l’intérieur",
    "sm_wf_zone_ok": "rien d’inflammable à un mètre et demi des murs",
    "sm_wf_zone_bad": "des choses inflammables à un mètre et demi des murs ({n}) : les braises les allument, leurs flammes atteignent la maison",
    "sm_wf_roof_ok": "le toit est classé A : les braises ne l’allument pas",
    "sm_wf_roof_bad": "bardeaux de bois ou chaume : les braises s’y posent et il prend feu",
    "sm_wf_heat_ok": "{q} sur les murs avec le combustible à {d} : en dessous de ce qui les allume",
    "sm_wf_heat_bad": "{q} sur les murs avec le combustible à {d} : assez pour les allumer",
    "sm_wf_glass_ok": "le verre tient à la chaleur",
    "sm_wf_glass_bad": "la chaleur fait éclater le verre et le feu entre",
    "sm_wf_leave": "partir tôt : aucune maison n’est un endroit pour attendre qu’un feu de forêt passe",
    "sm_h_vents": "Aérations anti-braises",
    "sm_h_zone0": "Un mètre et demi dégagé",
    "sm_h_space": "Zone débroussaillée, 30 m",
    "sm_h_siding": "Bardage ignifuge",
    "sm_h_classa": "Toit de classe A",
    "sm_k_lightning": "Foudre",
    "sm_lt_ok": "les paratonnerres prennent chaque coup et l’envoient à la terre",
    "sm_lt_risk": "un coup frapperait le faîtage et pourrait mettre le feu : un paratonnerre l’envoie à la terre",
    "sm_h_rod": "Paratonnerres",
    "sm_g_drill": "Feu dans la maison",
    "sm_drill1": "Feu de jour",
    "sm_drill2": "Feu la nuit",
    "ev_day": "tout le monde debout",
    "ev_night": "tout le monde endormi",
    "sm_k_alarms": "Détecteurs de fumée",
    "sm_k_wired": "Reliés entre eux",
    "sm_k_egress": "Fenêtres d’évacuation",
    "sm_k_sprinklers": "Sprinklers",
    "sm_k_out": "Sortir",
    "sm_k_plan": "Un plan",
    "sm_dr_alarms_ok": "un dans chaque chambre, devant et à chaque étage",
    "sm_dr_alarms_bad": "{n} pièces où le code veut un détecteur de fumée n’en ont pas",
    "sm_dr_wired_ok": "si l’un sonne, tous sonnent",
    "sm_dr_wired_bad": "chacun sonne seul : derrière une porte fermée on peut ne pas l’entendre",
    "sm_dr_egress_ok": "chaque chambre a une fenêtre pour sortir",
    "sm_dr_egress_bad": "{n} chambres n’ont pas de fenêtre pour sortir",
    "sm_dr_spr_ok": "un sprinkler au-dessus du feu le contient là où il commence",
    "sm_dr_spr_none": "aucun : le feu grandit jusqu’à remplir la pièce",
    "sm_dr_nobody": "personne à faire sortir",
    "sm_dr_out_ok": "tout le monde dehors à {t}, la première alarme à {first}",
    "sm_dr_out_bad": "{n} sur {of} ne sortiraient pas",
    "sm_dr_plan": "connaître deux sorties pour chaque pièce et un point de rassemblement dehors",
    "sm_k_exits": "Sorties",
    "sm_dr_bldg_alarm": "une alarme incendie dans tout le bâtiment, déclenchée par le premier détecteur ou par l’eau qui coule vers un sprinkler",
    "sm_dr_bldg_detect": "une alarme incendie dans tout le bâtiment, déclenchée par le premier détecteur",
    "sm_dr_exits_ok": "{n} sorties du bâtiment",
    "sm_dr_exits_one": "une sortie : assez pour 49 personnes au plus (ici environ {p})",
    "sm_dr_exits_bad": "une sortie pour environ {p} personnes : au-delà de 49 il en faut une seconde",
    "sm_h_interconnect": "Détecteurs reliés entre eux",
    "sm_h_sprinklers": "Sprinklers domestiques",
    "sm_h_closedoors": "Dormir porte fermée",
    "sm_h_ev_alarms": "les détecteurs de fumée",
    "sm_h_ev_windows": "des fenêtres d’évacuation",
    "ev_said_alarm": "la première alarme à {t}",
    "ev_said_sprink": "un sprinkler s’est ouvert à {t}",
    "ev_said_out": "{n} sur {of} dehors",
    "ev_said_stuck": "{n} piégés",
    "ev_seen": "Pendant l’exercice : {what}",
    "ev_said_none": "le feu a commencé",
    "ev_how_walked": "par la porte",
    "ev_how_crawled": "à quatre pattes sous la fumée",
    "ev_how_window": "par la fenêtre",
    "ev_how_trapped": "piégé par la fumée",
    "ev_how_asleep": "jamais réveillé : aucune alarme entendue",
    "ev_how_noway": "aucune sortie",
    "sm_h_ladders": "Échelles d’évacuation à l’étage",
    "ev_how_window_wait": "à la fenêtre de l’étage, en attente des secours",
    "ev_how_ladder": "par une échelle d’évacuation",
    "ev_first": "La première alarme à {t}, {wired}",
    "ev_wired": "toutes en même temps",
    "ev_alone": "chacune seule",
    "ev_no_alarm": "Aucun détecteur n’a sonné",
    "ev_total_ok": "Tout le monde dehors à {t}",
    "ev_total_bad": "{n} piégés",
    "ev_note": "D’après la recherche : une fois l’alarme déclenchée, il peut ne rester que deux minutes pour sortir (NFPA) ; une pièce meublée comme aujourd’hui peut s’embraser en moins de cinq minutes (UL) ; la fumée ne réveille pas un dormeur, l’alarme si ; une porte fermée retient la fumée pendant de longues minutes.",
    "ev_all_ok": "Tout le monde sort.",
    "ev_not_ok": "Tout le monde ne sortirait pas.",
    "dm_head_drill": "Après l’exercice",
    "sm_ev_struck": "la foudre a frappé le toit",
    "sm_ev_rod": "la foudre a frappé les paratonnerres, sans dégâts",
    "dm_struck": "Coups de foudre sur le toit",
    "wf_ev_came": "le feu est venu à {d}",
    "wf_ev_near": "ce qui touchait les murs a pris feu",
    "wf_ev_caught": "la maison a pris feu",
    "wf_ev_by_embers": "les braises ont allumé les combles",
    "wf_ev_by_zone0": "les flammes contre les murs ont allumé la maison",
    "wf_ev_by_fireroof": "le toit a pris feu",
    "wf_ev_by_heat": "la chaleur a allumé les murs",
    "wf_ev_by_glass": "le feu est entré par les fenêtres",
    "wf_ev_burnt": "la maison a brûlé entièrement",
    "wf_ev_held": "la maison a tenu",
    "wf_seen": "Dans le feu : {what}",
    "wf_all_ok": "Elle traverse ce feu.",
    "wf_not_ok": "Elle brûlerait dans ce feu.",
    "dm_head_fire": "Après le feu",
    "dm_burnt": "La maison a brûlé : reconstruite, avec son contenu",
    "dm_wf_near": "Plantes, clôtures et terrasses contre les murs",
    "dm_wf_land": "Le feu a parcouru {d} de terrain avant que le sol dégagé l’arrête",
    "hs_tab_house": "Maison",
    "hs_tab_land": "Terrain",
    "hs_tab_street": "Rue",
    "hs_tab_weather": "Météo",
    "hs_bound": "Rester sur le terrain",
    "hs_hood": "Voisins",
    "hs_folk": "Passants et voitures",
    "hs_needs_street": "Activez d’abord la rue",
    "ws_head": "Paysage",
    "ws_plains": "Plaine",
    "ws_hills": "Collines",
    "ws_mountains": "Montagnes",
    "ws_forest": "Forêt",
    "ws_lake": "Bord de lac",
    "ws_beach": "Plage",
    "ws_desert": "Désert",
    "ws_tropics": "Tropiques",
    "ws_arctic": "Neige",
    "ws_city": "Ville",
    "wl_head": "Lampadaires",
    "wl_classic": "Classique",
    "wl_lantern": "Lanterne",
    "wl_cobra": "Routier",
    "wl_twin": "Double crosse",
    "wl_modern": "Moderne",
    "wl_globe": "Boule",
    "wl_none": "Aucun",
    "wd_edge": "Votre terrain s’arrête ici",
    "tr_head": "Relief",
    "tr_auto": "Naturel",
    "tr_flat": "Plat",
    "tr_gentle": "Doux",
    "tr_rolling": "Vallonné",
    "tr_steep": "Escarpé",
    "tf_head": "Fondations",
    "tf_auto": "Adaptées",
    "tf_wall": "Mur en béton",
    "tf_posts": "Sur pilotis",
    "tr_new": "Autre terrain",
    "tr_new_off": "Choisissez d’abord un relief autre que Plat",
    "tr_says_wall": "Le terrain descend de {n} sous la maison ; le mur de fondation rattrape la différence",
    "tr_says_posts": "Le terrain descend de {n} sous la maison ; elle repose sur des pilotis, avec des marches devant les portes",
    "hs_lot_trees": "Arbres dans le jardin",
    "hs_needs_trees": "Activez d’abord les arbres alentour",
    "tr_back": "Retour au plan",
    "tr_back_tip": "Retour au plan (Échap)",
    "tr_me": "Me voir",
    "tr_me_off": "Mes yeux",
    "tr_me_tip": "Vous voir de dos, ou regarder par vos propres yeux (V)",
    "tool_view": "Glisser la vue",
    "tool_view_tip": "Chaque glissement ne déplace que la vue ; un appui choisit toujours une forme. Appuyez sur Maj pour changer",
    "dv_on": "Glisser la vue : glisser ne déplace que la vue",
    "dv_off": "Glisser déplace de nouveau les objets",
    "dv_tip3d": "Activé : glisser ne fait que tourner et déplacer la vue. Désactivé : glissez un meuble pour le déplacer. Appuyez sur Maj pour changer",
    "dv_moved": "{what} déplacé",
    "pl_move_room": "Déplacer la pièce",
    "pl_move_room_tip": "Faites glisser pour déplacer la pièce et tout ce qu’elle contient",
    "tx_head": "Apparence",
    "tx_on": "Textures",
    "tx_tip": "Motifs avec leurs reliefs et leurs joints, et l’éclat du métal et du verre. Désactivées : couleurs unies.",
    "units": "Mesurer en",
    "units_ft": "Pieds et pouces",
    "units_m": "Mètres",
    "pw_head": "Lignes électriques",
    "pw_front": "Poteaux devant",
    "pw_back": "Poteaux derrière",
    "pw_under": "Enterrées",
    "pw_none": "Aucune",
    "hs_vents": "Sortie du sèche-linge",
    "hs_dock": "Ponton et bateau",
    "hs_dock_off": "Il faut un lac ou la mer",
    "mx_head": "Mélanger avec",
    "mx_one_water": "Une seule sorte d’eau à la fois",
    "hs_solar": "Panneaux solaires",
    "v3_hint_touch": "Glisser pour tourner · deux doigts pour déplacer, pincer pour zoomer",
    "v3_hint_flat_touch": "Glisser pour déplacer · pincer pour zoomer",
    "v3_hint_walk_touch": "Les flèches pour marcher · glisser pour regarder · toucher pour utiliser ce qui est devant vous",
    "hd_title": "Il y a déjà une maison ici",
    "hd_sub": "Construire la nouvelle à sa place, ou à côté dans la même rue ?",
    "hd_add": "À côté",
    "hd_add_sub": "Maison {n} de la rue",
    "hd_replace": "La remplacer",
    "hd_replace_sub": "La maison actuelle disparaît (Annuler la ramène)",
    "hd_added": "Maison {n} construite à côté",
    "hd_gap_head": "À côté",
    "hd_gap": "Espace entre les maisons",
    "hd_gap_tip": "Entre les terrains, les vôtres et ceux des voisins",
    "ed_separate": "Séparer de la maison",
    "ed_separate_n": "Les séparer de la maison",
    "ed_separated": "Séparée : elle est indépendante maintenant",
    "ed_separated_n": "{n} pièces séparées de la maison",
    "ed_join": "Rattacher à la maison",
    "ed_joined": "Rattachée à {room}",
    "ed_change": "Modifier cette maison…",
    "ed_change_title": "Modifier cette maison",
    "ed_rebuild": "La reconstruire",
    "ed_rebuilt": "Maison reconstruite à sa place",
    "f3_on": "Meubles en 3D",
    "f3_tip": "Le plan tel qu’il est dessiné, ses meubles en 3D, éclairés et ombrés",
    "st_kitchens": "Cuisines",
    "st_livings": "Salons",
    "st_offices": "Bureaux",
    "st_laundries": "Buanderies",
    "st_room_n": "{room} {n}",
    "st_typed": "Tapez un nombre de {from} à {to}, ou utilisez les boutons",
    "st_open": "Commencer à construire",
    "st_open_tip": "Agencer une maison meublée, des appartements, des copropriétés ou un magasin en quelques choix",
    "ty_condos": "Copropriétés",
    "ty_condos_side": "Logements de chaque côté",
    "ty_condo_n": "Logement {n}",
    "tr_gym": "Salle de sport",
    "yd_head": "Jardin",
    "yd_deck": "Terrasse",
    "yd_porch": "Porche",
    "yd_pool": "Piscine",
    "yd_hottub": "Spa",
    "yd_grill": "Barbecue",
    "yd_firepit": "Foyer",
    "yd_trampoline": "Trampoline",
    "yd_swing": "Balançoire",
    "yd_gazebo": "Kiosque",
    "yd_court": "Terrain de basket",
    "yd_pavilion": "Pavillon",
    "yd_fence": "Clôture du jardin",
    "yd_shed": "Abri de jardin",
    "yd_garden": "Potager",
    "yd_no_room": "Pas de place dans le jardin",
    "wk_plan": "Disposition des pièces",
    "wk_furnish": "Ameublement",
    "wk_extras": "Quelques détails",
    "wk_windows": "Fenêtres et portes",
    "wk_decor": "Finitions",
    "wk_wire": "Électricité",
    "wk_arrange": "Placement des meubles",
    "wk_yard": "Le jardin",
    "wk_draw": "Dessin",
    "wk_land": "Le terrain et la rue",
    "wk_house": "Montage des murs",
    "wk_models": "Fabrication des meubles",
    "wk_scene": "L’éclairage",
    "wk_stop": "Arrêter",
    "wk_stopped": "Arrêté : remis comme avant",
    "wb_out": "Ouvrir dans un nouvel onglet",
    "wb_big": "Agrandir",
    "wb_small": "Réduire",
    "wb_loading": "Chargement…",
    "wb_slow": "Toujours en chargement. Ce site refuse peut-être de s’afficher dans une autre page ; ouvrez-le dans un nouvel onglet.",
    "wb_note": "Certains sites ne s’affichent pas dans une autre page. Ouvrez-les dans un nouvel onglet.",
    "wb_opened": "{url} ouvert",
    "wb_bad": "Ce n’est pas une adresse web : {what}",
    "dg_head": "Design",
    "dg_count": "{n} designs",
    "dg_colorway": "Coloris",
    "dg_find": "Chercher parmi {n} objets et {d} designs",
    "dg_classic": "Classique",
    "dg_modern": "Moderne",
    "dg_midcentury": "Mid-century",
    "dg_scandi": "Scandinave",
    "dg_industrial": "Industriel",
    "dg_farmhouse": "Campagne",
    "dg_glam": "Glamour",
    "dg_coastal": "Bord de mer",
    "dg_rustic": "Rustique",
    "dg_japandi": "Japandi",
    "dg_artdeco": "Art déco",
    "dg_boho": "Bohème",
    "dg_minimal": "Minimaliste",
    "dg_traditional": "Traditionnel",
    "dgf_stainless": "Inox",
    "dgf_blackss": "Inox noir",
    "dgf_white": "Blanc",
    "dgf_matte": "Noir mat",
    "dgf_retrocream": "Crème rétro",
    "dgf_retromint": "Menthe rétro",
    "dgf_retrored": "Rouge rétro",
    "dgf_bronze": "Bronze",
    "dgf_panel": "Façade chêne",
    "dgf_black": "Noir",
    "dgf_silver": "Argent",
    "dgf_walnut": "Noyer",
    "dgf_graphite": "Graphite",
    "dgf_terracotta": "Terre cuite",
    "dgf_matteblack": "Noir mat",
    "dgf_woven": "Tressé",
    "dgf_concrete": "Béton",
    "dgf_glazedblue": "Bleu émaillé",
    "dgf_brass": "Laiton",
    "dgf_sage": "Sauge",
    "dgf_cedar": "Cèdre",
    "dgf_teak": "Teck",
    "dgf_blackmetal": "Métal noir",
    "dgf_composite": "Composite",
    "dgf_stone": "Pierre",
    "dgf_green": "Vert",
    "dgf_redbarn": "Rouge grange",
    "dgc_cream": "Crème",
    "dgc_sage": "Sauge",
    "dgc_navy": "Marine",
    "dgc_grey": "Gris",
    "dgc_charcoal": "Anthracite",
    "dgc_white": "Blanc",
    "dgc_mustard": "Moutarde",
    "dgc_teal": "Bleu canard",
    "dgc_rust": "Rouille",
    "dgc_oat": "Avoine",
    "dgc_fog": "Brume",
    "dgc_blush": "Rose poudré",
    "dgc_cognac": "Cognac",
    "dgc_black": "Noir",
    "dgc_olive": "Olive",
    "dgc_linen": "Lin",
    "dgc_oak": "Chêne",
    "dgc_blue": "Bleu",
    "dgc_emerald": "Émeraude",
    "dgc_sapphire": "Saphir",
    "dgc_sand": "Sable",
    "dgc_seafoam": "Vert d’eau",
    "dgc_saddle": "Fauve",
    "dgc_barn": "Grange",
    "dgc_moss": "Mousse",
    "dgc_ash": "Frêne",
    "dgc_clay": "Argile",
    "dgc_jade": "Jade",
    "dgc_plum": "Prune",
    "dgc_ivory": "Ivoire",
    "dgc_terracotta": "Terre cuite",
    "dgc_ochre": "Ocre",
    "dgc_stone": "Pierre",
    "dgc_burgundy": "Bordeaux",
    "dgc_hunter": "Vert chasseur",
    "dgc_gold": "Or",
    "sy_head": "Style",
    "sy_plain": "Simple",
    "sy_plain_sub": "Sans style particulier",
    "sy_change": "Changer",
    "sy_applied": "Style {name}",
    "sy_r_americas": "Amériques",
    "sy_r_europe": "Europe",
    "sy_r_asia": "Asie",
    "sy_r_mideast": "Moyen-Orient et Afrique",
    "sy_r_oceania": "Australie et Nouvelle-Zélande",
    "sy_r_modern": "Moderne",
    "sy_r_civic": "Villes",
    "sy_suggested": "Suggérés",
    "sy_all": "Tous",
    "sy_find": "Chercher un style",
    "sy_any": "Au choix (Mélanger)",
    "sy_none": "Aucun style de ce nom",
    "sy_international": "Style international",
    "sy_brutalist": "Brutaliste",
    "sy_artdeco": "Art déco",
    "sy_storefront": "Rue commerçante",
    "sy_haussmann": "Haussmannien",
    "sy_brownstone": "Brownstone",
    "sy_bistro": "Café parisien",
    "sy_googie": "Diner Googie",
    "sy_collegiate": "Gothique universitaire",
    "sy_schoolhouse": "École rouge",
    "sy_modernist": "Moderniste",
    "sy_hightech": "High-tech",
    "sy_panelblock": "Barre en panneaux",
    "sy_mediterranean": "Méditerranéen",
    "sy_scandi": "Scandinave",
    "sy_craftsman": "Craftsman",
    "sy_colonial": "Colonial",
    "sy_capecod": "Cape Cod",
    "sy_victorian": "Victorien",
    "sy_ranch": "Ranch",
    "sy_farmhouse": "Ferme",
    "sy_dutchcolonial": "Colonial hollandais",
    "sy_logcabin": "Cabane en rondins",
    "sy_aframe": "Chalet en A",
    "sy_midcentury": "Mid-century",
    "sy_prairie": "Prairie",
    "sy_pueblo": "Pueblo en adobe",
    "sy_mission": "Mission espagnole",
    "sy_brazil": "Moderne brésilien",
    "sy_tudor": "Tudor",
    "sy_georgian": "Géorgien",
    "sy_cottage": "Chaumière",
    "sy_french": "Mansarde parisienne",
    "sy_provencal": "Provençal",
    "sy_tuscan": "Villa toscane",
    "sy_dutch": "Maison de canal",
    "sy_nordic": "Scandinave",
    "sy_chalet": "Chalet suisse",
    "sy_izba": "Isba russe",
    "sy_cycladic": "Île grecque",
    "sy_japanese": "Japonais",
    "sy_chinese": "Cour chinoise",
    "sy_hanok": "Hanok coréen",
    "sy_thai": "Thaï",
    "sy_balinese": "Balinais",
    "sy_haveli": "Haveli indien",
    "sy_riad": "Riad marocain",
    "sy_arabian": "Arabe à coupole",
    "sy_sahel": "Banco du Sahel",
    "sy_rondavel": "Rondavel",
    "sy_queenslander": "Queenslander",
    "sy_nzvilla": "Villa néo-zélandaise",
    "sy_modern": "Moderniste",
    "sy_contemporary": "Contemporain",
    "sy_ecohouse": "Maison écologique",
    "rf_head": "Forme du toit",
    "rf_hip": "À quatre pans",
    "rf_gable": "À deux pans",
    "rf_flat": "Plat",
    "rf_slab": "En débord",
    "rf_mansard": "Mansarde",
    "rf_gambrel": "Brisé",
    "rf_aframe": "En A",
    "rf_shed": "Monopente",
    "rf_butterfly": "Papillon",
    "rf_pagoda": "Recourbé",
    "rf_dome": "Dôme",
    "rf_stepped": "Pignon à redents",
    "ty_head": "Quoi construire",
    "ty_what_head": "Ce qu’il comprend",
    "ty_house": "Maison",
    "ty_cabin": "Chalet",
    "ty_townhouses": "Maisons en bande",
    "ty_duplex": "Duplex",
    "ty_apartments": "Appartements",
    "ty_shop": "Épicerie",
    "ty_boutique": "Boutique de vêtements",
    "ty_cafe": "Café",
    "ty_office": "Bureaux",
    "ty_school": "École",
    "ty_units": "Maisons dans la rangée",
    "ty_storeys": "Étages",
    "ty_flats_side": "Appartements de chaque côté",
    "ty_flat_beds": "Chambres chacun",
    "ty_classrooms": "Classes par étage",
    "ty_size": "Taille",
    "ty_small": "Petit",
    "ty_medium": "Moyen",
    "ty_large": "Grand",
    "ty_style_prev": "Style précédent",
    "ty_style_next": "Style suivant",
    "ty_home_n": "Maison {n}",
    "ty_flat_n": "Appt {n}",
    "ty_class_n": "Salle {n}",
    "tr_lobby": "Hall",
    "tr_landing": "Palier",
    "tr_lift": "Ascenseur",
    "tr_sales": "Surface de vente",
    "tr_stock": "Réserve",
    "tr_restroom": "Toilettes",
    "tr_staff": "Salle du personnel",
    "tr_fitting": "Cabine d’essayage",
    "tr_boutique": "Boutique",
    "tr_cafe": "Salle",
    "tr_reception": "Accueil",
    "tr_openoffice": "Open space",
    "tr_meeting": "Salle de réunion",
    "tr_kitchenette": "Coin cuisine",
    "tr_classroom": "Salle de classe",
    "tk_head": "Ce qu'il vend",
    "tk_grocery": "Alimentation",
    "tk_convenience": "Supérette",
    "tk_pharmacy": "Pharmacie",
    "tk_hardware": "Quincaillerie",
    "tk_electronics": "Électronique",
    "tk_books": "Livres",
    "tk_furniture": "Meubles",
    "tk_florist": "Fleurs",
    "tk_toys": "Jouets",
    "tk_sports": "Sport",
    "tk_pets": "Animaux",
    "tk_floor_convenience": "Boutique",
    "tk_floor_pharmacy": "Pharmacie",
    "tk_floor_hardware": "Quincaillerie",
    "tk_floor_electronics": "Magasin d'électronique",
    "tk_floor_books": "Librairie",
    "tk_floor_furniture": "Salle d'exposition",
    "tk_floor_florist": "Fleuriste",
    "tk_floor_toys": "Magasin de jouets",
    "tk_floor_sports": "Magasin de sport",
    "tk_floor_pets": "Animalerie",
    "pg_training": "Salle de formation",
    "pg_boardroom": "Salle du conseil",
    "pg_cubicles": "Box de bureau",
    "pg_phone": "Cabine téléphonique",
    "pg_directors": "Bureau de direction",
    "pg_science_n": "Labo de sciences {n}",
    "pg_computers_n": "Salle informatique {n}",
    "pg_art_n": "Salle d'arts {n}",
    "pg_music_n": "Salle de musique {n}",
    "pg_math_n": "Maths {n}",
    "pg_english_n": "Anglais {n}",
    "pg_history_n": "Histoire {n}",
    "pg_library": "Bibliothèque",
    "pg_cafeteria": "Cantine",
    "pg_nurse": "Infirmerie",
    "pg_labbench": "Paillasse",
    "pg_worktable": "Table de travail",
    "tr_breakout": "Espace détente",
    "tr_school_office": "Secrétariat",
    "ty_together": "Les maisons en bande sont toujours assemblées",
    "ty_start_title": "Commencer un bâtiment",
    "ty_make": "Le créer",
    "tr_office": "Bureau",
    "wx_clear": "Dégagé",
    "wx_cloudy": "Nuageux",
    "wx_rain": "Pluie",
    "wx_storm": "Orage",
    "wx_snow": "Neige",
    "wx_fog": "Brouillard",
    "wx_says_rain": "25 mm de pluie sur ce toit font environ {l} litres d’eau.",
    "wx_gutters": "Les gouttières l’emmènent par les descentes, loin des murs.",
    "wx_no_gutters": "Sans gouttières, elle tombe du bord du toit le long des murs.",
    "wx_says_snow": "30 cm de neige mouillée sur ce toit pèsent environ {kg} kg.",
    "wx_says_rain_ft": "Un pouce de pluie sur ce toit fait environ {gal} gallons d’eau.",
    "wx_says_snow_ft": "Un pied de neige mouillée sur ce toit pèse environ {lb} lb.",
    "land_head": "Le terrain",
    "land_guess": "Le plus petit terrain pour cette maison, avec les reculs habituels",
    "land_house": "Maison {ground} au sol · {all} de planchers",
    "land_cover": "{n} % bâti",
    "land_acres": "{n} acres",
    "land_ha": "{n} ha",
    "hs_floors": "Niveaux et toit",
    "hs_floors_tip": "Ajouter un étage ou un sous-sol, ou couvrir la maison d’un seul toit",
    "hs_floors_title": "Niveaux et toit",
    "hs_floors_sub": "Un nouveau niveau se place à côté des autres sur la feuille, l’escalier relié à celui du dessous ; en 3D, il se pose dessus.",
    "hs_add": "Ajouter",
    "hs_add_up": "Un étage au-dessus",
    "hs_add_down": "Un sous-sol",
    "hs_done": "Terminé",
    "hs_floor_made": "{name} ajouté",
    "dz_finish": "Finition",
    "dz_fin_main": "Principal",
    "dz_fin_trim": "Détails",
    "dz_fin_plain_tip": "Revenir aux couleurs habituelles",
    "sizes": "Dimensions",
    "sizes_tip": "Écrire sur le plan la longueur, la largeur et la hauteur sous plafond de chaque pièce, et la largeur, la profondeur et la hauteur de chaque meuble",
    "ic_fitness": "Sport et jeux",
    "ic_utility": "Garage et technique",
    "ic_store": "Boutiques, bureaux et écoles",
    "ic_power": "Électricité et structure",
    "n_i_consoletable": "Console",
    "n_i_sideboard": "Buffet",
    "n_i_chaise": "Méridienne",
    "n_i_rocker": "Fauteuil à bascule",
    "n_i_hutch": "Vaisselier",
    "n_i_barcart": "Desserte de bar",
    "n_i_highchair": "Chaise haute",
    "n_i_daybed": "Lit de repos",
    "n_i_floormirror": "Miroir sur pied",
    "n_i_toybox": "Coffre à jouets",
    "n_i_standdesk": "Bureau debout",
    "n_i_lshapedesk": "Bureau d’angle",
    "n_i_oven": "Four encastré",
    "n_i_winecooler": "Cave à vin",
    "n_i_freezer": "Congélateur coffre",
    "n_i_cornertub": "Baignoire d’angle",
    "n_i_linencab": "Armoire à linge",
    "n_i_whiteboard": "Tableau blanc",
    "n_i_dartboard": "Cible de fléchettes",
    "n_i_evcharger": "Borne de recharge",
    "n_i_treadmill": "Tapis de course",
    "n_i_exbike": "Vélo d’appartement",
    "n_i_weightbench": "Banc de musculation",
    "n_i_yogamat": "Tapis de yoga",
    "n_i_pooltable": "Billard",
    "n_i_pingpong": "Table de ping-pong",
    "n_i_easel": "Chevalet",
    "n_i_trampoline": "Trampoline",
    "n_i_swing": "Portique de balançoire",
    "n_i_firepit": "Brasero",
    "n_i_lounger": "Transat",
    "n_i_gazebo": "Kiosque de jardin",
    "n_i_shed": "Abri de jardin",
    "n_i_planter": "Jardinière",
    "n_i_birdbath": "Bain d’oiseaux",
    "n_i_lamppost": "Lampadaire d’extérieur",
    "n_i_pathlight": "Borne lumineuse",
    "n_i_porchlight": "Applique extérieure",
    "n_i_floodlight": "Projecteur",
    "n_i_mailbox": "Boîte aux lettres",
    "n_i_bikerack": "Range-vélos",
    "n_i_court": "Terrain de basket",
    "n_i_pavilion": "Pavillon",
    "n_i_parking": "Parking",
    "n_i_dumpster": "Benne à ordures",
    "n_i_condenser": "Groupe extérieur de climatisation",
    "n_i_bins": "Poubelles et bac de tri",
    "n_i_gate": "Portillon",
    "n_i_workbench": "Établi",
    "n_i_shelving": "Étagères de rangement",
    "n_i_toolchest": "Servante d’atelier",
    "n_i_furnace": "Chaudière",
    "n_i_gondola": "Gondole",
    "n_i_checkout": "Caisse",
    "n_i_cooler": "Vitrine réfrigérée",
    "n_i_display": "Table de présentation",
    "n_i_register": "Caisse enregistreuse",
    "n_i_schooldesk": "Pupitre",
    "n_i_outlet": "Prise",
    "n_i_lightswitch": "Interrupteur",
    "n_i_garagebtn": "Bouton de porte de garage",
    "n_i_breaker": "Tableau électrique",
    "n_i_post": "Poteau",
    "wk_i_consoletable": "pose les clés sur la console",
    "wk_i_sideboard": "sort la belle vaisselle",
    "wk_i_chaise": "s’allonge sur la méridienne",
    "wk_i_rocker": "se balance dans le fauteuil à bascule",
    "wk_i_hutch": "admire la porcelaine",
    "wk_i_barcart": "prépare un cocktail",
    "wk_i_highchair": "fait manger le bébé",
    "wk_i_daybed": "s’allonge un moment",
    "wk_i_floormirror": "vérifie sa tenue",
    "wk_i_toybox": "range les jouets",
    "wk_i_standdesk": "travaille debout",
    "wk_i_lshapedesk": "travaille au bureau d’angle",
    "wk_i_oven": "fait cuire un gâteau",
    "wk_i_winecooler": "choisit une bouteille de vin",
    "wk_i_freezer": "prend quelque chose au congélateur",
    "wk_i_cornertub": "prend un long bain",
    "wk_i_linencab": "prend une serviette propre",
    "wk_i_whiteboard": "écrit au tableau blanc",
    "wk_i_dartboard": "lance quelques fléchettes",
    "wk_i_evcharger": "branche la voiture",
    "wk_i_treadmill": "court sur le tapis",
    "wk_i_exbike": "pédale sur le vélo d’appartement",
    "wk_i_weightbench": "soulève des poids",
    "wk_i_yogamat": "fait du yoga",
    "wk_i_pooltable": "fait une partie de billard",
    "wk_i_pingpong": "joue au ping-pong",
    "wk_i_easel": "peint un tableau",
    "wk_i_trampoline": "saute sur le trampoline",
    "wk_i_swing": "se balance sur la balançoire",
    "wk_i_firepit": "allume le brasero",
    "wk_i_lounger": "se prélasse au soleil",
    "wk_i_gazebo": "s’assoit dans le kiosque",
    "wk_i_shed": "sort la tondeuse",
    "wk_i_planter": "arrose la jardinière",
    "wk_i_birdbath": "remplit le bain d’oiseaux",
    "wk_i_lamppost": "allume la lumière extérieure",
    "wk_i_pathlight": "allume la borne",
    "wk_i_porchlight": "allume l’applique",
    "wk_i_floodlight": "allume le projecteur",
    "wk_i_mailbox": "relève le courrier",
    "wk_i_bikerack": "prend son vélo",
    "wk_i_court": "fait quelques paniers",
    "wk_i_pavilion": "pique-nique sous le pavillon",
    "wk_i_dumpster": "porte les ordures à la benne",
    "wk_i_condenser": "vérifie la climatisation",
    "wk_i_bins": "sort les poubelles",
    "wk_i_gate": "laisse passer à travers la clôture",
    "wk_i_workbench": "répare quelque chose à l’établi",
    "wk_i_shelving": "cherche une boîte sur les étagères",
    "wk_i_toolchest": "prend une clé",
    "wk_i_furnace": "monte le chauffage",
    "wk_i_gondola": "prend quelque chose en rayon",
    "wk_i_checkout": "paie à la caisse",
    "wk_i_cooler": "prend une boisson fraîche",
    "wk_i_display": "choisit des fruits",
    "wk_i_register": "encaisse",
    "wk_i_schooldesk": "s’assoit pour le cours",
    "wk_i_outlet": "branche quelque chose",
    "wk_i_lightswitch": "appuie sur l’interrupteur",
    "wk_i_garagebtn": "appuie sur le bouton de la porte de garage",
    "wk_i_breaker": "vérifie les disjoncteurs",
    "wk_i_post": "s’appuie sur le poteau",
    # ---- doors, as they are made (40-doors.js, 2026-10-03)
    "dd_head": "Porte",
    "dd_handle": "Poignée",
    "dd_metal": "Quincaillerie",
    "dd_finish": "Finition",
    "dd_hinges": "Charnières",
    "dd_left": "Gauche",
    "dd_right": "Droite",
    "dd_opens": "S'ouvre jusqu'à",
    "dd_st_flush": "Plane",
    "dd_st_panel6": "Six panneaux",
    "dd_st_panel2": "Deux panneaux",
    "dd_st_shaker": "Shaker",
    "dd_st_craftsman": "Craftsman",
    "dd_st_halfglass": "Mi-vitrée",
    "dd_st_french": "Porte-fenêtre",
    "dd_st_modern": "Moderne",
    "dd_st_barn": "Grange",
    "dd_st_louver": "Persiennée",
    "dd_st_storefront": "Vitrine",
    "dd_hd_lever": "Béquille",
    "dd_hd_knob": "Bouton",
    "dd_hd_pull": "Tirette",
    "dd_mt_brass": "Laiton",
    "dd_mt_chrome": "Chrome",
    "dd_mt_black": "Noir mat",
    "dd_mt_bronze": "Bronze",
    "dd_mt_nickel": "Nickel",
    "dd_fin_drawn": "Comme dessinée",
    "dd_fin_white": "Blanc",
    "dd_fin_oak": "Chêne",
    "dd_fin_walnut": "Noyer",
    "dd_fin_black": "Noir",
    "dd_fin_sage": "Sauge",
    "dd_fin_navy": "Bleu marine",
    "dd_fin_red": "Rouge",
    "dd_ajar": "Entrouverte",
    "dd_wide": "Ouverte",
    "dd_shut": "Fermée",
    # ---- going between floors, walking round (40-climb.js, 2026-10-03)
    "lf_panel": "Boutons de l'ascenseur",
    "lf_going": "Fermeture des portes",
    "lf_here": "{floor}",
    "lf_called": "Ascenseur arrivé",
    # ---- what is done, seen being done (40-use3d.js, 2026-10-03)
    "us_plugged": "Branché : {what}",
    "us_plugged_none": "Branché",
    "us_unplugged": "Débranché : {what}",
    "us_unplugged_none": "Débranché",
    # ---- moving things about in 3D (40-edit3d.js, 2026-10-03)
    "e3_back": "Pas de place : remis en place",
    "e3_turn": "Tourner",
    "e3_turn_tip": "Tourner d'un quart de tour (R)",
    "e3_delete": "Supprimer",
    "e3_delete_tip": "L'enlever (Suppr)",
    "e3_done": "Terminé",
    "e3_no_turn": "Pas de place pour le tourner",
    "e3_deleted": "{what} enlevé",
    "e3_undone": "Annulé",
    "e3_redone": "Rétabli",
    # ---- opened the way it is made, used by looking at it (40-open3d.js, 2026-10-03)
    "o3_closer": "Approchez-vous",
    "o3_open_drawer": "Ouvrir le tiroir", "o3_close_drawer": "Fermer le tiroir",
    "o3_open_door": "Ouvrir la porte", "o3_close_door": "Fermer la porte",
    # the garage door, its opener and its button (40-garage.js)
    "gd_use_button": "Elle marche avec son moteur : utilisez le bouton au mur", "gd_door_verb": "Bouton au mur",
    "gd_open": "Ouvrir la porte du garage", "gd_close": "Fermer la porte du garage", "gd_stop": "Arrêter la porte du garage",
    "gd_opening": "La porte du garage s’ouvre", "gd_closing": "La porte du garage se ferme", "gd_stopped": "Porte du garage arrêtée",
    "gd_eye": "Le capteur de sécurité l’a fait remonter", "gd_no_door": "Aucune porte de garage pour ce bouton",
    "gd_cars_head": "Garage", "gd_cars_1": "1 voiture", "gd_cars_2": "2 voitures", "gd_cars_3": "3 voitures", "gd_cars_4": "4 voitures",
    "o3_open_lid": "Soulever le couvercle", "o3_close_lid": "Fermer le couvercle",
    "o3_locked": "Fermé à clé",
    "o3_light_on": "Allumer la lumière", "o3_light_off": "Éteindre la lumière",
    "o3_breakers_on": "Remettre le courant", "o3_breakers_off": "Couper le courant",
    "o3_turn_on": "Allumer", "o3_turn_off": "Éteindre",
    "o3_tap_on": "Ouvrir le robinet", "o3_tap_off": "Fermer le robinet",
    "o3_fire_on": "Allumer le feu", "o3_fire_off": "Éteindre le feu",
    "o3_sit": "S’asseoir", "o3_lie": "S’allonger", "o3_sleep": "Dormir jusqu’au matin",
    "o3_plug": "Brancher", "o3_unplug": "Débrancher",
    "o3_flush": "Tirer la chasse", "o3_play": "En jouer", "o3_water_plant": "L’arroser", "o3_take_book": "Prendre un livre",
    "o3_pay": "Payer", "o3_take": "En prendre un", "o3_coffee": "Faire un café", "o3_workout": "S’entraîner",
    "o3_game": "Faire une partie", "o3_fish": "Nourrir les poissons", "o3_music": "Mettre de la musique", "o3_write": "Écrire dessus",
    "o3_car": "Essayer la portière", "o3_swim": "Aller nager", "o3_test": "Le tester", "o3_warmer": "Monter le chauffage",
    "o3_use": "Utiliser",
    "o3_opened": "{what} : vous ouvrez {part}", "o3_closed": "{what} : vous fermez {part}",
    "o3_p_drawer": "le tiroir", "o3_p_door": "la porte", "o3_p_lid": "le couvercle",
    "o3_m_move": "Déplacer", "o3_m_open": "Ouvrir", "o3_m_close": "Fermer", "o3_m_use": "Utiliser",
    "o3_m_format": "Finition et style…", "o3_m_place": "Cliquez où le poser · Échap le laisse",
    "o3_no_room": "Pas de place à côté", "o3_made": "Un autre : {what}",
    # ---- round a building, for what it is (40-grounds.js, 2026-10-03)
    "gr_head": "Abords",
    "gr_tab_building": "Bâtiment",
    "gr_building": "Le bâtiment",
    "yd_parking": "Parking",
    "yd_bikes": "Supports à vélos",
    "yd_benches": "Bancs",
    "yd_lamps": "Lampadaires",
    "yd_planters": "Jardinières",
    "yd_seating": "Tables dehors",
    "yd_playground": "Aire de jeux",
    "yd_sharedpool": "Piscine et transats",
    "yd_bbq": "Coin barbecue",
    "yd_carts": "Abri à chariots",
    # ---- how open a house is (39-starter.js, 2026-10-03)
    "st_layout_head": "Agencement",
    "lay_classic": "Pièces séparées",
    "lay_semi": "Cuisine et repas ensemble",
    "lay_open": "Espace ouvert",
    "lay_great": "Grande pièce à vivre",
    "sup_head": "Portée par",
    "sup_beams": "Poutres en acier",
    "sup_posts": "Poteaux",
    "zn_head": "Plan",
    "zn_any": "Au choix (Mélanger)",
    "zn_together": "Chambres regroupées",
    "zn_split": "Chambres séparées",
    "zn_wing": "Aile des chambres",
    "zn_downstairs": "Chambre principale en bas",
    "od_one": "Faire une seule pièce",
    "od_own": "En faire une pièce à part",
    "od_apart": "Séparer en pièces",
    # ---- what holds a building up (40-struct.js, 2026-10-03)
    "sx_head": "Structure",
    "sx_wood": "Ossature bois",
    "sx_steel": "Ossature acier",
    "sx_shown": "Poutres apparentes",
    # ---- up under the roof (40-attic.js, 2026-10-03)
    "at_head": "Combles",
    "at_flat": "Un toit plat n’a pas de combles",
    "hh_head": "Cheminées",
    "hh_none": "Aucune",
    "hh_one": "Une",
    "hh_each": "Une dans chaque logement",
    "ca_court": "Cour intérieure",
    "ca_commons": "Espace commun",
    "ca_gym": "Gymnase",
    "sl_girls": "Filles",
    "sl_boys": "Garçons",
    "sl_women": "Femmes",
    "sl_men": "Hommes",
    "sl_accessible": "Cabine accessible",
    "at_none": "Aucun",
    "at_storage": "Rangement",
    "at_room": "Pièce aménagée",
    "at_garage_head": "Au-dessus du garage",
    "atg_none": "Rien",
    "atg_storage": "Rangement",
    "atg_room": "Pièce en plus",
    "at_room_name": "Pièce sous les combles",
    "at_store_name": "Grenier",
    "at_bonus_name": "Pièce en plus",
    "at_garage_name": "Soupente",
    "at_shed_loft": "Mezzanines dans les abris",
    "fl_attic": "Combles",
    # ---- a house's systems, the parts of them (40-systems.js, 2026-10-03)
    "n_i_smoke": "Détecteur de fumée",
    "n_i_thermostat": "Thermostat",
    "n_i_waterheater": "Chauffe-eau",
    "n_i_exhaustfan": "Extracteur",
    "wk_i_smoke": "teste le détecteur",
    "wk_i_thermostat": "monte le chauffage",
    "wk_i_waterheater": "vérifie le chauffe-eau",
    "wk_i_exhaustfan": "allume l'extracteur",
    # ---- a house's systems, set and seen (40-systems.js, 2026-10-03)
    "xr_insulation": "Isolation",
    "xr_fire": "Sprinklers",
    "fs_exit": "SORTIE",
    "xr_low": "Réseau, TV et alarmes",
    "xs_15": "15 A",
    "xs_20": "20 A",
    "xs_30": "30 A",
    "xs_50": "50 A",
    "xs_ground": "Piquet de terre",
    "xs_media": "Coffret réseau",
    "xs_shutoff": "Robinet principal",
    "xs_condenser": "Unité extérieure",
    "xs_return": "Reprise d'air",
    "dy_head": "Électricité, plomberie, chauffage",
    "dy_auto": "Automatique",
    "dy_diy": "Soi-même",
    "dy_fix": "En mettre un",
    "dy_no_panel": "La maison n'a pas de tableau électrique",
    "dy_no_outlet": "Pas de prise dans {room}",
    "dy_no_switch": "Pas d'interrupteur dans {room}",
    "dy_no_smoke": "{room} doit avoir un détecteur de fumée",
    "dy_no_fan": "{room} doit avoir un extracteur",
    "dy_no_vent": "Pas de chauffage dans {room}",
    "dy_no_heater": "Rien ne chauffe l'eau",
    "dy_no_thermo": "Pas de thermostat pour le chauffage",
    # ---- skyscrapers (40-towers.js, 2026-10-03)
    "ty_tower": "Gratte-ciel",
    "sk_lobby": "Hall",
    "sk_sky": "Salon panoramique",
    "sk_use_head": "Usage",
    "sk_offices": "Bureaux",
    "sk_homes": "Logements",
    "sk_mixed": "Bureaux et logements",
    "sk_form_head": "Style de gratte-ciel",
    "sk_spire": "Gradins en spirale",
    "sk_twist": "Torsadé",
    "sk_pagoda": "Pagode",
    "sk_deco": "Art déco",
    "sk_diagrid": "Diagrid",
    "sk_star": "Plan en étoile",
    "sk_chamfer": "Chanfreiné",
    "sk_taper": "Carré vers rond",
    "sk_forest": "Forêt verticale",
    "sk_slab": "Prisme de verre",
    # ---- using a house's systems (40-systems.js, 2026-10-03)
    "us_smoke": "Bip ! Bip ! Bip ! Le détecteur marche",
    "us_thermo": "Chauffage réglé sur {t}",
    # ---- more rooms for a house (40-rooms.js, 2026-10-03)
    "hx_head": "Autres pièces",
    "hx_pantry": "Garde-manger",
    "hx_coat": "Vestiaire",
    "hx_mudroom": "Sas d'entrée",
    "hx_playroom": "Salle de jeux",
    "hx_media": "Home cinéma",
    "hx_gym": "Salle de sport",
    "hx_library": "Bibliothèque",
    "hx_sunroom": "Véranda",
    # ---- the site round a building, joined or alone (40-site.js, 2026-10-03)
    "lw_attach_head": "Implantation",
    "lw_at_alone": "Isolé",
    "lw_at_one": "Mitoyen d'un côté",
    "lw_at_row": "Mitoyen des deux côtés",
    "lw_at_block": "Partie d'un grand bâtiment",
    "lw_park_head": "Stationnement",
    "lw_pk_auto": "L'habituel",
    "lw_pk_drive": "Son allée",
    "lw_pk_none": "Aucun",
    "lw_pk_front": "Devant",
    "lw_pk_side": "Sur le côté",
    "lw_pk_frontside": "Devant et sur le côté",
    "lw_pk_back": "Derrière",
    "lw_pk_around": "Tout autour",
    "lw_pk_street": "Dans la rue",
    "lw_side_head": "Quel côté",
    "lw_sd_left": "Gauche",
    "lw_sd_right": "Droite",
    "lw_joined_tip": "Collé au bâtiment voisin",
    "yd_walks": "Allées tout autour",
    "yd_beds": "Massifs et arbres",
    "n_i_sidewalk": "Allée",
    "n_i_asphalt": "Enrobé",
    "n_i_plantbed": "Massif",
    "n_i_bikepark": "Parc à vélos",
    "lw_liftlobby": "Palier d'ascenseur",
    "ic_mall": "Centres commerciaux et grands magasins",
    "n_i_cartcorral": "Abri à chariots",
    "n_i_selfcheckout": "Caisse libre-service",
    "n_i_produce": "Étal de fruits et légumes",
    "n_i_bakerycase": "Vitrine de boulangerie",
    "n_i_delicase": "Vitrine traiteur",
    "n_i_meatcase": "Vitrine à viande",
    "n_i_chestfreezer": "Congélateur coffre",
    "n_i_winerack": "Casier à vin",
    "n_i_magrack": "Présentoir à magazines",
    "n_i_roundrack": "Portant rond",
    "n_i_mannequin": "Mannequin",
    "n_i_endcap": "Tête de gondole",
    "n_i_palletrack": "Rayonnage à palettes",
    "n_i_forklift": "Chariot élévateur",
    "n_i_pallet": "Palette de marchandise",
    "n_i_kiosk": "Kiosque",
    "n_i_atm": "Distributeur de billets",
    "n_i_vending": "Distributeur automatique",
    "n_i_photobooth": "Photomaton",
    "n_i_mallfountain": "Fontaine intérieure",
    "n_i_directory": "Plan du centre",
    "n_i_infodesk": "Point information",
    "n_i_secgate": "Portique antivol",
    "n_i_basketstack": "Paniers",
    "n_i_pricecheck": "Lecteur de prix",
    "n_i_servicedesk": "Service client",
    "n_i_cashwrap": "Comptoir caisse",
    "n_i_jewelcase": "Vitrine à bijoux",
    "n_i_glasscase": "Vitrine en verre",
    "n_i_lockers": "Casiers",
    "n_i_kidride": "Manège à pièces",
    "n_i_claw": "Machine à pince",
    "n_i_arcade": "Borne d'arcade",
    "n_i_bin3": "Station de tri",
    "n_i_mallbench": "Banquette",
    "n_i_bigplanter": "Bac à arbre",
    "n_i_signpylon": "Totem d'enseigne",
    "n_i_stanchion": "Poteaux de file",
    "n_i_baler": "Presse à carton",
    "n_i_escalator": "Escalator",
    "sto_big": "Grande surface",
    "sto_super": "Hypermarché",
    "sto_garden": "Jardinerie",
    "sto_receiving": "Réception des marchandises",
    "sto_dock": "Quai de chargement",
    "sto_cash": "Bureau de caisse",
    "sto_backroom": "Réserve",
    "sto_grocery": "Alimentation",
    "sto_general": "Mode et électronique",
    "sto_home": "Maison et bricolage",
    "ty_mall": "Centre commercial",
    "mall_unit_n": "Boutique {n}",
    "mall_food": "Aire de restauration",
    "mall_anchor": "Grand magasin",
    "mall_entrance": "Entrée",
    "mall_concourse": "Galerie marchande",
    "ic_food": "Restaurants et cafés",
    "ic_health": "Cabinet et soins",
    "ic_hobby": "Musique, art et loisirs",
    "n_i_booth": "Banquette de restaurant",
    "n_i_barcounter": "Comptoir de bar",
    "n_i_espresso": "Machine à expresso",
    "n_i_pizzaoven": "Four à pizza",
    "n_i_fryer": "Friteuse",
    "n_i_griddle": "Plancha",
    "n_i_saladbar": "Bar à salades",
    "n_i_sodafountain": "Fontaine à soda",
    "n_i_menuboard": "Panneaux de menu",
    "n_i_hoststand": "Pupitre d'accueil",
    "n_i_buffet": "Buffet",
    "n_i_icecase": "Vitrine à glaces",
    "n_i_beertap": "Tireuse à bière",
    "n_i_preptable": "Table de préparation",
    "n_i_walkin": "Chambre froide",
    "n_i_dishpro": "Lave-vaisselle professionnel",
    "n_i_foodcounter": "Comptoir de restauration",
    "n_i_foodtable": "Table d'aire de restauration",
    "n_i_hospbed": "Lit d'hôpital",
    "n_i_exam": "Table d'examen",
    "n_i_wheelchair": "Fauteuil roulant",
    "n_i_ivpole": "Pied à perfusion",
    "n_i_xray": "Appareil de radiographie",
    "n_i_dentchair": "Fauteuil dentaire",
    "n_i_medcart": "Chariot de soins",
    "n_i_stretcher": "Brancard",
    "n_i_docscale": "Balance médicale",
    "n_i_eyechart": "Échelle d'acuité",
    "n_i_firstaid": "Trousse de secours",
    "n_i_aed": "Défibrillateur",
    "n_i_oxygen": "Bouteilles d'oxygène",
    "n_i_walker": "Déambulateur",
    "n_i_waitchairs": "Chaises de salle d'attente",
    "n_i_grandpiano": "Piano à queue",
    "n_i_drums": "Batterie",
    "n_i_guitar": "Guitare",
    "n_i_cello": "Violoncelle",
    "n_i_keyboard": "Clavier",
    "n_i_micstand": "Pied de micro",
    "n_i_amp": "Amplificateur",
    "n_i_sewing": "Machine à coudre",
    "n_i_pottery": "Tour de potier",
    "n_i_kiln": "Four de céramique",
    "n_i_chess": "Table d'échecs",
    "n_i_drafting": "Table à dessin",
    "n_i_globe": "Globe sur pied",
    "n_i_harp": "Harpe",
    "n_i_musicstand": "Pupitre à musique",
    "n_i_djdesk": "Table de DJ",
    "ic_learn": "Salles de classe et labos",
    "ic_work": "Bureaux et travail",
    "n_i_labbench": "Paillasse",
    "n_i_fumehood": "Hotte de laboratoire",
    "n_i_microscope": "Microscope",
    "n_i_lectern": "Pupitre",
    "n_i_chalkboard": "Tableau noir",
    "n_i_cubbies": "Casiers ouverts",
    "n_i_skeleton": "Squelette",
    "n_i_laptopcart": "Chariot d'ordinateurs",
    "n_i_bleachers": "Gradins",
    "n_i_hoop": "Panier de basket",
    "n_i_kidstable": "Table d'enfants",
    "n_i_cubicle": "Box de bureau",
    "n_i_conftable": "Table de réunion",
    "n_i_copier": "Photocopieuse",
    "n_i_shredder": "Destructeur de documents",
    "n_i_watercooler": "Fontaine à eau",
    "n_i_safe": "Coffre-fort",
    "n_i_frontdesk": "Banque d'accueil",
    "n_i_plotter": "Traceur",
    "n_i_mailsorter": "Casier à courrier",
    "n_i_flipchart": "Tableau de conférence",
    "n_i_partition": "Cloison de bureau",
    "n_i_umbrellastand": "Porte-parapluies",
    "n_i_futon": "Futon",
    "n_i_pouf": "Pouf",
    "n_i_laddershelf": "Étagère échelle",
    "n_i_curio": "Vitrine",
    "n_i_grandclock": "Horloge comtoise",
    "n_i_canopybed": "Lit à baldaquin",
    "n_i_murphybed": "Lit escamotable",
    "n_i_bassinet": "Berceau",
    "n_i_changingtable": "Table à langer",
    "n_i_rockinghorse": "Cheval à bascule",
    "n_i_dollhouse": "Maison de poupée",
    "n_i_kidtent": "Tente de jeu",
    "n_i_knifeblock": "Bloc à couteaux",
    "n_i_blender": "Blender",
    "n_i_mixer": "Robot pâtissier",
    "n_i_ricecooker": "Cuiseur à riz",
    "n_i_airfryer": "Friteuse à air",
    "n_i_breadbox": "Boîte à pain",
    "n_i_potrack": "Support à casseroles",
    "n_i_trashsort": "Poubelles de tri",
    "n_i_spicerack": "Étagère à épices",
    "n_i_toolwall": "Panneau à outils",
    "n_i_bidet": "Bidet",
    "n_i_urinal": "Urinoir",
    "n_i_handdryer": "Sèche-mains",
    "n_i_toiletstall": "Cabine de toilettes",
    "n_i_sauna": "Sauna",
    "n_i_scalebath": "Pèse-personne",
    "n_i_playset": "Fort de jeux",
    "n_i_playslide": "Toboggan",
    "n_i_seesaw": "Bascule",
    "n_i_sandbox": "Bac à sable",
    "n_i_picnic": "Table de pique-nique",
    "n_i_umbrella": "Parasol",
    "n_i_firehydrant": "Bouche d'incendie",
    "n_i_bollard": "Borne",
    "n_i_stopsign": "Panneau stop",
    "n_i_newsbox": "Distributeur de journaux",
    "n_i_busstop": "Abribus",
    "n_i_statue": "Statue",
    "n_i_flagpole": "Mât de drapeau",
    "n_i_compost": "Composteur",
    "n_i_rainbarrel": "Récupérateur d'eau",
    "n_i_greenhouse": "Serre",
    "n_i_chickencoop": "Poulailler",
    "n_i_doghouse": "Niche",
    "n_i_hammock": "Hamac",
    "n_i_tent": "Tente",
    "n_i_wheelbarrow": "Brouette",
    "n_i_lawnmower": "Tondeuse",
    "n_i_ladder": "Escabeau",
    "n_i_generator": "Groupe électrogène",
    "n_i_kayak": "Kayak",
    "n_i_motorcycle": "Moto",
    "n_i_golfcart": "Voiturette de golf",
    "vg_head": "Trottoir",
    "vg_none": "Au bord de la rue",
    "vg_strip": "Bande de gazon",
    "vg_trees": "Arbres entre les deux",
    "vg_land": "Bande de gazon jusqu’à la bordure : {area}",
}

speaks("fr", "Français", FR)
