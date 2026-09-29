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

    // `base` is how many lines of other files come before this one: a
    // program in several files is numbered straight through, so a line
    // number says which file as well as where in it (translate undoes it).
    function lexCode(src, lang, base) {
      var py = lang === "python", js = lang === "javascript";
      var cs = lang === "csharp";
      var s = String(src || "").replace(/\r\n?/g, "\n").replace(/\t/g, "    ");
      var n = s.length, i = 0, line = 1 + (base || 0), col0 = 0;
      var toks = [], notes = [], defines = [];
      // After these, a slash starts a pattern rather than dividing.
      function regexHere() {
        var last = toks[toks.length - 1];
        if (!last) { return true; }
        if (last.t === "op") { return !/^[)\]}]$/.test(last.v); }
        return last.t === "name" && /^(return|typeof|case|in|of|new|delete|void|throw|else|do)$/.test(last.v);
      }
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
        if ((lang === "cpp" || cs) && c === "#" && !codeOnLine) {   // #include, #region
          var eol = s.indexOf("\n", i);
          if (eol < 0) { eol = n; }
          // #define LIMIT 10: a name for a value, which is a Constant
          var def = /^#\s*define\s+([A-Za-z_]\w*)\s+(.+?)\s*$/.exec(s.slice(i, eol));
          if (def && lang === "cpp") { defines.push({ name: def[1], text: def[2], line: line }); }
          i = eol;
          continue;
        }
        if (js && c === "#" && /[A-Za-z_$]/.test(s[i + 1] || "")) {    // this.#count
          var priv = /^#([\w$]+)/.exec(s.slice(i, i + 256));
          push("name", "_" + priv[1]);
          i += priv[0].length;
          continue;
        }
        // a pattern, /\s+/: where a value would start, a slash opens one
        if (js && c === "/" && s[i + 1] !== "/" && s[i + 1] !== "*" && regexHere()) {
          var rx = /^\/((?:\\.|\[(?:\\.|[^\]])*\]|[^\/\\\n])+)\/([a-z]*)/.exec(s.slice(i, i + 512));
          if (rx) {
            push("regex", rx[1], { flags: rx[2] });
            i += rx[0].length;
            continue;
          }
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
        if (py && (op === "::" || op === "?." || op === "??" || op === "=>" || op === "++" || op === "--" ||
                   op === "&&" || op === "||" || op === "===" || op === "!==")) { op = c; }
        if ("([{".indexOf(op) >= 0) { depth++; }
        if (")]}".indexOf(op) >= 0) { depth = Math.max(0, depth - 1); }
        i += op.length;
        // >> and >>> in Java, C# and C++ are as many >s, each its own, so
        // that List<List<Integer>> closes two lists; a shift is put back
        // together where it is read (cBinary)
        if (!py && !js && (op === ">>" || op === ">>>")) {
          push("op", ">");
          for (var g = 1; g < op.length; g++) { push("op", ">", { glued: true }); }
          continue;
        }
        push("op", op);
      }
      if (py) {
        var tail = toks[toks.length - 1];
        if (tail && tail.t !== "nl" && tail.t !== "dedent") { push("nl", ""); }
        while (indents.length > 1) { indents.pop(); push("dedent", 0); }
      }
      push("eof", "");
      return { toks: toks, notes: notes, defines: defines };
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
      // what this file names that another file might: the modules it
      // imports (Python) and the classes it defines (Java, C#)
      var imports = [], classes = [];

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
        if (isName("lambda")) {
          next();
          var lps = [];
          while (!isOp(":")) {
            if (isOp("*") || isOp("**")) { next(); }
            var lp = next();
            if (lp.t !== "name") { throw odd(lp); }
            var one = { name: lp.v, type: null, line: lp.line };
            if (accept("=")) { one.dflt = pyTernary(); }
            lps.push(one);
            if (!accept(",")) { break; }
          }
          expect(":");
          var said = pyTernary();
          return { k: "fn", params: lps, body: [{ k: "return", value: said, line: t.line }],
                   line: t.line, lambda: true };
        }
        // (n := len(a)): a name given a value in the middle of a sum
        if (t.t === "name" && isOp(":=", 1)) {
          next(); next();
          return { k: "assignx", op: "=", target: { k: "name", v: t.v, line: t.line },
                   value: pyTernary(), line: t.line };
        }
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
          if (isOp("*") || isOp("**")) {
            next();
            args.push({ k: t.v === "*" ? "star" : "dstar", e: pyTernary(), line: t.line });
          } else if (t.t === "name" && isOp("=", 1)) {
            next(); next();
            args.push({ k: "kw", name: t.v, value: pyTernary(), line: t.line });
          } else {
            args.push(pyTernary());
          }
          // sum(x * x for x in xs): the one thing handed over is a generator
          if (isName("for") && args.length === 1) {
            args[0] = { k: "comp", kind: "gen", elt: args[0], fors: pyFors(), line: t.line };
          }
          if (!accept(",")) { break; }
        }
        expect(close);
        return args;
      }
      // The for ... in ... if ... parts of a comprehension.
      function pyFors() {
        var fors = [];
        while (isName("for") || (isName("async") && isName("for", 1))) {
          if (isName("async")) { next(); }
          var ft = next();
          var target = pyTarget();
          expect("in");
          var iter = pyOr();
          var ifs = [];
          while (isName("if")) { next(); ifs.push(pyOrNoCond()); }
          fors.push({ target: target, iter: iter, ifs: ifs, line: ft.line });
        }
        return fors;
      }
      // An if inside a comprehension is a test, never the start of an
      // x if c else y: the else would have nothing to belong to.
      function pyOrNoCond() { return pyOr(); }
      // What a for gives its values to: x, (i, x), a, b.
      function pyTarget() {
        var first = pyTargetOne(), items = [first];
        while (isOp(",") && !isName("in", 1)) {
          next();
          if (isName("in")) { break; }
          items.push(pyTargetOne());
        }
        if (isOp(",")) { next(); }
        return items.length === 1 ? first : { k: "tuple", items: items, line: first.line };
      }
      function pyTargetOne() {
        var t = peek();
        if (isOp("(") || isOp("[")) {
          var close = t.v === "(" ? ")" : "]";
          next();
          var inner = [];
          while (!isOp(close)) { inner.push(pyTargetOne()); if (!accept(",")) { break; } }
          expect(close);
          return { k: "tuple", items: inner, line: t.line };
        }
        if (isOp("*")) { next(); return { k: "star", e: pyTargetOne(), line: t.line }; }
        return pyPostfix(pyAtom());
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
            // a[i], a[i:j], a[::-1], d[x, y]
            var bits = [null], sliced = false;
            if (!isOp(":")) { bits[0] = pyTernary(); }
            if (!sliced && isOp(",")) {
              var many = [bits[0]];
              while (accept(",")) { if (isOp("]")) { break; } many.push(pyTernary()); }
              bits[0] = { k: "tuple", items: many, line: t.line };
            }
            while (accept(":")) {
              sliced = true;
              bits.push(!isOp("]") && !isOp(":") ? pyTernary() : null);
            }
            expect("]");
            a = sliced ? { k: "slice", obj: a, from: bits[0], to: bits[1] || null,
                           step: bits[2] || null, line: t.line }
                       : { k: "index", obj: a, at: bits[0], line: t.line };
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
          if (isName("yield")) { next(); pyItem(); expect(")"); return { k: "null", line: t.line }; }
          var first = pyItem();
          if (isName("for")) {
            var gen = { k: "comp", kind: "gen", elt: first, fors: pyFors(), line: t.line };
            expect(")");
            return gen;
          }
          if (isOp(",")) {
            var items = [first];
            while (accept(",")) { if (isOp(")")) { break; } items.push(pyItem()); }
            expect(")");
            return { k: "tuple", items: items, line: t.line };
          }
          expect(")");
          return { k: "paren", e: first, line: t.line };
        }
        if (t.t === "op" && t.v === "[") {
          var list = [];
          while (!isOp("]")) {
            list.push(pyItem());
            if (isName("for") && list.length === 1) {
              var comp = { k: "comp", kind: "list", elt: list[0], fors: pyFors(), line: t.line };
              expect("]");
              return comp;
            }
            if (!accept(",")) { break; }
          }
          expect("]");
          return { k: "list", items: list, line: t.line };
        }
        if (t.t === "op" && t.v === "{") {
          // {}, {k: v, ...}, {k: v for ...}, {a, b}, {x for ...}, {**d}
          if (accept("}")) { return { k: "dict", keys: [], values: [], line: t.line }; }
          var keys = [], values = [], loose = [];
          for (;;) {
            if (isOp("**")) {
              next();
              keys.push(null);
              values.push({ k: "dstar", e: pyOr(), line: t.line });
            } else {
              var kx = pyItem();
              if (accept(":")) {
                var vx = pyTernary();
                if (isName("for") && !keys.length) {
                  var dc = { k: "comp", kind: "dict", key: kx, value: vx, fors: pyFors(), line: t.line };
                  expect("}");
                  return dc;
                }
                keys.push(kx);
                values.push(vx);
              } else {
                if (isName("for") && !loose.length) {
                  var sc = { k: "comp", kind: "set", elt: kx, fors: pyFors(), line: t.line };
                  expect("}");
                  return sc;
                }
                loose.push(kx);
              }
            }
            if (!accept(",") || isOp("}")) { break; }
          }
          expect("}");
          if (loose.length) { return { k: "set", items: loose, line: t.line }; }
          return { k: "dict", keys: keys, values: values, line: t.line };
        }
        if (t.t === "op" && t.v === "...") { return { k: "null", line: t.line }; }
        throw odd(t);
      }
      // An item of a list, a tuple or a set: *rest spreads another one in.
      function pyItem() {
        if (isOp("*")) { var t = next(); return { k: "star", e: pyOr(), line: t.line }; }
        return pyTernary();
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
                     "&=": 1, "|=": 1, "^=": 1, "<<=": 1, ">>=": 1, "??=": 1,
                     "**=": 1, "||=": 1, "&&=": 1, ">>>=": 1 };
      function cAssign() {
        var t = peek();
        if (arrowAhead()) { return cArrow(); }
        var a = cTernary();
        if (peek().t === "op" && ASSIGN[peek().v]) {
          var op = next().v;
          return { k: "assignx", target: a, op: op, value: cAssign(), line: t.line };
        }
        // C#'s x switch { 1 => "one", _ => "many" }
        if (cs && isName("switch") && isOp("{", 1)) { return csSwitchExpr(a); }
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
      // The operator starting here: a >> or >>> is read back together out
      // of the >s the tokens were cut into (see lexCode).
      function binOpHere() {
        var t = peek();
        if (t.t === "op") {
          if (t.v === ">" && isOp(">", 1) && peek(1).glued) {
            if (isOp(">", 2) && peek(2).glued) { return { op: ">>>", n: 3 }; }
            if (isOp(">=", 2) && peek(2).glued) { return null; }
            return { op: ">>", n: 2 };
          }
          return { op: t.v, n: 1 };
        }
        if (t.t === "name" && (t.v === "instanceof" || (js && t.v === "in") ||
                               (cs && (t.v === "is" || t.v === "as")))) {
          return { op: t.v, n: 1 };
        }
        return null;
      }
      function cBinary(least) {
        var a = cUnary();
        for (;;) {
          var t = peek(), got = binOpHere();
          var op = got ? got.op : null;
          var rank = op ? C_BIN[op] || (/^(is|as|in)$/.test(op) ? 7 : 0) : 0;
          if (!rank || rank < least) { break; }
          for (var k = 0; k < got.n; k++) { next(); }
          var b;
          if (op === "is" && (isName("null") || isName("not"))) {
            // x is null, x is not null
            var neg = !!accept("not");
            if (isName("null")) {
              next();
              a = { k: "bin", op: neg ? "!=" : "==", a: a, b: { k: "null", line: t.line }, line: t.line };
              continue;
            }
            var nt = typeName();
            a = { k: "un", op: "!", a: { k: "bin", op: "is", a: a,
                  b: { k: "name", v: nt.name, line: t.line, type: true }, line: t.line }, line: t.line };
            continue;
          }
          if (op === "is" || op === "as" || op === "instanceof") {
            // x is int n, x instanceof Point p: a type, and a name for it
            var ty = typeName();
            b = { k: "name", v: ty.name, line: t.line, type: true };
            if (peek().t === "name" && !binOpHere()) { b.bind = next().v; }
          } else {
            b = cBinary(op === "**" ? rank : rank + 1);
          }
          a = { k: "bin", op: op === "===" ? "==" : op === "!==" ? "!=" : op,
                a: a, b: b, line: t.line };
        }
        return a;
      }
      var CAST_WORDS = /^(int|long|short|byte|double|float|char|bool|boolean|decimal|string|String|unsigned|signed|Integer|Double|size_t)$/;
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
        // C++: &x hands over x itself, *p is what p points at -- in a chart
        // both are simply x and p
        if (t.t === "op" && (t.v === "*" || t.v === "&") && cpp) {
          next();
          return { k: t.v === "&" ? "addr" : "deref", e: cUnary(), line: t.line };
        }
        if (isName("new")) { return cPostfix(cNew()); }
        if (isName("await") || isName("typeof") || isName("delete") || isName("sizeof") || isName("void")) {
          next();
          if (t.v === "await") { return cUnary(); }
          if (t.v === "delete") { return { k: "del", e: cUnary(), line: t.line }; }
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
        // (Point) o, (List<String>) x: a cast to a type of the program's own
        if (!js && isOp("(") && peek(1).t === "name" && /^[A-Z]/.test(peek(1).v) && castAhead()) {
          next();
          var ct = typeName();
          expect(")");
          return { k: "cast", type: ct.name, e: cUnary(), line: t.line };
        }
        return cPostfix(cPrimary());
      }
      // (Name) followed by something a value starts with
      function castAhead() {
        var save = pos;
        try {
          next();
          typeName();
          if (!isOp(")")) { return false; }
          next();
          var after = peek();
          return after.t === "name" || after.t === "num" || after.t === "str" ||
                 (after.t === "op" && (after.v === "(" || after.v === "!"));
        } catch (e) {
          return false;
        } finally {
          pos = save;
        }
      }
      // new Point(3, 4), new int[n], new int[] {1, 2}, new List<int> { 1, 2 },
      // new Point { X = 1 }, new[] { 1, 2 }, new() -- and Java's new
      // Comparator<>() { ... }, whose body is stepped over.
      function cNew() {
        var t = next();
        if (isOp("[")) {                       // C#: new[] { ... }
          next();
          expect("]");
          return { k: "newarr", elem: null, dims: [], init: cInitList(), line: t.line };
        }
        if (isOp("(") && cs) {                 // C#: new(), its type the declared one
          next();
          var targs = cArgs(")");
          return { k: "new", type: null, args: targs, init: isOp("{") ? cObjInit() : null, line: t.line };
        }
        var ty = typeName(true);
        if (isOp("[")) {
          var dims = [];
          while (isOp("[")) {
            next();
            if (isOp("]")) { next(); dims.push(null); continue; }
            dims.push(cAssign());
            while (accept(",")) { dims.push(cAssign()); }     // C#: new int[3, 4]
            expect("]");
          }
          return { k: "newarr", elem: ty, dims: dims, init: isOp("{") ? cInitList() : null, line: t.line };
        }
        if (ty.dims && isOp("{")) {
          return { k: "newarr", elem: ty, dims: [], init: cInitList(), line: t.line };
        }
        var args = [];
        if (accept("(")) { args = cArgs(")"); }
        var init = null;
        if (isOp("{")) {
          if (java) { skipBraces(); return { k: "new", type: ty, args: args, anon: true, line: t.line }; }
          init = cObjInit();
        }
        return { k: "new", type: ty, args: args, init: init, line: t.line };
      }
      // { 1, 2, { 3, 4 } }: an array written out, in brackets that nest
      function cInitList() {
        var t = expect("{");
        var items = [];
        while (!isOp("}")) {
          items.push(isOp("{") ? cInitList() : cAssign());
          if (!accept(",")) { break; }
        }
        expect("}");
        return { k: "list", items: items, line: t.line, braces: true };
      }
      // C#'s initializers: { X = 1, Y = 2 } sets parts of what was made,
      // { 1, 2 } fills it, { ["a"] = 1 } and { {"a", 1} } fill a dictionary
      function cObjInit() {
        var t = peek();
        if (isOp("{") && peek(1).t === "name" && isOp("=", 2)) {
          next();
          var names = [], values = [];
          while (!isOp("}")) {
            names.push(next().v);
            expect("=");
            values.push(isOp("{") ? cObjInit() : cAssign());
            if (!accept(",")) { break; }
          }
          expect("}");
          return { k: "fields", names: names, values: values, line: t.line };
        }
        if (isOp("{") && isOp("[", 1)) {
          next();
          var keys = [], vals = [];
          while (!isOp("}")) {
            expect("[");
            keys.push(cAssign());
            expect("]");
            expect("=");
            vals.push(cAssign());
            if (!accept(",")) { break; }
          }
          expect("}");
          return { k: "dict", keys: keys, values: vals, line: t.line };
        }
        return cInitList();
      }
      function cArgs(close) {
        var args = [];
        while (!isOp(close)) {
          var t = peek();
          if ((cs && (isName("ref") || isName("out") || isName("in"))) && (peek(1).t === "name" || isOp("(", 1))) {
            next();
            // out var n, out int n: declared where it is handed over
            if ((isName("var") || (peek(1).t === "name" && !isOp(".", 1) && !isOp("[", 1) && !isOp(",", 1) && !isOp(")", 1)))) {
              typeName();
            }
            args.push({ k: "ref", e: cAssign(), line: t.line });
          } else if (cs && t.t === "name" && isOp(":", 1) && !isOp("::", 1)) {
            next(); next();                  // a named argument: the name goes
            args.push(cAssign());
          } else if (isOp("...")) {
            next();
            args.push({ k: "star", e: cAssign(), line: t.line });
          } else if (close === "}" && isOp("{")) {
            args.push(cInitList());
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
          else if (isOp(".") || (isOp("->") && cpp) || isOp("?.") || isOp("::")) {
            next();
            if (isOp("(") && t.v === "?.") { continue; }       // f?.(x)
            if (isOp("[") && t.v === "?.") { continue; }       // a?.[i]
            if (isOp("~")) { next(); }
            var nm = next();
            if (nm.t !== "name") { throw odd(nm); }
            if (nm.v === "template" && peek().t === "name") { nm = next(); }
            a = { k: "member", obj: a, name: nm.v, line: t.line };
          } else if (isOp("[")) {
            next();
            var at = cAssign();
            if (isOp(",")) {                                  // C#: grid[i, j]
              while (accept(",")) { a = { k: "index", obj: a, at: at, line: t.line }; at = cAssign(); }
            }
            expect("]");
            a = { k: "index", obj: a, at: at, line: t.line };
          } else if (isOp("++") || isOp("--")) {
            if (peek().line !== toks[pos - 1].line && js) { break; }
            next();
            a = { k: "incdec", op: t.v, target: a, pre: false, line: t.line };
          } else if (isOp("!") && cs && !isOp("=", 1) && !isOp("==", 1) &&
                     (a.k === "name" || a.k === "member" || a.k === "call" || a.k === "index") &&
                     !startsValue(peek(1))) {
            next();                          // C#'s x! -- it is not null
          } else { break; }
        }
        return a;
      }
      function startsValue(t) {
        return t.t === "name" || t.t === "num" || t.t === "str" || t.t === "fstr" ||
               (t.t === "op" && (t.v === "(" || t.v === "!"));
      }
      function cPrimary() {
        var t = next();
        if (t.t === "num") { return { k: "num", v: t.v, real: t.real, line: t.line }; }
        if (t.t === "str") {
          var s1 = { k: "str", v: t.v, ch: !!t.ch, line: t.line };
          while (cpp && peek().t === "str") { s1 = { k: "str", v: s1.v + next().v, line: t.line }; }
          return s1;
        }
        if (t.t === "fstr") { return atomOfString(t); }
        if (t.t === "regex") { return { k: "regex", v: t.v, flags: t.flags, line: t.line }; }
        if (t.t === "name") {
          if (t.v === "true" || t.v === "false") { return { k: "bool", v: t.v === "true", line: t.line }; }
          if (t.v === "null" || t.v === "nullptr" || t.v === "undefined" || t.v === "NULL" ||
              (js && t.v === "NaN")) {
            return { k: "null", line: t.line };
          }
          if (t.v === "this" || (cs && t.v === "base") || t.v === "super") {
            return { k: "name", v: t.v === "base" ? "super" : t.v, line: t.line };
          }
          if ((t.v === "function" || (t.v === "async" && isName("function"))) && js) {
            if (t.v === "async") { next(); }
            accept("*");
            if (isName()) { next(); }
            var fparams = cParams();
            return { k: "fn", params: fparams, body: cBraces(), line: t.line };
          }
          if (t.v === "default" && cs && isOp("(")) {         // default(int)
            next(); var dt = typeName(); expect(")");
            return { k: "cast", type: dt.name, e: { k: "null", line: t.line }, line: t.line, blank: true };
          }
          if (t.v === "nameof" && cs && isOp("(")) {
            next(); var nx = cAssign(); expect(")");
            return { k: "str", v: pathOf(nx) ? pathOf(nx).split(".").pop() : "", line: t.line };
          }
          if (t.v === "switch" && java && isOp("(")) { return javaSwitchExpr(t); }
          // C#'s from n in xs where n > 1 select n * 2: the same as
          // xs.Where(n => n > 1).Select(n => n * 2), and read as that
          if (t.v === "from" && cs && peek().t === "name" && isName("in", 1)) {
            var each = next().v;
            next();
            var chainQ = cBinary(0);
            var lam = function (body) {
              return { k: "fn", params: [{ name: each, line: t.line }], lambda: true, line: t.line,
                       body: [{ k: "return", value: body, line: t.line }] };
            };
            var callQ = function (name, body) {
              return { k: "call", fn: { k: "member", obj: chainQ, name: name, line: t.line },
                       args: body === undefined ? [] : [lam(body)], line: t.line };
            };
            for (;;) {
              if (accept("where")) { chainQ = callQ("Where", cTernary()); continue; }
              if (accept("orderby")) {
                var key = cTernary(), down = !!accept("descending");
                accept("ascending");
                chainQ = callQ(down ? "OrderByDescending" : "OrderBy", key);
                while (accept(",")) { cTernary(); accept("descending"); accept("ascending"); }
                continue;
              }
              if (accept("select")) { chainQ = callQ("Select", cTernary()); break; }
              if (accept("group")) {
                cTernary();
                expect("by");
                chainQ = callQ("GroupBy", cTernary());
                break;
              }
              break;
            }
            return chainQ;
          }
          if (t.v === "class" && js) { return jsClassExpr(t); }
          return { k: "name", v: t.v, line: t.line };
        }
        if (t.t === "op" && t.v === "(") {
          var e = cAssign();
          if (isOp(",")) {
            var items = [e];
            while (accept(",")) { items.push(cAssign()); }
            expect(")");
            // C#'s (a, b) is a tuple; elsewhere a, b is b, worked out after a
            return cs ? { k: "tuple", items: items, line: t.line } : items[items.length - 1];
          }
          expect(")");
          return { k: "paren", e: e, line: t.line };
        }
        if (t.t === "op" && t.v === "[") {
          if (cpp) { pos--; return cppLambda(); }
          var list = [];
          while (!isOp("]")) {
            if (isOp("...")) { var sp = next(); list.push({ k: "star", e: cAssign(), line: sp.line }); }
            else if (isOp(",")) { list.push({ k: "null", line: t.line }); }
            else { list.push(cAssign()); }
            if (!accept(",")) { break; }
          }
          expect("]");
          return { k: "list", items: list, line: t.line };
        }
        if (t.t === "op" && t.v === "{") {
          // {}: in JavaScript an object with nothing in it yet (the one a
          // file keeps what it shares in is taken up in oneProgram)
          if (js && isOp("}")) { next(); return { k: "obj", line: t.line }; }
          if (js) { pos--; return jsObject(); }
          pos--;
          return cInitList();
        }
        if (t.t === "op" && t.v === "...") { return { k: "star", e: cAssign(), line: t.line }; }
        throw odd(t);
      }
      // { a: 1, b, [key]: v, ...other, f() { } }
      function jsObject() {
        var t = expect("{");
        var keys = [], values = [];
        while (!isOp("}")) {
          if (isOp("...")) {
            next();
            keys.push(null);
            values.push({ k: "dstar", e: cAssign(), line: t.line });
          } else {
            var kt = next(), key;
            if ((kt.v === "get" || kt.v === "set" || kt.v === "async") && kt.t === "name" &&
                (peek().t === "name" || peek().t === "str") && isOp("(", 1)) {
              kt = next();
            }
            if (kt.t === "op" && kt.v === "*") { kt = next(); }
            if (kt.t === "op" && kt.v === "[") { key = cAssign(); expect("]"); }
            else { key = { k: "str", v: String(kt.v), line: kt.line }; }
            if (isOp("(")) {
              var ps = cParams();
              values.push({ k: "fn", params: ps, body: cBraces(), line: kt.line });
            } else if (accept(":")) {
              values.push(cAssign());
            } else {
              if (accept("=")) { cAssign(); }
              values.push({ k: "name", v: String(kt.v), line: kt.line });
            }
            keys.push(key);
          }
          if (!accept(",")) { break; }
        }
        expect("}");
        return { k: "dict", keys: keys, values: values, line: t.line, js: true };
      }
      // [&](int a, int b) { return a < b; }, [=] { ... }
      function cppLambda() {
        var t = expect("[");
        var deep = 1;
        while (deep) {
          var x = next();
          if (x.t === "eof") { throw odd(x); }
          if (x.t === "op" && x.v === "[") { deep++; }
          if (x.t === "op" && x.v === "]") { deep--; }
        }
        var params = isOp("(") ? cParams() : [];
        while (isName("mutable") || isName("constexpr") || isName("noexcept")) { next(); }
        if (accept("->")) { typeName(); }
        return { k: "fn", params: params, body: cBraces(), line: t.line };
      }
      // Java's switch (x) { case 1 -> "one"; default -> "many"; } used
      // as a value
      function javaSwitchExpr(t) {
        expect("(");
        var subject = cAssign();
        expect(")");
        expect("{");
        var cases = [];
        while (!isOp("}")) {
          var c = next();
          var labels = [], isDefault = c.v === "default";
          if (!isDefault) { do { labels.push(cTernary()); } while (accept(",")); }
          if (!accept("->")) { expect(":"); }
          var value;
          if (isOp("{")) {
            var body = cBraces();
            value = { k: "block", body: body, line: c.line };
          } else if (isName("throw")) {
            next(); cAssign(); accept(";");
            value = { k: "null", line: c.line };
          } else {
            value = cAssign();
            accept(";");
          }
          cases.push({ labels: labels, isDefault: isDefault, value: value, line: c.line });
        }
        expect("}");
        return { k: "switchx", subject: subject, cases: cases, line: t.line };
      }
      // C#'s subject switch { 1 => "one", < 5 => "few", _ => "many" }
      function csSwitchExpr(subject) {
        var t = next();
        expect("{");
        var cases = [];
        while (!isOp("}")) {
          var c = peek(), labels = [], isDefault = false;
          if (isName("_")) { next(); isDefault = true; }
          else {
            do {
              if (peek().t === "op" && /^(<|>|<=|>=)$/.test(peek().v)) {
                var rel = next().v;
                labels.push({ k: "rel", op: rel, e: cBinary(C_BIN["<"] + 1), line: c.line });
              } else { labels.push(cBinary(C_BIN["=="] + 1)); }
            } while (accept("or") || accept(","));
          }
          var guard = accept("when") ? cTernary() : null;
          expect("=>");
          var value = cAssign();
          cases.push({ labels: labels, isDefault: isDefault, guard: guard, value: value, line: c.line });
          if (!accept(",")) { break; }
        }
        expect("}");
        return { k: "switchx", subject: subject, cases: cases, line: t.line };
      }
      // class { ... } used as a value: stepped over
      function jsClassExpr(t) {
        if (isName()) { next(); }
        if (accept("extends")) { cUnary(); }
        skipBraces();
        return { k: "null", line: t.line };
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
          if (t.t === "op" && t.v === ">") {
            deep--;
            if (deep <= 0) {
              var after = toks[k + 1];
              return !!after && after.t === "op" && (after.v === "(" || after.v === "::" ||
                     (after.v === "{" && cpp));
            }
            continue;
          }
          if (t.t === "name" || (t.t === "op" && (t.v === "::" || t.v === "," || t.v === "." ||
                                                  t.v === "*" || t.v === "&" || t.v === "?" ||
                                                  t.v === "[" || t.v === "]"))) { continue; }
          return false;
        }
        return false;
      }
      // (a, b) => ..., x => ..., async x => ..., (int a, int b) -> ...
      function arrowAhead() {
        if (!js && !cs && !java) { return false; }
        var at = pos;
        if (js && isName("async") && (isOp("(", 1) || (peek(1).t === "name" && isOp("=>", 2)))) { at++; }
        var first = toks[at];
        if (first.t === "name" && toks[at + 1] && toks[at + 1].t === "op" &&
            (toks[at + 1].v === "=>" || (java && toks[at + 1].v === "->"))) { return true; }
        if (!(first.t === "op" && first.v === "(")) { return false; }
        var deep = 0;
        for (var k = at; k < toks.length; k++) {
          var t = toks[k];
          if (t.t === "op" && (t.v === "(" || t.v === "[" || t.v === "{")) { deep++; }
          if (t.t === "op" && (t.v === ")" || t.v === "]" || t.v === "}")) {
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
      function cArrow() {
        var t = peek(), params;
        if (js && isName("async")) { next(); }
        if (peek().t === "name") {
          params = [{ name: next().v, type: null, dims: 0, ref: false, line: t.line }];
        } else {
          params = lambdaParams();
        }
        if (!accept("=>") && !accept("->")) { throw oops("cm_expected", peek().line, { what: "=>" }); }
        var body = isOp("{") ? cBraces()
                 : [{ k: "return", value: cAssign(), line: t.line }];
        return { k: "fn", params: params, body: body, line: t.line, lambda: true };
      }
      // A lambda's names, typed or not: (a, b), (int a, int b), ({x, y})
      function lambdaParams() {
        expect("(");
        var params = [];
        while (!isOp(")")) {
          var p = peek();
          if (isOp("{") || isOp("[")) {
            var pat = cPrimary();
            params.push({ name: "arg" + (params.length + 1), pattern: pat, type: null, dims: 0, line: p.line });
          } else {
            var words = [];
            while (!isOp(",") && !isOp(")") && !isOp("=")) {
              if (isOp("<")) { skipAngles(); continue; }
              var w = next();
              if (w.t === "eof") { throw odd(w); }
              if (w.t === "name") { words.push(w.v); }
            }
            if (accept("=")) { cAssign(); }
            params.push({ name: words[words.length - 1] || "arg", type: words.length > 1 ? words[0] : null,
                          dims: 0, ref: false, line: p.line });
          }
          if (!accept(",")) { break; }
        }
        expect(")");
        return params;
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
      var MODIFIERS = /^(public|private|protected|internal|static|final|const|readonly|volatile|transient|abstract|virtual|override|sealed|async|inline|extern|constexpr|mutable|unsafe|partial|synchronized|native|strictfp|default|explicit|friend|new|required|implicit)$/;
      function modifiers() {
        var got = {};
        for (;;) {
          if (peek().t === "name" && MODIFIERS.test(peek().v) &&
              !(js && (peek().v === "const" || peek().v === "default" || peek().v === "new")) &&
              !(peek().v === "new" && !isName(undefined, 1)) &&
              !(peek().v === "default" && (isOp(":", 1) || isOp("->", 1))) &&
              !(js && peek().v === "async" && (isOp("(", 1) || isOp("=>", 2)))) {
            got[next().v] = true;
            continue;
          }
          if (java && isOp("@") && peek(1).t === "name" && !isName("interface", 1)) {  // @Override
            next(); next();
            while (isOp(".") && peek(1).t === "name") { next(); next(); }
            if (isOp("(")) { next(); var deep = 1; while (deep) { var x = next(); if (x.t === "eof") { break; } if (x.v === "(") { deep++; } if (x.v === ")") { deep--; } } }
            continue;
          }
          if (cs && isOp("[") && peek(1).t === "name" && attributeAhead()) {   // [Serializable]
            var d2 = 0;
            do { var y = next(); if (y.v === "[") { d2++; } if (y.v === "]") { d2--; } } while (d2 > 0);
            continue;
          }
          if (js && isName("export")) { next(); if (isName("default")) { next(); } continue; }
          break;
        }
        return got;
      }
      function attributeAhead() {
        var deep = 0;
        for (var k = pos; k < toks.length; k++) {
          var t = toks[k];
          if (t.t === "op" && t.v === "[") { deep++; }
          if (t.t === "op" && t.v === "]") {
            deep--;
            if (!deep) {
              var after = toks[k + 1];
              return !!after && (after.t === "name" || (after.t === "op" && after.v === "["));
            }
          }
          if (t.t === "eof" || (t.t === "op" && t.v === ";")) { return false; }
        }
        return false;
      }
      // A type: its name, what it holds (List<String>: its args), how many
      // [] after it, and whether it is a reference or a pointer.
      function typeName(inNew) {
        var t = next();
        if (t.t !== "name") { throw odd(t); }
        var name = t.v;
        if ((name === "unsigned" || name === "signed" || name === "long" || name === "short") &&
            peek().t === "name" && /^(int|long|short|char|double)$/.test(peek().v)) {
          name = next().v;
          if (name === "long" && isName("long")) { next(); }
          if (isName("int")) { next(); }
        }
        if (name === "struct" || name === "enum" || name === "typename" || name === "class") {
          if (peek().t === "name") { name = next().v; }
        }
        while ((isOp("::") || isOp(".")) && peek(1).t === "name") { next(); name += "::" + next().v; }
        var args = [];
        if (isOp("<")) { args = typeArgs(); }
        while (isOp("::") && peek(1).t === "name") { next(); name += "::" + next().v; }
        var dims = 0, ptr = 0;
        while (isOp("[") && (isOp("]", 1) || (isOp(",", 1) && !inNew))) {
          next();
          while (accept(",")) { dims++; }
          expect("]");
          dims++;
        }
        if (isOp("?") && (peek(1).t === "name" || isOp("[", 1))) { next(); }
        var ref = false;
        while (isName("const")) { next(); }
        while (isOp("*")) { next(); ptr++; while (isName("const")) { next(); } }
        if (isOp("&") || isOp("&&")) { next(); ref = true; }
        var varargs = false;
        if (isOp("...")) { next(); dims++; varargs = true; }   // Java: int... nums
        name = name.replace(/^std::/, "");
        // a pointer to letters or numbers is an array of them
        if (ptr && KIND_OF_TYPE[name.toLowerCase()]) { dims += ptr; ptr = 0; }
        return { name: name, dims: dims, ref: ref, args: args, ptr: ptr, varargs: varargs };
      }
      function typeArgs() {
        expect("<");
        var out = [];
        while (!isOp(">")) {
          if (isOp("?")) {
            next();
            if (isName("extends") || isName("super")) { next(); out.push(typeName()); }
            else { out.push({ name: "Object", dims: 0, args: [] }); }
          } else if (peek().t === "num") {
            next();
            out.push({ name: "", dims: 0, args: [] });
          } else {
            out.push(typeName());
          }
          if (!accept(",")) { break; }
        }
        expect(">");
        return out;
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
          else if (t.t === "op" && (t.v === ";" || t.v === "{" || t.v === "=")) { throw odd(t); }
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
          if (peek().t !== "name" || /^(return|new|delete|throw|else|case|goto|using|namespace|class|struct|yield|await|typeof|sizeof)$/.test(peek().v)) {
            return false;
          }
          var declType = typeName();
          // auto [a, b] = ..., var (a, b) = ... -- only ever with auto and var
          if ((cpp && isOp("[") && /^auto$/.test(declType.name)) || (cs && isOp("(") && declType.name === "var")) {
            var d = 0;
            for (var k = pos; k < toks.length; k++) {
              var x = toks[k];
              if (x.t === "op" && (x.v === "[" || x.v === "(")) { d++; }
              else if (x.t === "op" && (x.v === "]" || x.v === ")")) {
                d--;
                if (!d) { var nx = toks[k + 1]; return !!nx && nx.t === "op" && (nx.v === "=" || nx.v === ":"); }
              } else if (x.t !== "name" && !(x.t === "op" && (x.v === "," || x.v === "&"))) { return false; }
            }
            return false;
          }
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
        if (t.t === "op" && t.v === "@") {
          // @staticmethod, @property, @dataclass: kept on what they mark
          var marks = [];
          while (isOp("@")) {
            next();
            var d = pyOr();
            marks.push(pathOf(d.k === "call" ? d.fn : d) || "");
            if (peek().t === "nl") { next(); }
          }
          var marked = pyStatement(col);
          marked.forEach(function (one) {
            if (one.k === "func" || one.k === "class") { one.marks = marks; }
          });
          return marked;
        }
        if (t.t === "name") {
          switch (t.v) {
            case "if": return [pyIf()];
            case "while": {
              next();
              var c = expr();
              var body = pyBlock(col);
              var loop = { k: "while", cond: c, body: body, line: t.line };
              notesSkip();
              if (isName("else")) { next(); loop.orelse = pyBlock(); }
              return [loop];
            }
            case "for": return [pyFor()];
            case "def": return [pyDef()];
            case "class": return [pyClass()];
            case "try": return pyTry();
            case "with": return [pyWith()];
            case "async":
              if (isName("def", 1) || isName("for", 1) || isName("with", 1)) {
                next();
                return pyStatement(col);
              }
              break;
            case "match":
              if (peek(1).t !== "op" || peek(1).v === "(" || peek(1).v === "[" ||
                  peek(1).v === "-" || peek(1).v === "{") {
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
      // class Name(Base): and what is in it -- its functions, and the
      // names set at its top, which the class itself holds.
      function pyClass() {
        var t = next();
        var nm = next();
        if (nm.t !== "name") { throw odd(nm); }
        var bases = [];
        if (accept("(")) {
          bases = pyArgs(")").filter(function (a) { return a.k !== "kw"; })
                             .map(function (a) { return pathOf(a); })
                             .filter(function (b) { return b && !/^(object|ABC|Exception|Enum|IntEnum)$/.test(b); });
        }
        var body = pyBlock();
        return { k: "class", name: nm.v, bases: bases, body: body, line: t.line };
      }
      // with open(name) as f: -- what it opens is given its name, and the
      // block is done
      function pyWith() {
        var t = next();
        var items = [];
        var bracketed = isOp("(") && withBracket();
        if (bracketed) { next(); }
        do {
          if (bracketed && isOp(")")) { break; }
          var e = pyTernary(), as = null;
          if (accept("as")) { as = pyTargetOne(); }
          items.push({ e: e, as: as });
        } while (accept(","));
        if (bracketed) { expect(")"); }
        var body = pyBlock();
        return { k: "with", items: items, body: body, line: t.line };
      }
      // with (open(a) as x, open(b) as y): the bracket holds the list
      function withBracket() {
        var deep = 0;
        for (var k = pos; k < toks.length; k++) {
          var x = toks[k];
          if (x.t === "op" && (x.v === "(" || x.v === "[" || x.v === "{")) { deep++; }
          if (x.t === "op" && (x.v === ")" || x.v === "]" || x.v === "}")) {
            deep--;
            if (!deep) { var after = toks[k + 1]; return !!after && after.t === "op" && after.v === ":"; }
          }
          if (deep === 1 && x.t === "name" && x.v === "as") { return true; }
          if (x.t === "nl" || x.t === "eof") { return false; }
        }
        return false;
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
        var target = pyTarget();
        expect("in");
        var over = exprList();
        var body = pyBlock();
        var node;
        if (target.k === "name" && over.k === "call" && over.fn.k === "name" &&
            over.fn.v === "range" && over.args.length >= 1 && over.args.length <= 3 &&
            over.args.every(function (a) { return a.k !== "kw" && a.k !== "star"; })) {
          node = { k: "range", v: target.v, args: over.args, body: body, line: t.line };
        } else {
          node = { k: "foreach", target: target, over: over, body: body, line: t.line };
        }
        notesSkip();
        if (isName("else")) { next(); node.orelse = pyBlock(); }
        return node;
      }
      function pyDef() {
        var t = next();
        var nm = next();
        if (nm.t !== "name") { throw odd(nm); }
        expect("(");
        var params = [], named = false;
        while (!isOp(")")) {
          if (isOp("/")) { next(); if (!accept(",")) { break; } continue; }
          var star = null;
          if (isOp("*") || isOp("**")) {
            star = next().v;
            if (isOp(",") || isOp(")")) { named = true; accept(","); continue; }   // a bare *
          }
          var p = next();
          if (p.t !== "name") { throw odd(p); }
          var one = { name: p.v, type: null, line: p.line };
          if (star === "*") { one.rest = true; }
          if (star === "**") { one.rest = true; one.named = true; }
          if (named && !star) { one.kwOnly = true; }
          if (accept(":")) { one.type = annotation(expr()); }
          if (accept("=")) { one.dflt = expr(); }
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
        if (!e) { return null; }
        if (e.k === "index") { return annotation(e.obj); }       // list[int]
        if (e.k === "member") { return e.name; }                   // typing.List
        if (e.k === "bin" && e.op === "|") { return annotation(e.a); }   // int | None
        return e.k === "name" ? e.v : e.k === "str" ? e.v : e.k === "null" ? "void" : null;
      }
      function pyTry() {
        var t = next();
        var body = pyBlock();
        var handlers = [], orelse = [], fin = [];
        for (;;) {
          notesSkip();
          if (isName("except")) {
            var h = next();
            accept("*");
            var type = null, name = null;
            if (!isOp(":")) {
              type = pyTernary();
              if (accept("as") || accept(",")) { name = next().v; }
            }
            handlers.push({ type: type, name: name, body: pyBlock(), line: h.line });
            continue;
          }
          if (isName("else")) { next(); orelse = pyBlock(); continue; }
          if (isName("finally")) { next(); fin = pyBlock(); continue; }
          break;
        }
        return [{ k: "try", body: body, handlers: handlers, orelse: orelse, fin: fin, line: t.line }];
      }
      // match / case: each case a pattern, and an if it may carry
      function pyMatch() {
        var t = next();
        var subject = exprList();
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
          var pat = pyPatterns();
          var guard = null;
          if (isName("if")) { next(); guard = pyTernary(); }
          var body = pyBlock(ind.v);
          cases.push({ pat: pat, guard: guard, body: body, line: c.line });
        }
        if (peek().t === "dedent") { next(); }
        return { k: "match", subject: subject, cases: cases, line: t.line };
      }
      // p, q (a sequence without its brackets), or one pattern
      function pyPatterns() {
        var first = pyPattern();
        if (!isOp(",")) { return first; }
        var items = [first];
        while (accept(",")) { if (isOp(":") || isName("if")) { break; } items.push(pyPattern()); }
        return { p: "seq", items: items };
      }
      function pyPattern() {
        var alts = [pyClosedPattern()];
        while (accept("|")) { alts.push(pyClosedPattern()); }
        var pat = alts.length === 1 ? alts[0] : { p: "or", alts: alts };
        if (accept("as")) { pat = { p: "as", pat: pat, name: next().v }; }
        return pat;
      }
      function pyClosedPattern() {
        var t = peek();
        if (t.t === "num" || t.t === "str" || t.t === "fstr" || isOp("-")) {
          return { p: "lit", e: pyBinary(PY_BIN["|"] + 1) };
        }
        if (t.t === "name" && (t.v === "None" || t.v === "True" || t.v === "False")) {
          next();
          return { p: "lit", e: t.v === "None" ? { k: "null", line: t.line }
                                                : { k: "bool", v: t.v === "True", line: t.line } };
        }
        if (isOp("*")) {
          next();
          var rest = next().v;
          return { p: "rest", name: rest === "_" ? null : rest };
        }
        if (isOp("(") || isOp("[")) {
          var close = t.v === "(" ? ")" : "]";
          next();
          var items = [], comma = false;
          while (!isOp(close)) {
            items.push(pyPattern());
            if (!accept(",")) { break; }
            comma = true;
          }
          expect(close);
          if (close === ")" && items.length === 1 && !comma) { return items[0]; }
          return { p: "seq", items: items };
        }
        if (isOp("{")) {
          next();
          var keys = [], pats = [];
          while (!isOp("}")) {
            if (isOp("**")) { next(); next(); if (!accept(",")) { break; } continue; }
            keys.push(pyBinary(PY_BIN["|"] + 1));
            expect(":");
            pats.push(pyPattern());
            if (!accept(",")) { break; }
          }
          expect("}");
          return { p: "map", keys: keys, pats: pats };
        }
        if (t.t === "name") {
          next();
          var path = t.v;
          while (isOp(".") && peek(1).t === "name") { next(); path += "." + next().v; }
          if (accept("(")) {
            var args = [], kws = [];
            while (!isOp(")")) {
              if (peek().t === "name" && isOp("=", 1)) {
                var kn = next().v;
                next();
                kws.push({ name: kn, pat: pyPattern() });
              } else { args.push(pyPattern()); }
              if (!accept(",")) { break; }
            }
            expect(")");
            return { p: "cls", name: path, args: args, kws: kws };
          }
          if (path === "_") { return { p: "any" }; }
          if (path.indexOf(".") >= 0) {
            var bits = path.split("."), e = { k: "name", v: bits[0], line: t.line };
            for (var b = 1; b < bits.length; b++) { e = { k: "member", obj: e, name: bits[b], line: t.line }; }
            return { p: "lit", e: e };
          }
          return { p: "cap", name: path };
        }
        throw odd(t);
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
              return [{ k: t.v, names: names, line: t.line }];
            }
            case "import": case "from": {
              // import helpers, shared as s / from . import helpers: the
              // names the code will reach the other files by
              var words = [];
              while (peek().t !== "nl" && peek().t !== "eof" && !isOp(";")) { words.push(next()); }
              var after = t.v === "import" ? words
                : words.slice(words.map(function (w) { return w.v; }).indexOf("import") + 1);
              var bits = [[]];
              after.forEach(function (w) {
                if (w.t === "op" && w.v === ",") { bits.push([]); } else { bits[bits.length - 1].push(w); }
              });
              bits.forEach(function (bit) {
                var named = bit.filter(function (w) { return w.t === "name"; });
                if (!named.length) { return; }
                var as = named.map(function (w) { return w.v; }).indexOf("as");
                imports.push(as >= 0 && named[as + 1] ? named[as + 1].v : named[0].v);
              });
              if (t.v === "from" && words[0] && words[0].t === "name") { imports.push(words[0].v); }
              return [];
            }
            case "raise": {
              next();
              var what = (peek().t === "nl" || peek().t === "eof") ? null : expr();
              if (accept("from")) { expr(); }
              var named = what && (what.k === "name" ? what.v : what.k === "call" && what.fn.k === "name" ? what.fn.v : "");
              // SystemExit on purpose, anything else by way of an error:
              // either way the program stops there
              return [{ k: "exit", line: t.line, named: named,
                        said: what && what.k === "call" ? what.args[0] || null : null }];
            }
            case "del": {
              next();
              var gone = [];
              do { gone.push(pyOr()); } while (accept(","));
              return [{ k: "del", targets: gone, line: t.line }];
            }
            case "assert": {
              next();
              var test = pyTernary(), why = accept(",") ? pyTernary() : null;
              return [{ k: "assert", test: test, why: why, line: t.line }];
            }
            case "yield": {
              next();
              var from = !!accept("from");
              var given = (peek().t === "nl" || peek().t === "eof" || isOp(";")) ? null : exprList();
              return [{ k: "yield", value: given, from: from, line: t.line }];
            }
            case "type":
              if (peek(1).t === "name" && isOp("=", 2)) {    // type Grid = list[list[int]]
                while (peek().t !== "nl" && peek().t !== "eof") { next(); }
                return [];
              }
              break;
          }
        }
        var first = exprList();
        if (isOp(":") && (first.k === "name" || first.k === "member")) {   // x: int = 5
          next();
          var ann = annotation(expr());
          var val = accept("=") ? exprList() : null;
          if (first.k === "member") {                 // self.x: int = 0
            return val ? [{ k: "assign", target: first, value: val, line: t.line }] : [];
          }
          return [{ k: "decl", names: [{ name: first.v, value: val, line: t.line }],
                    type: ann, line: t.line, annotated: true }];
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
        if (aug.t === "op" && /^(\+|-|\*|\/|\/\/|%|\*\*|&|\||\^|<<|>>)=$/.test(aug.v)) {
          next();
          return [{ k: "aug", target: first, op: aug.v.slice(0, -1), value: exprList(), line: t.line }];
        }
        return [{ k: "expr", e: first, line: t.line }];
      }
      function exprList() {
        var first = py ? pyItem() : expr();
        if (!py || !isOp(",")) { return first; }
        var items = [first];
        while (accept(",")) {
          if (peek().t === "nl" || isOp("=") || isOp(")") || peek().t === "eof" || isOp(";")) { break; }
          items.push(pyItem());
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
      function skipToSemi() {
        var deep = 0;
        while (peek().t !== "eof") {
          var x = next();
          if (x.t === "op" && (x.v === "(" || x.v === "{" || x.v === "[")) { deep++; }
          if (x.t === "op" && (x.v === ")" || x.v === "}" || x.v === "]")) { deep--; }
          if (!deep && x.t === "op" && x.v === ";") { return; }
          if (deep < 0) { pos--; return; }
        }
      }
      function cStatement() {
        var t = peek();
        if (isOp("{")) { return cBraces(); }
        if (isOp(";")) { next(); return []; }
        // outer: for (...) -- a loop a break or continue can name
        if (t.t === "name" && isOp(":", 1) && !isOp("::", 1) &&
            !/^(default|case|public|private|protected|internal)$/.test(t.v)) {
          next(); next();
          var inner = cStatement();
          inner.forEach(function (st) {
            if (/^(while|dowhile|for|foreach)$/.test(st.k)) { st.label = t.v; }
          });
          return inner;
        }
        if (t.t === "name") {
          switch (t.v) {
            case "if": {
              next();
              expect("(");
              var c = cAssign();
              if (cpp && accept(";")) {                  // if (auto x = f(); x > 0)
                var first = { k: "expr", e: c, line: t.line };
                c = cAssign();
                expect(")");
                return [first].concat(cIfRest(t, c));
              }
              expect(")");
              return cIfRest(t, c);
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
              modifiers();
              var target;
              if (isName("var") && isOp("(", 1)) { next(); target = patternHere(); }
              else {
                // a type, where one is written: KeyValuePair<string, int> kv
                var typed0 = pos;
                try {
                  typeName();
                  if (!(peek().t === "name" && isName("in", 1)) && !isOp("(")) { pos = typed0; }
                } catch (e) { pos = typed0; }
                if (isOp("(")) { target = patternHere(); }
                else { var each = next(); target = { k: "name", v: each.v, line: each.line }; }
              }
              expect("in");
              var over = cAssign();
              expect(")");
              return [{ k: "foreach", target: target, over: over, body: cBlockOrOne(), line: t.line }];
            }
            case "switch":
              if (isOp("(", 1)) { return [cSwitch()]; }
              break;
            case "return": {
              next();
              var v = isOp(";") || isOp("}") ? null : cAssign();
              accept(";");
              return [{ k: "return", value: v, line: t.line }];
            }
            case "break": case "continue": {
              next();
              var label = peek().t === "name" && peek().line === t.line ? next().v : null;
              accept(";");
              return [{ k: t.v, label: label, line: t.line }];
            }
            case "try": return cTry();
            case "throw": {
              // an error: what catches it runs, and where nothing does, the
              // program stops there
              next();
              var thrown = !isOp(";") && !isOp("}") ? cAssign() : null;
              accept(";");
              var tt = thrown && stripParens(thrown);
              var tname = tt && tt.k === "new" ? String(tt.type && tt.type.name || "").replace(/^.*::/, "")
                        : tt && tt.k === "call" ? pathOf(tt.fn) : "";
              return [{ k: "exit", line: t.line, named: tname || "",
                        said: tt && (tt.k === "new" || tt.k === "call") ? tt.args[0] || null : tt }];
            }
            case "goto": {
              next();
              var to = next();
              accept(";");
              return [{ k: "note", text: "goto " + to.v, line: t.line }];
            }
            case "class": case "struct": case "interface": case "enum": case "record":
              if (peek(1).t === "name") {
                localTypes.push(typeDecl({}, []));
                return [];
              }
              break;
            case "function":
              if (js) { return [jsFunction()]; }
              break;
            case "async":
              if (js && isName("function", 1)) { next(); return [jsFunction()]; }
              break;
            case "using":
              if (cs && isOp("(", 1)) {                   // using (var r = ...) { }
                next();
                expect("(");
                var held = declAhead() ? cDeclaration(true) : [{ k: "expr", e: cAssign(), line: t.line }];
                expect(")");
                return held.concat(cBlockOrOne());
              }
              if (cs && (isName("var", 1) || declAheadAt(pos + 1))) {   // using var r = ...;
                next();
                return cDeclaration();
              }
              skipToSemi();
              return [];
            case "yield":
              if (cs && (isName("return", 1) || isName("break", 1))) {
                next();
                if (accept("break")) { accept(";"); return [{ k: "return", value: null, line: t.line }]; }
                next();
                var yv = cAssign();
                accept(";");
                return [{ k: "yield", value: yv, line: t.line }];
              }
              if (js) {
                next();
                var star = !!accept("*");
                var jv = isOp(";") ? null : cAssign();
                accept(";");
                return [{ k: "yield", value: jv, from: star, line: t.line }];
              }
              if (java && !isOp("=", 1)) {                // yield in a switch expression's block
                next();
                var yv2 = cAssign();
                accept(";");
                return [{ k: "yield", value: yv2, line: t.line }];
              }
              break;
            case "delete":
              if (cpp) { skipToSemi(); return []; }
              break;
            case "typedef": case "static_assert":
              skipToSemi();
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
      function declAheadAt(at) {
        var save = pos;
        pos = at;
        try { return declAhead(); } finally { pos = save; }
      }
      function cIfRest(t, c) {
        var then = cBlockOrOne();
        var node = { k: "if", cond: c, then: then, orelse: [], line: t.line };
        if (isName("else")) {
          next();
          if (isName("if")) {
            var more = cStatement();
            if (more.length === 1 && more[0].k === "if") { more[0].chained = true; }
            node.orelse = more;
          } else {
            node.orelse = cBlockOrOne();
          }
        }
        return [node];
      }
      // [a, b], {x, y: z}, (a, b): names handed their values by position
      // or by name -- what JavaScript, C++ and C# destructure into
      function patternHere() {
        var t = next();
        var close = t.v === "[" ? "]" : t.v === "{" ? "}" : ")";
        var items = [], keys = [];
        while (!isOp(close)) {
          if (isOp("...")) {
            next();
            items.push({ k: "star", e: { k: "name", v: next().v, line: t.line }, line: t.line });
            keys.push(null);
          } else if (isOp("[") || isOp("{") || isOp("(")) {
            items.push(patternHere());
            keys.push(null);
          } else if (isOp(",")) {
            items.push(null);
            keys.push(null);
          } else {
            if (isOp("&")) { next(); }
            if ((cs || cpp) && peek(1).t === "name") { typeName(); }   // var (int a, string b)
            var nm = next();
            if (nm.t !== "name" && nm.t !== "str") { throw odd(nm); }
            var target = { k: "name", v: String(nm.v), line: nm.line };
            if (close === "}" && accept(":")) {
              target = (isOp("[") || isOp("{")) ? patternHere() : { k: "name", v: next().v, line: nm.line };
            }
            if (accept("=")) { target.dflt = cAssign(); }
            items.push(target);
            keys.push(String(nm.v));
          }
          if (!accept(",")) { break; }
        }
        expect(close);
        if (close === "}") { return { k: "objpat", keys: keys, items: items, line: t.line }; }
        return { k: "tuple", items: items, line: t.line };
      }
      // int a = 1, b;   final double TAX = 0.08;   let x = 5;   var s = "";
      // int marks[5];   vector<int> v(n, 0);   auto [q, r] = ...;   const {x, y} = p;
      // `bare`: the one inside using ( ... ), with no ; after it
      function cDeclaration(bare) {
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
          if (isOp("[") || isOp("{") || (isOp("(") && !js)) {
            var pat = patternHere();
            var pv = accept("=") ? cAssign() : null;
            names.push({ pattern: pat, value: pv, line: t.line });
            continue;
          }
          var nm = next();
          if (nm.t !== "name") { throw odd(nm); }
          var sizes = [];
          while (accept("[")) { sizes.push(isOp("]") ? null : cAssign()); expect("]"); }
          var value = null;
          if (accept("=")) {
            value = cAssign();
          } else if (isOp("(") && !js) {        // C++: int x(5), vector<int> v(n, 0), Point p(1, 2)
            next();
            value = { k: "new", type: type, args: cArgs(")"), direct: true, line: nm.line };
          } else if (isOp("{") && cpp) {        // C++: vector<int> v{1, 2}, Point p{1, 2}
            value = { k: "new", type: type, args: cInitList().items, direct: true, braces: true, line: nm.line };
          }
          names.push({ name: nm.v, value: value, dims: sizes.length + (type ? type.dims : 0),
                       sizes: sizes, line: nm.line });
        } while (accept(","));
        if (isOp(":") && cpp) { next(); cAssign(); }      // a bit field
        if (!bare && !accept(";") && !js) { throw oops("cm_expected", toks[pos - 1].line, { what: ";" }); }
        return [{ k: "decl", type: type ? type.name : null, typeInfo: type, dims: type ? type.dims : 0,
                  konst: konst, names: names, line: t.line }];
      }
      function cFor() {
        var t = next();
        accept("await");
        expect("(");
        // for (x of xs), for (T x : xs), for (const [k, v] of ...), for (auto& [k, v] : m)
        var save = pos;
        modifiers();
        var typed = js ? (isName("let") || isName("const") || isName("var")) : declAhead();
        if (typed || (js && peek().t === "name" && (isName("of", 1) || isName("in", 1)))) {
          if (typed) { if (js) { next(); } else { typeName(); } }
          var target = null;
          if (isOp("[") || isOp("{") || (isOp("(") && cs)) { target = patternHere(); }
          else if (peek().t === "name" && (isOp(":", 1) || isName("of", 1) || isName("in", 1))) {
            var each = next();
            target = { k: "name", v: each.v, line: each.line };
          }
          if (target && (isOp(":") || isName("of") || isName("in"))) {
            var how = next().v;
            var over = cAssign();
            expect(")");
            return { k: "foreach", target: target, over: over, keysOf: js && how === "in",
                     body: cBlockOrOne(), line: t.line };
          }
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
          if (isName("case") || (isName("default") && (isOp(":", 1) || isOp("->", 1)))) {
            next();
            var labels = [], isDefault = c.v === "default", guard = null;
            if (!isDefault) {
              do {
                // case int n:, case Point p:, case null, default ->
                if (isName("default")) { next(); isDefault = true; continue; }
                if (!js && peek().t === "name" && peek(1).t === "name" && !isName("when", 1) &&
                    !isOp(":", 1)) {
                  var ty = typeName();
                  var bound = next().v;
                  labels.push({ k: "typecase", type: ty.name, bind: bound, line: c.line });
                } else {
                  labels.push(cTernary());
                }
              } while (accept(","));
              if (isName("when")) { next(); guard = cTernary(); }
            }
            if (isOp("->")) {
              next();
              arrows = true;
              var one = isOp("{") ? cBraces() : cStatement();
              cases.push({ labels: labels, isDefault: isDefault, guard: guard, body: one, line: c.line });
              cur = null;
              continue;
            }
            expect(":");
            // case 1: case 2: -- two labels on one case, not a case that falls through
            cur = { labels: labels, isDefault: isDefault, guard: guard, body: [], line: c.line };
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
        var held = [];
        if (isOp("(")) {                         // Java: try (Scanner sc = ...) { }
          next();
          while (!isOp(")")) {
            held = held.concat(declAhead() ? cDeclaration(true) : [{ k: "expr", e: cAssign(), line: t.line }]);
            if (!accept(";")) { break; }
          }
          expect(")");
        }
        var body = cBraces();
        var handlers = [], fin = [];
        while (isName("catch")) {
          var h = next(), type = null, name = null;
          if (accept("(")) {
            if (!isOp(")")) {
              modifiers();
              var ty = typeName();
              type = { k: "name", v: ty.name, line: h.line };
              while (accept("|")) { typeName(); }
              if (peek().t === "name") { name = next().v; }
            }
            expect(")");
          }
          if (isName("when")) { next(); expect("("); cAssign(); expect(")"); }
          handlers.push({ type: type, name: name, body: cBraces(), line: h.line });
        }
        if (isName("finally")) { next(); fin = cBraces(); }
        return held.concat([{ k: "try", body: body, handlers: handlers, orelse: [], fin: fin, line: t.line }]);
      }
      function cParams() {
        expect("(");
        var params = [];
        while (!isOp(")")) {
          var p = peek(), ref = false, rest = false;
          if (isName("void") && isOp(")", 1)) { next(); break; }
          if (js && (isOp("{") || isOp("["))) {
            var pat = patternHere();
            var pd = accept("=") ? cAssign() : null;
            params.push({ name: "arg" + (params.length + 1), pattern: pat, dflt: pd, type: null, dims: 0, line: p.line });
            if (!accept(",")) { break; }
            continue;
          }
          if (isOp("...")) { next(); rest = true; }
          while (peek().t === "name" && /^(final|const|ref|out|in|params|let|var|readonly|scoped|this|register)$/.test(peek().v) &&
                 (peek(1).t === "name" || isOp("<", 1) || isOp("[", 1))) {
            var m = next().v;
            if (m === "ref" || m === "out") { ref = true; }
            if (m === "params") { rest = true; }
          }
          var type = null;
          if (!js) {
            type = typeName();
            if (type.ref && !/const/.test(p.v)) { ref = true; }
            if (isName("const")) { next(); }
            if (type.varargs) { rest = true; }
          }
          var nm = peek().t === "name" ? next() : null;
          if (!nm) {
            if (js) { throw oops("cm_other", peek().line, { bit: String(peek().v) }); }
            nm = { v: "arg" + (params.length + 1), line: p.line };        // int f(int, int)
          }
          var dims = type ? type.dims : 0;
          while (accept("[")) { if (!isOp("]")) { cAssign(); } expect("]"); dims++; }
          var dflt = accept("=") ? cAssign() : null;
          params.push({ name: nm.v, type: type ? type.name : null, typeInfo: type,
                        dims: dims, ref: ref, rest: rest, dflt: dflt, line: nm.line });
          if (!accept(",")) { break; }
        }
        expect(")");
        return params;
      }
      function jsFunction() {
        var t = next();
        var gen = !!accept("*");
        var nm = next();
        if (nm.t !== "name") { throw oops("cm_lambda", t.line); }
        var params = cParams();
        var body = helpersOf(lang).test(nm.v) ? skipBraces() : cBraces();
        return { k: "func", name: nm.v, params: params, rtype: null, body: body, line: t.line, gen: gen };
      }

      // ---- classes, and what is in them -----------------------------------
      // A class of any of the four is read into one shape: its name, what it
      // is built on, its fields, its constructors and its methods.  What a
      // chart makes of it -- a record, and functions that take one -- is
      // worked out later (recordsOf), the same for Python's classes.
      var localTypes = [];
      function typeDecl(mods, lead) {
        var kt = next();
        var kind = kt.v;
        if (kind === "enum" && (isName("class") || isName("struct"))) { next(); }
        var nt = next();
        if (nt.t !== "name") { throw odd(nt); }
        var cls = { k: "class", name: nt.v, kind: kind, bases: [], fields: [], methods: [],
                    ctors: [], values: [], inits: [], line: kt.line, lead: lead || [],
                    statik: !!mods.static };
        classes.push(cls.name);
        if (isOp("<")) { skipAngles(); }
        // record Point(int x, int y): the fields, and what makes one
        if (kind === "record" && isOp("(")) {
          var rps = cParams();
          rps.forEach(function (rp) {
            cls.fields.push({ name: rp.name, value: null, type: rp.typeInfo, line: rp.line });
          });
          cls.ctors.push({ params: rps, inits: [], line: kt.line, lead: [], record: true,
                           body: rps.map(function (rp) {
                             return { k: "expr", line: rp.line, e: { k: "assignx", op: "=",
                                      target: { k: "member", obj: { k: "name", v: "this" }, name: rp.name },
                                      value: { k: "name", v: rp.name } } };
                           }) });
        }
        var mode = (cpp || cs) ? "base" : null;
        while (!isOp("{") && !isOp(";") && peek().t !== "eof") {
          if (isName("extends")) { next(); mode = "base"; continue; }
          if (isName("implements")) { next(); mode = "iface"; continue; }
          if (isName("where")) { while (!isOp("{") && peek().t !== "eof") { next(); } break; }
          if (isName("final") || isName("sealed") || isName("permits") || isName("abstract")) { next(); continue; }
          if (isOp(":") || isOp(",")) { next(); continue; }
          if (isName("public") || isName("private") || isName("protected") || isName("virtual")) { next(); continue; }
          if (peek().t === "name") {
            var bt = typeName();
            var bn = bt.name.replace(/^.*::/, "");
            if (mode === "base" && !(cs && /^I[A-Z]/.test(bn)) && !/^(Object|Exception|RuntimeException|Error)$/.test(bn)) {
              cls.bases.push(bn);
            }
            if (isOp("(")) { next(); cArgs(")"); }         // JS: extends mix(A)
            continue;
          }
          next();
        }
        if (accept(";")) { return cls; }                  // declared ahead: class P;
        expect("{");
        if (kind === "enum") { enumBody(cls); } else { classMembers(cls); }
        expect("}");
        // struct P { ... } p1, p2;  -- names declared along with it
        while (cpp && peek().t === "name" && (isOp(",", 1) || isOp(";", 1))) { next(); if (!accept(",")) { break; } }
        accept(";");
        return cls;
      }
      function enumBody(cls) {
        while (!isOp("}") && !isOp(";")) {
          notesBefore(peek().line);
          var nt = next();
          if (nt.t !== "name") { throw odd(nt); }
          var val = null;
          if (accept("=")) { val = cAssign(); }
          if (isOp("(")) { next(); cArgs(")"); }         // Java: RED("r")
          if (isOp("{")) { skipBraces(); }               // Java: a constant with a body
          cls.values.push({ name: nt.v, value: val, line: nt.line });
          if (!accept(",")) { break; }
        }
        if (accept(";")) { classMembers(cls); }
      }
      function classMembers(cls) {
        while (!isOp("}")) {
          if (peek().t === "eof") { throw oops("cm_expected", peek().line, { what: "}" }); }
          var t = peek();
          var lead = notesBefore(t.line);
          if (accept(";")) { continue; }
          if (peek().t === "name" && /^(public|private|protected|internal|signals|slots)$/.test(peek().v) &&
              isOp(":", 1)) {
            next(); next();
            continue;
          }
          if (isName("template")) { next(); skipAngles(); continue; }
          if (isName("using") || isName("typedef") || isName("static_assert") ||
              (isName("friend") && !isOp("(", 2))) {
            skipMember();
            continue;
          }
          var save = pos;
          var mods = modifiers();
          if ((isName("class") || isName("struct") || isName("interface") || isName("enum") ||
               isName("record")) && peek(1).t === "name") {
            localTypes.push(typeDecl(mods, lead));
            continue;
          }
          if (isOp("{")) {                                 // an initializer block
            cls.inits.push({ statik: !!mods.static, body: cBraces() });
            continue;
          }
          if (isOp("~")) { skipMember(); continue; }       // a destructor
          if ((peek().t === "name" && peek().v === cls.name && isOp("(", 1)) ||
              (js && isName("constructor") && isOp("(", 1))) {
            var ct = next();
            var params = cParams();
            var inits = [];
            if (accept(":")) {                             // : x(x), Base(a) / : base(a)
              do {
                var who = typeName();
                var iargs;
                if (isOp("{")) { next(); iargs = cArgs("}"); }
                else { expect("("); iargs = cArgs(")"); }
                inits.push({ name: who.name.replace(/^.*::/, ""), args: iargs });
              } while (accept(","));
            }
            skipQualifiers();
            if (accept(";")) { continue; }
            if (isOp("=")) { skipMember(); continue; }     // = default;
            var cbody;
            if (accept("=>")) { cbody = [{ k: "expr", e: cAssign(), line: ct.line }]; accept(";"); }
            else { cbody = cBraces(); }
            cls.ctors.push({ params: params, body: cbody, inits: inits, line: ct.line, lead: lead });
            continue;
          }
          if (js) {
            var kind = "method";
            if ((isName("get") || isName("set")) && (peek(1).t === "name" || peek(1).t === "str") && isOp("(", 2)) {
              kind = next().v;
            }
            if (isName("async") && (peek(1).t === "name" || isOp("*", 1))) { next(); }
            var gen = !!accept("*");
            var mt = next();
            if (mt.t !== "name" && mt.t !== "str") { throw odd(mt); }
            if (isOp("(")) {
              var mps = cParams();
              cls.methods.push({ k: "func", name: String(mt.v), params: mps, rtype: null, body: cBraces(),
                                 line: mt.line, statik: !!mods.static, kind: kind, gen: gen, lead: lead });
            } else {
              var fv = accept("=") ? cAssign() : null;
              accept(";");
              cls.fields.push({ name: String(mt.v), value: fv, statik: !!mods.static, line: mt.line, lead: lead });
            }
            continue;
          }
          var rtype = typeName();
          if (isName("operator")) { skipMember(); continue; }     // operator overloads
          var nmt = next();
          if (nmt.t !== "name") { throw odd(nmt); }
          if (nmt.v === "operator") { skipMember(); continue; }
          if (cs && isOp("{")) { csProperty(cls, rtype, nmt, mods); continue; }
          if (cs && isOp("=>")) {                          // int Area => w * h;
            next();
            var pe = cAssign();
            accept(";");
            cls.methods.push({ k: "func", name: nmt.v, params: [], body: [{ k: "return", value: pe, line: nmt.line }],
                               rtype: rtype.name, line: nmt.line, statik: !!mods.static, kind: "get", lead: lead });
            continue;
          }
          if (isOp("(") || (isOp("<", 0) && templateAhead())) {
            if (isOp("<")) { skipAngles(); }
            var params2 = cParams();
            skipQualifiers();
            if (accept(";")) { continue; }                  // abstract, or defined further on
            if (isOp("=")) { skipMember(); continue; }      // = 0;
            var body2;
            if (accept("=>")) {
              var be = cAssign();
              accept(";");
              body2 = [rtype.name === "void" ? { k: "expr", e: be, line: nmt.line }
                                             : { k: "return", value: be, line: nmt.line }];
            } else {
              body2 = helpersOf(lang).test(nmt.v) ? skipBraces() : cBraces();
            }
            cls.methods.push({ k: "func", name: nmt.v, params: params2, rtype: rtype.name, rtypeInfo: rtype,
                               rdims: rtype.dims, body: body2, line: nmt.line, statik: !!mods.static,
                               kind: "method", lead: lead });
            continue;
          }
          pos = save;
          var decl = cDeclaration()[0];
          decl.names.forEach(function (one) {
            // C#'s const belongs to the class, as a static does
            cls.fields.push({ name: one.name, value: one.value, sizes: one.sizes, dims: one.dims,
                              statik: !!mods.static || (cs && !!(mods.const || decl.konst && !mods.readonly)),
                              konst: decl.konst, type: decl.typeInfo, line: one.line, lead: lead });
          });
        }
      }
      // const, noexcept, throws X, Y, override: after a method's brackets
      function skipQualifiers() {
        while (peek().t === "name" && /^(const|throws|noexcept|override|final|volatile)$/.test(peek().v)) {
          var q = next().v;
          if (q === "throws") {
            typeName();
            while (accept(",")) { typeName(); }
          }
          if (q === "noexcept" && isOp("(")) { next(); cArgs(")"); }
        }
        if (cpp && isOp("->")) { next(); typeName(); }
      }
      // what a member is, up to its ; or its body, stepped over
      function skipMember() {
        var deep = 0;
        while (peek().t !== "eof") {
          var x = next();
          if (x.t === "op" && (x.v === "(" || x.v === "[")) { deep++; }
          if (x.t === "op" && (x.v === ")" || x.v === "]")) { deep--; }
          if (!deep && x.t === "op" && x.v === ";") { return; }
          if (!deep && x.t === "op" && x.v === "{") {
            pos--;
            skipBraces();
            accept(";");
            return;
          }
        }
      }
      // public int Age { get; set; } = 0;   public int Area { get { ... } }
      function csProperty(cls, rtype, nmt, mods) {
        expect("{");
        var getter = null, setter = null, auto = true, init = null;
        while (!isOp("}")) {
          modifiers();
          var w = next();
          if (w.t === "eof") { throw odd(w); }
          if (isOp("{")) {
            auto = false;
            var b = cBraces();
            if (w.v === "get") { getter = b; } else { setter = b; }
          } else if (accept("=>")) {
            auto = false;
            var ex = cAssign();
            accept(";");
            if (w.v === "get") { getter = [{ k: "return", value: ex, line: w.line }]; }
            else { setter = [{ k: "expr", e: ex, line: w.line }]; }
          } else { accept(";"); }
        }
        expect("}");
        if (accept("=")) { init = cAssign(); accept(";"); }
        if (auto) {
          cls.fields.push({ name: nmt.v, value: init, statik: !!mods.static, type: rtype, line: nmt.line });
          return;
        }
        if (getter) {
          cls.methods.push({ k: "func", name: nmt.v, params: [], body: getter, kind: "get", rtype: rtype.name,
                             statik: !!mods.static, line: nmt.line });
        }
        if (setter) {
          cls.methods.push({ k: "func", name: nmt.v, params: [{ name: "value", type: rtype.name, line: nmt.line }],
                             body: setter, kind: "set", rtype: "void", statik: !!mods.static, line: nmt.line });
        }
      }

      // ---- the top of a file ------------------------------------------
      // What a program is made of before any statement: functions, the
      // names they share, the classes, and the statements a script does.
      function topC() {
        var out = { funcs: [], globals: [], main: [], mainFound: false, types: [], outside: [] };
        function member() {
          var t = peek();
          var lead = notesBefore(t.line);
          if (isOp(";")) { next(); return; }
          if (isName("import") || isName("package") ||
              (isName("using") && !isOp("(", 1) && !(cs && (isName("var", 1) || declAheadAt(pos + 1))))) {
            skipToSemi();
            return;
          }
          if (isName("namespace")) {
            next();
            while (!isOp("{") && !isOp(";")) { next(); }
            if (accept(";")) { return; }
            expect("{");
            while (!isOp("}") && peek().t !== "eof") { member(); }
            expect("}");
            return;
          }
          if (cpp && isName("extern") && peek(1).t === "str") {
            next(); next();
            if (accept("{")) { while (!isOp("}") && peek().t !== "eof") { member(); } expect("}"); }
            return;
          }
          if (isName("template")) { next(); skipAngles(); }
          if (isName("typedef") || isName("static_assert")) { skipToSemi(); return; }
          var save = pos;
          var mods = modifiers();
          if ((isName("class") || isName("struct") || isName("interface") || isName("enum") ||
               isName("record")) && (peek(1).t === "name" || isName("class", 1) || isName("struct", 1))) {
            out.types.push(typeDecl(mods, lead));
            return;
          }
          if (js && (isName("function") || (isName("async") && isName("function", 1)))) {
            if (isName("async")) { next(); }
            out.funcs.push(Object.assign(jsFunction(), { lead: lead }));
            return;
          }
          if (js && !declAhead()) {
            pos = save;
            out.main.push.apply(out.main, lead);
            out.main.push.apply(out.main, cStatement());
            return;
          }
          // C++: Point::Point(...) : x(x) { }, Point::~Point() { } -- made outside the class
          if (cpp && peek().t === "name" && isOp("::", 1) &&
              ((peek(2).t === "name" && peek(2).v === peek().v && isOp("(", 3)) || isOp("~", 2))) {
            var owner = next().v;
            next();
            if (isOp("~")) { skipMember(); return; }
            next();
            var cps = cParams();
            var cinits = [];
            if (accept(":")) {
              do {
                var who = typeName();
                var ia;
                if (isOp("{")) { next(); ia = cArgs("}"); } else { expect("("); ia = cArgs(")"); }
                cinits.push({ name: who.name.replace(/^.*::/, ""), args: ia });
              } while (accept(","));
            }
            skipQualifiers();
            out.outside.push({ owner: owner, ctor: { params: cps, inits: cinits, body: cBraces(), line: t.line, lead: lead } });
            return;
          }
          // a function: a type, a name -- A::f made outside its class -- and a bracket
          var looks = false, fpos = pos;
          try {
            if (!js && peek().t === "name") {
              typeName();
              if (isName("operator")) { looks = "operator"; }
              else {
                var k = 0;
                while (toks[pos + k] && toks[pos + k].t === "name" && toks[pos + k + 1] &&
                       toks[pos + k + 1].t === "op" && toks[pos + k + 1].v === "::") { k += 2; }
                looks = toks[pos + k] && toks[pos + k].t === "name" && toks[pos + k + 1] &&
                        toks[pos + k + 1].t === "op" && toks[pos + k + 1].v === "(" ? "fn"
                      : (k && toks[pos + k] && toks[pos + k].t === "name" ? "field" : false);
              }
            }
          } catch (e) { looks = false; }
          pos = fpos;
          if (looks === "operator") { skipMember(); return; }
          if (looks === "field") {                       // int Counter::count = 0;
            var ftype = typeName();
            var fowner = next().v;
            while (accept("::")) { var nx2 = next(); if (isOp("::")) { fowner = nx2.v; } else { pos--; break; } }
            var fname = next().v;
            var fval = accept("=") ? cAssign() : null;
            accept(";");
            out.outside.push({ owner: fowner, field: { name: fname, value: fval, type: ftype, line: t.line } });
            return;
          }
          if (looks === "fn") {
            var rtype = typeName();
            var nm = next(), within = null;
            while (isOp("::")) { next(); within = nm.v; nm = next(); }
            var params = cParams();
            skipQualifiers();
            if (accept(";")) { return; }         // a prototype: the real one is further on
            var body = helpersOf(lang).test(nm.v) ? skipBraces() : cBraces();
            var fn = { k: "func", name: nm.v, params: params, rtype: rtype.name, rtypeInfo: rtype,
                       rdims: rtype.dims, body: body, line: nm.line, lead: lead,
                       statik: !!mods.static };
            if (within) {
              out.outside.push({ owner: within, method: fn });
              return;
            }
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
            if (js) { out.main.push.apply(out.main, lead); out.main.push(decl); }
            else { out.globals.push(decl); }
            return;
          }
          out.main.push.apply(out.main, lead);
          out.main.push.apply(out.main, cStatement());
          if (!js) { out.looseCode = true; }
        }
        out.head = notesBefore(peek().line);
        while (peek().t !== "eof") { member(); }
        out.trailing = notesBefore(1e9);
        out.types = out.types.concat(localTypes);
        // what C++ made outside its classes, put back into them
        out.outside.forEach(function (one) {
          var cls = out.types.filter(function (c) { return c.name === one.owner; })[0];
          if (!cls) {
            if (one.method) { out.funcs.push(one.method); }
            return;
          }
          if (one.ctor) { cls.ctors.push(one.ctor); }
          if (one.method) {
            var had = cls.methods.filter(function (m) { return m.name === one.method.name && !m.body.length; })[0];
            one.method.statik = !!(had && had.statik) || cls.staticNames && cls.staticNames[one.method.name];
            cls.methods.push(one.method);
          }
          if (one.field) {
            var f = cls.fields.filter(function (x) { return x.name === one.field.name; })[0];
            if (f) { f.value = one.field.value; } else { cls.fields.push(Object.assign(one.field, { statik: true })); }
          }
        });
        // a class's main -- Java's and C#'s -- is the program's
        out.types.forEach(function (cls) {
          cls.methods = cls.methods.filter(function (m) {
            if (m.statik && /^main$/i.test(m.name) && !out.mainFound) {
              out.mainFound = true;
              out.mainClass = cls.name;
              out.main = (m.lead || []).concat(m.body);
              out.mainLine = m.line;
              out.mainArgs = m.params.length ? m.params[0].name : null;
              return false;
            }
            return true;
          });
        });
        return out;
      }
      function topPy() {
        var out = { funcs: [], globals: [], main: [], types: [] };
        // what the file says about itself, above everything in it
        out.head = notesBefore(peek().line);
        while (peek().t !== "eof") {
          var t = peek();
          if (t.t === "dedent" || t.t === "nl") { next(); continue; }
          var lead = notesBefore(t.line);
          var got = pyStatement(0);
          got.forEach(function (one) {
            if (one.k === "func") { one.lead = lead; lead = []; out.funcs.push(one); }
            if (one.k === "class") { one.lead = lead; lead = []; out.types.push(one); classes.push(one.name); }
          });
          out.main.push.apply(out.main, lead);
          out.main.push.apply(out.main, got.filter(function (one) { return one.k !== "func" && one.k !== "class"; }));
        }
        out.trailing = notesBefore(1e9);
        return out;
      }

      return {
        program: function () {
          var got = py ? topPy() : topC();
          got.imports = imports;
          got.classes = classes;
          got.defines = lexed.defines || [];
          return got;
        },
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

    // What each language calls the kinds of thing a name can hold.  A kind
    // is a word: int, real, text, bool; list<int> for a list of whole
    // numbers (set<...> for one that keeps each thing once); map for a
    // table; obj:Point for a record of the program's own; mixed when it
    // holds more than one kind of thing.
    var KIND_OF_TYPE = {
      int: "int", long: "int", short: "int", byte: "int", integer: "int", sbyte: "int",
      uint: "int", ulong: "int", ushort: "int", size_t: "int", int32: "int", int64: "int",
      int16: "int", uint32: "int", uint64: "int", biginteger: "int",
      double: "real", float: "real", decimal: "real", real: "real", single: "real", number: "real",
      string: "text", str: "text", char: "text", character: "text", wstring: "text",
      stringbuilder: "text", stringbuffer: "text",
      bool: "bool", boolean: "bool"
    };
    var LIST_TYPES = /^(List|ArrayList|LinkedList|Vector|vector|Stack|Queue|Deque|ArrayDeque|IList|IEnumerable|ICollection|Collection|Iterable|list|tuple|Tuple|deque|array|stack|queue|priority_queue|PriorityQueue|Array|Sequence|Iterator|IReadOnlyList|ReadOnlyCollection|span|Span|initializer_list)$/;
    var SET_TYPES = /^(Set|HashSet|TreeSet|LinkedHashSet|SortedSet|ISet|set|unordered_set|multiset|frozenset)$/;
    var MAP_TYPES = /^(Map|HashMap|TreeMap|LinkedHashMap|Dictionary|IDictionary|SortedDictionary|SortedList|map|unordered_map|multimap|dict|Dict|Hashtable|defaultdict|OrderedDict|Counter|Mapping|IReadOnlyDictionary)$/;
    var TYPE_WORD = { int: "Integer", real: "Real", text: "String", bool: "Boolean" };
    var knownRecords = Object.create(null);                  // this program's classes, while it is read
    function kindOfType(t) {
      if (!t) { return null; }
      var info = typeof t === "string" ? { name: t, dims: 0, args: [] } : t;
      var name = String(info.name || "")
        .replace(/^(std|System|java\.lang|java\.util|System\.Collections\.Generic|collections|typing)(::|\.)/, "")
        .replace(/^.*::/, "");
      var k = KIND_OF_TYPE[name.toLowerCase()] || null;
      // a class of the program's own, whatever else the name might mean
      if (!k && knownRecords[name]) { k = "obj:" + name; }
      var arg = info.args && info.args[0] ? kindOfType(info.args[0]) : null;
      if (!k && LIST_TYPES.test(name)) { k = "list" + (arg ? "<" + arg + ">" : ""); }
      if (!k && SET_TYPES.test(name)) { k = "set" + (arg ? "<" + arg + ">" : ""); }
      if (!k && MAP_TYPES.test(name)) { k = "map"; }
      if (!k && /^(pair|Pair|KeyValuePair|Entry|Map::Entry|Map\.Entry)$/.test(name)) { k = "list"; }
      if (!k && knownRecords[name]) { k = "obj:" + name; }
      for (var d = 0; d < (info.dims || 0); d++) { k = "list" + (k ? "<" + k + ">" : ""); }
      return k;
    }
    function isListKind(k) { return /^(list|set)/.test(k || ""); }
    function elemKind(k) {
      var m = /^(?:list|set)<(.*)>$/.exec(k || "");
      if (m) { return m[1]; }
      return k === "text" ? "text" : null;
    }
    function mergeKinds(a, b) {
      if (!a) { return b; }
      if (!b || a === b) { return a; }
      if ((a === "int" && b === "real") || (a === "real" && b === "int")) { return "real"; }
      var la = /^(list|set)/.exec(a), lb = /^(list|set)/.exec(b);
      if (la && lb) {
        var e = mergeKinds(elemKind(a), elemKind(b));
        var base = la[1] === lb[1] ? la[1] : "list";
        return base + (e && e !== "mixed" ? "<" + e + ">" : "");
      }
      if (/^obj/.test(a) && /^obj/.test(b)) { return "obj"; }
      return "mixed";
    }
    function recordOf(k) { var m = /^obj:(.+)$/.exec(k || ""); return m ? m[1] : null; }

    // Words the pseudocode keeps for itself.  A name written in the code
    // that is one of them is given a trailing underscore, or `If x > to`
    // would be read as something quite different.
    var KEPT = /^(and|or|not|mod|div|to|downto|then|true|false|step|end|else|ref|new)$/i;
    // What the runner does itself (15-sums.js): a function of the program's
    // own called one of these would take the name from it, so one is
    // given its class's name in front.
    var BUILT_NAMES = /^(sqrt|abs|round|floor|ceiling|ceil|int|integer|length|toupper|tolower|random|pow|min|max|log|log10|exp|sin|cos|tan|atan|atan2|asin|acos|hypot|trunc|sign|real|append|insert|remove|pop|contains|indexof|count|slice|substring|join|split|sum|sort|sorted|reverse|reversed|shuffle|choice|repeat|range|keys|values|items|copy|tostring|replace|trim|startswith|endswith|isdigit|isalpha|isupper|islower|isspace|ord|chr|classof|any|all|newlist|get|clear|extend|isnumber|tolist|unique|zip|enumerate|union|intersection|difference|padleft|padright|find|number|text)$/i;

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
      return String(path || "").replace(/^std\./, "")
        .replace(/^System\.(?=Console|Math|Threading|Convert|Environment|Linq|String|Array)/, "")
        .replace(/^(java\.util|java\.lang)\./, "");
    }
    function stripParens(e) { while (e && e.k === "paren") { e = e.e; } return e; }
    // Every piece of a tree, looked at: fn(node) for each object in it.
    function eachNode(x, fn) {
      if (!x || typeof x !== "object") { return; }
      if (Array.isArray(x)) { x.forEach(function (y) { eachNode(y, fn); }); return; }
      if (fn(x) === false) { return; }
      for (var key in x) {
        if (key !== "line" && key !== "lead" && key !== "chart" && key !== "cls" &&
            key !== "fnNode" && x[key] && typeof x[key] === "object") {
          eachNode(x[key], fn);
        }
      }
    }
    function copyOf(x) {
      if (!x || typeof x !== "object") { return x; }
      if (Array.isArray(x)) { return x.map(copyOf); }
      var o = {};
      for (var key in x) {
        o[key] = (key === "cls" || key === "fnNode" || key === "chart") ? x[key] : copyOf(x[key]);
      }
      return o;
    }

    // ============================================= saying it again ==
    // One program, in one piece of text or in several files: [{name, text}].
    // The files are numbered straight through while they are read, and
    // every line number that comes back -- in a note, or on an error -- is
    // turned back into the file it is in and the line of that file.
    function translate(src, lang) {
      var files = typeof src === "string" ? [{ name: "", text: src }] : (src || []);
      var spans = [], base = 0;
      files.forEach(function (one, k) {
        var rows = String(one.text || "").split(/\r\n?|\n/).length;
        spans.push({ file: k, from: base + 1, to: base + rows });
        base += rows + 1;
      });
      function where(line) {
        for (var k = 0; k < spans.length; k++) {
          if (line >= spans[k].from && line <= spans[k].to) {
            return { file: k, line: line - spans[k].from + 1 };
          }
        }
        return { file: 0, line: line };
      }
      knownRecords = Object.create(null);
      try {
        return translateFiles(files, spans, where, lang);
      } catch (err) {
        if (err.line) {
          var at = where(err.line);
          err.file = at.file;
          err.line = at.line;
        }
        throw err;
      } finally {
        knownRecords = Object.create(null);
      }
    }

    function translateFiles(files, spans, where, lang) {
      var py = lang === "python", js = lang === "javascript";
      var cpp = lang === "cpp", cs = lang === "csharp", java = lang === "java";
      var some = files.map(function (one, k) { return { one: one, k: k }; })
                      .filter(function (x) { return String(x.one.text || "").trim(); });
      if (!some.length) { throw oops("cm_empty", 0); }
      var tops = some.map(function (x) {
        var read = parserFor(lexCode(x.one.text, lang, spans[x.k].from - 1), lang).program();
        read.name = String(x.one.name || "").replace(/^.*[\\/]/, "").replace(/\.\w+$/, "");
        return read;
      });
      // Names reached through another file -- shared.n -- are that file's:
      // set from inside a function, they are set for the whole program, as
      // a Python `global` would say
      var viaModule = Object.create(null);
      var top = oneProgram(tops);
      var notes = [];                        // said beside the pseudocode
      function note(line, bit) {
        if (notes.length < 6 && !notes.some(function (n) { return n.line === line; })) {
          var at = where(line);
          notes.push({ line: at.line, file: at.file,
                       text: say("cm_wont_run", { n: at.line, bit: bit }) });
        }
      }

      // ---- several files, one program -------------------------------------
      // What each file calls the others by -- a module it imports, a class,
      // an object it keeps its shared names in, the file's own name -- is
      // how it gets at their functions and names: Shared.sold, helpers.add(x),
      // receipt.receipt(n).  Read as one program, those are simply sold,
      // add(x) and receipt(n), and the first word goes.  The file that does
      // the work at the top is main; what the others set up at theirs is
      // done first, as importing them would do it.
      function oneProgram(parts) {
        var reached = Object.create(null), imported = Object.create(null), defined = Object.create(null);
        var several = parts.length > 1;
        parts.forEach(function (one) {
          if (one.name) { reached[one.name] = true; }
          one.classes.forEach(function (n) { reached[n] = true; });
          one.imports.forEach(function (n) { imported[n] = true; });
          one.funcs.forEach(function (fn) { defined[fn.name] = true; });
          one.globals.forEach(function (d) { d.names.forEach(function (x) { defined[x.name] = true; }); });
        });
        parts.forEach(function (one) {
          one.main = one.main.filter(function (st) {
            if (st.k === "decl" && st.names.length === 1) {
              var v = stripParens(st.names[0].value);
              // const shared = {}, const shared = require("./shared.js")
              if (v && ((v.k === "obj" && several) || (v.k === "call" && pathOf(v.fn) === "require" &&
                  /^\.{1,2}\//.test(String(v.args[0] && v.args[0].v || ""))))) {
                reached[st.names[0].name] = true;
                return false;
              }
            }
            // module.exports = shared, exports.receipt = receipt -- in
            // JavaScript, where exports is the language's; in C++ it is a name
            if (js && st.k === "expr" && st.e.k === "assignx" &&
                /^(module\.exports|exports)(\.|$)/.test(pathOf(st.e.target) || "")) {
              return false;
            }
            return true;
          });
          one.main.forEach(function (st) {
            var target = st.k === "assign" ? st.target : st.k === "expr" && st.e.k === "assignx" ? st.e.target : null;
            target = stripParens(target);
            if (target && target.k === "name") { defined[target.v] = true; }
            if (target && target.k === "member") { defined[target.name] = true; }
          });
        });
        function unprefix(x) {
          if (!x || typeof x !== "object") { return x; }
          if (Array.isArray(x)) {
            for (var i = 0; i < x.length; i++) { x[i] = unprefix(x[i]); }
            return x;
          }
          if (x.k === "member" && x.obj && x.obj.k === "name" &&
              (reached[x.obj.v] || (imported[x.obj.v] && defined[x.name]))) {
            viaModule[x.name] = true;
            return { k: "name", v: x.name, line: x.line, via: x.obj.v };
          }
          for (var key in x) {
            if (key !== "line" && x[key] && typeof x[key] === "object") { x[key] = unprefix(x[key]); }
          }
          return x;
        }
        parts.forEach(unprefix);
        var chief;
        if (py || js) {
          var best = -1;
          parts.forEach(function (one) {
            var score = 0;
            one.main.forEach(function (st) {
              if (st.k === "note") { return; }
              if (st.k === "if" && py && pathOf(st.cond.a) === "__name__") { score += 1000; return; }
              if (st.k === "expr" && st.e.k === "call" && pathOf(st.e.fn) === "main") { score += 500; return; }
              score += st.k === "assign" || st.k === "decl" ||
                       (st.k === "expr" && st.e.k === "assignx") ? 0.1 : 1;
            });
            if (score > best) { best = score; chief = one; }
          });
        } else {
          chief = parts.filter(function (one) { return one.mainFound; })[0] ||
                  parts.filter(function (one) { return one.main.length; })[0] || parts[0];
        }
        var merged = { funcs: [], globals: [], main: [], head: chief.head || [],
                       trailing: chief.trailing || [], imports: [], classes: [],
                       mainFound: chief.mainFound, types: [], defines: [],
                       mainClass: chief.mainClass || "", mainArgs: chief.mainArgs || null };
        parts.forEach(function (one) {
          merged.funcs = merged.funcs.concat(one.funcs);
          merged.globals = merged.globals.concat(one.globals);
          merged.types = merged.types.concat(one.types || []);
          merged.defines = merged.defines.concat(one.defines || []);
          if (one !== chief) {
            merged.main = merged.main.concat(one.main.filter(function (st) { return st.k !== "note"; }));
          }
        });
        merged.main = merged.main.concat(chief.main);
        return merged;
      }

      // ---- the writer's own helpers, and the devices --------------------
      // A Scanner, a Random, the helper functions the page itself writes
      // into C++ and JavaScript to ask for things: none of them is part of
      // the program being described, only of the way the language had to
      // go about it.
      var HELPERS = helpersOf(lang);
      var devices = Object.create(null);
      function deviceOf(value) {
        value = stripParens(value);
        if (!value) { return null; }
        if (value.k === "new") {
          var ty = String(value.type && value.type.name || value.type || "");
          if (/Scanner|BufferedReader|InputStreamReader|^Console$/.test(ty)) { return "keys"; }
          if (/Random|mt19937|default_random_engine|random_device/.test(ty)) { return "dice"; }
          if (/(distribution|Distribution)$/.test(ty)) { return "dice"; }
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
          if (/^(random\.Random|Random|random\.SystemRandom)$/.test(p)) { return "dice"; }
        }
        return null;
      }
      function dropDevices(list) {
        return list.filter(function (st) {
          if (st.k !== "decl") { return true; }
          st.names = st.names.filter(function (one) {
            var d = deviceOf(one.value);
            if (!d && one.value === null && st.typeInfo &&
                /^(random_device|mt19937|default_random_engine)$/.test(st.typeInfo.name)) { d = "dice"; }
            if (d) { devices[one.name] = d; return false; }
            return true;
          });
          return st.names.length > 0;
        });
      }
      top.globals = dropDevices(top.globals);
      top.funcs = top.funcs.filter(function (fn) { return !HELPERS.test(fn.name); });
      // #define LIMIT 10: a Constant, where what it stands for reads as one
      top.defines.forEach(function (d) {
        var e = null;
        try { e = parserFor(lexCode(d.text, "cpp"), "cpp").expression(); } catch (err) { e = null; }
        if (e) {
          top.globals.unshift({ k: "decl", type: null, konst: true, line: d.line,
                                names: [{ name: d.name, value: e, line: d.line }] });
        }
      });

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
        }) || (top.types || []).some(function (t) { return mentions(t, "main"); });
        if (named && calls.length === 1 && !callsInside && !hasReturnValue(named.body)) {
          var at = main.indexOf(calls[0]);
          main = main.slice(0, at).concat(named.lead || [], named.body, main.slice(at + 1));
          top.funcs = top.funcs.filter(function (fn) { return fn !== named; });
        }
      }
      main = dropDevices(main);
      if (top.mainArgs && mentions(main, top.mainArgs)) {
        main = [{ k: "assign", target: nameNode(top.mainArgs), value: { k: "list", items: [] }, line: 0 }].concat(main);
      }
      function hasReturnValue(list) {
        var found = false;
        eachNode(list, function (x) {
          if (x.k === "fn" || x.k === "func") { return false; }
          if (x.k === "return" && x.value) { found = true; }
        });
        return found;
      }

      // ---- classes: records, and the functions that work on them ---------
      // A class is a kind of record -- a Point holds an x and a y -- and the
      // functions that work on one.  Pseudocode has records (New Point,
      // p.x) and functions, so that is what a class becomes: a function
      // named after the class that makes one, Point(3, 4), and each method
      // a function handed the record first, distance(p, q).  Where several
      // classes have a method of the same name, which one runs depends on
      // the kind of record it is handed, and a function of that name asks
      // classOf(it) and hands it on -- which is what the language was doing
      // out of sight.  What belongs to the class itself -- a static field,
      // a static method, an enum's values -- belongs to the whole program.
      var CLS = Object.create(null), clsOrder = [];
      var selfWord = py ? "self" : "this";
      function low(s) { return String(s).toLowerCase(); }
      function nameNode(v, line) { return { k: "name", v: v, line: line || 0 }; }
      function pyShape(node) {
        var c = { k: "class", name: node.name, kind: "class", bases: node.bases.slice(),
                  fields: [], methods: [], ctors: [], values: [], inits: [], line: node.line,
                  lead: node.lead || [], marks: node.marks || [] };
        var isEnum = node.bases.some(function (b) { return /^(Enum|IntEnum|StrEnum|Flag|IntFlag)$/.test(b); });
        var isData = c.marks.some(function (m) { return /dataclass$/.test(m); }) ||
                     node.bases.some(function (b) { return /^(NamedTuple|TypedDict)$/.test(b); });
        c.isError = node.bases.some(function (b) { return /(Exception|Error)$/.test(b); });
        c.bases = c.bases.filter(function (b) { return !/^(Enum|IntEnum|StrEnum|Flag|IntFlag|NamedTuple|TypedDict|Generic|Protocol|object|ABC)$/.test(b); });
        if (isEnum) { c.kind = "enum"; }
        var dataFields = [];
        node.body.forEach(function (st) {
          if (st.k === "func") {
            var marks = st.marks || [];
            var has = function (re) { return marks.some(function (m) { return re.test(m); }); };
            if (st.name === "__init__") {
              c.ctors.push({ params: st.params.slice(1), body: st.body, inits: [], line: st.line,
                             lead: st.lead || [], self: st.params[0] ? st.params[0].name : "self" });
              return;
            }
            if (has(/^staticmethod$/)) { st.statik = true; c.methods.push(st); return; }
            if (has(/^classmethod$/)) {
              st.statik = true;
              st.clsParam = st.params[0] ? st.params[0].name : "cls";
              st.params = st.params.slice(1);
              c.methods.push(st);
              return;
            }
            st.kind = has(/^property$/) ? "get" : has(/\.setter$/) ? "set" : "method";
            st.self = st.params[0] ? st.params[0].name : "self";
            st.params = st.params.slice(1);
            c.methods.push(st);
            return;
          }
          if (st.k === "assign" && stripParens(st.target).k === "name") {
            if (isEnum) { c.values.push({ name: st.target.v, value: st.value, line: st.line }); }
            else { c.fields.push({ name: st.target.v, value: st.value, statik: true, line: st.line }); }
            return;
          }
          if (st.k === "decl" && st.annotated) {
            st.names.forEach(function (one) {
              if (isData) {
                dataFields.push(one);
                c.fields.push({ name: one.name, value: one.value, statik: false, type: st.type, line: one.line, data: true });
              } else if (one.value) {
                c.fields.push({ name: one.name, value: one.value, statik: true, line: one.line });
              }
            });
            return;
          }
          if (st.k === "class") { top.types.push(st); }
        });
        if (isData && !c.ctors.length) {
          // a dataclass is made from its fields, in the order they are written
          c.ctors.push({ params: dataFields.map(function (f) {
                           return { name: f.name, dflt: f.value || null, line: f.line };
                         }),
                         body: [], inits: [], line: c.line, lead: [], self: "self", fromFields: true });
          c.fields.forEach(function (f) { if (f.data) { f.value = nameNode(f.name, f.line); } });
        }
        return c;
      }
      function addClass(node) {
        var c = node.body ? pyShape(node) : node;
        if (CLS[c.name]) { return; }
        c.self = selfWord;
        CLS[c.name] = c;
        clsOrder.push(c);
      }
      for (var ti = 0; ti < (top.types || []).length; ti++) { addClass(top.types[ti]); }
      clsOrder.forEach(function (c) {
        c.parent = (c.bases || []).filter(function (b) { return CLS[b] && b !== c.name; })[0] || null;
      });
      function ancestry(c) {
        var out = [], seen = {};
        while (c && !seen[c.name]) { seen[c.name] = true; out.push(c); c = c.parent ? CLS[c.parent] : null; }
        return out;
      }
      function descendants(name) {
        return clsOrder.filter(function (c) {
          return ancestry(c).some(function (a) { return a.name === name; });
        });
      }
      function instanceMethods(c) {
        return c.methods.filter(function (m) { return !m.statik && m.body && m.body.length !== undefined; });
      }
      // Python's fields are whatever self.x is set to, anywhere in the class.
      function selfFields(c) {
        var got = {};
        c.fields.forEach(function (f) { if (!f.statik) { got[f.name] = true; } });
        var bodies = c.ctors.map(function (k) { return { body: k.body, self: k.self || c.self }; })
          .concat(instanceMethods(c).map(function (m) { return { body: m.body, self: m.self || c.self }; }));
        bodies.forEach(function (b) {
          eachNode(b.body, function (x) {
            var t = x.k === "assign" || x.k === "aug" ? stripParens(x.target)
                  : x.k === "assignx" ? stripParens(x.target) : null;
            if (t && t.k === "member" && t.obj.k === "name" && t.obj.v === b.self) { got[t.name] = true; }
          });
        });
        return got;
      }
      // Which classes are made anywhere: new Point(...), Point(...) in Python
      // and C++, and a C++ Point p; that makes one by being declared.
      eachNode([top.main, top.funcs, clsOrder.map(function (c) {
        return [c.methods, c.ctors, c.fields, c.inits];
      })], function (x) {
        if (x.k === "new" && x.type && CLS[String(x.type.name || "").replace(/^.*::/, "")]) {
          CLS[String(x.type.name).replace(/^.*::/, "")].made = true;
        }
        if (x.k === "call" && x.fn && x.fn.k === "name" && CLS[x.fn.v] && (py || cpp)) { CLS[x.fn.v].made = true; }
        if (x.k === "decl" && cpp && x.typeInfo && CLS[x.typeInfo.name] && !x.typeInfo.ptr) { CLS[x.typeInfo.name].made = true; }
      });
      clsOrder.forEach(function (c) {
        var own = selfFields(c);
        c.fieldNames = Object.keys(own);
        c.record = c.kind !== "enum" && c.kind !== "interface" && !c.isError &&
                   (c.fieldNames.length > 0 || instanceMethods(c).length > 0 || c.ctors.length > 0 || !!c.made);
      });
      // a class made from a record class is one too
      clsOrder.forEach(function (c) {
        if (!c.record && c.kind !== "enum" && !c.isError &&
            ancestry(c).some(function (a) { return a.record; })) { c.record = true; }
      });
      clsOrder.forEach(function (c) {
        if (c.record) { knownRecords[c.name] = true; }
        c.subclassed = clsOrder.some(function (d) { return d.parent === c.name; });
      });
      function allFields(c) {
        var out = {};
        ancestry(c).forEach(function (a) { (a.fieldNames || []).forEach(function (f) { out[f] = true; }); });
        return out;
      }
      function methodOf(c, name) {                 // the one that runs for a c
        var chain = ancestry(c);
        for (var i = 0; i < chain.length; i++) {
          var hit = chain[i].methods.filter(function (m) {
            return !m.statik && (m.origName || m.name) === name && m.kind !== "set";
          })[0];
          if (hit) { return hit; }
        }
        return null;
      }
      function setterOf(c, name) {
        var chain = ancestry(c);
        for (var i = 0; i < chain.length; i++) {
          var hit = chain[i].methods.filter(function (m) {
            return !m.statik && (m.origName || m.name) === name && m.kind === "set";
          })[0];
          if (hit) { return hit; }
        }
        return null;
      }

      // What belongs to the class itself belongs to the whole program.
      var taken = Object.create(null);
      top.funcs.forEach(function (fn) { taken[low(fn.name)] = true; });
      clsOrder.forEach(function (c) { if (c.record) { taken[low(c.name)] = true; } });
      var enumValues = Object.create(null);
      clsOrder.forEach(function (c) {
        if (c.kind === "enum") {
          var n = 0;
          c.values.forEach(function (v) {
            var value;
            if (py) { value = v.value; }
            else if (java || js || cs) { value = { k: "str", v: v.name, line: v.line }; }
            else {
              if (v.value && stripParens(v.value).k === "num") { n = parseInt(stripParens(v.value).v, 10); }
              value = v.value || { k: "num", v: String(n), line: v.line };
              n++;
            }
            enumValues[v.name] = { cls: c.name };
            top.globals.push({ k: "decl", type: null, konst: true, line: v.line, lead: [],
                               names: [{ name: v.name, value: value, line: v.line }] });
          });
        }
        c.fields.forEach(function (f) {
          if (!f.statik) { return; }
          top.globals.push({ k: "decl", type: f.type ? f.type.name || f.type : null, typeInfo: f.type,
                             konst: !!f.konst, line: f.line, lead: f.lead || [],
                             names: [{ name: f.name, value: f.value, line: f.line, sizes: f.sizes }] });
        });
        c.methods.forEach(function (m) {
          if (!m.statik) { return; }
          m.lead = m.lead || [];
          top.funcs.push(m);
          taken[low(m.name)] = true;
        });
        (c.inits || []).forEach(function (b) { if (b.statik) { main = b.body.concat(main); } });
      });

      // The name each method is called by.
      function free(name) {
        return !taken[low(name)] && !BUILT_NAMES.test(name) && !KEPT.test(name);
      }
      function plainName(m) {
        if (/^(__str__|__repr__|toString|ToString)$/.test(m)) { return "describe"; }
        if (/^__\w+__$/.test(m)) { return m.replace(/^__|__$/g, ""); }
        return m;
      }
      var METHODS = Object.create(null);                            // method name -> { impl: name per class, via }
      clsOrder.forEach(function (c) {
        if (!c.record) { return; }
        instanceMethods(c).forEach(function (m) {
          m.origName = m.name;
          var key = (m.kind === "set" ? "set " : "") + m.name;
          (METHODS[key] = METHODS[key] || { list: [] }).list.push({ cls: c, fn: m });
        });
      });
      Object.keys(METHODS).forEach(function (key) {
        var one = METHODS[key], first = one.list[0].fn;
        var base = first.kind === "set" ? "set" + first.name.charAt(0).toUpperCase() + first.name.slice(1)
                                        : plainName(first.name);
        if (one.list.length === 1 && free(base)) {
          first.name = base;
          taken[low(base)] = true;
          one.single = base;
          return;
        }
        one.list.forEach(function (x) {
          var nm = x.cls.name + "_" + base;
          while (!free(nm)) { nm += "_"; }
          x.fn.name = nm;
          taken[low(nm)] = true;
        });
        if (one.list.length > 1) {
          var disp = free(base) ? base : "call_" + base;
          while (!free(disp)) { disp += "_"; }
          taken[low(disp)] = true;
          one.dispatch = disp;
        } else {
          one.single = one.list[0].fn.name;
        }
      });
      // What a call to method `name` on a record of kind `k` becomes: the
      // function itself, where only one can run, or the one that asks.
      function methodTarget(key, k) {
        var one = METHODS[key];
        if (!one) { return null; }
        if (one.single) { return one.single; }
        var cls = recordOf(k) && CLS[recordOf(k)];
        if (cls) {
          var runs = key.indexOf("set ") === 0 ? setterOf(cls, key.slice(4)) : methodOf(cls, key);
          var overridden = descendants(cls.name).some(function (d) {
            return d !== cls && d.methods.some(function (m) {
              return !m.statik && (m.kind === "set" ? "set " : "") + m.origName === key;
            });
          });
          if (runs && !overridden) { return runs.name; }
        }
        return one.dispatch || null;
      }

      // The functions a record class becomes.
      var madeFns = [];
      function blankFor(type, line) {
        var k = kindOfType(type);
        if (k === "int" || k === "real") { return { k: "num", v: "0", line: line }; }
        if (k === "bool") { return { k: "bool", v: false, line: line }; }
        if (k === "text") { return { k: "str", v: "", line: line }; }
        if (cpp && isListKind(k)) { return { k: "list", items: [], line: line }; }
        if (cpp && k === "map") { return { k: "dict", keys: [], values: [], line: line }; }
        if (cpp && recordOf(k) && type && !type.ptr) {
          return { k: "new", type: type, args: [], line: line };
        }
        return { k: "null", line: line };
      }
      // super().__init__(a), super(a), Parent.__init__(self, a), this(a):
      // the first statement of a constructor handing on to another one
      function chainOf(ctor, c) {
        var first = (ctor.body || []).filter(function (s) { return s.k !== "note"; })[0];
        var e = first && first.k === "expr" ? stripParens(first.e) : null;
        var found = null;
        if (e && e.k === "call") {
          var f = e.fn;
          if (f.k === "name" && (f.v === "super" || f.v === "this")) {
            found = { to: f.v === "super" ? c.parent : c.name, args: e.args, self: f.v === "this" };
          } else if (f.k === "member" && f.name === "__init__" && f.obj.k === "call" &&
                     f.obj.fn.k === "name" && f.obj.fn.v === "super") {
            found = { to: c.parent, args: e.args };
          } else if (f.k === "name" && f.v === "__init__" && f.via && CLS[f.via]) {
            found = { to: f.via, args: e.args.slice(1) };
          } else if (f.k === "member" && f.name === "__init__" && f.obj.k === "name" && CLS[f.obj.v]) {
            found = { to: f.obj.v, args: e.args.slice(1) };
          }
        }
        if (found) { found.stmt = first; return found; }
        (ctor.inits || []).forEach(function (one) {
          if (found) { return; }
          if (one.name === "super" || one.name === "base" || (c.parent && one.name === c.parent)) {
            found = { to: c.parent, args: one.args };
          } else if (one.name === "this" || one.name === c.name) {
            found = { to: c.name, args: one.args, self: true };
          }
        });
        return found;
      }
      clsOrder.forEach(function (c) {
        if (!c.record) { return; }
        c.chains = c.ctors.some(function (k) { var ch = chainOf(k, c); return ch && ch.self; });
      });
      function ctorFor(c, n) {                  // the constructor taking n things
        if (!c.ctors.length) { return null; }
        var fits = c.ctors.filter(function (k) { return fitsArgs(k.params, n); });
        return fits[0] || c.ctors[0];
      }
      function fitsArgs(params, n) {
        var need = params.filter(function (p) { return !p.dflt && !p.rest; }).length;
        var most = params.some(function (p) { return p.rest; }) ? 1e9 : params.length;
        return n >= need && n <= most;
      }
      // One class's constructors: a function that makes a record for each,
      // and -- for a class something else is built on, or whose
      // constructors hand on to one another -- a module that fills one in.
      clsOrder.forEach(function (c) {
        if (!c.record) { return; }
        var self = c.self, line = c.line;
        var ctors = c.ctors.length ? c.ctors : [null];
        var split = c.subclassed || c.chains;
        c.inits = c.inits || [];
        ctors.forEach(function (ctor, i) {
          var params = ctor ? ctor.params.slice() : null;
          if (!ctor && c.parent) {
            // no constructor of its own: Python's is its parent's, taking
            // what that one takes; everywhere else it takes nothing
            var up = ancestry(CLS[c.parent]).filter(function (a) { return a.ctors.length; })[0];
            params = py && up ? up.ctors[0].params.slice() : [];
          }
          params = params || [];
          var suffix = i ? String(params.length === (ctors[0] ? ctors[0].params.length : 0) ? i + 1 : params.length) : "";
          var fill = [];
          var chain = ctor ? chainOf(ctor, c) : null;
          var body = ctor ? ctor.body.filter(function (s) { return !chain || s !== chain.stmt; }) : [];
          if (chain && chain.to && CLS[chain.to] && CLS[chain.to].record) {
            fill.push({ k: "expr", line: line, e: { k: "call", made: "init", cls: CLS[chain.to],
                        fn: nameNode(chain.to), args: chain.args, self: self, line: line } });
          } else if (c.parent && CLS[c.parent].record && (!py || !ctor)) {
            fill.push({ k: "expr", line: line, e: { k: "call", made: "init", cls: CLS[c.parent],
                        fn: nameNode(c.parent), args: py && !ctor ? params.map(function (p) { return nameNode(p.name); }) : [],
                        self: self, line: line } });
          }
          if (!chain || !chain.self) {
            c.fields.forEach(function (f) {
              if (f.statik || f.data && ctor && !ctor.fromFields) { return; }
              var v = f.value;
              if (!v && f.sizes && f.sizes.length && f.sizes[0]) {
                v = { k: "newarr", elem: f.type, dims: f.sizes, line: f.line };
              }
              if (!v && !py && !js) { v = blankFor(f.type, f.line); }
              if (!v) { return; }
              fill.push({ k: "assign", line: f.line || line,
                          target: { k: "member", obj: nameNode(self), name: f.name, line: f.line },
                          value: v });
            });
            (c.inits || []).forEach(function (b) { if (!b.statik) { fill = fill.concat(b.body); } });
          }
          (ctor && ctor.inits || []).forEach(function (one) {
            if (one.name === "super" || one.name === "base" || one.name === "this" ||
                one.name === c.name || one.name === c.parent) { return; }
            fill.push({ k: "assign", line: line,
                        target: { k: "member", obj: nameNode(self), name: one.name, line: line },
                        value: one.args.length === 1 ? one.args[0] : { k: "list", items: one.args, line: line } });
          });
          // Python's self is whatever the constructor called it
          if (ctor && ctor.self && ctor.self !== self) { body = renamed(body, ctor.self, self); }
          fill = fill.concat(body);
          var made = { k: "record", kind: c.name, line: line };
          var lead = ctor ? (ctor.lead || []) : (i ? [] : c.lead || []);
          if (!i && ctor && c.lead) { lead = c.lead.concat(lead); }
          var fparams = params.map(function (p) { return Object.assign({}, p); });
          if (split) {
            var initName = c.name + "_init" + suffix;
            madeFns.push({ k: "func", name: initName, line: ctor ? ctor.line : line, lead: [],
                           params: [{ name: self, line: line, self: c.name }].concat(fparams),
                           body: fill.map(function (s) { return swapReturns(s, null); }), rtype: "void",
                           initOf: c.name, arity: params.length });
            madeFns.push({ k: "func", name: c.name + suffix, line: ctor ? ctor.line : line, lead: lead,
                           params: params.map(function (p) { return Object.assign({}, p); }),
                           body: [{ k: "assign", target: nameNode(self), value: made, line: line },
                                  { k: "expr", line: line, e: { k: "call", fn: nameNode(initName), line: line,
                                    args: [nameNode(self)].concat(params.map(function (p) { return nameNode(p.name); })) } },
                                  { k: "return", value: nameNode(self), line: line }],
                           factoryOf: c.name, arity: params.length });
          } else {
            madeFns.push({ k: "func", name: c.name + suffix, line: ctor ? ctor.line : line, lead: lead,
                           params: fparams,
                           body: [{ k: "assign", target: nameNode(self), value: made, line: line }]
                                   .concat(fill.map(function (s) { return swapReturns(s, nameNode(self)); }))
                                   .concat([{ k: "return", value: nameNode(self), line: line }]),
                           factoryOf: c.name, arity: params.length });
          }
        });
        // and each method, handed the record first
        instanceMethods(c).forEach(function (m) {
          var me = m.self || self;
          m.params = [{ name: me, line: m.line, self: c.name }].concat(m.params);
          m.methodOf = c.name;
          m.lead = m.lead || [];
          madeFns.push(m);
        });
      });
      // The functions that choose which method runs.
      Object.keys(METHODS).forEach(function (key) {
        var one = METHODS[key];
        if (!one.dispatch) { return; }
        var widest = one.list.map(function (x) { return x.fn; })
          .sort(function (a, b) { return b.params.length - a.params.length; })[0];
        var params = widest.params.map(function (p, i) {
          return { name: i ? p.name : selfWord, line: widest.line, self: i ? undefined : "*" };
        });
        var gives = one.list.some(function (x) { return hasReturnValue(x.fn.body); });
        var cases = [];
        clsOrder.forEach(function (c) {
          if (!c.record) { return; }
          var runs = key.indexOf("set ") === 0 ? setterOf(c, key.slice(4)) : methodOf(c, key);
          if (!runs) { return; }
          var call = { k: "call", fn: nameNode(runs.name), line: widest.line,
                       args: params.slice(0, runs.params.length).map(function (p) { return nameNode(p.name); }) };
          cases.push({ labels: [{ k: "str", v: c.name, line: widest.line }], isDefault: false,
                       body: [gives ? { k: "return", value: call, line: widest.line }
                                    : { k: "expr", e: call, line: widest.line }], line: widest.line });
        });
        madeFns.push({ k: "func", name: one.dispatch, line: widest.line, lead: [], params: params,
                       rtype: gives ? null : "void", dispatcher: true,
                       body: [{ k: "switch", noFall: true, line: widest.line, cases: cases,
                                subject: { k: "call", fn: nameNode("classOf"), builtin: true,
                                           args: [nameNode(selfWord)], line: widest.line } }] });
      });
      function renamed(list, from, to) {
        return copyOf(list).map(function (st) {
          eachNode(st, function (x) { if (x.k === "name" && x.v === from) { x.v = to; } });
          return st;
        });
      }
      // A bare return inside a constructor made into a function: it hands
      // back what was made.
      function swapReturns(st, what) {
        if (!what) { return st; }
        if (st.k === "return" && !st.value) { return { k: "return", value: what, line: st.line }; }
        ["then", "orelse", "body"].forEach(function (key) {
          if (Array.isArray(st[key])) { st[key] = st[key].map(function (s) { return swapReturns(s, what); }); }
        });
        (st.cases || []).forEach(function (cs1) { cs1.body = cs1.body.map(function (s) { return swapReturns(s, what); }); });
        return st;
      }
      // Java's, C#'s and C++'s methods say count where they mean this.count
      // and describe() where they mean this.describe(): said out loud here.
      function declaredIn(list, out) {
        eachNode(list, function (x) {
          if (x.k === "decl") { x.names.forEach(function (n) { if (n.name) { out[n.name] = true; } patNames(n.pattern, out); }); }
          if (x.k === "foreach") { patNames(x.target, out); }
          if (x.k === "fn") { x.params.forEach(function (p) { out[p.name] = true; }); }
          if (x.k === "try") { (x.handlers || []).forEach(function (h) { if (h.name) { out[h.name] = true; } }); }
          if (x.k === "name" && x.bind) { out[x.bind] = true; }
        });
        return out;
      }
      function patNames(p, out) {
        if (!p) { return; }
        if (p.k === "name") { out[p.v] = true; }
        (p.items || []).forEach(function (q) { patNames(q && q.k === "star" ? q.e : q, out); });
      }
      function implicitThis(body, params, c) {
        if (py || js) { return body; }
        var locals = {};
        params.forEach(function (p) { locals[p.name] = true; });
        declaredIn(body, locals);
        var fields = allFields(c), methods = {};
        // an abstract one as well: area() in Shape is whichever area this
        // is, which only the classes made from Shape say
        ancestry(c).forEach(function (a) {
          a.methods.forEach(function (m) { if (!m.statik) { methods[m.origName || m.name] = true; } });
        });
        Object.keys(CLS).forEach(function (name) {
          if (ancestry(CLS[name]).indexOf(c) < 0) { return; }
          instanceMethods(CLS[name]).forEach(function (m) { methods[m.origName || m.name] = true; });
        });
        function fix(x, parentKey) {
          if (!x || typeof x !== "object") { return x; }
          if (Array.isArray(x)) { return x.map(function (y) { return fix(y); }); }
          if (x.k === "name" && !x.type && fields[x.v] && !locals[x.v] && !x.via) {
            return { k: "member", obj: nameNode("this", x.line), name: x.v, line: x.line };
          }
          // getClass() inside a method is this one's class
          if (x.k === "call" && x.fn && x.fn.k === "name" && /^(getClass|GetType)$/.test(x.fn.v) &&
              !x.args.length && !methods[x.fn.v] && !locals[x.fn.v]) {
            return { k: "call", fn: { k: "member", obj: nameNode("this", x.line), name: x.fn.v, line: x.line },
                     args: [], line: x.line };
          }
          if (x.k === "call" && x.fn && x.fn.k === "name" && methods[x.fn.v] && !locals[x.fn.v] && !x.fn.via) {
            return { k: "call", fn: { k: "member", obj: nameNode("this", x.line), name: x.fn.v, line: x.line },
                     args: fix(x.args), line: x.line };
          }
          for (var key in x) {
            if (key !== "line" && key !== "cls" && x[key] && typeof x[key] === "object") { x[key] = fix(x[key], key); }
          }
          return x;
        }
        return fix(body);
      }
      madeFns.forEach(function (fn) {
        var c = CLS[fn.methodOf || fn.factoryOf || fn.initOf];
        if (c && !fn.dispatcher) {
          fn.body = implicitThis(fn.body, fn.params.concat(fn.factoryOf ? [{ name: c.self }] : []), c);
        }
      });
      top.funcs = top.funcs.concat(madeFns);

      // ---- functions inside functions ------------------------------------
      // A function written inside another can use the names of the one it
      // is inside.  A chart cannot: every module has names of its own.  So
      // it is taken out and put beside the others, and what it used of the
      // outer one's names is handed to it -- carve(x, y) inside
      // make_maze(w, h) becomes carve(x, y, w, h, grid), and every call to it
      // hands them over.  What it changes of them (Python's nonlocal, or
      // any closure that assigns) it is handed by reference, so the change
      // comes back out.
      function localsOf(fn) {
        var set = Object.create(null), order = [], outer = Object.create(null);
        function add(n) { if (n && !set[n]) { set[n] = true; order.push(n); } }
        function addPat(t) {
          t = stripParens(t);
          if (!t) { return; }
          if (t.k === "name") { add(t.v); }
          else if (t.k === "star") { addPat(t.e); }
          else if (t.k === "tuple" || t.k === "list" || t.k === "objpat") { (t.items || []).forEach(addPat); }
        }
        (fn.params || []).forEach(function (p) { add(p.name); });
        eachNode(fn.body, function (x) {
          if (x.k === "func" || x.k === "fn" || x.k === "class" || x.k === "comp") { return false; }
          if (x.k === "global" || x.k === "nonlocal") { x.names.forEach(function (n) { outer[n] = true; }); }
        });
        eachNode(fn.body, function (x) {
          if (x.k === "func" || x.k === "class") { add(x.name); return false; }
          if (x.k === "fn" || x.k === "comp") { return false; }
          if (x.k === "decl") { x.names.forEach(function (n) { add(n.name); addPat(n.pattern); }); }
          if (x.k === "foreach") { addPat(x.target); }
          if (x.k === "range") { add(x.v); }
          if (x.k === "try") { (x.handlers || []).forEach(function (h) { add(h.name); }); }
          if (x.k === "name" && x.bind) { add(x.bind); }
          if (py) {
            if (x.k === "assign" || x.k === "aug") { addPat(x.target); }
            if (x.k === "assignx") { addPat(x.target); }
            if (x.k === "with") { x.items.forEach(function (i) { addPat(i.as); }); }
          }
        });
        order = order.filter(function (n) { return !outer[n]; });
        Object.keys(outer).forEach(function (n) { delete set[n]; });
        return { set: set, order: order };
      }
      function namesUsedIn(x) {
        var out = Object.create(null);
        eachNode(x, function (y) {
          if (y.k === "name" && !y.via && !y.type) { out[y.v] = true; }
        });
        return out;
      }
      function assignedIn(fn) {
        var out = Object.create(null);
        eachNode(fn.body, function (x) {
          var t = x.k === "assign" || x.k === "aug" || x.k === "assignx" ? stripParens(x.target)
                : x.k === "incdec" ? stripParens(x.target) : null;
          if (t && t.k === "name") { out[t.v] = true; }
          if (x.k === "decl" && !py) { x.names.forEach(function (n) { if (n.name) { out[n.name] = "own"; } }); }
        });
        return out;
      }
      // a function held in a name: def f(...), const f = (...) => ...,
      // f = lambda x: ..., Func<int, int> f = x => ...
      function heldFunction(st) {
        if (st.k === "func") { return st; }
        var v;
        if (st.k === "decl" && st.names.length === 1 && st.names[0].name &&
            (v = stripParens(st.names[0].value)) && v.k === "fn") {
          return { k: "func", name: st.names[0].name, params: v.params, body: v.body, line: st.line,
                   lead: st.lead || [], rtype: null };
        }
        if (st.k === "assign" && stripParens(st.target).k === "name" &&
            (v = stripParens(st.value)) && v.k === "fn") {
          return { k: "func", name: stripParens(st.target).v, params: v.params, body: v.body, line: st.line,
                   lead: [], rtype: null };
        }
        return null;
      }
      var liftedFns = [];
      function liftFrom(host, outer) {
        var mine = localsOf(host);
        var scope = { set: Object.assign(Object.create(null), outer.set, mine.set), order: mine.order.concat(outer.order) };
        var nested = [];
        (function find(list) {
          for (var i = 0; i < list.length; i++) {
            var st = list[i], g = heldFunction(st);
            if (g) {
              nested.push({ g: g, list: list, st: st });
              continue;
            }
            ["then", "orelse", "body", "fin"].forEach(function (k) { if (Array.isArray(st[k])) { find(st[k]); } });
            (st.cases || []).forEach(function (c) { find(c.body); });
            (st.handlers || []).forEach(function (h) { find(h.body); });
          }
        })(host.body);
        if (!nested.length) { return []; }
        nested.forEach(function (n) {
          var at = n.list.indexOf(n.st);
          if (at >= 0) { n.list.splice(at, 1); }
        });
        var inner = [];
        nested.forEach(function (n) { inner = inner.concat(liftFrom(n.g, scope)); });
        var names = Object.create(null);
        nested.forEach(function (n) {
          var nm = n.g.name;
          if (!free(nm)) { nm = host.name ? host.name + "_" + n.g.name : n.g.name + "_"; }
          while (!free(nm)) { nm += "_"; }
          taken[low(nm)] = true;
          names[n.g.name] = { g: n.g, to: nm, captured: [] };
        });
        nested.forEach(function (n) {
          var info = names[n.g.name], own = localsOf(n.g).set, used = namesUsedIn(n.g.body);
          info.own = own;
          info.captured = scope.order.filter(function (v) {
            return used[v] && !own[v] && !names[v] && !funcs0[low(v)];
          });
        });
        // a function that calls another hands on what that one needs
        for (var pass = 0; pass < 12; pass++) {
          var grew = false;
          nested.forEach(function (n) {
            var info = names[n.g.name], used = namesUsedIn(n.g.body);
            Object.keys(names).forEach(function (other) {
              if (other === n.g.name || !used[other]) { return; }
              names[other].captured.forEach(function (v) {
                if (info.captured.indexOf(v) < 0 && !info.own[v]) { info.captured.push(v); grew = true; }
              });
            });
          });
          if (!grew) { break; }
        }
        nested.forEach(function (n) {
          var info = names[n.g.name], g = n.g, changed = assignedIn(g);
          info.captured.sort(function (a, b) { return scope.order.indexOf(a) - scope.order.indexOf(b); });
          info.captured.forEach(function (v) {
            g.params.push({ name: v, line: g.line, captured: true, ref: changed[v] === true });
          });
          g.name = info.to;
          g.liftedFrom = host.name || "main";
        });
        var all = nested.map(function (n) { return n.g; }).concat(inner);
        rewriteCalls([host.body].concat(all.map(function (g) { return g.body; })), names);
        return all;
      }
      function rewriteCalls(where, names) {
        function fix(x) {
          if (!x || typeof x !== "object") { return x; }
          if (Array.isArray(x)) { for (var i = 0; i < x.length; i++) { x[i] = fix(x[i]); } return x; }
          if (x.k === "call" && x.fn && x.fn.k === "name" && names[x.fn.v] && !x.fn.via) {
            var info = names[x.fn.v];
            x.fn = nameNode(info.to, x.fn.line);
            x.args = fix(x.args).concat(info.captured.map(function (v) {
              return { k: "kw", name: v, value: nameNode(v, x.line), line: x.line };
            }));
            x.lifted = info.captured.length;
            return x;
          }
          // a Java functional interface called by its method: f.apply(3)
          if (x.k === "call" && x.fn && x.fn.k === "member" && x.fn.obj.k === "name" &&
              names[x.fn.obj.v] && /^(apply|test|accept|get|run|call|applyAsInt|applyAsDouble|applyAsLong|invoke|Invoke)$/.test(x.fn.name)) {
            var held = names[x.fn.obj.v];
            return { k: "call", fn: nameNode(held.to, x.line), line: x.line,
                     args: fix(x.args).concat(held.captured.map(function (v) {
                       return { k: "kw", name: v, value: nameNode(v, x.line), line: x.line };
                     })) };
          }
          if (x.k === "name" && names[x.v] && !x.via) { return nameNode(names[x.v].to, x.line); }
          if (x.k === "func" || x.k === "class") { return x; }
          for (var key in x) {
            if (key !== "line" && key !== "cls" && x[key] && typeof x[key] === "object") { x[key] = fix(x[key]); }
          }
          return x;
        }
        where.forEach(fix);
      }
      var funcs0 = Object.create(null);
      top.funcs.forEach(function (fn) { funcs0[low(fn.name)] = true; });
      top.funcs.slice().forEach(function (fn) {
        liftedFns = liftedFns.concat(liftFrom(fn, { set: {}, order: [] }));
      });
      liftedFns = liftedFns.concat(liftFrom({ name: "", params: [], body: main }, { set: {}, order: [] }));
      top.funcs = top.funcs.concat(liftedFns);

      // ---- every chart, lowered to what pseudocode can say ----------------
      // Functions of one name -- overloads, told apart by what they take --
      // are given names of their own, and a call goes to the one that takes
      // as many things as it hands over.
      var funcs = Object.create(null), order = [], OVER = Object.create(null);
      top.funcs.forEach(function (fn) {
        var key = low(fn.name);
        if (funcs[key]) {
          OVER[key] = OVER[key] || [funcs[key]];
          var nm = fn.name + (fn.params.length !== funcs[key].params.length ? fn.params.length : OVER[key].length + 1);
          while (funcs[low(nm)]) { nm += "_"; }
          fn.name = nm;
          OVER[key].push(fn);
          funcs[low(nm)] = fn;
          order.push(fn);
          return;
        }
        funcs[key] = fn;
        order.push(fn);
      });
      function userFn(path, nargs) {
        if (!path) { return null; }
        var key = low(path);
        if (OVER[key] && nargs !== undefined) {
          var fit = OVER[key].filter(function (f) { return fitsArgs(f.params, nargs); })[0];
          if (fit) { return fit; }
        }
        return funcs[key] || null;
      }
      function argCount(args) {
        return (args || []).filter(function (a) { return a.k !== "dstar"; }).length;
      }
      // What a call hands each of a function's names: in order, by name
      // (Python's f(x=1)), or what the function says it has when nothing
      // was handed over; and everything past the last into a list, for
      // one that takes any number.
      function callArgs(fn, args) {
        var pos = [], kws = {};
        (args || []).forEach(function (a) {
          if (a.k === "kw") { kws[a.name] = a.value; }
          else if (a.k !== "dstar") { pos.push(a.k === "ref" ? a.e : a); }
        });
        var out = [];
        var named = Object.keys(kws).length > 0;
        var most = fn.params.some(function (p) { return p.rest; }) ? 1e9 : fn.params.length;
        // handed the wrong number of things, it is handed them as they were,
        // for the runner to say so
        if (!named && (pos.length > most || pos.length < fn.params.filter(function (p) {
              return !p.dflt && !p.rest && !p.captured; }).length)) {
          return pos;
        }
        fn.params.forEach(function (p, i) {
          if (p.rest && !p.named) {
            var more = pos.slice(i);
            if (more.length === 1 && stripParens(more[0]).k === "star") { out.push(stripParens(more[0]).e); }
            else { out.push({ k: "list", items: more, line: fn.line }); }
            pos = pos.slice(0, i);
            return;
          }
          if (p.rest && p.named) { out.push({ k: "dict", keys: [], values: [], line: fn.line }); return; }
          if (i < pos.length && !p.kwOnly) { out.push(pos[i]); return; }
          if (kws[p.name]) { out.push(kws[p.name]); return; }
          if (p.dflt) { out.push(p.dflt); return; }
          if (p.captured) { out.push(nameNode(p.name)); return; }
          out.push({ k: "null", line: fn.line });
        });
        return out;
      }

      // A chart: its own names, what it was handed, and the statements.
      function Chart(fn) {
        this.fn = fn;
        this.names = Object.create(null);                    // name -> { kind, first, declared, konst }
        this.list = [];                     // in the order first met
        this.globalsHere = Object.create(null);              // Python: said `global`
        this.params = Object.create(null);
        this.used = fn ? namesUsedIn([fn.body, fn.params]) : namesUsedIn(main);
      }
      Chart.prototype.meet = function (name, how) {
        // a parameter set inside its own function is the parameter still
        if (this.params[name]) {
          if (how && how.kind) {
            this.params[name].kinds = (this.params[name].kinds || []).concat([how.kind]);
          }
          if (how && how.elem) {
            this.params[name].elems = (this.params[name].elems || []).concat([how.loop ? Object.assign({ item: true }, how.elem) : how.elem]);
          }
          return this.params[name];
        }
        var one = this.names[name];
        if (!one) {
          one = this.names[name] = { name: name, kind: null, kinds: [], sets: 0, elems: [],
                                     declared: false, konst: false, loopOnly: true };
          this.list.push(one);
        }
        if (how) {
          if (how.kind) { one.kinds.push(how.kind); }
          if (how.elem) { one.elems.push(how.loop ? Object.assign({ item: true }, how.elem) : how.elem); }
          if (how.declared) { one.declared = true; }
          if (how.konst) { one.konst = true; }
          if (how.type) { one.type = how.type; }
          if (how.typeInfo) { one.typeInfo = how.typeInfo; }
          if (!how.loop) { one.loopOnly = false; }
          if (how.set) { one.sets++; }
        }
        return one;
      };
      // What a list holds, noted against the name -- whichever chart turns
      // out to own it: grid[y][x] = v and names.append(v) do not make grid
      // or names a chart's own, as setting them would.
      function noteElem(ch, name, el) {
        var one = ch.params[name] || ch.names[name];
        if (one) { (one.elems = one.elems || []).push(el); return; }
        ((ch.pending = ch.pending || {})[name] = ch.pending[name] || []).push(el);
      }
      // A name nobody in this chart has used, for something the chart
      // needs to keep for a moment.
      function fresh(ch, base) {
        var name = base, n = 1;
        while (ch.used[name] || ch.names[name] || ch.params[name] || globalChart.names[name] ||
               userFn(name) || KEPT.test(name)) {
          n++;
          name = base + n;
        }
        ch.used[name] = true;
        return name;
      }

      var charts = [], mainChart = new Chart(null);
      var globalChart = new Chart(null);    // what every chart shares
      globalChart.used = {};
      charts.push(mainChart);

      // ---------------------------------------------------------------
      // Lowering: the tree's statements, as the statements pseudocode has.
      //   set input display call if while do for foreach select return
      //   stop wait note break continue
      function lower(list, ch) {
        var out = [];
        list.forEach(function (st) { lowerOne(st, ch, out); });
        return out;
      }
      function lowered(fill) { var o = []; fill(o); return o; }
      // A ? B : C inside a statement: the statement twice, once each way,
      // under an If -- which is what the question mark was saying.
      function firstTernary(e) {
        if (!e || typeof e !== "object") { return null; }
        if (e.k === "cond") { return e; }
        if (e.k === "fn" || e.k === "comp") { return null; }
        for (var key in e) {
          if (key === "line" || key === "cls") { continue; }
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
        for (var key in e) { o[key] = key === "cls" ? e[key] : swapped(e[key], from, to); }
        return o;
      }

      // ---- what has to be done before a statement ------------------------
      // Some of what an expression does cannot be said inside one in
      // pseudocode: asking for something, a list built by a comprehension,
      // x++ and a = b in the middle of a sum.  Each is done on a line of
      // its own just before, and the expression reads the name it left its
      // answer in.  `post` is what comes just after: i++ is read, then done.
      function prep(e, ch, out, post) {
        function walk(x) {
          if (!x || typeof x !== "object") { return x; }
          if (Array.isArray(x)) { return x.map(walk); }
          switch (x.k) {
            case "fn": return liftLambda(x, ch, "lambda");
            case "comp": {
              var tmp = nameNode(fresh(ch, x.kind === "dict" ? "table" : "items"), x.line);
              compInto(tmp, x, ch, out);
              return tmp;
            }
            case "switchx": {
              var sw = nameNode(fresh(ch, "choice"), x.line);
              switchInto(sw, x, ch, out);
              return sw;
            }
            case "assignx": {
              statementExpr(x, ch, out, x.line);
              return copyOf(stripParens(x.target));
            }
            case "incdec": {
              if (x.pre) { statementExpr(x, ch, out, x.line); }
              else if (post) { post.push(x); }
              else { statementExpr(x, ch, out, x.line); }
              return copyOf(stripParens(x.target));
            }
            case "call": {
              var asked = inputOf(x);
              if (asked) {
                var into = nameNode(fresh(ch, answerName(asked.prompt)), x.line);
                ch.meet(into.v, { kind: asked.kind, set: true });
                if (asked.prompt) {
                  out.push({ k: "display", parts: piecesOf(walk(asked.prompt)), line: x.line });
                }
                askFor(into, out, x.line, ch);
                return into;
              }
              var inline = higherOrder(x, ch, out, walk);
              if (inline) { return inline; }
              var tried = triedOut(x, ch, out, walk);
              if (tried) { return tried; }
              break;
            }
            case "new": {
              if (x.init && x.init.k === "fields") {
                var made = nameNode(fresh(ch, low(String(x.type && x.type.name || "item").replace(/^.*::/, ""))), x.line);
                assign(made, { k: "new", type: x.type, args: x.args, line: x.line }, ch, out, x.line);
                x.init.names.forEach(function (f, i) {
                  assign({ k: "member", obj: made, name: f, line: x.line }, x.init.values[i], ch, out, x.line);
                });
                return made;
              }
              break;
            }
            case "bin":
              if ((x.op === "||" || x.op === "??") && stripParens(x.a).k === "call") {
                var gc = stripParens(x.a);
                if (gc.fn.k === "member" && gc.fn.name === "get" && gc.args.length === 1) {
                  return builtinCall("get", [walk(gc.fn.obj), walk(gc.args[0]), walk(x.b)], x.line);
                }
              }
              if ((x.op === "instanceof" || x.op === "is") && x.b && x.b.bind) {
                assign(nameNode(x.b.bind, x.line), x.a, ch, out, x.line);
              }
              break;
          }
          var o = {};
          for (var key in x) {
            o[key] = (key === "line" || key === "cls" || key === "fnNode") ? x[key] : walk(x[key]);
          }
          return o;
        }
        return walk(e);
      }
      // d.TryGetValue(k, out v), int.TryParse(s, out n): the name handed
      // out is set first, and what is asked is whether it could be
      function triedOut(x, ch, out, walk) {
        var p = bare(pathOf(x.fn) || ""), a = x.args;
        var into = a[1] && (a[1].k === "ref" ? stripParens(a[1].e) : null);
        if (!into || !cs) { return null; }
        if (x.fn.k === "member" && x.fn.name === "TryGetValue" && a.length === 2) {
          var table = walk(x.fn.obj), key = walk(a[0]);
          assign(into, builtinCall("get", [table, key, { k: "null" }], x.line), ch, out, x.line);
          return builtinCall("contains", [table, key], x.line);
        }
        if (/^(int|double|decimal|long|float|Int32|Double)\.TryParse$/.test(p) && a.length === 2) {
          var said = walk(a[0]);
          var ok = nameNode(fresh(ch, "valid"), x.line);
          out.push({ k: "set", target: ok, value: builtinCall("isNumber", [said], x.line), line: x.line });
          ch.meet(ok.v, { set: true, kind: "bool" });
          var number = /^(int|long|Int32)/.test(p) ? builtinCall("int", [said], x.line) : builtinCall("real", [said], x.line);
          out.push({ k: "if", cond: ok, line: x.line, orelse: lowered(function (o) { assign(into, num(0), ch, o, x.line); }),
                     then: lowered(function (o) { assign(into, number, ch, o, x.line); }) });
          return ok;
        }
        return null;
      }
      // A good name for an answer: the last word of the question asked.
      function answerName(prompt) {
        var p = stripParens(prompt);
        var words = p && p.k === "str" ? p.v.toLowerCase().match(/[a-z]+/g) : null;
        var skip = /^(enter|type|please|the|a|an|your|what|is|of|in|to|and|or|how|many|much|give|me|input|choose|pick|number|value)$/;
        var good = (words || []).filter(function (w) { return w.length > 1 && !skip.test(w) && !KEPT.test(w); });
        if (good.length) { return good[good.length - 1]; }
        if (words && words.indexOf("number") >= 0) { return "number"; }
        return "answer";
      }
      function lowerPost(post, ch, out) {
        post.forEach(function (x) { statementExpr(x, ch, out, x.line); });
      }
      // An expression made ready: prepared, and whatever it needed done
      // first put before it.
      function ready(e, ch, out) {
        if (!e) { return e; }
        var post = [];
        var got = prep(e, ch, out, post);
        return { e: got, post: post };
      }

      // A function used as a value -- a key to sort by, a callback -- is a
      // function of its own, named for what it is for.
      var lambdasMade = 0;
      function liftLambda(fn, ch, base) {
        if (fn.liftedAs) { return { k: "name", v: fn.liftedAs, line: fn.line, fnRef: true }; }
        var nm = base + (++lambdasMade);
        while (!free(nm)) { nm = base + (++lambdasMade); }
        taken[low(nm)] = true;
        var made = { k: "func", name: nm, params: fn.params.map(function (p) {
                       return { name: p.name, line: fn.line, dflt: p.dflt || null };
                     }), body: fn.body, line: fn.line, lead: [], lambda: true };
        made.params.forEach(function (p) {
          if (fn.params.filter(function (q) { return q.name === p.name; })[0].pattern) { p.pattern = true; }
        });
        funcs[low(nm)] = made;
        order.push(made);
        lateFns.push(made);
        fn.liftedAs = nm;
        return { k: "name", v: nm, line: fn.line, fnRef: true };
      }
      var lateFns = [];

      // ---- statements ------------------------------------------------------
      // x || y where a value is wanted -- JavaScript's and Python's -- is x
      // when x is something, and y when it is not: the question it asks,
      // written as one.  Two yes-or-noes stay the OR they are.
      function valueOrs(e, ch) {
        if (!(py || js) || !e || typeof e !== "object") { return e; }
        if (Array.isArray(e)) { return e.map(function (x) { return valueOrs(x, ch); }); }
        if (e.k === "fn" || e.k === "comp") { return e; }
        if (e.k === "bin" && (e.op === "||" || e.op === "??") && stripParens(e.a).k === "call") {
          // m.get(k) || 0: what is under k, or 0
          var gc = stripParens(e.a);
          if (gc.fn.k === "member" && gc.fn.name === "get" && gc.args.length === 1) {
            return builtinCall("get", [valueOrs(gc.fn.obj, ch), valueOrs(gc.args[0], ch), valueOrs(e.b, ch)], e.line);
          }
        }
        if (e.k === "bin" && (e.op === "||" || e.op === "&&" || e.op === "??")) {
          var a = valueOrs(e.a, ch), b = valueOrs(e.b, ch);
          var ka = kindOf(a, ch), kb = kindOf(b, ch);
          if (e.op !== "??" && ka === "bool" && (kb === "bool" || !kb)) { return { k: "bin", op: e.op, a: a, b: b, line: e.line }; }
          if (e.op !== "??" && !ka && !kb) { return { k: "bin", op: e.op, a: a, b: b, line: e.line }; }
          if (e.op === "||") { return { k: "cond", test: a, a: copyOf(a), b: b, line: e.line }; }
          if (e.op === "&&") { return { k: "cond", test: a, a: b, b: copyOf(a), line: e.line }; }
          return { k: "cond", test: { k: "bin", op: "!=", a: a, b: { k: "null" } }, a: copyOf(a), b: b, line: e.line };
        }
        var o = {};
        for (var key in e) { o[key] = key === "cls" || key === "line" ? e[key] : valueOrs(e[key], ch); }
        return o;
      }
      function lowerOne(st, ch, out) {
        var line = st.line;
        if (st.k === "expr" && stripParens(st.e) && stripParens(st.e).k === "call") {
          st = Object.assign({}, st, { e: valueOrs(st.e, ch) });
        } else if ((st.k === "return" || st.k === "yield") && st.value) {
          st = Object.assign({}, st, { value: valueOrs(st.value, ch) });
        } else if (st.k === "assign" && st.value) {
          st = Object.assign({}, st, { value: valueOrs(st.value, ch) });
        }
        var q = (st.k === "return" || st.k === "expr" || st.k === "yield" || (st.k === "assign" &&
                 stripParens(st.value) && stripParens(st.value).k !== "cond"))
                ? firstTernary(st.k === "assign" ? st.value : st.k === "expr" ? st.e : st.value) : null;
        if (q && !(st.k === "expr" && stripParens(st.e).k === "cond") && !(st.k === "assign" && st.target && firstTernary(st.target))) {
          var tp = ready(q.test, ch, out);
          out.push({ k: "if", cond: tp.e, line: line,
                     then: lowered(function (o) { lowerOne(swapped(st, q, q.a), ch, o); }),
                     orelse: lowered(function (o) { lowerOne(swapped(st, q, q.b), ch, o); }) });
          return;
        }
        switch (st.k) {
          case "note": out.push({ k: "note", text: st.text, line: line }); return;
          case "pass": return;
          case "global":
            st.names.forEach(function (nm) { ch.globalsHere[nm] = true; });
            return;
          case "nonlocal": case "class": return;
          case "func": {
            out.push({ k: "note", text: st.name + "()", line: line });
            return;
          }
          case "try": lowerTry(st, ch, out); return;
          case "with": {
            st.items.forEach(function (it) {
              if (it.as) { assign(it.as, it.e, ch, out, line); }
              else { statementExpr(it.e, ch, out, line); }
            });
            out.push.apply(out, lower(st.body, ch));
            return;
          }
          case "block": out.push.apply(out, lower(st.body, ch)); return;
          case "exit": out.push({ k: "stop", line: line }); return;
          case "break": case "continue":
            out.push({ k: st.k, label: st.label || null, line: line });
            return;
          case "return": {
            if (ch.gen) {                          // a generator's list, handed back
              out.push({ k: "return", value: nameNode(ch.gen), line: line });
              return;
            }
            var rv = st.value ? ready(st.value, ch, out) : null;
            if (rv && rv.post.length) {
              var keep = nameNode(fresh(ch, "result"), line);
              out.push({ k: "set", target: keep, value: rv.e, line: line });
              ch.meet(keep.v, { set: true }).values = [rv.e];
              lowerPost(rv.post, ch, out);
              out.push({ k: "return", value: keep, line: line });
              return;
            }
            out.push({ k: "return", value: rv ? rv.e : null, line: line });
            return;
          }
          case "yield": {
            if (!ch.gen) { return; }
            var gv = st.value ? ready(st.value, ch, out) : null;
            if (st.from) {
              out.push({ k: "set", target: nameNode(ch.gen), line: line,
                         value: { k: "bin", op: "+", a: nameNode(ch.gen), b: gv.e, line: line } });
            } else {
              out.push({ k: "call", line: line, e: builtinCall("append", [nameNode(ch.gen), gv ? gv.e : { k: "null" }], line) });
            }
            return;
          }
          case "decl": {
            (st.names || []).forEach(function (one) {
              if (one.pattern) { assign(one.pattern, one.value, ch, out, line, true); return; }
              var dev = deviceOf(one.value);
              if (dev) { devices[one.name] = dev; return; }
              var ti = st.typeInfo || (st.type ? { name: st.type, dims: st.dims || 0, args: [] } : null);
              if (ti && one.dims && !ti.dims) { ti = Object.assign({}, ti, { dims: one.dims }); }
              var kind = kindOfType(ti);
              ch.meet(one.name, { kind: kind, declared: true, konst: st.konst, type: st.type, typeInfo: ti });
              var value = one.value;
              if (!value && one.sizes && one.sizes.length && one.sizes[0]) {
                value = { k: "newarr", elem: ti ? { name: ti.name, dims: 0, args: ti.args } : null,
                          dims: one.sizes, line: line };
              }
              // C++: vector<int> v; string s; Point p; -- made by being declared
              if (!value && cpp && ti && !ti.ptr && (isListKind(kind) || kind === "map" || recordOf(kind))) {
                value = { k: "new", type: ti, args: [], line: line, direct: true };
              }
              var braced = value && stripParens(value);
              if (kind === "map" && braced && braced.k === "list" && braced.items.every(function (it) {
                    it = stripParens(it);
                    return it && it.k === "list" && it.items.length === 2;
                  })) {
                value = { k: "dict", keys: braced.items.map(function (it) { return stripParens(it).items[0]; }),
                          values: braced.items.map(function (it) { return stripParens(it).items[1]; }), line: line };
              }
              if (value) {
                assign(nameNode(one.name, one.line), value, ch, out, line, true, ti);
              }
            });
            return;
          }
          case "assign":
            assign(st.target, st.value, ch, out, line, false);
            return;
          case "aug":
            augment(st.target, st.op, st.value, ch, out, line);
            return;
          case "expr":
            statementExpr(st.e, ch, out, line, st);
            return;
          case "if": {
            var c = ready(st.cond, ch, out);
            var node = { k: "if", cond: c.e, then: [], orelse: [], chained: !!st.chained, line: line };
            lowerPost(c.post, ch, node.then);
            node.then = node.then.concat(lower(st.then, ch));
            if (c.post.length) { lowerPost(c.post, ch, node.orelse); }
            node.orelse = node.orelse.concat(lower(st.orelse || [], ch));
            if (node.orelse.length && (node.orelse.length > 1 || node.orelse[0].k !== "if")) { node.chained = false; }
            if (node.orelse.length === 1 && node.orelse[0].k === "if" && st.orelse.length === 1 &&
                st.orelse[0].chained) { node.orelse[0].chained = true; }
            out.push(node);
            return;
          }
          case "while": {
            var cond = stripParens(st.cond);
            if ((cond.k === "bool" && cond.v) || (cond.k === "num" && cond.v !== "0")) {
              var forever = foreverLoop(st.body.slice(), ch, line, st.label);
              if (forever.k === "block") { out.push.apply(out, forever.body); }
              else { out.push(forever); }
              return;
            }
            var before = [];
            var wc = ready(st.cond, ch, before);
            out.push.apply(out, before);
            var wbody = [];
            lowerPost(wc.post, ch, wbody);
            wbody = wbody.concat(lower(st.body, ch));
            // what the test needed done first, done again before each test
            var again = [];
            if (before.length || wc.post.length) {
              var redo = [];
              ready(st.cond, ch, redo);
              again = redo.map(function (s) { s.always = true; return s; });
            }
            out.push({ k: "while", cond: truth(wc.e, ch), body: wbody.concat(again), line: line,
                       label: st.label || null, orelse: st.orelse ? lower(st.orelse, ch) : null });
            return;
          }
          case "dowhile": {
            var dbody = lower(st.body, ch), was = dbody.length;
            var dc = ready(st.cond, ch, dbody);
            dbody.slice(was).forEach(function (s) { s.always = true; });
            out.push({ k: "do", cond: truth(dc.e, ch), until: false, body: dbody, line: line, label: st.label || null });
            return;
          }
          case "range": {
            var a = st.args, from = a.length > 1 ? a[0] : { k: "num", v: "0", line: line };
            var to = a.length > 1 ? a[1] : a[0], by = a[2] || null;
            var down = by && isNegative(by);
            var counter = st.v === "_" ? fresh(ch, "i") : st.v;
            ch.meet(counter, { kind: "int", set: true, loop: true });
            var fr = ready(from, ch, out), tr = ready(to, ch, out), br = by ? ready(by, ch, out) : null;
            out.push({ k: "for", v: counter, from: fr.e, to: offBy(tr.e, down ? 1 : -1), by: br ? br.e : null,
                       body: lower(st.body, ch), line: line, label: st.label || null,
                       orelse: st.orelse ? lower(st.orelse, ch) : null });
            return;
          }
          case "for":
            out.push.apply(out, cFor(st, ch));
            return;
          case "foreach":
            lowerForeach(st, ch, out);
            return;
          case "switch":
            out.push.apply(out, lowerSwitch(st, ch));
            return;
          case "match":
            lowerMatch(st, ch, out);
            return;
          case "del":
            st.targets.forEach(function (t) {
              t = stripParens(t);
              if (t.k === "index") {
                var obj = ready(t.obj, ch, out).e, at = ready(t.at, ch, out).e;
                var fnName = kindNow(obj) === "map" || !isListKind(kindNow(obj)) && stripParens(at).k === "str" ? "remove" : "pop";
                if (fnName === "pop" && kindNow(obj) !== "map" && !isListKind(kindNow(obj))) { fnName = "remove"; }
                if (isListKind(kindNow(obj))) { fnName = "pop"; }
                out.push({ k: "call", e: builtinCall(fnName, [obj, at], line), line: line });
              } else if (t.k === "slice") {
                out.push({ k: "note", text: "del " + (pathOf(t.obj) || "") + "[:]", line: line });
              }
            });
            return;
          case "assert": {
            var ac = ready(st.test, ch, out);
            var stopHere = [];
            if (st.why) { stopHere.push({ k: "display", parts: piecesOf(st.why), line: line }); }
            stopHere.push({ k: "stop", line: line });
            out.push({ k: "if", cond: { k: "un", op: "!", a: ac.e, line: line }, then: stopHere, orelse: [], line: line });
            return;
          }
        }
        out.push({ k: "note", text: String(st.k), line: line });
      }

      // A test that is a list, a table or a word: true when there is
      // something in it, which is what the language meant by writing it
      // alone (while queue:, if name:).
      function truth(e, ch) {
        var s = stripParens(e);
        if (!s) { return e; }
        if (s.k === "un" && s.op === "!") {
          var inner = stripParens(s.a), ik = kindOf(inner, ch);
          if (isListKind(ik) || ik === "map" || (ik === "text" && py)) {
            return { k: "bin", op: "==", a: builtinCall("length", [inner], s.line), b: { k: "num", v: "0" }, line: s.line };
          }
          return e;
        }
        var k = kindOf(s, ch);
        if (isListKind(k) || k === "map" || (k === "text" && py && s.k === "name")) {
          return { k: "bin", op: ">", a: builtinCall("length", [s], s.line), b: { k: "num", v: "0" }, line: s.line };
        }
        if (s.k === "bin" && (s.op === "&&" || s.op === "||")) {
          return { k: "bin", op: s.op, a: truth(s.a, ch), b: truth(s.b, ch), line: s.line };
        }
        return e;
      }

      // try: what it tries is what it does.  The part that runs when
      // something goes wrong has nothing in a chart to set it off -- except
      // the one every course teaches, a number typed in that is not a
      // number: that is a question the chart can ask (isNumber).
      function lowerTry(st, ch, out) {
        var box = caughtThrows(st, ch);
        if (box) {
          out.push({ k: "trybox", label: box.label, body: lower(box.body.concat(st.orelse || []), ch), line: st.line });
          out.push.apply(out, lower(st.fin || [], ch));
          return;
        }
        var body = lower(st.body, ch);
        var caught = (st.handlers || []).filter(function (h) {
          var ty = pathOf(h.type) || "";
          return !h.type || /^(ValueError|Exception|NumberFormatException|FormatException|InputMismatchException|invalid_argument|exception|std\.invalid_argument|std\.exception|Error|RuntimeException|SystemException|BaseException)$/.test(ty.replace(/^.*\./, "")) ||
                 (stripParens(h.type).k === "tuple");
        })[0];
        // age = int(text): a word made a number, which fails when it is not one
        var firstSrc = st.body.filter(function (s) { return s.k !== "note"; })[0];
        var made = firstSrc && firstSrc.k === "assign" ? firstSrc.value
                 : firstSrc && firstSrc.k === "decl" && firstSrc.names.length === 1 ? firstSrc.names[0].value : null;
        made = stripParens(made);
        if (caught && made && made.k === "call" && made.args.length >= 1 && !inputOf(made) &&
            /^(int|float|Integer\.parseInt|Double\.parseDouble|int\.Parse|double\.Parse|Convert\.ToInt32|Convert\.ToDouble|stoi|stod|Number|parseInt|parseFloat|Integer\.valueOf|decimal\.Parse)$/.test(bare(pathOf(made.fn) || ""))) {
          var tested = [];
          var what = ready(made.args[0], ch, tested).e;
          out.push.apply(out, tested);
          out.push({ k: "if", cond: builtinCall("isNumber", [what], st.line),
                     then: body.concat(lower(st.orelse || [], ch)), orelse: lower(caught.body, ch), line: st.line });
          out.push.apply(out, lower(st.fin || [], ch));
          return;
        }
        var firstAsk = body.filter(function (s) { return s.k === "input"; })[0];
        var asked = firstAsk && stripParens(firstAsk.target).k === "name" ? stripParens(firstAsk.target).v : null;
        var one = asked && (ch.names[asked] || ch.params[asked] || globalChart.names[asked]);
        var numeric = one && /^(int|real)$/.test(one.kinds && one.kinds[one.kinds.length - 1] || one.kind || "");
        if (caught && numeric) {
          var at = body.indexOf(firstAsk);
          var rest = body.slice(at + 1).concat(lower(st.orelse || [], ch));
          var handled = lower(caught.body, ch);
          out.push.apply(out, body.slice(0, at + 1));
          out.push({ k: "if", cond: builtinCall("isNumber", [nameNode(asked)], st.line), then: rest,
                     orelse: handled, line: st.line });
          out.push.apply(out, lower(st.fin || [], ch));
          return;
        }
        out.push.apply(out, body);
        out.push.apply(out, lower(st.orelse || [], ch));
        // what the code does when something goes wrong, said beside the
        // chart as the pseudocode it would be: nothing in a chart sets it off
        (st.handlers || []).forEach(function (h) {
          var ty = pathOf(h.type) || (h.type && stripParens(h.type).k === "tuple"
                   ? stripParens(h.type).items.map(pathOf).join(", ") : TXT.cm_an_error || "error");
          out.push({ k: "commented", head: say("cm_if_wrong", { what: ty }), body: lower(h.body, ch), line: h.line });
        });
        out.push.apply(out, lower(st.fin || [], ch));
      }

      // An error thrown inside the try that catches it -- raise ValueError,
      // throw new Exception("...") -- is the catch's code, and then out of
      // the try: a way out of the middle, done the way a break is done.
      var triesMade = 0;
      function caughtThrows(st, ch) {
        var handlers = st.handlers || [];
        if (!handlers.length) { return null; }
        var label = "try" + (++triesMade), any = false;
        function handlerFor(x) {
          var named = String(x.named || "").replace(/^.*\./, "");
          return handlers.filter(function (h) {
            var types = h.type ? (stripParens(h.type).k === "tuple" ? stripParens(h.type).items : [h.type]) : [];
            if (!types.length) { return true; }
            return types.some(function (t) {
              var tn = String(pathOf(t) || "").replace(/^.*\./, "");
              return tn === named || /^(Exception|BaseException|Throwable|exception|std::exception|Error|RuntimeException|SystemException)$/.test(tn) ||
                     (named === "" && /Exception|Error/.test(tn));
            });
          })[0] || null;
        }
        function swap(list) {
          return list.map(function (x) {
            if (x.k === "exit") {
              var h = handlerFor(x);
              if (!h) { return x; }
              any = true;
              var told = h.name ? [{ k: "assign", target: nameNode(h.name, x.line),
                                     value: x.said || { k: "str", v: x.named || "" }, line: x.line }] : [];
              return { k: "block", line: x.line, body: told.concat(copyOf(h.body), [{ k: "break", label: label, line: x.line }]) };
            }
            if (x.k === "func" || x.k === "fn" || x.k === "class" || x.k === "try") { return x; }
            var o = Object.assign({}, x);
            ["then", "orelse", "body", "fin"].forEach(function (k) { if (Array.isArray(o[k])) { o[k] = swap(o[k]); } });
            if (o.cases) { o.cases = o.cases.map(function (c) { return Object.assign({}, c, { body: swap(c.body) }); }); }
            return o;
          });
        }
        var body = swap(st.body);
        return any ? { label: label, body: body } : null;
      }

      // while True: ... with the way out at the top or the foot.
      function foreverLoop(body, ch, line, label) {
        function breakIf(st) {
          if (!st || st.k !== "if" || (st.orelse || []).length) { return null; }
          var then = st.then.filter(function (s) { return s.k !== "note"; });
          return then.length === 1 && then[0].k === "break" && !then[0].label ? st.cond : null;
        }
        var real = body.filter(function (s) { return s.k !== "note"; });
        var last = real[real.length - 1], first = real[0];
        if (breakIf(last) && real.length > 1 && !findBreak(body.slice(0, body.lastIndexOf(last)))) {
          var inner = body.slice(0, body.lastIndexOf(last));
          var ib = lower(inner, ch);
          var uc = ready(breakIf(last), ch, ib);
          return { k: "do", cond: truth(uc.e, ch), until: true, body: ib, line: line, label: label };
        }
        if (breakIf(first) && !findBreak(body.slice(body.indexOf(first) + 1))) {
          var rest = body.slice(body.indexOf(first) + 1);
          return { k: "while", cond: { k: "un", op: "!", a: truth(breakIf(first), ch), line: line },
                   body: lower(rest, ch), line: line, label: label };
        }
        // The way out in the middle: what comes before it is done once to
        // start with and again at the foot of every time round -- the
        // priming read every textbook teaches, which is what this was.
        var mid = real.filter(breakIf);
        if (mid.length === 1) {
          var at = body.indexOf(mid[0]);
          var before = body.slice(0, at), after = body.slice(at + 1);
          if (!findBreak(before) && !findBreak(after) && !findContinue(before) && !findContinue(after)) {
            return { k: "block", line: line, body: lower(before, ch).concat([{
              k: "while", cond: { k: "un", op: "!", a: truth(breakIf(mid[0]), ch), line: line }, line: line,
              label: label, body: lower(after, ch).concat(lower(before, ch)) }]) };
          }
        }
        return { k: "while", cond: { k: "bool", v: true, line: line }, forever: true,
                 body: lower(body, ch), line: line, label: label };
      }
      function findBreak(list) {
        for (var i = 0; i < list.length; i++) {
          var st = list[i];
          if (st.k === "break") { return st; }
          if (st.k === "if") {
            var got = findBreak(st.then) || findBreak(st.orelse || []);
            if (got) { return got; }
          }
          if (st.k === "try") { var inTry = findBreak(st.body); if (inTry) { return inTry; } }
          if (st.k === "with") { var inWith = findBreak(st.body); if (inWith) { return inWith; } }
        }
        return null;
      }
      function findContinue(list) {
        var found = null;
        eachNode(list, function (x) {
          if (/^(while|dowhile|for|foreach|range|fn|func)$/.test(x.k)) { return false; }
          if (x.k === "continue") { found = x; }
        });
        return found;
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
          if (op && !mentions(right, counter) && !assigns(st.body, counter) && !hasSideEffects(right)) {
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
          var pre = [];
          var fr = ready(from, ch, pre), tr = ready(to, ch, pre);
          return pre.concat([{ k: "for", v: counter, from: fr.e, to: tr.e, by: by,
                               body: lower(st.body, ch), line: line, label: st.label || null }]);
        }
        // the While it is
        var out = [];
        st.init.forEach(function (one) { lowerOne(one, ch, out); });
        if (!st.cond && !st.step.length) {       // for (;;), the way C says forever
          var forever = foreverLoop(st.body, ch, line, st.label);
          return out.concat(forever.k === "block" ? forever.body : [forever]);
        }
        var body = lower(st.body, ch);
        var steps = [];
        st.step.forEach(function (one) { lowerOne(one, ch, steps); });
        steps.forEach(function (s) { s.always = true; });
        var before = [];
        var wc = st.cond ? ready(st.cond, ch, before) : null;
        out.push.apply(out, before);
        var redo = [];
        if (before.length) { ready(st.cond, ch, redo); redo.forEach(function (s) { s.always = true; }); }
        out.push({ k: "while", cond: wc ? truth(wc.e, ch) : { k: "bool", v: true }, forever: !wc,
                   body: body.concat(steps, redo), line: line, label: st.label || null });
        return out;
      }
      function hasSideEffects(e) {
        var found = false;
        eachNode(e, function (x) { if (x.k === "call" || x.k === "incdec" || x.k === "assignx") { found = true; } });
        return found;
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
            if (!mentions(v, counter) && !hasSideEffects(v)) { return { up: e.op === "+=", by: null, expr: v }; }
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
          if (key === "line" || key === "cls") { continue; }
          var v = e[key];
          if (Array.isArray(v)) { if (v.some(function (x) { return mentions(x, name); })) { return true; } }
          else if (v && typeof v === "object" && mentions(v, name)) { return true; }
        }
        return false;
      }
      function assigns(list, name) {
        var found = false;
        eachNode(list, function (x) {
          var t = (x.k === "assign" || x.k === "aug" || x.k === "assignx" || x.k === "incdec") ? stripParens(x.target) : null;
          if (t && t.k === "name" && t.v === name) { found = true; }
          if (x.k === "bin" && x.op === ">>" && mentions(x, name)) { found = true; }
          if (x.k === "call" && x.args && x.args.some(function (a) {
            return (a.k === "ref" || a.k === "addr") && mentions(a, name);
          })) { found = true; }
        });
        return found;
      }

      // switch, with what falls through carried into the case it falls from.
      // A case whose label is not a plain value -- a type, a guard -- makes
      // the whole switch the chain of Ifs it is.
      function lowerSwitch(st, ch) {
        var cases = st.cases, out = [];
        var pre = [];
        var subject = ready(st.subject, ch, pre).e;
        var plainLabels = cases.every(function (c) {
          return !c.guard && c.labels.every(function (l) { return l.k !== "typecase" && l.k !== "rel"; });
        });
        var bodies = cases.map(function (c, i) {
          var body = [];
          var from = i, stopped = false;
          while (from < cases.length && !stopped) {
            var list = cases[from].body;
            for (var j = 0; j < list.length; j++) {
              var s = list[j];
              if (s.k === "break" && !s.label) { stopped = true; break; }
              body.push(s);
              if (s.k === "return" || s.k === "exit" || s.k === "continue" || (s.k === "break" && s.label)) {
                stopped = true;
                break;
              }
            }
            if (st.noFall) { break; }
            from++;
          }
          return body;
        });
        if (!plainLabels) {
          var subj = subject;
          if (stripParens(subj).k !== "name") {
            subj = nameNode(fresh(ch, "choice"), st.line);
            pre.push({ k: "set", target: subj, value: subject, line: st.line });
            ch.meet(subj.v, { set: true }).values = [subject];
          }
          var chain = null, tail = null, other = null;
          cases.forEach(function (c, i) {
            var body = lower(bodies[i], ch);
            if (c.isDefault && !c.labels.length) { other = body; return; }
            var tests = c.labels.map(function (l) {
              if (l.k === "typecase") {
                if (l.bind) {
                  body.unshift({ k: "set", target: nameNode(l.bind), value: subj, line: c.line });
                  if (c.guard) { c = Object.assign({}, c, { guard: swapName(c.guard, l.bind, subj) }); }
                }
                return typeTest(subj, l.type, c.line);
              }
              if (l.k === "rel") { return { k: "bin", op: l.op, a: subj, b: l.e, line: c.line }; }
              return { k: "bin", op: "==", a: subj, b: l, line: c.line };
            });
            var test = tests.reduce(function (a, b) { return a ? { k: "bin", op: "||", a: a, b: b } : b; }, null);
            if (c.guard) { test = test ? { k: "bin", op: "&&", a: test, b: c.guard } : c.guard; }
            var node = { k: "if", cond: test || { k: "bool", v: true }, then: body, orelse: [], line: c.line, chained: !!chain };
            if (!chain) { chain = node; } else { tail.orelse = [node]; }
            tail = node;
          });
          if (tail && other) { tail.orelse = other; }
          return pre.concat(chain ? [chain] : (other || []));
        }
        cases.forEach(function (c, i) {
          var loweredBody = lower(bodies[i], ch);
          if (c.isDefault) { out.push({ label: null, body: loweredBody, line: c.line }); }
          c.labels.forEach(function (label) {
            out.push({ label: label, body: loweredBody, line: c.line });
          });
        });
        // the default goes last, where Select Case keeps it
        var plain = out.filter(function (c) { return c.label; });
        var other2 = out.filter(function (c) { return !c.label; });
        return pre.concat([{ k: "select", subject: subject, cases: plain.concat(other2.slice(0, 1)),
                             line: st.line, breakable: !py }]);
      }
      function typeTest(e, type, line) {
        var name = String(type).replace(/^.*[.:]/, "");
        var kinds = { int: "Integer", Integer: "Integer", long: "Integer", double: "Real", Double: "Real",
                      float: "Real", string: "String", String: "String", str: "String", bool: "Boolean",
                      Boolean: "Boolean", boolean: "Boolean", list: "List", List: "List", dict: "Table" };
        if (CLS[name]) {
          var all = descendants(name).map(function (c) { return c.name; });
          return all.map(function (n) {
            return { k: "bin", op: "==", a: builtinCall("classOf", [e], line), b: { k: "str", v: n }, line: line };
          }).reduce(function (a, b) { return a ? { k: "bin", op: "||", a: a, b: b, line: line } : b; }, null);
        }
        if (kinds[name]) {
          var test = { k: "bin", op: "==", a: builtinCall("classOf", [e], line), b: { k: "str", v: kinds[name] }, line: line };
          if (kinds[name] === "Real") {
            test = { k: "bin", op: "||", a: test, line: line,
                     b: { k: "bin", op: "==", a: builtinCall("classOf", [e], line), b: { k: "str", v: "Integer" }, line: line } };
          }
          return test;
        }
        return { k: "bool", v: true, line: line };
      }
      // Python's match: plain values and | make a Select Case; anything
      // with a shape to it -- a list, a record, a name to catch it in, an
      // if -- makes the chain of Ifs it is.
      function lowerMatch(st, ch, out) {
        var plain = st.cases.every(function (c) { return !c.guard && plainPat(c.pat); });
        if (plain) {
          var cases = st.cases.map(function (c) {
            var labels = [], isDefault = false;
            (function take(p) {
              if (p.p === "or") { p.alts.forEach(take); }
              else if (p.p === "any") { isDefault = true; }
              else { labels.push(p.e); }
            })(c.pat);
            return { labels: labels, isDefault: isDefault, body: c.body, line: c.line };
          });
          out.push.apply(out, lowerSwitch({ subject: st.subject, cases: cases, noFall: true, line: st.line }, ch));
          return;
        }
        var subject = ready(st.subject, ch, out).e;
        if (stripParens(subject).k !== "name") {
          var hold = nameNode(fresh(ch, "subject"), st.line);
          out.push({ k: "set", target: hold, value: subject, line: st.line });
          ch.meet(hold.v, { set: true }).values = [subject];
          subject = hold;
        }
        var chain = null, tail = null;
        st.cases.forEach(function (c) {
          var binds = [];
          var test = patTest(c.pat, subject, binds);
          var body = binds.map(function (b) { return { k: "assign", target: nameNode(b.name), value: b.value, line: c.line }; })
                          .concat(c.body);
          var guard = c.guard ? bindInto(c.guard, binds) : null;
          if (guard) { test = test ? { k: "bin", op: "&&", a: test, b: guard, line: c.line } : guard; }
          var lowBody = lower(body, ch);
          if (!test) {                                       // case _: or a name alone
            if (tail) { tail.orelse = lowBody; } else { out.push.apply(out, lowBody); }
            tail = { orelse: [] };
            return;
          }
          var node = { k: "if", cond: test, then: lowBody, orelse: [], line: c.line, chained: !!chain };
          if (!chain) { chain = node; out.push(node); } else { tail.orelse = [node]; }
          tail = node;
        });
      }
      function plainPat(p) {
        if (p.p === "lit" || p.p === "any") { return true; }
        if (p.p === "or") { return p.alts.every(function (a) { return a.p === "lit"; }); }
        return false;
      }
      function bindInto(e, binds) {
        var o = copyOf(e);
        binds.forEach(function (b) {
          o = swapName(o, b.name, b.value);
        });
        return o;
      }
      // The test a pattern makes of what is matched, and the names it gives.
      function patTest(p, e, binds) {
        function and(a, b) { return !a ? b : !b ? a : { k: "bin", op: "&&", a: a, b: b }; }
        switch (p.p) {
          case "any": return null;
          case "cap": binds.push({ name: p.name, value: e }); return null;
          case "lit": return { k: "bin", op: "==", a: e, b: p.e };
          case "as": { var t = patTest(p.pat, e, binds); binds.push({ name: p.name, value: e }); return t; }
          case "or": {
            return p.alts.map(function (a) { return patTest(a, e, binds) || { k: "bool", v: true }; })
                         .reduce(function (a, b) { return a ? { k: "bin", op: "||", a: a, b: b } : b; }, null);
          }
          case "seq": {
            var rest = p.items.filter(function (i) { return i.p === "rest"; })[0];
            var n = p.items.length - (rest ? 1 : 0);
            var test = { k: "bin", op: "==", a: builtinCall("classOf", [e]), b: { k: "str", v: "List" } };
            test = and(test, { k: "bin", op: rest ? ">=" : "==", a: builtinCall("length", [e]), b: { k: "num", v: String(n) } });
            var seen = false;
            p.items.forEach(function (item, i) {
              if (item.p === "rest") {
                seen = true;
                if (item.name) {
                  binds.push({ name: item.name, value: builtinCall("slice", [e, { k: "num", v: String(i) },
                               { k: "un", op: "-", a: { k: "num", v: String(p.items.length - 1 - i) } }].slice(0, p.items.length - 1 - i ? 3 : 2)) });
                }
                return;
              }
              var at = seen ? { k: "bin", op: "-", a: builtinCall("length", [e]), b: { k: "num", v: String(p.items.length - i) } }
                            : { k: "num", v: String(i) };
              test = and(test, patTest(item, { k: "index", obj: e, at: at }, binds));
            });
            return test;
          }
          case "map": {
            var mt = null;
            p.keys.forEach(function (key, i) {
              mt = and(mt, builtinCall("contains", [e, key]));
              mt = and(mt, patTest(p.pats[i], { k: "index", obj: e, at: key }, binds));
            });
            return mt;
          }
          case "cls": {
            var ct = typeTest(e, p.name, 0);
            var cls = CLS[p.name];
            var order = cls ? (cls.ctors[0] ? cls.ctors[0].params.map(function (q) { return q.name; }) : cls.fieldNames) : [];
            p.args.forEach(function (a, i) {
              if (/^(int|float|str|bool)$/.test(p.name)) { ct = and(ct, patTest(a, e, binds)); return; }
              ct = and(ct, patTest(a, { k: "member", obj: e, name: order[i] || "item" + i }, binds));
            });
            p.kws.forEach(function (kw) { ct = and(ct, patTest(kw.pat, { k: "member", obj: e, name: kw.name }, binds)); });
            return ct;
          }
        }
        return null;
      }
      function swapName(e, name, to) {
        if (!e || typeof e !== "object") { return e; }
        if (e.k === "name" && e.v === name) { return to; }
        if (Array.isArray(e)) { return e.map(function (x) { return swapName(x, name, to); }); }
        var o = {};
        for (var key in e) { o[key] = key === "cls" ? e[key] : swapName(e[key], name, to); }
        return o;
      }

      // ---- going round what is in something ------------------------------
      // for x in xs is For Each x In xs.  The rest are counted or taken
      // apart the way a course would write them: enumerate is a counter and
      // an item, zip is one counter over two lists, d.items() is each key
      // and what is under it.
      function lowerForeach(st, ch, out) {
        var line = st.line, target = stripParens(st.target), over = stripParens(st.over);
        var label = st.label || null, orelse = st.orelse ? lower(st.orelse, ch) : null;
        var fn = over.k === "call" ? bare(pathOf(over.fn) || (over.fn.k === "member" ? "." + over.fn.name : "")) : "";
        var dot = over.k === "call" && over.fn.k === "member" ? over.fn.name : null;
        var args = over.k === "call" ? over.args.filter(function (a) { return a.k !== "kw"; }) : [];
        var pair = target.k === "tuple" && target.items.length === 2 && target.items[0] && target.items[1] &&
                   target.items[0].k === "name" && target.items[1].k !== "star";
        // enumerate(xs[, start]): a counter, and the item it counts to
        if (pair && fn === "enumerate" && args.length >= 1) {
          var list = listName(args[0], ch, out, "items");
          var start = args[1] || (over.args.filter(function (a) { return a.k === "kw"; })[0] || {}).value || null;
          var i = target.items[0].v;
          ch.meet(i, { kind: "int", set: true, loop: true });
          var at = start ? { k: "bin", op: "-", a: nameNode(i), b: start } : nameNode(i);
          var body = lowered(function (o) { assign(target.items[1], { k: "index", obj: list, at: at, line: line }, ch, o, line); })
                       .concat(lower(st.body, ch));
          out.push({ k: "for", v: i, from: start || { k: "num", v: "0" },
                     to: start ? { k: "bin", op: "+", a: start, b: { k: "bin", op: "-", a: builtinCall("length", [list]), b: { k: "num", v: "1" } } }
                               : { k: "bin", op: "-", a: builtinCall("length", [list]), b: { k: "num", v: "1" } },
                     by: null, body: body, line: line, label: label, orelse: orelse });
          return;
        }
        // zip(a, b): one counter over both
        if (target.k === "tuple" && fn === "zip" && args.length === target.items.length && args.length >= 2) {
          var lists = args.map(function (a) { return listName(a, ch, out, "items"); });
          var k = fresh(ch, "i");
          ch.meet(k, { kind: "int", set: true, loop: true });
          var shortest = lists.length === 1 ? builtinCall("length", [lists[0]])
                       : builtinCall("min", lists.map(function (l) { return builtinCall("length", [l]); }));
          var zbody = lowered(function (o) {
            target.items.forEach(function (t, n) { assign(t, { k: "index", obj: lists[n], at: nameNode(k), line: line }, ch, o, line); });
          }).concat(lower(st.body, ch));
          out.push({ k: "for", v: k, from: { k: "num", v: "0" },
                     to: { k: "bin", op: "-", a: shortest, b: { k: "num", v: "1" } },
                     by: null, body: zbody, line: line, label: label, orelse: orelse });
          return;
        }
        // d.items(), Object.entries(o): each key, and what is under it
        var entries = (dot === "items" && py && !args.length) ? over.fn.obj
                    : (fn === "Object.entries" && args.length === 1) ? args[0] : null;
        if (entries && pair) {
          var table = listName(entries, ch, out, "table");
          var key = target.items[0].v;
          ch.meet(key, { set: true, loop: true });
          var ebody = lowered(function (o) {
            assign(target.items[1], { k: "index", obj: table, at: nameNode(key), line: line }, ch, o, line);
          }).concat(lower(st.body, ch));
          out.push({ k: "foreach", v: key, over: builtinCall("keys", [table], line), body: ebody,
                     line: line, label: label, orelse: orelse });
          return;
        }
        var src;
        if ((dot === "keys" || dot === "keySet" || dot === "Keys") && !args.length) {
          src = builtinCall("keys", [ready(over.fn.obj, ch, out).e], line);
        } else if ((dot === "values" || dot === "Values") && !args.length) {
          src = builtinCall("values", [ready(over.fn.obj, ch, out).e], line);
        } else if ((dot === "items" || dot === "entrySet") && !args.length) {
          src = builtinCall("items", [ready(over.fn.obj, ch, out).e], line);
        } else if (fn === "Object.keys" && args.length === 1) {
          src = builtinCall("keys", [ready(args[0], ch, out).e], line);
        } else if (fn === "Object.values" && args.length === 1) {
          src = builtinCall("values", [ready(args[0], ch, out).e], line);
        } else if ((dot === "toCharArray" || dot === "ToCharArray" || dot === "chars" || dot === "toList" ||
                    dot === "ToList" || dot === "ToArray" || dot === "stream") && !args.length) {
          src = ready(over.fn.obj, ch, out).e;
        } else {
          src = ready(st.over, ch, out).e;
          if (st.keysOf) { src = builtinCall("keys", [src], line); }
          var sk = kindNow(src);
          // a table gone round in C#, Java or C++ gives key-and-value pairs
          if (sk === "map" && !py && !js && !st.keysOf) { src = builtinCall("items", [src], line); }
        }
        if (target.k === "name") {
          ch.meet(target.v, { set: true, loop: true, elem: { of: src } });
          out.push({ k: "foreach", v: target.v, over: src, body: lower(st.body, ch),
                     line: line, label: label, orelse: orelse });
          return;
        }
        // for dx, dy in dirs: each item in a name of its own, taken apart
        var one = fresh(ch, singular(src));
        ch.meet(one, { set: true, loop: true, elem: { of: src } });
        var tbody = lowered(function (o) { assign(target, nameNode(one, line), ch, o, line); }).concat(lower(st.body, ch));
        out.push({ k: "foreach", v: one, over: src, body: tbody, line: line, label: label, orelse: orelse });
      }
      // dirs -> dir, cells -> cell; "item" when there is no telling
      function singular(e) {
        var p = stripParens(e), nm = p.k === "name" ? p.v : p.k === "member" ? p.name : "";
        if (/^[a-z]\w*[^s]s$/i.test(nm) && !/ss$/.test(nm)) {
          var s = nm.replace(/ies$/, "y").replace(/(ch|sh|x)es$/, "$1").replace(/s$/, "");
          return s.length > 1 ? s : "item";
        }
        return p.k === "call" && pathOf(p.fn) === "items" ? "pair" : "item";
      }
      // A list gone round more than once needs a name: the one it has, or
      // one it is given first.
      function listName(e, ch, out, base) {
        var r = ready(e, ch, out).e;
        if (stripParens(r).k === "name") { return stripParens(r); }
        var nm = nameNode(fresh(ch, base), e.line);
        out.push({ k: "set", target: nm, value: r, line: e.line });
        ch.meet(nm.v, { set: true }).values = [r];
        return nm;
      }

      // ---- one assignment: a Set, an Input, or a decision ----------------
      // a + b, worked out where both are figures, and 0 + b as b
      function plus(a, b) {
        var x = stripParens(a), y = stripParens(b);
        if (x.k === "num" && y.k === "num" && !x.real && !y.real) { return num(parseInt(x.v, 10) + parseInt(y.v, 10)); }
        if (x.k === "num" && x.v === "0") { return b; }
        if (y.k === "num" && y.v === "0") { return a; }
        return { k: "bin", op: "+", a: a, b: b };
      }
      function builtinCall(name, args, line) {
        return { k: "call", fn: nameNode(name, line), args: args, builtin: true, line: line || 0 };
      }
      function num(n) { return { k: "num", v: String(n) }; }
      function assign(target, value, ch, out, line, fromDecl, typeInfo) {
        target = stripParens(target);
        if (!target) { return; }
        if (target.k === "tuple" || target.k === "list" || target.k === "objpat") {
          assignMany(target, value, ch, out, line);
          return;
        }
        if (target.k === "deref" || target.k === "addr") { target = stripParens(target.e); }
        var v = stripParens(value);
        if (!v) { return; }
        var asked = inputOf(v);
        if (asked) {
          if (target.k === "name") { ch.meet(target.v, { kind: asked.kind, set: true }); }
          if (asked.prompt) {
            out.push({ k: "display", parts: piecesOf(ready(asked.prompt, ch, out).e), line: line });
          }
          askFor(target.k === "name" ? target : ready(target, ch, out).e, out, line, ch);
          return;
        }
        if (v.k === "cond") {
          if (target.k === "name") { ch.meet(target.v, { set: true }); }
          var cp = ready(v.test, ch, out);
          out.push({ k: "if", cond: cp.e, line: line,
                     then: lowered(function (o) { assign(target, v.a, ch, o, line, fromDecl, typeInfo); }),
                     orelse: lowered(function (o) { assign(target, v.b, ch, o, line, fromDecl, typeInfo); }) });
          return;
        }
        if (v.k === "assignx" && v.op === "=") {                     // a = b = 0
          assign(v.target, v.value, ch, out, line);
          assign(target, v.target, ch, out, line, fromDecl, typeInfo);
          return;
        }
        var sized0 = sizedOf(v, typeInfo);
        if (v.k === "comp" && !sized0) { compInto(target, v, ch, out); return; }
        if (v.k === "switchx") { switchInto(target, v, ch, out); return; }
        // x = a if c else b, and x += ... with one in it: the Set twice
        var q = !sized0 && firstTernary(v);
        if (q) {
          var qt = ready(q.test, ch, out);
          out.push({ k: "if", cond: qt.e, line: line,
                     then: lowered(function (o) { assign(target, swapped(v, q, q.a), ch, o, line, fromDecl, typeInfo); }),
                     orelse: lowered(function (o) { assign(target, swapped(v, q, q.b), ch, o, line, fromDecl, typeInfo); }) });
          return;
        }
        if (target.k === "member" && setterCall(target, v, ch, out, line)) { return; }
        // defaultdict(int): a table whose missing keys hold nothing yet
        if (py && v.k === "call" && /^(defaultdict|collections\.defaultdict)$/.test(pathOf(v.fn) || "") && target.k === "name") {
          var dk = stripParens(v.args[0]);
          ch.meet(target.v, { set: true }).empty = dk && dk.k === "name" ? blankFor(dk.v === "list" ? "List" : dk.v, line) : null;
          value = { k: "dict", keys: [], values: [], line: line };
        }
        var post = [];
        var v2 = sized0 ? { k: "sized", dims: sized0.dims.map(function (d) { return prep(d, ch, out, post); }),
                            fill: prep(sized0.fill, ch, out, post), kind: sized0.kind, line: line }
                        : prep(value, ch, out, post);
        var t2 = target.k === "name" ? target : prep(target, ch, out, post);
        var sized = sized0 ? null : sizedOf(v2, typeInfo);
        if (sized) { v2 = { k: "sized", dims: sized.dims, fill: sized.fill, kind: sized.kind, line: line }; }
        if (t2.k === "name" && isChar(t2, ch) && (charMath(v2, ch) || kindOf(v2, ch) === "int")) {
          v2 = builtinCall("chr", [v2], line);
        }
        if (t2.k === "name") {
          var met = ch.meet(t2.v, { set: true });
          met.values = (met.values || []).concat([v2]);
        } else {
          intoPlace(t2, v2, ch);
        }
        out.push({ k: "set", target: t2, value: v2, line: line, decl: fromDecl });
        lowerPost(post, ch, out);
      }
      // grid[y][x] = True says what grid holds
      function intoPlace(t, v, ch) {
        var base = t, depth = 0;
        while (base && base.k === "index") { base = stripParens(base.obj); depth++; }
        if (base && base.k === "name" && depth) {
          var k = { of: null, value: v, depth: depth };
          noteElem(ch, base.v, k);
        }
        if (t.k === "member") { noteField(t, v, ch); }
      }
      // A list the size of something, all one thing: [0] * n, [[False] * w
      // for _ in range(h)], new int[r][c], vector<int>(n, -1),
      // Array(n).fill(0).  Said as the size and what fills it, which a
      // Declare says in one line: Declare Boolean seen[h][w].
      function sizedOf(e, typeInfo) {
        e = stripParens(e);
        if (!e) { return null; }
        function scalar(x) {
          x = stripParens(x);
          return x && (x.k === "num" || x.k === "str" || x.k === "bool" || x.k === "null" ||
                       (x.k === "un" && x.op === "-" && stripParens(x.a).k === "num"));
        }
        function blank(kind) {
          return kind === "int" || kind === "real" ? num(0) : kind === "bool" ? { k: "bool", v: false }
               : kind === "text" ? { k: "str", v: "" } : { k: "null" };
        }
        if (e.k === "newarr" && !e.init && e.dims.length && e.dims[0]) {
          var dims = [];
          for (var i = 0; i < e.dims.length && e.dims[i]; i++) { dims.push(e.dims[i]); }
          var ek = kindOfType(e.elem ? { name: e.elem.name, dims: 0, args: e.elem.args } : null);
          if (dims.length < e.dims.length) { return { dims: dims, fill: { k: "null" }, kind: null }; }
          return { dims: dims, fill: blank(ek), kind: ek };
        }
        if (e.k === "bin" && e.op === "*" && py) {
          var l = stripParens(e.a), r = stripParens(e.b);
          var lst = l.k === "list" ? l : r.k === "list" ? r : null, n = lst === l ? r : l;
          if (lst && lst.items.length === 1 && scalar(lst.items[0])) {
            return { dims: [n], fill: lst.items[0], kind: kindOf(lst.items[0]) };
          }
          return null;
        }
        if (e.k === "comp" && e.kind === "list" && e.fors.length === 1 && !e.fors[0].ifs.length) {
          var f = e.fors[0], it = stripParens(f.iter), tv = stripParens(f.target);
          if (it.k === "call" && pathOf(it.fn) === "range" && it.args.length === 1 && tv.k === "name" &&
              !mentions(e.elt, tv.v)) {
            var inner = scalar(e.elt) ? { dims: [], fill: e.elt, kind: kindOf(e.elt) } : sizedOf(e.elt);
            if (inner) { return { dims: [it.args[0]].concat(inner.dims), fill: inner.fill, kind: inner.kind }; }
          }
          return null;
        }
        if (e.k === "call" && e.fn.k === "member" && e.fn.name === "fill" && e.args.length === 1 && js) {
          var arr = stripParens(e.fn.obj);
          if ((arr.k === "call" && pathOf(arr.fn) === "Array" || arr.k === "new" && /^Array$/.test(arr.type && arr.type.name)) &&
              arr.args.length === 1 && scalar(e.args[0])) {
            return { dims: [arr.args[0]], fill: e.args[0], kind: kindOf(e.args[0]) };
          }
          var innerJs = sizedOf(e.args[0]);
          if (innerJs && (arr.k === "call" && pathOf(arr.fn) === "Array") && arr.args.length === 1) {
            return null;                           // Array(h).fill(Array(w).fill(0)): one row, shared
          }
          return null;
        }
        if (e.k === "call" && js && pathOf(e.fn) === "Array.from" && e.args.length === 2) {
          var spec = stripParens(e.args[0]), make = stripParens(e.args[1]);
          var len = spec.k === "dict" && spec.keys.length === 1 && spec.keys[0].v === "length" ? spec.values[0] : null;
          var body = make.k === "fn" && make.body.length === 1 && make.body[0].k === "return" ? make.body[0].value : null;
          if (len && body) {
            var fromFn = scalar(body) ? { dims: [], fill: body, kind: kindOf(body) } : sizedOf(body);
            if (fromFn) { return { dims: [len].concat(fromFn.dims), fill: fromFn.fill, kind: fromFn.kind }; }
          }
          return null;
        }
        // C++: vector<int>(n, 0), vector<vector<int>>(h, vector<int>(w))
        if ((e.k === "new" && e.type && /^(vector|std::vector)$/.test(e.type.name) && e.args.length) ||
            (e.k === "call" && /^vector$/.test(bare(pathOf(e.fn) || "")) && e.args.length)) {
          var ty = e.k === "new" ? e.type : null;
          var elemTy = ty && ty.args && ty.args[0];
          var ekind = kindOfType(elemTy);
          if (e.args.length === 1 && stripParens(e.args[0]).k !== "list") {
            if (isListKind(ekind)) {
              return { dims: [e.args[0]], fill: { k: "null" }, kind: ekind };
            }
            return { dims: [e.args[0]], fill: blank(ekind), kind: ekind };
          }
          if (e.args.length === 2) {
            if (scalar(e.args[1])) { return { dims: [e.args[0]], fill: e.args[1], kind: ekind || kindOf(e.args[1]) }; }
            var innerC = sizedOf(e.args[1]);
            if (innerC) { return { dims: [e.args[0]].concat(innerC.dims), fill: innerC.fill, kind: innerC.kind }; }
          }
        }
        return null;
      }
      // a, b = b, a -- the right side is worked out before any of it is put
      // away, so where a place on the left is read on the right it goes
      // through a spare name first.  Anything else on the right is one
      // value, taken apart.
      function assignMany(target, value, ch, out, line) {
        var v = stripParens(value);
        var items = target.items || [];
        var starAt = -1;
        items.forEach(function (t, i) { if (t && t.k === "star") { starAt = i; } });
        if (target.k !== "objpat" && v && (v.k === "tuple" || v.k === "list") && starAt < 0 &&
            v.items.length === items.length && !v.items.some(function (x) { return x && x.k === "star"; })) {
          var values = v.items.slice();
          items.forEach(function (t, i) {
            if (!t) { return; }
            t = stripParens(t);
            var readLater = values.slice(i + 1).some(function (x) { return readsPlace(x, t); });
            if (readLater) {
              var tmp = nameNode(fresh(ch, "temp"), line);
              assign(tmp, copyOf(t), ch, out, line);
              for (var j = i + 1; j < values.length; j++) { values[j] = swapPlace(values[j], t, tmp); }
            }
            assign(t, values[i], ch, out, line);
          });
          return;
        }
        if (!v) { return; }
        var base = v.k === "call" ? "result" : "item";
        var src = listName(value, ch, out, base);
        if (target.k === "objpat") {
          items.forEach(function (t, i) {
            if (!t) { return; }
            if (t.k === "star") {
              assign(t.e, builtinCall("copy", [src], line), ch, out, line);
              target.keys.forEach(function (k) {
                if (k) { out.push({ k: "call", e: builtinCall("remove", [t.e, { k: "str", v: k }], line), line: line }); }
              });
              return;
            }
            assign(t, { k: "member", obj: src, name: target.keys[i], line: line }, ch, out, line);
          });
          return;
        }
        var n = items.length;
        items.forEach(function (t, i) {
          if (!t) { return; }
          if (t.k === "star") {
            var cut = [src, num(i)];
            if (n - 1 - i) { cut.push({ k: "un", op: "-", a: num(n - 1 - i) }); }
            assign(t.e, builtinCall("slice", cut, line), ch, out, line);
            return;
          }
          var at = starAt >= 0 && i > starAt
                 ? { k: "bin", op: "-", a: builtinCall("length", [src], line), b: num(n - i) }
                 : num(i);
          assign(t, { k: "index", obj: src, at: at, line: line }, ch, out, line);
        });
      }
      function readsPlace(x, t) {
        if (t.k === "name") { return mentions(x, t.v); }
        var root = t;
        while (root && (root.k === "index" || root.k === "member")) { root = stripParens(root.obj); }
        return root && root.k === "name" ? mentions(x, root.v) : true;
      }
      function swapPlace(e, t, to) {
        if (t.k === "name") { return swapName(e, t.v, to); }
        if (!e || typeof e !== "object") { return e; }
        if (same(e, t)) { return to; }
        if (Array.isArray(e)) { return e.map(function (x) { return swapPlace(x, t, to); }); }
        var o = {};
        for (var key in e) { o[key] = key === "cls" ? e[key] : swapPlace(e[key], t, to); }
        return o;
      }
      // x += y, and the ones that are not sums: names += ["Ada"] adds to
      // the list, and so does xs.extend(ys)
      function augment(target, op, value, ch, out, line, cStyle) {
        var t = stripParens(target), v = stripParens(value);
        var tk = kindOf(t, ch);
        if (op === "+" && (isListKind(tk) || ((v.k === "list" || v.k === "tuple") && tk !== "text"))) {
          var place = t.k === "name" ? t : ready(t, ch, out).e;
          if (v.k === "list" || v.k === "tuple") {
            v.items.forEach(function (item) {
              var r = ready(item, ch, out);
              out.push({ k: "call", e: builtinCall("append", [place, r.e], line), line: line });
              if (place.k === "name") { noteElem(ch, place.v, { value: r.e }); }
            });
            return;
          }
          var more = ready(value, ch, out).e;
          out.push({ k: "call", e: builtinCall("extend", [place, more], line), line: line });
          return;
        }
        var read = copyOf(t);
        var holder = t.k === "index" ? stripParens(t.obj) : null;
        var hk = holder ? kindOf(holder, ch) : null;
        var emptyOf = holder && holder.k === "name" && (ch.names[holder.v] || {}).empty;
        if (hk === "map" && (cpp || emptyOf)) {
          read = builtinCall("get", [holder, t.at, emptyOf || num(0)], line);
        }
        assign(target, { k: "bin", op: op, a: read, b: { k: "paren", e: value }, line: line, cInt: !!cStyle },
               ch, out, line);
      }
      // An Input.  The question the page's own writer puts to a bare Input
      // -- "Enter score: ", said just before it -- is the one pseudocode's
      // Input already asks by itself, so code read back from what the page
      // wrote comes back as the Input it was, not a Display and an Input.
      function askFor(target, out, line, ch) {
        var last = out[out.length - 1];
        var name = target.k === "name" ? target.v : null;
        if (last && last.k === "display" && last.parts.length === 1 && name &&
            last.parts[0].k === "str" && last.parts[0].v === say("code_ask", { name: name })) {
          out.pop();
        }
        if (target.k !== "name") { intoPlace(target, { k: "str", v: "" }, ch); }
        out.push({ k: "input", target: target, line: line });
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
          if (/^(int|Integer\.parseInt|int\.Parse|Int32\.Parse|Convert\.ToInt32|Convert\.ToInt64|parseInt|stoi|Math\.trunc|long\.Parse|Long\.parseLong|Integer\.valueOf)$/.test(p)) {
            wrap("int"); e = stripParens(e.args[0]); continue;
          }
          if (/^(float|Double\.parseDouble|double\.Parse|Double\.Parse|Convert\.ToDouble|decimal\.Parse|Convert\.ToDecimal|parseFloat|Number|stod|stof|Float\.parseFloat|float\.Parse|Double\.valueOf)$/.test(p)) {
            wrap("real"); e = stripParens(e.args[0]); continue;
          }
          if (/^(bool|Boolean\.parseBoolean|bool\.Parse|Convert\.ToBoolean)$/.test(p)) {
            wrap("bool"); e = stripParens(e.args[0]); continue;
          }
          if (/^(str|String)$/.test(p) && e.args.length === 1) { e = stripParens(e.args[0]); continue; }
          if (dot && /^(strip|trim|Trim|lower|upper|toLowerCase|toUpperCase|ToLower|ToUpper|rstrip|lstrip|trimEnd|TrimEnd|trimStart|TrimStart)$/.test(dot) && !e.args.length) {
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
              (devices[obj] === "keys" || /^(sc|scan|scanner|input|in|keyboard|reader|br|kb|stdin|console)$/i.test(obj || ""))) {
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

      // ---- prints that do not end the line ------------------------------
      // print(x, end=" "), System.out.print, cout with no endl: the line
      // goes on with whatever is printed next.  A Display always ends its
      // line, so a program that builds a line a piece at a time builds it
      // in a name -- lineOut -- and displays it when the line is done.
      // A print just before a question is the question's prompt, and is
      // left as the Display it was.
      var LINE = null;                       // the name, when the program needs one
      (function () {
        var open = false;
        function isOpenPrint(st) {
          if (!st || st.k !== "expr") { return false; }
          var e = stripParens(st.e);
          if (e.k === "call") {
            var p = bare(pathOf(e.fn) || "");
            if (py && p === "print") {
              var endKw = e.args.filter(function (a) { return a.k === "kw" && a.name === "end"; })[0];
              var ev = endKw && stripParens(endKw.value);
              return !!(ev && ev.k === "str" && !/\n$/.test(ev.v));
            }
            if (/^(System\.out\.print|Console\.Write|process\.stdout\.write|System\.out\.printf|System\.out\.format|printf)$/.test(p)) {
              var f = e.args[0] && stripParens(e.args[0]);
              if (!f) { return false; }
              if (f.k === "str") { return !/(\n|%n)$/.test(f.v); }
              if (f.k === "fstr") {
                var lastPart = f.parts[f.parts.length - 1];
                return !(typeof lastPart === "string" && /\n$/.test(lastPart));
              }
              return true;
            }
          }
          if (e.k === "bin" && e.op === "<<") {
            var chain = [], at = e;
            while (at.k === "bin" && at.op === "<<") { chain.unshift(at.b); at = stripParens(at.a); }
            if (!/^(cout|cerr)$/.test(bare(pathOf(at)))) { return false; }
            var lastBit = stripParens(chain[chain.length - 1]);
            return !(bare(pathOf(lastBit) || "") === "endl" || (lastBit.k === "str" && /\n$/.test(lastBit.v)));
          }
          return false;
        }
        function asks(st) {
          var found = false;
          eachNode(st, function (x) {
            if (x.k === "call" && inputOf(x)) { found = true; }
            if (x.k === "bin" && x.op === ">>" && bare(pathOf(stripParens(x.a)) || "") === "cin") { found = true; }
            if (x.k === "call" && cpp && pathOf(x.fn) === "getline") { found = true; }
          });
          return found;
        }
        function scan(list) {
          list.forEach(function (st, i) {
            if (isOpenPrint(st)) {
              var nextSt = list.slice(i + 1).filter(function (s) { return s.k !== "note"; })[0];
              if (nextSt && asks(nextSt)) { st.prompt = true; }
              else { st.open = true; open = true; }
            }
            ["then", "orelse", "body", "fin"].forEach(function (k) { if (Array.isArray(st[k])) { scan(st[k]); } });
            (st.cases || []).forEach(function (c) { scan(c.body); });
            (st.handlers || []).forEach(function (h) { scan(h.body); });
          });
        }
        scan(main);
        top.funcs.forEach(function (fn) { scan(fn.body); });
        if (open) { LINE = "lineOut"; }
      })();
      function chartPrintsOpen(ch) {
        var body = ch.fn ? ch.fn.body : main, found = false;
        eachNode(body, function (x) { if (x.open) { found = true; } });
        return found;
      }

      // ---- a statement that is only an expression -------------------------
      function statementExpr(e, ch, out, line, st) {
        e = stripParens(e);
        if (!e) { return; }
        if (e.k === "assignx") {
          if (e.op === "=") { assign(e.target, e.value, ch, out, line); return; }
          var op = e.op.slice(0, -1);
          if (op === "??") {
            out.push({ k: "if", cond: { k: "bin", op: "==", a: copyOf(e.target), b: { k: "null" }, line: line }, line: line,
                       then: lowered(function (o) { assign(e.target, e.value, ch, o, line); }), orelse: [] });
            return;
          }
          if (op === "||" || op === "&&") { op = op === "||" ? "||" : "&&"; }
          if (op === ">>>") { op = ">>"; }
          augment(e.target, op, e.value, ch, out, line, true);
          return;
        }
        if (e.k === "incdec") {
          augment(e.target, e.op === "++" ? "+" : "-", { k: "num", v: "1" }, ch, out, line);
          return;
        }
        if (e.k === "cond") {
          var ct = ready(e.test, ch, out);
          out.push({ k: "if", cond: ct.e, line: line,
                     then: lowered(function (o) { statementExpr(e.a, ch, o, line); }),
                     orelse: lowered(function (o) { statementExpr(e.b, ch, o, line); }) });
          return;
        }
        // ready && go(): go() only when ready
        if (e.k === "bin" && (e.op === "&&" || e.op === "||") && hasSideEffects(e.b)) {
          var lt = ready(e.a, ch, out);
          out.push({ k: "if", cond: e.op === "&&" ? lt.e : { k: "un", op: "!", a: lt.e }, line: line,
                     then: lowered(function (o) { statementExpr(e.b, ch, o, line); }), orelse: [] });
          return;
        }
        // cout << a << b, cin >> a >> b
        if (e.k === "bin" && (e.op === "<<" || e.op === ">>")) {
          var chain = [], at = e;
          while (at.k === "bin" && at.op === e.op) { chain.unshift(at.b); at = stripParens(at.a); }
          var head = bare(pathOf(at));
          if (e.op === "<<" && /^(cout|cerr|clog)$/.test(head)) {
            emitPrint(streamOut(chain, line), st, ch, out, line);
            return;
          }
          if (e.op === ">>" && head === "cin") {
            chain.forEach(function (t) {
              t = stripParens(t);
              if (t.k === "name") { ch.meet(t.v, { set: true }); }
              askFor(t.k === "name" ? t : ready(t, ch, out).e, out, line, ch);
            });
            return;
          }
        }
        if (e.k === "del") {
          var gone = stripParens(e.e);
          if (gone.k === "member" || gone.k === "index") {
            var holder = ready(gone.obj, ch, out).e;
            var key = gone.k === "member" ? { k: "str", v: gone.name } : ready(gone.at, ch, out).e;
            out.push({ k: "call", e: builtinCall("remove", [holder, key], line), line: line });
          }
          return;
        }
        if (e.k === "fn") { return; }
        // A value worked out and thrown away -- a docstring, `x;` -- does
        // nothing, and is drawn as nothing.
        if (e.k !== "call") { return; }
        if (e.builtin) {
          var br = ready(e, ch, out);
          out.push({ k: "call", e: br.e, line: line });
          lowerPost(br.post, ch, out);
          return;
        }
        var p = bare(pathOf(e.fn) || "");
        var dot = e.fn.k === "member" ? e.fn.name : null;
        var obj = e.fn.k === "member" ? pathOf(e.fn.obj) : null;
        // a function made and called at once: (function () { ... })()
        if (stripParens(e.fn).k === "fn" && !e.args.length) {
          out.push.apply(out, lower(stripParens(e.fn).body.map(function (s) {
            return s.k === "return" ? { k: "expr", e: s.value || { k: "null" }, line: s.line } : s;
          }), ch));
          return;
        }
        // printing
        var said = displayOf(e, p, dot);
        if (said) { emitPrint(said, st, ch, out, line); return; }
        // getline(cin, s)
        if (cpp && p === "getline" && e.args.length >= 2 && bare(pathOf(e.args[0])) === "cin") {
          var into = stripParens(e.args[1]);
          if (into.k === "name") { ch.meet(into.v, { kind: "text", set: true }); }
          askFor(into, out, line, ch);
          return;
        }
        // stopping
        if (/^(exit|quit|sys\.exit|System\.exit|Environment\.Exit|process\.exit|abort|os\._exit|Application\.Exit)$/.test(p) ||
            (js && p === "stop" && !userFn("stop"))) {
          out.push({ k: "stop", line: line });
          return;
        }
        // waiting
        var nap = waitOf(e, p);
        if (nap) { out.push(Object.assign(nap, { k: "wait", line: line })); return; }
        // what only the language needed doing
        if (/^(srand|random\.seed|Console\.ReadKey|Console\.Clear|system|cin\.ignore|cin\.get|cin\.clear|Console\.Read|setlocale|ios_base\.sync_with_stdio|ios\.sync_with_stdio|cin\.tie|cout\.tie|console\.clear|cout\.flush|System\.out\.flush|sys\.stdout\.flush|Collections\.unmodifiableList|console\.table|Console\.ResetColor|Scanner\.close|rl\.close|readline\.close|input\.close|sc\.close)$/.test(p) ||
            (dot && devices[obj] && /^(close|nextLine|useDelimiter|setSeed|seed)$/.test(dot)) ||
            (dot && /^(flush|close|setf|precision|imbue|tie)$/.test(dot) && /^(cout|cin|System\.out|sys\.stdout)$/.test(obj || "")) ||
            (dot && /^(setSeed|seed)$/.test(dot)) ||
            (p === "Console.ReadLine") || (py && p === "input") || (js && /^(prompt|ask)$/.test(p))) {
          if ((py && p === "input") || (js && /^(prompt|ask)$/.test(p)) || p === "Console.ReadLine") {
            var sink = nameNode(fresh(ch, "answer"), line);
            ch.meet(sink.v, { kind: "text", set: true });
            if (e.args[0] && (py || js)) { out.push({ k: "display", parts: piecesOf(ready(e.args[0], ch, out).e), line: line }); }
            askFor(sink, out, line, ch);
          }
          return;
        }
        if (inputOf(e)) {
          var asked = inputOf(e);
          var sink2 = nameNode(fresh(ch, "answer"), line);
          ch.meet(sink2.v, { kind: asked.kind, set: true });
          if (asked.prompt) { out.push({ k: "display", parts: piecesOf(ready(asked.prompt, ch, out).e), line: line }); }
          askFor(sink2, out, line, ch);
          return;
        }
        // a lambda gone round a list: xs.forEach(x => ...)
        if (eachStatement(e, ch, out, line)) { return; }
        // a module of the program's own, or a record's method
        var mine = resolveCall(e, ch);
        if (mine) {
          var mr = ready(mine, ch, out);
          out.push({ k: "call", e: mr.e, line: line });
          lowerPost(mr.post, ch, out);
          return;
        }
        // what lists, tables and words have done to them
        if (libStatement(e, ch, out, line)) { return; }
        var r = ready(e, ch, out);
        var got = libCall(r.e, ch);
        if (!got) { note(line, (dot || p || "…") + "()"); }
        out.push({ k: "call", e: got || r.e, line: line });
        lowerPost(r.post, ch, out);
      }

      // Displays: one per line printed, or -- for a line not yet finished --
      // added to lineOut, which the next line that ends takes with it.
      function emitPrint(said, st, ch, out, line) {
        var groups = said.lines || said, open = !!said.open && !!(st && st.open) && !!LINE;
        var buffered = LINE && chartPrintsOpen(ch);
        var after = [];                      // n-- printed: n is one less after
        groups.forEach(function (parts, i) {
          var last = i === groups.length - 1;
          var ps = parts.map(function (x) { var r = ready(x, ch, out); after = after.concat(r.post); return r.e; });
          if (last && open) {
            if (ps.length === 1 && ps[0].k === "str" && ps[0].v === "") { return; }
            var sum = nameNode(LINE, line);
            ps.forEach(function (x) {
              var xx = stripParens(x);
              if (xx.k === "places") { xx = x; }
              sum = { k: "bin", op: "+", a: sum, b: kindOf(xx, ch) === "text" || xx.k === "str" ? xx : builtinCall("toString", [xx], line), line: line };
            });
            out.push({ k: "set", target: nameNode(LINE, line), value: sum, line: line });
            return;
          }
          if (buffered) {
            if (ps.length === 1 && ps[0].k === "str" && ps[0].v === "") { ps = []; }
            out.push({ k: "display", parts: [nameNode(LINE, line)].concat(ps), line: line });
            out.push({ k: "set", target: nameNode(LINE, line), value: { k: "str", v: "" }, line: line });
            return;
          }
          out.push({ k: "display", parts: ps, line: line });
        });
        lowerPost(after, ch, out);
      }

      // ---- waiting -----------------------------------------------------
      function waitOf(e, p) {
        var a = e.args[0];
        if (/^(time\.sleep|sleep|Sleep)$/.test(p) && a && py) { return { e: a, unit: "s" }; }
        if (/^(Thread\.sleep|Thread\.Sleep|Threading\.Thread\.Sleep|System\.Threading\.Thread\.Sleep|wait|Sleep|usleep|Task\.Delay)$/.test(p) && a) {
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
      // words hold a line break, as several Displays.  `open` is a print
      // that does not end its line.
      function displayOf(e, p, dot) {
        var args = e.args.filter(function (a) { return a.k !== "kw"; });
        if (py && p === "print") {
          var sep = " ", end = "\n", toFile = false;
          e.args.forEach(function (a) {
            if (a.k !== "kw") { return; }
            var v = stripParens(a.value);
            if (a.name === "sep" && v.k === "str") { sep = v.v; }
            if (a.name === "end" && v.k === "str") { end = v.v; }
            if (a.name === "file" && !/stderr|stdout/.test(pathOf(v) || "")) { toFile = true; }
          });
          if (toFile) { return null; }
          var parts = [];
          args.forEach(function (a, i) {
            if (i && sep) { parts.push({ k: "str", v: sep }); }
            if (a.k === "star") { parts.push(builtinCall("join", [a.e, { k: "str", v: sep }], e.line)); }
            else { parts.push.apply(parts, piecesOf(a)); }
          });
          var open = !/\n$/.test(end);
          var tail = end.replace(/\n$/, "");
          if (tail) { parts.push({ k: "str", v: tail }); }
          return { lines: lines(parts), open: open };
        }
        var said = /^(System\.out\.println|System\.out\.print|Console\.WriteLine|Console\.Write|console\.log|console\.info|console\.error|console\.warn|console\.debug|process\.stdout\.write|puts|System\.err\.println|System\.err\.print|Debug\.Log|document\.write|print|println|alert|Console\.Error\.WriteLine|Trace\.WriteLine|Debug\.WriteLine)$/.test(p);
        var formatted = /^(System\.out\.printf|System\.out\.format|printf|String\.format|System\.err\.printf)$/.test(p);
        var ends = !/^(System\.out\.print|Console\.Write|process\.stdout\.write|System\.err\.print)$/.test(p);
        if (said && args.length > 1 && (cs || js) && /^(Console|console|Debug|Trace)/.test(p)) {
          var f = stripParens(args[0]);
          if (f.k === "str" && cs && /\{\d/.test(f.v)) { return { lines: lines(composite(f.v, args.slice(1), e.line)), open: !ends }; }
          if (js) {
            var bits = [];
            args.forEach(function (a, i) { if (i) { bits.push({ k: "str", v: " " }); } bits.push.apply(bits, piecesOf(a)); });
            return { lines: lines(bits), open: !ends };
          }
        }
        if (said) {
          if (!args.length) { return { lines: [[{ k: "str", v: "" }]], open: false }; }
          return { lines: lines(piecesOf(args[0])), open: !ends };
        }
        if (formatted && args.length) {
          var fmt = stripParens(args[0]);
          if (fmt.k === "str") {
            return { lines: lines(printfPieces(fmt.v, args.slice(1), e.line)), open: !/(\n|%n)$/.test(fmt.v) };
          }
          return { lines: lines(piecesOf(args[0])), open: true };
        }
        return null;
      }
      function streamOut(chain, line) {
        var parts = [], open = true;
        chain.forEach(function (one, i) {
          var s = stripParens(one);
          var p = bare(pathOf(s) || "");
          var lastOne = i === chain.length - 1;
          if (p === "endl") { parts.push({ k: "str", v: "\n" }); if (lastOne) { open = false; } return; }
          if (/^(fixed|setprecision|setw|left|right|showpoint|boolalpha|flush|noshowpoint)$/.test(p) ||
              (s.k === "call" && /^(setprecision|setw|setfill)$/.test(bare(pathOf(s.fn) || "")))) {
            return;
          }
          if (lastOne && s.k === "str" && /\n$/.test(s.v)) { open = false; }
          if (lastOne && s.k === "str" && s.v === "\n") { open = false; }
          parts.push.apply(parts, piecesOf(one));
        });
        if (!chain.length) { open = false; }
        return { lines: lines(parts), open: open };
      }
      // Cut a Display at every line break in its words.
      function lines(parts) {
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
        if (!a) { return []; }
        if (a.k === "fstr") {
          var out = [];
          a.parts.forEach(function (p) {
            if (typeof p === "string") { if (p) { out.push({ k: "str", v: p }); } }
            else { out.push(shown(described(shownPlain(p.e)), p.spec)); }
          });
          return out;
        }
        if (a.k === "call") {
          var p = bare(pathOf(a.fn) || "");
          if (/^(str|String|String\.valueOf|to_string|Integer\.toString|Double\.toString)$/.test(p) && a.args.length === 1) {
            return piecesOf(a.args[0]);
          }
          if (a.fn.k === "member" && /^(toString|ToString)$/.test(a.fn.name) && !a.args.length &&
              !recordOf(kindNow(a.fn.obj))) {
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
          if (firstText >= 0 && !chain.some(function (x) { return isListKind(kindNow(x)); })) {
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
        return [described(shownPlain(a))];
      }
      // A record printed is what its describe() says, where it has one.
      function described(e) {
        var s = stripParens(e), k = kindNow(s), cls = recordOf(k);
        if (!cls) { return e; }
        var keys = ["__str__", "__repr__", "toString", "ToString"];
        for (var i = 0; i < keys.length; i++) {
          var target = METHODS[keys[i]] ? methodTarget(keys[i], k) : null;
          if (target && funcs[low(target)]) { return userCallNode(funcs[low(target)], [s], s.line); }
        }
        return e;
      }
      function shownPlain(e) {
        var s = stripParens(e);
        if (s && s.k === "call") {
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
      // And shown in so many places, lined up on the left or the right:
      // {name:>6}, {n:05d}, %-10s, {0,8}.  `align` is "<" or ">".
      function shown(e, spec, width, align, fill) {
        if (e && e.k === "places" && !spec && !width) { return e; }
        var s = String(spec || "");
        var py0 = /^(?:(.)?([<>^=]))?[+\- ]?#?(0?)(\d*),?(?:\.(\d+))?[bcdeEfFgGnosxX%]?$/.exec(s);
        var got = e;
        var m = /\.(\d+)[fF%]?$|^[FfNn](\d+)$|^0\.(0+)$/.exec(s.replace(/^[<>^]?\d*,?/, ""));
        if (m) {
          got = { k: "places", e: e, n: parseInt(m[1] || m[2] || String((m[3] || "").length), 10) };
        }
        if (py0 && py0[4] && !width) {
          width = parseInt(py0[4], 10);
          align = py0[2] || align;
          fill = py0[1] || (py0[3] ? "0" : fill);
        }
        if (width) {
          // numbers line up on the right, words on the left, unless it says
          var right = align ? align !== "<" : kindNow(e) !== "text";
          got = builtinCall(right ? "padLeft" : "padRight",
                            [got, num(width)].concat(fill && fill !== " " ? [{ k: "str", v: fill }] : []));
        }
        return got;
      }
      function composite(f, args, line) {
        var out = [], re = /\{(\d+)(?:,\s*(-?\d+))?(?::([^}]*))?\}/g, at = 0, m;
        f = f.replace(/\{\{/g, "\u0001").replace(/\}\}/g, "\u0002");
        while ((m = re.exec(f))) {
          if (m.index > at) { out.push({ k: "str", v: f.slice(at, m.index) }); }
          var arg = args[parseInt(m[1], 10)] || { k: "str", v: "" };
          var wide = m[2] ? parseInt(m[2], 10) : 0;
          out.push(shown(described(arg), m[3], Math.abs(wide), wide < 0 ? "<" : wide ? ">" : undefined));
          at = re.lastIndex;
        }
        if (at < f.length) { out.push({ k: "str", v: f.slice(at) }); }
        return out.map(function (p) {
          return p.k === "str" ? { k: "str", v: p.v.replace(/\u0001/g, "{").replace(/\u0002/g, "}") } : p;
        });
      }
      function pyFormat(f, args, line) {
        var out = [], re = /\{(\d*|\w+)(?:![rsa])?(?::([^}]*))?\}/g, at = 0, m, auto = 0;
        var kws = {};
        args.forEach(function (a) { if (a.k === "kw") { kws[a.name] = a.value; } });
        var pos = args.filter(function (a) { return a.k !== "kw"; });
        f = f.replace(/\{\{/g, "\u0001").replace(/\}\}/g, "\u0002");
        while ((m = re.exec(f))) {
          if (m.index > at) { out.push({ k: "str", v: f.slice(at, m.index) }); }
          var arg = m[1] === "" ? pos[auto++] : /^\d+$/.test(m[1]) ? pos[parseInt(m[1], 10)] : kws[m[1]];
          out.push(shown(described(arg || { k: "str", v: "" }), m[2]));
          at = re.lastIndex;
        }
        if (at < f.length) { out.push({ k: "str", v: f.slice(at) }); }
        return out.map(function (p) {
          return p.k === "str" ? { k: "str", v: p.v.replace(/\u0001/g, "{").replace(/\u0002/g, "}") } : p;
        });
      }
      function printfPieces(f, args, line) {
        var out = [], re = /%([-+ 0#]*\d*(?:\.(\d+))?)(?:l|ll|h|L)?([dioufFeEgGsScbxX%n])/g, at = 0, m, k = 0;
        while ((m = re.exec(f))) {
          if (m.index > at) { out.push({ k: "str", v: f.slice(at, m.index) }); }
          at = re.lastIndex;
          if (m[3] === "%") { out.push({ k: "str", v: "%" }); continue; }
          if (m[3] === "n") { out.push({ k: "str", v: "\n" }); continue; }
          var arg = args[k++] || { k: "str", v: "" };
          // %-10s, %5d, %05d, %8.2f: a width, and which side it lines up on
          var flags = /^([-+ 0#]*)(\d*)/.exec(m[1]);
          var wide = flags[2] ? parseInt(flags[2], 10) : 0;
          var left = flags[1].indexOf("-") >= 0, zero = flags[1].indexOf("0") >= 0;
          out.push(shown(m[2] !== undefined && /[fFeEgG]/.test(m[3]) ? arg : described(arg),
                         m[2] !== undefined && /[fFeEgG]/.test(m[3]) ? "." + m[2] + "f" : "",
                         wide, wide ? (left ? "<" : ">") : undefined, zero && !left ? "0" : undefined));
        }
        if (at < f.length) { out.push({ k: "str", v: f.slice(at) }); }
        return out;
      }

      // ---- calls to the program's own functions -----------------------
      function userCallNode(fn, args, line) {
        return { k: "call", fn: nameNode(fn.name, line), args: callArgs(fn, args), mine: true, line: line || 0 };
      }
      var FACTORIES = Object.create(null), INITS = Object.create(null);
      order.forEach(function (fn) {
        if (fn.factoryOf) { (FACTORIES[fn.factoryOf] = FACTORIES[fn.factoryOf] || []).push(fn); }
        if (fn.initOf) { (INITS[fn.initOf] = INITS[fn.initOf] || []).push(fn); }
      });
      function pickArity(list, n) {
        return (list || []).filter(function (f) { return fitsArgs(f.params, n); })[0] || (list || [])[0] || null;
      }
      function selfOfChart(ch) {
        return ch.fn && ch.fn.params[0] && (ch.fn.methodOf || ch.fn.initOf) ? ch.fn.params[0].name : selfWord;
      }
      function classOfChart(ch) {
        var name = ch.fn && (ch.fn.methodOf || ch.fn.factoryOf || ch.fn.initOf);
        return name ? CLS[name] : null;
      }
      function resolveCall(e, ch) {
        e = stripParens(e);
        if (!e || e.k !== "call") { return null; }
        var f = e.fn, args = e.args;
        if (e.made === "init") {
          var init = pickArity(INITS[e.cls.name], argCount(args) + 1);
          if (!init) { return null; }
          return userCallNode(init, [nameNode(e.self)].concat(args), e.line);
        }
        if (f.k === "name") {
          if (f.via && CLS[f.via] && CLS[f.via].record) {
            var viaM = methodOf(CLS[f.via], f.v);
            if (viaM) { return userCallNode(viaM, py ? args : [nameNode("this")].concat(args), e.line); }
          }
          var fn = userFn(f.v, argCount(args));
          if (fn && !fn.methodOf) { return userCallNode(fn, args, e.line); }
          return null;
        }
        if (f.k === "member") {
          var recv = stripParens(f.obj);
          if ((recv.k === "call" && recv.fn.k === "name" && recv.fn.v === "super") ||
              (recv.k === "name" && recv.v === "super")) {
            var cls = classOfChart(ch), parent = cls && cls.parent && CLS[cls.parent];
            var up = parent && methodOf(parent, f.name);
            if (up) { return userCallNode(up, [nameNode(selfOfChart(ch))].concat(args), e.line); }
            return null;
          }
          if (!METHODS[f.name] && !args.length) {
            var rec0 = recordOf(kindOf(recv, ch));
            if (rec0 && CLS[rec0] && allFields(CLS[rec0])[f.name]) {
              return { k: "member", obj: recv, name: f.name, line: e.line };
            }
          }
          if (METHODS[f.name]) {
            var rk = kindOf(recv, ch);
            if (recordOf(rk) || !(isListKind(rk) || rk === "map" || rk === "text")) {
              var target = methodTarget(f.name, rk);
              if (target && funcs[low(target)]) { return userCallNode(funcs[low(target)], [recv].concat(args), e.line); }
            }
          }
          // a static method reached through its class: Point.origin()
          if (recv.k === "name" && CLS[recv.v]) {
            var st = userFn(f.name, argCount(args));
            if (st) { return userCallNode(st, args, e.line); }
          }
        }
        return null;
      }
      // obj.name = v, where name is a property with something that sets it
      function setterCall(target, v, ch, out, line) {
        var key = "set " + target.name;
        if (!METHODS[key]) { return false; }
        var recv = stripParens(target.obj), k = kindOf(recv, ch);
        var cls = recordOf(k) && CLS[recordOf(k)];
        if (cls && !setterOf(cls, target.name)) { return false; }
        var fnName = methodTarget(key, k);
        if (!fnName || !funcs[low(fnName)]) { return false; }
        // inside the setter itself, the name is the field
        if (ch.fn && low(ch.fn.name) === low(fnName)) { return false; }
        var r = ready(v, ch, out), o = ready(recv, ch, out);
        out.push({ k: "call", e: userCallNode(funcs[low(fnName)], [o.e, r.e], line), line: line });
        return true;
      }
      function getterCall(member, ch) {
        var one = METHODS[member.name];
        if (!one) { return null; }
        var recv = stripParens(member.obj), k = kindOf(recv, ch), cls = recordOf(k) && CLS[recordOf(k)];
        var isGetter = one.list.some(function (x) { return x.fn.kind === "get"; });
        if (!isGetter) { return null; }
        if (cls && allFields(cls)[member.name]) { return null; }
        var fnName = methodTarget(member.name, k);
        if (!fnName || !funcs[low(fnName)]) { return null; }
        if (ch && ch.fn && low(ch.fn.name) === low(fnName)) { return null; }
        return userCallNode(funcs[low(fnName)], [recv], member.line);
      }

      // ---- functions handed to other functions --------------------------
      // A lambda handed to forEach, map, filter and the rest is the loop it
      // stands for, written out: the lambda's name is the loop's, and what
      // it works out is what the loop does with each thing.
      function outsideNames(ch) {
        if (!ch.outside) {
          ch.outside = {};
          var body = ch.fn ? [ch.fn.body, ch.fn.params] : main;
          eachNode(body, function (x) {
            if (x.k === "fn" || x.k === "comp") { return false; }
            if (x.k === "name") { ch.outside[x.v] = true; }
          });
        }
        return ch.outside;
      }
      // What a lambda does with the things it is handed: an expression
      // with its names swapped for the ones given, or -- a lambda with
      // statements in it -- a function of its own, called.
      function applied(fn, given, ch) {
        fn = stripParens(fn);
        if (fn.k === "fn") {
          var body = fn.body.filter(function (s) { return s.k !== "note"; });
          if (body.length === 1 && body[0].k === "return" && body[0].value) {
            var e = copyOf(body[0].value);
            fn.params.forEach(function (p, i) {
              if (given[i] && !(given[i].k === "name" && given[i].v === p.name)) { e = swapName(e, p.name, given[i]); }
            });
            return e;
          }
          var ref = liftLambda(fn, ch, "lambda");
          return { k: "call", fn: nameNode(ref.v), args: given.slice(0, fn.params.length), mine: true };
        }
        if (fn.k === "member" && fn.obj.k === "name" && !CLS[fn.obj.v] &&
            /^(System\.out|Console|console)$/.test(pathOf(fn.obj) || "")) {
          return null;
        }
        if (fn.k === "member") {                              // String::length, Integer::parseInt
          var owner = pathOf(fn.obj) || "";
          if (/^(Integer|Double|Math|String|Character|Long|Float|Boolean|Arrays|Collections|Objects)$/.test(owner) &&
              /^(parseInt|parseDouble|valueOf|abs|sqrt|max|min|isDigit|isLetter|toUpperCase|toLowerCase|toString|round|floor|ceil)$/.test(fn.name) &&
              !(owner === "String" && /^(toUpperCase|toLowerCase)$/.test(fn.name))) {
            return { k: "call", fn: fn, args: given.slice(0, 1) };
          }
          return { k: "call", fn: { k: "member", obj: given[0], name: fn.name }, args: given.slice(1, 1) };
        }
        return { k: "call", fn: fn, args: given.slice(0, 1) };
      }
      function loopName(fn, i, ch, base) {
        fn = stripParens(fn);
        var p = fn.k === "fn" && fn.params[i] ? fn.params[i].name : null;
        if (p && p !== "_" && !outsideNames(ch)[p] && !KEPT.test(p)) { ch.used[p] = true; return p; }
        return fresh(ch, p && p !== "_" ? p : base);
      }
      function eachStatement(e, ch, out, line) {
        var f = e.fn;
        if (f.k !== "member" || !/^(forEach|ForEach)$/.test(f.name) || !e.args.length) { return false; }
        var fn = stripParens(e.args[0]), src = ready(f.obj, ch, out).e, sk = kindOf(src, ch);
        if (sk === "map" && fn.k === "fn" && fn.params.length === 2) {       // map.forEach((k, v) -> ...)
          var keyFirst = !js;
          var kName = loopName(fn, keyFirst ? 0 : 1, ch, "key"), vName = loopName(fn, keyFirst ? 1 : 0, ch, "value");
          var mb = lowered(function (o) {
            assign(nameNode(vName), { k: "index", obj: src, at: nameNode(kName) }, ch, o, line);
          }).concat(lower(bodyOf(fn, keyFirst ? [kName, vName] : [vName, kName]), ch));
          out.push({ k: "foreach", v: kName, over: builtinCall("keys", [src], line), body: mb, line: line });
          return true;
        }
        if (fn.k === "fn" && fn.params.length >= 2 && js) {                 // arr.forEach((x, i) => ...)
          var iName = loopName(fn, 1, ch, "i"), xName = loopName(fn, 0, ch, "item");
          ch.meet(iName, { kind: "int", set: true, loop: true });
          var cb = lowered(function (o) {
            assign(nameNode(xName), { k: "index", obj: src, at: nameNode(iName) }, ch, o, line);
          }).concat(lower(bodyOf(fn, [xName, iName]), ch));
          out.push({ k: "for", v: iName, from: num(0),
                     to: { k: "bin", op: "-", a: builtinCall("length", [src]), b: num(1) }, by: null, body: cb, line: line });
          return true;
        }
        var each = loopName(fn, 0, ch, singular(src));
        ch.meet(each, { set: true, loop: true, elem: { of: src } });
        var body;
        if (fn.k === "fn") { body = lower(bodyOf(fn, [each]), ch); }
        else if (fn.k === "member" && /^(println|print|log|WriteLine|Write)$/.test(fn.name)) {
          body = [{ k: "display", parts: [nameNode(each)], line: line }];
        } else {
          body = lowered(function (o) { statementExpr(applied(fn, [nameNode(each)], ch), ch, o, line); });
        }
        out.push({ k: "foreach", v: each, over: src, body: body, line: line });
        return true;
      }
      // A lambda's statements, with its names swapped for the loop's.
      function bodyOf(fn, names) {
        var body = fn.body.map(function (s) {
          return s.k === "return" && s.value && fn.body.length === 1 ? { k: "expr", e: s.value, line: s.line } : s;
        });
        fn.params.forEach(function (p, i) {
          if (names[i] && names[i] !== p.name) { body = swapName(body, p.name, nameNode(names[i])); }
        });
        return body;
      }
      // xs.map(f), xs.filter(f), stream chains, LINQ, Python's map and
      // filter, reduce, any, all: a list or a value built by a loop.
      function higherOrder(x, ch, out, walk) {
        var f = x.fn;
        var args = x.args.filter(function (a) { return a.k !== "kw"; });
        var kws = {};
        x.args.forEach(function (a) { if (a.k === "kw") { kws[a.name] = a.value; } });
        var p = bare(pathOf(f) || ""), dot = f.k === "member" ? f.name : null;
        var line = x.line;
        function isFn(a) { a = stripParens(a); return a && (a.k === "fn" || (a.k === "member" && a.obj.k === "name" && pathOf(a.obj) && !a.args) || (a.k === "name" && (userFn(a.v) || /^(str|int|float|len|abs|bool|round|ord|chr)$/.test(a.v)))); }
        if (py && (p === "map" || p === "filter") && args.length === 2 && isFn(args[0])) {
          return built(p, walk(args[1]), args[0]);
        }
        if (py && /^(functools\.reduce|reduce)$/.test(p) && args.length >= 2) {
          return folded(walk(args[1]), args[0], args[2] ? walk(args[2]) : null);
        }
        if (py && /^(max|min)$/.test(p) && kws.key && args.length === 1) {
          return best(walk(args[0]), kws.key, p === "max");
        }
        if (py && /^(sorted)$/.test(p) && args.length === 1 && (kws.key || kws.reverse)) {
          var sorted = builtinCall("sorted", [walk(args[0])].concat(kws.key ? [fnValue(kws.key, ch, "key")] : []), line);
          return kws.reverse && stripParens(kws.reverse).v ? builtinCall("reversed", [sorted], line) : sorted;
        }
        if (js && p === "Array.from" && args.length === 2 && stripParens(args[0]).k === "dict" && isFn(args[1])) {
          var spec = stripParens(args[0]);
          var len = spec.keys.length === 1 && spec.keys[0].v === "length" ? spec.values[0] : null;
          if (len) {
            var fn2 = stripParens(args[1]);
            if (fn2.k === "fn" && fn2.params.length >= 2) {
              var fake = { k: "fn", params: [fn2.params[1]], body: fn2.body, line: line };
              return built("map", builtinCall("range", [walk(len)], line), fake);
            }
            return built("map", builtinCall("range", [walk(len)], line), args[1]);
          }
        }
        if (/^(IntStream\.range|IntStream\.rangeClosed|Enumerable\.Range)$/.test(p) && args.length === 2) {
          if (p === "IntStream.range") { return builtinCall("range", [walk(args[0]), walk(args[1])], line); }
          if (p === "IntStream.rangeClosed") { return builtinCall("range", [walk(args[0]), { k: "bin", op: "+", a: walk(args[1]), b: num(1) }], line); }
          return builtinCall("range", [walk(args[0]), { k: "bin", op: "+", a: walk(args[0]), b: walk(args[1]) }], line);
        }
        if (!dot) { return null; }
        var recv = f.obj;
        var rk = kindOf(recv, ch);
        if (rk === "text" && !/^(chars|codePoints)$/.test(dot)) { return null; }
        if (recordOf(rk) && METHODS[dot]) { return null; }
        switch (dot) {
          case "stream": case "boxed": case "AsEnumerable": case "parallelStream": case "asList":
            return args.length ? null : walk(recv);
          case "toList": case "ToList": case "ToArray": case "toArray": case "toSet": case "ToHashSet":
            return args.length && dot !== "toArray" ? null : walk(recv);
          case "collect": {
            var how = args[0] && stripParens(args[0]);
            var hp = how && how.k === "call" ? bare(pathOf(how.fn) || "") : "";
            if (/Collectors\.joining$/.test(hp)) {
              return builtinCall("join", [walk(recv), how.args[0] ? walk(how.args[0]) : { k: "str", v: "" }], line);
            }
            if (/Collectors\.toSet$/.test(hp)) { return builtinCall("unique", [walk(recv)], line); }
            return walk(recv);
          }
          case "map": case "Select": case "mapToInt": case "mapToDouble": case "mapToObj": case "mapToLong":
            return args.length === 1 && isFn(args[0]) ? built("map", walk(recv), args[0]) : null;
          case "filter": case "Where":
            return args.length === 1 && isFn(args[0]) ? built("filter", walk(recv), args[0]) : null;
          case "reduce": case "Aggregate": {
            if (!args.length) { return null; }
            if (dot === "Aggregate") { return args.length === 2 ? folded(walk(recv), args[1], walk(args[0])) : folded(walk(recv), args[0], null); }
            if (java && args.length === 2) { return folded(walk(recv), args[1], walk(args[0])); }
            return folded(walk(recv), args[0], args[1] ? walk(args[1]) : null);
          }
          case "some": case "anyMatch": case "Any":
            return args.length === 1 && isFn(args[0]) ? flagged(walk(recv), args[0], true) : null;
          case "every": case "allMatch": case "All":
            return args.length === 1 && isFn(args[0]) ? flagged(walk(recv), args[0], false) : null;
          case "noneMatch":
            return args.length === 1 ? { k: "un", op: "!", a: flagged(walk(recv), args[0], true) } : null;
          case "find": case "First": case "FirstOrDefault": case "Find":
            return args.length === 1 && isFn(args[0]) ? found(walk(recv), args[0], false) : null;
          case "findIndex": case "FindIndex":
            return args.length === 1 && isFn(args[0]) ? found(walk(recv), args[0], true) : null;
          case "Count": case "count":
            return args.length === 1 && isFn(args[0]) ? builtinCall("length", [built("filter", walk(recv), args[0])], line) : null;
          case "Sum": case "Max": case "Min": case "Average":
            if (args.length === 1 && isFn(args[0])) {
              var mapped = built("map", walk(recv), args[0]);
              if (dot === "Average") { return { k: "bin", op: "/", a: builtinCall("sum", [mapped]), b: builtinCall("length", [mapped]) }; }
              return builtinCall(dot.toLowerCase(), [mapped], line);
            }
            return null;
          case "OrderBy": case "OrderByDescending": case "sortBy": case "SortBy":
            if (args.length === 1) {
              var ob = builtinCall("sorted", [walk(recv), fnValue(args[0], ch, "key")], line);
              return dot === "OrderByDescending" ? builtinCall("reversed", [ob], line) : ob;
            }
            return null;
          case "sorted":
            if (java) {
              return builtinCall("sorted", [walk(recv)].concat(args.length ? [fnValue(args[0], ch, "compare")] : []), line);
            }
            return null;
          case "distinct": case "Distinct":
            return args.length ? null : builtinCall("unique", [walk(recv)], line);
          case "flatMap": case "SelectMany":
            return null;
        }
        return null;
        // a list of what each thing comes to, or of the things that pass
        function built(how, src, fn) {
          var t = nameNode(fresh(ch, how === "filter" ? "kept" : "items"), line);
          out.push({ k: "set", target: t, value: { k: "list", items: [] }, line: line });
          ch.meet(t.v, { set: true, kind: "list" });
          var each = loopName(fn, 0, ch, singular(src));
          ch.meet(each, { set: true, loop: true, elem: { of: src } });
          var val = applied(fn, [nameNode(each)], ch) || nameNode(each);
          var body;
          if (how === "map") {
            body = lowered(function (o) {
              lowerOne({ k: "expr", e: builtinCall("append", [t, val], line), line: line }, ch, o);
            });
            noteElem(ch, t.v, { value: val });
          } else {
            body = lowered(function (o) {
              lowerOne({ k: "if", cond: val, orelse: [], line: line,
                         then: [{ k: "expr", e: builtinCall("append", [t, nameNode(each)], line), line: line }] }, ch, o);
            });
            noteElem(ch, t.v, { of: src });
          }
          out.push({ k: "foreach", v: each, over: src, body: body, line: line });
          return t;
        }
        function folded(src, fn, start) {
          var fnS = stripParens(fn);
          var acc = nameNode(fresh(ch, fnS.k === "fn" && fnS.params[0] ? fnS.params[0].name : "total"), line);
          if (start) {
            var each = loopName(fn, 1, ch, singular(src));
            ch.meet(each, { set: true, loop: true, elem: { of: src } });
            out.push({ k: "set", target: acc, value: start, line: line });
            ch.meet(acc.v, { set: true }).values = [start];
            var body = lowered(function (o) {
              lowerOne({ k: "assign", target: acc, value: applied(fn, [acc, nameNode(each)], ch), line: line }, ch, o);
            });
            out.push({ k: "foreach", v: each, over: src, body: body, line: line });
            return acc;
          }
          var list = itemsName(src, ch, out);
          out.push({ k: "set", target: acc, value: { k: "index", obj: list, at: num(0) }, line: line });
          ch.meet(acc.v, { set: true }).values = [{ k: "index", obj: list, at: num(0) }];
          var k = fresh(ch, "i");
          ch.meet(k, { kind: "int", set: true, loop: true });
          var body2 = lowered(function (o) {
            lowerOne({ k: "assign", target: acc, line: line,
                       value: applied(fn, [acc, { k: "index", obj: list, at: nameNode(k) }], ch) }, ch, o);
          });
          out.push({ k: "for", v: k, from: num(1), to: { k: "bin", op: "-", a: builtinCall("length", [list]), b: num(1) },
                     by: null, body: body2, line: line });
          return acc;
        }
        function flagged(src, fn, any) {
          var flag = nameNode(fresh(ch, any ? "found" : "allPass"), line);
          out.push({ k: "set", target: flag, value: { k: "bool", v: !any }, line: line });
          ch.meet(flag.v, { set: true, kind: "bool" });
          var each = loopName(fn, 0, ch, singular(src));
          ch.meet(each, { set: true, loop: true, elem: { of: src } });
          var test = applied(fn, [nameNode(each)], ch);
          var body = lowered(function (o) {
            lowerOne({ k: "if", cond: any ? test : { k: "un", op: "!", a: test }, orelse: [], line: line,
                       then: [{ k: "assign", target: flag, value: { k: "bool", v: any }, line: line }] }, ch, o);
          });
          out.push({ k: "foreach", v: each, over: src, body: body, line: line });
          return flag;
        }
        function found(src, fn, index) {
          var list = itemsName(src, ch, out);
          var got = nameNode(fresh(ch, index ? "position" : "match"), line);
          out.push({ k: "set", target: got, value: index ? num(-1) : { k: "null" }, line: line });
          ch.meet(got.v, { set: true, kind: index ? "int" : null });
          var k = fresh(ch, "i");
          ch.meet(k, { kind: "int", set: true, loop: true });
          var test = applied(fn, [{ k: "index", obj: list, at: nameNode(k) }], ch);
          var stillLooking = index ? { k: "bin", op: "<", a: got, b: num(0) }
                                   : { k: "bin", op: "==", a: got, b: { k: "null" } };
          var body = lowered(function (o) {
            lowerOne({ k: "if", cond: { k: "bin", op: "&&", a: stillLooking, b: test }, orelse: [], line: line,
                       then: [{ k: "assign", target: got, line: line,
                                value: index ? nameNode(k) : { k: "index", obj: list, at: nameNode(k) } }] }, ch, o);
          });
          out.push({ k: "for", v: k, from: num(0), to: { k: "bin", op: "-", a: builtinCall("length", [list]), b: num(1) },
                     by: null, body: body, line: line });
          return got;
        }
        function best(src, key, most) {
          var list = itemsName(src, ch, out);
          var got = nameNode(fresh(ch, most ? "biggest" : "smallest"), line);
          out.push({ k: "set", target: got, value: { k: "index", obj: list, at: num(0) }, line: line });
          ch.meet(got.v, { set: true }).values = [{ k: "index", obj: list, at: num(0) }];
          var each = loopName(key, 0, ch, singular(list));
          ch.meet(each, { set: true, loop: true, elem: { of: list } });
          var a = applied(key, [nameNode(each)], ch), b = applied(key, [got], ch);
          var body = lowered(function (o) {
            lowerOne({ k: "if", cond: { k: "bin", op: most ? ">" : "<", a: a, b: b }, orelse: [], line: line,
                       then: [{ k: "assign", target: got, value: nameNode(each), line: line }] }, ch, o);
          });
          out.push({ k: "foreach", v: each, over: list, body: body, line: line });
          return got;
        }
      }
      // A list gone through by place, which a table is not: its keys.
      function itemsName(src, ch, out) {
        var r = stripParens(src);
        if (r.k === "name" && kindOf(r, ch) !== "map") { return r; }
        var got = listName(src, ch, out, "items");
        if (kindOf(got, ch) === "map") {
          var keysOf = nameNode(fresh(ch, "keys"), src.line);
          out.push({ k: "set", target: keysOf, value: builtinCall("keys", [got]), line: src.line });
          ch.meet(keysOf.v, { set: true }).values = [builtinCall("keys", [got])];
          return keysOf;
        }
        return got;
      }
      // A function handed over as a value: its name, or a lambda made one.
      function fnValue(fn, ch, base) {
        fn = stripParens(fn);
        if (fn && fn.liftedAs) { return { k: "name", v: fn.liftedAs, fnRef: true }; }
        var got = fnValueOf(fn, ch, base);
        if (fn && got && got.fnRef && fn.k !== "fn") { fn.liftedAs = got.v; }
        return got;
      }
      function fnValueOf(fn, ch, base) {
        if (fn.k === "fn") { return liftLambda(fn, ch, base); }
        if (fn.k === "name" && userFn(fn.v)) { return nameNode(userFn(fn.v).name); }
        if (fn.k === "name" && /^(len|str|int|float|abs)$/.test(fn.v)) {
          return nameNode({ len: "length", str: "toString", int: "int", float: "real", abs: "abs" }[fn.v]);
        }
        if (fn.k === "call") {
          var p = bare(pathOf(fn.fn) || "");
          // Comparator.comparing(Person::getAge), Comparator.comparingInt(p -> p.age)
          if (/^Comparator\.(comparing|comparingInt|comparingDouble)$/.test(p) && fn.args.length === 1) {
            var inner = stripParens(fn.args[0]);
            if (inner.k === "member") {
              return liftLambda({ k: "fn", params: [{ name: "item" }], line: fn.line,
                                  body: [{ k: "return", value: { k: "call", fn: { k: "member", obj: nameNode("item"), name: inner.name }, args: [] } }] }, ch, base);
            }
            return fnValue(inner, ch, base);
          }
          if (/^(Comparator\.reverseOrder|Collections\.reverseOrder)$/.test(p)) {
            return liftLambda({ k: "fn", params: [{ name: "a" }, { name: "b" }], line: fn.line,
                                body: [{ k: "return", value: { k: "cond", test: { k: "bin", op: "<", a: nameNode("a"), b: nameNode("b") }, a: num(1), b: { k: "cond", test: { k: "bin", op: ">", a: nameNode("a"), b: nameNode("b") }, a: { k: "un", op: "-", a: num(1) }, b: num(0) } } }] }, ch, base);
          }
          if (/^(std\.greater|greater)$/.test(p)) {
            return liftLambda({ k: "fn", params: [{ name: "a" }, { name: "b" }], line: fn.line,
                                body: [{ k: "return", value: { k: "bin", op: ">", a: nameNode("a"), b: nameNode("b") } }] }, ch, base);
          }
        }
        if (fn.k === "member") {
          return liftLambda({ k: "fn", params: [{ name: "item" }], line: fn.line,
                              body: [{ k: "return", value: applied(fn, [nameNode("item")], ch) }] }, ch, base);
        }
        return fn;
      }

      // ---- comprehensions --------------------------------------------------
      // [x * x for x in xs if x > 0] is the loop it says, filling a list.
      function compInto(target, comp, ch, out) {
        var line = comp.line;
        var t = stripParens(target);
        if (t.k !== "name") { t = ready(t, ch, out).e; }
        var start = comp.kind === "dict" ? { k: "dict", keys: [], values: [] } : { k: "list", items: [] };
        out.push({ k: "set", target: t, value: start, line: line });
        if (t.k === "name") {
          ch.meet(t.v, { set: true, kind: comp.kind === "dict" ? "map" : comp.kind === "set" ? "set" : "list" });
        }
        // names the comprehension keeps to itself, where the chart has one
        var rename = {};
        comp.fors.forEach(function (f) {
          patNames(f.target, rename);
        });
        var inner = copyOf(comp);
        Object.keys(rename).forEach(function (n) {
          if (outsideNames(ch)[n] && n !== "_") {
            var to = fresh(ch, n);
            inner = swapName(inner, n, nameNode(to));
          }
        });
        var innermost;
        if (inner.kind === "dict") {
          innermost = [{ k: "assign", target: { k: "index", obj: t, at: inner.key, line: line }, value: inner.value, line: line }];
        } else if (inner.kind === "set") {
          innermost = [{ k: "if", cond: { k: "un", op: "!", a: builtinCall("contains", [t, inner.elt], line) }, line: line,
                         then: [{ k: "expr", e: builtinCall("append", [t, inner.elt], line), line: line }], orelse: [] }];
        } else {
          innermost = [{ k: "expr", e: builtinCall("append", [t, inner.elt], line), line: line }];
          if (t.k === "name") { noteElem(ch, t.v, { value: inner.elt }); }
        }
        var body = innermost;
        for (var i = inner.fors.length - 1; i >= 0; i--) {
          var f = inner.fors[i];
          f.ifs.slice().reverse().forEach(function (c) {
            body = [{ k: "if", cond: c, then: body, orelse: [], line: line }];
          });
          var it = stripParens(f.iter), tv = stripParens(f.target);
          if (it.k === "call" && pathOf(it.fn) === "range" && it.args.length >= 1 && it.args.length <= 3 && tv.k === "name") {
            body = [{ k: "range", v: tv.v, args: it.args, body: body, line: line }];
          } else {
            body = [{ k: "foreach", target: f.target, over: f.iter, body: body, line: line }];
          }
        }
        out.push.apply(out, lower(body, ch));
      }
      // Java's and C#'s switch used for its value: the switch it is, each
      // case putting its value into one name.
      function switchInto(target, sw, ch, out) {
        var cases = sw.cases.map(function (c) {
          var v = stripParens(c.value), body;
          if (v && v.k === "block") {
            body = v.body.map(function (s) {
              return s.k === "yield" ? { k: "assign", target: target, value: s.value, line: s.line } : s;
            });
          } else {
            body = [{ k: "assign", target: target, value: c.value, line: c.line }];
          }
          return { labels: c.labels, isDefault: c.isDefault, guard: c.guard, body: body, line: c.line };
        });
        out.push.apply(out, lowerSwitch({ subject: sw.subject, cases: cases, noFall: true, line: sw.line }, ch));
      }

      // ---- what is done to lists, tables and words ----------------------
      // v.begin(), begin(v): the list itself
      function beginOf(e) {
        e = stripParens(e);
        if (e && e.k === "call" && e.fn.k === "member" && /^(begin|end|cbegin|rbegin)$/.test(e.fn.name)) { return e.fn.obj; }
        if (e && e.k === "call" && e.fn.k === "name" && /^(begin|end)$/.test(e.fn.v) && e.args.length) { return e.args[0]; }
        if (e && e.k === "bin" && e.op === "+" && beginOf(e.a) !== stripParens(e.a)) { return beginOf(e.a); }
        return e;
      }
      // v.begin() + i: i
      function offsetOf(e) {
        e = stripParens(e);
        if (e && e.k === "bin" && e.op === "+" && beginOf(e.a) !== stripParens(e.a)) { return e.b; }
        if (e && e.k === "call" && e.fn.k === "member" && e.fn.name === "end") { return builtinCall("length", [e.fn.obj]); }
        return num(0);
      }
      function isBuilder(e, ch) {
        e = stripParens(e);
        if (e.k !== "name") { return false; }
        var one = ch.names[e.v] || ch.params[e.v] || globalChart.names[e.v];
        if (one && one.typeInfo && /^(StringBuilder|StringBuffer|string|wstring)$/.test(String(one.typeInfo.name).replace(/^.*::/, ""))) { return true; }
        return !!(one && (one.values || []).some(function (v) {
          v = stripParens(v);
          return v && v.k === "new" && v.type && /^(StringBuilder|StringBuffer)$/.test(v.type.name);
        }));
      }
      function libStatement(e, ch, out, line) {
        var f = e.fn, p = bare(pathOf(f) || "");
        var args = e.args.filter(function (a) { return a.k !== "kw"; });
        var kw = {};
        e.args.forEach(function (a) { if (a.k === "kw") { kw[a.name] = a.value; } });
        function R(x) { return ready(x, ch, out).e; }
        function call(name, list) { out.push({ k: "call", e: builtinCall(name, list, line), line: line }); return true; }
        function put(t, v) { assign(t, v, ch, out, line); return true; }
        function addTo(list, x) {
          var r = R(x);
          if (list.k === "name") { noteElem(ch, list.v, { value: r }); }
          return call("append", [list, r]);
        }
        if (/^(random\.shuffle|Collections\.shuffle|shuffle|std\.shuffle|random_shuffle|std\.random_shuffle)$/.test(p) && args.length >= 1) {
          return call("shuffle", [R(beginOf(args[0]))]);
        }
        if (/^(Collections\.sort|Arrays\.sort|Array\.Sort|sort|std\.sort|stable_sort|std\.stable_sort)$/.test(p) && args.length && !userFn(p)) {
          var cmp = cpp ? args[2] : args[1];
          if (kindOf(beginOf(args[0]), ch) === "text") {
            return put(beginOf(args[0]), builtinCall("join", [builtinCall("sorted", [R(beginOf(args[0]))]), { k: "str", v: "" }], line));
          }
          return call("sort", [R(beginOf(args[0]))].concat(cmp ? [fnValue(cmp, ch, "compare")] : []));
        }
        if (/^(Collections\.reverse|Array\.Reverse|reverse|std\.reverse)$/.test(p) && args.length && !userFn(p)) {
          var turned = beginOf(args[0]);
          // words cannot be turned round where they are: they are made again
          if (kindOf(turned, ch) === "text") { return put(turned, builtinCall("reversed", [R(turned)], line)); }
          return call("reverse", [R(turned)]);
        }
        if (/^(std\.swap|swap|Collections\.swap)$/.test(p) && !userFn("swap")) {
          if (args.length === 2) {
            assignMany({ k: "tuple", items: [args[0], args[1]] }, { k: "tuple", items: [args[1], args[0]] }, ch, out, line);
            return true;
          }
          if (args.length === 3) {                  // Collections.swap(list, i, j)
            var l = args[0];
            assignMany({ k: "tuple", items: [{ k: "index", obj: l, at: args[1] }, { k: "index", obj: l, at: args[2] }] },
                       { k: "tuple", items: [{ k: "index", obj: l, at: args[2] }, { k: "index", obj: l, at: args[1] }] }, ch, out, line);
            return true;
          }
        }
        if (/^(Arrays\.fill|std\.fill|fill)$/.test(p) && args.length >= 2 && !userFn(p)) {
          var arr = R(beginOf(args[0])), val = R(cpp ? args[2] : args[args.length - 1]);
          var k = fresh(ch, "i");
          ch.meet(k, { kind: "int", set: true, loop: true });
          out.push({ k: "for", v: k, from: num(0), to: { k: "bin", op: "-", a: builtinCall("length", [arr]), b: num(1) }, by: null, line: line,
                     body: [{ k: "set", target: { k: "index", obj: arr, at: nameNode(k) }, value: val, line: line }] });
          return true;
        }
        if (/^(heapq\.heappush|bisect\.insort)$/.test(p) && args.length === 2) {
          var hl = R(args[0]);
          addTo(hl, args[1]);
          return call("sort", [hl]);
        }
        if (f.k !== "member") { return false; }
        var m = f.name, obj = stripParens(f.obj);
        var ok = kindOf(obj, ch);
        if (recordOf(ok)) { return false; }
        var o = R(obj);
        // words built a piece at a time: StringBuilder, and C++'s string
        if (ok === "text" || isBuilder(obj, ch)) {
          switch (m) {
            case "append": case "Append": case "push_back": case "concat":
              return put(obj, { k: "bin", op: "+", a: o, b: args[0] || { k: "str", v: "" }, line: line });
            case "AppendLine":
              return put(obj, { k: "bin", op: "+", a: { k: "bin", op: "+", a: o, b: args[0] || { k: "str", v: "" } },
                                b: { k: "name", v: "NewLine", constant: true }, line: line });
            case "insert": case "Insert":
              return put(obj, { k: "bin", op: "+", line: line,
                                a: { k: "bin", op: "+", a: builtinCall("substring", [o, num(0), args[0]]), b: args[1] },
                                b: builtinCall("substring", [o, args[0]]) });
            case "reverse": case "Reverse":
              return put(obj, builtinCall("reversed", [o], line));
            case "setLength": case "Clear": case "clear":
              return put(obj, { k: "str", v: "" });
            case "deleteCharAt": case "erase":
              if (args.length === 1) {
                return put(obj, { k: "bin", op: "+", a: builtinCall("substring", [o, num(0), args[0]]),
                                  b: builtinCall("substring", [o, { k: "bin", op: "+", a: args[0], b: num(1) }]), line: line });
              }
              break;
            case "pop_back":
              return put(obj, builtinCall("substring", [o, num(0), { k: "un", op: "-", a: num(1) }], line));
          }
          if (ok === "text") { return false; }
        }
        var isSet = /^set/.test(ok || "");
        var isMap = ok === "map";
        switch (m) {
          case "append": case "push": case "push_back": case "emplace_back": case "addLast": case "offer":
          case "offerLast": case "Enqueue": case "enqueue": case "Push": case "add": case "Add": case "AddLast":
            if (isMap && args.length === 2) { return put({ k: "index", obj: o, at: args[0] }, args[1]); }
            if ((m === "add" || m === "Add") && args.length === 2 && java) { return call("insert", [o, R(args[0]), R(args[1])]); }
            if (isSet || (py && m === "add")) {
              args.forEach(function (a) {
                var r = R(a);
                out.push({ k: "if", cond: { k: "un", op: "!", a: builtinCall("contains", [o, r]) }, orelse: [], line: line,
                           then: [{ k: "call", e: builtinCall("append", [o, r], line), line: line }] });
                if (o.k === "name") { noteElem(ch, o.v, { value: r }); }
              });
              return true;
            }
            if (!args.length) { return false; }
            args.forEach(function (a) { addTo(o, a); });
            return true;
          case "unshift": case "addFirst": case "push_front": case "offerFirst": case "appendleft": case "AddFirst":
            args.slice().reverse().forEach(function (a) { call("insert", [o, num(0), R(a)]); });
            return true;
          case "insert": case "Insert": case "emplace":
            if (cpp && args.length === 2 && beginOf(args[0]) !== stripParens(args[0])) {
              return call("insert", [o, R(offsetOf(args[0])), R(args[1])]);
            }
            if (cpp && isSet && args.length === 1) { return libStatement({ k: "call", fn: { k: "member", obj: f.obj, name: "add" }, args: args }, ch, out, line); }
            if (cpp && isMap && args.length === 1) {
              var pr = stripParens(args[0]);
              var kv = pr.k === "list" ? pr.items : pr.k === "call" && /make_pair|pair/.test(pathOf(pr.fn) || "") ? pr.args : null;
              if (kv && kv.length === 2) { return put({ k: "index", obj: o, at: kv[0] }, kv[1]); }
            }
            if (isMap && args.length === 2) { return put({ k: "index", obj: o, at: args[0] }, args[1]); }
            if (args.length === 2) { return call("insert", [o, R(args[0]), R(args[1])]); }
            return false;
          case "extend": case "addAll": case "AddRange": case "concat": case "update":
            if (isMap || (py && m === "update" && !isSet)) {
              var other = R(args[0]), key = fresh(ch, "key");
              ch.meet(key, { set: true, loop: true });
              out.push({ k: "foreach", v: key, over: builtinCall("keys", [other]), line: line,
                         body: [{ k: "set", target: { k: "index", obj: o, at: nameNode(key) }, value: { k: "index", obj: other, at: nameNode(key) }, line: line }] });
              return true;
            }
            if (!args.length) { return false; }
            var more = stripParens(args[args.length - 1]);
            if (more.k === "list" || more.k === "tuple") { more.items.forEach(function (a) { addTo(o, a); }); return true; }
            if (isSet) {
              var each = fresh(ch, "item");
              ch.meet(each, { set: true, loop: true, elem: { of: more } });
              out.push({ k: "foreach", v: each, over: R(more), line: line,
                         body: [{ k: "if", cond: { k: "un", op: "!", a: builtinCall("contains", [o, nameNode(each)]) }, orelse: [], line: line,
                                  then: [{ k: "call", e: builtinCall("append", [o, nameNode(each)]), line: line }] }] });
              return true;
            }
            if (o.k === "name") { noteElem(ch, o.v, { of: more }); }
            return call("extend", [o, R(more)]);
          case "pop": case "pop_back": case "removeLast": case "Pop": case "RemoveLast":
            if (cpp && m === "pop" && ch.names[pathOf(obj)] && ch.names[pathOf(obj)].typeInfo &&
                /queue/.test(ch.names[pathOf(obj)].typeInfo.name)) {
              return call("pop", [o, num(0)]);
            }
            return call("pop", [o].concat(args.length ? [R(args[0])] : []));
          case "shift": case "poll": case "pollFirst": case "Dequeue": case "dequeue": case "pop_front":
          case "removeFirst": case "popleft": case "RemoveFirst": case "remove_first":
            if (m === "poll" && !isListKind(ok)) { return false; }
            return call("pop", [o, num(0)]);
          case "RemoveAt": case "removeAt":
            return call("pop", [o, R(args[0])]);
          case "remove": case "Remove": case "discard": case "erase": case "delete": case "Delete":
            if (!args.length) { return false; }
            if (cpp && beginOf(args[0]) !== stripParens(args[0])) { return call("pop", [o, R(offsetOf(args[0]))]); }
            if (isMap) { return call("remove", [o, R(args[0])]); }
            if (java && m === "remove" && kindOf(args[0], ch) === "int" && !/^set/.test(ok || "")) {
              return call("pop", [o, R(args[0])]);
            }
            if (m === "discard" || m === "delete" || m === "erase" || isSet) {
              var gone = R(args[0]);
              out.push({ k: "if", cond: builtinCall("contains", [o, gone]), orelse: [], line: line,
                         then: [{ k: "call", e: builtinCall("remove", [o, gone], line), line: line }] });
              return true;
            }
            return call("remove", [o, R(args[0])]);
          case "clear": case "Clear":
            return call("clear", [o]);
          case "sort": case "Sort": {
            var how = args[0] || kw.key || kw.cmp;
            call("sort", [o].concat(how ? [fnValue(how, ch, args[0] && stripParens(args[0]).k === "fn" &&
                                                      stripParens(args[0]).params.length === 2 ? "compare" : "key")] : []));
            if (kw.reverse && stripParens(kw.reverse).v) { call("reverse", [o]); }
            return true;
          }
          case "reverse": case "Reverse":
            return call("reverse", [o]);
          case "put": case "set": case "Set": case "insert_or_assign": case "TryAdd":
            if (args.length !== 2) { return false; }
            if (isMap || m === "put" || js || cs) { return put({ k: "index", obj: o, at: args[0] }, args[1]); }
            return put({ k: "index", obj: o, at: args[0] }, args[1]);
          case "putIfAbsent": case "setdefault":
            if (args.length !== 2) { return false; }
            out.push({ k: "if", cond: { k: "un", op: "!", a: builtinCall("contains", [o, R(args[0])]) }, orelse: [], line: line,
                       then: lowered(function (t) { assign({ k: "index", obj: o, at: args[0] }, args[1], ch, t, line); }) });
            return true;
          case "fill":
            if (args.length === 1) { return libStatement({ k: "call", fn: nameNode("fill"), args: [f.obj, args[0]] }, ch, out, line); }
            return false;
          case "reserve": case "ensureCapacity": case "trimToSize": case "shrink_to_fit": case "TrimExcess":
            return true;
          case "resize":
            if (args.length >= 1) {
              return put(obj, { k: "sized", dims: [args[0]], fill: args[1] || num(0), kind: elemKind(ok) });
            }
            return false;
        }
        return false;
      }

      // What each language calls square root, length, random and the rest,
      // and what pseudocode calls them -- as the expression to write in its
      // place, or null where it is nobody's but the program's.
      function libCall(e, ch) {
        e = stripParens(e);
        if (!e) { return null; }
        if (e.k === "new") { return newOf(e, ch); }
        if (e.k === "newarr") {
          if (e.init) { return e.init; }
          var sz = sizedOf(e);
          return sz ? { k: "sized", dims: sz.dims, fill: sz.fill, kind: sz.kind, line: e.line } : { k: "list", items: [] };
        }
        if (e.k === "member") { return propOf(e, ch); }
        if (e.k !== "call" || e.builtin || e.mine) { return null; }
        var mine = resolveCall(e, ch);
        if (mine) { return mine; }
        var p = bare(pathOf(e.fn) || "");
        var a = e.args.filter(function (x) { return x.k !== "kw"; });
        var kw = {};
        e.args.forEach(function (x) { if (x.k === "kw") { kw[x.name] = x.value; } });
        var dot = e.fn.k === "member" ? e.fn.name : null;
        var self = e.fn.k === "member" ? e.fn.obj : null;
        var sk = self ? kindOf(self, ch) : null;
        var lib = /^(math|Math|std|cmath|numpy|np)?\.?/;
        var name = p.replace(lib, "");
        function B(fn, args) { return builtinCall(fn, args, e.line); }
        function bin(op, x, y) { return { k: "bin", op: op, a: x, b: y, line: e.line }; }
        var rnd = randomRange(e);
        if (rnd) { return rnd; }
        if (/^(sqrt|Sqrt|cbrt)$/.test(name) && p !== "") { return B("sqrt", a); }
        if (/^(abs|Abs|fabs)$/.test(name) && a.length === 1) { return B("abs", a); }
        if (/^(floor|Floor)$/.test(name) && a.length === 1) { return B("floor", a); }
        if (/^(ceil|Ceiling|ceiling)$/.test(name) && a.length === 1) { return B("ceiling", a); }
        if (/^(round|Round|lround|rint)$/.test(name) && a.length >= 1) {
          if (a.length === 2) {
            var n = stripParens(a[1]);
            if (n.k === "num") {
              var scale = Math.pow(10, parseInt(n.v, 10));
              return bin("/", B("round", [bin("*", a[0], num(scale))]), num(scale));
            }
          }
          return B("round", [a[0]]);
        }
        if (/^(pow|Pow)$/.test(name) && a.length === 2) { return bin("**", a[0], a[1]); }
        if (/^(min|max|Min|Max|fmin|fmax)$/.test(name) && a.length >= 1 && !(self && !/^(Math|math|std)$/.test(pathOf(self) || ""))) {
          if (a.length === 1 && a[0].k === "star") { return B(name.replace(/^f/, "").toLowerCase(), [a[0].e]); }
          return B(name.replace(/^f/, "").toLowerCase(), a.map(beginOf));
        }
        if (/^(log|Log|exp|Exp|sin|Sin|cos|Cos|tan|Tan|atan|Atan|atan2|Atan2|hypot|log10|Log10|trunc|Truncate|sign|Sign|asin|acos)$/.test(name) && p !== "" && /^(math|Math|std|cmath)?\.?/.test(p)) {
          var low2 = name.toLowerCase().replace("truncate", "trunc");
          return B(low2, a);
        }
        if (/^(int|Math\.trunc|trunc|Integer\.parseInt|int\.Parse|Int32\.Parse|Convert\.ToInt32|parseInt|stoi|long\.Parse|Integer\.valueOf|Long\.parseLong|stol|atoi|Convert\.ToInt64)$/.test(p) && a.length) {
          return B("int", [a[0]]);
        }
        if (/^(float|Double\.parseDouble|double\.Parse|Convert\.ToDouble|parseFloat|Number|stod|stof|Double\.valueOf|atof|Float\.parseFloat|decimal\.Parse)$/.test(p) && a.length === 1) {
          var fk = kindOf(a[0], ch);
          return fk === "int" || fk === "real" ? a[0] : B("real", [a[0]]);
        }
        if (/^(str|String|String\.valueOf|to_string|Integer\.toString|Double\.toString|Convert\.ToString|std\.to_string|JSON\.stringify|repr)$/.test(p) && a.length === 1) {
          var d = described(a[0]);
          if (d !== a[0]) { return d; }
          return kindOf(a[0], ch) === "text" ? a[0] : B("toString", [a[0]]);
        }
        if (dot && /^(toString|ToString|str)$/.test(dot) && !a.length) {
          var dd = described(self);
          if (dd !== self) { return dd; }
          return kindOf(self, ch) === "text" ? self : B("toString", [self]);
        }
        if (/^(bool|Boolean)$/.test(p) && a.length === 1) { return bin("!=", a[0], num(0)); }
        if (p === "len" && a.length === 1) { return B("length", [a[0]]); }
        if (dot && /^(length|size|Length|Count|count)$/.test(dot) && !a.length && !(dot === "count" && py)) { return B("length", [self]); }
        if (dot && /^(isEmpty|empty|IsEmpty)$/.test(dot) && !a.length) { return bin("==", B("length", [self]), num(0)); }
        if (/^(string\.IsNullOrEmpty|String\.IsNullOrEmpty|string\.IsNullOrWhiteSpace)$/.test(p) && a.length === 1) {
          return bin("==", B("length", [B("trim", [a[0]])]), num(0));
        }
        if (dot && /^(upper|toUpperCase|ToUpper|toUpper)$/.test(dot) && !a.length) { return B("toUpper", [self]); }
        if (dot && /^(lower|toLowerCase|ToLower|toLower)$/.test(dot) && !a.length) { return B("toLower", [self]); }
        if (/^(toUpper|toLower|toupper|tolower|Character\.toUpperCase|Character\.toLowerCase|char\.ToUpper|char\.ToLower)$/.test(p) && a.length === 1) {
          return B(/upper/i.test(p) ? "toUpper" : "toLower", [a[0]]);
        }
        if (dot && /^(strip|trim|Trim|lstrip|rstrip|trimStart|trimEnd|TrimStart|TrimEnd)$/.test(dot) && !a.length) { return B("trim", [self]); }
        if (dot && /^(equals|Equals|equalsIgnoreCase)$/.test(dot) && a.length === 1) { return bin("==", self, a[0]); }
        if (/^(Objects\.equals|object\.Equals|string\.Equals)$/.test(p) && a.length === 2) { return bin("==", a[0], a[1]); }
        if (dot && /^(compareTo|CompareTo|compare)$/.test(dot) && a.length === 1) {
          return { k: "compare", a: self, b: a[0], line: e.line };
        }
        if (/^(string\.Compare|String\.Compare|strcmp|string\.CompareOrdinal|Integer\.compare|Double\.compare)$/.test(p) && a.length === 2) {
          return { k: "compare", a: a[0], b: a[1], line: e.line };
        }
        if (/^(fmod|math\.fmod|Math\.IEEERemainder)$/.test(p) && a.length === 2) { return bin("%", a[0], a[1]); }
        if (/^(divmod)$/.test(p) && a.length === 2) {
          return { k: "list", items: [bin("//", a[0], a[1]), bin("%", a[0], a[1])], line: e.line };
        }
        // words
        if (dot && /^(split|Split)$/.test(dot)) {
          var sep = a[0] ? stripParens(a[0]) : null;
          if (!sep || (sep.k === "regex" && /^\\s[+*]?$/.test(sep.v)) || (sep.k === "str" && /^(\\\\s\+|\\s\+|\s+)$/.test(sep.v) && java) ||
              (sep.k === "str" && sep.v === " " && (java || js) && false)) {
            return B("split", [self]);
          }
          if (sep.k === "regex") { return B("split", [self, { k: "str", v: sep.v.replace(/\\(.)/g, "$1") }]); }
          return B("split", [self, a[0]]);
        }
        if (dot === "join" && py && a.length === 1) {
          var joined = stripParens(a[0]);
          // " ".join(str(x) for x in xs) is " ".join(xs): join says each one
          if (joined.k === "comp" && joined.fors.length === 1 && !joined.fors[0].ifs.length) {
            var el = stripParens(joined.elt), tv = stripParens(joined.fors[0].target);
            if (el.k === "call" && pathOf(el.fn) === "str" && el.args.length === 1 && tv.k === "name" &&
                stripParens(el.args[0]).k === "name" && stripParens(el.args[0]).v === tv.v) {
              return B("join", [joined.fors[0].iter, self]);
            }
          }
          return B("join", [a[0], self]);
        }
        if (dot === "join" && (js || java || cs) && a.length <= 1 && !/^(String|string)$/.test(pathOf(self) || "")) {
          return B("join", [self, a[0] || { k: "str", v: js ? "," : "" }]);
        }
        if (/^(String\.join|string\.Join|String\.Join)$/.test(p) && a.length >= 2) {
          return B("join", [a.length === 2 ? a[1] : { k: "list", items: a.slice(1) }, a[0]]);
        }
        if (dot && /^(replace|Replace|replaceAll)$/.test(dot) && a.length === 2 && (sk === "text" || !isListKind(sk))) {
          return B("replace", [self, stripParens(a[0]).k === "regex" ? { k: "str", v: stripParens(a[0]).v } : a[0], a[1]]);
        }
        if (dot && /^(find|indexOf|IndexOf|index)$/.test(dot) && a.length === 1 && !(dot === "find" && cpp && sk !== "text")) {
          return B("indexOf", [self, a[0]]);
        }
        if (dot === "find" && cpp && a.length === 1) {
          return isListKind(sk) ? B("indexOf", [self, a[0]]) : B("indexOf", [self, a[0]]);
        }
        if (dot && /^(count|Count)$/.test(dot) && a.length === 1 && stripParens(a[0]).k !== "fn") {
          if (cpp && sk === "map") { return B("contains", [self, a[0]]); }
          return B("count", [self, a[0]]);
        }
        if (dot && /^(startswith|startsWith|StartsWith|starts_with)$/.test(dot) && a.length === 1) { return B("startsWith", [self, a[0]]); }
        if (dot && /^(endswith|endsWith|EndsWith|ends_with)$/.test(dot) && a.length === 1) { return B("endsWith", [self, a[0]]); }
        if (dot && /^(isdigit|isnumeric|isdecimal)$/.test(dot) && !a.length) { return B("isDigit", [self]); }
        if (dot && /^(isalpha)$/.test(dot) && !a.length) { return B("isAlpha", [self]); }
        if (dot && /^(isalnum)$/.test(dot) && !a.length) { return bin("||", B("isAlpha", [self]), B("isDigit", [self])); }
        if (dot && /^(isupper)$/.test(dot) && !a.length) { return B("isUpper", [self]); }
        if (dot && /^(islower)$/.test(dot) && !a.length) { return B("isLower", [self]); }
        if (dot && /^(isspace)$/.test(dot) && !a.length) { return B("isSpace", [self]); }
        if (/^(Character\.isDigit|char\.IsDigit|isdigit|Character\.isLetter|char\.IsLetter|isalpha|Character\.isUpperCase|char\.IsUpper|isupper|Character\.isLowerCase|char\.IsLower|islower|Character\.isWhitespace|char\.IsWhiteSpace|isspace|Character\.isLetterOrDigit|char\.IsLetterOrDigit|isalnum)$/.test(p) && a.length === 1) {
          if (/Digit$|digit$/.test(p) && !/LetterOrDigit/.test(p)) { return B("isDigit", a); }
          if (/LetterOrDigit|alnum/.test(p)) { return bin("||", B("isAlpha", a), B("isDigit", a)); }
          if (/Letter|alpha/.test(p)) { return B("isAlpha", a); }
          if (/Upper|upper/.test(p)) { return B("isUpper", a); }
          if (/Lower|lower/.test(p)) { return B("isLower", a); }
          return B("isSpace", a);
        }
        if (dot && /^(charAt|at|ElementAt|elementAt|get|Get)$/.test(dot) && a.length === 1 && sk !== "map" &&
            !(dot === "get" && py)) {
          return { k: "index", obj: self, at: a[0], line: e.line };
        }
        if (dot === "get" && (sk === "map" || py || java || js) && a.length >= 1) {
          if (a.length === 1 && !py) { return { k: "index", obj: self, at: a[0], line: e.line }; }
          return B("get", [self, a[0], a[1] || { k: "null" }]);
        }
        if (dot && /^(getOrDefault|GetValueOrDefault)$/.test(dot) && a.length >= 1) {
          return B("get", [self, a[0], a[1] || { k: "null" }]);
        }
        if (dot && /^(containsKey|ContainsKey|has|containsValue|ContainsValue|includes|contains|Contains|__contains__|has_key)$/.test(dot) && a.length === 1) {
          if (/Value/.test(dot)) { return B("contains", [B("values", [self]), a[0]]); }
          return B("contains", [self, a[0]]);
        }
        if (dot && /^(keys|keySet|Keys)$/.test(dot) && !a.length) { return B("keys", [self]); }
        if (dot && /^(values|Values)$/.test(dot) && !a.length) { return B("values", [self]); }
        if (dot && /^(items|entrySet|entries)$/.test(dot) && !a.length) { return B("items", [self]); }
        if (/^(Object\.keys|Object\.values|Object\.entries)$/.test(p) && a.length === 1) {
          return B({ "Object.keys": "keys", "Object.values": "values", "Object.entries": "items" }[p], a);
        }
        if (dot && /^(substring|Substring|substr|slice|subList|GetRange|subSequence)$/.test(dot) && a.length >= 1 &&
            (sk === "text" || isListKind(sk) || dot !== "slice" || js)) {
          var fnName = isListKind(sk) ? "slice" : "substring";
          if ((dot === "substr" && (cpp || js)) || dot === "Substring" || dot === "GetRange") {
            if (a.length === 1) { return B(fnName, [self, a[0]]); }
            return B(fnName, [self, a[0], plus(a[0], a[1])]);
          }
          if (dot === "slice" && isListKind(sk) === false && sk !== "text" && js) { fnName = "slice"; }
          return B(fnName, [self].concat(a.slice(0, 2)));
        }
        if (dot && /^(padStart|PadLeft|rjust|zfill)$/.test(dot) && a.length >= 1) {
          return B("padLeft", [self, a[0], dot === "zfill" ? { k: "str", v: "0" } : a[1] || { k: "str", v: " " }]);
        }
        if (dot && /^(padEnd|PadRight|ljust)$/.test(dot) && a.length >= 1) {
          return B("padRight", [self, a[0], a[1] || { k: "str", v: " " }]);
        }
        if (dot && /^(center)$/.test(dot)) { return null; }
        if (dot === "repeat" && a.length === 1 && (js || java)) { return B("repeat", [self, a[0]]); }
        if (dot && /^(sort|Sort)$/.test(dot) && (isListKind(sk) || !sk) && a.length <= 1) {
          return B("sort", [self].concat(a.length ? [fnValue(a[0], ch, stripParens(a[0]).k === "fn" &&
                                                     stripParens(a[0]).params.length === 2 ? "compare" : "key")] : []));
        }
        if (dot && /^(reverse|Reverse)$/.test(dot) && !a.length && sk !== "map") { return B("reverse", [self]); }
        if (dot && /^(capitalize|title)$/.test(dot) && !a.length) {
          return bin("+", B("toUpper", [B("substring", [self, num(0), num(1)])]),
                     dot === "capitalize" ? B("toLower", [B("substring", [self, num(1)])]) : B("substring", [self, num(1)]));
        }
        if (dot && /^(toCharArray|ToCharArray)$/.test(dot) && !a.length) { return B("split", [self, { k: "str", v: "" }]); }
        if (dot && /^(toCharArray|ToCharArray|chars|toList|ToList|ToArray|toArray|clone|Clone|copy|stream|AsEnumerable|slice)$/.test(dot) && !a.length) {
          if (/^(clone|Clone|copy|slice)$/.test(dot)) { return B("copy", [self]); }
          return self;
        }
        if (dot === "concat" && a.length >= 1) {
          return a.reduce(function (acc, x) { return bin("+", acc, x); }, self);
        }
        if (/^(ord|charCodeAt)$/.test(dot || p)) { return B("ord", dot ? [self] : a); }
        if (/^(chr|String\.fromCharCode)$/.test(p) && a.length === 1) { return B("chr", a); }
        // lists
        if (/^(sum|Sum)$/.test(p) && a.length >= 1) {
          var total = B("sum", [a[0]]);
          return a[1] ? bin("+", total, a[1]) : total;
        }
        if (dot && /^(sum|Sum)$/.test(dot) && !a.length) { return B("sum", [self]); }
        if (dot && /^(max|Max|min|Min)$/.test(dot) && !a.length) { return B(dot.toLowerCase(), [self]); }
        if (dot && /^(average|Average)$/.test(dot) && !a.length) { return bin("/", B("sum", [self]), B("length", [self])); }
        if (dot && /^(getAsInt|getAsDouble|orElse|get|Value|orElseThrow)$/.test(dot) && self && stripParens(self).k === "call") {
          return self;
        }
        if (/^(std\.accumulate|accumulate)$/.test(p) && a.length >= 3) { return bin("+", B("sum", [beginOf(a[0])]), a[2]); }
        if (/^(std\.count|count)$/.test(p) && a.length === 3 && cpp) { return B("count", [beginOf(a[0]), a[2]]); }
        if (/^(std\.max_element|max_element|std\.min_element|min_element)$/.test(p) && a.length >= 2) {
          return B(/max/.test(p) ? "max" : "min", [beginOf(a[0])]);
        }
        if (/^(std\.find|find)$/.test(p) && a.length === 3 && cpp) { return B("indexOf", [beginOf(a[0]), a[2]]); }
        if (/^(sorted)$/.test(p) && a.length === 1) {
          var sorted = B("sorted", [a[0]].concat(kw.key ? [fnValue(kw.key, ch, "key")] : []));
          return kw.reverse && stripParens(kw.reverse).v ? B("reversed", [sorted]) : sorted;
        }
        if (/^(reversed)$/.test(p) && a.length === 1) { return B("reversed", [a[0]]); }
        if (/^(list|tuple|Array\.from|List\.copyOf|new ArrayList)$/.test(p) && a.length === 1) {
          var src = stripParens(a[0]);
          if (src.k === "call" && pathOf(src.fn) === "range") { return libCall(src, ch) || src; }
          return B("toList", [a[0]]);
        }
        if (/^(list|tuple)$/.test(p) && !a.length) { return { k: "list", items: [] }; }
        if (/^(set|frozenset)$/.test(p)) { return a.length ? B("unique", [a[0]]) : { k: "list", items: [] }; }
        if (/^(dict|Dict)$/.test(p) && !a.length) { return { k: "dict", keys: [], values: [] }; }
        if (p === "range" && a.length >= 1) { return B("range", a); }
        if (/^(any|all)$/.test(p) && a.length === 1) { return B(p, a); }
        if (/^(enumerate|zip)$/.test(p)) { return B(p, a); }
        if (dot && /^(index)$/.test(dot) && a.length === 1) { return B("indexOf", [self, a[0]]); }
        if (dot && /^(peek|Peek|back|top|last|Last|getLast|peekLast|lastElement)$/.test(dot) && !a.length) {
          return { k: "index", obj: self, at: bin("-", B("length", [self]), num(1)), line: e.line };
        }
        if (dot && /^(front|first|First|getFirst|peekFirst|firstElement|element)$/.test(dot) && !a.length) {
          if (dot === "peek" || (dot === "Peek" && cs)) { return null; }
          return { k: "index", obj: self, at: num(0), line: e.line };
        }
        if (dot && /^(pop|Pop|pop_back|removeLast|shift|poll|Dequeue|dequeue|popleft|removeFirst|RemoveAt|remove)$/.test(dot) && sk !== "text") {
          if (dot === "remove" && !(java && a.length === 1 && kindOf(a[0], ch) === "int") && !(sk === "map" || a.length === 0)) { return null; }
          if (/^(shift|poll|Dequeue|dequeue|popleft|removeFirst)$/.test(dot) || (dot === "remove" && !a.length)) { return B("pop", [self, num(0)]); }
          return B("pop", [self].concat(a.slice(0, 1)));
        }
        if (/^(Arrays\.asList|List\.of|Set\.of|Stream\.of|Arrays\.stream|Collections\.unmodifiableList|new List)$/.test(p)) {
          if (a.length === 1 && /stream|asList/.test(p) && isListKind(kindOf(a[0], ch))) { return a[0]; }
          return { k: "list", items: a, line: e.line };
        }
        if (/^(Map\.of)$/.test(p)) {
          var ks = [], vs = [];
          for (var i = 0; i + 1 < a.length; i += 2) { ks.push(a[i]); vs.push(a[i + 1]); }
          return { k: "dict", keys: ks, values: vs, line: e.line };
        }
        if (/^(Arrays\.toString|Arrays\.deepToString|String\.valueOf|Array\.toString)$/.test(p) && a.length === 1) { return a[0]; }
        if (/^(make_pair|std\.make_pair|pair|std\.pair|make_tuple|std\.make_tuple|Tuple\.Create|Map\.entry|entry)$/.test(p) && a.length >= 2) {
          return { k: "list", items: a, line: e.line };
        }
        if (/^(Collections\.max|Collections\.min)$/.test(p) && a.length === 1) { return B(/max/.test(p) ? "max" : "min", a); }
        if (/^(Array\.isArray)$/.test(p) && a.length === 1) { return bin("==", B("classOf", a), { k: "str", v: "List" }); }
        if (/^(Number\.isInteger)$/.test(p) && a.length === 1) { return bin("==", a[0], B("int", a)); }
        if (/^(isNaN|Number\.isNaN)$/.test(p) && a.length === 1) { return { k: "un", op: "!", a: B("isNumber", a) }; }
        if (/^(isinstance)$/.test(p) && a.length === 2) {
          var types = stripParens(a[1]).k === "tuple" ? stripParens(a[1]).items : [a[1]];
          return types.map(function (t) { return typeTest(a[0], pathOf(t) || "", e.line); })
                      .reduce(function (x, y) { return x ? bin("||", x, y) : y; }, null);
        }
        if (/^(type)$/.test(p) && a.length === 1) { return B("classOf", a); }
        if (dot === "getClass" || dot === "GetType") { return B("classOf", [self]); }
        // x.getClass().getSimpleName(): the name of the class is what classOf says
        if (dot && /^(getSimpleName|getName)$/.test(dot) && !a.length && self) {
          var asked = stripParens(self);
          if (asked.k === "call" && asked.fn.k === "member" && /^(getClass|GetType)$/.test(asked.fn.name)) {
            return B("classOf", [asked.fn.obj]);
          }
          if (asked.k === "call" && asked.builtin && pathOf(asked.fn) === "classOf") { return asked; }
        }
        // random
        if (/^random\.randint$/.test(p) && a.length === 2) { return B("random", a); }
        if (/^random\.randrange$/.test(p) && a.length) {
          return a.length === 1 ? B("random", [num(0), offBy(a[0], -1)]) : B("random", [a[0], offBy(a[1], -1)]);
        }
        if (/^(random\.random|Math\.random)$/.test(p) && !a.length) { return B("random", []); }
        if (/^random\.uniform$/.test(p) && a.length === 2) {
          return bin("+", a[0], bin("*", B("random", []), bin("-", a[1], a[0])));
        }
        if (/^random\.choice$/.test(p) && a.length === 1) { return B("choice", a); }
        if (/^random\.sample$/.test(p) && a.length === 2) {
          return B("slice", [B("shuffled", [a[0]]), num(0), a[1]]);
        }
        if (dot === "NextDouble" && !a.length) { return B("random", []); }
        if ((dot === "Next" || dot === "nextInt" || dot === "NextInt64") && self && (devices[pathOf(self)] === "dice" || a.length)) {
          if (a.length === 2) { return B("random", [a[0], offBy(a[1], -1)]); }
          if (a.length === 1) { return B("random", [num(0), offBy(a[0], -1)]); }
          if (!a.length && dot === "nextInt") { return B("random", [num(0), num(2147483647)]); }
        }
        if (dot === "nextDouble" && !a.length && devices[pathOf(self)] === "dice") { return B("random", []); }
        if (dot === "nextBoolean" && !a.length) { return bin("==", B("random", [num(0), num(1)]), num(1)); }
        if (/^(rand|random)$/.test(p) && !a.length) { return B("random", [num(0), num(32767)]); }
        if (cpp && self && devices[pathOf(self)] === "dice" && e.fn.k === "member") { return null; }
        if (cpp && e.fn.k === "name" && devices[e.fn.v] === "dice" && a.length === 1) {
          return B("random", [num(0), num(100)]);
        }
        return null;
      }
      // a part of something that is really a call: s.length, list.Count,
      // a record's property with something that works it out
      function propOf(e, ch) {
        var getter = getterCall(e, ch);
        if (getter) { return getter; }
        var sk = kindOf(e.obj, ch);
        if (/^(length|Length|Count|size)$/.test(e.name) && !recordOf(sk)) { return builtinCall("length", [e.obj], e.line); }
        if (/^(first|Key|key)$/.test(e.name) && (isListKind(sk) || sk === null) && !recordOf(sk) && (cpp || cs)) {
          return { k: "index", obj: e.obj, at: num(0), line: e.line };
        }
        if (/^(second|Value|value)$/.test(e.name) && (isListKind(sk) || sk === null) && !recordOf(sk) && (cpp || cs)) {
          return { k: "index", obj: e.obj, at: num(1), line: e.line };
        }
        var path = pathOf(e) || "";
        if (/^(Math\.PI|math\.pi|M_PI|Math\.Pi|numbers\.pi)$/.test(path)) { return { k: "num", v: "3.141592653589793", real: true }; }
        if (/^(Math\.E|math\.e)$/.test(path)) { return { k: "num", v: "2.718281828459045", real: true }; }
        if (/^(Integer\.MAX_VALUE|int\.MaxValue|INT_MAX|Int32\.MaxValue|sys\.maxsize|Number\.MAX_SAFE_INTEGER|Long\.MAX_VALUE|LLONG_MAX)$/.test(path)) { return { k: "num", v: "2147483647" }; }
        if (/^(Integer\.MIN_VALUE|int\.MinValue|INT_MIN|Int32\.MinValue)$/.test(path)) { return { k: "un", op: "-", a: { k: "num", v: "2147483648" } }; }
        if (/^(math\.inf|Double\.MAX_VALUE|double\.MaxValue|Number\.MAX_VALUE|Infinity|Number\.POSITIVE_INFINITY|Double\.POSITIVE_INFINITY|double\.PositiveInfinity|DBL_MAX|FLT_MAX)$/.test(path)) {
          return { k: "name", v: "Infinity", constant: true };
        }
        if (/^(string\.Empty|String\.Empty)$/.test(path)) { return { k: "str", v: "" }; }
        if (/^(Environment\.NewLine|System\.lineSeparator)$/.test(path)) { return { k: "name", v: "NewLine", constant: true }; }
        if (e.name === "value" && e.obj.k === "name" && enumValues[e.obj.v]) { return e.obj; }
        if (e.name === "__name__" || (e.name === "Name" && cs && stripParens(e.obj).k === "call")) { return e.obj; }
        if (py && path === "sys.argv") { return { k: "list", items: [{ k: "str", v: "program.py" }], line: e.line }; }
        if (e.name === "name" && e.obj.k === "name" && enumValues[e.obj.v]) { return { k: "str", v: e.obj.v }; }
        return null;
      }
      // new Point(3, 4) is Point(3, 4); new ArrayList<>() is []; new
      // StringBuilder() is "", and the rest as near as pseudocode comes
      function newOf(e, ch) {
        var ty = e.type || {};
        var name = String(ty.name || "").replace(/^.*::/, "");
        var args = e.args || [];
        if (CLS[name] && CLS[name].record) {
          var made = pickArity(FACTORIES[name], args.length);
          if (made) {
            if (e.init && e.init.k === "list") { return userCallNode(made, args.concat(e.init.items), e.line); }
            return userCallNode(made, args, e.line);
          }
          return { k: "record", kind: name, line: e.line };
        }
        if (e.direct && KIND_OF_TYPE[name.toLowerCase()] && args.length === 1) { return args[0]; }
        if (e.direct && KIND_OF_TYPE[name.toLowerCase()] && !args.length) { return blankFor(ty, e.line); }
        var kind = kindOfType(ty);
        var sz = sizedOf(e);
        if (sz) { return { k: "sized", dims: sz.dims, fill: sz.fill, kind: sz.kind, line: e.line }; }
        if (/^(StringBuilder|StringBuffer)$/.test(name)) {
          return args.length && kindOf(args[0], ch) === "text" ? args[0] : { k: "str", v: "" };
        }
        if (/^(string|String|wstring)$/.test(name)) {
          if (args.length === 2 && cpp) { return builtinCall("repeat", [args[1], args[0]], e.line); }
          if (args.length === 2 && cs && kindOf(args[1], ch) === "int") { return builtinCall("repeat", [args[0], args[1]], e.line); }
          if (args.length === 1 && isListKind(kindOf(args[0], ch))) { return builtinCall("join", [args[0], { k: "str", v: "" }], e.line); }
          return args[0] || { k: "str", v: "" };
        }
        if (isListKind(kind) || /^(Array)$/.test(name)) {
          if (e.init && e.init.k === "list") { return e.init; }
          if (/^Array$/.test(name) && args.length === 1 && kindOf(args[0], ch) === "int") {
            return { k: "sized", dims: [args[0]], fill: { k: "null" }, kind: null, line: e.line };
          }
          if (args.length === 1 && (isListKind(kindOf(args[0], ch)) || stripParens(args[0]).k === "list" || stripParens(args[0]).k === "call")) {
            return /^set/.test(kind) || /Set/.test(name) ? builtinCall("unique", [args[0]], e.line) : builtinCall("copy", [args[0]], e.line);
          }
          if (cpp && args.length === 2 && beginOf(args[0]) !== stripParens(args[0])) { return builtinCall("copy", [beginOf(args[0])], e.line); }
          if (args.length > 1 && js) { return { k: "list", items: args, line: e.line }; }
          if (cpp && args.length && e.braces) { return { k: "list", items: args, line: e.line }; }
          return { k: "list", items: [], line: e.line };
        }
        if (kind === "map" || /^(Map|Object)$/.test(name)) {
          if (e.init && e.init.k === "dict") { return e.init; }
          if (e.init && e.init.k === "list") {
            var ks = [], vs = [];
            e.init.items.forEach(function (it) { it = stripParens(it); if (it.k === "list" && it.items.length === 2) { ks.push(it.items[0]); vs.push(it.items[1]); } });
            return { k: "dict", keys: ks, values: vs, line: e.line };
          }
          if (args.length === 1 && stripParens(args[0]).k === "list") {
            var ks2 = [], vs2 = [];
            stripParens(args[0]).items.forEach(function (it) { it = stripParens(it); if (it.k === "list" && it.items.length === 2) { ks2.push(it.items[0]); vs2.push(it.items[1]); } });
            return { k: "dict", keys: ks2, values: vs2, line: e.line };
          }
          if (args.length === 1) { return builtinCall("copy", [args[0]], e.line); }
          return { k: "dict", keys: [], values: [], line: e.line };
        }
        if (/^(Integer|Double|Long|Boolean|Float|Number)$/.test(name) && args.length === 1) { return args[0]; }
        if (/^(Date|DateTime|Random|Scanner)$/.test(name)) { return null; }
        if (/^(pair|Pair|tuple|Tuple|KeyValuePair)$/.test(name)) { return { k: "list", items: args, line: e.line }; }
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
            return builtinCall("random", [add, span.a], e.line);
          }
        }
        var lit = add && stripParens(add).k === "num" && !stripParens(add).real
                ? parseInt(stripParens(add).v, 10) : null;
        var to = lit !== null ? offBy(n, lit - 1)
               : add ? offBy({ k: "bin", op: "+", a: add, b: n }, -1) : offBy(n, -1);
        return builtinCall("random", [from, to], e.line);
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
            if (key === "line" || key === "cls") { continue; }
            var v = x[key];
            o[key] = Array.isArray(v) ? v.map(strip) : (v && typeof v === "object" ? strip(v) : v);
          }
          return o;
        }
      }

      // ---- what kind of thing an expression is, as far as can be told --
      var kindChart = null;
      function kindNow(e) { return kindOf(e, kindChart); }
      var BUILT_KIND = { length: "int", indexOf: "int", count: "int", ord: "int", random: null,
                         contains: "bool", startsWith: "bool", endsWith: "bool", isDigit: "bool",
                         isAlpha: "bool", isUpper: "bool", isLower: "bool", isSpace: "bool", any: "bool",
                         all: "bool", isNumber: "bool", join: "text", toString: "text", replace: "text",
                         trim: "text", toUpper: "text", toLower: "text", chr: "text", classOf: "text",
                         padLeft: "text", padRight: "text", fixed: "text", split: "list<text>", range: "list<int>",
                         sqrt: "real", real: "real", floor: "int", ceiling: "int", int: "int", round: "int",
                         keys: "list", values: "list", items: "list<list>", sin: "real", cos: "real",
                         tan: "real", log: "real", exp: "real", log10: "real", atan: "real", atan2: "real",
                         hypot: "real", trunc: "int" };
      function kindOf(e, ch) {
        e = stripParens(e);
        if (!e) { return null; }
        switch (e.k) {
          case "num": return e.real ? "real" : "int";
          case "str": case "fstr": return "text";
          case "bool": return "bool";
          case "places": return "text";
          case "compare": return "int";
          case "regex": return "text";
          case "record": return "obj:" + e.kind;
          case "fn": return "fn";
          case "sized": {
            var sk = e.kind || kindOf(e.fill, ch);
            for (var d = 0; d < e.dims.length; d++) { sk = "list" + (sk ? "<" + sk + ">" : ""); }
            return sk;
          }
          case "list": case "tuple": case "set": {
            var ek = null;
            (e.items || []).forEach(function (x) {
              if (x && x.k === "star") { ek = mergeKinds(ek, elemKind(kindOf(x.e, ch))); }
              else { ek = mergeKinds(ek, kindOf(x, ch)); }
            });
            return (e.k === "set" ? "set" : "list") + (ek && ek !== "mixed" ? "<" + ek + ">" : "");
          }
          case "dict": case "obj": return "map";
          case "comp": return e.kind === "dict" ? "map" : (e.kind === "set" ? "set" : "list") +
                              (kindOf(e.elt, ch) ? "<" + kindOf(e.elt, ch) + ">" : "");
          case "newarr": {
            var ak = kindOfType(e.elem ? { name: e.elem.name, dims: e.elem.dims || 0, args: e.elem.args } : null);
            if (e.init) { return kindOf(e.init, ch) || "list"; }
            for (var dd = 0; dd < e.dims.length; dd++) { ak = "list" + (ak ? "<" + ak + ">" : ""); }
            return ak;
          }
          case "new": {
            var nm = String(e.type && e.type.name || "").replace(/^.*::/, "");
            if (CLS[nm] && CLS[nm].record) { return "obj:" + nm; }
            var nk = kindOfType(e.type);
            if (nk) { return nk; }
            var lc = libCall(e, ch);
            return lc && lc !== e ? kindOf(lc, ch) : null;
          }
          case "name": {
            if (e.fnRef) { return "fn"; }
            if (e.constant) { return e.v === "NewLine" ? "text" : "real"; }
            var one = ch && (ch.names[e.v] || (ch.params && ch.params[e.v])) || globalChart.names[e.v];
            if (!one) {
              if (enumValues[e.v]) { return java || js ? "text" : "int"; }
              if (e.v === "this" || e.v === "self") {
                var cls = ch && classOfChart(ch);
                return cls ? "obj:" + cls.name : null;
              }
              return null;
            }
            if (one.kind) { return one.kind; }
            // still being read: what it was declared as, or first given
            var early = kindOfType(one.typeInfo || one.type) || (one.kinds && one.kinds[0]) || null;
            if (!early && one.values && one.values.length && !one.reading) {
              one.reading = true;
              try {
                one.values.forEach(function (v) { early = mergeKinds(early, kindOf(v, ch)); });
              } finally { one.reading = false; }
            }
            return early;
          }
          case "un": return e.op === "!" ? "bool" : kindOf(e.a, ch);
          case "cast": return kindOfType(e.type) || kindOf(e.e, ch);
          case "cond": return mergeKinds(kindOf(e.a, ch), kindOf(e.b, ch));
          case "index": {
            var ok = kindOf(e.obj, ch);
            if (ok === "text") { return "text"; }
            return elemKind(ok);
          }
          case "slice": return kindOf(e.obj, ch);
          case "addr": case "deref": return kindOf(e.e, ch);
          case "bin": {
            var a = kindOf(e.a, ch), b = kindOf(e.b, ch);
            if (/^(&&|\|\||==|!=|<|>|<=|>=|in|not in|instanceof|is)$/.test(e.op)) { return "bool"; }
            if (e.op === "+" && isListKind(a) && isListKind(b)) { return mergeKinds(a, b); }
            if (e.op === "+" && (a === "text" || b === "text")) { return "text"; }
            if (e.op === "*" && (isListKind(a) || isListKind(b))) { return isListKind(a) ? a : b; }
            if (e.op === "*" && py && (a === "text" || b === "text")) { return "text"; }
            if (e.op === "/") { return py || js ? "real" : (a === "int" && b === "int" ? "int" : a && b ? "real" : null); }
            if (e.op === "//") { return a === "int" && b === "int" ? "int" : a && b ? "real" : null; }
            if (e.op === "**") { return a === "int" && b === "int" && py ? "int" : "real"; }
            if (a === "real" || b === "real") { return "real"; }
            if (a === "int" && b === "int") { return "int"; }
            return a === "mixed" || b === "mixed" ? "mixed" : null;
          }
          case "call": {
            if (e.builtin) {
              var bn = e.fn.v, first = e.args[0];
              if (Object.prototype.hasOwnProperty.call(BUILT_KIND, bn)) {
                if (bn === "random") { return e.args.length ? "int" : "real"; }
                return BUILT_KIND[bn];
              }
              if (/^(sorted|reversed|copy|unique|slice|substring|toList|shuffled|repeat|sort|reverse)$/.test(bn)) {
                var fk = kindOf(first, ch);
                if (bn === "toList" || bn === "sorted" || bn === "unique" || bn === "shuffled") {
                  return fk === "text" ? "list<text>" : fk === "map" ? "list" : fk;
                }
                return fk;
              }
              if (bn === "sum") { var se = elemKind(kindOf(first, ch)); return se === "int" ? "int" : "real"; }
              if (bn === "min" || bn === "max") {
                if (e.args.length === 1) { return elemKind(kindOf(first, ch)); }
                var mk = null;
                e.args.forEach(function (x) { mk = mergeKinds(mk, kindOf(x, ch)); });
                return mk;
              }
              if (bn === "choice" || bn === "pop") { return elemKind(kindOf(first, ch)); }
              if (bn === "get") { return kindOf(e.args[2], ch); }
              if (bn === "abs") { return kindOf(first, ch); }
              if (bn === "newList") { return "list"; }
              return null;
            }
            if (e.mine) {
              var fn = userFn(e.fn.v);
              if (fn && fn.factoryOf) { return "obj:" + fn.factoryOf; }
              return fn ? fn.kind || kindOfType(fn.rtypeInfo || fn.rtype) || null : null;
            }
            var asked = inputOf(e);
            if (asked) { return asked.kind; }
            var lc2 = libCall(e, ch);
            if (lc2 && lc2 !== e) { return kindOf(lc2, ch); }
            var mine = e.fn.k === "name" ? userFn(e.fn.v) : null;
            if (mine) { return mine.factoryOf ? "obj:" + mine.factoryOf : mine.kind || kindOfType(mine.rtypeInfo || mine.rtype) || null; }
            return null;
          }
          case "member": {
            var pk = propOf(e, ch);
            if (pk) { return kindOf(pk, ch); }
            var rec = recordOf(kindOf(e.obj, ch));
            if (rec && FIELD_KINDS[rec] && FIELD_KINDS[rec][e.name]) { return FIELD_KINDS[rec][e.name]; }
            if (rec) {
              var chain = ancestry(CLS[rec] || {});
              for (var i = 0; i < chain.length; i++) {
                var fk2 = FIELD_KINDS[chain[i].name];
                if (fk2 && fk2[e.name]) { return fk2[e.name]; }
              }
            }
            return null;
          }
        }
        return null;
      }
      // What each record's fields hold: every value any method puts there.
      var FIELD_VALUES = Object.create(null), FIELD_KINDS = Object.create(null);

      function noteField(t, v, ch) {
        var rec = recordOf(kindOf(t.obj, ch));
        if (!rec) { return; }
        var byName = FIELD_VALUES[rec] = FIELD_VALUES[rec] || Object.create(null);
        (byName[t.name] = byName[t.name] || []).push({ value: v, ch: ch });
      }

      // ---- break and continue ----------------------------------------------
      // A flowchart has no arrow that leaves a loop from the middle of it:
      // every loop leaves by its test.  So a break is a flag -- done -- that
      // the test asks about, and whatever stood after the break in the loop
      // is done only if the flag is not up yet.  A continue is a flag too,
      // put down again at the top of every time round.  A For with a way
      // out in the middle is the While it has become.
      var loopsMade = 0;
      function unbreak(list, ch) {
        var made = [];
        var fixed = fixList(list, []).list;
        // a flag nothing ever asks about is no flag: its Sets go
        made.forEach(function (flag) {
          var read = false;
          (function look(items) {
            items.forEach(function (st) {
              ["cond", "value", "e", "parts", "from", "to", "by", "over", "subject"].forEach(function (key) {
                if (st[key] && mentions(st[key], flag)) { read = true; }
              });
              if (st.k === "set" && st.target && st.target.k !== "name" && mentions(st.target, flag)) { read = true; }
              ["then", "orelse", "body"].forEach(function (key) { if (Array.isArray(st[key])) { look(st[key]); } });
              (st.cases || []).forEach(function (c) { if (mentions(c.label, flag)) { read = true; } look(c.body); });
            });
          })(fixed);
          if (read) { return; }
          fixed = (function drop(items) {
            return items.filter(function (st) {
              return !(st.k === "set" && st.target.k === "name" && st.target.v === flag);
            }).map(function (st) {
              ["then", "orelse", "body"].forEach(function (key) { if (Array.isArray(st[key])) { st[key] = drop(st[key]); } });
              (st.cases || []).forEach(function (c) { c.body = drop(c.body); });
              return st;
            });
          })(fixed);
          if (ch.names[flag]) { ch.list.splice(ch.list.indexOf(ch.names[flag]), 1); delete ch.names[flag]; }
        });
        return fixed;
        // the targets: [{ label, flag (break), skip (continue), loop }], innermost last
        function fixList(items, stack) {
          var out = [], exits = {};
          for (var i = 0; i < items.length; i++) {
            var st = items[i];
            var got = fixOne(st, stack);
            got.list.forEach(function (s) { out.push(s); });
            Object.keys(got.exits).forEach(function (k) { exits[k] = true; });
            if (got.always) {                        // nothing after it can run
              var keep = items.slice(i + 1).filter(function (s) { return s.always; });
              out = out.concat(keep);
              return { list: out, exits: exits, always: true };
            }
            if (Object.keys(got.exits).length && i + 1 < items.length) {
              var restItems = items.slice(i + 1);
              var after = restItems.filter(function (s) { return s.always; });
              var guarded = restItems.filter(function (s) { return !s.always; });
              var rest = fixList(guarded, stack);
              Object.keys(rest.exits).forEach(function (k) { exits[k] = true; });
              var flags = Object.keys(got.exits);
              var last = out[out.length - 1];
              if (rest.list.length) {
                // If c Then ... done = True End If  +  rest  =  If c Then ... Else rest
                if (last && last.k === "if" && !last.orelse.length && got.thenOnly) {
                  last.orelse = rest.list;
                } else {
                  out.push({ k: "if", cond: notAny(flags), then: rest.list, orelse: [], line: rest.list[0].line });
                }
              }
              return { list: out.concat(after), exits: exits };
            }
          }
          return { list: out, exits: exits };
        }
        function notAny(flags) {
          var test = null;
          flags.forEach(function (f) {
            test = test ? { k: "bin", op: "||", a: test, b: nameNode(f) } : nameNode(f);
          });
          return { k: "un", op: "!", a: test };
        }
        function target(stack, label, isContinue) {
          for (var i = stack.length - 1; i >= 0; i--) {
            var t = stack[i];
            if (isContinue && !t.loop) { continue; }
            if (!label || t.label === label) { return t; }
          }
          return null;
        }
        function fixOne(st, stack) {
          if (st.k === "break" || st.k === "continue") {
            var t = target(stack, st.label, st.k === "continue");
            if (!t) { return { list: [], exits: {}, always: true }; }
            // a break out of the Select it is in, at its foot, is no break
            var flag = st.k === "break" ? (t.flag = t.flag || fresh(ch, t.base || (t.loop ? "done" : "leave")))
                                        : (t.skip = t.skip || fresh(ch, "skip"));
            if (made.indexOf(flag) < 0) { made.push(flag); }
            t.used = true;
            return { list: [{ k: "set", target: nameNode(flag), value: { k: "bool", v: true }, line: st.line, flag: true }],
                     exits: mark({}, flag), always: true };
          }
          if (st.k === "if") {
            var a = fixList(st.then, stack), b = fixList(st.orelse || [], stack);
            var exits = Object.assign({}, a.exits, b.exits);
            st.then = a.list;
            st.orelse = b.list;
            var both = a.always && b.always && (st.orelse || []).length;
            return { list: [st], exits: exits, always: !!both && Object.keys(exits).length > 0,
                     thenOnly: a.always && !b.list.length };
          }
          if (st.k === "trybox") {
            var box = { label: st.label, loop: false, flag: null, base: "failed" };
            var inBox = fixList(st.body, stack.concat([box]));
            var boxExits = Object.assign({}, inBox.exits);
            var boxList = inBox.list;
            if (box.flag) {
              delete boxExits[box.flag];
              boxList = [{ k: "set", target: nameNode(box.flag), value: { k: "bool", v: false }, line: st.line }].concat(boxList);
              ch.meet(box.flag, { kind: "bool", set: true });
            }
            return { list: boxList, exits: boxExits };
          }
          if (st.k === "select") {
            var me = { label: null, loop: false, flag: null };
            var inner = st.breakable ? stack.concat([me]) : stack;
            var ex = {};
            st.cases.forEach(function (c) {
              var r = fixList(c.body, inner);
              c.body = r.list;
              Object.keys(r.exits).forEach(function (k) { ex[k] = true; });
            });
            var list = [st];
            if (me.flag) {
              delete ex[me.flag];
              list.unshift({ k: "set", target: nameNode(me.flag), value: { k: "bool", v: false }, line: st.line });
            }
            return { list: list, exits: ex };
          }
          if (/^(while|do|for|foreach)$/.test(st.k)) {
            var loop = { label: st.label, loop: true, flag: null, skip: null };
            var r2 = fixList(st.body, stack.concat([loop]));
            var outer = Object.assign({}, r2.exits);
            if (loop.flag) { delete outer[loop.flag]; }
            if (loop.skip) { delete outer[loop.skip]; }
            var body = r2.list;
            if (loop.skip) {
              body = [{ k: "set", target: nameNode(loop.skip), value: { k: "bool", v: false }, line: st.line }].concat(body);
            }
            var before = [], after = [];
            var stops = [loop.flag].concat(Object.keys(outer)).filter(Boolean);
            var node = st;
            if (loop.flag) {
              before.push({ k: "set", target: nameNode(loop.flag), value: { k: "bool", v: false }, line: st.line });
              ch.meet(loop.flag, { kind: "bool", set: true });
            }
            if (loop.skip) { ch.meet(loop.skip, { kind: "bool", set: true }); }
            if (stops.length) {
              if (st.k === "for") {
                node = forAsWhile(st, body, stops, before);
              } else if (st.k === "foreach") {
                node = eachAsWhile(st, body, stops, before);
              } else if (st.k === "do") {
                var stopTest = stops.map(function (f) { return nameNode(f); })
                  .reduce(function (x, y) { return { k: "bin", op: "||", a: x, b: y }; });
                node = Object.assign({}, st, {
                  body: body,
                  cond: st.until ? { k: "bin", op: "||", a: st.cond, b: stopTest }
                                 : { k: "bin", op: "&&", a: st.cond, b: { k: "un", op: "!", a: stopTest } } });
              } else {
                var going = { k: "un", op: "!", a: stops.map(function (f) { return nameNode(f); })
                  .reduce(function (x, y) { return { k: "bin", op: "||", a: x, b: y }; }) };
                node = Object.assign({}, st, { body: body,
                  cond: st.forever ? going : { k: "bin", op: "&&", a: st.cond, b: going } });
              }
            } else {
              node = Object.assign({}, st, { body: body });
            }
            // Python's for ... else: what runs when the loop was not broken
            if (st.orelse && st.orelse.length) {
              var elseFixed = fixList(st.orelse, stack);
              if (loop.flag) {
                after.push({ k: "if", cond: { k: "un", op: "!", a: nameNode(loop.flag) }, then: elseFixed.list, orelse: [], line: st.line });
              } else {
                after = after.concat(elseFixed.list);
              }
            }
            delete node.orelse;
            return { list: before.concat([node], after), exits: outer };
          }
          return { list: [st], exits: {}, always: st.k === "return" || st.k === "stop" };
        }
        function mark(o, k) { o[k] = true; return o; }
        // For i = a To b with a way out: Set i = a / While i <= b AND NOT done
        function forAsWhile(st, body, stops, before) {
          var by = st.by;
          var down = by && isNegative(by);
          var going = stops.map(function (f) { return nameNode(f); })
            .reduce(function (x, y) { return { k: "bin", op: "||", a: x, b: y }; });
          before.push({ k: "set", target: nameNode(st.v), value: st.from, line: st.line });
          var step = { k: "set", target: nameNode(st.v), line: st.line, always: true,
                       value: { k: "bin", op: "+", a: nameNode(st.v), b: by || num(1) } };
          return { k: "while", line: st.line, body: body.concat([step]),
                   cond: { k: "bin", op: "&&", a: { k: "bin", op: down ? ">=" : "<=", a: nameNode(st.v), b: st.to },
                           b: { k: "un", op: "!", a: going } } };
        }
        // For Each x In xs with a way out: counted through by place
        function eachAsWhile(st, body, stops, before) {
          var list = st.over;
          if (stripParens(list).k !== "name") {
            var held = fresh(ch, "items");
            before.push({ k: "set", target: nameNode(held), value: list, line: st.line });
            ch.meet(held, { set: true }).values = [list];
            list = nameNode(held);
          }
          var k = fresh(ch, "i");
          ch.meet(k, { kind: "int", set: true });
          ch.meet(st.v, { set: true });
          var going = stops.map(function (f) { return nameNode(f); })
            .reduce(function (x, y) { return { k: "bin", op: "||", a: x, b: y }; });
          before.push({ k: "set", target: nameNode(k), value: num(0), line: st.line });
          return { k: "while", line: st.line,
                   cond: { k: "bin", op: "&&", a: { k: "bin", op: "<", a: nameNode(k), b: builtinCall("length", [list]) },
                           b: { k: "un", op: "!", a: going } },
                   body: [{ k: "set", target: nameNode(st.v), value: { k: "index", obj: list, at: nameNode(k) }, line: st.line }]
                           .concat(body, [{ k: "set", target: nameNode(k), value: { k: "bin", op: "+", a: nameNode(k), b: num(1) },
                                            line: st.line, always: true }]) };
        }
      }

      // ================================================ lowering ==
      // main first, then each function, each a chart of its own.
      kindChart = mainChart;
      var mainBody = lower(lead.concat(main), mainChart);
      mainBody = unbreak(mainBody, mainChart);
      function hasYield(body) {
        var found = false;
        eachNode(body, function (x) {
          if (x.k === "fn" || x.k === "func") { return false; }
          if (x.k === "yield") { found = true; }
        });
        return found;
      }
      var fnCharts = [];
      function chartFor(fn) {
        var ch = new Chart(fn);
        fn.params.forEach(function (p) {
          var info = p.typeInfo || (p.type ? { name: p.type, dims: p.dims || 0, args: [] } : null);
          if (info && p.dims && !info.dims) { info = Object.assign({}, info, { dims: p.dims }); }
          ch.params[p.name] = { name: p.name, kind: p.self ? (p.self === "*" ? "obj" : "obj:" + p.self) : kindOfType(info),
                                ref: p.ref, typeInfo: info, fixed: !!(p.self || kindOfType(info)) };
        });
        if (py) {
          Object.keys(viaModule).forEach(function (n) {
            if (!ch.params[n]) { ch.globalsHere[n] = true; }
          });
        }
        charts.push(ch);
        fnCharts.push(ch);
        fn.chart = ch;
        kindChart = ch;
        var body = fn.body;
        // a destructured parameter, taken apart where the function starts
        fn.params.forEach(function (p) {
          var orig = null;
          if (p.pattern && typeof p.pattern === "object") { orig = p.pattern; }
          if (orig) { body = [{ k: "assign", target: orig, value: nameNode(p.name), line: fn.line }].concat(body); }
        });
        if (hasYield(body)) {
          ch.gen = fresh(ch, "results");
          body = [{ k: "assign", target: nameNode(ch.gen), value: { k: "list", items: [] }, line: fn.line }]
                   .concat(body, [{ k: "return", value: null, line: fn.line }]);
        }
        ch.body = unbreak(lower(body, ch), ch);
        var trail = ch.body.filter(function (s) { return s.k !== "note"; });
        var last = trail[trail.length - 1];
        if (last && last.k === "return" && !last.value) { ch.body.splice(ch.body.lastIndexOf(last), 1); }
        return ch;
      }
      order.slice().forEach(function (fn) { chartFor(fn); });
      // lambdas made into functions while the charts were being read
      for (var late = 0; late < lateFns.length; late++) {
        if (!lateFns[late].chart) { chartFor(lateFns[late]); }
      }
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
      if (LINE) {
        // the last line printed, if nothing ended it
        mainBody.push({ k: "if", cond: { k: "bin", op: "!=", a: nameNode(LINE), b: { k: "str", v: "" } }, orelse: [],
                        then: [{ k: "display", parts: [nameNode(LINE)] }], line: 0 });
      }

      // ---- which names are shared ----------------------------------------
      // Java's and C#'s fields and C++'s globals say so.  Python and
      // JavaScript say it by where a name is set: at the top of the file
      // and read or set inside a function, it is the whole program's.
      top.globals.forEach(function (decl) {
        decl.names.forEach(function (one) {
          var info = decl.typeInfo || (decl.type ? { name: decl.type, dims: decl.dims || 0, args: [] } : null);
          if (info && one.dims && !info.dims) { info = Object.assign({}, info, { dims: one.dims }); }
          var kind = kindOfType(info);
          var g = globalChart.meet(one.name, { kind: kind, declared: true, konst: decl.konst, type: decl.type, typeInfo: info });
          var value = one.value;
          if (!value && one.sizes && one.sizes.length && one.sizes[0]) {
            value = { k: "newarr", elem: info ? { name: info.name, dims: 0, args: info.args } : null, dims: one.sizes, line: one.line };
          }
          if (!value && cpp && info && !info.ptr && (isListKind(kind) || kind === "map")) {
            value = { k: "new", type: info, args: [], direct: true, line: one.line };
          }
          // declared again without a value -- a C++ header's extern -- it
          // keeps the value the other declaration gave it
          if (value || !g.value) {
            g.value = value;
            g.line = one.line;
          }
          if (value) { g.values = [value]; }
        });
      });
      if (LINE) {
        var lineRec = globalChart.meet(LINE, { kind: "text", declared: true });
        lineRec.value = { k: "str", v: "" };
        lineRec.values = [lineRec.value];
      }
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
            g.elems = (g.elems || []).concat(one.elems || []);
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
              g.elems = (g.elems || []).concat(own.elems || []);
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
                g.elems = (g.elems || []).concat(own.elems || []);
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
              g.elems = (g.elems || []).concat(own.elems || []);
              g.values = (g.values || []).concat(own.values || []);
              delete ch.names[own.name];
              ch.list.splice(ch.list.indexOf(own), 1);
            }
          });
        });
      }
      // lineOut belongs to every chart
      if (LINE) {
        charts.forEach(function (ch) {
          if (ch.names[LINE]) { ch.list.splice(ch.list.indexOf(ch.names[LINE]), 1); delete ch.names[LINE]; }
        });
      }
      charts.forEach(function (ch) {
        Object.keys(ch.pending || {}).forEach(function (name) {
          var owner = ch.names[name] || ch.params[name] || globalChart.names[name] ||
                      (ch !== mainChart && mainChart.names[name]) || null;
          if (owner) { owner.elems = (owner.elems || []).concat(ch.pending[name]); }
        });
      });
      // Whether a chart's statements read or set a name anywhere in them.
      function usesName(list, name) {
        return list.some(function (st) {
          if (st.k === "input" && mentions(st.target, name)) { return true; }
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
      var callsTo = Object.create(null);
      function gatherCalls(x, ch) {
        if (!x || typeof x !== "object") { return; }
        if (Array.isArray(x)) { x.forEach(function (y) { gatherCalls(y, ch); }); return; }
        if (x.k === "call" && x.fn && x.fn.k === "name" && (x.mine || userFn(x.fn.v))) {
          var key = x.fn.v.toLowerCase();
          (callsTo[key] = callsTo[key] || []).push({ args: x.mine ? x.args : callArgs(userFn(x.fn.v), x.args), ch: ch });
        }
        for (var key2 in x) { if (key2 !== "line" && key2 !== "chart" && key2 !== "cls") { gatherCalls(x[key2], ch); } }
      }
      gatherCalls(mainBody, mainChart);
      fnCharts.forEach(function (ch) { gatherCalls(ch.body, ch); });
      function elemsKind(one, ch) {
        var k = null, item = null;
        (one.elems || []).forEach(function (el) {
          if (!el) { return; }
          if (el.of) {                    // an item of another list: that list's items
            var ok = kindOf(el.of, ch), each = ok === "text" ? "text" : elemKind(ok);
            if (el.item) { item = mergeKinds(item, each); } else { k = mergeKinds(k, each); }
          } else if (el.depth) {          // grid[y][x] = v: v, that many lists down
            var inner = kindOf(el.value, ch);
            for (var d = 1; d < el.depth; d++) { inner = "list" + (inner ? "<" + inner + ">" : ""); }
            k = mergeKinds(k, inner);
          } else {
            k = mergeKinds(k, kindOf(el.value, ch));
          }
        });
        return { into: k, item: item };
      }
      for (var pass = 0; pass < 8; pass++) {
        var moved = false;
        charts.concat([globalChart]).forEach(function (ch) {
          kindChart = ch === globalChart ? mainChart : ch;
          ch.list.forEach(function (one) {
            var k = one.declared && (one.typeInfo || one.type) ? kindOfType(one.typeInfo || one.type) : null;
            if (!k || isListKind(k) && !elemKind(k)) {
              one.kinds.forEach(function (x) { k = mergeKinds(k, x); });
              (one.values || []).forEach(function (v) { k = mergeKinds(k, kindOf(v, kindChart)); });
            }
            var got = elemsKind(one, kindChart), ek = got.into;
            if (got.item) { k = mergeKinds(k, got.item); }
            if (ek && !one.loopOnly && (!k || isListKind(k))) {
              var base = k && /^set/.test(k) ? "set" : "list";
              k = mergeKinds(k, base + "<" + ek + ">");
            } else if (ek && one.loopOnly) {
              k = mergeKinds(k, ek);
            }
            if (k !== one.kind) { one.kind = k; moved = true; }
          });
          // loop names of a For Each: what the list holds
        });
        // what each record's fields hold
        Object.keys(FIELD_VALUES).forEach(function (rec) {
          var kinds = FIELD_KINDS[rec] = FIELD_KINDS[rec] || Object.create(null);
          Object.keys(FIELD_VALUES[rec]).forEach(function (f) {
            var k = null;
            FIELD_VALUES[rec][f].forEach(function (x) { k = mergeKinds(k, kindOf(x.value, x.ch)); });
            var field = (CLS[rec] && CLS[rec].fields || []).filter(function (x) { return x.name === f; })[0];
            if (field && field.type) { k = kindOfType(field.type) || k; }
            if (k !== kinds[f]) { kinds[f] = k; moved = true; }
          });
        });
        // what a function hands back, and what it is handed
        fnCharts.forEach(function (ch) {
          kindChart = ch;
          var fn = ch.fn, k = fn.factoryOf ? "obj:" + fn.factoryOf : kindOfType(fn.rtypeInfo || fn.rtype);
          if (ch.gen) { k = "list"; }
          if (!k && fn.rtype !== "void") {
            eachReturn(ch.body, function (v) { k = mergeKinds(k, kindOf(v, ch)); });
          }
          if (k !== fn.kind) { fn.kind = k; moved = true; }
          fn.params.forEach(function (p, i) {
            var have = ch.params[p.name];
            if (have.fixed) { return; }
            var k2 = null;
            (callsTo[fn.name.toLowerCase()] || []).forEach(function (call) {
              var arg = call.args[i];
              if (arg) {
                kindChart = call.ch;
                k2 = mergeKinds(k2, kindOf(arg.k === "ref" ? arg.e : arg, call.ch));
              }
            });
            kindChart = ch;
            (have.kinds || []).forEach(function (x) { k2 = mergeKinds(k2, x); });
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
            if (key === "line" || key === "cls") { continue; }
            var v = x[key];
            if (Array.isArray(v)) { v.forEach(walk); } else if (v && typeof v === "object") { walk(v); }
          }
        })(e);
        return out;
      }
      function isMoney(rec) {
        return !!rec && rec.money && !rec.plain && (rec.kind === "real" || rec.kind === "int");
      }
      // The type a Declare gives: Integer, Real, ..., and for a list the
      // type of what is in it, with a [] for each list down.
      function typeParts(kind) {
        var dims = 0, k = kind;
        while (isListKind(k)) { dims++; k = elemKind(k); }
        return { word: TYPE_WORD[k] || "", dims: dims };
      }
      function typeWord(rec) {
        if (isMoney(rec)) { return "Currency"; }
        return TYPE_WORD[rec.kind] || "";
      }

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
      // the pseudocode would take for a line carrying on to the next.  A
      // line break inside words is NewLine, joined on.
      function quoted(v) {
        var s = String(v).replace(/\t/g, "    ");
        if (s.indexOf("\n") >= 0) {
          var bits = s.split("\n").map(function (b) { return b ? quoted(b) : null; });
          var out = [];
          bits.forEach(function (b, i) {
            if (i) { out.push("NewLine"); }
            if (b) { out.push(b); }
          });
          return out.join(" + ");
        }
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
        if (!s) { return { t: '""', r: 9 }; }
        if ((s.k === "call" && !s.builtin && !s.mine) || s.k === "new" || s.k === "newarr" || s.k === "member") {
          var lc = libCall(s, ch);
          if (lc && lc !== s) { return px(lc, ch); }
        }
        if (s.k === "bin" || s.k === "cast") {
          var rnd = randomRange(s);
          if (rnd) { return px(rnd, ch); }
        }
        switch (s.k) {
          case "fn": return px(liftLambda(s, ch, "lambda"), ch);
          case "comp": note(s.line, "for … in"); return { t: "[]", r: 9 };
          case "obj": return { t: "{}", r: 9 };
          case "dict": {
            var pairs = [];
            s.keys.forEach(function (k, i) {
              if (k === null) { note(s.line, "**"); return; }
              pairs.push(px(k, ch).t + ": " + px(s.values[i], ch).t);
            });
            return { t: "{" + pairs.join(", ") + "}", r: 9 };
          }
          case "record": return { t: "New " + s.kind, r: 9 };
          case "sized": {
            return { t: "newList(" + s.dims.map(function (d) { return px(d, ch).t; }).concat([px(s.fill, ch).t]).join(", ") + ")", r: 9 };
          }
          case "regex": return { t: quoted(s.v), r: 9 };
          case "star": case "dstar": return px(s.e, ch);
          case "num": return { t: String(s.v), r: /^-/.test(String(s.v)) ? 8 : 9 };
          case "str": return { t: quoted(s.v), r: s.v.indexOf("\n") >= 0 && s.v !== "\n" ? 5 : 9 };
          case "bool": return { t: s.v ? "True" : "False", r: 9 };
          case "null": return { t: '""', r: 9 };
          case "name":
            if (s.constant) { return { t: s.v, r: 9 }; }
            if (s.via && !userFn(s.v) && !globalChart.names[s.v] && enumValues[s.v] === undefined &&
                !(ch && (ch.names[s.v] || ch.params[s.v]))) {
              return { t: nameOf(s.v), r: 9 };
            }
            if (s.v === "this" || s.v === "self" || s.v === "super") { return { t: s.v === "super" ? selfWord : s.v, r: 9 }; }
            return { t: nameOf(s.v), r: 9 };
          case "fstr": {
            var parts = piecesOf(s).map(function (p) {
              var t = px(p, ch);
              return t.r < 5 ? "(" + t.t + ")" : t.t;
            });
            return { t: parts.join(" + ") || '""', r: parts.length > 1 ? 5 : 9 };
          }
          case "places":
            // shown to so many places after the point, as the words it prints
            return { t: "fixed(" + px(s.e, ch).t + ", " + s.n + ")", r: 9 };
          case "compare":
            return { t: "(" + px(s.a, ch).t + " - " + px(s.b, ch).t + ")", r: 9 };
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
            if (s.op === "typeof ") { return px(builtinCall("classOf", [s.a], s.line), ch); }
            note(s.line, s.op.trim());
            return { t: s.op.trim() + (s.op.length > 1 ? " " : "") + px(s.a, ch).t, r: 8 };
          }
          case "cast": {
            if (s.blank) { return px(blankFor(s.type, s.line), ch); }
            var k = kindOfType(s.type);
            var from = kindOf(s.e, ch);
            if (k === "int" && from !== "int") {
              if (/char/.test(String(s.type)) || from === "text" && /^int$/.test(String(s.type)) && cpp) {
                return px(builtinCall("ord", [s.e], s.line), ch);
              }
              return { t: "int(" + px(s.e, ch).t + ")", r: 9 };
            }
            if (k === "text" && /^char$/.test(String(s.type)) && (from === "int" || charMath(s.e, ch))) {
              return px(builtinCall("chr", [s.e], s.line), ch);
            }
            return px(s.e, ch);
          }
          case "bin": return pxBin(s, ch);
          case "call": return pxCall(s, ch);
          case "cond":
            note(s.line, "?:");
            return { t: "(" + px(s.test, ch).t + " ? " + px(s.a, ch).t + " : " + px(s.b, ch).t + ")", r: 9 };
          case "member": {
            return { t: wrapAt(s.obj, 9, ch) + "." + s.name, r: 9 };
          }
          case "index": {
            var holder = stripParens(s.obj);
            var at = stripParens(s.at);
            if (at && at.k === "tuple") {                 // grid[i, j]: grid[i][j]
              var o = wrapAt(holder, 9, ch);
              at.items.forEach(function (x) { o += "[" + px(x, ch).t + "]"; });
              return { t: o, r: 9 };
            }
            return { t: wrapAt(holder, 9, ch) + "[" + px(s.at, ch).t + "]", r: 9 };
          }
          case "slice": {
            var sk = kindOf(s.obj, ch);
            var step = s.step ? stripParens(s.step) : null;
            if (step && step.k === "un" && step.op === "-" && stripParens(step.a).v === "1" && !s.from && !s.to) {
              return px(builtinCall("reversed", [s.obj], s.line), ch);
            }
            if (step && !(step.k === "num" && step.v === "1")) { note(s.line, "[::]"); }
            var args = [s.obj, s.from || num(0)].concat(s.to ? [s.to] : []);
            return px(builtinCall(sk === "text" ? "substring" : "slice", args, s.line), ch);
          }
          case "list": case "tuple": case "set": {
            // [*a, 1, *b]: the lists joined
            var groups = [], cur = [];
            (s.items || []).forEach(function (x) {
              if (x && x.k === "star") {
                if (cur.length) { groups.push({ t: "[" + cur.join(", ") + "]" }); cur = []; }
                groups.push({ t: wrapAt(x.e, 6, ch) });
              } else if (x) {
                cur.push(px(x, ch).t);
              }
            });
            if (cur.length || !groups.length) { groups.push({ t: "[" + cur.join(", ") + "]" }); }
            if (groups.length === 1 && (s.items || []).length === 1 && s.items[0].k === "star") {
              return px(builtinCall("copy", [s.items[0].e], s.line), ch);
            }
            return { t: groups.map(function (g) { return g.t; }).join(" + "), r: groups.length > 1 ? 5 : 9 };
          }
          case "new": {
            note(s.line, "new " + (s.type && s.type.name || ""));
            return { t: "New " + String(s.type && s.type.name || "Item").replace(/^.*::/, ""), r: 9 };
          }
          case "ref": case "addr": case "deref": return px(s.e, ch);
          case "kw": return px(s.value, ch);
          case "incdec": case "assignx": return px(s.target, ch);
          case "del": case "block": return { t: '""', r: 9 };
          case "switchx": note(s.line, "switch"); return { t: '""', r: 9 };
          case "typecase": return { t: quoted(s.type), r: 9 };
          case "rel": return px(s.e, ch);
        }
        note(s.line || 0, String(s.k));
        return { t: '""', r: 9 };
      }
      // A single letter the language counts with: 'a' in Java, C# and C++, a
      // char, s.charAt(i), s[i] -- and in Python a one-letter word, where it
      // is being put in order against another.
      function isChar(e, ch) {
        e = stripParens(e);
        if (!e) { return false; }
        if (e.k === "str") { return !!e.ch || (py && e.v.length === 1); }
        if (py || js) { return false; }
        if (e.k === "name") {
          var one = ch && (ch.names[e.v] || ch.params[e.v]) || globalChart.names[e.v];
          return !!(one && one.typeInfo && /^(char|Character|wchar_t)$/.test(String(one.typeInfo.name)));
        }
        if (e.k === "index") { return kindOf(e.obj, ch) === "text"; }
        if (e.k === "call" && e.fn.k === "member" && e.fn.name === "charAt") { return true; }
        if (e.k === "cast" && /^char$/.test(e.type)) { return true; }
        return false;
      }
      // c + 1, 'z' - n: a letter counted on, which comes out a number
      function charMath(e, ch) {
        e = stripParens(e);
        return !!e && e.k === "bin" && (e.op === "+" || e.op === "-") && !py && !js &&
               (isChar(e.a, ch) || isChar(e.b, ch)) &&
               !(isText(e.a) && !isChar(e.a, ch)) && !(isText(e.b) && !isChar(e.b, ch));
        function isText(x) { return kindOf(x, ch) === "text"; }
      }
      function wrapAt(e, rank, ch) {
        var t = px(e, ch);
        return t.r < rank ? "(" + t.t + ")" : t.t;
      }
      function pxBin(s, ch) {
        var op = s.op;
        // a.compareTo(b) < 0, string.Compare(a, b) >= 0: a < b, a >= b
        if (FLIP[op]) {
          var la = stripParens(s.a), lr = stripParens(s.b);
          var lc = la && la.k === "call" ? libCall(la, ch) : la;
          if (lc && lc.k === "compare" && lr.k === "num" && lr.v === "0") {
            return pxBin({ k: "bin", op: op, a: lc.a, b: lc.b, line: s.line }, ch);
          }
          // s.find(x) != string::npos, it != v.end(): whether it is there
          var rp = bare(pathOf(lr) || "");
          if (/(^|\.)npos$/.test(rp) || (lr.k === "call" && lr.fn.k === "member" && lr.fn.name === "end")) {
            var found = lc && lc.k === "call" && lc.builtin && lc.fn.v === "indexOf"
                      ? builtinCall("contains", lc.args, s.line) : null;
            if (found) { return px(op === "!=" ? found : { k: "un", op: "!", a: found }, ch); }
          }
        }
        if (op === "in" || op === "not in") {
          var test = builtinCall("contains", [s.b, s.a], s.line);
          return px(op === "in" ? test : { k: "un", op: "!", a: test }, ch);
        }
        if (op === "instanceof" || op === "is") {
          return px(typeTest(s.a, stripParens(s.b).v || pathOf(s.b) || "", s.line), ch);
        }
        if (op === "as") { return px(s.a, ch); }
        var ka = kindOf(s.a, ch), kb = kindOf(s.b, ch);
        // integer division, said the way each language means it
        if (op === "//") {
          return { t: "floor(" + wrapAt(s.a, 6, ch) + " / " + wrapAt(s.b, 7, ch) + ")", r: 9 };
        }
        if (op === "/" && !py && !js && ka === "int" && kb === "int") {
          return { t: "int(" + wrapAt(s.a, 6, ch) + " / " + wrapAt(s.b, 7, ch) + ")", r: 9 };
        }
        if (op === "*" && py && (ka === "text" || kb === "text")) {
          return px(builtinCall("repeat", ka === "text" ? [s.a, s.b] : [s.b, s.a], s.line), ch);
        }
        if (op === "+" && (ka === "text" || kb === "text")) {
          // Java's and C#'s "x = " + p: p's describe(), where it has one
          var da = described(s.a), db = described(s.b);
          if (da !== s.a || db !== s.b) { s = { k: "bin", op: "+", a: da, b: db, line: s.line }; }
        }
        if (/^(<<|>>|>>>|&|\||\^|~)$/.test(op) && !(op === "^" && false)) {
          if (op === "&" && ka === "bool") { op = "&&"; }
          else if (op === "|" && ka === "bool") { op = "||"; }
          else if (op === "^" && ka === "bool") { op = "!="; }
          else if (py && op === "|" && (isListKind(ka) || ka === "map")) { return px(builtinCall("union", [s.a, s.b]), ch); }
          else if (py && op === "&" && isListKind(ka)) { return px(builtinCall("intersection", [s.a, s.b]), ch); }
          // shifts are doubling and halving; the rest, one bit at a time
          else if (op === "<<") {
            return px({ k: "bin", op: "*", a: s.a, b: { k: "bin", op: "**", a: num(2), b: s.b }, line: s.line }, ch);
          } else if (op === ">>" || op === ">>>") {
            return px(builtinCall("floor", [{ k: "bin", op: "/", a: s.a, b: { k: "bin", op: "**", a: num(2), b: s.b } }], s.line), ch);
          } else {
            return px(builtinCall({ "&": "bitAnd", "|": "bitOr", "^": "bitXor" }[op], [s.a, s.b], s.line), ch);
          }
        }
        if (op === "-" && py && /^set/.test(ka || "")) { return px(builtinCall("difference", [s.a, s.b]), ch); }
        // letters as the numbers they are: 'c' - 'a', c + 1, ch >= 'a'
        if (/^(\+|-|<|<=|>|>=)$/.test(op) && (isChar(s.a, ch) || isChar(s.b, ch)) &&
            !(op === "+" && (ka === "text" && !isChar(s.a, ch) || kb === "text" && !isChar(s.b, ch)))) {
          var ordered = function (x) { return isChar(x, ch) ? builtinCall("ord", [x], s.line) : x; };
          if (/^[<>]/.test(op) || !py) {
            return pxBin({ k: "bin", op: op, a: ordered(s.a), b: ordered(s.b), line: s.line }, ch);
          }
        }
        // words compared from code are compared exactly, capitals and all
        if ((op === "==" || op === "!=") && (ka === "text" || kb === "text")) {
          var lt0 = px(s.a, ch), rt0 = px(s.b, ch);
          return { t: (lt0.r < 4 ? "(" + lt0.t + ")" : lt0.t) + " " + op + " " +
                      (rt0.r < 4 ? "(" + rt0.t + ")" : rt0.t), r: 3 };
        }
        var word = AS_WORD[op] || op;
        var r = RANKS[word] || 5;
        var left = px(s.a, ch), right = px(s.b, ch);
        var lt = left.r < r ? "(" + left.t + ")" : left.t;
        var rt = right.r <= r ? "(" + right.t + ")" : right.t;
        // a AND (b AND c) is a AND b AND c
        if ((word === "AND" || word === "OR") && right.r === r && stripParens(s.b).k === "bin" &&
            (AS_WORD[stripParens(s.b).op] || stripParens(s.b).op) === word) { rt = right.t; }
        if (word === "^" && left.r <= 8) { lt = "(" + left.t + ")"; }
        return { t: lt + " " + word + " " + rt, r: r };
      }
      function pxCall(s, ch) {
        var dressed = shownPlain(s);       // x.toFixed(2), format(x, ".2f")
        if (dressed !== s) { return px(dressed, ch); }
        if (s.builtin || s.mine) {
          return { t: nameOf(s.fn.v) + "(" + s.args.map(function (a) {
            return px(a.k === "ref" || a.k === "addr" ? a.e : a, ch).t;
          }).join(", ") + ")", r: 9 };
        }
        var asked = inputOf(s);
        if (asked) { note(s.line, "input"); return { t: '""', r: 9 }; }
        var p = bare(pathOf(s.fn) || "");
        if (s.fn.k === "name" && !(ch && (ch.names[s.fn.v] || ch.params[s.fn.v])) && !globalChart.names[s.fn.v]) {
          note(s.line, (p || "…") + "()");
        } else if (s.fn.k !== "name") {
          note(s.line, (s.fn.k === "member" ? s.fn.name : p || "…") + "()");
        }
        var head = s.fn.k === "member" ? wrapAt(s.fn.obj, 9, ch) + "." + s.fn.name
                 : s.fn.k === "name" ? nameOf(s.fn.v) : wrapAt(s.fn, 9, ch);
        return { t: head + "(" + s.args.filter(function (a) { return a.k !== "kw"; })
                                     .map(function (a) { return px(a, ch).t; }).join(", ") + ")", r: 9 };
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
            if (st.folded) { return; }
            var target = st.target.k === "name" ? nameOf(st.target.v) : px(st.target, ch).t;
            row(deep, "Set " + target + " = " + px(st.value, ch).t);
            return;
          }
          case "input": row(deep, "Input " + px(st.target, ch).t); return;
          case "display":
            // Money, shown to two places straight after a dollar sign, is
            // what the runner does with any number there by itself.
            row(deep, "Display " + (st.parts.length ? st.parts.map(function (p, i) {
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
            }).join(", ") : '""'));
            return;
          case "call": {
            var e = stripParens(st.e);
            row(deep, "Call " + px(e, ch).t);
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
            var other = st.orelse || [];
            while (other.length === 1 && other[0].k === "if" && other[0].chained) {
              row(deep, "Else If " + cond(other[0].cond, ch) + " Then");
              write(other[0].then, deep + 1, ch);
              other = other[0].orelse || [];
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
            row(deep, "For Each " + nameOf(st.v) + " In " + px(st.over, ch).t);
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
          case "break": case "continue": return;
          case "commented": {
            row(deep, "// " + st.head);
            var keep = rows;
            rows = [];
            write(st.body, deep + 1, ch);
            var said = rows;
            rows = keep;
            said.forEach(function (r) { rows.push(r.replace(/^(\s*)/, "$1// ")); });
            return;
          }
        }
        row(deep, "// " + st.k);
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
        if (e.k === "bin") { return !/^(in|not in|instanceof|is)$/.test(e.op) && isConstant(e.a, allowed) && isConstant(e.b, allowed); }
        if (e.k === "name") { return !!allowed[e.v] || !!e.constant; }
        if (e.k === "cast") { return isConstant(e.e, allowed); }
        if (e.k === "member") { return /^(Math\.PI|math\.pi)$/.test(pathOf(e) || ""); }
        if (e.k === "list" || e.k === "tuple") {
          return e.items.every(function (x) { return x && x.k !== "star" && isConstant(x, allowed); });
        }
        if (e.k === "sized") {
          return e.dims.every(function (d) { return isConstant(d, allowed); }) && isConstant(e.fill, allowed) || (e.fill && e.fill.k === "null" && e.dims.every(function (d) { return isConstant(d, allowed); }));
        }
        return false;
      }
      // A Declare's words: Declare Integer scores[] = [90, 85],
      // Declare Boolean seen[h][w], Constant Real RATE = 0.2
      function declText(one, konst, value, ch, typeOverride) {
        var parts = typeParts(one.kind);
        var word = typeOverride !== undefined ? typeOverride : isMoney(one) ? "Currency" : parts.word;
        var v = value ? stripParens(value) : null;
        var dims = "";
        if (v && v.k === "sized") {
          dims = v.dims.map(function (d) { return "[" + px(d, ch).t + "]"; }).join("");
          if (!word) { word = TYPE_WORD[kindOf(v.fill, ch)] || ""; }
        } else if (parts.dims) {
          dims = new Array(parts.dims + 1).join("[]");
        }
        var text = (konst ? "Constant " : "Declare ") + (word ? word + " " : "") + nameOf(one.name) + dims;
        if (v && v.k === "sized") {
          var fill = stripParens(v.fill);
          var blank = !fill || fill.k === "null" || (fill.k === "num" && fill.v === "0" && /Integer|Real/.test(word)) ||
                      (fill.k === "bool" && !fill.v && word === "Boolean") || (fill.k === "str" && !fill.v && word === "String");
          if (!blank) { text += " = " + px(v.fill, ch).t; }
          return text;
        }
        if (v) { text += " = " + px(v, ch).t; }
        return text;
      }
      function declareRows(ch, body, deep, known) {
        var out = [];
        var allowed = Object.assign({}, known || {});
        if (ch.fn) { ch.fn.params.forEach(function (p) { allowed[p.name] = true; }); }
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
          if (fixed(one, true) || isListKind(one.kind)) { allowed[one.name] = true; }
        }
        // A Constant: said to be one, or in Python named like one, and
        // given its value once.
        function fixed(one, first) {
          var konst = first && one.konst && one.sets <= 1;
          if (py && first && /^[A-Z][A-Z0-9_]*$/.test(one.name) && one.sets <= 1) { konst = true; }
          if (js && konst && !/^[A-Z][A-Z0-9_]*$/.test(one.name)) { konst = false; }
          if (isListKind(one.kind) || one.kind === "map") { konst = false; }
          return !!konst;
        }
        function said(one) {
          if (one.loopOnly && !one.declared) { return; }
          var first = folded[one.name];
          var konst = fixed(one, !!first);
          var parts = typeParts(one.kind);
          var type = isMoney(one) ? "Currency" : parts.word;
          // total = 0, then total + cost where nothing says what cost is:
          // not certainly a whole number, so not declared as one
          if (one.kind === "int" && (one.values || []).some(function (v) { return !kindOf(v, ch); })) { type = ""; }
          if (!type && !first) { return; }         // nothing to say about it
          if (first) { first.folded = true; }
          out.push(declText(one, konst, first ? first.value : null, ch, type ? undefined : ""));
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

      // What the program is called, as far as its code says: the one
      // function a main that does nothing else calls -- make_maze() -- or
      // the class Java and C# keep main in, where that is not just Main.
      function titleHint() {
        var real = mainBody.filter(function (s) {
          return s.k !== "note" && s.k !== "drop" && !(s.k === "set" && s.folded);
        });
        var called = [];
        eachNode(real, function (x) {
          if (x.k === "call" && x.mine && x.fn && called.indexOf(x.fn.v) < 0) { called.push(x.fn.v); }
        });
        if (real.length <= 3 && called.length === 1 && !FACTORIES[called[0]]) { return called[0]; }
        if (top.mainClass && !/^(Main|Program|App|Application|Solution|Driver|Test|Runner|Demo|Start|Launcher)$/i.test(top.mainClass)) {
          return top.mainClass;
        }
        return "";
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
        var setUp = [];
        globalChart.list.forEach(function (g) {
          kindChart = mainChart;
          var value = g.value || null;
          if (value && !/^(sized|list|tuple|dict|num|str|bool|un|bin|name|cast|member|null)$/.test(stripParens(value).k)) {
            var pre = [];
            value = ready(value, mainChart, pre).e;
            setUp = setUp.concat(pre);
          }
          if (value) {
            var lc = libCall(value, mainChart);
            if (lc && lc !== value && /^(sized|list|dict)$/.test(lc.k)) { value = lc; }
          }
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
          var konst = g.konst && value && isConstant(value, sharedKnown) && !isListKind(g.kind) ||
                      (py && value && /^[A-Z][A-Z0-9_]*$/.test(g.name) && g.sets <= 1 && !isListKind(g.kind));
          if (value && !isConstant(value, sharedKnown)) {
            // worked out: declared here, set where main starts
            setUp.push({ k: "set", target: { k: "name", v: g.name }, value: value, line: g.line });
            value = null;
            konst = false;
          }
          if (value && konst) { sharedKnown[g.name] = true; }
          row(0, declText(g, konst, value, mainChart));
        });
        mainBody = setUp.concat(mainBody);
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
      for (var lf0 = 0; lf0 < lateFns.length; lf0++) {
        if (!lateFns[lf0].chart) { chartFor(lateFns[lf0]); }
      }
      for (var w = 0; w < fnCharts.length; w++) {
        writeChart(fnCharts[w]);
        // a lambda first met while writing: a chart of its own as well
        for (var lf = 0; lf < lateFns.length; lf++) {
          if (!lateFns[lf].chart) { chartFor(lateFns[lf]); }
        }
      }
      function writeChart(ch) {
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
      }
      (top.trailing || []).forEach(function (n) { if (n.text) { row(0, "// " + n.text); } });

      notes.sort(function (a, b) { return a.line - b.line; });
      return { text: rows.join("\n") + "\n", notes: notes.filter(function (n) { return n.line; }),
               title: titleHint() };
    }

    // ==================================================== which language ==
    // Code is its own best label.  Each language has things only it says --
    // System.out.println, Console.WriteLine, #include, console.log, a def
    // ending in a colon -- and whichever language the code says most of the
    // things of is the one it is written in.  A file's name says it outright
    // (.py, .java), and outweighs all of them.  None of the signs at all, and
    // there is no telling: null, and whoever asked goes by what they had.
    var SIGNS = {
      python: [[/^\s*def\s+\w+\s*\([^)]*\)\s*(?:->\s*[\w\[\], ]+\s*)?:\s*(?:#.*)?$/m, 8],
               [/^\s*(?:if|while|elif|else|for|try|except)\b[^\n{};]*:\s*(?:#.*)?$/m, 5],
               [/^\s*elif\b/m, 6], [/^\s*for\s+\w+\s+in\s+/m, 5],
               [/^\s*(?:import\s+\w+(?:\s*,\s*\w+)*|from\s+[\w.]+\s+import\s+.+)\s*$/m, 4],
               [/\bprint\s*\(/, 2], [/\binput\s*\(/, 3], [/\brange\s*\(/, 3],
               [/\bf"[^"]*\{/, 4], [/\b(?:True|False|None)\b/, 2], [/\b(?:and|or|not)\s/, 1],
               [/\blen\s*\(/, 2], [/^\s*#(?!include|define|pragma|region)/m, 1],
               [/;\s*$/m, -4], [/\{\s*$/m, -5]],
      java: [[/\bSystem\.out\.print/, 9], [/\bpublic\s+static\s+void\s+main\s*\(\s*String/, 10],
             [/\bimport\s+java\./, 10], [/\bnew\s+Scanner\s*\(/, 8], [/\bString\[\]/, 4],
             [/\b(?:Integer|Double)\.parse\w+/, 6], [/\bboolean\b/, 4], [/\bString\s+\w+\s*=/, 3],
             [/\.equals\s*\(/, 3], [/\.length\(\)/, 2], [/\bclass\s+\w+/, 1]],
      csharp: [[/\bConsole\.(?:WriteLine|Write|ReadLine|ReadKey)\b/, 10], [/\busing\s+System\b/, 9],
               [/\bstatic\s+void\s+Main\s*\(/, 9], [/\bnamespace\s+\w+/, 4], [/\bstring\[\]/, 5],
               [/\b(?:int|double|bool|decimal)\.(?:Parse|TryParse)\b/, 7], [/\$"[^"]*\{/, 5],
               [/\bConvert\.To\w+/, 6], [/\bstring\s+\w+\s*=/, 3], [/\.Length\b/, 2], [/\bclass\s+\w+/, 1]],
      cpp: [[/^\s*#include\s*[<"]/m, 10], [/\bstd::/, 8], [/\bcout\s*<</, 9], [/\bcin\s*>>/, 9],
            [/\busing\s+namespace\s+std\b/, 10], [/\bint\s+main\s*\(/, 5], [/\bendl\b/, 5]],
      javascript: [[/\bconsole\.(?:log|error|warn|info)\s*\(/, 10], [/\b(?:let|const|var)\s+\w+\s*=/, 4],
                   [/\bfunction\s+\w+\s*\(/, 4], [/=>/, 3], [/===|!==/, 5], [/\bprompt\s*\(/, 5],
                   [/\brequire\s*\(/, 6], [/\bdocument\./, 6], [/\x60[^\x60]*\$\{/, 6],
                   [/\b(?:parseInt|parseFloat|Number)\s*\(/, 3], [/\bmodule\.exports\b/, 8],
                   [/\.toFixed\s*\(/, 4]]
    };
    var EXT_LANG = { py: "python", pyw: "python", java: "java", cs: "csharp", cpp: "cpp",
                     cc: "cpp", cxx: "cpp", hpp: "cpp", h: "cpp", js: "javascript",
                     mjs: "javascript", cjs: "javascript" };
    function detect(src) {
      var files = typeof src === "string" ? [{ name: "", text: src }] : (src || []);
      var score = {};
      Object.keys(SIGNS).forEach(function (lang) { score[lang] = 0; });
      files.forEach(function (one) {
        var ext = /\.([A-Za-z0-9]+)$/.exec(String(one.name || ""));
        if (ext && EXT_LANG[ext[1].toLowerCase()]) { score[EXT_LANG[ext[1].toLowerCase()]] += 50; }
        var text = String(one.text || "");
        Object.keys(SIGNS).forEach(function (lang) {
          SIGNS[lang].forEach(function (sign) { if (sign[0].test(text)) { score[lang] += sign[1]; } });
        });
      });
      var best = null;
      Object.keys(score).forEach(function (lang) {
        if (score[lang] > 0 && (!best || score[lang] > score[best])) { best = lang; }
      });
      return best;
    }
    translate.detect = detect;

    return translate;
  })();
