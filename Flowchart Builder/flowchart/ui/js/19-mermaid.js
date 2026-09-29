// ---------------------------------------------------------------------------
//  19-mermaid.js -- the chart as Mermaid, and Mermaid as a drawing
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ======================================================= out as Mermaid ==
  // Mermaid is how a flowchart is written into a README on GitHub, a page in
  // Notion or GitLab, or a Markdown slide: a few lines of text that the page
  // it is pasted into draws.  So the chart goes out as those lines -- written
  // from the program it was built from, or from the shapes and arrows of a
  // drawing by hand -- to be copied, or saved as a .mmd.  The layout is
  // Mermaid's own; what goes out is which step leads to which, and what each
  // step and each answer says.

  // Words, the way Mermaid wants them inside a shape or on an arrow: in
  // quotes, with a quote mark, a bar and a line break said as it says them.
  function mermaidWords(s) {
    return '"' + String(s === undefined ? "" : s)
      .replace(/"/g, "#quot;").replace(/\|/g, "#124;").replace(/\n/g, "<br>") + '"';
  }

  // The shape each kind of step is drawn as there: a stadium for Start and
  // End, a slanted box for asking and telling, a rhombus for a question, a
  // hexagon for For Each, a boxed box for a call.
  var MERMAID_SHAPE = {
    oval: ["([", "])"], io: ["[/", "/]"], rect: ["[", "]"], diamond: ["{", "}"],
    sub: ["[[", "]]"], hex: ["{{", "}}"], circle: ["((", "))"], round: ["(", ")"],
    store: ["[(", ")]"], back: ["[\\", "\\]"]
  };

  function mermaidOf(ast) {
    var rows = ["flowchart TD"], made = 0, deep = "    ";
    var yes = decideNow() === "yn" ? TXT.yes_plain : TXT.yes;
    var no = decideNow() === "yn" ? TXT.no_plain : TXT.no;
    function shape(kind, words, id) {
      var s = MERMAID_SHAPE[kind] || MERMAID_SHAPE.rect;
      id = id || "n" + (++made);
      rows.push(deep + id + s[0] + mermaidWords(words) + s[1]);
      return id;
    }
    function reserve() { return "n" + (++made); }
    function arrow(from, to, word) {
      rows.push(deep + from + (word ? " -->|" + mermaidWords(word) + "| " : " --> ") + to);
    }
    // `ins`: the ways arriving at what comes next, as [shape, word]
    function into(ins, to) { ins.forEach(function (w) { arrow(w[0], to, w[1]); }); }
    // the ways out of the loops being written, by an Exit, innermost last:
    // they go on to whatever follows that loop
    var breaks = [];
    function looped(body, ins) {
      breaks.push([]);
      var back = run(body, ins);
      return { back: back, left: breaks.pop() };
    }
    var PLAIN = { declare: "rect", set: "rect", wait: "rect", other: "rect",
                  display: "io", input: "io", call: "sub" };
    // A run of statements; what arrives is `ins`, what leaves is returned.
    function run(items, ins) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (PLAIN[it.op]) {
          // one box of several lines -- Declares, a run of Displays -- is
          // one step, as it is on the chart
          var said = [it.text];
          while (i + 1 < items.length && items[i + 1].id === it.id && it.id && PLAIN[items[i + 1].op]) {
            said.push(items[++i].text);
          }
          var box = shape(PLAIN[it.op], said.join("\n"));
          into(ins, box);
          ins = [[box, ""]];
          continue;
        }
        switch (it.op) {
          case "start":
            var s0 = shape("oval", it.text || TXT.start);
            into(ins, s0);
            ins = [[s0, ""]];
            break;
          case "exit":
            if (breaks.length) { breaks[breaks.length - 1] = breaks[breaks.length - 1].concat(ins); }
            return [];
          case "end": case "return":
            into(ins, shape("oval", it.op === "end" ? (it.text || TXT.end) : it.text));
            return [];
          case "if":
            var d = shape("diamond", it.cond);
            into(ins, d);
            var then = run(it.then || [], [[d, yes]]);
            var other = (it["else"] || []).length ? run(it["else"], [[d, no]]) : [[d, no]];
            ins = then.concat(other);
            break;
          case "while":
            var w = shape("diamond", it.cond);
            into(ins, w);
            var wl = looped(it.body || [], [[w, it.until ? no : yes]]);
            into(wl.back, w);
            ins = [[w, it.until ? yes : no]].concat(wl.left);
            break;
          case "dowhile":
            // the test at the foot, and the way back up to the top of the body
            var t = reserve();
            var dl = looped(it.body || [], ins.concat([[t, it.until ? no : yes]]));
            shape("diamond", it.cond, t);
            into(dl.back, t);
            ins = [[t, it.until ? yes : no]].concat(dl.left);
            break;
          case "for":
            if (it.init) {
              var start = shape("rect", it.init);
              into(ins, start);
              ins = [[start, ""]];
            }
            var test = shape("diamond", it.cond || "True");
            into(ins, test);
            var fl = looped(it.body || [], [[test, yes]]), back = fl.back;
            if (it.step) {
              var bump = shape("rect", it.step);
              into(back, bump);
              back = [[bump, ""]];
            }
            into(back, test);
            ins = [[test, no]].concat(fl.left);
            break;
          case "foreach":
            var each = shape("hex", it.text);
            into(ins, each);
            var el2 = looped(it.body || [], [[each, ""]]);
            into(el2.back, each);
            ins = [[each, ""]].concat(el2.left);
            break;
          case "select":
            var pick = shape("diamond", it.expr);
            into(ins, pick);
            var out = [], other2 = false;
            (it.cases || []).forEach(function (c) {
              var word = /^(default|case else|else)$/i.test(String(c.match || "").trim())
                         ? "Else" : c.match;
              if (word !== c.match) { other2 = true; }
              out = out.concat(run(c.body || [], [[pick, word]]));
            });
            if (!other2) { out.push([pick, ""]); }
            ins = out;
            break;
          default:
            var box2 = shape("rect", it.text);
            into(ins, box2);
            ins = [[box2, ""]];
        }
      }
      return ins;
    }
    run(ast.main || [], []);
    (ast.modules || []).forEach(function (mod, k) {
      rows.push("    subgraph m" + (k + 1) + " [" + mermaidWords(mod.name + "(" + (mod.params || "") + ")") + "]");
      deep = "        ";
      run(mod.body || [], []);
      deep = "    ";
      rows.push("    end");
    });
    return rows.join("\n") + "\n";
  }

  // A drawing by hand, shape for shape and arrow for arrow.
  function mermaidOfHand() {
    var rows = ["flowchart TD"];
    hand.nodes.forEach(function (n) {
      var kind = asksKind(n.kind) ? "diamond" : endsKind(n.kind) ? "oval"
               : /^(io|io_back)$/.test(n.kind) ? "io" : n.kind === "sub" ? "sub"
               : n.kind === "hex" ? "hex" : n.kind === "circle" ? "circle"
               : /^(store|stored)$/.test(n.kind) ? "store" : "rect";
      var s = MERMAID_SHAPE[kind];
      rows.push("    h" + n.id + s[0] + mermaidWords(saidIn(n)) + s[1]);
    });
    hand.links.forEach(function (l) {
      rows.push("    h" + l.from + (l.label ? " -->|" + mermaidWords(l.label) + "| " : " --> ") + "h" + l.to);
    });
    return rows.join("\n") + "\n";
  }

  function showMermaid() {
    var text;
    if (byHand) {
      if (!hand.nodes.length) { handSays(TXT.h_tidy_none, true); return; }
      text = mermaidOfHand();
    } else {
      if (!AST) { talkOnce(TXT.r_nothing, "warn"); return; }
      text = mermaidOf(AST);
    }
    codePage(text, TXT.mm_head, [saveButton(text, chartFileName(), "mmd")]);
    if (el("#tape-lang")) { el("#tape-lang").hidden = true; }
  }

  if (el("#mm-open")) {
    el("#mm-open").onclick = function (ev) {
      ev.stopPropagation();
      shutSheets();
      showMermaid();
    };
  }

  // ====================================================== in from Mermaid ==
  // And the other way: a flowchart written in Mermaid -- opened as a .mmd,
  // or pasted into the pseudocode box -- becomes a drawing by hand, every
  // shape the kind its brackets say and every arrow with its words, laid
  // out the way Tidy up lays a drawing out.  Mermaid's own layout is not
  // written in it, so there is nothing to keep.
  var R_MERMAID = /^\s*(?:%%[^\n]*\n\s*)*(?:flowchart|graph)(?:\s+(?:TD|TB|BT|LR|RL))?\s*(?:;|\n|$)/i;

  function isMermaid(text) { return R_MERMAID.test(String(text || "")); }

  // A shape's brackets, the longest first, and the kind each is drawn as here.
  var MERMAID_KINDS = [
    ["(((", ")))", "circle"], ["([", "])", "oval"], ["[[", "]]", "sub"], ["[(", ")]", "store"],
    ["((", "))", "circle"], ["{{", "}}", "hex"], ["[/", "\\]", "trap"], ["[\\", "/]", "trap"],
    ["[/", "/]", "io"], ["[\\", "\\]", "io_back"], ["{", "}", "diamond"], [">", "]", "card"],
    ["(", ")", "roundrect"], ["[", "]", "rect"]
  ];

  // The words inside a shape or on an arrow, as they are to be read.
  function mermaidSaid(s) {
    s = String(s || "").trim();
    if (/^".*"$/.test(s)) { s = s.slice(1, -1); }
    return s.replace(/<br\s*\/?>/gi, " ").replace(/#quot;/g, '"').replace(/#124;/g, "|")
            .replace(/#(\d+);/g, function (m, n) { return String.fromCharCode(+n); })
            .replace(/\s+/g, " ").trim();
  }

  // One line of it -- a chain of shapes joined by arrows, a & b --> c --
  // read into shapes and arrows.  `at` walks along the line.
  function mermaidLine(line, found, links) {
    var at = 0;
    function space() { while (at < line.length && /\s/.test(line[at])) { at++; } }
    function shapes() {                  // one shape, or several joined by &
      var got = [];
      while (true) {
        space();
        var m = /^[A-Za-z0-9_]\w*/.exec(line.slice(at));
        if (!m) { return got; }
        var id = m[0];
        at += id.length;
        var text = null, kind = null;
        for (var k = 0; k < MERMAID_KINDS.length; k++) {
          var open = MERMAID_KINDS[k][0], shut = MERMAID_KINDS[k][1];
          if (line.substr(at, open.length) !== open) { continue; }
          var from = at + open.length, end = -1;
          if (line[from] === '"') {        // quoted: the close is after the quote
            var q = line.indexOf('"', from + 1);
            end = q < 0 ? -1 : line.indexOf(shut, q + 1);
          } else {
            end = line.indexOf(shut, from);
          }
          if (end < 0) { continue; }
          text = line.slice(from, end);
          kind = MERMAID_KINDS[k][2];
          at = end + shut.length;
          break;
        }
        var one = found[id];
        if (!one) { one = found[id] = { name: id, kind: "rect", text: id, order: Object.keys(found).length }; }
        if (kind) { one.kind = kind; one.text = mermaidSaid(text); }
        got.push(one);
        space();
        if (line[at] === "&") { at++; continue; }
        return got;
      }
    }
    // An arrow, and the words on it: -->, ---, ==>, -.->, --o, --x, with the
    // words in bars after it (-->|yes|) or in the middle of it (-- yes -->).
    function arrowAt() {
      space();
      var rest = line.slice(at);
      // the words in the middle of it: -- yes -->, == yes ==>, -. yes .->
      var m = /^(--|==|-\.)\s*([^\s>|-][^>|]*?)\s*(-{2,}>|={2,}>|\.->|-{2,}-|={2,}=|\.-)/.exec(rest);
      if (m) {
        at += m[0].length;
        return { word: mermaidSaid(m[2]) };
      }
      m = /^<?(?:-{2,}|={2,}|-\.+-|~~~)[->ox]?/.exec(rest);
      if (!m) { return null; }
      at += m[0].length;
      space();
      var word = "";
      if (line[at] === "|") {          // ... or in bars after it: -->|yes|
        var shut = line.indexOf("|", at + 1);
        if (shut > at) { word = line.slice(at + 1, shut); at = shut + 1; }
      }
      return { word: mermaidSaid(word) };
    }
    var left = shapes();
    if (!left.length) { return; }
    while (at < line.length) {
      var arrow = arrowAt();
      if (!arrow) { return; }
      var right = shapes();
      if (!right.length) { return; }
      left.forEach(function (a) {
        right.forEach(function (b) { links.push({ from: a, to: b, label: arrow.word }); });
      });
      left = right;
    }
  }

  function mermaidDrawing(text) {
    if (!isMermaid(text)) { return null; }
    var found = {}, joins = [];
    String(text).replace(/\r\n?/g, "\n").split(/\n|;(?=(?:[^"]*"[^"]*")*[^"]*$)/).forEach(function (raw, k) {
      var line = raw.replace(/%%.*$/, "").trim();
      if (!line || !k && /^(flowchart|graph)\b/i.test(line)) { return; }
      if (/^(flowchart|graph|subgraph|end|direction|classDef|class|style|linkStyle|click)\b/i.test(line)) { return; }
      mermaidLine(line, found, joins);
    });
    var names = Object.keys(found);
    if (!names.length) { return null; }
    // Placed a row to each step away from where the flow begins, which
    // Tidy up then puts right; this only has to be somewhere sensible.
    var into = {}, depth = {}, queue = [];
    joins.forEach(function (j) { into[j.to.name] = (into[j.to.name] || 0) + 1; });
    names.forEach(function (n) { if (!into[n]) { depth[n] = 0; queue.push(n); } });
    if (!queue.length) { depth[names[0]] = 0; queue.push(names[0]); }
    while (queue.length) {
      var n0 = queue.shift();
      joins.forEach(function (j) {
        if (j.from.name === n0 && depth[j.to.name] === undefined) {
          depth[j.to.name] = depth[n0] + 1;
          queue.push(j.to.name);
        }
      });
    }
    var across = {}, made = { nodes: [], links: [], next: 1, nextLink: 0 }, ids = {};
    names.sort(function (a, b) { return found[a].order - found[b].order; });
    names.forEach(function (n) {
      var d = depth[n] === undefined ? 0 : depth[n];
      var col = across[d] = (across[d] || 0) + 1;
      var one = found[n];
      var node = { id: made.next++, kind: one.kind, text: one.text,
                   x: 120 + (col - 1) * 240, y: 80 + d * 120 };
      ids[n] = node.id;
      made.nodes.push(node);
    });
    joins.forEach(function (j) {
      made.links.push({ id: ++made.nextLink, from: ids[j.from.name], to: ids[j.to.name],
                        label: j.label || "" });
    });
    return made;
  }

  // A drawing made from it, in place of the one there was: sized to its
  // words, and laid out the way Tidy up lays one out.
  function openMermaid(name, text) {
    var made = mermaidDrawing(text);
    if (!made) { return false; }
    made.nodes.forEach(function (n) { measure(n); });
    hand = made;
    picked = chosen = null;
    many = [];
    forgetUndo();
    setMode(true);
    drawHand();
    drawHandPanel();
    tidyUp(tidyHowKept());
    if (name) { fileSays(say("f_opened", { name: name })); }
    return true;
  }
