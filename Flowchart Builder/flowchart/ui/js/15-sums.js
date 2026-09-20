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
    if (!err || err instanceof Stop || err instanceof Returned) { return err; }
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
               "<>": 3, "<": 4, "<=": 4, ">": 4, ">=": 4, "+": 5, "-": 5,
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
      throw wrong(TXT.r_empty_expr, { from: 0, to: 1 });
    }
    var ts = tokens(src), at = 0;
    function peek() { return ts[at]; }
    function take() { return ts[at++]; }
    function ended() {                   // a token's worth of "right here"
      var last = ts[ts.length - 1];
      var end = last ? last.to : String(src || "").length;
      return { from: Math.max(0, end - 1), to: end };
    }
    function word(tok) {
      return tok && tok.t === "name" ? String(tok.v).toLowerCase() : null;
    }
    // The words an argument was written as, not only what it came to.  A
    // module handed a variable by reference gives its answer back into that
    // variable, and to do that the call has to remember which one it was.
    function between(a, b) {
      return (a < b && ts[a]) ? String(src).slice(ts[a].from, ts[b - 1].to) : "";
    }
    async function primary() {
      var tok = take();
      if (!tok) { throw wrong(say("r_half", { bit: src }), ended()); }
      if (tok.t === "str" && tok.open) { throw wrong(TXT.r_open_quote, tok); }
      if (tok.t === "num" || tok.t === "str") { return tok.v; }
      if (tok.t === "op" && tok.v === "(") {
        var inside = await expr(0);
        if (!peek() || peek().v !== ")") { throw wrong(TXT.r_open_bracket, tok); }
        take();
        return inside;
      }
      if (tok.t === "op" && (tok.v === "-" || tok.v === "+")) {
        var one = await primary();
        return tok.v === "-" ? -Number(one) : Number(one);
      }
      if (tok.t === "name") {
        var name = String(tok.v), low = name.toLowerCase();
        if (low === "not") { return !truthy(await primary()); }
        if (low === "true") { return true; }
        if (low === "false") { return false; }
        if (peek() && peek().v === "(") {    // a call, ours or a built-in
          var opened = take();
          var args = [], given = [], from;
          if (peek() && peek().v !== ")") {
            from = at;
            args.push(await expr(0));
            given.push(between(from, at));
            while (peek() && peek().v === ",") {
              take();
              from = at;
              args.push(await expr(0));
              given.push(between(from, at));
            }
          }
          if (!peek() || peek().v !== ")") { throw wrong(TXT.r_open_bracket, opened); }
          take();
          try {
            return await callOut(name, args, where, given);
          } catch (bad) {
            throw spotIn(bad, src, tok);
          }
        }
        var box = holderOf(where, name);
        if (box) { return box[sameName(box, name)]; }
        var meant = nearest(name, seenNames(where));
        throw wrong(say("r_unknown", { name: name }), tok,
                    meant ? say("r_mean", { name: meant }) : "",
                    meant ? { how: "change", word: name, instead: meant } : null);
      }
      if (tok.v === ")") { throw wrong(TXT.r_shut_bracket, tok); }
      throw wrong(say("r_odd_here", { bit: tok.v }), tok);
    }
    async function expr(least) {
      var left = await primary();
      while (peek()) {
        var tok = peek();
        var op = tok.t === "op" ? tok.v : word(tok);
        var rank = RANK[op];
        if (!rank || rank < least) { break; }
        take();
        var right = await expr(rank + 1);
        try {
          left = apply(op, left, right);
        } catch (bad) {
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
      if (peek()) {
        throw wrong(say("r_left_over", { bit: String(peek().v) }), peek());
      }
      return got;
    } catch (bad) {
      throw spotIn(bad, src);
    }
  }

  function truthy(v) {
    if (typeof v === "boolean") { return v; }
    if (typeof v === "number") { return v !== 0; }
    return String(v || "").length > 0 && String(v).toLowerCase() !== "false";
  }
  function num(v) {
    var n = typeof v === "number" ? v : parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  function same(a, b) {
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
    if (typeof a === "string" && typeof b === "string" &&
        (isNaN(parseFloat(a)) || isNaN(parseFloat(b)))) {
      var x = a.toLowerCase(), y = b.toLowerCase();
      return x < y ? -1 : (x > y ? 1 : 0);
    }
    return num(a) - num(b);
  }
  function apply(op, a, b) {
    switch (op) {
      case "+": return (typeof a === "string" || typeof b === "string")
                       ? String(a) + String(b) : num(a) + num(b);
      case "-": return num(a) - num(b);
      case "*": return num(a) * num(b);
      case "/":
        if (num(b) === 0) { throw new Error(TXT.r_zero); }
        return num(a) / num(b);
      case "mod": case "%":
        if (num(b) === 0) { throw new Error(TXT.r_zero); }
        return num(a) % num(b);
      case "div":
        if (num(b) === 0) { throw new Error(TXT.r_zero); }
        return Math.floor(num(a) / num(b));
      case "^": return Math.pow(num(a), num(b));
      case "=": case "==": return same(a, b);
      case "!=": case "<>": return !same(a, b);
      case "<": return sooner(a, b) < 0;
      case "<=": return sooner(a, b) <= 0;
      case ">": return sooner(a, b) > 0;
      case ">=": return sooner(a, b) >= 0;
      case "and": case "&&": return truthy(a) && truthy(b);
      case "or": case "||": return truthy(a) || truthy(b);
      default: throw new Error(say("r_odd_op", { op: op }));
    }
  }

  var BUILT = {
    sqrt: Math.sqrt, abs: Math.abs, round: Math.round, floor: Math.floor,
    ceiling: Math.ceil, ceil: Math.ceil, int: function (v) { return Math.trunc(num(v)); },
    integer: function (v) { return Math.trunc(num(v)); },
    length: function (v) { return String(v).length; },
    toupper: function (v) { return String(v).toUpperCase(); },
    tolower: function (v) { return String(v).toLowerCase(); },
    random: function (a, b) {
      if (a === undefined) { return Math.random(); }
      return Math.floor(Math.random() * (num(b) - num(a) + 1)) + num(a);
    },
    pow: Math.pow, min: Math.min, max: Math.max
  };

  async function callOut(name, args, where, given) {
    var mine = (AST.modules || []).filter(function (m) {
      return m.name.toLowerCase() === name.toLowerCase();
    })[0];
    if (mine) { return await runModule(mine, args, where, given); }
    var built = BUILT[name.toLowerCase()];
    if (built) { return built.apply(null, args.map(function (a) {
      return typeof a === "string" && !isNaN(parseFloat(a)) ? parseFloat(a) : a;
    })); }
    // Not a variable that is empty -- a name nothing answers to at all.
    // Worth saying differently, and worth saying what it is nearly.
    var meant = nearest(name, knownCalls());
    var err = new Error(say("r_unknown_fn", { name: name }));
    if (meant) {
      err.tip = say("r_mean", { name: meant + "()" });
      // The name, without the brackets the tip puts on it for reading: what
      // is written on the line is greet, and greet is what is swapped.
      err.fix = { how: "change", word: name, instead: meant };
    }
    throw err;
  }
