// ---------------------------------------------------------------------------
//  40-land.js -- the land itself in 3D: rising and falling the way the
//  landscape does, the house levelled on its foundation (a concrete wall or
//  posts), the street graded along the front, a landing and steps down from
//  each door out, and all that stands out of doors standing on the ground
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "update the different terrains to actually be
  // different like in landscape so the house shows it's foundation leveling
  // itself out on actually uneven terrain")
  //
  // The ground was a flat disc.  Now each landscape (39-world.js) has a
  // shape of its own -- how much it falls across a lot, and its bumps, big
  // and small -- and the house stands on it the way houses do: its floor
  // set a little over the highest ground under it, the ground cut away
  // round it where it would come up the walls, made up to the doors, and
  // the foundation showing below the walls, tall on the downhill side.  On a
  // steep slope, or by the sea, it stands on posts.
  //
  // One height for every spot, `terrAt(x, y)`, in pixels over the ground
  // floor (0).  The scenery's ground (gl3Scenery, 38-view3d-gl.js) is a mesh
  // of it, finest round the house; what the scenery puts on it -- trees,
  // lamps, the houses next door, paths -- is lifted onto it as it is made
  // (a wrapper round gl3Poly, while the scenery is made); and what stands
  // out of doors in the drawing is lifted onto it in each picture
  // (terrDress, a v3Build wrapper).
  Object.assign(HOUSE_PLAIN, { relief: "auto", found: "auto", landSeed: 1 });
  var TERR_RELIEFS = ["auto", "flat", "gentle", "rolling", "steep"];
  var TERR_FOUNDS = ["auto", "wall", "posts"];
  // Each landscape's shape: how far it falls across a lot (rise over run),
  // and its bumps -- [how high, metres; how far across, metres] -- big ones
  // first.  By the water the land falls toward it, and is level past it.
  var TERR_SHAPE = {
    plains:    { grade: 0.018, bumps: [[0.55, 80], [0.18, 24]] },
    hills:     { grade: 0.075, bumps: [[2.8, 60], [0.9, 22], [0.2, 7]] },
    mountains: { grade: 0.17, bumps: [[4.6, 75], [1.5, 26], [0.35, 8]] },
    forest:    { grade: 0.04, bumps: [[1.4, 45], [0.5, 15], [0.15, 5]] },
    lake:      { grade: 0.055, water: true, bumps: [[0.9, 50], [0.3, 16]] },
    beach:     { grade: 0.03, water: true, bumps: [[0.8, 20], [0.3, 8]] },
    desert:    { grade: 0.012, bumps: [[2.0, 48], [0.6, 15]] },
    tropics:   { grade: 0.09, bumps: [[2.2, 55], [0.7, 18]] },
    arctic:    { grade: 0.025, bumps: [[1.1, 65], [0.35, 18]] },
    city:      { grade: 0.006, bumps: [[0.1, 60]] }
  };
  // How much of it, picked in Settings: as the landscape has it, or less, or more.
  var TERR_K = { auto: 1, flat: 0, gentle: 0.45, rolling: 1, steep: 1.9 };
  // What lies on the land, following it, rather than standing level on it.
  var TERR_DRAPE = { i_driveway: true, i_path: true, i_patio: true, i_fence: true, i_hedge: true, i_flowerbed: true,
                     i_deck: true, i_rug: true, i_lawn: true };
  function terrRelief() { var r = houseOpt("relief"); return TERR_RELIEFS.indexOf(r) >= 0 ? r : "auto"; }
  function terrFoundPick() { var f = houseOpt("found"); return TERR_FOUNDS.indexOf(f) >= 0 ? f : "auto"; }
  function terrStep(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }

  // ---- a smooth noise, the same every time for the same land ------------------------------
  function terrHash(ix, iy, s) {
    var h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(s, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function terrNoise(x, y, s) {             // -1 to 1, smooth
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    var a = terrHash(ix, iy, s), b = terrHash(ix + 1, iy, s), c = terrHash(ix, iy + 1, s), d = terrHash(ix + 1, iy + 1, s);
    return (a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy) * 2 - 1;
  }

  // ---- the land now -------------------------------------------------------------------------
  // Worked out again only when the house, its lot or the settings change
  // (kept by `terrKey`), and only in a home's 3D view, its walls up.
  var TERR = null, TERR_ON = false;
  // The land's shape: its landscape's -- and, mixed with others (40-mix.js),
  // as steep as the steepest, the bumps of each in it (the others' a little
  // softer), by water if any of them is.
  function terrShapeNow() {
    var keys = typeof worldScapes === "function" ? worldScapes() : [worldScape()];
    if (keys.length < 2) { return TERR_SHAPE[keys[0]] || TERR_SHAPE.plains; }
    var out = { grade: 0, bumps: [], water: false };
    keys.forEach(function (key, i) {
      var S = TERR_SHAPE[key] || TERR_SHAPE.plains;
      out.grade = Math.max(out.grade, S.grade);
      S.bumps.forEach(function (b) { out.bumps.push(i ? [b[0] * 0.7, b[1]] : b); });
      if (S.water) { out.water = true; }
    });
    out.bumps.sort(function (a, b) { return b[0] - a[0]; });
    return out;
  }
  function terrWanted() {
    if (typeof V3 === "undefined" || !V3 || V3.scene === "space" || typeof tieHomeLike !== "function" || !tieHomeLike()) { return false; }
    if (V3.flat && V3.flatDone) { return false; }
    if (typeof houseUnder === "function" && houseUnder()) { return false; }
    var k = TERR_K[terrRelief()], S = terrShapeNow();
    return k > 0 && (S.bumps[0][0] * k >= 0.15 || S.grade * k >= 0.01);
  }
  function terrKey() {
    var parts = [typeof worldScapes === "function" ? worldScapes().join("+") : worldScape(), terrRelief(), terrFoundPick(), houseOpt("landSeed"), houseOpt("street") ? 1 : 0, houseOpt("hood") ? 1 : 0];
    var any = false;
    hand.nodes.forEach(function (n) {
      if (n.kind !== "i_room" && n.kind !== "i_floor" && n.kind !== "i_lot" && !WALK_DOORS[n.kind]) { return; }
      if (n.kind === "i_room") { any = true; }
      parts.push(n.kind.slice(2, 5) + n.id + ":" + Math.round(n.x) + "," + Math.round(n.y) + "," + Math.round(n.w) + "," +
                 Math.round(n.h) + "," + (n.turn || 0) + "," + (n.ceil || 0));
    });
    return any ? parts.join("|") : null;
  }
  // (kept while the view is flat, or looks at a floor under the ground: back
  // in 3D the same land needs no working out again)
  function terrBegin() {
    TERR_ON = false;
    if (!terrWanted()) { return null; }
    var key = terrKey();
    if (!key) { return null; }
    if (!TERR || TERR.key !== key) {
      try { TERR = terrMake(key); } catch (e) { TERR = { key: key, off: true }; }
    }
    if (TERR.off) { return null; }
    TERR_ON = true;
    return TERR;
  }

  // In and out of a room's box (its own numbers, turned with it).
  function terrRect(r, f) {
    var a = (r.turn || 0) * Math.PI / 180;
    return { n: r, x: r.x + (f ? f.dx : 0), y: r.y + (f ? f.dy : 0), hw: r.w / 2, hh: r.h / 2,
             c: Math.cos(a), s: Math.sin(a), z: f ? f.z : 0 };
  }
  function terrIn(R, x, y, pad) {
    var dx = x - R.x, dy = y - R.y, ux = dx * R.c + dy * R.s, uy = -dx * R.s + dy * R.c;
    return Math.abs(ux) <= R.hw - (pad || 0) && Math.abs(uy) <= R.hh - (pad || 0);
  }
  function terrPt(R, lx, ly) { return [R.x + lx * R.c - ly * R.s, R.y + lx * R.s + ly * R.c]; }
  function terrRot(R, ox, oy) { return [ox * R.c - oy * R.s, ox * R.s + oy * R.c]; }
  // How far a spot is outside the ground floor (0 inside it).
  function terrOut(T, x, y) {
    var best = Infinity;
    for (var i = 0; i < T.rects.length; i++) {
      var R = T.rects[i], dx = x - R.x, dy = y - R.y, ux = dx * R.c + dy * R.s, uy = -dx * R.s + dy * R.c;
      var ex = Math.max(0, Math.abs(ux) - R.hw), ey = Math.max(0, Math.abs(uy) - R.hh);
      var d = ex || ey ? Math.hypot(ex, ey) : 0;
      if (d < best) { best = d; if (!d) { break; } }
    }
    return best;
  }
  // The lot's own numbers: x along the street, y toward it.
  function terrLocal(T, x, y) { var dx = x - T.F.x, dy = y - T.F.y; return [dx * T.ca + dy * T.sa, -dx * T.sa + dy * T.ca]; }
  function terrWorld(T, lx, ly) { return [T.F.x + lx * T.ca - ly * T.sa, T.F.y + lx * T.sa + ly * T.ca]; }

  // The land as it lies, before anything is built: its bumps, and its fall
  // (eased off far out, so the world does not tilt), in pixels.
  function terrRaw(T, lx, ly) {
    var z = 0;
    for (var i = 0; i < T.oct.length; i++) { var o = T.oct[i]; z += o[0] * terrNoise(lx * o[1], ly * o[1], o[2]); }
    if (T.water) {
      var u = -(ly + T.F.h / 2);
      z -= T.grade * Math.min(u, T.water.shore + 10 * T.P);       // down to the water, and level past it
    } else {
      var s = T.slope[0] * lx + T.slope[1] * ly, R = 45 * T.P;
      z += T.grade * R * Math.tanh(s / R);
    }
    return z;
  }
  // By the water: a beach falling into it -- and, a lake, rising out of it on the far side.
  function terrShore(T, lx, ly, z) {
    var W = T.water, u = -(ly + T.F.h / 2), P = T.P;
    var bp = Math.max(W.z - 2.5 * P, W.z + (W.shore - u) * (W.lake ? 0.1 : 0.05));
    var w = terrStep(W.shore - W.wet - 10 * P, W.shore - W.wet, u);
    if (W.far !== null) {
      bp = Math.max(bp, W.z + (u - W.far) * 0.1);
      w *= 1 - terrStep(W.far + 6 * P, W.far + 30 * P, u);
    }
    return z + (bp - z) * w;
  }
  // The street: level across, gently up and down along it.
  function terrProfile(S, lx) {
    var t = (lx - S.x0) / S.step, i = Math.max(0, Math.min(S.prof.length - 2, Math.floor(t))), k = Math.max(0, Math.min(1, t - i));
    return S.prof[i] + (S.prof[i + 1] - S.prof[i]) * k;
  }
  function terrNatural(T, lx, ly) {
    var z = terrRaw(T, lx, ly);
    if (T.water) { z = terrShore(T, lx, ly, z); }
    if (T.street) {
      var S = T.street, e = Math.max(0, S.hy - ly, ly - S.far);
      if (e < 9 * T.P) { z += (terrProfile(S, lx) - z) * (1 - terrStep(0, 9 * T.P, e)); }
    }
    return z;
  }

  // The height of the ground at a spot, over the ground floor (pixels).
  function terrAt(x, y) {
    var T = TERR;
    if (!T || T.off || T.base === undefined) { return 0; }
    var q = terrLocal(T, x, y), g = terrNatural(T, q[0], q[1]) - T.base;
    // cut away round the house: never higher against it than its floor,
    // less the room under the floor -- and rising away from it no steeper
    // than a bank can stand
    var cut = -T.clear + terrOut(T, x, y) * 0.5;
    if (g > cut) { g = cut; }
    // made up to the doors out: a step down from each, a drive up to the garage
    for (var i = 0; i < T.doors.length; i++) {
      var o = T.doors[i];
      if (!o.fill) { continue; }
      var c = o.sill - Math.max(0, Math.hypot(x - o.x, y - o.y) - o.r) * o.k;
      if (c > g) { g = c; }
    }
    return g;
  }
  // The ground's height for the other parts (0 where the land is level).
  function terrGround(x, y) { return TERR_ON ? terrAt(x, y) : 0; }
  // Where a foot comes down: the ground, or a landing or a step over it.
  function terrWalkZ(T, x, y) {
    var g = terrAt(x, y);
    for (var i = 0; i < T.pads.length; i++) {
      var p = T.pads[i], dx = x - p.x, dy = y - p.y;
      if (Math.abs(dx * p.ax + dy * p.ay) <= p.hw && Math.abs(-dx * p.ay + dy * p.ax) <= p.hd && p.top > g) { g = p.top; }
    }
    return g;
  }

  function terrMake(key) {
    var P = FLOOR_PX, scape = typeof worldScapes === "function" ? worldScapes().join("+") : worldScape(), S = terrShapeNow(), k = TERR_K[terrRelief()];
    if (k === undefined) { k = 1; }
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var T = { key: key, P: P, floors: floors, rects: [], under: [], doors: [], pads: [], made: null, lifts: new Map() };
    hand.nodes.forEach(function (r) {
      if (r.kind !== "i_room") { return; }
      var f = floors.length ? floorAt(floors, r.x, r.y) : null, lv = f ? f.level : 0;
      if (lv === 0) { T.rects.push(terrRect(r, f)); } else if (lv < 0) { T.under.push(terrRect(r, f)); }
    });
    if (!T.rects.length) { return { key: key, off: true }; }
    // laid out in the lot's numbers -- the land moves with the lot
    var lot = typeof houseLot === "function" ? houseLot() : null;
    if (!lot) {
      var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
      T.rects.forEach(function (R) { b.l = Math.min(b.l, R.x - R.hw); b.r = Math.max(b.r, R.x + R.hw); b.t = Math.min(b.t, R.y - R.hh); b.b = Math.max(b.b, R.y + R.hh); });
      lot = { x: (b.l + b.r) / 2, y: (b.t + b.b) / 2, w: b.r - b.l, h: b.b - b.t, turn: 0, guessed: true };
    }
    T.F = { x: lot.x, y: lot.y, w: lot.w, h: lot.h, turn: lot.turn || 0, node: lot.guessed ? null : lot };
    var ta = T.F.turn * Math.PI / 180;
    T.ca = Math.cos(ta); T.sa = Math.sin(ta);
    var seed = Math.max(1, Math.round(houseOpt("landSeed") || 1));
    T.oct = S.bumps.map(function (bm, i) { return [bm[0] * k * P, 1 / (bm[1] * P), seed * 131 + i * 7919 + scape.length * 17]; });
    T.grade = S.grade * k;
    var rnd = gl3Rand(seed * 977 + 31), ang = rnd() * Math.PI * 2;
    T.slope = [Math.cos(ang), Math.sin(ang)];
    var look = worldLook();
    T.water = null;
    if (S.water && look.water && WORLD_SHORE[look.water]) {
      var Wd = WORLD_SHORE[look.water];
      T.water = { lake: look.water === "lake", shore: Wd[0] * P, wet: Wd[1] * P, surf: Wd[2] * P,
                  far: look.water === "lake" ? (Wd[0] + 190) * P : null, z: 0 };
      var zs = 0;
      for (var wx = -3; wx <= 3; wx++) { zs += terrRaw(T, wx * 10 * P, -T.F.h / 2 - T.water.shore); }
      T.water.z = zs / 7 - 0.08 * P;
    }
    // the street along the lot's front
    T.street = null;
    if (typeof houseStreetLot === "function" && houseStreetLot()) {
      var walkW = 1.6 * P, roadW = 7 * P, hy = T.F.h / 2, mid = hy + walkW + roadW / 2;
      var St = { hy: hy, far: hy + walkW + roadW + (houseOpt("hood") ? walkW : 0), mid: mid, x0: -520 * P, step: 4 * P, prof: [] };
      for (var si = 0; si <= 260; si++) {
        var lx = St.x0 + si * St.step, sum = 0;
        for (var sj = -4; sj <= 4; sj++) { sum += terrRaw(T, lx + sj * 4 * P, mid); }
        St.prof.push(sum / 9);
      }
      T.street = St;
    }
    // the highest ground under the house, and the lowest round it
    var top = -Infinity, low = Infinity;
    T.rects.forEach(function (R) {
      var nx = Math.min(40, Math.max(2, Math.ceil(R.hw * 2 / (0.5 * P)))), ny = Math.min(40, Math.max(2, Math.ceil(R.hh * 2 / (0.5 * P))));
      for (var i = 0; i <= nx; i++) {
        for (var j = 0; j <= ny; j++) {
          var w = terrPt(R, -R.hw + R.hw * 2 * i / nx, -R.hh + R.hh * 2 * j / ny), q = terrLocal(T, w[0], w[1]);
          var z = terrNatural(T, q[0], q[1]);
          top = Math.max(top, z);
          if (i === 0 || j === 0 || i === nx || j === ny) { low = Math.min(low, z); }
        }
      }
    });
    T.drop = (top - low) / P;
    var pick = terrFoundPick();
    T.found = pick === "auto" ? (scape === "beach" || T.drop > 2.4 ? "posts" : "wall") : pick;
    T.clear = (T.found === "posts" ? (scape === "beach" ? 1.6 : 0.7) : 0.3) * P;
    T.base = top + T.clear;
    if (T.water) { T.water.rel = T.water.z - T.base; }
    TERR = T;                            // (the doors' steps below ask terrAt about this land)
    // the doors out of the ground floor: where each meets its wall, and the way out
    var inAny = function (x, y) { return T.rects.some(function (R) { return terrIn(R, x, y, 0); }); };
    hand.nodes.forEach(function (d) {
      if (!WALK_DOORS[d.kind]) { return; }
      var f = floors.length ? floorAt(floors, d.x, d.y) : null;
      if (f && f.level !== 0) { return; }
      var t = (d.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t);
      var aIn = inAny(d.x + ux * 0.8 * P, d.y + uy * 0.8 * P), bIn = inAny(d.x - ux * 0.8 * P, d.y - uy * 0.8 * P);
      if (aIn === bIn) { return; }
      var ox = aIn ? -ux : ux, oy = aIn ? -uy : uy, x = d.x, y = d.y;
      for (var s = 0; s < 40 && inAny(x, y); s++) { x += ox * 2; y += oy * 2; }
      var garage = d.kind === "i_garagedoor", wide = Math.max(d.w, 0.8 * P);
      T.doors.push({ x: x, y: y, ox: ox, oy: oy, w: wide, garage: garage, n: d,
                     fill: garage || T.found === "wall", sill: (garage ? -0.02 : -0.17) * P,
                     r: garage ? wide / 2 : 1.3 * P, k: garage ? 0.12 : 0.33 });
    });
    // a landing at each door out, and steps down from it to the ground
    T.doors.forEach(function (o) {
      if (o.garage) { return; }
      var ax = -o.oy, ay = o.ox, top = -0.03 * P, depth = 1.2 * P;
      T.pads.push({ x: o.x + o.ox * depth / 2, y: o.y + o.oy * depth / 2, ax: ax, ay: ay, hw: o.w / 2 + 0.3 * P, hd: depth / 2, top: top });
      var at = depth, z = top;
      for (var i = 0; i < 40; i++) {
        var cx = o.x + o.ox * (at + 0.14 * P), cy = o.y + o.oy * (at + 0.14 * P);
        if (z - 0.18 * P <= terrAt(cx, cy) + 0.04 * P) { break; }
        z -= 0.18 * P;
        T.pads.push({ x: cx, y: cy, ax: ax, ay: ay, hw: o.w / 2 + 0.1 * P, hd: 0.14 * P, top: z, step: true });
        at += 0.28 * P;
      }
    });
    T.pads.forEach(function (p) {
      var lo = Infinity;
      [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]].forEach(function (s) {
        lo = Math.min(lo, terrAt(p.x + p.ax * p.hw * s[0] - p.ay * p.hd * s[1], p.y + p.ay * p.hw * s[0] + p.ax * p.hd * s[1]));
      });
      p.lo = Math.min(lo - 0.1 * P, p.top - 0.05 * P);
    });
    return T;
  }

  // ---- the house's foundation, landings and steps ------------------------------------------
  function terrBox(faces, c, al, hw, hd, z0, z1, how, noTop) {
    var ac = [-al[1], al[0]];
    var base = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (s) {
      return [c[0] + al[0] * hw * s[0] + ac[0] * hd * s[1], c[1] + al[1] * hw * s[0] + ac[1] * hd * s[1]];
    });
    for (var i = 0; i < 4; i++) {
      var a = base[i], b = base[(i + 1) % 4], mx = (a[0] + b[0]) / 2 - c[0], my = (a[1] + b[1]) / 2 - c[1], l = Math.hypot(mx, my) || 1;
      faces.push({ pts: [[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]], n: [mx / l, my / l, 0], how: how, found: true });
    }
    if (!noTop) { faces.push({ pts: base.map(function (p) { return [p[0], p[1], z1]; }), n: [0, 0, 1], how: how, top: true, found: true }); }
  }
  function terrBuilt(T) {
    var P = T.P, faces = [], posts = T.found === "posts";
    var conc = { piece: true, color: "#aba79e", edge: "#8a877f", pat: 63, bare: true };
    var wood = { piece: true, color: "#6e604f", edge: "#4c4238", pat: 21, bare: true };
    var deck = posts ? { piece: true, color: "#8d7256", edge: "#5f4c39", pat: 2 }
                     : { piece: true, color: "#bdb9b0", edge: "#8d8a83", pat: 10 };
    function quad(a, b, ta, tb, la, lb, n, how) {
      faces.push({ pts: [[a[0], a[1], la], [b[0], b[1], lb], [b[0], b[1], tb], [a[0], a[1], ta]], n: n, how: how, found: true });
    }
    function inOther(R, x, y) { return T.rects.some(function (o) { return o !== R && terrIn(o, x, y, 0); }); }
    // over a floor under the ground, the foundation starts at that floor's foot
    function topAt(x, y) {
      var z = 0;
      T.under.forEach(function (u) { if (terrIn(u, x, y, 0)) { z = Math.min(z, u.z); } });
      return z;
    }
    T.rects.forEach(function (R) {
      if (T.rects.some(function (o) { return o !== R && o.hw * o.hh > R.hw * R.hh && terrIn(o, R.x, R.y, 0); })) { return; }
      [[-R.hw, -R.hh, R.hw, -R.hh, 0, -1], [R.hw, R.hh, -R.hw, R.hh, 0, 1],
       [-R.hw, R.hh, -R.hw, -R.hh, -1, 0], [R.hw, -R.hh, R.hw, R.hh, 1, 0]].forEach(function (e) {
        var len = Math.hypot(e[2] - e[0], e[3] - e[1]);
        if (len < 1) { return; }
        var ux = (e[2] - e[0]) / len, uy = (e[3] - e[1]) / len, ow = terrRot(R, e[4], e[5]), along = terrRot(R, ux, uy);
        var step = 0.25 * P, runs = [], run = null;
        for (var t = step / 2; t < len; t += step) {
          var lp = terrPt(R, e[0] + ux * t + e[4] * 6, e[1] + uy * t + e[5] * 6);
          var open = !inOther(R, lp[0], lp[1]);
          if (open && !run) { run = [Math.max(0, t - step / 2), Math.min(len, t + step / 2)]; runs.push(run); }
          else if (open) { run[1] = Math.min(len, t + step / 2); }
          else { run = null; }
        }
        runs.forEach(function (r) {
          var n = Math.max(1, Math.ceil((r[1] - r[0]) / (0.5 * P))), pts = [];
          for (var i = 0; i <= n; i++) {
            var t = r[0] + (r[1] - r[0]) * i / n;
            var w = terrPt(R, e[0] + ux * t + e[4] * 0.8, e[1] + uy * t + e[5] * 0.8);
            pts.push({ p: w, top: topAt(w[0] - ow[0] * 0.3 * P, w[1] - ow[1] * 0.3 * P),
                       g: terrAt(w[0] + ow[0] * 0.25 * P, w[1] + ow[1] * 0.25 * P) });
          }
          var nn = [ow[0], ow[1], 0];
          for (var j = 0; j < n; j++) {
            var A = pts[j], B = pts[j + 1];
            if (posts) {
              quad(A.p, B.p, A.top, B.top, A.top - 0.3 * P, B.top - 0.3 * P, nn, wood);
            } else {
              var ba = Math.min(A.top, A.g - 0.12 * P), bb = Math.min(B.top, B.g - 0.12 * P);
              if (ba < A.top - 0.5 || bb < B.top - 0.5) { quad(A.p, B.p, A.top, B.top, ba, bb, nn, conc); }
            }
          }
          if (posts) {
            // a post at each end and every 2.2 m between, a little in from the face
            var count = Math.max(1, Math.round((r[1] - r[0]) / (2.2 * P)));
            for (var k2 = 0; k2 <= count; k2++) {
              var tt = Math.max(r[0] + 0.16 * P, Math.min(r[1] - 0.16 * P, r[0] + (r[1] - r[0]) * k2 / count));
              var c = terrPt(R, e[0] + ux * tt - e[4] * 0.16 * P, e[1] + uy * tt - e[5] * 0.16 * P);
              var gz = terrAt(c[0], c[1]) - 0.15 * P, high = topAt(c[0], c[1]) - 0.3 * P;
              if (gz < high) { terrBox(faces, c, along, 0.12 * P, 0.12 * P, gz, high, wood, true); }
            }
          }
        });
      });
      if (posts) {
        // the floor's underside, seen between the posts
        var under = [[-R.hw, -R.hh], [-R.hw, R.hh], [R.hw, R.hh], [R.hw, -R.hh]].map(function (q) {
          var w = terrPt(R, q[0], q[1]);
          return [w[0], w[1], topAt(R.x, R.y) - 0.3 * P];
        });
        faces.push({ pts: under, n: [0, 0, -1], how: wood, found: true });
      }
    });
    // a landing at each door out, and the steps down from it
    T.pads.forEach(function (p) { terrBox(faces, [p.x, p.y], [p.ax, p.ay], p.hw, p.hd, p.lo, p.top, deck, false); });
    return faces;
  }

  // ---- what stands out of doors, on the land ------------------------------------------------
  // How a piece of the drawing is lifted: draped over the land (a path, a
  // fence), stood level where it is (a bench, a pool), or not at all (it is
  // indoors, upstairs, or in a wall).
  function terrNodeLift(T, n) {
    var key = n.id + "|" + Math.round(n.x) + "|" + Math.round(n.y) + "|" + Math.round(n.w) + "|" + Math.round(n.h) + "|" + (n.turn || 0) + "|" + n.kind;
    if (T.lifts.has(key)) { return T.lifts.get(key); }
    var out = null;
    if (n.kind !== "i_room" && n.kind !== "i_floor" && n.kind !== "i_lot" && n.kind !== "i_zone" && n.kind !== "i_window" &&
        !WALK_DOORS[n.kind] && !SNAP_IN_WALL[n.kind] && !V3_WALL[n.kind] && !FROM_CEILING[n.kind]) {
      var f = T.floors.length ? floorAt(T.floors, n.x, n.y) : null;
      if ((!f || f.level === 0) && terrOut(T, n.x, n.y) > 2) {
        out = TERR_DRAPE[n.kind] || LIES_FLAT[n.kind] ? { drape: true } : { z: terrAt(n.x, n.y) };
      }
    }
    if (T.lifts.size > 4000) { T.lifts.clear(); }
    T.lifts.set(key, out);
    return out;
  }
  function terrDress(model) {
    var T = terrBegin();
    if (!T) { return; }
    var P = T.P;
    model.faces = model.faces.filter(function (f) { return !f.ground; });       // the lawn is the land's own now
    model.faces.forEach(function (f) {
      var n = f.node;
      if (!n || f.found) { return; }
      var L = terrNodeLift(T, n);
      if (!L) { return; }
      if (L.drape) {
        if (f.mesh) { f.terrDrape = true; return; }                          // laid over it as it is drawn (gl3Mesh)
        f.pts = f.pts.map(function (p) { return [p[0], p[1], p[2] + terrAt(p[0], p[1]) + 0.6]; });
        return;
      }
      if (!L.z) { return; }
      f.pts = f.pts.map(function (p) { return [p[0], p[1], p[2] + L.z]; });
    });
    // those standing out of doors, and the names of what is out there
    model.stand.forEach(function (s) {
      if (s.z < 0.5 * P && terrOut(T, s.x, s.y) > 2) { s.z += terrWalkZ(T, s.x, s.y); }
    });
    model.labels.forEach(function (l) {
      if (!l.room && l.z < 3 * P && terrOut(T, l.x, l.y) > 2) { l.z += terrAt(l.x, l.y); }
    });
    if (!T.made) { T.made = terrBuilt(T); }
    model.faces = model.faces.concat(T.made);
  }
  if (typeof v3Build === "function") {
    var v3BuildLand = v3Build;
    v3Build = function () {
      var model = v3BuildLand.apply(this, arguments);
      try { terrDress(model); } catch (e) { /* on level ground, as it was */ }
      return model;
    };
  }
  // The lines round the lot (39-house.js), laid on the land.
  if (typeof landFaces === "function") {
    var landFacesLevel = landFaces;
    landFaces = function (model) {
      var f0 = model.faces.length, l0 = model.labels.length;
      var got = landFacesLevel.apply(this, arguments);
      try {
        if (terrBegin()) {
          for (var i = f0; i < model.faces.length; i++) {
            model.faces[i].pts = model.faces[i].pts.map(function (p) { return [p[0], p[1], p[2] + terrAt(p[0], p[1]) + 0.8]; });
          }
          for (var j = l0; j < model.labels.length; j++) { model.labels[j].z += terrAt(model.labels[j].x, model.labels[j].y); }
        }
      } catch (e) { /* as drawn */ }
      return got;
    };
  }
  // Models that lie on the land (a drive, a path), each corner on it.
  var terrDraped = new WeakMap();
  if (typeof gl3Mesh === "function") {
    var gl3MeshLevel = gl3Mesh;
    gl3Mesh = function (B, f) {
      var out = gl3MeshLevel.apply(this, arguments);
      if (!f.terrDrape || !TERR_ON || !TERR) { return out; }
      var how = f.how, batch = how.glass ? B.get("glass", { blend: true, late: true })
                : how.shade ? B.get("shade", { blend: true, late: true, noDepthWrite: true }) : B.get("models", {});
      var list = batch.chunks, data = list && list[list.length - 1];
      if (!data) { return out; }
      var got = terrDraped.get(data);
      if (!got || got.key !== TERR.key) {
        var d2 = new Float32Array(data);
        for (var o = 0; o < d2.length; o += GL3_STRIDE) { d2[o + 2] += terrAt(d2[o], d2[o + 1]) + 0.8; }
        got = { key: TERR.key, data: d2 };
        terrDraped.set(data, got);
      }
      list[list.length - 1] = got.data;
      return out;
    };
  }
  // People out walking and cars going by (39-world.js), on the street as it goes.
  if (typeof worldFolk === "function") {
    var worldFolkLevel = worldFolk;
    worldFolk = function (model) {
      var out = worldFolkLevel.apply(this, arguments);
      try {
        var T = terrBegin();
        if (T && model.passing) {
          model.passing.stand.forEach(function (s) { s.z += terrH(T, s.x, s.y); });
          model.passing.faces.forEach(function (f) { f.pts = f.pts.map(function (p) { return [p[0], p[1], p[2] + terrH(T, p[0], p[1])]; }); });
        }
      } catch (e) { /* on the level */ }
      return out;
    };
  }

  // ---- walking on it ----------------------------------------------------------------------
  // The eye, out of doors, as high over the ground as it is over a floor
  // (38-view3d.js asks, as it puts the eye where you are) -- eased, a step
  // at a time, not jumping.
  function terrEye(here) {
    var T = terrBegin();
    if (!T || !V3 || !V3.me || (here && here.level !== 0)) { if (V3) { V3.terrZ = 0; } return 0; }
    var want = 0;
    try { want = roomAt(v3Ground(), V3.me.x, V3.me.y) ? 0 : terrWalkZ(T, V3.me.x, V3.me.y); } catch (e) { want = 0; }
    var was = V3.terrZ === undefined || V3.terrZ === null ? want : V3.terrZ;
    var now = was + (want - was) * 0.3;
    if (Math.abs(want - now) < 0.25) { now = want; } else { V3.dirty = true; }
    V3.terrZ = now;
    return now;
  }
  // What a body walking out of doors bumps into: what stands round it at
  // the height it walks at.
  if (typeof v3Nearest === "function") {
    var v3NearestLevel = v3Nearest;
    v3Nearest = function (px, py, z) {
      if (!z && TERR_ON && TERR) {
        try { if (!roomAt(v3Ground(), px, py)) { z = terrWalkZ(TERR, px, py); } } catch (e) { /* level */ }
      }
      return v3NearestLevel.call(this, px, py, z);
    };
  }

  // ---- the scenery, made on the land ----------------------------------------------------------
  var terrScene = false, terrLift = null, terrNeighbor = null;
  // The height of the land's mesh at a spot (what the scenery stands on), or
  // where there is no mesh yet, the land's own height.
  function terrH(T, x, y) { return T.mesh ? terrMeshAt(T, x, y) : terrAt(x, y); }
  function terrFind(a, v) {
    var lo = 0, hi = a.length - 1;
    if (v <= a[0]) { return 0; }
    if (v >= a[hi]) { return hi - 1; }
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (a[m] <= v) { lo = m; } else { hi = m; } }
    return lo;
  }
  function terrMeshAt(T, x, y) {
    var M = T.mesh, q = terrLocal(T, x, y);
    var i = terrFind(M.xs, q[0]), j = terrFind(M.ys, q[1]), nx = M.xs.length;
    var fx = Math.max(0, Math.min(1, (q[0] - M.xs[i]) / (M.xs[i + 1] - M.xs[i])));
    var fy = Math.max(0, Math.min(1, (q[1] - M.ys[j]) / (M.ys[j + 1] - M.ys[j])));
    var a = M.H[j * nx + i], b = M.H[j * nx + i + 1], c = M.H[(j + 1) * nx + i], d = M.H[(j + 1) * nx + i + 1];
    // (on the two flat triangles the ground is drawn as, cut along the
    // shorter way across (terrMesh) -- not a smooth blend of the corners: out
    // where the squares are tens of metres across, a tree on the blend stood
    // metres off the ground drawn under it, 2026-10-03)
    if (Math.abs(a - d) <= Math.abs(b - c)) {
      return fx >= fy ? a + (b - a) * fx + (d - b) * fy : a + (d - c) * fx + (c - a) * fy;
    }
    return fx + fy <= 1 ? a + (b - a) * fx + (c - a) * fy : d + (c - d) * (1 - fx) + (b - d) * (1 - fy);
  }
  function terrNormalAt(T, x, y) {
    var e = 0.6 * T.P, gx = (terrMeshAt(T, x + e, y) - terrMeshAt(T, x - e, y)) / (2 * e), gy = (terrMeshAt(T, x, y + e) - terrMeshAt(T, x, y - e)) / (2 * e);
    var l = Math.hypot(gx, gy, 1);
    return [-gx / l, -gy / l, 1 / l];
  }
  // Lines across the land, in the lot's numbers: close together near the
  // house, further apart going out, and one on every edge that matters --
  // the lot's, the pavement's, the road's, the water's.
  function terrLines(lo, hi, fineLo, fineHi, step, keys) {
    var out = [];
    for (var x = fineLo; x < fineHi; x += step) { out.push(x); }
    out.push(fineHi);
    var s = step, at = fineHi;
    while (at < hi) { s *= 1.25; at += s; out.push(Math.min(at, hi)); }
    s = step; at = fineLo;
    while (at > lo) { s *= 1.25; at -= s; out.push(Math.max(at, lo)); }
    var all = out.concat(keys.filter(function (k) { return k > lo && k < hi; })).sort(function (a, b) { return a - b; });
    var keep = [];
    all.forEach(function (v) {
      var isKey = keys.indexOf(v) >= 0, last = keep[keep.length - 1];
      if (last === undefined || v - last.v > step * 0.35) { keep.push({ v: v, key: isKey }); }
      else if (isKey && !last.key) { last.v = v; last.key = true; }
    });
    return keep.map(function (k) { return k.v; });
  }
  function terrMesh(v, L) {
    var T = TERR, P = T.P, F = T.F, look = worldLook(), sheetC = L.sheetC;
    var land = gl3Mix(look.ground, sheetC, 0.12), landPat = look.pat;
    if (gl3SnowNow) { land = gl3Mix(land, [0.93, 0.94, 0.97], 0.88); landPat = 72; }
    else if (typeof houseWet === "function" && houseWet()) { land = gl3Mix(land, [0, 0, 0], 0.12); }
    // the lot's lawn, as the drawing colors it (gl3Faces did, for the lot's own face)
    var lawn = worldLawn(), lawnC = null, lawnPat = lawn ? lawn.pat : PAT.lawn;
    if (F.node) {
      var lc = gl3Rgb(simLook(F.node).fill || simSheet());
      lawnC = gl3Mix(gl3Mix(lc, lawn ? lawn.color : [0.42, 0.62, 0.3], lawn ? 0.75 : 0.55), sheetC, 0.15);
      if (typeof houseWet === "function" && houseWet()) { lawnC = gl3Mix(lawnC, [0.12, 0.2, 0.1], 0.22); }
      if (gl3SnowNow) { lawnC = gl3Mix(lawnC, [0.94, 0.95, 0.98], 0.86); }
    }
    var pave = gl3Mix([0.8, 0.79, 0.76], sheetC, 0.2), road = gl3Mix([0.3, 0.31, 0.33], sheetC, 0.08);
    var W = T.water, damp = null;
    if (W) { damp = W.lake ? gl3Mix(land, [0.25, 0.3, 0.18], 0.4) : gl3Mix(land, [0.55, 0.47, 0.36], 0.45); }
    // where the mesh reaches: the whole disc of ground round the house
    var m = terrLocal(T, L.mid[0], L.mid[1]), R = L.groundR, step = 1.5 * P;
    var St = T.street, keysX = [-F.w / 2, F.w / 2], keysY = [-F.h / 2, F.h / 2];
    if (St) { keysY.push(St.hy + 1.6 * P, St.hy + 8.6 * P, St.far); }
    if (W) {
      var yOf = function (u) { return -F.h / 2 - u; };
      keysY.push(yOf(W.shore - W.wet), yOf(W.shore), yOf(W.shore + W.surf));
      if (W.far !== null) { keysY.push(yOf(W.far)); }
    }
    // (the house's own edges too, where it stands square to the lot: the
    // ground under a floor dug into it is cut out along them)
    T.rects.concat(T.under).forEach(function (Rc) {
      var cr = Rc.c * T.ca + Rc.s * T.sa, sr = Rc.s * T.ca - Rc.c * T.sa;
      if (Math.abs(cr) < 0.999 && Math.abs(sr) < 0.999) { return; }
      var q = terrLocal(T, Rc.x, Rc.y), w = Math.abs(cr) > 0.5 ? Rc.hw : Rc.hh, h = Math.abs(cr) > 0.5 ? Rc.hh : Rc.hw;
      keysX.push(q[0] - w, q[0] + w); keysY.push(q[1] - h, q[1] + h);
    });
    var fx0 = Math.max(m[0] - R, -F.w / 2 - 30 * P), fx1 = Math.min(m[0] + R, F.w / 2 + 30 * P);
    var fy0 = Math.max(m[1] - R, -F.h / 2 - (W ? W.shore + W.surf + 12 * P : 30 * P)), fy1 = Math.min(m[1] + R, (St ? St.far : F.h / 2) + 25 * P);
    var xs = terrLines(m[0] - R, m[0] + R, Math.min(fx0, fx1), Math.max(fx0, fx1), step, keysX);
    var ys = terrLines(m[1] - R, m[1] + R, Math.min(fy0, fy1), Math.max(fy0, fy1), step, keysY);
    var nx = xs.length, ny = ys.length, H = new Float64Array(nx * ny);
    var lo = Infinity, hi = -Infinity, nearLo = 0;
    for (var j = 0; j < ny; j++) {
      for (var i = 0; i < nx; i++) {
        var wp = terrWorld(T, xs[i], ys[j]), z = terrAt(wp[0], wp[1]);
        H[j * nx + i] = z;
        if (Math.hypot(wp[0] - L.mid[0], wp[1] - L.mid[1]) <= R) {
          lo = Math.min(lo, z); hi = Math.max(hi, z);
          if (Math.abs(xs[i]) < F.w / 2 + 25 * P && ys[j] > -F.h / 2 - 25 * P && ys[j] < F.h / 2 + 25 * P) { nearLo = Math.min(nearLo, z); }
        }
      }
    }
    T.mesh = { xs: xs, ys: ys, H: H };
    T.span = { lo: lo === Infinity ? 0 : lo, hi: hi === -Infinity ? 0 : hi, nearLo: nearLo };
    // each node's way out of the land, from its neighbours
    var N = new Float32Array(nx * ny * 3);
    for (var j2 = 0; j2 < ny; j2++) {
      for (var i2 = 0; i2 < nx; i2++) {
        var il = Math.max(0, i2 - 1), ir = Math.min(nx - 1, i2 + 1), jl = Math.max(0, j2 - 1), jr = Math.min(ny - 1, j2 + 1);
        var gx = (H[j2 * nx + ir] - H[j2 * nx + il]) / ((xs[ir] - xs[il]) || 1), gy = (H[jr * nx + i2] - H[jl * nx + i2]) / ((ys[jr] - ys[jl]) || 1);
        var ln = Math.hypot(gx, gy, 1), lx = -gx / ln, ly = -gy / ln;
        N[(j2 * nx + i2) * 3] = lx * T.ca - ly * T.sa; N[(j2 * nx + i2) * 3 + 1] = lx * T.sa + ly * T.ca; N[(j2 * nx + i2) * 3 + 2] = 1 / ln;
      }
    }
    // under a floor dug into the ground: no land in the way
    function dug(cx, cy) {
      if (!T.under.length) { return false; }
      var w = terrWorld(T, cx, cy);
      return T.under.some(function (u) { return terrIn(u, w[0], w[1], -1); });
    }
    var lotHw = F.w / 2, lotTop = -F.h / 2, lotFoot = F.h / 2;
    for (var cj = 0; cj + 1 < ny; cj++) {
      for (var ci = 0; ci + 1 < nx; ci++) {
        var x0 = xs[ci], x1 = xs[ci + 1], y0 = ys[cj], y1 = ys[cj + 1], cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        var corners = [[ci, cj], [ci + 1, cj], [ci + 1, cj + 1], [ci, cj + 1]];
        var w4 = corners.map(function (k) { return terrWorld(T, xs[k[0]], ys[k[1]]); });
        if (w4.every(function (p) { return Math.hypot(p[0] - L.mid[0], p[1] - L.mid[1]) > R; })) { continue; }
        if (T.under.length && w4.every(function (p, k) { return dug(xs[corners[k][0]], ys[corners[k][1]]); })) { continue; }
        // what this bit of ground is
        var col = land, pat = landPat, uv = null;
        if (St && cy > St.hy && cy < St.far) {
          var inRoad = cy > St.hy + 1.6 * P && cy < St.hy + 8.6 * P;
          col = inRoad ? road : pave; pat = inRoad ? PAT.road : PAT.walk;
          uv = inRoad ? function (x, y) { return [x / P, (y - St.mid) / P]; } : function (x, y) { return [x / P, (y - (y > St.hy + 8.6 * P ? St.hy + 8.6 * P : St.hy)) / P]; };
        } else if (lawnC && Math.abs(cx) < lotHw && cy > lotTop && cy < lotFoot) {
          col = lawnC; pat = lawnPat; uv = function (x, y) { return [x / P, y / P]; };
        } else if (W) {
          var u = -(cy + F.h / 2);
          if (u > W.shore - W.wet && (W.far === null || u < W.far + 3 * P)) { col = damp; }
        }
        var vs = corners.map(function (k, idx) {
          var id = k[1] * nx + k[0], p = w4[idx];
          return { p: [p[0], p[1], H[id]], n: [N[id * 3], N[id * 3 + 1], N[id * 3 + 2]], uv: uv ? uv(xs[k[0]], ys[k[1]]) : [0, 0] };
        });
        // the two triangles cut along the shorter way across
        var tris = Math.abs(vs[0].p[2] - vs[2].p[2]) <= Math.abs(vs[1].p[2] - vs[3].p[2]) ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 3], [1, 2, 3]];
        tris.forEach(function (t) { t.forEach(function (k) { gl3Vert(v, vs[k].p, vs[k].n, col, 1, vs[k].uv, pat); }); });
      }
    }
    // the water, level, over the land that falls under it
    if (W) {
      var disc = [];
      for (var d = 0; d < 72; d++) {
        var th = d / 72 * Math.PI * 2;
        disc.push([L.mid[0] + Math.cos(th) * R, L.mid[1] + Math.sin(th) * R, W.rel]);
      }
      var B = worldBack(L), water = W.lake ? gl3Mix([0.2, 0.38, 0.4], sheetC, 0.08) : gl3Mix([0.16, 0.4, 0.52], sheetC, 0.08);
      if (gl3SnowNow) { water = gl3Mix(water, [0.75, 0.82, 0.86], 0.35); }
      var put = function (lo2, hi2, c, p, z) {
        var part = worldClip(disc, B.o, B.d, lo2, hi2);
        if (part) { gl3PolyLevel(v, part.map(function (q) { return [q[0], q[1], z]; }), [0, 0, 1], c, 1, null, p); }
      };
      if (W.surf) { put(W.shore - 2 * P, W.shore + W.surf, gl3Mix(water, [0.92, 0.95, 0.96], 0.7), 9, W.rel + 0.6); }
      put(W.surf ? W.shore + W.surf : W.shore - 2 * P, W.far, water, 9, W.rel);
      L.keepOff.push(function (p) {
        var uu = (p[0] - B.o[0]) * B.d[0] + (p[1] - B.o[1]) * B.d[1];
        return uu > W.shore - W.wet - 1.5 * P && (W.far === null || uu < W.far + 3 * P);
      });
      L.water = { o: B.o, d: B.d, from: W.shore, to: W.far };
    }
  }
  // How far and low the land goes, for the view's depth and the sun's (38-view3d-gl.js).
  function terrSpan() {
    var T = TERR;
    if (!TERR_ON || !T || T.off || !T.span) { return { lo: 0, hi: 0, nearLo: 0 }; }
    return T.span;
  }

  // While the scenery is made: what it puts down, on the land.
  if (typeof gl3Scenery === "function") {
    var gl3SceneryLevel = gl3Scenery;
    gl3Scenery = function () {
      var T = terrBegin();
      if (T) { T.mesh = T.mesh || null; }
      terrScene = !!T; terrLift = null; terrNeighbor = null;
      try { return gl3SceneryLevel.apply(this, arguments); }
      finally { terrScene = false; terrLift = null; terrNeighbor = null; }
    };
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyLevel = houseSceneKey;
    houseSceneKey = function () {
      var T = TERR_ON ? TERR : null, h = 0;
      if (T && !T.off && T.key) { for (var i = 0; i < T.key.length; i++) { h = (Math.imul(h, 31) + T.key.charCodeAt(i)) | 0; } }
      return houseSceneKeyLevel() + "|t" + (T && !T.off ? h : 0);
    };
  }
  if (typeof worldGround === "function") {
    var worldGroundLevel = worldGround;
    worldGround = function (v, L) {
      if (!terrScene || !TERR_ON || !TERR) { return worldGroundLevel.apply(this, arguments); }
      TERR.mesh = null;
      terrMesh(v, L);
      return true;
    };
  }
  // One face laid over the land: cut into small triangles, each corner on it.
  function terrDrape(v, pts, c, a, uvs, pat) {
    var T = TERR, P = T.P;
    for (var i = 1; i + 1 < pts.length; i++) {
      var A = pts[0], B = pts[i], C = pts[i + 1];
      var ua = uvs ? uvs[0] : [0, 0], ub = uvs ? uvs[i] : [0, 0], uc = uvs ? uvs[i + 1] : [0, 0];
      var len = Math.max(Math.hypot(B[0] - A[0], B[1] - A[1]), Math.hypot(C[0] - A[0], C[1] - A[1]), Math.hypot(C[0] - B[0], C[1] - B[1]));
      var k = Math.max(1, Math.min(200, Math.ceil(len / (2 * P)))), kept = {};
      var at = function (r, s) {
        var key = r * 1000 + s;
        if (kept[key]) { return kept[key]; }
        var fb = s / k, fc = r / k, fa = 1 - fb - fc;
        var x = A[0] * fa + B[0] * fb + C[0] * fc, y = A[1] * fa + B[1] * fb + C[1] * fc, z0 = A[2] * fa + B[2] * fb + C[2] * fc;
        var got = { p: [x, y, terrMeshAt(T, x, y) + z0 + 3.5], n: terrNormalAt(T, x, y),
                    uv: [ua[0] * fa + ub[0] * fb + uc[0] * fc, ua[1] * fa + ub[1] * fb + uc[1] * fc] };
        kept[key] = got;
        return got;
      };
      for (var r = 0; r < k; r++) {
        for (var s = 0; s < k - r; s++) {
          var p0 = at(r, s), p1 = at(r, s + 1), p2 = at(r + 1, s);
          [p0, p1, p2].forEach(function (q) { gl3Vert(v, q.p, q.n, c, a, q.uv, pat); });
          if (s + r + 1 < k) {
            var p3 = at(r + 1, s + 1);
            [p1, p3, p2].forEach(function (q) { gl3Vert(v, q.p, q.n, c, a, q.uv, pat); });
          }
        }
      }
    }
  }
  function terrWide(pts) {
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    pts.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    return Math.max(x1 - x0, y1 - y0);
  }
  var gl3PolyLevel = gl3Poly;
  gl3Poly = function (v, pts, n, c, a, uvs, pat) {
    var T = terrScene ? TERR : null;
    if (!T || !T.mesh) { return gl3PolyLevel.apply(this, arguments); }
    // flat on the ground: laid over it -- the street and its pavements are
    // the land's own (terrMesh), not laid again
    if (n[2] > 0.999 && pts.every(function (p) { return Math.abs(p[2]) <= 6; })) {
      if (T.street && (pat === PAT.road || pat === PAT.walk) && terrWide(pts) > 60 * T.P) { return; }
      terrDrape(v, pts, c, a, uvs, pat);
      return;
    }
    // a house next door: all of it as high as its own ground is; anything
    // else, each corner where the land is under it
    var lift = terrLift;
    return gl3PolyLevel(v, pts.map(function (p) { return [p[0], p[1], p[2] + (lift !== null ? lift : terrMeshAt(T, p[0], p[1]))]; }), n, c, a, uvs, pat);
  };
  // What grows is lifted where it grows, even in a neighbor's garden.
  if (typeof worldPlant === "function") {
    var worldPlantLevel = worldPlant;
    worldPlant = function () {
      var was = terrLift;
      terrLift = null;
      try { return worldPlantLevel.apply(this, arguments); } finally { terrLift = was; }
    };
  }
  // The houses next door, each level on ground of its own, its foundation
  // down to the land round it.
  if (typeof worldNeighbor === "function") {
    var worldNeighborLevel = worldNeighbor;
    worldNeighbor = function (v, L) {
      if (!terrScene || !TERR || !TERR.mesh) { return worldNeighborLevel.apply(this, arguments); }
      var N = { foot: null, pad: 0 };
      terrNeighbor = N; terrLift = null;
      try { return worldNeighborLevel.apply(this, arguments); }
      finally {
        terrNeighbor = null; terrLift = null;
        if (N.foot) { try { terrSkirt(v, N.foot, N.pad); } catch (e) { /* none */ } }
      }
    };
  }
  function terrCorners(c0, e, d, hx, hy) {
    return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (s) {
      return [c0[0] + e[0] * hx * s[0] + d[0] * hy * s[1], c0[1] + e[1] * hx * s[0] + d[1] * hy * s[1]];
    });
  }
  function terrSkirt(v, foot, pad) {
    var T = TERR, P = T.P, pts = terrCorners(foot.c, foot.e, foot.d, foot.hx + 0.02 * P, foot.hy + 0.02 * P);
    var col = gl3Mix([0.64, 0.63, 0.6], [1, 1, 1], 0.05);
    for (var i = 0; i < 4; i++) {
      var a = pts[i], b = pts[(i + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(len / P));
      var mx = (a[0] + b[0]) / 2 - foot.c[0], my = (a[1] + b[1]) / 2 - foot.c[1], ml = Math.hypot(mx, my) || 1;
      for (var k = 0; k < n; k++) {
        var p = [a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n], q = [a[0] + (b[0] - a[0]) * (k + 1) / n, a[1] + (b[1] - a[1]) * (k + 1) / n];
        var gp = terrMeshAt(T, p[0], p[1]) - 0.2 * P, gq = terrMeshAt(T, q[0], q[1]) - 0.2 * P;
        if (gp >= pad && gq >= pad) { continue; }
        gl3PolyLevel(v, [[p[0], p[1], Math.min(gp, pad)], [q[0], q[1], Math.min(gq, pad)], [q[0], q[1], pad], [p[0], p[1], pad]],
                     [mx / ml, my / ml, 0], col, 1, null, 63);
      }
    }
  }
  if (typeof worldBox === "function") {
    var worldBoxLevel = worldBox;
    worldBox = function (v, c0, e, d, hx, hy, z0, z1) {
      var N = terrScene ? terrNeighbor : null;
      if (!N || !TERR || !TERR.mesh) { return worldBoxLevel.apply(this, arguments); }
      var T = TERR, P = T.P, args = Array.prototype.slice.call(arguments);
      if (!N.foot) {
        // its walls, first: the ground floor stands a little over the land under it
        N.foot = { c: c0.slice(), e: e, d: d, hx: hx, hy: hy };
        var hs = terrCorners(c0, e, d, hx, hy).concat([c0]).map(function (p) { return terrMeshAt(T, p[0], p[1]); });
        var most = Math.max.apply(null, hs), mean = hs.reduce(function (s, z) { return s + z; }, 0) / hs.length;
        N.pad = (most + mean) / 2 + 0.3 * P;
        terrLift = N.pad;
        return worldBoxLevel.apply(this, args);
      }
      // away from the house (a car on its drive): on the land where it is
      var ex = c0[0] - N.foot.c[0], ey = c0[1] - N.foot.c[1];
      var ue = Math.abs(ex * N.foot.e[0] + ey * N.foot.e[1]) - N.foot.hx, ud = Math.abs(ex * N.foot.d[0] + ey * N.foot.d[1]) - N.foot.hy;
      if (Math.max(ue, ud) > 1 * P) {
        terrLift = null;
        try { return worldBoxLevel.apply(this, args); } finally { terrLift = N.pad; }
      }
      // low against it (a step at the door): down to the ground
      if (z1 <= 0.3 * P) {
        var low = Math.min.apply(null, terrCorners(c0, e, d, hx, hy).map(function (p) { return terrMeshAt(T, p[0], p[1]); }));
        args[6] = Math.min(z0, low - N.pad - 0.05 * P);
      }
      return worldBoxLevel.apply(this, args);
    };
  }

  // ---- in the view's Settings, the Land tab (39-house.js) ------------------------------------
  var TERR_ICONS = {
    tr_auto: '<path d="M2 15.6c2.4-3.6 4.4-5.2 6.4-5.2 1.6 0 2.6 1.4 3.8 1.4 1.4 0 2.6-2.6 5.8-5.2M2 17.6h16"/><circle cx="14.8" cy="3.8" r="1.4"/>',
    tr_flat: '<path d="M2 12.6h16M2 16.4h16"/><path d="M6 12.6V9.4h4v3.2"/>',
    tr_gentle: '<path d="M2 14.4c3.2-1.8 5.6-2.4 8-2.4s4.8.6 8 2.4M2 17.4h16"/>',
    tr_rolling: '<path d="M2 15c1.8-3 3.4-4.4 5-4.4s2.6 2.6 4.2 2.6 3-4.2 6.8-5.4M2 17.6h16"/>',
    tr_steep: '<path d="M2 17.4 9 9.6l2.4 2.4 6.6-8.6M2 17.6h16"/>',
    tf_auto: '<path d="M4 9.6 10 4.4l6 5.2M5.4 8.4v5.4h9.2V8.4"/><path d="M3 13.8h14M3 13.8l1.6 3.6M17 13.8l-1.6 3.6"/>',
    tf_wall: '<path d="M4 8.6 10 3.6l6 5M5.4 7.4v5.6h9.2V7.4"/><path d="M5.4 13h9.2v3H5.4zM8.4 13v3M11.6 13v3"/><path d="M2 17.6h16"/>',
    tf_posts: '<path d="M4 7.4 10 2.6l6 4.8M5.4 6.4v5.2h9.2V6.4"/><path d="M6.4 11.6v6M13.6 11.6v6M10 11.6v6M2 17.6h16"/>',
    tr_new: HOUSE_ICONS.shuffle
  };
  Object.keys(TERR_ICONS).forEach(function (k) { HOUSE_ICONS[k] = TERR_ICONS[k]; });
  function terrSection(sheet, head, tiles, draw) {
    head(TXT.tr_head);
    worldPicker(sheet, TERR_RELIEFS, terrRelief(), "tr_", function (k) { houseSetOpt("relief", k); draw(); });
    head(TXT.tf_head);
    worldPicker(sheet, TERR_FOUNDS, terrFoundPick(), "tf_", function (k) { houseSetOpt("found", k); draw(); });
    tiles([{ icon: "tr_new", label: TXT.tr_new, on: false, off: TERR_K[terrRelief()] ? "" : TXT.tr_new_off,
             set: function () { houseSetOpt("landSeed", (Math.max(1, Math.round(houseOpt("landSeed") || 1)) % 9973) + 1 + Math.floor(Math.random() * 50)); } }]);
    // what the land does under the house, said in words
    var T = TERR;
    if (T && !T.off && T.drop >= 0.1) {
      var p = document.createElement("p");
      p.className = "hs-note";
      p.innerHTML = houseIcon(T.found === "posts" ? "tf_posts" : "tf_wall") + "<span></span>";
      p.lastChild.textContent = say(T.found === "posts" ? "tr_says_posts" : "tr_says_wall", { n: lenSay(T.drop) });
      sheet.appendChild(p);
    }
  }
