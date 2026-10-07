// ---------------------------------------------------------------------------
//  40-cars.js -- cars as they are: a sedan, a hatchback, an SUV, a pickup, a
//  minivan, a coupe, a van -- each its own shape at its own size, in the
//  colors cars are, parked in the lots and driven past on the street
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-07: "add more car models for there to be parked in parking lots and to make
  // sure all their designs are sound")  Every parked car was the one box-bodied car, in the one blue.
  // Now each is one of seven, at its own length, width and height (in metres, as they are made), its
  // body shaped along its length -- the nose down over the bumper, the hood up to the windscreen, the
  // deck or the tailgate behind -- its cabin glass between pillars, narrowing to the roof; its wheels
  // on the ground at their axles, inside the body's sides; lamps, a grille, bumpers, mirrors and
  // plates where they go.  Each parked car keeps which it is and its color (`car`: "suv|#b9bec4");
  // the paint a piece is given in Style is its paint.  Those driven past on the street are the same.
  //
  // (ya: where the windscreen meets the body, from the nose; yc: where the back glass does, or the
  // cab ends; dws, drw: how far each glass runs back or forward as it rises; ovF, ovR: the
  // overhangs past the axles; R: the wheels' radius; hn, tail: the nose's and the tail's height)
  var CAR_KINDS = {
    sedan:   { L: 4.70, W: 1.82, belt: 0.92, roof: 1.45, hn: 0.68, tail: 0.96, ya: 1.55, yc: 3.70, dws: 0.70, drw: 0.50, R: 0.32, ovF: 0.95, ovR: 1.02 },
    hatch:   { L: 4.05, W: 1.76, belt: 0.92, roof: 1.47, hn: 0.68, tail: 0.98, ya: 1.30, yc: 3.80, dws: 0.72, drw: 0.30, R: 0.31, ovF: 0.86, ovR: 0.66 },
    suv:     { L: 4.70, W: 1.90, belt: 1.06, roof: 1.74, hn: 0.86, tail: 1.06, ya: 1.45, yc: 4.50, dws: 0.62, drw: 0.24, R: 0.37, ovF: 0.92, ovR: 0.98, clear: 0.22, rails: true },
    pickup:  { L: 5.40, W: 1.98, belt: 1.12, roof: 1.86, hn: 0.98, tail: 1.08, ya: 1.68, yc: 3.30, dws: 0.62, drw: 0.04, R: 0.39, ovF: 0.95, ovR: 1.25, clear: 0.26, bed: true },
    minivan: { L: 5.05, W: 1.96, belt: 1.00, roof: 1.76, hn: 0.80, tail: 1.02, ya: 1.25, yc: 4.88, dws: 0.95, drw: 0.16, R: 0.34, ovF: 0.95, ovR: 1.02 },
    coupe:   { L: 4.45, W: 1.85, belt: 0.84, roof: 1.30, hn: 0.60, tail: 0.88, ya: 1.75, yc: 4.05, dws: 1.00, drw: 1.25, R: 0.33, ovF: 0.95, ovR: 0.92, clear: 0.14 },
    van:     { L: 5.30, W: 2.00, belt: 1.10, roof: 2.20, hn: 0.98, tail: 1.10, ya: 1.02, yc: 5.24, dws: 0.62, drw: 0.02, R: 0.36, ovF: 0.90, ovR: 1.10, clear: 0.20, panel: true }
  };
  // how many of each there are about (an SUV the commonest), and what colors cars are painted (white,
  // black, greys and silver most of them)
  var CAR_MIX = [["suv", 30], ["sedan", 28], ["hatch", 12], ["pickup", 12], ["minivan", 8], ["coupe", 5], ["van", 5]];
  var CAR_PAINT = [["#f2f2ef", 24], ["#16181b", 18], ["#5d6166", 16], ["#b9bec4", 14], ["#2f4f8a", 9], ["#9a1f1f", 9],
                   ["#1f2a44", 4], ["#b8a27a", 2], ["#2f4f3a", 2], ["#d9b02a", 1]];
  function carWeighted(list, rnd) {
    var all = list.reduce(function (s, x) { return s + x[1]; }, 0), at = rnd() * all;
    for (var i = 0; i < list.length; i++) { at -= list[i][1]; if (at < 0) { return list[i][0]; } }
    return list[0][0];
  }
  // A car to park, at random (or the paint asked for).
  function carPick(rnd, paint) { return carWeighted(CAR_MIX, rnd) + "|" + (paint || carWeighted(CAR_PAINT, rnd)); }
  function carOf(n) {
    var s = String((n && n.car) || "sedan|"), i = s.indexOf("|"), kind = i >= 0 ? s.slice(0, i) : s, color = i >= 0 ? s.slice(i + 1) : "";
    return { kind: CAR_KINDS[kind] ? kind : "sedan", color: /^#[0-9a-f]{6}$/i.test(color) ? color : "#3f5f8a" };
  }
  // A seeded throw for a piece: the same car each time for the same piece.
  function carRand(seed) {
    var k = 0;
    return function () { var v = Math.sin(seed * 0.0173 + (++k) * 12.9898) * 43758.5453; return v - Math.floor(v); };
  }

  // ---- made -------------------------------------------------------------------------------------
  // In the model's numbers: x across, y along (its nose at -y, as the plan draws it), z up; `k` its
  // size against the piece's own (the piece drawn bigger on the plan, the car bigger).
  function carModel(M, kind, color, k) {
    var S = CAR_KINDS[kind] || CAR_KINDS.sedan, P = FLOOR_PX * (k || 1);
    var L = S.L * P, hw = S.W / 2 * P, y0 = -L / 2, y1 = L / 2, clr = (S.clear || 0.18) * P;
    var paint = M.mat("metal", color), glass = M.mat("screen", "#1c2632"), trim = M.mat("plastic", "#1d1f22");
    var tire = M.mat("rubber", "#141414"), rim = M.mat("chrome", "#c9ced3"), lamp = M.mat("glow", "#fff6e0"), red = M.mat("glow", "#d8392e");
    var plate = M.mat("plastic", "#f2f0ea");
    var ya = y0 + S.ya * P, yc = Math.min(y0 + S.yc * P, y1 - 0.05 * P), belt = S.belt * P, roof = S.roof * P;
    var hn = S.hn * P, tail = S.tail * P, bodyEnd = S.bed ? yc : y1;
    // the body, a section at a time along it: [y, top, in from the side, bottom]
    var st = [[y0, hn - 0.05 * P, 0.15 * P, 0.34 * P], [y0 + 0.16 * P, hn, 0.04 * P, clr + 0.06 * P],
              [ya, belt, 0, clr]];
    if (S.bed) {
      st.push([yc, belt, 0, clr]);
    } else {
      if (yc < y1 - 0.3 * P) { st.push([yc, belt + 0.02 * P, 0, clr]); }
      st.push([y1 - 0.16 * P, tail, 0.04 * P, clr + 0.08 * P], [y1, tail - 0.06 * P, 0.14 * P, 0.36 * P]);
    }
    st.sort(function (a, b) { return a[0] - b[0]; });
    carLoft(M, paint, st, hw, 0.07 * P);
    // the cabin: its glass all round, narrowing to the roof, the roof over it, the pillars between
    var gb = hw - 0.07 * P, gr = gb - 0.11 * P, top = roof, fy = ya + S.dws * P, ry = Math.max(fy + 0.2 * P, yc - S.drw * P);
    var cabin = { ya: ya, yc: yc, fy: fy, ry: ry, belt: belt, top: top, gb: gb, gr: gr };
    carCabin(M, paint, glass, cabin, S, P);
    if (S.rails) {
      [-1, 1].forEach(function (s) { M.box(s * (gr - 0.06 * P) - 0.025 * P, s * (gr - 0.06 * P) + 0.025 * P, fy + 0.15 * P, ry - 0.1 * P, top, top + 0.05 * P, trim); });
    }
    if (S.bed) { carBed(M, paint, trim, yc, y1, hw, clr, belt, tail, P); }
    // the wheels, on the ground at their axles, within the body's sides
    // (each tire's outer face just out past the body's side, the wheel well dark round it behind: the
    // whole wheel seen from the side, not its foot under a box)
    var tw = 0.23 * P, R = S.R * P, wx = hw + 0.012 * P - tw / 2;
    [y0 + S.ovF * P, y1 - S.ovR * P].forEach(function (y) {
      [-1, 1].forEach(function (s) {
        M.push().move(s * (hw + 0.004 * P), y, R).tiltY(90);
        M.cyl(0, 0, -0.003 * P, 0.003 * P, R + 0.06 * P, trim, { seg: 20 });
        M.pop();
        M.push().move(s * wx, y, R).tiltY(90);
        M.cyl(0, 0, -tw / 2, tw / 2, R, tire, { seg: 18 });
        M.cyl(0, 0, s * (tw / 2 + 0.2 * MODEL_CM), s * (tw / 2 + 0.6 * MODEL_CM), R * 0.62, rim, { seg: 14 });
        M.pop();
      });
    });
    // the bumpers, the grille, the lamps, the plates
    M.box(-hw + 0.06 * P, hw - 0.06 * P, y0 - 0.04 * P, y0 + 0.12 * P, 0.22 * P, 0.42 * P, trim, 3 * MODEL_CM);
    var tailY = S.bed ? y1 : y1;
    M.box(-hw + 0.06 * P, hw - 0.06 * P, tailY - 0.12 * P, tailY + 0.04 * P, 0.24 * P, 0.44 * P, trim, 3 * MODEL_CM);
    M.box(-hw * 0.38, hw * 0.38, y0 - 0.012 * P, y0 + 0.03 * P, 0.44 * P, hn - 0.12 * P, trim);
    [-1, 1].forEach(function (s) {
      M.box(s * (hw - 0.3 * P) - 0.16 * P, s * (hw - 0.3 * P) + 0.16 * P, y0 - 0.01 * P, y0 + 0.04 * P, hn - 0.16 * P, hn - 0.07 * P, lamp);
      var tz = S.bed ? belt : tail;
      M.box(s * (hw - 0.2 * P) - 0.12 * P, s * (hw - 0.2 * P) + 0.12 * P, tailY - 0.06 * P, tailY + 0.005 * P, tz - 0.24 * P, tz - 0.06 * P, red);
    });
    M.box(-0.26 * P, 0.26 * P, y0 - 0.06 * P, y0 - 0.04 * P, 0.26 * P, 0.38 * P, plate);
    M.box(-0.26 * P, 0.26 * P, tailY - 0.005 * P, tailY + 0.015 * P, 0.47 * P, 0.59 * P, plate);
    // the mirrors, on the doors at the foot of the windscreen's pillars: an arm out from the glass, the
    // housing on it, its glass facing back
    [-1, 1].forEach(function (s) {
      var my = ya + 0.16 * P, mz = belt + 0.04 * P;
      M.box(s * gb, s * (hw + 0.06 * P), my - 0.03 * P, my + 0.03 * P, mz, mz + 0.04 * P, trim);
      M.box(s * (hw + 0.02 * P), s * (hw + 0.2 * P), my - 0.05 * P, my + 0.04 * P, mz + 0.01 * P, mz + 0.14 * P, paint, 1.5 * MODEL_CM);
      M.box(s * (hw + 0.035 * P), s * (hw + 0.185 * P), my + 0.04 * P, my + 0.046 * P, mz + 0.025 * P, mz + 0.125 * P, M.mat("chrome", "#9fb0bd"));
    });
  }
  // A body lofted through its sections, closed at each end.
  function carLoft(M, m, st, hw, r) {
    function ring(s) {
      var w = hw - s[2], zb = s[3], zt = Math.max(s[3] + 2 * r + 1, s[1]);
      return [[-w + r, zb], [w - r, zb], [w, zb + r], [w, zt - r], [w - r, zt], [-w + r, zt], [-w, zt - r], [-w, zb + r]];
    }
    var rings = st.map(function (s) { return { y: s[0], p: ring(s) }; });
    for (var i = 0; i + 1 < rings.length; i++) {
      var A = rings[i], B = rings[i + 1];
      if (B.y - A.y < 0.5) { continue; }
      for (var j = 0; j < 8; j++) {
        var a = A.p[j], b = A.p[(j + 1) % 8], c = B.p[(j + 1) % 8], d = B.p[j];
        var p1 = [a[0], A.y, a[1]], p2 = [b[0], A.y, b[1]], p3 = [c[0], B.y, c[1]], p4 = [d[0], B.y, d[1]];
        var zc = (A.p[0][1] + A.p[4][1] + B.p[0][1] + B.p[4][1]) / 4;
        carQuad(M, m, p1, p2, p3, p4, [0, (A.y + B.y) / 2, zc]);
      }
    }
    [[rings[0], -1], [rings[rings.length - 1], 1]].forEach(function (E) {
      var R = E[0], cx = 0, cz = 0;
      R.p.forEach(function (q) { cx += q[0] / 8; cz += q[1] / 8; });
      for (var j = 0; j < 8; j++) {
        var a = R.p[j], b = R.p[(j + 1) % 8], nn = [0, E[1], 0];
        M.tri(m, [cx, R.y, cz], [a[0], R.y, a[1]], [b[0], R.y, b[1]], nn, nn, nn);
      }
    });
  }
  // A face, its way out away from `c` (a point on the car's middle line, level with it).
  function carQuad(M, m, A, B, C, D, c) {
    var mx = (A[0] + B[0] + C[0] + D[0]) / 4, my = (A[1] + B[1] + C[1] + D[1]) / 4, mz = (A[2] + B[2] + C[2] + D[2]) / 4;
    var want = [mx - c[0], my - c[1], mz - c[2]];
    M.quad(m, A, B, C, D, carN(A, B, D, want));
  }
  // The cabin over the belt: windscreen, side glass, back glass, the roof -- and the pillars in paint
  // over the glass's edges (a van's sides paint behind its doors).
  function carCabin(M, paint, glass, c, S, P) {
    var lift = 0.004 * P;
    var FA = [-c.gb, c.ya, c.belt], FB = [c.gb, c.ya, c.belt], TA = [-c.gr, c.fy, c.top], TB = [c.gr, c.fy, c.top];
    var RA = [-c.gb, c.yc, c.belt], RB = [c.gb, c.yc, c.belt], UA = [-c.gr, c.ry, c.top], UB = [c.gr, c.ry, c.top];
    M.quad(glass, FA, FB, TB, TA, carN(FA, FB, TA, [0, -1, 0.5]));               // the windscreen
    M.quad(glass, RB, RA, UA, UB, carN(RB, RA, UB, [0, 1, 0.5]));               // the back glass
    M.quad(paint, TA, TB, UB, UA, [0, 0, 1]);                                    // the roof
    [-1, 1].forEach(function (s) {
      var a = [s * c.gb, c.ya, c.belt], b = [s * c.gb, c.yc, c.belt], t1 = [s * c.gr, c.fy, c.top], t2 = [s * c.gr, c.ry, c.top];
      var nn = carN(a, b, t1, [s, 0, 0.3]);
      if (S.panel) {
        // (a van: glass in its front doors only, painted panels behind)
        var cut = Math.min(c.yc - 0.1 * P, c.ya + 1.15 * P), mb = [s * c.gb, cut, c.belt], mt = [s * c.gr, Math.max(cut, c.fy), c.top];
        M.quad(glass, a, mb, mt, t1, nn);
        M.quad(paint, mb, b, t2, mt, nn);
      } else {
        M.quad(glass, a, b, t2, t1, nn);
      }
      var o = [nn[0] * lift, 0, nn[2] * lift];
      function pillar(p0, p1, q1, q0) { M.quad(paint, carAdd(p0, o), carAdd(p1, o), carAdd(q1, o), carAdd(q0, o), nn); }
      // the windscreen's pillar, along its edge
      pillar(a, carAdd(a, [0, 0.09 * P, 0]), carAdd(t1, [0, 0.07 * P, 0]), t1);
      // the middle one, upright between the doors
      var mid = (c.ya + c.yc) / 2 + (S.bed ? 0.25 * P : 0), half = 0.05 * P;
      if (c.yc - c.ya > 1.6 * P && !S.panel) {
        var f = function (y) { return [s * c.gb, y, c.belt]; };
        var tb = function (y) { return [s * c.gr, Math.max(c.fy, Math.min(c.ry, y)), c.top]; };
        pillar(f(mid - half), f(mid + half), tb(mid + half), tb(mid - half));
      }
      // the back one, wide on a car with a deck behind, narrow on an upright back
      var wide = (S.drw > 0.4 ? 0.22 : 0.09) * P;
      pillar(carAdd(b, [0, -wide, 0]), b, t2, carAdd(t2, [0, -Math.min(wide, 0.08 * P), 0]));
      // the line along the top of the glass
      pillar(carAdd(t1, [0, 0, -0.06 * P]), carAdd(t2, [0, 0, -0.06 * P]), t2, t1);
    });
  }
  function carAdd(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function carLerp(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  // The way out of a face (A, B, D its corners), turned to agree with `want`.
  function carN(A, B, D, want) {
    var u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [D[0] - A[0], D[1] - A[1], D[2] - A[2]];
    var n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], l = Math.hypot(n[0], n[1], n[2]) || 1;
    n = [n[0] / l, n[1] / l, n[2] / l];
    if (n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0) { n = [-n[0], -n[1], -n[2]]; }
    return n;
  }
  // A pickup's bed: its floor, its sides, the front against the cab, the tailgate.
  function carBed(M, paint, trim, y0, y1, hw, clr, belt, tail, P) {
    var t = 0.05 * P, floor = clr + 0.38 * P, top = Math.max(belt, tail);
    M.box(-hw + t, hw - t, y0, y1 - t, clr + 0.08 * P, floor, trim);                  // the floor (lined)
    M.box(-hw, hw, y0, y1, clr + 0.02 * P, clr + 0.1 * P, paint);                      // under it
    [-1, 1].forEach(function (s) { M.box(s * hw - (s > 0 ? t : 0), s * hw + (s < 0 ? t : 0), y0, y1, clr, top, paint, 1 * MODEL_CM); });
    M.box(-hw, hw, y0, y0 + t, floor, top, paint);
    M.box(-hw, hw, y1 - t, y1, clr + 0.08 * P, top, paint, 1 * MODEL_CM);              // the tailgate
    M.box(-hw + 0.02 * P, hw - 0.02 * P, y0 - 0.002 * P, y0 + t, top, top + 0.025 * P, trim);
  }

  // ---- the piece --------------------------------------------------------------------------------
  if (typeof MODEL_KEYED === "object") { MODEL_KEYED.car = true; }
  if (typeof mDef === "function") {
    mDef("i_parked", function (M, W, D, H, C, n) {
      var c = carOf(n), k = Math.max(0.5, Math.min(3, Math.min(W / (1.8 * FLOOR_PX), D / (4.0 * FLOOR_PX))));
      carModel(M, c.kind, C.main || c.color, k);
    });
  }
  // Each parked car made one of them as it is put down -- and one drawn before there were any given
  // its own the first time it is seen (the same one each time: by which piece it is).
  if (typeof adviceAdd === "function") {
    var adviceAddCars = adviceAdd;
    adviceAdd = function (kind) {
      var n = adviceAddCars.apply(this, arguments);
      if (n && kind === "i_parked" && !n.car) { n.car = carPick(carRand(n.id * 7 + Math.round(n.x) * 3 + Math.round(n.y))); }
      return n;
    };
  }
  if (typeof v3Build === "function") {
    var v3BuildCars = v3Build;
    v3Build = function () {
      try { hand.nodes.forEach(function (n) { if (n.kind === "i_parked" && !n.car) { n.car = carPick(carRand(n.id * 7 + 11)); } }); } catch (e) { /* as they were */ }
      return v3BuildCars.apply(this, arguments);
    };
  }
  // Those driven past on the street (39-world.js's worldFolk): the same cars, each its own kind, made once
  // and put where it is by now -- no box to walk into, faded where the street runs out of sight.
  function worldCarModel(faces, at, f, k, col, fade) {
    if (typeof v3ModelPut !== "function" || !MODELS.i_parked) { return false; }
    var n = { id: "drive" + k, kind: "i_parked", x: at[0], y: at[1], w: 90, h: 200, turn: Math.atan2(f[0], -f[1]) * 180 / Math.PI,
              car: carPick(carRand(k * 131 + 7), col) };
    var f0 = faces.length;
    try { if (!v3ModelPut(faces, n, function () { return 0; }, function () { return 3; })) { return false; } }
    catch (e) { faces.length = f0; return false; }
    for (var i = faces.length - 1; i >= f0; i--) {
      var F = faces[i];
      if (F.how && F.how.ghost) { faces.splice(i, 1); continue; }
      F.moves = true;
      if (fade < 0.999) { F.how = Object.assign({}, F.how, { alpha: fade, late: true }); }
    }
    return true;
  }
