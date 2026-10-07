"""The studio page, and the parts it is poured together from."""
import html
import io
import os
import re

from . import settings


# The page is not one file.  Its styling is seven, its script is twenty-odd,
# and they are separate on purpose: a stylesheet an editor can color and
# fold beats one enormous string, and a script cut into parts is a script
# somebody can find their way around.  They are poured into studio.html
# here, where the @@CSS@@ and @@JS@@ marks are, and the page that comes out
# is the page the studio serves.
#
# The page the studio serves and the page --site writes are both this
# one, poured together here, so there is one answer to what the studio
# looks like and everywhere gets it.
HERE = os.path.dirname(os.path.abspath(__file__))

# The stylesheet, in order.
CSS = ["css/01-base.css", "css/02-bar.css", "css/03-layout.css",
       "css/04-panel.css", "css/05-chart.css", "css/06-screens.css",
       "css/07-motion.css", "css/08-icons.css", "css/09-design.css", "css/10-starter.css"]

# The script.  These run inside one function and share everything between
# them, so this order is the order they happen in: a later part may use what
# an earlier one made, never the other way round.
JS = ["js/01-start.js", "js/02-paint.js", "js/02-read.js", "js/02-depth.js", "js/03-shapes.js",
      "js/03-icon-art.js", "js/03-icons.js",
      "js/04-panel.js", "js/05-keep.js", "js/06-chart.js", "js/07-sides.js",
      "js/08-save.js", "js/09-build.js", "js/09-names.js", "js/10-hand.js",
      "js/11-hand-panel.js", "js/11-hand-many.js", "js/11-hand-icons.js", "js/12-check.js", "js/13-hand-keep.js",
      "js/13-hand-more.js", "js/13-hand-rules.js", "js/13-hand-apart.js",
      "js/13-hand-turn.js", "js/13-hand-tidy.js",
      "js/14-run.js", "js/15-sums.js", "js/16-wrong.js", "js/17-tape.js", "js/17-graphs.js",
      "js/18-ahead.js", "js/18-code.js", "js/18-write.js", "js/18-from-code.js",
      "js/19-files.js",
      "js/19-folder.js", "js/19-mermaid.js", "js/19-diagrams.js",
      "js/19-picture.js", "js/19-import.js",
      "js/20-menu.js", "js/20-slide.js", "js/21-typing.js",
      "js/22-settings.js", "js/22-reset.js", "js/23-undo.js", "js/24-scroll.js",
      "js/25-keys.js", "js/26-motion.js", "js/27-mend.js", "js/27-ask.js",
      "js/28-puzzles.js", "js/29-saves.js", "js/30-blocks.js", "js/31-app.js",
      "js/32-code-side.js", "js/33-told.js", "js/34-tests.js", "js/35-wipe.js", "js/36-sync.js",
      "js/37-games.js", "js/37-board.js", "js/38-walk.js", "js/38-advice.js", "js/38-view3d.js", "js/38-models.js", "js/38-view3d-gl.js", "js/38-view3d-more.js",
      "js/39-flows.js", "js/39-circuit.js", "js/39-orbit.js", "js/39-design.js", "js/39-join.js", "js/39-starter.js", "js/39-house.js", "js/39-world.js", "js/39-styles.js", "js/39-types.js", "js/39-inside.js", "js/39-xray.js", "js/40-plants.js", "js/40-roofs.js", "js/40-texture.js", "js/40-units.js", "js/40-utility.js", "js/40-dock.js", "js/40-mix.js", "js/40-solar.js", "js/40-touch.js", "js/40-hood.js", "js/40-edit.js", "js/40-flat3d.js", "js/40-condos.js", "js/40-yard.js", "js/40-designs.js", "js/40-arrange.js", "js/40-land.js", "js/40-tour.js", "js/40-drag.js", "js/40-plan.js", "js/40-web.js", "js/40-things3d.js", "js/40-cars.js", "js/40-doors.js", "js/40-climb.js", "js/40-use3d.js", "js/40-edit3d.js", "js/40-open3d.js", "js/40-grounds.js", "js/40-struct.js", "js/40-attic.js", "js/40-foliage.js", "js/40-systems.js", "js/40-shaped.js", "js/40-towers.js", "js/40-rooms.js", "js/40-smooth.js", "js/40-sized.js", "js/40-oddrooms.js", "js/40-civic.js", "js/40-fronts.js", "js/40-kinds.js", "js/40-outside.js", "js/40-street.js", "js/40-panels.js", "js/40-parking.js", "js/40-storm.js", "js/40-styleart.js", "js/40-blueprint.js", "js/40-stormfx.js", "js/40-holds.js", "js/40-address.js", "js/40-fences.js", "js/40-firesafe.js", "js/40-access.js", "js/40-skyscraper.js", "js/40-build.js", "js/40-movein.js", "js/40-crew.js", "js/40-bodies.js", "js/40-works.js", "js/40-works-mach.js", "js/40-works-jobs.js", "js/40-works-frame.js", "js/40-works-finish.js", "js/40-works-steel.js", "js/40-works-yard.js", "js/40-works-day.js", "js/40-works-site.js", "js/40-works-haul.js", "js/40-samerooms.js", "js/40-layers.js", "js/40-damage.js", "js/40-wildfire.js", "js/40-drill.js", "js/40-mep.js", "js/40-hands.js", "js/40-garage.js", "js/40-gatespool.js", "js/40-items.js", "js/40-towerkit.js", "js/40-stores.js", "js/40-site.js", "js/40-flora.js", "js/40-mall.js", "js/40-verge.js", "js/40-hearth.js", "js/40-stalls.js", "js/40-campus.js", "js/40-exits.js", "js/40-mirrors.js", "js/40-turf.js", "js/40-debugworld.js", "js/40-work.js", "js/40-shapes.js", "js/40-forms.js", "js/40-clean.js", "js/40-facade.js", "js/40-works-late.js", "js/40-works-gate.js", "js/40-works-video.js", "js/40-works-load.js", "js/40-perf.js", "js/40-reopen.js", "js/40-sheetflow.js", "js/99-go.js"]

# Each part of the page carries a header saying what it is and that it is
# one part of something; the page itself wants the part, not the header.
JS_HEAD_END = "// " + "-" * 75 + "\n"
CSS_HEAD_END = "   " + "-" * 75 + " */\n"


def read_ui(name):
    """One of the page's own files, as it is written."""
    with io.open(os.path.join(HERE, "ui", name), encoding="utf-8") as f:
        return f.read()


def without_header(text, ending):
    """A part, with the header that explains it taken off."""
    at = text.rfind(ending)
    return text[at + len(ending):] if at >= 0 else text


def page_html(lean=False):
    """studio.html with its stylesheet and its script poured in.

    Lean, it is poured without the parts' explanations (see lean_js)."""
    html = read_ui("studio.html")
    if lean:
        html = lean_html(html)
    for mark, names, ending, trim in (
            ("@@CSS@@", CSS, CSS_HEAD_END, lean_css),
            ("@@JS@@", JS, JS_HEAD_END, lean_js)):
        if mark not in html:
            raise ValueError("ui/studio.html has lost its %s mark" % mark)
        html = html.replace(mark, "".join(
            (trim if lean else str)(without_header(read_ui(name), ending))
            for name in names), 1)
    return html


# ------------------------------------------------------------ the website --
# The parts are written to be read, and more of their lines explain than do
# anything: that is the right way round for somebody finding their way about
# them, and the wrong way round for a phone opening the website on one bar
# of signal, which had 1.6 MB of page to fetch and read, a good quarter of
# it words for whoever edits the page next.  So the website's page is
# poured without them.  The files keep every word, and so do the
# studio and the page kept beside a chart.
#
# Only what is certainly an explanation goes.  A line of script that starts
# with // is one, unless a string or a /* comment */ runs across lines and
# the line is inside it -- so a part with one of those anywhere in it is
# poured whole.  Either starts on a line of code (an odd ` in it, a \ at
# the end, or a /* not closed on it), which comes before any line inside
# it, so that is where to look: a ` or a /* in a comment is only a word
# about one.  Comments at the end of a line of code stay: telling one from
# a // inside a string or a pattern takes reading the script as a browser
# does.
def lean_js(text):
    """A part of the script without the lines that are only comments."""
    kept = []
    for line in text.split("\n"):
        bare = line.strip()
        if bare.startswith("//"):
            continue
        if (line.count("`") % 2 or bare.endswith("\\") or
                line.rfind("/*") > line.rfind("*/")):
            return text                 # something running across lines
        kept.append(line.rstrip())
    return "\n".join(kept)


def lean_css(text):
    """A stylesheet without its /* ... */ comments."""
    if re.search(r"[\"'][^\"'\n]*/\*", text):   # one inside a string
        return text
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return "\n".join(line.rstrip() for line in text.split("\n")
                     if line.strip()) + "\n"


def lean_html(text):
    """Some of the page's HTML without its <!-- ... --> comments."""
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    return "\n".join(line.rstrip() for line in text.split("\n")
                     if line.strip()) + "\n"


def changed_at():
    """When any of the files the page is poured from was last written."""
    names = ["studio.html", "source-panel.html"] + CSS + JS
    return max(os.path.getmtime(os.path.join(HERE, "ui", name))
               for name in names)


def clashes():
    """Two parts of the page's script naming the same thing.

    The parts run inside one function and share everything between them,
    which is what lets a later part use what an earlier one made.  The cost
    is that two parts using the same name are not two things: the later
    declaration simply replaces the earlier, silently, and whatever used
    the first one stops working.  tests/run.py refuses to pass over it.
    """
    seen, found = {}, []
    for name in JS:
        text = without_header(read_ui(name), JS_HEAD_END)
        # A var inside an if or a for at the top of a part (not inside a
        # function) is the shared function's too: two parts each keeping
        # "the one before" under the same name inside `if (...) {` had the
        # second overwrite the first's, and E in 3D called itself until the
        # stack ran out (2026-10-03).  Each block opened at each depth is
        # remembered as plain or a function's.
        opened = {}
        for line in text.split("\n"):
            bare = line.strip()
            if not bare:
                continue
            depth = len(line) - len(line.lstrip(" "))
            for k in [k for k in opened if k >= depth]:
                del opened[k]
            if bare.endswith("{"):
                opened[depth] = "fn" if re.search(r"\bfunction\b|=>", bare) else "plain"
            shared = depth > 2 and depth % 2 == 0 and all(
                opened.get(k) == "plain" for k in range(2, depth, 2))
            got = re.match(r"^  (?:async\s+)?(function|var|let|const)\s+(.*)$",
                           line)
            if not got and shared:
                got = re.match(r"^\s+(var)\s+(.*)$", line)
            if not got:
                continue
            # (not the words of a comment after it: "{ path, at, phase }")
            rest = re.sub(r"\s//.*$", "", got.group(2))
            if got.group(1) == "function":
                words = re.findall(r"^([A-Za-z_$][\w$]*)", rest)
            else:               # var a, b = 1, c;  -- every name in the line
                words = re.findall(
                    r"(?:^|,)\s*([A-Za-z_$][\w$]*)\s*(?==|,|;|$)", rest)
            for word in words:
                if word in seen and seen[word] != name:
                    found.append((word, seen[word], name))
                else:
                    seen.setdefault(word, name)
    return found
