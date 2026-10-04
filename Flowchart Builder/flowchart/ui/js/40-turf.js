// ---------------------------------------------------------------------------
//  40-turf.js -- grass standing up on the lawn: the lot's own and the strip
//  in front of it by the street -- blades in tufts, leaning with the wind,
//  each its own height, darker at its foot; trimmed back at the paths, the
//  house, the drive
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "update this so the grass beyond the sidewalk to
  // the streets it also your land and to make the grass have some 3d grass
  // to it")
  //
  // Thin layers laid one over another over the lawn, a few centimetres
  // apart: the shader (38-view3d-gl.js, its program added to here) keeps of
  // each only where a blade passes through it -- blades in tufts, each its
  // own height, narrowing to its tip, leaning with the others round it, the
  // mown stripes leaning each their own way -- and the layers together are
  // grass.  Too fine for the pixels far off, the blades go to tufts and the
  // tufts down into the lawn, without shimmering.  Each corner of the
  // layers knows how far it is from the lawn's edge -- a path, the house, a
  // patio, a drive (the scenery's flat faces seen as it is made, and the
  // drawing's pieces) -- and the grass comes down to nothing there.
  var TF_TALL = 0.09, TF_CELL = 0.5;                       // metres: the grass's height, the layers' squares
  var tfSeen = null;                                      // while the scenery is made: its flat faces on the ground
  if (typeof gl3Poly === "function") {
    var gl3PolyTurf = gl3Poly;
    gl3Poly = function (v, pts, n, c, a, uvs, pat) {
      if (tfSeen && n && n[2] > 0.99 && pat !== PAT.lawn && pat !== PAT.grass && pts.length >= 3 &&
          pts.every(function (p) { return p[2] > -2.5 && p[2] < 3; })) {
        tfSeen.push(pts.map(function (p) { return [p[0], p[1]]; }));
      }
      return gl3PolyTurf.apply(this, arguments);
    };
  }
  if (typeof gl3Scenery === "function") {
    var gl3SceneryTurf = gl3Scenery;
    gl3Scenery = function (G, model, inside) {
      var was = G && G.scenery, seen = [];
      tfSeen = seen;
      var S;
      try { S = gl3SceneryTurf.apply(this, arguments); } finally { tfSeen = null; }
      try {
        if (S && S !== was) { S.turfFlat = seen; S.turfKey = null; }
        if (S) { tfKeep(S, !!inside); }
      } catch (e) { if (S) { S.turf = null; } }
      return S;
    };
  }
  // The lot a lawn is drawn on, or none.
  function tfLot() {
    var lot = typeof houseStreetLot === "function" ? houseStreetLot() : (typeof houseLot === "function" ? houseLot() : null);
    if (!lot || lot.guessed || lot.kind !== "i_lot") {
      lot = hand.nodes.filter(function (n) { return n.kind === "i_lot"; })[0] || null;
    }
    return lot;
  }
  function tfWanted() {
    if (typeof texOn === "function" && !texOn()) { return false; }
    if (typeof gl3SnowNow !== "undefined" && gl3SnowNow > 0.3) { return false; }
    var lawn = typeof worldLawn === "function" ? worldLawn() : null;
    return !lawn || lawn.pat === PAT.lawn || lawn.pat === PAT.grass;
  }
  // (made again when what stands on the lawn moves, not each picture)
  function tfKeep(S, walk) {
    var lot = tfLot();
    if (!lot || !tfWanted()) { S.turf = null; return; }
    var key = [walk ? 1 : 0, lot.x, lot.y, lot.w, lot.h, lot.turn || 0, typeof streetVerge === "function" ? streetVerge() : "",
               typeof TERR !== "undefined" && TERR && TERR.mesh ? 1 : 0,
               hand.nodes.map(function (n) { return n.kind === "i_lot" ? "" : n.kind.slice(2, 5) + Math.round(n.x) + "," + Math.round(n.y) + "," + Math.round(n.w) + "," + Math.round(n.h) + "," + (n.turn || 0); }).join(";")].join("|");
    if (S.turfKey === key) { return; }
    S.turfKey = key;
    S.turf = tfBuild(lot, walk, S.turfFlat || []);
  }
  // How far a point is from a turned rectangle's edge (inside, less than nothing).
  function tfRectD(x, y, R) {
    var dx = x - R.x, dy = y - R.y, ux = Math.abs(dx * R.c + dy * R.s) - R.hw, uy = Math.abs(-dx * R.s + dy * R.c) - R.hh;
    var out = Math.hypot(Math.max(ux, 0), Math.max(uy, 0));
    return out > 0 ? out : Math.max(ux, uy);
  }
  function tfPolyD(x, y, poly) {
    var inside = false, best = Infinity;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / ((b[1] - a[1]) || 1e-9) + a[0]) { inside = !inside; }
      var ex = b[0] - a[0], ey = b[1] - a[1], l2 = ex * ex + ey * ey || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * ex + (y - a[1]) * ey) / l2));
      best = Math.min(best, Math.hypot(x - a[0] - ex * t, y - a[1] - ey * t));
    }
    return inside ? -best : best;
  }
  var TF_SOFT = { i_tree: 0.25, i_bush: 0.3, i_shrub: 0.3, i_plant: 0.2, i_flower: 0.15, i_lamppost: 0.15, i_pathlight: 0.1, i_bench: 0, i_chair: 0 };
  function tfBuild(lot, walk, flat) {
    var P = FLOOR_PX, a = (lot.turn || 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    function world(lx, ly) { return [lot.x + lx * ca - ly * sa, lot.y + lx * sa + ly * ca]; }
    var floors = typeof floorsOf === "function" ? floorsOf() : [];
    // what the grass keeps off: what stands on the lawn (a tree but its trunk), the house, and the scenery's paving
    var rects = [];
    hand.nodes.forEach(function (n) {
      if (n.kind === "i_lot" || n.kind === "i_lawn" || n.kind === "i_zone" || n.kind === "i_floor" || n.x === undefined) { return; }
      if (WALK_DOORS[n.kind] || n.kind === "i_window" || isFigure(n.kind) || n.kind === "actor" || ON_THE_WALL[n.kind] || FROM_CEILING[n.kind]) { return; }
      var f = floors.length ? floorAt(floors, n.x, n.y) : null, x = n.x + (f ? f.dx : 0), y = n.y + (f ? f.dy : 0), t = (n.turn || 0) * Math.PI / 180;
      if (TF_SOFT[n.kind] !== undefined) {
        var r = TF_SOFT[n.kind] * P;
        if (r > 0) { rects.push({ x: x, y: y, c: 1, s: 0, hw: r, hh: r }); }
        return;
      }
      rects.push({ x: x, y: y, c: Math.cos(t), s: Math.sin(t), hw: n.w / 2, hh: n.h / 2 });
    });
    var parts = [{ x0: -lot.w / 2, x1: lot.w / 2, y0: -lot.h / 2, y1: lot.h / 2, z: -1, inLot: true }];
    var V = typeof streetVergePx === "function" ? streetVergePx() : 0;
    if (V > 0 && typeof houseOpt === "function" && houseOpt("street")) {
      var walkW = streetWalkPx(), side = walkW - V, hy = lot.h / 2;
      parts.push({ x0: -lot.w / 2, x1: lot.w / 2, y0: hy + side, y1: hy + walkW - 0.15 * P, z: -1.5, inLot: false });
    }
    var T = typeof TERR !== "undefined" && TERR && TERR.mesh && typeof terrMeshAt === "function" ? TERR : null;
    var lawnC = typeof vgLotLawn === "function" ? vgLotLawn(lot, gl3Rgb(simSheet())) : null;
    var col = lawnC ? lawnC.c : gl3Mix([0.42, 0.62, 0.3], gl3Rgb(simSheet()), 0.15);
    var N = walk ? 12 : 9, Hh = TF_TALL * P, v = [];
    parts.forEach(function (A) {
      var cell = TF_CELL * P, nx = Math.max(1, Math.ceil((A.x1 - A.x0) / cell)), ny = Math.max(1, Math.ceil((A.y1 - A.y0) / cell));
      var cw = (A.x1 - A.x0) / nx, chh = (A.y1 - A.y0) / ny, D = [], Wp = [], Z = [];
      var near = rects.filter(function (R) {
        var c = world((A.x0 + A.x1) / 2, (A.y0 + A.y1) / 2), reach = Math.hypot(A.x1 - A.x0, A.y1 - A.y0) / 2 + Math.max(R.hw, R.hh) + P;
        return Math.hypot(R.x - c[0], R.y - c[1]) < reach;
      });
      for (var i = 0; i <= nx; i++) {
        D.push([]); Wp.push([]); Z.push([]);
        for (var j = 0; j <= ny; j++) {
          var lx = A.x0 + i * cw, ly = A.y0 + j * chh, w = world(lx, ly);
          // in from the lawn's own edge, out from all it keeps off -- in metres, no more than half a metre either way
          var d = Math.min(lx - A.x0, A.x1 - lx, ly - A.y0, A.y1 - ly) / P;
          for (var r = 0; r < near.length && d > -0.5; r++) { d = Math.min(d, tfRectD(w[0], w[1], near[r]) / P); }
          for (var q = 0; q < flat.length && d > -0.5; q++) {
            var pl = flat[q];
            if (pl.box === undefined) {
              pl.box = [Infinity, -Infinity, Infinity, -Infinity];
              pl.forEach(function (p) { pl.box[0] = Math.min(pl.box[0], p[0]); pl.box[1] = Math.max(pl.box[1], p[0]); pl.box[2] = Math.min(pl.box[2], p[1]); pl.box[3] = Math.max(pl.box[3], p[1]); });
            }
            if (w[0] < pl.box[0] - 0.6 * P || w[0] > pl.box[1] + 0.6 * P || w[1] < pl.box[2] - 0.6 * P || w[1] > pl.box[3] + 0.6 * P) { continue; }
            d = Math.min(d, tfPolyD(w[0], w[1], pl) / P);
          }
          D[i].push(Math.max(-0.5, Math.min(0.5, d)));
          Wp[i].push(w);
          Z[i].push(T ? terrMeshAt(T, w[0], w[1]) : A.z);
        }
      }
      function nrm(w) { return T && typeof terrNormalAt === "function" ? terrNormalAt(T, w[0], w[1]) : [0, 0, 1]; }
      function uv(lx, ly) { return T ? [lx / P, ly / P] : [(lx + lot.w / 2) / P, (ly + lot.h / 2) / P]; }
      function quad(i0, i1, j0, j1) {
        var cs = [[i0, j0], [i1, j0], [i1, j1], [i0, j1]];
        for (var k = 1; k <= N; k++) {
          var f = k / N, pat = 80 + f * 0.98, lift = Hh * f + 0.2;
          var vs = cs.map(function (cc) {
            var w = Wp[cc[0]][cc[1]], lx = A.x0 + cc[0] * cw, ly = A.y0 + cc[1] * chh;
            return { p: [w[0], w[1], Z[cc[0]][cc[1]] + lift], n: nrm(w), uv: uv(lx, ly), e: Math.max(0, Math.min(1, 0.5 + D[cc[0]][cc[1]])) };
          });
          [[0, 1, 2], [0, 2, 3]].forEach(function (t) {
            t.forEach(function (ix) { var q = vs[ix]; gl3Vert(v, q.p, q.n, col, q.e, q.uv, pat); });
          });
        }
      }
      // (squares wholly in the open run together along their row -- on level
      // ground any way, on land that rises and falls three at a time)
      var most = T ? 3 : Infinity;
      for (var jj = 0; jj < ny; jj++) {
        var run = -1;
        for (var ii = 0; ii <= nx; ii++) {
          var full = ii < nx && D[ii][jj] >= 0.5 && D[ii + 1][jj] >= 0.5 && D[ii][jj + 1] >= 0.5 && D[ii + 1][jj + 1] >= 0.5;
          if (full && run < 0) { run = ii; }
          if (run >= 0 && (!full || ii - run >= most)) { quad(run, ii, jj, jj + 1); run = full ? ii : -1; }
          if (ii < nx && !full) {
            var any = D[ii][jj] > 0 || D[ii + 1][jj] > 0 || D[ii][jj + 1] > 0 || D[ii + 1][jj + 1] > 0;
            if (any) { quad(ii, ii + 1, jj, jj + 1); }
          }
        }
      }
    });
    return v.length ? new Float32Array(v) : null;
  }
  // Drawn with the house's batches, in the picture only (not the sun's, nor a mirror's).
  if (typeof mirrorPass === "function") {
    var mirrorPassTurf = mirrorPass;
    mirrorPass = function (X) {
      var out = mirrorPassTurf.apply(this, arguments);
      try {
        if (X.scenery && X.scenery.turf && X.dress > 0.98 && !X.under) {
          X.batches.push({ key: "turf", v: [], data: X.scenery.turf, how: {}, turf: true });
        }
      } catch (e) { /* without */ }
      return out;
    };
  }

  // ---- the shader: a layer of grass kept only where a blade goes through it -------------------------
  // (a pattern of its own, 80 to 82: 80 and up a mown lawn's, 81 and up rough grass's; the fraction how
  // far up the blades the layer is -- its color's alpha how far its corner is from the lawn's edge)
  if (typeof GL3_FS === "string") {
    var TF_BLADES = [
      "  float turf = -1.0, turfT = 0.0; vec2 turfN = vec2(0.0);",
      "  if (k > 79.99 && k < 81.99) {",
      "    turf = fract(k);",
      "    vec2 wm = vPos.xy / uPx; float mpp = 0.0;",
      "#ifdef RELIEF",
      "    mpp = max(length(dFdx(vPos)), length(dFdy(vPos))) / uPx;",
      "#endif",
      // (blades where a pixel is under a few centimetres; the grass at all where it is under fifteen)
      "    float fineK = 1.0 - smoothstep(0.35, 0.7, mpp * 26.0);",
      "    float tall = (1.0 - smoothstep(0.08, 0.16, mpp)) * smoothstep(0.02, 0.2, vColor.a - 0.5);",
      "    vec2 flow = vec2(noise(wm * 0.45), noise(wm * 0.45 + 17.3)) - 0.5;",
      "    if (k < 81.0) { flow.y += (mod(floor(vUv.x / 1.6), 2.0) - 0.5) * 0.7; }",
      "    vec2 bent = wm - flow * 0.09 * turf * turf;",
      // (how high it grows here: in clumps, rough -- the finest of it only where it can be seen)
      "    float a37 = 1.0 - smoothstep(0.5, 1.2, mpp * 37.0);",
      "    float hh = 0.5 * noise(bent * 6.0) + 0.3 * noise(bent * 15.0 + 3.1) + 0.2 * mix(0.5, noise(bent * 37.0 + 7.7), a37);",
      "    hh = (0.3 + 0.7 * hh) * tall;",
      "    vec2 bq = bent * 26.0, bc = floor(bq), bf = fract(bq) - 0.5 - (vec2(hash(bc + 2.3), hash(bc + 6.1)) - 0.5) * 0.5;",
      "    float hb = hh * mix(1.0, 0.5 + 0.6 * hash(bc + 1.9), fineK);",
      "    if (turf > hb) { discard; }",
      "    float upB = turf / max(hb, 0.001);",
      "    if (fineK > 0.01 && length(bf) > mix(0.9, 0.42 * (1.0 - upB) + 0.06, fineK)) { discard; }",
      "    turfT = upB;",
      "    turfN = bf * 1.2 * fineK + flow * 0.6 + (vec2(noise(bent * 15.0 + 11.0), noise(bent * 15.0 + 23.0)) - 0.5) * 0.8 * (1.0 - fineK);",
      "    k = k < 81.0 ? 6.0 : 3.0;",
      "  }"].join("\n");
    var tfFs = GL3_FS, tfOk = true;
    [["  vec4 tex = vec4(0.0);", TF_BLADES + "\n  vec4 tex = vec4(0.0);"],
     ["  vec3 n = normalize(vNorm);", "  vec3 n = normalize(vNorm);\n  if (turf >= 0.0) { n = normalize(n + vec3(turfN, 0.0)); }"],
     ["  vec3 base = vColor.rgb; float a = vColor.a; vec3 emit = vec3(0.0);",
      "  vec3 base = vColor.rgb; float a = vColor.a; vec3 emit = vec3(0.0);\n" +
      "  if (turf >= 0.0) { a = 1.0; base *= mix(0.5, 0.94, turfT); base = mix(base, base * vec3(1.04, 1.04, 0.86), turfT * turfT * 0.2); }"]
    ].forEach(function (r) {
      if (tfFs.split(r[0]).length !== 2) { tfOk = false; return; }
      tfFs = tfFs.replace(r[0], r[1]);
    });
    if (tfOk) { GL3_FS = tfFs; }
  }
