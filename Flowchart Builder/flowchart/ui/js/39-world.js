// ---------------------------------------------------------------------------
//  39-world.js -- the world round a house in 3D: the land it stands in
//  (plains, hills, mountains, a forest, a lake, the beach, the desert, the
//  tropics, a snowfield, a city), the street lamps' design, the houses
//  next door and across the street, people out walking and cars going by,
//  and how far from your own lot you may walk
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "update the world so your character can not go
  // too far from their property", "update the streetlight so they can be
  // different designs", "the landscape to also be different depending on
  // like plains, mountains, beach etc", "simulate the house inside of a
  // neighborhood as well with people")
  //
  // Kept with the house in `hand.house` (39-house.js), like the street and
  // the trees: the land, the lamps, the neighbors, the people, the lot's
  // edge.  The scenery (gl3Scenery, 38-view3d-gl.js) asks here for each of
  // its parts, and draws its own where the answer is no.
  var WORLD_SCAPES = ["plains", "hills", "mountains", "forest", "lake", "beach", "desert", "tropics", "arctic", "city"];
  var WORLD_LAMPS = ["classic", "lantern", "cobra", "twin", "modern", "globe", "none"];
  Object.assign(HOUSE_PLAIN, { scape: "plains", lamps: "classic", hood: false, folk: false, bound: true });
  function worldScape() { var s = houseOpt("scape"); return WORLD_SCAPES.indexOf(s) >= 0 ? s : "plains"; }
  function worldLampKind() { var s = houseOpt("lamps"); return WORLD_LAMPS.indexOf(s) >= 0 ? s : "classic"; }

  // What each land is like: the ground's color and its pattern (the
  // shader's, 38-view3d-gl.js), what a garden on it is, what grows round
  // about and how thickly, the skyline, and water.
  var WORLD_LOOK = {
    plains:    { ground: [0.56, 0.67, 0.35], pat: 3, grow: { broad: 4, bush: 5, fir: 1 }, dense: 0.55, sky: "plains" },
    hills:     { ground: [0.45, 0.63, 0.32], pat: 3, grow: { broad: 5, fir: 2, bush: 2 }, dense: 1, sky: "hills" },
    mountains: { ground: [0.42, 0.56, 0.34], pat: 3, grow: { fir: 8, broad: 1, rock: 3 }, dense: 1.3, sky: "peaks" },
    forest:    { ground: [0.34, 0.48, 0.27], pat: 3, grow: { fir: 5, broad: 4, birch: 2, bush: 2 }, dense: 3, sky: "woods" },
    lake:      { ground: [0.45, 0.62, 0.33], pat: 3, grow: { broad: 4, fir: 3, birch: 2 }, dense: 1.1, sky: "hills", water: "lake" },
    beach:     { ground: [0.88, 0.8, 0.62], pat: 71, lawn: [[0.85, 0.77, 0.58], 71], grow: { palm: 6, dune: 3 }, dense: 0.8, sky: "sea", water: "sea" },
    desert:    { ground: [0.84, 0.68, 0.49], pat: 71, lawn: [[0.77, 0.67, 0.55], 10], grow: { cactus: 6, rock: 4, dry: 3 }, dense: 0.75, sky: "mesas" },
    tropics:   { ground: [0.34, 0.58, 0.27], pat: 3, grow: { palm: 6, broad: 3, bush: 4 }, dense: 1.7, sky: "volcano" },
    arctic:    { ground: [0.93, 0.95, 0.98], pat: 72, lawn: [[0.94, 0.95, 0.98], 72], grow: { fir: 6, rock: 2 }, dense: 0.7, sky: "peaks", snow: true },
    city:      { ground: [0.5, 0.6, 0.38], pat: 3, grow: { broad: 3 }, dense: 0.3, sky: "towers" }
  };
  function worldLook() { return WORLD_LOOK[worldScape()]; }
  // A garden where the land is sand or snow is not a mown lawn.
  function worldLawn() { var L = worldLook(); return L.lawn ? { color: L.lawn[0], pat: L.lawn[1] } : null; }
  // In a snowfield the snow lies whatever the weather.
  if (typeof houseSnow === "function") {
    var houseSnowWeather = houseSnow;
    houseSnow = function () { return worldLook().snow ? 1 : houseSnowWeather(); };
  }
  // The scenery is made again when any of this changes.
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyHouse = houseSceneKey;
    houseSceneKey = function () {
      return houseSceneKeyHouse() + "|" + [worldScape(), worldLampKind(), houseOpt("hood") ? 1 : 0].join(",");
    };
  }

  // ---- shapes, any way round -------------------------------------------------------------
  function worldN(p, q, r) {              // the way out of a three-cornered face
    var ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2], vx = r[0] - p[0], vy = r[1] - p[1], vz = r[2] - p[2];
    var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
    return [nx / l, ny / l, nz / l];
  }
  function worldFace(v, pts, c, pat, up) {
    var n = worldN(pts[0], pts[1], pts[2]);
    if (up && n[2] < 0) { n = [-n[0], -n[1], -n[2]]; }
    gl3Poly(v, pts, n, c, 1, null, pat);
  }
  // A box standing on the ground, turned: its middle, half its length
  // along `e` and half its width along `d` (both unit, across each other).
  function worldBox(v, c0, e, d, hx, hy, z0, z1, col, pat, noTop) {
    var pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (s) {
      return [c0[0] + e[0] * hx * s[0] + d[0] * hy * s[1], c0[1] + e[1] * hx * s[0] + d[1] * hy * s[1]];
    });
    for (var i = 0; i < 4; i++) {
      var a = pts[i], b = pts[(i + 1) % 4], mx = (a[0] + b[0]) / 2 - c0[0], my = (a[1] + b[1]) / 2 - c0[1], l = Math.hypot(mx, my) || 1;
      gl3Poly(v, [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], [mx / l, my / l, 0], col, 1, null, pat);
    }
    if (!noTop) { gl3Poly(v, pts.map(function (p) { return [p[0], p[1], z1]; }), [0, 0, 1], col, 1, null, pat); }
  }
  // A round post from one point to another, as wide as asked at each end.
  function worldTube(v, a, b, r0, r1, sides, c, pat) {
    var ax = b[0] - a[0], ay = b[1] - a[1], az = b[2] - a[2], l = Math.hypot(ax, ay, az) || 1;
    ax /= l; ay /= l; az /= l;
    var ux, uy, uz;                      // one way across it, then the other
    if (Math.abs(az) < 0.9) { ux = -ay; uy = ax; uz = 0; } else { ux = 1; uy = 0; uz = 0; }
    var ul = Math.hypot(ux, uy, uz); ux /= ul; uy /= ul; uz /= ul;
    var wx = ay * uz - az * uy, wy = az * ux - ax * uz, wz = ax * uy - ay * ux;
    for (var i = 0; i < sides; i++) {
      var t0 = i / sides * Math.PI * 2, t1 = (i + 1) / sides * Math.PI * 2, tm = (t0 + t1) / 2;
      function ring(t, at, r) {
        var cx = Math.cos(t) * r, cy = Math.sin(t) * r;
        return [at[0] + ux * cx + wx * cy, at[1] + uy * cx + wy * cy, at[2] + uz * cx + wz * cy];
      }
      var nx = ux * Math.cos(tm) + wx * Math.sin(tm), ny = uy * Math.cos(tm) + wy * Math.sin(tm), nz = uz * Math.cos(tm) + wz * Math.sin(tm);
      gl3Poly(v, [ring(t0, a, r0), ring(t1, a, r0), ring(t1, b, r1), ring(t0, b, r1)], [nx, ny, nz], c, 1, null, pat);
    }
  }
  // A round lump, flattened as much as asked.
  function worldBall(v, at, R, squash, c, pat) {
    GL3_BLOB.forEach(function (t) {
      var n = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, (t[0][2] + t[1][2] + t[2][2]) / 3];
      var l = Math.hypot(n[0], n[1], n[2]);
      gl3Poly(v, t.map(function (p) { return [at[0] + p[0] * R, at[1] + p[1] * R, at[2] + p[2] * R * squash]; }),
              [n[0] / l, n[1] / l, n[2] / l], c, 1, null, pat);
    });
  }
  // Keeping only the part of a flat shape between two lines across `d`
  // (from `o`, `lo` to `hi` along it).
  function worldClip(poly, o, d, lo, hi) {
    function cut(pts, keep) {
      var out = [];
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i], q = pts[(i + 1) % pts.length], fp = keep(p), fq = keep(q);
        if (fp >= 0) { out.push(p); }
        if ((fp >= 0) !== (fq >= 0)) {
          var k = fp / (fp - fq);
          out.push([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k]);
        }
      }
      return out;
    }
    function u(p) { return (p[0] - o[0]) * d[0] + (p[1] - o[1]) * d[1]; }
    var out = poly;
    if (lo !== null) { out = cut(out, function (p) { return u(p) - lo; }); }
    if (hi !== null && out.length >= 3) { out = cut(out, function (p) { return hi - u(p); }); }
    return out.length >= 3 ? out : null;
  }

  // ---- the ground, and water ----------------------------------------------------------------
  // Which way is behind the house -- away from the street -- and where its
  // back is: the sea and the lake lie that way.
  function worldBack(L) {
    if (L.lot) {
      var a = L.lotWorld(0, -L.lot.h / 2, 0), b = L.lotWorld(0, -L.lot.h / 2 - 1, 0);
      return { o: a, d: [b[0] - a[0], b[1] - a[1]] };
    }
    return { o: [L.mid[0], L.bounds[2] - 6 * FLOOR_PX], d: [0, -1] };
  }
  var WORLD_SHORE = { sea: [14, 4, 1.4], lake: [9, 2, 0] };      // metres: shore past the back of the lot, wet sand, surf
  function worldGround(v, L) {
    var look = worldLook(), P = FLOOR_PX, c = gl3Mix(look.ground, L.sheetC, 0.12), pat = look.pat;
    if (gl3SnowNow) { c = gl3Mix(c, [0.93, 0.94, 0.97], 0.88); pat = 72; }
    else if (typeof houseWet === "function" && houseWet()) { c = gl3Mix(c, [0, 0, 0], 0.12); }
    var disc = [];
    for (var k = 0; k < 72; k++) {
      var t = k / 72 * Math.PI * 2;
      disc.push([L.mid[0] + Math.cos(t) * L.groundR, L.mid[1] + Math.sin(t) * L.groundR, -3]);
    }
    if (!look.water) { gl3Poly(v, disc, [0, 0, 1], c, 1, null, pat); return true; }
    var B = worldBack(L), S = WORLD_SHORE[look.water], shore = S[0] * P, wet = S[1] * P, surf = S[2] * P;
    var lake = look.water === "lake", far = lake ? shore + 190 * P : null;
    var water = lake ? gl3Mix([0.2, 0.38, 0.4], L.sheetC, 0.08) : gl3Mix([0.16, 0.4, 0.52], L.sheetC, 0.08);
    var damp = lake ? gl3Mix(c, [0.25, 0.3, 0.18], 0.4) : gl3Mix(c, [0.55, 0.47, 0.36], 0.45);
    if (gl3SnowNow) { water = gl3Mix(water, [0.75, 0.82, 0.86], 0.35); }
    function put(lo, hi, col, p) { var part = worldClip(disc, B.o, B.d, lo, hi); if (part) { gl3Poly(v, part, [0, 0, 1], col, 1, null, p); } }
    put(null, shore - wet, c, pat);
    put(shore - wet, shore, damp, pat);
    if (surf) { put(shore, shore + surf, gl3Mix(water, [0.92, 0.95, 0.96], 0.7), 9); }
    put(shore + surf, far, water, 9);
    if (far) { put(far, null, c, pat); }
    // nothing grows in the water, or on the wet sand
    L.keepOff.push(function (p) {
      var u = (p[0] - B.o[0]) * B.d[0] + (p[1] - B.o[1]) * B.d[1];
      return u > shore - wet - 1.5 * P && (far === null || u < far + 3 * P);
    });
    L.water = { o: B.o, d: B.d, from: shore, to: far };
    return true;
  }

  // ---- what grows -------------------------------------------------------------------------------
  function worldPick(weights, rnd) {
    var keys = Object.keys(weights), sum = 0;
    keys.forEach(function (k) { sum += weights[k]; });
    var at = rnd() * sum;
    for (var i = 0; i < keys.length; i++) { at -= weights[keys[i]]; if (at <= 0) { return keys[i]; } }
    return keys[keys.length - 1];
  }
  function worldPlant(v, kind, at, rnd, sheetC) {
    var P = FLOOR_PX, snow = gl3SnowNow;
    function white(c, k) { return snow ? gl3Mix(c, [0.93, 0.95, 0.98], k * snow) : c; }
    if (kind === "broad" || kind === "fir") { gl3Tree(v, at, rnd, sheetC, kind === "fir"); return; }
    if (kind === "birch") {
      var tall = (3.2 + rnd() * 2) * P;
      worldTube(v, [at[0], at[1], 0], [at[0], at[1], tall], 0.11 * P, 0.07 * P, 6, gl3Mix([0.9, 0.89, 0.85], sheetC, 0.08), PAT.bark);
      var leaf = white(gl3Mix([0.5, 0.66, 0.3], sheetC, 0.08), 0.5);
      worldBall(v, [at[0], at[1], tall - 0.2 * P], 1.1 * P, 1.3, leaf, PAT.leaves);
      worldBall(v, [at[0] + 0.4 * P, at[1], tall - 1.2 * P], 0.85 * P, 1.2, gl3Mix(leaf, [0, 0, 0], 0.06), PAT.leaves);
      return;
    }
    if (kind === "palm") { worldPalm(v, at, rnd, sheetC); return; }
    if (kind === "cactus") { worldCactus(v, at, rnd, sheetC); return; }
    if (kind === "rock") {
      var R = (0.4 + Math.pow(rnd(), 2) * 1.6) * P, rc = gl3Mix(worldScape() === "desert" ? [0.66, 0.46, 0.34] : [0.56, 0.56, 0.54], sheetC, 0.1);
      worldBall(v, [at[0], at[1], R * 0.12], R, 0.55 + rnd() * 0.2, white(rc, 0.4), 73);
      return;
    }
    // a bush; on the dunes, grass in tufts; in the desert, dry scrub
    var bc = kind === "dune" ? [0.66, 0.68, 0.42] : kind === "dry" ? [0.55, 0.53, 0.36] : [0.3 + rnd() * 0.1, 0.5 + rnd() * 0.1, 0.26];
    var br = (kind === "dune" ? 0.35 : 0.45 + rnd() * 0.45) * P;
    worldBall(v, [at[0], at[1], br * 0.3], br, kind === "dune" ? 0.9 : 0.7, white(gl3Mix(bc, sheetC, 0.08), 0.6), PAT.leaves);
  }
  // A palm: its trunk in rings, bending as it goes up, and fronds hanging
  // from the top, a few coconuts under them.
  function worldPalm(v, at, rnd, sheetC) {
    var P = FLOOR_PX, tall = (4.2 + rnd() * 3.4) * P, lean = (rnd() - 0.3) * 0.28, dir = rnd() * Math.PI * 2;
    var bark = gl3Mix([0.56, 0.46, 0.34], sheetC, 0.1), leaf = gl3Mix([0.27, 0.53, 0.24], sheetC, 0.08);
    var x = at[0], y = at[1], z = 0, r = 0.19 * P;
    for (var s = 1; s <= 7; s++) {
      var k = s / 7, bend = lean * k * k * tall;
      var nx = at[0] + Math.cos(dir) * bend, ny = at[1] + Math.sin(dir) * bend, nz = tall * k;
      worldTube(v, [x, y, z], [nx, ny, nz], r, r * 0.94, 6, gl3Mix(bark, [0, 0, 0], s % 2 ? 0.08 : 0), PAT.bark);
      x = nx; y = ny; z = nz; r *= 0.94;
    }
    var top = [x, y, z];
    for (var f = 0; f < 9; f++) {
      var a = f / 9 * Math.PI * 2 + rnd() * 0.3, len = (2.3 + rnd() * 0.9) * P, w = 0.42 * P, ca = Math.cos(a), sa = Math.sin(a);
      var mid = [x + ca * len * 0.5, y + sa * len * 0.5, z + 0.32 * P], tip = [x + ca * len, y + sa * len, z - (0.8 + rnd() * 0.6) * P];
      var side = [-sa * w, ca * w], c = gl3Mix(leaf, [0, 0, 0], (f % 3) * 0.05);
      worldFace(v, [top, [mid[0] + side[0], mid[1] + side[1], mid[2] - 0.08 * P], mid], c, PAT.leaves, true);
      worldFace(v, [top, mid, [mid[0] - side[0], mid[1] - side[1], mid[2] - 0.08 * P]], c, PAT.leaves, true);
      worldFace(v, [[mid[0] + side[0], mid[1] + side[1], mid[2] - 0.08 * P], tip, mid], c, PAT.leaves, true);
      worldFace(v, [mid, tip, [mid[0] - side[0], mid[1] - side[1], mid[2] - 0.08 * P]], c, PAT.leaves, true);
    }
    for (var n = 0; n < 3; n++) {
      var t = n / 3 * Math.PI * 2 + 0.4;
      worldBall(v, [x + Math.cos(t) * 0.18 * P, y + Math.sin(t) * 0.18 * P, z - 0.2 * P], 0.11 * P, 1, gl3Mix([0.42, 0.33, 0.2], sheetC, 0.1), PAT.plain);
    }
  }
  // A saguaro: a ribbed column, rounded at the top, and its arms.
  function worldCactus(v, at, rnd, sheetC) {
    var P = FLOOR_PX, tall = (2.4 + rnd() * 2.6) * P, r = (0.26 + rnd() * 0.08) * P;
    var c = gl3Mix([0.34, 0.5, 0.31], sheetC, 0.08);
    worldTube(v, [at[0], at[1], 0], [at[0], at[1], tall], r, r * 0.95, 9, c, PAT.leaves);
    worldBall(v, [at[0], at[1], tall], r * 0.95, 1, c, PAT.leaves);
    var arms = rnd() < 0.2 ? 0 : 1 + Math.floor(rnd() * 2.4);
    for (var i = 0; i < arms; i++) {
      var a = rnd() * Math.PI * 2, h0 = tall * (0.32 + rnd() * 0.28), out = (0.6 + rnd() * 0.25) * P, up = (1.0 + rnd() * 1.1) * P;
      var ex = at[0] + Math.cos(a) * out, ey = at[1] + Math.sin(a) * out, ar = r * 0.68;
      worldTube(v, [at[0], at[1], h0], [ex, ey, h0], ar, ar, 7, c, PAT.leaves);
      worldBall(v, [ex, ey, h0], ar, 1, c, PAT.leaves);
      worldTube(v, [ex, ey, h0], [ex, ey, h0 + up], ar, ar * 0.95, 7, c, PAT.leaves);
      worldBall(v, [ex, ey, h0 + up], ar * 0.95, 1, c, PAT.leaves);
    }
  }
  // Round about, as the land has it: so many, of these kinds.
  function worldGrow(v, L, inner, outer, count) {
    var look = worldLook(), rnd = L.rnd;
    count = Math.round(count * look.dense);
    for (var i = 0, tries = 0; i < count && tries < count * 14; tries++) {
      var ang = rnd() * Math.PI * 2, far = inner + Math.pow(rnd(), 0.8) * (outer - inner);
      var at = [L.mid[0] + Math.cos(ang) * far, L.mid[1] + Math.sin(ang) * far];
      if (L.keepOff.some(function (off) { return off(at); })) { continue; }
      worldPlant(v, worldPick(look.grow, rnd), at, rnd, L.sheetC);
      i++;
    }
    // over the lake, a line of trees along the far shore (once: with the near trees, 38-view3d-gl.js)
    if (L.growFar) { return true; }
    if (L.water && L.water.to && houseOpt("trees")) {
      var dl = Math.hypot(L.water.d[0], L.water.d[1]) || 1, dx = L.water.d[0] / dl, dy = L.water.d[1] / dl;
      for (var s2 = 0; s2 < 80; s2++) {
        var along = (rnd() - 0.5) * 2 * L.groundR * 0.7, back = L.water.to + (3 + rnd() * 40) * FLOOR_PX;
        var spot = [L.water.o[0] + dx * back - dy * along, L.water.o[1] + dy * back + dx * along];
        if (Math.hypot(spot[0] - L.mid[0], spot[1] - L.mid[1]) > L.groundR * 0.95) { continue; }
        worldPlant(v, worldPick(look.grow, rnd), spot, rnd, L.sheetC);
      }
    }
    // where it is a forest, trees right up to the lot's edge as well
    if (look.dense >= 2 && L.lot && houseOpt("trees")) {
      var P = FLOOR_PX, lot = L.lot;
      for (var j = 0, t2 = 0; j < 90 && t2 < 900; t2++) {
        var lx = (rnd() - 0.5) * (lot.w + 120 * P), ly = -lot.h / 2 - rnd() * 30 * P + 4 * P;
        if (Math.abs(lx) < lot.w / 2 + 2 * P && ly > -lot.h / 2 - 2 * P) { continue; }
        var p = L.lotWorld(lx, ly, 0);
        if (L.keepOff.some(function (off) { return off(p); })) { continue; }
        worldPlant(v, worldPick(look.grow, rnd), p, rnd, L.sheetC);
        j++;
      }
    }
    return true;
  }

  // ---- the skyline ------------------------------------------------------------------------------
  // A ring of land rising from `rIn` to `rOut`, as high at each angle as
  // `high` says, unless `skip` says that way is the sea -- in rows, each
  // part of the way out and part of the way up (give or take), so a range
  // of mountains has its shoulders and its gullies, not one smooth sheet.
  function worldRing(v, L, rIn, rOut, n, high, col, pat, skip, rows, rnd) {
    rows = rows || [[0, 0, 0], [1, 1, 0]];
    var tops = [], jit = [];
    for (var h = 0; h <= n; h++) {
      var th = h / n * Math.PI * 2;
      tops.push([th, high(th, h)]);
    }
    for (var q = 0; q < n; q++) {
      jit.push(rows.map(function (R) { return R[2] && rnd ? (rnd() - 0.5) * 2 * R[2] : 0; }));
    }
    var m = L.mid;
    function pt(q, j) {
      var th = tops[q][0], H = tops[q][1], R = rows[j], rr = rIn + (rOut - rIn) * R[0];
      var hh = j === 0 ? -3 : H * Math.max(0.02, Math.min(1, R[1] + jit[q % n][j]));
      return [m[0] + Math.cos(th) * rr, m[1] + Math.sin(th) * rr, hh];
    }
    for (var a = 0; a < n; a++) {
      if (skip && (skip(tops[a][0]) || skip(tops[a + 1][0]))) { continue; }
      var c = typeof col === "function" ? col(tops[a][0]) : col;
      for (var j = 0; j + 1 < rows.length; j++) {
        var a0 = pt(a, j), a1 = pt(a + 1, j), b0 = pt(a, j + 1), b1 = pt(a + 1, j + 1);
        var nn = worldN(a0, b1, a1);
        if (nn[2] < 0) { nn = [-nn[0], -nn[1], -nn[2]]; }
        gl3Poly(v, [a0, a1, b1, b0], nn, c, 1, null, pat);
      }
    }
  }
  function worldSmooth(n, rnd, passes) {
    var r = [];
    for (var i = 0; i < n; i++) { r.push(rnd()); }
    for (var p = 0; p < passes; p++) {
      r = r.map(function (x, i) { return (r[(i + n - 1) % n] + x * 2 + r[(i + 1) % n]) / 4; });
    }
    return r;
  }
  function worldHorizon(v, L) {
    var look = worldLook(), F = GL3_FAR, rnd = gl3Rand(Math.round(L.mid[0] * 3 + L.mid[1] * 11) + 5), sheetC = L.sheetC;
    var snowy = gl3SnowNow, sky = look.sky;
    function white(c, k) { return snowy ? gl3Mix(c, [0.92, 0.94, 0.97], k) : c; }
    var seaWay = null;
    if (L.water && look.water === "sea") {
      var dl = Math.hypot(L.water.d[0], L.water.d[1]) || 1;
      seaWay = function (th) { return (Math.cos(th) * L.water.d[0] + Math.sin(th) * L.water.d[1]) / dl > -0.05; };
    }
    function rolling(lo, amp, rough) {
      var noise = worldSmooth(97, rnd, 3);
      return function (th, h) {
        var rise = (0.5 + 0.5 * Math.sin(th * 3 + 1.3)) * 0.6 + (0.5 + 0.5 * Math.sin(th * 7 + 0.4)) * 0.4;
        return lo + amp * rise * (1 - rough + rough * 2 * noise[h % 97]);
      };
    }
    var hillC = white(gl3Mix([0.5, 0.62, 0.48], sheetC, 0.2), 0.8);
    if (sky === "plains") {
      worldRing(v, L, F * 0.3, F * 0.5, 96, rolling(120, 520, 0.5), hillC, PAT.hill, seaWay);
    } else if (sky === "hills" || sky === "sea") {
      worldRing(v, L, F * 0.3, F * 0.5, 96, rolling(380, 1500, 0.4), hillC, PAT.hill, seaWay);
    } else if (sky === "woods") {
      worldRing(v, L, F * 0.3, F * 0.48, 96, rolling(500, 1300, 0.3), white(gl3Mix([0.28, 0.42, 0.27], sheetC, 0.15), 0.7), PAT.leaves, null);
    } else if (sky === "peaks") {
      // forested foothills, and the mountains behind them, snow on their tops
      var ridge = worldSmooth(220, rnd, 0), broad = worldSmooth(220, rnd, 7), mid = worldSmooth(220, rnd, 2);
      var rock = white(gl3Mix([0.45, 0.46, 0.48], sheetC, 0.12), 0.3);
      var slopes = [[0, 0, 0], [0.3, 0.26, 0.1], [0.62, 0.62, 0.12], [0.86, 0.9, 0.06], [1, 1, 0]];
      worldRing(v, L, F * 0.33, F * 0.5, 220, function (th, h) {
        var k = h % 220, peak = Math.min(1.15, Math.pow(Math.abs(Math.sin(th * 5 + 0.7)) * 0.45 + broad[k] * 0.75 + mid[k] * 0.25, 2.0));
        return 1500 + 4300 * peak + 1100 * Math.pow(ridge[k], 1.6);
      }, rock, 74, null, slopes, rnd);
      // nearer, lower, wooded all the way up
      var low = worldSmooth(120, rnd, 3);
      worldRing(v, L, F * 0.22, F * 0.34, 120, function (th, h) { return 500 + 1700 * Math.pow(low[h % 120], 1.4) * (0.7 + 0.3 * Math.sin(th * 9)); },
                white(gl3Mix([0.27, 0.4, 0.28], sheetC, 0.15), 0.8), 74, null, [[0, 0, 0], [0.5, 0.55, 0.12], [1, 1, 0]], rnd);
    } else if (sky === "mesas") {
      // flat-topped red rock, in layers -- sheer sides, a flat top -- and low dunes in front
      var steps = worldSmooth(64, rnd, 1), red = gl3Mix([0.66, 0.38, 0.26], sheetC, 0.08);
      worldRing(v, L, F * 0.34, F * 0.5, 192, function (th, h) {
        var s = steps[Math.floor(h / 3) % 64];
        return s > 0.5 ? 1700 + 1100 * Math.round(s * 4) / 4 : 160 + 260 * s;
      }, red, 73, null, [[0, 0, 0], [0.08, 0.35, 0.05], [0.16, 0.97, 0.02], [1, 1, 0]], rnd);
      worldRing(v, L, F * 0.22, F * 0.33, 96, rolling(60, 260, 0.6), gl3Mix(look.ground, sheetC, 0.12), 71, null);
    } else if (sky === "volcano") {
      worldRing(v, L, F * 0.3, F * 0.5, 120, function (th, h) {
        var cone = Math.max(0, 1 - Math.abs(Math.atan2(Math.sin(th - 2.1), Math.cos(th - 2.1))) / 0.42);
        return 420 + 1300 * (0.5 + 0.5 * Math.sin(th * 4 + h * 0.01)) * 0.6 + 5200 * cone * cone * (3 - 2 * cone);
      }, function (th) {
        var cone = Math.max(0, 1 - Math.abs(Math.atan2(Math.sin(th - 2.1), Math.cos(th - 2.1))) / 0.42);
        return gl3Mix(gl3Mix([0.27, 0.48, 0.26], sheetC, 0.15), [0.36, 0.33, 0.3], cone * 0.6);
      }, PAT.hill, null);
    } else if (sky === "towers") {
      // the city: towers all the way round, their windows lit after dark
      var count = 110, tones = [[0.62, 0.64, 0.66], [0.5, 0.55, 0.6], [0.72, 0.68, 0.6], [0.42, 0.46, 0.5], [0.66, 0.6, 0.55]];
      for (var t = 0; t < count; t++) {
        var th = rnd() * Math.PI * 2, far = F * (0.36 + rnd() * 0.14), at = [L.mid[0] + Math.cos(th) * far, L.mid[1] + Math.sin(th) * far];
        var wide = (12 + rnd() * 26) * FLOOR_PX, high = (18 + Math.pow(rnd(), 2.2) * 170) * FLOOR_PX;
        var e = [-Math.sin(th), Math.cos(th)], d = [Math.cos(th), Math.sin(th)];
        worldBox(v, at, e, d, wide / 2, wide * (0.4 + rnd() * 0.3), -3, high, gl3Mix(tones[t % tones.length], sheetC, 0.1), 76);
        if (rnd() < 0.3) {                // a step back near the top
          worldBox(v, at, e, d, wide * 0.32, wide * 0.25, high, high + wide * 0.6, gl3Mix(tones[(t + 2) % tones.length], sheetC, 0.1), 76);
        }
      }
      worldRing(v, L, F * 0.3, F * 0.5, 72, rolling(150, 500, 0.4), hillC, PAT.hill, null);
    } else {
      return false;
    }
    return true;
  }

  // ---- street lamps ------------------------------------------------------------------------------
  // Where each design's light is: how far out over the road (metres),
  // how high, and how far it lights.
  var WORLD_LAMP_HEAD = { classic: [[0, 4.0]], lantern: [[0, 3.35]], cobra: [[2.2, 7.9]], twin: [[2.2, 7.9], [-2.2, 7.9]],
                          modern: [[0.95, 5.8]], globe: [[0, 3.6]] };
  var WORLD_LAMP_REACH = { classic: 7, lantern: 5.5, cobra: 11, twin: 11, modern: 9, globe: 6 };
  function worldStreetAxes(L) {
    var A = L.lotWorld(0, 0, 0), E = L.lotWorld(1, 0, 0), D = L.lotWorld(0, 1, 0);
    return { e: [E[0] - A[0], E[1] - A[1]], d: [D[0] - A[0], D[1] - A[1]] };
  }
  // Along the street every 18 m, the row of them slid along till none
  // stands in a walk or a drive (2026-10-03: one stood in the front walk,
  // a power pole beside it -- 40-utility.js keeps its poles off these).
  function worldLampShift() {
    var P = FLOOR_PX, every = 18 * P, lot = typeof houseStreetLot === "function" ? houseStreetLot() : null, busy = [];
    if (!lot) { return every / 2; }
    var a = -(lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    hand.nodes.forEach(function (n) {
      // (the walks and the drives out to it: a house's every door, inside ones too, left nowhere)
      if (n.kind !== "i_driveway" && n.kind !== "i_path") { return; }
      var dx = n.x - lot.x, dy = n.y - lot.y, lx = dx * c - dy * s, half = turned(n).w / 2 + 1.2 * P;
      busy.push([lx - half, lx + half]);
    });
    for (var o = 0; o < 18; o += 0.5) {
      var off = (9 + o) % 18 * P, ok = true;
      for (var k = -4; k <= 4 && ok; k++) { var x = off + k * every; if (busy.some(function (b) { return x > b[0] && x < b[1]; })) { ok = false; } }
      if (ok) { return off; }
    }
    return every / 2;
  }
  function worldLamps(v, L, reach) {
    var kind = worldLampKind(), P = FLOOR_PX, every = 18 * P, ax = worldStreetAxes(L), shift = worldLampShift();
    if (kind === "none") { return true; }
    for (var lx = -Math.floor(reach / every) * every + shift; lx < reach; lx += every) {
      worldLamp(v, kind, L.lotWorld(lx, L.hy + L.walkW - 0.35 * P, 0), ax.e, ax.d, L.sheetC);
      // and along the far side, where there are houses over there
      if (houseOpt("hood")) {
        worldLamp(v, kind, L.lotWorld(lx + every / 2, L.hy + L.walkW + L.roadW + 0.35 * P, 0), ax.e, [-ax.d[0], -ax.d[1]], L.sheetC);
      }
    }
    return true;
  }
  function worldLamp(v, kind, foot, e, d, sheetC) {
    var P = FLOOR_PX, dark = gl3Mix([0.2, 0.21, 0.22], sheetC, 0.08), galv = gl3Mix([0.6, 0.62, 0.63], sheetC, 0.08);
    var green = gl3Mix([0.15, 0.25, 0.2], sheetC, 0.08), glow = [1.0, 0.93, 0.76];
    var x = foot[0], y = foot[1];
    function at(out, z) { return [x + d[0] * out * P, y + d[1] * out * P, z * P]; }
    if (kind === "classic") {
      gl3Prism(v, foot, 0.07 * P, 0.05 * P, 0, 4.2 * P, 6, dark, PAT.plain);
      gl3Prism(v, foot, 0.05 * P, 0.24 * P, 4.0 * P, 4.25 * P, 8, dark, PAT.plain);
      gl3Prism(v, foot, 0.2 * P, 0.16 * P, 3.95 * P, 4.02 * P, 8, glow, 31);
    } else if (kind === "lantern") {
      // a heritage lamp: a plinth, a fluted post, a bar across, a lantern of four panes and its cap
      gl3Prism(v, foot, 0.17 * P, 0.13 * P, 0, 0.55 * P, 8, green, PAT.plain);
      gl3Prism(v, foot, 0.075 * P, 0.05 * P, 0.55 * P, 3.0 * P, 8, green, PAT.plain);
      gl3Prism(v, foot, 0.09 * P, 0.09 * P, 2.9 * P, 3.05 * P, 8, green, PAT.plain);
      worldBox(v, [x, y], e, d, 0.28 * P, 0.025 * P, 2.62 * P, 2.67 * P, green, PAT.plain);
      gl3Prism(v, foot, 0.16 * P, 0.22 * P, 3.05 * P, 3.6 * P, 4, glow, 31);
      gl3Prism(v, foot, 0.27 * P, 0.02 * P, 3.6 * P, 3.85 * P, 4, green, PAT.plain);
      worldBall(v, [x, y, 3.9 * P], 0.05 * P, 1, green, PAT.plain);
    } else if (kind === "cobra" || kind === "twin") {
      // a tall pole, an arm curving out over the road, a long flat head
      worldTube(v, [x, y, 0], [x, y, 7.6 * P], 0.1 * P, 0.07 * P, 8, galv, 22);
      (kind === "twin" ? [1, -1] : [1]).forEach(function (s) {
        var bend = [[0, 7.5], [0.25, 7.85], [0.7, 8.08], [1.3, 8.16], [1.9, 8.16]];
        for (var i = 0; i + 1 < bend.length; i++) {
          worldTube(v, at(bend[i][0] * s, bend[i][1]), at(bend[i + 1][0] * s, bend[i + 1][1]), 0.05 * P, 0.045 * P, 6, galv, 22);
        }
        var hc = at(2.2 * s, 0);
        worldBox(v, hc, e, d, 0.17 * P, 0.38 * P, 8.0 * P, 8.22 * P, galv, 22);
        worldBox(v, hc, e, d, 0.13 * P, 0.32 * P, 7.96 * P, 8.0 * P, glow, 31, true);
      });
    } else if (kind === "modern") {
      // a slim square post, a thin blade out over the road, lit along its underside
      worldBox(v, [x, y], e, d, 0.07 * P, 0.07 * P, 0, 6.0 * P, dark, 22);
      worldBox(v, at(0.85, 0), e, d, 0.08 * P, 0.85 * P, 5.86 * P, 6.0 * P, dark, 22);
      worldBox(v, at(0.95, 0), e, d, 0.05 * P, 0.65 * P, 5.82 * P, 5.86 * P, glow, 31, true);
    } else if (kind === "globe") {
      gl3Prism(v, foot, 0.12 * P, 0.1 * P, 0, 0.4 * P, 8, dark, PAT.plain);
      gl3Prism(v, foot, 0.06 * P, 0.045 * P, 0.4 * P, 3.25 * P, 8, dark, PAT.plain);
      gl3Prism(v, foot, 0.11 * P, 0.11 * P, 3.22 * P, 3.32 * P, 8, dark, PAT.plain);
      worldBall(v, [x, y, 3.6 * P], 0.3 * P, 1, [1.0, 0.97, 0.9], 31);
    }
  }
  // The lamps nearest the house light it after dark: their heads, the
  // nearest few (houseLights, 39-house.js, after the house's own).
  function worldLampSpots() {
    var kind = worldLampKind(), lot = typeof houseStreetLot === "function" ? houseStreetLot() : null;
    if (kind === "none" || !lot) { return []; }
    var P = FLOOR_PX, every = 18 * P, a = (lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    function W(lx, ly) { return [lot.x + lx * c - ly * s, lot.y + lx * s + ly * c]; }
    var hy = lot.h / 2, out = [];
    for (var lx = -3.5 * every + every / 2; lx < 3.5 * every; lx += every) {
      WORLD_LAMP_HEAD[kind].forEach(function (h) {
        var p = W(lx, hy + (typeof streetWalkPx === "function" ? streetWalkPx() : 1.6 * P) - 0.35 * P + h[0] * P);
        out.push([p[0], p[1], h[1] * P, WORLD_LAMP_REACH[kind] * P, Math.abs(lx)]);
      });
    }
    out.sort(function (p, q) { return p[4] - q[4]; });
    return out.slice(0, 4).map(function (p) { return p.slice(0, 4); });
  }
  if (typeof houseLights === "function") {
    var houseLightsWorld = houseLights;
    houseLights = function () {
      var own = houseLightsWorld();
      try { return own.slice(0, 5).concat(worldLampSpots()).concat(own.slice(5)); } catch (e) { return own; }
    };
  }

  // ---- the neighbors ------------------------------------------------------------------------------
  // Houses on lots either side, and across the street facing this one:
  // lawns, drives, doors and windows (lit after dark), a tree, a car --
  // built the way houses are where the land is.
  var WORLD_HOOD = {
    //           walls: [color, pattern]                                    roofs                       flat roof?
    plains:  { walls: [["#ede8dc", 13], ["#c9d3d9", 13], ["#a65a44", 40], ["#e2d3b5", 13], ["#8c9c84", 13]], roofs: ["#5d6166", "#3f4246", "#7a5f4c"], pat: 1 },
    hills:   { walls: [["#ede8dc", 13], ["#b9b1a3", 41], ["#a65a44", 40], ["#6f8592", 13]], roofs: ["#5d6166", "#4a4f57", "#7a5f4c"], pat: 1 },
    mountains: { walls: [["#8a6340", 64], ["#9a7a5a", 54], ["#b9b1a3", 41]], roofs: ["#4f5a63", "#2f4a3c", "#7a2e2a"], pat: 45 },
    forest:  { walls: [["#8a6340", 64], ["#8e6f52", 43], ["#6b4a2f", 64]], roofs: ["#2f4a3c", "#4f5a63"], pat: 45 },
    lake:    { walls: [["#8e6f52", 43], ["#ede8dc", 13], ["#6f8592", 13]], roofs: ["#5d6166", "#4f5a63"], pat: 1 },
    beach:   { walls: [["#f2efe8", 13], ["#bfe0e6", 13], ["#f4d9c6", 42], ["#fff2b8", 13]], roofs: ["#c9ced3", "#7a5f4c"], pat: 45 },
    desert:  { walls: [["#e6c9a8", 42], ["#d9b48c", 42], ["#efe7d6", 42]], roofs: ["#b5603f"], pat: 44, flat: 0.6 },
    tropics: { walls: [["#f2efe8", 42], ["#f4d9c6", 42], ["#cfe6c4", 42]], roofs: ["#b5603f", "#c9ced3"], pat: 44 },
    arctic:  { walls: [["#8c2f28", 43], ["#e2b84a", 43], ["#3f5f7a", 43], ["#f2efe8", 43]], roofs: ["#2f3437", "#3f4246"], pat: 45 },
    city:    { walls: [["#8c4a3a", 40], ["#a65a44", 40], ["#c9c2b6", 41], ["#6b5a52", 40]], roofs: ["#3f4246"], pat: 1, flat: 1, tall: true }
  };
  function worldHood(v, L) {
    if (!houseOpt("hood") || !L.lot) { return; }
    var P = FLOOR_PX, lot = L.lot, rnd = gl3Rand(Math.round(Math.abs(lot.x) * 3 + Math.abs(lot.y) * 5 + lot.w) + 17);
    var hood = WORLD_HOOD[worldScape()], ax = worldStreetAxes(L);
    var W = Math.max(lot.w, (hood.tall ? 9 : 17) * P), D = Math.max(lot.h, 26 * P), hy = L.hy;
    var far0 = hy + L.walkW + L.roadW, reach = L.walk ? GL3_FAR * 0.8 : L.groundR;
    // (the sidewalk over there beyond its own strip of grass, as on this side: 40-verge.js)
    var verge0 = far0 + (typeof streetVergePx === "function" ? streetVergePx() : 0);
    // the pavement over the road
    var pave = gl3Mix([0.8, 0.79, 0.76], L.sheetC, 0.2);
    gl3Poly(v, [L.lotWorld(-reach, verge0, -1.5), L.lotWorld(reach, verge0, -1.5), L.lotWorld(reach, far0 + L.walkW, -1.5), L.lotWorld(-reach, far0 + L.walkW, -1.5)],
            [0, 0, 1], pave, 1, [[-reach / P, 0], [reach / P, 0], [reach / P, 1.6], [-reach / P, 1.6]], PAT.walk);
    var many = L.walk ? 4 : 2, near = L.walk ? Infinity : L.groundR * 0.78;
    var spots = [], gapPx = (typeof hoodGap === "function" ? hoodGap() : 0) * P;
    for (var i = 0; i < many; i++) {
      // (as far apart as asked: 40-hood.js)
      var off = lot.w / 2 + gapPx + W / 2 + i * (W + gapPx);
      spots.push({ x: off, front: hy, back: false }, { x: -off, front: hy, back: false });
    }
    for (var j = -many; j <= many; j++) { spots.push({ x: j * (W + gapPx) + (rnd() - 0.5) * 2 * P, front: far0 + L.walkW, back: true }); }
    spots.forEach(function (s, k) {
      var mid = L.lotWorld(s.x, s.back ? s.front + D / 2 : s.front - D / 2, 0);
      if (Math.hypot(mid[0] - L.mid[0], mid[1] - L.mid[1]) > near) { return; }
      worldNeighbor(v, L, s, W, D, hood, ax, gl3Rand(k * 31 + Math.round(Math.abs(s.x))));
    });
  }
  function worldNeighbor(v, L, s, W, D, hood, ax, rnd) {
    var P = FLOOR_PX, sheetC = L.sheetC, flip = s.back ? -1 : 1;     // across the street, it faces the other way
    // in lot numbers: x along the street, y toward the street from the house
    function at(lx, ly, z) { return L.lotWorld(s.x + lx, s.front - flip * ly, z || 0); }
    var e = ax.e, d = s.back ? ax.d : [-ax.d[0], -ax.d[1]];           // d: from the street into the lot
    var wall = hood.walls[Math.floor(rnd() * hood.walls.length)];
    var wallC = gl3Mix(gl3Rgb(wall[0]), sheetC, 0.08), roofC = gl3Mix(gl3Rgb(hood.roofs[Math.floor(rnd() * hood.roofs.length)]), sheetC, 0.08);
    var hw = Math.min(W * (hood.tall ? 0.49 : 0.3), (6 + rnd() * 2.5) * P), hd = (4.5 + rnd() * 1.5) * P;
    var back0 = (hood.tall ? 1.5 : 6 + rnd() * 2) * P;                   // its front, back from the street
    var storeys = hood.tall ? 3 + Math.floor(rnd() * 3) : rnd() < 0.45 ? 2 : 1, wallH = storeys * 2.9 * P;
    var cx = hood.tall ? 0 : (rnd() - 0.5) * (W / 2 - hw - 1 * P), cy = back0 + hd;
    var mid = at(cx, cy, 0);
    // its lawn (or yard), kept clear of the trees round about
    var lawn = worldLawn(), lc = gl3Mix(lawn ? lawn.color : [0.44, 0.62, 0.31], sheetC, 0.15);
    if (gl3SnowNow) { lc = gl3Mix(lc, [0.93, 0.94, 0.97], 0.85); }
    var yard = [at(-W / 2 + 0.3 * P, 0, -1), at(W / 2 - 0.3 * P, 0, -1), at(W / 2 - 0.3 * P, D, -1), at(-W / 2 + 0.3 * P, D, -1)];
    gl3Poly(v, yard, [0, 0, 1], lc, 1, [[0, 0], [W / P, 0], [W / P, D / P], [0, D / P]], lawn ? lawn.pat : PAT.lawn);
    var y0 = Math.min(yard[0][1], yard[1][1], yard[2][1], yard[3][1]) - 40, y1 = Math.max(yard[0][1], yard[1][1], yard[2][1], yard[3][1]) + 40;
    var x0 = Math.min(yard[0][0], yard[1][0], yard[2][0], yard[3][0]) - 40, x1 = Math.max(yard[0][0], yard[1][0], yard[2][0], yard[3][0]) + 40;
    L.keepOff.push(function (p) { return p[0] > x0 && p[0] < x1 && p[1] > y0 && p[1] < y1; });
    // the walls, and the roof
    worldBox(v, mid, e, d, hw, hd, 0, wallH, wallC, wall[1], false);
    var flat = hood.flat && rnd() < hood.flat;
    if (flat) {
      worldBox(v, mid, e, d, hw, 0.12 * P, wallH, wallH + 0.7 * P, wallC, wall[1]);    // a parapet, all round
      [[0, -hd + 0.12 * P], [0, hd - 0.12 * P]].forEach(function (o) {
        worldBox(v, [mid[0] + d[0] * o[1], mid[1] + d[1] * o[1]], e, d, hw, 0.12 * P, wallH, wallH + 0.7 * P, wallC, wall[1]);
      });
      [-1, 1].forEach(function (sx) {
        worldBox(v, [mid[0] + e[0] * sx * (hw - 0.12 * P), mid[1] + e[1] * sx * (hw - 0.12 * P)], e, d, 0.12 * P, hd, wallH, wallH + 0.7 * P, wallC, wall[1]);
      });
      gl3Poly(v, [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) {
        return [mid[0] + e[0] * hw * q[0] + d[0] * hd * q[1], mid[1] + e[1] * hw * q[0] + d[1] * hd * q[1], wallH + 0.05 * P];
      }), [0, 0, 1], gl3Mix(roofC, [0.5, 0.5, 0.5], 0.5), 1, null, PAT.concrete);
    } else {
      worldRoof(v, mid, e, d, hw + 0.35 * P, hd + 0.35 * P, wallH - 0.1 * P, rnd() < 0.5 ? "hip" : "gable", roofC, hood.pat, wallC, wall[1]);
    }
    // the front: its door, its windows, floor by floor; windows down the sides
    var front = [mid[0] - d[0] * (hd + 0.03 * P), mid[1] - d[1] * (hd + 0.03 * P)], doorAt = (rnd() - 0.5) * hw;
    var glass = gl3Mix([0.24, 0.3, 0.36], sheetC, 0.06), trim = gl3Mix([0.95, 0.94, 0.91], sheetC, 0.06);
    function pane(base, along, z0, z1, wide, out, col, pat) {
      var c0 = [base[0] + e[0] * along, base[1] + e[1] * along];
      worldBox(v, [c0[0] - d[0] * out, c0[1] - d[1] * out], e, d, wide / 2, out, z0, z1, col, pat, true);
    }
    pane(front, doorAt, 0, 2.15 * P, 1.15 * P, 0.04 * P, trim, PAT.plain);
    pane(front, doorAt, 0, 2.08 * P, 0.95 * P, 0.05 * P, gl3Mix([[0.45, 0.2, 0.17], [0.2, 0.28, 0.36], [0.33, 0.24, 0.17]][Math.floor(rnd() * 3)], sheetC, 0.06), 21);
    worldBox(v, [front[0] + e[0] * doorAt - d[0] * 0.5 * P, front[1] + e[1] * doorAt - d[1] * 0.5 * P], e, d, 0.8 * P, 0.45 * P, 0, 0.16 * P, gl3Mix([0.7, 0.69, 0.66], sheetC, 0.1), PAT.concrete);
    for (var st = 0; st < storeys; st++) {
      var sill = st * 2.9 * P + 0.9 * P, n = Math.max(2, Math.floor(hw * 2 / (2.3 * P)));
      for (var w = 0; w < n; w++) {
        var along = -hw + (w + 0.5) * hw * 2 / n;
        if (st === 0 && Math.abs(along - doorAt) < 1.2 * P) { continue; }
        pane(front, along, sill - 0.05 * P, sill + 1.4 * P, 1.2 * P, 0.03 * P, trim, PAT.plain);
        pane(front, along, sill + 0.05 * P, sill + 1.3 * P, 1.0 * P, 0.04 * P, glass, 77);
      }
      [-1, 1].forEach(function (sx) {
        var side = [mid[0] + e[0] * sx * (hw + 0.03 * P), mid[1] + e[1] * sx * (hw + 0.03 * P)];
        worldBox(v, [side[0] + e[0] * sx * 0.04 * P, side[1] + e[1] * sx * 0.04 * P], e, d, 0.05 * P, 0.55 * P, sill + 0.05 * P, sill + 1.3 * P, glass, 77, true);
      });
    }
    // a garage door and its drive, or a path, out to the street
    var drive = gl3Mix([0.66, 0.66, 0.64], sheetC, 0.12), garage = !hood.tall && rnd() < 0.6;
    var gAt = doorAt > 0 ? -hw + 1.8 * P : hw - 1.8 * P;
    if (garage) {
      pane(front, gAt, 0, 2.2 * P, 2.7 * P, 0.06 * P, gl3Mix([0.9, 0.89, 0.86], sheetC, 0.08), 43);
      var dr = [at(cx + gAt - 1.5 * P, 0, -0.5), at(cx + gAt + 1.5 * P, 0, -0.5), at(cx + gAt + 1.5 * P, back0 - 0.05 * P, -0.5), at(cx + gAt - 1.5 * P, back0 - 0.05 * P, -0.5)];
      gl3Poly(v, dr, [0, 0, 1], drive, 1, null, PAT.concrete);
      gl3Poly(v, [at(cx + gAt - 1.5 * P, -L.walkW, -0.4), at(cx + gAt + 1.5 * P, -L.walkW, -0.4), at(cx + gAt + 1.5 * P, 0, -0.4), at(cx + gAt - 1.5 * P, 0, -0.4)],
              [0, 0, 1], drive, 1, null, PAT.concrete);
      if (rnd() < 0.55) {                // a car on it
        var cc = WORLD_CAR_COLORS[Math.floor(rnd() * WORLD_CAR_COLORS.length)], ca = at(cx + gAt, back0 * 0.45, 0);
        worldCarParts(ca, d, e, gl3Rgb(cc)).forEach(function (b) { worldBox(v, b.c, b.e, b.d, b.hx, b.hy, b.z0, b.z1, b.col, b.pat); });
      }
    }
    var pc = gl3Mix([0.74, 0.72, 0.69], sheetC, 0.15);   // the path to the door
    gl3Poly(v, [at(cx + doorAt - 0.55 * P, 0, -0.6), at(cx + doorAt + 0.55 * P, 0, -0.6), at(cx + doorAt + 0.55 * P, back0 - 0.5 * P, -0.6), at(cx + doorAt - 0.55 * P, back0 - 0.5 * P, -0.6)],
            [0, 0, 1], pc, 1, [[0, 0], [1.1, 0], [1.1, back0 / P], [0, back0 / P]], PAT.walk);
    // and a tree in the garden
    if (houseOpt("trees") && !hood.tall && rnd() < 0.75) {
      var tx = (rnd() < 0.5 ? -1 : 1) * (W / 2 - 2 * P);
      worldPlant(v, worldPick(worldLook().grow, rnd), at(tx, (1.5 + rnd() * 2.5) * P, 0), rnd, sheetC);
    }
  }
  // A roof over a box: hipped, sloping down to every side, or a gable,
  // its two ends walled up in the walls' own color.
  function worldRoof(v, mid, e, d, hx, hy, z, kind, col, pat, wallC, wallPat) {
    var long = hx >= hy, half = long ? hy : hx, rise = half * Math.tan(32 * Math.PI / 180);
    function P2(ax, ay, h) { return [mid[0] + e[0] * ax + d[0] * ay, mid[1] + e[1] * ax + d[1] * ay, z + h]; }
    var nw = P2(-hx, -hy, 0), ne = P2(hx, -hy, 0), se = P2(hx, hy, 0), sw = P2(-hx, hy, 0);
    var inset = kind === "hip" ? half : 0;
    var A = long ? P2(-hx + inset, 0, rise) : P2(0, -hy + inset, rise), B = long ? P2(hx - inset, 0, rise) : P2(0, hy - inset, rise);
    if (long) {
      worldFace(v, [nw, ne, B, A], col, pat, true); worldFace(v, [se, sw, A, B], col, pat, true);
      if (kind === "hip") { worldFace(v, [sw, nw, A], col, pat, true); worldFace(v, [ne, se, B], col, pat, true); }
      else { worldFace(v, [sw, nw, A], wallC, wallPat); worldFace(v, [ne, se, B], wallC, wallPat); }
    } else {
      worldFace(v, [nw, sw, B, A], col, pat, true); worldFace(v, [se, ne, A, B], col, pat, true);
      if (kind === "hip") { worldFace(v, [ne, nw, A], col, pat, true); worldFace(v, [sw, se, B], col, pat, true); }
      else { worldFace(v, [ne, nw, A], wallC, wallPat); worldFace(v, [sw, se, B], wallC, wallPat); }
    }
    // its underside, seen from under the eaves
    gl3Poly(v, [nw, ne, se, sw], [0, 0, -1], gl3Mix(col, [1, 1, 1], 0.3), 1, null, PAT.plain);
  }

  // ---- cars ---------------------------------------------------------------------------------------
  var WORLD_CAR_COLORS = ["#c9ced3", "#2f3437", "#8f2f2a", "#f2efe8", "#2f4a6a", "#5d6166", "#3f5a3c", "#b8a27a"];
  // A car's parts, as boxes: where its middle is, the way it points (`f`),
  // and its color.
  function worldCarParts(c0, f, s, col) {
    var P = FLOOR_PX, glass = [0.18, 0.22, 0.27], tyre = [0.11, 0.11, 0.12], out = [];
    function box(af, as, hf, hs, z0, z1, cc, pat) {
      out.push({ c: [c0[0] + f[0] * af * P + s[0] * as * P, c0[1] + f[1] * af * P + s[1] * as * P], e: f, d: s,
                 hx: hf * P, hy: hs * P, z0: z0 * P, z1: z1 * P, col: cc, pat: pat });
    }
    box(0, 0, 2.2, 0.88, 0.28, 0.82, col, 22);                 // the body
    box(-0.15, 0, 1.15, 0.82, 0.82, 1.3, glass, 70);           // the windows all round
    box(-0.2, 0, 0.98, 0.78, 1.3, 1.38, col, 22);              // the roof
    [[1.35, 0.8], [1.35, -0.8], [-1.35, 0.8], [-1.35, -0.8]].forEach(function (w) {
      box(w[0], w[1], 0.33, 0.12, 0, 0.62, tyre, 32);          // the wheels
    });
    box(2.2, 0.62, 0.03, 0.14, 0.58, 0.7, [1, 0.96, 0.85], 31);    // headlamps
    box(2.2, -0.62, 0.03, 0.14, 0.58, 0.7, [1, 0.96, 0.85], 31);
    box(-2.2, 0.66, 0.03, 0.12, 0.6, 0.7, [0.75, 0.12, 0.1], 31);  // and the red lamps behind
    box(-2.2, -0.66, 0.03, 0.12, 0.6, 0.7, [0.75, 0.12, 0.1], 31);
    return out;
  }

  // ---- people out walking, and cars going by -------------------------------------------------------
  // Put into the house's picture each time it is drawn, where they are by
  // now: along both pavements, back and forth, and the cars along the road
  // each way.
  var WORLD_FOLK = ["i_person", "i_man", "i_woman", "i_child", "i_elder", "i_woman", "i_man", "i_person"];
  var WORLD_CLOTHES = ["#7f8794", "#a65a44", "#5c6b5a", "#2f4a6a", "#b5a58c", "#8c4a3a", "#6f8592", "#c99a6b", "#3f4a52"];
  function worldLive() {
    if (!V3 || V3.scene === "space" || !houseOpt("folk") || typeof tieHomeLike !== "function" || !tieHomeLike()) { return false; }
    if (V3.flat && V3.flatDone) { return false; }
    return !!(typeof houseStreetLot === "function" && houseStreetLot());
  }
  // How high the land is at a spot, as it is drawn (40-land.js): what goes
  // along the street stands on it, not at the height of the house's floor.
  function worldGroundAt(x, y) {
    try {
      if (typeof TERR === "undefined" || !TERR || TERR.off || typeof TERR_ON === "undefined" || !TERR_ON) { return 0; }
      return TERR.mesh && typeof terrMeshAt === "function" ? terrMeshAt(TERR, x, y) : terrAt(x, y);
    } catch (e) { return 0; }
  }
  function worldFolk(model) {
    var lot = houseStreetLot();
    if (!lot) { return; }
    // kept apart from the house's own: what the view fits to, and the sun's
    // shadows are fitted round, is the house -- not a car going by
    var passing = model.passing = { faces: [], stand: [] };
    var P = FLOOR_PX, a = (lot.turn || 0) * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    function W(lx, ly) { return [lot.x + lx * c - ly * sn, lot.y + lx * sn + ly * c]; }
    var still = typeof STILL !== "undefined" && STILL, t = still ? 12 : performance.now() / 1000;
    var walk = V3.mode === "walk", ink = simInk();
    var span = walk ? 70 * P : Math.max(14 * P, (V3.gl && V3.gl.scenery ? V3.gl.scenery.groundR : 60 * P) * 0.62);
    // (the kerb as far out as the sidewalk and its strip of grass; those walking keep to the sidewalk: 40-verge.js)
    var hy = lot.h / 2, walkW = typeof streetWalkPx === "function" ? streetWalkPx() : 1.6 * P, far = hood();
    // (the street's width, and its lanes each way: 40-verge.js)
    var roadW = typeof streetRoadPx === "function" ? streetRoadPx() : 7 * P, half = Math.max(1, Math.round(roadW / (7 * P)));
    var sideW = 1.6 * P, verge = walkW - sideW;
    function hood() { return !!houseOpt("hood"); }
    // Each pavement two ways, one each side of it; each way one pace, and
    // those going it spaced out along it.  (They went back and forth at
    // their own paces, and walked through one another, 2026-10-03.)
    var lanes = [{ y: hy + sideW * 0.3, dir: 1 }, { y: hy + sideW * 0.74, dir: -1 }];
    if (far) { lanes.push({ y: hy + walkW + roadW + verge + sideW * 0.26, dir: 1 }, { y: hy + walkW + roadW + verge + sideW * 0.7, dir: -1 }); }
    var rnd = gl3Rand(Math.round(Math.abs(lot.x) + Math.abs(lot.y)) + 3), many = far ? 12 : 7;
    lanes.forEach(function (ln) { ln.pace = (1.05 + rnd() * 0.3) * P; ln.from = rnd(); ln.n = 0; });
    for (var q = 0; q < many; q++) { lanes[q % lanes.length].n++; }
    var bodies = typeof peopleBody === "function";
    for (var i = 0; i < many; i++) {
      var lane = lanes[i % lanes.length], nth = Math.floor(i / lanes.length), apart = 2 * span / Math.max(1, lane.n);
      var give = (rnd() - 0.5) * Math.max(0, apart - 2.4 * P) * 0.5;
      var pos = ((lane.from * 2 * span + nth * apart + give + t * lane.pace) % (2 * span) + 2 * span) % (2 * span) - span, x = lane.dir * pos;
      var fadeP = Math.max(0, Math.min(1, (span - Math.abs(x)) / (4 * P)));
      if (fadeP <= 0.02) { continue; }
      var kind = WORLD_FOLK[i % WORLD_FOLK.length], look = { fill: WORLD_CLOTHES[Math.floor(rnd() * WORLD_CLOTHES.length)], line: ink, own: true };
      var tall = (kind === "i_child" ? 1.15 : kind === "i_elder" ? 1.62 : 1.7 + rnd() * 0.12) * P;
      var p = W(x, lane.y), ground = worldGroundAt(p[0], p[1]);
      if (bodies) {
        var headP = Math.atan2(sn * lane.dir, c * lane.dir), phaseP = still ? 0 : (t * lane.pace) / (0.36 * P) + i * 1.7;
        peopleBody(passing.faces, { kind: kind, id: 101 + i }, p[0], p[1], ground, headP, phaseP, look, fadeP);
      } else {
        var bob = still ? 0 : Math.abs(Math.sin(t * 7.5 + i)) * 0.035 * P;
        passing.stand.push({ x: p[0], y: p[1], z: ground + bob, tall: tall, img: v3Figure(kind, look) });
      }
    }
    // the cars, each way, in their lanes
    var roadSpan = walk ? 160 * P : span, cars = (walk ? 6 : 3) * half;
    var e = [c, sn], d = [-sn, c];
    // each way one pace, and the cars along it spaced out -- each its own
    // pace, a faster one drove through the one ahead (2026-10-03); a little
    // give in the spacing, never closer than a car and a half
    var ways = [{ n: Math.ceil(cars / 2), pace: (8 + rnd() * 4) * P, from: rnd() }, { n: Math.floor(cars / 2), pace: (8 + rnd() * 4) * P, from: rnd() }];
    for (var k = 0; k < cars; k++) {
      // (each way's lanes from its own kerb: as far out as on a two-lane street, then a lane further for each)
      var way = ways[k % 2], dir = k % 2 ? -1 : 1, lane = Math.floor(k / 2) % half, speed = way.pace;
      var laneY = dir > 0 ? hy + walkW + roadW - 7 * P * 0.28 - lane * 3.5 * P : hy + walkW + 7 * P * worldNearLane() + lane * 3.5 * P;
      var apart = 2 * roadSpan / Math.max(1, way.n), give = (rnd() - 0.5) * Math.max(0, apart - 9 * P) * 0.6;
      var pos = ((way.from * 2 * roadSpan + Math.floor(k / 2) * apart + give + t * speed) % (2 * roadSpan) + 2 * roadSpan) % (2 * roadSpan) - roadSpan, cx = dir * pos;
      var fade = Math.max(0, Math.min(1, (roadSpan - Math.abs(cx)) / (12 * P)));
      if (fade <= 0.02) { continue; }
      var col = WORLD_CAR_COLORS[Math.floor(rnd() * WORLD_CAR_COLORS.length)], at = W(cx, laneY), carGround = worldGroundAt(at[0], at[1]);
      var f = [e[0] * dir, e[1] * dir];
      worldCarParts(at, f, d, gl3Rgb(col)).forEach(function (b) {
        var pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (q) {
          return [b.c[0] + b.e[0] * b.hx * q[0] + b.d[0] * b.hy * q[1], b.c[1] + b.e[1] * b.hx * q[0] + b.d[1] * b.hy * q[1]];
        });
        var hex = "#" + b.col.map(function (u) { return ("0" + Math.round(Math.max(0, Math.min(1, u)) * 255).toString(16)).slice(-2); }).join("");
        var how = { piece: true, color: hex, edge: hex, bare: true, car: true };
        if (b.pat === 70) { how = { glass: true, edge: hex, car: true }; }
        else if (b.pat === 31) { how.pat = 31; }
        if (fade < 0.999) { how.alpha = fade; how.late = true; }
        v3Prism(passing.faces, pts, b.z0 + carGround, b.z1 + carGround, how);
      });
    }
  }

  // How far out across the road the near lane runs (0 the kerb, 1 the far
  // kerb): further out where cars are parked along it (40-site.js).
  function worldNearLane() { return 0.28; }

  // ---- the lot's edge ----------------------------------------------------------------------------------
  // Walking, you keep to your own lot -- out as far as the pavement in
  // front of it, where there is a street -- and are told where it ends.
  function worldOffLot(x, y) {
    if (!V3 || V3.mode !== "walk" || !houseOpt("bound") || typeof houseLot !== "function") { return 0; }
    var lot = houseLot();
    if (!lot) { return 0; }
    var plan = v3Ground(), floors = plan.floors || [], f = floors.length ? floorAt(floors, x, y) : null;
    if (f && f.level !== 0) { return 0; }
    var P = FLOOR_PX, a = -(lot.turn || 0) * Math.PI / 180, dx = x + (f ? f.dx : 0) - lot.x, dy = y + (f ? f.dy : 0) - lot.y;
    var lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
    var hw = lot.w / 2 + 0.6 * P, top = -lot.h / 2 - 0.6 * P, foot = lot.h / 2 + (houseOpt("street") ? 1.45 * P : 0.6 * P);
    var ox = Math.max(0, Math.abs(lx) - hw), oy = Math.max(0, top - ly, ly - foot);
    return Math.hypot(ox, oy);
  }
  var worldToldAt = 0;
  if (typeof v3Blocked === "function") {
    var v3BlockedWorld = v3Blocked;
    v3Blocked = function (x, y) {
      if (v3BlockedWorld.apply(this, arguments)) { return true; }
      var out = 0;
      try { out = worldOffLot(x, y); } catch (e) { out = 0; }
      if (!out) { return false; }
      // already outside (put there at the start): a step back toward it is let through
      var now = V3.me ? worldOffLot(V3.me.x, V3.me.y) : 0;
      if (out < now - 0.01) { return false; }
      if (performance.now() - worldToldAt > 2600) { worldToldAt = performance.now(); v3Say(TXT.wd_edge); }
      return true;
    };
  }

  // ---- put into each picture ---------------------------------------------------------------------------
  if (typeof v3Build === "function") {
    var v3BuildWorld = v3Build;
    v3Build = function () {
      var model = v3BuildWorld.apply(this, arguments);
      try { if (worldLive()) { worldFolk(model); } } catch (e) { /* the house without them */ }
      return model;
    };
  }
  // and while they are out, drawn as they go (thirty times a second)
  if (typeof v3Watch === "function") {
    var v3WatchWorld = v3Watch;
    v3Watch = function () {
      if (V3 && !(typeof STILL !== "undefined" && STILL)) {
        var now = performance.now();
        if (now - (V3.folkAt || 0) > Math.max(33, (V3.drawMs || 0) * 3) && worldLive()) { V3.folkAt = now; V3.dirty = true; }
      }
      return v3WatchWorld.apply(this, arguments);
    };
  }

  // ---- in the view's Settings (39-house.js) ---------------------------------------------------------------
  // The land, and the lamps: a grid of pictures each.
  var WORLD_ICONS = {
    ws_plains: '<path d="M2 13.6h16M4.2 13.6l1-2.4 1 2.4M9 13.6l1-2.4 1 2.4M13.8 13.6l1-2.4 1 2.4"/><circle cx="14.6" cy="6" r="2"/>',
    ws_hills: '<path d="M2 15.4c2.6-4.6 5-6.2 7-6.2s3.6 2 5 3.6c1-1 2.4-1.6 4-1.6M2 17.4h16"/>',
    ws_mountains: '<path d="M1.8 16.6 7.4 6.2l3.4 5.6 2.2-3.2 5.2 8z"/><path d="M5.6 9.6 7.4 11l1.8-1.4"/>',
    ws_forest: '<path d="M6 17.2v-3.4M6 3.4 2.8 9.2h1.8L2.4 13.8h7.2L7.4 9.2h1.8zM14 17.2v-2.6M14 6.2l-2.6 4.4h1.4l-1.8 3.8h6l-1.8-3.8h1.4z"/>',
    ws_lake: '<path d="M2 9.4c2.4-3 4.6-3 7 0M11 8.4l2.4-3 4.6 4"/><path d="M2.4 13c1.3-.9 2.6-.9 3.9 0s2.6.9 3.9 0 2.6-.9 3.9 0 2.6.9 3.9 0M4.4 16.4c1.2-.8 2.4-.8 3.6 0s2.4.8 3.6 0 2.4-.8 3.6 0"/>',
    ws_beach: '<path d="M7 17.2c.4-3.6.2-7-1-10.2"/><path d="M6 7C4.8 5.2 3 4.8 1.8 5.4M6 7c.2-2.2 1.6-3.6 3.6-3.8M6 7c2-.8 4-.4 5.2 1"/><path d="M10.4 14.4c1.3-.9 2.6-.9 3.9 0s2.6.9 3.9 0M1.8 17.4h16.4"/>',
    ws_desert: '<path d="M8.6 17.4V5.4a1.6 1.6 0 0 1 3.2 0v12M8.6 11H6.4A1.4 1.4 0 0 1 5 9.6V7.4M11.8 9.4H14a1.4 1.4 0 0 0 1.4-1.4V6M3 17.4h14"/>',
    ws_tropics: '<path d="M2 16.6 7.6 7.2h4.8L18 16.6z"/><path d="M8.8 7.2 10 5l1.2 2.2M10 4.2c-.6-.8-.2-1.8.6-2"/>',
    ws_arctic: '<path d="M2 16.6c3-3 6-4 8-4s5 1 8 4"/><path d="M10 2.6v6.8M7 4.3l6 3.4M7 7.7l6-3.4"/>',
    ws_city: '<path d="M2.4 17.4h15.2M3.6 17.4V8.6h4v8.8M7.6 17.4V3.6h5v13.8M12.6 17.4v-6.8h4v6.8M9.6 6.4h1M9.6 9h1M9.6 11.6h1M5.2 11h1M14.2 13h1"/>',
    wl_classic: '<path d="M10 17.6V6.6M7 6.6h6M8 6.6 7.4 4.6h5.2L12 6.6M7.4 17.6h5.2"/>',
    wl_lantern: '<path d="M10 17.6V9.6M8.4 17.6h3.2M7.6 9.6h4.8M8 9.6V5.4h4v4.2M7.4 5.4 10 3l2.6 2.4"/>',
    wl_cobra: '<path d="M6 17.6V5.6C6 3.6 7.4 2.6 9.4 2.6h3.2M12.4 2.6h4.2l-.6 1.4h-3.4M4.4 17.6h3.2"/>',
    wl_twin: '<path d="M10 17.6V5.6M10 5.6C10 3.8 8.6 3 6.8 3H3.4M10 5.6C10 3.8 11.4 3 13.2 3h3.4M2.4 3.6h2.4M15.2 3.6h2.4M8.4 17.6h3.2"/>',
    wl_modern: '<path d="M7 17.6V3.4h9.6v1.4H7M5.4 17.6h3.2M9 4.8h6"/>',
    wl_globe: '<circle cx="10" cy="5.4" r="2.8"/><path d="M10 8.2v9.4M8.4 17.6h3.2M9 10.6h2"/>',
    wl_none: '<path d="M10 17.6V6.6M7.4 17.6h5.2M3.6 3.6l12.8 12.8"/>',
    hood: '<path d="M1.8 10 6 6.4l4.2 3.6M3 9v7.4h6V9M9.8 10 14 6.4l4.2 3.6M11 9v7.4h6V9"/>',
    folk: '<circle cx="7" cy="4.4" r="1.6"/><path d="M7 6.6v5.2M7 8l-2.4 2.4M7 8l2.4 2.4M7 11.8l-2 4.8M7 11.8l2 4.8"/><circle cx="14" cy="7.4" r="1.3"/><path d="M14 9.2v4M14 10.2l-1.8 1.8M14 10.2l1.8 1.8M14 13.2l-1.4 3.4M14 13.2l1.4 3.4"/>',
    bound: '<path d="M3 5.8h14v10.8H3z" stroke-dasharray="2 1.6"/><circle cx="10" cy="10.6" r="1.7"/><path d="M10 12.3v1.8"/>'
  };
  Object.keys(WORLD_ICONS).forEach(function (k) { HOUSE_ICONS[k] = WORLD_ICONS[k]; });
  // A grid of pictures to pick one from, as the weather is picked.
  function worldPicker(sheet, keys, now, prefix, pick) {
    var grid = document.createElement("div");
    grid.className = "hs-weather hs-pick";
    grid.setAttribute("role", "radiogroup");
    keys.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      var on = now === k;
      b.className = "hs-wx" + (on ? " on" : "");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.innerHTML = houseIcon(prefix + k) + "<span></span>";
      b.lastChild.textContent = TXT[prefix + k] || k;
      b.onclick = function () { pick(k); };
      grid.appendChild(b);
    });
    sheet.appendChild(grid);
    return grid;
  }
