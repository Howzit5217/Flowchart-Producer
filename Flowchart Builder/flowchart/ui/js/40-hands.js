// ---------------------------------------------------------------------------
//  40-hands.js -- your own hands, walking round in 3D: reaching out to what
//  is used and doing it -- a finger flicking the switch, a hand lifting the
//  tap's lever and turning a knob, taking hold of a handle and pulling,
//  pushing a door, carrying a plug to the socket -- the thing happening as
//  the hand gets there, not before; and plugs that mean something: picked
//  up off what they belong to and put into a socket, what is plugged in
//  drawing its watts from the room's circuit, too much at once and the
//  breaker trips
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-04: "there are somethings that should definitely be
  // able to do more than that like the plugging things in ... and to also
  // make it so the interactions make sense and my hand when I say to turn
  // something on my hands and arms do the motions of doing that task rather
  // than it just happening")
  var HN = { anim: null, hold: null };
  var HN_MS = 820, HN_TOUCH = 0.42;                      // the whole motion (ms), and when the hand gets there
  var HN_SKIN = "#d6a27a", HN_SLEEVE = "#3d5a80", HN_CUFF = "#2c4260", HN_PLUG = "#f1f0ec";
  // what each draws, plugged in and on (W)
  var HN_WATTS = { i_lamp: 60, i_tablelamp: 40, i_desklamp: 12, i_arclamp: 60, i_tv: 120, i_monitor: 30, i_pc: 300, i_computer: 250, i_laptop: 65,
                   i_console: 150, i_speaker: 30, i_recordplayer: 20, i_fan: 50, i_heater: 1500, i_kettle: 1500, i_coffeemaker: 900, i_toaster: 1100,
                   i_microwave: 1100, i_fridge: 150, i_freezer: 150, i_winecooler: 90, i_printer: 30, i_router: 10, i_aquarium: 50, i_projector: 250,
                   i_treadmill: 1000, i_washer: 500, i_dryer: 2400, i_dishwasher: 1200, i_tablet: 10, i_phone: 10, i_soundbar: 40 };
  var HN_TWENTY = { kitchen: 1, laundry: 1, bath: 1, ensuite: 1, garage: 1, utility: 1 };
  function hnOn() { return !!(V3 && V3.mode === "walk" && V3.me && V3.eye && V3.gl && !(typeof STILL !== "undefined" && STILL)); }

  // ---- where it all is, from the eye ---------------------------------------------------------------
  function hnBasis() {
    var m = V3.me, e = V3.eye, ch = Math.cos(m.head), sh = Math.sin(m.head), cp = Math.cos(m.pitch), sp = Math.sin(m.pitch);
    return { e: [e.x, e.y, e.z], r: [-sh, ch, 0], u: [-sp * ch, -sp * sh, cp], f: [cp * ch, cp * sh, sp] };
  }
  function hnV(a, b, k) { return [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]; }
  function hnSub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function hnLen(a) { return Math.hypot(a[0], a[1], a[2]); }
  function hnNorm(a) { var l = hnLen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function hnCross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function hnDot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function hnMix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  function hnEase(k) { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }
  // a point in the eye's own numbers (metres: right, up, ahead) in the house's
  function hnAt(B, x, y, z) { var P = FLOOR_PX; return [B.e[0] + (B.r[0] * x + B.u[0] * y + B.f[0] * z) * P, B.e[1] + (B.r[1] * x + B.u[1] * y + B.f[1] * z) * P, B.e[2] + (B.r[2] * x + B.u[2] * y + B.f[2] * z) * P]; }

  // The right shoulder: from the body, not the head -- looking down does not take it back; bent
  // down toward what is low (HN.dip, as the motion goes)
  function hnShoulder(B) {
    var P = FLOOR_PX, fx = Math.cos(V3.me.head), fy = Math.sin(V3.me.head);
    return [B.e[0] + (-fy * 0.19 - fx * 0.04) * P, B.e[1] + (fx * 0.19 - fy * 0.04) * P, B.e[2] - 0.27 * P - (HN.dip || 0)];
  }

  // ---- what the hand does, for what it is used on -----------------------------------------------------
  // Where it touches: the tap, not the basin; a knob, not the hob; a door at its handle.
  // The controls as 38-models.js makes them, in a piece's own numbers: x across, y from its back (-D/2)
  // to its front, z up from the floor -- a tap's lever (4 cm to the side of its spout), a hob's knobs,
  // the shower's valve
  function hnControls(n, W, D, H) {
    var cm = FLOOR_PX / 100, y1 = D / 2 - 1 * cm;
    switch (n.kind) {
      case "i_vanity": return (W > 80 * cm ? [-0.23, 0.23] : [0]).map(function (k) { return [k * W - 4 * cm, -D / 2 + 5 * cm, H + 6 * cm]; });
      case "i_sink": return [[-4 * cm, -D / 2 + 3 * cm, H + 6 * cm]];
      case "i_kitchensink": return [[-4 * cm, -D / 2 + D * 0.1, H + 6 * cm]];
      case "i_utilitysink": return [[-4 * cm, -D / 2 + 1.5 * cm, H + 6 * cm]];
      case "i_bathtub": return [[7 * cm, -D / 2 + Math.min(7 * cm, W * 0.16) / 2, H + 4 * cm]];
      case "i_cornertub": return [[-W / 2 + 10 * W / 75, -D / 2 + 10 * D / 75, H + 5 * cm]];
      case "i_shower": return [[0, -D / 2 + 4 * cm, 1.05 * FLOOR_PX]];
      case "i_stove": return [0, 1, 2, 3].map(function (k) { return [-W * 0.3 + k * W * 0.2, y1 + 3 * cm, H - 8 * cm]; });
      case "i_oven": return [[W * 0.3, y1 + 2 * cm, H * 0.95]];
    }
    return null;
  }
  function hnTouchAt(a) {
    var P = FLOOR_PX, n = a.n, F = typeof xrayFloors === "function" ? xrayFloors() : null, p = F ? F.at(n) : [n.x, n.y, 0];
    var hit = a.R ? hnV(a.R.o, a.R.d, a.t) : [p[0], p[1], p[2] + P];
    var ang = (n.turn || 0) * Math.PI / 180, bx = Math.sin(ang), by = -Math.cos(ang), high = (typeof pieceHigh === "function" ? pieceHigh(n) : 0.9) * P;
    var ctl = a.front < 0 && V3_HIGH[n.kind] !== undefined ? hnControls(n, Math.max(2, n.w), Math.max(2, n.h), Math.max(1, high)) : null;
    if (ctl && ctl.length) {
      // (the one nearest where you look: the left basin's tap, or the right's)
      var tc = Math.cos(ang), ts = Math.sin(ang), best = null, bd = Infinity;
      ctl.forEach(function (q) {
        var w = [p[0] + q[0] * tc - q[1] * ts, p[1] + q[0] * ts + q[1] * tc, p[2] + q[2]], d = hnLen(hnSub(w, hit));
        if (d < bd) { bd = d; best = w; }
      });
      return best;
    }
    if (USE_WATER[n.kind] && a.front < 0) {
      var back = (n.h || 40) * (n.kind === "i_shower" ? 0.36 : 0.3);
      return [p[0] + bx * back, p[1] + by * back, p[2] + (n.kind === "i_shower" ? 1.15 * P : high + 0.12 * P)];
    }
    if ((n.kind === "i_stove" || n.kind === "i_oven") && a.front < 0) {
      var front = (n.h || 40) * 0.5;
      return [p[0] - bx * front, p[1] - by * front, p[2] + high - 0.08 * P];
    }
    if (WALK_DOORS[n.kind]) { return [hit[0], hit[1], p[2] + 1.0 * P]; }
    return hit;
  }
  function hnGesture(a) {
    var n = a.n, U = typeof useState === "function" ? useState() : {};
    if (WALK_DOORS[n.kind]) { return "push"; }
    if (a.front >= 0) { return "pull"; }
    if (n.kind === "i_outlet") { return U.on && U.on[n.id] && !HN.hold ? "unplug" : "plug"; }
    if (n.kind === "i_lightswitch" || n.kind === "i_breaker" || n.kind === "i_sconce") { return "flip"; }
    if (USE_WATER[n.kind] || USE_HEAT[n.kind] || n.kind === "i_thermostat") { return "twist"; }
    var kind = a.kind;
    if (kind === "seat" || kind === "bed") { return null; }
    if (kind === "open") { return "pull"; }
    if (USE3D_PLUGS[n.kind] && !hnPlugged(n)) { return "grab"; }
    return "press";
  }
  // The hand's pose: each finger's curl (0 straight .. 1 in a fist), the thumb's, the palm's way.
  var HN_POSE = {
    flip: { curl: [0.05, 0.85, 0.9, 0.9], thumb: 0.7 },
    press: { curl: [0.05, 0.85, 0.9, 0.9], thumb: 0.7 },
    twist: { curl: [0.45, 0.6, 0.75, 0.8], thumb: 0.45 },
    pull: { curl: [0.72, 0.75, 0.78, 0.8], thumb: 0.55 },
    grab: { curl: [0.7, 0.75, 0.8, 0.82], thumb: 0.6 },
    plug: { curl: [0.6, 0.7, 0.75, 0.8], thumb: 0.5 },
    unplug: { curl: [0.6, 0.7, 0.75, 0.8], thumb: 0.5 },
    push: { curl: [0.08, 0.08, 0.1, 0.12], thumb: 0.2 },
    rest: { curl: [0.35, 0.4, 0.45, 0.5], thumb: 0.3 }
  };

  // ---- the arm, drawn each picture ------------------------------------------------------------------
  function hnTube(faces, a, b, r0, r1, how, sides) {
    var d = hnNorm(hnSub(b, a)), up = Math.abs(d[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1], u = hnNorm(hnCross(d, up)), v = hnCross(d, u), n = sides || 8;
    for (var i = 0; i < n; i++) {
      var q0 = i / n * Math.PI * 2, q1 = (i + 1) / n * Math.PI * 2, c0 = Math.cos(q0), s0 = Math.sin(q0), c1 = Math.cos(q1), s1 = Math.sin(q1);
      var o0 = [u[0] * c0 + v[0] * s0, u[1] * c0 + v[1] * s0, u[2] * c0 + v[2] * s0], o1 = [u[0] * c1 + v[0] * s1, u[1] * c1 + v[1] * s1, u[2] * c1 + v[2] * s1];
      faces.push({ pts: [hnV(a, o0, r0), hnV(a, o1, r0), hnV(b, o1, r1), hnV(b, o0, r1)], n: hnNorm([o0[0] + o1[0], o0[1] + o1[1], o0[2] + o1[2]]), how: how });
    }
    var cap = [];
    for (var k = 0; k < n; k++) { var q = k / n * Math.PI * 2; cap.push(hnV(b, [u[0] * Math.cos(q) + v[0] * Math.sin(q), u[1] * Math.cos(q) + v[1] * Math.sin(q), u[2] * Math.cos(q) + v[2] * Math.sin(q)], r1)); }
    faces.push({ pts: cap, n: d, how: how });
  }
  // An oval tube from a to b, rx across u and ry across v at each end, closed at both if asked.
  function hnOval(faces, a, b, u, v, rx0, ry0, rx1, ry1, how, sides, ends) {
    var n = sides || 10, d = hnNorm(hnSub(b, a)), A = [], Bq = [];
    for (var i = 0; i < n; i++) {
      var q = i / n * Math.PI * 2, c = Math.cos(q), s = Math.sin(q);
      A.push([a[0] + u[0] * c * rx0 + v[0] * s * ry0, a[1] + u[1] * c * rx0 + v[1] * s * ry0, a[2] + u[2] * c * rx0 + v[2] * s * ry0]);
      Bq.push([b[0] + u[0] * c * rx1 + v[0] * s * ry1, b[1] + u[1] * c * rx1 + v[1] * s * ry1, b[2] + u[2] * c * rx1 + v[2] * s * ry1]);
    }
    for (var k = 0; k < n; k++) {
      var j = (k + 1) % n, m = (k + 0.5) / n * Math.PI * 2, cm = Math.cos(m) / (rx0 + rx1), sm = Math.sin(m) / (ry0 + ry1);
      faces.push({ pts: [A[k], A[j], Bq[j], Bq[k]], n: hnNorm([u[0] * cm + v[0] * sm, u[1] * cm + v[1] * sm, u[2] * cm + v[2] * sm]), how: how });
    }
    if (ends) { faces.push({ pts: A.slice().reverse(), n: [-d[0], -d[1], -d[2]], how: how }); faces.push({ pts: Bq, n: d, how: how }); }
  }
  function hnBox(faces, c, X, Y, Z, hx, hy, hz, how) {
    var s = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(function (q) {
      return [c[0] + X[0] * q[0] * hx + Y[0] * q[1] * hy + Z[0] * q[2] * hz, c[1] + X[1] * q[0] * hx + Y[1] * q[1] * hy + Z[1] * q[2] * hz, c[2] + X[2] * q[0] * hx + Y[2] * q[1] * hy + Z[2] * q[2] * hz];
    });
    [[0, 1, 2, 3, Z, -1], [4, 7, 6, 5, Z, 1], [0, 4, 5, 1, Y, -1], [1, 5, 6, 2, X, 1], [2, 6, 7, 3, Y, 1], [3, 7, 4, 0, X, -1]].forEach(function (q) {
      faces.push({ pts: [s[q[0]], s[q[1]], s[q[2]], s[q[3]]], n: [q[4][0] * q[5], q[4][1] * q[5], q[4][2] * q[5]], how: how });
    });
  }
  // Two bones from the shoulder to the wrist, the elbow down and out.
  function hnElbow(S, W, L1, L2, pole) {
    var d = hnSub(W, S), dist = Math.min(hnLen(d), L1 + L2 - 0.5), dir = hnNorm(d);
    var a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    var side = hnNorm(hnSub(pole, hnV([0, 0, 0], dir, hnDot(pole, dir))));
    return hnV(hnV(S, dir, a), side, h);
  }
  function hnDraw(faces, B, hand, pose, roll, extra) {
    var P = FLOOR_PX, skin = { piece: true, color: HN_SKIN, edge: HN_SKIN, pat: 26 }, sleeve = { piece: true, color: HN_SLEEVE, edge: HN_CUFF, pat: 20 };
    var cuff = { piece: true, color: HN_CUFF, edge: HN_CUFF, pat: 20 };
    var S = hnShoulder(B);
    // the hand's own way round: its fingers toward where it reaches, its palm down (or forward, pushing)
    var fw = hnNorm(hnSub(hand.at, S)), upC = B.u, pn;
    if (hand.palm === "forward") { pn = fw; fw = hnNorm(hnSub(upC, hnV([0, 0, 0], pn, hnDot(upC, pn)))); }
    else { pn = hnNorm(hnV(hnSub([0, 0, 0], upC), fw, hnDot(upC, fw))); }       // (the palm's side: down)
    var sd = hnNorm(hnCross(fw, pn));
    if (roll) { var c = Math.cos(roll), s = Math.sin(roll); var pn2 = hnNorm([pn[0] * c + sd[0] * s, pn[1] * c + sd[1] * s, pn[2] * c + sd[2] * s]); sd = hnNorm(hnCross(fw, pn2)); pn = pn2; }
    var palmC = hnV(hand.at, fw, -0.05 * P), wrist = hnV(palmC, fw, -0.055 * P);
    var elbow = hnElbow(S, wrist, 0.3 * P, 0.27 * P, hnNorm([B.u[0] * -1 + B.r[0] * 0.6, B.u[1] * -1 + B.r[1] * 0.6, B.u[2] * -1 + B.r[2] * 0.6]));
    hnTube(faces, S, elbow, 0.058 * P, 0.05 * P, sleeve, 9);
    var cuffAt = hnMix(elbow, wrist, 0.62);
    hnTube(faces, elbow, cuffAt, 0.05 * P, 0.045 * P, sleeve, 9);
    hnTube(faces, cuffAt, hnMix(elbow, wrist, 0.68), 0.047 * P, 0.047 * P, cuff, 9);
    hnTube(faces, hnMix(elbow, wrist, 0.66), wrist, 0.036 * P, 0.029 * P, skin, 10);
    // the palm: rounded, flatter and wider toward the knuckles; four fingers in three joints each, the thumb in two
    var knuck = hnV(palmC, fw, 0.045 * P);
    hnOval(faces, wrist, hnV(palmC, fw, -0.02 * P), sd, pn, 0.03 * P, 0.022 * P, 0.04 * P, 0.018 * P, skin, 12, true);
    hnOval(faces, hnV(palmC, fw, -0.02 * P), knuck, sd, pn, 0.04 * P, 0.018 * P, 0.042 * P, 0.0135 * P, skin, 12, true);
    var Pz = HN_POSE[pose] || HN_POSE.rest;
    function bend(c) { return hnNorm([fw[0] * Math.cos(c) + pn[0] * Math.sin(c), fw[1] * Math.cos(c) + pn[1] * Math.sin(c), fw[2] * Math.cos(c) + pn[2] * Math.sin(c)]); }
    [[-0.029, 0.073], [-0.0098, 0.08], [0.0098, 0.075], [0.028, 0.06]].forEach(function (f, i) {
      // (each joint curled further in toward the palm than the one before)
      var base = hnV(hnV(knuck, sd, f[0] * P), fw, -0.004 * P), c = Pz.curl[i], len = f[1] * P, r = (i === 3 ? 0.0082 : 0.0094) * P;
      var j1 = hnV(base, bend(c * 0.75), len * 0.45), j2 = hnV(j1, bend(c * 1.65), len * 0.3), tip = hnV(j2, bend(c * 2.25), len * 0.25);
      hnTube(faces, base, j1, r, r * 0.93, skin, 8);
      hnTube(faces, j1, j2, r * 0.93, r * 0.86, skin, 8);
      hnTube(faces, j2, tip, r * 0.86, r * 0.72, skin, 8);
    });
    var tb = hnV(hnV(palmC, sd, -0.034 * P), fw, -0.035 * P), tc = Pz.thumb;
    var td = hnNorm([fw[0] * 0.55 - sd[0] * (0.75 - tc * 0.6) + pn[0] * tc, fw[1] * 0.55 - sd[1] * (0.75 - tc * 0.6) + pn[1] * tc, fw[2] * 0.55 - sd[2] * (0.75 - tc * 0.6) + pn[2] * tc]);
    var td2 = hnNorm(hnV(td, fw, 0.5 + tc * 0.3)), tm = hnV(tb, td, 0.04 * P);
    hnTube(faces, tb, tm, 0.0125 * P, 0.0105 * P, skin, 8);
    hnTube(faces, tm, hnV(tm, td2, 0.03 * P), 0.0105 * P, 0.0085 * P, skin, 8);
    // what it carries: a plug, its cord
    if (extra && extra.plug) {
      var pc = hnV(hnV(palmC, fw, 0.045 * P), pn, -0.025 * P);
      hnBox(faces, pc, fw, sd, pn, 0.02 * P, 0.016 * P, 0.012 * P, { piece: true, color: HN_PLUG, edge: "#9a9890" });
      [-0.006, 0.006].forEach(function (o) { hnTube(faces, hnV(hnV(pc, fw, 0.02 * P), sd, o * P), hnV(hnV(pc, fw, 0.035 * P), sd, o * P), 0.0018 * P, 0.0018 * P, { piece: true, color: "#c9a44a", edge: "#9a7a2a", pat: 35 }, 4); });
      if (extra.from) {
        var cordHow = { piece: true, color: "#e9e8e4", edge: "#b3b1aa" }, start = hnV(pc, fw, -0.02 * P), end = extra.from, steps = 10, last = start;
        for (var i = 1; i <= steps; i++) {
          var k = i / steps, mid = hnMix(start, end, k), sag = Math.sin(k * Math.PI) * Math.min(0.35 * P, hnLen(hnSub(end, start)) * 0.2);
          mid = [mid[0], mid[1], mid[2] - sag];
          hnTube(faces, last, mid, 0.004 * P, 0.004 * P, cordHow, 5);
          last = mid;
        }
      }
    }
  }
  // Each picture, walking: the hand where it has got to.
  function hnFaces(model) {
    if (!hnOn()) { return; }
    var A = HN.anim, hold = HN.hold ? nodeById(HN.hold) : null;
    if (!A && !hold) { return; }
    var B = hnBasis(), P = FLOOR_PX, rest = hnAt(B, 0.17, -0.42, 0.32), holdAt = hnAt(B, 0.16, -0.24, 0.42);
    var faces = model.passing ? model.passing.faces : (model.passing = { faces: [], stand: [] }).faces;
    var from = hold ? hnPlugFrom(hold) : null;
    if (!A) { hnDraw(faces, B, { at: holdAt }, "grab", 0, { plug: true, from: from }); return; }
    var now = performance.now(), k = Math.min(1, (now - A.t0) / HN_MS), T = A.at;
    HN.dip = (A.dip || 0) * hnEnvelope(k);
    // (no further than an arm reaches: past that, as far as it goes)
    var S = hnShoulder(B), toT = hnSub(T, S), far = 0.77 * P;
    if (hnLen(toT) > far) { T = hnV(S, hnNorm(toT), far); }
    var start = hold ? holdAt : rest, near = hnV(T, hnNorm(hnSub(T, S)), -0.07 * P), at, roll = 0, g = A.g;
    if (k < HN_TOUCH * 0.75) { at = hnMix(start, near, hnEase(k / (HN_TOUCH * 0.75))); }
    else if (k < HN_TOUCH) { at = hnMix(near, T, hnEase((k - HN_TOUCH * 0.75) / (HN_TOUCH * 0.25))); }
    else if (k < 0.72) {
      // the motion of it: flicked, turned, pulled, pushed in
      var q = hnEase((k - HN_TOUCH) / (0.72 - HN_TOUCH)), dir = hnNorm(hnSub(T, S));
      at = T;
      if (g === "flip") { at = hnV(T, B.u, (A.up ? 1 : -1) * 0.025 * P * q); }
      else if (g === "twist") { roll = 1.1 * q; }
      else if (g === "pull" || g === "unplug") { at = hnV(T, dir, -0.13 * P * q); }
      else if (g === "push") { at = hnV(T, dir, 0.06 * P * q); }
      else if (g === "press" || g === "plug") { at = hnV(T, dir, 0.015 * P * Math.sin(q * Math.PI)); }
      else if (g === "grab") { at = hnV(T, B.u, 0.04 * P * q); }
    } else {
      var back = hnEase((k - 0.72) / 0.28), last = g === "pull" || g === "unplug" ? hnV(T, hnNorm(hnSub(T, S)), -0.13 * P) : T;
      roll = g === "twist" ? 1.1 * (1 - back) : 0;
      at = hnMix(last, HN.hold ? holdAt : rest, back);
    }
    var carrying = (g === "plug" && k < HN_TOUCH) || (g === "unplug" && k > HN_TOUCH && k < 0.9) || (g === "grab" && k > HN_TOUCH) || (!!HN.hold && g !== "plug");
    hnDraw(faces, B, { at: at, palm: g === "push" ? "forward" : null }, g, roll, carrying ? { plug: true, from: from || (A.plugFrom || null) } : null);
    HN.dip = 0;
  }
  function hnPlugFrom(dev) {
    var F = typeof xrayFloors === "function" ? xrayFloors() : null, p = F ? F.at(dev) : [dev.x, dev.y, 0];
    return [p[0], p[1], p[2] + 0.25 * FLOOR_PX];
  }
  if (typeof v3Build === "function") {
    var v3BuildHn = v3Build;
    v3Build = function () {
      var model = v3BuildHn.apply(this, arguments);
      try { if (model && V3 && V3.mode === "walk") { hnStep(); hnFaces(model); } } catch (e) { /* no hands this picture */ }
      return model;
    };
  }
  // the motion's own clock: the thing done when the hand gets there
  // Out of an arm's reach: a lean in toward it, and back
  function hnEnvelope(k) { return k >= 1 ? 0 : k < 0.35 ? hnEase(k / 0.35) : k < 0.75 ? 1 : 1 - hnEase((k - 0.75) / 0.25); }
  function hnLean(A, k) {
    if (!A.lean || !V3.me) { return; }
    var env = hnEnvelope(k);
    V3.me.x = A.me0[0] + A.lean[0] * env; V3.me.y = A.me0[1] + A.lean[1] * env;
  }
  function hnStep() {
    var A = HN.anim;
    if (!A) { return; }
    var k = (performance.now() - A.t0) / HN_MS;
    hnLean(A, Math.min(1, k));
    if (k >= HN_TOUCH && !A.done) { A.done = true; try { A.act(); } catch (e) { /* done as it could be */ } }
    if (k >= 1) { HN.anim = null; }
    V3.dirty = true;
  }
  (function hnTick() {
    try { if (HN.anim || HN.hold) { if (!hnOn()) { if (HN.anim && !HN.anim.done) { HN.anim.done = true; HN.anim.act(); } if (HN.anim) { hnLean(HN.anim, 1); } HN.anim = null; } else { V3.dirty = true; } } } catch (e) { HN.anim = null; }
    requestAnimationFrame(hnTick);
  })();

  // ---- plugs that mean something, and what they draw --------------------------------------------------
  // (as the house was set up: what stands by a socket in its room is
  // plugged into it -- till it is taken out, and then where it is put)
  function hnPlugged(dev) {
    var U = typeof useState === "function" ? useState() : null;
    if (!U) { return null; }
    U.plug = U.plug || {};
    var at = null;
    Object.keys(U.plug).forEach(function (id) { if (U.plug[id] === dev.id && U.on[id]) { at = nodeById(+id); } });
    if (at || (U.unplugged && U.unplugged[dev.id])) { return at; }
    var room = useRoomOf(dev), best = null, far = 2.6 * FLOOR_PX;
    hand.nodes.forEach(function (o) {
      if (o.kind !== "i_outlet" || (U.on[o.id] && U.plug[o.id]) || (room && useRoomOf(o) !== room)) { return; }
      var d = Math.hypot(o.x - dev.x, o.y - dev.y);
      if (d < far) { far = d; best = o; }
    });
    if (best) { U.plug[best.id] = dev.id; U.on[best.id] = true; }
    return best;
  }
  function hnCircuit(room) {
    var U = useState(), plan = typeof walkPlan === "function" ? walkPlan() : null, kind = plan && room && typeof wireKindOf === "function" ? wireKindOf(plan, room) : "";
    var amps = HN_TWENTY[kind] ? 20 : 15, watts = 0;
    Object.keys(U.plug || {}).forEach(function (oid) {
      var o = nodeById(+oid), d = U.plug[oid] ? nodeById(U.plug[oid]) : null;
      if (!o || !d || !U.on[oid] || (room && useRoomOf(o) !== room)) { return; }
      if (U.on[d.id] || d.kind === "i_fridge" || d.kind === "i_freezer" || d.kind === "i_winecooler" || d.kind === "i_router" || d.kind === "i_aquarium") { watts += HN_WATTS[d.kind] || 50; }
    });
    return { amps: amps, watts: watts, cap: amps * 120 };
  }
  function hnCheckTrip(room) {
    if (!room) { return; }
    var U = useState(), C = hnCircuit(room);
    if (C.watts <= C.cap) { return; }
    // tripped: the room's sockets dead, its lights out, till the panel's reset
    U.tripped = U.tripped || {};
    U.tripped[room.id] = true;
    U.dark[room.id] = true;
    Object.keys(U.plug || {}).forEach(function (oid) { var o = nodeById(+oid), d = U.plug[oid] ? nodeById(U.plug[oid]) : null; if (o && d && useRoomOf(o) === room) { U.on[d.id] = false; } });
    if (typeof useTone === "function") { useTone([110, 90], 0.25, true); }
    setTimeout(function () { v3Say(say("hn_trip", { w: C.watts, a: C.amps })); }, 350);
  }
  // E on what is used, the way it is done: by the hand, and when it gets there
  if (typeof o3Act === "function") {
    var o3ActHn = o3Act;
    o3Act = function (a) {
      if (!hnOn() || !a || !a.usable || !a.near || !a.n) { return o3ActHn.apply(this, arguments); }
      if (HN.anim) { return true; }                              // (one thing at a time: the hand is busy)
      var g = hnGesture(a), n = a.n, U = useState(), self = this, args = arguments;
      if (!g) { return o3ActHn.apply(this, arguments); }
      var act = function () { o3ActHn.apply(self, args); };
      var room = useRoomOf(n);
      // an outlet, a plug held: that plug into it
      if (n.kind === "i_outlet" && HN.hold) {
        var dev = nodeById(HN.hold);
        act = function () {
          U.plug = U.plug || {};
          var had = U.plug[n.id] ? nodeById(U.plug[n.id]) : null;
          if (had && had !== dev) { U.on[had.id] = false; }
          U.on[n.id] = true; U.plug[n.id] = dev ? dev.id : null;
          if (dev && U.unplugged) { delete U.unplugged[dev.id]; }
          // (out of any other socket it was in)
          Object.keys(U.plug).forEach(function (id) { if (+id !== n.id && dev && U.plug[id] === dev.id) { U.on[id] = false; delete U.plug[id]; } });
          HN.hold = null;
          v3Say(say("us_plugged", { what: dev ? useName(dev) : "" }));
          if (typeof useTone === "function") { useTone([1600], 0.04, true); }
          V3.dirty = true;
        };
        g = "plug";
      } else if (USE3D_PLUGS[n.kind] && !hnPlugged(n) && !(U.tripped && room && U.tripped[room.id])) {
        // not plugged in: its plug picked up -- or put down again
        if (HN.hold === n.id) { act = function () { HN.hold = null; v3Say(say("hn_dropped", { what: useName(n) })); }; g = "grab"; }
        else { act = function () { HN.hold = n.id; U.unplugged = U.unplugged || {}; U.unplugged[n.id] = true; v3Say(say("hn_holding", { what: useName(n) })); }; g = "grab"; }
      } else if (USE3D_PLUGS[n.kind] && U.tripped && room && U.tripped[room.id]) {
        act = function () { v3Say(say("hn_dead", { what: useName(n) })); };
        g = "press";
      } else if (n.kind === "i_breaker" && U.tripped && Object.keys(U.tripped).length) {
        // the panel: the tripped breaker put back
        act = function () {
          Object.keys(U.tripped).forEach(function (id) { U.dark[id] = false; });
          U.tripped = {};
          if (typeof useTone === "function") { useTone([180], 0.06, true); }
          v3Say(TXT.hn_reset);
          V3.dirty = true;
        };
      } else if (USE3D_PLUGS[n.kind] && hnPlugged(n) && !USE_SCREEN[n.kind] && !USE_FAN[n.kind] && !USE_LIGHT[n.kind] && HN_WATTS[n.kind] >= 300) {
        // plugged in, switched on: its watts on the circuit
        act = function () {
          U.on[n.id] = !U.on[n.id];
          v3Say(say(U.on[n.id] ? "hn_on" : "hn_off", { what: useName(n), w: HN_WATTS[n.kind] }));
          if (U.on[n.id]) { hnCheckTrip(useRoomOf(hnPlugged(n))); }
          V3.dirty = true;
        };
      } else if (n.kind === "i_outlet" || (USE3D_PLUGS[n.kind] && (USE_SCREEN[n.kind] || USE_FAN[n.kind]))) {
        var was = n.kind === "i_outlet" && U.on[n.id] && U.plug && U.plug[n.id] ? U.plug[n.id] : null;
        act = function () {
          o3ActHn.apply(self, args);
          // (taken out: not put back by itself)
          if (was && !U.on[n.id]) { U.unplugged = U.unplugged || {}; U.unplugged[was] = true; }
          var o = n.kind === "i_outlet" ? n : hnPlugged(n);
          if (o) { hnCheckTrip(useRoomOf(o)); }
        };
      }
      var at = hnTouchAt(a), B0 = hnBasis(), sh = hnShoulder(B0), flat = [at[0] - sh[0], at[1] - sh[1]], fl = Math.hypot(flat[0], flat[1]) || 1;
      // (low down -- a cupboard's door, a socket by the floor: bent down to it, not leant out over the counter)
      var dz = at[2] - sh[2], low = dz < -0.55 * FLOOR_PX, dip = low ? Math.min(0.6 * FLOOR_PX, -dz - 0.45 * FLOOR_PX) : 0;
      var reachH = Math.sqrt(Math.max(0, 0.66 * 0.66 * FLOOR_PX * FLOOR_PX - (dz + dip) * (dz + dip)));
      var over = Math.min(Math.max(0, fl - reachH), 0.9 * FLOOR_PX), lean = null;
      // (a step as far as the body goes before it meets what is there, then bent over it -- the head
      // over the counter, never nearer the thing than 38 cm: not into the cupboards over it)
      if (over > 1 && typeof v3Blocked === "function") {
        var go = 0;
        for (var st = 2; st <= over; st += 2) { if (v3Blocked(V3.me.x + flat[0] / fl * st, V3.me.y + flat[1] / fl * st)) { break; } go = st; }
        over = Math.max(0, Math.min(over, low ? go : go + 0.72 * FLOOR_PX, fl - 0.38 * FLOOR_PX));
      }
      if (over > 1) { lean = [flat[0] / fl * over, flat[1] / fl * over]; }
      HN.anim = { t0: performance.now(), at: at, g: g, act: act, up: !(U.dark && room && U.dark[room.id]), done: false, lean: lean, dip: dip, me0: [V3.me.x, V3.me.y],
                  plugFrom: g === "unplug" && U.plug && U.plug[n.id] ? hnPlugFrom(nodeById(U.plug[n.id]) || n) : null };
      V3.dirty = true;
      return true;
    };
  }
  // Walking away from the panel's view, a plug still held: dropped where you are.
  if (typeof v3Leave === "function") {
    var v3LeaveHn = v3Leave;
    v3Leave = function () { HN.anim = null; HN.hold = null; return v3LeaveHn.apply(this, arguments); };
  }
