"""A program told in plain words, retold as pseudocode.

Not everybody starts from pseudocode.  Plenty of people start from what the
program has to do, said the way they would say it to a person: "Ask the
user for their age.  If they are 18 or older, tell them they can vote,
otherwise tell them to wait."  That is a flowchart already -- a question, a
decision, two answers -- and this reads it as one.

It reads English, the way a first programming course is set: asking and
telling, setting and adding, deciding, counting from one number to another,
keeping on until something happens.  What it cannot make out it does not
guess at.  The sentence goes into the chart as a step in its own words, so
the chart is still the whole story, and running it says which step it
could not do.

Whatever in the text is already pseudocode is left exactly as it is, so a
program that is mostly pseudocode with the odd sentence in it -- "Display
the total", "add one to the count" -- comes out the same program with
those lines put right.

Nothing written is ever replaced.  The box keeps the story; what it was
retold as goes beside it (TOLD, which the studio shows), and every
statement read from it points back at the line of the story it came from,
so running the chart lights the sentence that is running.
"""
import re

from ..parse.clean import said_long, split_indent, tidy
from ..parse.keywords import (
    R_CALL, R_CASE, R_DECL, R_DO, R_ELSE, R_ELSEIF, R_END, R_ENDANY,
    R_ENDIF, R_ENDLOOP, R_ENDMOD, R_ENDSEL, R_EXIT, R_EXIT_MOD, R_FOR, R_FOR_C, R_FOR_TO, R_IF,
    R_IN, R_LOOPCOND, R_MODULE, R_OUT, R_REPEAT, R_RETURN, R_SELECT,
    R_START, R_THEN, R_UNTIL, R_WAIT, R_WAIT_UNIT, R_WHILE)
from ..parse.data import R_SET
from ..parse.teller import TURNS, Teller, base, sentences


# What the last text read came to as pseudocode, when it was a story; empty
# when it was pseudocode already.  Read by program_json, the way PROBLEMS is.
TOLD = [""]


# ========================================================= is it a story? ==
# A line of pseudocode starts with one of its words and follows it with
# something the runner can read: a name, a sum, a question with an answer.
# A line of story does not -- "Display the total" starts well enough and
# then has two names side by side with nothing between them.  One such
# line is enough: then the whole text is read as a story, and the lines
# that were pseudocode already come through it untouched.
R_TOKEN = re.compile(r'\s*(?:"[^"]*"|\'[^\']*\'|\d+(?:\.\d+)?|[A-Za-z_][\w.]*|'
                     r'\.[A-Za-z_][\w.]*|'
                     r'<=|>=|<>|!=|==|&&|\|\||[-+*/^%&=<>(),\[\]{}:])')
WORD_OPS = {"and", "or", "mod", "div", "in"}
BIN_OPS = {"+", "-", "*", "/", "^", "%", "&", "=", "==", "!=", "<>", "<", ">",
           "<=", ">=", "&&", "||"}
TYPES = r"(?:integer|int|real|float|double|string|str|char|boolean|bool|number|" \
        r"currency|money|decimal)"
# The type can be the name of a kind of record, Declare Point corner, so
# a first word is a type whenever another name follows it.
R_DECL_LINE = re.compile(r"^(?:declare|constant|const)\s+(?:" + TYPES +
                         r"\s+|[A-Za-z_]\w*\s+(?=[A-Za-z_]))?(.+)$", re.I)
# A name, or a place in what a name holds: scores[i], grid[y][x], p.x.
PLACE = r'[A-Za-z_]\w*(?:\[[^\]]*\]|\.[A-Za-z_]\w*)*'
R_NAME_LIST = re.compile(r'^(?:"[^"]*"\s*,\s*)?' + PLACE +
                         r'(?:\s*,\s*' + PLACE + r')*$')
R_SIGNATURE = re.compile(r"^(?:[\w\[\]]+\s+)?\w+\s*(?:\(.*\))?"
                         r"(?:\s*(?:as|returns?|->|:)\s*[\w\[\]]+)?$", re.I)
R_BARE_CALL = re.compile(r"^[A-Za-z_]\w*(?:\s*\[[^\]]*\])*(?:\.[A-Za-z_]\w*)*\s*\(.*\)$")


def sum_reads(text):
    """Is this a sum the runner can read -- operands with operators between?"""
    text = re.sub(r"\bnot\s+in\b", "in", text.strip(), flags=re.I)     # x not in xs
    if not text:
        return False
    at, toks = 0, []
    while at < len(text):
        m = R_TOKEN.match(text, at)
        if not m or m.end() == at:
            return False
        toks.append(m.group(0).strip())
        at = m.end()
    want, prev, deep = True, "", 0         # want: an operand comes next
    for tok in toks:
        low = tok.lower()
        # `in` is a test between two things, and a name where a thing is
        # wanted: Display class, in, str
        is_name = (bool(re.match(r"[A-Za-z_]", tok)) and low != "not" and
                   (low not in WORD_OPS or (low == "in" and want)))
        operand = is_name or tok[0] in "\"'" or tok[0].isdigit()
        if want:
            if tok in ("(", "[", "{") or tok in ("-", "+") or low == "not":
                deep += tok in ("(", "[", "{")
            elif tok in (")", "]", "}") and prev in ("(", "[", "{", ","):
                deep -= 1                   # (), and (5,) or [1, 2,]: closed after a comma
                want = False
            elif low == "new" and prev.lower() != "new":
                pass                        # New Point: the kind comes next
            elif operand:
                want = False
            else:
                return False
        else:
            if tok in BIN_OPS or low in WORD_OPS or tok == "," or (tok == ":" and deep):
                want = True
            elif tok in (")", "]", "}"):
                deep -= 1
            elif tok[0] == "." and len(tok) > 1:
                pass                        # rows[k].cells: a part of it
            elif tok in ("(", "[") and (prev[:1].isalpha() or prev[:1] == "_" or
                                        prev[:1] == "." or prev in (")", "]") or
                                        (tok == "[" and prev[:1] in "\"'")):   # "abc"[1]
                deep += 1
                want = True
            else:
                return False               # two things side by side: words, not a sum
        prev = tok
    # A bracket too many or too few, or a sign with nothing after it, is a
    # sum written wrong -- (x + 2)) -- not words: words fail above, two of
    # them side by side.  Read as one, the line is pseudocode, and the run
    # says what is wrong with it and puts it right (15-sums.js); read as a
    # story, it was retold as something else altogether, and the whole of
    # the program with it.
    return not want or prev in BIN_OPS


def reads_as_pseudocode(line):
    """One cleaned line: pseudocode (or nothing at all), or words?"""
    s = said_long(tidy(line))
    if not s:
        return True
    low = s.lower()
    if (R_ENDIF.match(s) or R_ENDLOOP.match(s) or R_ENDSEL.match(s) or
            R_ENDMOD.match(s) or R_ELSE.match(s) or R_REPEAT.match(s) or
            R_START.match(s) or R_END.match(s) or R_ENDANY.match(s) or
            R_EXIT.match(s) or R_EXIT_MOD.match(s) or
            low in ("do", "default", "case else", "otherwise")):
        return True
    m = R_ELSEIF.match(s)
    if m:
        return sum_reads(re.sub(r"\s+then$", "", m.group(2), flags=re.I))
    m = R_IF.match(s)
    if m:
        halves = R_THEN.split(m.group(1), 1)
        return sum_reads(halves[0]) and (len(halves) == 1 or not halves[1].strip() or
                                          reads_as_pseudocode(halves[1]))
    m = R_LOOPCOND.match(s)
    if m:
        return sum_reads(m.group(2))
    m = R_WHILE.match(s)
    if m:
        return sum_reads(re.sub(r"\s+do$", "", m.group(1), flags=re.I))
    m = R_UNTIL.match(s)
    if m:
        return sum_reads(m.group(1))
    m = R_DO.match(s)
    if m:
        return sum_reads(m.group(3))
    m = R_SELECT.match(s)
    if m:
        return sum_reads(m.group(2))
    m = R_CASE.match(s)
    if m:
        # Case 2, 3 and Case 90 To 100: each value on its own, and the two
        # ends of a run, are sums (choice_pieces, data.py)
        return not m.group(2) or all(
            sum_reads(end) for one in split_top(m.group(2))
            for end in re.split(r"\s+to\s+", one.strip(), flags=re.I))
    m = R_FOR.match(s)
    if m:
        rest = m.group(1)
        to = R_FOR_TO.match(rest)
        if to:
            return all(sum_reads(bit) for bit in (to.group(2), to.group(4), to.group(5) or "1"))
        if R_FOR_C.match(rest):
            return True
        each = re.match(r"^(?:each|every)\s+[A-Za-z_]\w*\s+in\s+(.+)$", rest, re.I)
        return bool(each) and sum_reads(each.group(1))
    m = R_MODULE.match(s)
    if m:
        return bool(R_SIGNATURE.match(m.group(2).strip().rstrip(":")))
    if R_DECL.match(s):
        m = R_DECL_LINE.match(s)
        if not m:
            return False
        parts = split_top(m.group(1))
        name, _, value = parts[0].partition("=")
        # Declare Integer days[12] = 31, 28, 31: an array, and the values
        # it starts out holding, the textbook's way
        if len(parts) > 1 and value.strip() and re.match(r"^[A-Za-z_]\w*(?:\s*\[[^\]]*\])+$", name.strip()) \
                and not any("=" in re.sub(r'"[^"]*"|\'[^\']*\'', "", one) for one in parts[1:]):
            return all(sum_reads(one) for one in [value] + parts[1:])
        for one in parts:
            name, _, value = one.partition("=")
            if not re.match(r"^[A-Za-z_]\w*(?:\s*\[[^\]]*\])*$", name.strip()):
                return False
            if value and not sum_reads(value):
                return False
        return True
    m = R_WAIT.match(s)
    if m:
        rest = m.group(1).strip()
        unit = R_WAIT_UNIT.match(rest)
        return sum_reads(unit.group(1) if unit and unit.group(1).strip() else rest)
    if R_RETURN.match(s):
        rest = s[len("return"):].strip()
        return not rest or sum_reads(rest)
    if R_CALL.match(s):
        return (bool(re.match(r"^call\s+[A-Za-z_][\w.]*\s*(?:\(.*\))?$", s, re.I)) and
                sum_reads(s[4:]))
    if R_OUT.match(s):
        rest = s.split(None, 1)[1] if " " in s else ""
        return not rest or sum_reads(rest)
    if R_IN.match(s):
        rest = s.split(None, 1)[1] if " " in s else ""
        return bool(R_NAME_LIST.match(rest.strip()))
    m = R_SET.match(s)
    if m and re.split(r"\W", s, 1)[0].lower() not in ("if", "while", "until", "for"):
        return sum_reads(m.group(2))
    if R_BARE_CALL.match(s):
        return sum_reads(s)
    return False


def split_top(text, sep=","):
    """Split at every sep that is not inside brackets or quotes."""
    out, bit, deep, quote = [], "", 0, None
    for c in text:
        if quote:
            bit += c
            if c == quote:
                quote = None
            continue
        if c in "\"'":
            quote = c
        elif c in "([{":
            deep += 1
        elif c in ")]}":
            deep -= 1
        elif c == sep and deep == 0:
            out.append(bit)
            bit = ""
            continue
        bit += c
    out.append(bit)
    return out


def is_story(text):
    """Does any line of this read as words rather than pseudocode?

    Not a program written the way an exam board writes it (boards.py) --
    total <- total + 1, DECLARE Total : INTEGER -- which is pseudocode
    however few of its lines this page's own pseudocode would say."""
    from ..parse.boards import which_board
    if which_board(text):
        return False
    for raw in text.splitlines():
        _, s = split_indent(raw)
        if s and not reads_as_pseudocode(clean_bullet(s)):
            return True
    return False


# ============================================================ retelling ==
# A story longer than this is not a story: it is a long program, and the
# reading of it should not pay to have every one of its lines looked at
# twice.  Nobody tells a program in two thousand sentences.
MOST_LINES = 2000

TYPE_WORD = {"int": "Integer", "real": "Real", "text": "String", "bool": "Boolean"}


def retell(lines):
    """The lines join_lines made of a text, retold when they are a story.

    -> (lines, text): the pseudocode as lines for the reading -- each still
    carrying the number of the line of story it came from -- and the same
    pseudocode written out.  None when the text was pseudocode already."""
    if len(lines) > MOST_LINES:
        return None
    if not any(t and not reads_as_pseudocode(clean_bullet(t)) for _, t, _ in lines):
        return None
    teller = Teller()
    # The blocks the text closes for itself -- an End If somewhere means an
    # "If ..." written in words opens a block rather than being one.
    said = [tidy(t).lower() for _, t, _ in lines if t]
    teller.closers = set(kind for kind, test in (
        ("if", lambda s: R_ENDIF.match(s)),
        ("while", lambda s: re.match(r"^(?:end[ -]?while|wend)$", s)),
        ("for", lambda s: re.match(r"^(?:end[ -]?for|next(?:\s+\S+)?)$", s)),
        ("do", lambda s: s in ("do", "repeat"))) if any(test(s) for s in said))
    entries = []
    for indent, t, line in lines:
        t = clean_bullet(t) if t else t
        # a sentence that ran on to the next line, as a paragraph does --
        # not a list of steps, one to a line, each starting with its verb
        first_word = t.split(None, 1)[0] if t else ""
        if (entries and t and entries[-1][1] and t[:1].islower() and entries[-1][0] == indent
                and not base(first_word) and first_word.lower() not in TURNS
                and not reads_as_pseudocode(t) and not reads_as_pseudocode(entries[-1][1])
                and not re.search(r"[.!?:;]$", entries[-1][1])):
            entries[-1][1] += " " + t
            continue
        entries.append([indent, t, line])
    steps = read_block(teller, entries, 0, len(entries))
    rows = []
    render(steps, 0, rows)
    started = any(R_START.match(tidy(t)) or R_MODULE.match(tidy(t))
                  for _, t, _ in rows if t)
    # A total added to before anything was put in it starts at nought --
    # which is what "add it to the total" takes for granted.
    declares = ["Declare %s %s%s" % (TYPE_WORD[teller.kinds[name]], name,
                                     " = " + teller.starts[name] if name in teller.starts else "")
                for name in teller.order
                if teller.kinds.get(name) in TYPE_WORD and name not in teller.declared
                and name not in teller.counters]
    # What the retelling adds for itself -- Start, the Declares, Stop -- was
    # said by no sentence, so it points at none (line 0).
    if not started:
        top = [(0, "Start", 0)] + [(0, d, 0) for d in declares]
        ends = rows and R_END.match(tidy(rows[-1][1])) and rows[-1][0] == 0
        rows = top + rows + ([] if ends else [(0, "Stop", 0)])
    elif declares:
        at = next((k for k, row in enumerate(rows) if R_START.match(tidy(row[1]))), None)
        if at is not None:
            rows[at + 1:at + 1] = [(rows[at][0], d, 0) for d in declares]
    told = "\n".join(" " * indent + t for indent, t, _ in rows) + "\n"
    return rows, told


def read_block(teller, entries, lo, hi):
    """entries[lo:hi], read: a line of pseudocode as it is, a line of story
    sentence by sentence, and a line with lines indented under it as what
    those lines are the body of."""
    out = []
    was_mark = teller.mark
    teller.mark = 0
    floor = None
    i = lo
    while i < hi:
        indent, t, line = entries[i]
        if not t:
            teller.mark = len(out)          # a blank line starts a new paragraph
            i += 1
            continue
        if floor is None:
            floor = indent
        j = i + 1
        while j < hi and (not entries[j][1] or entries[j][0] > indent):
            j += 1
        while j > i + 1 and not entries[j - 1][1]:
            j -= 1
        if reads_as_pseudocode(t):
            teller.raw(tidy(t) if tidy(t) else t, line, out, max(0, indent - floor))
            i += 1                          # what is under it is read in its turn
            continue
        if teller.opener(t, line, out, max(0, indent - floor)):
            i += 1                          # and so is what is under this
            continue
        if j > i + 1:
            body = read_block(teller, entries, i + 1, j)
            teller.header(t, line, out, body)
            i = j
            continue
        for one in sentences(t):
            teller.sentence(one, line, out)
        i += 1
    teller.mark = was_mark
    return out


def render(steps, depth, rows):
    """Steps, written out as pseudocode: (indent, text, line of story)."""
    pad = depth * 4
    for st in steps:
        k = st.kind
        if k == "raw":
            rows.append((pad + st.extra, st.text, st.line))
        elif k == "text":
            rows.append((pad, st.text, st.line))
        elif k == "nest":
            render(st.body, depth + 1 + st.extra // 4, rows)
        elif k == "display":
            rows.append((pad, "Display " + ", ".join(st.parts), st.line))
        elif k == "input":
            rows.append((pad, "Input " + st.name, st.line))
        elif k == "set":
            rows.append((pad, "Set %s = %s" % (st.name, st.value), st.line))
        elif k == "call":
            rows.append((pad, "Call %s()" % st.name, st.line))
        elif k == "stop":
            rows.append((pad, "Stop", st.line))
        elif k == "wait":
            rows.append((pad, "Wait %s %s" % (st.value, st.unit), st.line))
        elif k == "if":
            rows.append((pad, "If %s Then" % st.cond, st.line))
            render(st.then, depth + 1, rows)
            other = st.orelse
            while len(other) == 1 and other[0].kind == "if" and other[0].chained:
                rows.append((pad, "Else If %s Then" % other[0].cond, other[0].line))
                render(other[0].then, depth + 1, rows)
                other = other[0].orelse
            if other:
                rows.append((pad, "Else", st.line))
                render(other, depth + 1, rows)
            rows.append((pad, "End If", st.line))
        elif k == "while":
            rows.append((pad, "While %s" % st.cond, st.line))
            render(st.body, depth + 1, rows)
            rows.append((pad, "End While", st.line))
        elif k == "do":
            rows.append((pad, "Do", st.line))
            render(st.body, depth + 1, rows)
            rows.append((pad, ("Until %s" if st.until else "Loop While %s") % st.cond, st.line))
        elif k == "for":
            rows.append((pad, "For %s = %s To %s%s" % (st.name, st.start, st.stop,
                                                      " Step %s" % st.step if st.step else ""), st.line))
            render(st.body, depth + 1, rows)
            rows.append((pad, "End For", st.line))
        elif k == "each":
            rows.append((pad, "For Each %s In %s" % (st.name, st.over), st.line))
            render(st.body, depth + 1, rows)
            rows.append((pad, "End For", st.line))


def clean_bullet(s):
    """A line of a list: the dash, star or bullet in front of it goes.

    (Numbered lists need nothing: split_indent takes "3." off already.)"""
    return re.sub(r"^(?:[-*•‣◦]|\(?[a-z]\))\s+", "", s)
