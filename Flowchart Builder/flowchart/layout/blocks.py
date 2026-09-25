"""A block of chart, and a straight run of steps."""
import math

from .. import measure, settings
from ..measure import line_h, text_w, type_of
from ..parse.nodes import Node
from ..shapes import (ARROW_AIR, CELL_AIR, SHAPES, TABLE_CELL, TABLE_COLS,
                      arrow_h, geom_of, table_plan)


# ------------------------------------------------------------------- layout --
#  Drawing elements are tuples:
#      ("shape", kind, cx, cy, w, h, [text lines])
#      ("line", x1, y1, x2, y2, arrowhead?)
#      ("text", x, y, string, anchor)          branch labels
#      ("htext", x, y, string, anchor)         chart headings
# The same words, wrapped to the same width, come out the same way, and a
# chart laid out several times over asks for exactly that again and again.
# The answer is kept rather than worked out afresh; what goes back is a copy,
# because callers treat the list as theirs.
_WRAPS = {}
_WRAP_MAX = 100000


def wrap(text, width_px, size=None, bold=False):
    """Wrap text to a pixel width, honoring explicit newlines."""
    if size is None:
        size = measure.FONT_SIZE
    key = (text, round(width_px, 3), size, bold, measure.FACE_KEY)
    got = _WRAPS.get(key)
    if got is not None:
        return list(got)
    out = []
    for paragraph in text.split("\n"):
        words, line = [], ""
        for w in paragraph.split():            # chop a word wider than the box
            while len(w) > 1 and text_w(w, size, bold) > width_px:
                cut = len(w) - 1
                while cut > 1 and text_w(w[:cut], size, bold) > width_px:
                    cut -= 1
                words.append(w[:cut])
                w = w[cut:]
            words.append(w)
        for w in words:
            trial = (line + " " + w).strip()
            if text_w(trial, size, bold) > width_px and line:
                out.append(line)
                line = w
            else:
                line = trial
        out.append(line)
    out = out or [""]
    if len(_WRAPS) >= _WRAP_MAX:
        _WRAPS.clear()
    _WRAPS[key] = out
    return list(out)


def shift(elems, dx, dy):
    """The same drawing, moved.  This is the busiest thing in the layout --
    every block that goes anywhere is rewritten by it -- so it is written
    for speed rather than for looks: the appending is bound to a name once
    instead of looked up a quarter of a million times, and a move of nothing
    hands back the pieces as they are.  They are tuples and nobody writes to
    them, so only the list has to be a new one."""
    if not dx and not dy:
        return list(elems)
    moved = []
    add = moved.append
    for e in elems:
        kind = e[0]
        if kind == "shape":
            add(("shape", e[1], e[2] + dx, e[3] + dy, e[4], e[5],
                 e[6], e[7] if len(e) > 7 else 0))
        elif kind == "line":
            add(("line", e[1] + dx, e[2] + dy, e[3] + dx, e[4] + dy, e[5]))
        else:
            add((e[0], e[1] + dx, e[2] + dy, e[3], e[4]))
    return moved


class Block:
    """A laid-out piece of chart.  Entry is (axis, 0); exit is (axis, h)."""

    def __init__(self, w, h, axis, elems, terminal=False, loop=False):
        self.w, self.h, self.axis, self.elems = w, h, axis, elems
        self.terminal = terminal        # nothing flows out of the bottom
        self.loop = loop                # the way out runs down the far side


def edge_shape(block, top=False):
    """The single shape a block ends on, or starts on if top is asked for.

    A plain run of statements has one: its last box sits flush with the foot
    of the block, on the flow line, and its first with the head.  An If or a
    loop does not -- what sits at the foot of those is the point where two
    routes meet, and a line has to leave that from below.

    Knowing the shape is what lets a route meet it at the side.  A line that
    is travelling sideways anyway can leave a box's side instead of dropping
    clear of its bottom and turning, and a line arriving sideways can go
    into the side it arrives at instead of bending to come in over the top:
    a turn fewer each time, and a shorter line.  Returns (left, right,
    middle height) in the block's own coordinates, taken at the height where
    the shape is widest, or None.
    """
    found = None
    for e in block.elems:
        if e[0] != "shape":
            continue
        flush = (e[3] - e[5] / 2.0 < 1.0 if top
                 else abs((e[3] + e[5] / 2.0) - block.h) < 1.0)
        if flush:
            if found is not None:
                return None             # two of them level: use the foot
            found = e
    if found is None:
        return None
    _, kind, cx, cy, w, _h, _lines = found[:7]
    if abs(cx - block.axis) > 1.0:      # not sitting on the flow line
        return None
    if kind in ("diamond", "hex"):
        return None                     # a test's sides are its own answers'
    # Where the outline actually is at half height, which for anything that
    # leans or bows is not where the box is.  A line meeting the box instead
    # would stop short of the shape, in mid-air beside it.  That is a matter
    # of what the step is drawn as, not what kind of step it is: an Input
    # drawn as a box has straight sides, and a box drawn leaning has not.
    kind = geom_of(kind)
    if kind == "actor":
        return None                     # nothing beside a person to meet
    if kind in ("io", "io_back", "trap"):
        lean = min(settings.SLANT, w / 4.0) / 2.0          # a parallelogram's waist
    elif kind == "screen":
        lean = min(16.0, w * 0.16) / 4.0          # the bowed-in left side
    else:
        lean = 0.0
    return cx - w / 2.0 + lean, cx + w / 2.0 - lean, cy


def clear_foot(block, side):
    """Is the foot of this block clear of lines running out to that side?

    A block ending on an If leaves the last line of each branch lying along
    its foot, so a route setting off sideways from there would run down the
    top of one of them.  A block ending on a loop leaves only the loop's way
    out, which comes in from the other hand and is already going the way we
    are."""
    for e in block.elems:
        if e[0] != "line" or abs(e[2] - e[4]) > 0.5:      # horizontals only
            continue
        if abs(e[2] - block.h) > 1.5:                     # at the foot only
            continue
        reach = (min(e[1], e[3]) if side < 0 else max(e[1], e[3])) - block.axis
        if (reach < -1.0) if side < 0 else (reach > 1.0):
            return False
    return True


def join_room(runs):
    """How much further a line has to go past a join than the `runs` it goes
    anyway, before it reaches the shape it is going into.

    A line joining another side-on carries a head pointing at the line it
    joins, and the line it joins carries one of its own where it arrives at
    the next shape.  Put the join one short gap above that shape and the
    two heads touch -- the head on the join is as wide as the head below it
    is long -- which reads as a pile-up at the shape's door rather than as
    two arrows.  So a join stands at least a head's length and a half above
    what the line runs into.  The extra comes in whole grid steps, because
    everything below it has to stay on the ruling."""
    short = settings.HEAD_LEN + settings.HEAD_WIDE * 1.5 - runs
    if short <= 0:
        return 0.0
    step = settings.GRID_STEP if settings.GRID_STEP > 0 else short
    return math.ceil(short / step - 0.001) * step


# ------------------------------------------------------------------ labels --
# A True, a False or a Case, written beside the line it names.  They were
# set a fixed few pixels off the line, which was a few pixels off the line
# and not off the arrowhead on it: a head is as wide as HEAD_WIDE, so the
# word beside a line going down sat a pixel from the side of the head and
# read as running into it, and the word above a line going into the side of
# a box sat on the corner of the head there.  Nor did the few pixels grow
# when the words did, so at a bigger size a label ran up into the diamond
# it came out of, or down into the shape its line went into.
#
# So every label keeps LABEL_GAP of clear paper between its letters and
# the widest thing on its line, which is the head, and where it goes is
# worked out from how big the words are set.

_HANGS = frozenset("gjpqyQ,;()[]{}|_$@")      # what reaches below the line


def label_clear():
    """How far a label's letters stand off the middle of its line: half a
    head, the gap, and a pixel for the pen -- a head is outlined as well as
    filled, and a bold T's ink starts a little before its width does."""
    return settings.HEAD_WIDE / 2.0 + settings.LABEL_GAP + 1.0


def label_drop(text):
    """How far the letters of text reach below the baseline, if they do."""
    if any(ch in _HANGS for ch in text):
        return measure.FONT_SIZE * measure.DESCENT
    return 0.0


def label_room(text):
    """How much of a line's length a label beside it takes up, counting
    the gap it keeps clear above and below.  It is set by the middle of its
    capitals, so whatever hangs below them needs its room on both sides."""
    if not text:
        return 0.0
    cap = measure.FONT_SIZE * measure.CAP
    return cap + 2 * (settings.LABEL_GAP + label_drop(text))


def label_run(*texts):
    """How long a line going down has to be for these labels to stand
    beside it: the usual gap, and whole grid steps more where the words are
    set too big to fit in it -- the shapes below have to stay on the
    ruling."""
    short = max([label_room(t) for t in texts] + [0.0]) - settings.VGAP
    if short <= 0:
        return settings.VGAP
    step = settings.GRID_STEP if settings.GRID_STEP > 0 else short
    return settings.VGAP + math.ceil(short / step - 0.001) * step


def label_beside(x, y, text, side, run=None):
    """A label for the line going down from (x, y), on `side` of it (-1 the
    left, 1 the right): half way down the first `run` of it, which is as
    much as label_run asks for unless the caller says, and far enough out
    that the head the line ends on stays clear of it too."""
    if run is None:
        run = label_run(text)
    cap = measure.FONT_SIZE * measure.CAP
    return ("text", x + side * label_clear(), y + (run + cap) / 2.0, text,
            "start" if side > 0 else "end")


def label_above(x, y, text, side):
    """A label for the line setting off sideways from the point (x, y) of a
    shape, towards `side`: just past the point, and high enough that a head
    on the line -- where it goes straight into the side of a box -- stays
    clear of it.  LABEL_PAD is the room it is given, half in front of the
    word and half after."""
    return ("text", x + side * settings.LABEL_PAD / 2.0,
            y - label_clear() - label_drop(text), text,
            "start" if side > 0 else "end")


def tail_shape(block):
    return edge_shape(block)


def head_shape(block):
    return edge_shape(block, top=True)


def part_of(item, shape, text):
    """A shape drawn for a statement -- the diamond of an If, the boxes a For
    turns into -- carrying that statement's number, so the drawing and the
    data agree about which is which."""
    node = Node(shape, text)
    node.node_id = getattr(item, "node_id", 0)
    node.line = getattr(item, "line", 0)
    return node


# Where one column of a table ends and the next begins, among a box's lines.
# It is a character no line of pseudocode can hold -- the reading splits
# the text into lines on every kind of line break -- so it is never mistaken
# for words; whatever draws the box starts a new column when it meets one.
TABLE_BREAK = "\f"


def as_table(text, size, bold, pad):
    """A box of statements too tall to read down, set in columns.

    A program that declares everything it uses up front -- hundreds of
    constants, one to a line -- came out as a single box thousands of
    pixels tall, and narrow: every line longer than the box was broken in
    the middle, "Constant Integer S_WORLD =" on one line and "1" under it.
    Set in columns, left to right in the order they were written, the same
    statements read like the table they are, a statement to a line and none
    of them broken, in a box about as wide as it is tall.

    Returns the box's width, how many lines its tallest column holds, and
    its lines with a TABLE_BREAK between one column and the next."""
    said = text.split("\n")
    across = min(settings.TABLE_W - pad,
                 max(text_w(s, size, bold) for s in said))
    parts = [wrap(s, across, size, bold) for s in said]
    rows = sum(len(p) for p in parts)
    # As many columns as it takes to bring the box down to TABLE_ROWS, and
    # then as few as that: no fewer columns can do it, so the box is as
    # narrow as it can be while no taller than asked.
    cols = max(1, int(math.ceil(rows / float(settings.TABLE_ROWS))))
    per = int(math.ceil(rows / float(cols)))
    columns, here = [[]], 0
    for part in parts:                    # a statement is never split
        if here and here + len(part) > per:
            columns.append([])
            here = 0
        columns[-1] += part
        here += len(part)
    tallest = max(len(c) for c in columns)
    width = (len(columns) * across + (len(columns) - 1) * settings.TABLE_GAP
             + pad)
    lines = []
    for i, col in enumerate(columns):
        if i:
            lines.append(TABLE_BREAK)
        lines += col
    return width, tallest, lines


def table_lines(text, size, bold, grow=1):
    """A table's words, set out for it: the first line across its head row,
    and every line after it in a cell of its own, a row of up to TABLE_COLS
    at a time -- so "Students" over "name", "grade" and "score" comes out a
    table of students with a column for each.  A statement on its own is
    the name across the head, over a row of empty cells.

    Wide enough for the head to wrap no sooner than any box's words would,
    and for the cells side by side to wrap no sooner than a table set out
    in columns does (see as_table).  Returns the width and the lines, each
    cell's words after a TABLE_CELL (see table_plan)."""
    said = text.split("\n")
    head, cells = said[0], said[1:]
    cols = min(len(cells), TABLE_COLS) or TABLE_COLS
    side = SHAPES["table"]["side"]
    w = max(settings.NODE_W,
            min(settings.NODE_MAX_W * grow, text_w(head, size, bold) + side))
    if cells:
        widest = max(text_w(c, size, bold) for c in cells) + 2 * CELL_AIR
        w = max(w, min(settings.TABLE_W * grow, widest * cols))
    lines = wrap(head, w - side, size, bold)
    for cell in cells:
        lines.append(TABLE_CELL)
        lines += wrap(cell, w / cols - 2 * CELL_AIR, size, bold)
    return w, lines


def node_block(node):
    # Measured in whatever its words are set in.  A step whose words have
    # been made bigger, or bold, wants a box that fits them -- not the box
    # the plain words would have had, with the new ones spilling out of it.
    size, bold = type_of(getattr(node, "node_id", 0))
    tall = line_h(size)
    longest = max(text_w(l, size, bold) for l in node.text.split("\n"))
    # And as much wider before its words wrap as they are bigger, so that a
    # line holds as many words at 24 points as it does at 12.  Held to the
    # plain width, big words wrapped a word to a line, and the biggest were
    # cut into pieces because not one of them fitted across.
    grow = size / float(measure.BASE_SIZE) if size > measure.BASE_SIZE else 1
    drawn = SHAPES.get(geom_of(node.shape), SHAPES["rect"])
    if drawn.get("wide"):                       # a diamond: the words sit in
        w = max(settings.DIA_W,
                min((settings.NODE_MAX_W + 60) * grow, longest / 0.55 + 10))
        inner = w * 0.55                        #   the middle band of it
    else:
        pad = drawn["side"]
        base = settings.OVAL_W if drawn.get("floor") == "oval" else settings.NODE_W
        w = max(base, min(settings.NODE_MAX_W * grow, longest + pad))
        inner = w - pad
    lines = wrap(node.text, inner, size, bold)
    rows = len(lines)
    if (len(lines) > settings.TABLE_ROWS > 0 and "\n" in node.text
            and not drawn.get("wide") and not drawn.get("round")
            and drawn.get("floor") != "oval" and not drawn.get("grid")
            and not drawn.get("under")):
        w, rows, lines = as_table(node.text, size, bold, drawn["side"])
    if drawn.get("grid"):                       # a table: a head, and cells
        w, lines = table_lines(node.text, size, bold, grow)
        h = max(settings.NODE_MIN_H, table_plan(lines, tall))
    elif drawn.get("wide"):
        h = max(settings.DIA_MIN_H, 2.4 * len(lines) * tall + 8)
    elif drawn.get("floor") == "oval":
        h = max(settings.OVAL_H, len(lines) * tall + 2 * settings.PAD_Y)
    elif drawn.get("shaft"):                    # an arrow: as tall as it takes
        # for its shaft to carry the words, since that is where they go
        h = max(settings.NODE_MIN_H, arrow_h(rows * tall + 2 * ARROW_AIR))
    else:
        h = max(settings.NODE_MIN_H, rows * tall + 2 * settings.PAD_Y + drawn["top"])
    if drawn.get("round"):                      # a joining point is round
        h = max(h, min(w, 96), 40)
    # Up to a whole number of grid steps.  Every gap between shapes is a whole
    # number too, so a chart built out of these lands on the ruling behind it
    # instead of floating a few pixels off it all the way down.
    if settings.GRID_STEP > 0:
        step = settings.GRID_STEP * 2            # so h / 2 is a whole step as well
        h = math.ceil(h / step - 0.001) * step
    return Block(w, h, w / 2.0,
                 [("shape", node.shape, w / 2.0, h / 2.0, w, h, lines,
                   getattr(node, "node_id", 0))],
                 node.terminal)


def layout_seq(items):
    blocks = [layout_item(it) for it in items]
    if not blocks:
        return Block(0, 0, 0, [])
    axis = max(b.axis for b in blocks)
    right = max(b.w - b.axis for b in blocks)
    elems, y = [], 0.0
    for i, b in enumerate(blocks):
        if i:
            if not blocks[i - 1].terminal:
                elems.append(("line", axis, y, axis, y + settings.VGAP, True))
            y += settings.VGAP
        elems += shift(b.elems, axis - b.axis, y)
        y += b.h
    return Block(axis + right, y, axis, elems, blocks[-1].terminal)


# Which part lays out which kind of statement.  An If, a loop and a Select
# each have a file of their own, and each writes its own name in here as it
# is read.  That is the whole reason this file can be the one they all lean
# on: it knows that something lays out an "if" without knowing what, so it
# needs to know nothing about them at all.  Adding a kind of statement is
# adding a file and one line at the foot of it.
LAYOUTS = {"node": node_block}


def layout_item(item):
    """One statement, laid out by whichever part knows its kind."""
    lay = LAYOUTS.get(getattr(item, "kind", ""))
    return lay(item) if lay else node_block(item)


