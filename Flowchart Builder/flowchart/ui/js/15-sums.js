// ---------------------------------------------------------------------------
//  15-sums.js -- working out what an expression comes to
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ---- numbers, words and what they mean --------------------------------
  // Every piece carries where in the line it was found.  It costs two
  // numbers per word and it is what turns "I did not expect that" into a
  // caret sitting under the thing that was not expected.
  function tokens(src) {
    var out = [], i = 0, s = String(src || "");
    var two = ["<=", ">=", "<>", "!=", "==", ":=", "&&", "||"];
    while (i < s.length) {
      var c = s[i], from = i;
      if (/\s/.test(c)) { i++; continue; }
      if (c === '"' || c === "'") {
        var end = s.indexOf(c, i + 1);
        var open = end < 0;              // a quote mark that never comes back
        if (open) { end = s.length; }
        i = open ? end : end + 1;
        out.push({ t: "str", v: s.slice(from + 1, end), open: open,
                   from: from, to: i });
        continue;
      }
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(s[i + 1] || ""))) {
        var num = /^[0-9]*\.?[0-9]+/.exec(s.slice(i))[0];
        i += num.length;
        out.push({ t: "num", v: parseFloat(num), from: from, to: i });
        continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        var name = /^[A-Za-z_]\w*/.exec(s.slice(i))[0];
        i += name.length;
        out.push({ t: "name", v: name, from: from, to: i });
        continue;
      }
      var pair = s.substr(i, 2);
      if (two.indexOf(pair) >= 0) {
        i += 2;
        out.push({ t: "op", v: pair, from: from, to: i });
        continue;
      }
      i++;
      out.push({ t: "op", v: c, from: from, to: i });
    }
    return out;
  }

  // ---- saying where, and saying what was probably meant -----------------
  // An error thrown out of an expression knows what it could not do and
  // nothing whatever about where it was asked to do it.  "Nothing has been
  // put in tally yet" is half an answer while four lines mention tally; the
  // same words, with the line printed and the word underlined, are the
  // whole one.  So every throw from in here carries the piece of the line
  // it happened at, and the first frame that knows which statement that
  // line belongs to writes that on as well.
  function wrong(message, tok, tip, fix) {
    var err = new Error(message);
    if (tok) { err.from = tok.from; err.to = tok.to; }
    if (tip) { err.tip = tip; }
    // What would put it right, where the tip is something the page can do
    // rather than only say.  It travels with the error because the error is
    // what reaches the tape, and the statement it belongs to -- and so the
    // line it is on -- is written on by the frame above (see blame).
    if (fix) { err.fix = fix; }
    return err;
  }

  // The innermost frame wins: an error raised deep inside a module keeps
  // pointing at the line inside the module, not at the call that led there.
  function spotIn(err, src, tok) {
    if (!err || err instanceof Stop || err instanceof Returned || err instanceof LeftLoop) { return err; }
    if (err.bit === undefined) {
      err.bit = src;
      if (tok && err.from === undefined) { err.from = tok.from; err.to = tok.to; }
    }
    return err;
  }

  // How many single-letter changes apart two words are -- the usual table,
  // one row of it at a time, which is all that is needed to tell a typo
  // from a different word.
  function apart(a, b) {
    var row = [], i, j, was, now;
    for (j = 0; j <= b.length; j++) { row[j] = j; }
    for (i = 1; i <= a.length; i++) {
      was = row[0];
      row[0] = i;
      for (j = 1; j <= b.length; j++) {
        now = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1,
                          was + (a[i - 1] === b[j - 1] ? 0 : 1));
        was = now;
      }
    }
    return row[b.length];
  }

  // The name that was probably meant.  Only when it is close enough to be a
  // slip of the fingers rather than a different word altogether: a third of
  // the length, and always at least one, so tally finds total but count
  // does not find total.
  function nearest(name, names) {
    var low = String(name).toLowerCase(), best = null, near = 99;
    (names || []).forEach(function (one) {
      var gap = apart(low, String(one).toLowerCase());
      if (gap < near) { near = gap; best = one; }
    });
    return (best && near <= Math.max(1, Math.floor(low.length / 3))) ? best : null;
  }

  function knownCalls() {               // everything that can be called
    return (AST && AST.modules || []).map(function (m) { return m.name; })
           .concat(Object.keys(BUILT));
  }

  var RANK = { "or": 1, "||": 1, "and": 2, "&&": 2, "=": 3, "==": 3, "!=": 3,
               "<>": 3, "<": 4, "<=": 4, ">": 4, ">=": 4, "in": 4, "not in": 4, "+": 5, "-": 5,
               "*": 6, "/": 6, "mod": 6, "%": 6, "div": 6, "^": 7 };

  // Working an expression out can mean running a whole chart: a call in the
  // middle of a sum walks into the module it names, and that module can stop
  // to be typed into, light its shapes up and be stopped halfway like any
  // other chart.  So this waits, all the way down -- which is the price of a
  // call being a real call rather than a guess at what one would have
  // returned.
  async function value(src, where) {     // work out what an expression comes to
    // Nothing to work out at all -- a While with no test after it, a Set
    // with nothing on the right.  Said plainly, rather than as a half of
    // something that was never there.
    if (!String(src === undefined || src === null ? "" : src).trim()) {
      var none = wrong(TXT.r_empty_expr, { from: 0, to: 1 });
      none.why = "r_empty_expr";
      throw none;
    }
    var ts = tokens(src), at = 0;
    var dry = 0;                         // > 0: reading past, not working out
    function peek() { return ts[at]; }
    function isOp(v) { var t = ts[at]; return !!t && t.t === "op" && t.v === v; }
    function take() { return ts[at++]; }
    function ended() {                   // a token's worth of "right here"
      var last = ts[ts.length - 1];
      var end = last ? last.to : String(src || "").length;
      return { from: Math.max(0, end - 1), to: end };
    }
    function word(tok) {
      return tok && tok.t === "name" ? String(tok.v).toLowerCase() : null;
    }
    // A quote or a bracket left open: shut, where there is one right place
    // to shut it -- which only the pseudocode box can say, so planRight
    // decides.  `rest` is whether more was written after the bracket.
    function shutAtEnd(text, rest) {
      return { how: "close", bit: String(src), text: text, rest: !!rest };
    }
    // A piece where it makes no sense, taken out; or one put in in front of
    // a piece -- what puts right a stray bracket, or two values with nothing
    // between them
    function cutOut(tok) {
      return { how: "cut", bit: String(src), from: tok.from, to: tok.to,
               what: String(src).slice(tok.from, tok.to) };
    }
    function putAfter(tok, text) {
      return { how: "put", bit: String(src), from: tok.to, text: text };
    }
    function bracketsOpen() {
      var deep = 0;
      ts.forEach(function (t) {
        if (t.t === "op" && t.v === "(") { deep++; }
        if (t.t === "op" && t.v === ")") { deep--; }
      });
      return shutAtEnd(new Array(Math.max(1, deep) + 1).join(")"), !!peek());
    }
    // The words an argument was written as, not only what it came to.  A
    // module handed a variable by reference gives its answer back into that
    // variable, and to do that the call has to remember which one it was.
    function between(a, b) {
      return (a < b && ts[a]) ? String(src).slice(ts[a].from, ts[b - 1].to) : "";
    }
    // What is handed to a call: the values, and the words each was written
    // as (see between).  `first` is a value already worked out that goes
    // in front of them -- the list in names.append(x), said the other way.
    async function handed(opened, first) {
      var args = first === undefined ? [] : [first], given = first === undefined ? [] : [""];
      var from;
      if (peek() && !isOp(")")) {
        from = at;
        args.push(await expr(0));
        given.push(between(from, at));
        while (isOp(",")) {
          take();
          from = at;
          args.push(await expr(0));
          given.push(between(from, at));
        }
      }
      if (!isOp(")")) {
        throw wrong(TXT.r_open_bracket, opened, "", bracketsOpen());
      }
      take();
      return { args: args, given: given };
    }
    async function primary() {
      var tok = peek();
      if (tok && tok.t === "op" && (tok.v === "-" || tok.v === "+")) {
        take();
        var one = await primary();
        return tok.v === "-" ? -Number(one) : Number(one);
      }
      if (tok && tok.t === "name" && String(tok.v).toLowerCase() === "not") {
        take();
        return !truthy(await primary());
      }
      return await after(await atom());
    }
    // What comes straight after a value: an item of it -- scores[i],
    // grid[y][x] -- or a part of it -- p.x -- as many as are written, and
    // a call made on it: names.append(x) is append(names, x).
    async function after(v) {
      while (peek() && peek().t === "op" && (peek().v === "[" || peek().v === ".")) {
        var op = take();
        if (op.v === "[") {
          var pick = await expr(0);
          if (!isOp("]")) { throw wrong(TXT.r_open_square, op, "", shutAtEnd("]", !!peek())); }
          take();
          if (dry) { continue; }
          try { v = itemOf(v, pick); } catch (bad) { throw spotIn(bad, src, op); }
          continue;
        }
        var nm = take();
        if (!nm || nm.t !== "name") { throw wrong(say("r_odd_here", { bit: "." }), op, "", cutOut(op)); }
        if (isOp("(")) {
          var opened = take();
          var got = await handed(opened, v);
          if (dry) { continue; }
          try {
            v = await callOut(String(nm.v), got.args, where, got.given);
          } catch (bad) {
            throw spotIn(bad, src, nm);
          }
          continue;
        }
        if (dry) { continue; }
        try { v = fieldOf(v, String(nm.v)); } catch (bad) { throw spotIn(bad, src, nm); }
      }
      return v;
    }
    async function atom() {
      var tok = take();
      if (!tok) {
        // an operator with nothing after it: taken off
        var hanging = ts[ts.length - 1];
        throw wrong(say("r_half", { bit: src }), ended(), "",
                    hanging && hanging.t === "op" ? cutOut(hanging) : null);
      }
      if (tok.t === "str" && tok.open) {
        throw wrong(TXT.r_open_quote, tok, "", shutAtEnd(String(src).charAt(tok.from)));
      }
      if (tok.t === "num" || tok.t === "str") { return tok.v; }
      if (tok.t === "op" && tok.v === "(") {
        var inside = await expr(0);
        // (3, 4): a tuple -- a list that says it is a few things together,
        // and is printed in round brackets, the way Python and C# print one
        if (isOp(",")) {
          var together = [inside];
          while (isOp(",")) {
            take();
            if (isOp(")")) { break; }
            together.push(await expr(0));
          }
          if (!isOp(")")) { throw wrong(TXT.r_open_bracket, tok, "", bracketsOpen()); }
          take();
          together.tuple = true;
          return together;
        }
        if (!isOp(")")) {
          throw wrong(TXT.r_open_bracket, tok, "", bracketsOpen());
        }
        take();
        return inside;
      }
      // [1, 2, 3], a list written out
      if (tok.t === "op" && tok.v === "[") {
        var items = [];
        while (peek() && !isOp("]")) {
          items.push(await expr(0));
          if (!isOp(",")) { break; }
          take();
        }
        if (!isOp("]")) { throw wrong(TXT.r_open_square, tok, "", shutAtEnd("]", !!peek())); }
        take();
        return items;
      }
      // {"a": 1, "b": 2}, a table written out
      if (tok.t === "op" && tok.v === "{") {
        var made = new Table(""), loose = [], keyed = false;
        while (peek() && !isOp("}")) {
          var k = await expr(0);
          if (isOp(":")) {
            take();
            made.put(k, await expr(0));
            keyed = true;
          } else { loose.push(k); }
          if (!isOp(",")) { break; }
          take();
        }
        if (!isOp("}")) { throw wrong(say("r_odd_here", { bit: "{" }), tok, "", shutAtEnd("}", !!peek())); }
        take();
        return keyed || !loose.length ? made : loose;
      }
      if (tok.t === "name") {
        var name = String(tok.v), low = name.toLowerCase();
        if (low === "true") { return true; }
        if (low === "false") { return false; }
        // New Point: a record of that kind with nothing in it yet
        if (low === "new" && peek() && peek().t === "name") {
          var kind = String(take().v);
          if (isOp("(")) {
            var open2 = take(), made2 = await handed(open2);
            if (dry) { return undefined; }
            if (made2.args.length && moduleNamed(kind)) {
              return await callOut(kind, made2.args, where, made2.given);
            }
            // a record laid out field by field (TYPE, RECORD): its values
            // handed over in the order its fields were written
            var laid = recordLaid(kind);
            if (laid) { return recordMade(laid, made2.args); }
          }
          return recordLaid(kind) ? recordMade(recordLaid(kind)) : new Table(kind);
        }
        if (isOp("(")) {    // a call, ours or a built-in
          var opened = take();
          var got = await handed(opened);
          if (dry) { return undefined; }
          try {
            return await callOut(name, got.args, where, got.given);
          } catch (bad) {
            throw spotIn(bad, src, tok);
          }
        }
        if (dry) { return undefined; }
        var box = holderOf(where, name);
        if (box) { return box[sameName(box, name)]; }
        // a module named where a value goes: the module itself, handed
        // over to be called -- sort(people, byAge)
        var mod = moduleNamed(name);
        if (mod) { return new FnRef(mod, null); }
        if (low === "newline") { return "\n"; }
        if (low === "tab") { return "\t"; }
        if (low === "infinity") { return Infinity; }
        if (BUILT[low] && (isOp(")") || isOp(","))) {
          return new FnRef(null, low);
        }
        var meant = nearest(name, seenNames(where));
        var lost = wrong(say("r_unknown", { name: name }), tok,
                         meant ? say("r_mean", { name: meant }) : "",
                         meant ? { how: "change", word: name, instead: meant } : null);
        // what it is and whose, for asking what it should start out as
        // (27-ask.js) -- a list, where an item of it was being picked out
        lost.why = "r_unknown"; lost.name = name; lost.listy = isOp("[");
        throw lost;
      }
      if (tok.v === ")") { throw wrong(TXT.r_shut_bracket, tok, "", cutOut(tok)); }
      throw wrong(say("r_odd_here", { bit: tok.v }), tok, "", cutOut(tok));
    }
    async function expr(least) {
      var left = await primary();
      while (peek()) {
        var tok = peek();
        var op = tok.t === "op" ? tok.v : word(tok);
        // x not in xs: two words, one test
        if (op === "not" && ts[at + 1] && ts[at + 1].t === "name" && word(ts[at + 1]) === "in") { op = "not in"; }
        var rank = RANK[op];
        if (!rank || rank < least) { break; }
        take();
        if (op === "not in") { take(); }
        // AND with a false on its left, OR with a true: the answer is
        // known, and the right is read past without being worked out --
        // so i < n AND list[i] > 0 never looks past the end of the list
        var settled = !dry && ((op === "and" || op === "&&") && !truthy(left) ||
                               (op === "or" || op === "||") && truthy(left));
        if (settled) {
          dry++;
          try { await expr(rank + 1); } finally { dry--; }
          left = truthy(left);
          continue;
        }
        var rightAt = at;
        var right = await expr(rank + 1);
        if (dry) { continue; }
        try {
          left = apply(op, left, right);
        } catch (bad) {
          // what it was divided by, as written, for the fix that asks
          // what to do when it is nought (27-ask.js)
          if (bad && bad.why === "r_zero" && bad.divisor === undefined) {
            bad.divisor = between(rightAt, at);
          }
          throw spotIn(bad, src, tok);   // which + or / it was that failed
        }
      }
      return left;
    }
    try {
      var got = await expr(0);
      // Anything still sitting there when the expression is finished is
      // something nobody can use: a stray bracket, a second equals sign, a
      // word with no operator in front of it.  It used to be dropped
      // without a word, so "Set n = 5 6" quietly meant five.
      // Words and then a value with nothing between them -- "Total:" total --
      // want the , that lists them; anything else left over is taken out.
      if (peek()) {
        var over = peek(), last = ts[at - 1];
        var listed = last && last.t === "str" && (over.t === "name" || over.t === "num" || over.t === "str");
        throw wrong(say("r_left_over", { bit: String(over.v) }), over, "",
                    listed ? putAfter(last, ",") : cutOut(over));
      }
      return got;
    } catch (bad) {
      throw spotIn(bad, src);
    }
  }

  // ---- lists, tables and records ------------------------------------------
  // A list is a list: [3, 1, 2], a JavaScript array, handed about by
  // reference the way Python, Java and JavaScript all hand theirs, so a
  // module given a list and adding to it adds to the one it was given.
  //
  // A table holds values under keys -- a dictionary, {"tea": 2} -- and a
  // record is a table with a kind: New Point, which holds x and y.  Keys
  // are kept by what they are, so 1 and "1" are two keys and (2, 3) is one.
  var tablesMade = 0;
  function Table(kind) {
    this.kind = kind || "";
    this.map = new Map();                 // key's spelling -> [key, value]
    this.id = ++tablesMade;
  }
  Table.prototype.get = function (k) { return this.map.get(keyOf(k)); };
  Table.prototype.put = function (k, v) {
    var at = this.map.get(keyOf(k));
    if (at) { at[1] = v; } else { this.map.set(keyOf(k), [k, v]); }
  };
  Table.prototype.drop = function (k) { return this.map["delete"](keyOf(k)); };
  Table.prototype.keys = function () {
    return Array.from(this.map.values()).map(function (e) { return e[0]; });
  };
  Table.prototype.values = function () {
    return Array.from(this.map.values()).map(function (e) { return e[1]; });
  };
  function isTable(v) { return v instanceof Table; }

  // A record the program laid out field by field -- Cambridge's TYPE ...
  // ENDTYPE, AQA's RECORD ... ENDRECORD (parse/boards.py) -- by its name:
  // { name, fields: [[field, type], ...] }, or null.
  function recordLaid(kind) {
    var all = AST && AST.records;
    if (!all || !kind) { return null; }
    var low = String(kind).toLowerCase();
    for (var name in all) {
      if (name.toLowerCase() === low) { return { name: name, fields: all[name] }; }
    }
    return null;
  }
  // ... and one of them, every field holding what its type starts out as,
  // or what was handed over for it.
  function recordMade(laid, given) {
    var made = new Table(laid.name);
    laid.fields.forEach(function (f, k) {
      made.put(f[0], given && k < given.length ? given[k] : blankOf(f[1]));
    });
    return made;
  }
  function keyOf(k) {
    if (typeof k === "number" || typeof k === "boolean") { return "n" + Number(k); }
    if (Array.isArray(k)) { return "l" + k.map(keyOf).join("\u0001"); }
    if (isTable(k)) { return "t" + k.id; }
    return "s" + String(k);
  }
  // A module, or a built-in, handed over as a value: sort(people, byAge).
  function FnRef(mod, built) { this.mod = mod; this.built = built; }
  function moduleNamed(name) {
    var low = String(name).toLowerCase();
    return (AST && AST.modules || []).filter(function (m) {
      return m.name.toLowerCase() === low;
    })[0] || null;
  }
  // What a value is, in a word, for saying what it is not.
  function whatIs(v) {
    if (Array.isArray(v)) { return "[ ]"; }
    if (isTable(v)) { return v.kind || "{ }"; }
    if (v === "" || v === null || v === undefined) { return '""'; }
    return readable(v);
  }
  // scores[2], grid[y][x], word[0], prices["tea"]: counted from nought, and
  // from the end when the number is less than nought, the way Python does.
  function itemOf(v, at) {
    if (isTable(v)) {
      var got = v.get(at);
      if (got) { return got[1]; }
      if (v.kind && typeof at === "string") { return fieldOf(v, at); }
      throw new Error(say("r_no_key", { key: shownIn(at) }));
    }
    if (!Array.isArray(v) && typeof v !== "string") {
      throw new Error(say("r_no_items", { what: whatIs(v) }));
    }
    var i = whereIn(v, at, false);
    return v[i];
  }
  // Which place an item number means, or why there is none.  `room` lets
  // it be one past the end: where insert puts something last.
  function whereIn(v, at, room) {
    var n = typeof at === "number" ? at : parseFloat(at);
    if (typeof at === "boolean") { n = at ? 1 : 0; }
    if (isNaN(n) || Math.floor(n) !== n) {
      throw new Error(say("r_whole_at", { at: whatIs(at) }));
    }
    var i = n < 0 ? v.length + n : n;
    if (i < 0 || i >= v.length + (room ? 1 : 0)) {
      throw new Error(say("r_no_item", { at: readable(n), n: v.length }));
    }
    return i;
  }
  // p.x: a part of a record, found however it is capitalised, since
  // pseudocode's names are.  A list's .length is its length.
  function fieldOf(v, name) {
    if (isTable(v)) {
      var got = v.get(name);
      if (got) { return got[1]; }
      var low = name.toLowerCase(), found = null;
      v.map.forEach(function (e) {
        if (found === null && typeof e[0] === "string" && e[0].toLowerCase() === low) { found = e; }
      });
      if (found) { return found[1]; }
      throw new Error(say("r_no_field", { name: name }));
    }
    if ((Array.isArray(v) || typeof v === "string") && /^(length|size|count)$/i.test(name)) {
      return v.length;
    }
    // an error said in words is its own message: e.message, whichever kind of error e is
    if (typeof v === "string" && /^message$/i.test(name)) { return v; }
    throw new Error(say("r_no_field", { name: name }));
  }
  // Putting something into one: scores[2] = 90, p.x = 3, prices["tea"] = 2.
  function putItem(v, at, what) {
    if (isTable(v)) {
      if (v.kind && typeof at === "string" && !v.get(at)) {
        var low = at.toLowerCase(), had = null;
        v.map.forEach(function (e) {
          if (had === null && typeof e[0] === "string" && e[0].toLowerCase() === low) { had = e[0]; }
        });
        if (had !== null) { at = had; }
      }
      v.put(at, what);
      return;
    }
    if (!Array.isArray(v)) { throw new Error(say("r_no_items", { what: whatIs(v) })); }
    v[whereIn(v, at, false)] = what;
  }
  // A value as it reads inside a list: words in quotes, so ["1", 1] does
  // not print as [1, 1].
  function shownIn(v) {
    if (typeof v === "string") {
      return v.indexOf("'") >= 0 && v.indexOf('"') < 0 ? '"' + v + '"' : "'" + v + "'";
    }
    return readable(v);
  }

  function truthy(v) {
    if (typeof v === "boolean") { return v; }
    if (typeof v === "number") { return v !== 0; }
    if (Array.isArray(v)) { return v.length > 0; }
    if (isTable(v)) { return !!v.kind || v.map.size > 0; }
    if (v instanceof FnRef) { return true; }
    return String(v || "").length > 0 && String(v).toLowerCase() !== "false";
  }
  function num(v) {
    var n = typeof v === "number" ? v : typeof v === "boolean" ? (v ? 1 : 0) : parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  function same(a, b) {
    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) { return false; }
      for (var i = 0; i < a.length; i++) { if (!same(a[i], b[i])) { return false; } }
      return true;
    }
    if (isTable(a) || isTable(b)) {
      if (!isTable(a) || !isTable(b)) { return false; }
      if (a === b) { return true; }
      if (a.kind || b.kind || a.map.size !== b.map.size) { return false; }
      var all = true;
      a.map.forEach(function (e, k) {
        var there = b.map.get(k);
        if (!there || !same(e[1], there[1])) { all = false; }
      });
      return all;
    }
    if (a instanceof FnRef || b instanceof FnRef) {
      return a instanceof FnRef && b instanceof FnRef && a.mod === b.mod && a.built === b.built;
    }
    if (typeof a === "number" || typeof b === "number") {
      if (a === "" || b === "" || a === null || b === null) { return false; }
      return num(a) === num(b);
    }
    return String(a).toLowerCase() === String(b).toLowerCase();
  }
  // Which of two things comes first.  Numbers by size -- and two words by
  // the alphabet, which they were not: a word is not a number, so every
  // word counted as nought, "apple" < "banana" was nought less than nought,
  // and the answer was always no.  The code written out from the same chart
  // said yes, because every language it is written in says yes.
  function sooner(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {       // the first difference
      for (var i = 0; i < Math.min(a.length, b.length); i++) {
        var one = sooner(a[i], b[i]);
        if (one) { return one; }
      }
      return a.length - b.length;
    }
    // "-1 Fox" and "-2" are words, not -1 and -2: only words that are
    // wholly a number are put in order as numbers
    if (typeof a === "string" && typeof b === "string" &&
        (!R_READS_NUM.test(a.trim()) || !R_READS_NUM.test(b.trim()))) {
      var x = a.toLowerCase(), y = b.toLowerCase();
      return x < y ? -1 : (x > y ? 1 : 0);
    }
    return num(a) - num(b);
  }
  function zeroErr() {
    var err = new Error(TXT.r_zero);
    err.why = "r_zero";
    return err;
  }
  function apply(op, a, b) {
    switch (op) {
      case "+":
        if (Array.isArray(a) && Array.isArray(b)) { return a.concat(b); }
        return (typeof a === "string" || typeof b === "string")
               ? joined(a) + joined(b) : num(a) + num(b);
      case "-": return num(a) - num(b);
      case "*":
        if (Array.isArray(a) && !Array.isArray(b)) { return repeated(a, b); }
        if (Array.isArray(b) && !Array.isArray(a)) { return repeated(b, a); }
        return num(a) * num(b);
      case "/":
        if (num(b) === 0) { throw zeroErr(); }
        return num(a) / num(b);
      case "mod": case "%":
        if (num(b) === 0) { throw zeroErr(); }
        return num(a) % num(b);
      case "div":
        if (num(b) === 0) { throw zeroErr(); }
        return Math.floor(num(a) / num(b));
      case "^": return Math.pow(num(a), num(b));
      // = and <> let capitals go, the way people mean it; == and != are
      // exact, the way code means it
      case "=": return same(a, b);
      case "<>": return !same(a, b);
      case "==": return exactly(a, b);
      case "!=": return !exactly(a, b);
      case "<": return sooner(a, b) < 0;
      case "<=": return sooner(a, b) <= 0;
      case ">": return sooner(a, b) > 0;
      case ">=": return sooner(a, b) >= 0;
      // 100 in scores, "a" in word, key in table: Python's way of asking
      case "in": return !!LIST_BUILT.contains(b, a);
      case "not in": return !LIST_BUILT.contains(b, a);
      case "and": case "&&": return truthy(a) && truthy(b);
      case "or": case "||": return truthy(a) || truthy(b);
      default: throw new Error(say("r_odd_op", { op: op }));
    }
  }

  var BUILT = {
    sqrt: Math.sqrt, abs: Math.abs, floor: Math.floor,
    // round(x) is the nearest whole number, a half going up; round(x, 2)
    // the nearest to two places
    round: function (v, places) {
      if (places === undefined) { return Math.round(v); }
      var by = Math.pow(10, Math.floor(num(places)));
      return Math.round(num(v) * by) / by;
    },
    // roundEven(x): the same, but a half goes to the even one -- 2.5 is 2,
    // 3.5 is 4 -- the way Python's round() and C#'s Math.Round do it
    roundeven: function (v, places) {
      var by = places === undefined ? 1 : Math.pow(10, Math.floor(num(places)));
      var scaled = num(v) * by, near = Math.round(scaled);
      if (Math.abs(scaled % 1) === 0.5) { near = 2 * Math.round(scaled / 2); }
      return near / by;
    },
    ceiling: Math.ceil, ceil: Math.ceil, int: function (v) { return Math.trunc(num(v)); },
    integer: function (v) { return Math.trunc(num(v)); },
    length: function (v) { return String(v).length; },
    toupper: function (v) { return String(v).toUpperCase(); },
    tolower: function (v) { return String(v).toLowerCase(); },
    random: function (a, b) {
      if (a === undefined) { return Math.random(); }
      return Math.floor(Math.random() * (num(b) - num(a) + 1)) + num(a);
    },
    pow: Math.pow,
    min: function () { return extreme(arguments, -1); },
    max: function () { return extreme(arguments, 1); },
    log: Math.log, log10: Math.log10, exp: Math.exp, sin: Math.sin, cos: Math.cos,
    tan: Math.tan, atan: Math.atan, atan2: Math.atan2, asin: Math.asin, acos: Math.acos,
    hypot: Math.hypot, trunc: Math.trunc, sign: Math.sign,
    real: function (v) { return num(v); }
  };

  // ---- what lists, tables and words can have done to them ----------------
  // Said the way a textbook says it -- append(names, "Ada"), not
  // names.append("Ada") -- though the second is read as the first, so
  // either may be typed.  These are handed what they were given as it is:
  // "007" put into a list stays the word "007".
  function listArg(v, name) {
    if (!Array.isArray(v)) { throw new Error(say("r_needs_list", { name: name + "()" })); }
    return v;
  }
  // sizes [3, 4] and a fill: three lists of four, each list its own, and a
  // list given as the fill copied into every place rather than shared.  A
  // fill that is a way of making one -- a record, for a list of records --
  // makes each place one of its own.
  function filledList(sizes, fill) {
    function made(level) {
      if (level >= sizes.length) {
        return typeof fill === "function" ? fill() : Array.isArray(fill) ? fill.slice() : fill;
      }
      var out = [];
      for (var k = 0; k < sizes[level]; k++) { out.push(made(level + 1)); }
      return out;
    }
    return made(0);
  }
  function repeated(list, n) {
    var out = [];
    for (var i = 0; i < Math.floor(num(n)); i++) { out = out.concat(list); }
    return out;
  }
  function joined(v) { return Array.isArray(v) || isTable(v) ? readable(v) : String(v); }
  // Which comes first when sorting: numbers by size, words letter by letter
  // as written -- capitals first, as every language sorts them -- numbers
  // before words, and lists item by item.
  function orderOf(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      for (var i = 0; i < Math.min(a.length, b.length); i++) {
        var one = orderOf(a[i], b[i]);
        if (one) { return one; }
      }
      return a.length - b.length;
    }
    var an = typeof a === "number" || typeof a === "boolean";
    var bn = typeof b === "number" || typeof b === "boolean";
    if (an && bn) { return Number(a) - Number(b); }
    if (an !== bn) { return an ? -1 : 1; }
    var x = String(a), y = String(b);
    return x < y ? -1 : (x > y ? 1 : 0);
  }
  function exactly(a, b) {               // the same, capitals and all
    if (typeof a === "string" && typeof b === "string") { return a === b; }
    if (Array.isArray(a) && Array.isArray(b)) {
      return a.length === b.length && a.every(function (x, i) { return exactly(x, b[i]); });
    }
    return same(a, b);
  }
  // The built-ins that take words as they are.
  var WORDS_BUILT = { length: 1, toupper: 1, tolower: 1 };
  function extreme(given, way) {
    var items = given.length === 1 && Array.isArray(given[0]) ? given[0]
              : Array.prototype.slice.call(given);
    if (!items.length) { throw new Error(TXT.r_empty_list); }
    var best = items[0];
    for (var i = 1; i < items.length; i++) {
      if (orderOf(items[i], best) * way > 0) { best = items[i]; }
    }
    return best;
  }
  // Python's cut: from, up to but not including to, either counted from
  // the end when it is less than nought, and never past either end.
  function cut(v, from, to) {
    var n = v.length;
    function place(x, dflt) {
      if (x === undefined || x === "" || x === null) { return dflt; }
      var k = Math.trunc(num(x));
      if (k < 0) { k += n; }
      return Math.max(0, Math.min(n, k));
    }
    return v.slice(place(from, 0), place(to, n));
  }
  function itemsOf(v) {                  // what a For Each walks over
    if (Array.isArray(v)) { return v; }
    if (isTable(v)) { return v.keys(); }
    if (typeof v === "string") { return v.split(""); }
    throw new Error(say("r_no_items", { what: whatIs(v) }));
  }
  var builtWhere = null;                 // the chart a built-in was called from
  // A module handed over with bind() is handed what it was bound with as
  // well, after whatever it is called with.
  async function callRef(ref, args, given) {
    if (ref.extra) { args = ref.extra.concat(args); }
    if (ref.mod) { return await runModule(ref.mod, args, builtWhere, given || []); }
    return await BUILT[ref.built].apply(null, args);
  }
  function takesTwo(ref) {
    // compare, handed over as it is: the one built-in that takes a pair
    if (!ref.mod) { return String(ref.built || "").toLowerCase() === "compare" && !(ref.extra && ref.extra.length); }
    return paramBits(ref.mod.params).filter(function (p) { return !p.dflt; }).length -
           (ref.extra ? ref.extra.length : 0) >= 2;
  }
  // Sorting that can stop to run a module of the program's own for every
  // pair it compares -- sort(people, byAge) -- and so is written out rather
  // than handed to the language's own sort, which cannot wait.
  async function sortedBy(list, how) {
    if (how instanceof FnRef && takesTwo(how)) {
      return await mergeSort(list.slice(), async function (a, b) {
        var said = await callRef(how, [a, b]);
        // a comparison that answers yes or no -- C++'s a < b -- says
        // whether a goes first; where neither goes before the other they
        // are the same, and stay in the order they were
        if (typeof said === "boolean") {
          if (said) { return -1; }
          return (await callRef(how, [b, a])) === true ? 1 : 0;
        }
        return num(said);
      });
    }
    if (how instanceof FnRef) {
      var keys = [];
      for (var i = 0; i < list.length; i++) { keys.push(await callRef(how, [list[i]])); }
      var order = await mergeSort(list.map(function (x, k) { return k; }), function (a, b) {
        return orderOf(keys[a], keys[b]);
      });
      return order.map(function (k) { return list[k]; });
    }
    return await mergeSort(list.slice(), orderOf);
  }
  async function mergeSort(a, cmp) {
    if (a.length < 2) { return a; }
    var mid = a.length >> 1;
    var l = await mergeSort(a.slice(0, mid), cmp), r = await mergeSort(a.slice(mid), cmp);
    var out = [], i = 0, j = 0;
    while (i < l.length && j < r.length) {
      if ((await cmp(r[j], l[i])) < 0) { out.push(r[j++]); } else { out.push(l[i++]); }
    }
    return out.concat(l.slice(i), r.slice(j));
  }
  var LIST_BUILT = {
    length: function (v) {
      return Array.isArray(v) ? v.length : isTable(v) ? v.map.size : String(v).length;
    },
    // append(first, last), two words: the textbook's way of joining them,
    // handed back -- the same name as a list's, which it changes
    append: function (list, x) {
      if (typeof list === "string") { return list + (typeof x === "string" ? x : readable(x)); }
      listArg(list, "append").push(x); return "";
    },
    insert: function (list, at, x) {
      listArg(list, "insert");
      var i = Math.trunc(num(at));
      if (i < 0) { i = Math.max(0, list.length + i); }
      list.splice(Math.min(i, list.length), 0, x);
      return "";
    },
    remove: function (v, x) {
      if (isTable(v)) { v.drop(x); return ""; }
      listArg(v, "remove");
      for (var i = 0; i < v.length; i++) {
        if (exactly(v[i], x)) { v.splice(i, 1); return ""; }
      }
      throw new Error(say("r_not_in_list", { item: shownIn(x) }));
    },
    pop: function (v, at) {
      if (isTable(v)) {
        var got = v.get(at);
        if (!got) { throw new Error(say("r_no_key", { key: shownIn(at) })); }
        v.drop(at);
        return got[1];
      }
      listArg(v, "pop");
      if (!v.length) { throw new Error(TXT.r_empty_list); }
      var i = at === undefined ? v.length - 1 : whereIn(v, at, false);
      return v.splice(i, 1)[0];
    },
    contains: function (v, x) {
      if (Array.isArray(v)) { return v.some(function (y) { return exactly(y, x); }); }
      if (isTable(v)) { return !!v.get(x); }
      return String(v).indexOf(String(x)) >= 0;
    },
    // indexOf(xs, x, from): where x first is, looking from `from` on
    indexof: function (v, x, from) {
      var at = from === undefined ? 0 : Math.trunc(num(from));
      if (Array.isArray(v)) {
        if (at < 0) { at = Math.max(0, at + v.length); }
        for (var i = at; i < v.length; i++) { if (exactly(v[i], x)) { return i; } }
        return -1;
      }
      var s = String(v);
      if (at < 0) { at = Math.max(0, at + s.length); }
      return s.indexOf(String(x), at);
    },
    // lastIndexOf(v, x): where x is last, counted from nought; -1 if nowhere
    lastindexof: function (v, x) {
      if (Array.isArray(v)) {
        for (var i = v.length - 1; i >= 0; i--) { if (exactly(v[i], x)) { return i; } }
        return -1;
      }
      return String(v).lastIndexOf(String(x));
    },
    // compare(a, b): -1 if a comes first, 1 if b does, 0 if they are the same
    compare: function (a, b) {
      var one = orderOf(a, b);
      return one < 0 ? -1 : one > 0 ? 1 : 0;
    },
    count: function (v, x) {
      if (Array.isArray(v)) { return v.filter(function (y) { return exactly(y, x); }).length; }
      var s = String(v), w = String(x);
      return w ? s.split(w).length - 1 : s.length + 1;
    },
    slice: function (v, from, to, step) {
      if (step === undefined) { return cut(Array.isArray(v) ? v : String(v), from, to); }
      // slice(xs, from, to, step): every step-th from `from` up to `to`, or
      // down to it where the step is below nought -- a place below nought
      // counted from the end, as it is everywhere else
      var items = Array.isArray(v) ? v : String(v).split(""), n = items.length;
      var by = Math.trunc(num(step));
      if (!by) { throw new Error(TXT.r_zero); }
      function at(x, low, high) {
        x = Math.trunc(num(x));
        if (x < 0) { x += n; }
        return Math.max(low, Math.min(high, x));
      }
      var out = [], i;
      if (by > 0) {
        for (i = at(from, 0, n); i < at(to, 0, n); i += by) { out.push(items[i]); }
      } else {
        for (i = at(from, -1, n - 1); i > at(to, -1, n - 1); i += by) { out.push(items[i]); }
      }
      return Array.isArray(v) ? out : out.join("");
    },
    // grouped(1234567.891, 2) is "1,234,567.89": thousands kept apart by
    // commas, to so many places where it says
    grouped: function (v, places) {
      var n = num(v);
      var text = places === undefined ? readable(n) : n.toFixed(Math.max(0, Math.min(20, Math.trunc(num(places)))));
      var minus = text.charAt(0) === "-";
      if (minus) { text = text.slice(1); }
      var halves = text.split(".");
      halves[0] = halves[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return (minus ? "-" : "") + halves.join(".");
    },
    // toJson(x): x the way JSON writes it -- {"a":1,"b":[2,3]}
    tojson: function (v) {
      function one(x) {
        if (x === null || x === undefined) { return "null"; }
        if (typeof x === "string") { return JSON.stringify(x); }
        if (typeof x === "number") { return isFinite(x) ? String(x) : "null"; }
        if (typeof x === "boolean") { return x ? "true" : "false"; }
        if (Array.isArray(x)) { return "[" + x.map(one).join(",") + "]"; }
        if (isTable(x)) {
          var bits = [];
          x.map.forEach(function (e) { bits.push(JSON.stringify(String(e[0])) + ":" + one(e[1])); });
          return "{" + bits.join(",") + "}";
        }
        return "null";
      }
      return one(v);
    },
    // significant(x, 6): x to so many figures, the way C++ shows a number
    // unless told otherwise -- 81.6667, 0.333333, 1.23457e+06
    significant: function (v, n) {
      var x = num(v), p = n === undefined ? 6 : Math.max(1, Math.min(21, Math.trunc(num(n))));
      if (x === 0) { return "0"; }
      if (!isFinite(x)) { return x > 0 ? "inf" : x < 0 ? "-inf" : "nan"; }
      var exp = Math.floor(Math.log10(Math.abs(Number(x.toPrecision(p)))));
      function bare(t) { return t.indexOf(".") >= 0 ? t.replace(/0+$/, "").replace(/\.$/, "") : t; }
      if (exp < -4 || exp >= p) {
        var m = /^(-?[\d.]+)e([+-])(\d+)$/.exec(x.toExponential(p - 1));
        return bare(m[1]) + "e" + m[2] + (m[3].length < 2 ? "0" : "") + m[3];
      }
      return bare(x.toFixed(Math.max(0, p - 1 - exp)));
    },
    // toBase(255, 16) is "ff", fromBase("ff", 16) is 255: a whole number
    // written in another base, and read back from one
    tobase: function (v, base) {
      var b = Math.max(2, Math.min(36, Math.trunc(num(base))));
      return Math.trunc(num(v)).toString(b);
    },
    frombase: function (s, base) {
      var b = Math.max(2, Math.min(36, Math.trunc(num(base))));
      var t = String(s).trim().toLowerCase(), minus = t.charAt(0) === "-";
      if (minus || t.charAt(0) === "+") { t = t.slice(1); }
      if ((b === 16 && /^0x/.test(t)) || (b === 2 && /^0b/.test(t)) || (b === 8 && /^0o/.test(t))) { t = t.slice(2); }
      var got = parseInt(t, b);
      return isNaN(got) ? 0 : (minus ? -got : got);
    },
    substring: function (v, from, to) { return cut(String(v), from, to); },
    join: function (list, sep) {
      return listArg(list, "join").map(function (x) {
        return typeof x === "string" ? x : readable(x);
      }).join(sep === undefined ? "" : String(sep));
    },
    // split(s): at every run of spaces; split(s, ""): letter by letter
    split: function (s, sep) {
      s = String(s);
      if (sep === undefined) {
        return s.trim() ? s.trim().split(/\s+/) : [];
      }
      return s.split(String(sep));
    },
    sum: function (list) {
      return listArg(list, "sum").reduce(function (a, b) { return a + num(b); }, 0);
    },
    sort: async function (list, how) {
      var done = await sortedBy(listArg(list, "sort"), how);
      for (var i = 0; i < done.length; i++) { list[i] = done[i]; }
      return list;
    },
    sorted: async function (v, how) { return await sortedBy(itemsOf(v).slice(), how); },
    reverse: function (v) {
      if (Array.isArray(v)) { return v.reverse(); }
      return String(v).split("").reverse().join("");
    },
    reversed: function (v) {
      if (Array.isArray(v)) { return v.slice().reverse(); }
      return String(v).split("").reverse().join("");
    },
    shuffle: function (list) {
      listArg(list, "shuffle");
      for (var i = list.length - 1; i > 0; i--) {
        var j = BUILT.random(0, i), keep = list[i];
        list[i] = list[j];
        list[j] = keep;
      }
      return "";
    },
    choice: function (list) {
      if (!itemsOf(list).length) { throw new Error(TXT.r_empty_list); }
      return itemsOf(list)[BUILT.random(0, itemsOf(list).length - 1)];
    },
    repeat: function (v, n) {
      if (Array.isArray(v)) { return repeated(v, n); }
      return String(v).repeat(Math.max(0, Math.floor(num(n))));
    },
    range: function (a, b, by) {
      var from = b === undefined ? 0 : num(a), to = b === undefined ? num(a) : num(b);
      var step = by === undefined ? 1 : num(by), out = [];
      if (!step) { throw new Error(TXT.r_zero); }
      for (var k = from; step > 0 ? k < to : k > to; k += step) { out.push(k); }
      return out;
    },
    keys: function (v) { return isTable(v) ? v.keys() : itemsOf(v).map(function (x, i) { return i; }); },
    values: function (v) { return isTable(v) ? v.values() : itemsOf(v).slice(); },
    items: function (v) {
      if (isTable(v)) { return Array.from(v.map.values()).map(function (e) { return [e[0], e[1]]; }); }
      return itemsOf(v).map(function (x, i) { return [i, x]; });
    },
    copy: function (v) {
      if (Array.isArray(v)) { return v.slice(); }
      if (isTable(v)) {
        var made = new Table(v.kind);
        v.map.forEach(function (e, k) { made.map.set(k, [e[0], e[1]]); });
        return made;
      }
      return v;
    },
    // deepCopy(x): a copy all the way down -- the lists, tables and
    // records inside it copied as well
    deepcopy: function (v) {
      function one(x) {
        if (Array.isArray(x)) { return x.map(one); }
        if (isTable(x)) {
          var made = new Table(x.kind);
          x.map.forEach(function (e, k) { made.map.set(k, [e[0], one(e[1])]); });
          return made;
        }
        return x;
      }
      return one(v);
    },
    tostring: function (v) { return typeof v === "string" ? v : readable(v); },
    replace: function (s, a, b) { return String(s).split(String(a)).join(String(b)); },
    trim: function (s) { return String(s).trim(); },
    startswith: function (s, w) { return String(s).indexOf(String(w)) === 0; },
    endswith: function (s, w) {
      s = String(s); w = String(w);
      return s.length >= w.length && s.slice(s.length - w.length) === w;
    },
    isdigit: function (s) { return /^[0-9]+$/.test(String(s)); },
    isalpha: function (s) { return /^[A-Za-zÀ-￿]+$/.test(String(s)); },
    isupper: function (s) { s = String(s); return /[A-Z]/.test(s) && s === s.toUpperCase(); },
    islower: function (s) { s = String(s); return /[a-z]/.test(s) && s === s.toLowerCase(); },
    isspace: function (s) { return /^\s+$/.test(String(s)); },
    ord: function (c) { return String(c).charCodeAt(0); },
    chr: function (n) { return String.fromCharCode(num(n)); },
    classof: function (v) {
      if (isTable(v)) { return v.kind || "Table"; }
      if (Array.isArray(v)) { return "List"; }
      if (typeof v === "boolean") { return "Boolean"; }
      if (typeof v === "number") { return Math.floor(v) === v ? "Integer" : "Real"; }
      return "String";
    },
    any: function (list) { return itemsOf(list).some(truthy); },
    all: function (list) { return itemsOf(list).every(truthy); },
    // newList(3, 4, 0): three lists of four noughts
    newlist: function () {
      var given = Array.prototype.slice.call(arguments);
      var fill = given.length > 1 ? given.pop() : "";
      return filledList(given.map(function (n) { return Math.max(0, Math.floor(num(n))); }), fill);
    },
    extend: function (list, more) {
      itemsOf(more).slice().forEach(function (x) { listArg(list, "extend").push(x); });
      return "";
    },
    clear: function (v) {
      if (isTable(v)) { v.map.clear(); return ""; }
      listArg(v, "clear").length = 0;
      return "";
    },
    // what is under a key, or what to use when there is nothing there
    get: function (v, at, otherwise) {
      if (isTable(v)) {
        var got = v.get(at);
        return got ? got[1] : (otherwise === undefined ? "" : otherwise);
      }
      if (Array.isArray(v) || typeof v === "string") {
        var n = num(at);
        if (n < 0) { n += v.length; }
        return n >= 0 && n < v.length ? v[n] : (otherwise === undefined ? "" : otherwise);
      }
      return otherwise === undefined ? "" : otherwise;
    },
    isnumber: function (v) {
      return typeof v === "number" || (typeof v === "string" && R_READS_NUM.test(v.trim()));
    },
    // isInteger("42"): words that say a whole number, and nothing else
    isinteger: function (v) {
      return typeof v === "number" ? v === Math.trunc(v) : /^[-+]?\d+$/.test(String(v).trim());
    },
    // currencyFormat(1234.5) is $1,234.50: dollars and cents, the thousands
    // marked, the way the textbook shows money
    currencyformat: function (v) {
      var n = num(v), said = Math.abs(n).toFixed(2).split(".");
      return (n < 0 && Number(said.join(".")) ? "-" : "") + "$" +
             said[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + said[1];
    },
    tolist: function (v) { return itemsOf(v).slice(); },
    unique: function (v) {
      var out = [];
      itemsOf(v).forEach(function (x) {
        if (!out.some(function (y) { return exactly(x, y); })) { out.push(x); }
      });
      return out;
    },
    zip: function () {
      var lists = Array.prototype.map.call(arguments, itemsOf), out = [];
      var n = Math.min.apply(null, lists.map(function (l) { return l.length; }));
      for (var i = 0; i < n; i++) { out.push(lists.map(function (l) { return l[i]; })); }
      return out;
    },
    // bind(f, a, b): f, handed a and b first whenever it is called, and
    // then whatever it is called with.  How a function made inside another
    // takes the names it uses from there along with it.
    bind: function (fn) {
      if (!(fn instanceof FnRef)) {
        var nofn = new Error(say("r_unknown_fn", { name: String(fn) }));
        nofn.why = "r_unknown_fn"; nofn.name = String(fn);
        throw nofn;
      }
      var made = new FnRef(fn.mod, fn.built);
      made.extra = (fn.extra || []).concat(Array.prototype.slice.call(arguments, 1));
      return made;
    },
    // repr(x): x the way it is written inside a list -- words in quotes
    repr: function (v) { return shownIn(v); },
    // transpose(rows): the columns, each a list -- as many as the shortest row
    transpose: function (v) {
      var rows = itemsOf(v).map(itemsOf), out = [];
      if (!rows.length) { return out; }
      var n = Math.min.apply(null, rows.map(function (r) { return r.length; }));
      for (var i = 0; i < n; i++) { out.push(rows.map(function (r) { return r[i]; })); }
      return out;
    },
    enumerate: function (v, from) {
      var start = from === undefined ? 0 : num(from);
      return itemsOf(v).map(function (x, i) { return [i + start, x]; });
    },
    union: function (a, b) { return LIST_BUILT.unique(itemsOf(a).concat(itemsOf(b))); },
    intersection: function (a, b) {
      return LIST_BUILT.unique(itemsOf(a).filter(function (x) {
        return itemsOf(b).some(function (y) { return exactly(x, y); });
      }));
    },
    difference: function (a, b) {
      return itemsOf(a).filter(function (x) {
        return !itemsOf(b).some(function (y) { return exactly(x, y); });
      });
    },
    bitand: function (a, b) { return num(a) & num(b); },
    bitor: function (a, b) { return num(a) | num(b); },
    bitxor: function (a, b) { return num(a) ^ num(b); },
    // a number shown to so many places after the point: fixed(2.5, 2) is "2.50"
    fixed: function (v, n) { return num(v).toFixed(Math.max(0, Math.min(20, Math.floor(num(n))))); },
    padleft: function (s, n, c) {
      s = typeof s === "string" ? s : readable(s);
      var pad = c === undefined || c === "" ? " " : String(c);
      while (s.length < num(n)) { s = pad + s; }
      return s;
    },
    padright: function (s, n, c) {
      s = typeof s === "string" ? s : readable(s);
      var pad = c === undefined || c === "" ? " " : String(c);
      while (s.length < num(n)) { s = s + pad; }
      return s;
    },
    shuffled: function (v) {
      var copy = itemsOf(v).slice();
      LIST_BUILT.shuffle(copy);
      return copy;
    }
  };
  var RAW_BUILT = {};
  Object.keys(LIST_BUILT).forEach(function (name) {
    BUILT[name] = LIST_BUILT[name];
    RAW_BUILT[name] = true;
  });

  async function callOut(name, args, where, given) {
    var mine = moduleNamed(name);
    if (mine) { return await runModule(mine, args, where, given); }
    var box = holderOf(where, name);
    var held = box ? box[sameName(box, name)] : null;
    var low = name.toLowerCase(), built = BUILT[low];
    var was = builtWhere;
    builtWhere = where;
    try {
      // a module handed over and kept under a name of its own
      if (held instanceof FnRef) { return await callRef(held, args, given); }
      if (built) {
        // words that are a number are that number to sqrt() and max(), and
        // only those: "24 Kiwi" is not 24, and length("007") is 3
        return await built.apply(null, RAW_BUILT[low] ? args : args.map(function (a) {
          return typeof a === "string" && !WORDS_BUILT[low] && R_READS_NUM.test(a.trim()) ? parseFloat(a) : a;
        }));
      }
    } finally {
      builtWhere = was;
    }
    // Not a variable that is empty -- a name nothing answers to at all.
    // Worth saying differently, and worth saying what it is nearly.
    var meant = nearest(name, knownCalls());
    var err = new Error(say("r_unknown_fn", { name: name }));
    err.why = "r_unknown_fn"; err.name = name;
    if (meant) {
      err.tip = say("r_mean", { name: meant + "()" });
      // The name, without the brackets the tip puts on it for reading: what
      // is written on the line is greet, and greet is what is swapped.
      err.fix = { how: "change", word: name, instead: meant };
    }
    throw err;
  }
