// ---------------------------------------------------------------------------
//  40-works-site.js -- the building site's last works outside: the kerbs set,
//  the parking and the drive paved (the paver laying it, the roller behind,
//  the dumpers bringing the asphalt), the lines painted, the walks poured,
//  the fence put up, the beds and the trees planted, the lamp posts, the
//  racks and the bins set down -- and, the building open, the cars parked
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-05: "when it comes to all things that are eventually
  // part of the building like parking spots, landscaping etc that should
  // also be a part of the building animation too for 3d")
  //
  // The building site (40-works.js) put up only the building; what is round
  // it was there from the first picture.  Here each of those is a part of
  // the timetable too (WK.classifyMore: "site:<what>:<piece>[:<square>]",
  // a paved area cut into 3 m squares so it goes down as the paver passes),
  // put in by a phase of its own before the moving in, in the order it is
  // done: the kerbs, then the asphalt, the lines once it has set; the walks;
  // the fence; the beds and what grows in them; the trees, lowered into
  // their holes; the lamp posts and the rest.  Three crews at once -- paving,
  // planting, fitting -- from the building's own crew.  The pools, decks,
  // patios and the garden's furniture are 40-works-yard.js's ("yard:").
  var JW_KINDS = { i_parking: "pave", i_asphalt: "pave", i_driveway: "pave", i_sidewalk: "walk", i_path: "walk",
                   i_plantbed: "bed", i_flowerbed: "bed", i_hedge: "bed", i_shrub: "bed", i_lawn: "bed", i_tree: "tree",
                   i_lamppost: "fix", i_pathlight: "fix", i_bikepark: "fix", i_bikerack: "fix", i_dumpster: "fix", i_bins: "fix",
                   i_mailbox: "fix", i_condenser: "fix", i_fence: "fence", i_gate: "fence", i_wall: "fence", i_parked: "car", i_lot: "lawn" };
  var JW_DIRT = { piece: true, color: "#a0683a", edge: "#7a4e2a", bare: true, pat: 30 };
  var JW_CELL = 3;                                        // metres: the squares a paved area goes down in
  function jwRgb(col) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(col || ""));
    if (!m) { return null; }
    var v = parseInt(m[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  // a kerb's concrete (a light grey), something growing (green)
  function jwKerb(c) { return c && Math.abs(c[0] - c[1]) < 14 && Math.abs(c[1] - c[2]) < 18 && c[0] > 150 && c[0] <= 225; }
  function jwGreen(c) { return c && c[1] > c[0] + 8 && c[1] > c[2] + 8; }

  // ---- which piece of the site each face is ------------------------------------------------------------
  if (typeof WK === "object") {
    var jwClassifyWas = WK.classifyMore;
    WK.classifyMore = function (site, f) {
      var n = f.node, part = n && JW_KINDS[n.kind];
      // (a wall that is the building's own is not a garden wall)
      if (!part || !f.pts || !f.pts.length) { return jwClassifyWas ? jwClassifyWas(site, f) : null; }
      var lo = Infinity, hi = -Infinity, cx = 0, cy = 0, k = f.pts.length, P = site.P;
      for (var i = 0; i < k; i++) { var p = f.pts[i], z = p[2] || 0; if (z < lo) { lo = z; } if (z > hi) { hi = z; } cx += p[0] / k; cy += p[1] / k; }
      var col = jwRgb((f.how || {}).color), sub = part, cell = "";
      if (part === "pave") {
        // (the asphalt itself is dark; a kerb light grey; anything else painted on it -- the lines, the
        // charging bays' green, the blue of the accessible ones -- goes on once it is down, never before:
        // markings stood on the bare ground ahead of the paver, 2026-10-05)
        var dark = !col || (col[0] + col[1] + col[2]) / 3 < 110, how = f.how || {};
        sub = n.kind === "i_driveway" ? "pave" : how.decal || f.tex ? "stripe" : hi - lo > 0.4 * P ? "fix" : jwKerb(col) ? "kerb" : dark ? "pave" : "stripe";
        if (sub !== "kerb") { cell = ":" + Math.floor(cx / (JW_CELL * P)) + ":" + Math.floor(cy / (JW_CELL * P)); }
      } else if (part === "walk") {
        cell = ":" + Math.floor(cx / (JW_CELL * P)) + ":" + Math.floor(cy / (JW_CELL * P));
      } else if (part === "bed") {
        sub = jwGreen(col) ? "plant" : "bed";
      }
      return { key: "site:" + sub + ":" + n.id + cell, lvl: 0, lo: lo, hi: hi, c: [cx, cy, (lo + hi) / 2], node: n, site: sub };
    };
  }

  // ---- the machines: the asphalt paver, the roller -----------------------------------------------------
  function jwPaver() {
    return moModel("jw-paver", function (M, m) {
      var yel = M.mat("lacquer", "#f2b81e"), dark = M.mat("metal", "#2a2c30"), rub = M.mat("rubber", "#1d1e20"), steel = M.mat("metal", "#55595e");
      [-1, 1].forEach(function (s) { M.box(-1.5 * m, 1.6 * m, s * 1.0 * m - 0.28 * m, s * 1.0 * m + 0.28 * m, 0, 0.6 * m, rub, 0.2 * m); });   // its tracks
      M.box(-1.6 * m, 1.4 * m, -1.25 * m, 1.25 * m, 0.45 * m, 1.55 * m, yel, 0.12 * m);                                                         // the body
      M.box(1.4 * m, 2.7 * m, -1.3 * m, 1.3 * m, 0.35 * m, 1.05 * m, yel, 0.06 * m);                                                            // the hopper in front
      M.box(1.5 * m, 2.6 * m, -1.15 * m, 1.15 * m, 0.95 * m, 1.0 * m, M.mat("matte", "#1b1b1b"));                                            // the asphalt in it
      M.box(-2.4 * m, -1.6 * m, -1.65 * m, 1.65 * m, 0.08 * m, 0.55 * m, dark, 0.05 * m);                                                      // the screed behind
      M.box(-2.5 * m, -2.3 * m, -1.65 * m, 1.65 * m, 0.55 * m, 0.95 * m, steel);                                                              // the walkway on it
      M.box(-1.3 * m, -0.4 * m, -0.9 * m, 0.9 * m, 1.55 * m, 2.0 * m, dark, 0.05 * m);                                                        // the seat and controls
      [[-1.5, -1.1], [-1.5, 1.1], [0.2, -1.1], [0.2, 1.1]].forEach(function (q) { M.box((q[0] - 0.05) * m, (q[0] + 0.05) * m, (q[1] - 0.05) * m, (q[1] + 0.05) * m, 1.55 * m, 2.75 * m, dark); });
      M.box(-1.65 * m, 0.35 * m, -1.25 * m, 1.25 * m, 2.75 * m, 2.85 * m, yel, 0.04 * m);                                                     // the canopy
      M.box(-0.6 * m, -0.3 * m, 0.4 * m, 0.7 * m, 2.85 * m, 3.0 * m, M.mat("glow", "#ffb020"), 0.03 * m);                                     // its beacon
    });
  }
  function jwRoller() {
    return moModel("jw-roller", function (M, m) {
      var yel = M.mat("lacquer", "#f2b81e"), dark = M.mat("metal", "#2a2c30"), drum = M.mat("metal", "#8a8f95");
      [-1.25, 1.25].forEach(function (x) {
        M.push().move(x * m, 0, 0.6 * m).tiltX(90);
        M.cyl(0, 0, -0.85 * m, 0.85 * m, 0.6 * m, drum, { seg: 16 });
        M.pop();
        M.box((x - 0.7) * m, (x + 0.7) * m, -0.95 * m, 0.95 * m, 0.95 * m, 1.25 * m, yel, 0.05 * m);                                        // its frame over the drum
      });
      M.box(-0.55 * m, 0.55 * m, -0.9 * m, 0.9 * m, 0.6 * m, 1.7 * m, yel, 0.1 * m);                                                         // the engine between
      M.box(-0.4 * m, 0.3 * m, -0.6 * m, 0.6 * m, 1.7 * m, 2.1 * m, dark, 0.05 * m);                                                         // the seat
      [[-0.5, -0.85], [-0.5, 0.85], [0.5, -0.85], [0.5, 0.85]].forEach(function (q) { M.box((q[0] - 0.04) * m, (q[0] + 0.04) * m, (q[1] - 0.04) * m, (q[1] + 0.04) * m, 1.7 * m, 2.7 * m, dark); });
      M.box(-0.65 * m, 0.65 * m, -1.0 * m, 1.0 * m, 2.7 * m, 2.8 * m, yel, 0.04 * m);
    });
  }
  if (typeof WK_DRAW === "object") {
    WK_DRAW.paver = function (faces, st) { wkPutM(faces, jwPaver(), wkFrame(st), 0, true); };
    WK_DRAW.roller = function (faces, st) { wkPutM(faces, jwRoller(), wkFrame(st), 0, true); };
  }

  // ---- the jobs ---------------------------------------------------------------------------------------------
  // The site's own pieces, in the street's numbers (lot-local, S.L): each node's groups, its box.
  function jwPieces(plan) {
    var S = plan.site.S, byNode = {};
    Object.keys(plan.groups || {}).forEach(function (key) {
      if (key.indexOf("site:") !== 0) { return; }
      var G = plan.groups[key], parts = key.split(":"), sub = parts[1], id = parts[2];
      var e = byNode[id] || (byNode[id] = { id: id, node: G.node, subs: {}, l: Infinity, r: -Infinity, t: Infinity, b: -Infinity });
      (e.subs[sub] || (e.subs[sub] = [])).push({ key: key, G: G });
      [[G.x0, G.y0], [G.x1, G.y0], [G.x1, G.y1], [G.x0, G.y1]].forEach(function (q) {
        var l = S.L(q[0], q[1]);
        e.l = Math.min(e.l, l[0]); e.r = Math.max(e.r, l[0]); e.t = Math.min(e.t, l[1]); e.b = Math.max(e.b, l[1]);
      });
      if (!e.node && G.node) { e.node = G.node; }
    });
    return Object.keys(byNode).map(function (k) { return byNode[k]; });
  }
  function jwMid(e) { return [(e.l + e.r) / 2, (e.t + e.b) / 2]; }
  function jwLocalOf(S, G) { return S.L((G.x0 + G.x1) / 2, (G.y0 + G.y1) / 2); }

  // A paved area: its kerbs set by two, then the paver up and down it lane by lane with the roller
  // behind, three raking after it, the dumpers bringing the asphalt to the kerb; each square in as the
  // paver passes it; then, the asphalt set, the lines painted by one walking them.
  function jwPave(plan, e, crew, t0, scale) {
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site, t = t0;
    var kerbs = (e.subs.kerb || []).slice(), cells = (e.subs.pave || []).slice(), lines = (e.subs.stripe || []).slice();
    // the kerbs, round from the nearest
    var two = crew.slice(0, 2);
    kerbs.sort(function (a, b) { var pa = jwLocalOf(S, a.G), pb = jwLocalOf(S, b.G); return Math.atan2(pa[1] - (e.t + e.b) / 2, pa[0] - (e.l + e.r) / 2) - Math.atan2(pb[1] - (e.t + e.b) / 2, pb[0] - (e.l + e.r) / 2); });
    kerbs.forEach(function (k, i) {
      var w = two[i % two.length], lc = jwLocalOf(S, k.G), at = jbWorld(J, [lc[0], lc[1] + 0.6 * P], 0);
      wkGo(plan, w, at, { after: t, carry: { kind: "board", n: 1, len: 1.0 } });
      wkDo(w, 2.4 * scale, "kneel", wkFace(at, jbWorld(J, lc, 0)));
      wkReveal(plan, k.key, w.free - 1.2 * scale, w.free, "drop", { drop: 0.3 * P });
    });
    if (kerbs.length) { t = wkTogether(two, t); }
    if (!cells.length) { return t; }
    // the lanes: along its long way, 3 m apart, there and back
    var long = e.r - e.l >= e.b - e.t, a0 = long ? e.l : e.t, a1 = long ? e.r : e.b, b0 = long ? e.t : e.l, b1 = long ? e.b : e.r;
    var lanes = Math.max(1, Math.round((b1 - b0) / (3 * P))), pts = [], step = (b1 - b0) / lanes;
    for (var i = 0; i < lanes; i++) {
      var bb = b0 + step * (i + 0.5), from = i % 2 ? a1 - 1.2 * P : a0 + 1.2 * P, to = i % 2 ? a0 + 1.2 * P : a1 - 1.2 * P;
      pts.push(long ? [from, bb] : [bb, from], long ? [to, bb] : [bb, to]);
    }
    var area = (a1 - a0) * (b1 - b0) / (P * P), dur = Math.max(12, Math.min(260, area * 0.12)) * scale;
    var path = wkPolyline(pts.map(function (p) { return [p[0], p[1], 0]; })), len = Math.max(1, path.len);
    // up from the street to the first lane, and back out to it after
    var kerbAt = [pts[0][0], S.kerb + 2.0 * P], tIn = Math.hypot(pts[0][0] - kerbAt[0], pts[0][1] - kerbAt[1]) / (2.0 * P) + 2;
    var tPave = Math.max(t, crew.reduce(function (m, w) { return Math.max(m, w.free); }, t)) + tIn;
    function onPath(s) {
      var A = wkAlong(path, Math.max(0, Math.min(len, s))), B = wkAlong(path, Math.max(0, Math.min(len, s + 0.5 * P)));
      var C = wkAlong(path, Math.max(0, Math.min(len, s - 0.5 * P))), ang = Math.atan2(B.p[1] - C.p[1], B.p[0] - C.p[0]);
      return { x: A.p[0], y: A.p[1], ang: ang };
    }
    [["paver", 0], ["roller", 4.5 * P]].forEach(function (mk) {
      var m = wkMachine(plan, mk[0], {}), lag = mk[1], lagT = lag / len * dur;
      m.site = site;
      var first = onPath(0), last = onPath(len);
      wkMSeg(m, tPave - tIn + lagT, tPave + lagT, function (k) {
        var q = wkSmooth(k);
        return { x: kerbAt[0] + (first.x - kerbAt[0]) * q, y: kerbAt[1] + (first.y - kerbAt[1]) * q, ang: Math.atan2(first.y - kerbAt[1], first.x - kerbAt[0]), site: site, moving: true };
      });
      wkMSeg(m, tPave + lagT, tPave + dur + lagT, function (k) { return Object.assign(onPath(k * len), { site: site, moving: true }); });
      wkMSeg(m, tPave + dur + lagT, tPave + dur + lagT + tIn, function (k) {
        var q = wkSmooth(k);
        return { x: last.x + (kerbAt[0] - last.x) * q, y: last.y + (kerbAt[1] - last.y) * q, ang: Math.atan2(kerbAt[1] - last.y, kerbAt[0] - last.x), site: site, moving: true };
      }).gone = true;
    });
    // each square in as the paver passes it (its middle nearest along the lanes)
    cells.forEach(function (c) {
      var lc = jwLocalOf(S, c.G), along = long ? lc[0] : lc[1], across = long ? lc[1] : lc[0];
      var li = Math.max(0, Math.min(lanes - 1, Math.floor((across - b0) / step))), f = (along - a0) / Math.max(1, a1 - a0);
      if (li % 2) { f = 1 - f; }
      var s = (li + Math.max(0, Math.min(1, f))) / lanes, at = tPave + s * dur;
      wkReveal(plan, c.key, at, at + 0.6, "fade");
    });
    // the dumpers: one each fifth of it, to the kerb by the paver's way in, tipping, away
    var trips = Math.max(1, Math.min(6, Math.round(area / 180)));
    for (var d = 0; d < trips; d++) {
      var tr = tPave + dur * d / trips;
      try {
        var dm = jbVehicle(plan, "dumper", { len: 8.6 * P, wid: 2.6 * P, target: [kerbAt[0] + 8 * P, S.kerb + 1.4 * P], street: true, t0: tr - 20, t1: tr + 30 }, { paint: "#3d4248" });
        jbCome(plan, dm, dm.stand, 8.6 * P, tr, { speed: 6 });
        jbStay(dm, tr, tr + 10, function (k) { return { tilt: Math.sin(Math.min(1, k * 1.4) * Math.PI / 2), fill: 1 - k }; });
        dm.here = tr + 10;
        jbGo(plan, dm, tr + 10, { speed: 6 });
      } catch (err) { /* no room at the kerb: brought round unseen */ }
    }
    // three raking behind it, lane by lane
    crew.slice(0, 3).forEach(function (w, i) {
      for (var l = 0; l < lanes; l++) {
        var tl = tPave + dur * (l + 1) / lanes, end = pts[l * 2 + 1], off = (i - 1) * 1.0 * P;
        var spot = jbWorld(J, long ? [end[0], end[1] + off] : [end[0] + off, end[1]], 0);
        wkGo(plan, w, spot, { after: tPave + dur * l / lanes });
        wkDo(w, Math.max(0.5, tl - w.free), "hold", null);
      }
    });
    t = Math.max(tPave + dur + 4.5 * P / len * dur + tIn, wkTogether(crew.slice(0, 3)));
    // the lines, once it has set: one walking each, with the cart
    if (lines.length) {
      var painter = crew[0], tSet = t + 6 * scale;
      lines.sort(function (p, q) { var a = jwLocalOf(S, p.G), b = jwLocalOf(S, q.G); return long ? a[0] - b[0] : a[1] - b[1]; });
      lines.forEach(function (ln) {
        var lc = jwLocalOf(S, ln.G), at = jbWorld(J, lc, 0);
        wkGo(plan, painter, at, { after: tSet, carry: { kind: "board", n: 1, len: 0.9 } });
        wkDo(painter, 1.2 * scale, "hold", null);
        wkReveal(plan, ln.key, painter.free - 0.8 * scale, painter.free, "fade");
      });
      t = Math.max(t, painter.free);
    }
    return t;
  }
  // The walks: poured from the mixer at the kerb, square by square from the street in.
  function jwWalks(plan, list, crew, t0, scale) {
    var J = jbJ(plan), P = J.P, S = J.S, t = t0, cells = [];
    list.forEach(function (e) { (e.subs.walk || []).forEach(function (c) { cells.push(c); }); });
    if (!cells.length) { return t; }
    cells.sort(function (a, b) { return jwLocalOf(S, b.G)[1] - jwLocalOf(S, a.G)[1]; });
    var mid = jwLocalOf(S, cells[0].G);
    try {
      var mx = jbVehicle(plan, "mixer", { len: 9.4 * P, wid: 2.5 * P, target: [mid[0] - 6 * P, S.kerb + 1.4 * P], street: true, t0: t - 20, t1: t + cells.length * 3 * scale + 40 });
      jbCome(plan, mx, mx.stand, 9.4 * P, t, { speed: 6 });
      jbStay(mx, t, t + cells.length * 3 * scale + 6, function (k, T) { return { turn: T * 0.8, chute: 0.9, pour: k > 0.05 && k < 0.95 ? 1 : 0, pourZ: 0 }; });
      mx.here = t + cells.length * 3 * scale + 6;
      jbGo(plan, mx, mx.here, { speed: 6 });
    } catch (err) { /* no room at the kerb */ }
    cells.forEach(function (c, i) {
      var w = crew[i % crew.length], lc = jwLocalOf(S, c.G), at = jbWorld(J, [lc[0] + 0.8 * P, lc[1]], 0);
      wkGo(plan, w, at, { after: t });
      wkDo(w, 2.6 * scale, "kneel", wkFace(at, jbWorld(J, lc, 0)));
      wkReveal(plan, c.key, w.free - 2.0 * scale, w.free, "fade");
    });
    return wkTogether(crew, t);
  }
  // The planting: each bed dug over and edged, its plants put in; the trees brought on the lorry,
  // each hole dug, the tree lowered in and the earth trodden round it; the hedges and the fence.
  function jwPlant(plan, list, crew, t0, scale) {
    var J = jbJ(plan), P = J.P, S = J.S, t = t0;
    var beds = list.filter(function (e) { return e.subs.bed || e.subs.plant; }), trees = list.filter(function (e) { return e.subs.tree; });
    var fences = list.filter(function (e) { return e.subs.fence; });
    if (trees.length) {
      // the lorry with the trees, at the kerb till they are all in
      var first = jwMid(trees[0]);
      try {
        var lorry = jbVehicle(plan, "pickup", { len: 5.6 * P, wid: 2.0 * P, target: [first[0], S.kerb + 1.2 * P], street: true, t0: t - 20, t1: t + trees.length * 8 * scale + 60 }, { paint: "#3f7a4a" });
        jbCome(plan, lorry, lorry.stand, 5.6 * P, t, { speed: 7 });
        lorry.here = t;
        J.jwLorry = lorry;
      } catch (err) { J.jwLorry = null; }
    }
    beds.forEach(function (e, i) {
      var w = crew[i % crew.length], m = jwMid(e), at = jbWorld(J, [m[0], e.b + 0.6 * P], 0), dig = Math.max(2, Math.min(14, (e.r - e.l) * (e.b - e.t) / (P * P) * 0.12)) * scale;
      // (2026-10-05: "dollies, forklifts, the works") the soil wheeled to it in a barrow, shovelled in at the
      // landscaper's lorry; the barrow back for the mulch once it is planted (40-works-haul.js)
      var src = jbWorld(J, [J.jwLorry && J.jwLorry.stand ? J.jwLorry.stand.x : m[0], S.kerb - 1.5 * P], 0), toBed = wkFace(src, at);
      wkGo(plan, w, src, { after: t });
      wkDo(w, 1.4 * scale, "shovel", toBed + Math.PI);
      wkGo(plan, w, at, { carry: { kind: "barrow", load: "soil" } });
      wkDo(w, dig, "kneel", wkFace(at, jbWorld(J, m, 0)));
      (e.subs.bed || []).forEach(function (b) { wkReveal(plan, b.key, w.free - dig * 0.6, w.free - dig * 0.2, "fade"); });
      var plants = e.subs.plant || [];
      plants.forEach(function (p, k) { var at2 = w.free - dig * 0.3 + (k / Math.max(1, plants.length)) * dig * 0.5; wkReveal(plan, p.key, at2, at2 + 0.6, "drop", { drop: 0.25 * P }); });
      wkGo(plan, w, src, { carry: { kind: "barrow", load: "none" } });
      wkDo(w, 1.0 * scale, "shovel", toBed + Math.PI);
      wkGo(plan, w, at, { carry: { kind: "barrow", load: "mulch" } });
      wkDo(w, dig * 0.5, "kneel", wkFace(at, jbWorld(J, m, 0)));
    });
    trees.forEach(function (e, i) {
      var w = crew[i % crew.length], m = jwMid(e), at = jbWorld(J, [m[0] + 1.0 * P, m[1] + 0.4 * P], 0);
      wkGo(plan, w, at, { after: t, carry: { kind: "board", n: 1, len: 1.2 } });
      wkDo(w, 3 * scale, "kneel", wkFace(at, jbWorld(J, m, 0)));
      e.subs.tree.forEach(function (tr) { wkReveal(plan, tr.key, w.free, w.free + 2 * scale, "drop", { drop: 2.2 * P }); });
      wkDo(w, 2.4 * scale, "hold", wkFace(at, jbWorld(J, m, 0)));
      wkDo(w, 1.6 * scale, "kneel", wkFace(at, jbWorld(J, m, 0)));
    });
    // the lawn: laid in strips over the bare earth, the back of the lot first
    var lawns = list.filter(function (e) { return e.subs.lawn; });
    if (lawns.length) { jwLawn(plan, lawns[0], list, crew, wkTogether(crew, t)); }
    if (J.jwLorry) {
      var done = wkTogether(crew, t);
      try { J.jwLorry.here = Math.max(J.jwLorry.here, done); jbGo(plan, J.jwLorry, done + 1, { speed: 7 }); } catch (err) { /* gone */ }
    }
    // the fence: post by post along each run
    fences.forEach(function (e, i) {
      var w = crew[i % crew.length];
      (e.subs.fence || []).forEach(function (g) {
        var lc = jwLocalOf(S, g.G), at = jbWorld(J, [lc[0], lc[1] + 0.7 * P], 0);
        wkGo(plan, w, at, { after: t, carry: { kind: "board", n: 2, len: 1.8 } });
        wkDo(w, 2.4 * scale, "hammer", wkFace(at, jbWorld(J, lc, 0)));
        wkReveal(plan, g.key, w.free - 1.6 * scale, w.free, "drop", { drop: 0.6 * P });
      });
    });
    return wkTogether(crew, t);
  }
  // (2026-10-05: "make the lawn get laid in strips") The lawn in rows across the lot from its back
  // to the street, each a strip of turf unrolled by one of the crew walking it end to end -- round the
  // building, the paving, the beds, a pool -- the bare earth showing in the seams between till the last
  // is down; then the lawn itself.  The strips are the lot's own face cut to them, so the same green.
  var JW_STRIP = 1.2;                                     // metres: a strip of turf, two rolls wide
  function jwLawn(plan, lot, list, crew, t0) {
    var J = jbJ(plan), P = J.P, S = J.S, site = J.site;
    var G0 = plan.groups[lot.subs.lawn[0].key], tpl = G0 && G0.faces && G0.faces[0];
    if (!tpl) { return t0; }
    var z0 = (tpl.pts || []).reduce(function (m, q) { return Math.max(m, q[2] || 0); }, -Infinity);
    var back = lot.t, front = Math.min(lot.b, S.hy), left = lot.l, right = lot.r;
    if (!(front - back > 2 * P) || !(right - left > 2 * P)) { return t0; }
    // what the turf goes round: the building, the site's own pieces but the lawn and the cars, the garden's (yard:)
    var keep = [];
    (site.levels[0] ? site.levels[0].rooms : []).forEach(function (o) {
      var r = o.r, cx = r.x + (o.dx || 0), cy = r.y + (o.dy || 0), l = Infinity, rr = -Infinity, tt = Infinity, b = -Infinity;
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (q) { var p = S.L(cx + q[0] * r.w / 2, cy + q[1] * r.h / 2); l = Math.min(l, p[0]); rr = Math.max(rr, p[0]); tt = Math.min(tt, p[1]); b = Math.max(b, p[1]); });
      keep.push([l - 0.2 * P, rr + 0.2 * P, tt - 0.2 * P, b + 0.2 * P]);
    });
    list.forEach(function (e) { if (!e.subs.lawn && !e.subs.car) { keep.push([e.l - 0.1 * P, e.r + 0.1 * P, e.t - 0.1 * P, e.b + 0.1 * P]); } });
    Object.keys(plan.groups).forEach(function (k) {
      if (k.indexOf("yard:") !== 0) { return; }
      var G = plan.groups[k], a = S.L(G.x0, G.y0), b = S.L(G.x1, G.y1);
      keep.push([Math.min(a[0], b[0]) - 0.1 * P, Math.max(a[0], b[0]) + 0.1 * P, Math.min(a[1], b[1]) - 0.1 * P, Math.max(a[1], b[1]) + 0.1 * P]);
    });
    function kept(x, y) { return keep.some(function (k) { return x > k[0] && x < k[1] && y > k[2] && y < k[3]; }); }
    // the strips: as many as the crew lays in about three rounds, never narrower than two rolls
    var n = Math.max(crew.length, Math.min(crew.length * 3, Math.round((front - back) / (JW_STRIP * P)))), wide = (front - back) / n;
    var cell = JW_STRIP * P, strips = [];
    for (var i = 0; i < n; i++) {
      var y0 = back + i * wide, y1 = y0 + wide, ym = (y0 + y1) / 2, runs = [], run = null;
      for (var x = left; x < right - 1; x += cell) {
        var x1 = Math.min(right, x + cell);
        if (kept((x + x1) / 2, ym)) { run = null; continue; }
        if (run) { run[1] = x1; } else { run = [x, x1]; runs.push(run); }
      }
      if (runs.length) { strips.push({ y0: y0 + 0.03 * P, y1: y1 - 0.03 * P, x0: runs[0][0], x1: runs[runs.length - 1][1], runs: runs }); }
    }
    if (!strips.length) { return t0; }
    // each unrolled by one of the crew: to its far end, then walked back along it to the near end
    strips.forEach(function (st, k) {
      var w = crew[k % crew.length], ym = (st.y0 + st.y1) / 2, a = jbWorld(J, [st.x1 - 0.4 * P, ym], 0), b = jbWorld(J, [st.x0 + 0.4 * P, ym], 0);
      wkGo(plan, w, a, { after: t0, carry: { kind: "sheet", w: 0.6, h: 1.2, how: { piece: true, color: "#5f8a3a", edge: "#3f6a26", pat: 6 } } });
      st.ts = w.free;
      wkGo(plan, w, b, { straight: true, pose: "kneel" });
      st.te = Math.max(st.ts + 0.5, w.free);
    });
    var tEnd = strips.reduce(function (m, st) { return Math.max(m, st.te); }, t0) + 0.5;
    var flat = !(typeof TERR !== "undefined" && TERR && TERR.mesh && !TERR.off);
    function zAt(lx, ly) {
      if (flat) { return z0 + 0.012 * P; }
      var wp = S.W(lx, ly);
      return (typeof jbGround === "function" ? jbGround(wp[0], wp[1]) : z0) + 0.012 * P;
    }
    // (the turf its own green -- the lot's face, kept as ground, came out pale, the lot's white in it)
    var lawnLook = typeof worldLawn === "function" ? worldLawn() : null, sheetC = gl3Rgb(typeof simSheet === "function" ? simSheet() : "#ffffff");
    var turfC = gl3Mix(lawnLook ? lawnLook.color : [0.4, 0.6, 0.28], sheetC, 0.12);
    var hex = "#" + turfC.map(function (v) { return ("0" + Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16)).slice(-2); }).join("");
    var TURF = { piece: true, color: hex, edge: hex, pat: lawnLook ? lawnLook.pat : 6 };
    function quad(faces, x0, x1, y0, y1) {
      var c = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].map(function (q) { var wp = S.W(q[0], q[1]); return [wp[0], wp[1], zAt(q[0], q[1])]; });
      faces.push({ pts: c, n: [0, 0, 1], how: TURF, moves: true });
    }
    wkPiece(plan, strips[0].ts, [], { t1: tEnd, live: function (faces, T) {
      strips.forEach(function (st) {
        if (T < st.ts) { return; }
        // (from the far end back toward the near: as far as its layer has come)
        var at = st.x1 - (st.x1 - st.x0) * wkClamp((T - st.ts) / (st.te - st.ts));
        st.runs.forEach(function (r) { var lo = Math.max(r[0], at); if (r[1] - lo > 0.05 * P) { quad(faces, lo, r[1], st.y0, st.y1); } });
      });
    } });
    // (the bare earth its own piece, under the strips from the start: the lot's face, kept as ground,
    // came out olive -- the lawn's green mixed into it)
    var dirt = Object.assign({}, tpl, { how: JW_DIRT, src: null });
    delete dirt.ground;
    wkPiece(plan, 0, [dirt], { t1: tEnd });
    lot.subs.lawn.forEach(function (g) { wkReveal(plan, g.key, tEnd, tEnd, "pop"); });
    plan.jwLawnAt = tEnd;
    return tEnd;
  }
  // The lamp posts, the racks, the bins, the box for the post: carried over, stood up, bolted down.
  function jwFix(plan, list, crew, t0, scale) {
    var J = jbJ(plan), P = J.P, S = J.S, t = t0;
    list.filter(function (e) { return e.subs.fix; }).forEach(function (e, i) {
      var w = crew[i % crew.length], m = jwMid(e), at = jbWorld(J, [m[0] + 0.9 * P, m[1]], 0), tall = e.node && (e.node.kind === "i_lamppost" || e.node.kind === "i_pathlight");
      wkGo(plan, w, at, { after: t, carry: tall ? { kind: "board", n: 1, len: 2.4 } : { kind: "sheet", w: 0.6, h: 0.8, how: { piece: true, color: "#3f7a4a", edge: "#2d5a36", pat: 27 } } });
      wkDo(w, 1.6 * scale, "hold", wkFace(at, jbWorld(J, m, 0)));
      e.subs.fix.forEach(function (g) { wkReveal(plan, g.key, w.free - 1.2 * scale, w.free, "drop", { drop: (tall ? 1.4 : 0.5) * P }); });
      wkDo(w, 1.8 * scale, "kneel", wkFace(at, jbWorld(J, m, 0)));
    });
    return wkTogether(crew, t);
  }
  function jwSite(plan) {
    var J = jbJ(plan), P = J.P, S = J.S, list = jwPieces(plan), t0 = plan.T;
    if (!list.length || !J.crew || !J.crew.length) { return; }
    // (as much time as it takes, kept to a share of the whole: the site's own work, not half the build)
    var area = 0;
    list.forEach(function (e) { if (!e.subs.lawn && !e.subs.car) { area += (e.r - e.l) * (e.b - e.t) / (P * P); } });
    var want = area * 0.12 + list.length * 5, cap = Math.max(40, t0 * 0.16), scale = Math.max(0.35, Math.min(1, cap / Math.max(1, want)));
    var pool = J.crew.slice().sort(function (a, b) { return a.free - b.free; });
    var paveCrew = pool.slice(0, Math.min(4, pool.length)), plantCrew = pool.slice(4, 7), fixCrew = pool.slice(7, 9);
    if (!plantCrew.length) { plantCrew = paveCrew.slice(0, 2); }
    if (!fixCrew.length) { fixCrew = plantCrew.slice(0, 1); }
    var paved = list.filter(function (e) { return e.subs.pave || e.subs.kerb || e.subs.stripe; })
      .sort(function (a, b) { return (b.r - b.l) * (b.b - b.t) - (a.r - a.l) * (a.b - a.t); });
    // (the crew's pickups parked on the drive or the lot: moved out to the kerb before it is paved --
    // nothing stands where the paver is to go)
    (J.pickups || []).forEach(function (m, i) {
      var st = m.stand;
      if (!st || !paved.some(function (e) { return st.x > e.l - 1.5 * P && st.x < e.r + 1.5 * P && st.y > e.t - 1.5 * P && st.y < e.b + 1.5 * P; })) { return; }
      try {
        var leave = Math.max(m.here || 0, t0 - 14);
        jbGo(plan, m, leave, { speed: 6 });
        var lotHw = J.site.lot ? J.site.lot.w / 2 : 20 * P, side = i % 2 ? 1 : -1;
        var again = jbVehicle(plan, "pickup", { len: 5.6 * P, wid: 2.0 * P, target: [side * (lotHw + 7 * P + Math.floor(i / 2) * 6.5 * P), S.kerb + 1.2 * P], street: true, t0: leave, t1: 1e9 }, m.opt);
        jbCome(plan, again, again.stand, 5.6 * P, leave + 12, { speed: 6 });
        wkReserve(plan, again.stand, leave + 10, 1e9);
      } catch (e2) { /* left where it was */ }
    });
    var t = t0;
    paved.forEach(function (e) { t = jwPave(plan, e, paveCrew, t, scale); });
    var tPave = t;
    if (paved.length) { wkSay(plan, "jw_pave", t0, tPave); }
    // the walks after the paving, by the paving crew
    var tWalk = jwWalks(plan, list, paveCrew, tPave, scale);
    if (tWalk > tPave + 0.5) { wkSay(plan, "jw_walks", tPave, tWalk); }
    // the planting and the fitting alongside
    var tPlant = jwPlant(plan, list, plantCrew, t0, scale);
    if (tPlant > t0 + 0.5) { wkSay(plan, "jw_plant", t0, tPlant); }
    var tFix = jwFix(plan, list, fixCrew, Math.max(t0, tPave - 10), scale);
    if (tFix > t0 + 0.5) { wkSay(plan, "jw_fix", Math.max(t0, tPave - 10), tFix); }
    plan.T = Math.max(plan.T, tWalk, tPlant, tFix);
    plan.jwAt = [t0, plan.T];
  }
  // The cars, the building open: parked one after another once the site is cleared.
  function jwCars(plan) {
    var list = jwPieces(plan).filter(function (e) { return e.subs.car; });
    if (!list.length) { return; }
    var t0 = plan.T, rnd = wkRand(list.length * 31 + 7);
    list.forEach(function (e, i) {
      var at = t0 + 1 + i * 0.9 + rnd() * 0.6;
      e.subs.car.forEach(function (g) { wkReveal(plan, g.key, at, at + 0.8, "fade"); });
    });
    plan.T = t0 + 2 + list.length * 0.9;
    wkSay(plan, "jw_open", t0, plan.T);
  }
  function jwLawnBare() {
    var p = typeof WK === "object" ? WK.plan : null;
    return !!(typeof bpSite !== "undefined" && bpSite && p && p.bp === bpSite && p.done && p.jwLawnAt && (p.now || 0) < p.jwLawnAt);
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyJw = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyJw.apply(this, arguments) + (jwLawnBare() ? "|bare" : ""); };
  }
  if (typeof WK_PHASES === "object") {
    var jwAt = -1;
    WK_PHASES.forEach(function (ph, i) { if (jwAt < 0 && ph.name === "movein") { jwAt = i; } });
    var jwPhase = { name: "site", make: jwSite };
    if (jwAt >= 0) { WK_PHASES.splice(jwAt, 0, jwPhase); } else { WK_PHASES.push(jwPhase); }
    WK_PHASES.push({ name: "cars", make: jwCars });
  }
