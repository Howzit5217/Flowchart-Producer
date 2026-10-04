// ---------------------------------------------------------------------------
//  40-plants.js -- what grows round a house in 3D, and on its own lot: oaks,
//  maples, spruces, redwoods, poplars, willows, cypresses, fruit trees, lone
//  pines, bamboo, bananas, agaves, Joshua trees, dead snags; boulders,
//  fallen logs, ferns, wildflowers, reeds, tall grass, flowering shrubs and
//  box -- some far taller than the house
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "update it so there are more than just trees in
  // the world there and to add different kinds and for some to be on the
  // property and they can be bigger and taller than the house too")
  //
  // The land had round trees, firs, birches, palms, cacti, rocks and bushes
  // (39-world.js), and none on the lot.  Each landscape now grows a mix of
  // its own; and the lot has shade trees in its yards -- an oak twice the
  // house's height -- shrubs along the front of the house, flowers, and
  // reeds or dune grass where it meets the water.  Walking, you go round a
  // trunk rather than through it.
  Object.assign(HOUSE_PLAIN, { lotTrees: true });

  // A round lump, coarser than the scenery's own (an octahedron split once):
  // a crown is many of them.
  var PLANT_BLOB = (function () {
    var tri = [[[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [[0, 0, 1], [-1, 0, 0], [0, -1, 0]],
               [[0, 0, 1], [0, -1, 0], [1, 0, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]], [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
               [[0, 0, -1], [0, -1, 0], [-1, 0, 0]], [[0, 0, -1], [1, 0, 0], [0, -1, 0]]];
    function unit(p) { var l = Math.hypot(p[0], p[1], p[2]); return [p[0] / l, p[1] / l, p[2] / l]; }
    var next = [];
    tri.forEach(function (t) {
      var ab = unit([(t[0][0] + t[1][0]) / 2, (t[0][1] + t[1][1]) / 2, (t[0][2] + t[1][2]) / 2]);
      var bc = unit([(t[1][0] + t[2][0]) / 2, (t[1][1] + t[2][1]) / 2, (t[1][2] + t[2][2]) / 2]);
      var ca = unit([(t[2][0] + t[0][0]) / 2, (t[2][1] + t[0][1]) / 2, (t[2][2] + t[0][2]) / 2]);
      next.push([t[0], ab, ca], [ab, t[1], bc], [ca, bc, t[2]], [ab, bc, ca]);
    });
    return next;
  })();
  function plantBall(v, at, R, sq, c, pat) {
    PLANT_BLOB.forEach(function (t) {
      var n = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3, (t[0][2] + t[1][2] + t[2][2]) / 3 / sq];
      var l = Math.hypot(n[0], n[1], n[2]);
      gl3Poly(v, t.map(function (p) { return [at[0] + p[0] * R, at[1] + p[1] * R, at[2] + p[2] * R * sq]; }),
              [n[0] / l, n[1] / l, n[2] / l], c, 1, null, pat);
    });
  }
  function plantWhite(c, k) { return gl3SnowNow ? gl3Mix(c, [0.93, 0.95, 0.98], k * gl3SnowNow) : c; }
  function plantTone(c, rnd, by) { return gl3Mix(c, rnd() < 0.5 ? [0, 0, 0] : [1, 1, 0.8], rnd() * (by || 0.12)); }
  // A blade or a leaf: a long three-cornered face from its foot to its tip,
  // as wide as asked at the foot, seen from both sides.
  function plantBlade(v, foot, tip, wide, c, pat) {
    var dx = tip[0] - foot[0], dy = tip[1] - foot[1], l = Math.hypot(dx, dy) || 1;
    var sx = -dy / l * wide / 2, sy = dx / l * wide / 2;
    if (l < 1e-3) { sx = wide / 2; sy = 0; }
    var a = [foot[0] + sx, foot[1] + sy, foot[2]], b = [foot[0] - sx, foot[1] - sy, foot[2]];
    var n = worldN(a, b, tip);
    if (n[2] < 0) { n = [-n[0], -n[1], -n[2]]; }
    gl3Poly(v, [a, b, tip], n, c, 1, null, pat);
  }
  var PLANT_BARK = [0.36, 0.29, 0.23];

  // ---- trees ------------------------------------------------------------------------------------
  // (each from its foot `at` -- on the land, 40-land.js lifts it -- in pixels)
  function plantCrown(v, x, y, base, top, spread, lumps, leaf, rnd, sq) {
    for (var k = 0; k < lumps; k++) {
      var a = rnd() * Math.PI * 2, d = spread * Math.sqrt(rnd()) * 0.72;
      var R = spread * (0.36 + rnd() * 0.2), zc = base + (top - base - R * sq) * (0.25 + rnd() * 0.6) + R * sq * 0.4;
      plantBall(v, [x + Math.cos(a) * d, y + Math.sin(a) * d, Math.min(zc, top - R * sq * 0.8)], R, sq, plantTone(leaf, rnd), PAT.leaves);
    }
    plantBall(v, [x, y, top - spread * 0.4 * sq], spread * 0.45, sq, leaf, PAT.leaves);
  }
  function plantOak(v, at, rnd, sheetC) {
    var P = FLOOR_PX, x = at[0], y = at[1], tall = (13 + rnd() * 7) * P, trunkTop = tall * (0.3 + rnd() * 0.08);
    var r = (0.34 + rnd() * 0.16) * P, bark = gl3Mix(PLANT_BARK, sheetC, 0.1), spread = tall * (0.4 + rnd() * 0.1);
    var leaf = plantWhite(gl3Mix([0.25 + rnd() * 0.06, 0.41 + rnd() * 0.08, 0.19], sheetC, 0.08), 0.5);
    worldTube(v, [x, y, -0.3 * P], [x, y, trunkTop], r, r * 0.72, 7, bark, PAT.bark);
    var limbs = 3 + Math.floor(rnd() * 2);
    for (var i = 0; i < limbs; i++) {
      var a = i / limbs * Math.PI * 2 + rnd() * 0.6, out = spread * (0.42 + rnd() * 0.2), up = trunkTop + tall * (0.16 + rnd() * 0.14);
      worldTube(v, [x, y, trunkTop - 0.6 * P], [x + Math.cos(a) * out, y + Math.sin(a) * out, up], r * 0.55, r * 0.22, 5, bark, PAT.bark);
    }
    plantCrown(v, x, y, trunkTop, tall, spread, 9 + Math.floor(rnd() * 4), leaf, rnd, 0.72);
  }
  function plantMaple(v, at, rnd, sheetC) {
    var P = FLOOR_PX, x = at[0], y = at[1], tall = (9 + rnd() * 6) * P, trunkTop = tall * 0.36, r = (0.22 + rnd() * 0.1) * P;
    var scape = worldScape(), fall = (scape === "forest" || scape === "hills" || scape === "mountains") && rnd() < 0.3;
    var leaf = fall ? [[0.82, 0.38, 0.14], [0.9, 0.62, 0.18], [0.72, 0.2, 0.14]][Math.floor(rnd() * 3)] : [0.32 + rnd() * 0.06, 0.52 + rnd() * 0.08, 0.22];
    leaf = plantWhite(gl3Mix(leaf, sheetC, 0.08), 0.5);
    worldTube(v, [x, y, -0.3 * P], [x, y, trunkTop + 1.2 * P], r, r * 0.7, 6, gl3Mix([0.4, 0.33, 0.27], sheetC, 0.1), PAT.bark);
    plantCrown(v, x, y, trunkTop, tall, tall * 0.34, 7, leaf, rnd, 0.9);
  }
  function plantSpruce(v, at, rnd, sheetC) {
    var P = FLOOR_PX, tall = (15 + rnd() * 13) * P, base = tall * 0.08, wide = tall * (0.17 + rnd() * 0.04);
    var leaf = plantWhite(gl3Mix([0.14, 0.31 + rnd() * 0.06, 0.24], sheetC, 0.08), 0.55);
    gl3Prism(v, at, 0.32 * P, 0.12 * P, -0.3 * P, tall * 0.9, 6, gl3Mix([0.33, 0.25, 0.2], sheetC, 0.1), PAT.bark);
    var tiers = 7 + Math.floor(rnd() * 3), z = base;
    for (var t = 0; t < tiers; t++) {
      var k = t / tiers, r = wide * Math.pow(1 - k, 0.85) + 0.3 * P, h = (tall - base) / tiers * 1.7;
      gl3Cone(v, at, r, z, Math.min(tall, z + h), 8, t % 2 ? gl3Mix(leaf, [0, 0, 0], 0.07) : leaf);
      z += (tall - base) / tiers;
    }
  }
  function plantRedwood(v, at, rnd, sheetC) {
    var P = FLOOR_PX, tall = (30 + rnd() * 15) * P, r = (0.8 + rnd() * 0.45) * P, bare = tall * (0.42 + rnd() * 0.08);
    var bark = gl3Mix([0.52, 0.29, 0.2], sheetC, 0.08), leaf = plantWhite(gl3Mix([0.17, 0.33, 0.22], sheetC, 0.08), 0.5);
    worldTube(v, [at[0], at[1], -0.4 * P], [at[0], at[1], tall * 0.92], r, r * 0.25, 9, bark, PAT.bark);
    var tiers = 7, z = bare;
    for (var t = 0; t < tiers; t++) {
      var k = t / tiers, w = tall * 0.1 * Math.pow(1 - k, 0.7) + 0.8 * P, h = (tall - bare) / tiers * 1.6;
      gl3Cone(v, at, w, z, Math.min(tall, z + h), 8, t % 2 ? gl3Mix(leaf, [0, 0, 0], 0.08) : leaf);
      z += (tall - bare) / tiers;
    }
  }
  function plantPoplar(v, at, rnd, sheetC) {
    var P = FLOOR_PX, tall = (15 + rnd() * 7) * P, x = at[0], y = at[1];
    var leaf = plantWhite(gl3Mix([0.33, 0.5 + rnd() * 0.06, 0.24], sheetC, 0.08), 0.5);
    worldTube(v, [x, y, -0.3 * P], [x, y, tall * 0.3], 0.24 * P, 0.18 * P, 6, gl3Mix([0.48, 0.44, 0.38], sheetC, 0.1), PAT.bark);
    var n = 5, R = (1.7 + rnd() * 0.5) * P;
    for (var i = 0; i < n; i++) {
      var z = tall * 0.24 + (tall * 0.76 - R * 1.4) * i / (n - 1) + R * 1.1;
      plantBall(v, [x + (rnd() - 0.5) * 0.4 * P, y + (rnd() - 0.5) * 0.4 * P, z], R * (1 - i * 0.12), 1.8, plantTone(leaf, rnd, 0.08), PAT.leaves);
    }
  }
  function plantWillow(v, at, rnd, sheetC) {
    var P = FLOOR_PX, x = at[0], y = at[1], top = (7 + rnd() * 4) * P, spread = (5 + rnd() * 2) * P;
    var leaf = plantWhite(gl3Mix([0.52, 0.66, 0.3], sheetC, 0.08), 0.5), bark = gl3Mix([0.4, 0.35, 0.28], sheetC, 0.1);
    worldTube(v, [x, y, -0.3 * P], [x, y, top * 0.55], 0.36 * P, 0.28 * P, 7, bark, PAT.bark);
    plantBall(v, [x, y, top - spread * 0.35], spread * 0.75, 0.5, leaf, PAT.leaves);
    // its branches hanging all round, nearly to the ground
    for (var i = 0; i < 22; i++) {
      var a = i / 22 * Math.PI * 2 + rnd() * 0.2, r0 = spread * (0.55 + rnd() * 0.2), hang = (0.6 + rnd() * 1.2) * P;
      var foot = [x + Math.cos(a) * r0, y + Math.sin(a) * r0, top - spread * 0.4];
      var tip = [x + Math.cos(a) * (r0 + 0.5 * P), y + Math.sin(a) * (r0 + 0.5 * P), hang];
      plantBlade(v, foot, tip, (0.9 + rnd() * 0.6) * P, plantTone(leaf, rnd, 0.1), PAT.leaves);
    }
  }
  function plantCypress(v, at, rnd, sheetC) {
    var P = FLOOR_PX, tall = (8 + rnd() * 6) * P, leaf = plantWhite(gl3Mix([0.16, 0.3, 0.2], sheetC, 0.08), 0.4);
    gl3Prism(v, at, 0.18 * P, 0.14 * P, -0.2 * P, 1.2 * P, 6, gl3Mix(PLANT_BARK, sheetC, 0.1), PAT.bark);
    var n = 4, R = (0.85 + rnd() * 0.25) * P;
    for (var i = 0; i < n; i++) {
      plantBall(v, [at[0], at[1], 0.8 * P + (tall - 0.8 * P - R * 1.6) * i / (n - 1) + R * 1.4], R * (1 - i * 0.16), 2.0, plantTone(leaf, rnd, 0.06), PAT.leaves);
    }
  }
  function plantFruit(v, at, rnd, sheetC) {
    var P = FLOOR_PX, x = at[0], y = at[1], tall = (3.2 + rnd() * 1.6) * P, trunk = 1.2 * P;
    var leaf = plantWhite(gl3Mix([0.33, 0.52, 0.24], sheetC, 0.08), 0.5), fruit = [[0.78, 0.14, 0.12], [0.95, 0.6, 0.12], [0.86, 0.75, 0.2]][Math.floor(rnd() * 3)];
    worldTube(v, [x, y, -0.2 * P], [x, y, trunk + 0.4 * P], 0.11 * P, 0.08 * P, 6, gl3Mix([0.42, 0.33, 0.26], sheetC, 0.1), PAT.bark);
    plantCrown(v, x, y, trunk, tall, (1.4 + rnd() * 0.4) * P, 4, leaf, rnd, 0.85);
    for (var f = 0; f < 12; f++) {
      var a = rnd() * Math.PI * 2, d = (0.9 + rnd() * 0.6) * P, z = trunk + (tall - trunk) * (0.2 + rnd() * 0.55);
      gl3Prism(v, [x + Math.cos(a) * d, y + Math.sin(a) * d], 0.07 * P, 0.07 * P, z, z + 0.12 * P, 4, gl3Mix(fruit, sheetC, 0.06), PAT.plain);
    }
  }
  function plantPine(v, at, rnd, sheetC) {
    // a lone pine: a tall bare trunk leaning, and a broad flat crown on top
    var P = FLOOR_PX, tall = (11 + rnd() * 6) * P, lean = (rnd() - 0.5) * 0.25, dir = rnd() * Math.PI * 2;
    var bark = gl3Mix([0.48, 0.34, 0.25], sheetC, 0.1), leaf = plantWhite(gl3Mix([0.2, 0.36, 0.22], sheetC, 0.08), 0.5);
    var x = at[0], y = at[1], z = -0.3 * P, r = 0.3 * P;
    for (var s = 1; s <= 5; s++) {
      var k = s / 5, nx = at[0] + Math.cos(dir) * lean * k * k * tall, ny = at[1] + Math.sin(dir) * lean * k * k * tall, nz = tall * 0.82 * k;
      worldTube(v, [x, y, z], [nx, ny, nz], r, r * 0.88, 6, bark, PAT.bark);
      x = nx; y = ny; z = nz; r *= 0.88;
    }
    for (var c = 0; c < 4; c++) {
      var a = c / 4 * Math.PI * 2 + rnd(), d = (1.4 + rnd() * 1.2) * P;
      plantBall(v, [x + Math.cos(a) * d, y + Math.sin(a) * d, z + (0.4 + rnd() * 0.6) * P], (2.2 + rnd() * 0.8) * P, 0.42, plantTone(leaf, rnd), PAT.leaves);
    }
    plantBall(v, [x, y, z + 1.2 * P], 2.6 * P, 0.4, leaf, PAT.leaves);
  }
  function plantBamboo(v, at, rnd, sheetC) {
    var P = FLOOR_PX, stems = 8 + Math.floor(rnd() * 7), stem = gl3Mix([0.5, 0.62, 0.28], sheetC, 0.08), leaf = gl3Mix([0.38, 0.6, 0.26], sheetC, 0.08);
    for (var i = 0; i < stems; i++) {
      var a = rnd() * Math.PI * 2, d = rnd() * 0.9 * P, x = at[0] + Math.cos(a) * d, y = at[1] + Math.sin(a) * d;
      var tall = (5 + rnd() * 4) * P, lx = x + (rnd() - 0.5) * 0.8 * P, ly = y + (rnd() - 0.5) * 0.8 * P;
      worldTube(v, [x, y, -0.2 * P], [lx, ly, tall], 0.05 * P, 0.035 * P, 4, plantTone(stem, rnd, 0.1), PAT.leaves);
      plantBall(v, [lx, ly, tall - 0.6 * P], (0.7 + rnd() * 0.4) * P, 0.6, plantTone(leaf, rnd), PAT.leaves);
    }
  }
  function plantBanana(v, at, rnd, sheetC) {
    var P = FLOOR_PX, x = at[0], y = at[1], tall = (2.6 + rnd() * 1.2) * P, leaf = gl3Mix([0.34, 0.62, 0.26], sheetC, 0.08);
    worldTube(v, [x, y, -0.2 * P], [x, y, tall], 0.16 * P, 0.12 * P, 6, gl3Mix([0.46, 0.5, 0.3], sheetC, 0.08), PAT.leaves);
    for (var i = 0; i < 7; i++) {
      var a = i / 7 * Math.PI * 2 + rnd() * 0.5, len = (1.6 + rnd() * 0.8) * P;
      var mid = [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5, tall + 0.4 * P];
      var tip = [x + Math.cos(a) * len, y + Math.sin(a) * len, tall - (0.3 + rnd() * 0.6) * P];
      plantBlade(v, [x, y, tall], mid, 0.7 * P, plantTone(leaf, rnd, 0.1), PAT.leaves);
      plantBlade(v, mid, tip, 0.65 * P, plantTone(leaf, rnd, 0.1), PAT.leaves);
    }
  }
  function plantAgave(v, at, rnd, sheetC) {
    var P = FLOOR_PX, c = gl3Mix([0.42, 0.56, 0.5], sheetC, 0.08), n = 14 + Math.floor(rnd() * 6);
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + rnd() * 0.3, len = (0.7 + rnd() * 0.5) * P, up = (0.5 + rnd() * 0.7) * P;
      plantBlade(v, [at[0], at[1], 0], [at[0] + Math.cos(a) * len, at[1] + Math.sin(a) * len, up], 0.16 * P, plantTone(c, rnd, 0.1), PAT.leaves);
    }
  }
  function plantJoshua(v, at, rnd, sheetC) {
    var P = FLOOR_PX, x = at[0], y = at[1], trunk = (1.8 + rnd() * 1.2) * P;
    var bark = gl3Mix([0.5, 0.42, 0.32], sheetC, 0.1), leaf = gl3Mix([0.36, 0.45, 0.26], sheetC, 0.08);
    worldTube(v, [x, y, -0.2 * P], [x, y, trunk], 0.22 * P, 0.18 * P, 6, bark, PAT.bark);
    var arms = 2 + Math.floor(rnd() * 3);
    for (var i = 0; i < arms; i++) {
      var a = rnd() * Math.PI * 2, out = (0.9 + rnd() * 1.1) * P, up = trunk + (1.0 + rnd() * 1.6) * P;
      var tip = [x + Math.cos(a) * out, y + Math.sin(a) * out, up];
      worldTube(v, [x, y, trunk - 0.2 * P], tip, 0.14 * P, 0.1 * P, 5, bark, PAT.bark);
      for (var s = 0; s < 9; s++) {
        var b = rnd() * Math.PI * 2, el = rnd() * 0.9;
        plantBlade(v, tip, [tip[0] + Math.cos(b) * Math.cos(el) * 0.45 * P, tip[1] + Math.sin(b) * Math.cos(el) * 0.45 * P, tip[2] + Math.sin(el) * 0.45 * P],
                   0.1 * P, leaf, PAT.leaves);
      }
    }
  }
  function plantSnag(v, at, rnd, sheetC) {
    var P = FLOOR_PX, x = at[0], y = at[1], tall = (7 + rnd() * 7) * P, wood = gl3Mix([0.55, 0.52, 0.48], sheetC, 0.1);
    worldTube(v, [x, y, -0.3 * P], [x, y, tall], 0.28 * P, 0.06 * P, 6, wood, PAT.bark);
    for (var i = 0; i < 5; i++) {
      var a = rnd() * Math.PI * 2, z = tall * (0.35 + rnd() * 0.5), len = (1 + rnd() * 2) * P * (1 - z / tall + 0.3);
      worldTube(v, [x, y, z], [x + Math.cos(a) * len, y + Math.sin(a) * len, z + len * (0.3 + rnd() * 0.6)], 0.08 * P, 0.02 * P, 4, wood, PAT.bark);
    }
  }

  // ---- low things --------------------------------------------------------------------------------
  function plantBoulder(v, at, rnd, sheetC) {
    var P = FLOOR_PX, scape = worldScape(), R = (1.1 + Math.pow(rnd(), 1.5) * 1.8) * P;
    var rock = gl3Mix(scape === "desert" ? [0.66, 0.46, 0.34] : [0.55, 0.55, 0.53], sheetC, 0.1);
    plantBall(v, [at[0], at[1], R * 0.1], R, 0.62 + rnd() * 0.2, plantWhite(rock, 0.45), 73);
    var n = 1 + Math.floor(rnd() * 3);
    for (var i = 0; i < n; i++) {
      var a = rnd() * Math.PI * 2, r = R * (0.35 + rnd() * 0.3);
      plantBall(v, [at[0] + Math.cos(a) * R * 0.95, at[1] + Math.sin(a) * R * 0.95, r * 0.15], r, 0.7, plantWhite(plantTone(rock, rnd, 0.1), 0.45), 73);
    }
    // moss on its top, in the woods
    if (scape === "forest" || scape === "mountains" || scape === "lake") {
      plantBall(v, [at[0], at[1], R * 0.42], R * 0.72, 0.42, gl3Mix([0.36, 0.48, 0.24], sheetC, 0.1), PAT.leaves);
    }
  }
  function plantLog(v, at, rnd, sheetC) {
    var P = FLOOR_PX, a = rnd() * Math.PI * 2, len = (3 + rnd() * 4) * P, r = (0.22 + rnd() * 0.14) * P;
    var wood = gl3Mix([0.42, 0.34, 0.26], sheetC, 0.1), ex = Math.cos(a) * len / 2, ey = Math.sin(a) * len / 2;
    worldTube(v, [at[0] - ex, at[1] - ey, r * 0.8], [at[0] + ex, at[1] + ey, r * 0.7], r, r * 0.85, 7, wood, PAT.bark);
    // and the stump it fell from
    gl3Prism(v, [at[0] - ex * 1.3, at[1] - ey * 1.3], r * 1.1, r, -0.2 * P, 0.5 * P, 7, wood, PAT.bark);
  }
  function plantFern(v, at, rnd, sheetC) {
    var P = FLOOR_PX, c = gl3Mix([0.28, 0.5, 0.24], sheetC, 0.08), n = 8 + Math.floor(rnd() * 5);
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2 + rnd() * 0.4, len = (0.6 + rnd() * 0.4) * P;
      plantBlade(v, [at[0], at[1], 0], [at[0] + Math.cos(a) * len, at[1] + Math.sin(a) * len, (0.35 + rnd() * 0.35) * P], 0.28 * P, plantTone(c, rnd, 0.1), PAT.leaves);
    }
  }
  var PLANT_FLOWERS = [[0.96, 0.82, 0.22], [0.97, 0.97, 0.94], [0.62, 0.42, 0.78], [0.94, 0.55, 0.7], [0.86, 0.22, 0.2], [0.4, 0.55, 0.9], [0.98, 0.6, 0.2]];
  function plantFlowers(v, at, rnd, sheetC) {
    var P = FLOOR_PX, green = gl3Mix([0.34, 0.54, 0.26], sheetC, 0.08), n = 18 + Math.floor(rnd() * 12);
    var tone = PLANT_FLOWERS[Math.floor(rnd() * PLANT_FLOWERS.length)], tone2 = PLANT_FLOWERS[Math.floor(rnd() * PLANT_FLOWERS.length)];
    for (var i = 0; i < n; i++) {
      var a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 1.1 * P, x = at[0] + Math.cos(a) * d, y = at[1] + Math.sin(a) * d;
      var z = (0.25 + rnd() * 0.3) * P, s = 0.07 * P;
      plantBlade(v, [x, y, 0], [x + (rnd() - 0.5) * 0.1 * P, y + (rnd() - 0.5) * 0.1 * P, z], 0.05 * P, green, PAT.leaves);
      var fc = gl3Mix(rnd() < 0.7 ? tone : tone2, sheetC, 0.05);
      gl3Poly(v, [[x - s, y - s, z], [x + s, y - s, z], [x + s, y + s, z], [x - s, y + s, z]], [0, 0, 1], fc, 1, null, PAT.plain);
    }
  }
  function plantGrass(v, at, rnd, sheetC) {
    var P = FLOOR_PX, scape = worldScape(), base = scape === "beach" ? [0.66, 0.68, 0.42] : scape === "desert" ? [0.6, 0.56, 0.38] : [0.42, 0.56, 0.28];
    var c = plantWhite(gl3Mix(base, sheetC, 0.08), 0.5), n = 10 + Math.floor(rnd() * 8);
    for (var i = 0; i < n; i++) {
      var a = rnd() * Math.PI * 2, d = rnd() * 0.3 * P, x = at[0] + Math.cos(a) * d, y = at[1] + Math.sin(a) * d;
      var lean = rnd() * 0.35 * P, b = rnd() * Math.PI * 2;
      plantBlade(v, [x, y, 0], [x + Math.cos(b) * lean, y + Math.sin(b) * lean, (0.5 + rnd() * 0.5) * P], 0.07 * P, plantTone(c, rnd, 0.12), PAT.leaves);
    }
  }
  function plantReeds(v, at, rnd, sheetC) {
    var P = FLOOR_PX, stem = gl3Mix([0.45, 0.55, 0.3], sheetC, 0.08), head = gl3Mix([0.36, 0.25, 0.16], sheetC, 0.08), n = 12 + Math.floor(rnd() * 10);
    for (var i = 0; i < n; i++) {
      var a = rnd() * Math.PI * 2, d = rnd() * 0.7 * P, x = at[0] + Math.cos(a) * d, y = at[1] + Math.sin(a) * d;
      var tall = (1.1 + rnd() * 0.9) * P, tx = x + (rnd() - 0.5) * 0.2 * P, ty = y + (rnd() - 0.5) * 0.2 * P;
      worldTube(v, [x, y, -0.3 * P], [tx, ty, tall], 0.015 * P, 0.012 * P, 3, stem, PAT.leaves);
      if (rnd() < 0.6) { worldTube(v, [tx, ty, tall - 0.25 * P], [tx, ty, tall - 0.05 * P], 0.04 * P, 0.04 * P, 4, head, PAT.plain); }
      plantBlade(v, [x, y, 0], [x + (rnd() - 0.5) * 0.4 * P, y + (rnd() - 0.5) * 0.4 * P, tall * 0.8], 0.05 * P, stem, PAT.leaves);
    }
  }
  function plantFlowering(v, at, rnd, sheetC) {
    var P = FLOOR_PX, R = (0.5 + rnd() * 0.35) * P, leaf = plantWhite(gl3Mix([0.3, 0.5, 0.26], sheetC, 0.08), 0.55);
    var bloom = gl3Mix(PLANT_FLOWERS[Math.floor(rnd() * PLANT_FLOWERS.length)], sheetC, 0.05);
    plantBall(v, [at[0], at[1], R * 0.75], R, 0.85, leaf, PAT.leaves);
    for (var i = 0; i < 16; i++) {
      var a = rnd() * Math.PI * 2, el = rnd() * 1.1, s = 0.08 * P;
      var x = at[0] + Math.cos(a) * Math.cos(el) * R, y = at[1] + Math.sin(a) * Math.cos(el) * R, z = R * 0.75 + Math.sin(el) * R * 0.85 + 1;
      gl3Poly(v, [[x - s, y - s, z], [x + s, y - s, z], [x + s, y + s, z], [x - s, y + s, z]], [Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.7], bloom, 1, null, PAT.plain);
    }
  }
  function plantBox(v, at, rnd, sheetC) {
    var P = FLOOR_PX, R = (0.45 + rnd() * 0.3) * P;
    plantBall(v, [at[0], at[1], R * 0.82], R, 0.85, plantWhite(gl3Mix([0.2, 0.38, 0.2], sheetC, 0.08), 0.6), PAT.leaves);
  }
  var PLANT_KINDS = { oak: plantOak, maple: plantMaple, spruce: plantSpruce, redwood: plantRedwood, poplar: plantPoplar,
                      willow: plantWillow, cypress: plantCypress, fruit: plantFruit, pine: plantPine, bamboo: plantBamboo,
                      banana: plantBanana, agave: plantAgave, joshua: plantJoshua, snag: plantSnag, boulder: plantBoulder,
                      log: plantLog, fern: plantFern, flowers: plantFlowers, grass: plantGrass, reeds: plantReeds,
                      flowering: plantFlowering, box: plantBox };
  if (typeof worldPlant === "function") {
    var worldPlantFew = worldPlant;
    worldPlant = function (v, kind, at, rnd, sheetC) {
      var make = PLANT_KINDS[kind];
      if (make) { make(v, at, rnd, sheetC); return; }
      return worldPlantFew.apply(this, arguments);
    };
  }

  // ---- what each land grows --------------------------------------------------------------------
  var PLANT_GROW = {
    plains:    { broad: 3, oak: 2, maple: 1, poplar: 1, fruit: 0.5, bush: 3, flowering: 1, grass: 3, flowers: 2.5, boulder: 0.4 },
    hills:     { broad: 3, oak: 3, maple: 2, fir: 1, spruce: 1, bush: 2, flowers: 1.5, grass: 2, boulder: 0.7, snag: 0.2 },
    mountains: { fir: 5, spruce: 4, redwood: 0.3, pine: 1, rock: 3, boulder: 1.6, snag: 0.6, log: 0.5, fern: 0.6, grass: 1 },
    forest:    { fir: 3, spruce: 3, broad: 2, oak: 2, birch: 2, maple: 1.5, redwood: 0.6, bush: 2, fern: 2.4, log: 0.9, snag: 0.4, boulder: 0.6, flowers: 0.5 },
    lake:      { broad: 3, willow: 2, birch: 2, fir: 2, oak: 1, flowers: 1.2, grass: 2, bush: 1.5, boulder: 0.4 },
    beach:     { palm: 6, dune: 3, grass: 2.5, pine: 0.6, agave: 0.5 },
    desert:    { cactus: 5, joshua: 1.5, agave: 2.5, rock: 3, dry: 3, boulder: 1.2 },
    tropics:   { palm: 5, banana: 2, bamboo: 1.5, broad: 2, bush: 3, flowering: 2.2, fern: 1 },
    arctic:    { fir: 4, spruce: 4, rock: 2, snag: 0.4, boulder: 1 },
    city:      { broad: 2, maple: 1.2, poplar: 1, box: 2, flowering: 1 }
  };
  Object.keys(PLANT_GROW).forEach(function (k) { if (WORLD_LOOK[k]) { WORLD_LOOK[k].grow = PLANT_GROW[k]; } });
  if (WORLD_LOOK.plains) { WORLD_LOOK.plains.dense = 0.8; }
  // What shades a yard, and grows along the front of a house, in each.
  var PLANT_YARD = {
    plains: { big: ["oak", "maple", "broad", "oak"], low: ["box", "flowering", "bush"] },
    hills: { big: ["oak", "maple", "spruce", "broad"], low: ["box", "flowering", "bush"] },
    mountains: { big: ["spruce", "fir", "pine", "spruce"], low: ["bush", "fern", "box"] },
    forest: { big: ["oak", "spruce", "birch", "maple", "redwood"], low: ["fern", "bush", "flowering"] },
    lake: { big: ["willow", "oak", "birch", "maple"], low: ["flowering", "box", "bush"] },
    beach: { big: ["palm", "palm", "pine"], low: ["grass", "agave", "flowering"] },
    desert: { big: ["joshua", "cactus", "cypress"], low: ["agave", "dry", "agave"] },
    tropics: { big: ["palm", "banana", "broad", "palm"], low: ["flowering", "bamboo", "flowering"] },
    arctic: { big: ["spruce", "fir"], low: [] },
    city: { big: ["maple", "poplar", "broad"], low: ["box", "flowering", "box"] }
  };
  // How wide each crown is (metres), for keeping them off the house and each other.
  var PLANT_SPREAD = { oak: 8, maple: 5, broad: 3.5, spruce: 4.5, fir: 2.5, birch: 2.5, redwood: 5, pine: 4, palm: 3, willow: 6.5,
                       cypress: 1.5, banana: 2.2, joshua: 2, cactus: 1.5, poplar: 2.5, fruit: 2 };
  // How far the low ones reach out from their middle (metres): kept that far off the house.
  // (measured over forty of each, 2026-10-04)
  var PLANT_REACH = { agave: 1.25, dry: 1.1, bush: 1.05, flowering: 1.05, fern: 1.05, box: 0.95, grass: 0.7, bamboo: 2.45 };

  // ---- on the lot ---------------------------------------------------------------------------------
  // Trunks a body walking round goes round (x, y, radius), for the scenery made last.
  var plantSolids = [];
  function plantLot(v, L) {
    var P = FLOOR_PX, lot = L.lot, scape = worldScape(), yard = PLANT_YARD[scape] || PLANT_YARD.plains;
    var rnd = gl3Rand(Math.round(Math.abs(lot.x) * 7 + Math.abs(lot.y) * 3 + lot.w + lot.h) + Math.round(houseOpt("landSeed") || 1) * 101);
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    var rects = [], taken = [], ways = [];
    hand.nodes.forEach(function (r) {
      if (r.kind !== "i_room") { return; }
      var f = floors.length ? floorAt(floors, r.x, r.y) : null;
      if (!f || f.level === 0) { rects.push(terrRect(r, f)); }
    });
    if (!rects.length) { return; }
    function inHouse(x, y) { return rects.some(function (R) { return terrIn(R, x, y, 0); }); }
    function fromHouse(x, y) { return terrOut({ rects: rects }, x, y); }
    // what is drawn out of doors -- a pool, a deck, a shed -- with room round it
    hand.nodes.forEach(function (n) {
      if (n.kind === "i_room" || n.kind === "i_floor" || n.kind === "i_lot" || n.kind === "i_zone" || inHouse(n.x, n.y)) { return; }
      var f = floors.length ? floorAt(floors, n.x, n.y) : null;
      if (f && f.level !== 0) { return; }
      taken.push([n.x, n.y, Math.hypot(n.w, n.h) / 2 + 1.2 * P]);
    });
    // (a tower's skin stands out past its rooms: nothing planted under it, 40-towers.js)
    if (typeof towerTaken === "function") { towerTaken().forEach(function (t) { taken.push(t); }); }
    // a way kept clear from each door out to the street
    hand.nodes.forEach(function (d) {
      if (!WALK_DOORS[d.kind]) { return; }
      var f = floors.length ? floorAt(floors, d.x, d.y) : null;
      if (f && f.level !== 0) { return; }
      var t = (d.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t);
      var aIn = inHouse(d.x + ux * 0.8 * P, d.y + uy * 0.8 * P), bIn = inHouse(d.x - ux * 0.8 * P, d.y - uy * 0.8 * P);
      if (aIn === bIn) { return; }
      var ox = aIn ? -ux : ux, oy = aIn ? -uy : uy;
      ways.push({ x: d.x, y: d.y, ox: ox, oy: oy, half: d.kind === "i_garagedoor" ? d.w / 2 + 1.6 * P : 1.8 * P });
    });
    function onWay(x, y, r) {
      return ways.some(function (w) {
        var dx = x - w.x, dy = y - w.y, along = dx * w.ox + dy * w.oy, across = Math.abs(-dx * w.oy + dy * w.ox);
        return along > -1 * P && across < w.half + r;
      });
    }
    function inLot(x, y, edge) {
      var q = L.lotLocal([x, y]);
      return Math.abs(q[0]) < lot.w / 2 - edge && q[1] > -lot.h / 2 + edge && q[1] < lot.h / 2 - edge;
    }
    function wet(x, y) {
      if (!L.water) { return false; }
      var u = (x - L.water.o[0]) * L.water.d[0] + (y - L.water.o[1]) * L.water.d[1];
      return u > L.water.from - 6 * P;
    }
    function free(x, y, r) { return !taken.some(function (t) { return Math.hypot(x - t[0], y - t[1]) < t[2] + r; }); }
    // shade trees: as many as the lot has room for, well off the house
    // (the lot's own trees pieces of it, to move about or take away: not drawn here, 40-edit3d.js)
    var big = hand.house && hand.house.treesPlaced ? [] : yard.big;
    if (big.length) {
      var want = Math.max(1, Math.min(7, Math.round(lot.w * lot.h / (P * P) / 240))), made = 0;
      for (var tries = 0; tries < want * 60 && made < want; tries++) {
        var kind = big[Math.floor(rnd() * big.length)], spread = (PLANT_SPREAD[kind] || 3) * P;
        var lx = (rnd() - 0.5) * (lot.w - 2 * P), ly = (rnd() - 0.5) * (lot.h - 2 * P), at = L.lotWorld(lx, ly, 0);
        if (!inLot(at[0], at[1], 1.2 * P) || wet(at[0], at[1])) { continue; }
        if (fromHouse(at[0], at[1]) < spread * 0.55 + 2 * P) { continue; }
        if (onWay(at[0], at[1], spread * 0.35) || !free(at[0], at[1], spread * 0.75)) { continue; }
        worldPlant(v, kind, at, rnd, L.sheetC);
        taken.push([at[0], at[1], spread * 0.75]);
        plantSolids.push([at[0], at[1], (kind === "oak" || kind === "redwood" ? 0.45 : kind === "willow" ? 0.38 : 0.3) * P]);
        made++;
      }
    }
    // shrubs along the walls that face the street, between the doors
    var low = yard.low;
    if (low.length) {
      rects.forEach(function (R) {
        if (rects.some(function (o) { return o !== R && o.hw * o.hh > R.hw * R.hh && terrIn(o, R.x, R.y, 0); })) { return; }
        [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (e) {
          var ow = terrRot(R, e[0], e[1]), facing = L.lotLocal([R.x + ow[0] * 100, R.y + ow[1] * 100])[1] - L.lotLocal([R.x, R.y])[1];
          if (facing < 60) { return; }            // the front, more or less
          var len = e[0] ? R.hh * 2 : R.hw * 2, count = Math.floor(len / (1.7 * P));
          for (var i = 0; i < count; i++) {
            // (as far out as it reaches, and a hand more: an agave's blades, a metre
            // and a quarter long, stood 0.9 m off the wall went through it into the
            // room, 2026-10-04)
            var lowKind = low[Math.floor(rnd() * low.length)], reach = (PLANT_REACH[lowKind] || 1) * P, off = Math.max(0.9 * P, reach + 0.15 * P);
            var t = -len / 2 + (i + 0.5) * len / count, lxR = e[0] ? e[0] * (R.hw + off) : t, lyR = e[0] ? t : e[1] * (R.hh + off);
            var at = terrPt(R, lxR, lyR);
            if (inHouse(at[0], at[1]) || fromHouse(at[0], at[1]) < reach + 0.1 * P || !inLot(at[0], at[1], 0.6 * P) || onWay(at[0], at[1], 0.4 * P) || !free(at[0], at[1], 0.5 * P)) { continue; }
            if (rnd() < 0.25) { continue; }
            worldPlant(v, lowKind, at, rnd, L.sheetC);
            taken.push([at[0], at[1], 0.6 * P]);
          }
        });
      });
    }
    // a few flowers about the yard
    if (scape !== "arctic" && scape !== "desert") {
      for (var f = 0, ft = 0; f < 4 && ft < 80; ft++) {
        var fx = (rnd() - 0.5) * (lot.w - 2 * P), fy = (rnd() - 0.5) * (lot.h - 2 * P), fa = L.lotWorld(fx, fy, 0);
        if (fromHouse(fa[0], fa[1]) < 2.5 * P || onWay(fa[0], fa[1], 1 * P) || !free(fa[0], fa[1], 1.2 * P) || wet(fa[0], fa[1])) { continue; }
        worldPlant(v, scape === "beach" ? "grass" : "flowers", fa, rnd, L.sheetC);
        taken.push([fa[0], fa[1], 1.3 * P]);
        f++;
      }
    }
    // where the land meets the water: reeds by a lake, grass in the dunes
    if (L.water) {
      var lake = !!L.water.to, dl = Math.hypot(L.water.d[0], L.water.d[1]) || 1, wx = L.water.d[0] / dl, wy = L.water.d[1] / dl;
      for (var s = 0; s < 26; s++) {
        var along = (rnd() - 0.5) * 2 * Math.max(lot.w, 30 * P), back = L.water.from - (lake ? 0.4 + rnd() * 1.2 : 4 + rnd() * 5) * P;
        var sp = [L.water.o[0] + wx * back - wy * along, L.water.o[1] + wy * back + wx * along];
        worldPlant(v, lake ? "reeds" : "grass", sp, rnd, L.sheetC);
      }
    }
  }
  if (typeof worldGrow === "function") {
    var worldGrowFew = worldGrow;
    worldGrow = function (v, L) {
      var out = worldGrowFew.apply(this, arguments);
      plantSolids = [];
      try { if (L.lot && houseOpt("trees") && houseOpt("lotTrees")) { plantLot(v, L); } } catch (e) { /* the lot bare */ }
      return out;
    };
  }
  // Walking: round a trunk, not through it.
  if (typeof v3Bumps === "function") {
    var v3BumpsFew = v3Bumps;
    v3Bumps = function (x, y) {
      if (v3BumpsFew.apply(this, arguments)) { return true; }
      if (!plantSolids.length || !V3 || !V3.me || V3.mode !== "walk") { return false; }
      for (var i = 0; i < plantSolids.length; i++) {
        var s = plantSolids[i], d = Math.hypot(x - s[0], y - s[1]);
        if (d < s[2] + V3_CLEAR && d <= Math.hypot(V3.me.x - s[0], V3.me.y - s[1])) { return true; }
      }
      return false;
    };
  }
