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
// And what the router asks of the shapes themselves: where an arrow's shaft
// is, and where a person's hands are (03-shapes.js), in words the size a
// shape's words are drawn.
var parts = fs.readFileSync(path.join(__dirname, "..", "flowchart", "ui", "js",
                                      "03-shapes.js"), "utf8");
var partsFrom = parts.indexOf("// ------------------------------------------" +
                              "--- shapes with parts to them --");
var partsTo = parts.indexOf("function keyMark(");
if (partsFrom < 0 || partsTo < 0) {
  console.error("could not find the shapes' parts in 03-shapes.js");
  process.exit(1);
}
eval(parts.slice(partsFrom, partsTo));        // eslint-disable-line no-eval
function handType() { return { size: 12.5, line: 15 }; }
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
  // Which of its own sides the line left from, asked of the shape rather
  // than guessed from the box round it: a person's sides are its hands,
  // well inside the box, which is the only place there is anything to meet.
  function sideOf(n, p) {
    var names = ["top", "bottom", "left", "right"];
    for (var side = 0; side < 4; side++) {
      if (onSideAt(n, side, p)) return names[side];
    }
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

// Whether a line cuts through a shape, its own two included: the leg that
// leaves a shape is let off for that shape, and the leg that arrives at one
// for that one -- and for no other.  Letting the first leg off for both let
// a line leave a box straight down through the End it was going to.
function throughAny(pts, a, b) {
  return hand.nodes.some(function (n) {
    var first = n.id === a.id ? 2 : 1;
    var last = n.id === b.id ? pts.length - 2 : pts.length - 1;
    return first <= last && cutsThrough(pts, n, first, last);
  });
}

// Whether a point is on side `side` of a shape, within the stretch of it an
// arrow may meet: the middle, or along it as far as spreadRoom allows (a
// straight line across to a shape set to one side meets it off the middle).
function onSideAt(n, side, p) {
  // Along the side from its own dot, as portAlong measures it -- which is
  // the middle of the side on every shape but a person, whose sides are
  // its hands.
  var mid = ports(n)[side], room = Math.max(0, spreadRoom(n, side));
  var off = side < 2 ? p[0] - mid.x : p[1] - mid.y;
  if (Math.abs(off) > room + 0.6) return false;
  var q = portAlong(n, side, off);
  return Math.abs(q.x - p[0]) < 0.6 && Math.abs(q.y - p[1]) < 0.6;
}

// ---- no line cuts through a shape, and every end is on one of its sides --
(function () {
  function middled(n, p, side) { return onSideAt(n, side, p); }
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
    if (throughAny(pts, a, b)) through++;
    if (!middled(a, pts[0], pts.sides[0]) ||
        !middled(b, pts[pts.length - 1], pts.sides[1])) off++;
  }
  if (through) bad.push(through + " lines cut through a shape");
  if (off) bad.push(off + " line ends off their sides");
  console.log(tried + " arrangements: " + through + " through a shape, " +
              off + " ends off their sides");
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
    for (var i = 0; i < 4; i++) {
      if (onSideAt(n, i, p)) return i;
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
    if (throughAny(pts, a, b)) through++;
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

// ---- two arrows into one side come in without crossing ------------------
// A Start and an End stacked below and to the right of a box, both joined
// to its foot -- free, leaning to the foot, and pinned to it.  The lower
// arrow used to go the long way round and cross the other twice: before
// the two were spread along the foot, it was taken to be lying along the
// other one.  It goes straight across and up now, in one bend.
(function () {
  function shape(id, kind, x, y, w, h) {
    return { id: id, x: x, y: y, w: w, h: h, kind: kind, turn: 0 };
  }
  // runs of one route through runs of the other, part way along both
  function crossings(one, two) {
    var n = 0;
    for (var i = 1; i < one.length; i++) {
      for (var j = 1; j < two.length; j++) {
        var s = [one[i - 1], one[i]], t = [two[j - 1], two[j]];
        var sFlat = Math.abs(s[0][1] - s[1][1]) < 0.5, tFlat = Math.abs(t[0][1] - t[1][1]) < 0.5;
        if (sFlat === tFlat) continue;
        var h = sFlat ? s : t, v = sFlat ? t : s, x = v[0][0], y = h[0][1];
        if (x > Math.min(h[0][0], h[1][0]) + 1 && x < Math.max(h[0][0], h[1][0]) - 1 &&
            y > Math.min(v[0][1], v[1][1]) + 1 && y < Math.max(v[0][1], v[1][1]) - 1) n++;
      }
    }
    return n;
  }
  hand.nodes = [shape(1, "rect", 260, 100, 170, 60), shape(2, "oval", 375, 210, 130, 50),
                shape(3, "oval", 375, 305, 130, 50)];
  var ways = [[{}, {}], [{ toSide: "foot" }, { toSide: "foot" }],
              [{ fromSide: "top", toSide: "foot", pin: true },
               { fromSide: "left", toSide: "foot", pin: true }]];
  var crossed = 0, roundabout = 0;
  ways.forEach(function (sides) {
    hand.links = [Object.assign({ from: 2, to: 1 }, sides[0]),
                  Object.assign({ from: 3, to: 1 }, sides[1])];
    var routes = routeAll();
    crossed += crossings(routes[0], routes[1]);
    if (routes[1].length > 3) roundabout++;
  });
  hand.links = [];
  if (crossed) bad.push(crossed + " crossings between two arrows into one foot");
  if (roundabout) bad.push(roundabout + " of " + ways.length + " arrows went the long way round");
  console.log("two arrows into one foot, " + ways.length + " ways: " + crossed + " crossings, " +
              roundabout + " the long way round");
})();

// ---- an arrowhead has a run to sit on ------------------------------------
// A Start just left of a box and below it, joined to it -- free, drawn from
// the Start's top to the box's left, and pinned there.  The run into the
// box used to be five long, and the head, ten long, hung back past the
// corner with the line running up into its side.
(function () {
  var box = { id: 1, x: 400, y: 100, w: 170, h: 60, kind: "rect", turn: 0 };
  var start = { id: 2, x: 310, y: 225, w: 130, h: 50, kind: "oval", turn: 0 };
  hand.nodes = [box, start];
  var ways = [{}, { fromSide: "top", toSide: "left" },
              { fromSide: "top", toSide: "left", pin: true }];
  var cramped = 0;
  ways.forEach(function (sides) {
    hand.links = [Object.assign({ from: 2, to: 1 }, sides)];
    var pts = routeAll()[0], z = pts[pts.length - 1], y = pts[pts.length - 2];
    if (Math.abs(z[0] - y[0]) + Math.abs(z[1] - y[1]) < STAND - 0.5) cramped++;
  });
  hand.links = [];
  if (cramped) bad.push(cramped + " of " + ways.length + " arrowheads with no room to sit on");
  console.log("a Start just under a box's corner, " + ways.length + " ways: " + cramped +
              " arrowheads cramped");
})();

// ---- straight down, and never through the shape it goes to --------------
// The drawing the user sent on 2026-09-25: a Start, a wide Display set a
// little to the right of it, and an End close under the Display (its words
// had made it taller, and it grew down towards the End).  The arrow into
// the End left the Display straight down through the End and came back up
// into its foot; the one into the Display stepped sideways halfway down.
// Both are straight lines now, every way the arrows were drawn.
(function () {
  var start = { id: 1, kind: "oval", x: 265, y: 45, w: 130, h: 50, turn: 0 };
  var show = { id: 2, kind: "io", x: 310, y: 150, w: 280, h: 80, turn: 0 };
  var end = { id: 3, kind: "oval", x: 265, y: 230, w: 130, h: 50, turn: 0 };
  hand.nodes = [start, show, end];
  var ways = [{}, { fromSide: "foot", toSide: "top" }];
  var through = 0, bent = 0, tried = 0;
  ways.forEach(function (sides) {
    hand.links = [Object.assign({ from: 1, to: 2 }, sides), Object.assign({ from: 2, to: 3 }, sides)];
    routeAll().forEach(function (pts, li) {
      tried++;
      var link = hand.links[li];
      if (throughAny(pts, nodeById(link.from), nodeById(link.to))) through++;
      if (pts.length > 2) bent++;
    });
  });
  hand.links = [];
  if (through) bad.push(through + " arrows through the End or the Display");
  if (bent) bad.push(bent + " arrows between overlapping shapes not straight");
  console.log("Start, Display and End, " + tried + " arrows: " + through + " through a shape, " +
              bent + " with corners");
})();

if (bad.length) {
  console.error(bad.join("; "));
  process.exit(1);
}
