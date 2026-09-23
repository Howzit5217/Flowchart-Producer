"""How far along a drawing is, for whoever is waiting on it.

A chart of a few lines is drawn before anybody could look for something to
watch.  One of ten thousand lines is seconds of work -- more in a browser,
where Python runs slower -- and seconds of a button that says only
"Drawing..." are seconds of wondering whether it has stuck.  So each stage
of a drawing says here where it has got to, and whoever asked to hear (the
studio page, through the worker it draws in) hears.

Nobody listening -- the command line, the tests -- costs one look at None.
"""
import time

EVERY = 0.05             # seconds between two reports from inside one stage

_hear = None
_last = [0.0, None]      # when the last report went, and from which stage
_lines = [0]             # how long the program is, for reports made by line
_span = [0.0, 1.0]       # the share of its stage a report by line fills


def listen(fn):
    """Have fn(stage, part) told about every drawing from now on; None stops it."""
    global _hear
    _hear = fn
    _last[0], _last[1] = 0.0, None


def expect(lines):
    """The program about to be drawn is this many lines long."""
    _lines[0] = max(0, int(lines))
    _span[0], _span[1] = 0.0, 1.0


def span(lo, hi):
    """Reports by line fill this share of their stage, from lo to hi.

    Laying the program out is most of a drawing, and a chart asked for in a
    shape is laid out several times over -- so each time is given its own
    share, and the lines it has reached count within that share."""
    _span[0], _span[1] = lo, hi


def at_line(stage, line):
    """The drawing has got as far as this line of the program.

    Laying out said nothing at all between its start and its end: a fifth
    of the bar that then sat still for most of the wait.  Where it has got
    to down the program is as good a measure as any, and a stretch it has
    done before is quicker, so it can only ever run a little ahead."""
    if _hear is None or not _lines[0] or not line:
        return
    say(stage, _span[0] + (_span[1] - _span[0]) * min(1.0, line / float(_lines[0])))


def say(stage, part=0.0):
    """The drawing has reached `stage`, `part` of the way through it (0 to 1).

    A new stage is always passed on.  Reports from inside one are passed on
    at most every EVERY seconds: they come from the drawing's busiest loops,
    and a page told about every shape would spend longer hearing than the
    drawing spends drawing."""
    if _hear is None:
        return
    now = time.perf_counter()
    if stage == _last[1] and now - _last[0] < EVERY:
        return
    _last[0], _last[1] = now, stage
    try:
        _hear(stage, min(1.0, max(0.0, float(part))))
    except Exception:            # a listener that has gone away stops no drawing
        pass
