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
    typed: function (entry, w) { return this.kinds ? typeOfKind(this, entry.kind, w) + " " : ""; },
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
        return OTHERWISE.test(label) || isLiteral(tree(label));
      });
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
      pow: "**",
      worded: function (code) { return "str(" + code + ")"; },
      calls: {
        sqrt: function (a, k, w) { w.need("math"); return "math.sqrt(" + a[0] + ")"; },
        abs: function (a) { return "abs(" + a[0] + ")"; },
        // Python's own round() goes to the nearest even number: round(2.5)
        // is 2.  The runner, and everybody's arithmetic teacher, say 3.
        round: function (a, k, w) { w.need("math"); return "math.floor(" + a[0] + " + 0.5)"; },
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
        ["functools", "math", "random", "time"].forEach(function (lib) {
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
          ["functools", "math", "random", "time"].forEach(function (lib) {
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
        int: function (a) { return "(int) " + held(a[0]); },
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
        min: function (a) { return "Math.min(" + a.join(", ") + ")"; },
        max: function (a) { return "Math.max(" + a.join(", ") + ")"; }
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
        // Math.Round goes to the nearest even number unless told not to.
        round: function (a) {
          return "(int)Math.Round(" + a[0] + ", MidpointRounding.AwayFromZero)";
        },
        floor: function (a) { return "(int)Math.Floor(" + a[0] + ")"; },
        ceiling: function (a) { return "(int)Math.Ceiling(" + a[0] + ")"; },
        int: function (a) { return "(int)" + held(a[0]); },
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
        min: function (a) { return "Math.Min(" + a.join(", ") + ")"; },
        max: function (a) { return "Math.Max(" + a.join(", ") + ")"; }
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
        round: function (a, k, w) { w.need("cmath"); return "(int)std::round(" + a[0] + ")"; },
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
        int: function (a) { return "Math.trunc(" + a[0] + ")"; },
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
    if (kind === "any") { return L.anyType || L.kinds.text; }
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
      newRecord: function (kind, w) { return w.recName(kind) + "()"; },
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
        newlist: function (a) {
          var fill = a[a.length - 1], sizes = a.slice(0, -1);
          var made = "[" + fill + "] * " + held(sizes[sizes.length - 1]);
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
      newRecord: function (kind, w) { return "new " + w.recName(kind) + "()"; },
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
        w.line(deep, "for (" + (entry && !entry.perLoop ? "" : "const ") +
               w.named(item["var"]) + " of " + src + ") {");
        w.block(item.body, deep + 1);
        w.line(deep, "}");
      },
      records: function (w, recs) {
        Object.keys(recs).forEach(function (kind) {
          w.line(0, "");
          w.line(0, "class " + w.recName(kind) + " {}");
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
        pop: function (a, k) {
          if (isTableKind(k[0])) { return "((v) => (" + held(a[0]) + ".delete(" + a[1] + "), v))(" + held(a[0]) + ".get(" + a[1] + "))"; }
          if (!a[1]) { return held(a[0]) + ".pop()"; }
          if (a[1] === "0") { return held(a[0]) + ".shift()"; }
          return held(a[0]) + ".splice(" + a[1] + ", 1)[0]";
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
        newlist: function (a) {
          var fill = a[a.length - 1], sizes = a.slice(0, -1);
          var made = "Array(" + sizes[sizes.length - 1] + ").fill(" + fill + ")";
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
        min: function (a, k) { return k.length === 1 && isListKind(k[0]) ? "Math.min(..." + a[0] + ")" : "Math.min(" + a.join(", ") + ")"; },
        max: function (a, k) { return k.length === 1 && isListKind(k[0]) ? "Math.max(..." + a[0] + ")" : "Math.max(" + a.join(", ") + ")"; },
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
    var one = orderedBy(node, w);
    if (one && one.params.length === 2) {
      w.need("functools");
      if (one.gives === "bool") { return "functools.cmp_to_key(lambda a, b: -1 if " + code + "(a, b) else 1)"; }
      return "functools.cmp_to_key(" + code + ")";
    }
    return code;
  }
  function jsOrder(code, node, w, kind) {
    var one = orderedBy(node, w);
    if (one && one.params.length === 2) {
      return one.gives === "bool" ? "(a, b) => (" + code + "(a, b) ? -1 : 1)" : code;
    }
    if (code) {
      var by = held(code);
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
    newRecord: function (kind, w) { return "new " + w.recName(kind) + "()"; },
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
      if (kind === "text") { src = held(src) + '.split("")'; }
      else if (kind === "any") { src = "(List<?>) " + held(src); }
      else if (isTableKind(kind)) { src = held(src) + ".keySet()"; }
      var type = w.typeOf(elem || "real");
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
      w.line(deep, "static class Record {");
      w.line(deep + 1, 'String kindName = "Record";');
      Object.keys(fields).forEach(function (low) {
        w.line(deep + 1, w.typeOf(fields[low].kind) + " " + w.fieldName(fields[low].name) + ";");
      });
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
        w.line(deep + 1, w.recName(kind) + '() { kindName = "' + kind + '"; }');
        w.line(deep, "}");
      });
    },
    nullValue: "null",
    anyType: "Object",
    anyNum: function (code) { return "((Number) " + code + ").doubleValue()"; },
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
        w.need("filled");
        var fill = a[a.length - 1], sizes = a.slice(0, -1);
        if (k[k.length - 1] === "int" && elemOf(builtKind("newlist", k)) === "real") { fill = this.widen(fill); }
        return "filled(" + fill + ", " + sizes.map(function (n, i) {
          return k[i] === "real" ? "(int) " + held(n) : n;
        }).join(", ") + ")";
      },
      get: function (a, k) {
        if (isTableKind(k[0])) { return javaUnbox(held(a[0]) + ".getOrDefault(" + a[1] + ", " + (a[2] || "null") + ")", tableValue(k[0])); }
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
      padleft: function (a) { return 'String.format("%' + a[1] + 's", ' + a[0] + ")" + (a[2] && a[2] !== '" "' ? '.replace(" ", ' + a[2] + ")" : ""); },
      padright: function (a) { return 'String.format("%-' + a[1] + 's", ' + a[0] + ")" + (a[2] && a[2] !== '" "' ? '.replace(" ", ' + a[2] + ")" : ""); },
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
      filled: ["    // Lists of lists, as many as the sizes say, every place holding `fill`.",
               "    @SuppressWarnings(\"unchecked\")",
               "    static <T> T filled(Object fill, int... sizes) { return (T) filledFrom(fill, sizes, 0); }",
               "    static Object filledFrom(Object fill, int[] sizes, int at) {",
               "        if (at == sizes.length) { return fill instanceof List ? new ArrayList<>((List<?>) fill) : fill; }",
               "        ArrayList<Object> out = new ArrayList<>();",
               "        for (int i = 0; i < sizes[at]; i++) { out.add(filledFrom(fill, sizes, at + 1)); }",
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
      return one.gives === "bool" ? "(a_, b_) -> " + f + "(a_, b_) ? -1 : 1"
                                  : "(a_, b_) -> (int) Math.signum(" + f + "(a_, b_))";
    }
    var key = w.keyFn(node, elem);
    w.need("orderOf");
    if (key) { return "(a_, b_) -> orderOf(" + key("a_") + ", " + key("b_") + ")"; }
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
    newRecord: function (kind, w) { return "new " + w.recName(kind) + "()"; },
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
      var type = w.typeOf(elem || "real");
      if (entry && !entry.perLoop) {
        w.line(deep, "foreach (" + type + " " + w.spelled(entry) + "_ in " + src + ") {");
        w.line(deep + 1, w.named(item["var"]) + " = " + w.spelled(entry) + "_;");
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
        w.line(deep + 1, "public " + w.recName(kind) + '() { KindName = "' + kind + '"; }');
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
    lists: {
      length: function (a, k) { return held(a[0]) + (k[0] === "text" ? ".Length" : ".Count"); },
      append: function (a) { return held(a[0]) + ".Add(" + a[1] + ")"; },
      insert: function (a) { return held(a[0]) + ".Insert(" + a[1] + ", " + a[2] + ")"; },
      remove: function (a) { return held(a[0]) + ".Remove(" + a[1] + ")"; },
      pop: function (a, k, w) { w.need("popAt"); return "PopAt(" + a[0] + (a[1] ? ", " + a[1] : "") + ")"; },
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
        var made = "Enumerable.Repeat(" + fill + ", " + sizes[sizes.length - 1] + ").ToList()";
        for (var d = sizes.length - 2; d >= 0; d--) { made = "Enumerable.Range(0, " + sizes[d] + ").Select(n_ => " + made + ").ToList()"; }
        return made;
      },
      get: function (a, k, w) {
        var none = a[2] || "default(" + w.typeOf(elemOf(k[0]) || "real") + ")";
        if (isTableKind(k[0])) { return "(" + held(a[0]) + ".ContainsKey(" + a[1] + ") ? " + held(a[0]) + "[" + a[1] + "] : " + none + ")"; }
        return "(" + a[1] + " >= 0 && " + a[1] + " < " + held(a[0]) + ".Count ? " + held(a[0]) + "[" + a[1] + "] : " + none + ")";
      },
      clear: function (a) { return held(a[0]) + ".Clear()"; },
      extend: function (a) { return held(a[0]) + ".AddRange(" + a[1] + ")"; },
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
      return one.gives === "bool" ? "(a_, b_) => " + f + "(a_, b_) ? -1 : 1"
                                  : "(a_, b_) => Math.Sign(" + f + "(a_, b_))";
    }
    var key = w.keyFn(node, elem);
    w.need("orderOf");
    if (key) { return "(a_, b_) => OrderOf(" + key("a_") + ", " + key("b_") + ")"; }
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
    newRecord: function (kind, w) { return "new " + w.recName(kind) + "()"; },
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
      var entry = w.entry(item["var"]), elem = kind === "text" ? "text" : isTableKind(kind) ? tableKey(kind) : elemOf(kind);
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
        w.line(1, w.recName(kind) + '() { kindName = "' + kind + '"; }');
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
      pop: function (a, k, w) { w.need("popAt"); return "popAt(" + a[0] + (a[1] ? ", " + a[1] : "") + ")"; },
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
        for (var e = sizes.length - 1; e >= 0; e--) { made = types[e] + "(" + sizes[e] + ", " + made + ")"; }
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
      popAt: { wants: ["vector"], lines: ["template <typename T> static T popAt(std::vector<T>& items, int at = -1) {",
               "    if (at < 0) { at = (int)items.size() - 1; }", "    T got = items[at];",
               "    items.erase(items.begin() + at);", "    return got;", "}"] },
      indexOf: { wants: ["vector", "algorithm"], lines: ["template <typename T> static int indexOf(const std::vector<T>& items, const T& x) {",
                 "    auto at = std::find(items.begin(), items.end(), x);",
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
    return "[](auto a_, auto b_) { return " + held(code) + "(a_) < " + held(code) + "(b_); }";
  }

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
  LIST_WORK.java.keptToo = "sizeOf orderOf listPlus Record kindName sortIn reverseIn ArrayList LinkedHashMap LinkedHashSet Arrays Collections List Map Comparator " +
                           "Object StringBuilder shown joined filled filledFrom tableOf sortedList " +
                           "reversedList shuffledList itemsOf isNumber java";
  LIST_WORK.java.lambda = function (v, body) { return v + " -> " + body; };
  LIST_WORK.java.lambdaName = "v_";
  LIST_WORK.csharp.keptToo = "OrderOf Record KindName SortIn ReverseIn dynamic List Dictionary Enumerable Shown PopAt SortedList Shuffle IsNumber System Linq";
  LIST_WORK.csharp.lambda = function (v, body) { return v + " => " + body; };
  LIST_WORK.csharp.lambdaName = "v_";
  LIST_WORK.cpp.keptToo = "listPlus kindName vector map shown shownIn popAt indexOf joined splitText chars keysOf valuesOf " +
                          "sortedList reversedCopy shuffleIn shuffledCopy repeated rangeOf textOf replaced " +
                          "trimmed allOf isNumber uniqueOf setWork padded fixedText Record INFINITY";
  LIST_WORK.cpp.lambda = function (v, body) { return "[](auto " + v + ") { return " + body + "; }"; };

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
