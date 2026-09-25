// ---------------------------------------------------------------------------
//  13-hand-apart.js -- shapes kept off one another
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A shape on top of another was something the check found afterwards and
  // offered to put right (p_overlap, 12-check.js).  Now it does not happen:
  // a shape carried into another slides along it instead, a new or pasted
  // one lands on the nearest clear place, one that grows or turns into its
  // neighbor has the neighbor make room, and a corner pulled into another
  // shape stops there.  A design saved from before, with shapes on top of
  // each other, is left as it was until one of them is moved.
  var SHAPE_GAP = HAND_GRID;             // the least room left between two

  // The shape this one would be on top of, standing at x, y -- by the boxes
  // they take up once turned -- leaving out `skip`, the ids going with it.
  function onTopOf(node, x, y, skip) {
    var a = turned(node);
    for (var i = 0; i < hand.nodes.length; i++) {
      var m = hand.nodes[i];
      if (m === node || (skip && skip.indexOf(m.id) >= 0)) { continue; }
      var b = turned(m);
      if (Math.abs(m.x - x) * 2 < a.w + b.w + SHAPE_GAP * 2 &&
          Math.abs(m.y - y) * 2 < a.h + b.h + SHAPE_GAP * 2) { return m; }
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

  // Carried: `want` is where it is being taken, `last` where it stood a
  // moment ago, and `hits(x, y)` whether it would be on top of something
  // there.  Clear, it goes.  In the way, it goes as far as it can the way
  // it is mostly going, then as far as it can the other way -- which slides
  // it along whatever is in the way, right up against it.  Taken on past,
  // it is on the far side as soon as there is room there.  On top of
  // something already when it was taken hold of, it goes anywhere.
  function slideClear(want, last, hits) {
    if (!hits(want.x, want.y) || hits(last.x, last.y)) { return want; }
    var at = { x: last.x, y: last.y };
    function reach(axis) {
      var to = want[axis], step = HAND_GRID;
      while (at[axis] !== to) {
        var next = at[axis] + Math.max(-step, Math.min(step, to - at[axis]));
        var tryX = axis === "x" ? next : at.x, tryY = axis === "y" ? next : at.y;
        if (hits(tryX, tryY)) { return; }
        at[axis] = next;
      }
    }
    var across = Math.abs(want.x - last.x) >= Math.abs(want.y - last.y);
    reach(across ? "x" : "y");
    reach(across ? "y" : "x");
    return at;
  }

  // Moved, as one, to the nearest place where none of `ids` is on top of
  // anything else -- looked for in rings round where they are, down and to
  // the right first, the way a chart is read, and never up off the paper.
  // Nothing is moved if they are clear already.
  function moveClear(ids) {
    var lot = ids.map(nodeById).filter(Boolean);
    function hits(bx, by) {
      return lot.some(function (n) {
        return n.y + by - turned(n).h / 2 < 20 || !!onTopOf(n, n.x + bx, n.y + by, ids);
      });
    }
    if (!lot.length || !hits(0, 0)) { return; }
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
    var p = turned(a), q = turned(b);
    return Math.abs(a.x - b.x) * 2 < p.w + q.w && Math.abs(a.y - b.y) * 2 < p.h + q.h;
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
