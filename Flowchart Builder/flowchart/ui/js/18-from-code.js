// ---------------------------------------------------------------------------
//  18-from-code.js -- a program written in Python, Java, C#, C++ or
//  JavaScript, read back into pseudocode
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ======================================================== code, read in ==
  // The other way round from 18-write.js.  That one takes a chart and writes
  // it out in a language; this takes a program somebody wrote in a language
  // and says it again as the pseudocode the rest of the page already knows
  // how to draw, run and write out.  So the Code way of working is only ever
  // a way into the pseudocode one: the chart is built from what comes out
  // of here, and the pseudocode card shows it.
  //
  // It reads the part of each language a first course is taught in --
  // variables, printing, asking, decisions, loops, switches and functions --
  // and reads it the way a teacher would say it in pseudocode: Declares at
  // the top, `Set` for every change, `For i = 1 To 10` for a counting loop,
  // `Do ... Until` for Python's `while True` with a break at the foot.  What
  // it can draw but the runner cannot run (a list, a method of an object)
  // it still writes down, as near as pseudocode comes, and says so in a
  // note; what cannot be said in a chart at all (a class, a lambda, a break
  // from the middle of a loop) stops it, with the line it was on.
  //
  // One entry, and everything else inside it, so none of its many small
  // names can take the name of a function in another part: the parts share
  // one scope, and a later part's function quietly replaces an earlier one.
  var codeToPseudo = (function () {

    // The helpers the page writes into the code it writes out (18-code.js):
    // asking in C++ and JavaScript, money and naps in C++.  Code that came
    // from here and is read back has them, and they are the language's way
    // of doing what a pseudocode Input or Wait simply does.
    function helpersOf(lang) {
      return lang === "cpp" ? /^(askWhole|askReal|askText|askFlag|money|nap|toUpper|toLower)$/
           : lang === "javascript" ? /^(ask|wait|stop)$/ : /^$/;
    }

    // ------------------------------------------------------ saying why --
    function oops(key, line, fill) {
      var err = new Error(say(key, fill || {}));
      err.line = line || 0;
      err.said = key;
      return err;
    }

    // ================================================== into tokens ==
    // One reader for all five.  What differs -- # or // for a comment,
    // indenting or braces for a block, the kinds of string -- is asked of
    // the language as it goes.  Comments are kept aside with the line they
    // were on, not left in among the tokens, so that nothing has to step
    // over them; the statement parsers pick up the ones that come before
    // each statement and put them back in front of it.
    // A backquote, and what opens a block comment, spelt out: written
    // plainly on a line of code they make the website's page keep every
    // comment in this part (parts.lean_js cannot tell them from the real
    // thing, so it leaves the part whole to be safe).
    var TICK = String.fromCharCode(96), OPEN_NOTE = "/" + "*";
    var OPS = [">>>=", "**=", "//=", "<<=", ">>=", "===", "!==", ">>>", "...",
               "**", "//", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=",
               "&=", "|=", "^=", ":=", "<<", ">>", "->", "::", "++", "--", "&&",
               "||", "=>", "??", "?."];
    var R_NUM = /^(?:0[xX][0-9a-fA-F_']+|0[bB][01_']+|\d[\d_']*(?:\.\d[\d_']*)?(?:[eE][+-]?\d+)?|\.\d[\d_']*(?:[eE][+-]?\d+)?|\d+\.(?![\w.]))[lLfFdDmMuU]*/;

    function lexCode(src, lang) {
      var py = lang === "python", js = lang === "javascript";
      var cs = lang === "csharp";
      var s = String(src || "").replace(/\r\n?/g, "\n").replace(/\t/g, "    ");
      var n = s.length, i = 0, line = 1, col0 = 0;
      var toks = [], notes = [];
      var depth = 0, indents = [0], atStart = true, codeOnLine = false;

      function colOf(at) { return at - col0; }
      function push(t, v, extra) {
        var tok = { t: t, v: v, line: line };
        if (extra) { for (var k in extra) { tok[k] = extra[k]; } }
        toks.push(tok);
        codeOnLine = true;
        return tok;
      }
      function newline() { line++; col0 = i; codeOnLine = false; }

      // Escapes, the way all five spell the common ones.
      function unescape(ch) {
        var at = { n: "\n", t: "\t", r: "", "0": "", a: "", b: "", f: "", v: "" };
        return at.hasOwnProperty(ch) ? at[ch] : ch;
      }

      // A string, from its opening quote: its words, and where it
      // interpolates, the expressions between them.  `braces` is how an
      // interpolation opens -- "{" for Python and C#, "${" for JavaScript.
      function readString(quote, triple, raw, braces, verbatim) {
        var parts = [], text = "", startLine = line;
        i += triple ? 3 : 1;
        for (;;) {
          if (i >= n) { throw oops("cm_open", startLine); }
          var c = s[i];
          if (triple ? s.substr(i, 3) === quote + quote + quote : c === quote) {
            if (verbatim && s[i + 1] === quote) { text += quote; i += 2; continue; }
            i += triple ? 3 : 1;
            break;
          }
          if (c === "\n") {
            if (!triple && !verbatim && quote !== TICK) { throw oops("cm_open", startLine); }
            text += "\n";
            i++;
            newline();
            continue;
          }
          if (c === "\\" && !raw && !verbatim) {
            var nx = s[i + 1];
            if (nx === "\n") { i += 2; newline(); continue; }
            if (nx === "u" && /^[0-9a-fA-F]{4}$/.test(s.substr(i + 2, 4))) {
              text += String.fromCharCode(parseInt(s.substr(i + 2, 4), 16));
              i += 6;
              continue;
            }
            if (nx === "x" && /^[0-9a-fA-F]{2}$/.test(s.substr(i + 2, 2))) {
              text += String.fromCharCode(parseInt(s.substr(i + 2, 2), 16));
              i += 4;
              continue;
            }
            text += unescape(nx);
            i += 2;
            continue;
          }
          if (braces) {
            var open = braces === "${" ? s.substr(i, 2) === "${" : c === "{";
            if (braces === "{" && c === "{" && s[i + 1] === "{") { text += "{"; i += 2; continue; }
            if (braces === "{" && c === "}" && s[i + 1] === "}") { text += "}"; i += 2; continue; }
            if (open) {
              i += braces.length;
              var from = i, deep = 0, inQ = null;
              while (i < n) {
                var d = s[i];
                if (inQ) { if (d === inQ) { inQ = null; } }
                else if (d === '"' || d === "'") { inQ = d; }
                else if (d === "{" || d === "(" || d === "[") { deep++; }
                else if (d === ")" || d === "]") { deep--; }
                else if (d === "}") { if (!deep) { break; } deep--; }
                i++;
              }
              if (i >= n) { throw oops("cm_open", startLine); }
              var inside = s.slice(from, i), spec = "";
              i++;
              // what comes after a colon (Python, C#) or a comma (C#) is
              // how to show it, not part of the expression
              if (braces === "{") {
                var cut = specAt(inside);
                if (cut >= 0) { spec = inside.slice(cut + 1); inside = inside.slice(0, cut); }
                inside = inside.replace(/![rsa]$/, "").replace(/=\s*$/, "");
              }
              if (text) { parts.push(text); text = ""; }
              parts.push({ code: inside.trim(), spec: spec.trim(), line: line });
              continue;
            }
          }
          text += c;
          i++;
        }
        if (text || !parts.length) { parts.push(text); }
        if (parts.length === 1 && typeof parts[0] === "string") {
          return push("str", parts[0], { line: startLine });
        }
        return push("fstr", parts, { line: startLine });
      }
      // Where the format starts in "{x:.2f}" -- the first colon or comma
      // outside any brackets or quotes, and not the colon of a ternary.
      function specAt(inside) {
        var deep = 0, q = null;
        for (var k = 0; k < inside.length; k++) {
          var c = inside[k];
          if (q) { if (c === q) { q = null; } continue; }
          if (c === '"' || c === "'") { q = c; continue; }
          if ("([{".indexOf(c) >= 0) { deep++; continue; }
          if (")]}".indexOf(c) >= 0) { deep--; continue; }
          if (!deep && (c === ":" || (cs && c === ","))) { return k; }
          if (!deep && c === "!" && inside[k + 1] !== "=") { return -1; }
        }
        return -1;
      }

      while (i < n) {
        // ---- Python: the indent at the start of each line of code
        if (py && atStart && depth === 0) {
          var col = 0;
          while (s[i] === " ") { col++; i++; }
          if (i >= n) { break; }
          if (s[i] === "\n") { i++; newline(); continue; }
          if (s[i] === "#") {
            var stop = s.indexOf("\n", i);
            if (stop < 0) { stop = n; }
            notes.push({ line: line, col: col, text: s.slice(i + 1, stop).trim() });
            i = stop;
            continue;
          }
          if (s[i] === "\\" && s[i + 1] === "\n") { i += 2; newline(); continue; }
          var top = indents[indents.length - 1];
          if (col > top) { indents.push(col); push("indent", col); }
          while (col < indents[indents.length - 1]) { indents.pop(); push("dedent", col); }
          if (col !== indents[indents.length - 1]) { throw oops("cm_indent", line); }
          atStart = false;
        }
        var c = s[i];
        if (c === "\n") {
          if (py && depth === 0) {
            var last = toks[toks.length - 1];
            if (last && last.t !== "nl" && last.t !== "indent" && last.t !== "dedent") {
              push("nl", "");
            }
            atStart = true;
          }
          i++;
          newline();
          continue;
        }
        if (c === " " || c === "\r" || c === "\f") { i++; continue; }
        if (c === "\\" && s[i + 1] === "\n") { i += 2; newline(); continue; }

        // ---- comments
        if (py && c === "#") {
          var to = s.indexOf("\n", i);
          i = to < 0 ? n : to;
          continue;
        }
        if (!py && c === "#" && !codeOnLine) {           // #include, #region
          var eol = s.indexOf("\n", i);
          i = eol < 0 ? n : eol;
          continue;
        }
        if (!py && s.substr(i, 2) === "//") {
          var end = s.indexOf("\n", i);
          if (end < 0) { end = n; }
          if (!codeOnLine) {
            notes.push({ line: line, col: colOf(i),
                         text: s.slice(i + 2, end).replace(/^\/+/, "").trim() });
          }
          i = end;
          continue;
        }
        if (!py && s.substr(i, 2) === OPEN_NOTE) {
          var shut = s.indexOf("*/", i + 2);
          if (shut < 0) { throw oops("cm_open", line); }
          var alone = !codeOnLine, body = s.slice(i + 2, shut), at = line;
          body.split("\n").forEach(function (row, k) {
            var said = row.replace(/^\s*\*+/, "").replace(/^\*+/, "").trim();
            if (alone && said && !/^@/.test(said)) {
              notes.push({ line: at + k, col: 0, text: said });
            }
          });
          for (var q = i; q < shut; q++) { if (s[q] === "\n") { line++; } }
          i = shut + 2;
          col0 = s.lastIndexOf("\n", i) + 1;
          continue;
        }

        // ---- strings
        var pre = /^([rRbBuUfF]{1,2})(?=['"])/.exec(s.slice(i, i + 3));
        if (py && (c === '"' || c === "'" || pre)) {
          var flags = pre ? pre[1].toLowerCase() : "";
          i += flags.length;
          var qq = s[i], three = s.substr(i, 3) === qq + qq + qq;
          readString(qq, three, flags.indexOf("r") >= 0,
                     flags.indexOf("f") >= 0 ? "{" : "", false);
          continue;
        }
        if (!py && (c === "$" || c === "@") && cs &&
            /^(\$@|@\$|\$|@)"/.test(s.substr(i, 3))) {
          var mark = /^(\$@|@\$|\$|@)/.exec(s.substr(i, 2))[1];
          i += mark.length;
          readString('"', false, false, mark.indexOf("$") >= 0 ? "{" : "",
                     mark.indexOf("@") >= 0);
          continue;
        }
        if (!py && c === TICK && js) { readString(TICK, false, false, "${", false); continue; }
        if (!py && (c === '"' || c === "'")) {
          readString(c, false, false, "", false);
          if (c === "'" && !js) { toks[toks.length - 1].ch = true; }
          continue;
        }
        if (!py && c === "R" && s[i + 1] === '"' && s[i + 2] === "(") {   // C++ raw
          var close = s.indexOf(')"', i + 3);
          if (close < 0) { throw oops("cm_open", line); }
          push("str", s.slice(i + 3, close));
          for (var r = i; r < close; r++) { if (s[r] === "\n") { line++; } }
          i = close + 2;
          continue;
        }

        // ---- numbers, names and the rest
        var num = /[0-9.]/.test(c) ? R_NUM.exec(s.slice(i, i + 64)) : null;
        if (num && num[0] !== ".") {
          var raw = num[0], clean = raw.replace(/[_']/g, "").replace(/[lLfFdDmMuU]+$/, "");
          if (/^0[xX]/.test(clean)) { clean = String(parseInt(clean, 16)); }
          else if (/^0[bB]/.test(clean)) { clean = String(parseInt(clean.slice(2), 2)); }
          var real = /[.eE]/.test(clean) || /[fFdDmM]$/.test(raw);
          if (/\.$/.test(clean)) { clean += "0"; }
          if (/^\./.test(clean)) { clean = "0" + clean; }
          push("num", clean, { real: real });
          i += raw.length;
          continue;
        }
        var name = /^[A-Za-z_$À-￿][\w$À-￿]*/.exec(s.slice(i, i + 256));
        if (name) {
          push("name", name[0]);
          i += name[0].length;
          continue;
        }
        var op = null;
        for (var k = 0; k < OPS.length; k++) {
          if (s.substr(i, OPS[k].length) === OPS[k]) { op = OPS[k]; break; }
        }
        op = op || c;
        if (py && op === "//=") { op = "//="; }
        if (!py && (op === "//" || op === "//=" || (!js && (op === "**" || op === "**=")))) { op = c; }
        if ("([{".indexOf(op) >= 0) { depth++; }
        if (")]}".indexOf(op) >= 0) { depth = Math.max(0, depth - 1); }
        push("op", op);
        i += op.length;
      }
      if (py) {
        var tail = toks[toks.length - 1];
        if (tail && tail.t !== "nl" && tail.t !== "dedent") { push("nl", ""); }
        while (indents.length > 1) { indents.pop(); push("dedent", 0); }
      }
      push("eof", "");
      return { toks: toks, notes: notes };
    }

    // ================================================== into a tree ==
    // The trees both kinds of parser make are the same shape, so everything
    // after this point -- working out what is what, and saying it as
    // pseudocode -- is written once.
    //
    //   expressions  num str fstr bool null name bin un call member index
    //                cond tuple list kw cast new incdec assignx arrow
    //   statements   expr assign aug decl if while dowhile for range
    //                foreach switch return break continue pass global
    //                func exit try note
    function parserFor(lexed, lang) {
      var toks = lexed.toks, notes = lexed.notes.slice(), pos = 0;
      var py = lang === "python", js = lang === "javascript";
      var cpp = lang === "cpp", cs = lang === "csharp", java = lang === "java";

      function peek(k) { return toks[Math.min(pos + (k || 0), toks.length - 1)]; }
      function next() { var t = toks[Math.min(pos, toks.length - 1)]; pos++; return t; }
      function isOp(v, k) { var t = peek(k); return t.t === "op" && t.v === v; }
      function isName(v, k) { var t = peek(k); return t.t === "name" && (v === undefined || t.v === v); }
      function accept(v) { return (isOp(v) || isName(v)) ? next() : null; }
      function expect(v) {
        var t = accept(v);
        if (!t) { throw oops("cm_expected", peek().line, { what: v }); }
        return t;
      }
      function odd(t) {
        t = t || peek();
        if (t.t === "eof") { return oops("cm_ended", t.line); }
        if (t.t === "indent" || t.t === "dedent") { return oops("cm_indent", t.line); }
        var bit = t.t === "str" ? '"' + t.v + '"' : t.t === "nl" ? "↵" : String(t.v);
        return oops("cm_odd", t.line, { bit: bit.slice(0, 24) });
      }

      // The comments written above a statement, put back in front of it.
      function notesBefore(line, col) {
        var out = [];
        while (notes.length && notes[0].line < line &&
               (col === undefined || notes[0].col >= col)) {
          var one = notes.shift();
          if (one.text) { out.push({ k: "note", text: one.text, line: one.line }); }
        }
        return out;
      }

      // ------------------------------------------------ expressions --
      // One precedence table per family.  Python's words and C's symbols
      // come out as the same few operators in the tree.
      var PY_BIN = { "or": 1, "and": 2, "|": 4, "^": 5, "&": 6,
                     "<<": 7, ">>": 7, "+": 8, "-": 8,
                     "*": 9, "/": 9, "//": 9, "%": 9 };
      var C_BIN = { "||": 1, "??": 1, "&&": 2, "|": 3, "^": 4, "&": 5,
                    "==": 6, "!=": 6, "===": 6, "!==": 6,
                    "<": 7, ">": 7, "<=": 7, ">=": 7, "instanceof": 7,
                    "<<": 8, ">>": 8, ">>>": 8, "+": 9, "-": 9,
                    "*": 10, "/": 10, "%": 10, "**": 11 };
      var CMP = { "<": 1, ">": 1, "<=": 1, ">=": 1, "==": 1, "!=": 1 };

      function expr() { return py ? pyTernary() : cAssign(); }

      // Python ----------------------------------------------------------
      function pyTernary() {
        var t = peek();
        if (isName("lambda")) { throw oops("cm_lambda", t.line); }
        var a = pyOr();
        if (isName("if")) {
          next();
          var c = pyOr();
          expect("else");
          var b = pyTernary();
          return { k: "cond", test: c, a: a, b: b, line: t.line };
        }
        return a;
      }
      function pyOr() {
        var a = pyAnd();
        while (isName("or")) { var t = next(); a = { k: "bin", op: "||", a: a, b: pyAnd(), line: t.line }; }
        return a;
      }
      function pyAnd() {
        var a = pyNot();
        while (isName("and")) { var t = next(); a = { k: "bin", op: "&&", a: a, b: pyNot(), line: t.line }; }
        return a;
      }
      function pyNot() {
        if (isName("not")) { var t = next(); return { k: "un", op: "!", a: pyNot(), line: t.line }; }
        return pyCompare();
      }
      function pyCmpOp() {
        var t = peek();
        if (t.t === "op" && CMP[t.v]) { next(); return t.v; }
        if (t.t === "op" && t.v === "<>") { next(); return "!="; }
        if (isName("in")) { next(); return "in"; }
        if (isName("not") && isName("in", 1)) { next(); next(); return "not in"; }
        if (isName("is")) {
          next();
          if (isName("not")) { next(); return "!="; }
          return "==";
        }
        return null;
      }
      function pyCompare() {
        var first = pyBinary(0), parts = [first], ops = [], line = peek().line;
        for (;;) {
          var op = pyCmpOp();
          if (!op) { break; }
          ops.push(op);
          parts.push(pyBinary(0));
        }
        if (!ops.length) { return first; }
        // a < b < c is a < b and b < c
        var out = null;
        ops.forEach(function (op, k) {
          var one = { k: "bin", op: op, a: parts[k], b: parts[k + 1], line: line };
          out = out ? { k: "bin", op: "&&", a: out, b: one, line: line } : one;
        });
        return out;
      }
      function pyBinary(least) {
        var a = pyUnary();
        for (;;) {
          var t = peek(), op = t.t === "op" ? t.v : null;
          var rank = op ? PY_BIN[op] : 0;
          if (!rank || rank < least) { break; }
          next();
          a = { k: "bin", op: op, a: a, b: pyBinary(rank + 1), line: t.line };
        }
        return a;
      }
      function pyUnary() {
        var t = peek();
        if (isOp("-") || isOp("+") || isOp("~")) {
          next();
          return { k: "un", op: t.v, a: pyUnary(), line: t.line };
        }
        return pyPower();
      }
      function pyPower() {
        var a = pyPostfix(pyAtom());
        if (isOp("**")) {
          var t = next();
          return { k: "bin", op: "**", a: a, b: pyUnary(), line: t.line };
        }
        return a;
      }
      function pyArgs(close) {
        var args = [];
        while (!isOp(close)) {
          var t = peek();
          if (isOp("*") || isOp("**")) { throw oops("cm_other", t.line, { bit: t.v + "args" }); }
          if (t.t === "name" && isOp("=", 1)) {
            next(); next();
            args.push({ k: "kw", name: t.v, value: pyTernary(), line: t.line });
          } else {
            args.push(pyTernary());
          }
          if (isName("for")) { throw oops("cm_lists", t.line); }
          if (!accept(",")) { break; }
        }
        expect(close);
        return args;
      }
      function pyPostfix(a) {
        for (;;) {
          var t = peek();
          if (isOp("(")) { next(); a = { k: "call", fn: a, args: pyArgs(")"), line: t.line }; }
          else if (isOp(".")) {
            next();
            var nm = next();
            if (nm.t !== "name") { throw odd(nm); }
            a = { k: "member", obj: a, name: nm.v, line: t.line };
          } else if (isOp("[")) {
            next();
            var at = isOp(":") ? { k: "null", line: t.line } : pyTernary();
            var sliced = false;
            while (accept(":")) { sliced = true; if (!isOp("]") && !isOp(":")) { pyTernary(); } }
            expect("]");
            a = { k: "index", obj: a, at: at, slice: sliced, line: t.line };
          } else { break; }
        }
        return a;
      }
      function pyAtom() {
        var t = next();
        if (t.t === "num") { return { k: "num", v: t.v, real: t.real, line: t.line }; }
        if (t.t === "str" || t.t === "fstr") {
          // "a" "b" is one string
          var out = atomOfString(t);
          while (peek().t === "str" || peek().t === "fstr") {
            var more = atomOfString(next());
            out = joinStrings(out, more);
          }
          return out;
        }
        if (t.t === "name") {
          if (t.v === "True" || t.v === "False") { return { k: "bool", v: t.v === "True", line: t.line }; }
          if (t.v === "None") { return { k: "null", line: t.line }; }
          return { k: "name", v: t.v, line: t.line };
        }
        if (t.t === "op" && t.v === "(") {
          if (isOp(")")) { next(); return { k: "tuple", items: [], line: t.line }; }
          var first = pyTernary();
          if (isName("for")) { throw oops("cm_lists", t.line); }
          if (isOp(",")) {
            var items = [first];
            while (accept(",")) { if (isOp(")")) { break; } items.push(pyTernary()); }
            expect(")");
            return { k: "tuple", items: items, line: t.line };
          }
          expect(")");
          return { k: "paren", e: first, line: t.line };
        }
        if (t.t === "op" && t.v === "[") {
          var list = [];
          while (!isOp("]")) {
            list.push(pyTernary());
            if (isName("for")) { throw oops("cm_lists", t.line); }
            if (!accept(",")) { break; }
          }
          expect("]");
          return { k: "list", items: list, line: t.line };
        }
        if (t.t === "op" && t.v === "{") {
          throw oops("cm_lists", t.line);
        }
        throw odd(t);
      }
      function atomOfString(t) {
        if (t.t === "str") { return { k: "str", v: t.v, ch: !!t.ch, line: t.line }; }
        return { k: "fstr", parts: t.v.map(function (p) {
          return typeof p === "string" ? p
               : { e: subExpr(p.code, p.line), spec: p.spec };
        }), line: t.line };
      }
      function joinStrings(a, b) {
        var pa = a.k === "str" ? [a.v] : a.parts, pb = b.k === "str" ? [b.v] : b.parts;
        var all = pa.concat(pb);
        if (all.every(function (p) { return typeof p === "string"; })) {
          return { k: "str", v: all.join(""), line: a.line };
        }
        return { k: "fstr", parts: all, line: a.line };
      }
      // An expression inside an f-string or a template: read on its own.
      function subExpr(code, line) {
        var inner = lexCode(code, lang);
        inner.toks.forEach(function (tok) { tok.line = line; });
        inner.toks = inner.toks.filter(function (tok) {
          return tok.t !== "nl" && tok.t !== "indent" && tok.t !== "dedent";
        });
        var sub = parserFor(inner, lang);
        var e = sub.expression();
        return e;
      }

      // C, Java, C#, JavaScript ---------------------------------------
      var ASSIGN = { "=": 1, "+=": 1, "-=": 1, "*=": 1, "/=": 1, "%=": 1,
                     "&=": 1, "|=": 1, "^=": 1, "<<=": 1, ">>=": 1, "??=": 1 };
      function cAssign() {
        var t = peek();
        if (arrowAhead()) { return cArrow(); }
        var a = cTernary();
        if (peek().t === "op" && ASSIGN[peek().v]) {
          var op = next().v;
          return { k: "assignx", target: a, op: op, value: cAssign(), line: t.line };
        }
        return a;
      }
      function cTernary() {
        var c = cBinary(0);
        if (isOp("?")) {
          var t = next();
          var a = cAssign();
          expect(":");
          var b = cAssign();
          return { k: "cond", test: c, a: a, b: b, line: t.line };
        }
        return c;
      }
      function cBinary(least) {
        var a = cUnary();
        for (;;) {
          var t = peek();
          var op = t.t === "op" ? t.v : (t.t === "name" && (t.v === "instanceof" || (cs && (t.v === "is" || t.v === "as"))) ? t.v : null);
          var rank = op ? C_BIN[op] || (op === "is" || op === "as" ? 7 : 0) : 0;
          if (!rank || rank < least) { break; }
          next();
          a = { k: "bin", op: op === "===" ? "==" : op === "!==" ? "!=" : op,
                a: a, b: cBinary(op === "**" ? rank : rank + 1), line: t.line };
        }
        return a;
      }
      var CAST_WORDS = /^(int|long|short|byte|double|float|char|bool|boolean|decimal|string|String|unsigned|signed|Integer|Double)$/;
      function cUnary() {
        var t = peek();
        if (t.t === "op" && (t.v === "!" || t.v === "-" || t.v === "+" || t.v === "~")) {
          next();
          return { k: "un", op: t.v, a: cUnary(), line: t.line };
        }
        if (t.t === "op" && (t.v === "++" || t.v === "--")) {
          next();
          return { k: "incdec", op: t.v, target: cUnary(), pre: true, line: t.line };
        }
        if (t.t === "op" && (t.v === "*" || t.v === "&") && cpp) {
          throw oops("cm_other", t.line, { bit: t.v });
        }
        if (isName("new")) {
          next();
          var ty = typeName();
          if (isOp("[")) { throw oops("cm_lists", t.line); }
          var args = [];
          if (accept("(")) { args = cArgs(")"); }
          if (isOp("{")) { throw oops("cm_lists", t.line); }
          return cPostfix({ k: "new", type: ty, args: args, line: t.line });
        }
        if (isName("await") || isName("typeof") || isName("delete") || isName("sizeof")) {
          next();
          return { k: "un", op: t.v + " ", a: cUnary(), line: t.line };
        }
        // (int) x, (double) (a + b)
        if (isOp("(") && peek(1).t === "name" && CAST_WORDS.test(peek(1).v) &&
            (isOp(")", 2) || (isName(undefined, 2) && isOp(")", 3)))) {
          next();
          var type = next().v;
          if (isName()) { type += " " + next().v; }
          expect(")");
          return { k: "cast", type: type, e: cUnary(), line: t.line };
        }
        return cPostfix(cPrimary());
      }
      function cArgs(close) {
        var args = [];
        while (!isOp(close)) {
          var t = peek();
          if ((cs && (isName("ref") || isName("out") || isName("in"))) && peek(1).t === "name") {
            next();
            args.push({ k: "ref", e: cAssign(), line: t.line });
          } else if (cs && t.t === "name" && isOp(":", 1) && !isOp("::", 1)) {
            next(); next();                  // a named argument: the name goes
            args.push(cAssign());
          } else {
            args.push(cAssign());
          }
          if (!accept(",")) { break; }
        }
        expect(close);
        return args;
      }
      function cPostfix(a) {
        for (;;) {
          var t = peek();
          if (isOp("<") && templateAhead()) { skipAngles(); continue; }
          if (isOp("(")) { next(); a = { k: "call", fn: a, args: cArgs(")"), line: t.line }; }
          else if (isOp(".") || isOp("->") || isOp("?.") || isOp("::")) {
            next();
            var nm = next();
            if (nm.t !== "name") { throw odd(nm); }
            a = { k: "member", obj: a, name: nm.v, line: t.line };
          } else if (isOp("[")) {
            next();
            var at = cAssign();
            expect("]");
            a = { k: "index", obj: a, at: at, line: t.line };
          } else if (isOp("++") || isOp("--")) {
            next();
            a = { k: "incdec", op: t.v, target: a, pre: false, line: t.line };
          } else if (isOp("!") && cs && !isOp("=", 1)) {
            next();                          // C#'s x! -- it is not null
          } else { break; }
        }
        return a;
      }
      function cPrimary() {
        var t = next();
        if (t.t === "num") { return { k: "num", v: t.v, real: t.real, line: t.line }; }
        if (t.t === "str") { return { k: "str", v: t.v, ch: !!t.ch, line: t.line }; }
        if (t.t === "fstr") { return atomOfString(t); }
        if (t.t === "name") {
          if (t.v === "true" || t.v === "false") { return { k: "bool", v: t.v === "true", line: t.line }; }
          if (t.v === "null" || t.v === "nullptr" || t.v === "undefined" || t.v === "NULL") {
            return { k: "null", line: t.line };
          }
          if (t.v === "this") { throw oops("cm_class", t.line); }
          if (t.v === "function" && js) {
            if (isName()) { next(); }
            var fparams = cParams();
            return { k: "fn", params: fparams, body: cBraces(), line: t.line };
          }
          return { k: "name", v: t.v, line: t.line };
        }
        if (t.t === "op" && t.v === "(") {
          var e = cAssign();
          if (isOp(",")) { throw oops("cm_other", t.line, { bit: "," }); }
          expect(")");
          return { k: "paren", e: e, line: t.line };
        }
        if (t.t === "op" && t.v === "[") {
          var list = [];
          while (!isOp("]")) { list.push(cAssign()); if (!accept(",")) { break; } }
          expect("]");
          return { k: "list", items: list, line: t.line };
        }
        if (t.t === "op" && t.v === "{") { throw oops("cm_lists", t.line); }
        throw odd(t);
      }
      // max<int>(a, b): the type between the angles, and then a call.
      // Only names, :: and commas may come between, so a < b > (c) --
      // two comparisons -- is still read as the comparisons it is.
      function templateAhead() {
        if (js || !isOp("<")) { return false; }
        var deep = 0;
        for (var k = pos; k < toks.length; k++) {
          var t = toks[k];
          if (t.t === "op" && t.v === "<") { deep++; continue; }
          if (t.t === "op" && (t.v === ">" || t.v === ">>")) {
            deep -= t.v.length;
            if (deep <= 0) {
              var after = toks[k + 1];
              return !!after && after.t === "op" && after.v === "(";
            }
            continue;
          }
          if (t.t === "name" || (t.t === "op" && (t.v === "::" || t.v === "," || t.v === "."))) { continue; }
          return false;
        }
        return false;
      }
      // (a, b) => ..., x => ...
      function arrowAhead() {
        if (!js && !cs && !java) { return false; }
        if (peek().t === "name" && (isOp("=>", 1) || isOp("->", 1) && java)) { return true; }
        if (!isOp("(")) { return false; }
        var deep = 0;
        for (var k = pos; k < toks.length; k++) {
          var t = toks[k];
          if (t.t === "op" && t.v === "(") { deep++; }
          if (t.t === "op" && t.v === ")") {
            deep--;
            if (!deep) {
              var after = toks[k + 1];
              return !!after && after.t === "op" && (after.v === "=>" || (java && after.v === "->"));
            }
          }
          if (t.t === "eof") { return false; }
        }
        return false;
      }
      // An arrow function is kept as a function, for the one place it can be
      // one -- `const area = (w, h) => w * h;` at the top of a file.
      // Anywhere else there is no chart it could be.
      function cArrow() {
        var t = peek(), params;
        if (peek().t === "name") {
          params = [{ name: next().v, type: null, dims: 0, ref: false, line: t.line }];
        } else {
          params = cParams();
        }
        if (!accept("=>") && !accept("->")) { throw oops("cm_expected", peek().line, { what: "=>" }); }
        var body = isOp("{") ? cBraces()
                 : [{ k: "return", value: cAssign(), line: t.line }];
        return { k: "fn", params: params, body: body, line: t.line };
      }
      // The body of a function nobody needs read: the helpers the page
      // itself writes into C++ and JavaScript, stepped over whole.
      function skipBraces() {
        expect("{");
        var deep = 1;
        while (deep) {
          var t = next();
          if (t.t === "eof") { throw oops("cm_expected", t.line, { what: "}" }); }
          if (t.t === "op" && t.v === "{") { deep++; }
          if (t.t === "op" && t.v === "}") { deep--; }
        }
        return [];
      }

      // ---- types, for the languages that write them down --------------
      var MODIFIERS = /^(public|private|protected|internal|static|final|const|readonly|volatile|transient|abstract|virtual|override|sealed|async|inline|extern|constexpr|mutable|unsafe|partial|synchronized|native|strictfp|default)$/;
      function modifiers() {
        var got = {};
        while (peek().t === "name" && MODIFIERS.test(peek().v) &&
               !(js && (peek().v === "const" || peek().v === "default"))) {
          got[next().v] = true;
        }
        if (js && isName("export")) { next(); return modifiers(); }
        return got;
      }
      function typeName() {
        var t = next();
        if (t.t !== "name") { throw odd(t); }
        var name = t.v;
        if ((name === "unsigned" || name === "signed" || name === "long" || name === "short") &&
            peek().t === "name" && /^(int|long|short|char|double)$/.test(peek().v)) {
          name = next().v;
          if (name === "long" && isName("long")) { next(); }
        }
        while ((isOp("::") || isOp(".")) && peek(1).t === "name") { next(); name += "::" + next().v; }
        if (isOp("<")) { skipAngles(); }
        var dims = 0;
        while (isOp("[") && isOp("]", 1)) { next(); next(); dims++; }
        if (isOp("?") && (peek(1).t === "name")) { next(); }
        var ref = false;
        while (isOp("*")) { next(); dims++; }
        if (isOp("&") || isOp("&&")) { next(); ref = true; }
        return { name: name.replace(/^std::/, ""), dims: dims, ref: ref };
      }
      function skipAngles() {
        var deep = 0;
        do {
          var t = next();
          if (t.t === "eof") { throw odd(t); }
          if (t.t === "op" && t.v === "<") { deep++; }
          else if (t.t === "op" && t.v === ">") { deep--; }
          else if (t.t === "op" && t.v === ">>") { deep -= 2; }
          else if (t.t === "op" && t.v === ">>>") { deep -= 3; }
          else if (t.t === "op" && (t.v === ";" || t.v === "{" || t.v === "(" || t.v === "=")) { throw odd(t); }
        } while (deep > 0);
      }
      // Is a declaration starting here?  A type, then a name, then one of
      // the things that can follow a declared name.  Looked at and put
      // back, whatever the answer.
      function declAhead() {
        var save = pos;
        try {
          modifiers();
          if (js) { return isName("let") || isName("const") || isName("var"); }
          if (peek().t !== "name" || /^(return|new|delete|throw|else|case|goto|using|namespace|class|struct)$/.test(peek().v)) {
            return false;
          }
          typeName();
          if (peek().t !== "name") { return false; }
          var after = peek(1);
          return after.t === "op" && /^(=|;|,|\[|\(|:|\{)$/.test(after.v);
        } catch (e) {
          return false;
        } finally {
          pos = save;
        }
      }

      // ------------------------------------------------- statements --
      // Python --------------------------------------------------------
      function pyBlock(outerCol) {
        if (accept(":") === null) { throw oops("cm_expected", peek().line, { what: ":" }); }
        if (peek().t !== "nl") { return pySimpleLine(); }
        next();
        var ind = peek();
        if (ind.t !== "indent") { throw oops("cm_indent", ind.line); }
        next();
        var body = [];
        while (peek().t !== "dedent" && peek().t !== "eof") {
          body.push.apply(body, notesBefore(peek().line));
          body.push.apply(body, pyStatement(ind.v));
        }
        body.push.apply(body, notesBefore(peek().line, ind.v));
        if (peek().t === "dedent") { next(); }
        return body;
      }
      function pySimpleLine() {
        var out = [];
        for (;;) {
          out.push.apply(out, pySimple());
          if (accept(";")) { if (peek().t === "nl" || peek().t === "eof") { break; } continue; }
          break;
        }
        if (peek().t === "nl") { next(); }
        else if (peek().t !== "eof" && peek().t !== "dedent") { throw odd(); }
        return out;
      }
      function pyStatement(col) {
        var t = peek();
        if (t.t === "indent") { throw oops("cm_indent", t.line); }
        if (t.t === "op" && t.v === "@") { throw oops("cm_class", t.line); }
        if (t.t === "name") {
          switch (t.v) {
            case "if": return [pyIf()];
            case "while": {
              next();
              var c = expr();
              var body = pyBlock(col);
              if (isName("else")) { throw oops("cm_other", peek().line, { bit: "while … else" }); }
              return [{ k: "while", cond: c, body: body, line: t.line }];
            }
            case "for": return [pyFor()];
            case "def": return [pyDef()];
            case "class": throw oops("cm_class", t.line);
            case "try": return pyTry();
            case "with": throw oops("cm_other", t.line, { bit: "with" });
            case "async": throw oops("cm_other", t.line, { bit: "async" });
            case "match":
              if (peek(1).t !== "op" || peek(1).v === "(" || peek(1).v === "[") {
                var save = pos;
                try { return [pyMatch()]; } catch (e) { pos = save; if (e.said !== "cm_expected") { throw e; } }
              }
              break;
            case "elif": case "else": case "except": case "finally":
              throw odd(t);
          }
        }
        return pySimpleLine();
      }
      function pyIf() {
        var t = next();
        var node = { k: "if", cond: expr(), then: null, orelse: [], line: t.line };
        node.then = pyBlock();
        var cur = node;
        for (;;) {
          notesSkip();
          if (isName("elif")) {
            var e = next();
            var more = { k: "if", cond: expr(), then: null, orelse: [], chained: true, line: e.line };
            more.then = pyBlock();
            cur.orelse = [more];
            cur = more;
            continue;
          }
          if (isName("else")) { next(); cur.orelse = pyBlock(); }
          break;
        }
        return node;
      }
      // A comment sitting between the end of an if and its elif belongs to
      // the elif; there is nowhere in pseudocode to put it, so it goes.
      function notesSkip() {
        if (isName("elif") || isName("else") || isName("except") || isName("finally")) {
          while (notes.length && notes[0].line < peek().line) { notes.shift(); }
        }
      }
      function pyFor() {
        var t = next();
        var names = [];
        do { var nm = next(); if (nm.t !== "name") { throw odd(nm); } names.push(nm.v); }
        while (accept(","));
        expect("in");
        var over = expr();
        if (isOp(",")) { throw oops("cm_lists", t.line); }
        var body = pyBlock();
        if (isName("else")) { throw oops("cm_other", peek().line, { bit: "for … else" }); }
        if (names.length === 1 && over.k === "call" && over.fn.k === "name" &&
            over.fn.v === "range" && over.args.length >= 1 && over.args.length <= 3) {
          return { k: "range", v: names[0], args: over.args, body: body, line: t.line };
        }
        return { k: "foreach", v: names.join(", "), over: over, body: body, line: t.line };
      }
      function pyDef() {
        var t = next();
        var nm = next();
        if (nm.t !== "name") { throw odd(nm); }
        expect("(");
        var params = [];
        while (!isOp(")")) {
          if (isOp("*") || isOp("**") || isOp("/")) {
            var star = next();
            if (isOp(",") || isOp(")")) { accept(","); continue; }
            throw oops("cm_other", star.line, { bit: star.v + "args" });
          }
          var p = next();
          if (p.t !== "name") { throw odd(p); }
          var one = { name: p.v, type: null, line: p.line };
          if (accept(":")) { one.type = annotation(expr()); }
          if (accept("=")) { expr(); }
          params.push(one);
          if (!accept(",")) { break; }
        }
        expect(")");
        var rtype = null;
        if (accept("->")) { rtype = annotation(expr()); }
        var body = pyBlock();
        return { k: "func", name: nm.v, params: params, rtype: rtype, body: body, line: t.line };
      }
      function annotation(e) {
        return e.k === "name" ? e.v : e.k === "str" ? e.v : e.k === "null" ? "void" : null;
      }
      function pyTry() {
        var t = next();
        var body = pyBlock();
        var out = body.slice();
        var caught = false;
        for (;;) {
          notesSkip();
          if (isName("except")) {
            next();
            while (!isOp(":")) { next(); }
            pyBlock();
            caught = true;
            continue;
          }
          if (isName("else")) { next(); out = out.concat(pyBlock()); continue; }
          if (isName("finally")) { next(); out = out.concat(pyBlock()); continue; }
          break;
        }
        if (!caught && !out.length) { throw odd(t); }
        return [{ k: "try", body: out, line: t.line }];
      }
      function pyMatch() {
        var t = next();
        var subject = expr();
        expect(":");
        if (peek().t !== "nl") { throw oops("cm_expected", peek().line, { what: "↵" }); }
        next();
        if (peek().t !== "indent") { throw oops("cm_indent", peek().line); }
        var ind = next();
        var cases = [];
        while (peek().t !== "dedent" && peek().t !== "eof") {
          notesBefore(peek().line);
          var c = next();
          if (c.t !== "name" || c.v !== "case") { throw odd(c); }
          var labels = [], isDefault = false;
          do {
            if (isName("_")) { next(); isDefault = true; }
            else {
              // above |, which is what joins one pattern to the next
              labels.push(pyBinary(PY_BIN["|"] + 1));
            }
          } while (accept("|"));
          if (isName("if")) { throw oops("cm_other", peek().line, { bit: "case … if" }); }
          var body = pyBlock(ind.v);
          cases.push({ labels: labels, isDefault: isDefault, body: body, line: c.line });
        }
        if (peek().t === "dedent") { next(); }
        return { k: "switch", subject: subject, cases: cases, noFall: true, line: t.line };
      }
      function pySimple() {
        var t = peek();
        if (t.t === "name") {
          switch (t.v) {
            case "pass": next(); return [];
            case "break": next(); return [{ k: "break", line: t.line }];
            case "continue": next(); return [{ k: "continue", line: t.line }];
            case "return":
              next();
              var v = (peek().t === "nl" || isOp(";") || peek().t === "eof") ? null : exprList();
              return [{ k: "return", value: v, line: t.line }];
            case "global": case "nonlocal": {
              next();
              var names = [];
              do { names.push(next().v); } while (accept(","));
              return [{ k: "global", names: names, line: t.line }];
            }
            case "import": case "from":
              while (peek().t !== "nl" && peek().t !== "eof" && !isOp(";")) { next(); }
              return [];
            case "raise": {
              next();
              var what = (peek().t === "nl" || peek().t === "eof") ? null : expr();
              var named = what && (what.k === "name" ? what.v : what.k === "call" && what.fn.k === "name" ? what.fn.v : "");
              // SystemExit on purpose, anything else by way of an error:
              // either way the program stops there
              return [{ k: "exit", line: t.line, named: named }];
            }
            case "del": case "assert": case "yield":
              throw oops("cm_other", t.line, { bit: t.v });
          }
        }
        var first = exprList();
        if (isOp(":") && first.k === "name") {         // x: int = 5
          next();
          var ann = annotation(expr());
          var val = accept("=") ? exprList() : null;
          return [{ k: "decl", names: [{ name: first.v, value: val, line: t.line }],
                    type: ann, line: t.line }];
        }
        if (isOp("=")) {
          var targets = [first];
          while (accept("=")) { targets.push(exprList()); }
          var value = targets.pop();
          return targets.map(function (target) {
            return { k: "assign", target: target, value: value, line: t.line };
          });
        }
        var aug = peek();
        if (aug.t === "op" && /^(\+|-|\*|\/|\/\/|%|\*\*)=$/.test(aug.v)) {
          next();
          return [{ k: "aug", target: first, op: aug.v.slice(0, -1), value: exprList(), line: t.line }];
        }
        if (aug.t === "op" && aug.v === ":=") { throw oops("cm_other", aug.line, { bit: ":=" }); }
        return [{ k: "expr", e: first, line: t.line }];
      }
      function exprList() {
        var first = expr();
        if (!py || !isOp(",")) { return first; }
        var items = [first];
        while (accept(",")) {
          if (peek().t === "nl" || isOp("=") || isOp(")") || peek().t === "eof") { break; }
          items.push(expr());
        }
        return { k: "tuple", items: items, line: first.line };
      }

      // C, Java, C#, JavaScript -----------------------------------------
      function cBlockOrOne() {
        if (isOp("{")) { return cBraces(); }
        var line = peek().line;
        return notesBefore(line).concat(cStatement());
      }
      function cBraces() {
        expect("{");
        var body = [];
        while (!isOp("}")) {
          if (peek().t === "eof") { throw oops("cm_expected", peek().line, { what: "}" }); }
          body.push.apply(body, notesBefore(peek().line));
          body.push.apply(body, cStatement());
        }
        body.push.apply(body, notesBefore(peek().line));
        expect("}");
        return body;
      }
      function cStatement() {
        var t = peek();
        if (isOp("{")) { return cBraces(); }
        if (isOp(";")) { next(); return []; }
        if (t.t === "name") {
          switch (t.v) {
            case "if": {
              next();
              expect("(");
              var c = cAssign();
              expect(")");
              var then = cBlockOrOne();
              var node = { k: "if", cond: c, then: then, orelse: [], line: t.line };
              if (isName("else")) {
                next();
                if (isName("if")) {
                  var more = cStatement()[0];
                  more.chained = true;
                  node.orelse = [more];
                } else {
                  node.orelse = cBlockOrOne();
                }
              }
              return [node];
            }
            case "while": {
              next();
              expect("(");
              var wc = cAssign();
              expect(")");
              return [{ k: "while", cond: wc, body: cBlockOrOne(), line: t.line }];
            }
            case "do": {
              next();
              var body = cBlockOrOne();
              expect("while");
              expect("(");
              var dc = cAssign();
              expect(")");
              accept(";");
              return [{ k: "dowhile", cond: dc, body: body, line: t.line }];
            }
            case "for": return [cFor()];
            case "foreach": {
              next();
              expect("(");
              var save = pos;
              modifiers();
              if (isName("var") || declAhead()) { typeName(); }
              var each = next();
              expect("in");
              var over = cAssign();
              expect(")");
              if (each.t !== "name") { pos = save; throw odd(each); }
              return [{ k: "foreach", v: each.v, over: over, body: cBlockOrOne(), line: t.line }];
            }
            case "switch": return [cSwitch()];
            case "return": {
              next();
              var v = isOp(";") ? null : cAssign();
              accept(";");
              return [{ k: "return", value: v, line: t.line }];
            }
            case "break": next(); accept(";"); return [{ k: "break", line: t.line }];
            case "continue": next(); accept(";"); return [{ k: "continue", line: t.line }];
            case "try": return cTry();
            case "throw": {
              // an error nobody catches: the program stops there
              next();
              if (!isOp(";")) { cAssign(); }
              accept(";");
              return [{ k: "exit", line: t.line }];
            }
            case "goto": throw oops("cm_other", t.line, { bit: "goto" });
            case "class": case "struct": case "interface": case "enum": case "record":
              throw oops("cm_class", t.line);
            case "function":
              if (js) { return [jsFunction()]; }
              break;
            case "using":
              if (cs && isOp("(", 1)) { throw oops("cm_other", t.line, { bit: "using" }); }
              while (!isOp(";") && peek().t !== "eof") { next(); }
              accept(";");
              return [];
          }
        }
        if (declAhead()) { return cDeclaration(); }
        var e = cAssign();
        if (!accept(";")) {
          if (!js || (peek().line === toks[pos - 1].line && !isOp("}"))) {
            throw oops("cm_expected", toks[pos - 1].line, { what: ";" });
          }
        }
        return [{ k: "expr", e: e, line: t.line }];
      }
      // int a = 1, b;   final double TAX = 0.08;   let x = 5;   var s = "";
      function cDeclaration() {
        var t = peek();
        var mods = modifiers();
        var type = null, konst = !!(mods.final || mods.const || mods.readonly || mods.constexpr);
        if (js) {
          var how = next().v;
          konst = how === "const";
        } else {
          if (isName("const")) { next(); konst = true; }
          type = typeName();
          if (type.name === "const") { konst = true; type = typeName(); }
        }
        var names = [];
        do {
          var nm = next();
          if (nm.t !== "name") { throw odd(nm); }
          var dims = 0;
          while (accept("[")) { if (!isOp("]")) { cAssign(); } expect("]"); dims++; }
          var value = null;
          if (accept("=")) {
            if (isOp("{")) { throw oops("cm_lists", nm.line); }
            value = cAssign();
          } else if (isOp("(") && !js) {        // C++: int x(5);  or a prototype
            next();
            var args = cArgs(")");
            value = args.length === 1 ? args[0] : { k: "new", type: type, args: args, line: nm.line };
          } else if (isOp("{") && cpp) {
            next();
            var inits = cArgs("}");
            value = inits[0] || null;
          }
          names.push({ name: nm.v, value: value, dims: dims + (type ? type.dims : 0), line: nm.line });
        } while (accept(","));
        if (isOp(":")) { throw oops("cm_other", t.line, { bit: ":" }); }
        if (!accept(";") && !js) { throw oops("cm_expected", toks[pos - 1].line, { what: ";" }); }
        return [{ k: "decl", type: type ? type.name : null, dims: type ? type.dims : 0,
                  konst: konst, names: names, line: t.line }];
      }
      function cFor() {
        var t = next();
        expect("(");
        // for (x of xs), for (T x : xs) -- over everything in something
        var save = pos;
        modifiers();
        if (js ? (isName("let") || isName("const") || isName("var")) : declAhead()) {
          if (js) { next(); } else { typeName(); }
          var each = peek();
          if (each.t === "name" && (isOp(":", 1) || isName("of", 1) || isName("in", 1))) {
            next();
            next();
            var over = cAssign();
            expect(")");
            return { k: "foreach", v: each.v, over: over, body: cBlockOrOne(), line: t.line };
          }
        } else if (js && peek().t === "name" && (isName("of", 1) || isName("in", 1))) {
          var bare = next();
          next();
          var over2 = cAssign();
          expect(")");
          return { k: "foreach", v: bare.v, over: over2, body: cBlockOrOne(), line: t.line };
        }
        pos = save;
        var init = [];
        if (!isOp(";")) {
          if (declAhead()) { init = cDeclaration(); pos--; }
          else {
            do { init.push({ k: "expr", e: cAssign(), line: t.line }); } while (accept(","));
          }
        }
        expect(";");
        var cond = isOp(";") ? null : cAssign();
        expect(";");
        var step = [];
        while (!isOp(")")) {
          step.push({ k: "expr", e: cAssign(), line: t.line });
          if (!accept(",")) { break; }
        }
        expect(")");
        return { k: "for", init: init, cond: cond, step: step, body: cBlockOrOne(), line: t.line };
      }
      function cSwitch() {
        var t = next();
        expect("(");
        var subject = cAssign();
        expect(")");
        expect("{");
        var cases = [], cur = null, arrows = false;
        while (!isOp("}")) {
          var c = peek();
          if (c.t === "eof") { throw oops("cm_expected", c.line, { what: "}" }); }
          if (isName("case") || isName("default")) {
            next();
            var labels = [], isDefault = c.v === "default";
            if (!isDefault) {
              do { labels.push(cTernary()); } while (accept(","));
              if (isName("when")) { throw oops("cm_other", peek().line, { bit: "when" }); }
            }
            if (isOp("->")) {
              next();
              arrows = true;
              var one = isOp("{") ? cBraces() : cStatement();
              cases.push({ labels: labels, isDefault: isDefault, body: one, line: c.line });
              cur = null;
              continue;
            }
            expect(":");
            cur = { labels: labels, isDefault: isDefault, body: [], line: c.line };
            cases.push(cur);
            continue;
          }
          if (!cur) { throw odd(c); }
          cur.body.push.apply(cur.body, notesBefore(c.line));
          cur.body.push.apply(cur.body, cStatement());
        }
        expect("}");
        return { k: "switch", subject: subject, cases: cases, noFall: arrows, line: t.line };
      }
      function cTry() {
        var t = next();
        if (isOp("(")) { throw oops("cm_other", t.line, { bit: "try (…)" }); }
        var body = cBraces();
        while (isName("catch")) {
          next();
          if (accept("(")) { var deep = 1; while (deep) { var x = next(); if (x.t === "eof") { throw odd(x); } if (x.v === "(") { deep++; } if (x.v === ")") { deep--; } } }
          cBraces();
        }
        if (isName("finally")) { next(); body = body.concat(cBraces()); }
        return [{ k: "try", body: body, line: t.line }];
      }
      function cParams() {
        expect("(");
        var params = [];
        while (!isOp(")")) {
          var p = peek(), ref = false;
          if (isName("void") && isOp(")", 1)) { next(); break; }
          while (peek().t === "name" && /^(final|const|ref|out|in|params|let|var|readonly|scoped)$/.test(peek().v)) {
            var m = next().v;
            if (m === "ref" || m === "out") { ref = true; }
          }
          var type = null;
          if (!js) {
            type = typeName();
            if (type.ref && !/const/.test(p.v)) { ref = true; }
            if (isName("const")) { next(); }
          }
          var nm = next();
          if (nm.t !== "name") {
            if (js) { throw oops("cm_other", nm.line, { bit: String(nm.v) }); }
            throw odd(nm);
          }
          while (accept("[")) { expect("]"); }
          if (accept("=")) { cAssign(); }
          params.push({ name: nm.v, type: type ? type.name : null,
                        dims: type ? type.dims : 0, ref: ref, line: nm.line });
          if (!accept(",")) { break; }
        }
        expect(")");
        return params;
      }
      function jsFunction() {
        var t = next();
        if (isOp("*")) { throw oops("cm_other", t.line, { bit: "function*" }); }
        var nm = next();
        if (nm.t !== "name") { throw oops("cm_lambda", t.line); }
        var params = cParams();
        var body = helpersOf(lang).test(nm.v) ? skipBraces() : cBraces();
        return { k: "func", name: nm.v, params: params, rtype: null, body: body, line: t.line };
      }

      // ---- the top of a file ------------------------------------------
      // What a program is made of before any statement: functions, the
      // names they share, and for Java and C# the class around it all.
      function topC() {
        var out = { funcs: [], globals: [], main: [], mainFound: false };
        function member(inClass) {
          var t = peek();
          var lead = notesBefore(t.line);
          if (isOp(";")) { next(); return; }
          if (isName("import") || isName("package") || (isName("using") && !isOp("(", 1))) {
            while (!isOp(";") && peek().t !== "eof") { next(); }
            accept(";");
            return;
          }
          if (isName("namespace")) {
            next();
            while (!isOp("{") && !isOp(";")) { next(); }
            if (accept(";")) { return; }
            expect("{");
            while (!isOp("}") && peek().t !== "eof") { member(inClass); }
            expect("}");
            return;
          }
          if (isName("template")) { throw oops("cm_class", t.line); }
          var save = pos;
          var mods = modifiers();
          if (isName("class") || isName("struct") || isName("interface") ||
              isName("record") || isName("enum")) {
            var kind = next().v;
            if (kind === "enum" || kind === "interface" || cpp || js) { throw oops("cm_class", t.line); }
            out.className = next().v;        // its name: a method of that name is a constructor
            while (!isOp("{")) {
              if (peek().t === "eof") { throw odd(peek()); }
              next();
            }
            next();
            while (!isOp("}")) {
              if (peek().t === "eof") { throw oops("cm_expected", peek().line, { what: "}" }); }
              member(true);
            }
            expect("}");
            accept(";");
            return;
          }
          if (js && inClass === false && !isName("function") && !declAhead()) {
            pos = save;
            out.main.push.apply(out.main, lead);
            out.main.push.apply(out.main, cStatement());
            return;
          }
          if (js && isName("function")) {
            out.funcs.push(Object.assign(jsFunction(), { lead: lead }));
            return;
          }
          if (inClass && out.className && isName(out.className) && isOp("(", 1)) {
            throw oops("cm_class", t.line);          // a constructor
          }
          // a function: a type, a name, and a bracket
          var looks = false, fpos = pos;
          try {
            if (!js && peek().t === "name") {
              typeName();
              looks = peek().t === "name" && isOp("(", 1);
            }
          } catch (e) { looks = false; }
          pos = fpos;
          if (looks) {
            var rtype = typeName();
            var nm = next();
            if (inClass && out.className && nm.v === out.className) { throw oops("cm_class", t.line); }
            var params = cParams();
            while (peek().t === "name" && /^(const|throws|noexcept|override)$/.test(peek().v)) {
              next();
              while (isName() || isOp(",") || isOp(".")) {
                if (isOp("{") || isOp(";")) { break; }
                next();
              }
            }
            if (accept(";")) { return; }         // a prototype: the real one is further on
            if (isOp("=>")) { throw oops("cm_lambda", peek().line); }
            var body = helpersOf(lang).test(nm.v) ? skipBraces() : cBraces();
            var fn = { k: "func", name: nm.v, params: params, rtype: rtype.name,
                       rdims: rtype.dims, body: body, line: nm.line, lead: lead,
                       statik: !!mods.static };
            if (/^main$/i.test(nm.v) && !out.mainFound) {
              out.mainFound = true;
              out.main = lead.concat(body);
              out.mainLine = nm.line;
            } else {
              out.funcs.push(fn);
            }
            return;
          }
          pos = save;
          if (declAhead()) {
            var decl = cDeclaration()[0];
            decl.lead = lead;
            // const f = function () {} or an arrow: a function by another name
            if (js && decl.names.length === 1 && decl.names[0].value &&
                decl.names[0].value.k === "fn") {
              var made = decl.names[0].value;
              out.funcs.push({ k: "func", name: decl.names[0].name, params: made.params,
                               rtype: null, body: made.body, line: decl.line, lead: lead });
              return;
            }
            if (js && !inClass) { out.main.push.apply(out.main, lead); out.main.push(decl); }
            else { out.globals.push(decl); }
            return;
          }
          if (inClass) { throw odd(peek()); }
          out.main.push.apply(out.main, lead);
          out.main.push.apply(out.main, cStatement());
          if (!js) { out.looseCode = true; }
        }
        out.head = notesBefore(peek().line);
        while (peek().t !== "eof") { member(false); }
        out.trailing = notesBefore(1e9);
        return out;
      }
      function topPy() {
        var out = { funcs: [], globals: [], main: [] };
        // what the file says about itself, above everything in it
        out.head = notesBefore(peek().line);
        while (peek().t !== "eof") {
          var t = peek();
          if (t.t === "dedent" || t.t === "nl") { next(); continue; }
          var lead = notesBefore(t.line);
          var got = pyStatement(0);
          got.forEach(function (one) {
            if (one.k === "func") { one.lead = lead; lead = []; out.funcs.push(one); }
          });
          out.main.push.apply(out.main, lead);
          out.main.push.apply(out.main, got.filter(function (one) { return one.k !== "func"; }));
        }
        out.trailing = notesBefore(1e9);
        return out;
      }

      return {
        program: function () { return py ? topPy() : topC(); },
        expression: function () {
          var e = expr();
          if (peek().t !== "eof") { throw odd(); }
          return e;
        }
      };
    }

    // =========================================== making sense of it ==
    // The tree says what was written.  What it means as a flowchart takes
    // a second look: which names each chart has of its own and which it
    // shares, what kind of thing every name holds, which call is a print
    // or a question -- and the language matters at every one of them.

    // What each language calls the kinds of thing a name can hold.
    var KIND_OF_TYPE = {
      int: "int", long: "int", short: "int", byte: "int", integer: "int", sbyte: "int",
      uint: "int", ulong: "int", ushort: "int", size_t: "int", int32: "int", int64: "int",
      double: "real", float: "real", decimal: "real", real: "real", single: "real",
      string: "text", str: "text", char: "text", character: "text",
      bool: "bool", boolean: "bool"
    };
    var TYPE_WORD = { int: "Integer", real: "Real", text: "String", bool: "Boolean" };
    function kindOfType(name) {
      if (!name) { return null; }
      var bare = String(name).replace(/^(std|System|java\.lang)::/, "").toLowerCase();
      return KIND_OF_TYPE[bare] || null;
    }
    function mergeKinds(a, b) {
      if (!a) { return b; }
      if (!b || a === b) { return a; }
      if ((a === "int" && b === "real") || (a === "real" && b === "int")) { return "real"; }
      return "mixed";
    }

    // Words the pseudocode keeps for itself.  A name written in the code
    // that is one of them is given a trailing underscore, or `If x > to`
    // would be read as something quite different.
    var KEPT = /^(and|or|not|mod|div|to|downto|then|true|false|step|end|else|ref)$/i;

    // A dotted name, for looking things up: Math.sqrt, System.out.println,
    // std::cout -- or null for anything that is not a plain path of names.
    function pathOf(e) {
      if (!e) { return null; }
      if (e.k === "name") { return e.v; }
      if (e.k === "member") {
        var left = pathOf(e.obj);
        return left === null ? null : left + "." + e.name;
      }
      return null;
    }
    function bare(path) {
      return String(path || "").replace(/^std\./, "").replace(/^System\.(?=Console|Math|Threading|Convert|Environment)/, "");
    }
    function stripParens(e) { while (e && e.k === "paren") { e = e.e; } return e; }

    // ============================================= saying it again ==
    function translate(src, lang) {
      var py = lang === "python", js = lang === "javascript";
      var cpp = lang === "cpp", cs = lang === "csharp", java = lang === "java";
      if (!String(src || "").trim()) { throw oops("cm_empty", 0); }
      var lexed = lexCode(src, lang);
      var top = parserFor(lexed, lang).program();
      var notes = [];                        // said beside the pseudocode
      function note(line, bit) {
        if (notes.length < 6 && !notes.some(function (n) { return n.line === line; })) {
          notes.push({ line: line, text: say("cm_wont_run", { n: line, bit: bit }) });
        }
      }

      // ---- the writer's own helpers, and the devices --------------------
      // A Scanner, a Random, the helper functions the page itself writes
      // into C++ and JavaScript to ask for things: none of them is part of
      // the program being described, only of the way the language had to
      // go about it.
      var HELPERS = helpersOf(lang);
      var devices = {};
      function deviceOf(value) {
        value = stripParens(value);
        if (!value) { return null; }
        if (value.k === "new") {
          var ty = String(value.type && value.type.name || value.type || "");
          if (/Scanner|BufferedReader|InputStreamReader|Console/.test(ty)) { return "keys"; }
          if (/Random/.test(ty)) { return "dice"; }
        }
        if (value.k === "call") {
          var p = pathOf(value.fn) || "";
          if (p === "require") {
            var what = value.args[0] && value.args[0].v || "";
            if (/readline|prompt/.test(what)) { return "keys"; }
            return "lib";
          }
          if (value.fn.k === "call" && pathOf(value.fn.fn) === "require") { return "keys"; }
          if (/^readline\.createInterface$/.test(p)) { return "keys"; }
        }
        return null;
      }
      function dropDevices(list) {
        return list.filter(function (st) {
          if (st.k !== "decl") { return true; }
          st.names = st.names.filter(function (one) {
            var d = deviceOf(one.value);
            if (d) { devices[one.name] = d; return false; }
            return true;
          });
          return st.names.length > 0;
        });
      }
      top.globals = dropDevices(top.globals);
      top.funcs = top.funcs.filter(function (fn) { return !HELPERS.test(fn.name); });

      // ---- main: which statements are the program's own -------------------
      var main = top.main, lead = [];
      if (py || js) {
        // if __name__ == "__main__": main()   -- the body is main's
        var flat = [];
        main.forEach(function (st) {
          if (st.k === "if" && py && pathOf(st.cond.a) === "__name__") {
            flat.push.apply(flat, st.then);
          } else { flat.push(st); }
        });
        main = flat;
        // def main(): ... called once at the foot of the file is the main
        // chart, and is drawn as it -- where the call to it stood, after
        // whatever the file set up above it.
        var named = top.funcs.filter(function (fn) {
          return fn.name === "main" && !fn.params.length;
        })[0];
        var calls = main.filter(function (st) {
          return st.k === "expr" && st.e.k === "call" && pathOf(st.e.fn) === "main";
        });
        var callsInside = top.funcs.some(function (fn) {
          return fn !== named && mentions(fn.body, "main");
        });
        if (named && calls.length === 1 && !callsInside) {
          var at = main.indexOf(calls[0]);
          main = main.slice(0, at).concat(named.lead || [], named.body, main.slice(at + 1));
          top.funcs = top.funcs.filter(function (fn) { return fn !== named; });
        }
      }
      main = dropDevices(main);

      // ---- every chart, lowered to what pseudocode can say ----------------
      var funcs = {}, order = [];
      top.funcs.forEach(function (fn) {
        if (funcs[fn.name.toLowerCase()]) { throw oops("cm_twice", fn.line, { name: fn.name }); }
        funcs[fn.name.toLowerCase()] = fn;
        order.push(fn);
      });
      function userFn(path) { return path && funcs[String(path).toLowerCase()] || null; }

      // A chart: its own names, what it was handed, and the statements.
      function Chart(fn) {
        this.fn = fn;
        this.names = {};                    // name -> { kind, first, declared, konst }
        this.list = [];                     // in the order first met
        this.globalsHere = {};              // Python: said `global`
        this.params = {};
      }
      Chart.prototype.meet = function (name, how) {
        // a parameter set inside its own function is the parameter still
        if (this.params[name]) {
          if (how && how.kind) {
            this.params[name].kinds = (this.params[name].kinds || []).concat([how.kind]);
          }
          return this.params[name];
        }
        var one = this.names[name];
        if (!one) {
          one = this.names[name] = { name: name, kind: null, kinds: [], sets: 0,
                                     declared: false, konst: false, loopOnly: true };
          this.list.push(one);
        }
        if (how) {
          if (how.kind) { one.kinds.push(how.kind); }
          if (how.declared) { one.declared = true; }
          if (how.konst) { one.konst = true; }
          if (how.type) { one.type = how.type; }
          if (!how.loop) { one.loopOnly = false; }
          if (how.set) { one.sets++; }
        }
        return one;
      };

      var charts = [], mainChart = new Chart(null);
      var globalChart = new Chart(null);    // what every chart shares
      charts.push(mainChart);

      // ---------------------------------------------------------------
      // Lowering: the tree's statements, as the statements pseudocode has.
      //   set input display call if while do for select return stop wait note
      function lower(list, ch, inLoop, inSwitch) {
        var out = [];
        list.forEach(function (st) { lowerOne(st, ch, out, inLoop, inSwitch); });
        return out;
      }
      // A ? B : C inside a statement: the statement twice, once each way,
      // under an If -- which is what the question mark was saying.
      function firstTernary(e) {
        if (!e || typeof e !== "object") { return null; }
        if (e.k === "cond") { return e; }
        if (e.k === "fn") { return null; }
        for (var key in e) {
          if (key === "line") { continue; }
          var v = e[key], got = null;
          if (Array.isArray(v)) {
            for (var i = 0; i < v.length && !got; i++) { got = firstTernary(v[i]); }
          } else if (v && typeof v === "object") { got = firstTernary(v); }
          if (got) { return got; }
        }
        return null;
      }
      function swapped(e, from, to) {
        if (e === from) { return to; }
        if (!e || typeof e !== "object") { return e; }
        if (Array.isArray(e)) { return e.map(function (x) { return swapped(x, from, to); }); }
        var o = {};
        for (var key in e) { o[key] = swapped(e[key], from, to); }
        return o;
      }
      function lowerOne(st, ch, out, inLoop, inSwitch) {
        var line = st.line;
        var q = (st.k === "return" || st.k === "expr" || (st.k === "assign" &&
                 stripParens(st.value) && stripParens(st.value).k !== "cond"))
                ? firstTernary(st.k === "assign" ? st.value : st.k === "return" ? st.value : st.e) : null;
        if (q && !(st.k === "expr" && stripParens(st.e).k === "cond")) {
          out.push({ k: "if", cond: q.test, line: line,
                     then: lowered(function (o) { lowerOne(swapped(st, q, q.a), ch, o, inLoop, inSwitch); }),
                     orelse: lowered(function (o) { lowerOne(swapped(st, q, q.b), ch, o, inLoop, inSwitch); }) });
          return;
        }
        switch (st.k) {
          case "note": out.push({ k: "note", text: st.text, line: line }); return;
          case "pass": case "global":
            if (st.k === "global") {
              st.names.forEach(function (nm) { ch.globalsHere[nm] = true; });
            }
            return;
          case "try": out.push.apply(out, lower(st.body, ch, inLoop, inSwitch)); return;
          case "func": throw oops("cm_nested_fn", line);
          case "exit": out.push({ k: "stop", line: line }); return;
          case "break":
            if (inSwitch) { out.push({ k: "break", line: line }); return; }
            throw oops("cm_break", line);
          case "continue": throw oops("cm_continue", line);
          case "return":
            out.push({ k: "return", value: st.value, line: line });
            return;
          case "decl": {
            st.names.forEach(function (one) {
              var dev = deviceOf(one.value);
              if (dev) { devices[one.name] = dev; return; }
              var kind = kindOfType(st.type);
              if (one.dims || st.dims) { kind = "list"; }
              ch.meet(one.name, { kind: kind, declared: true, konst: st.konst,
                                  type: st.type });
              if (one.value) {
                assign({ k: "name", v: one.name, line: one.line }, one.value, ch, out,
                       line, true);
              }
            });
            return;
          }
          case "assign":
            assign(st.target, st.value, ch, out, line, false);
            return;
          case "aug": {
            var op = st.op === "**" ? "**" : st.op;
            assign(st.target, { k: "bin", op: op, a: st.target, b: { k: "paren", e: st.value }, line: line },
                   ch, out, line, false);
            return;
          }
          case "expr":
            statementExpr(st.e, ch, out, line);
            return;
          case "if": {
            var node = { k: "if", cond: st.cond, then: lower(st.then, ch, inLoop, inSwitch),
                         orelse: lower(st.orelse, ch, inLoop, inSwitch),
                         chained: !!st.chained, line: line };
            out.push(node);
            return;
          }
          case "while": {
            var cond = stripParens(st.cond);
            var body = st.body.slice();
            if (cond.k === "bool" && cond.v || (cond.k === "num" && cond.v !== "0")) {
              var forever = foreverLoop(body, ch, line);
              if (forever.k === "block") { out.push.apply(out, forever.body); }
              else { out.push(forever); }
              return;
            }
            out.push({ k: "while", cond: st.cond, body: lower(body, ch, true), line: line });
            return;
          }
          case "dowhile":
            out.push({ k: "do", cond: st.cond, until: false, body: lower(st.body, ch, true), line: line });
            return;
          case "range": {
            var a = st.args, from = a.length > 1 ? a[0] : { k: "num", v: "0", line: line };
            var to = a.length > 1 ? a[1] : a[0], by = a[2] || null;
            var down = by && isNegative(by);
            ch.meet(st.v, { kind: "int", set: true, loop: true });
            out.push({ k: "for", v: st.v, from: from,
                       to: offBy(to, down ? 1 : -1), by: by,
                       body: lower(st.body, ch, true), line: line });
            return;
          }
          case "for":
            out.push.apply(out, cFor(st, ch));
            return;
          case "foreach": {
            note(line, "for … in");
            st.v.split(/,\s*/).forEach(function (nm) { ch.meet(nm, { loop: true, set: true }); });
            out.push({ k: "foreach", v: st.v, over: st.over,
                       body: lower(st.body, ch, true), line: line });
            return;
          }
          case "switch":
            out.push(lowerSwitch(st, ch));
            return;
        }
        throw oops("cm_other", line, { bit: st.k });
      }

      // while True: ... with the way out at the top or the foot.
      function foreverLoop(body, ch, line) {
        function breakIf(st) {
          if (!st || st.k !== "if" || st.orelse.length) { return null; }
          var then = st.then.filter(function (s) { return s.k !== "note"; });
          return then.length === 1 && then[0].k === "break" ? st.cond : null;
        }
        var real = body.filter(function (s) { return s.k !== "note"; });
        var last = real[real.length - 1], first = real[0];
        if (breakIf(last) && real.length > 1 && !findBreak(body.slice(0, body.lastIndexOf(last)))) {
          var inner = body.slice(0, body.lastIndexOf(last));
          return { k: "do", cond: breakIf(last), until: true, body: lower(inner, ch, true), line: line };
        }
        if (breakIf(first) && !findBreak(body.slice(body.indexOf(first) + 1))) {
          var rest = body.slice(body.indexOf(first) + 1);
          return { k: "while", cond: { k: "un", op: "!", a: breakIf(first), line: line },
                   body: lower(rest, ch, true), line: line };
        }
        // The way out in the middle: what comes before it is done once to
        // start with and again at the foot of every time round -- the
        // priming read every textbook teaches, which is what this was.
        var mid = real.filter(breakIf);
        if (mid.length === 1) {
          var at = body.indexOf(mid[0]);
          var before = body.slice(0, at), after = body.slice(at + 1);
          if (!findBreak(before) && !findBreak(after)) {
            return { k: "block", line: line, body: lower(before, ch, true).concat([{
              k: "while", cond: { k: "un", op: "!", a: breakIf(mid[0]), line: line }, line: line,
              body: lower(after, ch, true).concat(lower(before, ch, true)) }]) };
          }
        }
        var anyBreak = findBreak(body);
        if (anyBreak) { throw oops("cm_break", anyBreak.line); }
        return { k: "while", cond: { k: "bool", v: true, line: line },
                 body: lower(body, ch, true), line: line };
      }
      function findBreak(list) {
        for (var i = 0; i < list.length; i++) {
          var st = list[i];
          if (st.k === "break") { return st; }
          if (st.k === "if") {
            var got = findBreak(st.then) || findBreak(st.orelse);
            if (got) { return got; }
          }
          if (st.k === "try") { var inTry = findBreak(st.body); if (inTry) { return inTry; } }
        }
        return null;
      }
      function isNegative(e) {
        e = stripParens(e);
        return (e.k === "un" && e.op === "-") || (e.k === "num" && /^-/.test(e.v));
      }
      // n + 1 - 1 is n: a range's end, and a C for's `<`, both say one past
      // where pseudocode's For stops, and the + 1 is usually written there.
      function offBy(e, by) {
        e = stripParens(e);
        if (e.k === "num" && !e.real) {
          return { k: "num", v: String(parseInt(e.v, 10) + by), line: e.line };
        }
        if (e.k === "un" && e.op === "-" && e.a.k === "num" && !e.a.real) {
          return { k: "num", v: String(-parseInt(e.a.v, 10) + by), line: e.line };
        }
        if (e.k === "bin" && (e.op === "+" || e.op === "-")) {
          var r = stripParens(e.b);
          if (r.k === "num" && !r.real) {
            var k = (e.op === "+" ? 1 : -1) * parseInt(r.v, 10) + by;
            if (k === 0) { return e.a; }
            var l = stripParens(e.a);
            if (l.k === "num" && !l.real) { return { k: "num", v: String(parseInt(l.v, 10) + k), line: e.line }; }
            return { k: "bin", op: k > 0 ? "+" : "-", a: e.a,
                     b: { k: "num", v: String(Math.abs(k)) }, line: e.line };
          }
        }
        if (!by) { return e; }
        return { k: "bin", op: by > 0 ? "+" : "-", a: e, b: { k: "num", v: String(Math.abs(by)) }, line: e.line };
      }

      // A C for: a counting one is a For; anything else is the While it is.
      function cFor(st, ch) {
        var line = st.line;
        var initSets = [], counter = null, from = null, declared = false;
        st.init.forEach(function (one) {
          if (one.k === "decl") {
            one.names.forEach(function (d) {
              initSets.push({ name: d.name, value: d.value, type: one.type });
            });
            declared = true;
          } else if (one.k === "expr" && one.e.k === "assignx" && one.e.op === "=" &&
                     one.e.target.k === "name") {
            initSets.push({ name: one.e.target.v, value: one.e.value });
          } else {
            initSets.push({ other: one });
          }
        });
        if (initSets.length === 1 && !initSets[0].other && initSets[0].value) {
          counter = initSets[0].name;
          from = initSets[0].value;
        }
        var step = st.step.length === 1 ? stepOf(st.step[0].e, counter) : null;
        var test = st.cond ? stripParens(st.cond) : null;
        var to = null;
        if (counter && step !== null && test && test.k === "bin") {
          var op = test.op, left = stripParens(test.a), right = test.b;
          if (left.k !== "name" || left.v !== counter) {
            var flip = { "<": ">", ">": "<", "<=": ">=", ">=": "<=" };
            if (stripParens(right).k === "name" && stripParens(right).v === counter && flip[op]) {
              right = test.a; op = flip[op];
            } else { op = null; }
          }
          if (op && !mentions(right, counter) && !assigns(st.body, counter)) {
            var up = step.up;
            if (up && op === "<") { to = offBy(right, -1); }
            else if (up && op === "<=") { to = right; }
            else if (!up && op === ">") { to = offBy(right, 1); }
            else if (!up && op === ">=") { to = right; }
          }
        }
        if (to) {
          // declared by the for itself, it is the For's own and needs no
          // Declare; declared further up, it keeps the one it has
          var kind = kindOfType(initSets[0].type) || "int";
          ch.meet(counter, { kind: kind, set: true, loop: declared });
          var by = step.by === "1" && step.up ? null
                 : step.up ? { k: "num", v: step.by } : { k: "un", op: "-", a: { k: "num", v: step.by } };
          if (step.expr) { by = step.up ? step.expr : { k: "un", op: "-", a: { k: "paren", e: step.expr } }; }
          return [{ k: "for", v: counter, from: from, to: to, by: by,
                    body: lower(st.body, ch, true), line: line }];
        }
        // the While it is
        var out = [];
        st.init.forEach(function (one) { lowerOne(one, ch, out, false); });
        if (!st.cond && !st.step.length) {       // for (;;), the way C says forever
          var forever = foreverLoop(st.body, ch, line);
          return out.concat(forever.k === "block" ? forever.body : [forever]);
        }
        var body = lower(st.body, ch, true);
        st.step.forEach(function (one) { lowerOne(one, ch, body, true); });
        if (!st.cond) {
          if (findBreak(st.body)) { throw oops("cm_break", findBreak(st.body).line); }
          out.push({ k: "while", cond: { k: "bool", v: true }, body: body, line: line });
        } else {
          out.push({ k: "while", cond: st.cond, body: body, line: line });
        }
        return out;
      }
      // i++, i--, i += 2, i = i + 2 -- which way, and by how much
      function stepOf(e, counter) {
        e = stripParens(e);
        if (!counter) { return null; }
        if (e.k === "incdec" && e.target.k === "name" && e.target.v === counter) {
          return { up: e.op === "++", by: "1" };
        }
        if (e.k === "assignx" && e.target.k === "name" && e.target.v === counter) {
          var v = stripParens(e.value);
          if (e.op === "+=" || e.op === "-=") {
            if (v.k === "num") { return { up: e.op === "+=", by: v.v }; }
            if (!mentions(v, counter)) { return { up: e.op === "+=", by: null, expr: v }; }
          }
          if (e.op === "=" && v.k === "bin" && (v.op === "+" || v.op === "-") &&
              stripParens(v.a).k === "name" && stripParens(v.a).v === counter) {
            var b = stripParens(v.b);
            if (b.k === "num") { return { up: v.op === "+", by: b.v }; }
          }
        }
        return null;
      }
      function mentions(e, name) {
        if (!e || typeof e !== "object") { return false; }
        if (e.k === "name") { return e.v === name; }
        for (var key in e) {
          if (key === "line") { continue; }
          var v = e[key];
          if (Array.isArray(v)) { if (v.some(function (x) { return mentions(x, name); })) { return true; } }
          else if (v && typeof v === "object" && mentions(v, name)) { return true; }
        }
        return false;
      }
      function assigns(list, name) {
        return list.some(function (st) {
          if (!st || typeof st !== "object") { return false; }
          if ((st.k === "assign" || st.k === "aug") && st.target.k === "name" && st.target.v === name) { return true; }
          if (st.k === "expr") {
            var e = st.e;
            if ((e.k === "assignx" || e.k === "incdec") && e.target.k === "name" && e.target.v === name) { return true; }
            if (e.k === "bin" && e.op === ">>" && mentions(e, name)) { return true; }
          }
          return ["then", "orelse", "body"].some(function (key) {
            return Array.isArray(st[key]) && assigns(st[key], name);
          }) || (st.cases || []).some(function (c) { return assigns(c.body, name); });
        });
      }

      // switch, with what falls through carried into the case it falls from
      function lowerSwitch(st, ch) {
        var cases = st.cases, out = [];
        cases.forEach(function (c, i) {
          var body = [];
          var from = i, stopped = false;
          while (from < cases.length && !stopped) {
            var list = cases[from].body;
            for (var j = 0; j < list.length; j++) {
              var s = list[j];
              if (s.k === "break") { stopped = true; break; }
              body.push(s);
              if (s.k === "return" || s.k === "exit") { stopped = true; break; }
            }
            if (st.noFall) { break; }
            from++;
          }
          var lowered = lower(body, ch, false, true);
          var stray = findBreak(lowered);
          if (stray) { throw oops("cm_break", stray.line); }
          if (c.isDefault) { out.push({ label: null, body: lowered, line: c.line }); }
          c.labels.forEach(function (label) {
            out.push({ label: label, body: lowered, line: c.line });
          });
        });
        // the default goes last, where Select Case keeps it
        var plain = out.filter(function (c) { return c.label; });
        var other = out.filter(function (c) { return !c.label; });
        return { k: "select", subject: st.subject, cases: plain.concat(other.slice(0, 1)), line: st.line };
      }

      // ---- one assignment: a Set, an Input, or a decision ----------------
      function assign(target, value, ch, out, line, fromDecl) {
        target = stripParens(target);
        if (target.k === "tuple") { return assignMany(target, value, ch, out, line); }
        if (target.k === "list") { throw oops("cm_other", line, { bit: "[a, b] = …" }); }
        if (target.k !== "name") {
          note(line, target.k === "index" ? "[ ]" : ".");
          out.push({ k: "set", target: target, value: value, line: line });
          return;
        }
        var name = target.v;
        var v = stripParens(value);
        var asked = inputOf(v);
        if (asked) {
          ch.meet(name, { kind: asked.kind, set: true });
          if (asked.prompt) { out.push({ k: "display", parts: [asked.prompt], line: line }); }
          askFor(name, out, line);
          return;
        }
        if (v.k === "cond") {
          ch.meet(name, { set: true });
          out.push({ k: "if", cond: v.test, line: line,
                     then: lowered(function (o) { assign(target, v.a, ch, o, line); }),
                     orelse: lowered(function (o) { assign(target, v.b, ch, o, line); }) });
          return;
        }
        if (v.k === "assignx") {                     // a = b = 0
          assign(v.target, v.value, ch, out, line);
          assign(target, v.target, ch, out, line);
          return;
        }
        noInputIn(v, line);
        var met = ch.meet(name, { set: true });
        met.values = (met.values || []).concat([v]);
        out.push({ k: "set", target: target, value: value, line: line, decl: fromDecl });
      }
      // An Input.  The question the page's own writer puts to a bare Input
      // -- "Enter score: ", said just before it -- is the one pseudocode's
      // Input already asks by itself, so code read back from what the page
      // wrote comes back as the Input it was, not a Display and an Input.
      function askFor(name, out, line) {
        var last = out[out.length - 1];
        if (last && last.k === "display" && last.parts.length === 1 &&
            last.parts[0].k === "str" && last.parts[0].v === say("code_ask", { name: name })) {
          out.pop();
        }
        out.push({ k: "input", name: name, line: line });
      }
      function lowered(fill) { var o = []; fill(o); return o; }
      // a, b = b, a -- the right side is worked out before any of it is put
      // away, so where a name on the left is read on the right it goes
      // through a spare name first.
      function assignMany(target, value, ch, out, line) {
        var v = stripParens(value);
        if (v.k !== "tuple" || v.items.length !== target.items.length) {
          throw oops("cm_other", line, { bit: "a, b = …" });
        }
        // Put away in turn.  Before a name is written over, if what is still
        // to be put away reads it, it is kept in a spare first and read from
        // there -- so a, b = b, a is the three-line swap everybody knows.
        var values = v.items.slice(), spare = 0;
        target.items.forEach(function (t, i) {
          if (t.k !== "name") { throw oops("cm_other", line, { bit: "a, b = …" }); }
          var readLater = values.slice(i + 1).some(function (x) { return mentions(x, t.v); });
          if (readLater) {
            var tmp = { k: "name", v: "temp" + (spare++ ? spare : "") };
            assign(tmp, { k: "name", v: t.v }, ch, out, line);
            for (var j = i + 1; j < values.length; j++) { values[j] = swapName(values[j], t.v, tmp); }
          }
          assign(t, values[i], ch, out, line);
        });
      }
      function swapName(e, name, to) {
        if (!e || typeof e !== "object") { return e; }
        if (e.k === "name" && e.v === name) { return to; }
        if (Array.isArray(e)) { return e.map(function (x) { return swapName(x, name, to); }); }
        var o = {};
        for (var key in e) { o[key] = swapName(e[key], name, to); }
        return o;
      }

      // ---- asking for something ----------------------------------------
      // What reads what is typed, however many conversions it is wrapped
      // in: int(input("Age? ")), Integer.parseInt(sc.nextLine().trim()),
      // double.Parse(Console.ReadLine()), Number(prompt("Price")).
      function inputOf(e) {
        e = stripParens(e);
        var kind = null, prompt = null, seen = false;
        function wrap(k) { if (!kind) { kind = k; } }
        for (var guard = 0; guard < 12 && e; guard++) {
          if (e.k === "bin" && e.op === "==" && stripParens(e.b).k === "str" &&
              /^true$/i.test(stripParens(e.b).v) && inputOf(e.a)) {
            return { kind: "bool", prompt: inputOf(e.a).prompt };
          }
          if (e.k === "un" && e.op === "+" && js) { wrap("real"); e = stripParens(e.a); continue; }
          if (e.k === "cast") { wrap(kindOfType(e.type)); e = stripParens(e.e); continue; }
          if (e.k !== "call") { return null; }
          var p = bare(pathOf(e.fn) || (e.fn.k === "member" ? "." + e.fn.name : ""));
          var dot = e.fn.k === "member" ? e.fn.name : null;
          var obj = e.fn.k === "member" ? pathOf(e.fn.obj) : null;
          // the conversions around it
          if (/^(int|Integer\.parseInt|int\.Parse|Int32\.Parse|Convert\.ToInt32|Convert\.ToInt64|parseInt|stoi|Math\.trunc|long\.Parse|Long\.parseLong)$/.test(p)) {
            wrap("int"); e = stripParens(e.args[0]); continue;
          }
          if (/^(float|Double\.parseDouble|double\.Parse|Double\.Parse|Convert\.ToDouble|decimal\.Parse|Convert\.ToDecimal|parseFloat|Number|stod|stof|Float\.parseFloat|float\.Parse)$/.test(p)) {
            wrap("real"); e = stripParens(e.args[0]); continue;
          }
          if (/^(bool|Boolean\.parseBoolean|bool\.Parse|Convert\.ToBoolean)$/.test(p)) {
            wrap("bool"); e = stripParens(e.args[0]); continue;
          }
          if (/^(str|String)$/.test(p)) { e = stripParens(e.args[0]); continue; }
          if (dot && /^(strip|trim|Trim|lower|upper|toLowerCase|toUpperCase|ToLower|ToUpper|rstrip|lstrip|trimEnd|TrimEnd)$/.test(dot) && !e.args.length) {
            e = stripParens(e.fn.obj); continue;
          }
          // and the reading itself
          if (py && p === "input") { seen = true; prompt = e.args[0] || null; break; }
          if (js && /^(prompt|ask|readlineSync\.question|question)$/.test(p) ||
              (js && dot === "question" && devices[obj])) {
            seen = true; prompt = e.args[0] || null; break;
          }
          if (cs && /^Console\.ReadLine$/.test(p)) { seen = true; break; }
          if (cpp && /^ask(Whole|Real|Text|Flag)$/.test(p)) {
            wrap({ Whole: "int", Real: "real", Text: "text", Flag: "bool" }[p.slice(3)]);
            seen = true; break;
          }
          if (dot && /^next(Int|Double|Line|Float|Long|Boolean)?$|^readLine$/.test(dot) &&
              (devices[obj] === "keys" || /^(sc|scan|scanner|input|in|keyboard|reader|br|kb)$/i.test(obj || ""))) {
            var how = /Int|Long/.test(dot) ? "int" : /Double|Float/.test(dot) ? "real"
                    : /Boolean/.test(dot) ? "bool" : null;
            if (how) { wrap(how); }
            seen = true; break;
          }
          return null;
        }
        if (!seen) { return null; }
        return { kind: kind || "text", prompt: prompt && stripParens(prompt).k === "str" &&
                 !stripParens(prompt).v ? null : prompt };
      }
      function noInputIn(e, line) {
        if (!e || typeof e !== "object") { return; }
        if (e.k === "call" && inputOf(e)) { throw oops("cm_input_where", line); }
        for (var key in e) {
          if (key === "line") { continue; }
          var v = e[key];
          if (Array.isArray(v)) { v.forEach(function (x) { noInputIn(x, line); }); }
          else if (v && typeof v === "object") { noInputIn(v, line); }
        }
      }

      // ---- a statement that is only an expression -------------------------
      function statementExpr(e, ch, out, line) {
        e = stripParens(e);
        if (e.k === "assignx") {
          if (e.op === "=") { assign(e.target, e.value, ch, out, line); return; }
          var op = e.op.slice(0, -1);
          assign(e.target, { k: "bin", op: op, a: e.target, b: { k: "paren", e: e.value },
                             line: line, cInt: true }, ch, out, line);
          return;
        }
        if (e.k === "incdec") {
          assign(e.target, { k: "bin", op: e.op === "++" ? "+" : "-", a: e.target,
                             b: { k: "num", v: "1" }, line: line }, ch, out, line);
          return;
        }
        if (e.k === "cond") {
          out.push({ k: "if", cond: e.test, line: line,
                     then: lowered(function (o) { statementExpr(e.a, ch, o, line); }),
                     orelse: lowered(function (o) { statementExpr(e.b, ch, o, line); }) });
          return;
        }
        // cout << a << b, cin >> a >> b
        if (e.k === "bin" && (e.op === "<<" || e.op === ">>")) {
          var chain = [], at = e;
          while (at.k === "bin" && at.op === e.op) { chain.unshift(at.b); at = stripParens(at.a); }
          var head = bare(pathOf(at));
          if (e.op === "<<" && /^(cout|cerr)$/.test(head)) { out.push.apply(out, streamOut(chain, line)); return; }
          if (e.op === ">>" && head === "cin") {
            chain.forEach(function (t) {
              t = stripParens(t);
              if (t.k !== "name") { throw oops("cm_input_where", line); }
              ch.meet(t.v, { set: true });
              askFor(t.v, out, line);
            });
            return;
          }
        }
        // A value worked out and thrown away -- a docstring, `x;` -- does
        // nothing, and is drawn as nothing.
        if (e.k !== "call") { return; }
        var p = bare(pathOf(e.fn) || "");
        var dot = e.fn.k === "member" ? e.fn.name : null;
        var obj = e.fn.k === "member" ? pathOf(e.fn.obj) : null;
        // printing
        var said = displayOf(e, p, dot);
        if (said) { out.push.apply(out, said.map(function (parts) { return { k: "display", parts: parts, line: line }; })); return; }
        // getline(cin, s)
        if (cpp && p === "getline" && e.args.length >= 2 && bare(pathOf(e.args[0])) === "cin") {
          var into = stripParens(e.args[1]);
          ch.meet(into.v, { kind: "text", set: true });
          askFor(into.v, out, line);
          return;
        }
        // stopping
        if (/^(exit|quit|sys\.exit|System\.exit|Environment\.Exit|process\.exit|abort|os\._exit)$/.test(p) ||
            (js && p === "stop" && !userFn("stop"))) {
          out.push({ k: "stop", line: line });
          return;
        }
        // waiting
        var nap = waitOf(e, p);
        if (nap) { out.push(Object.assign(nap, { k: "wait", line: line })); return; }
        // what only the language needed doing
        if (/^(srand|random\.seed|Console\.ReadKey|Console\.Clear|system|cin\.ignore|cin\.get|cin\.clear|Console\.Read|setlocale|ios_base\.sync_with_stdio|ios\.sync_with_stdio|cin\.tie|cout\.tie|console\.clear)$/.test(p) ||
            (dot && devices[obj] && /^(close|nextLine)$/.test(dot)) ||
            (p === "Console.ReadLine") || (py && p === "input") || (js && /^(prompt|ask)$/.test(p))) {
          return;
        }
        if (inputOf(e)) { return; }
        // a module of the program's own
        var mine = e.fn.k === "name" ? userFn(e.fn.v) : null;
        if (mine) { out.push({ k: "call", e: e, line: line }); return; }
        note(line, (dot || p || "…") + "()");
        out.push({ k: "call", e: e, line: line });
      }

      // ---- waiting -----------------------------------------------------
      function waitOf(e, p) {
        var a = e.args[0];
        if (/^(time\.sleep|sleep|Sleep)$/.test(p) && a && py) { return { e: a, unit: "s" }; }
        if (/^(Thread\.sleep|Thread\.Sleep|Threading\.Thread\.Sleep|System\.Threading\.Thread\.Sleep|wait|Sleep|usleep)$/.test(p) && a) {
          if (p === "usleep") { return { e: { k: "bin", op: "/", a: a, b: { k: "num", v: "1000" } }, unit: "ms" }; }
          return { e: a, unit: cpp && p === "Sleep" ? "ms" : (cpp && p === "sleep" ? "s" : "ms") };
        }
        if (p === "nap" && cpp && a) { return { e: a, unit: "s" }; }
        if (/sleep_for$/.test(p) && a && a.k === "call") {
          var unit = bare(pathOf(a.fn) || "");
          if (/milliseconds$/.test(unit)) { return { e: a.args[0], unit: "ms" }; }
          if (/seconds$/.test(unit)) { return { e: a.args[0], unit: "s" }; }
        }
        return null;
      }

      // ---- printing ----------------------------------------------------
      // What a print says, as the pieces a Display lists -- and, where the
      // words hold a line break, as several Displays.
      function displayOf(e, p, dot) {
        var args = e.args.filter(function (a) { return a.k !== "kw"; });
        if (py && p === "print") {
          var sep = " ";
          e.args.forEach(function (a) {
            if (a.k === "kw" && a.name === "sep" && stripParens(a.value).k === "str") { sep = stripParens(a.value).v; }
          });
          var parts = [];
          args.forEach(function (a, i) {
            if (i && sep) { parts.push({ k: "str", v: sep }); }
            parts.push.apply(parts, piecesOf(a));
          });
          return lines(parts);
        }
        var said = /^(System\.out\.println|System\.out\.print|Console\.WriteLine|Console\.Write|console\.log|console\.info|console\.error|console\.warn|process\.stdout\.write|puts|System\.err\.println|Debug\.Log|document\.write|print|println|alert)$/.test(p);
        var formatted = /^(System\.out\.printf|System\.out\.format|printf|String\.format)$/.test(p);
        if (said && args.length > 1 && (cs || js) && /^Console|console/.test(p)) {
          var f = stripParens(args[0]);
          if (f.k === "str" && cs && /\{\d/.test(f.v)) { return lines(composite(f.v, args.slice(1), e.line)); }
          if (js) {
            var bits = [];
            args.forEach(function (a, i) { if (i) { bits.push({ k: "str", v: " " }); } bits.push.apply(bits, piecesOf(a)); });
            return lines(bits);
          }
        }
        if (said) {
          if (!args.length) { return [[{ k: "str", v: "" }]]; }
          return lines(piecesOf(args[0]));
        }
        if (formatted && args.length) {
          var fmt = stripParens(args[0]);
          if (fmt.k === "str") { return lines(printfPieces(fmt.v, args.slice(1), e.line)); }
        }
        return null;
      }
      function streamOut(chain, line) {
        var parts = [];
        chain.forEach(function (one) {
          var p = bare(pathOf(stripParens(one)) || "");
          if (p === "endl") { parts.push({ k: "str", v: "\n" }); return; }
          if (/^(fixed|setprecision|setw|left|right|showpoint|boolalpha)$/.test(p) ||
              (stripParens(one).k === "call" && /^(setprecision|setw|setfill)$/.test(bare(pathOf(stripParens(one).fn) || "")))) {
            return;
          }
          parts.push.apply(parts, piecesOf(one));
        });
        var groups = lines(parts, true);
        return groups.map(function (g) { return { k: "display", parts: g, line: line }; });
      }
      // Cut a Display at every line break in its words.  A print that ends
      // without one -- cout with no endl, System.out.print -- still ends
      // the line in pseudocode, which has no other way of saying it.
      function lines(parts, trailingBreak) {
        var out = [[]];
        parts.forEach(function (p) {
          if (p.k === "str" && p.v.indexOf("\n") >= 0) {
            var bits = p.v.split("\n");
            bits.forEach(function (b, i) {
              if (i) { out.push([]); }
              if (b) { out[out.length - 1].push({ k: "str", v: b }); }
            });
          } else { out[out.length - 1].push(p); }
        });
        if (out.length > 1 && !out[out.length - 1].length) { out.pop(); }
        return out.map(function (g) {
          var merged = [];
          g.forEach(function (p) {
            var last = merged[merged.length - 1];
            if (p.k === "str" && last && last.k === "str") { merged[merged.length - 1] = { k: "str", v: last.v + p.v }; }
            else { merged.push(p); }
          });
          return merged.length ? merged : [{ k: "str", v: "" }];
        });
      }
      // One printed thing, as pieces: "Total: " + total is two of them, an
      // f-string is as many as it has, and str(x) is x.
      function piecesOf(a) {
        a = stripParens(a);
        if (a.k === "fstr") {
          var out = [];
          a.parts.forEach(function (p) {
            if (typeof p === "string") { if (p) { out.push({ k: "str", v: p }); } }
            else { out.push(shown(shownPlain(p.e), p.spec)); }
          });
          return out;
        }
        if (a.k === "call") {
          var p = bare(pathOf(a.fn) || "");
          if (/^(str|String|String\.valueOf|to_string|Integer\.toString|Double\.toString)$/.test(p) && a.args.length === 1) {
            return piecesOf(a.args[0]);
          }
          if (a.fn.k === "member" && /^(toString|ToString)$/.test(a.fn.name) && !a.args.length) {
            return piecesOf(a.fn.obj);
          }
          if (/^(String\.format|string\.Format)$/.test(p) && a.args.length && stripParens(a.args[0]).k === "str") {
            var f = stripParens(a.args[0]).v;
            return p === "string.Format" ? composite(f, a.args.slice(1), a.line)
                                         : printfPieces(f, a.args.slice(1), a.line);
          }
          if (a.fn.k === "member" && a.fn.name === "format" && py && stripParens(a.fn.obj).k === "str") {
            return pyFormat(stripParens(a.fn.obj).v, a.args, a.line);
          }
        }
        if (a.k === "bin" && a.op === "%" && py && stripParens(a.a).k === "str") {
          var r = stripParens(a.b);
          return printfPieces(stripParens(a.a).v, r.k === "tuple" ? r.items : [r], a.line);
        }
        if (a.k === "bin" && a.op === "+") {
          // left to right, the way the language adds them: numbers before
          // the first piece of text are one sum, everything after is text
          var chain = [], at = a;
          while (at.k === "bin" && at.op === "+") { chain.unshift(at.b); at = stripParens(at.a); }
          chain.unshift(at);
          var firstText = -1;
          for (var i = 0; i < chain.length; i++) {
            if (kindNow(chain[i]) === "text") { firstText = i; break; }
          }
          if (firstText >= 0) {
            var out2 = [];
            if (firstText > 1) {
              var sum = chain[0];
              for (var j = 1; j < firstText; j++) { sum = { k: "bin", op: "+", a: sum, b: chain[j] }; }
              out2.push(sum);
            } else if (firstText === 1) { out2.push(chain[0]); }
            chain.slice(firstText).forEach(function (one) { out2.push.apply(out2, piecesOf(one)); });
            return out2;
          }
        }
        return [shownPlain(a)];
      }
      function shownPlain(e) {
        var s = stripParens(e);
        if (s.k === "call") {
          var p = bare(pathOf(s.fn) || "");
          // format(x, ".2f"), x.toFixed(2), x.ToString("F2"), money(x)
          if (p === "format" && s.args.length === 2 && stripParens(s.args[1]).k === "str") {
            return shown(s.args[0], stripParens(s.args[1]).v);
          }
          if (s.fn.k === "member" && s.fn.name === "toFixed" && s.args.length === 1) {
            return shown(s.fn.obj, "." + (stripParens(s.args[0]).v || "2") + "f");
          }
          if (s.fn.k === "member" && s.fn.name === "ToString" && s.args.length === 1 &&
              stripParens(s.args[0]).k === "str") {
            return shown(s.fn.obj, stripParens(s.args[0]).v);
          }
          if (cpp && p === "money") { return shown(s.args[0], ".2f"); }
        }
        return e;
      }
      // x shown to some number of places: money after a dollar sign is
      // already shown that way by the runner, anything else is rounded.
      function shown(e, spec) {
        if (e && e.k === "places" && !spec) { return e; }
        var m =/\.(\d+)[fF%]?$|^[FfNn](\d+)$|^0\.(0+)$/.exec(String(spec || "").replace(/^[<>^]?\d*,?/, ""));
        if (!m) { return e; }
        var places = parseInt(m[1] || m[2] || String((m[3] || "").length), 10);
        return { k: "places", e: e, n: places };
      }
      function composite(f, args, line) {
        var out = [], re = /\{(\d+)(?:,[^}:]*)?(?::([^}]*))?\}/g, at = 0, m;
        f = f.replace(/\{\{/g, "\u0001").replace(/\}\}/g, "\u0002");
        while ((m = re.exec(f))) {
          if (m.index > at) { out.push({ k: "str", v: f.slice(at, m.index) }); }
          var arg = args[parseInt(m[1], 10)];
          if (!arg) { throw oops("cm_other", line, { bit: m[0] }); }
          out.push(shown(arg, m[2]));
          at = re.lastIndex;
        }
        if (at < f.length) { out.push({ k: "str", v: f.slice(at) }); }
        return out.map(function (p) {
          return p.k === "str" ? { k: "str", v: p.v.replace(/\u0001/g, "{").replace(/\u0002/g, "}") } : p;
        });
      }
      function pyFormat(f, args, line) {
        var out = [], re = /\{(\d*)(?::([^}]*))?\}/g, at = 0, m, auto = 0;
        f = f.replace(/\{\{/g, "\u0001").replace(/\}\}/g, "\u0002");
        while ((m = re.exec(f))) {
          if (m.index > at) { out.push({ k: "str", v: f.slice(at, m.index) }); }
          var arg = args[m[1] === "" ? auto++ : parseInt(m[1], 10)];
          if (!arg) { throw oops("cm_other", line, { bit: m[0] }); }
          out.push(shown(arg, m[2]));
          at = re.lastIndex;
        }
        if (at < f.length) { out.push({ k: "str", v: f.slice(at) }); }
        return out.map(function (p) {
          return p.k === "str" ? { k: "str", v: p.v.replace(/\u0001/g, "{").replace(/\u0002/g, "}") } : p;
        });
      }
      function printfPieces(f, args, line) {
        var out = [], re = /%([-+ 0#]*\d*(?:\.(\d+))?)(?:l|ll|h)?([dioufFeEgGsScbxX%n])/g, at = 0, m, k = 0;
        while ((m = re.exec(f))) {
          if (m.index > at) { out.push({ k: "str", v: f.slice(at, m.index) }); }
          at = re.lastIndex;
          if (m[3] === "%") { out.push({ k: "str", v: "%" }); continue; }
          if (m[3] === "n") { out.push({ k: "str", v: "\n" }); continue; }
          var arg = args[k++];
          if (!arg) { throw oops("cm_other", line, { bit: m[0] }); }
          out.push(m[2] !== undefined && /[fFeEgG]/.test(m[3]) ? shown(arg, "." + m[2] + "f") : arg);
        }
        if (at < f.length) { out.push({ k: "str", v: f.slice(at) }); }
        return out;
      }

      // ---- what kind of thing an expression is, as far as can be told --
      var kindChart = null;
      function kindNow(e) { return kindOf(e, kindChart); }
      function kindOf(e, ch) {
        e = stripParens(e);
        if (!e) { return null; }
        switch (e.k) {
          case "num": return e.real ? "real" : "int";
          case "str": case "fstr": return "text";
          case "bool": return "bool";
          case "places": return "real";
          case "name": {
            var one = ch && (ch.names[e.v] || (ch.params && ch.params[e.v])) || globalChart.names[e.v];
            if (!one) { return null; }
            if (one.kind) { return one.kind; }
            // still being read: what it was declared as, or first given
            return kindOfType(one.type) || (one.kinds && one.kinds[0]) || null;
          }
          case "un": return e.op === "!" ? "bool" : kindOf(e.a, ch);
          case "cast": return kindOfType(e.type) || kindOf(e.e, ch);
          case "cond": return mergeKinds(kindOf(e.a, ch), kindOf(e.b, ch));
          case "bin": {
            var a = kindOf(e.a, ch), b = kindOf(e.b, ch);
            if (/^(&&|\|\||==|!=|<|>|<=|>=|in|not in)$/.test(e.op)) { return "bool"; }
            if (e.op === "+" && (a === "text" || b === "text")) { return "text"; }
            if (e.op === "*" && py && (a === "text" || b === "text")) { return "text"; }
            if (e.op === "/") { return py || js ? "real" : (a === "int" && b === "int" ? "int" : a && b ? "real" : null); }
            if (e.op === "//") { return a === "int" && b === "int" ? "int" : a && b ? "real" : null; }
            if (a === "real" || b === "real") { return "real"; }
            if (a === "int" && b === "int") { return "int"; }
            return a === "mixed" || b === "mixed" ? "mixed" : null;
          }
          case "call": {
            var asked = inputOf(e);
            if (asked) { return asked.kind; }
            var mine = e.fn.k === "name" ? userFn(e.fn.v) : null;
            if (mine) { return mine.kind || kindOfType(mine.rtype) || null; }
            var call = builtIn(e);
            return call ? call.kind : null;
          }
          case "member": return /^(length|Length|size)$/.test(e.name) ? "int" : null;
        }
        return null;
      }

      // ---- the functions everybody has --------------------------------
      // What each language calls square root, length, random and the rest,
      // and what pseudocode calls them.  `kind` is what comes back.
      function builtIn(e) {
        var p = bare(pathOf(e.fn) || "");
        var a = e.args.filter(function (x) { return x.k !== "kw"; });
        var dot = e.fn.k === "member" ? e.fn.name : null;
        var self = e.fn.k === "member" ? e.fn.obj : null;
        var lib = /^(math|Math|std|cmath)?\.?/;
        var name = p.replace(lib, "");
        function one(fn, kind, args) { return { fn: fn, args: args || a, kind: kind }; }
        if (/^(sqrt|Sqrt|cbrt)$/.test(name) && p !== "") { return one("sqrt", "real"); }
        if (/^(abs|Abs|fabs)$/.test(name)) { return one("abs", a[0] ? kindOf(a[0], kindChart) : "real"); }
        if (/^(floor|Floor)$/.test(name)) { return one("floor", "int"); }
        if (/^(ceil|Ceiling|ceiling)$/.test(name)) { return one("ceiling", "int"); }
        if (/^(round|Round|lround|rint)$/.test(name)) {
          if (a.length === 2) { return { fn: "round places", args: a, kind: "real" }; }
          return one("round", "int");
        }
        if (/^(pow|Pow)$/.test(name) && a.length === 2) { return { fn: "^", args: a, kind: "real" }; }
        if (/^(min|max|Min|Max|fmin|fmax)$/.test(name)) {
          var k = null;
          a.forEach(function (x) { k = mergeKinds(k, kindOf(x, kindChart)); });
          return one(name.replace(/^f/, "").toLowerCase(), k);
        }
        if (/^(int|Math\.trunc|trunc|Integer\.parseInt|int\.Parse|Int32\.Parse|Convert\.ToInt32|parseInt|stoi|long\.Parse)$/.test(p) && a.length) {
          return one("int", "int", [a[0]]);
        }
        if (/^(float|Double\.parseDouble|double\.Parse|Convert\.ToDouble|parseFloat|Number|stod|stof)$/.test(p) && a.length === 1) {
          return { fn: "", args: a, kind: "real" };
        }
        if (/^(str|String|String\.valueOf|to_string|Integer\.toString|Double\.toString|Convert\.ToString)$/.test(p) && a.length === 1) {
          return { fn: "", args: a, kind: "text" };
        }
        if (dot && /^(toString|ToString)$/.test(dot) && !a.length) { return { fn: "", args: [self], kind: "text" }; }
        if (p === "len" && a.length === 1) { return one("length", "int"); }
        if (dot && /^(length|size|Length|Count)$/.test(dot) && !a.length) { return one("length", "int", [self]); }
        if (dot && /^(upper|toUpperCase|ToUpper)$/.test(dot) && !a.length) { return one("toUpper", "text", [self]); }
        if (dot && /^(lower|toLowerCase|ToLower)$/.test(dot) && !a.length) { return one("toLower", "text", [self]); }
        if (/^(toUpper|toLower)$/.test(p) && a.length === 1) { return one(p, "text"); }
        if (dot && /^(strip|trim|Trim)$/.test(dot) && !a.length) { return { fn: "", args: [self], kind: "text" }; }
        if (dot && /^(equals|Equals|equalsIgnoreCase)$/.test(dot) && a.length === 1) {
          return { fn: "==", args: [self, a[0]], kind: "bool" };
        }
        if (dot && /^(compareTo|CompareTo|compare)$/.test(dot) && a.length === 1) {
          return { fn: "compare", args: [self, a[0]], kind: "int" };
        }
        if (/^(string\.Compare|String\.Compare|strcmp|string\.CompareOrdinal)$/.test(p) && a.length === 2) {
          return { fn: "compare", args: [a[0], a[1]], kind: "int" };
        }
        if (/^(fmod|math\.fmod|Math\.IEEERemainder)$/.test(p) && a.length === 2) {
          return { fn: "%", args: a, kind: "real" };
        }
        // random
        if (/^random\.randint$/.test(p) && a.length === 2) { return one("random", "int"); }
        if (/^random\.randrange$/.test(p) && a.length) {
          return a.length === 1 ? one("random", "int", [{ k: "num", v: "0" }, offBy(a[0], -1)])
                                : one("random", "int", [a[0], offBy(a[1], -1)]);
        }
        if (/^(random\.random|Math\.random)$/.test(p) && !a.length) { return one("random", "real", []); }
        if (dot === "NextDouble" && !a.length) { return one("random", "real", []); }
        if (dot === "Next" && self && devices[pathOf(self)] === "dice" || dot === "Next" && a.length) {
          if (a.length === 2) { return one("random", "int", [a[0], offBy(a[1], -1)]); }
          if (a.length === 1) { return one("random", "int", [{ k: "num", v: "0" }, offBy(a[0], -1)]); }
        }
        if (dot === "nextInt" && a.length === 1) {
          return one("random", "int", [{ k: "num", v: "0" }, offBy(a[0], -1)]);
        }
        if (/^(rand|random)$/.test(p) && !a.length) { return one("rand", "int", []); }
        return null;
      }
      // (int) (Math.random() * N) + A, Math.floor(Math.random() * N) + A,
      // rand() % N + A: random(A, A + N - 1), which is what they all mean.
      function randomRange(e) {
        e = stripParens(e);
        var add = null, core = e;
        if (e.k === "bin" && e.op === "+") { core = stripParens(e.a); add = e.b; }
        var n = null;
        if (core.k === "cast" && /int|long/.test(core.type) || core.k === "call" &&
            /^(Math\.floor|floor|Math\.trunc|int)$/.test(bare(pathOf(core.fn) || ""))) {
          var inner = stripParens(core.k === "cast" ? core.e : core.args[0]);
          if (inner && inner.k === "bin" && inner.op === "*") {
            var l = stripParens(inner.a), r = stripParens(inner.b);
            if (isRandomCall(l)) { n = r; } else if (isRandomCall(r)) { n = l; }
          }
        }
        if (core.k === "bin" && core.op === "%" && isRandCall(stripParens(core.a))) { n = core.b; }
        if (!n) { return null; }
        var from = add || { k: "num", v: "0" };
        // N written as (B - A + 1) with the same A: random(A, B)
        var nn = stripParens(n);
        if (add && nn.k === "bin" && nn.op === "+" && stripParens(nn.b).k === "num" &&
            stripParens(nn.b).v === "1") {
          var span = stripParens(nn.a);
          if (span.k === "bin" && span.op === "-" && same(span.b, add)) {
            return { fn: "random", args: [add, span.a], kind: "int" };
          }
        }
        var lit = add && stripParens(add).k === "num" && !stripParens(add).real
                ? parseInt(stripParens(add).v, 10) : null;
        var to = lit !== null ? offBy(n, lit - 1)
               : add ? offBy({ k: "bin", op: "+", a: add, b: n }, -1) : offBy(n, -1);
        return { fn: "random", args: [from, to], kind: "int" };
      }
      function isRandomCall(e) {
        return e.k === "call" && !e.args.length &&
               /^(Math\.random|random\.random)$/.test(bare(pathOf(e.fn) || "")) ||
               (e.k === "call" && e.fn.k === "member" && e.fn.name === "NextDouble");
      }
      function isRandCall(e) {
        return e.k === "call" && !e.args.length && /^(rand|random)$/.test(bare(pathOf(e.fn) || ""));
      }
      function same(a, b) {
        return JSON.stringify(strip(a)) === JSON.stringify(strip(b));
        function strip(x) {
          x = stripParens(x);
          if (!x || typeof x !== "object") { return x; }
          var o = {};
          for (var key in x) {
            if (key === "line") { continue; }
            var v = x[key];
            o[key] = Array.isArray(v) ? v.map(strip) : (v && typeof v === "object" ? strip(v) : v);
          }
          return o;
        }
      }

      // ================================================ lowering ==
      // main first, then each function, each a chart of its own.
      kindChart = mainChart;
      var mainBody = lower(lead.concat(main), mainChart);
      var fnCharts = order.map(function (fn) {
        var ch = new Chart(fn);
        fn.params.forEach(function (p) {
          ch.params[p.name] = { name: p.name, kind: p.dims ? "list" : kindOfType(p.type), ref: p.ref };
        });
        charts.push(ch);
        fn.chart = ch;
        kindChart = ch;
        ch.body = lower(fn.body, ch);
        var trail = ch.body.filter(function (s) { return s.k !== "note"; });
        var last = trail[trail.length - 1];
        if (last && last.k === "return" && !last.value) { ch.body.splice(ch.body.lastIndexOf(last), 1); }
        return ch;
      });
      mainChart.body = mainBody;
      // main's own Return: at its foot it is nothing; anywhere else it stops
      (function tidyMain(list, atFoot) {
        list.forEach(function (st, i) {
          var foot = atFoot && i === list.length - 1;
          if (st.k === "return") {
            st.k = foot ? "drop" : "stop";
          }
          ["then", "orelse", "body"].forEach(function (key) {
            if (Array.isArray(st[key])) { tidyMain(st[key], false); }
          });
          (st.cases || []).forEach(function (c) { tidyMain(c.body, false); });
        });
      })(mainBody, true);

      // ---- which names are shared ----------------------------------------
      // Java's and C#'s fields and C++'s globals say so.  Python and
      // JavaScript say it by where a name is set: at the top of the file
      // and read or set inside a function, it is the whole program's.
      top.globals.forEach(function (decl) {
        decl.names.forEach(function (one) {
          var kind = one.dims || decl.dims ? "list" : kindOfType(decl.type);
          var g = globalChart.meet(one.name, { kind: kind, declared: true, konst: decl.konst, type: decl.type });
          g.value = one.value;
          g.line = one.line;
          if (one.value) { g.values = [one.value]; }
        });
      });
      if (py || js) {
        mainChart.list.slice().forEach(function (one) {
          var shared = fnCharts.some(function (ch) {
            if (ch.params[one.name]) { return false; }
            if (py) {
              if (ch.globalsHere[one.name]) { return true; }
              return !ch.names[one.name] && usesName(ch.body, one.name);
            }
            var own = ch.names[one.name];
            return own ? !own.declared : usesName(ch.body, one.name);
          });
          if (shared) {
            var g = globalChart.meet(one.name, {});
            g.kinds = g.kinds.concat(one.kinds);
            g.values = (g.values || []).concat(one.values || []);
            g.konst = one.konst;
            g.sets = one.sets;
            g.fromMain = true;
            delete mainChart.names[one.name];
            mainChart.list.splice(mainChart.list.indexOf(one), 1);
          }
        });
        // a name a function sets as `global` but main never does
        fnCharts.forEach(function (ch) {
          Object.keys(ch.globalsHere).forEach(function (nm) {
            var own = ch.names[nm];
            if (own) {
              var g = globalChart.meet(nm, {});
              g.kinds = g.kinds.concat(own.kinds);
              g.values = (g.values || []).concat(own.values || []);
              g.sets += own.sets;
              delete ch.names[nm];
              ch.list.splice(ch.list.indexOf(own), 1);
            }
          });
        });
        if (js) {
          // JavaScript: set inside a function without being declared there
          fnCharts.forEach(function (ch) {
            ch.list.slice().forEach(function (own) {
              if (!own.declared && globalChart.names[own.name]) {
                var g = globalChart.names[own.name];
                g.kinds = g.kinds.concat(own.kinds);
                delete ch.names[own.name];
                ch.list.splice(ch.list.indexOf(own), 1);
              }
            });
          });
        }
      } else {
        charts.forEach(function (ch) {
          ch.list.slice().forEach(function (own) {
            if (!own.declared && globalChart.names[own.name]) {
              var g = globalChart.names[own.name];
              g.kinds = g.kinds.concat(own.kinds);
              g.values = (g.values || []).concat(own.values || []);
              delete ch.names[own.name];
              ch.list.splice(ch.list.indexOf(own), 1);
            }
          });
        });
      }
      // Whether a chart's statements read or set a name anywhere in them.
      function usesName(list, name) {
        return list.some(function (st) {
          if (st.k === "input" && st.name === name) { return true; }
          if ((st.k === "for" || st.k === "foreach") && st.v === name) { return true; }
          if (["value", "cond", "e", "parts", "from", "to", "by", "over", "subject", "target"]
                .some(function (key) { return mentions(st[key], name); })) { return true; }
          return ["then", "orelse", "body"].some(function (key) {
            return Array.isArray(st[key]) && usesName(st[key], name);
          }) || (st.cases || []).some(function (c) {
            return mentions(c.label, name) || usesName(c.body, name);
          });
        });
      }

      // ---- what every name holds -------------------------------------------
      // Worked out over and over until it stops changing, because what one
      // name holds can depend on another set further down.
      var callsTo = {};
      function gatherCalls(x, ch) {
        if (!x || typeof x !== "object") { return; }
        if (Array.isArray(x)) { x.forEach(function (y) { gatherCalls(y, ch); }); return; }
        if (x.k === "call" && x.fn && x.fn.k === "name" && userFn(x.fn.v)) {
          var key = x.fn.v.toLowerCase();
          (callsTo[key] = callsTo[key] || []).push({ args: x.args, ch: ch });
        }
        for (var key2 in x) { if (key2 !== "line" && key2 !== "chart") { gatherCalls(x[key2], ch); } }
      }
      gatherCalls(mainBody, mainChart);
      fnCharts.forEach(function (ch) { gatherCalls(ch.body, ch); });

      for (var pass = 0; pass < 6; pass++) {
        var moved = false;
        charts.concat([globalChart]).forEach(function (ch) {
          kindChart = ch === globalChart ? mainChart : ch;
          ch.list.forEach(function (one) {
            var k = one.declared && one.type ? kindOfType(one.type) : null;
            if (!k || one.kinds.indexOf("list") >= 0) {
              one.kinds.forEach(function (x) { k = mergeKinds(k, x); });
              (one.values || []).forEach(function (v) { k = mergeKinds(k, kindOf(v, kindChart)); });
            }
            if (k !== one.kind) { one.kind = k; moved = true; }
          });
        });
        // what a function hands back, and what it is handed
        fnCharts.forEach(function (ch) {
          kindChart = ch;
          var fn = ch.fn, k = kindOfType(fn.rtype);
          if (!k && fn.rtype !== "void") {
            eachReturn(ch.body, function (v) { k = mergeKinds(k, kindOf(v, ch)); });
          }
          if (k !== fn.kind) { fn.kind = k; moved = true; }
          fn.params.forEach(function (p, i) {
            var have = ch.params[p.name];
            if (kindOfType(p.type) || p.dims) { return; }
            var k2 = null;
            (callsTo[fn.name.toLowerCase()] || []).forEach(function (call) {
              var arg = call.args[i];
              if (arg) { kindChart = call.ch; k2 = mergeKinds(k2, kindOf(arg.k === "ref" ? arg.e : arg, call.ch)); }
            });
            kindChart = ch;
            if (k2 !== have.kind) { have.kind = k2; moved = true; }
          });
        });
        if (!moved) { break; }
      }
      function eachReturn(list, go) {
        list.forEach(function (st) {
          if (st.k === "return" && st.value) { go(st.value); }
          ["then", "orelse", "body"].forEach(function (key) {
            if (Array.isArray(st[key])) { eachReturn(st[key], go); }
          });
          (st.cases || []).forEach(function (c) { eachReturn(c.body, go); });
        });
      }

      // ---- money ----------------------------------------------------------
      // A number that is only ever printed to two places is money: declared
      // Currency, which the runner shows with both places whatever it comes
      // to (1100.00, where rounding would have said 1100).
      function lookForMoney(list, ch) {
        list.forEach(function (st) {
          if (st.k === "display") {
            st.parts.forEach(function (p) {
              var shownAs = p.k === "places" && p.n === 2 ? stripParens(p.e) : null;
              if (shownAs && shownAs.k === "name") {
                var rec = ch.names[shownAs.v] || globalChart.names[shownAs.v];
                if (rec) { rec.money = true; }
                return;
              }
              // The runner shows a whole piece as money if any name in it
              // is, so a name shown any other way is not money: 15.00 is
              // not what the program printed for (bill + tip) / people.
              namesIn(p).forEach(function (name) {
                var other = ch.names[name] || globalChart.names[name];
                if (other) { other.plain = true; }
              });
            });
          }
          ["then", "orelse", "body"].forEach(function (key) {
            if (Array.isArray(st[key])) { lookForMoney(st[key], ch); }
          });
          (st.cases || []).forEach(function (c) { lookForMoney(c.body, ch); });
        });
      }
      lookForMoney(mainBody, mainChart);
      fnCharts.forEach(function (ch) { lookForMoney(ch.body, ch); });
      function namesIn(e) {
        var out = [];
        (function walk(x) {
          if (!x || typeof x !== "object") { return; }
          if (x.k === "name") { out.push(x.v); return; }
          for (var key in x) {
            if (key === "line") { continue; }
            var v = x[key];
            if (Array.isArray(v)) { v.forEach(walk); } else if (v && typeof v === "object") { walk(v); }
          }
        })(e);
        return out;
      }
      function isMoney(rec) {
        return !!rec && rec.money && !rec.plain && (rec.kind === "real" || rec.kind === "int");
      }
      function typeWord(rec) { return isMoney(rec) ? "Currency" : TYPE_WORD[rec.kind] || ""; }

      // ============================================== writing it ==
      var rows = [];
      function row(deep, text) { rows.push(new Array(deep + 1).join("    ") + text); }

      function nameOf(n) {
        var s = String(n).replace(/^std::/, "");
        return KEPT.test(s) ? s + "_" : s;
      }
      // Pseudocode's strings have no escapes: they run from a quote to the
      // next one of the same kind.  Words with double quotes in them go in
      // single ones -- unless they hold an odd number, which the reader of
      // the pseudocode would take for a line carrying on to the next.
      function quoted(v) {
        var s = String(v).replace(/\t/g, "    ").replace(/\n/g, " ");
        var doubles = (s.match(/"/g) || []).length;
        if (doubles && s.indexOf("'") < 0 && doubles % 2 === 0) { return "'" + s + "'"; }
        return '"' + s.replace(/"/g, "'") + '"';
      }
      // Precedence, pseudocode's own: OR, AND, = <>, < >, + -, * / MOD, ^.
      var RANKS = { "OR": 1, "AND": 2, "=": 3, "<>": 3, "<": 4, "<=": 4, ">": 4, ">=": 4,
                    "+": 5, "-": 5, "*": 6, "/": 6, "MOD": 6, "^": 7 };
      var AS_WORD = { "||": "OR", "&&": "AND", "==": "=", "!=": "<>", "%": "MOD",
                      "**": "^", "??": "OR" };
      var FLIP = { "<": ">=", ">": "<=", "<=": ">", ">=": "<", "==": "!=", "!=": "==" };

      function px(e, ch) {                   // -> { t: text, r: rank }
        var s = stripParens(e);
        if (!s) { return { t: "", r: 9 }; }
        if (s.k === "bin" || s.k === "cast" || s.k === "call") {
          var rnd = randomRange(s);
          if (rnd) { return callText(rnd, ch); }
        }
        switch (s.k) {
          case "fn": throw oops("cm_lambda", s.line);
          case "num": return { t: String(s.v), r: /^-/.test(String(s.v)) ? 8 : 9 };
          case "str": return { t: quoted(s.v), r: 9 };
          case "bool": return { t: s.v ? "True" : "False", r: 9 };
          case "null": return { t: '""', r: 9 };
          case "name": return { t: nameOf(s.v), r: 9 };
          case "fstr": {
            var parts = piecesOf(s).map(function (p) {
              var t = px(p, ch);
              return t.r < 5 ? "(" + t.t + ")" : t.t;
            });
            return { t: parts.join(" + ") || '""', r: parts.length > 1 ? 5 : 9 };
          }
          case "places": {
            var scale = Math.pow(10, s.n);
            if (!s.n) { return { t: "round(" + px(s.e, ch).t + ")", r: 9 }; }
            return { t: "round(" + wrapAt(s.e, 6, ch) + " * " + scale + ") / " + scale, r: 6 };
          }
          case "un": {
            if (s.op === "!") {
              var inside = stripParens(s.a);
              if (inside.k === "bin" && FLIP[inside.op]) {
                return px({ k: "bin", op: FLIP[inside.op], a: inside.a, b: inside.b, line: inside.line }, ch);
              }
              if (inside.k === "un" && inside.op === "!") { return px(inside.a, ch); }
              var t = px(inside, ch);
              return { t: "NOT " + (t.r >= 9 ? t.t : "(" + t.t + ")"), r: 9 };
            }
            if (s.op === "-") {
              var neg = px(s.a, ch);
              return { t: "-" + (neg.r >= 9 ? neg.t : "(" + neg.t + ")"), r: 8 };
            }
            if (s.op === "+") { return px(s.a, ch); }
            note(s.line, s.op);
            return { t: s.op + px(s.a, ch).t, r: 8 };
          }
          case "cast": {
            var k = kindOfType(s.type);
            if (k === "int" && kindOf(s.e, ch) !== "int") { return { t: "int(" + px(s.e, ch).t + ")", r: 9 }; }
            return px(s.e, ch);
          }
          case "bin": return pxBin(s, ch);
          case "call": return pxCall(s, ch);
          case "cond":
            note(s.line, "?:");
            return { t: "(" + px(s.test, ch).t + " ? " + px(s.a, ch).t + " : " + px(s.b, ch).t + ")", r: 9 };
          case "member": {
            if (/^(length|Length|Count)$/.test(s.name)) { return { t: "length(" + px(s.obj, ch).t + ")", r: 9 }; }
            if (/^(Math\.PI|math\.pi|M_PI)$/.test(pathOf(s) || "")) { return { t: "3.141592653589793", r: 9 }; }
            if (/^(Math\.E|math\.e)$/.test(pathOf(s) || "")) { return { t: "2.718281828459045", r: 9 }; }
            if (/^(Integer\.MAX_VALUE|int\.MaxValue|INT_MAX)$/.test(pathOf(s) || "")) { return { t: "2147483647", r: 9 }; }
            note(s.line, "." + s.name);
            return { t: px(s.obj, ch).t + "." + s.name, r: 9 };
          }
          case "index":
            note(s.line, "[ ]");
            return { t: px(s.obj, ch).t + "[" + px(s.at, ch).t + "]", r: 9 };
          case "list":
            note(s.line, "[ ]");
            return { t: "[" + s.items.map(function (x) { return px(x, ch).t; }).join(", ") + "]", r: 9 };
          case "tuple":
            note(s.line, "( , )");
            return { t: "(" + s.items.map(function (x) { return px(x, ch).t; }).join(", ") + ")", r: 9 };
          case "new":
            note(s.line, "new");
            return { t: "new " + (s.type && s.type.name || "") + "(" +
                     s.args.map(function (x) { return px(x, ch).t; }).join(", ") + ")", r: 9 };
          case "ref": return px(s.e, ch);
          case "kw": return px(s.value, ch);
          case "incdec": case "assignx":
            throw oops("cm_other", s.line, { bit: s.op || "=" });
        }
        throw oops("cm_other", s.line, { bit: s.k });
      }
      function wrapAt(e, rank, ch) {
        var t = px(e, ch);
        return t.r < rank ? "(" + t.t + ")" : t.t;
      }
      // a.compareTo(b) < 0, string.Compare(a, b) >= 0: a < b, a >= b
      function compared(s) {
        if (!FLIP[s.op]) { return null; }
        var zero = stripParens(s.b), call = stripParens(s.a);
        if (!(zero.k === "num" && zero.v === "0" && call.k === "call")) { return null; }
        var known = builtIn(call);
        if (!known || known.fn !== "compare") { return null; }
        return { k: "bin", op: s.op, a: known.args[0], b: known.args[1], line: s.line };
      }
      function pxBin(s, ch) {
        var turned = compared(s);
        if (turned) { s = turned; }
        var op = s.op;
        if (op === "in" || op === "not in") {
          note(s.line, op);
          return { t: px(s.a, ch).t + " " + op + " " + px(s.b, ch).t, r: 3 };
        }
        var ka = kindOf(s.a, ch), kb = kindOf(s.b, ch);
        // integer division, said the way each language means it
        if (op === "//") {
          return { t: "floor(" + wrapAt(s.a, 6, ch) + " / " + wrapAt(s.b, 7, ch) + ")", r: 9 };
        }
        if (op === "/" && !py && !js && ka === "int" && kb === "int") {
          return { t: "int(" + wrapAt(s.a, 6, ch) + " / " + wrapAt(s.b, 7, ch) + ")", r: 9 };
        }
        if (op === "*" && py && (ka === "text" || kb === "text")) { note(s.line, "*"); }
        if (/^(<<|>>|>>>|&|\||\^|instanceof|is|as)$/.test(op)) {
          note(s.line, op);
          return { t: px(s.a, ch).t + " " + op + " " + px(s.b, ch).t, r: 5 };
        }
        var word = AS_WORD[op] || op;
        var r = RANKS[word] || 5;
        var left = px(s.a, ch), right = px(s.b, ch);
        var lt = left.r < r ? "(" + left.t + ")" : left.t;
        var rt = right.r <= r ? "(" + right.t + ")" : right.t;
        if (word === "^" && left.r <= 8) { lt = "(" + left.t + ")"; }
        return { t: lt + " " + word + " " + rt, r: r };
      }
      function pxCall(s, ch) {
        var dressed = shownPlain(s);       // x.toFixed(2), format(x, ".2f")
        if (dressed !== s) { return px(dressed, ch); }
        var asked = inputOf(s);
        if (asked) { throw oops("cm_input_where", s.line); }
        var mine = s.fn.k === "name" ? userFn(s.fn.v) : null;
        if (mine) {
          return { t: nameOf(mine.name) + "(" + s.args.map(function (a) {
            return px(a.k === "ref" ? a.e : a, ch).t; }).join(", ") + ")", r: 9 };
        }
        var known = builtIn(s);
        if (known) { return callText(known, ch); }
        var p = bare(pathOf(s.fn) || "");
        note(s.line, (s.fn.k === "member" ? s.fn.name : p || "…") + "()");
        var head = s.fn.k === "member" ? px(s.fn.obj, ch).t + "." + s.fn.name
                 : s.fn.k === "name" ? nameOf(s.fn.v) : px(s.fn, ch).t;
        return { t: head + "(" + s.args.map(function (a) { return px(a, ch).t; }).join(", ") + ")", r: 9 };
      }
      function callText(c, ch) {
        var args = c.args.map(function (a) { return px(a, ch).t; });
        if (c.fn === "") { return px(c.args[0], ch); }
        if (c.fn === "^") {
          return { t: wrapAt(c.args[0], 8, ch) + " ^ " + wrapAt(c.args[1], 8, ch), r: 7 };
        }
        if (c.fn === "==") { return pxBin({ k: "bin", op: "==", a: c.args[0], b: c.args[1] }, ch); }
        if (c.fn === "%") { return pxBin({ k: "bin", op: "%", a: c.args[0], b: c.args[1] }, ch); }
        if (c.fn === "compare") {
          // a.compareTo(b) < 0 is read where it is compared; alone it is a - b
          return { t: "(" + args[0] + " - " + args[1] + ")", r: 9 };
        }
        if (c.fn === "round places") {
          var n = stripParens(c.args[1]);
          if (n.k === "num") {
            var scale = Math.pow(10, parseInt(n.v, 10));
            return { t: "round(" + wrapAt(c.args[0], 6, ch) + " * " + scale + ") / " + scale, r: 6 };
          }
          return { t: "round(" + args[0] + ")", r: 9 };
        }
        if (c.fn === "rand") { note(c.args.line || 0, "rand()"); return { t: "random(0, 32767)", r: 9 }; }
        return { t: c.fn + "(" + args.join(", ") + ")", r: 9 };
      }
      function cond(e, ch) { return px(e, ch).t; }

      // Statements.
      function write(list, deep, ch) {
        list.forEach(function (st) { writeOne(st, deep, ch); });
      }
      function writeOne(st, deep, ch) {
        switch (st.k) {
          case "drop": return;
          case "note": row(deep, "// " + st.text); return;
          case "set": {
            var target = st.target.k === "name" ? nameOf(st.target.v) : px(st.target, ch).t;
            if (st.folded) { return; }
            row(deep, "Set " + target + " = " + px(st.value, ch).t);
            return;
          }
          case "input": row(deep, "Input " + nameOf(st.name)); return;
          case "display":
            // Money, shown to two places straight after a dollar sign, is
            // what the runner does with any number there by itself.
            row(deep, "Display " + st.parts.map(function (p, i) {
              var before = st.parts[i - 1];
              if (p.k === "places" && p.n === 2 && before && before.k === "str" &&
                  /\$\s*$/.test(before.v)) {
                return px(p.e, ch).t;
              }
              var inner = p.k === "places" && p.n === 2 ? stripParens(p.e) : null;
              if (inner && inner.k === "name" &&
                  isMoney(ch.names[inner.v] || globalChart.names[inner.v])) {
                return px(inner, ch).t;
              }
              return px(p, ch).t;
            }).join(", "));
            return;
          case "call": {
            var e = stripParens(st.e);
            if (e.k === "call") {
              var mine = e.fn.k === "name" ? userFn(e.fn.v) : null;
              row(deep, "Call " + (mine ? nameOf(mine.name) + "(" + e.args.map(function (a) {
                return px(a.k === "ref" ? a.e : a, ch).t; }).join(", ") + ")" : px(e, ch).t));
            } else {
              row(deep, "Call " + px(e, ch).t);
            }
            return;
          }
          case "stop": row(deep, "Stop"); return;
          case "wait": {
            var how = px(st.e, ch).t;
            row(deep, "Wait " + how + (st.unit === "ms" ? " milliseconds" : " seconds"));
            return;
          }
          case "return":
            row(deep, st.value ? "Return " + px(st.value, ch).t : "Return");
            return;
          case "if": {
            row(deep, "If " + cond(st.cond, ch) + " Then");
            write(st.then, deep + 1, ch);
            var other = st.orelse;
            while (other.length === 1 && other[0].k === "if" && other[0].chained) {
              row(deep, "Else If " + cond(other[0].cond, ch) + " Then");
              write(other[0].then, deep + 1, ch);
              other = other[0].orelse;
            }
            if (other.length) {
              row(deep, "Else");
              write(other, deep + 1, ch);
            }
            row(deep, "End If");
            return;
          }
          case "while":
            row(deep, "While " + cond(st.cond, ch));
            write(st.body, deep + 1, ch);
            row(deep, "End While");
            return;
          case "do":
            row(deep, "Do");
            write(st.body, deep + 1, ch);
            row(deep, (st.until ? "Until " : "Loop While ") + cond(st.cond, ch));
            return;
          case "for": {
            var by = st.by ? px(st.by, ch).t : "";
            row(deep, "For " + nameOf(st.v) + " = " + px(st.from, ch).t + " To " +
                      px(st.to, ch).t + (by && by !== "1" ? " Step " + by : ""));
            write(st.body, deep + 1, ch);
            row(deep, "End For");
            return;
          }
          case "foreach":
            row(deep, "For Each " + st.v.split(/,\s*/).map(nameOf).join(", ") + " In " + px(st.over, ch).t);
            write(st.body, deep + 1, ch);
            row(deep, "End For");
            return;
          case "select":
            row(deep, "Select Case " + px(st.subject, ch).t);
            st.cases.forEach(function (c) {
              row(deep + 1, c.label ? "Case " + px(c.label, ch).t : "Default");
              write(c.body, deep + 2, ch);
            });
            row(deep, "End Select");
            return;
          case "break": return;
        }
        throw oops("cm_other", st.line, { bit: st.k });
      }

      // ---- declarations: at the top of each chart ------------------------
      // In the order the names were first met, and holding their first
      // value where that is the first thing done with them: a run of
      // plain settings at the top of a chart is where a Declare would have
      // given the name its value anyway.
      // Worked out from nothing but figures, words and the program's own
      // Constants -- what a Declare may be given as it is made.
      function isConstant(e, allowed) {
        e = stripParens(e);
        if (!e) { return false; }
        if (e.k === "num" || e.k === "str" || e.k === "bool") { return true; }
        if (e.k === "un") { return isConstant(e.a, allowed); }
        if (e.k === "bin") { return isConstant(e.a, allowed) && isConstant(e.b, allowed); }
        if (e.k === "name") { return !!allowed[e.v]; }
        if (e.k === "cast") { return isConstant(e.e, allowed); }
        if (e.k === "member") { return /^(Math\.PI|math\.pi)$/.test(pathOf(e) || ""); }
        return false;
      }
      function declareRows(ch, body, deep, known) {
        var out = [];
        var allowed = Object.assign({}, known || {});
        // the leading run of plain settings
        var folded = {}, foldOrder = [];
        for (var i = 0; i < body.length; i++) {
          var st = body[i];
          if (st.k === "note" || st.folded) { continue; }
          if (st.k !== "set" || st.target.k !== "name") { break; }
          var one = ch.names[st.target.v];
          if (!one || folded[one.name] !== undefined || !isConstant(st.value, allowed)) { break; }
          folded[one.name] = st;
          foldOrder.push(one);
          if (fixed(one, true)) { allowed[one.name] = true; }
        }
        // A Constant: said to be one, or in Python named like one, and
        // given its value once.
        function fixed(one, first) {
          var konst = first && one.konst && one.sets <= 1;
          if (py && first && /^[A-Z][A-Z0-9_]*$/.test(one.name) && one.sets <= 1) { konst = true; }
          if (js && konst && !/^[A-Z][A-Z0-9_]*$/.test(one.name)) { konst = false; }
          return !!konst;
        }
        function said(one) {
          if (one.loopOnly && !one.declared) { return; }
          var type = typeWord(one);
          var first = folded[one.name];
          var konst = fixed(one, !!first);
          if (!type && !first) { return; }         // nothing to say about it
          var text = (konst ? "Constant " : "Declare ") + (type ? type + " " : "") + nameOf(one.name);
          if (first) {
            text += " = " + px(first.value, ch).t;
            first.folded = true;
          }
          out.push(text);
        }
        // The ones given a value go in the order they were given it, which
        // is the order they can be worked out in, where the first of them
        // would have gone; the rest where they were first met.
        var foldedSaid = false;
        ch.list.forEach(function (one) {
          if (folded[one.name]) {
            if (!foldedSaid) { foldOrder.forEach(said); foldedSaid = true; }
            return;
          }
          said(one);
        });
        out.forEach(function (t) { row(deep, t); });
      }

      // ---- and the whole of it -------------------------------------------
      function paramText(ch, p) {
        var have = ch.params[p.name] || {};
        var type = TYPE_WORD[have.kind] || "";
        return (type ? type + " " : "") + (p.ref ? "Ref " : "") + nameOf(p.name);
      }
      var shared = globalChart.list.length > 0;
      var leadNotes = (top.head || []).slice();
      while (mainBody.length && mainBody[0].k === "note") { leadNotes.push(mainBody.shift()); }
      leadNotes.forEach(function (n) { row(0, "// " + n.text); });

      var sharedKnown = {};                 // the program's own Constants
      if (shared) {
        // the shared names, above everything, with their values where they
        // are plain ones; the rest are set where the code set them
        globalChart.list.forEach(function (g) {
          kindChart = mainChart;
          var value = g.value || null;
          if (!value && g.fromMain) {
            // set in main's leading run of plain settings: taken up here
            for (var i = 0; i < mainBody.length; i++) {
              var st = mainBody[i];
              if (st.k === "note") { continue; }
              if (st.k !== "set" || st.target.k !== "name") { break; }
              if (st.target.v === g.name && isConstant(st.value, sharedKnown)) {
                value = st.value;
                st.folded = true;
                break;
              }
              if (!isConstant(st.value, sharedKnown)) { break; }
            }
          }
          var konst = g.konst && value && isConstant(value, sharedKnown) ||
                      (py && value && /^[A-Z][A-Z0-9_]*$/.test(g.name) && g.sets <= 1);
          var type = typeWord(g);
          if (value && !isConstant(value, sharedKnown)) {
            // worked out: declared here, set where main starts
            mainBody.unshift({ k: "set", target: { k: "name", v: g.name }, value: value, line: g.line });
            value = null;
            konst = false;
          }
          if (value && konst) { sharedKnown[g.name] = true; }
          row(0, (konst ? "Constant " : "Declare ") + (type ? type + " " : "") + nameOf(g.name) +
                 (value ? " = " + px(value, mainChart).t : ""));
        });
        row(0, "");
        row(0, "Module main()");
        declareRows(mainChart, mainBody, 1, sharedKnown);
        kindChart = mainChart;
        write(mainBody, 1, mainChart);
        row(0, "End Module");
      } else {
        row(0, "Start");
        kindChart = mainChart;
        declareRows(mainChart, mainBody, 0, sharedKnown);
        write(mainBody, 0, mainChart);
        row(0, "Stop");
      }
      fnCharts.forEach(function (ch) {
        var fn = ch.fn;
        kindChart = ch;
        var gives = false;
        eachReturn(ch.body, function () { gives = true; });
        row(0, "");
        (fn.lead || []).forEach(function (n) { row(0, "// " + n.text); });
        var params = fn.params.map(function (p) { return paramText(ch, p); }).join(", ");
        if (gives) {
          var type = TYPE_WORD[fn.kind] || "";
          row(0, "Function " + (type ? type + " " : "") + nameOf(fn.name) + "(" + params + ")");
        } else {
          row(0, "Module " + nameOf(fn.name) + "(" + params + ")");
        }
        declareRows(ch, ch.body, 1, sharedKnown);
        write(ch.body, 1, ch);
        row(0, gives ? "End Function" : "End Module");
      });
      (top.trailing || []).forEach(function (n) { if (n.text) { row(0, "// " + n.text); } });

      notes.sort(function (a, b) { return a.line - b.line; });
      return { text: rows.join("\n") + "\n", notes: notes.filter(function (n) { return n.line; }) };
    }

    return translate;
  })();
