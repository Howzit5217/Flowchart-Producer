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

  // Lining things up.  While a shape is being carried, its middle is watched
  // against the middle of every other shape; come within reach of one and it
  // settles onto it exactly and a red line is drawn through both, so you can
  // see what you have lined it up with.  Red because it has to show against
  // white paper and dark paper and against every color a shape can be
  // painted -- it is not part of the chart, it is only there while you hold
  // the shape, and it should look like it.
  var GUIDE_REACH = 7;                   // how near counts as lined up
  var guides = [];                       // [vertical?, where, from, to]

  function lineUp(node) {
    guides = [];
    var about = turned(node);
    hand.nodes.forEach(function (other) {
      if (other.id === node.id) { return; }
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

  function measure(node, force) {         // how big the words make it
    if (node.own && !force) { return; }   // unless a size was set by hand
    var lines = String(node.text || " ").split("\n");
    var pen = measure.pen || (measure.pen = document.createElement("canvas")
                              .getContext("2d"));
    pen.font = HAND_TYPE + "px Arial, Helvetica, sans-serif";
    var wide = 0;
    lines.forEach(function (line) { wide = Math.max(wide, pen.measureText(line).width); });
    var room = ROOM[node.kind] || ROOM.rect;
    var STEP = HAND_GRID * 2;          // so half of it is a whole quarter
    node.w = Math.max(room[0], Math.round(wide) + (node.kind === "diamond" ? 84 : 40));
    node.h = Math.max(room[1], lines.length * HAND_LINE +
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
      pts.push([a[0], b[1]]);
    } else {
      pts.push([b[0], a[1]]);
    }
    pts.push(b, [q.x, q.y]);
    return tidy(pts);
  }

  function cutsThrough(pts, node, from, to) {   // does any leg cross this shape
    var n = turned(node);
    var x0 = n.x - n.w / 2 + 1, x1 = n.x + n.w / 2 - 1;
    var y0 = n.y - n.h / 2 + 1, y1 = n.y + n.h / 2 - 1;
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

  function linkPath(a, b) {               // corners only, never a diagonal
    var outs = ports(a), ins = ports(b);
    var best = null, bestPrice = Infinity;

    function weigh(pts, i, j) {
      // down out of one and in at the top of the next is how a flowchart
      // reads, so it wins any tie
      var price = priceOf(pts, a, b) - (i === 1 && j === 0 ? 1 : 0);
      if (price < bestPrice) { best = pts; bestPrice = price; }
    }

    for (var i = 0; i < outs.length; i++) {
      for (var j = 0; j < ins.length; j++) {
        weigh(joinPorts(outs[i], ins[j]), i, j);
      }
    }
    if (bestPrice < 10000) { return best; }     // nothing in the way: done

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
    lanesY = closest(lanesY, (a.y + b.y) / 2);
    lanesX = closest(lanesX, (a.x + b.x) / 2);
    for (var k = 0; k < lanesY.length; k++) {
      for (var m = 0; m < 2; m++) {             // out of the top or the foot
        weigh(joinPorts(outs[m], ins[1 - m], lanesY[k]), m, 1 - m);
        weigh(joinPorts(outs[m], ins[m], lanesY[k]), m, m);
      }
    }
    for (k = 0; k < lanesX.length; k++) {
      for (m = 2; m < 4; m++) {                 // out of a side
        weigh(joinPorts(outs[m], ins[5 - m], lanesX[k]), m, 5 - m);
        weigh(joinPorts(outs[m], ins[m], lanesX[k]), m, m);
      }
    }
    return best;
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
    var best = null, howNear = within;
    hand.links.forEach(function (link) {
      var a = nodeById(link.from), b = nodeById(link.to);
      if (!a || !b) { return; }
      var pts = linkPath(a, b);
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
    pen.font = "bold " + HAND_TYPE + "px Arial, Helvetica, sans-serif";
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

  function drawHand() {
    var pad = 40, maxx = 520, maxy = 280, ox = 0, oy = 0;
    hand.nodes.forEach(function (n) {       // the paper keeps its corner, so
      measure(n);                           //   moving one shape moves one
      var room = turned(n);
      n.x = Math.max(room.w / 2 + 20, n.x); //   shape and nothing else
      n.y = Math.max(room.h / 2 + 20, n.y);
      maxx = Math.max(maxx, n.x + room.w / 2);
      maxy = Math.max(maxy, n.y + room.h / 2);
    });
    var key = keyRow();
    oy = key.tall;                     // the chart sits below the key
    var wide = Math.round(Math.max(maxx + pad, (key.wide || 0) + pad));
    var tall = Math.round(maxy + pad + key.tall);

    var out = ['<svg xmlns="http://www.w3.org/2000/svg" id="chart" width="' +
               wide + '" height="' + tall + '" viewBox="0 0 ' + wide + ' ' +
               tall + '">',
               '<rect class="sheet" width="100%" height="100%" fill="#ffffff"/>'];
    var fine = [], major = [], i;
    for (i = 0; i * HAND_RULE <= wide; i++) {
      (i % 5 ? fine : major).push("M" + i * HAND_RULE + ",0V" + tall);
    }
    for (i = 0; i * HAND_RULE <= tall; i++) {
      (i % 5 ? fine : major).push("M0," + i * HAND_RULE + "H" + wide);
    }
    out.push('<path class="grid fine" d="' + fine.join("") +
             '" fill="none" stroke="#e7ebf0" stroke-width="0.7"/>');
    out.push('<path class="grid major" d="' + major.join("") +
             '" fill="none" stroke="#d8dfe8" stroke-width="1"/>');
    out.push('<g font-family="Arial, Helvetica, sans-serif" font-size="' +
             HAND_TYPE + '" ' +
             'fill="none" stroke="#000000" stroke-width="1.3" ' +
             'stroke-linecap="round" stroke-linejoin="round">');

    var tips = [];                     // held back so nothing paints over them
    hand.links.forEach(function (link) {
      var a = nodeById(link.from), b = nodeById(link.to);
      if (!a || !b) { return; }
      if (!link.id) { link.id = hand.nextLink = (hand.nextLink || 0) + 1; }
      var pts = linkPath(a, b).map(function (p) { return [p[0] + ox, p[1] + oy]; });
      var last = pts[pts.length - 1], prev = pts[pts.length - 2];
      var run = Math.hypot(last[0] - prev[0], last[1] - prev[1]) || 1;
      var ux = (last[0] - prev[0]) / run, uy = (last[1] - prev[1]) / run;
      var cx = last[0] - ux * 10, cy = last[1] - uy * 10;
      var d = "M" + pts.map(function (p) { return p[0] + "," + p[1]; }).join("L");
      var look = (link.dash ? ' stroke-dasharray="7 5"' : "") +
                 (link.wide ? ' stroke-width="' + link.wide + '"' : "") +
                 (link.color ? ' stroke="' + link.color + '"' : "");
      out.push('<g class="link' + (chosen === link.id ? " on" : "") +
               '" data-link="' + link.id + '">');
      out.push('<path class="grab" d="' + d + '" fill="none" stroke="transparent" ' +
               'stroke-width="20" pointer-events="stroke" ' +
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
        var mid = pts[Math.floor(pts.length / 2)];
        out.push('<rect class="patch" x="' + (mid[0] + 4) + '" y="' + (mid[1] - 16) +
                 '" width="' + (link.label.length * 7 + 8) + '" height="13" ' +
                 'fill="#ffffff" stroke="none"/>');
        out.push('<text class="label" x="' + (mid[0] + 6) + '" y="' + (mid[1] - 6) +
                 '" font-weight="bold" stroke="none" fill="#000000">' +
                 escaped(link.label) + "</text>");
      }
      out.push("</g>");
    });

    hand.nodes.forEach(function (n) {
      var moved = { kind: n.kind, x: n.x + ox, y: n.y + oy, w: n.w, h: n.h };
      var about = turned(n);           // what it takes up, once turned
      out.push('<g class="node' + (picked === n.id ? " on" : "") +
               '" data-kind="' + n.kind + '" data-i="h' + n.id + '"' +
               (n.turn ? ' transform="rotate(' + n.turn + " " + moved.x + " " +
                         moved.y + ')"' : "") + ">");
      out.push(shapeSvg(moved));
      var lines = String(n.text || "").split("\n");
      // The baseline sits below the middle by about a third of the type,
      // which is what puts the body of the letters on the middle line
      // instead of hanging them off it.
      var mid = moved.y + (WORD_SHIFT[n.kind] || 0) * n.h;
      var y0 = mid - (lines.length - 1) * HAND_LINE / 2 + HAND_TYPE * 0.35;
      lines.forEach(function (line, k) {
        out.push('<text x="' + moved.x + '" y="' + (y0 + k * HAND_LINE).toFixed(1) +
                 '" text-anchor="middle" stroke="none" fill="#000000">' +
                 escaped(line) + "</text>");
      });
      out.push("</g>");
      if (joining && picked && n.id !== picked) {
        // Somewhere to aim for.  Once a line is being drawn, every other
        // shape puts its own dots out, so joining two up is click a dot,
        // click a dot -- no holding the button down and no aiming at a
        // one-pixel line.
        ports(n).forEach(function (port) {
          out.push('<circle class="spot" data-i="' + n.id + '" cx="' +
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
        ports(n).forEach(function (port) {
          out.push('<circle class="knob' + (joining ? " lit" : "") +
                   '" data-i="' + n.id + '" cx="' +
                   (port.x + ox + port.dx * 1.5) + '" cy="' +
                   (port.y + oy + port.dy * 1.5) + '" r="' + DOT_KNOB +
                   '" fill="#14427c" stroke="#ffffff" stroke-width="1.5"/>');
        });
        // a corner at every corner, each one anchored to the one opposite,
        // so a shape grows and shrinks from whichever you take hold of
        [["nw", -1, -1], ["ne", 1, -1], ["sw", -1, 1], ["se", 1, 1]]
          .forEach(function (corner) {
            out.push('<rect class="grip" data-i="' + n.id +
                     '" data-corner="' + corner[0] + '" x="' +
                     (moved.x + corner[1] * about.w / 2 - 4.5) + '" y="' +
                     (moved.y + corner[2] * about.h / 2 - 4.5) +
                     '" width="9" height="9" rx="2" fill="#ffffff" ' +
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
    bind();
    paint();
    el("#sub").textContent = TXT.as_chart + " · " + wide + " x " + tall + " px";
    handKeep();
    handChanged();                       // moved on from what Check read
  }

  function escaped(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;");
  }

