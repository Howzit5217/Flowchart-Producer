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
      var pts = [p, q, [q[0] + nx * T, q[1] + ny * T], [p[0] + nx * T, p[1] + ny * T]].map(function (r) { return v3Local(n, r[0], r[1]); });
      v3Prism(faces, pts, 0, tall, how);
    });
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
    if (!plan || !plan.floors || !plan.floors.some(function (fp) { return fp && fp.clip; })) { return; }
    var X = ctx.X, P = FLOOR_PX, gone = new Set(), byId = {};
    made.forEach(function (r) { byId[r.id] = r; });
    floors.forEach(function (f, i) {
      var fp = plan.floors[i];
      if (!fp || !fp.clip || fp.clip.length < 3) { return; }
      var poly = fp.clip.map(function (p) { return [ctx.flip ? -X(p[0]) : X(p[0]), X(p[1])]; });
      f.clipPx = poly;
      f.nodes.forEach(function (r) {
        if (r.kind !== "i_room" || !r.local) { return; }
        var L = r.local, A = (L[2] - L[0]) * (L[3] - L[1]);
        if (fp.skin) { r.skin = true; }
        // (the stairs, the lifts and the rest of the core stand over each other floor on floor: as they are)
        if (SHP_KEEP[r.starter]) { return; }
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
  // (last of all of Start building's steps -- after every part has put in what it puts in)
  if (typeof starterSteps === "function") {
    var starterStepsShaped = starterSteps;
    starterSteps = function (want) {
      var inner = starterStepsShaped.apply(this, arguments);
      return (function* () {
        var out = yield* inner;
        try { shpPrune(); } catch (e) { if (window.console && console.warn) { console.warn("shaped:", e && e.message); } }
        return out;
      })();
    };
  }
