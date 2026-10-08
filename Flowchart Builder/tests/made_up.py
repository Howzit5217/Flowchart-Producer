"""Pseudocode programs made up at random, from plain to insane, that always end.

    made_up.program(seed, level) -> (text, typed, style)     level 0 to 5
    made_up.big_program(seed)    -> (text, typed, style)     past 32-bit ints

Run by tests/thousands.py (as many as you like, in every language) and by a
check in tests/run.py (a few of each level, every time).

Every program is made as a little tree first and then written out in one of
several styles (the textbook's, lower case, other closers, ...), so that the
same program read in different styles has to run the same.

What keeps them safe to run in every language:
  - whole numbers stay small: any sum that could grow past BOUND is taken
    MOD BOUND before it is kept, so nothing ever overflows a 32-bit int --
    except in big_program, whose numbers are meant to (and stay under 2^53,
    where the runner's numbers are still exact);
  - Reals are kept within a million, so nothing is ever Infinity;
  - nothing is divided by something that can be nought;
  - every loop has a counter that only goes one way, and modules only call
    modules written before them (and themselves, counting down);
  - indexes are counters running over the array, or abs(..) MOD size.
"""
import random

BOUND = 10000
WORDS = ["cat", "dog", "owl", "Fox", "bee", "Ant", "yak", "emu", "Kiwi", "lynx",
         "red", "Blue", "green", "gold", "sky", "sun", "moon", "star", "tree", "rock"]
LETTERS = "abcdefghijklmnopqrstuvwxyz"
TYPE_WORD = {"int": "Integer", "real": "Real", "text": "String", "bool": "Boolean"}


class Var:
    def __init__(self, name, kind, dims=None, const=False, loop=False):
        self.name, self.kind, self.dims, self.const, self.loop = name, kind, dims or [], const, loop


class Mod:
    def __init__(self, name, params, gives):
        self.name, self.params, self.gives = name, params, gives   # params: [(Var, ref)]
        self.body = []
        self.recursive = False


# ---- expressions: (text, kind, bound) -----------------------------------
# text is written in the pseudocode's own words (AND, OR, NOT, MOD, ^).

class Gen:
    def __init__(self, seed, level):
        self.r = random.Random(seed)
        self.level = level
        self.names = set()
        self.mods = []
        self.consts = []
        self.typed = []
        self.counter = 0

    def name(self, stem):
        while True:
            self.counter += 1
            n = "%s%d" % (stem, self.counter)
            if n.lower() not in self.names:
                self.names.add(n.lower())
                return n

    # -- leaves
    def int_lit(self):
        return str(self.r.choice([0, 1, 2, 3, 5, 7, 10, 12, 25, 100] + [self.r.randint(-20, 99)]))

    def real_lit(self):
        v = self.r.choice([0.5, 1.25, 2.5, 3.75, 0.1, 9.99] + [round(self.r.uniform(-50, 200), self.r.choice([1, 2]))])
        s = repr(v)
        return s if "." in s else s + ".0"

    def text_lit(self):
        w = self.r.choice(WORDS)
        if self.r.random() < 0.3:
            w = w + " " + self.r.choice(WORDS)
        if self.r.random() < 0.15:
            w = w + self.r.choice([":", "!", "?", ",", " -", " ="])
        return '"%s"' % w

    def pick_var(self, scope, kind, dims=0, writable=False):
        got = [v for v in scope if v.kind == kind and len(v.dims) == dims and not (writable and (v.const or v.loop))]
        return self.r.choice(got) if got else None

    def index_into(self, scope, arr, depth):
        """An index for each size of arr: a counter running over it where one
        is about, else abs(..) MOD size."""
        out = []
        for size in arr.dims:
            loops = [v for v in scope if v.loop and getattr(v, "over", None) == size]
            if loops and self.r.random() < 0.7:
                out.append(self.r.choice(loops).name)
            elif depth >= 3:
                out.append(str(self.r.randint(0, 50)) + " MOD %s" % size)
            else:
                e = self.int_expr(scope, depth + 1)[0]
                out.append("abs(%s) MOD %s" % (e, size))
        return "%s[%s]" % (arr.name, "][".join(out))

    def int_expr(self, scope, depth=0):
        r = self.r
        if depth >= 3 or r.random() < 0.35 + 0.15 * depth:
            choice = r.random()
            v = self.pick_var(scope, "int")
            arr = self.pick_var(scope, "int", 1) or self.pick_var(scope, "int", 2)
            if choice < 0.45 and v:
                return v.name, "int", BOUND
            if choice < 0.6 and arr:
                return self.index_into(scope, arr, depth), "int", BOUND
            lit = self.int_lit()
            return lit, "int", abs(int(lit))
        kind = r.random()
        a = self.int_expr(scope, depth + 1)
        b = self.int_expr(scope, depth + 1)
        if kind < 0.3:
            return "%s + %s" % (a[0], b[0]), "int", a[2] + b[2]
        if kind < 0.5:
            return "%s - %s" % (a[0], self.paren(b[0])), "int", a[2] + b[2]
        if kind < 0.65 and a[2] * b[2] <= 10 ** 8:
            return "%s * %s" % (self.paren(a[0]), self.paren(b[0])), "int", a[2] * b[2]
        if kind < 0.75:
            return "%s MOD %s" % (self.paren(a[0]), self.nonzero(scope, depth)), "int", a[2]
        if kind < 0.82 and a[2] <= BOUND:
            return "%s ^ 2" % self.atom(a[0]), "int", a[2] * a[2]
        if kind < 0.9:
            f = r.choice(["abs", "max", "min"])
            if f == "abs":
                return "abs(%s)" % a[0], "int", a[2]
            return "%s(%s, %s)" % (f, a[0], b[0]), "int", max(a[2], b[2])
        if self.mods_giving(scope, "int"):
            return self.call_expr(scope, "int", depth)
        return "length(%s)" % self.text_expr(scope, depth + 1)[0], "int", 1000

    def nonzero(self, scope, depth):
        if self.r.random() < 0.5:
            return str(self.r.choice([2, 3, 4, 5, 7, 9, 10]))
        e = self.int_expr(scope, depth + 1)[0]
        return "(abs(%s) MOD 9 + 1)" % e

    def paren(self, s):
        return "(%s)" % s if any(op in s for op in (" + ", " - ", " MOD ", " * ", " / ", " ^ ")) else s

    def atom(self, s):
        return "(%s)" % s if (" " in s or s.startswith("-")) and not (s.endswith(")") and s.count("(") == 1 and s.startswith(("abs(", "max(", "min("))) else s

    def kept(self, e):
        """An int expression that is safe to keep in a variable."""
        text, kind, bound = e
        if kind == "real":            # reals kept within a million, never Infinity
            return "min(max(%s, -1000000), 1000000)" % text if bound > 1e6 else text
        if bound > BOUND:
            return "(%s) MOD %d" % (text, BOUND)
        return text

    def real_expr(self, scope, depth=0):
        r = self.r
        if depth >= 3 or r.random() < 0.4 + 0.15 * depth:
            v = self.pick_var(scope, "real")
            arr = self.pick_var(scope, "real", 1)
            c = r.random()
            if c < 0.4 and v:
                return v.name, "real", 1e6
            if c < 0.55 and arr:
                return self.index_into(scope, arr, depth), "real", 1e6
            if c < 0.7:
                return self.int_expr(scope, depth + 1)[0], "real", 1e6
            return self.real_lit(), "real", 1e3
        a = self.real_expr(scope, depth + 1)
        b = self.real_expr(scope, depth + 1)
        k = r.random()
        if k < 0.3:
            return "%s + %s" % (a[0], b[0]), "real", a[2] + b[2]
        if k < 0.5:
            return "%s - %s" % (a[0], self.paren(b[0])), "real", a[2] + b[2]
        if k < 0.65:
            return "%s * %s" % (self.paren(a[0]), self.paren(b[0])), "real", a[2] * b[2]
        if k < 0.8:
            return "%s / %s" % (self.paren(a[0]), self.nonzero(scope, depth)), "real", a[2]
        if k < 0.88:
            return "sqrt(abs(%s))" % a[0], "real", max(a[2], 1) ** 0.5
        if k < 0.94:
            return "round(%s, %d)" % (a[0], r.choice([0, 1, 2])), "real", a[2] + 1
        if self.mods_giving(scope, "real"):
            return self.call_expr(scope, "real", depth)
        return "abs(%s)" % a[0], "real", a[2]

    def text_expr(self, scope, depth=0):
        r = self.r
        if depth >= 2 or r.random() < 0.45 + 0.2 * depth:
            v = self.pick_var(scope, "text")
            arr = self.pick_var(scope, "text", 1)
            c = r.random()
            if c < 0.45 and v:
                return v.name, "text", 0
            if c < 0.6 and arr:
                return self.index_into(scope, arr, depth), "text", 0
            return self.text_lit(), "text", 0
        k = r.random()
        a = self.text_expr(scope, depth + 1)
        if k < 0.35:
            b = self.text_expr(scope, depth + 1)
            return "%s + %s" % (a[0], b[0]), "text", 0
        if k < 0.5:
            return "%s + %s" % (a[0], self.atom(self.int_expr(scope, depth + 1)[0])), "text", 0
        if k < 0.62:
            return "toUpper(%s)" % a[0], "text", 0
        if k < 0.74:
            return "toLower(%s)" % a[0], "text", 0
        if k < 0.86:
            # a piece of it: from somewhere in it to somewhere after that
            src = a[0]
            return "substring(%s, 0, min(2, length(%s)))" % (src, src), "text", 0
        if self.mods_giving(scope, "text"):
            return self.call_expr(scope, "text", depth)
        return "%s & %s" % (a[0], self.text_lit()), "text", 0

    def bool_expr(self, scope, depth=0):
        r = self.r
        k = r.random()
        if depth >= 2 or k < 0.45:
            c = r.random()
            if c < 0.45:
                a, b = self.int_expr(scope, depth + 1), self.int_expr(scope, depth + 1)
                return "%s %s %s" % (a[0], r.choice(["<", ">", "<=", ">=", "=", "<>", "==", "!="]), b[0]), "bool", 0
            if c < 0.6:
                a, b = self.real_expr(scope, depth + 1), self.real_expr(scope, depth + 1)
                return "%s %s %s" % (a[0], r.choice(["<", ">", "<=", ">="]), b[0]), "bool", 0
            if c < 0.72:
                a, b = self.text_expr(scope, depth + 1), self.text_expr(scope, depth + 1)
                return "%s %s %s" % (a[0], r.choice(["=", "<>", "==", "!=", "<", ">"]), b[0]), "bool", 0
            v = self.pick_var(scope, "bool")
            if c < 0.85 and v:
                return v.name, "bool", 0
            if c < 0.92:
                return "contains(%s, %s)" % (self.text_expr(scope, depth + 1)[0], r.choice(['"a"', '"o"', '"e"', '"x"', '" "'])), "bool", 0
            if self.mods_giving(scope, "bool"):
                return self.call_expr(scope, "bool", depth)
            return r.choice(["True", "False"]), "bool", 0
        a = self.bool_expr(scope, depth + 1)
        if k < 0.65:
            return "%s AND %s" % (self.bparen(a[0]), self.bparen(self.bool_expr(scope, depth + 1)[0])), "bool", 0
        if k < 0.85:
            return "%s OR %s" % (self.bparen(a[0]), self.bparen(self.bool_expr(scope, depth + 1)[0])), "bool", 0
        return "NOT (%s)" % a[0], "bool", 0

    def bparen(self, s):
        return "(%s)" % s if (" AND " in s or " OR " in s) else s

    def expr(self, scope, kind, depth=0):
        if kind == "int":
            return self.int_expr(scope, depth)
        if kind == "real":
            return self.real_expr(scope, depth)
        if kind == "text":
            return self.text_expr(scope, depth)
        return self.bool_expr(scope, depth)

    def mods_giving(self, scope, kind):
        here = getattr(self, "current", None)
        return [m for m in self.mods if m.gives == kind and m is not here and m.done and
                not any(ref or p.dims for p, ref in m.params)]

    def call_expr(self, scope, kind, depth):
        m = self.r.choice(self.mods_giving(scope, kind))
        args = [self.arg_for(scope, p, depth) for p, ref in m.params]
        if m.recursive:                 # counting down from a few, not from thousands
            args[0] = "abs(%s) MOD 8" % self.atom(args[0])
        b = BOUND if kind == "int" else 1e6
        return "%s(%s)" % (m.name, ", ".join(args)), kind, b

    def arg_for(self, scope, p, depth=1):
        if p.kind == "int":
            return self.kept(self.int_expr(scope, depth + 1))
        if p.kind == "real":
            return self.kept(self.real_expr(scope, depth + 1))
        return self.expr(scope, p.kind, depth + 1)[0]


# ---- statements ----------------------------------------------------------
# Each is a tuple the writer below knows: ("set", target, expr), ("show",
# [pieces]), ("if", [(cond, body)], else_body), ("for", var, a, b, step, body),
# ("while", counter, limit, body), ("until", counter, limit, body),
# ("select", subject, [(values, body)], default), ("call", mod, args),
# ("return", expr), ("input", target), ("each", var, array, body)

class Program(Gen):
    def build(self):
        r, lv = self.r, self.level
        # constants
        for _ in range(r.randint(0, 1 + lv)):
            n = self.name("LIMIT" if r.random() < 0.5 else "SIZE").upper()
            self.consts.append(Var(n, "int", const=True))
            self.consts[-1].value = r.randint(2, 6 if lv < 4 else 8)
        self.sizes = [c for c in self.consts]
        shared = list(self.consts)
        # modules, each only calling the ones before it
        for _ in range(r.randint(0 if lv < 2 else 1, [0, 1, 3, 4, 6, 10][lv])):
            self.mods.append(self.module(shared))
        self.current = None
        main_scope = list(shared)
        body = self.declare_some(main_scope, lv + 2)
        body += self.block(main_scope, depth=0, budget=[6, 10, 16, 24, 36, 60][lv])
        self.main = body
        return self

    def declare_some(self, scope, how_many):
        r = self.r
        out = []
        for _ in range(how_many):
            kind = r.choice(["int", "int", "real", "text", "bool"])
            dims = []
            if self.level >= 2 and r.random() < 0.3:
                dims = [self.size()]
                if self.level >= 3 and r.random() < 0.25 and kind in ("int", "real"):
                    dims.append(self.size())
            v = Var(self.name(kind[0] if kind != "bool" else "flag"), kind, dims)
            init = None
            if not dims:
                init = self.first_value(scope, kind)
            elif len(dims) == 1 and r.random() < 0.5 and isinstance(dims[0], int):
                init = [self.first_value(scope, kind, plain=True) for _ in range(dims[0])]
            out.append(("declare", v, init))
            scope.append(v)
            if dims:
                out += self.fill(scope, v)
        return out

    def size(self):
        if self.consts and self.r.random() < 0.6:
            c = self.r.choice(self.consts)
            return c.name
        return self.r.randint(2, 5)

    def size_value(self, size):
        if isinstance(size, int):
            return size
        return [c for c in self.consts if c.name == size][0].value

    def first_value(self, scope, kind, plain=False):
        if plain or self.r.random() < 0.5:
            return {"int": self.int_lit, "real": self.real_lit, "text": self.text_lit,
                    "bool": lambda: self.r.choice(["True", "False"])}[kind]()
        e = self.expr(scope, kind)
        return self.kept(e) if kind in ("int", "real") else e[0]

    def fill(self, scope, arr):
        """For each place in it, something put there."""
        counters = []
        body = None
        for size in reversed(arr.dims):
            i = Var(self.name("i"), "int", loop=True)
            i.over = size
            counters.insert(0, (i, size))
        inner_scope = scope + [c for c, _ in counters]
        put = ("set", "%s[%s]" % (arr.name, "][".join(c.name for c, _ in counters)),
               self.kept(self.expr(inner_scope, arr.kind)) if arr.kind in ("int", "real")
               else self.expr(inner_scope, arr.kind)[0])
        body = [put]
        for c, size in reversed(counters):
            body = [("for", c, "0", "%s - 1" % size, None, body)]
        return body

    def module(self, shared):
        r = self.r
        gives = r.choice([None, None, "int", "real", "text", "bool"])
        params = []
        for _ in range(r.randint(0, 3)):
            kind = r.choice(["int", "int", "real", "text", "bool"])
            p = Var(self.name("p"), kind)
            ref = gives is None and self.level >= 2 and r.random() < 0.3 and kind != "bool"
            params.append((p, ref))
        if self.level >= 2 and r.random() < 0.25 and not gives:
            arr = Var(self.name("arr"), r.choice(["int", "real", "text"]), [self.size()])
            params.append((arr, False))
        m = Mod(self.name("Calc" if gives else "show"), params, gives)
        m.done = False
        self.current = m
        scope = list(shared) + [p for p, _ in params]
        body = self.declare_some(scope, r.randint(0, 2))
        if gives == "int" and self.level >= 3 and r.random() < 0.4 and params and params[0][0].kind == "int":
            # counting down to nought, and no further
            n = params[0][0]
            m.recursive = True
            others = [self.arg_for(scope, p) for p, _ in params[1:]]
            body.append(("if", [("%s <= 0" % n.name, [("return", self.int_lit())])],
                         [("return", "(%s + %s(%s)) MOD %d" % (self.int_expr(scope, 1)[0], m.name,
                                                               ", ".join(["%s - 1" % n.name] + others), BOUND))]))
        else:
            body += self.block(scope, depth=1, budget=r.randint(2, 4 + self.level * 2), mod=m)
            if gives:
                body.append(("return", self.kept(self.expr(scope, gives)) if gives in ("int", "real") else self.expr(scope, gives)[0]))
        m.body = body
        m.done = True
        return m

    def block(self, scope, depth, budget, mod=None):
        out = []
        r = self.r
        while budget > 0:
            budget -= 1
            out.append(self.statement(scope, depth, mod))
            if r.random() < 0.1:
                break
        return [s for s in out if s]

    def statement(self, scope, depth, mod):
        r = self.r
        deep_ok = depth < [2, 3, 3, 4, 5, 7][self.level]
        k = r.random()
        if k < 0.22:
            return self.set_one(scope)
        if k < 0.42:
            return self.show(scope)
        if k < 0.55 and deep_ok:
            return self.if_one(scope, depth, mod)
        if k < 0.66 and deep_ok:
            return self.for_one(scope, depth, mod)
        if k < 0.72 and deep_ok:
            return self.while_one(scope, depth, mod)
        if k < 0.77 and deep_ok:
            return self.select_one(scope, depth, mod)
        if k < 0.85:
            return self.call_one(scope)
        if k < 0.9 and deep_ok:
            return self.each_one(scope, depth, mod)
        if k < 0.94 and self.level >= 1 and not mod and depth == 0:
            return self.input_one(scope)
        return self.set_one(scope)

    def set_one(self, scope):
        r = self.r
        targets = [v for v in scope if not v.const and not v.loop]
        if not targets:
            return self.show(scope)
        v = r.choice(targets)
        if v.dims:
            target = self.index_into(scope, v, 1)
        else:
            target = v.name
        if v.kind == "int":
            if r.random() < 0.25:
                # a whole number divided, kept whole
                e = "%s / %s" % (self.paren(self.kept(self.int_expr(scope, 1))), self.nonzero(scope, 1))
                return ("set", target, e)
            if r.random() < 0.2:
                return ("set", target, "(%s + %s) MOD %d" % (target, self.int_expr(scope, 2)[0], BOUND))
            return ("set", target, self.kept(self.int_expr(scope)))
        if v.kind == "text" and r.random() < 0.25:
            return ("set", target, "%s + %s" % (target, self.text_lit()) if r.random() < 0.6 else
                    "substring(%s + %s, 0, 12)" % (target, self.text_lit()))
        e = self.kept(self.expr(scope, v.kind)) if v.kind == "real" else self.expr(scope, v.kind)[0]
        if v.kind == "text" and v.name in e:      # words grown from themselves stay short
            e = "substring(%s, 0, 30)" % e
        return ("set", target, e)

    def show(self, scope):
        r = self.r
        parts = []
        for _ in range(r.randint(1, 4)):
            c = r.random()
            if c < 0.4:
                parts.append(self.text_lit())
            else:
                kind = r.choice(["int", "int", "real", "text", "bool"])
                if parts and not parts[-1].startswith('"'):
                    parts.append('" "')
                parts.append(self.expr(scope, kind)[0])
        return ("show", parts)

    def if_one(self, scope, depth, mod):
        r = self.r
        arms = [(self.bool_expr(scope)[0], self.block(scope, depth + 1, r.randint(1, 3), mod))]
        for _ in range(r.choice([0, 0, 1, 2])):
            arms.append((self.bool_expr(scope)[0], self.block(scope, depth + 1, r.randint(1, 3), mod)))
        other = self.block(scope, depth + 1, r.randint(1, 3), mod) if r.random() < 0.5 else []
        return ("if", arms, other)

    def for_one(self, scope, depth, mod):
        r = self.r
        self.rounds = getattr(self, "rounds", [1])
        i = Var(self.name("k"), "int", loop=True)
        size = None
        if r.random() < 0.5 and depth < 3:
            arrs = [v for v in scope if len(v.dims) == 1]
            if arrs:
                size = r.choice(arrs).dims[0]
        if size is not None:
            i.over = size
            a, b, step = "0", "%s - 1" % size, None
        else:
            a = str(r.randint(-2, 3))
            span = r.randint(0, 6 if depth < 2 else 3 if depth < 4 else 1)
            step = r.choice([None, None, 2, -1, 3])
            if step and step < 0:
                a, b = str(int(a) + span), a
            else:
                b = str(int(a) + span)
        inner = scope + [i]
        return ("for", i, a, b, step, self.block(inner, depth + 1, r.randint(1, 4), mod))

    def while_one(self, scope, depth, mod):
        r = self.r
        c = Var(self.name("n"), "int", loop=True)
        inner = scope + [c]
        limit = r.randint(0, 4 if depth < 3 else 2)
        return (r.choice(["while", "until", "dowhile"]), c, limit,
                self.block(inner, depth + 1, r.randint(1, 3), mod))

    def select_one(self, scope, depth, mod):
        r = self.r
        if r.random() < 0.6:
            subject = "abs(%s) MOD 4" % self.int_expr(scope, 1)[0]
            values = ["0", "1", "2", "3"]
        else:
            subject = r.choice([v.name for v in scope if v.kind == "text" and not v.dims] or ['"cat"'])
            values = ['"%s"' % w for w in r.sample(WORDS, 3)]
        cases = [([v], self.block(scope, depth + 1, r.randint(1, 2), mod)) for v in r.sample(values, r.randint(1, 3))]
        default = self.block(scope, depth + 1, 1, mod) if r.random() < 0.6 else []
        return ("select", subject, cases, default)

    def call_one(self, scope):
        r = self.r
        here = getattr(self, "current", None)
        mods = [m for m in self.mods if m is not here and m.done and not m.gives]
        if not mods:
            return self.show(scope)
        m = r.choice(mods)
        args = []
        for p, ref in m.params:
            if p.dims:
                arrs = [v for v in scope if v.kind == p.kind and len(v.dims) == 1 and
                        self.size_value(v.dims[0]) == self.size_value(p.dims[0])]
                if not arrs:
                    return self.show(scope)
                args.append(r.choice(arrs).name)
            elif ref:
                # one name to one Ref each: the same name handed to two is
                # one place in C++ and C#, and two to the runner
                got = [v for v in scope if v.kind == p.kind and not v.dims and not v.const and not v.loop
                       and v.name not in args]
                if not got:
                    return self.show(scope)
                args.append(r.choice(got).name)
            else:
                args.append(self.arg_for(scope, p))
        return ("call", m, args)

    def each_one(self, scope, depth, mod):
        arrs = [v for v in scope if len(v.dims) == 1]
        if not arrs:
            return self.show(scope)
        a = self.r.choice(arrs)
        v = Var(self.name("item"), a.kind, loop=True)
        return ("each", v, a, self.block(scope + [v], depth + 1, self.r.randint(1, 2), mod))

    def input_one(self, scope):
        v = self.pick_var(scope, self.r.choice(["int", "real", "text"]), writable=True)
        if not v:
            return self.show(scope)
        if v.kind == "int":
            self.typed.append(str(self.r.randint(-50, 500)))
        elif v.kind == "real":
            self.typed.append(self.r.choice(["2.5", "10", "-3.75", "0.5", "123.25"]))
        else:
            self.typed.append(self.r.choice(["hello", "Ann Lee", "z", "Quiet please", "42"]))
        return ("input", v.name)


# ---- writing it out --------------------------------------------------------
class Style:
    """How keywords are spelled: the textbook's way, or another."""
    def __init__(self, r, name):
        self.name = name
        lower = name == "lower"
        def kw(s):
            return s.lower() if lower else s
        self.kw = kw
        self.set = r.random() < 0.85 or name == "textbook"
        self.endif = kw(r.choice(["End If", "EndIf", "End If"])) if name == "closers" else kw("End If")
        self.endfor = kw(r.choice(["End For", "Next"])) if name == "closers" else kw("End For")
        self.endwhile = kw(r.choice(["End While", "EndWhile"])) if name == "closers" else kw("End While")
        self.display = kw(r.choice(["Display", "Print", "Output"])) if name == "closers" else kw("Display")
        self.elseif = kw(r.choice(["Else If", "ElseIf"])) if name == "closers" else kw("Else If")


def render(p, style):
    lines = []
    s = style
    ind = "    "

    def put(depth, text):
        lines.append(ind * depth + text)

    def setline(target, e):
        return (s.kw("Set") + " " if s.set else "") + "%s = %s" % (target, e)

    def decl(v, init):
        dims = "".join("[%s]" % d for d in v.dims)
        text = "%s %s %s%s" % (s.kw("Declare"), TYPE_WORD[v.kind], v.name, dims)
        if init is not None:
            text += " = " + (", ".join(init) if isinstance(init, list) else init)
        return text

    def body(stmts, depth):
        for st in stmts:
            one(st, depth)

    def one(st, depth):
        k = st[0]
        if k == "declare":
            put(depth, decl(st[1], st[2]))
        elif k == "set":
            put(depth, setline(st[1], st[2]))
        elif k == "show":
            put(depth, s.display + " " + ", ".join(st[1]))
        elif k == "input":
            put(depth, s.kw("Input") + " " + st[1])
        elif k == "if":
            for n, (cond, inside) in enumerate(st[1]):
                put(depth, ("%s %s %s" % (s.kw("If") if n == 0 else s.elseif, cond, s.kw("Then"))))
                body(inside or [("show", ['"-"'])], depth + 1)
            if st[2]:
                put(depth, s.kw("Else"))
                body(st[2], depth + 1)
            put(depth, s.endif)
        elif k == "for":
            i, a, b, step, inside = st[1:]
            put(depth, "%s %s = %s %s %s%s" % (s.kw("For"), i.name, a, s.kw("To"), b,
                                               " %s %d" % (s.kw("Step"), step) if step else ""))
            body(inside or [("show", ['"-"'])], depth + 1)
            put(depth, s.endfor + (" " + i.name if s.endfor.lower() == "next" else ""))
        elif k in ("while", "until", "dowhile"):
            c, limit, inside = st[1:]
            put(depth, setline(c.name, "0"))
            if k == "while":
                put(depth, "%s %s < %d" % (s.kw("While"), c.name, limit))
                body(inside, depth + 1)
                put(depth + 1, setline(c.name, "%s + 1" % c.name))
                put(depth, s.endwhile)
            else:
                put(depth, s.kw("Do"))
                body(inside, depth + 1)
                put(depth + 1, setline(c.name, "%s + 1" % c.name))
                if k == "until":
                    put(depth, "%s %s >= %d" % (s.kw("Until"), c.name, limit))
                else:
                    put(depth, "%s %s < %d" % (s.kw("While"), c.name, limit))
        elif k == "select":
            subject, cases, default = st[1:]
            put(depth, "%s %s" % (s.kw("Select"), subject))
            for values, inside in cases:
                put(depth + 1, "%s %s:" % (s.kw("Case"), ", ".join(values)))
                body(inside or [("show", ['"-"'])], depth + 2)
            if default:
                put(depth + 1, s.kw("Default") + ":")
                body(default, depth + 2)
            put(depth, s.kw("End Select"))
        elif k == "call":
            put(depth, "%s %s(%s)" % (s.kw("Call"), st[1].name, ", ".join(st[2])))
        elif k == "return":
            put(depth, "%s %s" % (s.kw("Return"), st[1]))
        elif k == "each":
            v, a, inside = st[1:]
            put(depth, "%s %s %s %s" % (s.kw("For Each"), v.name, s.kw("In"), a.name))
            body(inside, depth + 1)
            put(depth, s.endfor if s.endfor.lower() != "next" else s.kw("End For"))

    for c in p.consts:
        put(0, "%s %s %s = %d" % (s.kw("Constant"), TYPE_WORD[c.kind], c.name, c.value))
    if p.consts:
        put(0, "")
    put(0, s.kw("Module") + " main()")
    # each loop counter of main declared, the textbook's way
    body(declares_for(p.main), 1)
    body(p.main, 1)
    put(0, s.kw("End Module"))
    for m in p.mods:
        put(0, "")
        params = []
        for v, ref in m.params:
            params.append("%s%s %s%s" % (TYPE_WORD[v.kind], " Ref" if ref else "", v.name,
                                         "[]" if v.dims else ""))
        if m.gives:
            put(0, "%s %s %s(%s)" % (s.kw("Function"), TYPE_WORD[m.gives], m.name, ", ".join(params)))
        else:
            put(0, "%s %s(%s)" % (s.kw("Module"), m.name, ", ".join(params)))
        body(declares_for(m.body), 1)
        body(m.body, 1)
        put(0, s.kw("End Function") if m.gives else s.kw("End Module"))
    return "\n".join(lines) + "\n"


def declares_for(stmts):
    """Declare Integer for every counter the statements use."""
    seen, out = set(), []

    def walk(sts):
        for st in sts:
            k = st[0]
            if k == "for":
                if st[1].name not in seen:
                    seen.add(st[1].name)
                    out.append(("declare", st[1], None))
                walk(st[5])
            elif k in ("while", "until", "dowhile"):
                if st[1].name not in seen:
                    seen.add(st[1].name)
                    out.append(("declare", st[1], None))
                walk(st[3])
            elif k == "each":
                if st[1].name not in seen:
                    seen.add(st[1].name)
                    out.append(("declare", st[1], None))
                walk(st[3])
            elif k == "if":
                for _, inside in st[1]:
                    walk(inside)
                walk(st[2])
            elif k == "select":
                for _, inside in st[2]:
                    walk(inside)
                walk(st[3])
    walk(stmts)
    return out


STYLES = ["textbook", "textbook", "lower", "closers"]


def program(seed, level, style=None):
    p = Program(seed, level).build()
    r = random.Random(seed * 7 + 1)
    name = style or r.choice(STYLES)
    return render(p, Style(r, name)), p.typed, name


# ---- numbers past what a 32-bit int holds --------------------------------
# Factorials, Fibonacci numbers (a loop, a memo array, a recursion), powers,
# big sums and numbers written down, and then what programs do with them:
# print them, compare them, take them MOD something to pick a list item,
# hand them to a function, Select on them, add up their digits.
def big_program(seed, level=None, style=None):
    r = random.Random(seed * 31 + 7)
    funcs, main, decls = [], [], []
    used = set()
    names = {"n": 0}

    def fresh(stem):
        names["n"] += 1
        return "%s%d" % (stem, names["n"])

    def declare(kind, name, value=None):
        decls.append("    Declare %s %s%s" % (kind, name, "" if value is None else " = " + value))

    bigs = []                                    # names holding a big whole number now

    def use(v):
        """Something done with a big number, the way programs do."""
        k = r.random()
        if k < 0.2:
            main.append('    Display "%s = ", %s' % (v, v))
        elif k < 0.32:
            main.append('    Display %s MOD %d, " ", %s > 2147483647' % (v, r.choice([7, 10, 97, 1000]), v))
        elif k < 0.42:
            main.append("    Display %s + %d" % (v, r.randint(1, 99)))
        elif k < 0.52:
            main.append("    Display %s / %d" % (v, r.choice([2, 10, 1000])))
        elif k < 0.6 and "addOne" in used:
            main.append("    Display addOne(%s)" % v)
        elif k < 0.68:
            main.append("    If %s >= %d Then" % (v, r.choice([1000, 2147483647, 100000000000])))
            main.append('        Display "big ", %s' % v)
            main.append("    Else")
            main.append('        Display "small ", %s' % v)
            main.append("    End If")
        elif k < 0.76:
            main.append("    Select %s MOD 4" % v)
            for c in range(3):
                main.append("        Case %d:" % c)
                main.append('            Display "case %d"' % c)
            main.append("        Default:")
            main.append('            Display "case 3"')
            main.append("    End Select")
        elif k < 0.84:
            main.append("    Display words[%s MOD 5]" % v)
            used.add("words")
        elif k < 0.92:
            d, s = fresh("d"), fresh("s")
            declare("Integer", d)
            declare("Integer", s, "0")
            main.append("    Set %s = %s" % (d, v))
            main.append("    While %s > 0" % d)
            main.append("        Set %s = %s + %s MOD 10" % (s, s, d))
            main.append("        Set %s = %s / 10" % (d, d))
            main.append("    End While")
            main.append('    Display "digits ", %s' % s)
        else:
            main.append("    Display max(%s, %d), \" \", min(%s, %d), \" \", abs(0 - %s)" % (v, r.randint(1, 50), v, r.randint(1, 50), v))

    if r.random() < 0.5:
        used.add("addOne")
        funcs.append("Function Integer addOne(Integer x)\n    Return x + 1\nEnd Function\n")

    for _ in range(r.randint(2, 5)):
        k = r.randint(0, 8)
        if k == 0:                                # factorial, by a loop
            f = fresh("FactL")
            funcs.append("Function Integer %s(Integer n)\n    Declare Integer result = 1\n    Declare Integer i\n"
                         "    For i = 2 To n\n        Set result = result * i\n    End For\n    Return result\nEnd Function\n" % f)
            v = fresh("big")
            declare("Integer", v)
            main.append("    Set %s = %s(%d)" % (v, f, r.randint(13, 18)))
            bigs.append(v)
        elif k == 1:                              # factorial, by recursion
            f = fresh("FactR")
            funcs.append("Function Integer %s(Integer n)\n    If n <= 1 Then\n        Return 1\n    End If\n"
                         "    Return n * %s(n - 1)\nEnd Function\n" % (f, f))
            v = fresh("big")
            declare("Integer", v)
            main.append("    Set %s = %s(%d)" % (v, f, r.randint(13, 18)))
            bigs.append(v)
        elif k == 2:                              # Fibonacci, by a loop
            a, b, t, c = fresh("a"), fresh("b"), fresh("t"), fresh("k")
            declare("Integer", a, "0")
            declare("Integer", b, "1")
            declare("Integer", t)
            declare("Integer", c)
            main.append("    For %s = 1 To %d" % (c, r.randint(47, 76)))
            main.append("        Set %s = %s + %s" % (t, a, b))
            main.append("        Set %s = %s" % (a, b))
            main.append("        Set %s = %s" % (b, t))
            main.append("    End For")
            bigs.append(a)
        elif k == 3:                              # memo array
            m, i = fresh("memo"), fresh("i")
            declare("Integer", m + "[80]")
            declare("Integer", i)
            top = r.randint(50, 76)
            main.append("    Set %s[0] = 0" % m)
            main.append("    Set %s[1] = 1" % m)
            main.append("    For %s = 2 To %d" % (i, top))
            main.append("        Set %s[%s] = %s[%s - 1] + %s[%s - 2]" % (m, i, m, i, m, i))
            main.append("    End For")
            v = fresh("big")
            declare("Integer", v)
            main.append("    Set %s = %s[%d]" % (v, m, top))
            main.append('    Display %s[%d], " ", %s[%d]' % (m, top - 1, m, r.randint(40, top)))
            bigs.append(v)
        elif k == 4:                              # powers
            p, i = fresh("p"), fresh("i")
            base = r.choice([2, 3, 5, 7])
            most = {2: 52, 3: 33, 5: 22, 7: 18}[base]
            declare("Integer", p, "1")
            declare("Integer", i)
            main.append("    For %s = 1 To %d" % (i, r.randint(most - 6, most)))
            main.append("        Set %s = %s * %d" % (p, p, base))
            main.append("    End For")
            bigs.append(p)
            e = fresh("e")
            declare("Integer", e, str(r.randint(32, 50)))
            main.append("    Display 2 ^ %s" % e)
        elif k == 5:                              # a big sum
            tot, i = fresh("total"), fresh("i")
            declare("Integer", tot, "0")
            declare("Integer", i)
            main.append("    For %s = 1 To %d" % (i, r.randint(1500, 2000)))
            main.append("        Set %s = %s + %s * %s" % (tot, tot, i, i))
            main.append("    End For")
            bigs.append(tot)
        elif k == 6:                              # numbers written down
            v = fresh("lit")
            declare("Integer", v, "%d * %d * %d" % (r.randint(1500, 3000), r.randint(1000, 3000), r.randint(1000, 3000)))
            bigs.append(v)
        elif k == 7:                              # a parameter handed one
            f = fresh("Twice")
            funcs.append("Function Integer %s(Integer x)\n    Return x * 2\nEnd Function\n" % f)
            v = fresh("big")
            declare("Integer", v, str(r.randint(3000000000, 9000000000)))
            w = fresh("big")
            declare("Integer", w)
            main.append("    Set %s = %s(%s)" % (w, f, v))
            bigs.append(w)
        else:                                     # a recursion adding two of itself
            f = fresh("Ways")
            funcs.append("Function Integer %s(Integer n)\n    If n < 2 Then\n        Return n\n    End If\n"
                         "    Return %s(n - 1) + %s(n - 2)\nEnd Function\n" % (f, f, f))
            v = fresh("small")
            declare("Integer", v)
            main.append("    Set %s = %s(%d)" % (v, f, r.randint(10, 16)))
            bigs.append(v)
    for v in bigs:
        for _ in range(r.randint(1, 3)):
            use(v)
    head = ['    Declare String words[5] = "zero", "one", "two", "three", "four"'] if "words" in used else []
    text = "\n".join(funcs) + "\nModule main()\n" + "\n".join(head + decls + main) + "\nEnd Module\n"
    return text, [], "textbook"


if __name__ == "__main__":
    import sys
    seed = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    if len(sys.argv) > 2 and sys.argv[2] == "big":
        print(big_program(seed)[0])
    else:
        level = int(sys.argv[2]) if len(sys.argv) > 2 else 2
        text, typed, style = program(seed, level)
        print(text)
        print("typed:", typed, "style:", style)
