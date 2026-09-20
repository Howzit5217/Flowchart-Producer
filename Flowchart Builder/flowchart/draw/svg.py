"""Putting the SVG together."""
import html

from .. import settings
from ..draw.grid import grid_lines
from ..draw.outlines import shape_art
from ..draw.arrows import arrow_head, chain_lines, path_d
from ..layout.blocks import shift
from ..layout.columns import bbox
from ..measure import FONT, FONT_SIZE, LINE_H, text_w
from ..shapes import geom_of
from ..words.lookup import word


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
    minx, miny, maxx, maxy = bbox(elems)
    head_h = settings.TITLE_H if title else 0
    # Set the chart down so that the shapes fall on the ruling.  The nudge is
    # measured from a shape rather than from the edge of everything, because
    # the edge of everything includes labels and arrowheads sitting at
    # whatever height they happen to sit at.  Only the whole chart moves, so
    # nothing inside it is disturbed; the margin grows by up to one step.
    over, down = settings.MARGIN - minx, settings.MARGIN - miny + head_h
    if settings.GRID and settings.GRID_STEP > 0:
        tops = [e[3] - e[5] / 2.0 for e in elems if e[0] == "shape"]
        lefts = [e[2] - e[4] / 2.0 for e in elems if e[0] == "shape"]
        if tops:
            over += (-(min(lefts) + over)) % settings.GRID_STEP
            down += (-(min(tops) + down)) % settings.GRID_STEP
    elems = shift(elems, over, down)
    width = maxx - minx + settings.MARGIN * 2
    height = maxy - miny + settings.MARGIN * 2 + head_h

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
        f'<g font-family="{FONT}" font-size="{FONT_SIZE}" fill="none" '
        f'stroke="{settings.INK}" stroke-width="1.3" stroke-linecap="round" '
        'stroke-linejoin="round">',
    ]
    # Named, like everything else that carries words, so that a page showing
    # the chart can recolor them with the rest.  Without the name they were
    # the only writing on the chart that stayed black whatever color the
    # paper was put on -- which on dark paper meant they were not there.
    if title:
        out.append(f'<text class="title" x="{settings.MARGIN}" y="25" font-size="16" '
                   f'font-weight="bold" stroke="none" fill="{settings.INK}">'
                   f'{html.escape(title)}</text>')
        if author:
            out.append(f'<text class="author" x="{settings.MARGIN}" y="42" stroke="none" '
                       f'fill="{settings.INK}">{html.escape(author)}</text>')

    # A route gets an arrowhead where it arrives at a shape.  That is the
    # whole rule.
    #
    # It used to get one where it arrived side-on at a line that carried on
    # past the point as well -- a branch rejoining the flow it left, aimed
    # at the line it was rejoining.  The reasoning was sound and the result
    # was not.  Those joins happen on the rail a few pixels above the shape
    # the rail runs into, so the head landed on the line with another head
    # just below it that really was arriving somewhere, and a loop going
    # round again put a third one on the same rail from the other side.
    # Two and three heads clustered at the foot of a diamond read as a
    # pile-up rather than as a join.
    #
    # A line that joins another needs no head of its own: the line it joins
    # is going somewhere and carries the head that says where.  Which is
    # what the two sides of an If have always done here -- they arrive nose
    # to nose at one point and neither carries a head, because two heads
    # meeting there read as a collision.  The same is true of every other
    # join; it was only ever this one that argued otherwise.
    nodes = 0                            # shapes get a number as they go
    boxes = [(e[2] - e[4] / 2.0, e[3] - e[5] / 2.0,
              e[2] + e[4] / 2.0, e[3] + e[5] / 2.0)
             for e in elems if e[0] == "shape"]
    segs = [e for e in elems if e[0] == "line"]

    def reaches_a_shape(pt):
        for a, b, c, d in boxes:
            if a - 1.5 <= pt[0] <= c + 1.5 and b - 1.5 <= pt[1] <= d + 1.5:
                return True
        return False

    # Routes first, because the shapes and the labels are meant to paint over
    # them.  The tips are held back to the very end: a label carries a patch
    # of blank paper behind it so the line does not run through the word, and
    # where a label sat near the end of a route that patch took the point off
    # the arrow with it.  Nothing should ever be painted over a tip.
    tips = []
    for pts, arrow in chain_lines(segs):
        head = None
        if reaches_a_shape(pts[-1]):
            head, pts = arrow_head(pts)
        d = path_d(pts)
        if d:
            out.append(f'<path class="flow" d="{d}" fill="none"/>')
        if head:
            tips.append(f'<polygon class="head" points="{head}" fill="{settings.INK}" '
                        f'stroke="{settings.INK}" stroke-width="0.6" '
                        'stroke-linejoin="miter"/>')

    for e in elems:
        if e[0] == "line":
            continue
        elif e[0] == "text":                    # Yes / No / Case labels
            _, x, y, s_, anchor = e
            if not s_:
                continue
            tw = text_w(s_, FONT_SIZE, True) + 8  # patch keeps the label off
            bx = {"end": x - tw + 4,            #   whatever line runs behind it
                  "middle": x - tw / 2.0}.get(anchor, x - 4)
            out.append(f'<rect class="patch" x="{bx:.1f}" y="{y - 10:.1f}" '
                       f'width="{tw:.1f}" height="13" fill="{settings.SHEET}" '
                       'stroke="none"/>')
            out.append(f'<text class="label" x="{x:.1f}" y="{y:.1f}" '
                       f'text-anchor="{anchor}" font-weight="bold" '
                       f'stroke="none" fill="{settings.INK}">{html.escape(s_)}</text>')
        elif e[0] == "htext":
            _, x, y, s_, anchor = e
            out.append(f'<text class="heading" x="{x:.1f}" y="{y:.1f}" '
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
            out.append(f'<g class="node" data-kind="{shape}" '
                       f'data-i="{said or nodes}">')
            drawn = geom_of(shape)
            out += shape_art(drawn, cx, cy, w, h, paint)
            if drawn == "store":                 # the words clear of the lip
                ty = cy + min(5.0, h * 0.09)
            elif drawn == "offpage":             # clear of the point at the foot
                ty = cy - h * 0.12
            elif drawn == "parallel":            # between the two bars
                ty = cy
            elif drawn == "stored":              # inside the ruled corner
                ty = cy + min(4.0, h * 0.07)
            y0 = ty - (len(lines) - 1) * LINE_H / 2.0 + 4
            for i, line in enumerate(lines):
                out.append(f'<text x="{tx:.1f}" y="{y0 + i*LINE_H:.1f}" '
                           f'text-anchor="middle" stroke="none" fill="{settings.INK}">'
                           f'{html.escape(line)}</text>')
            out.append("</g>")
    out += tips                             # the points of the arrows, on top
    out += ["</g>", "</svg>"]
    return "\n".join(out)



