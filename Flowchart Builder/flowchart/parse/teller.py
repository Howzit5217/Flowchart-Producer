"""Reading a story a sentence at a time: what each one says to do.

story.py decides whether a text is a story and puts what this reads back
together as pseudocode.  This is the reading: the verbs a step starts with
(ask, tell, set, add, repeat ...), the names the story talks about ("their
age", "the total"), sums said in words ("the total divided by the count")
and tests said in words ("they are 18 or older").
"""
import re

from ..parse.data import R_DECL_ONE, R_SET


# ============================================================ the words ==
# The verbs a step can start with, in the form a step is said in: "ask",
# "print", "add".  A story says them every other way as well -- asks,
# asking, added -- and base() brings each back to this.
ASKING = {"ask", "prompt", "get", "read", "input", "enter", "request", "obtain",
          "collect", "accept", "receive", "type", "take"}
SAYING = {"display", "show", "print", "output", "write", "say", "tell", "report",
          "announce", "inform", "greet", "thank", "congratulate", "welcome",
          "warn", "let", "notify", "alert", "give"}
SETTING = {"set", "make", "store", "save", "put", "assign", "initialize",
           "initialise", "reset", "change", "update", "start", "record", "keep"}
SUMS = {"add", "subtract", "multiply", "divide", "increase", "increment", "raise",
        "decrease", "decrement", "reduce", "lower", "double", "halve", "square",
        "count", "swap", "calculate", "compute", "work", "find", "figure",
        "determine"}
ENDING = {"stop", "end", "quit", "exit", "finish", "halt", "terminate"}
WAITING = {"wait", "pause", "sleep", "delay"}
VERBS = ASKING | SAYING | SETTING | SUMS | ENDING | WAITING | {
    "repeat", "loop", "check", "go", "do", "continue", "call", "run", "return"}
# A verb on its own, with nothing after it, is still a whole step.
ALONE = ENDING | {"wait", "repeat", "continue"}
# Words a clause can start with that begin a new one, after "and" or a comma.
TURNS = {"if", "then", "otherwise", "while", "until", "unless", "when"}

NUMBER_WORDS = {
    "zero": 0, "none": 0, "one": 1, "two": 2, "three": 3, "four": 4,
    "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
    "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14, "fifteen": 15,
    "sixteen": 16, "seventeen": 17, "eighteen": 18, "nineteen": 19,
    "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60,
    "seventy": 70, "eighty": 80, "ninety": 90}
SCALES = {"hundred": 100, "thousand": 1000, "million": 1000000}
COUNTS = {"once": 1, "twice": 2, "thrice": 3}

DETERMINERS = (r"(?:the|a|an|their|his|her|its|your|my|our|this|that|these|those|"
               r"some|each|every|another|any|new|next|same|given|current|"
               r"(?:the\s+)?(?:user|person|player|customer|student)(?:'s|s')?)")
R_DET = re.compile(r"^" + DETERMINERS + r"\s+", re.I)

# What a name is likely to hold, going by what it is called.
WHOLE = {"number", "num", "count", "age", "year", "years", "score", "guess", "quantity",
         "points", "tries", "attempts", "votes", "students", "items", "tickets", "people",
         "level", "lives", "index", "position", "digit", "digits", "counter", "total",
         "sum", "product", "goals", "marks", "days", "sides", "size", "limit", "max",
         "min", "biggest", "smallest", "largest", "highest", "lowest", "secret", "target",
         "value", "result", "difference", "remainder", "steps", "times", "rounds", "roll",
         "month", "day", "hour", "minute", "seconds", "minutes", "width", "height",
         "length", "numbers", "n"}
REAL = {"price", "cost", "rate", "pay", "wage", "salary", "temperature", "temp", "weight",
        "distance", "speed", "average", "mean", "amount", "balance", "money", "radius",
        "area", "volume", "hours", "tax", "tip", "bill", "percent", "percentage", "gpa",
        "celsius", "fahrenheit", "kilometers", "miles", "interest", "discount",
        "quotient", "ratio", "bmi"}
TEXT = {"name", "word", "color", "colour", "city", "country", "password", "answer",
        "reply", "response", "letter", "sentence", "text", "message", "email",
        "username", "animal", "food", "title", "address", "phrase", "command", "grade",
        "surname", "team", "pet", "movie", "book", "song", "sport", "option",
        "direction", "move"}
# Pseudocode's own words, which a name may not be.
KEPT = {"and", "or", "not", "mod", "div", "to", "downto", "then", "true", "false",
        "step", "end", "else", "ref", "if", "while", "for", "do", "loop", "until",
        "repeat", "next", "select", "case", "call", "set", "let", "declare",
        "constant", "module", "function", "return", "start", "stop", "input",
        "display", "print", "output", "wait", "each", "in"}
FLIP = {">": "<=", "<": ">=", ">=": "<", "<=": ">", "=": "<>", "<>": "="}

R_SUM_TOKEN = re.compile(r'\s*(?:"[^"]*"|\d+(?:\.\d+)?|[A-Za-z_][\w]*|'
                         r'<=|>=|<>|[-+*/^%=<>(),])')


def number_of(text):
    """"twenty five" -> 25, "7" -> 7, anything else -> None."""
    t = text.strip().lower().replace("-", " ")
    if re.match(r"^-?\d+(?:\.\d+)?$", t):
        return float(t) if "." in t else int(t)
    t = re.sub(r"^a\s+(hundred|thousand|million)", r"one \1", t)
    words = [w for w in t.split() if w != "and"]
    if not words or any(w not in NUMBER_WORDS and w not in SCALES for w in words):
        return None
    total, part = 0, 0
    for w in words:
        if w in NUMBER_WORDS:
            part += NUMBER_WORDS[w]
        else:
            part = max(part, 1) * SCALES[w]
            if SCALES[w] >= 1000:
                total, part = total + part, 0
    return total + part


def figure(n):
    """A number, written the way pseudocode writes it."""
    if isinstance(n, float) and n.is_integer():
        n = int(n)
    return str(n)


def base(word):
    """asks, asking, asked -> ask; multiplies -> multiply; putting -> put."""
    w = word.lower()
    if w in VERBS:
        return w
    tries = []
    if w.endswith("ies") or w.endswith("ied"):
        tries.append(w[:-3] + "y")
    if w.endswith("ing"):
        stem = w[:-3]
        tries += [stem, stem + "e"]
        if len(stem) > 2 and stem[-1] == stem[-2]:
            tries.append(stem[:-1])
    if w.endswith("ed"):
        stem = w[:-2]
        tries += [stem, w[:-1]]
        if len(stem) > 2 and stem[-1] == stem[-2]:
            tries.append(stem[:-1])
    if w.endswith("es"):
        tries.append(w[:-2])
    if w.endswith("s"):
        tries.append(w[:-1])
    for one in tries:
        if one in VERBS:
            return one
    return None


def said_to_you(text):
    """What is said about the user, said to them: they can vote -> You can vote."""
    swaps = [(r"\bthey're\b", "you're"), (r"\bthey've\b", "you've"),
             (r"\bthey'll\b", "you'll"), (r"\bthey'd\b", "you'd"),
             (r"\b(?:he|she) is\b", "you are"), (r"\b(?:he|she) was\b", "you were"),
             (r"\b(?:he|she) has\b", "you have"),
             (r"\bthemselves\b", "yourself"), (r"\btheirs\b", "yours"),
             (r"\btheir\b", "your"), (r"\bthem\b", "you"), (r"\bthey\b", "you"),
             (r"\b(?:his|her)\b", "your"), (r"\b(?:he|she|him)\b", "you"),
             (r"\bthe user's\b", "your"), (r"\bthe user\b", "you")]
    out = text
    for find, put in swaps:
        out = re.sub(find, put, out, flags=re.I)
    out = out.strip()
    return out[:1].upper() + out[1:] if out else out


def quote(text):
    """Words as a pseudocode string: it has no escapes, so no " inside."""
    return '"' + str(text).replace('"', "'") + '"'


def unquoted(text):
    """The words inside a pair of quotes that are the whole of text, or None."""
    m = re.match(r'^\s*"([^"]*)"\s*$', text)
    return m.group(1) if m else None


def sentences(text):
    """A line of story, cut where its sentences end.  Quotes are kept whole."""
    out, bit, quoting = [], "", False
    for i, c in enumerate(text):
        if c == '"':
            quoting = not quoting
            bit += c
        elif not quoting and c in ".!?;" and (i + 1 == len(text) or text[i + 1] == " "):
            if bit.strip():
                out.append(bit.strip())
            bit = ""
        else:
            bit += c
    if bit.strip():
        out.append(bit.strip())
    return out


def reads_as_sum(text):
    """Operands with operators between them: total + 1, (a + b) / 2."""
    at, want, deep = 0, True, 0
    t = text.strip()
    if not t:
        return False
    while at < len(t):
        m = R_SUM_TOKEN.match(t, at)
        if not m or m.end() == at:
            return False
        tok = m.group(0).strip()
        at = m.end()
        low = tok.lower()
        operand = (tok[0] in '"' or tok[0].isdigit() or
                   (tok[0].isalpha() or tok[0] == "_") and low not in ("and", "or", "mod", "not"))
        if want:
            if tok in ("(", "-", "+") or low == "not":
                deep += tok == "("
            elif operand:
                want = False
            else:
                return False
        elif tok in ("+", "-", "*", "/", "^", "%", "=", "<>", "<", ">", "<=", ">=", ",") or \
                low in ("and", "or", "mod"):
            want = True
        elif tok == ")":
            deep -= 1
        elif tok == "(":
            deep += 1
            want = True
        else:
            return False
    return not want and deep == 0


# ============================================================ the steps ==
class Step(object):
    """One thing the story said to do: a line of pseudocode, or a block of it.

    kind is one of: raw (pseudocode that was written as such), text (words
    the reading could not make into anything else), display, input, set,
    call, stop, wait, if, while, do, for, each."""

    def __init__(self, kind, line, **parts):
        self.kind, self.line = kind, line
        self.then, self.orelse, self.body = [], [], []
        self.chained = False
        self.__dict__.update(parts)


class Teller(object):
    """Reads a story into Steps, keeping track of the names it has met."""

    def __init__(self):
        self.kinds = {}                     # name -> int / real / text / bool / None
        self.order = []                     # the names, as they were first met
        self.counters = set()               # names only ever a loop's counter
        self.declared = set()               # names the text declared for itself
        self.last = None                    # what "it" is
        self.result = None                  # what "the result" is
        self.asked = []                     # what was asked for, in order
        self.given = set()                  # names given a value so far
        self.starts = {}                    # names that start at a value nobody set
        self.mark = 0                       # where the paragraph being read began
        self.closers = set()                # the blocks the text closes for itself
        self.heading = False                # reading a line whose body is under it

    # ---- names -------------------------------------------------------------
    def meet(self, name, kind=None, counter=False):
        if not name:
            return name
        if name not in self.kinds:
            self.kinds[name] = None
            self.order.append(name)
            if counter:
                self.counters.add(name)
        elif not counter:
            self.counters.discard(name)
        if kind:
            had = self.kinds[name]
            if had is None or had == kind:
                self.kinds[name] = kind
            elif {had, kind} == {"int", "real"}:
                self.kinds[name] = "real"
        self.last = name
        return name

    @staticmethod
    def hinted(name):
        """What a name is likely to hold, going by what it is called."""
        words = [w.lower() for w in re.findall(r"[A-Z]?[a-z]+|\d+", name)] or [name.lower()]
        for w in (words[-1], words[0]):
            w = re.sub(r"\d+$", "", w)
            if w in REAL:
                return "real"
            if w in WHOLE:
                return "int"
            if w in TEXT:
                return "text"
        return None

    def name_of(self, phrase, make=True):
        """A noun phrase, as a name: "the user's first name" -> firstName."""
        low = re.sub(r"\s+", " ", phrase.strip().strip(",.").strip().lower())
        if not low:
            return None
        if low in ("it", "that", "this", "that number", "this number", "the value", "each one",
                   "every one", "each of them", "the one", "the new one", "the new number",
                   "what they typed", "what they entered", "what was typed", "its value"):
            return self.last
        if low in ("the result", "result", "the answer", "the outcome") and self.result \
                and "answer" not in self.kinds:
            return self.result
        if re.match(r"^(?:how\s+old\s+(?:they|he|she|you|the\s+\w+)\s+(?:are|is)|how\s+old|their\s+age)$", low):
            return self.meet("age", "int") if make or "age" in self.kinds else None
        m = re.match(r"^how\s+(?:many|much)\s+(\w+(?:\s+\w+)?)(?:\s+(?:they|he|she|you|there|it)\b.*)?$", low)
        if m:
            return self.name_of(m.group(1), make)
        m = re.match(r"^what\s+(.+?)\s+(?:is|are|was|were)$", low)
        if m:
            return self.name_of(m.group(1), make)
        # what is said about the name, which is not part of it
        low = re.sub(r"\s+(?:(?:that|which)\s+)?(?:they|he|she|the user|you)\s+"
                     r"(?:typed|entered|gave|chose|picked|want|wants)(?:\s+in)?$", "", low)
        low = re.sub(r"\s+(?:typed|entered|given|chosen|picked)(?:\s+(?:in|by\s+the\s+user))?$", "", low)
        low = re.sub(r"\s+(?:from|of|by)\s+the\s+(?:user|keyboard|person|player)$", "", low)
        low = re.sub(r"\s+(?:between|from)\s+\S+\s+(?:and|to)\s+\S+$", "", low)
        low = re.sub(r"\s+(?:in|on|to|at)\s+the\s+(?:screen|console|keyboard)$", "", low)
        low = re.sub(r"^(?:the\s+)?(?:value|variable)\s+(?:called|named)\s+", "", low)
        low = re.sub(r"^(?:a|the)\s+(?:variable|value)\s+", "", low)
        # "a number called n", "a number n": the name it was given
        m = re.match(r"^(?:a|an|the)?\s*(?:\w+\s+)?(?:called|named)\s+([a-z_]\w*)$", low) or \
            re.match(r"^(?:a|an|the)\s+(?:number|value|word|integer|string)\s+([a-z])$", low)
        if m:
            low = m.group(1)
        # what it is measured in, and what it belongs to: "the temperature in
        # Celsius" is the temperature, "the price of the item" the price --
        # but "the number of students" is a number of its own
        low = re.sub(r"\s+(?:in|as)\s+[a-z]+$", "", low)
        low = re.sub(r"^((?:the\s+)?\w+(?:\s+\w+)?)\s+(?:of|for)\s+(?:the|this|that|each|every|their|your|an?)\s+\w+$",
                     r"\1", low)
        before = None
        while before != low:
            before = low
            low = R_DET.sub("", low)
        low = re.sub(r"'s\b", "", low)
        words = re.findall(r"[a-z0-9]+", low)
        if not words or len(words) > 3:
            return None                     # nothing, or a whole clause: not a name
        name = words[0] + "".join(w[:1].upper() + w[1:] for w in words[1:])
        if name[0].isdigit():
            name = "n" + name
        if name.lower() in KEPT:
            name += "Value"
        # the same name again, said as plural or singular
        for have in self.order:
            h = have.lower()
            if h in (name.lower(), name.lower().rstrip("s"), name.lower() + "s"):
                self.last = have
                return have
        # "the color", after "their favorite color": the one name that ends
        # (or starts) with it
        if len(words) == 1:
            near = [have for have in self.order
                    if re.search(r"[a-z0-9]" + name[:1].upper() + name[1:] + r"$", have) or
                    re.match(name + r"[A-Z]", have)]
            if len(near) == 1:
                self.last = near[0]
                return near[0]
        if not make:
            return None
        return self.meet(name, self.hinted(name))

    def several(self, phrase):
        """"two numbers" -> number1, number2; "their name and age" -> name, age."""
        phrase = re.sub(r"\s+(?:from|of|by)\s+the\s+(?:user|keyboard|person|player)$", "", phrase.strip(), flags=re.I)
        phrase = re.sub(r"\s+(?:between|from)\s+\S+\s+(?:and|to)\s+\S+$", "", phrase, flags=re.I)
        m = re.match(r"^(\w+)\s+(\w+?)s$", phrase, re.I)
        n = number_of(m.group(1)) if m else None
        if n and 1 < n <= 9:
            stem = m.group(2).lower()
            return [self.meet("%s%d" % (stem, k), self.hinted(stem) or "int")
                    for k in range(1, n + 1)]
        bits = [b for b in re.split(r"\s*,\s*(?:and\s+)?|\s+and\s+", phrase) if b.strip()]
        names = [self.name_of(b) for b in bits]
        return names if names and all(names) else []

    # ---- sums --------------------------------------------------------------
    def value(self, text, make=True):
        """Words as a pseudocode sum, or None: "the total divided by the count"."""
        t = re.sub(r"\s+", " ", text.strip().strip(",").strip())
        if not t:
            return None
        inner = unquoted(t)
        if inner is not None:
            return quote(inner)
        n = number_of(t)
        if n is not None:
            return figure(n)
        low = t.lower()
        if low in ("true", "false"):
            return low.title()
        if low in ("yes", "no"):
            return quote(low)
        if low in ("nothing", "empty", "blank", "an empty string", "empty text"):
            return '""'
        sym = self.symbols(t)
        if sym:
            return sym
        m = re.match(r"^(?:the\s+)?(sum|total|product|difference|average|mean)\s+"
                     r"(?:of|between)\s+(.+)$", low)
        if m:
            parts = [self.value(b, make) for b in re.split(r"\s*,\s*(?:and\s+)?|\s+and\s+", m.group(2))]
            if len(parts) >= 2 and all(parts):
                kind = m.group(1)
                if kind in ("sum", "total"):
                    return " + ".join(parts)
                if kind == "product":
                    return " * ".join(self.held(p) for p in parts)
                if kind == "difference":
                    return parts[0] + " - " + self.held(parts[1])
                return "(" + " + ".join(parts) + ") / " + str(len(parts))
        m = re.match(r"^(?:the\s+)?(larger|largest|bigger|biggest|greater|greatest|maximum|max|"
                     r"higher|highest|smaller|smallest|lesser|least|minimum|min|lower|lowest)"
                     r"(?:\s+number|\s+one)?\s+(?:of|between)\s+(.+)$", low)
        if m:
            parts = [self.value(b, make) for b in re.split(r"\s*,\s*(?:and\s+)?|\s+and\s+", m.group(2))]
            if len(parts) >= 2 and all(parts):
                big = m.group(1) in ("larger", "largest", "bigger", "biggest", "greater",
                                     "greatest", "maximum", "max", "higher", "highest")
                return ("max(" if big else "min(") + ", ".join(parts) + ")"
        m = re.match(r"^(?:the\s+)?square\s+root\s+of\s+(.+)$", low)
        if m and self.value(m.group(1), make):
            return "sqrt(" + self.value(m.group(1), make) + ")"
        m = re.match(r"^(?:the\s+)?remainder\s+(?:of|when)\s+(.+?)\s+(?:is\s+)?divided\s+by\s+(.+)$", low)
        if m and self.value(m.group(1), make) and self.value(m.group(2), make):
            return self.held(self.value(m.group(1), make)) + " MOD " + self.held(self.value(m.group(2), make))
        m = re.match(r"^half\s+(?:of\s+)?(.+)$", low)
        if m and self.value(m.group(1), make):
            return self.held(self.value(m.group(1), make)) + " / 2"
        m = re.match(r"^(?:twice|double)\s+(.+)$", low)
        if m and self.value(m.group(1), make):
            return "2 * " + self.held(self.value(m.group(1), make))
        m = re.match(r"^(.+?)\s*(?:percent|%)\s+of\s+(.+)$", low)
        if m and self.value(m.group(1), make) and self.value(m.group(2), make):
            return (self.held(self.value(m.group(2), make)) + " * " +
                    self.held(self.value(m.group(1), make)) + " / 100")
        m = re.match(r"^(.+?)\s+(squared|cubed)$", low)
        if m and self.value(m.group(1), make):
            return self.held(self.value(m.group(1), make)) + (" ^ 2" if m.group(2) == "squared" else " ^ 3")
        m = re.match(r"^(?:by\s+)?(adding|subtracting|multiplying|dividing|taking\s+away)\s+(.+)$", low)
        if m:
            got = self.gerund(m.group(1), m.group(2))
            if got:
                return got
        for words, op, rank in ((r"\s+(?:plus|added\s+to)\s+", "+", 5),
                                (r"\s+(?:minus|take\s+away|less)\s+", "-", 5),
                                (r"\s+(?:times|multiplied\s+by)\s+", "*", 6),
                                (r"\s+(?:divided\s+by|over)\s+", "/", 6),
                                (r"\s+(?:mod|modulo|modulus)\s+", "MOD", 6),
                                (r"\s+(?:to\s+the\s+power\s+of|raised\s+to(?:\s+the\s+power\s+of)?)\s+", "^", 7)):
            bits = re.split(words, t, flags=re.I)
            if len(bits) > 1:
                made = [self.value(b, make) for b in bits]
                if all(made):
                    return (" " + op + " ").join(self.held(x) if rank > 5 else x for x in made)
                return None
        return self.name_of(t, make)

    def gerund(self, how, rest):
        """"adding a and b" -> a + b; "dividing the total by the count" -> total / count."""
        m = re.match(r"^(.+?)\s+(and|to|by|from|with)\s+(.+)$", rest)
        if not m:
            return None
        a, b = self.value(m.group(1)), self.value(m.group(3))
        if not (a and b):
            return None
        if how == "adding":
            return a + " + " + b
        if how.startswith(("subtracting", "taking")):
            return (b + " - " + self.held(a)) if m.group(2) == "from" else (a + " - " + self.held(b))
        if how == "multiplying":
            return self.held(a) + " * " + self.held(b)
        return self.held(a) + " / " + self.held(b)

    @staticmethod
    def held(sum_text):
        """Brackets round a sum that is more than one thing."""
        s = sum_text.strip()
        if re.match(r'^(?:[\w.]+(?:\([^()]*\))?|"[^"]*"|-?\d+(?:\.\d+)?)$', s):
            return s
        return "(" + s + ")"

    def symbols(self, text):
        """A sum written with symbols already: "total + 1", "x*2", "n >= 10"."""
        t = text.strip()
        if not re.search(r"[-+*/^%=<>()]", t):
            return None
        t = t.replace("==", "=").replace("!=", "<>").replace("&&", " AND ").replace("||", " OR ")
        t = re.sub(r"\s+", " ", t).strip()
        if not reads_as_sum(t):
            return None
        for name in re.findall(r"(?<![\"\w.])[A-Za-z_]\w*(?![\w(])", t):
            if name.lower() not in ("and", "or", "mod", "not", "true", "false"):
                self.meet(name)
        return t

    # ---- tests -------------------------------------------------------------
    def test(self, text):
        """Words as a condition: "they are 18 or older" -> age >= 18.  None
        when the words cannot be made out."""
        t = re.sub(r"\s+", " ", text.strip().strip(",").strip())
        t = re.sub(r"^(?:that|whether)\s+", "", t, flags=re.I)
        sym = self.symbols(t)
        if sym and re.search(r"[=<>]", sym):
            return sym
        guarded = re.sub(r"\bbetween\s+(\S+)\s+and\s+(\S+)", r"between \1 &AND& \2", t, flags=re.I)
        parts = re.split(r"\s+(and|or)\s+", guarded, flags=re.I)
        if len(parts) > 1:
            bits, ops = [], []
            for k, part in enumerate(parts):
                if k % 2:
                    ops.append(part.upper())
                    continue
                one = self.one_test(part.replace("&AND&", "and"))
                if not one:
                    bits = None
                    break
                bits.append(one)
            if bits:
                out = bits[0]
                for op, bit in zip(ops, bits[1:]):
                    out += " " + op + " " + bit
                return out
        return self.one_test(t)

    def subject(self, text, about=""):
        """Who or what a test is about, as a name."""
        s = text.strip().lower()
        if re.match(r"^(?:they|he|she|you|the (?:user|person|player|customer|student))$", s):
            if re.search(r"\b(?:old|older|younger|adult|teen|teenager|child|age)\b|"
                         r"\b(?:over|under|above|below)\s+\d", about):
                return self.meet("age", "int")
            return self.last
        return self.name_of(text)

    def one_test(self, text):
        low = text.strip().lower()
        low = low.replace("isn't", "is not").replace("aren't", "are not") \
                 .replace("doesn't", "does not").replace("don't", "do not")
        # "the user says yes", "they type quit"
        m = re.match(r"^(?:the\s+)?(?:user|they|he|she|you|player)\s+"
                     r"(?:says?|types?|enters?|answers?|chooses?|picks?|replies|reply)\s+(.+)$", low)
        if m:
            who = self.asked[-1] if self.asked else (self.last or self.meet("answer", "text"))
            said = re.sub(r"^.*?\b(?:says?|types?|enters?|answers?|chooses?|picks?|replies|reply)\s+",
                          "", text.strip(), flags=re.I)
            what = self.value(said, make=False)
            if not what or (re.match(r"^[A-Za-z_]\w*$", what) and what not in self.kinds):
                what = quote(unquoted(said) if unquoted(said) is not None else said.strip())
            return who + " = " + what
        m = re.match(r"^(.+?)\s+(?:is|are|was|were)\s+(not\s+)?(.+)$", low)
        if m:
            who = self.subject(m.group(1), m.group(3))
            if who:
                got = self.compare(who, m.group(3), bool(m.group(2)))
                if got:
                    return got
        m = re.match(r"^(.+?)\s+(?:does\s+not|do\s+not)\s+(?:equal|match)\s+(.+)$", low)
        if m:
            who, what = self.subject(m.group(1)), self.value(m.group(2))
            return (who + " <> " + what) if who and what else None
        m = re.match(r"^(.+?)\s+(equals?|matches|match|exceeds?|reaches|reach|hits|goes\s+over|"
                     r"gets\s+to|gets\s+over)\s+(.+)$", low)
        if m:
            who, what = self.subject(m.group(1)), self.value(m.group(3))
            if who and what:
                verb = m.group(2)
                op = ">" if verb.startswith(("exceed", "goes", "gets over")) else \
                     ">=" if verb.startswith(("reach", "hit", "gets to")) else "="
                return who + " " + op + " " + what
        m = re.match(r"^(?:there\s+(?:are|is)\s+)?(?:no|none|nothing)\s+(\w+)\s+left$", low)
        if m:
            who = self.name_of(m.group(1))
            return (who + " = 0") if who else None
        return None

    def compare(self, who, rest, negate):
        """X is <rest>: what <rest> says about X, as a test."""
        r = rest.strip()
        table = [
            (r"^(?:greater|more|bigger|larger|higher|older|taller|heavier|longer)\s+than\s+or\s+equal\s+to\s+(.+)$", ">="),
            (r"^(?:less|fewer|smaller|lower|younger|shorter|lighter)\s+than\s+or\s+equal\s+to\s+(.+)$", "<="),
            (r"^(?:at\s+least|no\s+less\s+than|no\s+fewer\s+than)\s+(.+)$", ">="),
            (r"^(?:at\s+most|no\s+more\s+than|up\s+to)\s+(.+)$", "<="),
            (r"^(.+?)\s+or\s+(?:more|greater|higher|over|above|older|bigger|larger|longer|taller)$", ">="),
            (r"^(.+?)\s+or\s+(?:less|fewer|under|below|younger|lower|smaller|shorter)$", "<="),
            (r"^(?:greater|more|bigger|larger|higher|older|taller|heavier|longer)\s+than\s+(.+)$", ">"),
            (r"^(?:over|above|past|beyond)\s+(.+)$", ">"),
            (r"^(?:less|fewer|smaller|lower|younger|shorter|lighter)\s+than\s+(.+)$", "<"),
            (r"^(?:under|below)\s+(.+)$", "<"),
            (r"^(?:different\s+(?:from|to|than)|not\s+equal\s+to)\s+(.+)$", "<>"),
            (r"^(?:equal\s+to|the\s+same\s+as|exactly|same\s+as)\s+(.+)$", "="),
        ]
        # "the guess is right": right is what it is being guessed against
        if r in ("right", "correct", "the same", "wrong", "incorrect", "the answer", "the secret"):
            other = [n for n in ("secret", "secretNumber", "target", "correctAnswer", "answer", "number")
                     if n in self.kinds and n != who]
            if not other:
                return None
            op = "<>" if (r in ("wrong", "incorrect")) != negate else "="
            return who + " " + op + " " + other[0]
        found = None
        for find, op in table:
            m = re.match(find, r)
            if m:
                what = self.value(m.group(1))
                if not what:
                    return None
                found = (op, what)
                break
        if found is None:
            simple = {
                "even": (who + " MOD 2", "=", "0"), "odd": (who + " MOD 2", "=", "1"),
                "positive": (who, ">", "0"), "negative": (who, "<", "0"),
                "zero": (who, "=", "0"), "empty": (who, "=", '""'), "blank": (who, "=", '""'),
                "an adult": (who, ">=", "18"), "old enough to vote": (who, ">=", "18"),
                "old enough": (who, ">=", "18"), "a teenager": (who, ">=", "13"),
                "true": (who, "=", "True"), "false": (who, "=", "False"),
            }
            if r in simple:
                left, op, right = simple[r]
                if right[:1].isdigit():
                    self.meet(who, "int")
                return left + " " + (FLIP[op] if negate else op) + " " + right
            m = re.match(r"^(?:divisible\s+by|a\s+multiple\s+of)\s+(.+)$", r)
            if m and self.value(m.group(1)):
                self.meet(who, "int")
                return who + " MOD " + self.held(self.value(m.group(1))) + (" <> 0" if negate else " = 0")
            m = re.match(r"^between\s+(.+?)\s+and\s+(.+)$", r)
            if m and self.value(m.group(1)) and self.value(m.group(2)):
                a, b = self.value(m.group(1)), self.value(m.group(2))
                if negate:
                    return who + " < " + a + " OR " + who + " > " + b
                return who + " >= " + a + " AND " + who + " <= " + b
            what = self.value(r, make=False)
            if not what:
                # a word it is compared with: "the color is blue"
                if re.match(r"^[a-z][a-z' ]{0,30}$", r) and len(r.split()) <= 3:
                    what = quote(r)
                    self.meet(who, "text")
                else:
                    return None
            found = ("=", what)
        op, what = found
        if negate:
            op = FLIP[op]
        if op in (">", "<", ">=", "<=") and re.match(r"^-?\d", what):
            self.meet(who, "real" if "." in what else "int")
        return who + " " + op + " " + what

    # ---- saying ------------------------------------------------------------
    def message(self, text):
        """The pieces of a Display, or None when there is nothing to say."""
        t = text.strip().strip(",").strip()
        t = re.sub(r"^(?:out|back)\s+", "", t, flags=re.I)
        t = re.sub(r"^(?:to\s+)?(?:the\s+(?:user|person|player|screen)|them|him|her|everyone|you)"
                   r"(?:\s+that)?\s+", "", t, flags=re.I)
        t = re.sub(r"\s+(?:to|on|onto)\s+(?:the\s+)?(?:user|screen|console|them)$", "", t, flags=re.I)
        t = re.sub(r"^(?:a\s+message\s+(?:saying|that\s+says|which\s+says)|the\s+message|"
                   r"a\s+message|the\s+words?)\s*:?\s*", "", t, flags=re.I)
        if not t:
            return None
        # "say goodbye to them by name": the words, then the name they gave
        m = re.match(r"^(.+?)\s+(?:to\s+(?:them|the\s+user|him|her)\s+)?(?:by|using|with)\s+"
                     r"(?:their\s+|his\s+|her\s+|your\s+)?(?:first\s+)?name$", t, re.I)
        named = self.name_of("name", make=False) if m else None
        if m and named:
            head = self.message(m.group(1)) or []
            if head and head[-1].startswith('"'):
                head[-1] = head[-1][:-1].rstrip(",!. ") + ', "'
            return head + [named]
        if '"' in t:
            parts, at = [], 0
            for m in re.finditer(r'"([^"]*)"', t):
                self.message_bit(t[at:m.start()], parts)
                parts.append(quote(m.group(1)))
                at = m.end()
            self.message_bit(t[at:], parts)
            return self.spaced(parts)
        low = t.lower()
        if low.startswith("that "):
            return [quote(said_to_you(t[5:]))]
        known = self.known_names(t)
        if known:
            return self.spaced(known)
        got = self.value(t, make=False)
        if got and (not re.match(r"^[A-Za-z_]\w*$", got) or got in self.kinds):
            return [got]
        if low.startswith("to "):
            return [quote(said_to_you(t[3:]))]
        return [quote(said_to_you(t))]

    def known_names(self, text):
        """"the total and the average" -> [total, average], names met already."""
        bits = [b for b in re.split(r"\s*,\s*(?:and\s+)?|\s+and\s+|\s+followed\s+by\s+", text) if b.strip()]
        names = []
        for b in bits:
            n = self.name_of(b, make=False) if len(b.split()) <= 4 else None
            if not n or n not in self.kinds:
                return None
            names.append(n)
        return names

    def message_bit(self, text, parts):
        """Between the quotes of a message: names, where they are names."""
        t = re.sub(r"^\s*(?:,|and|then|followed\s+by|with|plus|\+)\s*|\s*(?:,|and|then|followed\s+by|with|plus|\+)\s*$",
                   "", text.strip(), flags=re.I).strip()
        t = re.sub(r"^(?:and|then|followed\s+by|with|plus)\s+", "", t, flags=re.I)
        if not t:
            return
        got = self.value(t, make=False)
        parts.append(got if got else quote(t))

    @staticmethod
    def spaced(parts):
        """Pieces of a Display, with a space where two would run together."""
        out = []
        for p in parts:
            if out:
                prev = out[-1]
                if prev.startswith('"') and p.startswith('"'):
                    out[-1] = prev[:-1] + p[1:]
                    continue
                if prev.startswith('"') and not p.startswith('"'):
                    if not re.search(r'[\s(]"$', prev):
                        out[-1] = prev[:-1] + ' "'
                elif p.startswith('"'):
                    if not re.match(r'^"[\s,.!?:;)]', p):
                        p = '" ' + p[1:]
                else:
                    out.append('" "')
            out.append(p)
        return out

    # ==================================================== sentences ==
    def plain(self, text):
        """A sentence without what does not change what it asks for: "Then",
        "Finally,", "the program will", a trailing full stop -- and asking
        said as "asking" is asking."""
        t = text.strip().strip(",;:").strip()
        t = R_LEADS.sub("", t)
        m = re.match(r"^" + SUBJECTS + r"\s+" + MODALS + r"(\w+)\b(.*)$", t, re.I)
        if m and base(m.group(1)):
            t = base(m.group(1)) + m.group(2)
        m = re.match(r"^(\w+ing)\b(.*)$", t, re.I)
        if m and base(m.group(1)):
            t = base(m.group(1)) + m.group(2)
        return t.rstrip(".!").strip()

    def sentence(self, text, line, out):
        """One sentence: whatever it says to do, as Steps onto `out`."""
        s = self.plain(text)
        if not s:
            return
        low = s.lower()
        # Otherwise ...: the other way of the decision just made
        m = R_OTHERWISE.match(s)
        if m:
            rest = m.group(1).strip()
            into = self.open_if(out)
            if into is not None:
                body = []
                if rest:
                    self.sentence(rest, line, body)
                if len(body) == 1 and body[0].kind == "if":
                    body[0].chained = True
                into.orelse = body
                return
            out.append(Step("raw", line, text="Else"))
            if rest:
                self.sentence(rest, line, out)
            return
        if re.match(r"^(?:start|begin)(?:\s+(?:the\s+)?(?:program|game|app|code))?$", low):
            return                          # every chart starts: nothing to add
        m = re.match(r"^(if|when|whenever|in\s+case|check\s+(?:if|whether)|see\s+if)\s+(.+)$", s, re.I)
        if m:
            self.decision(m.group(2), line, out, m.group(1).lower())
            return
        if self.loop(s, line, out):
            return
        # "print it if it is even", "stop unless they say yes"
        m = re.match(r"^(.+?)\s+(?:only\s+)?(if|unless)\s+(.+)$", s, re.I)
        if m and self.starts_with_verb(m.group(1)):
            cond = self.test(m.group(3)) or self.said_test(m.group(3))
            if m.group(2).lower() == "unless":
                cond = "NOT (" + cond + ")"
            step = Step("if", line, cond=cond)
            self.clauses(m.group(1), line, step.then)
            out.append(step)
            return
        self.clauses(s, line, out)

    @staticmethod
    def open_if(out):
        """The decision a following "Otherwise" belongs to, if the last step is one."""
        real = [st for st in out if st.kind != "note"]
        if not real or real[-1].kind != "if":
            return None
        step = real[-1]
        while step.orelse:
            if len(step.orelse) == 1 and step.orelse[0].kind == "if" and step.orelse[0].chained:
                step = step.orelse[0]
            else:
                return None
        return step

    def starts_with_verb(self, text):
        words = self.plain(text).split(None, 1)
        return bool(words) and base(words[0]) is not None

    def said_test(self, text):
        """A test the reading could not make out, kept in its own words: the
        diamond still says what is being decided, and a run says it cannot."""
        t = re.sub(r"\bthen\b", "", text, flags=re.I)
        t = re.sub(r"\s+", " ", t.replace('"', "'")).strip(" ,.;:")
        t = re.sub(r"\s+(?:and|or)$", "", t, flags=re.I)
        # (a web address keeps its two slashes: https://...)
        t = re.sub(r"(?<![A-Za-z]:)//", "/", t.replace("#", "number "))
        return t[:1].upper() + t[1:] if t else "?"

    def decision(self, text, line, out, word="if"):
        """If <test>, <do this>[, otherwise <that>]."""
        cond_text, then_text, else_text = self.split_if(text)
        cond = self.test(cond_text)
        # "When they get it, ..." straight after a loop that goes round until
        # they do: that is when the loop is over, not a second question
        real = [st for st in out if st.kind != "note"]
        if (not cond and word == "when" and then_text and not else_text and real and
                real[-1].kind in ("while", "do", "for")):
            self.sentence(then_text, line, out)
            return
        step = Step("if", line, cond=cond or self.said_test(cond_text))
        if then_text:
            self.sentence(then_text, line, step.then)
        if else_text:
            self.sentence(else_text, line, step.orelse)
            if len(step.orelse) == 1 and step.orelse[0].kind == "if":
                step.orelse[0].chained = True
        out.append(step)

    def split_if(self, text):
        """Where the test ends and what to do begins: at "then", at a comma
        or a colon, or else at the first verb that starts a step."""
        halves = re.split(r"\s*[,;]?\s*\b(?:otherwise|or\s+else|else)\b\s*,?\s*", text, 1, flags=re.I)
        first, other = halves[0], (halves[1] if len(halves) > 1 else "")
        m = re.match(r"^(.+?)(?:\s*,\s*then\s+|\s+then\s*,?\s+|\s*:\s*|\s*,\s*)(.+)$", first, re.I)
        if m:
            return m.group(1), m.group(2), other
        words = first.split()
        for i in range(2, len(words)):
            w = words[i].lower()
            if base(w) == w and words[i - 1].lower() not in HOLDS:
                return " ".join(words[:i]), " ".join(words[i:]), other
        return first, "", other

    # ---- loops -------------------------------------------------------------
    def loop(self, s, line, out):
        """A sentence that goes round: so many times, from one number to
        another, while something holds, or until it does."""
        # repeat 5 times: ...  /  5 times, ...  /  say hi 3 times
        m = (re.match(r"^(?:repeat|do)\s+(?:this|that|it|the\s+following|these\s+steps|the\s+next\s+(?:\w+\s+)?steps?)?\s*"
                      r"(\w+(?:[\s-]\w+)?)\s+times\s*[,:]?\s*(.*)$", s, re.I) or
             re.match(r"^(\w+(?:[\s-]\w+)?)\s+times\s*[,:]\s*(.+)$", s, re.I))
        if m and self.count_of(m.group(1)):
            self.times(self.count_of(m.group(1)), m.group(2), line, out)
            return True
        m = re.match(r"^(?:repeat|do)\s+(this|that|it|these\s+steps|the\s+above|all\s+(?:of\s+)?(?:this|that))\s+"
                     r"(\w+(?:[\s-]\w+)?)(?:\s+times)?(?:\s+more)?$", s, re.I)
        if m and self.count_of(m.group(2)):
            took = self.took_back(out, m.group(1))
            self.times(self.count_of(m.group(2)), "", line, out, took)
            return True
        m = re.match(r"^(.+?)\s+(\w+(?:[\s-]\w+)?)\s+times$", s, re.I) or \
            re.match(r"^(.+?)\s+(once|twice|thrice)$", s, re.I)
        if m and self.count_of(m.group(2)) and self.starts_with_verb(m.group(1)):
            self.times(self.count_of(m.group(2)), m.group(1), line, out)
            return True
        # for i = 1 to 10: ...
        m = re.match(r"^for\s+([A-Za-z_]\w*)\s*=\s*(.+?)\s+to\s+(.+?)(?:\s+step\s+(\S+))?\s*(?:[,:]\s*|\s+(?:do\s+)?)(.*)$", s, re.I)
        if m and self.value(m.group(2)) and self.value(m.group(3)):
            self.counted(m.group(1), m.group(2), m.group(3), m.group(4), m.group(5), line, out)
            return True
        # for each number from 1 to 10, ...  /  count from 10 down to 1 and ...
        m = re.match(r"^(?:for|count(?:\s+(?:up|down))?|go\s+through|loop(?:\s+through)?|run\s+through|with)\s+"
                     r"(?:(?:each|every|all(?:\s+the)?)\s+)?(?:(.+?)\s+)?from\s+(.+?)\s+"
                     r"(?:(?:up\s+|down\s+)?to|through|until|till)\s+(.+?)"
                     r"(?:\s+(?:in\s+steps\s+of|stepping\s+by|going\s+(?:up|down)\s+(?:by|in)|counting\s+by|by)\s+(\S+))?"
                     r"(?:\s*[,:]\s*|\s+(?:and\s+|then\s+)+|$)(.*)$", s, re.I)
        if m and self.bound(m.group(2)) and self.bound(m.group(3)):
            self.counted(m.group(1) or "", m.group(2), m.group(3), m.group(4), m.group(5), line, out)
            return True
        # for each item in the list, ...
        m = re.match(r"^for\s+(?:each|every)\s+(\w+)\s+in\s+(.+?)\s*[,:]\s*(.*)$", s, re.I)
        if m:
            step = Step("each", line, name=self.meet(self.name_of(m.group(1)) or m.group(1)),
                        over=self.value(m.group(2)) or m.group(2))
            self.sentence(m.group(3), line, step.body)
            out.append(step)
            return True
        # while ...: ...
        m = re.match(r"^(?:while|as\s+long\s+as|so\s+long\s+as)\s+(.+)$", s, re.I)
        if m:
            cond_text, body_text, _ = self.split_if(m.group(1))
            step = Step("while", line, cond=self.test(cond_text) or self.said_test(cond_text))
            self.sentence(body_text, line, step.body)
            out.append(step)
            return True
        # until ..., keep ...
        m = re.match(r"^(?:until|till)\s+(.+?)\s*[,:]\s*(?:keep\s+(?:on\s+)?)?(.+)$", s, re.I)
        if m:
            self.until(m.group(2), m.group(1), True, line, out)
            return True
        # keep asking until ..., repeat ... while ...
        m = re.match(r"^(?:keep(?:\s+on)?|continue|carry\s+on|go\s+on|repeat|do)\s+(.+?)\s+"
                     r"(until|till|while|as\s+long\s+as|so\s+long\s+as)\s+(.+)$", s, re.I)
        if m and not re.match(r"^(?:this|that|it|these\s+steps|the\s+above|all\s+(?:of\s+)?(?:this|that))$", m.group(1), re.I):
            self.until(m.group(1), m.group(3), m.group(2).lower() in ("until", "till"), line, out)
            return True
        # repeat until ..., with the steps before it going round
        m = re.match(r"^(?:repeat|do|keep\s+going|keep\s+doing|go\s+back)\s*"
                     r"(this|that|it|these\s+steps|the\s+above|all\s+(?:of\s+)?(?:this|that)|everything|"
                     r"the\s+steps(?:\s+above)?)?\s*(?:again\s+)?(until|till|while|as\s+long\s+as)\s+(.+)$", s, re.I)
        if m:
            took = self.took_back(out, m.group(1) or "")
            self.until("", m.group(3), m.group(2).lower() in ("until", "till"), line, out, took)
            return True
        # ask for a number until ...
        m = re.match(r"^(.+?)\s+(?:until|till)\s+(.+)$", s, re.I)
        if m and self.starts_with_verb(m.group(1)) and base(self.plain(m.group(1)).split()[0]) not in WAITING:
            self.until(m.group(1), m.group(2), True, line, out)
            return True
        return False

    def bound(self, text):
        """Where a count starts or stops: a number, a sum, a name met -- or
        one word, which is a name about to be (to n)."""
        got = self.value(text, make=False)
        if got is None and re.match(r"^[A-Za-z_]\w*$", text.strip()):
            got = self.meet(self.name_of(text) or text.strip(), "int")
        return got

    # ---- pseudocode said loosely -------------------------------------------
    def opener(self, text, line, out, extra=0):
        """A line that opens a block the text closes itself -- "If the score
        is over 90 then", with its own End If further down -- put right as
        the opening line it is, rather than read as a sentence complete in
        itself (which would close the block a second time)."""
        s = text.strip().rstrip(".")
        closers = self.closers

        def put(said):
            out.append(Step("raw", line, text=said, extra=extra))

        def inside(words):              # what the same line goes on to do, under it
            nest = Step("nest", line, extra=extra)
            self.sentence(words, line, nest.body)
            out.append(nest)

        m = re.match(r"^(?:else\s*if|elseif|elif|otherwise\s*,?\s*if)\s+(.+)$", s, re.I)
        if m and "if" in closers:
            cond_text, inline = self.cut_then(m.group(1))
            put("Else If %s Then" % (self.test(cond_text) or self.said_test(cond_text)))
            if inline:
                inside(inline)
            return True
        m = re.match(r"^if\s+(.+)$", s, re.I)
        if m and "if" in closers:
            cond_text, inline = self.cut_then(m.group(1))
            put("If %s Then" % (self.test(cond_text) or self.said_test(cond_text)))
            if inline:
                inside(inline)
            return True
        m = re.match(r"^(?:else|otherwise)\b\s*[,:]?\s*(.*)$", s, re.I)
        if m and "if" in closers:
            put("Else")
            if m.group(1):
                inside(m.group(1))
            return True
        m = re.match(r"^(?:while|as\s+long\s+as)\s+(.+?)(?:\s+do)?\s*[:,]?$", s, re.I)
        if m and "while" in closers:
            put("While %s" % (self.test(m.group(1)) or self.said_test(m.group(1))))
            return True
        m = re.match(r"^(until|loop\s+until|loop\s+while)\s+(.+)$", s, re.I)
        if m and "do" in closers:
            word = "Until" if m.group(1).lower() == "until" else m.group(1).title()
            put("%s %s" % (word, self.test(m.group(2)) or self.said_test(m.group(2))))
            return True
        if re.match(r"^for\b", s, re.I) and "for" in closers:
            held = []
            if self.loop(s.rstrip(":,"), line, held) and len(held) == 1 and held[0].kind == "for" \
                    and not held[0].body:
                st = held[0]
                put("For %s = %s To %s%s" % (st.name, st.start, st.stop,
                                            " Step %s" % st.step if st.step else ""))
                return True
        return False

    def cut_then(self, text):
        """"x is big then say so" -> ("x is big", "say so")."""
        halves = re.split(r"\s+then\b\s*,?\s*", text, 1, flags=re.I)
        if len(halves) == 2:
            return halves[0], halves[1].strip()
        cond_text, inline, _ = self.split_if(text.rstrip(":"))
        return cond_text, inline

    def count_of(self, text):
        t = text.strip().lower()
        if t in COUNTS:
            return str(COUNTS[t])
        n = number_of(t)
        if n is not None:
            return figure(n)
        name = self.name_of(t, make=False)
        return name

    def counter(self):
        for name in ("i", "j", "k"):
            if name not in self.kinds or name in self.counters:
                return self.meet(name, "int", counter=True)
        return self.meet("counter", "int", counter=True)

    def times(self, count, body_text, line, out, took=None):
        step = Step("for", line, name=self.counter(), start="1", stop=count, step=None)
        step.body = took or []
        if body_text:
            self.sentence(body_text, line, step.body)
        out.append(step)

    def counted(self, name_text, start, stop, by, body_text, line, out):
        # the ends first: "count from 1 to the number" counts up to a number
        # that is already there, and must not count with it
        a, b = self.value(start), self.value(stop)
        ends = set(re.findall(r"[A-Za-z_]\w*", (a or "") + " " + (b or "")))
        known = set(self.kinds)
        name = self.name_of(name_text) if name_text.strip() else None
        if name and name not in known:
            self.counters.add(name)          # met first as this loop's counter
        if not name and "number" not in self.kinds:
            name = self.meet("number", "int", counter=True)
        if not name or name in ends or (name in self.kinds and name not in self.counters
                                        and not name_text.strip()):
            name = self.counter()
        self.meet(name, "int", counter=name not in self.kinds or name in self.counters)
        step_by = self.value(by) if by else None
        try:
            if step_by is None and float(a) > float(b):
                step_by = "-1"
        except (TypeError, ValueError):
            pass
        if step_by and step_by != "-1":
            try:
                if float(a) > float(b) and not step_by.startswith("-"):
                    step_by = "-" + step_by
            except (TypeError, ValueError):
                pass
        step = Step("for", line, name=name, start=a, stop=b, step=step_by)
        self.last = name
        if body_text:
            self.sentence(body_text, line, step.body)
        out.append(step)

    def until(self, body_text, cond_text, until, line, out, took=None):
        step = Step("do", line, until=until)
        step.body = took or []
        # "... until it is 0, adding each one to the total": what is said
        # after the test is done every time round as well
        more = re.match(r"^(.+?)\s*,\s*(?:and\s+)?((\w+ing)\b.*)$", cond_text, re.I)
        extra = ""
        if more and base(more.group(3)):
            cond_text, extra = more.group(1), more.group(2)
        if body_text:
            self.sentence(body_text, line, step.body)
        if extra:
            self.sentence(extra, line, step.body)
        step.cond = self.test(cond_text) or self.said_test(cond_text)
        out.append(step)

    def took_back(self, out, which):
        """The steps a "repeat this" goes back over, taken off `out`: the last
        one for "this"; everything since the paragraph began for "these
        steps"; and otherwise back to the last question asked, which is
        where a loop that goes round again nearly always starts."""
        if self.heading:
            return []                       # its body is the lines under it
        w = (which or "").lower().strip()
        at = len(out) - 1
        if w in ("these steps", "the above", "everything", "the steps", "the steps above") or \
                w.startswith("all"):
            at = self.mark
        elif not w:
            asks = [i for i, st in enumerate(out) if st.kind == "input" and i >= self.mark]
            at = asks[-1] if asks else len(out) - 1
            # the question's own prompt goes round with it
            if at > 0 and out[at - 1].kind == "display" and out[at].kind == "input":
                at -= 1
        at = max(0, min(at, len(out)))
        took = out[at:]
        del out[at:]
        return took

    # ---- steps -------------------------------------------------------------
    def clauses(self, text, line, out):
        """A sentence that is a run of steps: "ask for a number and add it
        to the total, then print it"."""
        bits = self.split_clauses(text)
        if len(bits) == 1:
            self.action(bits[0], line, out)
            return
        for bit in bits:
            self.sentence(bit, line, out)

    def split_clauses(self, text):
        toks = re.findall(r'"[^"]*"|[\w\'-]+|[,;:]', text)
        if not toks:
            return []
        # "by multiplying by 9, dividing by 5 and adding 32" is one step said
        # in three parts; "adding it to the total and printing it" is two
        chained = re.search(r"\bby\s+\w+ing\b", text, re.I)
        cuts = []
        for i in range(1, len(toks)):
            w = toks[i].lower()
            prev = toks[i - 1].lower()
            if prev not in (",", ";", "and", "then"):
                continue
            if w in ("and", "then", ","):
                continue
            if chained and w.endswith("ing") and w not in TURNS:
                continue
            nxt = toks[i + 1].lower() if i + 1 < len(toks) else ""
            verb = base(w)
            if w in TURNS or (verb and (nxt and nxt not in (",", "and") or w in ALONE)):
                start = i
                while start > 0 and toks[start - 1].lower() in (",", ";", "and", "then"):
                    start -= 1
                cuts.append((start, i))
        if not cuts:
            return [text]
        out, begin = [], 0
        for start, at in cuts:
            out.append(" ".join(toks[begin:start]))
            begin = at
        out.append(" ".join(toks[begin:]))
        return [re.sub(r"\s+([,;:])", r"\1", b).strip(" ,;") for b in out if b.strip(" ,;")]

    def action(self, text, line, out):
        """One step: asking, telling, setting, adding ...  Or, when it is none
        the reading knows, the words themselves as a step."""
        t = self.plain(text)
        if not t:
            return
        # the user does it: "the user enters their age", "they type a number"
        m = re.match(r"^(?:the\s+)?(?:user|person|player|customer|student|they|he|she)\s+"
                     r"(?:will\s+|should\s+|must\s+|can\s+|then\s+)?"
                     r"(?:enters?|types?(?:\s+in)?|inputs?|gives?|chooses?|picks?|provides?|selects?|"
                     r"answers?|says?|writes?)\s+(.+)$", t, re.I)
        if m and self.ask(m.group(1), line, out, "enter"):
            return
        words = t.split(None, 1)
        verb, rest = base(words[0]), (words[1] if len(words) > 1 else "")
        # take 10 percent off, take away 5 from the total
        m = re.match(r"^take\s+(?:away\s+|off\s+)?(.+?)(?:\s+(?:off|away))?(?:\s+(?:from|of)\s+(.+))?$", t, re.I)
        if m and verb == "take" and not re.match(r"^take\s+in\b", t, re.I) and \
                (re.search(r"\b(?:off|away)\b", t, re.I)):
            target = self.name_of(m.group(2)) if m.group(2) else self.last
            amount = self.amount(m.group(1), target)
            if target and amount:
                self.set_step(target, target + " - " + self.held(amount), line, out)
                return
        # convert it to Fahrenheit by multiplying by 9, dividing by 5 and adding 32
        m = re.match(r"^(?:convert|turn|change)\s+(.+?)\s+(?:to|into)\s+(.+?)\s+by\s+(.+)$", t, re.I)
        if m:
            start, target = self.value(m.group(1)), self.name_of(m.group(2))
            worked = self.worked(start, m.group(3)) if start else None
            if target and worked:
                self.set_step(target, worked, line, out)
                self.result = target
                return
        if verb == "take" and not re.match(r"^in\b", rest, re.I):
            verb = None                     # take in a number is asking; take a break is not
        done = False
        if verb in ASKING:
            done = self.ask(rest, line, out, verb)
        elif verb in SAYING:
            done = self.say(rest, line, out, verb)
        elif verb in SETTING:
            done = self.set_to(rest, line, out, verb)
        elif verb in SUMS:
            done = self.work(rest, line, out, verb)
        elif verb in ENDING:
            if re.match(r"^(?:the\s+)?(?:program|game|app|code|everything|it|there|here|now)?$", rest, re.I):
                out.append(Step("stop", line))
                done = True
        elif verb in WAITING:
            m = re.match(r"^(?:for\s+)?(.+?)\s*(seconds?|secs?|milliseconds?|ms|minutes?|mins?)?$", rest, re.I)
            if m and self.value(m.group(1), make=False):
                how = self.value(m.group(1), make=False)
                unit = (m.group(2) or "seconds").lower()
                if unit.startswith("min"):
                    how, unit = self.held(how) + " * 60", "seconds"
                out.append(Step("wait", line, value=how,
                                unit="milliseconds" if unit.startswith(("mil", "ms")) else "seconds"))
                done = True
        elif verb in ("call", "run"):
            m = re.match(r"^(?:the\s+)?([A-Za-z_]\w*)(?:\s+(?:module|function|procedure|subroutine))?(?:\s*\(\s*\))?$", rest)
            if m:
                out.append(Step("call", line, name=m.group(1)))
                done = True
        if done:
            return
        # total = total + 1, the total becomes zero, the count goes up by one
        m = re.match(r"^(.+?)\s*(?:=|:=|\bbecomes\b|\bis\s+now\b|\bis\s+set\s+to\b|\bshould\s+be\b)\s*(.+)$", t, re.I)
        if m:
            name, value = self.name_of(m.group(1)), self.value(m.group(2))
            if name and value:
                self.set_step(name, value, line, out)
                return
        m = re.match(r"^(.+?)\s+goes\s+(up|down)(?:\s+by\s+(.+))?$", t, re.I)
        if m and self.name_of(m.group(1)):
            name = self.name_of(m.group(1))
            by = self.value(m.group(3)) if m.group(3) else "1"
            if by:
                self.set_step(name, name + (" + " if m.group(2).lower() == "up" else " - ") + self.held(by), line, out)
                return
        out.append(Step("text", line, text=self.as_step(t)))

    def as_step(self, text):
        """Words that could not be made into anything else, fit to stand as a
        step of their own: nothing in them the pseudocode reads as more."""
        t = re.sub(r"\s+", " ", text).strip(" ,;:.")
        if t.count('"') % 2:
            t = t.replace('"', "")
        # (a web address keeps its two slashes: https://...)
        t = re.sub(r"(?<![A-Za-z]:)//", "/", t.replace("#", "number "))
        t = re.sub(r"(?:\s*[-+*/=&(,]|\s+(?:and|or))+$", "", t, flags=re.I).strip()
        t = t[:1].upper() + t[1:]
        first = t.split(None, 1)[0].lower() if t else ""
        if first in KEPT or first in ("get", "read", "enter", "prompt", "accept", "scan",
                                      "write", "echo", "puts", "sleep", "pause", "delay",
                                      "const", "begin", "main", "halt", "exit", "else",
                                      "otherwise", "elif", "elseif", "wend", "done", "fi",
                                      "od", "sub", "procedure", "def", "method", "switch",
                                      "default", "loop"):
            t = "Step: " + t
        if re.match(r"^[A-Za-z_]\w*\s*(?:=|:=|<-|\()", t):
            t = "Step: " + t
        return t or "Step"

    # ---- asking ------------------------------------------------------------
    def ask(self, rest, line, out, verb):
        r = rest.strip()
        target = None
        m = re.search(r"\s*,?\s+(?:and\s+)?(?:then\s+)?(?:store|save|put|keep|record|call)\s+"
                      r"(?:it|this|that|the\s+answer|the\s+result|them|what\s+they\s+(?:type|enter))\s+"
                      r"(?:in(?:to)?|as)\s+(.+)$", r, re.I)
        if m:
            target = self.name_of(m.group(1))
            r = r[:m.start()]
        prompt = None
        q = re.search(r'"([^"]*)"', r)
        if q:
            prompt = q.group(1)
            r = (r[:q.start()] + r[q.end():]).strip(" ,")
        r = re.sub(r"^in\s+", "", r, flags=re.I)
        r = re.sub(r"^(?:the\s+(?:user|person|player|customer|student)|them|him|her|you|everyone)\b\s*",
                   "", r, flags=re.I)
        r = re.sub(r"^(?:for|about)\s+", "", r, flags=re.I)
        m = re.match(r"^to\s+(?:enter|type(?:\s+in)?|input|give(?:\s+you)?|provide|choose|pick|select|"
                     r"say|tell\s+(?:you|us|me|it)|write|put\s+in|key\s+in)\s+(.*)$", r, re.I)
        if m:
            r = m.group(1)
        names = []
        if target:
            names = [target]
        elif re.match(r"^to\s+guess\b", r, re.I):
            names = [self.meet("guess", "int")]
        elif re.match(r"^(?:if|whether)\s+", r, re.I):
            question = said_to_you(re.sub(r"^(?:if|whether)\s+", "", r, flags=re.I))
            question = re.sub(r"^You\b", "Do you", question) if re.match(r"^You\s+(?!are|were|have|can|will)", question) \
                else re.sub(r"^You (are|were|have|can|will)\b", lambda k: k.group(1).title() + " you", question)
            prompt = prompt or question.rstrip("?") + "?"
            names = [self.meet("answer", "text")]
        elif r:
            names = self.several(r)
        if not names and prompt:
            names = [self.from_question(prompt)]
        if not names:
            return False
        for name in names:
            if prompt:
                out.append(Step("display", line, parts=[quote(prompt)]))
            out.append(Step("input", line, name=name))
            self.asked.append(name)
            self.given.add(name)
            self.last = name
        return True

    def from_question(self, question):
        """The name a question is asking for: "What is your name?" -> name."""
        q = question.strip().rstrip("?:. ").lower()
        m = re.match(r"^(?:what|which)\s+(?:is|are|was)\s+(?:your|the)\s+(.+)$", q)
        if m and self.name_of(m.group(1)):
            return self.name_of(m.group(1))
        if re.match(r"^how\s+old", q):
            return self.meet("age", "int")
        m = re.match(r"^how\s+many\s+(\w+)", q)
        if m:
            return self.name_of(m.group(1))
        m = re.match(r"^(?:enter|type|give\s+me|please\s+enter)\s+(?:your|a|an|the)\s+(.+)$", q)
        if m and self.name_of(m.group(1)):
            return self.name_of(m.group(1))
        return self.meet("answer", "text")

    # ---- telling -----------------------------------------------------------
    def say(self, rest, line, out, verb):
        r = rest.strip()
        parts = None
        if verb == "greet":
            parts = ['"Hello, "', "name"] if "name" in self.kinds else ['"Hello"']
        elif verb == "thank":
            parts = ['"Thank you"']
        elif verb == "congratulate":
            parts = ['"Congratulations!"']
        elif verb == "welcome":
            parts = self.message(r) if '"' in r else ['"Welcome"']
        elif verb == "let":
            m = re.match(r"^(?:the\s+user|them|him|her|everyone|you)\s+know\s+(?:that\s+)?(.+)$", r, re.I)
            if not m:
                return False
            parts = self.message(m.group(1))
        elif verb == "give":
            m = re.match(r"^(?:the\s+user|them|him|her|everyone)\s+(.+)$", r, re.I)
            if not m:
                return False
            parts = self.message(m.group(1))
        else:
            parts = self.message(r)
        if not parts:
            return False
        out.append(Step("display", line, parts=parts))
        return True

    # ---- setting -----------------------------------------------------------
    def set_step(self, name, value, line, out):
        if name not in self.given and re.search(r"(?<![\w\"])" + re.escape(name) + r"(?![\w\"])", value):
            self.starts[name] = '""' if self.kinds.get(name) == "text" else "0"
        self.given.add(name)
        self.meet(name, self.kind_of(value))
        out.append(Step("set", line, name=name, value=value))
        self.last = name

    def kind_of(self, value):
        """What a sum comes to, as far as can be told."""
        v = value.strip()
        if re.match(r"^-?\d+$", v):
            return "int"
        if re.match(r"^-?\d*\.\d+$", v):
            return "real"
        if v.startswith('"'):
            return "text"
        if v in ("True", "False"):
            return "bool"
        if "/" in v or "sqrt(" in v:
            return "real"
        kinds = set(self.kinds.get(n) for n in re.findall(r"[A-Za-z_]\w*", v) if n in self.kinds)
        kinds.discard(None)
        if "real" in kinds:
            return "real"
        if kinds == {"int"}:
            return "int"
        if kinds == {"text"} and "+" in v:
            return "text"
        return None

    def set_to(self, rest, line, out, verb):
        r = rest.strip()
        if verb == "start":
            m = re.match(r"^(?:off\s+)?(?:by|with)\s+(.+)$", r, re.I)
            if m:
                before = len(out)
                self.sentence(m.group(1), line, out)
                return len(out) > before
            if re.match(r"^(?:the\s+)?(?:program|game|app)?$", r, re.I):
                return True
        if verb == "reset":
            m = re.match(r"^(.+?)(?:\s+(?:back\s+)?to\s+(.+))?$", r, re.I)
            name = self.name_of(m.group(1)) if m else None
            if name:
                value = self.value(m.group(2)) if m.group(2) else \
                    ('""' if self.kinds.get(name) == "text" else "0")
                if value:
                    self.set_step(name, value, line, out)
                    return True
            return False
        if verb == "keep":
            m = re.match(r"^(?:track\s+of|a\s+(?:running\s+)?(?:count|total|tally)\s+of)\s+(.+)$", r, re.I)
            if m and self.name_of(m.group(1)):
                self.set_step(self.name_of(m.group(1)), "0", line, out)
                return True
            return False
        if verb in ("store", "save", "put", "record"):
            m = re.match(r"^(.+?)\s+(?:in|into|as|inside)\s+(.+)$", r, re.I)
            if m:
                value, name = self.value(m.group(1)), self.name_of(m.group(2))
                if value and name:
                    self.set_step(name, value, line, out)
                    return True
            return False
        if verb == "assign":
            m = re.match(r"^(.+?)\s+to\s+(.+)$", r, re.I)
            if m:
                value, name = self.value(m.group(1)), self.name_of(m.group(2))
                if value and name:
                    self.set_step(name, value, line, out)
                    return True
            return False
        # set the total to 0 (and the count to 0)
        done = False
        for bit in re.split(r"\s*,\s*(?:and\s+)?|\s+and\s+(?=\S+(?:\s+\S+){0,2}\s+(?:to|as|=)\s)", r):
            m = re.match(r"^(.+?)\s+(?:to\s+be|to|as|equal\s+to|equals?|=|at|with\s+(?:a\s+)?value\s+of|be)\s+(.+)$",
                         bit, re.I) or re.match(r"^(.+?)\s*=\s*(.+)$", bit)
            if not m:
                return done
            name, value = self.name_of(m.group(1)), self.value(m.group(2))
            if not (name and value):
                return done
            self.set_step(name, value, line, out)
            done = True
        return done

    # ---- working things out ------------------------------------------------
    def amount(self, text, target):
        """How much to add or take off: a number, a name, or "10 percent" of
        what it is being added to or taken from."""
        m = re.match(r"^(.+?)\s*(?:percent|per\s+cent|%)$", text.strip(), re.I)
        if m and target and self.value(m.group(1)):
            return target + " * " + self.held(self.value(m.group(1))) + " / 100"
        return self.value(text)

    def worked(self, start, ops):
        """A value put through a run of sums in words, one after another:
        "multiplying by 9, dividing by 5 and adding 32"."""
        out = start
        for bit in re.split(r"\s*,\s*(?:and\s+)?(?:then\s+)?|\s+and\s+(?:then\s+)?|\s+then\s+", ops.strip()):
            m = re.match(r"^(multiplying|dividing|adding|subtracting|taking\s+away)\s+(?:it\s+)?"
                         r"(?:by|to|from|on)?\s*(.+)$", bit.strip(), re.I)
            if not m or not self.value(m.group(2)):
                return None
            how, v = m.group(1).lower(), self.value(m.group(2))
            op = {"multiplying": "*", "dividing": "/", "adding": "+"}.get(how, "-")
            out = (self.held(out) if op in "*/" else out) + " " + op + " " + \
                (self.held(v) if op in "*/-" else v)
        return out

    def pair(self, text):
        """"them", "both numbers", "the two numbers": the last two asked for."""
        if re.match(r"^(?:them|both|both\s+(?:of\s+them|numbers)|the\s+(?:two\s+)?numbers|"
                     r"the\s+two|these|those|all\s+of\s+them|the\s+two\s+values)$", text.strip(), re.I):
            if len(self.asked) >= 2:
                return list(self.asked[-2:])
        return None

    def work(self, rest, line, out, verb):
        r = re.sub(r"\s+", " ", rest.strip())
        low = r.lower()
        # ... and call it / to get / giving the sum
        into, m = None, re.match(r"^(.+?)\s*,?\s*(?:and\s+)?(?:(?:call|store|save|put|keep)\s+(?:it|the\s+(?:result|answer|sum|total|product))\s+"
                                 r"(?:as|in|into)|to\s+(?:get|make|find|give|work\s+out)|giving|into|as)\s+(.+)$", r, re.I)
        if m and verb in ("add", "multiply", "subtract", "divide"):
            r, into = m.group(1), self.name_of(m.group(2))
            low = r.lower()
        r = re.sub(r"\s+(?:together|up)$", "", r, flags=re.I)
        r = re.sub(r"^(?:up|together)\s+", "", r, flags=re.I)
        if verb in ("add", "multiply", "subtract", "divide"):
            both = self.pair(r)
            op = {"add": "+", "multiply": "*", "subtract": "-", "divide": "/"}[verb]
            named = {"add": "sum", "multiply": "product", "subtract": "difference", "divide": "quotient"}[verb]
            m = re.match(r"^(.+?)\s+(to|from|by|into)\s+(.+)$", r, re.I)
            if m and not both and into is None:
                word = m.group(2).lower()
                # what is added is read before what it is added to, so "it"
                # and "each one" are still what they were before the total
                percent = re.search(r"(?:percent|per\s+cent|%)\s*$", m.group(1), re.I)
                a = None if percent else self.value(m.group(1))
                b = self.name_of(m.group(3))
                if percent:
                    a = self.amount(m.group(1), b)
                if a and b and ((verb == "add" and word == "to") or (verb == "subtract" and word == "from") or
                                (verb in ("multiply", "divide") and word == "by")):
                    if verb in ("multiply", "divide"):
                        # multiply the price by 2: the price is what changes
                        target, by = self.name_of(m.group(1)), self.value(m.group(3))
                        if target and by:
                            self.set_step(target, target + " " + op + " " + self.held(by), line, out)
                            return True
                        return False
                    self.set_step(b, b + " " + op + " " + (self.held(a) if op == "-" else a), line, out)
                    # "add each number to the total and print it": it is
                    # still the number
                    if re.match(r"^[A-Za-z_]\w*$", a) and a in self.kinds:
                        self.last = a
                    return True
            if not both:
                bits = [x for x in re.split(r"\s*,\s*(?:and\s+)?|\s+and\s+", r) if x.strip()]
                if len(bits) >= 2:
                    both = [self.value(x) for x in bits]
                    if not all(both):
                        return False
            if both:
                target = into or self.meet(named)
                joined = (" " + op + " ").join(self.held(x) if op != "+" else x for x in both)
                self.set_step(target, joined, line, out)
                self.result = target
                return True
            return False
        if verb in ("increase", "increment", "raise", "decrease", "decrement", "reduce", "lower"):
            m = re.match(r"^(.+?)(?:\s+by\s+(.+))?$", r, re.I)
            name = self.name_of(m.group(1)) if m else None
            by = self.value(m.group(2)) if m and m.group(2) else "1"
            if name and by:
                self.meet(name, "int" if by.isdigit() else None)
                up = verb in ("increase", "increment", "raise")
                self.set_step(name, name + (" + " if up else " - ") + self.held(by), line, out)
                return True
            return False
        if verb in ("double", "halve", "square"):
            name = self.name_of(r)
            if name:
                self.set_step(name, name + {"double": " * 2", "halve": " / 2", "square": " ^ 2"}[verb], line, out)
                return True
            return False
        if verb == "count":
            if re.match(r"^(?:it|one|them|this|that|each\s+one|up|the\s+\w+)?$", low):
                name = "count" if "count" in self.kinds or not re.match(r"^the\s+\w+$", low) else \
                    (self.name_of(low) or "count")
                self.meet(name, "int")
                self.set_step(name, name + " + 1", line, out)
                return True
            return False
        if verb == "swap":
            m = re.match(r"^(.+?)\s+(?:and|with)\s+(.+)$", r, re.I)
            if m and self.name_of(m.group(1)) and self.name_of(m.group(2)):
                a, b = self.name_of(m.group(1)), self.name_of(m.group(2))
                self.set_step(self.meet("temp", self.kinds.get(a)), a, line, out)
                self.set_step(a, b, line, out)
                self.set_step(b, "temp", line, out)
                return True
            return False
        # calculate / compute / work out / find / figure out / determine
        r = re.sub(r"^out\s+", "", r, flags=re.I)
        m = re.match(r"^(.+?)\s*(?:\bas\b|\bby\b|\busing\b|=|:|\bto\s+be\b|,?\s*which\s+is\b|\bfrom\b|\bwith\b)\s*(.+)$", r, re.I)
        if m and self.name_of(m.group(1)):
            how = m.group(2)
            if re.match(r"^(?:adding|subtracting|multiplying|dividing|taking)", how, re.I):
                value = self.value(how)
            else:
                value = self.value(how)
            if value:
                target = self.name_of(m.group(1))
                self.set_step(target, value, line, out)
                self.result = target
                return True
        value = self.value(r) if re.search(r"\b(?:of|between|plus|minus|times|divided)\b", r, re.I) else None
        if value and not re.match(r"^[A-Za-z_]\w*$", value):
            head = re.match(r"^(?:the\s+)?(\w+)", r)
            target = self.name_of(head.group(1)) if head else self.meet("result")
            self.set_step(target, value, line, out)
            self.result = target
            return True
        if re.match(r"^(?:the\s+)?(?:average|mean)$", low) and "total" in self.kinds and "count" in self.kinds:
            target = self.meet("average", "real")
            self.set_step(target, "total / count", line, out)
            self.result = target
            return True
        return False

    # ==================================================== whole lines ==
    def raw(self, text, line, out, extra=0):
        """A line that was pseudocode already: kept word for word, and the
        names in it noted, so the story can go on to talk about them."""
        m = R_DECL_ONE.match(text)
        if m:
            name = m.group(3)
            self.declared.add(name)
            kind = {"integer": "int", "int": "int", "real": "real", "float": "real",
                    "double": "real", "number": "real", "currency": "real", "money": "real",
                    "decimal": "real", "string": "text", "char": "text",
                    "boolean": "bool", "bool": "bool"}.get((m.group(2) or "").lower())
            self.meet(name, kind)
        else:
            m = R_SET.match(text)
            if m and re.match(r"^[A-Za-z_]\w*$", m.group(1).strip()):
                name = m.group(1).strip()
                self.meet(name, self.kind_of(m.group(2)))
            m = re.match(r"^(?:input|read|get)\s+([A-Za-z_][\w\s,]*)$", text, re.I)
            if m:
                for name in re.split(r"\s*,\s*", m.group(1).strip()):
                    if re.match(r"^[A-Za-z_]\w*$", name):
                        self.meet(name)
                        self.asked.append(name)
            m = re.match(r"^for\s+([A-Za-z_]\w*)\s*=", text, re.I)
            if m:
                self.meet(m.group(1), "int", counter=True)
        out.append(Step("raw", line, text=text, extra=extra))

    def header(self, text, line, out, body):
        """A line with lines indented under it: "Repeat 5 times:", "If the
        number is even:", "Otherwise:" -- and those lines are what it does."""
        said = text.strip().rstrip(":").strip()
        before = len(out)
        last_if = self.open_if(out)
        self.heading = True
        try:
            for one in sentences(said):
                self.sentence(one, line, out)
        finally:
            self.heading = False
        new = out[before:]
        if not new and last_if is not None and R_OTHERWISE.match(self.plain(said)):
            last_if.orelse = body
            if len(body) == 1 and body[0].kind == "if":
                body[0].chained = True
            return
        if len(new) == 1:
            st = new[0]
            if st.kind == "if" and not st.then:
                st.then = body
                return
            if st.kind in ("while", "do", "for", "each") and not st.body:
                st.body = body
                return
        out.extend(body)


# Said before a step, and meaning nothing to it.
R_LEADS = re.compile(
    r"^(?:(?:and|then|next|so|now|after\s+that|afterwards|afterward|finally|lastly|"
    r"first(?:ly)?|second(?:ly)?|third(?:ly)?|to\s+start(?:\s+with)?|to\s+begin(?:\s+with)?|"
    r"to\s+finish|at\s+the\s+(?:start|end|beginning)|in\s+the\s+end|once\s+(?:that\s+is|that's)\s+done|"
    r"when\s+(?:that|this|it|the\s+loop|they|you)\s+(?:is\s+|are\s+)?(?:done|finished|over|complete|ends?)|"
    r"once\s+(?:the\s+loop|it|they|you)\s+(?:is\s+|are\s+)?(?:done|finished|over|ends?)|"
    r"after\s+the\s+loop|also|please|step\s+\d+|the\s+program\s+starts\s+by)"
    r"(?:\s*[,:]\s*|\s+))+", re.I)
SUBJECTS = (r"(?:the\s+(?:program|computer|system|code|app|application|machine|script|"
            r"algorithm)|it|we|you|i|this)")
MODALS = (r"(?:(?:will|should|must|shall|can|could|would|may|then|also|now|first|finally|"
          r"next|just)\s+|(?:needs?|has|have|is\s+going|wants?|is\s+supposed|are\s+going)\s+to\s+)*")
R_OTHERWISE = re.compile(
    r"^(?:otherwise|else|or\s+else|if\s+not(?=\s*(?:,|$))|if\s+(?:that\s+is|that's|it\s+is|it's)\s+not\s+"
    r"(?:so|the\s+case|true)|in\s+any\s+other\s+case|if\s+(?:they|it)\s+(?:are|is|do|does)\s*n[o']t)"
    r"\b\s*[,:]?\s*(.*)$", re.I)
# Words a verb after them belongs to, not starts a step: "if they enter
# zero, stop" decides on what they entered.
HOLDS = {"they", "you", "we", "i", "he", "she", "it", "user", "player", "person",
         "to", "not", "will", "can", "should", "must", "does", "do", "did", "would",
         "could", "please", "customer", "student"}
