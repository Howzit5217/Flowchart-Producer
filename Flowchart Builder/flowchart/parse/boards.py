"""The exam boards' pseudocode -- AQA, OCR and Cambridge -- read as written.

A class is taught the pseudocode its exam board sets, and marked on it.
AQA writes total <- total + 1 with an arrow, asks with USERINPUT and says
LEN(name); OCR writes print(total) and name = input("Name?") and
name.substring(0, 3); Cambridge declares DECLARE Total : INTEGER, says
MID(Name, 1, 3) and chooses with CASE OF ... OTHERWISE ... ENDCASE.  All
three are pseudocode in every way that matters, and none of them read here
until now: the arrow alone sent a whole program off to be read as a story.

The statements are read where every statement is read (read.py, data.py),
which know the boards' spellings as well as their own.  What is here is
the rest: which board a program is written for, where that changes what a
word means -- SUBSTRING takes the string last and counts to an end it
includes, for AQA; OCR's .substring takes a start and a length -- and the
expressions, rewritten into the words the runner and every translation
already know (plain).  The chart still shows each line the way it was
typed: only what the program does is read from the rewriting.
"""
import re

# The board the program being read is written for: "aqa", "ocr", "cie"
# (Cambridge), or "" for anything else.  Set by read.py for each reading,
# read by data.py, the way PROBLEMS is.
BOARD = [""]

# A record's fields, by the name of the record -- Cambridge's TYPE ...
# ENDTYPE, AQA's RECORD ... ENDRECORD -- in the order they were written, so
# Car("Ford", 1.8) knows which is which.  Filled in by read.py.
RECORDS = {}

ARROW = "←"                        # the arrow AQA and Cambridge assign with

# What gives each board away.  Only the words that the other two -- and the
# pseudocode this page has always read -- would never write.
TELLS = {
    "aqa": re.compile(r"\bUSERINPUT\b|\bENDSUBROUTINE\b|^\s*SUBROUTINE\b|\bENDRECORD\b|"
                      r"\bRANDOM_INT\s*\(|\bSTRING_TO_INT\s*\(|\bSTRING_TO_REAL\s*\(|"
                      r"\bINT_TO_STRING\s*\(|\bREAL_TO_STRING\s*\(|\bCHAR_TO_CODE\s*\(|"
                      r"\bCODE_TO_CHAR\s*\(|\bPOSITION\s*\(|\bLEN\s*\(", re.M),
    # (p.length and s.substring are left out: a program read in from
    # JavaScript says both, and is no more OCR's than it is anybody's)
    "ocr": re.compile(r"^\s*print\s*\(|\binput\s*\(|^\s*endswitch\b|^\s*endprocedure\b|"
                      r"^\s*endfunction\b|^\s*next\s+[a-z_]\w*\s*$|"
                      r"^\s*array\s+\w|^\s*global\s+\w|\bopenRead\s*\(|\bopenWrite\s*\(", re.M),
    "cie": re.compile(r"^\s*DECLARE\s+\w+\s*:|^\s*CASE\s+OF\b|^\s*OTHERWISE\b|^\s*ENDCASE\b|"
                      r"^\s*ENDPROCEDURE\b|^\s*ENDFUNCTION\b|\bRETURNS\b|^\s*ENDTYPE\b|"
                      r"\bBYREF\b|\bBYVAL\b|\bMID\s*\(|\bNUM_TO_STR\s*\(|\bSTR_TO_NUM\s*\(|"
                      r"\bLCASE\s*\(|\bUCASE\s*\(|\bOPENFILE\b|\bREADFILE\b|\bWRITEFILE\b|"
                      r"^\s*NEXT\s+\w+\s*$", re.M),
}


def which_board(text):
    """The board a program is written for, by what in it gives one away."""
    counts = {board: len(tell.findall(text)) for board, tell in TELLS.items()}
    # An arrow is AQA's or Cambridge's; a DECLARE with a colon is only ever
    # Cambridge's, and OCR never writes the arrow at all.
    if ARROW in text:
        counts["ocr"] = 0
    best = max(counts, key=lambda b: counts[b])
    if not counts[best]:
        return "aqa" if ARROW in text else ""
    return best


# ---------------------------------------------------------------- symbols --
# Written the way an exam paper prints them, typed the way a keyboard does.
SYMBOLS = {"≠": "<>", "≤": "<=", "≥": ">=", "×": "*", "÷": "/",
           "−": "-"}


def _outside_quotes(s, fn):
    """fn applied to every stretch of s that is not inside quotes."""
    out, bit, quote = [], "", None
    for c in s:
        if quote:
            bit += c
            if c == quote:
                out.append(bit)
                bit, quote = "", None
            continue
        if c in "\"'":
            out.append(fn(bit))
            bit, quote = c, c
            continue
        bit += c
    out.append(fn(bit) if not quote else bit)
    return "".join(out)


def _symbols(bit):
    for sign, plain_sign in SYMBOLS.items():
        bit = bit.replace(sign, plain_sign)
    # Cambridge joins words with & -- the one & on its own, not &&
    return re.sub(r"(?<!&)&(?!&)", "+", bit)


# ------------------------------------------------------------ expressions --
R_TOK = re.compile(r'\s*("(?:[^"\\]|\\.)*"?|\'(?:[^\'\\]|\\.)*\'?|\d+(?:\.\d+)?|'
                   r'[A-Za-z_]\w*|<=|>=|<>|!=|==|:=|&&|\|\||\S)')


def _tokens(s):
    out, at = [], 0
    while at < len(s):
        m = R_TOK.match(s, at)
        if not m:
            break
        out.append((m.group(0)[:len(m.group(0)) - len(m.group(1))], m.group(1)))
        at = m.end()
    return out


def _simple(text):
    """A name or a number: safe in any sum without brackets round it."""
    return bool(re.match(r"^\s*(?:[A-Za-z_]\w*|\d+(?:\.\d+)?)\s*$", text))


def _par(text):
    text = text.strip()
    return text if _simple(text) else "(" + text + ")"


class _Reader:
    """The tokens of one expression, walked once, written back out with the
    boards' own words turned into the ones this page knows."""

    def __init__(self, toks, own):
        self.toks, self.at, self.own = toks, 0, own

    def peek(self):
        return self.toks[self.at][1] if self.at < len(self.toks) else None

    def take(self):
        tok = self.toks[self.at]
        self.at += 1
        return tok

    def seq(self, stops=()):
        """Everything up to one of `stops` at this depth, written out."""
        out = ""
        while self.at < len(self.toks) and self.peek() not in stops:
            ws, tok = self.toks[self.at]
            if tok in ("(", "[", "{") or re.match(r"[A-Za-z_\d\"']", tok):
                out += ws + self.chain()
            else:
                self.take()
                out += ws + tok
        return out

    def args(self, close):
        """What is between a bracket just taken and its `close`, split at the
        commas: the pieces, each written out."""
        parts = []
        if self.peek() == close:
            self.take()
            return parts
        while True:
            parts.append(self.seq((",", close)).strip())
            if self.peek() == ",":
                self.take()
                continue
            if self.peek() == close:
                self.take()
            return parts

    def chain(self):
        """One value and whatever follows on from it: calls, items, parts."""
        ws, tok = self.take()
        if tok == "(":
            inner = self.seq((")",))
            if self.peek() == ")":
                self.take()
            v = "(" + inner + ")"
        elif tok == "[":
            v = "[" + ", ".join(self.args("]")) + "]"
        elif tok == "{":
            inner = self.seq(("}",))
            if self.peek() == "}":
                self.take()
            v = "{" + inner + "}"
        elif re.match(r"[A-Za-z_]", tok) and self.peek() == "(":
            self.take()
            v = call(tok, self.args(")"), self.own)
        else:
            v = tok
        while self.peek() in ("[", "."):
            if self.peek() == "[":
                self.take()
                # Grid[r, c] is Grid[r][c]: a list of lists, said the short way
                v += "".join("[" + a + "]" for a in self.args("]"))
                continue
            self.take()
            name = self.take()[1] if self.at < len(self.toks) else ""
            if self.peek() == "(":
                self.take()
                v = method(v, name, self.args(")"), self.own)
            else:
                v = method(v, name, None, self.own)
        return v


def call(name, args, own=()):
    """name(args) in the words the runner knows."""
    low = name.lower()
    if low in own:                      # the program's own function: its own
        return "%s(%s)" % (name, ", ".join(args))
    n = len(args)
    a = args + [""] * 3
    if low == "len" and n == 1:
        return "length(%s)" % a[0]
    if low == "left" and n == 2:
        return "substring(%s, 0, %s)" % (a[0], a[1])
    if low == "right" and n == 2:
        return "substring(%s, length(%s) - %s)" % (a[0], a[0], _par(a[1]))
    if low == "mid" and n in (2, 3):
        start = "%s - 1" % _par(a[1])
        if n == 2:
            return "substring(%s, %s)" % (a[0], start)
        return "substring(%s, %s, %s + %s)" % (a[0], start, start, _par(a[2]))
    if low == "substring" and n == 3 and BOARD[0] == "aqa":
        # AQA: SUBSTRING(start, end, string), the end included
        return "substring(%s, %s, %s + 1)" % (a[2], a[0], _par(a[1]))
    if low == "position" and n == 2:
        return "indexOf(%s, %s)" % (a[0], a[1])
    if low in ("ucase", "to_upper", "upper") and n == 1:
        return "toUpper(%s)" % a[0]
    if low in ("lcase", "to_lower", "lower") and n == 1:
        return "toLower(%s)" % a[0]
    if low in ("string_to_int",) and n == 1:
        return "int(%s)" % a[0]
    if low in ("string_to_real", "str_to_num", "float") and n == 1:
        return "real(%s)" % a[0]
    if low in ("int_to_string", "real_to_string", "num_to_str", "str") and n == 1:
        return "toString(%s)" % a[0]
    if low in ("char_to_code", "asc") and n == 1:
        return "ord(%s)" % a[0]
    if low == "code_to_char" and n == 1:
        return "chr(%s)" % a[0]
    if low in ("random_int", "randint", "randombetween") and n == 2:
        return "random(%s, %s)" % (a[0], a[1])
    if low == "rand" and n == 1:
        return "(random() * %s)" % _par(a[0])
    if low == "div" and n == 2:
        return "(%s DIV %s)" % (_par(a[0]), _par(a[1]))
    if low == "mod" and n == 2:
        return "(%s MOD %s)" % (_par(a[0]), _par(a[1]))
    if low == "is_num" and n == 1:
        return "isNumber(%s)" % a[0]
    # The textbook's library (Gaddis): stringToInteger("42"), toReal(n),
    # integerToString(n), isReal("4.5"), isLetter(ch), isWhitespace(ch)
    if low in ("stringtointeger", "tointeger") and n == 1:
        return "int(%s)" % a[0]
    if low in ("stringtoreal", "toreal") and n == 1:
        return "real(%s)" % a[0]
    if low in ("integertostring", "realtostring") and n == 1:
        return "toString(%s)" % a[0]
    if low == "isreal" and n == 1:
        return "isNumber(%s)" % a[0]
    if low == "isletter" and n == 1:
        return "isAlpha(%s)" % a[0]
    if low == "iswhitespace" and n == 1:
        return "isSpace(%s)" % a[0]
    if name in RECORDS or low in (r.lower() for r in RECORDS):
        # AQA makes a record by naming it: Car("Ford", 1.8)
        return "New %s(%s)" % (name, ", ".join(args))
    return "%s(%s)" % (name, ", ".join(args))


def method(obj, name, args, own=()):
    """obj.name(args) -- or obj.name, with no brackets -- in the runner's words."""
    low = name.lower()
    n = len(args) if args is not None else -1
    # Only OCR's.  Anywhere else p.length is a field that a program has
    # every right to call length -- a linked list keeping count of itself
    # -- and name.left is the left of a tree.
    if BOARD[0] != "ocr":
        if args is None:
            return "%s.%s" % (obj, name)
        return "%s.%s(%s)" % (obj, name, ", ".join(args))
    if low == "length" and n <= 0:
        return "length(%s)" % obj
    if low in ("upper", "toupper") and n <= 0:
        return "toUpper(%s)" % obj
    if low in ("lower", "tolower") and n <= 0:
        return "toLower(%s)" % obj
    if low == "left" and n == 1:
        return "substring(%s, 0, %s)" % (obj, args[0])
    if low == "right" and n == 1:
        return "substring(%s, length(%s) - %s)" % (obj, obj, _par(args[0]))
    if low == "substring" and n == 2 and BOARD[0] == "ocr":
        # OCR: .substring(start, how many)
        return "substring(%s, %s, %s + %s)" % (obj, args[0], _par(args[0]), _par(args[1]))
    if args is None:
        return "%s.%s" % (obj, name)
    return "%s.%s(%s)" % (obj, name, ", ".join(args))


def plain(expr, own=()):
    """An expression in the boards' words, in the words the runner knows.

    `own` is the program's own function names, lowercased: a program that
    writes its own left() means its own."""
    if not expr or not isinstance(expr, str):
        return expr
    text = _outside_quotes(expr, _symbols)
    if not re.search(r"[A-Za-z_]\s*\(|\.|\[", text):
        return text                     # nothing called, nothing taken apart
    toks = _tokens(text)
    if not toks:
        return text
    try:
        out = _Reader(toks, own).seq()
    except (IndexError, RecursionError):
        return text
    return out.strip() if out.strip() else text


# ------------------------------------------------------------- statements --
# Asking, the boards' way: AQA's name <- USERINPUT, and OCR's
# name = input("Name?") -- with int(...) or float(...) round it, which is
# what a number typed in comes to here anyway.
R_ASKED = re.compile(r"^(?:set\s+)?([A-Za-z_]\w*(?:\s*\[[^\]]*\])*)\s*(?:=|:=|<-|" + ARROW +
                     r")\s*(?:(int|float|real|str|integer|string_to_int|string_to_real|str_to_num)\s*\(\s*)?"
                     r"(?:userinput|input\s*\((.*?)\))\s*\)?\s*$", re.I)
# ... and what the number round it says it is: float(input()) a Real
ASKED_AS = {"int": "int", "integer": "int", "string_to_int": "int",
            "float": "real", "real": "real", "string_to_real": "real", "str_to_num": "real",
            "str": "text"}
# A record, laid out: TYPE Student ... ENDTYPE, RECORD Car ... ENDRECORD
R_RECORD = re.compile(r"^(type|record|structure|struct)\s+([A-Za-z_]\w*)\s*(?:=\s*)?$", re.I)
R_END_RECORD = re.compile(r"^end[ -]?(type|record|structure|struct)$", re.I)
# ... and each field in it: DECLARE Name : STRING, make : String, Name
R_FIELD = re.compile(r"^(?:declare\s+)?([A-Za-z_]\w*)\s*(?::\s*(.+))?$", re.I)
# Cambridge's declaring: DECLARE Name : STRING, DECLARE A : ARRAY[1:10] OF INTEGER
R_COLON_DECL = re.compile(r"^(declare|constant|const)\s+([A-Za-z_]\w*)\s*:\s*"
                          r"(?:array\s*\[([^\]]*)\]\s*of\s+)?([A-Za-z_]\w*)\s*$", re.I)
# OCR's: array names[5], array board[8, 8]
R_OCR_ARRAY = re.compile(r"^array\s+([A-Za-z_]\w*)\s*\[([^\]]*)\]\s*(?:=\s*(.+))?$", re.I)
TYPE_NAMES = {"integer": "Integer", "int": "Integer", "real": "Real", "float": "Real",
              "string": "String", "str": "String", "char": "Char", "character": "Char",
              "boolean": "Boolean", "bool": "Boolean", "date": "String"}


def as_declare(text):
    """A board's declaring, in this page's words -- or None when it is not one.

    Cambridge counts its arrays from where it says -- ARRAY[1:10] -- and
    this page counts from nought, so the list is made big enough for the
    last place it names and the first ones go unused."""
    m = R_COLON_DECL.match(text)
    if m:
        word, name, dims, kind = m.groups()
        kind = TYPE_NAMES.get(kind.lower(), kind)
        sizes = ""
        if dims:
            for one in dims.split(","):
                lo_hi = one.split(":")
                top = lo_hi[-1].strip()
                sizes += "[%s]" % (str(int(top) + 1) if top.isdigit() else top + " + 1")
        return "%s %s %s%s" % ("Constant" if word.lower() != "declare" else "Declare",
                               kind, name, sizes)
    m = R_OCR_ARRAY.match(text)
    if m:
        name, dims, value = m.groups()
        sizes = "".join("[%s]" % d.strip() for d in dims.split(","))
        return "Declare %s%s%s" % (name, sizes, " = " + value if value else "")
    return None


R_CHOICE_WORD = re.compile(r'^(?:[-+]?\d+(?:\.\d+)?|"[^"]*"|\'[^\']*\'|[A-Za-z_]\w*)$')
NOT_CHOICES = {"if", "else", "while", "for", "do", "repeat", "until", "case", "select",
               "switch", "return", "call", "end", "set", "declare", "output", "input",
               "print", "display", "then", "next", "loop"}


def case_choice(raw):
    """One of Cambridge's CASE OF choices -- (its value, what it does) -- or
    None when the line is not one.  The value can be several, 2, 3, and a
    run, 1 TO 5; OTHERWISE is the one for everything else."""
    s = raw.strip()
    m = re.match(r"^otherwise\b\s*:?\s*(.*)$", s, re.I)
    if m:
        rest = m.group(1).strip()
        if re.match(r"^if\b", rest, re.I):
            return None                 # Otherwise If: another answer to an If
        return ("Else", rest)
    at, quote = -1, None
    for i, c in enumerate(s):
        if quote:
            if c == quote:
                quote = None
        elif c in "\"'":
            quote = c
        elif c == ":":
            at = i
            break
    if at < 0:
        return None
    label, rest = s[:at].strip(), s[at + 1:].strip()
    if not label or rest.startswith("="):      # := is a Set, not a choice
        return None
    for piece in split_top(label):
        ends = re.split(r"\s+to\s+", piece.strip(), flags=re.I)
        if len(ends) > 2:
            return None
        for end in ends:
            end = end.strip()
            if not R_CHOICE_WORD.match(end) or end.lower() in NOT_CHOICES:
                return None
    return (label, rest)


R_ONE_NAME = re.compile("^\\s*[A-Za-z_]\\w*(?:\\s*\\[[^\\]]*\\])*\\s*(?:(?:=|:=|<-|" + ARROW + ").*)?$", re.S)
R_SIZED_SET = re.compile("^\\s*[A-Za-z_]\\w*(?:\\s*\\[[^\\]]*\\])+\\s*(?:=|:=|<-|" + ARROW + ")", re.S)


def split_declare(text):
    """A Declare of several names -- DECLARE P, Q : INTEGER, or Declare
    Integer a, b = 2 -- as one Declare a name.  Anything else as it is."""
    m = re.match(r"^(declare|constant|const)\s+(.*)$", text, re.I | re.S)
    if not m:
        return [text]
    word, rest = m.groups()
    c = re.match(r"^([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)+)\s*:\s*(.+)$", rest, re.S)
    if c:                               # Cambridge: the names, then their type
        return ["%s %s : %s" % (word, n.strip(), c.group(2)) for n in c.group(1).split(",")]
    t = re.match(r"^([A-Za-z_]\w*)\s+(?=[A-Za-z_])(.*)$", rest, re.S)
    kind, names = (t.group(1) + " ", t.group(2)) if t else ("", rest)
    parts = split_top(names)
    if len(parts) < 2 or not all(R_ONE_NAME.match(p) for p in parts):
        return [text]
    # Declare Integer nums[3] = x, y, z: an array and what it starts out
    # holding, the textbook's way -- not three names declared at once
    if R_SIZED_SET.match(parts[0]) and not any(re.search(r"[=\[]|:=|<-|" + ARROW, re.sub(r'"[^"]*"|\'[^\']*\'', "", p))
                                               for p in parts[1:]):
        return [text]
    return ["%s %s%s" % (word, kind, p.strip()) for p in parts]


R_PARAM = re.compile(r"^\s*(?:(byref|byval)\s+)?([A-Za-z_]\w*)\s*:\s*(array\s*(?:\[[^\]]*\])?\s*of\s+)?"
                     r"([A-Za-z_]\w*)\s*$", re.I)


def plain_params(params):
    """Cambridge's parameters -- BYREF Total : INTEGER -- as this page writes
    them: ByRef Integer Total.  Anything else is left as it was."""
    if ":" not in (params or ""):
        return params
    out = []
    for one in split_top(params):
        m = R_PARAM.match(one)
        if not m:
            out.append(one.strip())
            continue
        how, name, many, kind = m.groups()
        # an ARRAY OF something is a list, which no type word says here:
        # its kind is worked out from what it is handed
        kind = "" if many else TYPE_NAMES.get(kind.lower(), kind)
        out.append(" ".join(w for w in ("ByRef" if (how or "").lower() == "byref" else "",
                                         kind, name) if w))
    return ", ".join(out)


def split_top(text):
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
        elif c == "," and not deep:
            out.append(bit)
            bit = ""
            continue
        bit += c
    out.append(bit)
    return out
