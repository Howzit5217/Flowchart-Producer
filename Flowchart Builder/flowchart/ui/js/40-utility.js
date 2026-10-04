// ---------------------------------------------------------------------------
//  40-utility.js -- what joins a house to the street: power on poles along
//  the front or the back (or under the ground), a wire down from the
//  nearest pole to a meter on the wall; and a dryer's vent out of the
//  laundry
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "to also have like dryer vents on the outside,
  // electric wire poles or set to underground going across the front or
  // back hooked up to the house")
  //
  // The poles and the wires along them are the street's (gl3Scenery,
  // 38-view3d-gl.js), standing on the land where it is (40-land.js); the
  // wire down to the house, the meter it comes to and the dryer's vent are
  // the house's own (v3Build).  Both work out where the poles are the same
  // way, from the lot: every 36 m, never in a path or a drive, nor on a
  // street lamp.
  HOUSE_PLAIN.power = "front";
  HOUSE_PLAIN.vents = true;
  var POWER_KINDS = ["front", "back", "under", "none"];
  var POWER_EVERY = 36, POWER_TALL = 10.2, POWER_ARM = 9.6, POWER_LOW = 7.5;      // metres
  var POWER_WOOD = [0.36, 0.28, 0.2];
  var POWER_REACH = 2.1, POWER_PINS = [0.35, 1.15, 1.95];      // metres: the arm out from the pole, and where its three wires are on it
  function powerKind() { var k = houseOpt("power"); return POWER_KINDS.indexOf(k) >= 0 ? k : "front"; }

  // The lot's own numbers, x along the street and y toward it, for a lot.
  function powerFrame(lot) {
    var a = (lot.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return {
      lot: lot, hy: lot.h / 2, e: [c, s], d: [-s, c],
      world: function (lx, ly) { return [lot.x + lx * c - ly * s, lot.y + lx * s + ly * c]; },
      local: function (p) { var dx = p[0] - lot.x, dy = p[1] - lot.y; return [dx * c + dy * s, -dx * s + dy * c]; }
    };
  }
  // Where the poles stand along the lot's front (or back): every 36 m,
  // moved along till none is in a path, a drive, or on a lamp.
  function powerPoles(F, back) {
    var P = FLOOR_PX, every = POWER_EVERY * P, busy = [];
    hand.nodes.forEach(function (n) {
      var q = F.local([n.x, n.y]);
      if (n.kind === "i_driveway") { var hw = turned(n).w / 2; busy.push([q[0] - hw - 0.8 * P, q[0] + hw + 0.8 * P]); }
      else if (WALK_DOORS[n.kind] && n.kind !== "i_garagedoor") { busy.push([q[0] - 1.3 * P, q[0] + 2.6 * P]); }   // its path, and the mailbox by it
    });
    var lamps = !back && typeof worldLampKind === "function" && worldLampKind() !== "none";
    var lampAt = typeof worldLampShift === "function" ? worldLampShift() / P : 9;
    var best = 0;
    for (var o = 0; o < POWER_EVERY; o += 1) {
      // (off the street lamps, wherever they were slid to, 39-world.js)
      if (lamps) { var lo = ((o - lampAt) % 18 + 18) % 18; if (lo < 3 || lo > 15) { continue; } }
      var ok = true;
      for (var k = -3; k <= 3 && ok; k++) {
        var x = (o + k * POWER_EVERY) * P;
        if (busy.some(function (b) { return x > b[0] && x < b[1]; })) { ok = false; }
      }
      if (ok) { best = o; break; }
    }
    // (in front: at the kerb -- in the strip of grass where the sidewalk is stepped back from it,
    // else at the sidewalk's street edge -- its arm reaching out over the road, powerStreet)
    var walk = typeof streetWalkPx === "function" ? streetWalkPx() : 1.6 * P, verge = typeof streetVergePx === "function" ? streetVergePx() : 0;
    var y = back ? -F.hy + 0.6 * P : F.hy + walk - (verge ? 0.45 : 0.22) * P;
    var out = [];
    for (var j = -6; j <= 6; j++) { out.push({ lx: (best + j * POWER_EVERY) * P, ly: y }); }
    return out;
  }
  function powerGround(x, y) {
    if (typeof TERR !== "undefined" && TERR && !TERR.off && TERR.mesh && typeof terrMeshAt === "function" && TERR_ON) { return terrMeshAt(TERR, x, y); }
    return typeof terrGround === "function" ? terrGround(x, y) : 0;
  }
  // A wire hanging between two points, as points along it.
  function powerSag(a, b, sag, n) {
    var out = [];
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t - 4 * sag * t * (1 - t)]);
    }
    return out;
  }

  // ---- along the street -------------------------------------------------------------
  function powerStreet(v, lot, sheetC) {
    var kind = powerKind();
    if (kind === "none") { return; }
    var P = FLOOR_PX, F = powerFrame(lot), wood = gl3Mix(POWER_WOOD, sheetC, 0.08), grey = gl3Mix([0.55, 0.57, 0.58], sheetC, 0.08);
    var wire = [0.08, 0.08, 0.09], glassy = gl3Mix([0.42, 0.55, 0.5], sheetC, 0.08);
    var keepLift = typeof terrLift !== "undefined" ? terrLift : null;
    function lifted(fn, z) { if (typeof terrLift !== "undefined") { terrLift = z; } try { fn(); } finally { if (typeof terrLift !== "undefined") { terrLift = keepLift; } } }
    if (kind === "under") {
      // a transformer on its pad by the front corner of the lot, the cable under the lawn
      var c = F.world(-F.lot.w / 2 + 1.4 * P, F.hy - 1.0 * P), g = powerGround(c[0], c[1]);
      var green = gl3Mix([0.25, 0.36, 0.28], sheetC, 0.08);
      lifted(function () {
        worldBox(v, c, F.e, F.d, 0.65 * P, 0.55 * P, 0, 0.14 * P, gl3Mix([0.7, 0.7, 0.68], sheetC, 0.1), PAT.concrete);
        worldBox(v, c, F.e, F.d, 0.5 * P, 0.42 * P, 0.14 * P, 0.95 * P, green, 22);
      }, g);
      return;
    }
    // the way to the house along d, and the way away from it: the arm, its wires, the low wire and the
    // transformer all out that way, over the road (or the lane behind) -- none over the sidewalk
    // (2026-10-04: "the power lines stop running on top of the sidewalks")
    var poles = powerPoles(F, kind === "back"), toLot = kind === "back" ? 1 : -1, out = -toLot;
    var tops = poles.map(function (p) {
      var w = F.world(p.lx, p.ly), g = powerGround(w[0], w[1]);
      lifted(function () {
        worldTube(v, [w[0], w[1], 0], [w[0], w[1], POWER_TALL * P], 0.15 * P, 0.11 * P, 7, wood, PAT.plain);
        var ac = [w[0] + F.d[0] * out * POWER_REACH / 2 * P, w[1] + F.d[1] * out * POWER_REACH / 2 * P];
        worldBox(v, ac, F.e, F.d, 0.05 * P, (POWER_REACH / 2 + 0.15) * P, POWER_ARM * P, (POWER_ARM + 0.11) * P, wood, PAT.plain);
        POWER_PINS.forEach(function (s) {
          var at = [w[0] + F.d[0] * out * s * P, w[1] + F.d[1] * out * s * P];
          worldTube(v, [at[0], at[1], (POWER_ARM + 0.11) * P], [at[0], at[1], (POWER_ARM + 0.3) * P], 0.045 * P, 0.03 * P, 6, glassy, PAT.plain);
        });
        worldTube(v, [w[0], w[1], POWER_TALL * P], [w[0], w[1], (POWER_TALL + 0.2) * P], 0.045 * P, 0.03 * P, 6, glassy, PAT.plain);
        // the low wire's rack
        var rk = [w[0] + F.d[0] * out * 0.17 * P, w[1] + F.d[1] * out * 0.17 * P];
        worldBox(v, rk, F.e, F.d, 0.03 * P, 0.05 * P, (POWER_LOW - 0.1) * P, (POWER_LOW + 0.1) * P, grey, 22);
      }, g);
      return { w: w, g: g, lx: p.lx };
    });
    // a transformer on the pole nearest the house
    var near = tops.slice().sort(function (a, b) { return Math.abs(a.lx) - Math.abs(b.lx); })[0];
    if (near) {
      var tc = [near.w[0] + F.d[0] * out * 0.42 * P, near.w[1] + F.d[1] * out * 0.42 * P];
      lifted(function () {
        worldTube(v, [tc[0], tc[1], 8.0 * P], [tc[0], tc[1], 9.05 * P], 0.27 * P, 0.27 * P, 10, grey, 22);
        worldTube(v, [tc[0], tc[1], 9.05 * P], [tc[0], tc[1], 9.12 * P], 0.27 * P, 0.2 * P, 10, grey, 22);
      }, near.g);
    }
    // the wires, pole to pole, hanging a little between
    lifted(function () {
      for (var i = 0; i + 1 < tops.length; i++) {
        var a = tops[i], b = tops[i + 1];
        POWER_PINS.map(function (s) { return [out * s, POWER_ARM + 0.3]; }).concat([[0, POWER_TALL + 0.2], [out * 0.2, POWER_LOW]]).forEach(function (wv) {
          var pa = [a.w[0] + F.d[0] * wv[0] * P, a.w[1] + F.d[1] * wv[0] * P, a.g + wv[1] * P];
          var pb = [b.w[0] + F.d[0] * wv[0] * P, b.w[1] + F.d[1] * wv[0] * P, b.g + wv[1] * P];
          var pts = powerSag(pa, pb, 0.55 * P, 9);
          for (var j = 0; j + 1 < pts.length; j++) { worldTube(v, pts[j], pts[j + 1], 0.016 * P, 0.016 * P, 4, wire, PAT.plain); }
        });
      }
    }, 0);
  }
  if (typeof houseStreetBits === "function") {
    var houseStreetBitsPower = houseStreetBits;
    houseStreetBits = function (v, lot, lotWorld, lotLocal, hy, walkW, sheetC) {
      var out = houseStreetBitsPower.apply(this, arguments);
      try { powerStreet(v, lot, sheetC); } catch (e) { /* the street without them */ }
      return out;
    };
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyPower = houseSceneKey;
    houseSceneKey = function () { return houseSceneKeyPower.apply(this, arguments) + "|p" + powerKind(); };
  }

  // ---- on the house ------------------------------------------------------------------
  // A round rod for the house's own faces, from one point to another.
  function powerRod(faces, a, b, r, how, sides) {
    var ax = b[0] - a[0], ay = b[1] - a[1], az = b[2] - a[2], l = Math.hypot(ax, ay, az) || 1;
    ax /= l; ay /= l; az /= l;
    var ux = Math.abs(az) < 0.9 ? -ay : 1, uy = Math.abs(az) < 0.9 ? ax : 0, uz = 0, ul = Math.hypot(ux, uy) || 1;
    ux /= ul; uy /= ul;
    var wx = ay * uz - az * uy, wy = az * ux - ax * uz, wz = ax * uy - ay * ux, n = sides || 5;
    for (var i = 0; i < n; i++) {
      var t0 = i / n * Math.PI * 2, t1 = (i + 1) / n * Math.PI * 2, tm = (t0 + t1) / 2;
      var ring = function (t, p) { var cx = Math.cos(t) * r, cy = Math.sin(t) * r; return [p[0] + ux * cx + wx * cy, p[1] + uy * cx + wy * cy, p[2] + uz * cx + wz * cy]; };
      faces.push({ pts: [ring(t0, a), ring(t1, a), ring(t1, b), ring(t0, b)],
                   n: [ux * Math.cos(tm) + wx * Math.sin(tm), uy * Math.cos(tm) + wy * Math.sin(tm), uz * Math.cos(tm) + wz * Math.sin(tm)], how: how });
    }
  }
  // A box against a wall: `at` on the wall's face, `out` the way out of it,
  // `along` the way along it; sizes in metres across, out and up.
  function powerBox(faces, at, out, along, w, d, z0, z1, how) {
    var P = FLOOR_PX, hw = w * P / 2, dd = d * P;
    var base = [[at[0] - along[0] * hw, at[1] - along[1] * hw], [at[0] + along[0] * hw, at[1] + along[1] * hw],
                [at[0] + along[0] * hw + out[0] * dd, at[1] + along[1] * hw + out[1] * dd], [at[0] - along[0] * hw + out[0] * dd, at[1] - along[1] * hw + out[1] * dd]];
    v3Prism(faces, base, z0, z1, how);
  }
  // The outside walls of the house that look the way asked (`toward`, a
  // unit vector): each { room, level, z, ceil, a, b (ends), out (the way
  // out), mid }, the nearest the street first.
  function powerWalls(toward, floors) {
    var P = FLOOR_PX, out = [];
    hand.nodes.forEach(function (r) {
      if (r.kind !== "i_room" || (r.turn || 0) % 90) { return; }
      var f = floors.length ? floorAt(floors, r.x, r.y) : null, q = turned(r), dx = f ? f.dx : 0, dy = f ? f.dy : 0;
      var x0 = r.x + dx - q.w / 2, x1 = r.x + dx + q.w / 2, y0 = r.y + dy - q.h / 2, y1 = r.y + dy + q.h / 2, level = f ? f.level : 0;
      var others = typeof roofRoomRects === "function" ? roofRoomRects(floors, level) : [];
      [[[x0, y0], [x1, y0], [0, -1]], [[x0, y1], [x1, y1], [0, 1]], [[x0, y0], [x0, y1], [-1, 0]], [[x1, y0], [x1, y1], [1, 0]]].forEach(function (s) {
        var o = s[2];
        if (o[0] * toward[0] + o[1] * toward[1] < 0.9) { return; }
        var m = [(s[0][0] + s[1][0]) / 2 + o[0] * 8, (s[0][1] + s[1][1]) / 2 + o[1] * 8];
        if (typeof roofIn === "function" && roofIn(others, m[0], m[1])) { return; }
        out.push({ room: r, level: level, z: f ? f.z : 0, ceil: ceilOf(r) * P, a: s[0], b: s[1], out: o,
                   mid: [(s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2] });
      });
    });
    return out;
  }
  // The windows and doors on a wall: where nothing is to go in front of them.
  var powerOpenKept = typeof WeakMap === "function" ? new WeakMap() : null;
  function powerClearAt(W, floors, at) {
    var P = FLOOR_PX, along = W.out[0] ? 1 : 0;
    // (the windows and doors picked out once for a list of floors, not once a wall)
    var opens = floors && powerOpenKept ? powerOpenKept.get(floors) : null;
    if (!opens || opens.nodes !== hand.nodes || opens.count !== hand.nodes.length) {
      opens = hand.nodes.filter(function (n) { return n.kind === "i_window" || WALK_DOORS[n.kind]; });
      opens.nodes = hand.nodes; opens.count = hand.nodes.length;
      if (floors && powerOpenKept) { powerOpenKept.set(floors, opens); }
    }
    return !opens.some(function (n) {
      var f = floors.length ? floorAt(floors, n.x, n.y) : null, x = n.x + (f ? f.dx : 0), y = n.y + (f ? f.dy : 0), q = turned(n);
      var off = along ? Math.abs(x - W.a[0]) : Math.abs(y - W.a[1]);
      if (off > 0.35 * P) { return false; }
      var c = along ? y : x, half = (along ? q.h : q.w) / 2;
      return Math.abs(c - at) < half + 0.35 * P;
    });
  }
  // Each house (each lot along the street) its own meter, and its own wire.
  function powerHouse(model) {
    var kind = powerKind(), street = typeof houseStreetLot === "function" ? houseStreetLot() : null;
    if (kind === "none" || !street || !V3 || V3.scene === "space") { return; }
    var lots = hand.nodes.filter(function (n) { return n.kind === "i_lot"; });
    (lots.length ? lots : [street]).forEach(function (lot) { powerHouseOne(model, kind, street, lot, lots.length > 1); });
  }
  function powerHouseOne(model, kind, lot, own, many) {
    var P = FLOOR_PX, F = powerFrame(lot), floors = typeof floorsOf === "function" ? floorsOf() : [];
    var toward = kind === "back" ? [-F.d[0], -F.d[1]] : F.d;
    var walls = powerWalls(toward, floors).filter(function (W) { return W.level === 0 && (!many || insideArea(own, W.mid[0], W.mid[1])); });
    if (!walls.length) { return; }
    // the wall nearest the street (or the alley), and on it the breaker
    // panel's end, if there is one, else the end nearest a pole
    var front = Math.max.apply(null, walls.map(function (W) { return W.mid[0] * toward[0] + W.mid[1] * toward[1]; }));
    walls = walls.filter(function (W) { return W.mid[0] * toward[0] + W.mid[1] * toward[1] > front - 1.5 * P; });
    var panel = hand.nodes.filter(function (n) { return n.kind === "i_breaker" && (!many || insideArea(own, n.x, n.y)); })[0];
    var poles = kind === "under" ? [] : powerPoles(F, kind === "back").map(function (p) { return F.world(p.lx, p.ly); });
    var aim = panel ? [panel.x, panel.y] : poles.length ? poles.slice().sort(function (a, b) {
      return Math.hypot(a[0] - own.x, a[1] - own.y) - Math.hypot(b[0] - own.x, b[1] - own.y);
    })[0] : F.world(-F.lot.w / 2, F.hy);
    var best = null;
    walls.forEach(function (W) {
      var horiz = !W.out[0], lo = (horiz ? Math.min(W.a[0], W.b[0]) : Math.min(W.a[1], W.b[1])) + 0.7 * P;
      var hi = (horiz ? Math.max(W.a[0], W.b[0]) : Math.max(W.a[1], W.b[1])) - 0.7 * P;
      if (hi <= lo) { return; }
      var want = Math.max(lo, Math.min(hi, horiz ? aim[0] : aim[1]));
      for (var k = 0; k < 60; k++) {
        var tries = [want + k * 0.1 * P, want - k * 0.1 * P];
        for (var t = 0; t < 2; t++) {
          var at = tries[t];
          if (at < lo || at > hi || !powerClearAt(W, floors, at)) { continue; }
          var p = horiz ? [at, W.a[1]] : [W.a[0], at], d = Math.hypot(p[0] - aim[0], p[1] - aim[1]);
          if (!best || d < best.d) { best = { W: W, p: p, d: d, along: horiz ? [1, 0] : [0, 1] }; }
          k = 99; break;
        }
      }
    });
    if (!best) { return; }
    var W = best.W, o = W.out, at = [best.p[0] + o[0] * 0.02 * P, best.p[1] + o[1] * 0.02 * P];
    var g = typeof terrGround === "function" ? terrGround(at[0] + o[0] * 0.3 * P, at[1] + o[1] * 0.3 * P) : 0;
    var metal = { piece: true, color: "#9ea3a6", edge: "#5d6266", pat: 22 }, dark = { piece: true, color: "#2c2f31", edge: "#121314" };
    var glass = { piece: true, color: "#c9d6dc", edge: "#7a8a92", pat: 23 };
    var mz = Math.max(g + 1.4 * P, 1.2 * P);
    // the meter, its glass, and the pipe down to the ground or up to the wire
    powerBox(model.faces, at, o, best.along, 0.3, 0.14, mz, mz + 0.42 * P, metal);
    powerBox(model.faces, [at[0] + o[0] * 0.14 * P, at[1] + o[1] * 0.14 * P], o, best.along, 0.16, 0.06, mz + 0.14 * P, mz + 0.3 * P, glass);
    var pipeAt = [at[0] + o[0] * 0.06 * P, at[1] + o[1] * 0.06 * P];
    if (kind === "under") {
      powerRod(model.faces, [pipeAt[0], pipeAt[1], g - 0.05 * P], [pipeAt[0], pipeAt[1], mz], 0.035 * P, metal);
      return;
    }
    var top = W.z + Math.min(W.ceil, 2.7 * P) - 0.2 * P;
    powerRod(model.faces, [pipeAt[0], pipeAt[1], mz + 0.42 * P], [pipeAt[0], pipeAt[1], top], 0.03 * P, metal);
    // the weatherhead, bent over at the top
    var hood = [pipeAt[0] + o[0] * 0.12 * P, pipeAt[1] + o[1] * 0.12 * P, top + 0.06 * P];
    powerRod(model.faces, [pipeAt[0], pipeAt[1], top], hood, 0.04 * P, dark);
    // and the wire to it from the nearest pole's low rack, hanging a little
    var near = poles.slice().sort(function (a, b) { return Math.hypot(a[0] - at[0], a[1] - at[1]) - Math.hypot(b[0] - at[0], b[1] - at[1]); })[0];
    if (!near) { return; }
    var away = kind === "back" ? -1 : 1, rack = [near[0] + F.d[0] * away * 0.2 * P, near[1] + F.d[1] * away * 0.2 * P];   // (the low wire's rack, out from the pole: powerStreet)
    var from = [rack[0], rack[1], powerGround(near[0], near[1]) + POWER_LOW * P];
    var span = Math.hypot(from[0] - hood[0], from[1] - hood[1]);
    if (span > 60 * P) { return; }
    var pts = powerSag(from, hood, Math.min(0.9 * P, span * 0.03), 12);
    for (var i = 0; i + 1 < pts.length; i++) { powerRod(model.faces, pts[i], pts[i + 1], 0.014 * P, dark, 4); }
  }

  // ---- a dryer's vent ----------------------------------------------------------------
  // Out through the nearest outside wall of a room with a dryer in it (or
  // the laundry, if none is put in yet), half a metre up: a hood over a
  // flap, its opening down.
  function ventHouse(model) {
    if (!houseOpt("vents") || !V3 || V3.scene === "space") { return; }
    var P = FLOOR_PX, floors = typeof floorsOf === "function" ? floorsOf() : [];
    var white = { piece: true, color: "#eeece6", edge: "#a9a69e" }, dark = { piece: true, color: "#3a3b3c", edge: "#1e1f20" };
    var done = [], dryers = hand.nodes.filter(function (n) { return n.kind === "i_dryer"; });
    hand.nodes.forEach(function (r) {
      if (r.kind !== "i_room" || (r.turn || 0) % 90) { return; }
      var dryer = dryers.filter(function (n) { return insideArea(r, n.x, n.y); })[0];
      if (!dryer && r.starter !== "laundry") { return; }
      if (done.some(function (q) { return insideArea(q, r.x, r.y) || insideArea(r, q.x, q.y); })) { return; }
      var f = floors.length ? floorAt(floors, r.x, r.y) : null, dx = f ? f.dx : 0, dy = f ? f.dy : 0, level = f ? f.level : 0;
      var q = turned(r), x0 = r.x + dx - q.w / 2, x1 = r.x + dx + q.w / 2, y0 = r.y + dy - q.h / 2, y1 = r.y + dy + q.h / 2;
      var others = typeof roofRoomRects === "function" ? roofRoomRects(floors, level) : [];
      var from = dryer ? [dryer.x + dx, dryer.y + dy] : [r.x + dx, r.y + dy], best = null;
      [[[x0, y0], [x1, y0], [0, -1]], [[x0, y1], [x1, y1], [0, 1]], [[x0, y0], [x0, y1], [-1, 0]], [[x1, y0], [x1, y1], [1, 0]]].forEach(function (s) {
        var horiz = !s[2][0], lo = (horiz ? s[0][0] : s[0][1]) + 0.4 * P, hi = (horiz ? s[1][0] : s[1][1]) - 0.4 * P;
        if (hi <= lo) { return; }
        var at = Math.max(lo, Math.min(hi, horiz ? from[0] : from[1]));
        var p = horiz ? [at, s[0][1]] : [s[0][0], at];
        if (typeof roofIn === "function" && roofIn(others, p[0] + s[2][0] * 8, p[1] + s[2][1] * 8)) { return; }
        var W = { a: s[0], out: s[2] };
        if (!powerClearAt(W, floors, at)) { return; }
        var d = Math.hypot(p[0] - from[0], p[1] - from[1]);
        if (!best || d < best.d) { best = { p: p, o: s[2], along: horiz ? [1, 0] : [0, 1], d: d }; }
      });
      if (!best) { return; }
      done.push(r);
      var z = (f ? f.z : 0) + 0.45 * P, o = best.o, at = [best.p[0] + o[0] * 0.02 * P, best.p[1] + o[1] * 0.02 * P];
      powerBox(model.faces, at, o, best.along, 0.26, 0.02, z - 0.13 * P, z + 0.13 * P, white);                    // its plate on the wall
      powerBox(model.faces, [at[0] + o[0] * 0.02 * P, at[1] + o[1] * 0.02 * P], o, best.along, 0.2, 0.1, z - 0.05 * P, z + 0.1 * P, white);   // the hood
      powerBox(model.faces, [at[0] + o[0] * 0.02 * P, at[1] + o[1] * 0.02 * P], o, best.along, 0.17, 0.08, z - 0.08 * P, z - 0.05 * P, dark); // its opening, down
    });
  }
  if (typeof v3Build === "function") {
    var v3BuildUtility = v3Build;
    v3Build = function () {
      var model = v3BuildUtility.apply(this, arguments);
      try {
        var whole = V3 && (V3.mode === "walk" ? !V3.inRoom : (V3.upTo === null || V3.upTo === undefined)) && !(V3.flat && V3.flatDone) && !V3.low;
        if (model && model.faces && whole) { powerHouse(model); ventHouse(model); }
      } catch (e) { /* the house without them */ }
      return model;
    };
  }

  // ---- in the view's Settings, on the Street tab -------------------------------------------
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.pw_front = '<path d="M5 17V4M3 6h4M15 17V4M13 6h4M5 6.4c3.3 2 6.7 2 10 0"/><path d="M2.5 17h15"/>';
    HOUSE_ICONS.pw_back = '<path d="M7 17V8M5 9.6h4M7 10c2.4.8 5 1.6 7.4 1.6"/><path d="M11 17v-4.8l3.4-2.4 3.4 2.4V17z"/>';
    HOUSE_ICONS.pw_under = '<path d="M2.5 11.5h15"/><path d="M4 11.5V7.6h3.4v3.9" /><path d="M5.7 11.5v3.2h8.8V9.6" stroke-dasharray="1.6 1.4"/><path d="M12.6 11.5V7.4l2-1.6 2 1.6v4.1"/>';
    HOUSE_ICONS.pw_none = '<path d="M10 3.2 6 10.4h4l-1 6.4 5-8h-4z"/><path d="M4 16 16 4"/>';
    HOUSE_ICONS.vent = '<rect x="5" y="5" width="10" height="10" rx="1.2"/><path d="M7 9.4h6M7 12h6"/><path d="M8 15v1.8M12 15v1.8"/>';
  }
  function powerSection(sheet, draw) {
    var head = document.createElement("div");
    head.className = "v3-mats-head";
    head.textContent = TXT.pw_head;
    sheet.appendChild(head);
    worldPicker(sheet, POWER_KINDS, powerKind(), "pw_", function (k) { houseSetOpt("power", k); draw(); });
    var grid = document.createElement("div"), on = !!houseOpt("vents");
    grid.className = "hs-tiles";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "hs-tile";
    b.setAttribute("aria-pressed", on ? "true" : "false");
    b.innerHTML = houseIcon("vent") + '<span class="hs-tile-name"></span><span class="hs-tile-tick" aria-hidden="true">' +
                  '<svg viewBox="0 0 16 16"><path d="M3.5 8.4 6.6 11.3 12.5 4.9"/></svg></span>';
    b.querySelector(".hs-tile-name").textContent = TXT.hs_vents;
    b.onclick = function () { houseSetOpt("vents", !houseOpt("vents")); draw(); };
    grid.appendChild(b);
    sheet.appendChild(grid);
  }
  // (after the street lamps' picker, on the Street tab -- 39-house.js draws
  // that tab; its last part is the lamps)
  if (typeof worldPicker === "function") {
    var worldPickerPower = worldPicker;
    worldPicker = function (sheet, keys, now, prefix, pick) {
      var out = worldPickerPower.apply(this, arguments);
      if (prefix === "wl_" && typeof WORLD_LAMPS !== "undefined" && keys === WORLD_LAMPS) {
        try {
          var redraw = sheet.redraw || (V3 && V3.box && el(".v3-set", V3.box) && el(".v3-set", V3.box).redraw);
          powerSection(sheet, function () { if (redraw) { redraw(); } });
        } catch (e) { /* the sheet without it */ }
      }
      return out;
    };
  }
