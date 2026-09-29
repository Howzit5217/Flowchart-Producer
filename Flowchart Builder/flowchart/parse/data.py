"""The same program written out as data, for running it
and for writing it as code."""
import re

from ..parse.keywords import (
    R_DECL, R_END, R_IN, R_NOT_A_WAIT, R_OUT, R_RETURN, R_START, R_WAIT,
    R_WAIT_UNIT)
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
R_SET = re.compile(r"^(?:set\s+|let\s+)?([A-Za-z_]\w*"
                   r"(?:\s*\[(?:[^\[\]]|\[[^\[\]]*\])*\]|\s*\.\s*[A-Za-z_]\w*)*)\s*"
                   r"(?:=|:=|<-)\s*(.+)$", re.I)
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
    r"(?:(?:=|:=|<-)\s*(.+))?$", re.I)
R_DIMS = re.compile(r"\[([^\]]*)\]")
R_CALL_ANY = re.compile(r"^call\s+([A-Za-z_]\w*)", re.I)
# For Each item In list -- and Of, and Every, which say the same
R_EACH = re.compile(r"^for\s+(?:each|every)\s+([A-Za-z_]\w*)\s+(?:in|of)\s+(.+)$", re.I)
R_CALL_NAME = re.compile(r"^call\s+([A-Za-z_]\w*)\s*\((.*)\)\s*$", re.I)
R_BARE_CALL = re.compile(r"^([A-Za-z_]\w*)\s*\((.*)\)$")
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
    m = R_DECL_ONE.match(text)
    if m and R_DECL.match(text):
        out.update(op="declare", const=m.group(1).lower() != "declare",
                   type=(m.group(2) or "").title(), var=m.group(3),
                   expr=(m.group(5) or "").strip())
        if m.group(4):
            out["dims"] = [d.strip() for d in R_DIMS.findall(m.group(4))]
        return out
    if R_OUT.match(text):
        out.update(op="display", parts=text.split(None, 1)[1] if " " in text else "")
        return out
    if R_IN.match(text):
        rest = text.split(None, 1)[1] if " " in text else ""
        out.update(op="input", var=rest.strip().strip(",").strip())
        return out
    m = R_WAIT.match(text)
    if m and not R_NOT_A_WAIT.match(m.group(1).strip()):
        out.update(**how_long(m.group(1)))
        return out
    m = R_CALL_NAME.match(text)
    if m:
        out.update(op="call", name=m.group(1), args=m.group(2))
        return out
    m = R_BARE_CALL.match(text)
    if m:                               # greet(name), without the word Call
        out.update(op="call", name=m.group(1), args=m.group(2))
        return out
    m = R_CALL_ANY.match(text)
    if m:                               # Call names.append(x): a call all the same
        out.update(op="call", name=m.group(1), args="")
        return out
    if R_RETURN.match(text):
        out.update(op="return", expr=R_RETURN_VAL.match(text).group(1).strip())
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
            for no, line in enumerate((item.text or "").split("\n")):
                if line.strip():
                    out.append(statement_json(
                        line.strip(), item.node_id,
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
                "params": mod.params if mod else "",
                "returns": (mod.rtype if mod else ""),
                "body": body})
    return out



