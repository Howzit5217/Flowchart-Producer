"""Putting the SVG together."""
import html
from bisect import bisect_left

from .. import measure, progress, settings
from ..draw.grid import grid_lines
from ..draw.outlines import shape_art
from ..draw.arrows import arrow_head, chain_lines, path_d
from ..layout.blocks import TABLE_BREAK, label_drop, shift
from ..layout.columns import bbox
from ..measure import FONT, line_h, text_w, type_of
from ..shapes import SHAPES, geom_of
from ..words.lookup import word


def table_words(lines, drawn, left, w, ty, size, tall):
    """The words of a box set as a table, a column at a time: each column
    ranged left, the way a table is read, and every one starting on the
    same line, so the rows of the columns line up across the box."""
    columns, col = [], []
    for line in lines:
        if line == TABLE_BREAK:
            columns.append(col)
            col = []
        else:
            col.append(line)
    columns.append(col)
    pad = SHAPES.get(drawn, SHAPES["rect"])["side"]
    across = (w - pad - (len(columns) - 1) * settings.TABLE_GAP) / len(columns)
    rows = max(len(c) for c in columns)
    y0 = ty - (rows - 1) * tall / 2.0 + 4.0 * size / measure.BASE_SIZE
    out = []
    for n, col in enumerate(columns):
        x = left + pad / 2.0 + n * (across + settings.TABLE_GAP)
        for i, line in enumerate(col):
            out.append(f'<text x="{x:.1f}" y="{y0 + i*tall:.1f}" '
                       f'text-anchor="start" stroke="none" fill="{settings.INK}">'
                       f'{html.escape(line)}</text>')
    return out


def described(elems):
    """What the chart is, for anything reading it that cannot see it.

    A saved .svg went out with no name and no summary on it at all, so to a
    screen reader it was an unlabeled graphic -- which for a chart somebody
    is handing in, or putting on a page for a class to read, is the whole of
    it missing.  The shapes are counted by kind and named the way the key
    names them, in whatever language the chart is drawn in.

    The words inside the shapes are left exposed rather than sealed off
    behind role="img": down a flowchart they come in very nearly the order
    the program runs, which is worth more than nothing, and hiding them to
    put this line in its place would trade one for the other.
    """
    counted = {}
    for e in elems:
        if e[0] == "shape":
            counted[e[1]] = counted.get(e[1], 0) + 1
    if not counted:
        return word("flowchart")
    order = [k for k in settings.LEGEND_ORDER if k in counted]
    order += sorted(k for k in counted if k not in settings.LEGEND_ORDER)
    named = ", ".join(
        "%d %s" % (counted[k], settings.LEGEND_NAME.get(k, k)) for k in order)
    return word("chart_desc", n=sum(counted.values()), kinds=named)


def to_svg(elems, title=None, author=None):
    # Drawing starts here, not at the first route: gluing the lines into
    # routes and working out their heads comes first and is a third of the
    # work, and said nothing -- so the page counted it as laying out.
    progress.say("draw")
    minx, miny, maxx, maxy = bbox(elems)
    head_h = settings.TITLE_H if title else 0
    # Set the chart down so that the shapes fall on the ruling.  The nudge is
    # measured from a shape rather than from the edge of everything, because
    # the edge of everything includes labels and arrowheads sitting at
    # whatever height they happen to sit at.  Only the whole chart moves, so
    # nothing inside it is disturbed; the margin grows by up to one step.
    wall = settings.MARGIN
    over, down = wall - minx, wall - miny + head_h
    nudge_x = nudge_y = 0.0
    if settings.GRID and settings.GRID_STEP > 0:
        tops = [e[3] - e[5] / 2.0 for e in elems if e[0] == "shape"]
        lefts = [e[2] - e[4] / 2.0 for e in elems if e[0] == "shape"]
        if tops:
            nudge_x = (-(min(lefts) + over)) % settings.GRID_STEP
            nudge_y = (-(min(tops) + down)) % settings.GRID_STEP
            over += nudge_x
            down += nudge_y
    elems = shift(elems, over, down)
    # And the far side is given the same room as the near one.  It used to be
    # given the margin alone, so whatever the nudge added on the left and at
    # the top came straight off the right and the bottom: a chart two
    # squares clear of the left edge and the top could stand under half a
    # square from the right and the foot of the paper, and sit visibly off
    # to one side of its own sheet.
    width = maxx - minx + (wall + nudge_x) * 2
    height = maxy - miny + (wall + nudge_y) * 2 + head_h

    out = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" '
        f'height="{height:.0f}" viewBox="0 0 {width:.0f} {height:.0f}" '
        f'aria-label="{html.escape(title or word("flowchart"), True)}">',
        # <desc> is never drawn and never hovered over -- a <title> here
        # would be, and the studio shows this same drawing on the page,
        # where a tooltip following the pointer over the whole chart is
        # not something anybody asked for.
        f'<desc>{html.escape(described(elems))}</desc>',
        f'<rect class="sheet" width="100%" height="100%" fill="{settings.SHEET}"/>',
    ]
    out += grid_lines(width, height)
    out += [
        f'<g font-family="{FONT}" font-size="{measure.FONT_SIZE:g}" fill="none" '
        f'stroke="{settings.INK}" stroke-width="1.3" stroke-linecap="round" '
        'stroke-linejoin="round">',
    ]
    # Named, like everything else that carries words, so that a page showing
    # the chart can recolor them with the rest.  Without the name they were
    # the only writing on the chart that stayed black whatever color the
    # paper was put on -- which on dark paper meant they were not there.
    # The title stands inside the wall like everything else, its first line
    # hanging from where the wall ends, rather than up against the top edge.
    if title:
        out.append(f'<text class="title" x="{wall}" y="{wall + 12}" font-size="16" '
                   f'font-weight="bold" stroke="none" fill="{settings.INK}">'
                   f'{html.escape(title)}</text>')
        if author:
            out.append(f'<text class="author" x="{wall}" y="{wall + 29}" stroke="none" '
                       f'fill="{settings.INK}">{html.escape(author)}</text>')

    # A route gets an arrowhead where it arrives at a shape, and also where
    # it arrives side-on at a line that carries on past the point -- a loop
    # coming round again, or a branch rejoining the flow it left.  It points
    # at that line, which is what it is really arriving at.  Left bare, the
    # way back up the side of a loop is a line with nothing on it to say
    # which way it runs.
    #
    # What never gets a head is a route that merely meets another one: the
    # two sides of an If coming back together arrive nose to nose at the
    # same point, and two heads there read as a collision rather than a
    # join.  There the single arrow leaving the meeting says where it goes.
    #
    # Arriving at a shape means pointing into it, not ending somewhere near
    # it.  The test was once only whether the end of a route fell inside the
    # box a shape sits in, and a diamond's box is mostly not diamond: the
    # two sides of an If that met right under its point were taken to be
    # arriving at it, and got a head each, nose to nose on the tip.  So the
    # route has to be heading into the shape as well -- a step further on
    # from where it stops lies inside -- and one running along the foot of
    # a box, or across the point of a diamond, is not.
    #
    # Whether a head has room to be read is the layout's business: a join
    # is laid out far enough from the shape below it that the head on the
    # join and the head going into the shape stand apart.
    nodes = 0                            # shapes get a number as they go
    boxes = [(e[2] - e[4] / 2.0, e[3] - e[5] / 2.0,
              e[2] + e[4] / 2.0, e[3] + e[5] / 2.0)
             for e in elems if e[0] == "shape"]
    # A line of no length draws nothing, but it was counted when asking which
    # way the lines at a point go -- as running across, since it runs
    # neither way -- so a branch coming home across the page seemed to
    # carry straight on at the join and was given no head.  The layout left
    # one wherever the room it keeps below a join came to nothing (FizzBuzz,
    # on some shakes, going home into the line down to Set i = i + 1).
    segs = [e for e in elems if e[0] == "line"
            and (abs(e[3] - e[1]) > 0.01 or abs(e[4] - e[2]) > 0.01)]

    # Which shapes stand on each square of a coarse grid laid over the
    # chart, so that asking whether a route points into a shape looks only
    # at the few shapes standing where it points.  Asking every shape of
    # the chart, for every route in it, is shapes times routes: nothing at
    # forty shapes, and seven seconds of a ten-second drawing at fifteen
    # thousand lines of pseudocode, growing with the square of the program.
    # The point a step past the end of the route lies inside any shape
    # that counts, so the square that point is on holds every shape that
    # could.
    CELL = 128.0
    standing = {}
    for box in boxes:
        a, b, c, d = box
        for gx in range(int(a // CELL), int(c // CELL) + 1):
            for gy in range(int(b // CELL), int(d // CELL) + 1):
                standing.setdefault((gx, gy), []).append(box)

    def reaches_a_shape(pts):
        (ax, ay), (bx, by) = pts[-2], pts[-1]
        run = max(abs(bx - ax), abs(by - ay))
        if run < 0.01:
            return False
        fx, fy = bx + (bx - ax) / run * 3, by + (by - ay) / run * 3
        for a, b, c, d in standing.get((int(fx // CELL), int(fy // CELL)), ()):
            if a - 1.5 <= bx <= c + 1.5 and b - 1.5 <= by <= d + 1.5 \
                    and a + 0.5 < fx < c - 0.5 and b + 0.5 < fy < d - 0.5:
                return True
        return False

    upright = lambda dx, dy: abs(dy) > abs(dx)
    facing = lambda dx, dy: ((dx > 0.01) - (dx < -0.01), (dy > 0.01) - (dy < -0.01))
    at = lambda x, y: (round(x, 1), round(y, 1))
    leaving, arriving = {}, {}           # which way lines go at each point
    heading = {}                         # and which way round they arrive
    down_x, across_y = {}, {}            # verticals by x, horizontals by y
    for _, x1, y1, x2, y2, _a in segs:
        way = upright(x2 - x1, y2 - y1)
        leaving.setdefault(at(x1, y1), set()).add(way)
        arriving.setdefault(at(x2, y2), set()).add(way)
        heading.setdefault(at(x2, y2), set()).add(facing(x2 - x1, y2 - y1))
        if abs(x1 - x2) < 0.5:
            down_x.setdefault(round(x1, 1), []).append((min(y1, y2), max(y1, y2)))
        elif abs(y1 - y2) < 0.5:
            across_y.setdefault(round(y1, 1), []).append((min(x1, x2), max(x1, x2)))

    # The main line of a long program is thousands of segments at one x,
    # and going down all of them for every route that ends on that x is the
    # same squaring as above.  So each x (and each y) keeps its segments in
    # order of where they start, beside the furthest any of them has reached
    # so far: the ones starting before a point are found by halving, and
    # whether any of those carries on past it is one look.
    def in_order(spans):
        spans.sort()
        starts, reach, most = [], [], float("-inf")
        for lo, hi in spans:
            starts.append(lo + 1.5)
            most = max(most, hi - 1.5)
            reach.append(most)
        return starts, reach

    down_x = {x: in_order(spans) for x, spans in down_x.items()}
    across_y = {y: in_order(spans) for y, spans in across_y.items()}

    def carries_past(lines, key, along):
        starts, reach = lines.get(key, ((), ()))
        before = bisect_left(starts, along)      # those with lo + 1.5 < along
        return before > 0 and reach[before - 1] > along

    def runs_through(pt):
        """Is there a line at pt that carries on past it, rather than one
        that stops there?  Either a single segment pt sits inside, or one
        arriving and one leaving the same way, which is one line with a
        join drawn in the middle of it."""
        if leaving.get(pt, set()) & arriving.get(pt, set()):
            return True
        return carries_past(down_x, pt[0], pt[1]) or \
            carries_past(across_y, pt[1], pt[0])

    def joins_a_line(pts):
        """Does this route arrive side-on at a line that carries on past?"""
        pt = at(*pts[-1])
        (ax, ay), (bx, by) = pts[-2], pts[-1]
        came = upright(bx - ax, by - ay)
        # Met head-on by another route arriving from the other side, it is
        # the meeting above, whatever runs through the point: the outside
        # cases of a Select coming home either side of the middle one.
        fx, fy = facing(bx - ax, by - ay)
        if (-fx, -fy) in heading.get(pt, ()):
            return False
        return came not in leaving.get(pt, set()) and runs_through(pt)

    # A chart of thousands of shapes is written in bands, each a stretch of
    # its height, so that a page showing it can leave out whatever is
    # nowhere near the screen.  A browser lays out every word of a drawing
    # whether it can be seen or not, and lays them all out again at every
    # step of a zoom: on a program of forty-three thousand lines that was
    # well over a second on arrival and half a second a zoom step, for a
    # screenful of words.  Each piece goes in the band its top falls in, and
    # a band says how far its pieces reach, so a line that runs a long way
    # down is shown for as long as any of it is in sight.
    #
    # The routes, the shapes and the tips are banded separately, and every
    # band of routes comes before every band of shapes and every band of
    # tips after both, so nothing paints over anything it did not before.
    # A chart with fewer shapes is written exactly as it always was.
    tips = []
    banded = {} if len(boxes) > settings.BAND_FROM > 0 else None

    def put(layer, top, foot, piece):
        """A piece of the drawing: 0 a route, 1 a shape or a label, 2 a tip."""
        if banded is None:
            (tips if layer == 2 else out).append(piece)
            return
        key = (layer, int(top // settings.BAND_H))
        band = banded.get(key)
        if band is None:
            band = banded[key] = [top, foot, []]
        band[0], band[1] = min(band[0], top), max(band[1], foot)
        band[2].append(piece)

    # Routes first, because the shapes and the labels are meant to paint over
    # them.  The tips are held back to the very end: a label carries a patch
    # of blank paper behind it so the line does not run through the word, and
    # where a label sat near the end of a route that patch took the point off
    # the arrow with it.  Nothing should ever be painted over a tip.
    # How far through it is goes to progress.py as it goes: on a long
    # program this is most of the wait.  Gluing the routes together and
    # working out their heads, above, is about the first third of the work,
    # drawing the routes the next quarter, and the shapes and their words
    # the rest.
    routes = chain_lines(segs)
    for done, (pts, arrow) in enumerate(routes):
        if not done & 255:
            progress.say("draw", 0.35 + 0.25 * done / len(routes))
        head = None
        end = pts[-1][1]
        if reaches_a_shape(pts) or joins_a_line(pts):
            head, pts = arrow_head(pts)
        d = path_d(pts)
        if d:
            ys = [p[1] for p in pts]
            put(0, min(ys) - 2, max(ys) + 2,
                f'<path class="flow" d="{d}" fill="none"/>')
        if head:
            reach = settings.HEAD_LEN + 4
            put(2, end - reach, end + reach,
                f'<polygon class="head" points="{head}" fill="{settings.INK}" '
                f'stroke="{settings.INK}" stroke-width="0.6" '
                'stroke-linejoin="miter"/>')

    for done, e in enumerate(elems):
        if not done & 255:
            progress.say("draw", 0.6 + 0.4 * done / len(elems))
        if e[0] == "line":
            continue
        elif e[0] == "text":                    # Yes / No / Case labels
            _, x, y, s_, anchor = e
            if not s_:
                continue
            tw = text_w(s_, measure.FONT_SIZE, True) + 8  # patch keeps the label
            bx = {"end": x - tw + 4,            #   off whatever line runs behind it
                  "middle": x - tw / 2.0}.get(anchor, x - 4)
            # and goes no lower than the letters do: a patch a line of words
            # tall reached down past a True towards the line under it, and at
            # a big size took a bite out of the corner the line turned at
            top = y - (measure.FONT_SIZE - 1)
            tall = measure.FONT_SIZE + label_drop(s_)
            put(1, top, top + tall,
                f'<rect class="patch" x="{bx:.1f}" '
                f'y="{top:.1f}" width="{tw:.1f}" '
                f'height="{tall:.1f}" fill="{settings.SHEET}" '
                'stroke="none"/>')
            put(1, top, top + tall,
                f'<text class="label" x="{x:.1f}" y="{y:.1f}" '
                f'text-anchor="{anchor}" font-weight="bold" '
                f'stroke="none" fill="{settings.INK}">{html.escape(s_)}</text>')
        elif e[0] == "htext":
            _, x, y, s_, anchor = e
            put(1, y - 16, y + 5,
                f'<text class="heading" x="{x:.1f}" y="{y:.1f}" '
                f'text-anchor="{anchor}" font-size="13" '
                f'font-weight="bold" stroke="none" fill="{settings.INK}">'
                f'{html.escape(s_)}</text>')
        else:
            _, shape, cx, cy, w, h, lines = e[:7]
            said = e[7] if len(e) > 7 else 0
            l, r = cx - w / 2.0, cx + w / 2.0
            t, b = cy - h / 2.0, cy + h / 2.0
            paint = settings.FILL.get(shape, "#ffffff")
            tx, ty = cx, cy                     # where the words go
            # Every shape and the words in it go in a group of their own,
            # named for what kind of thing it is and numbered.  Nothing in
            # the drawing depends on that; it is there so a page showing the
            # chart can pick out one shape, or every shape of one kind, and
            # color it.
            nodes += 1
            piece = [f'<g class="node" data-kind="{shape}" '
                     f'data-i="{said or nodes}">']
            drawn = geom_of(shape)
            piece += shape_art(drawn, cx, cy, w, h, paint)
            if drawn == "store":                 # the words clear of the lip
                ty = cy + min(5.0, h * 0.09)
            elif drawn == "offpage":             # clear of the point at the foot
                ty = cy - h * 0.12
            elif drawn == "parallel":            # between the two bars
                ty = cy
            elif drawn == "stored":              # inside the ruled corner
                ty = cy + min(4.0, h * 0.07)
            # Lines as far apart as the words they carry are tall, and the
            # baseline set down by a third of that, whatever size the page
            # asked this step's words to be.  The size itself is the page's
            # to put on: it is a matter of how the chart looks, and the page
            # is where that is decided and changed.
            size, _ = type_of(said)
            tall = line_h(size)
            if TABLE_BREAK in lines:             # set as a table: see as_table
                piece += table_words(lines, drawn, l, w, ty, size, tall)
            else:
                y0 = ty - (len(lines) - 1) * tall / 2.0 + 4.0 * size / measure.BASE_SIZE
                for i, line in enumerate(lines):
                    piece.append(f'<text x="{tx:.1f}" y="{y0 + i*tall:.1f}" '
                                 f'text-anchor="middle" stroke="none" fill="{settings.INK}">'
                                 f'{html.escape(line)}</text>')
            piece.append("</g>")
            put(1, t - 4, b + 4, "\n".join(piece))
    if banded is None:
        out += tips                         # the points of the arrows, on top
    else:
        for key in sorted(banded):          # routes, then shapes, then tips
            top, foot, pieces = banded[key]
            # "stretch", not "band": the page already has a .band -- the line
            # drawn while two shapes are being joined -- and styles it
            out.append(f'<g class="stretch" data-y="{top:.0f} {foot:.0f}">')
            out += pieces
            out.append("</g>")
    out += ["</g>", "</svg>"]
    return "\n".join(out)



