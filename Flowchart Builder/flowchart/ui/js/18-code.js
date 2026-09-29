// ---------------------------------------------------------------------------
//  18-code.js -- what one language does differently from the next
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ========================================================= as real code ==
  // The same program, written out in whichever language you are working in.
  // It comes from the same data the runner walks, so what you read here is
  // what you just watched happen -- and it is meant to be run.  Every block
  // below is held to that by tests/run.py, which writes a shelf of programs
  // out in each language, really runs the ones this machine can run, and
  // compares what they print with what the runner printed.
  //
  // ---- what one language does differently from the next -----------------
  // Everything that varies between Python, Java, C#, C++ and JavaScript is
  // in one block per language below: what it calls printing, how it asks to
  // be typed into, how it declares a variable, what it calls a square root,
  // what it does about a whole number divided by a whole number, which
  // words it keeps for itself, what it wraps a whole program in.  The
  // writer in 18-write.js knows none of them by name.
  //
  // It used to know all of them.  There were thirty-one tests of the form
  // `lang === "python"` spread through six functions, and a second table of
  // types beside them, so adding a language meant finding all thirty-one
  // places and hoping none had been missed -- and the ones that were missed
  // did not fail, they quietly wrote Python in the middle of the Java.  Now
  // adding a language is adding a block here, and the picker, the file
  // extension and the Save name follow from it.
  //
  // A language may say `like: CURLY` to start from what the brace-and-
  // semicolon languages share and change only what differs.

  // Math.max(a, Math.max(b, c)): the ones that take two, taking three
  function nested(fn, a) {
    if (a.length <= 2) { return fn + "(" + a.join(", ") + ")"; }
    return fn + "(" + a[0] + ", " + nested(fn, a.slice(1)) + ")";
  }

  // Something that has to be wrapped in brackets before a method can be
  // called on it, or a cast put in front of it: anything that is not a
  // plain name, a piece of text, or one call with nothing nested in it.  A
  // plain number is wrapped as well -- 5.toFixed(2) is not JavaScript.
  var R_SIMPLE = /^(?:[A-Za-z_][\w.]*(?:\[0\])?|"(?:[^"\\]|\\.)*"|[A-Za-z_][\w.]*\([^()]*\))$/;

  function held(code) {
    return R_SIMPLE.test(String(code).trim()) || postfixOnly(String(code).trim()) ? code : "(" + code + ")";
  }

  // A name and nothing after it but places and calls -- grid[y][x],
  // p.pos.x, rows.get(i).size() -- which anything can be put after or in
  // front of as it stands: (grid[y])[x] says nothing grid[y][x] does not.
  function postfixOnly(code) {
    var m = /^[A-Za-z_]\w*/.exec(code);
    if (!m) { return false; }
    var i = m[0].length;
    while (i < code.length) {
      var c = code.charAt(i);
      if (c === ".") {
        var name = /^[A-Za-z_]\w*/.exec(code.slice(i + 1));
        if (!name) { return false; }
        i += 1 + name[0].length;
        continue;
      }
      if (c !== "[" && c !== "(") { return false; }
      var depth = 0, quote = "";
      for (; i < code.length; i++) {
        var d = code.charAt(i);
        if (quote) {
          if (d === "\\") { i++; } else if (d === quote) { quote = ""; }
          continue;
        }
        if (d === '"' || d === "'") { quote = d; continue; }
        if (d === "[" || d === "(") { depth++; }
        if (d === "]" || d === ")") { depth--; if (!depth) { i++; break; } }
      }
      if (depth) { return false; }
    }
    return true;
  }

  // A piece of a Display that would come apart if it were simply added on:
  // "Sum: " + a + b is "Sum: 34", and what was meant is "Sum: 7".
  function joinCurly(bits) {             // "a" + x + " b" -- text first
    var L = this;
    if (bits.length === 1 && bits[0].kind !== "text" && !bits[0].cash) {
      return bits[0].code;               // println(total) needs nothing added
    }
    var said = bits.map(function (bit) {
      // Money is asked for in two places after the point, so it arrives
      // already a string and needs nothing in front of it to make it one.
      if (bit.cash) { return L.cash(bit.code, bit.kind); }
      return bit.loose ? "(" + bit.code + ")" : bit.code;
    });
    if (bits[0].kind !== "text" && !bits[0].cash) { said.unshift('""'); }
    return said.join(" + ");
  }

  // A For's step, the way it is written by hand: i++, not i = i + 1.
  function counterStep(w, step) {
    if (step.op !== "set") { return ""; }
    var name = w.named(step.var), node = tree(step.expr);
    var mine = (node.op === "+" || node.op === "-") && node.left.name &&
               lowered(node.left.name) === lowered(step.var);
    if (!mine) { return name + " = " + w.code(step.expr); }
    var by = w.write(node.right);
    if (by === "1") { return name + node.op + node.op; }
    return name + " " + node.op + "= " + by;
  }

  function isLiteral(node) {             // something a `case` will accept
    if (node.unary && node.unary !== "not") { node = node.of; }
    return node.str !== undefined || node.bool !== undefined ||
           (node.lit !== undefined && node.lit !== '""');
  }

  // The body of a class-shaped file: what the whole program shares, then
  // main, then each module beside it.
  //
  // A Constant written above the modules is the program's, not main's -- the
  // runner reads it from inside every chart, because that is what putting it
  // up there means.  Written inside Main it would be a local of Main, and
  // the module that reads it perfectly well in the picture would not
  // compile.  So the declarations from out there become fields of the class,
  // which is where a class-shaped language keeps what its methods share.
  // Python and JavaScript need none of this: main's statements are written
  // at the top level in both, which is already where a shared name lives.
  //
  // The inside is written first and the top of the file afterwards, because
  // what goes at the top -- the Scanner, the Random -- depends on whether
  // anything inside turned out to want it.
  function classFile(w, opening, mainLine) {
    function shared(item) { return item.scope === "global" && item.op === "declare"; }
    var main = w.prog.main.items;
    var inside = w.aside(function () {
      var before = w.count();
      main.filter(shared).forEach(function (item) {
        w.infront = w.L.field(item.const, isLiteral(tree(item.expr || "0")));
        w.each(item, 1);
      });
      w.infront = w.L.field(false, true);
      w.sharedLines(1);
      w.infront = "";
      if (w.count() > before) { w.line(0, ""); }
      w.line(1, mainLine);
      w.inside(null, 2, main.filter(function (item) { return !shared(item); }));
      w.line(1, w.L.shut);
      w.mods.forEach(function (one) {
        w.line(0, "");
        w.line(1, "static " + w.returns(one) + " " + w.called(one) +
               "(" + w.signature(one) + ") {");
        w.inside(one, 2);
        w.line(1, w.L.shut);
      });
      // The kinds of record the program makes, and the small methods its
      // lists wanted, at the foot of the class where they are out of the
      // way of reading the program itself.
      var recs = recordsIn(w.prog);
      if (Object.keys(recs).length) { w.L.records(w, recs, 1); }
      helpersFor(w, 0);
    });
    opening(w, inside).forEach(function (row) { w.line(row[0], row[1]); });
    w.pour(inside);
    w.line(0, w.L.shut);
  }

  // For Each x In xs with a Set x inside it: a name the loop may change,
  // which JavaScript's const and C#'s foreach will not let it
  function loopSetsItsName(item) {
    var low = lowered(String(item["var"] || "")), hit = false;
    eachStep(item.body, function (step) {
      if ((step.op === "set" || step.op === "input") && lowered(String(step["var"] || "").trim()) === low) { hit = true; }
    });
    return hit;
  }
  // The helpers these lines turned out to want, written where they stand.
  function helpersFor(w, deep) {
    var L = w.L;
    Object.keys(L.helpers || {}).forEach(function (name) {
      if (!w.needs[name]) { return; }
      var rows = L.helpers[name].lines || L.helpers[name];
      if (!rows.length) { return; }
      w.line(0, "");
      rows.forEach(function (row) { w.line(deep, row); });
    });
  }

  // Java's kind of thing for a function handed about as a value.
  var JAVA_FN_TYPE = ["    // A function handed about as a value: called with call(), and what it",
                      "    // hands back is an Object.",
                      "    interface Fn { Object call(Object... a); }"];

  // Java's and C#'s lists are brought in; these say whether they were used.
  var R_JAVA_UTIL = /\b(ArrayList|LinkedHashMap|LinkedHashSet|Arrays|Collections|Comparator|List|Map)\b/;
  var R_CS_LISTS = /\b(List|Dictionary)<|Enumerable\.|\.(ToList|Select|Where|Sum|Min|Max|OrderBy|Distinct|Any|All|Union|Intersect|Count|Reverse|ToArray)\(/;

  // What the brace-and-semicolon languages agree about.
  var CURLY = {
    semi: ";", open: " {", shut: "}", tab: "    ",
    and: "&&", or: "||", not: "!", eq: "==", ne: "!=", mod: "%",
    yes: "true", no: "false", note: "// ", nothing: "// nothing here",
    elseIf: "else if ",
    // Names live between the braces they were declared in, so some have to
    // be declared further up than the pseudocode declared them.
    hoists: true,
    // `}` and what follows it share a line, the way every house style for
    // these languages has them share one.
    chain: function (w, deep, head) { w.line(deep, "} " + head); },
    join: joinCurly,
    test: function (code) { return "(" + code + ")"; },
    // How a name the whole program shares is written where the methods can
    // all see it.  C# has its own answer: a const is already static there,
    // and saying both is a thing the compiler refuses outright.
    field: function () { return "static "; },
    typed: function (entry, w) {
      if (this.kinds && entry.kind === "int" && entry.big && this.bigInt) { return this.bigInt + " "; }
      // a number that is sometimes nothing: Integer, int? -- which can be null
      if (this.kinds && this.boxedKind && entry.nullable && this.boxedKind[entry.kind]) { return this.boxedKind[entry.kind] + " "; }
      if (this.kinds && this.boxedKind && entry.elemNullable && isListKind(entry.kind) && this.boxedKind[elemOf(entry.kind)] && this.nullableList) {
        return this.nullableList(elemOf(entry.kind)) + " ";
      }
      return this.kinds ? typeOfKind(this, entry.kind, w) + " " : "";
    },
    declare: function (w, entry, start, fixed, plain) {
      return this.lead(fixed, plain) + this.typed(entry, w) +
             w.spelled(entry) + " = " + start;
    },
    // What goes in front of a counter that its For declares for itself.
    head: function (w, entry) { return this.typed(entry, w); },
    param: function (w, p, how) {
      var type = this.typed(p.entry, w);
      return how ? this.byRef(type, w.spelled(p.entry), how)
                 : type + w.spelled(p.entry);
    },
    repeat: function (w, item, deep) {   // Do ... While / Until
      var code = item.cond ? w.code(item.cond) : "";
      w.line(deep, "do" + this.open);
      w.block(item.body, deep + 1);
      w.line(deep, "} while (" + (!code ? this.no
             : item.until ? this.not + "(" + code + ")" : code) + ");");
    },
    count: function (w, item, deep) {    // For, as a for
      var set = statementOf(item.init || ""), step = statementOf(item.step || "");
      var entry = set.op === "set" ? w.entry(set.var) : null;
      // The counter is declared here only when the For is the only thing
      // that uses it.  "Declare Integer i" followed by "For i = 1 to n" was
      // coming out as `int i = 0;` and then `for (int i = 1; ...)` -- the
      // same name declared twice in one scope, which Java and C# both
      // refuse outright and JavaScript quietly shadows.
      var first = set.op !== "set" ? ""
                : (entry && entry.perLoop ? this.head(w, entry) : "") +
                  w.named(set.var) + " = " + w.fitted(set.expr, entry && entry.kind);
      w.line(deep, "for (" + first + "; " + (item.cond ? w.code(item.cond) : "") +
             "; " + counterStep(w, step) + ")" + this.open);
      w.block(item.body, deep + 1);
      w.line(deep, this.shut);
    },
    pick: function (w, item, deep) {     // Select Case, as a switch
      var L = this, subject = tree(item.expr);
      var plain = item.cases.every(function (one) {
        var label = String(one.match || "").trim();
        return OTHERWISE.test(label) || (!one.any && isLiteral(tree(label)));
      });
      // A Case of several values or a run of them (1 TO 5) is a test no
      // language's switch writes the same way: a chain of ifs says it.  So
      // is a Case with an Exit in it: in a switch, break leaves the switch
      // and not the loop the Exit was leaving.
      if (item.cases.some(function (one) { return one.any || exitsIn(one.body); })) {
        w.chain(item, deep);
        return;
      }
      // Not everything can be switched on.  Java will not switch on a
      // double, C++ will not switch on a string, and none of them take a
      // case that has to be worked out.  A chain of ifs says the same thing
      // and all of them take that.
      if (!L.switches(w.kind(subject), plain)) { w.chain(item, deep); return; }
      w.line(deep, "switch (" + w.write(subject) + ")" + L.open);
      item.cases.forEach(function (one) {
        var label = String(one.match || "").trim();
        w.line(deep + 1, OTHERWISE.test(label) ? "default:"
                                               : "case " + w.code(label) + ":");
        w.block(one.body, deep + 2, true);
        // A break after a return is a line that can never be reached, and
        // Java refuses to compile one.
        if (!w.leaves(one.body)) { w.line(deep + 2, "break;"); }
      });
      w.line(deep, L.shut);
    }
  };

  var OTHERWISE = /^(default|case else|else)$/i;

  // An Exit among these statements, or in an If or a Select among them --
  // not in a loop of their own, whose Exit is that loop's.
  function exitsIn(items) {
    return (items || []).some(function (st) {
      if (st.op === "exit") { return true; }
      if (st.op === "if") { return exitsIn(st.then) || exitsIn(st["else"]); }
      if (st.op === "select") { return (st.cases || []).some(function (c) { return exitsIn(c.body); }); }
      return false;
    });
  }

  // A For that counts by a fixed amount is a Python `for ... in range(...)`.
  // Written as a while with the counter moved by hand it does the same
  // thing, but it is not what anybody would write -- and the comment it
  // needed above it to say what it really was is the proof.  Anything this
  // does not recognize still comes out as the while.
  var R_TEST = /^([A-Za-z_]\w*)\s*(<=|<|>=|>)\s*(.+)$/;

  function edge(code, by) {              // "n" +1 -> "n + 1";  "6" +1 -> "7"
    if (!by) { return code; }
    var n = parseFloat(code);
    if (String(n) === String(code).trim()) { return String(n + by); }
    // "n - 1" + 1 is n, and saying so is what a person would have written.
    var undo = (by > 0 ? / - 1$/ : / \+ 1$/);
    if (Math.abs(by) === 1 && undo.test(code)) { return code.replace(undo, ""); }
    return code + (by > 0 ? " + " + by : " - " + (-by));
  }

  function counting(w, item, set, step) {
    if (!item.cond || set.op !== "set" || step.op !== "set") { return null; }
    if (lowered(step.var) !== lowered(set.var)) { return null; }
    var test = R_TEST.exec(String(item.cond).trim());
    if (!test || lowered(test[1]) !== lowered(set.var)) { return null; }
    var move = new RegExp("^" + set.var + "\\s*([+-])\\s*(\\d+)$", "i")
                 .exec(String(step.expr).trim());
    if (!move) { return null; }
    var by = parseInt(move[2], 10);
    if (!by) { return null; }
    var down = move[1] === "-";
    if (down !== (test[2] === ">=" || test[2] === ">")) { return null; }
    // A counter something goes on to read afterwards has to end where the
    // chart leaves it, which is one past where range() does.
    var entry = w.entry(set.var);
    if (entry && !entry.loopOnly) { return null; }
    // range() counts in whole numbers and nothing else: handed a Real it
    // stops the program, so a count that might be one stays a while.
    if (w.kind(tree(set.expr)) !== "int" || w.kind(tree(test[3])) !== "int") {
      return null;
    }
    var stop = edge(w.code(test[3]),
                    down ? (test[2] === ">=" ? -1 : 0)
                         : (test[2] === "<=" ? 1 : 0));
    var parts = [w.code(set.expr), stop];
    if (down || by !== 1) { parts.push(String(down ? -by : by)); }
    return "range(" + parts.join(", ") + ")";
  }

  // How long a Wait waits, in the units the language's own sleep asks for.
  // A plain number is turned here and now -- sleep(0.5) rather than
  // sleep(500 / 1000) -- and anything the program works out for itself is
  // scaled where it stands.
  function napFor(w, item, want) {
    var code = w.code(item.expr || "0");
    if ((item.unit === "ms" ? "ms" : "s") === want) { return code; }
    var n = parseFloat(code), by = want === "ms" ? 1000 : 0.001;
    if (String(n) === String(code).trim()) {
      return String(Math.round(n * by * 1e6) / 1e6);
    }
    return want === "ms" ? "(" + code + ") * 1000" : "(" + code + ") / 1000.0";
  }

  // Sleeping is told how long in whole milliseconds in some of these, and a
  // wait worked out rather than written down can be neither whole nor small.
  function longOf(code) {
    return /^\d+$/.test(code) ? code : "(long) (" + code + ")";
  }
  function intOf(code) {
    return /^\d+$/.test(code) ? code : "(int) (" + code + ")";
  }

  // The headers a C++ file brings in only when something in it wants one.
  var CPP_LIBS = ["cmath", "cstdlib", "algorithm", "vector", "map", "sstream",
                  "numeric", "iomanip", "cctype", "ctime"];

  var LANGS = {
    python: {
      name: "Python", ext: "py",
      semi: "", open: ":", shut: "", tab: "    ",
      and: "and", or: "or", not: "not ", eq: "==", ne: "!=",
      mod: "%",
      yes: "True", no: "False", note: "# ", nothing: "pass",
      elseIf: "elif ",
      kinds: null, hoists: false,
      // The words Python keeps, and the ones this writer leans on.  A
      // variable called print is legal Python right up until the next
      // line tries to print something.
      kept: "False None True and as assert async await break class continue " +
            "def del elif else except finally for from global if import in " +
            "is lambda nonlocal not or pass raise return try while with yield " +
            "print input int float str format range math random time",
      // Kept only if the program uses the built-in of that name: `max` is
      // what half of all pseudocode calls its largest-so-far, and it is a
      // perfectly good Python variable until somebody calls max().
      soft: { min: "min", max: "max", abs: "abs", pow: "pow", len: "length" },
      chain: function (w, deep, head) { w.line(deep, head); },
      cash: function (code) { return "format(" + code + ', ".2f")'; },
      join: function (bits) {
        var L = this;
        if (bits.length === 1 && !bits[0].cash) { return bits[0].code; }
        return bits.map(function (bit) {
          return bit.cash ? L.cash(bit.code)
               : bit.kind === "text" ? bit.code
               : "str(" + bit.code + ")";
        }).join(" + ");
      },
      test: function (code) { return bare(code); },
      say: function (said) { return "print(" + said + ")"; },
      ask: function (kind, w, question) {
        var read = "input(" + (question || "") + ")";
        return kind === "whole" ? "int(" + read + ")"
             : kind === "real" ? "float(" + read + ")"
             : kind === "flag" ? read + '.strip().lower() == "true"' : read;
      },
      declare: function (w, entry, start) { return w.spelled(entry) + " = " + start; },
      param: function (w, p) { return w.spelled(p.entry); },
      paramDefault: function (code) { return "=" + code; },
      // A def that sets a name the whole program shares has to say so, or
      // Python makes it a new name of the def's own and the shared one
      // never changes.
      shares: function (names) { return "global " + names.join(", "); },
      // Nothing is handed over by reference.  What a module was given to
      // change, it hands back, and the call puts it where it came from.
      refs: "back",
      handBack: function (names) { return names.join(", "); },
      takeBack: function (targets) {
        return targets.map(function (t) { return t || "_"; }).join(", ");
      },
      quit: function () { return "raise SystemExit"; },
      pause: function (w, item, deep) {
        w.need("time");
        w.line(deep, "time.sleep(" + napFor(w, item, "s") + ")");
      },
      into: function (a, b) { return a + " // " + b; },
      // -7 MOD 2 is -1, where Python's -7 % 2 is 1
      towardNought: function (a, b, whole, w) {
        w.need("math");
        return (whole ? "int(" : "") + "math.fmod(" + a + ", " + b + ")" + (whole ? ")" : "");
      },
      pow: "**",
      worded: function (code) { return "str(" + code + ")"; },
      calls: {
        sqrt: function (a, k, w) { w.need("math"); return "math.sqrt(" + a[0] + ")"; },
        abs: function (a) { return "abs(" + a[0] + ")"; },
        // Python's own round() goes to the nearest even number: round(2.5)
        // is 2.  The runner, and everybody's arithmetic teacher, say 3.
        round: function (a, k, w) { w.need("math"); return "math.floor(" + held(a[0]) + " + 0.5)"; },
        floor: function (a, k, w) { w.need("math"); return "math.floor(" + a[0] + ")"; },
        ceiling: function (a, k, w) { w.need("math"); return "math.ceil(" + a[0] + ")"; },
        int: function (a) { return "int(" + a[0] + ")"; },
        length: function (a) { return "len(" + a[0] + ")"; },
        toupper: function (a) { return held(a[0]) + ".upper()"; },
        tolower: function (a) { return held(a[0]) + ".lower()"; },
        random: function (a, k, w) {
          w.need("random");
          return a.length ? "random.randint(" + a.join(", ") + ")" : "random.random()";
        },
        pow: function (a) { return "pow(" + a.join(", ") + ")"; },
        min: function (a) { return "min(" + a.join(", ") + ")"; },
        max: function (a) { return "max(" + a.join(", ") + ")"; }
      },
      repeat: function (w, item, deep) {
        var code = item.cond ? w.code(item.cond) : "";
        w.line(deep, "while True:");
        w.block(item.body, deep + 1, true);
        w.line(deep + 1, "if " + (!code ? "True"
               : item.until ? code : "not (" + code + ")") + ":");
        w.line(deep + 2, "break");
      },
      count: function (w, item, deep) {  // a For is a for, over a range
        var set = statementOf(item.init || ""), step = statementOf(item.step || "");
        var over = counting(w, item, set, step);
        if (over) {
          w.line(deep, "for " + w.named(set.var) + " in " + over + ":");
          w.block(item.body, deep + 1);
          return;
        }
        w.line(deep, this.note + item.raw);   // a count this does not follow
        if (set.op === "set") { w.each({ op: "set", var: set.var, expr: set.expr }, deep); }
        w.line(deep, "while " + (item.cond ? w.code(item.cond) : "True") + ":");
        w.block(item.body, deep + 1, step.op === "set");
        if (step.op === "set") {
          w.each({ op: "set", var: step.var, expr: step.expr }, deep + 1);
        }
      },
      pick: function (w, item, deep) {   // no switch: a chain of ifs does it
        w.chain(item, deep);
      },
      whole: function (w) {
        var inside = w.aside(function () {
          w.mods.forEach(function (one) {
            w.line(0, "");
            w.line(0, "def " + w.called(one) + "(" + w.signature(one) + "):");
            w.inside(one, 1);
          });
          w.line(0, "");
          w.inside(null, 0);
        });
        w.line(0, this.note + w.title);
        ["copy", "functools", "json", "math", "random", "time"].forEach(function (lib) {
          if (w.needs[lib]) { w.line(0, "import " + lib); }
        });
        helpersFor(w, 0);
        this.records(w, recordsIn(w.prog));
        w.pour(inside);
      },

      // ---- and the same program in a file each --------------------------
      // A module is already a chart of its own here, so a file each is the
      // cut the program had drawn for itself.  What the program shares goes
      // into a file of its own, and every other file says where it is
      // reading those from -- shared.total, set as well as read, which is
      // what `global` was for while there was one file.
      //
      // A module that calls another brings in the whole file rather than
      // picking the name out of it: `import receipt`, not `from receipt
      // import receipt`.  Two modules that call one another would each be
      // waiting on a name the other has not finished writing down; brought
      // in whole, the name is looked for when it is called rather than when
      // the file is read, and by then it is there.
      sharedName: "shared",
      reachMod: function (w, one) { return w.fileOf(one) + "."; },
      apart: function (w) {
        var L = this, files = [];
        // The head of a file, and whether it turned out to bring anything
        // in: the blank line under it belongs to whoever is writing the
        // file, because a def wants one above it whether or not there were
        // imports and a row of assignments does not.
        function top(what, brings) {
          w.line(0, L.note + w.title + (what ? " -- " + what : ""));
          var before = w.count();
          ["copy", "functools", "json", "math", "random", "time"].forEach(function (lib) {
            if (w.needs[lib]) { w.line(0, "import " + lib); }
          });
          brings.forEach(function (name) { w.line(0, "import " + name); });
          helpersFor(w, 0);
          return w.count() > before;
        }
        function brought(scope, items, mine) {
          var names = w.touching(scope, items) ? [w.sharedFile] : [];
          return names.concat(w.leaning(items, mine).map(function (one) {
            return w.fileOf(one);
          }));
        }

        // What the program shares, in a file of its own -- where there is
        // anything shared to put in it.  A program whose charts keep
        // themselves to themselves gets no such file, rather than an empty
        // one and a row of imports of nothing.
        w.reach = "";
        w.alone();
        var holds = w.sharing();
        if (holds.length) {
          // Written before its own top is, like every other file here: a
          // Constant worked out with a square root wants math imported
          // above it, and only writing it says so.
          var said = w.aside(function () {
            holds.forEach(function (one) {
              w.line(0, L.declare(w, one.entry, one.code, one.fixed, one.plain));
            });
          });
          files.push({ name: w.sharedFile, lines: w.aside(function () {
            if (top(TXT.code_shares, [])) { w.line(0, ""); }
            w.pour(said);
          }) });
        }

        w.reach = w.sharedFile + ".";
        var mine = w.mains();
        var body = w.aside(function () { w.alone(); w.inside(null, 0, mine); });
        files.unshift({ name: w.file, lines: w.aside(function () {
          top("", brought(w.prog.main, mine, null));
          w.line(0, "");
          w.pour(body);
        }) });

        w.mods.forEach(function (one) {
          var said = w.aside(function () {
            w.alone();
            w.line(0, "def " + w.called(one) + "(" + w.signature(one) + "):");
            w.inside(one, 1);
          });
          files.push({ name: w.fileOf(one), lines: w.aside(function () {
            top(w.about(one), brought(one.scope, one.body, one));
            w.line(0, "");
            w.pour(said);
          }) });
        });
        return files;
      }
    },

    java: {
      like: CURLY,
      name: "Java", ext: "java",
      kinds: { int: "int", real: "double", text: "String", bool: "boolean" },
      bigInt: "long",
      longSuffix: "L",
      kept: "abstract assert boolean break byte case catch char class const " +
            "continue default do double else enum extends final finally float " +
            "for goto if implements import instanceof int interface long " +
            "native new package private protected public return short static " +
            "strictfp super switch synchronized this throw throws transient " +
            "try void volatile while true false null keyboard Math String " +
            "System Scanner Integer Double Boolean Thread InterruptedException",
      cash: function (code, kind) {
        // %.2f given a whole number is not a rounding, it is a crash.
        return 'String.format("%.2f", ' +
               (kind === "int" ? "(double) " + held(code) : code) + ")";
      },
      lead: function (fixed) { return fixed ? "final " : ""; },
      say: function (said) { return "System.out.println(" + said + ")"; },
      // The question, on the line the answer is typed on.
      hint: function (question) { return "System.out.print(" + question + ")"; },
      // A line at a time, whatever is being asked for.  nextInt() reads the
      // number and leaves the Enter that followed it sitting there, and the
      // next nextLine() reads that Enter as an empty answer -- so a program
      // that asks for an age and then a name appears to skip the name.
      ask: function (kind, w) {
        w.need("keys");
        // Wherever the Scanner is: beside this line in the one file, and
        // in the shared class where the program is written in several.
        var typed = w.reach + "keyboard.nextLine()";
        return kind === "whole" ? "Integer.parseInt(" + typed + ".trim())"
             : kind === "real" ? "Double.parseDouble(" + typed + ".trim())"
             : kind === "flag" ? "Boolean.parseBoolean(" + typed + ".trim())" : typed;
      },
      // Two whole numbers divided are a whole number in Java: 7 / 2 is 3.
      // In the chart it is 3.5, so one of them is made a double first.
      over: function (a, b) { return "(double) " + a + " / " + b; },
      into: function (a, b, whole) {
        return whole ? a + " / " + b : "(int) Math.floor(" + a + " / " + b + ")";
      },
      power: function (a, b, whole) {
        return (whole ? "(int) " : "") + "Math.pow(" + a + ", " + b + ")";
      },
      // == on two Strings asks whether they are the same object, not the
      // same words, and the answer is no often enough to matter.
      alike: function (a, b, not) { return (not ? "!" : "") + held(a) + ".equals(" + b + ")"; },
      ordered: function (a, op, b) { return held(a) + ".compareTo(" + b + ") " + op + " 0"; },
      narrow: function (code) { return "(int) " + held(code); },
      switches: function (kind, plain) {
        return plain && (kind === "int" || kind === "text");
      },
      quit: function (w, inMain) { return inMain ? "return" : "System.exit(0)"; },
      // Thread.sleep is a checked one: a method that lets it out has to say
      // so, and so does everything that calls that method, all the way up
      // to main.  Caught where it stands, it is one line and it goes
      // anywhere -- inside a module, inside a loop, inside main.
      pause: function (w, item, deep) {
        w.line(deep, "try { Thread.sleep(" + longOf(napFor(w, item, "ms")) +
                     "); } catch (InterruptedException e) { }");
      },
      // Java hands everything over by value and has no way to say
      // otherwise.  One thing to hand back is handed back the ordinary way,
      // by returning it.  More than one goes in and out in a one-slot
      // array each, which is the nearest thing Java has to a reference.
      refs: "box",
      handBack: function (names) { return names[0]; },
      takeBack: function (targets) { return targets[0]; },
      byRef: function (type, name) { return type.trim() + "[] " + name; },
      boxArg: function (code, kind) { return "new " + typeOfKind(this, kind) + "[] { " + code + " }"; },
      boxCall: function (w, one, given, deep) {
        var L = this, after = [];
        w.line(deep, "{");
        var args = one.params.map(function (p, i) {
          var src = String(given[i] === undefined ? "" : given[i]);
          if (!p.ref) { return w.handed(one, i, tree(src)); }
          var box = w.spelled(p.entry) + "Box";
          w.line(deep + 1, typeOfKind(L, p.entry.kind, w) + "[] " + box + " = { " +
                 w.code(src) + " };");
          var mine = R_JUST_A_NAME.test(src) ? w.entry(src.trim()) : null;
          if (mine) {
            after.push(w.named(src.trim()) + " = " +
                       (mine.kind === "int" && p.entry.kind === "real" ? "(int) " : "") +
                       box + "[0];");
          }
          return box;
        });
        w.line(deep + 1, w.reachMod(one) + w.called(one) +
               "(" + args.join(", ") + ");");
        after.forEach(function (line) { w.line(deep + 1, line); });
        w.line(deep, "}");
      },
      calls: {
        sqrt: function (a) { return "Math.sqrt(" + a[0] + ")"; },
        abs: function (a) { return "Math.abs(" + a[0] + ")"; },
        round: function (a) { return "(int) Math.round(" + a[0] + ")"; },
        floor: function (a) { return "(int) Math.floor(" + a[0] + ")"; },
        ceiling: function (a) { return "(int) Math.ceil(" + a[0] + ")"; },
        int: function (a, k) { return k[0] === "bool" ? "(" + a[0] + " ? 1 : 0)" : "(int) " + held(a[0]); },
        length: function (a) { return held(a[0]) + ".length()"; },
        toupper: function (a) { return held(a[0]) + ".toUpperCase()"; },
        tolower: function (a) { return held(a[0]) + ".toLowerCase()"; },
        random: function (a) {
          return !a.length ? "Math.random()"
               : "((int) (Math.random() * (" + held(a[1]) + " - " + held(a[0]) +
                 " + 1)) + " + held(a[0]) + ")";
        },
        pow: function (a, k) {
          return (k[0] === "int" && k[1] === "int" ? "(int) " : "") +
                 "Math.pow(" + a.join(", ") + ")";
        },
        min: function (a) { return nested("Math.min", a); },
        max: function (a) { return nested("Math.max", a); }
      },
      whole: function (w) {
        classFile(w, function (w, inside) {
          var lists = inside.some(function (row) { return R_JAVA_UTIL.test(row); });
          var top = lists ? [[0, "import java.util.*;"], [0, ""]]
                  : w.needs.keys ? [[0, "import java.util.Scanner;"], [0, ""]] : [];
          // Not public: a public class only compiles in a file of exactly
          // its own name, and code that is copied rather than saved lands
          // in whatever file the editor made up for it -- Untitled-1, or
          // the first line of the paste.  This one runs from any of them.
          top.push([0, "class " + w.file + " {"]);
          if (w.needs.keys) {
            top.push([1, "static Scanner keyboard = new Scanner(System.in);"], [0, ""]);
          }
          return top;
        }, "public static void main(String[] args) {");
      },

      // ---- and the same program in a file each --------------------------
      // Java is laid out this way already -- a class to a file, named after
      // the class -- so a chart each is a class each: one for main, one for
      // every module, and one called Shared for what the whole program
      // shares.  A name that used to be a field beside everything that read
      // it is now reached through the class holding it: Shared.total, and
      // Receipt.receipt(n) for a module.  The one Scanner goes in there
      // too, because two Scanners over one keyboard read half an answer
      // each.
      sharedName: "Shared",
      fileName: function (name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      },
      reachMod: function (w, one) { return w.fileOf(one) + "."; },
      apart: function (w) {
        var L = this, files = [], wants = {};
        // Every chart is written before any file is, because what the
        // shared one has to hold is only known once all of them have been
        // asked -- one of them wanting to be typed into is what puts the
        // Scanner there.
        function body(write) {
          w.alone();
          var lines = w.aside(write);
          lines.after = w.aside(function () { helpersFor(w, 0); });
          // one Fn for every file, in a file of its own: an Fn inside each
          // class would be a different kind of thing in each
          lines.after = lines.after.filter(function (row) {
            return JAVA_FN_TYPE.indexOf(String(row).replace(/^\s*/, "    ")) < 0;
          });
          Object.keys(w.needs).forEach(function (what) { wants[what] = true; });
          return lines;
        }
        function brings(lines) {
          if (lines.concat(lines.after || []).some(function (row) { return R_JAVA_UTIL.test(row); })) {
            w.line(0, "import java.util.*;");
            w.line(0, "");
          }
        }

        w.reach = w.sharedFile + ".";
        var mine = w.mains();
        var main = body(function () { w.inside(null, 2, mine); });
        var each = w.mods.map(function (one) {
          return body(function () {
            w.line(1, "static " + w.returns(one) + " " + w.called(one) +
                      "(" + w.signature(one) + ") {");
            w.inside(one, 2);
            w.line(1, L.shut);
          });
        });

        files.push({ name: w.file, lines: w.aside(function () {
          w.line(0, L.note + w.title);
          brings(main);
          w.line(0, "class " + w.file + " {");
          w.line(1, "public static void main(String[] args) {");
          w.pour(main);
          w.line(1, L.shut);
          w.pour(main.after);
          w.line(0, L.shut);
        }) });

        // The shared class, where there is anything to put in it: what
        // the charts share, and the one Scanner if any of them is typed
        // into.  Where there is neither, there is no such file rather than
        // an empty class beside the others.
        w.reach = "";
        w.alone();
        var holds = w.sharing();
        if (holds.length || wants.keys) {
          files.push({ name: w.sharedFile, lines: w.aside(function () {
            var held = w.aside(function () {
              holds.forEach(function (one) {
                w.infront = L.field(one.fixed, one.plain);
                w.line(1, L.declare(w, one.entry, one.code, one.fixed, one.plain) + L.semi);
                w.infront = "";
              });
              if (wants.keys) {
                w.line(1, "static Scanner keyboard = new Scanner(System.in);");
              }
              helpersFor(w, 0);
            });
            w.line(0, L.note + w.title + " -- " + TXT.code_shares);
            if (held.some(function (row) { return R_JAVA_UTIL.test(row); })) {
              w.line(0, "import java.util.*;"); w.line(0, "");
            } else if (wants.keys) { w.line(0, "import java.util.Scanner;"); w.line(0, ""); }
            w.line(0, "class " + w.sharedFile + " {");
            w.pour(held);
            w.line(0, L.shut);
          }) });
        }

        if (wants.fn) {
          files.push({ name: "Fn", lines: w.aside(function () {
            w.line(0, L.note + w.title);
            JAVA_FN_TYPE.forEach(function (row) { w.line(0, row.replace(/^ {4}/, "")); });
          }) });
        }
        w.reach = w.sharedFile + ".";
        w.mods.forEach(function (one, at) {
          files.push({ name: w.fileOf(one), lines: w.aside(function () {
            w.line(0, L.note + w.title + " -- " + w.about(one));
            brings(each[at]);
            w.line(0, "class " + w.fileOf(one) + " {");
            w.pour(each[at]);
            w.pour(each[at].after);
            w.line(0, L.shut);
          }) });
        });
        return files;
      }
    },

    csharp: {
      like: CURLY,
      name: "C#", ext: "cs",
      kinds: { int: "int", real: "double", text: "string", bool: "bool" },
      bigInt: "long",
      kept: "abstract as base bool break byte case catch char checked class " +
            "const continue decimal default delegate do double else enum event " +
            "explicit extern false finally fixed float for foreach goto if " +
            "implicit in int interface internal is lock long namespace new " +
            "null object operator out override params private protected " +
            "public readonly ref return sbyte sealed short sizeof stackalloc " +
            "static string struct switch this throw true try typeof uint ulong " +
            "unchecked unsafe ushort using virtual void volatile while " +
            "Console Math Random Environment rng Main",
      cash: function (code) { return held(code) + '.ToString("F2")'; },
      // A const has to be something the compiler can work out on the spot.
      // One that has to be worked out when the program runs is an ordinary
      // local, or -- shared -- a field nobody may write to again.
      lead: function (fixed, plain) { return fixed && plain ? "const " : ""; },
      field: function (fixed, plain) {
        return fixed && plain ? "" : fixed ? "static readonly " : "static ";
      },
      // Main is the way in, so it cannot also be the class around it.
      named: function (name) { return name === "Main" ? "Program" : name; },
      say: function (said) { return "Console.WriteLine(" + said + ")"; },
      hint: function (question) { return "Console.Write(" + question + ")"; },
      ask: function (kind) {
        var read = "Console.ReadLine()";
        return kind === "whole" ? "int.Parse(" + read + ")"
             : kind === "real" ? "double.Parse(" + read + ")"
             : kind === "flag" ? "bool.Parse(" + read + ")" : read;
      },
      over: function (a, b) { return "(double)" + a + " / " + b; },
      into: function (a, b, whole) {
        return whole ? a + " / " + b : "(int)Math.Floor(" + a + " / " + b + ")";
      },
      power: function (a, b, whole) {
        return (whole ? "(int)" : "") + "Math.Pow(" + a + ", " + b + ")";
      },
      ordered: function (a, op, b) {
        return "string.Compare(" + a + ", " + b + ") " + op + " 0";
      },
      narrow: function (code) { return "(int)" + held(code); },
      switches: function (kind, plain) {
        return plain && (kind === "int" || kind === "text" || kind === "bool");
      },
      quit: function (w, inMain) { return inMain ? "return" : "Environment.Exit(0)"; },
      // Said from the root rather than through a using, so the top of the
      // file is the same whether the program waits or not.
      pause: function (w, item, deep) {
        w.line(deep, "System.Threading.Thread.Sleep(" +
                     intOf(napFor(w, item, "ms")) + ");");
      },
      // C# says it outright, at both ends: `ref` where the module is
      // written and `ref` again where it is called.
      refs: "own",
      byRef: function (type, name) { return "ref " + type + name; },
      refArg: function (code) { return "ref " + code; },
      calls: {
        sqrt: function (a) { return "Math.Sqrt(" + a[0] + ")"; },
        abs: function (a) { return "Math.Abs(" + a[0] + ")"; },
        // A half goes up, the way the runner rounds: Math.Round would take
        // it to the even one, and AwayFromZero takes -2.5 down to -3.
        round: function (a) { return "(int)Math.Floor(" + held(a[0]) + " + 0.5)"; },
        floor: function (a) { return "(int)Math.Floor(" + a[0] + ")"; },
        ceiling: function (a) { return "(int)Math.Ceiling(" + a[0] + ")"; },
        int: function (a, k) { return k[0] === "bool" ? "(" + a[0] + " ? 1 : 0)" : "(int)" + held(a[0]); },
        length: function (a) { return held(a[0]) + ".Length"; },
        toupper: function (a) { return held(a[0]) + ".ToUpper()"; },
        tolower: function (a) { return held(a[0]) + ".ToLower()"; },
        random: function (a, k, w) {
          w.need("dice");
          var dice = w.reach + "rng";   // beside this line, or in Shared
          return !a.length ? dice + ".NextDouble()"
               : dice + ".Next(" + a[0] + ", " + held(a[1]) + " + 1)";
        },
        pow: function (a, k) {
          return (k[0] === "int" && k[1] === "int" ? "(int)" : "") +
                 "Math.Pow(" + a.join(", ") + ")";
        },
        min: function (a) { return nested("Math.Min", a); },
        max: function (a) { return nested("Math.Max", a); }
      },
      whole: function (w) {
        classFile(w, function (w, inside) {
          var top = [[0, "using System;"]];
          if (inside.some(function (row) { return R_CS_LISTS.test(row); })) {
            top.push([0, "using System.Collections.Generic;"], [0, "using System.Linq;"]);
          }
          top.push([0, ""], [0, "class " + w.file + " {"]);
          if (w.needs.dice) { top.push([1, "static Random rng = new Random();"], [0, ""]); }
          return top;
        }, "static void Main() {");
      },

      // ---- and the same program in a file each --------------------------
      // The same shape as Java's, and for the same reason: a class each,
      // in a file each, with what the whole program shares in a static
      // class of its own that everything else reaches through -- and the
      // one Random in there with them, so that a program which rolls dice
      // in two modules is rolling one set of dice.
      sharedName: "Shared",
      fileName: function (name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      },
      reachMod: function (w, one) { return w.fileOf(one) + "."; },
      ownName: true,
      apart: function (w) {
        var L = this, files = [], wants = {};
        function body(write) {
          w.alone();
          var lines = w.aside(write);
          lines.after = w.aside(function () { helpersFor(w, 0); });
          Object.keys(w.needs).forEach(function (what) { wants[what] = true; });
          return lines;
        }
        function file(name, what, write, lines) {
          files.push({ name: name, lines: w.aside(function () {
            w.line(0, L.note + w.title + (what ? " -- " + what : ""));
            w.line(0, "using System;");
            if ((lines || []).some(function (row) { return R_CS_LISTS.test(row); })) {
              w.line(0, "using System.Collections.Generic;");
              w.line(0, "using System.Linq;");
            }
            w.line(0, "");
            write();
          }) });
        }

        w.reach = w.sharedFile + ".";
        var mine = w.mains();
        var main = body(function () { w.inside(null, 2, mine); });
        // Everything a class holds here is its own unless it is said to
        // be everybody's, and split into classes these are read from
        // outside the one that holds them.  In the single file they were
        // all in the one class, where static was the whole of it.
        var each = w.mods.map(function (one) {
          return body(function () {
            w.line(1, "public static " + w.returns(one) + " " + w.called(one) +
                      "(" + w.signature(one) + ") {");
            w.inside(one, 2);
            w.line(1, L.shut);
          });
        });

        file(w.file, "", function () {
          w.line(0, "class " + w.file + " {");
          w.line(1, "static void Main() {");
          w.pour(main);
          w.line(1, L.shut);
          w.pour(main.after);
          w.line(0, L.shut);
        }, main.concat(main.after));

        // The same, and the one Random with them: a program that rolls
        // dice in two charts is rolling one set of dice.
        w.reach = "";
        w.alone();
        var holds = w.sharing();
        var held = w.aside(function () {
          holds.forEach(function (one) {
            w.infront = "public " + L.field(one.fixed, one.plain);
            w.line(1, L.declare(w, one.entry, one.code, one.fixed, one.plain) + L.semi);
            w.infront = "";
          });
          if (wants.dice) {
            w.line(1, "public static Random rng = new Random();");
          }
          helpersFor(w, 0);
        });
        if (holds.length || wants.dice) {
          file(w.sharedFile, TXT.code_shares, function () {
            w.line(0, "static class " + w.sharedFile + " {");
            w.pour(held);
            w.line(0, L.shut);
          }, held);
        }

        w.reach = w.sharedFile + ".";
        w.mods.forEach(function (one, at) {
          file(w.fileOf(one), w.about(one), function () {
            w.line(0, "class " + w.fileOf(one) + " {");
            w.pour(each[at]);
            w.pour(each[at].after);
            w.line(0, L.shut);
          }, each[at].concat(each[at].after));
        });
        return files;
      }
    },

    cpp: {
      like: CURLY,
      name: "C++", ext: "cpp",
      kinds: { int: "int", real: "double", text: "std::string", bool: "bool" },
      bigInt: "long long",
      flagText: function (code) { return "(" + code + " ? \"True\" : \"False\")"; },
      kept: "alignas alignof and and_eq asm auto bitand bitor bool break case " +
            "catch char char16_t char32_t class compl const constexpr " +
            "const_cast continue decltype default delete do double " +
            "dynamic_cast else enum explicit export extern false float for " +
            "friend goto if inline int long mutable namespace new noexcept not " +
            "not_eq nullptr operator or or_eq private protected public " +
            "register reinterpret_cast return short signed sizeof static " +
            "static_assert static_cast struct switch template this " +
            "thread_local throw true try typedef typeid typename union " +
            "unsigned using virtual void volatile wchar_t while xor xor_eq " +
            "main std askWhole askReal askText askFlag money toUpper toLower " +
            "nap " +
            // and what the C library has already put in every file's way
            "time rand srand abs round floor ceil sqrt pow exit fmod div log " +
            "exp sin cos tan index remove rename signal",
      lead: function (fixed) { return fixed ? "const " : ""; },
      field: function () { return ""; },
      // Writing out is a chain of <<, not a sum.  "You are " + age is a
      // thing C++ will not add up -- one side is a string literal and the
      // other a number -- so the pieces go into the stream one after
      // another instead.  Money goes through a helper at the top of the
      // file: std::fixed said in the stream itself stays said, and every
      // number printed after the first price would come out as a price.
      cash: function (code, kind, w) { w.need("money"); return "money(" + code + ")"; },
      join: function (bits, w) {
        var L = this;
        return bits.map(function (bit) {
          // a number with a point the way the chart writes one -- cout alone
          // would give six figures, 20.3333, or 1.23457e+06
          if (!bit.cash && bit.kind === "real" &&
              !(/^-?\d+(\.\d+)?$/.test(bit.code) && bit.code.replace(/[-.]/g, "").replace(/^0+/, "").length <= 6)) {
            w.need("realText");
            return "realText(" + bit.code + ")";
          }
          return bit.cash ? L.cash(bit.code, bit.kind, w)
               : bit.loose ? "(" + bit.code + ")" : bit.code;
        }).join(" << ");
      },
      say: function (said) { return "std::cout << " + said + " << std::endl"; },
      // No endl, so the answer is typed beside it; std::cin is tied to
      // std::cout, and reading from one empties what is waiting in the other.
      hint: function (question) { return "std::cout << " + question; },
      // Reading is a statement in C++ rather than something a name can be
      // set to: std::cin >> x fills a name it is given, where every other
      // language here hands a value back.  So the file opens with small
      // readers that do hand one back, and the program calls those.
      ask: function (kind, w) {
        var reader = kind === "whole" ? "askWhole" : kind === "real" ? "askReal"
                   : kind === "flag" ? "askFlag" : "askText";
        w.need(reader);
        if (reader === "askFlag") { w.need("askText"); }
        return reader + "()";
      },
      over: function (a, b) { return "(double)" + a + " / " + b; },
      into: function (a, b, whole, w) {
        if (whole) { return a + " / " + b; }
        w.need("cmath");
        return "(int)std::floor(" + a + " / " + b + ")";
      },
      power: function (a, b, whole, w) {
        w.need("cmath");
        return whole ? "(int)std::round(std::pow(" + a + ", " + b + "))"
                     : "std::pow(" + a + ", " + b + ")";
      },
      // % is for whole numbers only here; what is left over from dividing
      // two Reals is fmod's to work out.
      rest: function (a, b, w) { w.need("cmath"); return "std::fmod(" + a + ", " + b + ")"; },
      // A number joined to words has to be made into words first, and two
      // pieces of quoted text cannot be added at all until one of them is a
      // std::string.
      worded: function (code) { return "std::to_string(" + code + ")"; },
      words: function (code) { return "std::string(" + code + ")"; },
      narrow: function (code) { return "(int)" + held(code); },
      switches: function (kind, plain) { return plain && kind === "int"; },
      quit: function (w, inMain) {
        if (inMain) { return "return 0"; }
        w.need("cstdlib");
        return "std::exit(0)";
      },
      pause: function (w, item, deep) {
        w.need("nap");
        w.line(deep, "nap(" + napFor(w, item, "s") + ");");
      },
      refs: "own",
      byRef: function (type, name) { return type + "&" + name; },
      refArg: function (code) { return code; },
      // A list or a table the module changes is the caller's own, not a copy.
      param: function (w, p, how) {
        var type = this.typed(p.entry, w);
        if (!how && p.entry.changed && (isListKind(p.entry.kind) || isTableKind(p.entry.kind))) { how = "own"; }
        return how ? this.byRef(type, w.spelled(p.entry), how) : type + w.spelled(p.entry);
      },
      calls: {
        sqrt: function (a, k, w) { w.need("cmath"); return "std::sqrt(" + a[0] + ")"; },
        abs: function (a, k, w) {
          w.need("cmath"); w.need("cstdlib");      // one header each, for Real and whole
          return "std::abs(" + a[0] + ")";
        },
        round: function (a, k, w) { w.need("cmath"); return "(int)std::floor(" + held(a[0]) + " + 0.5)"; },
        floor: function (a, k, w) { w.need("cmath"); return "(int)std::floor(" + a[0] + ")"; },
        ceiling: function (a, k, w) { w.need("cmath"); return "(int)std::ceil(" + a[0] + ")"; },
        int: function (a) { return "(int)" + held(a[0]); },
        length: function (a) {
          return "(int)" + (/^"/.test(a[0]) ? "std::string(" + a[0] + ")" : held(a[0])) +
                 ".length()";
        },
        toupper: function (a, k, w) { w.need("toUpper"); return "toUpper(" + a[0] + ")"; },
        tolower: function (a, k, w) { w.need("toLower"); return "toLower(" + a[0] + ")"; },
        random: function (a, k, w) {
          w.need("dice");
          return !a.length ? "((double)std::rand() / RAND_MAX)"
               : "(std::rand() % (" + held(a[1]) + " - " + held(a[0]) + " + 1) + " +
                 held(a[0]) + ")";
        },
        pow: function (a, k, w) {
          return this.power(a[0], a[1], k[0] === "int" && k[1] === "int", w);
        },
        // std::min wants both sides the same type, and says so at length.
        min: function (a, k, w) {
          w.need("algorithm");
          return "std::min<" + this.kinds[bothKinds(k[0], k[1]) || "real"] + ">(" +
                 a.join(", ") + ")";
        },
        max: function (a, k, w) {
          w.need("algorithm");
          return "std::max<" + this.kinds[bothKinds(k[0], k[1]) || "real"] + ">(" +
                 a.join(", ") + ")";
        }
      },
      // The small functions a program may need at the top of its file, and
      // what each of them needs included before it will compile.
      //
      // The two number readers throw away the rest of the line after the
      // number.  Without that, >> leaves the newline sitting in the stream
      // and the next getline reads it as an empty answer -- so a program
      // that asks for a number and then for a word appears to skip the
      // second question entirely.
      //
      // And each of them stops the program when there is nothing it can
      // read, the way Python, Java and C# all stop.  A >> that fails hands
      // back 0 and leaves std::cin refusing every read after it, so one
      // mistyped answer -- or the end of the input -- used to be 0, then 0
      // again, for ever: a loop waiting for -1 never ended.
      helpers: {
        askWhole: { wants: ["cstdlib"],
                    lines: ["static int askWhole() {", "    int v = 0;",
                            "    if (!(std::cin >> v)) {",
                            '        std::cerr << "That was not a whole number." << std::endl;',
                            "        std::exit(1);",
                            "    }",
                            "    std::cin.ignore(10000, '\\n');",
                            "    return v;", "}"] },
        askReal: { wants: ["cstdlib"],
                   lines: ["static double askReal() {", "    double v = 0;",
                           "    if (!(std::cin >> v)) {",
                           '        std::cerr << "That was not a number." << std::endl;',
                           "        std::exit(1);",
                           "    }",
                           "    std::cin.ignore(10000, '\\n');",
                           "    return v;", "}"] },
        askText: { wants: ["cstdlib"],
                   lines: ["static std::string askText() {", "    std::string v;",
                           "    if (!std::getline(std::cin, v)) {",
                           '        std::cerr << "There was nothing more to read." << std::endl;',
                           "        std::exit(1);",
                           "    }",
                           "    return v;", "}"] },
        askFlag: { lines: ["static bool askFlag() {",
                           '    return askText() == "true";', "}"] },
        money: { wants: ["iomanip", "sstream"],
                 lines: ["static std::string money(double v) {",
                         "    std::ostringstream s;",
                         "    s << std::fixed << std::setprecision(2) << v;",
                         "    return s.str();", "}"] },
        toUpper: { wants: ["cctype"],
                   lines: ["static std::string toUpper(std::string s) {",
                           "    for (size_t i = 0; i < s.length(); i++) {",
                           "        s[i] = (char)std::toupper((unsigned char)s[i]);",
                           "    }", "    return s;", "}"] },
        toLower: { wants: ["cctype"],
                   lines: ["static std::string toLower(std::string s) {",
                           "    for (size_t i = 0; i < s.length(); i++) {",
                           "        s[i] = (char)std::tolower((unsigned char)s[i]);",
                           "    }", "    return s;", "}"] },
        dice: { wants: ["cstdlib", "ctime"], lines: [] },
        // Seconds, and a fraction of one if that is what was asked for:
        // sleep_for is told a duration rather than a number, and the
        // duration is the one that keeps "Wait 0.5 seconds" at half a
        // second instead of rounding it away to none.
        nap: { wants: ["chrono", "thread"],
               lines: ["static void nap(double seconds) {",
                       "    std::this_thread::sleep_for(" +
                       "std::chrono::duration<double>(seconds));",
                       "}"] }
      },
      whole: function (w) {
        var L = this;
        function shared(item) { return item.scope === "global" && item.op === "declare"; }
        var main = w.prog.main.items;
        var inside = w.aside(function () {
          // What the whole program shares goes above the modules, not inside
          // main: a file is read from the top down here, and a name declared
          // in main is a name no module above it has ever heard of.
          var recs = recordsIn(w.prog);
          if (Object.keys(recs).length) { L.records(w, recs); }
          var before = w.count();
          w.line(0, "");
          main.filter(shared).forEach(function (item) { w.each(item, 0); });
          w.sharedLines(0);
          if (w.count() === before + 1) { w.unline(); }
          // And the modules above main for the same reason: C++ will not
          // call a name it has not met yet.  Where there is more than one,
          // each is announced first, so that they can call one another
          // whichever order they were written in.
          if (w.mods.length > 1) {
            w.line(0, "");
            w.mods.forEach(function (one) {
              w.line(0, w.returns(one) + " " + w.called(one) +
                        "(" + w.signature(one) + ");");
            });
          }
          w.mods.forEach(function (one) {
            w.line(0, "");
            w.line(0, w.returns(one) + " " + w.called(one) +
                      "(" + w.signature(one) + ")" + L.open);
            w.inside(one, 1);
            w.line(0, L.shut);
          });
          w.line(0, "");
          w.line(0, "int main()" + L.open);
          if (w.needs.dice) { w.line(1, "std::srand((unsigned)std::time(0));"); }
          w.inside(null, 1, main.filter(function (item) { return !shared(item); }));
          w.line(1, "return 0;");
          w.line(0, L.shut);
        });
        var helpers = Object.keys(L.helpers).filter(function (name) { return w.needs[name]; });
        var wants = { iostream: true, string: true };
        CPP_LIBS.forEach(function (lib) {
          if (w.needs[lib]) { wants[lib] = true; }
        });
        helpers.forEach(function (name) {
          (L.helpers[name].wants || []).forEach(function (lib) { wants[lib] = true; });
        });
        w.line(0, L.note + w.title);
        Object.keys(wants).sort().forEach(function (lib) {
          w.line(0, "#include <" + lib + ">");
        });
        helpers.forEach(function (name) {
          if (!L.helpers[name].lines.length) { return; }
          w.line(0, "");
          L.helpers[name].lines.forEach(function (row) { w.line(0, row); });
        });
        w.pour(inside);
      },

      // ---- and the same program in a file each --------------------------
      // C++ is two files to a chart rather than one: a header saying what
      // is there, and the file that is it.  Anything wanting to call a
      // module includes that module's header, which is how C++ is told a
      // name exists before the line that uses it -- and it settles by
      // itself the thing the single file had to be careful about, which is
      // that a name has to be written above everything that calls it.
      //
      // What the whole program shares is announced `extern` in the shared
      // header and written down once in the file beside it.  The small
      // readers and printers are static, so a file that wants one has its
      // own copy and no two of them collide.
      sharedName: "shared",
      apart: function (w) {
        var L = this, files = [];
        function part(name, ext, write) {
          files.push({ name: name, ext: ext, lines: w.aside(write) });
        }
        // The top of a file that is a file rather than a header: its own
        // header, the headers of whatever it calls, and then the libraries
        // it and the helpers it wanted turned out to need.
        function brings(own, mods, uses) {
          if (own) { w.line(0, '#include "' + own + '.h"'); }
          if (uses) { w.line(0, '#include "' + w.sharedFile + '.h"'); }
          mods.forEach(function (one) {
            w.line(0, '#include "' + w.fileOf(one) + '.h"');
          });
          var wants = { iostream: true, string: true };
          CPP_LIBS.forEach(function (lib) {
            if (w.needs[lib]) { wants[lib] = true; }
          });
          var helpers = Object.keys(L.helpers).filter(function (name) {
            return w.needs[name];
          });
          helpers.forEach(function (name) {
            (L.helpers[name].wants || []).forEach(function (lib) { wants[lib] = true; });
          });
          Object.keys(wants).sort().forEach(function (lib) {
            w.line(0, "#include <" + lib + ">");
          });
          helpers.forEach(function (name) {
            if (!L.helpers[name].lines.length) { return; }
            w.line(0, "");
            L.helpers[name].lines.forEach(function (row) { w.line(0, row); });
          });
        }
        function header(name, write) {
          var said = w.aside(write);
          part(name, "h", function () {
            w.line(0, "#pragma once");
            w.line(0, "#include <string>");
            // and the lists and tables it names, where it names any
            if (said.some(function (row) { return /std::map</.test(row); })) { w.line(0, "#include <map>"); }
            if (said.some(function (row) { return /std::vector</.test(row); })) { w.line(0, "#include <vector>"); }
            // a Value named here is made in full in each file that has one
            if (said.some(function (row) { return /\bValue\b/.test(row); })) { w.line(0, ""); w.line(0, "struct Value;"); }
            w.line(0, "");
            w.pour(said);
          });
        }

        // Main.  Its body is written first, so that what goes above it is
        // what this file turned out to want rather than what some other
        // one did -- and so that a program which rolls dice in main is
        // seeded, which reading needs.dice before writing main never was.
        var mine = w.mains();
        w.alone();
        var main = w.aside(function () { w.inside(null, 1, mine); });
        var seeds = w.needs.dice;
        part(w.file, "cpp", function () {
          w.line(0, L.note + w.title);
          brings("", w.leaning(mine, null), w.touching(w.prog.main, mine));
          w.line(0, "");
          w.line(0, "int main()" + L.open);
          if (seeds) { w.line(1, "std::srand((unsigned)std::time(0));"); }
          w.pour(main);
          w.line(1, "return 0;");
          w.line(0, L.shut);
        });

        // What the charts share, announced in a header and written down
        // once in the file beside it -- where there is anything shared to
        // announce.
        w.alone();
        var holds = w.sharing();
        if (holds.length) {
          header(w.sharedFile, function () {
            holds.forEach(function (one) {
              w.line(0, "extern " + (one.fixed ? "const " : "") +
                     typeOfKind(L, one.entry.kind, w) + " " + one.name + ";");
            });
          });
          part(w.sharedFile, "cpp", function () {
            w.line(0, L.note + w.title + " -- " + TXT.code_shares);
            brings(w.sharedFile, [], false);
            w.line(0, "");
            holds.forEach(function (one) {
              // A const at the top of a file is that file's own unless it
              // is told to be everybody's, and the header has said it is.
              w.line(0, (one.fixed ? "extern const " : "") +
                     typeOfKind(L, one.entry.kind, w) + " " + one.name + " = " + one.code + ";");
            });
          });
        }

        w.mods.forEach(function (one) {
          w.alone();
          var said = w.aside(function () {
            w.line(0, w.returns(one) + " " + w.called(one) +
                   "(" + w.signature(one) + ")" + L.open);
            w.inside(one, 1);
            w.line(0, L.shut);
          });
          var head = w.returns(one) + " " + w.called(one) +
                     "(" + w.signature(one) + ");";
          header(w.fileOf(one), function () { w.line(0, head); });
          part(w.fileOf(one), "cpp", function () {
            w.line(0, L.note + w.title + " -- " + w.about(one));
            brings(w.fileOf(one), w.leaning(one.body, one),
                   w.touching(one.scope, one.body));
            w.line(0, "");
            w.pour(said);
          });
        });
        return files;
      }
    },

    javascript: {
      like: CURLY,
      name: "JavaScript", ext: "js",
      paramDefault: function (code) { return " = " + code; },
      tab: "  ", eq: "===", ne: "!==",
      kinds: null,
      kept: "break case catch class const continue debugger default delete do " +
            "else enum export extends false finally for function if " +
            "implements import in instanceof interface let new null package " +
            "private protected public return static super switch this throw " +
            "true try typeof var void while with yield await async console " +
            "Math Number String Buffer ask stop wait prompt require process " +
            // What a file run by node is handed and would rather keep: a
            // program written out in several is read as a module, and a
            // variable called exports standing where the exports are is
            // the file handing back nothing at all.
            "module exports Date",
      lead: function (fixed) { return fixed ? "const " : "let "; },
      head: function () { return "let "; },
      cash: function (code) { return held(code) + ".toFixed(2)"; },
      say: function (said) { return "console.log(" + said + ")"; },
      ask: function (kind, w, question) {
        w.need("ask");
        var read = "ask(" + (question || "") + ")";
        return kind === "text" ? read
             : kind === "flag" ? read + ' === "true"' : "Number(" + read + ")";
      },
      into: function (a, b) { return "Math.floor(" + a + " / " + b + ")"; },
      pow: "**",
      switches: function () { return true; },
      quit: function (w) { w.need("stop"); return "stop()"; },
      pause: function (w, item, deep) {
        w.need("wait");
        w.line(deep, "wait(" + napFor(w, item, "ms") + ");");
      },
      refs: "back",
      handBack: function (names) {
        return names.length === 1 ? names[0] : "[" + names.join(", ") + "]";
      },
      takeBack: function (targets) {
        return targets.length === 1 ? targets[0]
             : "[" + targets.map(function (t) { return t || ""; }).join(", ") + "]";
      },
      calls: {
        sqrt: function (a) { return "Math.sqrt(" + a[0] + ")"; },
        abs: function (a) { return "Math.abs(" + a[0] + ")"; },
        round: function (a) { return "Math.round(" + a[0] + ")"; },
        floor: function (a) { return "Math.floor(" + a[0] + ")"; },
        ceiling: function (a) { return "Math.ceil(" + a[0] + ")"; },
        int: function (a, k) { return k[0] === "text" ? "Math.trunc(parseFloat(" + a[0] + ") || 0)" : "Math.trunc(" + a[0] + ")"; },
        length: function (a) { return held(a[0]) + ".length"; },
        toupper: function (a) { return held(a[0]) + ".toUpperCase()"; },
        tolower: function (a) { return held(a[0]) + ".toLowerCase()"; },
        random: function (a) {
          return !a.length ? "Math.random()"
               : "(Math.floor(Math.random() * (" + held(a[1]) + " - " + held(a[0]) +
                 " + 1)) + " + held(a[0]) + ")";
        },
        pow: function (a) { return "Math.pow(" + a.join(", ") + ")"; },
        min: function (a) { return "Math.min(" + a.join(", ") + ")"; },
        max: function (a) { return "Math.max(" + a.join(", ") + ")"; }
      },
      // prompt() is a browser's, and there is no such thing in Node; reading
      // the keyboard is Node's, and there is no such thing in a browser.
      // Code that only ran in one of them would be code that did not run
      // for half the people who pasted it somewhere, so it asks whichever
      // way is there to be asked.
      //
      // At the end of the input it stops, as Python's input() does.  It used
      // to hand back "" there -- and then "" again, as fast as it was asked
      // -- so a loop waiting for -1 went round for ever on Number(""), 0.
      helpers: {
        ask: ["// Asks for something to be typed in: a box in a browser, the keyboard in Node.",
              'function ask(question = "") {',
              '  if (typeof prompt === "function") { return prompt(question) || ""; }',
              '  const fs = require("fs"), one = Buffer.alloc(1), typed = [];',
              "  let got = 0;",
              "  process.stdout.write(question);",
              "  try {",
              "    while ((got = fs.readSync(0, one, 0, 1)) === 1 && one[0] !== 10) {",
              "      if (one[0] !== 13) { typed.push(one[0]); }",
              "    }",
              "  } catch (nothingTyped) { /* the end of what there was to read */ }",
              '  if (got !== 1 && !typed.length) { throw new Error("There was nothing more to read."); }',
              '  return Buffer.from(typed).toString("utf8");',
              "}"],
        wait: ["// Waits where it stands, the way the chart does.  The rest of",
               "// this program is written straight down the page, and the only",
               "// waiting a program written that way can do is to hold on to",
               "// the thread until the time it was given is up.",
               "function wait(ms) {",
               "  const until = Date.now() + ms;",
               "  while (Date.now() < until) { /* nothing to do but wait */ }",
               "}"],
        stop: ["// Stops the program where it stands.",
               "function stop() {",
               '  if (typeof process !== "undefined" && process.exit) { process.exit(0); }',
               '  throw new Error("The program has ended.");',
               "}"]
      },
      whole: function (w) {
        var L = this;
        var inside = w.aside(function () {
          w.mods.forEach(function (one) {
            w.line(0, "");
            w.line(0, "function " + w.called(one) + "(" + w.signature(one) + ") {");
            w.inside(one, 1);
            w.line(0, "}");
          });
          w.line(0, "");
          w.sharedLines(0);
          w.inside(null, 0);
        });
        w.line(0, L.note + w.title);
        helpersFor(w, 0);
        L.records(w, recordsIn(w.prog));
        w.pour(inside);
      },

      // ---- and the same program in a file each --------------------------
      // A file each, brought in with require -- which is what `node
      // main.js` understands with nothing else set up around it, where
      // import needs a package.json or a different ending on every file.
      //
      // What the whole program shares is one object that every file is
      // handed, so that setting shared.total anywhere sets the one there
      // is.  Exported names are put on the object a file was given rather
      // than in place of it: two modules that call one another are each
      // handed the other's exports half-written, and a name added to that
      // object is on it by the time anything calls it.
      sharedName: "shared",
      reachMod: function (w, one) { return w.fileOf(one) + "."; },
      apart: function (w) {
        var L = this, files = [];
        function top(what, mods, uses) {
          w.line(0, L.note + w.title + (what ? " -- " + what : ""));
          if (uses) {
            w.line(0, "const " + w.sharedFile + ' = require("./' +
                   w.sharedFile + '.js");');
          }
          mods.forEach(function (one) {
            w.line(0, "const " + w.fileOf(one) + ' = require("./' +
                   w.fileOf(one) + '.js");');
          });
          Object.keys(L.helpers).forEach(function (name) {
            if (!w.needs[name]) { return; }
            w.line(0, "");
            L.helpers[name].forEach(function (row) { w.line(0, row); });
          });
          w.line(0, "");
        }

        w.reach = w.sharedFile + ".";
        var mine = w.mains();
        w.alone();
        var main = w.aside(function () { w.inside(null, 0, mine); });
        files.push({ name: w.file, lines: w.aside(function () {
          top("", w.leaning(mine, null), w.touching(w.prog.main, mine));
          w.pour(main);
        }) });

        // And what they share, in a file of its own, where there is
        // anything shared to put in it.
        w.alone();
        var holds = w.sharing();
        if (holds.length) {
          files.push({ name: w.sharedFile, lines: w.aside(function () {
            w.line(0, L.note + w.title + " -- " + TXT.code_shares);
            w.line(0, "const " + w.sharedFile + " = {};");
            holds.forEach(function (one) {
              w.line(0, w.sharedFile + "." + one.name + " = " + one.code + ";");
            });
            w.line(0, "");
            w.line(0, "module.exports = " + w.sharedFile + ";");
          }) });
        }

        w.mods.forEach(function (one) {
          w.alone();
          var said = w.aside(function () {
            w.line(0, "function " + w.called(one) + "(" + w.signature(one) + ") {");
            w.inside(one, 1);
            w.line(0, "}");
          });
          files.push({ name: w.fileOf(one), lines: w.aside(function () {
            top(w.about(one), w.leaning(one.body, one),
                w.touching(one.scope, one.body));
            w.pour(said);
            w.line(0, "");
            w.line(0, "exports." + w.called(one) + " = " + w.called(one) + ";");
          }) });
        });
        return files;
      }
    }
  };

  // `like` filled in, once, so that the writer can read one flat block.
  // ceil and integer are other spellings of ceiling and int, in every
  // language alike, so they are filled in here too rather than five times.
  Object.keys(LANGS).forEach(function (code) {
    var mine = LANGS[code];
    if (mine.like) {
      LANGS[code] = Object.assign({}, mine.like, mine);
      delete LANGS[code].like;
    }
    mine = LANGS[code];
    mine.calls.ceil = mine.calls.ceiling;
    mine.calls.integer = mine.calls.int;
    var kept = Object.create(null);
    String(mine.kept || "").split(/\s+/).forEach(function (word) {
      if (word) { kept[word] = true; }
    });
    mine.kept = kept;
  });

  // ============================================ lists, tables, records ==
  // The pseudocode has lists ([1, 2], scores[i]), tables ({"tea": 2},
  // prices["tea"]) and records (New Point, p.x), and For Each to go round
  // them.  Each language has its own of each -- a list, an ArrayList, a
  // List<T>, a std::vector -- and its own way of doing what the runner's
  // built-ins do (append, join, sort, keys, ...).  What each one does is
  // here, beside the rest of what makes one language differ from another.

  // A kind (18-ahead.js: int, list:int, table:text:real, rec:Point) as the
  // type a typed language writes for it.
  function typeOfKind(L, kind, w) {
    if (!L.kinds) { return ""; }
    if (kind === "none") { kind = "text"; }
    if (kind === "any") {
      if (w && L.anyNeeds) { w.need(L.anyNeeds); }
      return L.anyType || L.kinds.text;
    }
    if (isListKind(kind)) {
      if (w) { w.need("vector"); }
      return L.listType(typeOfKind(L, elemOf(kind) || "real", w), elemOf(kind) || "real");
    }
    if (isTableKind(kind)) {
      if (w) { w.need("map"); }
      return L.tableType(typeOfKind(L, tableKey(kind) || "text", w),
                         typeOfKind(L, tableValue(kind) || "real", w), kind);
    }
    if (isRecKind(kind)) { return L.recType(kind.slice(4), w); }
    if (kind === "fn") { return L.fnType || L.kinds.real; }
    return L.kinds[kind] || L.kinds.real;
  }

  // Every kind of record the program makes, and what each one holds.
  function recordsIn(prog) {
    var out = Object.create(null);
    Object.keys(prog.records || {}).forEach(function (kind) { if (kind) { out[kind] = prog.records[kind]; } });
    prog.scopes.forEach(function (scope) {
      eachStep(scope.items, function (item) {
        sumsOf(item).forEach(function (src) {
          (function look(n) {
            if (!n || typeof n !== "object") { return; }
            if (n.record && !out[n.record]) { out[n.record] = { name: n.record, fields: Object.create(null) }; }
            for (var key in n) { if (n[key] && typeof n[key] === "object") { look(n[key]); } }
          })(tree(src));
        });
      });
    });
    return out;
  }

  // A record laid out field by field (TYPE, RECORD: 18-ahead.js): its
  // fields in the order they were written, or none for any other record.
  function laidFields(rec) {
    return rec && rec.laid ? rec.laid.map(function (low) { return rec.fields[low]; }) : [];
  }
  // What a field starts out holding.  A record inside one starts as nothing
  // yet: made there and then, a record that holds another of its own kind
  // would go on making them for ever.
  function fieldZero(w, kind) {
    if (isRecKind(kind)) { return w.L.nullValue || (w.L.yes === "True" ? "None" : "null"); }
    return w.zero(kind);
  }
  // ... said in the class's own constructor, where the language would start
  // it as something else (a Java String starts as null, not as words).
  function laidStarts(w, laid, reach, cpp) {
    if (cpp) { return ""; }                     // std::string{} and 0 already
    return laid.filter(function (f) {
      return f.kind === "text" || isListKind(f.kind) || isTableKind(f.kind);
    }).map(function (f) { return " " + reach + w.fieldName(f.name) + " = " + fieldZero(w, f.kind) + ";"; }).join("");
  }
  // The fields handed over in order, each as the kind the class keeps it as.
  function laidParams(w, laid, fields) {
    return laid.map(function (f) {
      var kept = fields[lowered(f.name)] || f;
      return w.typeOf(kept.kind || "real") + " " + w.fieldName(f.name);
    }).join(", ");
  }

  // Every field any record has, for the one class the typed languages keep
  // them all in: a Square handed to what a Rect is handed has to have what a
  // Rect has.
  function unionFields(prog) {
    var out = Object.create(null);
    Object.keys(prog.records || {}).forEach(function (kind) {
      var fields = prog.records[kind].fields;
      Object.keys(fields).forEach(function (low) {
        var f = fields[low];
        out[low] = out[low] ? { name: out[low].name, kind: settled(joinKinds(out[low].kind, f.kind)) }
                            : { name: f.name, kind: settled(f.kind) };
      });
    });
    return out;
  }
  // The fields a record of this kind is printed with: its own, or where it
  // was only ever filled in as a record of no one kind, those.
  function shownFields(prog, kind) {
    var own = prog.records[kind];
    if (own && Object.keys(own.fields).length) { return own.fields; }
    return (prog.records[""] || { fields: {} }).fields;
  }
  // "Point(x=" + shown(x, true) + ", y=" + ... + ")", in the language's own words
  function recordText(w, kind, fields, shownBy, reach) {
    var names = Object.keys(fields);
    if (!names.length) { return '"' + kind + '()"'; }
    return '"' + kind + '(" + ' + names.map(function (low, i) {
      return '"' + (i ? ", " : "") + fields[low].name + '=" + ' + shownBy + "(" + (reach || "") +
             w.fieldName(fields[low].name) + ", true)";
    }).join(" + ") + ' + ")"';
  }
  // "(x in xs)" where the brackets are only there for whatever it is put in
  function bare(code) {
    code = String(code);
    if (code.charAt(0) !== "(" || code.charAt(code.length - 1) !== ")") { return code; }
    var depth = 0;
    for (var i = 0; i < code.length; i++) {
      if (code.charAt(i) === "(") { depth++; }
      if (code.charAt(i) === ")") { depth--; if (!depth && i < code.length - 1) { return code; } }
    }
    return code.slice(1, -1);
  }

  function compoundKind(k) { return isListKind(k) || isTableKind(k) || isRecKind(k); }

  function pyNum(code) { return /^\d+$/.test(code) ? code : "int(" + code + ")"; }

  var LIST_WORK = {
    python: {
      negatives: true,
      constant: function (name) {
        return name === "newline" ? '"\\n"' : name === "tab" ? '"\\t"' : 'float("inf")';
      },
      fnRef: function (name, one, w) { return w.reachMod(one) + name; },
      listOf: function (items) { return "[" + items.join(", ") + "]"; },
      tableOf: function (pairs) {
        return "{" + pairs.map(function (p) { return p[0] + ": " + p[1]; }).join(", ") + "}";
      },
      newRecord: function (kind, w, args) { return w.recName(kind) + "(" + (args || []).join(", ") + ")"; },
      itemAt: function (o, i) { return held(o) + "[" + i + "]"; },
      charAt: function (o, i) { return held(o) + "[" + i + "]"; },
      lookUp: function (o, k) { return held(o) + "[" + k + "]"; },
      setAt: function (o, i, v) { return held(o) + "[" + i + "] = " + v; },
      putIn: function (o, k, v) { return held(o) + "[" + k + "] = " + v; },
      partOf: function (o, name) { return held(o) + "." + name; },
      lengthOf: function (o) { return "len(" + o + ")"; },
      emptyOf: function (kind) { return isListKind(kind) ? "[]" : isTableKind(kind) ? "{}" : "None"; },
      castTo: function (code) { return code; },
      forEach: function (w, item, deep) {
        w.line(deep, "for " + w.named(item["var"]) + " in " + w.code(item.over) + ":");
        w.block(item.body, deep + 1);
      },
      records: function (w, recs) {
        Object.keys(recs).forEach(function (kind) {
          w.line(0, "");
          w.line(0, "class " + w.recName(kind) + ":");
          // laid out field by field (TYPE, RECORD): every field there from
          // the start, and handed over in order -- Car("Ford", 1.8)
          var laid = laidFields(recs[kind]);
          if (laid.length) {
            w.line(1, "def __init__(self, " + laid.map(function (f) {
              return w.fieldName(f.name) + "=" + (compoundKind(f.kind) ? "None" : w.zero(f.kind));
            }).join(", ") + "):");
            laid.forEach(function (f) {
              var n = w.fieldName(f.name);
              w.line(2, "self." + n + " = " + (compoundKind(f.kind)
                ? n + " if " + n + " is not None else " + fieldZero(w, f.kind) : n));
            });
            w.line(0, "");
          }
          w.line(1, "def __repr__(self):");
          w.line(2, 'return "' + kind + '(" + ", ".join(k + "=" + repr(v) for k, v in vars(self).items()) + ")"');
        });
      },
      lists: {
        length: function (a) { return "len(" + a[0] + ")"; },
        append: function (a) { return held(a[0]) + ".append(" + a[1] + ")"; },
        insert: function (a) { return held(a[0]) + ".insert(" + a[1] + ", " + a[2] + ")"; },
        remove: function (a, k) {
          return isTableKind(k[0]) ? held(a[0]) + ".pop(" + a[1] + ", None)" : held(a[0]) + ".remove(" + a[1] + ")";
        },
        pop: function (a) { return held(a[0]) + ".pop(" + (a[1] || "") + ")"; },
        contains: function (a) { return "(" + a[1] + " in " + held(a[0]) + ")"; },
        indexof: function (a, k, w) {
          if (k[0] === "text") { return held(a[0]) + ".find(" + a[1] + ")"; }
          return "(" + held(a[0]) + ".index(" + a[1] + ") if " + a[1] + " in " + held(a[0]) + " else -1)";
        },
        count: function (a) { return held(a[0]) + ".count(" + a[1] + ")"; },
        slice: function (a) { return held(a[0]) + "[" + (a[1] === "0" ? "" : a[1]) + ":" + (a[2] || "") + "]"; },
        substring: function (a) { return held(a[0]) + "[" + (a[1] === "0" ? "" : a[1]) + ":" + (a[2] || "") + "]"; },
        join: function (a) { return held(a[1] || '""') + ".join(map(str, " + a[0] + "))"; },
        split: function (a) {
          if (!a[1]) { return held(a[0]) + ".split()"; }
          return a[1] === '""' ? "list(" + a[0] + ")" : held(a[0]) + ".split(" + a[1] + ")";
        },
        sum: function (a) { return "sum(" + a[0] + ")"; },
        // sort() on a line of its own sorts the list where it is; in the
        // middle of a sum it hands the list back as well
        sort: function (a, k, w, nodes) {
          var how = a[1] ? "key=" + pyKey(a[1], nodes[1], w) : "";
          if (w.statement) { return held(a[0]) + ".sort(" + how + ")"; }
          if (placeOf(nodes[0])) { return "(" + held(a[0]) + ".sort(" + how + ") or " + a[0] + ")"; }
          return "sorted(" + a[0] + (how ? ", " + how : "") + ")";
        },
        sorted: function (a, k, w, nodes) {
          return "sorted(" + a[0] + (a[1] ? ", key=" + pyKey(a[1], nodes[1], w) : "") + ")";
        },
        reverse: function (a, k, w, nodes) {
          if (k[0] === "text" || (!w.statement && !placeOf(nodes[0]))) { return held(a[0]) + "[::-1]"; }
          return w.statement ? held(a[0]) + ".reverse()" : "(" + held(a[0]) + ".reverse() or " + a[0] + ")";
        },
        reversed: function (a) { return held(a[0]) + "[::-1]"; },
        shuffle: function (a, k, w) { w.need("random"); return "random.shuffle(" + a[0] + ")"; },
        shuffled: function (a, k, w) { w.need("random"); return "random.sample(" + a[0] + ", len(" + a[0] + "))"; },
        choice: function (a, k, w) { w.need("random"); return "random.choice(" + a[0] + ")"; },
        repeat: function (a) { return held(a[0]) + " * " + held(a[1]); },
        range: function (a) { return "list(range(" + a.join(", ") + "))"; },
        keys: function (a) { return "list(" + held(a[0]) + ".keys())"; },
        values: function (a) { return "list(" + held(a[0]) + ".values())"; },
        items: function (a) { return "[list(p) for p in " + held(a[0]) + ".items()]"; },
        copy: function (a, k) { return k[0] === "text" ? a[0] : held(a[0]) + ".copy()"; },
        tostring: function (a) { return "str(" + a[0] + ")"; },
        replace: function (a) { return held(a[0]) + ".replace(" + a[1] + ", " + a[2] + ")"; },
        trim: function (a) { return held(a[0]) + ".strip()"; },
        startswith: function (a) { return held(a[0]) + ".startswith(" + a[1] + ")"; },
        endswith: function (a) { return held(a[0]) + ".endswith(" + a[1] + ")"; },
        isdigit: function (a) { return held(a[0]) + ".isdigit()"; },
        isalpha: function (a) { return held(a[0]) + ".isalpha()"; },
        isupper: function (a) { return held(a[0]) + ".isupper()"; },
        islower: function (a) { return held(a[0]) + ".islower()"; },
        isspace: function (a) { return held(a[0]) + ".isspace()"; },
        ord: function (a) { return "ord(" + a[0] + ")"; },
        chr: function (a) { return "chr(" + pyNum(a[0]) + ")"; },
        classof: function (a, k, w) { w.need("classOf"); return "class_of(" + a[0] + ")"; },
        any: function (a) { return "any(" + a[0] + ")"; },
        all: function (a) { return "all(" + a[0] + ")"; },
        newlist: function (a, k) {
          var fill = a[a.length - 1], sizes = a.slice(0, -1);
          var made = compoundKind(k[k.length - 1]) ? "[" + fill + " for _ in range(" + sizes[sizes.length - 1] + ")]"
                                                    : "[" + fill + "] * " + held(sizes[sizes.length - 1]);
          for (var d = sizes.length - 2; d >= 0; d--) { made = "[" + made + " for _ in range(" + sizes[d] + ")]"; }
          return made;
        },
        get: function (a, k) {
          if (isTableKind(k[0])) { return held(a[0]) + ".get(" + a[1] + ", " + (a[2] || "None") + ")"; }
          return "(" + held(a[0]) + "[" + a[1] + "] if 0 <= " + a[1] + " < len(" + a[0] + ") else " + (a[2] || "None") + ")";
        },
        clear: function (a) { return held(a[0]) + ".clear()"; },
        extend: function (a) { return held(a[0]) + ".extend(" + a[1] + ")"; },
        isnumber: function (a, k, w) { w.need("isNumber"); return "is_number(" + a[0] + ")"; },
        tolist: function (a) { return "list(" + a[0] + ")"; },
        unique: function (a) { return "list(dict.fromkeys(" + a[0] + "))"; },
        zip: function (a) { return "[list(p) for p in zip(" + a.join(", ") + ")]"; },
        enumerate: function (a) { return "[[i, v] for i, v in enumerate(" + a[0] + ")]"; },
        union: function (a) { return "list(dict.fromkeys(" + held(a[0]) + " + " + held(a[1]) + "))"; },
        intersection: function (a) { return "[v for v in dict.fromkeys(" + a[0] + ") if v in " + held(a[1]) + "]"; },
        difference: function (a) { return "[v for v in " + held(a[0]) + " if v not in " + held(a[1]) + "]"; },
        padleft: function (a) { return "str(" + a[0] + ").rjust(" + a[1] + (a[2] ? ", " + a[2] : "") + ")"; },
        padright: function (a) { return "str(" + a[0] + ").ljust(" + a[1] + (a[2] ? ", " + a[2] : "") + ")"; },
        fixed: function (a) { return /^\d+$/.test(a[1]) ? 'format(' + a[0] + ', ".' + a[1] + 'f")' : 'format(' + a[0] + ', "." + str(' + a[1] + ') + "f")'; },
        bitand: function (a) { return held(a[0]) + " & " + held(a[1]); },
        bitor: function (a) { return held(a[0]) + " | " + held(a[1]); },
        bitxor: function (a) { return held(a[0]) + " ^ " + held(a[1]); },
        real: function (a) { return "float(" + a[0] + ")"; },
        min: function (a) { return "min(" + a.join(", ") + ")"; },
        max: function (a) { return "max(" + a.join(", ") + ")"; },
        log: function (a, k, w) { w.need("math"); return "math.log(" + a[0] + ")"; },
        log10: function (a, k, w) { w.need("math"); return "math.log10(" + a[0] + ")"; },
        exp: function (a, k, w) { w.need("math"); return "math.exp(" + a[0] + ")"; },
        sin: function (a, k, w) { w.need("math"); return "math.sin(" + a[0] + ")"; },
        cos: function (a, k, w) { w.need("math"); return "math.cos(" + a[0] + ")"; },
        tan: function (a, k, w) { w.need("math"); return "math.tan(" + a[0] + ")"; },
        atan: function (a, k, w) { w.need("math"); return "math.atan(" + a[0] + ")"; },
        atan2: function (a, k, w) { w.need("math"); return "math.atan2(" + a.join(", ") + ")"; },
        hypot: function (a, k, w) { w.need("math"); return "math.hypot(" + a.join(", ") + ")"; },
        trunc: function (a) { return "int(" + a[0] + ")"; }
      },
      helpers: {
        classOf: ["def class_of(v):",
                  "    if isinstance(v, bool):",
                  "        return \"Boolean\"",
                  "    if isinstance(v, (int, float)):",
                  "        return \"Integer\" if v == int(v) else \"Real\"",
                  "    if isinstance(v, str):",
                  "        return \"String\"",
                  "    if isinstance(v, list):",
                  "        return \"List\"",
                  "    if isinstance(v, dict):",
                  "        return \"Table\"",
                  "    return type(v).__name__"],
        isNumber: ["def is_number(v):",
                   "    try:",
                   "        float(v)",
                   "        return True",
                   "    except (TypeError, ValueError):",
                   "        return False"]
      }
    },

    javascript: {
      negatives: false,
      constant: function (name) { return name === "newline" ? '"\\n"' : name === "tab" ? '"\\t"' : "Infinity"; },
      fnRef: function (name, one, w) { return w.reachMod(one) + name; },
      listOf: function (items) { return "[" + items.join(", ") + "]"; },
      tableOf: function (pairs) {
        return "new Map([" + pairs.map(function (p) { return "[" + p[0] + ", " + p[1] + "]"; }).join(", ") + "])";
      },
      newRecord: function (kind, w, args) { return "new " + w.recName(kind) + "(" + (args || []).join(", ") + ")"; },
      itemAt: function (o, i) { return held(o) + "[" + i + "]"; },
      charAt: function (o, i) { return held(o) + "[" + i + "]"; },
      lookUp: function (o, k) { return held(o) + ".get(" + k + ")"; },
      setAt: function (o, i, v) { return held(o) + "[" + i + "] = " + v; },
      putIn: function (o, k, v) { return held(o) + ".set(" + k + ", " + v + ")"; },
      partOf: function (o, name) { return held(o) + "." + name; },
      lengthOf: function (o, kind) { return held(o) + (isTableKind(kind) ? ".size" : ".length"); },
      emptyOf: function (kind) { return isListKind(kind) ? "[]" : isTableKind(kind) ? "new Map()" : "null"; },
      castTo: function (code) { return code; },
      // A list, a table or a record, the way the chart prints one.
      shown: function (code, w) { w.need("shown"); return "shown(" + code + ")"; },
      forEach: function (w, item, deep) {
        var over = tree(item.over), kind = w.kind(over), src = w.code(item.over);
        var entry = w.entry(item["var"]);
        if (isTableKind(kind)) { src = held(src) + ".keys()"; }
        w.line(deep, "for (" + (entry && !entry.perLoop ? "" : loopSetsItsName(item) ? "let " : "const ") +
               w.named(item["var"]) + " of " + src + ") {");
        w.block(item.body, deep + 1);
        w.line(deep, "}");
      },
      records: function (w, recs) {
        Object.keys(recs).forEach(function (kind) {
          w.line(0, "");
          var laid = laidFields(recs[kind]);
          if (!laid.length) { w.line(0, "class " + w.recName(kind) + " {}"); return; }
          w.line(0, "class " + w.recName(kind) + " {");
          w.line(1, "constructor(" + laid.map(function (f) {
            return w.fieldName(f.name) + " = " + fieldZero(w, f.kind);
          }).join(", ") + ") {");
          laid.forEach(function (f) {
            w.line(2, "this." + w.fieldName(f.name) + " = " + w.fieldName(f.name) + ";");
          });
          w.line(1, "}");
          w.line(0, "}");
        });
      },
      lists: {
        length: function (a, k) { return held(a[0]) + (isTableKind(k[0]) ? ".size" : ".length"); },
        append: function (a) { return held(a[0]) + ".push(" + a[1] + ")"; },
        insert: function (a) { return held(a[0]) + ".splice(" + a[1] + ", 0, " + a[2] + ")"; },
        remove: function (a, k) {
          return isTableKind(k[0]) ? held(a[0]) + ".delete(" + a[1] + ")"
               : held(a[0]) + ".splice(" + held(a[0]) + ".indexOf(" + a[1] + "), 1)";
        },
        pop: function (a, k, w) {
          // on a line of its own, only the taking out
          if (isTableKind(k[0])) {
            if (w && w.statement) { return held(a[0]) + ".delete(" + a[1] + ")"; }
            w.need("popKey");
            return "popKey(" + a[0] + ", " + a[1] + ")";
          }
          if (!a[1]) { return held(a[0]) + ".pop()"; }
          if (a[1] === "0") { return held(a[0]) + ".shift()"; }
          return held(a[0]) + ".splice(" + a[1] + ", 1)" + (w && w.statement ? "" : "[0]");
        },
        contains: function (a, k) {
          return isTableKind(k[0]) ? held(a[0]) + ".has(" + a[1] + ")" : held(a[0]) + ".includes(" + a[1] + ")";
        },
        indexof: function (a) { return held(a[0]) + ".indexOf(" + a[1] + ")"; },
        count: function (a, k) {
          if (k[0] === "text") { return "(" + held(a[0]) + ".split(" + a[1] + ").length - 1)"; }
          return held(a[0]) + ".filter((v) => v === " + a[1] + ").length";
        },
        slice: function (a) { return held(a[0]) + ".slice(" + a[1] + (a[2] ? ", " + a[2] : "") + ")"; },
        substring: function (a) { return held(a[0]) + ".slice(" + a[1] + (a[2] ? ", " + a[2] : "") + ")"; },
        join: function (a) { return held(a[0]) + ".join(" + (a[1] || '""') + ")"; },
        split: function (a) {
          if (!a[1]) { return held(a[0]) + ".trim().split(/\\s+/).filter(Boolean)"; }
          return held(a[0]) + ".split(" + a[1] + ")";
        },
        sum: function (a) { return held(a[0]) + ".reduce((t, v) => t + v, 0)"; },
        sort: function (a, k, w, nodes) { return held(a[0]) + ".sort(" + jsOrder(a[1], nodes[1], w, elemOf(k[0])) + ")"; },
        sorted: function (a, k, w, nodes) {
          return "[..." + a[0] + "].sort(" + jsOrder(a[1], nodes[1], w, elemOf(k[0]) || (k[0] === "text" ? "text" : "")) + ")";
        },
        reverse: function (a, k) {
          return k[0] === "text" ? held(a[0]) + '.split("").reverse().join("")' : held(a[0]) + ".reverse()";
        },
        reversed: function (a, k) {
          return k[0] === "text" ? held(a[0]) + '.split("").reverse().join("")' : "[..." + a[0] + "].reverse()";
        },
        shuffle: function (a, k, w) { w.need("shuffle"); return "shuffle(" + a[0] + ")"; },
        shuffled: function (a, k, w) { w.need("shuffle"); return "shuffle([..." + a[0] + "])"; },
        choice: function (a) { return held(a[0]) + "[Math.floor(Math.random() * " + held(a[0]) + ".length)]"; },
        repeat: function (a, k) {
          if (isListKind(k[0])) { return "Array.from({ length: " + a[1] + " }, () => " + a[0] + ").flat()"; }
          return held(a[0]) + ".repeat(" + a[1] + ")";
        },
        range: function (a) {
          var from = a.length > 1 ? a[0] : "0", to = a.length > 1 ? a[1] : a[0], by = a[2] || "1";
          if (by === "1") { return "Array.from({ length: " + held(to) + " - " + held(from) + " }, (_, i) => " + held(from) + " + i)"; }
          return "Array.from({ length: Math.max(0, Math.ceil((" + to + " - " + from + ") / " + by + ")) }, (_, i) => " + held(from) + " + i * " + held(by) + ")";
        },
        keys: function (a) { return "[..." + held(a[0]) + ".keys()]"; },
        values: function (a) { return "[..." + held(a[0]) + ".values()]"; },
        items: function (a) { return "[..." + held(a[0]) + ".entries()]"; },
        copy: function (a, k) {
          return isTableKind(k[0]) ? "new Map(" + a[0] + ")" : k[0] === "text" ? a[0] : "[..." + a[0] + "]";
        },
        tostring: function (a, k, w) { return compoundKind(k[0]) ? this.shown(a[0], w) : "String(" + a[0] + ")"; },
        replace: function (a) { return held(a[0]) + ".split(" + a[1] + ").join(" + a[2] + ")"; },
        trim: function (a) { return held(a[0]) + ".trim()"; },
        startswith: function (a) { return held(a[0]) + ".startsWith(" + a[1] + ")"; },
        endswith: function (a) { return held(a[0]) + ".endsWith(" + a[1] + ")"; },
        isdigit: function (a) { return "/^[0-9]+$/.test(" + a[0] + ")"; },
        isalpha: function (a) { return "/^[A-Za-z]+$/.test(" + a[0] + ")"; },
        isupper: function (a) { return "(" + a[0] + " === " + held(a[0]) + ".toUpperCase() && /[A-Z]/.test(" + a[0] + "))"; },
        islower: function (a) { return "(" + a[0] + " === " + held(a[0]) + ".toLowerCase() && /[a-z]/.test(" + a[0] + "))"; },
        isspace: function (a) { return "/^\\s+$/.test(" + a[0] + ")"; },
        ord: function (a) { return held(a[0]) + ".charCodeAt(0)"; },
        chr: function (a) { return "String.fromCharCode(" + a[0] + ")"; },
        classof: function (a, k, w) { w.need("classOf"); return "classOf(" + a[0] + ")"; },
        any: function (a) { return held(a[0]) + ".some(Boolean)"; },
        all: function (a) { return held(a[0]) + ".every(Boolean)"; },
        newlist: function (a, k) {
          var fill = a[a.length - 1], sizes = a.slice(0, -1);
          var made = compoundKind(k[k.length - 1]) ? "Array.from({ length: " + sizes[sizes.length - 1] + " }, () => " + fill + ")"
                                                    : "Array(" + sizes[sizes.length - 1] + ").fill(" + fill + ")";
          for (var d = sizes.length - 2; d >= 0; d--) { made = "Array.from({ length: " + sizes[d] + " }, () => " + made + ")"; }
          return made;
        },
        get: function (a, k) {
          if (isTableKind(k[0])) {
            return "(" + held(a[0]) + ".has(" + a[1] + ") ? " + held(a[0]) + ".get(" + a[1] + ") : " + (a[2] || "null") + ")";
          }
          return "(" + held(a[0]) + "[" + a[1] + "] ?? " + (a[2] || "null") + ")";
        },
        clear: function (a, k) { return isTableKind(k[0]) ? held(a[0]) + ".clear()" : held(a[0]) + ".length = 0"; },
        extend: function (a) { return held(a[0]) + ".push(..." + a[1] + ")"; },
        isnumber: function (a) { return '(String(' + a[0] + ').trim() !== "" && !isNaN(Number(' + a[0] + ')))'; },
        tolist: function (a, k) { return isTableKind(k[0]) ? "[..." + held(a[0]) + ".keys()]" : "[..." + a[0] + "]"; },
        unique: function (a) { return "[...new Set(" + a[0] + ")]"; },
        zip: function (a) { return held(a[0]) + ".slice(0, Math.min(" + a.map(function (x) { return held(x) + ".length"; }).join(", ") + ")).map((v, i) => [" + a.map(function (x) { return held(x) + "[i]"; }).join(", ") + "])"; },
        enumerate: function (a) { return held(a[0]) + ".map((v, i) => [i, v])"; },
        union: function (a) { return "[...new Set([..." + a[0] + ", ..." + a[1] + "])]"; },
        intersection: function (a) { return "[...new Set(" + a[0] + ")].filter((v) => " + held(a[1]) + ".includes(v))"; },
        difference: function (a) { return held(a[0]) + ".filter((v) => !" + held(a[1]) + ".includes(v))"; },
        padleft: function (a) { return "String(" + a[0] + ").padStart(" + a[1] + (a[2] ? ", " + a[2] : "") + ")"; },
        padright: function (a) { return "String(" + a[0] + ").padEnd(" + a[1] + (a[2] ? ", " + a[2] : "") + ")"; },
        fixed: function (a) { return "Number(" + a[0] + ").toFixed(" + a[1] + ")"; },
        bitand: function (a) { return held(a[0]) + " & " + held(a[1]); },
        bitor: function (a) { return held(a[0]) + " | " + held(a[1]); },
        bitxor: function (a) { return held(a[0]) + " ^ " + held(a[1]); },
        real: function (a) { return "Number(" + a[0] + ")"; },
        // the smallest and biggest -- of words too, which Math.min makes NaN of
        min: function (a, k) {
          if (k.length === 1 && isListKind(k[0]) && !/^(int|real)$/.test(elemOf(k[0]) || "")) { return held(a[0]) + ".reduce((a_, b_) => (b_ < a_ ? b_ : a_))"; }
          if (k.length > 1 && k.some(function (x) { return x === "text"; })) { return "[" + a.join(", ") + "].reduce((a_, b_) => (b_ < a_ ? b_ : a_))"; }
          return k.length === 1 && isListKind(k[0]) ? "Math.min(..." + a[0] + ")" : "Math.min(" + a.join(", ") + ")";
        },
        max: function (a, k) {
          if (k.length === 1 && isListKind(k[0]) && !/^(int|real)$/.test(elemOf(k[0]) || "")) { return held(a[0]) + ".reduce((a_, b_) => (b_ > a_ ? b_ : a_))"; }
          if (k.length > 1 && k.some(function (x) { return x === "text"; })) { return "[" + a.join(", ") + "].reduce((a_, b_) => (b_ > a_ ? b_ : a_))"; }
          return k.length === 1 && isListKind(k[0]) ? "Math.max(..." + a[0] + ")" : "Math.max(" + a.join(", ") + ")";
        },
        log: function (a) { return "Math.log(" + a[0] + ")"; },
        log10: function (a) { return "Math.log10(" + a[0] + ")"; },
        exp: function (a) { return "Math.exp(" + a[0] + ")"; },
        sin: function (a) { return "Math.sin(" + a[0] + ")"; },
        cos: function (a) { return "Math.cos(" + a[0] + ")"; },
        tan: function (a) { return "Math.tan(" + a[0] + ")"; },
        atan: function (a) { return "Math.atan(" + a[0] + ")"; },
        atan2: function (a) { return "Math.atan2(" + a.join(", ") + ")"; },
        hypot: function (a) { return "Math.hypot(" + a.join(", ") + ")"; },
        trunc: function (a) { return "Math.trunc(" + a[0] + ")"; }
      },
      // An empty list is still something to JavaScript; to the chart it is no.
      truthOf: function (code, kind) {
        return isListKind(kind) ? held(code) + ".length > 0" : isTableKind(kind) ? held(code) + ".size > 0" : null;
      },
      sameItems: function (a, b, differ, w) {
        w.need("shown");
        return "shown(" + a + ") " + (differ ? "!==" : "===") + " shown(" + b + ")";
      },
      helpers: {
        classOf: ["// What kind of thing something is, in the chart's words.",
                  "function classOf(v) {",
                  "  if (Array.isArray(v)) { return \"List\"; }",
                  "  if (v instanceof Map) { return \"Table\"; }",
                  "  if (typeof v === \"boolean\") { return \"Boolean\"; }",
                  "  if (typeof v === \"number\") { return Number.isInteger(v) ? \"Integer\" : \"Real\"; }",
                  "  if (typeof v === \"string\") { return \"String\"; }",
                  "  return v.constructor.name;",
                  "}"],
        shown: ["// Writes a list, a table or a record the way the chart shows one: ['a', 1].",
                "function shown(v, inside = false) {",
                "  if (Array.isArray(v)) { return \"[\" + v.map((x) => shown(x, true)).join(\", \") + \"]\"; }",
                "  if (v instanceof Map) {",
                "    return \"{\" + [...v].map(([k, x]) => shown(k, true) + \": \" + shown(x, true)).join(\", \") + \"}\";",
                "  }",
                "  if (typeof v === \"string\") { return inside ? \"'\" + v + \"'\" : v; }",
                "  if (typeof v === \"boolean\") { return v ? \"True\" : \"False\"; }",
                "  if (v && typeof v === \"object\") {",
                "    return v.constructor.name + \"(\" + Object.entries(v).map(([k, x]) => k + \"=\" + shown(x, true)).join(\", \") + \")\";",
                "  }",
                "  return String(v);",
                "}"],
        shuffle: ["// Puts a list in a random order, where it is, and hands it back.",
                  "function shuffle(list) {",
                  "  for (let i = list.length - 1; i > 0; i--) {",
                  "    const j = Math.floor(Math.random() * (i + 1));",
                  "    [list[i], list[j]] = [list[j], list[i]];",
                  "  }",
                  "  return list;",
                  "}"]
      }
    }
  };

  // sort(people, byAge): a module of one thing is what to sort by, of two
  // is how to compare -- a number below nought for "a first", or yes for it
  function orderedBy(node, w) {
    return node && node.name && !node.field && !w.entry(node.name) ? w.prog.byName[lowered(node.name)] : null;
  }
  function placeOf(node) { return !!node && (!!node.name || !!node.index || !!node.field); }
  function pyKey(code, node, w) {
    var bound = node && node.call === "bind" ? boundArity(node, w) : null;
    if (bound && bound.left === 2) {
      w.need("functools");
      return bound.one.gives === "bool" ? "functools.cmp_to_key(lambda a, b: -1 if " + held(code) + "(a, b) else 1 if " + held(code) + "(b, a) else 0)"
                                        : "functools.cmp_to_key(" + code + ")";
    }
    var one = orderedBy(node, w);
    if (one && one.params.length === 2) {
      w.need("functools");
      if (one.gives === "bool") {
        return "functools.cmp_to_key(lambda a, b: -1 if " + code + "(a, b) else 1 if " + code + "(b, a) else 0)";
      }
      return "functools.cmp_to_key(" + code + ")";
    }
    return code;
  }
  function jsOrder(code, node, w, kind) {
    var bound = node && node.call === "bind" ? boundArity(node, w) : null;
    if (bound && bound.left === 2) {
      return bound.one.gives === "bool" ? "(a, b) => (" + held(code) + "(a, b) ? -1 : " + held(code) + "(b, a) ? 1 : 0)" : code;
    }
    if (!code && kind !== "text" && kind !== "int" && kind !== "real") { w.need("orderOf"); return "orderOf"; }
    var one = orderedBy(node, w);
    if (one && one.params.length === 2) {
      return one.gives === "bool" ? "(a, b) => (" + code + "(a, b) ? -1 : " + code + "(b, a) ? 1 : 0)" : code;
    }
    if (code) {
      var by = held(code);
      // a key that is a list -- [-age, name] -- goes item by item, not as the words < makes of it
      if (one && one.gives && !/^(int|real|text|bool)$/.test(one.gives)) {
        w.need("orderOf");
        return "(a, b) => orderOf(" + by + "(a), " + by + "(b))";
      }
      return "(a, b) => (" + by + "(a) < " + by + "(b) ? -1 : " + by + "(a) > " + by + "(b) ? 1 : 0)";
    }
    return kind === "text" ? "" : "(a, b) => a - b";
  }

  // Java's lists hold objects, so a list of whole numbers is a list of
  // Integers -- and an Integer taken out of one is made an int again
  // before anything compares it, since == on two Integers asks whether they
  // are the same object.
  var JAVA_BOX = { int: "Integer", real: "Double", bool: "Boolean", text: "String" };
  function javaBoxed(type, kind) { return JAVA_BOX[kind] || type; }
  function javaUnbox(code, kind) {
    return kind === "int" ? "(int) " + code : kind === "real" ? "(double) " + code
         : kind === "bool" ? "(boolean) " + code : code;
  }

  LIST_WORK.java = {
    negatives: false,
    constant: function (name) {
      return name === "newline" ? '"\\n"' : name === "tab" ? '"\\t"' : "Double.POSITIVE_INFINITY";
    },
    fnRef: function (name, one, w) {
      return (w.reachMod(one) ? w.fileOf(one) : w.file) + "::" + name;
    },
    listType: function (type, kind) { return "ArrayList<" + javaBoxed(type, kind) + ">"; },
    tableType: function (k, v, kind) {
      return "LinkedHashMap<" + javaBoxed(k, tableKey(kind) || "text") + ", " + javaBoxed(v, tableValue(kind) || "real") + ">";
    },
    recType: function (name, w) { return name ? w.recName(name) : "Record"; },
    fnType: "Object",
    listOf: function (items, kind, w) {
      // inside another list, said outright: Java will not work out a list
      // of lists of it from the lists alone
      var made = w.nest ? "new " + w.typeOf(kind) : "new ArrayList<>";
      if (!items.length) { return made + "()"; }
      return made + "(Arrays.asList(" + items.map(function (x) {
        return elemOf(kind) === "real" && /^-?\d+$/.test(x) ? x + ".0" : x;
      }).join(", ") + "))";
    },
    tableOf: function (pairs, kind, w) {
      if (!pairs.length) { return w.nest ? "new " + w.typeOf(kind) + "()" : "new LinkedHashMap<>()"; }
      w.need("tableOf");
      return "tableOf(" + pairs.map(function (p) { return p[0] + ", " + p[1]; }).join(", ") + ")";
    },
    newRecord: function (kind, w, args) { return "new " + w.recName(kind) + "(" + (args || []).join(", ") + ")"; },
    itemAt: function (o, i, kind) {
      if (kind === "any") { return "((List<?>) " + o + ").get(" + i + ")"; }
      return javaUnbox(held(o) + ".get(" + i + ")", elemOf(kind));
    },
    charAt: function (o, i) { return "String.valueOf(" + held(o) + ".charAt(" + i + "))"; },
    lookUp: function (o, k, kind) { return javaUnbox(held(o) + ".get(" + k + ")", tableValue(kind)); },
    setAt: function (o, i, v) { return held(o) + ".set(" + i + ", " + v + ")"; },
    putIn: function (o, k, v) { return held(o) + ".put(" + k + ", " + v + ")"; },
    partOf: function (o, name) { return held(o) + "." + name; },
    lengthOf: function (o, kind, w) {
      if (kind === "any") { w.need("sizeOf"); return "sizeOf(" + o + ")"; }
      return held(o) + (kind === "text" ? ".length()" : ".size()");
    },
    emptyOf: function (kind, w) {
      return isListKind(kind) ? "new ArrayList<>()" : isTableKind(kind) ? "new LinkedHashMap<>()" : "null";
    },
    castTo: function (code, type) { return "(" + type + ") " + held(code); },
    forEach: function (w, item, deep) {
      var over = tree(item.over), kind = w.kind(over), src = w.code(item.over);
      var entry = w.entry(item["var"]), elem = kind === "text" ? "text" : isTableKind(kind) ? tableKey(kind) : elemOf(kind);
      if (kind === "text") { w.need("chars"); src = "chars(" + src + ")"; }
      else if (kind === "any") { src = "(List<?>) " + held(src); }
      else if (isTableKind(kind)) { src = held(src) + ".keySet()"; }
      var type = w.elemType(item.over, elem);
      if (entry && !entry.perLoop) {
        var loose = (entry ? w.spelled(entry) : w.named(item["var"])) + "_";
        w.line(deep, "for (" + type + " " + loose + " : " + src + ") {");
        w.line(deep + 1, w.named(item["var"]) + " = " + loose + ";");
      } else {
        w.line(deep, "for (" + type + " " + w.named(item["var"]) + " : " + src + ") {");
      }
      w.block(item.body, deep + 1);
      w.line(deep, "}");
    },
    // An ArrayList<Double> will not take an int: 5 has to be 5.0 before it
    // can be boxed into one.
    widen: function (code) { return /^-?\d+$/.test(code) ? code + ".0" : "(double) " + held(code); },
    shown: function (code, w) { w.need("shown"); return "shown(" + code + ")"; },
    // One class holding every field any record has, and a class of each
    // kind made from it, so that a Square goes wherever a Rect goes.
    records: function (w, recs, deep) {
      var fields = unionFields(w.prog);
      w.need("shown");
      w.line(0, "");
      var copies = w.needs.recordCopy || w.needs.deepCopyRec;
      w.line(deep, "static class Record" + (copies ? " implements Cloneable" : "") + " {");
      w.line(deep + 1, 'String kindName = "Record";');
      Object.keys(fields).forEach(function (low) {
        w.line(deep + 1, w.typeOf(fields[low].kind) + " " + w.fieldName(fields[low].name) + ";");
      });
      if (copies) {                                     // copy(p): one of its own
        w.line(deep + 1, "Record copied() {");
        w.line(deep + 2, "try { return (Record) clone(); } catch (CloneNotSupportedException e) { throw new RuntimeException(e); }");
        w.line(deep + 1, "}");
      }
      if (w.needs.deepCopyRec) {                        // deepCopy(p): and what it holds
        w.line(deep + 1, "Record deepCopied() {");
        w.line(deep + 2, "Record made = copied();");
        Object.keys(fields).forEach(function (low) {
          if (compoundKind(fields[low].kind)) {
            var f = w.fieldName(fields[low].name);
            w.line(deep + 2, "made." + f + " = deepCopy(made." + f + ");");
          }
        });
        w.line(deep + 2, "return made;");
        w.line(deep + 1, "}");
      }
      w.line(deep + 1, "public String toString() {");
      Object.keys(recs).forEach(function (kind) {
        w.line(deep + 2, 'if (kindName.equals("' + kind + '")) { return ' +
               recordText(w, kind, shownFields(w.prog, kind), "shown") + "; }");
      });
      w.line(deep + 2, "return " + recordText(w, "Record", shownFields(w.prog, ""), "shown").replace('"Record(', 'kindName + "(') + ";");
      w.line(deep + 1, "}");
      w.line(deep, "}");
      Object.keys(recs).forEach(function (kind) {
        w.line(0, "");
        w.line(deep, "static class " + w.recName(kind) + " extends Record {");
        var laid = laidFields(recs[kind]);
        w.line(deep + 1, w.recName(kind) + '() { kindName = "' + kind + '";' + laidStarts(w, laid, "") + " }");
        if (laid.length) {                              // Car("Ford", 1.8)
          w.line(deep + 1, w.recName(kind) + "(" + laidParams(w, laid, fields) + ") {");
          w.line(deep + 2, "this();");
          laid.forEach(function (f) {
            w.line(deep + 2, "this." + w.fieldName(f.name) + " = " + w.fieldName(f.name) + ";");
          });
          w.line(deep + 1, "}");
        }
        w.line(deep, "}");
      });
    },
    nullValue: "null",
    anyType: "Object",
    anyNum: function (code) { return "((Number) " + code + ").doubleValue()"; },
    boxedKind: { int: "Integer", real: "Double", bool: "Boolean" },
    nothingText: function (code) { return "Objects.toString(" + code + ", \"\")"; },
    // something of no one kind -- what an Fn hands back -- going where one kind goes
    fromAny: function (code, kind, w) {
      if (kind === "int") { return "((Number) " + code + ").intValue()"; }
      if (kind === "real") { return "((Number) " + code + ").doubleValue()"; }
      if (kind === "text") { return "(String) " + held(code); }
      if (kind === "bool") { return "(Boolean) " + held(code); }
      if (compoundKind(kind)) { return "(" + w.typeOf(kind) + ") " + held(code); }
      return code;
    },
    anyOrder: function (a, op, b, w) { w.need("orderOf"); return "orderOf(" + a + ", " + b + ") " + op + " 0"; },
    truthOf: function (code, kind) {
      if (kind === "int" || kind === "real") { return held(code) + " != 0"; }
      if (kind === "text" || isListKind(kind) || isTableKind(kind)) { return "!" + held(code) + ".isEmpty()"; }
      return held(code) + " != null";
    },
    lists: {
      length: function (a, k, w) { return this.lengthOf(a[0], k[0], w); },
      append: function (a) { return held(a[0]) + ".add(" + a[1] + ")"; },
      insert: function (a) { return held(a[0]) + ".add(" + a[1] + ", " + a[2] + ")"; },
      remove: function (a, k) {
        return isTableKind(k[0]) ? held(a[0]) + ".remove(" + a[1] + ")"
             : held(a[0]) + ".remove((" + javaBoxed(null, k[1]) + ") " + held(a[1]) + ")";
      },
      pop: function (a, k) {
        if (isTableKind(k[0])) { return held(a[0]) + ".remove(" + a[1] + ")"; }
        return javaUnbox(held(a[0]) + ".remove(" + (a[1] ? "(int) " + held(a[1]) : held(a[0]) + ".size() - 1") + ")", elemOf(k[0]));
      },
      contains: function (a, k) {
        return isTableKind(k[0]) ? held(a[0]) + ".containsKey(" + a[1] + ")" : held(a[0]) + ".contains(" + a[1] + ")";
      },
      indexof: function (a) { return held(a[0]) + ".indexOf(" + a[1] + ")"; },
      count: function (a, k, w) {
        if (k[0] === "text") { return "(" + held(a[0]) + ".split(java.util.regex.Pattern.quote(" + a[1] + "), -1).length - 1)"; }
        return "Collections.frequency(" + a[0] + ", " + a[1] + ")";
      },
      slice: function (a, k) {
        if (k[0] === "text") { return held(a[0]) + ".substring(" + a[1] + (a[2] ? ", " + a[2] : "") + ")"; }
        return "new ArrayList<>(" + held(a[0]) + ".subList(" + a[1] + ", " + (a[2] || held(a[0]) + ".size()") + "))";
      },
      substring: function (a) { return held(a[0]) + ".substring(" + a[1] + (a[2] ? ", " + a[2] : "") + ")"; },
      join: function (a, k, w) { w.need("joined"); return "joined(" + a[0] + ", " + (a[1] || '""') + ")"; },
      split: function (a) {
        if (!a[1]) { return "new ArrayList<>(Arrays.asList(" + held(a[0]) + '.trim().split("\\\\s+")))'; }
        // split("") is letter by letter, with nothing left over after the last
        if (a[1] === '""') { return "new ArrayList<>(Arrays.asList(" + held(a[0]) + '.split("")))'; }
        return "new ArrayList<>(Arrays.asList(" + held(a[0]) + ".split(java.util.regex.Pattern.quote(" + a[1] + "), -1)))";
      },
      sum: function (a, k) {
        return elemOf(k[0]) === "int" ? held(a[0]) + ".stream().mapToInt(v_ -> v_).sum()"
                                      : held(a[0]) + ".stream().mapToDouble(v_ -> v_).sum()";
      },
      // anything but plain numbers and words is put in order item by item
      sort: function (a, k, w, nodes) {
        var how = a[1] || !/^(int|real|text|bool)$/.test(elemOf(k[0])) ? ", " + javaOrder(a[1], nodes[1], w, elemOf(k[0])) : "";
        if (w.statement) { return "Collections.sort(" + a[0] + how + ")"; }
        w.need("sortIn");
        return "sortIn(" + a[0] + how + ")";
      },
      sorted: function (a, k, w, nodes) {
        var how = a[1] || !/^(int|real|text|bool)$/.test(elemOf(k[0])) ? ", " + javaOrder(a[1], nodes[1], w, elemOf(k[0])) : "";
        w.need("sortedList");
        return "sortedList(" + a[0] + how + ")";
      },
      reverse: function (a, k, w) {
        if (k[0] === "text") { return "new StringBuilder(" + a[0] + ").reverse().toString()"; }
        if (w.statement) { return "Collections.reverse(" + a[0] + ")"; }
        w.need("sortIn");
        return "reverseIn(" + a[0] + ")";
      },
      reversed: function (a, k, w) {
        if (k[0] === "text") { return "new StringBuilder(" + a[0] + ").reverse().toString()"; }
        w.need("reversedList");
        return "reversedList(" + a[0] + ")";
      },
      shuffle: function (a) { return "Collections.shuffle(" + a[0] + ")"; },
      shuffled: function (a, k, w) { w.need("shuffledList"); return "shuffledList(" + a[0] + ")"; },
      choice: function (a, k) { return javaUnbox(held(a[0]) + ".get((int) (Math.random() * " + held(a[0]) + ".size()))", elemOf(k[0])); },
      repeat: function (a, k) {
        if (isListKind(k[0])) { return "new ArrayList<>(Collections.nCopies(" + a[1] + ", " + a[0] + ").stream().flatMap(List::stream).toList())"; }
        return held(a[0]) + ".repeat(" + a[1] + ")";
      },
      range: function (a) {
        var from = a.length > 1 ? a[0] : "0", to = a.length > 1 ? a[1] : a[0];
        return "new ArrayList<>(java.util.stream.IntStream.range(" + from + ", " + to + ").boxed().toList())";
      },
      keys: function (a) { return "new ArrayList<>(" + held(a[0]) + ".keySet())"; },
      values: function (a) { return "new ArrayList<>(" + held(a[0]) + ".values())"; },
      items: function (a, k, w) { w.need("itemsOf"); return "itemsOf(" + a[0] + ")"; },
      copy: function (a, k) {
        return isTableKind(k[0]) ? "new LinkedHashMap<>(" + a[0] + ")" : k[0] === "text" ? a[0] : "new ArrayList<>(" + a[0] + ")";
      },
      tostring: function (a, k, w) { return compoundKind(k[0]) ? this.shown(a[0], w) : "String.valueOf(" + a[0] + ")"; },
      replace: function (a) { return held(a[0]) + ".replace(" + a[1] + ", " + a[2] + ")"; },
      trim: function (a) { return held(a[0]) + ".trim()"; },
      startswith: function (a) { return held(a[0]) + ".startsWith(" + a[1] + ")"; },
      endswith: function (a) { return held(a[0]) + ".endsWith(" + a[1] + ")"; },
      isdigit: function (a) { return held(a[0]) + '.matches("[0-9]+")'; },
      isalpha: function (a) { return held(a[0]) + '.matches("[A-Za-z]+")'; },
      isupper: function (a) { return "(" + held(a[0]) + ".equals(" + held(a[0]) + '.toUpperCase()) && ' + held(a[0]) + '.matches(".*[A-Z].*"))'; },
      islower: function (a) { return "(" + held(a[0]) + ".equals(" + held(a[0]) + '.toLowerCase()) && ' + held(a[0]) + '.matches(".*[a-z].*"))'; },
      isspace: function (a) { return held(a[0]) + '.matches("\\\\s+")'; },
      ord: function (a) { return "(int) " + held(a[0]) + ".charAt(0)"; },
      chr: function (a) { return "String.valueOf((char) (" + a[0] + "))"; },
      classof: function (a, k) {
        if (isRecKind(k[0])) { return held(a[0]) + ".kindName"; }
        if (k[0] === "real") { return "(" + a[0] + " == Math.floor(" + a[0] + ") ? \"Integer\" : \"Real\")"; }
        return "((Object) " + held(a[0]) + ").getClass().getSimpleName()";
      },
      any: function (a) { return held(a[0]) + ".contains(true)"; },
      all: function (a) { return "!" + held(a[0]) + ".contains(false)"; },
      newlist: function (a, k, w) {
        var fill = a[a.length - 1], sizes = a.slice(0, -1);
        // a list of records: every place a record of its own, not one shared
        if (isRecKind(k[k.length - 1])) {
          w.need("filledEach");
          return "filledEach(() -> " + fill + ", " + sizes.map(function (n, i) {
            return k[i] === "real" ? "(int) " + held(n) : n;
          }).join(", ") + ")";
        }
        w.need("filled");
        if (k[k.length - 1] === "int" && elemOf(builtKind("newlist", k)) === "real") { fill = this.widen(fill); }
        return "filled(" + fill + ", " + sizes.map(function (n, i) {
          return k[i] === "real" ? "(int) " + held(n) : n;
        }).join(", ") + ")";
      },
      get: function (a, k, w) {
        // a table written out right there: told what it holds, which nothing
        // around it would tell Java
        var table = /^tableOf\(/.test(a[0]) ? "new " + w.typeOf(k[0]) + "(" + a[0] + ")" : held(a[0]);
        if (isTableKind(k[0]) && builtKind("get", k) === "any") {
          return "(" + table + ".containsKey(" + a[1] + ") ? (Object) " + table + ".get(" + a[1] + ") : (Object) " + held(a[2]) + ")";
        }
        if (isTableKind(k[0])) { return javaUnbox(table + ".getOrDefault(" + a[1] + ", " + (a[2] || "null") + ")", tableValue(k[0])); }
        return "(" + a[1] + " >= 0 && " + a[1] + " < " + held(a[0]) + ".size() ? " + held(a[0]) + ".get(" + a[1] + ") : " + (a[2] || "null") + ")";
      },
      clear: function (a) { return held(a[0]) + ".clear()"; },
      extend: function (a) { return held(a[0]) + ".addAll(" + a[1] + ")"; },
      isnumber: function (a, k, w) { w.need("isNumber"); return "isNumber(String.valueOf(" + a[0] + "))"; },
      tolist: function (a, k) {
        if (k[0] === "text") { return "new ArrayList<>(Arrays.asList(" + held(a[0]) + '.split("")))'; }
        return isTableKind(k[0]) ? "new ArrayList<>(" + held(a[0]) + ".keySet())" : "new ArrayList<>(" + a[0] + ")";
      },
      unique: function (a) { return "new ArrayList<>(new LinkedHashSet<>(" + a[0] + "))"; },
      union: function (a) {
        return "new ArrayList<>(java.util.stream.Stream.concat(" + held(a[0]) + ".stream(), " + held(a[1]) + ".stream()).distinct().toList())";
      },
      intersection: function (a) { return "new ArrayList<>(" + held(a[0]) + ".stream().distinct().filter(" + held(a[1]) + "::contains).toList())"; },
      difference: function (a) { return "new ArrayList<>(" + held(a[0]) + ".stream().filter(v_ -> !" + held(a[1]) + ".contains(v_)).toList())"; },
      // padLeft(x, 5): String.format does it, for a width written out and spaces;
      // anything else, and the page's own padded()
      padleft: function (a, k, w) {
        if (/^\d+$/.test(a[1]) && (!a[2] || a[2] === '" "')) { return 'String.format("%' + a[1] + 's", ' + a[0] + ")"; }
        w.need("padded");
        return "padded(" + a[0] + ", " + a[1] + ", " + (a[2] || '" "') + ", true)";
      },
      padright: function (a, k, w) {
        if (/^\d+$/.test(a[1]) && (!a[2] || a[2] === '" "')) { return 'String.format("%-' + a[1] + 's", ' + a[0] + ")"; }
        w.need("padded");
        return "padded(" + a[0] + ", " + a[1] + ", " + (a[2] || '" "') + ", false)";
      },
      fixed: function (a) { return 'String.format("%.' + a[1] + 'f", (double) (' + a[0] + "))"; },
      bitand: function (a) { return held(a[0]) + " & " + held(a[1]); },
      bitor: function (a) { return held(a[0]) + " | " + held(a[1]); },
      bitxor: function (a) { return held(a[0]) + " ^ " + held(a[1]); },
      real: function (a, k) { return k[0] === "text" ? "Double.parseDouble(" + a[0] + ")" : "(double) " + held(a[0]); },
      min: function (a, k) { return k.length === 1 && isListKind(k[0]) ? javaUnbox("Collections.min(" + a[0] + ")", elemOf(k[0])) : "Math.min(" + a.join(", ") + ")"; },
      max: function (a, k) { return k.length === 1 && isListKind(k[0]) ? javaUnbox("Collections.max(" + a[0] + ")", elemOf(k[0])) : "Math.max(" + a.join(", ") + ")"; },
      log: function (a) { return "Math.log(" + a[0] + ")"; },
      log10: function (a) { return "Math.log10(" + a[0] + ")"; },
      exp: function (a) { return "Math.exp(" + a[0] + ")"; },
      sin: function (a) { return "Math.sin(" + a[0] + ")"; },
      cos: function (a) { return "Math.cos(" + a[0] + ")"; },
      tan: function (a) { return "Math.tan(" + a[0] + ")"; },
      atan: function (a) { return "Math.atan(" + a[0] + ")"; },
      atan2: function (a) { return "Math.atan2(" + a.join(", ") + ")"; },
      hypot: function (a) { return "Math.hypot(" + a.join(", ") + ")"; },
      trunc: function (a) { return "(int) " + held(a[0]); }
    },
    helpers: {
      shown: ["    // A list, a table or a record, the way the chart shows one: ['a', 1].",
              "    static String shown(Object v) { return shown(v, false); }",
              "    static String shown(Object v, boolean inside) {",
              "        if (v instanceof List) {",
              "            StringBuilder out = new StringBuilder(\"[\");",
              "            for (Object x : (List<?>) v) { if (out.length() > 1) { out.append(\", \"); } out.append(shown(x, true)); }",
              "            return out.append(\"]\").toString();",
              "        }",
              "        if (v instanceof Map) {",
              "            StringBuilder out = new StringBuilder(\"{\");",
              "            for (Map.Entry<?, ?> e : ((Map<?, ?>) v).entrySet()) {",
              "                if (out.length() > 1) { out.append(\", \"); }",
              "                out.append(shown(e.getKey(), true)).append(\": \").append(shown(e.getValue(), true));",
              "            }",
              "            return out.append(\"}\").toString();",
              "        }",
              "        if (v instanceof String) { return inside ? \"'\" + v + \"'\" : (String) v; }",
              "        if (v instanceof Boolean) { return (Boolean) v ? \"True\" : \"False\"; }",
              "        if (v instanceof Double && (Double) v == Math.rint((Double) v) && !((Double) v).isInfinite()) {",
              "            return String.valueOf(((Double) v).longValue());",
              "        }",
              "        return String.valueOf(v);",
              "    }"],
      tableOf: ["    @SuppressWarnings(\"unchecked\")",
                "    static <K, V> LinkedHashMap<K, V> tableOf(Object... kv) {",
                "        LinkedHashMap<K, V> out = new LinkedHashMap<>();",
                "        for (int i = 0; i + 1 < kv.length; i += 2) { out.put((K) kv[i], (V) kv[i + 1]); }",
                "        return out;",
                "    }"],
      joined: ["    static String joined(List<?> items, String sep) {",
               "        StringBuilder out = new StringBuilder();",
               "        for (int i = 0; i < items.size(); i++) {",
               "            if (i > 0) { out.append(sep); }",
               "            out.append(items.get(i));",
               "        }",
               "        return out.toString();",
               "    }"],
      sortedList: ["    static <T extends Comparable<? super T>> ArrayList<T> sortedList(List<T> items) {",
                   "        ArrayList<T> out = new ArrayList<>(items);",
                   "        Collections.sort(out);",
                   "        return out;",
                   "    }",
                   "    static <T> ArrayList<T> sortedList(List<T> items, Comparator<? super T> order) {",
                   "        ArrayList<T> out = new ArrayList<>(items);",
                   "        out.sort(order);",
                   "        return out;",
                   "    }"],
      sizeOf: ["    // How many there are in something of no one kind: letters, items or keys.",
               "    static int sizeOf(Object v) {",
               "        if (v instanceof String) { return ((String) v).length(); }",
               "        if (v instanceof Map) { return ((Map<?, ?>) v).size(); }",
               "        return ((List<?>) v).size();",
               "    }"],
      orderOf: ["    // Which of two comes first: numbers by size, words by their letters,",
                "    // lists item by item -- the way the chart puts them in order.",
                "    @SuppressWarnings({\"unchecked\", \"rawtypes\"})",
                "    static int orderOf(Object a, Object b) {",
                "        if (a instanceof List && b instanceof List) {",
                "            List<?> x = (List<?>) a, y = (List<?>) b;",
                "            for (int i = 0; i < Math.min(x.size(), y.size()); i++) {",
                "                int one = orderOf(x.get(i), y.get(i));",
                "                if (one != 0) { return one; }",
                "            }",
                "            return Integer.compare(x.size(), y.size());",
                "        }",
                "        if (a instanceof Number && b instanceof Number) {",
                "            return Double.compare(((Number) a).doubleValue(), ((Number) b).doubleValue());",
                "        }",
                "        if (a instanceof Number != b instanceof Number) { return a instanceof Number ? -1 : 1; }",
                "        return ((Comparable) a).compareTo(b);",
                "    }"],
      sortIn: ["    static <T extends Comparable<? super T>> ArrayList<T> sortIn(ArrayList<T> items) {",
               "        Collections.sort(items);",
               "        return items;",
               "    }",
               "    static <T> ArrayList<T> sortIn(ArrayList<T> items, Comparator<? super T> order) {",
               "        items.sort(order);",
               "        return items;",
               "    }",
               "    static <T> ArrayList<T> reverseIn(ArrayList<T> items) {",
               "        Collections.reverse(items);",
               "        return items;",
               "    }"],
      reversedList: ["    static <T> ArrayList<T> reversedList(List<T> items) {",
                     "        ArrayList<T> out = new ArrayList<>(items);",
                     "        Collections.reverse(out);",
                     "        return out;",
                     "    }"],
      shuffledList: ["    static <T> ArrayList<T> shuffledList(List<T> items) {",
                     "        ArrayList<T> out = new ArrayList<>(items);",
                     "        Collections.shuffle(out);",
                     "        return out;",
                     "    }"],
      itemsOf: ["    static <K, V> ArrayList<ArrayList<Object>> itemsOf(Map<K, V> table) {",
                "        ArrayList<ArrayList<Object>> out = new ArrayList<>();",
                "        for (Map.Entry<K, V> e : table.entrySet()) { out.add(new ArrayList<>(Arrays.asList(e.getKey(), e.getValue()))); }",
                "        return out;",
                "    }"],
      padded: ["    // v made at least `width` long, `fill` put on the left (or the right).",
               "    static String padded(Object v, int width, String fill, boolean left) {",
               "        String s = String.valueOf(v), pad = \"\";",
               "        while (pad.length() + s.length() < width) { pad += fill; }",
               "        pad = pad.substring(0, Math.max(0, width - s.length()));",
               "        return left ? pad + s : s + pad;",
               "    }"],
      filled: ["    // Lists of lists, as many as the sizes say, every place holding `fill`.",
               "    @SuppressWarnings(\"unchecked\")",
               "    static <T> T filled(Object fill, int... sizes) { return (T) filledFrom(fill, sizes, 0); }",
               "    static Object filledFrom(Object fill, int[] sizes, int at) {",
               "        if (at == sizes.length) { return fill instanceof List ? new ArrayList<>((List<?>) fill) : fill; }",
               "        ArrayList<Object> out = new ArrayList<>();",
               "        for (int i = 0; i < sizes[at]; i++) { out.add(filledFrom(fill, sizes, at + 1)); }",
               "        return out;",
               "    }"],
      filledEach: ["    // Lists of lists, every place a new one made by `make`: a list of records.",
                   "    @SuppressWarnings(\"unchecked\")",
                   "    static <T> T filledEach(java.util.function.Supplier<Object> make, int... sizes) { return (T) filledEachFrom(make, sizes, 0); }",
                   "    static Object filledEachFrom(java.util.function.Supplier<Object> make, int[] sizes, int at) {",
                   "        if (at == sizes.length) { return make.get(); }",
                   "        ArrayList<Object> out = new ArrayList<>();",
                   "        for (int i = 0; i < sizes[at]; i++) { out.add(filledEachFrom(make, sizes, at + 1)); }",
                   "        return out;",
                   "    }"],
      isNumber: ["    static boolean isNumber(String s) {",
                 "        try { Double.parseDouble(s.trim()); return true; }",
                 "        catch (NumberFormatException e) { return false; }",
                 "    }"]
    }
  };
  // sort(people, byAge): a comparison of two, or a key to sort by
  function javaOrder(code, node, w, elem) {
    var one = orderedBy(node, w);
    if (one && one.params.length === 2) {
      var f = w.reachMod(one) + w.called(one);
      return one.gives === "bool" ? "(a_, b_) -> " + f + "(a_, b_) ? -1 : " + f + "(b_, a_) ? 1 : 0"
                                  : "(a_, b_) -> (int) Math.signum(" + f + "(a_, b_))";
    }
    var key = w.keyFn(node, elem);
    w.need("orderOf");
    if (key) { return "(a_, b_) -> orderOf(" + key("a_") + ", " + key("b_") + ")"; }
    if (code && node && (node.call === "bind" || w.kind(node) === "fn")) {
      var bound = node.call === "bind" ? boundArity(node, w) : null;
      if (bound && bound.left === 2) {
        return bound.one.gives === "bool" ? "(a_, b_) -> (Boolean) " + held(code) + ".call(a_, b_) ? -1 : (Boolean) " + held(code) + ".call(b_, a_) ? 1 : 0"
                                          : "(a_, b_) -> (int) Math.signum(((Number) " + held(code) + ".call(a_, b_)).doubleValue())";
      }
      return "(a_, b_) -> orderOf(" + held(code) + ".call(a_), " + held(code) + ".call(b_))";
    }
    return "(a_, b_) -> orderOf(a_, b_)";
  }

  LIST_WORK.csharp = {
    negatives: false,
    constant: function (name) { return name === "newline" ? '"\\n"' : name === "tab" ? '"\\t"' : "double.PositiveInfinity"; },
    fnRef: function (name, one, w) { return w.reachMod(one) + name; },
    listType: function (type) { return "List<" + type + ">"; },
    tableType: function (k, v) { return "Dictionary<" + k + ", " + v + ">"; },
    recType: function (name, w) { return name ? w.recName(name) : "Record"; },
    fnType: "object",
    listOf: function (items, kind, w) { return "new " + w.typeOf(kind) + " { " + items.join(", ") + " }"; },
    tableOf: function (pairs, kind, w) {
      return "new " + w.typeOf(kind) + " { " + pairs.map(function (p) { return "{ " + p[0] + ", " + p[1] + " }"; }).join(", ") + " }";
    },
    newRecord: function (kind, w, args) { return "new " + w.recName(kind) + "(" + (args || []).join(", ") + ")"; },
    itemAt: function (o, i) { return held(o) + "[" + i + "]"; },
    charAt: function (o, i) { return held(o) + "[" + i + "].ToString()"; },
    lookUp: function (o, k) { return held(o) + "[" + k + "]"; },
    setAt: function (o, i, v) { return held(o) + "[" + i + "] = " + v; },
    putIn: function (o, k, v) { return held(o) + "[" + k + "] = " + v; },
    partOf: function (o, name) { return held(o) + "." + name; },
    lengthOf: function (o, kind) { return held(o) + (kind === "text" ? ".Length" : ".Count"); },
    emptyOf: function (kind, w) { return isListKind(kind) || isTableKind(kind) ? "new " + w.typeOf(kind) + "()" : "null"; },
    castTo: function (code, type) { return "(" + type + ")" + held(code); },
    forEach: function (w, item, deep) {
      var over = tree(item.over), kind = w.kind(over), src = w.code(item.over);
      var entry = w.entry(item["var"]), elem = kind === "text" ? "text" : isTableKind(kind) ? tableKey(kind) : elemOf(kind);
      if (kind === "text") { src = held(src) + ".Select(c_ => c_.ToString())"; }
      else if (isTableKind(kind)) { src = held(src) + ".Keys.ToList()"; }
      var type = w.elemType(item.over, elem);
      if (entry && !entry.perLoop) {
        w.line(deep, "foreach (" + type + " " + w.spelled(entry) + "_ in " + src + ") {");
        w.line(deep + 1, w.named(item["var"]) + " = " + w.spelled(entry) + "_;");
      } else if (loopSetsItsName(item)) {
        w.line(deep, "foreach (" + type + " " + w.named(item["var"]) + "_ in " + src + ") {");
        w.line(deep + 1, type + " " + w.named(item["var"]) + " = " + w.named(item["var"]) + "_;");
      } else {
        w.line(deep, "foreach (" + type + " " + w.named(item["var"]) + " in " + src + ") {");
      }
      w.block(item.body, deep + 1);
      w.line(deep, "}");
    },
    shown: function (code, w) { w.need("shown"); return "Shown(" + code + ")"; },
    records: function (w, recs, deep) {
      var fields = unionFields(w.prog);
      w.need("shown");
      w.line(0, "");
      w.line(deep, "class Record {");
      w.line(deep + 1, 'public string KindName = "Record";');
      Object.keys(fields).forEach(function (low) {
        w.line(deep + 1, "public " + w.typeOf(fields[low].kind) + " " + w.fieldName(fields[low].name) + ";");
      });
      if (w.needs.recordCopy || w.needs.deepCopyRec) {  // copy(p): one of its own
        w.line(deep + 1, "public Record Copied() { return (Record)MemberwiseClone(); }");
      }
      if (w.needs.deepCopyRec) {                        // deepCopy(p): and what it holds
        w.line(deep + 1, "public Record DeepCopied() {");
        w.line(deep + 2, "var made = (Record)MemberwiseClone();");
        Object.keys(fields).forEach(function (low) {
          if (compoundKind(fields[low].kind)) {
            var f = w.fieldName(fields[low].name);
            w.line(deep + 2, "made." + f + " = DeepCopy(made." + f + ");");
          }
        });
        w.line(deep + 2, "return made;");
        w.line(deep + 1, "}");
      }
      w.line(deep + 1, "public override string ToString() {");
      Object.keys(recs).forEach(function (kind) {
        w.line(deep + 2, 'if (KindName == "' + kind + '") { return ' +
               recordText(w, kind, shownFields(w.prog, kind), "Shown") + "; }");
      });
      w.line(deep + 2, "return " + recordText(w, "Record", shownFields(w.prog, ""), "Shown").replace('"Record(', 'KindName + "(') + ";");
      w.line(deep + 1, "}");
      w.line(deep, "}");
      Object.keys(recs).forEach(function (kind) {
        w.line(0, "");
        w.line(deep, "class " + w.recName(kind) + " : Record {");
        var laid = laidFields(recs[kind]);
        w.line(deep + 1, "public " + w.recName(kind) + '() { KindName = "' + kind + '";' + laidStarts(w, laid, "") + " }");
        if (laid.length) {                              // new Car("Ford", 1.8)
          w.line(deep + 1, "public " + w.recName(kind) + "(" + laidParams(w, laid, fields) + ") : this() {");
          laid.forEach(function (f) {
            w.line(deep + 2, "this." + w.fieldName(f.name) + " = " + w.fieldName(f.name) + ";");
          });
          w.line(deep + 1, "}");
        }
        w.line(deep, "}");
      });
    },
    nullValue: "null",
    anyType: "dynamic",
    truthOf: function (code, kind) {
      if (kind === "int" || kind === "real") { return held(code) + " != 0"; }
      if (kind === "text") { return held(code) + ' != ""'; }
      if (isListKind(kind) || isTableKind(kind)) { return held(code) + ".Count > 0"; }
      return held(code) + " != null";
    },
    sameItems: function (a, b, differ, w) {
      w.need("shown");
      return "Shown(" + a + ") " + (differ ? "!=" : "==") + " Shown(" + b + ")";
    },
    anyOrder: function (a, op, b, w) { w.need("orderOf"); return "OrderOf(" + a + ", " + b + ") " + op + " 0"; },
    boxedKind: { int: "int?", real: "double?", bool: "bool?" },
    // int by = 1: C# says a default in the heading where it is a plain value
    paramDefault: function (code, said, kind) {
      // "" for something that is not words is nothing yet: null, where the kind can hold it
      if (/^\s*""\s*$/.test(String(said || "")) && kind !== "text") { return compoundKind(kind) || kind === "any" ? " = null" : null; }
      return /^\s*(-?\d+(\.\d+)?|"[^"\\]*"|true|false)\s*$/i.test(String(said || "")) ? " = " + code : null;
    },
    nullableList: function (elem) { return "List<" + { int: "int?", real: "double?", bool: "bool?" }[elem] + ">"; },
    lists: {
      length: function (a, k) { return held(a[0]) + (k[0] === "text" ? ".Length" : ".Count"); },
      append: function (a) { return held(a[0]) + ".Add(" + a[1] + ")"; },
      insert: function (a) { return held(a[0]) + ".Insert(" + a[1] + ", " + a[2] + ")"; },
      remove: function (a) { return held(a[0]) + ".Remove(" + a[1] + ")"; },
      pop: function (a, k, w) {
        if (isTableKind(k[0])) { w.need("popKey"); return "PopKey(" + a[0] + ", " + a[1] + ")"; }
        w.need("popAt"); return "PopAt(" + a[0] + (a[1] ? ", " + a[1] : "") + ")";
      },
      contains: function (a, k) { return isTableKind(k[0]) ? held(a[0]) + ".ContainsKey(" + a[1] + ")" : held(a[0]) + ".Contains(" + a[1] + ")"; },
      indexof: function (a) { return held(a[0]) + ".IndexOf(" + a[1] + ")"; },
      count: function (a, k) {
        if (k[0] === "text") { return "(" + held(a[0]) + ".Split(new[] { " + a[1] + " }, StringSplitOptions.None).Length - 1)"; }
        return held(a[0]) + ".Count(v_ => v_.Equals(" + a[1] + "))";
      },
      slice: function (a, k) {
        if (k[0] === "text") { return held(a[0]) + ".Substring(" + a[1] + (a[2] ? ", " + a[2] + " - " + held(a[1]) : "") + ")"; }
        return held(a[0]) + ".GetRange(" + a[1] + ", " + (a[2] || held(a[0]) + ".Count") + " - " + held(a[1]) + ")";
      },
      substring: function (a) { return held(a[0]) + ".Substring(" + a[1] + (a[2] ? ", " + a[2] + " - " + held(a[1]) : "") + ")"; },
      join: function (a) { return "string.Join(" + (a[1] || '""') + ", " + a[0] + ")"; },
      split: function (a) {
        if (!a[1]) { return held(a[0]) + ".Split(new char[0], StringSplitOptions.RemoveEmptyEntries).ToList()"; }
        if (a[1] === '""') { return held(a[0]) + ".Select(c_ => c_.ToString()).ToList()"; }
        return held(a[0]) + ".Split(new[] { " + a[1] + " }, StringSplitOptions.None).ToList()";
      },
      sum: function (a) { return held(a[0]) + ".Sum()"; },
      sort: function (a, k, w, nodes) {
        var how = a[1] || !/^(int|real|text|bool)$/.test(elemOf(k[0])) ? csOrder(a[1], nodes[1], w, elemOf(k[0]))
                : elemOf(k[0]) === "text" ? "string.CompareOrdinal" : "";
        if (w.statement) { return held(a[0]) + ".Sort(" + how + ")"; }
        w.need("sortIn");
        return "SortIn(" + a[0] + (how ? ", " + how : "") + ")";
      },
      sorted: function (a, k, w, nodes) {
        if (a[1] || !/^(int|real|text|bool)$/.test(elemOf(k[0]))) {
          w.need("sortedList");
          return "SortedList(" + a[0] + ", " + csOrder(a[1], nodes[1], w, elemOf(k[0])) + ")";
        }
        return held(a[0]) + ".OrderBy(v_ => v_" + (elemOf(k[0]) === "text" || k[0] === "text" ? ", StringComparer.Ordinal" : "") + ").ToList()";
      },
      reverse: function (a, k, w) {
        if (k[0] === "text") { return "new string(" + held(a[0]) + ".Reverse().ToArray())"; }
        if (w.statement) { return held(a[0]) + ".Reverse()"; }
        w.need("sortIn");
        return "ReverseIn(" + a[0] + ")";
      },
      reversed: function (a, k) { return k[0] === "text" ? "new string(" + held(a[0]) + ".Reverse().ToArray())" : "Enumerable.Reverse(" + a[0] + ").ToList()"; },
      shuffle: function (a, k, w) { w.need("shuffle"); return "Shuffle(" + a[0] + ")"; },
      shuffled: function (a, k, w) { w.need("shuffle"); return "Shuffle(new " + w.typeOf(k[0]) + "(" + a[0] + "))"; },
      choice: function (a, k, w) { w.need("dice"); return held(a[0]) + "[" + w.reach + "rng.Next(" + held(a[0]) + ".Count)]"; },
      union: function (a) { return held(a[0]) + ".Union(" + a[1] + ").ToList()"; },
      intersection: function (a) { return held(a[0]) + ".Intersect(" + a[1] + ").ToList()"; },
      difference: function (a) { return held(a[0]) + ".Where(v_ => !" + held(a[1]) + ".Contains(v_)).ToList()"; },
      repeat: function (a, k) {
        if (isListKind(k[0])) { return "Enumerable.Repeat(" + a[0] + ", " + a[1] + ").SelectMany(v_ => v_).ToList()"; }
        return "string.Concat(Enumerable.Repeat(" + a[0] + ", " + a[1] + "))";
      },
      range: function (a) {
        var from = a.length > 1 ? a[0] : "0", to = a.length > 1 ? a[1] : a[0];
        return "Enumerable.Range(" + from + ", " + to + " - " + held(from) + ").ToList()";
      },
      keys: function (a) { return held(a[0]) + ".Keys.ToList()"; },
      values: function (a) { return held(a[0]) + ".Values.ToList()"; },
      items: function (a) { return held(a[0]) + ".Select(p_ => new List<dynamic> { p_.Key, p_.Value }).ToList()"; },
      enumerate: function (a) { return held(a[0]) + ".Select((v_, i_) => new List<dynamic> { i_, v_ }).ToList()"; },
      zip: function (a) { return held(a[0]) + ".Zip(" + a[1] + ", (x_, y_) => new List<dynamic> { x_, y_ }).ToList()"; },
      copy: function (a, k, w) { return k[0] === "text" ? a[0] : "new " + w.typeOf(k[0]) + "(" + a[0] + ")"; },
      tostring: function (a, k, w) { return compoundKind(k[0]) ? this.shown(a[0], w) : "Convert.ToString(" + a[0] + ")"; },
      replace: function (a) { return held(a[0]) + ".Replace(" + a[1] + ", " + a[2] + ")"; },
      trim: function (a) { return held(a[0]) + ".Trim()"; },
      startswith: function (a) { return held(a[0]) + ".StartsWith(" + a[1] + ")"; },
      endswith: function (a) { return held(a[0]) + ".EndsWith(" + a[1] + ")"; },
      isdigit: function (a) { return "(" + held(a[0]) + ".Length > 0 && " + held(a[0]) + ".All(char.IsDigit))"; },
      isalpha: function (a) { return "(" + held(a[0]) + ".Length > 0 && " + held(a[0]) + ".All(char.IsLetter))"; },
      isupper: function (a) { return "(" + held(a[0]) + ".Any(char.IsUpper) && !" + held(a[0]) + ".Any(char.IsLower))"; },
      islower: function (a) { return "(" + held(a[0]) + ".Any(char.IsLower) && !" + held(a[0]) + ".Any(char.IsUpper))"; },
      isspace: function (a) { return "(" + held(a[0]) + ".Length > 0 && " + held(a[0]) + ".All(char.IsWhiteSpace))"; },
      ord: function (a) { return "(int)" + held(a[0]) + "[0]"; },
      chr: function (a) { return "((char)(" + a[0] + ")).ToString()"; },
      classof: function (a, k) {
        if (isRecKind(k[0])) { return held(a[0]) + ".KindName"; }
        if (k[0] === "real") { return "(" + a[0] + " == Math.Floor(" + a[0] + ") ? \"Integer\" : \"Real\")"; }
        return held(a[0]) + ".GetType().Name";
      },
      any: function (a) { return held(a[0]) + ".Any(v_ => v_)"; },
      all: function (a) { return held(a[0]) + ".All(v_ => v_)"; },
      newlist: function (a, k, w) {
        var fill = a[a.length - 1], sizes = a.slice(0, -1);
        // a list of Reals started at nought starts at 0.0: Repeat(0, n) is a
        // List<int>, which a List<double> will not take
        if (k[k.length - 1] === "real" && /^-?\d+$/.test(String(fill).trim())) { fill = String(fill).trim() + ".0"; }
        var made = compoundKind(k[k.length - 1]) ? "Enumerable.Range(0, " + sizes[sizes.length - 1] + ").Select(n_ => " + fill + ").ToList()"
                                                  : "Enumerable.Repeat(" + fill + ", " + sizes[sizes.length - 1] + ").ToList()";
        for (var d = sizes.length - 2; d >= 0; d--) { made = "Enumerable.Range(0, " + sizes[d] + ").Select(n_ => " + made + ").ToList()"; }
        return made;
      },
      get: function (a, k, w) {
        var none = a[2] || "default(" + w.typeOf(elemOf(k[0]) || "real") + ")";
        if (isTableKind(k[0]) && builtKind("get", k) === "any") {
          return "(" + held(a[0]) + ".ContainsKey(" + a[1] + ") ? (dynamic)" + held(a[0]) + "[" + a[1] + "] : (dynamic)" + held(a[2]) + ")";
        }
        if (isTableKind(k[0])) { return "(" + held(a[0]) + ".ContainsKey(" + a[1] + ") ? " + held(a[0]) + "[" + a[1] + "] : " + none + ")"; }
        return "(" + a[1] + " >= 0 && " + a[1] + " < " + held(a[0]) + ".Count ? " + held(a[0]) + "[" + a[1] + "] : " + none + ")";
      },
      clear: function (a) { return held(a[0]) + ".Clear()"; },
      // a list of numbers put on the end of a list of anything: each one on its own
      extend: function (a, k) {
        return held(a[0]) + ".AddRange(" + (elemOf(k[0]) !== elemOf(k[1]) ? held(a[1]) + ".Cast<dynamic>()" : a[1]) + ")";
      },
      isnumber: function (a, k, w) { w.need("isNumber"); return "IsNumber(Convert.ToString(" + a[0] + "))"; },
      tolist: function (a, k) {
        if (k[0] === "text") { return held(a[0]) + ".Select(c_ => c_.ToString()).ToList()"; }
        return isTableKind(k[0]) ? held(a[0]) + ".Keys.ToList()" : held(a[0]) + ".ToList()";
      },
      unique: function (a) { return held(a[0]) + ".Distinct().ToList()"; },
      padleft: function (a) { return "Convert.ToString(" + a[0] + ").PadLeft(" + a[1] + (a[2] ? ", " + a[2] + "[0]" : "") + ")"; },
      padright: function (a) { return "Convert.ToString(" + a[0] + ").PadRight(" + a[1] + (a[2] ? ", " + a[2] + "[0]" : "") + ")"; },
      fixed: function (a) { return "(" + a[0] + ").ToString(\"F" + a[1] + "\")"; },
      bitand: function (a) { return held(a[0]) + " & " + held(a[1]); },
      bitor: function (a) { return held(a[0]) + " | " + held(a[1]); },
      bitxor: function (a) { return held(a[0]) + " ^ " + held(a[1]); },
      real: function (a, k) { return k[0] === "text" ? "double.Parse(" + a[0] + ")" : "(double)" + held(a[0]); },
      min: function (a, k) { return k.length === 1 && isListKind(k[0]) ? held(a[0]) + ".Min()" : "Math.Min(" + a.join(", ") + ")"; },
      max: function (a, k) { return k.length === 1 && isListKind(k[0]) ? held(a[0]) + ".Max()" : "Math.Max(" + a.join(", ") + ")"; },
      log: function (a) { return "Math.Log(" + a[0] + ")"; },
      log10: function (a) { return "Math.Log10(" + a[0] + ")"; },
      exp: function (a) { return "Math.Exp(" + a[0] + ")"; },
      sin: function (a) { return "Math.Sin(" + a[0] + ")"; },
      cos: function (a) { return "Math.Cos(" + a[0] + ")"; },
      tan: function (a) { return "Math.Tan(" + a[0] + ")"; },
      atan: function (a) { return "Math.Atan(" + a[0] + ")"; },
      atan2: function (a) { return "Math.Atan2(" + a.join(", ") + ")"; },
      hypot: function (a) { return "Math.Sqrt(" + held(a[0]) + " * " + held(a[0]) + " + " + held(a[1]) + " * " + held(a[1]) + ")"; },
      trunc: function (a) { return "(int)" + held(a[0]); }
    },
    helpers: {
      shown: ["    // A list, a table or a record, the way the chart shows one: ['a', 1].",
              "    public static string Shown(object v, bool inside = false) {",
              "        if (v is string) { return inside ? \"'\" + v + \"'\" : (string)v; }",
              "        if (v is bool) { return (bool)v ? \"True\" : \"False\"; }",
              "        if (v is System.Collections.IDictionary) {",
              "            var parts = new List<string>();",
              "            foreach (System.Collections.DictionaryEntry e in (System.Collections.IDictionary)v) {",
              "                parts.Add(Shown(e.Key, true) + \": \" + Shown(e.Value, true));",
              "            }",
              "            return \"{\" + string.Join(\", \", parts) + \"}\";",
              "        }",
              "        if (v is System.Collections.IEnumerable) {",
              "            var parts = new List<string>();",
              "            foreach (object x in (System.Collections.IEnumerable)v) { parts.Add(Shown(x, true)); }",
              "            return \"[\" + string.Join(\", \", parts) + \"]\";",
              "        }",
              "        return Convert.ToString(v);",
              "    }"],
      orderOf: ["    // Which of two comes first: numbers by size, words by their letters,",
                "    // lists item by item -- the way the chart puts them in order.",
                "    static int OrderOf(object a, object b) {",
                "        var x = a as System.Collections.IList;",
                "        var y = b as System.Collections.IList;",
                "        if (x != null && y != null) {",
                "            for (int i = 0; i < Math.Min(x.Count, y.Count); i++) {",
                "                int one = OrderOf(x[i], y[i]);",
                "                if (one != 0) { return one; }",
                "            }",
                "            return x.Count.CompareTo(y.Count);",
                "        }",
                "        bool an = a is int || a is double, bn = b is int || b is double;",
                "        if (an && bn) { return Convert.ToDouble(a).CompareTo(Convert.ToDouble(b)); }",
                "        if (an != bn) { return an ? -1 : 1; }",
                "        if (a is string && b is string) { return string.CompareOrdinal((string)a, (string)b); }",
                "        return Comparer<object>.Default.Compare(a, b);",
                "    }"],
      sortIn: ["    static List<T> SortIn<T>(List<T> items) { items.Sort(); return items; }",
               "    static List<T> SortIn<T>(List<T> items, Comparison<T> order) { items.Sort(order); return items; }",
               "    static List<T> ReverseIn<T>(List<T> items) { items.Reverse(); return items; }"],
      popKey: ["    // what a table holds under key, taken out of it",
               "    static V PopKey<K, V>(Dictionary<K, V> table, K key) {",
               "        V v = table[key];",
               "        table.Remove(key);",
               "        return v;",
               "    }"],
      popAt: ["    static T PopAt<T>(List<T> items, int at = -1) {",
              "        if (at < 0) { at = items.Count - 1; }",
              "        T got = items[at];",
              "        items.RemoveAt(at);",
              "        return got;",
              "    }"],
      sortedList: ["    static List<T> SortedList<T>(List<T> items, Comparison<T> order) {",
                   "        var made = new List<T>(items);",
                   "        made.Sort(order);",
                   "        return made;",
                   "    }"],
      shuffle: ["    static List<T> Shuffle<T>(List<T> items) {",
                "        var dice = new Random();",
                "        for (int i = items.Count - 1; i > 0; i--) {",
                "            int j = dice.Next(i + 1);",
                "            T keep = items[i]; items[i] = items[j]; items[j] = keep;",
                "        }",
                "        return items;",
                "    }"],
      isNumber: ["    static bool IsNumber(string s) {",
                 "        double got;",
                 "        return double.TryParse(s.Trim(), out got);",
                 "    }"]
    }
  };
  function csOrder(code, node, w, elem) {
    var one = orderedBy(node, w);
    if (one && one.params.length === 2) {
      var f = w.reachMod(one) + w.called(one);
      return one.gives === "bool" ? "(a_, b_) => " + f + "(a_, b_) ? -1 : " + f + "(b_, a_) ? 1 : 0"
                                  : "(a_, b_) => Math.Sign(" + f + "(a_, b_))";
    }
    var key = w.keyFn(node, elem);
    w.need("orderOf");
    if (key) { return "(a_, b_) => OrderOf(" + key("a_") + ", " + key("b_") + ")"; }
    if (code && node && (node.call === "bind" || w.kind(node) === "fn")) {
      var bound = node.call === "bind" ? boundArity(node, w) : null;
      var f = "((dynamic)" + held(code) + ")";
      if (bound && bound.left === 2) {
        return bound.one.gives === "bool" ? "(a_, b_) => " + f + "(a_, b_) ? -1 : " + f + "(b_, a_) ? 1 : 0"
                                          : "(a_, b_) => Math.Sign((double)" + f + "(a_, b_))";
      }
      return "(a_, b_) => OrderOf(" + f + "(a_), " + f + "(b_))";
    }
    return "(a_, b_) => OrderOf(a_, b_)";
  }

  LIST_WORK.cpp = {
    negatives: false,
    constant: function (name, w) {
      if (name === "infinity") { w.need("cmath"); return "INFINITY"; }
      return name === "newline" ? 'std::string("\\n")' : 'std::string("\\t")';
    },
    fnRef: function (name) { return name; },
    listType: function (type) { return "std::vector<" + type + ">"; },
    tableType: function (k, v) { return "std::map<" + k + ", " + v + ">"; },
    recType: function (name, w) { return (name ? w.recName(name) : "Record") + "*"; },
    fnType: "void*",
    listOf: function (items, kind, w) { w.need("vector"); return w.typeOf(kind) + "{" + items.join(", ") + "}"; },
    tableOf: function (pairs, kind, w) {
      w.need("map");
      return w.typeOf(kind) + "{" + pairs.map(function (p) { return "{" + p[0] + ", " + p[1] + "}"; }).join(", ") + "}";
    },
    newRecord: function (kind, w, args) { return "new " + w.recName(kind) + "(" + (args || []).join(", ") + ")"; },
    itemAt: function (o, i) { return held(o) + "[" + i + "]"; },
    charAt: function (o, i) { return "std::string(1, " + held(o) + "[" + i + "])"; },
    lookUp: function (o, k) { return held(o) + "[" + k + "]"; },
    setAt: function (o, i, v) { return held(o) + "[" + i + "] = " + v; },
    putIn: function (o, k, v) { return held(o) + "[" + k + "] = " + v; },
    partOf: function (o, name) { return held(o) + "->" + name; },
    lengthOf: function (o) { return "(int)" + held(o) + ".size()"; },
    emptyOf: function (kind, w) { return isListKind(kind) || isTableKind(kind) ? w.typeOf(kind) + "()" : "nullptr"; },
    castTo: function (code, type) { return "(" + type + ")" + held(code); },
    forEach: function (w, item, deep) {
      var over = tree(item.over), kind = w.kind(over), src = w.code(item.over);
      var entry = w.entry(item["var"]), elem = kind === "text" ? "text" : isTableKind(kind) ? tableKey(kind) : kind === "any" ? "any" : elemOf(kind);
      if (kind === "text") { w.need("chars"); src = "chars(" + src + ")"; }
      else if (isTableKind(kind)) { w.need("keysOf"); src = "keysOf(" + src + ")"; }
      var type = w.typeOf(elem || "real");
      if (entry && !entry.perLoop) {
        w.line(deep, "for (" + type + " " + w.spelled(entry) + "_ : " + src + ") {");
        w.line(deep + 1, w.named(item["var"]) + " = " + w.spelled(entry) + "_;");
      } else {
        w.line(deep, "for (" + type + " " + w.named(item["var"]) + " : " + src + ") {");
      }
      w.block(item.body, deep + 1);
      w.line(deep, "}");
    },
    // cout << a list: the operators that write one out, from the helpers
    shown: function (code, w) { w.need("shown"); w.need("textOf"); return "textOf(" + code + ")"; },
    // One struct holding every field any record has, and one of each kind
    // made from it; a record is handed about by pointer, as `new` gives it.
    records: function (w, recs) {
      var fields = unionFields(w.prog);
      w.need("shown");
      w.line(0, "");
      w.line(0, "struct Record {");
      w.line(1, 'std::string kindName = "Record";');
      Object.keys(fields).forEach(function (low) {
        w.line(1, w.typeOf(fields[low].kind) + " " + w.fieldName(fields[low].name) + "{};");
      });
      w.line(1, "virtual ~Record() {}");
      w.line(0, "};");
      Object.keys(recs).forEach(function (kind) {
        w.line(0, "");
        w.line(0, "struct " + w.recName(kind) + " : Record {");
        var laid = laidFields(recs[kind]);
        w.line(1, w.recName(kind) + '() { kindName = "' + kind + '";' + laidStarts(w, laid, "this->", true) + " }");
        if (laid.length) {                              // new Car("Ford", 1.8)
          w.line(1, w.recName(kind) + "(" + laidParams(w, laid, fields) + ") : " + w.recName(kind) + "() {");
          laid.forEach(function (f) {
            w.line(2, "this->" + w.fieldName(f.name) + " = " + w.fieldName(f.name) + ";");
          });
          w.line(1, "}");
        }
        w.line(0, "};");
      });
      w.line(0, "");
      w.line(0, "std::ostream& operator<<(std::ostream& out, const Record* it) {");
      function fieldsOut(kind, own) {
        var names = Object.keys(own);
        w.line(2, "out << " + (kind ? '"' + kind + '("' : 'it->kindName << "("') + ";");
        names.forEach(function (low, i) {
          w.line(2, 'out << "' + (i ? ", " : "") + own[low].name + '="; shownIn(out, it->' + w.fieldName(own[low].name) + ");");
        });
        w.line(2, 'return out << ")";');
      }
      Object.keys(recs).forEach(function (kind) {
        w.line(1, 'if (it->kindName == "' + kind + '") {');
        fieldsOut(kind, shownFields(w.prog, kind));
        w.line(1, "}");
      });
      w.line(1, "{");
      fieldsOut("", shownFields(w.prog, ""));
      w.line(1, "}");
      w.line(0, "}");
    },
    nullValue: "nullptr",
    anyType: "std::string",
    truthOf: function (code, kind) {
      if (kind === "int" || kind === "real") { return held(code) + " != 0"; }
      if (kind === "text" || isListKind(kind) || isTableKind(kind)) { return "!" + held(code) + ".empty()"; }
      if (kind === "any") { return "(bool)" + held(code); }
      return held(code) + " != nullptr";
    },
    lists: {
      length: function (a) { return "(int)" + held(a[0]) + ".size()"; },
      append: function (a) { return held(a[0]) + ".push_back(" + a[1] + ")"; },
      insert: function (a) { return held(a[0]) + ".insert(" + held(a[0]) + ".begin() + " + held(a[1]) + ", " + a[2] + ")"; },
      remove: function (a, k, w) {
        if (isTableKind(k[0])) { return held(a[0]) + ".erase(" + a[1] + ")"; }
        w.need("algorithm");
        return held(a[0]) + ".erase(std::find(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end(), " + a[1] + "))";
      },
      pop: function (a, k, w) {
        if (isTableKind(k[0])) { w.need("popKey"); return "popKey(" + a[0] + ", " + a[1] + ")"; }
        w.need("popAt"); return "popAt(" + a[0] + (a[1] ? ", " + a[1] : "") + ")";
      },
      contains: function (a, k, w) {
        if (isTableKind(k[0])) { return "(" + held(a[0]) + ".count(" + a[1] + ") > 0)"; }
        if (k[0] === "text") { return "(" + held(a[0]) + ".find(" + a[1] + ") != std::string::npos)"; }
        w.need("algorithm");
        return "(std::find(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end(), " + a[1] + ") != " + held(a[0]) + ".end())";
      },
      indexof: function (a, k, w) {
        if (k[0] === "text") { return "(int)" + held(a[0]) + ".find(" + a[1] + ")"; }
        w.need("indexOf");
        return "indexOf(" + a[0] + ", " + a[1] + ")";
      },
      count: function (a, k, w) { w.need("algorithm"); return "(int)std::count(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end(), " + a[1] + ")"; },
      slice: function (a, k, w) {
        if (k[0] === "text") { return held(a[0]) + ".substr(" + a[1] + (a[2] ? ", " + a[2] + " - " + held(a[1]) : "") + ")"; }
        return w.typeOf(k[0]) + "(" + held(a[0]) + ".begin() + " + held(a[1]) + ", " + (a[2] ? held(a[0]) + ".begin() + " + held(a[2]) : held(a[0]) + ".end()") + ")";
      },
      substring: function (a) { return held(a[0]) + ".substr(" + a[1] + (a[2] ? ", " + a[2] + " - " + held(a[1]) : "") + ")"; },
      join: function (a, k, w) { w.need("joined"); return "joined(" + a[0] + ", " + (a[1] || '""') + ")"; },
      split: function (a, k, w) { w.need("splitText"); return "splitText(" + a[0] + (a[1] ? ", " + a[1] : "") + ")"; },
      sum: function (a, k, w) { w.need("numeric"); return "std::accumulate(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end(), " + (elemOf(k[0]) === "int" ? "0" : "0.0") + ")"; },
      sort: function (a, k, w, nodes) {
        if (!w.statement) {
          w.need("sortedList");
          return "sortedList(" + a[0] + (a[1] ? ", " + cppOrder(a[1], nodes[1], w) : "") + ")";
        }
        w.need("algorithm");
        return "std::sort(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end()" + (a[1] ? ", " + cppOrder(a[1], nodes[1], w) : "") + ")";
      },
      sorted: function (a, k, w, nodes) {
        w.need("sortedList");
        return "sortedList(" + a[0] + (a[1] ? ", " + cppOrder(a[1], nodes[1], w) : "") + ")";
      },
      reverse: function (a, k, w) {
        if (!w.statement) { w.need("reversedCopy"); return "reversedCopy(" + a[0] + ")"; }
        w.need("algorithm");
        return "std::reverse(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end())";
      },
      reversed: function (a, k, w) { w.need("reversedCopy"); return "reversedCopy(" + a[0] + ")"; },
      shuffle: function (a, k, w) { w.need("shuffled"); return "shuffleIn(" + a[0] + ")"; },
      shuffled: function (a, k, w) { w.need("shuffled"); return "shuffledCopy(" + a[0] + ")"; },
      choice: function (a, k, w) { w.need("dice"); return held(a[0]) + "[std::rand() % " + held(a[0]) + ".size()]"; },
      repeat: function (a, k, w) { w.need("repeated"); return "repeated(" + a[0] + ", " + a[1] + ")"; },
      range: function (a, k, w) { w.need("rangeOf"); return "rangeOf(" + a.join(", ") + ")"; },
      keys: function (a, k, w) { w.need("keysOf"); return "keysOf(" + a[0] + ")"; },
      values: function (a, k, w) { w.need("valuesOf"); return "valuesOf(" + a[0] + ")"; },
      copy: function (a) { return a[0]; },
      tostring: function (a, k, w) {
        if (compoundKind(k[0])) { w.need("shown"); }
        w.need("textOf");
        return "textOf(" + a[0] + ")";
      },
      replace: function (a, k, w) { w.need("replaced"); return "replaced(" + a.join(", ") + ")"; },
      trim: function (a, k, w) { w.need("trimmed"); return "trimmed(" + a[0] + ")"; },
      startswith: function (a) { return "(" + held(a[0]) + ".rfind(" + a[1] + ", 0) == 0)"; },
      endswith: function (a) {
        return "(" + held(a[0]) + ".size() >= std::string(" + a[1] + ").size() && " + held(a[0]) + ".compare(" + held(a[0]) + ".size() - std::string(" + a[1] + ").size(), std::string::npos, " + a[1] + ") == 0)";
      },
      isdigit: function (a, k, w) { w.need("allOf"); return "allOf(" + a[0] + ", ::isdigit)"; },
      isalpha: function (a, k, w) { w.need("allOf"); return "allOf(" + a[0] + ", ::isalpha)"; },
      isupper: function (a, k, w) { w.need("allOf"); return "allOf(" + a[0] + ", ::isupper)"; },
      islower: function (a, k, w) { w.need("allOf"); return "allOf(" + a[0] + ", ::islower)"; },
      isspace: function (a, k, w) { w.need("allOf"); return "allOf(" + a[0] + ", ::isspace)"; },
      ord: function (a) { return "(int)(unsigned char)" + held(a[0]) + "[0]"; },
      chr: function (a) { return "std::string(1, (char)(" + a[0] + "))"; },
      classof: function (a, k, w) {
        if (k[0] === "real") { w.need("cmath"); return "std::string(" + a[0] + " == std::floor(" + a[0] + ") ? \"Integer\" : \"Real\")"; }
        if (k[0] === "any") { w.need("value"); return "classOf(" + a[0] + ")"; }
        return held(a[0]) + "->kindName";
      },
      any: function (a, k, w) { w.need("algorithm"); return "std::any_of(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end(), [](bool v) { return v; })"; },
      all: function (a, k, w) { w.need("algorithm"); return "std::all_of(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end(), [](bool v) { return v; })"; },
      newlist: function (a, k, w) {
        var fill = a[a.length - 1], sizes = a.slice(0, -1);
        var kind = builtKind("newlist", k), made = fill;
        var inner = kind;
        var types = [];
        for (var d = 0; d < sizes.length; d++) { types.push(w.typeOf(inner)); inner = elemOf(inner); }
        // a list of records: a new one made for every place -- the vector's
        // own filling copies the one pointer it is given into all of them
        var own = isRecKind(k[k.length - 1]);
        for (var e = sizes.length - 1; e >= 0; e--) {
          made = own ? "[&]{ " + types[e] + " v_; for (int i_ = 0; i_ < " + sizes[e] +
                       "; i_++) { v_.push_back(" + made + "); } return v_; }()"
                     : types[e] + "(" + sizes[e] + ", " + made + ")";
        }
        return made;
      },
      get: function (a, k, w) {
        if (isTableKind(k[0])) { return "(" + held(a[0]) + ".count(" + a[1] + ") ? " + held(a[0]) + "[" + a[1] + "] : " + (a[2] || "{}") + ")"; }
        return "(" + a[1] + " >= 0 && " + a[1] + " < (int)" + held(a[0]) + ".size() ? " + held(a[0]) + "[" + a[1] + "] : " + (a[2] || "{}") + ")";
      },
      clear: function (a) { return held(a[0]) + ".clear()"; },
      extend: function (a) { return held(a[0]) + ".insert(" + held(a[0]) + ".end(), " + held(a[1]) + ".begin(), " + held(a[1]) + ".end())"; },
      isnumber: function (a, k, w) { w.need("isNumber"); return "isNumber(" + a[0] + ")"; },
      tolist: function (a, k, w) {
        if (k[0] === "text") { w.need("chars"); return "chars(" + a[0] + ")"; }
        if (isTableKind(k[0])) { w.need("keysOf"); return "keysOf(" + a[0] + ")"; }
        return a[0];
      },
      unique: function (a, k, w) { w.need("uniqueOf"); return "uniqueOf(" + a[0] + ")"; },
      union: function (a, k, w) { w.need("setWork"); return "setWork(" + a[0] + ", " + a[1] + ", 2)"; },
      intersection: function (a, k, w) { w.need("setWork"); return "setWork(" + a[0] + ", " + a[1] + ", 0)"; },
      difference: function (a, k, w) { w.need("setWork"); return "setWork(" + a[0] + ", " + a[1] + ", 1)"; },
      padleft: function (a, k, w) { w.need("padded"); return "padded(" + a[0] + ", " + a[1] + ", " + (a[2] || '" "') + ", true)"; },
      padright: function (a, k, w) { w.need("padded"); return "padded(" + a[0] + ", " + a[1] + ", " + (a[2] || '" "') + ", false)"; },
      fixed: function (a, k, w) { w.need("fixedText"); return "fixedText(" + a[0] + ", " + a[1] + ")"; },
      bitand: function (a) { return held(a[0]) + " & " + held(a[1]); },
      bitor: function (a) { return held(a[0]) + " | " + held(a[1]); },
      bitxor: function (a) { return held(a[0]) + " ^ " + held(a[1]); },
      real: function (a, k) { return k[0] === "text" ? "std::stod(" + a[0] + ")" : "(double)" + held(a[0]); },
      min: function (a, k, w) {
        w.need("algorithm");
        return k.length === 1 && isListKind(k[0]) ? "*std::min_element(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end())" : "std::min(" + a.join(", ") + ")";
      },
      max: function (a, k, w) {
        w.need("algorithm");
        return k.length === 1 && isListKind(k[0]) ? "*std::max_element(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end())" : "std::max(" + a.join(", ") + ")";
      },
      log: function (a, k, w) { w.need("cmath"); return "std::log(" + a[0] + ")"; },
      log10: function (a, k, w) { w.need("cmath"); return "std::log10(" + a[0] + ")"; },
      exp: function (a, k, w) { w.need("cmath"); return "std::exp(" + a[0] + ")"; },
      sin: function (a, k, w) { w.need("cmath"); return "std::sin(" + a[0] + ")"; },
      cos: function (a, k, w) { w.need("cmath"); return "std::cos(" + a[0] + ")"; },
      tan: function (a, k, w) { w.need("cmath"); return "std::tan(" + a[0] + ")"; },
      atan: function (a, k, w) { w.need("cmath"); return "std::atan(" + a[0] + ")"; },
      atan2: function (a, k, w) { w.need("cmath"); return "std::atan2(" + a.join(", ") + ")"; },
      hypot: function (a, k, w) { w.need("cmath"); return "std::hypot(" + a.join(", ") + ")"; },
      trunc: function (a) { return "(int)" + held(a[0]); }
    },
    helpers: {
      // cout << a list, a table or a record, the way the chart shows one
      shown: { wants: ["vector", "map", "ostream"], lines: [
               "template <typename T> std::ostream& operator<<(std::ostream& out, const std::vector<T>& items);",
               "template <typename K, typename V> std::ostream& operator<<(std::ostream& out, const std::map<K, V>& table);",
               "static void shownIn(std::ostream& out, const std::string& s) { out << \"'\" << s << \"'\"; }",
               "static void shownIn(std::ostream& out, bool b) { out << (b ? \"True\" : \"False\"); }",
               "template <typename T> static void shownIn(std::ostream& out, const T& v) { out << v; }",
               "template <typename T> std::ostream& operator<<(std::ostream& out, const std::vector<T>& items) {",
               "    out << \"[\";",
               "    for (size_t i = 0; i < items.size(); i++) { if (i) { out << \", \"; } shownIn(out, (T)items[i]); }",
               "    return out << \"]\";",
               "}",
               "template <typename K, typename V> std::ostream& operator<<(std::ostream& out, const std::map<K, V>& table) {",
               "    out << \"{\";",
               "    bool first = true;",
               "    for (const auto& kv : table) {",
               "        if (!first) { out << \", \"; }",
               "        first = false;",
               "        shownIn(out, kv.first); out << \": \"; shownIn(out, kv.second);",
               "    }",
               "    return out << \"}\";",
               "}"] },
      popKey: { wants: ["map"], lines: ["// what a table holds under key, taken out of it",
                                        "template <typename K, typename V, typename Q> static V popKey(std::map<K, V>& table, const Q& key) {",
                                        "    V v = table.at(key);",
                                        "    table.erase(key);",
                                        "    return v;", "}"] },
      popAt: { wants: ["vector"], lines: ["template <typename T> static T popAt(std::vector<T>& items, int at = -1) {",
               "    if (at < 0) { at = (int)items.size() - 1; }", "    T got = items[at];",
               "    items.erase(items.begin() + at);", "    return got;", "}"] },
      indexOf: { wants: ["vector", "algorithm"], lines: ["template <typename T, typename U> static int indexOf(const std::vector<T>& items, const U& x, int from = 0) {",
                 "    auto at = std::find(items.begin() + std::min((int)items.size(), std::max(0, from)), items.end(), x);",
                 "    return at == items.end() ? -1 : (int)(at - items.begin());", "}"] },
      joined: { wants: ["vector", "sstream"], lines: ["template <typename T> static std::string joined(const std::vector<T>& items, const std::string& sep) {",
                "    std::ostringstream out;", "    for (size_t i = 0; i < items.size(); i++) {",
                "        if (i) { out << sep; }", "        out << items[i];", "    }", "    return out.str();", "}"] },
      splitText: { wants: ["vector", "sstream"], lines: ["static std::vector<std::string> splitText(const std::string& s) {",
                   "    std::istringstream in(s);", "    std::vector<std::string> out;", "    std::string word;",
                   "    while (in >> word) { out.push_back(word); }", "    return out;", "}",
                   "static std::vector<std::string> splitText(const std::string& s, const std::string& sep) {",
                   "    std::vector<std::string> out;",
                   "    if (sep.empty()) { for (char c : s) { out.push_back(std::string(1, c)); } return out; }",
                   "    size_t from = 0, at;",
                   "    while ((at = s.find(sep, from)) != std::string::npos) { out.push_back(s.substr(from, at - from)); from = at + sep.size(); }",
                   "    out.push_back(s.substr(from));", "    return out;", "}"] },
      chars: { wants: ["vector"], lines: ["static std::vector<std::string> chars(const std::string& s) {",
               "    std::vector<std::string> out;", "    for (char c : s) { out.push_back(std::string(1, c)); }",
               "    return out;", "}"] },
      keysOf: { wants: ["vector", "map"], lines: ["template <typename K, typename V> static std::vector<K> keysOf(const std::map<K, V>& table) {",
                "    std::vector<K> out;", "    for (const auto& kv : table) { out.push_back(kv.first); }",
                "    return out;", "}"] },
      valuesOf: { wants: ["vector", "map"], lines: ["template <typename K, typename V> static std::vector<V> valuesOf(const std::map<K, V>& table) {",
                  "    std::vector<V> out;", "    for (const auto& kv : table) { out.push_back(kv.second); }",
                  "    return out;", "}"] },
      sortedList: { wants: ["vector", "algorithm"], lines: ["template <typename T> static std::vector<T> sortedList(std::vector<T> items) {",
                    "    std::sort(items.begin(), items.end());", "    return items;", "}",
                    "template <typename T, typename F> static std::vector<T> sortedList(std::vector<T> items, F order) {",
                    "    std::sort(items.begin(), items.end(), order);", "    return items;", "}"] },
      reversedCopy: { wants: ["algorithm"], lines: ["template <typename T> static T reversedCopy(T items) {",
                      "    std::reverse(items.begin(), items.end());", "    return items;", "}"] },
      shuffled: { wants: ["vector", "algorithm", "cstdlib"], lines: ["template <typename T> static void shuffleIn(std::vector<T>& items) {",
                  "    for (int i = (int)items.size() - 1; i > 0; i--) { std::swap(items[i], items[std::rand() % (i + 1)]); }", "}",
                  "template <typename T> static std::vector<T> shuffledCopy(std::vector<T> items) {",
                  "    shuffleIn(items);", "    return items;", "}"] },
      repeated: { wants: ["vector"], lines: ["static std::string repeated(const std::string& s, int n) {",
                  "    std::string out;", "    for (int i = 0; i < n; i++) { out += s; }", "    return out;", "}",
                  "template <typename T> static std::vector<T> repeated(const std::vector<T>& items, int n) {",
                  "    std::vector<T> out;", "    for (int i = 0; i < n; i++) { out.insert(out.end(), items.begin(), items.end()); }",
                  "    return out;", "}"] },
      rangeOf: { wants: ["vector"], lines: ["static std::vector<int> rangeOf(int a, int b = -2147483647, int by = 1) {",
                 "    if (b == -2147483647) { b = a; a = 0; }", "    std::vector<int> out;",
                 "    for (int i = a; by > 0 ? i < b : i > b; i += by) { out.push_back(i); }", "    return out;", "}"] },
      textOf: { wants: ["sstream"], lines: ["template <typename T> static std::string textOf(const T& v) {",
                "    std::ostringstream out;", "    out << v;", "    return out.str();", "}"] },
      replaced: { lines: ["static std::string replaced(std::string s, const std::string& a, const std::string& b) {",
                  "    size_t at = 0;", "    while (!a.empty() && (at = s.find(a, at)) != std::string::npos) { s.replace(at, a.size(), b); at += b.size(); }",
                  "    return s;", "}"] },
      trimmed: { lines: ["static std::string trimmed(const std::string& s) {",
                 "    size_t a = s.find_first_not_of(\" \\t\\n\\r\");", "    if (a == std::string::npos) { return \"\"; }",
                 "    size_t b = s.find_last_not_of(\" \\t\\n\\r\");", "    return s.substr(a, b - a + 1);", "}"] },
      allOf: { wants: ["cctype"], lines: ["static bool allOf(const std::string& s, int (*test)(int)) {",
               "    if (s.empty()) { return false; }", "    for (char c : s) { if (!test((unsigned char)c)) { return false; } }",
               "    return true;", "}"] },
      isNumber: { wants: ["cstdlib"], lines: ["static bool isNumber(const std::string& s) {",
                  "    char* end = nullptr;", "    std::strtod(s.c_str(), &end);",
                  "    return !s.empty() && end && *end == 0;", "}"] },
      uniqueOf: { wants: ["vector", "algorithm"], lines: ["template <typename T> static std::vector<T> uniqueOf(const std::vector<T>& items) {",
                  "    std::vector<T> out;", "    for (const auto& v : items) { if (std::find(out.begin(), out.end(), v) == out.end()) { out.push_back(v); } }",
                  "    return out;", "}"] },
      // what is in both (0), in the first only (1), or in either (2)
      setWork: { wants: ["vector", "algorithm"], lines: ["template <typename T> static std::vector<T> setWork(const std::vector<T>& a, const std::vector<T>& b, int how) {",
                 "    auto has = [](const std::vector<T>& xs, const T& x) { return std::find(xs.begin(), xs.end(), x) != xs.end(); };",
                 "    std::vector<T> out;",
                 "    for (const auto& v : a) {",
                 "        if (how == 1 ? !has(b, v) : (how == 2 || has(b, v)) && !has(out, v)) { out.push_back(v); }",
                 "    }",
                 "    if (how == 2) { for (const auto& v : b) { if (!has(out, v)) { out.push_back(v); } } }",
                 "    return out;", "}"] },
      padded: { wants: ["sstream"], lines: ["template <typename T> static std::string padded(const T& v, int n, const std::string& with, bool left) {",
                "    std::ostringstream o;", "    o << v;", "    std::string s = o.str();",
                "    while ((int)s.size() < n) { s = left ? with + s : s + with; }", "    return s;", "}"] },
      fixedText: { wants: ["sstream", "iomanip"], lines: ["static std::string fixedText(double v, int places) {",
                   "    std::ostringstream s;", "    s << std::fixed << std::setprecision(places) << v;", "    return s.str();", "}"] }
    }
  };
  function cppOrder(code, node, w, elem) {
    var one = orderedBy(node, w);
    if (one && one.params.length === 2) {
      var f = w.reachMod(one) + w.called(one);
      return one.gives === "bool" ? f : "[](auto a_, auto b_) { return " + f + "(a_, b_) < 0; }";
    }
    var key = w.keyFn(node, elem);
    if (key) { return "[](auto a_, auto b_) { return " + key("a_") + " < " + key("b_") + "; }"; }
    // an Fn: a comparison of two, or what to sort by
    if (code && node && (node.call === "bind" || w.kind(node) === "fn")) {
      var bound = node.call === "bind" ? boundArity(node, w) : null;
      if (bound && bound.left === 2) {
        return bound.one.gives === "bool" ? "[=](auto a_, auto b_) { return (bool)" + held(code) + "(std::vector<Value>{a_, b_}); }"
                                          : "[=](auto a_, auto b_) { return (double)" + held(code) + "(std::vector<Value>{a_, b_}) < 0; }";
      }
      return "[=](auto a_, auto b_) { return " + held(code) + "(std::vector<Value>{a_}) < " + held(code) + "(std::vector<Value>{b_}); }";
    }
    return "[](auto a_, auto b_) { return " + held(code) + "(a_) < " + held(code) + "(b_); }";
  }

  // round(x, 2), and roundEven(x) and roundEven(x, 2): a half to the even one
  (function () {
    function scaled(a) { return a[1] ? a[1] : null; }
    LIST_WORK.python.lists.roundeven = function (a) { return "round(" + a.join(", ") + ")"; };
    LIST_WORK.javascript.lists.roundeven = function (a, k, w) { w.need("roundEven"); return "roundEven(" + a.join(", ") + ")"; };
    LIST_WORK.javascript.helpers.roundEven = ["// Rounded, a half going to the even one: 2.5 is 2, 3.5 is 4.",
      "function roundEven(x, places = 0) {",
      "  const by = 10 ** places, n = x * by, near = Math.round(n);",
      "  return (Math.abs(n % 1) === 0.5 ? 2 * Math.round(n / 2) : near) / by;",
      "}"];
    LIST_WORK.java.lists.roundeven = function (a) {
      return scaled(a) ? "Math.rint(" + held(a[0]) + " * Math.pow(10, " + a[1] + ")) / Math.pow(10, " + a[1] + ")"
                       : "(int) Math.rint(" + a[0] + ")";
    };
    LIST_WORK.csharp.lists.roundeven = function (a) {
      if (!scaled(a)) { return "(int)Math.Round((double)" + held(a[0]) + ")"; }
      // Math.Round takes 0 to 15 places; to the hundreds, it is scaled by hand
      return /^\d+$/.test(a[1]) && Number(a[1]) <= 15 ? "Math.Round((double)" + held(a[0]) + ", " + a[1] + ")"
           : "(Math.Round((double)" + held(a[0]) + " * Math.Pow(10, " + a[1] + ")) / Math.Pow(10, " + a[1] + "))";
    };
    LIST_WORK.cpp.lists.roundeven = function (a, k, w) {
      w.need("cmath");
      return scaled(a) ? "std::nearbyint(" + held(a[0]) + " * std::pow(10, " + a[1] + ")) / std::pow(10, " + a[1] + ")"
                       : "(int)std::nearbyint(" + a[0] + ")";
    };
    // round(x, 2): half up, to two places
    LIST_WORK.python.lists.round = function (a, k, w) {
      w.need("math");
      return scaled(a) ? "math.floor(" + held(a[0]) + " * 10 ** " + held(a[1]) + " + 0.5) / 10 ** " + held(a[1]) : "math.floor(" + held(a[0]) + " + 0.5)";
    };
    LIST_WORK.javascript.lists.round = function (a) {
      return scaled(a) ? "Math.round(" + held(a[0]) + " * 10 ** " + held(a[1]) + ") / 10 ** " + held(a[1]) : "Math.round(" + a[0] + ")";
    };
    LIST_WORK.java.lists.round = function (a) {
      return scaled(a) ? "Math.round(" + held(a[0]) + " * Math.pow(10, " + a[1] + ")) / Math.pow(10, " + a[1] + ")"
                       : "(int) Math.round(" + a[0] + ")";
    };
    LIST_WORK.csharp.lists.round = function (a) {
      return scaled(a) ? "Math.Floor(" + held(a[0]) + " * Math.Pow(10, " + a[1] + ") + 0.5) / Math.Pow(10, " + a[1] + ")"
                       : "(int)Math.Floor(" + held(a[0]) + " + 0.5)";
    };
    LIST_WORK.cpp.lists.round = function (a, k, w) {
      w.need("cmath");
      return scaled(a) ? "std::floor(" + held(a[0]) + " * std::pow(10, " + a[1] + ") + 0.5) / std::pow(10, " + a[1] + ")"
                       : "(int)std::floor(" + held(a[0]) + " + 0.5)";
    };
  })();

  // lastIndexOf(v, x) and compare(a, b)
  LIST_WORK.python.lists.lastindexof = function (a, k) {
    if (k[0] === "text") { return held(a[0]) + ".rfind(" + a[1] + ")"; }
    return "(len(" + a[0] + ") - 1 - " + held(a[0]) + "[::-1].index(" + a[1] + ") if " + a[1] + " in " + held(a[0]) + " else -1)";
  };
  LIST_WORK.python.lists.compare = function (a) { return "((" + a[0] + " > " + a[1] + ") - (" + a[0] + " < " + a[1] + "))"; };
  LIST_WORK.javascript.lists.lastindexof = function (a) { return held(a[0]) + ".lastIndexOf(" + a[1] + ")"; };
  LIST_WORK.javascript.lists.compare = function (a) {
    return "(" + a[0] + " < " + a[1] + " ? -1 : " + a[0] + " > " + a[1] + " ? 1 : 0)";
  };
  LIST_WORK.java.lists.lastindexof = function (a) { return held(a[0]) + ".lastIndexOf(" + a[1] + ")"; };
  LIST_WORK.java.lists.compare = function (a, k, w) {
    if (k[0] === "text" && k[1] === "text") { return "Integer.signum(" + held(a[0]) + ".compareTo(" + a[1] + "))"; }
    if (/^(int|real)$/.test(k[0]) && /^(int|real)$/.test(k[1])) { return "Double.compare(" + a[0] + ", " + a[1] + ")"; }
    w.need("orderOf");
    return "Integer.signum(orderOf(" + a[0] + ", " + a[1] + "))";
  };
  LIST_WORK.csharp.lists.lastindexof = function (a) { return held(a[0]) + ".LastIndexOf(" + a[1] + ")"; };
  LIST_WORK.csharp.lists.compare = function (a, k, w) {
    if (k[0] === "text" && k[1] === "text") { return "Math.Sign(string.CompareOrdinal(" + a[0] + ", " + a[1] + "))"; }
    if (/^(int|real)$/.test(k[0]) && /^(int|real)$/.test(k[1])) { return "Math.Sign(" + held(a[0]) + " - " + held(a[1]) + ")"; }
    w.need("orderOf");
    return "Math.Sign(OrderOf(" + a[0] + ", " + a[1] + "))";
  };
  LIST_WORK.cpp.lists.lastindexof = function (a, k, w) {
    if (k[0] === "text") { return "(int)" + held(a[0]) + ".rfind(" + a[1] + ")"; }
    w.need("lastIndexOf");
    return "lastIndexOf(" + a[0] + ", " + a[1] + ")";
  };
  LIST_WORK.cpp.lists.compare = function (a) {
    return "(" + a[0] + " < " + a[1] + " ? -1 : " + a[0] + " > " + a[1] + " ? 1 : 0)";
  };
  // C++ keeps one kind of thing in each place.  Where the chart keeps more
  // than one -- (1, "one"), a table of words and numbers, a list of lists and
  // numbers -- the place holds a Value, which is any of them.
  LIST_WORK.cpp.anyType = "Value";
  LIST_WORK.cpp.anyNeeds = "value";
  LIST_WORK.cpp.anyZero = "Value()";
  LIST_WORK.cpp.helpers.value = { wants: ["memory", "vector", "map", "string", "sstream", "ostream", "cstdlib", "cmath", "type_traits", "utility", "initializer_list"], lines: [
    "// A value of no one kind -- a number, words, yes or no, a list or a table --",
    "// for the places this program keeps more than one kind of thing.",
    "struct Value {",
    "    enum Kind { NOTHING, WHOLE, REAL, WORDS, FLAG, LIST, TABLE };",
    "    Kind kind = NOTHING;",
    "    long long whole = 0;",
    "    double real = 0;",
    "    std::string words;",
    "    std::shared_ptr<std::vector<Value>> list;",
    "    std::shared_ptr<std::vector<std::pair<Value, Value>>> table;",
    "    Value() {}",
    "    template <typename T, typename std::enable_if<std::is_integral<T>::value && !std::is_same<T, bool>::value, int>::type = 0>",
    "    Value(T v) : kind(WHOLE), whole((long long)v) {}",
    "    template <typename T, typename std::enable_if<std::is_floating_point<T>::value, int>::type = 0>",
    "    Value(T v) : kind(REAL), real((double)v) {}",
    "    Value(bool v) : kind(FLAG), whole(v ? 1 : 0) {}",
    "    Value(const char* v) : kind(WORDS), words(v) {}",
    "    Value(const std::string& v) : kind(WORDS), words(v) {}",
    "    template <typename T> Value(T* v) = delete;",
    "    Value(std::initializer_list<Value> items) : kind(LIST), list(std::make_shared<std::vector<Value>>(items)) {}",
    "    template <typename T> Value(const std::vector<T>& items) : kind(LIST), list(std::make_shared<std::vector<Value>>()) {",
    "        for (const auto& x : items) { list->push_back(Value(x)); }",
    "    }",
    "    template <typename K, typename V> Value(const std::map<K, V>& t) : kind(TABLE), table(std::make_shared<std::vector<std::pair<Value, Value>>>()) {",
    "        for (const auto& kv : t) { table->push_back(std::make_pair(Value(kv.first), Value(kv.second))); }",
    "    }",
    "    bool isNumber() const { return kind == WHOLE || kind == REAL || kind == FLAG; }",
    "    double number() const {",
    "        if (kind == WHOLE || kind == FLAG) { return (double)whole; }",
    "        if (kind == REAL) { return real; }",
    "        if (kind == WORDS) { return std::strtod(words.c_str(), nullptr); }",
    "        return 0;",
    "    }",
    "    bool truth() const {",
    "        if (kind == WHOLE || kind == FLAG) { return whole != 0; }",
    "        if (kind == REAL) { return real != 0; }",
    "        if (kind == WORDS) { return !words.empty(); }",
    "        if (kind == LIST) { return !list->empty(); }",
    "        if (kind == TABLE) { return !table->empty(); }",
    "        return false;",
    "    }",
    "    std::string text() const;",
    "    operator double() const { return number(); }",
    "    operator std::string() const { return text(); }",
    "    operator std::vector<Value>() const { return kind == LIST ? *list : std::vector<Value>(); }",
    "    explicit operator bool() const { return truth(); }",
    "    int size() const {",
    "        if (kind == LIST) { return (int)list->size(); }",
    "        if (kind == TABLE) { return (int)table->size(); }",
    "        return (int)words.size();",
    "    }",
    "    bool empty() const { return size() == 0; }",
    "    void push_back(const Value& x) {",
    "        if (kind != LIST) { kind = LIST; list = std::make_shared<std::vector<Value>>(); }",
    "        list->push_back(x);",
    "    }",
    "    auto begin() {",
    "        if (kind != LIST) { kind = LIST; list = std::make_shared<std::vector<Value>>(); }",
    "        return list->begin();",
    "    }",
    "    auto end() {",
    "        if (kind != LIST) { kind = LIST; list = std::make_shared<std::vector<Value>>(); }",
    "        return list->end();",
    "    }",
    "    int count(const Value& key) const;",
    "    Value& at(const Value& key);",
    "    Value& operator[](const Value& key) { return at(key); }",
    "    Value& operator[](int key) { return at(Value(key)); }",
    "    Value& operator[](long long key) { return at(Value(key)); }",
    "    Value& operator[](const char* key) { return at(Value(key)); }",
    "    Value& operator[](const std::string& key) { return at(Value(key)); }",
    "    Value operator-() const { return kind == REAL ? Value(-real) : Value(-whole); }",
    "};",
    "",
    "// Which of two comes first: numbers by size, words by their letters, lists",
    "// item by item -- the way the chart puts them in order.",
    "inline int valueOrder(const Value& a, const Value& b) {",
    "    if (a.kind == Value::LIST && b.kind == Value::LIST) {",
    "        for (size_t i = 0; i < a.list->size() && i < b.list->size(); i++) {",
    "            int one = valueOrder((*a.list)[i], (*b.list)[i]);",
    "            if (one) { return one; }",
    "        }",
    "        return a.list->size() < b.list->size() ? -1 : a.list->size() > b.list->size() ? 1 : 0;",
    "    }",
    "    if (a.isNumber() && b.isNumber()) {",
    "        return a.number() < b.number() ? -1 : a.number() > b.number() ? 1 : 0;",
    "    }",
    "    if (a.isNumber() != b.isNumber()) { return a.isNumber() ? -1 : 1; }",
    "    std::string x = a.text(), y = b.text();",
    "    return x < y ? -1 : x > y ? 1 : 0;",
    "}",
    "inline bool valueSame(const Value& a, const Value& b) {",
    "    if (a.isNumber() && b.isNumber()) { return a.number() == b.number(); }",
    "    if (a.kind != b.kind) { return false; }",
    "    if (a.kind == Value::WORDS) { return a.words == b.words; }",
    "    if (a.kind == Value::LIST) {",
    "        if (a.list->size() != b.list->size()) { return false; }",
    "        for (size_t i = 0; i < a.list->size(); i++) { if (!valueSame((*a.list)[i], (*b.list)[i])) { return false; } }",
    "        return true;",
    "    }",
    "    if (a.kind == Value::TABLE) {",
    "        if (a.table->size() != b.table->size()) { return false; }",
    "        for (size_t i = 0; i < a.table->size(); i++) {",
    "            if (!valueSame((*a.table)[i].first, (*b.table)[i].first) || !valueSame((*a.table)[i].second, (*b.table)[i].second)) { return false; }",
    "        }",
    "        return true;",
    "    }",
    "    return a.kind == Value::NOTHING;",
    "}",
    "inline int Value::count(const Value& key) const {",
    "    if (kind == TABLE) { for (const auto& kv : *table) { if (valueSame(kv.first, key)) { return 1; } } return 0; }",
    "    if (kind == LIST) { int n = 0; for (const auto& x : *list) { if (valueSame(x, key)) { n++; } } return n; }",
    "    return 0;",
    "}",
    "inline Value& Value::at(const Value& key) {",
    "    if (kind == LIST) {",
    "        long long i = (long long)key.number();",
    "        if (i < 0) { i += (long long)list->size(); }",
    "        return (*list)[(size_t)i];",
    "    }",
    "    if (kind == WORDS) {",
    "        static Value letter;",
    "        long long i = (long long)key.number();",
    "        if (i < 0) { i += (long long)words.size(); }",
    "        letter = Value(std::string(1, words[(size_t)i]));",
    "        return letter;",
    "    }",
    "    if (kind != TABLE) { kind = TABLE; table = std::make_shared<std::vector<std::pair<Value, Value>>>(); }",
    "    for (auto& kv : *table) { if (valueSame(kv.first, key)) { return kv.second; } }",
    "    table->push_back(std::make_pair(key, Value()));",
    "    return table->back().second;",
    "}",
    "inline void shownIn(std::ostream& out, const Value& v);",
    "inline std::ostream& operator<<(std::ostream& out, const Value& v) {",
    "    switch (v.kind) {",
    "        case Value::NOTHING: return out;",
    "        case Value::WHOLE: return out << v.whole;",
    "        case Value::REAL: return out << v.real;",
    "        case Value::WORDS: return out << v.words;",
    "        case Value::FLAG: return out << (v.whole ? \"True\" : \"False\");",
    "        case Value::LIST:",
    "            out << \"[\";",
    "            for (size_t i = 0; i < v.list->size(); i++) { if (i) { out << \", \"; } shownIn(out, (*v.list)[i]); }",
    "            return out << \"]\";",
    "        case Value::TABLE:",
    "            out << \"{\";",
    "            for (size_t i = 0; i < v.table->size(); i++) {",
    "                if (i) { out << \", \"; }",
    "                shownIn(out, (*v.table)[i].first); out << \": \"; shownIn(out, (*v.table)[i].second);",
    "            }",
    "            return out << \"}\";",
    "    }",
    "    return out;",
    "}",
    "inline void shownIn(std::ostream& out, const Value& v) {",
    "    if (v.kind == Value::WORDS) { out << \"'\" << v.words << \"'\"; } else { out << v; }",
    "}",
    "inline std::string Value::text() const {",
    "    if (kind == WORDS) { return words; }",
    "    std::ostringstream out;",
    "    out << *this;",
    "    return out.str();",
    "}",
    "inline std::string classOf(const Value& v) {",
    "    switch (v.kind) {",
    "        case Value::WHOLE: return \"Integer\";",
    "        case Value::REAL: return v.real == std::floor(v.real) ? \"Integer\" : \"Real\";",
    "        case Value::WORDS: return \"String\";",
    "        case Value::FLAG: return \"Boolean\";",
    "        case Value::LIST: return \"List\";",
    "        case Value::TABLE: return \"Table\";",
    "        default: return \"Nothing\";",
    "    }",
    "}",
    "inline Value operator+(const Value& a, const Value& b) {",
    "    if (a.kind == Value::LIST && b.kind == Value::LIST) {",
    "        std::vector<Value> both(*a.list);",
    "        both.insert(both.end(), b.list->begin(), b.list->end());",
    "        return Value(both);",
    "    }",
    "    if (a.kind == Value::WORDS || b.kind == Value::WORDS) { return Value(a.text() + b.text()); }",
    "    if (a.kind == Value::REAL || b.kind == Value::REAL) { return Value(a.number() + b.number()); }",
    "    return Value(a.whole + b.whole);",
    "}",
    "inline Value operator-(const Value& a, const Value& b) {",
    "    if (a.kind == Value::REAL || b.kind == Value::REAL) { return Value(a.number() - b.number()); }",
    "    return Value(a.whole - b.whole);",
    "}",
    "inline Value operator*(const Value& a, const Value& b) {",
    "    if (a.kind == Value::LIST && b.isNumber()) {",
    "        std::vector<Value> made;",
    "        for (long long i = 0; i < (long long)b.number(); i++) { made.insert(made.end(), a.list->begin(), a.list->end()); }",
    "        return Value(made);",
    "    }",
    "    if (a.kind == Value::REAL || b.kind == Value::REAL) { return Value(a.number() * b.number()); }",
    "    return Value(a.whole * b.whole);",
    "}",
    "inline Value operator/(const Value& a, const Value& b) { return Value(a.number() / b.number()); }",
    "inline Value operator%(const Value& a, const Value& b) {",
    "    if (a.kind == Value::REAL || b.kind == Value::REAL) { return Value(std::fmod(a.number(), b.number())); }",
    "    return Value(a.whole % b.whole);",
    "}",
    "inline bool operator==(const Value& a, const Value& b) { return valueSame(a, b); }",
    "inline bool operator!=(const Value& a, const Value& b) { return !valueSame(a, b); }",
    "inline bool operator<(const Value& a, const Value& b) { return valueOrder(a, b) < 0; }",
    "inline bool operator>(const Value& a, const Value& b) { return valueOrder(a, b) > 0; }",
    "inline bool operator<=(const Value& a, const Value& b) { return valueOrder(a, b) <= 0; }",
    "inline bool operator>=(const Value& a, const Value& b) { return valueOrder(a, b) >= 0; }",
    "template <typename T> inline Value operator+(const Value& a, const T& b) { return a + Value(b); }",
    "template <typename T> inline Value operator+(const T& a, const Value& b) { return Value(a) + b; }",
    "template <typename T> inline Value operator-(const Value& a, const T& b) { return a - Value(b); }",
    "template <typename T> inline Value operator-(const T& a, const Value& b) { return Value(a) - b; }",
    "template <typename T> inline Value operator*(const Value& a, const T& b) { return a * Value(b); }",
    "template <typename T> inline Value operator*(const T& a, const Value& b) { return Value(a) * b; }",
    "template <typename T> inline Value operator/(const Value& a, const T& b) { return a / Value(b); }",
    "template <typename T> inline Value operator/(const T& a, const Value& b) { return Value(a) / b; }",
    "template <typename T> inline Value operator%(const Value& a, const T& b) { return a % Value(b); }",
    "template <typename T> inline Value operator%(const T& a, const Value& b) { return Value(a) % b; }",
    "template <typename T> inline bool operator==(const Value& a, const T& b) { return a == Value(b); }",
    "template <typename T> inline bool operator==(const T& a, const Value& b) { return Value(a) == b; }",
    "template <typename T> inline bool operator!=(const Value& a, const T& b) { return a != Value(b); }",
    "template <typename T> inline bool operator!=(const T& a, const Value& b) { return Value(a) != b; }",
    "template <typename T> inline bool operator<(const Value& a, const T& b) { return a < Value(b); }",
    "template <typename T> inline bool operator<(const T& a, const Value& b) { return Value(a) < b; }",
    "template <typename T> inline bool operator>(const Value& a, const T& b) { return a > Value(b); }",
    "template <typename T> inline bool operator>(const T& a, const Value& b) { return Value(a) > b; }",
    "template <typename T> inline bool operator<=(const Value& a, const T& b) { return a <= Value(b); }",
    "template <typename T> inline bool operator<=(const T& a, const Value& b) { return Value(a) <= b; }",
    "template <typename T> inline bool operator>=(const Value& a, const T& b) { return a >= Value(b); }",
    "template <typename T> inline bool operator>=(const T& a, const Value& b) { return Value(a) >= b; }"] };
  // A function handed about as a value: an Fn, handed a list of Values and
  // handing one back -- the one shape every function can be made to take.
  // bind(f, cell) keeps what it was handed as it is, inside the Fn.
  function cppFromValue(code, kind) {
    if (kind === "int") { return "(int)" + code; }
    if (kind === "real") { return "(double)" + code; }
    if (kind === "text") { return "(std::string)" + code; }
    if (kind === "bool") { return "(bool)" + code; }
    if (kind === "list:any") { return "(std::vector<Value>)" + code; }
    return code;
  }
  function cppFnBody(one, call) {
    return one.gives ? "return " + call + ";" : call + "; return Value();";
  }
  LIST_WORK.cpp.fnType = "Fn";
  LIST_WORK.cpp.fnRef = function (name, one, w) {
    w.need("value"); w.need("fn");
    var args = one.params.map(function (p, i) {
      var got = cppFromValue("a_[" + i + "]", p.entry.kind);
      return p.dflt ? "(a_.size() > " + i + " ? " + got + " : " + w.code(p.dflt) + ")" : got;
    });
    return "Fn([](std::vector<Value> a_) -> Value { " + cppFnBody(one, w.reachMod(one) + name + "(" + args.join(", ") + ")") + " })";
  };
  LIST_WORK.cpp.lists.bind = function (a, k, w, nodes) {
    w.need("value"); w.need("fn");
    var got = boundArity(nodes && nodes[0] ? { args: nodes } : null, w);
    if (!got) { return "Fn()"; }
    var bound = a.slice(1);
    var rest = got.one.params.slice(bound.length).map(function (p, i) {
      var fromA = cppFromValue("a_[" + i + "]", p.entry.kind);
      return p.dflt ? "(a_.size() > " + i + " ? " + fromA + " : " + w.code(p.dflt) + ")" : fromA;
    });
    var call = w.reachMod(got.one) + w.called(got.one) + "(" + bound.concat(rest).join(", ") + ")";
    return "Fn([=](std::vector<Value> a_) -> Value { " + cppFnBody(got.one, call) + " })";
  };
  LIST_WORK.cpp.callFn = function (name, codes) { return name + "(std::vector<Value>{" + codes.join(", ") + "})"; };
  LIST_WORK.cpp.helpers.fn = { wants: ["functional", "vector"], lines: [
    "// A function handed about as a value: handed a list of Values, handing one back.",
    "using Fn = std::function<Value(std::vector<Value>)>;"] };
  // items(t), zip(a, b), enumerate(xs): lists of pairs, each pair a list
  // of what the chart says it holds -- Values, where the two differ
  LIST_WORK.cpp.lists.items = function (a, k, w) {
    w.need("itemsOf");
    return "itemsOf<" + w.typeOf(elemOf(elemOf(builtKind("items", k)) || "any") || "any") + ">(" + a[0] + ")";
  };
  LIST_WORK.cpp.lists.zip = function (a, k, w) {
    w.need("zipped");
    return "zipped<" + w.typeOf(elemOf(elemOf(builtKind("zip", k)) || "any") || "any") + ">(" + a.join(", ") + ")";
  };
  LIST_WORK.cpp.lists.enumerate = function (a, k, w) {
    w.need("enumerated");
    return "enumerated<" + w.typeOf(elemOf(elemOf(builtKind("enumerate", k)) || "any") || "any") + ">(" + a.join(", ") + ")";
  };
  LIST_WORK.cpp.helpers.itemsOf = { wants: ["vector", "map"], lines: [
    "template <typename E, typename K, typename V> static std::vector<std::vector<E>> itemsOf(const std::map<K, V>& table) {",
    "    std::vector<std::vector<E>> out;",
    "    for (const auto& kv : table) { out.push_back(std::vector<E>{E(kv.first), E(kv.second)}); }",
    "    return out;",
    "}",
    "template <typename E, typename T> static std::vector<std::vector<E>> itemsOf(const std::vector<T>& items) {",
    "    std::vector<std::vector<E>> out;",
    "    for (size_t i = 0; i < items.size(); i++) { out.push_back(std::vector<E>{E((int)i), E(items[i])}); }",
    "    return out;",
    "}"] };
  LIST_WORK.cpp.helpers.zipped = { wants: ["vector"], lines: [
    "template <typename E, typename A, typename B> static std::vector<std::vector<E>> zipped(const std::vector<A>& a, const std::vector<B>& b) {",
    "    std::vector<std::vector<E>> out;",
    "    for (size_t i = 0; i < a.size() && i < b.size(); i++) { out.push_back(std::vector<E>{E(a[i]), E(b[i])}); }",
    "    return out;",
    "}"] };
  LIST_WORK.cpp.helpers.enumerated = { wants: ["vector"], lines: [
    "template <typename E, typename T> static std::vector<std::vector<E>> enumerated(const std::vector<T>& items, int from = 0) {",
    "    std::vector<std::vector<E>> out;",
    "    for (size_t i = 0; i < items.size(); i++) { out.push_back(std::vector<E>{E(from + (int)i), E(items[i])}); }",
    "    return out;",
    "}"] };
  // slice(xs, from, to, by): every by-th, the way Python's xs[from:to:by]
  // means it; and toBase(n, 16), fromBase("ff", 16): whole numbers written
  // in another base
  (function () {
    function stepped(lang, make) {
      var plain = LIST_WORK[lang].lists.slice;
      LIST_WORK[lang].lists.slice = function (a, k, w) {
        return a.length > 3 ? make(a, k, w) : plain.apply(this, arguments);
      };
    }
    stepped("python", function (a) { return held(a[0]) + "[" + a[1] + ":" + a[2] + ":" + a[3] + "]"; });
    stepped("javascript", function (a, k, w) { w.need("sliceStep"); return "sliceStep(" + a.join(", ") + ")"; });
    stepped("java", function (a, k, w) { w.need("sliceStep"); return "sliceStep(" + a.join(", ") + ")"; });
    stepped("csharp", function (a, k, w) { w.need("sliceStep"); return "SliceStep(" + a.join(", ") + ")"; });
    stepped("cpp", function (a, k, w) { w.need("sliceStep"); return "sliceStep(" + a.join(", ") + ")"; });
    LIST_WORK.javascript.helpers.sliceStep = [
      "// Every by-th of a list or of some words, from `from` towards `to`.",
      "function sliceStep(v, from, to, by) {",
      "  const items = typeof v === \"string\" ? [...v] : v, n = items.length, out = [];",
      "  const at = (x, low, high) => Math.max(low, Math.min(high, x < 0 ? x + n : x));",
      "  if (by > 0) { for (let i = at(from, 0, n); i < at(to, 0, n); i += by) { out.push(items[i]); } }",
      "  else { for (let i = at(from, -1, n - 1); i > at(to, -1, n - 1); i += by) { out.push(items[i]); } }",
      "  return typeof v === \"string\" ? out.join(\"\") : out;",
      "}"];
    LIST_WORK.java.helpers.sliceStep = [
      "    // Every by-th of a list or of some words, from `from` towards `to`.",
      "    static int stepAt(int x, int low, int high, int n) { return Math.max(low, Math.min(high, x < 0 ? x + n : x)); }",
      "    static <T> ArrayList<T> sliceStep(List<T> items, int from, int to, int by) {",
      "        ArrayList<T> out = new ArrayList<>();",
      "        int n = items.size();",
      "        if (by > 0) { for (int i = stepAt(from, 0, n, n); i < stepAt(to, 0, n, n); i += by) { out.add(items.get(i)); } }",
      "        else { for (int i = stepAt(from, -1, n - 1, n); i > stepAt(to, -1, n - 1, n); i += by) { out.add(items.get(i)); } }",
      "        return out;",
      "    }",
      "    static String sliceStep(String s, int from, int to, int by) {",
      "        StringBuilder out = new StringBuilder();",
      "        int n = s.length();",
      "        if (by > 0) { for (int i = stepAt(from, 0, n, n); i < stepAt(to, 0, n, n); i += by) { out.append(s.charAt(i)); } }",
      "        else { for (int i = stepAt(from, -1, n - 1, n); i > stepAt(to, -1, n - 1, n); i += by) { out.append(s.charAt(i)); } }",
      "        return out.toString();",
      "    }"];
    LIST_WORK.csharp.helpers.sliceStep = [
      "    // Every by-th of a list or of some words, from `from` towards `to`.",
      "    static int StepAt(int x, int low, int high, int n) { return Math.Max(low, Math.Min(high, x < 0 ? x + n : x)); }",
      "    static List<T> SliceStep<T>(List<T> items, int from, int to, int by) {",
      "        var made = new List<T>();",
      "        int n = items.Count;",
      "        if (by > 0) { for (int i = StepAt(from, 0, n, n); i < StepAt(to, 0, n, n); i += by) { made.Add(items[i]); } }",
      "        else { for (int i = StepAt(from, -1, n - 1, n); i > StepAt(to, -1, n - 1, n); i += by) { made.Add(items[i]); } }",
      "        return made;",
      "    }",
      "    static string SliceStep(string s, int from, int to, int by) {",
      "        var made = new System.Text.StringBuilder();",
      "        int n = s.Length;",
      "        if (by > 0) { for (int i = StepAt(from, 0, n, n); i < StepAt(to, 0, n, n); i += by) { made.Append(s[i]); } }",
      "        else { for (int i = StepAt(from, -1, n - 1, n); i > StepAt(to, -1, n - 1, n); i += by) { made.Append(s[i]); } }",
      "        return made.ToString();",
      "    }"];
    LIST_WORK.cpp.helpers.sliceStep = { wants: ["vector", "string", "algorithm"], lines: [
      "// Every by-th of a list or of some words, from `from` towards `to`.",
      "static int stepAt(int x, int low, int high, int n) { return std::max(low, std::min(high, x < 0 ? x + n : x)); }",
      "template <typename T> static T sliceStep(const T& items, int from, int to, int by) {",
      "    T out{};",
      "    int n = (int)items.size();",
      "    if (by > 0) { for (int i = stepAt(from, 0, n, n); i < stepAt(to, 0, n, n); i += by) { out.push_back(items[i]); } }",
      "    else { for (int i = stepAt(from, -1, n - 1, n); i > stepAt(to, -1, n - 1, n); i += by) { out.push_back(items[i]); } }",
      "    return out;",
      "}"] };

    LIST_WORK.python.lists.tobase = function (a, k, w) {
      var fmt = { "2": "b", "8": "o", "16": "x" }[String(a[1]).trim()];
      if (fmt) { return "format(" + a[0] + ", \"" + fmt + "\")"; }
      w.need("toBase");
      return "to_base(" + a.join(", ") + ")";
    };
    LIST_WORK.python.lists.frombase = function (a) { return "int(" + a[0] + ", " + a[1] + ")"; };
    LIST_WORK.python.helpers.toBase = [
      "def to_base(n, base):",
      "    digits = \"0123456789abcdefghijklmnopqrstuvwxyz\"",
      "    sign, n, out = \"-\" if n < 0 else \"\", abs(int(n)), \"\"",
      "    while True:",
      "        out = digits[n % base] + out",
      "        n //= base",
      "        if n == 0:",
      "            return sign + out"];
    LIST_WORK.javascript.lists.tobase = function (a) { return "Math.trunc(" + a[0] + ").toString(" + a[1] + ")"; };
    LIST_WORK.javascript.lists.frombase = function (a) { return "parseInt(" + a[0] + ", " + a[1] + ")"; };
    LIST_WORK.java.lists.tobase = function (a) { return "Integer.toString(" + a[0] + ", " + a[1] + ")"; };
    LIST_WORK.java.lists.frombase = function (a) { return "Integer.parseInt(" + held(a[0]) + ".trim(), " + a[1] + ")"; };
    LIST_WORK.csharp.lists.tobase = function (a, k, w) { w.need("toBase"); return "ToBase(" + a.join(", ") + ")"; };
    LIST_WORK.csharp.lists.frombase = function (a) { return "Convert.ToInt32(" + held(a[0]) + ".Trim(), " + a[1] + ")"; };
    LIST_WORK.csharp.helpers.toBase = [
      "    // A whole number written in another base: ToBase(255, 16) is \"ff\".",
      "    static string ToBase(long n, int b) {",
      "        const string digits = \"0123456789abcdefghijklmnopqrstuvwxyz\";",
      "        string sign = n < 0 ? \"-\" : \"\", made = \"\";",
      "        n = Math.Abs(n);",
      "        do { made = digits[(int)(n % b)] + made; n /= b; } while (n > 0);",
      "        return sign + made;",
      "    }"];
    LIST_WORK.cpp.lists.tobase = function (a, k, w) { w.need("toBase"); return "toBase(" + a.join(", ") + ")"; };
    LIST_WORK.cpp.lists.frombase = function (a) { return "(int)std::stoll(" + a[0] + ", nullptr, " + a[1] + ")"; };
    LIST_WORK.cpp.helpers.toBase = { wants: ["string"], lines: [
      "// A whole number written in another base: toBase(255, 16) is \"ff\".",
      "static std::string toBase(long long n, int b) {",
      "    const std::string digits = \"0123456789abcdefghijklmnopqrstuvwxyz\";",
      "    std::string sign = n < 0 ? \"-\" : \"\", out;",
      "    if (n < 0) { n = -n; }",
      "    do { out = digits[n % b] + out; n /= b; } while (n > 0);",
      "    return sign + out;",
      "}"] };
  })();

  // indexOf(xs, x, from): looking from `from` on
  (function () {
    function from(lang, make) {
      var plain = LIST_WORK[lang].lists.indexof;
      LIST_WORK[lang].lists.indexof = function (a, k, w) {
        return a.length > 2 ? make(a, k, w) : plain.apply(this, arguments);
      };
    }
    from("python", function (a, k) {
      if (k[0] === "text") { return held(a[0]) + ".find(" + a[1] + ", " + a[2] + ")"; }
      return "(" + held(a[0]) + ".index(" + a[1] + ", " + a[2] + ") if " + a[1] + " in " + held(a[0]) + "[" + a[2] + ":] else -1)";
    });
    from("javascript", function (a) { return held(a[0]) + ".indexOf(" + a[1] + ", " + a[2] + ")"; });
    from("java", function (a, k, w) {
      if (k[0] === "text") { return held(a[0]) + ".indexOf(" + a[1] + ", " + a[2] + ")"; }
      w.need("indexFrom");
      return "indexFrom(" + a.join(", ") + ")";
    });
    from("csharp", function (a) { return held(a[0]) + ".IndexOf(" + a[1] + ", " + a[2] + ")"; });
    from("cpp", function (a, k, w) {
      if (k[0] === "text") { return "(int)" + held(a[0]) + ".find(" + a[1] + ", " + a[2] + ")"; }
      w.need("indexOf");
      return "indexOf(" + a.join(", ") + ")";
    });
    LIST_WORK.java.helpers.indexFrom = [
      "    // Where x first is in a list, looking from `from` on; -1 where it is not.",
      "    static int indexFrom(List<?> items, Object x, int from) {",
      "        for (int i = Math.max(0, from); i < items.size(); i++) { if (Objects.equals(items.get(i), x)) { return i; } }",
      "        return -1;",
      "    }"];
  })();

  // grouped(x, 2): thousands kept apart by commas -- "1,234,567.89"
  // (the places written into the format where they are a number written out)
  function placesSaid(code) { return /^\d+$/.test(String(code || "").trim()) ? String(code).trim() : null; }
  LIST_WORK.python.lists.grouped = function (a) {
    if (a[1] && placesSaid(a[1])) { return "format(" + a[0] + ", \",." + placesSaid(a[1]) + "f\")"; }
    return a[1] ? "format(" + a[0] + ", \",.\" + str(" + a[1] + ") + \"f\")" : "format(" + a[0] + ", \",\")";
  };
  LIST_WORK.javascript.lists.grouped = function (a) {
    return a[1] ? "Number(" + a[0] + ").toLocaleString(\"en-US\", { minimumFractionDigits: " + a[1] + ", maximumFractionDigits: " + a[1] + " })"
                : "Number(" + a[0] + ").toLocaleString(\"en-US\")";
  };
  LIST_WORK.java.lists.grouped = function (a, k) {
    if (a[1] && placesSaid(a[1])) { return "String.format(\"%,." + placesSaid(a[1]) + "f\", (double) " + held(a[0]) + ")"; }
    if (a[1]) { return "String.format(\"%,.\" + " + a[1] + " + \"f\", (double) " + held(a[0]) + ")"; }
    return k[0] === "int" ? "String.format(\"%,d\", (long) " + held(a[0]) + ")" : "String.format(\"%,.2f\", (double) " + held(a[0]) + ")";
  };
  LIST_WORK.csharp.lists.grouped = function (a, k) {
    if (a[1] && placesSaid(a[1])) { return "((double)" + held(a[0]) + ").ToString(\"N" + placesSaid(a[1]) + "\")"; }
    if (a[1]) { return "((double)" + held(a[0]) + ").ToString(\"N\" + " + a[1] + ")"; }
    return k[0] === "int" ? held(a[0]) + ".ToString(\"N0\")" : "((double)" + held(a[0]) + ").ToString(\"N2\")";
  };
  LIST_WORK.cpp.lists.grouped = function (a, k, w) {
    w.need("grouped");
    return "grouped(" + a[0] + ", " + (a[1] || (k[0] === "int" ? "0" : "2")) + ")";
  };
  LIST_WORK.cpp.helpers.grouped = { wants: ["string", "sstream", "iomanip"], lines: [
    "// Thousands kept apart by commas, to so many places: grouped(1234567.891, 2) is \"1,234,567.89\".",
    "static std::string grouped(double x, int places) {",
    "    std::ostringstream o;",
    "    o << std::fixed << std::setprecision(places) << (x < 0 ? -x : x);",
    "    std::string s = o.str(), whole = s.substr(0, s.find('.')), rest = s.find('.') == std::string::npos ? \"\" : s.substr(s.find('.'));",
    "    for (int i = (int)whole.size() - 3; i > 0; i -= 3) { whole.insert(i, \",\"); }",
    "    return (x < 0 ? \"-\" : \"\") + whole + rest;",
    "}"] };

  // toJson(x): x written the way JSON writes it -- {"a":1,"b":[2,3]}
  LIST_WORK.python.lists.tojson = function (a, k, w) { w.need("json"); return "json.dumps(" + a[0] + ", separators=(\",\", \":\"))"; };
  LIST_WORK.javascript.lists.tojson = function (a, k, w) { w.need("toJson"); return "toJson(" + a[0] + ")"; };
  LIST_WORK.javascript.helpers.toJson = [
    "// Something written the way JSON writes it; a Map as the object it stands for.",
    "function toJson(v) {",
    "  return JSON.stringify(v, (k, x) => (x instanceof Map ? Object.fromEntries(x) : x instanceof Set ? [...x] : x));",
    "}"];
  LIST_WORK.java.lists.tojson = function (a, k, w) { w.need("toJson"); return "toJson(" + a[0] + ")"; };
  LIST_WORK.java.helpers.toJson = [
    "    // Something written the way JSON writes it: {\"a\":1,\"b\":[2,3]}.",
    "    static String toJson(Object v) {",
    "        if (v == null) { return \"null\"; }",
    "        if (v instanceof String) {",
    "            StringBuilder out = new StringBuilder(\"\\\"\");",
    "            for (char c : ((String) v).toCharArray()) {",
    "                if (c == '\"' || c == '\\\\') { out.append('\\\\').append(c); }",
    "                else if (c == '\\n') { out.append(\"\\\\n\"); }",
    "                else { out.append(c); }",
    "            }",
    "            return out.append('\"').toString();",
    "        }",
    "        if (v instanceof Map) {",
    "            StringBuilder out = new StringBuilder(\"{\");",
    "            for (Map.Entry<?, ?> e : ((Map<?, ?>) v).entrySet()) {",
    "                if (out.length() > 1) { out.append(','); }",
    "                out.append(toJson(String.valueOf(e.getKey()))).append(':').append(toJson(e.getValue()));",
    "            }",
    "            return out.append('}').toString();",
    "        }",
    "        if (v instanceof List) {",
    "            StringBuilder out = new StringBuilder(\"[\");",
    "            for (Object x : (List<?>) v) { if (out.length() > 1) { out.append(','); } out.append(toJson(x)); }",
    "            return out.append(']').toString();",
    "        }",
    "        if (v instanceof Double && (Double) v == Math.rint((Double) v) && !((Double) v).isInfinite()) {",
    "            return String.valueOf(((Double) v).longValue());",
    "        }",
    "        return String.valueOf(v);",
    "    }"];
  LIST_WORK.csharp.lists.tojson = function (a, k, w) { w.need("toJson"); return "ToJson(" + a[0] + ")"; };
  LIST_WORK.csharp.helpers.toJson = [
    "    // Something written the way JSON writes it: {\"a\":1,\"b\":[2,3]}.",
    "    static string ToJson(object v) {",
    "        if (v == null) { return \"null\"; }",
    "        if (v is string) { return \"\\\"\" + ((string)v).Replace(\"\\\\\", \"\\\\\\\\\").Replace(\"\\\"\", \"\\\\\\\"\").Replace(\"\\n\", \"\\\\n\") + \"\\\"\"; }",
    "        if (v is bool) { return (bool)v ? \"true\" : \"false\"; }",
    "        if (v is System.Collections.IDictionary) {",
    "            var parts = new List<string>();",
    "            foreach (System.Collections.DictionaryEntry e in (System.Collections.IDictionary)v) {",
    "                parts.Add(ToJson(Convert.ToString(e.Key)) + \":\" + ToJson(e.Value));",
    "            }",
    "            return \"{\" + string.Join(\",\", parts) + \"}\";",
    "        }",
    "        if (v is System.Collections.IEnumerable) {",
    "            var parts = new List<string>();",
    "            foreach (object x in (System.Collections.IEnumerable)v) { parts.Add(ToJson(x)); }",
    "            return \"[\" + string.Join(\",\", parts) + \"]\";",
    "        }",
    "        return Convert.ToString(v, System.Globalization.CultureInfo.InvariantCulture);",
    "    }"];
  LIST_WORK.cpp.lists.tojson = function (a, k, w) { w.need("toJson"); return "toJson(" + a[0] + ")"; };
  LIST_WORK.cpp.helpers.toJson = { wants: ["string", "vector", "map", "sstream"], lines: [
    "// Something written the way JSON writes it: {\"a\":1,\"b\":[2,3]}.",
    "template <typename T> static std::string toJson(const std::vector<T>& items);",
    "template <typename K, typename V> static std::string toJson(const std::map<K, V>& table);",
    "static std::string toJson(const std::string& s) {",
    "    std::string out = \"\\\"\";",
    "    for (char c : s) { if (c == '\"' || c == '\\\\') { out += '\\\\'; } out += c; }",
    "    return out + \"\\\"\";",
    "}",
    "static std::string toJson(const char* s) { return toJson(std::string(s)); }",
    "static std::string toJson(bool b) { return b ? \"true\" : \"false\"; }",
    "template <typename T> static std::string toJson(const T& v) { std::ostringstream o; o << v; return o.str(); }",
    "template <typename T> static std::string toJson(const std::vector<T>& items) {",
    "    std::string out = \"[\";",
    "    for (size_t i = 0; i < items.size(); i++) { if (i) { out += \",\"; } out += toJson(items[i]); }",
    "    return out + \"]\";",
    "}",
    "template <typename K, typename V> static std::string toJson(const std::map<K, V>& table) {",
    "    std::string out = \"{\";",
    "    bool first = true;",
    "    for (const auto& kv : table) {",
    "        if (!first) { out += \",\"; }",
    "        first = false;",
    "        std::ostringstream key;",
    "        key << kv.first;",
    "        out += toJson(key.str()) + \":\" + toJson(kv.second);",
    "    }",
    "    return out + \"}\";",
    "}"] };

  LIST_WORK.cpp.helpers.lastIndexOf = { wants: ["vector"], lines: [
    "template <typename T, typename U> static int lastIndexOf(const std::vector<T>& items, const U& x) {",
    "    for (int i = (int)items.size() - 1; i >= 0; i--) { if (items[i] == x) { return i; } }",
    "    return -1;", "}"] };

  // copy(p) of a record: a record of its own with the same things in it
  (function () {
    function recCopy(lang, make) {
      var plain = LIST_WORK[lang].lists.copy;
      LIST_WORK[lang].lists.copy = function (a, k, w) {
        return isRecKind(k[0]) ? make(a, k[0].slice(4), w) : plain.apply(this, arguments);
      };
    }
    recCopy("python", function (a, name, w) { w.need("copied"); return "copied(" + a[0] + ")"; });
    LIST_WORK.python.helpers.copied = [
      "def copied(record):",
      "    made = type(record)()",
      "    vars(made).update(vars(record))",
      "    return made"];
    recCopy("javascript", function (a) {
      return "Object.assign(Object.create(Object.getPrototypeOf(" + a[0] + ")), " + a[0] + ")";
    });
    recCopy("java", function (a, name, w) {
      w.need("recordCopy");
      return (name ? "(" + w.recName(name) + ") " : "") + held(a[0]) + ".copied()";
    });
    recCopy("csharp", function (a, name, w) {
      w.need("recordCopy");
      return (name ? "(" + w.recName(name) + ") " : "") + held(a[0]) + ".Copied()";
    });
    recCopy("cpp", function (a, name, w) { return "new " + (name ? w.recName(name) : "Record") + "(*" + held(a[0]) + ")"; });
  })();

  // deepCopy(x): a copy all the way down -- the lists, tables and records
  // inside it copied as well.  Where the program has records the helper
  // hands those to the record's own deepCopied().
  (function () {
    function hasRecords(w) { return Object.keys(recordsIn(w.prog)).length > 0; }
    LIST_WORK.python.lists.deepcopy = function (a, k, w) { w.need("copy"); return "copy.deepcopy(" + a[0] + ")"; };
    LIST_WORK.javascript.lists.deepcopy = function (a, k, w) { w.need("deepCopy"); return "deepCopy(" + a[0] + ")"; };
    LIST_WORK.javascript.helpers.deepCopy = [
      "// A copy all the way down: the lists, tables and records inside it copied too.",
      "function deepCopy(v) {",
      "  if (Array.isArray(v)) { return v.map(deepCopy); }",
      "  if (v instanceof Map) { return new Map([...v].map(([k, x]) => [k, deepCopy(x)])); }",
      "  if (v instanceof Set) { return new Set(v); }",
      "  if (v && typeof v === \"object\") {",
      "    const made = Object.create(Object.getPrototypeOf(v));",
      "    for (const k of Object.keys(v)) { made[k] = deepCopy(v[k]); }",
      "    return made;",
      "  }",
      "  return v;",
      "}"];
    LIST_WORK.java.lists.deepcopy = function (a, k, w) {
      w.need(hasRecords(w) ? "deepCopyRec" : "deepCopy");
      return "deepCopy(" + a[0] + ")";
    };
    var javaDeep = [
      "    // A copy all the way down: the lists, tables and records inside it copied too.",
      "    @SuppressWarnings(\"unchecked\")",
      "    static <T> T deepCopy(T v) {",
      "        if (v instanceof List) {",
      "            List<Object> out = new ArrayList<>();",
      "            for (Object x : (List<?>) v) { out.add(deepCopy(x)); }",
      "            return (T) out;",
      "        }",
      "        if (v instanceof Map) {",
      "            Map<Object, Object> out = new LinkedHashMap<>();",
      "            for (Map.Entry<?, ?> e : ((Map<?, ?>) v).entrySet()) { out.put(e.getKey(), deepCopy(e.getValue())); }",
      "            return (T) out;",
      "        }",
      "        if (v instanceof Set) { return (T) new LinkedHashSet<Object>((Set<?>) v); }",
      "        return v;",
      "    }"];
    LIST_WORK.java.helpers.deepCopy = javaDeep;
    LIST_WORK.java.helpers.deepCopyRec = javaDeep.slice(0, -2).concat([
      "        if (v instanceof Record) { return (T) ((Record) v).deepCopied(); }",
      "        return v;",
      "    }"]);
    LIST_WORK.csharp.lists.deepcopy = function (a, k, w) {
      w.need(hasRecords(w) ? "deepCopyRec" : "deepCopy");
      return "DeepCopy(" + a[0] + ")";
    };
    var csDeep = [
      "    // A copy all the way down: the lists, tables and records inside it copied too.",
      "    static T DeepCopy<T>(T v) {",
      "        object o = v;",
      "        if (o is System.Collections.IDictionary) {",
      "            var made = (System.Collections.IDictionary)Activator.CreateInstance(o.GetType());",
      "            foreach (System.Collections.DictionaryEntry e in (System.Collections.IDictionary)o) { made[e.Key] = DeepCopy(e.Value); }",
      "            return (T)(object)made;",
      "        }",
      "        if (o is System.Collections.IList && o.GetType().IsGenericType) {",
      "            var made = (System.Collections.IList)Activator.CreateInstance(o.GetType());",
      "            foreach (object x in (System.Collections.IList)o) { made.Add(DeepCopy(x)); }",
      "            return (T)(object)made;",
      "        }",
      "        if (o is System.Collections.IEnumerable && !(o is string) && o.GetType().IsGenericType) {",
      "            return (T)Activator.CreateInstance(o.GetType(), o);",
      "        }",
      "        return v;",
      "    }"];
    LIST_WORK.csharp.helpers.deepCopy = csDeep;
    LIST_WORK.csharp.helpers.deepCopyRec = csDeep.slice(0, -2).concat([
      "        if (o is Record) { return (T)(object)((Record)o).DeepCopied(); }",
      "        return v;",
      "    }"]);
    // C++'s vectors and maps are copied whole already; its records are
    // pointers, each one made again
    LIST_WORK.cpp.lists.deepcopy = function (a, k, w) { w.need("deepCopy"); return "deepCopy(" + a[0] + ")"; };
    LIST_WORK.cpp.helpers.deepCopy = { wants: ["vector", "map"], lines: [
      "// A copy all the way down: the lists, tables and records inside it copied too.",
      "template <typename T> static T deepCopy(const T& v) { return v; }",
      "template <typename T> static T* deepCopy(T* const& v) { return v ? new T(*v) : v; }",
      "template <typename T> static std::vector<T> deepCopy(const std::vector<T>& items);",
      "template <typename K, typename V> static std::map<K, V> deepCopy(const std::map<K, V>& table);",
      "template <typename T> static std::vector<T> deepCopy(const std::vector<T>& items) {",
      "    std::vector<T> out;",
      "    for (const auto& x : items) { out.push_back(deepCopy(x)); }",
      "    return out;",
      "}",
      "template <typename K, typename V> static std::map<K, V> deepCopy(const std::map<K, V>& table) {",
      "    std::map<K, V> out;",
      "    for (const auto& kv : table) { out[kv.first] = deepCopy(kv.second); }",
      "    return out;",
      "}"] };
  })();

  // a number with a point the way the chart shows it: to six places at most,
  // no noughts left on the end -- 20.333333, 2.5, 3
  LIST_WORK.cpp.helpers.realText = { wants: ["string", "sstream", "iomanip"], lines: [
    "// A number with a point, the way the chart shows it: to six places, no noughts on the end.",
    "static std::string realText(double x) {",
    "    std::ostringstream o;",
    "    o << std::fixed << std::setprecision(6) << x;",
    "    std::string s = o.str();",
    "    if (s.find('.') != std::string::npos) {",
    "        s.erase(s.find_last_not_of('0') + 1);",
    "        if (s[s.size() - 1] == '.') { s.erase(s.size() - 1); }",
    "    }",
    "    return s == \"-0\" ? \"0\" : s;",
    "}"] };

  LIST_WORK.javascript.helpers.popKey = [
    "// What a table holds under key, taken out of it.",
    "function popKey(table, key) {",
    "  const v = table.get(key);",
    "  table.delete(key);",
    "  return v;",
    "}"];

  // significant(x, 6): x to so many figures, as C++ shows one -- 81.6667
  LIST_WORK.python.lists.significant = function (a) {
    var n = a[1] || "6";
    return /^\d+$/.test(n) ? "format(" + a[0] + ", \"." + n + "g\")"
                           : "format(" + a[0] + ", \".\" + str(" + n + ") + \"g\")";
  };
  LIST_WORK.javascript.lists.significant = function (a, k, w) { w.need("significant"); return "significant(" + a[0] + ", " + (a[1] || "6") + ")"; };
  LIST_WORK.javascript.helpers.significant = [
    "// x to so many figures, as C++ shows a number: 81.6667, 1.23457e+06.",
    "function significant(x, n) {",
    "  if (x === 0) { return \"0\"; }",
    "  const bare = (t) => (t.includes(\".\") ? t.replace(/0+$/, \"\").replace(/\\.$/, \"\") : t);",
    "  const exp = Math.floor(Math.log10(Math.abs(Number(x.toPrecision(n)))));",
    "  if (exp < -4 || exp >= n) {",
    "    const [m, e] = x.toExponential(n - 1).split(\"e\");",
    "    return bare(m) + \"e\" + e[0] + e.slice(1).padStart(2, \"0\");",
    "  }",
    "  return bare(x.toFixed(Math.max(0, n - 1 - exp)));",
    "}"];
  LIST_WORK.java.lists.significant = function (a, k, w) { w.need("significant"); return "significant(" + a[0] + ", " + (a[1] || "6") + ")"; };
  LIST_WORK.java.helpers.significant = [
    "    // x to so many figures, as C++ shows a number: 81.6667, 1.23457e+06.",
    "    static String significant(double x, int n) {",
    "        if (x == 0) { return \"0\"; }",
    "        java.math.BigDecimal b = new java.math.BigDecimal(x).round(new java.math.MathContext(n));",
    "        int exp = b.precision() - b.scale() - 1;",
    "        if (exp < -4 || exp >= n) {",
    "            String m = b.movePointLeft(exp).stripTrailingZeros().toPlainString();",
    "            return m + \"e\" + (exp < 0 ? \"-\" : \"+\") + (Math.abs(exp) < 10 ? \"0\" : \"\") + Math.abs(exp);",
    "        }",
    "        return b.stripTrailingZeros().toPlainString();",
    "    }"];
  LIST_WORK.csharp.lists.significant = function (a, k, w) { w.need("significant"); return "Significant(" + a[0] + ", " + (a[1] || "6") + ")"; };
  LIST_WORK.csharp.helpers.significant = [
    "    // x to so many figures, as C++ shows a number: 81.6667, 1.23457e+06.",
    "    static string Significant(double x, int n) {",
    "        if (x == 0) { return \"0\"; }",
    "        var inv = System.Globalization.CultureInfo.InvariantCulture;",
    "        string e = x.ToString(\"E\" + (n - 1), inv);",
    "        int exp = int.Parse(e.Substring(e.IndexOf('E') + 1), inv);",
    "        if (exp < -4 || exp >= n) {",
    "            string m = e.Substring(0, e.IndexOf('E'));",
    "            if (m.Contains(\".\")) { m = m.TrimEnd('0').TrimEnd('.'); }",
    "            return m + \"e\" + (exp < 0 ? \"-\" : \"+\") + Math.Abs(exp).ToString(\"00\");",
    "        }",
    "        string f = x.ToString(\"F\" + Math.Max(0, n - 1 - exp), inv);",
    "        if (f.Contains(\".\")) { f = f.TrimEnd('0').TrimEnd('.'); }",
    "        return f;",
    "    }"];
  LIST_WORK.cpp.lists.significant = function (a, k, w) { w.need("significant"); return "significant(" + a[0] + ", " + (a[1] || "6") + ")"; };
  LIST_WORK.cpp.helpers.significant = { wants: ["string", "sstream", "iomanip"], lines: [
    "// x to so many figures, as cout shows a number: 81.6667, 1.23457e+06.",
    "static std::string significant(double x, int n) {",
    "    std::ostringstream o;",
    "    o << std::setprecision(n) << x;",
    "    return o.str();",
    "}"] };

  // repr(x): words in quotes, the way they are written inside a list
  LIST_WORK.python.lists.repr = function (a) { return "repr(" + a[0] + ")"; };
  LIST_WORK.javascript.lists.repr = function (a, k, w) { w.need("shown"); return "shown(" + a[0] + ", true)"; };
  LIST_WORK.java.lists.repr = function (a, k, w) { w.need("shown"); return "shown(" + a[0] + ", true)"; };
  LIST_WORK.csharp.lists.repr = function (a, k, w) { w.need("shown"); return "Shown(" + a[0] + ", true)"; };
  LIST_WORK.cpp.lists.repr = function (a, k, w) { w.need("shown"); w.need("reprOf"); return "reprOf(" + a[0] + ")"; };
  LIST_WORK.cpp.helpers.reprOf = { wants: ["sstream"], lines: [
    "static std::string reprOf(const std::string& s) { return \"'\" + s + \"'\"; }",
    "template <typename T> static std::string reprOf(const T& v) {",
    "    std::ostringstream o;", "    shownIn(o, v);", "    return o.str();", "}"] };

  // word[i] = "x": words cannot be changed in place, so the word is made again
  LIST_WORK.python.setChar = function (t, i, v) { return t + " = " + held(t) + "[:" + i + "] + " + v + " + " + held(t) + "[" + held(i) + " + 1:]"; };
  LIST_WORK.javascript.setChar = function (t, i, v) {
    return t + " = " + held(t) + ".slice(0, " + i + ") + " + v + " + " + held(t) + ".slice(" + held(i) + " + 1)";
  };
  LIST_WORK.java.setChar = function (t, i, v) {
    return t + " = " + held(t) + ".substring(0, " + i + ") + " + v + " + " + held(t) + ".substring(" + held(i) + " + 1)";
  };
  LIST_WORK.csharp.setChar = function (t, i, v) {
    return t + " = " + held(t) + ".Substring(0, " + i + ") + " + v + " + " + held(t) + ".Substring(" + held(i) + " + 1)";
  };
  LIST_WORK.cpp.setChar = function (t, i, v) { return held(t) + "[" + i + "] = " + held(v) + "[0]"; };

  // (3, 4): Python has tuples; the rest keep one as a list
  LIST_WORK.python.tupleOf = function (items) { return "(" + items.join(", ") + (items.length === 1 ? ",)" : ")"); };

  // transpose(rows): the columns of a list of lists
  LIST_WORK.python.lists.transpose = function (a) { return "[list(c) for c in zip(*" + a[0] + ")]"; };
  LIST_WORK.javascript.lists.transpose = function (a) {
    return "(" + held(a[0]) + ".length ? " + held(a[0]) + "[0].map((_, i) => " + held(a[0]) + ".map((row) => row[i])) : [])";
  };
  LIST_WORK.java.lists.transpose = function (a, k, w) { w.need("transpose"); return "transpose(" + a[0] + ")"; };
  LIST_WORK.java.helpers.transpose = ["    static <T> ArrayList<ArrayList<T>> transpose(List<? extends List<T>> rows) {",
                                      "        ArrayList<ArrayList<T>> out = new ArrayList<>();",
                                      "        int n = rows.isEmpty() ? 0 : Integer.MAX_VALUE;",
                                      "        for (List<T> row : rows) { n = Math.min(n, row.size()); }",
                                      "        for (int i = 0; i < n; i++) {",
                                      "            ArrayList<T> col = new ArrayList<>();",
                                      "            for (List<T> row : rows) { col.add(row.get(i)); }",
                                      "            out.add(col);",
                                      "        }",
                                      "        return out;",
                                      "    }"];
  LIST_WORK.csharp.lists.transpose = function (a) {
    return "Enumerable.Range(0, " + held(a[0]) + ".Count == 0 ? 0 : " + held(a[0]) + ".Min(r_ => r_.Count)).Select(i_ => " +
           held(a[0]) + ".Select(r_ => r_[i_]).ToList()).ToList()";
  };
  LIST_WORK.cpp.lists.transpose = function (a, k, w) { w.need("transpose"); return "transpose(" + a[0] + ")"; };
  LIST_WORK.cpp.helpers.transpose = { wants: ["vector", "algorithm"], lines: [
    "template <typename T> static std::vector<std::vector<T>> transpose(const std::vector<std::vector<T>>& rows) {",
    "    std::vector<std::vector<T>> out;",
    "    size_t n = rows.empty() ? 0 : rows[0].size();",
    "    for (const auto& row : rows) { n = std::min(n, row.size()); }",
    "    for (size_t i = 0; i < n; i++) {",
    "        std::vector<T> col;",
    "        for (const auto& row : rows) { col.push_back(row[i]); }",
    "        out.push_back(col);",
    "    }",
    "    return out;", "}"] };

  // Two lists put end to end: [1, 2] + [3].
  LIST_WORK.python.listPlus = function (a, b) { return a + " + " + b; };
  LIST_WORK.javascript.listPlus = function (a, b) { return "[..." + a + ", ..." + b + "]"; };
  LIST_WORK.java.listPlus = function (a, b, w) { w.need("listPlus"); return "listPlus(" + a + ", " + b + ")"; };
  LIST_WORK.java.helpers.listPlus = ["    static <T> ArrayList<T> listPlus(List<T> a, List<T> b) {",
                                     "        ArrayList<T> out = new ArrayList<>(a);",
                                     "        out.addAll(b);",
                                     "        return out;",
                                     "    }"];
  LIST_WORK.csharp.listPlus = function (a, b) { return held(a) + ".Concat(" + b + ").ToList()"; };
  LIST_WORK.cpp.listPlus = function (a, b, w) { w.need("listPlus"); return "listPlus(" + a + ", " + b + ")"; };
  LIST_WORK.cpp.helpers.listPlus = { wants: ["vector"], lines: [
    "template <typename T> static std::vector<T> listPlus(std::vector<T> a, const std::vector<T>& b) {",
    "    a.insert(a.end(), b.begin(), b.end());", "    return a;", "}"] };

  // int("42"): words read as the number they say
  LIST_WORK.java.parseInt = function (code) { return "Integer.parseInt(" + held(code) + ".trim())"; };
  LIST_WORK.csharp.parseInt = function (code) { return "int.Parse(" + code + ")"; };
  LIST_WORK.cpp.parseInt = function (code) { return "std::stoi(" + code + ")"; };

  // asin, acos and sign, under each language's own names for them.
  (function () {
    function by(name, lib) {
      return function (a, k, w) { if (lib) { w.need(lib); } return name + "(" + a.join(", ") + ")"; };
    }
    function signOf(a) { return "((" + a[0] + " > 0) - (" + a[0] + " < 0))"; }
    var more = {
      python: { asin: by("math.asin", "math"), acos: by("math.acos", "math"), sign: signOf },
      javascript: { asin: by("Math.asin"), acos: by("Math.acos"), sign: by("Math.sign") },
      java: { asin: by("Math.asin"), acos: by("Math.acos"),
              sign: function (a) { return "(int) Math.signum(" + a[0] + ")"; } },
      csharp: { asin: by("Math.Asin"), acos: by("Math.Acos"), sign: by("Math.Sign") },
      cpp: { asin: by("std::asin", "cmath"), acos: by("std::acos", "cmath"), sign: signOf }
    };
    Object.keys(more).forEach(function (code) {
      Object.keys(more[code]).forEach(function (name) { LIST_WORK[code].lists[name] = more[code][name]; });
    });
  })();

  // The names each language's lists lean on, which a variable of the
  // program's must not be standing on.
  LIST_WORK.python.keptToo = "sorted class_of list dict set map str type repr vars len float int object is_number functools lambda";
  LIST_WORK.python.softToo = { sum: "sum", sorted: "sorted", any: "any", all: "all", zip: "zip",
                               ord: "ord", chr: "chr", enumerate: "enumerate" };
  LIST_WORK.python.builtRef = { length: "len", tostring: "str", abs: "abs", sum: "sum", int: "int",
                                real: "float", sorted: "sorted", ord: "ord", chr: "chr" };
  LIST_WORK.python.lambda = function (v, body) { return "lambda " + v + ": " + body; };
  LIST_WORK.javascript.keptToo = "classOf Array Map Set Object Boolean JSON Infinity NaN isNaN shown shuffle";
  LIST_WORK.javascript.lambda = function (v, body) { return "(" + v + ") => " + body; };
  LIST_WORK.java.keptToo = "transpose sizeOf orderOf listPlus Record kindName sortIn reverseIn ArrayList LinkedHashMap LinkedHashSet Arrays Collections List Map Comparator " +
                           "Object StringBuilder shown joined filled filledFrom tableOf sortedList " +
                           "reversedList shuffledList itemsOf isNumber java";
  LIST_WORK.java.lambda = function (v, body) { return v + " -> " + body; };
  LIST_WORK.java.lambdaName = "v_";
  LIST_WORK.csharp.keptToo = "OrderOf Record KindName SortIn ReverseIn dynamic List Dictionary Enumerable Shown PopAt SortedList Shuffle IsNumber System Linq";
  LIST_WORK.csharp.lambda = function (v, body) { return v + " => " + body; };
  LIST_WORK.csharp.lambdaName = "v_";
  LIST_WORK.cpp.keptToo = "lastIndexOf reprOf transpose listPlus kindName vector map shown shownIn popAt indexOf joined splitText chars keysOf valuesOf " +
                          "sortedList reversedCopy shuffleIn shuffledCopy repeated rangeOf textOf replaced " +
                          "trimmed allOf isNumber uniqueOf setWork padded fixedText Record INFINITY";
  LIST_WORK.cpp.lambda = function (v, body) { return "[](auto " + v + ") { return " + body + "; }"; };


  // ---- functions as values, and what is left over -------------------------
  // bind(f, a): f with a handed over first.  Python and JavaScript have the
  // word for it already; Java is handed an Fn, which is called with call();
  // C# a delegate, which is called as it stands.
  function boundArity(node, w) {
    var head = node && node.args && node.args[0];
    var one = head && head.name && !head.field ? w.prog.byName[lowered(head.name)] : null;
    return one ? { one: one, left: one.params.length - (node.args.length - 1) } : null;
  }
  function javaFromObject(code, kind, w) {
    if (kind === "int") { return "((Number) " + code + ").intValue()"; }
    if (kind === "real") { return "((Number) " + code + ").doubleValue()"; }
    if (kind === "text") { return "(String) " + code; }
    if (kind === "bool") { return "(Boolean) " + code; }
    if (kind === "any" || !kind) { return code; }
    return "(" + w.typeOf(kind) + ") " + code;
  }
  LIST_WORK.python.lists.bind = function (a, k, w) { w.need("functools"); return "functools.partial(" + a.join(", ") + ")"; };
  LIST_WORK.javascript.lists.bind = function (a) { return held(a[0]) + ".bind(null" + a.slice(1).map(function (x) { return ", " + x; }).join("") + ")"; };
  LIST_WORK.java.fnType = "Fn";
  LIST_WORK.java.fnRef = function (name, one, w) {
    w.need("fn");
    var args = one.params.map(function (p, i) {
      var got = javaFromObject("a_[" + i + "]", p.entry.kind, w);
      return p.dflt ? "(a_.length > " + i + " ? " + got + " : " + w.code(p.dflt) + ")" : got;
    });
    var call = w.reachMod(one) + name + "(" + args.join(", ") + ")";
    return "(Fn) (a_) -> " + (one.gives ? call : "{ " + call + "; return null; }");
  };
  LIST_WORK.java.lists.bind = function (a, k, w) { w.need("fn"); return "bind(" + a.join(", ") + ")"; };
  LIST_WORK.java.callFn = function (name, codes) { return name + ".call(" + codes.join(", ") + ")"; };
  LIST_WORK.java.helpers.fn = JAVA_FN_TYPE.concat([
                               "    // f, handed what is bound first whenever it is called",
                               "    static Fn bind(Fn f, Object... bound) {",
                               "        return (a) -> {",
                               "            Object[] all = new Object[bound.length + a.length];",
                               "            System.arraycopy(bound, 0, all, 0, bound.length);",
                               "            System.arraycopy(a, 0, all, bound.length, a.length);",
                               "            return f.call(all);",
                               "        };",
                               "    }"]);
  LIST_WORK.csharp.fnType = "dynamic";
  // A C# delegate whose last ones may be left out -- by = 1 -- declared
  // for the function it stands for: Fn_step(dynamic p0_, dynamic p1_ = null)
  function csOptionalFn(tag, params, gives, w, lang) {
    var nm = "Fn_" + tag;
    if (!lang.helpers[nm]) {
      lang.helpers[nm] = ["    // what a call may leave out, made what it is when it is left out",
                          "    delegate " + (gives ? "dynamic" : "void") + " " + nm + "(" + params.map(function (p, i) {
                            return "dynamic p" + i + "_" + (p.dflt ? " = null" : "");
                          }).join(", ") + ");"];
      lang.kept[nm] = true;
    }
    w.need(nm);
    return nm;
  }
  function csFnOf(name, one, w) {
    if (one.params.some(function (p) { return p.dflt; })) {
      var dn = csOptionalFn(name, one.params, !!one.gives, w, w.L);
      var qs = one.params.map(function (p, i) { return "p" + i + "_"; });
      var handed = one.params.map(function (p, i) { return p.dflt ? "(" + qs[i] + " ?? " + w.code(p.dflt) + ")" : qs[i]; });
      return "new " + dn + "((" + qs.join(", ") + ") => " + w.reachMod(one) + name + "(" + handed.join(", ") + "))";
    }
    var ps = one.params.map(function (p, i) { return "p" + i + "_"; });
    var types = one.params.map(function () { return "dynamic"; });
    var body = w.reachMod(one) + name + "(" + ps.join(", ") + ")";
    var type = one.gives ? "Func<" + types.concat(["dynamic"]).join(", ") + ">" : (types.length ? "Action<" + types.join(", ") + ">" : "Action");
    return "new " + type + "((" + ps.join(", ") + ") => " + body + ")";
  }
  LIST_WORK.csharp.fnRef = function (name, one, w) { return csFnOf(name, one, w); };
  LIST_WORK.csharp.lists.bind = function (a, k, w, nodes) {
    var got = boundArity(nodes[0] ? { args: nodes } : null, w);
    if (!got) { return "null"; }
    var n = got.one.params.length, b = nodes.length - 1, left = n - b, gives = !!got.one.gives;
    // bound with some still to come that may be left out: its own delegate
    var rest0 = got.one.params.slice(b);
    if (rest0.some(function (p) { return p.dflt; })) {
      var tag = w.called(got.one) + "_" + b;
      var dn = csOptionalFn(tag, rest0, gives, w, this);
      var bnm = "Bind_" + tag;
      if (!this.helpers[bnm]) {
        var bs0 = [], xs0 = [];
        for (var i0 = 0; i0 < b; i0++) { bs0.push("b" + i0); }
        rest0.forEach(function (p, j0) { xs0.push("p" + j0 + "_"); });
        this.helpers[bnm] = ["    // " + w.called(got.one) + ", handed " + b + " now and the rest when it is called",
                             "    static " + dn + " " + bnm + "(dynamic f" + bs0.map(function (v) { return ", dynamic " + v; }).join("") + ") {",
                             "        return (" + xs0.join(", ") + ") => f(" + bs0.concat(xs0).join(", ") + ");",
                             "    }"];
        this.kept[bnm] = true;
      }
      w.need(bnm);
      return bnm + "(" + [csFnOf(w.called(got.one), got.one, w)].concat(a.slice(1)).join(", ") + ")";
    }
    var nm = "Bind" + (gives ? "" : "V") + n + "_" + b;
    if (!this.helpers[nm]) {
      var dyn = function (m) { var o = []; for (var i = 0; i < m; i++) { o.push("dynamic"); } return o; };
      var fType = gives ? "Func<" + dyn(n).concat(["dynamic"]).join(", ") + ">" : (n ? "Action<" + dyn(n).join(", ") + ">" : "Action");
      var rType = gives ? "Func<" + dyn(left).concat(["dynamic"]).join(", ") + ">" : (left ? "Action<" + dyn(left).join(", ") + ">" : "Action");
      var bs = [], xs = [];
      for (var i = 0; i < b; i++) { bs.push("b" + i); }
      for (var j = 0; j < left; j++) { xs.push("x" + j); }
      this.helpers[nm] = ["    // " + (gives ? "A function" : "A module") + " of " + n + ", handed " + b + " of them now and the rest when it is called.",
                          "    static " + rType + " " + nm + "(" + fType + " f" + bs.map(function (v) { return ", dynamic " + v; }).join("") + ") {",
                          "        return (" + xs.join(", ") + ") => f(" + bs.concat(xs).join(", ") + ");",
                          "    }"];
      this.kept[nm] = true;
    }
    w.need(nm);
    return nm + "(" + [csFnOf(w.called(got.one), got.one, w)].concat(a.slice(1)).join(", ") + ")";
  };

  // ---- a slice counted from the end: t[-5:] --------------------------------
  function fromEnd(code, length) {
    return /^-\s*\d+$/.test(String(code).trim()) ? length + " " + String(code).trim().replace(/^-\s*/, "- ") : code;
  }
  LIST_WORK.java.lists.slice = function (a, k) {
    if (k[0] === "text") {
      var len = held(a[0]) + ".length()";
      return held(a[0]) + ".substring(" + fromEnd(a[1], len) + (a[2] ? ", " + fromEnd(a[2], len) : "") + ")";
    }
    var size = held(a[0]) + ".size()";
    return "new ArrayList<>(" + held(a[0]) + ".subList(" + fromEnd(a[1], size) + ", " + (a[2] ? fromEnd(a[2], size) : size) + "))";
  };
  LIST_WORK.java.lists.substring = function (a) {
    var len = held(a[0]) + ".length()";
    return held(a[0]) + ".substring(" + fromEnd(a[1], len) + (a[2] ? ", " + fromEnd(a[2], len) : "") + ")";
  };
  LIST_WORK.csharp.lists.slice = function (a, k) {
    var len = held(a[0]) + (k[0] === "text" ? ".Length" : ".Count");
    var from = fromEnd(a[1], len), to = a[2] ? fromEnd(a[2], len) : null;
    if (k[0] === "text") { return held(a[0]) + ".Substring(" + from + (to ? ", " + to + " - " + held(from) : "") + ")"; }
    return held(a[0]) + ".GetRange(" + from + ", " + (to || len) + " - " + held(from) + ")";
  };
  LIST_WORK.csharp.lists.substring = function (a) {
    var len = held(a[0]) + ".Length";
    var from = fromEnd(a[1], len), to = a[2] ? fromEnd(a[2], len) : null;
    return held(a[0]) + ".Substring(" + from + (to ? ", " + to + " - " + held(from) : "") + ")";
  };
  LIST_WORK.cpp.lists.slice = function (a, k, w) {
    var len = "(int)" + held(a[0]) + ".size()";
    var from = fromEnd(a[1], len), to = a[2] ? fromEnd(a[2], len) : null;
    if (k[0] === "text") { return held(a[0]) + ".substr(" + from + (to ? ", " + to + " - " + held(from) : "") + ")"; }
    return w.typeOf(k[0]) + "(" + held(a[0]) + ".begin() + " + held(from) + ", " + (to ? held(a[0]) + ".begin() + " + held(to) : held(a[0]) + ".end()") + ")";
  };
  LIST_WORK.cpp.lists.substring = function (a) {
    var len = "(int)" + held(a[0]) + ".size()";
    var from = fromEnd(a[1], len), to = a[2] ? fromEnd(a[2], len) : null;
    return held(a[0]) + ".substr(" + from + (to ? ", " + to + " - " + held(from) : "") + ")";
  };
  // the slices above, with a step as well: every so many, the stepped helper
  ["java", "csharp", "cpp"].forEach(function (lang) {
    var plain = LIST_WORK[lang].lists.slice;
    LIST_WORK[lang].lists.slice = function (a, k, w) {
      if (a.length > 3) { w.need("sliceStep"); return (lang === "csharp" ? "SliceStep(" : "sliceStep(") + a.join(", ") + ")"; }
      return plain.apply(this, arguments);
    };
  });

  // ---- Java: what is in both, in either, in one only; zip and enumerate --
  ["union", "intersection", "difference"].forEach(function (op, how) {
    LIST_WORK.java.lists[op] = function (a, k, w) { w.need("setWork"); return "setWork(" + a[0] + ", " + a[1] + ", " + [2, 0, 1][how] + ")"; };
  });
  LIST_WORK.java.helpers.setWork = ["    // What is in both (0), in the first only (1), or in either (2).",
                                    "    static <T> ArrayList<T> setWork(List<T> a, List<T> b, int how) {",
                                    "        ArrayList<T> out = new ArrayList<>();",
                                    "        for (T v : a) {",
                                    "            boolean inB = b.contains(v);",
                                    "            if (how == 1 ? !inB : (how == 2 || inB) && !out.contains(v)) { out.add(v); }",
                                    "        }",
                                    "        if (how == 2) { for (T v : b) { if (!out.contains(v)) { out.add(v); } } }",
                                    "        return out;",
                                    "    }"];
  LIST_WORK.java.lists.zip = function (a, k, w) { w.need("zipped"); return "zipped(" + a.join(", ") + ")"; };
  LIST_WORK.java.lists.enumerate = function (a, k, w) { w.need("zipped"); return "enumerated(" + a.join(", ") + ")"; };
  LIST_WORK.java.helpers.zipped = ["    // Lists taken a place at a time: [first of each], [second of each], ...",
                                   "    static ArrayList<ArrayList<Object>> zipped(List<?>... lists) {",
                                   "        ArrayList<ArrayList<Object>> out = new ArrayList<>();",
                                   "        int n = Integer.MAX_VALUE;",
                                   "        for (List<?> l : lists) { n = Math.min(n, l.size()); }",
                                   "        for (int i = 0; lists.length > 0 && i < n; i++) {",
                                   "            ArrayList<Object> row = new ArrayList<>();",
                                   "            for (List<?> l : lists) { row.add(l.get(i)); }",
                                   "            out.add(row);",
                                   "        }",
                                   "        return out;",
                                   "    }",
                                   "    static ArrayList<ArrayList<Object>> enumerated(List<?> items) { return enumerated(items, 0); }",
                                   "    static ArrayList<ArrayList<Object>> enumerated(List<?> items, int from) {",
                                   "        ArrayList<ArrayList<Object>> out = new ArrayList<>();",
                                   "        for (int i = 0; i < items.size(); i++) { out.add(new ArrayList<>(Arrays.asList(from + i, items.get(i)))); }",
                                   "        return out;",
                                   "    }"];

  // ---- sorting that keeps equal things in the order they came in ----------
  LIST_WORK.csharp.lists.sort = function (a, k, w, nodes) {
    var elem = elemOf(k[0]);
    var how = a[1] || !/^(int|real|text|bool)$/.test(elem) ? csOrder(a[1], nodes[1], w, elem)
            : elem === "text" ? "string.CompareOrdinal" : "";
    if (!how) { return w.statement ? held(a[0]) + ".Sort()" : (w.need("sortIn"), "SortIn(" + a[0] + ")"); }
    w.need("sortIn");
    return "SortIn(" + a[0] + ", " + how + ")";
  };
  LIST_WORK.csharp.helpers.sortIn = ["    static List<T> SortIn<T>(List<T> items) { items.Sort(); return items; }",
                                     "    // In order, and things that come out equal left the way round they were.",
                                     "    static List<T> SortIn<T>(List<T> items, Comparison<T> order) {",
                                     "        var made = items.OrderBy(v_ => v_, Comparer<T>.Create(order)).ToList();",
                                     "        items.Clear();",
                                     "        items.AddRange(made);",
                                     "        return items;",
                                     "    }",
                                     "    static List<T> ReverseIn<T>(List<T> items) { items.Reverse(); return items; }"];
  LIST_WORK.csharp.helpers.sortedList = ["    static List<T> SortedList<T>(List<T> items, Comparison<T> order) {",
                                         "        return items.OrderBy(v_ => v_, Comparer<T>.Create(order)).ToList();",
                                         "    }"];
  LIST_WORK.cpp.lists.sort = function (a, k, w, nodes) {
    if (!w.statement) {
      w.need("sortedList");
      return "sortedList(" + a[0] + (a[1] ? ", " + cppOrder(a[1], nodes[1], w) : "") + ")";
    }
    w.need("algorithm");
    return "std::stable_sort(" + held(a[0]) + ".begin(), " + held(a[0]) + ".end()" + (a[1] ? ", " + cppOrder(a[1], nodes[1], w) : "") + ")";
  };
  LIST_WORK.cpp.helpers.sortedList = { wants: ["vector", "algorithm"], lines: [
    "template <typename T> static std::vector<T> sortedList(std::vector<T> items) {",
    "    std::stable_sort(items.begin(), items.end());", "    return items;", "}",
    "template <typename T, typename F> static std::vector<T> sortedList(std::vector<T> items, F order) {",
    "    std::stable_sort(items.begin(), items.end(), order);", "    return items;", "}"] };

  // ---- Java: the letters of some words, the empty word having none --------
  LIST_WORK.java.helpers.chars = ["    // Each letter of some words, as words of its own.",
                                  "    static ArrayList<String> chars(String s) {",
                                  "        ArrayList<String> out = new ArrayList<>();",
                                  "        for (char c : s.toCharArray()) { out.add(String.valueOf(c)); }",
                                  "        return out;",
                                  "    }"];
  (function () {
    var split0 = LIST_WORK.java.lists.split, tolist0 = LIST_WORK.java.lists.tolist;
    LIST_WORK.java.lists.split = function (a, k, w) {
      if (a[1] === '""') { w.need("chars"); return "chars(" + a[0] + ")"; }
      return split0.apply(this, arguments);
    };
    LIST_WORK.java.lists.tolist = function (a, k, w) {
      if (k[0] === "text") { w.need("chars"); return "chars(" + a[0] + ")"; }
      return tolist0.apply(this, arguments);
    };
  })();

  // ---- what something of no one kind is, and what is at a place in it ------
  (function () {
    var classof0 = LIST_WORK.java.lists.classof;
    LIST_WORK.java.lists.classof = function (a, k, w) {
      if (k[0] === "any" || !k[0]) { w.need("classOf"); return "classOf(" + a[0] + ")"; }
      return classof0.apply(this, arguments);
    };
    var classof1 = LIST_WORK.csharp.lists.classof;
    LIST_WORK.csharp.lists.classof = function (a, k, w) {
      if (k[0] === "any" || !k[0]) { w.need("classOf"); return "ClassOf(" + a[0] + ")"; }
      return classof1.apply(this, arguments);
    };
  })();
  LIST_WORK.java.helpers.classOf = ["    // What kind of thing something is, in the chart's words.",
                                    "    static String classOf(Object v) {",
                                    "        if (v instanceof List) { return \"List\"; }",
                                    "        if (v instanceof Map) { return \"Table\"; }",
                                    "        if (v instanceof Boolean) { return \"Boolean\"; }",
                                    "        if (v instanceof Integer || v instanceof Long) { return \"Integer\"; }",
                                    "        if (v instanceof Double) { return (Double) v == Math.floor((Double) v) ? \"Integer\" : \"Real\"; }",
                                    "        if (v instanceof String) { return \"String\"; }",
                                    "        return v.getClass().getSimpleName();",
                                    "    }"];
  LIST_WORK.csharp.helpers.classOf = ["    // What kind of thing something is, in the chart's words.",
                                      "    static string ClassOf(object v) {",
                                      "        if (v is System.Collections.IDictionary) { return \"Table\"; }",
                                      "        if (v is System.Collections.IList) { return \"List\"; }",
                                      "        if (v is bool) { return \"Boolean\"; }",
                                      "        if (v is int || v is long) { return \"Integer\"; }",
                                      "        if (v is double) { return (double)v == Math.Floor((double)v) ? \"Integer\" : \"Real\"; }",
                                      "        if (v is string) { return \"String\"; }",
                                      "        return v.GetType().Name;",
                                      "    }"];
  (function () {
    var itemAt0 = LIST_WORK.java.itemAt;
    LIST_WORK.java.itemAt = function (o, i, kind, w) {
      if (kind === "any") { w.need("itemOf"); return "itemOf(" + o + ", " + i + ")"; }
      return itemAt0.apply(this, arguments);
    };
    LIST_WORK.csharp.itemAt = function (o, i, kind, w) {
      if (kind === "any") { w.need("itemOf"); return "ItemOf(" + o + ", " + i + ")"; }
      return held(o) + "[" + i + "]";
    };
  })();
  LIST_WORK.java.helpers.itemOf = ["    // What is at a place in something of no one kind: a letter of words,",
                                   "    // an item of a list, what a table keeps under it.",
                                   "    static Object itemOf(Object v, Object at) {",
                                   "        if (v instanceof String) { return String.valueOf(((String) v).charAt((Integer) at)); }",
                                   "        if (v instanceof Map) { return ((Map<?, ?>) v).get(at); }",
                                   "        return ((List<?>) v).get((Integer) at);",
                                   "    }"];
  LIST_WORK.csharp.helpers.itemOf = ["    // What is at a place in something of no one kind: a letter of words,",
                                     "    // an item of a list, what a table keeps under it.",
                                     "    static dynamic ItemOf(dynamic v, dynamic at) {",
                                     "        if (v is string) { return ((string)v)[(int)at].ToString(); }",
                                     "        return v[at];",
                                     "    }"];
  LIST_WORK.csharp.listPlus = function (a, b) { return "Enumerable.ToList(Enumerable.Concat(" + a + ", " + b + "))"; };

  // ---- JavaScript: anything that is not a number or words, put in order --
  LIST_WORK.javascript.helpers.orderOf = ["// Which of two comes first: numbers by size, words by their letters,",
                                          "// lists item by item -- the way the chart puts them in order.",
                                          "function orderOf(a, b) {",
                                          "  if (Array.isArray(a) && Array.isArray(b)) {",
                                          "    for (let i = 0; i < Math.min(a.length, b.length); i++) {",
                                          "      const one = orderOf(a[i], b[i]);",
                                          "      if (one) { return one; }",
                                          "    }",
                                          "    return a.length - b.length;",
                                          "  }",
                                          "  if (typeof a === \"number\" && typeof b === \"number\") { return a - b; }",
                                          "  if ((typeof a === \"number\") !== (typeof b === \"number\")) { return typeof a === \"number\" ? -1 : 1; }",
                                          "  return a < b ? -1 : a > b ? 1 : 0;",
                                          "}"];
  // JavaScript reads the number at the front of some words, and nought where there is none
  (function () {
    var real0 = LIST_WORK.javascript.lists.real;
    LIST_WORK.javascript.lists.real = function (a, k) {
      return k[0] === "text" ? "(parseFloat(" + a[0] + ") || 0)" : real0.apply(this, arguments);
    };
  })();
  LIST_WORK.javascript.keptToo += " orderOf roundEven";
  LIST_WORK.java.keptToo += " Fn bind chars classOf itemOf setWork zipped enumerated";
  LIST_WORK.csharp.keptToo += " ClassOf ItemOf";
  LIST_WORK.cpp.keptToo += " Value valueOrder valueSame classOf itemsOf zipped enumerated Fn function";
  LIST_WORK.python.keptToo += " to_base format";
  LIST_WORK.python.softToo.copy = "deepcopy";
  LIST_WORK.python.softToo.json = "tojson";
  LIST_WORK.javascript.keptToo += " deepCopy significant popKey";
  LIST_WORK.java.keptToo += " significant padded";
  LIST_WORK.csharp.keptToo += " Significant PopKey";
  LIST_WORK.cpp.keptToo += " significant popKey realText";
  LIST_WORK.java.keptToo += " deepCopy deepCopied copied";
  LIST_WORK.csharp.keptToo += " DeepCopy DeepCopied Copied";
  LIST_WORK.cpp.keptToo += " deepCopy";
  LIST_WORK.python.softToo.copied = "copy";
  LIST_WORK.javascript.keptToo += " sliceStep";
  LIST_WORK.java.keptToo += " sliceStep stepAt indexFrom";
  LIST_WORK.csharp.keptToo += " SliceStep StepAt ToBase";
  LIST_WORK.cpp.keptToo += " sliceStep stepAt toBase grouped toJson";
  LIST_WORK.javascript.keptToo += " toJson";
  LIST_WORK.java.keptToo += " toJson";
  LIST_WORK.csharp.keptToo += " ToJson";
  LIST_WORK.python.keptToo += " json";

  // Filled into each language's own block, once.
  Object.keys(LIST_WORK).forEach(function (code) {
    var mine = LANGS[code], more = LIST_WORK[code];
    Object.keys(more).forEach(function (key) {
      if (key === "keptToo") {
        more.keptToo.split(/\s+/).forEach(function (word) { if (word) { mine.kept[word] = true; } });
      } else if (key === "softToo") {
        mine.soft = Object.assign({}, mine.soft || {}, more.softToo);
      } else if (key === "helpers") {
        mine.helpers = mine.helpers || {};
        Object.keys(more.helpers).forEach(function (h) { mine.helpers[h] = more.helpers[h]; });
      } else {
        mine[key] = more[key];
      }
    });
  });
