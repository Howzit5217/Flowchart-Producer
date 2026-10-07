// ---------------------------------------------------------------------------
//  40-shaped.js -- a room need not be a rectangle at all: cut to a shape --
//  a skyscraper's floor following its glass round a curve, a wing at an
//  angle -- its floor and its ceiling that shape, its walls only where the
//  shape has an edge, what is in it kept inside it, walked inside it
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-06: "their floor layout is still the square for whatever the smallest floor
  // is rather then the actual structurally designed skyscraper because sometimes it is not going to
  // be a square or rectangle and the floor plan needs to be able to adapt to weird shapes and this
  // should also be allowed for houses and other buildings too")
  //
  // A room's `shape`: its corners, [x, y] from its middle in its own numbers (as it is before it is
  // turned), inside its box (w, h).  The box is still the room for everything that works in boxes --
  // how rooms are put together, which floor it is on -- and the shape is what it is: its floor, its
  // ceiling and its walls (38-view3d.js), what stands in it (insideArea, 03-icons.js), where it is
  // walked (38-walk.js), where a door between it and the next can go (39-join.js).  `skin`: the
  // edges of its shape off its box are the building's own outside, glass the building draws itself
  // (40-towers.js) -- no wall of the room's there, and no window put in one.
  //
  // Start building cuts a building's floors to an outline where its plan gives one (a floor's
  // `clip`, in metres from the corner of the floor as planned: starterCut, called by 39-starter.js
  // once the rooms and the ways between them are made): what is outside it is gone, what is
  // partly outside it cut to it, and what could then only be got to through what is gone, gone too.

  // ---- shapes -------------------------------------------------------------------------------
  // A shape cut to a box (l, t, r, b): what of it is inside (Sutherland and Hodgman's way, the box
  // its four sides in turn).
  function shpClipRect(poly, l, t, r, b) {
    var out = poly;
    [[0, l, 1], [0, r, -1], [1, t, 1], [1, b, -1]].forEach(function (c) {
      var ax = c[0], v = c[1], s = c[2], inp = out;
      out = [];
      for (var i = 0; i < inp.length; i++) {
        var p = inp[i], q = inp[(i + 1) % inp.length], pin = (p[ax] - v) * s >= -1e-9, qin = (q[ax] - v) * s >= -1e-9;
        if (pin) { out.push(p); }
        if (pin !== qin) {
          var k = (v - p[ax]) / (q[ax] - p[ax]);
          out.push([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]);
        }
      }
    });
    return shpTidy(out);
  }
  // Without corners twice over or in a straight line.
  function shpTidy(poly) {
    var out = [];
    poly.forEach(function (p) {
      var q = out[out.length - 1];
      if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.4) { out.push([p[0], p[1]]); }
    });
    if (out.length > 1 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) <= 0.4) { out.pop(); }
    for (var pass = 0; pass < 2 && out.length > 3; pass++) {
      out = out.filter(function (p, i) {
        var a = out[(i + out.length - 1) % out.length], b = out[(i + 1) % out.length];
        var cross = (p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0]);
        return Math.abs(cross) > 0.5 * Math.hypot(b[0] - a[0], b[1] - a[1]);
      });
    }
    return out;
  }
  function shpArea(poly) {
    var a = 0;
    for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; }
    return Math.abs(a) / 2;
  }
  function shpLength(poly) {
    var l = 0;
    for (var i = 0; i < poly.length; i++) { var p = poly[i], q = poly[(i + 1) % poly.length]; l += Math.hypot(q[0] - p[0], q[1] - p[1]); }
    return l;
  }
  // How far x, y is from the shape's edge.
  function shpNear(poly, x, y) {
    var near = Infinity;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j], ex = b[0] - a[0], ey = b[1] - a[1], L = ex * ex + ey * ey;
      var t = L ? Math.max(0, Math.min(1, ((x - a[0]) * ex + (y - a[1]) * ey) / L)) : 0;
      near = Math.min(near, Math.hypot(x - a[0] - ex * t, y - a[1] - ey * t));
    }
    return near;
  }
  // A point of a room, its own numbers (from its middle, before it is turned).
  function shpLocal(n, x, y) {
    var a = -(n.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), dx = x - n.x, dy = y - n.y;
    return [dx * c - dy * s, dx * s + dy * c];
  }
  // The stretches along one side of a room's box (as v3Wall measures them, 0 to its length) where its
  // shape's edge runs along that side: where it has a wall.
  function shpSideRuns(n, edge) {
    var hw = n.w / 2, hh = n.h / 2, poly = n.shape, out = [], e = 1.0;
    for (var i = 0; i < poly.length; i++) {
      var p = poly[i], q = poly[(i + 1) % poly.length];
      if (edge === "top" && Math.abs(p[1] + hh) < e && Math.abs(q[1] + hh) < e) { out.push([Math.min(p[0], q[0]) + hw, Math.max(p[0], q[0]) + hw]); }
      else if (edge === "foot" && Math.abs(p[1] - hh) < e && Math.abs(q[1] - hh) < e) { out.push([Math.min(p[0], q[0]) + hw, Math.max(p[0], q[0]) + hw]); }
      else if (edge === "left" && Math.abs(p[0] + hw) < e && Math.abs(q[0] + hw) < e) { out.push([Math.min(p[1], q[1]) + hh, Math.max(p[1], q[1]) + hh]); }
      else if (edge === "right" && Math.abs(p[0] - hw) < e && Math.abs(q[0] - hw) < e) { out.push([Math.min(p[1], q[1]) + hh, Math.max(p[1], q[1]) + hh]); }
    }
    return out.filter(function (r) { return r[1] - r[0] > 0.5; }).sort(function (a, b) { return a[0] - b[0]; });
  }
  // Its edges that are not along its box: [[x, y], [x, y]] each, its own numbers.
  function shpOffEdges(n) {
    var hw = n.w / 2, hh = n.h / 2, poly = n.shape, out = [], e = 1.0;
    for (var i = 0; i < poly.length; i++) {
      var p = poly[i], q = poly[(i + 1) % poly.length];
      var onBox = (Math.abs(p[1] + hh) < e && Math.abs(q[1] + hh) < e) || (Math.abs(p[1] - hh) < e && Math.abs(q[1] - hh) < e) ||
                  (Math.abs(p[0] + hw) < e && Math.abs(q[0] + hw) < e) || (Math.abs(p[0] - hw) < e && Math.abs(q[0] - hw) < e);
      if (!onBox && Math.hypot(q[0] - p[0], q[1] - p[1]) > 0.5) { out.push([p, q]); }
    }
    return out;
  }

  // ---- in 3D --------------------------------------------------------------------------------
  // Its box's walls only where its shape has an edge along them (v3Wall, 38-view3d.js, by the runs
  // kept: 39-inside.js's way of taking a wall out between two rooms)
  if (typeof wallKeepOpen === "function") {
    var wallKeepOpenShaped = wallKeepOpen;
    wallKeepOpen = function (room, edge) {
      var k = wallKeepOpenShaped.apply(this, arguments);
      if (!room || !room.shape) { return k; }
      var on = shpSideRuns(room, edge);
      return function (e2, a, b) {
        var kept = k ? k(e2, a, b) : [[a, b]], out = [];
        kept.forEach(function (s) {
          on.forEach(function (o) {
            var lo = Math.max(s[0], o[0]), hi = Math.min(s[1], o[1]);
            if (hi - lo > 0.5) { out.push([lo, hi]); }
          });
        });
        return out;
      };
    };
  }
  // and along its edges off its box, a wall of its own -- or, the building's outside, none: its own glass
  function shpWalls(faces, n, T, how, low, wallsUp) {
    if (n.skin) { return; }
    var P = FLOOR_PX, ceil = ceilOf(n) * P, high = wallsUp || ceil, tall = low ? Math.min(1.1 * P, high) : high;
    shpOffEdges(n).forEach(function (e) {
      var p = e[0], q = e[1], L = Math.hypot(q[0] - p[0], q[1] - p[1]), nx = -(q[1] - p[1]) / L, ny = (q[0] - p[0]) / L;
      // (in toward the room)
      var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
      if (!shpHolds(n.shape, mx + nx * 1.5, my + ny * 1.5, 0)) { nx = -nx; ny = -ny; }
      var ux = (q[0] - p[0]) / L, uy = (q[1] - p[1]) / L;
      // a piece of it: `a` to `b` along it, `d0` to `d1` in from its outside face, `z0` to `z1` up
      function part(a, b, z0, z1, h, d0, d1) {
        if (b - a < 0.5 || z1 - z0 < 0.5) { return; }
        d0 = d0 === undefined ? 0 : d0; d1 = d1 === undefined ? T : d1;
        var pts = [[a, d0], [b, d0], [b, d1], [a, d1]].map(function (c) {
          return v3Local(n, p[0] + ux * c[0] + nx * c[1], p[1] + uy * c[0] + ny * c[1]);
        });
        v3Prism(faces, pts, z0, z1, h || how);
      }
      // (2026-10-07) the outside wall a cut makes -- a house's rounded corner, its front swept round --
      // with its windows in it as the straight walls have theirs: one every two and a half metres
      var wins = low || L < 1.9 * P ? 0 : Math.max(1, Math.floor((L - 0.6 * P) / (2.5 * P)));
      if (!wins) { part(0, L, 0, tall); return; }
      var ww = Math.min(1.2 * P, L / wins - 0.6 * P), sill = SILL * P, top = Math.min(DOOR_TALL * P, ceil - 0.1 * P), at = 0;
      var trimC = typeof styleTrim === "function" ? styleTrim("#f4f2ed") : "#f4f2ed", F = 1.6;
      var trim = { piece: true, color: trimC, edge: v3Mix(trimC, "#000000", 0.35) };
      for (var i = 0; i < wins; i++) {
        var c = L * (i + 0.5) / wins, a = c - ww / 2, b = c + ww / 2;
        part(at, a, 0, tall);
        part(a, b, 0, Math.min(tall, sill));
        part(a, b, top, tall);
        part(a - 2, b + 2, sill - 0.04 * P, sill + 0.4, trim, -2.5, T + 1);
        part(a, a + F, sill, top, trim, -0.4, T + 0.4);
        part(b - F, b, sill, top, trim, -0.4, T + 0.4);
        part(a, b, top - F, top, trim, -0.4, T + 0.4);
        part(a, b, sill, sill + F, trim, -0.4, T + 0.4);
        part(a + F, b - F, sill + F, top - F, { glass: true }, T / 2 - 0.3, T / 2 + 0.3);
        at = b;
      }
      part(at, L, 0, tall);
    });
  }
  // ---- its roof, cut to it ---------------------------------------------------------------------
  // (2026-10-07) A roof is made over a rectangle of rooms (roofPlan, 38-view3d.js, and the styles'
  // and the house's own ways of it): where a room under it is cut to a shape -- a house's corners
  // rounded or angled, its front swept round -- the roof is cut along the same lines, and the gap
  // between the top of the wall and the slope over it closed, as a gable is.  (Every footprint asked
  // for is convex, so the rooms under a rectangle are, all together, the round of their corners.)
  if (typeof roofPlan === "function") {
    var roofPlanShaped = roofPlan;
    roofPlan = function (floors, upTo, wallTop) {
      var rects = roofPlanShaped.apply(this, arguments);
      try { shpRoofHulls(rects, floors); } catch (e) { /* the roofs as they were */ }
      return rects;
    };
  }
  function shpRoofHulls(rects, floors) {
    if (!hand.nodes.some(function (n) { return n.kind === "i_room" && n.shape && !n.skin; })) { return; }
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && !((n.turn || 0) % 360); }).map(function (r) {
      var f = floors && floors.length ? floorAt(floors, r.x, r.y) : null;
      return { r: r, level: f ? f.level : 0, x: r.x + (f ? f.dx : 0), y: r.y + (f ? f.dy : 0) };
    });
    rects.forEach(function (R) {
      if (R.turn) { return; }
      var mine = rooms.filter(function (o) { return o.level === R.level && o.x > R.x0 - 1 && o.x < R.x1 + 1 && o.y > R.y0 - 1 && o.y < R.y1 + 1; });
      if (!mine.some(function (o) { return o.r.shape && !o.r.skin; })) { return; }
      var pts = [];
      mine.forEach(function (o) {
        var r = o.r, sh = r.shape || [[-r.w / 2, -r.h / 2], [r.w / 2, -r.h / 2], [r.w / 2, r.h / 2], [-r.w / 2, r.h / 2]];
        sh.forEach(function (q) { pts.push([o.x + q[0], o.y + q[1]]); });
      });
      var hull = shpHull(pts);
      if (hull.length >= 3) { R.hull = hull; }
    });
  }
  // The convex hull of points (Andrew's way), round anticlockwise as the page is drawn (y down).
  function shpHull(pts) {
    var P = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    if (P.length < 3) { return P; }
    function cross(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], hi = [];
    P.forEach(function (p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) { lo.pop(); } lo.push(p); });
    for (var i = P.length - 1; i >= 0; i--) { var p = P[i]; while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) { hi.pop(); } hi.push(p); }
    hi.pop(); lo.pop();
    return lo.concat(hi);
  }
  // The part of a face (points x, y, z) where a.x + b.y <= c -- and where it met that line, kept in `seg`.
  function shpCutFace(pts, a, b, c, seg) {
    var out = [];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], q = pts[(i + 1) % pts.length], dp = a * p[0] + b * p[1] - c, dq = a * q[0] + b * q[1] - c;
      if (dp <= 1e-6) { out.push(p); }
      if ((dp < -1e-6 && dq > 1e-6) || (dp > 1e-6 && dq < -1e-6)) {
        var t = dp / (dp - dq), m = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
        out.push(m);
        if (seg) { seg.push(m); }
      }
    }
    return out.length >= 3 ? out : null;
  }
  if (typeof roofFaces === "function") {
    var roofFacesShaped = roofFaces;
    roofFaces = function (faces, R, lift, how) {
      if (!R || !R.hull) { return roofFacesShaped.apply(this, arguments); }
      var from = faces.length, out = roofFacesShaped.apply(this, arguments);
      try { shpRoofCut(faces, from, R, lift || 0, how); } catch (e) { /* the roof as it was */ }
      return out;
    };
  }
  function shpRoofCut(faces, from, R, lift, how) {
    var H = R.hull, zw = R.z + lift + (R.bias || 0), lines = [];
    // (the hull's sides that cut across the rectangle -- not those along its own sides, where its eaves hang out)
    for (var i = 0; i < H.length; i++) {
      var p = H[i], q = H[(i + 1) % H.length];
      var onSide = (Math.abs(p[0] - q[0]) < 1 && (Math.abs(p[0] - R.x0) < 2 || Math.abs(p[0] - R.x1) < 2)) ||
                   (Math.abs(p[1] - q[1]) < 1 && (Math.abs(p[1] - R.y0) < 2 || Math.abs(p[1] - R.y1) < 2));
      if (onSide || Math.hypot(q[0] - p[0], q[1] - p[1]) < 1) { continue; }
      // (outward: the hull runs round with the inside on one side -- the side its middle is)
      var a = q[1] - p[1], b = -(q[0] - p[0]), L = Math.hypot(a, b), cx = 0, cy = 0;
      H.forEach(function (h) { cx += h[0] / H.length; cy += h[1] / H.length; });
      a /= L; b /= L;
      var c = a * p[0] + b * p[1];
      if (a * cx + b * cy > c) { a = -a; b = -b; c = -c; }
      lines.push([a, b, c]);
    }
    if (!lines.length) { return; }
    var wallHow = { wall: true, color: how && how.color, edge: how && how.edge, alpha: how && how.alpha, late: how && how.late };
    var kept = [], walls = [];
    for (var k = from; k < faces.length; k++) {
      var F = faces[k], pts = F.pts;
      for (var j = 0; j < lines.length && pts; j++) {
        var seg = [];
        pts = shpCutFace(pts, lines[j][0], lines[j][1], lines[j][2], seg);
        // (where a slope was cut: the wall carried up under it to meet it)
        if (pts && F.roof && seg.length === 2 && Math.max(seg[0][2], seg[1][2]) > zw + 1) {
          var s0 = seg[0], s1 = seg[1];
          walls.push({ pts: [[s0[0], s0[1], zw], [s1[0], s1[1], zw], [s1[0], s1[1], Math.max(zw, s1[2])], [s0[0], s0[1], Math.max(zw, s0[2])]],
                       n: [lines[j][0], lines[j][1], 0], how: wallHow, side: true, node: R.room });
        }
      }
      if (pts) { F.pts = pts; kept.push(F); }
    }
    faces.length = from;
    kept.concat(walls).forEach(function (F) { faces.push(F); });
  }
  // A door drawn by the building itself where it stands -- a skyscraper's way in through its glass,
  // its revolving door (40-towers.js): not a door of the room's of its own as well.
  if (typeof wallDoorGone === "function") {
    var wallDoorGoneShaped = wallDoorGone;
    wallDoorGone = function (d) { return !!(d && d.skinDoor) || wallDoorGoneShaped.apply(this, arguments); };
  }
  // and its way in always open -- a revolving door is walked through, not opened first (38-walk.js)
  if (typeof doorIsOpen === "function") {
    var doorIsOpenShaped = doorIsOpen;
    doorIsOpen = function (n) { return n && n.skinDoor && !doorLocked(n) ? true : doorIsOpenShaped.apply(this, arguments); };
  }

  // ---- on the plan ---------------------------------------------------------------------------
  // Drawn as it is: its floor the shape, its wall a band round inside it.
  function shpPath(pts) {
    return pts.map(function (p, i) { return (i ? "L" : "M") + (Math.round(p[0] * 10) / 10) + " " + (Math.round(p[1] * 10) / 10); }).join(" ") + " Z";
  }
  // The shape moved in by `d` all round (each corner along the line halfway between its two sides).
  function shpInset(pts, d) {
    var m = pts.length, area = 0, i;
    for (i = 0; i < m; i++) { area += pts[i][0] * pts[(i + 1) % m][1] - pts[(i + 1) % m][0] * pts[i][1]; }
    var s = area > 0 ? 1 : -1;
    return pts.map(function (p, k) {
      var a = pts[(k + m - 1) % m], b = pts[(k + 1) % m];
      var e1 = [p[0] - a[0], p[1] - a[1]], e2 = [b[0] - p[0], b[1] - p[1]], l1 = Math.hypot(e1[0], e1[1]) || 1, l2 = Math.hypot(e2[0], e2[1]) || 1;
      var n1 = [-e1[1] / l1 * s, e1[0] / l1 * s], n2 = [-e2[1] / l2 * s, e2[0] / l2 * s];
      var bx = n1[0] + n2[0], by = n1[1] + n2[1], bl = Math.hypot(bx, by) || 1;
      var k2 = Math.min(4, 1 / Math.max(0.25, (bx * n1[0] + by * n1[1]) / bl));
      return [p[0] + bx / bl * d * k2, p[1] + by / bl * d * k2];
    });
  }
  if (typeof ICONS === "object" && ICONS.i_room && typeof ICONS.i_room.art === "function") {
    var shpRoomArt = ICONS.i_room.art;
    ICONS.i_room.art = function (w, h) {
      var n = typeof iconNode !== "undefined" ? iconNode : null;
      if (!n || n.kind !== "i_room" || !n.shape || !n.w || !n.h) { return shpRoomArt.apply(this, arguments); }
      var T = Math.max(1, Math.min(6, Math.min(w, h) * 0.06)), sx = w / n.w, sy = h / n.h;
      var pts = n.shape.map(function (p) { return [p[0] * sx + w / 2, p[1] * sy + h / 2]; });
      return ["o " + shpPath(pts), "ke " + shpPath(pts) + " " + shpPath(shpInset(pts, T))];
    };
  }

  // ---- walked ----------------------------------------------------------------------------------
  // The squares of 38-walk.js's plan its walls stand on: along each edge of its shape, from just
  // outside it to a wall's thickness in (as wallAt says of a box's) -- the edges walked, not the room.
  function shpWallCells(plan, room, wall, mark) {
    var poly = room.shape, C = WALK_CELL, step = C / 2, out = 4, inn = wall + 4;
    var a = (room.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    var area = 0, i;
    for (i = 0; i < poly.length; i++) { area += poly[i][0] * poly[(i + 1) % poly.length][1] - poly[(i + 1) % poly.length][0] * poly[i][1]; }
    var inward = area > 0 ? 1 : -1;
    for (i = 0; i < poly.length; i++) {
      var p = poly[i], q = poly[(i + 1) % poly.length], ex = q[0] - p[0], ey = q[1] - p[1], L = Math.hypot(ex, ey);
      if (L < 0.5) { continue; }
      var ux = ex / L, uy = ey / L, nx = -uy * inward, ny = ux * inward;
      for (var t = 0; t <= L + 0.01; t += step) {
        for (var d = -out; d <= inn + 0.01; d += step) {
          var lx = p[0] + ux * t + nx * d, ly = p[1] + uy * t + ny * d;
          var x = room.x + lx * c - ly * s, y = room.y + lx * s + ly * c;
          var col = Math.floor((x - plan.x0) / C), row = Math.floor((y - plan.y0) / C);
          if (col >= 0 && row >= 0 && col < plan.cols && row < plan.rows) { mark(row * plan.cols + col); }
        }
      }
    }
  }
  // Its wall where its shape's edge is (38-walk.js's squares): the way out of it only by its doors.
  if (typeof wallAt === "function") {
    var wallAtShaped = wallAt;
    wallAt = function (room, x, y, wall) {
      if (!room || !room.shape) { return wallAtShaped.apply(this, arguments); }
      var q = shpLocal(room, x, y), out = 4, inn = wall + 4;
      if (Math.abs(q[0]) > room.w / 2 + out || Math.abs(q[1]) > room.h / 2 + out) { return false; }
      var near = shpNear(room.shape, q[0], q[1]);
      return shpHolds(room.shape, q[0], q[1], 0) ? near <= inn : near <= out;
    };
  }

  // ---- put together ------------------------------------------------------------------------------
  // The wall two rooms share: only where both their shapes reach it (39-join.js's boxes carry them).
  if (typeof tieWall === "function") {
    var tieWallShaped = tieWall;
    tieWall = function (p, q) {
      var w = tieWallShaped.apply(this, arguments);
      if (!w || !(p.shape || q.shape)) { return w; }
      var best = null, run = null;
      for (var at = w.lo; at <= w.hi + 0.01; at += 3) {
        var ok = [[p, -w.into], [q, w.into]].every(function (one) {
          var b = one[0];
          if (!b.shape) { return true; }
          var x = w.across ? at : w.line + one[1] * 8, y = w.across ? w.line + one[1] * 8 : at;
          return shpHolds(b.shape, x - b.x, y - b.y, 0);
        });
        if (ok) {
          if (!run) { run = { lo: at, hi: at }; } else { run.hi = at; }
          if (!best || run.hi - run.lo > best.hi - best.lo) { best = { lo: run.lo, hi: run.hi }; }
        } else { run = null; }
      }
      if (!best || best.hi - best.lo < 6) { return null; }
      return Object.assign({}, w, { lo: best.lo, hi: best.hi });
    };
  }
  // Start building: no window put in the building's own glass.
  if (typeof starterIntoWall === "function") {
    var starterIntoWallShaped = starterIntoWall;
    starterIntoWall = function (r, kind) {
      if (r && r.skin && kind === "i_window") { return null; }
      return starterIntoWallShaped.apply(this, arguments);
    };
  }

  // Lights in rows (39-types.js): only over the shape -- and in a big room a little further apart.
  if (typeof typeLights === "function") {
    var typeLightsShaped = typeLights;
    typeLights = function (r) {
      if (!r || !r.shape) { return typeLightsShaped.apply(this, arguments); }
      var P = FLOOR_PX, b = tieBox(r), step = (r.w * r.h > 150 * P * P ? 5 : 4) * P;
      var nx = Math.max(1, Math.round((b.r - b.l) / step)), ny = Math.max(1, Math.round((b.b - b.t) / step));
      for (var i = 0; i < nx; i++) {
        for (var j = 0; j < ny; j++) {
          var x = Math.round(b.l + (i + 0.5) * (b.r - b.l) / nx), y = Math.round(b.t + (j + 0.5) * (b.b - b.t) / ny);
          if (insideArea(r, x, y, 0.4 * P)) { adviceAdd("i_pendant", x, y); }
        }
      }
    };
  }

  // ---- a building's floors cut to their outlines ------------------------------------------------------
  // (39-starter.js, once the rooms of every floor are made and the ways between them are known --
  // before the floors are boxed, furnished, lit.)  `ctx`: flip (the plan drawn mirrored), X (metres
  // to the paper's numbers), fronts (the doors out to the street).
  function starterCut(plan, floors, made, ctx) {
    // (or, any other building, the footprint asked for: its corners rounded, angled, its front swept round)
    var want = ctx.want || {}, foot = want.type !== "tower" && SHP_FOOTS.indexOf(want.footprint) > 0 ? want.footprint : null;
    if (!plan || !plan.floors || (!foot && !plan.floors.some(function (fp) { return fp && fp.clip; }))) { return; }
    var X = ctx.X, P = FLOOR_PX, gone = new Set(), byId = {};
    made.forEach(function (r) { byId[r.id] = r; });
    floors.forEach(function (f, i) {
      var fp = plan.floors[i] || {};
      var poly = fp.clip && fp.clip.length >= 3 ? fp.clip.map(function (p) { return [ctx.flip ? -X(p[0]) : X(p[0]), X(p[1])]; })
               : foot ? shpFootOf(f, foot, ctx.fronts) : null;
      if (!poly) { return; }
      f.clipPx = poly;
      f.nodes.forEach(function (r) {
        if (r.kind !== "i_room" || !r.local) { return; }
        var L = r.local, A = (L[2] - L[0]) * (L[3] - L[1]);
        if (fp.skin) { r.skin = true; }
        // (the stairs, the lifts and the rest of the core stand over each other floor on floor: as they are;
        // and a room a way in from outside would be cut from, or a garage: its corner kept square)
        if (SHP_KEEP[r.starter] || r.shpKeep) { delete r.shpKeep; return; }
        var cut = shpClipRect(poly, L[0], L[1], L[2], L[3]), a = cut.length >= 3 ? shpArea(cut) : 0;
        var thick = a > 0 ? 2 * a / shpLength(cut) : 0;
        if (a < Math.max(2.5 * P * P, A * 0.08) || thick < 0.75 * P) { gone.add(r); return; }
        if (a < A * 0.995) {
          var cx = (L[0] + L[2]) / 2, cy = (L[1] + L[3]) / 2;
          r.shape = cut.map(function (p) { return [Math.round((p[0] - cx) * 10) / 10, Math.round((p[1] - cy) * 10) / 10]; });
        }
      });
    });
    if (!floors.some(function (f) { return f.clipPx; })) { return; }
    // what is left that can be got to: from the stairs and the lifts (and the ways in from the street),
    // room to room by the ways between them -- each a wall the two still share, a door wide
    var rooms = made.filter(function (r) { return !gone.has(r); });
    var near = {};
    hand.links.forEach(function (l) {
      var a = byId[l.from], b = byId[l.to];
      if (!a || !b || gone.has(a) || gone.has(b)) { return; }
      if (!shpShared(a, b)) { return; }
      (near[a.id] = near[a.id] || []).push(b); (near[b.id] = near[b.id] || []).push(a);
    });
    var reached = new Set(), todo = rooms.filter(function (r) { return SHP_KEEP[r.starter] || r.starterEntry; });
    todo.forEach(function (r) { reached.add(r); });
    while (todo.length) {
      var r0 = todo.pop();
      (near[r0.id] || []).forEach(function (o) { if (!reached.has(o)) { reached.add(o); todo.push(o); } });
    }
    // (a floor with no stairs or lift at all -- a house's own -- is left as it was got to)
    floors.forEach(function (f) {
      if (!f.clipPx) { return; }
      var mine = f.nodes.filter(function (r) { return r.kind === "i_room" && !gone.has(r); });
      if (!mine.some(function (r) { return reached.has(r); })) { return; }
      mine.forEach(function (r) { if (!reached.has(r)) { gone.add(r); } });
    });
    if (gone.size) {
      var keep = function (n) { return !gone.has(n); };
      for (var m = made.length - 1; m >= 0; m--) { if (gone.has(made[m])) { made.splice(m, 1); } }
      floors.forEach(function (f) {
        f.nodes = f.nodes.filter(keep);
        f.back = f.back.filter(keep); f.front = f.front.filter(keep);
        f.mids = (f.mids || []).map(function (row) { return row.filter(keep); });
        f.halls = (f.halls || []).filter(keep);
        if (f.hall && gone.has(f.hall)) { f.hall = f.halls[0] || null; }
      });
      var ids = {};
      gone.forEach(function (r) { ids[r.id] = true; });
      hand.links = hand.links.filter(function (l) { return !ids[l.from] && !ids[l.to]; });
      hand.nodes = hand.nodes.filter(keep);
    }
    // the ways in from the street, in the building's own glass straight out in front of their rooms
    (ctx.fronts || []).forEach(function (d) {
      var l = hand.links.filter(function (k) { return k.to === d.id; })[0], r = l && byId[l.from];
      if (!r || gone.has(r)) {
        hand.nodes = hand.nodes.filter(function (n) { return n !== d; });
        floors.forEach(function (f) { f.nodes = f.nodes.filter(function (n) { return n !== d; }); });
        hand.links = hand.links.filter(function (k) { return k.to !== d.id && k.from !== d.id; });
        return;
      }
      if (!r.shape || !r.skin) { return; }
      var foot = shpFoot(r.shape);
      if (!foot) { return; }
      d.x = Math.round(r.x + foot[0]); d.y = Math.round(r.y + foot[1] - d.h / 2); d.turn = 0;
      d.skinDoor = true; d.own = true;
      hand.links = hand.links.filter(function (k) { return k !== l; });
    });
  }
  // ---- a footprint not a box, for any building -------------------------------------------------
  // (2026-10-07, the same for a house or any building but a skyscraper, which has its forms: "this
  // should also be allowed for houses and other buildings too")  Start building asks how its corners
  // are -- square, rounded, angled, or its front swept round -- and each floor is cut to that outline
  // over the rooms it has.  All of them convex: the roof over them cut to the same (below).
  var SHP_FOOTS = ["box", "rounded", "angled", "curved"];
  var SHP_FOOT_KEEP = { garage: 1, carport: 1, porch: 1 };
  // The outline, round the box l, t, r, b (the paper's numbers: y down the page, the front at b),
  // its corners `size` across (or as each shape has them).
  function shpFootSize(kind, l, t, r, b) {
    var W = r - l, D = b - t, m = Math.min(W, D);
    return kind === "rounded" ? 0.22 * m : kind === "angled" ? 0.2 * m : kind === "curved" ? Math.min(0.45 * W / 2, 0.7 * D) : 0;
  }
  function shpFootPoly(kind, l, t, r, b, size) {
    var out = [], q = size === undefined ? shpFootSize(kind, l, t, r, b) : size;
    function arc(cx, cy, rad, a0, a1, n) {
      for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); }
    }
    if (!(q > 0)) { return null; }
    if (kind === "rounded") {
      arc(r - q, b - q, q, 0, Math.PI / 2, 6); arc(l + q, b - q, q, Math.PI / 2, Math.PI, 6);
      arc(l + q, t + q, q, Math.PI, 1.5 * Math.PI, 6); arc(r - q, t + q, q, 1.5 * Math.PI, 2 * Math.PI, 6);
      return out;
    }
    if (kind === "angled") {
      return [[l + q, t], [r - q, t], [r, t + q], [r, b - q], [r - q, b], [l + q, b], [l, b - q], [l, t + q]];
    }
    if (kind === "curved") {
      // (the front's corners swept round, its middle straight for the way in; the back square)
      out.push([l, t], [r, t]);
      arc(r - q, b - q, q, 0, Math.PI / 2, 10); arc(l + q, b - q, q, Math.PI / 2, Math.PI, 10);
      return out;
    }
    return null;
  }
  // A floor's outline, round its rooms but a garage's (or a carport's, a porch's: a wing of its own,
  // square, beside it) -- its corners no bigger than leaves each way in from outside on a straight
  // stretch of wall, the same either side.  Too small for that to be worth it: a room whose way in
  // would be cut keeps its corner square instead.
  function shpFootOf(f, kind, fronts) {
    var P = FLOOR_PX, rooms = f.nodes.filter(function (r) { return r.kind === "i_room" && r.local; });
    var main = rooms.filter(function (r) { return !SHP_FOOT_KEEP[r.starter]; });
    if (!main.length) { return null; }
    var l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    main.forEach(function (n) { l = Math.min(l, n.local[0]); t = Math.min(t, n.local[1]); r = Math.max(r, n.local[2]); b = Math.max(b, n.local[3]); });
    if (r - l < 4 * P || b - t < 4 * P) { return null; }
    rooms.forEach(function (n) { if (SHP_FOOT_KEEP[n.starter]) { n.shpKeep = true; } });
    var mine = {};
    rooms.forEach(function (n) { mine[n.id] = n; });
    // each way in from outside: the room it is from, and where it is on the outline's box
    var ways = [];
    (fronts || []).forEach(function (d) {
      hand.links.forEach(function (k) {
        var n = k.to === d.id ? mine[k.from] : k.from === d.id ? mine[k.to] : null;
        if (!n || SHP_FOOT_KEEP[n.starter]) { return; }
        // (where it is in its room's wall: a door out is drawn a step out past it on the paper)
        var x = (n.local[0] + n.local[2]) / 2 + (d.x - n.x), y = (n.local[1] + n.local[3]) / 2 + (d.y - n.y);
        ways.push({ n: n, x: Math.max(n.local[0], Math.min(n.local[2], x)), y: Math.max(n.local[1], Math.min(n.local[3], y)) });
      });
    });
    var size = shpFootSize(kind, l, t, r, b), room = 0.8 * P;
    ways.forEach(function (w) {
      var side = [["b", Math.abs(w.y - b)], ["t", Math.abs(w.y - t)], ["l", Math.abs(w.x - l)], ["r", Math.abs(w.x - r)]]
        .sort(function (p, q) { return p[1] - q[1]; })[0];
      if (side[1] > 1.2 * P) { return; }                     // (not out in the outline's own walls)
      var along = side[0] === "b" || side[0] === "t" ? Math.min(w.x - l, r - w.x) : kind === "curved" ? b - w.y : Math.min(w.y - t, b - w.y);
      if (kind === "curved" && side[0] === "t") { return; }   // (its back is square)
      size = Math.min(size, along - room);
    });
    if (size < 1.2 * P) {
      // (too small to be worth it: the full size, those rooms square)
      size = shpFootSize(kind, l, t, r, b);
      var poly0 = shpFootPoly(kind, l, t, r, b, size);
      ways.forEach(function (w) { if (!shpHolds(poly0, w.x, w.y - 8, 0) && !shpHolds(poly0, w.x, w.y + 8, 0)) { w.n.shpKeep = true; } });
      return poly0;
    }
    return shpFootPoly(kind, l, t, r, b, size);
  }
  // Asked on Start building's sheet, beside what it has: for a house before its extra rooms, for any
  // other building (a skyscraper has its forms instead) before what goes round it.
  function shpFootAsk(ui, want) {
    if (!ui || !want || want.type === "tower" || !ui.tiles || !ui.tile) { return; }
    ui.head(TXT.shp_head);
    ui.tiles();
    SHP_FOOTS.forEach(function (k) {
      ui.tile(TXT["shp_" + k], "shp_" + k, function () { return (want.footprint || "box") === k; }, function () { want.footprint = k; }, true);
    });
  }
  if (typeof roomsAsk === "function") {
    var roomsAskShaped = roomsAsk;
    roomsAsk = function (ui, want) { try { shpFootAsk(ui, want); } catch (e) { /* not asked */ } return roomsAskShaped.apply(this, arguments); };
  }
  if (typeof groundsAsk === "function") {
    var groundsAskShaped = groundsAsk;
    groundsAsk = function (ui, want) { try { shpFootAsk(ui, want); } catch (e) { /* not asked */ } return groundsAskShaped.apply(this, arguments); };
  }
  // The sheet's sketch of it (39-starter.js) cut the same: each floor's rooms to its outline -- a
  // skyscraper's form at that height, or the footprint asked for -- what is left of each drawn as it is.
  var shpSketchPlan = null;
  if (typeof starterPlan === "function") {
    var starterPlanShaped = starterPlan;
    starterPlan = function () { var plan = starterPlanShaped.apply(this, arguments); shpSketchPlan = plan; return plan; };
  }
  if (typeof starterSketch === "function") {
    var starterSketchShaped = starterSketch;
    starterSketch = function (want) {
      shpSketchPlan = null;
      var out = starterSketchShaped.apply(this, arguments), plan = shpSketchPlan;
      try { (out || []).forEach(function (f) { shpSketchCut(f, plan, want || {}); }); } catch (e) { /* drawn as boxes */ }
      return out;
    };
  }
  function shpSketchCut(f, plan, want) {
    if (!f || !f.rooms || !f.rooms.length) { return; }
    var fp = plan && (plan.floors || []).filter(function (q) { return q && q.level === f.level; })[0], outline = null;
    var flipped = f.rooms.every(function (m) { return m.x1 <= 0.01; });
    if (fp && fp.clip && fp.clip.length >= 3) {
      outline = fp.clip.map(function (p) { return [flipped ? -p[0] : p[0], p[1]]; });
    } else if (want.type !== "tower" && SHP_FOOTS.indexOf(want.footprint) > 0) {
      var main = f.rooms.filter(function (m) { return !SHP_FOOT_KEEP[m.kind]; }), l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
      main.forEach(function (m) { l = Math.min(l, m.x0); t = Math.min(t, m.y0); r = Math.max(r, m.x1); b = Math.max(b, m.y1); });
      if (main.length && r - l >= 4 && b - t >= 4) { outline = shpFootPoly(want.footprint, l, t, r, b); }
    }
    if (!outline) { return; }
    f.rooms.forEach(function (m) {
      if (SHP_KEEP[m.kind] || SHP_FOOT_KEEP[m.kind]) { return; }
      // (in the paper's numbers, as the building is cut: shpTidy's tolerances are those)
      var K = FLOOR_PX, big = outline.map(function (p) { return [p[0] * K, p[1] * K]; });
      var cut = shpClipRect(big, m.x0 * K, m.y0 * K, m.x1 * K, m.y1 * K).map(function (p) { return [p[0] / K, p[1] / K]; });
      var A = (m.x1 - m.x0) * (m.y1 - m.y0), a = cut.length >= 3 ? shpArea(cut) : 0;
      if (a < Math.max(2.5, A * 0.08)) { m.gone = true; return; }
      if (a < A * 0.995) { m.poly = cut; }
    });
  }
  if (typeof HOUSE_ICONS === "object") {
    Object.assign(HOUSE_ICONS, {
      shp_box: '<path d="M3.5 4.5h13v11h-13z"/>',
      shp_rounded: '<path d="M7 4.5h6a3.5 3.5 0 0 1 3.5 3.5v4a3.5 3.5 0 0 1-3.5 3.5H7A3.5 3.5 0 0 1 3.5 12V8A3.5 3.5 0 0 1 7 4.5z"/>',
      shp_angled: '<path d="M6.5 4.5h7l3 3v5l-3 3h-7l-3-3v-5z"/>',
      shp_curved: '<path d="M3.5 4.5h13v6.5a4.5 4.5 0 0 1-4.5 4.5H8a4.5 4.5 0 0 1-4.5-4.5z"/>'
    });
  }
  // the rooms that stand over each other floor on floor, never cut away
  var SHP_KEEP = { stairs: 1, lift: 1, landing: 1, shaft: 1, core: 1, liftlobby: 1, riser: 1, restroom: 0 };
  // Whether two rooms (made, not yet put together: their own numbers on the floor, `local`) still
  // share a wall a door wide, each as its shape leaves it.
  function shpShared(a, b) {
    var A = a.local, B = b.local;
    if (!A || !B) { return true; }
    var P = FLOOR_PX, e = 2, lo, hi, line, across, into;
    if (Math.abs(A[3] - B[1]) < e || Math.abs(B[3] - A[1]) < e) {
      across = true; line = Math.abs(A[3] - B[1]) < e ? A[3] : A[1]; into = Math.abs(A[3] - B[1]) < e ? 1 : -1;
      lo = Math.max(A[0], B[0]); hi = Math.min(A[2], B[2]);
    } else if (Math.abs(A[2] - B[0]) < e || Math.abs(B[2] - A[0]) < e) {
      across = false; line = Math.abs(A[2] - B[0]) < e ? A[2] : A[0]; into = Math.abs(A[2] - B[0]) < e ? 1 : -1;
      lo = Math.max(A[1], B[1]); hi = Math.min(A[3], B[3]);
    } else { return true; }                  // (not side by side: a way some other way, as it was)
    if (hi - lo < 0.9 * P) { return false; }
    function holds(r, L, x, y) { return !r.shape || shpHolds(r.shape, x - (L[0] + L[2]) / 2, y - (L[1] + L[3]) / 2, 0); }
    var run = 0, best = 0;
    for (var at = lo; at <= hi; at += 4) {
      var xa = across ? at : line - into * 8, ya = across ? line - into * 8 : at;
      var xb = across ? at : line + into * 8, yb = across ? line + into * 8 : at;
      if (holds(a, A, xa, ya) && holds(b, B, xb, yb)) { run += 4; best = Math.max(best, run); } else { run = 0; }
    }
    return best >= 0.9 * P;
  }
  // The point of a shape furthest to the front (+y) straight down from its middle -- or, nothing
  // there, the frontmost of its corners.
  function shpFoot(poly) {
    var best = null;
    for (var i = 0; i < poly.length; i++) {
      var p = poly[i], q = poly[(i + 1) % poly.length];
      if ((p[0] <= 0 && q[0] >= 0) || (q[0] <= 0 && p[0] >= 0)) {
        var y = Math.abs(q[0] - p[0]) < 1e-6 ? Math.max(p[1], q[1]) : p[1] + (q[1] - p[1]) * (0 - p[0]) / (q[0] - p[0]);
        if (!best || y > best[1]) { best = [0, y]; }
      }
    }
    if (!best) { poly.forEach(function (p) { if (!best || p[1] > best[1]) { best = [p[0], p[1]]; } }); }
    return best;
  }

  // ---- what is in it, kept inside it ---------------------------------------------------------------
  // Once a building is made: anything put in a shaped room's box but outside its shape (a lamp on a
  // wall that is not there, a desk past the glass) and in no other room, taken out again.
  function shpPrune() {
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; }), shaped = rooms.filter(function (r) { return r.shape; });
    if (!shaped.length) { return 0; }
    var near = rooms.length > 40 && typeof listNear === "function" ? listNear(rooms) : null, gone = new Set();
    function inBox(r, x, y, pad) { var q = shpLocal(r, x, y); return Math.abs(q[0]) <= r.w / 2 + pad && Math.abs(q[1]) <= r.h / 2 + pad; }
    hand.nodes.forEach(function (n) {
      if (n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot" || n.kind === "i_zone" || (typeof isArea === "function" && isArea(n.kind))) { return; }
      if (n.skinDoor || BETWEEN_FLOORS[n.kind]) { return; }
      var by = near ? near.around(n.x - 2, n.y - 2, n.x + 2, n.y + 2) : rooms;
      var box = by.filter(function (r) { return r.shape && inBox(r, n.x, n.y, 14); });
      if (!box.length) { return; }
      var reach = WALK_DOORS[n.kind] || n.kind === "i_window" || ON_THE_WALL[n.kind] ? -14 : 0;
      if (by.some(function (r) { return insideArea(r, n.x, n.y, reach); })) { return; }
      gone.add(n);
    });
    if (!gone.size) { return 0; }
    hand.nodes = hand.nodes.filter(function (n) { return !gone.has(n); });
    hand.links = hand.links.filter(function (l) { var a = nodeById(l.from), b = nodeById(l.to); return a && b; });
    return gone.size;
  }
  // (2026-10-07) And what stands in a shaped room with a corner of it past the shape -- a bed put
  // against a wall as boxes are, the corner of the room rounded off under it: slid in toward the
  // middle of the room, a hand at a time, to where all of it is in and nothing else is; nowhere in
  // two metres, taken out.  (Not what is in a wall or on one: those go with their wall.)
  function shpSettle() {
    var P = FLOOR_PX, rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    var shaped = rooms.filter(function (r) { return r.shape && !((r.turn || 0) % 360); });
    if (!shaped.length) { return 0; }
    var near = rooms.length > 40 && typeof listNear === "function" ? listNear(rooms) : null, moved = 0, gone = new Set();
    var pieces = hand.nodes.filter(function (n) {
      return n.kind !== "i_room" && n.kind !== "i_floor" && n.kind !== "i_lot" && n.kind !== "i_zone" && !(typeof isArea === "function" && isArea(n.kind)) &&
             !n.skinDoor && !BETWEEN_FLOORS[n.kind] && !WALK_DOORS[n.kind] && n.kind !== "i_window" && !SNAP_IN_WALL[n.kind] && !ON_THE_WALL[n.kind];
    });
    var byRoom = new Map();
    pieces.forEach(function (n) {
      var by = (near ? near.around(n.x - 2, n.y - 2, n.x + 2, n.y + 2) : rooms).filter(function (r) { return insideArea(r, n.x, n.y); })
        .sort(function (p, q) { return p.w * p.h - q.w * q.h; })[0];
      if (!by) { return; }
      if (!byRoom.has(by)) { byRoom.set(by, []); }
      byRoom.get(by).push(n);
    });
    function corners(n, x, y) {
      var t = turned(n), hw = t.w / 2, hh = t.h / 2;
      return [[x - hw, y - hh], [x + hw, y - hh], [x + hw, y + hh], [x - hw, y + hh]];
    }
    shaped.forEach(function (r) {
      var mine = byRoom.get(r) || [];
      if (!mine.length) { return; }
      var cx = 0, cy = 0;
      r.shape.forEach(function (q) { cx += q[0] / r.shape.length; cy += q[1] / r.shape.length; });
      cx += r.x; cy += r.y;
      mine.forEach(function (n) {
        var fits = function (x, y) { return corners(n, x, y).every(function (q) { return insideArea(r, q[0], q[1], -3); }); };
        if (fits(n.x, n.y)) { return; }
        var dx = cx - n.x, dy = cy - n.y, d = Math.hypot(dx, dy) || 1;
        for (var k = 1; k <= 20; k++) {
          var x = n.x + dx / d * k * 0.1 * P, y = n.y + dy / d * k * 0.1 * P;
          if (!fits(x, y)) { continue; }
          var spot = { x: x, y: y, w: n.w, h: n.h, turn: n.turn || 0 };
          if (mine.some(function (o) { return o !== n && !gone.has(o) && boxesTouch(spot, o, 1); })) { continue; }
          n.x = Math.round(x); n.y = Math.round(y); moved++;
          return;
        }
        gone.add(n);
      });
    });
    if (gone.size) {
      hand.nodes = hand.nodes.filter(function (n) { return !gone.has(n); });
      hand.links = hand.links.filter(function (l) { var a = nodeById(l.from), b = nodeById(l.to); return a && b; });
    }
    return moved + gone.size;
  }
  // (last of all of Start building's steps -- after every part has put in what it puts in)
  if (typeof starterSteps === "function") {
    var starterStepsShaped = starterSteps;
    starterSteps = function (want) {
      var inner = starterStepsShaped.apply(this, arguments);
      return (function* () {
        var out = yield* inner;
        try { shpPrune(); shpSettle(); } catch (e) { if (window.console && console.warn) { console.warn("shaped:", e && e.message); } }
        return out;
      })();
    };
  }
