// ---------------------------------------------------------------------------
//  13-hand-apart.js -- shapes kept off one another
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A shape on top of another was something the check found afterwards and
  // offered to put right (p_overlap, 12-check.js).  Now it does not happen:
  // a shape carried over others is free to pass over them, and let go on
  // top of one it settles on the nearest clear place; a new or pasted one
  // lands on the nearest clear place too, one that grows or turns into its
  // neighbor has the neighbor make room, and a corner pulled into another
  // shape stops there.  Turned, a shape is as big as its turned outline --
  // not the upright box round it.  A design saved from before, with shapes on top of
  // each other, is left as it was until one of them is moved.
  var SHAPE_GAP = HAND_GRID;             // the least room left between two

  // Whether two shapes, standing at (ax, ay) and (bx, by), come within `gap`
  // of each other (a gap below nought lets them touch that much).  By each
  // shape's own box, turned the way the shape is turned -- not by the
  // upright box round it, which for a shape at a slant is a good deal
  // bigger.  Asked by the upright box, a neighbour made room for a shape
  // turned towards it by the width of that box rather than by the shape,
  // and came to rest with a corner of the turned one still across it.
  function boxesMeet(a, ax, ay, b, bx, by, gap) {
    // A room and the pieces of a floor plan stand on one another the way
    // they do in a house -- a chair half under a table, a door in a wall,
    // the lot on the floor of a room -- so nothing is pushed off them and
    // they push nothing (isLoose, 03-icons.js).
    if (isLoose(a.kind) || isLoose(b.kind)) { return false; }
    var p = turned(a), q = turned(b);
    // Clear even of the boxes round them: nothing more to ask.
    if (Math.abs(ax - bx) * 2 >= p.w + q.w + gap * 2 ||
        Math.abs(ay - by) * 2 >= p.h + q.h + gap * 2) { return false; }
    if (!p.slant && !q.slant) { return true; }   // upright, or a quarter round: the boxes are the shapes
    var A = boxCorners(a, ax, ay, gap / 2), B = boxCorners(b, bx, by, gap / 2);
    // Two turned boxes are apart when some side of one has the whole of the
    // other beyond it -- looked for along each side of each.
    return ![A, B].some(function (box) {
      return box.some(function (p0, i) {
        var p1 = box[(i + 1) % 4], nx = p0[1] - p1[1], ny = p1[0] - p0[0];
        function span(pts) {
          var lo = Infinity, hi = -Infinity;
          pts.forEach(function (pt) {
            var v = pt[0] * nx + pt[1] * ny;
            lo = Math.min(lo, v); hi = Math.max(hi, v);
          });
          return [lo, hi];
        }
        var sa = span(A), sb = span(B);
        return sa[1] <= sb[0] || sb[1] <= sa[0];
      });
    });
  }

  // A shape's box, standing at x, y and grown by `grow` all round, turned.
  function boxCorners(n, x, y, grow) {
    var t = (n.turn || 0) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
    var hw = n.w / 2 + grow, hh = n.h / 2 + grow;
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(function (k) {
      return [x + k[0] * c - k[1] * s, y + k[0] * s + k[1] * c];
    });
  }

  // The shape this one would be on top of, standing at x, y -- leaving out
  // `skip`, the ids going with it -- or nearer to than `gap` (SHAPE_GAP).
  function onTopOf(node, x, y, skip, gap) {
    for (var i = 0; i < hand.nodes.length; i++) {
      var m = hand.nodes[i];
      if (m === node || (skip && skip.indexOf(m.id) >= 0)) { continue; }
      if (boxesMeet(node, x, y, m, m.x, m.y, gap === undefined ? SHAPE_GAP : gap)) { return m; }
    }
    return null;
  }

  // Whether it was on top of something at the size and place in `was`.
  function overlaps(node, was) {
    var now = { w: node.w, h: node.h, x: node.x, y: node.y };
    node.w = was.w; node.h = was.h;
    var hit = onTopOf(node, was.x, was.y);
    node.w = now.w; node.h = now.h;
    return !!hit;
  }

  // Let go of: `ids` moved together, as little as they can be, to where
  // none of them is on top of anything else, or up off the paper.  Nothing
  // moves when they are clear already.  The places are looked at on the
  // grid, square ring by square ring round where they were let go, the
  // nearest first; a ring is only worth looking at while it could still
  // hold somewhere nearer than the best found.  So a shape dropped mostly
  // below another comes to rest below it, and one dropped mostly to its
  // side, beside it.  (Carried, they had gone over anything in the way:
  // stopping a shape at every other it met made it hard to take anywhere.)
  // Moved, they are given the room a shape put right is (CLEAR, 12-check.js)
  // rather than left touching what they were on.
  function settleClear(ids) {
    var lot = ids.map(nodeById).filter(Boolean), gap = SHAPE_GAP, near = shapesNear(ids);
    function hits(bx, by) {
      return lot.some(function (n) {
        return n.y + by - turned(n).h / 2 < 20 || near.meets(n, n.x + bx, n.y + by, gap);
      });
    }
    if (!lot.length || !hits(0, 0)) { return false; }
    gap = CLEAR;
    var step = HAND_GRID, best = null, bestD = Infinity;
    for (var r = 1; r <= 160 && r * step < bestD; r++) {
      for (var i = -r; i <= r; i++) {
        // the four sides of the ring, each place once
        var ring = [[i, -r], [i, r]];
        if (i > -r && i < r) { ring.push([-r, i], [r, i]); }
        for (var k = 0; k < ring.length; k++) {
          var bx = ring[k][0] * step, by = ring[k][1] * step, d = Math.hypot(bx, by);
          // level: down, then right, the way a chart is read
          if (d > bestD || (d === bestD && (by < best.y || (by === best.y && bx < best.x)))) { continue; }
          if (!hits(bx, by)) { best = { x: bx, y: by }; bestD = d; }
        }
      }
    }
    if (!best) { return false; }
    lot.forEach(function (n) { n.x += best.x; n.y += best.y; });
    return true;
  }

  // Moved, as one, to the nearest place where none of `ids` is on top of
  // anything else -- looked for in rings round where they are, down and to
  // the right first, the way a chart is read, and never up off the paper.
  // Nothing is moved if they are clear already.  With nowhere clear that
  // near -- a big copy pasted into a crowded chart -- they go below
  // everything, where nothing is: left where they were, copy after copy
  // was piled on the one before, and the check had thousands of shapes on
  // top of each other to list.  Given a way -- a step [x, y] -- they go
  // on along it, step after step, till they are clear: copies pasted in a
  // row stay in the row, rather than each going wherever was nearest.
  function moveClear(ids, way) {
    var lot = ids.map(nodeById).filter(Boolean), near = shapesNear(ids);
    function hits(bx, by) {
      return lot.some(function (n) {
        return n.y + by - turned(n).h / 2 < 20 || near.meets(n, n.x + bx, n.y + by, SHAPE_GAP);
      });
    }
    if (!lot.length || !hits(0, 0)) { return; }
    if (way && (way[0] || way[1])) {
      for (var w = 1; w <= 200; w++) {
        if (!hits(way[0] * w, way[1] * w)) {
          lot.forEach(function (n) { n.x += way[0] * w; n.y += way[1] * w; });
          return;
        }
      }
    }
    var step = HAND_GRID * 4;
    var ways = [[0, 1], [1, 0], [1, 1], [-1, 0], [0, -1], [-1, 1], [1, -1], [-1, -1]];
    for (var r = 1; r <= 80; r++) {
      for (var k = 0; k < ways.length; k++) {
        var bx = ways[k][0] * r * step, by = ways[k][1] * r * step;
        if (!hits(bx, by)) {
          lot.forEach(function (n) { n.x += bx; n.y += by; });
          return;
        }
      }
    }
    var floor = -Infinity, top = Infinity;
    near.others.forEach(function (m) { floor = Math.max(floor, m.y + turned(m).h / 2); });
    lot.forEach(function (n) { top = Math.min(top, n.y - turned(n).h / 2); });
    var down = Math.max(floor + CLEAR * 2 - top, 20 - top);
    lot.forEach(function (n) { n.y += Math.ceil(down / HAND_GRID) * HAND_GRID; });
  }

  // ------------------------------------------------ making room as it turns --
  // A shape being turned has its neighbours step aside as it comes round
  // to them, and step back as it turns away again -- rather than going
  // through them until it is let go.  Each keeps the room it had from the
  // turning shape when the turn began (up to CLEAR), moved straight away
  // from it: up or down from it if it is above or below, out to the side
  // if it is beside.  Asked for every step of the turn, from where they all
  // stood when it began, so nothing drifts.  A shape pushed onto a third is
  // left for keepApart once the turn is let go.
  function roomToTurn(node) {
    var p = turned(node);
    var near = hand.nodes.filter(function (m) { return m !== node; }).map(function (m) {
      var room = -1;
      for (var g = CLEAR; g >= 0; g -= HAND_GRID) {
        if (!boxesMeet(node, node.x, node.y, m, m.x, m.y, g)) { room = g; break; }
      }
      var q = turned(m), dx = m.x - node.x, dy = m.y - node.y;
      var side = Math.abs(dx) / (p.w + q.w) > Math.abs(dy) / (p.h + q.h);
      return { n: m, x: m.x, y: m.y, room: room,
               ax: side ? (dx < 0 ? -1 : 1) : 0, ay: side ? 0 : (dy < 0 ? -1 : 1) };
    }).filter(function (o) { return o.room >= 0; });   // on top of it already: left be
    return function () {
      near.forEach(function (o) {
        o.n.x = o.x; o.n.y = o.y;
        for (var d = 0; d <= 800; d += HAND_GRID) {
          var x = o.x + o.ax * d, y = o.y + o.ay * d;
          if (y - turned(o.n).h / 2 < 20) { break; }   // not up off the paper
          if (!boxesMeet(node, node.x, node.y, o.n, x, y, o.room)) {
            o.n.x = x; o.n.y = y;
            break;
          }
        }
      });
    };
  }

  // ------------------------------------------------- making room after --
  // Whatever else changes a shape -- its words typed, made bigger or
  // bolder, turned, lined up with others, sized in the panel -- is seen
  // here, when the drawing is next drawn: each shape's box is remembered,
  // and one whose box has changed since and is now on top of another has
  // the other make room, moved to the nearest place clear of everything.
  // Two that both changed: the one not taken up moves, or else the later.
  // The boxes are remembered against the shapes themselves, so a design
  // opened, or stepped back to, is a new set of shapes and nothing in it
  // is moved -- only what is changed from then on.
  var boxWas = typeof WeakMap === "function" ? new WeakMap() : null;

  function boxSign(n) {
    var t = turned(n);
    return n.x + "," + n.y + "," + t.w + "," + t.h;
  }

  function onTopNow(a, b) {
    return boxesMeet(a, a.x, a.y, b, b.x, b.y, 0);
  }

  function keepApart() {
    if (!boxWas || shapeCarried || turning) { return; }
    var changed = [];
    hand.nodes.forEach(function (n) {
      measure(n);
      var was = boxWas.get(n);
      if (was !== undefined && was !== boxSign(n)) { changed.push(n); }
    });
    var taken = takenIds();
    changed.forEach(function (c) {
      hand.nodes.forEach(function (m) {
        if (m === c || !onTopNow(c, m)) { return; }
        var mover = m;
        if (changed.indexOf(m) >= 0) {
          var cIn = taken.indexOf(c.id) >= 0, mIn = taken.indexOf(m.id) >= 0;
          mover = cIn !== mIn ? (cIn ? m : c) : (c.id > m.id ? c : m);
        }
        var spot = freeSpot(mover, 40);     // 12-check.js, with room round it
        if (spot) { mover.x = spot.x; mover.y = spot.y; }
      });
    });
    hand.nodes.forEach(function (n) { boxWas.set(n, boxSign(n)); });
  }
