// ---------------------------------------------------------------------------
//  40-collide.js -- what you bump into, walking round in 3D, by the shape
//  it is drawn in: a round table round, a sofa turned on the slant along
//  its slant, the far side of an L sectional free to stand in, a doorway
//  as wide as its frame leaves it, the car by its body; and a wall met at
//  a slant slid along, not stopped dead at
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-11-12: "3D collision uses squares or rectangles instead
  // of the real shapes ... rooms properly walkable with the character")
  //
  // Walking had been kept off the plan's squares (walkPlan, 38-walk.js:
  // twenty centimetres a square, every piece the whole box it stands in)
  // and off the box round each model (38-models.js's unseen "ghost" sides).
  // Now, while walking, it is kept off what the picture is made of:
  //  - a wall, a door's frame and leaf, a box: their upright faces, each a
  //    line on the floor between the heights it stands from and to;
  //  - a model (the furniture, a car, a gate): its outline, at the height a
  //    body is -- from over a step up to the top of the head -- found from
  //    its own triangles laid on a fine grid (3 cm) and traced round, so a
  //    table's top is in the way and the space between its legs is not, a
  //    shelf over head height is not, the inside of an L is free;
  //  - a sloped face (an attic's ceiling, a stair's underside): the part of
  //    it as low as the body, worked out at the body's own height there;
  //  - and where the body's height is not the floor's (up a flight, on the
  //    land), each model's outline found again at that height.
  // All of it filed in a grid of metre squares a storey high, so a step
  // asks only what is near.  Doors, gates and what stands open are found
  // again whenever they move; the rest only when the picture changes.
  var HB_R = 10;                         // px from your middle that nothing comes nearer than (20 cm)
  var HB_LO = 0.22 * FLOOR_PX, HB_HI = 1.85 * FLOOR_PX;   // the body, over its feet: above a low step, to the top of the head
  var HB_CELL = FLOOR_PX, HB_SLAB = 2.5 * FLOOR_PX;       // the grid: a metre square, a storey-ish high
  var HB_RES = 1.5;                      // px: the squares an outline is found on (3 cm)
  var HB_MOST = 200;                     // squares across an outline at most (a long bench: coarser squares)
  var HB_BUDGET = 4;                     // ms a picture spends finding outlines not found yet
  var HB_PASS = { i_rug: 1, i_lot: 1, i_floor: 1, i_zone: 1, i_bathmat: 1, i_driveway: 1, i_path: 1, i_deck: 1,
                  // (flat on a wall -- an outlet by a door's frame, a picture, a switch: the wall is what is met, not
                  // them; one by a doorway had made it a body too narrow, 2026-11-12)
                  i_outlet: 1, i_lightswitch: 1, i_thermostat: 1, i_garagebtn: 1, i_breaker: 1, i_picture: 1, i_mirror: 1,
                  i_wallclock: 1, i_whiteboard: 1, i_dartboard: 1, i_walltv: 1, i_proscreen: 1, i_hooks: 1, i_towelrail: 1,
                  i_porchlight: 1, i_floodlight: 1 };
  var HB_MOVES = { i_gate: 1 };          // besides the doors: what swings, and is found again as it does
  var HB = { live: false, at: 0, hi: HB_HI, statKey: null, S: null, D: null, owners: [], pend: [], stamp: 1, kept: new Map(), keptN: 0,
             pid: typeof WeakMap === "function" ? new WeakMap() : null, pids: 0, now: null, took: 0, made: 0, lastMs: 0 };

  function hbLive() {
    return !!(HB.live && typeof V3 !== "undefined" && V3 && V3.mode === "walk" && V3.me && HB.S);
  }

  // ---- the grid ------------------------------------------------------------------------------------------
  // Each square a list of codes: index * 4 + what it is (0 a line, 1 a model, 2 a sloped face).
  function hbGrid() { return { cells: new Map(), seg: [], segN: 0, own: [], slope: [] }; }
  function hbKey(cx, cy, cz) { return ((cz + 64) * 8192 + (cy + 4096)) * 8192 + (cx + 4096); }
  function hbFile(G, code, x0, y0, x1, y1, z0, z1) {
    var c0 = Math.floor(x0 / HB_CELL), c1 = Math.floor(x1 / HB_CELL), r0 = Math.floor(y0 / HB_CELL), r1 = Math.floor(y1 / HB_CELL);
    var s0 = Math.floor(z0 / HB_SLAB), s1 = Math.floor(z1 / HB_SLAB);
    if (!isFinite(c0 + c1 + r0 + r1 + s0 + s1)) { return; }
    if ((c1 - c0 + 1) * (r1 - r0 + 1) * (s1 - s0 + 1) > 20000) { return; }   // (something absurdly big: not walked into)
    for (var s = s0; s <= s1; s++) {
      for (var r = r0; r <= r1; r++) {
        for (var c = c0; c <= c1; c++) {
          var k = hbKey(c, r, s), L = G.cells.get(k);
          if (!L) { L = []; G.cells.set(k, L); }
          L.push(code);
        }
      }
    }
  }
  function hbAddSeg(G, ax, ay, bx, by, z0, z1, id) {
    var i = G.segN++, S = G.seg;
    S.push(ax, ay, bx, by, z0, z1, id);
    hbFile(G, i * 4, Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by), z0, z1);
  }

  // ---- what is solid ---------------------------------------------------------------------------------------
  function hbSolidFace(f) {
    if (!f || !f.pts || f.pts.length < 2 || f.me || f.moves || f.floor || f.ground || f.ceiling || f.found) { return false; }
    var n = f.node, how = f.how || {};
    if (!n || how.decal || how.floor || how.ceiling) { return false; }
    var k = n.kind;
    if (BETWEEN_FLOORS[k] || FROM_CEILING[k] || LIES_FLAT[k] || HB_PASS[k] || k === "i_escalator") { return false; }
    if (typeof isPerson === "function" && isPerson(n)) { return false; }
    return true;
  }
  // What moves while you walk: doors, gates, what stands open (40-open3d.js) -- found again each time.
  function hbMoving() {
    var out = {}, U = V3 && V3.use;
    if (U && U.fr) { Object.keys(U.fr).forEach(function (id) { out[id] = 1; }); }
    if (U && U.anim) { Object.keys(U.anim).forEach(function (id) { if (Object.keys(U.anim[id] || {}).length) { out[id] = 1; } }); }
    return out;
  }
  function hbIsMoving(n, open) { return !!(n && (WALK_DOORS[n.kind] || HB_MOVES[n.kind] || open[n.id])); }

  // The ground a face or a model stands on: the floor under it (the storeys' heights).
  function hbGroundOf(zs, z) {
    var g = zs.length ? zs[0] : 0;
    for (var i = 0; i < zs.length; i++) { if (zs[i] <= z + 2) { g = zs[i]; } }
    return g;
  }

  // ---- taking the picture in ---------------------------------------------------------------------------------
  // Called with every model the walls are taken from (v3Solids, 38-view3d.js): what stays put filed once
  // while it is the same, what moves filed again.
  function hbTake(model) {
    if (typeof V3 === "undefined" || !V3 || V3.mode !== "walk" || !model || !model.faces) { HB.live = false; return; }
    var t0 = performance.now();
    // (while it goes up, 40-build.js, the picture is new each time: taken in four times a second, not sixty)
    if (HB.S && HB.live && typeof bpSite !== "undefined" && bpSite && t0 - HB.at < 250) { return; }
    var plan = v3Ground(), floors = plan.floors || [], zs = [];
    floors.forEach(function (f) { if (zs.indexOf(f.z) < 0) { zs.push(f.z); } });
    zs.sort(function (a, b) { return a - b; });
    var open = hbMoving(), faces = model.faces, still = [], moving = [], h = 0, meshed = {};
    for (var i = 0; i < faces.length; i++) {
      var f = faces[i];
      if (!hbSolidFace(f)) { continue; }
      if (f.mesh) { meshed[f.node.id] = 1; }
      if (hbIsMoving(f.node, open)) { moving.push(f); continue; }
      still.push(f);
      var p = f.pts[0];
      h = (h * 31 + Math.round(p[0] * 4) * 7 + Math.round(p[1] * 4) * 13 + Math.round(p[2] * 4) * 17 + f.pts.length) | 0;
    }
    var key = still.length + "|" + h + "|" + zs.join(",");
    if (key !== HB.statKey || !HB.S) {
      HB.pend = [];
      HB.S = hbFill(still, zs, meshed);
      HB.statKey = key;
      HB.made++;
    }
    HB.D = hbFill(moving, zs, meshed, true);
    HB.live = true;
    HB.at = performance.now();
    HB.now = null;
    HB.lastMs = HB.at - t0;
    HB.took += HB.lastMs;
  }
  // Faces into a grid: upright ones as lines, sloped ones kept whole, a model's meshes gathered as one piece.
  function hbFill(list, zs, meshed, now) {
    var G = hbGrid(), byId = new Map();
    list.forEach(function (f) {
      var n = f.node;
      if (f.mesh) {
        var o = byId.get(n.id);
        if (!o) { o = { id: n.id, node: n, meshes: [], ghosts: [] }; byId.set(n.id, o); }
        o.meshes.push(f);
        return;
      }
      // (the unseen box round a model: its own outline is used instead -- kept to stand in till that is found)
      if (f.how && f.how.ghost && meshed[n.id]) {
        var g = byId.get(n.id);
        if (!g) { g = { id: n.id, node: n, meshes: [], ghosts: [] }; byId.set(n.id, g); }
        g.ghosts.push(f);
        return;
      }
      hbFace(G, f, zs, n.id);
    });
    byId.forEach(function (o) {
      if (!o.meshes.length) { o.ghosts.forEach(function (f) { hbFace(G, f, zs, o.id); }); return; }
      if (hbOwner(o, zs)) {
        var at = G.own.length;
        G.own.push(o);
        hbFile(G, at * 4 + 1, o.X0, o.Y0, o.X1, o.Y1, o.Z0, o.Z1);
        if (now) { hbFootNow(o); } else if (!o.base) { HB.pend.push(o); }
      }
    });
    G.seg = Float64Array.from(G.seg);
    G.marks = { seg: new Uint32Array(G.segN), own: new Uint32Array(G.own.length), slope: new Uint32Array(G.slope.length) };
    return G;
  }
  // One face: upright, a line; lying flat, nothing (what stands under it is in the way, its sides are);
  // sloped, kept to be cut at the body's height when it is asked about.
  function hbFace(G, f, zs, id) {
    var P = f.pts, nz = 0;
    if (f.side) { nz = 0; }
    else {
      var nx = 0, ny = 0;
      for (var i = 0; i < P.length; i++) {
        var a = P[i], b = P[(i + 1) % P.length];
        nx += (a[1] - b[1]) * ((a[2] || 0) + (b[2] || 0)); ny += ((a[2] || 0) - (b[2] || 0)) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
      }
      var len = Math.hypot(nx, ny, nz);
      if (!len) {
        if (P.length !== 2) { return; }
        nz = 0;
      } else { nz = nz / len; }
    }
    var z0 = Infinity, z1 = -Infinity;
    for (var j = 0; j < P.length; j++) { z0 = Math.min(z0, P[j][2] || 0); z1 = Math.max(z1, P[j][2] || 0); }
    if (z1 - z0 < 0.5 && Math.abs(nz) > 0.5) { return; }          // flat
    if (Math.abs(nz) < 0.12) {
      // upright: the line it stands on, end to end
      var ax = P[0][0], ay = P[0][1], dx = 0, dy = 0;
      for (var k = 1; k < P.length && !(dx || dy); k++) {
        var ex = P[k][0] - ax, ey = P[k][1] - ay, el2 = Math.hypot(ex, ey);
        if (el2 > 0.05) { dx = ex / el2; dy = ey / el2; }
      }
      if (!dx && !dy) { return; }
      var lo = Infinity, hi = -Infinity;
      for (var q = 0; q < P.length; q++) { var t = (P[q][0] - ax) * dx + (P[q][1] - ay) * dy; lo = Math.min(lo, t); hi = Math.max(hi, t); }
      if (hi - lo < 0.05) { return; }
      hbAddSeg(G, ax + dx * lo, ay + dy * lo, ax + dx * hi, ay + dy * hi, z0, z1, id);
      return;
    }
    if (Math.abs(nz) > 0.985) { return; }
    // sloped: kept whole
    var flat = [], x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    P.forEach(function (p) { flat.push(p[0], p[1], p[2] || 0); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    var si = G.slope.length;
    G.slope.push({ p: flat, id: id, x0: x0, y0: y0, x1: x1, y1: y1, z0: z0, z1: z1 });
    hbFile(G, si * 4 + 2, x0, y0, x1, y1, z0, z1);
  }

  // ---- a model's outline ------------------------------------------------------------------------------------------
  // Its meshes put in one frame (the first mesh's: turned by its cos and sin about where it stands), the
  // ground it stands on, its box; and a name for its shape, the same for every piece made the same
  // (the same meshes, the same way round each other), so the outline of one chair is every chair's.
  function hbPidOf(p) {
    if (!HB.pid) { return 0; }
    var id = HB.pid.get(p);
    if (!id) { id = ++HB.pids; HB.pid.set(p, id); }
    return id;
  }
  var hbBoxKept = typeof WeakMap === "function" ? new WeakMap() : null;
  function hbMeshBox(p) {
    var b = hbBoxKept ? hbBoxKept.get(p) : null;
    if (b) { return b; }
    b = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
    for (var j = 0; j + 2 < p.length; j += 3) {
      if (p[j] < b[0]) { b[0] = p[j]; } if (p[j] > b[1]) { b[1] = p[j]; }
      if (p[j + 1] < b[2]) { b[2] = p[j + 1]; } if (p[j + 1] > b[3]) { b[3] = p[j + 1]; }
      if (p[j + 2] < b[4]) { b[4] = p[j + 2]; } if (p[j + 2] > b[5]) { b[5] = p[j + 2]; }
    }
    if (hbBoxKept) { hbBoxKept.set(p, b); }
    return b;
  }
  function hbFrameOf(f) {
    var m = f.mesh, xf = m.xf || [0, 0, 1, 0, 0], base = m.base || [0, 0, 0], P0 = f.pts[0];
    return { p: m.p, c: xf[2], s: xf[3], ox: xf[0] + P0[0] - base[0], oy: xf[1] + P0[1] - base[1], oz: xf[4] + (P0[2] || 0) - (base[2] || 0) };
  }
  function hbOwner(o, zs) {
    var F0 = null, parts = [], sig = [];
    o.meshes.forEach(function (f) {
      if (!f.mesh.p || f.mesh.p.length < 9) { return; }
      var F = hbFrameOf(f);
      if (!F0) { F0 = F; }
      // into the first one's frame
      var ddx = F.ox - F0.ox, ddy = F.oy - F0.oy;
      var rx = F0.c * ddx + F0.s * ddy, ry = -F0.s * ddx + F0.c * ddy, rz = F.oz - F0.oz;
      var c = F.c * F0.c + F.s * F0.s, s = F.s * F0.c - F.c * F0.s;   // its turn, against the first's
      parts.push({ p: F.p, dx: rx, dy: ry, dz: rz, c: c, s: s });
      sig.push(hbPidOf(F.p), Math.round(rx * 2), Math.round(ry * 2), Math.round(rz * 2), Math.round(Math.atan2(s, c) * 50));
    });
    if (!F0) { return false; }
    o.F = F0; o.parts = parts; o.sig = sig.join(",");
    // its box, in the picture's numbers
    var lx0 = Infinity, lx1 = -Infinity, ly0 = Infinity, ly1 = -Infinity, lz0 = Infinity, lz1 = -Infinity;
    parts.forEach(function (q) {
      var b = hbMeshBox(q.p);
      [[b[0], b[2]], [b[1], b[2]], [b[1], b[3]], [b[0], b[3]]].forEach(function (pt) {
        var x = q.c * pt[0] - q.s * pt[1] + q.dx, y = q.s * pt[0] + q.c * pt[1] + q.dy;
        lx0 = Math.min(lx0, x); lx1 = Math.max(lx1, x); ly0 = Math.min(ly0, y); ly1 = Math.max(ly1, y);
      });
      lz0 = Math.min(lz0, b[4] + q.dz); lz1 = Math.max(lz1, b[5] + q.dz);
    });
    o.lb = [lx0, lx1, ly0, ly1];
    var X0 = Infinity, X1 = -Infinity, Y0 = Infinity, Y1 = -Infinity;
    [[lx0, ly0], [lx1, ly0], [lx1, ly1], [lx0, ly1]].forEach(function (pt) {
      var x = F0.c * pt[0] - F0.s * pt[1] + F0.ox, y = F0.s * pt[0] + F0.c * pt[1] + F0.oy;
      X0 = Math.min(X0, x); X1 = Math.max(X1, x); Y0 = Math.min(Y0, y); Y1 = Math.max(Y1, y);
    });
    o.X0 = X0; o.X1 = X1; o.Y0 = Y0; o.Y1 = Y1;
    o.Z0 = lz0 + F0.oz; o.Z1 = lz1 + F0.oz;
    // what it stands on: the floor under it -- or, out on the land, its own foot; what hangs on a wall
    // or stands on a table, the floor under that
    var k = o.node.kind, onSome = ON_THE_WALL[k] || ON_TOP[k] || (typeof SNAP_IN_WALL === "object" && SNAP_IN_WALL[k]);
    var floorZ = hbGroundOf(zs, o.Z0);
    o.ground = onSome || o.Z0 - floorZ < 1.5 ? floorZ : o.Z0;
    if (!onSome && Math.abs(o.Z0 - floorZ) > 1.5 && o.Z0 - floorZ < 0.15 * FLOOR_PX) { o.ground = o.Z0; }   // (on the land, a little up)
    if (o.Z1 < o.ground + HB_LO || o.Z0 > o.ground + HB_HI + 2 * FLOOR_PX) { return false; }   // flat on the floor, or far over head
    o.feet = {};
    return true;
  }
  // Its outline at a height: for its own floor's (off 0), kept as `base`; at any other (up a flight, on
  // the land) found again, by the five centimetres.  Kept by shape, so every piece made alike shares it.
  function hbFootNow(o) {
    if (!o.base) { o.base = hbFootAt(o, 0); }
    return o.base;
  }
  function hbFootAt(o, off, top) {
    top = top || HB_HI;
    var q = Math.round(off / 2.5), k = o.sig + "@" + Math.round((o.F.oz - o.ground) * 2) + "@" + q + (top !== HB_HI ? "^" + Math.round(top) : "");
    var got = HB.kept.get(k);
    if (got) { return got; }
    var t0 = performance.now();
    got = hbTrace(o, o.ground + q * 2.5 + HB_LO - o.F.oz, o.ground + q * 2.5 + top - o.F.oz);
    HB.lastFoot = performance.now() - t0;
    if (HB.keptN > 6000) { HB.kept.clear(); HB.keptN = 0; }
    HB.kept.set(k, got); HB.keptN++;
    return got;
  }
  // The triangles between two heights (in the model's own numbers), each cut to them and laid flat on
  // a grid of squares -- every square it touches -- and the edge round the squares taken, its loops
  // straightened: lines in the model's frame.
  function hbTrace(o, zl, zh) {
    var polys = [], bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity, buf = [];
    o.parts.forEach(function (q) {
      var p = q.p, lo = zl - q.dz, hi = zh - q.dz, c = q.c, s = q.s, dx = q.dx, dy = q.dy;
      for (var i = 0; i + 8 < p.length; i += 9) {
        var za = p[i + 2], zb = p[i + 5], zc = p[i + 8];
        var mn = za < zb ? (za < zc ? za : zc) : (zb < zc ? zb : zc), mx = za > zb ? (za > zc ? za : zc) : (zb > zc ? zb : zc);
        if (mx < lo || mn > hi) { continue; }
        buf.length = 0;
        if (mn >= lo && mx <= hi) { buf.push(p[i], p[i + 1], p[i + 3], p[i + 4], p[i + 6], p[i + 7]); }
        else { hbCutZ(p, i, lo, hi, buf); }
        if (buf.length < 4) { continue; }
        var out = new Float64Array(buf.length);
        for (var j = 0; j < buf.length; j += 2) {
          var x = c * buf[j] - s * buf[j + 1] + dx, y = s * buf[j] + c * buf[j + 1] + dy;
          out[j] = x; out[j + 1] = y;
          if (x < bx0) { bx0 = x; } if (x > bx1) { bx1 = x; } if (y < by0) { by0 = y; } if (y > by1) { by1 = y; }
        }
        polys.push(out);
      }
    });
    if (!polys.length) { return { loops: [], x0: 0, x1: 0, y0: 0, y1: 0, none: true }; }
    var res = Math.max(HB_RES, (bx1 - bx0) / HB_MOST, (by1 - by0) / HB_MOST);
    var X0 = bx0 - res, Y0 = by0 - res, nx = Math.ceil((bx1 - X0) / res) + 2, ny = Math.ceil((by1 - Y0) / res) + 2;
    var occ = new Uint8Array(nx * ny);
    polys.forEach(function (P) { hbFillPoly(P, occ, nx, ny, X0, Y0, res); });
    hbSaddles(occ, nx, ny);
    var loops = hbLoops(occ, nx, ny, X0, Y0, res);
    return { loops: loops, x0: bx0 - res, x1: bx1 + res, y0: by0 - res, y1: by1 + res, res: res };
  }
  // A triangle (p from i) cut to lo <= z <= hi: its corners laid flat, into out (x, y, x, y ...).
  function hbCutZ(p, i, lo, hi, out) {
    var A = [[p[i], p[i + 1], p[i + 2]], [p[i + 3], p[i + 4], p[i + 5]], [p[i + 6], p[i + 7], p[i + 8]]];
    function cut(P, z, keepAbove) {
      var R = [];
      for (var k = 0; k < P.length; k++) {
        var a = P[k], b = P[(k + 1) % P.length], ina = keepAbove ? a[2] >= z : a[2] <= z, inb = keepAbove ? b[2] >= z : b[2] <= z;
        if (ina) { R.push(a); }
        if (ina !== inb) { var t = (z - a[2]) / (b[2] - a[2]); R.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, z]); }
      }
      return R;
    }
    var P = cut(cut(A, lo, true), hi, false);
    for (var k = 0; k < P.length; k++) { out.push(P[k][0], P[k][1]); }
  }
  // Every square a flat convex shape (or a line) touches: row by row, from its least x to its most
  // within the row -- its corners there and where its edges cross the row's top and bottom.
  function hbFillPoly(P, occ, nx, ny, X0, Y0, res) {
    var n = P.length / 2, ymin = Infinity, ymax = -Infinity;
    for (var i = 0; i < n; i++) { var y = P[i * 2 + 1]; if (y < ymin) { ymin = y; } if (y > ymax) { ymax = y; } }
    var r0 = Math.max(0, Math.floor((ymin - Y0) / res)), r1 = Math.min(ny - 1, Math.floor((ymax - Y0) / res));
    for (var r = r0; r <= r1; r++) {
      var ya = Y0 + r * res, yb = ya + res, xa = Infinity, xb = -Infinity;
      for (var k = 0; k < n; k++) {
        var ax = P[k * 2], ay = P[k * 2 + 1], j = (k + 1) % n, bx = P[j * 2], by = P[j * 2 + 1];
        if (ay >= ya && ay <= yb) { if (ax < xa) { xa = ax; } if (ax > xb) { xb = ax; } }
        if ((ay < ya) !== (by < ya) && ay !== by) { var tx = ax + (bx - ax) * (ya - ay) / (by - ay); if (tx < xa) { xa = tx; } if (tx > xb) { xb = tx; } }
        if ((ay < yb) !== (by < yb) && ay !== by) { var ux = ax + (bx - ax) * (yb - ay) / (by - ay); if (ux < xa) { xa = ux; } if (ux > xb) { xb = ux; } }
      }
      if (xa > xb) { continue; }
      var c0 = Math.max(0, Math.floor((xa - X0) / res)), c1 = Math.min(nx - 1, Math.floor((xb - X0) / res));
      for (var c = c0; c <= c1; c++) { occ[r * nx + c] = 1; }
    }
  }
  // Two squares meeting only at a corner: the corner filled, so the edge round them is one way round.
  function hbSaddles(occ, nx, ny) {
    for (var pass = 0; pass < 3; pass++) {
      var any = false;
      for (var r = 0; r + 1 < ny; r++) {
        for (var c = 0; c + 1 < nx; c++) {
          var a = occ[r * nx + c], b = occ[r * nx + c + 1], d = occ[(r + 1) * nx + c], e = occ[(r + 1) * nx + c + 1];
          if (a && e && !b && !d) { occ[r * nx + c + 1] = 1; any = true; }
          else if (b && d && !a && !e) { occ[r * nx + c] = 1; any = true; }
        }
      }
      if (!any) { return; }
    }
  }
  // The edges between squares taken and squares free, joined end to end into loops (the taken side
  // on the left), each straightened (Douglas-Peucker, within most of a square).
  function hbLoops(occ, nx, ny, X0, Y0, res) {
    var W = nx + 1, next = new Map(), at = function (c, r) { return r * W + c; };
    function on(c, r) { return c >= 0 && r >= 0 && c < nx && r < ny && occ[r * nx + c] === 1; }
    for (var r = 0; r < ny; r++) {
      for (var c = 0; c < nx; c++) {
        if (!on(c, r)) { continue; }
        if (!on(c, r - 1)) { next.set(at(c, r), at(c + 1, r)); }            // top edge, going +x
        if (!on(c + 1, r)) { next.set(at(c + 1, r), at(c + 1, r + 1)); }    // right edge, going +y
        if (!on(c, r + 1)) { next.set(at(c + 1, r + 1), at(c, r + 1)); }    // bottom edge, going -x
        if (!on(c - 1, r)) { next.set(at(c, r + 1), at(c, r)); }            // left edge, going -y
      }
    }
    var loops = [], seen = new Set();
    next.forEach(function (to, from) {
      if (seen.has(from)) { return; }
      var pts = [], v = from, guard = 0;
      while (!seen.has(v) && guard++ < 200000) {
        seen.add(v);
        pts.push(v);
        v = next.get(v);
        if (v === undefined) { break; }
      }
      if (pts.length < 3) { return; }
      var xy = [];
      pts.forEach(function (id) { xy.push(X0 + (id % W) * res, Y0 + Math.floor(id / W) * res); });
      var cut = hbSimplify(xy, res * 0.8);
      if (cut.length >= 6) { loops.push(Float64Array.from(cut)); }
    });
    return loops;
  }
  function hbSimplify(xy, eps) {
    var n = xy.length / 2;
    if (n <= 4) { return xy; }
    // closed: split at the point furthest from the first, simplify the two halves
    var far = 0, fd = -1;
    for (var i = 1; i < n; i++) { var d = Math.hypot(xy[i * 2] - xy[0], xy[i * 2 + 1] - xy[1]); if (d > fd) { fd = d; far = i; } }
    var keep = new Uint8Array(n);
    keep[0] = keep[far] = 1;
    function dp(a, b) {        // a..b (indices, b may wrap past n)
      var stack = [[a, b]];
      while (stack.length) {
        var s = stack.pop(), i0 = s[0], i1 = s[1];
        if (i1 - i0 < 2) { continue; }
        var ax = xy[(i0 % n) * 2], ay = xy[(i0 % n) * 2 + 1], bx = xy[(i1 % n) * 2], by = xy[(i1 % n) * 2 + 1];
        var dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, best = -1, bi = -1;
        for (var k = i0 + 1; k < i1; k++) {
          var px = xy[(k % n) * 2], py = xy[(k % n) * 2 + 1], e = Math.abs((px - ax) * dy - (py - ay) * dx) / L;
          if (e > best) { best = e; bi = k; }
        }
        if (best > eps) { keep[bi % n] = 1; stack.push([i0, bi], [bi, i1]); }
      }
    }
    dp(0, far); dp(far, n);
    var out = [];
    for (var j = 0; j < n; j++) { if (keep[j]) { out.push(xy[j * 2], xy[j * 2 + 1]); } }
    return out;
  }

  // ---- how near, at a spot ---------------------------------------------------------------------------------------
  // The nearest any of it comes to (X, Y) in the picture's numbers, for a body whose feet are at z:
  // { d, x, y } -- d 0 inside a model's outline.
  function hbNear(X, Y, z, R, best) {
    best = best || { d: Infinity, x: X, y: Y, id: null };
    if (HB.S) { hbNearIn(HB.S, X, Y, z, R, best); }
    if (HB.D) { hbNearIn(HB.D, X, Y, z, R, best); }
    return best;
  }
  function hbNearIn(G, X, Y, z, R, best) {
    var lo = z + HB_LO, hi = z + HB.hi, stamp = ++HB.stamp, M = G.marks, S = G.seg;
    var c0 = Math.floor((X - R) / HB_CELL), c1 = Math.floor((X + R) / HB_CELL), r0 = Math.floor((Y - R) / HB_CELL), r1 = Math.floor((Y + R) / HB_CELL);
    var s0 = Math.floor(lo / HB_SLAB), s1 = Math.floor(hi / HB_SLAB);
    for (var sl = s0; sl <= s1; sl++) {
      for (var r = r0; r <= r1; r++) {
        for (var c = c0; c <= c1; c++) {
          var L = G.cells.get(hbKey(c, r, sl));
          if (!L) { continue; }
          for (var i = 0; i < L.length; i++) {
            var code = L[i], kind = code & 3, at = code >> 2;
            if (kind === 0) {
              if (M.seg[at] === stamp) { continue; }
              M.seg[at] = stamp;
              var b = at * 7;
              if (S[b + 5] < lo || S[b + 4] > hi) { continue; }
              hbSegNear(S[b], S[b + 1], S[b + 2], S[b + 3], X, Y, best, S[b + 6]);
            } else if (kind === 1) {
              if (M.own[at] === stamp) { continue; }
              M.own[at] = stamp;
              hbOwnNear(G.own[at], X, Y, z, R, best);
            } else {
              if (M.slope[at] === stamp) { continue; }
              M.slope[at] = stamp;
              var sp = G.slope[at];
              if (sp.z1 < lo || sp.z0 > hi) { continue; }
              hbSlopeNear(sp, X, Y, lo, hi, best);
            }
          }
        }
      }
    }
    return best;
  }
  function hbSegNear(ax, ay, bx, by, X, Y, best, id) {
    var dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    var t = L2 > 0 ? ((X - ax) * dx + (Y - ay) * dy) / L2 : 0;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    var px = ax + dx * t, py = ay + dy * t, d = Math.hypot(X - px, Y - py);
    if (d < best.d) { best.d = d; best.x = px; best.y = py; best.id = id; }
  }
  // A model: the spot taken into its own frame, its outline at the body's height there.
  function hbOwnNear(o, X, Y, z, R, best) {
    if (X < o.X0 - R || X > o.X1 + R || Y < o.Y0 - R || Y > o.Y1 + R) { return; }
    if (o.Z1 < z + HB_LO || o.Z0 > z + HB.hi) { return; }
    var F = o.F, ddx = X - F.ox, ddy = Y - F.oy, lx = F.c * ddx + F.s * ddy, ly = -F.s * ddx + F.c * ddy;
    // (at its own floor's height, standing: its outline as found; up a flight, on the land, or crouched
    // (40-walkmore.js, the body shorter): found again at that height, kept by the five centimetres)
    var off = z - o.ground, foot, tall = HB.hi === HB_HI;
    if (Math.abs(off) < 2 && tall) { foot = o.base; }
    else {
      var fk = Math.round(off / 2.5) + (tall ? "" : "^" + Math.round(HB.hi));
      foot = o.feet[fk] || (o.feet[fk] = hbFootAt(o, off, HB.hi));
    }
    if (!foot) {
      // (not found yet: near enough to matter, found now; else its box stands in, as before)
      if (Math.hypot(X - (o.X0 + o.X1) / 2, Y - (o.Y0 + o.Y1) / 2) < Math.max(o.X1 - o.X0, o.Y1 - o.Y0) / 2 + 2 * FLOOR_PX) { foot = hbFootNow(o); }
      else { o.ghosts.forEach(function (f) { if (f.pts.length >= 2) { hbSegNear(f.pts[0][0], f.pts[0][1], f.pts[1][0], f.pts[1][1], X, Y, best, o.id); } }); return; }
    }
    if (foot.none || lx < foot.x0 - R || lx > foot.x1 + R || ly < foot.y0 - R || ly > foot.y1 + R) { return; }
    var inside = false, bd = Infinity, bx = 0, by = 0;
    for (var k = 0; k < foot.loops.length; k++) {
      var P = foot.loops[k], n = P.length / 2;
      for (var i = 0, j = n - 1; i < n; j = i++) {
        var ax = P[j * 2], ay = P[j * 2 + 1], cx = P[i * 2], cy = P[i * 2 + 1];
        if ((ay > ly) !== (cy > ly) && lx < ax + (cx - ax) * (ly - ay) / (cy - ay)) { inside = !inside; }
        var ex = cx - ax, ey = cy - ay, L2 = ex * ex + ey * ey, t = L2 > 0 ? ((lx - ax) * ex + (ly - ay) * ey) / L2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        var px = ax + ex * t, py = ay + ey * t, d = Math.hypot(lx - px, ly - py);
        if (d < bd) { bd = d; bx = px; by = py; }
      }
    }
    if (inside) { bd = 0; }
    if (bd < best.d) {
      best.d = bd;
      best.x = F.c * bx - F.s * by + F.ox; best.y = F.s * bx + F.c * by + F.oy;
      best.id = o.id;
    }
  }
  // A sloped face: cut to the body's height, laid flat.
  function hbSlopeNear(sp, X, Y, lo, hi, best) {
    var P = sp.p, A = [];
    for (var i = 0; i < P.length; i += 3) { A.push([P[i], P[i + 1], P[i + 2]]); }
    function cut(Q, z, keepAbove) {
      var R = [];
      for (var k = 0; k < Q.length; k++) {
        var a = Q[k], b = Q[(k + 1) % Q.length], ina = keepAbove ? a[2] >= z : a[2] <= z, inb = keepAbove ? b[2] >= z : b[2] <= z;
        if (ina) { R.push(a); }
        if (ina !== inb) { var t = (z - a[2]) / (b[2] - a[2]); R.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, z]); }
      }
      return R;
    }
    var C = cut(cut(A, lo, true), hi, false);
    if (C.length < 2) { return; }
    var inside = false, n = C.length;
    for (var a = 0, b = n - 1; a < n; b = a++) {
      var ax = C[b][0], ay = C[b][1], cx = C[a][0], cy = C[a][1];
      if ((ay > Y) !== (cy > Y) && X < ax + (cx - ax) * (Y - ay) / (cy - ay)) { inside = !inside; }
      hbSegNear(ax, ay, cx, cy, X, Y, best, sp.id);
    }
    if (inside && n >= 3) { best.d = 0; best.id = sp.id; }
  }

  // ---- the body, at a spot of the plan -------------------------------------------------------------------------
  // Where (x, y) on the plan is in the picture, and how high the feet are there: the floor, the step
  // of the flight you are on, the land out of doors.
  function hbAt(x, y) {
    var plan = v3Ground(), floors = plan.floors || [], f = floors.length ? floorAt(floors, x, y) : null;
    var z = (f ? f.z : 0) + (V3.stairZ || 0);
    if ((!f || f.level === 0) && typeof V3.terrZ === "number" && !(V3.inRoom)) { z += V3.terrZ; }
    return { X: x + (f ? f.dx : 0), Y: y + (f ? f.dy : 0), z: z, f: f };
  }
  function hbNearAt(x, y, R) {
    var A = hbAt(x, y), got = hbNear(A.X, A.Y, A.z, R || HB_R + 4);
    got.A = A;
    return got;
  }
  // Blocked by what is drawn, at (x, y) on the plan: too near it -- unless already as near, put there by
  // a door swung round, and stepping further off.  null: not walking, or nothing taken in yet.
  function hbBlocked(x, y) {
    if (!hbLive()) { return null; }
    var to = hbNearAt(x, y, HB_R + 1).d;
    if (to < HB_R) {
      var me = V3.me, N = HB.now;
      if (!N || N.x !== me.x || N.y !== me.y || N.at !== HB.at) { N = HB.now = { x: me.x, y: me.y, at: HB.at, d: hbNearAt(me.x, me.y, HB_R + 1).d }; }
      if (!(to > N.d + 0.01)) { return true; }
    }
    return hbFlight(x, y);
  }
  // Up a flight of stairs a few steps, kept on it between its rails: not stepped off its side into the air
  // (40-climb.js lifts you as you go up it).  Near its foot, stepped off any way.  (Its sides from the
  // floor are left as they were: a stairwell's flights stand one over the other, the top of the one
  // below where the next one starts, and doors are put by their sides.)
  // And from the floor, not stepped onto from the side more than a third of the way up it -- in the air
  // there, beside a stairwell's landing -- except where another flight comes up onto the same spot.
  function hbFlight(x, y) {
    if (typeof climbWays !== "function") { return false; }
    var plan = v3Ground(), W = plan._hbWays || (plan._hbWays = climbWays(plan)), me = V3.me, up = (V3.stairZ || 0) > 0.3 * FLOOR_PX;
    for (var i = 0; i < W.flights.length; i++) {
      var L = W.flights[i].low, hw = L.w / 2, hh = L.h / 2, m = climbLocal(L, me.x, me.y);
      var onNow = Math.abs(m[0]) <= hw + 2 && Math.abs(m[1]) <= hh + 2, l = climbLocal(L, x, y);
      if (onNow) {
        if (up && l[1] < hh - 2 && Math.abs(l[0]) > hw - HB_R * 0.6 && Math.abs(l[0]) > Math.abs(m[0]) - 0.01) { return true; }
        continue;
      }
      if (up || Math.abs(l[0]) > hw - 2 || Math.abs(l[1]) > hh - 2) { continue; }
      if ((hh - l[1]) / L.h <= 0.34) { continue; }                         // its first steps: stepped onto any way
      var arrive = W.flights.some(function (w) { return w.high !== L && insideArea(w.high, x, y, -1); });
      if (!arrive) { return true; }
    }
    return false;
  }

  // ---- a step, slid along what it meets ------------------------------------------------------------------------
  // (v3Move, 38-view3d.js) In steps of three pixels: each one that would come too near what is drawn is
  // pushed back out along the way out of it -- so a wall met at a slant is slid along, a corner gone
  // round, a door's frame met off its middle eased into the doorway -- and only met head on stopped.
  function hbMove(me, mx, my) {
    var len = Math.hypot(mx, my);
    if (!(len > 0)) { return false; }
    var steps = Math.max(1, Math.ceil(len / 3)), sx = mx / steps, sy = my / steps, moved = false;
    for (var i = 0; i < steps; i++) {
      var tx = me.x + sx, ty = me.y + sy;
      if (!v3Blocked(tx, ty)) { me.x = tx; me.y = ty; moved = true; continue; }
      var ok = false;
      // out of what is met, along its way out (twice: in a corner, both walls)
      for (var k = 0; k < 3; k++) {
        var c = hbNearAt(tx, ty, HB_R + 2);
        if (!(c.d < HB_R + 0.02) || c.d <= 0) { break; }
        var nx = (c.A.X - c.x) / c.d, ny = (c.A.Y - c.y) / c.d, push = HB_R - c.d + 0.05;
        tx += nx * push; ty += ny * push;
      }
      var fwd = (tx - me.x) * sx + (ty - me.y) * sy;
      if (fwd > 0.08 * (sx * sx + sy * sy) && Math.hypot(tx - me.x, ty - me.y) < 2 * Math.hypot(sx, sy) + 1 && !v3Blocked(tx, ty)) {
        me.x = tx; me.y = ty; ok = true;
      }
      if (!ok) { ok = hbDoorway(me, sx, sy); }
      if (!ok) {
        // each way on its own, as before (what is in the way and not drawn: the lot's edge, a rail)
        if (sx && !v3Blocked(me.x + sx, me.y)) { me.x += sx; ok = true; }
        else if (sy && !v3Blocked(me.x, me.y + sy)) { me.y += sy; ok = true; }
      }
      if (!ok) { break; }
      moved = true;
    }
    return moved;
  }
  // Walking at a doorway a little off its middle: the step turned in toward its middle, so a jamb met
  // with a shoulder leads you through rather than stopping you.
  function hbDoorway(me, sx, sy) {
    var plan = v3Ground(), sl = Math.hypot(sx, sy), ux = sx / sl, uy = sy / sl, best = null, bd = Infinity;
    (plan.doors || []).forEach(function (d) {
      if (!doorIsOpen(d) || doorLocked(d)) { return; }
      var dx = d.x - me.x, dy = d.y - me.y, dist = Math.hypot(dx, dy);
      if (dist > 1.6 * FLOOR_PX || dist < 1) { return; }
      if ((dx * ux + dy * uy) / dist < 0.45) { return; }
      if (dist < bd) { bd = dist; best = d; }
    });
    if (!best) { return false; }
    // its way through: across its width
    var t = (best.turn || 0) * Math.PI / 180, ax = -Math.sin(t), ay = Math.cos(t);
    if (ax * ux + ay * uy < 0) { ax = -ax; ay = -ay; }
    var wx = Math.cos(t), wy = Math.sin(t), off = (me.x - best.x) * wx + (me.y - best.y) * wy;
    var halfClear = best.w / 2 - 3 - HB_R;
    if (Math.abs(off) < 0.5) { return false; }
    // a step toward the middle line and on through
    var side = Math.min(Math.abs(off), sl * 0.9) * (off > 0 ? -1 : 1);
    var tx = me.x + ax * sl * 0.6 + wx * side, ty = me.y + ay * sl * 0.6 + wy * side;
    if (Math.abs(off) > best.w / 2 + 2.5 * HB_R && halfClear > 0) { return false; }
    if (!v3Blocked(tx, ty)) { me.x = tx; me.y = ty; return true; }
    tx = me.x + wx * side; ty = me.y + wy * side;
    if (!v3Blocked(tx, ty)) { me.x = tx; me.y = ty; return true; }
    return false;
  }

  // ---- hooked in -----------------------------------------------------------------------------------------------
  if (typeof v3Solids === "function") {
    var v3SolidsHb = v3Solids;
    v3Solids = function (model) {
      var out = v3SolidsHb.apply(this, arguments);
      try { hbTake(model); } catch (e) { HB.live = false; if (window.console && console.warn) { console.warn("collide:", e && e.message); } }
      return out;
    };
  }
  if (typeof v3Move === "function") {
    var v3MoveHb = v3Move;
    v3Move = function (me, mx, my) {
      if (hbLive()) {
        try { return hbMove(me, mx, my); } catch (e) { if (window.console && console.warn) { console.warn("collide:", e && e.message); } }
      }
      return v3MoveHb.apply(this, arguments);
    };
  }
  // the outlines near you not found yet, found a few at a time between pictures, nearest first
  function hbTick() {
    if (!HB.pend.length || !hbLive()) { return; }
    var t0 = performance.now(), me = V3.me, A = hbAt(me.x, me.y);
    if (HB.pend.length > 1 && (!HB.sortedAt || t0 - HB.sortedAt > 500)) {
      HB.pend.sort(function (p, q) {
        return Math.hypot((q.X0 + q.X1) / 2 - A.X, (q.Y0 + q.Y1) / 2 - A.Y) - Math.hypot((p.X0 + p.X1) / 2 - A.X, (p.Y0 + p.Y1) / 2 - A.Y);
      });
      HB.sortedAt = t0;
    }
    while (HB.pend.length && performance.now() - t0 < HB_BUDGET) {
      var o = HB.pend.pop();
      if (!o.base) { hbFootNow(o); }
    }
  }
  if (typeof v3Draw === "function") {
    var v3DrawHb = v3Draw;
    v3Draw = function () {
      var out = v3DrawHb.apply(this, arguments);
      try {
        if (!V3 || V3.mode !== "walk") { HB.live = false; HB.pend.length = 0; }
        else { hbTick(); }
      } catch (e) { /* found as asked */ }
      return out;
    };
  }
