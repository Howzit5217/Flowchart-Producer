// ---------------------------------------------------------------------------
//  40-works-mach.js -- the machines on the building site, each at a job:
//  the excavator (its tracks, its turning house, its boom, stick and
//  bucket worked out to reach where it digs), the dump lorry (its bed
//  tipping), the low loader that brings the excavator, the telehandler
//  (its boom out, the forks under the timber), the mobile crane (its legs
//  out, its boom up, the hook and what hangs from it), the mixers and the
//  flatbeds (40-movein.js's), the workers' pickups and the skip.
//
//  Each drawn from its state (40-works.js wkMachine): where it stands in
//  the street's own numbers (x, y, ang) and how its parts are set.
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  var WK_YELLOW = "#f2b81e", WK_DARKM = "#2a2c30";
  // a machine's own numbers to the world's: x forward, y to its left, z up
  function wkFrame(st, extraYaw) {
    var S = st.site.S, w = S.W(st.x, st.y), yaw = S.a + st.ang + (extraYaw || 0), c = Math.cos(yaw), s = Math.sin(yaw);
    return { x: w[0], y: w[1], yaw: yaw, c: c, s: s, at: function (fx, fy, z) { return [w[0] + fx * c - fy * s, w[1] + fx * s + fy * c, z]; } };
  }
  function wkPutM(faces, made, F, z, moving) { moPut(faces, made, F.x, F.y, F.yaw, z || 0, moving); }
  // a solid colour, for the parts drawn as beams (arms, booms, legs)
  function wkHow(color, pat) { return { piece: true, color: color, edge: v3Mix(color, "#000000", 0.3), pat: pat === undefined ? 27 : pat }; }

  // ---- the excavator ---------------------------------------------------------------------------------
  // Its tracks (nose +x), and its house that turns on them: the cab at the
  // front left, the engine behind, the counterweight at the back.
  function wkDiggerTracks() {
    return moModel("wk-tracks", function (M, m) {
      var dark = M.mat("rubber", "#232427"), steel = M.mat("metal", "#3a3d40"), yel = M.mat("lacquer", WK_YELLOW);
      [-1, 1].forEach(function (s) {
        M.box(-2.15 * m, 2.15 * m, s * 1.1 * m - 0.32 * m, s * 1.1 * m + 0.32 * m, 0.0, 0.82 * m, dark, 0.3 * m);   // the track
        M.box(-1.8 * m, 1.8 * m, s * 1.1 * m - 0.2 * m, s * 1.1 * m + 0.2 * m, 0.25 * m, 0.7 * m, steel, 0.05 * m);
        for (var r = 0; r < 6; r++) { M.cyl(-1.5 * m + r * 0.6 * m, s * 1.1 * m + s * 0.33 * m, 0.22 * m, 0.24 * m, 0.13 * m, steel, { seg: 8 }); }
      });
      M.box(-1.2 * m, 1.2 * m, -0.8 * m, 0.8 * m, 0.4 * m, 0.85 * m, steel);
      M.cyl(0, 0, 0.85 * m, 1.0 * m, 0.9 * m, M.mat("metal", "#2a2c30"), { seg: 18 });                                // the slewing ring
      M.box(1.9 * m, 2.35 * m, -1.3 * m, 1.3 * m, 0.1 * m, 0.6 * m, yel, 0.05 * m);                                     // the blade
    });
  }
  function wkDiggerHouse() {
    return moModel("wk-house", function (M, m) {
      var yel = M.mat("lacquer", WK_YELLOW), dark = M.mat("metal", WK_DARKM), glass = M.mat("glass", "#1b2632"), grey = M.mat("metal", "#4a4d52");
      M.box(-1.9 * m, 0.9 * m, -1.25 * m, 1.25 * m, 1.0 * m, 2.05 * m, yel, 0.12 * m);                                 // the engine and deck
      M.box(-2.25 * m, -1.75 * m, -1.25 * m, 1.25 * m, 1.0 * m, 2.1 * m, grey, 0.2 * m);                               // the counterweight
      M.box(-0.2 * m, 1.55 * m, 0.25 * m, 1.25 * m, 1.0 * m, 2.95 * m, yel, 0.1 * m);                                   // the cab
      M.box(0.05 * m, 1.5 * m, 0.22 * m, 1.28 * m, 1.85 * m, 2.8 * m, glass, 0.05 * m);
      M.box(1.48 * m, 1.58 * m, 0.32 * m, 1.18 * m, 1.3 * m, 2.82 * m, glass, 0.03 * m);
      M.box(-1.2 * m, -0.5 * m, -1.0 * m, -0.6 * m, 2.05 * m, 2.6 * m, dark, 0.04 * m);                                 // the exhaust stack
      M.box(0.6 * m, 1.3 * m, -0.5 * m, 0.2 * m, 1.6 * m, 2.1 * m, dark, 0.05 * m);                                      // the boom's foot
      M.box(-0.1 * m, 0.25 * m, 0.55 * m, 1.0 * m, 2.95 * m, 3.05 * m, M.mat("glow", "#ffb020"), 0.04 * m);             // its beacon
    });
  }
  // the reach: from the boom's foot (in the house's numbers) to the bucket's
  // pin, worked out for the boom and the stick to get there (two links)
  var WK_BOOM = 5.4, WK_STICK = 2.8, WK_BUCKET = 1.1, WK_FOOT = [1.0, -0.15, 1.95];
  function wkDiggerArm(r, z) {
    var a = WK_BOOM, b = WK_STICK, d = Math.max(0.5, Math.min(a + b - 0.05, Math.hypot(r, z)));
    var cosB = (a * a + d * d - b * b) / (2 * a * d), base = Math.atan2(z, r), boom = base + Math.acos(Math.max(-1, Math.min(1, cosB)));
    var ex = Math.cos(boom) * a, ez = Math.sin(boom) * a;
    var scale = d / Math.max(1e-6, Math.hypot(r, z)), tx = r * scale, tz = z * scale;
    return { elbow: [ex, ez], pin: [tx, tz] };
  }
  // st: x, y, ang, swing (house on tracks), reach (m, forward of the boom's foot),
  // depth (m, of the bucket's pin, below the boom's foot), curl (0 open .. 1 full), load (0..1)
  WK_DRAW.excavator = function (faces, st, m, T, plan) {
    var P = plan.site.P, F = wkFrame(st), z0 = st.z || 0;
    if (st.onTrailer) { z0 += 1.0 * P; }
    wkPutM(faces, wkDiggerTracks(), F, z0, st.moving);
    var H = wkFrame(st, st.swing || 0);
    wkPutM(faces, wkDiggerHouse(), H, z0, st.moving || st.working);
    // the boom, the stick, the bucket
    var arm = wkDiggerArm(st.reach === undefined ? 4.5 : st.reach, st.lift === undefined ? -1.0 : st.lift);
    function at(fx, z) { return H.at((WK_FOOT[0] + fx) * P, WK_FOOT[1] * P, z0 + (WK_FOOT[2] + z) * P); }
    var foot = at(0, 0), elbow = at(arm.elbow[0], arm.elbow[1]), pin = at(arm.pin[0], arm.pin[1]);
    var yel = wkHow(WK_YELLOW), dark = wkHow(WK_DARKM, 22);
    cnBeam(faces, foot, elbow, 0.42 * P, yel, 0.62 * P);
    cnBeam(faces, elbow, pin, 0.3 * P, yel, 0.42 * P);
    // the rams along them
    cnBeam(faces, at(-0.2, -0.35), at(arm.elbow[0] * 0.55, arm.elbow[1] * 0.55 + 0.35), 0.13 * P, wkHow("#c9cdd2", 23));
    cnBeam(faces, at(arm.elbow[0] - 0.2, arm.elbow[1] + 0.35), at(arm.elbow[0] + (arm.pin[0] - arm.elbow[0]) * 0.55, arm.elbow[1] + (arm.pin[1] - arm.elbow[1]) * 0.55 + 0.3), 0.1 * P, wkHow("#c9cdd2", 23));
    // the bucket: open (teeth down and forward) to curled (up under the stick)
    var curl = st.curl || 0, sd = [arm.pin[0] - arm.elbow[0], arm.pin[1] - arm.elbow[1]], sl = Math.hypot(sd[0], sd[1]) || 1;
    var sa = Math.atan2(sd[1], sd[0]), ba = sa - 0.6 + curl * 2.3;
    var tip = [arm.pin[0] + Math.cos(ba) * WK_BUCKET, arm.pin[1] + Math.sin(ba) * WK_BUCKET], back = [arm.pin[0] + Math.cos(ba + 1.3) * 0.7, arm.pin[1] + Math.sin(ba + 1.3) * 0.7];
    var hw = 0.55 * P, side = [-H.s, H.c];
    function both(p, s) { return [p[0] + side[0] * hw * s, p[1] + side[1] * hw * s, p[2]]; }
    var A = at(arm.pin[0], arm.pin[1]), B = at(tip[0], tip[1]), C = at(back[0], back[1]);
    [-1, 1].forEach(function (s) { faces.push({ pts: [both(A, s), both(B, s), both(C, s)], n: [side[0] * s, side[1] * s, 0], how: dark, moves: true }); });
    faces.push({ pts: [both(A, -1), both(A, 1), both(B, 1), both(B, -1)], n: [0, 0, 1], how: dark, moves: true });
    faces.push({ pts: [both(B, -1), both(B, 1), both(C, 1), both(C, -1)], n: [0, 0, -1], how: dark, moves: true });
    faces.push({ pts: [both(C, -1), both(C, 1), both(A, 1), both(A, -1)], n: [0, 0, 1], how: dark, moves: true });
    if (st.load > 0.05) {
      // earth heaped in it
      var mid = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3, (A[2] + B[2] + C[2]) / 3 + 0.12 * P * st.load];
      cnBox(faces, mid[0], mid[1], 0.4 * P * st.load + 0.1 * P, 0.45 * P, mid[2] - 0.25 * P, mid[2] + 0.12 * P * st.load, WK_EARTH, H.yaw);
    }
    if (st.drop > 0 && st.drop < 1) {
      // what falls out of it, as it is tipped
      var fall = st.drop, from = B;
      for (var i = 0; i < 6; i++) {
        var q = (fall + i / 6) % 1, h = from[2] - q * 2.2 * P;
        cnBox(faces, from[0] + Math.sin(i * 2.1) * 0.3 * P, from[1] + Math.cos(i * 1.7) * 0.3 * P, 0.18 * P, 0.18 * P, h - 0.18 * P, h, WK_EARTH, i);
      }
    }
  };
  var WK_EARTH = { piece: true, color: "#7d6849", edge: "#5d4c34", bare: true, pat: 30 };
  // where the bucket's teeth are (world), for the earth it digs and drops
  function wkBucketTip(st, plan) {
    var P = plan.site.P, H = wkFrame(st, st.swing || 0), arm = wkDiggerArm(st.reach, st.lift);
    return H.at((WK_FOOT[0] + arm.pin[0]) * P, WK_FOOT[1] * P, (st.z || 0) + (WK_FOOT[2] + arm.pin[1]) * P);
  }

  // ---- the dump lorry: a cab, its bed tipping back --------------------------------------------------
  function wkDumper(tilt, fill, paint) {
    var ts = Math.round(wkClamp(tilt) * 10), fs = Math.round(wkClamp(fill) * 4);
    return moModel("wk-dump|" + ts + "|" + fs + "|" + paint, function (M, m) {
      var dark = M.mat("metal", WK_DARKM), bed = M.mat("lacquer", paint), steel = M.mat("metal", "#7d838a");
      M.box(-3.8 * m, 2.9 * m, -0.5 * m, 0.5 * m, 0.72 * m, 1.02 * m, dark);
      moCab(M, 2.35 * m, 4.2 * m, 1.22 * m, 1.0 * m, 3.0 * m, "#e05a2a", m, { beacon: true });
      M.box(2.3 * m, 4.15 * m, -1.25 * m, 1.25 * m, 0.92 * m, 1.12 * m, M.mat("metal", "#3a3d40"), 0.05 * m);
      [[3.4, 0], [-1.6, 1], [-2.9, 1]].forEach(function (a) { moAxle(M, a[0] * m, 1.25 * m, 0.52 * m, !!a[1], m); });
      // the bed: tipped about its back edge
      M.push().move(-3.95 * m, 0, 1.2 * m).tiltY(-ts * 5);
      M.box(0, 5.9 * m, -1.25 * m, 1.25 * m, 0, 0.12 * m, bed);
      [-1, 1].forEach(function (s) { M.box(0, 5.9 * m, s * 1.25 * m - (s > 0 ? 0.08 * m : 0), s * 1.25 * m + (s > 0 ? 0 : 0.08 * m), 0, 1.25 * m, bed, 0.03 * m); });
      M.box(5.8 * m, 6.25 * m, -1.25 * m, 1.25 * m, 0, 1.6 * m, bed, 0.04 * m);                    // the front, up over the cab's back
      M.box(-0.06 * m, 0.04 * m, -1.2 * m, 1.2 * m, 0.1 * m, 1.2 * m, steel, 0.02 * m);             // the tailgate
      for (var r = 0; r < 4; r++) { M.box(r * 1.5 * m + 0.6 * m, r * 1.5 * m + 0.7 * m, -1.3 * m, 1.3 * m, 0.1 * m, 1.25 * m, steel); }
      if (fs) {
        var hgt = fs / 4 * 1.1 * m;
        M.box(0.15 * m, 5.7 * m, -1.12 * m, 1.12 * m, 0.12 * m, 0.12 * m + hgt * 0.7, M.mat("soil", "#7d6849"), 0.05 * m);
        M.ball(2.9 * m, 0, 0.12 * m + hgt * 0.7, 2.6 * m, 1.05 * m, hgt * 0.5, M.mat("soil", "#7d6849"), { seg: 5, lat0: 0 });
      }
      M.pop();
    });
  }
  WK_DRAW.dumper = function (faces, st, m, T, plan) {
    var F = wkFrame(st);
    wkPutM(faces, wkDumper(st.tilt || 0, st.fill || 0, m.opt.paint || "#c9ced3"), F, 0, st.moving || st.tilt > 0);
    if (st.tilt > 0.6 && st.fill > 0.05) {
      // the earth sliding out of its back
      var P = plan.site.P, back = F.at(-4.3 * P, 0, 0);
      for (var i = 0; i < 5; i++) { cnBox(faces, back[0] + Math.sin(i * 2.3) * 0.5 * P, back[1] + Math.cos(i * 1.9) * 0.5 * P, 0.25 * P, 0.25 * P, 0, (0.3 + i * 0.12) * P, WK_EARTH, i); }
    }
  };

  // ---- the low loader, with the excavator on it -------------------------------------------------------
  function wkLowboy() {
    return moModel("wk-lowboy", function (M, m) {
      var dark = M.mat("metal", WK_DARKM), deck = M.mat("wood", "#6e5a42"), red = M.mat("lacquer", "#b83a2c");
      M.box(-1.0 * m, 1.0 * m, -1.2 * m, 1.2 * m, 1.05 * m, 1.35 * m, red, 0.05 * m);                  // the gooseneck over the fifth wheel
      M.box(-3.0 * m, -1.0 * m, -0.5 * m, 0.5 * m, 0.9 * m, 1.3 * m, red, 0.05 * m);
      M.box(-11.0 * m, -3.0 * m, -1.3 * m, 1.3 * m, 0.55 * m, 0.95 * m, red, 0.04 * m);              // the low deck
      M.box(-11.0 * m, -3.0 * m, -1.25 * m, 1.25 * m, 0.95 * m, 1.0 * m, deck);
      M.box(-12.6 * m, -11.0 * m, -1.3 * m, 1.3 * m, 0.95 * m, 1.3 * m, dark, 0.04 * m);
      [-12.0, -12.9].forEach(function (x) { moAxle(M, x * m, 1.3 * m, 0.42 * m, true, m); });
      M.box(-13.0 * m, -12.8 * m, -1.1 * m, 1.1 * m, 0.4 * m, 0.55 * m, dark);
    });
  }
  // st: x, y, ang (the tractor's), carrying (the excavator on it), moving
  WK_DRAW.lowboy = function (faces, st, m, T, plan) {
    var P = plan.site.P, F = wkFrame(st);
    wkPutM(faces, moTractor("#b83a2c"), F, 0, st.moving);
    var Tr = wkFrame(st);
    var kp = Tr.at(MO_FIFTH * P, 0, 0);
    moPut(faces, wkLowboy(), kp[0], kp[1], Tr.yaw, 0.02 * P, st.moving);
    if (st.carrying) {
      var on = Tr.at((MO_FIFTH - 7.0) * P, 0, 0);
      var S = plan.site.S, l = S.L(on[0], on[1]);
      WK_DRAW.excavator(faces, { x: l[0], y: l[1], ang: st.ang, site: st.site, swing: Math.PI, reach: 3.2, lift: -0.4, curl: 0.9, z: 0, onTrailer: true, moving: st.moving }, m, T, plan);
    }
  };

  // ---- the telehandler: four big wheels, its cab at the left, a boom out the front ---------------------
  function wkTeleBody() {
    return moModel("wk-tele", function (M, m) {
      var yel = M.mat("lacquer", WK_YELLOW), dark = M.mat("metal", WK_DARKM), glass = M.mat("glass", "#1b2632");
      M.box(-2.3 * m, 2.1 * m, -0.6 * m, 0.6 * m, 0.55 * m, 1.35 * m, yel, 0.1 * m);
      M.box(-2.4 * m, -1.2 * m, -1.1 * m, -0.45 * m, 0.6 * m, 1.6 * m, yel, 0.08 * m);                 // the engine
      M.box(-0.8 * m, 1.0 * m, 0.45 * m, 1.15 * m, 0.6 * m, 2.45 * m, yel, 0.08 * m);                  // the cab
      M.box(-0.7 * m, 0.95 * m, 0.42 * m, 1.18 * m, 1.3 * m, 2.35 * m, glass, 0.04 * m);
      M.box(-2.5 * m, -2.3 * m, -1.0 * m, 1.0 * m, 0.4 * m, 1.1 * m, M.mat("metal", "#4a4d52"), 0.05 * m);
      [[-1.5, -1], [-1.5, 1], [1.4, -1], [1.4, 1]].forEach(function (w) {
        M.push().move(w[0] * m, w[1] * 1.0 * m, 0.62 * m).tiltX(90);
        M.cyl(0, 0, -0.25 * m, 0.25 * m, 0.62 * m, M.mat("rubber", "#1b1b1d"), { seg: 18, bottom: true });
        M.cyl(0, 0, 0.25 * m, 0.27 * m, 0.33 * m, M.mat("metal", "#c9a020"), { seg: 12 });
        M.cyl(0, 0, -0.27 * m, -0.25 * m, 0.33 * m, M.mat("metal", "#c9a020"), { seg: 12, bottom: true });
        M.pop();
      });
      M.box(-2.0 * m, -1.6 * m, -0.3 * m, 0.3 * m, 1.35 * m, 1.7 * m, dark, 0.05 * m);                 // the boom's pivot
    });
  }
  // st: boom (rad, up from level), ext (m, out), forks (0 level), load (what is on the forks)
  WK_DRAW.telehandler = function (faces, st, m, T, plan) {
    var P = plan.site.P, F = wkFrame(st);
    wkPutM(faces, wkTeleBody(), F, 0, st.moving);
    var tip = wkTeleTip(st, plan), foot = F.at(-1.8 * P, -0.05 * P, 1.55 * P);
    cnBeam(faces, foot, tip, 0.42 * P, wkHow(WK_YELLOW), 0.5 * P);
    // the forks: two tines, level
    var c = F.c, s = F.s, steel = wkHow("#3a3d40", 22);
    [-0.4, 0.4].forEach(function (u) {
      var a = [tip[0] - s * u * P, tip[1] + c * u * P, tip[2] - 0.3 * P], b = [a[0] + c * 1.1 * P, a[1] + s * 1.1 * P, a[2]];
      cnBeam(faces, [a[0], a[1], tip[2] + 0.4 * P], a, 0.08 * P, steel);
      cnBeam(faces, a, b, 0.12 * P, steel, 0.05 * P);
    });
    if (st.load) { wkLoadDraw(faces, st.load, [tip[0] + c * 0.6 * P, tip[1] + s * 0.6 * P, tip[2] - 0.27 * P], F.yaw, P); }
  };
  function wkTeleTip(st, plan) {
    var P = plan.site.P, F = wkFrame(st), L = 4.0 + (st.ext || 0), a = st.boom || 0.05;
    return F.at((-1.8 + Math.cos(a) * L) * P, -0.05 * P, (1.55 + Math.sin(a) * L) * P);
  }
  // a load: a bundle of studs, a stack of sheets, a pallet of blocks, a window crate ...
  function wkLoadDraw(faces, load, at, yaw, P) {
    var c = Math.cos(yaw), s = Math.sin(yaw);
    cnBox(faces, at[0], at[1], 0.6 * P, 0.55 * P, at[2], at[2] + 0.12 * P, WK_TIMBER, yaw);           // the pallet / bearers
    var h = (load.h || 0.6) * P, how = load.how || WK_TIMBER;
    cnBox(faces, at[0], at[1], (load.l || 1.2) / 2 * P, (load.w || 1.0) / 2 * P, at[2] + 0.12 * P, at[2] + 0.12 * P + h, how, yaw);
    void c; void s;
  }

  // ---- the mobile crane: a four-axle carrier, legs out, a turning house, a telescopic boom ----------------
  function wkCraneCarrier() {
    return moModel("wk-crane", function (M, m) {
      var yel = M.mat("lacquer", WK_YELLOW), dark = M.mat("metal", WK_DARKM);
      M.box(-5.6 * m, 4.8 * m, -1.25 * m, 1.25 * m, 0.95 * m, 1.6 * m, yel, 0.08 * m);
      moCab(M, 4.6 * m, 6.3 * m, 1.24 * m, 0.95 * m, 2.9 * m, WK_YELLOW, m, { beacon: true });
      [5.4, 3.9, -2.8, -4.3].forEach(function (x) { moAxle(M, x * m, 1.25 * m, 0.6 * m, false, m); });
      [-1, 1].forEach(function (s) { M.box(-5.5 * m, 4.6 * m, s * 1.27 * m - 0.03 * m, s * 1.27 * m + 0.03 * m, 1.2 * m, 1.35 * m, dark); });
      [-4.6, 3.6].forEach(function (x) { M.box(x * m - 0.3 * m, x * m + 0.3 * m, -1.3 * m, 1.3 * m, 0.8 * m, 1.2 * m, dark, 0.04 * m); });   // the outrigger boxes
    });
  }
  function wkCraneHouse() {
    return moModel("wk-crane-house", function (M, m) {
      var yel = M.mat("lacquer", WK_YELLOW), dark = M.mat("metal", WK_DARKM), glass = M.mat("glass", "#1b2632"), grey = M.mat("metal", "#5a5e63");
      M.cyl(0, 0, 1.6 * m, 1.85 * m, 1.1 * m, dark, { seg: 18 });
      M.box(-3.0 * m, 1.2 * m, -1.15 * m, 1.15 * m, 1.85 * m, 2.9 * m, yel, 0.1 * m);
      M.box(-3.4 * m, -2.4 * m, -1.2 * m, 1.2 * m, 1.85 * m, 3.1 * m, grey, 0.12 * m);                 // the counterweight
      M.box(0.2 * m, 1.9 * m, 0.55 * m, 1.35 * m, 1.85 * m, 3.4 * m, yel, 0.08 * m);                   // the operator's cab
      M.box(0.25 * m, 1.95 * m, 0.52 * m, 1.38 * m, 2.5 * m, 3.3 * m, glass, 0.04 * m);
      M.box(0.4 * m, 1.6 * m, -0.6 * m, 0.4 * m, 2.6 * m, 3.4 * m, dark, 0.05 * m);                    // the boom's foot
    });
  }
  // st: legs (0 in .. 1 out and down), swing, luff (rad), len (m), hook (m below the tip), load
  WK_DRAW.crane = function (faces, st, m, T, plan) {
    var P = plan.site.P, F = wkFrame(st), legs = st.legs || 0, dark = wkHow(WK_DARKM, 22), yel = wkHow(WK_YELLOW);
    wkPutM(faces, wkCraneCarrier(), F, 0, st.moving);
    // the outriggers: out sideways, their feet down on pads
    if (legs > 0) {
      [-4.6, 3.6].forEach(function (x) {
        [-1, 1].forEach(function (sd) {
          var out = 1.3 + 2.0 * Math.min(1, legs * 1.6), down = Math.max(0, legs - 0.6) / 0.4;
          var a = F.at(x * P, sd * 1.3 * P, 1.0 * P), b = F.at(x * P, sd * out * P, 1.0 * P);
          cnBeam(faces, a, b, 0.3 * P, yel, 0.3 * P);
          cnBeam(faces, b, [b[0], b[1], (1.0 - 0.85 * down) * P], 0.22 * P, dark);
          if (down > 0.2) { cnBox(faces, b[0], b[1], 0.45 * P, 0.45 * P, 0, 0.08 * P, wkHow("#3a3d40", 22), F.yaw); }
        });
      });
    }
    var H = wkFrame(st, st.swing || 0), mid = F.at(-0.6 * P, 0, 0);
    moPut(faces, wkCraneHouse(), mid[0], mid[1], H.yaw, 0, st.moving || st.working);
    var tips = wkCraneTip(st, plan), foot = tips.foot, tip = tips.tip;
    // the boom: nested sections, thinner out to the tip
    var n = 4, seg = [foot];
    for (var i = 1; i <= n; i++) { seg.push(wkLerp(foot, tip, i / n)); }
    for (var j = 0; j < n; j++) { cnBeam(faces, seg[j], seg[j + 1], (0.62 - j * 0.1) * P, yel, (0.75 - j * 0.12) * P); }
    cnBeam(faces, H.at(0.4 * P, 0, 1.9 * P), wkLerp(foot, tip, 0.35), 0.16 * P, wkHow("#c9cdd2", 23));     // its ram
    // the rope and the hook block, and what hangs from it
    var hook = tips.hook;
    cnBeam(faces, tip, [hook[0], hook[1], hook[2] + 0.4 * P], 0.025 * P, dark);
    cnBox(faces, hook[0], hook[1], 0.2 * P, 0.15 * P, hook[2], hook[2] + 0.5 * P, wkHow("#d33a2c"), H.yaw);
    if (st.load && st.load.draw) { st.load.draw(faces, hook, T); }
  };
  function wkCraneTip(st, plan) {
    var P = plan.site.P, F = wkFrame(st), H = wkFrame(st, st.swing || 0);
    var base = F.at(-0.6 * P, 0, 0), c = H.c, s = H.s, luff = st.luff === undefined ? 0.15 : st.luff, len = st.len || 10;
    var foot = [base[0] + c * 1.0 * P, base[1] + s * 1.0 * P, 3.0 * P];
    var tip = [foot[0] + c * Math.cos(luff) * len * P, foot[1] + s * Math.cos(luff) * len * P, foot[2] + Math.sin(luff) * len * P];
    var hook = [tip[0], tip[1], tip[2] - (st.hook === undefined ? 3 : st.hook) * P];
    return { foot: foot, tip: tip, hook: hook };
  }
  // the crane's pose for its hook to be over a point (world) at a height: swing, luff, length
  function wkCraneAim(st, plan, target, hookZ) {
    var P = plan.site.P, F = wkFrame(st), base = F.at(-0.6 * P, 0, 0), dx = target[0] - base[0], dy = target[1] - base[1];
    var swing = Math.atan2(dy, dx) - F.yaw, r = Math.hypot(dx, dy) / P - 1.0;
    var len = Math.max(9, Math.min(32, Math.hypot(r, (hookZ / P) + 6 - 3.0) + 1)), luff = Math.acos(Math.max(-1, Math.min(1, r / len)));
    var tipZ = 3.0 + Math.sin(luff) * len;
    return { swing: swing, luff: luff, len: len, hook: tipZ - hookZ / P };
  }

  // ---- the mixer (40-movein.js's), its chute out to where it pours ------------------------------------
  // st: turn (the drum), pour (0..1), chute (rad, round from straight back)
  WK_DRAW.mixer = function (faces, st, m, T, plan) {
    var P = plan.site.P, F = wkFrame(st), made = moMixer(st.turn || 0, m.opt.paint || "#f2f2ee");
    wkPutM(faces, made.body, F, 0, st.moving);
    moPut(faces, made.drum, F.x, F.y, F.yaw, 0, true);
    // the chute: from under the drum's mouth, swung out
    var mouth = F.at(-4.0 * P, 0, 2.2 * P), a = F.yaw + Math.PI + (st.chute || 0), len = 3.2 * P;
    var end = [mouth[0] + Math.cos(a) * len, mouth[1] + Math.sin(a) * len, 1.0 * P];
    cnBeam(faces, mouth, end, 0.35 * P, wkHow("#9aa0a6", 22), 0.12 * P);
    if (st.pour > 0) {
      // concrete running down it and out
      var gray = { piece: true, color: "#9c9a94", edge: "#7c7a75", bare: true, pat: 10 };
      cnBeam(faces, [mouth[0], mouth[1], mouth[2] + 0.08 * P], [end[0], end[1], end[2] + 0.08 * P], 0.22 * P, gray, 0.06 * P);
      cnBeam(faces, end, [end[0], end[1], (st.pourZ || 0) + 0.05 * P], 0.16 * P, gray);
    }
  };
  // ---- a flatbed (or a box trailer) behind a tractor, as delivered -----------------------------------
  // st: load (0..1 left), cargo ("lumber" | "truss" | "steel" | ...), box (a box trailer), open (its back open)
  WK_DRAW.semi = function (faces, st, m, T, plan) {
    var P = plan.site.P, F = wkFrame(st), kp = F.at(MO_FIFTH * P, 0, 0);
    wkPutM(faces, moTractor(m.opt.paint || "#2f5d8a"), F, 0, st.moving);
    var tr = st.box ? moTrailer(st.open ? "open" : "box", 1, m.opt.stripe || "#2f5d8a", "") : moTrailer("flat", st.load === undefined ? 1 : st.load, m.opt.stripe || "#3b4350", m.opt.cargo || "");
    moPut(faces, tr, kp[0], kp[1], F.yaw, 0.02 * P, st.moving);
    if (st.ramp > 0) {
      var back = F.at((MO_FIFTH - 14.7) * P, 0, 0), out = F.at((MO_FIFTH - 14.7 - 2.7 * st.ramp) * P, 0, 0), alu = { piece: true, color: "#b9bdc2", edge: "#7d8186", pat: 23 };
      cnBeam(faces, [back[0], back[1], 1.25 * P], [out[0], out[1], 1.25 * P * (1 - st.ramp) + 0.04 * P], 1.1 * P, alu, 0.05 * P);
    }
  };
  // ---- a pickup, the crew's ---------------------------------------------------------------------------
  function wkPickup(paint) {
    return moModel("wk-pickup|" + paint, function (M, m) {
      var body = M.mat("lacquer", paint), dark = M.mat("metal", WK_DARKM);
      M.box(-2.8 * m, 2.6 * m, -0.92 * m, 0.92 * m, 0.45 * m, 1.0 * m, body, 0.12 * m);
      moCab(M, -0.6 * m, 1.6 * m, 0.94 * m, 0.95 * m, 1.85 * m, paint, m, {});
      M.box(1.6 * m, 2.7 * m, -0.92 * m, 0.92 * m, 0.95 * m, 1.15 * m, body, 0.1 * m);                // the bonnet
      M.box(-2.8 * m, -0.7 * m, -0.92 * m, -0.84 * m, 1.0 * m, 1.45 * m, body);                         // the bed's sides
      M.box(-2.8 * m, -0.7 * m, 0.84 * m, 0.92 * m, 1.0 * m, 1.45 * m, body);
      M.box(-2.88 * m, -2.8 * m, -0.92 * m, 0.92 * m, 1.0 * m, 1.42 * m, body);
      M.box(-2.0 * m, -1.0 * m, -0.6 * m, 0.4 * m, 1.0 * m, 1.3 * m, M.mat("plastic", "#2b2d31"), 0.05 * m);   // a toolbox
      [[1.8, 0], [-1.9, 0]].forEach(function (a) { moAxle(M, a[0] * m, 0.92 * m, 0.38 * m, false, m); });
      M.box(2.6 * m, 2.75 * m, -0.9 * m, 0.9 * m, 0.4 * m, 0.7 * m, dark, 0.04 * m);
    });
  }
  WK_DRAW.pickup = function (faces, st, m) { wkPutM(faces, wkPickup(m.opt.paint || "#d9dcdf"), wkFrame(st), 0, st.moving); };
  // ---- the skip, and the portable toilet: set down on the lot --------------------------------------------
  function wkSkip() {
    return moModel("wk-skip", function (M, m) {
      var g = M.mat("lacquer", "#3f7a4a");
      M.box(-1.9 * m, 1.9 * m, -0.95 * m, 0.95 * m, 0, 0.18 * m, g);
      [-1, 1].forEach(function (s) { M.box(-1.9 * m, 1.9 * m, s * 0.95 * m - (s > 0 ? 0.08 * m : 0), s * 0.95 * m + (s > 0 ? 0 : 0.08 * m), 0, 1.3 * m, g, 0.02 * m); });
      M.box(-1.9 * m, -1.82 * m, -0.95 * m, 0.95 * m, 0, 1.3 * m, g); M.box(1.82 * m, 1.9 * m, -0.95 * m, 0.95 * m, 0, 1.3 * m, g);
      M.box(-1.5 * m, 1.4 * m, -0.8 * m, 0.8 * m, 0.18 * m, 0.7 * m, M.mat("wood", "#9c7a50"), 0.1 * m);   // what is thrown in it
    });
  }
  function wkLoo() {
    return moModel("wk-loo", function (M, m) {
      var b = M.mat("plastic", "#2f6fb0"), w = M.mat("plastic", "#e8e8e4");
      M.box(-0.6 * m, 0.6 * m, -0.6 * m, 0.6 * m, 0, 2.2 * m, b, 0.06 * m);
      M.box(-0.65 * m, 0.65 * m, -0.65 * m, 0.65 * m, 2.2 * m, 2.35 * m, w, 0.06 * m);
      M.box(0.6 * m, 0.63 * m, -0.4 * m, 0.4 * m, 0.1 * m, 2.0 * m, M.mat("plastic", "#265d96"));
    });
  }
  WK_DRAW.skip = function (faces, st, m) { wkPutM(faces, wkSkip(), wkFrame(st), 0, false); };
  WK_DRAW.loo = function (faces, st, m) { wkPutM(faces, wkLoo(), wkFrame(st), 0, false); };

  // ---- the concrete pump: a four-axle lorry, legs out, its boom folded over it or unfolded out
  // over the pour, the hose hanging from its tip; its hopper behind, where the mixers tip in
  function wkPumpCarrier() {
    return moModel("wk-pump", function (M, m) {
      var white = M.mat("lacquer", "#e8e8e4"), red = M.mat("lacquer", "#c8322a"), dark = M.mat("metal", WK_DARKM), steel = M.mat("metal", "#8f959b");
      M.box(-5.4 * m, 4.6 * m, -1.25 * m, 1.25 * m, 0.95 * m, 1.55 * m, white, 0.08 * m);
      moCab(M, 4.4 * m, 6.1 * m, 1.24 * m, 0.95 * m, 2.9 * m, "#e8e8e4", m, { beacon: true });
      [5.2, 3.8, -2.6, -4.0].forEach(function (x) { moAxle(M, x * m, 1.25 * m, 0.55 * m, false, m); });
      M.cyl(2.6 * m, 0, 1.55 * m, 2.6 * m, 0.75 * m, red, { seg: 16 });                                   // the turret
      M.box(-5.6 * m, -4.4 * m, -0.9 * m, 0.9 * m, 0.8 * m, 1.9 * m, steel, 0.08 * m);                    // the hopper
      M.box(-5.7 * m, -4.3 * m, -1.0 * m, 1.0 * m, 1.85 * m, 2.0 * m, dark, 0.04 * m);
      M.box(-4.2 * m, 2.0 * m, -0.5 * m, 0.5 * m, 1.55 * m, 2.1 * m, steel, 0.06 * m);                     // the pipes along it
      [-4.0, 3.4].forEach(function (x) { M.box(x * m - 0.3 * m, x * m + 0.3 * m, -1.3 * m, 1.3 * m, 0.8 * m, 1.2 * m, dark, 0.04 * m); });
    });
  }
  // st: legs, fold (1 stowed .. 0 out), tip (world point the hose hangs from), pour, pourZ
  WK_DRAW.pump = function (faces, st, m, T, plan) {
    var P = plan.site.P, F = wkFrame(st), legs = st.legs || 0, red = wkHow("#c8322a"), dark = wkHow(WK_DARKM, 22);
    wkPutM(faces, wkPumpCarrier(), F, 0, st.moving);
    if (legs > 0) {
      [[-4.0, 1], [3.4, 1], [-4.0, -1], [3.4, -1]].forEach(function (q) {
        var out = 1.3 + 2.2 * Math.min(1, legs * 1.6), down = Math.max(0, legs - 0.6) / 0.4, x = q[0], sd = q[1];
        var a = F.at(x * P, sd * 1.3 * P, 1.0 * P), b = F.at((x + (x < 0 ? -1.0 : 1.0) * Math.min(1, legs * 1.6)) * P, sd * out * P, 1.0 * P);
        cnBeam(faces, a, b, 0.28 * P, red, 0.28 * P);
        cnBeam(faces, b, [b[0], b[1], (1.0 - 0.85 * down) * P], 0.2 * P, dark);
        if (down > 0.2) { cnBox(faces, b[0], b[1], 0.42 * P, 0.42 * P, 0, 0.08 * P, dark, F.yaw); }
      });
    }
    // the boom: three arms from the turret, worked out to put its tip over the pour
    var base = F.at(2.6 * P, 0, 2.9 * P), fold = st.fold === undefined ? 1 : st.fold, tip = st.tip || F.at(-3 * P, 0, 4 * P);
    var az = Math.atan2(tip[1] - base[1], tip[0] - base[0]), L1 = 10 * P, L2 = 9.5 * P, L3 = 9 * P;
    var e1 = 0.95, j1 = [base[0] + Math.cos(az) * Math.cos(e1) * L1, base[1] + Math.sin(az) * Math.cos(e1) * L1, base[2] + Math.sin(e1) * L1];
    var aim = [tip[0], tip[1], tip[2] + 0.6 * P], rx = Math.hypot(aim[0] - j1[0], aim[1] - j1[1]), rz = aim[2] - j1[2];
    var d = Math.max(0.5 * P, Math.min(L2 + L3 - 0.05 * P, Math.hypot(rx, rz))), cb = (L2 * L2 + d * d - L3 * L3) / (2 * L2 * d);
    var a2 = Math.atan2(rz, rx) + Math.acos(Math.max(-1, Math.min(1, cb)));
    var j2 = [j1[0] + Math.cos(az) * Math.cos(a2) * L2, j1[1] + Math.sin(az) * Math.cos(a2) * L2, j1[2] + Math.sin(a2) * L2];
    var sc = d / Math.max(1e-6, Math.hypot(rx, rz)), j3 = [j1[0] + (aim[0] - j1[0]) * sc, j1[1] + (aim[1] - j1[1]) * sc, j1[2] + (aim[2] - j1[2]) * sc];
    // stowed: folded back along the lorry's top
    var s1 = F.at(-4.2 * P, 0.4 * P, 3.0 * P), s2 = F.at(2.0 * P, -0.3 * P, 3.4 * P), s3 = F.at(-3.8 * P, -0.3 * P, 3.8 * P);
    var J1 = wkLerp(j1, s1, fold), J2 = wkLerp(j2, s2, fold), J3 = wkLerp(j3, s3, fold);
    cnBeam(faces, base, J1, 0.5 * P, red, 0.62 * P);
    cnBeam(faces, J1, J2, 0.42 * P, red, 0.52 * P);
    cnBeam(faces, J2, J3, 0.34 * P, red, 0.42 * P);
    cnBeam(faces, base, J3, 0.0001, dark);
    if (fold < 0.2) {
      var hoseEnd = [J3[0], J3[1], Math.max((st.pourZ || 0) + 0.4 * P, J3[2] - 3 * P)];
      cnBeam(faces, J3, hoseEnd, 0.14 * P, dark);
      if (st.pour > 0) {
        var gray = { piece: true, color: "#9c9a94", edge: "#7c7a75", bare: true, pat: 10 };
        cnBeam(faces, hoseEnd, [hoseEnd[0], hoseEnd[1], (st.pourZ || 0) + 0.02 * P], 0.12 * P, gray);
      }
    }
  };

  // ---- the tower crane: its mast (as tall as it has been climbed), the jib round on it, the
  // trolley out along the jib, the hook below it -- and what hangs from the hook
  // st: h (m, the jib's height), swing (rad, world), r (m, trolley out), hook (m, hook's height), load, jib (m)
  WK_DRAW.towercrane = function (faces, st, m, T, plan) {
    var P = plan.site.P, S = plan.site.S, w = S.W(st.x, st.y), x = w[0], y = w[1], h = (st.h || 20) * P, mast = 1.6 * P, yel = wkHow(WK_YELLOW), dark = wkHow(WK_DARKM, 22);
    // the base: a cross of concrete blocks
    cnBox(faces, x, y, 2.4 * P, 2.4 * P, 0, 0.6 * P, wkHow("#a7a49c", 10), S.a);
    for (var k = 0; k < 4; k++) {
      var sx = k % 2 ? 1 : -1, sy = k < 2 ? 1 : -1;
      cnBox(faces, x + sx * mast / 2, y + sy * mast / 2, 0.07 * P, 0.07 * P, 0.6 * P, h, yel);
    }
    for (var z = 1.8 * P; z < h - 0.5 * P; z += 1.8 * P) {
      cnBeam(faces, [x - mast / 2, y - mast / 2, z], [x + mast / 2, y - mast / 2, z + 1.8 * P], 0.05 * P, yel);
      cnBeam(faces, [x + mast / 2, y + mast / 2, z], [x - mast / 2, y + mast / 2, z + 1.8 * P], 0.05 * P, yel);
      cnBeam(faces, [x - mast / 2, y + mast / 2, z], [x - mast / 2, y - mast / 2, z + 1.8 * P], 0.05 * P, yel);
      cnBeam(faces, [x + mast / 2, y - mast / 2, z], [x + mast / 2, y + mast / 2, z + 1.8 * P], 0.05 * P, yel);
    }
    var a = st.swing || 0, ux = Math.cos(a), uy = Math.sin(a), jib = (st.jib || 40) * P, tail = 12 * P;
    // the slewing unit, the cab, the A-frame, the jib and its counter-jib, the ties
    cnBox(faces, x, y, 1.2 * P, 1.2 * P, h, h + 1.0 * P, yel, a);
    cnBox(faces, x + ux * 1.0 * P - uy * 1.3 * P, y + uy * 1.0 * P + ux * 1.3 * P, 0.8 * P, 0.7 * P, h - 0.2 * P, h + 1.6 * P, wkHow("#e9ecee"), a);
    var top = [x, y, h + 6 * P];
    cnBeam(faces, [x, y, h + 1 * P], top, 0.5 * P, yel);
    cnBeam(faces, [x - ux * tail, y - uy * tail, h + 1.2 * P], [x + ux * jib, y + uy * jib, h + 1.2 * P], 1.1 * P, yel, 1.2 * P);
    cnBeam(faces, top, [x + ux * jib * 0.65, y + uy * jib * 0.65, h + 1.8 * P], 0.06 * P, dark);
    cnBeam(faces, top, [x - ux * tail * 0.9, y - uy * tail * 0.9, h + 1.8 * P], 0.06 * P, dark);
    cnBox(faces, x - ux * tail * 0.85, y - uy * tail * 0.85, 1.6 * P, 1.6 * P, h - 1.2 * P, h + 0.6 * P, wkHow("#a7a49c", 10), a);
    // the trolley, the ropes, the hook block
    var r = Math.max(4, Math.min(st.jib || 40, st.r || 10)) * P, tx = x + ux * r, ty = y + uy * r, hz = (st.hook === undefined ? 10 : st.hook) * P;
    cnBox(faces, tx, ty, 0.7 * P, 0.6 * P, h + 0.3 * P, h + 0.6 * P, dark, a);
    cnBeam(faces, [tx - uy * 0.15 * P, ty + ux * 0.15 * P, h + 0.3 * P], [tx - uy * 0.15 * P, ty + ux * 0.15 * P, hz + 0.6 * P], 0.025 * P, dark);
    cnBeam(faces, [tx + uy * 0.15 * P, ty - ux * 0.15 * P, h + 0.3 * P], [tx + uy * 0.15 * P, ty - ux * 0.15 * P, hz + 0.6 * P], 0.025 * P, dark);
    cnBox(faces, tx, ty, 0.35 * P, 0.25 * P, hz, hz + 0.6 * P, wkHow("#d33a2c"), a);
    if (st.load && st.load.draw) { st.load.draw(faces, [tx, ty, hz], T); }
  };
  // where a tower crane is set to put its hook over a point (world) at a height
  function wkTowerAim(st, plan, target, hookZ) {
    var P = plan.site.P, S = plan.site.S, w = S.W(st.x, st.y);
    return { swing: Math.atan2(target[1] - w[1], target[0] - w[0]), r: Math.hypot(target[0] - w[0], target[1] - w[1]) / P, hook: hookZ / P };
  }
