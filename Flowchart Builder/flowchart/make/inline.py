"""Modules drawn where they are called, so a program is one chart.

A program with modules is several charts: the main one, and one for each
module beside it, with a Call in the main chart naming the chart the run
goes off to.  Asked for one chart (settings.ONE_CHART), each module is drawn
again at every place it is called instead -- its own steps, where the call
was -- the way somebody would draw it who had never split the program up.

Only the drawing.  The program the runner walks, and the code written from
it, are read from the charts as they were; so every copy keeps the numbers
of the statements it is a copy of, and carries which call it was copied in
for (Via), for the runner to light the copy it is in rather than all of them.

What a module is handed goes in by name where nothing could tell the
difference -- a value it only reads, a variable handed by reference -- and
is set first, param = argument, where something could.  What a function
hands back goes into whatever it was worked out for: sum = add(a, b) comes
out as sum = x + y, where add returned x + y.  A call inside something
bigger is worked out first, into a name of its own -- the function's -- and
the something reads that.  A Return part way through goes on to the foot of
the copy by a connector, the way an Exit goes on to the foot of its loop.

A module that calls itself, however far round, keeps a chart of its own:
drawn where it is called, it would never stop being drawn."""
import copy
import re

from ..parse import boards
from ..parse.data import R_DECL_ONE, R_SET
from ..parse.keywords import R_CALL, R_DECL, R_EXIT_MOD, R_IN, R_RETURN
from ..parse.nodes import For, If, Loop, Node, Select
from ..parse.read import lettered
from ..parse.statements import ends_flow
from ..words.lookup import word

# How many statements may be copied in, all told.  A function called twice
# from one that is called twice is four copies, and so on down: past this,
# what is left is called the way it always was, from a chart of its own.
ROOM = 20000

R_WORD = re.compile(r"[A-Za-z_]\w*|\d[\w.]*")
# What can stand in for a parameter wherever the module says its name: a
# name, a place in something (p.x, marks[i]), a number, a piece of text.
R_PLAIN = re.compile(r"^(?:[A-Za-z_]\w*(?:\s*\.\s*[A-Za-z_]\w*|\s*\[[^\[\]]*\])*"
                     r"|\d+(?:\.\d+)?|\"[^\"]*\"|'[^']*')$")
R_PLACE = re.compile(r"^[A-Za-z_]\w*(?:\s*\.\s*[A-Za-z_]\w*|\s*\[[^\[\]]*\])*$")
R_REF = re.compile(r"^(ref|reference|byref)$", re.I)
R_GIVES = re.compile(r"^return\b\s*(.*)$", re.I)
R_EACH_VAR = re.compile(r"^for\s+(?:(?:each|every)\s+)?([A-Za-z_]\w*)\s+(?:in|of)\s", re.I)
R_FOR_VAR = re.compile(r"^for\s+([A-Za-z_]\w*)\s*(?:=|:=|<-|←)", re.I)
# The words of the pseudocode itself, which a parameter that happens to be
# spelt like one -- step, to -- must not be swapped for
KEYWORDS = {"and", "or", "not", "mod", "div", "to", "downto", "step", "then",
            "do", "in", "of", "each", "every", "true", "false", "set", "let",
            "call", "return", "display", "print", "output", "input", "declare",
            "constant", "const", "new", "is", "case", "else"}


class Via(int):
    """A statement's number, and the calls a copy of it was drawn for.

    The number is what the drawing writes on the shape and the runner
    lights it by.  `via` is the numbers of the calls the copy stands in,
    outermost first, joined with dots: the runner keeps the same list as it
    goes in and out of modules, and lights the copy whose list it is in.
    An int all the same, so everything that only wants the number has it."""

    def __new__(cls, n, via=""):
        me = int.__new__(cls, n)
        me.via = via
        return me

    def __copy__(self):
        return self

    def __deepcopy__(self, memo):
        return self


def path_of(number):
    """The calls a statement's own call stands inside, and itself."""
    via = getattr(number, "via", "")
    return (via + "." if via else "") + str(int(number))


# ------------------------------------------------------------ the words --
def unquoted(text):
    """(start, end) of each stretch of text outside quotes."""
    spans, start, quote = [], 0, None
    for i, c in enumerate(text):
        if quote:
            if c == quote:
                quote = None
                start = i + 1
        elif c in "\"'":
            spans.append((start, i))
            quote = c
    if quote is None:
        spans.append((start, len(text)))
    return spans


def words_in(text):
    """Each name outside quotes, as (start, end, name).  Not a field after a
    dot -- one.title is not a title of its own -- and not a number."""
    out = []
    for a, b in unquoted(text or ""):
        for m in R_WORD.finditer(text, a, b):
            if m.group()[0].isdigit():
                continue
            j = m.start() - 1
            while j >= a and text[j] == " ":
                j -= 1
            if j >= a and text[j] == ".":
                continue
            out.append((m.start(), m.end(), m.group()))
    return out


def closing(text, at):
    """Where the bracket opened at `at` closes, or -1."""
    deep, quote = 0, None
    for i in range(at, len(text)):
        c = text[i]
        if quote:
            if c == quote:
                quote = None
        elif c in "\"'":
            quote = c
        elif c in "([{":
            deep += 1
        elif c in ")]}":
            deep -= 1
            if deep == 0:
                return i
    return -1


def calls_in(text, wanted):
    """Each call in text to a name in `wanted`, left to right, as (start,
    end, name, what it is handed).  A call inside another's brackets is the
    other's to find: f(g(1)) is the one call to f."""
    found, after = [], 0
    for start, end, name in words_in(text):
        if start < after or name.lower() not in wanted:
            continue
        j = end
        while j < len(text) and text[j] == " ":
            j += 1
        if j >= len(text) or text[j] != "(":
            continue
        shut = closing(text, j)
        if shut < 0:
            continue
        found.append((start, shut + 1, name, text[j + 1:shut]))
        after = shut + 1
    return found


def swapped(text, swap):
    """The same words with names swapped for others, every one at once, so
    that a name swapped in is never swapped again."""
    if not swap or not text:
        return text
    out, last = [], 0
    for start, end, name in words_in(text):
        low = name.lower()
        if low in swap and low not in KEYWORDS:
            out += [text[last:start], swap[low]]
            last = end
    if not out:
        return text
    out.append(text[last:])
    return "".join(out)


def parameters(params):
    """A module's parameters: each one's name, whether it is handed back
    (Ref), and what it is when nothing is handed for it."""
    out = []
    for one in boards.split_top(boards.plain_params(params or "")):
        text, dflt = one.strip(), ""
        eq = re.match(r"^([^=]*[^=<>!])=(?!=)(.*)$", text)
        if eq:
            text, dflt = eq.group(1).strip(), eq.group(2).strip()
        bits = text.split()
        if bits:
            out.append({"name": bits[-1], "dflt": dflt,
                        "ref": any(R_REF.match(b) for b in bits)})
    return out


# ------------------------------------------------------------- the tree --
def walk(items):
    """Every statement in a run of them, and in everything inside those."""
    for item in items:
        yield item
        for key in ("head", "then", "orelse", "body"):
            inner = getattr(item, key, None)
            if inner:
                for one in walk(inner):
                    yield one
        for branch in getattr(item, "branches", None) or []:
            for one in walk(branch[1]):
                yield one


def texts_of(item):
    """The words an item is drawn with."""
    if isinstance(item, Node):
        return [item.text]
    if isinstance(item, If):
        return [item.cond]
    if isinstance(item, Loop):
        return [item.cond]
    if isinstance(item, For):
        return [item.raw]
    if isinstance(item, Select):
        return [item.expr] + [b[0] for b in item.branches]
    return []


def retext(item, change):
    """Every piece of words an item is drawn or written with, through change."""
    if isinstance(item, Node):
        item.text = change(item.text)
    elif isinstance(item, (If, Loop)):
        item.cond, item.text = change(item.cond), change(item.text)
    elif isinstance(item, For):
        item.raw, item.text = change(item.raw), change(item.text)
        item.init, item.cond, item.step = (change(t) if t else t
                                           for t in (item.init, item.cond, item.step))
    elif isinstance(item, Select):
        item.expr, item.text = change(item.expr), change(item.text)
        for branch in item.branches:
            branch[0] = change(branch[0])


def names_in(items):
    """Every name a run of statements says, lower case."""
    out = set()
    for item in walk(items):
        for text in texts_of(item):
            out.update(name.lower() for _, _, name in words_in(text or ""))
    return out


def written(items, spelt):
    """The names a run of statements gives a value to -- sets, reads in,
    counts with -- and the ones it declares, lower case; `spelt` learns how
    each was written."""
    sets, declared = set(), set()

    def note(name, into):
        if name:
            spelt.setdefault(name.lower(), name)
            into.add(name.lower())

    for item in walk(items):
        if isinstance(item, Node):
            for line in (item.text or "").split("\n"):
                line = line.strip()
                said = boards.as_declare(line) or line
                m = R_DECL_ONE.match(said)
                if m and R_DECL.match(said):
                    note(m.group(3), declared)
                    continue
                m = R_SET.match(line)
                if m:
                    note(re.match(r"[A-Za-z_]\w*", m.group(1)).group(), sets)
                    continue
                if R_IN.match(line):
                    m = re.match(r"^\w+\s+([A-Za-z_]\w*)", line)
                    note(m.group(1) if m else "", sets)
        elif isinstance(item, For):
            m = R_FOR_VAR.match(item.raw or "") or R_SET.match(item.init or "")
            if m:
                note(re.match(r"[A-Za-z_]\w*", m.group(1)).group(), sets)
        elif isinstance(item, Loop) and item.hex:
            m = R_EACH_VAR.match(item.cond or "")
            if m:
                note(m.group(1), sets)
    return sets, declared


def fresh(name, taken):
    """name2, name3 ... whichever is free first."""
    n = 2
    while ("%s%d" % (name, n)).lower() in taken:
        n += 1
    return "%s%d" % (name, n)


def piece(node, run, at):
    """Some of the lines of a shared box, in a box of their own."""
    part = copy.copy(node)
    part.text = "\n".join(run)
    part.lines = list(at) if node.lines else []
    part.line = at[0]
    return part


def returned(items, put, tail, exits):
    """A module's Returns turned into what is done with what they hand back:
    `put` makes the step that keeps it (None: nothing keeps it).  One at the
    very end of the module is followed by whatever came after the call
    anyway; one part way through goes on there by a connector, which joins
    `exits` and is lettered with the landing at the foot."""
    out = []
    for i, item in enumerate(items):
        last = tail and i == len(items) - 1
        if isinstance(item, Node) and item.terminal \
                and not getattr(item, "connector", False) \
                and (R_RETURN.match(item.text) or R_EXIT_MOD.match(item.text)
                     or item.text == word("ret")):
            m = R_GIVES.match(item.text)
            value = m.group(1).strip() if m else ""
            if value and put is not None:
                box = Node("rect", put(value))
                box.node_id, box.line = item.node_id, item.line
                out.append(box)
            if not last:
                jump = Node("circle", "", terminal=True)
                jump.connector = True
                jump.said = item.text
                jump.node_id, jump.line = item.node_id, item.line
                exits.append(jump)
                out.append(jump)
            continue
        if isinstance(item, If):
            item.then = returned(item.then, put, last, exits)
            item.orelse = returned(item.orelse, put, last, exits)
        elif isinstance(item, Select):
            for branch in item.branches:
                branch[1] = returned(branch[1], put, last, exits)
        elif isinstance(item, (Loop, For)):
            item.body = returned(item.body, put, False, exits)
        out.append(item)
    return out


# ------------------------------------------------------------ the copies --
class Together:
    """What it takes to draw the modules of one program where they are
    called: each one's steps, which can be, and what is left to copy."""

    def __init__(self, charts):
        self.mods = {}
        for chart in charts:
            if not chart.is_main and chart.module is not None:
                items = chart.items
                if items and isinstance(items[0], Node) and items[0].shape == "oval" \
                        and not items[0].terminal:
                    items = items[1:]           # its signature, over its door
                self.mods[chart.module.name.lower()] = (chart.module, items)
        every = set(self.mods)
        self.calls = {name: self.called(items, every)
                      for name, (_, items) in self.mods.items()}
        self.can = every - self.round_again()
        # set the way the program sets things: AQA's arrow, or an equals
        said = [t for c in charts for item in walk(c.items) for t in texts_of(item)]
        self.op = " ← " if any("←" in (t or "") for t in said) else " = "
        # What the program outside every module sets: a module that sets one
        # of those without declaring it is setting that, not one of its own.
        self.shared = set()
        for chart in charts:
            if chart.is_main:
                top = [i for i in chart.items if getattr(i, "scope", "") == "global"]
                sets, declared = written(top, {})
                self.shared = sets | declared
        self.room = ROOM

    @staticmethod
    def called(items, wanted):
        """The modules a run of statements calls."""
        out = set()
        for item in walk(items):
            for text in texts_of(item):
                out.update(c[2].lower() for c in calls_in(text or "", wanted))
                for line in (text or "").split("\n"):
                    m = re.match(r"^call\s+([A-Za-z_]\w*)\s*$", line.strip(), re.I)
                    if m and m.group(1).lower() in wanted:
                        out.add(m.group(1).lower())
        return out

    def round_again(self):
        """The modules that call themselves, however far round."""
        out = set()
        for start, first in self.calls.items():
            seen, todo = set(), list(first)
            while todo:
                name = todo.pop()
                if name == start:
                    out.add(start)
                    break
                if name in seen or name not in self.calls:
                    continue
                seen.add(name)
                todo.extend(self.calls[name])
        return out

    # ---- a run of statements, with its calls drawn out
    def items(self, items, taken):
        out = []
        for item in items:
            out += self.item(item, taken)
        return out

    def item(self, item, taken):
        if isinstance(item, Node):
            return self.node(item, taken)
        pre = []
        if isinstance(item, If):
            pre, cond, _ = self.worked(item.cond, item, taken)
            if pre:
                item.text = (item.text or "").replace(item.cond, cond)
                item.cond = cond
                item.chained = False            # an Else If with steps in front
            item.then = self.items(item.then, taken)
            item.orelse = self.items(item.orelse, taken)
        elif isinstance(item, Select):
            pre, expr, _ = self.worked(item.expr, item, taken)
            if pre:
                item.text = (item.text or "").replace(item.expr, expr)
                item.expr = expr
            for branch in item.branches:
                branch[1] = self.items(branch[1], taken)
        elif isinstance(item, For):
            # worked out once, before it starts: the end it counts to
            pre, raw, swaps = self.worked(item.raw, item, taken)
            if pre:
                item.raw = raw

                def put_in(text):
                    for was, now in swaps:
                        text = text.replace(was, now)
                    return text
                item.text = put_in(item.text or "")
                item.init, item.cond, item.step = (put_in(t) if t else t
                                                   for t in (item.init, item.cond, item.step))
            item.body = self.items(item.body, taken)
        elif isinstance(item, Loop):
            pre, cond, _ = self.worked(item.cond, item, taken)
            if pre:
                item.text = (item.text or "").replace(item.cond, cond)
                item.cond = cond
            item.body = self.items(item.body, taken)
            # A test is worked out every time it is made.  Tested at the
            # foot, that is just before it; tested first, it is the loop's
            # head, over the test, where the way back comes in (loops.py).
            # A For Each works out what it goes through once, before it.
            if pre and not item.hex:
                if item.style == "post":
                    if not ends_flow(item.body):
                        item.body = item.body + pre
                elif not ends_flow(pre):
                    item.head = pre
                else:
                    return pre + [item]
                pre = []
        return pre + [item]

    def node(self, node, taken):
        """A box, which may be several statements, split where one of them
        has a call drawn out in front of it."""
        lines = (node.text or "").split("\n")
        at = node.lines if len(node.lines) == len(lines) else [node.line] * len(lines)
        out, run, run_at, changed = [], [], [], False
        for line, line_at in zip(lines, at):
            pre, left = self.statement(line, node, taken)
            if pre is None:
                run.append(line)
                run_at.append(line_at)
                continue
            changed = True
            if run:
                out.append(piece(node, run, run_at))
            out += pre
            run, run_at = ([left], [line_at]) if left else ([], [])
        if not changed:
            return [node]
        if run:
            out.append(piece(node, run, run_at))
        return out

    def statement(self, line, owner, taken):
        """One statement: the steps drawn out in front of it, and what is
        left of it -- None where nothing is, (None, None) where it had no
        call to draw out."""
        said = line.strip()
        # a call and nothing else: Call greet(name), greet(name), Call menu
        alone = said[len(R_CALL.match(said).group()):].strip() if R_CALL.match(said) else said
        found = calls_in(alone, self.can)
        whole = len(found) == 1 and found[0][0] == 0 and found[0][1] == len(alone)
        bare = R_CALL.match(said) and alone.lower() in self.can
        if whole or bare:
            name, given = (found[0][2], found[0][3]) if whole else (alone, "")
            if self.fits(name):
                more, given, _ = self.worked(given, owner, taken)
                return more + self.drawn(name, given, owner, taken, None), None
        # a name set to what a function hands back, and nothing else
        m = R_SET.match(said)
        if m and not R_DECL.match(said):
            expr = said[m.start(2):]
            found = calls_in(expr, self.can)
            if len(found) == 1 and found[0][0] == 0 and found[0][1] == len(expr.rstrip()) \
                    and self.fits(found[0][2]):
                head = said[:m.start(2)]
                more, given, _ = self.worked(found[0][3], owner, taken)
                return more + self.drawn(found[0][2], given, owner, taken,
                                         lambda v: head + v), None
        pre, left, _ = self.worked(said, owner, taken)
        if not pre:
            return None, None
        return pre, left

    def worked(self, text, owner, taken):
        """Every call in some words worked out ahead of them: the steps that
        do it, the words with each answer's name where its call was, and
        which call became which name."""
        text = text or ""
        pre, swaps, out, last, seen = [], [], [], 0, {}
        for start, end, name, given in calls_in(text, self.can):
            if not self.fits(name):
                continue
            more, given, _ = self.worked(given, owner, taken)
            n = seen[name.lower()] = seen.get(name.lower(), 0) + 1
            keep = name if n == 1 else "%s%d" % (name, n)
            pre += more + self.drawn(name, given, owner, taken,
                                     lambda v, keep=keep: keep + self.op + v)
            out += [text[last:start], keep]
            last = end
            swaps.append((text[start:end], keep))
        if not out:
            return [], text, []
        out.append(text[last:])
        return pre, "".join(out), swaps

    def fits(self, name):
        """Whether there is room left to copy this module in once more."""
        _, items = self.mods[name.lower()]
        return sum(1 for _ in walk(items)) <= self.room

    def drawn(self, name, given, owner, taken, put):
        """One module, drawn where `owner` calls it, handed `given`."""
        mod, items = self.mods[name.lower()]
        body = copy.deepcopy(items)
        self.room -= sum(1 for _ in walk(body))
        # what it is handed is the caller's too, an answer worked out just
        # before it included (dayName(weekday(...)) is handed weekday)
        taken = taken | set(w.lower() for _, _, w in words_in(given))
        spelt = {}
        sets, declared = written(body, spelt)
        args = [a.strip() for a in boards.split_top(given)] if given.strip() else []
        swap, first, own = {}, [], set(declared)
        for i, p in enumerate(parameters(mod.params)):
            low = p["name"].lower()
            spelt[low] = p["name"]
            handed = args[i] if i < len(args) else p["dflt"]
            if not handed:
                own.add(low)
            elif handed.lower() == low:
                continue                        # handed the name it goes by
            elif (p["ref"] and R_PLACE.match(handed)) or \
                    (low not in sets and R_PLAIN.match(handed)):
                swap[low] = handed
            else:
                own.add(low)
                first.append((low, handed))
        own |= sets - self.shared
        own -= set(swap)
        # Its own names, where the chart it goes into already uses them,
        # are names of their own there too.
        busy = taken | names_in(body)
        for low in sorted(own & taken):
            swap[low] = fresh(spelt.get(low, low), busy)
            busy.add(swap[low].lower())
        for item in walk(body):
            retext(item, lambda t: swapped(t, swap))
        way = path_of(owner.node_id)
        for item in walk(body):
            item.node_id = Via(item.node_id, way)
        exits = []
        body = returned(body, put, True, exits)
        if exits:
            # numbered as the first Return that comes here, so it lights
            # with it; with no number, the drawing would number it by its
            # place among the shapes, and that is some other statement's
            land = Node("circle", "")
            land.connector = True
            land.exits = exits
            land.node_id, land.line = exits[0].node_id, exits[0].line
            body.append(land)
        out = []
        if first:
            box = Node("rect", "\n".join(swap.get(low, spelt[low]) + self.op + handed
                                         for low, handed in first))
            box.node_id, box.line = owner.node_id, owner.line
            box.lines = [owner.line] * len(first)
            out.append(box)
        return out + self.items(body, taken | names_in(body))


def one_chart(charts):
    """The charts of a program with every module that can be drawn where it
    is called drawn there, and the charts left over that still have to be
    -- the main one, any that call themselves, any nothing calls, and any
    the room ran out for.  A copy: the charts handed in are left as they
    are, for the runner and the code."""
    if len(charts) < 2:
        return charts
    together = Together(charts)
    if not together.can:
        return charts
    charts = copy.deepcopy(charts)
    every = set(together.mods)
    called = set()
    for chart in charts:
        called |= together.called(chart.items, every)

    def name(chart):
        return chart.module.name.lower() if chart.module is not None else ""

    # The main chart, and the modules that are no copy of anything.
    todo = [c for c in charts if c.is_main or name(c) not in together.can
            or name(c) not in called]
    done = []
    while todo:
        chart = todo.pop(0)
        chart.items = together.items(chart.items, names_in(chart.items))
        lettered(chart.items)
        done.append(chart)
        # what still calls a module the old way -- the room ran out -- needs
        # that module's chart beside it after all
        still = together.called(chart.items, every)
        todo += [c for c in charts if name(c) in still and c not in done and c not in todo]
    return [c for c in charts if c in done]
