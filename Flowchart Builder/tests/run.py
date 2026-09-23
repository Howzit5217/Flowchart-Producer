#!/usr/bin/env python3
"""Everything worth checking about the Flowchart Builder, in one command.

    python tests/run.py            run them all
    python tests/run.py -q         only say what failed
    python tests/run.py --only shapes    just the checks whose name has that in

Each of these was a bug once.  Rather than fix a chart by eye and hope, the
thing that was wrong was written down as something countable, so that the fix
could be shown to work -- and, far more usefully, shown to still work months
later.  Nothing here needs anything installed; where node is about, a few more
checks run that need it.

What is beside this file
------------------------
    programs/     six pseudocode programs, between them using every kind of
                  statement there is: declarations, a run of Displays, input,
                  If and Else If, nested loops, a Do ... Until, a For, a
                  Select Case, and a program written as modules -- which is
                  several flowcharts rather than one.  Most of the checks
                  draw all six at four shapes and three seeds and then
                  measure the result: no line doubling back, no shape over
                  another, every shape on the grid.  They are the checks'
                  subject matter, and without them nothing here runs at all.
    charts.py     the measuring: reading an .svg back and counting what is
                  wrong with it.
    router.js     the by-hand arrow router, lifted out of the page's script
                  and tried in every arrangement.  Only where node is
                  installed.
    program.js    the runner itself, lifted out the same way: it runs real
                  programs with a stand-in for the browser and reads the
                  tape afterwards, which is the only way to tell a chart
                  that is drawn from a chart that works.  node as well.
    written.py    a shelf of programs, and the means to really run the
                  Python, Java, C#, C++ and JavaScript that As code writes
                  from them -- whichever of those this machine can run.
"""
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

HERE = os.path.dirname(os.path.abspath(__file__))
HOME = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import charts                                       # noqa: E402
import written                                      # noqa: E402

# What is checked is the package -- it is the code, and it is the only copy
# of it.  The website runs these very files in the browser, so there is
# nothing built to check as well.
sys.path.insert(0, HOME)
RUN = [sys.executable, "-m", "flowchart"]
PROGRAMS = sorted(f for f in os.listdir(os.path.join(HERE, "programs"))
                  if f.endswith(".txt"))

done = []                                           # (name, ok, what it found)


def check(name):
    """Name a check; the function it wraps returns (ok, what it found)."""
    def keep(fn):
        done.append((name, fn))
        return fn
    return keep


def builder():
    """The package, with everything it offers in one place to ask.

    The modules keep their own names -- settings.VGAP is settings.VGAP --
    but a check wants one handle, so this hands back an object that reaches
    into all of them.  Anything set on it lands in the module that owns it,
    which is the point: that is how --seed and --roomy reach it too.
    """
    if not hasattr(builder, "it"):
        import flowchart
        from flowchart import measure, settings, shapes
        from flowchart.draw import arrows, grid, outlines, svg
        from flowchart.layout import blocks, columns
        from flowchart.make import chart, fit, legend, shake
        from flowchart.parse import clean, data, keywords, nodes, read, trouble
        from flowchart.studio import drawing, serve, site, web
        from flowchart.words import lookup

        from flowchart import page, parts

        holds = [settings, measure, shapes, page, parts, lookup, chart,
                 shake, fit, legend, svg, grid, outlines, arrows,
                 blocks, columns, read, data, clean, nodes, keywords,
                 trouble, drawing, site, serve, web]

        class Everything(object):
            """Every module of the package, answering as one."""

            def __getattr__(self, name):
                for mod in holds:
                    if hasattr(mod, name):
                        return getattr(mod, name)
                raise AttributeError(name)

            def __setattr__(self, name, value):
                for mod in holds:
                    if hasattr(mod, name):
                        setattr(mod, name, value)
                        return
                raise AttributeError(name)

        builder.it = Everything()
    return builder.it


def drawn(program, **how):
    """One chart, as SVG, with the settings put back afterwards.  The
    program is one of the files beside this, or given as text=."""
    fb = builder()
    text = how.get("text") or io.open(os.path.join(HERE, "programs", program),
                                      encoding="utf-8").read()
    keep = (fb.SHAPE, fb.VARIETY, fb.SHAKE)
    # Compressed, it is drawn the way the studio draws it: shaken, then
    # tightened.  What that changes is put back, because some of it -- the
    # wall round the paper, the gaps between charts -- no shake resets.
    spacing = {name: getattr(fb, name) for name in set(fb.TIGHT) | set(fb.ROOMY)}
    try:
        fb.SHAPE = how.get("shape", "auto")
        fb.VARIETY = how.get("variety", False)
        fb.SHAKE = None
        if how.get("seed") is not None:
            fb.style_variety(how["seed"])
        if how.get("tight"):
            for name, value in fb.TIGHT.items():
                setattr(fb, name, value)
        elif how.get("roomy"):
            for name, value in fb.ROOMY.items():
                setattr(fb, name, value)
        return fb.make_flowchart(text, title=how.get("title", "Test"),
                                 max_h=how.get("max_h", 0))
    finally:
        fb.SHAPE, fb.VARIETY, fb.SHAKE = keep
        for name, value in spacing.items():
            setattr(fb, name, value)


def every_chart():
    """A good spread of charts: each program, several shapes, several seeds,
    and each of them compressed as well -- the tightest a chart is drawn is
    where its lines, its words and its heads come closest to one another."""
    for program in PROGRAMS:
        for shape in ("auto", "page", "square", "wide"):
            for seed in (1, 4, 7):
                yield "%s %s seed %d" % (program[:-4], shape, seed), \
                      drawn(program, shape=shape, seed=seed)
                yield "%s %s seed %d compressed" % (program[:-4], shape, seed), \
                      drawn(program, shape=shape, seed=seed, tight=True)


# ---------------------------------------------------------- the lines on it --
@check("lines never double back")
def _():
    worst, hits = None, 0
    for name, svg in every_chart():
        n = charts.doubles_back(svg)
        hits += n
        if n and worst is None:
            worst = name
    return hits == 0, "%d found%s" % (hits, " (first: %s)" % worst if worst else "")


@check("no line wraps round its own shape")
def _():
    hits = sum(charts.wraps_a_shape(svg) for _, svg in every_chart())
    return hits == 0, "%d found" % hits


@check("no arrow point is painted over")
def _():
    hits = tips = 0
    for _, svg in every_chart():
        hits += charts.covered_tips(svg)
        tips += svg.count('class="head"')
    return hits == 0, "%d of %d tips covered" % (hits, tips)


# Two short boxes either side of a tall diamond.  Their answers go into
# them level with the middle of the diamond, so the branches end above its
# point -- and for most looks the two sides came back together on the point
# itself, a head on each, nose to nose.
SHORT_IF = """Start
Declare Integer n
Input n
If n > 10 Then
    Display "small"
Else
    Display "big"
End If
End
"""


@check("no two arrowheads crowd each other")
def _():
    hits = tips = 0
    first = None
    looks = [(name, svg) for name, svg in every_chart()]
    looks += [("short If seed %d" % seed, drawn(None, text=SHORT_IF, seed=seed))
              for seed in range(1, 61)]
    looks += [("short If seed %d compressed" % seed,
               drawn(None, text=SHORT_IF, seed=seed, tight=True))
              for seed in range(1, 61)]
    for name, svg in looks:
        n = charts.crowded_heads(svg)
        hits += n
        tips += svg.count('class="head"')
        if n and first is None:
            first = name
    return hits == 0, "%d pairs among %d heads%s" % (
        hits, tips, " (first: %s)" % first if first else "")


# Every kind of line that has a word written by it: the two sides of an If,
# an If with no Else and a Then too wide to fork, a chain of Else Ifs, a
# While, a For, a Do ... Until and a Do ... While, and a Select, one of
# whose cases has letters hanging below the line.
LABELLED = """Start
Declare Integer n
Input n
If n > 0 Then
    Display "positive"
Else
    Display "not positive"
End If
If n = 2 Then
    Display "two, and a long line of words to make it wide"
    Display "more words that go on and on for a while here"
    Set n = n + 1
End If
If n = 5 Then
    Display "five"
Else If n = 6 Then
    Display "six"
Else If n = 7 Then
    Display "seven"
Else
    Display "something else"
End If
While n < 10
    Set n = n + 1
End While
For i = 1 To 3
    Display i
End For
Do
    Set n = n - 1
Until n < 3
Do
    Set n = n + 2
While n < 20
Select Case n
    Case 1
        Display "Adding."
    Case 2
        Display "Removing."
    Case 3
    Case "yes"
    Default
        Display "Not on the menu."
End Select
End
"""


@check("no word on a line runs into a line, a head or a shape")
def _():
    """The Trues, Falses and Cases keep clear of everything drawn near
    them -- at the plain size, and with the words set bigger, where the
    lines they sit by have to grow to hold them."""
    fb = builder()
    hits = seen = 0
    first = None
    looks = list(every_chart())
    keep = (fb.CHAIN_LIMIT, fb.FOR_STYLE)
    try:
        for size in (11, 16, 24):
            fb.set_type({"size": size})
            for seed in (1, 4, 7):
                looks.append(("labelled at %dpx seed %d" % (size, seed),
                              drawn(None, text=LABELLED, shape="tall", seed=seed)))
                looks.append(("labelled at %dpx seed %d compressed" % (size, seed),
                              drawn(None, text=LABELLED, shape="tall", seed=seed,
                                    tight=True)))
            # and the Else Ifs queued down the page, the For as one hexagon
            fb.CHAIN_LIMIT, fb.FOR_STYLE = 0, "hexagon"
            looks.append(("labelled at %dpx, queued" % size,
                          drawn(None, text=LABELLED, shape="tall")))
            fb.CHAIN_LIMIT, fb.FOR_STYLE = keep
    finally:
        fb.set_type(None)
        fb.CHAIN_LIMIT, fb.FOR_STYLE = keep
    for name, svg in looks:
        n, of = charts.crowded_labels(svg, fb.text_w)
        hits += n
        seen += of
        if n and first is None:
            first = name
    return hits == 0, "%d of %d words too close%s" % (
        hits, seen, " (first: %s)" % first if first else "")


@check("a line coming back into the flow says which way")
def _():
    hits, first = 0, None
    for name, svg in every_chart():
        n = charts.bare_joins(svg)
        hits += n
        if n and first is None:
            first = name
    return hits == 0, "%d without a head%s" % (
        hits, " (first: %s)" % first if first else "")


FIZZ = """Start
Set i = 1
While i <= 15
    If i mod 15 = 0 Then
        Display "FizzBuzz"
    Else If i mod 3 = 0 Then
        Display "Fizz"
    Else If i mod 5 = 0 Then
        Display "Buzz"
    Else
        Display i
    End If
    Set i = i + 1
End While
Stop
"""


@check("a branch coming home says which way, however it is shaken")
def _():
    """The check above, over many more shakes of one chain of Else Ifs.

    How much line the layout keeps under a join is shaken with everything
    else, and on some shakes it came to nothing -- a line of no length, at
    the join, that read as a line running across and took the head off the
    branch coming home there: FizzBuzz's way back into the line down to
    Set i = i + 1.  The three seeds above never drew it."""
    fb = builder()
    hits, first, seen = 0, None, 0
    keep = fb.CHAIN_LIMIT
    try:
        for chains in (keep, 0):             # forked, and queued down the page
            fb.CHAIN_LIMIT = chains
            for shape in ("auto", "square", "wide"):
                for seed in range(1, 31):
                    for tight in (False, True):
                        n = charts.bare_joins(drawn("", text=FIZZ, shape=shape,
                                                    seed=seed, tight=tight))
                        seen += 1
                        hits += n
                        if n and first is None:
                            first = "%s seed %d%s%s" % (
                                shape, seed, " queued" if not chains else "",
                                " compressed" if tight else "")
    finally:
        fb.CHAIN_LIMIT = keep
    return hits == 0, "%d drawings, %d without a head%s" % (
        seen, hits, " (first: %s)" % first if first else "")


@check("no route takes more than five turns")
def _():
    worst = max(charts.most_turns(svg) for _, svg in every_chart())
    return worst <= 5, "worst is %d" % worst


@check("no two shapes overlap")
def _():
    hits = sum(charts.overlapping(svg) for _, svg in every_chart())
    return hits == 0, "%d found" % hits


@check("wrapping into columns never breaks a chart")
def _():
    bad = []
    for program in PROGRAMS:
        for height in (0, 400, 700, 1100, 1500, 2200):
            try:
                svg = drawn(program, max_h=height)
            except Exception as oops:                # noqa: BLE001
                bad.append("%s at %d: %s" % (program, height, oops))
                continue
            if charts.doubles_back(svg) or charts.wraps_a_shape(svg):
                bad.append("%s at %d" % (program, height))
    return not bad, "%d heights x %d programs%s" % (
        6, len(PROGRAMS), "" if not bad else " -- " + "; ".join(bad[:3]))


@check("shapes sit on the grid they are drawn over")
def _():
    fb = builder()
    off = seen = 0
    for _, svg in every_chart():
        a, b = charts.off_the_grid(svg, charts.grid_step(svg) or fb.GRID_STEP,
                                   charts.grid_from(svg))
        off += a
        seen += b
    share = 0 if not seen else off * 100.0 / seen
    return share < 2, "%d of %d edges off the ruling (%.0f%%)" % (off, seen, share)


def paper_size(svg):
    box = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    return float(box.group(1)), float(box.group(2))


@check("a shape asked for is the shape of the paper, in every design")
def _():
    """Square comes back square -- plain, compressed or roomy, whatever the
    program -- and so does every other shape asked for by name.  The sheet
    is written in whole pixels, so a pixel either way is all it may miss by."""
    fb = builder()
    bad, seen = [], 0
    for program in PROGRAMS:
        for shape in ("square", "wide", "page", "4:3"):
            want = fb.shape_target(shape)
            for design in ("plain", "tight", "roomy"):
                w, h = paper_size(drawn(program, shape=shape, seed=4,
                                        **({design: True} if design != "plain" else {})))
                seen += 1
                if abs(w - h * want) > 1.0 + want:
                    bad.append("%s %s %s: %gx%g" % (program[:-4], shape, design, w, h))
    return not bad, "%d drawings%s" % (seen, "" if not bad else " -- " + "; ".join(bad[:3]))


def designed(text, design):
    """The program read the way one design reads it, the settings put back."""
    fb = builder()
    change = {"tight": fb.TIGHT, "roomy": fb.ROOMY}.get(design, {})
    keep = {name: getattr(fb, name) for name in change}
    try:
        for name, value in change.items():
            setattr(fb, name, value)
        return fb.program_json(fb.parse_program(text))
    finally:
        for name, value in keep.items():
            setattr(fb, name, value)


@check("compressed and roomy are other charts of the same program")
def _():
    """Each design sets the program out differently -- compressed shares its
    shapes out among more steps, roomy among fewer -- and none of them
    changes a thing the program does: the same statements, in the same
    order, from the same lines, for the runner and the code writer alike."""
    fewer = more = 0
    bad = []
    for program in PROGRAMS:
        text = io.open(os.path.join(HERE, "programs", program), encoding="utf-8").read()
        said = {}
        shapes = {}
        for design in ("plain", "tight", "roomy"):
            ast = designed(text, design)
            said[design] = [(s.get("op"), s.get("line"), s.get("text")) for s in statements(ast)]
            shapes[design] = len(set(s.get("id") for s in statements(ast)))
        for design in ("tight", "roomy"):
            if said[design] != said["plain"]:
                bad.append("%s %s reads differently" % (program[:-4], design))
        if shapes["tight"] > shapes["plain"] or shapes["roomy"] < shapes["plain"]:
            bad.append("%s: %d / %d / %d shapes" % (program[:-4], shapes["tight"],
                                                    shapes["plain"], shapes["roomy"]))
        fewer += shapes["tight"] < shapes["plain"]
        more += shapes["roomy"] > shapes["plain"]
    ok = not bad and fewer * 2 >= len(PROGRAMS) and more * 2 >= len(PROGRAMS)
    return ok, "%d of %d programs in fewer shapes compressed, %d in more roomy%s" % (
        fewer, len(PROGRAMS), more, "" if not bad else " -- " + "; ".join(bad[:3]))


# What a few of the examples are for, said the way the page should say it.
# The rest only have to be called something other than their first line.
CALLED = {
    "e_add": "Adds two numbers",
    "e_decide": "Checks whether age >= 18",
    "e_count": "Counts from 1 to 5",
    "e_leap": "Checks whether a year is a leap year",
    "e_fizz": "Plays FizzBuzz",
    "e_countdown": "Counts down from 10",
    "e_sumevens": "Adds up the even numbers from 1 to 20",
    "e_votes": "Counts the votes and names the winner",
    "e_bank": "Keeps a bank balance, with deposits and withdrawals",
    "e_rps": "Plays rock, paper, scissors",
}

# And programs written the way a textbook exercise is, named for what they
# work out and called what they call it -- the value that grows by a rate
# each year, the tax it prints, the conversion it makes -- rather than
# "Counts from 1 to 5" for every one with a loop in it.
SHELF = {
    "shelf_tuition": ("Constant Real START_TUITION = 6000.00\n"
                      "Constant Real INCREASE_RATE = 0.02\n"
                      "Constant Integer NUM_YEARS = 5\n\n"
                      "Declare Real tuition = START_TUITION\n"
                      "Declare Integer year\n\n"
                      "Display \"Projected semester tuition for the next five years:\"\n\n"
                      "For year = 1 To NUM_YEARS\n"
                      "    Set tuition = tuition * (1 + INCREASE_RATE)\n"
                      "    Display \"Year \", year, \": $\", tuition\n"
                      "End For", "Tuition Increase"),
    "shelf_tax": ("Constant Real STATE_RATE = 0.05\n"
                  "Constant Real COUNTY_RATE = 0.025\n"
                  "Declare Real purchase\n"
                  "Input purchase\n"
                  "Set stateTax = purchase * STATE_RATE\n"
                  "Set countyTax = purchase * COUNTY_RATE\n"
                  "Set totalTax = stateTax + countyTax\n"
                  "Display \"State sales tax: $\", stateTax\n"
                  "Display \"County sales tax: $\", countyTax\n"
                  "Display \"Total sales tax: $\", totalTax", "Sales Tax"),
    "shelf_distance": ("Input speed\n"
                       "Input hours\n"
                       "Display \"Hour    Distance Traveled\"\n"
                       "For hour = 1 To hours\n"
                       "    Set distance = speed * hour\n"
                       "    Display hour, \"       \", distance\n"
                       "End For", "Distance Traveled"),
    "shelf_bmi": ("Input weight\n"
                  "Input height\n"
                  "Set bmi = weight * 703 / (height * height)\n"
                  "Display \"Your body mass index is \", bmi\n"
                  "If bmi < 18.5 Then\n"
                  "    Display \"Underweight\"\n"
                  "End If", "Body Mass Index"),
    "shelf_land": ("Constant Integer SQFT_PER_ACRE = 43560\n"
                   "Declare Real squareFeet\n"
                   "Input squareFeet\n"
                   "Set acres = squareFeet / SQFT_PER_ACRE\n"
                   "Display \"That is \", acres, \" acres.\"", "Square Feet to Acres"),
    "shelf_depreciation": ("Constant Real LOSS_RATE = 0.15\n"
                           "Declare Real carValue = 20000\n"
                           "For year = 1 To 6\n"
                           "    Set carValue = carValue * (1 - LOSS_RATE)\n"
                           "    Display \"Year \", year, \": $\", carValue\n"
                           "End For", "Car Value Decrease"),
}


@check("a program nobody named is called what it does")
def _():
    """No title, and the page names the program from what it is for -- a
    leap year, a countdown, a bank account, a tuition that goes up by two
    percent a year -- rather than from its first line, which is nearly
    always a Declare.  Every example, every puzzle and the shelf above is
    asked, in each of the page's languages."""
    if not node_there():
        return None, "node is not installed -- skipped"
    fb = builder()
    bad, seen = [], 0
    called = dict(CALLED, **{key: pair[1] for key, pair in SHELF.items()})
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False,
                                     encoding="utf-8") as shelf:
        json.dump([[key, pair[0]] for key, pair in SHELF.items()], shelf)
    for lang in sorted(fb.WORDS):
        with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False,
                                         encoding="utf-8") as words:
            json.dump(fb.WORDS[lang], words)
        try:
            got = subprocess.run(["node", os.path.join(HERE, "names.js"), words.name,
                                  shelf.name],
                                 capture_output=True, text=True, encoding="utf-8",
                                 timeout=60)
        finally:
            os.unlink(words.name)
        if got.returncode:
            os.unlink(shelf.name)
            return False, got.stderr.strip()[-300:]
        for key, name in json.loads(got.stdout):
            seen += 1
            if not name or "{" in name:
                bad.append("%s %s: %r" % (lang, key, name))
            elif lang == "en" and key in called and name != called[key]:
                bad.append("%s: %r, not %r" % (key, name, called[key]))
    os.unlink(shelf.name)
    return not bad, "%d programs named%s" % (seen, "" if not bad else " -- " + "; ".join(bad[:3]))


# ------------------------------------------------------------- the shapes --
@check("every shape is drawn, named and sized")
def _():
    fb = builder()
    missing = [k for k in fb.SHAPE_ORDER if k not in fb.SHAPES]
    unnamed = []
    for code in fb.WORDS:
        unnamed += ["%s/%s" % (code, k) for k in fb.SHAPE_ORDER
                    if ("n_" + k) not in fb.WORDS[code]]
    return not missing and not unnamed, "%d shapes, %d languages%s" % (
        len(fb.SHAPE_ORDER), len(fb.WORDS),
        "" if not (missing or unnamed) else " -- %s %s" % (missing, unnamed[:4]))


@check("every shape can stand in for any step")
def _():
    fb = builder()
    text = io.open(os.path.join(HERE, "programs", "tip.txt"), encoding="utf-8").read()
    bad = []
    for kind in fb.SHAPE_ORDER:
        try:
            fb.GEOM["rect"] = kind
            svg = fb.make_flowchart(text, title="Test")
            if "<svg" not in svg:
                bad.append(kind)
        except Exception:                            # noqa: BLE001
            bad.append(kind)
        finally:
            fb.GEOM["rect"] = fb.DEFAULT_GEOM["rect"]
    return not bad, "%d tried%s" % (len(fb.SHAPE_ORDER),
                                    "" if not bad else " -- " + ", ".join(bad))


@check("every word the page asks for is a word we have")
def _():
    """The page names its words twice over: once as __W(key)__, which is
    filled in when the page is poured together, and once as data-w="key",
    which is how the script puts the page into another language without
    reloading it.

    A key that is not a word fails neither time.  __W(bad)__ comes out
    empty, so the button is built blank; data-w="bad" reads nothing back,
    so the button goes blank the moment somebody changes the language --
    which is the worse of the two, because it is a control that was there a
    second ago and is not there now, and nothing anywhere says why.
    """
    import re as _re
    fb = builder()
    have = set(fb.WORDS["en"])
    bad = []
    for name in ("studio.html", "source-panel.html"):
        text = fb.read_ui(name)
        for want in (_re.findall(r"__W\((\w+)\)__", text) +
                     _re.findall(r'data-w(?:-title)?="(\w+)"', text)):
            if want not in have:
                bad.append("%s: %s" % (name, want))
    return not bad, "%d words%s" % (
        len(have), "" if not bad else " -- " + ", ".join(sorted(set(bad))[:4]))


@check("every language says everything")
def _():
    fb = builder()
    full = set(fb.WORDS["en"])
    short = {code: sorted(full - set(fb.WORDS[code])) for code in fb.WORDS}
    missing = {c: w for c, w in short.items() if w}
    return not missing, "%d languages%s" % (
        len(fb.WORDS), "" if not missing else " -- " + str(missing)[:90])


@check("every language fills in the same blanks")
def _():
    """A line says "{n} lines" and its translation says "{lineas}".

    Nothing would fail.  The word is simply never filled in, and the page
    shows a reader the inside of the program -- a literal {n} where a number
    was meant.  Cheap to find, invisible otherwise."""
    import re as _re
    fb = builder()
    bad = []
    for key, said in fb.WORDS["en"].items():
        want = set(_re.findall(r"\{(\w+)\}", said))
        for code, words in fb.WORDS.items():
            if code == "en" or key not in words:
                continue
            got = set(_re.findall(r"\{(\w+)\}", words[key]))
            if got != want:
                bad.append("%s/%s wants %s, has %s"
                           % (code, key, sorted(want) or "nothing",
                              sorted(got) or "nothing"))
    return not bad, "%d keys x %d languages%s" % (
        len(fb.WORDS["en"]), len(fb.WORDS) - 1,
        "" if not bad else " -- " + "; ".join(bad[:3]))


@check("a language names itself, and nothing names it twice")
def _():
    """Adding a language used to mean editing three places: the table, the
    names beside the picker, and the imports.  Now the file says who it is
    and the rest follows, so this is here to keep it that way."""
    fb = builder()
    folder = os.path.join(HOME, "flowchart", "words")
    files = sorted(f[:-3] for f in os.listdir(folder)
                   if f.endswith(".py") and f not in ("__init__.py", "lookup.py"))
    known = sorted(fb.WORDS)
    named = [c for c in known if fb.NAMES.get(c)]
    return files == known and len(named) == len(known), \
        "%d files, %d registered, %d named" % (len(files), len(known), len(named))


# ------------------------------------------------- pointing at the trouble --
# A chart that draws is only half of it.  When a run stops, or the reading
# has to paper something over, the answer has to say *where* -- and that
# rests on every statement carrying the number of the line it was typed on.
# Each of these was wrong once: an Else If that carried no number at all, a
# run of Displays where all five claimed the first one's line, and a Start
# that borrowed whichever line happened to be read last.
def statements(ast):
    """Every statement in a program, whatever it is nested inside."""
    def walk(items):
        for item in items or []:
            yield item
            for key in ("then", "else", "body"):
                for deep in walk(item.get(key)):
                    yield deep
            for case in item.get("cases") or []:
                for deep in walk(case["body"]):
                    yield deep
    for item in walk(ast["main"]):
        yield item
    for mod in ast["modules"]:
        for item in walk(mod["body"]):
            yield item


def read_as_data(text):
    fb = builder()
    return fb.program_json(fb.parse_program(text))


@check("every statement points at the line it came from")
def _():
    fb = builder()
    bad, seen = [], 0
    for program in PROGRAMS:
        text = io.open(os.path.join(HERE, "programs", program),
                       encoding="utf-8").read()
        lines = text.splitlines()
        for item in statements(read_as_data(text)):
            at = item.get("line") or 0
            if not at:                          # a Start or End nobody typed
                continue
            seen += 1
            if at > len(lines):
                bad.append("%s: line %d of %d" % (program, at, len(lines)))
                continue
            first = (item.get("text") or item.get("cond") or
                     item.get("expr") or "").strip().split(" ")[0]
            said = fb.tidy(fb.clean(lines[at - 1]))
            if first and first.lower() not in said.lower():
                bad.append("%s line %d: %r is not in %r"
                           % (program, at, first, said[:40]))
    return not bad, "%d statements%s" % (
        seen, "" if not bad else " -- " + "; ".join(bad[:3]))


@check("an Else If is numbered like every other statement")
def _():
    text = ("Start\nInput score\nIf score >= 90 Then\n    Display \"A\"\n"
            "Else If score >= 80 Then\n    Display \"B\"\n"
            "Else If score >= 70 Then\n    Display \"C\"\n"
            "Else\n    Display \"F\"\nEnd If\nEnd\n")
    tests = [i for i in statements(read_as_data(text)) if i.get("op") == "if"]
    numbered = [i for i in tests if i["id"] and i["line"]]
    ids = set(i["id"] for i in tests)
    return len(tests) == 3 and len(numbered) == 3 and len(ids) == 3, \
        "%d of %d numbered, %d different" % (len(numbered), len(tests), len(ids))


@check("a run of Displays keeps each line of its own")
def _():
    text = ("Start\n" + "".join('Display "line %d"\n' % n for n in range(1, 6))
            + "End\n")
    said = [i for i in statements(read_as_data(text)) if i.get("op") == "display"]
    want = list(range(2, 7))
    got = [i["line"] for i in said]
    return got == want, "%s" % (got if got != want else "lines 2 to 6")


@check("a wait is read as a length of time, and only when it is one")
def _():
    want = [
        ("Wait 2 seconds", "wait", "2", "s"),
        ("Pause 500 ms", "wait", "500", "ms"),
        ("Delay random(1, 3) seconds", "wait", "random(1, 3)", "s"),
        ("Wait for 1.5 s", "wait", "1.5", "s"),
        ("sleep(250 ms)", "wait", "250", "ms"),
        ("Wait n", "wait", "n", "s"),
        # Not one of them: there is no length of time anywhere in it.
        ("Wait until done", "other", None, None),
        # Nor these: a name that merely begins with one of the words.
        ("Set waiter = 3", "set", None, None),
        ("Display waits", "display", None, None),
    ]
    fb = builder()
    bad = []
    for text, op, expr, unit in want:
        got = fb.statement_json(text, 1, 1)
        if got.get("op") != op:
            bad.append("%r read as %s, not %s" % (text, got.get("op"), op))
        elif op == "wait" and (got.get("expr"), got.get("unit")) != (expr, unit):
            bad.append("%r waits %r %s, not %r %s"
                       % (text, got.get("expr"), got.get("unit"), expr, unit))
    return not bad, "%d lines%s" % (len(want),
                                    "" if not bad else " -- " + "; ".join(bad[:3]))


@check("a block left open is reported, with its line")
def _():
    fb = builder()
    open_if = ("Start\nDeclare Integer n\nSet n = 5\nIf n > 3 Then\n"
               "    Display \"big\"\nDisplay \"always\"\nEnd\n")
    shut = open_if.replace('Display "always"', "End If\nDisplay \"always\"")
    found = read_as_data(open_if)["problems"]
    quiet = read_as_data(shut)["problems"]
    stray = read_as_data("Start\nDisplay \"hi\"\nEnd If\nEnd\n")["problems"]
    ok = (len(found) == 1 and found[0]["line"] == 4
          and found[0]["why"] == "w_open_if"
          and not quiet
          and len(stray) == 1 and stray[0]["line"] == 3)
    return ok, "%d open, %d when closed, %d stray" % (len(found), len(quiet),
                                                      len(stray))


@check("the words are measured the same however often they are asked for")
def _():
    """The widths are kept rather than worked out again, which is what makes
    a big chart quick -- but a kept width that outlives the size it was
    measured at would size every box wrongly and silently."""
    fb = builder()
    keep = fb.FONT_SIZE
    try:
        small = fb.text_w("Display the total")
        fb.FONT_SIZE = keep * 2
        big = fb.text_w("Display the total")
        fb.FONT_SIZE = keep
        again = fb.text_w("Display the total")
    finally:
        fb.FONT_SIZE = keep
    ok = abs(big - small * 2) < 1e-9 and again == small
    return ok, "%.1f at %d, %.1f at %d" % (small, keep, big, keep * 2)


@check("words set bigger, bolder or in another face still fit their boxes")
def _():
    """The Style side can make every step's words bigger, or bold, or set
    them in a face whose widths only the browser knows -- and can set one
    step's words apart from the rest.  All of that has to reach the layout,
    or the boxes are drawn for the plain words and the new ones spill out
    over the outline.  So the drawing is asked for all of it at once, and
    every line of every shape is measured against the room its shape gave
    it -- and asked for nothing, it has to be the plain chart again."""
    fb = builder()
    text = io.open(os.path.join(HERE, "programs", PROGRAMS[0]),
                   encoding="utf-8").read()
    # A face a fifth wider than Arial throughout: nothing the drawing
    # carries, so it can only be measured in it if it was handed the widths.
    wide = {"n": [w * 1.2 for w in fb._ADV_N], "b": [w * 1.2 for w in fb._ADV_B]}
    # And the step with the longest word in it, set at 72 points -- the top
    # of the list the page offers, 66 pixels -- where that word is wider on
    # its own than any box is allowed to be at the plain size.
    first = [e for e in fb.fit_shape(fb.parse_program(text), "auto")
             if e[0] == "shape" and len(e) > 7 and e[7] and e[6]]
    longest = max(first, key=lambda e: max(len(w) for w in " ".join(e[6]).split()))
    own = {str(longest[7]): {"size": 66, "bold": False}}

    def shapes(asked):
        fb.style_variety(3)
        fb.set_type(asked)
        return [e for e in fb.fit_shape(fb.parse_program(text), "auto")
                if e[0] == "shape" and e[6]]

    keep = (fb.SHAPE, fb.VARIETY, fb.SHAKE)
    try:
        plain = shapes(None)
        big = shapes({"size": 17, "bold": True, "widths": wide, "own": own})
        spill = []
        for e in big:
            size, bold = fb.type_of(e[7] if len(e) > 7 else 0)
            drawn = fb.SHAPES.get(fb.geom_of(e[1]), fb.SHAPES["rect"])
            room = e[4] * 0.55 if drawn.get("wide") else e[4] - drawn["side"]
            for line in e[6]:
                over = fb.text_w(line, size, bold) - room
                if over > 0.01:
                    spill.append("%s by %.1f" % (line[:20], over))
        again = shapes(None)
    finally:
        fb.set_type(None)
        fb.SHAPE, fb.VARIETY, fb.SHAKE = keep
    # Wrapped, never cut: every step says the same words, whole, at any size.
    words = lambda es: dict((e[7], " ".join(e[6]).split())
                            for e in reversed(es) if len(e) > 7)
    was, now = words(plain), words(big)
    cut = [" ".join(now[k])[:24] for k in was if k in now and now[k] != was[k]]
    # Bigger words take more room -- wider boxes as well as taller ones, now
    # that a box widens for them -- so it is the room that is compared.
    grew = sum(e[4] * e[5] for e in big) > sum(e[4] * e[5] for e in plain) * 1.2
    same = [e[:7] for e in again] == [e[:7] for e in plain]
    ok = not spill and not cut and grew and same
    return ok, "%d shapes at 17px bold in a wider face, one at 66px%s%s%s%s" % (
        len(big), "" if grew else " -- no bigger than plain",
        "" if same else " -- asked for nothing, not the plain chart",
        "" if not spill else " -- spilled: " + ", ".join(spill[:3]),
        "" if not cut else " -- words cut: " + ", ".join(cut[:3]))


@check("the page draws off its own thread")
def _():
    """Pyodide runs where it is called from, and a chart of a few thousand
    shapes is seconds of arithmetic: on the page's thread the tab stops
    dead.  It is handed to a worker instead, and this is here so that the
    worker cannot quietly go missing again."""
    fb = builder()
    page = fb.to_page(fb.make_flowchart("Start\nDisplay \"hi\"\nEnd\n",
                                        title="Test"), title="Test", web=True)
    has = [bit for bit in ("new Worker(", "importScripts(", "drawAside")
           if bit in page]
    return len(has) == 3, "%d of 3 signs of it" % len(has)


@check("every language it writes code in answers for itself")
def _():
    """The writer used to know each language by name in thirty-one places.
    It now reads a block per language, and a block that is missing one of
    the answers would write a chart out as `undefined`.  So: every block is
    asked for all of them."""
    fb = builder()
    page = fb.to_page(fb.make_flowchart("Start\nDisplay \"hi\"\nEnd\n",
                                        title="Test"), title="Test")
    got = re.search(r"var LANGS = \{(.*?)\n  \};", page, re.S)
    if not got:
        return False, "no table of languages in the page"
    inside = got.group(1)
    langs = re.findall(r"^    (\w+): \{", inside, re.M)
    wants = ["name", "ext", "say", "ask", "whole", "join", "test",
             "declare", "param", "repeat", "count", "pick",
             "kinds", "kept", "calls", "refs", "quit", "into"]
    shared = re.search(r"var CURLY = \{(.*?)\n  \};", page, re.S).group(1)
    bad = []
    for lang in langs:
        block = re.search(r"\n    %s: \{(.*?)\n    \}" % lang, inside, re.S)
        mine = block.group(1) if block else ""
        curly = "like: CURLY" in mine
        for want in wants:
            if re.search(r"(?<![\w.])%s:" % want, mine):
                continue
            if curly and re.search(r"(?<![\w.])%s:" % want, shared):
                continue
            bad.append("%s has no %s" % (lang, want))
    return len(langs) >= 4 and not bad, "%d languages, %d answers each%s" % (
        len(langs), len(wants), "" if not bad else " -- " + "; ".join(bad[:3]))


# ---------------------------------------------------------------- the build --
@check("the page asks for every module it needs, and no more")
def _():
    """The page fetches the package into the browser and imports it there,
    from a list worked out by following the imports.  A module missed off
    the list is a browser that cannot draw; a module on it that is only
    ever used from the command line is weight nobody needs.  Both used to
    be impossible to notice until the website was live."""
    fb = builder()
    asked = fb.needed()
    # everything on the list exists, and nothing on it is command-line only
    gone = [w for w in asked if not os.path.exists(os.path.join(HOME, w))]
    never = [w for w in ("flowchart/make/command.py", "flowchart/make/options.py",
                         "flowchart/studio/serve.py", "flowchart/studio/site.py",
                         "flowchart/parts.py") if w in asked]
    # and the drawing really does work with only those
    short = [w for w in ("flowchart/settings.py", "flowchart/parse/read.py",
                         "flowchart/layout/branches.py", "flowchart/layout/loops.py",
                         "flowchart/layout/cases.py", "flowchart/words/en.py",
                         "flowchart/layout/__init__.py", "flowchart/words/__init__.py")
             if w not in asked]
    kb = sum(os.path.getsize(os.path.join(HOME, w)) for w in asked
             if os.path.exists(os.path.join(HOME, w))) / 1024.0
    return not (gone or never or short), "%d modules, %d KB%s" % (
        len(asked), kb,
        "" if not (gone or never or short)
        else " -- missing %s, extra %s" % (short + gone, never))


@check("the page carries the list, and it matches")
def _():
    fb = builder()
    page = fb.to_page(fb.make_flowchart("Start\nDisplay \"hi\"\nEnd\n",
                                        title="Test"), title="Test", web=True)
    got = re.search(r"var PYFILES = (\[.*?\]);", page)
    if not got:
        return False, "the page does not say which modules to fetch"
    import json
    listed = json.loads(got.group(1))
    beside = fb.to_page(fb.make_flowchart("Start\nEnd\n", title="T"), title="T")
    quiet = re.search(r"var PYFILES = (\[.*?\]);", beside)
    return listed == fb.needed() and quiet and quiet.group(1) == "[]", \
        "%d in the site page, %s in a viewer" % (
            len(listed), quiet.group(1) if quiet else "?")


@check("no two parts of the page's script share a name")
def _():
    """The script's parts run inside one function and share everything,
    which is what lets a later part use what an earlier one made.  The cost
    is that two parts using the same name are not two things: the later
    declaration replaces the earlier, silently."""
    fb = builder()
    clash = fb.clashes()
    return not clash, "%d found%s" % (
        len(clash), "" if not clash else " -- " + ", ".join(c[0] for c in clash[:4]))


@check("the styling says the things browsers spell differently")
def _():
    """Three of these were bugs on a browser nobody here was looking at.

    `user-select` is not a property Safari has ever had under that name, so
    a rule that only says the plain one lets the page select text behind a
    chart being dragged.  `backdrop-filter` is the same story until Safari
    18.  And `r` -- the radius of a circle -- is a CSS property in some
    browsers and not in others, so sizing a thing somebody has to hit with a
    finger by CSS `r` sizes it on some phones and not on others; the dots on
    a shape are given their size in the script instead, where every browser
    understands it.

    None of these can be caught by drawing a chart and measuring it: they
    are a browser quietly ignoring a line.  So the lines themselves are what
    is counted.
    """
    import flowchart.parts as parts
    twins = ("user-select", "backdrop-filter")
    geometry = re.compile(r"(?<![-\w])(?:r|cx|cy)\s*:")
    bad = []
    for name in parts.CSS:
        text = re.sub(r"/\*.*?\*/", "", parts.read_ui(name), flags=re.S)
        for block in re.findall(r"\{([^{}]*)\}", text):
            for want in twins:
                said = re.search(r"(?<![-\w])%s\s*:" % want, block)
                if said and "-webkit-" + want not in block:
                    bad.append("%s: %s without -webkit-" % (name, want))
        # a touch target sized by a property not every browser has
        for at in re.finditer(r"@media[^{]*pointer\s*:\s*coarse[^{]*\{", text):
            depth, i = 1, at.end()
            while i < len(text) and depth:
                depth += (text[i] == "{") - (text[i] == "}")
                i += 1
            if geometry.search(text[at.end():i]):
                bad.append("%s: a finger-sized shape set by CSS r/cx/cy" % name)
    return not bad, "%d stylesheets%s" % (
        len(parts.CSS), "" if not bad else " -- " + "; ".join(sorted(set(bad))[:4]))


@check("every module can be imported on its own")
def _():
    """A package whose parts only work when the whole thing is read is a
    single file wearing a folder for a hat."""
    import importlib
    bad = []
    for root, folders, files in os.walk(os.path.join(HOME, "flowchart")):
        folders[:] = [f for f in folders if f not in ("ui", "__pycache__")]
        for name in sorted(files):
            if not name.endswith(".py") or name == "__main__.py":
                continue
            where = os.path.relpath(os.path.join(root, name),
                                    HOME)[:-3].replace(os.sep, ".")
            try:
                importlib.import_module(where)
            except Exception as oops:                # noqa: BLE001
                bad.append("%s: %s" % (where, oops))
    return not bad, "%d modules%s" % (
        len(bad) if bad else count_modules(),
        "" if not bad else " -- " + "; ".join(bad[:2]))


def count_modules():
    n = 0
    for root, folders, files in os.walk(os.path.join(HOME, "flowchart")):
        folders[:] = [f for f in folders if f not in ("ui", "__pycache__")]
        n += len([f for f in files if f.endswith(".py")])
    return n


@check("the command line still answers to everything")
def _():
    one = os.path.join(HERE, "programs", "bug-collector.txt")
    out = os.path.join(HERE, "_out.svg")
    flags = [["--lang", c] for c in ("en", "es", "fr", "de")]
    flags += [["--shape", s] for s in ("square", "wide", "page", "1920x1080")]
    flags += [["--legend"], ["--no-grid"], ["--mono"], ["--color"], ["--roomy"], ["--tight"],
              ["--no-variety"], ["--for-style", "expand"], ["--for-style", "hexagon"],
              ["--split"], ["--no-page"], ["--chain-limit", "0"],
              ["--columns-height", "900"], ["--seed", "7"]]
    bad = []
    for flag in flags:
        got = subprocess.run(RUN + [one, "-o", out] + flag,
                             cwd=HOME, capture_output=True, text=True)
        if got.returncode:
            bad.append(" ".join(flag))
    # --split writes one file per module -- _out_main.svg and the rest --
    # so sweeping for the exact two names left those behind in tests/ every
    # run, which is how two of them came to be sitting there for weeks.
    base = os.path.basename(out)[:-4]
    for leftover in os.listdir(HERE):
        if leftover.startswith(base) and leftover.endswith((".svg", ".html")):
            os.remove(os.path.join(HERE, leftover))
    return not bad, "%d flags%s" % (len(flags),
                                    "" if not bad else " -- " + ", ".join(bad))


@check("--serve opens with no terminal behind it")
def _():
    """It read stdin before it looked at --serve.

    Started from anything that is not a terminal -- a shortcut, a scheduled
    task, an editor's run button -- the studio got a pipe nobody would ever
    write to or close, sat there reading it, and never listened on the port
    at all.  So this starts it the way those do, with a pipe for stdin, and
    asks whether the port answers.
    """
    import socket
    port = 8779
    going = subprocess.Popen(RUN + ["--serve", str(port)],
                             cwd=HOME, stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    try:
        answered = False
        for _ in range(60):                          # up to six seconds
            if going.poll() is not None:
                break
            try:
                with socket.create_connection(("127.0.0.1", port), 0.2):
                    answered = True
                    break
            except OSError:
                time.sleep(0.1)
        return answered, "listening" if answered else "never listened"
    finally:
        going.kill()
        going.communicate()


@check("the website still writes itself, and carries what it runs")
def _():
    """Written somewhere other than here, the site has to take the package
    with it -- every module the page will ask the browser to fetch, at the
    path the page asks for it by.  One missing and the site is a page that
    cannot draw, which nothing notices until it is live."""
    fb = builder()
    where = os.path.join(HERE, "_site")
    got = subprocess.run(RUN + ["--site", where],
                         cwd=HOME, capture_output=True, text=True)
    ok = got.returncode == 0
    want = ("index.html", "README.md", ".nojekyll")
    there = [f for f in want if os.path.exists(os.path.join(where, f))]
    page = ""
    if os.path.exists(os.path.join(where, "index.html")):
        page = io.open(os.path.join(where, "index.html"), encoding="utf-8").read()
    # every module the page will go looking for is actually beside it
    asked = fb.needed()
    missing = [w for w in asked
               if not os.path.exists(os.path.join(where, w.replace("/", os.sep)))]
    import shutil
    shutil.rmtree(where, ignore_errors=True)
    big = len(page) > 200000
    return ok and len(there) == len(want) and big and not missing, \
        "%d files, %d modules beside them, page %d KB%s" % (
            len(there), len(asked) - len(missing), len(page) // 1024,
            "" if not missing else " -- missing " + ", ".join(missing[:3]))


@check("the seed is nowhere to be seen")
def _():
    fb = builder()
    text = io.open(os.path.join(HERE, "programs", "tip.txt"), encoding="utf-8").read()
    page = fb.to_page(fb.make_flowchart(text, title="Test"), title="Test")
    shown = 'id="f-seed"' in page or "· seed" in page
    return not shown, "not in the page"


# ------------------------------------------------- every chart, not just one --
# A program with modules is several flowcharts, and the runner used to be two
# runners: a whole one for the main chart, and beside it a handful of cases
# for everything else.  An If inside a module was stepped over, a loop in one
# never went round, a module could not be typed into, and what came back was
# quietly wrong.  These run real programs through the page's own runner and
# read the tape afterwards, which is the only way to tell the difference
# between a chart that is drawn and a chart that works.
RUNS = [
    ("a module's loops and branches really run", """
Module main()
    Declare Integer n
    Input n
    Display "Factorial: ", factorial(n)
    Call report(n)
End Module

Function Integer factorial(Integer k)
    Declare Integer acc
    Declare Integer i
    Set acc = 1
    For i = 1 To k
        Set acc = acc * i
    End For
    Return acc
End Function

Module report(Integer n)
    If n > 3 Then
        Display "That is a big one."
    Else
        Display "Small."
    End If
End Module
""", ["5"], ["Factorial: 120", "That is a big one.", {"key": "r_done"}], None),

    ("a wait is walked over, and what it waits is worked out", """
Start
Declare Integer pause
Set pause = 2
Display "before"
Wait pause seconds
Wait random(1, 3) seconds
Pause 500 ms
Display "after"
End
""", [], ["before", "after", {"key": "r_done"}], None),

    ("a While inside a module goes round", """
Module main()
    Call countTo(3)
End Module

Module countTo(Integer n)
    Declare Integer i
    Set i = 1
    While i <= n
        Display i
        Set i = i + 1
    End While
End Module
""", [], ["1", "2", "3", {"key": "r_done"}], None),

    ("a Select Case inside a module picks a branch", """
Module main()
    Call weekday(3)
End Module

Module weekday(Integer n)
    Select Case n
        Case 1
            Display "Monday"
        Case 3
            Display "Wednesday"
        Default
            Display "Some other day"
    End Select
End Module
""", [], ["Wednesday", {"key": "r_done"}], None),

    ("a module can be typed into, and hands the answer back", """
Module main()
    Declare Real hours
    Call getHours(hours)
    Display "You worked ", hours
End Module

Module getHours(Real Ref h)
    Display "How many hours?"
    Input h
End Module
""", ["7"], ["How many hours?", "You worked 7", {"key": "r_done"}], None),

    ("what is written outside every module, every module can read", """
Constant Real TAX = 0.1

Module main()
    Display withTax(200)
End Module

Function Real withTax(Real amount)
    Return amount + amount * TAX
End Function
""", [], ["220", {"key": "r_done"}], None),

    ("a fault inside a module says how the run got there", """
Module main()
    Display half(10)
End Module

Function Real half(Real n)
    Return n / zero()
End Function

Function Integer zero()
    Return 0
End Function
""", [], [{"key": "r_zero"}], ["half()"]),

    ("a module that never stops calling itself is stopped", """
Module main()
    Call onAndOn(1)
End Module

Module onAndOn(Integer n)
    Call onAndOn(n + 1)
End Module
""", [], [{"key": "r_too_deep", "fill": {"name": "onAndOn()"}}], None),

    ("a module handed the wrong number of things says so", """
Module main()
    Call greet("Ann", 3)
End Module

Module greet(String who)
    Display "Hello ", who
End Module
""", [], [{"key": "r_args",
           "fill": {"name": "greet()", "want": 1, "got": 2}}], None),

    ("a page with no main flow runs the chart it has", """
Module hello()
    Display "Hello from a module."
End Module
""", [], [{"key": "r_no_main", "fill": {"name": "hello()"}},
          "Hello from a module.", {"key": "r_done"}], None),

    ("a program without modules runs as it always did", """
Start
Declare Integer n
Input n
If n > 10 Then
    Display "big"
Else
    Display "small"
End If
Display "done"
End
""", ["12"], ["big", "done", {"key": "r_done"}], None),
]


# The same, for the code it writes out.  A name shared by every chart has
# to be written somewhere every chart can reach, and in a class-shaped
# language that is not inside main.
WRITTEN = """
Constant Real TAX = 0.1

Module main()
    Declare Real bill
    Set bill = withTax(200)
    Display bill
End Module

Function Real withTax(Real amount)
    Return amount + amount * TAX
End Function
"""

WRITES = [
    ("java", ["static final double TAX = 0.1;"],
     [["static final double TAX", "static void main"]]),
    ("csharp", ["const double TAX = 0.1;"],
     [["const double TAX", "static void Main"]]),
    ("python", ["\nTAX = 0.1"], [["def withTax", "TAX = 0.1"]]),
    ("javascript", ["\nconst TAX = 0.1;"],
     [["function withTax", "const TAX = 0.1;"]]),
]


# A single flow long enough to be cut into parts, and what the cut has to
# come out as.  Running it proves it still does what the chart did -- that
# is tests/written.py's job -- but not that the cut was any good, and a cut
# that is no good is the whole risk here.  `i` shared between two parts
# because they both count with it runs perfectly well and is not what
# anybody would have written; nor is `score` in the shared file when only
# one part has ever heard of it.
CUT = """
Start
Declare Integer count
Declare Integer i
Declare Real score
Declare Real total
Declare Real average
Declare Real biggest
Declare Real smallest
Declare Integer passes
Declare Integer fails
Declare Integer stars
Declare Integer band

Display "The marks report"
Display "How many marks are there?"
Input count
Set total = 0
Set biggest = 0
Set smallest = 1000
Set passes = 0
Set fails = 0

For i = 1 To count
    Display "Mark ", i
    Input score
    While score < 0 OR score > 100
        Display "A mark is between 0 and 100."
        Input score
    End While
    Set total = total + score
    If score > biggest Then
        Set biggest = score
    End If
    If score < smallest Then
        Set smallest = score
    End If
    If score >= 40 Then
        Set passes = passes + 1
    Else
        Set fails = fails + 1
    End If
End For

Set average = total / count

For band = 0 To 20 Step 10
    Display "Band ", band
    Set stars = 0
    For i = 1 To count
        Set stars = stars + 1
    End For
    While stars > 0
        Display "*"
        Set stars = stars - 1
    End While
End For

Display "Marks: ", count
Display "Total: ", total
Display "Average: ", average
Display "Highest: ", biggest
Display "Lowest: ", smallest
Display "Passed: ", passes
Display "Failed: ", fails
End
"""

# (language, what has to be in it, what must not be, what must come first)
CUT_WRITES = [
    ("python",
     ["def part1():", "def part2():", "import shared", "for i in range(",
      "shared.total = shared.total + score", "---- shared.py"],
     ["shared.i", "shared.score", "shared.band", "shared.stars"],
     []),
    ("java",
     ["class Part1 {", "class Part2 {", "class Shared {",
      "Part1.part1();", "for (int i = 1;", "Shared.total = Shared.total + score;"],
     ["Shared.i", "Shared.score", "Shared.band", "Shared.stars"],
     []),
    ("csharp",
     ["static class Shared {", "class Part1 {", "Part1.part1();",
      "public static void part1()"],
     ["Shared.i", "Shared.score", "Shared.band"],
     []),
    ("javascript",
     ['require("./shared.js")', "exports.part1 = part1;", "function part2() {",
      "part1.part1();"],
     ["shared.i", "shared.score", "shared.band"],
     []),
    ("cpp",
     ['#include "part1.h"', '#include "shared.h"', "void part1();",
      "extern int count;", "---- part1.h"],
     [],
     # the header saying what is there has to come before the file that is it
     [["---- part1.h", "---- part1.cpp"]]),
]


# A program that says how long its own steps take.  The chart can be run at
# that timing rather than at a pace of its own, so the code written from it
# has to wait as well: what you read is what you just watched, and a program
# that printed both its lines at once would not be it.
WAITING = """
Start
Display "before"
Wait 2 seconds
Pause 500 ms
Display "after"
End
"""

WAIT_WRITES = [
    ("python", ["time.sleep(2)", "time.sleep(0.5)", "import time"], []),
    ("java", ["Thread.sleep(2000)", "Thread.sleep(500)",
              "catch (InterruptedException e)"], []),
    ("csharp", ["System.Threading.Thread.Sleep(2000)",
                "System.Threading.Thread.Sleep(500)"], []),
    ("cpp", ["nap(2)", "nap(0.5)", "#include <thread>",
             "std::this_thread::sleep_for"], [["static void nap", "int main()"]]),
    ("javascript", ["wait(2000)", "wait(500)", "function wait(ms)"],
     [["function wait(ms)", "console.log"]]),
]


# ---------------------------------------------- and putting it right again --
# A warning that says what is wrong and stops there leaves the typing to
# somebody who has just been told they cannot type.  Each of these is a fix
# the page offers to make for you: what it writes, and where.
MENDS = [
    ("a word swapped, and only where it is a word",
     'Start\nSet total = 0\nDisplay "tally: ", tally\nEnd\n',
     {"how": "change", "word": "tally", "instead": "total"}, 3,
     'Start\nSet total = 0\nDisplay "tally: ", total\nEnd\n'),

    ("a closer with nothing to close, taken out",
     'Start\nDisplay "hi"\nEnd If\nEnd\n',
     {"how": "drop", "at": 3}, 0,
     'Start\nDisplay "hi"\nEnd\n'),

    ("the last line of all, taken out without leaving a blank",
     'Start\nDisplay "hi"\nEnd If',
     {"how": "drop", "at": 3}, 0,
     'Start\nDisplay "hi"'),

    ("a missing End If, put in where the indenting says it goes",
     'Start\nIf n > 5 Then\n    Display "big"\nDisplay "after"\nEnd\n',
     {"how": "insert", "text": "End If", "at": 4, "like": 2}, 0,
     'Start\nIf n > 5 Then\n    Display "big"\nEnd If\nDisplay "after"\nEnd\n'),

    ("a closer set in as far as the line it closes",
     'Module main()\n    If n > 5 Then\n        Display "big"\n    Display "after"\nEnd Module\n',
     {"how": "insert", "text": "End If", "at": 4, "like": 2}, 0,
     'Module main()\n    If n > 5 Then\n        Display "big"\n    End If\n    Display "after"\nEnd Module\n'),

    ("a warning gone stale leaves the box alone",
     'Start\nDisplay "hi"\nEnd\n',
     {"how": "change", "word": "tally", "instead": "total"}, 2,
     'Start\nDisplay "hi"\nEnd\n'),
]

# The whole way round: run it, and put right whatever it stopped at.
MENDED_RUNS = [
    ("a name one letter out, put right from the tape",
     'Start\nDeclare Integer total\nSet total = 5\nDisplay tota\nEnd\n', [],
     {"how": "change", "word": "tota", "instead": "total"},
     'Start\nDeclare Integer total\nSet total = 5\nDisplay total\nEnd\n'),

    ("a keyword one letter out, put right from the tape",
     'Start\nDispay "hi"\nEnd\n', [],
     {"how": "change", "word": "Dispay", "instead": "Display"},
     'Start\nDisplay "hi"\nEnd\n'),

    ("a module called by a name one letter out",
     'Module main()\n    Display twce(3)\nEnd Module\n\n'
     'Function Integer twice(Integer n)\n    Return n * 2\nEnd Function\n', [],
     {"how": "change", "word": "twce", "instead": "twice"},
     'Module main()\n    Display twice(3)\nEnd Module\n\n'
     'Function Integer twice(Integer n)\n    Return n * 2\nEnd Function\n'),
]


@check("a warning says what would put it right")
def _():
    """What the reading offers to do about what it had to paper over.

    Only where there is one right answer.  A Do with no test needs a test
    that is nobody's to invent, and an If with nothing indented under it
    could be closed in as many places as it has lines below it -- so both
    are left saying what is wrong and offering nothing, which is the honest
    answer and the one this pins down.
    """
    want = [
        ('Start\nDisplay "hi"\nEnd If\nEnd\n',
         [("w_no_if", {"how": "drop", "at": 3})]),
        ('Start\nIf n > 5 Then\n    Display "big"\nDisplay "after"\nEnd\n',
         [("w_open_if", {"how": "insert", "text": "End If", "at": 4, "like": 2})]),
        ('Start\nFor i = 1 To 5\n    Display i\nEnd\n',
         [("w_open_for", {"how": "insert", "text": "End For", "at": 4, "like": 2})]),
        ('Start\nDo\n    Display "round"\nEnd\n',
         [("w_open_loop", {})]),                    # a test is not ours to invent
        ('Start\nIf n > 5 Then\nDisplay "after"\nEnd\n',
         [("w_open_if", {})]),                      # nothing indented: nothing to go on
    ]
    bad = []
    for text, expect in want:
        got = [(p["why"], p["fix"]) for p in read_as_data(text)["problems"]]
        if got != expect:
            bad.append("%r gave %r, not %r" % (text.split("\n")[1], got, expect))
    return not bad, "%d warnings%s" % (
        len(want), "" if not bad else " -- " + "; ".join(bad[:2]))


@check("every chart in a program runs, not only the first")
def _():
    if not node_there():
        return None, "node is not installed -- skipped"
    fb = builder()
    cases = []
    for name, text, typed, want, trail in RUNS:
        cases.append({"name": name, "ast": read_as_data(text.strip("\n")),
                      "typed": typed, "want": want, "trail": trail})
    written = [{"name": "a name every chart shares", "lang": lang,
                "ast": read_as_data(WRITTEN.strip("\n")),
                "has": has, "before": before}
               for lang, has, before in WRITES]
    written += [{"name": "a program that waits, waits in the code too",
                 "lang": lang, "ast": read_as_data(WAITING.strip(chr(10))),
                 "has": has, "before": before}
                for lang, has, before in WAIT_WRITES]
    written += [{"name": "a single flow cut into files", "lang": lang,
                 "ast": read_as_data(CUT.strip(chr(10))), "apart": True,
                 "has": has, "lacks": lacks, "before": before}
                for lang, has, lacks, before in CUT_WRITES]
    mends = [{"name": name, "source": source, "fix": fix, "line": line,
              "want": want}
             for name, source, fix, line, want in MENDS]
    ran = [{"name": name, "source": source, "typed": typed, "fix": fix,
            "want": want, "ast": read_as_data(source)}
           for name, source, typed, fix, want in MENDED_RUNS]
    asked = {"words": fb.WORDS["en"], "cases": cases, "written": written,
             "mends": mends, "ran": ran}
    handle, where = tempfile.mkstemp(suffix=".json")
    try:
        with io.open(handle, "w", encoding="utf-8") as f:
            f.write(json.dumps(asked))
        got = subprocess.run(["node", os.path.join(HERE, "program.js"), where],
                             capture_output=True, text=True)
    finally:
        os.remove(where)
    said = (got.stdout + got.stderr).strip()
    return got.returncode == 0, said.replace("\n", "\n       ")


@check("the code it writes out really runs")
def _():
    """Every program there is here, written out in every language and run.

    See tests/written.py, which does the running and says why.  Python and
    JavaScript are run wherever node is; Java, C# and C++ wherever this
    machine has something to compile them with, and said to be missing where
    it has not, so that a row of passes is never mistaken for a row of
    languages that were tried.
    """
    if not node_there():
        return None, "node is not installed -- skipped"
    import shutil
    fb = builder()
    shelf = []
    for program in PROGRAMS:
        text = io.open(os.path.join(HERE, "programs", program), encoding="utf-8").read()
        shelf.append((program, text, written.TYPED.get(program, [])))
    shelf += [(name, text, typed) for name, text, typed, want, trail in RUNS]
    shelf += written.SHELF
    cases = [{"name": name, "typed": typed, "title": "Shelf %02d" % n,
              "ast": read_as_data(text.strip("\n"))}
             for n, (name, text, typed) in enumerate(shelf)]
    folder = tempfile.mkdtemp(prefix="_out-written-", dir=HERE)
    try:
        asked = {"words": fb.WORDS["en"], "cases": [], "shelf": cases,
                 "shelfOut": os.path.join(folder, "shelf.json")}
        with io.open(os.path.join(folder, "asked.json"), "w", encoding="utf-8") as f:
            f.write(json.dumps(asked))
        got = subprocess.run(["node", os.path.join(HERE, "program.js"),
                              os.path.join(folder, "asked.json")],
                             capture_output=True, text=True)
        if got.returncode:
            return False, (got.stdout + got.stderr).strip()[-300:]
        with io.open(asked["shelfOut"], encoding="utf-8") as f:
            results = json.load(f)
        wrong, tally = written.marked(cases, results, folder)
    finally:
        shutil.rmtree(folder, ignore_errors=True)
    said, apart = [], 0
    for lang in sorted(tally):
        count = tally[lang]
        apart += count.get("apart", 0)
        said.append("%s %s" % (lang, "not here" if count["skip"] and not count["right"]
                               else "%d" % count["right"] if not count["built"]
                               else "%d (and %d only built)" % (count["right"], count["built"])))
    note = "%d programs: %s" % (len(cases), ", ".join(said))
    # The ones with more than one chart in them are written out a second
    # time, a file for each chart, and that way round is run as well.
    if apart:
        note += "; %d also in a file each" % apart
    if wrong:
        note += "\n       " + "\n       ".join(wrong[:6])
    return not wrong, note


@check("the page's script reads as one script")
def _():
    """Every part poured together, and node asked whether it parses.

    The parts are poured into one function and run in strict mode, which the
    pieces on their own are not: a name declared twice, an await outside an
    async function, an octal left in a string -- none of those show up until
    the page is opened and the whole script refuses to run, taking every
    button on it with it.  Here they show up in a second.
    """
    if not node_there():
        return None, "node is not installed -- skipped"
    fb = builder()
    whole = "".join(fb.without_header(fb.read_ui(name), fb.JS_HEAD_END)
                    for name in fb.JS)
    handle, where = tempfile.mkstemp(suffix=".js")
    with io.open(handle, "w", encoding="utf-8") as f:
        f.write('"use strict";\nasync function studio() {\n' + whole + "\n}\n")
    try:
        got = subprocess.run(["node", "--check", where],
                             capture_output=True, text=True)
    finally:
        os.remove(where)
    return got.returncode == 0, ("%d parts, %d KB" % (len(fb.JS), len(whole) // 1024)
                                 if got.returncode == 0
                                 else got.stderr.strip().split("\n")[-1][:120])


FILES_JS = os.path.join(HERE, "..", "flowchart", "ui", "js", "19-files.js")


@check("the several files it hands over really are a zip")
def _():
    """The zip the page writes, opened by something that is not the page.

    A program written out as a file for each chart leaves here as one zip,
    written by hand in 19-files.js because the page fetches nothing from
    anywhere.  A zip written by hand is a few hundred bytes of lengths and
    offsets pointing at one another, and every one of them is wrong in a
    way that looks fine from the inside: a reader of our own would agree
    with a writer of our own about the same mistake.

    So it is opened by Python's, which checks the checksums and refuses
    anything it does not like the shape of -- and by whatever is on the
    machine after that, which is the same reader every unzipper is.
    """
    if not node_there():
        return None, "node is not installed -- skipped"
    src = io.open(FILES_JS, encoding="utf-8").read()
    from_at = src.index("  var CRC = null;")
    to_at = src.index("  // ------------------------------------------------------- the work, in a link --")
    lift = (src[from_at:to_at] +
            "\nvar files = [{ name: 'a.txt', text: 'hello\\nthere\\n' },"
            "             { name: 'Shared.java', text: 'class Shared {}\\n' },"
            "             { name: 'Grüße.py', text: '# grüß dich\\nprint(\"hé\")\\n' },"
            "             { name: 'big.txt', text: 'x'.repeat(200000) }];"
            "return files.map(function (f) { return f.text; })"
            "            .concat([zipOf(files)]);")
    out = tempfile.mkdtemp(prefix="_out-zip-")
    try:
        where = os.path.join(out, "made.zip")
        run = ("var fs = require('fs');"
               "var got = new Function(" + json.dumps(lift) + ")();"
               "var blob = got.pop();"
               "blob.arrayBuffer().then(function (bits) {"
               "  fs.writeFileSync(process.argv[1], Buffer.from(bits));"
               "  process.stdout.write(JSON.stringify(got));"
               "});")
        # Told what the words coming back are in.  A file name with an
        # umlaut in it is exactly the thing this is checking, and read in
        # whatever the machine's own spelling happens to be it comes back
        # a different length than it went in -- which would look like the
        # zip having lost three bytes.
        made = subprocess.run(["node", "-e", run, where], capture_output=True,
                              text=True, encoding="utf-8")
        if made.returncode:
            return False, "node would not write one: " + made.stderr.strip()[-200:]
        want = json.loads(made.stdout)
        import zipfile
        with zipfile.ZipFile(where) as zipped:
            broken = zipped.testzip()
            if broken:
                return False, "%s does not match its own checksum" % broken
            names = zipped.namelist()
            if len(names) != len(want):
                return False, "%d files went in and %d came out" % (len(want), len(names))
            for name, text in zip(names, want):
                got = zipped.read(name).decode("utf-8")
                if got != text:
                    return False, "%s came out as %d bytes, not %d" % (
                        name, len(got), len(text))
        return True, "%d files, %d bytes, opened and checked" % (
            len(want), os.path.getsize(where))
    finally:
        shutil.rmtree(out, ignore_errors=True)


# ------------------------------------------------ the part that runs in node --
PUZZLE_JS = os.path.join(HERE, "..", "flowchart", "ui", "js", "28-puzzles.js")
PUZZLE_MENDS = os.path.join(HERE, "puzzles")


def puzzle_list():
    """The puzzles, read out of the studio's own file rather than a copy.

    They are written in JavaScript, so JavaScript is what reads them: the
    file is a fragment of the page's one big function, and everything in it
    past the list wants a page to live in.  Cut it off there and the list
    is all that is left to hand back.
    """
    lift = ("var fs = require('fs');"
            "var src = fs.readFileSync(process.argv[1], 'utf8');"
            "var body = src.slice(0, src.indexOf('var solved')) +"
            "           ' return PUZZLES;';"
            "var out = [];"
            "new Function(body)().forEach(function (level) {"
            "  level[1].forEach(function (one) { out.push(one); });"
            "});"
            "process.stdout.write(JSON.stringify(out));")
    got = subprocess.run(["node", "-e", lift, PUZZLE_JS],
                         capture_output=True, text=True)
    if got.returncode:
        raise RuntimeError("could not read the puzzles: " + got.stderr.strip())
    return json.loads(got.stdout)


@check("every puzzle is broken, and every mend puts it right")
def _():
    """Both halves of a puzzle, run rather than read.

    A puzzle that already does what it is asked cannot be solved, and a
    puzzle nothing can be typed to make right cannot be solved either.
    Neither shows up by looking at the pseudocode -- the first one looks
    exactly like a puzzle, and the second looks like a hard one.  So each
    is run: the program as it ships has to come out wrong for at least one
    set of answers, and the mend in tests/puzzles has to come out right for
    every set.

    The mends are kept here rather than beside the puzzles on purpose.  The
    page is sent to whoever opens it, and a page carrying the answers has
    handed them over along with the questions.
    """
    if not node_there():
        return None, "node is not installed -- skipped"
    fb = builder()
    puzzles = puzzle_list()
    gone = [one["key"] for one in puzzles
            if not os.path.exists(os.path.join(PUZZLE_MENDS, one["key"] + ".txt"))]
    if len(gone) == len(puzzles):
        # Not one written yet.  The puzzles are being rewritten and each
        # arrives with its mend beside it; until the first pair lands there
        # is nothing here to run, and a check with nothing to run has not
        # failed.  The moment one exists the next branch takes over, so a
        # mend left out of a batch is still caught the loud way.
        return None, "no mends written yet -- skipped"
    if gone:
        return False, "%d of %d have no mend written: %s" % (
            len(gone), len(puzzles), ", ".join(gone[:5]))
    asked = {"words": fb.WORDS["en"], "cases": [], "puzzles": []}
    for one in puzzles:
        with io.open(os.path.join(PUZZLE_MENDS, one["key"] + ".txt"),
                     encoding="utf-8") as f:
            mend = f.read().strip()
        asked["puzzles"].append({
            "name": "puzzle %d (%s)" % (one["no"], one["key"]),
            "broken": read_as_data(one["start"]),
            "fixed": read_as_data(mend),
            "tries": one["tries"]})
    handle, where = tempfile.mkstemp(suffix=".json")
    try:
        with io.open(handle, "w", encoding="utf-8") as f:
            f.write(json.dumps(asked))
        got = subprocess.run(["node", os.path.join(HERE, "program.js"), where],
                             capture_output=True, text=True)
    finally:
        os.remove(where)
    said = (got.stdout + got.stderr).strip()
    tries = sum(len(one["tries"]) for one in puzzles)
    return got.returncode == 0, (
        "%d puzzles, %d sets of answers" % (len(puzzles), tries)
        if got.returncode == 0 else said.replace("\n", "\n       "))


def node_there():
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
        return True
    except Exception:                                # noqa: BLE001
        return False


@check("the by-hand router keeps its promises")
def _():
    if not node_there():
        return None, "node is not installed -- skipped"
    got = subprocess.run(["node", os.path.join(HERE, "router.js")],
                         cwd=HOME, capture_output=True, text=True)
    if got.returncode:
        return False, (got.stderr.strip().split(chr(10)) or ["failed"])[-1][:90]
    return True, got.stdout.strip().replace(chr(10), "; ")


# -------------------------------------------------------------------- go --
def main():
    quiet = "-q" in sys.argv
    only = ""
    if "--only" in sys.argv:
        only = sys.argv[sys.argv.index("--only") + 1]

    began = time.time()
    ran = failed = skipped = 0
    print("Flowchart Builder -- checking%s" % ("" if not only else " (%s)" % only))
    print()
    for name, fn in done:
        if only and only.lower() not in name.lower():
            continue
        try:
            ok, note = fn()
        except Exception as oops:                    # noqa: BLE001
            ok, note = False, "%s: %s" % (type(oops).__name__, oops)
        ran += 1
        if ok is None:
            skipped += 1
            mark = "skip"
        elif ok:
            mark = "ok  "
        else:
            failed += 1
            mark = "FAIL"
        if not quiet or not ok:
            print("  %s  %-44s %s" % (mark, name, note))

    print()
    print("%d checked, %d failed, %d skipped, %.1fs"
          % (ran, failed, skipped, time.time() - began))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
