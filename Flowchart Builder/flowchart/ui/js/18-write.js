// ---------------------------------------------------------------------------
//  18-write.js -- the writer, which knows no language by name
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ============================================================ the writer ==
  // 18-ahead.js has read the program through and knows what every name is.
  // 18-code.js knows what each language does about it.  This walks the
  // program and asks the one about the other, a statement at a time.

  function quoted(text) {                // words, as every language here quotes them
    return '"' + String(text).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }

  // An expression, written out.  The kinds are what make it more than a
  // change of spelling: 7 / 2 is three and a half in the chart, so where
  // both sides are whole numbers a language that would make it three is
  // told not to; two Strings are compared with equals() where == would
  // compare something else; a number joined to words is made into words
  // first where the language will not do that for itself.
  function asCode(node, w) {
    var L = w.L;
    if (node.lit !== undefined) { return node.lit; }
    if (node.str !== undefined) { return quoted(node.str); }
    if (node.bool !== undefined) { return node.bool ? L.yes : L.no; }
    if (node.name) { return w.named(node.name); }
    if (node.group) { return "(" + asCode(node.group, w) + ")"; }
    if (node.unary) {
      var of = asCode(node.of, w);
      if (node.unary === "not") { return L.not + of; }
      // - -x, not --x: the second of those takes one away from x.
      return node.unary + (of.charAt(0) === node.unary ? "(" + of + ")" : of);
    }
    if (node.call) { return w.calling(node); }

    var op = node.op;
    var a = asCode(node.left, w), b = asCode(node.right, w);
    var ka = w.kind(node.left), kb = w.kind(node.right);
    var whole = ka === "int" && kb === "int";
    var words = ka === "text" || kb === "text";
    // `not x = 9` is (not x) = 9 to the runner and not (x = 9) to Python.
    if (L.not === "not ") {
      if (node.left.unary === "not") { a = "(" + a + ")"; }
      if (node.right.unary === "not") { b = "(" + b + ")"; }
    }
    switch (op) {
      case "^":
        // 2 ^ 2 ^ 3 is sixty-four to the runner, which works from the left;
        // ** works from the right and makes it two hundred and fifty-six.
        // And -a ** 2 is not the square of minus a anywhere: in Python it
        // is minus the square, and in JavaScript it is a syntax error.
        if (!L.pow) { return L.power(a, b, whole, w); }
        return ((node.left.unary || node.left.op === "^") ? "(" + a + ")" : a) +
               " " + L.pow + " " + b;
      case "/":
        return (whole && L.over) ? L.over(a, b, w) : a + " / " + b;
      case "div":
        return L.into(a, b, whole, w);
      case "mod": case "%":
        return (!whole && L.rest && (ka === "real" || kb === "real"))
               ? L.rest(a, b, w) : a + " " + L.mod + " " + b;
      case "=": case "==": case "!=": case "<>":
        var differ = op === "!=" || op === "<>";
        if (words && L.alike) { return L.alike(a, b, differ); }
        return a + " " + (differ ? L.ne : L.eq) + " " + b;
      case "<": case "<=": case ">": case ">=":
        if (words && L.ordered) { return L.ordered(a, op, b); }
        return a + " " + op + " " + b;
      case "+":
        if (words && L.worded) {
          if (ka !== "text") { a = L.worded(a); }
          if (kb !== "text") { b = L.worded(b); }
        }
        if (words && L.words && node.left.str !== undefined &&
            (node.right.str !== undefined || kb !== "text")) { a = L.words(a); }
        return a + " + " + b;
      case "and": case "&&": return a + " " + L.and + " " + b;
      case "or": case "||": return a + " " + L.or + " " + b;
      default: return a + " " + op + " " + b;
    }
  }

  // The bits of a Display, joined up.  A piece that is itself words joined
  // with a plus -- Display "Total: " + total -- is taken apart into its
  // pieces first, so that it is written the way the comma form is.  Whether
  // a bit is money can depend on the bit before it -- the sign in
  // "Total: $" is what says so -- which is why the text is gathered as it
  // goes.
  function saying(parts, w) {
    var L = w.L, said = "", nodes = [];
    function apart(node) {
      if (node.op === "+" && w.kind(node) === "text") {
        apart(node.left); apart(node.right);
      } else { nodes.push(node); }
    }
    pieces(parts || "").forEach(function (bit) { apart(tree(bit)); });
    var bits = nodes.map(function (node) {
      var kind = w.kind(node), number = kind === "int" || kind === "real";
      var one = { code: asCode(node, w), kind: kind, text: node.str !== undefined,
                  loose: !!node.op && RANK[node.op] <= 5,
                  cash: number && (w.cash(node) || R_CASH_SIGN.test(said)) };
      said += node.str !== undefined ? node.str : "0";
      return one;
    });
    return bits.length ? L.join(bits, w) : '""';
  }

  // The names that would shadow something a class-shaped file is built on.
  var R_TAKEN_FILE = /^(Math|String|System|Scanner|Console|Random|Object|Integer|Double|Boolean|Environment)$/;

  // The same program, in one file or in several.  `apart` asks for several,
  // and gets them where the language knows how and the program has anything
  // to split -- a chart with no modules in it is one chart and one file.
  // What comes back is always a list, because one file is a list of one and
  // everything downstream would rather not be asked which it has.
  function written(lang, apart) {
    var L = LANGS[lang], out = [];
    var prog = studied(AST);
    var name = (el("#f-title").value || "").replace(/[^A-Za-z0-9]/g, "") || "Program";
    // A class cannot be called 2ndTry, or for, or Math.
    if (/^[0-9]/.test(name) || L.kept[name] || L.kept[name.toLowerCase()]) {
      name = "Program" + name;
    }
    if (R_TAKEN_FILE.test(name)) { name += "Program"; }
    if (L.named) { name = L.named(name); }

    // Which built-ins the program calls, for the names that are only in the
    // way if it does.
    var used = Object.create(null);
    prog.scopes.forEach(function (scope) {
      eachStep(scope.items, function (item) {
        var trees = sumsOf(item).map(tree);
        if (item.op === "call") { trees.push(callOf(item)); }
        trees.forEach(function (node) {
          eachCall(node, function (call) { used[lowered(call.call)] = true; });
        });
      });
    });

    // Where the program is written out in several files, the names of
    // those files are names too: `import shared` puts `shared` into the
    // file, and a variable of the program spelled shared would be standing
    // exactly where the file has to be.  Filled in below, once the files
    // have been named, and left empty for one file and for the languages
    // whose files do not bring a name in with them.
    //
    // A module is the one thing a file cannot be in the way of -- the file
    // is named after the module, and nothing imports itself.  The file
    // holding what the program shares is another matter: a module called
    // shared would be a `def shared` in a file that has just said `import
    // shared`.  So that one is marked apart from the rest.
    var homes = Object.create(null);

    function safe(said, mine) {          // a name this language will accept
      var soft = L.soft && holds(L.soft, said) && used[L.soft[said]];
      var home = mine ? homes[said] === "shared" : !!homes[said];
      return (L.kept[said] || soft || home) ? said + "_" : said;
    }

    var w = {
      L: L,
      prog: prog,
      mods: prog.mods,
      file: name,
      title: el("#f-title").value || TXT.untitled,
      needs: {},                         // what the top of the file must bring
      scope: prog.main,                  // the chart being written
      where: null,                       //   and the module it is, if it is one
      boxes: {},
      // Put in front of whatever is written next, and put back straight
      // afterwards.  It is how a class-shaped file marks the few lines that
      // are fields of the class rather than statements inside a method,
      // without the writer itself having to know what a field is.
      infront: "",

      // ---- which file this is, where there is more than one --------------
      // Written out in several files, a name the whole program shares is
      // written down in one of them and read from the rest, so the rest
      // have to say where they are reading it from: shared.total,
      // Shared.total.  `reach` is that much, put in front of a shared name
      // while a file that does not hold it is being written, and nothing at
      // all the rest of the time -- which is why one file goes on coming
      // out exactly as it always did.
      apart: false,                      // several files, not one
      reach: "",                         //   and how this one reaches them
      files: null,                       //   and what each module's is called
      sharedFile: "",                    //   and what the one holding them is
      need: function (what) { w.needs[what] = true; },
      line: function (deep, text) {
        out.push(text === "" ? "" : L.tab.repeat(deep) + w.infront + text);
      },
      count: function () { return out.length; },
      unline: function () { out.pop(); },
      // Written now, put in later: the top of a file depends on what the
      // rest of it turned out to need.
      aside: function (fn) {
        var keep = out;
        out = [];
        fn();
        var got = out;
        out = keep;
        return got;
      },
      pour: function (lines) { lines.forEach(function (row) { out.push(row); }); },

      // ---- names ---------------------------------------------------------
      entry: function (who) { return lookUp(w.scope, bareName(who)); },
      spelled: function (entry) { return safe(entry.name); },
      named: function (who) {            // a name, as this chart knows it
        var entry = lookUp(w.scope, who);
        if (!entry) { return safe(who); }
        var boxed = entry.param && w.boxes[lowered(entry.name)];
        return (entry.shared ? w.reach : "") + safe(entry.name) +
               (boxed ? "[0]" : "");
      },
      called: function (one) { return safe(one.name, true); },
      // What goes in front of a module's name where it is *called*.  In one
      // file, nothing: it is written a few lines further up.  In several,
      // it is wherever its own file puts it, which each language answers
      // for itself -- Java reaches it through the class, Python and
      // JavaScript through the module they imported it as, C++ not at all
      // because the include has already brought the name itself in.
      //
      // A module calling itself is calling something written a few lines
      // above it in its own file, so it is named the way it always was.
      // Reached through the file it lives in instead, `fact` inside fact.py
      // would be the module rather than the def, and Python would say so.
      reachMod: function (one) {
        if (!w.apart || !L.reachMod || one === w.where) { return ""; }
        return L.reachMod(w, one);
      },
      // What this module's file is called, without the ending.
      fileOf: function (one) {
        return (w.files && w.files[lowered(one.name)]) || safe(one.name, true);
      },

      // Everything the whole program shares, and what it starts off as: the
      // Constants and Declares written above the charts, in the order they
      // were written, and then the names nobody declared anywhere that more
      // than one chart uses.  A file of its own is made out of these, so
      // each language asks for the list rather than walking main itself
      // looking for the lines that are not main's.
      sharing: function () {
        var seen = Object.create(null), list = [];
        prog.main.items.forEach(function (item) {
          if (item.scope !== "global" || item.op !== "declare") { return; }
          var entry = lookUp(prog.shared, bareName(item.var));
          if (!entry || seen[lowered(entry.name)]) { return; }
          seen[lowered(entry.name)] = true;
          list.push({ entry: entry, name: safe(entry.name), fixed: !!item.const,
                      plain: isLiteral(tree(item.expr || "0")),
                      code: item.expr ? w.fitted(item.expr, entry.kind)
                                      : w.zero(entry.kind) });
        });
        Object.keys(prog.shared.names).forEach(function (low) {
          var entry = prog.shared.names[low];
          if (seen[low] || entry.param) { return; }
          list.push({ entry: entry, name: safe(entry.name), fixed: false,
                      plain: true, code: w.zero(entry.kind) });
        });
        return list;
      },
      // Main's own statements: what happens inside main, as against the
      // Constants and Declares written above every chart, which belong to
      // the program rather than to main and go in the shared file.
      mains: function () {
        return prog.main.items.filter(function (item) {
          return !(item.scope === "global" && item.op === "declare");
        });
      },
      // Does this chart touch a name the whole program shares?  A file that
      // does has to bring in the file that holds them.
      touching: function (scope, items) {
        var found = false;
        eachStep(items || [], function (item) {
          if (found) { return; }
          wordsOf(item, prog).forEach(function (low) {
            var entry = lookUp(scope, low);
            if (entry && entry.shared) { found = true; }
          });
        });
        return found;
      },
      // A file of its own starts with nothing brought into it: what goes at
      // the top of one is what the rest of that one turned out to want, not
      // what some other file wanted.
      alone: function () { w.needs = {}; },
      // Which modules these statements call, each named once and in the
      // order they are first called.  It is what a file of its own has to
      // say it is bringing in.  `mine` is the module being written, which
      // is in the file already and so is never brought into it.
      leaning: function (items, mine) {
        var list = [], seen = Object.create(null);
        function look(node) {
          if (!node) { return; }
          eachCall(node, function (call) {
            var who = prog.byName[lowered(call.call)];
            if (!who || who === mine || seen[lowered(who.name)]) { return; }
            seen[lowered(who.name)] = true;
            list.push(who);
          });
        }
        eachStep(items || [], function (item) {
          sumsOf(item).forEach(function (src) { look(tree(src)); });
          if (item.op === "call") { look(callOf(item)); }
        });
        return list;
      },
      kind: function (node) { return kindIn(node, w.scope, prog); },
      // The same question the runner asks: does this work out to money?
      // Declared Currency, or named in something that was.
      cash: function (node) {
        var found = false;
        (function look(n) {
          if (!n || found) { return; }
          var entry = n.name ? lookUp(w.scope, n.name) : null;
          if (entry && entry.cash) { found = true; }
          look(n.group); look(n.of); look(n.left); look(n.right);
          (n.args || []).forEach(look);
        })(node);
        return found;
      },

      // ---- expressions ---------------------------------------------------
      write: function (node) { return asCode(node, w); },
      code: function (src) { return asCode(tree(src), w); },
      // What goes into a whole-number name has to be a whole number, in the
      // languages that check.  Two whole numbers divided is the one case
      // that needs nothing doing: left alone, it already is one.
      fitted: function (src, into) {
        var node = tree(src);
        if (!L.narrow || into !== "int" || w.kind(node) !== "real") {
          return asCode(node, w);
        }
        if (node.op === "/" && w.kind(node.left) === "int" &&
            w.kind(node.right) === "int") {
          return asCode(node.left, w) + " / " + asCode(node.right, w);
        }
        return L.narrow(asCode(node, w));
      },
      // A test.  `While n` is fine by the runner, and by Python; the typed
      // languages want to be told that what is meant is "while n is not 0".
      tested: function (src) {
        var node = tree(src), code = asCode(node, w), kind = w.kind(node);
        return (L.kinds && (kind === "int" || kind === "real"))
               ? held(code) + " " + L.ne + " 0" : code;
      },

      // ---- calls ---------------------------------------------------------
      // How a module is going to give back what it was handed by reference:
      //   own   the language has references, and says so itself
      //   back  it returns them, and the call puts them where they came from
      //   box   they go in and come out in a one-slot array each
      //   ""    nothing is handed by reference, or nothing can be done
      plan: function (one) {
        if (!one.refs.length) { return ""; }
        if (L.refs === "own") { return "own"; }
        if (!one.answers && (L.refs === "back" || one.refs.length === 1)) { return "back"; }
        return L.refs === "box" ? "box" : "";
      },
      // One thing handed to a module, as the module needs it handed.
      handed: function (one, i, node) {
        var p = one.params[i], code = asCode(node, w);
        if (!p) { return code; }
        var how = p.ref ? w.plan(one) : "";
        if (how === "own" && node.name) { return L.refArg(code); }
        if (how === "box") { return L.boxArg(code, p.entry.kind); }
        if (L.narrow && p.entry.kind === "int" && w.kind(node) === "real") {
          return L.narrow(code);
        }
        return code;
      },
      calling: function (node) {         // a call in the middle of a sum
        var low = lowered(node.call), one = prog.byName[low];
        if (one) {
          return w.reachMod(one) + w.called(one) + "(" +
                 node.args.map(function (arg, i) {
                   return w.handed(one, i, arg);
                 }).join(", ") + ")";
        }
        var codes = node.args.map(function (arg) { return asCode(arg, w); });
        var kinds = node.args.map(function (arg) { return w.kind(arg); });
        if (holds(BUILT_KIND, low) && L.calls[low] && codes.length) {
          // Rounding a whole number is the whole number, and some of these
          // languages cannot decide which Round was meant if asked.
          if (/^(round|floor|ceiling|ceil|int|integer)$/.test(low) && kinds[0] === "int") {
            return codes[0];
          }
          return L.calls[low].call(L, codes, kinds, w);
        }
        if (low === "random" && L.calls.random) { return L.calls.random.call(L, [], [], w); }
        return safe(node.call) + "(" + codes.join(", ") + ")";
      },

      // ---- a module's first line -----------------------------------------
      signature: function (one) {
        var how = w.plan(one);
        return one.params.map(function (p) {
          return L.param(w, p, p.ref && (how === "own" || how === "box") ? how : "");
        }).join(", ");
      },
      // A Module returns nothing and a Function returns something.  The
      // fallback used to be the same "double" a plain variable gets, so
      // every Module came out `static double greet(...)` with a bare
      // `return;` in it -- which is not Java, and will not compile.
      returns: function (one) {
        if (!L.kinds) { return ""; }
        if (w.plan(one) === "back") { return L.kinds[one.refs[0].entry.kind]; }
        return one.gives ? L.kinds[one.gives] : "void";
      },

      zero: function (kind) {            // what a name holds before it is given anything
        return kind === "text" ? '""' : kind === "bool" ? L.no : "0";
      },
      // The names the whole program shares that nobody declared.
      sharedLines: function (deep) {
        if (!L.hoists) { return; }
        Object.keys(prog.shared.names).forEach(function (low) {
          var entry = prog.shared.names[low];
          if (entry.hoist) {
            w.line(deep, L.declare(w, entry, w.zero(entry.kind), false, true) + L.semi);
          }
        });
      },

      // ---- one chart: main's statements, or a module's -------------------
      inside: function (one, deep, items) {
        var wasScope = w.scope, wasWhere = w.where, wasBoxes = w.boxes;
        w.scope = one ? one.scope : prog.main;
        w.where = one || null;
        w.boxes = {};
        items = items || w.scope.items;
        var how = one ? w.plan(one) : "";
        if (how === "box") {
          one.refs.forEach(function (p) { w.boxes[lowered(p.name)] = true; });
        }
        var started = out.length;
        if (one && one.refs.length && !how) {
          w.line(deep, L.note + one.refs.map(function (p) { return p.name; }).join(", ") +
                 ": handed over by value here -- " + L.name +
                 " cannot give it back as well as an answer");
        }
        // Python's `global`, where a module writes to a name the whole
        // program shares.  Split into files there is no such name here to
        // say it about: what is shared is an attribute of the file that
        // holds it, and setting one of those never made a local anyway.
        if (one && L.shares && !w.apart) {
          var mine = [];
          eachStep(items, function (item) {
            targetsOf(item, prog).forEach(function (who) {
              var entry = lookUp(w.scope, who);
              if (entry && entry.shared && mine.indexOf(safe(entry.name)) < 0) {
                mine.push(safe(entry.name));
              }
            });
          });
          if (mine.length) { w.line(deep, L.shares(mine)); }
        }
        if (L.hoists) {
          Object.keys(w.scope.names).forEach(function (low) {
            var entry = w.scope.names[low];
            if (entry.hoist) {
              w.line(deep, L.declare(w, entry, w.zero(entry.kind), false, true) + L.semi);
            }
          });
        }
        var tail = "";
        if (how === "back" && !w.leaves(items)) {
          tail = "return " + L.handBack(one.refs.map(function (p) {
            return w.named(p.name);
          }));
        } else if (one && one.gives && L.kinds && !w.leaves(items)) {
          // A Function that can reach its end without returning anything
          // does not compile.  The runner hands back nothing at all there.
          tail = "return " + w.zero(one.gives);
        }
        w.block(items, deep, !!tail || out.length > started);
        if (tail) { w.line(deep, tail + L.semi); }
        w.scope = wasScope; w.where = wasWhere; w.boxes = wasBoxes;
      },

      // Does this run of statements always leave, so that nothing written
      // after it could ever be reached?  An End inside a module stops the
      // program without being a `return`, so it does not count there.
      leaves: function (items) {
        var last = (items || [])[(items || []).length - 1];
        if (!last) { return false; }
        if (last.op === "end") { return !w.where; }
        if (last.op === "return") { return true; }
        if (last.op === "if") {
          return w.leaves(last.then) && w.leaves(last["else"] || []);
        }
        if (last.op === "select") {
          return last.cases.some(function (one) {
                   return OTHERWISE.test(String(one.match || "").trim());
                 }) && last.cases.every(function (one) { return w.leaves(one.body); });
        }
        return false;
      },

      block: function (items, deep, quietly) {
        var started = out.length;
        for (var i = 0; i < (items || []).length; i++) {
          w.before = i ? items[i - 1] : null;  // what an Input may take as its question
          each(items[i], deep);
          // Whatever follows a Return can never run, and Java will not
          // compile a line that can never run.
          if (items[i].op === "return" || items[i].op === "end") { break; }
        }
        // A block with nothing in it -- or nothing but a remark -- is not a
        // block at all in Python, and wants saying so in the others.
        var real = out.slice(started).some(function (row) {
          return row.trim() && row.trim().indexOf(L.note.trim()) !== 0;
        });
        if (!real && !quietly) { w.line(deep, L.nothing); }
      },
      each: function (item, deep) { each(item, deep); },

      // A Select Case as a chain of ifs, for the languages and the cases a
      // switch will not take.
      chain: function (item, deep) {
        var subject = tree(item.expr), rest = null, other = null;
        item.cases.forEach(function (one) {
          if (OTHERWISE.test(String(one.match || "").trim())) { other = one; }
        });
        var tests = item.cases.filter(function (one) { return one !== other; });
        if (!tests.length) {
          if (other) { w.block(other.body, deep, true); }
          return;
        }
        for (var i = tests.length - 1; i >= 0; i--) {
          rest = { op: "if", chained: i > 0,
                   test: { op: "=", left: subject, right: tree(tests[i].match) },
                   then: tests[i].body,
                   "else": rest ? [rest] : (other ? other.body : []) };
        }
        each(rest, deep);
      }
    };

    function shut(deep) { if (L.shut) { w.line(deep, L.shut); } }

    // An If, and whatever answers it.  An "Else If" in the pseudocode is
    // another answer to the same question, not a fresh question inside the
    // Else -- so it is written as one: elif, else if.  It used to open a
    // whole new block for each, and a five-way grade check came out indented
    // five deep, which is nobody's idea of the code they meant to write.  An
    // If that really is inside an Else still nests, because it really is.
    function question(item, deep, open) {
      open(L.test(item.test ? asCode(item.test, w) : w.tested(item.cond)) + L.open);
      w.block(item.then, deep + 1);
      var other = item["else"] || [];
      if (!other.length) { shut(deep); return; }
      if (other.length === 1 && other[0].op === "if" && other[0].chained) {
        question(other[0], deep, function (rest) {
          L.chain(w, deep, L.elseIf + rest);
        });
        return;
      }
      L.chain(w, deep, "else" + L.open);
      w.block(other, deep + 1);
      shut(deep);
    }

    // A Call.  Most are a line; one that hands something over by reference
    // may need the answer putting back where it came from afterwards.
    function call(item, deep) {
      var one = prog.byName[lowered(item.name)];
      var given = pieces(item.args || "");
      var how = one ? w.plan(one) : "";
      if (how === "box") { L.boxCall(w, one, given, deep); return; }
      var code = w.calling(callOf(item));
      if (how === "back") {
        var any = false, first = null;
        var targets = one.params.map(function (p, i) {
          if (!p.ref) { return undefined; }
          var mine = R_JUST_A_NAME.test(given[i] || "") ? given[i].trim() : "";
          if (mine) { any = true; first = first || { mine: w.entry(mine), p: p }; }
          return mine ? w.named(mine) : null;
        }).filter(function (t) { return t !== undefined; });
        if (any) {
          if (L.narrow && targets.length === 1 && first.mine &&
              first.mine.kind === "int" && first.p.entry.kind === "real") {
            code = L.narrow(code);
          }
          code = L.takeBack(targets) + " = " + code;
        }
      }
      w.line(deep, code + L.semi);
    }

    function each(item, deep) {
      var entry, code;
      switch (item.op) {
        case "declare":
          entry = lookUp(item.scope === "global" ? prog.shared : w.scope, item.var);
          code = item.expr ? w.fitted(item.expr, entry.kind) : w.zero(entry.kind);
          if (L.hoists && entry.hoist) {
            // Declared already, at the top of the chart.  What is left of a
            // Declare then is what it starts the name off as -- which only
            // matters where it said, or where it is gone round again.
            var spot = entry.spots.filter(function (s) { return s.item === item; })[0];
            if (item.expr || (spot && spot.deep > 0)) {
              w.line(deep, w.named(item.var) + " = " + code + L.semi);
            }
            break;
          }
          w.line(deep, L.declare(w, entry, code, !!item.const,
                                 isLiteral(tree(item.expr || "0"))) + L.semi);
          break;
        case "set":
          entry = w.entry(item.var);
          code = w.fitted(item.expr, entry ? entry.kind : "");
          if (L.hoists && entry && entry.born === item) {
            w.line(deep, L.declare(w, entry, code, false, false) + L.semi);
          } else {
            w.line(deep, w.named(bareName(item.var)) +
                   String(item.var).slice(bareName(item.var).length).trim() +
                   " = " + code + L.semi);
          }
          break;
        case "display":
          w.line(deep, L.say(saying(item.parts, w)) + L.semi);
          break;
        case "input":
          entry = R_JUST_A_NAME.test(item.var || "") ? w.entry(item.var) : null;
          if (!entry) { w.line(deep, L.note + item.text); break; }
          // The runner puts a box on the tape to type into.  The program on
          // its own used to ask for nothing out loud at all: run in a
          // terminal it printed not a word and sat there waiting, which
          // looks exactly like a program that never started.  A Display just
          // before is already the question; without one it asks by name, as
          // the box does.  Some languages ask inside the read itself --
          // input("Enter n: ") -- and the rest print the question first.
          var asking = w.before && w.before.op === "display" ? ""
                     : quoted(say("code_ask", { name: item.var.trim() }));
          if (asking && L.hint) {
            w.line(deep, L.hint(asking) + L.semi);
            asking = "";
          }
          code = L.ask(entry.kind === "int" ? "whole" : entry.kind === "real" ? "real"
                     : entry.kind === "bool" ? "flag" : "text", w, asking);
          if (L.hoists && entry.born === item) {
            w.line(deep, L.declare(w, entry, code, false, false) + L.semi);
          } else {
            w.line(deep, w.named(item.var.trim()) + " = " + code + L.semi);
          }
          break;
        case "wait":
          // The chart can be run at the program's own timing, so the code
          // written from it waits too -- the promise everywhere else here
          // is that what you read is what you just watched.
          if (L.pause) { L.pause(w, item, deep); }
          else { w.line(deep, L.note + item.text); }
          break;
        case "call": call(item, deep); break;
        case "return":
          // Main has nothing to return to: leaving it is ending the program.
          if (!w.where) { w.line(deep, L.quit(w, true) + L.semi); break; }
          if (w.plan(w.where) === "back") {
            code = " " + L.handBack(w.where.refs.map(function (p) { return w.named(p.name); }));
          } else if (item.expr) {
            code = " " + w.fitted(item.expr, w.where.gives);
          } else {
            code = (w.where.gives && L.kinds) ? " " + w.zero(w.where.gives) : "";
          }
          w.line(deep, "return" + code + L.semi);
          break;
        case "end":
          w.line(deep, L.quit(w, !w.where) + L.semi);
          break;
        case "if":
          question(item, deep, function (rest) { w.line(deep, "if " + rest); });
          break;
        case "while":
          if (!item.cond) { w.line(deep, L.note + item.text); break; }
          code = item.until ? L.not + "(" + w.code(item.cond) + ")" : w.tested(item.cond);
          w.line(deep, "while " + L.test(code) + L.open);
          w.block(item.body, deep + 1);
          shut(deep);
          break;
        case "dowhile": L.repeat(w, item, deep); break;
        case "for": L.count(w, item, deep); break;
        case "select": L.pick(w, item, deep); break;
        case "start": break;
        default:
          w.line(deep, L.note + item.text);
      }
    }

    // Several files, where there is more than one chart to put in them and
    // this language has an answer for what that looks like.  Each one comes
    // back as its own run of lines, written in w.aside so that none of them
    // lands in `out` -- which is the one file's, and is still there to fall
    // back on if the split turns out to be a split into one.
    if (apart && L.apart && prog.mods.length) {
      // What each file is called: the module's own name, spelled the way
      // this language spells the file that holds one -- and never the same
      // as another, because two names that differ only in their capitals
      // are one file on most disks, and because the main file and the
      // shared one are already called something.
      var taken = Object.create(null);
      w.sharedFile = L.fileName ? L.fileName(L.sharedName) : L.sharedName;
      taken[lowered(name)] = taken[lowered(w.sharedFile)] = true;
      w.files = Object.create(null);
      prog.mods.forEach(function (one) {
        var base = L.fileName ? L.fileName(safe(one.name)) : safe(one.name);
        var file = base, n = 2;
        while (taken[lowered(file)] || L.kept[file] || L.kept[lowered(file)] ||
               R_TAKEN_FILE.test(file)) {
          file = base + n++;
        }
        taken[lowered(file)] = true;
        w.files[lowered(one.name)] = file;
      });
      // And now that they have names, those names are taken.  Only where
      // the file's name is a name inside the program -- Python's import,
      // JavaScript's require, the class Java and C# reach through.  C++
      // includes a file without learning its name, so nothing there is in
      // anybody's way.
      if (L.reachMod) {
        homes[w.sharedFile] = "shared";
        Object.keys(w.files).forEach(function (low) {
          if (!homes[w.files[low]]) { homes[w.files[low]] = true; }
        });
      }
      w.apart = true;
      var many = L.apart(w);
      if (many.length > 1) {
        return many.map(function (one) {
          return { text: one.lines.join("\n"), file: one.name,
                   ext: one.ext || L.ext, head: one.head || "" };
        });
      }
      w.apart = false;
    }
    L.whole(w);
    return [{ text: out.join("\n"), file: name, ext: L.ext }];
  }

  // One file, which is what everything that only ever wanted one asks for --
  // the screen with a program on it, and tests/written.py, which runs what
  // this writes in every language it can find a compiler for.
  function codeFor(lang) { return written(lang, false)[0]; }
  function filesFor(lang) { return written(lang, true); }

  // The picker is the table above, so a language added there turns up in it
  // without anybody having to remember the list in the HTML as well.
  function listLanguages() {
    var pick = el("#see-code");
    if (pick) {
      Object.keys(LANGS).forEach(function (code) {
        for (var i = 0; i < pick.options.length; i++) {
          if (pick.options[i].value === code) { return; }
        }
        var one = document.createElement("option");
        one.value = code;
        one.textContent = LANGS[code].name;
        pick.appendChild(one);
      });
    }
    // The one in the bar over the code.  Pseudocode is not among them:
    // it is the thing the code was written out of, and picking it there
    // would be asking to leave rather than to change languages.
    var bar = el("#tape-lang");
    if (bar && !bar.options.length) {
      Object.keys(LANGS).forEach(function (code) {
        var one = document.createElement("option");
        one.value = code;
        one.textContent = LANGS[code].name;
        bar.appendChild(one);
      });
      bar.onchange = function () {
        showCode(bar.value);
      };
    }
  }
  listLanguages();

  function langName(lang) {              // Python, C# -- as the table says it
    return (LANGS[lang] || {}).name || lang;
  }

  // Whether the program is being asked for as one file or as a file for
  // each chart.  The card in the panel is where that is said, and it is
  // said once: changing the language in the bar over the code, or coming
  // in from the run, keeps whichever was asked for.
  function wantsApart() {
    var pick = el("#code-apart");
    return !!(pick && pick.value === "apart");
  }

  // A program of one chart has nothing to cut up, and says so under the
  // card rather than quietly handing the one file back as though what was
  // asked for had happened.
  function codeNote() {
    var says = el("#code-note");
    if (!says) { return; }
    says.textContent = wantsApart() && AST && !(AST.modules || []).length
                     ? TXT.c_one_chart : "";
  }

  // The way in from the run, where there is no card to read: it shows
  // whatever the card was left set to, and the picker in the bar over the
  // code changes the language without going back out to it.
  function askWhichCode() {
    if (!AST || !(AST.main || []).length) {
      tapeShow("run");                   // it is said in the tape, so show it
      talkOnce(TXT.r_nothing, "bad");
      return;
    }
    showCode(nowLang());
  }

  // Which language the code is being written out in: what the bar over
  // the code says if it is up, what the card in the panel is set to
  // otherwise, and failing both the first one the table offers.
  function nowLang() {
    var bar = el("#tape-lang"), pick = el("#see-code");
    if (bar && !bar.hidden && bar.value) { return bar.value; }
    if (pick && pick.value) { return pick.value; }
    return Object.keys(LANGS)[0];
  }

  // --------------------------------------- a program, on a screen of its own --
  // Code is the thing the panel has least room for: `pre` does not wrap, so
  // a line of Java in a column that narrow is read sideways a word at a
  // time.  Asking for a program is therefore taken as asking to read it,
  // and it is put where it can be read.  Esc or Done gives the panel back.
  //
  // Two things are read on this screen: the code a chart is written out as,
  // and the pseudocode a drawing amounts to.  They are the same thing to
  // read -- a program, a line at a time -- so they are read in the same
  // place rather than on two screens that would have to be kept alike.

  // Copying, whichever way this browser has.  navigator.clipboard is only
  // there on a page served over https or from localhost: open the studio on
  // a machine's own address over http -- which is exactly what serving it
  // to the tablet in the next room looks like -- and the whole of
  // navigator.clipboard is missing, so this threw before it could even
  // reach the promise, and the button did nothing and said nothing.  The
  // old way still works everywhere, and where even that will not, the
  // button says so rather than pretending it worked.
  function copyButton(text) {
    var copy = document.createElement("button");
    copy.className = "btn small";
    copy.textContent = TXT.r_copy;
    copy.onclick = function () {
      function well() {
        copy.textContent = TXT.r_copied;
        setTimeout(function () { copy.textContent = TXT.r_copy; }, 1400);
      }
      function badly() {
        copy.textContent = TXT.r_copy_no || TXT.r_copy;
        setTimeout(function () { copy.textContent = TXT.r_copy; }, 2200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(well, function () {
          if (!oldCopy(text)) { badly(); } else { well(); }
        });
        return;
      }
      if (oldCopy(text)) { well(); } else { badly(); }
    };
    return copy;
  }

  // A file of whatever is on the screen, named after the chart.
  function saveButton(text, named, ext) {
    var down = document.createElement("button");
    down.className = "btn small";
    down.textContent = TXT.r_save_code;
    down.onclick = function () {
      save(new Blob([text], { type: "text/plain;charset=utf-8" }),
           named + "." + ext);
    };
    return down;
  }

  // ------------------------------------------- a program, written in --
  // Putting one on the screen used to be a single statement: the whole
  // program into one element, laid out and painted in one frame.  For the
  // thirty lines a lesson is usually about, that is nothing at all.  For
  // the program a chart of ten thousand shapes writes out to, it is the
  // best part of a second in which the page answers nothing -- the scroll
  // will not move, a button pressed is not seen, the bar above it does not
  // so much as blink -- and what the person is waiting to read is the first
  // twenty lines of it.
  //
  // So it is written in instead, a slice to a frame: steadily while it is
  // still filling the part of the box somebody is reading, and then in
  // bigger armfuls once it has run off the bottom where nobody is looking.
  // No one frame does much, so the page stays alive the whole way through,
  // and the top of a long program can be read while the rest of it is still
  // arriving.  What it looks like is a program being written out, which is
  // what it is; 07-motion.css fades each slice in as it lands.
  //
  // The numbers and the lines are cut into the same slices, so the two
  // columns cannot drift apart however far down it goes.  A slice is a
  // plain span inside the `pre` the code was always in, carrying the
  // newline that joins it to the next: what is in the box is the program,
  // in one piece, cut up only in the order it was put there.  Nothing else
  // has to know it arrived in slices -- reading it back gives the program,
  // so does dragging over it and copying, and the sideways slider that
  // 24-scroll.js hangs on pre.code still finds the pre it hangs on.
  var WRITE_RATE = 110;                  // lines a second, while it is in view
  var WRITE_MOST = 400;                  // lines in one frame, once it is not
  var writing = null;                    // the one going on, if one is

  function stopWriting() {
    if (writing) { cancelAnimationFrame(writing.frame); }
    writing = null;
  }

  function slice(text) {
    var part = document.createElement("span");
    part.className = "code-part";
    part.textContent = text;
    return part;
  }

  // One slice into both columns.  Every slice but the last carries the
  // newline that joins it to the one after it.
  function writeOn(job, many) {
    var to = Math.min(job.lines.length, job.at + many);
    var numbers = [];
    for (var n = job.at; n < to; n++) { numbers.push(n + 1); }
    var tail = to < job.lines.length ? "\n" : "";
    job.nums.appendChild(slice(numbers.join("\n") + tail));
    job.code.appendChild(slice(job.lines.slice(job.at, to).join("\n") + tail));
    job.at = to;
  }

  function writeIn(nums, code, lines, room) {
    stopWriting();
    // How many lines the box can show at once, and so how much of this is
    // being read rather than poured into the dark below.  A line is as tall
    // as the stylesheet says; asked for once here rather than once a frame.
    // A box with no height to report -- one being measured before the
    // screen it is on has been laid out, in a window nobody is looking at
    // -- would say nothing is in view and pour the lot in at once.  A
    // screenful is never fewer lines than this.
    var high = parseFloat(getComputedStyle(code).lineHeight) || 22;
    var job = { nums: nums, code: code, lines: lines, at: 0, frame: 0,
                shown: Math.max(24, Math.ceil((room || 0) / high) + 2),
                took: 0, last: 0 };
    writing = job;
    function step(now) {
      if (writing !== job) { return; }
      // Written over, thrown away by a fresh build, or left behind by going
      // back to the run: whatever is being written into is not on the screen
      // any more, and the next program asked for is written out afresh.
      if (!code.isConnected || (el("#code-out") || {}).hidden) {
        writing = null;
        return;
      }
      var gap = job.last ? Math.min(0.1, (now - job.last) / 1000) : 0;
      job.last = now;
      // Told to keep still, there is nothing to watch and no reason to go
      // slowly -- but it is still cut into slices, because the point of the
      // slicing is a page that answers while it happens, not the look of it.
      var many = (STILL || job.at >= job.shown)
               ? Math.min(WRITE_MOST, Math.max(24, job.took * 2))
               : Math.max(1, Math.round(WRITE_RATE * gap));
      writeOn(job, many);
      job.took = many;
      if (job.at < lines.length) { job.frame = requestAnimationFrame(step); }
      else { writing = null; }
    }
    job.frame = requestAnimationFrame(step);
  }

  // Numbered down the side and ruled under each line, the way the
  // pseudocode box is.  The numbers are a column of their own, so a long
  // line takes the program sideways and leaves them where they are.
  function codePage(text, name, more, files) {
    var out = el("#code-out");
    if (!out) { return; }
    stopWriting();
    out.innerHTML = "";
    // The strip saying which file is showing is built again by whoever
    // wants one, so it starts empty however this page was asked for.
    var strip = el("#code-files");
    if (strip) { strip.innerHTML = ""; strip.hidden = true; }
    var page = document.createElement("div");
    page.className = "code-page";
    var nums = document.createElement("pre");
    nums.className = "code-nums";
    nums.setAttribute("aria-hidden", "true");
    var pre = document.createElement("pre");
    pre.className = "code";
    page.appendChild(nums);
    page.appendChild(pre);
    out.appendChild(page);
    var row = document.createElement("div");
    row.className = "go";
    row.style.cssText = "display:flex; gap:8px; margin-top:8px";
    // Copying and saving are handed the text, not the page, so they are
    // the whole program from the first frame -- there is nothing to wait
    // for and nothing half-written to be given.
    row.appendChild(copyButton(text));
    (more || []).forEach(function (one) { row.appendChild(one); });
    out.appendChild(row);
    tapeFull(true);
    tapeShow("code");
    var lines = text.split("\n");
    tapeSays("", name, say("code_lines", { n: lines.length }) +
             (files > 1 ? " · " + say("c_files", { n: files }) : ""));
    // The screen is up and the box has its size before the writing starts,
    // so how much of it is in view is known rather than guessed.
    writeIn(nums, pre, lines, out.clientHeight);
  }

  function chartFileName() {
    return ((el("#f-title") && el("#f-title").value) || "flowchart")
           .replace(/[^A-Za-z0-9 _-]/g, "");
  }

  // Every file of a program, in one file, because a browser will hand over
  // a file and not a folder.  19-files.js writes the zip.
  function saveAllButton(files) {
    var down = document.createElement("button");
    down.className = "btn small";
    down.textContent = TXT.c_save_all;
    down.onclick = function () {
      save(zipOf(files.map(function (one) {
        return { name: one.file + "." + one.ext, text: one.text };
      })), (chartFileName() || "flowchart") + ".zip");
    };
    return down;
  }

  // One program and the files it came out as, with one of them on the
  // screen.  All of them were written out together, so the strip above the
  // code only changes which is being read -- nothing is written again, and
  // Save them all has every one of them whichever is showing.
  //
  // One file is the same thing with the strip put away, which is what a
  // program of a single chart always gets.
  function showFiles(files, name, lang, at) {
    var one = files[at || 0], many = files.length > 1;
    // Java and C# want a file named after the class inside it; the others
    // take the chart's name -- except where the program came out as
    // several, and every one of them is named after the chart it holds.
    var more = [saveButton(one.text,
                           (many || LANGS[lang].kinds) ? one.file : chartFileName(),
                           one.ext)];
    if (many) { more.push(saveAllButton(files)); }
    codePage(one.text, name, more, many ? files.length : 0);

    var strip = el("#code-files");
    if (!strip) { return; }
    strip.hidden = !many;
    if (!many) { return; }
    files.forEach(function (each, n) {
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "code-file" + (n === (at || 0) ? " on" : "");
      tab.textContent = each.file + "." + each.ext;
      tab.onclick = function () { showFiles(files, name, lang, n); };
      strip.appendChild(tab);
    });
    // The one being read, brought into view: a program of forty files has
    // a strip wider than the screen, and picking the last of them used to
    // leave the lit tab off the end of it.
    var lit = el(".code-file.on", strip);
    if (lit && lit.scrollIntoView) {
      lit.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function showCode(want) {
    var lang = want || nowLang();
    if (!AST || !(AST.main || []).length) {
      tapeShow("run");
      talkOnce(TXT.r_nothing, "bad");
      return;
    }
    if (lang === "pseudo" || !LANGS[lang]) {
      tapeShow("run");
      talkOnce(TXT.r_pseudo_only, "note");
      return;
    }
    var made;
    try { made = wantsApart() ? filesFor(lang) : [codeFor(lang)]; }
    catch (thrown) {
      tapeShow("run");
      talkOnce(thrown.message || String(thrown), "bad");
      return;
    }
    // Into its own box, not over the top of the run.  The tape keeps what
    // the program did; this is only what it says.
    // The picker in the bar says what is under it, however the code was
    // asked for -- from the run, from the panel, or by changing it here.
    if (el("#tape-lang")) { el("#tape-lang").hidden = false; }
    if (el("#tape-lang")) { el("#tape-lang").value = lang; }
    showFiles(made, langName(lang), lang, 0);
  }

  // And the drawing, written out as the pseudocode it amounts to.
  //
  // The page has always known how to do this -- pressing Check works it
  // out, hands it over to be built into a program that can be run, and
  // throws it away.  Nobody had ever been shown it, which is a strange
  // thing to withhold: the writing is what a class is usually marked on,
  // and a chart drawn by hand is otherwise a drawing and nothing else.
  //
  // The language picker goes for this one.  What is on the screen is the
  // pseudocode itself, not one of the languages it can be turned into.
  function showHandCode() {
    var text;
    try { text = handAsPseudocode(); }
    catch (thrown) {
      handSays(thrown.message || String(thrown), true);
      return;
    }
    var more = [saveButton(text, chartFileName(), "txt")];
    if (el("#code")) {
      // The way across.  The drawing stays exactly where it is -- each way
      // of working keeps its own paper and is handed it back on returning
      // -- so this gives the writing somewhere to be edited and run
      // without taking the drawing away.  What was in the box is written
      // over, which is what the button is for and what its tooltip says.
      var into = document.createElement("button");
      into.className = "btn small primary";
      into.textContent = TXT.h_into_box;
      into.title = TXT.h_into_box_tip;
      into.onclick = function () {
        el("#code").value = text;
        tapeFull(false);
        setMode(false);
        el("#build").click();
      };
      more.unshift(into);
    }
    codePage(text, TXT.pseudocode, more);
    if (el("#tape-lang")) { el("#tape-lang").hidden = true; }
  }
