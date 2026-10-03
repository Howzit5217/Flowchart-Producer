// ---------------------------------------------------------------------------
//  40-roofs.js -- roofs that keep out of the house: a lower roof leaning on
//  the storey over it, not sloping down into its wall; a wing's gable
//  stopped at the roof it runs into; eaves only where it is out of doors
//  under them; and the roof in one piece from the start
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "it likes to make roofs that go into the house
  // like folded into the house")
  //
  // Roofed a rectangle at a time (roofPlan, 38-view3d.js; roofWhole,
  // 39-house.js), every roof sloped down to all its sides.  Where a side
  // stood against the storey over it -- a garage beside a house of two
  // floors, the strip of a ground floor bigger than the one over it -- the
  // roof sloped down into that wall: a gutter of roof folded against the
  // house.  A gable's rectangle running on through a wider part of the house
  // came out of its roof on the far side, a little gable where none should
  // be.  And an eave hung out along the whole of a side, through the walls
  // of the room next to it, wherever only some of that side was outdoors.
  //
  // Now a roof against a wall going up rises to it: a lean-to along a long
  // wall, a wing's ridge running into a short one -- as steep as the rest,
  // but under the sills of the windows over it.  A gable stops at the ridge
  // of the wider roof it runs into.  And whatever of a roof's eaves is in
  // the house, over a room of its floor or one higher, is taken off.
  //
  // Houses are roofed in one piece unless asked otherwise (a roof over each
  // room meets its neighbours in folds wherever they differ in size).
  HOUSE_PLAIN.roof = "one";

  var ROOF_GABLED = { gable: true, gambrel: true, stepped: true, aframe: true, shed: true, butterfly: true };
  var ROOF_LEVEL = { flat: true, slab: true, dome: true };       // flat roofs: nothing slopes into anything

  // ---- flat pieces of roof, cut -------------------------------------------------------
  // The part of a flat polygon (points [x, y, z]) where a·x + b·y <= c.
  function roofCut(pts, a, b, c) {
    if (!pts) { return null; }
    var out = [];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], q = pts[(i + 1) % pts.length];
      var dp = a * p[0] + b * p[1] - c, dq = a * q[0] + b * q[1] - c;
      if (dp <= 1e-6) { out.push(p); }
      if ((dp < -1e-6 && dq > 1e-6) || (dp > 1e-6 && dq < -1e-6)) {
        var t = dp / (dp - dq);
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]);
      }
    }
    return out.length >= 3 && roofArea(out) > 0.5 ? out : null;
  }
  function roofArea(pts) {
    var s = 0;
    for (var i = 0; i < pts.length; i++) { var p = pts[i], q = pts[(i + 1) % pts.length]; s += p[0] * q[1] - q[0] * p[1]; }
    return Math.abs(s) / 2;
  }
  // A polygon less a rectangle: what is left of it, in up to four pieces.
  function roofMinus(pts, B) {
    var left = [], rest = pts, piece;
    if ((piece = roofCut(rest, 1, 0, B.x0))) { left.push(piece); }        // west of it
    rest = roofCut(rest, -1, 0, -B.x0);
    if ((piece = roofCut(rest, -1, 0, -B.x1))) { left.push(piece); }      // east of it
    rest = roofCut(rest, 1, 0, B.x1);
    if ((piece = roofCut(rest, 0, 1, B.y0))) { left.push(piece); }        // north of it
    rest = roofCut(rest, 0, -1, -B.y0);
    if ((piece = roofCut(rest, 0, -1, -B.y1))) { left.push(piece); }      // south of it
    return left;
  }
  function roofBounds(pts) {
    var b = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    pts.forEach(function (p) { b.x0 = Math.min(b.x0, p[0]); b.x1 = Math.max(b.x1, p[0]); b.y0 = Math.min(b.y0, p[1]); b.y1 = Math.max(b.y1, p[1]); });
    return b;
  }

  // ---- the house under a roof ----------------------------------------------------------
  // Each room upright on `level` or over it, in the ground floor's numbers.
  function roofRoomRects(floors, level) {
    return hand.nodes.filter(function (n) { return n.kind === "i_room" && !((n.turn || 0) % 90); }).map(function (r) {
      var f = floors && floors.length ? floorAt(floors, r.x, r.y) : null, q = turned(r), dx = f ? f.dx : 0, dy = f ? f.dy : 0;
      return { level: f ? f.level : 0, x0: r.x + dx - q.w / 2, x1: r.x + dx + q.w / 2, y0: r.y + dy - q.h / 2, y1: r.y + dy + q.h / 2 };
    }).filter(function (b) { return b.level >= level; });
  }
  function roofIn(list, x, y) {
    return list.some(function (b) { return x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1; });
  }
  // The sides of a roof's rectangle that a storey over it stands against
  // (most of the side), or null.
  function roofUpSides(R, floors) {
    var over = roofRoomRects(floors, R.level + 1), up = {}, any = false;
    if (!over.length) { return null; }
    [["n", true, R.y0 - 8], ["s", true, R.y1 + 8], ["w", false, R.x0 - 8], ["e", false, R.x1 + 8]].forEach(function (s) {
      var lo = s[1] ? R.x0 : R.y0, hi = s[1] ? R.x1 : R.y1, hit = 0;
      for (var i = 0; i < 10; i++) {
        var at = lo + (hi - lo) * (i + 0.5) / 10;
        if (s[1] ? roofIn(over, at, s[2]) : roofIn(over, s[2], at)) { hit++; }
      }
      if (hit >= 5) { up[s[0]] = true; any = true; }
    });
    return any ? up : null;
  }
  // Whether a side of a roof is out of doors at a point along it: nothing
  // of the house beyond it, on its floor or over it, and no more of the roof.
  function roofSideOpen(R, side, at) {
    var floors = typeof houseFloorsNow !== "undefined" ? houseFloorsNow : [];
    var x = side === "w" ? R.x0 - 8 : side === "e" ? R.x1 + 8 : at, y = side === "n" ? R.y0 - 8 : side === "s" ? R.y1 + 8 : at;
    if (R.cover && R.cover.some(function (B) { return B !== R && x > B.x0 && x < B.x1 && y > B.y0 && y < B.y1; })) { return false; }
    return !roofIn(roofRoomRects(floors, R.level), x, y);
  }
  // How high a roof leaning on the storey over it may come: under the
  // sills of that storey's windows along the walls it leans on (to the
  // floor, at a door out onto it), and well under that storey's eaves.
  function roofUpCap(R, floors) {
    var P = FLOOR_PX, up = R.up, cap = Infinity, next = null;
    (floors || []).forEach(function (f) { if (f.level === R.level + 1 && (!next || f.z < next.z)) { next = f; } });
    var floorZ = next ? next.z : R.z;
    cap = floorZ + (WALL_TALL - 0.5) * P;
    hand.nodes.forEach(function (w) {
      if (w.kind !== "i_window" && !WALK_DOORS[w.kind]) { return; }
      var f = floors && floors.length ? floorAt(floors, w.x, w.y) : null;
      if (!f || f.level !== R.level + 1) { return; }
      var x = w.x + f.dx, y = w.y + f.dy, q = turned(w);
      var bottom = f.z + (w.kind === "i_window" ? SILL * P - 0.15 * P : 0.03 * P);
      [["n", R.y0, true], ["s", R.y1, true], ["w", R.x0, false], ["e", R.x1, false]].forEach(function (s) {
        if (!up[s[0]]) { return; }
        var off = s[2] ? Math.abs(y - s[1]) : Math.abs(x - s[1]), along = s[2] ? x : y, half = (s[2] ? q.w : q.h) / 2;
        var lo = s[2] ? R.x0 : R.y0, hi = s[2] ? R.x1 : R.y1;
        if (off > 0.45 * P || along + half < lo || along - half > hi) { return; }
        cap = Math.min(cap, bottom);
      });
    });
    return cap;
  }

  // ---- gables stopped where they run into a wider roof ------------------------------------
  // A gable's rectangle (39-house.js gives the biggest rectangles that fit,
  // overlapping) running from the house's wall across a wider wing whose
  // ridge crosses it: stopped at that ridge, under the wider roof, and its
  // end there no gable and no eave.  (A narrower one running right through
  // a wider one is a cross gable: left as it is.)
  function roofTrimGables(list) {
    var shape = typeof styleRoofShape === "function" ? styleRoofShape() : "hip";
    if (!ROOF_GABLED[shape] || shape === "shed" || shape === "butterfly") { return; }
    var boxes = list.filter(function (R) { return !R.turn; });
    var frames = boxes.map(function (R) {
      var along = (R.x1 - R.x0) >= (R.y1 - R.y0);
      return along ? { along: true, u0: R.x0, u1: R.x1, v0: R.y0, v1: R.y1 } : { along: false, u0: R.y0, u1: R.y1, v0: R.x0, v1: R.x1 };
    });
    var cuts = boxes.map(function () { return {}; });
    boxes.forEach(function (B, i) {
      var F = frames[i], half = (F.v1 - F.v0) / 2, len = F.u1 - F.u0;
      boxes.forEach(function (C, j) {
        if (i === j || C.level !== B.level || Math.abs(C.z - B.z) > 1) { return; }
        var G = frames[j], wide = (G.v1 - G.v0) / 2, clen = G.u1 - G.u0;
        if (G.along === F.along) { return; }                         // the same way: already under it
        if (wide < half - 1 || (Math.abs(wide - half) <= 1 && (clen < len - 1 || (Math.abs(clen - len) <= 1 && j > i)))) { return; }
        // C in B's numbers: across C is along B
        var cu0 = G.v0, cu1 = G.v1, cv0 = G.u0, cv1 = G.u1, ridge = (G.v0 + G.v1) / 2;
        if (cv0 > F.v0 + 2 || cv1 < F.v1 - 2) { return; }            // not over the whole width of B
        if (F.u0 >= cu0 - 2 && F.u0 <= cu1 + 2 && F.u1 > cu1 + 2 && ridge > F.u0 + 1) {
          cuts[i].lo = Math.max(cuts[i].lo === undefined ? -Infinity : cuts[i].lo, ridge);
        }
        if (F.u1 <= cu1 + 2 && F.u1 >= cu0 - 2 && F.u0 < cu0 - 2 && ridge < F.u1 - 1) {
          cuts[i].hi = Math.min(cuts[i].hi === undefined ? Infinity : cuts[i].hi, ridge);
        }
      });
    });
    boxes.forEach(function (B, i) {
      var c = cuts[i], F = frames[i];
      if (c.lo === undefined && c.hi === undefined) { return; }
      var lo = c.lo === undefined ? F.u0 : c.lo, hi = c.hi === undefined ? F.u1 : c.hi;
      if (hi - lo < 1.5 * FLOOR_PX) { return; }
      B.eave = Object.assign({}, B.eave || { n: 0, s: 0, w: 0, e: 0 });
      if (F.along) {
        if (c.lo !== undefined) { B.x0 = lo; B.eave.w = 0; }
        if (c.hi !== undefined) { B.x1 = hi; B.eave.e = 0; }
      } else {
        if (c.lo !== undefined) { B.y0 = lo; B.eave.n = 0; }
        if (c.hi !== undefined) { B.y1 = hi; B.eave.s = 0; }
      }
      B.trimmed = true;
    });
  }
  function roofMark(list, floors) {
    list.forEach(function (R) {
      if (R.turn) { return; }
      var up = roofUpSides(R, floors);
      if (up) { R.up = up; } else { delete R.up; }
    });
  }
  // (both worked out with the rest of the roof, only when the rooms change)
  if (typeof roofWhole === "function") {
    var roofWholeBare = roofWhole;
    roofWhole = function (rects, floors) {
      var out = roofWholeBare.apply(this, arguments);
      try { roofTrimGables(out); roofMark(out, floors); } catch (e) { /* as it was */ }
      return out;
    };
  }
  if (typeof roofRooms === "function") {
    var roofRoomsBare = roofRooms;
    roofRooms = function (floors) {
      var out = roofRoomsBare.apply(this, arguments);
      try { roofMark(out, floors); } catch (e) { /* as it was */ }
      return out;
    };
  }

  // ---- a roof as the lowest of its slopes -------------------------------------------------
  // Each slope rising from one side of R at `k`; over R grown by `grow`
  // past each side (eaves, rakes); each slope's face where it is the
  // lowest of them -- a hip roof, from all four; a lean-to with hipped
  // ends, from three; a shed, from one.
  function roofPlanes(R, from, k) {
    return from.map(function (s) {
      return s === "n" ? [0, k, -k * R.y0] : s === "s" ? [0, -k, k * R.y1] : s === "w" ? [k, 0, -k * R.x0] : [-k, 0, k * R.x1];
    });
  }
  function roofSlopes(R, from, k, z, grow) {
    var X0 = R.x0 - (grow.w || 0), X1 = R.x1 + (grow.e || 0), Y0 = R.y0 - (grow.n || 0), Y1 = R.y1 + (grow.s || 0);
    var pl = roofPlanes(R, from, k), out = [];
    pl.forEach(function (p, i) {
      var poly = [[X0, Y0, 0], [X1, Y0, 0], [X1, Y1, 0], [X0, Y1, 0]];
      for (var j = 0; j < pl.length && poly; j++) {
        if (j !== i) { poly = roofCut(poly, p[0] - pl[j][0], p[1] - pl[j][1], pl[j][2] - p[2]); }
      }
      if (!poly) { return; }
      out.push({ side: from[i], plane: p, pts: poly.map(function (v) { return [v[0], v[1], z + p[0] * v[0] + p[1] * v[1] + p[2]]; }) });
    });
    return out;
  }
  // How high the slopes are along a line, as points [x, y, z] from a to b.
  function roofProfile(pl, z, a, b) {
    var ts = [0, 1];
    for (var i = 0; i < pl.length; i++) {
      for (var j = i + 1; j < pl.length; j++) {
        var fa = (pl[i][0] - pl[j][0]) * a[0] + (pl[i][1] - pl[j][1]) * a[1] + pl[i][2] - pl[j][2];
        var fb = (pl[i][0] - pl[j][0]) * b[0] + (pl[i][1] - pl[j][1]) * b[1] + pl[i][2] - pl[j][2];
        if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) { ts.push(fa / (fa - fb)); }
      }
    }
    ts.sort(function (p, q) { return p - q; });
    return ts.map(function (t) {
      var x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, h = Infinity;
      pl.forEach(function (p) { h = Math.min(h, p[0] * x + p[1] * y + p[2]); });
      return [x, y, z + (pl.length ? h : 0)];
    });
  }

  // A roof against the storey over it.
  function roofLean(faces, R, lift, how, shape) {
    var P = FLOOR_PX, up = R.up, sides = ["n", "s", "w", "e"], opp = { n: "s", s: "n", w: "e", e: "w" };
    var gabled = !!ROOF_GABLED[shape];
    var walls = sides.filter(function (s) { return up[s]; }), free = sides.filter(function (s) { return !up[s]; });
    var from = free.slice(), ends = [], e = R.eave || { n: 0, s: 0, w: 0, e: 0 };
    if (gabled && walls.length === 1) {
      var w = walls[0], ns = w === "n" || w === "s";
      var alongWall = ns ? R.x1 - R.x0 : R.y1 - R.y0, deep = ns ? R.y1 - R.y0 : R.x1 - R.x0;
      // a lean-to, gabled at its ends; or a wing, its ridge running into the
      // wall -- gabled where the end is out of doors, sloping down under the
      // roof next to it where it is not
      ends = alongWall >= 1.4 * deep ? free.filter(function (s) { return s !== opp[w]; }) : [opp[w]];
      ends = ends.filter(function (s) { return e[s] > 0; });
      from = free.filter(function (s) { return ends.indexOf(s) < 0; });
    }
    // as steep as the rest of the roof, but no higher than it may come
    var k = R.k || (shape === "aframe" ? Math.tan(60 * Math.PI / 180) : typeof stylePitch === "function" ? stylePitch() : ROOF_PITCH);
    var most = 0;
    roofSlopes(R, from, 1, 0, {}).forEach(function (f) { f.pts.forEach(function (v) { most = Math.max(most, v[2]); }); });
    var ridge = (typeof styleRidge === "function" ? styleRidge() : ROOF_RIDGE) * P;
    var room = roofUpCap(R, typeof houseFloorsNow !== "undefined" ? houseFloorsNow : []) - R.z;
    var top = Math.max(0.06 * P, Math.min(most * k, ridge, room));
    var kk = most > 0 ? top / most : 0;
    var z = R.z + lift + (R.bias || 0), grow = {};
    from.forEach(function (s) { grow[s] = e[s] || 0; });
    ends.forEach(function (s) { grow[s] = e[s] ? Math.min(e[s], 0.3 * P) : 0; });
    var roofHow = R.k ? Object.assign({}, how, { bare: true }) : how;
    if (!from.length) {
      faces.push({ pts: [[R.x0, R.y0, z + 2], [R.x1, R.y0, z + 2], [R.x1, R.y1, z + 2], [R.x0, R.y1, z + 2]], n: [0, 0, 1], how: roofHow, roof: true });
      return;
    }
    roofSlopes(R, from, kk, z, grow).forEach(function (f) {
      var a = f.plane[0], b = f.plane[1], len = Math.hypot(a, b, 1);
      faces.push({ pts: f.pts, n: [-a / len, -b / len, 1 / len], how: roofHow, roof: true });
    });
    // the ends: gables, and where a wall it leans on stops short, the roof closed under
    var pl = roofPlanes(R, from, kk), mid = [(R.x0 + R.x1) / 2, (R.y0 + R.y1) / 2];
    var wallHow = { wall: true, color: how.color, edge: how.edge, alpha: how.alpha, late: how.late };
    function endWall(a, b) {
      var top = roofProfile(pl, z, a, b);
      if (top.every(function (p) { return p[2] - z < 1; })) { return; }
      var pts = [[a[0], a[1], z], [b[0], b[1], z]].concat(top.slice().reverse()).filter(function (p, i, all) {
        var q = all[(i + all.length - 1) % all.length];
        return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) > 0.01;
      });
      if (pts.length < 3) { return; }
      var nx = b[1] - a[1], ny = a[0] - b[0], l = Math.hypot(nx, ny) || 1;
      if (nx * ((a[0] + b[0]) / 2 - mid[0]) + ny * ((a[1] + b[1]) / 2 - mid[1]) < 0) { nx = -nx; ny = -ny; }
      faces.push({ pts: pts, n: [nx / l, ny / l, 0], how: wallHow, side: true, node: R.room });
    }
    function line(s) {
      return s === "n" ? [[R.x0, R.y0], [R.x1, R.y0]] : s === "s" ? [[R.x0, R.y1], [R.x1, R.y1]]
           : s === "w" ? [[R.x0, R.y0], [R.x0, R.y1]] : [[R.x1, R.y0], [R.x1, R.y1]];
    }
    ends.forEach(function (s) { var L = line(s); endWall(L[0], L[1]); });
    var over = roofRoomRects(houseFloorsNow, R.level + 1), step = 0.25 * P;
    walls.forEach(function (s) {
      var L = line(s), len = Math.hypot(L[1][0] - L[0][0], L[1][1] - L[0][1]), dx = (L[1][0] - L[0][0]) / len, dy = (L[1][1] - L[0][1]) / len;
      var ox = s === "w" ? -8 : s === "e" ? 8 : 0, oy = s === "n" ? -8 : s === "s" ? 8 : 0, run = null, runs = [];
      for (var at = 0; at < len; at += step) {
        var t = Math.min(len, at + step / 2), open = !roofIn(over, L[0][0] + dx * t + ox, L[0][1] + dy * t + oy);
        if (open && !run) { run = [at, Math.min(len, at + step)]; runs.push(run); } else if (open) { run[1] = Math.min(len, at + step); } else { run = null; }
      }
      runs.forEach(function (r) { endWall([L[0][0] + dx * r[0], L[0][1] + dy * r[0]], [L[0][0] + dx * r[1], L[0][1] + dy * r[1]]); });
    });
    // gutters along the eaves its slopes come down to
    if (R.runs && R.runs.length && typeof gutterFaces === "function") {
      var runs = R.runs.filter(function (r) { return from.indexOf(r.side) >= 0; });
      if (runs.length) {
        var eave = Object.assign({}, e);
        ends.forEach(function (s) { eave[s] = grow[s]; });
        walls.forEach(function (s) { eave[s] = 0; });
        try { gutterFaces(faces, Object.assign({}, R, { runs: runs, k: kk, eave: eave }), lift, how); } catch (err) { /* without */ }
      }
    }
  }

  // ---- what is in the house, taken off ------------------------------------------------------
  // Of the faces a roof over R has just put up: what is outside R and over
  // a room on its floor or one higher (an eave through the wall beside it,
  // under the roof next door) cut away; an upright face standing there, gone.
  function roofClipFaces(faces, from, R) {
    var floors = typeof houseFloorsNow !== "undefined" ? houseFloorsNow : [];
    var keepOut = roofRoomRects(floors, R.level).filter(function (b) {
      return b.x0 < R.x0 - 1 || b.x1 > R.x1 + 1 || b.y0 < R.y0 - 1 || b.y1 > R.y1 + 1;
    }).map(function (b) { return { x0: b.x0 + 1, x1: b.x1 - 1, y0: b.y0 + 1, y1: b.y1 - 1 }; });
    if (!keepOut.length || faces.length <= from) { return; }
    var kept = [], inR = { x0: R.x0 - 0.5, x1: R.x1 + 0.5, y0: R.y0 - 0.5, y1: R.y1 + 0.5 };
    function hits(bb, B) { return bb.x0 < B.x1 && bb.x1 > B.x0 && bb.y0 < B.y1 && bb.y1 > B.y0; }
    faces.slice(from).forEach(function (f) {
      var bb = roofBounds(f.pts);
      if ((bb.x0 >= inR.x0 && bb.x1 <= inR.x1 && bb.y0 >= inR.y0 && bb.y1 <= inR.y1) || !keepOut.some(function (B) { return hits(bb, B); })) {
        kept.push(f);
        return;
      }
      if (roofArea(f.pts) < 1 || f.tex) {
        // upright (or pictured): kept or not by where its middle is
        var cx = (bb.x0 + bb.x1) / 2, cy = (bb.y0 + bb.y1) / 2;
        var inside = cx >= inR.x0 && cx <= inR.x1 && cy >= inR.y0 && cy <= inR.y1;
        if (inside || !keepOut.some(function (B) { return cx > B.x0 + 1 && cx < B.x1 - 1 && cy > B.y0 + 1 && cy < B.y1 - 1; })) { kept.push(f); }
        return;
      }
      var mine = roofCut(roofCut(roofCut(roofCut(f.pts, 1, 0, inR.x1), -1, 0, -inR.x0), 0, 1, inR.y1), 0, -1, -inR.y0);
      if (mine) { kept.push(Object.assign({}, f, { pts: mine })); }
      roofMinus(f.pts, inR).forEach(function (piece) {
        var bits = [piece];
        keepOut.forEach(function (B) {
          var next = [];
          bits.forEach(function (bit) { if (hits(roofBounds(bit), B)) { next = next.concat(roofMinus(bit, B)); } else { next.push(bit); } });
          bits = next;
        });
        bits.forEach(function (bit) { kept.push(Object.assign({}, f, { pts: bit })); });
      });
    });
    faces.length = from;
    kept.forEach(function (f) { faces.push(f); });
  }

  if (typeof roofFaces === "function") {
    var roofFacesKept = roofFaces;
    roofFaces = function (faces, R, lift, how) {
      if (R.turn || !how) { return roofFacesKept.apply(this, arguments); }
      var shape = typeof styleRoofShape === "function" ? styleRoofShape() : "hip", from = faces.length, got;
      if (R.up && !ROOF_LEVEL[shape]) {
        try { roofLean(faces, R, lift, how, shape); }
        catch (e) { faces.length = from; got = roofFacesKept.apply(this, arguments); }
      } else {
        got = roofFacesKept.apply(this, arguments);
      }
      try { roofClipFaces(faces, from, R); } catch (e) { /* as drawn */ }
      return got;
    };
  }
