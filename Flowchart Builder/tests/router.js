// ---------------------------------------------------------------------------
//  router.js -- the by-hand arrow router, tried in every arrangement
//
//  Run by tests/run.py where node is installed.  The router itself is lifted
//  straight out of flowchart/ui/js/10-hand.js so there is only ever one of
//  is checked here is the code that actually runs.
// ---------------------------------------------------------------------------
var fs = require("fs"), path = require("path");
var src = fs.readFileSync(path.join(__dirname, "..", "flowchart", "ui", "js",
                                    "10-hand.js"), "utf8");
var from = src.indexOf("var STAND = 16;");
var to = src.indexOf("function drawHand()");
if (from < 0 || to < 0) {
  console.error("could not find the router in 10-hand.js");
  process.exit(1);
}
var hand = { nodes: [] };
eval(src.slice(from, to));                    // eslint-disable-line no-eval

var KINDS = ["rect", "roundrect", "oval", "io", "io_back", "diamond", "hex",
             "loop", "sub", "trap", "manual", "doc", "docs", "note", "card",
             "store", "stored", "delay", "screen", "circle", "offpage",
             "parallel", "cloud", "step", "cube", "table", "callout", "actor",
             "text", "arrow"];
var SIZES = [[170, 58], [90, 90], [200, 40], [70, 120]];
var TURNS = [0, 90, 180, 270];
var bad = [];

// ---- every shape can be left from all four sides ------------------------
(function () {
  var want = { below: "bottom", above: "top", right: "right", left: "left" };
  var spots = { below: [0, 190], above: [0, -190], right: [300, 0], left: [-300, 0] };
  function sideOf(n, p) {
    var t = turned(n);
    var l = t.x - t.w / 2, r = t.x + t.w / 2;
    var top = t.y - t.h / 2, b = t.y + t.h / 2;
    if (Math.abs(p[1] - top) < t.h * 0.3 && Math.abs(p[0] - t.x) < 1) return "top";
    if (Math.abs(p[1] - b) < t.h * 0.3 && Math.abs(p[0] - t.x) < 1) return "bottom";
    if (Math.abs(p[0] - l) < t.w * 0.25) return "left";
    if (Math.abs(p[0] - r) < t.w * 0.25) return "right";
    return "?";
  }
  var wrong = 0;
  KINDS.forEach(function (kind) {
    for (var where in spots) {
      var a = { id: 1, x: 400, y: 400, w: 170, h: 58, kind: kind, turn: 0 };
      var b = { id: 2, x: 400 + spots[where][0], y: 400 + spots[where][1],
                w: 170, h: 58, kind: "rect", turn: 0 };
      hand.nodes = [a, b];
      if (sideOf(a, linkPath(a, b)[0]) !== want[where]) { wrong++; }
    }
  });
  if (wrong) { bad.push(wrong + " shape sides unreachable"); }
  console.log("all four sides on all " + KINDS.length + " shapes: " +
              (wrong ? wrong + " wrong" : "ok"));
})();

// ---- no line cuts through a shape, and every end is on a side's middle --
(function () {
  function middled(n, p) {
    var t = turned(n);
    var l = t.x - t.w / 2, r = t.x + t.w / 2;
    var onSide = Math.abs(p[0] - l) < t.w * 0.25 || Math.abs(p[0] - r) < t.w * 0.25;
    return onSide ? Math.abs(p[1] - t.y) < 1.5 : Math.abs(p[0] - t.x) < 1.5;
  }
  var tried = 0, through = 0, off = 0;
  for (var si = 0; si < SIZES.length; si++)
  for (var ti = 0; ti < TURNS.length; ti++)
  for (var dx = -300; dx <= 300; dx += 20)
  for (var dy = -300; dy <= 300; dy += 20) {
    if (dx === 0 && dy === 0) continue;
    var a = { id: 1, x: 400, y: 400, w: SIZES[si][0], h: SIZES[si][1],
              kind: "rect", turn: TURNS[ti] };
    var b = { id: 2, x: 400 + dx, y: 400 + dy, w: 170, h: 58, kind: "rect", turn: 0 };
    var ta = turned(a), tb = turned(b);
    if (Math.abs(dx) < (ta.w + tb.w) / 2 && Math.abs(dy) < (ta.h + tb.h) / 2) continue;
    var c = { id: 3, x: 400 + dx / 2, y: 400 + dy / 2, w: 120, h: 44,
              kind: "rect", turn: 0 };          // something in the way
    hand.nodes = [a, b, c];
    var pts = linkPath(a, b);
    tried++;
    var hit = false;
    hand.nodes.forEach(function (n) {
      if (n.id === 1 || n.id === 2) {
        if (pts.length > 3 && cutsThrough(pts, n, 2, pts.length - 2)) hit = true;
      } else if (cutsThrough(pts, n)) { hit = true; }
    });
    if (hit) through++;
    if (!middled(a, pts[0]) || !middled(b, pts[pts.length - 1])) off++;
  }
  if (through) bad.push(through + " lines cut through a shape");
  if (off) bad.push(off + " line ends off a side's middle");
  console.log(tried + " arrangements: " + through + " through a shape, " +
              off + " ends off center");
})();

// ---- the word on an arrow stays off every shape, where there is room ----
// A decision joined to each kind of shape, on each side of it, at gaps from
// barely wider than the word to plenty; and the same with a box standing
// right over the middle of the arrow, where the word would go first.  Shapes
// are drawn over the arrows, so a word that reaches into one is cut off.
(function () {
  var tried = 0, into = 0;
  [12.5, 20.8].forEach(function (SIZE) {      // the plain size, and 20 points
    var big = SIZE / 12.5;
    var WORDS = [18 * big, 34 * big, 60 * big];  // "No", "False", a long one
    function spotFor(nodes, a, b, wide) {
      hand.nodes = nodes;
      var pts = linkPath(a, b);
      var tip = pts[pts.length - 1], back = pts[pts.length - 2];
      var run = Math.hypot(tip[0] - back[0], tip[1] - back[1]) || 1;
      var heads = [[tip, [tip[0] - (tip[0] - back[0]) / run * 10,
                          tip[1] - (tip[1] - back[1]) / run * 10]]];
      return labelPlace(pts, wide, SIZE, 0, labelKeep([pts], heads, 0, 0, 3000, 3000));
    }
    KINDS.forEach(function (kind) {
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (way) {
        [0, 10, 30, 80].forEach(function (spare) {
          WORDS.forEach(function (wide) {
            var a = { id: 1, x: 1000, y: 1000, w: 190, h: 84, kind: "diamond", turn: 0 };
            var gap = way[0] ? wide + 2 * LABEL_ROOM + 2 + spare : 40 + spare;
            var b = { id: 2, kind: kind, turn: 0, w: 170, h: 58,
                      x: 1000 + way[0] * (95 + gap + 85),
                      y: 1000 + way[1] * (42 + gap + 29) };
            tried++;
            if (spotFor([a, b], a, b, wide).near < LABEL_ROOM - 0.01) { into++; }
            // and with a box standing over the middle of the arrow
            var over = { id: 3, kind: "rect", turn: 0, w: 120, h: 44,
                         x: (a.x + b.x) / 2 + (way[0] ? 0 : 75),
                         y: (a.y + b.y) / 2 - (way[0] ? 30 : 0) };
            if (spare < 30) { return; }
            tried++;
            if (spotFor([a, b, over], a, b, wide).near < LABEL_ROOM - 0.01) { into++; }
          });
        });
      });
    });
    // An answer going sideways to a shape only 20 across the paper from the
    // decision: shorter than the word.  There is room over the shoulder of
    // the diamond, and none in the shape it points at.
    KINDS.forEach(function (kind) {
      [1, -1].forEach(function (way) {
        [18 * big, 34 * big].forEach(function (wide) {
          var a = { id: 1, x: 1000, y: 1000, w: 190, h: 84, kind: "diamond", turn: 0 };
          var b = { id: 2, kind: kind, turn: 0, w: 170, h: 58,
                    x: 1000 + way * (95 + 20 + 85), y: 1000 };
          tried++;
          if (spotFor([a, b], a, b, wide).near < LABEL_ROOM - 0.01) { into++; }
        });
      });
    });
  });
  if (into) { bad.push(into + " words on arrows run into a shape"); }
  console.log(tried + " words on arrows: " + into + " into a shape");
})();

// ---- and it is quick enough to redraw while a shape is being dragged ----
(function () {
  hand.nodes = [];
  for (var i = 0; i < 40; i++) {
    hand.nodes.push({ id: i + 1, kind: "rect", turn: 0,
                      x: 150 + (i % 5) * 230, y: 120 + Math.floor(i / 5) * 150,
                      w: 170, h: 58 });
  }
  var began = process.hrtime.bigint();
  for (var pass = 0; pass < 20; pass++) {
    for (var j = 0; j < hand.nodes.length - 1; j++) {
      linkPath(hand.nodes[j], hand.nodes[j + 1]);
    }
  }
  var ms = Number(process.hrtime.bigint() - began) / 1e6 / 20;
  if (ms > 12) bad.push("routing 39 arrows takes " + ms.toFixed(1) + "ms");
  console.log("39 arrows across 40 shapes: " + ms.toFixed(2) + "ms");

  // and a word on every one of them, with the shapes packed so tight that
  // no word has anywhere clear to go: every spot there is gets tried, which
  // is the most that finding one can ever cost
  hand.nodes.forEach(function (n, k) {
    n.x = 100 + (k % 5) * 180;
    n.y = 60 + Math.floor(k / 5) * 70;
  });
  var routes = [];
  for (var r = 0; r < hand.nodes.length - 1; r++) {
    routes.push(linkPath(hand.nodes[r], hand.nodes[r + 1]));
  }
  var tips = routes.map(function (pts) {
    var tip = pts[pts.length - 1], back = pts[pts.length - 2];
    var run = Math.hypot(tip[0] - back[0], tip[1] - back[1]) || 1;
    return [tip, [tip[0] - (tip[0] - back[0]) / run * 10,
                  tip[1] - (tip[1] - back[1]) / run * 10]];
  });
  began = process.hrtime.bigint();
  for (pass = 0; pass < 10; pass++) {
    var keep = labelKeep(routes, tips, 0, 0, 3000, 3000);
    routes.forEach(function (pts) { labelPlace(pts, 60, 12.5, 0, keep); });
  }
  ms = Number(process.hrtime.bigint() - began) / 1e6 / 10;
  if (ms > 60) bad.push("placing 39 words takes " + ms.toFixed(1) + "ms");
  console.log("39 words with nowhere clear to go: " + ms.toFixed(2) + "ms");
})();

// ---- an arrow drawn from one dot to another keeps those two sides ------
// Every pair of sides, to a shape anywhere round the one it leaves: it
// leaves by the side it was drawn from and comes in by the side it was
// drawn to, stands a stand-off clear of each before it turns, never runs
// out and straight back over its own shape, and never goes diagonal.
(function () {
  function sideAt(n, p) {
    var ps = ports(n);
    for (var i = 0; i < 4; i++) {
      if (Math.abs(ps[i].x - p[0]) < 0.6 && Math.abs(ps[i].y - p[1]) < 0.6) return i;
    }
    return -1;
  }
  var tried = 0, wrong = 0, back = 0, through = 0, slant = 0;
  for (var fi = 0; fi < 4; fi++)
  for (var ti = 0; ti < 4; ti++)
  for (var dx = -400; dx <= 400; dx += 50)
  for (var dy = -300; dy <= 300; dy += 50) {
    if (Math.abs(dx) < 180 && Math.abs(dy) < 70) continue;
    var a = { id: 1, x: 500, y: 500, w: 170, h: 58, kind: "rect", turn: 0 };
    var b = { id: 2, x: 500 + dx, y: 500 + dy, w: 170, h: 58, kind: "rect", turn: 0 };
    hand.nodes = [a, b];
    var pts = linkPath(a, b, { fromSide: PORT_SIDES[fi], toSide: PORT_SIDES[ti] }, {});
    tried++;
    if (sideAt(a, pts[0]) !== fi || sideAt(b, pts[pts.length - 1]) !== ti) wrong++;
    if (!outward(pts, ports(a)[fi], ports(b)[ti], true, true)) back++;
    if (pts.length > 3 && (cutsThrough(pts, a, 2, pts.length - 2) ||
                           cutsThrough(pts, b, 2, pts.length - 2))) through++;
    for (var i = 1; i < pts.length; i++) {
      if (Math.abs(pts[i][0] - pts[i - 1][0]) > 0.5 &&
          Math.abs(pts[i][1] - pts[i - 1][1]) > 0.5) { slant++; break; }
    }
  }
  if (wrong) bad.push(wrong + " kept arrows on the wrong side");
  if (back) bad.push(back + " kept arrows doubling back or hugging their side");
  if (through) bad.push(through + " kept arrows through their own shapes");
  if (slant) bad.push(slant + " kept arrows with a diagonal in them");
  console.log(tried + " kept arrows: " + wrong + " on the wrong side, " + back +
              " doubling back, " + through + " through their own shapes");
})();

// ---- and an arrow left to find its own way keeps off a side in use -----
// Two answers out of one decision, to two boxes below it: the second does
// not come out of the foot the first is already using, and one pinned to
// the foot on purpose moves the other one off it.
(function () {
  var d = { id: 1, x: 500, y: 200, w: 190, h: 84, kind: "diamond", turn: 0 };
  var yes = { id: 2, x: 400, y: 420, w: 170, h: 58, kind: "rect", turn: 0 };
  var no = { id: 3, x: 640, y: 420, w: 170, h: 58, kind: "rect", turn: 0 };
  // routeAll looks the shapes up by number, the way the page does
  global.nodeById = function (id) {
    return hand.nodes.filter(function (n) { return n.id === id; })[0] || null;
  };
  hand.nodes = [d, yes, no];
  hand.links = [{ from: 1, to: 3 }, { from: 1, to: 2 }];
  var free = routeAll();
  hand.links = [{ from: 1, to: 3 }, { from: 1, to: 2, fromSide: "foot", pin: true }];
  var kept = routeAll();
  hand.links = [];
  var ok = free[0].sides[0] !== free[1].sides[0] &&
           kept[1].sides[0] === 1 && kept[0].sides[0] !== 1;
  if (!ok) bad.push("two arrows out of one decision share a side");
  console.log("two answers out of one decision: " + PORT_SIDES[free[0].sides[0]] +
              " and " + PORT_SIDES[free[1].sides[0]] + "; with the foot kept, " +
              PORT_SIDES[kept[0].sides[0]] + " and " + PORT_SIDES[kept[1].sides[0]]);
})();

// ---- the sides an arrow was drawn between are where it leans, not a rule --
// Drawn out of the right of a box to one below and to the right, it keeps
// to the right while nothing is the worse for it.  Two drawn out of the one
// dot do not run down one line: one of them moves.  And moved round to the
// other side, the shape it points at is not reached the long way round.
(function () {
  function box(id, x, y) { return { id: id, x: x, y: y, w: 170, h: 58, kind: "rect", turn: 0 }; }
  var a = box(1, 400, 200), b = box(2, 700, 400), c = box(3, 100, 400);
  hand.nodes = [a, b, c];
  hand.links = [{ from: 1, to: 2, fromSide: "right" }];
  var leant = routeAll()[0].sides[0] === 3;
  hand.links = [{ from: 1, to: 2, fromSide: "foot" }, { from: 1, to: 3, fromSide: "foot" }];
  var two = routeAll();
  // off different sides, or off the one side at two points of it
  var parted = two[0].sides[0] !== two[1].sides[0] ||
               Math.abs(two[0][0][0] - two[1][0][0]) > 8;
  // drawn out of the right to b, then b carried round to the far left
  b.x = 60; b.y = 200; c.x = 400; c.y = 500;
  hand.links = [{ from: 1, to: 2, fromSide: "right", toSide: "left" }];
  var moved = routeAll()[0];
  var near = moved.sides[0] === 2 && moved.sides[1] === 3;
  hand.links = [];
  if (!leant) bad.push("an arrow drawn out of the right did not keep to it");
  if (!parted) bad.push("two arrows drawn from one dot still share it");
  if (!near) bad.push("an arrow went the long way round to keep its drawn sides");
  console.log("drawn sides leant on: " + (leant ? "kept" : "lost") + " while free, " +
              (parted ? "parted" : "shared") + " when two share a dot, " +
              (near ? "given up" : "kept") + " when the shape moves round");
})();

// ---- arrows at one side of a shape meet it apart, and in order -----------
// Three small boxes over one wide one, each joined to it: the three come
// straight down into its top, at three points, left to right as the boxes
// stand, and none lies on another -- in either direction, out of the top
// of the wide one as well as into it.
(function () {
  var tried = 0, wrong = 0;
  [false, true].forEach(function (up) {
    var wide = { id: 9, x: 500, y: 460, w: 600, h: 58, kind: "rect", turn: 0 };
    hand.nodes = [{ id: 1, x: 360, y: 200, w: 80, h: 40, kind: "rect", turn: 0 },
                  { id: 2, x: 500, y: 200, w: 80, h: 40, kind: "rect", turn: 0 },
                  { id: 3, x: 640, y: 200, w: 80, h: 40, kind: "rect", turn: 0 }, wide];
    hand.links = [2, 1, 3].map(function (id) {
      return up ? { from: 9, to: id } : { from: id, to: 9 };
    });
    var routes = routeAll();
    tried++;
    var tips = routes.map(function (pts) { return up ? pts[0] : pts[pts.length - 1]; });
    var top = routes.every(function (pts) { return pts.sides[up ? 0 : 1] === 0; });
    var order = tips[1][0] < tips[0][0] && tips[0][0] < tips[2][0];
    var onIt = tips.every(function (p) { return Math.abs(p[1] - (wide.y - wide.h / 2)) < 0.6; });
    var ways = {}, over = 0;
    routes.forEach(function (pts) { over += overlapsIn(pts, ways); waysAdd(ways, pts); });
    if (!(top && order && onIt && !over)) { wrong++; }
  });
  hand.links = [];
  if (wrong) bad.push(wrong + " of " + tried + " wide boxes took three arrows at one point");
  console.log("three arrows at one side of a box, both ways: " +
              (wrong ? wrong + " wrong" : "apart, in order"));

  // and moved along a diamond's slopes or an oval's curve, a meeting point
  // is still on the outline, on all four sides
  var off = 0;
  ["diamond", "oval"].forEach(function (kind) {
    var n = { id: 1, x: 300, y: 300, w: 190, h: 84, kind: kind, turn: 0 };
    for (var side = 0; side < 4; side++) {
      var room = spreadRoom(n, side);
      [-room, -room / 2, room / 2, room].forEach(function (by) {
        var p = portAlong(n, side, by);
        var u = (p.x - n.x) / (n.w / 2), v = (p.y - n.y) / (n.h / 2);
        var on = kind === "diamond" ? Math.abs(u) + Math.abs(v) : Math.hypot(u, v);
        if (Math.abs(on - 1) > 0.01) { off++; }
      });
    }
  });
  if (off) bad.push(off + " spread meeting points off the outline");
  console.log("spread meeting points on a diamond and an oval: " + off + " off the outline");
})();

// ---- no arrow lies along another where it has room not to ----------------
// Two arrows crossing the same gap between two rows, their spans side by
// side: the halfway line through the gap is where both would go.
(function () {
  function box(id, x, y) { return { id: id, x: x, y: y, w: 170, h: 58, kind: "rect", turn: 0 }; }
  var tried = 0, lying = 0;
  // each of these, routed as if the other arrow were not there, lies along it
  [[100, 400, 500, 200], [100, 600, 700, 100], [100, 500, 400, 200]].forEach(function (xs) {
    hand.nodes = [box(1, xs[0], 150), box(2, xs[1], 400), box(3, xs[2], 150), box(4, xs[3], 400)];
    hand.links = [{ from: 1, to: 2 }, { from: 3, to: 4 }];
    var routes = routeAll();
    var ways = {};
    waysAdd(ways, routes[0]);
    tried++;
    if (overlapsIn(routes[1], ways)) { lying++; }
  });
  hand.links = [];
  if (lying) bad.push(lying + " of " + tried + " arrows lie along another");
  console.log(tried + " pairs of arrows across one gap: " + lying + " lying along each other");
})();

if (bad.length) {
  console.error(bad.join("; "));
  process.exit(1);
}
