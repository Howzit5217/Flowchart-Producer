// ---------------------------------------------------------------------------
//  10-hand.js -- shapes placed by hand, and how they are drawn
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // =========================================================== by hand ==
  // Shapes you put where you want them, joined up by hand, and a check that
  // says whether what you have drawn is a flowchart that actually runs:
  // one place it starts, nothing stranded, nothing that can only be left by
  // stopping dead, and an End reachable from everywhere.  The drawing is
  // the same SVG the script writes, so the colors, the downloads and the
  // grid all work on it exactly as they do on a chart built from code.
  var hand = { nodes: [], links: [], next: 1, nextLink: 0 };
  // The paper behind a by-hand chart is ruled every 20, with a heavier line
  // every fifth.  Shapes settle on quarters of that: fine enough to place
  // something just so, coarse enough that things line up with each other
  // without being fiddled into place.
  var HAND_RULE = 20;                    // what is drawn
  var HAND_GRID = HAND_RULE / 4;         // what shapes settle on
  var picked = null, chosen = null, joining = false;
  var joinFrom = null;                   // the dot a line being joined leaves by
  // Several shapes taken up at once -- by a box dragged round them, Shift
  // and a click, or Ctrl+A -- to be moved, copied or deleted together
  // (11-hand-many.js).  Only ever two or more, and only while no one shape
  // is picked and no arrow chosen: picking either is letting the lot go.
  var many = [];

  // Lining things up.  While a shape is being carried, its middle is watched
  // against the middle of every other shape; come within reach of one and it
  // settles onto it exactly and a red line is drawn through both, so you can
  // see what you have lined it up with.  Red because it has to show against
  // white paper and dark paper and against every color a shape can be
  // painted -- it is not part of the chart, it is only there while you hold
  // the shape, and it should look like it.
  var GUIDE_REACH = 7;                   // how near counts as lined up
  var guides = [];                       // [vertical?, where, from, to]

  // `skip`: the shapes being carried with it, which line up with nothing --
  // they are going wherever it goes.
  function lineUp(node, skip) {
    guides = [];
    var about = turned(node);
    hand.nodes.forEach(function (other) {
      if (other.id === node.id || (skip && skip.indexOf(other.id) >= 0)) { return; }
      var its = turned(other);
      if (Math.abs(node.x - other.x) <= GUIDE_REACH) {
        node.x = other.x;
        guides.push([true, other.x,
                     Math.min(node.y - about.h / 2, its.y - its.h / 2) - 14,
                     Math.max(node.y + about.h / 2, its.y + its.h / 2) + 14]);
      }
      if (Math.abs(node.y - other.y) <= GUIDE_REACH) {
        node.y = other.y;
        guides.push([false, other.y,
                     Math.min(node.x - about.w / 2, its.x - its.w / 2) - 14,
                     Math.max(node.x + about.w / 2, its.x + its.w / 2) + 14]);
      }
    });
  }
  // How small a shape is allowed to get before the words stop fitting.  These
  // are also the sizes a shape arrives at, and they are set to what is
  // comfortable to read and to take hold of with the mouse rather than to the
  // least the words need -- a shape you have to squint at is no use.
  var ROOM = { oval: [128, 50], rect: [170, 58], roundrect: [170, 58],
               io: [182, 58], io_back: [182, 58], diamond: [190, 84],
               hex: [182, 62], sub: [170, 58], trap: [182, 58],
               manual: [176, 62], doc: [176, 64], docs: [180, 70],
               note: [176, 62], card: [176, 62], loop: [176, 62],
               store: [170, 72], stored: [176, 62], delay: [170, 58],
               screen: [188, 58], circle: [72, 72], offpage: [170, 70],
               parallel: [170, 64], cloud: [186, 76], arrow: [192, 58],
               text: [120, 34], actor: [110, 96], callout: [180, 76],
               cube: [176, 68], step: [190, 58], table: [180, 76] };

  // Where the words sit in a shape, as a share of its height.  Most shapes
  // are happy with their middle; some have something in the way of it -- the
  // lip on a drum, the point on an off-page marker, the wave at the foot of
  // a page -- so the words step aside rather than sit across it.
  var WORD_SHIFT = { store: 0.09, stored: 0.07, offpage: -0.12, doc: -0.06,
                     docs: -0.05, manual: 0.07, card: 0.06, note: 0.04,
                     actor: 0.34, callout: -0.1, cube: 0.06, table: 0.14 };

  var HAND_TYPE = 12.5;                  // the words on a shape
  var HAND_LINE = 15;                    // and the step from line to line

  // How big the dots on a shape are drawn -- the four you drag a line from,
  // and the four every other shape puts out to be aimed at.  A finger needs
  // a bigger one than a mouse does, and this used to be said in the
  // stylesheet, as `r` under (pointer: coarse).  `r` is only a CSS property
  // in some browsers: Firefox had no such thing until 128, so on a phone or
  // a tablet running it the dots stayed mouse-sized and joining two shapes
  // up meant hitting a circle five pixels across with a fingertip.  Asked
  // here instead and written onto the circle as an attribute, which every
  // browser has always understood.
  var COARSE = (function () {
    try { return matchMedia("(pointer: coarse)").matches; }
    catch (e) { return false; }
  })();
  var DOT_KNOB = COARSE ? 8 : 5.5;
  var DOT_SPOT = COARSE ? 9 : 6.5;

  function handKinds() {                 // the whole catalog, by name
    return SHAPE_LIST.map(function (kind) {
      return [kind, TXT["n_" + kind] || kind];
    });
  }
  function kindName(kind) {
    return TXT["n_" + kind] || TXT["key_" + kind] || kind;
  }
  function nodeById(id) {
    return hand.nodes.filter(function (n) { return n.id === id; })[0] || null;
  }
  function outOf(id) {
    return hand.links.filter(function (l) { return l.from === id; });
  }
  function intoOf(id) {
    return hand.links.filter(function (l) { return l.to === id; });
  }

  // What a shape's words are set in: the chart's typeface and size, and
  // whatever this one shape was given of its own on the Style side.  It is
  // what the shape is measured in and what its lines are spaced by, so
  // bigger or bolder words make a bigger box, the way longer ones do.
  function handType(node) {
    var L = lettersOf(), mine = style.nodes["h" + node.id] || {};
    function either(what) {
      return mine[what] !== undefined ? !!mine[what] : !!L[what];
    }
    var size = HAND_TYPE * shapePt("h" + node.id) / PLAIN_PT;
    var face = FACES[L.face] || FACES.sans;
    return { size: size, line: size * HAND_LINE / HAND_TYPE, face: face,
             bold: either("bold"), italic: either("italic"),
             under: either("under"), strike: either("strike"),
             font: (either("italic") ? "italic " : "") +
                   (either("bold") ? "bold " : "") + size + "px " + face };
  }

  function measure(node, force) {         // how big the words make it
    if (node.own && !force) { return; }   // unless a size was set by hand
    var lines = String(node.text || " ").split("\n");
    var pen = measure.pen || (measure.pen = document.createElement("canvas")
                              .getContext("2d"));
    var type = handType(node);
    pen.font = type.font;
    var wide = 0;
    lines.forEach(function (line) { wide = Math.max(wide, pen.measureText(line).width); });
    var room = ROOM[node.kind] || ROOM.rect;
    var STEP = HAND_GRID * 2;          // so half of it is a whole quarter
    node.w = Math.max(room[0], Math.round(wide) + (node.kind === "diamond" ? 84 : 40));
    node.h = Math.max(room[1], lines.length * type.line +
                               (node.kind === "diamond" ? 38 : 24));
    node.w = Math.ceil(node.w / STEP) * STEP;
    node.h = Math.ceil(node.h / STEP) * STEP;
    if (node.kind === "circle") { node.w = node.h = Math.max(node.w, node.h); }
    node.own = false;
  }

  function shapeSvg(n) {                 // full size, on the paper
    return shapeArt(n.kind, n.x, n.y, n.w, n.h, "#ffffff");
  }

  // --------------------------------------------------------- joining two up --
  // A line used to leave whichever side happened to face the other shape and
  // then get itself there however it could.  That picked the side before it
  // knew what the side would cost, so a line would come out of one face, turn
  // three times getting back round, and think nothing of going straight
  // through whatever else was standing in the way.
  //
  // So: all four sides of each shape are tried, the few square-cornered ways
  // of joining each pair are laid out, and the cheapest is drawn -- where
  // cheap means through nothing, then few turns, then short.  On the ordinary
  // case, one shape under another, that is still the plain straight line down.
  var STAND = 16;                         // how far a line stands off a shape

  // Where a line should actually touch a shape.  Every shape is measured by
  // the box around it, but most of them do not fill that box: a parallelogram
  // leans away from it at the sides, a typed-in box slopes away at the top, a
  // page waves away at the foot.  Meeting the box instead of the shape leaves
  // the arrow stopping in mid-air beside the thing it is pointing at, which
  // is what made it look as though a parallelogram had no sides to come out
  // of.  So each side is brought in to where the outline really is.
  // Turning a shape a quarter turn swaps what is its width and what is its
  // height, as far as anything outside the drawing is concerned: where its
  // sides are, where an arrow should meet it, where its corners are to take
  // hold of.  The drawing itself is turned with a transform, so this is the
  // one place that has to know.
  function turned(n) {
    var quarter = Math.round(((n.turn || 0) % 360) / 90) % 4;
    var over = quarter === 1 || quarter === 3;
    return { kind: n.kind, id: n.id, x: n.x, y: n.y,
             w: over ? n.h : n.w, h: over ? n.w : n.h, sideways: over };
  }

  function ports(node) {
    var n = turned(node);
    var w = n.w, h = n.h, x = n.x, y = n.y;
    var l = x - w / 2, r = x + w / 2, t = y - h / 2, b = y + h / 2;
    var lean = Math.min(12, (n.sideways ? h : w) / 4);
    var top = t, foot = b, left = l, right = r;
    // Sideways, the sides of the shape are its top and foot, so the little
    // corrections belong to the other pair.
    switch (n.sideways ? "" : n.kind) {
      case "io": case "io_back": case "trap":
        left = l + lean / 2; right = r - lean / 2; break;
      case "manual":
        top = t + Math.min(11, h * 0.28) / 2; break;
      case "doc":
        foot = b - Math.min(10, h * 0.18) * 0.2; break;
      case "docs":
        foot = b - Math.min(5, h * 0.12) * 0.4; break;
      case "screen":
        left = l + Math.min(16, w * 0.16) / 4; break;
      case "arrow":
        top = t + h * 0.26; foot = b - h * 0.26; break;
      case "step":                      // the point and the notch are the sides
        left = l + Math.min(22, w * 0.16); right = r - Math.min(22, w * 0.16);
        break;
      case "cube":
        top = t + Math.min(14, h * 0.26, w * 0.14);
        left = l; foot = b; break;
      case "callout":
        foot = b - Math.min(16, h * 0.28); break;
      case "actor":                     // the head is all there is up top
        break;
      case "offpage":
        break;                          // the point is at the middle anyway
      case "cloud":
        break;                          // drawn to touch its box at each side
      default: break;                   // box and outline agree
    }
    return [{ x: x, y: top, dx: 0, dy: -1 },
            { x: x, y: foot, dx: 0, dy: 1 },
            { x: left, y: y, dx: -1, dy: 0 },
            { x: right, y: y, dx: 1, dy: 0 }];
  }

  function tidy(pts) {                    // drop repeats and straight-throughs
    var out = [];
    pts.forEach(function (p) {
      var last = out[out.length - 1];
      if (!last || Math.abs(last[0] - p[0]) > 0.5 || Math.abs(last[1] - p[1]) > 0.5) {
        out.push([p[0], p[1]]);
      }
    });
    for (var i = out.length - 2; i > 0; i--) {
      var a = out[i - 1], b = out[i], c = out[i + 1];
      if ((Math.abs(a[0] - b[0]) < 0.5 && Math.abs(b[0] - c[0]) < 0.5) ||
          (Math.abs(a[1] - b[1]) < 0.5 && Math.abs(b[1] - c[1]) < 0.5)) {
        out.splice(i, 1);
      }
    }
    return out;
  }

  // Out of one side and into the other.  Where both sides face the same way
  // the two runs are joined by a cross lane, which is halfway by default --
  // handing in a lane is what lets a blocked line go round instead.
  function joinPorts(p, q, lane) {
    var a = [p.x + p.dx * STAND, p.y + p.dy * STAND];
    var b = [q.x + q.dx * STAND, q.y + q.dy * STAND];
    var pts = [[p.x, p.y], a];
    if (p.dx === 0 && q.dx === 0) {                 // both up or down
      if (Math.abs(a[0] - b[0]) > 1 || lane != null) {
        var mid = lane == null ? (a[1] + b[1]) / 2 : lane;
        pts.push([a[0], mid], [b[0], mid]);
      }
    } else if (p.dy === 0 && q.dy === 0) {          // both sideways
      if (Math.abs(a[1] - b[1]) > 1 || lane != null) {
        var midx = lane == null ? (a[0] + b[0]) / 2 : lane;
        pts.push([midx, a[1]], [midx, b[1]]);
      }
    } else if (p.dx === 0) {                        // one of each
      // Round by a lane, the line runs out along it and then comes in at
      // the side it was told to -- asked for only when that side is fixed.
      if (lane != null) { pts.push([a[0], lane], [b[0], lane]); }
      else { pts.push([a[0], b[1]]); }
    } else {
      if (lane != null) { pts.push([lane, a[1]], [lane, b[1]]); }
      else { pts.push([b[0], a[1]]); }
    }
    pts.push(b, [q.x, q.y]);
    return tidy(pts);
  }

  // A line within this much of a shape's outline counts as going through
  // it.  Run straight down the edge of a box, it is read as part of the
  // box -- and it was allowed to, since only running inside one counted,
  // so a line could come down one side of a box and straight through the
  // point of the arrowhead going into it.
  var GRAZE = 2;

  function cutsThrough(pts, node, from, to) {   // does any leg cross this shape
    var n = turned(node);
    var x0 = n.x - n.w / 2 - GRAZE, x1 = n.x + n.w / 2 + GRAZE;
    var y0 = n.y - n.h / 2 - GRAZE, y1 = n.y + n.h / 2 + GRAZE;
    var first = from == null ? 1 : from;
    var last = to == null ? pts.length - 1 : to;
    for (var i = first; i <= last; i++) {
      var ax = Math.min(pts[i - 1][0], pts[i][0]), bx = Math.max(pts[i - 1][0], pts[i][0]);
      var ay = Math.min(pts[i - 1][1], pts[i][1]), by = Math.max(pts[i - 1][1], pts[i][1]);
      if (ax < x1 && x0 < bx && ay < y1 && y0 < by) { return true; }
    }
    return false;
  }

  function priceOf(pts, a, b) {
    var through = 0, len = 0, bends = 0;
    // What the route covers, so shapes nowhere near it can be passed over
    // without measuring.  On a chart of any size most of them are.
    var x0 = pts[0][0], x1 = x0, y0 = pts[0][1], y1 = y0;
    for (var p = 1; p < pts.length; p++) {
      if (pts[p][0] < x0) { x0 = pts[p][0]; } else if (pts[p][0] > x1) { x1 = pts[p][0]; }
      if (pts[p][1] < y0) { y0 = pts[p][1]; } else if (pts[p][1] > y1) { y1 = pts[p][1]; }
    }
    hand.nodes.forEach(function (n) {
      var t = turned(n);
      if (t.x + t.w / 2 < x0 || t.x - t.w / 2 > x1 ||
          t.y + t.h / 2 < y0 || t.y - t.h / 2 > y1) { return; }
      if (n.id === a.id || n.id === b.id) {
        // A line's own two shapes count too -- it should leave one and
        // arrive at the other without cutting back over either.  The legs
        // that touch their edges on the way out and in are the exception,
        // since that is the line meeting the shape, not running through it.
        if (pts.length > 3 && cutsThrough(pts, n, 2, pts.length - 2)) { through++; }
        return;
      }
      if (cutsThrough(pts, n)) { through++; }
    });
    var was = null;
    for (var i = 1; i < pts.length; i++) {
      var dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1];
      len += Math.abs(dx) + Math.abs(dy);
      var way = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "R" : "L") : (dy > 0 ? "D" : "U");
      if (was && way !== was) { bends++; }
      was = way;
    }
    return through * 10000 + bends * 100 + len;
  }

  // Round a corner by two lanes: out along one, over along the other, and
  // in.  Only a line whose sides are fixed needs this -- one that has to
  // leave from the foot and come back in at the top of a shape above it,
  // say -- since any other can simply take the sides that face each other.
  function roundPorts(p, q, laneY, laneX) {
    var a = [p.x + p.dx * STAND, p.y + p.dy * STAND];
    var b = [q.x + q.dx * STAND, q.y + q.dy * STAND];
    var pts = [[p.x, p.y], a];
    if (p.dx === 0) {
      pts.push([a[0], laneY], [laneX, laneY], [laneX, b[1]]);
    } else {
      pts.push([laneX, a[1]], [laneX, laneY], [b[0], laneY]);
    }
    pts.push(b, [q.x, q.y]);
    return tidy(pts);
  }

  // Whether a line leaves its shape the way the side it leaves by faces,
  // and comes in to the other the way that side faces.  Out of the right
  // side and then straight back left again is out and back through the
  // shape it came from -- but tidy() sees the stand-off and the run back
  // as one straight line and makes them one, so nothing else notices.  No
  // side a line was free to pick ever wanted it; a side it has to keep, to
  // a shape round the back of it, would take it every time.  Nor, on a
  // side it has to keep (`keepP`, `keepQ`), may it turn before it is a
  // stand-off clear: out a pixel and straight down again runs down the
  // side of the shape it has just left.
  function outward(pts, p, q, keepP, keepQ) {
    var first = pts[1], last = pts[pts.length - 2], bent = pts.length > 2;
    return (first[0] - p.x) * p.dx + (first[1] - p.y) * p.dy >
             (bent && keepP ? STAND - 0.5 : 0.5) &&
           (last[0] - q.x) * q.dx + (last[1] - q.y) * q.dy >
             (bent && keepQ ? STAND - 0.5 : 0.5);
  }

  // The four sides of a shape, in the order ports() gives them.  An arrow
  // drawn from one of the dots on a shape to one of the dots on another
  // notes those two sides (link.fromSide, link.toSide) and leans to them
  // from then on; pinned (link.pin), it keeps them however the shapes are
  // moved about.  See routeAll.
  var PORT_SIDES = ["top", "foot", "left", "right"];
  // What it costs a line to use a side another line already uses.  Less
  // than running through a shape, which is harder still to follow, but a
  // good deal more than a longer way round: two arrows down one side read
  // as one arrow, and nobody can tell which way either of them goes.
  var CROWD = 3000;

  // `link` holds the arrow to the sides it names (fromSide, toSide), where
  // it was pinned to them.  The rest are for routeAll: `taken`, the sides
  // other arrows are on; `lean`, the sides it was drawn between, which it
  // keeps to while that costs it little (LEAN); `ways`, the runs of the
  // arrows already routed, which it keeps off (OVERLAP); and `shift`, how
  // far along its two sides from their middles it meets them.
  function linkPath(a, b, link, taken, lean, ways, shift) {  // corners only, never a diagonal
    var outs = ports(a), ins = ports(b);
    var best = null, bestPrice = Infinity, bestOut = 0, bestIn = 0;
    var bestBase = Infinity, bestOver = 0;
    var outOnly = link ? PORT_SIDES.indexOf(link.fromSide) : -1;
    var inOnly = link ? PORT_SIDES.indexOf(link.toSide) : -1;
    if (shift) {
      if (outOnly >= 0 && shift.from) { outs[outOnly] = portAlong(a, outOnly, shift.from); }
      if (inOnly >= 0 && shift.to) { ins[inOnly] = portAlong(b, inOnly, shift.to); }
    }

    // `taken` says how many other lines are on each side of each shape.
    function crowd(id, side) {
      var here = taken && taken[id];
      return here ? here[side] || 0 : 0;
    }
    function weigh(pts, i, j) {
      // down out of one and in at the top of the next is how a flowchart
      // reads, so it wins any tie
      var price = priceOf(pts, a, b) - (i === 1 && j === 0 ? 1 : 0);
      if (!outward(pts, outs[i], ins[j], outOnly >= 0, inOnly >= 0)) { price += 10000; }
      if (outOnly < 0) { price += crowdCost(a, i) * crowd(a.id, i); }
      if (inOnly < 0) { price += crowdCost(b, j) * crowd(b.id, j); }
      // What it is blocked by is judged before what it would rather: a
      // side it leans to never makes a way through a shape look clear.
      var base = price;
      if (lean && lean.from === i) { price -= LEAN; }
      if (lean && lean.to === j) { price -= LEAN; }
      if (price >= bestPrice) { return; }   // lying on nothing, it still loses
      var over = ways ? overlapsIn(pts, ways) : 0;
      price += OVERLAP * over;
      if (price < bestPrice) {
        best = pts; bestPrice = price; bestOut = i; bestIn = j;
        bestBase = base; bestOver = over;
      }
    }
    function tryJoin(i, j, lane) {        // unless a side it has to keep says no
      if ((outOnly >= 0 && i !== outOnly) || (inOnly >= 0 && j !== inOnly)) { return; }
      weigh(joinPorts(outs[i], ins[j], lane), i, j);
    }
    function done() {                     // and which sides it went by
      best.sides = [bestOut, bestIn];
      return best;
    }

    for (var i = 0; i < outs.length; i++) {
      for (var j = 0; j < ins.length; j++) {
        tryJoin(i, j);
      }
    }
    // nothing in the way, and on top of no other arrow: done
    if (bestBase < 10000 && !bestOver) { return done(); }

    // Something is in the way of every straight join, so look for a lane to
    // go round by -- just clear of each shape's own edges, which is where a
    // way through is if there is one.  Only ever reached when the simple
    // ways are all blocked, so the usual case pays nothing for it.
    // Just clear of every shape's edges -- its own two included, since a
    // line should not cut back over the shape it came from either.
    var lanesY = [], lanesX = [];
    hand.nodes.forEach(function (n) {
      var t = turned(n);
      lanesY.push(t.y - t.h / 2 - STAND, t.y + t.h / 2 + STAND);
      lanesX.push(t.x - t.w / 2 - STAND, t.x + t.w / 2 + STAND);
    });
    // and halfway between neighbouring edges, which is where a gap is
    [lanesY, lanesX].forEach(function (lanes) {
      var sorted = lanes.slice().sort(function (p, q) { return p - q; });
      for (var i = 1; i < sorted.length; i++) {
        if (sorted[i] - sorted[i - 1] > 6) {
          lanes.push((sorted[i] + sorted[i - 1]) / 2);
        }
      }
    });
    // The way round is nearly always close to the way through, so the lanes
    // are tried nearest-first and the far ones are not tried at all.  On a
    // chart with dozens of shapes that is the difference between a redraw
    // you can feel while dragging and one you cannot.
    var NEAREST = 10;
    function closest(lanes, to) {
      return lanes.sort(function (p, q) {
        return Math.abs(p - to) - Math.abs(q - to);
      }).slice(0, NEAREST);
    }
    var allY = lanesY.slice(), allX = lanesX.slice();
    // Here only because the way it would take lies along another arrow,
    // with nothing in its way: the halfway line between the two shapes is
    // where every arrow crossing that gap goes, so it is tried a little
    // either side of halfway, and the few lanes nearest -- no more, since
    // this is asked of arrow after arrow on every frame of a drag.
    var clear = bestBase < 10000;
    lanesY = closest(lanesY, (a.y + b.y) / 2).slice(0, clear ? 3 : NEAREST);
    lanesX = closest(lanesX, (a.x + b.x) / 2).slice(0, clear ? 3 : NEAREST);
    if (bestOver) {
      var ga = turned(a), gb = turned(b);
      var gapY = gapMiddle(ga.y, ga.h, gb.y, gb.h), gapX = gapMiddle(ga.x, ga.w, gb.x, gb.w);
      [-20, -10, 10, 20].forEach(function (by) {
        lanesY.push(gapY + by);
        lanesX.push(gapX + by);
      });
    }
    // Clear of every shape, the sides it found are good ones: it is only
    // the run across the middle that wants moving off the other arrow, so
    // only that is moved.
    if (clear) {
      var keepOut = bestOut, keepIn = bestIn;
      (keepOut < 2 ? lanesY : lanesX).forEach(function (lane) {
        tryJoin(keepOut, keepIn, lane);
      });
      return done();
    }
    // A line held to a side wants the lanes just outside that side as well,
    // and those can be further off than half way: the one lane that gets a
    // line from the right of a decision round to a box below and to its
    // left is the one just right of the decision.
    var endsY = [], endsX = [];
    if ((outOnly >= 0 || inOnly >= 0) && !clear) {
      var p0 = outOnly >= 0 ? outs[outOnly] : { x: a.x, y: a.y, dx: 0, dy: 0 };
      var q0 = inOnly >= 0 ? ins[inOnly] : { x: b.x, y: b.y, dx: 0, dy: 0 };
      // and the lanes just clear of both shapes at once, which is the way
      // round the outside of the pair: out of the top and back in at the
      // foot of a shape below, say
      var ta = turned(a), tb = turned(b);
      endsY = merged(nearBoth(allY, p0.y + p0.dy * STAND, q0.y + q0.dy * STAND),
                     [Math.min(ta.y - ta.h / 2, tb.y - tb.h / 2) - STAND,
                      Math.max(ta.y + ta.h / 2, tb.y + tb.h / 2) + STAND]);
      endsX = merged(nearBoth(allX, p0.x + p0.dx * STAND, q0.x + q0.dx * STAND),
                     [Math.min(ta.x - ta.w / 2, tb.x - tb.w / 2) - STAND,
                      Math.max(ta.x + ta.w / 2, tb.x + tb.w / 2) + STAND]);
      lanesY = merged(lanesY, endsY);
      lanesX = merged(lanesX, endsX);
    }
    function nearBoth(lanes, one, two) {
      return merged(closest(lanes.slice(), one).slice(0, NEAREST / 2),
                    closest(lanes.slice(), two).slice(0, NEAREST / 2));
    }
    function merged(one, two) {
      return one.concat(two.filter(function (v) { return one.indexOf(v) < 0; }));
    }
    for (var k = 0; k < lanesY.length; k++) {
      for (var m = 0; m < 2; m++) {             // out of the top or the foot
        tryJoin(m, 1 - m, lanesY[k]);
        tryJoin(m, m, lanesY[k]);
      }
    }
    for (k = 0; k < lanesX.length; k++) {
      for (m = 2; m < 4; m++) {                 // out of a side
        tryJoin(m, 5 - m, lanesX[k]);
        tryJoin(m, m, lanesX[k]);
      }
    }
    if (bestBase < 10000 || (outOnly < 0 && inOnly < 0)) { return done(); }

    // A line held to its sides may have none of those ways open to it: out
    // of the foot and into a side, or back up to the top of a shape above.
    // So it may also go out along a lane and come in from one side, or
    // round a corner by two lanes, one each way.
    for (k = 0; k < lanesY.length; k++) {
      for (i = 0; i < 2; i++) { tryJoin(i, 2, lanesY[k]); tryJoin(i, 3, lanesY[k]); }
    }
    for (k = 0; k < lanesX.length; k++) {
      for (i = 2; i < 4; i++) { tryJoin(i, 0, lanesX[k]); tryJoin(i, 1, lanesX[k]); }
    }
    if (bestBase < 10000) { return done(); }
    for (i = 0; i < 4; i++) {             // round a corner, near its two ends
      for (j = 0; j < 4; j++) {
        if ((outOnly >= 0 && i !== outOnly) || (inOnly >= 0 && j !== inOnly)) { continue; }
        for (k = 0; k < endsY.length; k++) {
          for (m = 0; m < endsX.length; m++) {
            // half of these double straight back, and are not worth pricing
            var round = roundPorts(outs[i], ins[j], endsY[k], endsX[m]);
            if (outward(round, outs[i], ins[j], outOnly >= 0, inOnly >= 0)) {
              weigh(round, i, j);
            }
          }
        }
      }
    }
    return done();
  }

  // Every arrow on the paper, routed in the order they were drawn, so that
  // each one knows which sides the others have used.  The sides an arrow
  // was drawn between are spoken for before anything is routed at all;
  // every other arrow finds its own way, and stays off a side some other
  // arrow is already on wherever it has a free one to take instead.
  //
  // It used to be that every arrow found its way as if it were the only
  // one there, so the cheapest side for one was the cheapest for the next:
  // two answers out of a decision could leave from the same point and run
  // down the one line, and an arrow drawn from the right-hand dot would
  // swap to the foot, where another already was, the moment a shape moved.
  // Everything that asks where an arrow goes asks here, so that what is
  // clicked, typed on and checked is the arrow that is drawn.
  //
  // And the sides an arrow was drawn between used to be its sides for good,
  // wherever the shapes were moved afterwards -- so two drawn from one dot
  // ran down one line for ever, and one drawn from the right-hand side of a
  // shape still went out of the right after the shape it pointed at had been
  // moved round to the left, the long way round.  Now they are the sides it
  // leans to (LEAN): kept while keeping them costs little, and given up to
  // stay off another arrow's side or out of its way.  Only an arrow pinned
  // to its sides (link.pin, from the arrow's menu or panel) keeps them.
  var LEAN = 300;                         // an end kept on the side it was drawn to
  var OVERLAP = 2500;                     // a run lying along another arrow's
  function routeAll() {
    var taken = {};
    function note(id, side, by) {
      (taken[id] = taken[id] || [0, 0, 0, 0])[side] += by || 1;
    }
    hand.links.forEach(function (link) {
      var i = PORT_SIDES.indexOf(link.fromSide), j = PORT_SIDES.indexOf(link.toSide);
      if (i >= 0) { note(link.from, i); }
      if (j >= 0) { note(link.to, j); }
    });
    var ways = {};
    var routes = hand.links.map(function (link) {
      var a = nodeById(link.from), b = nodeById(link.to);
      if (!a || !b) { return null; }
      var i = PORT_SIDES.indexOf(link.fromSide), j = PORT_SIDES.indexOf(link.toSide);
      var lean = link.pin ? null : { from: i, to: j };
      // Its own sides are not another arrow's to keep off.
      if (lean && i >= 0) { note(link.from, i, -1); }
      if (lean && j >= 0) { note(link.to, j, -1); }
      var pts = linkPath(a, b, link.pin ? link : null, taken, lean, ways);
      if (lean || i < 0) { note(link.from, pts.sides[0]); }
      if (lean || j < 0) { note(link.to, pts.sides[1]); }
      waysAdd(ways, pts);
      return pts;
    });
    return spreadEnds(routes);
  }

  // Two or more arrows at one side of a shape meet it at points spread along
  // that side, rather than all at its middle, where they ran into each other
  // and could not be told apart -- in the order they come in from, so they
  // do not cross on the way.  Each is slid along the side it has, not
  // routed again: its first run slides with its end, and the corner at the
  // top of that run with it, so every run stays square and the rest of the
  // way is the way it was.
  var SPREAD = 18;                        // at most this far apart
  function spreadEnds(routes) {
    var at = {};
    hand.links.forEach(function (link, li) {
      var pts = routes[li];
      if (!pts) { return; }
      var last = pts.length - 1;
      [[link.from, pts.sides[0], "from", pts[2] || pts[last]],
       [link.to, pts.sides[1], "to", pts[last - 2] || pts[0]]].forEach(function (end) {
        var key = end[0] + ":" + end[1];
        (at[key] = at[key] || []).push({ li: li, id: end[0], side: end[1],
                                         end: end[2], toward: end[3] });
      });
    });
    var shift = {};
    Object.keys(at).forEach(function (key) {
      var ends = at[key];
      if (ends.length < 2) { return; }
      var node = nodeById(ends[0].id), side = ends[0].side;
      var room = node ? spreadRoom(node, side) : 0;
      if (room <= 0) { return; }
      var axis = side < 2 ? 0 : 1;          // along the top or foot, or down a side
      ends.sort(function (p, q) {
        return (p.toward[axis] - q.toward[axis]) || (p.li - q.li);
      });
      var step = Math.min(SPREAD, 2 * room / (ends.length - 1));
      ends.forEach(function (e, n) {
        (shift[e.li] = shift[e.li] || {})[e.end] = (n - (ends.length - 1) / 2) * step;
      });
    });
    hand.links.forEach(function (link, li) {
      if (!routes[li] || !shift[li]) { return; }
      routes[li] = slidEnds(routes[li], nodeById(link.from), nodeById(link.to), shift[li]);
    });
    return routes;
  }

  // A route with its two ends moved along their sides by `by.from` and
  // `by.to`.  A straight route whose two ends move by different amounts is
  // given a step halfway along, rather than being tipped over.
  function slidEnds(pts, a, b, by) {
    var sides = pts.sides, out = pts.map(function (p) { return p.slice(); });
    var last = out.length - 1;
    var p = portAlong(a, sides[0], by.from || 0), q = portAlong(b, sides[1], by.to || 0);
    var ax = sides[0] < 2 ? 0 : 1, bx = sides[1] < 2 ? 0 : 1;   // the axis each slides on
    if (out.length === 2) {
      var d0 = [p.x, p.y][ax] - out[0][ax], d1 = [q.x, q.y][bx] - out[1][bx];
      if (ax === bx && Math.abs(d0 - d1) > 0.5) {
        var cross = 1 - ax, mid = (out[0][cross] + out[1][cross]) / 2;
        var bend0 = [], bend1 = [];
        bend0[ax] = p[ax ? "y" : "x"]; bend0[cross] = mid;
        bend1[ax] = q[ax ? "y" : "x"]; bend1[cross] = mid;
        out = [[p.x, p.y], bend0, bend1, [q.x, q.y]];
        out.sides = sides;
        return out;
      }
    }
    // the first run and the corner it reaches go with the end
    out[1][ax] += [p.x, p.y][ax] - out[0][ax];
    out[0] = [p.x, p.y];
    out[last - 1][bx] += [q.x, q.y][bx] - out[last][bx];
    out[last] = [q.x, q.y];
    out.sides = sides;
    return out;
  }

  // How far either way from the middle of one of its sides a shape will
  // take an arrow: along the whole of a straight side, clear of its corners;
  // some way along the slopes of a diamond and the curve of an oval; and
  // not at all where the side is a point, a notch or a wave, which an arrow
  // meets properly only in the middle.  A shape turned round is only trusted
  // this far where it is the same shape every way up.
  var SPREAD_ALL = { rect: 1, roundrect: 1, sub: 1, text: 1, table: 1, note: 1,
                     card: 1, loop: 1, parallel: 1 };
  var SPREAD_SOME = { io: [0, 1], io_back: [0, 1], trap: [0, 1], hex: [0, 1],
                      step: [0, 1], doc: [0], docs: [0], delay: [0, 1, 2],
                      screen: [0, 1], stored: [0, 1], store: [2, 3],
                      manual: [1, 2, 3], offpage: [0, 2, 3], callout: [0, 2, 3],
                      cube: [1, 2] };
  function spreadRoom(node, side) {
    var n = turned(node), along = side < 2 ? n.w : n.h;
    var upright = !(Math.round(((node.turn || 0) % 360) / 90) % 4);
    if (n.kind === "diamond") { return along * 0.2; }
    if (n.kind === "oval" || n.kind === "circle") { return along * 0.28; }
    if (SPREAD_ALL[n.kind] ||
        (upright && SPREAD_SOME[n.kind] && SPREAD_SOME[n.kind].indexOf(side) >= 0)) {
      return Math.max(0, along / 2 - 16);
    }
    return 0;
  }

  // Where an arrow meets a side `off` from its middle: along a straight side
  // just that; up the slope of a diamond, or round an oval, as far as the
  // outline has fallen back by then.
  function portAlong(node, side, off) {
    var p = ports(node)[side];
    if (!off) { return p; }
    var n = turned(node), hw = n.w / 2, hh = n.h / 2;
    var q = { x: p.x, y: p.y, dx: p.dx, dy: p.dy };
    if (side < 2) { q.x += off; } else { q.y += off; }
    if (n.kind === "diamond") {
      if (side < 2) { q.y = n.y + p.dy * (hh - Math.abs(off) * hh / hw); }
      else { q.x = n.x + p.dx * (hw - Math.abs(off) * hw / hh); }
    } else if (n.kind === "oval" || n.kind === "circle") {
      if (side < 2) { q.y = n.y + p.dy * hh * Math.sqrt(Math.max(0, 1 - off * off / (hw * hw))); }
      else { q.x = n.x + p.dx * hw * Math.sqrt(Math.max(0, 1 - off * off / (hh * hh))); }
    }
    return q;
  }

  // What sharing a side with another arrow costs.  Where the side is long
  // and straight the two meet it apart (spreadEnds), so sharing it is a
  // small thing -- three arrows from above come straight down into the top
  // of a box rather than two of them going round to its sides.  The point
  // of a diamond, or the end of an oval, still costs what it always did:
  // two answers leave a decision from two of its points.
  var CROWD_SHARED = 150;
  function crowdCost(node, side) {
    var kind = node.kind;
    if (kind === "diamond" || kind === "oval" || kind === "circle") { return CROWD; }
    return spreadRoom(node, side) >= SPREAD ? CROWD_SHARED : CROWD;
  }

  // Halfway across the gap between two shapes, along one axis; or halfway
  // between their middles, where they overlap along it.
  function gapMiddle(c1, s1, c2, s2) {
    var lo = c1 < c2 ? [c1, s1] : [c2, s2], hi = c1 < c2 ? [c2, s2] : [c1, s1];
    var from = lo[0] + lo[1] / 2, to = hi[0] - hi[1] / 2;
    return from < to ? (from + to) / 2 : (c1 + c2) / 2;
  }

  // The runs of the arrows routed so far, filed by the line each lies on --
  // one across at y = 120 under ways.h[120] -- so a new run is checked only
  // against those it could be lying on top of.  Nearer than WAY_NEAR, two
  // runs are one line to anyone looking at them.  `ways` starts as {}.
  var WAY_NEAR = 3;
  function waysAdd(ways, pts) {
    var across = ways.h = ways.h || {}, down = ways.v = ways.v || {};
    for (var i = 1; pts && i < pts.length; i++) {
      var p = pts[i - 1], q = pts[i], at;
      if (Math.abs(p[1] - q[1]) < 0.5 && Math.abs(p[0] - q[0]) >= 0.5) {
        at = Math.round(p[1]);
        (across[at] = across[at] || []).push([Math.min(p[0], q[0]), Math.max(p[0], q[0])]);
      } else if (Math.abs(p[0] - q[0]) < 0.5 && Math.abs(p[1] - q[1]) >= 0.5) {
        at = Math.round(p[0]);
        (down[at] = down[at] || []).push([Math.min(p[1], q[1]), Math.max(p[1], q[1])]);
      }
    }
  }

  // How many of this route's runs lie along one already there.  The stand-
  // off at either end is left out: two arrows at one side of a shape meet
  // it apart once they are spread (spreadEnds), and it is the side they
  // share that says what that costs (crowdCost), not this.
  function overlapsIn(pts, ways) {
    var count = 0, last = pts.length - 1;
    if (!ways.h) { return 0; }             // nothing routed yet
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i - 1], q = pts[i], flat = Math.abs(p[1] - q[1]) < 0.5;
      if (!flat && Math.abs(p[0] - q[0]) >= 0.5) { continue; }
      var at = Math.round(flat ? p[1] : p[0]);
      var s = flat ? p[0] : p[1], e = flat ? q[0] : q[1], way = e > s ? 1 : -1;
      if (i === 1) { s += way * STAND; }
      if (i === last) { e -= way * STAND; }
      if ((e - s) * way < 0.5) { continue; }
      var lo = Math.min(s, e), hi = Math.max(s, e);
      var file = flat ? ways.h : ways.v;
      for (var k = at - WAY_NEAR; k <= at + WAY_NEAR; k++) {
        var runs = file[k];
        for (var r = 0; runs && r < runs.length; r++) {
          if (Math.min(hi, runs[r][1]) - Math.max(lo, runs[r][0]) > 2) { count++; }
        }
      }
    }
    return count;
  }

  // How far a point is from a line between two points.  Used to work out
  // which arrow somebody meant when they clicked near one rather than on it.
  function offLine(px, py, ax, ay, bx, by) {
    var vx = bx - ax, vy = by - ay;
    var run = vx * vx + vy * vy;
    var t = run ? ((px - ax) * vx + (py - ay) * vy) / run : 0;
    t = Math.max(0, Math.min(1, t));
    var dx = px - (ax + vx * t), dy = py - (ay + vy * t);
    return Math.sqrt(dx * dx + dy * dy);
  }

  // The arrow nearest a point, if one is near enough to have been meant.
  // Clicking exactly on a line is a lot to ask -- an arrow is one pixel wide
  // and there are shapes lying over parts of it -- so a click on bare paper
  // takes the nearest arrow within reach instead of just clearing what was
  // selected.
  function linkNear(x, y, within) {
    var best = null, howNear = within, routes = routeAll();
    hand.links.forEach(function (link, li) {
      var pts = routes[li];
      if (!pts) { return; }
      for (var i = 1; i < pts.length; i++) {
        var off = offLine(x, y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]);
        if (off < howNear) { howNear = off; best = link; }
      }
    });
    return best;
  }

  // A key of the shapes this design actually uses, drawn along the top the
  // way the built charts draw theirs.  Only the kinds that turn up are
  // listed: a design with no diamonds in it does not advertise one.
  var KEY_W = 62, KEY_H = 30, KEY_GAP = 9, KEY_AFTER = 28;

  function keyRow() {
    if (!el("#f-legend") || !el("#f-legend").checked) { return { art: "", tall: 0 }; }
    var used = [];
    hand.nodes.forEach(function (n) {
      if (n.kind !== "text" && used.indexOf(n.kind) < 0) { used.push(n.kind); }
    });
    if (!used.length) { return { art: "", tall: 0 }; }
    var pen = measure.pen || (measure.pen = document.createElement("canvas")
                              .getContext("2d"));
    var L = lettersOf();
    pen.font = "bold " + HAND_TYPE * chartPt() / PLAIN_PT + "px " +
               (FACES[L.face] || FACES.sans);
    var out = [], x = 0;
    used.forEach(function (kind) {
      out.push(shapeArt(kind, x + KEY_W / 2, KEY_H / 2, KEY_W, KEY_H, "#ffffff"));
      x += KEY_W + KEY_GAP;
      var name = kindName(kind);
      out.push('<text class="label" x="' + x + '" y="' + (KEY_H / 2 + 4) +
               '" font-weight="bold" stroke="none" fill="#000000">' +
               escaped(name) + "</text>");
      x += Math.round(pen.measureText(name).width) + KEY_AFTER;
    });
    return { art: '<g class="key">' + out.join("") + "</g>", tall: KEY_H + 22,
             wide: x };
  }

  // Where the word on an arrow goes.  First choice is half way along the
  // longest straight run of it, and beside that run rather than on it --
  // above it, and centred, where it goes across; to the right of it, and
  // level with its middle, where it goes up or down.  Either way it keeps
  // LABEL_CLEAR off the middle of the line, which is half an arrowhead and
  // some clear paper more, so the head stays clear of it as well as the line.
  //
  // It was always put up and to the right of the half way point, a few
  // pixels out.  Beside a line going up, that put the word against the
  // side of the head; above a line going across it ran on towards the far
  // end, over the head there and into the shape the arrow went into,
  // which is drawn on top of it.  And half way by length could be right at
  // a corner, with the word hanging off the end of one run and beside the
  // next.
  //
  // Nor is the first choice taken where it is not clear.  Shapes are drawn
  // over the arrows, so a word that reaches into a box is cut off by it --
  // which on a short arrow between two boxes is where the middle puts it --
  // and a word across another arrow is patched over half of that arrow.
  // So the other side of the run is tried, and places further along it --
  // right up against either end of it, too, which on an arrow shorter than
  // the word puts the word over the shoulder of a diamond rather than into
  // the box the arrow meets -- and the other runs; then all of that again
  // further out from the line, by half the height of the words and then by
  // the whole of it, since bigger words need to stand higher to clear the
  // same shoulder.  The first spot that keeps LABEL_ROOM of clear paper
  // from every shape, line and head is the one; where nothing does, the
  // spot that comes nearest to it.
  var LABEL_CLEAR = 9;                   // as label_clear() in layout/blocks.py
  var LABEL_ROOM = 3;                    // clear enough, from anything else
  var LABEL_HANGS = /[gjpqyQ,;()\[\]{}|_$@]/;   // letters that reach below the line
  var LABEL_ALONG = [0.5, 0.3, 0.7, 0.15, 0.85];
  var LABEL_OUT = [0, 0.6, 1.2];         // further out than LABEL_CLEAR, in capitals
  var LABEL_END = 6;                     // a word against the end of a run stops this short

  // How near the segment a-b comes to the box, less `pen`; below nought
  // where they meet.
  function segToBox(a, b, box, pen) {
    var t0 = 0, t1 = 1, dx = b[0] - a[0], dy = b[1] - a[1];
    var sides = [[-dx, a[0] - box.x0], [dx, box.x1 - a[0]],
                 [-dy, a[1] - box.y0], [dy, box.y1 - a[1]]];
    var meets = sides.every(function (pq) {
      if (!pq[0]) { return pq[1] >= 0; }
      var t = pq[1] / pq[0];
      if (pq[0] < 0) { t0 = Math.max(t0, t); } else { t1 = Math.min(t1, t); }
      return t0 <= t1;
    });
    if (meets) { return -pen - 1; }
    function offBox(x, y) {
      return Math.hypot(Math.max(box.x0 - x, 0, x - box.x1),
                        Math.max(box.y0 - y, 0, y - box.y1));
    }
    function offSeg(x, y) {
      var run = dx * dx + dy * dy;
      var t = run ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / run)) : 0;
      return Math.hypot(x - a[0] - dx * t, y - a[1] - dy * t);
    }
    return Math.min(offBox(a[0], a[1]), offBox(b[0], b[1]),
                    offSeg(box.x0, box.y0), offSeg(box.x1, box.y0),
                    offSeg(box.x0, box.y1), offSeg(box.x1, box.y1)) - pen;
  }

  // What a word on an arrow keeps clear of, worked out once a drawing: every
  // shape -- a diamond as the diamond it is, so a word can stand by its
  // point the way the built charts put one, anything else as the box it
  // stands in -- every run of every arrow, every head, and the paper's edge.
  function labelKeep(routes, heads, dx, dy, wide, tall) {
    var shapes = hand.nodes.map(function (n) {
      var t = turned(n), x = t.x + dx, y = t.y + dy;
      var box = { x0: x - t.w / 2, y0: y - t.h / 2, x1: x + t.w / 2, y1: y + t.h / 2 };
      if (n.kind !== "diamond") { return { box: box }; }
      return { box: box, ring: [[x, box.y0], [box.x1, y], [x, box.y1], [box.x0, y]] };
    });
    var runs = [];
    routes.forEach(function (pts) {
      for (var i = 0; pts && i < pts.length - 1; i++) { runs.push([pts[i], pts[i + 1]]); }
    });
    return { shapes: shapes, runs: runs, heads: heads,
             paper: { x0: 0, y0: dy, x1: wide, y1: tall } };
  }

  // The part of all that within reach of one arrow's words: a word never
  // stands further off its arrow than this, so nothing further away can be
  // in its way, and on a big design most of it is further away.
  function labelNearby(keep, pts, reach) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    pts.forEach(function (p) {
      x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]);
      x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]);
    });
    x0 -= reach; y0 -= reach; x1 += reach; y1 += reach;
    function meets(ax, ay, bx, by) { return ax <= x1 && bx >= x0 && ay <= y1 && by >= y0; }
    function along(seg) {
      return meets(Math.min(seg[0][0], seg[1][0]), Math.min(seg[0][1], seg[1][1]),
                   Math.max(seg[0][0], seg[1][0]), Math.max(seg[0][1], seg[1][1]));
    }
    return { paper: keep.paper,
             shapes: keep.shapes.filter(function (s) {
               return meets(s.box.x0, s.box.y0, s.box.x1, s.box.y1);
             }),
             runs: keep.runs.filter(along), heads: keep.heads.filter(along) };
  }

  // How much clear paper a word standing in `box` would have round it:
  // below nought where it would run into something.  Once it is down to
  // `floor` the rest is not looked at -- the spot is no use by then.
  function labelClearance(box, keep, floor) {
    var near = Math.min(box.x0 - keep.paper.x0, box.y0 - keep.paper.y0,
                        keep.paper.x1 - box.x1, keep.paper.y1 - box.y1);
    var i, j;
    for (i = 0; i < keep.shapes.length && near > floor; i++) {
      var s = keep.shapes[i], b = s.box;
      var gapX = Math.max(b.x0 - box.x1, box.x0 - b.x1);
      var gapY = Math.max(b.y0 - box.y1, box.y0 - b.y1);
      if (gapX >= near || gapY >= near) { continue; }  // nowhere near it
      if (!s.ring) {
        near = Math.min(near, gapX > 0 && gapY > 0 ? Math.hypot(gapX, gapY)
                                                   : Math.max(gapX, gapY));
        continue;
      }
      var r = s.ring, rx = (b.x1 - b.x0) / 2, ry = (b.y1 - b.y0) / 2;
      var cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2;
      if (Math.abs(cx - r[0][0]) / rx + Math.abs(cy - r[1][1]) / ry <= 1) {
        near = Math.min(near, -1);            // standing inside it
        continue;
      }
      for (j = 0; j < 4; j++) {
        near = Math.min(near, segToBox(r[j], r[(j + 1) % 4], box, 0.65));
      }
    }
    for (i = 0; i < keep.runs.length && near > floor; i++) {
      near = Math.min(near, segToBox(keep.runs[i][0], keep.runs[i][1], box, 0.65));
    }
    for (i = 0; i < keep.heads.length && near > floor; i++) {   // 8 across its base
      near = Math.min(near, segToBox(keep.heads[i][0], keep.heads[i][1], box, 4.3));
    }
    return near;
  }

  // The spot itself, from the word's measured width and what it has to keep
  // clear of.  Kept apart from the measuring, which needs a page, so that
  // the choice can be tried outside one (tests/router.js).
  function labelPlace(pts, wide, size, drop, keep) {
    var cap = size * 0.72, runs = [];
    for (var i = 0; i < pts.length - 1; i++) {
      runs.push({ a: pts[i], b: pts[i + 1], i: i,
                  len: Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]) });
    }
    runs.sort(function (p, q) {                 // longest first; the first, if two tie
      return Math.abs(q.len - p.len) > 0.5 ? q.len - p.len : p.i - q.i;
    });
    var best = null;
    if (keep) {
      keep = labelNearby(keep, pts, wide + cap + LABEL_CLEAR +
                                    LABEL_OUT[LABEL_OUT.length - 1] * cap + LABEL_ROOM + 4);
    }
    function tryAt(x0, base) {
      var box = { x0: x0, y0: base - cap, x1: x0 + wide, y1: base + drop };
      // no use unless it is clear, or at least clearer than the best so far
      var floor = best ? Math.min(LABEL_ROOM, best.near + 0.01) : -Infinity;
      var near = keep ? labelClearance(box, keep, floor) : LABEL_ROOM;
      if (!best || near > best.near + 0.01) { best = { x: x0, y: base, near: near }; }
      return near >= LABEL_ROOM;
    }
    for (var o = 0; o < LABEL_OUT.length; o++) {
      var off = LABEL_CLEAR + LABEL_OUT[o] * cap;
      for (var r = 0; r < runs.length; r++) {
        var a = runs[r].a, b = runs[r].b, len = runs[r].len || 1;
        var across = Math.abs(b[0] - a[0]) >= Math.abs(b[1] - a[1]);
        var span = across ? wide : cap;         // how much of the run the word takes
        var at = LABEL_ALONG.map(function (t) { return t * len; })
                            .concat([LABEL_END + span / 2, len - LABEL_END - span / 2]);
        // and then everywhere along it, a few pixels at a time, as far as
        // hanging a word's length past either end: an arrow that goes into
        // the notch of a shape, or into the waist of a slanted side, ends
        // inside the box the shape stands in, so against its end is not
        // clear of that box, and only further back is
        var step = Math.max(4, (len + span) / 24);
        for (var s = -span / 2; s <= len + span / 2; s += step) { at.push(s); }
        for (var k = 0; k < at.length; k++) {
          var mx = a[0] + (b[0] - a[0]) * at[k] / len;
          var my = a[1] + (b[1] - a[1]) * at[k] / len;
          var done = across
            ? tryAt(mx - wide / 2, my - off - drop) ||              // above
              tryAt(mx - wide / 2, my + off + cap)                  // below
            : tryAt(mx + off, my + cap / 2) ||                      // right
              tryAt(mx - off - wide, my + cap / 2);                 // left
          if (done) { return best; }
        }
      }
    }
    return best;
  }

  function labelSpot(pts, words, keep) {
    var size = HAND_TYPE * chartPt() / PLAIN_PT;
    var pen = measure.pen || (measure.pen = document.createElement("canvas")
                              .getContext("2d"));
    pen.font = "bold " + size + "px " + (FACES[lettersOf().face] || FACES.sans);
    var wide = pen.measureText(words).width;
    var drop = LABEL_HANGS.test(words) ? size * 0.21 : 0;
    var spot = labelPlace(pts, wide, size, drop, keep);
    return { x: spot.x, y: spot.y, wide: wide, size: size, drop: drop };
  }

  // Where the design's own 0,0 is on the paper.  The paper used to keep its
  // corner there, and everything had to stay right of it and below it, so
  // a chart could only ever be built out to the right: from a Start in the
  // middle of the paper, a No going off to the left ran into the edge
  // after a couple of hundred pixels.  Now the paper reaches out to the
  // left for whatever is put there, a ruled square at a time, and the
  // shapes keep their own numbers while it does -- only where the paper
  // starts moves, so moving one shape still moves one shape and nothing
  // else.  (The top stays put: that is where the flow starts from.)
  var handOrigin = { x: 0, y: 0 };
  var handPaper = null;                  // the drawing that was drawn last

  function handScreenX() {               // the design's 0, across the screen
    var r = chart.getBoundingClientRect();
    return r.left + handOrigin.x * (r.width / (W || 1));
  }
  // A point on the paper, in the design's own numbers.
  function onHand(p) {
    return p && { x: p.x - handOrigin.x, y: p.y - handOrigin.y };
  }

  function drawHand() {
    tidyMany();                          // only shapes still on the paper
    var pad = 40, maxx = 520, maxy = 280, ox = 0, oy = 0, least = Infinity;
    hand.nodes.forEach(function (n) {
      measure(n);
      var room = turned(n);
      n.y = Math.max(room.h / 2 + 20, n.y);
      least = Math.min(least, n.x - room.w / 2);
      maxx = Math.max(maxx, n.x + room.w / 2);
      maxy = Math.max(maxy, n.y + room.h / 2);
    });
    if (least < 20) {                  // out past the left edge: more paper
      ox = Math.ceil((20 - least) / HAND_RULE) * HAND_RULE;
    }
    var key = keyRow();
    oy = key.tall;                     // the chart sits below the key
    var wide = Math.round(Math.max(maxx + pad + ox, (key.wide || 0) + pad));
    var tall = Math.round(maxy + pad + key.tall);
    // Where the design's 0,0 is on the screen before this drawing replaces
    // the last, so the view can be kept still over it afterwards.
    var before = handPaper && handPaper === chart ? handScreenX() : null;

    var out = ['<svg xmlns="http://www.w3.org/2000/svg" id="chart" width="' +
               wide + '" height="' + tall + '" viewBox="0 0 ' + wide + ' ' +
               tall + '">',
               '<rect class="sheet" width="100%" height="100%" fill="#ffffff"/>'];
    var fine = [], major = [], i;
    var ruled = ox / HAND_RULE;        // the heavy lines stay with the shapes
    for (i = 0; i * HAND_RULE <= wide; i++) {
      (((i - ruled) % 5 + 5) % 5 ? fine : major).push("M" + i * HAND_RULE + ",0V" + tall);
    }
    for (i = 0; i * HAND_RULE <= tall; i++) {
      (i % 5 ? fine : major).push("M0," + i * HAND_RULE + "H" + wide);
    }
    out.push('<path class="grid fine" d="' + fine.join("") +
             '" fill="none" stroke="#e7ebf0" stroke-width="0.7"/>');
    out.push('<path class="grid major" d="' + major.join("") +
             '" fill="none" stroke="#d8dfe8" stroke-width="1"/>');
    var letters = lettersOf();
    out.push('<g font-family="' + (FACES[letters.face] || FACES.sans) +
             '" font-size="' + HAND_TYPE * chartPt() / PLAIN_PT + '" ' +
             'fill="none" stroke="#000000" stroke-width="1.3" ' +
             'stroke-linecap="round" stroke-linejoin="round">');

    var tips = [];                     // held back so nothing paints over them
    // Every arrow is routed before any is drawn, so that the word on one
    // can keep clear of all the others, and of their heads.
    var routes = routeAll().map(function (pts) {
      return pts && pts.map(function (p) { return [p[0] + ox, p[1] + oy]; });
    });
    var keep = null;
    if (hand.links.some(function (link) { return link.label; })) {
      var heads = [];
      routes.forEach(function (pts, li) {
        if (!pts || hand.links[li].head === false) { return; }
        var tip = pts[pts.length - 1], back = pts[pts.length - 2];
        var run = Math.hypot(tip[0] - back[0], tip[1] - back[1]) || 1;
        heads.push([tip, [tip[0] - (tip[0] - back[0]) / run * 10,
                          tip[1] - (tip[1] - back[1]) / run * 10]]);
      });
      keep = labelKeep(routes, heads, ox, oy, wide, tall);
    }
    hand.links.forEach(function (link, li) {
      var pts = routes[li];
      if (!pts) { return; }
      if (!link.id) { link.id = hand.nextLink = (hand.nextLink || 0) + 1; }
      var last = pts[pts.length - 1], prev = pts[pts.length - 2];
      var run = Math.hypot(last[0] - prev[0], last[1] - prev[1]) || 1;
      var ux = (last[0] - prev[0]) / run, uy = (last[1] - prev[1]) / run;
      var cx = last[0] - ux * 10, cy = last[1] - uy * 10;
      var d = "M" + pts.map(function (p) { return p[0] + "," + p[1]; }).join("L");
      var look = (link.dash ? ' stroke-dasharray="7 5"' : "") +
                 (link.wide ? ' stroke-width="' + link.wide + '"' : "") +
                 (link.color ? ' stroke="' + link.color + '"' : "");
      // An arrow between two shapes taken up together goes with them.
      var lit = chosen === link.id || (inMany(link.from) && inMany(link.to));
      out.push('<g class="link' + (lit ? " on" : "") +
               '" data-link="' + link.id + '">');
      // A band either side of the line to take hold of it by: a fingertip
      // wide on a touch screen, where a line is a lot to ask a finger to hit.
      out.push('<path class="grab" d="' + d + '" fill="none" stroke="transparent" ' +
               'stroke-width="' + (COARSE ? 32 : 20) + '" pointer-events="stroke" ' +
               'stroke-linecap="round" stroke-linejoin="round"/>');
      out.push('<path class="flow" d="' + d + '" fill="none"' + look + "/>");
      if (link.head !== false) {
        tips.push('<polygon class="head" points="' + last[0] + "," + last[1] + " " +
                 (cx - uy * 4) + "," + (cy + ux * 4) + " " + (cx + uy * 4) + "," +
                 (cy - ux * 4) + '" fill="' + (link.color || "#000000") +
                 '" stroke="' + (link.color || "#000000") + '" ' +
                 'stroke-width="0.6" stroke-linejoin="miter"/>');
      }
      if (link.label) {
        // Along the line, measured -- not at whichever corner happens to
        // sit in the middle of the list of them.  A straight arrow has two
        // points in it, so the middle of that list was the far end of the
        // arrow: the word was written on the arrowhead, and on an arrow
        // pointing rightwards that put it inside the shape it was pointing
        // at, where the shape is drawn over the top of it and nobody ever
        // saw it.  Which is why the False on a decision could be read going
        // one way and not the other.  See labelSpot for where, exactly.
        var spot = labelSpot(pts, link.label, keep);
        // The patch is measured from the words too, as the drawn charts'
        // are: a guess at seven pixels a letter left the end of a wide
        // word bare, with the line showing through it.
        out.push('<rect class="patch" x="' + (spot.x - 4).toFixed(1) + '" y="' +
                 (spot.y - spot.size + 1).toFixed(1) + '" width="' +
                 (spot.wide + 8).toFixed(1) + '" height="' +
                 (spot.size + spot.drop).toFixed(1) +
                 '" fill="#ffffff" stroke="none"/>');
        out.push('<text class="label" x="' + spot.x.toFixed(1) + '" y="' +
                 spot.y.toFixed(1) + '" font-weight="bold" stroke="none" ' +
                 'fill="#000000">' + escaped(link.label) + "</text>");
      }
      out.push("</g>");
    });

    hand.nodes.forEach(function (n) {
      var moved = { kind: n.kind, x: n.x + ox, y: n.y + oy, w: n.w, h: n.h };
      var about = turned(n);           // what it takes up, once turned
      out.push('<g class="node' + (picked === n.id || inMany(n.id) ? " on" : "") +
               '" data-kind="' + n.kind + '" data-i="h' + n.id + '"' +
               (n.turn ? ' transform="rotate(' + n.turn + " " + moved.x + " " +
                         moved.y + ')"' : "") + ">");
      out.push(shapeSvg(moved));
      var lines = String(n.text || "").split("\n");
      // The baseline sits below the middle by about a third of the type,
      // which is what puts the body of the letters on the middle line
      // instead of hanging them off it.
      var mid = moved.y + (WORD_SHIFT[n.kind] || 0) * n.h;
      var type = handType(n);
      var y0 = mid - (lines.length - 1) * type.line / 2 + type.size * 0.35;
      lines.forEach(function (line, k) {
        out.push('<text x="' + moved.x + '" y="' + (y0 + k * type.line).toFixed(1) +
                 '" text-anchor="middle" stroke="none" fill="#000000">' +
                 escaped(line) + "</text>");
      });
      out.push("</g>");
      if (joining && picked && n.id !== picked) {
        // Somewhere to aim for.  Once a line is being drawn, every other
        // shape puts its own dots out, so joining two up is click a dot,
        // click a dot -- no holding the button down and no aiming at a
        // one-pixel line.
        ports(n).forEach(function (port, side) {
          out.push('<circle class="spot" data-i="' + n.id + '" data-side="' +
                   side + '" cx="' +
                   (port.x + ox + port.dx * 1.5) + '" cy="' +
                   (port.y + oy + port.dy * 1.5) + '" r="' + DOT_SPOT + '"/>');
        });
      }
      if (picked === n.id) {
        // A dot on each side, sitting where an arrow would actually meet the
        // shape -- on the slant of a parallelogram, on the point of a
        // diamond -- rather than out on the corner of the box round it.
        // Press and drag from one to draw a line, or just click it and then
        // click where it should go.
        ports(n).forEach(function (port, side) {
          out.push('<circle class="knob' + (joining ? " lit" : "") +
                   '" data-i="' + n.id + '" data-side="' + side + '" cx="' +
                   (port.x + ox + port.dx * 1.5) + '" cy="' +
                   (port.y + oy + port.dy * 1.5) + '" r="' + DOT_KNOB +
                   '" fill="#14427c" stroke="#ffffff" stroke-width="1.5"/>');
        });
        // a corner at every corner, each one anchored to the one opposite,
        // so a shape grows and shrinks from whichever you take hold of --
        // bigger under a finger, as the dots are
        var GRIP = COARSE ? 16 : 9;
        [["nw", -1, -1], ["ne", 1, -1], ["sw", -1, 1], ["se", 1, 1]]
          .forEach(function (corner) {
            out.push('<rect class="grip" data-i="' + n.id +
                     '" data-corner="' + corner[0] + '" x="' +
                     (moved.x + corner[1] * about.w / 2 - GRIP / 2) + '" y="' +
                     (moved.y + corner[2] * about.h / 2 - GRIP / 2) +
                     '" width="' + GRIP + '" height="' + GRIP + '" rx="2" fill="#ffffff" ' +
                     'stroke="#14427c" stroke-width="1.6"/>');
          });
      }
    });
    out.push('<g class="tips">' + tips.join("") + "</g>");
    if (key.art) {
      out.push('<g transform="translate(' + (pad / 2) + ',' + (pad / 2) + ')">' +
               key.art + "</g>");
    }
    guides.forEach(function (g) {
      var d = g[0] ? "M" + (g[1] + ox) + "," + (g[2] + oy) + "V" + (g[3] + oy)
                   : "M" + (g[2] + ox) + "," + (g[1] + oy) + "H" + (g[3] + ox);
      out.push('<path class="guide" d="' + d + '" fill="none"/>');
    });
    out.push("</g></svg>");
    el("#sheet").innerHTML = out.join("\n");
    handOrigin = { x: ox, y: oy };
    bind();
    handPaper = chart;
    // More paper on the left pushes everything on it right, and a paper in
    // the middle of the stage moves half as far again whichever side it
    // grows on -- so a shape being carried out to either side slid away
    // from the mouse as it went.  The view is put back so that nothing on
    // the paper moves but what was moved.
    if (before !== null) { keepStill(handScreenX() - before); }
    paint();
    el("#sub").textContent = TXT.as_chart + " · " + wide + " x " + tall + " px";
    handKeep();
    handChanged();                       // moved on from what Check read
  }

  function escaped(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
  }

