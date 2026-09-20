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
})();

if (bad.length) {
  console.error(bad.join("; "));
  process.exit(1);
}
