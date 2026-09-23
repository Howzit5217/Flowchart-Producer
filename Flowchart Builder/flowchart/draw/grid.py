"""The faint grid behind the chart."""
from .. import settings


def grid_lines(width, height):
    """The faint graph-paper grid that sits behind the chart.

    It is drawn as ordinary <path>s -- one for the fine lines, one for the
    darker every-fifth line -- rather than as an SVG <pattern>, for the
    same reason the arrowheads are polygons rather than markers: Word and
    PowerPoint quietly drop the clever bit on import, and a path is just a
    line like any other, so every viewer draws it.  They go in before
    anything else, and every shape is filled, so no grid line ever crosses
    a box, a label or a letter."""
    return [piece for _, _, piece in grid_slabs(width, height)]


def grid_slabs(width, height):
    """The grid in slabs down the chart: (top, foot, the paths) for each.

    It was two paths from the top of the chart to the foot, and on a tall
    chart that is one path of tens of thousands of lines.  A browser draws
    the page a tile at a time, and every tile had to go through the whole
    of that path to find the handful of lines crossing it -- so on a chart
    a few hundred thousand pixels tall, a screenful took long enough to
    draw that the page showed its tiles blank first: white, until they came
    in, which on a dark palette was a white flash over the chart every time
    it was built.  In slabs a band tall, a tile only looks at the slab or
    two it is in, and a chart drawn in bands leaves the slabs far from the
    screen out altogether.  A chart shorter than a slab is drawn exactly as
    it always was."""
    if not settings.GRID or settings.GRID_STEP <= 0:
        return []
    step, every = settings.GRID_STEP, settings.GRID_MAJOR
    # A whole number of the darker lines to a slab, so each slab starts on
    # one and the ruling runs on across the joins unbroken.
    tall = max(step * (every or 1), settings.BAND_H // (step * (every or 1)) * step * (every or 1))
    columns = []
    n, x = 0, 0.0
    while x <= width + 0.01:
        columns.append((x, bool(every) and n % every == 0))
        x += step
        n += 1
    slabs = []
    top = 0.0
    n = 0                                   # which row of the ruling y is
    y = 0.0
    while True:
        foot = min(height, top + tall)
        last = foot >= height - 0.01
        fine, major = [], []
        for x, heavy in columns:
            (major if heavy else fine).append("M%.1f,%.1fV%.1f" % (x, top, foot))
        while y <= height + 0.01 and (y < foot - 0.01 or last):
            (major if every and n % every == 0 else fine).append("M0,%.1fH%.1f" % (y, width))
            y += step
            n += 1
        paths = []
        for name, d, ink, wide in (("fine", fine, settings.GRID_INK, 0.7),
                                   ("major", major, settings.GRID_INK_MAJOR, 1.0)):
            if d:
                # square ends said outright: in a band it sits inside the
                # drawing's group, which rounds the ends of everything else
                paths.append('<path class="grid %s" d="%s" fill="none" stroke="%s" '
                             'stroke-width="%s" stroke-linecap="butt"/>'
                             % (name, "".join(d), ink, wide))
        slabs.append((top, foot, "\n".join(paths)))
        if last:
            break
        top = foot
    return slabs
