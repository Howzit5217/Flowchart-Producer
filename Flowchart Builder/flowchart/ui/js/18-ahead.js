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
    function isOp(v) { var t = ts[at]; return !!t && t.t === "op" && t.v === v; }
    function take() { return ts[at++]; }
    function listed(close) {             // a, b, c ) -- up to the closing mark
      var out = [];
      if (peek() && !isOp(close)) {
        out.push(expr(0));
        while (isOp(",")) {
          take();
          if (isOp(close)) { break; }
          out.push(expr(0));
        }
      }
      if (isOp(close)) { take(); }
      return out;
    }
    // After a value: an item of it, a part of it, a call made on it --
    // scores[i], grid[y][x], p.x, names.append(x) (which is append(names, x)).
    function after(node) {
      while (peek() && peek().t === "op" && (peek().v === "[" || peek().v === ".")) {
        var op = take();
        if (op.v === "[") {
          var pick = expr(0);
          if (isOp("]")) { take(); }
          node = { index: node, at: pick };
          continue;
        }
        var nm = take();
        if (!nm || nm.t !== "name") { break; }
        if (isOp("(")) {
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
        if (isOp(",")) {                 // (3, 4): a tuple, which is a list here
          var together = [inside];
          while (isOp(",")) {
            take();
            if (isOp(")")) { break; }
            together.push(expr(0));
          }
          if (isOp(")")) { take(); }
          return { list: together, tuple: true };
        }
        if (isOp(")")) { take(); }
        return { group: inside };
      }
      if (tok.t === "op" && tok.v === "[") { return { list: listed("]") }; }
      if (tok.t === "op" && tok.v === "{") {
        var pairs = [];
        while (peek() && !isOp("}")) {
          var key = expr(0);
          if (isOp(":")) { take(); }
          pairs.push([key, expr(0)]);
          if (!isOp(",")) { break; }
          take();
        }
        if (isOp("}")) { take(); }
        return { table: pairs };
      }
      if (tok.t === "name") {
        var low = String(tok.v).toLowerCase();
        if (low === "true" || low === "false") { return { bool: low === "true" }; }
        if (low === "new" && peek() && peek().t === "name") {
          var kind = String(take().v), given = null;
          if (isOp("(")) { take(); given = listed(")"); }
          // the values handed over, for a record laid out field by field
          // (TYPE, RECORD): AQA's Car("Ford", 1.8)
          return given && given.length ? { record: kind, args: given } : { record: kind };
        }
        if (isOp("(")) {
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
        var op = tok.t === "op" ? tok.v : tok.t === "name" ? String(tok.v).toLowerCase() : "";
        if (op === "not" && ts[at + 1] && ts[at + 1].t === "name" && String(ts[at + 1].v).toLowerCase() === "in") { op = "not in"; }
        var rank = RANK[op];
        if (!rank || rank < least) { break; }
        take();
        if (op === "not in") { take(); }
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
                     length: "int", toupper: "text", tolower: "text", roundeven: "int",
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
  function settled(k, keepNone) {
    if (isListKind(k)) { return "list:" + settled(elemOf(k), keepNone); }
    if (isTableKind(k)) { return "table:" + settled(tableKey(k) || "text", keepNone) + ":" + settled(tableValue(k), keepNone); }
    if (k === "none") { return keepNone ? "none" : "text"; }
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
      case "length": case "indexof": case "lastindexof": case "compare": case "count": case "ord": case "bitand": case "bitor":
      case "bitxor": case "trunc": case "sign": return "int";
      case "contains": case "startswith": case "endswith": case "isdigit": case "isalpha":
      case "isupper": case "islower": case "isspace": case "any": case "all": case "isnumber":
        return "bool";
      case "join": case "tostring": case "replace": case "trim": case "chr": case "classof":
      case "padleft": case "padright": case "fixed": case "substring": case "repr": return "text";
      case "split": return "list:text";
      case "tobase": return "text";
      case "grouped": return "text";
      case "tojson": return "text";
      case "significant": return "text";
      case "frombase": return "int";
      case "range": return "list:int";
      case "keys": return isTableKind(a) ? "list:" + tableKey(a) : "list:int";
      case "values": return "list:" + elemOf(a);
      case "items":
        return isTableKind(a) ? "list:list:" + (tableKey(a) === tableValue(a) ? tableKey(a) : "any")
                              : "list:list:" + (elemOf(a) === "int" ? "int" : "any");
      case "reversed": case "copy": case "deepcopy":
        return a === "text" ? "text" : isTableKind(a) && low === "reversed" ? "list:" + tableKey(a) : a;
      case "sorted": case "unique": case "tolist": case "shuffled":
        return a === "text" ? "list:text" : isTableKind(a) ? "list:" + tableKey(a) : a;
      case "union": case "intersection":
        return a === "text" ? "list:text" : isTableKind(a) ? "list:" + tableKey(a) : a;
      case "slice": case "reverse": case "sort": case "repeat": case "difference": case "transpose": return a;
      case "sum": return elemOf(a) === "int" ? "int" : "real";
      case "min": case "max":
        if (kinds.length === 1 && isListKind(a)) { return elemOf(a); }
        return kinds.reduce(function (x, y) { return x === y ? x : bothKinds(x, y); });
      case "pop": case "choice": return elemOf(a);
      case "get": {
        var held = isTableKind(a) ? tableValue(a) : elemOf(a);
        // get(ages, "zz", "none") from a table of numbers: a number or words
        if (held && kinds[2] && held !== kinds[2] && !(/^(int|real)$/.test(held) && /^(int|real)$/.test(kinds[2]))) { return "any"; }
        return held || kinds[2] || "";
      }
      case "newlist": {
        var made = kinds[kinds.length - 1] || "";
        for (var d = 0; d < kinds.length - 1; d++) { made = "list:" + made; }
        return made;
      }
      case "real": case "log": case "exp": case "sin": case "cos": case "tan": case "atan":
      case "atan2": case "hypot": case "log10": case "asin": case "acos": return "real";
      case "enumerate": return "list:list:" + (elemOf(a) === "int" ? "int" : "any");
      case "bind": return "fn";
      case "zip":
        var both = elemOf(a);
        kinds.slice(1).forEach(function (k) { both = both === elemOf(k) ? both : "any"; });
        return "list:list:" + (both || "any");
      case "append":                     // append("Ann", "Lee"): two words joined
        return a === "text" ? "text" : "";
      case "insert": case "remove": case "extend": case "clear": case "shuffle":
        return "";
      case "isinteger": return "bool";
      case "currencyformat": return "text";
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
        var said = [item.expr];
        item.cases.forEach(function (one) {
          var label = String(one.match || "");
          if (OTHERWISE.test(label.trim())) { return; }
          // 2, 3 and 1 TO 5: each of its values, not the words between them
          if (!one.any) { said.push(label); return; }
          one.any.forEach(function (piece) {
            if (piece.is !== undefined) { said.push(piece.is); } else { said.push(piece.from, piece.to); }
          });
        });
        return said;
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
      var held0 = lookUp(scope, node.call);
      if (held0 && (held0.kind === "fn" || (!held0.kind && !holds(BUILT_KIND, low) && builtKind(low, []) === null))) { return "any"; }
      var listy = builtKind(low, node.args.map(function (arg) { return kindIn(arg, scope, prog); }));
      if (listy !== null && (!holds(BUILT_KIND, low) || /^(length|min|max)$/.test(low))) { return listy; }
      if (!holds(BUILT_KIND, low)) { return ""; }
      if (low === "random" && !node.args.length) { return "real"; }
      if ((low === "round" || low === "roundeven") && node.args.length > 1) { return "real"; }
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
      case "^":
        // 10 ^ -2 is a hundredth, whole numbers or not
        if (node.right && (node.right.unary === "-" || (node.right.lit !== undefined && Number(node.right.lit) < 0))) { return "real"; }
        return (a === "any" || b === "any") ? "real" : bothKinds(a, b);
      case "-": case "mod": case "%":
        return (a === "any" || b === "any") ? "real" : bothKinds(a, b);
      case "/": return "real";
      case "div": return "int";
      default: return "bool";            // every test, and And and Or
    }
  }

  // ---- the read-through ---------------------------------------------------
  function paramsOf(mod) {
    return paramBits(mod.params).map(function (p) {
      var bits = p.words, kind = "", cash = false;
      bits.slice(0, -1).forEach(function (bit) {
        kind = kind || kindOfWord(bit);
        cash = cash || R_CASH_TYPE.test(bit);
      });
      // Integer array[]: a list of whole numbers, not a whole number
      for (var d = 0; d < (p.dims || 0) && kind; d++) { kind = "list:" + kind; }
      if (p.dims && !kind) { kind = "list:"; }
      return { name: p.name, kind: kind, cash: cash && !p.dims, ref: p.ref && !p.dims, dflt: p.dflt,
               dims: p.dims || 0 };
    });
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
    studiedProg = prog;
    // Records the program laid out field by field -- Cambridge's TYPE,
    // AQA's RECORD (parse/boards.py) -- with their fields in order and the
    // kind each one said it holds.  One declared starts as one of these,
    // every field in place; one made with values hands them over in order.
    Object.keys(ast.records || {}).forEach(function (name) {
      var rec = { name: name, fields: Object.create(null), laid: [] };
      (ast.records[name] || []).forEach(function (f) {
        var said = String(f[1] || ""), kind = kindOfWord(said);
        if (!kind && /^[A-Za-z_]\w*$/.test(said) && (ast.records || {})[said]) { kind = "rec:" + said; }
        rec.fields[lowered(f[0])] = { name: f[0], kind: kind, fixed: !!kind };
        rec.laid.push(lowered(f[0]));
      });
      prog.records[name] = rec;
    });
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
    // Integer step = 1: step is at least what 1 is
    prog.mods.forEach(function (one) {
      one.params.forEach(function (p) {
        if (p.dflt && !p.entry.kind) {
          var d0 = tree(p.dflt);
          p.entry.kind = d0.str === "" ? "none" : kindIn(d0, one.scope, prog);
        }
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
          // a Constant something sets again is not one any compiler will
          // let it be: it is written as a plain name
          known.setAgain = true;
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
              entry.kind = entry.param && scope.mod && scope.mod.asValue ? "any"
                         : (entry.asked || entry.param) ? "text" : "real";
            }
            entry.kind = settled(entry.kind, true);
          });
        });
        Object.keys(prog.shared.names).forEach(function (low) {
          if (!prog.shared.names[low].kind) {
            prog.shared.names[low].kind = "real";
          }
          prog.shared.names[low].kind = settled(prog.shared.names[low].kind, true);
        });
        Object.keys(prog.records).forEach(function (kind) {
          var rec = prog.records[kind];
          Object.keys(rec.fields).forEach(function (low) { rec.fields[low].kind = settled(rec.fields[low].kind, true); });
        });
      },
      function () {
        learnKinds(prog);
        prog.mods.forEach(function (one) {
          if (one.answers && !one.gives) { one.gives = "real"; }
          if (one.gives) { one.gives = settled(one.gives, true); }
        });
        // and what is still nothing-yet after all that is words
        prog.scopes.concat([prog.shared]).forEach(function (scope) {
          Object.keys(scope.names).forEach(function (low) { scope.names[low].kind = settled(scope.names[low].kind); });
        });
        Object.keys(prog.records).forEach(function (kind) {
          var rec = prog.records[kind];
          Object.keys(rec.fields).forEach(function (low) { rec.fields[low].kind = settled(rec.fields[low].kind); });
        });
        prog.mods.forEach(function (one) { if (one.gives) { one.gives = settled(one.gives); } });
      },
      function () { localNames(prog); placeNames(prog); tightNames(prog); markChanged(prog); fixedArrays(prog); signsOf(prog); wideNames(prog); }
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
              // swap(array[i], array[i + 1]) into Ref parameters changes the list
              if (arg && (arg.index || arg.field) && to.params[i] && to.params[i].ref) {
                var root = arg;
                while (root.index || root.field) { root = root.index || root.field; }
                var hit3 = root.name && !root.call ? mine(root.name) : null;
                if (hit3) { hit3.changed = true; }
              }
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

  // ---- what can never be less than nought --------------------------------
  // -7 MOD 2 is -1 to the runner, and to Java, C#, C++ and JavaScript; to
  // Python's % it is 1.  Whole numbers divided go toward nought the same
  // way, where Python's // goes down.  Where neither side can ever be less
  // than nought the two agree, and Python can say it its own short way:
  // n % 2, (first + last) // 2.  So: which names never hold anything less
  // than nought -- every value ever put in them is not -- worked out by
  // believing it of every number and taking it back from each one that is
  // given something that might be, until nothing more changes.  Lists the
  // same, by what is put in each place of them.
  function signsOf(prog) {
    var all = [];
    prog.scopes.concat([prog.shared]).forEach(function (scope) {
      Object.keys(scope.names).forEach(function (low) {
        var e = scope.names[low];
        e.nonNeg = /^(int|real)$/.test(e.kind);
        e.elemsNonNeg = isListKind(e.kind) && /^(int|real)$/.test(elemOfAll(e.kind));
        all.push(e);
      });
    });
    prog.mods.forEach(function (one) { one.nonNeg = /^(int|real)$/.test(one.gives || ""); });
    function root(node) {
      while (node && (node.index || node.group)) { node = node.index || node.group; }
      return node;
    }
    var changed = true, rounds = 0;
    while (changed && rounds++ < 50) {
      changed = false;
      prog.scopes.forEach(function (scope) {
        function into(target, ok) {
          if (ok) { return; }
          if (R_JUST_A_NAME.test(target || "")) { drop(lookUp(scope, bareName(target)), false); return; }
          var r = root(tree(target));
          if (r && r.name && !r.field) { drop(lookUp(scope, r.name), true); }
        }
        eachStep(scope.items, function (item) {
          var home = globalItem(item, prog) ? prog.shared : scope;
          if (item.op === "declare") {
            var e = home.names[lowered(item["var"])];
            if (!item.expr) { return; }
            var given = tree(item.expr);
            if (e && isListKind(e.kind)) {
              var ok = given.list ? given.list.every(function f(n) { return n.list ? n.list.every(f) : nonNegIn(n, scope, prog); })
                                  : nonNegIn(given, scope, prog);
              if (!ok) { drop(e, true); }
            } else if (!nonNegIn(given, scope, prog)) { drop(e, false); }
          } else if (item.op === "set") {
            into(item["var"], nonNegIn(tree(item.expr), scope, prog));
          } else if (item.op === "input") {
            into(item["var"], false);                 // what is typed can be anything
          } else if (item.op === "for") {
            var set = statementOf(item.init || ""), step = statementOf(item.step || "");
            var by = step.op === "set" ? tree(step.expr) : null;
            var up = by && by.op === "+" && by.right && by.right.lit !== undefined && Number(by.right.lit) > 0;
            if (set.op === "set") { into(set["var"], up && nonNegIn(tree(set.expr), scope, prog)); }
          } else if (item.op === "foreach") {
            var over = tree(item.over), from = over.name && !over.field ? lookUp(scope, over.name) : null;
            into(item["var"], !!(from && from.elemsNonNeg));
          } else if (item.op === "call") {
            var to = prog.byName[lowered(item.name)], given2 = pieces(item.args || "");
            if (to) { to.params.forEach(function (p, i) { if (p.ref && given2[i]) { into(given2[i], p.entry.nonNeg); } }); }
            var made = callOf(item);
            if (made && lowered(made.call) === "append" && made.args[0] && made.args[1] &&
                !nonNegIn(made.args[1], scope, prog)) {
              var r2 = root(made.args[0]);
              if (r2 && r2.name) { drop(lookUp(scope, r2.name), true); }
            }
          } else if (item.op === "return" && scope.mod && item.expr && !nonNegIn(tree(item.expr), scope, prog)) {
            if (scope.mod.nonNeg) { scope.mod.nonNeg = false; changed = true; }
          }
          // a module handed something that might be less than nought
          sumsOf(item).forEach(function (src) {
            eachCall(tree(src), function (call) { handedTo(call, scope); });
          });
          if (item.op === "call") { handedTo(callOf(item), scope); }
        });
      });
      prog.mods.forEach(function (one) {
        one.params.forEach(function (p) {
          if (p.dflt && !nonNegIn(tree(p.dflt), one.scope, prog)) { drop(p.entry, false); drop(p.entry, true); }
        });
      });
    }
    function handedTo(call, scope) {
      var to = prog.byName[lowered(call.call)];
      if (!to) { return; }
      (call.args || []).forEach(function (arg, i) {
        var p = to.params[i];
        if (!p) { return; }
        if (!nonNegIn(arg, scope, prog)) { drop(p.entry, false); }
        var r = root(arg), from = r && r.name ? lookUp(scope, r.name) : null;
        if (isListKind(p.entry.kind) && !(from && from.elemsNonNeg)) { drop(p.entry, true); }
      });
    }
    function drop(e, elems) {
      if (!e) { return; }
      if (elems ? e.elemsNonNeg : e.nonNeg) { changed = true; }
      if (elems) { e.elemsNonNeg = false; } else { e.nonNeg = false; }
    }
  }
  // Is this sure never to come to less than nought?
  function nonNegIn(node, scope, prog) {
    if (!node) { return false; }
    if (node.lit !== undefined) { return Number(node.lit) >= 0; }
    if (node.group) { return nonNegIn(node.group, scope, prog); }
    if (node.str !== undefined || node.bool !== undefined) { return true; }
    if (node.name && !node.field) {
      var e = lookUp(scope, node.name);
      return !!(e && e.nonNeg);
    }
    if (node.index) {
      var at = node.index;
      while (at.index) { at = at.index; }
      var held = at.name && !at.field ? lookUp(scope, at.name) : null;
      return !!(held && held.elemsNonNeg);
    }
    if (node.unary) { return node.unary === "+" && nonNegIn(node.of, scope, prog); }
    if (node.call) {
      var low = lowered(node.call), a = node.args || [];
      var own = prog.byName[low];
      if (own && !lookUp(scope, node.call)) { return !!own.nonNeg; }
      if (/^(abs|length|len|sqrt|count|ord|hypot)$/.test(low)) { return true; }
      if (/^(round|int|integer|floor|ceiling|ceil|trunc|real)$/.test(low)) { return nonNegIn(a[0], scope, prog); }
      if (low === "max") { return a.some(function (x) { return nonNegIn(x, scope, prog); }); }
      if (low === "min") { return a.length > 0 && a.every(function (x) { return nonNegIn(x, scope, prog); }); }
      return false;
    }
    switch (node.op) {
      case "+": case "*": case "/": case "div":
        return nonNegIn(node.left, scope, prog) && nonNegIn(node.right, scope, prog);
      case "mod": case "%":
        return nonNegIn(node.left, scope, prog);
      case "^":
        return nonNegIn(node.left, scope, prog) ||
               (node.right && node.right.lit !== undefined && Number(node.right.lit) % 2 === 0);
      default:
        return false;
    }
  }

  // ---- arrays, the textbook's kind --------------------------------------
  // Declare Real times[8], times[i] = t, a module handed Real array[]: the
  // fixed-size arrays the textbook uses (Gaddis), and nothing else of a
  // list's -- nothing added on or taken off, no whole list set or shown or
  // handed to a built-in.  A program whose lists are all of that kind is
  // written with real arrays where the language has them (Java's double[],
  // C#'s), the way a teacher would write it, rather than with lists.
  // Marks prog.arrays, and prog.arrayDims as the most an array nests.
  function fixedArrays(prog) {
    var ok = true, any = false, dims = 0;
    function simple(k) {
      var n = 0;
      while (isListKind(k)) { k = elemOf(k); n++; }
      dims = Math.max(dims, n);
      return /^(int|real|text|bool)$/.test(k);
    }
    function walk(node, scope, how) {
      if (!ok || !node) { return; }
      var k = kindIn(node, scope, prog);
      if (isTableKind(k) || isRecKind(k) || k === "fn" || k === "any" || node.table || node.record) { ok = false; return; }
      if (isListKind(k)) {
        any = true;
        if (!simple(k) || !(how === "holder" || how === "param" || how === "length" || how === "over" ||
                           (how === "init" && node.list))) { ok = false; return; }
      }
      if (node.index) { walk(node.index, scope, "holder"); walk(node.at, scope, ""); return; }
      if (node.list) { node.list.forEach(function (one) { walk(one, scope, how === "init" ? "init" : ""); }); return; }
      if (node.call) {
        var low = lowered(node.call);
        var own = prog.byName[low] && !lookUp(scope, node.call);
        (node.args || []).forEach(function (one) { walk(one, scope, own ? "param" : low === "length" ? "length" : ""); });
        return;
      }
      kidsOf(node).forEach(function (one) { walk(one, scope, ""); });
    }
    function zeroish(src) { return /^(0|0\.0+|false|""|'')$/i.test(String(src || "").trim()); }
    prog.scopes.forEach(function (scope) {
      eachStep(scope.items, function (item) {
        if (!ok) { return; }
        var home = globalItem(item, prog) ? prog.shared : scope;
        if (item.op === "declare") {
          var entry = home.names[lowered(item["var"])];
          var sized = (item.dims || []).length && (item.dims || []).every(function (d) { return String(d).trim(); });
          var listed = item.expr && tree(item.expr).list;
          if (entry && isListKind(entry.kind)) {
            if (!(item.dims || []).length || (!sized && !listed) || (item.expr && !listed && !zeroish(item.expr))) { ok = false; return; }
            (item.dims || []).forEach(function (d) { if (String(d).trim()) { walk(tree(d), scope, ""); } });
            if (listed) { walk(tree(item.expr), scope, "init"); }
            if (sized && !listed && elemOfAll(entry.kind) === "text" && listDepth(entry.kind) > 1) { ok = false; }
            return;
          }
        }
        if ((item.op === "set" || item.op === "input") && R_JUST_A_NAME.test(item["var"] || "")) {
          var one = lookUp(scope, bareName(item["var"]));
          if (one && isListKind(one.kind)) { ok = false; return; }
        }
        if (item.op === "foreach") { walk(tree(item.over), scope, "over"); }
        else if (item.op === "call") { walk(callOf(item), scope, ""); }
        else { sumsOf(item).forEach(function (src) { walk(tree(src), scope, ""); }); }
      });
    });
    prog.mods.forEach(function (one) { if (one.gives && compoundKind(one.gives)) { ok = false; } });
    prog.scopes.concat([prog.shared]).forEach(function (scope) {
      Object.keys(scope.names).forEach(function (low) {
        var entry = scope.names[low];
        if (isTableKind(entry.kind) || isRecKind(entry.kind) || entry.kind === "fn" || entry.kind === "any") { ok = false; }
        if (isListKind(entry.kind) && (!simple(entry.kind) || entry.nullable || entry.elemNullable)) { ok = false; }
      });
    });
    prog.arrays = ok && any;
    prog.arrayDims = dims;
  }
  function elemOfAll(k) { while (isListKind(k)) { k = elemOf(k); } return k; }
  function listDepth(k) { var n = 0; while (isListKind(k)) { k = elemOf(k); n++; } return n; }

  // ---- is a loop's counter read once the loop is done? --------------------
  // Python's `for i in range(...)` leaves i on the last number it reached,
  // where the chart's For leaves it one past; and a For Each over range()
  // written as a counted `for` leaves it one past where the For Each did.
  // Neither matters unless a line goes on to read the counter before
  // anything sets it again -- and a loop whose counter nobody reads
  // afterwards can be written the way anybody would write it.  So: after
  // this loop, is the first thing done to `low` reading it?
  function readsName(src, low) {
    return tokens(src || "").some(function (tok) { return tok.t === "name" && lowered(tok.v) === low; });
  }
  // What one statement does first with the name: "read", "write" (sets it
  // without reading it, every time it runs), or "" (neither, for certain).
  function firstUse(item, low, prog) {
    function anyRead(srcs) { return srcs.some(function (src) { return readsName(src, low); }); }
    function along(items) {
      for (var i = 0; i < (items || []).length; i++) {
        var got = firstUse(items[i], low, prog);
        if (got) { return got; }
      }
      return "";
    }
    var plain = R_JUST_A_NAME.test(item["var"] || "") && lowered(bareName(item["var"])) === low;
    switch (item.op) {
      case "set": case "input": case "declare":
        if (anyRead(sumsOf(item))) { return "read"; }
        return plain || (item.op === "declare" && lowered(item["var"] || "") === low) ? "write" : "";
      case "if":
        if (anyRead(sumsOf(item))) { return "read"; }
        var a = along(item.then), b = along(item["else"]);
        return a === "read" || b === "read" ? "read" : a === "write" && b === "write" ? "write" : "";
      case "select":
        if (anyRead(sumsOf(item))) { return "read"; }
        var all = item.cases.map(function (one) { return along(one.body); });
        if (all.indexOf("read") >= 0) { return "read"; }
        var otherwise = item.cases.some(function (one) { return OTHERWISE.test(String(one.match || "").trim()); });
        return otherwise && all.every(function (k) { return k === "write"; }) ? "write" : "";
      case "while":
        return anyRead(sumsOf(item)) || along(item.body) === "read" ? "read" : "";
      case "dowhile":
        var first = along(item.body);
        return first || (anyRead(sumsOf(item)) ? "read" : "");
      case "for":
        var set = statementOf(item.init || "");
        if (set.op === "set" && readsName(set.expr, low)) { return "read"; }
        if (set.op === "set" && lowered(set.var) === low) { return "write"; }
        return anyRead(sumsOf(item)) || along(item.body) === "read" ? "read" : "";
      case "foreach":
        // going round it sets it before the body reads it; going round
        // nothing leaves it as it was, for whatever comes after
        if (readsName(item.over, low)) { return "read"; }
        if (lowered(item["var"]) === low) { return ""; }
        return along(item.body) === "read" ? "read" : "";
      default:
        return anyRead(sumsOf(item)) || targetsOf(item, prog).some(function (n) { return lowered(n) === low; })
             ? "read" : "";
    }
  }
  var LOOP_OP = { "while": 1, dowhile: 1, "for": 1, foreach: 1 };
  function counterReadAfter(prog, loop, name) {
    var low = lowered(name), cache = prog.readAfter || (prog.readAfter = []);
    for (var c = 0; c < cache.length; c++) {
      if (cache[c][0] === loop && cache[c][1] === low) { return cache[c][2]; }
    }
    var said = readAfterNow(prog, loop, low);
    cache.push([loop, low, said]);
    return said;
  }
  function readAfterNow(prog, loop, low) {
    // where the loop is: the chain of blocks round it, innermost first
    var path = null, scopeOf = null;
    prog.scopes.some(function (scope) {
      (function find(items, up) {
        for (var i = 0; i < items.length && !path; i++) {
          var here = { items: items, at: i, item: items[i], up: up };
          if (items[i] === loop) { path = here; return; }
          blocksOf(items[i]).forEach(function (block) { if (!path) { find(block, here); } });
        }
      })(scope.items, null);
      if (path) { scopeOf = scope; }
      return !!path;
    });
    if (!path) { return true; }
    for (var spot = path; spot; spot = spot.up) {
      // round again: anything else in a loop around it that touches the
      // name might read what this one left
      if (spot !== path && LOOP_OP[spot.item.op] &&
          mentionsIn([spot.item], low, prog) > mentionsIn([path.item], low, prog)) { return true; }
      for (var i = spot.at + 1; i < spot.items.length; i++) {
        var got = firstUse(spot.items[i], low, prog);
        if (got === "read") { return true; }
        if (got === "write") { return false; }
      }
    }
    // the end of the chart: read there only if somebody else can see it
    var entry = lookUp(scopeOf, low);
    return !entry || entry.shared || (entry.param && entry.ref) || scopeOf.names[low] !== entry;
  }

  // A sum with a number in it past what a 32-bit whole number holds.
  function tooBigForInt(node) {
    var found = false;
    (function look(n) {
      if (!n || found || typeof n !== "object") { return; }
      if (n.lit !== undefined && Math.abs(Number(n.lit)) > 2147483647) { found = true; return; }
      if (n.op === "^" && n.left && n.right && n.left.lit !== undefined && n.right.lit !== undefined &&
          Math.abs(Math.pow(Number(n.left.lit), Number(n.right.lit))) > 2147483647) { found = true; return; }
      kidsOf(n).forEach(look);
    })(node);
    return found;
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
      var node = typeof said === "object" ? said : tree(said), depth = [];
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
            var now = f.fixed ? f.kind : joinKinds(f.kind, kind);   // laid out with its kind: kept
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
          (function values(n) {             // a module handed over rather than called
            if (!n || typeof n !== "object") { return; }
            if (n.name && !n.field && !n.call && !lookUp(scope, n.name) && prog.byName[lowered(n.name)]) {
              prog.byName[lowered(n.name)].asValue = true;
            }
            kidsOf(n).forEach(values);
          })(node);
          eachCall(node, function (call) {
            if (lowered(call.call) === "bind" && call.args[0] && call.args[0].name && !lookUp(scope, call.args[0].name)) {
              var tied = prog.byName[lowered(call.args[0].name)];
              if (tied) {
                call.args.slice(1).forEach(function (arg, i) {
                  if (tied.params[i]) { learn(tied.params[i].entry, arg.str === "" ? "none" : kindIn(arg, scope, prog)); }
                });
              }
            }
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
          if ((item.op === "set" || item.op === "declare") && item.expr && R_JUST_A_NAME.test(item["var"] || "") && tooBigForInt(tree(item.expr))) {
            var bigOne = item.op === "declare" ? home.names[lowered(item.var)] : lookUp(scope, bareName(item.var));
            if (bigOne) { bigOne.big = true; }
          }
          if (item.op === "set") {
            if (R_JUST_A_NAME.test(item["var"] || "")) { learn(lookUp(scope, bareName(item.var)), kind(item.expr)); }
            else { learnPlace(scope, item["var"], kind(item.expr)); }
          }
          // n = float(input()), age = int(input("Age? ")): what is typed in
          // is said to be a number with a point, or a whole one
          if (item.op === "input" && (item.as === "real" || item.as === "int")) {
            if (R_JUST_A_NAME.test(item["var"] || "")) { learn(lookUp(scope, bareName(item.var)), item.as); }
            else { learnPlace(scope, item["var"], item.as); }
          }
          // Set r = "" or Set r = find(xs, 3) where find can hand back "":
          // a number that is sometimes nothing yet
          if ((item.op === "set" || item.op === "declare") && item.expr && R_JUST_A_NAME.test(item["var"] || "")) {
            var mayBe = item.op === "declare" ? home.names[lowered(item.var)] : lookUp(scope, bareName(item.var));
            if (mayBe && !mayBe.nullable && givesNothing(tree(item.expr), scope)) { mayBe.nullable = true; moved = true; }
          }
          if (item.op === "foreach") {
            learn(lookUp(scope, item["var"]), elemOf(kind(item.over)) || (kind(item.over) === "text" ? "text" : ""));
            // going round a list that can hold nothing-yet: the name can hold it too
            var overNode = tree(item.over), overOne = overNode.name && !overNode.field && !overNode.index ? lookUp(scope, overNode.name) : null;
            var eachOne = lookUp(scope, item["var"]);
            if (overOne && overOne.elemNullable && eachOne && !eachOne.nullable) { eachOne.nullable = true; moved = true; }
          }
          if (item.op === "call") {
            // append(names, "Ada"): names is a list of words
            var made = callOf(item), puts = PUTS_IN[lowered(made.call)];
            if (puts && made.args[0] && made.args[0].name && !made.args[0].field && made.args[puts]) {
              learn(lookUp(scope, made.args[0].name), "list:" + kindIn(made.args[puts], scope, prog));
              var intoList = lookUp(scope, made.args[0].name);
              if (intoList && !intoList.elemNullable && givesNothing(made.args[puts], scope)) { intoList.elemNullable = true; moved = true; }
            } else if (puts && made.args[0] && (made.args[0].index || made.args[0].field) && made.args[puts]) {
              learnPlace(scope, made.args[0], "list:" + kindIn(made.args[puts], scope, prog));
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
          if (item.op === "return" && item.expr && scope.mod && !scope.mod.givesNone && givesNothing(tree(item.expr), scope)) {
            scope.mod.givesNone = true;
            moved = true;
          }
          sumsOf(item).forEach(function (src) { calls(tree(src)); });
          if (item.op === "call") { calls(callOf(item)); }
        });
      });
    }
  }

  // "" -- nothing yet -- or a call to a Function that can hand that back
  function givesNothing(node, scope) {
    if (!node) { return false; }
    if (node.group) { return givesNothing(node.group, scope); }
    if (node.str === "") { return true; }
    // a name that can itself hold nothing-yet
    if (scope && node.name && !node.field && !node.index && !node.call) {
      var held = lookUp(scope, node.name);
      return !!(held && held.nullable);
    }
    if (node.call && !node.field) {
      var one = studiedProg && studiedProg.byName[lowered(node.call)];
      return !!(one && one.givesNone);
    }
    return false;
  }
  var studiedProg = null;
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
          // node <> "": "" there is nothing-yet, which says nothing of what node holds
          hint(node.left, within(node.right) && within(node.right).str === "" && node.op !== "+" ? "none" : b || (sum ? "int" : ""));
          hint(node.right, within(node.left) && within(node.left).str === "" && node.op !== "+" ? "none" : a || (sum ? "int" : ""));
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
                              : got.int ? "int" : got.bool ? "bool" : held || (got.none ? "none" : "");
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

  // ---- whole numbers past what an int holds --------------------------------
  // The runner's numbers are JavaScript's, and a factorial of 20, the 75th
  // Fibonacci number or 2 ^ 40 are all still exact there.  An int in Java,
  // C# or C++ stops at 2147483647 and wraps round to a negative -- or, in
  // C++, need not even do that.  So a whole number that can grow past it is
  // a long instead: one multiplied by itself round a loop, or added to from
  // two of the names that go round with it (a + b, as Fibonacci is); what a
  // recursion hands back when it multiplies by itself or adds two of itself;
  // 2 ^ n; a total that the loops it is in add up to past it; a sum of
  // numbers written down that comes to more.  And then whatever any of those
  // is handed on to: the names set from it, the parameters it is handed
  // to, the functions that hand it back.
  var INT_TOP = 2147483647;
  var R_SUM_OPS = /^(\+|-|\*|\/|div|mod|%)$/;
  var R_SAME_SIZE = /^(abs|min|max|int|integer|round|floor|ceiling|ceil|trunc|pow)$/;

  // How big it can be, from the numbers written down, the constants and the
  // counters of the Fors round it (`ranges`) -- or null, where that rests on
  // something only the run knows.
  function sizeOf(node, scope, prog, ranges) {
    if (!node) { return null; }
    if (node.group) { return sizeOf(node.group, scope, prog, ranges); }
    if (node.lit !== undefined) { var n = Number(node.lit); return isFinite(n) ? Math.abs(n) : null; }
    if (node.name && !node.field && !node.call && !node.index) {
      var low = lowered(node.name);
      if (ranges && ranges[low] !== undefined) { return ranges[low]; }
      var e = lookUp(scope, node.name);
      return e && e.constValue !== undefined ? Math.abs(e.constValue) : null;
    }
    if (node.unary === "-") { return sizeOf(node.of, scope, prog, ranges); }
    if (node.call && lowered(node.call) === "abs" && node.args && node.args.length === 1) {
      return sizeOf(node.args[0], scope, prog, ranges);
    }
    if (node.op) {
      var a = sizeOf(node.left, scope, prog, ranges), b = sizeOf(node.right, scope, prog, ranges);
      if ((node.op === "mod" || node.op === "%") && b !== null) { return a === null ? b : Math.min(a, b); }
      if (a === null || b === null) { return null; }
      switch (node.op) {
        case "+": case "-": return a + b;
        case "*": return a * b;
        case "/": case "div": return a;
        case "^": return Math.pow(a, b);
      }
    }
    return null;
  }
  // 2 ^ n: as big as n says, which only the run knows
  function powWide(base, exp, scope, prog) {
    var b = sizeOf(base, scope, prog), e = sizeOf(exp, scope, prog);
    if (b !== null && e !== null) { return Math.pow(b, e) > INT_TOP; }
    if (b !== null && b <= 1) { return false; }
    return e === null || e >= 6;
  }
  // Is what this comes to a long?
  function wideIn(node, scope, prog) {
    if (!node) { return false; }
    if (node.group) { return wideIn(node.group, scope, prog); }
    if (node.lit !== undefined) { return /^-?\d+$/.test(String(node.lit)) && Math.abs(Number(node.lit)) > INT_TOP; }
    if (node.index) {
      var at = node.index;
      while (at.index) { at = at.index; }
      var held = at.name && !at.field && !at.call ? lookUp(scope, at.name) : null;
      return !!(held && held.elemWide);
    }
    if (node.field) { return false; }
    if (node.call) {
      var low = lowered(node.call), mod = prog.byName[low];
      if (mod && !lookUp(scope, node.call)) { return !!mod.wide; }
      if (R_SAME_SIZE.test(low)) {
        return (node.args || []).some(function (a) { return wideIn(a, scope, prog); }) ||
               (low === "pow" && (node.args || []).length === 2 && powWide(node.args[0], node.args[1], scope, prog));
      }
      return false;
    }
    if (node.name) { var e = lookUp(scope, node.name); return !!(e && e.wide); }
    if (node.unary) { return node.unary === "-" && wideIn(node.of, scope, prog); }
    if (node.op === "^") {
      return wideIn(node.left, scope, prog) || wideIn(node.right, scope, prog) ||
             powWide(node.left, node.right, scope, prog);
    }
    if (R_SUM_OPS.test(node.op || "")) {
      if (wideIn(node.left, scope, prog) || wideIn(node.right, scope, prog)) { return true; }
      // 2000 * 2000 * 2000: past it by the numbers alone
      var size = sizeOf(node, scope, prog);
      return size !== null && size > INT_TOP;
    }
    return false;
  }
  // a + b - c: the things added and taken away, at the top
  function termsOf(node, out) {
    while (node && node.group) { node = node.group; }
    out = out || [];
    if (node && (node.op === "+" || node.op === "-")) { termsOf(node.left, out); termsOf(node.right, out); }
    else if (node) { out.push(node); }
    return out;
  }
  function namesIn(node, out) {
    out = out || [];
    if (!node) { return out; }
    if (node.name && !node.field && !node.call && !node.index) { out.push(lowered(node.name)); }
    kidsOf(node).forEach(function (kid) { namesIn(kid, out); });
    return out;
  }
  // A product, anywhere in it outside a MOD, one of whose sides holds one of
  // these names (and whose other side is more than 1)
  function productWith(node, hit, scope, prog) {
    if (!node) { return false; }
    if (node.group) { return productWith(node.group, hit, scope, prog); }
    if (node.op === "mod" || node.op === "%" || node.op === "/" || node.op === "div") { return false; }
    // what a call is handed, or a place picked out by, is not what it comes to
    if (node.index || (node.call && !R_SAME_SIZE.test(lowered(node.call)))) { return false; }
    if (node.op === "*") {
      var l = hit(node.left), r = hit(node.right);
      var ls = sizeOf(node.left, scope, prog), rs = sizeOf(node.right, scope, prog);
      if ((l && !(rs !== null && rs <= 1)) || (r && !(ls !== null && ls <= 1))) { return true; }
    }
    if (node.op === "^" && hit(node.left)) { return true; }
    return kidsOf(node).some(function (kid) { return productWith(kid, hit, scope, prog); });
  }
  function topOf(node) { while (node && node.group) { node = node.group; } return node; }
  // memo[n]: the list of whole numbers it is a place in, or null
  function intListOf(node, scope) {
    if (!node || !node.index || node.index.index) { return null; }
    var at = node.index;
    var e = at.name && !at.field && !at.call ? lookUp(scope, at.name) : null;
    return e && e.kind === "list:int" ? e : null;
  }
  // ...or the table of them -- a table whose values are whole numbers
  function intTableOf(node, scope) {
    if (!node || !node.index || node.index.index) { return null; }
    var at = node.index;
    var e = at.name && !at.field && !at.call ? lookUp(scope, at.name) : null;
    return e && isTableKind(e.kind) && tableValue(e.kind) === "int" ? e : null;
  }

  function wideNames(prog) {
    prog.scopes.concat([prog.shared]).forEach(function (scope) {
      Object.keys(scope.names).forEach(function (low) {
        var e = scope.names[low];
        e.wide = e.kind === "int" && !!e.big;
        e.elemWide = false;
      });
    });
    prog.mods.forEach(function (one) { one.wide = false; });
    // the constants, by what they are
    prog.scopes.forEach(function (scope) {
      eachStep(scope.items, function (item) {
        if (item.op !== "declare" || !item["const"] || !item.expr) { return; }
        var home = globalItem(item, prog) ? prog.shared : scope, e = home.names[lowered(item["var"])];
        var n = sizeOf(tree(item.expr), scope, prog);
        if (e && n !== null && e.kind === "int") { e.constValue = n; }
      });
    });
    function widen(e) { if (e && !e.wide && e.kind === "int") { e.wide = true; return true; } return false; }

    prog.scopes.forEach(function (scope) {
      // round a loop: multiplied by itself, or added to from two that go
      // round with it
      eachStep(scope.items, function (loop) {
        if (!LOOP_OP[loop.op]) { return; }
        var sets = [], from = Object.create(null);
        eachStep(loop.body || [], function (st) {
          if (st.op !== "set" || !R_JUST_A_NAME.test(st["var"] || "")) { return; }
          var e = lookUp(scope, bareName(st["var"]));
          if (!e || e.kind !== "int") { return; }
          var low = lowered(bareName(st["var"])), node = tree(st.expr);
          sets.push({ low: low, entry: e, node: node });
          from[low] = (from[low] || []).concat(namesIn(node));
        });
        function reaches(a, b) {
          var seen = Object.create(null), todo = (from[a] || []).slice();
          while (todo.length) {
            var x = todo.pop();
            if (x === b) { return true; }
            if (seen[x]) { continue; }
            seen[x] = true;
            todo.push.apply(todo, from[x] || []);
          }
          return false;
        }
        sets.forEach(function (s) {
          var top = topOf(s.node);
          if (s.entry.wide || !top || top.op === "mod" || top.op === "%") { return; }
          var round = function (u) { return u === s.low ? reaches(s.low, s.low) : reaches(s.low, u) && reaches(u, s.low); };
          var hit = function (node) { return namesIn(node).some(round); };
          var feeding = termsOf(s.node).filter(function (t) {
            return t.name && !t.field && !t.call && !t.index && round(lowered(t.name));
          }).length;
          if (productWith(s.node, hit, scope, prog) || feeding >= 2) { widen(s.entry); }
        });
        eachStep(loop.body || [], function (st) {
          if (st.op !== "set" || R_JUST_A_NAME.test(st["var"] || "")) { return; }
          var target = tree(st["var"]), list = intListOf(target, scope), node = tree(st.expr);
          if (!list || list.elemWide || topOf(node).op === "mod" || topOf(node).op === "%") { return; }
          // another place in the same list: memo[i - 1], not xs[i] itself
          var here = JSON.stringify(target.at);
          var mine = function (n) {
            var got = false;
            (function look(x) {
              if (!x || got) { return; }
              if (intListOf(x, scope) === list && JSON.stringify(x.at) !== here) { got = true; }
              kidsOf(x).forEach(look);
            })(n);
            return got;
          };
          if (termsOf(node).filter(mine).length >= 2 || productWith(node, mine, scope, prog)) { list.elemWide = true; }
        });
      });
      // past it by what the Fors round it count to
      (function walk(items, trips, ranges) {
        (items || []).forEach(function (item) {
          var plain = R_JUST_A_NAME.test(item["var"] || "");
          if ((item.op === "set" || item.op === "declare") && plain && item.expr) {
            var home = item.op === "declare" && globalItem(item, prog) ? prog.shared : scope;
            var e = item.op === "declare" ? home.names[lowered(item["var"])] : lookUp(scope, bareName(item["var"]));
            if (e && e.kind === "int" && !e.wide) {
              var low = lowered(bareName(item["var"])), node = tree(item.expr), terms = termsOf(node);
              var mine = terms.filter(function (t) { return t.name && !t.field && !t.call && !t.index && lowered(t.name) === low; });
              var size;
              if (mine.length === 1 && namesIn(node).filter(function (n) { return n === low; }).length === 1) {
                var rest = terms.filter(function (t) { return t !== mine[0]; });
                var each = rest.reduce(function (sum, t) {
                  var one = sizeOf(t, scope, prog, ranges);
                  return sum === null || one === null ? null : sum + one;
                }, 0);
                size = each === null || trips === null ? null : each * trips;
              } else if (namesIn(node).indexOf(low) < 0) {
                size = sizeOf(node, scope, prog, ranges);
              }
              if (size !== null && size !== undefined && size > INT_TOP) { widen(e); }
            }
          }
          if (item.op === "for") {
            var set = statementOf(item.init || ""), test = /^\s*[A-Za-z_]\w*\s*(<=|<|>=|>)\s*(.+)$/.exec(String(item.cond || ""));
            var a = set.op === "set" ? sizeOf(tree(set.expr), scope, prog, ranges) : null;
            var b = test ? sizeOf(tree(test[2]), scope, prog, ranges) : null;
            var inner = Object.assign(Object.create(null), ranges);
            if (set.op === "set") { inner[lowered(set["var"])] = a === null || b === null ? undefined : Math.max(a, b) + 1; }
            walk(item.body, trips === null || a === null || b === null ? null : trips * (a + b + 1), inner);
            return;
          }
          blocksOf(item).forEach(function (block) { walk(block, LOOP_OP[item.op] ? null : trips, ranges); });
        });
      })(scope.items, 1, Object.create(null));
    });
    // a recursion that multiplies by itself, or adds two of itself
    prog.mods.forEach(function (one) {
      if (one.gives !== "int") { return; }
      var me = lowered(one.name);
      var hit = function (node) { var got = false; eachCall(node, function (c) { if (lowered(c.call) === me) { got = true; } }); return got; };
      eachStep(one.body, function (item) {
        if (!((item.op === "return" || item.op === "set") && item.expr)) { return; }
        var node = tree(item.expr);
        var selves = termsOf(node).filter(hit).length;
        if (selves >= 2 || productWith(node, hit, one.scope, prog)) { one.wide = true; }
      });
    });

    // and on to whatever any of it is handed to, until nothing more changes
    var moved = true, rounds = 0;
    while (moved && rounds++ < 40) {
      moved = false;
      prog.scopes.forEach(function (scope) {
        var mod = scope.mod;
        eachStep(scope.items, function (item) {
          var plain = R_JUST_A_NAME.test(item["var"] || "");
          if ((item.op === "set" || item.op === "declare") && item.expr && plain) {
            var home = item.op === "declare" && globalItem(item, prog) ? prog.shared : scope;
            var e = item.op === "declare" ? home.names[lowered(item["var"])] : lookUp(scope, bareName(item["var"]));
            if (wideIn(tree(item.expr), scope, prog) && widen(e)) { moved = true; }
          }
          if (item.op === "for") {
            var set = statementOf(item.init || "");
            if (set.op === "set" && wideIn(tree(set.expr), scope, prog) && widen(lookUp(scope, set["var"]))) { moved = true; }
          }
          // For Each n In memo: n is as long as what memo holds
          if (item.op === "foreach") {
            var over = tree(item.over || "");
            var from = over.name && !over.field && !over.index && !over.call ? lookUp(scope, over.name) : null;
            if (from && from.elemWide && from.kind === "list:int" && widen(lookUp(scope, String(item["var"] || "").trim()))) { moved = true; }
          }
          if (item.op === "set" && plain && item.expr) {
            var whole = lookUp(scope, bareName(item["var"]));
            if (whole && whole.kind === "list:int") {
              namesIn(tree(item.expr)).forEach(function (n) {
                var other = lookUp(scope, n);
                if (other && other !== whole && other.kind === "list:int" && !!other.elemWide !== !!whole.elemWide) {
                  other.elemWide = whole.elemWide = true;
                  moved = true;
                }
              });
            }
          }
          if (item.op === "set" && !plain && item.expr) {
            var into = intListOf(tree(item["var"]), scope) || intTableOf(tree(item["var"]), scope);
            if (into && !into.elemWide && wideIn(tree(item.expr), scope, prog)) { into.elemWide = true; moved = true; }
          }
          if (item.op === "return" && mod && item.expr && mod.gives === "int" && !mod.wide &&
              wideIn(tree(item.expr), scope, prog)) { mod.wide = true; moved = true; }
          var calls = [];
          sumsOf(item).forEach(function (src) { eachCall(tree(src), function (c) { calls.push(c); }); });
          if (item.op === "call") { calls.push(callOf(item)); }
          calls.forEach(function (c) {
            var m = prog.byName[lowered(c.call)];
            // append(memo, big): a list of longs
            if (!m && /^(append|insert)$/.test(lowered(c.call)) && c.args && c.args.length >= 2) {
              var onto = c.args[0], last = c.args[c.args.length - 1];
              var held = onto.name && !onto.field && !onto.index && !onto.call ? lookUp(scope, onto.name) : null;
              if (held && held.kind === "list:int" && !held.elemWide && wideIn(last, scope, prog)) { held.elemWide = true; moved = true; }
              return;
            }
            if (!m || lookUp(scope, c.call)) { return; }
            (c.args || []).forEach(function (arg, i) {
              var p = m.params[i];
              var ints = p && p.entry && (p.entry.kind === "list:int" ||
                                          (isTableKind(p.entry.kind) && tableValue(p.entry.kind) === "int"));
              if (ints && arg.name && !arg.field && !arg.index && !arg.call) {
                var given = lookUp(scope, arg.name);
                if (given && given.kind === p.entry.kind && !!given.elemWide !== !!p.entry.elemWide) {
                  given.elemWide = p.entry.elemWide = true;
                  moved = true;
                }
              }
              if (!p || !p.entry || p.entry.kind !== "int") { return; }
              if (wideIn(arg, scope, prog) && widen(p.entry)) { moved = true; }
              // handed by reference: what comes back is as wide as where it went
              if (p.ref && p.entry.wide && arg.name && !arg.field && !arg.index && !arg.call &&
                  widen(lookUp(scope, arg.name))) { moved = true; }
            });
          });
        });
      });
    }
  }

  // ---- main's own names ------------------------------------------------------
  // A Declare in the program's own flow, outside every module, is the
  // program's: any module can read it.  One that no module so much as
  // mentions is main's, and is declared as main's own -- a local of main,
  // where it was a field of the class or a global of the file, and given its
  // value where it is first given one.  prog.localItems holds its Declares.
  function globalItem(item, prog) {
    return item.scope === "global" && !(prog && prog.localItems && prog.localItems.has(item));
  }
  function localNames(prog) {
    prog.localItems = new Set();
    Object.keys(prog.shared.names).forEach(function (low) {
      var e = prog.shared.names[low];
      if (prog.main.names[low] || !e.spots.length || e.spots.some(function (s) { return s.item["const"]; })) { return; }
      if (prog.mods.some(function (m) {
        return mentionsIn(m.scope.items, low, prog) > 0 ||
               m.params.some(function (p) { return lowered(p.name) === low; });
      })) { return; }
      var mine = [];
      eachStep(prog.main.items, function (item) { mine.push(item); });
      if (!e.spots.every(function (s) { return mine.indexOf(s.item) >= 0; })) { return; }
      delete prog.shared.names[low];
      e.shared = false;
      prog.main.names[low] = e;
      e.spots.forEach(function (s) { prog.localItems.add(s.item); });
    });
  }

  // ---- declared where it is first given something -------------------------
  // Declare Integer index at the top, then three Fors that count with it:
  // one name to the runner, but nothing ever reads the nought it starts as,
  // so each For declares its own -- and a name set first thing inside a
  // loop is declared there, inside the loop.  It is how anybody would write
  // it, and a line shorter for every one.  Where the nought could be read,
  // or a use is somewhere the declaring line would not reach, the name
  // stays declared where it was.  prog.declares holds, for each statement
  // that declares names this way, the names it declares.
  function tightNames(prog) {
    prog.declares = new Map();
    prog.before = new Map();             // statement -> names declared just before it
    prog.scopes.forEach(function (scope) {
      // how many statements give each name a whole new value: none, and
      // JavaScript can call it a const
      Object.keys(scope.names).forEach(function (low) {
        var entry = scope.names[low];
        entry.writes = 0;
        eachStep(scope.items, function (item) { if (writesWhole(item, low, entry.kind, prog)) { entry.writes++; } });
      });
      Object.keys(scope.names).forEach(function (low) {
        var entry = scope.names[low], items = null;
        if (entry.param || entry.shared || entry.born || entry.perLoop || !entry.kind ||
            entry.kind === "any" || entry.kind === "none" || prog.shared.names[low]) { return; }
        if (entry.spots.length === 1) {
          var spot = entry.spots[0], at = spot.block.indexOf(spot.item);
          if (entry.hoist || spot.item.expr || (spot.item.dims || []).length || spot.item["const"] ||
              globalItem(spot.item, prog) || spot.inCase || at < 0 ||
              !/^(int|real|text|bool)$/.test(entry.kind)) { return; }
          items = spot.block.slice(at + 1);
          if (mentionsIn(items, low, prog) + 1 !== mentionsIn(scope.items, low, prog)) { return; }
        } else if (!entry.spots.length && entry.hoist) {
          items = scope.items;
        } else { return; }
        // a module that reads a name of main's without one of its own: in
        // Python that is main's, left at the top of the file
        if (prog.scopes.some(function (other) {
          return other !== scope && !other.names[low] && mentionsIn(other.items, low, prog) > 0;
        })) { return; }
        var found = [];
        if (!placesIn(items, low, prog, found)) {
          // A name nobody declared: declared just before the first line of
          // the chart that uses it, rather than at the very top
          if (!entry.spots.length) {
            for (var at0 = 0; at0 < items.length && !mentionsIn([items[at0]], low, prog); at0++) { /* to it */ }
            if (at0 < items.length) {
              items = items.slice(at0);
              entry.hoist = false;
              var here = prog.before.get(scope.items[at0]) || [];
              here.push(entry);
              prog.before.set(scope.items[at0], here);
            }
          }
          // given something on every way through before anything reads it:
          // the nought is never seen, so it is declared without one
          if (firstUseIn(items, low, prog) === "write") { entry.bare = true; }
          return;
        }
        // declared, and never used again: nothing to write at all
        entry.tight = true;
        entry.hoist = false;
        found.forEach(function (item) {
          var list = prog.declares.get(item) || [];
          list.push(entry);
          prog.declares.set(item, list);
        });
        // given something nowhere but where it is declared: JavaScript's const
        entry.once = entry.writes === found.length &&
                     found.every(function (item) { return item.op === "set" || item.op === "input"; });
      });
    });
  }
  // Where among these statements `low` can be declared, with the statements
  // that declare it put in `found`: every use inside the braces of one of
  // them, and nothing reading the name before it is given something.  The
  // first statement to use it gives it something (Set, Input) and declares
  // it for the rest; or every statement that uses it keeps it to itself --
  // a For that counts with it, or an If or a loop inside which the same
  // holds -- and gives it something before anything reads it.
  function placesIn(items, low, prog, found) {
    var users = (items || []).filter(function (st) { return mentionsIn([st], low, prog) > 0; });
    if (!users.length) { return true; }
    if (givesFirst(users[0], low) && firstUse(users[0], low, prog) === "write") {
      found.push(users[0]);
      return true;
    }
    return users.every(function (st) {
      if (givesFirst(st, low)) { return false; }
      if (countsWith(st, low)) {
        if (st.op === "for" && firstUse(st, low, prog) !== "write") { return false; }
        var again = false;
        eachStep(st.body, function (inner) { if (countsWith(inner, low)) { again = true; } });
        if (again) { return false; }
        found.push(st);
        return true;
      }
      // inside, it is declared before anything reads it, or this fails
      if (firstUse(st, low, prog) === "read") { return false; }
      // a Select's cases share one pair of braces when it is a switch
      if (st.op === "select" || !blocksOf(st).length || wordsOf(st, prog).indexOf(low) >= 0) { return false; }
      return blocksOf(st).every(function (block) { return placesIn(block, low, prog, found); });
    });
  }
  // Does this statement give the name a whole new value?  A place in a
  // list, a table or a record put into is the same list, table or record;
  // a letter of some words put back is the words made again.
  function writesWhole(item, low, kind, prog) {
    if ((item.op === "set" || item.op === "input") && !R_JUST_A_NAME.test(item["var"] || "")) {
      return lowered(bareName(item["var"])) === low && !isListKind(kind) && !isTableKind(kind) && !isRecKind(kind);
    }
    if (item.op === "call" && CHANGES_ITS_FIRST[lowered(item.name || "")] && !isListKind(kind) && !isTableKind(kind)) {
      var first = pieces(item.args || "")[0];
      if (first && lowered(String(first).trim()) === low) { return true; }
    }
    return targetsOf(item, prog).some(function (n) { return lowered(String(n).trim()) === low; });
  }
  function firstUseIn(items, low, prog) {
    for (var i = 0; i < (items || []).length; i++) {
      var got = firstUse(items[i], low, prog);
      if (got) { return got; }
    }
    return "";
  }
  function givesFirst(st, low) {         // Set low = ..., Input low
    return (st.op === "set" || st.op === "input") && R_JUST_A_NAME.test(st["var"] || "") &&
           lowered(bareName(st["var"])) === low;
  }
  function countsWith(st, low) {         // For low = ..., For Each low In ...
    if (st.op === "for") {
      var set = statementOf(st.init || "");
      return set.op === "set" && lowered(set["var"] || "") === low;
    }
    return st.op === "foreach" && lowered(String(st["var"] || "").trim()) === low && !readsName(st.over, low);
  }
