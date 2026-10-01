// ---------------------------------------------------------------------------
//  27-ask.js -- putting right what needs a word from you first
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ==================================================== asked, then put in ==
  // Some warnings know exactly what is wrong, and all but one thing about
  // putting it right.  "Nothing has been put in total yet" knows total
  // wants a value before the line that uses it, and not which value.  A Do
  // with no test knows where its test goes and not what it tests.  A loop
  // that never stops knows the line it is missing at its foot -- very
  // nearly.  Those used to stop at saying so (27-mend.js offers only what
  // has one right answer), and left you to go and find the line.
  //
  // Now each asks for the one thing it is missing, in a box under the
  // warning.  Type it, press Enter, and the page writes it where it goes,
  // in the way the rest of the program is written, draws the chart again
  // and -- for a fault a run stopped at -- runs it again, so you see it
  // go.  Whatever is still wrong after that is said the same way, so a
  // program is put right a question at a time.
  //
  // What is asked for is the smallest thing that will do: a value, a test,
  // a line number, the words for a shape.  Where the page can make a good
  // guess it is filled in, to keep or to change (count = count + 1, for a
  // loop whose counter never moves); where it cannot, the box shows an
  // example in grey.  Where nothing more particular fits, the line itself
  // is offered to be written again, as it is now, so every red line has
  // something under it to do.
  //
  // Not in a puzzle, where putting it right is the puzzle, and not in Code,
  // where the pseudocode is read from the code (mendsOff, 27-mend.js).

  // ---- the box -----------------------------------------------------------
  // `ask` is
  //   { rows: [{ says, fields: [{ kind, hint, value, label, list, options,
  //                               min, max }],
  //              go, put: function (answers) -> "" or why it could not }],
  //     also: [{ says, put: function () -> "" or why not }] }
  // A row is a question and the button that answers it; `also` are answers
  // with nothing to type.  `kind` is "code" (a value or a test, checked
  // for a quote or a bracket left open), "line" (a whole line of it),
  // "name", "number", "text" (the words for a shape) or "pick" (one of
  // `options`, [{ value, text }]).
  function askBox(ask) {
    var box = document.createElement("div");
    box.className = "ask";
    // A press in here is not a press on the warning: the fault on the tape
    // is itself a button that goes to its line, and a double-click on it
    // puts it right.  (Its keys, Enter and Space, it leaves alone when they
    // come from in here -- they are what typing an answer is made of -- and
    // the rest is let through, for the lists that open from a press.)
    ["click", "dblclick"].forEach(function (kind) {
      box.addEventListener(kind, function (ev) { ev.stopPropagation(); });
    });
    var bad = document.createElement("div");
    bad.className = "ask-bad";
    bad.hidden = true;
    bad.setAttribute("role", "alert");
    function said(why, field) {
      bad.textContent = why || "";
      bad.hidden = !why;
      if (why && field) {
        field.classList.add("ask-wrong");
        field.focus();
      }
    }
    (ask.rows || []).forEach(function (row) {
      var line = document.createElement("div");
      line.className = "ask-row";
      if (row.says) {
        var q = document.createElement("div");
        q.className = "ask-says";
        q.textContent = row.says;
        line.appendChild(q);
      }
      var inputs = [];
      var go = document.createElement("button");
      row.fields.forEach(function (f) {
        if (f.label) {
          var named = document.createElement("span");
          named.className = "ask-label";
          named.textContent = f.label;
          line.appendChild(named);
        }
        var input;
        if (f.kind === "pick") {
          input = document.createElement("select");
          input.className = "field ask-in";
          var none = document.createElement("option");
          none.value = "";
          none.textContent = f.hint || TXT.ask_pick;
          input.appendChild(none);
          (f.options || []).forEach(function (o) {
            var one = document.createElement("option");
            one.value = o.value;
            one.textContent = o.text;
            input.appendChild(one);
          });
          if (f.value !== undefined) { input.value = f.value; }
        } else {
          input = document.createElement("input");
          input.type = f.kind === "number" ? "number" : "text";
          input.className = "field ask-in" + (f.kind === "text" ? "" : " ask-code");
          input.placeholder = f.hint || "";
          input.value = f.value || "";
          input.spellcheck = false;
          input.autocomplete = "off";
          if (f.kind === "number") {
            if (f.min !== undefined) { input.min = f.min; }
            if (f.max !== undefined) { input.max = f.max; }
          }
          if (f.list && f.list.length) {
            var list = document.createElement("datalist");
            list.id = "ask-list-" + (++askLists);
            f.list.forEach(function (word) {
              var o = document.createElement("option");
              o.value = word;
              list.appendChild(o);
            });
            line.appendChild(list);
            input.setAttribute("list", list.id);
          }
          input.addEventListener("keydown", function (ev) {
            if (ev.key === "Enter") { ev.preventDefault(); go.click(); }
          });
        }
        input.addEventListener("input", function () { input.classList.remove("ask-wrong"); said(""); });
        input.setAttribute("aria-label", [row.says, f.label].filter(Boolean).join(" "));
        inputs.push(input);
        line.appendChild(input);
      });
      go.type = "button";
      go.className = "mend ask-go";
      go.textContent = row.go || TXT.ask_go;
      go.onclick = function (ev) {
        ev.stopPropagation();
        var answers = inputs.map(function (i) { return String(i.value).trim(); });
        for (var k = 0; k < answers.length; k++) {
          var why = askCheck(row.fields[k], answers[k]);
          if (why) { said(why, inputs[k]); return; }
        }
        var not = row.put(answers);
        if (not) { said(not, inputs[0]); }
      };
      line.appendChild(go);
      box.appendChild(line);
    });
    if (ask.also && ask.also.length) {
      var more = document.createElement("div");
      more.className = "ask-also";
      ask.also.forEach(function (a) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "mend";
        b.textContent = a.says;
        b.onclick = function (ev) {
          ev.stopPropagation();
          var not = a.put();
          if (not) { said(not); }
        };
        more.appendChild(b);
      });
      box.appendChild(more);
    }
    box.appendChild(bad);
    return box;
  }
  var askLists = 0;

  // What is wrong with an answer before it goes anywhere: nothing typed, a
  // quote or a bracket left open (which would only swap this warning for
  // that one), a line number off the end, a name that is not a name.
  function askCheck(field, answer) {
    if (!field) { return ""; }
    if (!answer) { return field.kind === "pick" ? TXT.ask_bad_pick : TXT.ask_bad_empty; }
    if (field.kind === "code" || field.kind === "line") {
      var quote = null, round = 0, square = 0;
      for (var i = 0; i < answer.length; i++) {
        var c = answer.charAt(i);
        if (quote) { if (c === quote) { quote = null; } continue; }
        if (c === '"' || c === "'") { quote = c; }
        else if (c === "(") { round++; }
        else if (c === ")") { round--; }
        else if (c === "[") { square++; }
        else if (c === "]") { square--; }
        if (round < 0 || square < 0) { return say("ask_bad_shut", { text: c }); }
      }
      if (quote) { return say("ask_bad_open", { text: quote }); }
      if (round) { return say("ask_bad_open", { text: "(" }); }
      if (square) { return say("ask_bad_open", { text: "[" }); }
    }
    if (field.kind === "name" && !/^[A-Za-z_]\w*$/.test(answer)) { return TXT.ask_bad_name; }
    if (field.kind === "number") {
      var n = Number(answer);
      if (!/^\d+$/.test(answer) || n < field.min || n > field.max) {
        return say("ask_bad_line", { from: field.min, to: field.max });
      }
    }
    return "";
  }

  // ---- writing it in -----------------------------------------------------
  // The way the fixes in 27-mend.js write theirs: typed over, so Ctrl+Z
  // takes it back.  `edits` are [{ at, cut, put }] -- from line `at`, take
  // out `cut` lines and put the lines `put` there -- all worked out on the
  // box as it was built, and done from the foot up so that the numbers of
  // the lines above each one stay true.  `back` is the line to show after,
  // and `rerun` says to run it again once it is drawn.  Anything typed into
  // the box since it was built has moved the lines, and then nothing is
  // done and the answer says why.
  function askWrite(edits, back, rerun) {
    var code = el("#code");
    if (!code) { return TXT.ask_stale; }
    if (typeof builtText === "string" && code.value !== builtText) { return TXT.ask_stale; }
    edits.slice().sort(function (a, b) { return b.at - a.at; }).forEach(function (e) {
      var text = code.value, lines = text.split("\n");
      var put = e.put || [], cut = e.cut || 0;
      if (e.at > lines.length) {
        // past the foot: lines of their own after the last one
        var gap = text && !/\n$/.test(text) ? "\n" : "";
        typeOver(code, text.length, text.length, gap + put.join("\n"));
        return;
      }
      var from = 0, i;
      for (i = 0; i < e.at - 1; i++) { from += lines[i].length + 1; }
      var to = from;
      for (i = 0; i < cut && e.at - 1 + i < lines.length; i++) { to += lines[e.at - 1 + i].length + 1; }
      var said = put.length ? put.join("\n") + "\n" : "";
      if (to > text.length) {           // the last line of all has no newline after it
        to = text.length;
        said = said.replace(/\n$/, "");
        if (!put.length && from > 0) { from--; }
      }
      if (from === to && !said) { return; }
      typeOver(code, from, to, said);
    });
    afterAsked(back, rerun);
    return "";
  }

  // Then the same as any fix: out of the full screen, the line shown, the
  // chart drawn again -- and run again, where it was a run that stopped.
  function afterAsked(back, rerun) {
    tapeFull(false);
    if (back) { pickLine(0, back); }
    if (rerun) { runWhenBuilt(); }
    buildAsked();
  }

  // Run it again once the chart it is to run is drawn (drawItNow keeps the
  // list, 09-build.js), through the Run button, so a puzzle or a save that
  // listens to the button hears it.  Not much later: a build turned down
  // -- blocks moved, and asked about -- leaves this waiting, and it should
  // not go off by surprise under some build long after.
  function runWhenBuilt() {
    whenBuilt.push({ at: Date.now(), go: function () {
      var run = el("#run");
      if (run && !run.disabled && !running) { run.click(); }
    } });
  }

  // ---- reading the program -----------------------------------------------
  function askLines() {
    var code = el("#code");
    return code ? String(code.value).split("\n") : [];
  }
  function leadOf(s) { return (/^[ \t]*/.exec(s || "") || [""])[0]; }

  // Whether the program closes its blocks with End If and the like, or by
  // stepping back out of them, Python style (parse/read.py's indent_mode).
  // A fix writes the way the rest is written: one End If put into a
  // program that has none would turn every other block in it into one
  // left open.
  var ASK_CLOSER = /^(end[ -]?\w*|endif|endwhile|endfor|endselect|fi|wend|loop\b.*|next\b.*|until\s.*|done|od)$/i;
  function closesBlocks(lines) {
    var indented = lines.some(function (l) { return /^[ \t]+\S/.test(l); });
    return !indented || lines.some(function (l) { return ASK_CLOSER.test(l.trim()); });
  }
  // Set total = 0, or total = 0: whichever the program says.
  function setWord(lines) {
    return lines.some(function (l) { return /^\s*set\s+\S/i.test(l); }) ? "Set " : "";
  }
  // One step in from line `at`: as far in as the line under it is, where
  // that is further, or four spaces.
  function stepIn(lines, at) {
    var own = leadOf(lines[at - 1]);
    for (var i = at; i < lines.length; i++) {
      if (!lines[i].trim()) { continue; }
      var lead = leadOf(lines[i]);
      return lead.length > own.length ? lead : own + "    ";
    }
    return own + "    ";
  }

  // The statements of the program, as the run has them.
  function askKids(item) {
    var out = [];
    ["then", "else", "body"].forEach(function (k) {
      if (Array.isArray(item[k])) { out = out.concat(item[k]); }
    });
    (item.cases || []).forEach(function (c) { out = out.concat(c.body || []); });
    return out;
  }
  function flowsOf() {
    if (!AST) { return []; }
    return [AST.main || []].concat((AST.modules || []).map(function (m) { return m.body || []; }));
  }
  function holdsLine(item, line) {
    return item.line === line || askKids(item).some(function (k) { return holdsLine(k, line); });
  }
  function lastLineIn(item) {
    return askKids(item).reduce(function (most, k) { return Math.max(most, lastLineIn(k)); }, item.line || 0);
  }
  // The statement at the top of its chart that line `line` is in: what a
  // name needs before that line goes in front of it -- in front of the
  // loop it is in, not inside it, where it would start again every round.
  function topHolding(line) {
    var flows = flowsOf();
    for (var f = 0; f < flows.length; f++) {
      for (var i = 0; i < flows[f].length; i++) {
        if (flows[f][i].op !== "start" && holdsLine(flows[f][i], line)) { return flows[f][i]; }
      }
    }
    return null;
  }
  var LOOPISH = { "while": 1, dowhile: 1, "for": 1, foreach: 1 };
  // The innermost loop that line `line` is in, or is.
  function loopHolding(line) {
    var best = null;
    function walk(items) {
      items.forEach(function (it) {
        if (!holdsLine(it, line)) { return; }
        if (LOOPISH[it.op]) { best = it; }
        walk(askKids(it));
      });
    }
    flowsOf().forEach(walk);
    return best;
  }
  // Where a new last line of a loop goes: past its last statement, and the
  // End lines of the blocks inside it, up to its own End While (or Until,
  // or Next) -- or, written by indenting, the first line stepping back out.
  function loopFoot(lines, loop) {
    var own = leadOf(lines[loop.line - 1]).length;
    var i = lastLineIn(loop);            // the index of the line after it
    while (i < lines.length) {
      var t = lines[i].trim();
      if (!t || (leadOf(lines[i]).length > own && ASK_CLOSER.test(t))) { i++; continue; }
      break;
    }
    // blank lines left between the last statement and the End belong under it
    while (i > lastLineIn(loop) && !lines[i - 1].trim()) { i--; }
    return i + 1;
  }

  // The names a test is about, and whether the loop ever changes them.
  function setsIn(items, into) {
    into = into || {};
    items.forEach(function (it) {
      var name = /^[A-Za-z_]\w*/.exec(String(it.var || ""));
      if (name && (it.op === "set" || it.op === "input" || it.op === "declare" || it.op === "foreach")) {
        into[name[0].toLowerCase()] = true;
      }
      if (it.op === "for") {
        var head = /^\s*([A-Za-z_]\w*)/.exec(String(it.init || ""));
        if (head) { into[head[1].toLowerCase()] = true; }
      }
      if (it.op === "call") { into["(call)"] = true; }
      setsIn(askKids(it), into);
    });
    return into;
  }
  // The line a loop that never stops is most likely missing: the counter
  // in its test moved on a step, the way that keeps it going toward where
  // it stops.  While n < 10 never moving n wants n = n + 1; Until n <= 0
  // wants n = n - 1.  Where the test does not say which way, the name is
  // started on and the rest left to you; where every name in it does
  // change, there is no guess to make.
  function stepGuess(loop, set) {
    if (loop.op !== "while" && loop.op !== "dowhile") { return ""; }
    var sets = setsIn(loop.body || []);
    var cond = String(loop.cond || "").replace(/"[^"]*"|'[^']*'/g, '""');
    var up = loop.op === "dowhile" && loop.until ? { ">": 1, ">=": 1, "<": -1, "<=": -1 }
                                                  : { "<": 1, "<=": 1, ">": -1, ">=": -1 };
    var pair = /([A-Za-z_]\w*)\s*(<=|>=|<>|!=|==|<|>|=)\s*([A-Za-z_]\w*|-?\d[\d.]*)?/g, m;
    while ((m = pair.exec(cond))) {
      var name = m[1], other = m[3] || "";
      var flip = { "<": ">", "<=": ">=", ">": "<", ">=": "<=" };
      var op = m[2];
      if (sets[name.toLowerCase()] || /^(and|or|not|mod|div)$/i.test(name)) {
        // the name on the right, then: limit > n is n < limit
        if (/^[A-Za-z_]/.test(other) && !sets[other.toLowerCase()] && flip[op]) {
          name = other; op = flip[op];
        } else {
          continue;
        }
      }
      var way = up[op];
      if (way) { return set + name + " = " + name + (way > 0 ? " + 1" : " - 1"); }
      // waiting on an answer that is never asked for again
      if (!other) { return "Input " + name; }
      return set + name + " = ";
    }
    return "";
  }

  // A call to `name` on a line, written out: where its brackets open and
  // close, and what is between them -- the one handed `got` things, where
  // the line calls it more than once.
  function callOn(raw, name, got) {
    var low = raw.toLowerCase(), want = String(name).toLowerCase(), found = null;
    for (var i = 0; i < raw.length; i++) {
      var c = raw.charAt(i);
      if (c === '"' || c === "'") {
        var shut = raw.indexOf(c, i + 1);
        if (shut < 0) { break; }
        i = shut;
        continue;
      }
      if (low.substr(i, want.length) !== want || /\w/.test(raw.charAt(i - 1) || "")) { continue; }
      var j = i + want.length;
      while (raw.charAt(j) === " ") { j++; }
      if (raw.charAt(j) !== "(") { continue; }
      var deep = 0, quote = null, k;
      for (k = j; k < raw.length; k++) {
        var d = raw.charAt(k);
        if (quote) { if (d === quote) { quote = null; } continue; }
        if (d === '"' || d === "'") { quote = d; continue; }
        if (d === "(" || d === "[") { deep++; }
        if (d === ")" || d === "]") { deep--; if (!deep) { break; } }
      }
      if (k >= raw.length) { continue; }
      var one = { open: j, close: k, inner: raw.slice(j + 1, k) };
      one.parts = splitTop(one.inner);
      if (!found || one.parts.length === got) { found = one; }
      if (one.parts.length === got) { break; }
    }
    return found;
  }
  // What is between a call's brackets, cut at the commas that are its own
  // -- not the ones inside a call or a list or a piece of text handed to it.
  function splitTop(inner) {
    if (!inner.trim()) { return []; }
    var out = [], deep = 0, quote = null, now = "";
    for (var i = 0; i < inner.length; i++) {
      var c = inner.charAt(i);
      if (quote) { if (c === quote) { quote = null; } now += c; continue; }
      if (c === '"' || c === "'") { quote = c; }
      if (c === "(" || c === "[" || c === "{") { deep++; }
      if (c === ")" || c === "]" || c === "}") { deep--; }
      if (c === "," && !deep) { out.push(now.trim()); now = ""; continue; }
      now += c;
    }
    out.push(now.trim());
    return out;
  }

  // Words to be shown, in quotes -- unless they are in quotes already, or
  // a number.
  function askQuoted(words) {
    if (/^["']/.test(words) || /^-?\d[\d.]*$/.test(words)) { return words; }
    return '"' + words.replace(/"/g, "'") + '"';
  }

  // ---- what to ask, for a fault a run stopped at -------------------------
  // `mended` is whether it already has a button that puts it right: then
  // nothing more is asked unless there is more than one way to read it --
  // a name one letter off another may be a slip, or a new name that wants
  // starting.
  function askForFault(err, mended) {
    var at = err && err.at;
    var line = at && at.line;
    if (!line || !AST) { return null; }
    var lines = askLines();
    if (line > lines.length) { return null; }
    var raw = lines[line - 1], lead = leadOf(raw);
    var closes = closesBlocks(lines), set = setWord(lines);
    var why = err.why || "";

    if (why === "r_unknown" && err.name) {
      var top = topHolding(line);
      if (!top || !top.line) { return null; }
      var before = leadOf(lines[top.line - 1]), name = err.name;
      return {
        rows: [{ says: say("ask_start", { name: name }),
                 fields: [{ kind: "code", hint: err.listy ? "[]" : "0" }],
                 put: function (a) {
                   return askWrite([{ at: top.line, put: [before + set + name + " = " + a[0]] }], line + 1, true);
                 } }],
        also: [{ says: TXT.ask_input, put: function () {
          return askWrite([{ at: top.line, put: [before + "Input " + name] }], line + 1, true);
        } }]
      };
    }
    if (mended) { return null; }

    if (why === "r_forever") {
      var loop = loopHolding(line);
      if (!loop) { return null; }
      var foot = loopFoot(lines, loop), inner = stepIn(lines, loop.line);
      var leave = { "while": "Exit While", dowhile: "Exit Do", "for": "Exit For", foreach: "Exit For" }[loop.op];
      return {
        rows: [
          { says: say("ask_forever", { line: loop.line }),
            fields: [{ kind: "line", value: stepGuess(loop, set), hint: set + "count = count + 1" }],
            put: function (a) { return askWrite([{ at: foot, put: [inner + a[0]] }], foot, true); } },
          { says: TXT.ask_stop_when,
            fields: [{ kind: "code", hint: "tries > 3" }],
            put: function (a) {
              var lines2 = [inner + "If " + a[0] + " Then", inner + "    " + leave];
              if (closes) { lines2.push(inner + "End If"); }
              return askWrite([{ at: foot, put: lines2 }], foot, true);
            } }
        ]
      };
    }

    if (why === "r_zero" && err.divisor && !/^[\d.\s]+$/.test(err.divisor) &&
        { set: 1, display: 1, call: 1, "return": 1, declare: 1 }[at.op]) {
      var d = String(err.divisor).trim();
      var test = /^[A-Za-z_][\w.]*$/.test(d) || /^\(.*\)$/.test(d) ? d : "(" + d + ")";
      var step = lead + "    ";
      var wrap = function (otherwise) {
        var out = [lead + "If " + test + " <> 0 Then", step + raw.trim()];
        if (otherwise) { out.push(lead + "Else", step + otherwise); }
        if (closes) { out.push(lead + "End If"); }
        return askWrite([{ at: line, cut: 1, put: out }], line + 1, true);
      };
      var rows = [];
      var target = /^(.*?(?:=|←|<-)\s*)/.exec(raw.trim());
      if (at.op === "set" && target) {
        rows.push({ says: say("ask_zero_else", { name: d }), fields: [{ kind: "code", hint: "0" }],
                    put: function (a) { return wrap(target[1] + a[0]); } });
      } else if (at.op === "display") {
        rows.push({ says: say("ask_zero_show", { name: d }), fields: [{ kind: "text", hint: TXT.ask_zero_eg }],
                    put: function (a) { return wrap("Display " + askQuoted(a[0])); } });
      }
      return { rows: rows, also: [{ says: say("ask_zero_skip", { name: d }),
                                    put: function () { return wrap(""); } }] };
    }

    if (why === "r_args" && err.name) {
      var call = callOn(raw, err.name, err.got);
      if (call && err.got < err.need) {
        var missing = (err.params || []).slice(err.got, err.need);
        return { rows: [{
          says: say("ask_args", { name: err.name + "()", what: missing.join(", ") }),
          fields: [{ kind: "code", hint: missing.join(", ") }],
          put: function (a) {
            var now = call.parts.length ? call.inner.replace(/\s+$/, "") + ", " + a[0] : a[0];
            return askWrite([{ at: line, cut: 1, put: [raw.slice(0, call.open + 1) + now + raw.slice(call.close)] }],
                            line, true);
          } }] };
      }
      if (call && err.got > (err.params || []).length) {
        var keep = call.parts.slice(0, err.params.length);
        return { rows: [], also: [{
          says: say("ask_args_cut", { n: call.parts.length - keep.length }),
          put: function () {
            return askWrite([{ at: line, cut: 1, put: [raw.slice(0, call.open + 1) + keep.join(", ") + raw.slice(call.close)] }],
                            line, true);
          } }] };
      }
    }

    if (why === "r_too_deep" && err.name) {
      var head = -1, mod = null;
      var says = new RegExp("^\\s*(?:function|module|sub|procedure|def)\\b[^(]*\\b" +
                            err.name.replace(/[^\w]/g, "") + "\\s*\\(", "i");
      for (var h = 0; h < lines.length; h++) { if (says.test(lines[h])) { head = h; break; } }
      (AST.modules || []).forEach(function (m) { if (m.name === err.name) { mod = m; } });
      if (head >= 0) {
        var gives = /^\s*function\b/i.test(lines[head]) || !!(mod && mod.returns) ||
                    JSON.stringify(mod ? mod.body : []).indexOf('"op":"return","expr":"') >= 0;
        var p = (err.params || [])[0] || "n";
        var inside = stepIn(lines, head + 1);
        var fields = [{ kind: "code", hint: p + " <= 1" }];
        if (gives) { fields.push({ kind: "code", hint: "1", label: TXT.ask_deep_give }); }
        return { rows: [{
          says: say("ask_deep", { name: err.name + "()" }), fields: fields,
          put: function (a) {
            var out = [inside + "If " + a[0] + " Then", inside + "    Return" + (gives ? " " + a[1] : "")];
            if (closes) { out.push(inside + "End If"); }
            return askWrite([{ at: head + 2, put: out }], head + 2, true);
          } }] };
      }
    }

    if (why === "r_unknown_fn" && err.name) {
      var known = (AST.modules || []).map(function (m) { return m.name; })
                  .concat(typeof BUILT === "object" ? Object.keys(BUILT) : []);
      var gone = err.name;
      return { rows: [{
        says: say("ask_use", { name: gone }),
        fields: [{ kind: "name", hint: known[0] || "sqrt", list: known }],
        put: function (a) {
          var now = swapWord(raw, gone, a[0]);
          if (now === raw) { return TXT.ask_stale; }
          return askWrite([{ at: line, cut: 1, put: [now] }], line, true);
        } }] };
    }

    if (why === "r_empty_expr") {
      var bare = raw.replace(/\s+$/, "");
      return { rows: [{
        says: TXT.ask_here,
        fields: [{ kind: "code", hint: /^\s*(if|while|until|else\s*if|loop)\b/i.test(bare) ? "count > 0" : "0" }],
        put: function (a) {
          var then = /^(.*?)\s+(then|do)$/i.exec(bare);
          var now = then && /\b(if|while|elseif)\b/i.test(then[1])
                  ? then[1] + " " + a[0] + " " + then[2] : bare + " " + a[0];
          return askWrite([{ at: line, cut: 1, put: [now] }], line, true);
        } }] };
    }

    return askRewrite(line, true);
  }

  // Anything else: the line itself, to be written again -- as it is now,
  // ready to change, rather than a blank to start over in.
  function askRewrite(line, rerun) {
    var lines = askLines();
    var raw = lines[line - 1];
    if (raw === undefined || !raw.trim()) { return null; }
    var lead = leadOf(raw);
    return { rows: [{
      says: say("ask_line", { line: line }),
      fields: [{ kind: "line", value: raw.trim() }],
      put: function (a) {
        if (a[0] === raw.trim()) { return TXT.ask_same; }
        return askWrite([{ at: line, cut: 1, put: [lead + a[0]] }], line, rerun);
      } }] };
  }

  // ---- what to ask, for a warning the reading gave -----------------------
  // The reading says what it needs (parse/read.py): a Do's test, or the
  // line an If with nothing set in under it stops after.
  function askForProblem(fix) {
    if (!fix || fix.how !== "ask") { return null; }
    var lines = askLines();
    var opener = lines[(fix.like || 0) - 1];
    if (opener === undefined) { return null; }
    var lead = leadOf(opener);
    if (fix.ask === "until" && fix.at) {
      var word = /^\s*repeat\b/i.test(opener) ? "Until " : "Loop Until ";
      return { rows: [{
        says: TXT.ask_until, fields: [{ kind: "code", hint: 'answer = "no"' }],
        put: function (a) {
          return askWrite([{ at: fix.at, cut: fix.swap ? 1 : 0, put: [lead + word + a[0]] }], fix.at, false);
        } }] };
    }
    if (fix.ask === "close" && fix.text) {
      var last = lines.length;
      return { rows: [{
        says: say("ask_close", { text: fix.text }),
        fields: [{ kind: "number", hint: String(Math.min(last, fix.like + 1)), min: fix.like, max: last }],
        put: function (a) {
          // the lines it now holds set in under it, and its End after them
          var upto = Number(a[0]);
          var held = lines.slice(fix.like, upto).map(function (l) { return l.trim() ? lead + "    " + l.replace(/^[ \t]+/, "") : l; });
          return askWrite([{ at: fix.like + 1, cut: upto - fix.like, put: held.concat([lead + fix.text]) }],
                          fix.like, false);
        } }] };
    }
    return null;
  }

  // ---- hung on the warnings ----------------------------------------------
  // Under a fault on the tape (16-wrong.js) and under a warning under Build
  // (09-build.js).  Nothing where fixes are off.
  function offerAsk(box, err, mended) {
    if (mendsOff() || !el("#code")) { return null; }
    var ask = askForFault(err, mended);
    if (!ask || (!ask.rows.length && !(ask.also || []).length)) { return null; }
    var made = askBox(ask);
    box.appendChild(made);
    return made;
  }

  function offerAskProblem(box, fix) {
    if (mendsOff() || !el("#code")) { return null; }
    var ask = askForProblem(fix);
    if (!ask) { return null; }
    var made = askBox(ask);
    box.appendChild(made);
    return made;
  }
