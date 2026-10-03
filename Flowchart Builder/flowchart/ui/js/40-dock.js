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

  function dockScene(v, L) {
    if (!houseOpt("dock") || !L.water || !L.lot) { return; }
    var P = FLOOR_PX, W = L.water, dl = Math.hypot(W.d[0], W.d[1]) || 1, d = [W.d[0] / dl, W.d[1] / dl], e = [-d[1], d[0]];
    var sea = W.to === null || W.to === undefined, wz = dockWaterLevel(), C = L.sheetC;
    var wood = gl3Mix([0.5, 0.4, 0.29], C, 0.08), post = gl3Mix([0.33, 0.26, 0.19], C, 0.08), white = gl3Mix([0.95, 0.95, 0.93], C, 0.06);
    var side = Math.min(L.lot.w * 0.28, 7 * P);
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
        // a motorboat tied up alongside: an open hull, a console with its
        // windscreen, two seats, the outboard at the stern
        var bc = at(uEnd - 3.4 * P, side + half + 1.15 * P), hull = gl3Mix([0.93, 0.93, 0.9], C, 0.06);
        dockHull(v, bc, d, 4.8 * P, 1.9 * P, wz + 0.5 * P, wz - 0.3 * P, hull, gl3Mix([0.62, 0.52, 0.4], C, 0.06), true);
        var con = [bc[0] + d[0] * 0.5 * P, bc[1] + d[1] * 0.5 * P];
        worldBox(v, con, e, d, 0.45 * P, 0.3 * P, wz + 0.15 * P, wz + 0.85 * P, white, PAT.plain);
        dockFace(v, [[con[0] - e[0] * 0.45 * P + d[0] * 0.3 * P, con[1] - e[1] * 0.45 * P + d[1] * 0.3 * P, wz + 0.85 * P],
                     [con[0] + e[0] * 0.45 * P + d[0] * 0.3 * P, con[1] + e[1] * 0.45 * P + d[1] * 0.3 * P, wz + 0.85 * P],
                     [con[0] + e[0] * 0.42 * P + d[0] * 0.12 * P, con[1] + e[1] * 0.42 * P + d[1] * 0.12 * P, wz + 1.2 * P],
                     [con[0] - e[0] * 0.42 * P + d[0] * 0.12 * P, con[1] - e[1] * 0.42 * P + d[1] * 0.12 * P, wz + 1.2 * P]], [0.55, 0.66, 0.72], 70, [d[0], d[1], 0.4]);
        [-0.5, -1.4].forEach(function (k) {
          var sc = [bc[0] + d[0] * k * P, bc[1] + d[1] * k * P];
          worldBox(v, sc, e, d, 0.62 * P, 0.22 * P, wz + 0.3 * P, wz + 0.42 * P, gl3Mix([0.2, 0.32, 0.5], C, 0.06), PAT.plain);
        });
        var st = [bc[0] - d[0] * 2.5 * P, bc[1] - d[1] * 2.5 * P], dark = gl3Mix([0.14, 0.15, 0.16], C, 0.05);
        worldBox(v, st, e, d, 0.17 * P, 0.22 * P, wz + 0.35 * P, wz + 0.85 * P, dark, 22);
        worldTube(v, [st[0], st[1], wz + 0.35 * P], [st[0] - d[0] * 0.05 * P, st[1] - d[1] * 0.05 * P, wz - 0.45 * P], 0.05 * P, 0.04 * P, 5, dark, 22);
        // its lines to the cleats
        [[uEnd - 1.0 * P, 1.6], [uEnd - 4.0 * P, -1.8]].forEach(function (m) {
          var cl = at(m[0], side + half - 0.12 * P), bo = [bc[0] + d[0] * m[1] * P - e[0] * 0.8 * P, bc[1] + d[1] * m[1] * P - e[1] * 0.8 * P];
          worldTube(v, [cl[0], cl[1], deck + 0.06 * P], [bo[0], bo[1], wz + 0.5 * P], 0.015 * P, 0.015 * P, 4, gl3Mix([0.85, 0.8, 0.66], C, 0.05), PAT.plain);
        });
      } else {
        // a sailboat along the far side of the dock, its mast, boom and
        // sails; a mooring buoy out beyond; and a dinghy on this side
        var sb = at(uEnd - 4.4 * P, side - half - 1.55 * P), sax = d;
        dockHull(v, sb, sax, 8.2 * P, 2.7 * P, wz + 0.75 * P, wz - 0.55 * P, white, gl3Mix([0.8, 0.74, 0.62], C, 0.06), false);
        var cab = [sb[0] - sax[0] * 0.4 * P, sb[1] - sax[1] * 0.4 * P], sbx = [-sax[1], sax[0]];
        worldBox(v, cab, sbx, sax, 0.85 * P, 1.3 * P, wz + 0.75 * P, wz + 1.25 * P, white, PAT.plain);
        var mast = [sb[0] + sax[0] * 0.6 * P, sb[1] + sax[1] * 0.6 * P], silver = gl3Mix([0.78, 0.8, 0.82], C, 0.05);
        worldTube(v, [mast[0], mast[1], wz + 0.75 * P], [mast[0], mast[1], wz + 10.5 * P], 0.07 * P, 0.05 * P, 6, silver, 22);
        var boomEnd = [mast[0] - sax[0] * 3.2 * P, mast[1] - sax[1] * 3.2 * P];
        worldTube(v, [mast[0], mast[1], wz + 1.9 * P], [boomEnd[0], boomEnd[1], wz + 1.9 * P], 0.05 * P, 0.04 * P, 5, silver, 22);
        var sail = gl3Mix([0.97, 0.96, 0.93], C, 0.04);
        dockFace(v, [[mast[0], mast[1], wz + 2.0 * P], [boomEnd[0], boomEnd[1], wz + 2.0 * P], [mast[0], mast[1], wz + 10.2 * P]], sail, PAT.plain, [sbx[0], sbx[1], 0]);
        var bow = [sb[0] + sax[0] * 4.0 * P, sb[1] + sax[1] * 4.0 * P];
        dockFace(v, [[mast[0], mast[1], wz + 9.4 * P], [bow[0], bow[1], wz + 0.9 * P], [mast[0] + sax[0] * 0.6 * P, mast[1] + sax[1] * 0.6 * P, wz + 1.2 * P]], sail, PAT.plain, [sbx[0], sbx[1], 0]);
        var bu = at(uEnd + 5 * P, side + 6 * P);
        worldBall(v, [bu[0], bu[1], wz + 0.15 * P], 0.3 * P, 0.8, gl3Mix([0.9, 0.35, 0.2], C, 0.05), PAT.plain);
        var dg = at(uEnd - 2.6 * P, side + half + 0.9 * P);
        dockHull(v, dg, d, 2.8 * P, 1.3 * P, wz + 0.35 * P, wz - 0.15 * P, gl3Mix([0.82, 0.3, 0.22], C, 0.06), gl3Mix([0.6, 0.5, 0.38], C, 0.06), true);
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
