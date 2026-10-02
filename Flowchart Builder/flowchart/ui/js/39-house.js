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
    var E = ROOF_EAVE * FLOOR_PX;
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
      var slope = half > 0 ? Math.min(ROOF_PITCH, ROOF_RIDGE * FLOOR_PX / half) : ROOF_PITCH;
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
  // Worked out again only when the rooms or the roof's rectangles change:
  // the view draws sixty times a second while it moves.
  var roofKept = { key: null, out: null };
  if (typeof roofPlan === "function") {
    var roofPlanPieces = roofPlan;
    roofPlan = function (floors, upTo, wallTop) {
      var rects = roofPlanPieces.apply(this, arguments);
      var one = houseOpt("roof") === "one", gut = !!houseOpt("gutters");
      if (!one && !gut) { return rects; }
      try {
        var key = (one ? "1" : "0") + (gut ? "1" : "0") + "|" + rects.map(function (R) {
          var e = R.eave || {};
          return [R.x0, R.x1, R.y0, R.y1, R.z, R.level, R.turn || 0, e.n, e.s, e.w, e.e].map(function (v) { return Math.round((v || 0) * 10); }).join(",");
        }).join(";") + "|" + hand.nodes.map(function (r) {
          return r.kind === "i_room" || r.kind === "i_floor" ? [r.x, r.y, r.w, r.h, r.turn || 0, r.text || ""].join(",") : "";
        }).join(";");
        if (roofKept.key !== key) {
          var made = one ? roofWhole(rects, floors) : rects.slice();
          // each kept as where it came from: a rectangle of the plan, or a
          // roof of the whole made from the first of its group's
          var out = made.map(function (R) {
            var idx = rects.indexOf(R), kept = idx >= 0 ? { idx: idx } : Object.assign({}, R, { src: rects.indexOf(R.cover ? rects.filter(function (q) { return q.room === R.room; })[0] : null) });
            kept.runs = gut ? roofRuns(R, floors) : null;
            return kept;
          });
          roofKept = { key: key, out: out };
        }
        return roofKept.out.map(function (k) {
          var R = k.idx !== undefined ? rects[k.idx] : Object.assign({}, k, { room: k.src >= 0 ? rects[k.src].room : k.room });
          R.runs = k.runs;
          return R;
        });
      } catch (e) { return rects; }
    };
  }

  // ---- gutters, and what runs down from them ------------------------------------------
  // A gutter along every open eave, a downpipe at each end of it down the
  // wall to a splash block (and one in the middle of a long one), drawn
  // with the roof, coming and going with it.
  var GUTTER = "#e9e8e3";
  function gutterFaces(faces, R, lift, how) {
    if (!R.runs || !R.runs.length) { return; }
    var W = R.x1 - R.x0, D = R.y1 - R.y0, half = Math.min(W, D) / 2;
    var rise = R.k ? half * R.k : Math.min(half * ROOF_PITCH, ROOF_RIDGE * FLOOR_PX), k = R.k || (half > 0 ? rise / half : 0);
    var z = R.z + lift + (R.bias || 0), P = FLOOR_PX, gw = 0.13 * P, gh = 0.12 * P, pipe = 0.045 * P;
    var look = { piece: true, color: GUTTER, edge: v3Mix(GUTTER, "#000000", 0.35), alpha: how.alpha, late: how.late };
    var spouts = [];
    R.runs.forEach(function (r) {
      var e = R.eave[r.side], zE = z - e * k, across = r.side === "n" || r.side === "s";
      var out = r.side === "n" ? -1 : r.side === "s" ? 1 : r.side === "w" ? -1 : 1;
      var line = r.side === "n" ? R.y0 : r.side === "s" ? R.y1 : r.side === "w" ? R.x0 : R.x1;
      // carried round the corner where the eave on the next side is open too
      var lo = r.a, hi = r.b, lo0 = across ? R.x0 : R.y0, hi0 = across ? R.x1 : R.y1;
      var before = across ? R.eave.w : R.eave.n, after = across ? R.eave.e : R.eave.s;
      if (Math.abs(lo - lo0) < 1) { lo -= before; }
      if (Math.abs(hi - hi0) < 1) { hi += after; }
      var o0 = line + out * e, o1 = line + out * (e + gw);
      var base = across ? [[lo, o0], [hi, o0], [hi, o1], [lo, o1]] : [[o0, lo], [o1, lo], [o1, hi], [o0, hi]];
      v3Prism(faces, base, zE - gh, zE, look);
      // downpipes: at each end of a gutter along the front or the back, and
      // every 12 m or so between; down the wall, a turn out at the foot
      if (!across && (Math.abs(r.a - lo0) < 1 || Math.abs(r.b - hi0) < 1)) { return; }
      var ends = [lo + Math.min(0.3 * P, (hi - lo) / 2), hi - Math.min(0.3 * P, (hi - lo) / 2)];
      var many = Math.floor((hi - lo) / (12 * P));
      for (var m = 1; m <= many; m++) { ends.push(lo + (hi - lo) * m / (many + 1)); }
      ends.forEach(function (at) {
        if (spouts.some(function (s) { return Math.abs(s[0] - at) < 0.8 * P && s[1] === r.side; })) { return; }
        spouts.push([at, r.side]);
        var wallOut = line + out * 0.07 * P, foot = 0.12 * P;     // down to the ground, from any floor
        function box(a0, a1, b0, b1, z0, z1) {
          var pts = across ? [[a0, b0], [a1, b0], [a1, b1], [a0, b1]] : [[b0, a0], [b1, a0], [b1, a1], [b0, a1]];
          v3Prism(faces, pts, z0, z1, look);
        }
        var p0 = wallOut - pipe, p1 = wallOut + pipe;
        box(at - pipe, at + pipe, Math.min(p0, p1), Math.max(p0, p1), foot, zE - gh);     // down the wall
        var g0 = wallOut, g1 = line + out * (e + gw / 2);
        box(at - pipe * 0.8, at + pipe * 0.8, Math.min(g0, g1), Math.max(g0, g1), zE - gh - pipe * 1.6, zE - gh);   // out to the gutter
        var s0 = wallOut, s1 = wallOut + out * 0.35 * P;
        box(at - pipe, at + pipe, Math.min(s0, s1), Math.max(s0, s1), foot - 0.02 * P, foot + pipe * 1.4);   // the turn out at the foot
        var b0 = wallOut + out * 0.25 * P, b1 = wallOut + out * 0.85 * P;
        box(at - 0.15 * P, at + 0.15 * P, Math.min(b0, b1), Math.max(b0, b1), 0, 0.03 * P);   // the splash block
      });
    });
  }
  if (typeof roofFaces === "function") {
    var roofFacesBare = roofFaces;
    roofFaces = function (faces, R, lift, how) {
      var out = roofFacesBare.apply(this, arguments);
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
    bar.insertBefore(btn, mats ? mats.nextSibling : el(".v3-hint", bar));
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
    function flip(key, label, on, set) {
      var row = document.createElement("label");
      row.className = "switch wide";
      row.innerHTML = '<span></span><input type="checkbox">';
      row.firstChild.textContent = label;
      var box = row.lastChild;
      box.checked = on;
      box.onchange = function () { set(box.checked); draw(); };
      sheet.appendChild(row);
    }
    function draw() {
      sheet.innerHTML = "";
      head(TXT.hs_house);
      flip("roof", TXT.st_roof_one, houseOpt("roof") === "one", function (v) { houseSetOpt("roof", v ? "one" : ""); });
      flip("gutters", TXT.hs_gutters, !!houseOpt("gutters"), function (v) { houseSetOpt("gutters", v); });
      flip("porch", TXT.hs_porch, !!houseOpt("porch"), function (v) { houseSetOpt("porch", v); });
      head(TXT.hs_outside);
      flip("street", TXT.hs_street, !!houseOpt("street"), function (v) { houseSetOpt("street", v); });
      flip("land", TXT.hs_land, !!houseOpt("land"), function (v) { houseSetOpt("land", v); });
      flip("trees", TXT.hs_trees, !!houseOpt("trees"), function (v) { houseSetOpt("trees", v); });
      head(TXT.hs_weather);
      var seg = document.createElement("div");
      seg.className = "seg v3-weather-seg";
      seg.setAttribute("role", "radiogroup");
      seg.setAttribute("aria-label", TXT.hs_weather);
      WEATHERS.forEach(function (w) {
        var b = document.createElement("button");
        b.type = "button";
        var on = weatherNow() === w;
        b.className = "seg-btn" + (on ? " on" : "");
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.textContent = TXT["wx_" + w];
        b.onclick = function () { weatherSet(w); draw(); };
        seg.appendChild(b);
      });
      sheet.appendChild(seg);
      var says = weatherSays();
      if (says) {
        var p = document.createElement("p");
        p.className = "v3-set-says";
        p.textContent = says;
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
        if (V3 && V3 !== was) { houseSetButton(); houseSetWords(); weatherRun(); }
      } catch (e) { /* the view works without them */ }
      return out;
    };
    var v3WordsHouse = v3Words;
    v3Words = function () {
      var out = v3WordsHouse.apply(this, arguments);
      try { houseSetButton(); houseSetWords(); } catch (e) { /* fine */ }
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
