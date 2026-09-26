// ---------------------------------------------------------------------------
//  12-check.js -- does the design work, and what does it say?
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ---- does it actually work? -------------------------------------------
  function checkDesign() {
    var found = [];
    // `fix`, where there is one, is what would put it right (see the
    // putting-right part below).
    function fault(key, node, fill, fix) {
      found.push({ text: say(key, fill || {}), id: node ? node.id : null,
                   key: key, warn: !!ONLY_LOOKS[key], fix: fix || null });
    }
    if (!hand.nodes.length) { return found; }
    // Start and End, and a decision, are whatever the shape rules draw them
    // as as well as an oval and a diamond (endsKind, asksKind: 13-hand-rules.js).
    var endShape = { shape: kindName(ruleShape("oval")) };

    var heads = hand.nodes.filter(function (n) { return !intoOf(n.id).length; });
    if (!heads.length) { fault("p_no_start", null); }
    else if (heads.length > 1) { fault("p_many_starts", null, { n: heads.length }); }
    else if (!endsKind(heads[0].kind)) {
      fault("p_start_kind", heads[0], endShape, startAbove(heads[0]));
    }

    var ends = hand.nodes.filter(function (n) {
      return endsKind(n.kind) && !outOf(n.id).length;
    });
    var endFix = ends.length ? null : endBelow();
    if (!ends.length) { fault("p_no_end", null, endShape, endFix); }

    hand.nodes.forEach(function (n) {
      var outs = outOf(n.id), ins = intoOf(n.id), asks = asksKind(n.kind);
      if (!String(n.text || "").trim()) { fault("p_empty", n, null, fillEmpty(n)); }
      if (!outs.length && !ins.length) { fault("p_alone", n, null, arrowFrom(n)); }
      else if (!outs.length && !endsKind(n.kind)) {
        fault("p_dead_end", n, null, ends.length ? toEnd(n) : endFix);
      }
      if (asks && outs.length !== 2) {
        fault("p_decision_out", n, { n: outs.length });
      }
      if (!asks && outs.length > 1) {
        fault("p_one_out", n, { n: outs.length });
      }
      if (asks && outs.length === 2) {
        var one = (outs[0].label || "").trim(), two = (outs[1].label || "").trim();
        if (!one || !two) { fault("p_no_label", n, null, labelWays(outs)); }
        else if (one.toLowerCase() === two.toLowerCase()) {
          fault("p_same_labels", n, null, labelOther(outs));
        }
      }
      hand.nodes.forEach(function (m) {
        if (m.id <= n.id) { return; }
        if (Math.abs(m.x - n.x) * 2 < m.w + n.w - 8 &&
            Math.abs(m.y - n.y) * 2 < m.h + n.h - 8) {
          fault("p_overlap", n, null, moveApart(m));   // the later of the two
        }
      });
    });

    // a line that runs through a shape on its way past is not wrong, but it
    // is the thing that makes a hand-drawn chart hard to follow
    var routes = routeAll();              // the lines as they are drawn
    hand.links.forEach(function (link, li) {
      var a = nodeById(link.from), b = nodeById(link.to);
      var pts = routes[li];
      if (!a || !b || !pts) { return; }
      hand.nodes.forEach(function (n) {
        if (n.id === a.id || n.id === b.id) { return; }
        for (var i = 0; i < pts.length - 1; i++) {
          if (throughBox(pts[i], pts[i + 1], n)) {
            fault("p_line_through", n, null, moveOffLine(n));
            return;
          }
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
    // Red where the design does not work, amber where it only reads
    // badly, and the heading in the worse of the two it is over.
    var head = document.createElement("p");
    head.className = "hint " + (found.some(function (bit) { return !bit.warn; })
                                ? "bad" : "warn");
    head.textContent = say("problems", { n: found.length });
    box.appendChild(head);
    found.forEach(function (bit) {
      var row = document.createElement("button");
      row.className = "fault " + (bit.warn ? "warn" : "bad");
      row.textContent = bit.text;
      row.onclick = function () {
        if (bit.id) { picked = bit.id; drawHand(); drawHandPanel(); }
      };
      box.appendChild(row);
      if (bit.fix) { offerHandMend(row, box, bit.fix); }
    });
    var can = found.filter(function (bit) { return bit.fix && bit.fix.auto; });
    if (can.length > 1) {
      var every = document.createElement("button");
      every.className = "mend mend-all";
      every.type = "button";
      every.textContent = say("w_mend_all", { n: can.length });
      every.onclick = function (ev) { ev.stopPropagation(); handMendAll(); };
      box.insertBefore(every, head.nextSibling);
    }
  }

  // ---- putting it right, by hand -----------------------------------------
  // Most of what the check finds, it has already worked out the answer to.
  // A decision with no words on its ways out wants True and False (the
  // page's own words for them, as drawing an arrow gives); a flow that
  // stops dead wants an End to stop at; a shape sat on another wants moving
  // off it.  So those carry a button saying what it would do, the way the
  // warnings on the pseudocode side do (27-mend.js), and pressing it does
  // it -- one step, which Undo takes back.  Where there is more than one
  // right answer -- which of two starts is the real one, where a shape
  // nothing leads to belongs -- nothing is guessed, and the row still takes
  // you to the shape.  A few have a button that does not do the job but
  // starts it for you: the typing, or the arrow.  Those are not `auto`, and
  // putting everything right leaves them for you.
  //
  // The two that are only about how it reads are said in amber, and do not
  // stop the design being run: the program it writes out is the same with
  // a shape on top of another as without.
  var ONLY_LOOKS = { p_overlap: true, p_line_through: true };
  var CLEAR = 20;                        // room kept round a shape put right

  function isYes(word) {
    word = String(word || "").trim();
    return R_YES.test(word) || word.toLowerCase() === String(TXT.yes || "").toLowerCase();
  }
  function isNo(word) {
    word = String(word || "").trim();
    return R_NO.test(word) || word.toLowerCase() === String(TXT.no || "").toLowerCase();
  }

  // An arrow, worded the way drawing one by hand words it (see joinUp).
  function joinOn(from, to) {
    var tag = "";
    if (asksKind(from.kind)) { tag = outOf(from.id).length ? TXT.no : TXT.yes; }
    hand.links.push({ from: from.id, to: to.id, label: tag });
  }

  // Would a shape standing here be too near another?
  function crowds(node, x, y) {
    return hand.nodes.some(function (m) {
      return m !== node && Math.abs(m.x - x) * 2 < m.w + node.w + CLEAR * 2 &&
             Math.abs(m.y - y) * 2 < m.h + node.h + CLEAR * 2;
    });
  }

  // The nearest place a shape can stand clear of every other, looked for in
  // rings round where it is -- down and to the right first, the way a chart
  // is read.  `ok` can turn a place down for reasons of its own.
  function freeSpot(node, rings, ok) {
    var step = HAND_GRID * 4;
    var ways = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    for (var r = 1; r <= rings; r++) {
      for (var k = 0; k < ways.length; k++) {
        var x = node.x + ways[k][0] * r * step, y = node.y + ways[k][1] * r * step;
        if (x - node.w / 2 < 20 || y - node.h / 2 < 20) { continue; }
        if (crowds(node, x, y)) { continue; }
        if (ok && !ok(x, y)) { continue; }
        return { x: x, y: y };
      }
    }
    return null;
  }

  // A new shape, sized for its words, on the grid, and moved on down past
  // anything already standing where it would go.
  function newShape(kind, text, x, y) {
    var node = { id: hand.next++, kind: kind, text: text, x: x, y: y, w: 140, h: 46 };
    measure(node);
    node.x = Math.round(node.x / HAND_GRID) * HAND_GRID;
    node.y = Math.round(node.y / HAND_GRID) * HAND_GRID;
    for (var i = 0; i < 200 && crowds(node, node.x, node.y); i++) { node.y += HAND_GRID * 4; }
    hand.nodes.push(node);
    return node;
  }

  // The first shape is not an oval: a Start above it, joined on.  With no
  // room above, the whole drawing goes down to make some.
  function startAbove(head) {
    var id = head.id;
    return { auto: true, says: TXT.hf_start, go: function () {
      var first = nodeById(id);
      if (!first) { return; }
      var start = { id: hand.next++, kind: ruleShape("oval"), text: TXT.start, x: first.x, y: 0,
                    w: 140, h: 46 };
      measure(start);
      var y = first.y - first.h / 2 - 70;
      for (var i = 0; i < 200 && crowds(start, first.x, y); i++) { y -= HAND_GRID * 4; }
      var short = start.h / 2 + 20 - y;
      if (short > 0) {
        var by = Math.ceil(short / HAND_GRID) * HAND_GRID;
        hand.nodes.forEach(function (n) { n.y += by; });
        y += by;
      }
      start.x = Math.round(first.x / HAND_GRID) * HAND_GRID;
      start.y = Math.round(y / HAND_GRID) * HAND_GRID;
      hand.nodes.push(start);
      joinOn(start, first);
    } };
  }

  // The shapes the flow stops dead at, that are not an End.
  function deadEnds() {
    return hand.nodes.filter(function (n) {
      return !endsKind(n.kind) && !outOf(n.id).length && intoOf(n.id).length;
    });
  }

  // No End anywhere: one under the lowest of the shapes the flow stops at,
  // and every one of them joined on to it.
  function endBelow() {
    if (!deadEnds().length) { return null; }
    return { auto: true, says: TXT.hf_end, go: function () {
      var loose = deadEnds();
      if (!loose.length) { return; }
      var low = loose.reduce(function (a, b) {
        return b.y + b.h / 2 > a.y + a.h / 2 ? b : a;
      });
      var end = newShape(ruleShape("oval"), TXT.end, low.x, low.y + low.h / 2 + 70);
      loose.forEach(function (n) { joinOn(n, end); });
    } };
  }

  // A shape the flow stops dead at, with an End to go to: joined on to the
  // nearest one -- one that something already leads to, where there is.
  function toEnd(node) {
    var id = node.id;
    return { auto: true, says: TXT.hf_to_end, go: function () {
      var from = nodeById(id);
      if (!from) { return; }
      var ends = hand.nodes.filter(function (n) {
        return endsKind(n.kind) && !outOf(n.id).length && n.id !== id;
      });
      var used = ends.filter(function (n) { return intoOf(n.id).length; });
      if (used.length) { ends = used; }
      if (!ends.length) { return; }
      var near = ends.reduce(function (a, b) {
        return Math.hypot(b.x - from.x, b.y - from.y) < Math.hypot(a.x - from.x, a.y - from.y)
               ? b : a;
      });
      joinOn(from, near);
    } };
  }

  // An oval with nothing in it says Start where the flow starts and End
  // where it stops.  Anything else is yours to write, so the button only
  // opens the shape to be typed into.
  function fillEmpty(node) {
    var id = node.id;
    if (endsKind(node.kind)) {
      var word = !intoOf(id).length ? TXT.start : (!outOf(id).length ? TXT.end : "");
      if (word) {
        return { auto: true, says: say("hf_write", { word: word }), go: function () {
          var n = nodeById(id);
          if (n) { n.text = word; }        // sized to it on the redraw
        } };
      }
    }
    return { auto: false, says: TXT.hf_type, go: function () {
      picked = id; chosen = null;
      drawHand(); drawHandPanel();
      var g = el('.node[data-i="h' + id + '"]', chart);
      if (g) { typeInto(g); }
    } };
  }

  // A shape on its own: where its arrow goes is yours to say, so this only
  // starts the arrow -- press the shape it should go to next.
  function arrowFrom(node) {
    var id = node.id;
    return { auto: false, says: TXT.hf_arrow, go: function () {
      picked = id; chosen = null; joining = true; joinFrom = null;
      drawHand(); drawHandPanel();
    } };
  }

  // Words on a decision's two ways out: Yes and No, or, where one of them
  // already says one, the other.  A way out already saying something else
  // -- "over 18" -- says what the other should be no more than anybody
  // else does, so that is left alone.
  function labelWays(outs) {
    var a = String(outs[0].label || "").trim(), b = String(outs[1].label || "").trim();
    var wantA = a || (isYes(b) ? TXT.no : isNo(b) ? TXT.yes : (b ? "" : TXT.yes));
    var wantB = b || (isYes(a) ? TXT.no : isNo(a) ? TXT.yes : (a ? "" : TXT.no));
    if (!wantA || !wantB) { return null; }
    var one = outs[0], two = outs[1];
    return { auto: true,
             says: !a && !b ? say("hf_yes_no", { yes: TXT.yes, no: TXT.no })
                            : say("hf_label", { word: a ? wantB : wantA }),
             go: function () { one.label = wantA; two.label = wantB; } };
  }

  // Both ways out saying Yes, or both No: the second says the other.
  function labelOther(outs) {
    var a = String(outs[0].label || "").trim();
    var want = isYes(a) ? TXT.no : isNo(a) ? TXT.yes : "";
    if (!want) { return null; }
    var two = outs[1];
    return { auto: true, says: say("hf_relabel", { word: want }),
             go: function () { two.label = want; } };
  }

  // A shape on top of another: the later of the two, moved to the nearest
  // place clear of everything.
  function moveApart(node) {
    var id = node.id;
    return { auto: true, says: TXT.hf_apart, go: function () {
      var n = nodeById(id);
      var spot = n && freeSpot(n, 40);
      if (spot) { n.x = spot.x; n.y = spot.y; }
    } };
  }

  // How many times, all told, an arrow runs through a shape on its way past.
  function crossings() {
    var routes = routeAll(), count = 0;
    hand.links.forEach(function (link, li) {
      var pts = routes[li];
      if (!pts) { return; }
      hand.nodes.forEach(function (n) {
        if (n.id === link.from || n.id === link.to) { return; }
        for (var i = 0; i < pts.length - 1; i++) {
          if (throughBox(pts[i], pts[i + 1], n)) { count++; return; }
        }
      });
    });
    return count;
  }

  // A line through a shape: the shape, moved to the nearest clear place
  // where fewer lines run through anything than did before.  The arrows
  // find their ways again for every place tried, so it looks no further
  // than a dozen steps out.
  function moveOffLine(node) {
    var id = node.id;
    return { auto: true, says: TXT.hf_clear, go: function () {
      var n = nodeById(id);
      if (!n) { return; }
      var was = { x: n.x, y: n.y }, before = crossings();
      var spot = freeSpot(n, 12, function (x, y) {
        n.x = x; n.y = y;
        var now = crossings();
        n.x = was.x; n.y = was.y;
        return now < before;
      });
      if (spot) { n.x = spot.x; n.y = spot.y; }
    } };
  }

  // One of them, pressed: done, and the drawing and the list drawn again.
  function handMendNow(fix) {
    if (!byHand || !fix) { return; }
    if (!fix.auto) { fix.go(); return; }
    keepUndo();
    fix.go();
    drawHand(); drawHandPanel(); showReport();
  }

  function offerHandMend(row, box, fix) {
    var button = document.createElement("button");
    button.className = "mend";
    button.type = "button";
    button.textContent = fix.says;
    button.onclick = function (ev) { ev.stopPropagation(); handMendNow(fix); };
    box.appendChild(button);
    if (fix.auto) {
      row.ondblclick = function () { handMendNow(fix); };
      row.title = TXT.w_mend_tip || "";
    }
    return button;
  }

  // All of them: put right one at a time, looking again after each, since
  // one fix can settle another -- an End put in stops every shape that was
  // stopping dead -- and one step for Undo to take back.  A fix that turns
  // out to change nothing is not tried twice, and the whole of it gives up
  // after a second and a half rather than keep the page.
  function handMendAll() {
    if (!byHand) { return; }
    keepUndo();
    var tried = {}, began = Date.now();
    for (var turn = 0; turn < 60 && Date.now() - began < 1500; turn++) {
      var next = checkDesign().filter(function (bit) {
        return bit.fix && bit.fix.auto && !tried[bit.key + ":" + bit.id + ":" + bit.fix.says];
      })[0];
      if (!next) { break; }
      var was = JSON.stringify(hand);
      next.fix.go();
      if (JSON.stringify(hand) === was) { tried[next.key + ":" + next.id + ":" + next.fix.says] = true; }
    }
    drawHand(); drawHandPanel(); showReport();
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
        if (asksKind(node.kind)) {
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

  // Reading the design as a program, and holding on to it.  A design that
  // passes is worth running, and one that does not is not worth pretending
  // about.  It used to wait for Check: every change put Run out again, even
  // moving a shape, and it stayed out until Check was pressed once more.
  // Now the design is read by itself once the drawing has been still for a
  // moment (readHandSoon), and Run lights up the moment it works.  Check
  // still says so in words, and says what is in the way when it does not.
  var handWas = null;                    // the design the program was read from
  var handTried = null;                  // and the last one read unasked, however it went
  var handReading = null;                // one being read now
  var HAND_SETTLE = 400;                 // ms of stillness before it is read
  var handSoon = 0;

  // What a design says as a program: the words and kinds of its shapes and
  // the arrows between them, and not where anything stands or what color
  // it is.  Moving a shape does not change the program, so it neither puts
  // Run out nor needs reading again.  The kinds are as the shape rules see
  // them, because a rule changed can make a diamond stop asking.
  function handKey() {
    return JSON.stringify([
      el("#f-lang") ? el("#f-lang").value : "",
      hand.nodes.map(function (n) {
        return [n.id, n.kind, asksKind(n.kind), endsKind(n.kind), n.text || ""];
      }),
      hand.links.map(function (l) { return [l.from, l.to, l.label || ""]; })
    ]);
  }

  function handSays(what, bad) {
    var box = el("#report");
    if (!box) { return; }
    var line = document.createElement("p");
    line.className = bad ? "hint bad" : "good";
    line.textContent = what;
    box.appendChild(line);
  }

  // `how` is "auto" for the read nobody asked for, which says nothing in
  // the report -- the note under Run says whether it is ready -- and
  // "check" for the Check button, which only reads again what has changed.
  // Nothing at all is a fresh read however it stands: putting a save back
  // (29-saves.js) waits on the drawing that read asks for.
  function readyHandProgram(how) {
    if (!byHand) { return; }
    var auto = how === "auto";
    var mine = handKey();
    // Read already and unchanged: nothing more to say -- the report says
    // it has no problems, and Run is lit.
    if (AST && handWas === mine && (auto || how === "check")) { return; }
    if (auto && (handReading === mine ||
                 (handTried === mine && handWas !== mine))) { return; }
    if (auto) { handTried = mine; }
    function tell(what) { if (!auto) { handSays(what, true); } }
    // The first read is what starts Python, and Python says so in the
    // pseudocode side's note -- "Drawing..." last of all, which then sat
    // there over a side that was drawing nothing.  Put back to Ready unless
    // a build of its own is saying it.
    function unsaid() {
      var says = el("#build-note"), build = el("#build");
      if (!says || (build && build.classList.contains("working"))) { return; }
      if (says.textContent === TXT.starting || says.textContent === TXT.drawing) {
        says.textContent = TXT.ready;
      }
    }
    forgetProgram();
    handWas = null;
    // Only what stops it working stops it: a shape overlapping another is
    // said in amber and runs the same.
    if (!hand.nodes.length ||
        checkDesign().some(function (bit) { return !bit.warn; })) { return; }
    var text;
    try { text = handAsPseudocode(); }
    catch (thrown) { tell(thrown.message || String(thrown)); return; }
    handReading = mine;
    askFor({ text: text, title: el("#f-title") ? el("#f-title").value : "",
             author: "", shape: "auto", seed: "",
             lang: el("#f-lang") ? el("#f-lang").value : "",
             legend: false, grid: true, shapes: geom })
      .then(function (data) {
        if (handReading === mine) { handReading = null; }
        unsaid();
        if (!byHand || handKey() !== mine) { return; }
        if (!data.ok || !data.ast || !(data.ast.main || []).length) {
          tell(data.error || TXT.h_not_a_program);
          return;
        }
        var wasOut = !runnable();
        AST = data.ast;
        forgetLines();
        handWas = mine;
        dressRunner();
        // Run lighting up is what says it can be run now, however it was
        // asked: lit by itself, it says so with a glint.
        if (wasOut && typeof briefly === "function") {
          briefly(el("#run"), "lit-up", 800);
        }
      })
      .catch(function (err) {
        if (handReading === mine) { handReading = null; }
        unsaid();
        tell(String(err && err.message ? err.message : err));
      });
  }

  // A design that has been changed since it was read is not that program
  // any more, so the runner lets go of it -- and reads the new one as soon
  // as the drawing is still.
  function handChanged() {
    if (!byHand) { return; }
    var now = handKey();
    if (handWas && now !== handWas) { forgetProgram(); handWas = null; }
    if (now !== handWas || !AST) { readHandSoon(); }
  }

  function readHandSoon() {
    clearTimeout(handSoon);
    handSoon = setTimeout(function () {
      handSoon = 0;
      if (!byHand) { return; }
      if (running) { readHandSoon(); return; }   // not under a run's feet
      readyHandProgram("auto");
    }, HAND_SETTLE);
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
        // Sides an arrow was drawn to keep were picked for where the shapes
        // stood; tidied, they stand somewhere else, so every arrow finds
        // its way again (and still keeps off a side another arrow is on).
        hand.links.forEach(function (l) { delete l.fromSide; delete l.toSide; });
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
