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
    return R_SIMPLE.test(String(code).trim()) ? code : "(" + code + ")";
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
    });
    opening(w).forEach(function (row) { w.line(row[0], row[1]); });
    w.pour(inside);
    w.line(0, w.L.shut);
  }

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
    typed: function (entry) { return this.kinds ? this.kinds[entry.kind] + " " : ""; },
    declare: function (w, entry, start, fixed, plain) {
      return this.lead(fixed, plain) + this.typed(entry) +
             w.spelled(entry) + " = " + start;
    },
    // What goes in front of a counter that its For declares for itself.
    head: function (w, entry) { return this.typed(entry); },
    param: function (w, p, how) {
      var type = this.typed(p.entry);
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
      test: function (code) { return code; },
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
        ["math", "random", "time"].forEach(function (lib) {
          if (w.needs[lib]) { w.line(0, "import " + lib); }
        });
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
          ["math", "random", "time"].forEach(function (lib) {
            if (w.needs[lib]) { w.line(0, "import " + lib); }
          });
          brings.forEach(function (name) { w.line(0, "import " + name); });
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
            top(one.name, brought(one.scope, one.body, one));
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
      boxArg: function (code, kind) { return "new " + this.kinds[kind] + "[] { " + code + " }"; },
      boxCall: function (w, one, given, deep) {
        var L = this, after = [];
        w.line(deep, "{");
        var args = one.params.map(function (p, i) {
          var src = String(given[i] === undefined ? "" : given[i]);
          if (!p.ref) { return w.handed(one, i, tree(src)); }
          var box = w.spelled(p.entry) + "Box";
          w.line(deep + 1, L.kinds[p.entry.kind] + "[] " + box + " = { " +
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
        classFile(w, function () {
          var top = w.needs.keys ? [[0, "import java.util.Scanner;"], [0, ""]] : [];
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
          Object.keys(w.needs).forEach(function (what) { wants[what] = true; });
          return lines;
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
          w.line(0, "class " + w.file + " {");
          w.line(1, "public static void main(String[] args) {");
          w.pour(main);
          w.line(1, L.shut);
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
            });
            w.line(0, L.note + w.title + " -- " + TXT.code_shares);
            if (wants.keys) { w.line(0, "import java.util.Scanner;"); w.line(0, ""); }
            w.line(0, "class " + w.sharedFile + " {");
            w.pour(held);
            w.line(0, L.shut);
          }) });
        }

        w.reach = w.sharedFile + ".";
        w.mods.forEach(function (one, at) {
          files.push({ name: w.fileOf(one), lines: w.aside(function () {
            w.line(0, L.note + w.title + " -- " + one.name);
            w.line(0, "class " + w.fileOf(one) + " {");
            w.pour(each[at]);
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
        classFile(w, function () {
          var top = [[0, "using System;"], [0, ""], [0, "class " + w.file + " {"]];
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
      apart: function (w) {
        var L = this, files = [], wants = {};
        function body(write) {
          w.alone();
          var lines = w.aside(write);
          Object.keys(w.needs).forEach(function (what) { wants[what] = true; });
          return lines;
        }
        function file(name, what, write) {
          files.push({ name: name, lines: w.aside(function () {
            w.line(0, L.note + w.title + (what ? " -- " + what : ""));
            w.line(0, "using System;");
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
          w.line(0, L.shut);
        });

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
        });
        if (holds.length || wants.dice) {
          file(w.sharedFile, TXT.code_shares, function () {
            w.line(0, "static class " + w.sharedFile + " {");
            w.pour(held);
            w.line(0, L.shut);
          });
        }

        w.reach = w.sharedFile + ".";
        w.mods.forEach(function (one, at) {
          file(w.fileOf(one), one.name, function () {
            w.line(0, "class " + w.fileOf(one) + " {");
            w.pour(each[at]);
            w.line(0, L.shut);
          });
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
        ["cmath", "cstdlib", "algorithm"].forEach(function (lib) {
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
          ["cmath", "cstdlib", "algorithm"].forEach(function (lib) {
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
          part(name, "h", function () {
            w.line(0, "#pragma once");
            w.line(0, "#include <string>");
            w.line(0, "");
            write();
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
                     L.kinds[one.entry.kind] + " " + one.name + ";");
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
                     L.kinds[one.entry.kind] + " " + one.name + " = " + one.code + ";");
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
            w.line(0, L.note + w.title + " -- " + one.name);
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
        Object.keys(L.helpers).forEach(function (name) {
          if (!w.needs[name]) { return; }
          w.line(0, "");
          L.helpers[name].forEach(function (row) { w.line(0, row); });
        });
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
            top(one.name, w.leaning(one.body, one), w.touching(one.scope, one.body));
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
