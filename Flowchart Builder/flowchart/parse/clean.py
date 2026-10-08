"""Tidying a line up, and gluing the continued ones together."""
import re


# ------------------------------------------------------------- line clean-up --
def strip_comment(s):
    """Drop // ... , # ... and /* ... */ comments (but not inside quotes)."""
    out, quote, i, n = [], None, 0, len(s)
    while i < n:
        c = s[i]
        if quote:
            out.append(c)
            if c == quote:
                quote = None
        elif c in "\"'":
            quote = c
            out.append(c)
        elif c == "#" or s.startswith("//", i):
            break
        elif s.startswith("/*", i):
            j = s.find("*/", i + 2)
            if j < 0:
                break
            i = j + 2
            continue
        else:
            out.append(c)
        i += 1
    return "".join(out)


def split_indent(raw):
    """Return (indent, text), comments stripped.

    A line starting with # is a comment, the way AQA's pseudocode and
    Python write one.  It used to be read as a marker of how deep the line
    was, the # taken off and the words after it kept -- so "# work out the
    total" came out as a step called "work out the total"."""
    for smart, plain in (("\u201c", '"'), ("\u201d", '"'), ("\u201e", '"'),
                         ("\u2018", "'"), ("\u2019", "'"), ("\u00a0", " ")):
        raw = raw.replace(smart, plain)             # Word's curly quotes, etc.
    s = raw.expandtabs(4).rstrip()
    body = s.lstrip()
    indent = len(s) - len(body)
    body = re.sub(r"^\d{1,3}[.):]\s+", "", body)   # "12. Display ..." line numbers
    return indent, strip_comment(body).strip()


def clean(line):
    """Comment markers and whitespace removed (used by the interactive prompt)."""
    return split_indent(line)[1]


CONT_END = re.compile(r"(,|\+|-|\*|/|=|&|\(|\bor|\band|\|\||&&)$", re.I)
STRUCT_START = re.compile(
    r"^(if|else|elseif|elif|end|endif|endwhile|endfor|endselect|while|do|for|"
    r"select|switch|case|default|module|function|sub|procedure|def|loop|next|"
    r"until|repeat|return|call|display|print|input|declare|constant|set)\b", re.I)


def needs_more(s):
    """True when a statement obviously continues on the next line."""
    depth, quote = 0, None
    for c in s:
        if quote:
            if c == quote:
                quote = None
        elif c in "\"'":
            quote = c
        elif c in "([{":
            depth += 1
        elif c in ")]}":
            depth -= 1
    # Words left open in double quotes go on to the next line.  A double
    # quote inside single ones -- 'No copies of "' + title -- is only a
    # letter; one after an apostrophe (the user's "name) is still open.
    if quote == '"' or (quote == "'" and s.count('"') % 2 == 1):
        return True
    return depth > 0 or bool(CONT_END.search(s.rstrip()))


# total += price, Set count -= 1, i++: the short ways of saying it, said the
# long way -- Set total = total + price -- which is what the runner, the
# chart and every language written out from it read.  A sum on the right is
# kept whole: x *= a + b is x = x * (a + b).
R_COMPOUND = re.compile(r"^(set\s+|let\s+)?([A-Za-z_]\w*(?:\s*\[[^\[\]]*\]|\s*\.\s*[A-Za-z_]\w*)*)"
                        r"\s*([-+*/])=(?!=)\s*(.+)$", re.I)
R_BUMP = re.compile(r"^(?:(\+\+|--)\s*([A-Za-z_]\w*(?:\s*\[[^\[\]]*\])*)|"
                    r"([A-Za-z_]\w*(?:\s*\[[^\[\]]*\])*)\s*(\+\+|--))\s*;?$")


def said_long(text):
    """A compound assignment or a ++ written out as the Set it means; any
    other line as it is."""
    m = R_COMPOUND.match(text)
    if m:
        place, op, rest = m.group(2).strip(), m.group(3), m.group(4).strip().rstrip(";").strip()
        simple = re.match(r"^(?:\w+|\"[^\"]*\"|\d+(?:\.\d+)?)$", rest)
        return "%s%s = %s %s %s" % ("Set " if m.group(1) else "",
                                    place, place, op, rest if simple else "(%s)" % rest)
    m = R_BUMP.match(text)
    if m:
        place = (m.group(2) or m.group(3)).strip()
        sign = (m.group(1) or m.group(4))[0]
        return "%s = %s %s 1" % (place, place, sign)
    return text


def join_lines(raw_lines):
    """Clean every line and glue continuation lines together.

    -> [(indent, text, the line number it started on)].  The number is
    carried so a statement can be pointed back at what was typed."""
    out, buf, buf_indent, joined, buf_line = [], "", 0, 0, 1
    for no, raw in enumerate(raw_lines, 1):
        indent, text = split_indent(raw)
        if not text:                                   # blank: never continue past it
            if buf:
                out.append((buf_indent, buf, buf_line))
                buf = ""
            out.append((indent, "", no))               # kept: a blank line is
            continue                                   #   where a run of
                                                       #   Displays ends
        if buf and (STRUCT_START.match(text) or joined >= 8):
            out.append((buf_indent, buf, buf_line))    # safety: a new statement
            buf = ""
        if buf:
            buf = buf + " " + text
            joined += 1
        else:
            buf, buf_indent, joined, buf_line = text, indent, 0, no
        if needs_more(buf):
            continue
        out.append((buf_indent, buf, buf_line))
        buf = ""
    if buf:
        out.append((buf_indent, buf, buf_line))
    return [(indent, said_long(text) if text else text, no) for indent, text, no in out]


def tidy(s):
    """Single spaces (outside quotes), no trailing punctuation.  Keeps capitals."""
    out, quote, space = [], None, False
    for c in s.strip():
        if quote:
            out.append(c)
            if c == quote:
                quote = None
        elif c in "\"'":
            quote = c
            out.append(c)
            space = False
        elif c.isspace():
            if not space:
                out.append(" ")
            space = True
        else:
            out.append(c)
            space = False
    return "".join(out).rstrip(":;.").strip()


def unwrap(cond):
    """Drop one pair of parentheses that wraps the whole condition."""
    c = cond.strip()
    if c.startswith("(") and c.endswith(")"):
        depth = 0
        for i, ch in enumerate(c):
            depth += (ch == "(") - (ch == ")")
            if depth == 0 and i < len(c) - 1:
                return c
        return c[1:-1].strip()
    return c


