// ---------------------------------------------------------------------------
//  40-solar.js -- solar panels on any roof: in rows on the slopes that
//  face the sun, on racks tilted up to it on a flat one; and more for the
//  House tab of the view's Settings
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "and to be able to add solar panels to any roof
  // a long with other things")
  //
  // A roof of solar slates was a roof's material (38-models.js); these are
  // panels put on whatever roof it is -- shingles, tiles, metal, a flat
  // roof behind its parapet.  Laid out on each face of roof the shape has
  // made (roofFaces), in a grid of whole panels kept back from its edges,
  // on the faces turned toward the sun (it shines from up the paper and to
  // the left, 38-view3d-more.js); on a flat roof, rows of them tilted up
  // toward it, far enough apart not to shade each other.
  HOUSE_PLAIN.solar = false;
  var SOLAR_W = 1.04, SOLAR_H = 1.74, SOLAR_GAP = 0.03, SOLAR_EDGE = 0.45;    // metres
  var SOLAR_SUN = (function () { var x = -0.42, y = -0.58, l = Math.hypot(x, y); return [x / l, y / l]; })();
  var SOLAR_CELLS = { piece: true, color: "#1b2638", edge: "#8d969e", pat: 69 };
  var SOLAR_FRAME = { piece: true, color: "#b9bfc4", edge: "#7d858c", pat: 22 };

  function solarInside(poly, p, edge) {        // inside a flat polygon (2D), at least `edge` from its sides
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) { inside = !inside; }
    }
    if (!inside) { return false; }
    for (var k = 0; k < poly.length; k++) {
      var A = poly[k], B = poly[(k + 1) % poly.length], dx = B[0] - A[0], dy = B[1] - A[1], l2 = dx * dx + dy * dy || 1;
      var t = Math.max(0, Math.min(1, ((p[0] - A[0]) * dx + (p[1] - A[1]) * dy) / l2));
      if (Math.hypot(p[0] - A[0] - dx * t, p[1] - A[1] - dy * t) < edge) { return false; }
    }
    return true;
  }
  // One panel: four corners on the roof (its plane, raised a little), its
  // glass on top, its frame round it.
  function solarPanel(faces, c, u, v, n, lift) {
    var P = FLOOR_PX, hu = SOLAR_W * P / 2, hv = SOLAR_H * P / 2, th = 0.04 * P;
    function at(su, sv, up) { return [c[0] + u[0] * su + v[0] * sv + n[0] * up, c[1] + u[1] * su + v[1] * sv + n[1] * up, c[2] + u[2] * su + v[2] * sv + n[2] * up]; }
    var lo = lift, hi = lift + th;
    var top = [at(-hu, -hv, hi), at(hu, -hv, hi), at(hu, hv, hi), at(-hu, hv, hi)];
    var bot = [at(-hu, -hv, lo), at(hu, -hv, lo), at(hu, hv, lo), at(-hu, hv, lo)];
    faces.push({ pts: top, n: n.slice(), how: SOLAR_CELLS });
    for (var i = 0; i < 4; i++) {
      var j = (i + 1) % 4, mx = (top[i][0] + top[j][0]) / 2 - c[0], my = (top[i][1] + top[j][1]) / 2 - c[1], mz = (top[i][2] + top[j][2]) / 2 - c[2];
      var l = Math.hypot(mx, my, mz) || 1;
      faces.push({ pts: [bot[i], bot[j], top[j], top[i]], n: [mx / l, my / l, mz / l], how: SOLAR_FRAME });
    }
  }
  // On a face of roof: a grid of panels across it, up from its foot.
  function solarOnSlope(faces, f, made, fits) {
    var P = FLOOR_PX, n = f.n, pts = f.pts;
    var hl = Math.hypot(n[0], n[1]);
    if (hl < 0.05) { return made; }
    var u = [-n[1] / hl, n[0] / hl, 0];                                    // level, across the slope
    var v = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];   // up the slope
    if (v[2] < 0) { v = [-v[0], -v[1], -v[2]]; }
    var o = pts[0], flat = pts.map(function (p) { var d = [p[0] - o[0], p[1] - o[1], p[2] - o[2]]; return [d[0] * u[0] + d[1] * u[1] + d[2] * u[2], d[0] * v[0] + d[1] * v[1] + d[2] * v[2]]; });
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    flat.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
    var W = SOLAR_W * P, H = SOLAR_H * P, G = SOLAR_GAP * P, E = SOLAR_EDGE * P;
    var cols = Math.floor((x1 - x0 - 2 * E + G) / (W + G)), rows = Math.floor((y1 - y0 - 2 * E + G) / (H + G));
    if (cols < 1 || rows < 1) { return made; }
    var sx = x0 + (x1 - x0 - (cols * (W + G) - G)) / 2 + W / 2, sy = y0 + E + H / 2;
    for (var r = 0; r < rows && made < 400; r++) {
      for (var c = 0; c < cols && made < 400; c++) {
        var cx = sx + c * (W + G), cy = sy + r * (H + G);
        var ok = [[-1, -1], [1, -1], [1, 1], [-1, 1]].every(function (s) { return solarInside(flat, [cx + s[0] * W / 2, cy + s[1] * H / 2], E * 0.6); });
        if (!ok) { continue; }
        var C = [o[0] + u[0] * cx + v[0] * cy, o[1] + u[1] * cx + v[1] * cy, o[2] + u[2] * cx + v[2] * cy];
        if (!fits([[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]].map(function (q) { return [C[0] + u[0] * q[0] * W / 2 + v[0] * q[1] * H / 2, C[1] + u[1] * q[0] * W / 2 + v[1] * q[1] * H / 2, C[2] + u[2] * q[0] * W / 2 + v[2] * q[1] * H / 2]; }))) { continue; }
        solarPanel(faces, C, u, v, n, 0.07 * P);
        made++;
      }
    }
    return made;
  }
  // On a flat roof: rows tilted 20 degrees up toward the sun, on legs.
  function solarOnFlat(faces, f, made, fits) {
    var P = FLOOR_PX, pts = f.pts, z = pts[0][2];
    var u = [-SOLAR_SUN[1], SOLAR_SUN[0], 0], s = [SOLAR_SUN[0], SOLAR_SUN[1], 0];   // along a row; toward the sun
    var tilt = 20 * Math.PI / 180, ct = Math.cos(tilt), st = Math.sin(tilt);
    var v = [-s[0] * ct, -s[1] * ct, st];                                    // up the panel: away from the sun, rising
    var n = [s[0] * st, s[1] * st, ct];
    var o = pts[0], flat = pts.map(function (p) { var d = [p[0] - o[0], p[1] - o[1]]; return [d[0] * u[0] + d[1] * u[1], d[0] * s[0] + d[1] * s[1]]; });
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    flat.forEach(function (q) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
    var W = SOLAR_W * P, H = SOLAR_H * P, G = SOLAR_GAP * P, E = (SOLAR_EDGE + 0.4) * P, pitch = (SOLAR_H * ct + 1.1) * P;
    var cols = Math.floor((x1 - x0 - 2 * E + G) / (W + G));
    if (cols < 1) { return made; }
    var sx = x0 + (x1 - x0 - (cols * (W + G) - G)) / 2 + W / 2;
    for (var y = y1 - E - H * ct / 2; y > y0 + E + H * ct / 2 && made < 400; y -= pitch) {
      for (var c = 0; c < cols && made < 400; c++) {
        var cx = sx + c * (W + G);
        var ok = [[-1, -1], [1, -1], [1, 1], [-1, 1]].every(function (q) { return solarInside(flat, [cx + q[0] * W / 2, y + q[1] * H * ct / 2], E * 0.5); });
        if (!ok) { continue; }
        var foot = [o[0] + u[0] * cx + s[0] * y, o[1] + u[1] * cx + s[1] * y];
        var mid = [foot[0], foot[1], z + 0.25 * P + H * st / 2];
        if (!fits([[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]].map(function (q) { return [foot[0] + u[0] * q[0] * W / 2 + s[0] * q[1] * H * ct / 2, foot[1] + u[1] * q[0] * W / 2 + s[1] * q[1] * H * ct / 2, z]; }))) { continue; }
        solarPanel(faces, mid, u, v, n, 0);
        // its legs, front and back
        [[-0.4, 0.12], [0.4, 0.12], [-0.4, -0.12], [0.4, -0.12]].forEach(function (lg) {
          var lx = foot[0] + u[0] * lg[0] * W + s[0] * lg[1] * H * ct * 3.2, ly = foot[1] + u[1] * lg[0] * W + s[1] * lg[1] * H * ct * 3.2;
          var top = mid[2] - (lg[1] > 0 ? 1 : -1) * H * st * 0.38;
          v3Prism(faces, [[lx - 2, ly - 2], [lx + 2, ly - 2], [lx + 2, ly + 2], [lx - 2, ly + 2]], z, top, SOLAR_FRAME);
        });
        made++;
      }
    }
    return made;
  }
  // The faces of roof made this picture, gathered as each roof is drawn;
  // the panels laid on them once all are there -- only where a face is the
  // top of the roof (rectangles of roof overlap, 39-house.js: a panel on one
  // under another would come up through it).
  var solarFaces = [];
  if (typeof roofFaces === "function") {
    var roofFacesSolar = roofFaces;
    roofFaces = function (faces, R, lift, how) {
      var from = faces.length, out = roofFacesSolar.apply(this, arguments);
      if (houseOpt("solar") && how && !R.turn) {
        for (var i = from; i < faces.length; i++) { if (faces[i].roof && faces[i].pts.length >= 3) { solarFaces.push(faces[i]); } }
      }
      return out;
    };
  }
  function solarTop(all, x, y) {             // how high the roof is over a point
    var top = -Infinity;
    all.forEach(function (f) {
      var b = f.bb;
      if (x < b[0] || x > b[1] || y < b[2] || y > b[3] || f.n[2] < 0.05) { return; }
      var poly = f.pts, inside = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var a = poly[i], c = poly[j];
        if ((a[1] > y) !== (c[1] > y) && x < (c[0] - a[0]) * (y - a[1]) / (c[1] - a[1]) + a[0]) { inside = !inside; }
      }
      if (!inside) { return; }
      var p = poly[0], n = f.n, z = p[2] - (n[0] * (x - p[0]) + n[1] * (y - p[1])) / n[2];
      if (z > top) { top = z; }
    });
    return top;
  }
  function solarLay(faces, list) {
    var made = 0;
    list.forEach(function (f) {
      var b = [Infinity, -Infinity, Infinity, -Infinity];
      f.pts.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.max(b[1], p[0]); b[2] = Math.min(b[2], p[1]); b[3] = Math.max(b[3], p[1]); });
      f.bb = b;
    });
    // clear of the chimney (where styleChimney, 39-styles.js, puts it), with room round it
    var P = FLOOR_PX, off = [];
    try {
      var S = typeof styleNow === "function" ? styleNow() : null;
      if (S && S.chimney && typeof roofKept === "object" && roofKept.out) {
        var best = null;
        roofKept.out.forEach(function (R) { if (!R.turn && (!best || (R.x1 - R.x0) * (R.y1 - R.y0) > (best.x1 - best.x0) * (best.y1 - best.y0))) { best = R; } });
        if (best) {
          var F = styleFrame(best), cu = F.u0 + Math.min(1.4 * P, (F.u1 - F.u0) * 0.2), cv = (F.v0 + F.v1) / 2 + 0.55 * P;
          var a = 0.45 * P + 0.35 * P, bb = 0.32 * P + 0.35 * P, c0 = F.P(cu - a, cv - bb, 0), c1 = F.P(cu + a, cv + bb, 0);
          off.push([Math.min(c0[0], c1[0]), Math.max(c0[0], c1[0]), Math.min(c0[1], c1[1]), Math.max(c0[1], c1[1])]);
        }
      }
    } catch (e) { /* no chimney to keep from */ }
    // (and a chimney over every fireplace, 40-outside.js)
    try { if (typeof flueKeepOff === "function") { flueKeepOff().forEach(function (k) { off.push(k); }); } } catch (e) { /* none */ }
    function fits(pts) {
      var b = [Infinity, -Infinity, Infinity, -Infinity];
      pts.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.max(b[1], p[0]); b[2] = Math.min(b[2], p[1]); b[3] = Math.max(b[3], p[1]); });
      if (off.some(function (o) { return b[0] < o[1] && b[1] > o[0] && b[2] < o[3] && b[3] > o[2]; })) { return false; }
      return pts.every(function (p) { return solarTop(list, p[0], p[1]) <= p[2] + 2.5; });
    }
    list.forEach(function (f) {
      var n = f.n, from = faces.length, was = made;
      if (n[2] > 0.985) { made = solarOnFlat(faces, f, made, fits); }
      else {
        var hl = Math.hypot(n[0], n[1]);
        // facing the sun (or near enough), and not too steep to stand on
        if (hl > 0 && (n[0] * SOLAR_SUN[0] + n[1] * SOLAR_SUN[1]) / hl > 0.35 && n[2] > 0.45) { made = solarOnSlope(faces, f, made, fits); }
      }
      // a face with room for only a panel or three goes without: no strays
      if (made - was < 4) { faces.length = from; made = was; }
    });
  }
  if (typeof v3Build === "function") {
    var v3BuildSolar = v3Build;
    v3Build = function () {
      solarFaces = [];
      var model = v3BuildSolar.apply(this, arguments);
      try { if (model && model.faces && solarFaces.length) { solarLay(model.faces, solarFaces); } } catch (e) { /* the roof without them */ }
      solarFaces = [];
      return model;
    };
  }

  // ---- more on the House tab --------------------------------------------------------------
  // (39-house.js asks for insideSection after the house's own switches;
  // each part that has something for there puts it in HOUSE_TAB_MORE)
  var HOUSE_TAB_MORE = [];
  function insideSection(sheet, head, tiles, draw) {
    HOUSE_TAB_MORE.forEach(function (fn) { try { fn(sheet, head, tiles, draw); } catch (e) { /* the rest still */ } });
  }
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.solar = '<path d="M3 13.6 6.2 6h10.6l-3.2 7.6z"/><path d="M4.6 9.8h10.6M9.8 6l-1.6 7.6M13.4 6l-1.6 7.6M6 6l-1.4 3.8M8.2 13.6v3M5.6 16.6h5.2"/>';
  }
  HOUSE_TAB_MORE.push(function (sheet, head, tiles) {
    tiles([{ icon: "solar", label: TXT.hs_solar, on: !!houseOpt("solar"), set: function (v) { houseSetOpt("solar", v); } }]);
  });
