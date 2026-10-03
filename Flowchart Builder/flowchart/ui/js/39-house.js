// ---------------------------------------------------------------------------
//  39-house.js -- a house's own settings, and the 3D view's: the roof in one
//  piece, gutters, a street out front, the land and its size, trees, lights
//  out of doors, the weather; and floors added while building
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-01: "the 3d view has settings for what you can
  // enable like attaching a street and showing accurate land area that you
  // get", "the roof is all one piece", "gutters on the house along with
  // other things", "add lights to other outside of the house", "test it
  // against different weather")
  //
  // What belongs to the house is kept with it, in `hand.house` (a step for
  // Undo, saved with the design); the weather is the view's, like the time
  // of day, and kept in the browser.
  var HOUSE_PLAIN = { roof: "", street: true, land: false, trees: true, gutters: true, porch: true };
  function houseOpt(key) {
    var h = (typeof hand !== "undefined" && hand && hand.house) || {};
    return h[key] === undefined ? HOUSE_PLAIN[key] : h[key];
  }
  function houseSetOpt(key, value) {
    keepUndo();
    var h = Object.assign({}, hand.house || {});
    if (value === HOUSE_PLAIN[key]) { delete h[key]; } else { h[key] = value; }
    if (Object.keys(h).length) { hand.house = h; } else { delete hand.house; }
    if (typeof handKeep === "function") { handKeep(); }
    houseFresh();
  }
  function houseFresh() {
    if (typeof V3 === "undefined" || !V3) { return; }
    if (V3.gl && V3.gl.scenery) { V3.gl.scenery = null; }
    V3.dirty = true;
  }

  // ---- the roof in one piece ---------------------------------------------------------
  // Rooms side by side were roofed a rectangle at a time (roofPlan,
  // 38-view3d.js): an L of rooms, two roofs meeting in a gutter, and a house
  // of rooms of all sizes a roof over each.  In one piece it is the roof a
  // house of that shape has -- every slope as steep, hips and valleys where
  // they meet: over a shape made of rectangles, a roof sloping down to
  // every wall is at each point as high as the square round it that fits
  // in the shape, so it is the highest of the hip roofs over the biggest
  // rectangles that fit, and the view's depth test keeps the highest.
  function roofLines(list, a, b) {
    var all = [];
    list.forEach(function (R) { all.push(R[a], R[b]); });
    all.sort(function (p, q) { return p - q; });
    var lines = [], runs = [];
    all.forEach(function (v) {
      var last = runs[runs.length - 1];
      if (last && v - last[last.length - 1] <= 6) { last.push(v); } else { runs.push([v]); }
    });
    runs.forEach(function (r) { lines.push(r.reduce(function (s, v) { return s + v; }, 0) / r.length); });
    function snap(v) {
      var best = lines[0];
      lines.forEach(function (l) { if (Math.abs(l - v) < Math.abs(best - v)) { best = l; } });
      return best;
    }
    return { lines: lines, snap: snap };
  }
  function houseBuilt(floors, x, y, level) {
    return hand.nodes.some(function (u) {
      if (u.kind !== "i_room") { return false; }
      var fu = floors.length ? floorAt(floors, u.x, u.y) : null;
      return (fu ? fu.level : 0) >= level && insideArea(u, x - (fu ? fu.dx : 0), y - (fu ? fu.dy : 0));
    });
  }
  function roofWhole(rects, floors) {
    var out = [], groups = [];
    rects.forEach(function (R) {
      if (R.turn) { out.push(R); return; }
      var g = groups.filter(function (q) { return q.level === R.level && Math.abs(q.z - R.z) <= 1; })[0];
      if (!g) { g = { level: R.level, z: R.z, rects: [], room: R.room }; groups.push(g); }
      g.rects.push(R);
    });
    var E = houseEave() * FLOOR_PX;
    groups.forEach(function (g) {
      var XS = roofLines(g.rects, "x0", "x1"), YS = roofLines(g.rects, "y0", "y1"), X = XS.lines, Y = YS.lines;
      var snapped = g.rects.map(function (R) { return { x0: XS.snap(R.x0), x1: XS.snap(R.x1), y0: YS.snap(R.y0), y1: YS.snap(R.y1) }; });
      var nx = X.length - 1, ny = Y.length - 1, cov = [];
      for (var i = 0; i < nx; i++) {
        cov.push([]);
        for (var j = 0; j < ny; j++) {
          var cx = (X[i] + X[i + 1]) / 2, cy = (Y[j] + Y[j + 1]) / 2;
          cov[i].push(snapped.some(function (s) { return cx > s.x0 && cx < s.x1 && cy > s.y0 && cy < s.y1; }));
        }
      }
      function rowFull(i0, i1, j) { for (var q = i0; q <= i1; q++) { if (!cov[q][j]) { return false; } } return true; }
      // every biggest rectangle that fits: as wide as it goes, and as tall
      var boxes = [];
      for (var j0 = 0; j0 < ny; j0++) {
        var ok = [];
        for (var a = 0; a < nx; a++) { ok.push(true); }
        for (var j1 = j0; j1 < ny; j1++) {
          for (var b = 0; b < nx; b++) { ok[b] = ok[b] && cov[b][j1]; }
          for (var k = 0; k < nx;) {
            if (!ok[k]) { k++; continue; }
            var i0 = k;
            while (k < nx && ok[k]) { k++; }
            var i1 = k - 1;
            var up = j0 > 0 && rowFull(i0, i1, j0 - 1), down = j1 < ny - 1 && rowFull(i0, i1, j1 + 1);
            if (!up && !down) { boxes.push({ x0: X[i0], x1: X[i1 + 1], y0: Y[j0], y1: Y[j1 + 1] }); }
          }
        }
      }
      // all as steep as each other: as steep as the widest may be
      var half = 0;
      boxes.forEach(function (B) { half = Math.max(half, Math.min(B.x1 - B.x0, B.y1 - B.y0) / 2); });
      // (as steep as the house's style has it, and as high, 39-styles.js)
      var pitch = typeof stylePitch === "function" ? stylePitch() : ROOF_PITCH;
      var ridge = typeof styleRidge === "function" ? styleRidge() : ROOF_RIDGE;
      var slope = half > 0 ? Math.min(pitch, ridge * FLOOR_PX / half) : pitch;
      function covered(x, y) { return boxes.some(function (B) { return x > B.x0 && x < B.x1 && y > B.y0 && y < B.y1; }); }
      boxes.forEach(function (B, n) {
        function open(pts) {
          return pts.some(function (p) { return !covered(p[0], p[1]) && !houseBuilt(floors, p[0], p[1], g.level); });
        }
        var fx = [], fy = [];
        for (var s = 0.05; s < 1; s += 0.1) { fx.push(B.x0 + (B.x1 - B.x0) * s); fy.push(B.y0 + (B.y1 - B.y0) * s); }
        B.eave = {
          n: open(fx.map(function (x) { return [x, B.y0 - 8]; })) ? E : 0,
          s: open(fx.map(function (x) { return [x, B.y1 + 8]; })) ? E : 0,
          w: open(fy.map(function (y) { return [B.x0 - 8, y]; })) ? E : 0,
          e: open(fy.map(function (y) { return [B.x1 + 8, y]; })) ? E : 0
        };
        B.z = g.z; B.level = g.level; B.turn = 0; B.room = g.room; B.k = slope;
        B.bias = n * 0.04;                 // where two slopes are one plane, one of them on top
        B.cover = boxes;
        out.push(B);
      });
    });
    return out;
  }
  // Where gutters run: along each eave, wherever nothing is beyond it.
  function roofRuns(R, floors) {
    if (R.turn || !R.eave) { return []; }
    var runs = [], step = 0.25 * FLOOR_PX;
    function open(x, y) {
      if (R.cover && R.cover.some(function (B) { return B !== R && x > B.x0 && x < B.x1 && y > B.y0 && y < B.y1; })) { return false; }
      return !houseBuilt(floors, x, y, R.level);
    }
    [["n", true, R.y0 - R.eave.n - 4], ["s", true, R.y1 + R.eave.s + 4],
     ["w", false, R.x0 - R.eave.w - 4], ["e", false, R.x1 + R.eave.e + 4]].forEach(function (side) {
      if (!R.eave[side[0]]) { return; }
      var lo = side[1] ? R.x0 : R.y0, hi = side[1] ? R.x1 : R.y1, run = null;
      for (var at = lo + step / 2; at < hi; at += step) {
        var free = side[1] ? open(at, side[2]) : open(side[2], at);
        if (free && !run) { run = { side: side[0], a: at - step / 2, b: at + step / 2 }; runs.push(run); }
        else if (free) { run.b = at + step / 2; }
        else { run = null; }
      }
    });
    runs.forEach(function (r) { r.b = Math.min(r.b, r.side === "n" || r.side === "s" ? R.x1 : R.y1); });
    return runs;
  }
  // ---- what is roofed ------------------------------------------------------------------
  // (2026-10-01: "the weird openings of the home in the center and the black
  // voids")  roofPlan (38-view3d.js) roofs a room, or leaves it to the floor
  // over it, by where its middle is: a hall wider than the floor upstairs
  // was left open to the sky where it stuck out -- and looked down into, it
  // was black, its floor not drawn under a roof.  Here each room is roofed
  // wherever nothing is built over it, the part sticking out from under a
  // smaller floor as well, a rectangle at a time.
  function roofOpenParts(p, covers) {
    var xs = [p.x0, p.x1], ys = [p.y0, p.y1];
    covers.forEach(function (c) {
      [c.x0, c.x1].forEach(function (v) { if (v > p.x0 + 3 && v < p.x1 - 3) { xs.push(v); } });
      [c.y0, c.y1].forEach(function (v) { if (v > p.y0 + 3 && v < p.y1 - 3) { ys.push(v); } });
    });
    function lines(v) { v.sort(function (a, b) { return a - b; }); return v.filter(function (x, i) { return !i || x - v[i - 1] > 1; }); }
    xs = lines(xs); ys = lines(ys);
    var out = [], last = [];
    for (var j = 0; j + 1 < ys.length; j++) {
      var row = [], run = null, cy = (ys[j] + ys[j + 1]) / 2;
      for (var i = 0; i + 1 < xs.length; i++) {
        var cx = (xs[i] + xs[i + 1]) / 2;
        var open = !covers.some(function (c) { return cx > c.x0 && cx < c.x1 && cy > c.y0 && cy < c.y1; });
        if (open && !run) { run = { x0: xs[i], x1: xs[i + 1], y0: ys[j], y1: ys[j + 1] }; row.push(run); }
        else if (open) { run.x1 = xs[i + 1]; }
        else { run = null; }
      }
      // a strip as wide as the one over it goes on down with it
      row = row.map(function (r) {
        var above = last.filter(function (q) { return Math.abs(q.x0 - r.x0) < 0.5 && Math.abs(q.x1 - r.x1) < 0.5 && Math.abs(q.y1 - r.y0) < 0.5; })[0];
        if (above) { above.y1 = r.y1; return above; }
        out.push(r);
        return r;
      });
      last = row;
    }
    return out.filter(function (r) { return r.x1 - r.x0 >= 10 && r.y1 - r.y0 >= 10; });
  }
  // How far a roof hangs out past its walls: as far as the style has it.
  function houseEave() { return typeof styleEave === "function" ? styleEave() : ROOF_EAVE; }
  function roofRooms(floors, upTo, wallTop, base) {
    var E = houseEave() * FLOOR_PX, out = [];
    var placed = hand.nodes.filter(function (n) { return n.kind === "i_room"; }).map(function (r) {
      var f = floors.length ? floorAt(floors, r.x, r.y) : null, q = turned(r), dx = f ? f.dx : 0, dy = f ? f.dy : 0;
      return { r: r, f: f, level: f ? f.level : 0, x0: r.x + dx - q.w / 2, x1: r.x + dx + q.w / 2, y0: r.y + dy - q.h / 2, y1: r.y + dy + q.h / 2 };
    });
    placed.forEach(function (p) {
      var r = p.r;
      if ((r.turn || 0) % 90) { return; }                 // at a slant: roofed as roofPlan roofs it
      if (upTo !== null && upTo !== undefined && p.f && p.level > upTo) { return; }
      // a room inside a room (a closet) is under that one's roof
      if (placed.some(function (o) { return o !== p && o.r.w * o.r.h > r.w * r.h && insideArea(o.r, r.x, r.y); })) { return; }
      var covers = placed.filter(function (o) {
        return o.level > p.level && o.x0 < p.x1 - 1 && o.x1 > p.x0 + 1 && o.y0 < p.y1 - 1 && o.y1 > p.y0 + 1;
      });
      var z = (p.f ? p.f.z : 0) + wallTop(r);
      roofOpenParts(p, covers).forEach(function (b) {
        out.push({ x0: b.x0, x1: b.x1, y0: b.y0, y1: b.y1, z: z, level: p.level, turn: 0, room: r });
      });
    });
    // side by side, and as long as each other: one rectangle, one roof
    for (var joined = true; joined;) {
      joined = false;
      for (var i = 0; i < out.length && !joined; i++) {
        for (var j = i + 1; j < out.length && !joined; j++) {
          var a = out[i], b = out[j];
          if (a.level !== b.level || Math.abs(a.z - b.z) > 1) { continue; }
          var row = Math.abs(a.y0 - b.y0) <= 6 && Math.abs(a.y1 - b.y1) <= 6 && (Math.abs(a.x1 - b.x0) <= 6 || Math.abs(b.x1 - a.x0) <= 6);
          var col = Math.abs(a.x0 - b.x0) <= 6 && Math.abs(a.x1 - b.x1) <= 6 && (Math.abs(a.y1 - b.y0) <= 6 || Math.abs(b.y1 - a.y0) <= 6);
          if (!row && !col) { continue; }
          a.x0 = Math.min(a.x0, b.x0); a.x1 = Math.max(a.x1, b.x1); a.y0 = Math.min(a.y0, b.y0); a.y1 = Math.max(a.y1, b.y1);
          out.splice(j, 1);
          joined = true;
        }
      }
    }
    // the eaves: out over every side that nothing stands against
    out.forEach(function (R) {
      function open(pts) { return pts.every(function (pt) { return !houseBuilt(floors, pt[0], pt[1], R.level); }); }
      var mx = [0.2, 0.5, 0.8].map(function (k) { return R.x0 + (R.x1 - R.x0) * k; });
      var my = [0.2, 0.5, 0.8].map(function (k) { return R.y0 + (R.y1 - R.y0) * k; });
      R.eave = { n: open(mx.map(function (x) { return [x, R.y0 - 8]; })) ? E : 0, s: open(mx.map(function (x) { return [x, R.y1 + 8]; })) ? E : 0,
                 w: open(my.map(function (y) { return [R.x0 - 8, y]; })) ? E : 0, e: open(my.map(function (y) { return [R.x1 + 8, y]; })) ? E : 0 };
    });
    return base.filter(function (R) { return R.turn; }).concat(out);
  }

  // Worked out again only when the rooms change: the view draws sixty
  // times a second while it moves.  (Kept by each room's id: while 3D
  // runs, the rooms are the house put together's copies, 39-join.js.)
  var roofKept = { key: null, out: null }, houseFloorsNow = [];
  if (typeof roofPlan === "function") {
    var roofPlanPieces = roofPlan;
    roofPlan = function (floors, upTo, wallTop) {
      var base = roofPlanPieces.apply(this, arguments);
      houseFloorsNow = floors || [];
      try {
        // (a roof of a style's shape is one roof: 39-styles.js -- over rooms
        // laid side by side for the flat ones, whose slabs must not overlap)
        var shape = typeof styleRoofShape === "function" ? styleRoofShape() : "hip";
        var one = houseOpt("roof") === "one" || shape !== "hip", gut = !!houseOpt("gutters");
        var whole = one && !STYLE_FLATS[shape];
        var key = (one ? "1" : "0") + (gut ? "1" : "0") + shape + houseEave() + (typeof stylePitch === "function" ? stylePitch() : "") +
                  "|" + upTo + "|" + hand.nodes.map(function (r) {
          return r.kind === "i_room" || r.kind === "i_floor" ? [r.id, r.x, r.y, r.w, r.h, r.turn || 0, r.ceil || 0, r.text || ""].join(",") : "";
        }).join(";") + "|" + base.filter(function (R) { return R.turn; }).length;
        if (roofKept.key !== key) {
          var rects = roofRooms(floors, upTo, wallTop, base);
          var made = whole ? roofWhole(rects, floors) : rects;
          made.forEach(function (R) { R.runs = gut ? roofRuns(R, floors) : null; R.roomId = R.room && R.room.id; });
          roofKept = { key: key, out: made };
        }
        return roofKept.out.map(function (R) {
          var room = nodeById(R.roomId);
          return Object.assign({}, R, { room: room || R.room });
        });
      } catch (e) { return base; }
    };
  }

  // ---- gutters, and what runs down from them ------------------------------------------
  // Along every open eave a fascia board and a gutter on it, carried round
  // the corners; a downpipe from it down the wall to a splash block at the
  // corners of the house (and along a long wall), only where it comes down
  // to open ground -- one over a lower roof drains onto it -- and only one
  // at a corner however many roofs meet there.  Drawn with the roof,
  // coming and going with it.
  var GUTTER = "#dedbd4", FASCIA = "#f3f1ec";
  var houseSpouts = [];                  // the downpipes drawn so far, this picture
  // The windows and doors in a wall along `line` (a y for a wall across,
  // an x for one up and down), on floors under `top`: where no downpipe
  // may come down in front of them.
  function gutterHoles(line, across, top) {
    var P = FLOOR_PX, floors = houseFloorsNow || [], out = [];
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_window" && !WALK_DOORS[n.kind]) { return; }
      var f = floors.length ? floorAt(floors, n.x, n.y) : null;
      if (f && f.z > top) { return; }
      var x = n.x + (f ? f.dx : 0), y = n.y + (f ? f.dy : 0), q = turned(n);
      if (Math.abs((across ? y : x) - line) > 0.35 * P) { return; }
      var half = (across ? q.w : q.h) / 2, mid = across ? x : y;
      out.push({ lo: mid - half, hi: mid + half });
    });
    return out;
  }
  function gutterFaces(faces, R, lift, how) {
    if (!R.runs || !R.runs.length) { return; }
    var W = R.x1 - R.x0, D = R.y1 - R.y0, half = Math.min(W, D) / 2;
    var rise = R.k ? half * R.k : Math.min(half * ROOF_PITCH, ROOF_RIDGE * FLOOR_PX), k = R.k || (half > 0 ? rise / half : 0);
    var z = R.z + lift + (R.bias || 0), P = FLOOR_PX, gw = 0.12 * P, gh = 0.1 * P, fh = 0.16 * P, pipe = 0.035 * P;
    var look = { piece: true, color: GUTTER, edge: v3Mix(GUTTER, "#000000", 0.3), alpha: how.alpha, late: how.late };
    var board = { piece: true, color: FASCIA, edge: v3Mix(FASCIA, "#000000", 0.25), alpha: how.alpha, late: how.late };
    R.runs.forEach(function (r) {
      var e = R.eave[r.side], zE = z - e * k, across = r.side === "n" || r.side === "s";
      var out = r.side === "n" || r.side === "w" ? -1 : 1;
      var line = r.side === "n" ? R.y0 : r.side === "s" ? R.y1 : r.side === "w" ? R.x0 : R.x1;
      // carried round the corner where the eave on the next side is open too
      var lo = r.a, hi = r.b, lo0 = across ? R.x0 : R.y0, hi0 = across ? R.x1 : R.y1;
      // (only as far as the roof hangs out there: a gable's rake, R.rake, less than an eave)
      var sb4 = across ? "w" : "n", saft = across ? "e" : "s";
      var before = R.rake && R.rake[sb4] !== undefined ? R.rake[sb4] : R.eave[sb4];
      var after = R.rake && R.rake[saft] !== undefined ? R.rake[saft] : R.eave[saft];
      var atLo = Math.abs(lo - lo0) < 1, atHi = Math.abs(hi - hi0) < 1;
      if (atLo) { lo -= before; }
      if (atHi) { hi += after; }
      function box(a0, a1, b0, b1, z0, z1, l) {
        var pts = across ? [[a0, b0], [a1, b0], [a1, b1], [a0, b1]] : [[b0, a0], [b1, a0], [b1, a1], [b0, a1]];
        v3Prism(faces, pts, z0, z1, l || look);
      }
      function span(u, v) { return [Math.min(u, v), Math.max(u, v)]; }
      var fb = span(line + out * (e - 0.025 * P), line + out * e);           // the fascia, the eave's edge
      box(lo, hi, fb[0], fb[1], zE - fh, zE + 0.02 * P, board);
      var gb = span(line + out * e, line + out * (e + gw));                   // the gutter on it
      box(lo, hi, gb[0], gb[1], zE - gh - 0.02 * P, zE - 0.02 * P);
      // downpipes: at the house's corners, and along a long wall -- moved
      // along it off any window or door they would come down in front of
      // (2026-10-02: "the downspouts to be on the corner edges of the houses
      // too and not blocking windows")
      var ends = [];
      if (atLo) { ends.push({ at: lo0 + 0.25 * P, way: 1 }); }
      if (atHi) { ends.push({ at: hi0 - 0.25 * P, way: -1 }); }
      var many = Math.floor((r.b - r.a) / (11 * P));
      for (var m = 1; m <= many; m++) { ends.push({ at: r.a + (r.b - r.a) * m / (many + 1), way: 0 }); }
      var holes = gutterHoles(line, across, zE);
      function clear(at) {
        return at > r.a + 0.12 * P && at < r.b - 0.12 * P &&
               !holes.some(function (h) { return at > h.lo - 0.15 * P && at < h.hi + 0.15 * P; });
      }
      ends.forEach(function (want) {
        var at = null;
        for (var k = 0; k <= 30 && at === null; k++) {
          var tries = want.way ? [want.at + want.way * k * 0.1 * P] : [want.at + k * 0.1 * P, want.at - k * 0.1 * P];
          for (var q = 0; q < tries.length; q++) { if (clear(tries[q])) { at = tries[q]; break; } }
        }
        if (at === null) { return; }
        var wallOut = line + out * 0.06 * P;
        var gx = across ? at : wallOut, gy = across ? wallOut : at;
        if (houseSpouts.some(function (s) { return Math.hypot(s[0] - gx, s[1] - gy) < 1.2 * P; })) { return; }
        // down to the ground, unless what is under it is a roof lower down
        var fx = across ? at : line + out * 0.3 * P, fy = across ? line + out * 0.3 * P : at;
        if (houseBuilt(houseFloorsNow, fx, fy, 0)) { return; }
        houseSpouts.push([gx, gy]);
        // (where the land falls away from the house, 40-land.js, down to it)
        var ground = typeof terrGround === "function" ? terrGround(gx, gy) : 0;
        var sbx = across ? at : wallOut + out * 0.5 * P, sby = across ? wallOut + out * 0.5 * P : at;
        var under = typeof terrGround === "function" ? terrGround(sbx, sby) : 0;
        var foot = ground + 0.1 * P, p = span(wallOut - pipe, wallOut + pipe);
        box(at - pipe, at + pipe, p[0], p[1], foot + pipe * 2, zE - gh - pipe * 2);                         // down the wall
        var g = span(wallOut, line + out * (e + gw / 2));
        box(at - pipe * 0.9, at + pipe * 0.9, g[0], g[1], zE - gh - pipe * 2, zE - gh);                     // up into the gutter
        var t = span(wallOut, wallOut + out * 0.3 * P);
        box(at - pipe, at + pipe, t[0], t[1], foot, foot + pipe * 2);                                       // the turn out at the foot
        var sb = span(wallOut + out * 0.22 * P, wallOut + out * 0.8 * P);
        box(at - 0.14 * P, at + 0.14 * P, sb[0], sb[1], under - 0.02 * P, under + 0.03 * P, board);         // the splash block
      });
    });
  }
  if (typeof roofFaces === "function") {
    var roofFacesBare = roofFaces;
    roofFaces = function (faces, R, lift, how) {
      // a roof in one piece without the edges of the slopes the rest hide
      // (they were drawn across it, stray lines over the top)
      if (R.k && how) { how = Object.assign({}, how, { bare: true }); }
      var out = roofFacesBare.call(this, faces, R, lift, how);
      try { gutterFaces(faces, R, lift, how || {}); } catch (e) { /* the roof without them */ }
      return out;
    };
  }

  // ---- the street, and the land ---------------------------------------------------------
  // The lot the street runs along the front of: the one drawn, or, where
  // none is, the least a house like this stands on -- the ground floor and
  // what is out of doors by it, the usual setbacks round.
  function houseLotGuess() {
    var floors = typeof floorsOf === "function" ? floorsOf() : [], P = FLOOR_PX;
    var rb = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity }, ob = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    var rooms = hand.nodes.filter(function (n) {
      if (n.kind !== "i_room") { return false; }
      var f = floors.length ? floorAt(floors, n.x, n.y) : null;
      return !f || f.level === 0;
    });
    function grow(b, n) {
      var q = turned(n);
      b.l = Math.min(b.l, n.x - q.w / 2); b.r = Math.max(b.r, n.x + q.w / 2);
      b.t = Math.min(b.t, n.y - q.h / 2); b.b = Math.max(b.b, n.y + q.h / 2);
    }
    rooms.forEach(function (r) { grow(rb, r); });
    if (rb.l === Infinity) { return null; }
    hand.nodes.forEach(function (n) {
      if (n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot" || n.kind === "i_zone" || isFigure(n.kind) || n.kind === "actor") { return; }
      if (rooms.some(function (r) { return insideArea(r, n.x, n.y, 12); })) { return; }
      var q = turned(n);
      if (n.x + q.w / 2 < rb.l - 30 * P || n.x - q.w / 2 > rb.r + 30 * P || n.y + q.h / 2 < rb.t - 30 * P || n.y - q.h / 2 > rb.b + 30 * P) { return; }
      grow(ob, n);
    });
    var sb = lotSetbacks(null);
    var l = Math.min(rb.l - sb.side * P, ob.l - 0.5 * P), r = Math.max(rb.r + sb.side * P, ob.r + 0.5 * P);
    var t = Math.min(rb.t - sb.back * P, ob.t - 0.5 * P), b = Math.max(rb.b + sb.front * P, ob.b);
    return { kind: "i_lot", id: -77, x: (l + r) / 2, y: (t + b) / 2, w: r - l, h: b - t, turn: 0, guessed: true };
  }
  function houseLot() {
    return hand.nodes.filter(function (n) { return n.kind === "i_lot"; })[0] || houseLotGuess();
  }
  // For the scenery (gl3Scenery, 38-view3d-gl.js): the lot the street goes
  // along, or none, the street turned off.
  function houseStreetLot() {
    if (!houseOpt("street")) { return null; }
    return houseLot();
  }
  // What the scenery is made for, besides where the house is.
  function houseSceneKey() {
    return [houseOpt("street") ? 1 : 0, houseOpt("trees") ? 1 : 0, weatherNow(), houseOpt("porch") ? 1 : 0].join("");
  }

  // The street joined to the house: a path from each door out to the front
  // up to the pavement, the drive carried over it to the road, and a
  // mailbox by the path.
  function houseStreetBits(v, lot, lotWorld, lotLocal, hy, walkW, sheetC) {
    var P = FLOOR_PX;
    var pave = gl3Mix([0.74, 0.72, 0.69], sheetC, 0.15), drive = gl3Mix([0.66, 0.66, 0.64], sheetC, 0.12);
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    function ground(n) { var f = floors.length ? floorAt(floors, n.x, n.y) : null; return !f || f.level === 0; }
    var mailDone = false;
    hand.nodes.forEach(function (d) {
      if (!WALK_DOORS[d.kind] || d.kind === "i_garagedoor" || !ground(d)) { return; }
      var q = lotLocal([d.x, d.y]);
      // a door out to the front: room behind it, nothing in front
      var front = lotWorld(q[0], q[1] + 0.7 * P, 0), back = lotWorld(q[0], q[1] - 0.7 * P, 0);
      var inFront = rooms.some(function (r) { return insideArea(r, front[0], front[1]); });
      var behind = rooms.some(function (r) { return insideArea(r, back[0], back[1]); });
      if (inFront || !behind || q[1] > hy) { return; }
      var y0 = q[1] + 0.15 * P, half = 0.6 * P;
      gl3Poly(v, [lotWorld(q[0] - half, y0, -0.6), lotWorld(q[0] + half, y0, -0.6), lotWorld(q[0] + half, hy, -0.6), lotWorld(q[0] - half, hy, -0.6)],
              [0, 0, 1], pave, 1, [[0, 0], [1.2, 0], [1.2, (hy - y0) / P], [0, (hy - y0) / P]], PAT.walk);
      if (!mailDone) {
        mailDone = true;
        var mb = lotWorld(q[0] + half + 0.6 * P, hy - 0.4 * P, 0);
        gl3Prism(v, mb, 0.04 * P, 0.04 * P, 0, 1.0 * P, 4, gl3Mix([0.42, 0.33, 0.25], sheetC, 0.1), PAT.plain);
        gl3Prism(v, [mb[0], mb[1]], 0.16 * P, 0.16 * P, 1.0 * P, 1.22 * P, 6, gl3Mix([0.2, 0.21, 0.23], sheetC, 0.1), PAT.plain);
      }
    });
    // drives carried on to the road
    hand.nodes.forEach(function (w) {
      if (w.kind !== "i_driveway" || !ground(w)) { return; }
      var q = lotLocal([w.x, w.y]), t = (((w.turn || 0) - (lot.turn || 0)) % 180 + 180) % 180;
      if (t !== 0) { return; }
      var end = q[1] + w.h / 2;
      if (end > hy + walkW || end < hy - 3 * P) { return; }
      gl3Poly(v, [lotWorld(q[0] - w.w / 2, end, -0.5), lotWorld(q[0] + w.w / 2, end, -0.5), lotWorld(q[0] + w.w / 2, hy + walkW, -0.5),
                  lotWorld(q[0] - w.w / 2, hy + walkW, -0.5)], [0, 0, 1], drive, 1, null, PAT.concrete);
    });
  }

  // Lines round the land and its corner stakes, the room to build on
  // dashed inside them, each edge's length, and what it all comes to.
  function landFaces(model) {
    var lot = houseLot();
    if (!lot) { return null; }
    var P = FLOOR_PX, a = (lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    function W(lx, ly) { return [lot.x + lx * c - ly * s, lot.y + lx * s + ly * c]; }
    var hw = lot.w / 2, hh = lot.h / 2, band = 0.12 * P;
    var line = { color: "#ffffff", edge: "#ffffff", piece: true }, stake = { piece: true, color: "#f08a24", edge: "#9a4f10" };
    function strip(x0, y0, x1, y1, how, z) {
      var pts = [W(x0, y0), W(x1, y0), W(x1, y1), W(x0, y1)].map(function (p) { return [p[0], p[1], z]; });
      model.faces.push({ pts: pts, n: [0, 0, 1], how: how, top: true });
    }
    strip(-hw, -hh, hw, -hh + band, line, 0.4); strip(-hw, hh - band, hw, hh, line, 0.4);
    strip(-hw, -hh, -hw + band, hh, line, 0.4); strip(hw - band, -hh, hw, hh, line, 0.4);
    [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].forEach(function (k) {
      var x = k[0] - Math.sign(k[0]) * 0.06 * P, y = k[1] - Math.sign(k[1]) * 0.06 * P;
      v3Prism(model.faces, [W(x - 0.05 * P, y - 0.05 * P), W(x + 0.05 * P, y - 0.05 * P), W(x + 0.05 * P, y + 0.05 * P), W(x - 0.05 * P, y + 0.05 * P)],
              0, 0.55 * P, stake);
    });
    // the line the house is kept inside, dashed
    var m = lotMeasure(Object.assign({}, lot)), e = m.env, dash = 0.6 * P, gap = 0.4 * P, thin = 0.06 * P;
    var soft = { piece: true, color: "#fff4c2", edge: "#fff4c2" };
    if (e.w > P && e.h > P) {
      for (var x = e.l; x < e.r; x += dash + gap) {
        strip(x, e.t, Math.min(e.r, x + dash), e.t + thin, soft, 0.3); strip(x, e.b - thin, Math.min(e.r, x + dash), e.b, soft, 0.3);
      }
      for (var y = e.t; y < e.b; y += dash + gap) {
        strip(e.l, y, e.l + thin, Math.min(e.b, y + dash), soft, 0.3); strip(e.r - thin, y, e.r, Math.min(e.b, y + dash), soft, 0.3);
      }
    }
    // each edge's length, at its middle
    var unit = TXT.fp_unit || "m";
    [[0, -hh, lot.w], [0, hh, lot.w], [-hw, 0, lot.h], [hw, 0, lot.h]].forEach(function (k) {
      var p = W(k[0], k[1]);
      model.labels.push({ x: p[0], y: p[1], z: 0.5 * P, text: lengthSays(k[2]) + " " + unit });
    });
    return { lot: lot, m: m };
  }

  // What the land comes to, said in the corner of the view.
  function landCard(got) {
    if (!V3 || !V3.box) { return; }
    var card = el(".v3-land", V3.box);
    if (!got || V3.scene === "space") { if (card) { card.remove(); } return; }
    if (!card) {
      card = document.createElement("div");
      card.className = "v3-land";
      card.setAttribute("role", "status");
      V3.box.appendChild(card);
    }
    var lot = got.lot, m = got.m, unit = TXT.fp_unit || "m";
    var m2 = lot.w * lot.h / (FLOOR_PX * FLOOR_PX), big;
    if (feetHere()) { big = say("land_acres", { n: (m2 / 4046.86).toFixed(m2 < 4046.86 ? 2 : 1) }); }
    else { big = say("land_ha", { n: (m2 / 10000).toFixed(m2 < 10000 ? 3 : 2) }); }
    // every floor's rooms (a closet in a bedroom counted once, in the bedroom)
    var all = 0;
    hand.nodes.forEach(function (r) {
      if (r.kind !== "i_room") { return; }
      if (hand.nodes.some(function (o) { return o !== r && o.kind === "i_room" && o.w * o.h > r.w * r.h && insideArea(o, r.x, r.y); })) { return; }
      all += r.w * r.h;
    });
    var lines = [
      [lot.guessed ? TXT.land_guess : TXT.land_head, true],
      [say("lot_says", { w: lengthSays(lot.w), d: lengthSays(lot.h), unit: unit, area: areaSays(lot.w * lot.h) }) + " (" + big + ")"],
      [say("lot_build", { w: lengthSays(m.env.w), d: lengthSays(m.env.h), unit: unit, area: areaSays(m.build) })],
      [say("land_house", { ground: areaSays(m.house), all: areaSays(all) })],
      [say("lot_yard", { area: areaSays(m.yard) }) + " · " + say("land_cover", { n: Math.round(100 * m.house / Math.max(1, lot.w * lot.h)) })]
    ];
    var html = lines.map(function (l) { return "<div" + (l[1] ? ' class="v3-land-head"' : "") + ">" + escaped(l[0]) + "</div>"; }).join("");
    if (card.innerHTML !== html) { card.innerHTML = html; }
  }

  // ---- lights out of doors ---------------------------------------------------------------
  // A lantern by every door out, if wanted, and whatever lights are put
  // down outside -- a lamp post, a path light, a floodlight, a lantern on
  // the wall -- each lighting what is round it after dark.
  var OUT_LIGHTS = { i_lamppost: [2.3, 6.5], i_pathlight: [0.5, 2.2], i_floodlight: [2.6, 9], i_porchlight: [2.0, 4.2] };
  var houseLightsNow = [];
  function porchFaces(model) {
    var P = FLOOR_PX, rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var lit = [];
    hand.nodes.forEach(function (d) {
      if (!WALK_DOORS[d.kind] || d.kind === "i_garagedoor") { return; }
      var f = floors.length ? floorAt(floors, d.x, d.y) : null;
      if (f && f.level !== 0) { return; }
      // which side is out of doors
      var t = (d.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t);
      var aIn = rooms.some(function (r) { return insideArea(r, d.x + ux * 0.8 * P, d.y + uy * 0.8 * P); });
      var bIn = rooms.some(function (r) { return insideArea(r, d.x - ux * 0.8 * P, d.y - uy * 0.8 * P); });
      if (aIn === bIn) { return; }
      var sx = aIn ? -ux : ux, sy = aIn ? -uy : uy;          // out
      // the wall's face: where the door's room ends that way
      var room = rooms.filter(function (r) { return insideArea(r, d.x - sx * 0.8 * P, d.y - sy * 0.8 * P); })[0];
      if (!room) { return; }
      var q = turned(room), face = Math.abs(sx) > 0.5 ? room.x + Math.sign(sx) * q.w / 2 : room.y + Math.sign(sy) * q.h / 2;
      var side = d.w / 2 + 0.35 * P;
      var at = Math.abs(sx) > 0.5 ? [face + sx * 0.08 * P, d.y + side] : [d.x + side, face + sy * 0.08 * P];
      var box = [[at[0] - 0.09 * P, at[1] - 0.09 * P], [at[0] + 0.09 * P, at[1] - 0.09 * P], [at[0] + 0.09 * P, at[1] + 0.09 * P], [at[0] - 0.09 * P, at[1] + 0.09 * P]];
      v3Prism(model.faces, box, 1.85 * P, 2.15 * P, { piece: true, color: "#fff1d0", edge: "#2a2c2e", pat: 31 });
      v3Prism(model.faces, box.map(function (p) { return [at[0] + (p[0] - at[0]) * 1.25, at[1] + (p[1] - at[1]) * 1.25]; }),
              2.15 * P, 2.22 * P, { piece: true, color: "#2a2c2e", edge: "#2a2c2e" });
      lit.push([at[0], at[1], 2.0 * P, 4.2 * P]);
    });
    return lit;
  }
  function houseLights() { return houseLightsNow; }

  // ---- the house in 3D, dressed -----------------------------------------------------------
  if (typeof v3Build === "function") {
    var v3BuildHouse = v3Build;
    v3Build = function () {
      houseSpouts = [];                  // a downpipe a corner, counted afresh each picture
      var model = v3BuildHouse.apply(this, arguments);
      houseLightsNow = [];
      if (!V3 || V3.scene === "space" || !tieHomeLike()) { landCard(null); return model; }
      try {
        var floors = typeof floorsOf === "function" ? floorsOf() : [];
        // the lights put down out of doors, where their floor is shown
        hand.nodes.forEach(function (n) {
          if (!OUT_LIGHTS[n.kind]) { return; }
          var f = floors.length ? floorAt(floors, n.x, n.y) : null;
          houseLightsNow.push([n.x + (f ? f.dx : 0), n.y + (f ? f.dy : 0), (f ? f.z : 0) + OUT_LIGHTS[n.kind][0] * FLOOR_PX,
                               OUT_LIGHTS[n.kind][1] * FLOOR_PX]);
        });
        if (houseOpt("porch") && !(V3.mode === "walk" && V3.inRoom)) {
          houseLightsNow = houseLightsNow.concat(porchFaces(model));
        }
        var under = V3.upTo !== null && V3.upTo !== undefined && V3.upTo < 0 && V3.mode !== "walk";
        if (under) {
          // looking at a floor under the ground: the ground lifted off it
          model.faces = model.faces.filter(function (f) { return !f.ground; });
        }
        var got = houseOpt("land") && !under && !(V3.flat && V3.flatDone) ? landFaces(model) : null;
        landCard(got);
      } catch (e) { landCard(null); }
      return model;
    };
  }
  function tieHomeLike() { return typeof boardName === "function" && boardName() === "home"; }
  // Looking at a floor under the ground, there is no garden in the way.
  function houseUnder() {
    return !!(V3 && V3.upTo !== null && V3.upTo !== undefined && V3.upTo < 0 && V3.mode !== "walk");
  }

  // ---- the weather ----------------------------------------------------------------------------
  // Clear, cloudy, rain, a storm, snow or fog: the sky and the light it
  // gives -- an overcast sky leaves soft shadows, or none -- wet ground,
  // snow lying on the roof and the garden, mist; and over the picture,
  // what is falling.  Kept, like the time of day, in the browser.
  var WEATHERS = ["clear", "cloudy", "rain", "storm", "snow", "fog"];
  var WEATHER_LOOK = {
    //        sun   sky light  cover  fog   grey  dark
    clear:  [1.0,  1.0,  0.0,  1.0,  0.0,  0.0],
    cloudy: [0.38, 1.12, 0.75, 1.0,  0.45, 0.06],
    rain:   [0.2,  1.0,  0.95, 0.45, 0.6,  0.2],
    storm:  [0.1,  0.85, 1.0,  0.3,  0.7,  0.38],
    snow:   [0.32, 1.25, 0.9,  0.5,  0.55, 0.0],
    fog:    [0.28, 1.15, 0.6,  0.07, 0.75, 0.04]
  };
  function weatherNow() {
    try { var w = localStorage.getItem("flowchart-3d-weather"); if (WEATHERS.indexOf(w) >= 0) { return w; } } catch (e) { /* none kept */ }
    return "clear";
  }
  function weatherSet(w) {
    try { localStorage.setItem("flowchart-3d-weather", w); } catch (e) { /* this visit only */ }
    houseFresh();
    weatherRun();
  }
  function weatherLook() { return WEATHER_LOOK[weatherNow()] || WEATHER_LOOK.clear; }
  // How much snow lies (0 to 1), and how wet it is.
  function houseSnow() { return weatherNow() === "snow" ? 1 : 0; }
  function houseWet() { var w = weatherNow(); return w === "rain" || w === "storm" ? 1 : 0; }
  function houseFog() { return weatherLook()[3]; }
  function houseCover() { return weatherLook()[2]; }
  if (typeof gl3SkyNow === "function") {
    var gl3SkyNowClear = gl3SkyNow;
    gl3SkyNow = function () {
      var s = gl3SkyNowClear.apply(this, arguments), L = weatherLook();
      if (L === WEATHER_LOOK.clear) { return s; }
      var grey = [0.62, 0.65, 0.68], k = L[4], dark = L[5];
      function dim(c, by) { return c.map(function (v) { return v * by; }); }
      var out = Object.assign({}, s);
      out.sunCol = dim(s.sunCol, L[0]);
      out.skyAmb = dim(gl3Mix(s.skyAmb, grey, k * 0.5), L[1] * (1 - dark * 0.6));
      out.groundAmb = dim(s.groundAmb, L[1] * (1 - dark * 0.5));
      out.zenith = dim(gl3Mix(s.zenith, gl3Mix(grey, [0.3, 0.32, 0.36], s.night), k), 1 - dark);
      out.horizon = dim(gl3Mix(s.horizon, gl3Mix([0.78, 0.8, 0.82], [0.32, 0.34, 0.37], s.night), k), 1 - dark * 0.8);
      out.cloud = dim(gl3Mix(s.cloud, [0.7, 0.72, 0.75], k), 1 - dark);
      out.glow = dim(s.glow, 1 - L[2] * 0.85);
      return out;
    };
  }

  // What is falling, drawn over the picture: rain in streaks, snow
  // drifting, a flash now and then in a storm, mist from the ground up.
  var weatherBits = null;
  function weatherRun() {
    if (!V3 || !V3.box) { return; }
    var w = weatherNow(), still = typeof STILL !== "undefined" && STILL;
    var cv = el(".v3-weather", V3.box);
    if (w === "clear" || w === "cloudy" || V3.scene === "space") { if (cv) { cv.remove(); } weatherBits = null; return; }
    if (!cv) {
      cv = document.createElement("canvas");
      cv.className = "v3-weather";
      cv.setAttribute("aria-hidden", "true");
      var after = el(".v3-bar", V3.box);
      V3.box.insertBefore(cv, after ? after : V3.box.firstChild);
    }
    var box = V3.box, rnd = gl3Rand(7), drops = [];
    for (var i = 0; i < (w === "snow" ? 260 : w === "fog" ? 0 : 420); i++) {
      drops.push({ x: rnd(), y: rnd(), s: 0.6 + rnd() * 0.8, p: rnd() * 6.28 });
    }
    var me = { w: w, cv: cv, drops: drops, flash: 0, next: 2 + Math.random() * 5, t0: performance.now() };
    weatherBits = me;
    function frame(now) {
      if (weatherBits !== me || !V3 || V3.box !== box || !box.isConnected) { return; }
      var dpr = window.devicePixelRatio || 1, W = Math.max(1, box.clientWidth), H = Math.max(1, box.clientHeight);
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      var g = cv.getContext("2d"), t = (now - me.t0) / 1000;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);
      var night = V3.tod ? Math.min(1, V3.tod / 2) : 0;
      if (me.w === "fog" || me.w === "rain" || me.w === "storm" || me.w === "snow") {
        // mist, thicker low down and far off
        var thick = me.w === "fog" ? 0.55 : me.w === "snow" ? 0.18 : 0.14;
        var mist = g.createLinearGradient(0, 0, 0, H);
        var tone = night > 0.5 ? "60,66,76" : "226,230,234";
        mist.addColorStop(0, "rgba(" + tone + "," + (thick * 0.8) + ")");
        mist.addColorStop(0.55, "rgba(" + tone + "," + (thick * 0.45) + ")");
        mist.addColorStop(1, "rgba(" + tone + "," + (thick * 0.7) + ")");
        g.fillStyle = mist; g.fillRect(0, 0, W, H);
      }
      if (me.w === "rain" || me.w === "storm") {
        var slant = me.w === "storm" ? 0.32 : 0.12, len = me.w === "storm" ? 26 : 20;
        g.strokeStyle = night > 0.5 ? "rgba(170,185,205,0.5)" : "rgba(205,215,228,0.55)";
        g.lineWidth = 1;
        g.beginPath();
        me.drops.forEach(function (d) {
          var y = ((d.y + t * 1.25 * d.s) % 1) * (H + len) - len, x = ((d.x + t * slant * 0.3) % 1) * W;
          g.moveTo(x, y); g.lineTo(x - len * slant, y + len * d.s);
        });
        g.stroke();
      }
      if (me.w === "snow") {
        g.fillStyle = "rgba(255,255,255,0.88)";
        me.drops.forEach(function (d) {
          var y = ((d.y + t * 0.07 * d.s) % 1) * (H + 8) - 4, x = ((d.x + Math.sin(t * 0.8 + d.p) * 0.012) % 1 + 1) % 1 * W;
          g.beginPath(); g.arc(x, y, 1.1 + d.s * 1.3, 0, 7); g.fill();
        });
      }
      if (me.w === "storm") {
        me.next -= 1 / 60;
        if (me.next <= 0) { me.flash = 1; me.next = 3 + Math.random() * 7; }
        if (me.flash > 0.01) { g.fillStyle = "rgba(235,240,255," + (me.flash * 0.55) + ")"; g.fillRect(0, 0, W, H); me.flash *= 0.82; }
      }
      if (!still) { requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }

  // How the house stands up to it: said under the weather in Settings.
  function weatherSays() {
    var w = weatherNow();
    if (w === "clear" || w === "cloudy" || w === "fog") { return ""; }
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var top = 0;
    hand.nodes.forEach(function (r) {
      if (r.kind !== "i_room") { return; }
      var f = floors.length ? floorAt(floors, r.x, r.y) : null;
      if (houseBuilt(floors, r.x + (f ? f.dx : 0), r.y + (f ? f.dy : 0), (f ? f.level : 0) + 1)) { return; }
      if (hand.nodes.some(function (o) { return o !== r && o.kind === "i_room" && o.w * o.h > r.w * r.h && insideArea(o, r.x, r.y); })) { return; }
      top += r.w * r.h;
    });
    if (!top) { return ""; }
    var m2 = top / (FLOOR_PX * FLOOR_PX) * 1.12, ft2 = m2 * 10.7639;   // the roof's plan, with its eaves
    function n(v) { return Math.round(v).toLocaleString(typeof LANG === "string" ? LANG : "en"); }
    if (w === "snow") {
      // wet snow: 30 cm of it about 100 kg a square metre; a foot, 20 lb a square foot
      return feetHere() ? say("wx_says_snow_ft", { lb: n(ft2 * 20) }) : say("wx_says_snow", { kg: n(m2 * 100) });
    }
    // 25 mm of rain is 25 liters a square metre; an inch, 0.623 gallons a square foot
    var said = feetHere() ? say("wx_says_rain_ft", { gal: n(ft2 * 0.623) }) : say("wx_says_rain", { l: n(m2 * 25) });
    return said + " " + (houseOpt("gutters") ? TXT.wx_gutters : TXT.wx_no_gutters);
  }

  // ---- the view's bar, put together -------------------------------------------------------------
  // (2026-10-01: "the UI of those buttons on the top looks rushed and not
  // put together")  The view's buttons in groups -- walking through; how it
  // is looked at; what is shown; the time, the materials and the settings;
  // what is done -- each with a line picture of what it does, the words
  // beside it where there is room and under the pointer where there is not;
  // and the hint off the bar, in a corner of the picture.
  var HOUSE_ICONS = {
    run: '<path d="M7 4.6v10.8l8.4-5.4z"/>',
    walk: '<circle cx="11" cy="3.8" r="1.6"/><path d="M9.6 7.2 7 9.6l1 3.4M9.6 7.2l2.6 1.8 2.4.2M9.6 7.2l-.4 5.2 2.6 2.6.6 3.4M9.2 12.4 7.4 15.8l-2 1.8"/>',
    above: '<path d="M2.5 10s2.8-5 7.5-5 7.5 5 7.5 5-2.8 5-7.5 5-7.5-5-7.5-5z"/><circle cx="10" cy="10" r="2.3"/>',
    flat: '<rect x="3.5" y="3.5" width="13" height="13" rx="1.5"/><path d="M3.5 10.5h7m0-7v13M10.5 13h6"/>',
    cube: '<path d="M10 2.6 16.6 6.3v7.4L10 17.4 3.4 13.7V6.3z"/><path d="M3.4 6.3 10 10l6.6-3.7M10 10v7.4"/>',
    roof: '<path d="M2.6 10.4 10 3.6l7.4 6.8"/><path d="M5 8.6v7.8h10V8.6"/><path d="M8.4 16.4v-4h3.2v4"/>',
    labels: '<path d="M3.5 4.5h7.2l5.8 5.5-5.8 5.5H3.5z"/><circle cx="7" cy="10" r="1.2"/>',
    low: '<path d="M3 16.5h14M3 12.5h14M3 8.5h14M3 8.5v8M17 8.5v8M7.6 8.5v4M12.4 8.5v4M10 12.5v4M5.3 12.5v4M14.7 12.5v4"/>',
    level: '<path d="M3 13.8 10 17l7-3.2"/><path d="M3 10.4 10 13.6l7-3.2"/><path d="M10 3.4 17 6.8 10 10 3 6.8z"/>',
    fit: '<path d="M7.5 3.5h-4v4M12.5 3.5h4v4M7.5 16.5h-4v-4M12.5 16.5h4v-4"/>',
    advice: '<path d="M7.2 12.6c-1.4-1-2.2-2.5-2.2-4.2a5 5 0 0 1 10 0c0 1.7-.8 3.2-2.2 4.2v1.8H7.2z"/><path d="M7.6 16.6h4.8"/>',
    day: '<circle cx="10" cy="10" r="3.4"/><path d="M10 2.6v2M10 15.4v2M2.6 10h2M15.4 10h2M4.8 4.8l1.4 1.4M13.8 13.8l1.4 1.4M4.8 15.2l1.4-1.4M13.8 6.2l1.4-1.4"/>',
    evening: '<path d="M3 14.6h14M5.6 14.6a4.4 4.4 0 0 1 8.8 0"/><path d="M10 5.4v2.2M4.6 8.4l1.4 1.2M15.4 8.4 14 9.6M6.4 17.4h7.2"/>',
    night: '<path d="M15.6 12.4A6.2 6.2 0 0 1 7.6 4.4a6.2 6.2 0 1 0 8 8z"/>',
    save: '<path d="M3 6.6h3l1.4-2h5.2l1.4 2h3v9H3z"/><circle cx="10" cy="11" r="2.8"/>',
    mats: '<path d="M10 3a7 7 0 1 0 0 14c1.2 0 1.6-.8 1.2-1.6-.6-1.2.2-2.2 1.4-2.2h1.6A2.8 2.8 0 0 0 17 10.4 7.2 7.2 0 0 0 10 3z"/><circle cx="6.6" cy="9" r="1"/><circle cx="9.4" cy="6.2" r="1"/><circle cx="13" cy="7.4" r="1"/>',
    set: '<path d="M4 5.5h7M14 5.5h2M4 10h2M9 10h7M4 14.5h7M14 14.5h2"/><circle cx="12.5" cy="5.5" r="1.5"/><circle cx="7.5" cy="10" r="1.5"/><circle cx="12.5" cy="14.5" r="1.5"/>',
    gutter: '<path d="M2.6 8.6 10 3.4l7.4 5.2"/><path d="M2.4 9.4h15.2v1.8H2.4zM15.4 11.2v5.4h1.8"/>',
    lantern: '<path d="M7 6h6v8H7zM6 6h8M8.4 6 10 3.4 11.6 6M8 16h4"/><path d="M10 8.4v3.2"/>',
    street: '<path d="M6 3.4 3.4 16.6M14 3.4l2.6 13.2M10 4.4v2M10 9v2M10 13.6v2"/>',
    land: '<path d="M3.4 6.4 10 3.4l6.6 3v9.2L10 18.6 3.4 15.6z"/><path d="M6.6 9.4v4M13.4 9.4v4"/>',
    tree: '<path d="M10 17v-4.4"/><path d="M10 2.8 5 9.4h2.6L4.4 13.4h11.2l-3.2-4H15z"/>',
    drop: '<path d="M10 3.2s4.6 5.2 4.6 8.4a4.6 4.6 0 0 1-9.2 0C5.4 8.4 10 3.2 10 3.2z"/>',
    wx_clear: '<circle cx="10" cy="10" r="3.6"/><path d="M10 2.4v2.2M10 15.4v2.2M2.4 10h2.2M15.4 10h2.2M4.6 4.6l1.6 1.6M13.8 13.8l1.6 1.6M4.6 15.4l1.6-1.6M13.8 6.2l1.6-1.6"/>',
    wx_cloudy: '<path d="M6 15.4h8.4a3.2 3.2 0 0 0 .4-6.4 4.6 4.6 0 0 0-8.8-.8A3.6 3.6 0 0 0 6 15.4z"/>',
    wx_rain: '<path d="M6 12.4h8.4a3 3 0 0 0 .4-6 4.4 4.4 0 0 0-8.4-.8A3.4 3.4 0 0 0 6 12.4z"/><path d="M7 14.6l-.8 2M10.4 14.6l-.8 2M13.8 14.6l-.8 2"/>',
    wx_storm: '<path d="M6 11.6h8.4a3 3 0 0 0 .4-6 4.4 4.4 0 0 0-8.4-.8A3.4 3.4 0 0 0 6 11.6z"/><path d="M10.6 11.6 8.6 14.8h2.6l-1.6 3"/>',
    wx_snow: '<path d="M10 2.8v14.4M3.8 6.4l12.4 7.2M3.8 13.6l12.4-7.2"/><path d="M8.4 3.8 10 5.2l1.6-1.4M8.4 16.2 10 14.8l1.6 1.4"/>',
    wx_fog: '<path d="M3.4 7h13.2M5 10h10M3.4 13h13.2M6.4 16h7.2"/>',
    bed: '<path d="M2.6 15.6V5.4M2.6 12.4h14.8v3.2M2.6 10h14.8v2.4M5 10V8.2a1.4 1.4 0 0 1 1.4-1.4h2.4A1.4 1.4 0 0 1 10.2 8.2V10"/>',
    bath: '<path d="M2.6 10h14.8v2.2a3.6 3.6 0 0 1-3.6 3.6H6.2a3.6 3.6 0 0 1-3.6-3.6zM4.4 10V5a1.8 1.8 0 0 1 3.4-.8M5.6 15.8l-.8 1.6M14.4 15.8l.8 1.6"/>',
    floor1: '<path d="M2.6 10.4 10 4.4l7.4 6M4.6 9v7.4h10.8V9M8.6 16.4v-3.6h2.8v3.6"/>',
    floor2: '<path d="M3 8.2 10 2.8l7 5.4M4.6 7v9.4h10.8V7M4.6 11.4h10.8M8.6 16.4v-3h2.8v3M7 9.2h1.6M11.4 9.2H13"/>',
    basement: '<path d="M2.6 7.4 10 2.6l7.4 4.8M4.6 6.2v5.6h10.8V6.2M2 11.8h16"/><path d="M5.6 13.6h8.8v3.8H5.6z" stroke-dasharray="1.6 1.4"/>',
    kitchen: '<path d="M3.4 8.6h13.2v1.8a5 5 0 0 1-5 5H8.4a5 5 0 0 1-5-5zM10 8.6V5.4M7 6.2l-.6-2M13 6.2l.6-2M2.4 8.6h1M16.6 8.6h1"/>',
    living: '<path d="M3.6 10V7.6a1.6 1.6 0 0 1 1.6-1.6h9.6a1.6 1.6 0 0 1 1.6 1.6V10"/><path d="M2.6 10.4a1.4 1.4 0 0 1 2.8 0v1.6h9.2v-1.6a1.4 1.4 0 0 1 2.8 0v4.2H2.6z"/><path d="M4.4 14.6v1.6M15.6 14.6v1.6"/>',
    office: '<path d="M2.6 9h14.8M4.4 9v7.4M15.6 9v7.4M6 9V3.6h8V9M8.6 12h2.8"/>',
    laundry: '<rect x="4" y="3" width="12" height="14" rx="1.6"/><circle cx="10" cy="11" r="3.4"/><path d="M6.4 5.6h1.4M10 5.6h3.6"/>',
    car: '<path d="M3.4 12.4 5 7.6a1.8 1.8 0 0 1 1.7-1.2h6.6a1.8 1.8 0 0 1 1.7 1.2l1.6 4.8v3.4H3.4zM3.4 12.4h13.2"/><circle cx="6.4" cy="15.2" r="1.2"/><circle cx="13.6" cy="15.2" r="1.2"/>',
    closet: '<path d="M10 5.4a1.6 1.6 0 1 0-1.6-1.6M10 5.4v1.4L3 12.2a.9.9 0 0 0 .6 1.6h12.8a.9.9 0 0 0 .6-1.6L10 6.8"/>',
    spread: '<rect x="2.6" y="3" width="5.4" height="4.6" rx=".8"/><rect x="12" y="3" width="5.4" height="4.6" rx=".8"/><rect x="7.2" y="12.4" width="5.6" height="4.6" rx=".8"/><path d="M8 5.3h4M10 7.6v4.8"/>',
    shuffle: '<path d="M3 6h3.2c3.6 0 4 8 7.6 8H17M3 14h3.2c1.4 0 2.2-1.2 2.9-2.6M11 8.6c.7-1.4 1.5-2.6 2.8-2.6H17M14.8 3.8 17 6l-2.2 2.2M14.8 11.8 17 14l-2.2 2.2"/>'
  };
  function houseIcon(name) {
    return '<svg class="v3-ico" viewBox="0 0 20 20" aria-hidden="true">' + (HOUSE_ICONS[name] || HOUSE_ICONS.cube) + "</svg>";
  }
  var V3_GROUPS = [["run"], ["mode", "flat"], ["roof", "labels", "low", "level"], ["time", "mats", "set"], ["advice", "fit", "save"]];
  function v3DressBar() {
    if (!V3 || !V3.box) { return; }
    var bar = el(".v3-bar", V3.box);
    if (!bar) { return; }
    var shut = el('[data-v3="shut"]', bar);
    if (!bar.dataset.dressed) {
      bar.dataset.dressed = "1";
      bar.classList.add("v3-bar-dressed");
      V3_GROUPS.forEach(function (keys, i) {
        var g = document.createElement("div");
        g.className = "v3-group";
        g.dataset.group = String(i);
        bar.insertBefore(g, shut);
      });
      var hint = el(".v3-hint", bar);
      if (hint) { hint.classList.add("v3-hint-foot"); V3.box.appendChild(hint); }
    }
    // each button in its group, in order -- those put in the bar since too
    V3_GROUPS.forEach(function (keys, i) {
      var g = el('.v3-group[data-group="' + i + '"]', bar);
      var late = keys.some(function (k) { var b = el('[data-v3="' + k + '"]', bar); return b && b.parentNode !== g; });
      if (late) { keys.forEach(function (k) { var b = el('[data-v3="' + k + '"]', bar); if (b) { g.appendChild(b); } }); }
    });
    // anything else put in the bar (by other parts): with the tools
    all(".v3-bar > button", V3.box).forEach(function (b) {
      if (b !== shut) { el('.v3-group[data-group="3"]', bar).appendChild(b); }
    });
    all("[data-v3]", bar).forEach(function (b) {
      var key = b.dataset.v3;
      if (key === "shut") { return; }
      var name = key === "mode" ? (V3.mode === "walk" ? "above" : "walk")
               : key === "flat" ? (V3.flat ? "cube" : "flat")
               : key === "time" ? (["day", "evening", "night"][V3.todAim || 0] || "day") : key;
      var lbl = el(".v3-lbl", b), text = lbl ? lbl.textContent : b.textContent;
      if (lbl && b.dataset.dressedAs === name + "|" + text) { return; }
      b.innerHTML = houseIcon(name) + '<span class="v3-lbl"></span>';
      b.lastChild.textContent = text;
      b.dataset.dressedAs = name + "|" + text;
      if (!b.title) { b.title = text; }
      if (!b.getAttribute("aria-label")) { b.setAttribute("aria-label", text); }
    });
  }

  // ---- Settings, over the view ------------------------------------------------------------------
  function houseSetButton() {
    if (!V3 || !V3.box || V3.scene === "space") { return; }
    var bar = el(".v3-bar", V3.box);
    if (!bar || el('[data-v3="set"]', bar)) { return; }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn small";
    btn.dataset.v3 = "set";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-haspopup", "dialog");
    var mats = el('[data-v3="mats"]', bar);
    if (mats) { mats.parentNode.insertBefore(btn, mats.nextSibling); } else { bar.insertBefore(btn, el('[data-v3="shut"]', bar)); }
    var sheet = document.createElement("div");
    sheet.className = "v3-mats v3-set";
    sheet.hidden = true;
    sheet.setAttribute("role", "dialog");
    sheet.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); });
    sheet.addEventListener("wheel", function (ev) { ev.stopPropagation(); });
    sheet.addEventListener("keydown", function (ev) { if (ev.key !== "Escape") { ev.stopPropagation(); } });
    V3.box.appendChild(sheet);
    function head(text) {
      var h = document.createElement("div");
      h.className = "v3-mats-head";
      h.textContent = text;
      sheet.appendChild(h);
    }
    // (2026-10-01: "the menus just have a ton of toggles", "the weather menu
    // also looks really bad")  Each setting a tile -- its picture and its
    // name, lit while it is on -- and the weather six pictures to pick from,
    // what it does to the house said under them.
    function tiles(list) {
      var grid = document.createElement("div");
      grid.className = "hs-tiles";
      list.forEach(function (t) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "hs-tile";
        b.setAttribute("aria-pressed", t.on ? "true" : "false");
        b.innerHTML = houseIcon(t.icon) + '<span class="hs-tile-name"></span><span class="hs-tile-tick" aria-hidden="true">' +
                      '<svg viewBox="0 0 16 16"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg></span>';
        b.querySelector(".hs-tile-name").textContent = t.label;
        if (t.off) { b.disabled = true; b.title = t.off; }
        b.onclick = function () { t.set(!t.on); draw(); };
        grid.appendChild(b);
      });
      sheet.appendChild(grid);
    }
    // (2026-10-02, the land, the lamps, the neighbors and a house's style
    // added: one long sheet of them was too much) In four tabs -- the house,
    // the land, the street, the weather -- the one last looked at kept.
    var HS_TABS = ["house", "land", "street", "weather"];
    function tabNow() {
      try { var t = localStorage.getItem("flowchart-3d-settab"); if (HS_TABS.indexOf(t) >= 0) { return t; } } catch (e) { /* none kept */ }
      return "house";
    }
    function draw() {
      var keepScroll = sheet.scrollTop;
      sheet.innerHTML = "";
      var tab = tabNow(), strip = document.createElement("div");
      strip.className = "hs-tabs";
      strip.setAttribute("role", "tablist");
      HS_TABS.forEach(function (t) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "hs-tab";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-selected", t === tab ? "true" : "false");
        b.textContent = TXT["hs_tab_" + t];
        b.onclick = function () {
          try { localStorage.setItem("flowchart-3d-settab", t); } catch (e) { /* this visit only */ }
          draw();
          sheet.scrollTop = 0;
        };
        strip.appendChild(b);
      });
      sheet.appendChild(strip);
      if (tab === "house") {
        if (typeof styleSection === "function") { styleSection(sheet, head, draw); }
        head(TXT.hs_house);
        tiles([
          { icon: "roof", label: TXT.st_roof_one, on: houseOpt("roof") === "one", set: function (v) { houseSetOpt("roof", v ? "one" : ""); } },
          { icon: "gutter", label: TXT.hs_gutters, on: !!houseOpt("gutters"), set: function (v) { houseSetOpt("gutters", v); } },
          { icon: "lantern", label: TXT.hs_porch, on: !!houseOpt("porch"), set: function (v) { houseSetOpt("porch", v); } }
        ]);
        if (typeof insideSection === "function") { insideSection(sheet, head, tiles, draw); }
        sheet.scrollTop = keepScroll;
        return;
      }
      if (tab === "land") {
        head(TXT.ws_head);
        worldPicker(sheet, WORLD_SCAPES, worldScape(), "ws_", function (k) { houseSetOpt("scape", k); draw(); });
        // how the ground rises and falls, and what the house stands on (40-land.js)
        if (typeof terrSection === "function") { terrSection(sheet, head, tiles, draw); }
        head(TXT.hs_outside);
        tiles([
          { icon: "land", label: TXT.hs_land, on: !!houseOpt("land"), set: function (v) { houseSetOpt("land", v); } },
          { icon: "tree", label: TXT.hs_trees, on: !!houseOpt("trees"), set: function (v) { houseSetOpt("trees", v); } },
          // (the yard's own: shade trees, shrubs by the house, flowers -- 40-plants.js)
          { icon: "tree", label: TXT.hs_lot_trees, on: !!houseOpt("lotTrees"), off: houseOpt("trees") ? "" : TXT.hs_needs_trees,
            set: function (v) { houseSetOpt("lotTrees", v); } },
          { icon: "bound", label: TXT.hs_bound, on: !!houseOpt("bound"), set: function (v) { houseSetOpt("bound", v); } }
        ]);
        sheet.scrollTop = keepScroll;
        return;
      }
      if (tab === "street") {
        var noStreet = houseOpt("street") ? "" : TXT.hs_needs_street;
        head(TXT.hs_outside);
        tiles([
          { icon: "street", label: TXT.hs_street, on: !!houseOpt("street"), set: function (v) { houseSetOpt("street", v); } },
          { icon: "hood", label: TXT.hs_hood, on: !!houseOpt("hood"), off: noStreet, set: function (v) { houseSetOpt("hood", v); } },
          { icon: "folk", label: TXT.hs_folk, on: !!houseOpt("folk"), off: noStreet, set: function (v) { houseSetOpt("folk", v); } }
        ]);
        head(TXT.wl_head);
        var lamps = worldPicker(sheet, WORLD_LAMPS, worldLampKind(), "wl_", function (k) { houseSetOpt("lamps", k); draw(); });
        if (noStreet) { all("button", lamps).forEach(function (b) { b.disabled = true; b.title = noStreet; }); }
        sheet.scrollTop = keepScroll;
        return;
      }
      head(TXT.hs_weather);
      var grid = document.createElement("div");
      grid.className = "hs-weather";
      grid.setAttribute("role", "radiogroup");
      grid.setAttribute("aria-label", TXT.hs_weather);
      WEATHERS.forEach(function (w) {
        var b = document.createElement("button");
        b.type = "button";
        var on = weatherNow() === w;
        b.className = "hs-wx" + (on ? " on" : "");
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.innerHTML = houseIcon("wx_" + w) + "<span></span>";
        b.lastChild.textContent = TXT["wx_" + w];
        b.onclick = function () { weatherSet(w); draw(); };
        grid.appendChild(b);
      });
      sheet.appendChild(grid);
      var says = weatherSays();
      if (says) {
        var p = document.createElement("p");
        p.className = "hs-note";
        p.innerHTML = houseIcon(weatherNow() === "snow" ? "wx_snow" : "drop") + "<span></span>";
        p.lastChild.textContent = says;
        sheet.appendChild(p);
      }
    }
    btn.onclick = function (ev) {
      ev.stopPropagation();
      // one sheet at a time over the view
      var other = el(".v3-mats:not(.v3-set)", V3.box), otherBtn = el('[data-v3="mats"]', V3.box);
      if (sheet.hidden && other && !other.hidden && otherBtn) { otherBtn.click(); }
      sheet.hidden = !sheet.hidden;
      btn.setAttribute("aria-expanded", sheet.hidden ? "false" : "true");
      btn.classList.toggle("primary", !sheet.hidden);
      if (!sheet.hidden) { draw(); }
    };
    sheet.redraw = draw;
  }
  function houseSetWords() {
    if (!V3 || !V3.box) { return; }
    var btn = el('[data-v3="set"]', V3.box);
    if (btn) {
      btn.textContent = TXT.hs_button;
      btn.title = TXT.hs_tip;
      btn.hidden = V3.scene === "space";
    }
    var sheet = el(".v3-set", V3.box);
    if (sheet && !sheet.hidden && sheet.redraw) { sheet.redraw(); }
  }
  if (typeof v3Open === "function") {
    var v3OpenHouse = v3Open;
    v3Open = function () {
      var was = V3;
      var out = v3OpenHouse.apply(this, arguments);
      try {
        if (V3 && V3 !== was) { houseSetButton(); houseSetWords(); weatherRun(); v3DressBar(); }
      } catch (e) { /* the view works without them */ }
      return out;
    };
    var v3WordsHouse = v3Words;
    v3Words = function () {
      var out = v3WordsHouse.apply(this, arguments);
      try { houseSetButton(); houseSetWords(); v3DressBar(); } catch (e) { /* fine */ }
      return out;
    };
  }

  // ---- floors, while building --------------------------------------------------------------------
  // (asked: "allow 2 stories and a basement and allow you to do that too in
  // building")  A floor above, or one under the ground, added to a house
  // drawn by hand: what is drawn so far put in a Ground floor if it is in
  // none, and a new Floor beside it the same size -- the stairs there
  // already given a flight to meet them on the new floor, or a flight put
  // in the hall (or the biggest room) on both, joined by an arrow.
  function floorAdd(down) {
    keepUndo();
    var P = FLOOR_PX;
    var floors = hand.nodes.filter(function (n) { return n.kind === "i_floor"; });
    var ground = floors.filter(function (f) { return levelKey(f, 0) === 0; })[0] || floors[0];
    if (!ground) {
      // all of it, in a Ground floor
      var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      hand.nodes.forEach(function (n) {
        if (n.kind === "i_lot") { return; }
        var q = turned(n);
        b.l = Math.min(b.l, n.x - q.w / 2); b.r = Math.max(b.r, n.x + q.w / 2);
        b.t = Math.min(b.t, n.y - q.h / 2); b.b = Math.max(b.b, n.y + q.h / 2);
      });
      if (b.l === Infinity) { b = { l: 0, r: 520, t: 0, b: 420 }; }
      ground = { id: hand.next++, kind: "i_floor", text: TXT.fl_ground, x: 0, y: 0, w: 140, h: 46 };
      measure(ground);
      ground.text = TXT.fl_ground; ground.own = true;
      ground.x = Math.round((b.l + b.r) / 2); ground.y = Math.round((b.t + b.b) / 2);
      ground.w = Math.round(b.r - b.l + 2 * P); ground.h = Math.round(b.b - b.t + 2 * P);
      hand.nodes.unshift(ground);
      floors = [ground];
    }
    var right = -Infinity;
    hand.nodes.forEach(function (n) { var q = turned(n); right = Math.max(right, n.x + q.w / 2); });
    var name = down ? TXT.fl_basement : floors.length > 1 ? say("fl_upper", { n: floors.filter(function (f) { return levelKey(f, 0) > 0; }).length + 1 }) : TXT.fl_up_name;
    var made = { id: hand.next++, kind: "i_floor", text: name, x: 0, y: 0, w: 140, h: 46 };
    measure(made);
    made.text = name; made.own = true;
    if (ground.bldg !== undefined) { made.bldg = ground.bldg; }   // this house's, not another's (38-walk.js)
    made.w = ground.w; made.h = ground.h;
    made.x = Math.round(right + 240 + made.w / 2); made.y = ground.y;
    hand.nodes.unshift(made);
    // stairs to it: from the floor next to it, in the same place
    var from = down ? ground : floorsOfTop(floors);
    var flight = hand.nodes.filter(function (n) { return n.kind === "i_stairs" && insideArea(from, n.x, n.y); })
      .filter(function (s) { return !hand.links.some(function (l) { var o = nodeById(l.to === s.id ? l.from : l.to); return (l.from === s.id || l.to === s.id) && o && BETWEEN_FLOORS[o.kind]; }); })[0];
    if (!flight) {
      var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(from, r.x, r.y); });
      var hall = rooms.filter(function (r) { return /hall|flur|pasillo|couloir|entr/i.test(r.text || ""); })[0] ||
                 rooms.slice().sort(function (p, q) { return q.w * q.h - p.w * p.h; })[0];
      if (hall && typeof starterAlong === "function") {
        var put = starterAlong(hall, "i_stairs", null);
        if (put) { put(); flight = nodeById(picked); }
      }
      if (!flight) {
        flight = adviceAdd("i_stairs", Math.round(from.x - from.w / 2 + P * 1.5), Math.round(from.y));
      }
    }
    if (flight) {
      var mate = { id: hand.next++, kind: "i_stairs", text: "", x: 0, y: 0, w: 140, h: 46 };
      measure(mate);
      mate.w = flight.w; mate.h = flight.h; mate.text = flight.text || "";
      if (flight.turn) { mate.turn = flight.turn; }
      mate.x = Math.round(flight.x - from.x + made.x); mate.y = Math.round(flight.y - from.y + made.y);
      // and a hall round them there, over (or under) the room they go from:
      // a floor of bare stairs had them standing up out of the roof below
      var holder = hand.nodes.filter(function (r) { return r.kind === "i_room" && insideArea(r, flight.x, flight.y); })
        .sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
      var hall = { id: hand.next++, kind: "i_room", text: TXT.st_hall, x: 0, y: 0, w: 140, h: 46 };
      measure(hall);
      hall.text = TXT.st_hall; hall.own = true;
      if (holder) {
        hall.w = holder.w; hall.h = holder.h; if (holder.turn) { hall.turn = holder.turn; }
        hall.x = Math.round(holder.x - from.x + made.x); hall.y = Math.round(holder.y - from.y + made.y);
      } else {
        hall.w = Math.round(2.4 * P); hall.h = Math.round(4.4 * P); hall.x = mate.x; hall.y = mate.y;
      }
      hand.nodes.push(hall, mate);
      hand.links.push(down ? { from: mate.id, to: flight.id, label: "" } : { from: flight.id, to: mate.id, label: "" });
    }
    picked = made.id; chosen = null; many = [];
    if (typeof handKeep === "function") { handKeep(); }
    drawHand(); drawHandPanel(); showReport();
    if (el("#fit")) { el("#fit").click(); }
    handSays(say("hs_floor_made", { name: name }));
  }
  function floorsOfTop(floors) {
    var best = floors[0], key = -Infinity;
    floors.forEach(function (f, i) { var k = levelKey(f, i); if (k > key) { key = k; best = f; } });
    return best;
  }

  // The sheet: floors added, the roof in one piece -- beside Start a house.
  function houseAsk() {
    if (el(".hs-sheet")) { return; }
    var sheet = document.createElement("div");
    sheet.className = "make-sheet st-sheet hs-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-labelledby", "hs-title");
    var card = document.createElement("div");
    card.className = "make-card st-card";
    card.innerHTML = '<h2 id="hs-title"></h2><p class="make-sub"></p><div class="st-rows"></div>' +
                     '<div class="st-go"><button type="button" class="btn small st-no"></button></div>';
    card.querySelector("h2").textContent = TXT.hs_floors_title;
    card.querySelector(".make-sub").textContent = TXT.hs_floors_sub;
    var rows = card.querySelector(".st-rows");
    var gone = false;
    function shut() {
      if (gone) { return; }
      gone = true;
      if (typeof STILL !== "undefined" && STILL) { sheet.remove(); return; }
      sheet.classList.add("going");
      setTimeout(function () { sheet.remove(); }, 200);
    }
    function act(label, fn) {
      var row = document.createElement("div");
      row.className = "st-row";
      row.innerHTML = '<span></span><button type="button" class="btn small"></button>';
      row.firstChild.textContent = label;
      row.lastChild.textContent = TXT.hs_add;
      row.lastChild.onclick = function () { shut(); fn(); };
      rows.appendChild(row);
    }
    var floors = hand.nodes.filter(function (n) { return n.kind === "i_floor"; });
    if (floors.length) {
      var list = document.createElement("div");
      list.className = "st-row hs-floors";
      var names = (typeof floorsOf === "function" ? floorsOf() : []).slice().reverse().map(function (f) { return floorName(f); });
      list.textContent = names.join(" · ");
      rows.appendChild(list);
    }
    act(TXT.hs_add_up, function () { floorAdd(false); });
    if (!hand.nodes.some(function (n) { return n.kind === "i_floor" && levelKey(n, 0) < 0; })) {
      act(TXT.hs_add_down, function () { floorAdd(true); });
    }
    var roofRow = document.createElement("label");
    roofRow.className = "switch wide";
    roofRow.innerHTML = '<span></span><input type="checkbox">';
    roofRow.firstChild.textContent = TXT.st_roof_one;
    roofRow.lastChild.checked = houseOpt("roof") === "one";
    roofRow.lastChild.onchange = function () { houseSetOpt("roof", roofRow.lastChild.checked ? "one" : ""); };
    rows.appendChild(roofRow);
    var no = card.querySelector(".st-no");
    no.textContent = TXT.hs_done;
    no.onclick = shut;
    sheet.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); shut(); }
    });
    sheet.addEventListener("pointerdown", function (ev) { if (ev.target === sheet) { shut(); } });
    sheet.appendChild(card);
    document.body.appendChild(sheet);
    setTimeout(function () { no.focus({ preventScroll: true }); }, 30);
  }
  function houseButton() {
    var start = el("#hand-house");
    if (!start) { return; }
    var b = el("#hand-floors");
    if (!b) {
      b = document.createElement("button");
      b.className = "btn";
      b.id = "hand-floors";
      b.type = "button";
      b.onclick = houseAsk;
      start.parentNode.insertBefore(b, start.nextSibling);
    }
    var show = typeof designMode === "function" && designMode() && hand.nodes.length > 0 &&
               typeof boardName === "function" && boardName() === "home";
    if (b.hidden === show) { b.hidden = !show; }
    if (b.textContent !== TXT.hs_floors) { b.textContent = TXT.hs_floors; b.title = TXT.hs_floors_tip; }
  }
  if (typeof drawHand === "function") {
    var drawHandFloors = drawHand;
    drawHand = function () {
      var out = drawHandFloors.apply(this, arguments);
      try { houseButton(); } catch (e) { /* fine */ }
      return out;
    };
  }
  if (typeof dressMaking === "function") {
    var dressMakingFloors = dressMaking;
    dressMaking = function () {
      var out = dressMakingFloors.apply(this, arguments);
      try { houseButton(); } catch (e) { /* fine */ }
      return out;
    };
  }
