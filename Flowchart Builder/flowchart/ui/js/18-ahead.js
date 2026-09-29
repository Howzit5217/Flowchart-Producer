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
    function listed(close) {             // a, b, c ) -- up to the closing mark
      var out = [];
      if (peek() && peek().v !== close) {
        out.push(expr(0));
        while (peek() && peek().v === ",") {
          take();
          if (peek() && peek().v === close) { break; }
          out.push(expr(0));
        }
      }
      if (peek() && peek().v === close) { take(); }
      return out;
    }
    // After a value: an item of it, a part of it, a call made on it --
    // scores[i], grid[y][x], p.x, names.append(x) (which is append(names, x)).
    function after(node) {
      while (peek() && peek().t === "op" && (peek().v === "[" || peek().v === ".")) {
        var op = take();
        if (op.v === "[") {
          var pick = expr(0);
          if (peek() && peek().v === "]") { take(); }
          node = { index: node, at: pick };
          continue;
        }
        var nm = take();
        if (!nm || nm.t !== "name") { break; }
        if (peek() && peek().v === "(") {
          take();
          node = { call: String(nm.v), args: [node].concat(listed(")")), dotted: true };
          continue;
        }
        node = { field: node, name: String(nm.v) };
      }
      return node;
    }
    function primary() {
      var tok = peek();
      if (tok && tok.t === "op" && (tok.v === "-" || tok.v === "+")) {
        take();
        return { unary: tok.v, of: primary() };
      }
      if (tok && tok.t === "name" && String(tok.v).toLowerCase() === "not") {
        take();
        return { unary: "not", of: primary() };
      }
      return after(atom());
    }
    function atom() {
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
      if (tok.t === "op" && tok.v === "[") { return { list: listed("]") }; }
      if (tok.t === "op" && tok.v === "{") {
        var pairs = [];
        while (peek() && peek().v !== "}") {
          var key = expr(0);
          if (peek() && peek().v === ":") { take(); }
          pairs.push([key, expr(0)]);
          if (!peek() || peek().v !== ",") { break; }
          take();
        }
        if (peek() && peek().v === "}") { take(); }
        return { table: pairs };
      }
      if (tok.t === "name") {
        var low = String(tok.v).toLowerCase();
        if (low === "true" || low === "false") { return { bool: low === "true" }; }
        if (low === "new" && peek() && peek().t === "name") {
          var kind = String(take().v);
          if (peek() && peek().v === "(") { take(); listed(")"); }
          return { record: kind };
        }
        if (peek() && peek().v === "(") {
          take();
          return { call: String(tok.v), args: listed(")") };
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

  // ---- and what holds them ------------------------------------------------
  // A list is "list:" and what is in it (list:int, list:list:bool); a table
  // is "table:" its keys ":" its values; a record is "rec:" its kind (rec:
  // alone for a record of no one kind).  What is in a list nobody has put
  // anything into yet is "", and is worked out as the program is read.
  function isListKind(k) { return /^list:/.test(k || ""); }
  function isTableKind(k) { return /^table:/.test(k || ""); }
  function isRecKind(k) { return /^rec:/.test(k || ""); }
  function tableKey(k) { var m = /^table:([^:]*)/.exec(k || ""); return m ? m[1] : ""; }
  function tableValue(k) { var m = /^table:[^:]*:(.*)$/.exec(k || ""); return m ? m[1] : ""; }
  function elemOf(k) {                   // what taking one out of it gives
    if (isListKind(k)) { return k.slice(5); }
    if (isTableKind(k)) { return tableValue(k); }
    return k === "text" || k === "any" ? k : "";
  }
  // What a name holds when it is given both of these, one time and another.
  // "none" is the empty "" a program writes for nothing-yet -- Python's
  // None, JavaScript's null, a node with no next -- and gives way to
  // whatever else the name is given.  Two things of no one kind are "any":
  // a list holding 1 and "one", a Function handing back either.
  function joinKinds(a, b) {
    if (!a || a === "none") { return b || a || ""; }
    if (!b || b === "none" || a === b) { return a; }
    if (a === "any" || b === "any") { return "any"; }
    if ((a === "int" || a === "real") && (b === "int" || b === "real")) { return bothKinds(a, b); }
    if (isListKind(a) && isListKind(b)) { return "list:" + joinKinds(elemOf(a), elemOf(b)); }
    if (isTableKind(a) && isTableKind(b)) {
      return "table:" + joinKinds(tableKey(a), tableKey(b)) + ":" + joinKinds(tableValue(a), tableValue(b));
    }
    if (isRecKind(a) && isRecKind(b)) { return "rec:"; }
    return "any";
  }
  // Whatever inside it nobody ever said, a number.
  function settled(k) {
    if (isListKind(k)) { return "list:" + settled(elemOf(k)); }
    if (isTableKind(k)) { return "table:" + settled(tableKey(k) || "text") + ":" + settled(tableValue(k)); }
    if (k === "none") { return "text"; }
    return k || "real";
  }
  // What a kind of record holds by this name -- or, where the record is of
  // no one kind, whatever any of them holds by it.
  function fieldKind(prog, holder, low) {
    var recs = prog.records || {}, own = holder.length > 4 ? recs[holder.slice(4)] : null;
    if (own && own.fields[low]) { return own.fields[low].kind; }
    if (recs[""] && recs[""].fields[low]) { return recs[""].fields[low].kind; }
    var found = "";
    Object.keys(recs).forEach(function (kind) {
      if (recs[kind].fields[low]) { found = joinKinds(found, recs[kind].fields[low].kind); }
    });
    return found;
  }
  // What each of the list built-ins hands back, from what it was handed.
  function builtKind(low, kinds) {
    var a = kinds[0] || "";
    switch (low) {
      case "length": case "indexof": case "count": case "ord": case "bitand": case "bitor":
      case "bitxor": case "trunc": case "sign": return "int";
      case "contains": case "startswith": case "endswith": case "isdigit": case "isalpha":
      case "isupper": case "islower": case "isspace": case "any": case "all": case "isnumber":
        return "bool";
      case "join": case "tostring": case "replace": case "trim": case "chr": case "classof":
      case "padleft": case "padright": case "fixed": case "substring": return "text";
      case "split": return "list:text";
      case "range": return "list:int";
      case "keys": return isTableKind(a) ? "list:" + tableKey(a) : "list:int";
      case "values": return "list:" + elemOf(a);
      case "items":
        return isTableKind(a) ? "list:list:" + (tableKey(a) === tableValue(a) ? tableKey(a) : "any")
                              : "list:list:" + (elemOf(a) === "int" ? "int" : "any");
      case "reversed": case "copy":
        return a === "text" ? "text" : isTableKind(a) && low === "reversed" ? "list:" + tableKey(a) : a;
      case "sorted": case "unique": case "tolist": case "shuffled":
        return a === "text" ? "list:text" : isTableKind(a) ? "list:" + tableKey(a) : a;
      case "union": case "intersection":
        return a === "text" ? "list:text" : isTableKind(a) ? "list:" + tableKey(a) : a;
      case "slice": case "reverse": case "sort": case "repeat": case "difference": return a;
      case "sum": return elemOf(a) === "int" ? "int" : "real";
      case "min": case "max":
        if (kinds.length === 1 && isListKind(a)) { return elemOf(a); }
        return kinds.reduce(function (x, y) { return x === y ? x : bothKinds(x, y); });
      case "pop": case "choice": return elemOf(a);
      case "get": return isTableKind(a) ? tableValue(a) || kinds[2] || "" : elemOf(a) || kinds[2] || "";
      case "newlist": {
        var made = kinds[kinds.length - 1] || "";
        for (var d = 0; d < kinds.length - 1; d++) { made = "list:" + made; }
        return made;
      }
      case "real": case "log": case "exp": case "sin": case "cos": case "tan": case "atan":
      case "atan2": case "hypot": case "log10": case "asin": case "acos": return "real";
      case "enumerate": return "list:list:" + (elemOf(a) === "int" ? "int" : "any");
      case "zip":
        var both = elemOf(a);
        kinds.slice(1).forEach(function (k) { both = both === elemOf(k) ? both : "any"; });
        return "list:list:" + (both || "any");
      case "append": case "insert": case "remove": case "extend": case "clear": case "shuffle":
        return "";
    }
    return null;
  }
  // The list built-ins that change the list they are handed, and which of
  // their arguments goes into it: append(xs, x), insert(xs, i, x).
  var PUTS_IN = { append: 1, insert: 2 };

  // ---- one statement, taken apart ---------------------------------------
  var R_JUST_A_NAME = /^\s*[A-Za-z_]\w*\s*$/;

  function bareName(said) {              // "scores[i]" -> "scores"
    var m = /^\s*([A-Za-z_]\w*)/.exec(String(said || ""));
    return m ? m[1] : "";
  }

  function callOf(item) {                // Call show(n, "x"), as the tree of it
    // what follows the word Call, read as the call it is -- which is how
    // Call names.append(x) comes out append(names, x)
    var said = tree(String(item.text || "").replace(/^\s*call\s+/i, ""));
    if (said && said.call) { return said; }
    return { call: item.name, args: pieces(item.args || "").map(tree) };
  }

  function sumsOf(item) {                // every expression written on this line
    switch (item.op) {
      case "declare": case "return": case "wait":
        return item.expr ? [item.expr] : [];
      // grid[y][x] = v reads grid, y and x on the way to where v goes
      case "set": return [item.expr].concat(R_JUST_A_NAME.test(item["var"] || "") ? [] : [item["var"]]);
      case "display": return pieces(item.parts || "");
      case "call": return pieces(item.args || "");
      case "if": case "while": case "dowhile": return item.cond ? [item.cond] : [];
      case "foreach": return [item.over];
      case "input": return R_JUST_A_NAME.test(item["var"] || "") ? [] : [item["var"]];
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
      case "foreach": return [item["var"]];
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
      case "while": case "dowhile": case "for": case "foreach": return [item.body || []];
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
    if (node.kindIs !== undefined) { return node.kindIs; }
    if (node.lit !== undefined) {
      return node.lit === '""' ? "text" : (/\./.test(node.lit) ? "real" : "int");
    }
    if (node.str !== undefined) { return "text"; }
    if (node.bool !== undefined) { return "bool"; }
    if (node.group) { return kindIn(node.group, scope, prog); }
    if (node.unary) {
      return node.unary === "not" ? "bool" : kindIn(node.of, scope, prog);
    }
    if (node.list) {
      var inList = "";
      node.list.forEach(function (one) { inList = joinKinds(inList, kindIn(one, scope, prog)); });
      return "list:" + inList;
    }
    if (node.table) {
      var keyKind = "", valueKind = "";
      node.table.forEach(function (pair) {
        keyKind = joinKinds(keyKind, kindIn(pair[0], scope, prog));
        valueKind = joinKinds(valueKind, kindIn(pair[1], scope, prog));
      });
      return "table:" + keyKind + ":" + valueKind;
    }
    if (node.record) { return "rec:" + node.record; }
    if (node.index) { return elemOf(kindIn(node.index, scope, prog)); }
    if (node.field) {
      var holder = kindIn(node.field, scope, prog);
      if (/^(length|size|count)$/i.test(node.name) && (isListKind(holder) || holder === "text")) { return "int"; }
      if (isTableKind(holder)) { return tableValue(holder); }
      return isRecKind(holder) ? fieldKind(prog, holder, lowered(node.name)) : "";
    }
    if (node.name) {
      var entry = lookUp(scope, node.name);
      if (!entry && /^(newline|tab)$/i.test(node.name)) { return "text"; }
      if (!entry && /^infinity$/i.test(node.name)) { return "real"; }
      if (!entry && prog.byName[lowered(node.name)]) { return "fn"; }
      return entry ? entry.kind : "";
    }
    if (node.call) {
      var low = lowered(node.call);
      if (prog.byName[low]) { return prog.byName[low].gives; }
      var listy = builtKind(low, node.args.map(function (arg) { return kindIn(arg, scope, prog); }));
      if (listy !== null && (!holds(BUILT_KIND, low) || /^(length|min|max)$/.test(low))) { return listy; }
      if (!holds(BUILT_KIND, low)) { return ""; }
      if (low === "random" && !node.args.length) { return "real"; }
      if (BUILT_KIND[low] !== "same") { return BUILT_KIND[low]; }
      if (!node.args.length) { return ""; }
      return node.args.map(function (arg) { return kindIn(arg, scope, prog); })
                      .reduce(function (a, b) { return a === b ? a : bothKinds(a, b); });
    }
    var a = kindIn(node.left, scope, prog), b = kindIn(node.right, scope, prog);
    switch (node.op) {
      case "+":
        if (isListKind(a) && isListKind(b)) { return joinKinds(a, b); }
        if (a === "text" || b === "text") { return "text"; }
        return (a === "any" || b === "any") ? "real" : bothKinds(a, b);
      case "*":
        if (isListKind(a)) { return a; }
        if (isListKind(b)) { return b; }
        if (a === "text" || b === "text") { return "text"; }
        return (a === "any" || b === "any") ? "real" : bothKinds(a, b);
      case "-": case "mod": case "%": case "^":
        return (a === "any" || b === "any") ? "real" : bothKinds(a, b);
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

    var prog = { mods: [], byName: Object.create(null), scopes: [], records: Object.create(null) };
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
          var kind = declaredKind(item);
          if (kind && !entry.fixed) { entry.kind = kind; entry.fixed = !openKind(kind); }
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
            entry.kind = settled(entry.kind);
          });
        });
        Object.keys(prog.shared.names).forEach(function (low) {
          if (!prog.shared.names[low].kind) {
            prog.shared.names[low].kind = "real";
          }
          prog.shared.names[low].kind = settled(prog.shared.names[low].kind);
        });
        Object.keys(prog.records).forEach(function (kind) {
          var rec = prog.records[kind];
          Object.keys(rec.fields).forEach(function (low) { rec.fields[low].kind = settled(rec.fields[low].kind); });
        });
      },
      function () {
        learnKinds(prog);
        prog.mods.forEach(function (one) {
          if (one.answers && !one.gives) { one.gives = "real"; }
          if (one.gives) { one.gives = settled(one.gives); }
        });
      },
      function () { placeNames(prog); markChanged(prog); }
    ] };
  }

  // What a Declare says a name holds: Integer, Integer scores[], Boolean
  // seen[h][w], Point p (a record of that kind).
  function declaredKind(item) {
    var kind = kindOfWord(item.type);
    if (!kind && item.type && !/^(var|let)$/i.test(item.type)) { kind = "rec:" + item.type; }
    (item.dims || []).forEach(function () { kind = "list:" + kind; });
    return kind;
  }

  // A list of lists of nobody-said-what: Declare people[][].
  function openKind(k) {
    while (isListKind(k)) { k = elemOf(k); }
    return !k;
  }

  // Which of a module's parameters it changes what is inside of --
  // grid[y][x] = v, append(names, x), or handing it on to a module that
  // does.  Python, Java, C# and JavaScript hand a list over as the list
  // itself; C++ copies it unless told not to, and a maze carved into a
  // copy is a maze nobody sees.
  var CHANGES_ITS_FIRST = { append: 1, insert: 1, remove: 1, pop: 1, extend: 1, clear: 1,
                            sort: 1, reverse: 1, shuffle: 1 };
  function markChanged(prog) {
    var passes = [];                     // [module, parameter entry, the module it goes to, which]
    prog.mods.forEach(function (one) {
      function mine(said) {
        var entry = lookUp(one.scope, bareName(said));
        return entry && entry.param && one.scope.names[lowered(entry.name)] === entry ? entry : null;
      }
      function calls(node) {
        eachCall(node, function (call) {
          var low = lowered(call.call), first = call.args[0];
          if (CHANGES_ITS_FIRST[low] && !prog.byName[low] && first && first.name && !first.field) {
            var hit = mine(first.name);
            if (hit) { hit.changed = true; }
          }
          var to = prog.byName[low];
          if (to) {
            call.args.forEach(function (arg, i) {
              var hit2 = arg && arg.name && !arg.field && !arg.index ? mine(arg.name) : null;
              if (hit2 && to.params[i]) { passes.push([hit2, to.params[i].entry]); }
            });
          }
        });
      }
      eachStep(one.body, function (item) {
        if ((item.op === "set" || item.op === "input") && item["var"] && !R_JUST_A_NAME.test(item["var"])) {
          var hit = mine(item["var"]);
          if (hit) { hit.changed = true; }
        }
        sumsOf(item).forEach(function (src) { calls(tree(src)); });
        if (item.op === "call") { calls(callOf(item)); }
      });
    });
    for (var round = 0; round < passes.length + 1; round++) {
      var more = false;
      passes.forEach(function (pass) {
        if (pass[1].changed && !pass[0].changed) { pass[0].changed = true; more = true; }
      });
      if (!more) { break; }
    }
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
      if (!entry || !kind || entry.kind === kind) { return; }
      // a list declared Integer scores[] is still a list of whole numbers,
      // but one declared with nothing said of what is in it can be told
      if (entry.fixed && !openKind(entry.kind)) { return; }
      var now = joinKinds(entry.kind, kind);
      if (now !== entry.kind) { entry.kind = now; moved = true; }
    }
    // grid[y][x] = v: grid is a list of lists of what v is -- or, where the
    // place is a key, a table; p.x = v: p's kind of record has an x
    function learnPlace(scope, said, kind) {
      var node = tree(said), depth = [];
      while (node && (node.index || node.field)) {
        if (node.field) {
          var holder = kindIn(node.field, scope, prog);
          if (isTableKind(holder) && !depth.length && node.field.name) {
            learn(lookUp(scope, node.field.name), "table:text:" + kind);
          }
          if (isRecKind(holder) && !depth.length) {
            var rec = prog.records[holder.slice(4)] = prog.records[holder.slice(4)] ||
                      { name: holder.slice(4), fields: Object.create(null) };
            var f = rec.fields[lowered(node.name)] = rec.fields[lowered(node.name)] ||
                    { name: node.name, kind: "" };
            var now = joinKinds(f.kind, kind);
            if (now !== f.kind) { f.kind = now; moved = true; }
          }
          return;
        }
        depth.unshift(node.at);
        node = node.index;
      }
      if (!node || !node.name || !depth.length) { return; }
      var entry = lookUp(scope, node.name);
      if (!entry) { return; }
      var made = kind;
      for (var d = depth.length - 1; d >= 0; d--) {
        var inner = d === 0 ? entry.kind : "";
        var keyKind = kindIn(depth[d], scope, prog);
        made = (d === 0 && isTableKind(inner)) || (keyKind === "text" && !isListKind(inner))
             ? "table:" + keyKind + ":" + made : "list:" + made;
      }
      learn(entry, made);
    }
    for (var pass = 0; pass < 8 && moved; pass++) {
      moved = false;
      prog.scopes.forEach(function (scope) {
        function kind(src) {
          var node = tree(src);
          return node.str === "" ? "none" : kindIn(node, scope, prog);
        }
        function calls(node) {
          eachCall(node, function (call) {
            var mod = prog.byName[lowered(call.call)];
            if (!mod) { return; }
            call.args.forEach(function (arg, i) {
              if (mod.params[i]) { learn(mod.params[i].entry, arg.str === "" ? "none" : kindIn(arg, scope, prog)); }
            });
          });
          // sort(people, byAge): byAge is handed two people, or one
          eachCall(node, function (call) {
            var low = lowered(call.call), by = call.args[1];
            if (!/^(sort|sorted|min|max)$/.test(low) || !by || !by.name || by.field) { return; }
            var mod = prog.byName[lowered(by.name)];
            if (!mod || lookUp(scope, by.name)) { return; }
            var items = kindIn(call.args[0], scope, prog);
            var one = isTableKind(items) ? tableKey(items) : items === "text" ? "text" : elemOf(items);
            mod.params.slice(0, 2).forEach(function (p) { learn(p.entry, one); });
          });
        }
        eachStep(scope.items, function (item) {
          var home = item.scope === "global" ? prog.shared : scope;
          if (item.op === "declare" && item.expr) {
            var given = kind(item.expr);
            // Declare Boolean seen[h][w] = True: a fill, not the whole of it
            if ((item.dims || []).some(function (d) { return String(d).trim(); }) && !isListKind(given)) {
              (item.dims || []).forEach(function () { given = "list:" + given; });
            }
            learn(home.names[lowered(item.var)], given);
          }
          if (item.op === "set") {
            if (R_JUST_A_NAME.test(item["var"] || "")) { learn(lookUp(scope, bareName(item.var)), kind(item.expr)); }
            else { learnPlace(scope, item["var"], kind(item.expr)); }
          }
          if (item.op === "foreach") {
            learn(lookUp(scope, item["var"]), elemOf(kind(item.over)) || (kind(item.over) === "text" ? "text" : ""));
          }
          if (item.op === "call") {
            // append(names, "Ada"): names is a list of words
            var made = callOf(item), puts = PUTS_IN[lowered(made.call)];
            if (puts && made.args[0] && made.args[0].name && made.args[puts]) {
              learn(lookUp(scope, made.args[0].name), "list:" + kindIn(made.args[puts], scope, prog));
            }
            if (lowered(made.call) === "extend" && made.args[0] && made.args[0].name && made.args[1]) {
              learn(lookUp(scope, made.args[0].name), kindIn(made.args[1], scope, prog));
            }
          }
          if (item.op === "for") {
            var set = statementOf(item.init || "");
            if (set.op === "set") { learn(lookUp(scope, set.var), kind(set.expr) || "int"); }
          }
          if (item.op === "return" && item.expr && scope.mod && !scope.mod.said) {
            var now = joinKinds(scope.mod.gives, kind(item.expr));
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
    if (node.call) { fn(node); }
    kidsOf(node).forEach(function (kid) { eachCall(kid, fn); });
  }

  // What an expression is made of, one level down: the sides of a sum,
  // what a call is handed, what is in a list, the list a place is in.
  function kidsOf(node) {
    var out = [node.group, node.of, node.left, node.right, node.index, node.at, node.field]
                .concat(node.args || [], node.list || []);
    (node.table || []).forEach(function (pair) { out.push(pair[0], pair[1]); });
    return out.filter(Boolean);
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
        var entry = node && node.name && !node.field ? lookUp(scope, node.name) : null;
        return (entry && (!entry.kind || entry.kind === "none")) ? entry : null;
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
        // this.r: whatever this is, it has an r
        if (node.field) {
          if (!/^(length|size|count)$/i.test(node.name)) { hint(node.field, "rec:"); }
          look(node.field);
          return;
        }
        if (node.index) { look(node.index); look(node.at); return; }
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
        // handed to what takes a record, or a list: that, where nothing
        // says it is a number or words
        var held = "";
        Object.keys(got).forEach(function (k) { if (compoundKind(k)) { held = joinKinds(held, k); } });
        hints[low].entry.kind = got.text ? "text" : got.real ? "real"
                              : got.int ? "int" : got.bool ? "bool" : held;
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
      if ((item.op === "for" && lowered(statementOf(item.init || "").var) === low) ||
          (item.op === "foreach" && lowered(item["var"]) === low)) {
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
