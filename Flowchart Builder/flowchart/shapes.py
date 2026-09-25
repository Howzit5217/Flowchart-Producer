"""The catalog of shapes, which kind of step is drawn as which, and the
parts some of them are drawn with."""
from . import settings


SWATCH_W = 62                       # size of a sample shape in the key
SWATCH_H = 30

# Every shape that can be drawn, and how much room its outline steals from
# the words inside it.  side: what it takes off the width; top: off the
# height; tall: a height of its own, as a multiple of the lines of words.
# under: the words are a name under a figure, not inside an outline;
# shaft: they ride along an arrow's shaft; grid: they are set out as a table
# (see "shapes with parts to them", below).
SHAPES = {
    "rect":    {"side": 20, "top": 0},
    "oval":    {"side": 24, "top": 0, "floor": "oval"},
    "io":      {"side": 2 * 12 + 10, "top": 0},        # parallelogram
    "diamond": {"side": 0, "top": 0, "wide": True},
    "hex":     {"side": 2 * 12 + 10, "top": 0},
    "sub":     {"side": 2 * 6 + 20, "top": 0},         # call, with side bars
    "trap":    {"side": 2 * 12 + 14, "top": 0},        # manual step
    "doc":     {"side": 20, "top": 9},                 # document, wavy foot
    "store":   {"side": 24, "top": 16},                # drum, for a file
    "delay":   {"side": 34, "top": 0},                 # a wait
    "circle":  {"side": 22, "top": 4, "round": True},  # a joining point
    "roundrect": {"side": 24, "top": 0},               # a softer box
    "card":    {"side": 26, "top": 4},                 # a punched card
    "note":    {"side": 28, "top": 4},                 # something noted down
    "docs":    {"side": 24, "top": 14},                # more than one page
    "manual":  {"side": 22, "top": 10},                # typed in by hand
    "screen":  {"side": 36, "top": 0},                 # shown on a screen
    "offpage": {"side": 24, "top": 18},                # carries on elsewhere
    "loop":    {"side": 24, "top": 8},                 # a loop's limit
    "parallel": {"side": 24, "top": 14},               # side by side
    "stored":  {"side": 30, "top": 8},                 # held inside
    "cloud":   {"side": 44, "top": 12},                # a service, elsewhere
    "text":    {"side": 4, "top": 0},                  # words, and no shape
    "actor":   {"side": 16, "top": 46, "under": True},  # somebody
    "callout":  {"side": 26, "top": 16},               # something said
    "cube":    {"side": 28, "top": 14},                # a thing with sides
    "step":    {"side": 2 * 22 + 8, "top": 0},         # one step of several
    "table":   {"side": 24, "top": 0, "grid": True},   # rows and columns
    "arrow":   {"side": 40, "top": 0, "shaft": True},  # which way it goes
    "io_back": {"side": 2 * 12 + 10, "top": 0},        # the other lean
}
SHAPE_ORDER = ("rect", "roundrect", "oval", "io", "io_back", "diamond",
               "hex", "loop", "sub", "trap", "manual", "doc", "docs", "note",
               "card", "store", "stored", "delay", "screen", "circle",
               "offpage", "parallel", "cloud", "step", "cube", "table",
               "callout", "actor", "text", "arrow")
DEFAULT_GEOM = dict(settings.GEOM)           # the textbook set, to go back to


def geom_of(kind):
    """What a step of this kind is actually drawn as."""
    return settings.GEOM.get(kind, kind if kind in SHAPES else "rect")


# ------------------------------------------------ shapes with parts to them --
# Most shapes hold their words in the middle, and all their outline asks for
# is some room round them.  A few are drawn with parts the words have to go
# round rather than across: a person stands over the name under them, an
# arrow carries its words along its shaft and not out into its head, and a
# table has a row across the top for what it is and cells under that for
# what is in it.  Set in the middle like any other, the words were drawn
# straight through the person, off the end of the shaft and across the
# rules of the table.  What those parts measure is here, where the layout
# sizing the shape and the drawing drawing it both ask, so the two never
# disagree about where the words go.  (ui/js/03-shapes.js says the same.)
ACTOR_FIG = SHAPES["actor"]["top"]  # how tall a person stands over their name
ARROW_WING = 12.0                   # how far an arrow's head reaches past its
                                    #   shaft, at most, above and below
ARROW_AIR = 3.0                     # between the words and the shaft's edges
TABLE_COLS = 3                      # the columns of a table with no cells
TABLE_CELL = "\v"                   # starts each cell's words, among a
                                    #   table's lines; no word holds one
CELL_AIR = 6.0                      # a cell's words clear of its rules


def figure_h(h, below, most=ACTOR_FIG):
    """How tall a person is drawn in a box h tall, `below` of which is kept
    for the words under them: the rest, but no taller than `most`, so that
    people are the same size all down a chart whatever their boxes were
    rounded up to.  With no words -- in the key -- the whole box."""
    if below <= 0:
        return h
    return max(min(h, 16.0), min(h - below, most))


def arrow_parts(w, h):
    """An arrow's head: how long it is, and how far it reaches past the
    shaft above and below.  The reach is a share of the height, as it always
    was, but only up to ARROW_WING, so that an arrow made taller for a
    second line of words gets a wider shaft to carry them rather than a
    bigger head with the same thin shaft."""
    return min(26.0, w * 0.3), min(h * 0.26, ARROW_WING)


def arrow_h(shaft):
    """How tall an arrow has to be for its shaft to be `shaft` tall: the
    other way round from arrow_parts, which takes 0.52 of a short arrow and
    twice ARROW_WING off a tall one."""
    return min(shaft / 0.48, shaft + 2 * ARROW_WING)


def table_parts(lines):
    """A table's lines, as the words across its head and each cell's."""
    if TABLE_CELL not in lines:
        return list(lines), []
    first = lines.index(TABLE_CELL)
    cells = []
    for line in lines[first:]:
        if line == TABLE_CELL:
            cells.append([])
        else:
            cells[-1].append(line)
    return list(lines[:first]), cells


def table_plan(lines, tall, h=None):
    """Where everything in a table goes: the head row, then the cells a row
    at a time, across as many columns as there are cells, up to TABLE_COLS.
    A table with no cells has one empty row of TABLE_COLS under its head,
    which is what makes it a table and not a box with a line across it.

    Asked with no h, the height the words want.  Asked with one, returns
    (head, head_h, cols, rows), each row (top, height, cells) measured down
    from the top of the box: what the box has over the words is shared out
    between the head and the rows, so every one of them breathes the same.
    """
    head, cells = table_parts(lines)
    cols = min(len(cells), TABLE_COLS) or TABLE_COLS
    air = settings.PAD_Y
    head_h = max(1, len(head)) * tall + 2 * air
    rows = [cells[i:i + cols] for i in range(0, len(cells), cols)] or [[]]
    heights = [max([len(c) for c in row] + [1]) * tall + air for row in rows]
    want = head_h + sum(heights)
    if h is None:
        return want
    if h >= want:                          # the room over, shared out
        spare = (h - want) / (len(rows) + 1.0)
        head_h += spare
        heights = [x + spare for x in heights]
    else:                                  # squeezed, all in proportion
        head_h, heights = head_h * h / want, [x * h / want for x in heights]
    out, y = [], head_h
    for row, height in zip(rows, heights):
        out.append((y, height, row))
        y += height
    return head, head_h, cols, out
