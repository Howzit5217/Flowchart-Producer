// ---------------------------------------------------------------------------
//  18-ahead.js -- reading the program through before any code is written
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ===================================================== reading it ahead ==
  // Pseudocode lets a great deal go unsaid, and the runner goes along with
  // all of it: a name nobody declared, Total on one line and total on the
  // next, a whole number divided by a whole number coming to a half, a
  // Declare tucked inside an If and read from underneath it.  A real
  // language goes along with none of it.  Java wants to be told what every
  // name holds before it will compile a line; C# will not look outside the
  // braces a name was declared in; Python will not join a number to a word.
  //
  // So before anything is written the whole program is read through once,
  // and what comes out is what the writer needs to know and cannot see from
  // the line it is on: what kind of thing every name holds, which chart it
  // belongs to, how it was first spelled, and where in the code it has to
  // be declared for every line that uses it to be able to see it.
  //
  // Nothing in here knows what language is being written.

  // The same handful of expressions are read again and again: working out
  // what every name holds goes round until nothing changes, placing the
  // declarations walks the program once for each of them, and then the
  // writer walks it again for every language asked for.  Every one of
  // those passes was tokenizing and parsing the same strings from
  // scratch, which on a program of twenty thousand lines is most of what
  // the page was doing.  A tree is only ever read, never written to, so
  // one made for "total + bugs" is the one for every "total + bugs".
  //
  // Kept until there are more of them than any program has expressions,
  // and then let go of all at once: this knows nothing about which program
  // is being read, and a tree is cheap to make again.
  var TREES = null, TREE_MOST = 20000;

  function tree(src) {                   // an expression, as a little tree
    var text = String(src === undefined || src === null ? "" : src);
    if (!TREES) { TREES = new Map(); }
    var had = TREES.get(text);
    if (had) { return had; }
    var made = treeOf(text);
    if (TREES.size >= TREE_MOST) { TREES.clear(); }
    TREES.set(text, made);
    return made;
  }

  function treeOf(text) {
    var ts = tokens(text), at = 0;
    function peek() { return ts[at]; }
    function take() { return ts[at++]; }
    function primary() {
      var tok = take();
      if (!tok) { return { lit: '""' }; }
      // The figure as it was typed, not as it was read: 2.0 is a Real and
      // has to stay one, and parseFloat hands back a plain 2.
      if (tok.t === "num") { return { lit: figure(text.slice(tok.from, tok.to)) }; }
      if (tok.t === "str") { return { str: tok.v }; }
      if (tok.t === "op" && tok.v === "(") {
        var inside = expr(0);
        if (peek() && peek().v === ")") { take(); }
        return { group: inside };
      }
      if (tok.t === "op" && (tok.v === "-" || tok.v === "+")) {
        return { unary: tok.v, of: primary() };
      }
      if (tok.t === "name") {
        var low = String(tok.v).toLowerCase();
        if (low === "not") { return { unary: "not", of: primary() }; }
        if (low === "true" || low === "false") { return { bool: low === "true" }; }
        if (peek() && peek().v === "(") {
          take();
          var args = [];
          if (peek() && peek().v !== ")") {
            args.push(expr(0));
            while (peek() && peek().v === ",") { take(); args.push(expr(0)); }
          }
          if (peek() && peek().v === ")") { take(); }
          return { call: String(tok.v), args: args };
        }
        return { name: String(tok.v) };
      }
      return { lit: "0" };
    }
    function expr(least) {
      var left = primary();
      while (peek()) {
        var tok = peek();
        var op = tok.t === "op" ? tok.v : String(tok.v).toLowerCase();
        var rank = RANK[op];
        if (!rank || rank < least) { break; }
        take();
        left = { op: op, left: left, right: expr(rank + 1) };
      }
      return left;
    }
    return expr(0);
  }

  // 007 is a syntax error in Python and an octal seven in C, and .5 is
  // harder to read than it needs to be.  Neither changes what is meant.
  function figure(typed) {
    var out = String(typed).replace(/^0+(?=\d)/, "");
    return out.charAt(0) === "." ? "0" + out : out;
  }

  function holds(box, key) {             // really in it, not inherited by it
    return Object.prototype.hasOwnProperty.call(box, key);
  }

  function lowered(name) { return String(name || "").toLowerCase(); }

  // ---- the four kinds of thing a name can hold ---------------------------
  // Whole number, number, words, yes-or-no.  Every type the pseudocode can
  // say comes down to one of them, and every language here has exactly one
  // way of saying each.  Char is words: a Char given "a" is a String given
  // "a" in every language but the ones where it is a compile error.
  var KIND_OF = { integer: "int", int: "int", real: "real", float: "real",
                  double: "real", number: "real", decimal: "real",
                  currency: "real", money: "real", string: "text",
                  char: "text", boolean: "bool", bool: "bool" };

  function kindOfWord(word) {
    var low = lowered(word);
    return holds(KIND_OF, low) ? KIND_OF[low] : "";
  }

  // What each built-in hands back.  "same" is whatever it was given: the
  // larger of two whole numbers is a whole number.
  var BUILT_KIND = { sqrt: "real", abs: "same", round: "int", floor: "int",
                     ceiling: "int", ceil: "int", int: "int", integer: "int",
                     length: "int", toupper: "text", tolower: "text",
                     random: "int", pow: "same", min: "same", max: "same" };
  var R_BUILT_WORDS = /^(length|toupper|tolower)$/;

  function bothKinds(a, b) {             // two numbers met in a sum
    if (a === "real" || b === "real") { return "real"; }
    return (a === "int" && b === "int") ? "int" : "";
  }

  // ---- one statement, taken apart ---------------------------------------
  var R_JUST_A_NAME = /^\s*[A-Za-z_]\w*\s*$/;

  function bareName(said) {              // "scores[i]" -> "scores"
    var m = /^\s*([A-Za-z_]\w*)/.exec(String(said || ""));
    return m ? m[1] : "";
  }

  function callOf(item) {                // Call show(n, "x"), as the tree of it
    return { call: item.name, args: pieces(item.args || "").map(tree) };
  }

  function sumsOf(item) {                // every expression written on this line
    switch (item.op) {
      case "declare": case "return": case "wait":
        return item.expr ? [item.expr] : [];
      case "set": return [item.expr];
      case "display": return pieces(item.parts || "");
      case "call": return pieces(item.args || "");
      case "if": case "while": case "dowhile": return item.cond ? [item.cond] : [];
      case "for":
        return [statementOf(item.init || "").expr, item.cond,
                statementOf(item.step || "").expr].filter(Boolean);
      case "select":
        return [item.expr].concat(item.cases.map(function (one) {
          return String(one.match || "");
        }).filter(function (label) { return !OTHERWISE.test(label.trim()); }));
      default: return [];
    }
  }

  // The names a statement puts something into.  A module handed a variable
  // by reference puts something into it as surely as a Set does.
  function targetsOf(item, prog) {
    switch (item.op) {
      case "set": case "input":
        return R_JUST_A_NAME.test(bareName(item.var)) ? [bareName(item.var)] : [];
      case "for":
        return [statementOf(item.init || "").var,
                statementOf(item.step || "").var].filter(Boolean);
      case "call":
        var mod = prog && prog.byName[lowered(item.name)];
        if (!mod) { return []; }
        var given = pieces(item.args || "");
        return mod.params.map(function (p, i) {
          return p.ref && R_JUST_A_NAME.test(given[i] || "") ? given[i].trim() : "";
        }).filter(Boolean);
      default: return [];
    }
  }

  function blocksOf(item) {              // the statements inside this one
    switch (item.op) {
      case "if": return [item.then || [], item["else"] || []];
      case "while": case "dowhile": case "for": return [item.body || []];
      case "select": return item.cases.map(function (one) { return one.body || []; });
      default: return [];
    }
  }

  // Every statement, outermost first and in the order they were written,
  // with how far in it is and whether a Select is somewhere around it.
  function eachStep(items, fn, deep, inCase) {
    (items || []).forEach(function (item) {
      fn(item, deep || 0, items, !!inCase);
      blocksOf(item).forEach(function (block) {
        eachStep(block, fn, (deep || 0) + 1, inCase || item.op === "select");
      });
    });
  }

  function wordsOf(item, prog) {         // every name this one line mentions
    var out = [];
    sumsOf(item).forEach(function (src) {
      tokens(src).forEach(function (tok) {
        if (tok.t === "name") { out.push(lowered(tok.v)); }
      });
    });
    targetsOf(item, prog).forEach(function (name) { out.push(lowered(name)); });
    if (item.op === "declare") { out.push(lowered(item.var)); }
    return out;
  }

  function mentionsIn(items, low, prog) {
    var n = 0;
    eachStep(items, function (item) {
      wordsOf(item, prog).forEach(function (word) { if (word === low) { n++; } });
    });
    return n;
  }

  // ---- what kind of thing an expression comes to --------------------------
  function lookUp(scope, name) {         // this chart's own, then everybody's
    var low = lowered(name);
    return scope.names[low] || (scope.up && scope.up.names[low]) || null;
  }

  function kindIn(node, scope, prog) {
    if (!node) { return ""; }
    if (node.lit !== undefined) {
      return node.lit === '""' ? "text" : (/\./.test(node.lit) ? "real" : "int");
    }
    if (node.str !== undefined) { return "text"; }
    if (node.bool !== undefined) { return "bool"; }
    if (node.group) { return kindIn(node.group, scope, prog); }
    if (node.unary) {
      return node.unary === "not" ? "bool" : kindIn(node.of, scope, prog);
    }
    if (node.name) {
      var entry = lookUp(scope, node.name);
      return entry ? entry.kind : "";
    }
    if (node.call) {
      var low = lowered(node.call);
      if (prog.byName[low]) { return prog.byName[low].gives; }
      if (!holds(BUILT_KIND, low)) { return ""; }
      if (low === "random" && !node.args.length) { return "real"; }
      if (BUILT_KIND[low] !== "same") { return BUILT_KIND[low]; }
      if (!node.args.length) { return ""; }
      return node.args.map(function (arg) { return kindIn(arg, scope, prog); })
                      .reduce(function (a, b) { return a === b ? a : bothKinds(a, b); });
    }
    var a = kindIn(node.left, scope, prog), b = kindIn(node.right, scope, prog);
    switch (node.op) {
      case "+": return (a === "text" || b === "text") ? "text" : bothKinds(a, b);
      case "-": case "*": case "mod": case "%": case "^": return bothKinds(a, b);
      case "/": return "real";
      case "div": return "int";
      default: return "bool";            // every test, and And and Or
    }
  }

  // ---- the read-through ---------------------------------------------------
  function paramsOf(mod) {
    return String(mod.params || "").split(",").map(function (p) {
      var bits = p.trim().split(/\s+/).filter(Boolean);
      if (!bits.length) { return null; }
      var kind = "", cash = false, ref = false;
      bits.slice(0, -1).forEach(function (bit) {
        kind = kind || kindOfWord(bit);
        cash = cash || R_CASH_TYPE.test(bit);
        ref = ref || R_REF.test(bit);
      });
      return { name: bits[bits.length - 1], kind: kind, cash: cash, ref: ref };
    }).filter(Boolean);
  }

  function studying(ast) {
    function scopeFor(items, up, mod) {
      return { names: Object.create(null), up: up, items: items || [], mod: mod || null };
    }
    function named(scope, name) {
      var low = lowered(name);
      if (!scope.names[low]) {
        // `name` is how it was first spelled, which is how it will be
        // spelled everywhere: Total and total are one tin to the runner
        // and two different variables to everything else.
        scope.names[low] = { name: name, kind: "", fixed: false, cash: false,
                             spots: [], shared: !scope.up };
      }
      return scope.names[low];
    }

    var prog = { mods: [], byName: Object.create(null), scopes: [] };
    prog.shared = scopeFor([], null);
    (ast.modules || []).forEach(function (mod) {
      var said = kindOfWord(mod.returns);
      var one = { mod: mod, name: mod.name, params: paramsOf(mod), gives: said,
                  said: !!said, answers: false, body: mod.body || [] };
      // The reading closes every module with a Return of its own.  It is
      // where the chart's last oval comes from and it says nothing the
      // closing brace does not.
      var last = one.body[one.body.length - 1];
      if (last && last.op === "return" && !last.expr) { one.body = one.body.slice(0, -1); }
      eachStep(one.body, function (item) {
        if (item.op === "return" && item.expr) { one.answers = true; }
      });
      one.refs = one.params.filter(function (p) { return p.ref; });
      one.scope = scopeFor(one.body, prog.shared, one);
      prog.mods.push(one);
      prog.byName[lowered(mod.name)] = one;
    });
    prog.mods.forEach(function (one) {
      one.params.forEach(function (p) {
        var entry = named(one.scope, p.name);
        entry.kind = p.kind; entry.fixed = !!p.kind; entry.cash = p.cash;
        entry.param = true; entry.ref = p.ref;
        p.entry = entry;
      });
    });

    // The End that finishes the main flow is the closing brace, too.
    var main = (ast.main || []).slice();
    if (main.length && main[main.length - 1].op === "end") { main.pop(); }
    // A page holding nothing but modules: the runner walks into the first
    // chart there is, so the code does as well.
    if (!main.length && prog.mods.length && !prog.mods[0].params.length) {
      main = [{ op: "call", name: prog.mods[0].name, args: "", id: 0, line: 0 }];
    }
    prog.main = scopeFor(main, prog.shared, null);
    prog.scopes = [prog.main].concat(prog.mods.map(function (one) { return one.scope; }));

    // Every name there is, and where it was declared if it was.
    prog.scopes.forEach(function (scope) {
      eachStep(scope.items, function (item, deep, block, inCase) {
        var home = item.scope === "global" ? prog.shared : scope;
        if (item.op === "declare") {
          var entry = named(home, item.var);
          var kind = kindOfWord(item.type);
          if (kind && !entry.fixed) { entry.kind = kind; entry.fixed = true; }
          if (R_CASH_TYPE.test(item.type || "")) { entry.cash = true; }
          entry.spots.push({ item: item, deep: deep, block: block, inCase: inCase });
          return;
        }
        targetsOf(item, prog).forEach(function (name) {
          var known = lookUp(scope, name) || named(home, name);
          if (item.op === "input") { known.asked = true; }
        });
      });
    });

    // What is left is five passes over the program, and on a chart of
    // twenty thousand shapes they are a quarter of a second between them.
    // They are handed back rather than run, so that whoever asked can run
    // them one at a time and let the page draw in between -- studied()
    // just below runs the lot, which is what everything that has no page
    // to keep answering wants.
    return { prog: prog, steps: [
      function () { learnKinds(prog); },
      function () { guessKinds(prog); },
      function () {
        learnKinds(prog);
        prog.scopes.forEach(function (scope) {
          Object.keys(scope.names).forEach(function (low) {
            var entry = scope.names[low];
            // Nothing anywhere says.  Something typed in that is never
            // added up or compared with a number is words; so is a
            // parameter nobody passes anything to.
            if (!entry.kind) {
              entry.kind = (entry.asked || entry.param) ? "text" : "real";
            }
          });
        });
        Object.keys(prog.shared.names).forEach(function (low) {
          if (!prog.shared.names[low].kind) {
            prog.shared.names[low].kind = "real";
          }
        });
      },
      function () {
        learnKinds(prog);
        prog.mods.forEach(function (one) {
          if (one.answers && !one.gives) { one.gives = "real"; }
        });
      },
      function () { placeNames(prog); }
    ] };
  }

  // The whole reading, in one go.
  function studied(ast) {
    var it = studying(ast);
    it.steps.forEach(function (step) { step(); });
    return it.prog;
  }

  // What the program itself says about its names: a name set to a whole
  // number holds whole numbers, a Function that returns words gives words,
  // a parameter handed a Real is a Real.  Round and round until nothing
  // changes, because each answer can be what the next one was waiting for.
  function learnKinds(prog) {
    var moved = true;
    function learn(entry, kind) {
      if (!entry || entry.fixed || !kind || entry.kind === kind) { return; }
      var now = !entry.kind ? kind
              : bothKinds(entry.kind, kind) || "text";
      if (now !== entry.kind) { entry.kind = now; moved = true; }
    }
    for (var pass = 0; pass < 8 && moved; pass++) {
      moved = false;
      prog.scopes.forEach(function (scope) {
        function kind(src) { return kindIn(tree(src), scope, prog); }
        function calls(node) {
          eachCall(node, function (call) {
            var mod = prog.byName[lowered(call.call)];
            if (!mod) { return; }
            call.args.forEach(function (arg, i) {
              if (mod.params[i]) { learn(mod.params[i].entry, kindIn(arg, scope, prog)); }
            });
          });
        }
        eachStep(scope.items, function (item) {
          var home = item.scope === "global" ? prog.shared : scope;
          if (item.op === "declare" && item.expr) {
            learn(home.names[lowered(item.var)], kind(item.expr));
          }
          if (item.op === "set") { learn(lookUp(scope, bareName(item.var)), kind(item.expr)); }
          if (item.op === "for") {
            var set = statementOf(item.init || "");
            if (set.op === "set") { learn(lookUp(scope, set.var), kind(set.expr) || "int"); }
          }
          if (item.op === "return" && item.expr && scope.mod && !scope.mod.said) {
            var gives = kind(item.expr);
            var now = !scope.mod.gives ? gives
                    : (gives && gives !== scope.mod.gives
                       ? bothKinds(scope.mod.gives, gives) || "text" : scope.mod.gives);
            if (now !== scope.mod.gives) { scope.mod.gives = now; moved = true; }
          }
          sumsOf(item).forEach(function (src) { calls(tree(src)); });
          if (item.op === "call") { calls(callOf(item)); }
        });
      });
    }
  }

  function eachCall(node, fn) {          // every call in it, inner ones too
    if (!node) { return; }
    if (node.call) { fn(node); node.args.forEach(function (a) { eachCall(a, fn); }); }
    eachCall(node.group, fn); eachCall(node.of, fn);
    eachCall(node.left, fn); eachCall(node.right, fn);
  }

  // What is left is what the program never says outright -- above all a
  // name that is typed into without ever having been declared.  How it is
  // used says what it must be: anything multiplied, or compared with a
  // number, is a number; and it is a Real the moment a Real is anywhere
  // near it, a whole number otherwise.
  var R_NUMBER_OPS = /^(-|\*|\/|mod|%|div|\^|<|<=|>|>=)$/;

  function guessKinds(prog) {
    prog.scopes.forEach(function (scope) {
      var hints = Object.create(null);
      function within(node) {
        while (node && node.group) { node = node.group; }
        return node;
      }
      function unknown(node) {
        node = within(node);
        var entry = node && node.name ? lookUp(scope, node.name) : null;
        return (entry && !entry.kind) ? entry : null;
      }
      function hint(node, kind) {
        var entry = unknown(node);
        if (!entry || !kind) { return; }
        var low = lowered(entry.name);
        hints[low] = hints[low] || { entry: entry, kinds: {} };
        hints[low].kinds[kind] = true;
      }
      function look(node) {
        if (!node) { return; }
        if (node.group) { look(node.group); return; }
        if (node.unary) {
          if (node.unary !== "not") { hint(node.of, "int"); }
          look(node.of);
          return;
        }
        if (node.call) {
          var low = lowered(node.call), mod = prog.byName[low];
          node.args.forEach(function (arg, i) {
            if (mod) { hint(arg, mod.params[i] ? mod.params[i].entry.kind : ""); }
            else if (holds(BUILT_KIND, low)) {
              hint(arg, R_BUILT_WORDS.test(low) ? "text" : "int");
            }
            look(arg);
          });
          return;
        }
        if (!node.op) { return; }
        var a = kindIn(node.left, scope, prog), b = kindIn(node.right, scope, prog);
        if (R_NUMBER_OPS.test(node.op)) {
          hint(node.left, b === "real" || b === "text" ? b : "int");
          hint(node.right, a === "real" || a === "text" ? a : "int");
        } else if (RANK[node.op] >= 3) {           // a plus, or a test for equal
          // Two things typed in and added together are two numbers far
          // more often than they are two halves of a sentence.
          var sum = node.op === "+" && unknown(node.left) && unknown(node.right);
          hint(node.left, b || (sum ? "int" : ""));
          hint(node.right, a || (sum ? "int" : ""));
        }
        look(node.left); look(node.right);
      }
      eachStep(scope.items, function (item) {
        sumsOf(item).forEach(function (src) { look(tree(src)); });
        if (item.op === "call") { look(callOf(item)); }
        if (item.op === "for") { hint({ name: statementOf(item.init || "").var }, "int"); }
        if (item.op === "select") {
          item.cases.forEach(function (one) {
            var label = String(one.match || "").trim();
            if (!OTHERWISE.test(label)) {
              hint(tree(item.expr), kindIn(tree(label), scope, prog));
            }
          });
        }
      });
      Object.keys(hints).forEach(function (low) {
        var got = hints[low].kinds;
        hints[low].entry.kind = got.text ? "text" : got.real ? "real"
                              : got.int ? "int" : got.bool ? "bool" : "";
      });
    });
  }

  // ---- where each name has to be declared --------------------------------
  // The runner keeps one set of names per chart, so a name made anywhere in
  // a chart can be read anywhere else in it.  Java, C#, C++ and JavaScript
  // keep a set per pair of braces.  A name therefore stays where it was
  // declared only when every line that uses it is inside the same braces;
  // otherwise it is declared once at the top of its chart, which is the one
  // place every line can see.  A name nobody declared at all is declared
  // where it is first given something, when that is at the top level and
  // comes before anything reads it, and at the top otherwise -- except a
  // For's counter used nowhere but in its For, which is declared by the For
  // the way anybody would write it.
  function countedIn(items, low, prog) { // mentions inside Fors that count with it
    var n = 0;
    (items || []).forEach(function (item) {
      if (item.op === "for" && lowered(statementOf(item.init || "").var) === low) {
        n += mentionsIn([item], low, prog);
        return;
      }
      blocksOf(item).forEach(function (block) { n += countedIn(block, low, prog); });
    });
    return n;
  }

  function placeNames(prog) {
    prog.scopes.forEach(function (scope) {
      var flat = [];
      eachStep(scope.items, function (item, deep, block, inCase) {
        flat.push({ item: item, deep: deep, words: wordsOf(item, prog) });
      });
      function counted(low, items) { return countedIn(items, low, prog); }
      Object.keys(scope.names).forEach(function (low) {
        var entry = scope.names[low], first = null, total = 0;
        if (entry.param) { return; }
        flat.forEach(function (row) {
          var n = row.words.filter(function (word) { return word === low; }).length;
          if (n && !first) { first = row; }
          total += n;
        });
        if (!first) { return; }
        // Used by nothing but the Fors that count with it, give or take
        // being declared.  Python asks, because its `for ... in range()`
        // leaves the counter on the last number it reached and the chart
        // leaves it one past -- which only matters to a line that goes on
        // to read it.
        entry.loopOnly = counted(low, scope.items) + entry.spots.length === total;
        if (entry.spots.length) {
          var spot = entry.spots[0];
          entry.hoist = entry.spots.length > 1 || first.item !== spot.item ||
                        (spot.deep > 0 &&
                         (spot.inCase || mentionsIn(spot.block, low, prog) !== total));
          return;
        }
        var it = first.item;
        var here = first.deep === 0 && lowered(bareName(it.var)) === low &&
                   R_JUST_A_NAME.test(it.var || "") &&
                   (it.op === "input" ||
                    (it.op === "set" && first.words.filter(function (word) {
                      return word === low;
                    }).length === 1));
        if (here) { entry.born = it; }
        else if (counted(low, scope.items) === total) { entry.perLoop = true; }
        else { entry.hoist = true; }
      });
    });
    // A name the whole program shares and nobody declared has nowhere of its
    // own to be declared in, so it goes with the rest of what is shared.
    Object.keys(prog.shared.names).forEach(function (low) {
      var entry = prog.shared.names[low], inFors = 0, total = 0;
      if (!entry.spots.length) { entry.hoist = true; }
      prog.scopes.forEach(function (scope) {
        inFors += countedIn(scope.items, low, prog);
        total += mentionsIn(scope.items, low, prog);
      });
      entry.loopOnly = inFors + entry.spots.length === total;
    });
  }
