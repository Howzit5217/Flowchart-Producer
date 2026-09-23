"""Reading a finished chart back, and saying what is wrong with it.

Every one of these started as a complaint about a chart that looked wrong.
Rather than fix each by eye and hope, the thing being complained about was
written down as something countable -- a line that doubles back, a line that
runs through a shape, an arrow whose point has been painted over -- so that
the fix could be shown to work and, more to the point, shown to still work
later on.
"""
import math
import re


# --------------------------------------------------------------- reading it --
def paths(svg):
    """Every arrow in the chart, as its corner points."""
    out = []
    for d in re.findall(r'<path[^>]*class="[^"]*flow[^"]*"[^>]*\sd="([^"]+)"', svg):
        pts = []
        for bit in re.finditer(r"([MLQ])([-\d.,\s]+)", d):
            n = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", bit.group(2))]
            if bit.group(1) == "Q":
                pts.append((n[2], n[3]))        # the far end of a rounded corner
            else:
                for i in range(0, len(n) - 1, 2):
                    pts.append((n[i], n[i + 1]))
        if len(pts) > 1:
            out.append(pts)
    return out


def legs(pts, least=10.0):
    """The straight runs of a route: (way, how far, from, to)."""
    out = []
    for a, b in zip(pts, pts[1:]):
        dx, dy = b[0] - a[0], b[1] - a[1]
        if abs(dx) < 1.5 and abs(dy) < 1.5:
            continue
        way = ("right" if dx > 0 else "left") if abs(dx) > abs(dy) else \
              ("down" if dy > 0 else "up")
        out.append((way, math.hypot(dx, dy), a, b))
    return [g for g in out if g[1] > least]


def shapes(svg):
    """The box each shape occupies: (left, top, right, foot, sure).

    `sure` says whether the box is exact.  A rectangle, a polygon or an
    ellipse can be measured exactly from what is written down; a shape drawn
    as a path with curves in it -- a page, a drum, a cloud -- can only be
    guessed at from the numbers in the path, so anything that has to be right
    leaves those alone.  The words inside a shape are not part of it and are
    not measured: reading them as coordinates was what once made this say
    every chart was a pile of overlapping shapes.
    """
    out = []
    for g in re.finditer(r'<g class="node"[^>]*>(.*?)</g>', svg, re.S):
        xs, ys, sure = [], [], True
        for tag in re.findall(r"<(?:rect|polygon|ellipse|circle|path)[^>]*>",
                              g.group(1)):
            if 'class="ghost"' in tag or 'class="trim"' in tag:
                continue
            box = re.search(r'x="(-?[\d.]+)"[^>]*y="(-?[\d.]+)"'
                            r'[^>]*width="([\d.]+)"[^>]*height="([\d.]+)"', tag)
            if box:
                x, y, w, h = (float(v) for v in box.groups())
                xs += [x, x + w]
                ys += [y, y + h]
                continue
            corners = re.search(r'points="([^"]+)"', tag)
            if corners:
                n = [float(v) for v in re.findall(r"-?[\d.]+", corners.group(1))]
                xs += n[0::2]
                ys += n[1::2]
                continue
            round_ = re.search(r'cx="(-?[\d.]+)"[^>]*cy="(-?[\d.]+)"'
                               r'[^>]*rx="([\d.]+)"[^>]*ry="([\d.]+)"', tag)
            if round_:
                cx, cy, rx, ry = (float(v) for v in round_.groups())
                xs += [cx - rx, cx + rx]
                ys += [cy - ry, cy + ry]
                continue
            dot = re.search(r'cx="(-?[\d.]+)"[^>]*cy="(-?[\d.]+)"[^>]*r="([\d.]+)"', tag)
            if dot:
                cx, cy, r = (float(v) for v in dot.groups())
                xs += [cx - r, cx + r]
                ys += [cy - r, cy + r]
                continue
            drawn = re.search(r'\sd="([^"]+)"', tag)
            if drawn:                           # a curve: near enough, not exact
                n = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", drawn.group(1))]
                xs += n[0::2]
                ys += n[1::2]
                sure = False
        if xs and ys:
            out.append((min(xs), min(ys), max(xs), max(ys), sure))
    return out


# ------------------------------------------------------- what can be wrong --
def doubles_back(svg):
    """A route that goes one way and then back the other, gaining nothing.

    Going round something is fine: the test is whether it travelled far
    enough across the other way to have been worth the turn -- or whether
    there is a shape standing inside the turn that it went round.  A loop's
    way back goes round the whole body of the loop, and a compressed chart
    can have a body wider than it is tall: judged by how far it went
    across alone, that read as a line doubling back on itself.
    """
    boxes = shapes(svg)
    hits = 0
    for pts in paths(svg):
        run = legs(pts)
        found = False
        for i in range(len(run) - 1):
            for j in range(i + 1, len(run)):
                pair = {run[i][0], run[j][0]}
                if pair not in ({"left", "right"}, {"down", "up"}):
                    continue
                across = sum(g[1] for g in run[i + 1:j] if g[0] not in pair)
                if across < min(run[i][1], run[j][1]) * 0.9 \
                        and not goes_round(run[i], run[j], boxes):
                    found = True
                    break
            if found:
                break
        hits += 1 if found else 0
    return hits


def goes_round(one, other, boxes):
    """Whether two legs running opposite ways -- the two arms of a U --
    have a shape standing between them: the middle of it inside the stretch
    both arms cover, and between the lines the two of them run along."""
    flat = one[0] in ("left", "right")
    at = 1 if flat else 0                        # where each arm runs along
    along = 0 if flat else 1                     # and which way it runs
    lo = max(min(one[2][along], one[3][along]), min(other[2][along], other[3][along]))
    hi = min(max(one[2][along], one[3][along]), max(other[2][along], other[3][along]))
    near, far = sorted((one[2][at], other[2][at]))
    for box in boxes:
        mid = ((box[0] + box[2]) / 2.0, (box[1] + box[3]) / 2.0)
        if lo < mid[along] < hi and near < mid[at] < far:
            return True
    return False


def wraps_a_shape(svg):
    """A line that drops out of a shape's foot only to climb back past it."""
    boxes = shapes(svg)
    hits = 0
    for pts in paths(svg):
        run = legs(pts)
        if not run:
            continue
        start = run[0][2]
        near = [b for b in boxes
                if b[0] - 14 <= start[0] <= b[2] + 14
                and b[1] - 14 <= start[1] <= b[3] + 14]
        if not near:
            continue
        box = near[0]
        left_the_foot = abs(start[1] - box[3]) < 12
        climbs_past = any(g[0] == "up" and g[3][1] < box[1] for g in run)
        hits += 1 if (left_the_foot and climbs_past) else 0
    return hits


def covered_tips(svg):
    """An arrow's point painted over by the blank patch behind a label."""
    heads, patches = [], []
    for m in re.finditer(r"<(rect|polygon)[^>]*>", svg):
        tag = m.group(0)
        if 'class="patch"' in tag:
            box = [float(re.search(r'%s="(-?[\d.]+)"' % k, tag).group(1))
                   for k in ("x", "y", "width", "height")]
            patches.append((m.start(), box[0], box[1],
                            box[0] + box[2], box[1] + box[3]))
        elif m.group(1) == "polygon" and 'class="head"' in tag:
            n = [float(v) for v in
                 re.findall(r"-?[\d.]+", re.search(r'points="([^"]+)"', tag).group(1))]
            xs, ys = n[0::2], n[1::2]
            heads.append((m.start(), min(xs), min(ys), max(xs), max(ys)))
    hits = 0
    for at, hx0, hy0, hx1, hy1 in heads:
        for pat, px0, py0, px1, py1 in patches:
            if pat < at:                        # drawn first: harmless
                continue
            if hx0 < px1 and px0 < hx1 and hy0 < py1 and py0 < hy1:
                hits += 1
                break
    return hits


def _meets(a, b, box):
    """Does the segment a-b pass through the box?"""
    x0, y0, x1, y1 = box
    t0, t1 = 0.0, 1.0
    dx, dy = b[0] - a[0], b[1] - a[1]
    for p, q in ((-dx, a[0] - x0), (dx, x1 - a[0]), (-dy, a[1] - y0), (dy, y1 - a[1])):
        if p == 0:
            if q < 0:
                return False
            continue
        t = q / p
        if p < 0:
            t0 = max(t0, t)
        else:
            t1 = min(t1, t)
        if t0 > t1:
            return False
    return True


def _off_box(px, py, box):
    return math.hypot(max(box[0] - px, 0, px - box[2]), max(box[1] - py, 0, py - box[3]))


def _off_segment(px, py, a, b):
    vx, vy = b[0] - a[0], b[1] - a[1]
    run = vx * vx + vy * vy
    t = 0.0 if not run else max(0.0, min(1.0, ((px - a[0]) * vx + (py - a[1]) * vy) / run))
    return math.hypot(px - a[0] - vx * t, py - a[1] - vy * t)


def _segment_to_box(a, b, box):
    """How near the segment a-b comes to the box: nought where they meet."""
    if _meets(a, b, box):
        return 0.0
    corners = ((box[0], box[1]), (box[2], box[1]), (box[0], box[3]), (box[2], box[3]))
    return min([_off_box(a[0], a[1], box), _off_box(b[0], b[1], box)] +
               [_off_segment(cx, cy, a, b) for cx, cy in corners])


def _inside(px, py, ring):
    hit = False
    for (ax, ay), (bx, by) in zip(ring, ring[1:] + ring[:1]):
        if (ay > py) != (by > py) and px < (bx - ax) * (py - ay) / (by - ay) + ax:
            hit = not hit
    return hit


def _route_legs(d):
    """A route's path as straight pieces, its rounded corners included."""
    legs_, at = [], None
    for bit in re.finditer(r"([MLQ])([-\d.,\s]+)", d):
        n = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", bit.group(2))]
        if bit.group(1) == "M":
            at = (n[0], n[1])
        elif bit.group(1) == "L":
            legs_.append((at, (n[0], n[1])))
            at = (n[0], n[1])
        else:
            (cx, cy), end, was = (n[0], n[1]), (n[2], n[3]), at
            for k in range(1, 9):
                t = k / 8.0
                pt = ((1 - t) ** 2 * at[0] + 2 * (1 - t) * t * cx + t * t * end[0],
                      (1 - t) ** 2 * at[1] + 2 * (1 - t) * t * cy + t * t * end[1])
                legs_.append((was, pt))
                was = pt
            at = end
    return legs_


def crowded_labels(svg, width_of, room=3.0):
    """A True, a False or a Case whose letters come within `room` of a
    line, an arrowhead or a shape: (how many, of how many).

    What this was written for: the word beside a line going down, set five
    pixels off the line and so a pixel off the side of the arrowhead on it;
    the word above a line going into the side of a box, sitting on the
    corner of the head there; and the word on a Do ... Until's way back,
    written straight across the line going up.  The letters are measured as
    the drawing measures them -- `width_of(text, size, bold)` across, and a
    capital's height above the baseline -- so it is the words themselves
    that are kept clear, not the patch of paper behind them.  Every stroke
    counts as far as it is drawn wide."""
    import html
    size = float(re.search(r'<g font-family="[^"]*" font-size="([\d.]+)"', svg).group(1))
    lines = []
    for d in re.findall(r'<path class="flow" d="([^"]+)"', svg):
        lines += _route_legs(d)
    rings = []                              # (corners, half the pen)
    for pts in re.findall(r'<polygon class="head" points="([^"]+)"', svg):
        n = [float(v) for v in re.findall(r"-?[\d.]+", pts)]
        rings.append((list(zip(n[0::2], n[1::2])), 0.3))
    for g in re.finditer(r'<g class="node"[^>]*>(.*?)</g>', svg, re.S):
        for tag in re.findall(r"<(?:rect|polygon|ellipse)[^>]*>", g.group(1)):
            if 'class="ghost"' in tag or 'class="trim"' in tag:
                continue
            box = re.search(r'x="(-?[\d.]+)" y="(-?[\d.]+)" width="([\d.]+)" height="([\d.]+)"', tag)
            corners = re.search(r'points="([^"]+)"', tag)
            round_ = re.search(r'cx="(-?[\d.]+)" cy="(-?[\d.]+)" rx="([\d.]+)" ry="([\d.]+)"', tag)
            if box:
                x, y, w, h = (float(v) for v in box.groups())
                rings.append(([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], 0.65))
            elif corners:
                n = [float(v) for v in re.findall(r"-?[\d.]+", corners.group(1))]
                rings.append((list(zip(n[0::2], n[1::2])), 0.65))
            elif round_:
                cx, cy, rx, ry = (float(v) for v in round_.groups())
                rings.append(([(cx + rx * math.cos(k * math.pi / 16),
                                cy + ry * math.sin(k * math.pi / 16))
                               for k in range(32)], 0.65))
    labels = re.findall(r'<text class="label" x="(-?[\d.]+)" y="(-?[\d.]+)" '
                        r'text-anchor="(\w+)"[^>]*>([^<]+)</text>', svg)
    hits = 0
    for x, y, anchor, said in labels:
        said = html.unescape(said)
        x, y, wide = float(x), float(y), width_of(said, size, True)
        left = {"end": x - wide, "middle": x - wide / 2.0}.get(anchor, x)
        hangs = any(ch in "gjpqyQ,;()[]{}|_$@" for ch in said)
        box = (left, y - 0.72 * size, left + wide, y + (0.21 * size if hangs else 0.0))
        near = min([_segment_to_box(a, b, box) - 0.65 for a, b in lines] + [room + 1])
        for ring, pen in rings:
            if near < room:
                break
            if _inside((box[0] + box[2]) / 2.0, (box[1] + box[3]) / 2.0, ring):
                near = 0.0
                break
            for a, b in zip(ring, ring[1:] + ring[:1]):
                near = min(near, _segment_to_box(a, b, box) - pen)
        hits += near < room
    return hits, len(labels)


def crowded_heads(svg, room=6.0):
    """Two arrowheads closer together than `room`, which reads as a pile of
    them rather than as two arrows.

    What this was written for: the two sides of an If meeting right on the
    point of its diamond, each with a head, nose to nose on the tip, and the
    head of the line leaving the meeting just under them.  Before that, a
    loop's way back coming in one short gap above the shape the line runs
    into, its head on top of the head below."""
    boxes = []
    for pts in re.findall(r'<polygon[^>]*class="head"[^>]*points="([^"]+)"', svg):
        n = [float(v) for v in re.findall(r"-?[\d.]+", pts)]
        boxes.append((min(n[0::2]), min(n[1::2]), max(n[0::2]), max(n[1::2])))
    hits = 0
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            a, b = boxes[i], boxes[j]
            apart = max(b[0] - a[2], a[0] - b[2], b[1] - a[3], a[1] - b[3])
            if apart < room:
                hits += 1
    return hits


def bare_joins(svg):
    """A line that stops dead against another line, side-on, with no head.

    That is a loop's way back, or a branch coming home, and without a head
    nothing on the chart says which way it runs -- it could as well be the
    line going out.  A line that carries straight on through the join is
    not one of these, and neither are the two sides of an If meeting nose
    to nose, where nothing carries on across and the line leaving the
    meeting says where it goes.  A line with a head on it stops short, at
    the back of the head, so it never ends on the line it points at."""
    routes = paths(svg)
    near = lambda p, q: abs(p[0] - q[0]) < 0.6 and abs(p[1] - q[1]) < 0.6
    upright = lambda p, q: abs(q[1] - p[1]) > abs(q[0] - p[0])
    legs = [(a, b) for pts in routes for a, b in zip(pts, pts[1:])
            if abs(a[0] - b[0]) < 0.5 or abs(a[1] - b[1]) < 0.5]
    hits = 0
    for pts in routes:
        a, end = pts[-2], pts[-1]
        way = upright(a, end)
        if any(near(p, end) and upright(p, q) == way for p, q in legs):
            continue                            # carries straight on
        into = away = through = False
        for p, q in legs:
            if upright(p, q) == way:
                continue
            into |= near(q, end)
            away |= near(p, end)
            if upright(p, q):
                through |= abs(p[0] - end[0]) < 0.6 and \
                    min(p[1], q[1]) + 1.5 < end[1] < max(p[1], q[1]) - 1.5
            else:
                through |= abs(p[1] - end[1]) < 0.6 and \
                    min(p[0], q[0]) + 1.5 < end[0] < max(p[0], q[0]) - 1.5
        if through or (into and away):
            hits += 1
    return hits


def most_turns(svg):
    """The most corners any one route in this chart takes."""
    worst = 0
    for pts in paths(svg):
        run = legs(pts)
        turns = sum(1 for i in range(1, len(run)) if run[i][0] != run[i - 1][0])
        worst = max(worst, turns)
    return worst


def overlapping(svg):
    """Two shapes drawn on top of one another."""
    boxes = [b for b in shapes(svg)
             if b[4] and b[2] - b[0] > 4 and b[3] - b[1] > 4]
    hits = 0
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            a, b = boxes[i], boxes[j]
            if a[0] < b[2] - 2 and b[0] < a[2] - 2 \
                    and a[1] < b[3] - 2 and b[1] < a[3] - 2:
                hits += 1
    return hits


def grid_step(svg):
    """How far apart the grid drawn behind the chart is ruled, read off the
    drawing: its first fine upright line stands one step in from the edge.
    None where there is no grid drawn to read.  A chart is drawn on a grid
    of its own -- shaken, or compressed -- so this is the step to measure
    it against, rather than whatever the last drawing left the settings at."""
    first = re.search(r'class="grid fine" d="M([\d.]+),[\d.]+V', svg)
    return float(first.group(1)) if first and float(first.group(1)) > 0 else None


def off_the_grid(svg, step):
    """Shape edges that do not sit on a grid line: (how many, of how many).

    The grid is ruled from the chart's corner in steps of `step`, so a shape
    is on it when its top and its foot are whole steps down.  Only the ones
    measured exactly are counted -- a page or a drum drawn as a curve cannot
    be measured from what is written down.
    """
    off = seen = 0
    for left, top, right, foot, sure in shapes(svg):
        if not sure:
            continue
        for edge in (top, foot):
            seen += 1
            if abs(edge / step - round(edge / step)) > 0.02:
                off += 1
    return off, seen
