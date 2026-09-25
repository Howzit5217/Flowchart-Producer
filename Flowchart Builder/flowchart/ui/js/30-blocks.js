// ---------------------------------------------------------------------------
//  30-blocks.js -- moving the blocks of a chart built from pseudocode
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ====================================================== moving a block ==
  // A chart built from pseudocode came out where the layout put it, and
  // there it stayed: a block wanted a little to the left to clear a label,
  // or a branch wanted pulling out to read better, and the only way to have
  // it was to redraw the whole chart by hand.  So the blocks can be picked
  // up and put down somewhere else.  Only the blocks: what joins to what is
  // the program's, so the arrows cannot be drawn, taken away or turned
  // round here -- they follow the blocks they join, and find their own way.
  //
  // How: the drawing says nothing about which arrow joins which blocks --
  // its arrows are lines, some of them meeting others part way -- so that
  // is read off the lines themselves.  Each line starts on the edge of a
  // block or where it meets another line, and ends at the point of an
  // arrowhead on the edge of a block or where it meets another line.  When
  // a block moves, the lines with an end on it are laid again by the router
  // the drawing-by-hand side uses, from and to the same sides as before --
  // a decision's True still leaves where its word is -- and every other
  // line is left exactly as the layout drew it.  A block is moved by
  // moving each thing in it, rather than the block as a whole, so that what
  // measures the block -- the camera following a run, the highlighter,
  // the glide between two drawings -- measures it where it now is.
  var blockMoves = null;                 // { seed, sign, at: { index: [dx, dy] } }
  var pendingMoves = null;               // moves waiting for their chart to land
  var freshAsked = false;                // Build pressed, and laying out afresh agreed to
  var layingFresh = false;               // ... and this drawing is that one
  var blockCarry = null;                 // the block being carried, if one is
  var MOVE_STEP = 5;                     // where a block settles, like the paper by hand
  var MOVE_NUDGE = 4;                    // pixels before a press is a drag, not a click

  function movesHeld() {
    return !!blockMoves && Object.keys(blockMoves.at).length > 0;
  }
  function movesNow() {
    return movesHeld() ? JSON.parse(JSON.stringify(blockMoves)) : null;
  }

  // Which drawing this is, as far as moves go: its blocks, in order.  The
  // same program drawn from the same seed comes out with the same blocks in
  // the same order, which is what says a move made on one belongs on it.
  function chartSign() {
    return all(".node", chart).map(function (g) {
      return (g.dataset.kind || "") + "/" + (g.dataset.i || "");
    }).join("|");
  }

  function numbersIn(s) {
    return (String(s || "").match(/-?\d*\.?\d+(?:e-?\d+)?/gi) || []).map(Number);
  }

  // The corners of a drawn line.  It is written as straight runs with each
  // corner eased by a curve (draw/arrows.py, path_d): L to where the curve
  // starts, then Q through the corner to where it ends.  The corner is the
  // curve's middle point, and the two points either side of it are not.
  function cornersOf(d) {
    var tok = String(d || "").match(/[MLQ]|-?\d*\.?\d+(?:e-?\d+)?/gi) || [];
    var pts = [], mode = "", k = 0;
    while (k < tok.length) {
      if (/^[MLQ]$/i.test(tok[k])) { mode = tok[k].toUpperCase(); k++; continue; }
      if (mode === "Q" && k + 3 < tok.length) {
        if (pts.length > 1) { pts.pop(); }
        pts.push([+tok[k], +tok[k + 1]]);
        k += 4;
        continue;
      }
      if (k + 1 >= tok.length) { break; }
      pts.push([+tok[k], +tok[k + 1]]);
      k += 2;
    }
    return pts;
  }

  // The block itself, without its words or the word on a way out of it --
  // measured where the layout put it, whatever it has been moved by since.
  function shapeBox(g) {
    var l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    Array.prototype.forEach.call(g.children, function (e) {
      var tag = e.tagName.toLowerCase();
      if (tag === "text" || tag === "title" ||
          /\b(patch|label|highlights)\b/.test(e.getAttribute("class") || "")) { return; }
      var m;
      try { m = e.getBBox(); } catch (x) { return; }
      if (!m.width && !m.height) { return; }
      l = Math.min(l, m.x); t = Math.min(t, m.y);
      r = Math.max(r, m.x + m.width); b = Math.max(b, m.y + m.height);
    });
    return l === Infinity ? null : { x: l, y: t, w: r - l, h: b - t };
  }

  // The side a line leaves a block by, or arrives at it by, from the way
  // its run there goes -- lines meet a side square on.  In the order the
  // router numbers them: top, foot, left, right.
  function sideFrom(dx, dy, arriving) {
    if (arriving) { dx = -dx; dy = -dy; }
    return Math.abs(dy) >= Math.abs(dx) ? (dy < 0 ? 0 : 1) : (dx < 0 ? 2 : 3);
  }

  // Everything moving a block needs to know about the drawing, read once.
  function blocksModel() {
    if (!chart || byHand) { return null; }
    if (chart._blocks) { return chart._blocks; }
    // A drawing put back after the page has been on the other side is the
    // markup it was, moves and all: where each block was moved to is read
    // off its pieces, and where each line and head was first drawn off the
    // copy of it kept on it (data-d0, data-points0), so the model is of
    // the drawing as laid out, with the moves on top.
    var shapes = all(".node", chart).map(function (g, i) {
      var first = g.firstElementChild, dx = 0, dy = 0;
      var shift = first && first.hasAttribute("data-own") &&
                  /translate\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)/.exec(first.getAttribute("transform") || "");
      if (shift) { dx = +shift[1]; dy = +shift[2]; }
      return { g: g, i: i, id: i + 1, box: shapeBox(g), dx: dx, dy: dy };
    });
    var heads = all(".head", chart).map(function (h) {
      var drawn = h.getAttribute("data-points0") || h.getAttribute("points");
      var n = numbersIn(drawn);
      var tip = [n[0], n[1]], base = [(n[2] + n[4]) / 2, (n[3] + n[5]) / 2];
      return { el: h, points: drawn, tip: tip, base: base,
               len: Math.hypot(tip[0] - base[0], tip[1] - base[1]) || 10,
               wide: Math.hypot(n[2] - n[4], n[3] - n[5]) || 8, flow: null };
    });
    var flows = all(".flow", chart).map(function (p, k) {
      var d = p.getAttribute("data-d0") || p.getAttribute("d");
      var laid = p.hasAttribute("data-d0") ? cornersOf(p.getAttribute("d")) : null;
      return { el: p, k: k, d0: d, pts0: cornersOf(d), pts: laid, head: null };
    }).filter(function (f) { return f.pts0.length > 1; });
    function near(p, q, by) { return Math.abs(p[0] - q[0]) <= by && Math.abs(p[1] - q[1]) <= by; }
    // Each line's head: the line stops at the base of it, or at its point
    // where the last run is too short to stop any sooner.
    flows.forEach(function (f) {
      var z = f.pts0[f.pts0.length - 1];
      for (var i = 0; i < heads.length && !f.head; i++) {
        var h = heads[i];
        if (!h.flow && (near(z, h.base, 0.8) || near(z, h.tip, 0.8))) { f.head = h; h.flow = f; }
      }
    });
    // Where another line starts or stops, lines meet: that is a point of
    // its own, and stays where it is.
    function meeting(p, f) {
      return flows.some(function (o) {
        if (o === f) { return false; }
        return near(p, o.pts0[0], 0.8) || near(p, o.pts0[o.pts0.length - 1], 0.8);
      });
    }
    function block(p) {                  // the block a point is on the edge of
      var best = null, far = 8;
      shapes.forEach(function (s) {
        var b = s.box;
        if (!b) { return; }
        var out = Math.max(b.x - p[0], p[0] - (b.x + b.w), b.y - p[1], p[1] - (b.y + b.h), 0);
        var edge = Math.min(Math.abs(p[0] - b.x), Math.abs(p[0] - b.x - b.w),
                            Math.abs(p[1] - b.y), Math.abs(p[1] - b.y - b.h));
        var how = out || edge;
        if (how <= far) { far = how; best = s; }
      });
      return best;
    }
    flows.forEach(function (f, n) {
      var p = f.pts0, last = p.length - 1;
      var s = meeting(p[0], f) ? null : block(p[0]);
      f.from = s ? { shape: s, at: p[0].slice(), side: sideFrom(p[1][0] - p[0][0], p[1][1] - p[0][1]) }
                 : { at: p[0].slice(), side: -1, id: -1 - n * 2 };
      var tip = f.head ? f.head.tip : p[last];
      var t = f.head ? block(tip) : (meeting(p[last], f) ? null : block(p[last]));
      f.to = t ? { shape: t, at: tip.slice(),
                   side: sideFrom(p[last][0] - p[last - 1][0], p[last][1] - p[last - 1][1], true) }
               : { at: tip.slice(), side: -1, id: -2 - n * 2 };
    });
    chart._blocks = { shapes: shapes, flows: flows };
    return chart._blocks;
  }

  // Moved: every piece of it, by the same amount, over whatever turn it
  // had of its own (kept in data-own, so it survives the drawing being
  // written out and read back in when the page switches sides).
  function shiftShape(s, dx, dy) {
    Array.prototype.forEach.call(s.g.children, function (e) {
      if (!e.hasAttribute("data-own")) { e.setAttribute("data-own", e.getAttribute("transform") || ""); }
      var own = e.getAttribute("data-own");
      var t = (dx || dy ? "translate(" + dx + " " + dy + ")" : "") + (own ? " " + own : "");
      if (t.trim()) { e.setAttribute("transform", t.trim()); } else { e.removeAttribute("transform"); }
    });
    s.dx = dx; s.dy = dy;
    // Where it is for the glide between two drawings (26-motion.js).
    if ((dx || dy) && s.box) {
      s.g.glideAt = { x: s.box.x + dx, y: s.box.y + dy, w: s.box.w, h: s.box.h };
    } else { delete s.g.glideAt; }
  }

  // An end of a line as a point-sized block to route to: on a block's edge,
  // moved with it and held to its side; or where lines meet, free to come
  // in from whichever side is clearest.
  function endOf(end) {
    var s = end.shape;
    return { node: { id: s ? s.id : end.id, kind: "rect", turn: 0, w: 0, h: 0, meet: !s,
                     x: end.at[0] + (s ? s.dx : 0), y: end.at[1] + (s ? s.dy : 0) },
             side: s ? end.side : -1 };
  }

  function routeFlow(m, f, ways) {
    var a = endOf(f.from), b = endOf(f.to);
    // The blocks it has to find its way round: those anywhere near.
    var x0 = Math.min(a.node.x, b.node.x) - 300, x1 = Math.max(a.node.x, b.node.x) + 300;
    var y0 = Math.min(a.node.y, b.node.y) - 300, y1 = Math.max(a.node.y, b.node.y) + 300;
    var nodes = [];
    m.shapes.forEach(function (s) {
      var bx = s.box;
      if (!bx) { return; }
      var l = bx.x + s.dx, t = bx.y + s.dy;
      if (l + bx.w < x0 || l > x1 || t + bx.h < y0 || t > y1) { return; }
      nodes.push({ id: s.id, kind: "rect", turn: 0, x: l + bx.w / 2, y: t + bx.h / 2,
                   w: bx.w, h: bx.h });
    });
    var mine = hand, pts;
    hand = { nodes: nodes, links: [] };
    try {
      pts = linkPath(a.node, b.node, { fromSide: PORT_SIDES[a.side], toSide: PORT_SIDES[b.side] },
                     {}, null, ways);
    } finally { hand = mine; }
    f.pts = pts;
    if (!f.el.hasAttribute("data-d0")) { f.el.setAttribute("data-d0", f.d0); }
    if (f.head && !f.head.el.hasAttribute("data-points0")) {
      f.head.el.setAttribute("data-points0", f.head.points);
    }
    var line = pts.map(function (p) { return p.slice(); });
    if (f.head) {
      // The head at the new point, the size it was drawn, and the line
      // stopping at its base as it did.
      var tip = line[line.length - 1], back = line[line.length - 2];
      var run = Math.hypot(tip[0] - back[0], tip[1] - back[1]) || 1;
      var ux = (tip[0] - back[0]) / run, uy = (tip[1] - back[1]) / run;
      var len = f.head.len, half = f.head.wide / 2;
      var cx = tip[0] - ux * len, cy = tip[1] - uy * len;
      f.head.el.setAttribute("points", [tip, [cx - uy * half, cy + ux * half],
                                        [cx + uy * half, cy - ux * half]].map(function (p) {
        return p[0].toFixed(1) + "," + p[1].toFixed(1);
      }).join(" "));
      if (run > len + 1) { line[line.length - 1] = [+cx.toFixed(2), +cy.toFixed(2)]; }
    }
    f.el.setAttribute("d", easedPath(line));
  }

  function restoreFlow(f) {
    f.pts = null;
    f.el.setAttribute("d", f.d0);
    if (f.head) { f.head.el.setAttribute("points", f.head.points); }
  }

  // Lines with an end on a moved block laid again; the rest as drawn --
  // or, given `only`, just the lines of that one block, the rest left as
  // they are (which is how a drag goes, a frame at a time).
  function rerouteFlows(m, only) {
    function moved(end) { return end.shape && (only ? end.shape === only : end.shape.dx || end.shape.dy); }
    var redo = [], ways = {};
    m.flows.forEach(function (f) {
      if (moved(f.from) || moved(f.to)) { redo.push(f); return; }
      if (!only) { restoreFlow(f); }
      waysAdd(ways, f.pts || f.pts0);
    });
    redo.forEach(function (f) {
      routeFlow(m, f, ways);
      waysAdd(ways, f.pts);
    });
  }

  // The moves held, put on the drawing that is there, from scratch.
  function putMoves() {
    var m = blocksModel();
    if (!m) { return; }
    m.shapes.forEach(function (s) {
      var at = blockMoves && blockMoves.at[s.i];
      shiftShape(s, at ? at[0] : 0, at ? at[1] : 0);
    });
    rerouteFlows(m);
  }

  // ------------------------------------------------------- carrying one --
  // With the mouse or a pen; a finger on a block still scrolls the chart,
  // as it always has, which on a phone is what a finger is for.
  document.addEventListener("pointerdown", function (ev) {
    if (byHand || !chart || ev.button !== 0 || ev.pointerType === "touch") { return; }
    var g = ev.target.closest ? ev.target.closest("#chart .node") : null;
    if (!g || !chart.contains(g)) { return; }
    blockCarry = { g: g, x: ev.clientX, y: ev.clientY, on: false };
  }, true);

  function startCarry() {
    var m = blocksModel();
    var s = m && m.shapes.filter(function (one) { return one.g === blockCarry.g; })[0];
    if (!s || !s.box) { blockCarry = null; return false; }
    keepUndo();                          // one step back takes the whole move
    var frame = chart.getScreenCTM();
    blockCarry.on = true;
    blockCarry.m = m;
    blockCarry.s = s;
    blockCarry.dx = s.dx;
    blockCarry.dy = s.dy;
    blockCarry.scale = frame && frame.a ? frame.a : zoom || 1;
    document.body.classList.add("carrying-block");
    return true;
  }

  function carryFrame(was) {
    var c = was && was.s ? was : blockCarry;
    if (!c || !c.on) { return; }
    c.frame = null;
    var s = c.s, b = s.box;
    var dx = c.dx + (c.px - c.x) / c.scale, dy = c.dy + (c.py - c.y) / c.scale;
    dx = Math.round(dx / MOVE_STEP) * MOVE_STEP;
    dy = Math.round(dy / MOVE_STEP) * MOVE_STEP;
    // Kept on the paper: a block carried off its edge would be cut off.
    dx = Math.max(2 - b.x, Math.min(W - 2 - b.x - b.w, dx));
    dy = Math.max(2 - b.y, Math.min(H - 2 - b.y - b.h, dy));
    if (dx === s.dx && dy === s.dy) { return; }
    shiftShape(s, dx, dy);
    rerouteFlows(c.m, s);
  }

  window.addEventListener("pointermove", function (ev) {
    var c = blockCarry;
    if (!c) { return; }
    if (!c.on) {
      if (Math.hypot(ev.clientX - c.x, ev.clientY - c.y) < MOVE_NUDGE) { return; }
      if (!startCarry()) { return; }
    }
    c.px = ev.clientX; c.py = ev.clientY;
    if (!c.frame) { c.frame = requestAnimationFrame(carryFrame); }
  });

  function endCarry() {
    var c = blockCarry;
    blockCarry = null;
    if (!c || !c.on) { return; }
    if (c.frame) { cancelAnimationFrame(c.frame); carryFrame(c); }   // where it was let go
    document.body.classList.remove("carrying-block");
    var s = c.s;
    if (!blockMoves || blockMoves.sign !== chartSign()) {
      blockMoves = { seed: String(lastLaid.seed || ""), sign: chartSign(), at: {} };
    }
    if (s.dx || s.dy) { blockMoves.at[s.i] = [s.dx, s.dy]; }
    else { delete blockMoves.at[s.i]; }
    rerouteFlows(c.m);                   // and everything settled together
    carriedAt = Date.now();
  }
  window.addEventListener("pointerup", endCarry);
  window.addEventListener("pointercancel", endCarry);

  // The press that let go of a carried block is not a click on it.  Taken
  // for one, it picked the block for styling and turned the panel over to
  // the Style side -- putting a block down took the Build button away.
  var carriedAt = 0;
  document.addEventListener("click", function (ev) {
    if (Date.now() - carriedAt > 400) { return; }
    carriedAt = 0;
    if (ev.target.closest && ev.target.closest("#chart")) {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }, true);

  // ----------------------------------------------- drawing it again ------
  // Building again lays the chart out afresh, which puts every moved block
  // back where the layout would have it -- so a press of Build, with blocks
  // moved, asks first.  Nothing else does: opening a file or an example is
  // a different program, and a setting changed is the same chart drawn in
  // other words, from the same seed, with the moves put back on it.
  function askFresh(go) {
    areYouSure(TXT.mv_head, TXT.mv_said, TXT.mv_yes, function () {
      freshAsked = true;
      go();
    });
  }

  // Build, pressed for you -- by Ctrl+Enter, or a warning put right.
  function buildAsked() {
    var build = el("#build");
    if (!build || build.disabled) { return; }
    if (movesHeld() && !byHand) { askFresh(function () { build.click(); }); }
    else { build.click(); }
  }

  (function () {
    var build = el("#build");
    if (!build || !build.onclick) { return; }
    var pressed = build.onclick;
    build.onclick = function (ev) {
      var self = this;
      if (ev && ev.isTrusted && movesHeld() && !byHand && !freshAsked) {
        askFresh(function () { pressed.call(self, ev); });
        return;
      }
      pressed.call(this, ev);
    };
  })();

  // The seed a drawing is asked for with (drawItNow): the last one, drawn
  // again for its words; the last one, with blocks moved and the words the
  // same, so the moves still fit it; the one a save was drawn from, when
  // its moves are waiting to go back on; otherwise none, and it is shaken
  // afresh.  Laid out afresh on purpose, the same words keep their seed, so
  // the chart comes back as it was before anything was moved.
  function seedFor(again) {
    if (again) { return lastLaid.seed; }
    var fresh = freshAsked, same = el("#code") && el("#code").value === lastLaid.text;
    freshAsked = false;
    layingFresh = fresh;
    if (!byHand && same && (fresh || movesHeld())) { return lastLaid.seed; }
    if (pendingMoves && pendingMoves.seed) { return pendingMoves.seed; }
    return "";
  }

  // A drawing has landed (drawItNow): the moves that belong on it go on.
  function blocksLanded() {
    var fresh = layingFresh;
    layingFresh = false;
    freshAsked = false;
    if (byHand || !chart) { return; }
    var sign = chartSign(), seed = String(lastLaid.seed || "");
    function fits(moves) { return moves && moves.sign === sign && moves.seed === seed; }
    var want = !fresh && fits(blockMoves) ? blockMoves : fits(pendingMoves) ? pendingMoves : null;
    pendingMoves = null;
    blockMoves = want ? JSON.parse(JSON.stringify(want)) : null;
    if (movesHeld()) { putMoves(); }
  }

  // With blocks moved, the drawing that replaces this one is not glided
  // into from where its blocks were: it is put down, and the moves go
  // straight back on (blocksLanded).
  var putSheetMoved = putSheet;
  putSheet = function (svg, again) {
    putSheetMoved(svg, movesHeld() && !byHand ? false : again);
  };

  // ------------------------------------------------------- stepping back --
  // A move is one step, taken back and done again like any other.
  var undoableMoved = undoable;
  undoable = function () {
    var now = undoableMoved();
    if (now) { now.moves = movesNow(); }
    return now;
  };
  var stepBackMoved = stepBack;
  stepBack = function (forward) {
    var from = forward ? willBeLike : wasLike;
    var back = from[from.length - 1];
    stepBackMoved(forward);
    if (back && !byHand && chart) {
      blockMoves = back.moves ? JSON.parse(JSON.stringify(back.moves)) : null;
      if (blockMoves && blockMoves.sign !== chartSign()) { blockMoves = null; }
      putMoves();
    }
  };
