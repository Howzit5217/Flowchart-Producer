// ---------------------------------------------------------------------------
//  40-dock.js -- by the water, a dock out from the bank behind the house,
//  and a boat: a motorboat tied up alongside on a lake, a sailboat on its
//  mooring out at sea (and the dinghy that gets you to it)
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "and to also update it so you can have a dock,
  // porch, a boat or things like that in the world too if the scenery is
  // right")
  //
  // Only where there is water: the lake or the sea lies behind the lot
  // (worldGround, 39-world.js; 40-land.js), its shore so far past the back
  // of it.  The dock is the street's kind of thing -- part of the scenery,
  // made once -- standing on posts in the water, a ramp down to it from the
  // bank where the land is (the land's own height, 40-land.js).
  HOUSE_PLAIN.dock = true;
  function dockWaterLevel() {
    return typeof TERR !== "undefined" && TERR && !TERR.off && TERR.water && TERR_ON ? TERR.water.rel : -3;
  }
  function dockGround(x, y) {
    if (typeof TERR !== "undefined" && TERR && !TERR.off && TERR.mesh && TERR_ON && typeof terrMeshAt === "function") { return terrMeshAt(TERR, x, y); }
    return 0;
  }
  // A flat face, lit the way it faces (Newell's way), its normal turned toward `up`.
  function dockFace(v, pts, c, pat, up) {
    var nx = 0, ny = 0, nz = 0;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
    }
    var l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    if (up && nx * up[0] + ny * up[1] + nz * up[2] < 0) { nx = -nx; ny = -ny; nz = -nz; }
    // (never quite flat up: the land, 40-land.js, lays what is flat near the ground onto it)
    if (nz > 0.999) { nx += 0.045; l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l; }
    gl3Poly(v, pts, [nx, ny, nz], c, 1, null, pat);
  }
  // A hull, `len` long and `beam` wide, its bow along `ax` from `c`: its
  // sides from the gunwale (zTop) in to the keel (zBot), and a floor inside
  // (open) or a deck over it.
  function dockHull(v, c, ax, len, beam, zTop, zBot, hullC, deckC, open) {
    var bx = [-ax[1], ax[0]], N = 12, top = [], bot = [];
    function hw(t) { return t <= 0.25 ? 1 - 0.12 * Math.pow((0.25 - t) / 1.25, 2) : Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.25) / 0.75, 2))); }
    function pt(t, s, k, z) { var w = beam / 2 * hw(t) * s * k, l = len / 2 * t * (k < 1 ? 0.94 : 1); return [c[0] + ax[0] * l + bx[0] * w, c[1] + ax[1] * l + bx[1] * w, z]; }
    for (var i = 0; i <= N; i++) { var t = -1 + 2 * i / N; top.push(pt(t, 1, 1, zTop)); bot.push(pt(t, 1, 0.55, zBot)); }
    for (var j = N; j >= 0; j--) { var t2 = -1 + 2 * j / N; top.push(pt(t2, -1, 1, zTop)); bot.push(pt(t2, -1, 0.55, zBot)); }
    for (var q = 0; q < top.length; q++) {
      var r = (q + 1) % top.length, a = top[q], b = top[r];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.5) { continue; }
      var mid = [(a[0] + b[0]) / 2 - c[0], (a[1] + b[1]) / 2 - c[1], 0];
      dockFace(v, [a, b, bot[r], bot[q]], hullC, PAT.plain, mid);
    }
    dockFace(v, bot, gl3Mix(hullC, [0, 0, 0], 0.25), PAT.plain, [0, 0, -1]);
    var inner = top.map(function (p) { return [c[0] + (p[0] - c[0]) * 0.9, c[1] + (p[1] - c[1]) * 0.9, open ? zTop - (zTop - zBot) * 0.6 : zTop]; });
    dockFace(v, inner, deckC, open ? PAT.boards : PAT.plain, [0, 0, 1]);
    // a rubbing strake along the gunwale
    for (var g = 0; g < top.length; g++) {
      var a2 = top[g], b2 = top[(g + 1) % top.length];
      if (Math.hypot(a2[0] - b2[0], a2[1] - b2[1]) < 0.5) { continue; }
      worldTube(v, a2, b2, 0.03 * FLOOR_PX, 0.03 * FLOOR_PX, 4, deckC, PAT.plain);
    }
  }

  // (2026-10-03: "boat model does not look all that good")  A hull lofted
  // from stations along it, stern (t -1) to stem (t 1): at each its half
  // beam, the sheer (rising to the bow), the chine and the keel (rising to
  // the forefoot) -- a V bottom, flared topsides, a flat transom.  Above
  // the chine its topsides' color, under it the bottom paint, a boot stripe
  // at the waterline; the deck over it, or (open) a floor inside it.
  // Returns where the gunwale is along it, for rails and the rest.
  function dockLoft(v, c, ax, o) {
    var bx = [-ax[1], ax[0]], N = 16, P = FLOOR_PX, len = o.len, beam = o.beam;
    function half(t) {                     // the beam's share at t
      if (t < -0.85) { return 0.82 + (t + 1) / 0.15 * 0.1; }
      if (t < 0.05) { return 0.92 + 0.08 * Math.sin((t + 0.85) / 0.9 * Math.PI / 2); }
      return Math.max(0, Math.cos((t - 0.05) / 0.95 * Math.PI / 2));
    }
    function sheer(t) { return o.zSheer + o.rise * Math.pow(Math.max(0, t), 2) + 0.06 * P * (t < -0.6 ? (-0.6 - t) / 0.4 : 0); }
    function keel(t) { return o.zKeel + (o.zChine - o.zKeel) * Math.pow(Math.max(0, (t - 0.35) / 0.65), 1.6); }
    function at(t, side, z, k) { var w = beam / 2 * half(t) * side * k, l = len / 2 * t; return [c[0] + ax[0] * l + bx[0] * w, c[1] + ax[1] * l + bx[1] * w, z]; }
    var st = [];
    for (var i = 0; i <= N; i++) {
      var t = -1 + 2 * i / N, zs = sheer(t), zk = keel(t), zc = Math.max(zk, o.zChine + (zs - o.zChine) * 0.04 * Math.max(0, t));
      st.push({ t: t, gl: at(t, 1, zs, 1), cl: at(t, 1, zc, 0.86), k: at(t, 0, zk, 0), cr: at(t, -1, zc, 0.86), gr: at(t, -1, zs, 1) });
    }
    var top = o.topC, bottom = o.bottomC, boot = o.bootC || [0.18, 0.22, 0.3];
    function out(a, b) { return [(a[0] + b[0]) / 2 - c[0], (a[1] + b[1]) / 2 - c[1], 0]; }
    for (var j = 0; j < N; j++) {
      var A = st[j], B = st[j + 1];
      dockFace(v, [A.gl, B.gl, B.cl, A.cl], top, PAT.plain, out(A.gl, B.gl));
      dockFace(v, [A.gr, A.cr, B.cr, B.gr], top, PAT.plain, out(A.gr, B.gr));
      dockFace(v, [A.cl, B.cl, B.k, A.k], bottom, PAT.plain, [out(A.cl, B.cl)[0], out(A.cl, B.cl)[1], -0.6]);
      dockFace(v, [A.cr, A.k, B.k, B.cr], bottom, PAT.plain, [out(A.cr, B.cr)[0], out(A.cr, B.cr)[1], -0.6]);
      // the boot stripe, just over the chine
      [[A.cl, B.cl], [A.cr, B.cr]].forEach(function (q) {
        worldTube(v, [q[0][0], q[0][1], q[0][2] + 0.06 * P], [q[1][0], q[1][1], q[1][2] + 0.06 * P], 0.025 * P, 0.025 * P, 4, boot, PAT.plain);
      });
    }
    // the transom, flat across the stern
    var S0 = st[0];
    dockFace(v, [S0.gl, S0.cl, S0.k, S0.cr, S0.gr], top, PAT.plain, [-ax[0], -ax[1], 0]);
    // the deck over it (or a floor down inside, a boat open to the sky)
    var rim = st.map(function (q) { return q.gl; }).concat(st.slice().reverse().map(function (q) { return q.gr; }));
    if (o.open) {
      var floorZ = o.zChine + 0.18 * P;
      dockFace(v, rim.map(function (p) { return [c[0] + (p[0] - c[0]) * 0.9, c[1] + (p[1] - c[1]) * 0.9, floorZ]; }), o.deckC, PAT.boards, [0, 0, 1]);
      // the inside of the topsides, so the hull has a thickness to it
      for (var m = 0; m < rim.length; m++) {
        var a = rim[m], b = rim[(m + 1) % rim.length];
        if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.5) { continue; }
        var ia = [c[0] + (a[0] - c[0]) * 0.9, c[1] + (a[1] - c[1]) * 0.9], ib = [c[0] + (b[0] - c[0]) * 0.9, c[1] + (b[1] - c[1]) * 0.9];
        dockFace(v, [[ia[0], ia[1], a[2]], [ib[0], ib[1], b[2]], [ib[0], ib[1], floorZ], [ia[0], ia[1], floorZ]], gl3Mix(top, [0, 0, 0], 0.08), PAT.plain, [c[0] - ia[0], c[1] - ia[1], 0]);
        dockFace(v, [a, b, [ib[0], ib[1], b[2]], [ia[0], ia[1], a[2]]], o.trimC || top, PAT.plain, [0, 0, 1]);
      }
    } else {
      dockFace(v, rim, o.deckC, PAT.plain, [0, 0, 1]);
    }
    // a rubbing strake along the gunwale
    for (var g = 0; g < rim.length; g++) {
      var a2 = rim[g], b2 = rim[(g + 1) % rim.length];
      if (Math.hypot(a2[0] - b2[0], a2[1] - b2[1]) < 0.5) { continue; }
      worldTube(v, a2, b2, 0.035 * P, 0.035 * P, 4, o.trimC || o.deckC, PAT.plain);
    }
    return { st: st, at: at, sheer: sheer, bx: bx };
  }
  // A rail of tube on stanchions, along points.
  function dockRail(v, pts, h, col) {
    var P = FLOOR_PX;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      worldTube(v, p, [p[0], p[1], p[2] + h], 0.02 * P, 0.02 * P, 4, col, 22);
      if (i) { var q = pts[i - 1]; worldTube(v, [q[0], q[1], q[2] + h], [p[0], p[1], p[2] + h], 0.018 * P, 0.018 * P, 4, col, 22); }
    }
  }
  // A sail between three corners, bellied out to `side` by `belly` at its
  // middle: a fan of faces from the tack across to the leech.
  function dockSail(v, head, tack, clew, side, belly, col) {
    var rows = 5;
    function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    for (var r = 0; r < rows; r++) {
      var t0 = r / rows, t1 = (r + 1) / rows;
      var l0 = lerp(tack, head, t0), l1 = lerp(tack, head, t1), e0 = lerp(clew, head, t0), e1 = lerp(clew, head, t1);
      var bulge = function (a, b, tt) { var m = lerp(a, b, 0.42), k = belly * Math.sin(Math.PI * (1 - tt)) * (1 - tt * 0.6); return [m[0] + side[0] * k, m[1] + side[1] * k, m[2]]; };
      var m0 = bulge(l0, e0, t0), m1 = bulge(l1, e1, t1);
      dockFace(v, [l0, m0, m1, l1], col, PAT.plain, [side[0], side[1], 0]);
      dockFace(v, [m0, e0, e1, m1], col, PAT.plain, [side[0], side[1], 0]);
    }
  }

  var dockLast = null;
  function dockScene(v, L) {
    if (!houseOpt("dock") || !L.water || !L.lot) { return; }
    var P = FLOOR_PX, W = L.water, dl = Math.hypot(W.d[0], W.d[1]) || 1, d = [W.d[0] / dl, W.d[1] / dl], e = [-d[1], d[0]];
    var sea = W.to === null || W.to === undefined, wz = dockWaterLevel(), C = L.sheetC;
    var wood = gl3Mix([0.5, 0.4, 0.29], C, 0.08), post = gl3Mix([0.33, 0.26, 0.19], C, 0.08), white = gl3Mix([0.95, 0.95, 0.93], C, 0.06);
    var side = Math.min(L.lot.w * 0.28, 7 * P);
    dockLast = { o: W.o, d: d, e: e, from: W.from, side: side, z: wz };      // (where it is: to look at it from)
    function at(u, s) { return [W.o[0] + d[0] * u + e[0] * s, W.o[1] + d[1] * u + e[1] * s]; }
    var keepLift = typeof terrLift !== "undefined" ? terrLift : null;
    if (typeof terrLift !== "undefined") { terrLift = 0; }
    try {
      var uLand = W.from - 4.5 * P, uBank = W.from - 0.8 * P, uEnd = W.from + (sea ? 13 : 12) * P, half = 0.95 * P;
      var deck = wz + 0.55 * P, g0 = Math.max(dockGround.apply(null, at(uLand, side)), wz + 0.1 * P) + 0.12 * P;
      // the ramp down from the bank
      var r0 = at(uLand, side - half), r1 = at(uLand, side + half), r2 = at(uBank, side + half), r3 = at(uBank, side - half);
      dockFace(v, [[r0[0], r0[1], g0], [r1[0], r1[1], g0], [r2[0], r2[1], deck], [r3[0], r3[1], deck]], wood, PAT.boards, [0, 0, 1]);
      [[r0, r3], [r1, r2]].forEach(function (s) {
        dockFace(v, [[s[0][0], s[0][1], g0], [s[1][0], s[1][1], deck], [s[1][0], s[1][1], deck - 0.12 * P], [s[0][0], s[0][1], g0 - 0.12 * P]], post, PAT.plain, null);
      });
      // the dock itself, its boards across it, on posts down into the water
      var mid = at((uBank + uEnd) / 2, side);
      worldBox(v, mid, e, d, half, (uEnd - uBank) / 2, deck - 0.1 * P, deck, wood, PAT.boards);
      for (var u = uBank + 0.3 * P; u <= uEnd + 1; u += 2.3 * P) {
        [-1, 1].forEach(function (s) {
          var p = at(Math.min(u, uEnd - 0.12 * P), side + s * (half - 0.06 * P)), floor = Math.min(wz - 1.4 * P, dockGround(p[0], p[1]) - 0.2 * P);
          worldTube(v, [p[0], p[1], floor], [p[0], p[1], deck + (u > uEnd - 2.3 * P ? 0.45 * P : 0.02 * P)], 0.1 * P, 0.09 * P, 6, post, PAT.plain);
        });
      }
      // cleats along the sides near the end, a ladder down off the end
      [uEnd - 1.0 * P, uEnd - 4.0 * P].forEach(function (u2) {
        var cl = at(u2, side + half - 0.12 * P);
        worldBox(v, cl, e, d, 0.05 * P, 0.16 * P, deck, deck + 0.08 * P, gl3Mix([0.25, 0.26, 0.27], C, 0.05), 22);
      });
      [-0.25, 0.25].forEach(function (s) {
        var a = at(uEnd + 0.05 * P, side + s * P), b = at(uEnd + 0.12 * P, side + s * P);
        worldTube(v, [a[0], a[1], deck + 0.6 * P], [b[0], b[1], wz - 0.6 * P], 0.025 * P, 0.025 * P, 5, gl3Mix([0.7, 0.72, 0.73], C, 0.05), 22);
      });
      for (var rung = 0; rung < 4; rung++) {
        var zr = deck - 0.15 * P - rung * 0.3 * P, ra = at(uEnd + 0.1 * P, side - 0.25 * P), rb = at(uEnd + 0.1 * P, side + 0.25 * P);
        worldTube(v, [ra[0], ra[1], zr], [rb[0], rb[1], zr], 0.02 * P, 0.02 * P, 4, gl3Mix([0.7, 0.72, 0.73], C, 0.05), 22);
      }
      if (!sea) {
        // a motorboat tied up alongside: an open hull, its console with a
        // windscreen round it, two helm seats, a bench across the stern, a
        // rail round the bow, the outboard on the transom, lines to the cleats
        var bc = at(uEnd - 3.4 * P, side + half + 1.2 * P), hullW = gl3Mix([0.95, 0.95, 0.93], C, 0.05), steel = gl3Mix([0.78, 0.8, 0.82], C, 0.05);
        var H = dockLoft(v, bc, d, { len: 5.4 * P, beam: 2.1 * P, zSheer: wz + 0.62 * P, rise: 0.22 * P, zChine: wz + 0.06 * P, zKeel: wz - 0.36 * P,
                                     topC: hullW, bottomC: gl3Mix([0.16, 0.24, 0.4], C, 0.05), bootC: gl3Mix([0.12, 0.2, 0.36], C, 0.05),
                                     deckC: gl3Mix([0.82, 0.8, 0.74], C, 0.05), trimC: gl3Mix([0.88, 0.87, 0.84], C, 0.05), open: true });
        var floorZ = wz + 0.24 * P, e2 = H.bx;
        function on(k, s2) { return [bc[0] + d[0] * k * P + e2[0] * s2 * P, bc[1] + d[1] * k * P + e2[1] * s2 * P]; }
        var con = on(0.35, 0.35);
        worldBox(v, con, e2, d, 0.32 * P, 0.38 * P, floorZ, floorZ + 0.82 * P, hullW, PAT.plain);
        worldBox(v, on(0.38, 0.35), e2, d, 0.2 * P, 0.16 * P, floorZ + 0.82 * P, floorZ + 0.86 * P, gl3Mix([0.12, 0.13, 0.15], C, 0.05), 22);
        // the windscreen: three panes round the front of the console, leaning back
        var glass = gl3Mix([0.55, 0.66, 0.72], C, 0.05), wb = floorZ + 0.82 * P, wt = floorZ + 1.22 * P;
        [[-0.42, -0.2, 0.62, 0.7], [-0.2, 0.2, 0.7, 0.7], [0.2, 0.42, 0.7, 0.62]].forEach(function (pn) {
          var a0 = on(pn[2], 0.35 + pn[0]), a1 = on(pn[3], 0.35 + pn[1]), b0 = on(pn[2] - 0.16, 0.35 + pn[0] * 0.9), b1 = on(pn[3] - 0.16, 0.35 + pn[1] * 0.9);
          dockFace(v, [[a0[0], a0[1], wb], [a1[0], a1[1], wb], [b1[0], b1[1], wt], [b0[0], b0[1], wt]], glass, 70, [d[0], d[1], 0.4]);
          worldTube(v, [b0[0], b0[1], wt], [b1[0], b1[1], wt], 0.015 * P, 0.015 * P, 4, steel, 22);
        });
        // two helm seats on pedestals, a bench across the stern
        [0.35, -0.35].forEach(function (s2) {
          var sc = on(-0.55, s2);
          worldTube(v, [sc[0], sc[1], floorZ], [sc[0], sc[1], floorZ + 0.45 * P], 0.05 * P, 0.05 * P, 6, steel, 22);
          worldBox(v, sc, e2, d, 0.24 * P, 0.24 * P, floorZ + 0.45 * P, floorZ + 0.58 * P, gl3Mix([0.92, 0.9, 0.85], C, 0.05), PAT.plain);
          worldBox(v, on(-0.76, s2), e2, d, 0.24 * P, 0.04 * P, floorZ + 0.58 * P, floorZ + 0.92 * P, gl3Mix([0.92, 0.9, 0.85], C, 0.05), PAT.plain);
        });
        worldBox(v, on(-2.05, 0), e2, d, 0.8 * P, 0.26 * P, floorZ, floorZ + 0.42 * P, gl3Mix([0.92, 0.9, 0.85], C, 0.05), PAT.plain);
        // a rail round the bow
        var railPts = H.st.filter(function (q) { return q.t > 0.25; }).map(function (q) { return [q.gl[0] - (q.gl[0] - bc[0]) * 0.06, q.gl[1] - (q.gl[1] - bc[1]) * 0.06, q.gl[2]]; });
        var railR = H.st.filter(function (q) { return q.t > 0.25; }).map(function (q) { return [q.gr[0] - (q.gr[0] - bc[0]) * 0.06, q.gr[1] - (q.gr[1] - bc[1]) * 0.06, q.gr[2]]; }).reverse();
        dockRail(v, railPts.concat(railR), 0.42 * P, steel);
        // the outboard: its cowling over the transom, the leg down into the water
        var st0 = H.st[0], mid0 = [(st0.gl[0] + st0.gr[0]) / 2 - d[0] * 0.3 * P, (st0.gl[1] + st0.gr[1]) / 2 - d[1] * 0.3 * P], dark = gl3Mix([0.12, 0.13, 0.14], C, 0.05);
        worldBox(v, mid0, e2, d, 0.24 * P, 0.32 * P, st0.gl[2] - 0.05 * P, st0.gl[2] + 0.55 * P, dark, 22);
        worldBox(v, mid0, e2, d, 0.2 * P, 0.28 * P, st0.gl[2] + 0.55 * P, st0.gl[2] + 0.66 * P, gl3Mix([0.25, 0.27, 0.3], C, 0.05), 22);
        worldTube(v, [mid0[0], mid0[1], st0.gl[2] - 0.05 * P], [mid0[0] - d[0] * 0.06 * P, mid0[1] - d[1] * 0.06 * P, wz - 0.5 * P], 0.07 * P, 0.05 * P, 6, dark, 22);
        worldBall(v, [mid0[0] - d[0] * 0.06 * P, mid0[1] - d[1] * 0.06 * P, wz - 0.48 * P], 0.11 * P, 0.7, dark, 22);
        // its lines to the cleats
        [[uEnd - 1.0 * P, 1.8], [uEnd - 4.0 * P, -2.0]].forEach(function (m) {
          var cl = at(m[0], side + half - 0.12 * P), bo = on(m[1], -0.85);
          worldTube(v, [cl[0], cl[1], deck + 0.06 * P], [bo[0], bo[1], wz + 0.62 * P], 0.015 * P, 0.015 * P, 4, gl3Mix([0.85, 0.8, 0.66], C, 0.05), PAT.plain);
        });
        // fenders between it and the dock
        [1.0, -1.2].forEach(function (k) { var f2 = on(k, -1.08); worldBall(v, [f2[0], f2[1], wz + 0.4 * P], 0.13 * P, 1.6, gl3Mix([0.22, 0.38, 0.62], C, 0.05), PAT.plain); });
      } else {
        // a sailboat along the far side of the dock: its hull, a cabin trunk
        // with its ports, the cockpit, a fin keel and rudder under it; the
        // mast with its spreaders and rigging, the boom, a mainsail and a jib
        // bellied by the breeze; a rail round the bow and lifelines; a
        // mooring buoy out beyond, and an inflatable dinghy on this side
        var sb = at(uEnd - 4.6 * P, side - half - 1.7 * P), sax = d, white = gl3Mix([0.96, 0.96, 0.94], C, 0.04), silver = gl3Mix([0.78, 0.8, 0.82], C, 0.05);
        var S1 = dockLoft(v, sb, sax, { len: 9.4 * P, beam: 3.0 * P, zSheer: wz + 0.95 * P, rise: 0.3 * P, zChine: wz + 0.08 * P, zKeel: wz - 0.55 * P,
                                        topC: white, bottomC: gl3Mix([0.5, 0.14, 0.12], C, 0.05), bootC: gl3Mix([0.12, 0.2, 0.36], C, 0.05),
                                        deckC: gl3Mix([0.86, 0.85, 0.82], C, 0.05), trimC: gl3Mix([0.62, 0.48, 0.32], C, 0.05) });
        var sbx = S1.bx, deckZ = wz + 0.95 * P;
        function sOn(k, s2, z) { return [sb[0] + sax[0] * k * P + sbx[0] * s2 * P, sb[1] + sax[1] * k * P + sbx[1] * s2 * P, z]; }
        // the fin keel and the rudder, under the water
        worldBox(v, sOn(0.2, 0, 0), sbx, sax, 0.07 * P, 0.7 * P, wz - 1.9 * P, wz - 0.5 * P, gl3Mix([0.3, 0.3, 0.32], C, 0.05), 22);
        worldBox(v, sOn(0.1, 0, 0), sbx, sax, 0.16 * P, 0.9 * P, wz - 2.05 * P, wz - 1.85 * P, gl3Mix([0.3, 0.3, 0.32], C, 0.05), 22);
        worldBox(v, sOn(-3.8, 0, 0), sbx, sax, 0.05 * P, 0.35 * P, wz - 1.3 * P, wz + 0.2 * P, gl3Mix([0.5, 0.14, 0.12], C, 0.05), PAT.plain);
        // the cabin trunk: sides leaning in, a sloped front, ports along it
        var cb0 = deckZ, cb1 = deckZ + 0.55 * P, tw = 1.05 * P, tw2 = 0.9 * P;
        var trunk = [[-1.6, tw], [1.5, tw * 0.95], [2.1, tw * 0.6], [2.1, -tw * 0.6], [1.5, -tw * 0.95], [-1.6, -tw]];
        var lo = trunk.map(function (q) { return sOn(q[0], q[1] / P, cb0); }), hi = trunk.map(function (q) { return sOn(q[0] - (q[0] > 1.8 ? 0.35 : 0), q[1] / P * tw2 / tw, cb1); });
        for (var ti = 0; ti < lo.length; ti++) {
          var tj = (ti + 1) % lo.length;
          dockFace(v, [lo[ti], lo[tj], hi[tj], hi[ti]], white, PAT.plain, [((lo[ti][0] + lo[tj][0]) / 2) - sb[0], ((lo[ti][1] + lo[tj][1]) / 2) - sb[1], 0.2]);
        }
        dockFace(v, hi, gl3Mix([0.9, 0.89, 0.86], C, 0.05), PAT.plain, [0, 0, 1]);
        [-1, 1].forEach(function (sd) {
          [-1.0, 0.0, 0.9].forEach(function (k) {
            var p0 = sOn(k - 0.28, sd * 0.97, cb0 + 0.28 * P), p1 = sOn(k + 0.28, sd * 0.97, cb0 + 0.28 * P);
            worldTube(v, p0, p1, 0.06 * P, 0.06 * P, 4, gl3Mix([0.16, 0.2, 0.26], C, 0.05), 70);
          });
        });
        // the cockpit, sunk aft of the cabin, its coamings
        worldBox(v, sOn(-2.6, 0, 0), sbx, sax, 0.85 * P, 0.95 * P, deckZ - 0.45 * P, deckZ + 0.01 * P, gl3Mix([0.74, 0.72, 0.68], C, 0.05), PAT.boards, true);
        [-0.9, 0.9].forEach(function (s2) { worldBox(v, sOn(-2.6, s2, 0), sbx, sax, 0.05 * P, 1.0 * P, deckZ, deckZ + 0.2 * P, white, PAT.plain); });
        worldTube(v, sOn(-3.5, 0, deckZ + 0.2 * P), sOn(-2.9, 0, deckZ + 0.75 * P), 0.03 * P, 0.03 * P, 5, gl3Mix([0.62, 0.48, 0.32], C, 0.05), PAT.plain);
        // the mast, its spreaders, the shrouds to the chainplates, the stays fore and aft
        var mast = sOn(0.9, 0, 0), mTop = wz + 12.5 * P;
        worldTube(v, [mast[0], mast[1], cb1], [mast[0], mast[1], mTop], 0.08 * P, 0.055 * P, 8, silver, 22);
        var spZ = wz + 7.0 * P, spL = sOn(0.9, 1.0, spZ), spR = sOn(0.9, -1.0, spZ);
        worldTube(v, [mast[0], mast[1], spZ], spL, 0.025 * P, 0.02 * P, 4, silver, 22);
        worldTube(v, [mast[0], mast[1], spZ], spR, 0.025 * P, 0.02 * P, 4, silver, 22);
        var wire = gl3Mix([0.62, 0.64, 0.66], C, 0.05);
        [[spL, sOn(0.8, 1.4, deckZ)], [spR, sOn(0.8, -1.4, deckZ)]].forEach(function (sh) {
          worldTube(v, [mast[0], mast[1], mTop - 0.3 * P], sh[0], 0.01 * P, 0.01 * P, 3, wire, 22);
          worldTube(v, sh[0], sh[1], 0.01 * P, 0.01 * P, 3, wire, 22);
        });
        var stem = S1.st[S1.st.length - 1].k, stemTop = [stem[0], stem[1], S1.sheer(1)], sternC = sOn(-4.6, 0, S1.sheer(-1) + 0.3 * P);
        worldTube(v, [mast[0], mast[1], mTop - 0.2 * P], stemTop, 0.012 * P, 0.012 * P, 3, wire, 22);
        worldTube(v, [mast[0], mast[1], mTop], sternC, 0.012 * P, 0.012 * P, 3, wire, 22);
        // the boom, and the mainsail from it up the mast; the jib on the forestay
        var boomZ = cb1 + 0.75 * P, boomEnd = sOn(-3.1, 0.25, boomZ), sail = gl3Mix([0.98, 0.97, 0.94], C, 0.04);
        worldTube(v, [mast[0], mast[1], boomZ], boomEnd, 0.055 * P, 0.045 * P, 6, silver, 22);
        dockSail(v, [mast[0], mast[1], mTop - 0.5 * P], [mast[0], mast[1], boomZ + 0.08 * P], [boomEnd[0], boomEnd[1], boomZ + 0.08 * P], [sbx[0], sbx[1]], 0.35 * P, sail);
        var jibHead = [mast[0] + (stemTop[0] - mast[0]) * 0.12, mast[1] + (stemTop[1] - mast[1]) * 0.12, mTop - 1.6 * P];
        dockSail(v, jibHead, [stemTop[0], stemTop[1], stemTop[2] + 0.25 * P], sOn(-0.2, 0.55, deckZ + 0.6 * P), [sbx[0], sbx[1]], 0.3 * P, sail);
        // the pulpit round the bow, lifelines along each side on stanchions
        var bowL = S1.st.filter(function (q) { return q.t > 0.55; }).map(function (q) { return [q.gl[0] - (q.gl[0] - sb[0]) * 0.05, q.gl[1] - (q.gl[1] - sb[1]) * 0.05, q.gl[2]]; });
        var bowR = S1.st.filter(function (q) { return q.t > 0.55; }).map(function (q) { return [q.gr[0] - (q.gr[0] - sb[0]) * 0.05, q.gr[1] - (q.gr[1] - sb[1]) * 0.05, q.gr[2]]; }).reverse();
        dockRail(v, bowL.concat(bowR), 0.6 * P, silver);
        [function (q) { return q.gl; }, function (q) { return q.gr; }].forEach(function (pick) {
          dockRail(v, S1.st.filter(function (q) { return q.t > -0.9 && q.t <= 0.6; }).filter(function (q, i) { return i % 2 === 0; }).map(function (q) {
            var p = pick(q); return [p[0] - (p[0] - sb[0]) * 0.05, p[1] - (p[1] - sb[1]) * 0.05, p[2]];
          }), 0.6 * P, silver);
        });
        // the mooring buoy, and the dinghy: two grey tubes meeting at a bow, a transom board, a floor
        var bu = at(uEnd + 5 * P, side + 6 * P);
        worldBall(v, [bu[0], bu[1], wz + 0.15 * P], 0.3 * P, 0.8, gl3Mix([0.9, 0.35, 0.2], C, 0.05), PAT.plain);
        var dg = at(uEnd - 2.6 * P, side + half + 1.0 * P), grey = gl3Mix([0.36, 0.39, 0.42], C, 0.05), dz = wz + 0.16 * P, de = [-d[1], d[0]];
        function dOn(k, s2) { return [dg[0] + d[0] * k * P + de[0] * s2 * P, dg[1] + d[1] * k * P + de[1] * s2 * P, dz]; }
        [[-1, 1], [1, -1]].forEach(function (sd) {
          var pts = [dOn(-1.25, sd[0] * 0.62), dOn(0.2, sd[0] * 0.66), dOn(0.95, sd[0] * 0.45), dOn(1.35, 0)];
          for (var k2 = 1; k2 < pts.length; k2++) { worldTube(v, pts[k2 - 1], pts[k2], 0.22 * P, 0.22 * P - (k2 === pts.length - 1 ? 0.05 * P : 0), 8, grey, PAT.plain); }
        });
        worldBox(v, dOn(-1.2, 0), de, d, 0.45 * P, 0.03 * P, wz - 0.05 * P, wz + 0.32 * P, gl3Mix([0.3, 0.3, 0.32], C, 0.05), PAT.plain);
        dockFace(v, [dOn(-1.2, 0.42), dOn(-1.2, -0.42), dOn(0.9, -0.3), dOn(1.1, 0), dOn(0.9, 0.3)].map(function (p) { return [p[0], p[1], wz + 0.02 * P]; }), gl3Mix([0.2, 0.21, 0.22], C, 0.05), PAT.plain, [0, 0, 1]);
        worldBox(v, dOn(-0.1, 0), de, d, 0.5 * P, 0.12 * P, wz + 0.02 * P, wz + 0.28 * P, gl3Mix([0.62, 0.5, 0.36], C, 0.05), PAT.boards);
      }
    } finally { if (typeof terrLift !== "undefined") { terrLift = keepLift; } }
    // nothing grows on it, nor stands in the way of it
    var lo = W.from - 6 * P, hi = W.from + 22 * P;
    L.keepOff.push(function (p) {
      var u = (p[0] - W.o[0]) * d[0] + (p[1] - W.o[1]) * d[1], s = (p[0] - W.o[0]) * e[0] + (p[1] - W.o[1]) * e[1];
      return u > lo && u < hi && s > side - 4 * P && s < side + 14 * P;
    });
  }
  if (typeof worldHood === "function") {
    var worldHoodDock = worldHood;
    worldHood = function (v, L) {
      var out = worldHoodDock.apply(this, arguments);
      try { dockScene(v, L); } catch (e) { /* the shore without it */ }
      return out;
    };
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyDock = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyDock.apply(this, arguments) + "|d" + (houseOpt("dock") ? 1 : 0); };
  }
  // On the Land tab of the view's Settings, under the ground and what the house stands on.
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.dock = '<path d="M2.5 13.6c1.3-.9 2.6-.9 3.9 0s2.6.9 3.9 0 2.6-.9 3.9 0 2.6.9 3.9 0"/><path d="M3 10h9.5M5 10v5M10.5 10v5"/><path d="M13 9.4h4.4l-1 2h-2.6z"/><path d="M15 9.4V4.6l2.4 3.6H15"/>';
  }
  function dockWaterHere() { var look = typeof worldLook === "function" ? worldLook() : null; return !!(look && look.water); }
  if (typeof terrSection === "function") {
    var terrSectionDock = terrSection;
    terrSection = function (sheet, head, tiles, draw) {
      var out = terrSectionDock.apply(this, arguments);
      try {
        tiles([{ icon: "dock", label: TXT.hs_dock, on: !!houseOpt("dock") && dockWaterHere(), off: dockWaterHere() ? "" : TXT.hs_dock_off,
                 set: function (v) { houseSetOpt("dock", v); } }]);
      } catch (e) { /* the sheet without it */ }
      return out;
    };
  }
