"""How wide words come out, and how tall a line of them is."""

FONT = "Arial, Helvetica, sans-serif"
FONT_SIZE = 11
LINE_H = 13
CHAR_W = FONT_SIZE * 0.55          # only a fallback: see text_w() below

# What the words are set in when nobody has asked for anything else.  The
# studio can ask for them bigger or smaller, in bold, in another typeface,
# or for one step's words to be set apart from the rest -- see set_type()
# below -- and these are what every drawing goes back to first.
BASE_SIZE = FONT_SIZE
BASE_LINE = LINE_H
BOLD = False                        # every step's words in bold
OWN = {}                            # a step's number -> (size, bold) of its own
FACE = None                         # another typeface's widths, or None: Arial
FACE_KEY = None                     # ... and which one, for whatever keeps them

# Arial advance widths in thousandths of an em, for characters 32 to 126.
# Measuring with the real numbers rather than one average width means a box
# comes out exactly as wide as the words in it -- a line of capitals is
# nearly a quarter wider than the average, and used to run over the outline.
_ADV_N = (
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333,
    278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278,
    584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278,
    500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944,
    667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556,
    278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500,
    278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584)
_ADV_B = (
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333,
    278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333,
    584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278,
    556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944,
    667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556,
    333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556,
    333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584)


# Measured once per piece of text, not once per asking.  Laying a chart out
# is not done once: the same program is laid out several ways over, to pick
# the outline that fits best, and inside each of those a line of words is
# measured again for every width it might wrap at.  On a chart of a few
# thousand shapes that came to half a million measurements of a few thousand
# different strings -- the same answers, worked out over and over, adding a
# second to every press of the button.  Keeping them costs a dictionary.
_WIDTHS = {}
_WIDTH_MAX = 200000                 # a long-lived studio should not grow for ever


def text_w(s, size=None, bold=False):
    """How wide s really comes out, in pixels."""
    if size is None:
        size = FONT_SIZE            # in the key: the size can be changed
    key = (s, size, bold, FACE_KEY)  # and so can the face it is measured in
    got = _WIDTHS.get(key)
    if got is not None:
        return got
    if FACE:
        table, other = FACE[1] if bold else FACE[0], FACE[2]
    else:
        table, other = _ADV_B if bold else _ADV_N, 556
    total = 0
    for ch in s:
        i = ord(ch) - 32
        total += table[i] if 0 <= i < len(table) else other
    got = total * size / 1000.0
    if len(_WIDTHS) >= _WIDTH_MAX:
        _WIDTHS.clear()
    _WIDTHS[key] = got
    return got


def line_h(size=None):
    """How far one line of words sits below the one before, at that size."""
    if size is None or size == FONT_SIZE:
        return LINE_H
    return size * LINE_H / float(FONT_SIZE)


def type_of(step):
    """The size a step's words are set at, and whether they are bold."""
    return OWN.get(step) or (FONT_SIZE, BOLD)


def _px(value):
    """A size somebody asked for, if it is one worth drawing at."""
    try:
        px = float(value)
    except (TypeError, ValueError):
        return None
    if not 4 <= px <= 72:           # nought, or nonsense, or a poster
        return None
    return int(px) if px == int(px) else round(px, 2)


def _widths(said):
    """Ninety-five advance widths, if that is what was handed over."""
    if not isinstance(said, (list, tuple)) or len(said) != len(_ADV_N):
        return None
    try:
        out = tuple(float(w) for w in said)
    except (TypeError, ValueError):
        return None
    return out if all(0 <= w <= 3000 for w in out) else None


def set_type(asked=None):
    """What the words of the drawings that follow are set in.

    The studio says so before every drawing, and says all of it: it draws
    over and over in one long-lived process, and a size left where the last
    drawing put it is a size the next one wears without anybody asking.  So
    nothing asked for is everything put back.

        size    how big the words are, in pixels
        bold    every step's words in bold
        widths  another typeface: {"n": [...], "b": [...]}, the advance
                widths of characters 32 to 126 in thousandths of an em,
                plain and bold.  Arial's are written out above; any other
                face's are known only to the browser that will show it, so
                that is where they are measured.
        own     a step's number -> {"size": px, "bold": bool}, for a step
                whose words have been set apart from the rest

    Italic and underlined words are left to the page: neither makes a line
    of words any wider to speak of, so neither moves a box.
    """
    global FONT_SIZE, LINE_H, BOLD, OWN, FACE, FACE_KEY
    asked = asked if isinstance(asked, dict) else {}
    FONT_SIZE = _px(asked.get("size")) or BASE_SIZE
    LINE_H = (BASE_LINE if FONT_SIZE == BASE_SIZE
              else FONT_SIZE * BASE_LINE / float(BASE_SIZE))
    BOLD = bool(asked.get("bold"))
    FACE = FACE_KEY = None
    widths = asked.get("widths")
    if isinstance(widths, dict):
        plain, bold = _widths(widths.get("n")), _widths(widths.get("b"))
        if plain and bold:
            FACE = (plain, bold, plain[ord("n") - 32])
            FACE_KEY = hash(FACE)
    OWN = {}
    own = asked.get("own")
    for step, mine in (own.items() if isinstance(own, dict) else ()):
        try:
            step = int(step)
        except (TypeError, ValueError):
            continue
        if isinstance(mine, dict):
            OWN[step] = (_px(mine.get("size")) or FONT_SIZE,
                         bool(mine.get("bold", BOLD)))
