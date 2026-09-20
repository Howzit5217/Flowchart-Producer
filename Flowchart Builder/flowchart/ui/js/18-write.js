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

  function codeFor(lang) {
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

    function safe(said) {                // a name this language will accept
      var soft = L.soft && holds(L.soft, said) && used[L.soft[said]];
      return (L.kept[said] || soft) ? said + "_" : said;
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
        return safe(entry.name) + (boxed ? "[0]" : "");
      },
      called: function (one) { return safe(one.name); },
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
          return w.called(one) + "(" + node.args.map(function (arg, i) {
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
        if (one && L.shares) {
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
          code = L.ask(entry.kind === "int" ? "whole" : entry.kind === "real" ? "real"
                     : entry.kind === "bool" ? "flag" : "text", w);
          if (L.hoists && entry.born === item) {
            w.line(deep, L.declare(w, entry, code, false, false) + L.semi);
          } else {
            w.line(deep, w.named(item.var.trim()) + " = " + code + L.semi);
          }
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

    L.whole(w);
    return { text: out.join("\n"), file: name, ext: L.ext };
  }

  // The picker is the table above, so a language added there turns up in it
  // without anybody having to remember the list in the HTML as well.
  function listLanguages() {
    var pick = el("#r-lang");
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
        if (el("#r-lang")) { el("#r-lang").value = bar.value; }
        showCode(bar.value);
      };
    }
  }
  listLanguages();

  function langName(lang) {              // Python, C# -- as the table says it
    return (LANGS[lang] || {}).name || lang;
  }

  // Ask which language, unless the runner is already set to one.  Before
  // this, the only way to see the code was to change what the runner was set
  // to first, which is a strange thing to have to do when all you wanted was
  // the code.  Now the button always gives you it and asks if it needs to.
  function askWhichCode(where) {
    if (!AST || !(AST.main || []).length) {
      tapeShow("run");                   // it is said in the tape, so show it
      talkOnce(TXT.r_nothing, "bad");
      return;
    }
    var lang = el("#r-lang") ? el("#r-lang").value : "pseudo";
    if (lang !== "pseudo") { showCode(lang); return; }
    // The button is a switch for its own list: pressed while the list is up
    // it puts it away again, rather than shutting it and opening an
    // identical one in the same place -- which looks like nothing happened.
    if (el(".menu:not(.out)")) { closeMenu(); return; }
    var box = (where || el("#see-code")).getBoundingClientRect();
    openMenu(box.left, box.bottom + 6, Object.keys(LANGS).map(function (code) {
      return { name: LANGS[code].name, go: function () { showCode(code); } };
    }));
  }

  function showCode(want) {
    var lang = want || (el("#r-lang") ? el("#r-lang").value : "pseudo");
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
    try { made = codeFor(lang); }
    catch (thrown) {
      tapeShow("run");
      talkOnce(thrown.message || String(thrown), "bad");
      return;
    }
    var text = made.text;
    // Into its own box, not over the top of the run.  The tape keeps what
    // the program did; this is only what it says.
    // The picker in the bar says what is under it, however the code was
    // asked for -- from the run, from the panel, or by changing it here.
    if (el("#tape-lang")) { el("#tape-lang").value = lang; }
    var out = el("#code-out");
    out.innerHTML = "";
    // Numbered down the side and ruled under each line, the way the
    // pseudocode box is.  The two are the same thing to read -- a program,
    // a line at a time -- and a line of Java is longer and harder to keep
    // your place in than the pseudocode it came from, not easier.  The
    // numbers are a column of their own, so a long line takes the code
    // sideways and leaves them where they are.
    var page = document.createElement("div");
    page.className = "code-page";
    var rows = text.split("\n").length;
    var numbers = [];
    for (var n = 1; n <= rows; n++) { numbers.push(n); }
    var down = document.createElement("pre");
    down.className = "code-nums";
    down.setAttribute("aria-hidden", "true");
    down.textContent = numbers.join("\n");
    var pre = document.createElement("pre");
    pre.className = "code";
    pre.textContent = text;
    page.appendChild(down);
    page.appendChild(pre);
    out.appendChild(page);
    var row = document.createElement("div");
    row.className = "go";
    row.style.cssText = "display:flex; gap:8px; margin-top:8px";
    var copy = document.createElement("button");
    copy.className = "btn small";
    copy.textContent = TXT.r_copy;
    // Copying, whichever way this browser has.  navigator.clipboard is only
    // there on a page served over https or from localhost: open the studio
    // on a machine's own address over http -- which is exactly what serving
    // it to the tablet in the next room looks like -- and the whole of
    // navigator.clipboard is missing, so this threw before it could even
    // reach the promise, and the button did nothing and said nothing.  The
    // old way still works everywhere, and where even that will not, the
    // button says so rather than pretending it worked.
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
    var down = document.createElement("button");
    down.className = "btn small";
    down.textContent = TXT.r_save_code;
    down.onclick = function () {
      // Java and C# want the file named after the class inside it; the
      // others take the chart's name.
      var named = LANGS[lang].kinds
                ? made.file
                : (el("#f-title").value || "flowchart").replace(/[^A-Za-z0-9 _-]/g, "");
      save(new Blob([text], { type: "text/plain;charset=utf-8" }),
           named + "." + made.ext);
    };
    row.appendChild(copy);
    row.appendChild(down);
    out.appendChild(row);
    // Code is the thing the panel has least room for: `pre` does not wrap,
    // so a line of Java in a column that narrow is read sideways a word at
    // a time.  Asking for it is therefore taken as asking to read it, and
    // it is put where it can be read.  Esc or Done gives the panel back.
    tapeFull(true);
    tapeShow("code");
    tapeSays("", langName(lang),
             say("code_lines", { n: text.split("\n").length }));
  }
