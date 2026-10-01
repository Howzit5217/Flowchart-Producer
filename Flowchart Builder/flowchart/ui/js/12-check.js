// ---------------------------------------------------------------------------
//  12-check.js -- does the design work, and what does it say?
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ---- does it actually work? -------------------------------------------
  // `leaveOut` leaves out what costs the most to look for.  "looks" is the
  // two that are only about how it reads (ONLY_LOOKS), for asking only
  // whether it can be run (readyHandProgram); "lines" is the lines through
  // shapes, which wants every arrow routed, and which come after everything
  // else that can be put right (handMendAll).
  function checkDesign(leaveOut) {
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
    // The arrows out of and into each shape, gathered in one pass rather
    // than looked for again for every shape (outOf, intoOf): on a chart of
    // thousands of shapes that was millions of looks, on every redraw.
    var outsBy = {}, insBy = {};
    hand.links.forEach(function (l) {
      (outsBy[typeof l.from + ":" + l.from] = outsBy[typeof l.from + ":" + l.from] || []).push(l);
      (insBy[typeof l.to + ":" + l.to] = insBy[typeof l.to + ":" + l.to] || []).push(l);
    });
    function outOf(id) { return outsBy[typeof id + ":" + id] || []; }
    function intoOf(id) { return insBy[typeof id + ":" + id] || []; }

    var heads = hand.nodes.filter(function (n) { return !intoOf(n.id).length; });
    // A flow opened by an oval that names it is a module (modHead), and
    // one program can have as many of those as it likes -- but only the
    // one place where the program itself starts.
    var mains = heads.filter(function (n) { return !(modHead(n) && outOf(n.id).length); });
    if (!heads.length) {
      // every shape has an arrow in: the flow is a ring -- a Start above
      // the highest shape of it
      var highest = hand.nodes.reduce(function (a, b) { return b.y < a.y ? b : a; });
      fault("p_no_start", null, null, startAbove(highest));
    }
    else if (mains.length > 1) {
      fault("p_many_starts", null, { n: mains.length }, joinStarts(mains) || askOtherStart(mains));
    }
    else if (mains.length === 1 && !endsKind(mains[0].kind)) {
      fault("p_start_kind", mains[0], endShape, startAbove(mains[0]));
    }

    var ends = hand.nodes.filter(function (n) {
      return endsKind(n.kind) && !outOf(n.id).length;
    });
    var endFix = ends.length ? null : endBelow();
    if (!ends.length) { fault("p_no_end", null, endShape, endFix || askEndAfter()); }

    // Shapes on top of each other are looked for among the shapes near
    // each one (shapesNear, 10-hand.js), and each shape that would be moved off
    // is said once: said for every pair, a stack of pasted copies was a
    // list of eighteen thousand.
    var near = shapesNear([]), onTop = {};
    hand.nodes.forEach(function (n) {
      var outs = outOf(n.id), ins = intoOf(n.id), asks = asksKind(n.kind);
      if (!String(n.text || "").trim()) { fault("p_empty", n, null, fillEmpty(n)); }
      if (!outs.length && !ins.length) { fault("p_alone", n, null, arrowFrom(n)); }
      else if (!outs.length && !endsKind(n.kind)) {
        fault("p_dead_end", n, null, ends.length ? toEnd(n) : endFix);
      }
      if (asks && outs.length < 2) {
        fault("p_decision_out", n, { n: outs.length }, wayOut(n));
      }
      // three ways out and more: a Case, each way the value it answers to
      if (asks && outs.length > 2) {
        var said = {};
        outs.forEach(function (l) {
          var word = String(l.label || "").trim().toLowerCase();
          if (!word) { fault("p_no_label", n, null, nameWay(outs)); }
          else if (said[word]) { fault("p_same_labels", n, null, nameWay([l])); }
          said[word] = true;
        });
      }
      if (!asks && outs.length > 1) {
        fault("p_one_out", n, { n: outs.length }, oneWay(n, outs));
      }
      if (asks && outs.length === 2) {
        var one = (outs[0].label || "").trim(), two = (outs[1].label || "").trim();
        if (!one || !two) { fault("p_no_label", n, null, labelWays(outs)); }
        else if (one.toLowerCase() === two.toLowerCase()) {
          fault("p_same_labels", n, null, labelOther(outs));
        }
      }
      if (leaveOut === "looks") { return; }
      var t = turned(n);
      near.around(n.x - t.w / 2, n.y - t.h / 2, n.x + t.w / 2, n.y + t.h / 2).forEach(function (m) {
        if (m.id <= n.id || onTop[typeof m.id + ":" + m.id]) { return; }
        if (boxesMeet(n, n.x, n.y, m, m.x, m.y, -4)) {   // turned as they are drawn (13-hand-apart.js)
          onTop[typeof m.id + ":" + m.id] = true;
          fault("p_overlap", n, null, moveApart(m));   // the later of the two
        }
      });
    });

    // a line that runs through a shape on its way past is not wrong, but it
    // is the thing that makes a hand-drawn chart hard to follow
    var routes = leaveOut ? [] : routeAll();    // the lines as they are drawn
    hand.links.forEach(function (link, li) {
      var a = nodeById(link.from), b = nodeById(link.to);
      var pts = routes[li];
      if (!a || !b || !pts) { return; }
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      pts.forEach(function (p) {
        x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]);
        y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]);
      });
      near.around(x0, y0, x1, y1).forEach(function (n) {   // only shapes it could reach
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
    if (mains.length <= 1 && heads.length) {
      var seen = {}, stack = heads.map(function (n) { return n.id; });
      while (stack.length) {
        var id = stack.pop();
        if (seen[id]) { continue; }
        seen[id] = true;
        outOf(id).forEach(function (l) { stack.push(l.to); });
      }
      hand.nodes.forEach(function (n) {
        if (!seen[n.id]) { fault("p_unreached", n, null, joinFromAbove(n, seen) || askedFix(askArrowInto(n.id))); }
      });
    }
    // ...and from everything, an End has to be reachable, or the flow is
    // caught in a loop it can never leave
    // (walked back from the Ends along the arrows into each shape, once --
    // not every arrow over again for every step of the longest way round)
    if (ends.length) {
      var safe = {}, back = {}, todo = [];
      hand.links.forEach(function (l) { (back[l.to] = back[l.to] || []).push(l.from); });
      ends.forEach(function (n) { safe[n.id] = true; todo.push(n.id); });
      while (todo.length) {
        (back[todo.pop()] || []).forEach(function (from) {
          if (!safe[from]) { safe[from] = true; todo.push(from); }
        });
      }
      hand.nodes.forEach(function (n) {
        if (!safe[n.id] && outOf(n.id).length) {
          fault("p_trapped", n, null, asksKind(n.kind) ? wayOut(n) : askLeaveLoop(n));
        }
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

  var REPORT_ROWS = 40;                  // rows of the list drawn, at most
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
    // The first few dozen, and how many more: a row and a button each for
    // thousands was tens of thousands of buttons made on every change,
    // which nobody reads past the first screenful of anyway.  Put all right
    // below still puts every one of them right.
    found.slice(0, REPORT_ROWS).forEach(function (bit) {
      var row = document.createElement("button");
      row.className = "fault " + (bit.warn ? "warn" : "bad");
      row.textContent = bit.text;
      row.onclick = function () {
        if (bit.id) { picked = bit.id; drawHand(); drawHandPanel(); }
      };
      box.appendChild(row);
      if (bit.fix) { offerHandMend(row, box, bit.fix); }
    });
    if (found.length > REPORT_ROWS) {
      var rest = document.createElement("p");
      rest.className = "hint";
      rest.textContent = say("problems_more", { n: found.length - REPORT_ROWS });
      box.appendChild(rest);
    }
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

  // Would a shape standing here be too near another?  Each as it is
  // turned (13-hand-apart.js): a neighbour put clear of a turned shape by
  // its upright size ended up with a corner of the turned one across it.
  function crowds(node, x, y) {
    return hand.nodes.some(function (m) {
      return m !== node && boxesMeet(node, x, y, m, m.x, m.y, CLEAR);
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
        if (x - turned(node).w / 2 < 20 || y - turned(node).h / 2 < 20) { continue; }
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
    return { auto: false, says: TXT.hf_type, ask: askWords(id, asksKind(node.kind)), go: function () {
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
    return { auto: false, says: TXT.hf_arrow, ask: askArrowFrom(id), go: function () {
      picked = id; chosen = null; joining = true; joinFrom = null;
      drawHand(); drawHandPanel();
    } };
  }

  // A decision short of a way out: where the other way goes is yours to say,
  // so this starts its arrow, as a shape on its own does.
  function wayOut(node) {
    var fix = arrowFrom(node);
    fix.says = TXT.hf_out;
    return fix;
  }

  // The shape above a part of the chart nothing leads into, that it was
  // most likely meant to come after: one with a way out still to give -- a
  // shape with none yet, or a decision with one -- that is not an End, and
  // is itself reached from the start (`reached`, by id) -- nearest first,
  // and straight above before off to the side.
  function feederFor(node, reached) {
    var best = null, score = Infinity;
    hand.nodes.forEach(function (m) {
      if (m.id === node.id || m.y >= node.y || (reached && !reached[m.id])) { return; }
      var outs = outOf(m.id).length;
      var free = asksKind(m.kind) ? outs < 2 : outs === 0 && !(endsKind(m.kind) && intoOf(m.id).length);
      if (!free) { return; }
      var far = (node.y - m.y) + 2 * Math.abs(node.x - m.x);
      if (far < score) { best = m; score = far; }
    });
    return best;
  }
  // What the flow reaches from a shape, by id.
  function reachedFrom(id) {
    var seen = {}, todo = [id];
    while (todo.length) {
      var at = todo.pop();
      if (seen[at]) { continue; }
      seen[at] = true;
      outOf(at).forEach(function (l) { todo.push(l.to); });
    }
    return seen;
  }
  // A shape nothing leads to: joined on from the shape above it.
  function joinFromAbove(node, reached) {
    var id = node.id, from = feederFor(node, reached);
    if (!from) { return null; }
    var fromId = from.id;
    return { auto: true, says: TXT.hf_join, go: function () {
      var a = nodeById(fromId), b = nodeById(id);
      if (a && b && !outOf(a.id).some(function (l) { return l.to === id; })) { joinOn(a, b); }
    } };
  }
  // More than one place the flow starts: the Start -- the oval that leads
  // somewhere, highest up -- kept, and every other one joined on from the
  // shape above it, among those the Start reaches.
  function joinStarts(heads) {
    function main() {
      var now = hand.nodes.filter(function (n) { return !intoOf(n.id).length && outOf(n.id).length && !modHead(n); });
      var ovals = now.filter(function (n) { return endsKind(n.kind); });
      var pool = ovals.length ? ovals : now;
      return pool.length ? pool.reduce(function (a, b) { return b.y < a.y ? b : a; }) : null;
    }
    var first = main();
    if (!first) { return null; }
    var reached = reachedFrom(first.id);
    if (!heads.some(function (h) { return h.id !== first.id && feederFor(h, reached); })) { return null; }
    return { auto: true, says: TXT.hf_join_all, go: function () {
      var top = main();
      if (!top) { return; }
      hand.nodes.filter(function (n) { return !intoOf(n.id).length && !modHead(n) && n.id !== top.id; })
        .sort(function (a, b) { return a.y - b.y; })
        .forEach(function (h) {
          var from = feederFor(h, reachedFrom(top.id));
          if (from) { joinOn(from, h); }
        });
    } };
  }
  // A shape that is not a decision with more than one way out: where the
  // ways are worded, or it asks a question, it was meant to be one; and
  // otherwise the arrows after the first are the ones drawn by mistake.
  function oneWay(node, outs) {
    var id = node.id, worded = outs.some(function (l) { return String(l.label || "").trim(); });
    if (outs.length === 2 && (worded || /\?\s*$/.test(String(node.text || "")))) {
      return { auto: true, says: TXT.hf_decide, go: function () {
        var n = nodeById(id);
        if (n) { n.kind = ruleShape("diamond"); }
      } };
    }
    return { auto: true, says: TXT.hf_drop_way, go: function () {
      var seen = false;
      hand.links = hand.links.filter(function (l) {
        if (l.from !== id) { return true; }
        if (!seen) { seen = true; return true; }
        return false;
      });
    } };
  }
  // A way out of a Case with no words on it, or the same words as another:
  // the arrow picked, for its words to be written in.
  function nameWay(outs) {
    var bare = outs.length === 1 ? outs[0] : outs.filter(function (l) { return !String(l.label || "").trim(); })[0];
    if (!bare || bare.id === undefined) { return null; }
    var id = bare.id;
    return { auto: false, says: TXT.hf_name_way, ask: askWayName(id), go: function () {
      pickLink(id);
      var field = el("#hand-sel input.field");
      if (field) { field.focus(); }
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
    // one way saying something of its own -- "over 18" -- and the other
    // nothing: what the other says is asked for
    if (!wantA || !wantB) {
      var bare = a ? outs[1] : outs[0];
      return bare.id === undefined ? null : askedFix(askWayName(bare.id));
    }
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
    if (!want) { return outs[1].id === undefined ? null : askedFix(askWayName(outs[1].id)); }
    var two = outs[1];
    return { auto: true, says: say("hf_relabel", { word: want }),
             go: function () { two.label = want; } };
  }

  // A shape on top of another: the later of the two, moved to the nearest
  // place clear of everything.  In a crowd with nowhere clear that near --
  // copies pasted onto copies -- it goes with every shape it is joined to,
  // wherever a paste of them would have gone (moveClear, 13-hand-apart.js),
  // below everything if need be: left where it was, the fix did nothing,
  // and taken off alone, its arrows ran the length of the chart.
  function moveApart(node) {
    var id = node.id;
    return { auto: true, says: TXT.hf_apart, go: function () {
      var n = nodeById(id);
      var spot = n && freeSpot(n, 40);
      if (spot) { n.x = spot.x; n.y = spot.y; }
      else if (n) { moveClear(joinedWith(id)); }
    } };
  }

  // A shape and every shape it is joined to, by arrows either way.
  function joinedWith(id) {
    var next = {}, seen = {}, todo = [id], out = [];
    hand.links.forEach(function (l) {
      (next[l.from] = next[l.from] || []).push(l.to);
      (next[l.to] = next[l.to] || []).push(l.from);
    });
    while (todo.length) {
      var at = todo.pop();
      if (seen[at]) { continue; }
      seen[at] = true;
      out.push(at);
      (next[at] || []).forEach(function (to) { if (!seen[to]) { todo.push(to); } });
    }
    return out;
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
      // On a big chart each place tried is every arrow routed again, and a
      // dozen rings of them was seconds for one shape with the page stood
      // still: so it looks for a third of a second, and no longer.
      var was = { x: n.x, y: n.y }, before = crossings(), until = Date.now() + 300;
      var spot = freeSpot(n, 12, function (x, y) {
        if (Date.now() > until) { return false; }
        n.x = x; n.y = y;
        var now = crossings();
        n.x = was.x; n.y = was.y;
        return now < before;
      });
      if (spot) { n.x = spot.x; n.y = spot.y; }
    } };
  }

  // ---- asked for, by hand -------------------------------------------------
  // Where what puts it right is yours to say -- the words in a shape, the
  // shape an arrow goes on to, the words on a way out -- the box under the
  // warning asks for it (askBox, 27-ask.js) and this does the rest: the
  // words written in, the arrow drawn, one step for Undo to take back, and
  // the design checked again.
  function askedFix(ask) {
    return { auto: false, says: "", ask: ask, go: function () {} };
  }
  function handAsked(change) {
    keepUndo();
    change();
    drawHand(); drawHandPanel(); showReport();
    return "";
  }
  // Every other shape, to pick one from: its words, or what it is where it
  // has none, from the top down the way a chart is read.
  function shapesToPick(not) {
    return hand.nodes.filter(function (m) { return m.id !== not; })
      .sort(function (a, b) { return a.y - b.y || a.x - b.x; })
      .map(function (m) {
        var words = String(m.text || "").replace(/\s+/g, " ").trim();
        if (words.length > 30) { words = words.slice(0, 29) + "…"; }
        return { value: String(m.id), text: words || kindName(m.kind) };
      });
  }
  function shapeOfPick(value) {
    return hand.nodes.filter(function (m) { return String(m.id) === String(value); })[0] || null;
  }
  function askArrowFrom(id) {
    return { rows: [{ says: TXT.ask_arrow_to, go: TXT.ask_join,
      fields: [{ kind: "pick", options: shapesToPick(id) }],
      put: function (a) {
        var from = nodeById(id), to = shapeOfPick(a[0]);
        if (!from || !to) { return TXT.ask_stale; }
        return handAsked(function () { joinOn(from, to); });
      } }] };
  }
  function askArrowInto(id, says) {
    return { rows: [{ says: says || TXT.ask_arrow_from, go: TXT.ask_join,
      fields: [{ kind: "pick", options: shapesToPick(id) }],
      put: function (a) {
        var from = shapeOfPick(a[0]), to = nodeById(id);
        if (!from || !to) { return TXT.ask_stale; }
        return handAsked(function () { joinOn(from, to); });
      } }] };
  }
  // Two places the flow starts, and nothing to say which shape the second
  // was meant to come after: the lower one is asked about.
  function askOtherStart(heads) {
    var low = heads.slice().sort(function (a, b) { return b.y - a.y; })[0];
    if (!low) { return null; }
    var words = String(low.text || "").replace(/\s+/g, " ").trim() || kindName(low.kind);
    return askedFix(askArrowInto(low.id, say("ask_arrow_into", { name: words })));
  }
  // No End, and no shape the flow stops dead at to put one under: which
  // shape it stops after is asked -- one with a way out still to give.
  function askEndAfter() {
    var free = hand.nodes.filter(function (n) {
      var outs = outOf(n.id).length;
      return !endsKind(n.kind) && (asksKind(n.kind) ? outs < 2 : outs === 0);
    }).map(function (n) { return String(n.id); });
    if (!free.length) { return null; }
    return askedFix({ rows: [{ says: TXT.ask_end_after, go: TXT.ask_go,
      fields: [{ kind: "pick", options: shapesToPick(null).filter(function (o) { return free.indexOf(o.value) >= 0; }) }],
      put: function (a) {
        var from = shapeOfPick(a[0]);
        if (!from) { return TXT.ask_stale; }
        return handAsked(function () {
          var end = newShape(ruleShape("oval"), TXT.end, from.x, from.y + from.h / 2 + 70);
          joinOn(from, end);
        });
      } }] });
  }
  // Round and round with no way out: on the arrow going back up to the
  // top of the loop, a decision is put in asking the test that lets it
  // out -- True on to an End, False round again the way it went before.
  // Asked on that one shape only; the rest of the loop is put right by it.
  function askLeaveLoop(node) {
    var outs = outOf(node.id);
    if (outs.length !== 1) { return null; }
    var back = nodeById(outs[0].to);
    if (!back || back.y > node.y) { return null; }
    var id = node.id;
    return askedFix({ rows: [{ says: TXT.ask_leave_when, go: TXT.ask_go,
      fields: [{ kind: "text", hint: "n > 5" }],
      put: function (a) {
        var from = nodeById(id), link = outOf(id)[0];
        if (!from || !link) { return TXT.ask_stale; }
        return handAsked(function () {
          var test = newShape(ruleShape("diamond"), a[0], from.x, from.y + from.h / 2 + 80);
          // the arrow back up now leaves from the test, on False: a new one
          // in its place rather than the old one bent (routes are kept by
          // the arrows they were worked out for)
          hand.links.splice(hand.links.indexOf(link), 1);
          hand.links.push({ from: id, to: test.id, label: "" });
          hand.links.push({ from: test.id, to: link.to, label: TXT.no });
          var ends = hand.nodes.filter(function (n) { return endsKind(n.kind) && intoOf(n.id).length && !outOf(n.id).length; });
          var end = ends.length ? ends[0]
                  : newShape(ruleShape("oval"), TXT.end, test.x, test.y + test.h / 2 + 80);
          hand.links.push({ from: test.id, to: end.id, label: TXT.yes });
        });
      } }] });
  }
  function askWords(id, asks) {
    return { rows: [{ says: TXT.ask_write_in,
      fields: [{ kind: "text", hint: asks ? "x > 5" : TXT.ask_write_eg }],
      put: function (a) {
        var n = nodeById(id);
        if (!n) { return TXT.ask_stale; }
        return handAsked(function () { n.text = a[0]; });
      } }] };
  }
  function askWayName(linkId) {
    return { rows: [{ says: TXT.ask_name_way,
      fields: [{ kind: "text", hint: TXT.yes }],
      put: function (a) {
        var l = linkById(linkId);
        if (!l) { return TXT.ask_stale; }
        return handAsked(function () { l.label = a[0]; });
      } }] };
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
    // what is yours to say, asked for in a box rather than a button that
    // only starts the job (27-ask.js)
    if (fix.ask) {
      var asked = askBox(fix.ask);
      box.appendChild(asked);
      return asked;
    }
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
  // after a second and a half rather than keep the page.  The lines through
  // shapes come last in the list, so they are only looked for (every arrow
  // routed) once there is nothing before them left to put right: looked for
  // every time, a chart of stacked copies put right a dozen a press.
  function handMendAll() {
    if (!byHand) { return; }
    keepUndo();
    var tried = {}, began = Date.now();
    function fixable(bit) {
      return bit.fix && bit.fix.auto && !tried[bit.key + ":" + bit.id + ":" + bit.fix.says];
    }
    for (var turn = 0; turn < 60 && Date.now() - began < 1500; turn++) {
      var next = checkDesign("lines").filter(fixable)[0] || checkDesign().filter(fixable)[0];
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

  // `past` is the tests of the loops being written out round this spot,
  // which the flow is not followed through.  Going on through one of them
  // is going round that loop again, and everywhere in a loop comes back to
  // everywhere else in it that way: followed through, every If inside a
  // While came back to itself, and was taken for a loop of its own -- with
  // both of its ways coming back, a tangle that could not be written out.
  function canReach(fromId, wantId, past) {   // is wantId anywhere ahead of here?
    var seen = {}, stack = [fromId];
    while (stack.length) {
      var id = stack.pop();
      if (id === wantId) { return true; }
      if (seen[id] || (past && past.indexOf(id) >= 0)) { continue; }
      seen[id] = true;
      outOf(id).forEach(function (l) { stack.push(l.to); });
    }
    return false;
  }

  // Where two branches come together again -- the nearest shape both of
  // them reach.  Breadth first, so "nearest" means what it says.  Not
  // through the test of a loop round them either (`past`, as above): two
  // ways out of an If inside a loop that meet only by going round it meet
  // at its test, where the loop comes round.
  function meetAgain(aId, bId, past) {
    function stops(id) { return past && past.indexOf(id) >= 0; }
    var ahead = {}, stack = [aId];
    while (stack.length) {
      var id = stack.pop();
      if (ahead[id]) { continue; }
      ahead[id] = true;
      if (!stops(id)) { outOf(id).forEach(function (l) { stack.push(l.to); }); }
    }
    var seen = {}, queue = [bId];
    while (queue.length) {
      var at = queue.shift();
      if (seen[at]) { continue; }
      seen[at] = true;
      if (ahead[at]) { return at; }
      if (!stops(at)) { outOf(at).forEach(function (l) { queue.push(l.to); }); }
    }
    return null;
  }

  // Where every one of several ways meets again -- the nearest shape all of
  // them reach -- for a decision with more than two ways out (a Select
  // Case).  Breadth first from the first way, as meetAgain is.
  function meetAll(ids, past) {
    if (ids.length === 2) { return meetAgain(ids[0], ids[1], past); }
    function stops(id) { return past && past.indexOf(id) >= 0; }
    function reach(from) {
      var ahead = {}, stack = [from];
      while (stack.length) {
        var id = stack.pop();
        if (ahead[id]) { continue; }
        ahead[id] = true;
        if (!stops(id)) { outOf(id).forEach(function (l) { stack.push(l.to); }); }
      }
      return ahead;
    }
    var others = ids.slice(1).map(reach);
    var seen = {}, queue = [ids[0]];
    while (queue.length) {
      var at = queue.shift();
      if (seen[at]) { continue; }
      seen[at] = true;
      if (others.every(function (one) { return one[at]; })) { return at; }
      if (!stops(at)) { outOf(at).forEach(function (l) { queue.push(l.to); }); }
    }
    return null;
  }

  // What a way out of a Select Case is labelled with, as the Case says it:
  // a number as it is, and a word in quotes -- an arrow marked A means the
  // letter A, not something called A.  A run of them, 1 To 5, and several,
  // 2, 3, as written; Other, Else and the like are the Case Else (null).
  var R_OTHER_WAY = /^(else|other|others|otherwise|default|anything else|case else)$/i;
  function caseLabel(label) {
    var t = String(label || "").trim();
    if (R_OTHER_WAY.test(t)) { return null; }
    if (/^[-+]?\d+(\.\d+)?$/.test(t) || /^(["']).*\1$/.test(t)) { return t; }
    if (/\s+to\s+/i.test(t) || /,/.test(t)) { return t; }
    return '"' + t.replace(/"/g, "'") + '"';
  }

  // A flow of its own that the program calls on: an oval nothing leads
  // into whose words name it -- double(x), Function double(x), Module
  // greet.  A second "Start" is not one of these: that is two programs
  // drawn in one place, and the check says so.
  var R_MOD_HEAD = /^(?:(?:module|function|sub|procedure|subroutine|def|method)\s+[A-Za-z_]\w*.*|[A-Za-z_]\w*\s*\(.*\)\s*(?:(?:as|returns?|->|:)\s*\w+)?)$/i;
  var R_MAIN_HEAD = /^(start|begin|main)(\s+program)?\s*(\(\s*\))?$/i;
  function modHead(n) {
    var said = saidIn(n);
    return R_MOD_HEAD.test(said) && !R_MAIN_HEAD.test(said);
  }
  // Whether a flow hands anything back: an oval in it says Return and what.
  function flowGives(id) {
    var seen = {}, stack = [id];
    while (stack.length) {
      var at = stack.pop();
      if (seen[at]) { continue; }
      seen[at] = true;
      var n = nodeById(at), outs = outOf(at);
      if (n && !outs.length && /^return\s+\S/i.test(saidIn(n))) { return true; }
      outs.forEach(function (l) { stack.push(l.to); });
    }
    return false;
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
  // While -- came from no shape at all.  A run reads it to light the shape
  // each statement came from (runShapes, 14-run.js); Tidy up has a writing
  // of its own, and its own lines (handWriting).
  var handLine = {};                     // line of pseudocode -> shape number

  function handAsPseudocode() {
    var made = handWriting(false);
    handLine = made.lines;
    return made.text;
  }

  // A loop with its test at the foot: the flow comes back round to this
  // shape from a decision further on, whose other way leads on out.  It
  // used to be written as a While at that decision, which could only say
  // what came before the test by writing it all out a second time -- the
  // pseudocode said Input guess twice for the one shape, and Tidy up had
  // two places for it and a gap where the second one stood.  A Do with
  // its test at the foot is the loop that was drawn.
  function testAtFoot(id, loops) {
    var found = null;
    intoOf(id).forEach(function (back) {
      var test = nodeById(back.from);
      if (found || !test || test.id === id || !asksKind(test.kind) ||
          loops.indexOf(test.id) >= 0 || outOf(test.id).length !== 2) { return; }
      var ways = bothWays(test.id);
      var on = ways[0] === back ? ways[1] : ways[1] === back ? ways[0] : null;
      if (!on || on.to === id) { return; }
      if (!canReach(id, test.id, loops)) { return; }                 // not further on
      if (canReach(on.to, id, loops.concat([test.id]))) { return; }  // both ways come back
      found = { test: test, on: on, again: ways[0] === back };
    });
    return found;
  }

  // Where Tidy up gives a shape with nothing written in it -- a small
  // circle where two ways meet, a connector -- its place in the flow.
  var HAND_STAND_IN = "…";

  // The drawing written out, and which shape each line came from.
  //
  // `once` is for Tidy up, which lays the drawing out as this writing is
  // laid out on the pseudocode side and puts each shape where its line
  // stands.  A shape can only stand in one place, so the flow is written
  // as far as a shape already written and no further -- a loop tested
  // part way down, written out, says what comes before its test twice --
  // and a shape with nothing in it, which the writing has no line for, is
  // given one (HAND_STAND_IN), so the layout makes room for it where it is.
  // What it writes is never run.
  function handWriting(once) {
    var heads = hand.nodes.filter(function (n) { return !intoOf(n.id).length; });
    // A flow whose first oval names it is a module the program calls
    // (modHead), written out after the program under its own name.
    var mods = heads.filter(function (n) { return modHead(n) && outOf(n.id).length; });
    var starts = heads.filter(function (n) { return mods.indexOf(n) < 0; });
    // The program starts where nothing leads in: at a shape that leads on
    // to something, where one does -- a note standing on its own is not the
    // start of anything -- and at an oval before any other shape.
    var head = starts.filter(function (n) { return outOf(n.id).length && endsKind(n.kind); })[0] ||
               starts.filter(function (n) { return outOf(n.id).length; })[0] || starts[0] || null;
    if (!head && !mods.length) { throw new Error(TXT.h_no_start); }
    var out = [], been = {}, lines = {};
    var inModule = false;                // writing a module's flow, not the program's
    var isHead = {};                     // the ovals that open a flow: said by its first line
    if (head) { isHead[head.id] = true; }
    mods.forEach(function (m) { isHead[m.id] = true; });

    function put(words, id) {
      out.push(words);
      if (id) { lines[out.length] = id; }
    }

    function step(deep) { return new Array(deep + 1).join("    "); }

    // `loops`: the tests of the loops this is inside (see canReach).
    function write(id, stopId, deep, loops) {
      loops = loops || [];
      while (id && id !== stopId) {
        if (loops.indexOf(id) >= 0) { return; }   // round the loop again: its body is done
        if (once && been[id]) { return; }         // written already, where it stands
        var node = nodeById(id);
        if (!node) { return; }
        var outs = outOf(id), asks = asksKind(node.kind);
        var picks = asks && outs.length > 2;
        var ways = null, yesBack = false, noBack = false;
        if (asks && outs.length && !picks) {
          ways = bothWays(id);
          yesBack = !!ways[1] && canReach(ways[0].to, id, loops);
          noBack = !!ways[1] && canReach(ways[1].to, id, loops);
        }
        // Not a While: perhaps the top of a loop tested at its foot.
        var foot = yesBack !== noBack ? null : testAtFoot(id, loops);
        if (foot) {
          var said = saidIn(foot.test);
          been[foot.test.id] = (been[foot.test.id] || 0) + 1;
          put(step(deep) + "Do", foot.test.id);
          write(id, foot.test.id, deep + 1, loops.concat([foot.test.id]));
          put(step(deep) + (foot.again ? "Loop While " + said : "Until " + said));
          id = foot.on.to;
          continue;
        }
        been[id] = (been[id] || 0) + 1;
        if (been[id] > 3) { throw new Error(TXT.h_tangled); }
        var words = saidIn(node) || (once && asks ? HAND_STAND_IN : "");
        if (!outs.length) {              // an End, and the flow stops here
          // In a module the way out is a Return -- Return and what it hands
          // back, where the oval says so.  An End there would end the
          // whole program.
          var last = inModule ? "Return" : "End";
          // A shape that is not an End, with no way on out of it, still
          // says what it says -- written as End, its words were lost.
          if (!asks && !endsKind(node.kind) && words && !isHead[id]) {
            put(step(deep) + words, node.id);
            put(step(deep) + last);
          } else if (inModule && /^return\b/i.test(words)) {
            put(step(deep) + words, node.id);
          } else {
            put(step(deep) + last, node.id);
          }
          return;
        }
        if (picks) {                     // three ways out and more: a Select Case
          var meet = meetAll(outs.map(function (l) { return l.to; }), loops);
          put(step(deep) + "Select Case " + words, node.id);
          outs.forEach(function (l) {
            var label = caseLabel(l.label);
            put(step(deep + 1) + (label === null ? "Case Else" : "Case " + label));
            write(l.to, meet, deep + 2, loops);
          });
          put(step(deep) + "End Select");
          if (!meet) { return; }
          id = meet;
          continue;
        }
        if (asks && ways[1]) {
          var yes = ways[0], no = ways[1];
          if (yesBack && noBack && !once) { throw new Error(TXT.h_tangled); }
          if (yesBack !== noBack) {      // a question you come back to: a loop
            var body = yesBack ? yes : no, on = yesBack ? no : yes;
            put(step(deep) +
                (yesBack ? "While " + words
                         : "While NOT (" + words + ")"), node.id);
            write(body.to, id, deep + 1, loops.concat([id]));
            put(step(deep) + "End While");
            id = on.to;
            continue;
          }
          var join = meetAgain(yes.to, no.to, loops);
          put(step(deep) + "If " + words + " Then", node.id);
          write(yes.to, join, deep + 1, loops);
          if (no.to !== join) {
            put(step(deep) + "Else");
            write(no.to, join, deep + 1, loops);
          }
          put(step(deep) + "End If");
          if (!join) { return; }         // both ways ended on their own
          id = join;
          continue;
        }
        if (!isHead[id]) {               // the first oval is the Start above
          if (words) { put(step(deep) + words, node.id); }
          else if (once) { put(step(deep) + HAND_STAND_IN, node.id); }
        }
        id = outs[0].to;
      }
    }

    if (head) {
      put("Start", head.id);
      write(head.id, null, 0);
      if (out[out.length - 1] !== "End") { put("End"); }
    }
    // Every module after the program, under its own name: Function where
    // it hands something back, Module where it does not, unless it said
    // which itself.
    mods.forEach(function (m) {
      var said = saidIn(m);
      var kind = /^(module|function|sub|procedure|subroutine|def|method)\b/i.exec(said);
      var word = kind ? kind[1].charAt(0).toUpperCase() + kind[1].slice(1).toLowerCase()
                      : flowGives(m.id) ? "Function" : "Module";
      if (word === "Def" || word === "Method") { word = "Function"; }
      if (out.length) { out.push(""); }
      put(kind ? said : word + " " + said, m.id);
      inModule = true;
      write(m.id, null, 1);
      inModule = false;
      put("End " + word);
    });
    return { text: out.join("\n"), lines: lines };
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
        checkDesign("looks").some(function (bit) { return !bit.warn; })) { return; }
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

  if (el("#hand-code")) {
    el("#hand-code").onclick = showHandCode;
  }
