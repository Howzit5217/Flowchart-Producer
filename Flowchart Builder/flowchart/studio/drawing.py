"""One drawing, from what the studio asked for."""
import re

from .. import settings
from ..make.chart import make_flowchart
from ..make.shake import style_variety
from ..measure import set_type
from ..parse.data import program_json
from ..parse.read import parse_program
from ..shapes import DEFAULT_GEOM, SHAPES
from ..words.lookup import apply_language, word


# ------------------------------------------------------------- the studio --
def file_name(title):
    """A title, made safe to save under."""
    clean = re.sub(r'[\\/:*?"<>|]+', " ", title or "").strip()
    return re.sub(r"\s+", " ", clean) or "flowchart"


def draw_for_studio(ask):
    """One drawing, from what the studio asked for."""
    if ask.get("lang"):
        apply_language(ask["lang"])
    text = ask.get("text") or ""
    if not text.strip():
        raise ValueError(word("no_code"))
    want = str(ask.get("seed") or "").strip()
    # A chart is shaken a little from one drawing to the next -- the gaps,
    # the air in a box, which way True goes out -- so that two runs of one
    # program are two drawings of it rather than one drawing twice.  Asked
    # to hold still, it is drawn from one fixed seed instead, and the same
    # program comes out the same every time it is built.
    if not want and ask.get("steady"):
        want = "20260101"
    seed = style_variety(int(want) if want.isdigit() else None)
    shape = str(ask.get("shape") or "auto").lower()
    settings.SHAPE = "" if shape in ("tall", "off", "none", "") else shape
    # Which two words a decision answers with.  settings.py has carried the
    # note that a class may want "Yes" / "No" for as long as it has carried
    # the words, but only the command line could ever say so; the studio,
    # where the charts that get handed in are made, could not.  The plain
    # pair is a word of the language like any other, so a German chart says
    # Ja and Nein rather than falling back to English.
    # Said either way round rather than only when it is wanted: the studio
    # is one long-lived process drawing for whoever asks, and a pair left
    # behind by the last drawing is a pair the next one wears by accident.
    if str(ask.get("decide") or "").lower() == "yn":
        settings.YES, settings.NO = word("yes_plain"), word("no_plain")
    else:
        settings.YES, settings.NO = word("yes"), word("no")
    # The rest of what the studio may ask for about the drawing itself.
    # Every one is said each time rather than only when it is wanted: the
    # studio draws over and over in one process -- one Pyodide worker, on
    # the website -- and a setting left where the last drawing put it is a
    # setting the next drawing wears without anybody asking for it.
    #
    # After style_variety, not before.  That shakes the gaps and the sizes
    # on every drawing, so roomy spacing applied first would be shaken
    # straight back out again.
    settings.FOR_STYLE = "hexagon" if ask.get("hexfor") else "expand"
    settings.GROUP_OUTPUT = not ask.get("everyout")
    settings.COLUMN_H = float(ask.get("columns") or 0)
    if ask.get("roomy"):                                # the airier spacing
        vars(settings).update(settings.ROOMY)
    # A chain of If / Else If forks sideways until it is wider than this,
    # and queues down the page after that.  Nought queues every one of
    # them, which is what a narrow page wants and what a class reading the
    # chart on a phone wants.  Left alone otherwise: the shaking picks it,
    # and picks it afresh for every drawing.
    if ask.get("chains"):
        settings.CHAIN_LIMIT = 0
    # What the words are set in: how big, whether bold, the widths of the
    # typeface when it is not Arial, and any step whose words were set
    # apart from the rest.  The page decides all of that on its Style side;
    # the drawing has to know it too, because a box is as big as its words.
    set_type(ask.get("letters"))
    settings.LEGEND = bool(ask.get("legend"))
    settings.GRID = bool(ask.get("grid", True))
    settings.GEOM = dict(DEFAULT_GEOM)                  # which shape draws which kind
    for kind, drawn in (ask.get("shapes") or {}).items():
        if kind in settings.GEOM and drawn in SHAPES:
            settings.GEOM[kind] = drawn
    for shape_kind in settings.FILL:                    # tinted, or plain black and white
        settings.FILL[shape_kind] = settings.TINTS[shape_kind] if ask.get("tint") else "#ffffff"
    title = (ask.get("title") or "").strip() or None
    author = (ask.get("author") or "").strip() or None
    # The height to wrap at is handed over rather than left to the default,
    # which is read once when the module is first imported and would hold
    # whatever it held then for the life of the process.
    #
    # Read once, and that one reading both drawn and handed to the runner.
    # It was read twice -- once to draw, once more for the runner -- which
    # on a program of tens of thousands of lines is a quarter of the wait.
    charts = parse_program(text)
    svg = make_flowchart(text, title, author, max_h=settings.COLUMN_H,
                         charts=charts)
    box = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    ast = program_json(charts)
    return {"ok": True, "svg": svg.split("\n", 1)[1], "seed": seed,
            "w": box.group(1) if box else "", "h": box.group(2) if box else "",
            "title": title or "Flowchart", "name": file_name(title),
            "ast": ast, "problems": ast["problems"]}


