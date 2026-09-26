"""Every word it says, in US English."""
from ..words.lookup import program, speaks

EN = {
    # ---- the words the chart draws
    "start": "Start", "end": "End", "ret": "Return",
    "yes": "True", "no": "False", "again": "again?",
    "key_oval": "Start / End", "key_rect": "Process",
    "key_io": "Input / Output", "key_diamond": "Decision",
    "key_hex": "Loop", "key_sub": "Call a module",
    # ---- the page around it
    "palette": "Palette", "shapes": "Shapes",
    # ---- the Style side: the words, the highlighter, the borders
    "t_head": "Words", "t_face": "Typeface",
    "t_sans": "Plain", "t_serif": "Book",
    "t_mono": "Code", "t_hand": "Hand",
    "t_size": "Size", "t_smaller": "Smaller",
    "t_bigger": "Bigger", "t_bold": "Bold",
    "t_italic": "Italic", "t_under": "Underline",
    "t_strike": "Strikethrough", "t_color": "Color",
    "t_mark": "Highlight", "t_mark_none": "No highlight",
    "cp_sat": "Saturation", "cp_bright": "Brightness",
    "cp_recent": "Recent", "cp_code": "Color code",
    "t_mark_own": "Another color", "m_yellow": "Yellow",
    "m_green": "Green", "m_pink": "Pink",
    "m_blue": "Blue", "m_orange": "Orange",
    "t_weight": "Line weight", "t_thin": "Thin",
    "t_normal": "Normal", "t_thick": "Thick",
    "t_border": "Border", "t_dashed": "Dashed border",
    "t_copy_look": "Copy style", "t_paste_look": "Paste style",
    "t_size_list": "Choose a size",
    "selected": "Selected shape", "rest": "Lines and paper",
    "fill": "Fill", "outline": "Outline", "text": "Words",
    "paper": "Paper", "grid": "Grid", "show_grid": "Show the grid",
    "lines": "Lines and arrows", "reset": "Put every style back",
    "download": "Download", "dl_size": "Size",
    "files": "Files", "f_work_head": "Your work",
    "dl_svg": "Download SVG", "dl_png": "Download PNG", "panel": "Panel",
    "print_it": "Print the chart",
    "print_head": "Print",
    "print_go": "Print…",
    "print_paper": "Paper",
    "print_wide": "Sideways",
    "print_fit": "Fit on one page",
    "print_note": "It prints plain: no colors, just lines and words. Which printer, and how many copies, your browser asks for itself — a page is not allowed to ask that.",
    "panel_tip": "Show or hide the panel", "png_tip": "How big the PNG comes out",
    "fit": "Fit", "actual": "Actual", "zoom_in": "Zoom in", "zoom_out": "Zoom out",
    "slide_left": "Left", "slide_right": "Right", "slide_up": "Up", "slide_down": "Down",
    "hold_locked": "Locked", "hold_loose": "Unlocked",
    "lock_tip": "Hold the chart in place, scrolling inside the stage",
    "loose_tip": "Drag the chart anywhere; a corner of it always stays in sight",
    "tool_move": "Move",
    "tool_move_tip": "Drag the paper to move about it. Shift+drag draws a box to select shapes.",
    "tool_select": "Select",
    "tool_select_tip": "Drag across the paper to select the shapes inside. Tap or click shapes to add them or leave them out.",
    "pixels": "pixels",
    "dl_scale": "Times the size it is drawn",
    "dl_frame": "Fitted inside a picture",
    "png_over": "more than this browser can draw",
    "click_shape": "Click a shape in the chart to style that one on its own.",
    "palette_hint": "A palette sets every shape at once. Anything you "
                    "change by hand afterwards stays changed.",
    "shapes_hint": "Fill and outline, for every shape of that kind.",
    "apply_all": "Apply to all {n} {what}", "clear": "Clear",
    "rendering": "Rendering…",
    "png_big": "The browser could not make a PNG that big. Try a smaller "
               "size, or save the SVG.",
    "png_fail": "The browser could not draw the PNG. The SVG download "
                "still works.",
    "png_capped": "{want}× is past what a browser canvas holds, so "
                  "the PNG saves at {got}× ({w} × {h} pixels).",
    "flowchart": "Flowchart",
    "r_head": "Run it",
    "r_run": "Run",
    "r_stop": "Stop",
    "r_code": "As code", "r_lang_pick": "Which language the code is written in",
    "r_pseudo": "Pseudocode",
    "r_slowly": "Step slowly",
    "r_enter": "Enter",
    "r_hint": "Runs the program the chart was built from: it asks for what it asks a person for, prints what it prints, and lights up the shape it is on. Pick a language to see the same program written out in it.",
    "r_started": "Running...",
    "r_done": "Finished.",
    "r_nothing": "There is nothing to run yet.",
    "r_steps": "{n} steps, {ms} ms.",
    "r_forever": "This has run far too long without stopping -- somewhere there is a loop it never gets out of.",
    "r_zero": "That divides by zero.",
    "r_unknown": "Nothing has been put in {name} yet.",
    "r_odd_op": "I do not know what to do with {op}.",
    "r_half": "This does not read as a whole thing: {bit}",
    "r_back": "Back to the run", "back": "Back",
    "r_by_hand": "Run turns on once the design works.",
    "h_no_start": "There is no shape to start from.",
    "h_tangled": "The loops in this design cross each other, so it cannot be written out as a program.",
    "h_not_a_program": "The words in these shapes do not read as a program.",
    "r_build_first": "Build a chart from pseudocode and it can be "
                     "run here.",
    "r_copy": "Copy",
    "r_copied": "Copied",
    "r_copy_no": "Copy it by hand",
    "r_save_code": "Save it",
    "r_file": "{name} output",
    "r_pseudo_only": "Pick Python, Java, C# or JavaScript to see the code.",
    # ---- where a run went wrong, and what the reading had to paper over
    "r_at": "Line {line}",
    "r_show_line": "Show me the line this came from",
    "r_in_mod": "inside {name}, called from line {line}",
    "r_in_mod_only": "inside {name}",
    "r_mean": "Did you mean {name}?",
    "r_unknown_fn": "There is no module or function called {name}.",
    "r_odd_here": "I did not expect {bit} here.",
    "r_empty_expr": "There is nothing here to work it out from.",
    "r_left_over": "There is {bit} left over at the end of this, with nothing to join it on to.",
    "r_open_quote": "This piece of text is never closed -- a quote mark is missing.",
    "r_open_bracket": "This bracket is opened and never closed.",
    "r_shut_bracket": "This bracket closes one that was never opened.",
    "r_no_idea": "I cannot make sense of this line, so the run stepped over it.",
    "r_stepped_over": "Some lines were stepped over, so what it printed may not be the whole of it.",
    "r_too_deep": "{name} has called itself far too many times -- somewhere it never stops calling.",
    "r_args": "{name} asks for {want} and was given {got}.",
    "r_no_main": "There is no main flow here, so the run started in {name} instead.",
    "w_head": "Worth a look",
    "w_found": "{n} to look at in the pseudocode:",
    "w_open_if": "Line {line}: this If is never closed, so everything below it is inside it. Add an End If where it should stop.",
    "w_open_loop": "Line {line}: this loop is never closed, so everything below it goes round with it. Add an End While where it should stop.",
    "w_open_for": "Line {line}: this For is never closed, so everything below it goes round with it. Add an End For where it should stop.",
    "w_open_select": "Line {line}: this Select is never closed. Add an End Select where it should stop.",
    "w_no_if": "Line {line}: End If, but there is no If open for it to close.",
    "w_no_loop": "Line {line}: this ends a loop, but there is no loop open for it to close.",
    "w_no_select": "Line {line}: End Select, but there is no Select open for it to close.",
    "w_do_no_test": "Line {line}: this Do is never given a test, so it would go round for ever. End it with Until ... or Loop While ...",
    "w_until_alone": "Line {line}: Until, but there is no Do or Repeat above it for it to end.",
    "w_mend_change": "Change {word} to {instead}",
    "w_mend_drop": "Take line {line} out",
    "w_mend_insert": "Put {text} in at line {line}",
    "w_mend_tip": "Double-click to put this right",
    "w_mend_close": "Put the missing {text} on the end",
    "w_mend_all": "Put all {n} right",
    "n_rect": "Box",
    "an_arrow": "Arrow",
    "word_on_it": "Word on it",
    "thickness": "Thickness",
    "color_of_it": "Color",
    "dashed": "Dashed",
    "with_head": "Arrowhead",
    "turn_it_round": "Turn it round",
    "m_type": "Type in it",
    "m_copy": "Make another",
    "c_fill": "Fill color", "c_line": "Border color", "c_words": "Word color",
    "c_clear": "No style of its own",
    "m_solid": "Solid",
    "m_no_word": "No word",
    "m_fit": "Fit on screen",
    "m_clip_copy": "Copy",
    "m_clip_cut": "Cut",
    "m_clip_paste": "Paste",
    "m_all": "Select all",
    "m_pin": "Keep to these sides",
    "m_unpin": "Let it find its own sides",
    "sel_bar": "What to do with what is selected",
    "f_save": "Save this to a file",
    "f_open": "Open a document",
    "f_not_ours": "That is a JSON file, but not a design saved from here.",
    "f_opened": "Opened {name}.",
    "f_empty": "There is nothing written in that one.",
    "dl_copy": "Copy the chart",
    "dl_copied": "Copied",
    "dl_copy_no": "This browser will not let a page put a picture on the "
                  "clipboard. Download it instead.",
    "l_copy": "Copy a link to this",
    "l_copied": "Link copied",
    "l_copy_no": "This browser would not copy it. Take it from the address "
                 "bar instead.",
    "fd_head": "Where saves go",
    "fd_browser": "Into your browser's downloads.",
    "fd_in": "Into the folder {name}.",
    "fd_pick": "Choose a folder",
    "fd_pick_tip": "Pick a folder, or make a new one in the window that "
                   "opens. Everything saved from here then goes straight "
                   "into it.",
    "fd_off": "Back to downloads",
    "fd_cannot": "This browser only saves to its downloads. Chrome or Edge "
                 "on a computer can save into a folder you pick.",
    "fd_saved": "Saved {name} in {folder}",
    "fd_fell": "{folder} would not take it, so it went to your downloads.",
    "l_opened": "Opened from a link.",
    "l_long": "That link is {n} characters long. Mail and chat apps cut long "
              "links short, and a link cut short opens nothing — send the "
              "file instead.",
    "l_bad": "That link does not carry a chart this page can read.",
    # ---- saved progress: a few places the page keeps your work in itself
    "sv_tab": "Saved progress",
    "sv_about": "Keeps the chart, the run and the place it had got to, here "
                "in this browser. There is room for {n}.",
    "sv_save": "Save progress",
    "sv_saved": "Saved.",
    "sv_full": "All {n} are in use. Save over one, or delete one to make "
               "room.",
    "sv_nothing": "There is nothing on the page to save yet.",
    "sv_no_room": "The browser would not keep it: its storage is full or "
                  "turned off.",
    "sv_empty": "Empty",
    "sv_load": "Load",
    "sv_over": "Save over",
    "sv_over_ask": "Put what is on the page now in place of this one?",
    "sv_over_yes": "Save over it",
    "sv_del_ask": "Delete this save for good?",
    "sv_today": "Today",
    "sv_st_none": "Not run yet",
    "sv_st_ask": "Waiting for an answer",
    "sv_st_next": "Waiting on the next step",
    "sv_st_going": "Part way through a run",
    "sv_st_over": "Run finished",
    "sv_back": "Picked up where you left off.",
    "sv_moved": "This save does not fit the program any more, so the run "
                "could not be picked up.",
    "sv_lost": "The program in this save could not be read back from the "
               "browser's storage.",
    "sv_no_draw": "The chart did not draw, so the run could not be picked "
                  "up again.",
    "sv_stop_said": "Loading a save replaces the program that is running. "
                    "The run will be stopped.",
    "sv_stop_yes": "Stop it and load",
    "held_head": "What it is holding",
    "held_in": "in {name}",
    "held_shared": "Declared outside every module, so every chart can see it",
    "held_none": "nothing yet",
    # said over the tick box on its heading, which folds it away
    "held_switch": "Show what it is holding",
    "h_tidy": "Tidy up",
    "h_tidy_tip": "Stand every shape where this page would draw it, "
                  "keeping the words, the colors and the arrows",
    "h_tidied": "Tidied up: {n} shapes moved.",
    "h_tidy_none": "There is nothing here to tidy up yet.",
    "h_write": "As pseudocode",
    "h_write_tip": "Write the drawing out as the pseudocode it amounts to",
    "h_into_box": "Put it in the box",
    "h_into_box_tip": "Write this into the pseudocode box and work on it "
                      "there. The drawing stays where it is; whatever was "
                      "in the box is written over.",
    "s_no": "Leave it",
    "s_stop_head": "It is still running",
    "s_stop_said": "Drawing a new chart replaces the program that is "
                   "running. The run will be stopped.",
    "s_stop_yes": "Stop it and draw",
    "n_roundrect": "Rounded box",
    "n_offpage": "Off-page", "n_loop": "Loop limit", "n_parallel": "Side by side",
    "n_text": "Text", "n_actor": "Person", "n_callout": "Speech",
    "n_cube": "Cube", "n_step": "Step", "n_table": "Table",
    "n_stored": "Stored inside", "n_cloud": "Cloud",
    "n_card": "Card",
    "n_note": "Note",
    "n_docs": "Pages",
    "n_manual": "Typed in",
    "n_screen": "Screen",
    "n_arrow": "Arrow",
    "n_io_back": "Parallelogram, other way",
    "n_oval": "Oval",
    "n_io": "Parallelogram",
    "n_diamond": "Diamond",
    "n_hex": "Hexagon",
    "n_sub": "Box with bars",
    "n_trap": "Trapezoid",
    "n_doc": "Document",
    "n_store": "Drum",
    "n_delay": "Wait",
    "n_circle": "Circle",
    "shapes_for": "Shape for each kind",
    "shapes_for_hint": "Which shape gets drawn for each kind of step. What a step means does not change.",
    "size": "Size",
    "width": "Width",
    "height": "Height",
    "turn": "Turn",
    "fit_words": "Fit the words",
    "colors_here": "Colors",
    "odd_shape": "Cannot draw {pair} -- see --help.",
    "mode_code": "From pseudocode",
    "mode_hand": "By hand",
    "add_shape": "Add a shape",
    "hand_hint": "Drag shapes about. Click one, then Connect, then click where the flow goes next.",
    "words_in": "Words in the shape",
    "connect": "Connect",
    "connect_now": "Now click the shape it goes to.",
    "goes_to": "Goes to",
    "nothing_yet": "nothing yet",
    "delete": "Delete",
    "check": "Check the design",
    "checked_good": "No problems found.",
    "problems": "{n} to look at",
    "h_info": "How to draw by hand",
    "h_add_how": "Click a shape above to add it under the one you're working on, or drag it onto the paper where you want it. Basic, Flow, Data and Other open a menu each of every other shape.",
    "h_mouse": "Mouse and touch",
    "h_keys": "Keys",
    "h_all_keys": "All keyboard shortcuts",
    "hm_pick": "Pick a shape or an arrow",
    "hm_move": "Move a shape, or every selected one",
    "hm_size": "Make the picked shape bigger or smaller",
    "hm_turn": "Turn the picked shape to any angle (Shift: steps of 15°)",
    "hm_join": "Draw an arrow to another shape",
    "hm_type": "Type in a shape or on an arrow",
    "hm_menu": "See everything you can do to it",
    "hm_zoom": "Zoom in or out",
    "hm_rule": "Change to the shape the rules suggest, or keep it (the amber mark)",
    "hm_select": "Choose Select at the foot of the page, and a drag across the paper selects shapes instead of moving about, even with a finger.",
    "many_head": "{n} shapes selected",
    "as_chart": "Chart",
    "untitled": "Untitled",
    "p_no_start": "Nothing starts the flow: every shape has something leading into it.",
    "p_many_starts": "{n} shapes have nothing leading into them. A flowchart starts in one place.",
    "p_start_kind": "The shape everything starts from should be the Start / End shape ({shape}).",
    "p_no_end": "There is no End: no Start / End shape ({shape}) that the flow stops at.",
    "p_unreached": "Nothing leads to this shape.",
    "p_dead_end": "Nothing leaves this shape, and it is not an End.",
    "p_decision_out": "A decision needs two ways out, one for each answer. This one has {n}.",
    "p_one_out": "This shape has {n} ways out. Only a decision may have more than one.",
    "p_same_labels": "Both ways out of this decision say the same thing.",
    "p_no_label": "A way out of a decision needs a word on it.",
    "p_trapped": "Once the flow gets here it can never reach an End.",
    "p_empty": "This shape has nothing written in it.",
    "p_overlap": "This shape is on top of another one.",
    "p_alone": "This shape is not joined to anything.",
    "p_line_through": "A line runs straight through this shape. Move one of them over a little.",
    "hf_start": "Put a Start above it",
    "hf_end": "Add an End and join the flow to it",
    "hf_to_end": "Join it to the End",
    "hf_write": "Write {word} in it",
    "hf_type": "Type in it",
    "hf_arrow": "Draw an arrow from it",
    "hf_yes_no": "Label them {yes} and {no}",
    "hf_label": "Label the other one {word}",
    "hf_relabel": "Change the second one to {word}",
    "hf_apart": "Move it clear",
    "hf_clear": "Move it off the line",
    "hp_next": "Add the next step",
    "hp_what_next": "What comes next?",
    "hp_into": "Put a step in it",
    "m_colors": "Colors", "m_format": "Format shape…", "m_more_shapes": "More shapes",
    "sg_basic": "Basic", "sg_flow": "Flow", "sg_data": "Data", "sg_other": "Other",
    "hr_head": "Shape rules",
    "hr_says": "This looks like “{role}”. The shape rules use the {shape} for that.",
    "hr_change": "Change to {shape}",
    "hr_keep": "Keep it as it is",
    "rs_card": "Reset to default",
    "rd_tip": "Color changed so it can be read",
    "rd_head": "Easier to read",
    "rd_keep": "Keep this color",
    "rd_ignore": "Ignore",
    "rd_words_dark": "Words drawn darker to stand out.",
    "rd_words_light": "Words drawn lighter to stand out.",
    "rd_edge_dark": "Border drawn darker to show on the paper.",
    "rd_edge_light": "Border drawn lighter to show on the paper.",
    "rd_lines_dark": "Arrows drawn darker to show on the paper.",
    "rd_lines_light": "Arrows drawn lighter to show on the paper.",
    "rd_said_dark": "Arrow words drawn darker to show on the paper.",
    "rd_said_light": "Arrow words drawn lighter to show on the paper.",
    "hr_tip": "The shape rules suggest another shape",
    "hl_head": "Line up",
    "hl_left": "Line up left edges",
    "hl_center": "Line up centers",
    "hl_right": "Line up right edges",
    "hl_top": "Line up tops",
    "hl_middle": "Line up middles",
    "hl_bottom": "Line up bottoms",
    "hl_across": "Space evenly across",
    "hl_down": "Space evenly down",
    "mv_head": "Put the moved blocks back?",
    "mv_said": "Building again lays the chart out fresh, and every block you moved goes back to where the layout puts it. Undo can bring the moves back.",
    "mv_yes": "Build anyway",
    "side_chart": "Chart", "side_colors": "Style", "hide_panel": "Hide the panel", "show_panel": "Show the panel",
    "theme": "Light or dark", "theme_auto": "Auto", "theme_light": "Light", "theme_dark": "Dark",
    "puzzles": "Puzzles",
    "pz_one": "Puzzle {n}",
    "pz_head": "Puzzles",
    "pz_l1": "Find the fault",
    "pz_l2": "Make it work",
    "pz_l3": "Build it",
    "pz_check": "Check",
    "pz_right": "Solved.",
    "pz_wrong": "Not there yet. Given {give} it said {said}.",
    "pz_next": "Next puzzle", "pz_next_level": "Next level",
    "pz_job": "What it must do", "pz_now": "What it does now",
    "pz_reset": "Start over", "pz_all": "All puzzles",
    "pz_broke": "It stopped before it finished. It was given {give}.",
    "pz_none": "There is nothing to check yet.",
    "pz_locked": "Solve {n} more to open these",
    "pz_done": "{done} of {all} solved",
    "pz_nothing": "(nothing)",
    "pz_brief": "The puzzle",
    "z_greet_b": "It says hello before it has asked who to. Ask first, then greet.",
    "z_range_b": "1 to 9 should be in range. At the moment every number is.",
    "z_double_b": "It should show double the number it was given.",
    "z_order_b": "It should show the final total, 6, and nothing on the way there.",
    "z_until_b": "It should count 1, 2, 3 and then stop.",
    "z_nested_b": "Two rows of two: 1, 2, 2, 4. The inner loop is one short.",
    "z_param_b": "show() prints the letter x instead of the number it was handed.",
    "z_many_b": "Of the five numbers typed in, it should say how many are over 10.",
    "z_divide_b": "It adds up four numbers, so the average is over four, not five.",
    "z_sign_b": "Above zero is positive, below is negative, and zero is “zero”.",
    "z_twice_b": "It should show the word twice.",
    "z_minus_b": "It should take the second number away from the first.",
    "z_early_b": "It shows the answer before it has worked it out. It should show three times the number.",
    "z_never_b": "It should count 5 down to 1. At the moment it shows nothing at all.",
    "z_odds_b": "It should add the even numbers from 1 to 10, which come to 30.",
    "z_asked_b": "It should ask for three numbers and add those three up.",
    "z_onemore_b": "It should add 1 to 10, which comes to 55.",
    "z_valid_b": "It should keep asking until the number is from 1 to 10, then show it.",
    "z_smallest_b": "It should show the biggest of the four numbers typed in.",
    "z_short_b": "add() takes two numbers. It is only being handed one.",
    "z_stops_b": "It should show 5 down to 1 and then “go”.",
    "pz_l4": "Harder faults",
    "pz_l5": "Real bugs",
    "z_fizz_b": "15 should say FizzBuzz. The tests are in the wrong order, so it says Fizz.",
    "z_prime_b": "A prime has exactly two factors. This counts 1 as prime.",
    "z_digits_b": "It should say how many digits the number has. 7 has one.",
    "z_revzero_b": "It should show the number with its digits reversed. 123 goes to 321.",
    "z_sumd_b": "It should add up the digits of the number. 123 comes to 6.",
    "z_gridrow_b": "Three rows: 1 2 3, then 2 4 6, then 3 6 9. The row never changes.",
    "z_tri_b": "It should show each triangle number on the way: 1, 3, 6, 10.",
    "z_lowhigh_b": "It should show the lowest, then the highest, of the four numbers.",
    "z_starsrow_b": "Row one is one star, row two is two stars, and so on down.",
    "z_factloop_b": "Anything times zero is zero. 4 factorial should be 24.",
    "z_report_b": "Five scores go in, so the average is over five.",
    "z_tries_b": "Three tries at the password, and then locked out.",
    "z_discount_b": "Over 50 gets ten percent off, so 60 should come to 54.",
    "z_convert_b": "C to F is nine fifths and then add 32. 100 C is 212 F.",
    "z_tie_b": "Equal votes should say it is a tie.",
    "z_fibstep_b": "It should show 0, 1, 1, 2, 3. The two numbers move in the wrong order.",
    "z_coins_b": "132 cents is 1 dollar, 3 dimes and 2 pennies.",
    "z_score_b": "A right answer scores one, a wrong one scores nothing.",
    "z_sent_b": "Numbers until 0 is typed, then the average of the ones before it.",
    "z_menu0_b": "0 should stop it. At the moment 0 goes around again.",
    "z_else_b": "Anyone under 18 is told nothing at all. They should be told “out”.",
    "z_swap_b": "Over 10 is big and 10 or under is small. It has them swapped.",
    "z_count_b": "It should count from 1 to 5.",
    "z_forever_b": "It should show 3, 2, 1 and then “go”. At the moment it never stops.",
    "z_total_b": "It should add 1, 2, 3 and 4 together and show 10.",
    "z_two_b": "It should add two numbers together and show the answer.",
    "z_return_b": "twice() should hand the doubled number back, so the Display can show it.",
    "z_evens_b": "It should show only the even numbers from 1 to 10.",
    "z_grade_b": "60 is a pass. At the moment 60 fails.",
    "try_short": "New to this?",
    "try_go": "Try an example",
    "eg_head": "Examples",
    "eg_more": "More examples",
    # the five sections of the examples, and the ten in each
    "eg_l1": "Getting started",
    "e_ask": "Ask and show",
    "e_add": "Add two numbers",
    "e_swap": "Swap two numbers",
    "e_decide": "A decision",
    "e_oddeven": "Odd or even",
    "e_count": "Counting",
    "e_while": "A While loop",
    "e_total": "A running total",
    "e_module": "A module",
    "e_answers": "A function that answers",
    "eg_l2": "Decisions and loops",
    "e_grades": "Letter grades",
    "e_biggest": "The biggest of three",
    "e_menu": "A menu",
    "e_vowel": "Vowel or not",
    "e_leap": "Leap year",
    "e_keepasking": "Keep asking",
    "e_backwards": "Count backwards",
    "e_sumevens": "Add up the evens",
    "e_countdown": "Countdown",
    "e_guess": "Guess the number",
    "eg_l3": "Numbers and patterns",
    "e_fizz": "Fizz and Buzz",
    "e_prime": "Is it prime?",
    "e_gcd": "Greatest common factor",
    "e_digits": "How many digits",
    "e_reverse": "The number backwards",
    "e_fib": "The Fibonacci numbers",
    "e_factorial": "A factorial",
    "e_minmax": "Lowest and highest",
    "e_grid": "A times table grid",
    "e_stars": "A triangle of stars",
    "eg_l4": "Everyday programs",
    "e_area": "Area of a rectangle",
    "e_change": "Dollars, dimes and pennies",
    "e_temps": "Celsius, Fahrenheit and Kelvin",
    "e_shop": "A checkout with a discount",
    "e_report": "A class report",
    "e_votes": "Counting votes",
    "e_quiz": "A three-question quiz",
    "e_login": "Three tries at a password",
    "e_sentinel": "Numbers until you type 0",
    "e_picktable": "Any table you like",
    "eg_l5": "Bigger projects",
    "e_bank": "A bank account",
    "e_gradebook": "A gradebook",
    "e_paycheck": "Weekly paychecks",
    "e_convert": "A unit converter",
    "e_splitcheck": "Splitting the check",
    "e_vending": "A vending machine",
    "e_primelist": "Every prime up to a limit",
    "e_weekday": "What day of the week?",
    "e_loan": "Paying off a loan",
    "e_rps": "Rock, paper, scissors",
    # ---- a name for a program nobody named, from what it does (09-names.js)
    "d_rps": "Rock, Paper, Scissors",
    "d_weekday": "Day of the Week",
    "d_leap": "Leap Year Check",
    "d_bank": "Bank Account",
    "d_loan": "Loan Payoff",
    # named for what the program works out: {what} and {from}/{to} are its
    # own words, title-cased (Tuition Increase, Square Feet to Acres)
    "d_budget": "Budget Analysis",
    "d_rise": "{what} Increase",
    "d_fall": "{what} Decrease",
    "d_doubling": "{what} Doubling",
    "d_pop_growth": "Population Growth",
    "d_compound": "Compound Interest",
    "d_to": "{from} to {to}",
    "d_total_of": "Total {what}",
    "d_average_of": "Average {what}",
    "d_pay": "Payroll",
    "d_tip": "Tip Calculator",
    "d_vending": "Vending Machine",
    "d_change": "Making Change",
    "d_shop": "Sale Price",
    "d_price": "Purchase Price",
    "d_convert": "Unit Converter",
    "d_temps": "Celsius to Fahrenheit",
    "d_temps_any": "Temperature Converter",
    "d_primes": "Prime Numbers",
    "d_prime": "Prime Number Check",
    "d_fizz": "FizzBuzz",
    "d_gcd": "Greatest Common Factor",
    "d_fib": "Fibonacci Numbers",
    "d_factorial": "Factorial",
    "d_reverse": "Reversed Digits",
    "d_digits": "Digit Count",
    "d_gradebook": "Class Gradebook",
    "d_grades": "Letter Grade",
    "d_votes": "Vote Count",
    "d_quiz": "Quiz",
    "d_login": "Password Check",
    "d_guess": "Number Guessing Game",
    "d_vowel": "Vowel Check",
    "d_stars": "Star Triangle",
    "d_grid": "Multiplication Grid",
    "d_table": "Times Table",
    "d_minmax": "Lowest and Highest Numbers",
    "d_biggest": "Largest Number",
    "d_scores": "Test Scores",
    "d_average": "Average",
    "d_sumevens": "Sum of Even Numbers from {a} to {b}",
    "d_sumevens_any": "Sum of Even Numbers",
    "d_oddeven": "Odd or Even",
    "d_swap": "Swap Two Values",
    "d_area": "Rectangle Area",
    "d_menu": "Menu of Choices",
    "d_down_n": "Countdown from {n}",
    "d_down": "Countdown",
    "d_in_range": "Input Validation",
    "d_sum": "Sum of {a} to {b}",
    "d_sum_any": "Running Total",
    "d_count": "Count from {a} to {b}",
    "d_add": "Add Two Numbers",
    "d_greet": "Greeting",
    "d_checks": "{what} Check",
    "d_while": "{what} Loop",
    "d_until": "{what} Loop",
    "d_repeats": "Loop from {a} to {b}",
    "d_uses": "{names}",
    "d_asks": "Enter {what}",
    "d_asks_shows": "{what} Calculator",
    "d_one": "a number",
    "d_two": "two numbers",
    "d_three": "three numbers",
    "d_numbers": "{n} numbers",
    "d_circle": "Circle Area",
    "d_roman": "Roman Numerals",
    "d_dice": "Dice Roll",
    "d_coin": "Coin Toss",
    "d_reverse_text": "Reversed Word",
    "d_count_of": "{what} Count",
    "d_per": "{a} per {b}",
    "d_number": "Number",
    "d_and": "and",
    "try_one": "New to this? Start from one of these:",
    "eg_decision": "A decision", "eg_loop": "A loop", "eg_module": "A module",
    "r_pace": "How it runs", "r_at_once": "All at once",
    "r_by_step": "One at a time", "r_next": "Next step",
    "r_timed": "As the program times it",
    "chart_desc": "Flowchart with {n} shapes: {kinds}.",
    "yes_plain": "Yes", "no_plain": "No",
    "more_head": "Chart options",
    "o_words": "Language and words",
    "o_chains": "Queue long If chains down the page",
    "o_shapes": "The shapes", "o_paper": "Spacing and paper",
    "o_for": "For loops", "o_for_wide": "Opened out", "o_for_hex": "One hexagon",
    "o_everyout": "A symbol for every Display",
    "o_roomy": "Roomy: opened out, with room around every step",
    "o_tight": "Compressed: fewer shapes, folded into a compact block",
    "o_columns": "Wrap a tall chart into columns",
    "o_steady": "The same drawing every time",
    "more": "Options", "more_tip": "More chart options",
    "decide": "Decisions",
    "undo": "Undo", "redo": "Redo",
    "settings": "Settings", "appearance": "Appearance", "panel_side": "Panel side",
    "side_left": "Left", "side_right": "Right", "full_screen": "Full screen",
    "full_on": "Fill the screen", "full_off": "Leave full screen",
    "no_full": "This browser will not go full screen.",
    # the website installed as an app (31-app.js)
    "app_install": "Install as an app",
    "app_tip": "An icon on your home screen or with your other apps, opening "
               "in a window of its own -- and it works with no connection",
    "app_ios": "Press Share, then Add to Home Screen.",
    "app_mac": "In Safari's File menu, choose Add to Dock.",
    "app_done": "Installed -- it is with your other apps now, and works offline.",
    "p_ink": "Ink", "p_classic": "Classic", "p_slate": "Slate",
    "p_meadow": "Meadow", "p_sunset": "Sunset", "p_night": "Night", "p_lavender": "Lavender",
    "p_charcoal": "Charcoal", "p_ember": "Ember",
    # ---- the studio
    "pseudocode": "Pseudocode", "title": "Title", "your_name": "Your name",
    "code_big": "Fill the screen", "code_small": "Back to the panel", "done": "Done",
    "code_lines": "{n} lines",
    # what written-out code says when it waits for something to be typed
    "code_ask": "Enter {name}: ",
    "code_shares": "what the program shares",
    # ---- the code a chart is written out as, and the files it comes in
    "c_head": "Code", "c_write": "Write the code",
    "c_one": "In one file", "c_apart": "Several files",
    "c_files_tip": "One file, or a file for each chart -- and a chart drawn as a single flow is cut into parts where there is enough of it to be worth it",
    "c_one_chart": "Too short to be worth cutting up: it comes out as one file.",
    "c_cut_into": "No modules, so it is cut into {n} parts and what they share.",
    "c_files": "{n} files", "c_save_all": "Save them all",
    "c_writing": "Writing it out…",
    "c_zipped": "{n} files, as one .zip",
    "shape": "Shape",
    "language": "Language", "key_switch": "Key", "tint_switch": "Tints",
    "build": "Build the chart", "drawing": "Drawing…",
    "no_code": "There is no pseudocode to draw yet.",
    "failed": "That did not draw.",
    "not_answering": "The studio is not answering ({err}).",
    "empty_chart": "Paste your pseudocode on the left, then press Build.",
    "shape_auto": "Auto", "shape_square": "Square", "shape_wide": "Wide 16:9",
    "shape_page": "Page", "shape_tall": "Tall",
    # ---- what the script says in the terminal
    "already": "Already there {path}",
    "copied": "Copied {n} files into {dir}",
    "wrote": "Wrote {path}",
    "open_this": "<- open this one: it shows the chart and has the "
                 "download links",
    "style_seed": "Style seed {seed} (pass --seed {seed} to draw this "
                  "one again)",
    "nothing": "No pseudocode given -- nothing to draw.",
    "studio_at": "The flowchart studio is running at {url}",
    "leave_open": "Leave this window open while you use it; press Ctrl+C "
                  "to stop.",
    "stopped": "Studio stopped.",
    "site_done": "That folder is a website. Put it on GitHub Pages (or "
                 "any host that serves files) and it works as it does "
                 "here -- {dir}/README.md has the steps.",
    "starting": "Starting Python in your browser…",
    # ---- the bar a long drawing shows while it is being drawn
    # ---- the list of keys, and what each key is called
    "k_head": "Keyboard shortcuts",
    "k_tip": "Every key this page answers to (?)",
    "k_any": "Anywhere",
    "k_code": "Writing pseudocode",
    "k_shape": "With a shape picked",
    "k_hand": "Drawing by hand",
    "k_build": "Build the chart (by hand: check the design)",
    "k_undo": "Undo, and redo",
    "k_zoom": "Zoom in, zoom out, actual size",
    "k_close": "Close what is open",
    "k_keys": "Show this list",
    "k_indent": "Move the lines in, or back out",
    "k_enter": "A new line, as far in as it should be",
    "k_look": "Bold, italic, underline",
    "k_size": "Bigger or smaller words",
    "k_next": "The next shape, or the one before",
    "k_nudge": "Move it a little (Shift: further)",
    "k_drop": "Let go of it",
    "k_lasso": "Select every shape inside a box",
    "k_add": "Add a shape, or leave it out",
    "k_all": "Select every shape",
    "k_clip": "Copy, cut and paste",
    "k_pan": "Move about the paper",
    "kn_ctrl": "Ctrl",
    "kn_shift": "Shift",
    "kn_enter": "Enter",
    "kn_del": "Delete",
    "kn_space": "Space",
    "kn_click": "click",
    "kn_drag": "drag",
    "kn_dblclick": "double-click",
    "kn_rclick": "right-click",
    "kn_hold": "press and hold",
    "kn_wheel": "wheel",
    "kn_pinch": "pinch",
    "kn_corner": "drag a corner",
    "kn_dot": "drag a dot",
    "kn_spin": "drag the round handle",
    "kn_plus": "click +",
    "b_about": "How far the drawing has got",
    "b_boot": "Starting Python in your browser",
    "b_read": "Reading the pseudocode",
    "b_lay": "Laying it out",
    "b_draw": "Drawing the chart",
    "b_page": "Putting it on the page",
    "ready": "Ready.",
    "boot_failed": "Python could not start in this browser ({err}).",
    "py_gave_out": "Python in this browser gave out part way through drawing this ({err}).",
    # ================================================================
    #  The programs it offers, written out in full: the fifty examples
    #  (e_ask_p is the one the button e_ask opens) and the fifty
    #  puzzles (z_else_p).  The keywords stay as they are in every
    #  language -- Display, If, While are what you type -- and
    #  everything else is words: what it says, and what it calls its
    #  boxes, modules and functions.  A translation keeps each program
    #  the same program, line for line, and a puzzle the same fault.
    # ================================================================
    # ---- the examples: getting started
    "e_ask_p": program("""
        Start
        Declare String name
        Display "What is your name?"
        Input name
        Display "Hello"
        Display name
        Stop
    """),
    "e_add_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Display "Two numbers, please"
        Input a
        Input b
        Display "They come to"
        Display a + b
        Stop
    """),
    "e_swap_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer keep
        Input a
        Input b
        keep = a
        a = b
        b = keep
        Display a
        Display b
        Stop
    """),
    "e_decide_p": program("""
        Start
        Declare Integer age
        Display "How old are you?"
        Input age
        If age >= 18 Then
            Display "Old enough to vote"
        Else
            Display "Not old enough yet"
        End If
        Stop
    """),
    "e_oddeven_p": program("""
        Start
        Declare Integer n
        Display "Enter a number"
        Input n
        If n mod 2 = 0 Then
            Display "even"
        Else
            Display "odd"
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
        Display "The total is"
        Display total
        Stop
    """),
    "e_module_p": program("""
        Start
        Declare String name
        Input name
        Call greet(name)
        Stop

        Module greet(who)
            Display "Hello"
            Display who
        End Module
    """),
    "e_answers_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer sum
        Input a
        Input b
        sum = add(a, b)
        Display "The answer is"
        Display sum
        Stop

        Function add(x, y)
            Return x + y
        End Function
    """),
    # ---- the examples: decisions and loops
    "e_grades_p": program("""
        Start
        Declare Integer score
        Display "Enter the score"
        Input score
        If score >= 90 Then
            Display "A"
        Else If score >= 80 Then
            Display "B"
        Else If score >= 70 Then
            Display "C"
        Else If score >= 60 Then
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
        Declare Integer biggest
        Input a
        Input b
        Input c
        biggest = a
        If b > biggest Then
            biggest = b
        End If
        If c > biggest Then
            biggest = c
        End If
        Display "The biggest is"
        Display biggest
        Stop
    """),
    "e_menu_p": program("""
        Start
        Declare Integer choice
        Display "1 add  2 subtract  3 quit"
        Input choice
        Select Case choice
            Case 1
                Display "Adding"
            Case 2
                Display "Subtracting"
            Case Else
                Display "Goodbye"
        End Select
        Stop
    """),
    "e_vowel_p": program("""
        Start
        Declare String letter
        Display "Enter a letter"
        Input letter
        Select Case letter
            Case "a"
                Display "vowel"
            Case "e"
                Display "vowel"
            Case "i"
                Display "vowel"
            Case "o"
                Display "vowel"
            Case "u"
                Display "vowel"
            Case Else
                Display "not a vowel"
        End Select
        Stop
    """),
    "e_leap_p": program("""
        Start
        Declare Integer year
        Display "Which year?"
        Input year
        If year mod 400 = 0 Then
            Display "leap year"
        Else If year mod 100 = 0 Then
            Display "not a leap year"
        Else If year mod 4 = 0 Then
            Display "leap year"
        Else
            Display "not a leap year"
        End If
        Stop
    """),
    "e_keepasking_p": program("""
        Start
        Declare Integer n
        Do
            Display "Enter a number from 1 to 10"
            Input n
        Until n >= 1 And n <= 10
        Display "Thank you"
        Stop
    """),
    "e_backwards_p": program("""
        Start
        Declare Integer n
        Display "Count back from?"
        Input n
        For i = n To 1 Step -1
            Display i
        End For
        Display "Done"
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
        Display "The evens come to"
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
                Display "Halfway"
            End If
            n = n - 1
        End While
        Display "Liftoff"
        Stop
    """),
    "e_guess_p": program("""
        Start
        Declare Integer secret
        Declare Integer guess
        secret = 7
        Do
            Display "Guess my number"
            Input guess
            If guess < secret Then
                Display "Higher"
            End If
            If guess > secret Then
                Display "Lower"
            End If
        Until guess = secret
        Display "You got it"
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
        Declare Integer factors
        Display "Enter a number"
        Input n
        factors = 0
        For i = 1 To n
            If n mod i = 0 Then
                factors = factors + 1
            End If
        End For
        If factors = 2 Then
            Display "prime"
        Else
            Display "not prime"
        End If
        Stop
    """),
    "e_gcd_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Display "Two numbers, please"
        Input a
        Input b
        While a <> b
            If a > b Then
                a = a - b
            Else
                b = b - a
            End If
        End While
        Display "The greatest common factor is"
        Display a
        Stop
    """),
    "e_digits_p": program("""
        Start
        Declare Integer n
        Declare Integer many
        Display "Enter a whole number"
        Input n
        many = 0
        While n > 0
            n = n div 10
            many = many + 1
        End While
        Display "That many digits:"
        Display many
        Stop
    """),
    "e_reverse_p": program("""
        Start
        Declare Integer n
        Declare Integer back
        Display "Enter a whole number"
        Input n
        back = 0
        While n > 0
            back = back * 10 + n mod 10
            n = n div 10
        End While
        Display "Backwards that is"
        Display back
        Stop
    """),
    "e_fib_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Declare Integer next
        a = 0
        b = 1
        For i = 1 To 10
            Display a
            next = a + b
            a = b
            b = next
        End For
        Stop
    """),
    "e_factorial_p": program("""
        Start
        Declare Integer n
        Declare Integer answer
        Display "Enter a number"
        Input n
        answer = 1
        For i = 1 To n
            answer = answer * i
        End For
        Display "The factorial is"
        Display answer
        Stop
    """),
    "e_minmax_p": program("""
        Start
        Declare Integer n
        Declare Integer lowest
        Declare Integer highest
        Display "Five numbers, please"
        Input n
        lowest = n
        highest = n
        For i = 2 To 5
            Input n
            If n < lowest Then
                lowest = n
            End If
            If n > highest Then
                highest = n
            End If
        End For
        Display "Lowest"
        Display lowest
        Display "Highest"
        Display highest
        Stop
    """),
    "e_grid_p": program("""
        Start
        For row = 1 To 5
            For col = 1 To 5
                Display row * col
            End For
        End For
        Stop
    """),
    "e_stars_p": program("""
        Start
        Declare String line
        Declare Integer n
        Display "How many rows?"
        Input n
        For row = 1 To n
            line = ""
            For col = 1 To row
                line = line + "*"
            End For
            Display line
        End For
        Stop
    """),
    # ---- the examples: everyday programs
    "e_area_p": program("""
        Start
        Declare Integer width
        Declare Integer height
        Display "How wide?"
        Input width
        Display "How tall?"
        Input height
        Display "The area is"
        Display width * height
        Stop
    """),
    "e_change_p": program("""
        Start
        Declare Integer cents
        Display "How many cents?"
        Input cents
        Display "Dollars"
        Display cents div 100
        cents = cents mod 100
        Display "Dimes"
        Display cents div 10
        Display "Pennies"
        Display cents mod 10
        Stop
    """),
    "e_temps_p": program("""
        Start
        Declare String fromScale
        Declare String toScale
        Declare Real degrees
        Declare Real celsius
        Declare Real result
        Declare String again
        Do
            fromScale = askScale("Convert from C, F or K?")
            toScale = askScale("Convert to C, F or K?")
            Display "The temperature?"
            Input degrees
            celsius = toCelsius(degrees, fromScale)
            result = round(fromCelsius(celsius, toScale) * 100) / 100
            Display degrees, " ", fromScale, " is ", result, " ", toScale
            Display "Another one? y or n"
            Input again
        Until toupper(again) <> "Y"
        Stop

        Function askScale(question)
            Declare String scale
            Display question
            Input scale
            scale = toupper(scale)
            While scale <> "C" And scale <> "F" And scale <> "K"
                Display "Please type C, F or K"
                Input scale
                scale = toupper(scale)
            End While
            Return scale
        End Function

        Function toCelsius(deg, scale)
            If scale = "F" Then
                Return (deg - 32) * 5 / 9
            Else If scale = "K" Then
                Return deg - 273.15
            Else
                Return deg
            End If
        End Function

        Function fromCelsius(deg, scale)
            If scale = "F" Then
                Return deg * 9 / 5 + 32
            Else If scale = "K" Then
                Return deg + 273.15
            Else
                Return deg
            End If
        End Function
    """),
    "e_shop_p": program("""
        Start
        Declare Integer many
        Declare Real price
        Declare Real total
        Display "How many?"
        Input many
        Display "Price each?"
        Input price
        total = many * price
        If total > 50 Then
            total = total * 0.9
            Display "Ten percent off"
        End If
        Display "Amount due: $", total
        Stop
    """),
    "e_report_p": program("""
        Start
        Declare Integer score
        Declare Integer total
        Declare Integer passes
        Declare Integer best
        total = 0
        passes = 0
        best = 0
        For i = 1 To 5
            Display "Enter a score"
            Input score
            total = total + score
            If score >= 60 Then
                passes = passes + 1
            End If
            If score > best Then
                best = score
            End If
        End For
        Display "Passes"
        Display passes
        Display "Average"
        Display total / 5
        Display "Best"
        Display best
        Stop
    """),
    "e_votes_p": program("""
        Start
        Declare String vote
        Declare Integer reds
        Declare Integer blues
        reds = 0
        blues = 0
        For i = 1 To 5
            Display "red or blue?"
            Input vote
            If vote = "red" Then
                reds = reds + 1
            Else
                blues = blues + 1
            End If
        End For
        Display "Red"
        Display reds
        Display "Blue"
        Display blues
        If reds > blues Then
            Display "Red wins"
        Else If blues > reds Then
            Display "Blue wins"
        Else
            Display "A tie"
        End If
        Stop
    """),
    "e_quiz_p": program("""
        Start
        Declare Integer score
        score = 0
        score = score + asked("2 plus 2?", 4)
        score = score + asked("5 times 3?", 15)
        score = score + asked("10 minus 7?", 3)
        Display "You scored"
        Display score
        Stop

        Function asked(question, answer)
            Declare Integer said
            Display question
            Input said
            If said = answer Then
                Display "Right"
                Return 1
            Else
                Display "Wrong"
                Return 0
            End If
        End Function
    """),
    "e_login_p": program("""
        Start
        Declare String word
        Declare Integer tries
        tries = 0
        Do
            Display "Password?"
            Input word
            tries = tries + 1
        Until word = "open" Or tries = 3
        Call verdict(word)
        Stop

        Module verdict(said)
            If said = "open" Then
                Display "Welcome in"
            Else
                Display "Locked out"
            End If
        End Module
    """),
    "e_sentinel_p": program("""
        Start
        Declare Integer n
        Declare Integer total
        Declare Integer many
        total = 0
        many = 0
        Display "Numbers, please. 0 to finish."
        Input n
        While n <> 0
            total = total + n
            many = many + 1
            Input n
        End While
        If many > 0 Then
            Display "The average is"
            Display total / many
        Else
            Display "Nothing to average"
        End If
        Stop
    """),
    "e_picktable_p": program("""
        Start
        Declare Integer n
        Display "Which table? 0 to stop."
        Input n
        While n > 0
            For i = 1 To 12
                Display n * i
            End For
            Display "Which table? 0 to stop."
            Input n
        End While
        Display "Bye"
        Stop
    """),
    # ---- the examples: bigger projects
    "e_bank_p": program("""
        Start
        Declare Real balance
        Declare Integer choice
        balance = 0
        Do
            Display "1 deposit  2 withdraw  3 balance  4 quit"
            Input choice
            Select Case choice
                Case 1
                    Call deposit(balance)
                Case 2
                    Call withdraw(balance)
                Case 3
                    Display "Your balance is $", balance
                Case 4
                    Display "Goodbye"
                Case Else
                    Display "Pick 1, 2, 3 or 4"
            End Select
        Until choice = 4
        Stop

        Module deposit(Real Ref money)
            Declare Real amount
            Display "How much to deposit?"
            Input amount
            If amount <= 0 Then
                Display "A deposit has to be more than zero"
            Else
                money = money + amount
                Display "Deposited $", amount
            End If
        End Module

        Module withdraw(Real Ref money)
            Declare Real amount
            Display "How much to withdraw?"
            Input amount
            If amount <= 0 Then
                Display "A withdrawal has to be more than zero"
            Else If amount > money Then
                Display "Not enough money. You have $", money
            Else
                money = money - amount
                Display "Withdrew $", amount
            End If
        End Module
    """),
    "e_gradebook_p": program("""
        Start
        Declare Integer students
        Declare Integer score
        Declare Integer total
        Declare Integer highest
        Declare Integer lowest
        Declare Integer passed
        Declare String grade
        total = 0
        passed = 0
        highest = 0
        lowest = 100
        Display "How many students?"
        Input students
        While students < 1
            Display "There has to be at least one student"
            Input students
        End While
        For i = 1 To students
            Display "Score for student ", i
            Input score
            While score < 0 Or score > 100
                Display "A score is from 0 to 100. Try again"
                Input score
            End While
            grade = letterGrade(score)
            Display "That is a grade of ", grade
            total = total + score
            If grade <> "F" Then
                passed = passed + 1
            End If
            If score > highest Then
                highest = score
            End If
            If score < lowest Then
                lowest = score
            End If
        End For
        Display "Class average: ", total / students
        Display "Highest score: ", highest
        Display "Lowest score: ", lowest
        Display "Students who passed: ", passed
        Stop

        Function String letterGrade(Integer points)
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
        Constant Real TAX_RATE = 0.15
        Declare String name
        Declare Real hours
        Declare Real rate
        Declare Real gross
        Declare Real tax
        Declare Integer paid
        paid = 0
        Display "Employee name? Type done to finish"
        Input name
        While name <> "done"
            Display "Hours worked this week?"
            Input hours
            Display "Hourly pay rate?"
            Input rate
            gross = grossPay(hours, rate)
            tax = gross * TAX_RATE
            Display name, " earned $", gross
            Display "Taxes withheld: $", tax
            Display "Take-home pay: $", gross - tax
            paid = paid + 1
            Display "Employee name? Type done to finish"
            Input name
        End While
        Display "Paychecks written: ", paid
        Stop

        Function Real grossPay(Real worked, Real hourly)
            Declare Real overtime
            If worked <= 40 Then
                Return worked * hourly
            Else
                overtime = worked - 40
                Return 40 * hourly + overtime * hourly * 1.5
            End If
        End Function
    """),
    "e_convert_p": program("""
        Start
        Declare Integer choice
        Declare Real amount
        Do
            Display "1 miles to kilometers"
            Display "2 pounds to kilograms"
            Display "3 Fahrenheit to Celsius"
            Display "4 inches to centimeters"
            Display "5 quit"
            Input choice
            If choice >= 1 And choice <= 4 Then
                Display "How many?"
                Input amount
                Call convert(choice, amount)
            Else If choice <> 5 Then
                Display "Pick a number from 1 to 5"
            End If
        Until choice = 5
        Display "Goodbye"
        Stop

        Module convert(Integer which, Real amount)
            Select Case which
                Case 1
                    Display amount, " miles is ", amount * 1.609, " kilometers"
                Case 2
                    Display amount, " pounds is ", amount * 0.4536, " kilograms"
                Case 3
                    Display amount, " F is ", (amount - 32) * 5 / 9, " C"
                Case Else
                    Display amount, " inches is ", amount * 2.54, " centimeters"
            End Select
        End Module
    """),
    "e_splitcheck_p": program("""
        Start
        Declare Real bill
        Declare Real percent
        Declare Integer people
        Declare Real tip
        Display "How much is the check?"
        Input bill
        While bill <= 0
            Display "The check has to be more than zero"
            Input bill
        End While
        Display "What percent tip? 15, 18 or 20 is usual"
        Input percent
        While percent < 0 Or percent > 100
            Display "Pick a percent from 0 to 100"
            Input percent
        End While
        Display "How many people are splitting it?"
        Input people
        While people < 1
            Display "At least one person has to pay"
            Input people
        End While
        tip = bill * percent / 100
        Call receipt(bill, tip, people)
        Stop

        Module receipt(Real food, Real extra, Integer many)
            Declare Real total
            total = food + extra
            Display "Food and drinks: $", food
            Display "Tip: $", extra
            Display "Total: $", total
            If many = 1 Then
                Display "You pay it all: $", total
            Else
                Display "Each of the ", many, " people pays $", total / many
            End If
        End Module
    """),
    "e_vending_p": program("""
        Start
        Declare Integer price
        Declare Integer paid
        Declare Integer coin
        Display "What does the snack cost, in cents?"
        Input price
        While price <= 0 Or price mod 5 <> 0
            Display "Prices here go up in steps of 5 cents"
            Input price
        End While
        paid = 0
        While paid < price
            Display "Still owed: ", price - paid, " cents. Put in 5, 10 or 25"
            Input coin
            Select Case coin
                Case 5
                    paid = paid + coin
                Case 10
                    paid = paid + coin
                Case 25
                    paid = paid + coin
                Case Else
                    Display "This machine only takes nickels, dimes and quarters"
            End Select
        End While
        Display "Enjoy your snack"
        If paid > price Then
            Call giveChange(paid - price)
        End If
        Stop

        Module giveChange(Integer cents)
            Display "Your change is ", cents, " cents"
            Display "Quarters: ", cents div 25
            cents = cents mod 25
            Display "Dimes: ", cents div 10
            cents = cents mod 10
            Display "Nickels: ", cents div 5
        End Module
    """),
    "e_primelist_p": program("""
        Start
        Declare Integer limit
        Declare Integer found
        Declare Integer total
        Display "Find the primes up to what number?"
        Input limit
        While limit < 2
            Display "Pick a number that is 2 or more"
            Input limit
        End While
        found = 0
        total = 0
        For n = 2 To limit
            If isPrime(n) Then
                Display n
                found = found + 1
                total = total + n
            End If
        End For
        Display "Primes found: ", found
        Display "They add up to ", total
        Stop

        Function Boolean isPrime(Integer number)
            Declare Integer d
            d = 2
            While d * d <= number
                If number mod d = 0 Then
                    Return False
                End If
                d = d + 1
            End While
            Return True
        End Function
    """),
    "e_weekday_p": program("""
        Start
        Declare Integer year
        Declare Integer month
        Declare Integer day
        Display "Year?"
        Input year
        Display "Month, from 1 to 12?"
        Input month
        While month < 1 Or month > 12
            Display "A month is from 1 to 12"
            Input month
        End While
        Display "Day of the month?"
        Input day
        While day < 1 Or day > daysIn(month, year)
            Display "That month has ", daysIn(month, year), " days"
            Input day
        End While
        Display month, "/", day, "/", year, " is a ", dayName(weekday(year, month, day))
        Stop

        Function Integer daysIn(Integer m, Integer y)
            Select Case m
                Case 2
                    If isLeap(y) Then
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

        Function Boolean isLeap(Integer y)
            Return (y mod 4 = 0 And y mod 100 <> 0) Or y mod 400 = 0
        End Function

        Function Integer weekday(Integer y, Integer m, Integer d)
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

        Function String dayName(Integer h)
            Select Case h
                Case 0
                    Return "Saturday"
                Case 1
                    Return "Sunday"
                Case 2
                    Return "Monday"
                Case 3
                    Return "Tuesday"
                Case 4
                    Return "Wednesday"
                Case 5
                    Return "Thursday"
                Case Else
                    Return "Friday"
            End Select
        End Function
    """),
    "e_loan_p": program("""
        Start
        Declare Real balance
        Declare Real rate
        Declare Real payment
        Declare Real interest
        Declare Real paidInterest
        Declare Integer months
        Display "How much is the loan?"
        Input balance
        Display "Yearly interest rate, as a percent?"
        Input rate
        Display "Monthly payment?"
        Input payment
        interest = balance * rate / 100 / 12
        If payment <= interest Then
            Display "That never pays it off. Pay more than $", interest
        Else
            months = 0
            paidInterest = 0
            While balance > 0
                interest = balance * rate / 100 / 12
                paidInterest = paidInterest + interest
                balance = balance + interest - payment
                months = months + 1
                If months mod 12 = 0 And balance > 0 Then
                    Display "After year ", months div 12, " you still owe $", balance
                End If
            End While
            Display "Paid off in ", months, " months"
            Display "The last payment is only $", payment + balance
            Display "Interest paid in all: $", paidInterest
        End If
        Stop
    """),
    "e_rps_p": program("""
        Start
        Declare Integer player
        Declare Integer computer
        Declare Integer result
        Declare Integer wins
        Declare Integer losses
        wins = 0
        losses = 0
        For game = 1 To 5
            Display "Game ", game, ": 1 rock, 2 paper, 3 scissors"
            Input player
            While player < 1 Or player > 3
                Display "Pick 1, 2 or 3"
                Input player
            End While
            computer = random(1, 3)
            Display "You: ", nameOf(player), "   Computer: ", nameOf(computer)
            result = winner(player, computer)
            If result = 1 Then
                Display "You win this one"
                wins = wins + 1
            Else If result = 2 Then
                Display "The computer wins this one"
                losses = losses + 1
            Else
                Display "A tie"
            End If
        End For
        Display "You won ", wins, " and lost ", losses
        If wins > losses Then
            Display "You beat the computer!"
        Else If losses > wins Then
            Display "The computer beat you"
        Else
            Display "It is a tie overall"
        End If
        Stop

        Function String nameOf(Integer pick)
            Select Case pick
                Case 1
                    Return "rock"
                Case 2
                    Return "paper"
                Case Else
                    Return "scissors"
            End Select
        End Function

        Function Integer winner(Integer a, Integer b)
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
        Declare Integer age
        Input age
        If age >= 18 Then
            Display "in"
        End If
        Stop
    """),
    "z_swap_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 10 Then
            Display "small"
        Else
            Display "big"
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
        Display "Hello"
        Display name
        Input name
        Stop
    """),
    "z_range_p": program("""
        Start
        Declare Integer n
        Input n
        If n > 0 Or n < 10 Then
            Display "in range"
        Else
            Display "out of range"
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
            Display "positive"
        Else
            Display "negative"
        End If
        Stop
    """),
    "z_twice_p": program("""
        Start
        Declare String word
        Input word
        Display word
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
        Declare Integer answer
        Input n
        Display answer
        answer = n * 3
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
        Display "go"
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
        For row = 1 To 2
            For col = 1 To 1
                Display row * col
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
        Declare Integer score
        Input score
        If score > 60 Then
            Display "pass"
        Else
            Display "fail"
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
        Display twice(n)
        Stop

        Function twice(x)
            x = x * 2
        End Function
    """),
    "z_param_p": program("""
        Start
        Declare Integer n
        Input n
        Call show(n)
        Stop

        Module show(x)
            Display "x"
        End Module
    """),
    "z_many_p": program("""
        Start
        Declare Integer n
        Declare Integer many
        For i = 1 To 5
            many = 0
            Input n
            If n > 10 Then
                many = many + 1
            End If
        End For
        Display many
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
        Declare Integer best
        best = 0
        For i = 1 To 4
            Input n
            If n < best Then
                best = n
            End If
        End For
        Display best
        Stop
    """),
    "z_short_p": program("""
        Start
        Declare Integer a
        Declare Integer b
        Input a
        Input b
        Display add(a)
        Stop

        Function add(x, y)
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
        Display "go"
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
        Declare Integer factors
        Input n
        factors = 0
        For i = 1 To n
            If n mod i = 0 Then
                factors = factors + 1
            End If
        End For
        If factors < 3 Then
            Display "prime"
        Else
            Display "not prime"
        End If
        Stop
    """),
    "z_digits_p": program("""
        Start
        Declare Integer n
        Declare Integer many
        Input n
        many = 1
        While n > 0
            n = n div 10
            many = many + 1
        End While
        Display many
        Stop
    """),
    "z_revzero_p": program("""
        Start
        Declare Integer n
        Declare Integer back
        Input n
        back = 0
        While n > 0
            back = back + n mod 10
            n = n div 10
        End While
        Display back
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
        For row = 1 To 3
            For col = 1 To 3
                Display row * row
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
        Declare Integer lowest
        Declare Integer highest
        lowest = 0
        highest = 0
        For i = 1 To 4
            Input n
            If n < lowest Then
                lowest = n
            End If
            If n > highest Then
                highest = n
            End If
        End For
        Display lowest
        Display highest
        Stop
    """),
    "z_starsrow_p": program("""
        Start
        Declare String line
        For row = 1 To 3
            line = ""
            For col = 1 To 3
                line = line + "*"
            End For
            Display line
        End For
        Stop
    """),
    "z_factloop_p": program("""
        Start
        Declare Integer n
        Declare Integer answer
        Input n
        answer = 0
        For i = 1 To n
            answer = answer * i
        End For
        Display answer
        Stop
    """),
    # ---- the puzzles: real bugs
    "z_report_p": program("""
        Start
        Declare Integer score
        Declare Integer total
        total = 0
        For i = 1 To 5
            Input score
            total = total + score
        End For
        Display total / 6
        Stop
    """),
    "z_tries_p": program("""
        Start
        Declare String word
        Declare Integer tries
        tries = 0
        Do
            Input word
            tries = tries + 1
        Until word = "open" Or tries = 2
        If word = "open" Then
            Display "in"
        Else
            Display "out"
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
        Declare Integer reds
        Declare Integer blues
        Input reds
        Input blues
        If reds > blues Then
            Display "Red wins"
        Else
            Display "Blue wins"
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
        Declare Integer score
        score = 0
        score = score + asked(4)
        score = score + asked(15)
        Display score
        Stop

        Function asked(answer)
            Declare Integer said
            Input said
            If said = answer Then
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
        Declare Integer many
        total = 0
        many = 0
        Input n
        While n <> 0
            total = total + n
            many = many + 1
            Input n
        End While
        Display total / (many + 1)
        Stop
    """),
    "z_menu0_p": program("""
        Start
        Declare Integer n
        Display "Pick a number, 0 to stop"
        Input n
        While n <> 1
            Display n
            Display "Pick a number, 0 to stop"
            Input n
        End While
        Display "Bye"
        Stop
    """),
    # ---- the answers a puzzle is marked against that are words.  A
    # puzzle's tries write them as {out}; each is said here the way the
    # puzzles above say it, so a fixed program says exactly this.
    "zw_in": "in", "zw_out": "out",
    "zw_big": "big", "zw_small": "small",
    "zw_hello": "Hello", "zw_hi": "hi",
    "zw_inrange": "in range", "zw_outrange": "out of range",
    "zw_positive": "positive", "zw_zero": "zero", "zw_negative": "negative",
    "zw_go": "go", "zw_ok": "ok",
    "zw_pass": "pass", "zw_fail": "fail",
    "zw_prime": "prime", "zw_notprime": "not prime",
    "zw_open": "open",
    "zw_redwins": "Red wins", "zw_bluewins": "Blue wins", "zw_tie": "A tie",
    "zw_pick": "Pick a number, 0 to stop", "zw_bye": "Bye",
}

speaks("en", "English", EN)
