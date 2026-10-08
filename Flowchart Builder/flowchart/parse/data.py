"""The same program written out as data, for running it
and for writing it as code."""
import re

from ..parse.keywords import (
    R_DECL, R_END, R_EXIT, R_EXIT_MOD, R_IN, R_NOT_A_WAIT, R_OUT, R_RETURN, R_START, R_WAIT,
    R_WAIT_UNIT)
from ..parse import boards
from ..parse.trouble import PROBLEMS
from ..words.lookup import word


# ------------------------------------------------------------ what it means --
# The chart says what the program looks like.  This says what it *does*: the
# same parse, written out as plain data, one entry per statement, so a page
# can walk it -- run it, ask for the inputs it asks for, print what it
# prints, and turn it into Python or Java.  Nothing here draws anything.
# What a Set puts its value into: a name, or a place inside what a name
# holds -- scores[i], grid[y][x], p.x, rows[k].cells[j] -- with a bracket
# allowed inside a bracket once, as in marks[order[i]].
def _brackets(deep):
    """What can stand between [ and ]: brackets in it too, so far down."""
    inside = r"[^\[\]]*"
    for _ in range(deep):
        inside = r"(?:[^\[\]]|\[" + inside + r"\])*"
    return inside


R_SET = re.compile(r"^(?:set\s+|let\s+)?([A-Za-z_]\w*"
                   r"(?:\s*\[" + _brackets(5) + r"\]|\s*\.\s*[A-Za-z_]\w*)*)\s*"
                   r"(?:=|:=|<-|←)\s*(.+)$", re.I)
# Currency and Money are types of their own, not spellings of Real: a
# program that says a number is money is telling the runner and the code
# writer to show it as money -- two places after the point, always -- and
# nothing else gets dressed up that way.  Decimal is here so it parses, but
# it means a plain number: a decimal average is not a price.
#
# The type can also be the name of a kind of record -- Declare Point p --
# and a name can be a list, sized or not: Declare Boolean seen[rows][cols],
# Declare Integer scores[] = [90, 85].  The sizes are group 4, as written.
R_DECL_ONE = re.compile(
    r"^(constant|const|declare)\s+(?:(integer|real|string|char|boolean|bool|"
    r"float|double|int|number|currency|money|decimal|var|let|[A-Za-z_]\w*)\s+"
    r"(?=[A-Za-z_]))?"
    r"([A-Za-z_]\w*)((?:\s*\[[^\]]*\])*)\s*"
    r"(?:(?:=|:=|<-|←)\s*(.+))?$", re.I)
R_DIMS = re.compile(r"\[([^\]]*)\]")
R_CALL_ANY = re.compile(r"^call\s+([A-Za-z_]\w*)", re.I)
# For Each item In list -- and Of, and Every, which say the same
R_EACH = re.compile(r"^for\s+(?:(?:each|every)\s+)?([A-Za-z_]\w*)\s+(?:in|of)\s+(.+)$", re.I)
R_CALL_NAME = re.compile(r"^call\s+([A-Za-z_]\w*)\s*\((.*)\)\s*$", re.I)
R_BARE_CALL = re.compile(r"^([A-Za-z_]\w*)\s*\((.*)\)$")
R_METHOD_CALL = re.compile(r"^([A-Za-z_]\w*(?:\s*\[[^\]]*\]|\.[A-Za-z_]\w*)*)\.([A-Za-z_]\w*)\s*\((.*)\)$")
R_RETURN_VAL = re.compile(r"^return\b\s*(.*)$", re.I)


def statement_json(text, node_id, line, shape="", scope=""):
    """One statement, as data: what it does and what it does it to."""
    out = {"id": node_id, "line": line, "text": text}
    if scope:
        out["scope"] = scope            # "global": outside every module
    # An oval is a way in or a way out, not something to be done.  The one
    # the reading puts at the head of a module carries that module's
    # signature -- average(a, b) -- which reads exactly like a call, and is
    # neither: it is the module's own name over its own door.
    if shape == "oval" and not R_END.match(text) and not R_RETURN.match(text):
        out.update(op="start")
        return out
    # The boards' own ways of saying it (boards.py): Cambridge's DECLARE
    # Total : INTEGER and OCR's array names[5] are read as the Declare they
    # are, and asking with USERINPUT or input(...) is an Input.
    said = boards.as_declare(text) or text
    m = boards.R_ASKED.match(text)
    if m:
        out.update(op="input", var=m.group(1).strip())
        if m.group(2):
            out["as"] = boards.ASKED_AS.get(m.group(2).lower(), "")
        if (m.group(3) or "").strip():
            out["prompt"] = m.group(3).strip()
        return out
    m = R_DECL_ONE.match(said)
    if m and R_DECL.match(said):
        out.update(op="declare", const=m.group(1).lower() != "declare",
                   type=(m.group(2) or "").title(), var=m.group(3),
                   expr=(m.group(5) or "").strip())
        if m.group(4):
            out["dims"] = [d.strip() for d in R_DIMS.findall(m.group(4))]
            # Declare Integer days[12] = 31, 28, 31, ...: what the array
            # starts out holding, written the textbook's way, is a list
            values = boards.split_top(out["expr"]) if out["expr"][:1] not in "[{" else []
            if len(values) > 1:
                out["expr"] = "[" + ", ".join(v.strip() for v in values) + "]"
                if len(out["dims"]) > 1:
                    out["flat"] = True      # shaped into rows in program_json
        return out
    if R_OUT.match(text):
        out.update(op="display", parts=said_out(text))
        return out
    if R_IN.match(text):
        rest = text.split(None, 1)[1] if " " in text else ""
        out.update(op="input", var=rest.strip().strip(",").strip())
        return out
    m = R_WAIT.match(text)
    if m and not R_NOT_A_WAIT.match(m.group(1).strip()):
        out.update(**how_long(m.group(1)))
        return out
    # Out of the loop it is in (Exit While, Break), and out of the module
    # (Exit Function, which is a Return with nothing handed back).
    if R_EXIT.match(text):
        out.update(op="exit")
        return out
    if R_EXIT_MOD.match(text):
        out.update(op="return", expr="")
        return out
    # Return (lo, hi) hands back a pair; it is not a call of anything
    # called Return, which is what the bare call below would take it for.
    if R_RETURN.match(text):
        out.update(op="return", expr=R_RETURN_VAL.match(text).group(1).strip())
        return out
    m = R_CALL_NAME.match(text)
    if m:
        out.update(op="call", name=m.group(1), args=m.group(2))
        return out
    m = R_BARE_CALL.match(text)
    if m:                               # greet(name), without the word Call
        out.update(op="call", name=m.group(1), args=m.group(2))
        return out
    m = R_METHOD_CALL.match(text)
    if m:                               # scores.append(s): append(scores, s)
        given = m.group(3).strip()
        out.update(op="call", name=m.group(2), args=m.group(1).strip() + (", " + given if given else ""))
        return out
    m = R_CALL_ANY.match(text)
    if m:                               # Call names.append(x): a call all the same
        out.update(op="call", name=m.group(1), args="")
        return out
    if R_END.match(text) or text.strip() in (word("end"), word("ret")):
        out.update(op="end")
        return out
    if R_START.match(text) or text.strip() == word("start"):
        out.update(op="start")
        return out
    m = R_SET.match(text)
    if m:
        out.update(op="set", var=m.group(1).strip(), expr=m.group(2).strip())
        return out
    out.update(op="other")
    return out


def said_out(text):
    """What a Display line shows: everything after its first word.

    print(total), the way OCR and Python write it, has no space after the
    word -- and read by the space alone it showed nothing at all.  Brackets
    round the whole of what is shown are only the call's own."""
    rest = R_OUT.sub("", text, count=1).strip()
    if rest.startswith("(") and rest.endswith(")") and not text[len(text) - len(rest) - 1:][:1].isspace():
        deep = 0
        for i, c in enumerate(rest):
            deep += (c == "(") - (c == ")")
            if deep == 0 and i < len(rest) - 1:
                return rest             # "(a) + (b)": not one pair
        return rest[1:-1].strip()       # the call's own brackets, one pair
    return rest


def unbracket(text):
    """"(2 seconds)" -> "2 seconds", where the brackets wrap the whole of it."""
    while len(text) > 1 and text[0] == "(" and text[-1] == ")":
        deep = 0
        for i, c in enumerate(text):
            deep += (c == "(") - (c == ")")
            if deep == 0 and i < len(text) - 1:
                return text             # "(a) + (b)": they are not one pair
        text = text[1:-1].strip()
    return text


def how_long(rest):
    """The time in "Wait 2 seconds" -- how much, and of what.

    The how much is an expression and nothing narrower, so "Wait random(1, 3)
    seconds" is as good a wait as "Wait 2 seconds": what the program decides
    as it goes is what the run waits.  Milliseconds are kept as milliseconds
    rather than turned into a fraction of a second here, because the code
    written from this reads better in whichever unit was typed.
    """
    rest = re.sub(r"^for\s+", "", rest.strip(), flags=re.I)
    rest = unbracket(rest)              # Wait(2 seconds) says the same thing
    unit = "s"
    m = R_WAIT_UNIT.match(rest)
    if m and m.group(1).strip():
        rest = m.group(1).strip()
        unit = "ms" if m.group(2).lower().startswith(("ms", "mil")) else "s"
    return {"op": "wait", "expr": rest, "unit": unit}


def items_json(items):
    """A run of statements, and whatever they contain."""
    out = []
    for item in items:
        kind = getattr(item, "kind", "")
        if kind == "node":
            # A grouped box holds several statements and they were typed on
            # several lines, so each is given its own rather than all of
            # them the line the run started on.  Pointing at the first of
            # five Displays when it was the fourth that failed is a worse
            # answer than it looks: it is a wrong one, confidently given.
            at = list(getattr(item, "lines", None) or [])
            # (an Exit is drawn as its letter, and says what it does)
            for no, line in enumerate((getattr(item, "said", None) or item.text or "").split("\n")):
                # Declare a, b: a statement a name (boards.split_declare)
                for one in (boards.split_declare(line.strip()) if line.strip() else []):
                    out.append(statement_json(
                        one, item.node_id,
                        at[no] if no < len(at) else item.line, item.shape,
                        getattr(item, 'scope', '')))
        elif kind == "if":
            # The line as it was written travels with it.  What fails is the
            # test -- "score >= bar" -- and showing only that, when the line
            # says "Else If score >= bar Then", is showing somebody a piece
            # of their own program they have to go and find.
            out.append({"op": "if", "id": item.node_id, "line": item.line,
                        "text": item.text, "cond": item.cond,
                        "chained": bool(item.chained),
                        "then": items_json(item.then),
                        "else": items_json(item.orelse)})
        elif (kind == "loop" and getattr(item, "hex", False) and
              R_EACH.match((item.text or item.cond or "").strip())):
            # For Each: a loop the runner goes round once for every item
            m = R_EACH.match((item.text or item.cond or "").strip())
            out.append({"op": "foreach", "id": item.node_id, "line": item.line,
                        "text": item.text or item.cond, "var": m.group(1),
                        "over": m.group(2).strip(),
                        "body": items_json(item.body)})
        elif kind == "loop":
            out.append({"op": "dowhile" if item.style == "post" else "while",
                        "id": item.node_id, "line": item.line,
                        "text": item.text, "cond": item.cond,
                        "until": bool(item.until),
                        "body": items_json(item.body)})
        elif kind == "for":
            out.append({"op": "for", "id": item.node_id, "line": item.line,
                        "text": item.raw,
                        "init": item.init or "", "cond": item.cond or "",
                        "step": item.step or "", "raw": item.raw,
                        "body": items_json(item.body)})
        elif kind == "select":
            cases = []
            for label, inside in item.branches:
                cases.append({"match": label, "body": items_json(inside)})
            out.append({"op": "select", "id": item.node_id, "line": item.line,
                        "text": item.text, "expr": item.expr, "cases": cases})
    return out


def every_statement(steps):
    """Each statement in a run of them, and in everything inside them."""
    for st in steps:
        yield st
        for key in ("then", "else", "body"):
            for inner in every_statement(st.get(key) or []):
                yield inner
        for one in st.get("cases") or []:
            for inner in every_statement(one.get("body") or []):
                yield inner


def shaped(prog):
    """Declare Integer grid[2][3] = 1, 2, 3, 4, 5, 6: the values in rows of
    three, the way they fill the table -- [[1, 2, 3], [4, 5, 6]].  The size
    of a row can be a Constant the program sets to a plain number."""
    flat = []
    known = {}
    for steps in [prog["main"]] + [m["body"] for m in prog["modules"]]:
        for st in every_statement(steps):
            if st.get("op") == "declare" and st.get("flat"):
                flat.append(st)
            elif st.get("op") == "declare" and re.match(r"^\d+$", st.get("expr") or ""):
                known[st["var"].lower()] = int(st["expr"])
    for st in flat:
        st.pop("flat")
        sizes = []
        for d in st["dims"][1:]:
            d = d.strip()
            sizes.append(int(d) if d.isdigit() else known.get(d.lower()))
        if not sizes or None in sizes or not all(sizes):
            continue
        values = [v.strip() for v in boards.split_top(st["expr"][1:-1])]
        if len(values) % _product(sizes) == 0:
            st["expr"] = _said(_rows(values, sizes))


def _product(sizes):
    out = 1
    for n in sizes:
        out *= n
    return out


def _rows(items, sizes):
    """A flat run of values cut into rows as long as the sizes say."""
    if not sizes:
        return items
    step = _product(sizes)
    return [_rows(items[i:i + step], sizes[1:]) for i in range(0, len(items), step)]


def _said(v):
    return "[" + ", ".join(_said(x) for x in v) + "]" if isinstance(v, list) else v


def program_json(charts):
    """The whole program as data: the main flow, and every module in it."""
    # Asked for here rather than at the top: story.py reads its patterns out
    # of this module, so the two cannot both import the other first.
    from ..parse.story import TOLD
    out = {"main": [], "modules": [], "problems": list(PROBLEMS),
           # a story, as the pseudocode it was retold as (parse/story.py)
           "retold": TOLD[0]}
    for chart in charts:
        body = items_json(chart.items)
        if chart.is_main:
            out["main"] = body
        else:
            mod = chart.module
            out["modules"].append({
                "name": mod.name if mod else chart.heading,
                "params": boards.plain_params(mod.params) if mod else "",
                "returns": (mod.rtype if mod else ""),
                "body": body})
    own = set(m["name"].lower() for m in out["modules"])
    shaped(out)
    out["main"] = plained(out["main"], own)
    for mod in out["modules"]:
        mod["body"] = plained(mod["body"], own)
    if boards.RECORDS:                  # TYPE ... ENDTYPE: what each record holds
        out["records"] = dict(boards.RECORDS)
    if boards.BOARD[0]:
        out["board"] = boards.BOARD[0]
    return out


# ------------------------------------------------- the boards' words, plain --
# What only needs to be looked at twice: a board's function, sign or way of
# picking out an item.  Everything else goes through untouched and unread.
R_WORTH = re.compile(r"[≠≤≥×÷−&]|"
                     r"\b(?:len|left|right|mid|substring|position|ucase|lcase|to_upper|"
                     r"to_lower|string_to_int|string_to_real|str_to_num|float|int_to_string|"
                     r"real_to_string|num_to_str|str|char_to_code|asc|code_to_char|"
                     r"random_int|randint|randombetween|rand|div|mod|is_num|"
                     r"stringtointeger|stringtoreal|integertostring|realtostring|tointeger|toreal|"
                     r"isreal|isletter|iswhitespace)\s*\(|"
                     r"\.(?:length|upper|lower|left|right|substring)\b|\w\s*\[[^\]]*,", re.I)
R_ARROW_SET = re.compile(r"^(?:set\s+)?(.+?)\s*←\s*(.+)$", re.I)


def plained(steps, own):
    """A run of statements with every expression in the runner's words
    (boards.plain), and an OCR input("Name?") asking in its own words
    first.  The words each line was written in stay as they were."""
    def p(e):
        if not isinstance(e, str) or not e or not (boards.RECORDS or R_WORTH.search(e)):
            return e
        return boards.plain(e, own)

    def arrow(e):                       # a For's i <- 1, said the runner's way
        m = R_ARROW_SET.match(e or "")
        return "Set %s = %s" % (m.group(1), p(m.group(2))) if m else p(e)

    out = []
    for st in steps:
        op = st.get("op")
        if op in ("set", "input"):
            st["var"] = p(st.get("var"))
        if op in ("set", "declare", "wait", "return"):
            st["expr"] = p(st.get("expr"))
        if op == "declare" and st.get("dims"):
            st["dims"] = [p(d) for d in st["dims"]]
        if op == "display":
            st["parts"] = p(st.get("parts"))
        if op == "call":
            st["args"] = p(st.get("args"))
            st["text"] = p(st.get("text"))
        if op in ("if", "while", "dowhile"):
            st["cond"] = p(st.get("cond"))
        if op == "foreach":
            st["over"] = p(st.get("over"))
        if op == "for":
            st["init"], st["step"] = arrow(st.get("init")), arrow(st.get("step"))
            st["cond"] = p(st.get("cond"))
        if op == "select":
            st["expr"] = p(st.get("expr"))
            for one in st.get("cases", []):
                one["match"] = p(one.get("match"))
                pieces = choice_pieces(one["match"])
                if pieces:
                    one["any"] = pieces
        for key in ("then", "else", "body"):
            if st.get(key):
                st[key] = plained(st[key], own)
        for one in st.get("cases", []) or []:
            one["body"] = plained(one.get("body", []), own)
        if op == "input" and st.get("prompt"):
            # OCR's input("Name?") says Name? and then waits, the way the
            # Python it is modelled on does
            out.append({"op": "display", "id": st["id"], "line": st["line"],
                        "text": st["text"], "parts": p(st.pop("prompt"))})
        st.pop("prompt", None)
        out.append(st)
    return out


R_OTHERWISE = re.compile(r"^(default|case else|else)$", re.I)


def choice_pieces(label):
    """A Case that answers to more than one value -- 2, 3 -- or to a run of
    them -- 1 TO 5, Cambridge's way; 'A' To 'Z' -- as the pieces a run or a
    translation tests one at a time: {"is": value} or {"from", "to"}.
    None for a Case of one plain value, which is tested the way it always was."""
    label = (label or "").strip()
    if not label or R_OTHERWISE.match(label):
        return None
    parts = boards.split_top(label)
    ranged = [re.split(r"\s+to\s+", one.strip(), flags=re.I) for one in parts]
    if len(parts) == 1 and len(ranged[0]) == 1:
        return None
    out = []
    for ends in ranged:
        if len(ends) == 2:
            out.append({"from": ends[0].strip(), "to": ends[1].strip()})
        else:
            out.append({"is": ends[0].strip()})
    return out



