// ---------------------------------------------------------------------------
//  39-styles.js -- a house's style, from anywhere in the world: the shape
//  of its roof (hipped, gabled, flat behind a parapet, mansard, gambrel,
//  an A-frame, a lean-to, a butterfly, the curved roofs of East Asia, a
//  dome, a Dutch stepped gable), what it is built of, the color of its
//  window frames, and what goes with it -- shutters, a chimney, a porch,
//  the beams of an adobe house
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "have other settings like house style if you
  // want to research different house styles too", "allow for ALL different
  // house and or building types from all over the world as options")
  //
  // A style is kept with the house (`hand.house.style`); picked, it puts
  // its walls and its roof on every room -- what the Materials sheet
  // shows, and can change after -- and its roof's shape, which can be
  // picked on its own too (`hand.house.roofShape`).
  //
  // Each: where it is from; the roof's shape, how steep (degrees) and how
  // far it hangs out (metres); the walls outside and the roof
  // (HOUSE_MATS, 38-models.js) in their colors; the frames' color; and
  // what else it has.
  var HOUSE_STYLES = {
    // ---- the Americas
    craftsman:    { at: "americas", shape: "gable", pitch: 24, eave: 0.75, out: ["shakes", "#8a977c"], roof: ["shingles", "#4a4d50"], trim: "#efe6d2", porch: true, chimney: "stone" },
    colonial:     { at: "americas", shape: "gable", pitch: 36, eave: 0.25, out: ["siding", "#f2efe8"], roof: ["shingles", "#3f4246"], trim: "#ffffff", shutters: "#24302a", chimney: "brick" },
    capecod:      { at: "americas", shape: "gable", pitch: 45, eave: 0.2, out: ["shakes", "#b8b2a6"], roof: ["shingles", "#5d6166"], trim: "#ffffff", shutters: "#2f4a6a", chimney: "brick" },
    victorian:    { at: "americas", shape: "gable", pitch: 50, eave: 0.4, out: ["siding", "#6f8592"], roof: ["slate", "#4a4f57"], trim: "#f3e8d0", porch: true, chimney: "brick" },
    ranch:        { at: "americas", shape: "hip", pitch: 18, eave: 0.65, out: ["brick", "#a65a44"], roof: ["shingles", "#5d6166"], trim: "#f2efe8" },
    farmhouse:    { at: "americas", shape: "gable", pitch: 40, eave: 0.35, out: ["boards", "#f4f2ec"], roof: ["metal", "#2a2c2e"], trim: "#1f2226", porch: true },
    dutchcolonial: { at: "americas", shape: "gambrel", pitch: 30, eave: 0.3, out: ["siding", "#e2d3b5"], roof: ["shingles", "#3f4246"], trim: "#ffffff", shutters: "#5c3a2e", chimney: "brick" },
    logcabin:     { at: "americas", shape: "gable", pitch: 32, eave: 0.6, out: ["logs", "#8a6340"], roof: ["metal", "#2f4a3c"], trim: "#e8e1d4", porch: true, chimney: "stone" },
    aframe:       { at: "americas", shape: "aframe", pitch: 60, eave: 0.4, out: ["boards", "#a5784c"], roof: ["metal", "#3f4246"], trim: "#2a2c2e" },
    midcentury:   { at: "americas", shape: "butterfly", pitch: 8, eave: 0.9, out: ["boards", "#8e6f52"], roof: ["metal", "#4f5a63"], trim: "#2a2c2e" },
    prairie:      { at: "americas", shape: "slab", pitch: 4, eave: 1.3, out: ["brick", "#b9805e"], roof: ["metal", "#5d5a55"], trim: "#5e3f27" },
    pueblo:       { at: "americas", shape: "flat", pitch: 0, eave: 0.3, out: ["stucco", "#c99a6b"], roof: ["metal", "#a58866"], trim: "#2f7f86", vigas: true, parapet: 0.55 },
    mission:      { at: "americas", shape: "hip", pitch: 20, eave: 0.45, out: ["stucco", "#efe7d6"], roof: ["tiles", "#b5603f"], trim: "#5e3f27" },
    brazil:       { at: "americas", shape: "slab", pitch: 3, eave: 1.6, out: ["concrete", "#b6b4ae"], roof: ["green", "#6f8f4a"], trim: "#5e3f27" },
    // ---- Europe
    tudor:        { at: "europe", shape: "gable", pitch: 50, eave: 0.3, out: ["timber", "#efe6d2"], roof: ["slate", "#4a4f57"], trim: "#3a2a20", chimney: "brick" },
    georgian:     { at: "europe", shape: "hip", pitch: 30, eave: 0.2, out: ["brick", "#8c4a3a"], roof: ["slate", "#3a3d42"], trim: "#ffffff", chimney: "brick" },
    cottage:      { at: "europe", shape: "gable", pitch: 50, eave: 0.45, out: ["stucco", "#f2ece2"], roof: ["thatch", "#b59a62"], trim: "#2f4a3c", chimney: "brick" },
    french:       { at: "europe", shape: "mansard", pitch: 72, eave: 0.1, out: ["stone", "#e2d8c4"], roof: ["slate", "#4a4f57"], trim: "#f2ece2", chimney: "stone" },
    provencal:    { at: "europe", shape: "hip", pitch: 22, eave: 0.4, out: ["stone", "#d6cdbd"], roof: ["tiles", "#c99a6b"], trim: "#f2ece2", shutters: "#7f9aa8" },
    tuscan:       { at: "europe", shape: "hip", pitch: 22, eave: 0.5, out: ["stucco", "#e6c9a8"], roof: ["tiles", "#b5603f"], trim: "#5e3f27", shutters: "#5c6b5a" },
    dutch:        { at: "europe", shape: "stepped", pitch: 55, eave: 0.1, out: ["brick", "#6b5a52"], roof: ["tiles", "#5a4a42"], trim: "#ffffff" },
    nordic:       { at: "europe", shape: "gable", pitch: 40, eave: 0.15, out: ["boards", "#8c2f28"], roof: ["metal", "#2f3437"], trim: "#ffffff" },
    chalet:       { at: "europe", shape: "gable", pitch: 24, eave: 1.3, out: ["boards", "#8a6340"], roof: ["woodshakes", "#7a5f45"], trim: "#ffffff", shutters: "#3f6a3c" },
    izba:         { at: "europe", shape: "gable", pitch: 42, eave: 0.5, out: ["logs", "#6b4a2f"], roof: ["metal", "#2f4a3c"], trim: "#dfe9f2" },
    cycladic:     { at: "europe", shape: "flat", pitch: 0, eave: 0.2, out: ["stucco", "#f7f7f4"], roof: ["metal", "#eeeeea"], trim: "#1f5fa8", parapet: 0.35 },
    // ---- Asia
    japanese:     { at: "asia", shape: "pagoda", pitch: 30, eave: 1.0, out: ["boards", "#3a3530"], roof: ["tiles", "#5d6166"], trim: "#a5784c" },
    chinese:      { at: "asia", shape: "pagoda", pitch: 28, eave: 0.9, out: ["brick", "#8f8a80"], roof: ["tiles", "#4a4f57"], trim: "#9c2b23" },
    hanok:        { at: "asia", shape: "pagoda", pitch: 30, eave: 1.1, out: ["stucco", "#f2ece2"], roof: ["tiles", "#3f4246"], trim: "#8a6340" },
    thai:         { at: "asia", shape: "pagoda", pitch: 48, eave: 0.9, out: ["boards", "#8a5a36"], roof: ["tiles", "#b5603f"], trim: "#c9a24a" },
    balinese:     { at: "asia", shape: "hip", pitch: 45, eave: 0.9, out: ["stone", "#b9b1a3"], roof: ["thatch", "#9c8452"], trim: "#6e4a32" },
    haveli:       { at: "asia", shape: "flat", pitch: 0, eave: 0.4, out: ["stucco", "#e8a27a"], roof: ["metal", "#c99a7a"], trim: "#ffffff", parapet: 0.8 },
    // ---- the Middle East and Africa
    riad:         { at: "mideast", shape: "flat", pitch: 0, eave: 0.2, out: ["stucco", "#d98b5f"], roof: ["metal", "#c27a52"], trim: "#2f6a8a", parapet: 0.7 },
    arabian:      { at: "mideast", shape: "dome", pitch: 0, eave: 0.2, out: ["stucco", "#e2cfa8"], roof: ["metal", "#d9c7a6"], trim: "#2f8a7a", parapet: 0.6, dome: "#e8e2d4" },
    sahel:        { at: "mideast", shape: "flat", pitch: 0, eave: 0.2, out: ["stucco", "#b9895a"], roof: ["metal", "#a87a4c"], trim: "#5e3f27", vigas: true, parapet: 0.7 },
    rondavel:     { at: "mideast", shape: "hip", pitch: 46, eave: 0.6, out: ["stucco", "#c9a273"], roof: ["thatch", "#b59a62"], trim: "#5e3f27" },
    // ---- Oceania
    queenslander: { at: "oceania", shape: "hip", pitch: 30, eave: 0.8, out: ["siding", "#f2efe8"], roof: ["metal", "#c9ced3"], trim: "#2f5f3c", porch: true },
    nzvilla:      { at: "oceania", shape: "gable", pitch: 35, eave: 0.4, out: ["siding", "#f4f2ec"], roof: ["metal", "#7a2e2a"], trim: "#ffffff", porch: true },
    // ---- modern, anywhere
    modern:       { at: "modern", shape: "flat", pitch: 0, eave: 0.15, out: ["stucco", "#f2f0ea"], roof: ["metal", "#9aa0a4"], trim: "#2a2c2e", parapet: 0.25 },
    contemporary: { at: "modern", shape: "shed", pitch: 10, eave: 0.6, out: ["cladding", "#3f464c"], roof: ["metal", "#2a2c2e"], trim: "#2a2c2e" },
    ecohouse:     { at: "modern", shape: "slab", pitch: 3, eave: 1.1, out: ["boards", "#a5784c"], roof: ["solar", "#263850"], trim: "#2a2c2e" }
  };
  var STYLE_REGIONS = ["americas", "europe", "asia", "mideast", "oceania", "modern"];
  var STYLE_SHAPES = ["hip", "gable", "flat", "slab", "mansard", "gambrel", "aframe", "shed", "butterfly", "pagoda", "dome", "stepped"];
  // Flat roofs and their kin are laid a room at a time -- slabs overlapping
  // would flicker -- the pitched ones over the house's shape as a whole.
  var STYLE_FLATS = { flat: true, slab: true, dome: true, shed: true, butterfly: true };
  function styleNow() { var k = houseOpt("style"); return HOUSE_STYLES[k] ? HOUSE_STYLES[k] : null; }
  function styleRoofShape() {
    var own = houseOpt("roofShape");
    if (STYLE_SHAPES.indexOf(own) >= 0) { return own; }
    var s = styleNow();
    return s ? s.shape : "hip";
  }
  function stylePitch() {
    var s = styleNow(), shape = styleRoofShape();
    if (shape === "aframe") { return Math.tan(60 * Math.PI / 180); }
    if (s && s.pitch && s.shape === shape) { return Math.tan(s.pitch * Math.PI / 180); }
    return { gable: Math.tan(35 * Math.PI / 180), shed: Math.tan(10 * Math.PI / 180), butterfly: Math.tan(8 * Math.PI / 180),
             pagoda: Math.tan(30 * Math.PI / 180), stepped: Math.tan(55 * Math.PI / 180) }[shape] || ROOF_PITCH;
  }
  function styleRidge() { var s = styleNow(); return s && s.pitch > 40 ? 6.2 : s ? 4.6 : ROOF_RIDGE; }
  function styleEave() { var s = styleNow(); return s ? s.eave : ROOF_EAVE; }
  function styleTrim(plain) { var s = styleNow(); return s ? s.trim : plain; }

  // Picked: the style kept, its walls and its roof put on every room --
  // one step to Undo.
  function styleApply(key) {
    keepUndo();
    var h = Object.assign({}, hand.house || {});
    if (key) { h.style = key; } else { delete h.style; }
    delete h.roofShape;
    if (Object.keys(h).length) { hand.house = h; } else { delete hand.house; }
    var S = HOUSE_STYLES[key];
    hand.nodes.forEach(function (r) {
      if (r.kind !== "i_room") { return; }
      var m = Object.assign({}, r.mat || {});
      if (S) { m.out = S.out[0]; m.outC = S.out[1]; m.roof = S.roof[0]; m.roofC = S.roof[1]; }
      else { delete m.out; delete m.outC; delete m.roof; delete m.roofC; }
      if (Object.keys(m).length) { r.mat = m; } else { delete r.mat; }
    });
    if (typeof handKeep === "function") { handKeep(); }
    houseFresh();
  }

  // ---- the roofs -----------------------------------------------------------------------
  // Each over one of the rectangles roofPlan (38-view3d.js, 39-house.js)
  // gives: x0..x1 by y0..y1, z the top of its walls, `eave` how far it
  // hangs out each side (none where something stands against it), `k` how
  // steep.  Laid out along its ridge: u along, v across.
  function styleFrame(R) {
    var along = (R.x1 - R.x0) >= (R.y1 - R.y0), e = R.eave || { n: 0, s: 0, w: 0, e: 0 };
    return {
      along: along, u0: along ? R.x0 : R.y0, u1: along ? R.x1 : R.y1, v0: along ? R.y0 : R.x0, v1: along ? R.y1 : R.x1,
      eu0: along ? e.w : e.n, eu1: along ? e.e : e.s, ev0: along ? e.n : e.w, ev1: along ? e.s : e.e,
      P: function (u, v, h) { return along ? [u, v, h] : [v, u, h]; }
    };
  }
  function styleNormal(pts) {               // Newell's way: three corners or many
    var nx = 0, ny = 0, nz = 0;
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], b = pts[(i + 1) % pts.length];
      nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
    }
    var l = Math.hypot(nx, ny, nz) || 1;
    return [nx / l, ny / l, nz / l];
  }
  // A face of roof, facing up; a face of wall, facing out from `mid`.
  function styleMaker(faces, R, how) {
    var mid = [(R.x0 + R.x1) / 2, (R.y0 + R.y1) / 2];
    var wallHow = { wall: true, color: how.color, edge: how.edge, alpha: how.alpha, late: how.late };
    return {
      roof: function (pts, h) {
        var n = styleNormal(pts);
        if (n[2] < 0) { n = [-n[0], -n[1], -n[2]]; }
        faces.push({ pts: pts, n: n, how: h || how, roof: true });
      },
      under: function (pts) {               // seen from under the eaves
        var n = styleNormal(pts);
        if (n[2] > 0) { n = [-n[0], -n[1], -n[2]]; }
        // painted as the trim is, a little of the roof's color in it
        var soffit = v3Mix(styleTrim("#f1eee8"), how.color || "#888888", 0.3);
        faces.push({ pts: pts, n: n, how: { piece: true, color: soffit, edge: how.edge, alpha: how.alpha, late: how.late, bare: true } });
      },
      wall: function (pts) {
        var n = styleNormal(pts), cx = 0, cy = 0;
        pts.forEach(function (p) { cx += p[0] / pts.length; cy += p[1] / pts.length; });
        if (n[0] * (cx - mid[0]) + n[1] * (cy - mid[1]) < 0) { n = [-n[0], -n[1], -n[2]]; }
        faces.push({ pts: pts, n: n, how: wallHow, side: true, node: R.room });
      },
      box: function (base, z0, z1, h) {      // a block, its sides walls of the house unless asked
        var f0 = faces.length;
        v3Prism(faces, base, z0, z1, h || wallHow);
        if (!h) { for (var i = f0; i < faces.length; i++) { faces[i].node = R.room; } }
      },
      wallHow: wallHow
    };
  }
  // Gabled: two slopes up to a ridge along the length, the end walls
  // carried up under them.  `steps`, as in Holland: the ends stepped up
  // past the roof.  `gambrel`: each slope broken, steep low down and
  // shallow over, as a barn.
  function styleGable(faces, R, z, k, how, opt) {
    var F = styleFrame(R), P = F.P, M = styleMaker(faces, R, how), px = FLOOR_PX;
    var half = (F.v1 - F.v0) / 2, vm = (F.v0 + F.v1) / 2;
    var r0 = F.eu0 ? Math.min(F.eu0, 0.3 * px) : 0, r1 = F.eu1 ? Math.min(F.eu1, 0.3 * px) : 0;
    if (opt.steps) { r0 = r1 = 0; }
    var a = F.u0 - r0, b = F.u1 + r1;
    var ev0 = F.ev0, ev1 = F.ev1;
    if (opt.aframe) {                     // down nearly to the ground, both sides
      ev0 = F.ev0 ? Math.min(2.6 * px, Math.max(F.ev0, (z - 0.55 * px) / k)) : 0;
      ev1 = F.ev1 ? Math.min(2.6 * px, Math.max(F.ev1, (z - 0.55 * px) / k)) : 0;
    }
    if (opt.gambrel) {
      var k1 = Math.tan(62 * Math.PI / 180), k2 = Math.tan(24 * Math.PI / 180), run = half * 0.32;
      var zb = z + run * k1, top = zb + (half - run) * k2;
      M.roof([P(a, F.v0 - ev0, z - ev0 * k1), P(b, F.v0 - ev0, z - ev0 * k1), P(b, F.v0 + run, zb), P(a, F.v0 + run, zb)]);
      M.roof([P(a, F.v0 + run, zb), P(b, F.v0 + run, zb), P(b, vm, top), P(a, vm, top)]);
      M.roof([P(b, F.v1 + ev1, z - ev1 * k1), P(a, F.v1 + ev1, z - ev1 * k1), P(a, F.v1 - run, zb), P(b, F.v1 - run, zb)]);
      M.roof([P(b, F.v1 - run, zb), P(a, F.v1 - run, zb), P(a, vm, top), P(b, vm, top)]);
      [F.u0, F.u1].forEach(function (u) {
        M.wall([P(u, F.v0, z), P(u, F.v0 + run, zb), P(u, vm, top), P(u, F.v1 - run, zb), P(u, F.v1, z)]);
      });
      return { top: top, eaveK: k1 };
    }
    var topZ = z + half * k;
    M.roof([P(a, F.v0 - ev0, z - ev0 * k), P(b, F.v0 - ev0, z - ev0 * k), P(b, vm, topZ), P(a, vm, topZ)]);
    M.roof([P(b, F.v1 + ev1, z - ev1 * k), P(a, F.v1 + ev1, z - ev1 * k), P(a, vm, topZ), P(b, vm, topZ)]);
    if (ev0) { M.under([P(a, F.v0 - ev0, z - ev0 * k), P(b, F.v0 - ev0, z - ev0 * k), P(b, F.v0, z), P(a, F.v0, z)]); }
    if (ev1) { M.under([P(a, F.v1, z), P(b, F.v1, z), P(b, F.v1 + ev1, z - ev1 * k), P(a, F.v1 + ev1, z - ev1 * k)]); }
    M.wall([P(F.u0, F.v0, z), P(F.u0, vm, topZ), P(F.u0, F.v1, z)]);
    M.wall([P(F.u1, F.v1, z), P(F.u1, vm, topZ), P(F.u1, F.v0, z)]);
    // a board along each rake, where the roof runs out past the end wall
    var trimC = styleTrim("#f1eee8"), barge = { piece: true, color: trimC, edge: v3Mix(trimC, "#000000", 0.3), alpha: how.alpha, late: how.late, bare: true };
    [[a, r0, -1], [b, r1, 1]].forEach(function (end) {
      if (!end[1]) { return; }
      var u = end[0], dh = 0.18 * px, out = end[2];
      [[F.v0 - ev0, z - ev0 * k], [F.v1 + ev1, z - ev1 * k]].forEach(function (lo) {
        var pts = [P(u, lo[0], lo[1] - dh), P(u, vm, topZ - dh), P(u, vm, topZ + 0.02 * px), P(u, lo[0], lo[1] + 0.02 * px)];
        faces.push({ pts: pts, n: F.along ? [out, 0, 0] : [0, out, 0], how: barge });
      });
    });
    if (opt.steps) {
      // the ends stepped up past the slopes, a coping on each step
      var n = Math.max(3, Math.round((topZ - z) / (0.6 * px))), sv = half / n, sh = (topZ - z) / n, T = 0.32 * px;
      [[F.u0, 1], [F.u1, -1]].forEach(function (end) {
        var u = end[0], inward = end[1];
        for (var j = 0; j < n; j++) {
          var va = F.v0 + j * sv, vb = F.v1 - j * sv, z0 = z + j * sh, z1 = z + (j + 1) * sh + (j === n - 1 ? 0.35 * px : 0);
          var base = [P(u, va, 0), P(u + inward * T, va, 0), P(u + inward * T, vb, 0), P(u, vb, 0)].map(function (p) { return [p[0], p[1]]; });
          M.box(base, z0, z1);
        }
      });
    }
    return { top: topZ, eaveK: k };
  }
  // Hipped, all four sides sloping -- the house's own (roofFaces), or its
  // curved kind: in Japan, China, Korea, Thailand the eaves sweep out
  // flatter and turn up at the corners, a heavy ridge along the top.
  function stylePagoda(faces, R, z, k, how) {
    var M = styleMaker(faces, R, how), px = FLOOR_PX;
    var W = R.x1 - R.x0, D = R.y1 - R.y0, along = W >= D, half = (along ? D : W) / 2;
    var top = z + half * k, xm = (R.x0 + R.x1) / 2, ym = (R.y0 + R.y1) / 2;
    var A = along ? [R.x0 + half, ym] : [xm, R.y0 + half], B = along ? [R.x1 - half, ym] : [xm, R.y1 - half];
    var nw = [R.x0, R.y0], ne = [R.x1, R.y0], se = [R.x1, R.y1], sw = [R.x0, R.y1];
    function w(c) { return [c[0], c[1], z]; }
    function r(c) { return [c[0], c[1], top]; }
    if (along) {
      M.roof([w(nw), w(ne), r(B), r(A)]); M.roof([w(se), w(sw), r(A), r(B)]);
      M.roof([w(sw), w(nw), r(A)]); M.roof([w(ne), w(se), r(B)]);
    } else {
      M.roof([w(nw), w(sw), r(B), r(A)]); M.roof([w(se), w(ne), r(A), r(B)]);
      M.roof([w(ne), w(nw), r(A)]); M.roof([w(sw), w(se), r(B)]);
    }
    // the sweep: flatter than the roof, out to an eave that lifts toward its corners
    var e = R.eave || { n: 0, s: 0, w: 0, e: 0 }, kf = k * 0.38, lift = 0.32 * px;
    function edge(c0, c1, out0, out1, dx, dy, ea, eb) {
      var N = 8;
      for (var i = 0; i < N; i++) {
        var t0 = i / N, t1 = (i + 1) / N;
        function inner(t) { return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, z]; }
        function outer(t) {
          // along the eave, out from the wall; out past the corners too, where the next side hangs out
          var x = c0[0] + (c1[0] - c0[0]) * t, y = c0[1] + (c1[1] - c0[1]) * t;
          var ox = dx * out0 + (t === 0 ? -(c1[0] - c0[0] ? Math.sign(c1[0] - c0[0]) : 0) * ea : t === 1 ? (c1[0] - c0[0] ? Math.sign(c1[0] - c0[0]) : 0) * eb : 0);
          var oy = dy * out0 + (t === 0 ? -(c1[1] - c0[1] ? Math.sign(c1[1] - c0[1]) : 0) * ea : t === 1 ? (c1[1] - c0[1] ? Math.sign(c1[1] - c0[1]) : 0) * eb : 0);
          var curl = Math.pow(Math.abs(2 * t - 1), 3) * lift;
          return [x + ox, y + oy, z - out0 * kf + curl];
        }
        M.roof([inner(t0), inner(t1), outer(t1), outer(t0)]);
        M.under([inner(t0), outer(t0), outer(t1), inner(t1)]);
      }
      void out1;
    }
    if (e.n) { edge(nw, ne, e.n, 0, 0, -1, e.w, e.e); }
    if (e.s) { edge(sw, se, e.s, 0, 0, 1, e.w, e.e); }
    if (e.w) { edge(nw, sw, e.w, 0, -1, 0, e.n, e.s); }
    if (e.e) { edge(ne, se, e.e, 0, 1, 0, e.n, e.s); }
    // the ridge: a heavy beam of tiles, its ends turned up
    var ridgeHow = { piece: true, color: v3Mix(how.color || "#555555", "#000000", 0.3), edge: how.edge, alpha: how.alpha, late: how.late, bare: true };
    var t = 0.14 * px, hgt = 0.2 * px;
    var ends = [A, B], ux = along ? 1 : 0, uy = along ? 0 : 1;
    var base = [[ends[0][0] - ux * 0.2 * px - uy * t, ends[0][1] - uy * 0.2 * px - ux * t], [ends[1][0] + ux * 0.2 * px - uy * t, ends[1][1] + uy * 0.2 * px - ux * t],
                [ends[1][0] + ux * 0.2 * px + uy * t, ends[1][1] + uy * 0.2 * px + ux * t], [ends[0][0] - ux * 0.2 * px + uy * t, ends[0][1] - uy * 0.2 * px + ux * t]];
    M.box(base, top - 0.04 * px, top + hgt, ridgeHow);
    ends.forEach(function (c, i) {
      var s = i ? 1 : -1, cx = c[0] + ux * s * 0.32 * px, cy = c[1] + uy * s * 0.32 * px;
      M.box([[cx - t, cy - t], [cx + t, cy - t], [cx + t, cy + t], [cx - t, cy + t]], top, top + hgt + 0.3 * px, ridgeHow);
    });
    return { top: top, eaveK: kf };
  }
  // Mansard, as in Paris: all four sides steep nearly to upright, a low
  // roof over them, and windows standing out of the steep part.
  function styleMansard(faces, R, z, how) {
    var M = styleMaker(faces, R, how), px = FLOOR_PX;
    var W = R.x1 - R.x0, D = R.y1 - R.y0, k1 = Math.tan(72 * Math.PI / 180);
    var rise = Math.min(2.3 * px, Math.min(W, D) * 0.4 * k1), run = rise / k1;
    var zb = z + rise, i0 = [R.x0 + run, R.y0 + run], i1 = [R.x1 - run, R.y1 - run];
    var o = [[R.x0, R.y0], [R.x1, R.y0], [R.x1, R.y1], [R.x0, R.y1]], inn = [[i0[0], i0[1]], [i1[0], i0[1]], [i1[0], i1[1]], [i0[0], i1[1]]];
    for (var s = 0; s < 4; s++) {
      var a = o[s], b = o[(s + 1) % 4], c = inn[(s + 1) % 4], d = inn[s];
      M.roof([[a[0], a[1], z], [b[0], b[1], z], [c[0], c[1], zb], [d[0], d[1], zb]]);
    }
    // the low roof over, hipped
    var k2 = Math.tan(14 * Math.PI / 180), top = { x0: i0[0], x1: i1[0], y0: i0[1], y1: i1[1], z: zb, eave: { n: 0, s: 0, w: 0, e: 0 }, k: k2 };
    roofFacesPlain(faces, top, 0, how);
    // a dormer in the middle of each long side
    var trimC = styleTrim("#f2ece2"), trim = { piece: true, color: trimC, edge: v3Mix(trimC, "#000000", 0.3), alpha: how.alpha, late: how.late };
    var along = W >= D, n = Math.max(1, Math.floor((along ? W : D) / (3.2 * px)));
    for (var q = 0; q < n; q++) {
      var t = (q + 0.5) / n;
      [-1, 1].forEach(function (side) {
        var cx = along ? R.x0 + W * t : (side < 0 ? R.x0 : R.x1) - side * run * 0.5;
        var cy = along ? (side < 0 ? R.y0 : R.y1) - side * run * 0.5 : R.y0 + D * t;
        var hw = 0.5 * px, hd = run * 0.75;
        var base = along ? [[cx - hw, cy - hd], [cx + hw, cy - hd], [cx + hw, cy + hd], [cx - hw, cy + hd]]
                         : [[cx - hd, cy - hw], [cx + hd, cy - hw], [cx + hd, cy + hw], [cx - hd, cy + hw]];
        M.box(base, z + 0.25 * px, zb - 0.2 * px, trim);
        // its glass, on the face toward the street of that side
        var gx = along ? cx : cx + side * hd + side * 0.01 * px, gy = along ? cy + side * hd + side * 0.01 * px : cy;
        var gb = along ? [[gx - hw * 0.7, gy - 0.02 * px], [gx + hw * 0.7, gy - 0.02 * px], [gx + hw * 0.7, gy + 0.02 * px], [gx - hw * 0.7, gy + 0.02 * px]]
                       : [[gx - 0.02 * px, gy - hw * 0.7], [gx + 0.02 * px, gy - hw * 0.7], [gx + 0.02 * px, gy + hw * 0.7], [gx - 0.02 * px, gy + hw * 0.7]];
        M.box(gb, z + 0.4 * px, zb - 0.35 * px, { glass: true, edge: trim.edge, alpha: how.alpha, late: how.late });
        // a little roof on it
        M.box(along ? [[cx - hw - 3, cy - hd - 3], [cx + hw + 3, cy - hd - 3], [cx + hw + 3, cy + hd + 3], [cx - hw - 3, cy + hd + 3]]
                    : [[cx - hd - 3, cy - hw - 3], [cx + hd + 3, cy - hw - 3], [cx + hd + 3, cy + hw + 3], [cx - hd - 3, cy + hw + 3]],
              zb - 0.2 * px, zb - 0.08 * px, how);
      });
    }
    return { top: zb + Math.min(i1[0] - i0[0], i1[1] - i0[1]) / 2 * k2, eaveK: k1 };
  }
  // Flat, behind a parapet: the walls carried up past the roof, capped,
  // on every side open to the sky; or, as a slab, a thick flat roof
  // hanging well out, a modern house's or a prairie house's.  And from an
  // adobe house's walls, the ends of its beams.
  function styleFlat(faces, R, z, how, slab) {
    var M = styleMaker(faces, R, how), px = FLOOR_PX, S = styleNow() || {}, e = R.eave || { n: 0, s: 0, w: 0, e: 0 };
    if (slab) {
      var E = { n: e.n, s: e.s, w: e.w, e: e.e }, th = 0.28 * px;
      var base = [[R.x0 - E.w, R.y0 - E.n], [R.x1 + E.e, R.y0 - E.n], [R.x1 + E.e, R.y1 + E.s], [R.x0 - E.w, R.y1 + E.s]];
      var fasc = { piece: true, color: styleTrim("#f2efe8"), edge: v3Mix(styleTrim("#f2efe8"), "#000000", 0.3), alpha: how.alpha, late: how.late, bare: true, noTop: true };
      v3Prism(faces, base, z, z + th, fasc);
      M.roof(base.map(function (p) { return [p[0], p[1], z + th + 0.5]; }));
      M.under(base.slice().reverse().map(function (p) { return [p[0], p[1], z + 0.5]; }));
      return { top: z + th };
    }
    var par = (S.parapet || 0.5) * px, T = 0.22 * px;
    M.roof([[R.x0, R.y0, z + 2], [R.x1, R.y0, z + 2], [R.x1, R.y1, z + 2], [R.x0, R.y1, z + 2]]);
    var cap = { piece: true, color: styleTrim("#f2efe8"), edge: v3Mix(styleTrim("#f2efe8"), "#000000", 0.3), alpha: how.alpha, late: how.late, bare: true };
    [["n", [R.x0, R.y0], [R.x1, R.y0], [0, 1]], ["s", [R.x0, R.y1], [R.x1, R.y1], [0, -1]],
     ["w", [R.x0, R.y0], [R.x0, R.y1], [1, 0]], ["e", [R.x1, R.y0], [R.x1, R.y1], [-1, 0]]].forEach(function (side) {
      if (!e[side[0]]) { return; }
      var a = side[1], b = side[2], d = side[3];
      var base = [[a[0], a[1]], [b[0], b[1]], [b[0] + d[0] * T, b[1] + d[1] * T], [a[0] + d[0] * T, a[1] + d[1] * T]];
      M.box(base, z, z + par);
      v3Prism(faces, base.map(function (p, i) { return [p[0] - d[0] * (i < 2 ? 0.04 * px : -0.02 * px), p[1] - d[1] * (i < 2 ? 0.04 * px : -0.02 * px)]; }),
              z + par, z + par + 0.06 * px, cap);
      if (S.vigas) {
        // the beams' ends, every 90 cm, a hand under the parapet
        var len = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
        var wood = { piece: true, color: "#6e4a32", edge: "#3a2a1c", alpha: how.alpha, late: how.late, pat: 21 };
        for (var t = 0.6 * px; t < len - 0.4 * px; t += 0.9 * px) {
          var cx = a[0] + ux * t, cy = a[1] + uy * t, r = 0.08 * px, out = 0.5 * px;
          v3Prism(faces, [[cx - ux * r, cy - uy * r], [cx + ux * r, cy + uy * r],
                          [cx + ux * r - d[0] * out, cy + uy * r - d[1] * out], [cx - ux * r - d[0] * out, cy - uy * r - d[1] * out]],
                  z - 0.42 * px, z - 0.26 * px, wood);
        }
      }
    });
    return { top: z + par };
  }
  // Leaning one way (a lean-to, a modern house's), or two ways down into a
  // valley in the middle (a butterfly): the walls carried up under it.
  function styleShed(faces, R, z, k, how, butterfly) {
    var F = styleFrame(R), P = F.P, M = styleMaker(faces, R, how);
    var deep = F.v1 - F.v0, a = F.u0 - F.eu0, b = F.u1 + F.eu1;
    if (!butterfly) {
      var hi = z + deep * k;                // high at the back (v0), low at the front
      M.roof([P(a, F.v0 - F.ev0, hi + F.ev0 * k), P(b, F.v0 - F.ev0, hi + F.ev0 * k), P(b, F.v1 + F.ev1, z - F.ev1 * k), P(a, F.v1 + F.ev1, z - F.ev1 * k)]);
      M.under([P(a, F.v0 - F.ev0, hi + F.ev0 * k - 3), P(a, F.v1 + F.ev1, z - F.ev1 * k - 3), P(b, F.v1 + F.ev1, z - F.ev1 * k - 3), P(b, F.v0 - F.ev0, hi + F.ev0 * k - 3)]);
      M.wall([P(F.u0, F.v0, z), P(F.u0, F.v0, hi), P(F.u0, F.v1, z)]);
      M.wall([P(F.u1, F.v1, z), P(F.u1, F.v0, hi), P(F.u1, F.v0, z)]);
      M.wall([P(F.u0, F.v0, z), P(F.u1, F.v0, z), P(F.u1, F.v0, hi), P(F.u0, F.v0, hi)]);
      return { top: hi, eaveK: k };
    }
    var vm = (F.v0 + F.v1) / 2, edgeZ = z + deep / 2 * k;
    M.roof([P(a, F.v0 - F.ev0, edgeZ + F.ev0 * k), P(b, F.v0 - F.ev0, edgeZ + F.ev0 * k), P(b, vm, z), P(a, vm, z)]);
    M.roof([P(b, F.v1 + F.ev1, edgeZ + F.ev1 * k), P(a, F.v1 + F.ev1, edgeZ + F.ev1 * k), P(a, vm, z), P(b, vm, z)]);
    M.under([P(a, F.v0 - F.ev0, edgeZ + F.ev0 * k - 3), P(a, vm, z - 3), P(b, vm, z - 3), P(b, F.v0 - F.ev0, edgeZ + F.ev0 * k - 3)]);
    M.under([P(b, F.v1 + F.ev1, edgeZ + F.ev1 * k - 3), P(b, vm, z - 3), P(a, vm, z - 3), P(a, F.v1 + F.ev1, edgeZ + F.ev1 * k - 3)]);
    [F.v0, F.v1].forEach(function (v) { M.wall([P(F.u0, v, z), P(F.u1, v, z), P(F.u1, v, edgeZ), P(F.u0, v, edgeZ)]); });
    [F.u0, F.u1].forEach(function (u) {
      M.wall([P(u, F.v0, z), P(u, F.v0, edgeZ), P(u, vm, z)]);
      M.wall([P(u, vm, z), P(u, F.v1, edgeZ), P(u, F.v1, z)]);
    });
    return { top: edgeZ, eaveK: -k };
  }
  // A dome on a drum over the middle of the biggest flat roof.
  function styleDome(faces, R, z, how) {
    var S = styleNow() || {}, px = FLOOR_PX, top = styleFlat(faces, R, z, how, false).top;
    var W = R.x1 - R.x0, D = R.y1 - R.y0;
    if (Math.min(W, D) < 4.5 * px || !R.biggest) { return { top: top }; }
    var r = Math.min(W, D) * 0.28, cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2, drum = 0.7 * px;
    var col = S.dome || "#e8e2d4", look = { piece: true, color: col, edge: v3Mix(col, "#000000", 0.3), alpha: how.alpha, late: how.late, bare: true };
    var ring = [];
    for (var i = 0; i < 20; i++) { var t = i / 20 * Math.PI * 2; ring.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]); }
    v3Prism(faces, ring, z, z + drum, Object.assign({}, look, { noTop: true }));
    var rows = 6, z0 = z + drum;
    for (var j = 0; j < rows; j++) {
      var a0 = j / rows * Math.PI / 2, a1 = (j + 1) / rows * Math.PI / 2;
      for (var q = 0; q < 20; q++) {
        var t0 = q / 20 * Math.PI * 2, t1 = (q + 1) / 20 * Math.PI * 2;
        function pt(t, a) { return [cx + Math.cos(t) * r * Math.cos(a), cy + Math.sin(t) * r * Math.cos(a), z0 + r * 1.1 * Math.sin(a)]; }
        var pts = j === rows - 1 ? [pt(t0, a0), pt(t1, a0), pt(t0, a1)] : [pt(t0, a0), pt(t1, a0), pt(t1, a1), pt(t0, a1)];
        var mt = (t0 + t1) / 2, ma = (a0 + a1) / 2;
        faces.push({ pts: pts, n: [Math.cos(mt) * Math.cos(ma), Math.sin(mt) * Math.cos(ma), Math.sin(ma)], how: look });
      }
    }
    // and a finial
    v3Prism(faces, [[cx - 2, cy - 2], [cx + 2, cy - 2], [cx + 2, cy + 2], [cx - 2, cy + 2]], z0 + r * 1.1 - 2, z0 + r * 1.1 + 0.5 * px,
            { piece: true, color: "#c9a24a", edge: "#7a5f2a", alpha: how.alpha, late: how.late });
    return { top: z0 + r * 1.1 };
  }

  // The roofs, by shape: the house's own hip roof (38-view3d.js, with the
  // gutters 39-house.js hangs on it) for the hipped, the shapes above for
  // the rest, gutters along the eaves they have.
  var roofFacesPlain = typeof roofFaces === "function" ? roofFaces : null;
  if (roofFacesPlain) {
    roofFaces = function (faces, R, lift, how) {
      var shape = styleRoofShape();
      if (shape === "hip" || R.turn || !how) { return roofFacesPlain.apply(this, arguments); }
      var z = R.z + lift + (R.bias || 0), k = R.k || stylePitch(), got;
      try {
        if (shape === "gable" || shape === "stepped" || shape === "gambrel" || shape === "aframe") {
          got = styleGable(faces, R, z, shape === "aframe" ? Math.tan(60 * Math.PI / 180) : k, how,
                           { steps: shape === "stepped", gambrel: shape === "gambrel", aframe: shape === "aframe" });
        } else if (shape === "pagoda") { got = stylePagoda(faces, R, z, k, how); }
        else if (shape === "mansard") { got = styleMansard(faces, R, z, how); }
        else if (shape === "flat") { got = styleFlat(faces, R, z, how, false); }
        else if (shape === "slab") { got = styleFlat(faces, R, z, how, true); }
        else if (shape === "shed" || shape === "butterfly") { got = styleShed(faces, R, z, stylePitch(), how, shape === "butterfly"); }
        else if (shape === "dome") { got = styleDome(faces, R, z, how); }
        else { return roofFacesPlain.apply(this, arguments); }
      } catch (e) { return roofFacesPlain.apply(this, arguments); }
      // gutters, along the eaves the shape has: the long sides of a gable,
      // round all four of the rest that slope; none on a flat roof
      if (got && got.eaveK > 0 && R.runs && R.runs.length && typeof gutterFaces === "function") {
        var F = styleFrame(R), keep = shape === "gable" || shape === "stepped" || shape === "gambrel" || shape === "aframe"
          ? (F.along ? { n: 1, s: 1 } : { w: 1, e: 1 }) : shape === "shed" ? (F.along ? { s: 1 } : { e: 1 }) : { n: 1, s: 1, w: 1, e: 1 };
        var runs = R.runs.filter(function (r) { return keep[r.side]; });
        if (runs.length && shape !== "mansard") {
          try { gutterFaces(faces, Object.assign({}, R, { runs: runs, k: got.eaveK, bias: R.bias }), lift, how); } catch (e2) { /* without */ }
        }
      }
      return undefined;
    };
  }

  // ---- what goes with a style -------------------------------------------------------------
  // Shutters each side of the windows, a chimney, a porch roofed over the
  // door on its posts -- put up with the house when the whole of it is
  // seen.
  function styleExtras(model) {
    var S = styleNow();
    if (!S || !V3 || V3.scene === "space" || (V3.flat && V3.flatDone) || V3.low) { return; }
    var inside = V3.mode === "walk", indoors = inside && !!V3.inRoom;
    if (!inside && (V3.rise === undefined ? 1 : V3.rise) < 0.98) { return; }
    var whole = inside ? !indoors : (V3.upTo === null || V3.upTo === undefined);
    var floors = typeof floorsOf === "function" ? floorsOf() : [], px = FLOOR_PX;
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room"; });
    function inRoom(x, y) { return rooms.some(function (r) { return insideArea(r, x, y); }); }
    if (S.shutters && whole) {
      var sc = S.shutters, look = { piece: true, color: sc, edge: v3Mix(sc, "#000000", 0.35), pat: 43 };
      hand.nodes.forEach(function (w) {
        if (w.kind !== "i_window") { return; }
        var f = floors.length ? floorAt(floors, w.x, w.y) : null, t = (w.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t);
        var aIn = inRoom(w.x + ux * 0.6 * px, w.y + uy * 0.6 * px), bIn = inRoom(w.x - ux * 0.6 * px, w.y - uy * 0.6 * px);
        if (aIn === bIn) { return; }
        var sx = aIn ? -ux : ux, sy = aIn ? -uy : uy;              // out
        var room = rooms.filter(function (r) { return insideArea(r, w.x - sx * 0.6 * px, w.y - sy * 0.6 * px); })[0];
        if (!room) { return; }
        var q = turned(room), face = Math.abs(sx) > 0.5 ? room.x + Math.sign(sx) * q.w / 2 : room.y + Math.sign(sy) * q.h / 2;
        var dx = f ? f.dx : 0, dy = f ? f.dy : 0, dz = f ? f.z : 0;
        var top = Math.min(DOOR_TALL * px, ceilOf(room) * px - 0.1 * px), sill = SILL * px;
        var wide = Math.min(0.5 * px, w.w * 0.42), th = 0.035 * px;
        [-1, 1].forEach(function (side) {
          var along = side * (w.w / 2 + wide / 2 + 0.05 * px), base;
          if (Math.abs(sx) > 0.5) {
            var x0 = face + sx * 0.02 * px, x1 = face + sx * (0.02 * px + th), yc = w.y + along;
            base = [[x0, yc - wide / 2], [x1, yc - wide / 2], [x1, yc + wide / 2], [x0, yc + wide / 2]];
          } else {
            var y0 = face + sy * 0.02 * px, y1 = face + sy * (0.02 * px + th), xc = w.x + along;
            base = [[xc - wide / 2, y0], [xc + wide / 2, y0], [xc + wide / 2, y1], [xc - wide / 2, y1]];
          }
          v3Prism(model.faces, base.map(function (p) { return [p[0] + dx, p[1] + dy]; }), dz + sill - 0.02 * px, dz + top, look);
        });
      });
    }
    if (S.porch && whole) { stylePorch(model, S, floors, rooms, inRoom); }
    if (S.chimney && whole && typeof roofKept === "object" && roofKept.out) { styleChimney(model, S); }
  }
  // A porch over the door out to the front: a roof on two posts.
  function stylePorch(model, S, floors, rooms, inRoom) {
    var px = FLOOR_PX, trimC = S.trim, post = { piece: true, color: trimC, edge: v3Mix(trimC, "#000000", 0.35) };
    var done = 0;
    hand.nodes.forEach(function (d) {
      if (done >= 2 || !WALK_DOORS[d.kind] || d.kind === "i_garagedoor") { return; }
      var f = floors.length ? floorAt(floors, d.x, d.y) : null;
      if (f && f.level !== 0) { return; }
      var t = (d.turn || 0) * Math.PI / 180, ux = -Math.sin(t), uy = Math.cos(t);
      var aIn = inRoom(d.x + ux * 0.8 * px, d.y + uy * 0.8 * px), bIn = inRoom(d.x - ux * 0.8 * px, d.y - uy * 0.8 * px);
      if (aIn === bIn) { return; }
      var sx = aIn ? -ux : ux, sy = aIn ? -uy : uy;
      var room = rooms.filter(function (r) { return insideArea(r, d.x - sx * 0.8 * px, d.y - sy * 0.8 * px); })[0];
      if (!room) { return; }
      // nothing out there already (a deck, a drive, the garage)
      if (hand.nodes.some(function (o) { return o !== d && (o.kind === "i_deck" || o.kind === "i_patio" || o.kind === "i_driveway") && insideArea(o, d.x + sx * 1.2 * px, d.y + sy * 1.2 * px); })) { return; }
      done++;
      var q = turned(room), face = Math.abs(sx) > 0.5 ? room.x + Math.sign(sx) * q.w / 2 : room.y + Math.sign(sy) * q.h / 2;
      var deep = 1.7 * px, half = d.w / 2 + 0.85 * px, zb = Math.min(ceilOf(room) * px, 2.75 * px) - 0.05 * px, zf = zb - 0.3 * px;
      var dx = f ? f.dx : 0, dy = f ? f.dy : 0;
      function W(a, o) {                    // a along the wall from the door, o out from the wall
        return Math.abs(sx) > 0.5 ? [face + sx * o + dx, d.y + a + dy] : [d.x + a + dx, face + sy * o + dy];
      }
      // the roof, sloping out from the wall
      var roofHow = { roof: true, color: v3Mix(simLook(room).line, simSheet(), 0.55), edge: simLook(room).line, room: room };
      var p = [W(-half - 0.1 * px, 0), W(half + 0.1 * px, 0), W(half + 0.1 * px, deep + 0.15 * px), W(-half - 0.1 * px, deep + 0.15 * px)];
      var slab = [[p[0][0], p[0][1], zb + 0.12 * px], [p[1][0], p[1][1], zb + 0.12 * px], [p[2][0], p[2][1], zf + 0.12 * px], [p[3][0], p[3][1], zf + 0.12 * px]];
      var sn = styleNormal(slab);
      if (sn[2] < 0) { sn = [-sn[0], -sn[1], -sn[2]]; }
      model.faces.push({ pts: slab, n: sn, how: roofHow, roof: true });
      v3Prism(model.faces, p, zf, zf + 0.12 * px, { piece: true, color: trimC, edge: post.edge, bare: true, noTop: true });
      // its posts, and a step up to the door
      [-half + 0.1 * px, half - 0.1 * px].forEach(function (a) {
        var c = W(a, deep), r = 0.08 * px;
        var f0 = model.faces.length;
        v3Prism(model.faces, [[c[0] - r, c[1] - r], [c[0] + r, c[1] - r], [c[0] + r, c[1] + r], [c[0] - r, c[1] + r]], 0, zf, post);
        for (var i = f0; i < model.faces.length; i++) { model.faces[i].node = room; }
      });
      var s0 = W(-half, 0.02 * px), s1 = W(half, deep + 0.1 * px);
      v3Prism(model.faces, [[Math.min(s0[0], s1[0]), Math.min(s0[1], s1[1])], [Math.max(s0[0], s1[0]), Math.min(s0[1], s1[1])],
                            [Math.max(s0[0], s1[0]), Math.max(s0[1], s1[1])], [Math.min(s0[0], s1[0]), Math.max(s0[1], s1[1])]],
              0, 0.12 * px, { piece: true, color: "#bdb8ae", edge: "#7d786e", pat: 10 });
    });
  }
  // A chimney up past the top of the roof, at one end of the biggest part
  // of it -- of brick, or of stone.
  function styleChimney(model, S) {
    var px = FLOOR_PX, best = null;
    roofKept.out.forEach(function (R) { if (!R.turn && (!best || (R.x1 - R.x0) * (R.y1 - R.y0) > (best.x1 - best.x0) * (best.y1 - best.y0))) { best = R; } });
    if (!best) { return; }
    var F = styleFrame(best), P = F.P, half = (F.v1 - F.v0) / 2, top = best.z + half * (best.k || stylePitch()) + 0.9 * px;
    var u = F.u0 + Math.min(1.4 * px, (F.u1 - F.u0) * 0.2), v = (F.v0 + F.v1) / 2 + 0.55 * px;
    var col = S.chimney === "stone" ? "#9a9488" : "#8c4a3a", look = { piece: true, color: col, edge: v3Mix(col, "#000000", 0.35), pat: S.chimney === "stone" ? 41 : 40 };
    var a = 0.45 * px, b = 0.32 * px;
    var base = [P(u - a, v - b, 0), P(u + a, v - b, 0), P(u + a, v + b, 0), P(u - a, v + b, 0)].map(function (p) { return [p[0], p[1]]; });
    var f0 = model.faces.length;
    v3Prism(model.faces, base, best.z - 0.2 * px, top, look);
    var capB = [P(u - a - 4, v - b - 4, 0), P(u + a + 4, v - b - 4, 0), P(u + a + 4, v + b + 4, 0), P(u - a - 4, v + b + 4, 0)].map(function (p) { return [p[0], p[1]]; });
    v3Prism(model.faces, capB, top, top + 0.08 * px, { piece: true, color: "#6f6a62", edge: "#3f3a32" });
    var flue = [P(u - a * 0.4, v - b * 0.5, 0), P(u + a * 0.4, v - b * 0.5, 0), P(u + a * 0.4, v + b * 0.5, 0), P(u - a * 0.4, v + b * 0.5, 0)].map(function (p) { return [p[0], p[1]]; });
    v3Prism(model.faces, flue, top + 0.08 * px, top + 0.24 * px, { piece: true, color: "#4a4540", edge: "#2a2520" });
    for (var i = f0; i < model.faces.length; i++) { model.faces[i].node = best.room; }
  }
  if (typeof v3Build === "function") {
    var v3BuildStyle = v3Build;
    v3Build = function () {
      var model = v3BuildStyle.apply(this, arguments);
      try { styleExtras(model); } catch (e) { /* the house without them */ }
      return model;
    };
  }
  // The biggest of the flat roofs has the dome.
  if (typeof roofPlan === "function") {
    var roofPlanStyle = roofPlan;
    roofPlan = function () {
      var out = roofPlanStyle.apply(this, arguments), big = null;
      out.forEach(function (R) { R.biggest = false; if (!R.turn && (!big || (R.x1 - R.x0) * (R.y1 - R.y0) > (big.x1 - big.x0) * (big.y1 - big.y0))) { big = R; } });
      if (big) { big.biggest = true; }
      return out;
    };
  }

  // ---- pictures of them, to pick from -------------------------------------------------------
  // Each style drawn from the front in a few lines: its roof's shape, its
  // walls, a door, windows, a chimney or shutters.
  var STYLE_ROOF_ART = {
    hip: "M5 16 L13 8.5 H31 L39 16 Z",
    gable: "M6 16 L22 5 L38 16 Z",
    flat: "M8 12.5 H36 V16 H8 Z",
    slab: "M3 13 H41 V16 H3 Z",
    mansard: "M8 16 L11 8.5 H33 L36 16 Z M11 8.5 L13 6.8 H31 L33 8.5",
    gambrel: "M6 16 L10 9 L22 4.6 L34 9 L38 16 Z",
    aframe: "M4 27 L22 2.6 L40 27",
    shed: "M6 16 V15 L38 8.5 V11 L8 16.6",
    butterfly: "M6 9.5 L22 14.5 L38 9.5 V11 L22 16 L6 11 Z",
    pagoda: "M3 14.5 C7 15.6 9.6 13 12 10.4 L15.6 6.6 H28.4 L32 10.4 C34.4 13 37 15.6 41 14.5 M15.6 6.6 L14.6 5 M28.4 6.6 L29.4 5",
    dome: "M8 12.5 H36 V16 H8 Z M16 12.5 A6 5.6 0 0 1 28 12.5 M22 6.9 V5",
    stepped: "M9 16 V13 H11.6 V10.4 H14.2 V7.8 H16.8 V5.2 H19.4 V3 H24.6 V5.2 H27.2 V7.8 H29.8 V10.4 H32.4 V13 H35 V16"
  };
  function styleArt(key, shapeOnly) {
    var S = HOUSE_STYLES[key] || { shape: key }, shape = shapeOnly ? key : S.shape;
    var out = [];
    if (shape !== "aframe") { out.push('<path d="M9 16 V27 H35 V16"/>'); }
    out.push('<path d="' + (STYLE_ROOF_ART[shape] || STYLE_ROOF_ART.hip) + '"/>');
    out.push('<path d="M19.6 27 V20.6 H24.4 V27"/>');
    if (shape === "aframe") { out.push('<path d="M15 27 V17 M29 27 V17 M17 12 H27 M22 12 V17"/>'); }
    else { out.push('<path d="M12 18.6 H16.4 V22.6 H12 Z M27.6 18.6 H32 V22.6 H27.6 Z"/>'); }
    if (!shapeOnly && S.shutters) { out.push('<path d="M10.6 18.6 V22.6 M17.8 18.6 V22.6 M26.2 18.6 V22.6 M33.4 18.6 V22.6"/>'); }
    if (!shapeOnly && S.chimney) { out.push('<path d="M29 9 V4.4 H32 V11"/>'); }
    if (!shapeOnly && S.porch) { out.push('<path d="M16.6 19.2 H27.4 M17.4 19.2 V27 M26.6 19.2 V27"/>'); }
    if (!shapeOnly && S.vigas) { out.push('<path d="M11 14 H8.6 M16 14 H13.6 M21 14 H18.6 M26 14 H23.6 M31 14 H28.6 M36 14 H33.6"/>'); }
    out.push('<path d="M3 27 H41"/>');
    return '<svg class="sy-art" viewBox="0 0 44 30" aria-hidden="true">' + out.join("") + "</svg>";
  }

  // In the view's Settings, on the House tab (39-house.js): the style --
  // the one there now, and the rest to pick from by where they are from --
  // and the roof's shape on its own.
  var styleOpen = false;
  function styleSection(sheet, head, draw) {
    var now = houseOpt("style"), S = HOUSE_STYLES[now];
    head(TXT.sy_head);
    var card = document.createElement("div");
    card.className = "sy-now";
    card.innerHTML = styleArt(now || "plain") + '<span class="sy-now-words"><b></b><span></span></span><button type="button" class="btn small"></button>';
    card.querySelector("b").textContent = S ? TXT["sy_" + now] || now : TXT.sy_plain;
    card.querySelector(".sy-now-words span").textContent = S ? TXT["sy_r_" + S.at] : TXT.sy_plain_sub;
    var btn = card.querySelector("button");
    btn.textContent = styleOpen ? TXT.hs_done : TXT.sy_change;
    btn.setAttribute("aria-expanded", styleOpen ? "true" : "false");
    btn.onclick = function () { styleOpen = !styleOpen; draw(); };
    sheet.appendChild(card);
    if (styleOpen) {
      var gal = document.createElement("div");
      gal.className = "sy-gallery";
      function tile(key) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "sy-tile" + ((now || "") === key ? " on" : "");
        b.setAttribute("aria-pressed", (now || "") === key ? "true" : "false");
        b.innerHTML = styleArt(key || "plain") + "<span></span>";
        b.lastChild.textContent = key ? TXT["sy_" + key] || key : TXT.sy_plain;
        b.onclick = function () {
          styleApply(key);
          handSaysSoft(say("sy_applied", { name: key ? TXT["sy_" + key] || key : TXT.sy_plain }));
          draw();
        };
        return b;
      }
      var plainRow = document.createElement("div");
      plainRow.className = "sy-grid";
      plainRow.appendChild(tile(""));
      gal.appendChild(plainRow);
      STYLE_REGIONS.forEach(function (r) {
        var h = document.createElement("div");
        h.className = "sy-region";
        h.textContent = TXT["sy_r_" + r];
        gal.appendChild(h);
        var grid = document.createElement("div");
        grid.className = "sy-grid";
        Object.keys(HOUSE_STYLES).forEach(function (k) { if (HOUSE_STYLES[k].at === r) { grid.appendChild(tile(k)); } });
        gal.appendChild(grid);
      });
      sheet.appendChild(gal);
    }
    head(TXT.rf_head);
    var grid2 = document.createElement("div");
    grid2.className = "hs-weather hs-pick sy-shapes";
    grid2.setAttribute("role", "radiogroup");
    var shape = styleRoofShape();
    STYLE_SHAPES.forEach(function (k) {
      var b = document.createElement("button");
      b.type = "button";
      var on = shape === k;
      b.className = "hs-wx" + (on ? " on" : "");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.innerHTML = styleArt(k, true) + "<span></span>";
      b.lastChild.textContent = TXT["rf_" + k] || k;
      b.onclick = function () {
        var s = styleNow();
        houseSetOpt("roofShape", s && s.shape === k ? "" : k === "hip" && !s ? "" : k);
        draw();
      };
      grid2.appendChild(b);
    });
    sheet.appendChild(grid2);
  }
  Object.assign(HOUSE_PLAIN, { style: "", roofShape: "" });
  // said quietly, over the view, rather than under the plan
  function handSaysSoft(words) {
    if (typeof v3Say === "function" && V3) { v3Say(words); } else if (typeof handSays === "function") { handSays(words); }
  }
