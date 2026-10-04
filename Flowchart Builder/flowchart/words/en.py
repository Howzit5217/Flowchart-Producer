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
    "dl_pdf": "Download PDF",
    "mm_open": "Mermaid text",
    "mm_tip": "The chart as Mermaid, to paste into GitHub, Notion or Markdown",
    "mm_head": "Mermaid",
    "mm_bad": "This couldn't be read as a Mermaid flowchart.",
    "mm_opened": "Opened as a drawing.",
    "print_head": "Print",
    "print_go": "Print…",
    "print_paper": "Paper",
    "print_wide": "Sideways",
    "print_fit": "Fit on one page",
    "print_note": "Prints in black and white. Your browser asks which printer and how many copies.",
    "panel_tip": "Show or hide the panel", "png_tip": "How big the PNG comes out",
    "fit": "Fit", "actual": "Actual", "zoom_in": "Zoom in", "zoom_out": "Zoom out",
    "slide_left": "Left", "slide_right": "Right", "slide_up": "Up", "slide_down": "Down",
    "hold_locked": "Locked", "hold_loose": "Unlocked",
    "lock_tip": "Keep the chart in place and scroll around it",
    "loose_tip": "Drag the chart anywhere; part of it always stays in view",
    "tool_move": "Move",
    "tool_move_tip": "Drag to move around the paper. Ctrl+drag or Shift+drag selects shapes.",
    "tool_select": "Select",
    "tool_select_tip": "Drag across the paper to select shapes. Click shapes to add or remove them.",
    "pixels": "pixels",
    "dl_scale": "Times the size it is drawn",
    "dl_frame": "Fitted inside a picture",
    "png_over": "more than this browser can draw",
    "click_shape": "Click a shape to style just that one.",
    "palette_hint": "A palette colors every shape. Changes you make after that stay.",
    "shapes_hint": "Fill and outline, for every shape of that kind.",
    "apply_all": "Apply to all {n} {what}", "clear": "Clear",
    "rendering": "Rendering…",
    "png_big": "That PNG is too big for this browser. Try a smaller size, or save the SVG.",
    "png_fail": "The PNG couldn't be made. The SVG download still works.",
    "png_capped": "{want}× is too big for this browser, so the PNG saves at {got}× ({w} × {h} pixels).",
    "flowchart": "Flowchart",
    "r_head": "Run it",
    "r_run": "Run",
    "r_stop": "Stop",
    "r_code": "As code", "r_lang_pick": "Which language the code is written in",
    "r_pseudo": "Pseudocode",
    "r_slowly": "Step slowly",
    "r_enter": "Enter",
    "r_hint": "Runs the chart's program: it asks for input, prints output and lights up each shape. Pick a language to see it as code.",
    "r_started": "Running...",
    "r_done": "Finished.",
    "r_nothing": "Nothing to run yet.",
    "r_steps": "{n} steps, {ms} ms.",
    "r_forever": "This has run too long without stopping: a loop never ends.",
    "r_zero": "That divides by zero.",
    "r_unknown": "Nothing has been put in {name} yet.",
    "r_odd_op": "I do not know what to do with {op}.",
    "r_half": "This does not read as a whole thing: {bit}",
    "r_back": "Back to the run", "back": "Back",
    "r_by_hand": "Run turns on once the design works.",
    "h_no_start": "There is no shape to start from.",
    "h_tangled": "These loops cross each other, so this can't be written as a program.",
    "h_not_a_program": "These shapes don't read as a program.",
    "r_build_first": "Build a chart from pseudocode to run it here.",
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
    "r_empty_expr": "There's nothing here to work out.",
    "r_left_over": "{bit} is left over at the end, with nothing to join it to.",
    "r_open_quote": "This text is never closed: a quote mark is missing.",
    "r_open_bracket": "This bracket is opened and never closed.",
    "r_shut_bracket": "This bracket closes one that was never opened.",
    "r_no_idea": "Can't make sense of this line, so the run skipped it.",
    "r_stepped_over": "Some lines were skipped, so the output may be incomplete.",
    "r_too_deep": "{name} called itself too many times and never stopped.",
    "r_args": "{name} asks for {want} and was given {got}.",
    "r_no_main": "No main flow, so the run started in {name}.",
    "r_no_item": "There is no item {at} here: it holds {n}.",
    "r_no_key": "There is nothing under {key} in it.",
    "r_no_field": "There is no {name} in it.",
    "r_no_items": "Only a list, a word or a table has items to pick out, and this is {what}.",
    "r_whole_at": "An item is picked by a whole number, not {at}.",
    "r_open_square": "This [ is opened and never closed.",
    "r_empty_list": "The list is empty, so there is nothing to take out of it.",
    "r_not_in_list": "{item} is not in the list.",
    "r_needs_list": "{name} needs a list.",
    "w_head": "Worth a look",
    "w_found": "{n} to look at in the pseudocode:",
    "w_open_if": "Line {line}: this If is never closed. Add an End If where it should stop.",
    "w_open_loop": "Line {line}: this loop is never closed. Add an End While where it should stop.",
    "w_open_for": "Line {line}: this For is never closed. Add an End For where it should stop.",
    "w_open_select": "Line {line}: this Select is never closed. Add an End Select where it should stop.",
    "w_no_if": "Line {line}: End If, but no If is open.",
    "w_no_loop": "Line {line}: this ends a loop, but no loop is open.",
    "w_exit_alone": "Line {line}: Exit leaves a loop, but no loop is open here.",
    "w_no_select": "Line {line}: End Select, but no Select is open.",
    "w_do_no_test": "Line {line}: this Do has no test, so it never stops. End it with Until ... or Loop While ...",
    "w_until_alone": "Line {line}: Until, but no Do or Repeat above it.",
    "w_mend_change": "Change {word} to {instead}",
    "w_mend_drop": "Take line {line} out",
    "w_mend_insert": "Put {text} in at line {line}",
    "w_mend_tip": "Double-click to put this right",
    "w_mend_close": "Put the missing {text} on the end",
    "w_mend_cut": "Take out {text}",
    "w_mend_put": "Put {text} in",
    "w_mend_all": "Put all {n} right",
    "ask_go": "Put it in",
    "ask_tip": "Type what it needs in the box under it",
    "ask_pick": "Pick a shape",
    "ask_join": "Join them",
    "ask_start": "Start {name} at",
    "ask_input": "Ask for it instead",
    "ask_forever": "The loop on line {line} never stops. Add to the end of it",
    "ask_stop_when": "Or stop it when",
    "ask_zero_else": "When {name} is 0, use instead",
    "ask_zero_show": "When {name} is 0, show instead",
    "ask_zero_eg": "Nothing to divide by",
    "ask_zero_skip": "Skip it when {name} is 0",
    "ask_args": "{name} also needs {what}",
    "ask_args_cut": "Take out the extra {n}",
    "ask_deep": "Give {name} a place to stop: stop when",
    "ask_deep_give": "and give back",
    "ask_use": "There is no {name}. Use this instead",
    "ask_here": "What goes here?",
    "ask_line": "Write line {line} as",
    "ask_until": "Keep going round until",
    "ask_close": "{text} goes after line",
    "ask_same": "That is the line as it is. Change it first.",
    "ask_stale": "The pseudocode has changed since. Build it again first.",
    "ask_bad_empty": "Type something in first.",
    "ask_bad_pick": "Pick one first.",
    "ask_bad_open": "That has a {text} that is never closed.",
    "ask_bad_shut": "That has a {text} with nothing to close.",
    "ask_bad_name": "That needs to be one name, like total.",
    "ask_bad_line": "Pick a line from {from} to {to}.",
    "ask_write_in": "Write in it",
    "ask_write_eg": "total = total + 1",
    "ask_arrow_to": "Draw an arrow from it to",
    "ask_arrow_from": "Draw an arrow into it from",
    "ask_name_way": "Words for this way out",
    "ask_leave_when": "Leave the loop when",
    "ask_end_after": "Put an End after",
    "ask_arrow_into": "Draw an arrow into “{name}” from",
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
    "f_open": "Open a file",
    "f_not_ours": "That JSON file isn't a design saved from here.",
    "f_opened": "Opened {name}.",
    "f_empty": "There is nothing written in that one.",
    "f_open_tip": "Code, pseudocode, a flowchart from draw.io, Lucidchart, Visio or Excalidraw, or a picture of one. You can also drop files on the page, or paste a picture.",
    "f_folder": "Open a folder",
    "f_folder_tip": "A folder of code, pseudocode or flowcharts. A zip works too.",
    "in_head": "What to open",
    "in_from": "In {name}",
    "in_cancel": "Cancel",
    "in_all": "All {n}, as one program",
    "in_files": "{n} files",
    "in_skipped": "{n} other files left out.",
    "in_skipped_one": "One other file left out.",
    "in_paste_head": "Open the pasted picture",
    "in_paste_said": "It becomes a new flowchart, in place of what is here now.",
    "in_paste_yes": "Open it",
    "in_nothing": "Nothing in there is code, pseudocode or a flowchart.",
    "in_cannot": "This can't open that kind of file.",
    "in_unread": "That couldn't be read as a flowchart.",
    "in_many": "Opened the first {n} files.",
    "in_most": "Read the {n} files that matter most, of {all}. Every file is in the list over the code.",
    "in_reading": "Reading {n} of {of} files…",
    "in_sorting": "Sorting {n} files…",
    "in_found": "Found {n} files…",
    "in_more_items": "…and {n} more.",
    "in_old": "This browser can't unpack that. Try a newer one.",
    "in_looking": "Opening…",
    "in_again": "Another from {name}",
    "in_again_plain": "Open another of those",
    "in_picture": "Picture",
    "in_design": "Saved here",
    "in_drop": "Drop to open",
    "in_drop_more": "Code, pseudocode, a flowchart, a picture of one, a folder or a zip",
    "pic_looking": "Looking at the picture…",
    "pic_words": "Reading the words, {n} of {m}…",
    "pic_labels": "Reading the arrows' words…",
    "pic_read": "Read {name}. Check the words.",
    "pic_unread": "Read the shapes in {name}. Type the words in: reading them needs a connection.",
    "pic_none": "No flowchart found in that picture.",
    "pic_bad": "That picture couldn't be opened.",
    "dl_copy": "Copy the chart",
    "dl_copied": "Copied",
    "dl_copy_no": "This browser can't copy pictures. Download it instead.",
    "l_copy": "Copy a link to this",
    "l_copied": "Link copied",
    "l_copy_no": "Couldn't copy it. Take it from the address bar instead.",
    "fd_head": "Where saves go",
    "fd_browser": "Into your browser's downloads.",
    "fd_in": "Into the folder {name}.",
    "fd_pick": "Choose a folder",
    "fd_pick_tip": "Pick or make a folder. Everything you save goes straight into it.",
    "fd_off": "Back to downloads",
    "fd_cannot": "This browser saves only to Downloads. Chrome or Edge on a computer can pick a folder.",
    "fd_saved": "Saved {name} in {folder}",
    "fd_fell": "{folder} wouldn't take it, so it went to Downloads.",
    "l_opened": "Opened from a link.",
    "l_long": "This link is {n} characters long. Chat and mail apps may cut it short, so send the file instead.",
    "l_bad": "This link doesn't hold a chart this page can read.",
    # ---- saved progress: a few places the page keeps your work in itself
    "sv_tab": "Saved progress",
    "sv_about": "Saves the chart, the run and where it got to, in this browser. Room for {n}.",
    "sv_save": "Save progress",
    "sv_saved": "Saved.",
    "sv_full": "All {n} are used. Save over one, or delete one.",
    "sv_nothing": "Nothing to save yet.",
    "sv_no_room": "The browser wouldn't keep it: storage is full or turned off.",
    "sv_empty": "Empty",
    "sv_load": "Load",
    "sv_over": "Save over",
    "sv_over_ask": "Replace this save with what's on the page?",
    "sv_over_yes": "Save over it",
    "sv_del_ask": "Delete this save for good?",
    "sv_today": "Today",
    "sv_st_none": "Not run yet",
    "sv_st_ask": "Waiting for an answer",
    "sv_st_next": "Waiting on the next step",
    "sv_st_going": "Part way through a run",
    "sv_st_over": "Run finished",
    "sv_back": "Picked up where you left off.",
    "sv_moved": "This save no longer matches the program, so the run couldn't resume.",
    "sv_lost": "This save's program couldn't be read from the browser's storage.",
    "sv_no_draw": "The chart didn't draw, so the run couldn't resume.",
    "sv_stop_said": "Loading a save replaces the running program, so the run will stop.",
    "sv_stop_yes": "Stop it and load",
    "held_head": "What it is holding",
    "held_in": "in {name}",
    "held_shared": "Declared outside every module, so every chart can see it",
    "held_none": "nothing yet",
    # said over the tick box on its heading, which folds it away
    "held_switch": "Show what it is holding",
    "tests_open": "Test Cases",
    "tests_tip": "Check it against inputs you choose and the output it should give",
    "tests_head": "Test Cases",
    "tests_one": "Test {n}",
    "tests_typed": "Input, one per line",
    "tests_want": "Expected output, one per line",
    "tests_add": "Add a Test",
    "tests_run": "Run the Tests",
    "tests_drop": "Remove",
    "tests_pass": "Passed",
    "tests_fail": "Failed",
    "tests_all": "{pass} of {n} passed",
    "tests_none": "Write a test first.",
    "tests_diff": "Line {n}: it printed “{got}”, not “{want}”.",
    "tests_short": "It printed {n} lines, not {m}.",
    "tests_long": "It printed {n} lines, not {m}.",
    "tests_broke": "It stopped with an error.",
    "trace_open": "Trace table",
    "trace_tip": "Every change the run made, step by step, as a table",
    "trace_head": "Trace table",
    "trace_line": "Line",
    "trace_out": "Output",
    "trace_main": "Main program",
    "trace_none": "Run the program, and the table fills in as it goes.",
    "trace_rows": "{n} steps",
    "trace_cut": "only the first {n} kept",
    "bp_add": "Pause here",
    "bp_drop": "Don't pause here",
    "bp_clear": "Clear all pauses",
    "r_paused": "Paused at line {n}.",
    "r_paused_hand": "Paused.",
    "h_tidy": "Tidy up",
    "h_tidy_tip": "Lay out every shape and arrow the way a pseudocode chart is drawn",
    "h_tidied": "Tidied up: {n} shapes moved.",
    "h_tidy_none": "Nothing to tidy yet.",
    "h_tidy_done": "Already tidy.",
    "h_write": "As text",
    "h_write_tip": "Show the pseudocode this drawing makes",
    "h_into_box": "Put it in the box",
    "h_into_box_tip": "Put this in the pseudocode box, replacing what's there. The drawing stays.",
    "s_no": "Leave it",
    "s_stop_head": "It is still running",
    "s_stop_said": "A new chart replaces the running program, so the run will stop.",
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
    "shapes_for_hint": "Which shape each kind of step is drawn as. What the step does stays the same.",
    "size": "Size",
    "width": "Width",
    "height": "Height",
    "turn": "Turn",
    "fit_words": "Fit the words",
    "colors_here": "Colors",
    "odd_shape": "Cannot draw {pair} -- see --help.",
    "mode_code": "Text",
    "mode_hand": "Drawing",
    "mode_lang": "Code",
    # ---- a program told in plain words, and the pseudocode it was read as
    "told_head": "Updated pseudocode",
    "told_tip": "Your words, read as pseudocode. The chart is drawn from this.",
    "told_yours": "What you wrote",
    # ---- writing the program in a language, read back into pseudocode
    "lang_head": "Your code",
    "lang_pick": "The language: found from the code, or pick one",
    "lang_auto": "Detect the language",
    "lang_auto_is": "Detected: {lang}",
    "lang_file_add": "Add a file",
    "lang_file_tip": "Double-click to rename",
    "lang_file_drop": "Remove this file",
    "lang_top": "Most important · {n} of {all}",
    "lang_more": "+{n} more",
    "lang_more_tip": "Every file, to find and open",
    "lang_less": "Hide the list",
    "lang_find": "Find a file",
    "lang_count": "{n} files",
    "lang_list_read": "Read when you build · {n}",
    "lang_list_rest": "Also in the folder · {n}",
    "lang_list_none": "No file has that in its name or folder.",
    "lang_list_bring": "Opens it, and reads it with the rest when you build",
    "lang_drop_ask": "Remove {name}?",
    "lang_drop_said": "Its code goes with it.",
    "lang_place": "Write or paste a program in Python, Java, C#, C++, JavaScript, TypeScript, C, Kotlin, Swift, Go or Rust, then press Build.",
    "lang_stale": "The pseudocode has changed since.",
    "lang_rewrite": "Rewrite as {lang}",
    "lang_rewrite_tip": "Replace the code with the pseudocode, written in {lang}",
    "lang_made": "Made from your code. Edit it under Text.",
    "lang_line": "Line {n}: {said}",
    "lang_check": "Check",
    "lang_check_tip": "Read the code and say if anything's wrong with it",
    "lang_fix": "Put in {what}",
    "lang_fix_at": "Put {what} in at line {line}",
    "lang_fix_many": "Put in the {n} missing {what}",
    "lang_fix_tip": "Ctrl+Z takes it back out",
    "lang_fix_cut": "Take out {what}",
    "lang_fix_cut_at": "Take out {what} on line {line}",
    "lang_fix_change": "Change {word} to {instead}",
    "lang_fix_change_at": "Change {word} to {instead} on line {line}",
    "lang_fix_indent": "Line up line {line}",
    "lang_fix_call": "Make it {name}(…)",
    "lang_fix_split": "Put the rest of the line on a line of its own",
    "lang_fix_split_at": "Put the rest of line {line} on a line of its own",
    "lang_fixing": "Fixing bugs and issues",
    "lang_fixed_one": "Fixed 1 mistake",
    "lang_fixed_many": "Fixed {n} mistakes",
    "lang_fixed_tip": "See what was wrong, and what was done about it",
    "lang_fixed_undo": "Put it back as it was",
    "lang_reading": "Reading the code",
    "lang_finding": "Finding bugs and issues",
    "lang_listing": "Listing what is left",
    "lang_too_big": "This is too big an error to fix. Here is everything that needs a look:",
    "lang_left_one": "1 problem couldn't be fixed:",
    "lang_left_many": "{n} problems couldn't be fixed:",
    "lang_list_more": "…and more, not shown here.",
    "lang_put_found": "Fix the {n} it found anyway",
    "cm_empty": "Write some code first.",
    "cm_expected": "expected {what} here.",
    "cm_ended": "the code stops before it's finished.",
    "cm_odd": "didn't expect {bit} here.",
    "cm_indent": "the indenting doesn't line up.",
    "cm_open": "a quote or a comment is never closed.",
    "cm_lists": "lists like this can't be drawn yet.",
    "cm_class": "classes and objects can't be drawn.",
    "cm_lambda": "a function with no name can't be drawn.",
    "cm_nested_fn": "a function inside a function can't be drawn.",
    "cm_break": "break only works at the top or foot of a loop.",
    "cm_continue": "continue can't be drawn.",
    "cm_input_where": "put what's typed into a variable first.",
    "cm_twice": "{name} is defined twice.",
    "cm_other": "{bit} can't be drawn.",
    "cm_wont_run": "Line {n}: {bit} is drawn, but can't be run.",
    "cm_if_wrong": "If {what} happens here, the code does this instead:",
    "cm_an_error": "an error",
    "add_shape": "Add a shape",
    "hand_hint": "Drag shapes around. Click one, then Connect, then the next shape.",
    "words_in": "Words in the shape",
    "connect": "Connect",
    "connect_now": "Now click the shape it goes to.",
    "goes_to": "Goes to",
    "nothing_yet": "nothing yet",
    "delete": "Delete",
    "check": "Check the design",
    "checked_good": "No problems found.",
    "problems": "{n} to look at",
    "problems_more": "and {n} more",
    "h_too_many": "Too many shapes (limit {n})",
    "h_info": "How to draw",
    "h_add_how": "Click a shape to add it below the one you're on, or drag it onto the paper. Basic, Flow, Data and Other have more shapes.",
    "h_mouse": "Mouse and touch",
    "h_keys": "Keys",
    "h_all_keys": "All keyboard shortcuts",
    "hm_pick": "Pick a shape or an arrow",
    "hm_move": "Move a shape, or every selected one",
    "hm_size": "Resize the picked shape",
    "hm_turn": "Turn the picked shape to any angle (Shift: 15° steps)",
    "hm_join": "Draw an arrow to another shape",
    "hm_type": "Type in a shape or on an arrow",
    "hm_menu": "See everything you can do to it",
    "hm_zoom": "Zoom in or out",
    "hm_rule": "Use the shape the rules suggest, or keep this one (amber mark)",
    "hm_select": "Choose Select at the bottom, then drag across the paper to select shapes, even with a finger.",
    "many_head": "{n} shapes selected",
    "as_chart": "Chart",
    "untitled": "Untitled",
    "p_no_start": "Nothing starts the flow: every shape has an arrow in.",
    "p_many_starts": "{n} shapes have nothing leading in. A flowchart starts in one place.",
    "p_start_kind": "The first shape should be a Start / End ({shape}).",
    "p_no_end": "There's no End ({shape}) for the flow to stop at.",
    "p_unreached": "Nothing leads to this shape.",
    "p_dead_end": "Nothing leaves this shape, and it isn't an End.",
    "p_decision_out": "A decision needs at least two ways out. This one has {n}.",
    "p_one_out": "This shape has {n} ways out. Only a decision can have two.",
    "p_same_labels": "Two ways out say the same thing.",
    "p_no_label": "Every way out of a decision needs a label.",
    "p_trapped": "From here the flow can never reach an End.",
    "p_empty": "This shape has nothing written in it.",
    "p_overlap": "This shape is on top of another one.",
    "p_alone": "This shape is not joined to anything.",
    "p_line_through": "A line runs through this shape. Move one of them a little.",
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
    "hf_join": "Join it on from the shape above",
    "hf_join_all": "Join them on from the shapes above",
    "hf_out": "Draw its other way out",
    "hf_decide": "Make it a decision",
    "hf_drop_way": "Take off the extra arrows",
    "hf_name_way": "Write on the arrow",
    "hp_next": "Add the next step",
    "hp_what_next": "What comes next?",
    "hp_into": "Put a step in it",
    "m_colors": "Colors", "m_format": "Format shape…", "m_more_shapes": "More shapes",
    "sg_basic": "Basic", "sg_flow": "Flow", "sg_data": "Data", "sg_other": "Other",
    "hr_head": "Shape rules",
    "hr_says": "This looks like “{role}”. The rules use the {shape} for that.",
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
    "mv_said": "Building again resets the layout, so moved blocks go back. Undo can bring them back.",
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
    "pz_broke": "It stopped early. It was given {give}.",
    "pz_none": "There is nothing to check yet.",
    "pz_locked": "Solve {n} more to open these",
    "pz_done": "{done} of {all} solved",
    "pz_nothing": "(nothing)",
    "pz_brief": "The puzzle",
    "games": "Games",
    "games_tip": "Games to play, and to watch as a flowchart while you do",
    "gm_head": "Games",
    "gm_small": "Quick games",
    "gm_big": "Big games",
    "gm_charts": "Charts",
    "gm_many": "Multiple",
    "gm_one": "One flowchart",
    "gm_many_tip": "Each module and function is a chart of its own, beside the main one",
    "gm_one_tip": "Every module and function drawn where it is called, so the game is one flowchart",
    "gm_size": "{n} lines · {charts}",
    "gm_charts_n": "{n} charts",
    "gm_chart_one": "one chart",
    "gm_how": "How to play",
    "gm_play": "Play",
    "gm_play_tip": "Run it all at once, to play it",
    "gm_all": "All games",
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
    "eg_lines": "{n} lines",
    "eg_more": "More examples",
    # the five sections of the examples, and the ten in each
    "eg_l1": "Getting started",
    "e_ask": "Ask and Show",
    "e_add": "Add Two Numbers",
    "e_decide": "A Decision",
    "e_oddeven": "Odd or Even",
    "e_count": "Counting",
    "e_while": "A While Loop",
    "e_total": "A Running Total",
    "e_module": "A Module",
    "e_answers": "A Function That Answers",
    "eg_l2": "Decisions and loops",
    "e_grades": "Letter Grades",
    "e_biggest": "The Biggest of Three",
    "e_menu": "A Menu",
    "e_vowel": "Vowel or Not",
    "e_leap": "Leap Year",
    "e_keepasking": "Keep Asking",
    "e_sumevens": "Add Up the Evens",
    "e_countdown": "Countdown",
    "e_guess": "Guess the Number",
    "eg_l3": "Numbers and patterns",
    "e_fizz": "Fizz and Buzz",
    "e_prime": "Is It Prime?",
    "e_gcd": "Greatest Common Factor",
    "e_fib": "The Fibonacci Numbers",
    "e_factorial": "A Factorial",
    "e_minmax": "Lowest and Highest",
    "e_grid": "A Times Table Grid",
    "e_stars": "A Triangle of Stars",
    "eg_l4": "Everyday programs",
    "e_change": "Dollars, Dimes and Pennies",
    "e_temps": "Celsius, Fahrenheit and Kelvin",
    "e_shop": "A Checkout with a Discount",
    "e_report": "A Class Report",
    "e_votes": "Counting Votes",
    "e_quiz": "A Three-Question Quiz",
    "e_login": "Three Tries at a Password",
    "eg_l5": "Bigger projects",
    "e_bank": "A Bank Account",
    "e_gradebook": "A Gradebook",
    "e_paycheck": "Weekly Paychecks",
    "e_vending": "A Vending Machine",
    "e_primelist": "Every Prime up to a Limit",
    "e_weekday": "What Day of the Week?",
    "e_loan": "Paying Off a Loan",
    "e_rps": "Rock, Paper, Scissors",
    "e_library": "Library Checkout System",
    "e_inventory": "Store Inventory Manager",
    "e_tictactoe": "Tic-Tac-Toe",
    "e_weather": "Two Weeks of Weather",
    "e_sortsearch": "Sorting and Searching Scores",
    "e_hailstone": "Hailstone Numbers",
    "e_rainfall": "Rainfall Month by Month",
    "e_savings": "Savings Year by Year",
    "e_classlist": "A Class List of Records",
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
    "o_onechart": "Modules and functions in one chart",
    "o_roomy": "Roomy: more space around every step",
    "o_tight": "Compressed: fewer shapes, packed tightly",
    "o_columns": "Wrap a tall chart into columns",
    "o_steady": "The same drawing every time",
    "o_space": "Spacing", "o_space_tight": "Compressed",
    "o_space_plain": "Normal", "o_space_roomy": "Roomy",
    "tidy_head": "Tidy up options", "t_layout": "Layout", "t_shapes": "Shapes",
    "t_place": "On the paper",
    "t_arrows": "Arrow length", "t_arrows_sub": "In squares, at least",
    "t_turns": "Keep rotation", "t_fit": "Fit shapes to their words",
    "t_even": "Same width for every shape", "t_keep": "Keep",
    "t_stay": "Keep the chart where it is",
    "more": "Options", "more_tip": "More chart options",
    "decide": "Decisions",
    "undo": "Undo", "redo": "Redo",
    "settings": "Settings", "appearance": "Appearance", "panel_side": "Panel side",
    "side_left": "Left", "side_right": "Right", "full_screen": "Full screen",
    "full_on": "Fill the screen", "full_off": "Leave full screen",
    "no_full": "This browser will not go full screen.",
    # the website installed as an app (31-app.js)
    "app_install": "Install as an app",
    "wipe_head": "Start over",
    "wipe_hint": "Clears everything on this page, for a clean slate.",
    "wipe_open": "Clear everything…",
    "wipe_title1": "Clear everything?",
    "wipe_said": "This takes away everything you have made here:",
    "wipe_l_work": "the pseudocode, the chart and its tests",
    "wipe_l_hand": "the drawing you made by hand",
    "wipe_l_code": "the code and all of its files",
    "wipe_l_run": "the run, what it printed and its trace table",
    "wipe_saves": "Saved progress and solved puzzles too",
    "wipe_settings": "Colors, shapes and settings too",
    "wipe_keep": "Keep my work",
    "wipe_next": "Continue…",
    "wipe_title2": "Save it first?",
    "wipe_save_q": "Do you want to save your work before it is cleared?",
    "wipe_save_said": "A copy saved as a file opens again with Files, Open a file.",
    "wipe_save": "Save a copy first",
    "wipe_saved": "Saved a copy as {name}.",
    "wipe_type": "To clear everything, type {word} below. This can't be undone.",
    "wipe_word": "CLEAR",
    "wipe_back": "Go back",
    "wipe_go": "Clear everything",
    "wipe_going": "Clearing…",
    "keep_save": "Save progress first",
    "keep_saved": "Saved in Saved progress, place {n}.",
    "keep_saved_file": "Saved progress is full, so a copy was saved as a file.",
    "open_head": "Open this in place of your work?",
    "open_said": "There is work on the page. Opening this puts it in its place.",
    "open_no": "Cancel",
    "open_yes": "Open it",
    "sync_head_code": "Replace the pseudocode?",
    "sync_head_hand": "Replace the drawing?",
    "sync_head_lang": "Replace the code?",
    "sync_code_from_hand": "The pseudocode has changes of its own, and the drawing has changed since. Going on writes the drawing's program in place of the pseudocode.",
    "sync_code_from_lang": "The pseudocode has changes of its own, and the code has changed since. Going on reads the code into the pseudocode in its place.",
    "sync_hand_from_code": "The drawing has changes of its own, and the pseudocode has changed since. Going on draws the pseudocode's program in place of the drawing.",
    "sync_lang_from_code": "The code here is your own, and the pseudocode has changed since. Going on writes the pseudocode's program as code in its place.",
    "sync_keep": "Keep this one",
    "sync_go": "Replace it",
    "sync_unfinished": "The drawing isn't a whole program yet, so the pseudocode was left as it was.",
    "app_tip": "Opens in its own window, like an app, and works offline",
    "app_ios": "Press Share, then Add to Home Screen.",
    "app_mac": "In Safari's File menu, choose Add to Dock.",
    "app_done": "Installed. It works offline too.",
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
    "c_head": "Export code", "c_write": "Write the code",
    "tr_pick": "The language to translate your code into",
    # (its own words: tr_head is the ground's, 40-land.js, 2026-10-03)
    "tl_head": "Translate the code", "tl_go": "Translate",
    "c_one": "In one file", "c_apart": "Several files",
    "c_files_tip": "One file, or one per chart. A long single chart is split into parts.",
    "c_one_chart": "Too short to split, so it's one file.",
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
    "k_hand": "Drawing",
    "k_lang": "Writing code",
    "k_build": "Build the chart (Drawing: check the design)",
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
    "py_gave_out": "Python stopped part way through drawing this ({err}).",
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
    "e_hailstone_p": program("""
        Start
        Declare Integer n
        Declare Integer steps
        Display "Start from which number?"
        Input n
        steps = 0
        While n <> 1
            If n mod 2 = 0 Then
                n = n div 2
            Else
                n = 3 * n + 1
            End If
            steps = steps + 1
            Display n
        End While
        Display "Steps to reach 1: ", steps
        Stop
    """),
    "e_rainfall_p": program("""
        Start
        Declare Real total
        Declare String wettest
        rain = {"Jan": 78, "Feb": 52, "Mar": 61, "Apr": 45, "May": 30, "Jun": 12}
        Display "Rainfall in mm: ", rain
        total = 0
        wettest = "Jan"
        For Each month In rain
            total = total + rain[month]
            If rain[month] > rain[wettest] Then
                wettest = month
            End If
        End For
        Display "Average: ", round(total / length(rain), 1), " mm"
        Display "Wettest month: ", wettest
        Stop
    """),
    "e_savings_p": program("""
        Start
        Declare Real deposit
        Declare Real rate
        Declare Integer years
        Declare Real balance
        Display "How much to start with?"
        Input deposit
        Display "Interest rate, in percent?"
        Input rate
        Display "For how many years?"
        Input years
        balance = deposit
        For year = 1 To years
            balance = grow(balance, rate)
            Display "Year ", year, ": ", round(balance, 2)
        End For
        Display "Money made: ", round(balance - deposit, 2)
        Display "Years to double it: ", yearsToDouble(deposit, rate)
        Stop

        Function grow(amount, percent)
            Return amount + amount * percent / 100
        End Function

        Function yearsToDouble(amount, percent)
            Declare Integer count
            Declare Real now
            If percent <= 0 Then
                Return 0
            End If
            count = 0
            now = amount
            While now < amount * 2
                now = grow(now, percent)
                count = count + 1
            End While
            Return count
        End Function
    """),
    "e_classlist_p": program("""
        Start
        Declare Integer i
        Declare Real total
        names = ["Ana", "Ben", "Cy", "Dee", "Eli", "Fay"]
        marks = [88, 72, 95, 64, 79, 91]
        pupils = []
        For i = 0 To length(names) - 1
            Call append(pupils, makePupil(names[i], marks[i]))
        End For
        total = 0
        best = pupils[0]
        For Each p In pupils
            Display p.name, ": ", p.mark
            total = total + p.mark
            If p.mark > best.mark Then
                best = p
            End If
        End For
        Display "Class average: ", round(total / length(pupils), 1)
        Display "Top of the class: ", best.name
        Stop

        Function makePupil(name, mark)
            one = New Pupil
            one.name = name
            one.mark = mark
            Return one
        End Function
    """),
    "e_library_p": program("""
        Start
        Declare Integer choice
        Declare Integer at
        Declare String title
        shelf = []
        Call append(shelf, newBook("Charlotte's Web", "E. B. White"))
        Call append(shelf, newBook("Hatchet", "Gary Paulsen"))
        Call append(shelf, newBook("Holes", "Louis Sachar"))
        Call append(shelf, newBook("Wonder", "R. J. Palacio"))
        Do
            Display "1 list books  2 check out  3 return  4 quit"
            Input choice
            Select Case choice
                Case 1
                    Call listBooks(shelf)
                Case 2
                    Display "Which title would you like?"
                    Input title
                    at = findBook(shelf, title)
                    If at = -1 Then
                        Display "There is no book called ", title
                    Else If shelf[at].out Then
                        Display title, " is already checked out"
                    Else
                        shelf[at].out = True
                        Display "You checked out ", shelf[at].title
                    End If
                Case 3
                    Display "Which title are you returning?"
                    Input title
                    at = findBook(shelf, title)
                    If at = -1 Then
                        Display "That book is not from this library"
                    Else If Not shelf[at].out Then
                        Display shelf[at].title, " was not checked out"
                    Else
                        shelf[at].out = False
                        Display "Thank you for returning ", shelf[at].title
                    End If
                Case 4
                    Display "Goodbye"
                Case Else
                    Display "Pick 1, 2, 3 or 4"
            End Select
        Until choice = 4
        Display "Books still checked out: ", countOut(shelf)
        Stop

        Function newBook(title, author)
            one = New Book
            one.title = title
            one.author = author
            one.out = False
            Return one
        End Function

        Function Integer findBook(books, title)
            For i = 0 To length(books) - 1
                If toLower(books[i].title) = toLower(title) Then
                    Return i
                End If
            End For
            Return -1
        End Function

        Module listBooks(books)
            For Each b In books
                If b.out Then
                    Display b.title, " by ", b.author, " (checked out)"
                Else
                    Display b.title, " by ", b.author, " (on the shelf)"
                End If
            End For
        End Module

        Function Integer countOut(books)
            Declare Integer n
            n = 0
            For Each b In books
                If b.out Then
                    n = n + 1
                End If
            End For
            Return n
        End Function
    """),
    "e_inventory_p": program("""
        Start
        Declare Integer choice
        Declare Integer amount
        Declare String item
        stock = {"apples": 40, "bread": 12, "milk": 6, "eggs": 30}
        prices = {"apples": 0.5, "bread": 2.25, "milk": 3.1, "eggs": 0.3}
        Do
            Display "1 show stock  2 sell  3 restock  4 quit"
            Input choice
            Select Case choice
                Case 1
                    Call showStock(stock, prices)
                Case 2
                    Display "Sell which item?"
                    Input item
                    If Not hasItem(stock, item) Then
                        Display "We do not sell ", item
                    Else
                        Display "How many?"
                        Input amount
                        If amount <= 0 Then
                            Display "Sell at least one"
                        Else If amount > stock[item] Then
                            Display "Only ", stock[item], " left"
                        Else
                            stock[item] = stock[item] - amount
                            Display "Sold ", amount, " ", item, " for $", round(amount * prices[item], 2)
                        End If
                    End If
                Case 3
                    Display "Restock which item?"
                    Input item
                    If Not hasItem(stock, item) Then
                        Display "We do not sell ", item
                    Else
                        Display "How many came in?"
                        Input amount
                        If amount <= 0 Then
                            Display "A delivery has at least one"
                        Else
                            stock[item] = stock[item] + amount
                            Display "There are now ", stock[item], " ", item
                        End If
                    End If
                Case 4
                    Display "Closing up"
                Case Else
                    Display "Pick 1, 2, 3 or 4"
            End Select
        Until choice = 4
        Display "The stock is worth $", worth(stock, prices)
        Stop

        Module showStock(stock, prices)
            For Each name In stock
                If stock[name] < 10 Then
                    Display name, ": ", stock[name], " at $", prices[name], " -- running low"
                Else
                    Display name, ": ", stock[name], " at $", prices[name]
                End If
            End For
        End Module

        Function Boolean hasItem(stock, item)
            For Each name In stock
                If name = item Then
                    Return True
                End If
            End For
            Return False
        End Function

        Function Real worth(stock, prices)
            Declare Real total
            total = 0
            For Each name In stock
                total = total + stock[name] * prices[name]
            End For
            Return round(total, 2)
        End Function
    """),
    "e_tictactoe_p": program("""
        Start
        Declare Integer move
        Declare Integer turns
        Declare String player
        Declare String winner
        board = [" ", " ", " ", " ", " ", " ", " ", " ", " "]
        player = "X"
        winner = ""
        turns = 0
        While winner = "" And turns < 9
            Call showBoard(board)
            Display "Player ", player, ", pick a square from 1 to 9"
            Input move
            While move < 1 Or move > 9
                Display "The squares go from 1 to 9"
                Input move
            End While
            If board[move - 1] <> " " Then
                Display "That square is taken"
            Else
                board[move - 1] = player
                turns = turns + 1
                If hasWon(board, player) Then
                    winner = player
                Else If player = "X" Then
                    player = "O"
                Else
                    player = "X"
                End If
            End If
        End While
        Call showBoard(board)
        If winner = "" Then
            Display "It is a draw"
        Else
            Display "Player ", winner, " wins!"
        End If
        Stop

        Module showBoard(cells)
            For row = 0 To 2
                Display " ", cells[row * 3], " | ", cells[row * 3 + 1], " | ", cells[row * 3 + 2]
                If row < 2 Then
                    Display "---+---+---"
                End If
            End For
        End Module

        Function Boolean hasWon(cells, mark)
            rows = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
            For Each three In rows
                If cells[three[0]] = mark And cells[three[1]] = mark And cells[three[2]] = mark Then
                    Return True
                End If
            End For
            Return False
        End Function
    """),
    "e_weather_p": program("""
        Start
        Declare Real average
        Declare Integer above
        Declare Integer streak
        Declare Integer longest
        highs = [61, 64, 70, 73, 69, 66, 72, 78, 81, 79, 75, 68, 63, 67]
        Display "Daily highs: ", highs
        average = mean(highs)
        Display "Average high: ", round(average, 1)
        Display "Warmest day: ", largest(highs), "   Coolest day: ", smallest(highs)
        above = 0
        streak = 0
        longest = 0
        For day = 1 To length(highs)
            If highs[day - 1] > average Then
                above = above + 1
                streak = streak + 1
                If streak > longest Then
                    longest = streak
                End If
            Else
                streak = 0
            End If
            Display "Day ", day, ": ", bar(highs[day - 1]), " ", highs[day - 1]
        End For
        Display above, " days were warmer than average"
        Display "The longest warm spell lasted ", longest, " days"
        Stop

        Function Real mean(values)
            Declare Real total
            total = 0
            For Each v In values
                total = total + v
            End For
            Return total / length(values)
        End Function

        Function Integer largest(values)
            Declare Integer best
            best = values[0]
            For Each v In values
                If v > best Then
                    best = v
                End If
            End For
            Return best
        End Function

        Function Integer smallest(values)
            Declare Integer best
            best = values[0]
            For Each v In values
                If v < best Then
                    best = v
                End If
            End For
            Return best
        End Function

        Function String bar(Integer degrees)
            Declare String stars
            stars = ""
            For i = 1 To degrees div 5
                stars = stars + "*"
            End For
            Return stars
        End Function
    """),
    "e_sortsearch_p": program("""
        Start
        Declare Integer target
        Declare Integer at
        Declare Integer swaps
        scores = [72, 95, 64, 88, 79, 91, 57, 83]
        Display "Scores as they came in: ", scores
        swaps = bubbleSort(scores)
        Display "Sorted: ", scores
        Display "The sort took ", swaps, " swaps"
        Display "Which score should I look for?"
        Input target
        at = binarySearch(scores, target)
        If at = -1 Then
            Display target, " is not one of the scores"
        Else
            Display target, " is number ", at + 1, " of ", length(scores), " from the bottom"
        End If
        Stop

        Function Integer bubbleSort(values)
            Declare Integer swaps
            Declare Integer temp
            Declare Boolean swapped
            swaps = 0
            Do
                swapped = False
                For i = 0 To length(values) - 2
                    If values[i] > values[i + 1] Then
                        temp = values[i]
                        values[i] = values[i + 1]
                        values[i + 1] = temp
                        swaps = swaps + 1
                        swapped = True
                    End If
                End For
            Until Not swapped
            Return swaps
        End Function

        Function Integer binarySearch(values, target)
            Declare Integer low
            Declare Integer high
            Declare Integer middle
            low = 0
            high = length(values) - 1
            While low <= high
                middle = (low + high) div 2
                If values[middle] = target Then
                    Return middle
                Else If values[middle] < target Then
                    low = middle + 1
                Else
                    high = middle - 1
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
    # ---- the games (37-games.js): a name, a line saying what it is, how
    # to play it, and the program -- written in modules, so it is a
    # chart to each one, or one chart with the option that draws every
    # module where it is called.  Smallest first; the last four are big.
    "g_coin": "Coin Toss",
    "g_coin_d": "Call heads or tails, five tosses in a row",
    "g_coin_h": "Call each toss before the coin lands: type 1 for heads or 2 for tails. There are five tosses. How many can you call right?",
    "g_highlow": "Higher or Lower",
    "g_highlow_d": "Guess whether the next card will beat this one",
    "g_highlow_h": "A card is turned over. Type 1 if you think the next card will be higher, or 2 if lower. Aces are low. A wrong guess costs one of your 3 lives, and there are ten cards in all.",
    "g_sticks": "Twenty-One Sticks",
    "g_sticks_d": "Take 1, 2 or 3 sticks, and don't take the last",
    "g_sticks_h": "There are 21 sticks. You and the computer take turns taking 1, 2 or 3 of them, and whoever takes the last stick loses. The computer knows a trick. Can you work it out?",
    "g_dice": "Dice Duel",
    "g_dice_d": "Roll two dice against the computer, first to 3 rounds",
    "g_dice_h": "Press Enter to roll two dice, then the computer rolls its two. The higher total takes the round, and doubles count twice. The first to win 3 rounds wins the duel.",
    "g_hangman": "Hangman",
    "g_hangman_d": "Find the hidden word one letter at a time",
    "g_hangman_h": "Guess the hidden word one letter at a time. Each wrong letter adds a piece to the drawing, and six wrong letters end the game.",
    "g_codebreak": "Code Breaker",
    "g_codebreak_d": "Crack a secret 4-digit code in 10 guesses",
    "g_codebreak_h": "The computer picks a code of 4 digits, each from 1 to 6. Type a guess like 1234. You are told how many digits are right and in the right place, and how many are right but in the wrong place. Crack it in 10 guesses.",
    "g_dungeon": "Dungeon Escape",
    "g_dungeon_d": "A text adventure with a lamp, a key, a troll and gold",
    "g_dungeon_h": "Walk through the dungeon by typing n, s, e or w. Type look to look around, take to pick something up and bag to see what you carry. Find the gold and bring it back out through the gate before your torch burns out, and watch out for the troll.",
    "g_connect": "Connect Four",
    "g_connect_d": "Drop pieces to get four in a row before the computer",
    "g_connect_h": "You are X and the computer is O. Type a column from 1 to 7 to drop a piece into it. Four in a row wins: across, up and down, or on a slant.",
    "g_blackjack": "Blackjack",
    "g_blackjack_d": "Beat the dealer to 21 without going over",
    "g_blackjack_h": "Bet some of your 100 chips. Then type 1 to take another card (hit), 2 to stop (stand) or 3 to double your bet for one last card. Get closer to 21 than the dealer without going over. J, Q and K count 10, and an A counts 1 or 11.",
    "g_battleship": "Battleship",
    "g_battleship_d": "Sink the enemy fleet before it sinks yours",
    "g_battleship_h": "Both sides hide three ships on a 6 by 6 sea. Fire by typing a letter and a number, like B4. X is a hit and o is a miss. Sink every enemy ship before the enemy sinks yours.",
    "g_math": "Quick Math",
    "g_math_d": "Eight sums against the clock, with a bonus for each right answer in a row",
    "g_math_h": "Eight sums come up one at a time: adding, taking away and times tables. Type each answer. A right answer scores one point more than the last one in a row did, so keep a streak going.",
    "g_pig": "Pig",
    "g_pig_d": "Roll as often as you dare, but a 1 loses the lot",
    "g_pig_h": "Roll the die as many times as you like on your turn, adding up what you roll. Type r to roll again or h to hold and bank your points. Roll a 1 and you lose everything from that turn. The computer plays too, and the first to 50 wins.",
    "g_lander": "Lunar Lander",
    "g_lander_d": "Burn just enough fuel to touch down gently on the moon",
    "g_lander_h": "You start 500 m above the moon, falling. Each second, type how much fuel to burn, from 0 to 20: the more you burn, the more you slow down, but the fuel runs out. Touch down at 5 m a second or less to land safely.",
    "g_mines": "Minesweeper",
    "g_mines_d": "Open every safe square of a minefield, using the numbers as clues",
    "g_mines_h": "Seven mines are hidden in a field of 6 by 6 squares. Type a square like B4 to open it. A number tells you how many of the squares around it hold a mine, and an empty square opens all the squares around it. Type F and a square, like FB4, to put a flag on a square you are sure is a mine, or to take the flag off again. Open every square without a mine to win.",
    "g_coin_p": program("""
        Start
        Declare Integer pick
        Declare Integer side
        Declare Integer score
        score = 0
        For toss = 1 To 5
            Display "Toss ", toss, " of 5. Call it: 1 for heads, 2 for tails"
            Input pick
            While pick < 1 Or pick > 2
                Display "Type 1 for heads or 2 for tails"
                Input pick
            End While
            side = random(1, 2)
            Display "It lands on ", sideName(side), "!"
            If pick = side Then
                score = score + 1
                Display "You called it"
            Else
                Display "Not this time"
            End If
        End For
        Display "You called ", score, " out of 5"
        If score >= 4 Then
            Display "What luck!"
        End If
        Stop

        Function String sideName(Integer side)
            Declare String name
            If side = 1 Then
                name = "heads"
            Else
                name = "tails"
            End If
            Return name
        End Function
    """),
    "g_highlow_p": program("""
        Start
        Declare Integer card
        Declare Integer nextCard
        Declare Integer pick
        Declare Integer points
        Declare Integer lives
        Declare Integer turn
        card = random(1, 13)
        points = 0
        lives = 3
        turn = 0
        Display "Will the next card be higher or lower? Aces are low. You have 3 lives"
        While turn < 10 And lives > 0
            turn = turn + 1
            Display "Card ", turn, " of 10 is the ", cardName(card), ". Is the next one 1 higher or 2 lower?"
            Input pick
            While pick < 1 Or pick > 2
                Display "Type 1 for higher or 2 for lower"
                Input pick
            End While
            nextCard = random(1, 13)
            Display "The next card is the ", cardName(nextCard)
            If nextCard = card Then
                Display "The same again! That one does not count"
            Else If (pick = 1 And nextCard > card) Or (pick = 2 And nextCard < card) Then
                points = points + 1
                Display "Right! Points: ", points
            Else
                lives = lives - 1
                Display "Wrong! Lives left: ", lives
            End If
            card = nextCard
        End While
        Display "Game over. You scored ", points, " points"
        Call showRating(points)
        Stop

        Function String cardName(Integer n)
            names = ["Ace", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King"]
            Return names[n - 1]
        End Function

        Module showRating(Integer points)
            If points >= 8 Then
                Display "A card shark!"
            Else If points >= 5 Then
                Display "Well played"
            Else
                Display "Better luck next time"
            End If
        End Module
    """),
    "g_sticks_p": program("""
        Start
        Declare Integer sticks
        Declare Integer take
        Declare Integer first
        Declare Boolean yourTurn
        sticks = 21
        Display "There are 21 sticks. Take 1, 2 or 3 at a time. Whoever takes the last stick loses"
        Display "Who goes first? 1 for you, 2 for the computer"
        Input first
        While first < 1 Or first > 2
            Display "Type 1 or 2"
            Input first
        End While
        yourTurn = first = 1
        While sticks > 0
            Call showSticks(sticks)
            If yourTurn Then
                Display "How many will you take?"
                Input take
                While take < 1 Or take > 3 Or take > sticks
                    Display "Take 1, 2 or 3, and no more than there are"
                    Input take
                End While
            Else
                take = computerTakes(sticks)
                Display "The computer takes ", take
            End If
            sticks = sticks - take
            yourTurn = Not yourTurn
        End While
        If yourTurn Then
            Display "The computer took the last stick. You win!"
        Else
            Display "You took the last stick, so the computer wins"
            Display "There is a trick to it. Watch how many sticks the computer leaves you"
        End If
        Stop

        Module showSticks(Integer left)
            Declare String row
            row = ""
            For i = 1 To left
                row = row + "|"
            End For
            Display row, "  (", left, " left)"
        End Module

        Function Integer computerTakes(Integer left)
            Declare Integer amount
            amount = (left - 1) mod 4
            If amount = 0 Then
                amount = random(1, 3)
            End If
            If amount > left Then
                amount = left
            End If
            Return amount
        End Function
    """),
    "g_dice_p": program("""
        Start
        Declare Integer myWins
        Declare Integer cpuWins
        Declare Integer turn
        Declare Integer a
        Declare Integer b
        Declare Integer mine
        Declare Integer theirs
        Declare String ready
        myWins = 0
        cpuWins = 0
        turn = 0
        Display "Dice Duel: the higher pair of dice wins the round. Doubles score twice. First to 3 wins"
        While myWins < 3 And cpuWins < 3
            turn = turn + 1
            Display "Round ", turn, ". Press Enter to roll"
            Input ready
            a = rollDie()
            b = rollDie()
            mine = scoreOf(a, b)
            Call showRoll("You", a, b, mine)
            a = rollDie()
            b = rollDie()
            theirs = scoreOf(a, b)
            Call showRoll("The computer", a, b, theirs)
            If mine > theirs Then
                myWins = myWins + 1
                Display "You take the round!"
            Else If theirs > mine Then
                cpuWins = cpuWins + 1
                Display "The computer takes the round"
            Else
                Display "A tie, so nobody scores"
            End If
            Display "Rounds won: you ", myWins, ", the computer ", cpuWins
        End While
        If myWins = 3 Then
            Display "You win the duel!"
        Else
            Display "The computer wins the duel"
        End If
        Stop

        Function Integer rollDie()
            Return random(1, 6)
        End Function

        Function Integer scoreOf(Integer first, Integer second)
            Declare Integer points
            points = first + second
            If first = second Then
                points = points * 2
            End If
            Return points
        End Function

        Module showRoll(String who, Integer first, Integer second, Integer points)
            Display who, " rolled ", first, " and ", second, " for ", points, " points"
            If first = second Then
                Display "Doubles! They count twice"
            End If
        End Module
    """),
    "g_hangman_p": program("""
        Start
        Declare String secret
        Declare String tried
        Declare String letter
        Declare Integer misses
        Declare Boolean won
        words = ["planet", "jungle", "rocket", "pirate", "wizard", "castle", "dragon", "guitar", "puzzle", "volcano", "penguin", "blanket"]
        secret = words[random(0, length(words) - 1)]
        tried = ""
        misses = 0
        won = False
        Display "Hangman! Guess the word one letter at a time. Six wrong guesses and you lose"
        While misses < 6 And Not won
            Call showGallows(misses)
            Display "The word: ", masked(secret, tried)
            Display "Guess a letter"
            Input letter
            letter = toLower(letter)
            If length(letter) <> 1 Then
                Display "One letter at a time, please"
            Else If contains(tried, letter) Then
                Display "You already tried ", letter
            Else
                tried = tried + letter
                If contains(secret, letter) Then
                    Display "Yes, there is a ", letter
                Else
                    misses = misses + 1
                    Display "No ", letter, ". Wrong guesses: ", misses, " of 6"
                End If
                won = allFound(secret, tried)
            End If
        End While
        Call showGallows(misses)
        If won Then
            Display "You got it: ", secret, "! You win"
        Else
            Display "Out of guesses. The word was ", secret
        End If
        Stop

        Function String masked(String word, String letters)
            Declare String shown
            Declare String ch
            shown = ""
            For i = 0 To length(word) - 1
                ch = substring(word, i, i + 1)
                If contains(letters, ch) Then
                    shown = shown + ch + " "
                Else
                    shown = shown + "_ "
                End If
            End For
            Return shown
        End Function

        Function Boolean allFound(String word, String letters)
            Declare Boolean found
            found = True
            For i = 0 To length(word) - 1
                If Not contains(letters, substring(word, i, i + 1)) Then
                    found = False
                End If
            End For
            Return found
        End Function

        Module showGallows(Integer wrong)
            heads = ["   ", " O ", " O ", " O ", " O ", " O ", " O "]
            bodies = ["   ", "   ", " | ", "-| ", "-|-", "-|-", "-|-"]
            legs = ["   ", "   ", "   ", "   ", "   ", "|  ", "| |"]
            Display "  +---+"
            Display "  |   |"
            Display "  |  ", heads[wrong]
            Display "  |  ", bodies[wrong]
            Display "  |  ", legs[wrong]
            Display "==+=="
        End Module
    """),
    "g_codebreak_p": program("""
        Start
        Declare String code
        Declare String guess
        Declare Boolean ok
        Declare Boolean cracked
        Declare Integer exact
        Declare Integer near
        Declare Integer tries
        code = makeCode()
        tries = 0
        cracked = False
        Display "I am thinking of a 4-digit code. Each digit is from 1 to 6, and digits can repeat"
        Display "After each guess I say how many digits are in the right place, and how many are right but in the wrong place"
        While Not cracked And tries < 10
            tries = tries + 1
            Display "Guess ", tries, " of 10:"
            Input guess
            ok = isValid(guess)
            While Not ok
                Display "Type 4 digits from 1 to 6, like 1234"
                Input guess
                ok = isValid(guess)
            End While
            exact = rightPlace(code, guess)
            near = sharedDigits(code, guess) - exact
            Display guess, "   right place: ", exact, "   wrong place: ", near
            If exact = 4 Then
                cracked = True
            End If
        End While
        If cracked Then
            Display "You cracked it in ", tries, " guesses!"
        Else
            Display "Out of guesses. The code was ", code
        End If
        Stop

        Function String makeCode()
            Declare String made
            made = ""
            For i = 1 To 4
                made = made + random(1, 6)
            End For
            Return made
        End Function

        Function Boolean isValid(String text)
            Declare Boolean good
            good = length(text) = 4
            If good Then
                For i = 0 To 3
                    If Not contains("123456", substring(text, i, i + 1)) Then
                        good = False
                    End If
                End For
            End If
            Return good
        End Function

        Function Integer rightPlace(String secret, String tried)
            Declare Integer hits
            hits = 0
            For i = 0 To 3
                If substring(secret, i, i + 1) = substring(tried, i, i + 1) Then
                    hits = hits + 1
                End If
            End For
            Return hits
        End Function

        Function Integer sharedDigits(String secret, String tried)
            Declare Integer both
            Declare Integer inSecret
            Declare Integer inTried
            Declare String digit
            both = 0
            For d = 1 To 6
                digit = "" + d
                inSecret = 0
                inTried = 0
                For i = 0 To 3
                    If substring(secret, i, i + 1) = digit Then
                        inSecret = inSecret + 1
                    End If
                    If substring(tried, i, i + 1) = digit Then
                        inTried = inTried + 1
                    End If
                End For
                If inSecret < inTried Then
                    both = both + inSecret
                Else
                    both = both + inTried
                End If
            End For
            Return both
        End Function
    """),
    "g_dungeon_p": program("""
        Start
        Declare Integer room
        Declare Integer target
        Declare Integer way
        Declare Integer health
        Declare Integer moves
        Declare String command
        Declare Boolean trollHere
        Declare Boolean playing
        items = ["", "", "lamp", "sword", "key", "", "gold"]
        exits = [[1, -1, -1, -1], [5, 0, 3, 2], [-1, 4, 1, -1], [-1, -1, -1, 1], [2, -1, -1, -1], [6, 1, -1, -1], [-1, 5, -1, -1]]
        bag = []
        room = 0
        health = 3
        moves = 0
        trollHere = True
        playing = True
        Display "DUNGEON ESCAPE"
        Display "Find the gold and bring it back out through the gate before your torch burns out"
        Display "Type n, s, e or w to walk, or look, take, bag or help"
        Call describe(room, items, bag)
        While playing
            Display "What now?"
            Input command
            command = toLower(command)
            way = wayOf(command)
            If way >= 0 Then
                target = exits[room][way]
                moves = moves + 1
                If target = -1 Then
                    Display "You can't go that way"
                Else If target = 6 And trollHere Then
                    If contains(bag, "sword") Then
                        Display "The troll blocks the door. You draw your sword, and it runs off howling into the dark!"
                        trollHere = False
                    Else
                        health = health - 1
                        Display "The troll blocks the door and swats you away with one huge hand! Health: ", health
                    End If
                Else If target = 6 And Not contains(bag, "key") Then
                    Display "The door to the north is locked tight. If only you had a key"
                Else
                    room = target
                    Call describe(room, items, bag)
                    If room = 4 And Not contains(bag, "lamp") Then
                        health = health - 1
                        Display "You stumble in the dark and hit your head! Health: ", health
                    End If
                    If room = 5 And trollHere Then
                        Display "A huge troll stands guard in front of the far door!"
                    End If
                End If
            Else If command = "look" Then
                Call describe(room, items, bag)
            Else If command = "take" Then
                Call takeItem(room, items, bag)
            Else If command = "bag" Then
                Call showBag(bag)
            Else If command = "help" Then
                Display "Walk with n, s, e and w. Type look to look around, take to pick something up, and bag to see what you carry"
            Else
                Display "I don't know how to ", command
            End If
            If room = 0 And contains(bag, "gold") Then
                Display "You push open the gate and walk out into the sunshine with the gold. You escaped in ", moves, " moves!"
                playing = False
            Else If health <= 0 Then
                Display "You sink to the cold stone floor. The dungeon wins this time"
                playing = False
            Else If moves >= 40 Then
                Display "Your torch flickers and goes out. You are lost in the dark for good"
                playing = False
            Else If moves = 30 And way >= 0 Then
                Display "Your torch is burning low. Ten moves left!"
            End If
        End While
        Stop

        Function Integer wayOf(String said)
            Declare Integer found
            found = -1
            If said = "n" Then
                found = 0
            Else If said = "s" Then
                found = 1
            Else If said = "e" Then
                found = 2
            Else If said = "w" Then
                found = 3
            End If
            Return found
        End Function

        Module describe(Integer here, things, carried)
            names = ["Gate", "Great Hall", "Library", "Armory", "Cellar", "Troll Bridge", "Treasure Vault"]
            about = ["The iron gate behind you is barred shut. A passage leads north.", "A great hall with doors to the north, east and west. The gate is back to the south.", "Dusty shelves of old books. A trapdoor in the floor leads down to the south, and a door east.", "Racks of rusty weapons line the walls. The only way out is west.", "A damp cellar that smells of mold. A ladder goes back up to the north.", "A narrow stone bridge over a deep chasm, with a heavy door at the far end to the north. The hall is south.", "Chests of treasure glitter all around you. The bridge is back to the south."]
            Display "== ", names[here], " =="
            If here = 4 And Not contains(carried, "lamp") Then
                Display "It is pitch dark in here. You can't see a thing."
            Else
                Display about[here]
                If things[here] <> "" Then
                    Display "You see: ", things[here]
                End If
            End If
        End Module

        Module takeItem(Integer here, things, carried)
            If here = 4 And Not contains(carried, "lamp") Then
                Display "You feel around in the dark, but find nothing"
            Else If things[here] = "" Then
                Display "There is nothing here to take"
            Else
                append(carried, things[here])
                Display "You take the ", things[here]
                things[here] = ""
            End If
        End Module

        Module showBag(carried)
            Declare String packed
            If length(carried) = 0 Then
                Display "Your bag is empty"
            Else
                packed = ""
                For Each thing In carried
                    packed = packed + thing + " "
                End For
                Display "In your bag: ", packed
            End If
        End Module
    """),
    "g_connect_p": program("""
        Start
        Declare Integer col
        Declare Integer row
        Declare Integer moves
        Declare String mark
        Declare String winner
        grid = newBoard()
        moves = 0
        mark = "X"
        winner = ""
        Display "Connect Four! You are X and the computer is O. Drop your pieces to get four in a row"
        Display "Rows, columns and diagonals all count"
        While winner = "" And moves < 42
            Call showBoard(grid)
            If mark = "X" Then
                Display "Your move. Pick a column from 1 to 7"
                Input col
                row = -1
                While row = -1
                    While col < 1 Or col > 7
                        Display "The columns go from 1 to 7"
                        Input col
                    End While
                    row = dropRow(grid, col - 1)
                    If row = -1 Then
                        Display "That column is full. Pick another one"
                        Input col
                    End If
                End While
                col = col - 1
            Else
                col = computerColumn(grid)
                row = dropRow(grid, col)
                Display "The computer drops a piece into column ", col + 1
            End If
            grid[row][col] = mark
            moves = moves + 1
            If fourFrom(grid, row, col, mark) Then
                winner = mark
            Else If mark = "X" Then
                mark = "O"
            Else
                mark = "X"
            End If
        End While
        Call showBoard(grid)
        If winner = "X" Then
            Display "Four in a row! You win!"
        Else If winner = "O" Then
            Display "The computer got four in a row. It wins this time"
        Else
            Display "The board is full. It is a draw"
        End If
        Stop

        Function newBoard()
            rows = []
            For r = 1 To 6
                cells = []
                For c = 1 To 7
                    append(cells, ".")
                End For
                append(rows, cells)
            End For
            Return rows
        End Function

        Module showBoard(board)
            Declare String line
            For r = 0 To 5
                line = "|"
                For c = 0 To 6
                    line = line + " " + board[r][c]
                End For
                Display line, " |"
            End For
            Display "+---------------+"
            Display "  1 2 3 4 5 6 7"
        End Module

        Function Integer dropRow(board, Integer c)
            Declare Integer lowest
            lowest = -1
            For r = 0 To 5
                If board[r][c] = "." Then
                    lowest = r
                End If
            End For
            Return lowest
        End Function

        Function Boolean fourFrom(board, Integer row, Integer col, String piece)
            Declare Integer inLine
            Declare Integer r
            Declare Integer c
            Declare Boolean going
            Declare Boolean found
            found = False
            ways = [[0, 1], [1, 0], [1, 1], [1, -1]]
            For Each way In ways
                inLine = 1
                For sign = -1 To 1 Step 2
                    r = row + way[0] * sign
                    c = col + way[1] * sign
                    going = True
                    While going
                        If r < 0 Or r > 5 Or c < 0 Or c > 6 Then
                            going = False
                        Else If board[r][c] <> piece Then
                            going = False
                        Else
                            inLine = inLine + 1
                            r = r + way[0] * sign
                            c = c + way[1] * sign
                        End If
                    End While
                End For
                If inLine >= 4 Then
                    found = True
                End If
            End For
            Return found
        End Function

        Function Integer computerColumn(board)
            Declare Integer pick
            Declare Integer r
            pick = -1
            marks = ["O", "X"]
            For Each piece In marks
                For c = 0 To 6
                    If pick = -1 Then
                        r = dropRow(board, c)
                        If r >= 0 Then
                            board[r][c] = piece
                            If fourFrom(board, r, c, piece) Then
                                pick = c
                            End If
                            board[r][c] = "."
                        End If
                    End If
                End For
            End For
            While pick = -1
                c = random(0, 6)
                If board[0][c] = "." Then
                    pick = c
                End If
            End While
            Return pick
        End Function
    """),
    "g_blackjack_p": program("""
        Start
        Declare Integer chips
        Declare Integer bet
        Declare Integer choice
        Declare Integer mine
        Declare Integer theirs
        Declare Integer change
        Declare Boolean playing
        Declare Boolean standing
        chips = 100
        playing = True
        Display "Blackjack! Get closer to 21 than the dealer without going over"
        Display "Number cards count as they are, J, Q and K count 10, and an A counts 1 or 11"
        While playing
            deck = newDeck()
            Display "You have ", chips, " chips. How many will you bet?"
            Input bet
            While bet < 1 Or bet > chips
                Display "Bet from 1 to ", chips
                Input bet
            End While
            you = []
            dealer = []
            append(you, pop(deck))
            append(dealer, pop(deck))
            append(you, pop(deck))
            append(dealer, pop(deck))
            standing = False
            While Not standing
                mine = handValue(you)
                If mine >= 21 Then
                    standing = True
                Else
                    Call showTable(you, mine, dealer)
                    Display "1 to hit, 2 to stand, 3 to double down"
                    Input choice
                    While choice < 1 Or choice > 3
                        Display "Type 1, 2 or 3"
                        Input choice
                    End While
                    If choice = 3 And (length(you) > 2 Or bet * 2 > chips) Then
                        Display "You can only double down on your first two cards, with the chips to cover it"
                    Else If choice = 2 Then
                        standing = True
                    Else
                        append(you, pop(deck))
                        If choice = 3 Then
                            bet = bet * 2
                            Display "Bet doubled to ", bet, ", and one card only"
                            standing = True
                        End If
                    End If
                End If
            End While
            mine = handValue(you)
            If mine < 21 Or (mine = 21 And length(you) > 2) Then
                Call dealerPlays(dealer, deck)
            End If
            theirs = handValue(dealer)
            Call showHands(you, mine, dealer, theirs)
            change = settle(mine, length(you), theirs, length(dealer), bet)
            chips = chips + change
            If change > 0 Then
                Display "You win ", change, " chips"
            Else If change < 0 Then
                Display "You lose ", 0 - change, " chips"
            Else
                Display "A push: you get your bet back"
            End If
            If chips = 0 Then
                Display "You are out of chips. The house wins this time"
                playing = False
            Else
                Display "1 to deal again, 2 to cash out"
                Input choice
                While choice < 1 Or choice > 2
                    Display "Type 1 or 2"
                    Input choice
                End While
                playing = choice = 1
            End If
        End While
        Display "You leave the table with ", chips, " chips"
        If chips > 100 Then
            Display "That is ", chips - 100, " more than you sat down with!"
        End If
        Stop

        Function newDeck()
            Declare Integer other
            Declare Integer held
            cards = []
            For i = 0 To 51
                append(cards, i)
            End For
            For i = 51 To 1 Step -1
                other = random(0, i)
                held = cards[i]
                cards[i] = cards[other]
                cards[other] = held
            End For
            Return cards
        End Function

        Function String cardName(Integer card)
            ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
            suits = ["♠", "♥", "♦", "♣"]
            Return ranks[card mod 13] + suits[card div 13]
        End Function

        Function Integer handValue(hand)
            Declare Integer total
            Declare Integer aces
            Declare Integer rank
            total = 0
            aces = 0
            For Each card In hand
                rank = card mod 13 + 1
                If rank = 1 Then
                    total = total + 11
                    aces = aces + 1
                Else If rank > 10 Then
                    total = total + 10
                Else
                    total = total + rank
                End If
            End For
            While total > 21 And aces > 0
                total = total - 10
                aces = aces - 1
            End While
            Return total
        End Function

        Function String handText(hand)
            Declare String shown
            shown = ""
            For Each card In hand
                shown = shown + cardName(card) + " "
            End For
            Return shown
        End Function

        Module showTable(player, Integer total, house)
            Display "Dealer: ", cardName(house[0]), " ??"
            Display "You:    ", handText(player), "(", total, ")"
        End Module

        Module showHands(player, Integer total, house, Integer houseTotal)
            Display "Dealer: ", handText(house), "(", houseTotal, ")"
            Display "You:    ", handText(player), "(", total, ")"
        End Module

        Module dealerPlays(hand, cards)
            Declare Integer total
            Do
                total = handValue(hand)
                If total < 17 Then
                    append(hand, pop(cards))
                End If
            Until total >= 17
        End Module

        Function Integer settle(Integer mine, Integer myCards, Integer theirs, Integer theirCards, Integer stake)
            Declare Integer won
            If mine > 21 Then
                Display "Bust! You went over 21"
                won = 0 - stake
            Else If mine = 21 And myCards = 2 And (theirs <> 21 Or theirCards > 2) Then
                Display "Blackjack! That pays 3 to 2"
                won = stake * 3 div 2
            Else If theirs = 21 And theirCards = 2 And (mine <> 21 Or myCards > 2) Then
                Display "The dealer has blackjack"
                won = 0 - stake
            Else If theirs > 21 Then
                Display "The dealer busts!"
                won = stake
            Else If mine > theirs Then
                won = stake
            Else If mine < theirs Then
                won = 0 - stake
            Else
                won = 0
            End If
            Return won
        End Function
    """),
    "g_battleship_p": program("""
        Start
        Declare String shot
        Declare Integer at
        Declare Integer result
        Declare Integer myLeft
        Declare Integer theirLeft
        Declare Integer turn
        home = emptySea()
        away = emptySea()
        Call placeFleet(home)
        Call placeFleet(away)
        myLeft = 9
        theirLeft = 9
        turn = 0
        Display "Battleship! Each side has three ships, 4, 3 and 2 squares long. Sink theirs before they sink yours"
        Display "S is your ship, X a hit and o a miss. Fire with a letter and a number, like B4"
        While myLeft > 0 And theirLeft > 0
            Call showSeas(home, away)
            turn = turn + 1
            at = -1
            While at = -1
                Display "Turn ", turn, ". Where do you fire?"
                Input shot
                at = squareOf(shot)
                If at = -1 Then
                    Display "Type a letter from A to F and a number from 1 to 6, like B4"
                End If
            End While
            result = fireAt(away, at)
            If result = 2 Then
                Display "Hit!"
            Else If result = 1 Then
                Display "Splash. A miss"
            Else
                Display "You already fired at ", shot
            End If
            theirLeft = shipsLeft(away)
            If theirLeft > 0 Then
                at = enemyAim(home)
                result = fireAt(home, at)
                If result = 2 Then
                    Display "The enemy fires at ", nameOf(at), ". They hit your ship!"
                Else
                    Display "The enemy fires at ", nameOf(at), " and misses"
                End If
                myLeft = shipsLeft(home)
            End If
            Display "Ship squares left: yours ", myLeft, ", theirs ", theirLeft
        End While
        Call showSeas(home, away)
        If theirLeft = 0 Then
            Display "You sank their whole fleet in ", turn, " turns. Victory!"
        Else
            Display "Your fleet is sunk. The enemy wins this battle"
        End If
        Stop

        Function emptySea()
            sea = []
            For i = 1 To 36
                append(sea, ".")
            End For
            Return sea
        End Function

        Module placeFleet(sea)
            Declare Integer row
            Declare Integer col
            Declare Integer across
            Declare Boolean fits
            sizes = [4, 3, 2]
            For Each size In sizes
                fits = False
                While Not fits
                    across = random(0, 1)
                    If across = 1 Then
                        row = random(0, 5)
                        col = random(0, 6 - size)
                    Else
                        row = random(0, 6 - size)
                        col = random(0, 5)
                    End If
                    fits = True
                    For k = 0 To size - 1
                        If sea[(row + k * (1 - across)) * 6 + col + k * across] <> "." Then
                            fits = False
                        End If
                    End For
                End While
                For k = 0 To size - 1
                    sea[(row + k * (1 - across)) * 6 + col + k * across] = "S"
                End For
            End For
        End Module

        Module showSeas(mine, theirs)
            Declare String line
            Declare String cell
            Display "   Your fleet       Enemy waters"
            Display "   1 2 3 4 5 6      1 2 3 4 5 6"
            For r = 0 To 5
                line = substring("ABCDEF", r, r + 1) + "  "
                For c = 0 To 5
                    line = line + mine[r * 6 + c] + " "
                End For
                line = line + "  " + substring("ABCDEF", r, r + 1) + "  "
                For c = 0 To 5
                    cell = theirs[r * 6 + c]
                    If cell = "S" Then
                        cell = "."
                    End If
                    line = line + cell + " "
                End For
                Display line
            End For
        End Module

        Function Integer squareOf(String text)
            Declare Integer row
            Declare Integer col
            Declare Integer square
            square = -1
            If length(text) = 2 Then
                row = indexOf("ABCDEF", toUpper(substring(text, 0, 1)))
                col = indexOf("123456", substring(text, 1, 2))
                If row >= 0 And col >= 0 Then
                    square = row * 6 + col
                End If
            End If
            Return square
        End Function

        Function String nameOf(Integer square)
            Return substring("ABCDEF", square div 6, square div 6 + 1) + (square mod 6 + 1)
        End Function

        Function Integer fireAt(sea, Integer square)
            Declare Integer result
            If sea[square] = "S" Then
                sea[square] = "X"
                result = 2
            Else If sea[square] = "." Then
                sea[square] = "o"
                result = 1
            Else
                result = 0
            End If
            Return result
        End Function

        Function Integer shipsLeft(sea)
            Declare Integer afloat
            afloat = 0
            For Each cell In sea
                If cell = "S" Then
                    afloat = afloat + 1
                End If
            End For
            Return afloat
        End Function

        Function Integer enemyAim(sea)
            Declare Integer row
            Declare Integer col
            near = []
            For i = 0 To 35
                If sea[i] = "X" Then
                    row = i div 6
                    col = i mod 6
                    If row > 0 Then
                        append(near, i - 6)
                    End If
                    If row < 5 Then
                        append(near, i + 6)
                    End If
                    If col > 0 Then
                        append(near, i - 1)
                    End If
                    If col < 5 Then
                        append(near, i + 1)
                    End If
                End If
            End For
            targets = []
            For Each square In near
                If sea[square] = "." Or sea[square] = "S" Then
                    append(targets, square)
                End If
            End For
            If length(targets) = 0 Then
                For i = 0 To 35
                    If sea[i] = "." Or sea[i] = "S" Then
                        append(targets, i)
                    End If
                End For
            End If
            Return targets[random(0, length(targets) - 1)]
        End Function
    """),
    "g_math_p": program("""
        Start
        Declare Integer score
        Declare Integer streak
        Declare Integer best
        Declare Integer answer
        Declare Integer right
        score = 0
        streak = 0
        best = 0
        Display "Quick Math: eight sums. Every right answer in a row scores one more than the last"
        For turn = 1 To 8
            right = askSum(turn)
            Input answer
            If answer = right Then
                streak = streak + 1
                score = score + streak
                Display "Right! That is ", streak, " in a row"
                If streak > best Then
                    best = streak
                End If
            Else
                Display "Not quite: it was ", right
                streak = 0
            End If
        End For
        Call showScore(score, best)
        Stop

        Function Integer askSum(Integer turn)
            Declare Integer a
            Declare Integer b
            Declare Integer kind
            Declare Integer result
            a = random(2, 9 + turn)
            b = random(2, 9)
            kind = random(1, 3)
            If kind = 1 Then
                Display "Sum ", turn, ": what is ", a, " + ", b, "?"
                result = a + b
            Else If kind = 2 Then
                Display "Sum ", turn, ": what is ", a + b, " - ", b, "?"
                result = a
            Else
                Display "Sum ", turn, ": what is ", a, " x ", b, "?"
                result = a * b
            End If
            Return result
        End Function

        Module showScore(Integer score, Integer best)
            Display "Your score: ", score, " points. Longest run of right answers: ", best
            If score >= 30 Then
                Display "A math whiz!"
            Else If score >= 12 Then
                Display "Well done!"
            Else
                Display "Keep practicing and try again"
            End If
        End Module
    """),
    "g_pig_p": program("""
        Start
        Declare Integer mine
        Declare Integer theirs
        mine = 0
        theirs = 0
        Display "Pig: roll as often as you dare. A 1 loses everything you rolled that turn. First to 50 wins"
        While mine < 50 And theirs < 50
            mine = mine + yourTurn(mine)
            Display "Score: you ", mine, ", the computer ", theirs
            If mine < 50 Then
                theirs = theirs + computerTurn(theirs)
                Display "Score: you ", mine, ", the computer ", theirs
            End If
        End While
        If mine >= 50 Then
            Display "You reach 50 first and win!"
        Else
            Display "The computer reaches 50 first and wins"
        End If
        Stop

        Function Integer yourTurn(Integer score)
            Declare Integer kept
            Declare Integer roll
            Declare String choice
            Declare Boolean going
            kept = 0
            going = True
            While going
                roll = random(1, 6)
                If roll = 1 Then
                    Display "You rolled a 1 and lose the ", kept, " points from this turn"
                    kept = 0
                    going = False
                Else
                    kept = kept + roll
                    Display "You rolled ", roll, ". This turn: ", kept, ". In all: ", score + kept
                    If score + kept >= 50 Then
                        going = False
                    Else
                        Display "Type r to roll again, or h to hold"
                        Input choice
                        If choice = "h" Or choice = "H" Then
                            going = False
                        End If
                    End If
                End If
            End While
            Return kept
        End Function

        Function Integer computerTurn(Integer score)
            Declare Integer kept
            Declare Integer roll
            kept = 0
            roll = 0
            While roll <> 1 And kept < 15 And score + kept < 50
                roll = random(1, 6)
                If roll = 1 Then
                    kept = 0
                Else
                    kept = kept + roll
                End If
            End While
            If roll = 1 Then
                Display "The computer rolled a 1 and scores nothing"
            Else
                Display "The computer holds with ", kept, " points"
            End If
            Return kept
        End Function
    """),
    "g_lander_p": program("""
        Start
        Declare Real height
        Declare Real speed
        Declare Integer fuel
        Declare Integer seconds
        Declare Integer burn
        height = 500
        speed = 0
        fuel = 150
        seconds = 0
        Display "Lunar Lander: you are 500 m up and falling. Each second, burn 0 to 20 units of fuel to slow down"
        Display "Touch down at 5 m a second or less to land safely"
        While height > 0
            Call showPanel(seconds, height, speed, fuel)
            burn = askBurn(fuel)
            fuel = fuel - burn
            speed = speed + 1.6 - burn * 0.3
            height = height - speed
            seconds = seconds + 1
        End While
        Call landing(speed, fuel, seconds)
        Stop

        Module showPanel(Integer seconds, Real height, Real speed, Integer fuel)
            Display "Time ", seconds, " s. Height ", round(height), " m. Falling at ", round(speed, 1), " m/s. Fuel ", fuel
        End Module

        Function Integer askBurn(Integer fuel)
            Declare Integer burn
            burn = 0
            If fuel <= 0 Then
                Display "Out of fuel!"
            Else
                Display "How much fuel to burn, from 0 to 20?"
                Input burn
                While burn < 0 Or burn > 20
                    Display "Burn 0 to 20"
                    Input burn
                End While
                If burn > fuel Then
                    Display "Only ", fuel, " left, so that is all you burn"
                    burn = fuel
                End If
            End If
            Return burn
        End Function

        Module landing(Real speed, Integer fuel, Integer seconds)
            If speed <= 5 Then
                Display "The Eagle has landed! Down at ", round(speed, 1), " m/s after ", seconds, " seconds, with ", fuel, " fuel left"
                If speed <= 2 Then
                    Display "A perfect landing!"
                End If
            Else If speed <= 12 Then
                Display "A hard landing at ", round(speed), " m/s. The lander is dented, but you walk away"
            Else
                Display "You hit the surface at ", round(speed), " m/s and make a new crater"
            End If
        End Module
    """),
    "g_mines_p": program("""
        Start
        Declare Integer opened
        Declare Integer safe
        Declare Integer square
        Declare String move
        Declare String said
        Declare Boolean alive
        field = newField()
        shown = newShown()
        Call layMines(field, 7)
        safe = 36 - 7
        opened = 0
        alive = True
        Display "Minesweeper: 7 mines are hidden in a field of 6 by 6. Open every square without a mine"
        Display "Type a square like B4 to open it, or F and a square, like FB4, to flag a mine"
        While alive And opened < safe
            Call showField(field, shown, False)
            Input move
            said = toUpper(move)
            If length(said) = 3 And substring(said, 0, 1) = "F" Then
                square = squareOf(substring(said, 1, 3))
                If square = -1 Then
                    Display "That is not a square. Try something like FB4"
                Else If shown[square] = "." Then
                    shown[square] = "F"
                Else If shown[square] = "F" Then
                    shown[square] = "."
                End If
            Else
                square = squareOf(said)
                If square = -1 Then
                    Display "That is not a square. Try something like B4"
                Else If shown[square] <> "." Then
                    Display "That square is open already, or flagged"
                Else If field[square] = -1 Then
                    alive = False
                Else
                    opened = opened + openFrom(field, shown, square)
                End If
            End If
        End While
        Call showField(field, shown, True)
        If alive Then
            Display "Every safe square is open. You cleared the field!"
        Else
            Display "Boom! That square had a mine under it. Better luck next time"
        End If
        Stop

        Function newField()
            cells = []
            For i = 1 To 36
                append(cells, 0)
            End For
            Return cells
        End Function

        Function newShown()
            cells = []
            For i = 1 To 36
                append(cells, ".")
            End For
            Return cells
        End Function

        Module layMines(field, Integer total)
            Declare Integer laid
            Declare Integer spot
            laid = 0
            While laid < total
                spot = random(0, 35)
                If field[spot] <> -1 Then
                    field[spot] = -1
                    laid = laid + 1
                End If
            End While
            For spot = 0 To 35
                If field[spot] <> -1 Then
                    field[spot] = minesAround(field, spot)
                End If
            End For
        End Module

        Function Integer minesAround(field, Integer spot)
            Declare Integer total
            Declare Integer r
            Declare Integer c
            total = 0
            For dr = -1 To 1
                For dc = -1 To 1
                    r = spot div 6 + dr
                    c = spot mod 6 + dc
                    If r >= 0 And r < 6 And c >= 0 And c < 6 Then
                        If field[r * 6 + c] = -1 Then
                            total = total + 1
                        End If
                    End If
                End For
            End For
            Return total
        End Function

        Function Integer openFrom(field, shown, Integer origin)
            Declare Integer total
            Declare Integer spot
            Declare Integer near
            Declare Integer at
            Declare Integer r
            Declare Integer c
            todo = [origin]
            shown[origin] = textOf(field[origin])
            total = 1
            at = 0
            While at < length(todo)
                spot = todo[at]
                at = at + 1
                If field[spot] = 0 Then
                    For dr = -1 To 1
                        For dc = -1 To 1
                            r = spot div 6 + dr
                            c = spot mod 6 + dc
                            If r >= 0 And r < 6 And c >= 0 And c < 6 Then
                                near = r * 6 + c
                                If shown[near] = "." Then
                                    shown[near] = textOf(field[near])
                                    total = total + 1
                                    append(todo, near)
                                End If
                            End If
                        End For
                    End For
                End If
            End While
            Return total
        End Function

        Function String textOf(Integer mines)
            Declare String text
            text = " "
            If mines > 0 Then
                text = "" + mines
            End If
            Return text
        End Function

        Module showField(field, shown, Boolean all)
            Declare String line
            Display "    1 2 3 4 5 6"
            For r = 0 To 5
                line = substring("ABCDEF", r, r + 1) + " |"
                For c = 0 To 5
                    If all And field[r * 6 + c] = -1 Then
                        line = line + " *"
                    Else
                        line = line + " " + shown[r * 6 + c]
                    End If
                End For
                Display line
            End For
        End Module

        Function Integer squareOf(String text)
            Declare Integer row
            Declare Integer col
            Declare Integer found
            row = -1
            col = -1
            found = -1
            If length(text) = 2 Then
                row = indexOf("ABCDEF", substring(text, 0, 1))
                col = indexOf("123456", substring(text, 1, 2))
            End If
            If row >= 0 And col >= 0 Then
                found = row * 6 + col
            End If
            Return found
        End Function
    """),
    # ---- icons, and a drawing run as what it is: a home walked through,
    # work passed on, data sent, a circuit switched on, a launch
    # (03-icons.js, 11-hand-icons.js, 37-board.js to 39-orbit.js)
    "ic_open": "Icons",
    "ic_open_tip": "People at work, furniture, devices and more",
    "ic_find": "Search icons",
    "ic_none": "No icon matches that.",
    "ic_all": "All",
    "ic_recent": "Recent",
    "ic_people": "People at work",
    "ic_devices": "Computers & network",
    "ic_circuit": "Circuits",
    "ic_travel": "Travel & city",
    "ic_space": "Space",
    "ic_things": "Things & ideas",
    "fp_unit": "ft",
    "fp_area": "{n} sq ft",
    "n_i_person": "Person",
    "n_i_man": "Man",
    "n_i_woman": "Woman",
    "n_i_child": "Child",
    "n_i_elder": "Older person",
    "n_i_team": "Team",
    "n_i_doctor": "Doctor",
    "n_i_nurse": "Nurse",
    "n_i_surgeon": "Surgeon",
    "n_i_dentist": "Dentist",
    "n_i_pharmacist": "Pharmacist",
    "n_i_paramedic": "Paramedic",
    "n_i_patient": "Patient",
    "n_i_chef": "Chef",
    "n_i_baker": "Baker",
    "n_i_waiter": "Waiter",
    "n_i_farmer": "Farmer",
    "n_i_gardener": "Gardener",
    "n_i_builder": "Construction worker",
    "n_i_engineer": "Engineer",
    "n_i_electrician": "Electrician",
    "n_i_plumber": "Plumber",
    "n_i_mechanic": "Mechanic",
    "n_i_carpenter": "Carpenter",
    "n_i_painter": "Painter",
    "n_i_cleaner": "Janitor",
    "n_i_miner": "Miner",
    "n_i_artist": "Artist",
    "n_i_musician": "Musician",
    "n_i_photographer": "Photographer",
    "n_i_reporter": "Reporter",
    "n_i_teacher": "Teacher",
    "n_i_student": "Student",
    "n_i_graduate": "Graduate",
    "n_i_librarian": "Librarian",
    "n_i_scientist": "Scientist",
    "n_i_programmer": "Programmer",
    "n_i_office": "Office worker",
    "n_i_manager": "Manager",
    "n_i_accountant": "Accountant",
    "n_i_receptionist": "Receptionist",
    "n_i_agent": "Call center agent",
    "n_i_cashier": "Cashier",
    "n_i_customer": "Customer",
    "n_i_police": "Police officer",
    "n_i_firefighter": "Firefighter",
    "n_i_soldier": "Soldier",
    "n_i_guard": "Security guard",
    "n_i_lawyer": "Lawyer",
    "n_i_judge": "Judge",
    "n_i_pilot": "Pilot",
    "n_i_astronaut": "Astronaut",
    "n_i_driver": "Driver",
    "n_i_delivery": "Delivery driver",
    "n_i_postman": "Mail carrier",
    "n_i_hairdresser": "Hairdresser",
    "n_i_coach": "Coach",
    "n_i_room": "Room",
    "n_i_wall": "Wall",
    "n_i_door": "Door",
    "n_i_door2": "Double door",
    "n_i_slide": "Sliding door",
    "n_i_window": "Window",
    "n_i_stairs": "Stairs",
    "n_i_bed": "Double bed",
    "n_i_bed1": "Single bed",
    "n_i_crib": "Crib",
    "n_i_nightstand": "Nightstand",
    "n_i_wardrobe": "Closet",
    "n_i_dresser": "Dresser",
    "n_i_sofa": "Sofa",
    "n_i_armchair": "Armchair",
    "n_i_coffee": "Coffee table",
    "n_i_tv": "TV",
    "n_i_fireplace": "Fireplace",
    "n_i_piano": "Piano",
    "n_i_bookcase": "Bookcase",
    "n_i_rug": "Rug",
    "n_i_lamp": "Floor lamp",
    "n_i_plant": "Plant",
    "n_i_dining": "Dining table",
    "n_i_roundtable": "Round table",
    "n_i_chair": "Chair",
    "n_i_desk": "Desk",
    "n_i_officechair": "Office chair",
    "n_i_counter": "Kitchen counter",
    "n_i_stove": "Stove",
    "n_i_fridge": "Refrigerator",
    "n_i_kitchensink": "Kitchen sink",
    "n_i_toilet": "Toilet",
    "n_i_sink": "Sink",
    "n_i_bathtub": "Bathtub",
    "n_i_shower": "Shower",
    "n_i_washer": "Washer",
    "n_i_dryer": "Dryer",
    "n_i_parked": "Car (from above)",
    "n_i_shrub": "Tree (from above)",
    "n_i_computer": "Computer",
    "n_i_laptop": "Laptop",
    "n_i_tablet": "Tablet",
    "n_i_phone": "Phone",
    "n_i_server": "Server",
    "n_i_database": "Database",
    "n_i_router": "Router",
    "n_i_switch": "Network switch",
    "n_i_firewall": "Firewall",
    "n_i_wifi": "Wi-Fi",
    "n_i_internet": "Internet",
    "n_i_tower": "Cell tower",
    "n_i_printer": "Printer",
    "n_i_camera": "Security camera",
    "n_i_battery": "Battery",
    "n_i_bulb": "Light bulb",
    "n_i_switch_on": "Switch",
    "n_i_resistor": "Resistor",
    "n_i_capacitor": "Capacitor",
    "n_i_led": "LED",
    "n_i_motor": "Motor",
    "n_i_buzzer": "Buzzer",
    "n_i_socket": "Outlet",
    "n_i_solar": "Solar panel",
    "n_i_ground": "Ground",
    "n_i_cell": "Cell",
    "n_i_diode": "Diode",
    "n_i_fuse": "Fuse",
    "n_i_ammeter": "Ammeter",
    "n_i_voltmeter": "Voltmeter",
    "n_i_dimmer": "Dimmer",
    "n_i_comet": "Comet",
    "n_i_asteroid": "Asteroid",
    "n_i_station": "Space station",
    "n_i_lander": "Lunar lander",
    "n_i_galaxy": "Galaxy",
    "n_i_taxi": "Taxi",
    "n_i_tram": "Streetcar",
    "n_i_helicopter": "Helicopter",
    "n_i_scooter": "Scooter",
    "n_i_airport": "Airport",
    "n_i_trainstation": "Train station",
    "n_i_park": "Park",
    "n_i_cafe": "Café",
    "n_i_gift": "Gift",
    "n_i_target": "Target",
    "n_i_hourglass": "Hourglass",
    "n_i_music": "Music",
    "n_i_palette": "Paint palette",
    "n_i_tag": "Price tag",
    "n_i_magnet": "Magnet",
    "n_i_puzzle": "Puzzle piece",
    "n_i_car": "Car",
    "n_i_bus": "Bus",
    "n_i_truck": "Truck",
    "n_i_bike": "Bicycle",
    "n_i_train": "Train",
    "n_i_plane": "Airplane",
    "n_i_ship": "Ship",
    "n_i_house": "House",
    "n_i_building": "Office building",
    "n_i_shop": "Store",
    "n_i_school": "School",
    "n_i_hospital": "Hospital",
    "n_i_factory": "Factory",
    "n_i_warehouse": "Warehouse",
    "n_i_tree": "Tree",
    "n_i_traffic": "Traffic light",
    "n_i_rocket": "Rocket",
    "n_i_satellite": "Satellite",
    "n_i_sun": "Sun",
    "n_i_earth": "Earth",
    "n_i_moon": "Moon",
    "n_i_planet": "Planet",
    "n_i_star": "Star",
    "n_i_telescope": "Telescope",
    "n_i_ufo": "UFO",
    "n_i_zone": "Container",
    "n_i_money": "Money",
    "n_i_coins": "Coins",
    "n_i_cart": "Shopping cart",
    "n_i_package": "Package",
    "n_i_mail": "Mail",
    "n_i_chat": "Chat",
    "n_i_clock": "Clock",
    "n_i_calendar": "Calendar",
    "n_i_gear": "Gear",
    "n_i_lock": "Lock",
    "n_i_key": "Key",
    "n_i_idea": "Idea",
    "n_i_search": "Search",
    "n_i_check": "Check mark",
    "n_i_cross": "Cross",
    "n_i_warning": "Warning",
    "n_i_flag": "Flag",
    "n_i_heart": "Heart",
    "n_i_trophy": "Trophy",
    "n_i_chart": "Bar chart",
    "n_i_book": "Book",
    "n_i_megaphone": "Megaphone",
    "vb_i_person": "does their part",
    "vb_i_man": "does their part",
    "vb_i_woman": "does their part",
    "vb_i_child": "draws a picture",
    "vb_i_elder": "gives some advice",
    "vb_i_team": "works on it together",
    "vb_i_doctor": "examines the patient",
    "vb_i_nurse": "takes care of the patient",
    "vb_i_surgeon": "operates",
    "vb_i_dentist": "checks the teeth",
    "vb_i_pharmacist": "fills the prescription",
    "vb_i_paramedic": "gives first aid",
    "vb_i_patient": "describes the symptoms",
    "vb_i_chef": "cooks the meal",
    "vb_i_baker": "bakes the bread",
    "vb_i_waiter": "takes the order",
    "vb_i_farmer": "harvests the crop",
    "vb_i_gardener": "waters the plants",
    "vb_i_builder": "builds it",
    "vb_i_engineer": "designs it",
    "vb_i_electrician": "wires it up",
    "vb_i_plumber": "fixes the pipes",
    "vb_i_mechanic": "repairs the engine",
    "vb_i_carpenter": "builds the frame",
    "vb_i_painter": "paints it",
    "vb_i_cleaner": "cleans up",
    "vb_i_miner": "digs for ore",
    "vb_i_artist": "draws it",
    "vb_i_musician": "plays a tune",
    "vb_i_photographer": "takes a photo",
    "vb_i_reporter": "writes the story",
    "vb_i_teacher": "teaches the lesson",
    "vb_i_student": "does the homework",
    "vb_i_graduate": "gets the diploma",
    "vb_i_librarian": "finds the book",
    "vb_i_scientist": "runs the experiment",
    "vb_i_programmer": "writes the code",
    "vb_i_office": "fills in the forms",
    "vb_i_manager": "makes the plan",
    "vb_i_accountant": "balances the books",
    "vb_i_receptionist": "books the appointment",
    "vb_i_agent": "answers the call",
    "vb_i_cashier": "rings it up",
    "vb_i_customer": "places the order",
    "vb_i_police": "investigates",
    "vb_i_firefighter": "puts out the fire",
    "vb_i_soldier": "stands guard",
    "vb_i_guard": "checks the badge",
    "vb_i_lawyer": "argues the case",
    "vb_i_judge": "gives the verdict",
    "vb_i_pilot": "flies the plane",
    "vb_i_astronaut": "goes into orbit",
    "vb_i_driver": "drives it over",
    "vb_i_delivery": "delivers the package",
    "vb_i_postman": "delivers the mail",
    "vb_i_hairdresser": "cuts the hair",
    "vb_i_coach": "trains the team",
    "wk_i_bed": "sleeps in the bed",
    "wk_i_bed1": "takes a nap",
    "wk_i_crib": "checks on the baby",
    "wk_i_nightstand": "turns on the bedside lamp",
    "wk_i_wardrobe": "picks out some clothes",
    "wk_i_dresser": "gets dressed",
    "wk_i_sofa": "sits on the sofa",
    "wk_i_armchair": "reads in the armchair",
    "wk_i_coffee": "puts a cup on the coffee table",
    "wk_i_tv": "watches TV",
    "wk_i_fireplace": "warms up by the fire",
    "wk_i_piano": "plays the piano",
    "wk_i_bookcase": "takes down a book",
    "wk_i_lamp": "switches on the lamp",
    "wk_i_plant": "waters the plant",
    "wk_i_dining": "eats at the table",
    "wk_i_roundtable": "has a coffee at the table",
    "wk_i_chair": "sits down",
    "wk_i_desk": "works at the desk",
    "wk_i_officechair": "spins in the office chair",
    "wk_i_counter": "makes a sandwich",
    "wk_i_stove": "cooks at the stove",
    "wk_i_fridge": "gets milk from the refrigerator",
    "wk_i_kitchensink": "does the dishes",
    "wk_i_toilet": "uses the toilet",
    "wk_i_sink": "washes their hands",
    "wk_i_bathtub": "takes a bath",
    "wk_i_shower": "takes a shower",
    "wk_i_washer": "does the laundry",
    "wk_i_dryer": "dries the clothes",
    "wk_i_parked": "gets in the car",
    "wk_i_shrub": "rests under the tree",
    "wk_i_stairs": "climbs the stairs",
    "fr_kitchen": "the kitchen",
    "fr_bath": "the bathroom",
    "fr_bed": "the bedroom",
    "fr_laundry": "the laundry room",
    "fr_garage": "the garage",
    "fr_office": "the study",
    "fr_dining": "the dining room",
    "fr_living": "the living room",
    "fr_room": "the room",
    "fr_closet": "the walk-in closet",
    "fr_studio": "the studio",
    "fr_great": "the great room",
    "fr_eatin": "the eat-in kitchen",
    "fr_livdine": "the living and dining room",
    "wk_comes_in": "{who} comes in the front door.",
    "wk_starts": "{who} starts in {room}.",
    "wk_in_room": "On to {room}.",
    "wk_empty": "Nothing in {room}.",
    "wk_does": "{who} {does}.",
    "wk_cannot_reach": "Can’t get to this: {what} ({room}).",
    "wk_leaves": "{who} leaves by the front door.",
    "wk_no_way_in": "No way into {room}: it has no door.",
    "wk_summary": "Rooms walked through: {rooms} · Things used: {used} · Floor: {area}",
    "wk_no_rooms": "Put a Room around the furniture to walk through it.",
    "wk_door_loose": "This door isn’t in a room’s wall.",
    "wk_no_door": "There’s no door into {room}.",
    "wk_blocked": "Something stands in a doorway: {what}.",
    "wk_sum": "Rooms: {rooms} · Furniture: {pieces} · Floor: {area}",
    "wk_st_rooms": "Rooms",
    "wk_st_pieces": "Furniture",
    "wk_st_floor": "Floor area",
    "wk_visitor": "A visitor",
    "wk_hello": "Hi!",
    "bd_auto": "Auto",
    "bd_auto_is": "Auto: {what}",
    "bd_pick": "What the drawing is, and what Run does with it",
    "bd_program": "Program",
    "bd_home": "Floor plan",
    "bd_team": "People at work",
    "bd_network": "Network",
    "bd_circuit": "Circuit",
    "bd_space": "Space",
    "bd_city": "Travel",
    "bd_flow": "Arrows",
    "bd_tidy_kept": "A floor plan or a sky stays where you drew it: Tidy up is for flowcharts and for charts of people.",
    "go_home": "Walk through",
    "go_team": "Pass the work on",
    "go_network": "Send data",
    "go_circuit": "Switch on",
    "go_space": "Launch",
    "go_city": "Drive",
    "go_flow": "Follow the arrows",
    "v3_open": "View in 3D",
    "v3_tip": "Look around it in 3D",
    "v3_empty": "Nothing to put up yet.",
    "v3_low": "Low walls",
    "v3_hint": "Drag or the arrows to turn · W A S D to move · wheel to zoom",
    "v3_close": "Close the 3D view",
    "pn_close": "Close",
    "pn_hide": "Put this away (X-ray stays on)",
    "pn_show": "Show the key again",
    "tw_alone": "Join the people with arrows to pass the work on.",
    "tw_works": "{who}: {does}.",
    "tw_shares": "{who} shares the work out: {to}.",
    "tw_back": "Everything comes back to {who}.",
    "tw_hands": "{who} → {to}.",
    "tw_hands_what": "{who} → {to}: {what}.",
    "tw_done": "Done. Handovers: {hands} · People: {people} · Busiest: {who}",
    "tw_loose": "No arrows to or from {who}.",
    "tw_sum": "People: {people} · Arrows: {arrows}",
    "nw_cables": "Join the devices with arrows, as cables, to send data.",
    "nw_none": "{who} can’t reach anything.",
    "nw_allowed": "allowed",
    "nw_reply": "OK",
    "nw_route": "{path} ({ms} ms)",
    "nw_ok": "Got through: {n} of {all}.",
    "nw_loose": "{who} isn’t connected to anything.",
    "nw_sum": "Devices: {devices} · Cables: {cables}",
    "cy_none": "Join each vehicle to the places it goes with arrows.",
    "cy_still": "{who} has nowhere to go.",
    "cy_stop": "Stop: {place}",
    "cy_route": "{who}: {stops}",
    "cy_sum": "Vehicles: {vehicles} · Places: {places}",
    "fw_none": "Join the shapes with arrows to follow them.",
    "fw_at": "→ {what}",
    "fw_done": "Arrows followed: {n}.",
    "fw_sum": "Shapes: {shapes} · Arrows: {arrows}",
    "ec_no_source": "Add a battery to power the circuit.",
    "ec_opened": "{who}: off.",
    "ec_closed": "{who}: on.",
    "ec_press": "Click a switch to flip it.",
    "ec_buzz": "bzzz",
    "ec_short": "Short circuit! Nothing holds the current back across the battery.",
    "ec_open": "The circuit isn’t closed, so no current flows.",
    "ec_source": "{who}: {v} V, {a}",
    "ec_dark": "{who}: no light.",
    "ec_too_bright": "{who}: far too much current ({a}), it would burn out.",
    "ec_lit": "{who}: lights up ({a}).",
    "ec_turns": "{who}: turning ({a}).",
    "ec_still": "{who}: not turning.",
    "ec_buzzes": "{who}: buzzing ({a}).",
    "ec_quiet": "{who}: silent.",
    "ec_drop": "{who}: {v} V across it, {a}",
    "ec_conducts": "{who} lets the current through: {a}",
    "ec_blocks": "{who} blocks the current: it only lets it through the other way",
    "ec_blown": "{who} melted: too much current went through it, and the circuit is open",
    "ec_fuse_ok": "{who} holds: {a} through it",
    "ec_reads_a": "{who} reads {a}",
    "ec_reads_v": "{who} reads {v} V",
    "ec_loose": "{who} needs a wire at each end.",
    "ec_sum": "Parts: {parts} · Wires: {wires}",
    "os_empty": "Draw a Sun and some planets to set them going.",
    "os_year_vs": "{who} goes around {around}: a year there is {n} Earth years.",
    "os_year": "{who} goes around {around} every {n} seconds here.",
    "os_launch": "{who} lifts off.",
    "os_orbit": "{who} goes into orbit around {around}.",
    "os_arrive": "{who} reaches {where}.",
    "os_landed": "Landed: {where}",
    "os_no_sun": "Add a Sun for the planets to go around.",
    "os_sum": "Bodies: {bodies} · Craft: {craft}",
    "tw_again": "carries on",
    "ec_dim": "{who}: glows dimly ({a}).",
    "n_i_picture": "Picture",
    "n_i_mirror": "Mirror",
    "n_i_shelf": "Wall shelf",
    "n_i_walltv": "Wall TV",
    "n_i_wallclock": "Wall clock",
    "n_i_sconce": "Wall light",
    "n_i_cabinet": "Wall cabinet",
    "n_i_hooks": "Coat hooks",
    "n_i_radiator": "Radiator",
    "wk_i_picture": "looks at the picture",
    "wk_i_mirror": "checks the mirror",
    "wk_i_shelf": "takes a book from the shelf",
    "wk_i_walltv": "watches TV",
    "wk_i_wallclock": "checks the time",
    "wk_i_sconce": "switches on the light",
    "wk_i_cabinet": "gets a plate from the cabinet",
    "wk_i_hooks": "hangs up a coat",
    "wk_i_radiator": "warms their hands",
    "wk_locked_in": "{room} is behind a locked door.",
    "v3_walk": "Walk around",
    "v3_above": "View from above",
    "v3_restart": "Start again",
    "v3_door": "Door",
    "v3_locked": "It’s locked.",
    "v3_no_door": "No door within reach.",
    "v3_hint_walk": "W A S D to walk · click the view to look round with the mouse, Esc lets go · E or a click uses what’s in front of you",
    "us_nothing": "Nothing within reach",
    "us_light_on": "Light on",
    "us_light_off": "Light off",
    "us_breaker_off": "Breakers off: every light is out",
    "us_breaker_on": "Breakers on: the lights are back",
    "us_screen_on": "{what} on",
    "us_screen_off": "{what} off",
    "us_fan_on": "Fan on",
    "us_fan_off": "Fan off",
    "us_water_on": "Water running",
    "us_water_off": "Water off",
    "us_heat_on": "{what} on",
    "us_heat_off": "{what} off",
    "us_sit": "You sit down. Walk to get up",
    "us_sleep": "A good night’s sleep. It’s morning",
    "us_rest": "You lie down for a rest",
    "us_open": "{what} opened",
    "us_close": "{what} closed",
    "us_flush": "Flushed",
    "us_play": "You play a few notes",
    "us_plant": "You water the plant",
    "us_book": "You take a book down",
    "us_pay": "Paid. Thank you!",
    "us_plug": "You plug something in",
    "us_shop": "You pick something off the shelf",
    "us_coffee": "A fresh cup",
    "us_exercise": "A good workout",
    "us_game": "Your turn",
    "us_fish": "The fish swim over",
    "us_music": "Music on",
    "us_write": "You write on the board",
    "us_breaker": "The breakers: E again turns everything back on",
    "us_car": "The car’s locked",
    "us_swim": "A quick swim",
    "wo_head": "Walls",
    "wo_top": "Top",
    "wo_foot": "Bottom",
    "wo_left": "Left",
    "wo_right": "Right",
    "wo_outside": "Outside wall",
    "wo_outside_tip": "An outside wall holds the house up and keeps the weather out: it stays",
    "wo_open_to": "Open to {room}",
    "wo_wall_to": "Wall to {room}",
    "wo_free": "{span} opening. The wall carried nothing heavy: no beam needed",
    "wo_lvl": "a {plies}-ply LVL beam, {depth} deep",
    "wo_steel": "a steel beam, {depth} deep (have an engineer size it)",
    "wo_carries_floor": "{span} opening under the floor above: {beam}, on a post at each end.",
    "wo_carries_roof": "{span} opening under the middle of the roof: {beam}, on a post at each end.",
    "wo_mid_post": "A span this long needs a post in the middle too.",
    "wo_add_posts": "Put up the posts",
    "ad_beam_posts": "The wall taken out between {a} and {b} carried the house: its beam needs posts under it",
    "xr_wired": "{n} outlets, switches and a breaker panel put in",
    "xr_panel": "Breaker panel",
    "xr_heater": "Water heater",
    "xr_main": "Water main",
    "xr_sewer": "To the sewer",
    "xr_meter": "Gas meter",
    "xr_furnace": "Furnace",
    "xr_button": "Inside walls",
    "xr_tip": "See inside the walls: the framing, the wiring, the pipes, the gas and the ducts",
    "xr_head": "Inside the walls",
    "xr_frame": "Frame: studs, joists, beams",
    "xr_power": "Wiring, cable colors by amps",
    "xr_water": "Water, cold and hot",
    "xr_drain": "Drains and vents",
    "xr_gas": "Gas",
    "xr_air": "Heating and air ducts",
    "xr_wire": "Add outlets and switches",
    "xr_rewire": "Wire it again",
    "xr_wire_tip": "Outlets so no point on a wall is more than 6 ft from one, every 4 ft over counters, a switch by every door, and a breaker panel",
    "xr_wire_tile": "Outlets and switches",
    "v3_outside": "Outside",
    "v3_tips": "Suggestions: {n}",
    "ad_said": "Suggestion: {what}",
    "ad_no_front": "There’s no front door, so nobody can get in from outside.",
    "ad_fix_front": "Add a front door",
    "ad_window_bed": "No window in {room}: a bedroom needs daylight, and a way out in a fire.",
    "ad_window": "No window in {room} to let the daylight in.",
    "ad_fix_window": "Add a window",
    "ad_dark": "No window or light in {room}.",
    "ad_fix_light": "Add a wall light",
    "ad_missing": "Missing in {room}: {what}.",
    "ad_fix_add": "Add: {what}",
    "ad_bath_sink": "There’s a toilet in {room} but no sink to wash your hands.",
    "ad_small_bed": "A double bed is a tight fit in {room} ({area}): about {want} is comfortable.",
    "ad_back_to_tv": "Facing away from the TV: {what}.",
    "ad_fix_face_tv": "Turn it to face the TV",
    "ad_door_hits": "A door swings into this: {what}.",
    "ad_fix_flip": "Swing it the other way",
    "ad_bath_kitchen": "The door from {bath} opens straight into {kitchen}.",
    "ad_boxed_in": "Nobody can get to this: {what} ({room}).",
    "ad_front_blocked": "{what} can’t open: {by} is in the way.",
    "ad_firewall": "Nothing guards the network from the Internet: put a firewall between them.",
    "ad_fix_firewall": "Add a firewall",
    "ad_single": "Everything goes through {who}: if it fails, nothing gets through.",
    "ad_led": "{who} gets too much current ({a}) and would burn out: put a resistor in front of it.",
    "ad_fix_resistor": "Add a resistor",
    "ad_switch": "There’s no switch to turn it off.",
    "ad_fix_switch": "Add a switch",
    "ad_busy": "{who} handles most of the work: share it out.",
    "tab_code_tip": "Write the steps in plain words (pseudocode); the chart is drawn from them",
    "tab_hand_tip": "Draw by hand: flowcharts, floor plans, people at work, networks, circuits and more",
    "tab_lang_tip": "Write it in a programming language: Python, Java, C#, C++, JavaScript and more",
    "hm_icons": "Add an icon from Icons, under the shapes: press it, or drag it onto the paper; search it by name",
    "hm_room": "Move a room or a container, and everything in it moves too",
    "hm_door": "Put a door, a window or a picture by a wall, and it fits itself into the wall",
    "hm_tie": "Join rooms with an arrow, or with a door between them, and keep them apart on the paper: in 3D they meet, with a door in the wall between",
    "st_title": "Start a house",
    "st_sub": "Pick the rooms. They are laid out and furnished, joined by arrows; in 3D they come together, a door between each.",
    "st_beds": "Bedrooms",
    "st_baths": "Bathrooms",
    "st_open_plan": "Kitchen and dining in one room",
    "st_open_living": "Open plan",
    "st_office": "An office",
    "st_laundry": "A laundry room",
    "st_garage": "A garage",
    "st_closet": "A walk-in closet",
    "st_spread": "Spread out on the paper",
    "st_make": "Make the house",
    "st_rooms_head": "Rooms",
    "st_extras_head": "Also",
    "st_house_head": "The house",
    "st_one_floor": "One floor",
    "st_two_floors": "Two floors",
    "st_shuffle": "Shuffle",
    "st_shuffle_tip": "Another house with the same choices",
    "st_preview": "The house as it will be made",
    "st_preview_sum": "{rooms} rooms · about {area}",
    "st_fewer": "Fewer",
    "st_more": "More",
    "st_made": "{rooms} rooms laid out",
    "st_main": "Main bedroom",
    "st_bed_n": "Bedroom {n}",
    "st_ensuite": "En suite",
    "st_hall": "Hall",
    "hm_run_as": "Run does what the drawing is: walks through a home, passes work on, sends data, switches a circuit on, launches a rocket",
    "depth": "Depth",
    "depth_tip": "Shade every shape in its own color and give it a shadow, so colors look solid",
    "n_i_ac": "Air conditioner",
    "n_i_aquarium": "Aquarium",
    "n_i_arclamp": "Arc lamp",
    "n_i_basket": "Basket",
    "n_i_bathmat": "Bath mat",
    "n_i_beanbag": "Beanbag",
    "n_i_bedking": "King bed",
    "n_i_bench": "Bench",
    "n_i_books": "Books",
    "n_i_bunkbed": "Bunk bed",
    "n_i_cactus": "Cactus",
    "n_i_candle": "Candle",
    "n_i_cattree": "Cat tree",
    "n_i_ceilingfan": "Ceiling fan",
    "n_i_vent": "Air vent",
    "n_i_chandelier": "Chandelier",
    "n_i_chest": "Chest",
    "n_i_coatrack": "Coat rack",
    "n_i_coffeemaker": "Coffee maker",
    "n_i_console": "Game console",
    "n_i_cornershelf": "Corner shelf",
    "n_i_cubeshelf": "Cube shelf",
    "n_i_deck": "Deck",
    "n_i_desklamp": "Desk lamp",
    "n_i_dishwasher": "Dishwasher",
    "n_i_dogbed": "Dog bed",
    "n_i_driveway": "Driveway",
    "n_i_dryrack": "Drying rack",
    "n_i_elevator": "Elevator",
    "n_i_fan": "Fan",
    "n_i_fence": "Fence",
    "n_i_filing": "Filing cabinet",
    "n_i_floor": "Floor",
    "n_i_flowerbed": "Flower bed",
    "n_i_flowers": "Flowers",
    "n_i_frame": "Photo frame",
    "n_i_fruitbowl": "Fruit bowl",
    "n_i_garagedoor": "Garage door",
    "n_i_gardenbench": "Garden bench",
    "n_i_grill": "Grill",
    "n_i_hamper": "Laundry hamper",
    "n_i_hanging": "Hanging plant",
    "n_i_heater": "Space heater",
    "n_i_hedge": "Hedge",
    "n_i_herbs": "Herb pot",
    "n_i_hood": "Range hood",
    "n_i_hottub": "Hot tub",
    "n_i_ironing": "Ironing board",
    "n_i_island": "Kitchen island",
    "n_i_kettle": "Kettle",
    "n_i_lot": "Lot",
    "n_i_loveseat": "Loveseat",
    "n_i_medicine": "Medicine cabinet",
    "n_i_microwave": "Microwave",
    "n_i_monitor": "Monitor",
    "n_i_ottoman": "Ottoman",
    "n_i_palm": "Palm",
    "n_i_pantry": "Pantry",
    "n_i_path": "Garden path",
    "n_i_patio": "Patio table",
    "n_i_pc": "Computer tower",
    "n_i_pendant": "Pendant light",
    "n_i_pool": "Swimming pool",
    "n_i_projector": "Projector",
    "n_i_proscreen": "Projector screen",
    "n_i_recliner": "Recliner",
    "n_i_recordplayer": "Record player",
    "n_i_sectional": "Sectional sofa",
    "n_i_shoerack": "Shoe rack",
    "n_i_reachin": "Built-in closet",
    "n_i_closetrod": "Closet rod",
    "n_i_closetshelves": "Closet shelves",
    "n_i_bifold": "Bifold door",
    "n_i_sidetable": "Side table",
    "n_i_soundbar": "Soundbar",
    "n_i_speaker": "Speaker",
    "n_i_spiral": "Spiral stairs",
    "n_i_stool": "Stool",
    "n_i_succulent": "Succulent",
    "n_i_tablelamp": "Table lamp",
    "n_i_toaster": "Toaster",
    "n_i_towelrail": "Towel bar",
    "n_i_trash": "Trash can",
    "n_i_tvstand": "TV stand",
    "n_i_utilitysink": "Utility sink",
    "n_i_vanity": "Bathroom vanity",
    "n_i_vanitytable": "Dressing table",
    "n_i_vase": "Vase",
    "wk_i_spiral": "climbs the spiral stairs",
    "wk_i_elevator": "takes the elevator",
    "wk_i_dishwasher": "loads the dishwasher",
    "wk_i_island": "chops vegetables at the island",
    "wk_i_stool": "sits on a stool",
    "wk_i_trash": "takes out the trash",
    "wk_i_pantry": "gets something from the pantry",
    "wk_i_microwave": "heats up leftovers",
    "wk_i_coffeemaker": "makes a coffee",
    "wk_i_toaster": "makes toast",
    "wk_i_kettle": "puts the kettle on",
    "wk_i_fruitbowl": "grabs an apple",
    "wk_i_vanity": "brushes their teeth",
    "wk_i_hamper": "drops clothes in the hamper",
    "wk_i_ironing": "irons a shirt",
    "wk_i_dryrack": "hangs the laundry to dry",
    "wk_i_heater": "warms up by the heater",
    "wk_i_utilitysink": "rinses out a bucket",
    "wk_i_bedking": "stretches out on the big bed",
    "wk_i_bunkbed": "climbs into the top bunk",
    "wk_i_vanitytable": "does their hair",
    "wk_i_bench": "sits on the bench",
    "wk_i_chest": "opens the chest",
    "wk_i_sidetable": "sets down a glass",
    "wk_i_filing": "files some papers",
    "wk_i_loveseat": "curls up on the loveseat",
    "wk_i_sectional": "stretches out on the sectional",
    "wk_i_recliner": "leans back in the recliner",
    "wk_i_ottoman": "puts their feet up",
    "wk_i_tvstand": "picks up the remote",
    "wk_i_aquarium": "feeds the fish",
    "wk_i_beanbag": "flops onto the beanbag",
    "wk_i_speaker": "turns up the music",
    "wk_i_tablelamp": "switches on the table lamp",
    "wk_i_desklamp": "switches on the desk lamp",
    "wk_i_vase": "arranges the flowers",
    "wk_i_candle": "lights a candle",
    "wk_i_books": "picks up a book",
    "wk_i_frame": "looks at the photo",
    "wk_i_basket": "looks in the basket",
    "wk_i_monitor": "checks the screen",
    "wk_i_succulent": "dusts the succulent",
    "wk_i_herbs": "picks some basil",
    "wk_i_palm": "waters the palm",
    "wk_i_cactus": "admires the cactus",
    "wk_i_flowers": "smells the flowers",
    "wk_i_arclamp": "switches on the arc lamp",
    "wk_i_cubeshelf": "tidies the shelf",
    "wk_i_cornershelf": "puts a plant on the corner shelf",
    "wk_i_shoerack": "takes off their shoes",
    "wk_i_reachin": "picks out some clothes",
    "wk_i_closetrod": "chooses a shirt",
    "wk_i_closetshelves": "takes a folded sweater",
    "wk_i_coatrack": "hangs up their coat",
    "wk_i_hood": "turns on the range hood",
    "wk_i_towelrail": "grabs a towel",
    "wk_i_medicine": "takes a vitamin",
    "wk_i_soundbar": "turns up the sound",
    "wk_i_console": "plays a video game",
    "wk_i_pc": "turns on the computer",
    "wk_i_proscreen": "watches a movie on the big screen",
    "wk_i_recordplayer": "puts on a record",
    "wk_i_fan": "switches on the fan",
    "wk_i_ac": "turns on the air conditioning",
    "wk_i_grill": "fires up the grill",
    "wk_i_pool": "goes for a swim",
    "wk_i_patio": "has lunch outside",
    "wk_i_gardenbench": "sits in the garden",
    "wk_i_hottub": "relaxes in the hot tub",
    "wk_i_dogbed": "pets the dog",
    "wk_i_cattree": "plays with the cat",
    "wk_i_hedge": "trims the hedge",
    "wk_i_flowerbed": "weeds the flower bed",
    "ic_rooms": "Rooms, doors & stairs",
    "ic_living": "Living room",
    "ic_bedroom": "Bedroom & office",
    "ic_closets": "Closets",
    "ic_kitchen": "Kitchen & dining",
    "ic_bath": "Bathroom & laundry",
    "ic_decor": "Decor, plants & lights",
    "ic_walls": "On the walls & storage",
    "ic_tech": "TV & electronics",
    "ic_outdoor": "Yard, driveway & garden",
    "fl_ground": "Ground floor",
    "fl_up_name": "Upstairs",
    "fl_upper": "Upper floor {n}",
    "fl_lower": "Basement {n}",
    "wk_up": "{who} goes upstairs: {floor}.",
    "wk_down": "{who} goes downstairs: {floor}.",
    "wk_lift": "{who} takes the elevator: {floor}.",
    "wk_up_said": "Upstairs!",
    "wk_down_said": "Downstairs!",
    "v3_went_up": "Up to {floor}",
    "v3_went_down": "Down to {floor}",
    "v3_all_floors": "All floors",
    "v3_up_to": "Up to: {floor}",
    "v3_floors_tip": "Show every floor, or lift off the ones above",
    "fp_real": "Real size",
    "fp_depth": "Depth",
    "fp_ceiling": "Ceiling",
    "lot_keep": "Setbacks: kept clear from the edges",
    "lot_front": "Front",
    "lot_side": "Sides",
    "lot_back": "Back",
    "lot_says": "Lot {w} × {d} {unit} · {area}",
    "lot_build": "Room to build: {w} × {d} {unit} · {area}",
    "lot_house": "House {area}",
    "lot_yard": "Yard {area}",
    "lot_front_is": "front",
    "lot_side_is": "side",
    "lot_back_is": "back",
    "ad_stairs_nowhere": "Nowhere to go yet: {what}. Draw the floor above beside this one.",
    "ad_fix_upstairs": "Make it lead upstairs",
    "ad_group_house": "The house is loose rooms: put it in a Floor to drag it around the lot in one piece.",
    "ad_fix_group": "Put it in a Floor",
    "ad_too_big": "The house ({house}) is bigger than the room to build ({room}).",
    "ad_setback": "The house crosses the {side} setback by {by}.",
    "ad_fix_move_in": "Move it inside the line",
    "ad_no_driveway": "Nothing leads up to the garage door: add a driveway.",
    "ad_fix_driveway": "Add a driveway",
    "hm_floors": "Draw each story of a house in its own Floor, side by side: stairs in the same place on each lead up and down, in 3D too",
    "hm_lot": "Put a Lot under the house and give it its size and setbacks in the panel: it shows the room to build and the yard left",
    "v3_roof": "Roof",
    "v3_roof_tip": "Put the roof on, or lift it off to see inside",
    "v3_day": "Day",
    "v3_evening": "Evening",
    "v3_night": "Night",
    "v3_time_tip": "Time of day: day, evening, or night with the lights on",
    "v3_save": "Save picture",
    "v3_save_tip": "Save what the view shows as a picture",
    "v3_saved": "Picture saved",
    "v3_save_failed": "This browser can’t save the picture",
    "v3_labels": "Labels",
    "v3_labels_tip": "Name the rooms and what is in them",
    "v3_2d": "2D",
    "v3_3d": "3D",
    "v3_2d_tip": "Flat, straight down on it, like the plan",
    "v3_3d_tip": "Stand it up in 3D again",
    "v3_hint_flat": "Drag or W A S D to move · wheel to zoom",
    "labels": "Labels",
    "labels_tip": "Name the furniture and rooms on a floor plan",
    "rl_kitchen": "Kitchen",
    "rl_bath": "Bathroom",
    "rl_bed": "Bedroom",
    "rl_laundry": "Laundry room",
    "rl_garage": "Garage",
    "rl_office": "Study",
    "rl_dining": "Dining room",
    "rl_living": "Living room",
    "rl_closet": "Walk-in closet",
    "rl_studio": "Studio",
    "rl_great": "Great room",
    "rl_eatin": "Eat-in kitchen",
    "rl_livdine": "Living & dining room",
    "ic_all_icons": "All icons",
    "ic_sets": "Icon sets",
    "ic_find_n": "Search {n} icons",
    "ic_clear": "Clear the search",
    "ic_count": "{n} icons",
    "ic_found": "{n} found",
    "ic_hint": "Click to add · drag onto the paper",
    "ic_hint_touch": "Tap to add · drag onto the paper",
    "ic_show_set": "Show only {set}",
    "ic_browse": "Browse all icons…",
    "ad_overlap": "{a} and {b} stand in the same place: in 3D one would go through the other.",
    "ad_fix_apart": "Move them apart",
    "ad_in_wall": "{what} goes into the wall of {room}.",
    "ad_fix_in": "Move it into the room",
    "dz_making": "What you're making",
    "dz_flowchart": "Flowchart",
    "dz_flowchart_tip": "A program, step by step: run it, and write it out as text or code",
    "dz_design": "Design",
    "dz_design_tip": "Floor plans, people, networks, circuits and space, seen in 3D",
    "dz_ask": "What are you making?",
    "dz_ask_sub": "Pick one to start. You can switch at the top of the panel any time, and each keeps its own paper.",
    "dz_flow_says": "The steps of a program. Run it, check it, and write it out as text or code.",
    "dz_flow_eg": "Start · Process · Decision · Loop",
    "dz_design_says": "Floor plans and furniture, people, networks, circuits and space. Walk through it in 3D.",
    "dz_design_eg": "Rooms · Furniture · People · Devices",
    "dz_later": "Decide later",
    "dz_add": "Add to the design",
    "dz_by_set": "Icons by set",
    "dz_words": "Words",
    "dz_note": "Note",
    "dz_shapes": "Shapes",
    "dz_name": "Name",
    "dz_size": "Size",
    "dz_height": "Height",
    "dz_lift": "From floor",
    "dz_drop": "Below ceiling",
    "dz_standard": "Standard size",
    "dz_standard_tip": "Back to the size such a thing usually is",
    "dz_fits_room": "No bigger than {room} inside its walls: {size}.",
    "dz_fits_on": "No bigger than what it stands on: {what}.",
    "dz_under_ceiling": "Under the ceiling of {room}: {size}.",
    "dz_holds": "Big enough for what is in it: at least {size}.",
    "dz_above": "At least as high as the tallest thing in it ({what}): {size}.",
    "dz_bad_len": "Type a length, like 3' 4\" or 40\".",
    "dz_turn_left": "Turn left a quarter",
    "dz_turn_right": "Turn right a quarter",
    "dz_dims_tip": "Click to type a size",
    "dz_tidied": "Tidied up: {n} moved.",
    "hm_dims": "Pick a piece of a floor plan to see its size on the paper; press a size to type another, like 6' 8\" or 2 m",
    "dz_add_how": "Search the icons, or pick a set, then click one to add it or drag it onto the paper. Pick something to see its size, and type a new one.",
    "dz_ceil_least": "A ceiling is at least {size} high.",
    "mt_head": "Materials",
    "mt_button": "Materials",
    "mt_floor": "Floor",
    "mt_wall": "Walls inside",
    "mt_out": "Outside walls",
    "mt_roof": "Roof",
    "mt_house": "Whole house",
    "mt_room": "This room",
    "mt_plain": "Standard",
    "mt_none": "Draw rooms first, then pick what they are made of.",
    "mt_boards": "Wood boards",
    "mt_parquet": "Parquet",
    "mt_tiles": "Tiles",
    "mt_marble": "Marble",
    "mt_slate": "Slate",
    "mt_carpet": "Carpet",
    "mt_concrete": "Concrete",
    "mt_paint": "Paint",
    "mt_wallpaper": "Wallpaper",
    "mt_panels": "Wood panels",
    "mt_brick": "Brick",
    "mt_stone": "Stone",
    "mt_siding": "Siding",
    "mt_stucco": "Stucco",
    "mt_batten": "Board and batten",
    "mt_shakes": "Cedar shakes",
    "mtr_shingles": "Shingles",
    "mtr_tiles": "Clay tiles",
    "mtr_metal": "Metal",
    "mtr_slate": "Slate",
    "mt_herringbone": "Herringbone",
    "mt_hextiles": "Hexagon tiles",
    "mt_checker": "Checkered tiles",
    "mt_terrazzo": "Terrazzo",
    "mt_cork": "Cork",
    "mt_plaster": "Plaster",
    "mt_shiplap": "Shiplap",
    "mt_beadboard": "Beadboard",
    "mt_logs": "Logs",
    "mt_timber": "Half-timbered",
    "mt_cladding": "Cladding panels",
    "mt_corrugated": "Corrugated metal",
    "mtr_thatch": "Thatch",
    "mtr_woodshakes": "Wood shakes",
    "mtr_green": "Green roof",
    "mtr_solar": "Solar panels",
    "mt_any": "Any color",
    "st_floors": "Floors",
    "st_basement": "A basement",
    "st_roof_one": "Roof in one piece",
    "st_lot": "On its own lot",
    "st_stairs": "Stairs",
    "st_family": "Family room",
    "st_storage": "Storage",
    "st_utility": "Utility room",
    "fl_basement": "Basement",
    "hs_button": "Settings",
    "hs_tip": "What the 3D view shows: the street, the land, gutters, lights, the weather",
    "hs_house": "The house",
    "hs_gutters": "Gutters and downpipes",
    "hs_porch": "Lights by the doors out",
    "hs_outside": "Out of doors",
    "hs_street": "A street out front",
    "st_site_head": "Where it stands",
    "sf_head": "Which side of the street",
    "sf_side_S": "North side",
    "sf_side_N": "South side",
    "sf_side_E": "West side",
    "sf_side_W": "East side",
    "sf_shape": "The street",
    "sf_straight": "Straight",
    "sf_curve": "Curving",
    "addr_head": "Address",
    "addr_number": "House number",
    "addr_street": "Street",
    "addr_side": "Side street",
    "addr_corner": "Corner",
    "addr_corner_none": "Not a corner",
    "addr_corner_left": "Side street on the left",
    "addr_corner_right": "Side street on the right",
    "addr_streets": "Maple Street|Oak Avenue|Cedar Lane|Elm Street|Willow Way|Birch Road|Pine Street|Lakeview Drive|Chestnut Court|Hillcrest Road",
    "hs_land": "The land and its size",
    "hs_trees": "Trees round about",
    "hs_weather": "Weather",
    "sm_head": "Try it against a storm",
    "sm_none": "No storm",
    "sm_gale": "Strong wind",
    "sm_severe": "Severe thunderstorm",
    "sm_cat1": "Hurricane Cat 1",
    "sm_cat3": "Hurricane Cat 3",
    "sm_cat5": "Hurricane Cat 5",
    "sm_ef1": "Tornado EF1",
    "sm_ef3": "Tornado EF3",
    "sm_ef5": "Tornado EF5",
    "sm_k_windows": "Windows",
    "sm_k_roof": "Roof",
    "sm_k_walls": "Walls",
    "sm_k_anchors": "Foundation hold",
    "sm_k_sway": "Sway",
    "sm_k_feel": "Felt inside",
    "sm_k_people": "People",
    "sm_win_ok": "impact-rated: flying debris stays out",
    "sm_win_bad": "flying debris breaks them, and the wind gets in under the roof",
    "sm_holds": "holds {have} against {need}",
    "sm_gives": "gives way: {need} against {have}",
    "sm_sway": "its top moves {move} (the limit is {limit})",
    "sm_feel_none": "not felt ({mg} milli-g)",
    "sm_feel_some": "just noticeable ({mg} milli-g)",
    "sm_feel_bad": "people feel it and feel sick ({mg} milli-g)",
    "sm_safe_ok": "the safe room keeps everyone safe",
    "sm_safe_bad": "no house stays whole in this: people need a safe room",
    "sm_add": "Add {what}",
    "sm_all_ok": "It comes through this storm.",
    "sm_not_ok": "It would not come through this storm whole.",
    "sm_again": "Run it again",
    "bp_watch": "Watch it built",
    "bp_watch_tip": "Watch it go up again, from the ground",
    "sm_seen": "In the storm: {what}",
    "sm_ev_none": "nothing broken so far",
    "sm_ev_windows": "windows broken",
    "sm_ev_roof": "roof torn off",
    "sm_ev_walls": "walls blown down",
    "sm_ev_slid": "pushed off its foundation",
    "sm_ev_flew": "the whole house carried away",
    "sm_ev_yard": "things in the yard blown away",
    "sm_ev_safe": "the safe room still standing",
    "sm_quake1": "Moderate earthquake",
    "sm_quake2": "Strong earthquake",
    "sm_quake3": "Violent earthquake",
    "sm_flood1": "Flood",
    "sm_flood2": "Deep flood",
    "sm_flood3": "Storm surge",
    "sm_snow1": "Heavy snow",
    "sm_snow2": "Very heavy snow",
    "sm_snow3": "Record snow",
    "sm_hail1": "Hail",
    "sm_hail2": "Large hail",
    "sm_hail3": "Giant hail",
    "sm_g_wind": "Wind",
    "sm_g_quake": "Earthquake",
    "sm_g_flood": "Flood",
    "sm_g_snow": "Snow",
    "sm_g_hail": "Hail",
    "sm_k_chimney": "Chimney",
    "sm_k_contents": "Inside",
    "sm_k_cover": "Roofing",
    "sm_k_solar": "Solar panels",
    "sm_chim_ok": "a brick chimney stands this",
    "sm_chim_bad": "a brick chimney falls in shaking this hard",
    "sm_shelf_ok": "furniture stays standing",
    "sm_shelf_bad": "tall furniture topples: strap it to the wall",
    "sm_wet_ok": "the water stays below the floor",
    "sm_wet_bad": "water {deep} deep over the floor",
    "sm_hail_win": "stones this big break glass",
    "sm_cover_ok": "the roofing takes these stones",
    "sm_cover_bad": "the roofing is broken up",
    "sm_pv_ok": "the solar panels take these stones",
    "sm_pv_bad": "the solar panels crack",
    "sm_h_raised": "Raised on piers",
    "sm_h_rafters": "Stronger rafters",
    "sm_h_roofing": "Impact-rated roofing",
    "sm_ev_sway": "top swaying {move} (drawn {times}× larger)",
    "sm_ev_cave": "roof caved in",
    "sm_ev_float": "the whole house floated away",
    "sm_ev_chimney": "chimney fallen",
    "sm_ev_shelves": "furniture toppled",
    "sm_ev_wet": "water inside",
    "sm_ev_cover": "roofing battered",
    "sm_ev_solar": "solar panels cracked",
    "sm_ev_trees": "trees ripped out",
    "sm_ev_bare": "nothing left but the bare slab",
    "sm_hold_head": "What holds it together",
    "sm_h_ties": "Hurricane ties",
    "sm_h_straps": "Straps roof to foundation",
    "sm_h_shear": "Shear walls",
    "sm_h_anchors": "Anchor bolts and hold-downs",
    "sm_h_impact": "Impact windows or shutters",
    "sm_h_saferoom": "Tornado safe room",
    "sm_h_brace": "Cross bracing",
    "sm_h_outrigger": "Outrigger trusses",
    "sm_h_damper": "Tuned mass damper",
    "hs_tab_house": "House",
    "hs_tab_land": "Land",
    "hs_tab_street": "Street",
    "hs_tab_weather": "Weather",
    "hs_bound": "Stay on the lot",
    "hs_hood": "Neighbors",
    "hs_folk": "People and cars",
    "hs_needs_street": "Turn on the street first",
    "ws_head": "Landscape",
    "ws_plains": "Plains",
    "ws_hills": "Hills",
    "ws_mountains": "Mountains",
    "ws_forest": "Forest",
    "ws_lake": "Lakeside",
    "ws_beach": "Beach",
    "ws_desert": "Desert",
    "ws_tropics": "Tropics",
    "ws_arctic": "Snowfield",
    "ws_city": "City",
    "wl_head": "Street lights",
    "wl_classic": "Classic",
    "wl_lantern": "Lantern",
    "wl_cobra": "Highway",
    "wl_twin": "Twin arm",
    "wl_modern": "Modern",
    "wl_globe": "Globe",
    "wl_none": "None",
    "wd_edge": "That’s the edge of your lot",
    "tr_head": "Ground",
    "tr_auto": "Natural",
    "tr_flat": "Flat",
    "tr_gentle": "Gentle",
    "tr_rolling": "Rolling",
    "tr_steep": "Steep",
    "tf_head": "Foundation",
    "tf_auto": "Best fit",
    "tf_wall": "Concrete wall",
    "tf_posts": "On posts",
    "tr_new": "New land",
    "tr_new_off": "Pick a ground other than Flat first",
    "tr_says_wall": "The ground falls {n} under the house; the foundation wall makes up the difference",
    "tr_says_posts": "The ground falls {n} under the house; it stands on posts, with steps down from the doors",
    "hs_lot_trees": "Trees in the yard",
    "hs_needs_trees": "Turn on the trees round about first",
    "tr_back": "Back to plan",
    "tr_back_tip": "Back to the plan (Esc)",
    "tr_me": "See me",
    "tr_me_off": "My eyes",
    "tr_me_tip": "See yourself from behind, or look through your own eyes (V)",
    "tool_view": "Drag view",
    "tool_view_tip": "Every drag moves the view and nothing else; a tap still picks a shape. Tap Shift to switch",
    "dv_on": "Drag view: dragging moves the view only",
    "dv_off": "Dragging moves things again",
    "dv_tip3d": "On: dragging only turns and moves the view. Off: drag a piece of furniture to move it. Tap Shift to switch",
    "dv_moved": "{what} moved",
    "pl_move_room": "Move room",
    "pl_move_room_tip": "Drag to move the room and everything in it",
    "tx_head": "Look",
    "tx_on": "Textures",
    "tx_tip": "Patterns with their ridges and grooves, and the shine of metal and glass. Off: plain colors.",
    "units": "Measure in",
    "units_ft": "Feet and inches",
    "units_m": "Meters",
    "pw_head": "Power lines",
    "pw_front": "Poles in front",
    "pw_back": "Poles out back",
    "pw_under": "Underground",
    "pw_none": "None",
    "hs_vents": "Dryer vent",
    "hs_dock": "Dock and boat",
    "hs_dock_off": "Needs a lake or the sea",
    "mx_head": "Mix in",
    "mx_one_water": "One kind of water at a time",
    "hs_solar": "Solar panels",
    "v3_hint_touch": "Drag to turn · two fingers to move, pinch to zoom",
    "v3_hint_flat_touch": "Drag to move · pinch to zoom",
    "v3_hint_walk_touch": "The arrows to walk · drag to look round · tap to use what’s in front of you",
    "hd_title": "There’s a house here already",
    "hd_sub": "Build the new one in its place, or next door on the same street?",
    "hd_add": "Next door",
    "hd_add_sub": "House {n} on the street",
    "hd_replace": "Replace it",
    "hd_replace_sub": "The house there now goes (Undo brings it back)",
    "hd_added": "House {n} built next door",
    "hd_gap_head": "Next door",
    "hd_gap": "Space between houses",
    "hd_gap_tip": "Between the lots, yours and the neighbors’",
    "ed_separate": "Separate from the house",
    "ed_separate_n": "Separate them from the house",
    "ed_separated": "Separated: it stands on its own now",
    "ed_separated_n": "{n} rooms separated from the house",
    "ed_join": "Join to the house",
    "ed_joined": "Joined to the {room}",
    "ed_change": "Change this house…",
    "ed_change_title": "Change this house",
    "ed_rebuild": "Rebuild it",
    "ed_rebuilt": "House rebuilt where it was",
    "f3_on": "3D furniture",
    "f3_tip": "The plan as drawn, its furniture standing up in 3D, lit and shaded",
    "st_kitchens": "Kitchens",
    "st_livings": "Living rooms",
    "st_offices": "Offices",
    "st_laundries": "Laundry rooms",
    "st_room_n": "{room} {n}",
    "st_typed": "Type a number from {from} to {to}, or use the buttons",
    "st_open": "Start building",
    "st_open_tip": "Lay out a furnished home, apartments, condos or a store from a few choices",
    "ty_condos": "Condos",
    "ty_condos_side": "Condos each side",
    "ty_condo_n": "Unit {n}",
    "tr_gym": "Gym",
    "yd_head": "Yard",
    "yd_deck": "Deck",
    "yd_porch": "Front porch",
    "yd_pool": "Pool",
    "yd_hottub": "Hot tub",
    "yd_grill": "Grill",
    "yd_firepit": "Fire pit",
    "yd_trampoline": "Trampoline",
    "yd_swing": "Swing set",
    "yd_gazebo": "Gazebo",
    "yd_court": "Basketball court",
    "yd_pavilion": "Pavilion",
    "yd_fence": "Backyard fence",
    "yd_shed": "Garden shed",
    "yd_garden": "Vegetable garden",
    "yd_no_room": "No room for it in the yard",
    "wk_plan": "Laying out the rooms",
    "wk_furnish": "Furnishing the rooms",
    "wk_extras": "A few more things",
    "wk_windows": "Windows and doors",
    "wk_decor": "Finishing touches",
    "wk_wire": "Wiring",
    "wk_arrange": "Arranging the furniture",
    "wk_yard": "The yard",
    "wk_draw": "Drawing it",
    "wk_land": "The land and the street",
    "wk_house": "Putting up the walls",
    "wk_models": "Making the furniture",
    "wk_scene": "Lighting it",
    "wk_stop": "Stop",
    "wk_stopped": "Stopped: put back as it was",
    "wb_out": "Open in a new tab",
    "wb_big": "Bigger",
    "wb_small": "Smaller",
    "wb_loading": "Loading…",
    "wb_slow": "Still loading. This site may not allow being shown inside another page; open it in a new tab.",
    "wb_note": "Some websites won’t show inside another page. Open those in a new tab.",
    "wb_opened": "Opened {url}",
    "wb_bad": "That isn’t a website address: {what}",
    "dg_head": "Design",
    "dg_count": "{n} designs",
    "dg_colorway": "Colors",
    "dg_find": "Search {n} items and {d} designs",
    "dg_classic": "Classic",
    "dg_modern": "Modern",
    "dg_midcentury": "Mid-century",
    "dg_scandi": "Scandinavian",
    "dg_industrial": "Industrial",
    "dg_farmhouse": "Farmhouse",
    "dg_glam": "Glam",
    "dg_coastal": "Coastal",
    "dg_rustic": "Rustic",
    "dg_japandi": "Japandi",
    "dg_artdeco": "Art deco",
    "dg_boho": "Boho",
    "dg_minimal": "Minimal",
    "dg_traditional": "Traditional",
    "dgf_stainless": "Stainless steel",
    "dgf_blackss": "Black stainless",
    "dgf_white": "White",
    "dgf_matte": "Matte black",
    "dgf_retrocream": "Retro cream",
    "dgf_retromint": "Retro mint",
    "dgf_retrored": "Retro red",
    "dgf_bronze": "Bronze",
    "dgf_panel": "Oak panel",
    "dgf_black": "Black",
    "dgf_silver": "Silver",
    "dgf_walnut": "Walnut",
    "dgf_graphite": "Graphite",
    "dgf_terracotta": "Terracotta",
    "dgf_matteblack": "Matte black",
    "dgf_woven": "Woven",
    "dgf_concrete": "Concrete",
    "dgf_glazedblue": "Glazed blue",
    "dgf_brass": "Brass",
    "dgf_sage": "Sage",
    "dgf_cedar": "Cedar",
    "dgf_teak": "Teak",
    "dgf_blackmetal": "Black metal",
    "dgf_composite": "Composite",
    "dgf_stone": "Stone",
    "dgf_green": "Green",
    "dgf_redbarn": "Barn red",
    "dgc_cream": "Cream",
    "dgc_sage": "Sage",
    "dgc_navy": "Navy",
    "dgc_grey": "Grey",
    "dgc_charcoal": "Charcoal",
    "dgc_white": "White",
    "dgc_mustard": "Mustard",
    "dgc_teal": "Teal",
    "dgc_rust": "Rust",
    "dgc_oat": "Oat",
    "dgc_fog": "Fog",
    "dgc_blush": "Blush",
    "dgc_cognac": "Cognac",
    "dgc_black": "Black",
    "dgc_olive": "Olive",
    "dgc_linen": "Linen",
    "dgc_oak": "Oak",
    "dgc_blue": "Blue",
    "dgc_emerald": "Emerald",
    "dgc_sapphire": "Sapphire",
    "dgc_sand": "Sand",
    "dgc_seafoam": "Seafoam",
    "dgc_saddle": "Saddle",
    "dgc_barn": "Barn",
    "dgc_moss": "Moss",
    "dgc_ash": "Ash",
    "dgc_clay": "Clay",
    "dgc_jade": "Jade",
    "dgc_plum": "Plum",
    "dgc_ivory": "Ivory",
    "dgc_terracotta": "Terracotta",
    "dgc_ochre": "Ochre",
    "dgc_stone": "Stone",
    "dgc_burgundy": "Burgundy",
    "dgc_hunter": "Hunter green",
    "dgc_gold": "Gold",
    "sy_head": "Style",
    "sy_plain": "Plain",
    "sy_plain_sub": "No particular style",
    "sy_change": "Change",
    "sy_applied": "{name} style",
    "sy_r_americas": "The Americas",
    "sy_r_europe": "Europe",
    "sy_r_asia": "Asia",
    "sy_r_mideast": "Middle East and Africa",
    "sy_r_oceania": "Australia and New Zealand",
    "sy_r_modern": "Modern",
    "sy_r_civic": "Towns and cities",
    "sy_suggested": "Suggested",
    "sy_all": "All",
    "sy_find": "Find a style",
    "sy_any": "Any (Shuffle)",
    "sy_none": "No style by that name",
    "sy_international": "International Style",
    "sy_brutalist": "Brutalist",
    "sy_artdeco": "Art Deco",
    "sy_storefront": "Main Street shops",
    "sy_haussmann": "Haussmann (Paris)",
    "sy_brownstone": "Brownstone",
    "sy_bistro": "Paris café",
    "sy_googie": "Googie diner",
    "sy_collegiate": "Collegiate Gothic",
    "sy_schoolhouse": "Red schoolhouse",
    "sy_modernist": "Modernist",
    "sy_hightech": "High-tech",
    "sy_panelblock": "Panel block",
    "sy_mediterranean": "Mediterranean",
    "sy_scandi": "Scandinavian",
    "sy_craftsman": "Craftsman",
    "sy_colonial": "Colonial",
    "sy_capecod": "Cape Cod",
    "sy_victorian": "Victorian",
    "sy_ranch": "Ranch",
    "sy_farmhouse": "Farmhouse",
    "sy_dutchcolonial": "Dutch Colonial",
    "sy_logcabin": "Log cabin",
    "sy_aframe": "A-frame",
    "sy_midcentury": "Mid-century",
    "sy_prairie": "Prairie",
    "sy_pueblo": "Pueblo adobe",
    "sy_mission": "Spanish Mission",
    "sy_brazil": "Brazilian modern",
    "sy_tudor": "Tudor",
    "sy_georgian": "Georgian",
    "sy_cottage": "Thatched cottage",
    "sy_french": "Parisian mansard",
    "sy_provencal": "Provençal",
    "sy_tuscan": "Tuscan villa",
    "sy_dutch": "Dutch canal house",
    "sy_nordic": "Scandinavian",
    "sy_chalet": "Swiss chalet",
    "sy_izba": "Russian izba",
    "sy_cycladic": "Greek island",
    "sy_japanese": "Japanese",
    "sy_chinese": "Chinese courtyard",
    "sy_hanok": "Korean hanok",
    "sy_thai": "Thai",
    "sy_balinese": "Balinese",
    "sy_haveli": "Indian haveli",
    "sy_riad": "Moroccan riad",
    "sy_arabian": "Arabian dome",
    "sy_sahel": "Sahel mud brick",
    "sy_rondavel": "Rondavel",
    "sy_queenslander": "Queenslander",
    "sy_nzvilla": "New Zealand villa",
    "sy_modern": "Modernist",
    "sy_contemporary": "Contemporary",
    "sy_ecohouse": "Eco house",
    "rf_head": "Roof shape",
    "rf_hip": "Hipped",
    "rf_gable": "Gabled",
    "rf_flat": "Flat",
    "rf_slab": "Overhang",
    "rf_mansard": "Mansard",
    "rf_gambrel": "Gambrel",
    "rf_aframe": "A-frame",
    "rf_shed": "Lean-to",
    "rf_butterfly": "Butterfly",
    "rf_pagoda": "Curved",
    "rf_dome": "Dome",
    "rf_stepped": "Stepped gable",
    "ty_head": "What to build",
    "ty_what_head": "What it has",
    "ty_house": "House",
    "ty_cabin": "Cabin",
    "ty_townhouses": "Townhouses",
    "ty_duplex": "Duplex",
    "ty_apartments": "Apartments",
    "ty_shop": "Grocery store",
    "ty_boutique": "Clothing store",
    "ty_cafe": "Café",
    "ty_office": "Office",
    "ty_school": "School",
    "ty_units": "Homes in the row",
    "ty_storeys": "Floors",
    "ty_flats_side": "Apartments each side",
    "ty_flat_beds": "Bedrooms each",
    "ty_classrooms": "Classrooms a floor",
    "ty_size": "Size",
    "ty_small": "Small",
    "ty_medium": "Medium",
    "ty_large": "Large",
    "ty_style_prev": "Previous style",
    "ty_style_next": "Next style",
    "ty_home_n": "Home {n}",
    "ty_flat_n": "Apt {n}",
    "ty_class_n": "Room {n}",
    "tr_lobby": "Lobby",
    "tr_landing": "Landing",
    "tr_lift": "Elevator",
    "tr_sales": "Sales floor",
    "tr_stock": "Stockroom",
    "tr_restroom": "Restroom",
    "tr_staff": "Staff room",
    "tr_fitting": "Fitting room",
    "tr_boutique": "Shop floor",
    "tr_cafe": "Seating",
    "tr_reception": "Reception",
    "tr_openoffice": "Open office",
    "tr_meeting": "Meeting room",
    "tr_kitchenette": "Kitchenette",
    "tr_classroom": "Classroom",
    "tk_head": "What it sells",
    "tk_grocery": "Groceries",
    "tk_convenience": "Convenience",
    "tk_pharmacy": "Pharmacy",
    "tk_hardware": "Hardware",
    "tk_electronics": "Electronics",
    "tk_books": "Books",
    "tk_furniture": "Furniture",
    "tk_florist": "Flowers",
    "tk_toys": "Toys",
    "tk_sports": "Sports",
    "tk_pets": "Pets",
    "tk_floor_convenience": "Shop",
    "tk_floor_pharmacy": "Pharmacy",
    "tk_floor_hardware": "Hardware store",
    "tk_floor_electronics": "Electronics store",
    "tk_floor_books": "Bookshop",
    "tk_floor_furniture": "Showroom",
    "tk_floor_florist": "Florist",
    "tk_floor_toys": "Toy shop",
    "tk_floor_sports": "Sports shop",
    "tk_floor_pets": "Pet shop",
    "pg_training": "Training room",
    "pg_boardroom": "Boardroom",
    "pg_cubicles": "Cubicles",
    "pg_phone": "Phone booth",
    "pg_directors": "Director's office",
    "pg_science_n": "Science lab {n}",
    "pg_computers_n": "Computer lab {n}",
    "pg_art_n": "Art room {n}",
    "pg_music_n": "Music room {n}",
    "pg_math_n": "Math {n}",
    "pg_english_n": "English {n}",
    "pg_history_n": "History {n}",
    "pg_library": "Library",
    "pg_cafeteria": "Cafeteria",
    "pg_nurse": "Nurse",
    "pg_labbench": "Lab bench",
    "pg_worktable": "Work table",
    "tr_breakout": "Break-out area",
    "tr_school_office": "School office",
    "ty_together": "Homes in a row are always put together",
    "ty_start_title": "Start a building",
    "ty_make": "Make it",
    "tr_office": "Office",
    "wx_clear": "Clear",
    "wx_cloudy": "Cloudy",
    "wx_rain": "Rain",
    "wx_storm": "Storm",
    "wx_snow": "Snow",
    "wx_fog": "Fog",
    "wx_says_rain": "25 mm of rain on this roof is about {l} liters of water.",
    "wx_gutters": "The gutters carry it down the downpipes, away from the walls.",
    "wx_no_gutters": "With no gutters it runs off the eaves along the walls.",
    "wx_says_snow": "30 cm of wet snow on this roof weighs about {kg} kg.",
    "wx_says_rain_ft": "An inch of rain on this roof is about {gal} gallons of water.",
    "wx_says_snow_ft": "A foot of wet snow on this roof weighs about {lb} lb.",
    "land_head": "The land",
    "land_guess": "The least land for this house, with the usual setbacks",
    "land_house": "House {ground} on the ground · {all} of floors",
    "land_cover": "{n}% built on",
    "land_acres": "{n} acres",
    "land_ha": "{n} ha",
    "hs_floors": "Floors and roof",
    "hs_floors_tip": "Add a floor above or a basement, or roof the house in one piece",
    "hs_floors_title": "Floors and roof",
    "hs_floors_sub": "A new floor goes beside the others on the paper, the stairs joined to the ones below; in 3D it stands on top.",
    "hs_add": "Add",
    "hs_add_up": "A floor above",
    "hs_add_down": "A basement",
    "hs_done": "Done",
    "hs_floor_made": "{name} added",
    "dz_finish": "Finish",
    "dz_fin_main": "Main",
    "dz_fin_trim": "Trim",
    "dz_fin_plain_tip": "Back to the colors it usually comes in",
    "sizes": "Sizes",
    "sizes_tip": "Write each room's length, width and ceiling height, and each piece's width, depth and height, on a floor plan",
    "ic_fitness": "Fitness & play",
    "ic_utility": "Garage & utility",
    "ic_store": "Shops, offices & schools",
    "ic_power": "Power & structure",
    "n_i_consoletable": "Console table",
    "n_i_sideboard": "Sideboard",
    "n_i_chaise": "Chaise lounge",
    "n_i_rocker": "Rocking chair",
    "n_i_hutch": "China cabinet",
    "n_i_barcart": "Bar cart",
    "n_i_highchair": "High chair",
    "n_i_daybed": "Daybed",
    "n_i_floormirror": "Floor mirror",
    "n_i_toybox": "Toy box",
    "n_i_standdesk": "Standing desk",
    "n_i_lshapedesk": "Corner desk",
    "n_i_oven": "Wall oven",
    "n_i_winecooler": "Wine cooler",
    "n_i_freezer": "Chest freezer",
    "n_i_cornertub": "Corner bathtub",
    "n_i_linencab": "Linen cabinet",
    "n_i_whiteboard": "Whiteboard",
    "n_i_dartboard": "Dartboard",
    "n_i_evcharger": "EV charger",
    "n_i_treadmill": "Treadmill",
    "n_i_exbike": "Exercise bike",
    "n_i_weightbench": "Weight bench",
    "n_i_yogamat": "Yoga mat",
    "n_i_pooltable": "Pool table",
    "n_i_pingpong": "Ping-pong table",
    "n_i_easel": "Easel",
    "n_i_trampoline": "Trampoline",
    "n_i_swing": "Swing set",
    "n_i_firepit": "Fire pit",
    "n_i_lounger": "Sun lounger",
    "n_i_gazebo": "Gazebo",
    "n_i_shed": "Garden shed",
    "n_i_planter": "Planter box",
    "n_i_birdbath": "Birdbath",
    "n_i_lamppost": "Lamp post",
    "n_i_pathlight": "Path light",
    "n_i_porchlight": "Porch light",
    "n_i_floodlight": "Floodlight",
    "n_i_mailbox": "Mailbox",
    "n_i_bikerack": "Bike rack",
    "n_i_court": "Basketball court",
    "n_i_pavilion": "Pavilion",
    "n_i_parking": "Parking lot",
    "n_i_dumpster": "Dumpster",
    "n_i_condenser": "AC condenser",
    "n_i_bins": "Trash and recycling bins",
    "n_i_gate": "Gate",
    "n_i_workbench": "Workbench",
    "n_i_shelving": "Storage shelving",
    "n_i_toolchest": "Tool chest",
    "n_i_furnace": "Furnace",
    "n_i_gondola": "Aisle shelving",
    "n_i_checkout": "Checkout",
    "n_i_cooler": "Glass-door cooler",
    "n_i_display": "Display table",
    "n_i_register": "Cash register",
    "n_i_schooldesk": "School desk",
    "n_i_outlet": "Outlet",
    "n_i_lightswitch": "Light switch",
    "n_i_breaker": "Breaker panel",
    "n_i_post": "Post",
    "wk_i_consoletable": "drops the keys on the console table",
    "wk_i_sideboard": "gets out the good plates",
    "wk_i_chaise": "stretches out on the chaise",
    "wk_i_rocker": "rocks in the rocking chair",
    "wk_i_hutch": "admires the china",
    "wk_i_barcart": "mixes a drink",
    "wk_i_highchair": "feeds the baby",
    "wk_i_daybed": "lies down for a while",
    "wk_i_floormirror": "checks their outfit",
    "wk_i_toybox": "puts the toys away",
    "wk_i_standdesk": "works standing up",
    "wk_i_lshapedesk": "works at the corner desk",
    "wk_i_oven": "bakes a cake",
    "wk_i_winecooler": "chooses a bottle of wine",
    "wk_i_freezer": "gets something from the freezer",
    "wk_i_cornertub": "has a long soak",
    "wk_i_linencab": "gets a fresh towel",
    "wk_i_whiteboard": "writes on the whiteboard",
    "wk_i_dartboard": "throws a few darts",
    "wk_i_evcharger": "plugs in the car",
    "wk_i_treadmill": "goes for a run",
    "wk_i_exbike": "rides the exercise bike",
    "wk_i_weightbench": "lifts some weights",
    "wk_i_yogamat": "does some yoga",
    "wk_i_pooltable": "plays a game of pool",
    "wk_i_pingpong": "plays ping-pong",
    "wk_i_easel": "paints a picture",
    "wk_i_trampoline": "bounces on the trampoline",
    "wk_i_swing": "goes on the swing",
    "wk_i_firepit": "lights the fire pit",
    "wk_i_lounger": "lies in the sun",
    "wk_i_gazebo": "sits in the gazebo",
    "wk_i_shed": "gets the lawnmower out",
    "wk_i_planter": "waters the planter",
    "wk_i_birdbath": "fills the birdbath",
    "wk_i_lamppost": "turns on the outside light",
    "wk_i_pathlight": "turns on the path light",
    "wk_i_porchlight": "turns on the porch light",
    "wk_i_floodlight": "switches on the floodlight",
    "wk_i_mailbox": "checks the mail",
    "wk_i_bikerack": "gets their bike",
    "wk_i_court": "shoots some hoops",
    "wk_i_pavilion": "has a picnic in the pavilion",
    "wk_i_dumpster": "takes the trash to the dumpster",
    "wk_i_condenser": "checks the air conditioner",
    "wk_i_bins": "takes out the trash",
    "wk_i_gate": "lets people through the fence",
    "wk_i_workbench": "fixes something at the workbench",
    "wk_i_shelving": "finds a box on the shelves",
    "wk_i_toolchest": "gets a wrench",
    "wk_i_furnace": "turns up the heat",
    "wk_i_gondola": "takes something off the shelf",
    "wk_i_checkout": "pays at the checkout",
    "wk_i_cooler": "takes out a cold drink",
    "wk_i_display": "picks out some fruit",
    "wk_i_register": "rings it up",
    "wk_i_schooldesk": "sits down for the lesson",
    "wk_i_outlet": "plugs something in",
    "wk_i_lightswitch": "flips the light switch",
    "wk_i_breaker": "checks the breakers",
    "wk_i_post": "leans on the post",
    # ---- doors, as they are made (40-doors.js, 2026-10-03)
    "dd_head": "Door",
    "dd_handle": "Handle",
    "dd_metal": "Hardware",
    "dd_finish": "Finish",
    "dd_hinges": "Hinges",
    "dd_left": "Left",
    "dd_right": "Right",
    "dd_opens": "Opens to",
    "dd_st_flush": "Flush",
    "dd_st_panel6": "Six-panel",
    "dd_st_panel2": "Two-panel",
    "dd_st_shaker": "Shaker",
    "dd_st_craftsman": "Craftsman",
    "dd_st_halfglass": "Half glass",
    "dd_st_french": "French",
    "dd_st_modern": "Modern",
    "dd_st_barn": "Barn",
    "dd_st_louver": "Louvered",
    "dd_st_storefront": "Shop front",
    "dd_hd_lever": "Lever",
    "dd_hd_knob": "Knob",
    "dd_hd_pull": "Pull",
    "dd_mt_brass": "Brass",
    "dd_mt_chrome": "Chrome",
    "dd_mt_black": "Matte black",
    "dd_mt_bronze": "Bronze",
    "dd_mt_nickel": "Nickel",
    "dd_fin_drawn": "As drawn",
    "dd_fin_white": "White",
    "dd_fin_oak": "Oak",
    "dd_fin_walnut": "Walnut",
    "dd_fin_black": "Black",
    "dd_fin_sage": "Sage",
    "dd_fin_navy": "Navy",
    "dd_fin_red": "Red",
    "dd_ajar": "Ajar",
    "dd_wide": "Open",
    "dd_shut": "Shut",
    # ---- going between floors, walking round (40-climb.js, 2026-10-03)
    "lf_panel": "Elevator buttons",
    "lf_going": "Doors closing",
    "lf_here": "{floor}",
    "lf_called": "Elevator here",
    # ---- what is done, seen being done (40-use3d.js, 2026-10-03)
    "us_plugged": "Plugged in: {what}",
    "us_plugged_none": "Plugged in",
    "us_unplugged": "Unplugged: {what}",
    "us_unplugged_none": "Unplugged",
    # ---- moving things about in 3D (40-edit3d.js, 2026-10-03)
    "e3_back": "No room there: put back",
    "e3_turn": "Turn",
    "e3_turn_tip": "Turn it a quarter round (R)",
    "e3_delete": "Delete",
    "e3_delete_tip": "Take it away (Delete)",
    "e3_done": "Done",
    "e3_no_turn": "No room to turn it",
    "e3_deleted": "{what} taken away",
    "e3_undone": "Undone",
    "e3_redone": "Redone",
    # ---- round a building, for what it is (40-grounds.js, 2026-10-03)
    "gr_head": "Grounds",
    "gr_tab_building": "Building",
    "gr_building": "The building",
    "yd_parking": "Parking",
    "yd_bikes": "Bike racks",
    "yd_benches": "Benches",
    "yd_lamps": "Lampposts",
    "yd_planters": "Planters",
    "yd_seating": "Outdoor tables",
    "yd_playground": "Playground",
    "yd_sharedpool": "Pool and loungers",
    "yd_bbq": "Barbecue area",
    "yd_carts": "Cart bay",
    # ---- how open a house is (39-starter.js, 2026-10-03)
    "st_layout_head": "Layout",
    "lay_classic": "Separate rooms",
    "lay_semi": "Kitchen and dining together",
    "lay_open": "Open concept",
    "lay_great": "Great room",
    "zn_head": "Plan",
    "zn_any": "Any (Shuffle)",
    "zn_together": "Bedrooms together",
    "zn_split": "Split bedrooms",
    "zn_wing": "Bedroom wing",
    "zn_downstairs": "Main bedroom downstairs",
    "od_one": "Make one room",
    "od_own": "Make it its own room",
    "od_apart": "Split back into rooms",
    # ---- what holds a building up (40-struct.js, 2026-10-03)
    "sx_head": "Structure",
    "sx_wood": "Wood frame",
    "sx_steel": "Steel frame",
    "sx_shown": "Beams on show",
    # ---- up under the roof (40-attic.js, 2026-10-03)
    "at_head": "Attic",
    "at_none": "None",
    "at_storage": "Storage",
    "at_room": "Finished room",
    "at_garage_head": "Over the garage",
    "atg_none": "Nothing",
    "atg_storage": "Storage",
    "atg_room": "Bonus room",
    "at_room_name": "Attic room",
    "at_store_name": "Attic",
    "at_bonus_name": "Bonus room",
    "at_garage_name": "Storage loft",
    "at_shed_loft": "Lofts in sheds",
    "fl_attic": "Attic",
    # ---- a house's systems, the parts of them (40-systems.js, 2026-10-03)
    "n_i_smoke": "Smoke alarm",
    "n_i_thermostat": "Thermostat",
    "n_i_waterheater": "Water heater",
    "n_i_exhaustfan": "Bath fan",
    "wk_i_smoke": "tests the alarm",
    "wk_i_thermostat": "turns the heat up",
    "wk_i_waterheater": "checks the water heater",
    "wk_i_exhaustfan": "turns the fan on",
    # ---- a house's systems, set and seen (40-systems.js, 2026-10-03)
    "xr_insulation": "Insulation",
    "xr_fire": "Sprinklers",
    "fs_exit": "EXIT",
    "xr_low": "Data, TV and alarms",
    "xs_15": "15 A",
    "xs_20": "20 A",
    "xs_30": "30 A",
    "xs_50": "50 A",
    "xs_ground": "Ground rod",
    "xs_media": "Network box",
    "xs_shutoff": "Main shutoff",
    "xs_condenser": "AC unit",
    "xs_return": "Return air",
    "dy_head": "Wiring, plumbing, heating",
    "dy_auto": "Automatic",
    "dy_diy": "Do it yourself",
    "dy_fix": "Put one in",
    "dy_no_panel": "The house has no breaker panel",
    "dy_no_outlet": "No outlet in {room}",
    "dy_no_switch": "No light switch in {room}",
    "dy_no_smoke": "{room} needs a smoke alarm",
    "dy_no_fan": "{room} needs a fan to the outside",
    "dy_no_vent": "No heating vent in {room}",
    "dy_no_heater": "Nothing heats the water",
    "dy_no_thermo": "No thermostat for the heating",
    # ---- skyscrapers (40-towers.js, 2026-10-03)
    "ty_tower": "Skyscraper",
    "sk_lobby": "Lobby",
    "sk_sky": "Sky lounge",
    "sk_use_head": "Used for",
    "sk_offices": "Offices",
    "sk_homes": "Homes",
    "sk_mixed": "Offices and homes",
    "sk_form_head": "Form",
    "sk_spire": "Spiral setbacks",
    "sk_twist": "Twisting",
    "sk_pagoda": "Stacked pagoda",
    "sk_deco": "Art deco",
    "sk_diagrid": "Diagrid",
    "sk_star": "Star plan",
    "sk_chamfer": "Chamfered",
    "sk_taper": "Square to round",
    "sk_forest": "Vertical forest",
    "sk_slab": "Glass slab",
    # ---- using a house's systems (40-systems.js, 2026-10-03)
    "us_smoke": "Beep! Beep! Beep! The alarm works",
    "us_thermo": "Heating set to {t}",
    # ---- more rooms for a house (40-rooms.js, 2026-10-03)
    "hx_head": "More rooms",
    "hx_pantry": "Pantry",
    "hx_coat": "Coat closet",
    "hx_mudroom": "Mudroom",
    "hx_playroom": "Playroom",
    "hx_media": "Media room",
    "hx_gym": "Home gym",
    "hx_library": "Library",
    "hx_sunroom": "Sunroom",
}

speaks("en", "English", EN)
