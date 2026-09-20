// ---------------------------------------------------------------------------
//  12-check.js -- does the design work, and what does it say?
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ---- does it actually work? -------------------------------------------
  function checkDesign() {
    var found = [];
    function fault(key, node, fill) {
      found.push({ text: say(key, fill || {}), id: node ? node.id : null });
    }
    if (!hand.nodes.length) { return found; }

    var heads = hand.nodes.filter(function (n) { return !intoOf(n.id).length; });
    if (!heads.length) { fault("p_no_start", null); }
    else if (heads.length > 1) { fault("p_many_starts", null, { n: heads.length }); }
    else if (heads[0].kind !== "oval") { fault("p_start_kind", heads[0]); }

    var ends = hand.nodes.filter(function (n) {
      return n.kind === "oval" && !outOf(n.id).length;
    });
    if (!ends.length) { fault("p_no_end", null); }

    hand.nodes.forEach(function (n) {
      var outs = outOf(n.id), ins = intoOf(n.id);
      if (!String(n.text || "").trim()) { fault("p_empty", n); }
      if (!outs.length && !ins.length) { fault("p_alone", n); }
      else if (!outs.length && n.kind !== "oval") { fault("p_dead_end", n); }
      if (n.kind === "diamond" && outs.length !== 2) {
        fault("p_decision_out", n, { n: outs.length });
      }
      if (n.kind !== "diamond" && outs.length > 1) {
        fault("p_one_out", n, { n: outs.length });
      }
      if (n.kind === "diamond" && outs.length === 2) {
        var one = (outs[0].label || "").trim(), two = (outs[1].label || "").trim();
        if (!one || !two) { fault("p_no_label", n); }
        else if (one.toLowerCase() === two.toLowerCase()) { fault("p_same_labels", n); }
      }
      hand.nodes.forEach(function (m) {
        if (m.id <= n.id) { return; }
        if (Math.abs(m.x - n.x) * 2 < m.w + n.w - 8 &&
            Math.abs(m.y - n.y) * 2 < m.h + n.h - 8) {
          fault("p_overlap", n);
        }
      });
    });

    // a line that runs through a shape on its way past is not wrong, but it
    // is the thing that makes a hand-drawn chart hard to follow
    hand.links.forEach(function (link) {
      var a = nodeById(link.from), b = nodeById(link.to);
      if (!a || !b) { return; }
      var pts = linkPath(a, b);
      hand.nodes.forEach(function (n) {
        if (n.id === a.id || n.id === b.id) { return; }
        for (var i = 0; i < pts.length - 1; i++) {
          if (throughBox(pts[i], pts[i + 1], n)) { fault("p_line_through", n); return; }
        }
      });
    });

    // everything has to be reachable from the start...
    if (heads.length === 1) {
      var seen = {}, stack = [heads[0].id];
      while (stack.length) {
        var id = stack.pop();
        if (seen[id]) { continue; }
        seen[id] = true;
        outOf(id).forEach(function (l) { stack.push(l.to); });
      }
      hand.nodes.forEach(function (n) {
        if (!seen[n.id]) { fault("p_unreached", n); }
      });
    }
    // ...and from everything, an End has to be reachable, or the flow is
    // caught in a loop it can never leave
    if (ends.length) {
      var safe = {};
      ends.forEach(function (n) { safe[n.id] = true; });
      var moved = true;
      while (moved) {
        moved = false;
        hand.links.forEach(function (l) {
          if (safe[l.to] && !safe[l.from]) { safe[l.from] = true; moved = true; }
        });
      }
      hand.nodes.forEach(function (n) {
        if (!safe[n.id] && outOf(n.id).length) { fault("p_trapped", n); }
      });
    }
    return found;
  }

  function throughBox(p, q, n) {         // does this leg cross that shape?
    var l = n.x - n.w / 2 + 4, r = n.x + n.w / 2 - 4;
    var t = n.y - n.h / 2 + 4, b = n.y + n.h / 2 - 4;
    if (Math.abs(p[0] - q[0]) < 0.5) {
      return p[0] > l && p[0] < r &&
             Math.min(p[1], q[1]) < b && Math.max(p[1], q[1]) > t;
    }
    if (Math.abs(p[1] - q[1]) < 0.5) {
      return p[1] > t && p[1] < b &&
             Math.min(p[0], q[0]) < r && Math.max(p[0], q[0]) > l;
    }
    return false;
  }

  function showReport() {
    var box = el("#report");
    var found = checkDesign();
    box.innerHTML = "";
    if (!hand.nodes.length) { return; }
    if (!found.length) {
      box.innerHTML = '<p class="good">' + TXT.checked_good + "</p>";
      return;
    }
    var head = document.createElement("p");
    head.className = "hint bad";
    head.textContent = say("problems", { n: found.length });
    box.appendChild(head);
    found.forEach(function (bit) {
      var row = document.createElement("button");
      row.className = "fault";
      row.textContent = bit.text;
      row.onclick = function () {
        if (bit.id) { picked = bit.id; drawHand(); drawHandPanel(); }
      };
      box.appendChild(row);
    });
  }

  // ---- the design, written out as a program -----------------------------
  // A chart that passes the check above is a well-formed flowchart: one way
  // in, an End reachable from everywhere, every diamond with two ways out
  // and both of them labelled.  That is enough to write the thing out as
  // pseudocode -- and once it is pseudocode the rest of the studio already
  // knows what to do with it.  The same reader parses it, the same runner
  // walks it, the same writer turns it into Python or Java.  There is one
  // of each here, not one for each way of drawing.
  //
  // What cannot be written out is a chart whose loops cross each other:
  // pseudocode has no way of saying "jump into the middle of that", and
  // guessing would produce a program that is not the chart.  Those are
  // refused by name rather than mangled.
  var R_YES = /^(y|yes|true|t)$/i;
  var R_NO = /^(n|no|false|f)$/i;

  function canReach(fromId, wantId) {    // is wantId anywhere ahead of here?
    var seen = {}, stack = [fromId];
    while (stack.length) {
      var id = stack.pop();
      if (id === wantId) { return true; }
      if (seen[id]) { continue; }
      seen[id] = true;
      outOf(id).forEach(function (l) { stack.push(l.to); });
    }
    return false;
  }

  // Where two branches come together again -- the nearest shape both of
  // them reach.  Breadth first, so "nearest" means what it says.
  function meetAgain(aId, bId) {
    var ahead = {}, stack = [aId];
    while (stack.length) {
      var id = stack.pop();
      if (ahead[id]) { continue; }
      ahead[id] = true;
      outOf(id).forEach(function (l) { stack.push(l.to); });
    }
    var seen = {}, queue = [bId];
    while (queue.length) {
      var at = queue.shift();
      if (seen[at]) { continue; }
      seen[at] = true;
      if (ahead[at]) { return at; }
      outOf(at).forEach(function (l) { queue.push(l.to); });
    }
    return null;
  }

  function saidIn(node) {                // the words in a shape, tidied
    return String(node.text || "").replace(/\s+/g, " ").trim();
  }

  // The two ways out of a diamond, the true one first.
  function bothWays(id) {
    var outs = outOf(id);
    var yes = outs[0], no = outs[1];
    if (R_NO.test((yes.label || "").trim()) ||
        R_YES.test((no.label || "").trim())) {
      var swap = yes; yes = no; no = swap;
    }
    return [yes, no];
  }

  // Which shape each line of the writing came from.  Filled in as the
  // writing is made, because it cannot be worked out afterwards: several
  // shapes can say the same words, and half the lines -- End If, Else, End
  // While -- came from no shape at all.  Tidy up reads it to find its way
  // back from a laid-out chart to the shapes on the paper.
  var handLine = {};                     // line of pseudocode -> shape number

  function handAsPseudocode() {
    var head = hand.nodes.filter(function (n) { return !intoOf(n.id).length; })[0];
    if (!head) { throw new Error(TXT.h_no_start); }
    var out = [], been = {};
    handLine = {};

    function put(words, id) {
      out.push(words);
      if (id) { handLine[out.length] = id; }
    }

    put("Start", head.id);

    function step(deep) { return new Array(deep + 1).join("    "); }

    function write(id, stopId, deep) {
      while (id && id !== stopId) {
        been[id] = (been[id] || 0) + 1;
        if (been[id] > 3) { throw new Error(TXT.h_tangled); }
        var node = nodeById(id);
        if (!node) { return; }
        var outs = outOf(id);
        if (!outs.length) {              // an End, and the flow stops here
          put(step(deep) + "End", node.id);
          return;
        }
        if (node.kind === "diamond") {
          var ways = bothWays(id), yes = ways[0], no = ways[1];
          var asked = saidIn(node);
          var yesBack = canReach(yes.to, id), noBack = canReach(no.to, id);
          if (yesBack && noBack) { throw new Error(TXT.h_tangled); }
          if (yesBack || noBack) {       // a question you come back to: a loop
            var body = yesBack ? yes : no, on = yesBack ? no : yes;
            put(step(deep) +
                (yesBack ? "While " + asked
                         : "While NOT (" + asked + ")"), node.id);
            write(body.to, id, deep + 1);
            put(step(deep) + "End While");
            id = on.to;
            continue;
          }
          var join = meetAgain(yes.to, no.to);
          put(step(deep) + "If " + asked + " Then", node.id);
          write(yes.to, join, deep + 1);
          if (no.to !== join) {
            put(step(deep) + "Else");
            write(no.to, join, deep + 1);
          }
          put(step(deep) + "End If");
          if (!join) { return; }         // both ways ended on their own
          id = join;
          continue;
        }
        if (id !== head.id) {            // the first oval is the Start above
          var words = saidIn(node);
          if (words) { put(step(deep) + words, node.id); }
        }
        id = outs[0].to;
      }
    }

    write(head.id, null, 0);
    if (out[out.length - 1] !== "End") { put("End"); }
    return out.join("\n");
  }

  // Reading the design as a program, and holding on to it.  Pressing Check
  // is what asks for this: a design that passes is worth running, and one
  // that does not is not worth pretending about.
  var handWas = null;                    // the design the program was read from

  function handSays(what, bad) {
    var box = el("#report");
    if (!box) { return; }
    var line = document.createElement("p");
    line.className = bad ? "hint bad" : "good";
    line.textContent = what;
    box.appendChild(line);
  }

  function readyHandProgram() {
    if (!byHand) { return; }
    forgetProgram();
    handWas = null;
    if (!hand.nodes.length || checkDesign().length) { return; }
    var text;
    try { text = handAsPseudocode(); }
    catch (thrown) { handSays(thrown.message || String(thrown), true); return; }
    var mine = JSON.stringify(hand);
    askFor({ text: text, title: el("#f-title") ? el("#f-title").value : "",
             author: "", shape: "auto", seed: "",
             lang: el("#f-lang") ? el("#f-lang").value : "",
             legend: false, grid: true, shapes: geom })
      .then(function (data) {
        if (!byHand || JSON.stringify(hand) !== mine) { return; }
        if (!data.ok || !data.ast || !(data.ast.main || []).length) {
          handSays(data.error || TXT.h_not_a_program, true);
          return;
        }
        AST = data.ast;
        forgetLines();
        handWas = mine;
        dressRunner();
        handSays(TXT.h_runnable);
      })
      .catch(function (err) {
        handSays(String(err && err.message ? err.message : err), true);
      });
  }

  // A design that has been changed since it was read is not that program
  // any more, so the runner lets go of it until Check is pressed again.
  function handChanged() {
    if (!byHand || !handWas) { return; }
    if (JSON.stringify(hand) !== handWas) { forgetProgram(); handWas = null; }
  }

  // ---- tidying a drawing up ----------------------------------------------
  // The best thing this package owns is the way it lays a chart out: nothing
  // overlapping, no arrow doubling back on itself, every shape on the
  // ruling, branches given columns of their own.  There are tests for all
  // three.  A chart drawn by hand could reach none of it -- you moved every
  // shape yourself and it looked like it.
  //
  // It can reach it now, because the drawing can be written out as
  // pseudocode: the writing goes to the very same drawing code the
  // pseudocode side uses, the chart that comes back says where each shape
  // wants to be, and those places are handed to the shapes on the paper.
  // The shapes themselves do not change -- their words, their colors, their
  // kind and the arrows between them are all left exactly as they are.
  // Only where they stand changes, which is the whole of what is being
  // asked for.
  var TIDY_GAP = 26;                     // the least room between two shapes
  // And more again where the arrow between two of them carries a word.
  // True and False are written along the line that carries them, so two
  // shapes parted by exactly the length of the arrow leave the word lying
  // over one of them -- which is how False came to be written across the
  // front of the box it was pointing at.
  var TIDY_WORD = 46;
  var TIDY_STRETCH = 3;                  // and the most it may pull them apart

  // The line each statement of the built program came from, by its number
  // in the chart -- which is the same number the drawn shapes carry.
  function linesById(ast) {
    var found = {};
    function walk(items) {
      (items || []).forEach(function (item) {
        if (item.id && item.line) { found[item.id] = item.line; }
        ["then", "else", "body"].forEach(function (key) {
          if (item[key]) { walk(item[key]); }
        });
        (item.cases || []).forEach(function (one) { walk(one.body); });
      });
    }
    walk(ast.main);
    (ast.modules || []).forEach(function (mod) { walk(mod.body); });
    return found;
  }

  // Where each shape of a drawn chart stands, measured off the drawing
  // itself rather than read out of its attributes: a shape is a rectangle
  // in one chart and a six-sided thing in the next, and the browser knows
  // the size of both.  It has to be on the page to be measured, so it is
  // put somewhere nobody is looking and taken away again.
  function spotsIn(svgText) {
    var hidden = document.createElement("div");
    hidden.style.cssText = "position:fixed; left:-99999px; top:0;" +
                           " width:1px; height:1px; overflow:hidden";
    hidden.innerHTML = svgText;
    document.body.appendChild(hidden);
    var found = {};
    try {
      all(".node", hidden).forEach(function (g) {
        var box = g.getBBox();
        if (!box.width && !box.height) { return; }
        found[g.dataset.i] = { x: box.x + box.width / 2,
                               y: box.y + box.height / 2 };
      });
    } catch (e) { found = {}; }          // an SVG the browser would not measure
    hidden.remove();
    return found;
  }

  // The shapes on the paper are drawn a good deal bigger than the ones in a
  // built chart -- a box is 170 by 58 here and 140 by 40 there -- so the
  // places that came back can be too close together to put these in.  Every
  // pair that would sit on top of another says how much further apart it
  // needs to be; the worst of them stretches the whole arrangement by that
  // much, which keeps every row and every column exactly as the drawing
  // code arranged them.  Stretching one pair on its own would not.
  function wordBetween(a, b) {           // is the arrow between them labelled?
    return hand.links.some(function (l) {
      return String(l.label || "").trim() &&
             ((l.from === a && l.to === b) || (l.from === b && l.to === a));
    });
  }

  function tidyStretch(places) {
    var ids = Object.keys(places), worst = 1;
    for (var i = 0; i < ids.length; i++) {
      for (var j = i + 1; j < ids.length; j++) {
        var a = places[ids[i]], b = places[ids[j]];
        var word = wordBetween(a.node.id, b.node.id) ? TIDY_WORD : 0;
        var needX = (a.node.w + b.node.w) / 2 + TIDY_GAP + word;
        var needY = (a.node.h + b.node.h) / 2 + TIDY_GAP;
        var gotX = Math.abs(a.x - b.x), gotY = Math.abs(a.y - b.y);
        if (gotX >= needX || gotY >= needY) { continue; }
        // Apart on whichever axis is the cheaper of the two: two shapes
        // side by side want the columns widened, not the rows.
        var by = Math.min(gotX > 0.5 ? needX / gotX : Infinity,
                          gotY > 0.5 ? needY / gotY : Infinity);
        if (by > worst) { worst = by; }
      }
    }
    return Math.min(worst, TIDY_STRETCH);
  }

  function tidySays(what, bad) {
    handSays(what, bad);
  }

  var tidying = false;
  function tidyUp() {
    if (!byHand || tidying) { return; }
    if (!hand.nodes.length) { tidySays(TXT.h_tidy_none, true); return; }
    var text;
    try { text = handAsPseudocode(); }
    catch (thrown) { tidySays(thrown.message || String(thrown), true); return; }
    var fromLine = {};                   // line -> shape, as it was written
    Object.keys(handLine).forEach(function (at) { fromLine[at] = handLine[at]; });
    var button = el("#hand-tidy");
    tidying = true;
    if (button) { button.disabled = true; button.classList.add("working"); }
    function done() {
      tidying = false;
      if (button) { button.disabled = false; button.classList.remove("working"); }
    }
    // Drawn by the same code the pseudocode side draws with, and asked for
    // the same way -- so a chart tidied here stands where the very same
    // chart built from writing would stand.
    askFor({ text: text, title: "", author: "", shape: "auto", seed: "",
             lang: el("#f-lang") ? el("#f-lang").value : "",
             legend: false, grid: true, shapes: geom })
      .then(function (data) {
        done();
        if (!byHand) { return; }
        if (!data || !data.ok || !data.ast || !data.svg) {
          tidySays((data && data.error) || TXT.h_not_a_program, true);
          return;
        }
        var lineOfShape = linesById(data.ast);
        var spots = spotsIn(data.svg);
        var places = {};
        Object.keys(spots).forEach(function (drawn) {
          var line = lineOfShape[drawn];
          var mine = line && fromLine[line];
          var node = mine && nodeById(+mine);
          // The first place a shape is named wins.  A shape a flow comes
          // back to is written out more than once -- the line before a
          // loop's End While is the same shape as the one after it -- and
          // it can only stand in one of the places that came back.
          if (node && !places[node.id]) {
            places[node.id] = { x: spots[drawn].x, y: spots[drawn].y, node: node };
          }
        });
        var moving = Object.keys(places);
        if (!moving.length) { tidySays(TXT.h_tidy_none, true); return; }
        var by = tidyStretch(places);
        // Kept where it already is on the paper, near enough: a tidy up
        // that also threw the whole chart into a corner would be two
        // things happening at once, and only one of them was asked for.
        var least = { x: Infinity, y: Infinity };
        moving.forEach(function (id) {
          least.x = Math.min(least.x, places[id].x * by - places[id].node.w / 2);
          least.y = Math.min(least.y, places[id].y * by - places[id].node.h / 2);
        });
        var was = { x: Infinity, y: Infinity };
        moving.forEach(function (id) {
          var n = places[id].node;
          was.x = Math.min(was.x, n.x - n.w / 2);
          was.y = Math.min(was.y, n.y - n.h / 2);
        });
        keepUndo();
        moving.forEach(function (id) {
          var spot = places[id], node = spot.node;
          node.x = Math.round((spot.x * by - least.x + was.x) / HAND_GRID) * HAND_GRID;
          node.y = Math.round((spot.y * by - least.y + was.y) / HAND_GRID) * HAND_GRID;
        });
        drawHand();
        drawHandPanel();
        showReport();
        el("#fit").click();              // and put the whole of it in view
        tidySays(say("h_tidied", { n: moving.length }));
      })
      .catch(function (err) {
        done();
        tidySays(String(err && err.message ? err.message : err), true);
      });
  }

  if (el("#hand-tidy")) {
    el("#hand-tidy").onclick = tidyUp;
  }
  if (el("#hand-code")) {
    el("#hand-code").onclick = showHandCode;
  }
